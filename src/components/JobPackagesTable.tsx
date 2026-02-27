"use client";

import React from "react";

type PackageEntry = {
  name: string;
  ecosystem: string;
  version: string;
  source_kind: string;
  source_path: string | null;
  confidence_tier: string;
  evidence_source: string;
};

type PackagesResponse = {
  items: PackageEntry[];
  page: number;
  page_size: number;
  total: number;
  search: string;
  ecosystem: string;
  sort: string;
  order: "asc" | "desc";
  error?: string;
};

export default function JobPackagesTable({ jobId }: { jobId: string }) {
  const [items, setItems] = React.useState<PackageEntry[]>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(100);
  const [total, setTotal] = React.useState(0);
  const [search, setSearch] = React.useState("");
  const [ecosystem, setEcosystem] = React.useState("");
  const [sort, setSort] = React.useState("name");
  const [order, setOrder] = React.useState<"asc" | "desc">("asc");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setPage(1);
  }, [search, ecosystem, pageSize, sort, order]);

  React.useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("page_size", String(pageSize));
        params.set("sort", sort);
        params.set("order", order);
        if (search.trim()) params.set("search", search.trim());
        if (ecosystem.trim()) params.set("ecosystem", ecosystem.trim());

        const res = await fetch(`/api/jobs/${jobId}/packages?${params.toString()}`, { cache: "no-store" });
        const json = (await res.json()) as PackagesResponse;
        if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);

        if (!cancelled) {
          setItems(Array.isArray(json.items) ? json.items : []);
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
  }, [jobId, page, pageSize, search, ecosystem, sort, order]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 overflow-hidden">
      <div className="px-3 py-3 border-b border-black/10 dark:border-white/10 grid gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, version, path"
            className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-2 min-w-[260px]"
          />

          <input
            value={ecosystem}
            onChange={(e) => setEcosystem(e.target.value)}
            placeholder="Ecosystem filter (e.g. rpm)"
            className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-2 min-w-[220px]"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-2"
          >
            <option value="name">Sort: name</option>
            <option value="ecosystem">Sort: ecosystem</option>
            <option value="version">Sort: version</option>
            <option value="source_kind">Sort: source kind</option>
            <option value="source_path">Sort: source path</option>
            <option value="tier">Sort: confidence tier</option>
            <option value="evidence">Sort: evidence</option>
          </select>

          <select
            value={order}
            onChange={(e) => setOrder(e.target.value === "desc" ? "desc" : "asc")}
            className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-2"
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>

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
      </div>

      {error && <div className="px-3 py-2 text-sm bg-red-100 text-red-900">{error}</div>}

      <div className="overflow-auto">
        <table className="w-full min-w-[1080px] text-sm">
          <thead className="bg-black/[.04] dark:bg-white/[.04] text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Ecosystem</th>
              <th className="p-3">Version</th>
              <th className="p-3">Source</th>
              <th className="p-3">Source Path</th>
              <th className="p-3">Confidence</th>
              <th className="p-3">Evidence</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-3 opacity-70" colSpan={7}>Loading package inventory...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="p-3 opacity-70" colSpan={7}>No package inventory rows for this job.</td></tr>
            ) : items.map((entry) => (
              <tr key={`${entry.name}:${entry.version}:${entry.source_kind}:${entry.source_path || ""}`} className="border-t border-black/5 dark:border-white/5">
                <td className="p-3 font-medium">{entry.name}</td>
                <td className="p-3 font-mono text-xs">{entry.ecosystem}</td>
                <td className="p-3 font-mono text-xs">{entry.version}</td>
                <td className="p-3">{entry.source_kind}</td>
                <td className="p-3 font-mono text-xs max-w-[380px] truncate" title={entry.source_path || ""}>{entry.source_path || "-"}</td>
                <td className="p-3">{entry.confidence_tier}</td>
                <td className="p-3">{entry.evidence_source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-3 py-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-3 text-sm">
        <div className="opacity-75">
          Showing {items.length === 0 ? 0 : (safePage - 1) * pageSize + 1}-{Math.min(total, safePage * pageSize)} of {total}
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
