import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { ROLE_OPERATOR, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE } from "@/lib/roles";
import { prisma, ensurePlatformSchema } from "@/lib/prisma";
import { sendTestNotification, type NotificationChannel } from "@/lib/notifications";
import { audit, getClientIp } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NOTIFY_ROLES = [ROLE_OPERATOR, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE];

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: RouteContext) {
    const guard = await requireRequestActor(req, {
        requiredRoles: NOTIFY_ROLES,
        requiredKinds: ["user", "api_key"],
        feature: "test notification channel",
    });
    if ("response" in guard) return guard.response;

    const { id } = await ctx.params;
    await ensurePlatformSchema();

    const rows = await prisma.$queryRaw<NotificationChannel[]>`
        SELECT id, org_id, channel_type, name, config, enabled, created_at::text
        FROM notification_channels
        WHERE id = ${id}::uuid AND org_id = ${guard.actor.orgId}::uuid
    `;
    if (!rows.length) {
        return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    try {
        await sendTestNotification(rows[0]);
        audit({ actor: guard.actor, action: "notification.test_sent", targetType: "notification_channel", targetId: id, ip: getClientIp(req) });
        return NextResponse.json({ ok: true, message: "Test notification sent" });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ ok: false, error: msg }, { status: 502 });
    }
}
