import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getToken } from "next-auth/jwt";
import { prisma, ensurePlatformSchema, getDefaultOrgId } from "@/lib/prisma";
import {
    ADMIN_OVERRIDE,
    hasRole,
    parseRoleMask,
    ROLE_ANALYST,
    ROLE_API_KEY_ADMIN,
    ROLE_BILLING_ADMIN,
    ROLE_OPERATOR,
    ROLE_ORG_OWNER,
    ROLE_POLICY_ADMIN,
    ROLE_SCAN_ADMIN,
    ROLE_VIEWER,
    hasAnyRole,
} from "@/lib/roles";
import { getCachedTokenVersion, isSessionSidRevoked } from "@/lib/redis";

export type RequestActor = {
    kind: "user" | "api_key" | "anonymous";
    orgId: string;
    rolesMask: bigint;
    userId?: string;
    apiKeyId?: string;
    email?: string;
};

export type RequestActorKind = RequestActor["kind"];
export type ResolveRequestActorOptions = {
    allowAnonymous?: boolean;
    anonymousRolesMask?: bigint;
};
export type RequireRequestActorOptions = ResolveRequestActorOptions & {
    requiredRoles?: bigint[];
    requiredKinds?: RequestActorKind[];
    feature?: string;
};

export const JOB_WRITE_ROLES = [ROLE_OPERATOR, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER];
export const JOB_READ_ROLES = [ROLE_VIEWER, ROLE_ANALYST, ROLE_OPERATOR, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER];

const API_KEY_PREFIX = "dgk";
const ROLE_LABELS = [
    { mask: ROLE_VIEWER, label: "viewer" },
    { mask: ROLE_ANALYST, label: "analyst" },
    { mask: ROLE_OPERATOR, label: "operator" },
    { mask: ROLE_SCAN_ADMIN, label: "scan_admin" },
    { mask: ROLE_POLICY_ADMIN, label: "policy_admin" },
    { mask: ROLE_BILLING_ADMIN, label: "billing_admin" },
    { mask: ROLE_API_KEY_ADMIN, label: "api_key_admin" },
    { mask: ROLE_ORG_OWNER, label: "org_owner" },
] as const;

export function hashApiSecret(secret: string): string {
    return crypto.createHash("sha256").update(secret).digest("hex");
}

function getCandidateApiToken(req: NextRequest): string {
    const auth = req.headers.get("authorization") || "";
    if (auth.startsWith("Bearer ")) return auth.slice(7).trim();
    return (req.headers.get("x-api-key") || "").trim();
}

function timingSafeEqualHex(aHex: string, bHex: string): boolean {
    try {
        const a = Buffer.from(aHex, "hex");
        const b = Buffer.from(bHex, "hex");
        if (a.length !== b.length) return false;
        return crypto.timingSafeEqual(a, b);
    } catch {
        return false;
    }
}

async function resolveApiKeyActor(req: NextRequest): Promise<RequestActor | null> {
    const token = getCandidateApiToken(req);
    if (!token) return null;

    const pieces = token.split("_");
    if (pieces.length < 3 || pieces[0] !== API_KEY_PREFIX) return null;
    const prefix = pieces[1] || "";
    const secret = pieces.slice(2).join("_");
    if (!prefix || !secret) return null;

    await ensurePlatformSchema();
    const rows = await prisma.$queryRaw<Array<{
        id: string;
        org_id: string;
        roles_mask: string;
        secret_hash: string;
        status: string;
        expires_at: Date | null;
    }>>`
SELECT
  id::text AS id,
  org_id::text AS org_id,
  roles_mask::text AS roles_mask,
  secret_hash,
  status,
  expires_at
FROM api_keys
WHERE prefix=${prefix}
LIMIT 1
    `;
    const row = rows[0];
    if (!row || row.status !== "active") return null;
    if (row.expires_at && row.expires_at.getTime() <= Date.now()) return null;

    const incomingHash = hashApiSecret(secret);
    if (!timingSafeEqualHex(row.secret_hash, incomingHash)) return null;

    // best effort usage timestamp
    prisma
        .$executeRaw`
UPDATE api_keys SET last_used_at=now() WHERE id=${row.id}::uuid
        `
        .catch(() => {
            // noop
        });

    return {
        kind: "api_key",
        apiKeyId: row.id,
        orgId: row.org_id,
        rolesMask: parseRoleMask(row.roles_mask, ROLE_OPERATOR),
    };
}

