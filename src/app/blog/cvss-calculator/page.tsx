import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-07";

const title = `CVSS Calculator: How to Read and Build a Vector String | ${APP_NAME}`;
const description =
  "A CVSS calculator turns metric selections into a vector string and 0-10 base score. How the v3.1 and v4.0 metrics work, with a worked example.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "cvss calculator",
    "cvss score calculator",
    "cvss vector string",
    "cvss base score",
    "cvss v3.1 calculator",
    "cvss 4.0 calculator",
    "how to calculate cvss score",
    "cvss severity ratings",
    "first.org cvss calculator",
    "cvss metrics explained",
  ],
  alternates: { canonical: "/blog/cvss-calculator" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/cvss-calculator",
    images: ["/blog/cvss-calculator.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/cvss-calculator.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "CVSS Calculator: How to Read and Build a Vector String",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/cvss-calculator",
  image: "https://scanrook.io/blog/cvss-calculator.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a CVSS calculator?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A CVSS calculator is a tool that turns a set of metric selections into a vector string and a numeric severity score from 0.0 to 10.0. The reference implementation is hosted by FIRST.org, the organization that maintains the Common Vulnerability Scoring System. You choose values for each metric and the calculator applies the official formula to produce the score.",
      },
    },
    {
      "@type": "Question",
      name: "How do I read a CVSS vector string?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A vector string is a compact record of every metric choice, like CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H. It starts with the version, then lists each metric as an abbreviation and value: AV:N means Attack Vector Network, C:H means High Confidentiality impact. The string lets anyone recompute the exact score and see the reasoning behind it.",
      },
    },
    {
      "@type": "Question",
      name: "What are the CVSS severity ranges?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In CVSS v3.1 the qualitative ratings are None at 0.0, Low from 0.1 to 3.9, Medium from 4.0 to 6.9, High from 7.0 to 8.9, and Critical from 9.0 to 10.0. These bands map a numeric base score onto a label so teams can set policy, such as blocking a build on any Critical finding.",
      },
    },
    {
      "@type": "Question",
      name: "What changed in CVSS 4.0?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CVSS 4.0 introduced the CVSS-B, CVSS-BT, CVSS-BE, and CVSS-BTE nomenclature, added an Attack Requirements metric, split impact into Vulnerable System and Subsequent System metrics instead of Scope, replaced Temporal with Threat metrics, and added Supplemental metrics like Safety and Automatable that describe a vulnerability without changing its score.",
      },
    },
    {
      "@type": "Question",
      name: "Should I prioritize purely by CVSS score?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The CVSS base score measures inherent severity, not the likelihood of exploitation in your environment. Two CVEs can both score 9.8 while one is under active attack and the other has no known exploit. Combine the base score with exploit signals like EPSS and the CISA KEV catalog, and with whether the vulnerable code is reachable.",
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
            CVSS Calculator: How to Read and Build a Vector String
          </h1>
          <p className="text-sm muted">Published November 7, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Every &ldquo;9.8 Critical&rdquo; you see next to a CVE came out of a CVSS calculator. It
            is not a black box: it is a fixed formula fed by a handful of metric choices, all
            recorded in a vector string you can read and recompute yourself. This guide explains what
            the CVSS calculator does, how each metric moves the score, and why the number is a
            starting point for prioritization rather than the whole answer.
          </p>
        </header>

        <img
          src="/blog/cvss-calculator.jpg"
          alt="CVSS calculator metrics and severity scale"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What a CVSS calculator does</h2>
          <p className="text-sm muted">
            CVSS &mdash; the Common Vulnerability Scoring System &mdash; is maintained by{" "}
            <strong>FIRST.org</strong>, and the reference calculator lives on their site. You select
            a value for each metric describing how a vulnerability can be exploited and what happens
            if it is, and the calculator applies the published equations to produce a score from
            <strong> 0.0 to 10.0</strong>. It also emits a <em>vector string</em>: a compact,
            standardized record of every choice you made. That string is the important artifact
            &mdash; it makes the score reproducible and transparent, so anyone can see exactly why a
            vulnerability scored what it did. The mechanics of how scores flow into the National
            Vulnerability Database are covered in{" "}
            <Link href="/blog/understanding-nvd-and-cvss" className="underline">
              Understanding the NVD and CVSS
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The base metric groups (v3.1)</h2>
          <p className="text-sm muted">
            The base score is built from two families of metrics. <strong>Exploitability</strong>
            describes how hard the vulnerability is to trigger; <strong>Impact</strong> describes the
            damage if it is triggered. A <strong>Scope</strong> metric links them.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Attack Vector (AV):</strong> Network, Adjacent, Local, or Physical &mdash; how
              far the attacker has to be. Network (remotely exploitable) raises the score most.
            </li>
            <li>
              <strong>Attack Complexity (AC):</strong> Low or High &mdash; whether exploitation needs
              special conditions outside the attacker&apos;s control.
            </li>
            <li>
              <strong>Privileges Required (PR):</strong> None, Low, or High &mdash; what access the
              attacker must already have.
            </li>
            <li>
              <strong>User Interaction (UI):</strong> None or Required &mdash; whether a victim has
              to do something, like click a link.
            </li>
            <li>
              <strong>Scope (S):</strong> Unchanged or Changed &mdash; whether the impact stays
              within the vulnerable component or spills into others.
            </li>
            <li>
              <strong>Confidentiality, Integrity, Availability (C / I / A):</strong> None, Low, or
              High &mdash; the impact on each of the three security properties.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A worked example</h2>
          <p className="text-sm muted">
            Consider a remotely exploitable, unauthenticated remote-code-execution flaw &mdash; the
            classic worst case. Every exploitability metric is at its most favorable for the attacker
            and every impact is High:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H  ->  9.8 (Critical)

AV:N  Attack Vector: Network      (reachable over the network)
AC:L  Attack Complexity: Low      (no special conditions)
PR:N  Privileges Required: None   (no account needed)
UI:N  User Interaction: None      (no victim action)
S:U   Scope: Unchanged
C:H / I:H / A:H  full impact on confidentiality, integrity, availability`}</pre>
          <p className="text-sm muted">
            Change one metric and the number moves. Require the attacker to already hold low
            privileges (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">PR:L</code>),
            or require a user to click something (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">UI:R</code>),
            and the score drops out of Critical, because the vulnerability is genuinely harder to
            weaponize. That sensitivity is the whole point: the vector encodes the reasoning, not
            just the verdict.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Score to severity: the rating bands</h2>
          <p className="text-sm muted">
            A numeric score is mapped onto a qualitative label using fixed ranges. These bands are
            what most policies actually reference &mdash; &ldquo;fail the build on Critical&rdquo; is
            a statement about the 9.0&ndash;10.0 range:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 680 110" role="img" aria-label="CVSS v3.1 severity rating bands on a 0 to 10 scale: Low 0.1 to 3.9, Medium 4.0 to 6.9, High 7.0 to 8.9, Critical 9.0 to 10.0." className="w-full max-w-2xl mx-auto">
              <g fontSize="12" textAnchor="middle">
                <text x="166" y="26" fill="currentColor">Low</text>
                <text x="369" y="26" fill="currentColor">Medium</text>
                <text x="514" y="26" fill="currentColor">High</text>
                <text x="601" y="26" fill="currentColor">Critical</text>

                <rect x="50" y="38" width="232" height="28" fill="#facc15" fillOpacity="0.85" />
                <rect x="282" y="38" width="174" height="28" fill="#fb923c" fillOpacity="0.85" />
                <rect x="456" y="38" width="116" height="28" fill="#f87171" fillOpacity="0.9" />
                <rect x="572" y="38" width="58" height="28" fill="#dc2626" fillOpacity="0.9" />

                <g stroke="currentColor" strokeOpacity="0.35" strokeWidth="1">
                  <line x1="50" y1="66" x2="50" y2="76" />
                  <line x1="282" y1="66" x2="282" y2="76" />
                  <line x1="456" y1="66" x2="456" y2="76" />
                  <line x1="572" y1="66" x2="572" y2="76" />
                  <line x1="630" y1="66" x2="630" y2="76" />
                </g>
                <g fontSize="11" fill="currentColor" fillOpacity="0.8">
                  <text x="50" y="90">0</text>
                  <text x="282" y="90">4.0</text>
                  <text x="456" y="90">7.0</text>
                  <text x="572" y="90">9.0</text>
                  <text x="630" y="90">10.0</text>
                </g>
              </g>
            </svg>
          </div>
          <p className="text-sm muted">
            A base score of exactly <strong>0.0</strong> is rated <strong>None</strong>. The bands
            above are the official CVSS v3.1 qualitative severity ratings; a scanner that shows you
            &ldquo;Critical&rdquo; is applying this same mapping to the computed base score.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Temporal and Environmental metrics</h2>
          <p className="text-sm muted">
            The base score is meant to be stable &mdash; the intrinsic severity of the flaw. CVSS
            v3.1 layers two optional groups on top. <strong>Temporal</strong> metrics adjust for the
            current state of the world: Exploit Code Maturity (E), Remediation Level (RL), and Report
            Confidence (RC). They can only hold the score steady or lower it &mdash; a flaw with no
            known exploit and an official patch is less urgent than the base alone suggests.{" "}
            <strong>Environmental</strong> metrics let you re-score for <em>your</em> deployment:
            override the base metrics for your context and weight Confidentiality, Integrity, and
            Availability requirements (CR / IR / AR) by how much each matters to you. Most published
            scores are base-only, but the environmental group is where CVSS becomes genuinely useful
            for internal prioritization.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What the CVSS 4.0 calculator changed</h2>
          <p className="text-sm muted">
            CVSS 4.0, published in 2023, reworked the model. It introduced explicit nomenclature
            &mdash; <strong>CVSS-B</strong> (base only), <strong>CVSS-BT</strong> (base + threat),{" "}
            <strong>CVSS-BE</strong> (base + environmental), and <strong>CVSS-BTE</strong> &mdash; to
            make clear which metric groups a score actually used. It added an <strong>Attack
            Requirements (AT)</strong> metric, expanded User Interaction to None / Passive / Active,
            and replaced the single Scope metric with separate <strong>Vulnerable System</strong>
            (VC / VI / VA) and <strong>Subsequent System</strong> (SC / SI / SA) impact metrics.
            Temporal became the <strong>Threat</strong> group, and a new <strong>Supplemental</strong>
            group (Safety, Automatable, Recovery, and more) describes a vulnerability without
            affecting its score. We cover the full changeset in{" "}
            <Link href="/blog/cvss-4-0-explained" className="underline">
              CVSS 4.0 Explained
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why the score is a starting point, not the answer</h2>
          <p className="text-sm muted">
            A CVSS base score measures how bad a vulnerability <em>could</em> be, in the abstract. It
            says nothing about whether anyone is exploiting it, or whether the vulnerable code is
            even reachable in your build. Thousands of CVEs share the same 9.8, and treating them as
            equally urgent is how remediation queues become unworkable. The base score is one input;
            two others carry as much weight in practice:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Exploit probability.</strong>{" "}
              <Link href="/blog/epss-vulnerability-prioritization" className="underline">
                EPSS
              </Link>{" "}
              estimates the likelihood a CVE will be exploited in the near term &mdash; a far better
              triage signal than severity alone for a large backlog.
            </li>
            <li>
              <strong>Known exploitation.</strong> The{" "}
              <Link href="/blog/cisa-kev-guide" className="underline">
                CISA KEV catalog
              </Link>{" "}
              lists vulnerabilities under active attack. A KEV entry outranks a higher CVSS score
              that has no evidence of exploitation.
            </li>
            <li>
              <strong>Reachability.</strong> A vulnerable package that your code never calls is a
              lower real-world risk than its base score implies. Whether the flaw is a{" "}
              <Link href="/blog/what-is-a-cve" className="underline">
                genuine exposure
              </Link>{" "}
              in your context is the question that actually decides priority.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook records the CVSS vector and score for every finding, taken from whichever
            advisory source provides it, so you can see the reasoning behind a severity rather than a
            bare label. Because it matches each package against OSV, NVD, and Red Hat OVAL in
            parallel, it can surface a source-provided score even when one database has not yet scored
            a CVE &mdash; and it tags each finding with the source it came from and a confidence tier.
            The score is one column among several, which is exactly how CVSS is meant to be used:
            severity as input to prioritization, alongside exploit probability and reachability, not
            as the final word.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is a CVSS calculator?</h3>
              <p className="text-sm muted mt-1">
                A tool, hosted by FIRST.org, that turns metric selections into a vector string and a
                0.0&ndash;10.0 severity score using the official CVSS formula.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I read a vector string?</h3>
              <p className="text-sm muted mt-1">
                It lists the version and each metric as an abbreviation and value &mdash; AV:N is
                Attack Vector Network, C:H is High Confidentiality impact &mdash; so anyone can
                recompute the score.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What are the severity ranges?</h3>
              <p className="text-sm muted mt-1">
                None 0.0, Low 0.1&ndash;3.9, Medium 4.0&ndash;6.9, High 7.0&ndash;8.9, Critical
                9.0&ndash;10.0 in CVSS v3.1.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should I prioritize by CVSS alone?</h3>
              <p className="text-sm muted mt-1">
                No. Pair the base score with EPSS, the CISA KEV catalog, and reachability &mdash;
                severity is inherent risk, not likelihood of exploitation in your environment.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">See the vector, not just the label</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook records the CVSS vector and source for every finding, so you can read the
            reasoning behind a severity &mdash; and combine it with exploit and reachability signals
            instead of trusting a number in isolation.
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
            <Link href="/blog/cvss-4-0-explained" className="underline">
              CVSS 4.0 Explained
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-a-cve" className="underline">
              What Is a CVE?
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
