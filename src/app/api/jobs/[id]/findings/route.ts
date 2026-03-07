import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { presignGet } from "@/lib/s3";
import { getJob } from "@/lib/jobs";
import { actorHasAnyRole, forbiddenByRole, JOB_READ_ROLES, resolveRequestActor } from "@/lib/authz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FindingsItem = {
    id: string;
    severity: string | null;
    confidence_tier: string;
    evidence_source: string;
    accuracy_note: string | null;
    fixed: boolean | null;
    fixed_in: string | null;
    recommendation: string | null;
    cvss: { base?: number; vector?: string } | null;
    description: string | null;
    package: { name?: string; ecosystem?: string; version?: string } | null;
    source_ids: string[];
    references: Array<{ type: string; url: string }>;
    epss_score: number | null;
    epss_percentile: number | null;
    in_kev: boolean | null;
};

type FindingsResponse = {
    items: FindingsItem[];
    summary: Record<string, number>;
    page: number;
    page_size: number;
    total: number;
    scan_status: string | null;
    inventory_status: string | null;
    inventory_reason: string | null;
    error?: string;
};

const SORT_COLUMNS: Record<string, string> = {
    id: "finding_id",
    severity: "severity",
    cvss: "cvss_base",
    tier: "confidence_tier",
    fixed: "fixed",
    package: "package_name",
    created: "id",
    epss: "(raw->>'epss_score')::float",
};

function parsePage(raw: string | null, fallback: number, min: number, max: number): number {
    const n = Number(raw || fallback);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.trunc(n)));
}

function boolFilter(raw: string | null): boolean | null {
    if (!raw) return null;
    const v = raw.toLowerCase();
    if (v === "true" || v === "1" || v === "yes") return true;
    if (v === "false" || v === "0" || v === "no") return false;
    return null;
}

function emptyResponse(page: number, pageSize: number): FindingsResponse {
    return {
        items: [],
        summary: {
            total_findings: 0,
            confirmed_total_findings: 0,
            heuristic_total_findings: 0,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            confirmed_critical: 0,
            confirmed_high: 0,
            confirmed_medium: 0,
            confirmed_low: 0,
            heuristic_critical: 0,
            heuristic_high: 0,
            heuristic_medium: 0,
            heuristic_low: 0,
        },
        page,
        page_size: pageSize,
        total: 0,
        scan_status: null,
        inventory_status: null,
        inventory_reason: null,
    };
}