async function resolveUserActor(req: NextRequest): Promise<RequestActor | null> {
    let token: Awaited<ReturnType<typeof getToken>> | null = null;
    try {
        token = await getToken({
            req,
            secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
        });
    } catch {
        return null;
    }
    if (!token?.sub) return null;

    const sid = typeof token.sid === "string" ? token.sid : "";
    if (sid) {
        const revoked = await isSessionSidRevoked(sid);
        if (revoked) return null;
    }

    const userId = String(token.sub);
    const tokenVersion = Number(token.token_version ?? 0);
    const cachedTokenVersion = await getCachedTokenVersion(userId);
    if (cachedTokenVersion != null && tokenVersion < cachedTokenVersion) {
        return null;
    }

    const isGlobalAdmin = await userHasAdminOverride(userId);
    const orgIdFromHeader = (req.headers.get("x-org-id") || "").trim();
    const orgIdFromToken = typeof token.org_id === "string" ? token.org_id : "";
    const activeOrgId = await getUserActiveOrgId(userId);
    const defaultOrgId = await getDefaultOrgId();

    const orgExistenceCache = new Map<string, boolean>();
    const orgExistsCached = async (orgId: string): Promise<boolean> => {
        const key = orgId.trim();
        if (!key) return false;
        if (orgExistenceCache.has(key)) {
            return orgExistenceCache.get(key) === true;
        }
        const exists = await orgExists(key);
        orgExistenceCache.set(key, exists);
        return exists;
    };

    const candidates = [orgIdFromHeader, activeOrgId || "", orgIdFromToken, defaultOrgId];
    let orgId = "";
    let rolesMask: bigint | null = null;
    for (const candidate of candidates) {
        if (!candidate) continue;
        const membership = await getMembershipForUserInOrg(userId, candidate);
        if (membership != null) {
            orgId = candidate;
            rolesMask = membership;
            break;
        }
        if (isGlobalAdmin && await orgExistsCached(candidate)) {
            orgId = candidate;
            rolesMask = ADMIN_OVERRIDE;
            break;
        }
    }
    if (rolesMask == null) {
        if (isGlobalAdmin) {
            const preferred = [orgIdFromHeader, activeOrgId || "", orgIdFromToken, defaultOrgId].find((v) => Boolean(v)) || defaultOrgId;
            const effective = (await orgExistsCached(preferred)) ? preferred : defaultOrgId;
            orgId = effective;
            rolesMask = ADMIN_OVERRIDE;
        } else {
            const primary = await getFirstActiveMembership(userId);
            if (!primary) return null;
            orgId = primary.org_id;
            rolesMask = primary.roles_mask;
        }
    }

    return {
        kind: "user",
        userId,
        orgId,
        rolesMask,
        email: typeof token.email === "string" ? token.email : undefined,
    };
}

export async function resolveRequestActor(
    req: NextRequest,
    opts?: ResolveRequestActorOptions,
): Promise<RequestActor | null> {
    const apiKeyActor = await resolveApiKeyActor(req);
    if (apiKeyActor) return apiKeyActor;

    const userActor = await resolveUserActor(req);
    if (userActor) return userActor;

    if (opts?.allowAnonymous) {
        const orgId = await getDefaultOrgId();
        return {
            kind: "anonymous",
            orgId,
            rolesMask: opts.anonymousRolesMask ?? ROLE_VIEWER,
        };
    }

    return null;
}

export function actorHasAnyRole(actor: RequestActor, required: bigint[]): boolean {
    return hasAnyRole(actor.rolesMask, required);
}

export function roleLabelsFromMask(mask: bigint): string[] {
    if (mask === ADMIN_OVERRIDE) {
        return ["admin_override"];
    }
    const labels = ROLE_LABELS.filter((entry) => hasRole(mask, entry.mask)).map((entry) => entry.label);
    if (labels.length === 0) {
        return [`mask:${mask.toString()}`];
    }
    return labels;
}

export function requiredRoleLabels(required: bigint[]): string[] {
    const out: string[] = [];
    const seen = new Set<string>();
    for (const role of required) {
        if (role === ADMIN_OVERRIDE) {
            if (!seen.has("admin_override")) {
                seen.add("admin_override");
                out.push("admin_override");
            }
            continue;
        }
        const label = ROLE_LABELS.find((entry) => entry.mask === role)?.label || `mask:${role.toString()}`;
        if (!seen.has(label)) {
            seen.add(label);
            out.push(label);
        }
    }
    return out;
}

