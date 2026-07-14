"use client";
import React from "react";

/**
 * Compact job-id chip: shows the first 8 chars in monospace with a copy button
 * that copies the full id. Replaces the old full-width "Job" table column.
 */
export default function JobIdChip({ id, className = "" }: { id: string; className?: string }) {
    const [copied, setCopied] = React.useState(false);

    const copy = React.useCallback(
        async (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            try {
                await navigator.clipboard.writeText(id);
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
            } catch {
                /* clipboard unavailable — ignore */
            }
        },
        [id],
    );

    return (
        <button
            type="button"
            onClick={copy}
            title={copied ? "Copied!" : `Copy job ID: ${id}`}
            aria-label={`Copy job ID ${id}`}
            className={`group inline-flex items-center gap-1 rounded-md border border-black/10 dark:border-white/10 bg-black/[.03] dark:bg-white/[.04] px-1.5 py-0.5 font-mono text-[10px] leading-none text-current/70 hover:border-[var(--dg-accent,#2563eb)] transition-colors ${className}`}
        >
            <span>{id.slice(0, 8)}</span>
            {copied ? (
                <svg viewBox="0 0 24 24" width="11" height="11" className="text-emerald-500" aria-hidden>
                    <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ) : (
                <svg viewBox="0 0 24 24" width="11" height="11" className="opacity-50 group-hover:opacity-90" aria-hidden>
                    <rect x="9" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M5 15V5a2 2 0 012-2h10" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
            )}
        </button>
    );
}
