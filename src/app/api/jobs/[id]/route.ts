import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobs";
import { prisma } from "@/lib/prisma";
import { deleteObject } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
        // Delete progress file
        try {
            const fs = await import("node:fs/promises");
            const dir = process.env.PROGRESS_DIR || "/tmp/deltaguard";
            await fs.unlink(`${dir}/${id}.ndjson`).catch(() => { });
        } catch { }
        // Delete DB row first for snappy response/UI update
        await prisma.$executeRaw`DELETE FROM scan_jobs WHERE id=${id}::uuid`;
        // Notify removal
        try { await prisma.$executeRaw`SELECT pg_notify('job_events', ${JSON.stringify({ id, deleted: true })})`; } catch { }
        // Fire-and-forget S3 deletes so we don't block on network timeouts
        void (async () => {
            try {
                if (job.bucket && job.object_key) {
                    await deleteObject({ bucket: String(job.bucket), key: String(job.object_key) }).catch(() => { });
                }
                if (job.report_bucket && job.report_key) {
                    await deleteObject({ bucket: String(job.report_bucket), key: String(job.report_key) }).catch(() => { });
                }
            } catch { }
        })();
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
}


