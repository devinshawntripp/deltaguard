"use client";

import React from "react";
import { openSse } from "@/lib/ssePool";
import {
    isErrorStage,
    isTerminalStage,
    mapEventToWorkflowStage,
    WORKFLOW_STAGE_LABELS,
    WORKFLOW_STAGE_ORDER,
    type WorkflowStageId,
} from "@/lib/workflowStages";

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

const INITIAL_PAGE_SIZE = 1000;
const MAX_EVENTS = 200;
const VISIBLE_EVENTS = 50;
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

function withUniqueById(existingDesc: ProgressEvent[], incomingDesc: ProgressEvent[]): ProgressEvent[] {
    const seen = new Set<number>();
    const out: ProgressEvent[] = [];

    for (const item of existingDesc) {
        const id = item.id;
        if (typeof id === "number" && Number.isFinite(id)) {
            if (seen.has(id)) continue;
            seen.add(id);
        }
        out.push(item);
    }

    for (const item of incomingDesc) {
        const id = item.id;
        if (typeof id === "number" && Number.isFinite(id)) {
            if (seen.has(id)) continue;
            seen.add(id);
        }
        out.push(item);
    }

    out.sort((a, b) => (b.id || 0) - (a.id || 0));
    return out.slice(0, MAX_EVENTS);
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
        case "all":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
                    <rect x="4" y="4" width="7" height="7" rx="1" />
                    <rect x="13" y="4" width="7" height="7" rx="1" />
                    <rect x="4" y="13" width="7" height="7" rx="1" />
                    <rect x="13" y="13" width="7" height="7" rx="1" />
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
}: {
    scanId: string;
    eventsPath?: string;
    mode?: "auto" | "stream" | "list";
    onProgress?: (pct: number, msg?: string) => void;
}) {
    const [eventsDesc, setEventsDesc] = React.useState<ProgressEvent[]>([]);
    const [totalEvents, setTotalEvents] = React.useState<number | null>(null);
    const [nextCursor, setNextCursor] = React.useState<number | null>(null);
    const [hasMore, setHasMore] = React.useState(false);
    const [selectedTab, setSelectedTab] = React.useState<string>("all");
    const [loading, setLoading] = React.useState(true);
    const [loadingMore, setLoadingMore] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [nowMs, setNowMs] = React.useState<number>(() => Date.now());
    const [visibleCount, setVisibleCount] = React.useState(VISIBLE_EVENTS);

    // Debounced SSE event batching
    const pendingEventsRef = React.useRef<ProgressEvent[]>([]);
    const flushTimerRef = React.useRef<NodeJS.Timeout | null>(null);

    const flushPendingEvents = React.useCallback(() => {
        flushTimerRef.current = null;
        const batch = pendingEventsRef.current;
        if (batch.length === 0) return;
        pendingEventsRef.current = [];
        setEventsDesc((prev) => withUniqueById(prev, batch));
        setTotalEvents((prev) => (prev == null ? prev : prev + batch.length));
    }, []);

    const queueEvent = React.useCallback((evt: ProgressEvent) => {
        pendingEventsRef.current.push(evt);
        if (!flushTimerRef.current) {
            flushTimerRef.current = setTimeout(flushPendingEvents, DEBOUNCE_MS);
        }
    }, [flushPendingEvents]);

    // Clean up flush timer on unmount
    React.useEffect(() => {
        return () => {
            if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
        };
    }, []);

    const fetchPage = React.useCallback(async (cursor?: number | null) => {
        const params = new URLSearchParams();
        params.set("order", "desc");
        params.set("page_size", String(INITIAL_PAGE_SIZE));
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
                items: legacyItems.sort((a, b) => (b.id || 0) - (a.id || 0)),
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
            setEventsDesc([]);
            setTotalEvents(null);
            setNextCursor(null);
            setHasMore(false);
            setVisibleCount(VISIBLE_EVENTS);

            try {
                const first = await fetchPage(null);
                if (cancelled) return;

                setEventsDesc(first.items.slice(0, MAX_EVENTS));
                setTotalEvents(Number.isFinite(first.total) ? first.total : first.items.length);
                setNextCursor(first.next_cursor);
                setHasMore(first.has_more);
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
    }, [scanId, eventsPath, mode, fetchPage, queueEvent]);

    const loadOlder = React.useCallback(async () => {
        if (!hasMore || !nextCursor || loadingMore) return;
        setLoadingMore(true);
        try {
            const page = await fetchPage(nextCursor);
            setEventsDesc((prev) => withUniqueById(prev, page.items));
            setNextCursor(page.next_cursor);
            setHasMore(page.has_more);
            setTotalEvents((prev) => (prev == null ? page.total : Math.max(prev, page.total)));
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoadingMore(false);
        }
    }, [fetchPage, hasMore, nextCursor, loadingMore]);

    const eventsChrono = React.useMemo(() => [...eventsDesc].reverse(), [eventsDesc]);

    const progressCbRef = React.useRef<typeof onProgress | undefined>(undefined);
    React.useEffect(() => {
        progressCbRef.current = onProgress;
    }, [onProgress]);

    const lastSentRef = React.useRef<{ pct: number; msg?: string }>({ pct: 0, msg: undefined });
    React.useEffect(() => {
        lastSentRef.current = { pct: 0, msg: undefined };
        setSelectedTab("all");
    }, [scanId]);

    // Derive the overall percentage from the latest event with pct
    const overallPct = React.useMemo(() => {
        let maxPct = 0;
        for (let i = eventsChrono.length - 1; i >= 0; i--) {
            const e = eventsChrono[i];
            if (typeof e.pct === "number" && e.pct > maxPct) {
                maxPct = e.pct;
            }
            if (isTerminalStage(e.stage)) {
                maxPct = 100;
                break;
            }
        }
        return Math.max(0, Math.min(100, maxPct));
    }, [eventsChrono]);

    React.useEffect(() => {
        if (!eventsChrono.length) return;

        let latestPct = overallPct;
        let latestMsg: string | undefined = undefined;

        for (let i = eventsChrono.length - 1; i >= 0; i--) {
            const e = eventsChrono[i];
            if (!latestMsg && e.detail) { latestMsg = e.detail; break; }
        }

        if (latestPct >= 0) {
            const prev = lastSentRef.current;
            latestPct = Math.max(prev.pct, latestPct);
            if (prev.pct !== latestPct || prev.msg !== latestMsg) {
                lastSentRef.current = { pct: latestPct, msg: latestMsg };
                try {
                    progressCbRef.current?.(latestPct, latestMsg);
                } catch {
                    // noop
                }
            }
        }
    }, [eventsChrono, overallPct]);

    const grouped = React.useMemo(() => {
        const out: Record<string, ProgressEvent[]> = {};
        for (const e of eventsChrono) {
            const stage = mapEventToWorkflowStage(e.stage);
            if (!stage) continue;
            (out[stage] ||= []).push(e);
        }
        return out;
    }, [eventsChrono]);

    const errorCount = React.useMemo(() => eventsChrono.filter(isErrorEvent).length, [eventsChrono]);

    const terminal = React.useMemo(() => {
        return [...eventsChrono].reverse().find((e) => isTerminalStage(e.stage));
    }, [eventsChrono]);

    const terminalStage = String(terminal?.stage || "").toLowerCase();
    const isFailed = terminalStage === "scan.err" || terminalStage === "scan.error" || terminalStage === "worker.stale.fail";
    const isFinished = terminalStage === "scan.done" || terminalStage === "scan.summary";

    const firstEvent = eventsChrono[0];
    const lastEvent = eventsChrono.length ? eventsChrono[eventsChrono.length - 1] : undefined;
    const firstTs = firstEvent?.ts ? new Date(firstEvent.ts).getTime() : 0;
    const lastTs = lastEvent?.ts ? new Date(lastEvent.ts).getTime() : 0;
    const effectiveLastTs = terminal ? lastTs : Math.max(lastTs, nowMs);
    const durationSec = firstTs && effectiveLastTs >= firstTs ? Math.round((effectiveLastTs - firstTs) / 1000) : 0;

    React.useEffect(() => {
        if (!eventsChrono.length || terminal) return;
        const timer = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [eventsChrono.length, terminal]);

    const flow = React.useMemo(() => {
        const stageStatus = {} as Record<WorkflowStageId, FlowStatus>;
        const completeIdx = WORKFLOW_STAGE_ORDER.indexOf("complete");
        const failedIdx = WORKFLOW_STAGE_ORDER.indexOf("failed");
        const stageMeta = {} as Record<WorkflowStageId, { hasEvents: boolean; hasErr: boolean; hasExplicitSkip: boolean }>;

        const seenIndexes: number[] = [];
        for (const e of eventsChrono) {
            const stage = mapEventToWorkflowStage(e.stage);
            if (!stage) continue;
            const idx = WORKFLOW_STAGE_ORDER.indexOf(stage);
            if (idx >= 0) seenIndexes.push(idx);
        }
        const firstSeenIndex = seenIndexes.length ? Math.min(...seenIndexes) : -1;
        const lastSeenIndex = seenIndexes.length ? Math.max(...seenIndexes) : -1;

        for (let i = 0; i < WORKFLOW_STAGE_ORDER.length; i++) {
            const id = WORKFLOW_STAGE_ORDER[i];
            const eventsForStage = grouped[id] || [];
            const hasEvents = eventsForStage.length > 0;
            const hasErr = eventsForStage.some(isErrorEvent);
            const hasExplicitSkip = eventsForStage.some((e) => {
                const stage = String(e.stage || "").toLowerCase();
                return stage.endsWith(".skip") || stage.endsWith(".skipped") || stage.includes(".skip.");
            });
            stageMeta[id] = { hasEvents, hasErr, hasExplicitSkip };

            let status: FlowStatus = "pending";
            if (id === "failed") {
                status = isFailed ? "error" : hasEvents ? "done" : "pending";
            } else if (id === "complete") {
                status = isFinished ? "done" : hasEvents ? "active" : "pending";
            } else if (hasErr) {
                status = "error";
            } else if (hasExplicitSkip) {
                status = "skipped";
            } else if (hasEvents) {
                status = terminal || i < lastSeenIndex ? "done" : "active";
            } else if (!terminal && i === lastSeenIndex + 1 && lastSeenIndex >= 0) {
                status = "active";
            }

            stageStatus[id] = status;
        }

        let visibleIds: WorkflowStageId[] = [];
        if (terminal) {
            visibleIds = WORKFLOW_STAGE_ORDER.filter((id) => {
                if (id === "complete") return isFinished;
                if (id === "failed") return isFailed;
                if (!stageMeta[id].hasEvents) return false;
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
                visibleEnd = Math.min(WORKFLOW_STAGE_ORDER.length - 1, lastSeenIndex + 1);
            }

            if (visibleEnd < visibleStart) {
                visibleEnd = visibleStart;
            }

            visibleIds = WORKFLOW_STAGE_ORDER.slice(visibleStart, visibleEnd + 1);
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
            finishedTs: terminal?.ts,
        };
    }, [eventsChrono, grouped, terminal, isFailed, isFinished]);

    // Memoize column count — only changes when new stages appear
    const gridCols = React.useMemo(() => {
        const stageCount = flow.visibleIds.length;
        // stages + arrows between them
        return Math.max(stageCount * 2 - 1, 1);
    }, [flow.visibleIds.length]);

    const tabs = React.useMemo(() => {
        const out: Array<{ id: string; label: string; count: number }> = [
            { id: "all", label: "All", count: eventsChrono.length },
        ];

        for (const id of WORKFLOW_STAGE_ORDER) {
            const count = (grouped[id] || []).length;
            if (count > 0 || id === "complete" || id === "failed") {
                out.push({ id, label: WORKFLOW_STAGE_LABELS[id], count });
            }
        }

        if (errorCount > 0) {
            out.push({ id: "errors", label: "Errors", count: errorCount });
        }

        return out;
    }, [eventsChrono.length, grouped, errorCount]);

    React.useEffect(() => {
        if (!tabs.find((t) => t.id === selectedTab)) setSelectedTab("all");
    }, [tabs, selectedTab]);

    // Reset visible count when tab changes
    React.useEffect(() => {
        setVisibleCount(VISIBLE_EVENTS);
    }, [selectedTab]);

    const selectedEvents = React.useMemo(() => {
        if (selectedTab === "all") return eventsChrono;
        if (selectedTab === "errors") return eventsChrono.filter(isErrorEvent);
        return grouped[selectedTab] || [];
    }, [eventsChrono, selectedTab, grouped]);

    // Only render up to visibleCount events
    const visibleEvents = React.useMemo(() => {
        return selectedEvents.slice(0, visibleCount);
    }, [selectedEvents, visibleCount]);

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
    if (!eventsChrono.length) {
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

    const stageTone = (id: string) => {
        if (id === "errors") return "bg-red-600/90 text-white";
        if (id === "all") return "bg-slate-800/90 text-white";
        const subs = grouped[id] || [];
        if (!subs.length) return "bg-gray-500/80 text-white";
        const hasStart = subs.some((e) => /\.start$/i.test(e.stage) || e.stage === "scan.start");
        const done = subs.some((e) => isTerminalStage(e.stage));
        if (hasStart && !done) return "bg-cyan-600 text-white";
        if (done || subs.length > 0) return "bg-emerald-600 text-white";
        return "bg-gray-500 text-white";
    };

    const loadedEvents = eventsDesc.length;
    const total = totalEvents ?? loadedEvents;

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
                        <div className="text-[11px] opacity-70">loaded {loadedEvents} of {total}</div>
                    </div>
                    <div className="rounded-lg border border-black/10 dark:border-white/10 bg-white/75 dark:bg-black/45 px-3 py-2 min-w-0">
                        <div className="text-[11px] uppercase tracking-wide opacity-70">Duration</div>
                        <div className="text-xl font-semibold">{durationSec > 0 ? `${durationSec}s` : "n/a"}</div>
                    </div>
                    <div className="rounded-lg border border-black/10 dark:border-white/10 bg-white/75 dark:bg-black/45 px-3 py-2 min-w-0">
                        <div className="text-[11px] uppercase tracking-wide opacity-70">Errors</div>
                        <div className="text-xl font-semibold">{errorCount}</div>
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
                    <div className="w-full min-w-0 overflow-hidden pb-1">
                        <div
                            className="grid w-full min-w-0 items-start gap-0"
                            style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                        >
                            {flow.visibleIds.map((id, idx) => {
                                const state = flow.stageStatus[id] || "pending";
                                const isActive = state === "active";
                                const nextId = flow.visibleIds[idx + 1];
                                const nextState = nextId ? (flow.stageStatus[nextId] || "pending") : "pending";
                                return (
                                    <React.Fragment key={id}>
                                        <div className="min-w-0 text-center">
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
                </div>

                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setSelectedTab(t.id)}
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap border border-black/10 dark:border-white/10 transition ${selectedTab === t.id ? stageTone(t.id) : "bg-white/80 dark:bg-black/45 hover:bg-white dark:hover:bg-black/55"}`}
                            >
                                <StageIcon stage={t.id} className="h-3.5 w-3.5" />
                                <span>{t.label}</span>
                                <span className={`px-1.5 py-0.5 rounded-full ${selectedTab === t.id ? "bg-white/20" : "bg-black/10 dark:bg-white/10"}`}>{t.count}</span>
                            </button>
                        ))}
                    </div>
                    {hasMore ? (
                        <button
                            onClick={loadOlder}
                            disabled={loadingMore}
                            className="shrink-0 rounded-md border border-black/20 dark:border-white/20 px-3 py-1.5 text-xs font-semibold bg-white/80 dark:bg-black/45 hover:bg-white dark:hover:bg-black/55 disabled:opacity-60"
                        >
                            {loadingMore ? "Loading..." : "Load older"}
                        </button>
                    ) : null}
                </div>

                <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/75 dark:bg-black/45 overflow-hidden">
                    <div className="px-3 py-2 text-xs font-semibold border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                        <span>{tabs.find((t) => t.id === selectedTab)?.label || "Events"}</span>
                        <span className="opacity-70">{selectedEvents.length} events ({visibleEvents.length} shown)</span>
                    </div>
                    <div className="max-h-80 overflow-auto">
                        <table className="w-full text-xs">
                            <thead className="sticky top-0 bg-black/[.06] dark:bg-white/[.06] backdrop-blur">
                                <tr>
                                    <th className="p-2 text-left w-[90px]">ID</th>
                                    <th className="p-2 text-left w-[125px]">Time</th>
                                    <th className="p-2 text-left w-[280px]">Stage</th>
                                    <th className="p-2 text-left w-[70px]">Pct</th>
                                    <th className="p-2 text-left">Detail</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleEvents.map((e, idx) => {
                                    const errRow = isErrorEvent(e);
                                    const mappedStage = mapEventToWorkflowStage(e.stage) || "all";
                                    return (
                                        <tr key={`${e.id || 0}-${e.ts || idx}-${idx}`} className={`border-t border-black/5 dark:border-white/5 ${errRow ? "bg-red-500/10" : ""}`}>
                                            <td className="p-2 font-mono text-[11px] opacity-75">{e.id || ""}</td>
                                            <td className="p-2 whitespace-nowrap opacity-75">{e.ts ? new Date(e.ts).toLocaleTimeString() : ""}</td>
                                            <td className="p-2 font-medium">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-black/10 dark:border-white/10 ${errRow ? "bg-red-600/20" : "bg-black/5 dark:bg-white/10"}`}>
                                                    <StageIcon stage={mappedStage} className="h-3.5 w-3.5" />
                                                    {e.stage}
                                                </span>
                                            </td>
                                            <td className="p-2 opacity-80">{typeof e.pct === "number" ? `${e.pct}%` : ""}</td>
                                            <td className="p-2 opacity-90 break-words">{e.detail || ""}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {visibleEvents.length === 0 && (
                            <div className="px-3 py-6 text-sm opacity-70">No events in this tab.</div>
                        )}
                        {visibleEvents.length < selectedEvents.length && (
                            <div className="px-3 py-3 text-center">
                                <button
                                    onClick={() => setVisibleCount((c) => c + VISIBLE_EVENTS)}
                                    className="text-xs font-semibold px-4 py-1.5 rounded-md border border-black/20 dark:border-white/20 bg-white/80 dark:bg-black/45 hover:bg-white dark:hover:bg-black/55"
                                >
                                    Show more ({selectedEvents.length - visibleEvents.length} remaining)
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
