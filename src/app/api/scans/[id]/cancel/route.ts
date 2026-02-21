import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    try {
        // Use raw SQL against scan_jobs (the actual production table) instead of Prisma ORM models
        const rows = await prisma.$queryRaw<{ id: string }[]>`
            SELECT id FROM scan_jobs WHERE id = ${id}::uuid
        `;
        if (!rows || rows.length === 0) {
            return NextResponse.json({ ok: false, error: "Job not found" }, { status: 404 });
        }

        await prisma.$executeRaw`
            UPDATE scan_jobs
            SET status = 'failed',
                error_msg = 'Cancelled by user',
                finished_at = now()
            WHERE id = ${id}::uuid
              AND status IN ('queued', 'running')
        `;

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.error("[cancel] failed", e);
        return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
    }
}
