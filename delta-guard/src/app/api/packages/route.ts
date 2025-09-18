import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { memoryDb } from "@/lib/memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await prisma.package.findMany({
      orderBy: { createdAt: "desc" },
      include: { scans: true },
      take: 100,
    });
    return NextResponse.json(items);
  } catch {
    const items = memoryDb.packages
      .slice(0, 100)
      .map((p) => ({
        ...p,
        scans: memoryDb.scans.filter((s) => s.packageId === p.id),
      }));
    return NextResponse.json(items);
  }
}


