import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getJob } from "@/lib/jobs";
import { actorHasAnyRole, forbiddenByRole, JOB_READ_ROLES, resolveRequestActor } from "@/lib/authz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PackageRow = {
  name: string;
  ecosystem: string;
  version: string;
  source_kind: string;
  source_path: string | null;
  confidence_tier: string;
  evidence_source: string;
};

type PackagesResponse = {
  items: PackageRow[];
  page: number;
  page_size: number;
  total: number;
  search: string;
  ecosystem: string;
  sort: string;
  order: "asc" | "desc";
};

const SORT_COLUMNS: Record<string, string> = {
  name: "name",
  ecosystem: "ecosystem",
  version: "version",
  source_kind: "source_kind",
  source_path: "source_path",
  tier: "confidence_tier",
  evidence: "evidence_source",
  created: "id",
};

function parsePage(raw: string | null, fallback: number, min: number, max: number): number {
  const n = Number(raw || fallback);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

function isMissingTableError(err: unknown): boolean {
  const msg = String(err instanceof Error ? err.message : err);
  return /scan_packages|relation .*scan_packages.* does not exist|42P01/i.test(msg);
}

async function listFromFindingsFallback(
  id: string,
  page: number,
  pageSize: number,
  search: string,
  ecosystem: string,
  sortColumn: string,
  sortOrder: "ASC" | "DESC",
): Promise<PackagesResponse> {
  const where: string[] = ["job_id = $1::uuid", "package_name IS NOT NULL", "package_version IS NOT NULL"];
  const values: Array<string | number> = [id];

  if (ecosystem) {
    values.push(ecosystem);
    where.push(`LOWER(COALESCE(package_ecosystem, 'unknown')) = LOWER($${values.length})`);
  }

  if (search) {
    values.push(`%${search}%`);
    const idx = values.length;
    where.push(`(
  package_name ILIKE $${idx}
  OR package_version ILIKE $${idx}
  OR COALESCE(package_ecosystem,'') ILIKE $${idx}
)`);
  }

  const whereSql = where.join(" AND ");

  const totalRows = await prisma.$queryRawUnsafe<Array<{ total: number }>>(
    `
SELECT COUNT(*)::int AS total
FROM (
  SELECT package_name, COALESCE(package_ecosystem,'unknown') AS ecosystem, package_version
  FROM scan_findings
  WHERE ${whereSql}
  GROUP BY package_name, COALESCE(package_ecosystem,'unknown'), package_version
) p
    `,
    ...values,
  );
  const total = Number(totalRows[0]?.total || 0);

  values.push(pageSize);
  values.push((page - 1) * pageSize);
  const limitIdx = values.length - 1;
  const offsetIdx = values.length;

  const rows = await prisma.$queryRawUnsafe<Array<PackageRow>>(
    `
SELECT
  package_name AS name,
  COALESCE(package_ecosystem, 'unknown') AS ecosystem,
  package_version AS version,
  'derived_from_findings'::text AS source_kind,
  NULL::text AS source_path,
  'confirmed_installed'::text AS confidence_tier,
  'installed_db'::text AS evidence_source
FROM scan_findings
WHERE ${whereSql}
GROUP BY package_name, COALESCE(package_ecosystem, 'unknown'), package_version
ORDER BY ${sortColumn} ${sortOrder}, name ASC
LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `,
    ...values,
  );

  return {
    items: rows,
    page,
    page_size: pageSize,
    total,
    search,
    ecosystem,
    sort: sortColumn,
    order: sortOrder.toLowerCase() as "asc" | "desc",
  };
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const actor = await resolveRequestActor(req);
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!actorHasAnyRole(actor, JOB_READ_ROLES)) {
    return forbiddenByRole(actor, JOB_READ_ROLES, "view job packages");
  }

  const { id } = await context.params;
  const job = await getJob(id, actor.orgId);
  if (!job) return NextResponse.json({ error: "not found" }, { status: 404 });

  const page = parsePage(req.nextUrl.searchParams.get("page"), 1, 1, 100000);
  const pageSize = parsePage(req.nextUrl.searchParams.get("page_size"), 100, 1, 1000);
  const search = (req.nextUrl.searchParams.get("search") || "").trim();
  const ecosystem = (req.nextUrl.searchParams.get("ecosystem") || "").trim();
  const sortParam = (req.nextUrl.searchParams.get("sort") || "name").trim();
  const orderParam = (req.nextUrl.searchParams.get("order") || "asc").trim().toLowerCase();

  const sortColumn = SORT_COLUMNS[sortParam] || "name";
  const sortOrder = orderParam === "desc" ? "DESC" : "ASC";
  const responseOrder: "asc" | "desc" = sortOrder === "DESC" ? "desc" : "asc";

  const where: string[] = ["job_id = $1::uuid"];
  const values: Array<string | number> = [id];

  if (ecosystem) {
    values.push(ecosystem);
    where.push(`LOWER(ecosystem) = LOWER($${values.length})`);
  }

  if (search) {
    values.push(`%${search}%`);
    const n = values.length;
    where.push(`(
  name ILIKE $${n}
  OR version ILIKE $${n}
  OR source_kind ILIKE $${n}
  OR COALESCE(source_path,'') ILIKE $${n}
  OR ecosystem ILIKE $${n}
)`);
  }

  const whereSql = where.join(" AND ");

  try {
    const totalRows = await prisma.$queryRawUnsafe<Array<{ total: number }>>(
      `
WITH dedup AS (
  SELECT
    MIN(id) AS id,
    name,
    ecosystem,
    version,
    source_kind,
    COALESCE(source_path, '') AS source_path,
    confidence_tier,
    evidence_source
  FROM scan_packages
  WHERE ${whereSql}
  GROUP BY
    name,
    ecosystem,
    version,
    source_kind,
    COALESCE(source_path, ''),
    confidence_tier,
    evidence_source
)
SELECT COUNT(*)::int AS total
FROM dedup
      `,
      ...values,
    );
    const total = Number(totalRows[0]?.total || 0);
    if (total === 0) {
      const fallback = await listFromFindingsFallback(
        id,
        page,
        pageSize,
        search,
        ecosystem,
        sortColumn,
        sortOrder,
      );
      return NextResponse.json(fallback);
    }

    values.push(pageSize);
    values.push((page - 1) * pageSize);
    const limitIdx = values.length - 1;
    const offsetIdx = values.length;

    const rows = await prisma.$queryRawUnsafe<PackageRow[]>(
      `
WITH dedup AS (
  SELECT
    MIN(id) AS id,
    name,
    ecosystem,
    version,
    source_kind,
    COALESCE(source_path, '') AS source_path,
    confidence_tier,
    evidence_source
  FROM scan_packages
  WHERE ${whereSql}
  GROUP BY
    name,
    ecosystem,
    version,
    source_kind,
    COALESCE(source_path, ''),
    confidence_tier,
    evidence_source
)
SELECT
  name,
  ecosystem,
  version,
  source_kind,
  NULLIF(source_path, '') AS source_path,
  confidence_tier,
  evidence_source
FROM dedup
ORDER BY ${sortColumn} ${sortOrder}, name ASC
LIMIT $${limitIdx} OFFSET $${offsetIdx}
      `,
      ...values,
    );

    return NextResponse.json({
      items: rows,
      page,
      page_size: pageSize,
      total,
      search,
      ecosystem,
      sort: sortParam,
      order: responseOrder,
    } satisfies PackagesResponse);
  } catch (err: unknown) {
    if (!isMissingTableError(err)) {
      return NextResponse.json({ error: String(err instanceof Error ? err.message : err) }, { status: 500 });
    }

    const fallback = await listFromFindingsFallback(
      id,
      page,
      pageSize,
      search,
      ecosystem,
      sortColumn,
      sortOrder,
    );
    return NextResponse.json(fallback);
  }
}
