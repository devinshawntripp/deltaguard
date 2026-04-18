import { prisma, ensurePlatformSchema } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ComplianceReportType = "soc2" | "iso27001" | "fedramp" | "inventory";
export type ComplianceFormat = "csv" | "json";

export type DateRange = {
  from: string; // ISO date
  to: string;
};

export type ScanRecord = {
  id: string;
  status: string;
  file_name: string;
  created_at: string;
  finished_at: string | null;
  summary_json: any;
  source_type: string | null;
  registry_image: string | null;
};

export type Finding = {
  cve_id: string;
  severity: string;
  cvss_score: number | null;
  epss_score: number | null;
  package_name: string;
  version: string;
  ecosystem: string;
  image: string;
  scan_date: string;
  status: string;
  first_seen: string;
  description: string;
};

/* ------------------------------------------------------------------ */
/*  Data gathering                                                     */
/* ------------------------------------------------------------------ */

export async function gatherScanData(
  orgId: string,
  dateRange?: DateRange,
): Promise<{ scans: ScanRecord[]; findings: Finding[] }> {
  await ensurePlatformSchema();

  const from = dateRange?.from ?? new Date(Date.now() - 90 * 86_400_000).toISOString();
  const to = dateRange?.to ?? new Date().toISOString();

  const scans = await prisma.$queryRaw<ScanRecord[]>`
    SELECT
      id::text AS id,
      status,
      COALESCE(object_key, '') AS file_name,
      created_at::text AS created_at,
      finished_at::text AS finished_at,
      summary_json,
      source_type,
      registry_image
    FROM scan_jobs
    WHERE org_id = ${orgId}::uuid
      AND created_at >= ${from}::timestamptz
      AND created_at <= ${to}::timestamptz
    ORDER BY created_at DESC
  `;

  // Flatten findings from summary_json where available
  const findings: Finding[] = [];
  for (const scan of scans) {
    if (scan.status !== "done" || !scan.summary_json) continue;
    const summary = typeof scan.summary_json === "string"
      ? JSON.parse(scan.summary_json)
      : scan.summary_json;

    const vulns: any[] = summary.vulnerabilities || summary.findings || [];
    for (const v of vulns) {
      findings.push({
        cve_id: v.cve_id || v.id || v.advisory_id || "N/A",
        severity: v.severity || "UNKNOWN",
        cvss_score: v.cvss_score ?? v.cvss ?? null,
        epss_score: v.epss_score ?? v.epss ?? null,
        package_name: v.package_name || v.package || v.name || "",
        version: v.version || v.installed_version || "",
        ecosystem: v.ecosystem || v.source || "",
        image: scan.registry_image || scan.file_name,
        scan_date: scan.created_at,
        status: v.status || (v.fixed_version ? "fix_available" : "open"),
        first_seen: scan.created_at,
        description: v.description || v.summary || "",
      });
    }
  }

  return { scans, findings };
}

/* ------------------------------------------------------------------ */
/*  Aggregation helpers                                                */
/* ------------------------------------------------------------------ */

function severityCounts(findings: Finding[]) {
  const counts: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, UNKNOWN: 0 };
  for (const f of findings) {
    const sev = f.severity.toUpperCase();
    counts[sev] = (counts[sev] || 0) + 1;
  }
  return counts;
}

function remediationRate(findings: Finding[]): number {
  if (findings.length === 0) return 100;
  const fixed = findings.filter(f => f.status === "fixed" || f.status === "resolved").length;
  return Math.round((fixed / findings.length) * 100);
}

function uniquePackages(findings: Finding[]) {
  const seen = new Set<string>();
  const pkgs: { name: string; version: string; ecosystem: string }[] = [];
  for (const f of findings) {
    const key = `${f.package_name}@${f.version}`;
    if (!seen.has(key) && f.package_name) {
      seen.add(key);
      pkgs.push({ name: f.package_name, version: f.version, ecosystem: f.ecosystem });
    }
  }
  return pkgs;
}

/* ------------------------------------------------------------------ */
/*  SOC 2 report                                                       */
/* ------------------------------------------------------------------ */

