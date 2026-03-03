"use client";

import React from "react";
import { openSse } from "@/lib/ssePool";
import {
    buildDynamicStageOrder,
    isErrorStage,
    isTerminalStage,
    mapEventToWorkflowStage,
    WORKFLOW_STAGE_LABELS,
    WORKFLOW_STAGE_ORDER,
    type WorkflowStageId,
} from "@/lib/workflowStages";
import StageAccordionSection, { runLengthEncode } from "@/components/StageAccordionSection";

type ProgressEvent = {
    id?: number;
    stage: string;
    detail?: string;
    ts?: string;
    pct?: number;
};

type EventsListPayload = {
    items?: ProgressEvent[];
    total?: number;
    next_cursor?: number | null;
    has_more?: boolean;
    page_size?: number;
    order?: "asc" | "desc";
};

type FlowStatus = "pending" | "active" | "done" | "error" | "skipped";

const BACKDROP = {
    background:
        "radial-gradient(circle at 12% 18%, rgba(14,165,233,0.22), transparent 36%), radial-gradient(circle at 82% 16%, rgba(244,114,182,0.18), transparent 40%), radial-gradient(circle at 30% 88%, rgba(34,197,94,0.16), transparent 34%)",
};

const DEBOUNCE_MS = 500;

function normalizeEvent(raw: unknown): ProgressEvent | null {
    if (!raw || typeof raw !== "object") return null;
    const row = raw as Record<string, unknown>;
    const stage = typeof row.stage === "string" ? row.stage : "";
    if (!stage) return null;

    const idRaw = row.id;
    const id = typeof idRaw === "number" ? idRaw : Number(idRaw);
    const pctRaw = row.pct;
    const pct = typeof pctRaw === "number" ? pctRaw : Number(pctRaw);

    return {
        id: Number.isFinite(id) && id > 0 ? Math.trunc(id) : undefined,
        stage,
        detail: typeof row.detail === "string" ? row.detail : undefined,
        ts: typeof row.ts === "string" ? row.ts : undefined,
        pct: Number.isFinite(pct) ? pct : undefined,
    };
}

function isErrorEvent(e: ProgressEvent): boolean {
    const d = String(e.detail || "").toLowerCase();
    return isErrorStage(e.stage) || d.includes("error") || d.includes("failed");
}

type PipelineStage = { id: string; label: string; weight: number };

function parsePipelineManifest(events: ProgressEvent[]): PipelineStage[] | null {
    for (const e of events) {
        if (e.stage === "scan.pipeline" && e.detail) {
            try {
                const arr = JSON.parse(e.detail);
                if (Array.isArray(arr) && arr.length > 0 && arr[0].id) return arr;
            } catch { /* not JSON */ }
        }
    }
    return null;
}

/** Extract max pct from events (never decreases). */
function extractMaxPct(events: ProgressEvent[]): number {
    let max = 0;
    for (const e of events) {
        if (typeof e.pct === "number" && e.pct > max) max = e.pct;
        if (isTerminalStage(e.stage)) return 100;
    }
    return max;
}

/** Count events per workflow stage. */
function countByStage(events: ProgressEvent[]): Record<string, number> {
    const out: Record<string, number> = {};
    for (const e of events) {
        const ws = mapEventToWorkflowStage(e.stage, e.detail);
        if (ws) out[ws] = (out[ws] || 0) + 1;
    }
    return out;
}

/** Extract per-stage first/last timestamps. */
function extractStageTimes(
    events: ProgressEvent[],
    currentFirst: Record<string, string>,
    currentLast: Record<string, string>,
): { firstTs: Record<string, string>; lastTs: Record<string, string> } {
    const firstTs = { ...currentFirst };
    const lastTs = { ...currentLast };
    for (const e of events) {
        if (!e.ts) continue;
        const ws = mapEventToWorkflowStage(e.stage, e.detail);
        if (!ws) continue;
        if (!firstTs[ws] || e.ts < firstTs[ws]) firstTs[ws] = e.ts;
        if (!lastTs[ws] || e.ts > lastTs[ws]) lastTs[ws] = e.ts;
    }
    return { firstTs, lastTs };
}

/** Extract workflow stages and earliest timestamp from a batch of events. */
function extractStageInfo(events: ProgressEvent[], currentSeen: Record<string, true>): { newSeen: Record<string, true> | null; earliestTs: number } {
    let changed = false;
    const out = { ...currentSeen };
    let earliest = Infinity;

    for (const e of events) {
        const ws = mapEventToWorkflowStage(e.stage, e.detail);
        if (ws && !out[ws]) { out[ws] = true; changed = true; }
        if (e.ts) {
            const t = new Date(e.ts).getTime();
            if (t > 0 && t < earliest) earliest = t;
        }
    }

    return { newSeen: changed ? out : null, earliestTs: earliest };
}

function progressBarColor(pct: number): string {
    if (pct >= 80) return "bg-emerald-500";
    if (pct >= 50) return "bg-cyan-500";
    return "bg-blue-500";
}

