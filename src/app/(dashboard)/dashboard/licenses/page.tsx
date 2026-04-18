"use client";

import { useEffect, useState } from "react";

type LicenseRisk = "critical" | "high" | "medium" | "low" | "none" | "unknown";

type LicenseInfo = {
  spdx_id: string;
  name: string;
  risk: LicenseRisk;
  copyleft: boolean;
  commercial_use: boolean;
  description: string;
};

type PackageLicense = {
  name: string;
  version: string;
  ecosystem: string;
  license: string;
  info: LicenseInfo;
};

type AnalysisResult = {
  score: number;
  risk: LicenseRisk;
  packages: PackageLicense[];
  issues: LicenseInfo[];
  job_id: string;
  total_packages: number;
};

type JobOption = { id: string; created_at: string; status: string };

const RISK_COLORS: Record<LicenseRisk, string> = {
  critical: "bg-red-600 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-black",
  low: "bg-blue-400 text-white",
  none: "bg-green-500 text-white",
  unknown: "bg-gray-400 text-white",
};

const RISK_ORDER: LicenseRisk[] = ["critical", "high", "medium", "low", "none", "unknown"];

function RiskBadge({ risk }: { risk: LicenseRisk }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase ${RISK_COLORS[risk]}`}>
      {risk}
    </span>
  );
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

function RiskDistributionBar({ packages }: { packages: PackageLicense[] }) {
  const counts: Record<LicenseRisk, number> = { critical: 0, high: 0, medium: 0, low: 0, none: 0, unknown: 0 };
  for (const p of packages) counts[p.info.risk]++;
  const total = packages.length || 1;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Risk Distribution</h3>
      <div className="flex h-6 w-full overflow-hidden rounded">
        {RISK_ORDER.map((risk) => {
          const pct = (counts[risk] / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={risk}
              className={`${RISK_COLORS[risk]} flex items-center justify-center text-[10px] font-bold`}
              style={{ width: `${pct}%` }}
              title={`${risk}: ${counts[risk]}`}
            >
              {pct >= 8 ? counts[risk] : ""}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 text-xs">
        {RISK_ORDER.map((risk) =>
          counts[risk] > 0 ? (
            <span key={risk} className="flex items-center gap-1">
              <span className={`inline-block h-2.5 w-2.5 rounded-sm ${RISK_COLORS[risk]}`} />
              {risk}: {counts[risk]}
            </span>
          ) : null
        )}
      </div>
    </div>
  );
}

function LicenseTypeBreakdown({ packages }: { packages: PackageLicense[] }) {
  const licenseCounts: Record<string, number> = {};
  for (const p of packages) {
    const key = p.info.name || p.license;
    licenseCounts[key] = (licenseCounts[key] || 0) + 1;
  }
  const sorted = Object.entries(licenseCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">License Types</h3>
      <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
        {sorted.map(([name, count]) => (
          <div key={name} className="flex items-center justify-between text-sm">
            <span className="truncate mr-2">{name}</span>
            <span className="text-[var(--dg-muted)] font-mono text-xs">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LicensesPage() {
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<LicenseRisk | "all">("all");

  // Load recent completed jobs
  useEffect(() => {
    fetch("/api/jobs?status=done&limit=50", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load jobs");
        return res.json();
      })
      .then((data) => {
        const items = data.items || data.jobs || data || [];
        setJobs(items);
        if (items.length > 0) setSelectedJobId(items[0].id);
      })
      .catch(() => setJobs([]))
      .finally(() => setLoadingJobs(false));
  }, []);

  async function analyze() {
    if (!selectedJobId) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/licenses/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: selectedJobId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      setResult(await res.json());
    } catch (err: any) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  const filteredPackages = result
    ? result.packages.filter((p) => filter === "all" || p.info.risk === filter)
    : [];

  const copyleftPackages = result
    ? result.packages.filter((p) => p.info.copyleft)
    : [];

  const nonCommercialPackages = result
    ? result.packages.filter((p) => !p.info.commercial_use)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">License Risk Analysis</h1>
        <p className="text-[var(--dg-muted)] text-sm mt-1">
          Evaluate open source license compliance risk across scanned packages.
        </p>
      </div>

      {/* Job selector */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-[var(--dg-muted)] mb-1">Select a completed scan</label>
          <select
            className="input w-full"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            disabled={loadingJobs}
          >
            {loadingJobs && <option>Loading jobs...</option>}
            {!loadingJobs && jobs.length === 0 && <option>No completed scans</option>}
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.id.slice(0, 8)}... — {new Date(j.created_at).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
        <button
          className="btn-primary"
          onClick={analyze}
          disabled={loading || !selectedJobId}
        >
          {loading ? "Analyzing..." : "Analyze Licenses"}
        </button>
      </div>

      {error && (
        <div className="rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {result && (
        <>
          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Risk Score" value={result.score} sub={<RiskBadge risk={result.risk} />} />
            <SummaryCard label="Total Packages" value={result.total_packages} />
            <SummaryCard
              label="Copyleft Licenses"
              value={copyleftPackages.length}
              sub={copyleftPackages.length > 0 ? <span className="text-yellow-500">Requires review</span> : <span className="text-green-500">None found</span>}
            />
            <SummaryCard
              label="Non-Commercial"
              value={nonCommercialPackages.length}
              sub={nonCommercialPackages.length > 0 ? <span className="text-red-400">Restricts commercial use</span> : <span className="text-green-500">All clear</span>}
            />
          </div>

          {/* Distribution + breakdown */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-[var(--dg-border)] bg-[var(--dg-bg-elevated)] p-4">
              <RiskDistributionBar packages={result.packages} />
            </div>
            <div className="rounded-lg border border-[var(--dg-border)] bg-[var(--dg-bg-elevated)] p-4">
              <LicenseTypeBreakdown packages={result.packages} />
            </div>
          </div>

          {/* Flagged packages */}
          {result.issues.length > 0 && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-red-400">Flagged Licenses ({result.issues.length})</h3>
              <div className="space-y-2">
                {result.issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <RiskBadge risk={issue.risk} />
                    <div>
                      <span className="font-medium">{issue.spdx_id}</span>
                      <span className="text-[var(--dg-muted)] ml-2">{issue.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full package table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">All Packages ({filteredPackages.length})</h3>
              <select
                className="input text-xs"
                value={filter}
                onChange={(e) => setFilter(e.target.value as LicenseRisk | "all")}
              >
                <option value="all">All risks</option>
                {RISK_ORDER.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto rounded-lg border border-[var(--dg-border)]">
              <table className="w-full text-sm">
                <thead className="bg-[var(--dg-bg-elevated)]">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[var(--dg-muted)]">Package</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[var(--dg-muted)]">Version</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[var(--dg-muted)]">Ecosystem</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[var(--dg-muted)]">License</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[var(--dg-muted)]">Risk</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[var(--dg-muted)]">Copyleft</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[var(--dg-muted)]">Commercial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--dg-border)]">
                  {filteredPackages.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-6 text-center text-[var(--dg-muted)]">
                        No packages match the selected filter.
                      </td>
                    </tr>
                  )}
                  {filteredPackages.map((p, i) => (
                    <tr key={i} className="hover:bg-[var(--dg-bg-elevated)]">
                      <td className="px-3 py-2 font-medium">{p.name}</td>
                      <td className="px-3 py-2 font-mono text-xs">{p.version}</td>
                      <td className="px-3 py-2">{p.ecosystem}</td>
                      <td className="px-3 py-2">{p.info.name}</td>
                      <td className="px-3 py-2"><RiskBadge risk={p.info.risk} /></td>
                      <td className="px-3 py-2">{p.info.copyleft ? <span className="text-yellow-500">Yes</span> : "No"}</td>
                      <td className="px-3 py-2">{p.info.commercial_use ? <span className="text-green-500">Yes</span> : <span className="text-red-400">No</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
