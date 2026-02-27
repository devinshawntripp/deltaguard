import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { revokeOrgInvite } from "@/lib/orgs";
import { ADMIN_OVERRIDE, ROLE_ORG_OWNER } from "@/lib/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORG_INVITE_ROLES = [ROLE_ORG_OWNER, ADMIN_OVERRIDE];

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const guard = await requireRequestActor(req, {
        requiredKinds: ["user"],
        requiredRoles: ORG_INVITE_ROLES,
        feature: "revoke org invite",
    });
    if ("response" in guard) return guard.response;
    const actor = guard.actor;

    const { id } = await context.params;
    const ok = await revokeOrgInvite(actor.orgId, id);
    return NextResponse.json({ ok });
}
