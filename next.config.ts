import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Mark server-only modules so Turbopack doesn't try to bundle them for the client
  serverExternalPackages: ["pg"],
};

export default nextConfig;
