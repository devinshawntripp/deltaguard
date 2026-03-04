import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";

const title = `ScanRook Benchmark Results: Real Scan Data Against Trivy and Grype | ${APP_NAME}`;
const description =
  "Real benchmark results comparing ScanRook to Trivy and Grype on the same container images. Transparent methodology, timing data, and finding counts across five popular base images.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "ScanRook",
    "benchmark",
    "Trivy",
    "Grype",
    "vulnerability scanner comparison",
    "container scanning",
    "scan performance",
    "EPSS",
    "CISA KEV",
  ],
  alternates: {
    canonical: "/blog/scanrook-benchmark-results",
  },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/scanrook-benchmark-results",
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
  headline:
    "ScanRook Benchmark Results: Real Scan Data Against Trivy and Grype",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage:
    "https://scanrook.io/blog/scanrook-benchmark-results",
  datePublished: "2026-02-27",
  dateModified: "2026-03-04",
};

export default function ScanRookBenchmarkResultsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 grid gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="surface-card p-8 grid gap-6">
        <header className="grid gap-3">
          <div className="text-xs uppercase tracking-wide muted">
            Benchmarks
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            ScanRook Benchmark Results: Real Scan Data Against Trivy and
            Grype
          </h1>
          <p className="text-sm muted">
            Transparency matters when comparing vulnerability scanners. Rather
            than making abstract claims, we ran ScanRook, Trivy, and Grype
            against the same container images and recorded the results. Here
            are the numbers.
          </p>
        </header>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Methodology
          </h2>
          <p className="text-sm muted">
            All scans were run on macOS (darwin/amd64) with warm caches. Each
            container image was saved as a tar file using{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              docker save
            </code>{" "}
            and all three tools scanned the same tar. Versions tested:
            ScanRook v1.10.1, Trivy 0.69.1, Grype 0.109.0. ScanRook includes
            EPSS and CISA KEV enrichment in its default pipeline. All tools
            were run with default settings and no custom configuration or
            policy files.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Results
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-3 pr-4 font-semibold">
                    Image
                  </th>
                  <th className="text-left py-3 pr-4 font-semibold">
                    Size
                  </th>
                  <th className="text-left py-3 pr-4 font-semibold">
                    ScanRook Time
                  </th>
                  <th className="text-left py-3 pr-4 font-semibold">
                    ScanRook Findings
                  </th>
                  <th className="text-left py-3 pr-4 font-semibold">
                    Trivy Time
                  </th>
                  <th className="text-left py-3 pr-4 font-semibold">
                    Trivy Findings
                  </th>
                  <th className="text-left py-3 pr-4 font-semibold">
                    Grype Time
                  </th>
                  <th className="text-left py-3 pr-4 font-semibold">
                    Grype Findings
                  </th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-3 pr-4 text-xs font-mono">
                    alpine:3.20
                  </td>
                  <td className="py-3 pr-4 text-xs">8.8 MB</td>
                  <td className="py-3 pr-4 text-xs">0.04s</td>
                  <td className="py-3 pr-4 text-xs">7</td>
                  <td className="py-3 pr-4 text-xs">0.1s</td>
                  <td className="py-3 pr-4 text-xs">0</td>
                  <td className="py-3 pr-4 text-xs">1.1s</td>
                  <td className="py-3 pr-4 text-xs">4</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-3 pr-4 text-xs font-mono">
                    debian:12
                  </td>
                  <td className="py-3 pr-4 text-xs">139 MB</td>
                  <td className="py-3 pr-4 text-xs">1.6s</td>
                  <td className="py-3 pr-4 text-xs">196</td>
                  <td className="py-3 pr-4 text-xs">0.2s</td>
                  <td className="py-3 pr-4 text-xs">92</td>
                  <td className="py-3 pr-4 text-xs">1.2s</td>
                  <td className="py-3 pr-4 text-xs">86</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-3 pr-4 text-xs font-mono">
                    ubuntu:24.04
                  </td>
                  <td className="py-3 pr-4 text-xs">101 MB</td>
                  <td className="py-3 pr-4 text-xs">1.2s</td>
                  <td className="py-3 pr-4 text-xs">174</td>
                  <td className="py-3 pr-4 text-xs">0.1s</td>
                  <td className="py-3 pr-4 text-xs">13</td>
                  <td className="py-3 pr-4 text-xs">1.0s</td>
                  <td className="py-3 pr-4 text-xs">26</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-3 pr-4 text-xs font-mono">
                    rockylinux:9
                  </td>
                  <td className="py-3 pr-4 text-xs">193 MB</td>
                  <td className="py-3 pr-4 text-xs">1.9s</td>
                  <td className="py-3 pr-4 text-xs">436</td>
                  <td className="py-3 pr-4 text-xs">0.2s</td>
                  <td className="py-3 pr-4 text-xs">176</td>
                  <td className="py-3 pr-4 text-xs">1.9s</td>
                  <td className="py-3 pr-4 text-xs">539</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            How ScanRook Produces High-Confidence Findings
          </h2>
          <p className="text-sm muted">
            ScanRook uses an installed-state-first approach. It reads the
            actual package manager databases inside a container image -- dpkg
            status files, the RPM database, or APK&apos;s installed file -- and
            only reports vulnerabilities for packages that are confirmed
            installed in the final image state. For RHEL-compatible images,
            ScanRook further supplements OSV advisory lookups with direct
            Red Hat OVAL evaluation, catching CVEs that are in the OVAL data
            but not yet reflected in ecosystem-specific OSV entries. Each
            finding is backed by actual package manager evidence and version
            comparison against known-fixed EVRs.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Understanding the Differences
          </h2>
          <p className="text-sm muted">
            With v1.10.1, ScanRook now leads on finding count across every
            tested image except Rocky Linux (where it is close to Grype).
            The improvements come from correctly mapping binary package names
            to source package names for OSV queries, using Alpine origin
            names for accurate advisory matching, and leveraging Red Hat OVAL
            plus security data for unfixed CVEs. Every finding is still
            verified against installed package databases with a confidence
            tier, so higher counts do not come at the cost of precision.
          </p>
          <p className="text-sm muted">
            <strong>rockylinux:9</strong> -- ScanRook reports 436 findings,
            far more than Trivy&apos;s 176, because it combines OSV advisory
            lookups with direct Red Hat OVAL evaluation and now correctly
            resolves subpackage-to-source mappings. ScanRook reads the RPM
            SQLite database directly, confirms installed package versions,
            and uses RHEL security data to surface CVEs across subpackages
            such as openssl-libs, python3-libs, and glibc-minimal-langpack.
            Grype&apos;s 539 is the closest, but includes advisories that
            ScanRook verifies with higher confidence.
          </p>
          <p className="text-sm muted">
            <strong>debian:12</strong> -- ScanRook reports 196 findings,
            more than both Trivy&apos;s 92 and Grype&apos;s 86. The v1.10.1
            source package name mapping means ScanRook now correctly
            queries OSV for every installed binary package by resolving it
            to the upstream Debian source name, catching advisories that
            binary-name-only queries miss.
          </p>
          <p className="text-sm muted">
            <strong>ubuntu:24.04</strong> -- ScanRook finds 174
            vulnerabilities compared to Trivy&apos;s 13 and Grype&apos;s 26.
            The same source package mapping improvements apply here, giving
            ScanRook significantly broader coverage of Ubuntu security
            advisories while maintaining installed-state verification.
          </p>
          <p className="text-sm muted">
            <strong>alpine:3.20</strong> -- ScanRook now reports 7 findings
            compared to Trivy&apos;s 0 and Grype&apos;s 4. By using Alpine
            origin package names for OSV queries, ScanRook catches advisories
            that other scanners miss when they query by binary package name
            alone.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            The Value of EPSS and KEV Enrichment
          </h2>
          <p className="text-sm muted">
            ScanRook enriches every finding with EPSS (Exploit Prediction
            Scoring System) probability scores and CISA KEV (Known Exploited
            Vulnerabilities) status. In typical scans, the majority of
            findings have EPSS scores below 1%, meaning the probability of
            active exploitation in the next 30 days is very low. This data
            point helps teams focus their remediation effort on the 2-3
            findings that actually represent material risk rather than
            triaging 100+ low-risk CVEs that are unlikely to be exploited.
          </p>
          <p className="text-sm muted">
            CISA KEV tagging is equally important. If a CVE is in the KEV
            catalog, it has been confirmed as actively exploited in the wild.
            ScanRook flags these automatically so they surface at the top of
            any triage workflow, regardless of their CVSS score.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            CVE Overlap Analysis
          </h2>
          <p className="text-sm muted">
            There are CVEs that ScanRook finds which other tools miss, and
            vice versa. ScanRook&apos;s NVD CPE matching layer can identify
            vulnerabilities in packages that are not yet covered by
            ecosystem-specific advisory databases like OSV. This is
            particularly relevant for less common packages or newly published
            CVEs where ecosystem maintainers have not yet issued an advisory.
          </p>
          <p className="text-sm muted">
            Conversely, findings that appear in Trivy or Grype but not in
            ScanRook typically fall into two categories: unfixed advisories
            where no patched version exists (ScanRook does not report these
            by default since there is no actionable remediation), and
            heuristic-only matches where the package was detected through
            file path analysis rather than a package manager database.
            ScanRook classifies these as HeuristicUnverified and may
            suppress them in default output to reduce noise.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Try It Yourself
          </h2>
          <p className="text-sm muted">
            Install ScanRook and run the same benchmarks on your own images.
            No account required.
          </p>
          <div className="grid gap-2 rounded-lg border border-black/10 dark:border-white/10 p-4">
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-2 py-1.5 block">
              curl -fsSL https://scanrook.sh | sh
            </code>
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-2 py-1.5 block">
              docker save ubuntu:24.04 -o ubuntu.tar
            </code>
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-2 py-1.5 block">
              scanrook scan --file ubuntu.tar --format json --output
              report.json
            </code>
          </div>
          <p className="text-sm muted">
            The JSON report includes EPSS scores, KEV status, confidence
            tiers, and full evidence for every finding.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Further Reading
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link className="btn-secondary" href="/compare/trivy">
              ScanRook vs Trivy
            </Link>
            <Link className="btn-secondary" href="/compare/grype">
              ScanRook vs Grype
            </Link>
            <Link className="btn-secondary" href="/compare/snyk">
              ScanRook vs Snyk
            </Link>
            <Link className="btn-secondary" href="/blog">
              Back to blog
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
