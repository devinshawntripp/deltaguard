import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { createOrgInvite, listOrgInvites } from "@/lib/orgs";
import { ADMIN_OVERRIDE, ROLE_ORG_OWNER, ROLE_VIEWER } from "@/lib/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORG_INVITE_ROLES = [ROLE_ORG_OWNER, ADMIN_OVERRIDE];

export async function GET(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredKinds: ["user"],
        requiredRoles: ORG_INVITE_ROLES,
        feature: "view org invites",
    });
    if ("response" in guard) return guard.response;
    const actor = guard.actor;
    const items = await listOrgInvites(actor.orgId);
    return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredKinds: ["user"],
        requiredRoles: ORG_INVITE_ROLES,
        feature: "create org invite",
    });
    if ("response" in guard) return guard.response;
    const actor = guard.actor;

    if (!actor.userId) {
        return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
    }

    try {
        const body = (await req.json()) as {
            email?: string;
            roles_mask?: string | number | bigint;
            expires_hours?: number;
        };
        const email = String(body?.email || "").trim();
        if (!email) {
            return NextResponse.json({ error: "email is required" }, { status: 400 });
        }

        // Org owners can invite/manage members in-org, but only admin_override can assign role masks.
        const rolesMask = actor.rolesMask === ADMIN_OVERRIDE ? body?.roles_mask ?? ROLE_VIEWER.toString() : ROLE_VIEWER.toString();
        const created = await createOrgInvite({
            orgId: actor.orgId,
            email,
            rolesMask,
            invitedByUserId: actor.userId,
            expiresHours: body?.expires_hours,
        });

        const appBase = (process.env.APP_BASE_URL || req.nextUrl.origin).replace(/\/$/, "");
        return NextResponse.json({
            ok: true,
            invite: created.invite,
            token: created.token,
            invite_url: `${appBase}/register?invite=${encodeURIComponent(created.token)}`,
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
