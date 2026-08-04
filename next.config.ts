import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pg", "undici"],
  // Proxy analytics through our own origin. Requests to us.i.posthog.com are on every blocklist, so
  // without this a large share of visitors — disproportionately the technical ones this product
  // sells to — are simply missing from the data. Same-origin requests aren't blocked.
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
      { source: "/ingest/:path*", destination: "https://us.i.posthog.com/:path*" },
    ];
  },
  // The proxied endpoints must not be rewritten to a trailing slash or PostHog rejects them.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
