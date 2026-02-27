"use client";

import { useState } from "react";

export default function CodeCopyBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }
    } catch {
      // Silent failure keeps UX predictable in locked-down browsers.
    }
  }

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wide muted">{label}</div>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1 rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-[11px] font-medium hover:bg-black/[.05] dark:hover:bg-white/[.06] transition"
          aria-label={`Copy ${label}`}
          title={`Copy ${label}`}
        >
          <CopyIcon />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <rect x="4" y="3" width="6" height="7" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <path d="M2.5 8.3H2a1 1 0 0 1-1-1V2.7a1 1 0 0 1 1-1h4.6a1 1 0 0 1 1 1v.5" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
