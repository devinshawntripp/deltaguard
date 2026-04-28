import { proxyFetch } from "@/lib/proxyFetch";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limit = Math.min(
    parseInt(req.nextUrl.searchParams.get("limit") || "20"),
    100,
  );
  const severity = req.nextUrl.searchParams.get("severity") || "";

  try {
    // Query OSV for recently modified vulnerabilities across common ecosystems
    const ecosystems = ["Debian", "Alpine", "npm", "PyPI", "Go"];
    const ecosystem = ecosystems[Math.floor(Date.now() / 300_000) % ecosystems.length];

    const res = await proxyFetch("https://api.osv.dev/v1/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ package: { ecosystem, name: "openssl" } }),
    });
    const data = await res.json();

    let cves = (data.vulns || []).map(
      (v: Record<string, unknown>) => ({
        id: v.id,
        aliases: ((v.aliases as string[]) || []).filter((a: string) =>
          a.startsWith("CVE-"),
        ),
        summary: v.summary,
        severity: v.severity,
        modified: v.modified,
      }),
    );

    if (severity) {
      cves = cves.filter(
        (c: Record<string, unknown>) =>
          Array.isArray(c.severity) &&
          (c.severity as Array<Record<string, string>>).some(
            (s) => s.type === "CVSS_V3" && scoreSeverity(s.score) === severity,
          ),
      );
    }

    cves = cves.slice(0, limit);

    return NextResponse.json(
      { count: cves.length, cves },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch CVE data" },
      { status: 500 },
    );
  }
}

function scoreSeverity(score: string): string {
  const n = parseFloat(score);
  if (n >= 9.0) return "critical";
  if (n >= 7.0) return "high";
  if (n >= 4.0) return "medium";
  return "low";
}
