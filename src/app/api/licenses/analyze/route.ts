import { NextRequest, NextResponse } from "next/server";
import { resolveRequestActor, actorHasAnyRole, forbiddenByRole, JOB_READ_ROLES } from "@/lib/authz";
import { getJob } from "@/lib/jobs";
import { s3Internal } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { classifyLicense, scoreLicenseRisk, type LicenseInfo } from "@/lib/licenses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PackageLicense = {
  name: string;
  version: string;
  ecosystem: string;
  license: string;
  info: LicenseInfo;
};

async function extractLicensesFromReport(reportBucket: string, reportKey: string): Promise<PackageLicense[]> {
  const res = await s3Internal.send(new GetObjectCommand({ Bucket: reportBucket, Key: reportKey }));
  const body = await res.Body?.transformToString("utf-8");
  if (!body) return [];

  const report = JSON.parse(body);
  const packages: PackageLicense[] = [];
  const seen = new Set<string>();

  // Walk report structure — scanner reports have packages at top level or nested in files
  const pkgList = report.packages || report.summary?.packages || [];
  for (const pkg of pkgList) {
    const license = pkg.license || pkg.license_id || "";
    if (!license) continue;
    const key = `${pkg.name}@${pkg.version}@${license}`;
    if (seen.has(key)) continue;
    seen.add(key);
    packages.push({
      name: pkg.name || "unknown",
      version: pkg.version || "unknown",
      ecosystem: pkg.ecosystem || pkg.type || "unknown",
      license,
      info: classifyLicense(license),
    });
  }

  // Also check findings for license-related data
  const findings = report.findings || report.vulnerabilities || [];
  for (const f of findings) {
    const pkg = f.package || {};
    const license = pkg.license || pkg.license_id || "";
    if (!license) continue;
    const key = `${pkg.name}@${pkg.version}@${license}`;
    if (seen.has(key)) continue;
    seen.add(key);
    packages.push({
      name: pkg.name || "unknown",
      version: pkg.version || "unknown",
      ecosystem: pkg.ecosystem || pkg.type || "unknown",
      license,
      info: classifyLicense(license),
    });
  }

  return packages;
}

export async function POST(req: NextRequest) {
  const actor = await resolveRequestActor(req);
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!actorHasAnyRole(actor, JOB_READ_ROLES)) {
    return forbiddenByRole(actor, JOB_READ_ROLES, "analyze licenses");
  }

  let body: { job_id?: string; licenses?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Direct license classification mode
  if (body.licenses && Array.isArray(body.licenses)) {
    const packages = body.licenses.map((l) => classifyLicense(l));
    const { score, risk, issues } = scoreLicenseRisk(body.licenses);
    return NextResponse.json({ score, risk, packages, issues });
  }

  // Job-based analysis mode
  if (!body.job_id) {
    return NextResponse.json({ error: "Either job_id or licenses[] is required" }, { status: 400 });
  }

  const job = await getJob(body.job_id, actor.orgId);
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (!job.report_bucket || !job.report_key) {
    return NextResponse.json({ error: "Report not available — scan may still be in progress" }, { status: 400 });
  }

  try {
    const packages = await extractLicensesFromReport(job.report_bucket, job.report_key);
    const licenseIds = packages.map((p) => p.license);
    const { score, risk, issues } = scoreLicenseRisk(licenseIds);

    return NextResponse.json({
      score,
      risk,
      packages,
      issues,
      job_id: body.job_id,
      total_packages: packages.length,
    });
  } catch (err: any) {
    console.error("License analysis failed:", err);
    return NextResponse.json({ error: "Failed to analyze report" }, { status: 500 });
  }
}
