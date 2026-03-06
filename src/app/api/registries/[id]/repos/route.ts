import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { ADMIN_OVERRIDE, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER } from "@/lib/roles";
import { getRegistryCredentials } from "@/lib/registries";
import { listRepos } from "@/lib/registryProxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGISTRY_ROLES = [ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE];

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const guard = await requireRequestActor(req, {
        requiredRoles: REGISTRY_ROLES,
        requiredKinds: ["user"],
        feature: "browse registry repos",
    });
    if ("response" in guard) return guard.response;

    const { id } = await context.params;
    const creds = await getRegistryCredentials(id, guard.actor.orgId);
    if (!creds) return NextResponse.json({ error: "registry not found" }, { status: 404 });

    try {
        const result = await listRepos(creds.registryUrl, {
            username: creds.username,
            token: creds.token,
        });
        return NextResponse.json(result);
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 502 });
    }
}
