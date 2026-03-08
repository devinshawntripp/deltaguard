"use client";

import { useEffect, useRef, useState } from "react";

let mermaidInitialized = false;

export default function MermaidDiagram({ chart, className }: { chart: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
            themeVariables: {
              primaryColor: "#1e293b",
              primaryTextColor: "#e2e8f0",
              primaryBorderColor: "#475569",
              lineColor: "#64748b",
              secondaryColor: "#0f172a",
              tertiaryColor: "#1e293b",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "13px",
            },
            flowchart: { curve: "basis", padding: 16 },
            sequence: { mirrorActors: false, messageMargin: 40 },
          });
          mermaidInitialized = true;
        }
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(id, chart.trim());
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    })();
    return () => { cancelled = true; };
  }, [chart]);

  if (error) {
    return (
      <pre className="text-xs text-red-400 p-4 rounded-lg border border-red-500/20 bg-red-500/5 overflow-x-auto">
        {error}
      </pre>
    );
  }

  return (
    <div
      ref={ref}
      className={`overflow-x-auto rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-4 [&_svg]:mx-auto ${className ?? ""}`}
    />
  );
}
