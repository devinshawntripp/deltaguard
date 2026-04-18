import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { ROLE_OPERATOR, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE } from "@/lib/roles";
import { prisma, ensurePlatformSchema } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NOTIFY_ROLES = [ROLE_OPERATOR, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE];

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: RouteContext) {
    const guard = await requireRequestActor(req, {
        requiredRoles: NOTIFY_ROLES,
        requiredKinds: ["user", "api_key"],
        feature: "update notification channel",
    });
    if ("response" in guard) return guard.response;

    const { id } = await ctx.params;
    const body = await req.json();
    await ensurePlatformSchema();

    const existing = await prisma.$queryRaw<any[]>`
        SELECT id FROM notification_channels WHERE id = ${id}::uuid AND org_id = ${guard.actor.orgId}::uuid
    `;
    if (!existing.length) {
        return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    if (body.enabled !== undefined) {
        await prisma.$executeRaw`
            UPDATE notification_channels SET enabled = ${Boolean(body.enabled)} WHERE id = ${id}::uuid
        `;
    }
    if (body.name !== undefined) {
        const name = String(body.name).trim();
        if (!name) return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
        await prisma.$executeRaw`
            UPDATE notification_channels SET name = ${name} WHERE id = ${id}::uuid
        `;
    }
    if (body.config !== undefined) {
        const configJson = JSON.stringify(body.config);
        await prisma.$executeRaw`
            UPDATE notification_channels SET config = ${configJson}::jsonb WHERE id = ${id}::uuid
        `;
    }

    const updated = await prisma.$queryRaw<any[]>`
        SELECT * FROM notification_channels WHERE id = ${id}::uuid
    `;
    return NextResponse.json(updated[0]);
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
    const guard = await requireRequestActor(req, {
        requiredRoles: NOTIFY_ROLES,
        requiredKinds: ["user", "api_key"],
        feature: "delete notification channel",
    });
    if ("response" in guard) return guard.response;

    const { id } = await ctx.params;
    await ensurePlatformSchema();

    const existing = await prisma.$queryRaw<any[]>`
        SELECT id FROM notification_channels WHERE id = ${id}::uuid AND org_id = ${guard.actor.orgId}::uuid
    `;
    if (!existing.length) {
        return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    await prisma.$executeRaw`DELETE FROM notification_channels WHERE id = ${id}::uuid`;
    return NextResponse.json({ ok: true });
}
