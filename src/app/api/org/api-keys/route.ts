import { NextRequest, NextResponse } from "next/server";
import { forbiddenByRole, requireRequestActor } from "@/lib/authz";
import { createOrgApiKey, listOrgApiKeys } from "@/lib/apiKeys";
import { ADMIN_OVERRIDE, parseRoleMask, ROLE_API_KEY_ADMIN, ROLE_ORG_OWNER } from "@/lib/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_KEY_ROLES = [ROLE_API_KEY_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE];

export async function GET(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredRoles: API_KEY_ROLES,
        requiredKinds: ["user"],
        feature: "list API keys",
    });
    if ("response" in guard) return guard.response;
    const actor = guard.actor;

    const items = await listOrgApiKeys(actor.orgId);
    return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredRoles: API_KEY_ROLES,
        requiredKinds: ["user"],
        feature: "create API key",
    });
    if ("response" in guard) return guard.response;
    const actor = guard.actor;

    try {
        const body = await req.json();
        const name = String(body?.name || "").trim();
        if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

        const rolesMask = parseRoleMask(body?.roles_mask ?? "1");
        if (rolesMask < BigInt(0)) {
            return NextResponse.json({ error: "roles_mask must be non-negative" }, { status: 400 });
        }
        if (rolesMask === ADMIN_OVERRIDE && actor.rolesMask !== ADMIN_OVERRIDE) {
            return forbiddenByRole(actor, [ADMIN_OVERRIDE], "create API key with admin override");
        }
        if (actor.rolesMask !== ADMIN_OVERRIDE && (rolesMask & actor.rolesMask) !== rolesMask) {
            return NextResponse.json(
                {
                    error: "cannot assign API key roles outside your own role mask",
                    code: "forbidden_role_assignment",
                    actor_roles_mask: actor.rolesMask.toString(),
                    requested_roles_mask: rolesMask.toString(),
                },
                { status: 403 },
            );
        }

        const expiresAt = body?.expires_at ? String(body.expires_at) : null;
        const created = await createOrgApiKey({
            orgId: actor.orgId,
            name,
            rolesMask: rolesMask.toString(),
            createdByUserId: actor.userId,
            expiresAt,
        });

        return NextResponse.json({
            id: created.id,
            prefix: created.prefix,
            token: created.token,
            warning: "Store this API key now. It will not be shown again.",
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
