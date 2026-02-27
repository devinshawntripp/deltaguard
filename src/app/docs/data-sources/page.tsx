import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Sources",
  description:
    "Complete provider table showing integration maturity, ecosystem coverage, and current status for every vulnerability data source in ScanRook.",
};

type Status = "yes" | "partial" | "planned";

type DataSource = {
  source: string;
  provider: string;
  ecosystems: string;
  status: Status;
  notes: string;
};

const dataSources: DataSource[] = [
  {
    source: "Open Source Vulnerabilities API",
    provider: "osv",
    ecosystems: ".NET, Go, Java, JavaScript, Python, Ruby, Rust, DPKG, APK, RPM",
    status: "yes",
    notes:
      "Primary enrichment source. Batch API queries packages by ecosystem/name/version. Broadest ecosystem coverage. Response caching via file + PostgreSQL + Redis.",
  },
  {
    source: "National Vulnerability Database",
    provider: "nvd",
    ecosystems: "CVE-backed cross-ecosystem",
    status: "yes",
    notes:
      "Second-pass enrichment. Adds CVSS v3.1 scores, CPE-based matching for binaries and generic packages. Rate-limited without NVD_API_KEY.",
  },
  {
    source: "Red Hat Security Data API",
    provider: "redhat",
    ecosystems: "RPM (RHEL family)",
    status: "yes",
    notes:
      "Per-CVE fix status for RPM packages in RHEL, CentOS Stream. Returns errata IDs, fix state, and fixed-in versions.",
  },
  {
    source: "Red Hat OVAL XML (user supplied)",
    provider: "redhat_oval",
    ecosystems: "RPM (RHEL family)",
    status: "yes",
    notes:
      "Offline OVAL-based checking. User supplies XML file via --oval-redhat flag. Checks affected packages against OVAL definitions.",
  },
  {
    source: "Ubuntu CVE Tracker",
    provider: "ubuntu",
    ecosystems: "DPKG",
    status: "yes",
    notes:
      "Auto-activated when Ubuntu is detected in container images. Provides fix status per Ubuntu release (focal, jammy, noble).",
  },
  {
    source: "Debian Security Tracker",
    provider: "debian",
    ecosystems: "DPKG",
    status: "yes",
    notes:
      "Auto-activated when Debian is detected. Maps CVEs to package versions with fix status and urgency ratings.",
  },
  {
    source: "Alpine SecDB",
    provider: "alpine",
    ecosystems: "APK",
    status: "yes",
    notes:
      "Auto-activated when Alpine is detected. Maps CVEs to APK package versions with fix status per Alpine release.",
  },
  {
    source: "AlmaLinux OSV Database",
    provider: "alma",
    ecosystems: "RPM",
    status: "yes",
    notes:
      "AlmaLinux advisory data via OSV format. Provides RHEL-compatible fix status for AlmaLinux deployments.",
  },
  {
    source: "Amazon Linux Security Center",
    provider: "amazon",
    ecosystems: "RPM",
    status: "yes",
    notes:
      "ALAS (Amazon Linux Security Advisories). Provides fix status for Amazon Linux 2 and 2023 RPM packages.",
  },
  {
    source: "SUSE Security OVAL",
    provider: "sles",
    ecosystems: "RPM",
    status: "planned",
    notes:
      "SUSE/openSUSE OVAL data. Will provide fix status for SLES and openSUSE RPM packages.",
  },
  {
    source: "Oracle Linux Security",
    provider: "oracle",
    ecosystems: "RPM",
    status: "yes",
    notes:
      "Oracle Linux Security Advisories (ELSA). Provides fix status for Oracle Linux RPM packages.",
  },
  {
    source: "Chainguard Security",
    provider: "chainguard",
    ecosystems: "APK",
    status: "yes",
    notes:
      "Chainguard-specific security data for distroless/Chainguard OS APK packages.",
  },
  {
    source: "Wolfi Security",
    provider: "wolfi",
    ecosystems: "APK",
    status: "yes",
    notes:
      "Wolfi OS security data. Provides fix status for Wolfi APK packages used in distroless containers.",
  },
  {
    source: "EPSS (Exploit Prediction Scoring)",
    provider: "epss",
    ecosystems: "Cross-ecosystem",
    status: "yes",
    notes:
      "FIRST's exploit probability model. Adds a 0\u20131 probability score to each CVE indicating real-world exploit likelihood.",
  },
  {
    source: "CISA KEV (Known Exploited Vulnerabilities)",
    provider: "kev",
    ecosystems: "Cross-ecosystem",
    status: "yes",
    notes:
      "CISA's catalog of actively exploited vulnerabilities. Flags findings that are confirmed exploited in the wild.",
  },
];

