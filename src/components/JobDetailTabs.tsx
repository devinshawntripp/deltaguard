"use client";

import React from "react";
import ScanDashboardView from "@/components/ScanDashboardView";
import ScanFindingsView from "@/components/ScanFindingsView";
import JobFindings from "@/components/JobFindings";
import ScanThreatView from "@/components/ScanThreatView";
import SbomTabView from "@/components/SbomTabView";
import { openSse } from "@/lib/ssePool";
import { isTerminalStage, isErrorStage } from "@/lib/workflowStages";

type TabId = "dashboard" | "findings" | "threat" | "sbom";

type Props = {
    scanId: string;
    jobStatus: string;
    summaryJson?: {
        summary?: { critical?: number; high?: number; medium?: number; low?: number; total_findings?: number };
        iso_profile?: unknown;
    } | null;
    startedAt?: string | null;
    finishedAt?: string | null;
    displayName?: string;
    progressPct?: number;
    progressMsg?: string | null;
    sbomStatus?: string;
};

const TABS: { id: TabId; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "findings", label: "Findings" },
    { id: "threat", label: "Threat" },
    { id: "sbom", label: "SBOM" },
];

function SeverityBox({
    label,
    count,
    bg,
    text,
    loading,
}: {
    label: string;
    count: number;
    bg: string;
    text: string;
    loading?: boolean;
}) {
    return (
        <div className={`flex flex-col items-center justify-center rounded-lg px-3 py-2 transition-all duration-300 ${bg}`}>
            {loading ? (
                <span className="w-8 h-6 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
            ) : (
                <span className={`text-xl font-bold tabular-nums transition-opacity duration-500 ${text}`}>{count}</span>
            )}
            <span className={`text-xs font-medium ${text} opacity-80`}>{label}</span>
        </div>
    );
}

