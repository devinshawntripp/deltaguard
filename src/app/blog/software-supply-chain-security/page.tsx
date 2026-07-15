import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-28";

const title = `Software Supply Chain Security: A Practical Primer | ${APP_NAME}`;
const description =
  "What software supply chain security means, the attack classes it defends against, and a layered defense from dependency scanning to SBOMs, SLSA, and signing.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "supply chain security",
    "software supply chain security",
    "software supply chain attack",
    "supply chain attack examples",
    "dependency confusion",
    "sbom",
    "slsa framework",
    "software provenance",
    "securing the software supply chain",
    "supply chain security best practices",
  ],
  alternates: { canonical: "/blog/software-supply-chain-security" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/software-supply-chain-security",
    images: ["/blog/software-supply-chain-security.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/software-supply-chain-security.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Software Supply Chain Security: A Practical Primer",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/software-supply-chain-security",
  image: "https://scanrook.io/blog/software-supply-chain-security.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is software supply chain security?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It is the practice of protecting every stage that produces your software: source code, third-party dependencies, the build system, the resulting artifact, the registry it lives in, and the deploy pipeline. The goal is confidence that what you ship is what you intended, built from components you trust and can account for.",
      },
    },
    {
      "@type": "Question",
      name: "What are common software supply chain attacks?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The main classes are compromised dependencies (a trusted package ships malicious code, as with the xz-utils backdoor), typosquatting and dependency confusion (a malicious package impersonates a real one), build-system compromise (as with SolarWinds), and stolen registry or signing credentials. Each targets a different link in the chain.",
      },
    },
    {
      "@type": "Question",
      name: "What is an SBOM's role in supply chain security?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A Software Bill of Materials is the inventory of components in your software. It is the foundation of supply chain security because you cannot assess, monitor, or respond to a vulnerability in a component you do not know you ship. When a new CVE lands, an SBOM lets you answer whether you are affected in minutes rather than days.",
      },
    },
    {
      "@type": "Question",
      name: "What is SLSA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SLSA (Supply-chain Levels for Software Artifacts) is a framework of graded requirements for build integrity and provenance. Higher levels demand stronger guarantees that an artifact was built from the expected source by a trusted, tamper-resistant build system, with signed provenance you can verify. It complements scanning rather than replacing it.",
      },
    },
    {
      "@type": "Question",
      name: "Is scanning enough for supply chain security?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No single control is. Scanning finds known-vulnerable components, but it does not prove where an artifact came from or that it was not tampered with. A practical program layers inventory (SBOM), scanning, dependency pinning, build provenance (SLSA), signing (Sigstore), and continuous monitoring so that a failure in one control is caught by another.",
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
            Software Supply Chain Security: A Practical Primer
          </h1>
          <p className="text-sm muted">Published August 28, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Modern software is assembled far more than it is written. A typical service is a thin
            layer of your own code sitting on hundreds of dependencies, a base image, and a build
            pipeline you mostly trust. Supply chain security is the discipline of earning that trust
            deliberately instead of assuming it. Here is a grounded map of the threats and the layered
            defense that answers them.
          </p>
        </header>

        <img
          src="/blog/software-supply-chain-security.jpg"
          alt="The software supply chain from source to deployment"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What &ldquo;supply chain&rdquo; actually covers</h2>
          <p className="text-sm muted">
            The software supply chain is every step between a developer&apos;s idea and a running
            process. Source code and its history. The third-party dependencies you pull in, and their
            dependencies, several levels deep. The build system that compiles, bundles, and packages
            it. The container image or artifact that results. The registry that stores it. And the
            pipeline that deploys it. Each link is a place where something can be substituted,
            tampered with, or slipped in &mdash; and each has been used in real attacks.
          </p>
          <p className="text-sm muted">
            The reason this became a board-level topic is a string of incidents that were not
            hypothetical. SolarWinds (2020) saw attackers compromise a <em>build system</em> to plant
            a backdoor in signed, legitimately distributed updates. Log4Shell (2021) showed how a
            flaw in one ubiquitous dependency becomes everyone&apos;s emergency at once. The
            xz-utils backdoor (CVE-2024-3094, 2024) was a patient social-engineering campaign to
            insert malicious code into a core compression library that ships in countless Linux
            images. Different links, same lesson: trust in the chain has to be verified, not assumed.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The attack classes worth knowing</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Compromised dependency.</strong> A package you already trust ships malicious
              code, either because a maintainer account was taken over or because a bad actor earned
              commit rights. xz-utils is the canonical modern example.
            </li>
            <li>
              <strong>Typosquatting.</strong> A malicious package is published under a name close to a
              popular one (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">reqeusts</code>{" "}
              for <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">requests</code>),
              hoping for a fat-fingered install.
            </li>
            <li>
              <strong>Dependency confusion.</strong> An attacker publishes a public package with the
              same name as one of your <em>internal</em> packages and a higher version number, so a
              misconfigured resolver pulls the public malicious one instead.
            </li>
            <li>
              <strong>Build-system compromise.</strong> The attacker never touches your source; they
              subvert the CI/CD system so the artifact it produces differs from what the source
              implies. This is the hardest class to detect after the fact.
            </li>
            <li>
              <strong>Credential and registry theft.</strong> Stolen signing keys or registry
              credentials let an attacker publish trusted-looking artifacts directly.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A layered defense</h2>
          <p className="text-sm muted">
            No single control covers all of that, so the practical answer is layers &mdash; each one
            catching what the others miss. In rough order of foundation to refinement:
          </p>
          <ol className="text-sm muted list-decimal pl-5 grid gap-2">
            <li>
              <strong>Know what you ship (SBOM).</strong> A{" "}
              <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
                Software Bill of Materials
              </Link>{" "}
              is the inventory every other control depends on. You cannot patch, monitor, or attest to
              a component you do not know is there.
            </li>
            <li>
              <strong>Scan dependencies and the built artifact.</strong> Catch known-vulnerable
              components in your dependencies <em>and</em> in what actually ships. Reading the real
              installed state, not just a manifest, is what makes this accurate &mdash; see{" "}
              <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
                installed-state scanning vs. advisory matching
              </Link>
              .
            </li>
            <li>
              <strong>Pin and lock.</strong> Commit lockfiles, pin base images by digest rather than
              floating tags, and configure resolvers so internal package names cannot be shadowed by
              public ones. This directly closes typosquatting and dependency-confusion paths.
            </li>
            <li>
              <strong>Prove how it was built (provenance).</strong> Generate signed build provenance
              so you can verify an artifact came from the expected source and build system. This is
              the layer the SLSA framework grades.
            </li>
            <li>
              <strong>Sign and verify.</strong> Sign artifacts and attestations so consumers can
              confirm origin and integrity, and enforce that only signed artifacts run in production.
            </li>
            <li>
              <strong>Monitor continuously.</strong> New CVEs are disclosed daily. Re-check your
              existing SBOM against fresh advisory data so a component that was clean at build time is
              flagged when the world learns it is not.
            </li>
          </ol>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Frameworks: SLSA and provenance</h2>
          <p className="text-sm muted">
            SLSA &mdash; Supply-chain Levels for Software Artifacts &mdash; is a graded framework for
            build integrity. Its levels describe progressively stronger guarantees: that a build
            produces signed provenance, that it runs on a hardened and tamper-resistant build service,
            and that the provenance is non-falsifiable. The point of SLSA is to make build-system
            compromise &mdash; the SolarWinds class &mdash; detectable, by giving you a verifiable
            record of <em>how</em> an artifact came to exist, not just <em>what</em> is in it.
          </p>
          <p className="text-sm muted">
            SLSA is complementary to scanning, not a substitute. Scanning tells you a component has a
            known flaw; provenance tells you the artifact was built as expected and not swapped out
            underneath you. A mature program wants both signals, plus the SBOM that ties them
            together into one accountable inventory.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The regulatory backdrop</h2>
          <p className="text-sm muted">
            Supply chain security is increasingly a compliance obligation, not just good hygiene. In
            the United States, Executive Order 14028 and the resulting NIST guidance (the Secure
            Software Development Framework, SP 800-218) pushed SBOMs and secure build practices into
            federal procurement. In the EU, the Cyber Resilience Act imposes vulnerability-handling
            and documentation duties on products with digital elements. Sector rules &mdash; for
            medical devices, for example &mdash; add their own SBOM and patching expectations.
          </p>
          <p className="text-sm muted">
            The details of which obligations apply to you, and by when, are genuinely
            situation-specific; treat the summary above as orientation and consult counsel for your
            products and markets. Our{" "}
            <Link href="/blog/compliance-scanning-guide" className="underline">
              compliance scanning guide
            </Link>{" "}
            covers how the frequency and evidence expectations translate into a scanning program.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook covers the inventory-and-scanning layers of that stack. It scans the built
            container image or source tree, enumerates the components actually present &mdash; OS
            packages and language dependencies alike &mdash; and cross-references them against OSV,
            NVD, and Red Hat OVAL, tagging each finding with its source and a confidence tier. The
            same scan produces an SBOM, so the inventory the rest of your controls depend on is a
            by-product of scanning rather than a separate chore. Because the multi-source data is not
            tied to one advisory feed, a component flagged by one source but not another still
            surfaces &mdash; the reasoning we lay out in the{" "}
            <Link href="/blog/cve-database-comparison" className="underline">
              CVE database comparison
            </Link>
            .
          </p>
          <p className="text-sm muted">
            It is deliberately not the whole story. ScanRook does not sign artifacts or generate SLSA
            provenance &mdash; those are separate layers, handled by tools built for them &mdash; and
            it is a scanner, not a policy engine. Think of it as the component that keeps your
            inventory honest and your known-vulnerability picture current, so the signing, provenance,
            and admission layers have accurate data to act on. The{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              container image security checklist
            </Link>{" "}
            walks through how these layers fit together in a single pipeline.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is software supply chain security?</h3>
              <p className="text-sm muted mt-1">
                Protecting every stage that produces your software &mdash; source, dependencies,
                build, artifact, registry, deploy &mdash; so you can trust that what you ship is what
                you intended.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What are the common attacks?</h3>
              <p className="text-sm muted mt-1">
                Compromised dependencies, typosquatting, dependency confusion, build-system
                compromise, and stolen registry or signing credentials &mdash; each targeting a
                different link in the chain.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why is an SBOM foundational?</h3>
              <p className="text-sm muted mt-1">
                You cannot assess or respond to a vulnerability in a component you do not know you
                ship. The SBOM is the inventory every other control builds on.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is scanning enough on its own?</h3>
              <p className="text-sm muted mt-1">
                No. Scanning finds known-vulnerable components but does not prove provenance or
                integrity. Layer it with pinning, SLSA provenance, signing, and continuous
                monitoring.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Start with an accurate inventory</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook scans the artifact you actually ship, produces an SBOM as it goes, and
            cross-checks every component against OSV, NVD, and OVAL. It is the inventory-and-scanning
            layer the rest of a supply chain program depends on.
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
            <Link href="/blog/cve-database-comparison" className="underline">
              CVE Database Comparison
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              Container Image Security Checklist
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
