import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { ROLE_OPERATOR, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE } from "@/lib/roles";
import { prisma, ensurePlatformSchema } from "@/lib/prisma";
import { computeNextRun, isValidCron } from "@/lib/scheduler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCHEDULE_ROLES = [ROLE_OPERATOR, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE];

export async function GET(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredRoles: SCHEDULE_ROLES,
        requiredKinds: ["user", "api_key"],
        feature: "list scan schedules",
    });
    if ("response" in guard) return guard.response;

    await ensurePlatformSchema();
    const rows = await prisma.$queryRaw<any[]>`
        SELECT id, org_id, registry_config_id, image_ref, cron_expression, scan_mode,
               enabled, last_run_at, next_run_at, created_at, updated_at
        FROM scan_schedules
        WHERE org_id = ${guard.actor.orgId}::uuid
        ORDER BY created_at DESC
    `;
    return NextResponse.json({ items: rows });
}

export async function POST(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredRoles: SCHEDULE_ROLES,
        requiredKinds: ["user", "api_key"],
        feature: "create scan schedule",
    });
    if ("response" in guard) return guard.response;

    const body = await req.json();
    const imageRef = String(body?.image_ref || "").trim();
    const cronExpression = String(body?.cron_expression || "0 0 * * *").trim();
    const scanMode = String(body?.scan_mode || "light").trim();
    const registryConfigId = body?.registry_config_id ? String(body.registry_config_id).trim() : null;

    if (!imageRef) {
        return NextResponse.json({ error: "image_ref is required" }, { status: 400 });
    }
    if (!isValidCron(cronExpression)) {
        return NextResponse.json({ error: "Invalid cron expression" }, { status: 400 });
    }
    if (!["light", "deep"].includes(scanMode)) {
        return NextResponse.json({ error: "scan_mode must be light or deep" }, { status: 400 });
    }

    await ensurePlatformSchema();

    // Validate registry config belongs to org if provided
    if (registryConfigId) {
        const regRows = await prisma.$queryRaw<any[]>`
            SELECT id FROM registry_configs WHERE id = ${registryConfigId}::uuid AND org_id = ${guard.actor.orgId}::uuid
        `;
        if (!regRows.length) {
            return NextResponse.json({ error: "Registry config not found" }, { status: 404 });
        }
    }

    const nextRunAt = computeNextRun(cronExpression);

    const rows = await prisma.$queryRaw<any[]>`
        INSERT INTO scan_schedules (org_id, registry_config_id, image_ref, cron_expression, scan_mode, next_run_at)
        VALUES (
            ${guard.actor.orgId}::uuid,
            ${registryConfigId}::uuid,
            ${imageRef},
            ${cronExpression},
            ${scanMode},
            ${nextRunAt}
        )
        RETURNING *
    `;

    return NextResponse.json(rows[0], { status: 201 });
}
