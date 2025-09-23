import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cancelScanById } from "@/lib/scanner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    try {
        const scan = await prisma.scan.findUnique({ where: { id }, select: { id: true, packageId: true } });
        if (!scan) return NextResponse.json({ ok: false, error: "Scan not found" }, { status: 404 });

        const cancelled = cancelScanById(id);

        await prisma.scan.update({ where: { id }, data: { status: "FAILED", error: "Cancelled by user", finishedAt: new Date() } });
        await prisma.package.update({ where: { id: scan.packageId }, data: { status: "FAILED" } });

        try {
            const fs = await import("node:fs/promises");
            const progressFilePath = `/tmp/deltaguard/${id}.ndjson`;
            await fs.appendFile(progressFilePath, JSON.stringify({ stage: "scan.summary", detail: JSON.stringify({ error: "Cancelled by user" }), ts: new Date().toISOString() }) + "\n");
        } catch { }

        return NextResponse.json({ ok: true, cancelled });
    } catch (e: any) {
        console.error("[cancel] failed", e);
        return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
    }
}


