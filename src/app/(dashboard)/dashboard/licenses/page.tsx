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

type JobOption = { id: string; created_at: string; status: string; object_key?: string; registry_image?: string };

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
  const [showGuide, setShowGuide] = useState(false);

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
            {jobs.map((j) => {
              const label = j.registry_image || j.object_key || "";
              return (
                <option key={j.id} value={j.id}>
                  {j.id.slice(0, 8)}...{label ? ` — ${label}` : ""} — {new Date(j.created_at).toLocaleDateString()}
                </option>
              );
            })}
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


          {/* What does this mean? guide */}
          <div className="surface-card rounded-xl border border-black/10 dark:border-white/10 overflow-hidden">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-black/[.02] dark:hover:bg-white/[.02] transition"
            >
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M8 7v4M8 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <span className="text-sm font-semibold">What does this mean? How do I read these results?</span>
              </div>
              <svg width="12" height="12" viewBox="0 0 12 12" className={`transform transition ${showGuide ? 'rotate-180' : ''}`}><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
            {showGuide && (
              <div className="px-4 pb-4 grid gap-4 text-sm muted border-t border-black/5 dark:border-white/5 pt-4">
                <div className="grid gap-2">
                  <h4 className="font-semibold text-xs uppercase tracking-wide">Risk Levels Explained</h4>
                  <div className="grid gap-1.5">
                    <p><span className="font-semibold text-red-600 dark:text-red-400">Critical/High (GPL, AGPL)</span> — These licenses require that if you distribute your software, you must also release YOUR source code under the same license. <strong>However</strong>, if these packages are part of the base OS image (Alpine, Debian) and you are just running your app on top of them, you are fine. The GPL only triggers when you modify and redistribute the GPL code itself.</p>
                    <p><span className="font-semibold text-yellow-600 dark:text-yellow-400">Medium (LGPL, MPL)</span> — &quot;Weak copyleft&quot; — you can use these libraries in commercial software as long as you do not modify the library itself. If you modify it, you must share your modifications. Using it as-is = no problem.</p>
                    <p><span className="font-semibold text-blue-600 dark:text-blue-400">Low (Apache-2.0)</span> — Permissive license with a patent grant. You can use it commercially, just include the copyright notice and license text in your distribution.</p>
                    <p><span className="font-semibold text-green-600 dark:text-green-400">None (MIT, BSD, ISC)</span> — Most permissive. Use commercially with no restrictions. Just keep the copyright notice.</p>
                    <p><span className="opacity-60">Unknown</span> — License could not be detected from the package metadata. Most npm packages with &quot;unknown&quot; are actually MIT — the detection just could not read it. You can check manually on npmjs.com.</p>
                  </div>
                </div>
                <div className="grid gap-2">
                  <h4 className="font-semibold text-xs uppercase tracking-wide">Common Questions</h4>
                  <div className="grid gap-1.5">
                    <p><strong>Q: I see GPL packages flagged — can I still sell my software?</strong><br/>A: Almost certainly yes. If the GPL packages are OS-level (busybox, apk-tools, glibc) or system libraries, they do not affect your application code. Your app runs ON TOP of the OS — it does not incorporate the OS into itself. This is the same as running your app on a Linux server.</p>
                    <p><strong>Q: What about npm packages with GPL?</strong><br/>A: If you import a GPL npm package directly into your code (require/import it), and you distribute your software, then GPL obligations may apply. Check if you actually USE the package in your code or if it is just a transitive dependency.</p>
                    <p><strong>Q: Many packages show &quot;unknown&quot; — is that bad?</strong><br/>A: Not necessarily. &quot;Unknown&quot; means we could not automatically detect the license. Most npm packages are MIT. You can manually verify on npmjs.com or GitHub. Focus on the flagged high/critical ones first.</p>
                    <p><strong>Q: What action should I take?</strong><br/>A: Review only the &quot;Flagged Licenses&quot; section (high/critical). For each one, ask: &quot;Is this an OS package or something I directly import?&quot; If it is OS-level, ignore it. If it is in your direct dependencies, verify the license is compatible with your use case.</p>
                  </div>
                </div>
                <div className="rounded-lg bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 p-3">
                  <p className="text-xs"><strong>TL;DR:</strong> If all your flagged packages are Alpine/Debian base packages (busybox, apk-tools, musl, etc.), you have no license compliance issues. These are part of the container runtime, not your application.</p>
                </div>
              </div>
            )}
          </div>

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