async function parseS3FindingsFallback(job: {
    report_bucket: string | null;
    report_key: string | null;
    scan_status: string | null;
    inventory_status: string | null;
    inventory_reason: string | null;
}, page: number, pageSize: number): Promise<FindingsResponse> {
    if (!job.report_bucket || !job.report_key) {
        return emptyResponse(page, pageSize);
    }

    const url = await presignGet({ bucket: String(job.report_bucket), key: String(job.report_key) });
    const res = await fetch(url.url, { cache: "no-store" });
    if (!res.ok) return emptyResponse(page, pageSize);

    const text = await res.text();
    if (!text.trim()) return emptyResponse(page, pageSize);

    // Detect format: if first non-empty line starts with {"type": it's NDJSON
    const firstLine = text.trim().split('\n')[0];
    let allItems: FindingsItem[];
    let summary: Record<string, number>;
    let scanStatus: string | null = null;
    let inventoryStatus: string | null = null;
    let inventoryReason: string | null = null;

    if (firstLine.includes('"type"')) {
        // NDJSON format
        const lines = text.trim().split('\n');
        allItems = [];
        summary = emptyResponse(page, pageSize).summary;
        for (const line of lines) {
            if (!line.trim()) continue;
            try {
                const obj = JSON.parse(line) as Record<string, unknown>;
                if (obj.type === 'finding' && obj.data) {
                    allItems.push(obj.data as FindingsItem);
                } else if (obj.type === 'summary' && obj.data) {
                    summary = obj.data as Record<string, number>;
                } else if (obj.type === 'metadata') {
                    scanStatus = typeof obj.scan_status === 'string' ? obj.scan_status : null;
                    inventoryStatus = typeof obj.inventory_status === 'string' ? obj.inventory_status : null;
                    inventoryReason = typeof obj.inventory_reason === 'string' ? obj.inventory_reason : null;
                }
            } catch { /* skip malformed lines */ }
        }
    } else {
        // Legacy JSON format
        const parsed = JSON.parse(text) as Record<string, unknown>;
        allItems = Array.isArray(parsed.findings) ? parsed.findings as FindingsItem[] : [];
        summary = (parsed.summary && typeof parsed.summary === "object")
            ? parsed.summary as Record<string, number>
            : emptyResponse(page, pageSize).summary;
        scanStatus = typeof parsed.scan_status === "string" ? parsed.scan_status : null;
        inventoryStatus = typeof parsed.inventory_status === "string" ? parsed.inventory_status : null;
        inventoryReason = typeof parsed.inventory_reason === "string" ? parsed.inventory_reason : null;
    }

    const nonFixed = allItems.filter((f) => f && f.fixed !== true);
    const total = nonFixed.length;
    const offset = (page - 1) * pageSize;
    const items = nonFixed.slice(offset, offset + pageSize);

    return {
        items,
        summary,
        page,
        page_size: pageSize,
        total,
        scan_status: scanStatus ?? job.scan_status,
        inventory_status: inventoryStatus ?? job.inventory_status,
        inventory_reason: inventoryReason ?? job.inventory_reason,
    };
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const actor = await resolveRequestActor(req);
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!actorHasAnyRole(actor, JOB_READ_ROLES)) {
        return forbiddenByRole(actor, JOB_READ_ROLES, "view findings");
    }

    const { id } = await context.params;
    const page = parsePage(req.nextUrl.searchParams.get("page"), 1, 1, 100000);
    const pageSize = parsePage(req.nextUrl.searchParams.get("page_size"), 50, 1, 500);
    const severity = (req.nextUrl.searchParams.get("severity") || "").trim();
    const tier = (req.nextUrl.searchParams.get("tier") || "all").trim().toLowerCase();
    const fixedFilter = boolFilter(req.nextUrl.searchParams.get("fixed"));
    const search = (req.nextUrl.searchParams.get("search") || "").trim();
    const sortParam = (req.nextUrl.searchParams.get("sort") || "severity").trim();
    const orderParam = (req.nextUrl.searchParams.get("order") || "desc").trim().toLowerCase();

    const sortColumn = SORT_COLUMNS[sortParam] || "severity";
    const sortOrder = orderParam === "asc" ? "ASC" : "DESC";
    const sortExpr = sortColumn === "severity"
        ? `
CASE severity
  WHEN 'CRITICAL' THEN 4
  WHEN 'HIGH' THEN 3
  WHEN 'MEDIUM' THEN 2
  WHEN 'LOW' THEN 1
  ELSE 0
END
        `
        : sortColumn;

    try {
        const job = await getJob(id, actor.orgId);
        if (!job) return NextResponse.json({ error: "not found" }, { status: 404 });

        const where: string[] = ["job_id = $1::uuid"];
        const values: Array<string | number | boolean> = [id];

        if (severity) {
            values.push(severity.toUpperCase());
            where.push(`severity = $${values.length}`);
        }

        if (tier === "confirmed") {
            where.push(`confidence_tier <> 'heuristic_unverified'`);
        } else if (tier === "heuristic") {
            where.push(`confidence_tier = 'heuristic_unverified'`);
        }

        if (fixedFilter != null) {
            values.push(fixedFilter);
            where.push(`fixed = $${values.length}`);
        }

        if (search) {
            values.push(`%${search}%`);
            const n = values.length;
            where.push(`(
  finding_id ILIKE $${n}
  OR COALESCE(package_name,'') ILIKE $${n}
  OR COALESCE(package_version,'') ILIKE $${n}
  OR COALESCE(description,'') ILIKE $${n}
  OR COALESCE(recommendation,'') ILIKE $${n}
)`);
        }

        const whereSql = where.join(" AND ");

        const countRows = await prisma.$queryRawUnsafe<Array<{ total: number }>>(
            `SELECT COUNT(*)::int AS total FROM scan_findings WHERE ${whereSql}`,
            ...values,
        );
        const total = Number(countRows[0]?.total || 0);

        if (total === 0) {
            // Check if filters narrowed the result to zero — if the job has
            // findings in DB but the current filter excludes them all, return
            // empty instead of falling back to S3 (which ignores filters).
            const hasFilters = tier !== "all" || !!severity || fixedFilter != null || !!search;
            if (hasFilters) {
                const baseCount = await prisma.$queryRawUnsafe<Array<{ cnt: number }>>(
                    `SELECT COUNT(*)::int AS cnt FROM scan_findings WHERE job_id = $1::uuid`,
                    id,
                );
                if (Number(baseCount[0]?.cnt || 0) > 0) {
                    return NextResponse.json(emptyResponse(page, pageSize));
                }
            }
            const fallback = await parseS3FindingsFallback(
                {
                    report_bucket: job.report_bucket || null,
                    report_key: job.report_key || null,
                    scan_status: job.scan_status || null,
                    inventory_status: job.inventory_status || null,
                    inventory_reason: job.inventory_reason || null,
                },
                page,
                pageSize,
            );
            return NextResponse.json(fallback);
        }

        values.push(pageSize);
        values.push((page - 1) * pageSize);
        const limitIndex = values.length - 1;
        const offsetIndex = values.length;

        const rowSql = `
SELECT
  id,
  finding_id,
  package_name,
  package_ecosystem,
  package_version,
  severity,
  cvss_base,
  cvss_vector,
  confidence_tier,
  evidence_source,
  accuracy_note,
  fixed,
  fixed_in,
  recommendation,
  description,
  source_ids,
  raw
FROM scan_findings
WHERE ${whereSql}
ORDER BY ${sortExpr} ${sortOrder}, id ASC
LIMIT $${limitIndex} OFFSET $${offsetIndex}
        `;

        const rows = await prisma.$queryRawUnsafe<Array<{
            id: number;
            finding_id: string;
            package_name: string | null;
            package_ecosystem: string | null;
            package_version: string | null;
            severity: string | null;
            cvss_base: number | null;
            cvss_vector: string | null;
            confidence_tier: string;
            evidence_source: string;
            accuracy_note: string | null;
            fixed: boolean | null;
            fixed_in: string | null;
            recommendation: string | null;
            description: string | null;
            source_ids: unknown;
            raw: unknown;
        }>>(rowSql, ...values);

        const findingIds = rows.map((r) => r.id);
        let refMap = new Map<number, Array<{ type: string; url: string }>>();
        if (findingIds.length > 0) {
            const refs = await prisma.$queryRawUnsafe<Array<{ finding_row_id: number; ref_type: string; url: string }>>(
                `
SELECT finding_row_id, ref_type, url
FROM scan_finding_refs
WHERE finding_row_id = ANY($1::bigint[])
ORDER BY id ASC
                `,
                findingIds,
            );
            refMap = refs.reduce((acc, ref) => {
                const cur = acc.get(ref.finding_row_id) || [];
                cur.push({ type: ref.ref_type, url: ref.url });
                acc.set(ref.finding_row_id, cur);
                return acc;
            }, new Map<number, Array<{ type: string; url: string }>>());
        }

        const summaryRows = await prisma.$queryRawUnsafe<Array<Record<string, number>>>(`
SELECT
  COUNT(*)::int AS total_findings,
  COUNT(*) FILTER (WHERE confidence_tier <> 'heuristic_unverified')::int AS confirmed_total_findings,
  COUNT(*) FILTER (WHERE confidence_tier = 'heuristic_unverified')::int AS heuristic_total_findings,
  COUNT(*) FILTER (WHERE severity = 'CRITICAL')::int AS critical,
  COUNT(*) FILTER (WHERE severity = 'HIGH')::int AS high,
  COUNT(*) FILTER (WHERE severity = 'MEDIUM')::int AS medium,
  COUNT(*) FILTER (WHERE severity = 'LOW')::int AS low,
  COUNT(*) FILTER (WHERE confidence_tier <> 'heuristic_unverified' AND severity = 'CRITICAL')::int AS confirmed_critical,
  COUNT(*) FILTER (WHERE confidence_tier <> 'heuristic_unverified' AND severity = 'HIGH')::int AS confirmed_high,
  COUNT(*) FILTER (WHERE confidence_tier <> 'heuristic_unverified' AND severity = 'MEDIUM')::int AS confirmed_medium,
  COUNT(*) FILTER (WHERE confidence_tier <> 'heuristic_unverified' AND severity = 'LOW')::int AS confirmed_low,
  COUNT(*) FILTER (WHERE confidence_tier = 'heuristic_unverified' AND severity = 'CRITICAL')::int AS heuristic_critical,
  COUNT(*) FILTER (WHERE confidence_tier = 'heuristic_unverified' AND severity = 'HIGH')::int AS heuristic_high,
  COUNT(*) FILTER (WHERE confidence_tier = 'heuristic_unverified' AND severity = 'MEDIUM')::int AS heuristic_medium,
  COUNT(*) FILTER (WHERE confidence_tier = 'heuristic_unverified' AND severity = 'LOW')::int AS heuristic_low
FROM scan_findings
WHERE job_id = $1::uuid
        `, id);

        const items: FindingsItem[] = rows.map((row) => {
            const rawObj = row.raw && typeof row.raw === "object" ? row.raw as Record<string, unknown> : {};
            const sourceIds = Array.isArray(row.source_ids)
                ? row.source_ids.map((v) => String(v))
                : Array.isArray(rawObj.source_ids)
                    ? (rawObj.source_ids as unknown[]).map((v) => String(v))
                    : [];

            const epssScore = typeof rawObj.epss_score === "number" ? rawObj.epss_score : null;
            const epssPercentile = typeof rawObj.epss_percentile === "number" ? rawObj.epss_percentile : null;
            const inKev = typeof rawObj.in_kev === "boolean" ? rawObj.in_kev : null;

            return {
                id: row.finding_id,
                severity: row.severity,
                confidence_tier: row.confidence_tier,
                evidence_source: row.evidence_source,
                accuracy_note: row.accuracy_note,
                fixed: row.fixed,
                fixed_in: row.fixed_in,
                recommendation: row.recommendation,
                cvss: row.cvss_base != null || row.cvss_vector
                    ? {
                        ...(row.cvss_base != null ? { base: Number(row.cvss_base) } : {}),
                        ...(row.cvss_vector ? { vector: row.cvss_vector } : {}),
                    }
                    : null,
                description: row.description,
                package: {
                    name: row.package_name || undefined,
                    ecosystem: row.package_ecosystem || undefined,
                    version: row.package_version || undefined,
                },
                source_ids: sourceIds,
                references: refMap.get(row.id) || [],
                epss_score: epssScore as number | null,
                epss_percentile: epssPercentile as number | null,
                in_kev: inKev as boolean | null,
            };
        });

        const payload: FindingsResponse = {
            items,
            summary: summaryRows[0] || emptyResponse(page, pageSize).summary,
            page,
            page_size: pageSize,
            total,
            scan_status: job.scan_status || null,
            inventory_status: job.inventory_status || null,
            inventory_reason: job.inventory_reason || null,
        };

        return NextResponse.json(payload);
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ ...emptyResponse(page, pageSize), error: msg }, { status: 500 });
    }
}
