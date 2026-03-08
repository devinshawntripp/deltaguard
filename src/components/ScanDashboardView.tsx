"use client";

import React from "react";
import { openSse } from "@/lib/ssePool";
import { isTerminalStage, isErrorStage, mapEventToWorkflowStage, WORKFLOW_STAGE_LABELS } from "@/lib/workflowStages";
import Link from "next/link";

type SummaryJson = {
    summary?: {
        critical?: number;
        high?: number;
        medium?: number;
        low?: number;
        total_findings?: number;
    };
} | null;

type Props = {
    scanId: string;
    eventsPath?: string;
    jobStatus: string;
    summaryJson?: SummaryJson;
    startedAt?: string | null;
    finishedAt?: string | null;
    initialPct?: number;
    initialMsg?: string | null;
};

type ScanEvent = {
    id?: number;
    stage: string;
    detail?: string;
    ts?: string;
    pct?: number;
};

type Severities = { critical: number; high: number; medium: number; low: number };

// --- Segment progress bar ---

const SEGMENTS = [
    { label: "Download", from: 0, to: 5, color: "bg-sky-500" },
    { label: "Scan", from: 5, to: 35, color: "bg-violet-500" },
    { label: "Enrich", from: 35, to: 95, color: "bg-amber-500" },
    { label: "Report", from: 95, to: 100, color: "bg-emerald-500" },
] as const;

