import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enrichment",
  description:
    "How ScanRook enriches package inventories with vulnerability data from OSV, NVD, Red Hat CSAF, distro feeds, EPSS, and CISA KEV.",
};

type Source = {
  name: string;
  provider: string;
  description: string;
  what: string;
  when: string;
};

const sources: Source[] = [
  {
    name: "Open Source Vulnerabilities (OSV)",
    provider: "osv",
    description:
      "Google's open-source vulnerability database. Covers the broadest set of ecosystems via a single batch API.",
    what:
      "Batch queries packages by ecosystem/name/version. Returns matched advisories with affected ranges, severity, and fix versions.",
    when:
      "Always queried first. Primary source for npm, PyPI, Go, Rust, Ruby, Maven, NuGet, DPKG, APK, and RPM packages.",
  },
  {
    name: "National Vulnerability Database (NVD)",
    provider: "nvd",
    description:
      "NIST's authoritative CVE dictionary. Provides CVSS scores, CPE matching, and detailed advisory metadata.",
    what:
      "Per-CVE lookup by ID, plus CPE-based product/version matching. Returns CVSS v3.1 base scores, vector strings, references, and CWE classifications.",
    when:
      "Used as a second-pass enrichment after OSV. Adds CVSS scores to OSV findings and discovers additional CVEs via CPE matching. Requires NVD_API_KEY for higher rate limits.",
  },
  {
    name: "Red Hat CSAF / Security Data API",
    provider: "redhat",
    description:
      "Red Hat's security data API provides fix status, errata, and CSAF advisories for RHEL packages.",
    what:
      "Queries per-CVE fix status for RPM packages. Returns fix state (affected, fixed, not affected), errata IDs, and fixed-in versions.",
    when:
      "Automatically activated for RPM packages detected in RHEL-based container images. Also invoked when --oval-redhat is provided.",
  },
  {
    name: "Distro security feeds",
    provider: "ubuntu, debian, alpine, amazon, oracle, wolfi, chainguard",
    description:
      "Distribution-specific security trackers that provide precise fix status for packages in their repositories.",
    what:
      "Maps CVEs to distro package versions with fix status (fixed, not-affected, needs-triage). Provides distro-specific severity and urgency ratings.",
    when:
      "Activated based on detected OS in container scans. Ubuntu CVE Tracker for Ubuntu/DPKG, Debian Security Tracker for Debian/DPKG, Alpine SecDB for Alpine/APK, Amazon Linux for AL2/AL2023, Oracle Linux, Wolfi SecDB, and Chainguard advisories.",
  },
  {
    name: "EPSS (Exploit Prediction Scoring System)",
    provider: "epss",
    description:
      "FIRST's model that predicts the probability a CVE will be exploited in the next 30 days.",
    what:
      "Returns a probability score (0.0-1.0) and percentile for each CVE, indicating real-world exploit likelihood. Results are cached for 24 hours.",
    when:
      "Always active. Applied to all findings after vulnerability matching. Batch queries api.first.org for all CVE IDs in the report.",
  },
  {
    name: "CISA KEV (Known Exploited Vulnerabilities)",
    provider: "kev",
    description:
      "CISA's catalog of vulnerabilities known to be actively exploited in the wild.",
    what:
      "Boolean flag: is this CVE in the KEV catalog? Also provides the date added, required remediation date, and ransomware campaign association.",
    when:
      "Always active. Downloads the full KEV catalog (cached as a HashSet), then flags any finding whose CVE ID appears in the catalog.",
  },
];

