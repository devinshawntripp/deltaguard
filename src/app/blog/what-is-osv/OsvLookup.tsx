"use client";

import { useState } from "react";

const ECOSYSTEMS = [
  "npm",
  "PyPI",
  "Go",
  "Maven",
  "crates.io",
  "NuGet",
  "RubyGems",
  "Packagist",
  "Hex",
  "Pub",
  "SwiftURL",
  "Debian",
  "Alpine",
  "Ubuntu",
  "Rocky Linux",
  "AlmaLinux",
  "SUSE",
  "Photon OS",
];

interface OsvVuln {
  id: string;
  summary?: string;
  aliases?: string[];
  severity?: { type: string; score: string }[];
}

interface OsvResponse {
  vulns?: OsvVuln[];
}

function severityFromVector(vector: string): string | null {
  const match = vector.match(/CVSS:\d\.\d\/.*?S:(\w)/);
  if (!match) return null;
  const baseMatch = vector.match(
    /AV:(\w)\/AC:(\w)\/PR:(\w)\/UI:(\w)\/S:(\w)\/C:(\w)\/I:(\w)\/A:(\w)/,
  );
  if (!baseMatch) return null;
  return null;
}

function severityLabel(vuln: OsvVuln): string | null {
  if (!vuln.severity?.length) return null;
  const vec = vuln.severity[0].score;
  if (vec.includes("/AV:N/AC:L/PR:N")) return "Critical";
  if (vec.includes("/AV:N")) return "High";
  if (vec.includes("/AV:A") || vec.includes("/AV:L")) return "Medium";
  return "Low";
}

function severityColor(label: string | null): string {
  switch (label) {
    case "Critical":
      return "bg-red-500/15 text-red-700 dark:text-red-400";
    case "High":
      return "bg-orange-500/15 text-orange-700 dark:text-orange-400";
    case "Medium":
      return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400";
    case "Low":
      return "bg-blue-500/15 text-blue-700 dark:text-blue-400";
    default:
      return "bg-black/5 dark:bg-white/5 muted";
  }
}

export default function OsvLookup() {
  const [ecosystem, setEcosystem] = useState("npm");
  const [pkg, setPkg] = useState("");
  const [version, setVersion] = useState("");
  const [results, setResults] = useState<OsvResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleQuery() {
    if (!pkg.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const body: Record<string, unknown> = {
        package: { ecosystem, name: pkg.trim() },
      };
      if (version.trim()) body.version = version.trim();
      const res = await fetch("https://api.osv.dev/v1/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`OSV API returned ${res.status}`);
      setResults(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && pkg.trim()) handleQuery();
  }

  return (
    <div className="grid gap-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <select
          value={ecosystem}
          onChange={(e) => setEcosystem(e.target.value)}
          className="rounded-lg border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 text-sm"
          aria-label="Ecosystem"
        >
          {ECOSYSTEMS.map((eco) => (
            <option key={eco} value={eco}>
              {eco}
            </option>
          ))}
        </select>
        <input
          placeholder="Package name (e.g. lodash)"
          value={pkg}
          onChange={(e) => setPkg(e.target.value)}
          onKeyDown={handleKeyDown}
          className="rounded-lg border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 text-sm"
          aria-label="Package name"
        />
        <input
          placeholder="Version (optional)"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          onKeyDown={handleKeyDown}
          className="rounded-lg border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 text-sm"
          aria-label="Version"
        />
      </div>
      <button
        onClick={handleQuery}
        disabled={!pkg.trim() || loading}
        className="rounded-lg bg-[var(--dg-accent,#2563eb)] text-white px-4 py-2 text-sm font-medium disabled:opacity-50 transition-opacity"
      >
        {loading ? "Querying OSV..." : "Search OSV Database"}
      </button>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 text-center py-3">
          {error}
        </div>
      )}

      {results?.vulns && results.vulns.length > 0 && (
        <div className="rounded-xl border border-black/10 dark:border-white/10 overflow-hidden">
          <div className="p-3 bg-black/[.03] dark:bg-white/[.03] text-xs font-semibold flex items-center justify-between">
            <span>
              {results.vulns.length} vulnerabilit
              {results.vulns.length === 1 ? "y" : "ies"} found
            </span>
            <span className="muted font-normal">
              via api.osv.dev
            </span>
          </div>
          <div className="divide-y divide-black/5 dark:divide-white/5 max-h-96 overflow-y-auto">
            {results.vulns.slice(0, 25).map((v) => {
              const sev = severityLabel(v);
              return (
                <div key={v.id} className="p-3 text-sm grid gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`https://osv.dev/vulnerability/${v.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs font-semibold underline underline-offset-2"
                    >
                      {v.id}
                    </a>
                    {v.aliases?.map((a) => (
                      <span
                        key={a}
                        className="font-mono text-xs muted"
                      >
                        {a}
                      </span>
                    ))}
                    {sev && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${severityColor(sev)}`}
                      >
                        {sev}
                      </span>
                    )}
                  </div>
                  <div className="text-xs muted">
                    {v.summary || "No summary available"}
                  </div>
                </div>
              );
            })}
            {results.vulns.length > 25 && (
              <div className="p-3 text-xs muted text-center">
                Showing 25 of {results.vulns.length} results.{" "}
                <a
                  href={`https://osv.dev/list?ecosystem=${encodeURIComponent(ecosystem)}&q=${encodeURIComponent(pkg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  View all on osv.dev
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {results && (!results.vulns || results.vulns.length === 0) && (
        <div className="text-sm muted text-center py-6 rounded-xl border border-black/10 dark:border-white/10">
          No known vulnerabilities found
          {version ? ` for ${pkg}@${version}` : ` for ${pkg}`} in the {ecosystem}{" "}
          ecosystem.
        </div>
      )}
    </div>
  );
}
