import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobs";
import { presignGet } from "@/lib/s3";
import { actorHasAnyRole, forbiddenByRole, JOB_READ_ROLES, resolveRequestActor } from "@/lib/authz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_CBOM_ERROR = "no CBOM in this scan (requires scanner >= 1.18 and --cbom)";

/**
 * Extract the top-level `cbom` section from a scanner report.
 * Reports may be plain JSON or NDJSON (one typed object per line);
 * old reports (< scanner 1.18) have no cbom section at all.
 */
function extractCbom(text: string): unknown | null {
    const trimmed = text.trim();
    if (!trimmed) return null;

    // Plain JSON report: top-level "cbom" key
    try {
        const obj = JSON.parse(trimmed) as Record<string, unknown>;
        if (obj && typeof obj === "object" && !Array.isArray(obj)) {
            return obj.cbom ?? null;
        }
    } catch { /* fall through to NDJSON */ }

    // NDJSON report: look for a line carrying the cbom section
    const firstLine = trimmed.split("\n")[0];
    if (!firstLine.includes('"type"')) return null;
    for (const line of trimmed.split("\n")) {
        if (!line.trim()) continue;
        try {
            const obj = JSON.parse(line) as Record<string, unknown>;
            if (!obj || typeof obj !== "object") continue;
            if (obj.type === "cbom" && obj.data) return obj.data;
            if (obj.cbom) return obj.cbom;
        } catch { /* skip malformed lines */ }
    }
    return null;
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const actor = await resolveRequestActor(req);
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!actorHasAnyRole(actor, JOB_READ_ROLES)) {
        return forbiddenByRole(actor, JOB_READ_ROLES, "view CBOM");
    }

    const { id } = await context.params;
    const job = await getJob(id, actor.orgId);
    if (!job) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (!job.report_bucket || !job.report_key) {
        return NextResponse.json({ error: "report not available" }, { status: 400 });
    }

    const url = await presignGet({ bucket: String(job.report_bucket), key: String(job.report_key) });
    const res = await fetch(url.url, { cache: "no-store" });
    if (!res.ok) {
        return NextResponse.json({ error: "report not available" }, { status: 400 });
    }

    const text = await res.text();
    const cbom = extractCbom(text);
    if (!cbom) {
        return NextResponse.json({ error: NO_CBOM_ERROR }, { status: 404 });
    }
    return NextResponse.json(cbom);
}
