import bcrypt from "bcryptjs";
import { prisma, ensurePlatformSchema, getDefaultOrgId, ADMIN_OVERRIDE_MASK } from "@/lib/prisma";
import {
    parseRoleMask,
    ROLE_VIEWER,
    type RoleMaskInput,
} from "@/lib/roles";
import { setCachedTokenVersion } from "@/lib/redis";

export type UserRecord = {
    id: string;
    email: string;
    name: string | null;
    password_hash: string | null;
    auth_provider: string;
    active_org_id: string | null;
    token_version: number;
};

export type MembershipRecord = {
    org_id: string;
    roles_mask: bigint;
    status: string;
};

export type ThemePreference = "light" | "dark" | "system";

function normalizeThemePreference(value: string | null | undefined): ThemePreference {
    if (value === "light" || value === "dark" || value === "system") return value;
    return "system";
}

export function normalizeEmail(email: string): string {
    return String(email || "").trim().toLowerCase();
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
    await ensurePlatformSchema();
    const normalized = normalizeEmail(email);
    if (!normalized) return null;
    const rows = await prisma.$queryRaw<Array<UserRecord>>`
SELECT
  id::text AS id,
  email,
  name,
  password_hash,
  auth_provider,
  active_org_id::text AS active_org_id,
  token_version
FROM users
WHERE email=${normalized}
LIMIT 1
    `;
    return rows[0] || null;
}

export async function getUserById(id: string): Promise<UserRecord | null> {
    await ensurePlatformSchema();
    const rows = await prisma.$queryRaw<Array<UserRecord>>`
SELECT
  id::text AS id,
  email,
  name,
  password_hash,
  auth_provider,
  active_org_id::text AS active_org_id,
  token_version
FROM users
WHERE id=${id}::uuid
LIMIT 1
    `;
    return rows[0] || null;
}

export async function getUserThemePreference(userId: string): Promise<ThemePreference> {
    await ensurePlatformSchema();
    const rows = await prisma.$queryRaw<Array<{ theme_preference: string | null }>>`
SELECT theme_preference::text AS theme_preference
FROM users
WHERE id=${userId}::uuid
LIMIT 1
    `;
    return normalizeThemePreference(rows[0]?.theme_preference);
}

export async function setUserThemePreference(userId: string, preference: string): Promise<ThemePreference> {
    await ensurePlatformSchema();
    const normalized = normalizeThemePreference(preference);
    await prisma.$executeRaw`
UPDATE users
SET theme_preference=${normalized},
    updated_at=now()
WHERE id=${userId}::uuid
    `;
    return normalized;
}

export async function getPrimaryMembership(userId: string): Promise<MembershipRecord | null> {
    await ensurePlatformSchema();
    const activeRows = await prisma.$queryRaw<Array<{ org_id: string; roles_mask: string; status: string }>>`
SELECT
  m.org_id::text AS org_id,
  m.roles_mask::text AS roles_mask,
  m.status
FROM users u
JOIN org_memberships m
  ON m.user_id = u.id
 AND m.org_id = u.active_org_id
WHERE u.id=${userId}::uuid
  AND m.status='active'
LIMIT 1
    `;
    if (activeRows[0]) {
        return {
            org_id: activeRows[0].org_id,
            roles_mask: parseRoleMask(activeRows[0].roles_mask, ROLE_VIEWER),
            status: activeRows[0].status,
        };
    }

    const rows = await prisma.$queryRaw<Array<{ org_id: string; roles_mask: string; status: string }>>`
SELECT
  org_id::text AS org_id,
  roles_mask::text AS roles_mask,
  status
FROM org_memberships
WHERE user_id=${userId}::uuid
  AND status='active'
ORDER BY roles_mask DESC, created_at DESC
LIMIT 1
    `;
    if (!rows[0]) return null;
    return {
        org_id: rows[0].org_id,
        roles_mask: parseRoleMask(rows[0].roles_mask, ROLE_VIEWER),
        status: rows[0].status,
    };
}

