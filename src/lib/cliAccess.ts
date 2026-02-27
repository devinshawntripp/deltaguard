import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { RequestActor } from "@/lib/authz";
import { consumeDailyLimit, DailyLimitResult, getDailyLimitStatus } from "@/lib/redis";
import { getOrgPlanUsage } from "@/lib/usage";
import { inferBaseUrl } from "@/lib/url";

export type CliLimitType =
    | "anonymous_daily"
    | "free_api_key_daily"
    | "free_user_daily"
    | "plan_unlimited";

export type CliLimitResponse = {
    allowed: boolean;
    code?: string;
    limit_type: CliLimitType;
    remaining: number | null;
    reset_at: string | null;
    limit: number | null;
    upgrade_url: string;
    actor_kind: RequestActor["kind"];
    org_id: string;
    plan_code?: string;
};

function envInt(name: string, fallback: number): number {
    const raw = Number(process.env[name] || "");
    if (!Number.isFinite(raw) || raw <= 0) return fallback;
    return Math.floor(raw);
}

function clientIp(req: NextRequest): string {
    const forwarded = (req.headers.get("x-forwarded-for") || "").split(",")[0]?.trim();
    const cf = (req.headers.get("cf-connecting-ip") || "").trim();
    const real = (req.headers.get("x-real-ip") || "").trim();
    return forwarded || cf || real || "unknown";
}

function anonymousFingerprint(req: NextRequest): string {
    const ip = clientIp(req);
    const ua = (req.headers.get("user-agent") || "").trim();
    return crypto.createHash("sha256").update(`${ip}|${ua}`).digest("hex");
}

function upgradeUrl(req: NextRequest): string {
    const explicit = (process.env.CLI_UPGRADE_URL || "").trim();
    if (explicit) return explicit;
    return `${inferBaseUrl(req)}/dashboard/settings/billing`;
}

function toResponse(
    actor: RequestActor,
    req: NextRequest,
    limitType: CliLimitType,
    status: DailyLimitResult | null,
    planCode?: string,
): CliLimitResponse {
    const allowed = status ? status.allowed : true;
    return {
        allowed,
        code: allowed ? undefined : "cloud_enrich_rate_limited",
        limit_type: limitType,
        remaining: status ? status.remaining : null,
        reset_at: status ? status.resetAt : null,
        limit: status ? status.limit : null,
        upgrade_url: upgradeUrl(req),
        actor_kind: actor.kind,
        org_id: actor.orgId,
        plan_code: planCode,
    };
}

async function resolveLimit(
    req: NextRequest,
    actor: RequestActor,
    consume: boolean,
): Promise<CliLimitResponse> {
    const anonLimit = envInt("CLI_ANON_ENRICH_DAILY_LIMIT", 10);
    const freeApiKeyLimit = envInt("CLI_FREE_API_KEY_ENRICH_DAILY_LIMIT", 50);

    if (actor.kind === "anonymous") {
        const key = `cli:anon:${anonymousFingerprint(req)}`;
        const status = consume
            ? await consumeDailyLimit(key, anonLimit)
            : await getDailyLimitStatus(key, anonLimit);
        return toResponse(actor, req, "anonymous_daily", status);
    }

    const usage = await getOrgPlanUsage(actor.orgId);
    const planCode = String(usage.planCode || "FREE").toUpperCase();
    if (planCode !== "FREE") {
        return toResponse(actor, req, "plan_unlimited", null, planCode);
    }

    if (actor.kind === "api_key") {
        const key = `cli:free:api_key:${actor.apiKeyId || actor.orgId}`;
        const status = consume
            ? await consumeDailyLimit(key, freeApiKeyLimit)
            : await getDailyLimitStatus(key, freeApiKeyLimit);
        return toResponse(actor, req, "free_api_key_daily", status, planCode);
    }

    const key = `cli:free:user:${actor.userId || actor.orgId}`;
    const status = consume
        ? await consumeDailyLimit(key, freeApiKeyLimit)
        : await getDailyLimitStatus(key, freeApiKeyLimit);
    return toResponse(actor, req, "free_user_daily", status, planCode);
}

export async function getCliEnrichLimit(req: NextRequest, actor: RequestActor): Promise<CliLimitResponse> {
    return resolveLimit(req, actor, false);
}

export async function consumeCliEnrichLimit(req: NextRequest, actor: RequestActor): Promise<CliLimitResponse> {
    return resolveLimit(req, actor, true);
}
