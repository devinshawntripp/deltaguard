"use client";

import React from "react";
import { openSse } from "@/lib/ssePool";

type SbomTabViewProps = {
    jobId: string;
    sbomStatus: string;
};

type SbomSummary = {
    total_packages: number;
    ecosystems: Record<string, number>;
};

type DiffSummary = {
    added: number;
    removed: number;
    changed: number;
};

type DiffResponse = {
    summary: DiffSummary;
    full_diff_url: string;
};

type PackageRow = {
    name: string;
    ecosystem: string;
    version: string;
    source_kind: string;
    source_path: string | null;
    confidence_tier: string;
};

const FORMATS = [
    { key: "cyclonedx", label: "CycloneDX", desc: "OWASP standard" },
    { key: "spdx", label: "SPDX", desc: "Linux Foundation standard" },
    { key: "syft", label: "Syft JSON", desc: "Anchore Syft compatible" },
] as const;

const PAGE_SIZE = 50;

export default function SbomTabView({ jobId, sbomStatus: initialStatus }: SbomTabViewProps) {
    const [status, setStatus] = React.useState(initialStatus);
    const [summary, setSummary] = React.useState<SbomSummary | null>(null);
    const [downloading, setDownloading] = React.useState<string | null>(null);

    // Diff state
    const [diff, setDiff] = React.useState<DiffResponse | null>(null);
    const [diffLoading, setDiffLoading] = React.useState(false);
    const [noDiff, setNoDiff] = React.useState(false);

    // Package table state
    const [packages, setPackages] = React.useState<PackageRow[]>([]);
    const [pkgTotal, setPkgTotal] = React.useState(0);
    const [pkgPage, setPkgPage] = React.useState(1);
    const [pkgSearch, setPkgSearch] = React.useState("");
    const [pkgSort, setPkgSort] = React.useState("name");
    const [pkgOrder, setPkgOrder] = React.useState<"asc" | "desc">("asc");
    const [pkgLoading, setPkgLoading] = React.useState(false);

    // Timeout fallback: if status stays "pending" for >2min, assume failure
    const [timedOut, setTimedOut] = React.useState(false);
    React.useEffect(() => {
        if (status !== "pending") return;
        const timer = setTimeout(() => setTimedOut(true), 120_000);
        return () => clearTimeout(timer);
    }, [status]);

    // Poll sbom_status from DB when pending (covers case where SSE event already fired)
    React.useEffect(() => {
        if (status !== "pending") return;
        let cancelled = false;
        const check = async () => {
            try {
                const res = await fetch(`/api/jobs/${jobId}/sbom/summary`);
                if (cancelled) return;
                if (res.ok) { setStatus("ready"); return; }
                if (res.status === 404) { /* still pending */ }
            } catch { /* ignore */ }
        };
        // Check immediately, then every 3s
        check();
        const interval = setInterval(check, 3000);
        return () => { cancelled = true; clearInterval(interval); };
    }, [jobId, status]);

    // Listen for SSE sbom_export_complete event
    React.useEffect(() => {
        if (status === "ready") return;

        let closeRef: (() => void) | null = null;
        const promise = openSse(`/api/jobs/${jobId}/events`, {
            onMessage: (ev: MessageEvent) => {
                try {
                    const data = JSON.parse(typeof ev.data === "string" ? ev.data : "{}");
                    if (data.stage === "sbom_export_complete") {
                        setStatus("ready");
                    }
                    if (data.stage === "sbom_diff_complete") {
                        setDiffLoading(true);
                        fetch(`/api/jobs/${jobId}/sbom/diff`)
                            .then((r) => r.ok ? r.json() : null)
                            .then((d) => { if (d) setDiff(d); })
                            .catch(() => {})
                            .finally(() => setDiffLoading(false));
                    }
                } catch { /* ignore */ }
            },
            onError: () => { /* SSE pool handles reconnect */ },
        });

        promise.then((close) => { closeRef = close; });
        return () => {
            if (closeRef) closeRef();
            else promise.then((close) => close());
        };
    }, [jobId, status]);

    // Fetch summary when ready
    React.useEffect(() => {
        if (status !== "ready") return;
        let cancelled = false;
        fetch(`/api/jobs/${jobId}/sbom/summary`)
            .then((r) => r.json())
            .then((d) => { if (!cancelled) setSummary(d); })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [jobId, status]);

    // Fetch diff when ready
    React.useEffect(() => {
        if (status !== "ready") return;
        let cancelled = false;
        setDiffLoading(true);
        fetch(`/api/jobs/${jobId}/sbom/diff`)
            .then((r) => {
                if (r.status === 404) { if (!cancelled) setNoDiff(true); return null; }
                if (!r.ok) return null;
                return r.json();
            })
            .then((d) => { if (!cancelled && d) setDiff(d); })
            .catch(() => {})
            .finally(() => { if (!cancelled) setDiffLoading(false); });
        return () => { cancelled = true; };
    }, [jobId, status]);

    // Fetch packages (works regardless of SBOM status -- uses scan_packages table)
    React.useEffect(() => {
        let cancelled = false;
        setPkgLoading(true);
        const params = new URLSearchParams({
            page: String(pkgPage),
            page_size: String(PAGE_SIZE),
            sort: pkgSort,
            order: pkgOrder,
        });
        if (pkgSearch) params.set("search", pkgSearch);

        fetch(`/api/jobs/${jobId}/packages?${params}`)
            .then((r) => r.json())
            .then((d) => {
                if (!cancelled) {
                    setPackages(d.items || []);
                    setPkgTotal(d.total || 0);
                }
            })
            .catch(() => {})
            .finally(() => { if (!cancelled) setPkgLoading(false); });
        return () => { cancelled = true; };
    }, [jobId, pkgPage, pkgSearch, pkgSort, pkgOrder]);

    // Debounced search
    const searchTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    function handleSearchChange(value: string) {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setPkgSearch(value);
            setPkgPage(1);
        }, 300);
    }

    const [downloadError, setDownloadError] = React.useState<string | null>(null);

    async function handleDownload(formatKey: string) {
        setDownloading(formatKey);
        setDownloadError(null);
        try {
            const url = `/api/jobs/${jobId}/sbom/download?format=${formatKey}`;
            const res = await fetch(url);
            if (!res.ok) {
                const body = await res.json().catch(() => ({ error: "Download failed" }));
                setDownloadError(body.error || `Download failed (${res.status})`);
                return;
            }
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = `${jobId}.sbom.${formatKey}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(blobUrl);
        } catch {
            setDownloadError("Network error — could not download SBOM.");
        } finally {
            setDownloading(null);
        }
    }

    function toggleSort(col: string) {
        if (pkgSort === col) {
            setPkgOrder((o) => o === "asc" ? "desc" : "asc");
        } else {
            setPkgSort(col);
            setPkgOrder("asc");
        }
        setPkgPage(1);
    }

    const totalPages = Math.max(1, Math.ceil(pkgTotal / PAGE_SIZE));

    // Pending state
    if (status === "pending") {
        return (
            <div className="surface-card p-8 space-y-2">
                <div className="flex items-center gap-3 text-sm muted">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                    </span>
                    Generating SBOMs...
                </div>
                {timedOut && (
                    <div className="px-3 py-2 rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-200">
                        SBOM generation is taking longer than expected and may have failed. Check the Logs tab for details.
                    </div>
                )}
            </div>
        );
    }

    // Failed state
    if (status === "failed") {
        return (
            <div className="surface-card p-8 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-200">
                SBOM generation failed. Check the Logs tab for details.
            </div>
        );
    }

    return (
        <div className="grid gap-5">
            {/* Stats Panel */}
            {summary && (
                <div className="surface-card p-5">
                    <h3 className="text-sm font-semibold mb-3">Package Summary</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="rounded-lg bg-black/5 dark:bg-white/5 p-3">
                            <div className="text-xs muted">Total Packages</div>
                            <div className="text-xl font-bold tabular-nums">{summary.total_packages}</div>
                        </div>
                        {Object.entries(summary.ecosystems)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 3)
                            .map(([eco, count]) => (
                                <div key={eco} className="rounded-lg bg-black/5 dark:bg-white/5 p-3">
                                    <div className="text-xs muted capitalize">{eco}</div>
                                    <div className="text-xl font-bold tabular-nums">{count}</div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Download Buttons */}
            <div className="surface-card p-5">
                <h3 className="text-sm font-semibold mb-3">Export SBOM</h3>
                <div className="flex flex-wrap gap-3">
                    {FORMATS.map((fmt) => (
                        <button
                            key={fmt.key}
                            onClick={() => handleDownload(fmt.key)}
                            disabled={downloading !== null}
                            className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {downloading === fmt.key ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Downloading...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M7 1v9M3.5 6.5L7 10l3.5-3.5M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    {fmt.label}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
                {downloadError && (
                    <div className="mt-3 px-3 py-2 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-200">
                        {downloadError}
                    </div>
                )}
                <p className="text-xs muted mt-2">Download your software bill of materials in industry-standard formats.</p>
            </div>

            {/* SBOM Diff Section */}
            <div className="surface-card p-5">
                <h3 className="text-sm font-semibold mb-3">Changes from Previous Scan</h3>
                {diffLoading ? (
                    <div className="flex items-center gap-2 text-sm muted">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading diff...
                    </div>
                ) : diff ? (
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            +{diff.summary.added} added
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                            &minus;{diff.summary.removed} removed
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                            ~{diff.summary.changed} changed
                        </span>
                        <a
                            href={diff.full_diff_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline ml-auto"
                        >
                            View full diff JSON
                        </a>
                    </div>
                ) : noDiff ? (
                    <p className="text-sm muted">First scan &mdash; no baseline to compare against.</p>
                ) : null}
            </div>

            {/* Package Inventory Table */}
            <div className="surface-card p-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">
                        Package Inventory
                        {pkgTotal > 0 && <span className="ml-2 text-xs font-normal muted">({pkgTotal})</span>}
                    </h3>
                    <input
                        type="text"
                        placeholder="Search packages..."
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="px-3 py-1.5 text-sm rounded-md border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-black/10 dark:border-white/10">
                                {[
                                    { key: "name", label: "Package" },
                                    { key: "version", label: "Version" },
                                    { key: "ecosystem", label: "Ecosystem" },
                                    { key: "source_kind", label: "Source" },
                                    { key: "tier", label: "Confidence" },
                                ].map((col) => (
                                    <th
                                        key={col.key}
                                        onClick={() => toggleSort(col.key)}
                                        className="text-left py-2 px-2 font-medium muted cursor-pointer hover:text-current select-none"
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            {col.label}
                                            {pkgSort === col.key && (
                                                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                                                    {pkgOrder === "asc"
                                                        ? <path d="M5 2l4 6H1z" />
                                                        : <path d="M5 8l4-6H1z" />}
                                                </svg>
                                            )}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pkgLoading && packages.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center muted">Loading...</td>
                                </tr>
                            ) : packages.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center muted">
                                        {pkgSearch ? "No packages match your search." : "No packages found."}
                                    </td>
                                </tr>
                            ) : (
                                packages.map((pkg, i) => (
                                    <tr key={`${pkg.name}-${pkg.version}-${pkg.ecosystem}-${i}`} className="border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                                        <td className="py-1.5 px-2 font-mono text-xs">{pkg.name}</td>
                                        <td className="py-1.5 px-2 font-mono text-xs tabular-nums">{pkg.version}</td>
                                        <td className="py-1.5 px-2">
                                            <span className="inline-flex px-1.5 py-0.5 rounded text-xs bg-black/5 dark:bg-white/10">
                                                {pkg.ecosystem}
                                            </span>
                                        </td>
                                        <td className="py-1.5 px-2 text-xs muted">{pkg.source_kind}</td>
                                        <td className="py-1.5 px-2">
                                            <span className={`text-xs ${pkg.confidence_tier === "confirmed_installed" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                                {pkg.confidence_tier.replace(/_/g, " ")}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/5 dark:border-white/5">
                        <span className="text-xs muted">
                            Page {pkgPage} of {totalPages}
                        </span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setPkgPage((p) => Math.max(1, p - 1))}
                                disabled={pkgPage <= 1}
                                className="px-2 py-1 text-xs rounded border border-black/10 dark:border-white/10 disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/5"
                            >
                                Prev
                            </button>
                            <button
                                onClick={() => setPkgPage((p) => Math.min(totalPages, p + 1))}
                                disabled={pkgPage >= totalPages}
                                className="px-2 py-1 text-xs rounded border border-black/10 dark:border-white/10 disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/5"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
