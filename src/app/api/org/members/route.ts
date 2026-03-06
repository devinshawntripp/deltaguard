import { NextRequest, NextResponse } from "next/server";
import {
  requireRequestActor,
} from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_OVERRIDE,
  hasRole,
  parseRoleMask,
  ROLE_ORG_OWNER,
} from "@/lib/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORG_MANAGER_ROLES = [ROLE_ORG_OWNER, ADMIN_OVERRIDE];

type OrgSummary = {
  id: string;
  name: string;
  slug: string;
};

type OrgMember = {
  user_id: string;
  email: string;
  name: string | null;
  roles_mask: string;
  status: string;
  created_at: string;
};

function isOwnerLike(mask: bigint): boolean {
  return mask === ADMIN_OVERRIDE || hasRole(mask, ROLE_ORG_OWNER);
}

export async function GET(req: NextRequest) {
  const guard = await requireRequestActor(req, {
    requiredRoles: ORG_MANAGER_ROLES,
    requiredKinds: ["user"],
    feature: "view org members",
  });
  if ("response" in guard) return guard.response;
  const actor = guard.actor;

  const orgRows = await prisma.$queryRaw<OrgSummary[]>`
SELECT id::text AS id, name, slug
FROM orgs
WHERE id=${actor.orgId}::uuid
LIMIT 1
  `;
  const org = orgRows[0] || null;
  if (!org) return NextResponse.json({ error: "org not found" }, { status: 404 });

  const members = await prisma.$queryRaw<OrgMember[]>`
SELECT
  m.user_id::text AS user_id,
  u.email,
  u.name,
  m.roles_mask::text AS roles_mask,
  m.status,
  m.created_at::text AS created_at
FROM org_memberships m
JOIN users u ON u.id = m.user_id
WHERE m.org_id=${actor.orgId}::uuid
ORDER BY m.created_at ASC
  `;

  return NextResponse.json({
    org,
    members,
    permissions: {
      can_edit_roles: actor.rolesMask === ADMIN_OVERRIDE || hasRole(actor.rolesMask, ROLE_ORG_OWNER),
      can_manage_members: actor.rolesMask === ADMIN_OVERRIDE || hasRole(actor.rolesMask, ROLE_ORG_OWNER),
      can_invite: actor.rolesMask === ADMIN_OVERRIDE || hasRole(actor.rolesMask, ROLE_ORG_OWNER),
      is_super_admin: actor.rolesMask === ADMIN_OVERRIDE,
      max_assignable_role_bit: actor.rolesMask === ADMIN_OVERRIDE ? 128 : hasRole(actor.rolesMask, ROLE_ORG_OWNER) ? 64 : 0,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const guard = await requireRequestActor(req, {
    requiredRoles: ORG_MANAGER_ROLES,
    requiredKinds: ["user"],
    feature: "update org members",
  });
  if ("response" in guard) return guard.response;
  const actor = guard.actor;
  const actorIsAdmin = actor.rolesMask === ADMIN_OVERRIDE;

  try {
    const body = (await req.json()) as {
      user_id?: string;
      roles_mask?: string | number | bigint | null;
      status?: string;
    };

    const userId = String(body?.user_id || "").trim();
    if (!userId) {
      return NextResponse.json({ error: "user_id required" }, { status: 400 });
    }

    const rows = await prisma.$queryRaw<Array<{ roles_mask: string; status: string }>>`
SELECT roles_mask::text AS roles_mask, status
FROM org_memberships
WHERE org_id=${actor.orgId}::uuid AND user_id=${userId}::uuid
LIMIT 1
    `;
    const current = rows[0];
    if (!current) {
      return NextResponse.json({ error: "member not found" }, { status: 404 });
    }

    const hasRolesMask = body?.roles_mask != null;
    const hasStatus = typeof body?.status === "string" && body.status.trim().length > 0;
    if (!hasRolesMask && !hasStatus) {
      return NextResponse.json({ error: "roles_mask or status required" }, { status: 400 });
    }

    const nextMask = hasRolesMask
      ? parseRoleMask(body.roles_mask, parseRoleMask(current.roles_mask))
      : parseRoleMask(current.roles_mask);
    if (nextMask < BigInt(0)) {
      return NextResponse.json({ error: "roles_mask must be non-negative" }, { status: 400 });
    }

    const nextStatus = hasStatus ? body.status!.trim().toLowerCase() : current.status;
    if (!["active", "disabled"].includes(nextStatus)) {
      return NextResponse.json({ error: "status must be active or disabled" }, { status: 400 });
    }

    const currMask = parseRoleMask(current.roles_mask);
    if (!actorIsAdmin && isOwnerLike(currMask)) {
      return NextResponse.json(
        { error: "org owners can only manage non-owner memberships in their org" },
        { status: 403 },
      );
    }

    if (!actorIsAdmin && hasRolesMask) {
      const requested = parseRoleMask(body.roles_mask, currMask);
      if (requested !== currMask) {
        // Org owners can assign roles below their own level (bits 1-64),
        // but cannot grant ORG_OWNER (128) or ADMIN_OVERRIDE.
        const actorIsOwner = hasRole(actor.rolesMask, ROLE_ORG_OWNER);
        if (!actorIsOwner) {
          return NextResponse.json(
            {
              error: "only org owners or admin override can change role masks",
              code: "forbidden_role_assignment",
            },
            { status: 403 },
          );
        }
        // Check the bits that changed
        const changed = requested ^ currMask;
        const OWNER_AND_ABOVE = ROLE_ORG_OWNER | ADMIN_OVERRIDE;
        if ((changed & OWNER_AND_ABOVE) !== BigInt(0)) {
          return NextResponse.json(
            {
              error: "org owners cannot assign or revoke org_owner or admin_override roles",
              code: "forbidden_role_escalation",
            },
            { status: 403 },
          );
        }
      }
    }

    const currOwnerActive = current.status === "active" && isOwnerLike(currMask);
    const nextOwnerActive = nextStatus === "active" && isOwnerLike(nextMask);

    if (currOwnerActive && !nextOwnerActive) {
      const countRows = await prisma.$queryRaw<Array<{ c: string }>>`
SELECT COUNT(*)::text AS c
FROM org_memberships
WHERE org_id=${actor.orgId}::uuid
  AND status='active'
  AND (
    roles_mask = CAST(${ADMIN_OVERRIDE.toString()} AS BIGINT)
    OR (roles_mask & CAST(${ROLE_ORG_OWNER.toString()} AS BIGINT)) = CAST(${ROLE_ORG_OWNER.toString()} AS BIGINT)
  )
      `;
      const ownerCount = Number(countRows[0]?.c || "0");
      if (ownerCount <= 1) {
        return NextResponse.json(
          { error: "cannot remove the last active org owner" },
          { status: 400 },
        );
      }
    }

    await prisma.$executeRaw`
UPDATE org_memberships
SET roles_mask = CAST(${nextMask.toString()} AS BIGINT),
    status = ${nextStatus},
    created_at = created_at
WHERE org_id=${actor.orgId}::uuid
  AND user_id=${userId}::uuid
    `;

    const updatedRows = await prisma.$queryRaw<OrgMember[]>`
SELECT
  m.user_id::text AS user_id,
  u.email,
  u.name,
  m.roles_mask::text AS roles_mask,
  m.status,
  m.created_at::text AS created_at
FROM org_memberships m
JOIN users u ON u.id = m.user_id
WHERE m.org_id=${actor.orgId}::uuid AND m.user_id=${userId}::uuid
LIMIT 1
    `;

    return NextResponse.json({ ok: true, member: updatedRows[0] || null });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/invalid input syntax for type uuid/i.test(msg)) {
      return NextResponse.json({ error: "invalid user_id" }, { status: 400 });
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
