"use client";

import React from "react";

type FindingApi = {
    id?: string;
    severity?: string;
    confidence_tier?: string;
    evidence_source?: string;
    accuracy_note?: string;
    fixed?: boolean;
    fixed_in?: string;
    recommendation?: string;
    cvss?: { base?: number; vector?: string } | null;
    description?: string;
    package?: { name?: string; ecosystem?: string; version?: string } | null;
    source_ids?: string[];
    references?: Array<{ type?: string; url?: string }>;
    epss_score?: number | null;
    epss_percentile?: number | null;
    in_kev?: boolean | null;
};

type FindingsResponse = {
    items: FindingApi[];
    summary?: Record<string, number>;
    page?: number;
    page_size?: number;
    total?: number;
    scan_status?: string | null;
    inventory_status?: string | null;
    inventory_reason?: string | null;
    error?: string;
};

type TierFilter = "confirmed" | "heuristic" | "all";

type SeverityFilter = "ALL" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

type SortKey = "severity" | "id" | "tier" | "fixed" | "package" | "cvss" | "epss";

function normalizeFindingId(idRaw: string): string {
    let id = (idRaw || "").trim();
    if (!id) return "";
    try {
        id = decodeURIComponent(id);
    } catch {
        // noop
    }
    return id.trim().toUpperCase();
}

function findingExternalUrl(idRaw: string): string | null {
    const id = normalizeFindingId(idRaw);
    if (!id) return null;
    if (/^CVE-\d{4}-\d+$/i.test(id)) return `https://nvd.nist.gov/vuln/detail/${id}`;
    if (/^(RHSA|RHBA|RHEA)-\d{4}:\d+$/i.test(id)) return `https://access.redhat.com/errata/${id}`;
    if (/^GHSA-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(id)) return `https://github.com/advisories/${id}`;
    if (/^(DLA|DSA)-\d{4,5}-\d+$/i.test(id)) return `https://security-tracker.debian.org/tracker/${id}`;
    return null;
}

function severityBadge(severity: string): string {
    const s = severity.toUpperCase();
    if (s === "CRITICAL") return "bg-red-700 text-white";
    if (s === "HIGH") return "bg-orange-600 text-white";
    if (s === "MEDIUM") return "bg-yellow-500 text-black";
    if (s === "LOW") return "bg-sky-700 text-white";
    return "bg-black/20 text-black dark:text-white";
}

function parseSummary(summary: Record<string, number> | undefined | null) {
    return {
        total: Number(summary?.total_findings || 0),
        confirmed: Number(summary?.confirmed_total_findings || 0),
        heuristic: Number(summary?.heuristic_total_findings || 0),
        critical: Number(summary?.critical || 0),
        high: Number(summary?.high || 0),
        medium: Number(summary?.medium || 0),
        low: Number(summary?.low || 0),
        confirmedCritical: Number(summary?.confirmed_critical || 0),
        confirmedHigh: Number(summary?.confirmed_high || 0),
        confirmedMedium: Number(summary?.confirmed_medium || 0),
        confirmedLow: Number(summary?.confirmed_low || 0),
        heuristicCritical: Number(summary?.heuristic_critical || 0),
        heuristicHigh: Number(summary?.heuristic_high || 0),
        heuristicMedium: Number(summary?.heuristic_medium || 0),
        heuristicLow: Number(summary?.heuristic_low || 0),
    };
}