function StageIcon({ stage, className = "h-4 w-4" }: { stage: string; className?: string }) {
    const cls = `${className} shrink-0`;
    switch (stage) {
        case "queued":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
                    <rect x="5" y="6" width="14" height="12" rx="2" />
                    <path d="M8 10h8M8 14h5" />
                </svg>
            );
        case "claimed":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
                    <circle cx="8" cy="12" r="3" />
                    <circle cx="16" cy="12" r="3" />
                    <path d="M11 12h2" />
                </svg>
            );
        case "s3_download":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
                    <path d="M12 3v12" />
                    <path d="m8 11 4 4 4-4" />
                    <rect x="4" y="17" width="16" height="4" rx="1" />
                </svg>
            );
        case "scanner_start":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
                    <path d="M7 5v14l11-7z" />
                </svg>
            );
        case "extract":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
                    <path d="M3 7.5 12 3l9 4.5L12 12 3 7.5Z" />
                    <path d="M3 7.5V16.5L12 21l9-4.5V7.5" />
                </svg>
            );
        case "inventory":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
                    <path d="M4 6h16M4 12h16M4 18h10" />
                </svg>
            );
        case "osv":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18" />
                </svg>
            );
        case "nvd":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
                    <path d="M12 3 5 6v6c0 4.2 2.8 7.8 7 9 4.2-1.2 7-4.8 7-9V6l-7-3Z" />
                    <path d="m9.5 12 2 2 3-3" />
                </svg>
            );
        case "debian_tracker":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 3c2.5 3 4 6 4 9s-1.5 6-4 9" />
                    <path d="M12 3c-2.5 3-4 6-4 9s1.5 6 4 9" />
                </svg>
            );
        case "redhat":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
                    <path d="M6 8c0-2.2 1.8-4 4-4h4c2.2 0 4 1.8 4 4v8H6z" />
                    <path d="M6 12h12" />
                </svg>
            );
        case "epss":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
                    <path d="M3 20h18" />
                    <path d="M6 16V10" />
                    <path d="M10 16V6" />
                    <path d="M14 16V12" />
                    <path d="M18 16V4" />
                </svg>
            );
        case "kev":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
                    <path d="M12 2 L2 7 L2 17 L12 22 L22 17 L22 7 Z" />
                    <path d="M12 8v5" />
                    <circle cx="12" cy="16" r="0.5" fill="currentColor" />
                </svg>
            );
        case "ingest":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
                    <path d="M12 21V9" />
                    <path d="m16 13-4-4-4 4" />
                    <rect x="4" y="3" width="16" height="4" rx="1" />
                </svg>
            );
        case "report_upload":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
                    <path d="M12 3v12" />
                    <path d="m8 7 4-4 4 4" />
                    <rect x="4" y="17" width="16" height="4" rx="1" />
                </svg>
            );
        case "complete":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="m8 12 2.6 2.6L16.5 9" />
                </svg>
            );
        case "failed":
        case "errors":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="m9 9 6 6M15 9l-6 6" />
                </svg>
            );
        default:
            return (
                <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden="true">
                    <circle cx="12" cy="12" r="3" />
                </svg>
            );
    }
}

function ArrowConnector({ from, to }: { from: FlowStatus; to: FlowStatus }) {
    let color = "text-gray-400/50";
    if (from === "done" && to === "done") color = "text-emerald-500";
    else if (from === "done" && to === "active") color = "text-cyan-500";
    else if (from === "active") color = "text-cyan-500/60";
    else if (from === "error" || to === "error") color = "text-red-500/60";
    return (
        <div className={`flex items-center justify-center ${color}`}>
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
        </div>
    );
}

