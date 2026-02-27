import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getJob } from "@/lib/jobs";
import { actorHasAnyRole, forbiddenByRole, JOB_READ_ROLES, resolveRequestActor } from "@/lib/authz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parsePage(raw: string | null, fallback: number, min: number, max: number): number {
    const n = Number(raw || fallback);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.trunc(n)));
}

function breadcrumbs(parent: string): string[] {
    const clean = (parent || "").replace(/^\/+|\/+$/g, "");
    if (!clean) return [""];
    const parts = clean.split("/");
    const out = [""];
    for (let i = 0; i < parts.length; i++) {
        out.push(parts.slice(0, i + 1).join("/"));
    }
    return out;
}

function normalizeNullableBigInt(value: number | bigint | null): number | null {
    if (value == null) return null;
    if (typeof value === "bigint") return Number(value);
    return value;
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const actor = await resolveRequestActor(req);
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!actorHasAnyRole(actor, JOB_READ_ROLES)) {
        return forbiddenByRole(actor, JOB_READ_ROLES, "view job files");
    }

    const { id } = await context.params;
    const job = await getJob(id, actor.orgId);
    if (!job) return NextResponse.json({ error: "not found" }, { status: 404 });

    const page = parsePage(req.nextUrl.searchParams.get("page"), 1, 1, 100000);
    const pageSize = parsePage(req.nextUrl.searchParams.get("page_size"), 100, 1, 1000);
    const parent = (req.nextUrl.searchParams.get("parent") || "").replace(/^\/+|\/+$/g, "");
    const search = (req.nextUrl.searchParams.get("search") || "").trim();

    const where: string[] = ["job_id = $1::uuid"];
    const values: Array<string | number> = [id];

    if (search) {
      values.push(`%${search}%`);
      where.push(`path ILIKE $${values.length}`);
    } else {
      values.push(parent);
      where.push(`COALESCE(parent_path,'') = $${values.length}`);
    }

    const whereSql = where.join(" AND ");

    const totalRows = await prisma.$queryRawUnsafe<Array<{ total: number }>>(
      `SELECT COUNT(*)::int AS total FROM scan_files WHERE ${whereSql}`,
      ...values,
    );
    const total = Number(totalRows[0]?.total || 0);

    values.push(pageSize);
    values.push((page - 1) * pageSize);
    const limitIdx = values.length - 1;
    const offsetIdx = values.length;

    const rows = await prisma.$queryRawUnsafe<Array<{
      path: string;
      entry_type: string;
      size_bytes: number | bigint | null;
      mode: string | null;
      mtime: string | null;
      sha256: string | null;
      parent_path: string | null;
    }>>(
      `
SELECT path, entry_type, size_bytes, mode, mtime::text AS mtime, sha256, parent_path
FROM scan_files
WHERE ${whereSql}
ORDER BY entry_type DESC, path ASC
LIMIT $${limitIdx} OFFSET $${offsetIdx}
      `,
      ...values,
    );

    const entries = rows.map((row) => ({
      ...row,
      size_bytes: normalizeNullableBigInt(row.size_bytes),
    }));

    return NextResponse.json({
      entries,
      breadcrumbs: breadcrumbs(parent),
      page,
      page_size: pageSize,
      total,
      parent,
      search,
    });
}
