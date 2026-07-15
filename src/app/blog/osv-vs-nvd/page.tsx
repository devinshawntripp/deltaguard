import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-15";

const title = `OSV vs NVD: OSV Scanner and NVD Coverage Compared | ${APP_NAME}`;
const description =
  "OSV vs NVD compared: how each publishes and matches vulnerability data, where their coverage diverges, and why scanners that use only one develop blind spots.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "osv scanner",
    "osv-scanner",
    "google osv scanner",
    "osv vs nvd",
    "osv database",
    "nvd database",
    "osv api",
    "nvd cpe",
    "vulnerability database comparison",
    "osv nvd differences",
  ],
  alternates: { canonical: "/blog/osv-vs-nvd" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/osv-vs-nvd",
    images: ["/blog/osv-vs-nvd.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/osv-vs-nvd.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "OSV vs NVD: OSV Scanner and NVD Coverage Compared",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/osv-vs-nvd",
  image: "https://scanrook.io/blog/osv-vs-nvd.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the difference between OSV and NVD?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "OSV (Open Source Vulnerabilities) is a distributed database where each ecosystem — npm, PyPI, Go, Debian, and dozens more — publishes advisories with precise affected-version ranges. NVD (National Vulnerability Database) is a centralized, NIST-run database that enriches CVE records with CVSS scores and CPE product identifiers used for matching.",
      },
    },
    {
      "@type": "Question",
      name: "Is OSV more accurate than NVD?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Neither is universally more accurate; they cover different things well. OSV's version ranges are typically more precise for open-source package ecosystems because advisory sources publish them directly. NVD's CPE matching covers a broader span of software, including commercial and system-level products, but depends on manual enrichment that can lag.",
      },
    },
    {
      "@type": "Question",
      name: "Does OSV replace NVD?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. They are complementary, not competing, sources. OSV covers open-source package ecosystems in depth; NVD covers a wider span of software via CPE matching, including products OSV does not track. Scanners that rely on only one will miss vulnerabilities the other catches.",
      },
    },
    {
      "@type": "Question",
      name: "Which is faster to publish new vulnerabilities, OSV or NVD?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "OSV generally publishes faster for open-source ecosystems because advisories flow in directly from sources like GHSA, PyPA, and distribution security trackers without a centralized enrichment step. NVD's enrichment pipeline is centralized, which is thorough but has historically been slower, including a well-documented backlog period starting in 2024.",
      },
    },
    {
      "@type": "Question",
      name: "How does ScanRook use OSV and NVD together?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ScanRook queries both in parallel for every package it identifies, along with Red Hat OVAL for RHEL-family images. Findings are tagged with their source and a confidence tier, so a vulnerability that only OSV or only NVD knows about still surfaces, and disagreements between sources are visible rather than silently resolved.",
      },
    },
  ],
};

