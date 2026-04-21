import { NextRequest, NextResponse } from "next/server";
import { resolveRequestActor, actorHasAnyRole } from "@/lib/authz";
import { ROLE_ORG_OWNER, ROLE_BILLING_ADMIN, ADMIN_OVERRIDE } from "@/lib/roles";
import { getActiveContributors } from "@/lib/contributors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const actor = await resolveRequestActor(req);
  if (!actor) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!actorHasAnyRole(actor, [ROLE_ORG_OWNER, ROLE_BILLING_ADMIN, ADMIN_OVERRIDE])) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const days = parseInt(req.nextUrl.searchParams.get("days") || "90", 10);
  const result = await getActiveContributors(actor.orgId, days);
  return NextResponse.json(result);
}
