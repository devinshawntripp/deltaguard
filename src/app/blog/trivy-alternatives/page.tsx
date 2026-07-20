import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-13";

const title = `Trivy Alternatives in 2026: When to Use Something Else | ${APP_NAME}`;
const description =
  "An honest look at Trivy alternatives — ScanRook, Grype, Snyk, Docker Scout — with benchmark data on finding depth, speed, and if Trivy is still right.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "trivy alternative",
    "trivy alternatives",
    "alternatives to trivy",
    "trivy vs scanrook",
    "trivy vs grype",
    "trivy vs snyk",
    "container vulnerability scanner comparison",
    "best container scanner",
    "open source vulnerability scanner",
    "trivy replacement",
  ],
  alternates: { canonical: "/blog/trivy-alternatives" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/trivy-alternatives",
    images: ["/blog/trivy-alternatives.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/trivy-alternatives.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Trivy Alternatives in 2026: When to Use Something Else",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/trivy-alternatives",
  image: "https://scanrook.io/blog/trivy-alternatives.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are the main alternatives to Trivy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The most common alternatives are Grype (open source, pairs with Syft for SBOMs), ScanRook (multi-source enrichment with deeper finding coverage), Snyk Container (commercial, developer-workflow focused), and Docker Scout (integrated into Docker Desktop and Docker Hub). Which one fits depends on whether you are optimizing for speed, finding depth, developer experience, or ecosystem integration.",
      },
    },
    {
      "@type": "Question",
      name: "Why would anyone switch away from Trivy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The usual reason is coverage. Trivy matches against a single aggregated database, which keeps it fast but can miss findings other sources catch. In our benchmark, Trivy reported 314 findings on nginx:1.27 where multi-source scanning found 2,952, and 10 findings on ubuntu:24.04 where multi-source scanning found 1,365. Teams that need audit-grade depth often add or switch to a scanner with broader source coverage.",
      },
    },
    {
      "@type": "Question",
      name: "Is Trivy still a good scanner in 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Trivy is fast, free, actively maintained, and covers containers, filesystems, IaC misconfigurations, secrets, and Kubernetes in one tool. For fast feedback in CI and broad one-tool coverage, it remains an excellent choice. The case for alternatives is about finding depth and enrichment, not about Trivy being bad at what it does.",
      },
    },
    {
      "@type": "Question",
      name: "Can I run Trivy and another scanner together?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, and it is a common pattern: a fast scanner on every pull request for quick feedback, plus a deeper scanner on main builds or a nightly schedule for comprehensive coverage. The two reports serve different purposes — one is a regression gate, the other is an audit.",
      },
    },
    {
      "@type": "Question",
      name: "Is ScanRook slower than Trivy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In default live-query mode, yes: our benchmark measured Trivy at 0.1-0.3 seconds per image and ScanRook at 3-9 seconds, because ScanRook queries multiple advisory sources during the scan. ScanRook's local vulnerability database mode pre-indexes that data to remove the network overhead while keeping multi-source coverage.",
      },
    },
  ],
};

const capabilityColumns = [
  "Trivy",
  "ScanRook",
  "Grype",
  "Snyk Container",
  "Docker Scout",
];

