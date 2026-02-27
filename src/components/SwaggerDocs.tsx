"use client";

import type { ComponentType } from "react";
import dynamic from "next/dynamic";

const SwaggerUI = dynamic(async () => {
  const mod = await import("swagger-ui-react");
  return mod.default as ComponentType<Record<string, unknown>>;
}, { ssr: false });

export default function SwaggerDocs() {
  return (
    <div
      className="swagger-surface rounded-xl border border-black/10 dark:border-white/10 overflow-hidden"
    >
      <SwaggerUI
        url="/api/openapi"
        docExpansion="list"
        defaultModelsExpandDepth={1}
        displayRequestDuration
        deepLinking
        persistAuthorization
      />
    </div>
  );
}
