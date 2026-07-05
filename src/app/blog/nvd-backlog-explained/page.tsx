import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-18";

const title = `The NVD Backlog, Explained: What Happened and What It Means | ${APP_NAME}`;
const description =
  "Why the National Vulnerability Database fell behind on CVE enrichment in 2024, how CISA Vulnrichment stepped in, and what the gap means for your scanner.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "nvd backlog",
    "nvd backlog explained",
    "nvd enrichment backlog",
    "national vulnerability database backlog",
    "nvd slowdown 2024",
    "cve enrichment delay",
    "cisa vulnrichment",
    "nvd cvss missing",
    "cve without cvss score",
    "nvd alternatives",
  ],
  alternates: { canonical: "/blog/nvd-backlog-explained" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/nvd-backlog-explained",
    images: ["/blog/nvd-backlog-explained.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/nvd-backlog-explained.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "The NVD Backlog, Explained: What Happened and What It Means",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/nvd-backlog-explained",
  image: "https://scanrook.io/blog/nvd-backlog-explained.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the NVD backlog?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The NVD backlog is the queue of published CVE records that the National Vulnerability Database has not yet enriched with CVSS severity scores, CWE weakness classifications, and CPE product identifiers. Starting in February 2024, NVD's enrichment throughput dropped sharply while CVE publication volume kept rising, leaving thousands of CVEs published but unenriched for extended periods.",
      },
    },
    {
      "@type": "Question",
      name: "Why did the NVD fall behind in 2024?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NIST cited a growing volume of software and vulnerabilities together with a change in interagency support — in practice, more CVEs arriving with less capacity to analyze them. CVE publication hit record levels in 2024, with more than 40,000 new records, so even after NIST brought in contractor support the queue was slow to drain.",
      },
    },
    {
      "@type": "Question",
      name: "What is CISA Vulnrichment?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Vulnrichment is a CISA program launched in May 2024 that adds enrichment data — SSVC decision points, and where missing, CVSS, CWE, and CPE — directly to CVE records through the CVE program's Authorized Data Publisher mechanism. It gives the ecosystem a second source of enrichment rather than a replacement for the NVD.",
      },
    },
    {
      "@type": "Question",
      name: "Does the NVD backlog make my vulnerability scanner miss CVEs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It can, if the scanner depends solely on NVD data. A CVE without CPE identifiers cannot be matched to products via NVD's mechanism, and one without a CVSS score may be silently deprioritized. Scanners that also consume OSV, GHSA, vendor advisories, and CNA-provided scores keep finding and ranking those CVEs while NVD enrichment catches up.",
      },
    },
    {
      "@type": "Question",
      name: "Is the NVD still worth using?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The NVD remains a valuable, free, machine-readable source of enriched vulnerability data with two decades of history. The lesson of the backlog is not to abandon it but to stop treating any single database as complete — combine it with sources that publish independently of NVD's analysis pipeline.",
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
          <div className="text-xs uppercase tracking-wide muted">Compliance</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            The NVD Backlog, Explained: What Happened and What It Means
          </h1>
          <p className="text-sm muted">Published August 18, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            In early 2024, the National Vulnerability Database &mdash; the data source most
            vulnerability scanners quietly depend on &mdash; fell dramatically behind on its core
            job. The NVD backlog is the clearest lesson of the decade in why single-source
            vulnerability data is fragile. Here is what happened, what changed since, and what it
            means for how you scan.
          </p>
        </header>

        <img
          src="/blog/nvd-backlog-explained.jpg"
          alt="The NVD enrichment backlog explained"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What the NVD actually does</h2>
          <p className="text-sm muted">
            A common misconception is that the NVD creates CVEs. It does not. CVE records are
            created by CVE Numbering Authorities under the CVE program operated by MITRE. What the
            NVD &mdash; run by NIST &mdash; historically added is <em>enrichment</em>: for each
            published CVE, analysts attach a CVSS severity score, CWE weakness classifications, and
            CPE identifiers that name exactly which products and version ranges are affected.
          </p>
          <p className="text-sm muted">
            That enrichment is what makes a CVE machine-actionable. A bare CVE record says
            &ldquo;there is a flaw in product X&rdquo; in prose; the CPE data is what lets a scanner
            programmatically decide whether <em>your</em> package at <em>your</em> version is
            affected, and the CVSS score is what feeds every severity gate and dashboard downstream.
            We cover the mechanics in{" "}
            <Link href="/blog/understanding-nvd-and-cvss" className="underline">
              Understanding the NVD and CVSS
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">February 2024: the slowdown</h2>
          <p className="text-sm muted">
            Around February 12, 2024, observers noticed that the NVD had almost stopped enriching
            new CVEs. Records kept flowing in from the CVE program and appearing on the NVD website,
            but the analysis &mdash; the scores, weaknesses, and product identifiers &mdash; largely
            stopped being attached. NIST posted a notice citing an increase in software and
            therefore vulnerabilities, and a change in interagency support, and said it was working
            on improved processes.
          </p>
          <p className="text-sm muted">
            Through the spring of 2024 the numbers got worse: the majority of CVEs published after
            mid-February sat unenriched, and the queue grew by thousands of records per month.
            NIST brought in outside contractor support mid-year and throughput recovered
            substantially, but the backlog proved stubborn &mdash; clearing it took far longer than
            initially projected, and periods of reduced throughput recurred afterward. The precise
            counts shifted week to week; the durable fact is that for an extended stretch, a large
            share of newly published CVEs had no NVD-provided severity score and no CPE match data.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why the timing was brutal</h2>
          <p className="text-sm muted">
            The slowdown landed in the middle of a volume explosion. CVE publication has grown
            year over year for most of the past decade, and 2024 set a record with more than
            40,000 new CVEs &mdash; a steep jump over the prior year. More CNAs are assigning IDs,
            more research is being published, and more software exists to have flaws. The
            enrichment model &mdash; a central team of analysts reviewing every CVE in the world
            &mdash; was straining against that curve even before capacity dropped.
          </p>
          <p className="text-sm muted">
            The ecosystem got a second scare in April 2025, when MITRE&apos;s contract to operate
            the CVE program itself came within a day of lapsing before CISA exercised an option to
            extend it. The near-miss spurred the creation of the independent CVE Foundation and gave
            new urgency to an old question: how much of the world&apos;s vulnerability-management
            plumbing should depend on any single funding stream?
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The response: Vulnrichment and CNA enrichment</h2>
          <p className="text-sm muted">
            The most concrete fix came from CISA. In May 2024 it launched{" "}
            <strong>Vulnrichment</strong>, a program that enriches CVE records directly through the
            CVE program&apos;s Authorized Data Publisher (ADP) mechanism. Vulnrichment attaches
            SSVC decision points (exploitation status, automatability, technical impact) and, where
            the CNA has not provided them, CVSS, CWE, and CPE data. Because ADP content lives inside
            the CVE record itself, consumers get it straight from the CVE feed without waiting on
            NVD analysis.
          </p>
          <p className="text-sm muted">
            The CVE program also leaned on CNAs &mdash; the vendors and researchers who create
            records &mdash; to ship enrichment at publication time. A growing share of CVE records
            now arrive with a CNA-provided CVSS vector and CWE from day one, which reduces how much
            any central analysis team has to reconstruct after the fact. Neither mechanism fully
            replaces the NVD&apos;s independent analysis, but together they mean a missing NVD score
            is no longer a dead end.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What it means for vulnerability scanning</h2>
          <p className="text-sm muted">
            The backlog exposed a quiet architectural assumption in a lot of tooling: that every
            CVE would eventually get NVD CPE data, and matching against NVD was therefore
            sufficient. When enrichment stalled, tools built on that assumption developed blind
            spots &mdash; a CVE with no CPE entries simply cannot be matched via NVD&apos;s
            mechanism, no matter how severe it is.
          </p>
          <p className="text-sm muted">
            The good news is that NVD was never the only game in town.{" "}
            <Link href="/blog/what-is-osv" className="underline">OSV</Link> publishes
            precise affected-version ranges for open-source ecosystems directly from advisories,
            GHSA covers package-manager ecosystems, and distribution security trackers (Red Hat,
            Debian, Ubuntu) publish authoritative data about their own packages &mdash; including
            backported fixes NVD knows nothing about. These pipelines run independently of NVD
            analysis, so they kept working through the backlog. Our{" "}
            <Link href="/blog/cve-database-comparison" className="underline">
              CVE database comparison
            </Link>{" "}
            maps who covers what.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A practical checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              Confirm your scanner consumes more than one advisory source; ask specifically what
              happens to a CVE that has no NVD CPE data.
            </li>
            <li>
              When a finding shows &ldquo;no CVSS score,&rdquo; check the CVE record for
              CNA-provided or CISA-ADP scores before treating it as unknown severity.
            </li>
            <li>
              Do not let severity gates silently drop unscored CVEs &mdash; route them to review
              instead of defaulting them to zero.
            </li>
            <li>
              Use exploitation-based signals (CISA KEV, EPSS) alongside CVSS so prioritization
              still works when scores lag.
            </li>
            <li>
              For distro packages, prefer vendor advisory data over NVD matching &mdash; it
              accounts for backports and is maintained by the people shipping the fix.
            </li>
            <li>
              If compliance obligations reference NVD data specifically, document your
              supplementary sources &mdash; and consult counsel on whether they satisfy the
              requirement.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How ScanRook handles the gap</h2>
          <p className="text-sm muted">
            ScanRook was built on the assumption the backlog proved correct: no single database is
            complete. Every scan matches installed packages against OSV, NVD, and Red Hat OVAL in
            parallel, so a CVE that is missing NVD enrichment still surfaces through the sources
            that do carry it &mdash; with severity taken from whichever source provides it. Each
            finding is tagged with where it came from and a confidence tier, so you can see when
            NVD and the other sources disagree instead of inheriting one database&apos;s blind
            spots. The same multi-source data feeds the SBOM reports, so component-level audit
            artifacts do not depend on NVD&apos;s queue either.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is the NVD backlog?</h3>
              <p className="text-sm muted mt-1">
                The queue of published CVEs that the NVD has not yet enriched with CVSS, CWE, and
                CPE data. It grew sharply after NVD enrichment throughput dropped in February 2024.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why did the NVD fall behind?</h3>
              <p className="text-sm muted mt-1">
                Record CVE volume &mdash; more than 40,000 published in 2024 &mdash; met reduced
                analysis capacity, which NIST attributed to software growth and a change in
                interagency support.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is CISA Vulnrichment?</h3>
              <p className="text-sm muted mt-1">
                A CISA program (May 2024) that adds SSVC, CVSS, CWE, and CPE data to CVE records via
                the Authorized Data Publisher mechanism &mdash; a second enrichment source alongside
                the NVD.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does the backlog affect my scanner?</h3>
              <p className="text-sm muted mt-1">
                Only if it depends solely on NVD. Scanners that also use OSV, GHSA, and vendor
                advisories keep matching and scoring CVEs that NVD has not yet analyzed.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan with more than one source of truth</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook matches every package against OSV, NVD, and vendor advisory data in parallel,
            so your findings do not wait on any single database&apos;s analysis queue &mdash; and
            every finding shows you exactly which source it came from.
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
            <Link href="/blog/understanding-nvd-and-cvss" className="underline">
              Understanding the NVD and CVSS
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/cve-database-comparison" className="underline">
              CVE Database Comparison
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-osv" className="underline">
              What Is the OSV API?
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