export default function EnrichmentPage() {
  return (
    <article className="grid gap-6">
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Enrichment</h1>
        <p className="muted text-sm max-w-3xl">
          Enrichment is the process of taking a raw package inventory (names and
          versions found in a container, binary, or SBOM) and matching it against
          vulnerability databases to produce actionable findings. ScanRook queries
          multiple sources in a defined pipeline order, merging results and
          deduplicating across providers.
        </p>
      </section>

      {/* What enrichment means */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="What enrichment means"
          blurb="Turning a list of packages into a list of vulnerabilities."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            When ScanRook scans an artifact, it first extracts a package inventory:
            the list of installed software with ecosystem, name, and version. This
            inventory by itself has no security information. Enrichment is the step
            that queries external vulnerability databases to determine which of those
            packages have known CVEs.
          </p>
          <p>
            Each enrichment source contributes different data. OSV provides broad
            ecosystem coverage and affected version ranges. NVD adds authoritative
            CVSS scores and CPE-based matching. Distro feeds provide fix status
            specific to the Linux distribution. The scanner merges all of this into a
            single unified finding per CVE-package pair.
          </p>
        </div>
      </section>

      {/* Pipeline diagram */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Enrichment pipeline"
          blurb="The order in which ScanRook queries vulnerability data sources."
        />
        <div className="overflow-x-auto">
          <div className="inline-flex items-center gap-2 text-xs font-mono p-4 rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] min-w-[1100px]">
            <PipelineStep label="Package Inventory" sub="container.rs / sbom.rs" />
            <Arrow />
            <PipelineStep label="OSV Batch Query" sub="vuln.rs" active />
            <Arrow />
            <PipelineStep label="NVD CPE Match" sub="vuln.rs" active />
            <Arrow />
            <PipelineStep label="Distro Feed" sub="vuln.rs" active />
            <Arrow />
            <PipelineStep label="Red Hat CSAF" sub="redhat.rs" active />
            <Arrow />
            <PipelineStep label="EPSS Enrich" sub="vuln.rs" active />
            <Arrow />
            <PipelineStep label="CISA KEV" sub="vuln.rs" active />
            <Arrow />
            <PipelineStep label="Deduplicate + Merge" sub="vuln.rs" />
            <Arrow />
            <PipelineStep label="Report" sub="report.rs" />
          </div>
        </div>
        <p className="text-xs muted">
          Each active enrichment step (highlighted) queries an external API. Results
          are cached locally and in PostgreSQL/Redis when configured.
        </p>
      </section>

      {/* Source details */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Enrichment sources"
          blurb="Detailed description of each vulnerability data source in the pipeline."
        />
        <div className="grid gap-5">
          {sources.map((s) => (
            <div
              key={s.provider}
              className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">{s.name}</h3>
                <code className="text-xs rounded px-1.5 py-0.5 border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04]">
                  {s.provider}
                </code>
              </div>
              <p className="text-sm muted">{s.description}</p>
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="font-semibold mb-0.5" style={{ color: "var(--dg-text)" }}>What it provides</div>
                  <p className="muted">{s.what}</p>
                </div>
                <div>
                  <div className="font-semibold mb-0.5" style={{ color: "var(--dg-text)" }}>When it activates</div>
                  <p className="muted">{s.when}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deduplication */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Deduplication and merging"
          blurb="How ScanRook handles overlapping results from multiple sources."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            When the same CVE is reported by multiple sources (for example, both OSV
            and NVD report CVE-2024-12345 for the same package), ScanRook merges them
            into a single finding. The merge logic:
          </p>
          <ul className="list-disc ml-5 grid gap-1">
            <li>Uses the highest CVSS score from any source</li>
            <li>Combines evidence items from all sources</li>
            <li>Prefers distro-specific fix status over generic fix versions</li>
            <li>Retains all references and advisory URLs</li>
            <li>Sets the confidence tier based on the strongest evidence available</li>
          </ul>
          <p>
            This approach ensures that findings are both comprehensive and
            deduplicated, avoiding duplicate alerts for the same vulnerability.
          </p>
        </div>
      </section>
    </article>
  );
}

function SectionHeader({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="grid gap-1">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm muted">{blurb}</p>
    </div>
  );
}

function PipelineStep({ label, sub, active }: { label: string; sub: string; active?: boolean }) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 text-center min-w-[100px] ${
        active
          ? "border-[color-mix(in_srgb,var(--dg-accent)_50%,var(--dg-border))] bg-[var(--dg-accent-soft)]"
          : "border-black/10 dark:border-white/10"
      }`}
    >
      <div className="font-semibold text-[11px]" style={active ? { color: "var(--dg-accent-ink)" } : { color: "var(--dg-text)" }}>
        {label}
      </div>
      <div className="text-[10px] muted">{sub}</div>
    </div>
  );
}

function Arrow() {
  return (
    <svg width="20" height="12" viewBox="0 0 20 12" aria-hidden="true" className="shrink-0 muted">
      <path d="M2 6h14M12 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