function SegmentBar({ pct }: { pct: number }) {
    return (
        <div className="w-full">
            <div className="flex gap-1 h-2">
                {SEGMENTS.map((seg) => {
                    const segSpan = seg.to - seg.from;
                    const filled = Math.max(0, Math.min(segSpan, pct - seg.from));
                    const fillPct = (filled / segSpan) * 100;
                    return (
                        <div
                            key={seg.label}
                            className="flex-1 rounded-sm overflow-hidden bg-black/10 dark:bg-white/10"
                        >
                            <div
                                className={`h-full ${seg.color} transition-[width] duration-700 ease-out`}
                                style={{ width: `${fillPct}%` }}
                            />
                        </div>
                    );
                })}
            </div>
            <div className="flex gap-1 mt-1">
                {SEGMENTS.map((seg) => (
                    <div key={seg.label} className="flex-1 text-center text-[10px] muted">
                        {seg.label}
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- Circular progress ring ---

const RING_R = 40;
const RING_C = 2 * Math.PI * RING_R;

function CircleRing({ pct, failed }: { pct: number; failed?: boolean }) {
    const dashOffset = RING_C * (1 - Math.min(100, pct) / 100);
    const ringColor = failed ? "stroke-red-500" : pct === 100 ? "stroke-emerald-500" : "stroke-blue-500";

    return (
        <svg width="100" height="100" viewBox="0 0 100 100" className="shrink-0">
            <circle
                cx="50"
                cy="50"
                r={RING_R}
                fill="none"
                className="stroke-black/10 dark:stroke-white/10"
                strokeWidth="8"
            />
            <circle
                cx="50"
                cy="50"
                r={RING_R}
                fill="none"
                className={`${ringColor} transition-all duration-700 ease-out`}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 50 50)"
            />
            <text
                x="50"
                y="50"
                dominantBaseline="central"
                textAnchor="middle"
                className="fill-current"
                fontSize="16"
                fontWeight="700"
            >
                {failed ? "!" : `${Math.round(pct)}%`}
            </text>
        </svg>
    );
}

// --- Severity counter box ---

function SeverityBox({
    label,
    count,
    bg,
    text,
}: {
    label: string;
    count: number;
    bg: string;
    text: string;
}) {
    return (
        <div className={`flex flex-col items-center justify-center rounded-lg px-3 py-2 ${bg}`}>
            <span className={`text-xl font-bold tabular-nums ${text}`}>{count}</span>
            <span className={`text-xs font-medium ${text} opacity-80`}>{label}</span>
        </div>
    );
}

// --- Severity horizontal bar (done state) ---

function SeverityBar({
    label,
    count,
    total,
    bar,
    text,
}: {
    label: string;
    count: number;
    total: number;
    bar: string;
    text: string;
}) {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="flex items-center gap-3">
            <span className={`w-16 text-xs font-medium text-right ${text}`}>{label}</span>
            <div className="flex-1 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                    className={`h-full rounded-full ${bar}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="w-8 text-xs tabular-nums muted text-right">{count}</span>
        </div>
    );
}

// --- Elapsed time formatter ---

function formatElapsed(ms: number): string {
    const secs = Math.floor(ms / 1000);
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem}s`;
}

// --- Phase label from stage ---

function phaseLabel(stage: string, detail?: string): string {
    const ws = mapEventToWorkflowStage(stage, detail);
    if (ws && WORKFLOW_STAGE_LABELS[ws]) return WORKFLOW_STAGE_LABELS[ws];
    return stage || "Processing...";
}

// --- Main component ---

export default function ScanDashboardView({
    scanId,
    eventsPath,
    jobStatus,
    summaryJson,
    startedAt,
    finishedAt,
    initialPct,
    initialMsg,
}: Props) {
    const [pct, setPct] = React.useState(initialPct ?? 0);
    const [currentStage, setCurrentStage] = React.useState(initialMsg ?? "");
    const [currentDetail, setCurrentDetail] = React.useState<string | undefined>(undefined);
    const [liveSev, setLiveSev] = React.useState<Severities>(() => {
        const s = summaryJson?.summary ?? (summaryJson as Record<string, number> | null);
        if (s && typeof s === "object" && "critical" in s) {
            return {
                critical: (s as Record<string, number>).critical ?? 0,
                high: (s as Record<string, number>).high ?? 0,
                medium: (s as Record<string, number>).medium ?? 0,
                low: (s as Record<string, number>).low ?? 0,
            };
        }
        return { critical: 0, high: 0, medium: 0, low: 0 };
    });
    const [elapsed, setElapsed] = React.useState(0);
    const [terminal, setTerminal] = React.useState(jobStatus === "done" || jobStatus === "failed");
    const [terminalError, setTerminalError] = React.useState(jobStatus === "failed");

    // Derive display state from both prop and SSE-detected terminal state
    const isDone = jobStatus === "done" || (terminal && !terminalError);
    const isFailed = jobStatus === "failed" || terminalError;
    const isActive = !isDone && !isFailed;

    // Elapsed timer — UI-only, acceptable setInterval per CLAUDE.md
    const startRef = React.useRef<number>(
        startedAt ? new Date(startedAt).getTime() : Date.now()
    );

    React.useEffect(() => {
        if (!isActive) {
            if (startedAt && finishedAt) {
                setElapsed(new Date(finishedAt).getTime() - new Date(startedAt).getTime());
            }
            return;
        }
        const id = setInterval(() => {
            setElapsed(Date.now() - startRef.current);
        }, 1000);
        return () => clearInterval(id);
    }, [isActive, startedAt, finishedAt]);

    // SSE subscription
    React.useEffect(() => {
        if (!isActive) return;

        const url = eventsPath ?? `/api/jobs/${scanId}/events`;
        let closeRef: (() => void) | null = null;

        const promise = openSse(url, {
            onMessage: (ev: MessageEvent) => {
                try {
                    const raw = JSON.parse(typeof ev.data === "string" ? ev.data : "{}") as Record<string, unknown>;
                    const event = raw as ScanEvent;
                    if (!event.stage) return;

                    if (typeof event.pct === "number") {
                        setPct((cur) => Math.max(cur, event.pct as number));
                    }

                    setCurrentStage(event.stage);
                    setCurrentDetail(event.detail);

                    if (isTerminalStage(event.stage)) {
                        setTerminal(true);
                        if (isErrorStage(event.stage)) setTerminalError(true);
                        setPct(100);
                    }
                } catch {
                    // ignore malformed events
                }
            },
            onError: () => {
                // connection dropped — SSE pool handles reconnect
            },
        });

        promise.then((close) => { closeRef = close; });

        return () => {
            if (closeRef) closeRef();
            else promise.then((close) => close());
        };
    }, [scanId, eventsPath, isActive]);

    // Fetch severity counts from findings API — re-runs on mount, status change, and SSE completion
    React.useEffect(() => {
        let cancelled = false;
        async function fetchSummary() {
            try {
                const res = await fetch(`/api/jobs/${scanId}/findings?page_size=1`);
                if (!res.ok || cancelled) return;
                const data = await res.json();
                const s = data?.summary;
                if (s && !cancelled) {
                    setLiveSev({
                        critical: s.critical ?? 0,
                        high: s.high ?? 0,
                        medium: s.medium ?? 0,
                        low: s.low ?? 0,
                    });
                }
            } catch { /* non-fatal */ }
        }

        if (terminal) {
            // Delay after SSE terminal event to let DB writes settle, then retry
            const timer1 = setTimeout(fetchSummary, 800);
            const timer2 = setTimeout(fetchSummary, 4000);
            return () => { cancelled = true; clearTimeout(timer1); clearTimeout(timer2); };
        }

        fetchSummary();

        // Also poll severity during active scans (findings arrive progressively)
        if (!terminal && jobStatus !== "queued") {
            const interval = setInterval(fetchSummary, 5000);
            return () => { cancelled = true; clearInterval(interval); };
        }

        return () => { cancelled = true; };
    }, [scanId, jobStatus, terminal]);

    const totalFindings = liveSev.critical + liveSev.high + liveSev.medium + liveSev.low;
    const allSev = totalFindings;

    return (
        <div className="surface-card p-5 grid gap-5">
            {/* --- Active / Queued state --- */}
            {isActive && (
                <>
                    <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                        {/* Ring + elapsed */}
                        <div className="flex flex-col items-center gap-1">
                            <CircleRing pct={terminal ? 100 : pct} />
                            <span className="text-xs tabular-nums muted">{formatElapsed(elapsed)}</span>
                        </div>

                        {/* Phase label + severities */}
                        <div className="flex-1 flex flex-col gap-4">
                            {currentStage ? (
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                                    </span>
                                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                        {phaseLabel(currentStage, currentDetail)}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-sm muted">
                                    {jobStatus === "queued" ? "Waiting in queue..." : "Starting..."}
                                </div>
                            )}

                            {/* Live severity counters */}
                            <div className="grid grid-cols-4 gap-2">
                                <SeverityBox label="Critical" count={liveSev.critical} bg="bg-red-50 dark:bg-red-950/40" text="text-red-700 dark:text-red-300" />
                                <SeverityBox label="High" count={liveSev.high} bg="bg-orange-50 dark:bg-orange-950/40" text="text-orange-700 dark:text-orange-300" />
                                <SeverityBox label="Medium" count={liveSev.medium} bg="bg-yellow-50 dark:bg-yellow-950/40" text="text-yellow-700 dark:text-yellow-300" />
                                <SeverityBox label="Low" count={liveSev.low} bg="bg-blue-50 dark:bg-blue-950/40" text="text-blue-700 dark:text-blue-300" />
                            </div>
                        </div>
                    </div>

                    {/* Segment bar */}
                    <SegmentBar pct={terminal ? 100 : pct} />
                </>
            )}

            {/* --- Done state --- */}
            {isDone && (
                <>
                    <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                        <div className="flex flex-col items-center gap-1">
                            <CircleRing pct={100} />
                            <span className="text-xs tabular-nums muted">{formatElapsed(elapsed)}</span>
                        </div>

                        <div className="flex-1 grid gap-3">
                            <div className="flex items-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-emerald-500">
                                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                    Scan complete — {totalFindings} finding{totalFindings !== 1 ? "s" : ""}
                                </span>
                            </div>

                            {/* Severity bars */}
                            <div className="grid gap-2">
                                <SeverityBar label="Critical" count={liveSev.critical} total={allSev} bar="bg-red-500" text="text-red-700 dark:text-red-300" />
                                <SeverityBar label="High" count={liveSev.high} total={allSev} bar="bg-orange-500" text="text-orange-700 dark:text-orange-300" />
                                <SeverityBar label="Medium" count={liveSev.medium} total={allSev} bar="bg-yellow-500" text="text-yellow-700 dark:text-yellow-300" />
                                <SeverityBar label="Low" count={liveSev.low} total={allSev} bar="bg-blue-500" text="text-blue-700 dark:text-blue-300" />
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 flex-wrap">
                        <Link
                            href={`/dashboard/${scanId}/findings`}
                            className="btn-primary text-sm inline-flex items-center gap-1.5"
                        >
                            View Findings
                        </Link>
                        <Link
                            href="/dashboard"
                            className="btn-secondary text-sm inline-flex items-center gap-1.5"
                        >
                            New Scan
                        </Link>
                    </div>
                </>
            )}

            {/* --- Failed state --- */}
            {isFailed && (
                <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                    <div className="flex flex-col items-center gap-1">
                        <CircleRing pct={pct} failed />
                        {elapsed > 0 && (
                            <span className="text-xs tabular-nums muted">{formatElapsed(elapsed)}</span>
                        )}
                    </div>
                    <div className="flex-1 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-800 dark:text-red-200">
                        <p className="font-semibold mb-1">Scan failed</p>
                        <p className="muted text-xs">Check the Logs tab for details.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
