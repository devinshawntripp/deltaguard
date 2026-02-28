import type { Metadata } from "next";
import CodeCopyBlock from "@/components/CodeCopyBlock";

export const metadata: Metadata = {
  title: "CLI Reference",
  description:
    "Complete reference for all ScanRook CLI subcommands, flags, environment variables, and example invocations.",
};

type EnvVar = {
  name: string;
  purpose: string;
  default?: string;
};

const envVars: EnvVar[] = [
  { name: "NVD_API_KEY", purpose: "NVD API key for enrichment (also via --nvd-api-key flag)" },
  { name: "DATABASE_URL", purpose: "PostgreSQL connection string for CVE caching" },
  { name: "SCANNER_CACHE", purpose: "Override cache directory", default: "~/.scanrook/cache" },
  { name: "SCANNER_SKIP_CACHE", purpose: "Set to 1 to disable file caching", default: "(unset)" },
  { name: "SCANNER_NVD_ENRICH", purpose: "Toggle NVD enrichment (0 to disable)", default: "1" },
  { name: "SCANNER_OSV_ENRICH", purpose: "Toggle OSV enrichment (0 to disable)", default: "1" },
  { name: "SCANNER_FORCE_IPV4", purpose: "Force IPv4 for outbound HTTP requests", default: "true" },
  { name: "SCANNER_LOG_FORMAT", purpose: "Log format for progress output", default: "text" },
  { name: "SCANNER_LOG_LEVEL", purpose: "Minimum log level for progress output", default: "info" },
  { name: "SCANNER_PROGRESS_STDERR", purpose: "Emit progress events to stderr", default: "(auto)" },
  { name: "SCANNER_PROGRESS_COMPACT", purpose: "Use compact live panel for interactive terminals", default: "(auto)" },
  { name: "SCANNER_PROGRESS_MAX_LINES", purpose: "Max lines shown in compact progress panel", default: "8" },
];

