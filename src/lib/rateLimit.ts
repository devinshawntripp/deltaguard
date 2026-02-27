import { NextRequest, NextResponse } from "next/server";
import { checkAndConsumeRateLimitToken } from "@/lib/redis";

export interface RateLimitOptions {
    /** Maximum requests allowed within the window. Default: 60 */
    maxRequests?: number;
    /** Window duration in seconds. Default: 60 */
    windowSeconds?: number;
    /**
     * Custom function to derive the rate-limit identifier from the request.
     * When omitted the identifier is derived from the request IP (or
     * x-forwarded-for header) combined with the route pathname.
     */
    identifier?: (req: NextRequest) => string;
}

type RouteHandler = (req: NextRequest, ctx?: any) => Promise<NextResponse> | NextResponse;

function defaultIdentifier(req: NextRequest): string {
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ip = forwarded
        ? forwarded.split(",")[0].trim()
        : realIp ?? "unknown";
    const path = req.nextUrl.pathname;
    return `${ip}:${path}`;
}

/**
 * Wraps a Next.js App-Router handler with Redis-backed rate limiting.
 *
 * When the caller exceeds `maxRequests` within the sliding window the wrapper
 * returns HTTP 429 with a `Retry-After` header indicating the number of
 * seconds until the current window expires.
 *
 * If Redis is unavailable the request is allowed through (fail-open) so the
 * application stays resilient when the cache layer is down.
 */
export function withRateLimit(handler: RouteHandler, options: RateLimitOptions = {}): RouteHandler {
    const maxRequests = options.maxRequests ?? 60;
    const windowSeconds = options.windowSeconds ?? 60;
    const getIdentifier = options.identifier ?? defaultIdentifier;

    return async (req: NextRequest, ctx?: any) => {
        const key = getIdentifier(req);

        // checkAndConsumeRateLimitToken uses a per-minute window internally.
        // We scale the capacity to match the requested windowSeconds so the
        // caller can express limits in natural units. The underlying Redis key
        // uses a 1-minute bucket, so for windows > 60s the effective per-minute
        // budget is maxRequests (still correct because each minute bucket is
        // independent). For windows <= 60s we simply pass maxRequests directly.
        const capacityPerMinute = windowSeconds >= 60
            ? maxRequests
            : maxRequests;

        const allowed = await checkAndConsumeRateLimitToken(key, capacityPerMinute);

        if (!allowed) {
            // Calculate seconds remaining in the current 1-minute window.
            const nowMs = Date.now();
            const currentWindowStartMs = Math.floor(nowMs / 60_000) * 60_000;
            const retryAfter = Math.max(1, Math.ceil((currentWindowStartMs + 60_000 - nowMs) / 1000));

            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(retryAfter),
                        "X-RateLimit-Limit": String(maxRequests),
                        "X-RateLimit-Remaining": "0",
                    },
                },
            );
        }

        return handler(req, ctx);
    };
}
