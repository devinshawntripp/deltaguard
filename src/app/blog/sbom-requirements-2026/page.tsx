import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-14";

const title = `SBOM Requirements in 2026: A Practical Map | ${APP_NAME}`;
const description =
  "A practical map of SBOM requirements in 2026: federal procurement, the EU Cyber Resilience Act, FDA medical device rules, and what teams need in place now.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "sbom requirements 2026",
    "sbom requirements",
    "software bill of materials requirements",
    "sbom compliance",
    "executive order 14028 sbom",
    "eu cyber resilience act sbom",
    "fda sbom requirement",
    "ntia minimum elements",
    "sbom mandate",
    "sbom regulation",
  ],
  alternates: { canonical: "/blog/sbom-requirements-2026" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/sbom-requirements-2026",
    images: ["/blog/sbom-requirements-2026.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/sbom-requirements-2026.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "SBOM Requirements in 2026: A Practical Map",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/sbom-requirements-2026",
  image: "https://scanrook.io/blog/sbom-requirements-2026.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is an SBOM legally required in 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on your market. US Executive Order 14028 requires SBOMs for software sold to the federal government. The FDA requires them for medical device premarket submissions. The EU Cyber Resilience Act will require them for products with digital elements sold in the EU, with obligations phasing in through 2027. Outside these contexts, SBOMs are increasingly a procurement requirement rather than a legal one.",
      },
    },
    {
      "@type": "Question",
      name: "What must an SBOM contain to satisfy US federal requirements?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The NTIA Minimum Elements define the baseline fields: supplier name, component name, version, other unique identifiers, dependency relationships, the author of the SBOM data, and a timestamp. Executive Order 14028 references these elements for software sold to federal agencies.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need both CycloneDX and SPDX to be compliant?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No single format is universally mandated. Most regulatory guidance describes required data elements rather than a specific format, and both CycloneDX and SPDX can express the NTIA minimum elements. Check what format your specific customer or agency contract requests before choosing.",
      },
    },
    {
      "@type": "Question",
      name: "Does having an SBOM mean my software has no vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. An SBOM is an inventory of components, not a vulnerability assessment. It tells you what is inside a product; a vulnerability scanner checks that inventory against advisory databases to determine what is actually at risk.",
      },
    },
    {
      "@type": "Question",
      name: "What should I do if I am not sure whether a regulation applies to my product?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Consult counsel. SBOM regulations vary by market, product category, and customer contract, and the consequences of misjudging applicability can be significant. This article describes the general landscape; it is not a substitute for legal advice on your specific situation.",
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
            SBOM Requirements in 2026: A Practical Map
          </h1>
          <p className="text-sm muted">Published August 14, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            SBOM requirements in 2026 come from three directions at once &mdash; US federal
            procurement rules, EU product regulation, and industry-specific guidance &mdash; and
            they do not all say the same thing. Here is what actually applies to whom, what the
            data has to contain, and how to tell if your product is in scope.
          </p>
        </header>

        <img
          src="/blog/sbom-requirements-2026.jpg"
          alt="SBOM requirements landscape in 2026"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Who is actually required to produce an SBOM</h2>
          <p className="text-sm muted">
            <strong>US federal software vendors.</strong> Executive Order 14028, &ldquo;Improving the
            Nation&apos;s Cybersecurity&rdquo; (May 2021), directs federal agencies to require SBOMs
            from vendors of software sold to the government, with a particular focus on
            &ldquo;critical software&rdquo; &mdash; operating systems, identity management tools,
            browsers, and security software. If your product is procured by a US federal agency,
            an SBOM is very likely already a contractual requirement.
          </p>
          <p className="text-sm muted">
            <strong>Medical device manufacturers.</strong> The FDA&apos;s cybersecurity guidance,
            effective October 2023, requires SBOMs as part of premarket submissions for devices that
            contain software or connect to networks &mdash; a category that covers most modern
            medical devices.
          </p>
          <p className="text-sm muted">
            <strong>Products sold in the EU.</strong> The EU Cyber Resilience Act extends the
            obligation furthest: Article 13 requires manufacturers of products with digital elements
            to document their components, including via an SBOM, with enforcement phasing in through
            2027. As with any cross-border regulation, whether and how it applies to a specific
            product is a question for counsel, not a blog post.
          </p>
          <p className="text-sm muted">
            <strong>Everyone else.</strong> Outside these direct mandates, SBOMs are increasingly
            requested as a procurement condition by enterprise customers and during M&amp;A
            due diligence, even when no law requires one. A vendor that cannot produce an SBOM on
            request is at a competitive disadvantage against one that can.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What the requirements actually specify</h2>
          <p className="text-sm muted">
            Most of these rules describe required <em>data</em>, not a required file format. The
            NTIA Minimum Elements &mdash; the baseline reference most US guidance points back to
            &mdash; define seven fields every SBOM should carry:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Field</th>
                  <th className="text-left py-2 font-semibold">What it captures</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Supplier name</td>
                  <td className="py-2 align-top">Who publishes the component</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Component name</td>
                  <td className="py-2 align-top">The package as named by its supplier</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Version</td>
                  <td className="py-2 align-top">The exact version identifier</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Other unique identifiers</td>
                  <td className="py-2 align-top">e.g. a Package URL (PURL)</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Dependency relationship</td>
                  <td className="py-2 align-top">Which components depend on which</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Author of SBOM data</td>
                  <td className="py-2 align-top">Which tool or team generated the SBOM</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">Timestamp</td>
                  <td className="py-2 align-top">When the SBOM was assembled</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            Both major SBOM formats can express all seven fields, which is why the requirements
            above rarely mandate one format over the other &mdash; our{" "}
            <Link href="/blog/how-to-read-sbom" className="underline">
              guide to reading CycloneDX and SPDX
            </Link>{" "}
            walks through both with annotated examples. Check your specific contract or agency
            guidance for a format preference before choosing.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where enforcement stands in 2026</h2>
          <p className="text-sm muted">
            Federal procurement enforcement has matured furthest: agencies increasingly ask for an
            SBOM as a standard part of the vendor onboarding process rather than a special request.
            FDA premarket review has treated SBOM submission as a routine expectation since the
            guidance took effect. The EU CRA is the newest and furthest from full enforcement &mdash;
            its vulnerability-handling and reporting obligations phase in over a multi-year window,
            so a product not yet enforced against today may be in scope well before it reaches end
            of life. Treat CRA timelines as a planning horizon, not a reason to wait.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Common mistakes teams make</h2>
          <p className="text-sm muted">
            <strong>Treating the SBOM as a one-time deliverable.</strong> A vendor that generates a
            single SBOM at initial certification and never updates it is not meeting the spirit of
            any of these requirements &mdash; the whole point is knowing what is in a product as it
            changes over its supported life, not what it contained on one specific date.
          </p>
          <p className="text-sm muted">
            <strong>Assuming a tool&apos;s output is automatically compliant.</strong> Running a
            generator and getting a CycloneDX or SPDX file does not guarantee the NTIA minimum
            elements are all populated correctly &mdash; some generators leave supplier or
            dependency-relationship fields blank by default. Check the actual output, not just that
            the command exited successfully.
          </p>
          <p className="text-sm muted">
            <strong>Conflating an SBOM with a security certification.</strong> An SBOM inventories
            components; it does not certify that a product is secure or free of vulnerabilities.
            Presenting an SBOM as proof of security to a customer or regulator overstates what the
            document actually claims.
          </p>
          <p className="text-sm muted">
            <strong>Waiting for full enforcement before starting.</strong> Given how long it takes
            to wire SBOM generation into an existing build pipeline properly, teams that start only
            when a deadline is imminent tend to ship incomplete or inconsistent SBOMs under time
            pressure.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A practical checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              Identify which of your products touch US federal procurement, medical devices, or the
              EU market &mdash; that determines which specific rule applies.
            </li>
            <li>
              Generate an SBOM with every build, not on a periodic schedule; a stale SBOM that
              does not reflect what actually shipped is worse than none.
            </li>
            <li>
              Confirm the SBOM contains all seven NTIA minimum element fields, regardless of which
              format you choose.
            </li>
            <li>
              Store SBOMs alongside build artifacts and make them retrievable on request &mdash; a
              procurement team asking for one during a deal should not trigger a scramble.
            </li>
            <li>
              Pair the SBOM with vulnerability enrichment; an inventory without a risk assessment
              answers &ldquo;what do we ship&rdquo; but not &ldquo;are we exposed.&rdquo;
            </li>
            <li>
              Consult counsel before making compliance claims to customers or regulators &mdash;
              this article describes the general landscape, not legal advice for your specific
              product and market.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How ScanRook fits into an SBOM program</h2>
          <p className="text-sm muted">
            ScanRook generates CycloneDX and SPDX SBOMs directly from a container image, binary, or
            source archive, and enriches every component with vulnerability data from OSV, NVD, and
            Red Hat OVAL in the same pass &mdash; so the inventory and the risk assessment ship
            together instead of as separate steps. Our{" "}
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              complete SBOM guide
            </Link>{" "}
            covers the generation and enrichment pipeline in detail, including SBOM diff for
            tracking what changed between releases.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is an SBOM legally required in 2026?</h3>
              <p className="text-sm muted mt-1">
                Depends on the market: yes for US federal software and FDA-regulated medical
                devices, phasing in for the EU CRA, and increasingly a procurement expectation
                everywhere else.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What must an SBOM contain?</h3>
              <p className="text-sm muted mt-1">
                The NTIA Minimum Elements: supplier, component name, version, unique identifiers,
                dependency relationships, SBOM author, and timestamp.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Do I need both CycloneDX and SPDX?</h3>
              <p className="text-sm muted mt-1">
                No single format is universally mandated; both can express the required data. Check
                your specific contract for a format preference.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does an SBOM mean my software has no vulnerabilities?</h3>
              <p className="text-sm muted mt-1">
                No &mdash; it is an inventory. A vulnerability scanner checks that inventory against
                advisory databases to assess actual risk.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Generate a compliant SBOM in one scan</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook produces CycloneDX and SPDX SBOMs with the NTIA minimum elements, enriched with
            vulnerability data, from a single container image or source archive scan.
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
            <Link href="/blog/open-source-license-compliance-guide" className="underline">
              Open Source License Compliance Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/compliance-scanning-guide" className="underline">
              Vulnerability Scanning for Compliance
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
