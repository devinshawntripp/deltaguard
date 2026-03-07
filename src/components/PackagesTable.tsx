"use client";
import React from "react";
import ProgressGraph from "@/components/ProgressGraph";
import Link from "next/link";

type Job = {
  id: string;
  object_key?: string;
  status: "queued" | "running" | "done" | "failed";
  created_at: string;
  started_at?: string | null;
  finished_at?: string | null;
  progress_pct: number;
  progress_msg?: string | null;
  error_msg?: string | null;
  summary_json?: { target?: { type?: string } } | null;
};

const STATUS_RANK: Record<Job["status"], number> = {
  queued: 0,
  running: 1,
  done: 2,
  failed: 2,
};

function mergeMonotonicJob(cur: Job | undefined, incoming: Partial<Job> & { id: string }): Job {
  const base = (cur || {
    id: incoming.id,
    status: "queued",
    created_at: new Date().toISOString(),
    progress_pct: 0,
  }) as Job;
  const merged = { ...base, ...incoming } as Job;

  const curRank = STATUS_RANK[base.status];
  const nextRank = STATUS_RANK[merged.status];
  if (nextRank < curRank) {
    merged.status = base.status;
  }
  merged.progress_pct = Math.max(base.progress_pct || 0, merged.progress_pct || 0);
  if (!merged.progress_msg) merged.progress_msg = base.progress_msg;
  return merged;
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={`skel-${i}`} className="border-t border-black/5 dark:border-white/5">
          <td className="p-3"><div className="w-4 h-4 rounded bg-black/10 dark:bg-white/10 animate-pulse" /></td>
          <td className="p-3"><div className="h-3 rounded bg-black/10 dark:bg-white/10 animate-pulse w-3/4" /></td>
          <td className="p-3"><div className="h-3 rounded bg-black/10 dark:bg-white/10 animate-pulse w-4/5" /></td>
          <td className="p-3"><div className="h-3 rounded bg-black/10 dark:bg-white/10 animate-pulse w-12" /></td>
          <td className="p-3">
            <div className="h-2 rounded bg-black/10 dark:bg-white/10 animate-pulse w-full" />
            <div className="h-2 rounded bg-black/10 dark:bg-white/10 animate-pulse w-1/2 mt-2" />
          </td>
          <td className="p-3"><div className="h-3 rounded bg-black/10 dark:bg-white/10 animate-pulse w-20" /></td>
          <td className="p-3"><div className="h-3 rounded bg-black/10 dark:bg-white/10 animate-pulse w-20" /></td>
          <td className="p-3 text-right"><div className="h-5 rounded bg-black/10 dark:bg-white/10 animate-pulse w-16 ml-auto" /></td>
        </tr>
      ))}
    </>
  );
}

