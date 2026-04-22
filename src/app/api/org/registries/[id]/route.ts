import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { ADMIN_OVERRIDE, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER } from "@/lib/roles";
import { getRegistryConfig, updateRegistryConfig, deleteRegistryConfig } from "@/lib/registries";
import { audit, getClientIp } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGISTRY_ROLES = [ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE];

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const guard = await requireRequestActor(req, {
        requiredRoles: REGISTRY_ROLES,
        requiredKinds: ["user"],
        feature: "view registry",
    });
    if ("response" in guard) return guard.response;

    const { id } = await context.params;
    const item = await getRegistryConfig(id, guard.actor.orgId);
    if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });

    return NextResponse.json({ item });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const guard = await requireRequestActor(req, {
        requiredRoles: REGISTRY_ROLES,
        requiredKinds: ["user"],
        feature: "update registry",
    });
    if ("response" in guard) return guard.response;

    const { id } = await context.params;

    try {
        const body = await req.json();
        const item = await updateRegistryConfig({
            id,
            orgId: guard.actor.orgId,
            name: body?.name,
            registryUrl: body?.registry_url,
            username: body?.username,
            token: body?.token,
        });
        if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });

        audit({ actor: guard.actor, action: "registry.updated", targetType: "registry", targetId: id, ip: getClientIp(req) });
        return NextResponse.json({ item });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (/unique constraint|duplicate key/i.test(msg)) {
            return NextResponse.json({ error: "A registry with that name already exists" }, { status: 409 });
        }
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const guard = await requireRequestActor(req, {
        requiredRoles: REGISTRY_ROLES,
        requiredKinds: ["user"],
        feature: "delete registry",
    });
    if ("response" in guard) return guard.response;

    const { id } = await context.params;
    const deleted = await deleteRegistryConfig(id, guard.actor.orgId);
    if (!deleted) return NextResponse.json({ error: "not found" }, { status: 404 });

    audit({ actor: guard.actor, action: "registry.deleted", targetType: "registry", targetId: id, ip: getClientIp(req) });
    return NextResponse.json({ ok: true });
}
