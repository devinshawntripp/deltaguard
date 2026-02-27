import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = [
    "/",
    "/blog",
    "/docs",
    "/install",
    "/install.sh",
    "/sitemap.xml",
    "/robots.txt",
    "/signin",
    "/register",
    "/icon.svg",
    "/brand",
    "/api/auth",
    "/favicon.ico",
    "/changelog",
    "/compare",
    "/pricing",
    "/privacy",
    "/roadmap",
    "/security",
    "/terms",
];

function isPublicPath(pathname: string): boolean {
    return PUBLIC_PATHS.some((base) => pathname === base || pathname.startsWith(`${base}/`));
}

/** Attach security headers to a response. */
function withSecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'",
    );
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload",
    );
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    return response;
}

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (isPublicPath(pathname)) {
        return withSecurityHeaders(NextResponse.next());
    }

    if (pathname.startsWith("/_next/") || pathname.startsWith("/public/")) {
        return withSecurityHeaders(NextResponse.next());
    }

    if (pathname.startsWith("/api/")) {
        return withSecurityHeaders(NextResponse.next());
    }

    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    });

    if (!token?.sub || token?.revoked === true) {
        const url = new URL("/signin", req.url);
        url.searchParams.set("next", pathname);
        return withSecurityHeaders(NextResponse.redirect(url));
    }

    return withSecurityHeaders(NextResponse.next());
}

export const config = {
    matcher: ["/((?!_next/static|_next/image).*)"],
};
