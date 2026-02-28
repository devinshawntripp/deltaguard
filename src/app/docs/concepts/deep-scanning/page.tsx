import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Deep Scanning",
  description:
    "How ScanRook uses YARA rules and deep scanning mode to detect embedded threats beyond package-level vulnerabilities.",
};

export default function DeepScanningPage() {
  return (
    <article className="grid gap-6">
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Deep Scanning
        </h1>
        <p className="muted text-sm max-w-3xl">
          Deep scanning is ScanRook&apos;s extended analysis mode that goes beyond
          package inventory matching. While the default light mode identifies
          known CVEs in installed packages, deep mode applies YARA pattern
          matching against extracted filesystem contents to detect embedded
          threats that package-level scanning cannot catch: crypto miners, web
          shells, reverse shells, leaked secrets, and anti-debugging techniques.
        </p>
      </section>

      {/* What Is YARA */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="What is YARA"
          blurb="A pattern-matching engine built for malware research and threat hunting."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            YARA is a pattern-matching tool created by Victor Alvarez at
            VirusTotal. It allows researchers to write rules that describe
            malware families, suspicious patterns, or any byte-level signatures
            of interest. Each rule consists of a set of strings (text, hex, or
            regex) and a boolean condition that determines when the rule fires.
          </p>
          <p>
            YARA is widely used across the security industry for malware
            classification, incident response, threat hunting, and artifact
            triage. Its rule language is simple enough for analysts to write by
            hand yet expressive enough to describe complex binary patterns.
          </p>
          <p>
            Learn more at the{" "}
            <a
              href="https://virustotal.github.io/yara/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              official YARA documentation
            </a>
            .
          </p>
        </div>
      </section>

      {/* How ScanRook Uses YARA */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="How ScanRook uses YARA"
          blurb="Applying pattern matching to extracted filesystem contents during deep scans."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            When you run ScanRook with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              --mode deep
            </code>
            , the scanner performs its standard package inventory and
            vulnerability enrichment pipeline, then adds a second pass: YARA
            rule scanning against every file extracted from the target artifact.
          </p>
          <p>
            This second pass catches threats that exist outside of package
            managers. A container image might have clean packages but contain a
            manually dropped crypto miner binary, a web shell planted in{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              /var/www
            </code>
            , or hardcoded AWS credentials in a configuration file. Package-level
            CVE matching cannot detect these because they are not part of any
            tracked package. YARA pattern matching fills this gap.
          </p>
          <p>
            YARA findings appear in the report alongside CVE findings, tagged
            with the rule name, matched file path, and matched strings. They use
            the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              HeuristicUnverified
            </code>{" "}
            confidence tier to distinguish them from confirmed vulnerability
            matches.
          </p>
        </div>
      </section>

      {/* Bundled Default Rules */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Bundled default rules"
          blurb="Out-of-the-box YARA rules that ship with ScanRook."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            ScanRook ships with a curated set of default YARA rules that cover
            common threat categories. These rules are community-sourced and
            regularly updated with each release.
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>
              <strong>Cryptocurrency mining indicators</strong> &mdash; detects
              Stratum protocol strings, known miner binary signatures, and
              mining pool configuration patterns
            </li>
            <li>
              <strong>Web shell detection</strong> &mdash; identifies PHP, JSP,
              and ASP web shells by matching eval/exec patterns, obfuscation
              techniques, and known web shell families
            </li>
            <li>
              <strong>Reverse shell patterns</strong> &mdash; catches common
              reverse shell payloads in bash, Python, Perl, and compiled
              binaries
            </li>
            <li>
              <strong>Hardcoded credentials and API keys</strong> &mdash; flags
              AWS access keys, private keys, database connection strings, and
              other secrets embedded in files
            </li>
            <li>
              <strong>Anti-debugging and packing indicators</strong> &mdash;
              detects UPX packing, ptrace-based anti-debug checks, and common
              binary obfuscation markers
            </li>
          </ul>
        </div>
      </section>

      {/* Writing Custom YARA Rules */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Writing custom YARA rules"
          blurb="Extend deep scanning with your own detection logic."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            YARA rules follow a structured format with three main blocks:{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              meta
            </code>{" "}
            for descriptive metadata,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              strings
            </code>{" "}
            for the patterns to match, and{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              condition
            </code>{" "}
            for the boolean logic that determines a match.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
            <code>{`rule detect_stratum_mining {
    meta:
        description = "Detects Stratum mining protocol usage"
        severity = "high"
        author = "ScanRook"
    strings:
        $stratum = "stratum+tcp://" ascii
        $stratum_ssl = "stratum+ssl://" ascii
        $mining_subscribe = "mining.subscribe" ascii
    condition:
        any of them
}`}</code>
          </pre>
          <p>
            Pass custom rules to ScanRook with the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              --yara
            </code>{" "}
            flag. You can point to a single{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              .yar
            </code>{" "}
            file or a directory containing multiple rule files. Custom rules run
            alongside the bundled defaults.
          </p>
        </div>
      </section>

      {/* Light vs Deep Mode */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Light vs deep mode"
          blurb="Choosing the right scan mode for your use case."
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10">
                <th className="text-left py-2 pr-4 font-semibold">Aspect</th>
                <th className="text-left py-2 pr-4 font-semibold">
                  Light mode{" "}
                  <span className="font-normal muted">(default)</span>
                </th>
                <th className="text-left py-2 font-semibold">Deep mode</th>
              </tr>
            </thead>
            <tbody className="muted">
              <tr className="border-b border-black/10 dark:border-white/10">
                <td className="py-2 pr-4 font-medium" style={{ color: "var(--dg-text)" }}>
                  What it scans
                </td>
                <td className="py-2 pr-4">
                  Package inventories (RPM, APK, npm, pip, Go, etc.)
                </td>
                <td className="py-2">
                  Package inventories + all extracted filesystem contents
                </td>
              </tr>
              <tr className="border-b border-black/10 dark:border-white/10">
                <td className="py-2 pr-4 font-medium" style={{ color: "var(--dg-text)" }}>
                  Detection method
                </td>
                <td className="py-2 pr-4">
                  Version matching against OSV, NVD, distro feeds
                </td>
                <td className="py-2">
                  Version matching + YARA pattern matching
                </td>
              </tr>
              <tr className="border-b border-black/10 dark:border-white/10">
                <td className="py-2 pr-4 font-medium" style={{ color: "var(--dg-text)" }}>
                  Speed
                </td>
                <td className="py-2 pr-4">Fast (seconds to low minutes)</td>
                <td className="py-2">Slower (depends on artifact size and rule count)</td>
              </tr>
              <tr className="border-b border-black/10 dark:border-white/10">
                <td className="py-2 pr-4 font-medium" style={{ color: "var(--dg-text)" }}>
                  CI/CD suitability
                </td>
                <td className="py-2 pr-4">Recommended for pipeline gates</td>
                <td className="py-2">Better suited for periodic audits</td>
              </tr>
              <tr className="border-b border-black/10 dark:border-white/10">
                <td className="py-2 pr-4 font-medium" style={{ color: "var(--dg-text)" }}>
                  Catches embedded threats
                </td>
                <td className="py-2 pr-4">No</td>
                <td className="py-2">Yes (crypto miners, web shells, secrets, etc.)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium" style={{ color: "var(--dg-text)" }}>
                  Requirements
                </td>
                <td className="py-2 pr-4">None beyond default install</td>
                <td className="py-2">
                  Requires{" "}
                  <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
                    libyara
                  </code>{" "}
                  installed on the system
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CLI Examples */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="CLI examples"
          blurb="Common invocations for deep scanning."
        />
        <div className="grid gap-3">
          <div>
            <p className="text-sm muted mb-1.5">
              Run a deep scan with bundled default rules:
            </p>
            <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
              <code>scanrook scan --file image.tar --mode deep</code>
            </pre>
          </div>
          <div>
            <p className="text-sm muted mb-1.5">
              Deep scan with a custom rules directory:
            </p>
            <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
              <code>scanrook scan --file image.tar --mode deep --yara custom-rules/</code>
            </pre>
          </div>
          <div>
            <p className="text-sm muted mb-1.5">
              Deep scan with a single custom rule file, outputting JSON:
            </p>
            <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
              <code>scanrook scan --file image.tar --mode deep --yara custom.yar --format json</code>
            </pre>
          </div>
        </div>
      </section>

      {/* When to Use Deep Scanning */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="When to use deep scanning"
          blurb="Scenarios where deep mode provides the most value."
        />
        <ul className="list-disc pl-6 text-sm muted grid gap-1">
          <li>
            <strong>Production image audits</strong> &mdash; scan images before
            deployment to production to catch threats that slipped past CI/CD
            light scans
          </li>
          <li>
            <strong>Incident response</strong> &mdash; when investigating a
            compromised container, deep scanning identifies dropped payloads,
            backdoors, and persistence mechanisms
          </li>
          <li>
            <strong>Base image validation</strong> &mdash; verify that upstream
            base images from public registries do not contain embedded malware
            or unwanted tooling
          </li>
          <li>
            <strong>Compliance requirements</strong> &mdash; regulatory
            frameworks that mandate malware scanning beyond CVE matching (e.g.,
            FedRAMP, PCI DSS)
          </li>
          <li>
            <strong>Third-party artifact inspection</strong> &mdash; when
            accepting container images, ISOs, or binaries from vendors or open
            source projects, deep scanning provides an additional layer of trust
            verification
          </li>
        </ul>
      </section>

      {/* Further Reading */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Further reading"
          blurb="Related documentation and resources."
        />
        <ul className="list-disc pl-6 text-sm muted grid gap-1">
          <li>
            <Link
              href="/docs/cli-reference"
              className="font-medium underline underline-offset-2"
            >
              CLI reference
            </Link>{" "}
            &mdash; full list of flags and subcommands
          </li>
          <li>
            <Link
              href="/docs/concepts/enrichment"
              className="font-medium underline underline-offset-2"
            >
              Enrichment
            </Link>{" "}
            &mdash; how ScanRook matches packages against vulnerability databases
          </li>
          <li>
            <Link
              href="/blog/what-is-yara"
              className="font-medium underline underline-offset-2"
            >
              What is YARA?
            </Link>{" "}
            &mdash; an in-depth blog post on YARA and its role in container
            security
          </li>
        </ul>
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
