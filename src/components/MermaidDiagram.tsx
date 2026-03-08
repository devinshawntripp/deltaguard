"use client";

import { useEffect, useRef, useState } from "react";

export default function MermaidDiagram({ chart, className }: { chart: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Dynamic ESM import — only runs in browser
        const { default: mermaid } = await import("mermaid");

        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
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

        const id = `mmd-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(id, chart.trim());

        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          setStatus("ready");
        }
      } catch (e: unknown) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : String(e);
          console.error("[MermaidDiagram] render failed:", msg);
          setErrorMsg(msg);
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (status === "error") {
    return (
      <details className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
        <summary className="text-xs text-red-400 cursor-pointer">Diagram render error</summary>
        <pre className="text-xs text-red-400 mt-2 overflow-x-auto whitespace-pre-wrap">{errorMsg}</pre>
        <pre className="text-xs muted mt-2 overflow-x-auto whitespace-pre-wrap">{chart.trim()}</pre>
      </details>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-4 [&_svg]:mx-auto ${className ?? ""}`}>
      {status === "loading" && (
        <div className="flex items-center justify-center py-8 text-xs muted">
          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading diagram...
        </div>
      )}
      <div ref={ref} />
    </div>
  );
}
