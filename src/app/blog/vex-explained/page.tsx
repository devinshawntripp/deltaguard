import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-23";

const title = `What Is VEX? Vulnerability Exploitability eXchange Explained | ${APP_NAME}`;
const description =
  "What VEX is and why it matters: how Vulnerability Exploitability eXchange data cuts false positives by telling you if a CVE is actually reachable.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "what is vex security",
    "vex explained",
    "vulnerability exploitability exchange",
    "vex document",
    "vex sbom",
    "vex cyclonedx",
    "csaf vex",
    "vex not affected",
    "vex status codes",
    "reduce false positives sbom",
  ],
  alternates: { canonical: "/blog/vex-explained" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/vex-explained",
    images: ["/blog/vex-explained.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/vex-explained.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "What Is VEX? Vulnerability Exploitability eXchange Explained",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/vex-explained",
  image: "https://scanrook.io/blog/vex-explained.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does VEX stand for?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "VEX stands for Vulnerability Exploitability eXchange. It is a document or data structure that communicates whether a known vulnerability in a product's components is actually exploitable in that specific product, as opposed to just present.",
      },
    },
    {
      "@type": "Question",
      name: "How is VEX different from an SBOM?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An SBOM lists what components a product contains. VEX adds context about specific vulnerabilities in those components — for example, that a known flaw in a library is not exploitable because the affected function is never called. The two are complementary: the SBOM says what is present, VEX says what actually matters.",
      },
    },
    {
      "@type": "Question",
      name: "What are the standard VEX status values?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The CSAF/CISA VEX vocabulary uses four statuses: not affected, affected, fixed, and under investigation. CycloneDX's own analysis.state enum is different: exploitable, resolved, resolved_with_pedigree, in_triage, false_positive, and not_affected. The two vocabularies only overlap on \"not affected,\" which requires a justification, such as the vulnerable code not being present in the build, not being reachable, or requiring a precondition that does not exist in this deployment.",
      },
    },
    {
      "@type": "Question",
      name: "Who produces VEX documents?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Typically the software supplier, since they are best positioned to know whether a vulnerable component's flawed code path is actually invoked in their product. Some scanners can suggest a preliminary VEX status based on reachability analysis, but a supplier's authoritative statement carries more weight for compliance and customer communication.",
      },
    },
    {
      "@type": "Question",
      name: "Does VEX replace vulnerability scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. VEX assumes a vulnerability has already been identified — usually by a scanner checking an SBOM against OSV, NVD, or vendor advisories — and adds exploitability context on top. Scanning finds the vulnerability; VEX documents whether it matters in this specific product.",
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
            What Is VEX? Vulnerability Exploitability eXchange Explained
          </h1>
          <p className="text-sm muted">Published August 23, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            An SBOM can tell you that your product contains a library with a known critical CVE
            without telling you the one thing you actually need to know: does it matter here? VEX
            is the piece of the puzzle built specifically to answer that question.
          </p>
        </header>

        <img
          src="/blog/vex-explained.jpg"
          alt="VEX, Vulnerability Exploitability eXchange, explained"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What VEX actually is</h2>
          <p className="text-sm muted">
            VEX (Vulnerability Exploitability eXchange) is a machine-readable statement about
            whether a known vulnerability is exploitable in the context of a specific product. It
            exists as either an embedded section of a{" "}
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              CycloneDX SBOM
            </Link>{" "}
            or as a standalone CSAF (Common Security Advisory Framework) document maintained by
            OASIS. Either way, it answers a narrower and more useful question than &ldquo;is this
            CVE present&rdquo; &mdash; it answers &ldquo;is this CVE something you need to act on,
            in this product, right now.&rdquo;
          </p>
          <p className="text-sm muted">
            A concrete example: an SBOM says &ldquo;this application contains lodash 4.17.20.&rdquo;
            A vulnerability scanner adds &ldquo;lodash 4.17.20 is affected by a known command
            injection CVE in its template function.&rdquo; VEX adds the missing piece: &ldquo;that
            CVE is not exploitable in this product, because the affected function is never called
            in our code paths.&rdquo;
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why VEX exists</h2>
          <p className="text-sm muted">
            VEX exists because vulnerability scanning at scale has a noise problem. A component can
            carry a CVE that is real, correctly identified, and completely irrelevant to how a given
            product uses that component &mdash; a vulnerable function that is never invoked, a
            precondition (like a specific config flag) that the product never sets, or code that
            only ships in a build variant the vendor does not distribute. Multiply that across a
            large SBOM with thousands of transitive dependencies, and a meaningful share of
            &ldquo;critical&rdquo; findings can be non-issues in practice &mdash; but a downstream
            consumer scanning the SBOM has no way to know that without VEX telling them.
          </p>
          <p className="text-sm muted">
            The practical cost of not having this signal is alert fatigue: security teams spend
            time triaging findings that a supplier already knew were not exploitable, and the
            genuinely urgent findings compete for attention with noise. VEX shifts some of that
            triage burden to the party with the best information &mdash; the supplier who actually
            knows how their own code calls a dependency.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The standard VEX status values</h2>
          <p className="text-sm muted">
            The CSAF/CISA VEX vocabulary and CycloneDX&apos;s own{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">analysis.state</code>{" "}
            enum are not the same list &mdash; they overlap only on{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">not_affected</code>.
            The CSAF/CISA values:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Status</th>
                  <th className="text-left py-2 font-semibold">What it means</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">not_affected</code></td>
                  <td className="py-2 align-top">The vulnerability exists in the component but not in how this product uses it; requires a justification</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">affected</code></td>
                  <td className="py-2 align-top">The vulnerability is exploitable in this product and needs remediation</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">fixed</code></td>
                  <td className="py-2 align-top">The vulnerability was present but has been remediated in this version</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top"><code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">under_investigation</code></td>
                  <td className="py-2 align-top">The supplier has not yet determined exploitability</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            CycloneDX&apos;s <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">analysis.state</code>{" "}
            enum uses a different set of values: <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">exploitable</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">resolved</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">resolved_with_pedigree</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">in_triage</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">false_positive</code>,
            and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">not_affected</code>.
            If you are producing a CycloneDX-embedded VEX statement, use CycloneDX&apos;s own enum
            rather than mapping the CSAF terms in directly &mdash; only{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">not_affected</code>{" "}
            is shared between the two.
          </p>
          <p className="text-sm muted">
            A <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">not_affected</code>{" "}
            status is only meaningful with a justification attached &mdash; common ones include the
            vulnerable code path not being present in the build, the affected function never being
            called, or a required precondition never being met in this deployment. A bare
            &ldquo;not affected&rdquo; with no justification is closer to an unverified claim than a
            useful signal.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Who should produce VEX data</h2>
          <p className="text-sm muted">
            The software supplier is best positioned to issue an authoritative VEX statement, since
            they know how their own code actually calls a dependency&apos;s functions. Some scanners
            can suggest a preliminary status based on static reachability analysis &mdash; whether
            the vulnerable function appears to be called anywhere in the codebase &mdash; but that is
            a heuristic, not a substitute for a supplier confirming it directly. Treat scanner-suggested
            VEX as a starting point for review, not a final answer to ship to customers.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A practical checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              Do not treat VEX as optional polish on an SBOM program &mdash; without it, every
              downstream consumer re-does the same exploitability triage independently.
            </li>
            <li>
              Require a justification on every <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">not_affected</code>{" "}
              status; an unjustified claim is not auditable.
            </li>
            <li>
              Update VEX status when code changes, not just when a new CVE is published &mdash; a
              refactor can make a previously unreachable function reachable.
            </li>
            <li>
              Use CycloneDX&apos;s native VEX support if your SBOM is already CycloneDX; use a
              standalone CSAF VEX document if you need to reference vulnerabilities independent of a
              specific SBOM.
            </li>
            <li>
              Keep VEX and vulnerability scan data next to each other operationally &mdash; VEX only
              adds value once a scanner has already told you a CVE exists to evaluate.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A CycloneDX VEX example, annotated</h2>
          <p className="text-sm muted">
            CycloneDX embeds VEX data in a <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">vulnerabilities</code>{" "}
            array that references specific components by their <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">bom-ref</code>.
            Here is a minimal example asserting a CVE is not exploitable in this product:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`{
  "vulnerabilities": [
    {
      "id": "CVE-2021-23337",
      "source": { "name": "NVD" },
      "affects": [
        { "ref": "urn:cdx:app/1.0#pkg:npm/lodash@4.17.20" }
      ],
      "analysis": {
        "state": "not_affected",
        "justification": "code_not_reachable",
        "detail": "The vulnerable template function is never called; this build only uses lodash.debounce and lodash.merge."
      }
    }
  ]
}`}</pre>
          <p className="text-sm muted">
            The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">state</code>{" "}
            field carries one of CycloneDX&apos;s own analysis.state values (not the CSAF vocabulary
            above), and the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">justification</code>{" "}
            field is a controlled vocabulary &mdash;{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">code_not_reachable</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">requires_configuration</code>, and{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">requires_dependency</code>{" "}
            are common values &mdash; rather than free text, so downstream tooling can filter and
            aggregate justifications programmatically instead of parsing prose.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook generates enriched CycloneDX SBOMs with vulnerability findings from OSV, NVD,
            and Red Hat OVAL attached to each component, giving you the &ldquo;is this CVE
            present&rdquo; half of the picture in the same format that natively carries VEX data.
            Layering a supplier or team&apos;s VEX judgments on top of that enriched SBOM is what
            turns a long list of findings into a short list of things that actually need action. Our{" "}
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              complete SBOM guide
            </Link>{" "}
            covers the full enrichment pipeline, and our{" "}
            <Link href="/blog/epss-scores-explained" className="underline">
              EPSS scores explained
            </Link>{" "}
            guide covers a complementary prioritization signal for the vulnerabilities that remain
            after VEX triage.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What does VEX stand for?</h3>
              <p className="text-sm muted mt-1">
                Vulnerability Exploitability eXchange &mdash; a statement about whether a known
                vulnerability is actually exploitable in a specific product.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How is VEX different from an SBOM?</h3>
              <p className="text-sm muted mt-1">
                An SBOM lists what is present. VEX adds whether a specific known vulnerability in
                that inventory actually matters for this product.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What are the standard VEX statuses?</h3>
              <p className="text-sm muted mt-1">
                CSAF/CISA use not affected, affected, fixed, and under investigation. CycloneDX uses
                its own analysis.state enum instead (exploitable, resolved, resolved_with_pedigree,
                in_triage, false_positive, not_affected) &mdash; the two only share &ldquo;not
                affected,&rdquo; which requires a justification.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does VEX replace vulnerability scanning?</h3>
              <p className="text-sm muted mt-1">
                No &mdash; scanning finds the vulnerability first; VEX adds exploitability context
                on top of that finding.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Start with the SBOM VEX needs to be useful</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook generates enriched CycloneDX SBOMs with every finding tagged by source and
            confidence tier, the foundation any VEX triage process starts from.
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
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              What Is an SBOM?
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/epss-scores-explained" className="underline">
              EPSS Scores Explained
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/how-to-read-sbom" className="underline">
              How to Read an SBOM
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
