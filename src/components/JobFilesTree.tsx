"use client";

import React from "react";

type FileEntry = {
  path: string;
  entry_type: string;
  size_bytes: number | null;
  mode: string | null;
  mtime: string | null;
  sha256: string | null;
  parent_path: string | null;
};

type FilesResponse = {
  entries: FileEntry[];
  breadcrumbs: string[];
  page: number;
  page_size: number;
  total: number;
  parent: string;
  search: string;
  error?: string;
};

export default function JobFilesTree({ jobId }: { jobId: string }) {
  const [entries, setEntries] = React.useState<FileEntry[]>([]);
  const [breadcrumbs, setBreadcrumbs] = React.useState<string[]>([""]);
  const [parent, setParent] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(100);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setPage(1);
  }, [parent, search, pageSize]);

  React.useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("page_size", String(pageSize));
        if (parent) params.set("parent", parent);
        if (search.trim()) params.set("search", search.trim());

        const res = await fetch(`/api/jobs/${jobId}/files?${params.toString()}`, { cache: "no-store" });
        const json = await res.json() as FilesResponse;
        if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);

        if (!cancelled) {
          setEntries(Array.isArray(json.entries) ? json.entries : []);
          setBreadcrumbs(Array.isArray(json.breadcrumbs) ? json.breadcrumbs : [""]);
          setTotal(Number(json.total || 0));
          setLoading(false);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setLoading(false);
        }
      }
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [jobId, parent, search, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  function formatBytes(n: number | null): string {
    if (n == null || n < 0) return "-";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    let value = n;
    while (value >= 1024 && i < units.length - 1) {
      value /= 1024;
      i++;
    }
    return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }

  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 overflow-hidden">
      <div className="px-3 py-3 border-b border-black/10 dark:border-white/10 grid gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search file path"
            className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-2 min-w-[280px]"
          />
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-2"
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
            <option value={500}>500</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {breadcrumbs.map((crumb, idx) => {
            const label = crumb || "/";
            return (
              <button
                key={`${crumb}-${idx}`}
                onClick={() => setParent(crumb)}
                className={`px-2 py-1 rounded border ${crumb === parent ? "bg-black text-white border-black" : "border-black/20 dark:border-white/20"}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {error && <div className="px-3 py-2 text-sm bg-red-100 text-red-900">{error}</div>}

      <div className="overflow-auto">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="bg-black/[.04] dark:bg-white/[.04] text-left">
            <tr>
              <th className="p-3">Path</th>
              <th className="p-3">Type</th>
              <th className="p-3">Size</th>
              <th className="p-3">Mode</th>
              <th className="p-3">Modified</th>
              <th className="p-3">SHA256</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-3 opacity-70" colSpan={6}>Loading file tree...</td></tr>
            ) : entries.length === 0 ? (
              <tr><td className="p-3 opacity-70" colSpan={6}>No file entries for this scope.</td></tr>
            ) : entries.map((entry) => {
              const isDir = entry.entry_type.toLowerCase() === "dir";
              return (
                <tr key={entry.path} className="border-t border-black/5 dark:border-white/5">
                  <td className="p-3 font-mono text-xs">
                    {isDir ? (
                      <button className="underline underline-offset-2" onClick={() => setParent(entry.path)}>{entry.path}</button>
                    ) : entry.path}
                  </td>
                  <td className="p-3">{entry.entry_type}</td>
                  <td className="p-3">{formatBytes(entry.size_bytes)}</td>
                  <td className="p-3 font-mono text-xs">{entry.mode || "-"}</td>
                  <td className="p-3">{entry.mtime ? new Date(entry.mtime).toLocaleString() : "-"}</td>
                  <td className="p-3 font-mono text-xs max-w-[360px] truncate" title={entry.sha256 || ""}>{entry.sha256 || "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-3 py-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-3 text-sm">
        <div className="opacity-75">
          Showing {entries.length === 0 ? 0 : (safePage - 1) * pageSize + 1}-{Math.min(total, safePage * pageSize)} of {total}
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-md border border-black/20 dark:border-white/20 px-3 py-1 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="min-w-[84px] text-center">Page {safePage}/{totalPages}</span>
          <button
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-md border border-black/20 dark:border-white/20 px-3 py-1 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