export default function PackagesTable() {
  const [list, setList] = React.useState<Job[]>([]);
  const [openIds, setOpenIds] = React.useState<Set<string>>(new Set());
  const [loaded, setLoaded] = React.useState(false);
  const sortJobs = React.useCallback((items: Job[]) => {
    const rank = (s: string) => (s === "running" ? 0 : s === "queued" ? 1 : 2);
    const arr = [...items];
    arr.sort((a, b) => {
      const r = rank(a.status) - rank(b.status);
      return r !== 0 ? r : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return arr.slice(0, 100);
  }, []);
  React.useEffect(() => {
    const es = new EventSource("/api/jobs/events");
    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === "snapshot" && Array.isArray(msg.items)) {
          setLoaded(true);
          setList(sortJobs(msg.items));
        }
        if (msg.type === "changed" && msg.item) {
          setList((prev) => {
            if (msg.item.deleted) {
              const next = prev.filter((x) => x.id !== msg.item.id);
              setOpenIds((open) => {
                if (!open.has(msg.item.id)) return open;
                const n = new Set(open);
                n.delete(msg.item.id);
                return n;
              });
              return next;
            }
            if (!msg.item.id) return prev;
            const map = new Map<string, Job>();
            for (const j of prev) map.set(j.id, j);
            const hasFullRow = typeof msg.item.status === "string" && typeof msg.item.created_at === "string";
            if (!hasFullRow && !map.has(msg.item.id)) {
              // Ignore partial notifications for unknown jobs to avoid blank/ghost rows.
              return prev;
            }
            const cur = map.get(msg.item.id);
            map.set(msg.item.id, mergeMonotonicJob(cur, msg.item));
            return sortJobs(Array.from(map.values()));
          });
        }
        if (msg.type === "changed_bulk" && Array.isArray(msg.items)) {
          setList(sortJobs(msg.items as Job[]));
        }
      } catch { }
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [sortJobs]);
  // Also allow local refresh events (after create/delete)
  React.useEffect(() => {
    const handler: EventListener = () => {
      fetch('/api/jobs', { cache: 'no-store' }).then(r => r.ok ? r.json() : []).then((items) => {
        if (!Array.isArray(items)) return;
        setLoaded(true);
        setList((prev) => {
          const map = new Map<string, Job>();
          for (const j of prev) map.set(j.id, j);
          for (const row of items as Job[]) {
            const cur = map.get(row.id);
            map.set(row.id, mergeMonotonicJob(cur, row));
          }
          const next = sortJobs(Array.from(map.values()));
          setOpenIds((open) => {
            const ids = new Set(next.map((j) => j.id));
            const n = new Set<string>();
            for (const id of open) {
              if (ids.has(id)) n.add(id);
            }
            return n;
          });
          return next;
        });
      }).catch(() => { });
    };
    window.addEventListener('jobs-refresh', handler);
    return () => window.removeEventListener('jobs-refresh', handler);
  }, [sortJobs]);
  // Job updates arrive via SSE (/api/jobs/events) above — no polling needed.
  React.useEffect(() => {
    if (list.length === 0) return;
    if (openIds.size === 0) setOpenIds(new Set([list[0].id]));
  }, [list, openIds.size]);
  return (
    <div className="overflow-auto rounded-xl border border-black/10 dark:border-white/10">
      <table className="w-full table-fixed text-sm">
        <thead className="bg-black/[.04] dark:bg-white/[.04] text-left">
          <tr>
            <th className="p-3 w-8"></th>
            <th className="p-3 w-[18%]">Job</th>
            <th className="p-3 w-[24%]">File</th>
            <th className="p-3 w-[8%]">Status</th>
            <th className="p-3 w-[24%]">Progress</th>
            <th className="p-3 w-[12%]">Started</th>
            <th className="p-3 w-[12%]">Finished</th>
            <th className="p-3 w-[12%] text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {!loaded && <SkeletonRows />}
          {loaded && list.length === 0 && (
            <tr>
              <td colSpan={8} className="p-8 text-center muted">No scans yet. Upload a file above to get started.</td>
            </tr>
          )}
          {list.map((j, idx) => {
            const pct = j.status === "done" ? 100 : Math.min(100, j.progress_pct || 0);
            const isActive = j.status === "running" || j.status === "queued";
            const isOpen = openIds.has(j.id) || idx === 0;
            return (
              <React.Fragment key={j.id}>
                <tr className="border-t border-black/5 dark:border-white/5">
                  <td className="p-3 align-top">
                    <button
                      aria-label={isOpen ? "Collapse" : "Expand"}
                      onClick={() => {
                        setOpenIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(j.id)) next.delete(j.id); else next.add(j.id);
                          return next;
                        });
                      }}
                      className={`transition-transform w-4 h-4 inline-flex items-center justify-center ${isOpen ? "rotate-90" : "rotate-0"}`}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" className="opacity-70"><path d="M8 5l8 7-8 7" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
                    </button>
                  </td>
                  <td className="p-3 font-mono text-xs min-w-0">
                    <span className="block truncate" title={j.id}>{j.id}</span>
                  </td>
                  <td className="p-3 opacity-80 text-xs min-w-0">
                    <span className="block truncate" title={j.object_key || ""}>{j.object_key || ""}</span>
                    {j.summary_json?.target?.type && (
                      <span className="inline-block px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[10px] font-medium muted mt-0.5">
                        {({ iso: "ISO", container: "Container", binary: "Binary", source: "Source" } as Record<string, string>)[j.summary_json.target.type] ?? j.summary_json.target.type}
                      </span>
                    )}
                  </td>
                  <td className="p-3 opacity-80">{j.status}</td>
                  <td className="p-3 min-w-0">
                    <div className="h-2 w-full min-w-full max-w-full bg-black/10 dark:bg-white/10 rounded">
                      <div className={`h-2 rounded ${j.status === "failed" ? "bg-red-600" : j.status === "done" ? "bg-green-600" : "bg-blue-600"}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      <span className="inline-block w-full min-w-full max-w-full truncate align-middle" title={j.status === "failed" && j.error_msg ? j.error_msg : j.progress_msg || ""}>{j.status === "failed" && j.error_msg ? j.error_msg : j.progress_msg || ""}</span>
                    </div>
                  </td>
                  <td className="p-3 opacity-70 text-xs min-w-0">
                    <span className="block truncate" title={j.started_at ? new Date(j.started_at).toLocaleString() : ""}>{j.started_at ? new Date(j.started_at).toLocaleString() : ""}</span>
                  </td>
                  <td className="p-3 opacity-70 text-xs min-w-0">
                    <span className="block truncate" title={j.finished_at ? new Date(j.finished_at).toLocaleString() : ""}>{j.finished_at ? new Date(j.finished_at).toLocaleString() : ""}</span>
                  </td>
                  <td className="p-3 text-right min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <Link href={`/dashboard/${j.id}/findings`} className="text-xs px-2 py-1 rounded-md btn-primary">Findings</Link>
                      <Link href={`/dashboard/${j.id}/files`} className="text-xs px-2 py-1 rounded-md btn-secondary">Files</Link>
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/jobs/${j.id}`, { method: "DELETE" });
                            if (!res.ok) return;
                            setList((prev) => prev.filter((x) => x.id !== j.id));
                            setOpenIds((prev) => {
                              if (!prev.has(j.id)) return prev;
                              const n = new Set(prev);
                              n.delete(j.id);
                              return n;
                            });
                          } catch { }
                        }}
                        className="text-xs px-2 py-1 rounded-md bg-[var(--dg-danger)] text-white hover:opacity-90"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                {isOpen && (
                  <tr className="border-t border-black/5 dark:border-white/5">
                    <td className="p-3" colSpan={8}>
                      <div className="grid gap-2">
                        <div className="text-sm font-medium">Workflow</div>
                        <ProgressGraph
                          scanId={j.id}
                          eventsPath={`/api/jobs/${j.id}/events`}
                          mode={isActive ? "stream" : "list"}
                          height={250}
                          onProgress={(p, m) => {
                            setList((prev) => prev.map((x) => x.id === j.id ? { ...x, progress_pct: Math.max(x.progress_pct || 0, p), progress_msg: m || x.progress_msg } : x));
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
