import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { memoryDb } from "@/lib/memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  try {
    const item = await prisma.package.findUnique({ where: { id: params.id }, include: { scans: true } });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch {
    const p = memoryDb.packages.find((x) => x.id === params.id);
    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const scans = memoryDb.scans.filter((s) => s.packageId === p.id);
    return NextResponse.json({ ...p, scans });
  }
}


