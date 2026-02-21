import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EventRow = {
    ts: Date | string;
    stage: string;
    detail: string;
    pct: number | null;
};

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    try {
        const u = new URL(req.url);
        const raw = Number(u.searchParams.get("limit") || "2000");
        const limit = Number.isFinite(raw) ? Math.min(5000, Math.max(100, Math.trunc(raw))) : 2000;
        const totalRows = await prisma.$queryRaw<Array<{ total: bigint | number | string }>>`
            SELECT COUNT(*)::bigint AS total
            FROM scan_events
            WHERE job_id=${id}::uuid
        `;
        const totalRaw = totalRows[0]?.total ?? 0;
        const total = Number(totalRaw);
        // Return a chronological tail, so large scans keep latest/final events visible.
        const rows = await prisma.$queryRaw<EventRow[]>`
            SELECT ts, stage, detail, pct
            FROM (
                SELECT ts, stage, detail, pct
                FROM scan_events
                WHERE job_id=${id}::uuid
                ORDER BY ts DESC
                LIMIT ${limit}
            ) q
            ORDER BY ts ASC
        `;
        const res = NextResponse.json(rows);
        if (Number.isFinite(total)) {
            res.headers.set("x-events-total", String(total));
        }
        return res;
    } catch (e: unknown) {
        return NextResponse.json({ error: String(e instanceof Error ? e.message : e) }, { status: 500 });
    }
}