export async function setUserActiveOrg(userId: string, orgId: string): Promise<void> {
    await ensurePlatformSchema();
    await prisma.$executeRaw`
UPDATE users
SET active_org_id=${orgId}::uuid,
    updated_at=now()
WHERE id=${userId}::uuid
    `;
}

export async function clearUserActiveOrg(userId: string): Promise<void> {
    await ensurePlatformSchema();
    await prisma.$executeRaw`
UPDATE users
SET active_org_id=NULL,
    updated_at=now()
WHERE id=${userId}::uuid
    `;
}

export async function ensureMembership(
    userId: string,
    orgId: string,
    rolesMask: RoleMaskInput,
): Promise<void> {
    await ensurePlatformSchema();
    const mask = parseRoleMask(rolesMask, ROLE_VIEWER).toString();
    await prisma.$executeRaw`
INSERT INTO org_memberships (org_id, user_id, roles_mask, status)
VALUES (${orgId}::uuid, ${userId}::uuid, CAST(${mask} AS BIGINT), 'active')
ON CONFLICT (org_id, user_id)
DO UPDATE SET status='active', roles_mask=CAST(${mask} AS BIGINT)
    `;
}

export async function createOrUpdateOAuthUser(params: {
    email: string;
    name?: string | null;
    provider: string;
}): Promise<UserRecord> {
    await ensurePlatformSchema();
    const email = normalizeEmail(params.email);
    if (!email) throw new Error("email required");

    await prisma.$executeRaw`
INSERT INTO users (email, name, auth_provider, token_version)
VALUES (${email}, ${params.name || null}, ${params.provider}, 0)
ON CONFLICT (email)
DO UPDATE SET
  name = COALESCE(EXCLUDED.name, users.name),
  auth_provider = EXCLUDED.auth_provider,
  updated_at = now()
    `;

    const user = await getUserByEmail(email);
    if (!user) throw new Error("failed to load oauth user");

    const orgId = await getDefaultOrgId();
    await ensureMembership(user.id, orgId, ROLE_VIEWER);

    return user;
}

export async function registerUser(params: {
    email: string;
    password: string;
    name?: string;
}): Promise<{ user: UserRecord; orgId: string; rolesMask: bigint }> {
    await ensurePlatformSchema();
    const email = normalizeEmail(params.email);
    if (!email) throw new Error("email required");
    if (!params.password || params.password.length < 10) {
        throw new Error("password must be at least 10 characters");
    }

    const existing = await getUserByEmail(email);
    if (existing) {
        throw new Error("email already registered");
    }

    const passwordHash = await hashPassword(params.password);
    await prisma.$executeRaw`
INSERT INTO users (email, name, password_hash, auth_provider, token_version)
VALUES (${email}, ${params.name || null}, ${passwordHash}, 'credentials', 0)
    `;

    const user = await getUserByEmail(email);
    if (!user) throw new Error("failed to create user");

    const orgId = await getDefaultOrgId();

    // First explicit registration in a fresh deployment becomes org owner.
    const membershipCountRows = await prisma.$queryRaw<Array<{ count: string }>>`
SELECT COUNT(*)::text AS count FROM org_memberships WHERE org_id=${orgId}::uuid
    `;
    const membershipCount = Number(membershipCountRows[0]?.count || "0");
    const isFirst = membershipCount === 0;

    const roleMask = isFirst ? BigInt(ADMIN_OVERRIDE_MASK) : ROLE_VIEWER;
    await ensureMembership(user.id, orgId, roleMask);
    await setCachedTokenVersion(user.id, user.token_version);

    return { user, orgId, rolesMask: roleMask };
}

export async function incrementUserTokenVersion(userId: string): Promise<number> {
    await ensurePlatformSchema();
    const rows = await prisma.$queryRaw<Array<{ token_version: number }>>`
UPDATE users
SET token_version = token_version + 1,
    updated_at = now()
WHERE id=${userId}::uuid
RETURNING token_version
    `;
    const tokenVersion = Number(rows[0]?.token_version || 0);
    await setCachedTokenVersion(userId, tokenVersion);
    return tokenVersion;
}
