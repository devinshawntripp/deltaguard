import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { ADMIN_OVERRIDE, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER } from "@/lib/roles";
import { listOrgRegistries, createRegistryConfig, getRegistryQuota } from "@/lib/registries";
import { audit, getClientIp } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGISTRY_ROLES = [ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE];

export async function GET(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredRoles: REGISTRY_ROLES,
        requiredKinds: ["user"],
        feature: "list registries",
    });
    if ("response" in guard) return guard.response;

    const [items, quota] = await Promise.all([
        listOrgRegistries(guard.actor.orgId),
        getRegistryQuota(guard.actor.orgId),
    ]);
    return NextResponse.json({ items, quota });
}

export async function POST(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredRoles: REGISTRY_ROLES,
        requiredKinds: ["user"],
        feature: "create registry",
    });
    if ("response" in guard) return guard.response;

    try {
        const body = await req.json();
        const name = String(body?.name || "").trim();
        const registryUrl = String(body?.registry_url || "").trim();

        if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
        if (!registryUrl) return NextResponse.json({ error: "registry_url required" }, { status: 400 });

        const isAdmin = guard.actor.rolesMask === ADMIN_OVERRIDE;
        if (!isAdmin) {
            const quota = await getRegistryQuota(guard.actor.orgId);
            if (!quota.allowed) {
                return NextResponse.json(
                    { error: "Registry limit reached for your plan", code: "quota_exceeded", quota },
                    { status: 402 },
                );
            }
        }

        const item = await createRegistryConfig({
            orgId: guard.actor.orgId,
            name,
            registryUrl,
            username: body?.username || undefined,
            token: body?.token || undefined,
        });

        audit({ actor: guard.actor, action: "registry.created", targetType: "registry", targetId: item.id, detail: `Registry "${name}" added`, ip: getClientIp(req) });
        return NextResponse.json({ item }, { status: 201 });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (/unique constraint|duplicate key/i.test(msg)) {
            return NextResponse.json({ error: "A registry with that name already exists" }, { status: 409 });
        }
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
