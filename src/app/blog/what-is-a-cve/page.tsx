import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";

const title = `What Is a CVE? A Plain-English Guide to Vulnerability IDs | ${APP_NAME}`;
const description =
  "What a CVE is, what the ID format means, who assigns them, and how the CVE lifecycle works. Plus how CVE relates to CVSS, CWE, EPSS, and KEV, and how scanners match CVEs to your software.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "what is a cve",
    "what is a cve in cybersecurity",
    "common vulnerabilities and exposures",
    "cve meaning",
    "cve id format",
    "cve vs cvss",
    "cve vs cwe",
    "cve numbering authority",
    "how cve works",
    "cve database",
  ],
  alternates: {
    canonical: "/blog/what-is-a-cve",
  },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/what-is-a-cve",
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
  headline: "What Is a CVE? A Plain-English Guide to Vulnerability IDs",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/what-is-a-cve",
  datePublished: "2026-06-03",
  dateModified: "2026-06-03",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a CVE?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A CVE (Common Vulnerabilities and Exposures) is a unique identifier for a publicly disclosed security vulnerability. The CVE program, run by MITRE and sponsored by CISA, assigns each vulnerability an ID like CVE-2021-44228 so that everyone — vendors, researchers, and scanners — can refer to the same flaw unambiguously.",
      },
    },
    {
      "@type": "Question",
      name: "What does the CVE ID format mean?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A CVE ID has three parts: the CVE prefix, the year it was reserved, and a sequence number, for example CVE-2024-3094. The year is when the ID was assigned, not necessarily when the bug was found or disclosed. The sequence number has no fixed length and can be four or more digits.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between a CVE and a CVSS score?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A CVE is the identifier for a vulnerability; a CVSS score is a 0-10 number that rates that vulnerability's severity. One CVE has one CVSS base score. CVE answers 'which vulnerability?' and CVSS answers 'how severe is it?'",
      },
    },
    {
      "@type": "Question",
      name: "Who assigns CVE IDs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CVE IDs are assigned by CVE Numbering Authorities (CNAs) — over 350 organizations including software vendors like Microsoft, Red Hat, and GitHub, as well as MITRE itself. Each CNA can assign IDs for vulnerabilities in its own products or scope.",
      },
    },
    {
      "@type": "Question",
      name: "Does every vulnerability get a CVE?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Many vulnerabilities are fixed quietly without a CVE, and some ecosystems track advisories that never receive a CVE ID. This is one reason scanners query multiple databases — NVD, OSV, GHSA, and vendor trackers — rather than relying on CVE records alone.",
      },
    },
  ],
};

