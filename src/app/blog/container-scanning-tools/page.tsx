import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-25";

const title = `Container Scanning Tools in 2026: An Honest Comparison | ${APP_NAME}`;
const description =
  "Container scanning tools in 2026 compared fairly: Trivy, Grype, Clair, Docker Scout, Snyk, and ScanRook, on finding depth, speed, scope, and when each fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "container scanning tools",
    "container image scanner",
    "container vulnerability scanner comparison",
    "trivy vs grype vs clair",
    "docker scout vs trivy",
    "best container scanner 2026",
    "open source container scanning",
    "clair scanner",
    "snyk container",
    "container scanner benchmark",
  ],
  alternates: { canonical: "/blog/container-scanning-tools" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/container-scanning-tools",
    images: ["/blog/container-scanning-tools.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/container-scanning-tools.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Container Scanning Tools in 2026: An Honest Comparison",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/container-scanning-tools",
  image: "https://scanrook.io/blog/container-scanning-tools.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are the main container scanning tools in 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The most widely used are Trivy and Grype (open source CLIs), Clair (an open source scanning service often paired with a registry), Docker Scout (built into Docker Desktop and Hub), Snyk Container (commercial, developer-workflow focused), and ScanRook (multi-source enrichment with installed-state verification). Each targets a different balance of speed, finding depth, scope, and integration surface.",
      },
    },
    {
      "@type": "Question",
      name: "Which container scanner finds the most vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In our 2026 benchmark, multi-source scanning found substantially more than single-database tools: on nginx:1.27 ScanRook reported 2,952 unique CVEs versus 314 for Trivy and 315 for Grype, and on ubuntu:24.04 it found 1,365 versus 10 and 47. The gap comes from querying multiple advisory sources rather than one aggregated database, not from any tool being poorly built. More findings also means more triage.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between Trivy, Grype, and Clair?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Trivy and Grype are single-binary CLIs that download a vulnerability database and match locally, which makes them fast; Trivy also covers IaC, secrets, and Kubernetes. Clair is different in shape: it is a service with an indexer, matcher, and notifier, designed to scan images continuously and integrate with a registry such as Quay rather than run as a one-shot command.",
      },
    },
    {
      "@type": "Question",
      name: "Should I use an open source or commercial container scanner?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Open source tools like Trivy and Grype are excellent for fast CI feedback at no cost. Commercial tools like Snyk add developer-workflow features, fix pull requests, and support. Many teams run both: a fast open-source scanner on every pull request for quick gating, plus a deeper scanner on main builds for audit-grade coverage. The choice is about workflow and depth, not quality alone.",
      },
    },
    {
      "@type": "Question",
      name: "Is scan speed or finding depth more important?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on where the scan runs. On a pull request, speed matters most, so a sub-second local-database scan keeps developers moving. On a release build or compliance audit, depth matters more, and a few extra seconds to query multiple advisory sources is worth catching CVEs a single database misses. The healthiest programs use fast scans for feedback and deep scans for assurance.",
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
            Container Scanning Tools in 2026: An Honest Comparison
          </h1>
          <p className="text-sm muted">Published December 25, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            There is no shortage of container scanning tools, and most of the comparisons online read
            like feature checklists from the vendor that wrote them. This one is different in two
            ways: we credit each tool for what it genuinely does well, and every performance claim
            comes from a reproducible benchmark you can run yourself. Here is how the major container
            scanners actually differ, and how to pick one.
          </p>
        </header>

        <img
          src="/blog/container-scanning-tools.jpg"
          alt="Container scanning tools compared"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What a container scanner does</h2>
          <p className="text-sm muted">
            A container scanner inspects an image, enumerates the software installed in its layers
            &mdash; OS packages, language dependencies, sometimes binaries &mdash; and matches each
            component against known vulnerability advisories. The differences between tools come down
            to four axes: how they discover installed software, how many advisory sources they check,
            how fast they run, and what else besides images they cover. If you are new to the
            category, our{" "}
            <Link href="/blog/container-image-scanning-guide" className="underline">
              container image scanning guide
            </Link>{" "}
            walks through the fundamentals; this post assumes you know them and want to choose.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The landscape at a glance</h2>
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
                  <td className="py-2 pr-4 align-top">Fastest scans; one binary for images, IaC, secrets, K8s</td>
                  <td className="py-2 align-top">Single aggregated database; shallower depth</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Grype</strong></td>
                  <td className="py-2 pr-4 align-top">Open source</td>
                  <td className="py-2 pr-4 align-top">Clean CLI; tight Syft/SBOM integration</td>
                  <td className="py-2 align-top">Own single database; images and filesystems only</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Clair</strong></td>
                  <td className="py-2 pr-4 align-top">Open source (service)</td>
                  <td className="py-2 pr-4 align-top">Continuous registry-integrated scanning; API-driven</td>
                  <td className="py-2 align-top">Runs as a service with a database; more to operate</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Docker Scout</strong></td>
                  <td className="py-2 pr-4 align-top">Freemium</td>
                  <td className="py-2 pr-4 align-top">Built into Docker Desktop/Hub; zero setup</td>
                  <td className="py-2 align-top">Strongest inside Docker&apos;s ecosystem</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Snyk Container</strong></td>
                  <td className="py-2 pr-4 align-top">Commercial</td>
                  <td className="py-2 pr-4 align-top">Developer workflow, fix advice, base-image upgrades</td>
                  <td className="py-2 align-top">Pricing scales with usage; cloud-centric</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top"><strong>ScanRook</strong></td>
                  <td className="py-2 pr-4 align-top">Free tier + paid</td>
                  <td className="py-2 pr-4 align-top">Multi-source enrichment (OSV, NVD, OVAL); installed-state verification; confidence tiers</td>
                  <td className="py-2 align-top">Slower in live-query mode; no IaC scanning</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            For head-to-head pages we keep{" "}
            <Link href="/compare/trivy" className="underline">ScanRook vs Trivy</Link>,{" "}
            <Link href="/compare/grype" className="underline">ScanRook vs Grype</Link>, and{" "}
            <Link href="/compare/snyk" className="underline">ScanRook vs Snyk</Link>.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The metric that actually varies: finding depth</h2>
          <p className="text-sm muted">
            Scanners agree far more on speed than on coverage. Speed differences are seconds; coverage
            differences are orders of magnitude. From{" "}
            <Link href="/blog/vulnerability-scanner-benchmark-2026" className="underline">
              our 2026 benchmark
            </Link>{" "}
            (warm cache; ScanRook v1.14.2, Trivy 0.69.1, Grype 0.109.0; finding count = unique CVE
            IDs), the finding counts on nginx:1.27 look like this:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 820 210"
              role="img"
              aria-label="Unique CVE findings on nginx:1.27 — ScanRook 2,952, Trivy 314, Grype 315"
              className="w-full h-auto text-black dark:text-white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="820" height="210" rx="16" className="fill-black/[.02] dark:fill-white/[.02]" />
              <text x="24" y="34" className="fill-current" fontSize="12" fontWeight="600">Unique CVE findings on nginx:1.27</text>

              <text x="24" y="74" className="fill-current" fontSize="12">ScanRook</text>
              <rect x="130" y="60" width="600" height="20" rx="4" className="fill-[var(--dg-accent,#2563eb)]" opacity="0.85" />
              <text x="740" y="75" className="fill-current" fontSize="11" fontWeight="600">2,952</text>

              <text x="24" y="118" className="fill-current" fontSize="12">Trivy</text>
              <rect x="130" y="104" width="64" height="20" rx="4" className="fill-current" opacity="0.4" />
              <text x="204" y="119" className="fill-current" fontSize="11" fontWeight="600">314</text>

              <text x="24" y="162" className="fill-current" fontSize="12">Grype</text>
              <rect x="130" y="148" width="64" height="20" rx="4" className="fill-current" opacity="0.4" />
              <text x="204" y="163" className="fill-current" fontSize="11" fontWeight="600">315</text>

              <text x="24" y="196" className="fill-current" fontSize="10" opacity="0.55">Bars to scale. Source: ScanRook 2026 benchmark, warm cache.</text>
            </svg>
          </div>
          <p className="text-sm muted">
            The pattern holds across images. The full table from the same benchmark:
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
            The gap is architectural, not a matter of one tool being better written. Trivy and Grype
            each match against a single pre-aggregated database &mdash; that is precisely what makes
            them fast. ScanRook queries OSV, NVD via CPE matching, and Red Hat OVAL in parallel for
            every package, and different databases know about different advisories. The honest
            counterpoint: more findings means more triage, which is why ScanRook tags each finding
            with a confidence tier so you can filter to verified-installed matches first.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The speed side of the tradeoff</h2>
          <p className="text-sm muted">
            Depth is not free. In the same benchmark, Trivy completed image scans in 0.1&ndash;0.3
            seconds &mdash; the fastest of everything tested &mdash; because it matches entirely
            against a local database with no network calls. ScanRook, in its default live-query mode,
            took 3&ndash;9 seconds per image because it queries multiple advisory sources during the
            scan. Its local vulnerability-database mode closes most of that gap by pre-indexing the
            advisory data, at the cost of a database you keep updated &mdash; the same tradeoff Trivy
            makes, with broader sources behind it. For a pull-request gate, sub-second scans win; for
            a release audit, a few extra seconds to catch what a single database misses is the better
            deal.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scope: not every scanner does the same job</h2>
          <p className="text-sm muted">
            Finding counts only compare tools doing the same thing. Some of these tools are broader
            than pure image scanning. Trivy is really a multi-scanner: images, filesystems, IaC
            misconfigurations, secrets, and Kubernetes in one binary. Clair is a service built to sit
            beside a registry and scan images continuously as new advisories land, with an
            indexer/matcher/notifier architecture rather than a one-shot CLI. Docker Scout meets you
            inside Docker Desktop and Hub. Snyk is a developer-security platform where container
            scanning is one product among SAST, SCA, and IaC. ScanRook focuses on deep vulnerability
            findings for containers, binaries, and source archives, and does not do IaC scanning at
            all. When you compare, compare the job you actually need done.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which should you pick?</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Trivy</strong> if you want the fastest scans and one binary that also covers
              IaC, secrets, and Kubernetes at zero cost. It is the safe default for most CI pipelines.
            </li>
            <li>
              <strong>Grype</strong> if you are standardizing on Syft-generated SBOMs and want an
              open-source scanner that consumes them natively.
            </li>
            <li>
              <strong>Clair</strong> if you run your own registry (especially Quay) and want
              continuous, service-based scanning triggered as images are pushed.
            </li>
            <li>
              <strong>Docker Scout</strong> if your workflow already lives in Docker Desktop and Hub
              and you want findings where you already look.
            </li>
            <li>
              <strong>Snyk</strong> if you are buying a developer-security platform and the
              per-developer pricing and fix-workflow features fit your team.
            </li>
            <li>
              <strong>ScanRook</strong> if finding depth is the requirement &mdash; security reviews,
              compliance audits, or anywhere &ldquo;the scanner did not know about it&rdquo; is not an
              acceptable answer.
            </li>
          </ul>
          <p className="text-sm muted">
            For a wider roundup with more tools weighed the same way, see{" "}
            <Link href="/blog/best-container-vulnerability-scanners-2026" className="underline">
              the best container vulnerability scanners in 2026
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What are the main container scanning tools?</h3>
              <p className="text-sm muted mt-1">
                Trivy and Grype (open-source CLIs), Clair (a scanning service), Docker Scout (built
                into Docker), Snyk Container (commercial), and ScanRook (multi-source enrichment).
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Which finds the most vulnerabilities?</h3>
              <p className="text-sm muted mt-1">
                In our benchmark, multi-source scanning found far more &mdash; 2,952 CVEs on
                nginx:1.27 for ScanRook versus 314 for Trivy and 315 for Grype &mdash; because it
                queries multiple advisory sources.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How does Clair differ from Trivy?</h3>
              <p className="text-sm muted mt-1">
                Clair runs as a service with a database and integrates with a registry for continuous
                scanning, where Trivy is a fast single-binary CLI that also covers IaC and secrets.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Open source or commercial?</h3>
              <p className="text-sm muted mt-1">
                Open source covers fast, free CI scanning; commercial adds workflow and support. Many
                teams run a fast scanner on PRs and a deep scanner on main builds.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Compare on your own images</h3>
          <p className="text-sm muted leading-relaxed">
            The benchmark numbers are reproducible. Scan one of your production images with ScanRook
            next to your current tool and read the diff &mdash; every finding carries its source and a
            confidence tier, so you can verify rather than trust.
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
            <Link href="/blog/best-container-vulnerability-scanners-2026" className="underline">
              Best Container Vulnerability Scanners in 2026
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/vulnerability-scanner-benchmark-2026" className="underline">
              Vulnerability Scanner Benchmark 2026
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-image-scanning-guide" className="underline">
              Container Image Scanning Guide
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
