import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Findings & Reports",
  description: "Understanding findings, confidence tiers, report JSON structure, and SBOM export.",
};

export default function FindingsAndReportsPage() {
  return (
    <article className="grid gap-6">
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Findings & Reports</h1>
        <p className="muted text-sm max-w-3xl">
          Learn how to read the findings table, understand confidence tiers, filter
          results, and export data.
        </p>
      </section>

      <section className="surface-card p-7 grid gap-5">
        <SectionHeader title="Findings Table" blurb="What each column means." />
        <div className="overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10">
                <th className="text-left py-2 pr-4 font-semibold">Column</th>
                <th className="text-left py-2 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="muted">
              <ColRow col="CVE ID" desc="The vulnerability identifier (e.g., CVE-2024-1234). Linked to NVD for details." />
              <ColRow col="Package" desc="The affected package name, ecosystem, and version." />
              <ColRow col="Severity" desc="CRITICAL, HIGH, MEDIUM, or LOW — derived from CVSS base score." />
              <ColRow col="CVSS" desc="Base score (0-10) and vector string from NVD." />
              <ColRow col="EPSS" desc="Exploit Prediction Scoring System score — probability of exploitation in the next 30 days." />
              <ColRow col="KEV" desc="Whether this CVE appears in CISA's Known Exploited Vulnerabilities catalog." />
              <ColRow col="Confidence" desc="ConfirmedInstalled or HeuristicUnverified — see below." />
              <ColRow col="Fix" desc="Fixed version if known, with upgrade recommendation." />
            </tbody>
          </table>
        </div>
      </section>

      <section className="surface-card p-7 grid gap-5">
        <SectionHeader title="Confidence Tiers" blurb="How certain are we about each finding." />
        <div className="grid gap-3 text-sm muted">
          <div className="grid gap-2">
            <h3 className="text-sm font-semibold" style={{ color: "var(--dg-text)" }}>ConfirmedInstalled</h3>
            <p>
              The package was found in an installed-state database (dpkg status, RPM DB, apk
              installed, lock files). The scanner is highly confident this package is present
              at the reported version.
            </p>
          </div>
          <div className="grid gap-2">
            <h3 className="text-sm font-semibold" style={{ color: "var(--dg-text)" }}>HeuristicUnverified</h3>
            <p>
              The package was detected via heuristic methods (filename patterns, binary string
              extraction, embedded library analysis). The finding may be a false positive —
              review the evidence items for details.
            </p>
          </div>
        </div>
      </section>

      <section className="surface-card p-7 grid gap-5">
        <SectionHeader title="Filtering & Sorting" blurb="Find the findings that matter." />
        <div className="grid gap-3 text-sm muted">
          <p>The findings page supports filtering by:</p>
          <ul className="grid gap-1.5 list-disc pl-5">
            <li><strong>Severity</strong> — Focus on CRITICAL and HIGH first.</li>
            <li><strong>Ecosystem</strong> — Filter to specific package managers (npm, PyPI, Maven, etc.).</li>
            <li><strong>Confidence tier</strong> — Show only ConfirmedInstalled for highest signal.</li>
            <li><strong>KEV status</strong> — Prioritize actively exploited vulnerabilities.</li>
            <li><strong>Text search</strong> — Search by CVE ID, package name, or description.</li>
          </ul>
        </div>
      </section>

      <section className="surface-card p-7 grid gap-5">
        <SectionHeader title="Report JSON Structure" blurb="What the full report contains." />
        <div className="grid gap-3 text-sm muted">
          <p>The report JSON contains the following top-level fields:</p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-4 text-xs overflow-x-auto">
{`{
  "scanner": { "name": "scanrook", "version": "..." },
  "target": { "type": "container|archive|binary|...", "source": "..." },
  "scan_status": "complete|partial_failed|unsupported",
  "inventory_status": "complete|partial|missing",
  "findings": [ ... ],
  "files": [ ... ],
  "summary": {
    "total_findings": 42,
    "critical": 2, "high": 8, "medium": 20, "low": 12,
    "confirmed_critical": 2, "confirmed_high": 6, ...
  }
}`}
          </pre>
        </div>
      </section>

      <section className="surface-card p-7 grid gap-5">
        <SectionHeader title="SBOM Export" blurb="Export the package inventory." />
        <div className="grid gap-3 text-sm muted">
          <p>
            ScanRook can generate SBOMs in CycloneDX and SPDX formats via the CLI:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
            <code>scanrook sbom import --file report.json --format json</code>
          </pre>
          <p>
            Use <code className="text-xs bg-black/5 dark:bg-white/10 px-1 rounded">sbom diff</code> to
            compare two SBOM snapshots and track package changes over time.
          </p>
        </div>
      </section>
    </article>
  );
}

function SectionHeader({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-xs muted mt-0.5">{blurb}</p>
    </div>
  );
}

function ColRow({ col, desc }: { col: string; desc: string }) {
  return (
    <tr className="border-b border-black/5 dark:border-white/5">
      <td className="py-1.5 pr-4 font-semibold text-xs" style={{ color: "var(--dg-text)" }}>{col}</td>
      <td className="py-1.5">{desc}</td>
    </tr>
  );
}