export default function CliReferencePage() {
  return (
    <article className="grid gap-6">
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">CLI Reference</h1>
        <p className="muted text-sm max-w-3xl">
          Complete reference for the <code>scanrook</code> CLI. All subcommands,
          flags, defaults, environment variables, and example invocations.
        </p>
      </section>

      {/* Global flags */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader title="Global flags" blurb="These flags apply to all subcommands." />
        <FlagTable
          flags={[
            { flag: "--cache-dir <DIR>", description: "Cache directory for API results and SBOMs", default: "~/.scanrook/cache" },
            { flag: "--yara <FILE>", description: "YARA rules file for deep scans", default: "(none)" },
            { flag: "--nvd-api-key <KEY>", description: "NVD API key for enrichment", default: "$NVD_API_KEY" },
            { flag: "--api-base <URL>", description: "ScanRook API base URL for CLI auth/limits", default: "https://scanrook.io" },
            { flag: "--api-key <KEY>", description: "ScanRook API key (overrides saved config)", default: "(saved config)" },
            { flag: "--progress", description: "Emit progress events to stderr", default: "false" },
            { flag: "--progress-file <FILE>", description: "Write NDJSON progress events to a file", default: "(none)" },
            { flag: "--log-format <text|json>", description: "Log output format for stderr progress", default: "text" },
            { flag: "--log-level <error|warn|info|debug>", description: "Log verbosity threshold", default: "info" },
          ]}
        />
      </section>

      {/* scan */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader title="scanrook scan" blurb="Smart scan: auto-detect file type (container tar, source tar, ISO, or binary) and produce a report. Accepts either a local file path or a Docker/OCI image reference." />
        <FlagTable
          flags={[
            { flag: "-f, --file <PATH>", description: "Path to file (tar/tar.gz/tar.bz2/iso/bin)", default: "(required unless --image)" },
            { flag: "--image <REF>", description: "Docker/OCI image reference to scan (e.g., alpine:3.20, ubuntu:latest). Pulls and saves the image automatically.", default: "(required unless --file)" },
            { flag: "--format <json|text>", description: "Output format", default: "json" },
            { flag: "--out <PATH>", description: "Output file for JSON format", default: "(stdout)" },
            { flag: "--refs", description: "Include references in report", default: "false" },
            { flag: "--mode <light|deep>", description: "Scan mode (deep enables YARA if available)", default: "light" },
            { flag: "--oval-redhat <PATH>", description: "Red Hat OVAL XML for fixed checks in RPM scans", default: "(none)" },
          ]}
        />
        <CodeCopyBlock
          label="Example (local file)"
          code="scanrook scan --file ./myapp.tar --mode deep --format json --out report.json"
        />
        <CodeCopyBlock
          label="Example (image reference)"
          code="scanrook scan --image alpine:3.20 --format json --out report.json"
        />
      </section>

      {/* container */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader title="scanrook container" blurb="Scan a container image from a saved tar archive." />
        <FlagTable
          flags={[
            { flag: "-t, --tar <PATH>", description: "Path to container tar", default: "(required)" },
            { flag: "--mode <light|deep>", description: "Scan mode", default: "light" },
            { flag: "--format <json|text>", description: "Output format", default: "text" },
            { flag: "--out <PATH>", description: "Output file for JSON format", default: "(stdout)" },
            { flag: "--sbom", description: "Generate SBOM using syft and include in report", default: "false" },
            { flag: "--oval-redhat <PATH>", description: "Red Hat OVAL XML for fixed checks", default: "(none)" },
          ]}
        />
        <CodeCopyBlock
          label="Example"
          code="scanrook container --tar ./image.tar --sbom --format json --out report.json"
        />
      </section>

      {/* bin */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader title="scanrook bin" blurb="Scan a binary file (ELF, PE, or Mach-O)." />
        <FlagTable
          flags={[
            { flag: "-p, --path <PATH>", description: "Path to binary file", default: "(required)" },
            { flag: "--format <json|text>", description: "Output format", default: "text" },
            { flag: "--out <PATH>", description: "Output file for JSON format", default: "(stdout)" },
            { flag: "--mode <light|deep>", description: "Scan mode", default: "light" },
          ]}
        />
        <CodeCopyBlock
          label="Example"
          code="scanrook bin --path ./myapp --format json --out report.json"
        />
      </section>

      {/* source */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader title="scanrook source" blurb="Scan a source code tarball for dependency vulnerabilities." />
        <FlagTable
          flags={[
            { flag: "-t, --tar <PATH>", description: "Path to source tarball", default: "(required)" },
            { flag: "--format <json|text>", description: "Output format", default: "text" },
            { flag: "--out <PATH>", description: "Output file for JSON format", default: "(stdout)" },
          ]}
        />
        <CodeCopyBlock
          label="Example"
          code="scanrook source --tar ./project.tar.gz --format json --out report.json"
        />
      </section>

      {/* license */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader title="scanrook license" blurb="Detect the software license of a file or project directory." />
        <FlagTable
          flags={[
            { flag: "-p, --path <PATH>", description: "Path to file or directory to scan for license", default: "(required)" },
          ]}
        />
        <CodeCopyBlock
          label="Example"
          code="scanrook license --path ./project/"
        />
      </section>

      {/* sbom import */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader title="scanrook sbom import" blurb="Import an SBOM (CycloneDX JSON, SPDX JSON, or Syft JSON) and enrich with vulnerability data." />
        <FlagTable
          flags={[
            { flag: "-f, --file <PATH>", description: "Path to SBOM JSON", default: "(required)" },
            { flag: "--format <json|text>", description: "Output format", default: "json" },
            { flag: "--out <PATH>", description: "Output file", default: "(stdout)" },
            { flag: "--mode <light|deep>", description: "Scan mode", default: "light" },
            { flag: "--refs", description: "Include references in report", default: "false" },
          ]}
        />
        <CodeCopyBlock
          label="Example"
          code="scanrook sbom import --file ./sbom.cdx.json --format json --out sbom-report.json"
        />
      </section>

      {/* sbom diff */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader title="scanrook sbom diff" blurb="Compare two SBOM snapshots to track package changes over time." />
        <FlagTable
          flags={[
            { flag: "--baseline <PATH>", description: "Baseline SBOM JSON path", default: "(required)" },
            { flag: "--current <PATH>", description: "Current SBOM JSON path", default: "(required)" },
            { flag: "--json", description: "Emit JSON diff output", default: "false" },
            { flag: "--out <PATH>", description: "Output file", default: "(stdout)" },
          ]}
        />
        <CodeCopyBlock
          label="Example"
          code="scanrook sbom diff --baseline ./sbom-prev.json --current ./sbom-new.json --json --out diff.json"
        />
      </section>

      {/* sbom policy */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader title="scanrook sbom policy" blurb="Check an SBOM diff against a policy file. Exits with code 1 if the policy is violated." />
        <FlagTable
          flags={[
            { flag: "--policy <PATH>", description: "Path to policy file (YAML or JSON)", default: "(required)" },
            { flag: "--diff <PATH>", description: "Path to diff JSON from sbom diff --json", default: "(required)" },
            { flag: "--report <PATH>", description: "Path to current scan report JSON (optional, used for severity checks)", default: "(none)" },
          ]}
        />
        <CodeCopyBlock
          label="Example"
          code="scanrook sbom policy --policy ./policy.yaml --diff ./diff.json --report ./report.json"
        />
      </section>

      {/* db subcommands */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader title="scanrook db" blurb="Manage the local vulnerability cache." />

        <div className="grid gap-4">
          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">db status</h3>
            <p className="text-xs muted">Show local cache path and size.</p>
            <CodeCopyBlock label="Example" code="scanrook db status" />
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">db check</h3>
            <p className="text-xs muted">Check local cache, remote source connectivity, and PostgreSQL cache health.</p>
            <CodeCopyBlock label="Example" code="scanrook db check" />
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">db sources</h3>
            <p className="text-xs muted">List vulnerability data sources ScanRook uses (active and planned).</p>
            <FlagTable flags={[{ flag: "--json", description: "Emit JSON output", default: "false" }]} />
            <CodeCopyBlock label="Example" code="scanrook db sources --json" />
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">db clear</h3>
            <p className="text-xs muted">Remove local cache contents.</p>
            <CodeCopyBlock label="Example" code="scanrook db clear" />
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">db update</h3>
            <p className="text-xs muted">Refresh selected source caches. Optionally warm up with an artifact scan.</p>
            <FlagTable
              flags={[
                { flag: "--source <all|nvd|osv|redhat>", description: "Source to refresh", default: "all" },
                { flag: "-f, --file <PATH>", description: "Optional artifact path for scan-driven warm-up", default: "(none)" },
                { flag: "--mode <light|deep>", description: "Scan mode if --file is provided", default: "deep" },
                { flag: "--cve <ID>", description: "Optional CVE ID seed for NVD/OSV/Red Hat refresh", default: "(none)" },
                { flag: "--errata <ID>", description: "Optional Red Hat errata ID seed (e.g. RHSA-2022:8162)", default: "(none)" },
              ]}
            />
            <CodeCopyBlock label="Example" code="scanrook db update --source all --file ./myapp.tar" />
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">db download</h3>
            <p className="text-xs muted">Download and pre-warm local vulnerability DB/cache for an artifact.</p>
            <FlagTable
              flags={[
                { flag: "-f, --file <PATH>", description: "Artifact path to prefetch advisories for", default: "(required)" },
                { flag: "--mode <light|deep>", description: "Scan mode during prefetch", default: "deep" },
              ]}
            />
            <CodeCopyBlock label="Example" code="scanrook db download --file ./myapp.tar" />
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">db warm</h3>
            <p className="text-xs muted">Pre-warm local cache by scanning an artifact.</p>
            <FlagTable
              flags={[
                { flag: "-f, --file <PATH>", description: "Artifact path for warm-up", default: "(required)" },
                { flag: "--mode <light|deep>", description: "Scan mode during warm-up", default: "deep" },
              ]}
            />
            <CodeCopyBlock label="Example" code="scanrook db warm --file ./myapp.tar" />
          </div>
        </div>
      </section>

      {/* benchmark */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader title="scanrook benchmark" blurb="Benchmark ScanRook against Trivy and Grype on the same artifact." />
        <FlagTable
          flags={[
            { flag: "-f, --file <PATH>", description: "Artifact path (tar/iso/bin)", default: "(required)" },
            { flag: "--out-dir <DIR>", description: "Output directory for summary.csv and tool JSON outputs", default: "benchmark-out" },
            { flag: "--profile <warm|cold|no-cache>", description: "Benchmark profile", default: "warm" },
          ]}
        />
        <CodeCopyBlock
          label="Example"
          code="scanrook benchmark --file ./myapp.tar --profile cold --out-dir ./bench-results"
        />
      </section>

      {/* diff */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader title="scanrook diff" blurb="Diff CVE IDs between a ScanRook report and another scanner's output." />
        <FlagTable
          flags={[
            { flag: "--ours <PATH>", description: "ScanRook report JSON path", default: "(required)" },
            { flag: "--against <PATH>", description: "Other report JSON path (Trivy/Grype/ScanRook)", default: "(required)" },
            { flag: "--out <PATH>", description: "Optional JSON output for full diff details", default: "(none)" },
          ]}
        />
        <CodeCopyBlock
          label="Example"
          code="scanrook diff --ours ./scanrook-report.json --against ./trivy-report.json --out diff.json"
        />
      </section>

      {/* auth */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader title="scanrook auth" blurb="Authentication and local CLI credential management." />

        <div className="grid gap-4">
          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">auth login</h3>
            <p className="text-xs muted">Save an API key or start the device authorization flow.</p>
            <FlagTable
              flags={[
                { flag: "--api-key <KEY>", description: "API key to save", default: "(device flow)" },
                { flag: "--api-base <URL>", description: "API base URL", default: "https://scanrook.io" },
              ]}
            />
            <CodeCopyBlock label="Example" code="scanrook auth login --api-key sr_live_abc123" />
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">auth logout</h3>
            <p className="text-xs muted">Remove stored API key from local configuration.</p>
            <CodeCopyBlock label="Example" code="scanrook auth logout" />
          </div>
        </div>
      </section>

      {/* whoami, limits, config */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader title="Other commands" blurb="Identity, limits, and configuration management." />

        <div className="grid gap-4">
          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">scanrook whoami</h3>
            <p className="text-xs muted">Show current caller identity against the ScanRook API.</p>
            <FlagTable flags={[{ flag: "--json", description: "Emit JSON output", default: "false" }]} />
            <CodeCopyBlock label="Example" code="scanrook whoami --json" />
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">scanrook limits</h3>
            <p className="text-xs muted">Show cloud-enrichment limit status and remaining quota.</p>
            <FlagTable flags={[{ flag: "--json", description: "Emit JSON output", default: "false" }]} />
            <CodeCopyBlock label="Example" code="scanrook limits" />
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">scanrook config set</h3>
            <p className="text-xs muted">Set a config value. Key-value pairs are persisted to the local config file.</p>
            <CodeCopyBlock label="Example" code="scanrook config set telemetry.opt_in true" />
          </div>
        </div>
      </section>

      {/* Environment variables */}
      <section className="surface-card p-7 grid gap-4 overflow-x-auto">
        <SectionHeader title="Environment variables" blurb="All SCANNER_* environment variables recognized by the CLI." />
        <table className="w-full text-sm border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10">
              <th className="text-left py-2 pr-4">Variable</th>
              <th className="text-left py-2 pr-4">Purpose</th>
              <th className="text-left py-2">Default</th>
            </tr>
          </thead>
          <tbody>
            {envVars.map((v) => (
              <tr key={v.name} className="border-b border-black/5 dark:border-white/5 align-top">
                <td className="py-2 pr-4"><code className="text-xs">{v.name}</code></td>
                <td className="py-2 pr-4 muted">{v.purpose}</td>
                <td className="py-2 muted"><code className="text-xs">{v.default || "--"}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
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

function FlagTable({ flags }: { flags: Array<{ flag: string; description: string; default?: string }> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-black/10 dark:border-white/10">
            <th className="text-left py-1.5 pr-4">Flag</th>
            <th className="text-left py-1.5 pr-4">Description</th>
            <th className="text-left py-1.5">Default</th>
          </tr>
        </thead>
        <tbody>
          {flags.map((f) => (
            <tr key={f.flag} className="border-b border-black/5 dark:border-white/5 align-top">
              <td className="py-1.5 pr-4"><code className="text-xs whitespace-nowrap">{f.flag}</code></td>
              <td className="py-1.5 pr-4 muted">{f.description}</td>
              <td className="py-1.5 muted"><code className="text-xs">{f.default || "--"}</code></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
