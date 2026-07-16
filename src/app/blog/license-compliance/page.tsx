import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-19";

const title = `License Compliance for Open Source: A Practical 2026 Guide | ${APP_NAME}`;
const description =
  "License compliance means meeting open-source license obligations. The main license families, common mistakes, building a program, and where SBOMs and scans fit.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "license compliance",
    "open source license compliance",
    "software license compliance",
    "open source license obligations",
    "gpl compliance",
    "copyleft licenses",
    "permissive licenses",
    "spdx license identifiers",
    "license compliance program",
    "sbom license compliance",
  ],
  alternates: { canonical: "/blog/license-compliance" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/license-compliance",
    images: ["/blog/license-compliance.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/license-compliance.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "License Compliance for Open Source: A Practical 2026 Guide",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/license-compliance",
  image: "https://scanrook.io/blog/license-compliance.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is open-source license compliance?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "License compliance is the practice of meeting the legal obligations attached to every open-source component you ship. Even permissive licenses like MIT require you to preserve the copyright notice and license text. Copyleft licenses such as GPL add source-disclosure duties. Compliance means knowing which licenses are in your software and satisfying each one's terms.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between permissive and copyleft licenses?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Permissive licenses (MIT, Apache-2.0, BSD) let you use, modify, and redistribute code with minimal conditions, usually just attribution. Copyleft licenses (GPL, LGPL, MPL, AGPL) add reciprocity: if you distribute the software, you must make corresponding source available under compatible terms. AGPL extends that obligation to software offered over a network.",
      },
    },
    {
      "@type": "Question",
      name: "Does using GPL code force me to open-source my whole application?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on how you use it and whether you distribute it. Linking GPL code into a distributed application generally triggers source-disclosure obligations for the combined work; LGPL narrows that to the library itself. Purely internal use that is never distributed usually does not trigger disclosure. The boundaries are fact-specific, so consult counsel before shipping.",
      },
    },
    {
      "@type": "Question",
      name: "How does an SBOM help with license compliance?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An SBOM is a machine-readable inventory of every component in your software, and both major formats carry a license field per component. That turns license review from a manual audit into a query: list every component, group by license, and flag anything outside your policy. It also gives you an auditable record of what you shipped and under which terms.",
      },
    },
    {
      "@type": "Question",
      name: "Can a scanner detect license problems automatically?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A scanner can detect the declared license of each dependency from package-manager metadata and flag ones outside your allowlist, which catches the majority of routine issues. It cannot resolve ambiguous or missing declarations, dual-licensing choices, or file-level snippet reuse on its own. Treat automated detection as the first pass and legal review as the final word.",
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
            License Compliance for Open Source: A Practical 2026 Guide
          </h1>
          <p className="text-sm muted">Published November 19, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            License compliance is the unglamorous half of open-source risk: not &ldquo;is this
            component vulnerable?&rdquo; but &ldquo;am I allowed to ship it, and on what terms?&rdquo;
            Every dependency in your build arrives with a license, and every license is a contract.
            This guide covers the license families, the obligations that trip teams up, and how to
            build a compliance program that runs in your pipeline instead of in a spreadsheet.
          </p>
        </header>

        <img
          src="/blog/license-compliance.jpg"
          alt="Open-source license compliance explained"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What license compliance actually means</h2>
          <p className="text-sm muted">
            When you add an open-source package to your project, you are accepting a license &mdash;
            a set of permissions granted on the condition that you meet certain obligations. Ignore
            the obligations and you lose the permission, which means you are distributing someone
            else&apos;s copyrighted work without a license. That is a legal exposure, not a
            style violation.
          </p>
          <p className="text-sm muted">
            The obligations are usually modest. The most common one, shared by nearly every license,
            is attribution: preserve the copyright notice and include the license text when you
            distribute. Copyleft licenses add a reciprocity clause. A handful of licenses add
            patent-grant terms, notice-of-changes requirements, or naming restrictions. The work of
            compliance is knowing which licenses you have and satisfying each set of terms &mdash;
            not memorizing case law, but keeping an accurate inventory and a policy for what is
            allowed.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The license families</h2>
          <p className="text-sm muted">
            Thousands of individual licenses exist, but they cluster into a few families ordered
            roughly by how much they ask of you. The Open Source Initiative approves the licenses
            that meet its definition, and SPDX assigns each a short identifier (like{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">MIT</code>{" "}
            or{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">Apache-2.0</code>)
            that tools use to reason about them consistently.
          </p>

          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 720 210" className="w-full h-auto" role="img" aria-label="Open-source license families ordered by obligation, from permissive to network copyleft">
              <text x="10" y="22" fontSize="15" fontWeight="600" fill="currentColor">
                Open-source license families, by obligation
              </text>
              <rect x="10" y="42" width="170" height="60" rx="4" fill="currentColor" fillOpacity="0.12" />
              <rect x="184" y="42" width="170" height="60" rx="4" fill="currentColor" fillOpacity="0.28" />
              <rect x="358" y="42" width="170" height="60" rx="4" fill="currentColor" fillOpacity="0.48" />
              <rect x="532" y="42" width="170" height="60" rx="4" fill="var(--dg-accent,#2563eb)" fillOpacity="0.55" />
              <text x="95" y="78" fontSize="13" fontWeight="600" textAnchor="middle" fill="currentColor">Permissive</text>
              <text x="269" y="78" fontSize="13" fontWeight="600" textAnchor="middle" fill="currentColor">Weak copyleft</text>
              <text x="443" y="78" fontSize="13" fontWeight="600" textAnchor="middle" fill="currentColor">Strong copyleft</text>
              <text x="617" y="78" fontSize="13" fontWeight="600" textAnchor="middle" fill="currentColor">Network copyleft</text>
              <text x="95" y="124" fontSize="11" textAnchor="middle" fill="currentColor" fillOpacity="0.7">MIT, Apache-2.0, BSD</text>
              <text x="269" y="124" fontSize="11" textAnchor="middle" fill="currentColor" fillOpacity="0.7">LGPL, MPL-2.0, EPL</text>
              <text x="443" y="124" fontSize="11" textAnchor="middle" fill="currentColor" fillOpacity="0.7">GPL-2.0, GPL-3.0</text>
              <text x="617" y="124" fontSize="11" textAnchor="middle" fill="currentColor" fillOpacity="0.7">AGPL-3.0</text>
              <line x1="10" y1="160" x2="702" y2="160" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" />
              <path d="M702 160 l-8 -4 v8 z" fill="currentColor" fillOpacity="0.6" />
              <text x="10" y="184" fontSize="12" fill="currentColor" fillOpacity="0.7">Attribution only</text>
              <text x="702" y="184" fontSize="12" textAnchor="end" fill="currentColor" fillOpacity="0.7">Source disclosure, even over a network</text>
              <text x="356" y="200" fontSize="11" textAnchor="middle" fill="currentColor" fillOpacity="0.55">Increasing obligations when you distribute</text>
            </svg>
          </div>

          <p className="text-sm muted">
            <strong>Permissive</strong> licenses &mdash; MIT, Apache-2.0, the BSD variants &mdash;
            ask for attribution and little else. Apache-2.0 additionally grants patent rights and
            requires you to note changes, which is why it is often preferred for larger projects.
            These are the licenses most companies allow without review.
          </p>
          <p className="text-sm muted">
            <strong>Weak copyleft</strong> licenses &mdash; LGPL, MPL-2.0, EPL &mdash; scope
            reciprocity to the licensed files or library. You can link them into a proprietary
            application without opening your own code, provided you keep the covered component
            replaceable and publish changes to that component. <strong>Strong copyleft</strong>{" "}
            &mdash; GPL-2.0 and GPL-3.0 &mdash; extends reciprocity to the whole distributed work
            that incorporates the code, which is what people mean when they warn that GPL can be
            &ldquo;viral.&rdquo; <strong>Network copyleft</strong> &mdash; AGPL-3.0 &mdash; closes
            the so-called SaaS loophole: offering AGPL software to users over a network counts as
            distribution, triggering source-disclosure even if you never ship a binary.
          </p>
          <p className="text-sm muted">
            None of these families is &ldquo;bad.&rdquo; They encode different intentions, and the
            job of a policy is to match each to the way you actually use the code. Our{" "}
            <Link href="/blog/open-source-license-compliance-guide" className="underline">
              complete open-source license compliance guide
            </Link>{" "}
            works through the obligations family by family in more depth.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why it exists &mdash; and why it matters commercially</h2>
          <p className="text-sm muted">
            Open-source licenses are built on copyright law: the author holds copyright and grants
            you a conditional license to use the work. That structure is what makes the obligations
            enforceable, and there is a history of enforcement &mdash; from the early BusyBox suits
            to ongoing GPL-compliance efforts by organizations like the Software Freedom
            Conservancy. Enforcement rarely targets honest mistakes that get fixed, but the risk is
            real enough that acquirers scrutinize it.
          </p>
          <p className="text-sm muted">
            The most common place license problems surface is due diligence during an acquisition or
            funding round. A buyer&apos;s technical audit will inventory your dependencies and their
            licenses; an unresolved AGPL component in a proprietary product, or a GPL library linked
            into shipped firmware, can delay a deal or reduce a valuation. Getting compliance right
            early is far cheaper than untangling it under deadline pressure. None of this is legal
            advice &mdash; where a specific obligation or combination is unclear, consult counsel who
            can review your actual distribution model.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The mistakes that catch teams out</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Assuming direct dependencies are the whole story.</strong> Your policy might
              approve every package in your manifest, but transitive dependencies pulled in three
              levels deep carry their own licenses. Most license surprises live in the dependency
              tree, not the top-level list.
            </li>
            <li>
              <strong>Treating &ldquo;no license&rdquo; as permission.</strong> A component with no
              license is not public domain &mdash; it is all-rights-reserved by default. Missing or
              ambiguous license declarations need resolving, not ignoring.
            </li>
            <li>
              <strong>Forgetting attribution on distribution.</strong> Even MIT requires you to ship
              the license text and copyright notice. For a container or binary that bundles hundreds
              of components, that means generating a combined notices file, not hand-writing one.
            </li>
            <li>
              <strong>Missing the AGPL network trigger.</strong> Teams that never distribute a
              binary sometimes assume copyleft cannot apply. AGPL is written specifically to reach
              network-delivered software.
            </li>
            <li>
              <strong>Reviewing once and never again.</strong> A dependency can change its license
              between versions. Compliance is a continuous check tied to your builds, not a one-time
              audit that goes stale the next time you bump a version.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Building a compliance program</h2>
          <p className="text-sm muted">
            A workable program has four moving parts, and none of them requires a dedicated team to
            start:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>A policy.</strong> Write down which license families are allowed outright
              (usually permissive), which need review (weak copyleft), and which are denied by
              default in your distribution model (often strong and network copyleft for proprietary
              products). Keep it short enough that engineers will read it.
            </li>
            <li>
              <strong>An inventory.</strong> You cannot enforce a policy against components you
              cannot see. Generate a{" "}
              <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
                Software Bill of Materials
              </Link>{" "}
              on every build so the full dependency tree, with licenses, is a queryable artifact.
            </li>
            <li>
              <strong>An automated gate.</strong> Fail the build, or at least flag the pull request,
              when a component outside the allowlist appears. Catching it at introduction is an order
              of magnitude cheaper than catching it at audit.
            </li>
            <li>
              <strong>An exception path.</strong> Legitimate needs for review-required licenses will
              come up. A documented way to grant and record exceptions keeps the policy credible
              instead of something people route around.
            </li>
          </ul>
          <p className="text-sm muted">
            This is the same discipline as{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              software composition analysis
            </Link>{" "}
            for vulnerabilities, pointed at license metadata instead of CVEs &mdash; and in practice
            the same inventory feeds both.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Tooling &mdash; and where ScanRook fits</h2>
          <p className="text-sm muted">
            License tooling spans a wide range. At the deep end, dedicated products perform
            file-level snippet matching against large proprietary corpora to catch copied code that
            has no license declaration at all &mdash; the approach{" "}
            <Link href="/blog/what-we-learned-from-black-duck" className="underline">
              Black Duck pioneered
            </Link>. At the practical end, most teams need accurate detection of the declared license
            for each dependency and a gate that enforces policy on every build. Those two jobs are
            different, and most organizations need the second far more often than the first.
          </p>
          <p className="text-sm muted">
            ScanRook works at that practical end. When it scans a container or archive it reads each
            package&apos;s declared license from package-manager metadata &mdash; the same records
            it uses to match vulnerabilities &mdash; and reports it alongside the component in the
            SBOM. That gives you a per-component license list you can diff between builds and gate in
            CI, using the{" "}
            <Link href="/blog/how-to-read-sbom" className="underline">
              CycloneDX or SPDX output
            </Link>. What it does not do is snippet-level provenance detection or render a legal
            opinion; it surfaces the declared facts so a human, and where needed counsel, can make
            the call. Used that way it complements a formal license program rather than replacing
            legal review.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is open-source license compliance?</h3>
              <p className="text-sm muted mt-1">
                Meeting the legal obligations attached to every open-source component you ship &mdash;
                from attribution on permissive licenses to source disclosure on copyleft ones &mdash;
                by knowing which licenses you have and satisfying each.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Permissive vs copyleft &mdash; what is the difference?</h3>
              <p className="text-sm muted mt-1">
                Permissive licenses (MIT, Apache-2.0, BSD) mostly ask for attribution. Copyleft
                licenses (GPL, LGPL, MPL, AGPL) add reciprocity: distribute the software and you must
                make corresponding source available.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does GPL force me to open-source everything?</h3>
              <p className="text-sm muted mt-1">
                It depends on linkage and distribution. Distributing GPL code in a combined work
                generally triggers disclosure; LGPL narrows it to the library; purely internal use
                usually does not. Consult counsel for your case.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How does an SBOM help?</h3>
              <p className="text-sm muted mt-1">
                It inventories every component with its license, turning review into a query and
                giving you an auditable record of what you shipped and under which terms.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">See every component&apos;s license in one scan</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook reads the declared license of every package in your image or archive and reports
            it in the SBOM alongside vulnerabilities &mdash; a per-component list you can diff between
            builds and gate in CI, right next to your security findings.
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
            <Link href="/blog/open-source-license-compliance-guide" className="underline">
              The Complete Guide to Open Source License Compliance
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-we-learned-from-black-duck" className="underline">
              What We Learned from Black Duck
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              What Is an SBOM?
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