function buildSoc2Report(scans: ScanRecord[], findings: Finding[], dateRange: { from: string; to: string }) {
  const sevCounts = severityCounts(findings);
  return {
    report_type: "soc2",
    generated_at: new Date().toISOString(),
    date_range: dateRange,
    executive_summary: {
      total_scans: scans.length,
      completed_scans: scans.filter(s => s.status === "done").length,
      total_findings: findings.length,
      severity_breakdown: sevCounts,
      remediation_rate_pct: remediationRate(findings),
      unique_artifacts_scanned: new Set(scans.map(s => s.registry_image || s.file_name)).size,
    },
    vulnerability_inventory: findings.map(f => ({
      cve_id: f.cve_id,
      severity: f.severity,
      cvss_score: f.cvss_score,
      epss_score: f.epss_score,
      package: f.package_name,
      version: f.version,
      status: f.status,
      first_seen: f.first_seen,
      last_seen: f.scan_date,
      description: f.description,
    })),
    scan_coverage_timeline: scans.map(s => ({
      scan_id: s.id,
      artifact: s.registry_image || s.file_name,
      date: s.created_at,
      status: s.status,
    })),
    critical_high_tracking: findings
      .filter(f => ["CRITICAL", "HIGH"].includes(f.severity.toUpperCase()))
      .map(f => ({
        cve_id: f.cve_id,
        severity: f.severity,
        package: f.package_name,
        status: f.status,
        epss_score: f.epss_score,
        first_seen: f.first_seen,
      })),
  };
}

/* ------------------------------------------------------------------ */
/*  ISO 27001 report                                                   */
/* ------------------------------------------------------------------ */

function buildIso27001Report(scans: ScanRecord[], findings: Finding[], dateRange: { from: string; to: string }) {
  const sevCounts = severityCounts(findings);
  const completedScans = scans.filter(s => s.status === "done");
  return {
    report_type: "iso27001",
    generated_at: new Date().toISOString(),
    date_range: dateRange,
    asset_inventory: scans.map(s => ({
      scan_id: s.id,
      artifact: s.registry_image || s.file_name,
      source_type: s.source_type || "upload",
      scan_date: s.created_at,
      status: s.status,
    })),
    risk_assessment: {
      total_findings: findings.length,
      severity_breakdown: sevCounts,
      epss_summary: {
        above_90th_percentile: findings.filter(f => (f.epss_score ?? 0) >= 0.9).length,
        above_50th_percentile: findings.filter(f => (f.epss_score ?? 0) >= 0.5).length,
        below_50th_percentile: findings.filter(f => (f.epss_score ?? 0) < 0.5).length,
      },
    },
    control_effectiveness: {
      total_scans: scans.length,
      completed_scans: completedScans.length,
      failed_scans: scans.filter(s => s.status === "failed").length,
      detection_rate_pct: completedScans.length > 0
        ? Math.round((completedScans.filter(s => {
            const summary = s.summary_json;
            if (!summary) return false;
            const parsed = typeof summary === "string" ? JSON.parse(summary) : summary;
            return (parsed.vulnerabilities?.length ?? parsed.findings?.length ?? 0) > 0;
          }).length / completedScans.length) * 100)
        : 0,
      remediation_rate_pct: remediationRate(findings),
    },
  };
}

/* ------------------------------------------------------------------ */
/*  FedRAMP report                                                     */
/* ------------------------------------------------------------------ */

