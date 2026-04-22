import { NextRequest, NextResponse } from "next/server";
import { resolveRequestActor, actorHasAnyRole } from "@/lib/authz";
import { ROLE_ORG_OWNER, ADMIN_OVERRIDE } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const actor = await resolveRequestActor(req);
    if (!actor) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (!actorHasAnyRole(actor, [ROLE_ORG_OWNER, ADMIN_OVERRIDE])) {
        return NextResponse.json({ error: "forbidden — org owner only" }, { status: 403 });
    }

    const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);
    const pageSize = Math.min(parseInt(req.nextUrl.searchParams.get("page_size") || "50", 10), 200);
    const category = req.nextUrl.searchParams.get("category") || "";
    const action = req.nextUrl.searchParams.get("action") || "";
    const q = req.nextUrl.searchParams.get("q") || "";
    const severity = req.nextUrl.searchParams.get("severity") || "";
    const adminMode = req.nextUrl.searchParams.get("admin") === "true" && actorHasAnyRole(actor, [ADMIN_OVERRIDE]);
    const offset = (page - 1) * pageSize;

    let whereClause: string;
    const params: unknown[] = [];

    if (adminMode) {
        whereClause = "WHERE 1=1";
    } else {
        params.push(actor.orgId);
        whereClause = `WHERE org_id = $1::uuid`;
    }

    if (category) {
        params.push(category);
        whereClause += ` AND category = $${params.length}`;
    }
    if (action) {
        params.push(action);
        whereClause += ` AND action = $${params.length}`;
    }
    if (severity) {
        params.push(severity);
        whereClause += ` AND severity = $${params.length}`;
    }
    if (q) {
        params.push(q);
        whereClause += ` AND search_vector @@ plainto_tsquery('english', $${params.length})`;
    }

    const rows = await prisma.$queryRawUnsafe(
        `SELECT al.id::text as id, al.org_id, al.user_id, al.action, al.category,
                al.severity, al.target_type, al.target_id, al.detail, al.metadata,
                al.ip, al.created_at,
                u.email as user_email, u.name as user_name
         FROM audit_log al
         LEFT JOIN users u ON u.id = al.user_id
         ${whereClause}
         ORDER BY al.created_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        ...params, pageSize, offset
    );

    const countResult = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*)::int as total FROM audit_log al ${whereClause}`,
        ...params
    ) as Array<{ total: number }>;

    return NextResponse.json({
        items: rows,
        total: countResult[0]?.total || 0,
        page,
        page_size: pageSize,
    });
}
