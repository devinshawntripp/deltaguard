import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";

const title = `EPSS Scores Explained: Exploit Prediction for Vulnerability Prioritization | ${APP_NAME}`;
const description =
  "What EPSS is, how percentile scores work, and why exploit probability is a better prioritization signal than CVSS severity alone.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "EPSS",
    "Exploit Prediction Scoring System",
    "vulnerability prioritization",
    "exploit probability",
    "CVSS",
    "FIRST.org",
    "ScanRook",
  ],
  alternates: {
    canonical: "/blog/epss-scores-explained",
  },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/epss-scores-explained",
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
    "EPSS Scores Explained: Exploit Prediction for Vulnerability Prioritization",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/epss-scores-explained",
  datePublished: "2026-02-27",
  dateModified: "2026-02-27",
};

export default function EpssExplainedPage() {
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
            EPSS Scores Explained: Exploit Prediction for Vulnerability
            Prioritization
          </h1>
          <p className="text-sm muted">
            Security teams face a constant challenge: hundreds or thousands of
            CVEs, limited remediation capacity, and no clear way to know which
            vulnerabilities will actually be exploited. The Exploit Prediction
            Scoring System (EPSS) provides a data-driven answer.
          </p>
        </header>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            What Is EPSS?
          </h2>
          <p className="text-sm muted">
            EPSS is a model developed by FIRST.org (the Forum of Incident
            Response and Security Teams) that estimates the probability that a
            CVE will be exploited in the wild within the next 30 days. The model
            is updated daily and produces a probability score between 0 and 1
            for every CVE in the NVD.
          </p>
          <p className="text-sm muted">
            Unlike CVSS, which rates the theoretical severity of a
            vulnerability based on its technical characteristics, EPSS
            predicts real-world exploitation activity. A vulnerability might
            have a CVSS score of 9.8 (Critical) but an EPSS probability of
            0.001, meaning that despite its severity, it is extremely unlikely
            to be exploited. Conversely, a Medium-severity vulnerability with
            an EPSS probability of 0.85 is very likely to see active
            exploitation.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            How EPSS Scores Are Calculated
          </h2>
          <p className="text-sm muted">
            The EPSS model uses machine learning trained on historical
            exploitation data. It considers dozens of features for each CVE,
            including:
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>Whether public exploit code exists (e.g., in Exploit-DB or Metasploit)</li>
            <li>The age of the CVE and time since publication</li>
            <li>CVSS base score metrics (attack vector, complexity, privileges required)</li>
            <li>The presence of the CVE in threat intelligence feeds</li>
            <li>References to security advisories, patches, and vendor bulletins</li>
            <li>Social media and dark web mentions</li>
          </ul>
          <p className="text-sm muted">
            The model outputs two values for each CVE: a probability (the raw
            likelihood of exploitation) and a percentile (how this CVE compares
            to all other CVEs). A percentile of 0.95 means this CVE has a
            higher exploitation probability than 95% of all known CVEs.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Understanding Percentiles
          </h2>
          <p className="text-sm muted">
            The percentile is often more actionable than the raw probability.
            Most CVEs have very low exploitation probabilities -- the median
            EPSS score is well below 0.01. Percentiles help teams set
            consistent thresholds regardless of shifts in the overall
            distribution.
          </p>
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
            <h3 className="text-sm font-semibold">Example Thresholds</h3>
            <ul className="list-disc pl-5 text-xs muted grid gap-1">
              <li><strong>95th percentile and above</strong> -- High exploitation likelihood. Remediate immediately.</li>
              <li><strong>70th to 95th percentile</strong> -- Moderate likelihood. Schedule for next patch cycle.</li>
              <li><strong>Below 70th percentile</strong> -- Low likelihood. Monitor but deprioritize.</li>
            </ul>
          </div>
          <p className="text-sm muted">
            These thresholds are examples. Teams should calibrate them based on
            their risk tolerance, asset criticality, and remediation capacity.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            EPSS vs. CVSS: Why Both Matter
          </h2>
          <p className="text-sm muted">
            CVSS and EPSS answer different questions. CVSS answers &quot;how bad
            could this be?&quot; while EPSS answers &quot;how likely is this to actually
            happen?&quot; Neither replaces the other. A comprehensive prioritization
            strategy uses both: CVSS to understand impact potential, EPSS to
            understand exploitation likelihood.
          </p>
          <p className="text-sm muted">
            Research has shown that prioritizing by CVSS alone results in
            significant over-remediation. Many Critical-severity CVEs are never
            exploited, while some Medium-severity CVEs with public exploits are
            widely attacked. EPSS helps teams focus their limited patching
            capacity where it matters most.
          </p>
          <p className="text-sm muted">
            For more on CVSS scoring, see our guide on{" "}
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
            How ScanRook Uses EPSS
          </h2>
          <p className="text-sm muted">
            ScanRook enriches every finding with EPSS data by default. Each
            finding in a scan report includes the EPSS probability, percentile,
            and the date the score was last updated. This data is fetched from
            the FIRST.org EPSS API and cached alongside NVD and OSV data.
          </p>
          <p className="text-sm muted">
            In the ScanRook web dashboard, findings can be sorted and filtered
            by EPSS percentile, making it straightforward to identify the
            vulnerabilities most likely to be exploited. Combined with{" "}
            <Link
              href="/blog/cisa-kev-guide"
              className="font-medium underline underline-offset-2"
            >
              CISA KEV tagging
            </Link>
            , teams get a clear picture of both predicted and confirmed
            exploitation activity.
          </p>
          <p className="text-sm muted">
            Learn more about ScanRook&apos;s enrichment pipeline in the{" "}
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
            Practical Recommendations
          </h2>
          <ol className="list-decimal pl-6 text-sm muted grid gap-1">
            <li>Use EPSS percentile thresholds to triage your backlog, not just CVSS severity ratings.</li>
            <li>Combine EPSS with CISA KEV status for a two-signal prioritization model: predicted exploitation plus confirmed exploitation.</li>
            <li>Revisit EPSS scores regularly. The model updates daily, and scores can change as new exploit code or threat intelligence emerges.</li>
            <li>Track EPSS trends over time. A CVE whose EPSS score is rising may warrant earlier attention even if it has not crossed your threshold yet.</li>
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
            <Link className="btn-secondary" href="/blog/cisa-kev-guide">
              CISA KEV guide
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