export default function JobFindings({ jobId }: { jobId: string }) {
    const [items, setItems] = React.useState<FindingApi[]>([]);
    const [summary, setSummary] = React.useState<Record<string, number> | null>(null);
    const [scanStatus, setScanStatus] = React.useState<string | null>(null);
    const [inventoryStatus, setInventoryStatus] = React.useState<string | null>(null);
    const [inventoryReason, setInventoryReason] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [search, setSearch] = React.useState("");
    const [tier, setTier] = React.useState<TierFilter>("confirmed");
    const [severity, setSeverity] = React.useState<SeverityFilter>("ALL");
    const [fixedOnly, setFixedOnly] = React.useState<"all" | "fixed" | "unfixed">("all");
    const [sortKey, setSortKey] = React.useState<SortKey>("severity");
    const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(50);
    const [total, setTotal] = React.useState(0);

    React.useEffect(() => {
        setPage(1);
    }, [search, tier, severity, fixedOnly, sortKey, sortDir, pageSize]);

    React.useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                params.set("page", String(page));
                params.set("page_size", String(pageSize));
                params.set("tier", tier);
                if (severity !== "ALL") params.set("severity", severity);
                if (fixedOnly === "fixed") params.set("fixed", "true");
                if (fixedOnly === "unfixed") params.set("fixed", "false");
                if (search.trim()) params.set("search", search.trim());
                params.set("sort", sortKey);
                params.set("order", sortDir);

                const res = await fetch(`/api/jobs/${jobId}/findings?${params.toString()}`, { cache: "no-store" });
                const text = await res.text();
                const json = text.trim() ? (JSON.parse(text) as FindingsResponse) : { items: [] };

                if (!res.ok) {
                    throw new Error(json.error || `Findings API failed (HTTP ${res.status})`);
                }
                if (json.error) throw new Error(json.error);

                if (!cancelled) {
                    setItems(Array.isArray(json.items) ? json.items : []);
                    setSummary(json.summary || null);
                    setTotal(Number(json.total || 0));
                    setScanStatus(typeof json.scan_status === "string" ? json.scan_status : null);
                    setInventoryStatus(typeof json.inventory_status === "string" ? json.inventory_status : null);
                    setInventoryReason(typeof json.inventory_reason === "string" ? json.inventory_reason : null);
                    setLoading(false);
                }
            } catch (e: unknown) {
                if (!cancelled) {
                    setError(e instanceof Error ? e.message : String(e));
                    setLoading(false);
                }
            }
        }, 220);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [jobId, page, pageSize, tier, severity, fixedOnly, search, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const showPartialBanner = scanStatus === "partial_failed" || scanStatus === "unsupported";
    const s = parseSummary(summary);

    return (
        <div className="rounded-md border border-black/10 dark:border-white/10 overflow-hidden">
            {showPartialBanner && (
                <div className="px-3 py-2 text-xs bg-amber-100 text-amber-900 border-b border-amber-300">
                    <span className="font-semibold">Partial scan:</span>{" "}
                    Installed package inventory was not fully proven.
                    {inventoryStatus ? ` inventory_status=${inventoryStatus}.` : ""}
                    {inventoryReason ? ` reason=${inventoryReason}.` : ""}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-2 px-3 py-3 border-b border-black/10 dark:border-white/10 bg-gradient-to-r from-black/[.03] to-transparent dark:from-white/[.03]">
                <div className="text-xs font-semibold px-2 py-1 rounded bg-black/80 text-white">Total {s.total}</div>
                <div className="text-xs font-semibold px-2 py-1 rounded bg-sky-700 text-white">Confirmed {s.confirmed}</div>
                <div className="text-xs font-semibold px-2 py-1 rounded bg-orange-600 text-white">Heuristic {s.heuristic}</div>
                <div className="text-xs font-semibold px-2 py-1 rounded bg-red-700 text-white">Critical {s.critical}</div>
                <div className="text-xs font-semibold px-2 py-1 rounded bg-orange-600 text-white">High {s.high}</div>
                <div className="text-xs font-semibold px-2 py-1 rounded bg-yellow-500 text-black">Medium {s.medium}</div>
                <div className="text-xs font-semibold px-2 py-1 rounded bg-sky-700 text-white">Low {s.low}</div>
                <div className="text-xs font-semibold px-2 py-1 rounded bg-slate-600 text-white">C C/H/M/L {s.confirmedCritical}/{s.confirmedHigh}/{s.confirmedMedium}/{s.confirmedLow}</div>
                <div className="text-xs font-semibold px-2 py-1 rounded bg-stone-600 text-white">H C/H/M/L {s.heuristicCritical}/{s.heuristicHigh}/{s.heuristicMedium}/{s.heuristicLow}</div>
            </div>

            <div className="px-3 py-3 border-b border-black/10 dark:border-white/10 grid gap-3">
                <div className="grid md:grid-cols-6 gap-2 text-sm">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search CVE/package/description"
                        className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-2 md:col-span-2"
                    />

                    <select
                        value={tier}
                        onChange={(e) => setTier(e.target.value as TierFilter)}
                        className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-2"
                    >
                        <option value="confirmed">Confirmed</option>
                        <option value="heuristic">Heuristic</option>
                        <option value="all">All tiers</option>
                    </select>

                    <select
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value as SeverityFilter)}
                        className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-2"
                    >
                        <option value="ALL">All severities</option>
                        <option value="CRITICAL">Critical</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                    </select>

                    <select
                        value={fixedOnly}
                        onChange={(e) => setFixedOnly(e.target.value as "all" | "fixed" | "unfixed")}
                        className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-2"
                    >
                        <option value="all">All fixed states</option>
                        <option value="fixed">Fixed only</option>
                        <option value="unfixed">Unfixed only</option>
                    </select>

                    <div className="grid grid-cols-2 gap-2">
                        <select
                            value={sortKey}
                            onChange={(e) => setSortKey(e.target.value as SortKey)}
                            className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-2"
                        >
                            <option value="severity">Sort: Severity</option>
                            <option value="id">Sort: ID</option>
                            <option value="tier">Sort: Tier</option>
                            <option value="fixed">Sort: Fixed</option>
                            <option value="package">Sort: Package</option>
                            <option value="cvss">Sort: CVSS</option>
                            <option value="epss">Sort: EPSS</option>
                        </select>
                        <select
                            value={sortDir}
                            onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
                            className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-2"
                        >
                            <option value="desc">Desc</option>
                            <option value="asc">Asc</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <span className="opacity-70">Page size:</span>
                    <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1"
                    >
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={200}>200</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="px-3 py-2 text-sm bg-red-100 text-red-900 border-b border-red-300">
                    {error}
                </div>
            )}

            <div className="overflow-auto">
                <table className="w-full min-w-[1200px] text-sm">
                    <thead className="bg-black/[.04] dark:bg-white/[.04] text-left sticky top-0">
                        <tr>
                            <th className="p-3">ID</th>
                            <th className="p-3">Severity</th>
                            <th className="p-3">Tier</th>
                            <th className="p-3">Evidence</th>
                            <th className="p-3">Package</th>
                            <th className="p-3">Version</th>
                            <th className="p-3">Fixed</th>
                            <th className="p-3">Fixed In</th>
                            <th className="p-3">CVSS</th>
                            <th className="p-3">EPSS</th>
                            <th className="p-3">KEV</th>
                            <th className="p-3">Description</th>
                            <th className="p-3">Recommendation</th>
                            <th className="p-3">Source</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td className="p-3 opacity-70" colSpan={14}>Loading findings...</td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td className="p-3 opacity-70" colSpan={14}>No findings for current filters.</td>
                            </tr>
                        ) : items.map((f, idx) => {
                            const id = normalizeFindingId(String(f.id || ""));
                            const ext = findingExternalUrl(id);
                            const tierLabel = f.confidence_tier === "heuristic_unverified" ? "Heuristic" : "Confirmed";
                            const pkg = f.package || null;
                            const source = (Array.isArray(f.source_ids) && f.source_ids[0]) ? String(f.source_ids[0]) : "";

                            return (
                                <tr key={`${id}-${idx}`} className="border-t border-black/5 dark:border-white/5 align-top">
                                    <td className="p-3 font-mono text-xs whitespace-nowrap">
                                        {ext ? (
                                            <a href={ext} target="_blank" rel="noreferrer" className="text-blue-700 dark:text-blue-400 underline underline-offset-2">
                                                {id || "-"}
                                            </a>
                                        ) : (id || "-")}
                                    </td>
                                    <td className="p-3">
                                        <span className={`text-xs px-2 py-1 rounded font-semibold ${severityBadge(String(f.severity || ""))}`}>
                                            {String(f.severity || "UNKNOWN")}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <span className={`text-xs px-2 py-1 rounded font-semibold ${tierLabel === "Heuristic" ? "bg-orange-600 text-white" : "bg-sky-700 text-white"}`}>
                                            {tierLabel}
                                        </span>
                                        {f.accuracy_note && <div className="text-xs opacity-70 mt-1 max-w-[220px]">{f.accuracy_note}</div>}
                                    </td>
                                    <td className="p-3 text-xs whitespace-nowrap">{String(f.evidence_source || "")}</td>
                                    <td className="p-3 text-xs">{pkg?.name || "-"}</td>
                                    <td className="p-3 text-xs">{pkg?.version || "-"}</td>
                                    <td className="p-3 text-xs">{typeof f.fixed === "boolean" ? (f.fixed ? "Yes" : "No") : "-"}</td>
                                    <td className="p-3 text-xs">{f.fixed_in || "-"}</td>
                                    <td className="p-3 text-xs">
                                        {f.cvss?.base != null ? Number(f.cvss.base).toFixed(1) : "-"}
                                        {f.cvss?.vector ? <div className="opacity-60 mt-1 max-w-[220px] truncate" title={f.cvss.vector}>{f.cvss.vector}</div> : null}
                                    </td>
                                    <td className="p-3 text-xs whitespace-nowrap">
                                        {f.epss_score != null ? (
                                            <div>
                                                <span className="font-semibold">{(Number(f.epss_score) * 100).toFixed(2)}%</span>
                                                {f.epss_percentile != null && (
                                                    <div className="opacity-60 text-[10px] mt-0.5">
                                                        P{(Number(f.epss_percentile) * 100).toFixed(0)}
                                                    </div>
                                                )}
                                            </div>
                                        ) : "-"}
                                    </td>
                                    <td className="p-3 text-xs">
                                        {f.in_kev === true ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold bg-red-700 text-white text-[10px]">
                                                CISA KEV
                                            </span>
                                        ) : f.in_kev === false ? (
                                            <span className="opacity-40">No</span>
                                        ) : "-"}
                                    </td>
                                    <td className="p-3 text-xs max-w-[340px]">
                                        <div className="line-clamp-3" title={f.description || ""}>{f.description || "-"}</div>
                                    </td>
                                    <td className="p-3 text-xs max-w-[340px]">
                                        <div className="line-clamp-3" title={f.recommendation || ""}>{f.recommendation || "-"}</div>
                                    </td>
                                    <td className="p-3 text-xs">
                                        {source || "-"}
                                        {Array.isArray(f.references) && f.references.length > 0 && (
                                            <div className="mt-1 grid gap-1">
                                                {f.references.slice(0, 2).map((r, i) => (
                                                    <a
                                                        key={`${id}-ref-${i}`}
                                                        href={String(r.url || "#")}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-blue-700 dark:text-blue-400 underline underline-offset-2 truncate max-w-[280px]"
                                                        title={String(r.url || "")}
                                                    >
                                                        {String(r.type || "ref")}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
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
