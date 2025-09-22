"use client";
import React from "react";

type ProgressEvent = { stage: string; detail?: string; ts?: string };

function parse(lines: string[]): ProgressEvent[] {
    const out: ProgressEvent[] = [];
    const seen = new Set<string>();
    for (const l of lines) {
        try {
            const j = JSON.parse(l);
            if (j?.stage) {
                const key = `${j.stage}|${j.detail ?? ""}|${j.ts ?? ""}`;
                if (seen.has(key)) continue;
                seen.add(key);
                out.push({ stage: String(j.stage), detail: j.detail ?? undefined, ts: j.ts ?? undefined });
            }
        } catch { }
    }
    return out;
}

const BACKDROP = {
    background:
        "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.20), transparent 35%), radial-gradient(circle at 80% 30%, rgba(236,72,153,0.15), transparent 40%), radial-gradient(circle at 30% 80%, rgba(16,185,129,0.15), transparent 35%)",
};

export default function ProgressGraph({ scanId }: { scanId: string }) {
    const [lines, setLines] = React.useState<string[]>([]);
    const [active, setActive] = React.useState<string | null>(null);

    React.useEffect(() => {
        const es = new EventSource(`/api/scans/${scanId}/events`);
        es.onmessage = (ev) => setLines((prev) => [...prev, ev.data]);
        es.onerror = () => es.close();
        return () => es.close();
    }, [scanId]);

    const events = React.useMemo(() => parse(lines), [lines]);

    const stages = React.useMemo(() => {
        const group = (s: string) => {
            const raw = s.replace(/\.(start|done|ok|err|error|skip)$/i, "");
            // Ensure summary is not grouped under scan
            if (raw === "scan.summary") return "summary";
            if (/(^|\.)osv(\.|$)/i.test(raw)) return "osv";
            if (/(^|\.)nvd(\.|$)/i.test(raw)) return "nvd";
            if (raw.startsWith("container.packages")) return "packages";
            if (raw.startsWith("container.extract") || raw.startsWith("container.layers")) return "extract";
            if (raw === "scan" || raw.startsWith("scan.")) return "scan";
            if (raw.startsWith("binary")) return "binary";
            return raw;
        };
        const acc: Record<string, ProgressEvent[]> = {};
        for (const e of events) {
            const key = group(e.stage);
            (acc[key] ||= []).push(e);
        }
        return acc;
    }, [events]);

    const labels: Record<string, string> = {
        scan: "Scan start",
        extract: "Extract image",
        packages: "Detect packages",
        osv: "Query/Enrich OSV",
        nvd: "NVD cache/Enrichment",
        binary: "Binary analysis",
        summary: "Scan end",
    };
    const icons: Record<string, string> = {
        scan: "🚀",
        extract: "📦",
        packages: "🧪",
        osv: "🌐",
        nvd: "🗄️",
        binary: "🧰",
        summary: "✅",
    };
    const order = ["scan", "extract", "packages", "osv", "nvd", "binary", "summary"];
    const rank = (k: string) => { const i = order.indexOf(k); return i === -1 ? 999 : i; };
    const ordered = Object.keys(stages).sort((a, b) => rank(a) - rank(b));

    if (!events.length) return null;

    function safeSummary(text: string) {
        try { const j = JSON.parse(text); return JSON.stringify(j, null, 2); } catch { return text; }
    }

    return (
        <div className="relative grid gap-4 rounded-2xl border border-black/10 dark:border-white/10 p-4 overflow-hidden" style={BACKDROP}>
            <div className="flex items-start gap-6 overflow-x-auto py-2">
                {ordered.map((id) => {
                    const subs = stages[id] || [];
                    const isActive = subs.some((e) => /\.start$/.test(e.stage)) && !subs.some((e) => /\.done$/.test(e.stage) || e.stage.endsWith(".ok") || e.stage === "scan.done" || id === "summary");
                    const done = !isActive && (subs.some((e) => /\.done$/.test(e.stage) || e.stage.endsWith(".ok") || e.stage === "scan.done") || id === "summary");
                    const color = done ? "bg-green-600" : isActive ? "bg-blue-600 ring-4 ring-blue-300/60 animate-pulse" : "bg-gray-400 dark:bg-gray-600";
                    return (
                        <div key={id} className="flex items-start gap-3 min-w-[220px]">
                            <div className="flex flex-col items-stretch gap-2">
                                <div onClick={() => setActive(id)} className={`relative cursor-pointer rounded-xl border border-black/10 dark:border-white/10 px-4 py-3 bg-white/75 dark:bg-black/45 shadow-sm transition ${active === id ? "outline outline-2 outline-blue-400/40" : ""}`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-sm text-white ${color}`}>{icons[id] || "★"}</div>
                                        <div className="text-sm font-semibold whitespace-nowrap">{labels[id] || id}</div>
                                    </div>
                                    <div className="mt-2 text-[11px] text-black/70 dark:text-white/70">
                                        <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">Events: {subs.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {active && (
                <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/40 overflow-hidden">
                    <div className="px-3 py-2 text-xs font-semibold border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                        <span>Stage details: {active}</span>
                        <button className="opacity-70 hover:opacity-100" onClick={() => setActive(null)}>Close</button>
                    </div>
                    <div className="max-h-56 overflow-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-black/[.04] dark:bg-white/[.04]">
                                <tr>
                                    <th className="p-2 text-left">Time</th>
                                    <th className="p-2 text-left">Stage</th>
                                    <th className="p-2 text-left">Detail</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(stages[active] || []).map((e, idx) => (
                                    <tr key={`${e.stage}-${idx}`} className="border-t border-black/5 dark:border-white/5">
                                        <td className="p-2 whitespace-nowrap opacity-70">{e.ts ? new Date(e.ts).toLocaleTimeString() : ""}</td>
                                        <td className="p-2 font-medium">{e.stage}</td>
                                        <td className="p-2 opacity-80 break-words">{active === "summary" && e.detail ? <pre className="whitespace-pre-wrap">{safeSummary(e.detail)}</pre> : (e.detail || "")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}


