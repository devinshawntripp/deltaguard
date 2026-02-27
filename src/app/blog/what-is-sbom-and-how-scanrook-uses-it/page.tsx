import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";

const title = `What Is an SBOM? How ScanRook Uses SBOMs | ${APP_NAME}`;
const description =
  "Learn what an SBOM is, why enterprises use it for software supply chain security, and how ScanRook uses SBOM import, diffing, and vulnerability enrichment.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "SBOM",
    "software bill of materials",
    "CycloneDX",
    "SPDX",
    "vulnerability management",
    "ScanRook",
  ],
  alternates: {
    canonical: "/blog/what-is-sbom-and-how-scanrook-uses-it",
  },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/what-is-sbom-and-how-scanrook-uses-it",
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
  headline: "What Is an SBOM? How ScanRook Uses SBOMs",
  description,
  author: {
    "@type": "Organization",
    name: "ScanRook",
  },
  publisher: {
    "@type": "Organization",
    name: "ScanRook",
  },
  mainEntityOfPage: "https://scanrook.io/blog/what-is-sbom-and-how-scanrook-uses-it",
  datePublished: "2026-02-27",
  dateModified: "2026-02-27",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is an SBOM?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An SBOM (Software Bill of Materials) is an inventory of software components, versions, and package relationships in an artifact.",
      },
    },
    {
      "@type": "Question",
      name: "Which SBOM formats does ScanRook support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ScanRook supports importing CycloneDX JSON, SPDX JSON, and Syft JSON with scanrook sbom import.",
      },
    },
    {
      "@type": "Question",
      name: "How does ScanRook use SBOMs in vulnerability triage?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ScanRook maps SBOM package coordinates to vulnerability sources, enriches findings, and supports sbom diff to monitor change between baselines.",
      },
    },
  ],
};

export default function WhatIsSbomPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 grid gap-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <article className="surface-card p-8 grid gap-6">
        <header className="grid gap-3">
          <div className="text-xs uppercase tracking-wide muted">SBOM Guide</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            What Is an SBOM? How ScanRook Uses SBOMs for Faster, More Accurate Triage
          </h1>
          <p className="text-sm muted">
            SBOMs are now expected in modern software supply chain programs. This guide explains what an SBOM is,
            what it solves, and how ScanRook operationalizes SBOM workflows.
          </p>
        </header>

      <section className="grid gap-2">
        <h2 className="text-xl font-semibold tracking-tight">What Is an SBOM?</h2>
        <p className="text-sm muted">
          A Software Bill of Materials is a component inventory: package names, versions, and ecosystem metadata
          for what is shipped inside an image or build output. Security teams use SBOMs to answer:
        </p>
        <ul className="list-disc pl-6 text-sm muted grid gap-1">
          <li>What third-party components are in this artifact?</li>
          <li>Which versions are present right now?</li>
          <li>What changed between releases?</li>
        </ul>
      </section>

      <section className="grid gap-2">
        <h2 className="text-xl font-semibold tracking-tight">Why SBOMs Matter</h2>
        <ul className="list-disc pl-6 text-sm muted grid gap-1">
          <li>Faster incident response when new CVEs drop.</li>
          <li>Clearer audit evidence for compliance and customer questionnaires.</li>
          <li>Better prioritization by tying findings to concrete component versions.</li>
        </ul>
      </section>

      <section className="grid gap-2">
        <h2 className="text-xl font-semibold tracking-tight">How ScanRook Uses SBOMs</h2>
        <ol className="list-decimal pl-6 text-sm muted grid gap-1">
          <li>Import SBOMs in CycloneDX, SPDX, or Syft JSON.</li>
          <li>Normalize package coordinates and enrich against vulnerability data sources.</li>
          <li>Use SBOM diff to compare baseline versus current software inventory.</li>
          <li>Push enriched findings into platform workflows for team triage.</li>
        </ol>
        <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
          <code>{`scanrook sbom import --file ./sbom.cdx.json --format json --out sbom-report.json
scanrook sbom diff --baseline ./sbom-prev.json --current ./sbom-new.json --json`}</code>
        </pre>
      </section>

      <section className="grid gap-2">
        <h2 className="text-xl font-semibold tracking-tight">SBOMs and Accuracy</h2>
        <p className="text-sm muted">
          SBOM-driven findings are useful, but they are package-metadata based by nature. For highest confidence,
          ScanRook's installed-state-first runtime paths remain the primary method for active vulnerability
          verification on supported artifact types.
        </p>
      </section>

      <section className="grid gap-2">
        <h2 className="text-xl font-semibold tracking-tight">Next Steps</h2>
        <p className="text-sm muted">
          Start with your current SBOM exports, then run a baseline diff in CI for every release candidate.
          Combine that with ScanRook workflow events and package-level findings for operational triage.
        </p>
      </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Try It</h2>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
            <code>{`curl -fsSL https://scanrook.sh/install | bash`}</code>
          </pre>
          <div className="flex flex-wrap gap-3">
            <a className="btn-primary" href="https://scanrook.sh">Install CLI</a>
            <Link className="btn-secondary" href="/docs">Read docs</Link>
            <Link className="btn-secondary" href="/blog">Back to blog</Link>
          </div>
        </section>
      </article>
    </main>
  );
}
