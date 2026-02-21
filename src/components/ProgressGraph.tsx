"use client";
import React from "react";
import { openSse } from "@/lib/ssePool";

type ProgressEvent = { stage: string; detail?: string; ts?: string; pct?: number };
type FlowStatus = "pending" | "active" | "done" | "error";

function parse(lines: string[]): ProgressEvent[] {
    const out: ProgressEvent[] = [];
    const seen = new Set<string>();
    for (const l of lines) {
        try {
            const j = JSON.parse(l);
            if (j?.stage) {
                const key = `${j.stage}|${j.detail ?? ""}|${j.ts ?? ""}|${typeof j.pct === "number" ? j.pct : ""}`;
                if (seen.has(key)) continue;
                seen.add(key);
                out.push({
                    stage: String(j.stage),
                    detail: j.detail ?? undefined,
                    ts: j.ts ?? undefined,
                    pct: typeof j.pct === "number" ? j.pct : undefined,
                });
            }
        } catch {
            const m = String(l).match(/^\s*([^:]+?)\s*:\s*(.*)$/);
            if (m) {
                const stage = m[1].trim();
                const detail = m[2].trim();
                const key = `${stage}|${detail}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    out.push({ stage, detail, pct: undefined });
                }
            }
        }
    }
    return out;
}

function groupStage(stage: string): string {
    const normalized = stage.toLowerCase();
    if (normalized === "scan.done" || normalized === "scan.summary" || normalized === "scan.err" || normalized === "scan.error") return "summary";
    const raw = stage.replace(/\.(start|done|ok|err|error|skip)$/i, "");
    if (/(^|\.)osv(\.|$)/i.test(raw)) return "osv";
    if (/(^|\.)nvd(\.|$)/i.test(raw)) return "nvd";
    if (raw.startsWith("container.packages")) return "packages";
    if (raw.startsWith("container.extract") || raw.startsWith("container.layers")) return "extract";
    if (raw === "scan" || raw.startsWith("scan.")) return "scan";
    if (raw.startsWith("binary")) return "binary";
    return raw;
}

function isTerminalStage(stage: string): boolean {
    const s = stage.toLowerCase();
    return s === "scan.done" || s.endsWith(".done") || s.endsWith(".ok") || s.endsWith(".skip");
}

function isErrorEvent(e: ProgressEvent): boolean {
    const s = (e.stage || "").toLowerCase();
    const d = (e.detail || "").toLowerCase();
    return s.endsWith(".err") || s.endsWith(".error") || d.includes("error") || d.includes("failed");
}

const BACKDROP = {
    background:
        "radial-gradient(circle at 12% 18%, rgba(14,165,233,0.22), transparent 36%), radial-gradient(circle at 82% 16%, rgba(244,114,182,0.18), transparent 40%), radial-gradient(circle at 30% 88%, rgba(34,197,94,0.16), transparent 34%)",
};

const LABELS: Record<string, string> = {
    scan: "Scan start",
    extract: "Extract image",
    packages: "Detect packages",
    osv: "Query/Enrich OSV",
    nvd: "NVD cache/Enrichment",
    binary: "Binary analysis",
    summary: "Scan end",
};

const STAGE_ORDER = ["scan", "extract", "packages", "osv", "nvd", "binary", "summary"];
const STREAM_SEED_LIMIT = 1200;
const LIST_LIMIT = 2500;
const MAX_EVENTS_IN_MEMORY = 4000;
const MAX_TABLE_ROWS = 800;

function StageIcon({ stage, className = "h-4 w-4" }: { stage: string; className?: string }) {
    const cls = `${className} shrink-0`;
    switch (stage) {
        case "scan":
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
        case "packages":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
                    <path d="M4 6h16M4 12h16M4 18h10" />
                </svg>
            );
        case "osv":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18M12 3c2.2 2.4 3.4 5.5 3.4 9S14.2 18.6 12 21M12 3C9.8 5.4 8.6 8.5 8.6 12S9.8 18.6 12 21" />
                </svg>
            );
        case "nvd":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
                    <path d="M12 3 5 6v6c0 4.2 2.8 7.8 7 9 4.2-1.2 7-4.8 7-9V6l-7-3Z" />
                    <path d="m9.5 12 2 2 3-3" />
                </svg>
            );
        case "binary":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
                    <rect x="7" y="7" width="10" height="10" rx="1.5" />
                    <path d="M9 3v3M12 3v3M15 3v3M9 18v3M12 18v3M15 18v3M3 9h3M3 12h3M3 15h3M18 9h3M18 12h3M18 15h3" />
                </svg>
            );
        case "summary":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cls} aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="m8 12 2.6 2.6L16.5 9" />
                </svg>
            );
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

export default function ProgressGraph({ scanId, eventsPath, mode = "auto", onProgress }: { scanId: string; eventsPath?: string; mode?: "auto" | "stream" | "list"; onProgress?: (pct: number, msg?: string) => void }) {
    const [lines, setLines] = React.useState<string[]>([]);
    const [totalEvents, setTotalEvents] = React.useState<number | null>(null);
    const [selectedTab, setSelectedTab] = React.useState<string>("all");
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [nowMs, setNowMs] = React.useState<number>(() => Date.now());

    React.useEffect(() => {
        const streamUrl = eventsPath || `/api/scans/${scanId}/events`;
        const listLimit = mode === "list" ? LIST_LIMIT : STREAM_SEED_LIMIT;
        const listUrl = `/api/jobs/${scanId}/events/list?limit=${listLimit}`;
        let closeFn: (() => void) | null = null;
        let cancelled = false;

        async function run() {
            setLoading(true);
            setError(null);

            if (mode === "list") {
                try {
                    const res = await fetch(listUrl, { cache: "no-store" });
                    let arr: ProgressEvent[] = [];
                    if (res.ok) arr = await res.json();
                    const totalHeader = Number(res.headers.get("x-events-total") || "");
                    if (Number.isFinite(totalHeader) && totalHeader >= 0 && !cancelled) {
                        setTotalEvents(totalHeader);
                    }

                    const hasSummary = Array.isArray(arr) && arr.some((e) => String(e?.stage || "").toLowerCase().includes("scan.summary"));
                    if (!hasSummary) {
                        try {
                            const presigned = await fetch(`/api/jobs/${scanId}/report`, { cache: "no-store" });
                            if (presigned.ok) {
                                const p = await presigned.json();
                                if (p?.url) {
                                    const rep = await fetch(String(p.url));
                                    if (rep.ok) {
                                        const json = await rep.json().catch(() => null);
                                        if (json) {
                                            const summary = (json.summary) ? json.summary : json;
                                            arr.push({ ts: new Date().toISOString(), stage: "scan.summary", detail: JSON.stringify(summary), pct: 100 });
                                        }
                                    }
                                }
                            }
                        } catch { }
                    }

                    if (!cancelled) {
                        const seeded = (Array.isArray(arr) ? arr : [])
                            .slice(-MAX_EVENTS_IN_MEMORY)
                            .map((x) => JSON.stringify(x));
                        setLines(seeded);
                    }
                } catch (e: unknown) {
                    if (!cancelled) setError(String(e instanceof Error ? e.message : e));
                } finally {
                    if (!cancelled) setLoading(false);
                }
                return;
            }

            if (mode === "stream" || mode === "auto") {
                try {
                    const seed = await fetch(listUrl, { cache: "no-store" });
                    if (seed.ok) {
                        const arr = await seed.json() as ProgressEvent[];
                        const totalHeader = Number(seed.headers.get("x-events-total") || "");
                        if (!cancelled && Number.isFinite(totalHeader) && totalHeader >= 0) {
                            setTotalEvents(totalHeader);
                        }
                        if (!cancelled && Array.isArray(arr)) {
                            const seeded = arr
                                .slice(-MAX_EVENTS_IN_MEMORY)
                                .map((x) => JSON.stringify(x));
                            setLines(seeded);
                        }
                    }
                } catch (e: unknown) {
                    if (!cancelled) setError(String(e instanceof Error ? e.message : e));
                } finally {
                    if (!cancelled) setLoading(false);
                }

                openSse(streamUrl, {
                    onMessage: (ev) => {
                        setLines((prev) => {
                            const next = [...prev, ev.data];
                            if (next.length > MAX_EVENTS_IN_MEMORY) {
                                return next.slice(next.length - MAX_EVENTS_IN_MEMORY);
                            }
                            return next;
                        });
                        setTotalEvents((prev) => {
                            if (prev == null) return prev;
                            return prev + 1;
                        });
                        setLoading(false);
                    },
                    onError: () => { try { closeFn?.(); } catch { } },
                }).then((c) => { closeFn = c; });
            }
        }

        run();
        return () => {
            cancelled = true;
            try { closeFn?.(); } catch { }
        };
    }, [scanId, eventsPath, mode]);

    const events = React.useMemo(() => parse(lines), [lines]);

    const progressCbRef = React.useRef<typeof onProgress | undefined>(undefined);
    React.useEffect(() => { progressCbRef.current = onProgress; }, [onProgress]);

    const lastSentRef = React.useRef<{ pct: number; msg?: string }>({ pct: 0, msg: undefined });
    React.useEffect(() => {
        lastSentRef.current = { pct: 0, msg: undefined };
        setSelectedTab("all");
    }, [scanId]);

    React.useEffect(() => {
        if (!events.length) return;
        let latestPct = -1;
        let latestMsg: string | undefined = undefined;

        for (let i = events.length - 1; i >= 0; i--) {
            const e = events[i];
            if (!latestMsg && typeof e.detail === "string" && e.detail) latestMsg = e.detail;
            const pctMatch = /\b(\d{1,3})%\b/.exec(String(e.detail || ""));
            let p = typeof e.pct === "number" ? e.pct : (pctMatch ? Number(pctMatch[1]) : undefined);
            if (p === undefined && isTerminalStage(e.stage)) p = 100;
            if (typeof p === "number") {
                latestPct = Math.max(latestPct, Math.min(100, Math.max(0, p)));
            }
            if (latestPct >= 0) break;
        }

        if (latestPct >= 0) {
            const prev = lastSentRef.current;
            latestPct = Math.max(prev.pct, latestPct);
            if (prev.pct !== latestPct || prev.msg !== latestMsg) {
                lastSentRef.current = { pct: latestPct, msg: latestMsg };
                try { progressCbRef.current?.(latestPct, latestMsg); } catch { }
            }
        }
    }, [events]);

    React.useEffect(() => {
        setTotalEvents(null);
    }, [scanId]);

    const stages = React.useMemo(() => {
        const acc: Record<string, ProgressEvent[]> = {};
        for (const e of events) {
            const key = groupStage(e.stage);
            (acc[key] ||= []).push(e);
        }
        return acc;
    }, [events]);

    const rank = (k: string) => {
        const i = STAGE_ORDER.indexOf(k);
        return i === -1 ? 999 : i;
    };

    const ordered = Object.keys(stages).sort((a, b) => {
        const r = rank(a) - rank(b);
        return r !== 0 ? r : a.localeCompare(b);
    });

    const errorCount = events.filter(isErrorEvent).length;
    const firstEvent = events[0];
    const lastEvent = events.length ? events[events.length - 1] : undefined;
    const firstTs = firstEvent?.ts ? new Date(firstEvent.ts).getTime() : 0;
    const lastTs = lastEvent?.ts ? new Date(lastEvent.ts).getTime() : 0;
    const hasTerminalScan = events.some((e) => {
        const s = String(e.stage || "").toLowerCase();
        return s === "scan.done" || s === "scan.summary" || s === "scan.err" || s === "scan.error";
    });
    const effectiveLastTs = hasTerminalScan ? lastTs : Math.max(lastTs, nowMs);
    const durationSec = firstTs && effectiveLastTs >= firstTs ? Math.round((effectiveLastTs - firstTs) / 1000) : 0;

    React.useEffect(() => {
        if (!events.length || hasTerminalScan) return;
        const timer = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [events.length, hasTerminalScan]);

    const tabs = React.useMemo(() => {
        const t: Array<{ id: string; label: string; count: number }> = [{ id: "all", label: "All", count: events.length }];
        for (const id of ordered) {
            t.push({ id, label: LABELS[id] || id, count: (stages[id] || []).length });
        }
        if (errorCount > 0) t.push({ id: "errors", label: "Errors", count: errorCount });
        return t;
    }, [events.length, ordered, stages, errorCount]);

    const selectedEvents = React.useMemo(() => {
        if (selectedTab === "all") return events;
        if (selectedTab === "errors") return events.filter(isErrorEvent);
        return stages[selectedTab] || [];
    }, [events, selectedTab, stages]);
    const renderedEvents = React.useMemo(() => {
        if (selectedEvents.length <= MAX_TABLE_ROWS) return selectedEvents;
        return selectedEvents.slice(selectedEvents.length - MAX_TABLE_ROWS);
    }, [selectedEvents]);

    const flow = React.useMemo(() => {
        const seen = new Set<string>();
        let lastSeenIndex = -1;
        for (const e of events) {
            const g = groupStage(e.stage);
            const idx = STAGE_ORDER.indexOf(g);
            if (idx !== -1) {
                seen.add(g);
                if (idx > lastSeenIndex) lastSeenIndex = idx;
            }
        }

        const terminalEvent = [...events].reverse().find((e) => {
            const s = String(e.stage || "").toLowerCase();
            return s === "scan.done" || s === "scan.summary" || s === "scan.err" || s === "scan.error";
        });
        const terminalStage = String(terminalEvent?.stage || "").toLowerCase();
        const isFailed = terminalStage === "scan.err" || terminalStage === "scan.error";
        const isFinished = terminalStage === "scan.done" || terminalStage === "scan.summary";

        const statuses = STAGE_ORDER.map((id, idx) => {
            const subs = stages[id] || [];
            const hasEvents = subs.length > 0;
            const hasErr = subs.some(isErrorEvent);
            const hasDone = subs.some((e) => isTerminalStage(e.stage));

            let status: FlowStatus = "pending";
            if (hasErr || (id === "summary" && isFailed)) {
                status = "error";
            } else if ((id === "summary" && isFinished) || hasDone || idx < lastSeenIndex) {
                status = "done";
            } else if (hasEvents || idx === lastSeenIndex) {
                status = "active";
            }
            return { id, status };
        });

        return {
            statuses,
            isFinished,
            isFailed,
            finishedTs: terminalEvent?.ts,
        };
    }, [events, stages]);

    React.useEffect(() => {
        if (!tabs.find((t) => t.id === selectedTab)) setSelectedTab("all");
    }, [tabs, selectedTab]);

    if (loading) {
        return (
            <div className="rounded-xl border border-black/10 dark:border-white/10 p-3 text-sm opacity-75">
                Loading workflow…
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
    if (!events.length) {
        return (
            <div className="rounded-xl border border-black/10 dark:border-white/10 p-3 text-sm opacity-75">
                No workflow events yet.
            </div>
        );
    }

    function safeSummary(text: string) {
        try { const j = JSON.parse(text); return JSON.stringify(j, null, 2); } catch { return text; }
    }

    const flowLabel = (status: FlowStatus) => {
        if (status === "done") return "Done";
        if (status === "active") return "Running";
        if (status === "error") return "Error";
        return "Pending";
    };

    const flowTone = (status: FlowStatus) => {
        if (status === "done") return "bg-emerald-600 text-white border-emerald-700";
        if (status === "active") return "bg-cyan-600 text-white border-cyan-700";
        if (status === "error") return "bg-red-600 text-white border-red-700";
        return "bg-white/80 dark:bg-black/45 text-black/80 dark:text-white/80 border-black/10 dark:border-white/10";
    };

    const workflowStateLabel = flow.isFailed ? "Scan failed" : (flow.isFinished ? "Scan finished" : "Scan running");

    const stageTone = (id: string) => {
        if (id === "errors") return "bg-red-600/90 text-white";
        if (id === "all") return "bg-slate-800/90 text-white";
        const subs = stages[id] || [];
        if (!subs.length) return "bg-gray-500/80 text-white";
        const hasStart = subs.some((e) => /\.start$/i.test(e.stage) || e.stage === "scan.start");
        const done = subs.some((e) => isTerminalStage(e.stage));
        if (hasStart && !done) return "bg-cyan-600 text-white";
        if (done) return "bg-emerald-600 text-white";
        return "bg-gray-500 text-white";
    };

    return (
        <div className="relative rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden" style={BACKDROP}>
            <div className="relative grid gap-3 p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <div className="rounded-lg border border-black/10 dark:border-white/10 bg-white/75 dark:bg-black/45 px-3 py-2">
                        <div className="text-[11px] uppercase tracking-wide opacity-70">Events</div>
                        <div className="text-xl font-semibold">{totalEvents ?? events.length}</div>
                        {totalEvents !== null && totalEvents > events.length ? (
                            <div className="text-[11px] opacity-70">window: latest {events.length}</div>
                        ) : null}
                    </div>
                    <div className="rounded-lg border border-black/10 dark:border-white/10 bg-white/75 dark:bg-black/45 px-3 py-2">
                        <div className="text-[11px] uppercase tracking-wide opacity-70">Duration</div>
                        <div className="text-xl font-semibold">{durationSec > 0 ? `${durationSec}s` : "n/a"}</div>
                    </div>
                    <div className="rounded-lg border border-black/10 dark:border-white/10 bg-white/75 dark:bg-black/45 px-3 py-2">
                        <div className="text-[11px] uppercase tracking-wide opacity-70">Errors</div>
                        <div className="text-xl font-semibold">{errorCount}</div>
                    </div>
                    <div className="rounded-lg border border-black/10 dark:border-white/10 bg-white/75 dark:bg-black/45 px-3 py-2">
                        <div className="text-[11px] uppercase tracking-wide opacity-70">Status</div>
                        <div className="flex items-center gap-1.5 text-base font-semibold">
                            <StageIcon stage={flow.isFailed ? "errors" : "summary"} className="h-4 w-4" />
                            <span>{workflowStateLabel}</span>
                        </div>
                        <div className="text-[11px] opacity-70">
                            {flow.finishedTs ? `Updated ${new Date(flow.finishedTs).toLocaleTimeString()}` : "Awaiting completion event"}
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/75 dark:bg-black/45 p-3">
                    <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] uppercase tracking-wide opacity-70">Workflow Flow</span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                            flow.isFailed
                                ? "bg-red-600 text-white border-red-700"
                                : flow.isFinished
                                    ? "bg-emerald-600 text-white border-emerald-700"
                                    : "bg-cyan-600 text-white border-cyan-700"
                        }`}>
                            <StageIcon stage={flow.isFailed ? "errors" : "summary"} className="h-3.5 w-3.5" />
                            <span>{workflowStateLabel}</span>
                            {flow.finishedTs ? <span className="opacity-85">{new Date(flow.finishedTs).toLocaleTimeString()}</span> : null}
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <div className="min-w-[760px] flex items-center gap-2">
                            {STAGE_ORDER.map((id, idx) => {
                                const state = flow.statuses[idx]?.status || "pending";
                                const connectClass =
                                    state === "error"
                                        ? "bg-red-500/80"
                                        : (state === "done" || state === "active")
                                            ? "bg-cyan-500/80"
                                            : "bg-black/10 dark:bg-white/10";
                                return (
                                    <React.Fragment key={id}>
                                        <div className="w-28 shrink-0 text-center">
                                            <div className={`mx-auto h-9 w-9 rounded-full border flex items-center justify-center ${flowTone(state)}`}>
                                                <StageIcon stage={id} className="h-4 w-4" />
                                            </div>
                                            <div className="mt-1 text-[11px] font-semibold leading-tight">{LABELS[id] || id}</div>
                                            <div className="text-[10px] opacity-70">{flowLabel(state)}</div>
                                        </div>
                                        {idx < STAGE_ORDER.length - 1 ? <div className={`h-1 flex-1 rounded ${connectClass}`} /> : null}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </div>

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

                <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/75 dark:bg-black/45 overflow-hidden">
                    <div className="px-3 py-2 text-xs font-semibold border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                        <span>{tabs.find((t) => t.id === selectedTab)?.label || "Events"}</span>
                        <span className="opacity-70">
                            {renderedEvents.length} shown{selectedEvents.length > renderedEvents.length ? ` (latest of ${selectedEvents.length})` : ""}
                        </span>
                    </div>
                    <div className="max-h-72 overflow-auto">
                        <table className="w-full text-xs">
                            <thead className="sticky top-0 bg-black/[.06] dark:bg-white/[.06] backdrop-blur">
                                <tr>
                                    <th className="p-2 text-left w-[125px]">Time</th>
                                    <th className="p-2 text-left w-[280px]">Stage</th>
                                    <th className="p-2 text-left w-[70px]">Pct</th>
                                    <th className="p-2 text-left">Detail</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderedEvents.map((e, idx) => {
                                    const errRow = isErrorEvent(e);
                                    const detail = selectedTab === "summary" && e.detail ? safeSummary(e.detail) : (e.detail || "");
                                    const eventStageGroup = groupStage(e.stage);
                                    return (
                                        <tr key={`${e.stage}-${e.ts || idx}-${idx}`} className={`border-t border-black/5 dark:border-white/5 ${errRow ? "bg-red-500/10" : ""}`}>
                                            <td className="p-2 whitespace-nowrap opacity-75">{e.ts ? new Date(e.ts).toLocaleTimeString() : ""}</td>
                                            <td className="p-2 font-medium">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-black/10 dark:border-white/10 ${errRow ? "bg-red-600/20" : "bg-black/5 dark:bg-white/10"}`}>
                                                    <StageIcon stage={errRow ? "errors" : eventStageGroup} className="h-3.5 w-3.5" />
                                                    {e.stage}
                                                </span>
                                            </td>
                                            <td className="p-2 opacity-80">{typeof e.pct === "number" ? `${e.pct}%` : ""}</td>
                                            <td className="p-2 opacity-90 break-words">
                                                {selectedTab === "summary" && detail ? (
                                                    <pre className="whitespace-pre-wrap text-[11px]">{detail}</pre>
                                                ) : detail}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {renderedEvents.length === 0 && (
                            <div className="px-3 py-6 text-sm opacity-70">No events in this tab.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
