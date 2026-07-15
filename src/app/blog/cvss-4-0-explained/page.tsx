import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-01";

const title = `CVSS 4.0 Explained: What Changed From v3.1 and Why | ${APP_NAME}`;
const description =
  "CVSS 4.0 explained: the CVSS-B/BT/BTE nomenclature, new metrics like Attack Requirements and Safety, and how the 2023 revision changes severity scoring.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "cvss 4.0",
    "cvss 4.0 explained",
    "cvss v4.0",
    "cvss 4.0 vs 3.1",
    "cvss base threat environmental",
    "cvss attack requirements",
    "cvss 4.0 supplemental metrics",
    "cvss 4.0 safety metric",
    "cvss-b cvss-bt cvss-bte",
    "cvss 4.0 scoring",
  ],
  alternates: { canonical: "/blog/cvss-4-0-explained" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/cvss-4-0-explained",
    images: ["/blog/cvss-4-0-explained.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/cvss-4-0-explained.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "CVSS 4.0 Explained: What Changed From v3.1 and Why",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/cvss-4-0-explained",
  image: "https://scanrook.io/blog/cvss-4-0-explained.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is CVSS 4.0?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CVSS 4.0 is the version of the Common Vulnerability Scoring System that FIRST published in November 2023. It revises the metric groups, replaces the Scope metric with separate impact ratings for the vulnerable and subsequent systems, adds an Attack Requirements metric and an optional Supplemental group, and introduces clearer nomenclature to discourage relying on the base score alone.",
      },
    },
    {
      "@type": "Question",
      name: "What do CVSS-B, CVSS-BT, and CVSS-BTE mean?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They are the official names for how much of the metric set a score reflects. CVSS-B uses only Base metrics. CVSS-BT adds Threat metrics. CVSS-BE adds Environmental metrics. CVSS-BTE uses Base, Threat, and Environmental together. The nomenclature exists so a bare Base score is not mistaken for a full, context-aware assessment.",
      },
    },
    {
      "@type": "Question",
      name: "What is the Attack Requirements metric?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Attack Requirements (AT) is a new Base metric in CVSS 4.0 that captures prerequisite conditions of the vulnerable system an attacker cannot control, such as a race condition or a specific configuration. It is separate from Attack Complexity, which now focuses on the effort an attacker spends evading or overcoming defenses. AT is scored as None or Present.",
      },
    },
    {
      "@type": "Question",
      name: "What happened to the Scope metric?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CVSS 4.0 removed Scope. Instead of a single changed-or-unchanged flag, impact is now rated separately for the Vulnerable System (VC, VI, VA) and any Subsequent System (SC, SI, SA). This makes cross-system impact explicit rather than collapsing it into one hard-to-apply metric.",
      },
    },
    {
      "@type": "Question",
      name: "Should I replace CVSS 3.1 scores with 4.0?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not mechanically. The two versions use different metrics and formulas, so their numbers are not interchangeable. Adoption is gradual and many CVEs still carry only a 3.1 vector. Use whichever version a record provides, avoid comparing scores across versions as if equal, and combine either with exploit signals like EPSS and KEV for prioritization.",
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
            CVSS 4.0 Explained: What Changed From v3.1 and Why
          </h1>
          <p className="text-sm muted">Published September 1, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            <strong>CVSS 4.0</strong> is the first major revision of the Common Vulnerability Scoring
            System since 2015. FIRST published it in November 2023 to fix long-standing complaints:
            too many vulnerabilities clustered at the same score, the Scope metric was hard to apply
            consistently, and almost everyone used only the base score. This is a plain-English tour
            of what actually changed and how to read a 4.0 vector.
          </p>
        </header>

        <img
          src="/blog/cvss-4-0-explained.jpg"
          alt="CVSS 4.0 metric groups and vector string explained"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The problem 4.0 set out to solve</h2>
          <p className="text-sm muted">
            The most persistent criticism of CVSS was not any single metric &mdash; it was how the
            score got used. Most organizations treated the base score as the score, even though the
            base metrics deliberately describe a vulnerability in the abstract, with no knowledge of
            whether it is being exploited or where it sits in your environment. The result was a lot
            of vulnerabilities piled up in the 9.0-plus range and remediation queues sorted by a
            number that ignored real-world risk. We cover how the 3.1 base score is built in{" "}
            <Link href="/blog/understanding-nvd-and-cvss" className="underline">
              understanding the NVD and CVSS
            </Link>
            ; 4.0 keeps that foundation and reworks the layers around it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">New nomenclature: B, BT, BE, BTE</h2>
          <p className="text-sm muted">
            CVSS 4.0&apos;s most quietly important change is naming. A score now carries a label for
            how much of the metric set it reflects:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li><strong>CVSS-B</strong> &mdash; Base metrics only. The intrinsic, context-free rating.</li>
            <li><strong>CVSS-BT</strong> &mdash; Base plus Threat metrics (exploit maturity).</li>
            <li><strong>CVSS-BE</strong> &mdash; Base plus Environmental metrics (your deployment).</li>
            <li><strong>CVSS-BTE</strong> &mdash; Base, Threat, and Environmental together.</li>
          </ul>
          <p className="text-sm muted">
            The point is honesty about completeness. A bare CVSS-B number is explicitly an
            incomplete picture, and the label makes that visible so a base score is not mistaken for a
            full, environment-aware assessment. It nudges teams toward enriching the score with threat
            and environmental context instead of stopping at the number a database hands them.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Changes to the Base metrics</h2>
          <p className="text-sm muted">
            The Base group gained real granularity. Three changes matter most:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Attack Requirements (AT)</strong> is new. It captures prerequisite conditions of
              the vulnerable system that the attacker does not control &mdash; a race window, a
              particular configuration &mdash; and is scored None or Present. It splits apart what
              3.1 crammed into Attack Complexity, which now focuses narrowly on the effort an attacker
              spends defeating defenses.
            </li>
            <li>
              <strong>User Interaction (UI)</strong> is no longer a yes/no. It now distinguishes None,
              Passive, and Active interaction, so &ldquo;the victim has to do something&rdquo; can
              reflect how much they have to do.
            </li>
            <li>
              <strong>Scope is gone.</strong> In its place, impact is rated twice: for the Vulnerable
              System (Confidentiality, Integrity, Availability as VC, VI, VA) and for any Subsequent
              System affected downstream (SC, SI, SA). Cross-system blast radius is now explicit
              rather than a single flag people applied inconsistently.
            </li>
          </ul>
          <p className="text-sm muted">
            A full 4.0 vector string reflects this expanded Base set. It starts with the version tag
            and lists the metrics in order:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Threat metrics replace Temporal</h2>
          <p className="text-sm muted">
            The old Temporal group is renamed to the Threat group and simplified down to a single
            metric: <strong>Exploit Maturity (E)</strong>, describing whether exploit code or active
            exploitation is known. The 3.1 Remediation Level and Report Confidence metrics were
            dropped. Applying Threat data pulls a score toward reality &mdash; a critical-looking flaw
            with no known exploit is a different problem from one being used in the wild &mdash; which
            is the same instinct behind exploit-probability signals like{" "}
            <Link href="/blog/epss-scores-explained" className="underline">
              EPSS
            </Link>{" "}
            and the{" "}
            <Link href="/blog/cisa-kev-guide" className="underline">
              CISA KEV catalog
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The Supplemental group and Safety</h2>
          <p className="text-sm muted">
            CVSS 4.0 adds an optional <strong>Supplemental</strong> metric group that carries context
            without changing the numeric score. It includes Safety, Automatable, Recovery, Value
            Density, Vulnerability Response Effort, and Provider Urgency. These let a scoring party
            communicate nuance &mdash; for instance that a flaw is trivially automatable, or that
            recovery after exploitation is difficult &mdash; that a single number cannot express.
          </p>
          <p className="text-sm muted">
            <strong>Safety</strong> is the standout addition. It acknowledges that in operational
            technology, industrial control, and medical contexts, a vulnerability can put human
            safety at risk, not just data. Safety appears both as a Supplemental metric and as a
            possible value for subsequent-system impact in the Environmental metrics, aligning CVSS
            with how safety-critical industries already think about consequences. If your systems have
            a physical-world impact, this is the change most worth learning.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scoring and severity bands</h2>
          <p className="text-sm muted">
            Under the hood, 4.0 replaces 3.1&apos;s closed-form equation with a methodology based on
            expert-rated reference vectors, intended to spread scores more evenly and reduce the
            pile-up at the top. The qualitative severity bands are unchanged and still map a 0.0-10.0
            score to None (0.0), Low (0.1-3.9), Medium (4.0-6.9), High (7.0-8.9), and Critical
            (9.0-10.0). Because the metrics and the math differ from 3.1, a 4.0 number and a 3.1
            number are not directly comparable &mdash; treat them as scores from two different rulers
            that happen to share a scale.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What it means in practice</h2>
          <p className="text-sm muted">
            Adoption is gradual. Vendors and databases are issuing 4.0 vectors on newer records while
            an enormous back catalog still carries only 3.1, and the ongoing{" "}
            <Link href="/blog/nvd-backlog-explained" className="underline">
              NVD enrichment backlog
            </Link>{" "}
            means some records arrive with no score at all. For the foreseeable future you will handle
            a mix. The practical guidance is simple: use whatever version a{" "}
            <Link href="/blog/what-is-a-cve" className="underline">
              CVE record
            </Link>{" "}
            actually provides, do not convert or compare scores across versions, and never let any
            CVSS number &mdash; 3.1 or 4.0 &mdash; be your only prioritization input.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook surfaces the severity data attached to each finding from the source that carries
            it, whether that is a 4.0 vector, a 3.1 vector, or a vendor rating, and tags which source
            it came from so you can see when they disagree. CVSS tells you how bad a vulnerability
            could be in the abstract; it does not tell you whether the affected package is even
            present in your image. That is the job ScanRook does first &mdash; establishing what you
            actually ship &mdash; so the scores you triage are attached to real components rather than
            a theoretical inventory. From there, layering exploit signals like EPSS and KEV on top of
            the base severity gets you far closer to a defensible remediation order than any single
            number.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is CVSS 4.0?</h3>
              <p className="text-sm muted mt-1">
                The version of the Common Vulnerability Scoring System FIRST published in November
                2023, revising the metric groups, replacing Scope, and adding new nomenclature.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What do CVSS-B, BT, and BTE mean?</h3>
              <p className="text-sm muted mt-1">
                Labels for scope of the score: Base only, Base plus Threat, and Base plus Threat plus
                Environmental &mdash; so a bare base score is not mistaken for a full assessment.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What happened to Scope?</h3>
              <p className="text-sm muted mt-1">
                It was removed. Impact is now rated separately for the Vulnerable System (VC/VI/VA)
                and any Subsequent System (SC/SI/SA).
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should I replace 3.1 scores with 4.0?</h3>
              <p className="text-sm muted mt-1">
                No. The metrics and formulas differ, so scores are not interchangeable. Use whichever
                version a record provides and add exploit signals for prioritization.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scores are only useful on real components</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook establishes what your image actually ships, then attaches severity from whichever
            source provides it &mdash; so you triage CVSS scores against present packages, not a
            theoretical list.
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
            <Link href="/blog/epss-scores-explained" className="underline">
              EPSS Scores Explained
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
