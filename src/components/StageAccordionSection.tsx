"use client";

import React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { WorkflowStageId } from "@/lib/workflowStages";

type ProgressEvent = {
    id?: number;
    stage: string;
    detail?: string;
    ts?: string;
    pct?: number;
};

export type RleRow =
    | { kind: "single"; event: ProgressEvent }
    | {
          kind: "run";
          stage: string;
          count: number;
          firstTs?: string;
          lastTs?: string;
          errorCount: number;
          events: ProgressEvent[];
      };

export function runLengthEncode(events: ProgressEvent[]): RleRow[] {
    if (events.length === 0) return [];

    const result: RleRow[] = [];
    let i = 0;

    while (i < events.length) {
        const current = events[i];
        let j = i + 1;

        // Count consecutive events with the same stage and detail
        while (
            j < events.length &&
            events[j].stage === current.stage &&
            events[j].detail === current.detail
        ) {
            j++;
        }

        const count = j - i;
        if (count === 1) {
            result.push({ kind: "single", event: current });
        } else {
            const run = events.slice(i, j);
            const errorCount = run.filter((e) => {
                const d = String(e.detail || "").toLowerCase();
                return (
                    d.includes("error") ||
                    d.includes("failed") ||
                    String(e.stage || "")
                        .toLowerCase()
                        .endsWith(".error") ||
                    String(e.stage || "")
                        .toLowerCase()
                        .endsWith(".err")
                );
            }).length;
            result.push({
                kind: "run",
                stage: current.stage,
                count,
                firstTs: run[0].ts,
                lastTs: run[run.length - 1].ts,
                errorCount,
                events: run,
            });
        }

        i = j;
    }

    return result;
}

function formatTs(ts?: string): string {
    if (!ts) return "";
    try {
        return new Date(ts).toLocaleTimeString();
    } catch {
        return ts;
    }
}

function isErrorRow(row: RleRow): boolean {
    if (row.kind === "single") {
        const d = String(row.event.detail || "").toLowerCase();
        const s = String(row.event.stage || "").toLowerCase();
        return (
            d.includes("error") ||
            d.includes("failed") ||
            s.endsWith(".error") ||
            s.endsWith(".err")
        );
    }
    return row.errorCount > 0;
}

