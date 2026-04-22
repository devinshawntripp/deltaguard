import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { createOrgInvite, listOrgInvites } from "@/lib/orgs";
import { ADMIN_OVERRIDE, ROLE_ORG_OWNER, ROLE_VIEWER } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { audit, getClientIp } from "@/lib/audit";

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

        // Seat enforcement: check if the org has room for another member
        const seatCheck = await prisma.$queryRaw<any[]>`
          SELECT
            o.plan_seats as max_seats,
            (SELECT COUNT(*) FROM org_memberships WHERE org_id = ${actor.orgId}::uuid AND status = 'active') as current_members,
            (SELECT COUNT(*) FROM org_invites WHERE org_id = ${actor.orgId}::uuid AND status = 'pending') as pending_invites
          FROM orgs o
          WHERE o.id = ${actor.orgId}::uuid
        `;
        if (seatCheck[0]) {
            const { max_seats, current_members, pending_invites } = seatCheck[0];
            const totalCommitted = Number(current_members) + Number(pending_invites);
            if (totalCommitted >= Number(max_seats)) {
                return NextResponse.json(
                    { error: `Your plan includes ${max_seats} seat${Number(max_seats) === 1 ? "" : "s"}. You currently have ${current_members} member${Number(current_members) === 1 ? "" : "s"} and ${pending_invites} pending invite${Number(pending_invites) === 1 ? "" : "s"}. Upgrade your plan to add more.` },
                    { status: 402 },
                );
            }
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

        audit({ actor, action: "org.member_invited", targetType: "org_invite", targetId: created.invite?.id, detail: `Invited ${email}`, ip: getClientIp(req) });
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
