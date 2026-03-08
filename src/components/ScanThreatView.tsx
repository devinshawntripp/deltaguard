"use client";
import React from "react";
import Link from "next/link";

type Props = {
    scanId: string;
    jobStatus: string;
    summaryJson?: {
        summary?: { critical?: number; high?: number; medium?: number; low?: number; total_findings?: number };
    } | null;
};

type FindingRow = {
    id?: string;
    severity?: string;
    package?: { name?: string } | null;
    epss_score?: number | null;
    fixed?: boolean | null;
    fixed_in?: string | null;
};

function severityBadge(s: string): string {
    const u = s.toUpperCase();
    if (u === "CRITICAL") return "bg-red-700 text-white";
    if (u === "HIGH") return "bg-orange-600 text-white";
    if (u === "MEDIUM") return "bg-yellow-500 text-black";
    if (u === "LOW") return "bg-sky-700 text-white";
    return "bg-black/20 dark:text-white";
}

function SeverityBar({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
    const pct = max > 0 ? Math.round((count / max) * 100) : 0;
    return (
        <div className="grid gap-1">
            <div className="flex justify-between text-xs">
                <span className="font-medium">{label}</span>
                <span className="tabular-nums muted">{count}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function DonutGauge({ fixable, total }: { fixable: number; total: number }) {
    const pct = total > 0 ? fixable / total : 0;
    const r = 40;
    const circ = 2 * Math.PI * r;
    const dash = pct * circ;
    return (
        <div className="flex flex-col items-center gap-3">
            <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="12" className="text-black/10 dark:text-white/10" />
                <circle
                    cx="50" cy="50" r={r} fill="none"
                    stroke="#22c55e" strokeWidth="12"
                    strokeDasharray={`${dash} ${circ}`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                />
                <text x="50" y="54" textAnchor="middle" fontSize="16" fontWeight="bold" fill="currentColor" className="text-foreground">
                    {total > 0 ? `${Math.round(pct * 100)}%` : "—"}
                </text>
            </svg>
            <p className="text-xs text-center muted">
                {fixable} of {total} findings have fixes available
            </p>
        </div>
    );
}

function exportCsv(findings: FindingRow[], scanId: string) {
    const header = ["CVE ID", "Severity", "Package", "EPSS Score", "Fixable", "Fixed In"];
    const rows = findings.map((f) => [
        f.id ?? "",
        f.severity ?? "",
        f.package?.name ?? "",
        f.epss_score != null ? `${(Number(f.epss_score) * 100).toFixed(2)}%` : "",
        f.fixed ? "Yes" : f.fixed_in ? "Yes" : "No",
        f.fixed_in ?? "",
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scanrook-findings-${scanId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

export default function ScanThreatView({ scanId, jobStatus, summaryJson }: Props) {
    const [findings, setFindings] = React.useState<FindingRow[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const isDone = jobStatus === "done";

    React.useEffect(() => {
        if (!isDone) return;
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetch(`/api/jobs/${scanId}/findings?page_size=500`, { cache: "no-store" })
            .then((r) => r.json())
            .then((json) => {
                if (cancelled) return;
                if (json.error) throw new Error(json.error);
                setFindings(Array.isArray(json.items) ? json.items : []);
                setLoading(false);
            })
            .catch((e: unknown) => {
                if (cancelled) return;
                setError(e instanceof Error ? e.message : String(e));
                setLoading(false);
            });
        return () => { cancelled = true; };
    }, [scanId, isDone]);

    if (!isDone) {
        return (
            <div className="surface-card p-6 text-sm muted text-center">
                Threat analysis available after scan completes.
            </div>
        );
    }

    // Compute severity counts from fetched findings (summaryJson may have 0s)
    const critical = findings.filter((f) => f.severity?.toUpperCase() === "CRITICAL").length;
    const high = findings.filter((f) => f.severity?.toUpperCase() === "HIGH").length;
    const medium = findings.filter((f) => f.severity?.toUpperCase() === "MEDIUM").length;
    const low = findings.filter((f) => f.severity?.toUpperCase() === "LOW").length;
    const maxCount = Math.max(critical, high, medium, low, 1);

    const fixable = findings.filter((f) => f.fixed === true || Boolean(f.fixed_in)).length;
    const total = findings.length;

    const likelyExploited = findings.filter((f) => (f.epss_score ?? 0) > 0.1);

    const pkgCounts: Record<string, number> = {};
    for (const f of findings) {
        const name = f.package?.name ?? "(unknown)";
        pkgCounts[name] = (pkgCounts[name] ?? 0) + 1;
    }
    const topPackages = Object.entries(pkgCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    const maxPkgCount = topPackages[0]?.[1] ?? 1;

    return (
        <div className="grid gap-5">
            {/* Top row: two side-by-side cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Severity Breakdown */}
                <div className="surface-card p-5 grid gap-3">
                    <h3 className="text-sm font-semibold">Severity Breakdown</h3>
                    <SeverityBar label="Critical" count={critical} max={maxCount} color="bg-red-600" />
                    <SeverityBar label="High" count={high} max={maxCount} color="bg-orange-500" />
                    <SeverityBar label="Medium" count={medium} max={maxCount} color="bg-yellow-400" />
                    <SeverityBar label="Low" count={low} max={maxCount} color="bg-sky-500" />
                </div>

                {/* Fixability */}
                <div className="surface-card p-5 flex flex-col items-center justify-center gap-3">
                    <h3 className="text-sm font-semibold self-start">Fixability</h3>
                    {loading ? (
                        <p className="text-xs muted">Loading...</p>
                    ) : error ? (
                        <p className="text-xs text-red-500">{error}</p>
                    ) : (
                        <DonutGauge fixable={fixable} total={total} />
                    )}
                </div>
            </div>

            {/* Likely Exploited */}
            <div className="surface-card p-5 grid gap-3">
                <h3 className="text-sm font-semibold">Likely Exploited <span className="text-xs font-normal muted">(EPSS &gt; 10%)</span></h3>
                {loading ? (
                    <p className="text-xs muted">Loading...</p>
                ) : likelyExploited.length === 0 ? (
                    <p className="text-xs muted">No findings with high exploit probability (EPSS &gt; 10%)</p>
                ) : (
                    <div className="overflow-x-auto rounded-md border border-black/10 dark:border-white/10">
                        <table className="w-full min-w-[480px] text-sm">
                            <thead className="bg-black/[.03] dark:bg-white/[.03]">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium muted">CVE ID</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium muted">Package</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium muted">EPSS Score</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium muted">Severity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {likelyExploited.map((f, i) => {
                                    const id = String(f.id ?? "").trim().toUpperCase();
                                    const sev = String(f.severity ?? "").toUpperCase();
                                    const epss = f.epss_score != null ? `${(Number(f.epss_score) * 100).toFixed(2)}%` : "-";
                                    const nvdUrl = /^CVE-\d{4}-\d+$/i.test(id) ? `https://nvd.nist.gov/vuln/detail/${id}` : null;
                                    return (
                                        <tr key={`${id}-${i}`} className="border-t border-black/5 dark:border-white/5">
                                            <td className="px-3 py-2 font-mono text-xs">
                                                {nvdUrl ? (
                                                    <a href={nvdUrl} target="_blank" rel="noreferrer" className="text-blue-700 dark:text-blue-400 underline underline-offset-2">
                                                        {id || "-"}
                                                    </a>
                                                ) : (id || "-")}
                                            </td>
                                            <td className="px-3 py-2 text-xs">{f.package?.name ?? "-"}</td>
                                            <td className="px-3 py-2 text-xs tabular-nums font-medium text-orange-600 dark:text-orange-400">{epss}</td>
                                            <td className="px-3 py-2">
                                                {sev ? (
                                                    <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${severityBadge(sev)}`}>{sev}</span>
                                                ) : "-"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Most Affected Packages */}
            <div className="surface-card p-5 grid gap-3">
                <h3 className="text-sm font-semibold">Most Affected Packages</h3>
                {loading ? (
                    <p className="text-xs muted">Loading...</p>
                ) : topPackages.length === 0 ? (
                    <p className="text-xs muted">No package data available.</p>
                ) : (
                    <div className="grid gap-2">
                        {topPackages.map(([name, count]) => (
                            <div key={name} className="grid gap-1">
                                <div className="flex justify-between text-xs">
                                    <span className="font-mono truncate max-w-[70%]">{name}</span>
                                    <span className="tabular-nums muted">{count}</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-violet-500"
                                        style={{ width: `${Math.round((count / maxPkgCount) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom actions */}
            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={() => exportCsv(findings, scanId)}
                    disabled={loading || findings.length === 0}
                    className="text-sm px-4 py-1.5 rounded-md bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 font-medium transition-colors disabled:opacity-40"
                >
                    Export CSV
                </button>
                <Link href="/dashboard" className="text-sm px-4 py-1.5 rounded-md bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 font-medium transition-colors">
                    Re-scan
                </Link>
            </div>
        </div>
    );
}
