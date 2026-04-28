import { proxyFetch } from "@/lib/proxyFetch";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limit = Math.min(
    parseInt(req.nextUrl.searchParams.get("limit") || "20"),
    100,
  );

  try {
    // Fetch the EPSS scores CSV from FIRST.org API
    const res = await proxyFetch(
      "https://epss.cyentia.com/epss_scores-current.csv.gz",
      { headers: { Accept: "text/csv" } },
    );

    if (!res.ok) {
      // Fallback: use the EPSS API endpoint
      const apiRes = await proxyFetch(
        `https://api.first.org/data/v1/epss?order=!epss&limit=${limit}`,
      );
      if (!apiRes.ok) {
        return NextResponse.json(
          { error: "EPSS data source unavailable" },
          { status: 502 },
        );
      }
      const apiData = await apiRes.json();
      const cves = (apiData.data || []).map(
        (d: Record<string, unknown>) => ({
          cve: d.cve,
          epss: d.epss,
          percentile: d.percentile,
          date: d.date,
        }),
      );

      return NextResponse.json(
        { count: cves.length, cves },
        {
          headers: {
            "Cache-Control":
              "public, s-maxage=3600, stale-while-revalidate=1800",
          },
        },
      );
    }

    // If CSV endpoint works, parse it
    const text = await res.text();
    const lines = text.split("\n").filter((l) => l && !l.startsWith("#"));
    // Skip header
    const header = lines[0];
    const rows = lines.slice(1);

    // Parse and sort by EPSS score descending
    const parsed = rows
      .map((line) => {
        const [cve, epss, percentile] = line.split(",");
        return { cve, epss: parseFloat(epss), percentile: parseFloat(percentile) };
      })
      .filter((r) => !isNaN(r.epss))
      .sort((a, b) => b.epss - a.epss)
      .slice(0, limit);

    return NextResponse.json(
      { count: parsed.length, cves: parsed },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=1800",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch EPSS data" },
      { status: 500 },
    );
  }
}
