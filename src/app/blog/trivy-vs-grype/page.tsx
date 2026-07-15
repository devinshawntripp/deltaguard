import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-13";

const title = `Trivy vs Grype: An Honest Comparison of Two Scanners | ${APP_NAME}`;
const description =
  "Trivy vs Grype compared honestly: scope, databases, output formats, speed, and finding depth, with benchmark data and when to pick each scanner.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "trivy vs grype",
    "grype vs trivy",
    "trivy vs grype comparison",
    "trivy or grype",
    "grype vs trivy speed",
    "open source container scanner",
    "trivy grype difference",
    "aqua trivy vs anchore grype",
    "container vulnerability scanner comparison",
    "syft grype sbom",
  ],
  alternates: { canonical: "/blog/trivy-vs-grype" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/trivy-vs-grype",
    images: ["/blog/trivy-vs-grype.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/trivy-vs-grype.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Trivy vs Grype: An Honest Comparison of Two Scanners",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/trivy-vs-grype",
  image: "https://scanrook.io/blog/trivy-vs-grype.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the main difference between Trivy and Grype?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Trivy is an all-in-one security scanner from Aqua Security that covers container images, filesystems, IaC misconfiguration, secrets, licenses, and Kubernetes. Grype from Anchore is focused specifically on vulnerability scanning of images, filesystems, and SBOMs, and pairs tightly with Syft for SBOM generation. Both are open-source Go tools that match packages against a pre-downloaded database.",
      },
    },
    {
      "@type": "Question",
      name: "Is Trivy faster than Grype?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In our 2026 benchmark Trivy was faster, completing image scans in 0.1 to 0.3 seconds versus 1 to 2.5 seconds for Grype. Both are fast because they match locally against a pre-downloaded database, so the difference rarely matters in practice. Grype's extra time comes from differences in database format and matching.",
      },
    },
    {
      "@type": "Question",
      name: "Do Trivy and Grype find the same vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Their finding counts are usually close because both match against a single aggregated database, but they are not identical. In our benchmark they were within a few findings on most images, yet on ubuntu:24.04 Grype reported 47 findings to Trivy's 10. Differences in database sources and how each handles distro packages produce these gaps.",
      },
    },
    {
      "@type": "Question",
      name: "Which should I use for SBOM workflows?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Grype has an advantage if you are standardizing on Syft-generated SBOMs, since the two are built to work together and Grype consumes an SBOM natively as scan input. Trivy can also generate and scan SBOMs and outputs CycloneDX and SPDX, so either works; the question is whether you want Grype's SBOM-first pairing or Trivy's all-in-one breadth.",
      },
    },
    {
      "@type": "Question",
      name: "Can I run both Trivy and Grype together?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, and some teams do to cross-check coverage, but the overlap is high because both rely on single-database matching. Running two similar scanners mostly duplicates results. If you want a genuinely different second opinion, a scanner with different architecture, such as one using multi-source enrichment, adds more than a second single-database tool.",
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
            Trivy vs Grype: An Honest Comparison of Two Scanners
          </h1>
          <p className="text-sm muted">Published August 13, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Trivy vs Grype is the most common open-source scanner matchup, and the honest answer is
            that they are more alike than different. Both are free, fast, Go-based, and match against a
            pre-downloaded database. The real decision is about scope and ecosystem, not a winner.
            Here is the fair breakdown, with benchmark data.
          </p>
        </header>

        <img
          src="/blog/trivy-vs-grype.jpg"
          alt="Trivy versus Grype open-source vulnerability scanner comparison"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The one-line summary</h2>
          <p className="text-sm muted">
            <strong>Trivy</strong> (Aqua Security) is an all-in-one scanner: images, filesystems, git
            repos, IaC misconfiguration, secrets, licenses, and Kubernetes, in one binary.{" "}
            <strong>Grype</strong> (Anchore) is a focused vulnerability scanner for images,
            filesystems, and SBOMs that pairs with Syft for SBOM generation. If you want one tool for
            many jobs, that points to Trivy. If you want a composable, SBOM-first vulnerability scanner,
            that points to Grype. Both are Apache-2.0 licensed and widely used in production.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Capability at a glance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Capability</th>
                  <th className="text-left py-2 pr-4 font-semibold">Trivy</th>
                  <th className="text-left py-2 font-semibold">Grype</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Vendor</td>
                  <td className="py-2 pr-4 align-top">Aqua Security</td>
                  <td className="py-2 align-top">Anchore</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Image + filesystem scanning</td>
                  <td className="py-2 pr-4 align-top">Yes</td>
                  <td className="py-2 align-top">Yes</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">IaC / misconfiguration</td>
                  <td className="py-2 pr-4 align-top">Yes</td>
                  <td className="py-2 align-top">No</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Secret detection</td>
                  <td className="py-2 pr-4 align-top">Yes</td>
                  <td className="py-2 align-top">No</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">SBOM generation</td>
                  <td className="py-2 pr-4 align-top">Built in</td>
                  <td className="py-2 align-top">Via Syft (companion tool)</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Scan an SBOM as input</td>
                  <td className="py-2 pr-4 align-top">Yes</td>
                  <td className="py-2 align-top">Yes (native Syft pairing)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">Vulnerability data model</td>
                  <td className="py-2 pr-4 align-top">Single aggregated DB (trivy-db)</td>
                  <td className="py-2 align-top">Single aggregated DB (grype-db)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The databases</h2>
          <p className="text-sm muted">
            Both tools build a single database ahead of time and match locally against it. Trivy
            distributes <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">trivy-db</code>{" "}
            as an OCI artifact and refreshes it on a schedule; Grype ships{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">grype-db</code>{" "}
            and updates it via <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">grype db update</code>.
            Under the hood both aggregate similar upstreams &mdash; NVD, GitHub Security Advisories,
            and per-distro security trackers for Alpine, Debian, Ubuntu, RHEL, and others &mdash; which
            is exactly why their results usually land so close together.
          </p>
          <p className="text-sm muted">
            The shared architecture is also the shared limitation. A single pre-aggregated database is
            a point-in-time snapshot, and any advisory a tool has not integrated yet is invisible to
            it. We unpack how the underlying sources diverge in our{" "}
            <Link href="/blog/cve-database-comparison" className="underline">
              CVE database comparison
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Output formats and CI fit</h2>
          <p className="text-sm muted">
            Both scanners cover the formats CI systems expect. Trivy emits a table,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">json</code>,
            SARIF, CycloneDX, SPDX, and a Go-template mode, plus native GitHub Actions support. Grype
            emits a table, JSON, CycloneDX, SARIF, and templates, and its tight coupling with Syft
            makes the &ldquo;generate an SBOM once, scan it many times&rdquo; pattern very clean. For
            failing a build on severity, both take a threshold flag:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Trivy: fail the job on High or Critical
trivy image --exit-code 1 --severity HIGH,CRITICAL myapp:latest

# Grype: fail the job at or above the "high" severity gate
grype myapp:latest --fail-on high

# Grype consuming a Syft SBOM instead of re-scanning the image
syft myapp:latest -o cyclonedx-json > sbom.json
grype sbom:sbom.json --fail-on high`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Performance and finding counts</h2>
          <p className="text-sm muted">
            The numbers below come from{" "}
            <Link href="/blog/vulnerability-scanner-benchmark-2026" className="underline">
              our 2026 benchmark
            </Link>{" "}
            (warm cache; Trivy 0.69.1, Grype 0.109.0; finding count = unique CVE IDs). Times are in
            parentheses:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Image</th>
                  <th className="text-left py-2 pr-4 font-semibold">Trivy</th>
                  <th className="text-left py-2 font-semibold">Grype</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 text-xs font-mono">alpine:3.20</td>
                  <td className="py-2 pr-4">16 (0.1s)</td>
                  <td className="py-2">20 (1.0s)</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 text-xs font-mono">debian:12</td>
                  <td className="py-2 pr-4">123 (0.1s)</td>
                  <td className="py-2">117 (1.1s)</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 text-xs font-mono">ubuntu:24.04</td>
                  <td className="py-2 pr-4">10 (0.1s)</td>
                  <td className="py-2">47 (1.0s)</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 text-xs font-mono">nginx:1.27</td>
                  <td className="py-2 pr-4">314 (0.2s)</td>
                  <td className="py-2">315 (1.6s)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-xs font-mono">postgres:17</td>
                  <td className="py-2 pr-4">224 (0.3s)</td>
                  <td className="py-2">222 (2.5s)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            Two things stand out. Trivy is consistently the faster of the two &mdash; sub-second on
            every image &mdash; while Grype takes one to a few seconds. And the finding counts track
            closely on most images but not all: on ubuntu:24.04 Grype reported 47 to Trivy&apos;s 10.
            That kind of gap is a reminder that even two single-database scanners disagree at the
            edges, usually over how each maps distro packages to advisories. In day-to-day CI, the
            speed difference is noise; the coverage difference is the thing worth testing on your own
            images.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook differs from both</h2>
          <p className="text-sm muted">
            Trivy and Grype share an architecture &mdash; one pre-aggregated database, matched locally
            &mdash; and that is what makes them fast and what caps their depth. ScanRook takes the
            other tradeoff: it queries OSV, NVD (via CPE matching), and Red Hat OVAL in parallel for
            every package and reads the actual installed-package state inside the image. In the same
            benchmark that produced the table above, ScanRook found 1,365 findings on ubuntu:24.04
            where Trivy found 10 and Grype 47, and 2,952 on nginx:1.27 where both single-database tools
            landed near 315. The cost is speed: ScanRook took 3&ndash;9 seconds per image in
            live-query mode versus their sub-second-to-few-second scans, a gap its local
            vulnerability-database mode narrows. This is a genuine tradeoff, not a free lunch &mdash; we
            lay out both sides in{" "}
            <Link href="/blog/trivy-alternatives" className="underline">
              Trivy alternatives
            </Link>{" "}
            and{" "}
            <Link href="/blog/grype-alternatives" className="underline">
              Grype alternatives
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which should you pick?</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Pick Trivy</strong> if you want one tool covering images, IaC, secrets, and
              Kubernetes, the fastest scans, and first-class CI integrations. For most teams starting
              out, it is the pragmatic default.
            </li>
            <li>
              <strong>Pick Grype</strong> if you are building an SBOM-first pipeline around Syft, want
              a small focused scanner rather than an all-in-one, or already live in the Anchore
              ecosystem.
            </li>
            <li>
              <strong>Add a deeper scanner</strong> if &ldquo;the scanner did not know about it&rdquo;
              is not an acceptable answer &mdash; security reviews, compliance audits, or any case
              where you need coverage beyond a single database. Two single-database tools mostly
              duplicate each other; a different architecture is what adds a real second opinion.
            </li>
          </ul>
          <p className="text-sm muted">
            Whichever you choose, evaluate it on your own images rather than a blog table. See the
            full multi-tool picture in{" "}
            <Link href="/blog/best-container-vulnerability-scanners-2026" className="underline">
              the best container vulnerability scanners of 2026
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Are Trivy and Grype both free?</h3>
              <p className="text-sm muted mt-1">
                Yes. Both are open source under the Apache-2.0 license with no paid tier required to
                run the scanner. Their vendors, Aqua Security and Anchore, sell commercial platforms
                built around them.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does Grype need Syft?</h3>
              <p className="text-sm muted mt-1">
                No, Grype scans an image directly. But Syft is its companion SBOM generator, and the
                pairing is a core reason to choose Grype: generate an SBOM once with Syft, then scan
                it repeatedly with Grype.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Which is better for Kubernetes?</h3>
              <p className="text-sm muted mt-1">
                Trivy has broader Kubernetes support, including cluster scanning and the Trivy
                Operator for in-cluster reports. Grype focuses on scanning individual images and
                SBOMs, leaving cluster-level concerns to other tools.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Do more findings mean more false positives?</h3>
              <p className="text-sm muted mt-1">
                Not necessarily. A higher count can mean broader true-positive coverage rather than
                noise, especially when the extra findings come from verified sources and are confirmed
                against installed packages. The way to know is to inspect the diff, not the totals.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Compare on your own images</h3>
          <p className="text-sm muted leading-relaxed">
            The finding-count gaps are reproducible. Scan one of your production images with ScanRook
            next to Trivy or Grype and read the diff &mdash; every ScanRook finding carries its source
            and a confidence tier, so you can verify rather than trust.
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
            <Link href="/blog/trivy-alternatives" className="underline">
              Trivy Alternatives in 2026
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/grype-alternatives" className="underline">
              Grype Alternatives in 2026
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