export default function ProgressGraph({
    scanId,
    eventsPath,
    mode = "auto",
    onProgress,
    height = "compact",
}: {
    scanId: string;
    eventsPath?: string;
    mode?: "auto" | "stream" | "list";
    onProgress?: (pct: number, msg?: string) => void;
    height?: "compact" | "viewport" | number;
}) {
    const [totalEvents, setTotalEvents] = React.useState<number | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [nowMs, setNowMs] = React.useState<number>(() => Date.now());

    // Persistent stage tracking — survives event windowing
    const [stagesSeen, setStagesSeen] = React.useState<Record<string, true>>({});
    // Earliest event timestamp — never moves forward once set
    const [scanStartTs, setScanStartTs] = React.useState<number>(0);
    // Pipeline manifest from scan.pipeline event
    const [pipelineStages, setPipelineStages] = React.useState<PipelineStage[] | null>(null);
    // Persistent max pct — never decreases, survives event windowing
    const [maxPctSeen, setMaxPctSeen] = React.useState<number>(0);
    // Persistent per-stage event counts — survives event windowing
    const [stageCounts, setStageCounts] = React.useState<Record<string, number>>({});
    // Persistent per-stage first/last timestamps
    const [stageFirstTs, setStageFirstTs] = React.useState<Record<string, string>>({});
    const [stageLastTs, setStageLastTs] = React.useState<Record<string, string>>({});
    // Persistent per-stage error counts
    const [stageErrorCounts, setStageErrorCounts] = React.useState<Record<string, number>>({});
    // Persistent total error count
    const [totalErrorCount, setTotalErrorCount] = React.useState<number>(0);
    // Stage-grouped events for accordion
    const [stageEvents, setStageEvents] = React.useState<Record<string, ProgressEvent[]>>({});
    // Terminal event
    const [terminalEvent, setTerminalEvent] = React.useState<ProgressEvent | null>(null);

    // Accordion state
    const [expandedStages, setExpandedStages] = React.useState<Set<WorkflowStageId>>(new Set());
    const [userCollapsedStages, setUserCollapsedStages] = React.useState<Set<WorkflowStageId>>(new Set());
    // The most recently active (streaming) stage
    const [activeStage, setActiveStage] = React.useState<WorkflowStageId | null>(null);

    // Section scroll refs for pipeline bubble clicks
    const sectionRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

    // Debounced SSE event batching
    const pendingEventsRef = React.useRef<ProgressEvent[]>([]);
    const flushTimerRef = React.useRef<NodeJS.Timeout | null>(null);

    // UIBF-01: Pipeline scroll strip refs
    const pipelineScrollRef = React.useRef<HTMLDivElement>(null);
    const activeStageRef = React.useRef<HTMLDivElement>(null);
    const userScrolledPipeline = React.useRef(false);

    // UIBF-02: Badge collapse state (kept for the pipeline status badge area)
    const [badgesExpanded, setBadgesExpanded] = React.useState(false);
    const badgeContainerRef = React.useRef<HTMLDivElement>(null);
    const [badgeOverflowCount, setBadgeOverflowCount] = React.useState(0);

    /** Append events to stageEvents grouped by workflow stage. */
    const appendToStageEvents = React.useCallback((batch: ProgressEvent[]) => {
        setStageEvents((prev) => {
            const next = { ...prev };
            for (const e of batch) {
                const ws = mapEventToWorkflowStage(e.stage, e.detail);
                if (!ws) continue;
                const arr = next[ws] ? [...next[ws]] : [];
                arr.push(e);
                next[ws] = arr;
            }
            return next;
        });
    }, []);

    const flushPendingEvents = React.useCallback(() => {
        flushTimerRef.current = null;
        const batch = pendingEventsRef.current;
        if (batch.length === 0) return;
        pendingEventsRef.current = [];

        // Track stages persistently from new events
        setStagesSeen((prev) => {
            const { newSeen } = extractStageInfo(batch, prev);
            return newSeen || prev;
        });
        setScanStartTs((prev) => {
            let min = prev || Infinity;
            for (const e of batch) {
                if (e.ts) {
                    const t = new Date(e.ts).getTime();
                    if (t > 0 && t < min) min = t;
                }
            }
            return min < Infinity ? min : prev;
        });

        // Track pipeline manifest
        setPipelineStages((prev) => prev ?? parsePipelineManifest(batch));
        // Track max pct persistently
        setMaxPctSeen((prev) => Math.max(prev, extractMaxPct(batch)));
        // Track per-stage counts persistently
        setStageCounts((prev) => {
            const delta = countByStage(batch);
            const out = { ...prev };
            for (const [k, v] of Object.entries(delta)) out[k] = (out[k] || 0) + v;
            return out;
        });
        // Track per-stage timestamps
        setStageFirstTs((prev) => {
            const { firstTs } = extractStageTimes(batch, prev, {});
            return firstTs;
        });
        setStageLastTs((prev) => {
            const { lastTs } = extractStageTimes(batch, {}, prev);
            return lastTs;
        });
        // Track per-stage error counts
        setStageErrorCounts((prev) => {
            const next = { ...prev };
            for (const e of batch) {
                if (!isErrorEvent(e)) continue;
                const ws = mapEventToWorkflowStage(e.stage, e.detail);
                if (ws) next[ws] = (next[ws] || 0) + 1;
            }
            return next;
        });
        // Track error count persistently
        setTotalErrorCount((prev) => prev + batch.filter(isErrorEvent).length);

        // Track terminal event
        const termBatch = batch.find((e) => isTerminalStage(e.stage));
        if (termBatch) setTerminalEvent(termBatch);

        // Append to stage event groups
        appendToStageEvents(batch);

        setTotalEvents((prev) => (prev == null ? prev : prev + batch.length));

        // Update active stage from the most recent non-terminal event
        const lastNonTerminal = [...batch].reverse().find((e) => {
            const ws = mapEventToWorkflowStage(e.stage, e.detail);
            return ws && !isTerminalStage(e.stage);
        });
        if (lastNonTerminal) {
            const ws = mapEventToWorkflowStage(lastNonTerminal.stage, lastNonTerminal.detail);
            if (ws) {
                setActiveStage((prevActive) => {
                    if (prevActive === ws) return prevActive;
                    // Auto-expand new stage and collapse old stage (unless user controlled them)
                    setExpandedStages((prevExpanded) => {
                        const next = new Set(prevExpanded);
                        // Collapse old active stage if user hasn't pinned it
                        if (prevActive && !userCollapsedStages.has(prevActive)) {
                            next.delete(prevActive);
                        }
                        // Expand new active stage if user hasn't manually collapsed it
                        if (!userCollapsedStages.has(ws)) {
                            next.add(ws);
                        }
                        return next;
                    });
                    return ws;
                });
            }
        }
    }, [appendToStageEvents, userCollapsedStages]);

    // Use a ref for flushPendingEvents so queueEvent never changes identity
    const flushRef = React.useRef(flushPendingEvents);
    React.useEffect(() => { flushRef.current = flushPendingEvents; }, [flushPendingEvents]);

    const queueEvent = React.useCallback((evt: ProgressEvent) => {
        pendingEventsRef.current.push(evt);
        if (!flushTimerRef.current) {
            flushTimerRef.current = setTimeout(() => flushRef.current(), DEBOUNCE_MS);
        }
    }, []);

    // Clean up flush timer on unmount
    React.useEffect(() => {
        return () => {
            if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
        };
    }, []);

    const fetchPage = React.useCallback(async (cursor?: number | null, pageSize?: number, order?: "asc" | "desc") => {
        const params = new URLSearchParams();
        params.set("order", order || "asc");
        params.set("page_size", String(pageSize || 1000));
        if (cursor && cursor > 0) params.set("cursor", String(cursor));

        const res = await fetch(`/api/jobs/${scanId}/events/list?${params.toString()}`, {
            cache: "no-store",
        });
        if (!res.ok) {
            let msg = `HTTP ${res.status}`;
            try {
                const json = await res.json();
                msg = json?.error || msg;
            } catch {
                // noop
            }
            throw new Error(msg);
        }

        const body = (await res.json()) as EventsListPayload | ProgressEvent[];
        if (Array.isArray(body)) {
            const legacyItems = body.map(normalizeEvent).filter((x): x is ProgressEvent => Boolean(x));
            return {
                items: legacyItems,
                total: legacyItems.length,
                next_cursor: null,
                has_more: false,
            };
        }

        const items = Array.isArray(body.items)
            ? body.items.map(normalizeEvent).filter((x): x is ProgressEvent => Boolean(x))
            : [];

        return {
            items,
            total: typeof body.total === "number" ? body.total : items.length,
            next_cursor: typeof body.next_cursor === "number" ? body.next_cursor : null,
            has_more: body.has_more === true,
        };
    }, [scanId]);

    React.useEffect(() => {
        let cancelled = false;
        let closeFn: (() => void) | null = null;

        async function run() {
            setLoading(true);
            setError(null);
            setTotalEvents(null);
            setStagesSeen({});
            setScanStartTs(0);
            setPipelineStages(null);
            setMaxPctSeen(0);
            setStageCounts({});
            setStageFirstTs({});
            setStageLastTs({});
            setStageErrorCounts({});
            setTotalErrorCount(0);
            setStageEvents({});
            setTerminalEvent(null);
            setExpandedStages(new Set());
            setUserCollapsedStages(new Set());
            setActiveStage(null);

            try {
                const first = await fetchPage(null, 1000, "asc");
                if (cancelled) return;

                // Track stages from ALL fetched items
                const { newSeen, earliestTs } = extractStageInfo(first.items, {});
                if (newSeen) setStagesSeen(newSeen);

                // Extract pipeline manifest, persistent pct, and stage counts
                setPipelineStages(parsePipelineManifest(first.items));
                setMaxPctSeen(extractMaxPct(first.items));
                setStageCounts(countByStage(first.items));
                setTotalErrorCount(first.items.filter(isErrorEvent).length);

                // Extract per-stage timestamps and error counts
                const { firstTs: fts, lastTs: lts } = extractStageTimes(first.items, {}, {});
                setStageFirstTs(fts);
                setStageLastTs(lts);

                const errCounts: Record<string, number> = {};
                for (const e of first.items) {
                    if (!isErrorEvent(e)) continue;
                    const ws = mapEventToWorkflowStage(e.stage, e.detail);
                    if (ws) errCounts[ws] = (errCounts[ws] || 0) + 1;
                }
                setStageErrorCounts(errCounts);

                // Find terminal event in initial batch
                const term = first.items.find((e) => isTerminalStage(e.stage));
                if (term) setTerminalEvent(term);

                // Also fetch oldest events if has_more, to capture scan.pipeline manifest
                let startTs = earliestTs < Infinity ? earliestTs : 0;
                let pipeline = parsePipelineManifest(first.items);
                if (first.has_more && first.items.length > 0) {
                    try {
                        const oldest = await fetchPage(null, 50, "asc");
                        if (!cancelled && oldest.items.length > 0) {
                            if (oldest.items[0].ts) {
                                const t = new Date(oldest.items[0].ts).getTime();
                                if (t > 0) startTs = t;
                            }
                            if (!pipeline) {
                                pipeline = parsePipelineManifest(oldest.items);
                            }
                        }
                    } catch {
                        // Non-critical
                    }
                }
                if (pipeline) setPipelineStages(pipeline);
                if (startTs > 0) setScanStartTs(startTs);

                // Group events by workflow stage
                const grouped: Record<string, ProgressEvent[]> = {};
                for (const e of first.items) {
                    const ws = mapEventToWorkflowStage(e.stage, e.detail);
                    if (!ws) continue;
                    (grouped[ws] ||= []).push(e);
                }
                setStageEvents(grouped);

                setTotalEvents(Number.isFinite(first.total) ? first.total : first.items.length);
                setLoading(false);

                if (mode === "list") return;
                const highestId = first.items.reduce((max, e) => Math.max(max, e.id || 0), 0);
                const streamBase = eventsPath || `/api/jobs/${scanId}/events`;
                const streamUrl = `${streamBase}${streamBase.includes("?") ? "&" : "?"}since_id=${highestId}`;

                closeFn = await openSse(streamUrl, {
                    onMessage: (ev) => {
                        let parsed: ProgressEvent | null = null;
                        try {
                            parsed = normalizeEvent(JSON.parse(ev.data));
                        } catch {
                            parsed = null;
                        }
                        if (!parsed) return;
                        queueEvent(parsed);
                        setLoading(false);
                    },
                    onError: () => {
                        try {
                            closeFn?.();
                        } catch {
                            // noop
                        }
                    },
                });
            } catch (e: unknown) {
                if (!cancelled) {
                    setError(e instanceof Error ? e.message : String(e));
                    setLoading(false);
                }
            }
        }

        run();

        return () => {
            cancelled = true;
            try {
                closeFn?.();
            } catch {
                // noop
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scanId, eventsPath, mode]);

    const progressCbRef = React.useRef<typeof onProgress | undefined>(undefined);
    React.useEffect(() => {
        progressCbRef.current = onProgress;
    }, [onProgress]);

    const lastSentRef = React.useRef<{ pct: number; msg?: string }>({ pct: 0, msg: undefined });
    React.useEffect(() => {
        lastSentRef.current = { pct: 0, msg: undefined };
    }, [scanId]);

    // Derive the overall percentage — use persistent maxPctSeen so it never decreases
    const overallPct = React.useMemo(() => {
        return Math.max(0, Math.min(100, maxPctSeen));
    }, [maxPctSeen]);

    React.useEffect(() => {
        if (overallPct < 0) return;
        const prev = lastSentRef.current;
        const latestPct = Math.max(prev.pct, overallPct);
        if (prev.pct !== latestPct) {
            lastSentRef.current = { pct: latestPct, msg: prev.msg };
            try {
                progressCbRef.current?.(latestPct, prev.msg);
            } catch {
                // noop
            }
        }
    }, [overallPct]);

    const terminalStage = String(terminalEvent?.stage || "").toLowerCase();
    const isFailed = terminalStage === "scan.err" || terminalStage === "scan.error" || terminalStage === "worker.stale.fail";
    const isFinished = terminalStage === "scan.done" || terminalStage === "scan.summary";
    const scanDone = isFailed || isFinished;

    // Duration
    const firstTs = scanStartTs;
    const lastEventTs = terminalEvent?.ts ? new Date(terminalEvent.ts).getTime() : 0;
    const effectiveLastTs = scanDone ? lastEventTs : Math.max(lastEventTs, nowMs);
    const durationSec = firstTs && effectiveLastTs >= firstTs ? Math.round((effectiveLastTs - firstTs) / 1000) : 0;

    React.useEffect(() => {
        if (scanDone || !firstTs) return;
        const timer = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [scanDone, firstTs]);

    // Use dynamic stage order when pipeline manifest is available, else fallback
    const activeStageOrder: readonly WorkflowStageId[] = React.useMemo(() => {
        if (pipelineStages) return buildDynamicStageOrder(pipelineStages);
        return WORKFLOW_STAGE_ORDER;
    }, [pipelineStages]);

    const flow = React.useMemo(() => {
        const stageStatus = {} as Record<WorkflowStageId, FlowStatus>;
        const completeIdx = activeStageOrder.indexOf("complete");
        const failedIdx = activeStageOrder.indexOf("failed");
        const stageMeta = {} as Record<WorkflowStageId, { hasEvents: boolean; wasSeen: boolean; hasErr: boolean; hasExplicitSkip: boolean }>;

        // Build seen indexes from persistent stagesSeen
        const seenIndexes: number[] = [];
        for (const id of Object.keys(stagesSeen)) {
            const idx = activeStageOrder.indexOf(id as WorkflowStageId);
            if (idx >= 0 && !seenIndexes.includes(idx)) seenIndexes.push(idx);
        }

        const firstSeenIndex = seenIndexes.length ? Math.min(...seenIndexes) : -1;
        const lastSeenIndex = seenIndexes.length ? Math.max(...seenIndexes) : -1;

        for (let i = 0; i < activeStageOrder.length; i++) {
            const id = activeStageOrder[i];
            const eventsForStage = stageEvents[id] || [];
            const hasEvents = eventsForStage.length > 0;
            const wasSeen = !!stagesSeen[id] || hasEvents;
            const hasErr = eventsForStage.some(isErrorEvent);
            const hasExplicitSkip = eventsForStage.some((e) => {
                const stage = String(e.stage || "").toLowerCase();
                return stage.endsWith(".skip") || stage.endsWith(".skipped") || stage.includes(".skip.");
            });
            stageMeta[id] = { hasEvents, wasSeen, hasErr, hasExplicitSkip };

            let status: FlowStatus = "pending";
            if (id === "failed") {
                status = isFailed ? "error" : "pending";
            } else if (id === "complete") {
                status = isFinished ? "done" : "pending";
            } else if (hasErr) {
                status = "error";
            } else if (hasExplicitSkip && !wasSeen) {
                status = "skipped";
            } else if (wasSeen) {
                if (terminalEvent || i < lastSeenIndex) {
                    status = "done";
                } else {
                    status = "active";
                }
            } else if (!terminalEvent && i > firstSeenIndex && i < lastSeenIndex) {
                status = "done";
            }

            stageStatus[id] = status;
        }

        let visibleIds: WorkflowStageId[] = [];
        if (terminalEvent) {
            visibleIds = (activeStageOrder as readonly WorkflowStageId[]).filter((id) => {
                if (id === "complete") return isFinished;
                if (id === "failed") return isFailed;
                if (!stageMeta[id]?.wasSeen) return false;
                return stageStatus[id] !== "skipped";
            });
            if (isFinished && !visibleIds.includes("complete")) visibleIds.push("complete");
            if (isFailed && !visibleIds.includes("failed")) visibleIds.push("failed");
        } else {
            const visibleStart = firstSeenIndex >= 0 ? firstSeenIndex : 0;
            let visibleEnd = lastSeenIndex >= 0 ? lastSeenIndex : visibleStart;

            if (isFinished) {
                visibleEnd = completeIdx;
            } else if (isFailed) {
                visibleEnd = failedIdx;
            } else if (lastSeenIndex >= 0) {
                visibleEnd = Math.min(activeStageOrder.length - 1, lastSeenIndex + 1);
            }

            if (visibleEnd < visibleStart) {
                visibleEnd = visibleStart;
            }

            visibleIds = activeStageOrder.slice(visibleStart, visibleEnd + 1) as WorkflowStageId[];
            if (isFailed) {
                visibleIds = visibleIds.filter((id) => id !== "complete");
                if (!visibleIds.includes("failed")) visibleIds.push("failed");
            } else {
                visibleIds = visibleIds.filter((id) => id !== "failed");
                if (!visibleIds.includes("complete")) visibleIds.push("complete");
            }
        }

        return {
            stageStatus,
            visibleIds,
            isFailed,
            isFinished,
            finishedTs: terminalEvent?.ts,
        };
    }, [stagesSeen, stageEvents, terminalEvent, isFailed, isFinished, activeStageOrder]);

    // Memoize column count — only changes when new stages appear
    const gridCols = React.useMemo(() => {
        const stageCount = flow.visibleIds.length;
        return Math.max(stageCount * 2 - 1, 1);
    }, [flow.visibleIds.length]);

    // UIBF-01: Auto-scroll active pipeline stage into view
    const activeStageId = React.useMemo(() => {
        return flow.visibleIds.find((id) => (flow.stageStatus[id] || "pending") === "active") ?? null;
    }, [flow.visibleIds, flow.stageStatus]);

    React.useEffect(() => {
        if (userScrolledPipeline.current) return;
        activeStageRef.current?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }, [activeStageId]);

    React.useEffect(() => {
        const el = pipelineScrollRef.current;
        if (!el) return;
        const handleUserScroll = () => { userScrolledPipeline.current = true; };
        el.addEventListener("wheel", handleUserScroll, { passive: true });
        el.addEventListener("touchmove", handleUserScroll, { passive: true });
        return () => {
            el.removeEventListener("wheel", handleUserScroll);
            el.removeEventListener("touchmove", handleUserScroll);
        };
    }, []);

    // UIBF-02: Detect badge container overflow (for pipeline stage pills overflow)
    React.useEffect(() => {
        const el = badgeContainerRef.current;
        if (!el || badgesExpanded) { setBadgeOverflowCount(0); return; }
        if (el.scrollHeight > el.clientHeight) {
            const visibleBottom = el.getBoundingClientRect().top + el.clientHeight;
            const hidden = Array.from(el.children).filter(
                (child) => child.getBoundingClientRect().top >= visibleBottom
            ).length;
            setBadgeOverflowCount(hidden);
        } else {
            setBadgeOverflowCount(0);
        }
    }, [flow.visibleIds.length, badgesExpanded]);

    const totalErrorCount_val = totalErrorCount;
    const total = totalEvents ?? 0;

    /** Toggle accordion stage expand/collapse. */
    function toggleStage(stageId: WorkflowStageId) {
        setExpandedStages((prev) => {
            const next = new Set(prev);
            if (next.has(stageId)) {
                next.delete(stageId);
                setUserCollapsedStages((uc) => new Set(uc).add(stageId));
            } else {
                next.add(stageId);
                setUserCollapsedStages((uc) => {
                    const n = new Set(uc);
                    n.delete(stageId);
                    return n;
                });
            }
            return next;
        });
    }

    /** Handle pipeline stage bubble click — expand that stage and scroll to it. */
    function handlePipelineStageClick(stageId: WorkflowStageId) {
        setExpandedStages((prev) => new Set(prev).add(stageId));
        setUserCollapsedStages((uc) => {
            const n = new Set(uc);
            n.delete(stageId);
            return n;
        });
        // Scroll the section into view
        sectionRefs.current[stageId]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Compute accordion container height from prop
    const accordionStyle = React.useMemo(() => {
        if (height === "compact") return { maxHeight: "600px", overflowY: "auto" as const };
        if (height === "viewport") return { height: "calc(100vh - 120px)", overflowY: "auto" as const };
        return { height: `${height}px`, overflowY: "auto" as const };
    }, [height]);

    if (loading) {
        return (
            <div className="rounded-xl border border-black/10 dark:border-white/10 p-3 text-sm opacity-75">
                Loading workflow...
            </div>
        );
    }
    if (error) {
        return (
            <div className="rounded-xl border border-red-300/50 p-3 text-sm text-red-700 dark:text-red-300">
                Failed to load workflow: {error}
            </div>
        );
    }
    if (Object.keys(stageEvents).length === 0 && !scanDone) {
        return (
            <div className="rounded-xl border border-black/10 dark:border-white/10 p-3 text-sm opacity-75">
                No workflow events yet.
            </div>
        );
    }

    const flowLabel = (status: FlowStatus) => {
        if (status === "done") return "Done";
        if (status === "active") return "Running";
        if (status === "error") return "Error";
        if (status === "skipped") return "Skipped";
        return "Pending";
    };

    const flowTone = (status: FlowStatus) => {
        if (status === "done") return "bg-emerald-600 text-white border-emerald-700";
        if (status === "active") return "bg-cyan-600 text-white border-cyan-700";
        if (status === "error") return "bg-red-600 text-white border-red-700";
        if (status === "skipped") return "bg-amber-500/80 text-amber-950 border-amber-700/70";
        return "bg-white/80 dark:bg-black/45 text-black/80 dark:text-white/80 border-black/10 dark:border-white/10";
    };

    const workflowStateLabel = isFailed ? "Scan failed" : (isFinished ? "Scan finished" : "Scan running");

    return (
        <div className="relative rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden" style={BACKDROP}>
            {/* Pulse animation style */}
            <style>{`
                @keyframes pulse-ring {
                    0% { box-shadow: 0 0 0 0 rgba(6,182,212,0.5); }
                    70% { box-shadow: 0 0 0 8px rgba(6,182,212,0); }
                    100% { box-shadow: 0 0 0 0 rgba(6,182,212,0); }
                }
                .stage-pulse { animation: pulse-ring 2s ease-out infinite; }
            `}</style>
            <div className="relative grid gap-3 p-4">
                {/* Top-level progress bar */}
                <div className="rounded-lg border border-black/10 dark:border-white/10 bg-white/75 dark:bg-black/45 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] uppercase tracking-wide opacity-70">Progress</span>
                        <span className="text-sm font-semibold">{overallPct}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${progressBarColor(overallPct)}`}
                            style={{ width: `${overallPct}%` }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-2">
                    <div className="rounded-lg border border-black/10 dark:border-white/10 bg-white/75 dark:bg-black/45 px-3 py-2 min-w-0">
                        <div className="text-[11px] uppercase tracking-wide opacity-70">Events</div>
                        <div className="text-xl font-semibold">{total}</div>
                    </div>
                    <div className="rounded-lg border border-black/10 dark:border-white/10 bg-white/75 dark:bg-black/45 px-3 py-2 min-w-0">
                        <div className="text-[11px] uppercase tracking-wide opacity-70">Duration</div>
                        <div className="text-xl font-semibold">{durationSec > 0 ? `${durationSec}s` : "n/a"}</div>
                    </div>
                    <div className="rounded-lg border border-black/10 dark:border-white/10 bg-white/75 dark:bg-black/45 px-3 py-2 min-w-0">
                        <div className="text-[11px] uppercase tracking-wide opacity-70">Errors</div>
                        <div className="text-xl font-semibold">{totalErrorCount_val}</div>
                    </div>
                    <div className="rounded-lg border border-black/10 dark:border-white/10 bg-white/75 dark:bg-black/45 px-3 py-2 min-w-0">
                        <div className="text-[11px] uppercase tracking-wide opacity-70">Status</div>
                        <div className="flex items-center gap-1.5 text-base font-semibold min-w-0">
                            <StageIcon stage={isFailed ? "failed" : "complete"} className="h-4 w-4" />
                            <span className="truncate">{workflowStateLabel}</span>
                        </div>
                        <div className="text-[11px] opacity-70 truncate">
                            {flow.finishedTs ? `Updated ${new Date(flow.finishedTs).toLocaleTimeString()}` : "Awaiting completion event"}
                        </div>
                    </div>
                </div>

                {/* Pipeline strip */}
                <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/75 dark:bg-black/45 p-3 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] uppercase tracking-wide opacity-70">Workflow Flow</span>
                        <span className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border whitespace-nowrap min-w-0 ${
                            isFailed
                                ? "bg-red-600 text-white border-red-700"
                                : isFinished
                                    ? "bg-emerald-600 text-white border-emerald-700"
                                    : "bg-cyan-600 text-white border-cyan-700"
                        }`}>
                            <StageIcon stage={isFailed ? "failed" : "complete"} className="h-3.5 w-3.5" />
                            <span className="truncate">{workflowStateLabel}</span>
                            {flow.finishedTs ? <span className="opacity-85 truncate">{new Date(flow.finishedTs).toLocaleTimeString()}</span> : null}
                        </span>
                    </div>
                    <div className="relative">
                        {/* Left fade gradient */}
                        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10"
                             style={{ background: "linear-gradient(to right, var(--dg-bg-elevated), transparent)" }} />
                        {/* Scrollable pipeline */}
                        <div ref={pipelineScrollRef} className="overflow-x-auto pb-1">
                            <div
                                className="grid items-start gap-0 min-w-max"
                                style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(60px, 1fr))` }}
                            >
                                {flow.visibleIds.map((id, idx) => {
                                    const state = flow.stageStatus[id] || "pending";
                                    const isActive = state === "active";
                                    const nextId = flow.visibleIds[idx + 1];
                                    const nextState = nextId ? (flow.stageStatus[nextId] || "pending") : "pending";
                                    return (
                                        <React.Fragment key={id}>
                                            <div
                                                ref={isActive ? activeStageRef : undefined}
                                                className="min-w-0 text-center cursor-pointer"
                                                onClick={() => handlePipelineStageClick(id)}
                                                title={`Click to expand ${WORKFLOW_STAGE_LABELS[id] || id}`}
                                            >
                                                <div className={`mx-auto h-8 w-8 rounded-full border flex items-center justify-center ${flowTone(state)} ${isActive ? "stage-pulse" : ""}`}>
                                                    <StageIcon stage={id} className="h-4 w-4" />
                                                </div>
                                                <div className="text-[9px] uppercase opacity-60 mt-1">Step {idx + 1}</div>
                                                <div className="mt-1 text-[10px] font-semibold leading-tight break-words px-1">{WORKFLOW_STAGE_LABELS[id]}</div>
                                                <div className="text-[9px] opacity-70 truncate px-1">{flowLabel(state)}</div>
                                            </div>
                                            {idx < flow.visibleIds.length - 1 && (
                                                <ArrowConnector from={state} to={nextState} />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                        {/* Right fade gradient */}
                        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10"
                             style={{ background: "linear-gradient(to left, var(--dg-bg-elevated), transparent)" }} />
                    </div>
                </div>

                {/* UIBF-02: Stage pill overflow toggle (for pipeline status pills) */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div
                            ref={badgeContainerRef}
                            className="flex flex-wrap items-center gap-2 pb-1"
                            style={!badgesExpanded ? { maxHeight: "4.5rem", overflow: "hidden" } : undefined}
                        >
                            {activeStageOrder.filter((id) => (stageCounts[id] || 0) > 0).map((id) => {
                                const count = stageCounts[id] || 0;
                                const errCount = stageErrorCounts[id] || 0;
                                const isExpanded = expandedStages.has(id);
                                return (
                                    <button
                                        key={id}
                                        onClick={() => toggleStage(id)}
                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap border border-black/10 dark:border-white/10 transition ${
                                            isExpanded
                                                ? "bg-slate-800 text-white dark:bg-white dark:text-black"
                                                : "bg-white/80 dark:bg-black/45 hover:bg-white dark:hover:bg-black/55"
                                        }`}
                                    >
                                        <StageIcon stage={id} className="h-3.5 w-3.5" />
                                        <span>{WORKFLOW_STAGE_LABELS[id] || id}</span>
                                        <span className={`px-1.5 py-0.5 rounded-full ${isExpanded ? "bg-white/20" : "bg-black/10 dark:bg-white/10"}`}>{count}</span>
                                        {errCount > 0 && (
                                            <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px]">{errCount} err</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {badgeOverflowCount > 0 && (
                            <button
                                onClick={() => setBadgesExpanded((e) => !e)}
                                className="mt-1 text-xs font-semibold px-2.5 py-1 rounded-full border border-black/20 dark:border-white/20 bg-white/80 dark:bg-black/45 hover:bg-white dark:hover:bg-black/55"
                            >
                                {badgesExpanded ? "Show less" : `+${badgeOverflowCount} more`}
                            </button>
                        )}
                    </div>
                </div>

                {/* Stage-grouped accordion */}
                <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/75 dark:bg-black/45 overflow-hidden" style={accordionStyle}>
                    <div className="px-3 py-2 text-xs font-semibold border-b border-black/10 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-black/70 backdrop-blur z-10">
                        <span>Scan Log</span>
                        <span className="opacity-70">{total.toLocaleString()} events</span>
                    </div>
                    {activeStageOrder
                        .filter((id) => (stageCounts[id] || 0) > 0)
                        .map((id) => (
                            <div
                                key={id}
                                ref={(el) => { sectionRefs.current[id] = el; }}
                            >
                                <StageAccordionSection
                                    stageId={id}
                                    label={WORKFLOW_STAGE_LABELS[id] || id}
                                    totalCount={stageCounts[id] || 0}
                                    errorCount={stageErrorCounts[id] || 0}
                                    firstTs={stageFirstTs[id]}
                                    lastTs={stageLastTs[id]}
                                    scanId={scanId}
                                    expanded={expandedStages.has(id)}
                                    onToggle={() => toggleStage(id)}
                                    initialEvents={stageEvents[id] || []}
                                    isLive={!scanDone && activeStage === id}
                                />
                            </div>
                        ))}
                    {Object.keys(stageEvents).length === 0 && (
                        <div className="px-3 py-6 text-sm opacity-70 text-center">No workflow events yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
