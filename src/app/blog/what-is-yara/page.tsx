import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";

const title = `What Is YARA and Why Security Teams Use It | ${APP_NAME}`;
const description =
  "Learn what YARA is, how its pattern-matching rules work, and why security teams rely on it for malware detection, threat hunting, and container image inspection.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "YARA",
    "YARA rules",
    "malware detection",
    "pattern matching",
    "threat hunting",
    "container scanning",
    "deep scanning",
    "ScanRook",
  ],
  alternates: {
    canonical: "/blog/what-is-yara",
  },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/what-is-yara",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "What Is YARA and Why Security Teams Use It",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/what-is-yara",
  datePublished: "2026-02-27",
  dateModified: "2026-02-27",
};

export default function WhatIsYaraPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 grid gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="surface-card p-8 grid gap-6">
        <header className="grid gap-3">
          <div className="text-xs uppercase tracking-wide muted">
            Deep scanning
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            What Is YARA and Why Security Teams Use It
          </h1>
          <p className="text-sm muted">
            YARA is often described as the pattern-matching Swiss Army knife of
            the security world. It gives analysts a simple, declarative language
            for writing rules that identify and classify files based on textual
            or binary patterns. From malware research labs to production CI/CD
            pipelines, YARA rules are one of the most widely deployed tools for
            detecting known threats inside artifacts of every kind.
          </p>
        </header>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            History of YARA
          </h2>
          <p className="text-sm muted">
            YARA was created by Victor Alvarez while working at VirusTotal. He
            needed a way to describe malware families using textual or binary
            patterns so that samples could be classified automatically at scale.
            The project was open-sourced, and the name stands for &quot;Yet
            Another Recursive/Ridiculous Acronym&quot; -- a nod to the long
            tradition of recursive acronyms in computing.
          </p>
          <p className="text-sm muted">
            Since its release, YARA has been adopted by security teams
            worldwide. Antivirus vendors, threat intelligence platforms, incident
            response teams, and open-source scanning tools all rely on YARA
            rules as a common language for expressing indicators of compromise.
            Its simplicity and flexibility have made it the de facto standard for
            file-level pattern matching in security operations.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            How YARA Rules Work
          </h2>
          <p className="text-sm muted">
            A YARA rule has three main sections. The <strong>meta</strong>{" "}
            section contains descriptive information about the rule, such as its
            author, description, and threat category. The{" "}
            <strong>strings</strong> section defines the patterns to search for
            -- these can be plain text, hexadecimal byte sequences, or regular
            expressions. The <strong>condition</strong> section specifies the
            logic for when the rule should trigger, such as requiring all
            strings to match, any one string to match, or a minimum count.
          </p>
          <pre className="overflow-x-auto rounded bg-black/[.06] dark:bg-white/[.06] p-4 text-xs leading-relaxed">
            <code>{`rule detect_reverse_shell {
    meta:
        author = "security-team"
        description = "Detects common reverse shell patterns"
        severity = "critical"
    strings:
        $bash_tcp = "/dev/tcp/" ascii
        $nc_exec = "nc -e /bin" ascii
        $python_socket = "socket.socket" ascii
    condition:
        any of them
}`}</code>
          </pre>
          <p className="text-sm muted">
            When YARA evaluates a file against this rule, it scans the file
            contents for the defined string patterns and evaluates the condition.
            If the condition is satisfied, the rule fires and the match is
            reported along with the rule&apos;s metadata.
          </p>
          <figure className="surface-card p-4 overflow-x-auto">
            <svg
              viewBox="0 0 700 250"
              className="w-full"
              style={{ maxWidth: "700px" }}
              role="img"
              aria-label="How a YARA rule reaches a verdict. A rule is made of a meta section, a strings section listing patterns, and a condition. The engine scans every byte of the target file and records which of the rule's strings matched. The condition is then evaluated over those results, and only if it is true does the rule fire and produce a finding containing the rule name, file path, and matched strings."
            >
              <title>
                How a YARA rule reaches a verdict: rule sections, per-string scan results, condition
                evaluation, and the resulting finding.
              </title>

              <text x="93" y="20" textAnchor="middle" className="fill-current" fontSize="10" fontWeight="600">
                1. The rule
              </text>
              <text x="278" y="20" textAnchor="middle" className="fill-current" fontSize="10" fontWeight="600">
                2. Scan the file
              </text>
              <text x="455" y="20" textAnchor="middle" className="fill-current" fontSize="10" fontWeight="600">
                3. Evaluate
              </text>
              <text x="623" y="20" textAnchor="middle" className="fill-current" fontSize="10" fontWeight="600">
                4. Outcome
              </text>

              {/* 1. Rule anatomy */}
              <rect
                x="8"
                y="30"
                width="170"
                height="185"
                rx="10"
                className="fill-black/[.02] dark:fill-white/[.03] stroke-black/10 dark:stroke-white/10"
                strokeWidth="1"
              />
              <text x="93" y="47" textAnchor="middle" className="fill-current" fontSize="9" opacity="0.7">
                rule example_rule &#123; &hellip; &#125;
              </text>
              <rect
                x="16"
                y="54"
                width="154"
                height="34"
                rx="6"
                className="fill-black/[.05] dark:fill-white/[.08] stroke-black/10 dark:stroke-white/10"
                strokeWidth="1"
              />
              <text x="24" y="69" className="fill-current" fontSize="9" fontWeight="600">
                meta:
              </text>
              <text x="24" y="82" className="fill-current" fontSize="8" opacity="0.7">
                author &middot; description &middot; severity
              </text>
              <rect
                x="16"
                y="94"
                width="154"
                height="66"
                rx="6"
                className="fill-black/[.05] dark:fill-white/[.08] stroke-black/10 dark:stroke-white/10"
                strokeWidth="1"
              />
              <text x="24" y="109" className="fill-current" fontSize="9" fontWeight="600">
                strings:
              </text>
              <text x="24" y="123" className="fill-current" fontSize="8" opacity="0.7">
                $a &mdash; a text pattern
              </text>
              <text x="24" y="136" className="fill-current" fontSize="8" opacity="0.7">
                $b &mdash; a hex byte sequence
              </text>
              <text x="24" y="149" className="fill-current" fontSize="8" opacity="0.7">
                $c &mdash; a regular expression
              </text>
              <rect
                x="16"
                y="166"
                width="154"
                height="38"
                rx="6"
                className="fill-[var(--dg-accent,#2563eb)]/[.08] stroke-[var(--dg-accent,#2563eb)]"
                strokeWidth="1.5"
              />
              <text x="24" y="181" className="fill-current" fontSize="9" fontWeight="600">
                condition:
              </text>
              <text x="24" y="195" className="fill-current" fontSize="8" opacity="0.7">
                e.g. &ldquo;2 of them&rdquo;
              </text>

              <line x1="180" y1="95" x2="192" y2="95" className="stroke-current" strokeWidth="1.5" opacity="0.35" />
              <polygon points="192,90 199,95 192,100" className="fill-current" opacity="0.35" />

              {/* 2. Scan results */}
              <rect
                x="200"
                y="30"
                width="155"
                height="130"
                rx="10"
                className="fill-black/[.02] dark:fill-white/[.03] stroke-black/10 dark:stroke-white/10"
                strokeWidth="1"
              />
              <text x="278" y="50" textAnchor="middle" className="fill-current" fontSize="9" opacity="0.7">
                every byte of the file
              </text>
              <rect
                x="208"
                y="60"
                width="139"
                height="24"
                rx="6"
                className="fill-[var(--dg-accent,#2563eb)]/[.10] stroke-[var(--dg-accent,#2563eb)]"
                strokeWidth="1.5"
              />
              <text x="277" y="76" textAnchor="middle" className="fill-current" fontSize="9">
                $a matched
              </text>
              <rect
                x="208"
                y="92"
                width="139"
                height="24"
                rx="6"
                className="fill-[var(--dg-accent,#2563eb)]/[.10] stroke-[var(--dg-accent,#2563eb)]"
                strokeWidth="1.5"
              />
              <text x="277" y="108" textAnchor="middle" className="fill-current" fontSize="9">
                $b matched
              </text>
              <rect
                x="208"
                y="124"
                width="139"
                height="24"
                rx="6"
                className="fill-black/[.05] dark:fill-white/[.08] stroke-black/10 dark:stroke-white/10"
                strokeWidth="1"
                strokeDasharray="3 2"
              />
              <text x="277" y="140" textAnchor="middle" className="fill-current" fontSize="9" opacity="0.6">
                $c not found
              </text>

              <line x1="357" y1="95" x2="369" y2="95" className="stroke-current" strokeWidth="1.5" opacity="0.35" />
              <polygon points="369,90 376,95 369,100" className="fill-current" opacity="0.35" />

              {/* 3. Condition evaluation */}
              <rect
                x="377"
                y="30"
                width="155"
                height="130"
                rx="10"
                className="fill-black/[.02] dark:fill-white/[.03] stroke-black/10 dark:stroke-white/10"
                strokeWidth="1"
              />
              <text x="455" y="50" textAnchor="middle" className="fill-current" fontSize="9" opacity="0.7">
                the condition, not the hits
              </text>
              <text x="455" y="78" textAnchor="middle" className="fill-current" fontSize="9.5">
                matched: $a, $b
              </text>
              <text x="455" y="100" textAnchor="middle" className="fill-current" fontSize="9.5">
                required: 2 of them
              </text>
              <text
                x="455"
                y="126"
                textAnchor="middle"
                className="fill-[var(--dg-accent,#2563eb)]"
                fontSize="10.5"
                fontWeight="600"
              >
                condition is true
              </text>

              <line x1="534" y1="95" x2="546" y2="95" className="stroke-current" strokeWidth="1.5" opacity="0.35" />
              <polygon points="546,90 553,95 546,100" className="fill-current" opacity="0.35" />

              {/* 4. Outcome */}
              <rect
                x="554"
                y="30"
                width="138"
                height="130"
                rx="10"
                className="fill-[var(--dg-accent,#2563eb)]/[.06] stroke-[var(--dg-accent,#2563eb)]"
                strokeWidth="1.5"
              />
              <text x="623" y="52" textAnchor="middle" className="fill-current" fontSize="10.5" fontWeight="600">
                Rule fires
              </text>
              <text x="623" y="72" textAnchor="middle" className="fill-current" fontSize="8.5" opacity="0.7">
                The finding records:
              </text>
              <text x="570" y="92" className="fill-current" fontSize="9">
                &middot; rule name
              </text>
              <text x="570" y="110" className="fill-current" fontSize="9">
                &middot; file path
              </text>
              <text x="570" y="128" className="fill-current" fontSize="9">
                &middot; matched strings
              </text>

              <text x="8" y="238" className="fill-current" fontSize="9" opacity="0.65">
                If the condition evaluates false, nothing is reported &mdash; matched strings alone
                are not a finding.
              </text>
            </svg>
            <figcaption className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Structural diagram of YARA&apos;s matching logic, using a three-string rule with a
              &ldquo;2 of them&rdquo; condition as the worked example. The point it makes is that
              the <em>condition</em> decides the verdict, not the raw number of string hits: the
              same set of matches would produce no finding under a stricter condition such as
              &ldquo;all of them.&rdquo;
            </figcaption>
          </figure>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Common Use Cases
          </h2>
          <p className="text-sm muted">
            YARA rules are used across a wide range of security workflows:
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>
              <strong>Malware detection</strong> -- identifying known malware
              families by their unique byte patterns, strings, or structural
              characteristics.
            </li>
            <li>
              <strong>Incident response triage</strong> -- quickly classifying
              suspicious files during an investigation to determine what
              category of threat they belong to.
            </li>
            <li>
              <strong>Threat hunting</strong> -- scanning file systems,
              network captures, and memory dumps for indicators of compromise
              that match known threat intelligence.
            </li>
            <li>
              <strong>CI/CD security gates</strong> -- running YARA rules
              against build artifacts before deployment to catch threats that
              package-level scanning would miss.
            </li>
            <li>
              <strong>Container image inspection</strong> -- scanning the full
              filesystem of a container image for malicious payloads that were
              injected during the build process or pulled in through compromised
              base images.
            </li>
          </ul>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            YARA in Container Scanning
          </h2>
          <p className="text-sm muted">
            Traditional container scanners focus almost exclusively on checking
            installed package versions against vulnerability databases like the
            NVD and OSV. This approach catches known CVEs in declared
            dependencies, but it has a blind spot: it cannot detect threats that
            exist as standalone files within the image filesystem.
          </p>
          <p className="text-sm muted">
            YARA fills this gap by enabling detection of threats that
            package-level scanning misses entirely:
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>
              <strong>Embedded crypto miners</strong> -- binaries like xmrig or
              custom mining tools dropped into image layers.
            </li>
            <li>
              <strong>Web shells</strong> -- PHP, JSP, or ASP scripts planted in
              web-accessible directories within application images.
            </li>
            <li>
              <strong>Reverse shell backdoors</strong> -- scripts or binaries
              that establish outbound connections to attacker-controlled
              infrastructure.
            </li>
            <li>
              <strong>Hardcoded secrets and API keys</strong> -- credentials
              embedded directly in configuration files or application code
              baked into the image.
            </li>
            <li>
              <strong>Obfuscated malicious payloads</strong> -- base64-encoded
              or otherwise obfuscated code that YARA can detect through
              characteristic encoding patterns and entropy analysis.
            </li>
          </ul>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            How ScanRook Integrates YARA
          </h2>
          <p className="text-sm muted">
            ScanRook supports YARA scanning through its deep scan mode. When
            invoked with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              --mode deep
            </code>
            , ScanRook extracts the full container filesystem from the image tar
            and applies YARA rules against every file in the extracted tree.
            This runs alongside the standard package-level vulnerability
            enrichment, so a single scan produces both CVE findings from package
            analysis and threat findings from YARA pattern matching.
          </p>
          <p className="text-sm muted">
            ScanRook ships with a set of bundled default rules that cover common
            threat categories including crypto miners, web shells, reverse
            shells, and credential patterns. For teams with their own threat
            intelligence, custom YARA rules can be supplied via the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              --yara path/to/rules/
            </code>{" "}
            flag. ScanRook will load all{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              .yar
            </code>{" "}
            and{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              .yara
            </code>{" "}
            files from the specified directory and apply them alongside the
            defaults.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Example: Detecting a Crypto Miner
          </h2>
          <p className="text-sm muted">
            Consider a Docker image based on Alpine that has been tampered with
            to include an xmrig binary. The Dockerfile looks innocent -- it
            installs standard packages and copies application code -- but a
            compromised build step has embedded the mining binary at{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              /usr/local/bin/.sysupdate
            </code>
            . A standard package-version scanner would report zero findings
            because xmrig is not an installed package; it&apos;s a standalone
            binary dropped into the filesystem.
          </p>
          <p className="text-sm muted">
            A YARA rule targeting crypto miners can match on characteristic
            strings like mining pool connection URLs, stratum protocol
            identifiers, or xmrig&apos;s own configuration keys:
          </p>
          <pre className="overflow-x-auto rounded bg-black/[.06] dark:bg-white/[.06] p-4 text-xs leading-relaxed">
            <code>{`rule crypto_miner_indicators {
    meta:
        description = "Detects crypto mining tool indicators"
        severity = "high"
    strings:
        $pool = "stratum+tcp://" ascii
        $xmrig = "xmrig" ascii nocase
        $mining = "mining.pool" ascii
        $wallet = /[13][a-km-zA-HJ-NP-Z1-9]{25,34}/ ascii
    condition:
        2 of them
}`}</code>
          </pre>
          <p className="text-sm muted">
            When ScanRook runs a deep scan against the image tar, it extracts
            all layers, reconstructs the filesystem, and applies this rule
            against every file. The hidden binary at{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              /usr/local/bin/.sysupdate
            </code>{" "}
            matches on both the stratum protocol string and the xmrig
            identifier. ScanRook reports the finding with the matched rule name,
            the file path, and the matched strings as evidence, giving the
            security team exactly what they need to investigate and remediate.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Getting Started with YARA in ScanRook
          </h2>
          <p className="text-sm muted">
            Running a deep scan with YARA is straightforward. Use the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              --mode deep
            </code>{" "}
            flag to enable filesystem-level scanning with the bundled rules:
          </p>
          <pre className="overflow-x-auto rounded bg-black/[.06] dark:bg-white/[.06] p-4 text-xs leading-relaxed">
            <code>{`# Deep scan with bundled YARA rules
scanrook scan --file image.tar --mode deep --format json

# Deep scan with custom rules directory
scanrook scan --file image.tar --mode deep --yara ./my-rules/ --format json

# Deep scan with both JSON report and text summary
scanrook scan --file image.tar --mode deep --format json --out report.json`}</code>
          </pre>
          <p className="text-sm muted">
            YARA findings appear in the report alongside CVE findings from
            package-level analysis. Each YARA finding includes the rule name,
            matched file path, matched strings, and the severity level defined
            in the rule&apos;s metadata. This gives teams a single, unified view
            of both known vulnerabilities and behavioral threats in their
            container images.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Further Reading
          </h2>
          <p className="text-sm muted">
            The official YARA documentation at virustotal.github.io/yara
            provides a comprehensive reference for rule syntax, modules, and
            advanced features.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link className="btn-secondary" href="/docs/concepts/deep-scanning">
              Deep scanning docs
            </Link>
            <Link
              className="btn-secondary"
              href="/blog/container-scanning-best-practices"
            >
              Container scanning best practices
            </Link>
            <Link className="btn-secondary" href="/blog">
              Back to blog
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
