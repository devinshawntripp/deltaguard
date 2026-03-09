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
        <div className={`flex flex-col items-center justify-center rounded-lg px-3 py-2 ${bg}`}>
            {loading ? (
                <span className="w-8 h-6 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
            ) : (
                <span className={`text-xl font-bold tabular-nums ${text}`}>{count}</span>
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
                const res = await fetch(`/api/jobs/${scanId}/findings?page_size=1`);
                if (!res.ok || cancelled) return;
                const data = await res.json();
                const s = data?.summary;
                if (s && !cancelled) {
                    setSev({
                        critical: s.critical ?? 0,
                        high: s.high ?? 0,
                        medium: s.medium ?? 0,
                        low: s.low ?? 0,
                    });
                    setLoading(false);
                }
            } catch { /* non-fatal */ }
        }

        if (terminal) {
            // Fetch immediately, then retry after delay to let DB writes settle
            fetchSummary();
            const t1 = setTimeout(fetchSummary, 2000);
            return () => { cancelled = true; clearTimeout(t1); };
        }

        // Initial fetch for non-terminal jobs
        if (jobStatus !== "queued") {
            fetchSummary();
        }

        return () => { cancelled = true; };
    }, [scanId, jobStatus, terminal]);

    const total = sev.critical + sev.high + sev.medium + sev.low;

    return (
        <div className="surface-card p-4">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">Findings Summary</span>
                {total > 0 && (
                    <span className="text-xs muted tabular-nums">{total} total</span>
                )}
            </div>
            <div className="grid grid-cols-4 gap-2">
                <SeverityBox label="Critical" count={sev.critical} bg="bg-red-50 dark:bg-red-950/40" text="text-red-700 dark:text-red-300" loading={loading} />
                <SeverityBox label="High" count={sev.high} bg="bg-orange-50 dark:bg-orange-950/40" text="text-orange-700 dark:text-orange-300" loading={loading} />
                <SeverityBox label="Medium" count={sev.medium} bg="bg-yellow-50 dark:bg-yellow-950/40" text="text-yellow-700 dark:text-yellow-300" loading={loading} />
                <SeverityBox label="Low" count={sev.low} bg="bg-blue-50 dark:bg-blue-950/40" text="text-blue-700 dark:text-blue-300" loading={loading} />
            </div>
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
