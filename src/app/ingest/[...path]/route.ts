import { NextRequest, NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxyFetch";

// Same-origin analytics endpoint.
//
// This exists as a route handler rather than a next.config rewrite for a reason specific to this
// cluster: rewrites are performed by Next's built-in fetch, and Node's fetch ignores HTTP_PROXY. The
// pods have no direct egress — everything leaves through the squid proxy at 10.10.10.2:3128 — so the
// rewrite timed out on every request and /ingest returned 500. proxyFetch already tunnels correctly,
// so routing through it fixes analytics without touching the global dispatcher (which would also
// capture in-cluster calls that must NOT go via the proxy).
//
// Why proxy at all: requests to us.i.posthog.com are on every ad-blocker list, and this product sells
// to precisely the audience that runs them. Same-origin requests aren't blocked.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const API = "https://us.i.posthog.com";
const ASSETS = "https://us-assets.i.posthog.com";

function upstreamFor(segments: string[]): string {
  // The SDK bundle and recorder live on the assets host; everything else is ingestion.
  return segments[0] === "static" ? ASSETS : API;
}

async function forward(req: NextRequest, segments: string[]): Promise<NextResponse> {
  const base = upstreamFor(segments);
  const search = req.nextUrl.search || "";
  const target = `${base}/${segments.join("/")}${search}`;

  // Pass through only what PostHog needs. Host must not be forwarded or the upstream TLS/vhost
  // routing breaks, and cookies are ours, not theirs.
  const headers = new Headers();
  for (const k of ["content-type", "accept", "accept-encoding", "user-agent", "referer", "origin"]) {
    const v = req.headers.get(k);
    if (v) headers.set(k, v);
  }
  // Preserve the real client IP so geography and de-duplication still work behind our origin.
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) headers.set("x-forwarded-for", fwd);

  const method = req.method.toUpperCase();
  const body = method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer();

  try {
    const res = await proxyFetch(target, {
      method,
      headers,
      body: body as BodyInit | undefined,
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
    });
    const buf = await res.arrayBuffer();
    const out = new NextResponse(buf, { status: res.status });
    for (const k of ["content-type", "cache-control", "etag"]) {
      const v = res.headers.get(k);
      if (v) out.headers.set(k, v);
    }
    return out;
  } catch {
    // Analytics must never be able to break the page: fail quietly and let the SDK retry.
    return new NextResponse(null, { status: 204 });
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return forward(req, (await ctx.params).path || []);
}
export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return forward(req, (await ctx.params).path || []);
}
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
