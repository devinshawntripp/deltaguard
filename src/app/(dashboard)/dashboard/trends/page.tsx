"use client";

import { useEffect, useState } from "react";

type DataPoint = {
    date: string;
    scans: number;
    total_findings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    images_scanned: string[];
};

type TrendSummary = {
    total_scans: number;
    avg_findings_per_scan: number;
    most_scanned_image: string | null;
    trend_direction: "improving" | "worsening" | "stable";
    critical_trend: number;
};

type TrendData = {
    period: string;
    data_points: DataPoint[];
    summary: TrendSummary;
};

const PERIODS = [
    { label: "7 days", value: "7d" },
    { label: "30 days", value: "30d" },
    { label: "90 days", value: "90d" },
] as const;

function TrendArrow({ direction }: { direction: string }) {
    if (direction === "improving") {
        return <span className="text-green-500 font-semibold">&#x2193; Improving</span>;
    }
    if (direction === "worsening") {
        return <span className="text-red-500 font-semibold">&#x2191; Worsening</span>;
    }
    return <span className="text-[var(--dg-muted)] font-semibold">&#x2194; Stable</span>;
}

function SummaryCard({ label, value, sub }: { label: string; value: string | number; sub?: React.ReactNode }) {
    return (
        <div className="rounded-lg border border-[var(--dg-border)] bg-[var(--dg-bg-elevated)] p-4">
            <p className="text-xs font-medium text-[var(--dg-muted)] uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <div className="mt-1 text-sm">{sub}</div>}
        </div>
    );
}

