import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const res = await fetch(
    `https://api.osv.dev/v1/vulns/${encodeURIComponent(id)}`,
  );
  if (!res.ok) {
    return NextResponse.json({ error: `CVE ${id} not found` }, { status: 404 });
  }

  const vuln = await res.json();

  return NextResponse.json(
    {
      id: vuln.id,
      aliases: vuln.aliases || [],
      summary: vuln.summary,
      details: vuln.details,
      severity: vuln.severity,
      modified: vuln.modified,
      published: vuln.published,
      affected: (vuln.affected || []).map(
        (a: Record<string, unknown>) => ({
          package: a.package,
          ranges: a.ranges,
        }),
      ),
      references: vuln.references || [],
    },
    {
      headers: { "Cache-Control": "public, s-maxage=3600" },
    },
  );
}
