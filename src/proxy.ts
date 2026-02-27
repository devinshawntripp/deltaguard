import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = [
    "/",
    "/blog",
    "/docs",
    "/install",
    "/install.sh",
    "/signin",
    "/register",
    "/api/auth",
    "/favicon.ico",
];

function isPublicPath(pathname: string): boolean {
    return PUBLIC_PATHS.some((base) => pathname === base || pathname.startsWith(`${base}/`));
}

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (isPublicPath(pathname)) {
        return NextResponse.next();
    }

    if (pathname.startsWith("/_next/") || pathname.startsWith("/public/")) {
        return NextResponse.next();
    }

    if (pathname.startsWith("/api/")) {
        return NextResponse.next();
    }

    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    });

    if (!token?.sub || token?.revoked === true) {
        const url = new URL("/signin", req.url);
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image).*)"],
};
