import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";
import OsvLookup from "./OsvLookup";

const title = `What Is OSV? The Complete Guide to the Open Source Vulnerabilities Database | ${APP_NAME}`;
const description =
  "Learn everything about OSV (Open Source Vulnerabilities): the free API, advisory format, 24+ ecosystems, and how vulnerability scanners query it. Interactive lookup tool included.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "OSV",
    "Open Source Vulnerabilities",
    "OSV API",
    "vulnerability database",
    "osv.dev",
    "OSV format",
    "advisory format",
    "ecosystem vulnerabilities",
    "vulnerability scanner",
    "osv-scanner",
    "ScanRook",
  ],
  alternates: {
    canonical: "/blog/what-is-osv",
  },
  openGraph: {
    title: "What Is OSV? The Complete Guide to the Open Source Vulnerabilities Database",
    description,
    type: "article",
    url: "/blog/what-is-osv",
  },
  twitter: {
    card: "summary_large_image",
    title: "What Is OSV? The Complete Guide to the Open Source Vulnerabilities Database",
    description,
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline:
    "What Is OSV? The Complete Guide to the Open Source Vulnerabilities Database",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/what-is-osv",
  datePublished: "2026-02-27",
  dateModified: "2026-04-20",
};

const faqItems = [
  {
    q: "Is the OSV API free?",
    a: "Yes. The OSV API is completely free to use with no authentication required. There are no API keys, no rate limits published in the documentation, and no usage tiers. Google operates the infrastructure and makes the data available as a public good for the open source ecosystem.",
  },
  {
    q: "Does OSV require authentication?",
    a: "No. Unlike the NVD API (which rate-limits unauthenticated requests) or the GitHub Advisory API (which requires a GitHub token), the OSV API requires no authentication whatsoever. You can start querying immediately with a simple HTTP POST.",
  },
  {
    q: "How often is OSV updated?",
    a: "OSV is updated continuously. When an upstream ecosystem source publishes a new advisory, OSV typically ingests it within minutes. This is faster than the NVD, which often has a multi-day delay between a CVE being assigned and the full NVD entry being published.",
  },
  {
    q: "What is the difference between OSV and NVD?",
    a: "The NVD (National Vulnerability Database) is maintained by NIST and uses CPE identifiers to match vulnerabilities to products. OSV uses ecosystem-native package names and version ranges. OSV has lower false-positive rates for package scanning because it avoids the ambiguity of CPE matching, but NVD has broader coverage of non-open-source software.",
  },
  {
    q: "Can I use OSV for commercial products?",
    a: "Yes. OSV data is available under the CC-BY-4.0 license, which permits commercial use with attribution. The API itself has no commercial use restrictions. Many commercial vulnerability scanners, including Trivy, Grype, and ScanRook, use OSV as a primary data source.",
  },
  {
    q: "Does OSV cover all programming languages?",
    a: "OSV covers 24+ ecosystems, including all major programming languages: JavaScript (npm), Python (PyPI), Java (Maven), Go, Rust (crates.io), Ruby (RubyGems), PHP (Packagist), C# (.NET/NuGet), Dart (Pub), Elixir (Hex), and Swift. It also covers Linux distributions like Debian, Ubuntu, Alpine, and Rocky Linux.",
  },
  {
    q: "How do I report a vulnerability to OSV?",
    a: "You do not report vulnerabilities directly to OSV. Instead, you report to the upstream ecosystem source (e.g., file a GitHub Security Advisory, report to RustSec, or contact the Linux distribution's security team). OSV will automatically ingest the advisory once the upstream source publishes it.",
  },
  {
    q: "What is an OSV ecosystem?",
    a: "An ecosystem in OSV terminology is a package manager or software distribution that has its own naming and versioning scheme. For example, 'npm' is an ecosystem where packages are identified by their npm registry name. 'Debian' is an ecosystem where packages are identified by their Debian package name.",
  },
  {
    q: "Is OSV the same as the GitHub Advisory Database?",
    a: "No, but they are related. The GitHub Advisory Database (GHSA) is one of many data sources that OSV aggregates. OSV also includes data from Go Vulnerability Database, RustSec, Python Packaging Advisory Database, and over 20 other sources. GHSA data appears in OSV with GHSA- prefixed identifiers.",
  },
  {
    q: "How does OSV handle version ranges?",
    a: "OSV uses 'introduced' and 'fixed' events to define affected version ranges. The 'introduced' field marks the first vulnerable version, and 'fixed' marks the first version where the vulnerability was patched. OSV uses the ecosystem's native versioning scheme (semver for npm, PEP 440 for PyPI, etc.) to evaluate whether a given version falls within the affected range.",
  },
  {
    q: "Can I download the entire OSV database?",
    a: "Yes. Google provides a GCS (Google Cloud Storage) bucket at gs://osv-vulnerabilities that contains the entire database as individual JSON files, organized by ecosystem. You can also clone the osv.dev GitHub repository for the source code, or use the osv-scanner tool which can work with a local copy of the database.",
  },
  {
    q: "What is osv-scanner?",
    a: "osv-scanner is an official open-source tool built by Google that uses the OSV database to scan your project's dependencies for known vulnerabilities. It reads lockfiles (package-lock.json, go.sum, Cargo.lock, etc.) and checks each dependency against the OSV API. It is available at github.com/google/osv-scanner.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

const codeStyle =
  "text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5";

const preStyle =
  "rounded-xl bg-black/[.04] dark:bg-white/[.04] p-5 overflow-x-auto text-xs leading-relaxed font-mono border border-black/5 dark:border-white/5";

const thStyle =
  "px-3 py-2 text-left text-xs font-semibold border-b border-black/10 dark:border-white/10 bg-black/[.03] dark:bg-white/[.03]";

const tdStyle =
  "px-3 py-2 text-xs border-b border-black/5 dark:border-white/5";

export default function WhatIsOsvPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 grid gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ── Header ── */}
      <section className="surface-card p-7 grid gap-5">
        <header className="grid gap-3">
          <div className="flex items-center gap-3 text-xs muted">
            <span className="uppercase tracking-wide">Data Sources</span>
            <span>|</span>
            <time dateTime="2026-02-27">Published Feb 27, 2026</time>
            <span>|</span>
            <time dateTime="2026-04-20">Updated Apr 20, 2026</time>
            <span>|</span>
            <span>15 min read</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            What Is OSV? The Complete Guide to the Open Source Vulnerabilities
            Database
          </h1>
          <p className="text-sm muted leading-relaxed">
            Everything you need to know about OSV (Open Source Vulnerabilities):
            how the API works, the advisory JSON format, all 24+ supported
            ecosystems, how to query it programmatically, and how vulnerability
            scanners use it to match packages to known CVEs. Includes an
            interactive lookup tool you can use right now.
          </p>
        </header>
      </section>

      {/* ── 1. What Is OSV? ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          What Is OSV?
        </h2>
        <p className="text-sm muted leading-relaxed">
          OSV stands for <strong>Open Source Vulnerabilities</strong>. It is a
          distributed vulnerability database created by{" "}
          <a
            href="https://osv.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2"
          >
            Google
          </a>{" "}
          in 2021 that aggregates security advisories from dozens of
          ecosystem-specific sources into a single, machine-readable format.
          Unlike traditional vulnerability databases that rely on product names
          and vendor identifiers, OSV describes every vulnerability in terms
          that developers actually use: package names and version strings from
          their native package manager.
        </p>
        <p className="text-sm muted leading-relaxed">
          The central insight behind OSV is that the Common Platform Enumeration
          (CPE) system used by the NVD creates unnecessary ambiguity. A CPE
          string like{" "}
          <code className={codeStyle}>cpe:2.3:a:openssl:openssl:3.0.2</code>{" "}
          could match multiple distributions of OpenSSL across different Linux
          distros, forks, and bundled copies. By contrast, an OSV advisory for
          the Alpine ecosystem&apos;s{" "}
          <code className={codeStyle}>openssl</code> package at version{" "}
          <code className={codeStyle}>3.0.2-r0</code> is unambiguous. There is
          exactly one package with that name in that ecosystem, and the version
          string follows Alpine&apos;s versioning scheme.
        </p>
        <p className="text-sm muted leading-relaxed">
          OSV is not a vulnerability reporting service. It does not assign CVE
          numbers, conduct original research, or evaluate severity scores. Its
          role is aggregation and normalization: it pulls advisories from
          upstream sources like the{" "}
          <a
            href="https://github.com/advisories"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2"
          >
            GitHub Advisory Database
          </a>
          ,{" "}
          <a
            href="https://rustsec.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2"
          >
            RustSec
          </a>
          , the{" "}
          <a
            href="https://pkg.go.dev/vuln/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2"
          >
            Go Vulnerability Database
          </a>
          , and Linux distribution security trackers, then re-publishes them in
          a common JSON format with a free API at{" "}
          <a
            href="https://api.osv.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2"
          >
            api.osv.dev
          </a>
          .
        </p>
        <p className="text-sm muted leading-relaxed">
          The database is{" "}
          <a
            href="https://github.com/google/osv.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2"
          >
            fully open source
          </a>
          , the API requires no authentication, and the data is licensed under
          CC-BY-4.0. This makes it one of the most accessible vulnerability
          data sources available to the security community.
        </p>
      </section>

      {/* ── 2. OSV vs NVD, GHSA, and Vendor Advisories ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          How OSV Differs from NVD, GHSA, and Vendor Advisories
        </h2>
        <p className="text-sm muted leading-relaxed">
          Understanding where OSV fits requires comparing it with the other
          major vulnerability data sources. Each serves a different purpose and
          uses a different identification and matching system.
        </p>
        <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className={thStyle}>Feature</th>
                <th className={thStyle}>OSV</th>
                <th className={thStyle}>NVD</th>
                <th className={thStyle}>GHSA</th>
                <th className={thStyle}>Vendor (Red Hat, Ubuntu)</th>
              </tr>
            </thead>
            <tbody className="muted">
              <tr>
                <td className={`${tdStyle} font-medium`}>Maintained by</td>
                <td className={tdStyle}>Google + community</td>
                <td className={tdStyle}>NIST</td>
                <td className={tdStyle}>GitHub</td>
                <td className={tdStyle}>Individual vendors</td>
              </tr>
              <tr>
                <td className={`${tdStyle} font-medium`}>Identifier format</td>
                <td className={tdStyle}>Ecosystem-specific (GHSA, RUSTSEC, GO, etc.)</td>
                <td className={tdStyle}>CVE-YYYY-NNNNN</td>
                <td className={tdStyle}>GHSA-xxxx-xxxx-xxxx</td>
                <td className={tdStyle}>RHSA, USN, DSA</td>
              </tr>
              <tr>
                <td className={`${tdStyle} font-medium`}>Package matching</td>
                <td className={tdStyle}>Exact (name + version range)</td>
                <td className={tdStyle}>CPE (product + vendor)</td>
                <td className={tdStyle}>Exact (name + version range)</td>
                <td className={tdStyle}>Exact (distro-specific)</td>
              </tr>
              <tr>
                <td className={`${tdStyle} font-medium`}>Ecosystems covered</td>
                <td className={tdStyle}>24+</td>
                <td className={tdStyle}>All (via CPE)</td>
                <td className={tdStyle}>6 (npm, PyPI, Maven, Go, RubyGems, NuGet)</td>
                <td className={tdStyle}>1 each</td>
              </tr>
              <tr>
                <td className={`${tdStyle} font-medium`}>API access</td>
                <td className={tdStyle}>Free, no auth</td>
                <td className={tdStyle}>Free, rate-limited</td>
                <td className={tdStyle}>GitHub token required</td>
                <td className={tdStyle}>Varies</td>
              </tr>
              <tr>
                <td className={`${tdStyle} font-medium`}>Update frequency</td>
                <td className={tdStyle}>Continuous (minutes)</td>
                <td className={tdStyle}>Daily (often multi-day lag)</td>
                <td className={tdStyle}>Continuous</td>
                <td className={tdStyle}>Varies by vendor</td>
              </tr>
              <tr>
                <td className={`${tdStyle} font-medium`}>False positive risk</td>
                <td className={tdStyle}>Low</td>
                <td className={tdStyle}>High (CPE ambiguity)</td>
                <td className={tdStyle}>Low</td>
                <td className={tdStyle}>Low</td>
              </tr>
              <tr>
                <td className={`${tdStyle} font-medium`}>Batch query API</td>
                <td className={tdStyle}>Yes (querybatch)</td>
                <td className={tdStyle}>No</td>
                <td className={tdStyle}>GraphQL</td>
                <td className={tdStyle}>No</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm muted leading-relaxed">
          The NVD remains the authoritative source for CVE identifiers and CVSS
          severity scores. However, its CPE-based matching system often produces
          false positives because CPE strings are ambiguous. A CPE for
          &quot;curl&quot; might match the standalone curl binary, a
          vendor-patched version bundled in a Linux distro, or a completely
          unrelated product that happens to include &quot;curl&quot; in its
          name.
        </p>
        <p className="text-sm muted leading-relaxed">
          GHSA (GitHub Security Advisories) is high-quality but limited to the
          six ecosystems GitHub supports natively. Vendor advisories like Red
          Hat&apos;s RHSA or Ubuntu&apos;s USN are authoritative for their
          respective distributions but require querying each vendor separately.
        </p>
        <p className="text-sm muted leading-relaxed">
          OSV&apos;s advantage is breadth plus precision: it covers 24+
          ecosystems with exact package matching, all through a single API. For
          a deeper comparison of NVD scoring, see our guide on{" "}
          <Link
            href="/blog/understanding-nvd-and-cvss"
            className="font-medium underline underline-offset-2"
          >
            understanding the NVD and CVSS
          </Link>
          .
        </p>
      </section>

      {/* ── 3. The OSV Advisory Format ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          The OSV Advisory Format — Explained with Examples
        </h2>
        <p className="text-sm muted leading-relaxed">
          Every OSV advisory is a JSON document that follows the{" "}
          <a
            href="https://ossf.github.io/osv-schema/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2"
          >
            OSV Schema
          </a>{" "}
          specification, maintained by the Open Source Security Foundation
          (OpenSSF). The schema is designed to be machine-parseable while
          remaining human-readable. Here is a real advisory for the Log4Shell
          vulnerability (CVE-2021-44228), annotated with explanations:
        </p>
        <pre className={preStyle}>
          <code>{`{
  // Unique identifier — prefixed by the source database
  "id": "GHSA-jfh8-c2jp-5v3q",

  // Human-readable one-line description
  "summary": "Apache Log4j2 JNDI features do not protect against
              attacker-controlled LDAP and other JNDI related endpoints",

  // Cross-references to the same vuln in other databases
  "aliases": ["CVE-2021-44228"],

  // When this advisory was last updated
  "modified": "2024-02-16T08:18:32Z",

  // The affected packages — this is the core of the format
  "affected": [
    {
      "package": {
        "ecosystem": "Maven",                              // Package manager
        "name": "org.apache.logging.log4j:log4j-core"     // Exact Maven coordinate
      },
      "ranges": [
        {
          "type": "ECOSYSTEM",                              // Use Maven versioning
          "events": [
            { "introduced": "2.0-beta9" },                 // First vulnerable version
            { "fixed": "2.15.0" }                          // First patched version
          ]
        }
      ]
    }
  ],

  // CVSS severity vector string
  "severity": [
    {
      "type": "CVSS_V3",
      "score": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H"  // 10.0 Critical
    }
  ],

  // Links to patches, advisories, and articles
  "references": [
    { "type": "ADVISORY", "url": "https://nvd.nist.gov/vuln/detail/CVE-2021-44228" },
    { "type": "FIX", "url": "https://github.com/apache/logging-log4j2/pull/608" },
    { "type": "PACKAGE", "url": "https://central.sonatype.com/artifact/..." }
  ]
}`}</code>
        </pre>
        <p className="text-sm muted leading-relaxed">
          The key fields to understand are:
        </p>
        <ul className="list-disc pl-6 text-sm muted grid gap-2">
          <li>
            <strong>id</strong> — A globally unique identifier. The prefix
            indicates the source: GHSA- for GitHub, RUSTSEC- for Rust, GO- for
            Go, DLA- for Debian LTS, etc.
          </li>
          <li>
            <strong>aliases</strong> — Other identifiers for the same
            vulnerability. This is how OSV links a GHSA advisory to its CVE
            number.
          </li>
          <li>
            <strong>affected[].package</strong> — The ecosystem and exact
            package name. This is what makes OSV matching precise: there is no
            ambiguity about which &quot;log4j&quot; is affected.
          </li>
          <li>
            <strong>affected[].ranges[].events</strong> — A list of
            version events that define the affected range.{" "}
            <code className={codeStyle}>introduced</code> marks where the
            vulnerability was added,{" "}
            <code className={codeStyle}>fixed</code> marks where it was
            patched, and{" "}
            <code className={codeStyle}>last_affected</code> (optional) marks
            the last known vulnerable version when no fix exists.
          </li>
          <li>
            <strong>severity</strong> — Optional CVSS vector strings. Not all
            advisories include severity data, which is why scanners often
            supplement OSV with NVD CVSS scores.
          </li>
        </ul>
        <p className="text-sm muted leading-relaxed">
          A single advisory can list multiple affected packages (e.g., when the
          same library is published to both Maven and PyPI), and each package
          can have multiple affected version ranges (e.g., when a vulnerability
          affects both the 2.x and 3.x release lines with separate fixes).
        </p>
      </section>

      {/* ── 4. Supported Ecosystems ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          All 24+ Supported Ecosystems
        </h2>
        <p className="text-sm muted leading-relaxed">
          OSV aggregates vulnerability data from the following ecosystem
          sources. Each source maintains its own advisory database, which OSV
          normalizes into the common schema. Advisory counts are approximate
          and change daily.
        </p>

        <h3 className="text-sm font-semibold mt-2">Language Ecosystems</h3>
        <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className={thStyle}>Ecosystem</th>
                <th className={thStyle}>Source</th>
                <th className={thStyle}>Example Package</th>
                <th className={thStyle}>Advisories</th>
              </tr>
            </thead>
            <tbody className="muted">
              {[
                ["npm", "GitHub Advisory Database", "lodash", "3,500+"],
                ["PyPI", "PyPI + GHSA", "requests", "2,800+"],
                ["Go", "Go Vulnerability Database", "golang.org/x/net", "1,200+"],
                ["Maven", "GitHub Advisory Database", "log4j-core", "4,000+"],
                ["crates.io", "RustSec Advisory Database", "hyper", "800+"],
                ["RubyGems", "GitHub Advisory Database", "rails", "1,500+"],
                ["NuGet", "GitHub Advisory Database", "Newtonsoft.Json", "900+"],
                ["Packagist", "GitHub Advisory Database + FriendsOfPHP", "symfony/http-kernel", "1,200+"],
                ["Hex", "GitHub Advisory Database", "phoenix", "150+"],
                ["Pub", "GitHub Advisory Database", "http", "100+"],
                ["SwiftURL", "GitHub Advisory Database", "vapor", "50+"],
                ["Haskell", "Haskell Security Advisory DB", "aeson", "30+"],
              ].map(([eco, source, example, count]) => (
                <tr key={eco}>
                  <td className={`${tdStyle} font-medium`}>{eco}</td>
                  <td className={tdStyle}>{source}</td>
                  <td className={tdStyle}>
                    <code className={codeStyle}>{example}</code>
                  </td>
                  <td className={tdStyle}>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-sm font-semibold mt-2">Linux Distributions</h3>
        <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className={thStyle}>Ecosystem</th>
                <th className={thStyle}>Source</th>
                <th className={thStyle}>Example Package</th>
                <th className={thStyle}>Advisories</th>
              </tr>
            </thead>
            <tbody className="muted">
              {[
                ["Debian", "Debian Security Tracker", "openssl", "15,000+"],
                ["Ubuntu", "Ubuntu CVE Tracker", "curl", "8,000+"],
                ["Alpine", "Alpine SecDB", "busybox", "2,000+"],
                ["Rocky Linux", "Rocky Linux RLSA", "kernel", "1,500+"],
                ["AlmaLinux", "AlmaLinux ALSA", "glibc", "1,200+"],
                ["SUSE", "SUSE OVAL", "python3", "3,000+"],
                ["Photon OS", "VMware Photon Security", "nginx", "800+"],
                ["Chainguard", "Chainguard Security Data", "go", "500+"],
                ["Wolfi", "Wolfi Security Data", "openssl", "400+"],
              ].map(([eco, source, example, count]) => (
                <tr key={eco}>
                  <td className={`${tdStyle} font-medium`}>{eco}</td>
                  <td className={tdStyle}>{source}</td>
                  <td className={tdStyle}>
                    <code className={codeStyle}>{example}</code>
                  </td>
                  <td className={tdStyle}>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-sm font-semibold mt-2">Other Sources</h3>
        <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className={thStyle}>Ecosystem</th>
                <th className={thStyle}>Source</th>
                <th className={thStyle}>Example Package</th>
                <th className={thStyle}>Advisories</th>
              </tr>
            </thead>
            <tbody className="muted">
              {[
                ["Linux", "Linux Kernel CVEs", "Kernel", "2,500+"],
                ["Android", "Android Security Bulletins", "platform/frameworks/base", "3,000+"],
                ["GSD", "Global Security Database", "Various", "500+"],
                ["OSS-Fuzz", "Google OSS-Fuzz", "Various", "10,000+"],
              ].map(([eco, source, example, count]) => (
                <tr key={eco}>
                  <td className={`${tdStyle} font-medium`}>{eco}</td>
                  <td className={tdStyle}>{source}</td>
                  <td className={tdStyle}>
                    <code className={codeStyle}>{example}</code>
                  </td>
                  <td className={tdStyle}>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm muted leading-relaxed">
          When a package exists in multiple ecosystems (for example, a Python
          library published to both PyPI and as a Debian package), OSV
          maintains separate advisories for each ecosystem. This means a single
          query for the correct ecosystem returns only the advisories relevant
          to your specific installation method.
        </p>
      </section>

      {/* ── 5. How to Query the OSV API ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          How to Query the OSV API
        </h2>
        <p className="text-sm muted leading-relaxed">
          The OSV API is a REST API at{" "}
          <code className={codeStyle}>https://api.osv.dev/v1/</code>. It
          requires no API key, no authentication, and supports cross-origin
          requests (CORS). There are three main endpoints:
        </p>

        <h3 className="text-sm font-semibold mt-2">
          Query a single package
        </h3>
        <p className="text-sm muted leading-relaxed">
          Send a POST request to{" "}
          <code className={codeStyle}>/v1/query</code> with a package
          ecosystem, name, and optionally a version. If you omit the version,
          you get all known vulnerabilities for that package across all
          versions.
        </p>
        <pre className={preStyle}>
          <code>{`# Query a specific version of a package
curl -X POST https://api.osv.dev/v1/query \\
  -H "Content-Type: application/json" \\
  -d '{
    "package": {
      "ecosystem": "npm",
      "name": "lodash"
    },
    "version": "4.17.20"
  }'`}</code>
        </pre>

        <h3 className="text-sm font-semibold mt-2">Batch query</h3>
        <p className="text-sm muted leading-relaxed">
          The batch endpoint at{" "}
          <code className={codeStyle}>/v1/querybatch</code> accepts an array
          of queries and returns results for each one. This is essential for
          vulnerability scanners that need to check hundreds of packages at
          once.
        </p>
        <pre className={preStyle}>
          <code>{`# Batch query multiple packages at once
curl -X POST https://api.osv.dev/v1/querybatch \\
  -H "Content-Type: application/json" \\
  -d '{
    "queries": [
      {
        "package": { "ecosystem": "PyPI", "name": "requests" },
        "version": "2.25.0"
      },
      {
        "package": { "ecosystem": "npm", "name": "express" },
        "version": "4.17.1"
      },
      {
        "package": { "ecosystem": "Go", "name": "golang.org/x/net" },
        "version": "0.0.0-20211209124913-491a49abca63"
      }
    ]
  }'`}</code>
        </pre>

        <h3 className="text-sm font-semibold mt-2">
          Get a specific vulnerability by ID
        </h3>
        <pre className={preStyle}>
          <code>{`# Fetch full details for a specific advisory
curl https://api.osv.dev/v1/vulns/GHSA-jfh8-c2jp-5v3q

# Works with any ecosystem ID format
curl https://api.osv.dev/v1/vulns/RUSTSEC-2021-0078
curl https://api.osv.dev/v1/vulns/GO-2022-0969`}</code>
        </pre>

        <h3 className="text-sm font-semibold mt-2">
          Python example
        </h3>
        <pre className={preStyle}>
          <code>{`import requests

resp = requests.post("https://api.osv.dev/v1/query", json={
    "package": {"ecosystem": "PyPI", "name": "django"},
    "version": "3.2.0"
})

for vuln in resp.json().get("vulns", []):
    severity = ""
    if vuln.get("severity"):
        severity = f" [{vuln['severity'][0].get('score', '')}]"
    print(f"{vuln['id']}: {vuln.get('summary', 'No summary')}{severity}")

# Output:
# GHSA-v6rh-hp5x-86rv: Django QuerySet.order_by() SQL injection
# GHSA-qrw5-5h28-modded: ...`}</code>
        </pre>

        <h3 className="text-sm font-semibold mt-2">
          JavaScript / Node.js example
        </h3>
        <pre className={preStyle}>
          <code>{`const res = await fetch("https://api.osv.dev/v1/query", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    package: { ecosystem: "npm", name: "express" },
    version: "4.17.1",
  }),
});
const { vulns = [] } = await res.json();
console.log(\`Found \${vulns.length} vulnerabilities\`);
vulns.forEach(v => console.log(\`  \${v.id}: \${v.summary}\`));`}</code>
        </pre>

        <p className="text-sm muted leading-relaxed">
          For production use, keep these best practices in mind: always send
          batch queries when checking multiple packages (one HTTP round-trip
          instead of hundreds), cache responses with the{" "}
          <code className={codeStyle}>modified</code> timestamp as a cache
          key, and handle the case where an advisory has no{" "}
          <code className={codeStyle}>severity</code> field (not all
          ecosystem sources include CVSS scores).
        </p>
      </section>

      {/* ── 6. Architecture Diagram ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          How OSV Aggregates Vulnerability Data
        </h2>
        <p className="text-sm muted leading-relaxed">
          OSV acts as a central aggregator, pulling advisories from upstream
          ecosystem sources, normalizing them into the OSV Schema, and serving
          them through a unified API. Here is how data flows from source to
          scanner:
        </p>
        <div className="overflow-x-auto">
          <svg
            viewBox="0 0 800 340"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full max-w-2xl mx-auto"
            role="img"
            aria-label="OSV data flow architecture diagram"
          >
            {/* Background */}
            <rect width="800" height="340" rx="16" className="fill-black/[.02] dark:fill-white/[.02]" />

            {/* Ecosystem Sources column */}
            <text x="105" y="30" textAnchor="middle" className="fill-current text-[11px] font-semibold" fontSize="11" fontWeight="600">Ecosystem Sources</text>
            {[
              ["GitHub GHSA", 55],
              ["RustSec", 90],
              ["Go Vuln DB", 125],
              ["PyPI Advisory", 160],
              ["Debian Tracker", 195],
              ["Alpine SecDB", 230],
              ["Ubuntu CVE", 265],
              ["+ 17 more", 300],
            ].map(([label, y]) => (
              <g key={label as string}>
                <rect x="20" y={(y as number) - 14} width="170" height="24" rx="6" className="fill-black/[.05] dark:fill-white/[.08] stroke-black/10 dark:stroke-white/10" strokeWidth="1" />
                <text x="105" y={y as number} textAnchor="middle" className="fill-current" fontSize="10">{label as string}</text>
              </g>
            ))}

            {/* Arrow: Sources -> OSV */}
            <line x1="200" y1="170" x2="280" y2="170" className="stroke-current" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.4" />
            <polygon points="280,165 290,170 280,175" className="fill-current" opacity="0.4" />

            {/* OSV Aggregator */}
            <rect x="295" y="120" width="190" height="100" rx="12" className="stroke-[var(--dg-accent,#2563eb)]" strokeWidth="2" fill="none" />
            <rect x="295" y="120" width="190" height="100" rx="12" className="fill-[var(--dg-accent,#2563eb)]" opacity="0.06" />
            <text x="390" y="155" textAnchor="middle" className="fill-current text-[13px] font-semibold" fontSize="13" fontWeight="600">OSV Aggregator</text>
            <text x="390" y="175" textAnchor="middle" className="fill-current" fontSize="10" opacity="0.6">Normalize + Deduplicate</text>
            <text x="390" y="195" textAnchor="middle" className="fill-current" fontSize="10" opacity="0.6">osv.dev API</text>
            <text x="390" y="210" textAnchor="middle" className="fill-current" fontSize="10" opacity="0.6">GCS Bucket Export</text>

            {/* Arrow: OSV -> Consumers */}
            <line x1="495" y1="170" x2="575" y2="170" className="stroke-current" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.4" />
            <polygon points="575,165 585,170 575,175" className="fill-current" opacity="0.4" />

            {/* Consumer column */}
            <text x="685" y="30" textAnchor="middle" className="fill-current text-[11px] font-semibold" fontSize="11" fontWeight="600">Consumers</text>
            {[
              ["osv-scanner (Google)", 65],
              ["Trivy", 100],
              ["Grype", 135],
              ["ScanRook", 170],
              ["Snyk", 205],
              ["Custom Scripts", 240],
              ["CI/CD Pipelines", 275],
            ].map(([label, y]) => (
              <g key={label as string}>
                <rect x="595" y={(y as number) - 14} width="180" height="24" rx="6" className={`${(label as string) === "ScanRook" ? "fill-[var(--dg-accent,#2563eb)]/10 stroke-[var(--dg-accent,#2563eb)]" : "fill-black/[.05] dark:fill-white/[.08] stroke-black/10 dark:stroke-white/10"}`} strokeWidth="1" />
                <text x="685" y={y as number} textAnchor="middle" className="fill-current" fontSize="10" fontWeight={(label as string) === "ScanRook" ? "600" : "400"}>{label as string}</text>
              </g>
            ))}
          </svg>
        </div>
        <p className="text-sm muted leading-relaxed">
          Each upstream source publishes advisories in its own format. OSV
          normalizes them into the common OSV Schema, deduplicates entries
          that describe the same vulnerability, and cross-links them via the{" "}
          <code className={codeStyle}>aliases</code> field. The resulting
          unified database is available both as an API and as bulk JSON exports
          in Google Cloud Storage.
        </p>
      </section>

      {/* ── 7. Live OSV Lookup Tool ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          Live OSV Lookup Tool
        </h2>
        <p className="text-sm muted leading-relaxed">
          Try querying the OSV database right now. This tool sends requests
          directly to the{" "}
          <code className={codeStyle}>api.osv.dev</code> API from your
          browser — no server-side processing, no data collection. Select an
          ecosystem, enter a package name, and optionally a version to see all
          known vulnerabilities.
        </p>
        <OsvLookup />
        <p className="text-xs muted">
          Results are fetched directly from the OSV API. Click any advisory ID
          to view full details on osv.dev. For automated scanning of container
          images and source archives, try{" "}
          <Link
            href="/dashboard"
            className="font-medium underline underline-offset-2"
          >
            ScanRook&apos;s upload scanner
          </Link>
          .
        </p>
      </section>

      {/* ── 8. When to Use Each Database ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          OSV vs. Other Databases — When to Use Each
        </h2>
        <p className="text-sm muted leading-relaxed">
          No single vulnerability database covers everything. The right choice
          depends on what you are scanning and what kind of matching you need.
        </p>
        <ul className="list-disc pl-6 text-sm muted grid gap-2">
          <li>
            <strong>Use OSV</strong> when scanning application dependencies
            (npm packages, Python libraries, Go modules, etc.) or Linux
            distribution packages. OSV&apos;s ecosystem-native matching gives
            you the most precise results with the fewest false positives.
          </li>
          <li>
            <strong>Use the NVD</strong> when you need CVE numbers, official
            CVSS scores, or when scanning binaries and proprietary software
            that do not belong to any OSV ecosystem. The NVD&apos;s CPE
            matching can match vulnerabilities to any software product,
            regardless of how it was installed. Read more in our{" "}
            <Link
              href="/blog/understanding-nvd-and-cvss"
              className="font-medium underline underline-offset-2"
            >
              NVD and CVSS guide
            </Link>
            .
          </li>
          <li>
            <strong>Use GHSA</strong> when you are already in the GitHub
            ecosystem and want Dependabot alerts integrated into your pull
            request workflow.
          </li>
          <li>
            <strong>Use vendor advisories</strong> (RHSA, USN, DSA) when you
            need to know whether a specific vendor-patched version resolves a
            vulnerability. Vendor advisories often contain backported fixes
            that are not reflected in upstream version numbers.
          </li>
        </ul>
        <p className="text-sm muted leading-relaxed">
          The best practice is to query multiple sources and merge the results.
          This is exactly what{" "}
          <Link
            href="/docs/data-sources"
            className="font-medium underline underline-offset-2"
          >
            ScanRook does
          </Link>
          : it queries OSV for package-level matches, the NVD for CVE details
          and CVSS scores, and Red Hat OVAL for distribution-specific
          advisories, then produces a unified report. Learn more about how this
          works in our{" "}
          <Link
            href="/blog/installed-state-vs-advisory-matching"
            className="font-medium underline underline-offset-2"
          >
            installed state vs. advisory matching
          </Link>{" "}
          article.
        </p>
      </section>

      {/* ── 9. FAQ ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          Frequently Asked Questions about OSV
        </h2>
        <div className="grid gap-4">
          {faqItems.map((item, i) => (
            <details
              key={i}
              className="group rounded-xl border border-black/10 dark:border-white/10 overflow-hidden"
            >
              <summary className="cursor-pointer select-none p-4 text-sm font-medium flex items-center justify-between hover:bg-black/[.02] dark:hover:bg-white/[.02] transition-colors">
                {item.q}
                <svg
                  className="w-4 h-4 muted shrink-0 ml-3 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div className="px-4 pb-4 text-sm muted leading-relaxed">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── 10. Further Reading + CTA ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          Further Reading
        </h2>
        <ul className="list-disc pl-6 text-sm muted grid gap-1">
          <li>
            <a
              href="https://osv.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              osv.dev
            </a>{" "}
            — Official OSV web interface and search
          </li>
          <li>
            <a
              href="https://github.com/google/osv.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              github.com/google/osv.dev
            </a>{" "}
            — Source code for the OSV platform
          </li>
          <li>
            <a
              href="https://github.com/google/osv-scanner"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              github.com/google/osv-scanner
            </a>{" "}
            — Google&apos;s official OSV scanning tool
          </li>
          <li>
            <a
              href="https://ossf.github.io/osv-schema/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              OSV Schema specification
            </a>{" "}
            — The JSON schema that all advisories follow
          </li>
          <li>
            <a
              href="https://nvd.nist.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              NIST NVD
            </a>{" "}
            — National Vulnerability Database
          </li>
        </ul>

        <h3 className="text-sm font-semibold mt-2">Related ScanRook articles</h3>
        <div className="flex flex-wrap gap-3">
          <Link className="btn-secondary" href="/blog/understanding-nvd-and-cvss">
            NVD and CVSS explained
          </Link>
          <Link className="btn-secondary" href="/blog/container-scanning-best-practices">
            Container scanning guide
          </Link>
          <Link className="btn-secondary" href="/blog/what-is-sbom-and-how-scanrook-uses-it">
            What is an SBOM?
          </Link>
          <Link className="btn-secondary" href="/docs/data-sources">
            Data sources
          </Link>
          <Link className="btn-secondary" href="/blog/epss-scores-explained">
            EPSS scores explained
          </Link>
          <Link className="btn-secondary" href="/blog">
            All articles
          </Link>
        </div>

        <div className="mt-4 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">
            Scan your dependencies with ScanRook
          </h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook queries the OSV API automatically when scanning your
            container images, source archives, and binaries. Upload a file to
            get a comprehensive vulnerability report that combines OSV, NVD,
            and vendor advisory data in seconds.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--dg-accent,#2563eb)] text-white px-4 py-2 text-sm font-medium"
            >
              Start scanning
            </Link>
            <Link
              href="/docs"
              className="btn-secondary"
            >
              Read the docs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
