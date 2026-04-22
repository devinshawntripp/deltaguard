import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobs";
import { prisma } from "@/lib/prisma";
import { deleteObject } from "@/lib/s3";
import { actorHasAnyRole, forbiddenByRole, JOB_READ_ROLES, JOB_WRITE_ROLES, resolveRequestActor } from "@/lib/authz";
import { audit, getClientIp } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function deleteS3IfPresent(bucket: string | null | undefined, key: string | null | undefined) {
    if (!bucket || !key) return;
    try {
        await deleteObject({ bucket: String(bucket), key: String(key) });
    } catch (e: any) {
        const code = String(e?.name || e?.Code || "");
        const status = Number(e?.$metadata?.httpStatusCode || 0);
        if (code === "NoSuchKey" || status === 404) return;
        throw e;
    }
}

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
    const req = _req as NextRequest;
    const actor = await resolveRequestActor(req);
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!actorHasAnyRole(actor, JOB_READ_ROLES)) {
        return forbiddenByRole(actor, JOB_READ_ROLES, "view job");
    }

    const { id } = await context.params;
    const job = await getJob(id, actor.orgId);
    if (!job) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(job);
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const actor = await resolveRequestActor(_req);
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!actorHasAnyRole(actor, JOB_WRITE_ROLES)) {
        return forbiddenByRole(actor, JOB_WRITE_ROLES, "delete job");
    }

    const { id } = await context.params;
    const rows = await prisma.$queryRaw<any[]>`SELECT * FROM scan_jobs WHERE id=${id}::uuid AND org_id=${actor.orgId}::uuid`;
    const job = rows[0];
    if (!job) return NextResponse.json({ ok: true });
    try {
        await prisma.$executeRaw`UPDATE scan_jobs SET status='deleting', progress_msg='deleting artifacts' WHERE id=${id}::uuid`;

        // Remove upload/report objects first so retries are possible on failure.
        await deleteS3IfPresent(job.bucket, job.object_key);
        await deleteS3IfPresent(job.report_bucket, job.report_key);
        await deleteS3IfPresent(job.report_bucket, `reports/${id}.files.json`);
        await deleteS3IfPresent(job.report_bucket, `reports/${id}.tree.json`);

        // Delete progress file
        try {
            const fs = await import("node:fs/promises");
            const dir = process.env.PROGRESS_DIR || "/tmp/deltaguard";
            await fs.unlink(`${dir}/${id}.ndjson`).catch(() => { });
        } catch { }

        // Remove job row. Child tables are ON DELETE CASCADE.
        await prisma.$transaction([
            prisma.$executeRaw`DELETE FROM scan_jobs WHERE id=${id}::uuid AND org_id=${actor.orgId}::uuid`,
        ]);

        // Notify removal
        try { await prisma.$executeRaw`SELECT pg_notify('job_events', ${JSON.stringify({ id, deleted: true })})`; } catch { }
        audit({ actor, action: "scan.deleted", targetType: "scan_job", targetId: id, ip: getClientIp(_req) });
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
}
