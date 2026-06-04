import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";

const title = `How to Scan a Docker Image for Vulnerabilities (4 Ways) | ${APP_NAME}`;
const description =
  "A step-by-step guide to scanning Docker images for vulnerabilities using Docker Scout, Trivy, Grype, and ScanRook. How to export an image, read the results, fix findings, and automate scanning in CI/CD.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "scan docker image for vulnerabilities",
    "how to scan docker image",
    "docker image vulnerability scanning",
    "docker scout",
    "trivy scan image",
    "grype docker image",
    "container image scanning",
    "docker security scan",
    "scan container for cves",
    "fix docker image vulnerabilities",
  ],
  alternates: {
    canonical: "/blog/how-to-scan-docker-image-for-vulnerabilities",
  },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/how-to-scan-docker-image-for-vulnerabilities",
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
  headline: "How to Scan a Docker Image for Vulnerabilities (4 Ways)",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage:
    "https://scanrook.io/blog/how-to-scan-docker-image-for-vulnerabilities",
  datePublished: "2026-06-03",
  dateModified: "2026-06-03",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I scan a Docker image for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pick a scanner and point it at the image. The fastest built-in option is Docker Scout (docker scout cves my-image:tag). Popular open-source CLIs are Trivy (trivy image my-image:tag) and Grype (grype my-image:tag). For a no-install option, export the image with docker save and upload the tar to ScanRook, which combines OSV, NVD, and vendor advisory data into one report.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to push my image to a registry to scan it?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Every major scanner can read a local image directly from the Docker daemon, and all of them can read an image tarball produced by 'docker save my-image:tag -o image.tar'. Scanning the tar is the most portable method because it works on machines without Docker installed and in air-gapped environments.",
      },
    },
    {
      "@type": "Question",
      name: "What does a Docker image scanner actually look at?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A scanner unpacks each layer and inventories two things: operating-system packages (from the apk, dpkg, or rpm databases) and application dependencies (npm, pip, Go modules, Java JARs, and more). It then matches each package and version against vulnerability databases to produce a list of CVEs, their severity, and the version that fixes them.",
      },
    },
    {
      "@type": "Question",
      name: "Why do two scanners report different numbers of vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Scanners draw from different vulnerability databases (NVD, OSV, GHSA, distro security trackers) and apply different matching logic. Some match advisory metadata loosely and over-report; others read the actual installed package state and account for backported fixes. Differences in finding counts usually come down to data sources and false-positive handling, not which tool is 'better'.",
      },
    },
    {
      "@type": "Question",
      name: "How often should I scan my Docker images?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Scan on every build in CI so regressions never reach production, and re-scan deployed images on a schedule (daily or weekly) because new CVEs are published against packages that were clean when you built. A package with zero known vulnerabilities today can have a Critical CVE tomorrow without anything in your image changing.",
      },
    },
  ],
};

