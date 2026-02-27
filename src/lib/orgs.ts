import crypto from "node:crypto";
import { ensurePlatformSchema, prisma } from "@/lib/prisma";
import { ADMIN_OVERRIDE, parseRoleMask, ROLE_ORG_OWNER, ROLE_VIEWER } from "@/lib/roles";
import { normalizeEmail, setUserActiveOrg } from "@/lib/users";

export type UserOrgRow = {
    org_id: string;
    name: string;
    slug: string;
    roles_mask: string;
    status: string;
    active: boolean;
};

export type OrgInviteRow = {
    id: string;
    org_id: string;
    email: string;
    roles_mask: string;
    status: string;
    invited_by: string | null;
    accepted_by: string | null;
    expires_at: string;
    accepted_at: string | null;
    created_at: string;
};

export function slugifyOrgName(input: string): string {
    const raw = String(input || "").trim().toLowerCase();
    const slug = raw
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48);
    return slug || "org";
}

async function ensureUniqueOrgSlug(baseSlug: string): Promise<string> {
    const base = slugifyOrgName(baseSlug);
    let candidate = base;
    for (let i = 0; i < 2000; i++) {
        const rows = await prisma.$queryRaw<Array<{ id: string }>>`
SELECT id::text AS id FROM orgs WHERE slug=${candidate} LIMIT 1
        `;
        if (!rows[0]) return candidate;
        candidate = `${base}-${i + 2}`;
    }
    throw new Error("could not generate unique org slug");
}

async function isGlobalAdminUser(userId: string): Promise<boolean> {
    await ensurePlatformSchema();
    const rows = await prisma.$queryRaw<Array<{ ok: boolean }>>`
SELECT EXISTS(
  SELECT 1
  FROM org_memberships
  WHERE user_id=${userId}::uuid
    AND status='active'
    AND roles_mask = CAST(${ADMIN_OVERRIDE.toString()} AS BIGINT)
) AS ok
    `;
    return rows[0]?.ok === true;
}

export async function listUserOrgs(userId: string): Promise<UserOrgRow[]> {
    await ensurePlatformSchema();
    const globalAdmin = await isGlobalAdminUser(userId);
    if (globalAdmin) {
        return prisma.$queryRaw<UserOrgRow[]>`
SELECT
  o.id::text AS org_id,
  o.name,
  o.slug,
  COALESCE(m.roles_mask::text, ${ADMIN_OVERRIDE.toString()}) AS roles_mask,
  COALESCE(m.status, 'active') AS status,
  (u.active_org_id = o.id) AS active
FROM users u
JOIN orgs o ON TRUE
LEFT JOIN org_memberships m
  ON m.org_id = o.id
 AND m.user_id = u.id
WHERE u.id=${userId}::uuid
ORDER BY (u.active_org_id = o.id) DESC, o.created_at DESC
        `;
    }
    return prisma.$queryRaw<UserOrgRow[]>`
SELECT
  m.org_id::text AS org_id,
  o.name,
  o.slug,
  m.roles_mask::text AS roles_mask,
  m.status,
  (u.active_org_id = m.org_id) AS active
FROM org_memberships m
JOIN orgs o ON o.id = m.org_id
JOIN users u ON u.id = m.user_id
WHERE m.user_id=${userId}::uuid
  AND m.status='active'
ORDER BY m.roles_mask DESC, m.created_at DESC
    `;
}

export async function isUserActiveInOrg(userId: string, orgId: string): Promise<boolean> {
    await ensurePlatformSchema();
    const globalAdmin = await isGlobalAdminUser(userId);
    if (globalAdmin) {
        const orgRows = await prisma.$queryRaw<Array<{ ok: boolean }>>`
SELECT EXISTS(
  SELECT 1
  FROM orgs
  WHERE id=${orgId}::uuid
) AS ok
        `;
        return orgRows[0]?.ok === true;
    }
    const rows = await prisma.$queryRaw<Array<{ ok: boolean }>>`
SELECT EXISTS(
  SELECT 1
  FROM org_memberships
  WHERE user_id=${userId}::uuid
    AND org_id=${orgId}::uuid
    AND status='active'
) AS ok
    `;
    return rows[0]?.ok === true;
}

export async function createOrgForUser(params: {
    userId: string;
    name: string;
    slug?: string;
}): Promise<{ id: string; name: string; slug: string }> {
    await ensurePlatformSchema();
    const name = String(params.name || "").trim();
    if (!name) throw new Error("org name is required");

    const slug = await ensureUniqueOrgSlug(params.slug || name);

    const created = await prisma.$queryRaw<Array<{ id: string; name: string; slug: string }>>`
INSERT INTO orgs (name, slug)
VALUES (${name}, ${slug})
RETURNING id::text AS id, name, slug
    `;
    const org = created[0];
    if (!org) throw new Error("failed to create org");

    await prisma.$executeRaw`
INSERT INTO scanner_settings (org_id)
VALUES (${org.id}::uuid)
ON CONFLICT (org_id) DO NOTHING
    `;

    await prisma.$executeRaw`
INSERT INTO org_memberships (org_id, user_id, roles_mask, status)
VALUES (${org.id}::uuid, ${params.userId}::uuid, CAST(${ROLE_ORG_OWNER.toString()} AS BIGINT), 'active')
ON CONFLICT (org_id, user_id)
DO UPDATE SET status='active', roles_mask=CAST(${ROLE_ORG_OWNER.toString()} AS BIGINT)
    `;

    await setUserActiveOrg(params.userId, org.id);
    return org;
}

function randomInviteToken(): string {
    return crypto.randomBytes(24).toString("base64url");
}

function hashInviteToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
}

