import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";

const title = `Understanding the NVD and CVSS v3.1 Scoring | ${APP_NAME}`;
const description =
  "How the National Vulnerability Database works, what CPE matching means for scanners, and how CVSS v3.1 base scores are calculated and used for prioritization.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "NVD",
    "National Vulnerability Database",
    "CVSS",
    "CVE",
    "CPE",
    "CVSS v3.1",
    "vulnerability scoring",
    "ScanRook",
  ],
  alternates: {
    canonical: "/blog/understanding-nvd-and-cvss",
  },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/understanding-nvd-and-cvss",
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
  headline: "Understanding the NVD and CVSS v3.1 Scoring",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/understanding-nvd-and-cvss",
  datePublished: "2026-02-27",
  dateModified: "2026-02-27",
};

export default function NvdCvssPage() {
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
            Understanding the NVD and CVSS v3.1 Scoring
          </h1>
          <p className="text-sm muted">
            The National Vulnerability Database (NVD) is the most widely
            referenced source for CVE details and severity scores. This article
            explains how the NVD works, what CPE matching means, and how CVSS
            v3.1 scoring is structured.
          </p>
        </header>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            What Is the NVD?
          </h2>
          <p className="text-sm muted">
            The National Vulnerability Database is maintained by NIST (the
            National Institute of Standards and Technology). It is the U.S.
            government&apos;s repository of standards-based vulnerability data. The
            NVD does not discover vulnerabilities itself. Instead, it enriches
            CVE records published by CVE Numbering Authorities (CNAs) with
            additional analysis, including CVSS scores, CPE applicability
            statements, and references.
          </p>
          <p className="text-sm muted">
            Every CVE published by a CNA eventually appears in the NVD, where
            analysts add structured data about which products are affected
            (using CPE URIs), how severe the vulnerability is (using CVSS), and
            what references are available (patches, advisories, exploits).
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            CPE Matching: How the NVD Identifies Affected Software
          </h2>
          <p className="text-sm muted">
            CPE (Common Platform Enumeration) is a structured naming scheme for
            software products. A CPE URI looks like:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
            <code>cpe:2.3:a:openssl:openssl:3.0.2:*:*:*:*:*:*:*</code>
          </pre>
          <p className="text-sm muted">
            This URI encodes the vendor (&quot;openssl&quot;), the product name
            (&quot;openssl&quot;), and the version (&quot;3.0.2&quot;). NVD analysts attach CPE
            configurations to each CVE record, specifying which product versions
            are affected, sometimes with complex AND/OR logic for multi-product
            vulnerabilities.
          </p>
          <p className="text-sm muted">
            The challenge with CPE matching is ambiguity. Product names in CPE
            are not always identical to package names in a distribution&apos;s
            package manager. The package &quot;libxml2&quot; in Debian might map to a
            different CPE product string than expected. This is why scanners
            that rely solely on CPE matching can produce false positives --
            the product name mapping is imperfect.
          </p>
          <p className="text-sm muted">
            ScanRook addresses this by using ecosystem-native matching via the{" "}
            <Link
              href="/blog/what-is-osv"
              className="font-medium underline underline-offset-2"
            >
              OSV API
            </Link>{" "}
            as the primary enrichment source, then supplementing with NVD CPE
            matching for additional coverage. Findings from CPE-based matching
            are classified with lower confidence when the package coordinate
            does not match precisely.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            CVSS v3.1: How Severity Scores Work
          </h2>
          <p className="text-sm muted">
            The Common Vulnerability Scoring System (CVSS) is a framework for
            rating the severity of vulnerabilities. Version 3.1 is the most
            widely used. A CVSS v3.1 base score ranges from 0.0 to 10.0 and is
            derived from eight metrics organized into two groups:
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
              <h3 className="text-sm font-semibold">Exploitability Metrics</h3>
              <ul className="list-disc pl-5 text-xs muted grid gap-1">
                <li><strong>Attack Vector (AV)</strong> -- Network, Adjacent, Local, or Physical</li>
                <li><strong>Attack Complexity (AC)</strong> -- Low or High</li>
                <li><strong>Privileges Required (PR)</strong> -- None, Low, or High</li>
                <li><strong>User Interaction (UI)</strong> -- None or Required</li>
              </ul>
            </div>
            <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
              <h3 className="text-sm font-semibold">Impact Metrics</h3>
              <ul className="list-disc pl-5 text-xs muted grid gap-1">
                <li><strong>Confidentiality (C)</strong> -- None, Low, or High</li>
                <li><strong>Integrity (I)</strong> -- None, Low, or High</li>
                <li><strong>Availability (A)</strong> -- None, Low, or High</li>
                <li><strong>Scope (S)</strong> -- Unchanged or Changed</li>
              </ul>
            </div>
          </div>
          <p className="text-sm muted">
            These metrics combine into qualitative severity ratings: None (0.0),
            Low (0.1--3.9), Medium (4.0--6.9), High (7.0--8.9), and Critical
            (9.0--10.0). A CVSS score of 9.8 typically means the vulnerability
            is network-exploitable, requires no authentication, and allows full
            system compromise.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            The Limitations of CVSS Alone
          </h2>
          <p className="text-sm muted">
            CVSS scores are useful for understanding the theoretical severity of
            a vulnerability, but they do not account for real-world exploit
            activity. A vulnerability with a CVSS score of 9.8 may never be
            exploited in the wild, while a 7.0-scored vulnerability might be
            actively weaponized. This is why modern vulnerability management
            increasingly supplements CVSS with exploit prediction data like{" "}
            <Link
              href="/blog/epss-scores-explained"
              className="font-medium underline underline-offset-2"
            >
              EPSS
            </Link>{" "}
            and active exploitation catalogs like the{" "}
            <Link
              href="/blog/cisa-kev-guide"
              className="font-medium underline underline-offset-2"
            >
              CISA KEV
            </Link>
            .
          </p>
          <p className="text-sm muted">
            ScanRook includes CVSS scores from the NVD in every finding, but
            also enriches findings with EPSS probability scores and CISA KEV
            status to give security teams better prioritization signals. Learn
            more in the{" "}
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
            NVD API Rate Limits and Caching
          </h2>
          <p className="text-sm muted">
            The NVD API has rate limits that affect scanner performance. Without
            an API key, requests are limited to approximately 5 per 30-second
            window. With a free NVD API key, the limit increases to 50 per
            30-second window. For scanners processing hundreds of packages,
            caching is essential to avoid hitting these limits on repeated scans.
          </p>
          <p className="text-sm muted">
            ScanRook implements a multi-layer caching strategy: a local file
            cache for individual developer workstations, PostgreSQL for
            persistent team-wide caching, and Redis for high-throughput
            multi-worker deployments. This ensures that NVD data is fetched once
            and reused across scans, reducing both API pressure and scan
            latency.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            How ScanRook Uses the NVD
          </h2>
          <p className="text-sm muted">
            In ScanRook&apos;s enrichment pipeline, the NVD is queried after OSV.
            For each package in the scan inventory, ScanRook first checks OSV
            for ecosystem-native matches. Then it queries the NVD using CPE
            product matching to find additional CVEs that may not yet appear in
            ecosystem-specific advisory databases. The results are deduplicated
            and merged into a single findings list, with CVSS scores attached
            to every finding that has NVD coverage.
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
            <Link className="btn-secondary" href="/blog/what-is-osv">
              OSV API guide
            </Link>
            <Link className="btn-secondary" href="/blog/epss-scores-explained">
              EPSS explained
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
