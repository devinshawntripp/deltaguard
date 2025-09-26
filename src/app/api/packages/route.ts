import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  } catch (e) {
    console.error("Failed to load packages", e);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}


