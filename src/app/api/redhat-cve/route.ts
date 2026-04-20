import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxyFetch";

export async function GET(req: NextRequest) {
  const pkg = req.nextUrl.searchParams.get("package") || "openssl";
  try {
    const res = await proxyFetch(
      `https://access.redhat.com/hydra/rest/search/cve.json?package=${encodeURIComponent(pkg)}&per_page=20`,
    );
    if (!res.ok) {
      return Response.json(
        { error: `Red Hat API returned ${res.status}` },
        { status: res.status },
      );
    }
    const data = await res.json();
    return Response.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Proxy request failed" },
      { status: 502 },
    );
  }
}