export default function DataSourcesPage() {
  return (
    <article className="grid gap-6">
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Data Sources</h1>
        <p className="muted text-sm max-w-3xl">
          ScanRook queries multiple vulnerability databases during enrichment. This
          page lists every data source, its ecosystem coverage, integration status,
          and implementation notes.
        </p>
      </section>

      {/* Status legend */}
      <section className="surface-card p-7 grid gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Status legend</h2>
        <div className="flex flex-wrap gap-3">
          <StatusBadge status="yes" />
          <StatusBadge status="partial" />
          <StatusBadge status="planned" />
        </div>
        <div className="text-sm muted grid gap-1">
          <p><strong>Ready</strong> -- fully integrated and active in production scans.</p>
          <p><strong>Partial</strong> -- integrated with known limitations or incomplete coverage.</p>
          <p><strong>Planned</strong> -- on the roadmap but not yet implemented.</p>
        </div>
      </section>

      {/* Provider table */}
      <section className="surface-card p-7 grid gap-4 overflow-x-auto">
        <h2 className="text-lg font-semibold tracking-tight">Provider table</h2>
        <table className="w-full text-sm border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10">
              <th className="text-left py-2 pr-4">Data Source</th>
              <th className="text-left py-2 pr-4">Provider</th>
              <th className="text-left py-2 pr-4">Ecosystems</th>
              <th className="text-left py-2 pr-4">Status</th>
              <th className="text-left py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {dataSources.map((row) => (
              <tr
                key={`${row.provider}:${row.source}`}
                className="border-b border-black/5 dark:border-white/5 align-top"
              >
                <td className="py-2.5 pr-4 font-medium">{row.source}</td>
                <td className="py-2.5 pr-4">
                  <code className="text-xs">{row.provider}</code>
                </td>
                <td className="py-2.5 pr-4 muted">{row.ecosystems}</td>
                <td className="py-2.5 pr-4">
                  <StatusBadge status={row.status} />
                </td>
                <td className="py-2.5 muted text-xs">{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Ecosystem coverage summary */}
      <section className="surface-card p-7 grid gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Ecosystem coverage</h2>
        <p className="text-sm muted">
          The combination of OSV, NVD, and distro-specific feeds gives ScanRook
          coverage across the following package ecosystems:
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { eco: "RPM", distros: "RHEL, CentOS, Fedora, AlmaLinux, Oracle, Amazon, SUSE (planned)" },
            { eco: "DPKG", distros: "Debian, Ubuntu" },
            { eco: "APK", distros: "Alpine, Chainguard, Wolfi" },
            { eco: "npm", distros: "Node.js packages via package-lock.json" },
            { eco: "PyPI", distros: "Python packages via requirements.txt, Pipfile.lock" },
            { eco: "Go", distros: "Go modules via go.sum, binary build info" },
            { eco: "Cargo", distros: "Rust crates via Cargo.lock" },
            { eco: "Maven", distros: "Java packages via pom.xml" },
            { eco: "NuGet", distros: ".NET packages via packages.config, .csproj" },
            { eco: "RubyGems", distros: "Ruby gems via Gemfile.lock" },
          ].map((e) => (
            <div
              key={e.eco}
              className="rounded-lg border border-black/10 dark:border-white/10 p-3"
            >
              <div className="text-sm font-semibold">{e.eco}</div>
              <div className="text-xs muted">{e.distros}</div>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const cfg =
    status === "yes"
      ? {
          text: "Ready",
          className:
            "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
          icon: (
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path
                d="M2.2 6.3 4.8 8.9 9.8 3.9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ),
        }
      : status === "partial"
        ? {
            text: "Partial",
            className:
              "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40",
            icon: (
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2.4 6h7.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            ),
          }
        : {
            text: "Planned",
            className:
              "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/40",
            icon: (
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <circle cx="6" cy="6" r="3.8" fill="none" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            ),
          };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${cfg.className}`}
    >
      {cfg.icon}
      {cfg.text}
    </span>
  );
}
