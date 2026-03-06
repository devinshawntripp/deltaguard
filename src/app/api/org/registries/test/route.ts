import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { ADMIN_OVERRIDE, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER } from "@/lib/roles";
import { pingRegistry } from "@/lib/registryProxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGISTRY_ROLES = [ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE];

/**
 * Test connection to a registry with raw credentials (before saving).
 */
export async function POST(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredRoles: REGISTRY_ROLES,
        requiredKinds: ["user"],
        feature: "test registry connection",
    });
    if ("response" in guard) return guard.response;

    const body = await req.json();
    const registryUrl = String(body?.registry_url || "").trim();
    if (!registryUrl) return NextResponse.json({ error: "registry_url required" }, { status: 400 });

    const start = Date.now();
    const result = await pingRegistry(registryUrl, {
        username: body?.username || null,
        token: body?.token || null,
    });
    const latencyMs = Date.now() - start;

    return NextResponse.json({ ...result, latencyMs });
}
