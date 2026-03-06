import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { ADMIN_OVERRIDE, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER } from "@/lib/roles";
import { getRegistryCredentials } from "@/lib/registries";
import { listTags } from "@/lib/registryProxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGISTRY_ROLES = [ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE];

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const guard = await requireRequestActor(req, {
        requiredRoles: REGISTRY_ROLES,
        requiredKinds: ["user"],
        feature: "browse registry tags",
    });
    if ("response" in guard) return guard.response;

    const { id } = await context.params;
    const repo = req.nextUrl.searchParams.get("repo");
    if (!repo) return NextResponse.json({ error: "repo query param required" }, { status: 400 });

    const creds = await getRegistryCredentials(id, guard.actor.orgId);
    if (!creds) return NextResponse.json({ error: "registry not found" }, { status: 404 });

    try {
        const result = await listTags(creds.registryUrl, repo, {
            username: creds.username,
            token: creds.token,
        });
        return NextResponse.json(result);
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 502 });
    }
}
