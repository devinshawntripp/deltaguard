import { NextRequest, NextResponse } from "next/server";
import { forbiddenByRole, resolveRequestActor } from "@/lib/authz";
import { ensurePlatformSchema, prisma } from "@/lib/prisma";
import { ADMIN_OVERRIDE } from "@/lib/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_ONLY_ROLES = [ADMIN_OVERRIDE];
const CSV_CONTENT_TYPE = "text/csv; charset=utf-8";

type TargetAccountRow = {
  id: string;
  account_key: string;
  account_name: string;
  account_domain: string;
  industry: string | null;
  company_size: string | null;
  devsecops_contact_name: string | null;
  devsecops_contact_title: string | null;
  devsecops_contact_email: string | null;
  compliance_contact_name: string | null;
  compliance_contact_title: string | null;
  compliance_contact_email: string | null;
  fit_score: number;
  status: string;
  next_action: string | null;
  owner: string | null;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const CSV_HEADERS = [
  "account_name",
  "account_domain",
  "industry",
  "company_size",
  "devsecops_contact_name",
  "devsecops_contact_title",
  "devsecops_contact_email",
  "compliance_contact_name",
  "compliance_contact_title",
  "compliance_contact_email",
  "fit_score",
  "status",
  "next_action",
  "owner",
  "source",
  "notes",
] as const;

const ENRICHMENT_HEADERS = [
  "account_name",
  "account_domain",
  "industry",
  "company_size",
  "fit_score",
  "priority_bucket",
  "status",
  "source",
  "owner",
  "devsecops_contact_name",
  "devsecops_contact_title",
  "devsecops_contact_email",
  "devsecops_linkedin_url",
  "devsecops_notes",
  "compliance_contact_name",
  "compliance_contact_title",
  "compliance_contact_email",
  "compliance_linkedin_url",
  "compliance_notes",
  "research_stage",
  "last_touch_date",
  "next_touch_date",
  "outreach_channel",
  "next_action",
  "notes",
] as const;

type TargetInput = {
  account_name: string;
  account_domain: string;
  industry: string;
  company_size: string;
  devsecops_contact_name: string;
  devsecops_contact_title: string;
  devsecops_contact_email: string;
  compliance_contact_name: string;
  compliance_contact_title: string;
  compliance_contact_email: string;
  fit_score: number;
  status: string;
  next_action: string;
  owner: string;
  source: string;
  notes: string;
};

function unauthorizedResponse() {
  return NextResponse.json(
    {
      error: "Unauthorized",
      code: "unauthorized",
    },
    { status: 401 },
  );
}

function escapeCsv(value: unknown): string {
  const raw = String(value ?? "");
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replaceAll('"', '""')}"`;
  }
  return raw;
}

