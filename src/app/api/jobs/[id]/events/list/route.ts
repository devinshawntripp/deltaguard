import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { actorHasAnyRole, forbiddenByRole, JOB_READ_ROLES, resolveRequestActor } from "@/lib/authz";
import { getJob } from "@/lib/jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EventRow = {
    id: number | bigint;
    ts: Date | string;
    stage: string;
    detail: string;
    pct: number | null;
};

type EventsListResponse = {
    items: Array<{
        id: number;
        ts: Date | string;
        stage: string;
        detail: string;
        pct: number | null;
    }>;
    total: number;
    next_cursor: number | null;
    has_more: boolean;
    page_size: number;
    order: "asc" | "desc";
};

function normalizePositiveInt(raw: string | null, fallback: number, min: number, max: number): number {
    const n = Number(raw ?? fallback);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.trunc(n)));
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const actor = await resolveRequestActor(req);
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!actorHasAnyRole(actor, JOB_READ_ROLES)) {
        return forbiddenByRole(actor, JOB_READ_ROLES, "view job events");
    }

    const { id } = await context.params;
    const job = await getJob(id, actor.orgId);
    if (!job) return NextResponse.json({ error: "not found" }, { status: 404 });

    try {
        const u = new URL(req.url);
        const order = u.searchParams.get("order") === "asc" ? "asc" : "desc";
        const pageSize = normalizePositiveInt(
            u.searchParams.get("page_size") || u.searchParams.get("limit"),
            500,
            1,
            5000,
        );
        const cursor = normalizePositiveInt(u.searchParams.get("cursor"), 0, 0, Number.MAX_SAFE_INTEGER);
        const hasCursor = cursor > 0;

        const totalRows = await prisma.$queryRaw<Array<{ total: bigint | number | string }>>`
            SELECT COUNT(*)::bigint AS total
            FROM scan_events
            WHERE job_id=${id}::uuid
        `;
        const total = Number(totalRows[0]?.total ?? 0);

        const whereParts: string[] = ["job_id = $1::uuid"];
        const values: Array<string | number> = [id];
        if (hasCursor) {
            values.push(cursor);
            whereParts.push(order === "asc" ? `id > $${values.length}::bigint` : `id < $${values.length}::bigint`);
        }

        values.push(pageSize + 1);
        const limitParam = values.length;

        const query = `
SELECT id, ts, stage, detail, pct
FROM scan_events
WHERE ${whereParts.join(" AND ")}
ORDER BY id ${order === "asc" ? "ASC" : "DESC"}
LIMIT $${limitParam}
        `;
        const rows = await prisma.$queryRawUnsafe<EventRow[]>(query, ...values);
        const hasMore = rows.length > pageSize;
        const sliced = hasMore ? rows.slice(0, pageSize) : rows;
        const items = sliced.map((row) => ({
            ...row,
            id: typeof row.id === "bigint" ? Number(row.id) : Number(row.id),
        }));
        const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

        const payload: EventsListResponse = {
            items,
            total,
            next_cursor: nextCursor,
            has_more: hasMore,
            page_size: pageSize,
            order,
        };
        const res = NextResponse.json(payload);
        if (Number.isFinite(total)) {
            res.headers.set("x-events-total", String(total));
        }
        return res;
    } catch (e: unknown) {
        return NextResponse.json({ error: String(e instanceof Error ? e.message : e) }, { status: 500 });
    }
}