export default function WhatIsACvePage() {
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
            What Is a CVE? A Plain-English Guide to Vulnerability IDs
          </h1>
          <p className="text-sm muted">Published June 3, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            If you have ever run a vulnerability scan, you have seen identifiers like
            CVE-2021-44228 scroll past. CVE is the shared vocabulary the entire security industry
            uses to name vulnerabilities. This guide explains what a CVE is, how the system works,
            and how it connects to the other acronyms &mdash; CVSS, CWE, EPSS, KEV &mdash; you will run
            into right beside it.
          </p>
        </header>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">CVE, defined</h2>
          <p className="text-sm muted">
            <strong>CVE</strong> stands for <strong>Common Vulnerabilities and Exposures</strong>. A
            CVE is a unique, public identifier assigned to a single security vulnerability so that
            everyone can refer to the same flaw without ambiguity. Before CVE existed, two security
            tools might describe the same bug in completely different terms; the CVE program, launched
            in 1999, gave the world one name per vulnerability.
          </p>
          <p className="text-sm muted">
            A CVE record is deliberately minimal. At its core it contains an ID, a short description
            of the vulnerability, and references &mdash; links to advisories, patches, and research.
            It is a catalog entry, not a full technical report. The severity scoring and software
            matching that make a CVE actionable are added by other systems layered on top.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Reading a CVE ID</h2>
          <p className="text-sm muted">
            Every CVE ID follows the same pattern. Take{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CVE-2021-44228</code>{" "}
            (the Log4Shell vulnerability):
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li><strong>CVE</strong> &mdash; the fixed prefix, identifying it as a CVE record.</li>
            <li><strong>2021</strong> &mdash; the year the ID was <em>reserved</em>, which is not always the year the bug was disclosed.</li>
            <li><strong>44228</strong> &mdash; an arbitrary sequence number. It has no fixed length; since 2014 it can be four or more digits, so high-volume years produce six- and seven-digit numbers.</li>
          </ul>
          <p className="text-sm muted">
            A common misconception is that a higher sequence number means a more recent or more severe
            bug. It means neither &mdash; the number is just the next one available when the ID was
            assigned.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Who runs the CVE program?</h2>
          <p className="text-sm muted">
            The CVE program is operated by{" "}
            <a href="https://www.cve.org/" target="_blank" rel="noopener noreferrer" className="underline">
              the CVE Program
            </a>{" "}
            at the MITRE Corporation, a US non-profit, and is sponsored by CISA (the US Cybersecurity
            and Infrastructure Security Agency). MITRE does not personally catalog every vulnerability
            on Earth. Instead, the work is distributed across <strong>CVE Numbering Authorities (CNAs)</strong>.
          </p>
          <p className="text-sm muted">
            A CNA is an organization authorized to assign CVE IDs within a defined scope. There are
            over 350 of them, including major vendors like Microsoft, Red Hat, Google, Apple, Oracle,
            and GitHub. When a vulnerability is found in Red Hat&apos;s products, Red Hat (as a CNA) can
            assign the CVE itself. This federation is what lets the program keep up with tens of
            thousands of new vulnerabilities a year.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The CVE lifecycle</h2>
          <p className="text-sm muted">
            A CVE moves through a predictable set of states from discovery to a fully enriched record:
          </p>
          <ol className="text-sm muted list-decimal pl-5 grid gap-1.5">
            <li><strong>Discovery &amp; report.</strong> A researcher or vendor finds a flaw and reports it, usually under coordinated disclosure.</li>
            <li><strong>Reserved.</strong> A CNA reserves a CVE ID. At this stage the ID exists but details are withheld &mdash; you may see a status of &ldquo;RESERVED&rdquo; with no description.</li>
            <li><strong>Published.</strong> Once the issue is disclosed (often alongside a patch), the CNA publishes the description and references.</li>
            <li><strong>Enriched.</strong> The{" "}
              <Link href="/blog/understanding-nvd-and-cvss" className="underline">National Vulnerability Database (NVD)</Link>{" "}
              and others add a CVSS severity score, CPE product identifiers, and weakness classifications. This is what turns a bare ID into something a scanner can act on.
            </li>
          </ol>
          <p className="text-sm muted">
            That enrichment step matters in practice. In 2024 the NVD fell badly behind on enriching
            new CVEs, which left many records published but un-scored for weeks. Modern scanners work
            around this by pulling data from several sources rather than waiting on a single one.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">CVE vs CVSS vs CWE vs EPSS vs KEV</h2>
          <p className="text-sm muted">
            These acronyms travel together and are constantly confused. Here is the one-line
            distinction for each:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Term</th>
                  <th className="text-left py-2 pr-4 font-semibold">Answers the question</th>
                  <th className="text-left py-2 font-semibold">Example</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>CVE</strong></td>
                  <td className="py-2 pr-4">Which vulnerability is it?</td>
                  <td className="py-2">CVE-2021-44228</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>CVSS</strong></td>
                  <td className="py-2 pr-4">How severe is it (0&ndash;10)?</td>
                  <td className="py-2">10.0 (Critical)</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>CWE</strong></td>
                  <td className="py-2 pr-4">What class of weakness is it?</td>
                  <td className="py-2">CWE-502 (unsafe deserialization)</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>EPSS</strong></td>
                  <td className="py-2 pr-4">How likely is it to be exploited?</td>
                  <td className="py-2">0.94 (94% in 30 days)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top"><strong>KEV</strong></td>
                  <td className="py-2 pr-4">Is it being exploited right now?</td>
                  <td className="py-2">Listed in CISA KEV</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            A CVE is the noun; the others are adjectives that describe it. We cover{" "}
            <Link href="/blog/understanding-nvd-and-cvss" className="underline">CVSS scoring</Link>,{" "}
            <Link href="/blog/epss-scores-explained" className="underline">EPSS</Link>, and the{" "}
            <Link href="/blog/cisa-kev-guide" className="underline">CISA KEV catalog</Link> in their
            own deep dives.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where CVE data lives</h2>
          <p className="text-sm muted">
            The canonical list of CVE records is published by the CVE program itself, but most tools
            consume CVE data through downstream databases that add their own value:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li><strong>NVD</strong> &mdash; adds CVSS scores and CPE product matching on top of CVE records.</li>
            <li><strong>OSV</strong> &mdash; open-source-focused, with precise affected-version ranges per ecosystem.</li>
            <li><strong>GHSA</strong> &mdash; GitHub Security Advisories, strong on npm, pip, and other package managers.</li>
            <li><strong>Vendor trackers</strong> &mdash; Red Hat, Debian, and Ubuntu publish their own data that accounts for backported fixes.</li>
          </ul>
          <p className="text-sm muted">
            No single source is complete, which is why good scanners merge several. For a side-by-side
            breakdown, see{" "}
            <Link href="/blog/cve-database-comparison" className="underline">
              our CVE database comparison
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How a scanner connects CVEs to your software</h2>
          <p className="text-sm muted">
            A CVE on its own is just a catalog entry. A vulnerability scanner makes it relevant to you
            by inventorying the packages in your container image, binary, or source tree, then matching
            each package and version against the affected ranges in CVE-derived data. When a match is
            found, that CVE becomes a <em>finding</em> in your report.
          </p>
          <p className="text-sm muted">
            The accuracy of that matching is where scanners differ most. Matching loosely on a product
            name produces false positives; reading the actual installed package state and honoring
            vendor backports produces findings you can trust. We unpack that distinction in{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs. advisory matching
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What does CVE stand for?</h3>
              <p className="text-sm muted mt-1">
                Common Vulnerabilities and Exposures. It is a program, run by MITRE and sponsored by
                CISA, that assigns a unique public ID to each disclosed security vulnerability.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is a CVE the same as a vulnerability?</h3>
              <p className="text-sm muted mt-1">
                Effectively, in everyday use &mdash; but precisely, a CVE is the <em>identifier and record</em>{" "}
                for a vulnerability, not the flaw itself. The flaw can exist before a CVE is assigned and may
                never get one.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is a CVE vs a CWE?</h3>
              <p className="text-sm muted mt-1">
                A CVE identifies a specific vulnerability in specific software. A CWE (Common Weakness
                Enumeration) identifies the <em>category</em> of mistake behind it, such as SQL injection
                or buffer overflow. One CWE category covers thousands of individual CVEs.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Who can request a CVE?</h3>
              <p className="text-sm muted mt-1">
                Anyone can request one, but the assignment goes through a CNA &mdash; either the vendor of
                the affected product (if they are a CNA) or MITRE and its &ldquo;CNA of last resort&rdquo; for
                everything else.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Find the CVEs in your software with ScanRook</h3>
          <p className="text-sm muted leading-relaxed">
            Upload a container image, binary, or source archive and ScanRook matches every package
            against CVE data from OSV, NVD, GHSA, and vendor trackers &mdash; then ranks the findings by
            CVSS severity, EPSS exploit probability, and CISA KEV status so you know what to fix first.
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
            <Link href="/blog/epss-scores-explained" className="underline">
              EPSS Scores Explained
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
