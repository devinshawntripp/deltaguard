import { NextRequest, NextResponse } from "next/server";
import { requireRequestActor } from "@/lib/authz";
import { JOB_READ_ROLES } from "@/lib/authz";
import { prisma, ensurePlatformSchema } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_PERIODS = ["7d", "30d", "90d", "365d"] as const;
type Period = (typeof VALID_PERIODS)[number];

function periodToDays(period: Period): number {
    switch (period) {
        case "7d": return 7;
        case "30d": return 30;
        case "90d": return 90;
        case "365d": return 365;
    }
}

type RawRow = {
    scan_date: Date;
    scan_count: string;
    total_findings: string | null;
    critical: string | null;
    high: string | null;
    medium: string | null;
    low: string | null;
    file_names: string | null;
};

export async function GET(req: NextRequest) {
    const guard = await requireRequestActor(req, {
        requiredRoles: JOB_READ_ROLES,
        feature: "view vulnerability trends",
    });
    if ("response" in guard) return guard.response;
    const actor = guard.actor;

    const url = new URL(req.url);
    const periodParam = url.searchParams.get("period") || "30d";
    if (!VALID_PERIODS.includes(periodParam as Period)) {
        return NextResponse.json(
            { error: `Invalid period. Valid values: ${VALID_PERIODS.join(", ")}` },
            { status: 400 },
        );
    }
    const period = periodParam as Period;
    const days = periodToDays(period);

    await ensurePlatformSchema();

    const rows = await prisma.$queryRaw<RawRow[]>`
        SELECT
            DATE(created_at) AS scan_date,
            COUNT(*)::text AS scan_count,
            SUM(COALESCE((summary_json->>'total_findings')::int, 0))::text AS total_findings,
            SUM(COALESCE(
                (summary_json->'severity_counts'->>'Critical')::int,
                (summary_json->>'critical')::int,
                0
            ))::text AS critical,
            SUM(COALESCE(
                (summary_json->'severity_counts'->>'High')::int,
                (summary_json->>'high')::int,
                0
            ))::text AS high,
            SUM(COALESCE(
                (summary_json->'severity_counts'->>'Medium')::int,
                (summary_json->>'medium')::int,
                0
            ))::text AS medium,
            SUM(COALESCE(
                (summary_json->'severity_counts'->>'Low')::int,
                (summary_json->>'low')::int,
                0
            ))::text AS low,
            STRING_AGG(DISTINCT COALESCE(registry_image, object_key, ''), '|||') AS file_names
        FROM scan_jobs
        WHERE org_id = ${actor.orgId}::uuid
          AND status = 'done'
          AND created_at >= NOW() - CAST(${days + ' days'} AS INTERVAL)
        GROUP BY DATE(created_at)
        ORDER BY scan_date
    `;

    const dataPoints = rows.map((r) => {
        const fileNames = r.file_names ? r.file_names.split("|||").filter(Boolean) : [];
        return {
            date: r.scan_date.toISOString().slice(0, 10),
            scans: parseInt(r.scan_count, 10) || 0,
            total_findings: parseInt(r.total_findings || "0", 10),
            critical: parseInt(r.critical || "0", 10),
            high: parseInt(r.high || "0", 10),
            medium: parseInt(r.medium || "0", 10),
            low: parseInt(r.low || "0", 10),
            images_scanned: fileNames,
        };
    });

    // Build summary
    const totalScans = dataPoints.reduce((s, d) => s + d.scans, 0);
    const totalFindings = dataPoints.reduce((s, d) => s + d.total_findings, 0);
    const avgFindings = totalScans > 0 ? Math.round(totalFindings / totalScans) : 0;

    // Most scanned image
    const imageCounts: Record<string, number> = {};
    for (const dp of dataPoints) {
        for (const img of dp.images_scanned) {
            imageCounts[img] = (imageCounts[img] || 0) + 1;
        }
    }
    const mostScannedImage = Object.entries(imageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Trend direction: compare avg critical+high in first half vs second half
    const mid = Math.floor(dataPoints.length / 2);
    const firstHalf = dataPoints.slice(0, mid || 1);
    const secondHalf = dataPoints.slice(mid || 1);
    const avgSev = (pts: typeof dataPoints) => {
        if (pts.length === 0) return 0;
        return pts.reduce((s, d) => s + d.critical + d.high, 0) / pts.length;
    };
    const firstAvg = avgSev(firstHalf);
    const secondAvg = avgSev(secondHalf);
    const criticalFirst = firstHalf.reduce((s, d) => s + d.critical, 0);
    const criticalSecond = secondHalf.reduce((s, d) => s + d.critical, 0);

    let trendDirection: "improving" | "worsening" | "stable" = "stable";
    const diff = secondAvg - firstAvg;
    if (diff < -0.5) trendDirection = "improving";
    else if (diff > 0.5) trendDirection = "worsening";

    return NextResponse.json({
        period,
        data_points: dataPoints,
        summary: {
            total_scans: totalScans,
            avg_findings_per_scan: avgFindings,
            most_scanned_image: mostScannedImage,
            trend_direction: trendDirection,
            critical_trend: criticalSecond - criticalFirst,
        },
    });
}
