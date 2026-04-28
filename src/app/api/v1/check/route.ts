import { proxyFetch } from "@/lib/proxyFetch";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { ecosystem, name, version } = body;

  if (!ecosystem || !name) {
    return NextResponse.json(
      { error: "ecosystem and name are required" },
      { status: 400 },
    );
  }

  const query: Record<string, unknown> = { package: { ecosystem, name } };
  if (version) query.version = version;

  const res = await proxyFetch("https://api.osv.dev/v1/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
  });

  const data = await res.json();
  const vulns = (data.vulns || []).map((v: Record<string, unknown>) => ({
    id: v.id,
    aliases: (v.aliases as string[]) || [],
    summary: v.summary,
    severity: v.severity,
    modified: v.modified,
    references: ((v.references as unknown[]) || []).slice(0, 5),
  }));

  return NextResponse.json(
    {
      ecosystem,
      name,
      version: version || "all",
      vulnerabilities: vulns.length,
      results: vulns,
    },
    {
      headers: { "Cache-Control": "public, s-maxage=300" },
    },
  );
}
