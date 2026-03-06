import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { ADMIN_OVERRIDE, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER } from "@/lib/roles";
import { getRegistryCredentials } from "@/lib/registries";
import { pingRegistry } from "@/lib/registryProxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGISTRY_ROLES = [ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE];

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const guard = await requireRequestActor(req, {
        requiredRoles: REGISTRY_ROLES,
        requiredKinds: ["user"],
        feature: "ping registry",
    });
    if ("response" in guard) return guard.response;

    const { id } = await context.params;
    const creds = await getRegistryCredentials(id, guard.actor.orgId);
    if (!creds) return NextResponse.json({ error: "not found" }, { status: 404 });

    const start = Date.now();
    const result = await pingRegistry(creds.registryUrl, {
        username: creds.username,
        token: creds.token,
    });
    const latencyMs = Date.now() - start;

    return NextResponse.json({ ...result, latencyMs });
}
