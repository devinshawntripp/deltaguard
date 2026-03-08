"use client";
import React from "react";
import Link from "next/link";
import { openSse } from "@/lib/ssePool";
import { isTerminalStage, mapEventToWorkflowStage, WORKFLOW_STAGE_LABELS } from "@/lib/workflowStages";

type Props = {
    scanId: string;
    eventsPath?: string;
    jobStatus: string;
    summaryJson?: {
        summary?: { critical?: number; high?: number; medium?: number; low?: number; total_findings?: number };
    } | null;
    startedAt?: string | null;
    finishedAt?: string | null;
    displayName?: string;
};

type ScanEvent = { stage: string; detail?: string; pct?: number };

type FindingRow = {
    id?: string;
    severity?: string;
    package?: { name?: string } | null;
    cvss?: { base?: number } | null;
    epss_score?: number | null;
};

// --- Helpers ---

function severityBadge(s: string): string {
    const u = s.toUpperCase();
    if (u === "CRITICAL") return "bg-red-700 text-white";
    if (u === "HIGH") return "bg-orange-600 text-white";
    if (u === "MEDIUM") return "bg-yellow-500 text-black";
    if (u === "LOW") return "bg-sky-700 text-white";
    return "bg-black/20 dark:text-white";
}

function formatElapsed(ms: number): string {
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    return `${m}m ${s % 60}s`;
}

function phaseLabel(stage: string, detail?: string): string {
    const ws = mapEventToWorkflowStage(stage, detail);
    if (ws && WORKFLOW_STAGE_LABELS[ws]) return WORKFLOW_STAGE_LABELS[ws];
    return stage || "Processing...";
}