export async function listOrgInvites(orgId: string): Promise<OrgInviteRow[]> {
    await ensurePlatformSchema();
    return prisma.$queryRaw<OrgInviteRow[]>`
SELECT
  id::text AS id,
  org_id::text AS org_id,
  email,
  roles_mask::text AS roles_mask,
  status,
  invited_by::text AS invited_by,
  accepted_by::text AS accepted_by,
  expires_at::text AS expires_at,
  accepted_at::text AS accepted_at,
  created_at::text AS created_at
FROM org_invites
WHERE org_id=${orgId}::uuid
ORDER BY created_at DESC
LIMIT 200
    `;
}

export async function createOrgInvite(params: {
    orgId: string;
    email: string;
    rolesMask?: string | number | bigint;
    invitedByUserId: string;
    expiresHours?: number;
}): Promise<{ invite: OrgInviteRow; token: string }> {
    await ensurePlatformSchema();
    const email = normalizeEmail(params.email);
    if (!email) throw new Error("email is required");

    const rolesMask = parseRoleMask(params.rolesMask, ROLE_VIEWER);
    if (rolesMask < BigInt(0)) throw new Error("roles_mask must be non-negative");
    if (rolesMask === ADMIN_OVERRIDE) throw new Error("admin override cannot be assigned by invite");

    const hoursRaw = Number(params.expiresHours ?? 72);
    const expiresHours = Number.isFinite(hoursRaw) ? Math.max(1, Math.min(24 * 30, Math.trunc(hoursRaw))) : 72;

    await prisma.$executeRaw`
UPDATE org_invites
SET status='revoked'
WHERE org_id=${params.orgId}::uuid
  AND LOWER(email)=LOWER(${email})
  AND status='pending'
    `;

    const token = randomInviteToken();
    const tokenHash = hashInviteToken(token);

    const rows = await prisma.$queryRaw<OrgInviteRow[]>`
INSERT INTO org_invites (
  org_id,
  email,
  roles_mask,
  status,
  token_hash,
  invited_by,
  expires_at
)
VALUES (
  ${params.orgId}::uuid,
  ${email},
  CAST(${rolesMask.toString()} AS BIGINT),
  'pending',
  ${tokenHash},
  ${params.invitedByUserId}::uuid,
  now() + (${expiresHours} * INTERVAL '1 hour')
)
RETURNING
  id::text AS id,
  org_id::text AS org_id,
  email,
  roles_mask::text AS roles_mask,
  status,
  invited_by::text AS invited_by,
  accepted_by::text AS accepted_by,
  expires_at::text AS expires_at,
  accepted_at::text AS accepted_at,
  created_at::text AS created_at
    `;
    const invite = rows[0];
    if (!invite) throw new Error("failed to create invite");
    return { invite, token };
}

export async function revokeOrgInvite(orgId: string, inviteId: string): Promise<boolean> {
    await ensurePlatformSchema();
    const rows = await prisma.$queryRaw<Array<{ id: string }>>`
UPDATE org_invites
SET status='revoked'
WHERE id=${inviteId}::uuid
  AND org_id=${orgId}::uuid
  AND status='pending'
RETURNING id::text AS id
    `;
    return Boolean(rows[0]?.id);
}

export async function acceptOrgInvite(params: {
    token: string;
    userId: string;
    userEmail: string;
}): Promise<{ ok: true; orgId: string } | { ok: false; reason: string }> {
    await ensurePlatformSchema();
    const token = String(params.token || "").trim();
    if (!token) return { ok: false, reason: "token required" };
    const userEmail = normalizeEmail(params.userEmail);
    if (!userEmail) return { ok: false, reason: "account email is required" };

    const tokenHash = hashInviteToken(token);
    const rows = await prisma.$queryRaw<Array<{ id: string; org_id: string; email: string; roles_mask: string; status: string; expires_at: Date }>>`
SELECT
  id::text AS id,
  org_id::text AS org_id,
  email,
  roles_mask::text AS roles_mask,
  status,
  expires_at
FROM org_invites
WHERE token_hash=${tokenHash}
LIMIT 1
    `;
    const invite = rows[0];
    if (!invite) return { ok: false, reason: "invite not found" };
    if (invite.status !== "pending") return { ok: false, reason: `invite is ${invite.status}` };
    if (invite.expires_at.getTime() <= Date.now()) return { ok: false, reason: "invite expired" };
    if (normalizeEmail(invite.email) !== userEmail) {
        return { ok: false, reason: "invite email does not match signed-in user" };
    }

    const inviteMask = parseRoleMask(invite.roles_mask, ROLE_VIEWER);
    const effectiveInviteMask = inviteMask === ADMIN_OVERRIDE ? ROLE_VIEWER : inviteMask;

    await prisma.$transaction([
        prisma.$executeRaw`
INSERT INTO org_memberships (org_id, user_id, roles_mask, status)
VALUES (${invite.org_id}::uuid, ${params.userId}::uuid, CAST(${effectiveInviteMask.toString()} AS BIGINT), 'active')
ON CONFLICT (org_id, user_id)
DO UPDATE SET
  status='active',
  roles_mask=(org_memberships.roles_mask | CAST(${effectiveInviteMask.toString()} AS BIGINT))
        `,
        prisma.$executeRaw`
UPDATE users
SET active_org_id=${invite.org_id}::uuid,
    updated_at=now()
WHERE id=${params.userId}::uuid
        `,
        prisma.$executeRaw`
UPDATE org_invites
SET status='accepted',
    accepted_by=${params.userId}::uuid,
    accepted_at=now()
WHERE id=${invite.id}::uuid
        `,
    ]);

    return { ok: true, orgId: invite.org_id };
}