export default function TrendsPage() {
    const [period, setPeriod] = useState("30d");
    const [data, setData] = useState<TrendData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetch(`/api/analytics/trends?period=${period}`, { cache: "no-store" })
            .then(async (res) => {
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body.error || `HTTP ${res.status}`);
                }
                return res.json();
            })
            .then((json) => {
                if (!cancelled) setData(json);
            })
            .catch((e) => {
                if (!cancelled) setError(e instanceof Error ? e.message : String(e));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [period]);

    const dataPoints = data?.data_points || [];
    const maxFindings = Math.max(1, ...dataPoints.map((d) => d.critical + d.high + d.medium + d.low));

    return (
        <div className="grid gap-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Vulnerability Trends</h1>
                    <p className="muted text-sm mt-1">Historical vulnerability counts and severity distribution.</p>
                </div>
                <div className="flex gap-1 rounded-lg border border-[var(--dg-border)] bg-[var(--dg-bg-elevated)] p-1">
                    {PERIODS.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => setPeriod(p.value)}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                period === p.value
                                    ? "bg-[var(--dg-accent)] text-white"
                                    : "hover:bg-[var(--dg-bg-hover)]"
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-400 bg-red-50 dark:bg-red-950/30 p-4 text-red-700 dark:text-red-300 text-sm">
                    {error}
                </div>
            )}

            {loading && (
                <div className="text-center py-12 text-[var(--dg-muted)]">Loading trend data...</div>
            )}

            {!loading && data && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <SummaryCard label="Total Scans" value={data.summary.total_scans} />
                        <SummaryCard label="Avg Findings / Scan" value={data.summary.avg_findings_per_scan} />
                        <SummaryCard
                            label="Trend"
                            value=""
                            sub={<TrendArrow direction={data.summary.trend_direction} />}
                        />
                        <SummaryCard
                            label="Most Scanned"
                            value={data.summary.most_scanned_image || "N/A"}
                        />
                    </div>

                    {/* Critical trend indicator */}
                    {data.summary.critical_trend !== 0 && (
                        <div className={`text-sm px-3 py-2 rounded-md ${
                            data.summary.critical_trend < 0
                                ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300"
                                : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300"
                        }`}>
                            Critical findings {data.summary.critical_trend < 0 ? "decreased" : "increased"} by{" "}
                            <strong>{Math.abs(data.summary.critical_trend)}</strong> compared to the previous half of the period.
                        </div>
                    )}

                    {/* Stacked Bar Chart */}
                    {dataPoints.length === 0 ? (
                        <div className="rounded-lg border border-[var(--dg-border)] bg-[var(--dg-bg-elevated)] p-8 text-center text-[var(--dg-muted)]">
                            No completed scans in this period.
                        </div>
                    ) : (
                        <div className="rounded-lg border border-[var(--dg-border)] bg-[var(--dg-bg-elevated)] p-6">
                            <h2 className="text-sm font-medium text-[var(--dg-muted)] uppercase tracking-wide mb-4">
                                Findings by Severity
                            </h2>

                            {/* Legend */}
                            <div className="flex gap-4 mb-4 text-xs">
                                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-red-500" /> Critical</span>
                                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-orange-500" /> High</span>
                                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-yellow-500" /> Medium</span>
                                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-blue-400" /> Low</span>
                            </div>

                            {/* Chart */}
                            <div className="flex items-end gap-1 h-48">
                                {dataPoints.map((d) => {
                                    const total = d.critical + d.high + d.medium + d.low;
                                    const barHeight = (total / maxFindings) * 100;
                                    return (
                                        <div
                                            key={d.date}
                                            className="flex-1 flex flex-col justify-end group relative"
                                            title={`${d.date}\nScans: ${d.scans}\nCritical: ${d.critical}\nHigh: ${d.high}\nMedium: ${d.medium}\nLow: ${d.low}`}
                                        >
                                            <div
                                                className="w-full flex flex-col justify-end rounded-t-sm overflow-hidden"
                                                style={{ height: `${barHeight}%` }}
                                            >
                                                {d.critical > 0 && (
                                                    <div
                                                        className="bg-red-500 w-full"
                                                        style={{ height: `${(d.critical / total) * 100}%`, minHeight: d.critical > 0 ? 2 : 0 }}
                                                    />
                                                )}
                                                {d.high > 0 && (
                                                    <div
                                                        className="bg-orange-500 w-full"
                                                        style={{ height: `${(d.high / total) * 100}%`, minHeight: d.high > 0 ? 2 : 0 }}
                                                    />
                                                )}
                                                {d.medium > 0 && (
                                                    <div
                                                        className="bg-yellow-500 w-full"
                                                        style={{ height: `${(d.medium / total) * 100}%`, minHeight: d.medium > 0 ? 2 : 0 }}
                                                    />
                                                )}
                                                {d.low > 0 && (
                                                    <div
                                                        className="bg-blue-400 w-full"
                                                        style={{ height: `${(d.low / total) * 100}%`, minHeight: d.low > 0 ? 2 : 0 }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* X-axis labels */}
                            <div className="flex gap-1 mt-2">
                                {dataPoints.map((d, i) => {
                                    // Show label for first, last, and roughly every 7th point
                                    const showLabel = i === 0 || i === dataPoints.length - 1 || i % 7 === 0;
                                    return (
                                        <div key={d.date} className="flex-1 text-center">
                                            {showLabel && (
                                                <span className="text-[10px] text-[var(--dg-muted)]">
                                                    {d.date.slice(5)}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Recent Scans Table */}
                    {dataPoints.length > 0 && (
                        <div className="rounded-lg border border-[var(--dg-border)] bg-[var(--dg-bg-elevated)] overflow-hidden">
                            <h2 className="text-sm font-medium text-[var(--dg-muted)] uppercase tracking-wide p-4 pb-2">
                                Daily Breakdown
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[var(--dg-border)] text-left text-xs text-[var(--dg-muted)] uppercase">
                                            <th className="px-4 py-2">Date</th>
                                            <th className="px-4 py-2 text-right">Scans</th>
                                            <th className="px-4 py-2 text-right">Total</th>
                                            <th className="px-4 py-2 text-right text-red-500">Critical</th>
                                            <th className="px-4 py-2 text-right text-orange-500">High</th>
                                            <th className="px-4 py-2 text-right text-yellow-600">Medium</th>
                                            <th className="px-4 py-2 text-right text-blue-500">Low</th>
                                            <th className="px-4 py-2">Images</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...dataPoints].reverse().map((d) => (
                                            <tr key={d.date} className="border-b border-[var(--dg-border)] last:border-b-0 hover:bg-[var(--dg-bg-hover)]">
                                                <td className="px-4 py-2 font-mono text-xs">{d.date}</td>
                                                <td className="px-4 py-2 text-right">{d.scans}</td>
                                                <td className="px-4 py-2 text-right font-semibold">{d.total_findings}</td>
                                                <td className="px-4 py-2 text-right">{d.critical || "-"}</td>
                                                <td className="px-4 py-2 text-right">{d.high || "-"}</td>
                                                <td className="px-4 py-2 text-right">{d.medium || "-"}</td>
                                                <td className="px-4 py-2 text-right">{d.low || "-"}</td>
                                                <td className="px-4 py-2 text-xs text-[var(--dg-muted)] max-w-[200px] truncate">
                                                    {d.images_scanned.join(", ") || "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
