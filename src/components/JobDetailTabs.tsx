"use client";

import React from "react";
import ScanDashboardView from "@/components/ScanDashboardView";
import ScanFindingsView from "@/components/ScanFindingsView";
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

    // SSE subscription to track live job status
    React.useEffect(() => {
        if (liveStatus === "done" || liveStatus === "failed") return;

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
                } catch { /* ignore */ }
            },
            onError: () => { /* SSE pool handles reconnect */ },
        });

        promise.then((close) => { closeRef = close; });
        return () => {
            if (closeRef) closeRef();
            else promise.then((close) => close());
        };
    }, [scanId, liveStatus]);

    const isDone = liveStatus === "done";

    return (
        <div className="grid gap-4">
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
                <ScanFindingsView
                    scanId={scanId}
                    jobStatus={liveStatus}
                    summaryJson={summaryJson}
                    startedAt={startedAt}
                    finishedAt={finishedAt}
                    displayName={displayName}
                />
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
                    sbomStatus={sbomStatus || "pending"}
                />
            )}
        </div>
    );
}
