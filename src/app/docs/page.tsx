import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

type Status = "yes" | "partial" | "planned";

const sbomCapabilities: Array<{
  capability: string;
  status: Status;
  notes: string;
}> = [
  {
    capability: "Automatically generate SBOMs",
    status: "partial",
    notes: "Supported for container scans via Syft (`--sbom`) in CycloneDX JSON output.",
  },
  {
    capability: "Import SBOMs (SPDX, CycloneDX, Syft)",
    status: "planned",
    notes: "Planned as a first-class SBOM ingest and normalization pipeline.",
  },
  {
    capability: "Monitor SBOM changes through SDLC",
    status: "planned",
    notes: "Planned baseline, diff, and policy checks across scan history.",
  },
  {
    capability: "Track open source and third-party risk",
    status: "partial",
    notes: "Vulnerability workflow exists now; SBOM-specific governance is in-progress.",
  },
];

const dataSources: Array<{
  source: string;
  provider: string;
  ecosystems: string;
  status: Status;
}> = [
  {
    source: "Open Source Vulnerabilities API",
    provider: "osv",
    ecosystems: ".NET, Go, Java, JavaScript, Python, Ruby, Rust, DPKG, APK, RPM",
    status: "yes",
  },
  {
    source: "National Vulnerability Database",
    provider: "nvd",
    ecosystems: "CVE-backed cross-ecosystem",
    status: "yes",
  },
  {
    source: "Red Hat Security Data API",
    provider: "redhat",
    ecosystems: "RPM (RHEL family)",
    status: "yes",
  },
  {
    source: "Red Hat OVAL XML (user supplied)",
    provider: "redhat_oval",
    ecosystems: "RPM (RHEL family)",
    status: "partial",
  },
  {
    source: "Ubuntu CVE Tracker",
    provider: "ubuntu",
    ecosystems: "DPKG",
    status: "planned",
  },
  {
    source: "Debian Security Tracker",
    provider: "debian",
    ecosystems: "DPKG",
    status: "planned",
  },
  {
    source: "Alpine SecDB",
    provider: "alpine",
    ecosystems: "APK",
    status: "planned",
  },
];

const installCmd = "curl -fsSL https://scanrook.sh/install | bash";
const runCmd = "scanrook scan --file ./artifact.tar --mode deep --format json --out report.json";
const dbCheckCmd = "scanrook db check";
const dbSourcesCmd = "scanrook db sources";
const dbUpdateCmd = "scanrook db update --source all";

const trivyStyleExample = `2026-02-27T12:01:04-06:00\tINFO\t[nvd]\tnvd.fetch.start\t1/33 CVE-2024-12345
2026-02-27T12:01:05-06:00\tINFO\t[container]\tcontainer.osv.query.done\tok
2026-02-27T12:01:05-06:00\tERROR\t[nvd]\tnvd.fetch.err\tCVE-2024-12345`;

const jsonExample = `{"ts":"2026-02-27T12:01:05-06:00","level":"info","component":"container","event":"container.osv.query.done","stage":"container.osv.query.done","detail":"ok"}`;

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 grid gap-8">
      <section className="surface-card p-7 grid gap-4">
        <div className="inline-flex items-center gap-3">
          <BrandLogo markClassName="h-10 w-10 rounded-lg" nameClassName="text-2xl font-semibold tracking-tight" />
          <span className="rounded-full border border-black/10 dark:border-white/10 px-3 py-1 text-xs muted">
            Documentation
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">ScanRook Docs</h1>
        <p className="muted max-w-4xl text-sm">
          Installed-state-first scanning with explicit workflow stages, structured logs, and cache management.
          This page is the operator-focused baseline for product and platform usage.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/signin" className="btn-primary">Sign in</Link>
          <a href="https://scanrook.sh" className="btn-secondary">CLI Home</a>
        </div>
      </section>

      <section className="surface-card p-7 grid gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Quickstart</h2>
        <DocCode label="Install">{installCmd}</DocCode>
        <DocCode label="Run scan">{runCmd}</DocCode>
        <DocCode label="DB check">{dbCheckCmd}</DocCode>
        <DocCode label="DB sources">{dbSourcesCmd}</DocCode>
        <DocCode label="DB update">{dbUpdateCmd}</DocCode>
      </section>

      <section className="surface-card p-7 grid gap-4 overflow-x-auto">
        <h2 className="text-xl font-semibold tracking-tight">SBOM Capability Matrix</h2>
        <table className="w-full text-sm border-collapse min-w-[860px]">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10">
              <th className="text-left py-2 pr-4">Capability</th>
              <th className="text-left py-2 pr-4">Status</th>
              <th className="text-left py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {sbomCapabilities.map((row) => (
              <tr key={row.capability} className="border-b border-black/5 dark:border-white/5 align-top">
                <td className="py-2 pr-4 font-medium">{row.capability}</td>
                <td className="py-2 pr-4"><StatusBadge status={row.status} /></td>
                <td className="py-2 muted">{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="surface-card p-7 grid gap-4 overflow-x-auto">
        <h2 className="text-xl font-semibold tracking-tight">Vulnerability Data Sources</h2>
        <table className="w-full text-sm border-collapse min-w-[980px]">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10">
              <th className="text-left py-2 pr-4">Data Source</th>
              <th className="text-left py-2 pr-4">Provider</th>
              <th className="text-left py-2 pr-4">Ecosystems</th>
              <th className="text-left py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {dataSources.map((row) => (
              <tr key={`${row.provider}:${row.source}`} className="border-b border-black/5 dark:border-white/5 align-top">
                <td className="py-2 pr-4 font-medium">{row.source}</td>
                <td className="py-2 pr-4"><code>{row.provider}</code></td>
                <td className="py-2 pr-4 muted">{row.ecosystems}</td>
                <td className="py-2"><StatusBadge status={row.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="surface-card p-7 grid gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Structured Logging</h2>
        <p className="text-sm muted">
          Scanner progress remains stage-based for UI (`stage`, `detail`, `ts`) and now includes explicit
          `level`, `component`, and `event`.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <DocCode label="Trivy-style text logs (--progress + --log-format text)">{trivyStyleExample}</DocCode>
          <DocCode label="JSON log line (--progress + --log-format json)">{jsonExample}</DocCode>
        </div>
        <div className="text-sm muted">
          Log controls: <code>--log-format text|json</code> and <code>--log-level error|warn|info|debug</code>.
        </div>
      </section>
    </main>
  );
}

function DocCode({ label, children }: { label: string; children: string }) {
  return (
    <div className="grid gap-1.5">
      <div className="text-xs font-semibold uppercase tracking-wide muted">{label}</div>
      <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const cfg = status === "yes"
    ? { text: "Ready", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40", icon: <CheckGlyph /> }
    : status === "partial"
      ? { text: "Partial", className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40", icon: <PartialGlyph /> }
      : { text: "Planned", className: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/40", icon: <PlannedGlyph /> };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${cfg.className}`}>
      {cfg.icon}
      {cfg.text}
    </span>
  );
}

function CheckGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2.2 6.3 4.8 8.9 9.8 3.9" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PartialGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2.4 6h7.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function PlannedGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <circle cx="6" cy="6" r="3.8" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
