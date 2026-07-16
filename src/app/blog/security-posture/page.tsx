import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-13";

const title = `Security Posture: What It Means and How to Measure It | ${APP_NAME}`;
const description =
  "Security posture is the overall state of your security controls. What it includes, the metrics that measure it, CSPM vs DSPM vs ASPM, and how to improve it.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "security posture",
    "what is security posture",
    "security posture management",
    "how to measure security posture",
    "cybersecurity posture",
    "cspm",
    "dspm",
    "aspm",
    "security posture metrics",
    "improve security posture",
    "vulnerability posture",
  ],
  alternates: { canonical: "/blog/security-posture" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/security-posture",
    images: ["/blog/security-posture.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/security-posture.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Security Posture: What It Means and How to Measure It",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/security-posture",
  image: "https://scanrook.io/blog/security-posture.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is security posture?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Security posture is the overall state of an organization's security: the combined strength of its controls, the exposures it currently carries, and its ability to detect and respond to attacks. It is an aggregate view across assets, vulnerabilities, configuration, identity, and data, measured at a point in time and, more usefully, tracked as a trend.",
      },
    },
    {
      "@type": "Question",
      name: "How do you measure security posture?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You measure it with a small set of directional metrics rather than a single score: remediation coverage (share of known issues fixed), mean time to remediate, vulnerability density per asset, the exposure window between disclosure and patch, and the percentage of critical or actively exploited findings still open. Trends over time matter more than any one snapshot.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between CSPM, DSPM, and ASPM?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They are posture management for different domains. CSPM (cloud security posture management) watches cloud configuration and compliance. DSPM (data security posture management) focuses on where sensitive data lives and who can reach it. ASPM (application security posture management) aggregates findings across the software development lifecycle. Each improves one slice of overall posture.",
      },
    },
    {
      "@type": "Question",
      name: "Is security posture the same as a risk score?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not quite. A risk score is one summarized number; posture is the underlying state that a score tries to compress. A single number is useful for reporting but hides which dimension is weak. Good posture management keeps the component metrics visible so teams can see whether the problem is unpatched vulnerabilities, misconfiguration, or slow response.",
      },
    },
    {
      "@type": "Question",
      name: "How can I improve my security posture?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Start with an accurate asset inventory, scan continuously so new exposures surface quickly, prioritize with exploit-based signals like KEV and EPSS rather than raw severity, set remediation SLAs by risk tier, and add guardrails earlier in the pipeline so issues are prevented rather than found in production. Then re-measure to confirm the trend is moving.",
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
          <div className="text-xs uppercase tracking-wide muted">Security Concepts</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Security Posture: What It Means and How to Measure It
          </h1>
          <p className="text-sm muted">Published November 13, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            &ldquo;Improve our security posture&rdquo; is one of the most-used and least-defined
            phrases in the industry. It sounds like a single dial you could turn up, but security
            posture is really an aggregate &mdash; the combined state of your assets, your
            vulnerabilities, your configuration, your identities, and how fast you can respond when
            something goes wrong. This guide defines it concretely and shows how to measure it without
            pretending it is one number.
          </p>
        </header>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What &ldquo;posture&rdquo; actually describes</h2>
          <p className="text-sm muted">
            Security posture is the overall strength of an organization&apos;s security relative to the
            threats it faces. It spans three broad questions: how much exposure are we carrying right
            now, how good are the controls meant to reduce it, and how quickly can we detect and
            respond when a control fails? A strong posture is not the absence of vulnerabilities
            &mdash; that state does not exist &mdash; but a small, well-understood, quickly-shrinking
            set of exposures backed by controls that catch the ones that slip through.
          </p>
          <p className="text-sm muted">
            The most important word is <em>aggregate</em>. Posture is not any single finding; it is the
            shape of all of them together, and it is far more useful as a trend than as a snapshot. A
            report that says &ldquo;we have 4,000 open findings&rdquo; tells you almost nothing. A
            report that says &ldquo;critical findings are down 30% quarter over quarter and our median
            time to patch a known-exploited CVE fell from 40 days to 9&rdquo; tells you the posture is
            improving.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The dimensions of security posture</h2>
          <p className="text-sm muted">
            Posture is built from several independent inputs. Each can be strong or weak on its own,
            and the aggregate is only as good as its weakest dimension &mdash; a flawless patch program
            does not help if half your assets are undiscovered.
          </p>

          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 720 210" className="w-full" role="img" aria-label="Five posture dimensions feed an aggregate security posture that is tracked over time: asset inventory, vulnerabilities, configuration, identity and access, and data.">
              <g fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5">
                <rect x="10" y="20" width="132" height="44" rx="8" />
                <rect x="152" y="20" width="132" height="44" rx="8" />
                <rect x="294" y="20" width="132" height="44" rx="8" />
                <rect x="436" y="20" width="132" height="44" rx="8" />
                <rect x="578" y="20" width="132" height="44" rx="8" />
              </g>
              <g fill="currentColor" fontSize="12" fontWeight="600" textAnchor="middle">
                <text x="76" y="47">Assets</text>
                <text x="218" y="47">Vulnerabilities</text>
                <text x="360" y="47">Configuration</text>
                <text x="502" y="47">Identity</text>
                <text x="644" y="47">Data</text>
              </g>
              <g stroke="var(--dg-accent,#2563eb)" strokeWidth="2">
                <line x1="76" y1="64" x2="76" y2="118" />
                <line x1="218" y1="64" x2="218" y2="118" />
                <line x1="360" y1="64" x2="360" y2="118" />
                <line x1="502" y1="64" x2="502" y2="118" />
                <line x1="644" y1="64" x2="644" y2="118" />
              </g>
              <g fill="var(--dg-accent,#2563eb)">
                <polygon points="76,120 72,112 80,112" />
                <polygon points="218,120 214,112 222,112" />
                <polygon points="360,120 356,112 364,112" />
                <polygon points="502,120 498,112 506,112" />
                <polygon points="644,120 640,112 648,112" />
              </g>
              <rect x="10" y="122" width="700" height="44" rx="8" fill="var(--dg-accent,#2563eb)" fillOpacity="0.1" stroke="var(--dg-accent,#2563eb)" strokeOpacity="0.5" strokeWidth="1.5" />
              <text x="360" y="149" fill="currentColor" fontSize="13" fontWeight="700" textAnchor="middle">Aggregate security posture</text>
              <text x="360" y="192" fill="currentColor" fillOpacity="0.7" fontSize="11" textAnchor="middle">tracked as a trend over time &mdash; only as strong as its weakest dimension</text>
            </svg>
          </div>

          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Asset posture.</strong> Do you have an accurate, current inventory? Everything
              downstream assumes you know what exists, which is why discovery and attack surface
              management sit underneath posture.
            </li>
            <li>
              <strong>Vulnerability posture.</strong> How many known flaws are you carrying, how severe
              and exploitable are they, and how fast do you close them? This is the dimension scanning
              measures most directly.
            </li>
            <li>
              <strong>Configuration posture.</strong> Are systems hardened to a known baseline, or drifting
              toward insecure defaults? Cloud misconfiguration is a leading cause of real breaches.
            </li>
            <li>
              <strong>Identity posture.</strong> Are permissions least-privilege, is MFA enforced, are
              stale accounts and over-scoped roles cleaned up?
            </li>
            <li>
              <strong>Data posture.</strong> Do you know where sensitive data lives and who can reach it?
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The posture-management acronym family</h2>
          <p className="text-sm muted">
            Because posture spans so many domains, the tooling market has split into specialized
            &ldquo;posture management&rdquo; categories. They are not competitors so much as flashlights
            pointed at different rooms:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Category</th>
                  <th className="text-left py-2 pr-4 font-semibold">Full name</th>
                  <th className="text-left py-2 font-semibold">What it manages</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>CSPM</strong></td>
                  <td className="py-2 pr-4 align-top">Cloud Security Posture Management</td>
                  <td className="py-2 align-top">Cloud configuration, drift, and compliance across accounts</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>DSPM</strong></td>
                  <td className="py-2 pr-4 align-top">Data Security Posture Management</td>
                  <td className="py-2 align-top">Where sensitive data lives, flows, and who can access it</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>ASPM</strong></td>
                  <td className="py-2 pr-4 align-top">Application Security Posture Management</td>
                  <td className="py-2 align-top">Findings correlated across the software development lifecycle</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top"><strong>CAASM</strong></td>
                  <td className="py-2 pr-4 align-top">Cyber Asset Attack Surface Management</td>
                  <td className="py-2 align-top">A unified asset inventory reconciled from existing tools</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            You do not need every acronym to have good posture. You need coverage of the dimensions
            that matter for your environment, and a way to see them together rather than in five
            disconnected dashboards.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Metrics that actually measure posture</h2>
          <p className="text-sm muted">
            Avoid the vanity metric of &ldquo;total findings.&rdquo; It goes up when you scan more
            thoroughly, which punishes the right behavior. Track directional metrics that reward
            reducing real risk:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Remediation coverage.</strong> The share of known issues that are fixed, ideally
              sliced by severity and by whether the flaw is actively exploited.
            </li>
            <li>
              <strong>Mean time to remediate (MTTR).</strong> How long a finding stays open from
              detection to fix. Segment it &mdash; time-to-fix for a KEV-listed critical should be far
              shorter than for a low.
            </li>
            <li>
              <strong>Exposure window.</strong> The gap between a vulnerability being disclosed and you
              patching it. This is the interval an attacker actually gets to use.
            </li>
            <li>
              <strong>Vulnerability density.</strong> Findings per asset or per service, which
              normalizes for growth so a bigger fleet does not look worse by default.
            </li>
            <li>
              <strong>Percentage of critical / exploited findings open.</strong> The tail that matters
              most. A small number here beats a huge total of lows.
            </li>
          </ul>
          <p className="text-sm muted">
            These are directional, not precise. Their value is the slope: measured consistently over
            time, they tell you whether posture is getting better or quietly eroding. Prioritizing them
            well means leaning on{" "}
            <Link href="/blog/epss-vulnerability-prioritization" className="underline">
              exploit-probability signals like EPSS
            </Link>{" "}
            and{" "}
            <Link href="/blog/cisa-kev-guide" className="underline">
              the CISA KEV catalog
            </Link>{" "}
            rather than raw severity counts.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How to improve it</h2>
          <p className="text-sm muted">
            Improving posture is unglamorous and repeatable. Know what you have, find what is wrong,
            fix the things that matter first, and prove the trend moved. Concretely:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Fix the inventory first.</strong> A scan of an incomplete asset list produces a
              clean report and a false sense of safety.
            </li>
            <li>
              <strong>Scan continuously.</strong> A newly disclosed CVE in a component you already ship
              should surface within hours, not at the next quarterly audit &mdash; the core of a{" "}
              <Link href="/blog/vulnerability-management-guide" className="underline">
                vulnerability management lifecycle
              </Link>
              .
            </li>
            <li>
              <strong>Prioritize by risk, not volume.</strong> Route findings through a repeatable{" "}
              <Link href="/blog/how-to-triage-vulnerability-scan-results" className="underline">
                triage process
              </Link>{" "}
              that weighs severity, exploitability, and reachability together.
            </li>
            <li>
              <strong>Set SLAs by tier.</strong> Give each risk tier a fix deadline and measure against
              it, so &ldquo;we will get to it&rdquo; becomes an accountable date.
            </li>
            <li>
              <strong>Move controls earlier.</strong> Guardrails in CI prevent whole classes of issues
              from ever reaching production, which improves posture more cheaply than finding them later.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook is not a posture management platform &mdash; it does not reconcile cloud
            configuration, identity, or data flows, and it would be misleading to claim it summarizes
            your whole posture into one score. What it does is make the <em>vulnerability dimension</em>{" "}
            trustworthy. Because posture is only as strong as its measurement, a scanner that
            under-reports quietly inflates how good your posture looks.
          </p>
          <p className="text-sm muted">
            ScanRook matches every package in your container images, binaries, and source archives
            against OSV, NVD, and vendor advisory data in parallel, and tags each finding with its
            source and a confidence tier. That gives the vulnerability metrics feeding your posture a
            solid, multi-source foundation &mdash; accurate counts, real severities, and a clear view
            of what is exploitable &mdash; so the trend you report reflects reality rather than a single
            database&apos;s blind spots.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is there a single security posture score?</h3>
              <p className="text-sm muted mt-1">
                Vendors will sell you one, but a single number compresses away which dimension is weak.
                Use a summary score for reporting if you must, and keep the component metrics visible so
                you know what to actually fix.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How often should posture be measured?</h3>
              <p className="text-sm muted mt-1">
                Continuously for the inputs, and reviewed on a regular cadence for the trend. Posture
                that is only assessed at audit time is stale by the time anyone reads the report.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does more scanning worsen my posture?</h3>
              <p className="text-sm muted mt-1">
                It raises your finding count, which is why total findings is a poor metric. Deeper
                scanning improves posture because you can only fix what you can see; measure remediation
                and time-to-fix instead.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Where does vulnerability scanning fit in posture?</h3>
              <p className="text-sm muted mt-1">
                It supplies the vulnerability dimension &mdash; one of several inputs. Accurate scanning
                keeps that dimension honest so the aggregate posture, and the metrics you report, are not
                built on undercounts.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Measure the vulnerability dimension honestly</h3>
          <p className="text-sm muted leading-relaxed">
            Posture is only as good as its measurement. ScanRook matches every component in your
            artifacts against OSV, NVD, and vendor advisory data, so the vulnerability metrics feeding
            your posture reflect what is really there &mdash; each finding tagged by source and confidence.
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
            <Link href="/blog/vulnerability-management-guide" className="underline">
              Vulnerability Management Lifecycle
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/how-to-triage-vulnerability-scan-results" className="underline">
              How to Triage Scan Results
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/epss-vulnerability-prioritization" className="underline">
              EPSS Prioritization
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
