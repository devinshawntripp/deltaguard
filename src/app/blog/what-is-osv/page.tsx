import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";

const title = `What Is the OSV API? Ecosystems, Advisories, and How It Works | ${APP_NAME}`;
const description =
  "A practical guide to the Open Source Vulnerabilities database, the advisory format it uses, and how vulnerability scanners query it for ecosystem-specific data.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "OSV",
    "Open Source Vulnerabilities",
    "OSV API",
    "vulnerability database",
    "advisory format",
    "ecosystem vulnerabilities",
    "ScanRook",
  ],
  alternates: {
    canonical: "/blog/what-is-osv",
  },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/what-is-osv",
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
  headline: "What Is the OSV API? Ecosystems, Advisories, and How It Works",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/what-is-osv",
  datePublished: "2026-02-27",
  dateModified: "2026-02-27",
};

export default function WhatIsOsvPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 grid gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="surface-card p-8 grid gap-6">
        <header className="grid gap-3">
          <div className="text-xs uppercase tracking-wide muted">
            Data sources
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            What Is the OSV API? Ecosystems, Advisories, and How It Works
          </h1>
          <p className="text-sm muted">
            The Open Source Vulnerabilities (OSV) database is one of the most
            important public data sources for vulnerability scanners today. This
            article explains what it is, how the advisory format works, and why
            it matters for accurate scanning.
          </p>
        </header>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            What Is OSV?
          </h2>
          <p className="text-sm muted">
            OSV is an open, distributed vulnerability database maintained by
            Google. Unlike the NVD, which assigns CVE identifiers and provides a
            centralized catalog, OSV aggregates advisories from dozens of
            ecosystem-specific sources into a single queryable format. Each
            advisory describes a vulnerability in terms of the affected package
            ecosystem, name, and version ranges.
          </p>
          <p className="text-sm muted">
            The key design principle behind OSV is that vulnerability data should
            be expressed in the same terms that developers use: package names and
            version strings, not CPE URIs or product names. This makes it
            possible to match a package coordinate directly to known
            vulnerabilities without the ambiguity that comes with CPE-based
            matching.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            The OSV Advisory Format
          </h2>
          <p className="text-sm muted">
            Each OSV advisory is a JSON document that includes the vulnerability
            identifier (which may be a CVE, a GHSA, or an ecosystem-specific
            ID), a summary, details, severity information, and most importantly
            a list of affected packages. Each affected entry specifies:
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>
              <strong>Ecosystem</strong> -- the package manager or distribution
              (e.g., npm, PyPI, Go, crates.io, Alpine, Debian).
            </li>
            <li>
              <strong>Package name</strong> -- the exact name as it appears in
              the ecosystem registry.
            </li>
            <li>
              <strong>Version ranges</strong> -- which versions are affected,
              expressed as introduced/fixed pairs using the ecosystem&apos;s native
              versioning scheme.
            </li>
          </ul>
          <p className="text-sm muted">
            This structure eliminates the naming mismatch problem that plagues
            CPE-based lookups. When a scanner detects that a container has
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              openssl 3.0.2
            </code>{" "}
            installed via APK, it can query OSV with exactly that ecosystem,
            name, and version, and get back a precise list of matching
            advisories.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Supported Ecosystems
          </h2>
          <p className="text-sm muted">
            OSV currently aggregates data from over 20 ecosystem sources,
            including:
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>Language ecosystems: npm, PyPI, Go, crates.io, RubyGems, Maven, NuGet, Packagist, Hex, Pub, Swift</li>
            <li>Linux distributions: Alpine, Debian, Ubuntu, SUSE, Rocky Linux, AlmaLinux, Photon OS</li>
            <li>Other sources: GitHub Advisory Database (GHSA), Google Cloud, Android, Linux kernel</li>
          </ul>
          <p className="text-sm muted">
            Each ecosystem source maintains its own advisory data, which OSV
            normalizes into the common format. This means a single OSV query
            can return advisories from multiple upstream sources for the same
            package.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            How Scanners Use the OSV API
          </h2>
          <p className="text-sm muted">
            The OSV API supports batch queries, which is essential for
            performance. A typical container scan might detect hundreds of
            installed packages. Rather than making one API call per package, a
            scanner can send all package coordinates in a single batch request
            and receive matching advisories in one response.
          </p>
          <p className="text-sm muted">
            ScanRook uses the OSV batch query endpoint as its primary
            vulnerability enrichment source. After extracting the package
            inventory from a container image (by reading RPM, APK, dpkg, or
            other package manager databases), ScanRook sends the full list of
            package coordinates to OSV and receives back all matching
            advisories. These are then merged with findings from other sources
            like the NVD to produce a comprehensive report.
          </p>
          <p className="text-sm muted">
            Learn more about how ScanRook combines multiple data sources in the{" "}
            <Link
              href="/docs/concepts/enrichment"
              className="font-medium underline underline-offset-2"
            >
              enrichment documentation
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            OSV vs. NVD: Complementary Data Sources
          </h2>
          <p className="text-sm muted">
            OSV and the NVD serve different but complementary roles. The NVD
            provides CVE identifiers, CPE-based product matching, and CVSS
            scores. OSV provides ecosystem-native package matching with precise
            version ranges. A scanner that uses both gets the best of both
            worlds: the broad coverage and severity scoring of the NVD, combined
            with the precision of ecosystem-native matching from OSV.
          </p>
          <p className="text-sm muted">
            For a deeper look at the NVD and CVSS scoring, see our article on{" "}
            <Link
              href="/blog/understanding-nvd-and-cvss"
              className="font-medium underline underline-offset-2"
            >
              understanding the NVD and CVSS
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Why OSV Matters for Accuracy
          </h2>
          <p className="text-sm muted">
            The biggest advantage of OSV is precision. Because advisories use
            exact package names and version ranges from each ecosystem, there is
            far less room for false positives from name mismatches. A CPE-based
            lookup for &quot;openssl&quot; might match unrelated products or vendor forks.
            An OSV query for the Alpine ecosystem&apos;s &quot;openssl&quot; package at a
            specific version returns only advisories that apply to exactly that
            package.
          </p>
          <p className="text-sm muted">
            This precision is why ScanRook uses OSV as the first enrichment
            source in its pipeline, then supplements with NVD data for
            additional coverage and CVSS scoring. The combination provides both
            accuracy and breadth.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Further Reading
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link className="btn-secondary" href="/docs/concepts/enrichment">
              Enrichment docs
            </Link>
            <Link className="btn-secondary" href="/docs/data-sources">
              Data sources
            </Link>
            <Link className="btn-secondary" href="/blog/understanding-nvd-and-cvss">
              NVD and CVSS
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
