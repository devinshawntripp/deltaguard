"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

type AuditEntry = {
  id: string;
  org_id: string | null;
  action: string;
  category: string;
  severity: string;
  target_type: string | null;
  target_id: string | null;
  detail: string | null;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  user_email: string | null;
  user_name: string | null;
  created_at: string;
};

type AuditResponse = {
  items: AuditEntry[];
  total: number;
  page: number;
  page_size: number;
};

const CATEGORIES = [
  { value: "", label: "All categories" },
  { value: "auth", label: "Auth" },
  { value: "scans", label: "Scans" },
  { value: "registries", label: "Registries" },
  { value: "schedules", label: "Schedules" },
  { value: "notifications", label: "Notifications" },
  { value: "policies", label: "Policies" },
  { value: "org", label: "Organization" },
  { value: "api_keys", label: "API Keys" },
  { value: "billing", label: "Billing" },
  { value: "scanner", label: "Scanner" },
  { value: "reports", label: "Reports" },
];

const SEVERITIES = [
  { value: "", label: "All severities" },
  { value: "info", label: "Info" },
  { value: "warn", label: "Warning" },
];

function categoryColor(category: string): string {
  const map: Record<string, string> = {
    auth: "bg-purple-500/15 text-purple-400",
    scans: "bg-blue-500/15 text-blue-400",
    org: "bg-green-500/15 text-green-400",
    billing: "bg-yellow-500/15 text-yellow-400",
    registries: "bg-cyan-500/15 text-cyan-400",
    schedules: "bg-indigo-500/15 text-indigo-400",
    notifications: "bg-orange-500/15 text-orange-400",
    policies: "bg-red-500/15 text-red-400",
    api_keys: "bg-pink-500/15 text-pink-400",
    scanner: "bg-teal-500/15 text-teal-400",
    reports: "bg-sky-500/15 text-sky-400",
  };
  return map[category] || "bg-zinc-500/15 text-zinc-400";
}

function formatRelativeTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = Date.now();
    const diff = now - d.getTime();
    if (diff < 60_000) return "just now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

