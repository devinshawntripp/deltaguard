import { NextRequest, NextResponse } from "next/server";
import { ADMIN_OVERRIDE } from "@/lib/roles";
import { requireRequestActor } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const guard = await requireRequestActor(req, {
    requiredKinds: ["user"],
    requiredRoles: [ADMIN_OVERRIDE],
    feature: "list legacy packages",
  });
  if ("response" in guard) return guard.response;

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