const capabilityRows: { capability: string; cells: string[] }[] = [
  {
    capability: "Advisory data model",
    cells: [
      "One pre-aggregated database",
      "OSV, NVD and Red Hat OVAL queried per package",
      "One pre-aggregated database",
      "Snyk's own curated database",
      "Docker-curated advisory data",
    ],
  },
  {
    capability: "Runs offline / air-gapped",
    cells: [
      "Yes, with a pre-downloaded database",
      "Yes, in local-database mode",
      "Yes, with a pre-downloaded database",
      "No, requires the Snyk service",
      "No, analysis is cloud-backed",
    ],
  },
  {
    capability: "IaC misconfiguration checks",
    cells: [
      "Yes",
      "No",
      "No",
      "Separate Snyk IaC product",
      "No",
    ],
  },
  {
    capability: "Secret detection",
    cells: [
      "Yes",
      "No",
      "No",
      "Not part of the container product",
      "No",
    ],
  },
  {
    capability: "Kubernetes cluster scanning",
    cells: [
      "Yes, via its Kubernetes command and operator",
      "No",
      "No",
      "Yes, via its Kubernetes integration",
      "No",
    ],
  },
  {
    capability: "SBOM generation",
    cells: [
      "Yes (CycloneDX, SPDX)",
      "Yes (CycloneDX, SPDX)",
      "Via Syft, its sibling project",
      "Yes",
      "Yes",
    ],
  },
  {
    capability: "Takes an existing SBOM as scan input",
    cells: [
      "Yes",
      "Yes (CycloneDX, SPDX, Syft JSON)",
      "Yes — its native input",
      "Check the current CLI docs",
      "Check the current CLI docs",
    ],
  },
  {
    capability: "Remediation guidance in output",
    cells: [
      "Fixed-in versions",
      "Fixed-in versions plus confidence tiers",
      "Fixed-in versions",
      "Fix pull requests and base-image advice",
      "Base-image update recommendations",
    ],
  },
  {
    capability: "Self-hosted operation",
    cells: [
      "Yes, runs entirely on your own machines",
      "Yes, self-hosted deployment supported",
      "Yes, runs entirely on your own machines",
      "Hosted service; broker for on-prem access",
      "No, Docker-hosted",
    ],
  },
];

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
            Trivy Alternatives in 2026: When to Use Something Else
          </h1>
          <p className="text-sm muted">Published July 13, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            If you are searching for a Trivy alternative, you probably do not need convincing that
            scanning matters &mdash; you need to know what the other options do differently and
            whether the difference is worth a migration. Here is the honest version, including the
            cases where the answer is &ldquo;keep Trivy.&rdquo;
          </p>
        </header>

        <img
          src="/blog/trivy-alternatives.jpg"
          alt="Trivy alternatives compared"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Trivy gets right</h2>
          <p className="text-sm muted">
            Credit first, because it is earned. Trivy is free and Apache-2.0 licensed, installs as a
            single binary, and is genuinely fast &mdash; in{" "}
            <Link href="/blog/vulnerability-scanner-benchmark-2026" className="underline">
              our 2026 benchmark
            </Link>{" "}
            it completed image scans in 0.1&ndash;0.3 seconds, the fastest of every tool we tested.
            It achieves that by downloading its vulnerability database ahead of time and matching
            entirely locally, with no network calls during the scan.
          </p>
          <p className="text-sm muted">
            It is also more than a container scanner: one tool covers filesystem scanning, IaC
            misconfiguration checks, secret detection, SBOM generation, and Kubernetes cluster
            scanning. The ecosystem is mature &mdash; official GitHub Actions, operator support,
            wide documentation coverage. If your requirement is &ldquo;fast, free, everywhere,&rdquo;
            Trivy meets it, and nothing below changes that.
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
                  <td className="py-2 pr-4 align-top"><strong>Trivy</strong></td>
                  <td className="py-2 pr-4 align-top">Open source</td>
                  <td className="py-2 pr-4 align-top">Fastest scans; one tool for images, IaC, secrets, K8s</td>
                  <td className="py-2 align-top">Single aggregated database; shallower finding depth</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>ScanRook</strong></td>
                  <td className="py-2 pr-4 align-top">Free tier + paid</td>
                  <td className="py-2 pr-4 align-top">Multi-source enrichment (OSV, NVD, OVAL); installed-state verification; confidence tiers</td>
                  <td className="py-2 align-top">Slower in live-query mode; container/binary/source focus, no IaC scanning</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Grype</strong></td>
                  <td className="py-2 pr-4 align-top">Open source</td>
                  <td className="py-2 pr-4 align-top">Clean CLI; tight Syft/SBOM integration</td>
                  <td className="py-2 align-top">Own single database; finding counts similar to Trivy in our tests</td>
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
            We keep dedicated side-by-side pages for the closest matchups:{" "}
            <Link href="/compare/trivy" className="underline">ScanRook vs Trivy</Link>,{" "}
            <Link href="/compare/grype" className="underline">ScanRook vs Grype</Link>, and{" "}
            <Link href="/compare/snyk" className="underline">ScanRook vs Snyk</Link>.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Capability matrix</h2>
          <p className="text-sm muted">
            The table above summarizes positioning; this one is about what each tool can and cannot
            do. Most migrations stall on a row here rather than on finding counts &mdash; an
            air-gapped build farm or an existing IaC gate narrows the field faster than any
            benchmark does.
          </p>
          <figure className="grid gap-3">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/10">
                    <th scope="col" className="text-left py-2 pr-4 font-semibold align-bottom">
                      Capability
                    </th>
                    {capabilityColumns.map((col) => (
                      <th
                        key={col}
                        scope="col"
                        className="text-left py-2 pr-4 font-semibold align-bottom whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="muted">
                  {capabilityRows.map((row) => (
                    <tr
                      key={row.capability}
                      className="border-b border-black/5 dark:border-white/5 last:border-0"
                    >
                      <th
                        scope="row"
                        className="text-left py-2 pr-4 align-top font-medium text-current"
                      >
                        {row.capability}
                      </th>
                      {row.cells.map((cell, i) => (
                        <td key={capabilityColumns[i]} className="py-2 pr-4 align-top text-xs">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <figcaption className="text-xs muted">
              Capability comparison compiled from each project&apos;s public documentation and
              product scope at the time of writing. Behaviour and feature coverage only &mdash; no
              performance, pricing, or finding-count claims are made in this table, and scanner
              feature sets move quickly, so confirm anything decision-critical against current
              vendor docs.
            </figcaption>
          </figure>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The real differentiator: finding depth</h2>
          <p className="text-sm muted">
            Speed differences between scanners are measured in seconds; coverage differences are
            measured in orders of magnitude. From{" "}
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
                  <th className="text-left py-2 pr-4 font-semibold">Trivy</th>
                  <th className="text-left py-2 font-semibold">Grype</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 text-xs font-mono">alpine:3.20</td>
                  <td className="py-2 pr-4">301</td>
                  <td className="py-2 pr-4">16</td>
                  <td className="py-2">20</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 text-xs font-mono">ubuntu:24.04</td>
                  <td className="py-2 pr-4">1,365</td>
                  <td className="py-2 pr-4">10</td>
                  <td className="py-2">47</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 text-xs font-mono">nginx:1.27</td>
                  <td className="py-2 pr-4">2,952</td>
                  <td className="py-2 pr-4">314</td>
                  <td className="py-2">315</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-xs font-mono">postgres:17</td>
                  <td className="py-2 pr-4">2,983</td>
                  <td className="py-2 pr-4">224</td>
                  <td className="py-2">222</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            The gap comes from architecture, not effort. Trivy and Grype each match against one
            pre-aggregated database &mdash; that is what makes them fast. ScanRook queries OSV, NVD
            (via CPE matching), and Red Hat OVAL in parallel for every package, reads the actual
            package-manager databases inside the image, and tags each finding with a confidence
            tier so you can filter to verified-installed matches. Different databases know about
            different advisories; querying more of them surfaces more of what is really there. Our{" "}
            <Link href="/blog/cve-database-comparison" className="underline">
              CVE database comparison
            </Link>{" "}
            shows how differently the major sources cover the same packages.
          </p>
          <p className="text-sm muted">
            The honest flip side: in default live-query mode ScanRook took 3&ndash;9 seconds per
            image in the same benchmark versus Trivy&apos;s sub-second scans. Its local
            vulnerability-database mode closes most of that gap by pre-indexing advisory data,
            at the cost of a database you must keep updated &mdash; the same tradeoff Trivy makes,
            with broader sources behind it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which should you pick?</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Keep Trivy</strong> if scan speed dominates, you want IaC + secrets + image
              scanning in one binary, or you need a zero-budget tool with a huge community. These
              are real requirements and Trivy is the best fit for them.
            </li>
            <li>
              <strong>Pick Grype</strong> if you are standardizing on Syft-generated SBOMs and want
              an open-source scanner that consumes them natively.
            </li>
            <li>
              <strong>Pick Snyk</strong> if you are buying a developer-security platform &mdash;
              fix pull requests, IDE integration, and license/policy workflows &mdash; and the
              per-developer pricing works for your team size.
            </li>
            <li>
              <strong>Pick Docker Scout</strong> if your entire workflow already lives in Docker
              Desktop and Docker Hub and you want findings where you already look.
            </li>
            <li>
              <strong>Pick ScanRook</strong> if finding depth is the requirement: security reviews,
              compliance audits, or any context where &ldquo;the scanner did not know about
              it&rdquo; is not an acceptable answer. Multi-source enrichment plus installed-state
              verification is the difference between 10 findings and 1,365 on the same Ubuntu image.
            </li>
            <li>
              <strong>Run two</strong> if you can: a fast scanner on every PR, a deep scanner on
              main and nightly. The combination costs one extra CI job and covers both failure
              modes.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Evaluating an alternative on your own images</h2>
          <p className="text-sm muted">
            Do not pick a scanner from anyone&apos;s blog post, including this one. Benchmarks on
            public images tell you about architecture; only a scan of <em>your</em> images tells
            you what you would actually gain. The evaluation takes about twenty minutes:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Export a real production image once
docker save yourapp:prod -o yourapp.tar

# Scan it with your current scanner and the candidate
trivy image --input yourapp.tar --format json > trivy.json
scanrook scan --file yourapp.tar --format json --out scanrook.json

# Compare what each one saw
jq '.Results | map(.Vulnerabilities // []) | flatten | length' trivy.json
jq '.summary' scanrook.json`}</pre>
          <p className="text-sm muted">
            Then read the diff, not just the totals. For each finding the candidate reports and the
            incumbent misses, check: is the package really installed, is there a fix available, and
            which advisory source knew about it? That last question tells you whether the gap is a
            one-off or structural. A handful of extra findings is noise; a consistent pattern of
            missed vendor advisories or unmatched CVEs is the architecture difference showing up in
            your own infrastructure.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">If you do migrate: a short checklist</h2>
          <p className="text-sm muted">
            Swapping the scan command is the easy part. The migration work lives in everything
            wired around it:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Severity gates.</strong> A deeper scanner will report more findings on day
              one. Re-baseline before you enforce &mdash; gate on newly introduced CVEs first, then
              tighten &mdash; or the first week of CI failures will sour the team on the change.
            </li>
            <li>
              <strong>Suppressions and ignore files.</strong> Accepted-risk lists (
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.trivyignore</code>{" "}
              and friends) do not port automatically. Treat the migration as a chance to re-review
              them; some entries exist only because of a false positive the new tool may not have.
            </li>
            <li>
              <strong>Report consumers.</strong> Anything parsing scanner JSON &mdash; dashboards,
              ticket automation, compliance exports &mdash; needs the new schema. Run both scanners
              in parallel for a sprint so downstream tooling can switch over without a gap.
            </li>
            <li>
              <strong>Keep the old tool&apos;s strengths.</strong> If you used Trivy for IaC and
              secrets scanning as well as images, keep it for those jobs. Replacing the image
              scanner does not require replacing the whole toolbox.
            </li>
          </ul>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What are the main alternatives to Trivy?</h3>
              <p className="text-sm muted mt-1">
                Grype, ScanRook, Snyk Container, and Docker Scout are the common candidates &mdash;
                optimized respectively for SBOM workflows, finding depth, developer experience, and
                Docker-ecosystem integration.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why switch away from Trivy?</h3>
              <p className="text-sm muted mt-1">
                Coverage. Single-database matching keeps Trivy fast but misses advisories other
                sources catch &mdash; 10 vs 1,365 findings on ubuntu:24.04 in our benchmark.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is Trivy still good in 2026?</h3>
              <p className="text-sm muted mt-1">
                Yes. For fast CI feedback and broad one-tool coverage it remains excellent; the case
                for alternatives is depth, not quality.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can I run Trivy and ScanRook together?</h3>
              <p className="text-sm muted mt-1">
                Yes &mdash; fast scanner on PRs, deep scanner on main or nightly, is a well-worn
                pattern that covers both speed and coverage.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">See the difference on your own images</h3>
          <p className="text-sm muted leading-relaxed">
            The benchmark numbers above are reproducible &mdash; scan one of your production images
            with ScanRook next to your current scanner and compare the reports side by side. Every
            finding carries its source and a confidence tier, so you can verify rather than trust.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--dg-accent,#2563eb)] text-white px-4 py-2 text-sm font-medium"
            >
              Start scanning
            </Link>
            <Link href="/compare/trivy" className="btn-secondary">ScanRook vs Trivy</Link>
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
