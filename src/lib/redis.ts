import Redis from "ioredis";

let client: Redis | null = null;
let disabled = false;

function redisUrlFromEnv(): string {
    return (
        process.env.REDIS_URL ||
        process.env.UPSTASH_REDIS_URL ||
        process.env.NEXT_PUBLIC_REDIS_URL ||
        ""
    ).trim();
}

export function getRedis(): Redis | null {
    if (disabled) return null;
    if (client) return client;

    const url = redisUrlFromEnv();
    if (!url) {
        disabled = true;
        return null;
    }

    client = new Redis(url, {
        maxRetriesPerRequest: 2,
        enableReadyCheck: true,
        lazyConnect: true,
    });

    client.on("error", () => {
        // Keep runtime resilient when redis is unavailable.
    });

    return client;
}

async function withRedis<T>(fn: (r: Redis) => Promise<T>, fallback: T): Promise<T> {
    const r = getRedis();
    if (!r) return fallback;
    try {
        if (r.status === "wait") {
            await r.connect();
        }
        return await fn(r);
    } catch {
        return fallback;
    }
}

const REVOKED_SID_PREFIX = "auth:revoked:sid:";
const TOKEN_VERSION_PREFIX = "auth:token_version:user:";

export async function revokeSessionSid(sid: string, ttlSeconds = 60 * 60 * 24): Promise<void> {
    if (!sid) return;
    await withRedis(async (r) => {
        await r.set(`${REVOKED_SID_PREFIX}${sid}`, "1", "EX", ttlSeconds);
    }, undefined);
}

export async function isSessionSidRevoked(sid: string): Promise<boolean> {
    if (!sid) return false;
    return withRedis(async (r) => {
        const v = await r.get(`${REVOKED_SID_PREFIX}${sid}`);
        return v === "1";
    }, false);
}

export async function setCachedTokenVersion(userId: string, tokenVersion: number, ttlSeconds = 60 * 60 * 24 * 7): Promise<void> {
    if (!userId) return;
    await withRedis(async (r) => {
        await r.set(`${TOKEN_VERSION_PREFIX}${userId}`, String(tokenVersion), "EX", ttlSeconds);
    }, undefined);
}

export async function getCachedTokenVersion(userId: string): Promise<number | null> {
    if (!userId) return null;
    return withRedis(async (r) => {
        const v = await r.get(`${TOKEN_VERSION_PREFIX}${userId}`);
        if (v == null) return null;
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
    }, null);
}

export async function incrementCachedTokenVersion(userId: string): Promise<number | null> {
    if (!userId) return null;
    return withRedis(async (r) => {
        const n = await r.incr(`${TOKEN_VERSION_PREFIX}${userId}`);
        await r.expire(`${TOKEN_VERSION_PREFIX}${userId}`, 60 * 60 * 24 * 7);
        return Number(n);
    }, null);
}

export async function checkAndConsumeRateLimitToken(
    key: string,
    capacityPerMinute: number,
): Promise<boolean> {
    if (!key || capacityPerMinute <= 0) return true;

    const windowKey = `ratelimit:${key}:${Math.floor(Date.now() / 60_000)}`;
    return withRedis(async (r) => {
        const tx = r.multi();
        tx.incr(windowKey);
        tx.expire(windowKey, 70);
        const out = await tx.exec();
        const count = Number(out?.[0]?.[1] || 0);
        return count <= capacityPerMinute;
    }, true);
}

export type DailyLimitResult = {
    allowed: boolean;
    used: number;
    remaining: number;
    limit: number;
    resetAt: string;
};

function utcDayKey(now = new Date()): string {
    const y = now.getUTCFullYear();
    const m = `${now.getUTCMonth() + 1}`.padStart(2, "0");
    const d = `${now.getUTCDate()}`.padStart(2, "0");
    return `${y}${m}${d}`;
}

function secondsUntilNextUtcDay(now = new Date()): number {
    const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0);
    return Math.max(1, Math.floor((next - now.getTime()) / 1000));
}

export async function getDailyLimitStatus(limitKey: string, limitPerDay: number): Promise<DailyLimitResult> {
    if (!limitKey || limitPerDay <= 0) {
        return {
            allowed: true,
            used: 0,
            remaining: Number.MAX_SAFE_INTEGER,
            limit: limitPerDay,
            resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
    }

    const now = new Date();
    const key = `ratelimit:daily:${limitKey}:${utcDayKey(now)}`;
    const used = await withRedis(async (r) => {
        const raw = await r.get(key);
        const n = Number(raw || "0");
        return Number.isFinite(n) ? n : 0;
    }, 0);
    const remaining = Math.max(0, limitPerDay - used);
    return {
        allowed: used < limitPerDay,
        used,
        remaining,
        limit: limitPerDay,
        resetAt: new Date(now.getTime() + secondsUntilNextUtcDay(now) * 1000).toISOString(),
    };
}

export async function consumeDailyLimit(limitKey: string, limitPerDay: number): Promise<DailyLimitResult> {
    if (!limitKey || limitPerDay <= 0) {
        return {
            allowed: true,
            used: 0,
            remaining: Number.MAX_SAFE_INTEGER,
            limit: limitPerDay,
            resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
    }

    const now = new Date();
    const ttl = secondsUntilNextUtcDay(now) + 120;
    const key = `ratelimit:daily:${limitKey}:${utcDayKey(now)}`;
    const used = await withRedis(async (r) => {
        const tx = r.multi();
        tx.incr(key);
        tx.expire(key, ttl);
        const out = await tx.exec();
        const n = Number(out?.[0]?.[1] || 0);
        return Number.isFinite(n) ? n : 0;
    }, 0);
    const remaining = Math.max(0, limitPerDay - used);
    return {
        allowed: used <= limitPerDay,
        used,
        remaining,
        limit: limitPerDay,
        resetAt: new Date(now.getTime() + secondsUntilNextUtcDay(now) * 1000).toISOString(),
    };
}
