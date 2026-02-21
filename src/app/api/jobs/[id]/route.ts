import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobs";
import { prisma } from "@/lib/prisma";
import { deleteObject } from "@/lib/s3";

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
    const { id } = await context.params;
    const job = await getJob(id);
    if (!job) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(job);
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const rows = await prisma.$queryRaw<any[]>`SELECT * FROM scan_jobs WHERE id=${id}::uuid`;
    const job = rows[0];
    if (!job) return NextResponse.json({ ok: true });
    try {
        // Remove upload/report objects first so retries are possible on failure.
        await deleteS3IfPresent(job.bucket, job.object_key);
        await deleteS3IfPresent(job.report_bucket, job.report_key);

        // Delete progress file
        try {
            const fs = await import("node:fs/promises");
            const dir = process.env.PROGRESS_DIR || "/tmp/deltaguard";
            await fs.unlink(`${dir}/${id}.ndjson`).catch(() => { });
        } catch { }

        // Remove events and job row.
        await prisma.$transaction([
            prisma.$executeRaw`DELETE FROM scan_events WHERE job_id=${id}::uuid`,
            prisma.$executeRaw`DELETE FROM scan_jobs WHERE id=${id}::uuid`,
        ]);

        // Notify removal
        try { await prisma.$executeRaw`SELECT pg_notify('job_events', ${JSON.stringify({ id, deleted: true })})`; } catch { }
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
}

