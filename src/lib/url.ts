import { NextRequest } from "next/server";

export function inferBaseUrl(req: NextRequest): string {
    const envBase =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.APP_BASE_URL ||
        process.env.NEXTAUTH_URL ||
        "";
    if (envBase.trim()) {
        const candidate = envBase.replace(/\/+$/, "");
        if (!/localhost|127\.0\.0\.1/i.test(candidate)) {
            return candidate;
        }
    }

    const origin = (req.headers.get("origin") || "").trim();
    if (/^https?:\/\//i.test(origin)) {
        return origin.replace(/\/+$/, "");
    }

    const referer = (req.headers.get("referer") || "").trim();
    if (/^https?:\/\//i.test(referer)) {
        try {
            const parsed = new URL(referer);
            return parsed.origin.replace(/\/+$/, "");
        } catch {
            // fall through
        }
    }

    const forwardedHost = (req.headers.get("x-forwarded-host") || "").split(",")[0]?.trim();
    const host = forwardedHost || req.headers.get("host") || req.nextUrl.host;

    const forwardedProto = (req.headers.get("x-forwarded-proto") || "").split(",")[0]?.trim();
    const proto = forwardedProto || (req.nextUrl.protocol || "https:").replace(":", "") || "https";

    const fallback = `${proto}://${host}`;
    if (/localhost|127\.0\.0\.1/i.test(fallback)) {
        return "https://scanrook.io";
    }
    return fallback;
}
