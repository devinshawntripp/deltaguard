import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.DELTAGUARD_API_KEY?.trim();

function hasValidApiKey(req: NextRequest): boolean {
    if (!API_KEY) return true; // No key configured → open access
    const auth = req.headers.get("authorization");
    if (auth?.startsWith("Bearer ")) {
        return auth.slice(7).trim() === API_KEY;
    }
    const xKey = req.headers.get("x-api-key");
    if (xKey) return xKey.trim() === API_KEY;
    return false;
}

export function proxy(req: NextRequest) {
    // API routes: require Bearer token or X-Api-Key header (for programmatic/CI use)
    if (req.nextUrl.pathname.startsWith("/api/")) {
        if (hasValidApiKey(req)) {
            return NextResponse.next();
        }
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // UI routes: always allow (network/ingress handles access control)
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
