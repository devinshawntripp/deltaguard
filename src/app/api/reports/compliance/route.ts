import { NextRequest, NextResponse } from "next/server";
import { resolveRequestActor, actorHasAnyRole, forbiddenByRole, JOB_READ_ROLES } from "@/lib/authz";
import { generateComplianceReport, type ComplianceReportType, type ComplianceFormat } from "@/lib/compliance";
import { audit, getClientIp } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_TYPES = new Set<ComplianceReportType>(["soc2", "iso27001", "fedramp", "inventory"]);
const VALID_FORMATS = new Set<ComplianceFormat>(["csv", "json"]);

export async function POST(req: NextRequest) {
  const actor = await resolveRequestActor(req);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!actorHasAnyRole(actor, JOB_READ_ROLES)) {
    return forbiddenByRole(actor, JOB_READ_ROLES, "compliance reports");
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const type = body.type as ComplianceReportType;
  const format = (body.format || "csv") as ComplianceFormat;

  if (!type || !VALID_TYPES.has(type)) {
    return NextResponse.json(
      { error: `Invalid report type. Must be one of: ${[...VALID_TYPES].join(", ")}` },
      { status: 400 },
    );
  }
  if (!VALID_FORMATS.has(format)) {
    return NextResponse.json(
      { error: `Invalid format. Must be one of: ${[...VALID_FORMATS].join(", ")}` },
      { status: 400 },
    );
  }

  const dateRange = body.date_range
    ? { from: String(body.date_range.from), to: String(body.date_range.to) }
    : undefined;

  try {
    const result = await generateComplianceReport(actor.orgId, type, format, dateRange);

    audit({ actor, action: "report.generated", targetType: "compliance_report", detail: `Generated ${type} report (${format})`, ip: getClientIp(req) });
    return new Response(result.content, {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("[compliance-report]", err);
    return NextResponse.json(
      { error: "Failed to generate report", detail: String(err?.message || err) },
      { status: 500 },
    );
  }
}
