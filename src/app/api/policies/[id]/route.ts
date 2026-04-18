import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { ROLE_POLICY_ADMIN, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE, ROLE_VIEWER, ROLE_ANALYST, ROLE_OPERATOR } from "@/lib/roles";
import { prisma, ensurePlatformSchema } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const READ_ROLES = [ROLE_VIEWER, ROLE_ANALYST, ROLE_OPERATOR, ROLE_POLICY_ADMIN, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE];
const WRITE_ROLES = [ROLE_POLICY_ADMIN, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE];

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: RouteContext) {
    const guard = await requireRequestActor(req, {
        requiredRoles: READ_ROLES,
        requiredKinds: ["user", "api_key"],
        feature: "view scan policy",
    });
    if ("response" in guard) return guard.response;

    const { id } = await ctx.params;
    await ensurePlatformSchema();

    const rows = await prisma.$queryRaw<any[]>`
        SELECT id, org_id, name, enabled, rules, created_at, updated_at
        FROM scan_policies
        WHERE id = ${id}::uuid AND org_id = ${guard.actor.orgId}::uuid
        LIMIT 1
    `;
    if (rows.length === 0) {
        return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
    const guard = await requireRequestActor(req, {
        requiredRoles: WRITE_ROLES,
        requiredKinds: ["user", "api_key"],
        feature: "update scan policy",
    });
    if ("response" in guard) return guard.response;

    const { id } = await ctx.params;
    const body = await req.json();

    await ensurePlatformSchema();

    // Check policy exists and belongs to org
    const existing = await prisma.$queryRaw<any[]>`
        SELECT id FROM scan_policies
        WHERE id = ${id}::uuid AND org_id = ${guard.actor.orgId}::uuid
        LIMIT 1
    `;
    if (existing.length === 0) {
        return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    const sets: string[] = [];
    const values: unknown[] = [];

    if (body.name !== undefined) {
        const name = String(body.name).trim();
        if (!name) return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
        sets.push("name");
        values.push(name);
    }

    if (body.enabled !== undefined) {
        sets.push("enabled");
        values.push(Boolean(body.enabled));
    }

    if (body.rules !== undefined) {
        if (!Array.isArray(body.rules)) {
            return NextResponse.json({ error: "rules must be an array" }, { status: 400 });
        }
        const validTypes = ["severity_threshold", "license_blocklist", "package_blocklist", "min_scan_age"];
        const validActions = ["fail", "warn"];
        for (const rule of body.rules) {
            if (!validTypes.includes(rule.type)) {
                return NextResponse.json({ error: `Invalid rule type: ${rule.type}` }, { status: 400 });
            }
            if (!validActions.includes(rule.action)) {
                return NextResponse.json({ error: `Invalid action: ${rule.action}` }, { status: 400 });
            }
        }
        sets.push("rules");
        values.push(body.rules);
    }

    if (sets.length === 0) {
        return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    // Build update dynamically using individual fields
    if (sets.includes("name") && sets.includes("enabled") && sets.includes("rules")) {
        const rulesJson = JSON.stringify(values[sets.indexOf("rules")]);
        const rows = await prisma.$queryRaw<any[]>`
            UPDATE scan_policies
            SET name = ${values[sets.indexOf("name")] as string},
                enabled = ${values[sets.indexOf("enabled")] as boolean},
                rules = ${rulesJson}::jsonb,
                updated_at = NOW()
            WHERE id = ${id}::uuid AND org_id = ${guard.actor.orgId}::uuid
            RETURNING id, org_id, name, enabled, rules, created_at, updated_at
        `;
        return NextResponse.json(rows[0]);
    }
    if (sets.includes("name") && sets.includes("enabled")) {
        const rows = await prisma.$queryRaw<any[]>`
            UPDATE scan_policies
            SET name = ${values[sets.indexOf("name")] as string},
                enabled = ${values[sets.indexOf("enabled")] as boolean},
                updated_at = NOW()
            WHERE id = ${id}::uuid AND org_id = ${guard.actor.orgId}::uuid
            RETURNING id, org_id, name, enabled, rules, created_at, updated_at
        `;
        return NextResponse.json(rows[0]);
    }
    if (sets.includes("name") && sets.includes("rules")) {
        const rulesJson = JSON.stringify(values[sets.indexOf("rules")]);
        const rows = await prisma.$queryRaw<any[]>`
            UPDATE scan_policies
            SET name = ${values[sets.indexOf("name")] as string},
                rules = ${rulesJson}::jsonb,
                updated_at = NOW()
            WHERE id = ${id}::uuid AND org_id = ${guard.actor.orgId}::uuid
            RETURNING id, org_id, name, enabled, rules, created_at, updated_at
        `;
        return NextResponse.json(rows[0]);
    }
    if (sets.includes("enabled") && sets.includes("rules")) {
        const rulesJson = JSON.stringify(values[sets.indexOf("rules")]);
        const rows = await prisma.$queryRaw<any[]>`
            UPDATE scan_policies
            SET enabled = ${values[sets.indexOf("enabled")] as boolean},
                rules = ${rulesJson}::jsonb,
                updated_at = NOW()
            WHERE id = ${id}::uuid AND org_id = ${guard.actor.orgId}::uuid
            RETURNING id, org_id, name, enabled, rules, created_at, updated_at
        `;
        return NextResponse.json(rows[0]);
    }
    if (sets.includes("name")) {
        const rows = await prisma.$queryRaw<any[]>`
            UPDATE scan_policies
            SET name = ${values[sets.indexOf("name")] as string}, updated_at = NOW()
            WHERE id = ${id}::uuid AND org_id = ${guard.actor.orgId}::uuid
            RETURNING id, org_id, name, enabled, rules, created_at, updated_at
        `;
        return NextResponse.json(rows[0]);
    }
    if (sets.includes("enabled")) {
        const rows = await prisma.$queryRaw<any[]>`
            UPDATE scan_policies
            SET enabled = ${values[sets.indexOf("enabled")] as boolean}, updated_at = NOW()
            WHERE id = ${id}::uuid AND org_id = ${guard.actor.orgId}::uuid
            RETURNING id, org_id, name, enabled, rules, created_at, updated_at
        `;
        return NextResponse.json(rows[0]);
    }
    if (sets.includes("rules")) {
        const rulesJson = JSON.stringify(values[sets.indexOf("rules")]);
        const rows = await prisma.$queryRaw<any[]>`
            UPDATE scan_policies
            SET rules = ${rulesJson}::jsonb, updated_at = NOW()
            WHERE id = ${id}::uuid AND org_id = ${guard.actor.orgId}::uuid
            RETURNING id, org_id, name, enabled, rules, created_at, updated_at
        `;
        return NextResponse.json(rows[0]);
    }

    return NextResponse.json({ error: "Unexpected update state" }, { status: 500 });
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
    const guard = await requireRequestActor(req, {
        requiredRoles: WRITE_ROLES,
        requiredKinds: ["user", "api_key"],
        feature: "delete scan policy",
    });
    if ("response" in guard) return guard.response;

    const { id } = await ctx.params;
    await ensurePlatformSchema();

    const rows = await prisma.$queryRaw<any[]>`
        DELETE FROM scan_policies
        WHERE id = ${id}::uuid AND org_id = ${guard.actor.orgId}::uuid
        RETURNING id
    `;
    if (rows.length === 0) {
        return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }
    return NextResponse.json({ deleted: true, id: rows[0].id });
}
