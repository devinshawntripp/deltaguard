import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-12";

const title = `GHSA Explained: What GitHub Security Advisories Are | ${APP_NAME}`;
const description =
  "GHSA explained: what GitHub Security Advisories and GHSA IDs are, how the GitHub Advisory Database relates to CVE and OSV, and how scanners use it.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "ghsa",
    "github security advisories",
    "github advisory database",
    "ghsa id",
    "ghsa vs cve",
    "github security advisory",
    "ghsa explained",
    "dependabot advisories",
    "osv github advisories",
    "vulnerability database",
  ],
  alternates: { canonical: "/blog/github-security-advisories-explained" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/github-security-advisories-explained",
    images: ["/blog/github-security-advisories-explained.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/github-security-advisories-explained.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "GHSA Explained: What GitHub Security Advisories Are",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/github-security-advisories-explained",
  image: "https://scanrook.io/blog/github-security-advisories-explained.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a GitHub Security Advisory (GHSA)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A GitHub Security Advisory is a structured record of a vulnerability in a software package. The term covers two things: repository advisories that maintainers draft privately to coordinate a fix, and the GitHub Advisory Database, a public collection of advisories mapped to specific package ecosystems and affected version ranges. Each carries a GHSA identifier.",
      },
    },
    {
      "@type": "Question",
      name: "What does a GHSA ID look like?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A GHSA ID has the form GHSA-xxxx-xxxx-xxxx, three groups of four characters after the GHSA prefix, for example GHSA-jfh8-c2jp-5v3q. It is globally unique and assigned by GitHub. Unlike a CVE ID, a GHSA is tied to a specific package ecosystem and version range, which is what makes it directly actionable for dependency scanning.",
      },
    },
    {
      "@type": "Question",
      name: "How is GHSA different from a CVE?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A CVE is a language-neutral identifier for a vulnerability, often described with CPE product strings. A GHSA describes the same class of issue but in package-manager terms — the exact npm, PyPI, Maven, or other package name and the version ranges affected. Many GHSAs reference a CVE as an alias, but a GHSA can exist without a CVE, and GitHub can also assign CVE IDs as a CNA.",
      },
    },
    {
      "@type": "Question",
      name: "How does GHSA relate to the OSV database?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The GitHub Advisory Database is published in the OSV (Open Source Vulnerability) schema and is one of the sources aggregated by osv.dev. That means a scanner can consume GitHub's advisories through the OSV format alongside language-ecosystem databases like PyPA, RustSec, and Go, using the same precise version-range matching model.",
      },
    },
    {
      "@type": "Question",
      name: "Which tools use GitHub Advisory data?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dependabot alerts and the GitHub dependency graph are built directly on the GitHub Advisory Database, and npm audit queries GitHub's advisory data. Third-party scanners including Trivy, Grype, and ScanRook consume GHSA data too, because its ecosystem-precise version ranges match language dependencies more reliably than NVD's CPE model.",
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
          <div className="text-xs uppercase tracking-wide muted">Data sources</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            GHSA Explained: What GitHub Security Advisories Are
          </h1>
          <p className="text-sm muted">Published July 10, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            If you have ever seen a Dependabot alert or an identifier like{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">GHSA-jfh8-c2jp-5v3q</code>{" "}
            in a scan report, you have met GHSA &mdash; GitHub Security Advisories. Behind that prefix
            is one of the most widely used vulnerability data sources for open-source dependencies.
            This is what GHSA actually is, how its IDs and database work, and how it fits alongside
            CVE, OSV, and the scanners that consume it.
          </p>
        </header>

        <img
          src="/blog/github-security-advisories-explained.jpg"
          alt="GitHub Security Advisories (GHSA) explained"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Two things called &ldquo;GitHub advisories&rdquo;</h2>
          <p className="text-sm muted">
            The phrase covers two related but distinct things, and it helps to keep them apart.
          </p>
          <p className="text-sm muted">
            The first is a <strong>repository security advisory</strong>: a private workspace a
            project&apos;s maintainers use to draft a vulnerability report, discuss it, and
            coordinate a fix out of public view. It comes with a private fork for developing the
            patch and, when the maintainers are ready, they publish the advisory so downstream users
            learn about the issue at the same moment the fix lands.
          </p>
          <p className="text-sm muted">
            The second is the <strong>GitHub Advisory Database</strong>: a public, curated collection
            of advisories about packages across many ecosystems. When a maintainer publishes a
            repository advisory, or when GitHub imports a vulnerability from elsewhere, a record ends
            up here &mdash; mapped to the affected package and version ranges. This is the database
            that scanners and Dependabot query.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The GHSA ID</h2>
          <p className="text-sm muted">
            Every advisory in the database gets a <strong>GHSA identifier</strong> of the form{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">GHSA-xxxx-xxxx-xxxx</code>{" "}
            &mdash; the <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">GHSA</code>{" "}
            prefix followed by three groups of four characters. The ID is globally unique and assigned
            by GitHub, so it does not depend on any external body to exist. That independence is the
            point: a maintainer can publish and identify an advisory the moment a fix is ready,
            without waiting on another organization&apos;s queue.
          </p>
          <p className="text-sm muted">
            The most important property of a GHSA is what it points at. Where a{" "}
            <Link href="/blog/what-is-a-cve" className="underline">
              CVE
            </Link>{" "}
            names a vulnerability in the abstract, a GHSA record names the concrete{" "}
            <strong>package and version ranges</strong> affected &mdash; the npm module, the PyPI
            distribution, the Maven coordinate &mdash; along with the fixed version. That is the data
            a dependency scanner needs to decide whether <em>your</em> lockfile is affected.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which ecosystems GHSA covers</h2>
          <p className="text-sm muted">
            The GitHub Advisory Database is organized by package ecosystem, and it covers most of the
            ones a modern application depends on:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>npm (JavaScript / Node.js)</li>
            <li>PyPI (Python, via pip)</li>
            <li>Maven (Java / Kotlin)</li>
            <li>RubyGems (Ruby)</li>
            <li>NuGet (.NET)</li>
            <li>Composer (PHP)</li>
            <li>Go modules</li>
            <li>Rust crates (crates.io)</li>
            <li>Hex (Erlang / Elixir), Pub (Dart), Swift, and GitHub Actions</li>
          </ul>
          <p className="text-sm muted">
            Records fall into two tiers. <strong>Reviewed</strong> advisories have been curated by
            GitHub&apos;s security team, with the affected package and version ranges verified and
            normalized &mdash; these are the ones that power Dependabot alerts. <strong>Unreviewed</strong>{" "}
            advisories are imported automatically, largely from the National Vulnerability Database,
            and have not yet been hand-checked. Knowing which tier a finding comes from tells you how
            much to trust the version-range precision.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">GHSA, CVE, and how they line up</h2>
          <p className="text-sm muted">
            GHSA and CVE are not competitors; they describe the same vulnerabilities from different
            angles. A single flaw commonly has both a CVE ID and a GHSA ID, cross-referenced as
            aliases. The difference is one of representation:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Aspect</th>
                  <th className="text-left py-2 pr-4 font-semibold">CVE (NVD)</th>
                  <th className="text-left py-2 font-semibold">GHSA</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Identifies what</td>
                  <td className="py-2 pr-4 align-top">A vulnerability, language-neutral</td>
                  <td className="py-2 align-top">A vulnerability in a specific package ecosystem</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Affected-version model</td>
                  <td className="py-2 pr-4 align-top">CPE product strings and version ranges</td>
                  <td className="py-2 align-top">Package name plus semver-style ranges</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Who assigns it</td>
                  <td className="py-2 pr-4 align-top">A CVE Numbering Authority under the CVE program</td>
                  <td className="py-2 align-top">GitHub (also a CNA)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">Can exist without the other</td>
                  <td className="py-2 pr-4 align-top">Yes</td>
                  <td className="py-2 align-top">Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            The practical upshot is coverage. Because GitHub is itself a CNA and can publish an
            advisory without waiting on external enrichment, GHSA sometimes carries a package-precise
            record before the corresponding CVE is fully analyzed &mdash; which mattered a great deal
            during the{" "}
            <Link href="/blog/nvd-backlog-explained" className="underline">
              NVD enrichment backlog
            </Link>
            . We map how the major sources diverge in our{" "}
            <Link href="/blog/cve-database-comparison" className="underline">
              CVE database comparison
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">GHSA and OSV: the same data, a common format</h2>
          <p className="text-sm muted">
            The GitHub Advisory Database is published in the <strong>OSV schema</strong>, the open
            JSON format for describing vulnerabilities by package and version range, and it is one of
            the databases aggregated by <Link href="/blog/what-is-osv" className="underline">osv.dev</Link>.
            That is a bigger deal than it sounds. It means a tool does not need bespoke GitHub-specific
            plumbing to use GHSA data &mdash; it can read GitHub&apos;s advisories through the same
            OSV interface it uses for the Python, Rust, and Go ecosystem databases, all with
            consistent version-range matching.
          </p>
          <p className="text-sm muted">
            The database is openly licensed and available beyond the website: you can browse it on
            GitHub, query it through a GraphQL API, or consume the OSV export in bulk. That openness
            is why so many independent scanners can build on it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How scanners &mdash; including ScanRook &mdash; use GHSA</h2>
          <p className="text-sm muted">
            GHSA&apos;s ecosystem-precise ranges are exactly what dependency scanning wants. NVD&apos;s
            CPE model was designed for products and versions and maps awkwardly onto fast-moving
            package registries; GHSA speaks the registries&apos; native language. GitHub&apos;s own
            Dependabot and dependency graph are built on it, npm audit queries it, and third-party
            scanners consume it directly or through OSV.
          </p>
          <p className="text-sm muted">
            ScanRook is in the last group: it treats GitHub&apos;s advisory data, delivered through
            OSV, as one input alongside NVD and Red Hat OVAL, rather than relying on any single
            source. That matters because different databases genuinely know about different things
            &mdash; a package flaw with a GHSA but no finalized CVE analysis still surfaces. Combined
            with reading the{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              actual installed state
            </Link>{" "}
            of an image, ecosystem-precise advisory data is what keeps findings both complete and
            accurate.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is a GHSA the same as a CVE?</h3>
              <p className="text-sm muted mt-1">
                No. They describe the same vulnerabilities but differently: a CVE is a
                language-neutral identifier, while a GHSA ties the issue to a specific package
                ecosystem and version range. Many records carry both IDs as aliases.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can a GHSA exist without a CVE?</h3>
              <p className="text-sm muted mt-1">
                Yes. GitHub can publish an advisory with only a GHSA ID, and some never receive a CVE.
                Because GitHub is also a CNA, it can additionally assign a CVE where one is warranted.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What powers Dependabot alerts?</h3>
              <p className="text-sm muted mt-1">
                The reviewed tier of the GitHub Advisory Database. Dependabot compares your
                dependency graph against those curated, version-range-mapped advisories and alerts
                you when a match is found.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does ScanRook use GHSA data?</h3>
              <p className="text-sm muted mt-1">
                Yes, through the OSV format that GitHub publishes its advisories in, as one source
                alongside NVD and Red Hat OVAL &mdash; so package-ecosystem findings are not missed
                when a single database lags.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan against more than one advisory source</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook matches every package in your images against OSV &mdash; which includes
            GitHub&apos;s advisories &mdash; plus NVD and vendor data in parallel, and tags each
            finding with the source it came from. Upload an artifact to see the coverage difference.
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
            <Link href="/blog/cve-database-comparison" className="underline">
              CVE Database Comparison
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-osv" className="underline">
              What Is the OSV API?
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/understanding-nvd-and-cvss" className="underline">
              Understanding the NVD and CVSS
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
