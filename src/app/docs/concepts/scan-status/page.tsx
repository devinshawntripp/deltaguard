import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scan Status Troubleshooting",
  description:
    "What different scan statuses mean in ScanRook and how to resolve common issues.",
};

function SectionHeader({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="grid gap-1">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm muted">{blurb}</p>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-black/[.07] dark:bg-white/[.08] px-1.5 py-0.5 text-xs font-mono">
      {children}
    </code>
  );
}

type StatusRow = { status: string; meaning: string; action: string };
const statuses: StatusRow[] = [
  {
    status: "done",
    meaning:
      "Scan completed successfully. All stages finished without errors.",
    action:
      "No action needed. View findings in the scan results page.",
  },
  {
    status: "partial_failed",
    meaning:
      "Scan partially completed but one or more stages failed. Some findings may still be available.",
    action:
      "Check the scan events log for the specific stage that failed. See common scenarios below.",
  },
  {
    status: "failed",
    meaning:
      "Scan did not complete. No findings were produced.",
    action:
      "Check the scan events log for the error. Verify that the uploaded file is a supported format and that the file path is correct.",
  },
];

type PkgManagerRow = { manager: string; distros: string };
const packageManagers: PkgManagerRow[] = [
  {
    manager: "RPM",
    distros: "RHEL, CentOS, Rocky, AlmaLinux, Fedora, Amazon Linux, Oracle Linux",
  },
  { manager: "dpkg", distros: "Debian, Ubuntu" },
  { manager: "APK", distros: "Alpine, Chainguard, Wolfi" },
  { manager: "npm", distros: "Node.js projects" },
  { manager: "pip", distros: "Python projects" },
  { manager: "Go modules", distros: "Go projects" },
  { manager: "Maven", distros: "Java projects" },
  { manager: "Cargo", distros: "Rust projects" },
  { manager: "RubyGems", distros: "Ruby projects" },
  { manager: "Composer", distros: "PHP projects" },
  { manager: "Hex", distros: "Elixir/Erlang projects" },
  { manager: "Pub", distros: "Dart/Flutter projects" },
];

