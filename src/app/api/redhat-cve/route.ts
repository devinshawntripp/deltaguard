import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Proxy for Red Hat CVE lookups via the OSV API.
 * Red Hat's own security data API has CORS restrictions and unstable endpoints.
 * OSV aggregates Red Hat advisory data (RHSA/RHBA) and provides a reliable,
 * free, CORS-friendly API.
 */
export async function GET(req: NextRequest) {
  const pkg = req.nextUrl.searchParams.get("package") || "openssl";
  try {
    const res = await fetch("https://api.osv.dev/v1/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        package: { ecosystem: "Red Hat", name: pkg },
      }),
    });
    if (!res.ok) {
      return Response.json(
        { error: `OSV API returned ${res.status}` },
        { status: res.status },
      );
    }
    const data = await res.json();
    const vulns = (data.vulns || []).map((v: any) => {
      // Extract CVE aliases
      const cves = (v.aliases || []).filter((a: string) => a.startsWith("CVE-"));
      // Extract severity from CVSS
      let severity = "unknown";
      if (v.severity && v.severity.length > 0) {
        const score = v.severity[0].score || "";
        const match = score.match(/CVSS:[^/]+\/AV:\w\/AC:\w\/PR:\w\/UI:\w\/S:\w\/C:(\w)\/I:(\w)\/A:(\w)/);
        if (match) {
          // Rough severity from CVSS vector
          const impacts = [match[1], match[2], match[3]];
          if (impacts.includes("H")) severity = impacts.filter(i => i === "H").length >= 2 ? "critical" : "important";
          else if (impacts.includes("L")) severity = "moderate";
          else severity = "low";
        }
      }
      // Check summary for severity hints
      if (severity === "unknown" && v.summary) {
        const s = v.summary.toLowerCase();
        if (s.includes("critical")) severity = "critical";
        else if (s.includes("important")) severity = "important";
        else if (s.includes("moderate")) severity = "moderate";
        else if (s.includes("low")) severity = "low";
      }

      return {
        id: v.id,
        CVE: cves[0] || v.id,
        aliases: cves,
        severity,
        summary: v.summary || v.details?.slice(0, 200) || "",
        modified: v.modified,
        advisory_url: v.id.startsWith("RHSA-") || v.id.startsWith("RHBA-")
          ? `https://access.redhat.com/errata/${v.id.replace(/-/g, "-")}`
          : v.id.startsWith("CVE-")
            ? `https://access.redhat.com/security/cve/${v.id}`
            : `https://osv.dev/vulnerability/${v.id}`,
      };
    });

    return Response.json(vulns, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Request failed" },
      { status: 502 },
    );
  }
}
