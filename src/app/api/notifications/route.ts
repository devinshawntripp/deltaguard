import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { ROLE_OPERATOR, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE } from "@/lib/roles";
import { prisma, ensurePlatformSchema } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NOTIFY_ROLES = [ROLE_OPERATOR, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE];
const VALID_TYPES = ["slack", "discord", "webhook", "email"];

export async function GET(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredRoles: NOTIFY_ROLES,
        requiredKinds: ["user", "api_key"],
        feature: "list notification channels",
    });
    if ("response" in guard) return guard.response;

    await ensurePlatformSchema();
    const rows = await prisma.$queryRaw<any[]>`
        SELECT id, org_id, channel_type, name, config, enabled, created_at
        FROM notification_channels
        WHERE org_id = ${guard.actor.orgId}::uuid
        ORDER BY created_at DESC
    `;

    // Redact sensitive fields from config
    const items = rows.map((r: any) => ({
        ...r,
        config: redactConfig(r.channel_type, r.config),
    }));

    return NextResponse.json({ items });
}

function redactConfig(type: string, config: any): any {
    if (!config) return {};
    const c = { ...config };
    if (type === "slack" || type === "discord") {
        if (c.webhook_url) {
            c.webhook_url = c.webhook_url.slice(0, 30) + "...";
        }
    }
    if (type === "webhook" && c.secret) {
        c.secret = "********";
    }
    return c;
}

export async function POST(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredRoles: NOTIFY_ROLES,
        requiredKinds: ["user", "api_key"],
        feature: "create notification channel",
    });
    if ("response" in guard) return guard.response;

    const body = await req.json();
    const channelType = String(body?.channel_type || "").trim();
    const name = String(body?.name || "").trim();
    const config = body?.config || {};

    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
    if (!VALID_TYPES.includes(channelType)) {
        return NextResponse.json({ error: `channel_type must be one of: ${VALID_TYPES.join(", ")}` }, { status: 400 });
    }

    // Validate config based on type
    if ((channelType === "slack" || channelType === "discord") && !config.webhook_url) {
        return NextResponse.json({ error: "webhook_url is required in config" }, { status: 400 });
    }
    if (channelType === "webhook" && !config.url) {
        return NextResponse.json({ error: "url is required in config" }, { status: 400 });
    }
    if (channelType === "email" && (!config.addresses || !Array.isArray(config.addresses) || !config.addresses.length)) {
        return NextResponse.json({ error: "addresses array is required in config" }, { status: 400 });
    }

    await ensurePlatformSchema();

    const configJson = JSON.stringify(config);
    const rows = await prisma.$queryRaw<any[]>`
        INSERT INTO notification_channels (org_id, channel_type, name, config)
        VALUES (${guard.actor.orgId}::uuid, ${channelType}, ${name}, ${configJson}::jsonb)
        RETURNING *
    `;

    return NextResponse.json(rows[0], { status: 201 });
}