function FindingsSummaryCard({
    scanId,
    summaryJson,
    jobStatus,
    terminal,
}: {
    scanId: string;
    summaryJson?: Props["summaryJson"];
    jobStatus: string;
    terminal: boolean;
}) {
    const initialSev = React.useMemo(() => {
        const s = summaryJson?.summary ?? (summaryJson as Record<string, number> | null);
        if (s && typeof s === "object" && "critical" in s) {
            return {
                critical: (s as Record<string, number>).critical ?? 0,
                high: (s as Record<string, number>).high ?? 0,
                medium: (s as Record<string, number>).medium ?? 0,
                low: (s as Record<string, number>).low ?? 0,
            };
        }
        return null;
    }, [summaryJson]);

    const [sev, setSev] = React.useState(initialSev ?? { critical: 0, high: 0, medium: 0, low: 0 });
    const [loading, setLoading] = React.useState(!initialSev);

    React.useEffect(() => {
        let cancelled = false;
        async function fetchSummary() {
            try {
                // Cache-bust to avoid stale responses during the done transition
                const res = await fetch(`/api/jobs/${scanId}?_t=${Date.now()}`, { cache: "no-store" });
                if (!res.ok || cancelled) return;
                const job = await res.json();
                // The job might still be "running" from the API's perspective if
                // the NOTIFY arrived before the DB transaction committed
                if (job?.status !== "done" && job?.status !== "failed") return;
                const sj = job?.summary_json;
                if (!sj || cancelled) return;
                const sc = sj?.severity_counts || sj?.severityCounts || sj;
                const c = sc?.Critical ?? sc?.critical ?? 0;
                const h = sc?.High ?? sc?.high ?? 0;
                const m = sc?.Medium ?? sc?.medium ?? 0;
                const l = sc?.Low ?? sc?.low ?? 0;
                // Only update if we have real data — don't flash 0/0/0/0
                const total = c + h + m + l;
                const reportedTotal = sj?.total_findings ?? sj?.totalFindings ?? 0;
                if (total > 0 || reportedTotal > 0) {
                    setSev({ critical: c, high: h, medium: m, low: l });
                    setLoading(false);
                } else if (job?.status === "done" && sj && Object.keys(sj).length > 0) {
                    // Job is done and summary exists but truly has 0 findings
                    setSev({ critical: 0, high: 0, medium: 0, low: 0 });
                    setLoading(false);
                }
                // If sj exists but has no useful keys, keep skeleton (shouldn't happen)
            } catch { /* non-fatal */ }
        }

        if (terminal) {
            // Fetch immediately, then retry with backoff to let summary_json populate.
            fetchSummary();
            const t1 = setTimeout(fetchSummary, 1000);
            const t2 = setTimeout(fetchSummary, 3000);
            const t3 = setTimeout(fetchSummary, 6000);
            return () => { cancelled = true; clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
        }

        // Initial fetch for non-terminal jobs
        if (jobStatus !== "queued") {
            fetchSummary();
        }

        return () => { cancelled = true; };
    }, [scanId, jobStatus, terminal]);

    const total = sev.critical + sev.high + sev.medium + sev.low;
    // Show "Finalizing..." when job is done but findings haven't loaded yet
    const finalizing = terminal && total === 0 && loading;

    return (
        <div className="surface-card p-4">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">Findings Summary</span>
                {finalizing ? (
                    <span className="text-xs muted animate-pulse">Finalizing results...</span>
                ) : total > 0 ? (
                    <span className="text-xs muted tabular-nums">{total} total</span>
                ) : null}
            </div>
            {finalizing ? (
                <div className="grid grid-cols-4 gap-2">
                    <div className="rounded-lg bg-black/5 dark:bg-white/5 p-3 animate-pulse"><div className="h-6 rounded bg-black/10 dark:bg-white/10 mb-1" /><div className="h-3 rounded bg-black/5 dark:bg-white/5 w-12" /></div>
                    <div className="rounded-lg bg-black/5 dark:bg-white/5 p-3 animate-pulse"><div className="h-6 rounded bg-black/10 dark:bg-white/10 mb-1" /><div className="h-3 rounded bg-black/5 dark:bg-white/5 w-12" /></div>
                    <div className="rounded-lg bg-black/5 dark:bg-white/5 p-3 animate-pulse"><div className="h-6 rounded bg-black/10 dark:bg-white/10 mb-1" /><div className="h-3 rounded bg-black/5 dark:bg-white/5 w-12" /></div>
                    <div className="rounded-lg bg-black/5 dark:bg-white/5 p-3 animate-pulse"><div className="h-6 rounded bg-black/10 dark:bg-white/10 mb-1" /><div className="h-3 rounded bg-black/5 dark:bg-white/5 w-12" /></div>
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-2">
                    <SeverityBox label="Critical" count={sev.critical} bg="bg-red-50 dark:bg-red-950/40" text="text-red-700 dark:text-red-300" loading={loading} />
                    <SeverityBox label="High" count={sev.high} bg="bg-orange-50 dark:bg-orange-950/40" text="text-orange-700 dark:text-orange-300" loading={loading} />
                    <SeverityBox label="Medium" count={sev.medium} bg="bg-yellow-50 dark:bg-yellow-950/40" text="text-yellow-700 dark:text-yellow-300" loading={loading} />
                    <SeverityBox label="Low" count={sev.low} bg="bg-blue-50 dark:bg-blue-950/40" text="text-blue-700 dark:text-blue-300" loading={loading} />
                </div>
            )}
        </div>
    );
}

export default function JobDetailTabs({
    scanId,
    jobStatus,
    summaryJson,
    startedAt,
    finishedAt,
    displayName,
    progressPct,
    progressMsg,
    sbomStatus,
}: Props) {
    const [tab, setTab] = React.useState<TabId>("dashboard");
    const [liveStatus, setLiveStatus] = React.useState(jobStatus);
    const [liveSbomStatus, setLiveSbomStatus] = React.useState(sbomStatus || "pending");

    // SSE subscription to track live job status + SBOM status
    React.useEffect(() => {
        // Keep listening even after job is done — SBOM events arrive after terminal
        const allDone = (liveStatus === "done" || liveStatus === "failed") && liveSbomStatus === "ready";
        if (allDone) return;

        let closeRef: (() => void) | null = null;
        const promise = openSse(`/api/jobs/${scanId}/events`, {
            onMessage: (ev: MessageEvent) => {
                try {
                    const event = JSON.parse(typeof ev.data === "string" ? ev.data : "{}");
                    if (!event.stage) return;
                    if (isTerminalStage(event.stage)) {
                        setLiveStatus(isErrorStage(event.stage) ? "failed" : "done");
                    } else {
                        setLiveStatus((cur) => cur === "queued" ? "running" : cur);
                    }
                    if (event.stage === "sbom_export_complete") {
                        setLiveSbomStatus("ready");
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
    }, [scanId, liveStatus, liveSbomStatus]);

    const isDone = liveStatus === "done";
    const terminal = liveStatus === "done" || liveStatus === "failed";

    return (
        <div className="grid gap-4">
            {/* Findings summary — visible on ALL tabs */}
            <FindingsSummaryCard
                scanId={scanId}
                summaryJson={summaryJson}
                jobStatus={liveStatus}
                terminal={terminal}
            />

            {/* Tab switcher */}
            <div className="flex gap-1 p-1 rounded-lg bg-black/5 dark:bg-white/5 w-fit">
                {TABS.map((t) => {
                    const isActive = tab === t.id;
                    const isDisabled = (t.id === "threat" || t.id === "sbom") && !isDone;
                    return (
                        <button
                            key={t.id}
                            onClick={() => !isDisabled && setTab(t.id)}
                            disabled={isDisabled}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                isActive
                                    ? "bg-white dark:bg-white/10 shadow-sm"
                                    : isDisabled
                                    ? "opacity-40 cursor-not-allowed"
                                    : "hover:bg-white/50 dark:hover:bg-white/5"
                            }`}
                        >
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab content */}
            {tab === "dashboard" && (
                <ScanDashboardView
                    scanId={scanId}
                    jobStatus={liveStatus}
                    summaryJson={summaryJson}
                    startedAt={startedAt}
                    finishedAt={finishedAt}
                    initialPct={progressPct}
                    initialMsg={progressMsg}
                />
            )}
            {tab === "findings" && (
                <>
                    <ScanFindingsView
                        scanId={scanId}
                        jobStatus={liveStatus}
                        summaryJson={summaryJson}
                        startedAt={startedAt}
                        finishedAt={finishedAt}
                        displayName={displayName}
                    />
                    {isDone && <JobFindings jobId={scanId} />}
                </>
            )}
            {tab === "threat" && (
                <ScanThreatView
                    scanId={scanId}
                    jobStatus={liveStatus}
                    summaryJson={summaryJson}
                />
            )}
            {tab === "sbom" && (
                <SbomTabView
                    jobId={scanId}
                    sbomStatus={liveSbomStatus}
                />
            )}
        </div>
    );
}