function roleForbiddenPayload(actor: RequestActor, required: bigint[], feature?: string) {
    const roles = roleLabelsFromMask(actor.rolesMask);
    const requiredRoles = requiredRoleLabels(required);
    const featureText = (feature || "this feature").trim() || "this feature";
    return {
        error: `your roles [${roles.join(", ")}] do not allow you to use ${featureText}. required roles [${requiredRoles.join(", ")}].`,
        code: "forbidden_role",
        roles,
        required_roles: requiredRoles,
        roles_mask: actor.rolesMask.toString(),
        feature: featureText,
    };
}

export function forbiddenByRole(actor: RequestActor, required: bigint[], feature?: string) {
    return NextResponse.json(roleForbiddenPayload(actor, required, feature), { status: 403 });
}

export function forbiddenByRoleResponse(actor: RequestActor, required: bigint[], feature?: string) {
    return new Response(JSON.stringify(roleForbiddenPayload(actor, required, feature)), {
        status: 403,
        headers: { "content-type": "application/json" },
    });
}

function actorKindForbiddenPayload(actor: RequestActor, requiredKinds: RequestActorKind[], feature?: string) {
    const featureText = (feature || "this feature").trim() || "this feature";
    return {
        error: `your actor kind [${actor.kind}] cannot access ${featureText}. required actor kinds [${requiredKinds.join(", ")}].`,
        code: "forbidden_actor_kind",
        actor_kind: actor.kind,
        required_actor_kinds: requiredKinds,
        roles_mask: actor.rolesMask.toString(),
        feature: featureText,
    };
}

export function forbiddenByActorKind(actor: RequestActor, requiredKinds: RequestActorKind[], feature?: string) {
    return NextResponse.json(actorKindForbiddenPayload(actor, requiredKinds, feature), { status: 403 });
}

export function unauthorizedResponse(error = "Unauthorized") {
    return NextResponse.json({ error, code: "unauthorized" }, { status: 401 });
}

export async function requireRequestActor(
    req: NextRequest,
    opts?: RequireRequestActorOptions,
): Promise<{ actor: RequestActor } | { response: NextResponse }> {
    const actor = await resolveRequestActor(req, opts);
    if (!actor) return { response: unauthorizedResponse() };

    if (opts?.requiredKinds?.length && !opts.requiredKinds.includes(actor.kind)) {
        return { response: forbiddenByActorKind(actor, opts.requiredKinds, opts.feature || "this feature") };
    }

    if (opts?.requiredRoles?.length && !actorHasAnyRole(actor, opts.requiredRoles)) {
        return { response: forbiddenByRole(actor, opts.requiredRoles, opts.feature || "this feature") };
    }

    return { actor };
}

export async function getMembershipForUserInOrg(userId: string, orgId: string): Promise<bigint | null> {
    await ensurePlatformSchema();
    const rows = await prisma.$queryRaw<Array<{ roles_mask: string }>>`
SELECT roles_mask::text AS roles_mask
FROM org_memberships
WHERE user_id=${userId}::uuid AND org_id=${orgId}::uuid AND status='active'
LIMIT 1
    `;
    if (!rows[0]) return null;
    return parseRoleMask(rows[0].roles_mask, ROLE_VIEWER);
}

export async function getFirstActiveMembership(
    userId: string,
): Promise<{ org_id: string; roles_mask: bigint } | null> {
    await ensurePlatformSchema();
    const rows = await prisma.$queryRaw<Array<{ org_id: string; roles_mask: string }>>`
SELECT
  org_id::text AS org_id,
  roles_mask::text AS roles_mask
FROM org_memberships
WHERE user_id=${userId}::uuid
  AND status='active'
ORDER BY roles_mask DESC, created_at DESC
LIMIT 1
    `;
    const row = rows[0];
    if (!row) return null;
    return {
        org_id: row.org_id,
        roles_mask: parseRoleMask(row.roles_mask, ROLE_VIEWER),
    };
}

export async function getUserActiveOrgId(userId: string): Promise<string | null> {
    await ensurePlatformSchema();
    const rows = await prisma.$queryRaw<Array<{ active_org_id: string | null }>>`
SELECT active_org_id::text AS active_org_id
FROM users
WHERE id=${userId}::uuid
LIMIT 1
    `;
    return rows[0]?.active_org_id || null;
}

export async function userHasAdminOverride(userId: string): Promise<boolean> {
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

export async function orgExists(orgId: string): Promise<boolean> {
    await ensurePlatformSchema();
    const rows = await prisma.$queryRaw<Array<{ ok: boolean }>>`
SELECT EXISTS(
  SELECT 1
  FROM orgs
  WHERE id=${orgId}::uuid
) AS ok
    `;
    return rows[0]?.ok === true;
}