function parseCsv(csv: string): string[][] {
  const out: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let i = 0;
  let inQuotes = false;

  while (i < csv.length) {
    const ch = csv[i];
    if (inQuotes) {
      if (ch === '"') {
        if (csv[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      cell += ch;
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      i += 1;
      continue;
    }
    if (ch === "\n") {
      row.push(cell);
      out.push(row);
      row = [];
      cell = "";
      i += 1;
      continue;
    }
    if (ch === "\r") {
      i += 1;
      continue;
    }
    cell += ch;
    i += 1;
  }
  row.push(cell);
  out.push(row);
  return out.filter((r) => r.some((c) => c.trim().length > 0));
}

function normalizeHeader(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "_");
}

function normalizeTargetRow(raw: Record<string, string>): TargetInput | null {
  const accountName = (raw.account_name || "").trim();
  const accountDomain = (raw.account_domain || "").trim().toLowerCase();
  if (!accountName) return null;

  const fitRaw = (raw.fit_score || "").trim();
  const fitParsed = Number.parseInt(fitRaw || "0", 10);
  const fitScore = Number.isFinite(fitParsed)
    ? Math.max(0, Math.min(100, fitParsed))
    : 0;

  return {
    account_name: accountName,
    account_domain: accountDomain,
    industry: (raw.industry || "").trim(),
    company_size: (raw.company_size || "").trim(),
    devsecops_contact_name: (raw.devsecops_contact_name || "").trim(),
    devsecops_contact_title: (raw.devsecops_contact_title || "").trim(),
    devsecops_contact_email: (raw.devsecops_contact_email || "").trim().toLowerCase(),
    compliance_contact_name: (raw.compliance_contact_name || "").trim(),
    compliance_contact_title: (raw.compliance_contact_title || "").trim(),
    compliance_contact_email: (raw.compliance_contact_email || "").trim().toLowerCase(),
    fit_score: fitScore,
    status: ((raw.status || "").trim() || "prospect").toLowerCase(),
    next_action: (raw.next_action || "").trim(),
    owner: (raw.owner || "").trim(),
    source: (raw.source || "").trim(),
    notes: (raw.notes || "").trim(),
  };
}

function toTargetAccountKey(accountName: string, accountDomain: string): string {
  return `${accountName.trim().toLowerCase()}|${accountDomain.trim().toLowerCase()}`;
}

async function listTargets(limit?: number): Promise<TargetAccountRow[]> {
  if (typeof limit === "number" && limit > 0) {
    return prisma.$queryRaw<TargetAccountRow[]>`
SELECT
  id::text AS id,
  account_key,
  account_name,
  account_domain,
  industry,
  company_size,
  devsecops_contact_name,
  devsecops_contact_title,
  devsecops_contact_email,
  compliance_contact_name,
  compliance_contact_title,
  compliance_contact_email,
  fit_score,
  status,
  next_action,
  owner,
  source,
  notes,
  created_at::text AS created_at,
  updated_at::text AS updated_at
FROM admin_target_accounts
ORDER BY fit_score DESC, account_name ASC
LIMIT ${limit}
    `;
  }

  return prisma.$queryRaw<TargetAccountRow[]>`
SELECT
  id::text AS id,
  account_key,
  account_name,
  account_domain,
  industry,
  company_size,
  devsecops_contact_name,
  devsecops_contact_title,
  devsecops_contact_email,
  compliance_contact_name,
  compliance_contact_title,
  compliance_contact_email,
  fit_score,
  status,
  next_action,
  owner,
  source,
  notes,
  created_at::text AS created_at,
  updated_at::text AS updated_at
FROM admin_target_accounts
ORDER BY fit_score DESC, account_name ASC
  `;
}

function rowsToCsv(rows: TargetAccountRow[]): string {
  const header = CSV_HEADERS.join(",");
  const lines = rows.map((row) =>
    CSV_HEADERS.map((h) => escapeCsv(row[h])).join(","),
  );
  return `${header}\n${lines.join("\n")}\n`;
}

function priorityBucket(score: number): string {
  if (score >= 85) return "P0";
  if (score >= 70) return "P1";
  if (score >= 55) return "P2";
  return "P3";
}

function researchStageForRow(row: TargetAccountRow): string {
  const hasDevSecOps =
    Boolean(row.devsecops_contact_name?.trim()) ||
    Boolean(row.devsecops_contact_email?.trim());
  const hasCompliance =
    Boolean(row.compliance_contact_name?.trim()) ||
    Boolean(row.compliance_contact_email?.trim());
  if (hasDevSecOps && hasCompliance) return "ready_for_outreach";
  if (hasDevSecOps || hasCompliance) return "needs_second_contact";
  return "needs_contact_research";
}

function rowsToEnrichmentTemplateCsv(rows: TargetAccountRow[]): string {
  const header = ENRICHMENT_HEADERS.join(",");
  const lines = rows.map((row) => {
    const values: Record<(typeof ENRICHMENT_HEADERS)[number], string | number> = {
      account_name: row.account_name,
      account_domain: row.account_domain,
      industry: row.industry || "",
      company_size: row.company_size || "",
      fit_score: row.fit_score,
      priority_bucket: priorityBucket(row.fit_score),
      status: row.status,
      source: row.source || "",
      owner: row.owner || "",
      devsecops_contact_name: row.devsecops_contact_name || "",
      devsecops_contact_title: row.devsecops_contact_title || "",
      devsecops_contact_email: row.devsecops_contact_email || "",
      devsecops_linkedin_url: "",
      devsecops_notes: "",
      compliance_contact_name: row.compliance_contact_name || "",
      compliance_contact_title: row.compliance_contact_title || "",
      compliance_contact_email: row.compliance_contact_email || "",
      compliance_linkedin_url: "",
      compliance_notes: "",
      research_stage: researchStageForRow(row),
      last_touch_date: "",
      next_touch_date: "",
      outreach_channel: "",
      next_action: row.next_action || "",
      notes: row.notes || "",
    };
    return ENRICHMENT_HEADERS.map((h) => escapeCsv(values[h])).join(",");
  });
  return `${header}\n${lines.join("\n")}\n`;
}

async function readCsvFromRequest(req: NextRequest): Promise<string> {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      throw new Error("file is required");
    }
    return file.text();
  }
  if (contentType.includes("application/json")) {
    const body = (await req.json()) as { csv?: string };
    return String(body?.csv || "");
  }
  return req.text();
}