export default function Page() {
  if (!isPublished({ publishDate: PUBLISH_DATE })) notFound();
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

      <article className="surface-card p-8 grid gap-6">
        <header className="grid gap-3">
          <div className="text-xs uppercase tracking-wide muted">Benchmarks</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            OSV vs NVD: OSV Scanner and NVD Coverage Compared
          </h1>
          <p className="text-sm muted">Published August 15, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            OSV vs NVD is not a competition with one winner &mdash; it is two different models for
            publishing the same underlying thing: knowledge that a piece of software has a flaw.
            Tools like Google&apos;s OSV Scanner query the OSV feed directly, while other scanners
            lean on NVD&apos;s CPE data, and understanding how each database is built explains why a
            scanner that uses only one ends up with different, and sometimes surprising, blind spots.
          </p>
        </header>

        <img
          src="/blog/osv-vs-nvd.jpg"
          alt="OSV and NVD vulnerability databases compared"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What OSV is</h2>
          <p className="text-sm muted">
            OSV (Open Source Vulnerabilities) is a schema and aggregation project, originally
            started by Google, for open-source vulnerability data. Rather than one central team
            analyzing every CVE, OSV ingests advisories directly from the ecosystems that produce
            them &mdash; GitHub Security Advisories, PyPA, RustSec, Go&apos;s vulnerability database,
            and Linux distribution security trackers among others &mdash; and normalizes them into a
            common JSON format with precise affected-version ranges per package. Our{" "}
            <Link href="/blog/what-is-osv" className="underline">
              guide to the OSV API
            </Link>{" "}
            covers the schema and query mechanics in depth.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The OSV Scanner tool</h2>
          <p className="text-sm muted">
            The database is separate from the tooling that reads it. Google also maintains{" "}
            <strong>OSV-Scanner</strong>, an open-source command-line scanner that queries the OSV
            database directly. Point the OSV Scanner at a lockfile, an SBOM, a source directory, or a
            container image and it resolves each dependency, then matches it against OSV&apos;s
            per-ecosystem version ranges using the same free OSV API described above.
          </p>
          <p className="text-sm muted">
            Because the OSV Scanner sources its findings from OSV alone, its coverage inherits
            OSV&apos;s scope: strong for npm, PyPI, Go, crates.io, and Linux-distro packages, but it
            will not surface a CVE that only NVD&apos;s CPE matching knows about. That single-source
            dependency is the exact trade-off this comparison is about &mdash; any scanner is only as
            complete as the databases behind it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What NVD is</h2>
          <p className="text-sm muted">
            The National Vulnerability Database is run by NIST and works differently: it does not
            create CVE records (MITRE&apos;s CVE program does that), but it enriches them &mdash;
            attaching a CVSS severity score, CWE weakness classification, and CPE identifiers that
            name exactly which products and version ranges are affected. That CPE data is what lets
            a scanner match a CVE to a specific piece of software programmatically. We cover the
            mechanics in{" "}
            <Link href="/blog/understanding-nvd-and-cvss" className="underline">
              Understanding the NVD and CVSS
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Capability comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Attribute</th>
                  <th className="text-left py-2 pr-4 font-semibold">OSV</th>
                  <th className="text-left py-2 font-semibold">NVD</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Model</td>
                  <td className="py-2 pr-4 align-top">Distributed &mdash; ecosystems publish directly</td>
                  <td className="py-2 align-top">Centralized &mdash; NIST analysts enrich each CVE</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Matching mechanism</td>
                  <td className="py-2 pr-4 align-top">Package name + precise version ranges</td>
                  <td className="py-2 align-top">CPE identifiers (product/vendor/version)</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Strongest coverage</td>
                  <td className="py-2 pr-4 align-top">Open-source package ecosystems (npm, PyPI, Go, crates.io, Linux distros)</td>
                  <td className="py-2 align-top">Broad software span, including commercial and system-level products</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Publication speed</td>
                  <td className="py-2 pr-4 align-top">Fast &mdash; no centralized enrichment bottleneck</td>
                  <td className="py-2 align-top">Depends on enrichment throughput; has lagged in the past</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">API access</td>
                  <td className="py-2 pr-4 align-top">Free, open JSON schema, no key required</td>
                  <td className="py-2 align-top">Free API, rate-limited without an API key</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">NVD&apos;s real strengths</h2>
          <p className="text-sm muted">
            NVD has run for two decades and remains the most widely recognized vulnerability
            database in compliance and procurement contexts. Its CPE matching is not limited to
            open-source packages &mdash; it covers commercial software, operating systems, firmware,
            and hardware, which OSV does not attempt to track. For organizations that need to point
            to a well-established, government-run authority in an audit, NVD carries institutional
            weight that a newer, distributed project has not yet accumulated.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">OSV&apos;s real strengths</h2>
          <p className="text-sm muted">
            OSV&apos;s distributed model means there is no single team that has to review every
            vulnerability before it becomes usable. Each ecosystem publishes its own advisories with
            version-range precision that a general-purpose CPE identifier often cannot express as
            cleanly &mdash; &ldquo;affected versions &gt;=1.2.0, &lt;1.2.7&rdquo; directly, rather than
            requiring a scanner to interpret a CPE range. Because publication does not route through
            one central bottleneck, OSV coverage of open-source ecosystems has generally kept pace
            with the volume of advisories those ecosystems produce.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where the two diverge in practice</h2>
          <p className="text-sm muted">
            The practical divergence shows up as coverage gaps in each direction. A CVE in a system
            package or commercial product with no open-source ecosystem advisory may exist in NVD
            via CPE matching but never appear in OSV at all. Conversely, a vulnerability in an
            actively maintained npm or PyPI package might be published to OSV within hours of
            disclosure, while the same CVE waits for NVD&apos;s enrichment queue before it is
            CPE-matchable.
          </p>
          <p className="text-sm muted">
            This is exactly the gap that multi-source scanning is built to close. In{" "}
            <Link href="/blog/vulnerability-scanner-benchmark-2026" className="underline">
              our 2026 benchmark
            </Link>
            , scanners that match against a single aggregated database reported far fewer findings
            than a scanner querying multiple sources in parallel &mdash; 10 findings on ubuntu:24.04
            from a single-database tool versus 1,365 from one that also queries OSV, NVD, and Red Hat
            OVAL together. Some of that gap is duplicate coverage across sources, but a meaningful
            share is vulnerabilities one source has and the others do not. Our{" "}
            <Link href="/blog/cve-database-comparison" className="underline">
              CVE database comparison
            </Link>{" "}
            breaks down coverage by source in more detail, including GHSA and Red Hat OVAL.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which should you rely on?</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Rely on OSV</strong> for fast-moving open-source ecosystem coverage &mdash;
              npm, PyPI, Go modules, crates.io, and Linux distribution packages &mdash; where version
              precision and publication speed matter most.
            </li>
            <li>
              <strong>Rely on NVD</strong> when you need CPE-based matching for software outside
              open-source ecosystems, or when a compliance framework specifically references NVD as
              a data source.
            </li>
            <li>
              <strong>Do not rely on just one.</strong> Every real-world container or codebase mixes
              open-source packages with system-level and sometimes commercial components, which
              means both matching models are relevant at once.
            </li>
            <li>
              <strong>Check what your scanner actually queries.</strong> A tool that advertises
              &ldquo;CVE scanning&rdquo; without specifying its sources may be leaning on only one of
              these, silently narrowing what it can find.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How ScanRook uses both</h2>
          <p className="text-sm muted">
            ScanRook queries OSV and NVD in parallel for every package it identifies, plus Red Hat
            OVAL for RHEL-family images, rather than picking one as primary. Each finding is tagged
            with the source that produced it and a confidence tier based on installed-state
            verification, so when OSV and NVD disagree &mdash; or when only one of them has a given
            CVE &mdash; you can see that directly instead of inheriting one database&apos;s blind
            spot as if it were the whole picture.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is the difference between OSV and NVD?</h3>
              <p className="text-sm muted mt-1">
                OSV is a distributed database where ecosystems publish advisories directly with
                precise version ranges. NVD is centralized, enriching CVEs with CVSS scores and CPE
                identifiers used for matching.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is OSV more accurate than NVD?</h3>
              <p className="text-sm muted mt-1">
                Neither is universally more accurate. OSV is typically more precise for open-source
                packages; NVD covers a broader span of software including commercial products.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does OSV replace NVD?</h3>
              <p className="text-sm muted mt-1">
                No, they are complementary. Relying on only one leaves gaps the other would have
                caught.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Which publishes faster?</h3>
              <p className="text-sm muted mt-1">
                OSV generally publishes open-source advisories faster since there is no central
                enrichment bottleneck; NVD has historically lagged during high-volume periods.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Stop depending on a single database</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook matches every package against OSV, NVD, and vendor OVAL data in parallel, so
            your findings do not depend on any one source&apos;s coverage or enrichment queue.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--dg-accent,#2563eb)] text-white px-4 py-2 text-sm font-medium"
            >
              Start scanning
            </Link>
            <Link href="/docs" className="btn-secondary">Read the docs</Link>
          </div>
        </section>

        <footer className="border-t border-black/10 dark:border-white/10 pt-4 text-xs muted grid gap-2">
          <p>
            <strong>Related reading:</strong>{" "}
            <Link href="/blog/what-is-osv" className="underline">
              What Is the OSV API?
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/understanding-nvd-and-cvss" className="underline">
              Understanding the NVD and CVSS
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/cve-database-comparison" className="underline">
              CVE Database Comparison
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
