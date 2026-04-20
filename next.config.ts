import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output — produces a self-contained build without full node_modules.
  // This eliminates unused transitive dependencies from the production image,
  // reducing both image size (~800MB → ~200MB) and vulnerability surface.
  output: "standalone",
  // Mark server-only modules so Turbopack doesn't try to bundle them for the client
  serverExternalPackages: ["pg", "undici"],
};

export default nextConfig;