function SeverityPill({ label, count, pill }: { label: string; count: number; pill: string }) {
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${pill}`}>
            {label} <span className="tabular-nums">{count}</span>
        </span>
    );
}

// --- Main component ---

export default function ScanFindingsView({
    scanId,
    eventsPath,
    jobStatus,
    summaryJson,
    startedAt,
    finishedAt,
    displayName,
}: Props) {
    const [pct, setPct] = React.useState(0);
    const [currentStage, setCurrentStage] = React.useState("");
    const [currentDetail, setCurrentDetail] = React.useState<string | undefined>(undefined);
    const [elapsed, setElapsed] = React.useState(0);
    const [findings, setFindings] = React.useState<FindingRow[]>([]);
    const [findingsLoading, setFindingsLoading] = React.useState(true);
    const [findingsError, setFindingsError] = React.useState<string | null>(null);
    const [cancelLoading, setCancelLoading] = React.useState(false);
    const [cancelError, setCancelError] = React.useState<string | null>(null);
    const [fetchTick, setFetchTick] = React.useState(0);

    const isActive = jobStatus === "running" || jobStatus === "queued";
    const isDone = jobStatus === "done";

    const startRef = React.useRef<number>(
        startedAt ? new Date(startedAt).getTime() : Date.now()
    );

    // Elapsed timer (UI-only — acceptable per CLAUDE.md)
    React.useEffect(() => {
        if (!isActive) {
            if (startedAt && finishedAt) {
                setElapsed(new Date(finishedAt).getTime() - new Date(startedAt).getTime());
            }
            return;
        }
        const id = setInterval(() => setElapsed(Date.now() - startRef.current), 1000);
        return () => clearInterval(id);
    }, [isActive, startedAt, finishedAt]);

    // SSE subscription — drives fetchTick on each event so findings stay fresh
    React.useEffect(() => {
        if (!isActive) return;
        const url = eventsPath ?? `/api/jobs/${scanId}/events`;
        let closeRef: (() => void) | null = null;

        const promise = openSse(url, {
            onMessage: (ev: MessageEvent) => {
                try {
                    const event = JSON.parse(typeof ev.data === "string" ? ev.data : "{}") as ScanEvent;
                    if (!event.stage) return;
                    if (typeof event.pct === "number") setPct((cur) => Math.max(cur, event.pct as number));
                    setCurrentStage(event.stage);
                    setCurrentDetail(event.detail);
                    if (isTerminalStage(event.stage)) {
                        setPct(100);
                        setFetchTick((t) => t + 1);
                    } else {
                        // Trigger a findings re-fetch on enrichment-phase events
                        const ws = mapEventToWorkflowStage(event.stage, event.detail);
                        if (ws === "osv" || ws === "nvd" || ws === "epss" || ws === "complete") {
                            setFetchTick((t) => t + 1);
                        }
                    }
                } catch { /* ignore */ }
            },
            onError: () => { /* SSE pool handles reconnect */ },
        });

        promise.then((close) => { closeRef = close; });
        return () => {
            if (closeRef) closeRef();
            else promise.then((close) => close());
        };
    }, [scanId, eventsPath, isActive]);

    // Fetch top-5 findings — triggered by SSE events (fetchTick) or on mount/done
    React.useEffect(() => {
        let cancelled = false;
        setFindingsLoading(true);
        setFindingsError(null);

        fetch(
            `/api/jobs/${scanId}/findings?page=1&page_size=5&sort=severity&order=desc`,
            { cache: "no-store" }
        )
            .then((r) => r.json())
            .then((json) => {
                if (cancelled) return;
                if (json.error) throw new Error(json.error);
                setFindings(Array.isArray(json.items) ? json.items : []);
                setFindingsLoading(false);
            })
            .catch((e: unknown) => {
                if (cancelled) return;
                setFindingsError(e instanceof Error ? e.message : String(e));
                setFindingsLoading(false);
            });

        return () => { cancelled = true; };
        // fetchTick changes when SSE events arrive; isDone triggers one final fetch
    }, [scanId, fetchTick, isDone]); // eslint-disable-line react-hooks/exhaustive-deps

    async function handleCancel() {
        setCancelLoading(true);
        setCancelError(null);
        try {
            const res = await fetch(`/api/jobs/${scanId}/cancel`, { method: "POST" });
            const body = await res.json();
            if (!res.ok) throw new Error(body.error || "Cancel failed");
            try { window.dispatchEvent(new CustomEvent("jobs-refresh")); } catch { /* noop */ }
        } catch (e: unknown) {
            setCancelError(e instanceof Error ? e.message : String(e));
        } finally {
            setCancelLoading(false);
        }
    }

    // Use API-fetched summary when available; fall back to summaryJson prop
    const [apiSummary, setApiSummary] = React.useState<Record<string, number> | null>(null);
    // Piggyback on the existing findings fetch to grab summary counts
    React.useEffect(() => {
        fetch(`/api/jobs/${scanId}/findings?page_size=1`, { cache: "no-store" })
            .then((r) => r.json())
            .then((json) => { if (json?.summary) setApiSummary(json.summary); })
            .catch(() => { /* non-fatal */ });
    }, [scanId, fetchTick, isDone]);
    const sev = apiSummary ?? summaryJson?.summary;
    const critical = sev?.critical ?? 0;
    const high = sev?.high ?? 0;
    const medium = sev?.medium ?? 0;
    const low = sev?.low ?? 0;
    const displayPct = isDone ? 100 : Math.min(pct, 99);

    return (
        <div className="surface-card p-5 grid gap-5">
            {/* Progress bar */}
            <div className="grid gap-1.5">
                <div className="flex items-center justify-between text-xs">
                    <span className="font-medium truncate max-w-[60%]">{displayName ?? scanId}</span>
                    <span className="muted tabular-nums">{formatElapsed(elapsed)}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-[width] duration-700 ease-out ${isDone ? "bg-emerald-500" : "bg-blue-500"}`}
                        style={{ width: `${isDone ? 100 : displayPct}%` }}
                    />
                </div>
                <div className="flex items-center justify-between text-[11px] muted">
                    <span>
                        {isDone
                            ? "Complete"
                            : currentStage
                                ? phaseLabel(currentStage, currentDetail)
                                : jobStatus === "queued"
                                    ? "Waiting in queue..."
                                    : "Starting..."}
                    </span>
                    <span className="tabular-nums">{isDone ? "100" : displayPct}%</span>
                </div>
            </div>

            {/* Severity pills */}
            <div className="flex flex-wrap gap-2">
                <SeverityPill label="Critical" count={critical} pill="bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200" />
                <SeverityPill label="High" count={high} pill="bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-200" />
                <SeverityPill label="Medium" count={medium} pill="bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200" />
                <SeverityPill label="Low" count={low} pill="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200" />
            </div>

            {/* Top-5 findings table */}
            <div className="rounded-md border border-black/10 dark:border-white/10 overflow-hidden">
                <div className="px-3 py-2 bg-black/[.03] dark:bg-white/[.03] border-b border-black/10 dark:border-white/10 text-xs font-semibold">
                    Top Findings
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-sm">
                        <thead className="bg-black/[.02] dark:bg-white/[.02]">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium muted">CVE ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium muted">Severity</th>
                                <th className="px-3 py-2 text-left text-xs font-medium muted">Package</th>
                                <th className="px-3 py-2 text-left text-xs font-medium muted">CVSS</th>
                                <th className="px-3 py-2 text-left text-xs font-medium muted">EPSS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {findingsLoading ? (
                                <tr>
                                    <td className="px-3 py-4 text-xs muted" colSpan={5}>Loading findings...</td>
                                </tr>
                            ) : findingsError ? (
                                <tr>
                                    <td className="px-3 py-4 text-xs text-red-500" colSpan={5}>{findingsError}</td>
                                </tr>
                            ) : findings.length === 0 ? (
                                <tr>
                                    <td className="px-3 py-4 text-xs muted" colSpan={5}>
                                        {isActive ? "Waiting for findings..." : "No findings."}
                                    </td>
                                </tr>
                            ) : findings.map((f, i) => {
                                const id = String(f.id || "").trim().toUpperCase();
                                const sev = String(f.severity || "").toUpperCase();
                                const pkg = f.package?.name || "-";
                                const cvss = f.cvss?.base != null ? Number(f.cvss.base).toFixed(1) : "-";
                                const epss = f.epss_score != null
                                    ? `${(Number(f.epss_score) * 100).toFixed(2)}%`
                                    : "-";
                                const ext = /^CVE-\d{4}-\d+$/i.test(id)
                                    ? `https://nvd.nist.gov/vuln/detail/${id}`
                                    : null;
                                return (
                                    <tr key={`${id}-${i}`} className="border-t border-black/5 dark:border-white/5">
                                        <td className="px-3 py-2 font-mono text-xs">
                                            {ext ? (
                                                <a href={ext} target="_blank" rel="noreferrer"
                                                    className="text-blue-700 dark:text-blue-400 underline underline-offset-2">
                                                    {id || "-"}
                                                </a>
                                            ) : (id || "-")}
                                        </td>
                                        <td className="px-3 py-2">
                                            {sev ? (
                                                <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${severityBadge(sev)}`}>
                                                    {sev}
                                                </span>
                                            ) : "-"}
                                        </td>
                                        <td className="px-3 py-2 text-xs">{pkg}</td>
                                        <td className="px-3 py-2 text-xs tabular-nums">{cvss}</td>
                                        <td className="px-3 py-2 text-xs tabular-nums">{epss}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom actions */}
            <div className="flex flex-wrap items-center gap-2">
                <Link
                    href={`/dashboard/${scanId}/findings`}
                    className="btn-primary text-sm inline-flex items-center gap-1.5"
                >
                    View All Findings
                </Link>
                {(isActive) && (
                    <>
                        <button
                            onClick={handleCancel}
                            disabled={cancelLoading}
                            className="text-sm px-3 py-1.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 font-medium transition-colors disabled:opacity-50"
                        >
                            {cancelLoading ? "Cancelling..." : "Cancel Scan"}
                        </button>
                        {cancelError && <span className="text-xs text-red-500">{cancelError}</span>}
                    </>
                )}
            </div>
        </div>
    );
}
