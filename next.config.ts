import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mark server-only modules so Turbopack doesn't try to bundle them for the client
  serverExternalPackages: ["pg", "undici"],
};

export default nextConfig;
