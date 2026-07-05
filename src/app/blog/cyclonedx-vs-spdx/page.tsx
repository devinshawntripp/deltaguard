import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-20";

const title = `CycloneDX vs SPDX: Which SBOM Format Should You Use? | ${APP_NAME}`;
const description =
  "CycloneDX vs SPDX compared: origins, VEX support, license-compliance depth, and which SBOM format to pick for security versus legal workflows.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "cyclonedx vs spdx",
    "sbom format comparison",
    "cyclonedx format",
    "spdx format",
    "which sbom format to use",
    "cyclonedx vs spdx vex",
    "spdx license compliance",
    "sbom standard comparison",
    "cyclonedx spdx difference",
    "sbom json format",
  ],
  alternates: { canonical: "/blog/cyclonedx-vs-spdx" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/cyclonedx-vs-spdx",
    images: ["/blog/cyclonedx-vs-spdx.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/cyclonedx-vs-spdx.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "CycloneDX vs SPDX: Which SBOM Format Should You Use?",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/cyclonedx-vs-spdx",
  image: "https://scanrook.io/blog/cyclonedx-vs-spdx.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the main difference between CycloneDX and SPDX?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CycloneDX, maintained by OWASP, was purpose-built for security use cases and has native support for VEX vulnerability status. SPDX, maintained by the Linux Foundation and standardized as ISO/IEC 5962:2021, was designed originally for license compliance and has the deepest license-metadata support of the two.",
      },
    },
    {
      "@type": "Question",
      name: "Is SPDX or CycloneDX more widely required by regulations?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most regulatory guidance, including the NTIA Minimum Elements referenced by US Executive Order 14028, describes required data fields rather than mandating a specific format. Both CycloneDX and SPDX can express those fields, so format choice is usually a tooling and workflow decision rather than a compliance one — confirm with the specific contract or agency involved.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert between CycloneDX and SPDX?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Partially. Both formats can represent core component data — name, version, PURL, dependency relationships — so basic conversion tools exist. Format-specific features do not always survive a round trip: CycloneDX's native VEX data and SPDX's deeper license-expression fields can be lossy when converted to the other format.",
      },
    },
    {
      "@type": "Question",
      name: "Which format should a DevSecOps pipeline use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CycloneDX is the more common choice for DevSecOps pipelines because of its native VEX support and security-first design, and most container and vulnerability scanning tools default to it. SPDX remains preferred where legal or compliance teams own the process, given its deeper license-compliance heritage.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need a lawyer to decide which SBOM format to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not to choose a format, but license-compliance obligations tied to an SBOM's content — and any regulatory SBOM requirement specific to your product — are legal questions. Consult counsel on those; this article covers the technical tradeoffs only.",
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
            CycloneDX vs SPDX: Which SBOM Format Should You Use?
          </h1>
          <p className="text-sm muted">Published August 20, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            CycloneDX vs SPDX is not really a competition between a better and worse format &mdash;
            it is two SBOM standards that grew out of different problems and still carry that
            heritage. Here is what actually differs, and how to decide which one fits your pipeline.
          </p>
        </header>

        <img
          src="/blog/cyclonedx-vs-spdx.jpg"
          alt="CycloneDX and SPDX SBOM formats compared"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where each format came from</h2>
          <p className="text-sm muted">
            <strong>CycloneDX</strong> is maintained by OWASP and was designed from the outset for
            application security use cases: vulnerability correlation, dependency graphs, and
            component risk. Its structure reflects that origin &mdash; it treats a component tree
            and its relationships as first-class, and later added native support for VEX
            (Vulnerability Exploitability eXchange) so a document can carry both the inventory and
            vulnerability status together.
          </p>
          <p className="text-sm muted">
            <strong>SPDX</strong> is maintained by the Linux Foundation and is an ISO/IEC standard
            (ISO/IEC 5962:2021), originally built for license compliance and legal review. It has the
            longest history of the two formats and the deepest support for expressing license terms
            precisely, including SPDX&apos;s own standardized license identifier list, which is why
            legal teams often default to it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Feature comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Feature</th>
                  <th className="text-left py-2 pr-4 font-semibold">CycloneDX</th>
                  <th className="text-left py-2 font-semibold">SPDX</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Maintained by</td>
                  <td className="py-2 pr-4 align-top">OWASP</td>
                  <td className="py-2 align-top">Linux Foundation (ISO/IEC 5962:2021)</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Original focus</td>
                  <td className="py-2 pr-4 align-top">Security and composition analysis</td>
                  <td className="py-2 align-top">License compliance and legal review</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">VEX support</td>
                  <td className="py-2 pr-4 align-top">Native, built into the format</td>
                  <td className="py-2 align-top">Via external companion documents</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Dependency graph</td>
                  <td className="py-2 pr-4 align-top">Full graph, first-class</td>
                  <td className="py-2 align-top">Relationship model, slightly more verbose</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">License expression depth</td>
                  <td className="py-2 pr-4 align-top">Good</td>
                  <td className="py-2 align-top">Deepest of the two; standardized license list</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">Serialization</td>
                  <td className="py-2 pr-4 align-top">JSON, XML, Protobuf</td>
                  <td className="py-2 align-top">JSON, RDF, Tag-Value, spreadsheet</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            Our{" "}
            <Link href="/blog/how-to-read-sbom" className="underline">
              guide to reading an SBOM
            </Link>{" "}
            walks through annotated CycloneDX and SPDX examples side by side if you want to see the
            structural differences directly.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why the difference still matters</h2>
          <p className="text-sm muted">
            Both formats have converged on covering the core inventory data &mdash; component name,
            version, PURL, dependency relationships &mdash; well enough that either can satisfy
            baseline documentation requirements. Where they still diverge is in what is easiest to
            do <em>natively</em>. Embedding a vulnerability status alongside a component in
            CycloneDX is a first-class operation; doing the equivalent in SPDX means attaching a
            separate VEX document and correlating it back to the SBOM. Conversely, expressing a
            complex multi-license declaration with SPDX&apos;s standardized license expressions is
            more precise than CycloneDX&apos;s simpler license fields.
          </p>
          <p className="text-sm muted">
            This is why the split in practice tends to track team ownership rather than technical
            superiority: security and DevSecOps teams gravitate to CycloneDX because it fits how
            they already work with vulnerability data, while legal and compliance teams often prefer
            SPDX because of its license-compliance heritage and ISO standardization. Our{" "}
            <Link href="/blog/open-source-license-compliance-guide" className="underline">
              open source license compliance guide
            </Link>{" "}
            goes deeper on the legal side of that split.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What the tooling ecosystem actually defaults to</h2>
          <p className="text-sm muted">
            Most container and vulnerability scanning tools support both formats, but their defaults
            reveal where the ecosystem has settled. Tools built primarily for vulnerability scanning
            &mdash; container scanners, dependency-check tools, CI security gates &mdash; tend to
            default to CycloneDX output, or at least treat it as the primary format with SPDX as a
            secondary option. Tools built for license and legal review, and some enterprise asset
            management platforms, more often default to or require SPDX. Neither format is going
            away; the practical reality in 2026 is that a mature SBOM program produces both rather
            than picking a permanent side.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Migrating or supporting both formats later</h2>
          <p className="text-sm muted">
            Teams that picked one format early sometimes need to add the other later &mdash; a new
            enterprise customer requires SPDX, or a new security tool only ingests CycloneDX.
            Because both formats can express the same core component data, most SBOM generators can
            produce either from the same underlying scan without re-analyzing the artifact, which is
            why standardizing on a scanner that supports both outputs is worth more in practice than
            debating the format itself. The harder migration is around format-specific data already
            captured &mdash; VEX statements recorded in CycloneDX, or detailed SPDX license
            expressions &mdash; which do not translate automatically and may need to be re-authored
            in the new format rather than converted.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A practical decision checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Pick CycloneDX</strong> if your SBOM is primarily consumed by a vulnerability
              scanner or security pipeline, or you want vulnerability status embedded alongside the
              inventory.
            </li>
            <li>
              <strong>Pick SPDX</strong> if legal or compliance teams own the process, or if a
              specific customer or regulatory contract references SPDX directly.
            </li>
            <li>
              <strong>Check your toolchain first.</strong> Most scanners generate both, so the
              deciding factor is often what downstream consumers &mdash; a customer portal, a
              compliance platform, an audit checklist &mdash; expect to receive.
            </li>
            <li>
              <strong>Do not assume format satisfies a legal requirement.</strong> Confirm with
              counsel whether a specific regulation or contract mandates a format, rather than
              guessing from general practice.
            </li>
            <li>
              <strong>Generate both if you serve both audiences.</strong> Producing both formats
              from the same scan costs little extra and avoids picking a side prematurely.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How ScanRook handles both</h2>
          <p className="text-sm muted">
            ScanRook generates enriched SBOMs in either CycloneDX or SPDX format from the same scan
            of a container image, binary, or source archive, so choosing a format later does not
            mean rescanning. Every component in either output is enriched with vulnerability data
            from OSV, NVD, and Red Hat OVAL. See our{" "}
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              complete SBOM guide
            </Link>{" "}
            for the generation commands and enrichment pipeline in full.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is the main difference between CycloneDX and SPDX?</h3>
              <p className="text-sm muted mt-1">
                CycloneDX is security-first with native VEX support; SPDX is license-compliance
                first with the deepest legal metadata and ISO standardization.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is one format legally required over the other?</h3>
              <p className="text-sm muted mt-1">
                Usually neither &mdash; most regulations specify required data fields, not a format.
                Confirm any specific contract or agency preference directly.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can I convert between the two?</h3>
              <p className="text-sm muted mt-1">
                Partially. Core inventory data converts cleanly; format-specific features like native
                VEX or deep license expressions can be lossy in translation.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Which should a DevSecOps pipeline use?</h3>
              <p className="text-sm muted mt-1">
                CycloneDX is more common for security pipelines due to native VEX support; SPDX
                remains preferred where legal teams own the process.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Generate CycloneDX or SPDX from the same scan</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook produces enriched SBOMs in either format from a single scan of your container
            image, binary, or source archive &mdash; no need to pick one before you scan.
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
            <Link href="/blog/how-to-read-sbom" className="underline">
              How to Read an SBOM
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              What Is an SBOM?
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/open-source-license-compliance-guide" className="underline">
              Open Source License Compliance Guide
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
