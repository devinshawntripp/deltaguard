import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { revokeOrgApiKey } from "@/lib/apiKeys";
import { ADMIN_OVERRIDE, ROLE_API_KEY_ADMIN, ROLE_ORG_OWNER } from "@/lib/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_KEY_ROLES = [ROLE_API_KEY_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE];

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const guard = await requireRequestActor(req, {
        requiredRoles: API_KEY_ROLES,
        requiredKinds: ["user"],
        feature: "revoke API key",
    });
    if ("response" in guard) return guard.response;
    const actor = guard.actor;

    const { id } = await context.params;
    const ok = await revokeOrgApiKey(actor.orgId, id);
    return NextResponse.json({ ok });
}
