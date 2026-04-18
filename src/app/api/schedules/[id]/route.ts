import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { ROLE_OPERATOR, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE } from "@/lib/roles";
import { prisma, ensurePlatformSchema } from "@/lib/prisma";
import { computeNextRun, isValidCron } from "@/lib/scheduler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCHEDULE_ROLES = [ROLE_OPERATOR, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE];

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: RouteContext) {
    const guard = await requireRequestActor(req, {
        requiredRoles: SCHEDULE_ROLES,
        requiredKinds: ["user", "api_key"],
        feature: "view scan schedule",
    });
    if ("response" in guard) return guard.response;

    const { id } = await ctx.params;
    await ensurePlatformSchema();

    const rows = await prisma.$queryRaw<any[]>`
        SELECT id, org_id, registry_config_id, image_ref, cron_expression, scan_mode,
               enabled, last_run_at, next_run_at, created_at, updated_at
        FROM scan_schedules
        WHERE id = ${id}::uuid AND org_id = ${guard.actor.orgId}::uuid
    `;

    if (!rows.length) {
        return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
    const guard = await requireRequestActor(req, {
        requiredRoles: SCHEDULE_ROLES,
        requiredKinds: ["user", "api_key"],
        feature: "update scan schedule",
    });
    if ("response" in guard) return guard.response;

    const { id } = await ctx.params;
    const body = await req.json();
    await ensurePlatformSchema();

    // Verify ownership
    const existing = await prisma.$queryRaw<any[]>`
        SELECT id FROM scan_schedules WHERE id = ${id}::uuid AND org_id = ${guard.actor.orgId}::uuid
    `;
    if (!existing.length) {
        return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    const sets: string[] = [];
    const values: any[] = [];

    if (body.enabled !== undefined) {
        sets.push("enabled = $" + (values.length + 1));
        values.push(Boolean(body.enabled));
    }
    if (body.cron_expression !== undefined) {
        const cron = String(body.cron_expression).trim();
        if (!isValidCron(cron)) {
            return NextResponse.json({ error: "Invalid cron expression" }, { status: 400 });
        }
        sets.push("cron_expression = $" + (values.length + 1));
        values.push(cron);
        const nextRun = computeNextRun(cron);
        sets.push("next_run_at = $" + (values.length + 1));
        values.push(nextRun);
    }
    if (body.image_ref !== undefined) {
        const imageRef = String(body.image_ref).trim();
        if (!imageRef) return NextResponse.json({ error: "image_ref cannot be empty" }, { status: 400 });
        sets.push("image_ref = $" + (values.length + 1));
        values.push(imageRef);
    }
    if (body.scan_mode !== undefined) {
        const mode = String(body.scan_mode).trim();
        if (!["light", "deep"].includes(mode)) {
            return NextResponse.json({ error: "scan_mode must be light or deep" }, { status: 400 });
        }
        sets.push("scan_mode = $" + (values.length + 1));
        values.push(mode);
    }

    if (!sets.length) {
        return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    sets.push("updated_at = NOW()");

    // Build dynamic update — Prisma raw doesn't support dynamic column sets easily,
    // so we use $executeRawUnsafe with parameterized values
    const sql = `UPDATE scan_schedules SET ${sets.join(", ")} WHERE id = $${values.length + 1}::uuid RETURNING *`;
    values.push(id);

    // Execute the update
    await prisma.$executeRawUnsafe(sql, ...values);

    // Fetch updated row
    const updated = await prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM scan_schedules WHERE id = $1::uuid`,
        id,
    );

    return NextResponse.json(updated[0]);
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
    const guard = await requireRequestActor(req, {
        requiredRoles: SCHEDULE_ROLES,
        requiredKinds: ["user", "api_key"],
        feature: "delete scan schedule",
    });
    if ("response" in guard) return guard.response;

    const { id } = await ctx.params;
    await ensurePlatformSchema();

    const existing = await prisma.$queryRaw<any[]>`
        SELECT id FROM scan_schedules WHERE id = ${id}::uuid AND org_id = ${guard.actor.orgId}::uuid
    `;
    if (!existing.length) {
        return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    await prisma.$executeRaw`DELETE FROM scan_schedules WHERE id = ${id}::uuid`;
    return NextResponse.json({ ok: true });
}
