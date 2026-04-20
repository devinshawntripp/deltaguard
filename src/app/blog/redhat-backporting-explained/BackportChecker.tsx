"use client";

import { useState } from "react";

interface CveResult {
  CVE: string;
  severity: string;
  public_date: string;
  bugzilla_description: string;
  advisories: string[];
  affected_packages: string[];
  resource_url: string;
}

export default function BackportChecker() {
  const [pkg, setPkg] = useState("openssl");
  const [results, setResults] = useState<CveResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheck() {
    if (!pkg.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch(
        `/api/redhat-cve?package=${encodeURIComponent(pkg.trim())}`,
      );
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && pkg.trim()) handleCheck();
  }

  function severityColor(severity: string): string {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-red-500/15 text-red-700 dark:text-red-300";
      case "important":
        return "bg-orange-500/15 text-orange-700 dark:text-orange-300";
      case "moderate":
        return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300";
      case "low":
        return "bg-blue-500/15 text-blue-700 dark:text-blue-300";
      default:
        return "bg-black/5 dark:bg-white/5 muted";
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid sm:grid-cols-[1fr_auto] gap-3">
        <input
          placeholder="Package name (e.g. openssl, curl, glibc)"
          value={pkg}
          onChange={(e) => setPkg(e.target.value)}
          onKeyDown={handleKeyDown}
          className="rounded-lg border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 text-sm"
          aria-label="RPM package name"
        />
        <button
          onClick={handleCheck}
          disabled={!pkg.trim() || loading}
          className="rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-red-700 transition-colors"
        >
          {loading ? "Checking..." : "Check CVEs"}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 text-center py-3">
          {error}
        </div>
      )}

      {results && results.length > 0 && (
        <div className="rounded-xl border border-black/10 dark:border-white/10 overflow-hidden">
          <div className="p-3 bg-red-500/10 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center justify-between">
            <span>
              {results.length} CVE{results.length === 1 ? "" : "s"} found for
              &ldquo;{pkg}&rdquo;
            </span>
            <span className="font-normal opacity-70">
              via Red Hat Security Data API
            </span>
          </div>
          <div className="divide-y divide-black/5 dark:divide-white/5 max-h-80 overflow-y-auto">
            {results.slice(0, 20).map((cve) => (
              <div key={cve.CVE} className="p-3 text-sm grid gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-semibold">
                    {cve.CVE}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${severityColor(cve.severity)}`}
                  >
                    {cve.severity || "unknown"}
                  </span>
                  {cve.public_date && (
                    <span className="text-[10px] muted">
                      {new Date(cve.public_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="text-xs muted">
                  {cve.bugzilla_description || "No description"}
                </div>
                {cve.advisories && cve.advisories.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span className="text-[10px] font-medium text-green-700 dark:text-green-400">
                      Patched:
                    </span>
                    {cve.advisories.map((adv) => (
                      <a
                        key={adv}
                        href={`https://access.redhat.com/errata/${adv}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-mono text-red-600 dark:text-red-400 hover:underline"
                      >
                        {adv}
                      </a>
                    ))}
                  </div>
                )}
                <a
                  href={`https://access.redhat.com/security/cve/${cve.CVE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-red-600 dark:text-red-400 hover:underline"
                >
                  View on Red Hat &rarr;
                </a>
              </div>
            ))}
            {results.length > 20 && (
              <div className="p-3 text-xs muted text-center">
                Showing 20 of {results.length} results.
              </div>
            )}
          </div>
        </div>
      )}

      {results && results.length === 0 && (
        <div className="text-sm muted text-center py-6 rounded-xl border border-black/10 dark:border-white/10">
          No CVEs found for &ldquo;{pkg}&rdquo; in Red Hat&apos;s security
          database.
        </div>
      )}

      <p className="text-[11px] muted">
        This tool queries Red Hat&apos;s public security data API via a
        server-side proxy. You can also run this query directly:{" "}
        <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
          curl
          &quot;https://access.redhat.com/hydra/rest/search/cve.json?package={pkg}&per_page=20&quot;
        </code>
      </p>
    </div>
  );
}
