import { NextRequest, NextResponse } from "next/server";
import { ADMIN_OVERRIDE } from "@/lib/roles";
import { requireRequestActor } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireRequestActor(req, {
    requiredKinds: ["user"],
    requiredRoles: [ADMIN_OVERRIDE],
    feature: "view legacy package",
  });
  if ("response" in guard) return guard.response;

  const { id } = await context.params;
  try {
    const item = await prisma.package.findUnique({ where: { id }, include: { scans: { orderBy: { createdAt: "desc" } } } });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (e) {
    console.error("Failed to load package", e);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