export async function GET(req: NextRequest) {
  try {
    const actor = await resolveRequestActor(req);
    if (!actor) return unauthorizedResponse();
    if (actor.rolesMask !== ADMIN_OVERRIDE) {
      return forbiddenByRole(actor, ADMIN_ONLY_ROLES, "manage target accounts");
    }

    await ensurePlatformSchema();
    const rows = await listTargets();
    const format = String(req.nextUrl.searchParams.get("format") || "")
      .trim()
      .toLowerCase();
    const template = String(req.nextUrl.searchParams.get("template") || "")
      .trim()
      .toLowerCase();

    if (format === "csv") {
      if (template === "enrichment") {
        return new Response(rowsToEnrichmentTemplateCsv(rows), {
          status: 200,
          headers: {
            "content-type": CSV_CONTENT_TYPE,
            "content-disposition": 'attachment; filename="scanrook-target-accounts-enrichment-template.csv"',
          },
        });
      }
      return new Response(rowsToCsv(rows), {
        status: 200,
        headers: {
          "content-type": CSV_CONTENT_TYPE,
          "content-disposition": 'attachment; filename="scanrook-target-accounts.csv"',
        },
      });
    }

    return NextResponse.json({
      total: rows.length,
      items: rows,
      headers: CSV_HEADERS,
      enrichment_template_headers: ENRICHMENT_HEADERS,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        error: msg,
        code: "server_error",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await resolveRequestActor(req);
    if (!actor) return unauthorizedResponse();
    if (actor.rolesMask !== ADMIN_OVERRIDE) {
      return forbiddenByRole(actor, ADMIN_ONLY_ROLES, "manage target accounts");
    }

    await ensurePlatformSchema();
    let csv = "";
    try {
      csv = await readCsvFromRequest(req);
    } catch (e: unknown) {
      return NextResponse.json(
        {
          error: e instanceof Error ? e.message : String(e),
          code: "bad_request",
        },
        { status: 400 },
      );
    }

    if (!csv.trim()) {
      return NextResponse.json(
        {
          error: "csv payload is required",
          code: "bad_request",
        },
        { status: 400 },
      );
    }

    const rows = parseCsv(csv);
    if (rows.length < 2) {
      return NextResponse.json(
        {
          error: "csv must include header row and at least one data row",
          code: "bad_request",
        },
        { status: 400 },
      );
    }

    const header = rows[0].map(normalizeHeader);
    const headerMap = new Map<string, number>();
    for (let i = 0; i < header.length; i += 1) {
      headerMap.set(header[i], i);
    }
    if (!headerMap.has("account_name")) {
      return NextResponse.json(
        {
          error: "csv header must include account_name",
          code: "bad_request",
        },
        { status: 400 },
      );
    }

    let imported = 0;
    let updated = 0;
    let skipped = 0;

    for (let i = 1; i < rows.length; i += 1) {
      const row = rows[i];
      const raw: Record<string, string> = {};
      for (const h of CSV_HEADERS) {
        const idx = headerMap.get(h);
        raw[h] = idx == null ? "" : String(row[idx] || "");
      }
      const normalized = normalizeTargetRow(raw);
      if (!normalized) {
        skipped += 1;
        continue;
      }

      const key = toTargetAccountKey(
        normalized.account_name,
        normalized.account_domain,
      );
      const existing = await prisma.$queryRaw<Array<{ id: string }>>`
SELECT id::text AS id FROM admin_target_accounts WHERE account_key=${key} LIMIT 1
      `;

      await prisma.$executeRaw`
INSERT INTO admin_target_accounts (
  account_key,
  account_name,
  account_domain,
  industry,
  company_size,
  devsecops_contact_name,
  devsecops_contact_title,
  devsecops_contact_email,
  compliance_contact_name,
  compliance_contact_title,
  compliance_contact_email,
  fit_score,
  status,
  next_action,
  owner,
  source,
  notes,
  updated_at
)
VALUES (
  ${key},
  ${normalized.account_name},
  ${normalized.account_domain},
  ${normalized.industry},
  ${normalized.company_size},
  ${normalized.devsecops_contact_name},
  ${normalized.devsecops_contact_title},
  ${normalized.devsecops_contact_email},
  ${normalized.compliance_contact_name},
  ${normalized.compliance_contact_title},
  ${normalized.compliance_contact_email},
  ${normalized.fit_score},
  ${normalized.status},
  ${normalized.next_action},
  ${normalized.owner},
  ${normalized.source},
  ${normalized.notes},
  now()
)
ON CONFLICT (account_key)
DO UPDATE SET
  account_name = EXCLUDED.account_name,
  account_domain = EXCLUDED.account_domain,
  industry = EXCLUDED.industry,
  company_size = EXCLUDED.company_size,
  devsecops_contact_name = EXCLUDED.devsecops_contact_name,
  devsecops_contact_title = EXCLUDED.devsecops_contact_title,
  devsecops_contact_email = EXCLUDED.devsecops_contact_email,
  compliance_contact_name = EXCLUDED.compliance_contact_name,
  compliance_contact_title = EXCLUDED.compliance_contact_title,
  compliance_contact_email = EXCLUDED.compliance_contact_email,
  fit_score = EXCLUDED.fit_score,
  status = EXCLUDED.status,
  next_action = EXCLUDED.next_action,
  owner = EXCLUDED.owner,
  source = EXCLUDED.source,
  notes = EXCLUDED.notes,
  updated_at = now()
      `;

      if (existing[0]) updated += 1;
      else imported += 1;
    }

    const all = await listTargets();
    return NextResponse.json({
      ok: true,
      imported,
      updated,
      skipped,
      total: all.length,
      items: all,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        error: msg,
        code: "server_error",
      },
      { status: 500 },
    );
  }
}