// Chevron icon for accordion toggle
function ChevronIcon({ expanded }: { expanded: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
            aria-hidden="true"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}

export default function StageAccordionSection({
    stageId,
    label,
    totalCount,
    errorCount,
    firstTs,
    lastTs,
    scanId,
    expanded,
    onToggle,
    initialEvents,
    isLive,
}: {
    stageId: WorkflowStageId;
    label: string;
    totalCount: number;
    errorCount: number;
    firstTs?: string;
    lastTs?: string;
    scanId: string;
    expanded: boolean;
    onToggle: () => void;
    initialEvents?: ProgressEvent[];
    isLive?: boolean;
}) {
    const parentRef = React.useRef<HTMLDivElement>(null);

    // Track expanded run rows (by rle index)
    const [expandedRuns, setExpandedRuns] = React.useState<Set<number>>(
        new Set()
    );
    const [loadedEvents, setLoadedEvents] = React.useState<ProgressEvent[]>(
        initialEvents || []
    );
    const [loadingMore, setLoadingMore] = React.useState(false);
    const [hasMore, setHasMore] = React.useState(false);
    const [nextCursor, setNextCursor] = React.useState<number | null>(null);

    // Sync with prop changes (live events arriving)
    React.useEffect(() => {
        setLoadedEvents(initialEvents || []);
    }, [initialEvents]);

    // On first expand, if no initialEvents, fetch from API
    React.useEffect(() => {
        if (!expanded) return;
        if ((initialEvents || []).length > 0) return;
        if (loadedEvents.length > 0) return;

        const controller = new AbortController();
        async function fetchInitial() {
            try {
                const params = new URLSearchParams({
                    order: "asc",
                    page_size: "500",
                    stage_filter: `${stageId}.`,
                });
                const res = await fetch(
                    `/api/jobs/${scanId}/events/list?${params.toString()}`,
                    { signal: controller.signal, cache: "no-store" }
                );
                if (!res.ok) return;
                const data = await res.json();
                const items: ProgressEvent[] = Array.isArray(data.items)
                    ? data.items
                    : [];
                setLoadedEvents(items);
                setHasMore(data.has_more === true);
                setNextCursor(
                    typeof data.next_cursor === "number"
                        ? data.next_cursor
                        : null
                );
            } catch {
                // aborted or network error — ignore
            }
        }

        fetchInitial();
        return () => controller.abort();
    }, [expanded, scanId, stageId, initialEvents, loadedEvents.length]);

    // Apply RLE only to completed (non-live) sections
    const rleRows: RleRow[] = React.useMemo(() => {
        if (isLive) {
            // No RLE during live streaming — show all events as singles
            return loadedEvents.map((event) => ({ kind: "single", event }));
        }
        return runLengthEncode(loadedEvents);
    }, [loadedEvents, isLive]);

    // Flatten RLE rows — expand runs where user clicked
    const flatRows: Array<{ rleIndex: number; row: RleRow; eventIndex?: number }> =
        React.useMemo(() => {
            const result: Array<{
                rleIndex: number;
                row: RleRow;
                eventIndex?: number;
            }> = [];
            rleRows.forEach((row, rleIndex) => {
                if (row.kind === "run" && expandedRuns.has(rleIndex)) {
                    // Expand run into individual rows
                    row.events.forEach((event, eventIndex) => {
                        result.push({
                            rleIndex,
                            row: { kind: "single", event },
                            eventIndex,
                        });
                    });
                } else {
                    result.push({ rleIndex, row });
                }
            });
            return result;
        }, [rleRows, expandedRuns]);

    const rowVirtualizer = useVirtualizer({
        count: flatRows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 32,
        overscan: 5,
    });

    const loadMore = React.useCallback(async () => {
        if (!hasMore || !nextCursor || loadingMore) return;
        setLoadingMore(true);
        try {
            const params = new URLSearchParams({
                order: "asc",
                page_size: "500",
                stage_filter: `${stageId}.`,
                cursor: String(nextCursor),
            });
            const res = await fetch(
                `/api/jobs/${scanId}/events/list?${params.toString()}`,
                { cache: "no-store" }
            );
            if (!res.ok) return;
            const data = await res.json();
            const items: ProgressEvent[] = Array.isArray(data.items)
                ? data.items
                : [];
            setLoadedEvents((prev) => [...prev, ...items]);
            setHasMore(data.has_more === true);
            setNextCursor(
                typeof data.next_cursor === "number" ? data.next_cursor : null
            );
        } catch {
            // ignore
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, nextCursor, loadingMore, scanId, stageId]);

    // Auto load more when scrolled to bottom
    const handleScroll = React.useCallback(() => {
        const el = parentRef.current;
        if (!el) return;
        if (
            el.scrollHeight - el.scrollTop - el.clientHeight < 100 &&
            hasMore &&
            !loadingMore
        ) {
            loadMore();
        }
    }, [hasMore, loadingMore, loadMore]);

    return (
        <div className="border-b border-black/10 dark:border-white/10 last:border-b-0">
            {/* Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-expanded={expanded}
            >
                <ChevronIcon expanded={expanded} />
                <span className="font-semibold text-sm truncate flex-1">
                    {label}
                </span>
                <span className="text-xs opacity-60 shrink-0">
                    {totalCount.toLocaleString()} events
                </span>
                {firstTs && lastTs && (
                    <span className="text-[11px] opacity-50 shrink-0 hidden sm:inline">
                        {formatTs(firstTs)} — {formatTs(lastTs)}
                    </span>
                )}
                {errorCount > 0 && (
                    <span className="shrink-0 inline-flex items-center rounded-full bg-red-600 text-white text-[10px] font-semibold px-1.5 py-0.5">
                        {errorCount} err
                    </span>
                )}
                {isLive && (
                    <span className="shrink-0 inline-flex items-center rounded-full bg-cyan-600 text-white text-[10px] font-semibold px-1.5 py-0.5 animate-pulse">
                        live
                    </span>
                )}
            </button>

            {/* Body — only mounted when expanded (CRITICAL: do not use display:none) */}
            {expanded && (
                <div
                    ref={parentRef}
                    className="overflow-y-auto"
                    style={{ height: "300px" }}
                    onScroll={handleScroll}
                >
                    {flatRows.length === 0 ? (
                        <div className="px-3 py-4 text-sm opacity-60">
                            {loadedEvents.length === 0
                                ? "Loading events..."
                                : "No events."}
                        </div>
                    ) : (
                        <div
                            style={{
                                height: `${rowVirtualizer.getTotalSize()}px`,
                                width: "100%",
                                position: "relative",
                            }}
                        >
                            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                                const { rleIndex, row } = flatRows[virtualItem.index];
                                const isErr = isErrorRow(row);

                                return (
                                    <div
                                        key={virtualItem.key}
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            height: `${virtualItem.size}px`,
                                            transform: `translateY(${virtualItem.start}px)`,
                                        }}
                                        className={`flex items-start gap-2 px-3 py-1 text-xs border-t border-black/5 dark:border-white/5 ${
                                            isErr
                                                ? "bg-red-500/10 text-red-800 dark:text-red-300"
                                                : ""
                                        }`}
                                    >
                                        {row.kind === "run" ? (
                                            <button
                                                onClick={() => {
                                                    setExpandedRuns((prev) => {
                                                        const next = new Set(
                                                            prev
                                                        );
                                                        if (
                                                            next.has(rleIndex)
                                                        ) {
                                                            next.delete(
                                                                rleIndex
                                                            );
                                                        } else {
                                                            next.add(rleIndex);
                                                        }
                                                        return next;
                                                    });
                                                }}
                                                className="flex-1 text-left font-mono text-[11px] opacity-80 hover:opacity-100 transition-opacity"
                                            >
                                                <span className="text-cyan-700 dark:text-cyan-400 font-semibold">
                                                    [{row.count}x]
                                                </span>{" "}
                                                <span className="opacity-70">
                                                    {row.stage}
                                                </span>
                                                {row.errorCount > 0 && (
                                                    <span className="ml-2 text-red-600 dark:text-red-400">
                                                        ({row.errorCount}{" "}
                                                        errors)
                                                    </span>
                                                )}
                                                {row.firstTs && row.lastTs && (
                                                    <span className="ml-2 opacity-50">
                                                        {formatTs(row.firstTs)}{" "}
                                                        —{" "}
                                                        {formatTs(row.lastTs)}
                                                    </span>
                                                )}
                                                <span className="ml-1 opacity-40 text-[10px]">
                                                    ▶ expand
                                                </span>
                                            </button>
                                        ) : (
                                            <>
                                                <span className="font-mono text-[10px] opacity-40 w-[60px] shrink-0 truncate">
                                                    {row.event.ts
                                                        ? formatTs(row.event.ts)
                                                        : ""}
                                                </span>
                                                <span className="font-mono text-[11px] opacity-70 w-[140px] shrink-0 truncate">
                                                    {row.event.stage}
                                                </span>
                                                {typeof row.event.pct ===
                                                "number" ? (
                                                    <span className="opacity-50 text-[10px] w-[32px] shrink-0">
                                                        {row.event.pct}%
                                                    </span>
                                                ) : (
                                                    <span className="w-[32px] shrink-0" />
                                                )}
                                                <span className="font-mono opacity-85 break-words min-w-0">
                                                    {row.event.detail || ""}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {/* Load more at the bottom */}
                    {hasMore && (
                        <div className="px-3 py-2 text-center">
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="text-xs font-semibold px-3 py-1 rounded border border-black/20 dark:border-white/20 bg-white/80 dark:bg-black/45 hover:bg-white dark:hover:bg-black/55 disabled:opacity-60"
                            >
                                {loadingMore ? "Loading..." : "Load more"}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