export default function AuditLogPage() {
  const [items, setItems] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [live, setLive] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [showInfo, setShowInfo] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pageSize = 50;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
      });
      if (category) params.set("category", category);
      if (severity) params.set("severity", severity);
      if (debouncedSearch) params.set("q", debouncedSearch);
      const res = await fetch(`/api/org/audit-log?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data: AuditResponse = await res.json();
      setItems(data.items);
      setTotal(data.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [page, category, severity, debouncedSearch, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // SSE live streaming
  useEffect(() => {
    if (!live) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    const es = new EventSource("/api/org/audit-log/stream");
    eventSourceRef.current = es;

    es.onmessage = (ev) => {
      try {
        const entry: AuditEntry = JSON.parse(ev.data);
        setItems((prev) => {
          // Avoid duplicates
          if (prev.some((e) => e.id === entry.id)) return prev;
          return [entry, ...prev].slice(0, 200);
        });
        setTotal((t) => t + 1);
        // Mark as new for highlight animation
        setNewIds((prev) => new Set(prev).add(entry.id));
        setTimeout(() => {
          setNewIds((prev) => {
            const next = new Set(prev);
            next.delete(entry.id);
            return next;
          });
        }, 2000);
      } catch {
        /* ignore parse errors */
      }
    };

    es.onerror = () => {
      // Reconnect handled by browser EventSource
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [live]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Audit Log</h1>
          <p className="text-sm text-zinc-500">
            Track all actions across your organization.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">
            {total} event{total !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => setLive(!live)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              live
                ? "border-green-500/30 bg-green-500/10 text-green-500"
                : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                live ? "animate-pulse bg-green-500" : "bg-zinc-500"
              }`}
            />
            {live ? "Live" : "Paused"}
          </button>
        </div>
      </div>

      {/* What gets logged? */}
      <div className="rounded-xl border border-black/10 dark:border-white/10 overflow-hidden">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-full p-3 flex items-center justify-between text-left hover:bg-black/[.02] dark:hover:bg-white/[.02] transition"
        >
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M8 7v4M8 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <span className="text-sm font-medium">What gets logged?</span>
          </div>
          <svg width="12" height="12" viewBox="0 0 12 12" className={`transform transition ${showInfo ? 'rotate-180' : ''}`}><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
        {showInfo && (
          <div className="px-4 pb-4 border-t border-black/5 dark:border-white/5 pt-3">
            <p className="text-xs muted mb-3">ScanRook logs every significant action across your organization. All events include who, what, when, and the client IP.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Auth */}
              <div className="rounded-lg border border-black/5 dark:border-white/5 p-3">
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1.5">Authentication</div>
                <ul className="text-[11px] muted grid gap-0.5">
                  <li>User login / logout</li>
                  <li>Failed login attempts</li>
                </ul>
              </div>
              {/* Scans */}
              <div className="rounded-lg border border-black/5 dark:border-white/5 p-3">
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1.5">Scans</div>
                <ul className="text-[11px] muted grid gap-0.5">
                  <li>Scan created (UI, API, CLI, scheduled)</li>
                  <li>Scan cancelled</li>
                  <li>Scan deleted</li>
                </ul>
              </div>
              {/* Registries */}
              <div className="rounded-lg border border-black/5 dark:border-white/5 p-3">
                <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-1.5">Registries</div>
                <ul className="text-[11px] muted grid gap-0.5">
                  <li>Registry added / updated / deleted</li>
                  <li>Connection tested</li>
                </ul>
              </div>
              {/* Schedules */}
              <div className="rounded-lg border border-black/5 dark:border-white/5 p-3">
                <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1.5">Schedules</div>
                <ul className="text-[11px] muted grid gap-0.5">
                  <li>Schedule created / updated / deleted</li>
                </ul>
              </div>
              {/* Notifications */}
              <div className="rounded-lg border border-black/5 dark:border-white/5 p-3">
                <div className="text-xs font-semibold text-pink-600 dark:text-pink-400 mb-1.5">Notifications</div>
                <ul className="text-[11px] muted grid gap-0.5">
                  <li>Channel added / updated / deleted</li>
                  <li>Test notification sent</li>
                </ul>
              </div>
              {/* Policies */}
              <div className="rounded-lg border border-black/5 dark:border-white/5 p-3">
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1.5">Policies</div>
                <ul className="text-[11px] muted grid gap-0.5">
                  <li>Policy created / updated / deleted</li>
                  <li>Policy evaluated against scan</li>
                </ul>
              </div>
              {/* Org */}
              <div className="rounded-lg border border-black/5 dark:border-white/5 p-3">
                <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1.5">Organization</div>
                <ul className="text-[11px] muted grid gap-0.5">
                  <li>Member invited / removed</li>
                  <li>Member role changed</li>
                  <li>Org settings updated</li>
                </ul>
              </div>
              {/* API Keys */}
              <div className="rounded-lg border border-black/5 dark:border-white/5 p-3">
                <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1.5">API Keys</div>
                <ul className="text-[11px] muted grid gap-0.5">
                  <li>Key created / revoked</li>
                </ul>
              </div>
              {/* Billing + Scanner + Reports */}
              <div className="rounded-lg border border-black/5 dark:border-white/5 p-3">
                <div className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-1.5">Billing & Settings</div>
                <ul className="text-[11px] muted grid gap-0.5">
                  <li>Plan upgraded / cancelled</li>
                  <li>Scanner settings changed</li>
                  <li>Compliance report generated</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          placeholder="Search logs... (e.g. 'scan created nginx')"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-zinc-500"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={severity}
          onChange={(e) => {
            setSeverity(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
        >
          {SEVERITIES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Log entries */}
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        {/* Live indicator bar */}
        {live && (
          <div className="bg-green-500/10 p-2 text-center text-xs text-green-600">
            Live -- new events will appear here
          </div>
        )}

        {loading && !items.length ? (
          <div className="space-y-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-b border-zinc-800/50 p-3"
              >
                <div className="h-3.5 w-28 animate-pulse rounded bg-zinc-800" />
                <div className="h-3.5 w-36 animate-pulse rounded bg-zinc-800" />
                <div className="h-4 w-20 animate-pulse rounded bg-zinc-800" />
                <div className="h-3.5 flex-1 animate-pulse rounded bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-sm text-zinc-500">
            No audit events found
          </div>
        ) : (
          items.map((entry) => (
            <div
              key={entry.id}
              className={`cursor-pointer border-b border-zinc-800/50 p-3 transition-colors hover:bg-white/[.02] ${
                newIds.has(entry.id)
                  ? "animate-[auditFlash_2s_ease-out]"
                  : ""
              }`}
              onClick={() => toggleExpand(entry.id)}
            >
              <div className="flex items-center gap-3">
                <span className="w-28 shrink-0 font-mono text-[11px] text-zinc-500">
                  {formatRelativeTime(entry.created_at)}
                </span>
                <span className="w-40 truncate text-xs text-zinc-400">
                  {entry.user_email || "System"}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${categoryColor(
                    entry.category,
                  )}`}
                >
                  {entry.action}
                </span>
                <span className="flex-1 truncate text-xs text-zinc-500">
                  {entry.detail}
                </span>
                <span className="font-mono text-[10px] text-zinc-600">
                  {entry.ip || ""}
                </span>
              </div>
              {expanded === entry.id && entry.metadata && (
                <pre className="mt-2 overflow-x-auto rounded bg-black/30 p-2 text-xs text-zinc-400">
                  {JSON.stringify(entry.metadata, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination (only when not in live mode) */}
      {!live && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-zinc-700 bg-transparent px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:border-zinc-500 disabled:opacity-30"
          >
            Prev
          </button>
          <span className="text-sm text-zinc-400">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-zinc-700 bg-transparent px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:border-zinc-500 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}

      {/* Flash animation keyframes */}
      <style jsx global>{`
        @keyframes auditFlash {
          0% {
            background-color: rgba(34, 197, 94, 0.15);
          }
          100% {
            background-color: transparent;
          }
        }
      `}</style>
    </div>
  );
}
