import crypto from "node:crypto";
import { prisma, ensurePlatformSchema } from "@/lib/prisma";
import { hashApiSecret } from "@/lib/authz";
import { parseRoleMask, ROLE_API_KEY_ADMIN, ROLE_OPERATOR, hasAnyRole } from "@/lib/roles";

export type ApiKeyListItem = {
    id: string;
    name: string;
    prefix: string;
    roles_mask: string;
    status: string;
    created_at: string;
    last_used_at: string | null;
    expires_at: string | null;
};

function randomPrefix(): string {
    return crypto.randomBytes(5).toString("hex");
}

function randomSecret(): string {
    return crypto.randomBytes(24).toString("base64url");
}

export function buildApiKeyToken(prefix: string, secret: string): string {
    return `dgk_${prefix}_${secret}`;
}

export async function createOrgApiKey(params: {
    orgId: string;
    name: string;
    rolesMask: string | number | bigint;
    createdByUserId?: string;
    expiresAt?: string | null;
}): Promise<{ id: string; token: string; prefix: string }> {
    await ensurePlatformSchema();
    const prefix = randomPrefix();
    const secret = randomSecret();
    const token = buildApiKeyToken(prefix, secret);
    const secretHash = hashApiSecret(secret);
    const rolesMask = parseRoleMask(params.rolesMask, ROLE_OPERATOR).toString();

    const rows = await prisma.$queryRaw<Array<{ id: string }>>`
INSERT INTO api_keys (org_id, name, prefix, secret_hash, roles_mask, status, created_by, expires_at)
VALUES (
  ${params.orgId}::uuid,
  ${params.name},
  ${prefix},
  ${secretHash},
  CAST(${rolesMask} AS BIGINT),
  'active',
  ${params.createdByUserId || null}::uuid,
  ${params.expiresAt || null}::timestamptz
)
RETURNING id::text AS id
    `;

    const id = rows[0]?.id;
    if (!id) throw new Error("failed to create API key");

    return { id, token, prefix };
}

export async function listOrgApiKeys(orgId: string): Promise<ApiKeyListItem[]> {
    await ensurePlatformSchema();
    return prisma.$queryRaw<Array<ApiKeyListItem>>`
SELECT
  id::text AS id,
  name,
  prefix,
  roles_mask::text AS roles_mask,
  status,
  created_at::text AS created_at,
  CASE WHEN last_used_at IS NULL THEN NULL ELSE last_used_at::text END AS last_used_at,
  CASE WHEN expires_at IS NULL THEN NULL ELSE expires_at::text END AS expires_at
FROM api_keys
WHERE org_id=${orgId}::uuid
ORDER BY created_at DESC
    `;
}

export async function revokeOrgApiKey(orgId: string, apiKeyId: string): Promise<boolean> {
    await ensurePlatformSchema();
    const rows = await prisma.$queryRaw<Array<{ id: string }>>`
UPDATE api_keys
SET status='revoked'
WHERE id=${apiKeyId}::uuid AND org_id=${orgId}::uuid
RETURNING id::text AS id
    `;
    return Boolean(rows[0]?.id);
}

export function canManageApiKeys(mask: string | number | bigint): boolean {
    const parsed = parseRoleMask(mask);
    return hasAnyRole(parsed, [ROLE_API_KEY_ADMIN]);
}
