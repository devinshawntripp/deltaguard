import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js middleware that attaches security headers to every response.
 *
 * Headers applied:
 *  - Content-Security-Policy (restrictive default, inline styles/scripts
 *    allowed because Next.js injects inline chunks)
 *  - X-Content-Type-Options
 *  - X-Frame-Options
 *  - Strict-Transport-Security (HSTS with preload)
 *  - Referrer-Policy
 *  - Permissions-Policy
 */
export function middleware(_req: NextRequest) {
    const response = NextResponse.next();

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

/**
 * Run this middleware on all routes. Next.js static assets (_next/static,
 * _next/image) and the favicon are excluded by default; add any paths that
 * should be skipped to the `missing` or `not` arrays below.
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         *  - _next/static (static files)
         *  - _next/image (image optimization)
         *  - favicon.ico, sitemap.xml, robots.txt
         */
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
};
