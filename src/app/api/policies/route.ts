import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { ROLE_POLICY_ADMIN, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE, ROLE_VIEWER, ROLE_ANALYST, ROLE_OPERATOR } from "@/lib/roles";
import { prisma, ensurePlatformSchema } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const READ_ROLES = [ROLE_VIEWER, ROLE_ANALYST, ROLE_OPERATOR, ROLE_POLICY_ADMIN, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE];
const WRITE_ROLES = [ROLE_POLICY_ADMIN, ROLE_SCAN_ADMIN, ROLE_ORG_OWNER, ADMIN_OVERRIDE];

export async function GET(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredRoles: READ_ROLES,
        requiredKinds: ["user", "api_key"],
        feature: "list scan policies",
    });
    if ("response" in guard) return guard.response;

    await ensurePlatformSchema();
    const rows = await prisma.$queryRaw<any[]>`
        SELECT id, org_id, name, enabled, rules, created_at, updated_at
        FROM scan_policies
        WHERE org_id = ${guard.actor.orgId}::uuid
        ORDER BY created_at DESC
    `;
    return NextResponse.json({ items: rows });
}

export async function POST(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredRoles: WRITE_ROLES,
        requiredKinds: ["user", "api_key"],
        feature: "create scan policy",
    });
    if ("response" in guard) return guard.response;

    const body = await req.json();
    const name = String(body?.name || "").trim();
    const rules = body?.rules;

    if (!name) {
        return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (!Array.isArray(rules) || rules.length === 0) {
        return NextResponse.json({ error: "rules must be a non-empty array" }, { status: 400 });
    }

    const validTypes = ["severity_threshold", "license_blocklist", "package_blocklist", "min_scan_age"];
    const validActions = ["fail", "warn"];
    for (const rule of rules) {
        if (!validTypes.includes(rule.type)) {
            return NextResponse.json({ error: `Invalid rule type: ${rule.type}` }, { status: 400 });
        }
        if (!validActions.includes(rule.action)) {
            return NextResponse.json({ error: `Invalid action: ${rule.action}` }, { status: 400 });
        }
    }

    await ensurePlatformSchema();
    const rulesJson = JSON.stringify(rules);
    const rows = await prisma.$queryRaw<any[]>`
        INSERT INTO scan_policies (org_id, name, rules)
        VALUES (${guard.actor.orgId}::uuid, ${name}, ${rulesJson}::jsonb)
        RETURNING id, org_id, name, enabled, rules, created_at, updated_at
    `;
    return NextResponse.json(rows[0], { status: 201 });
}
