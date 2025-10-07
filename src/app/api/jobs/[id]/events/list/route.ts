import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    try {
        const rows = await prisma.$queryRaw<any[]>`SELECT ts, stage, detail, pct FROM scan_events WHERE job_id=${id}::uuid ORDER BY ts ASC LIMIT 1000`;
        return NextResponse.json(rows);
    } catch (e: any) {
        return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
    }
}