export default function ScanStatusPage() {
  return (
    <article className="grid gap-6">
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Scan Status Troubleshooting
        </h1>
        <p className="muted text-sm max-w-3xl">
          Every scan job moves through a state machine:{" "}
          <Code>queued</Code> to <Code>running</Code> to a terminal status.
          This page explains what each terminal status means, common failure
          scenarios, and how to resolve them.
        </p>
      </section>

      {/* Status definitions */}
      <section className="surface-card p-7 grid gap-6">
        <SectionHeader
          title="Scan statuses"
          blurb="Terminal statuses that appear once a scan finishes processing."
        />
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-left muted border-b border-black/10 dark:border-white/10">
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 pr-4 font-medium">Meaning</th>
                <th className="pb-2 font-medium">What to do</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {statuses.map((row) => (
                <tr key={row.status}>
                  <td className="py-2.5 pr-4 font-mono font-medium">
                    {row.status}
                  </td>
                  <td className="py-2.5 pr-4 muted">{row.meaning}</td>
                  <td className="py-2.5 muted">{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Common partial_failed scenarios */}
      <section className="surface-card p-7 grid gap-6">
        <SectionHeader
          title="Common partial_failed scenarios"
          blurb="The most frequent reasons a scan ends in partial_failed and how to fix them."
        />
        <div className="grid gap-4">
          {[
            {
              title: "Missing installed inventory (deep mode)",
              fields: [
                { label: "inventory_status", value: "missing" },
                {
                  label: "inventory_reason",
                  value: "deep_mode_requires_installed_inventory",
                },
              ],
              explanation:
                "The image has no recognizable package manager database. This happens with minimal base images (e.g., CentOS 7 minimal), scratch images, and distroless images. Deep mode requires an installed package inventory to operate.",
              recommendations: [
                "Use --mode light instead of --mode deep. Light mode detects packages from the installed database only and does not require a full inventory.",
                "Switch to a base image that includes a package manager (e.g., use alpine:3.20 instead of scratch).",
              ],
            },
            {
              title: "Zero findings with partial_failed",
              fields: [
                { label: "scan_status", value: "partial_failed" },
                { label: "findings", value: "0" },
              ],
              explanation:
                "The scanner could not detect any packages in the image. The image may be empty, use a custom or unsupported package format, or contain only static binaries with no metadata.",
              recommendations: [
                "Verify the image is not empty or a scratch-based image with no installed packages.",
                "Check if the package format is in the supported list below.",
                "For static binaries, use the bin subcommand instead of container scanning.",
              ],
            },
          ].map((scenario) => (
            <div
              key={scenario.title}
              className="rounded-xl border border-black/10 dark:border-white/10 p-5 grid gap-3"
            >
              <span className="font-semibold text-sm">{scenario.title}</span>
              <div className="rounded-lg bg-black/[.04] dark:bg-white/[.04] border border-black/10 dark:border-white/10 p-4 text-xs font-mono muted grid gap-0.5">
                {scenario.fields.map((f) => (
                  <div key={f.label}>
                    {f.label}: &quot;{f.value}&quot;
                  </div>
                ))}
              </div>
              <p className="text-sm muted">{scenario.explanation}</p>
              <ul className="grid gap-1">
                {scenario.recommendations.map((r) => (
                  <li key={r} className="text-xs muted flex gap-1.5">
                    <span className="mt-0.5 opacity-40">&bull;</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* File not found errors */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="File not found errors"
          blurb="When a scan fails immediately with only a few events logged."
        />
        <p className="text-sm muted">
          If a scan shows <Code>failed</Code> status with only 2 events in the
          log, the scanner was unable to locate or read the uploaded file. This
          is usually caused by an incorrect file path or a missing file
          extension.
        </p>
        <ul className="grid gap-1">
          {[
            "Verify the uploaded file path includes the correct extension (.tar, .tar.gz, .iso).",
            "Check that the file was fully uploaded before the scan was triggered.",
            "If using the API directly, confirm the S3 bucket and key match what was passed to the job.",
          ].map((tip) => (
            <li key={tip} className="text-xs muted flex gap-1.5">
              <span className="mt-0.5 opacity-40">&bull;</span>
              {tip}
            </li>
          ))}
        </ul>
      </section>

      {/* Deep vs Light mode */}
      <section className="surface-card p-7 grid gap-6">
        <SectionHeader
          title="Deep vs Light mode"
          blurb="Understanding when to use each scan mode."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              mode: "Light",
              flag: "--mode light",
              color: "#059669",
              notes: [
                "Default scan mode",
                "Detects packages from the installed package database only",
                "Fast and accurate for most container images",
                "Works with minimal images that have a package manager",
                "No additional requirements beyond a recognized package DB",
              ],
            },
            {
              mode: "Deep",
              flag: "--mode deep",
              color: "#dc2626",
              notes: [
                "Extended scan with YARA rules (if available)",
                "Requires installed inventory to be present in the image",
                "Fails with deep_mode_requires_installed_inventory if the image has no package DB",
                "Use for thorough analysis of full OS images",
                "Not recommended for scratch or distroless images",
              ],
            },
          ].map((m) => (
            <div
              key={m.mode}
              className="rounded-xl border border-black/10 dark:border-white/10 p-5 grid gap-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: m.color }}
                >
                  {m.mode[0]}
                </span>
                <span className="font-semibold text-sm">{m.mode}</span>
              </div>
              <Code>{m.flag}</Code>
              <ul className="grid gap-1">
                {m.notes.map((n) => (
                  <li key={n} className="text-xs muted flex gap-1.5">
                    <span className="mt-0.5 opacity-40">&bull;</span>
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-xs muted border-t border-black/10 dark:border-white/10 pt-4">
          If you are unsure which mode to use, start with <Code>--mode light</Code>.
          It covers the vast majority of scanning use cases and will not fail on
          images that lack a full package inventory.
        </p>
      </section>

      {/* Supported package managers */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Supported package managers"
          blurb="ScanRook can detect and inventory packages from these ecosystems."
        />
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-left muted border-b border-black/10 dark:border-white/10">
                <th className="pb-2 pr-4 font-medium">Package manager</th>
                <th className="pb-2 font-medium">Distributions / ecosystems</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {packageManagers.map((row) => (
                <tr key={row.manager}>
                  <td className="py-2.5 pr-4 font-mono font-medium">
                    {row.manager}
                  </td>
                  <td className="py-2.5 muted">{row.distros}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs muted">
          If your image uses a package format not listed above, the scanner will
          not be able to detect packages and the scan may end
          in <Code>partial_failed</Code> with zero findings.
        </p>
      </section>
    </article>
  );
}
