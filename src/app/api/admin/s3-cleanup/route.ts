import { NextRequest, NextResponse } from "next/server";
import { resolveRequestActor } from "@/lib/authz";
import { ADMIN_OVERRIDE } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { listObjects, deleteObject } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORPHAN_AGE_MS = 60 * 60 * 1000; // 1 hour — objects younger than this are kept (upload may be in progress)
const VULNDB_KEEP = 2; // keep latest N vulndb snapshots

function isAuthorized(req: NextRequest, actor: { rolesMask: bigint } | null): boolean {
    // Admin users can call directly
    if (actor && actor.rolesMask === ADMIN_OVERRIDE) return true;
    // CronJob auth via shared secret
    const secret = process.env.CLEANUP_SECRET;
    if (secret) {
        const header = req.headers.get("x-cleanup-secret") || "";
        if (header === secret) return true;
    }
    return false;
}

export async function POST(req: NextRequest) {
    const actor = await resolveRequestActor(req).catch(() => null);
    if (!isAuthorized(req, actor)) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const uploadsBucket = (process.env.UPLOADS_BUCKET || process.env.MINIO_BUCKET || "deltaguard") as string;
    const reportsBucket = (process.env.REPORTS_BUCKET || "reports") as string;
    const vulndbBucket = process.env.VULNDB_BUCKET || "vulndb";
    const now = Date.now();
    const deleted: Array<{ bucket: string; key: string; size: number; reason: string }> = [];
    const errors: string[] = [];

    // --- 1. Clean orphaned uploads ---
    try {
        const s3Objects = await listObjects({ bucket: uploadsBucket });
        const dbRows = await prisma.$queryRaw<Array<{ object_key: string }>>`
            SELECT object_key FROM scan_jobs WHERE object_key IS NOT NULL
        `;
        const referencedKeys = new Set(dbRows.map((r) => r.object_key));

        for (const obj of s3Objects) {
            if (referencedKeys.has(obj.key)) continue;
            const ageMs = now - obj.lastModified.getTime();
            if (ageMs < ORPHAN_AGE_MS) continue; // too new, might be mid-upload
            try {
                await deleteObject({ bucket: uploadsBucket, key: obj.key });
                deleted.push({ bucket: uploadsBucket, key: obj.key, size: obj.size, reason: "orphan_upload" });
            } catch (e: any) {
                errors.push(`delete ${uploadsBucket}/${obj.key}: ${e.message}`);
            }
        }
    } catch (e: any) {
        errors.push(`list uploads: ${e.message}`);
    }

    // --- 2. Clean orphaned reports ---
    try {
        const s3Objects = await listObjects({ bucket: reportsBucket });
        const dbRows = await prisma.$queryRaw<Array<{ report_key: string }>>`
            SELECT report_key FROM scan_jobs WHERE report_key IS NOT NULL
        `;
        const referencedKeys = new Set(dbRows.map((r) => r.report_key));

        // Also keep reports/{id}.files.json and reports/{id}.tree.json for active jobs
        const jobIds = await prisma.$queryRaw<Array<{ id: string }>>`
            SELECT id::text FROM scan_jobs
        `;
        const jobIdSet = new Set(jobIds.map((r) => r.id));

        for (const obj of s3Objects) {
            if (referencedKeys.has(obj.key)) continue;
            // Check if this is a .files.json or .tree.json for an active job
            const match = obj.key.match(/^reports\/([a-f0-9-]+)\.(files|tree)\.json$/);
            if (match && jobIdSet.has(match[1])) continue;
            const ageMs = now - obj.lastModified.getTime();
            if (ageMs < ORPHAN_AGE_MS) continue;
            try {
                await deleteObject({ bucket: reportsBucket, key: obj.key });
                deleted.push({ bucket: reportsBucket, key: obj.key, size: obj.size, reason: "orphan_report" });
            } catch (e: any) {
                errors.push(`delete ${reportsBucket}/${obj.key}: ${e.message}`);
            }
        }
    } catch (e: any) {
        errors.push(`list reports: ${e.message}`);
    }

    // --- 3. Rotate vulndb snapshots (keep latest N) ---
    try {
        const snapshots = await listObjects({ bucket: vulndbBucket, prefix: "scanrook-db-" });
        const sorted = snapshots
            .filter((o) => o.key.match(/scanrook-db-\d{4}-\d{2}-\d{2}\.sqlite/))
            .sort((a, b) => b.key.localeCompare(a.key)); // newest first by filename

        const toDelete = sorted.slice(VULNDB_KEEP);
        for (const obj of toDelete) {
            try {
                await deleteObject({ bucket: vulndbBucket, key: obj.key });
                deleted.push({ bucket: vulndbBucket, key: obj.key, size: obj.size, reason: "vulndb_rotation" });
            } catch (e: any) {
                errors.push(`delete ${vulndbBucket}/${obj.key}: ${e.message}`);
            }
        }
    } catch (e: any) {
        errors.push(`list vulndb: ${e.message}`);
    }

    const totalFreed = deleted.reduce((sum, d) => sum + d.size, 0);
    const summary = {
        ok: true,
        deleted_count: deleted.length,
        freed_bytes: totalFreed,
        freed_human: `${(totalFreed / (1024 * 1024)).toFixed(1)} MiB`,
        deleted,
        errors: errors.length > 0 ? errors : undefined,
    };

    console.log(`[s3-cleanup] Deleted ${deleted.length} objects, freed ${summary.freed_human}${errors.length > 0 ? `, ${errors.length} errors` : ""}`);
    return NextResponse.json(summary);
}
