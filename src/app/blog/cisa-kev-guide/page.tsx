import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";

const title = `CISA KEV Guide: Why Actively Exploited CVEs Demand Immediate Action | ${APP_NAME}`;
const description =
  "What the CISA Known Exploited Vulnerabilities catalog is, who it applies to, and how to use it in your vulnerability remediation workflow.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "CISA KEV",
    "Known Exploited Vulnerabilities",
    "actively exploited",
    "BOD 22-01",
    "vulnerability remediation",
    "ScanRook",
  ],
  alternates: {
    canonical: "/blog/cisa-kev-guide",
  },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/cisa-kev-guide",
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
  headline:
    "CISA KEV Guide: Why Actively Exploited CVEs Demand Immediate Action",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/cisa-kev-guide",
  datePublished: "2026-02-27",
  dateModified: "2026-02-27",
};

export default function CisaKevGuidePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 grid gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="surface-card p-8 grid gap-6">
        <header className="grid gap-3">
          <div className="text-xs uppercase tracking-wide muted">
            Prioritization
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            CISA KEV Guide: Why Actively Exploited CVEs Demand Immediate Action
          </h1>
          <p className="text-sm muted">
            The CISA Known Exploited Vulnerabilities (KEV) catalog is one of the
            most authoritative signals for vulnerability prioritization. If a
            CVE is on this list, it has been confirmed as actively exploited in
            real-world attacks. This article explains what KEV is, how it works,
            and how to operationalize it.
          </p>
        </header>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            What Is the CISA KEV Catalog?
          </h2>
          <p className="text-sm muted">
            The Cybersecurity and Infrastructure Security Agency (CISA)
            maintains a public catalog of vulnerabilities that are known to be
            actively exploited. The catalog was established in November 2021 as
            part of Binding Operational Directive 22-01 (BOD 22-01), which
            requires U.S. federal agencies to remediate listed vulnerabilities
            within specified timeframes.
          </p>
          <p className="text-sm muted">
            Each entry in the KEV catalog includes the CVE identifier, the
            affected vendor and product, a short vulnerability description, the
            date it was added to the catalog, and a required remediation
            deadline. As of early 2026, the catalog contains over 1,100
            vulnerabilities spanning a wide range of vendors and product types.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Why KEV Matters Beyond Federal Agencies
          </h2>
          <p className="text-sm muted">
            While BOD 22-01 is legally binding only for federal civilian
            executive branch agencies, CISA explicitly recommends that all
            organizations use the KEV catalog as an input to their
            vulnerability management prioritization. The reasoning is
            straightforward: if a vulnerability is confirmed as actively
            exploited, it represents a clear and present risk regardless of
            your organization type.
          </p>
          <p className="text-sm muted">
            Many private-sector security teams have adopted the KEV catalog as
            a mandatory remediation trigger. If a CVE appears on KEV, it goes
            to the top of the remediation queue regardless of its CVSS score.
            This is a pragmatic approach: CVSS tells you how bad a
            vulnerability could be, but KEV confirms that someone is already
            exploiting it.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            How CVEs Get Added to KEV
          </h2>
          <p className="text-sm muted">
            CISA has three criteria for adding a CVE to the KEV catalog:
          </p>
          <ol className="list-decimal pl-6 text-sm muted grid gap-1">
            <li>
              <strong>Assigned a CVE ID</strong> -- The vulnerability must have
              a formal CVE identifier.
            </li>
            <li>
              <strong>Active exploitation</strong> -- There must be reliable
              evidence that the vulnerability is being exploited in the wild.
              This evidence comes from CISA&apos;s own threat intelligence, partner
              agencies, and trusted industry sources.
            </li>
            <li>
              <strong>Clear remediation action</strong> -- A vendor-provided
              patch, update, or documented mitigation must be available.
            </li>
          </ol>
          <p className="text-sm muted">
            The combination of these criteria means that every KEV entry is
            both actionable (a fix exists) and urgent (exploitation is
            happening now). This makes the catalog particularly useful for
            operational triage: you know exactly what to fix and you know it
            needs to happen immediately.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            KEV and EPSS: Two Complementary Signals
          </h2>
          <p className="text-sm muted">
            The KEV catalog and{" "}
            <Link
              href="/blog/epss-scores-explained"
              className="font-medium underline underline-offset-2"
            >
              EPSS scores
            </Link>{" "}
            complement each other well. EPSS predicts exploitation probability
            based on statistical modeling. KEV confirms that exploitation has
            already occurred. Together, they provide a two-dimensional view of
            exploitation risk:
          </p>
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
            <ul className="list-disc pl-5 text-xs muted grid gap-1">
              <li><strong>On KEV + high EPSS</strong> -- Confirmed exploited and predicted to continue. Highest priority.</li>
              <li><strong>On KEV + low EPSS</strong> -- Confirmed exploited but possibly targeted or niche. Still high priority due to confirmed exploitation.</li>
              <li><strong>Not on KEV + high EPSS</strong> -- Not yet confirmed exploited but statistically likely. Treat as elevated risk.</li>
              <li><strong>Not on KEV + low EPSS</strong> -- Neither confirmed nor predicted. Lower priority, monitor normally.</li>
            </ul>
          </div>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            How ScanRook Uses CISA KEV
          </h2>
          <p className="text-sm muted">
            ScanRook automatically checks every CVE finding against the CISA
            KEV catalog. Findings that match a KEV entry are tagged with the
            KEV status, including the date the CVE was added to the catalog
            and the required remediation deadline. This tagging happens
            automatically during the enrichment phase -- no additional
            configuration is needed.
          </p>
          <p className="text-sm muted">
            In the ScanRook web dashboard, KEV-tagged findings are visually
            distinguished and can be filtered separately, making it easy to
            generate a remediation list of just the actively exploited
            vulnerabilities in your scan results.
          </p>
          <p className="text-sm muted">
            Learn more about how ScanRook combines KEV with other data sources
            in the{" "}
            <Link
              href="/docs/concepts/enrichment"
              className="font-medium underline underline-offset-2"
            >
              enrichment documentation
            </Link>{" "}
            and the{" "}
            <Link
              href="/docs/data-sources"
              className="font-medium underline underline-offset-2"
            >
              data sources reference
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Practical Recommendations
          </h2>
          <ol className="list-decimal pl-6 text-sm muted grid gap-1">
            <li>Treat all KEV-listed CVEs as mandatory remediation items regardless of CVSS score.</li>
            <li>Set SLA targets for KEV remediation that are shorter than your standard patching cycle.</li>
            <li>Use KEV as an escalation trigger in your ticketing system: if a scan finding matches KEV, auto-escalate to the responsible team.</li>
            <li>Monitor KEV additions regularly. CISA adds new entries frequently, and newly added CVEs may already affect your environment.</li>
            <li>Combine KEV status with EPSS percentiles and CVSS scores for a layered prioritization model.</li>
          </ol>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Further Reading
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link className="btn-secondary" href="/docs/concepts/enrichment">
              Enrichment docs
            </Link>
            <Link className="btn-secondary" href="/blog/epss-scores-explained">
              EPSS explained
            </Link>
            <Link className="btn-secondary" href="/docs/data-sources">
              Data sources
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