export default function HowToScanDockerImagePage() {
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
          <div className="text-xs uppercase tracking-wide muted">Best practices</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            How to Scan a Docker Image for Vulnerabilities (4 Ways)
          </h1>
          <p className="text-sm muted">Published June 3, 2026 &middot; 12 min read</p>
          <p className="text-sm muted">
            Every Docker image you build inherits hundreds &mdash; sometimes thousands &mdash; of
            packages from its base image and dependencies. Many of them ship with known
            vulnerabilities. This guide shows you four practical ways to scan a Docker image for
            vulnerabilities, how to read what the scanner reports, and how to actually fix the
            findings instead of drowning in a wall of CVEs.
          </p>
        </header>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            What &ldquo;scanning a Docker image&rdquo; actually means
          </h2>
          <p className="text-sm muted">
            A Docker image is a stack of filesystem layers. A vulnerability scanner unpacks those
            layers and builds an inventory of everything installed, then checks each item against
            one or more vulnerability databases. There are two distinct categories it inventories:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>OS packages</strong> &mdash; read from the package manager&apos;s own database:{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/lib/apk/db/installed</code>{" "}
              (Alpine),{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/var/lib/dpkg/status</code>{" "}
              (Debian/Ubuntu), or the RPM database (RHEL/Fedora).
            </li>
            <li>
              <strong>Application dependencies</strong> &mdash; language ecosystems like npm
              (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">package-lock.json</code>),
              pip, Go modules, Ruby gems, and Java JARs found inside the image.
            </li>
          </ul>
          <p className="text-sm muted">
            The scanner then matches each package and version against vulnerability data and emits a
            list of findings: a CVE identifier, the affected package, a severity, and &mdash; ideally
            &mdash; the version that fixes it. If you want the deeper background on where that CVE data
            comes from, see{" "}
            <Link href="/blog/cve-database-comparison" className="underline">
              our comparison of NVD, OSV, GHSA, and Snyk Intel
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Method 1 &mdash; Docker Scout (built in)</h2>
          <p className="text-sm muted">
            If you already have Docker Desktop or a recent Docker CLI, you have a scanner installed.
            Docker Scout reads your local image and reports CVEs with no extra tooling:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Quick overview of an image
docker scout quickview my-image:tag

# Full CVE list, filtered to High and Critical
docker scout cves my-image:tag --only-severity critical,high`}</pre>
          <p className="text-sm muted">
            Scout is the lowest-friction option for a quick local check. Its weakness is depth: it is
            strongest on OS packages and the most common ecosystems, and it is tied to the Docker
            tooling. For a thorough audit you will usually reach for one of the dedicated scanners
            below.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Method 2 &mdash; Trivy</h2>
          <p className="text-sm muted">
            Trivy is the most widely used open-source image scanner. Install it, then point it at a
            local image, a remote image, or a saved tarball:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Scan a local or remote image by name
trivy image my-image:tag

# Scan an exported tarball (no daemon needed)
trivy image --input my-image.tar

# Fail a CI build on High/Critical findings
trivy image --exit-code 1 --severity HIGH,CRITICAL my-image:tag`}</pre>
          <p className="text-sm muted">
            Trivy is fast and covers OS packages plus most language ecosystems. The{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--exit-code 1</code>{" "}
            flag is the one to remember &mdash; it turns the scan into a build gate.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Method 3 &mdash; Grype</h2>
          <p className="text-sm muted">
            Grype, from Anchore, is the other popular open-source CLI. It pairs naturally with Syft
            (an SBOM generator from the same project) and reads the same image sources:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Scan an image by name
grype my-image:tag

# Scan a saved tarball explicitly
grype docker-archive:my-image.tar

# Only fail on a severity threshold
grype my-image:tag --fail-on high`}</pre>
          <p className="text-sm muted">
            Grype and Trivy will often report slightly different counts on the same image. That is
            expected &mdash; they use different databases and matching rules. We dig into why in{" "}
            <Link href="/blog/vulnerability-scanner-benchmark-2026" className="underline">
              the 2026 scanner benchmark
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Method 4 &mdash; ScanRook (no install required)</h2>
          <p className="text-sm muted">
            If you do not want to install anything &mdash; or you want a single report that merges OSV,
            NVD, and vendor advisory data with EPSS exploit-probability scores &mdash; you can scan a
            Docker image with ScanRook in three ways:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Web upload:</strong> export the image to a tar (see below) and drag it onto the{" "}
              <Link href="/dashboard" className="underline">ScanRook dashboard</Link>. No CLI, no agent.
            </li>
            <li>
              <strong>Registry scan:</strong> connect a registry (Docker Hub, GHCR, ECR, or any
              OCI-compliant registry) and scan an image by name and tag without pulling it yourself.
            </li>
            <li>
              <strong>CLI:</strong> install the scanner and run it locally:
              <pre className="mt-2 rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`curl -fsSL https://scanrook.sh/install | bash
scanrook scan my-image.tar`}</pre>
            </li>
          </ul>
          <p className="text-sm muted">
            ScanRook also unpacks nested archives and shaded JARs that simpler file-path scanners miss,
            and it reads the actual installed package state rather than guessing from advisory metadata.
            That difference is the subject of our deep dive on{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs. advisory matching
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How to export an image to a tarball</h2>
          <p className="text-sm muted">
            Three of the four methods above can read a tarball, which is the most portable way to move
            an image to a scanner. Export any local image with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker save</code>:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Build, then export to a tarball
docker build -t my-image:tag .
docker save my-image:tag -o my-image.tar`}</pre>
          <p className="text-sm muted">
            The resulting{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">my-image.tar</code>{" "}
            contains every layer and the image manifest. This is exactly what you upload to ScanRook or
            feed to Trivy and Grype on a machine that does not have the original image loaded.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How to read the results</h2>
          <p className="text-sm muted">
            Every scanner reports the same core fields. Learn to read them and the output stops being
            a wall of red:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Field</th>
                  <th className="text-left py-2 font-semibold">What it tells you</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>CVE ID</strong></td>
                  <td className="py-2">The unique identifier for the vulnerability. Look it up to understand impact.</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Package &amp; version</strong></td>
                  <td className="py-2">The exact installed component that is affected.</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Severity / CVSS</strong></td>
                  <td className="py-2">Theoretical impact. Useful, but not the same as real-world risk.</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Fixed version</strong></td>
                  <td className="py-2">The version that resolves it. &ldquo;won&apos;t fix&rdquo; or blank means no patch yet.</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top"><strong>EPSS / KEV</strong></td>
                  <td className="py-2">Exploit probability and known-exploited status &mdash; the best signal for what to fix first.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            Do not sort by severity alone. Roughly half of all CVEs are rated High or Critical, so
            severity is a weak filter. Sort by exploit probability instead &mdash; see{" "}
            <Link href="/blog/epss-vulnerability-prioritization" className="underline">
              how to prioritize vulnerabilities with EPSS
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How to fix the vulnerabilities you find</h2>
          <p className="text-sm muted">
            Scanning is only half the job. Most findings fall into one of three buckets, each with a
            standard fix:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>OS package CVEs:</strong> rebuild on an updated base image (e.g. bump{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">FROM debian:12.4</code>{" "}
              to the latest patch tag) or add an{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">apt-get upgrade</code>{" "}
              step. A stale base image is the single biggest source of findings.
            </li>
            <li>
              <strong>Application dependency CVEs:</strong> bump the dependency in your lockfile and
              rebuild. The scanner&apos;s &ldquo;fixed version&rdquo; column tells you the target.
            </li>
            <li>
              <strong>Smaller attack surface:</strong> switch to a minimal base image. A distroless or
              slim image simply contains fewer packages, so it has fewer CVEs to begin with &mdash; see{" "}
              <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
                Alpine vs Debian vs Distroless
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Automate it in CI/CD</h2>
          <p className="text-sm muted">
            A scan you run by hand once a month is not a control. Wire scanning into your pipeline so
            every image is checked before it ships, and fail the build on a threshold you choose. Here
            is the idea in a GitHub Actions step using Trivy:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`- name: Scan image
  run: |
    docker build -t my-image:\${{ github.sha }} .
    trivy image --exit-code 1 --severity HIGH,CRITICAL my-image:\${{ github.sha }}`}</pre>
          <p className="text-sm muted">
            ScanRook can do the same with a policy that gates deployments on severity, EPSS, or CISA KEV
            membership rather than a single severity threshold. For the broader playbook, read{" "}
            <Link href="/blog/container-scanning-best-practices" className="underline">
              container scanning best practices
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Common pitfalls</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Scanning only the base, not the final image.</strong> Your application layers add
              dependencies. Always scan the final built artifact.
            </li>
            <li>
              <strong>Ignoring nested JARs.</strong> Java apps often bundle dependencies inside shaded
              or uber-JARs. A scanner that does not unpack them will miss real CVEs &mdash; this is exactly
              how Log4Shell hid in so many images.
            </li>
            <li>
              <strong>Treating every Critical as urgent.</strong> A Critical CVE in a package that is
              never reachable at runtime can wait; a High CVE with a public exploit cannot. Prioritize by
              exploitability.
            </li>
            <li>
              <strong>Scanning once.</strong> New CVEs are published daily. Re-scan deployed images on a
              schedule, not just at build time.
            </li>
          </ul>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Can I scan a Docker image without installing anything?</h3>
              <p className="text-sm muted mt-1">
                Yes. Export the image with{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker save my-image:tag -o image.tar</code>{" "}
                and upload the tar to the ScanRook dashboard, or connect a registry and scan by name. No
                CLI or agent is required.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Trivy, Grype, and Scout give different counts &mdash; which is right?</h3>
              <p className="text-sm muted mt-1">
                None is simply &ldquo;right.&rdquo; They use different vulnerability databases and matching
                logic. Higher counts often mean more false positives from loose advisory matching, not better
                coverage. What matters is whether a finding reflects a package actually installed and reachable.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should the scan fail my build?</h3>
              <p className="text-sm muted mt-1">
                Yes, on a threshold you choose. Failing on High and Critical is a common starting point;
                maturing teams gate on exploit probability (EPSS) and CISA KEV membership instead, which
                blocks far fewer builds while catching the findings that matter.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How is scanning an image different from generating an SBOM?</h3>
              <p className="text-sm muted mt-1">
                An SBOM is the inventory of what is in the image; a vulnerability scan is the inventory
                matched against vulnerability data. Most scanners generate an SBOM internally as the first
                step. See{" "}
                <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
                  what an SBOM is
                </Link>{" "}
                for more.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan a Docker image in seconds with ScanRook</h3>
          <p className="text-sm muted leading-relaxed">
            Export your image with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker save</code>{" "}
            and upload the tar, or connect a registry to scan by name. ScanRook merges OSV, NVD, and vendor
            advisory data with EPSS exploit scores into one prioritized report &mdash; no agent to install.
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
            <Link href="/blog/container-scanning-best-practices" className="underline">
              Container Scanning Best Practices
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              Installed-State vs Advisory Matching
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