function buildFedrampReport(scans: ScanRecord[], findings: Finding[], dateRange: { from: string; to: string }) {
  const now = new Date();
  return {
    report_type: "fedramp",
    generated_at: now.toISOString(),
    date_range: dateRange,
    poam: findings.map((f, i) => {
      const sevUpper = f.severity.toUpperCase();
      const deadlineDays = sevUpper === "CRITICAL" ? 30 : sevUpper === "HIGH" ? 90 : sevUpper === "MEDIUM" ? 180 : 365;
      const firstSeen = new Date(f.first_seen);
      const deadline = new Date(firstSeen.getTime() + deadlineDays * 86_400_000);
      return {
        poam_id: `POAM-${String(i + 1).padStart(4, "0")}`,
        cve_id: f.cve_id,
        weakness_description: f.description || `${f.severity} vulnerability in ${f.package_name}`,
        severity: sevUpper,
        nist_category: sevUpper === "CRITICAL" || sevUpper === "HIGH" ? "CAT I" : sevUpper === "MEDIUM" ? "CAT II" : "CAT III",
        affected_component: `${f.package_name}@${f.version}`,
        ecosystem: f.ecosystem,
        detected_date: f.first_seen,
        remediation_deadline: deadline.toISOString().split("T")[0],
        status: f.status,
        cvss_score: f.cvss_score,
        epss_score: f.epss_score,
      };
    }),
    summary: {
      total_findings: findings.length,
      cat_i: findings.filter(f => ["CRITICAL", "HIGH"].includes(f.severity.toUpperCase())).length,
      cat_ii: findings.filter(f => f.severity.toUpperCase() === "MEDIUM").length,
      cat_iii: findings.filter(f => ["LOW", "UNKNOWN"].includes(f.severity.toUpperCase())).length,
      overdue: findings.filter(f => {
        const sevUpper = f.severity.toUpperCase();
        const deadlineDays = sevUpper === "CRITICAL" ? 30 : sevUpper === "HIGH" ? 90 : sevUpper === "MEDIUM" ? 180 : 365;
        const deadline = new Date(new Date(f.first_seen).getTime() + deadlineDays * 86_400_000);
        return deadline < now && f.status !== "fixed" && f.status !== "resolved";
      }).length,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Inventory report                                                   */
/* ------------------------------------------------------------------ */

function buildInventoryReport(scans: ScanRecord[], findings: Finding[], dateRange: { from: string; to: string }) {
  // Also extract packages from summary_json package lists
  const packages: { name: string; version: string; ecosystem: string; images: string[]; license?: string }[] = [];
  const pkgMap = new Map<string, { name: string; version: string; ecosystem: string; images: Set<string>; license?: string }>();

  for (const scan of scans) {
    if (!scan.summary_json) continue;
    const summary = typeof scan.summary_json === "string" ? JSON.parse(scan.summary_json) : scan.summary_json;
    const image = scan.registry_image || scan.file_name;

    // From packages array if available
    const pkgList: any[] = summary.packages || summary.components || [];
    for (const p of pkgList) {
      const name = p.name || p.package_name || "";
      const version = p.version || "";
      const key = `${name}@${version}`;
      if (!name) continue;
      if (!pkgMap.has(key)) {
        pkgMap.set(key, { name, version, ecosystem: p.ecosystem || p.type || "", images: new Set([image]), license: p.license || undefined });
      } else {
        pkgMap.get(key)!.images.add(image);
      }
    }

    // From findings
    for (const f of findings.filter(f2 => f2.image === image)) {
      const key = `${f.package_name}@${f.version}`;
      if (!f.package_name) continue;
      if (!pkgMap.has(key)) {
        pkgMap.set(key, { name: f.package_name, version: f.version, ecosystem: f.ecosystem, images: new Set([image]) });
      } else {
        pkgMap.get(key)!.images.add(image);
      }
    }
  }

  for (const [, v] of pkgMap) {
    packages.push({ ...v, images: [...v.images] });
  }
  packages.sort((a, b) => a.name.localeCompare(b.name));

  return {
    report_type: "inventory",
    generated_at: new Date().toISOString(),
    date_range: dateRange,
    total_packages: packages.length,
    total_artifacts: new Set(scans.map(s => s.registry_image || s.file_name)).size,
    packages,
  };
}

/* ------------------------------------------------------------------ */
/*  CSV formatter                                                      */
/* ------------------------------------------------------------------ */

function escapeCSV(val: any): string {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function formatAsCSV(findings: Finding[], _reportType: ComplianceReportType): string {
  const header = "cve_id,severity,cvss_score,epss_score,package,version,ecosystem,image,scan_date,status,first_seen,description";
  const rows = findings.map(f =>
    [
      f.cve_id,
      f.severity,
      f.cvss_score ?? "",
      f.epss_score ?? "",
      f.package_name,
      f.version,
      f.ecosystem,
      f.image,
      f.scan_date,
      f.status,
      f.first_seen,
      f.description,
    ].map(escapeCSV).join(",")
  );
  return [header, ...rows].join("\n");
}

/* ------------------------------------------------------------------ */
/*  Main entry point                                                   */
/* ------------------------------------------------------------------ */

export async function generateComplianceReport(
  orgId: string,
  type: ComplianceReportType,
  format: ComplianceFormat,
  dateRange?: DateRange,
): Promise<{ content: string; contentType: string; filename: string }> {
  const effectiveRange = {
    from: dateRange?.from ?? new Date(Date.now() - 90 * 86_400_000).toISOString(),
    to: dateRange?.to ?? new Date().toISOString(),
  };

  const { scans, findings } = await gatherScanData(orgId, effectiveRange);
  const dateSuffix = new Date().toISOString().split("T")[0];

  if (format === "csv") {
    const csv = formatAsCSV(findings, type);
    return {
      content: csv,
      contentType: "text/csv",
      filename: `scanrook-${type}-report-${dateSuffix}.csv`,
    };
  }

  // JSON format — build structured report per type
  let report: any;
  switch (type) {
    case "soc2":
      report = buildSoc2Report(scans, findings, effectiveRange);
      break;
    case "iso27001":
      report = buildIso27001Report(scans, findings, effectiveRange);
      break;
    case "fedramp":
      report = buildFedrampReport(scans, findings, effectiveRange);
      break;
    case "inventory":
      report = buildInventoryReport(scans, findings, effectiveRange);
      break;
    default:
      report = { error: "Unknown report type" };
  }

  return {
    content: JSON.stringify(report, null, 2),
    contentType: "application/json",
    filename: `scanrook-${type}-report-${dateSuffix}.json`,
  };
}
