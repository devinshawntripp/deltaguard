import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-21";

const title = `Grype Alternatives in 2026: When to Use Something Else | ${APP_NAME}`;
const description =
  "An honest look at Grype alternatives — ScanRook, Trivy, Snyk, Docker Scout — with benchmark data on finding depth, SBOM workflows, and when Grype is right.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "grype alternative",
    "grype alternatives",
    "alternatives to grype",
    "grype vs scanrook",
    "grype vs trivy",
    "grype vs snyk",
    "container vulnerability scanner comparison",
    "best container scanner 2026",
    "open source vulnerability scanner",
    "grype replacement",
  ],
  alternates: { canonical: "/blog/grype-alternatives" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/grype-alternatives",
    images: ["/blog/grype-alternatives.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/grype-alternatives.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Grype Alternatives in 2026: When to Use Something Else",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/grype-alternatives",
  image: "https://scanrook.io/blog/grype-alternatives.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are the main alternatives to Grype?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The common alternatives are Trivy (open source, broader one-tool coverage of IaC, secrets, and Kubernetes), ScanRook (multi-source enrichment with deeper finding coverage), Snyk Container (commercial, developer-workflow focused), and Docker Scout (integrated into Docker Desktop and Docker Hub). The right choice depends on whether you need SBOM tooling, raw speed, finding depth, or ecosystem integration.",
      },
    },
    {
      "@type": "Question",
      name: "Why would a team switch away from Grype?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Usually finding depth. Grype matches against its own aggregated database, which keeps it fast but can miss advisories other sources catch. In our benchmark, Grype reported 47 findings on ubuntu:24.04 where multi-source scanning found 1,365, and 315 on nginx:1.27 where multi-source scanning found 2,952. Teams needing audit-grade coverage often add or switch to a broader scanner.",
      },
    },
    {
      "@type": "Question",
      name: "Is Grype still a good scanner in 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Grype is free, open source, actively maintained by Anchore, and pairs tightly with Syft for SBOM generation and consumption. For teams standardizing on SBOM-first workflows or wanting a fast, no-cost open-source scanner, it remains a strong choice. The case for alternatives is about finding depth, not about Grype being poorly built.",
      },
    },
    {
      "@type": "Question",
      name: "Can I run Grype alongside another scanner?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, and many teams do: Grype for fast SBOM-driven checks on every build, plus a deeper multi-source scanner on a nightly or main-branch schedule for comprehensive coverage. The two reports serve different purposes — one is quick regression feedback, the other is an audit.",
      },
    },
    {
      "@type": "Question",
      name: "Is ScanRook slower than Grype?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In default live-query mode, yes. Our benchmark measured Grype at roughly 1-2.5 seconds per image against ScanRook's 3-9 seconds, since ScanRook queries multiple advisory sources live during the scan. ScanRook's local vulnerability database mode pre-indexes that data to close most of the gap while keeping multi-source coverage.",
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
          <div className="text-xs uppercase tracking-wide muted">Benchmarks</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Grype Alternatives in 2026: When to Use Something Else
          </h1>
          <p className="text-sm muted">Published July 21, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            If you are looking for a Grype alternative, you are probably not questioning whether
            scanning matters &mdash; you want to know what else is out there and whether switching
            is worth it. Here is the honest version, including the cases where the right answer is
            to keep Grype exactly as it is.
          </p>
        </header>

        <img
          src="/blog/grype-alternatives.jpg"
          alt="Grype alternatives compared"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Grype gets right</h2>
          <p className="text-sm muted">
            Grype earns its popularity. It is free, Apache-2.0 licensed, and built by Anchore with
            an active release cadence. Its CLI is clean and its output is easy to parse. Most
            importantly, it pairs tightly with{" "}
            <span className="font-mono text-xs">Syft</span>, Anchore&apos;s SBOM generator &mdash;
            generate an SBOM once with Syft, feed it to Grype, and you get vulnerability matching
            without re-scanning the filesystem. For teams standardizing on SBOM-first workflows,
            that integration is hard to beat.
          </p>
          <p className="text-sm muted">
            It is also fast. In{" "}
            <Link href="/blog/vulnerability-scanner-benchmark-2026" className="underline">
              our 2026 benchmark
            </Link>
            , Grype completed image scans in roughly 1&ndash;2.5 seconds by matching entirely
            against its own pre-downloaded database, with no network calls during the scan itself.
            If your requirement is &ldquo;free, fast, SBOM-native,&rdquo; Grype meets it, and
            nothing below changes that.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The alternatives at a glance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Tool</th>
                  <th className="text-left py-2 pr-4 font-semibold">Model</th>
                  <th className="text-left py-2 pr-4 font-semibold">Strengths</th>
                  <th className="text-left py-2 font-semibold">Tradeoffs</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Grype</strong></td>
                  <td className="py-2 pr-4 align-top">Open source</td>
                  <td className="py-2 pr-4 align-top">Fast; tight Syft/SBOM integration; clean CLI</td>
                  <td className="py-2 align-top">Single aggregated database; shallower finding depth</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Trivy</strong></td>
                  <td className="py-2 pr-4 align-top">Open source</td>
                  <td className="py-2 pr-4 align-top">Fastest scans; one tool for images, IaC, secrets, K8s</td>
                  <td className="py-2 align-top">Also a single aggregated database; similar finding depth to Grype</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>ScanRook</strong></td>
                  <td className="py-2 pr-4 align-top">Free tier + paid</td>
                  <td className="py-2 pr-4 align-top">Multi-source enrichment (OSV, NVD, OVAL); installed-state verification; confidence tiers</td>
                  <td className="py-2 align-top">Slower in live-query mode; container/binary/source focus, no IaC scanning</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Snyk Container</strong></td>
                  <td className="py-2 pr-4 align-top">Commercial</td>
                  <td className="py-2 pr-4 align-top">Developer workflow, fix PRs, base-image upgrade advice</td>
                  <td className="py-2 align-top">Pricing scales with usage; cloud-centric</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top"><strong>Docker Scout</strong></td>
                  <td className="py-2 pr-4 align-top">Freemium</td>
                  <td className="py-2 pr-4 align-top">Built into Docker Desktop/Hub; zero setup if you live in Docker</td>
                  <td className="py-2 align-top">Strongest inside Docker&apos;s ecosystem, less so outside it</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            Dedicated side-by-side pages for the closest matchups:{" "}
            <Link href="/compare/grype" className="underline">ScanRook vs Grype</Link>,{" "}
            <Link href="/compare/trivy" className="underline">ScanRook vs Trivy</Link>, and{" "}
            <Link href="/compare/snyk" className="underline">ScanRook vs Snyk</Link>.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where Grype and Trivy actually differ</h2>
          <p className="text-sm muted">
            It is worth being precise here: Grype and Trivy are closer to each other than either is
            to a multi-source scanner. Both match against a single pre-aggregated database and both
            scored similarly across our benchmark images &mdash; the meaningful gap is not Grype vs
            Trivy, it is single-database scanners vs multi-source ones. If you are choosing between
            Grype and Trivy specifically, the deciding factor is usually tooling fit: Grype for
            Syft-based SBOM pipelines, Trivy for one binary that also covers IaC, secrets, and
            Kubernetes manifests.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The real differentiator: finding depth</h2>
          <p className="text-sm muted">
            From{" "}
            <Link href="/blog/vulnerability-scanner-benchmark-2026" className="underline">
              our 2026 benchmark
            </Link>{" "}
            (warm cache; ScanRook v1.14.2, Trivy 0.69.1, Grype 0.109.0; finding count = unique CVE
            IDs):
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Image</th>
                  <th className="text-left py-2 pr-4 font-semibold">ScanRook</th>
                  <th className="text-left py-2 pr-4 font-semibold">Grype</th>
                  <th className="text-left py-2 font-semibold">Trivy</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 text-xs font-mono">alpine:3.20</td>
                  <td className="py-2 pr-4">301</td>
                  <td className="py-2 pr-4">20</td>
                  <td className="py-2">16</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 text-xs font-mono">debian:12</td>
                  <td className="py-2 pr-4">1,110</td>
                  <td className="py-2 pr-4">117</td>
                  <td className="py-2">123</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 text-xs font-mono">ubuntu:24.04</td>
                  <td className="py-2 pr-4">1,365</td>
                  <td className="py-2 pr-4">47</td>
                  <td className="py-2">10</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-xs font-mono">nginx:1.27</td>
                  <td className="py-2 pr-4">2,952</td>
                  <td className="py-2 pr-4">315</td>
                  <td className="py-2">314</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            The gap is architectural, not a quality gap. Grype matches against one pre-aggregated
            database, which is exactly what makes it fast and reliable to run offline. ScanRook
            queries OSV, NVD (via CPE matching), and Red Hat OVAL in parallel for every package,
            reads the actual package-manager databases inside the image, and tags each finding with
            a confidence tier. Different advisory sources know about different CVEs; the more of
            them you query, the more of what is actually there gets surfaced. Our{" "}
            <Link href="/blog/cve-database-comparison" className="underline">
              CVE database comparison
            </Link>{" "}
            covers how differently the major sources cover the same packages.
          </p>
          <p className="text-sm muted">
            The honest tradeoff: ScanRook took 3&ndash;9 seconds per image in the same benchmark
            against Grype&apos;s roughly 1&ndash;2.5 seconds. ScanRook&apos;s local
            vulnerability-database mode closes most of that gap by pre-indexing advisory data, at
            the cost of a database you maintain &mdash; the same tradeoff Grype makes, with broader
            sources behind it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which should you pick?</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Keep Grype</strong> if you are standardizing on Syft-generated SBOMs, want a
              fast zero-cost open-source scanner, or already have Grype wired into a working
              pipeline that meets your needs.
            </li>
            <li>
              <strong>Pick Trivy</strong> if you want one binary covering images, IaC, secrets, and
              Kubernetes scanning, and finding depth similar to Grype is acceptable.
            </li>
            <li>
              <strong>Pick Snyk</strong> if you are buying a developer-security platform &mdash;
              fix pull requests, IDE integration, license and policy workflows &mdash; and
              per-developer pricing fits your team.
            </li>
            <li>
              <strong>Pick Docker Scout</strong> if your workflow already lives entirely in Docker
              Desktop and Docker Hub.
            </li>
            <li>
              <strong>Pick ScanRook</strong> if finding depth is the requirement: security reviews,
              compliance audits, or any context where a scanner not knowing about an advisory is not
              acceptable. Multi-source enrichment plus installed-state verification is the
              difference between 47 findings and 1,365 on the same Ubuntu image.
            </li>
            <li>
              <strong>Run two</strong> if you can: Grype (or Syft plus Grype) for fast SBOM-driven
              checks on every build, a deeper scanner on main and nightly for full coverage.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Evaluating an alternative on your own images</h2>
          <p className="text-sm muted">
            Public-image benchmarks tell you about architecture; only a scan of your own images
            tells you what you would actually gain by switching. The check takes about twenty
            minutes:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Export a real production image once
docker save yourapp:prod -o yourapp.tar

# Scan it with Grype and the candidate
grype yourapp.tar -o json > grype.json
scanrook scan --file yourapp.tar --format json --out scanrook.json

# Compare what each one saw
jq '.matches | length' grype.json
jq '.summary' scanrook.json`}</pre>
          <p className="text-sm muted">
            For each finding the candidate reports that Grype misses, check whether the package is
            actually installed, whether a fix is available, and which advisory source knew about
            it. A handful of extra findings is noise; a consistent pattern of missed advisories is
            the architecture difference showing up in your own infrastructure, not a benchmark
            artifact.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What are the main alternatives to Grype?</h3>
              <p className="text-sm muted mt-1">
                Trivy, ScanRook, Snyk Container, and Docker Scout &mdash; optimized respectively for
                one-tool coverage, finding depth, developer experience, and Docker-ecosystem
                integration.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why switch away from Grype?</h3>
              <p className="text-sm muted mt-1">
                Coverage. Single-database matching keeps Grype fast but misses advisories other
                sources catch &mdash; 47 vs 1,365 findings on ubuntu:24.04 in our benchmark.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is Grype still good in 2026?</h3>
              <p className="text-sm muted mt-1">
                Yes. For SBOM-native workflows and free, fast, open-source scanning it remains
                excellent; the case for alternatives is depth, not quality.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can I run Grype and ScanRook together?</h3>
              <p className="text-sm muted mt-1">
                Yes &mdash; Grype for fast per-build checks, a deeper scanner on main or nightly, is
                a common pattern that covers both speed and coverage.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">See the difference on your own images</h3>
          <p className="text-sm muted leading-relaxed">
            The benchmark numbers above are reproducible &mdash; scan one of your production images
            with ScanRook next to Grype and compare the reports side by side. Every finding carries
            its source and a confidence tier, so you can verify rather than trust.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--dg-accent,#2563eb)] text-white px-4 py-2 text-sm font-medium"
            >
              Start scanning
            </Link>
            <Link href="/compare/grype" className="btn-secondary">ScanRook vs Grype</Link>
          </div>
        </section>

        <footer className="border-t border-black/10 dark:border-white/10 pt-4 text-xs muted grid gap-2">
          <p>
            <strong>Related reading:</strong>{" "}
            <Link href="/blog/vulnerability-scanner-benchmark-2026" className="underline">
              Vulnerability Scanner Benchmark 2026
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/scanrook-benchmark-results" className="underline">
              ScanRook Benchmark Results
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/cve-database-comparison" className="underline">
              CVE Database Comparison
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
