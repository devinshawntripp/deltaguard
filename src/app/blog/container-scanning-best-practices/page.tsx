import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";

const title = `Container Scanning Best Practices for Security Teams | ${APP_NAME}`;
const description =
  "Practical guidance on scanning container images effectively, from base image selection to CI/CD integration, finding prioritization, and reducing false positives.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "container scanning",
    "container security",
    "Docker scanning",
    "vulnerability scanning",
    "CI/CD security",
    "base images",
    "ScanRook",
  ],
  alternates: {
    canonical: "/blog/container-scanning-best-practices",
  },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/container-scanning-best-practices",
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
  headline: "Container Scanning Best Practices for Security Teams",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage:
    "https://scanrook.io/blog/container-scanning-best-practices",
  datePublished: "2026-02-27",
  dateModified: "2026-02-27",
};

export default function ContainerScanningBestPracticesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 grid gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="surface-card p-8 grid gap-6">
        <header className="grid gap-3">
          <div className="text-xs uppercase tracking-wide muted">
            Best practices
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Container Scanning Best Practices for Security Teams
          </h1>
          <p className="text-sm muted">
            Container images are the deployment unit for most modern
            applications. Scanning them for vulnerabilities is essential, but
            doing it effectively requires more than just running a tool. This
            article covers practical guidance for building a container scanning
            program that produces actionable results.
          </p>
        </header>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            1. Choose Base Images Carefully
          </h2>
          <p className="text-sm muted">
            Your choice of base image determines the majority of your
            vulnerability surface. A full-featured base image like
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              ubuntu:22.04
            </code>{" "}
            includes hundreds of system packages, many of which your
            application does not use. Each package is a potential source of
            vulnerability findings.
          </p>
          <p className="text-sm muted">
            Minimal base images like Alpine, distroless, or scratch
            significantly reduce the installed package count. An Alpine-based
            image typically has 10-20 base packages compared to 100+ in a
            Debian or Ubuntu image. Fewer packages means fewer findings and
            less triage work.
          </p>
          <p className="text-sm muted">
            When choosing a base image, consider:
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>How frequently the base image maintainer publishes updates with security patches.</li>
            <li>Whether the base image includes only the packages your application actually needs.</li>
            <li>The security track record of the distribution (patch cadence, advisory quality).</li>
          </ul>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            2. Use Multi-Stage Builds
          </h2>
          <p className="text-sm muted">
            Multi-stage Docker builds separate the build environment from the
            runtime environment. Build dependencies like compilers, development
            headers, and build tools stay in the build stage and are not
            included in the final image. This reduces the attack surface and
            produces cleaner scan results.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
            <code>{`# Build stage
FROM golang:1.22 AS builder
WORKDIR /app
COPY . .
RUN go build -o server .

# Runtime stage
FROM alpine:3.19
RUN apk add --no-cache ca-certificates
COPY --from=builder /app/server /usr/local/bin/server
CMD ["server"]`}</code>
          </pre>
          <p className="text-sm muted">
            In this example, the Go compiler and all build tools exist only in
            the builder stage. The final image contains only Alpine&apos;s base
            packages, CA certificates, and the compiled binary. A scanner that
            reads the final image&apos;s package state will report only the
            packages that are actually present at runtime.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            3. Scan at Build Time and in the Registry
          </h2>
          <p className="text-sm muted">
            Scanning should happen at multiple points in the image lifecycle:
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>
              <strong>CI/CD pipeline</strong> -- Scan images after they are
              built but before they are pushed to the registry. This catches
              vulnerabilities before deployment and can gate releases.
            </li>
            <li>
              <strong>Registry</strong> -- Scan images periodically in the
              registry to detect newly disclosed vulnerabilities in
              already-deployed images.
            </li>
            <li>
              <strong>Developer workstation</strong> -- Enable developers to
              scan locally during development to catch issues before they reach
              CI.
            </li>
          </ul>
          <p className="text-sm muted">
            ScanRook supports all three scenarios. The CLI can be integrated
            into{" "}
            <Link
              href="/docs/integrations/github-actions"
              className="font-medium underline underline-offset-2"
            >
              GitHub Actions
            </Link>{" "}
            and{" "}
            <Link
              href="/docs/integrations/gitlab-ci"
              className="font-medium underline underline-offset-2"
            >
              GitLab CI
            </Link>{" "}
            pipelines, run against images in a registry, or used directly on a
            developer&apos;s machine.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            4. Prioritize Findings Effectively
          </h2>
          <p className="text-sm muted">
            A container scan will almost always produce findings. The question
            is which ones to fix first. Sorting by CVSS score alone is a
            common starting point, but it misses important context. A more
            effective prioritization model combines multiple signals:
          </p>
          <ol className="list-decimal pl-6 text-sm muted grid gap-1">
            <li>
              <strong>CISA KEV status</strong> -- If a CVE is on the{" "}
              <Link
                href="/blog/cisa-kev-guide"
                className="font-medium underline underline-offset-2"
              >
                CISA KEV catalog
              </Link>
              , it is being actively exploited. Fix it immediately.
            </li>
            <li>
              <strong>EPSS percentile</strong> -- CVEs with{" "}
              <Link
                href="/blog/epss-scores-explained"
                className="font-medium underline underline-offset-2"
              >
                high EPSS scores
              </Link>{" "}
              are statistically likely to be exploited. Prioritize them over
              equally-scored CVEs with low EPSS.
            </li>
            <li>
              <strong>Confidence tier</strong> -- Findings classified as{" "}
              <Link
                href="/blog/installed-state-vs-advisory-matching"
                className="font-medium underline underline-offset-2"
              >
                ConfirmedInstalled
              </Link>{" "}
              are more trustworthy than HeuristicUnverified findings. Start
              remediation with confirmed findings.
            </li>
            <li>
              <strong>CVSS base score</strong> -- Within a priority tier, use
              CVSS to further rank findings by severity.
            </li>
          </ol>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            5. Update Base Images Regularly
          </h2>
          <p className="text-sm muted">
            Base image maintainers publish updated images as security patches
            become available. Rebuilding your images on a regular cadence (at
            least weekly for production workloads) ensures that your deployed
            containers include the latest patches. Many organizations automate
            this with scheduled CI builds that pull the latest base image tag
            and rebuild.
          </p>
          <p className="text-sm muted">
            Pin your base image to a specific version or digest for
            reproducibility, but have an automated process to update that pin.
            Using a floating tag like <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">alpine:3.19</code>{" "}
            gives you automatic patch updates, while pinning to a digest like{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">alpine@sha256:abc...</code>{" "}
            gives you reproducibility. Choose based on your operational needs.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            6. Remove Unnecessary Packages
          </h2>
          <p className="text-sm muted">
            After installing your application and its dependencies, remove
            packages that are no longer needed. Package managers often install
            &quot;recommended&quot; or &quot;suggested&quot; packages that your application does not
            use. In Debian/Ubuntu images, use{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              --no-install-recommends
            </code>{" "}
            with apt-get. In Alpine, use{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              --no-cache
            </code>{" "}
            with apk add to avoid caching package index data.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            7. Track Changes Between Builds with SBOM Diff
          </h2>
          <p className="text-sm muted">
            Generating an SBOM for each image build and diffing it against the
            previous version helps you understand exactly what changed. New
            packages, updated versions, and removed components are all visible
            in the diff. This is valuable for change tracking, compliance
            reporting, and understanding why a scan result changed between
            releases.
          </p>
          <p className="text-sm muted">
            ScanRook supports{" "}
            <Link
              href="/blog/what-is-sbom-and-how-scanrook-uses-it"
              className="font-medium underline underline-offset-2"
            >
              SBOM import and diffing
            </Link>
            . Generate an SBOM during your CI build, store it as a build
            artifact, and compare it against the previous release to track
            supply chain changes over time.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            8. Automate and Gate Deployments
          </h2>
          <p className="text-sm muted">
            The most effective container scanning programs integrate scanning
            into the deployment pipeline as a gate. Define a policy (e.g., no
            Critical CVEs with EPSS above 90th percentile, no CISA KEV
            findings) and block deployments that violate it. This ensures that
            vulnerable images do not reach production while still allowing
            teams to deploy quickly when their images are clean.
          </p>
          <p className="text-sm muted">
            ScanRook&apos;s JSON output format makes it straightforward to parse
            scan results in CI scripts and enforce policy gates based on
            finding counts, severity levels, EPSS thresholds, or KEV status.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Get Started
          </h2>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
            <code>{`curl -fsSL https://scanrook.sh/install | bash
scanrook scan --file ./image.tar --format json --out report.json`}</code>
          </pre>
          <div className="flex flex-wrap gap-3">
            <a className="btn-primary" href="https://scanrook.sh">
              Install CLI
            </a>
            <Link className="btn-secondary" href="/docs/quickstart">
              Quickstart guide
            </Link>
            <Link className="btn-secondary" href="/docs/integrations/github-actions">
              GitHub Actions
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
