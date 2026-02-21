"use client";
import React from "react";

function normalizeFindingId(idRaw: string): string {
    let id = (idRaw || "").trim();
    if (!id) return "";
    try {
        id = decodeURIComponent(id);
    } catch {
        // Keep original value if it's not valid URI-encoded text.
    }
    return id.trim().toUpperCase();
}

function findingExternalUrl(idRaw: string): string | null {
    const id = normalizeFindingId(idRaw);
    if (!id) return null;
    if (/^CVE-\d{4}-\d+$/i.test(id)) {
        return `https://nvd.nist.gov/vuln/detail/${id}`;
    }
    if (/^(RHSA|RHBA|RHEA)-\d{4}:\d+$/i.test(id)) {
        return `https://access.redhat.com/errata/${id}`;
    }
    if (/^GHSA-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(id)) {
        return `https://github.com/advisories/${id}`;
    }
    if (/^(DLA|DSA)-\d{4,5}-\d+$/i.test(id)) {
        return `https://security-tracker.debian.org/tracker/${id}`;
    }
    return null;
}

export default function JobFindings({ jobId }: { jobId: string }) {
    const [items, setItems] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [search, setSearch] = React.useState("");
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(50);
    const [sortKey, setSortKey] = React.useState<"id" | "severity" | "confidence" | "fixed" | "fixedIn" | "cvssBase" | "cvssVector" | "description" | "recommendation" | "evidence" | "source">("severity");
    const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");

    React.useEffect(() => {
        let cancelled = false;
        let retryTimer: ReturnType<typeof setTimeout> | null = null;
        let retryCount = 0;
        const MAX_RETRIES = 18; // poll up to 3 minutes (every 10s)

        async function fetchFindings() {
            const ctrl = new AbortController();
            setLoading(true); setError(null);
            try {
                const res = await fetch(`/api/jobs/${jobId}/findings`, { cache: "no-store", signal: ctrl.signal });
                const j = await res.json();
                const found = Array.isArray(j.items) ? j.items : [];
                if (!cancelled) {
                    setItems(found);
                    setLoading(false);
                    // If we got nothing and haven't exhausted retries, poll again in 10s.
                    // This handles the case where the user visits before the scan completes.
                    if (found.length === 0 && !j.error && retryCount < MAX_RETRIES) {
                        retryCount++;
                        retryTimer = setTimeout(fetchFindings, 10_000);
                    }
                }
            } catch (e: any) {
                if (!cancelled && e?.name !== 'AbortError') {
                    setError(String(e?.message || e));
                    setLoading(false);
                }
            }
        }

        fetchFindings();
        return () => {
            cancelled = true;
            if (retryTimer) clearTimeout(retryTimer);
        };
    }, [jobId]);

    const normalized = React.useMemo(() => items.map((f) => ({
        id: normalizeFindingId(String(f.id || "")),
        severity: (f.severity || f.impact || "").toString(),
        confidence: (f.confidence || "").toString(),
        fixed: typeof f.fixed === "boolean" ? f.fixed : undefined,
        fixedIn: (f.fixed_in || "").toString(),
        cvssBase: (f.cvss && typeof f.cvss.base === 'number') ? f.cvss.base : undefined,
        cvssVector: (f.cvss && f.cvss.vector) || "",
        description: f.title || f.description || "",
        recommendation: (f.recommendation || "").toString(),
        package: f.package || "",
        evidence: Array.isArray(f.evidence) ? f.evidence : [],
        source: (Array.isArray(f.source_ids) && f.source_ids[0]) || f.source || "",
    })), [items]);

    const filtered = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return normalized;
        return normalized.filter((f) =>
            f.id.toLowerCase().includes(q) ||
            f.severity.toLowerCase().includes(q) ||
            f.confidence.toLowerCase().includes(q) ||
            String(f.fixed ?? "").toLowerCase().includes(q) ||
            f.fixedIn.toLowerCase().includes(q) ||
            f.cvssVector.toLowerCase().includes(q) ||
            f.description.toLowerCase().includes(q) ||
            f.recommendation.toLowerCase().includes(q) ||
            (f.package || "").toString().toLowerCase().includes(q) ||
            f.source.toLowerCase().includes(q) ||
            f.evidence.some((e: any) =>
                String(e?.detail || "").toLowerCase().includes(q) ||
                String(e?.path || "").toLowerCase().includes(q) ||
                String(e?.type || "").toLowerCase().includes(q)
            )
        );
    }, [normalized, search]);

    const counts = React.useMemo(() => {
        const out = { total: normalized.length, critical: 0, high: 0, medium: 0, low: 0, other: 0 } as Record<string, number>;
        for (const f of normalized) {
            const s = (f.severity || "").toLowerCase();
            if (s.startsWith("crit")) out.critical++;
            else if (s.startsWith("high")) out.high++;
            else if (s.startsWith("med")) out.medium++;
            else if (s.startsWith("low")) out.low++;
            else out.other++;
        }
        return out;
    }, [normalized]);

    const total = filtered.length;
    const sorted = React.useMemo(() => {
        const rankSeverity = (s: string) => {
            const x = s.toLowerCase();
            if (x.startsWith("crit")) return 4;
            if (x.startsWith("high")) return 3;
            if (x.startsWith("med")) return 2;
            if (x.startsWith("low")) return 1;
            return 0;
        };
        const arr = filtered.slice();
        arr.sort((a: any, b: any) => {
            let av: any; let bv: any;
            switch (sortKey) {
                case "severity": av = rankSeverity(a.severity); bv = rankSeverity(b.severity); break;
                case "cvssBase": av = Number(a.cvssBase || 0); bv = Number(b.cvssBase || 0); break;
                case "evidence": av = (Array.isArray(a.evidence) ? a.evidence.length : 0); bv = (Array.isArray(b.evidence) ? b.evidence.length : 0); break;
                case "id": av = String(a.id || ""); bv = String(b.id || ""); break;
                case "confidence": av = String(a.confidence || ""); bv = String(b.confidence || ""); break;
                case "fixed": av = (a.fixed === undefined ? -1 : (a.fixed ? 1 : 0)); bv = (b.fixed === undefined ? -1 : (b.fixed ? 1 : 0)); break;
                case "fixedIn": av = String(a.fixedIn || ""); bv = String(b.fixedIn || ""); break;
                case "cvssVector": av = String(a.cvssVector || ""); bv = String(b.cvssVector || ""); break;
                case "description": av = String(a.description || ""); bv = String(b.description || ""); break;
                case "recommendation": av = String(a.recommendation || ""); bv = String(b.recommendation || ""); break;
                case "source": av = String(a.source || ""); bv = String(b.source || ""); break;
            }
            let cmp = 0;
            if (typeof av === "number" && typeof bv === "number") cmp = av - bv; else cmp = String(av).localeCompare(String(bv));
            return sortDir === "asc" ? cmp : -cmp;
        });
        return arr;
    }, [filtered, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = Math.min(total, startIdx + pageSize);
    const pageItems = sorted.slice(startIdx, endIdx);

    return (
        <div className="rounded-md border border-black/10 dark:border-white/10 overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 px-3 py-3 border-b border-black/10 dark:border-white/10 bg-gradient-to-r from-black/[.03] to-transparent dark:from-white/[.03]">
                <div className="text-xs font-semibold px-2 py-1 rounded bg-black/80 text-white">Total {counts.total}</div>
                <div className="text-xs font-semibold px-2 py-1 rounded bg-red-700 text-white">Critical {counts.critical}</div>
                <div className="text-xs font-semibold px-2 py-1 rounded bg-red-500 text-white">High {counts.high}</div>
                <div className="text-xs font-semibold px-2 py-1 rounded bg-yellow-400 text-black">Medium {counts.medium}</div>
                <div className="text-xs font-semibold px-2 py-1 rounded bg-green-500 text-white">Low {counts.low}</div>
                {counts.other > 0 && <div className="text-xs font-semibold px-2 py-1 rounded bg-gray-400 text-white">Other {counts.other}</div>}
            </div>
            {loading && <div className="text-xs opacity-70 p-2">Loading…</div>}
            {(!loading && error) && <div className="text-xs text-red-600 p-2">{error}</div>}
            {(!loading && !error) && (
                <div className="flex flex-wrap items-center gap-2 px-2 py-2 text-xs bg-black/[.04] dark:bg-white/[.04]">
                    <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search ID, description, severity, evidence…"
                        className="px-2 py-1 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-black min-w-[260px]"
                    />
                    <div className="ml-auto flex items-center gap-2">
                        <span className="opacity-70">Rows per page</span>
                        <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="px-1 py-0.5 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-black">
                            {[25, 50, 100, 200, 500].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <span className="opacity-70">{startIdx + 1}–{endIdx} of {total}</span>
                        <button disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-2 py-0.5 rounded border border-black/10 disabled:opacity-50">Prev</button>
                        <button disabled={currentPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-2 py-0.5 rounded border border-black/10 disabled:opacity-50">Next</button>
                    </div>
                </div>)}
            <div className="overflow-auto">
                {(!loading && !error && total === 0) ? (
                    <div className="text-xs opacity-70 p-2">No findings.</div>
                ) : (
                    <table className="w-full min-w-[1500px] text-xs">
                        <thead className="bg-black/[.04] dark:bg-white/[.04]">
                            <tr>
                                {([
                                    ["ID", "id"],
                                    ["Severity", "severity"],
                                    ["Confidence", "confidence"],
                                    ["Fixed", "fixed"],
                                    ["Fixed In", "fixedIn"],
                                    ["CVSS", "cvssBase"],
                                    ["Vector", "cvssVector"],
                                    ["Description", "description"],
                                    ["Recommendation", "recommendation"],
                                    ["Evidence", "evidence"],
                                    ["Source", "source"],
                                ] as [string, typeof sortKey][]).map(([label, key]) => (
                                    <th key={key} className="p-2 text-left select-none">
                                        <button
                                            className={`inline-flex items-center gap-1 hover:underline ${sortKey === key ? "font-semibold" : ""}`}
                                            onClick={() => {
                                                setPage(1);
                                                if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
                                                else { setSortKey(key); setSortDir(key === "severity" || key === "cvssBase" ? "desc" : "asc"); }
                                            }}
                                        >
                                            <span>{label}</span>
                                            <span className="text-[10px] opacity-70">{sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : ""}</span>
                                        </button>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pageItems.map((f, idx) => {
                                const key = `${f.id || 'unknown'}-${startIdx + idx}-${f.source || ''}`;
                                const ev = Array.isArray(f.evidence) ? f.evidence : [];
                                const evFirst = ev[0] || {} as any;
                                const sevColor = String(f.severity || '').toLowerCase().startsWith('crit') ? 'bg-red-700 text-white' :
                                    String(f.severity || '').toLowerCase().startsWith('high') ? 'bg-red-500 text-white' :
                                        String(f.severity || '').toLowerCase().startsWith('med') ? 'bg-yellow-400 text-black' :
                                            String(f.severity || '').toLowerCase().startsWith('low') ? 'bg-green-500 text-white' : 'bg-gray-400 text-white';
                                return (
                                    <tr key={key} className="border-t border-black/5 dark:border-white/5 align-top">
                                        <td className="p-2 font-mono whitespace-nowrap">
                                            {f.id ? (
                                                (() => {
                                                    const href = findingExternalUrl(String(f.id));
                                                    return href
                                                        ? <a className="underline" href={href} target="_blank" rel="noreferrer">{f.id}</a>
                                                        : <span>{f.id}</span>;
                                                })()
                                            ) : ""}
                                        </td>
                                        <td className="p-2 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded text-[11px] ${sevColor}`}>{(f.severity || "").toString()}</span>
                                        </td>
                                        <td className="p-2 whitespace-nowrap">{(f.confidence || '').toString()}</td>
                                        <td className="p-2 whitespace-nowrap">
                                            {f.fixed === true ? <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-600 text-white">Yes</span> :
                                                f.fixed === false ? <span className="px-2 py-0.5 rounded text-[11px] bg-orange-500 text-white">No</span> :
                                                    <span className="px-2 py-0.5 rounded text-[11px] bg-gray-400 text-white">Unknown</span>}
                                        </td>
                                        <td className="p-2 whitespace-nowrap font-mono">{(f as any).fixedIn || ''}</td>
                                        <td className="p-2 whitespace-nowrap">{(f as any).cvssBase ?? ''}</td>
                                        <td className="p-2 whitespace-nowrap" title={(f as any).cvssVector || ''}><span className="inline-block max-w-[220px] truncate">{(f as any).cvssVector || ''}</span></td>
                                        <td className="p-2" title={f.description || ''}><span className="inline-block max-w-[520px] truncate align-top">{f.description || ''}</span></td>
                                        <td className="p-2" title={(f as any).recommendation || ''}><span className="inline-block max-w-[420px] truncate align-top">{(f as any).recommendation || ''}</span></td>
                                        <td className="p-2" title={`${evFirst?.type || ''} ${evFirst?.detail || ''} ${evFirst?.path || ''}`}>
                                            <div className="text-xs opacity-80"><span className="inline-block max-w-[260px] truncate">{evFirst?.type || ''} {evFirst?.detail || ''}</span></div>
                                            <div className="text-[10px] opacity-60"><span className="inline-block max-w-[260px] truncate">{evFirst?.path || ''}</span></div>
                                            {ev.length > 1 && <div className="text-[10px] opacity-60">+{ev.length - 1} more</div>}
                                        </td>
                                        <td className="p-2 whitespace-nowrap">{f.source || ''}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
