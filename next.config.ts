import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pg", "undici"],
  // Analytics is proxied same-origin by the route handler at src/app/ingest/[...path], NOT by a
  // rewrite: rewrites use Node's fetch, which ignores HTTP_PROXY, and these pods have no direct
  // egress — so a rewrite times out and returns 500. See that file for the full reasoning.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
