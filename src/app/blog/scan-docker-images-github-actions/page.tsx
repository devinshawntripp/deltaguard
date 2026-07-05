import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-09";

const title = `How to Scan Docker Images in GitHub Actions | ${APP_NAME}`;
const description =
  "A complete GitHub Actions workflow for scanning Docker images: install the scanner, scan on every pull request, upload reports, and fail builds on critical CVEs.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "github actions docker scan",
    "scan docker images github actions",
    "github actions vulnerability scanning",
    "github actions container security",
    "docker image scan ci",
    "github actions security workflow",
    "fail build on cve",
    "container scanning pipeline",
    "github actions scanrook",
    "ci cd vulnerability scanning",
  ],
  alternates: { canonical: "/blog/scan-docker-images-github-actions" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/scan-docker-images-github-actions",
    images: ["/blog/scan-docker-images-github-actions.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/scan-docker-images-github-actions.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "How to Scan Docker Images in GitHub Actions",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/scan-docker-images-github-actions",
  image: "https://scanrook.io/blog/scan-docker-images-github-actions.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I scan a Docker image in GitHub Actions?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Build the image in your workflow, export it with docker save, install a scanner CLI, and run it against the tar file. With ScanRook, that is three steps: curl the installer, docker save the image, then scanrook scan with JSON output. A final step reads the report and fails the job if severity thresholds are exceeded.",
      },
    },
    {
      "@type": "Question",
      name: "Should the scan run on pull requests or only on main?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both, with different profiles. On pull requests, a fast scan catches newly introduced vulnerabilities before merge. On main (and on a nightly schedule), a deeper scan catches advisories published after the code was merged. Vulnerabilities appear over time in unchanged images, so the schedule matters as much as the PR trigger.",
      },
    },
    {
      "@type": "Question",
      name: "How do I fail a GitHub Actions build when critical CVEs are found?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Have the scanner write a JSON report, then read the severity counts with jq and exit non-zero when they exceed your threshold. Exiting non-zero fails the step, which fails the job and blocks the merge if the workflow is a required status check.",
      },
    },
    {
      "@type": "Question",
      name: "Will scanning slow down my CI pipeline?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Modestly, and it is tunable. The dominant costs are the scanner's database or cache warm-up and the scan itself. Caching the scanner's cache directory between runs with actions/cache and using a lighter scan mode on pull requests keeps the added time to a small fraction of a typical image build.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need an NVD API key for CI scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It is optional but recommended if your scanner queries NVD directly. Without a key, NVD applies strict rate limits that slow enrichment. Store the key as a repository secret and pass it as an environment variable — never hardcode it in the workflow file.",
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
          <div className="text-xs uppercase tracking-wide muted">Integrations</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            How to Scan Docker Images in GitHub Actions
          </h1>
          <p className="text-sm muted">Published July 9, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            A GitHub Actions docker scan is the cheapest security control you can add to a container
            pipeline: every image is checked before it ships, and merges are blocked when new
            critical CVEs appear. This guide builds the complete workflow &mdash; install, scan,
            report, gate &mdash; and explains every step.
          </p>
        </header>

        <img
          src="/blog/scan-docker-images-github-actions.jpg"
          alt="Scanning Docker images in GitHub Actions"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why scan in GitHub Actions at all?</h2>
          <p className="text-sm muted">
            Scanning locally is optional; scanning in CI is structural. Once the scan runs in the
            same workflow that builds the image, three things become true. Every image that reaches
            a registry has been scanned &mdash; no exceptions for hotfixes or Friday deploys. The
            scan result is attached to the exact commit and image digest that produced it. And the
            severity gate turns security policy from a document into a failing check that blocks
            the merge button.
          </p>
          <p className="text-sm muted">
            The pattern below scans the image as a build artifact &mdash; export the built image to
            a tar file and scan that, rather than scanning a running container or a registry copy.
            It is the same approach we recommend in{" "}
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              our general image-scanning guide
            </Link>
            , adapted to the runner environment.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The complete workflow</h2>
          <p className="text-sm muted">
            Save this as{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.github/workflows/scanrook.yml</code>{" "}
            in your repository. It builds your image, scans it with ScanRook, uploads the JSON
            report as an artifact, and fails the job on critical or high findings:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`name: ScanRook Vulnerability Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 5 * * *"   # nightly: catch advisories published after merge

permissions:
  contents: read

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install ScanRook
        run: curl -fsSL https://scanrook.sh/install | bash

      - name: Build container image
        run: |
          docker build -t myapp:ci .
          docker save myapp:ci -o myapp.tar

      - name: Cache vulnerability data
        uses: actions/cache@v4
        with:
          path: ~/.scanrook/cache
          key: scanrook-cache-\${{ runner.os }}-\${{ github.run_number }}
          restore-keys: |
            scanrook-cache-\${{ runner.os }}-

      - name: Scan container image
        run: |
          scanrook scan \\
            --file ./myapp.tar \\
            --mode deep \\
            --format json \\
            --out report.json
        env:
          NVD_API_KEY: \${{ secrets.NVD_API_KEY }}

      - name: Upload scan report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: scanrook-report
          path: report.json

      - name: Fail on critical or high CVEs
        run: |
          CRITICAL=\$(jq '.summary.critical // 0' report.json)
          HIGH=\$(jq '.summary.high // 0' report.json)
          echo "Critical: \$CRITICAL, High: \$HIGH"
          if [ "\$CRITICAL" -gt 0 ] || [ "\$HIGH" -gt 0 ]; then
            echo "::error::Found \$CRITICAL critical and \$HIGH high severity vulnerabilities"
            jq '.findings[] | select(.severity == "CRITICAL" or .severity == "HIGH") | {cve, package: .package.name, version: .package.version, severity}' report.json
            exit 1
          fi`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What each step does</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Triggers.</strong> Pull requests catch vulnerabilities you are about to
              introduce; pushes to main record the state of what shipped; the nightly cron catches
              the third case people forget &mdash; advisories published <em>after</em> your image
              was built. An image that scanned clean on Monday can legitimately fail on Thursday
              with zero code changes.
            </li>
            <li>
              <strong>Install ScanRook.</strong> The shell installer detects the platform and drops
              the release binary into the runner&apos;s PATH. Runners are ephemeral, so this runs
              every time &mdash; it is a small download and keeps you on the current release.
            </li>
            <li>
              <strong>Build and save.</strong> ScanRook scans saved image archives, so{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker save</code>{" "}
              exports the freshly built image to a tar. Scanning the artifact you just built (rather
              than re-pulling from a registry) guarantees you scanned exactly what the workflow
              produced.
            </li>
            <li>
              <strong>Cache vulnerability data.</strong>{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">actions/cache</code>{" "}
              persists ScanRook&apos;s cache directory between runs, so repeated scans skip
              re-fetching advisory data they already have. The{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">restore-keys</code>{" "}
              fallback means even a partial cache hit saves time.
            </li>
            <li>
              <strong>Scan.</strong>{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--mode deep</code>{" "}
              is the thorough profile; switch pull requests to{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--mode light</code>{" "}
              if you want faster PR feedback and keep deep mode for main and the nightly run. The
              optional <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">NVD_API_KEY</code>{" "}
              secret raises NVD rate limits during enrichment.
            </li>
            <li>
              <strong>Upload the report.</strong>{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">if: always()</code>{" "}
              ensures the JSON report is preserved as a build artifact even when the gate step fails
              &mdash; which is precisely when you most want to read it.
            </li>
            <li>
              <strong>Gate.</strong> The last step reads severity totals with jq and exits non-zero
              past your threshold, failing the check. More on tuning this below.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Failing the build on severity &mdash; without hating your life</h2>
          <p className="text-sm muted">
            A gate that is too strict gets disabled within a month; a gate that is too loose is
            theater. Three adjustments make the difference:
          </p>
          <p className="text-sm muted">
            <strong>Start with critical-only.</strong> Change the condition to{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">if [ &quot;$CRITICAL&quot; -gt 0 ]</code>{" "}
            and let high-severity findings warn without blocking. Once the backlog is at zero,
            tighten to include highs. A base image inherited from upstream can carry hundreds of
            findings you did not introduce &mdash; see{" "}
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              how to reduce CVEs in Docker images
            </Link>{" "}
            for bringing that number down before you tighten the gate.
          </p>
          <p className="text-sm muted">
            <strong>Gate on new findings, not all findings.</strong> Store the report from the last
            main build as an artifact and compare: fail the PR only if it introduces CVEs that main
            does not already have. This keeps the gate actionable &mdash; the developer who sees the
            failure is always the developer who caused it.
          </p>
          <p className="text-sm muted">
            <strong>Make the check required.</strong> A failing job only blocks a merge if the
            workflow is listed as a required status check in your branch protection rules
            (Settings &rarr; Branches &rarr; require status checks). Without that, the red X is
            advisory.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scanning images you did not build</h2>
          <p className="text-sm muted">
            The workflow above scans an image built in the same job, but the pattern extends to
            images that already exist &mdash; a base image you are evaluating, a vendor image, or
            the currently deployed tag. Pull it, save it, scan the tar:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`      - name: Scan the deployed production image
        run: |
          docker pull registry.example.com/myapp:prod
          docker save registry.example.com/myapp:prod -o deployed.tar
          scanrook scan --file deployed.tar --format json --out deployed.json`}</pre>
          <p className="text-sm muted">
            Running this in the nightly job alongside the fresh build gives you two reports to
            compare: what you are about to ship versus what is currently running. A widening gap
            between the two is your signal that a redeploy is overdue even though nothing in the
            repository changed.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Operational tips</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              Store <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">NVD_API_KEY</code>{" "}
              as a repository or organization secret, never in the workflow file.
            </li>
            <li>
              Pin action versions (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">actions/checkout@v4</code>)
              and consider pinning by commit SHA for supply-chain-sensitive repositories.
            </li>
            <li>
              For monorepos building several images, run the scan as a matrix job &mdash; one scan
              per image, each with its own report artifact and gate.
            </li>
            <li>
              Keep reports from main-branch runs; a history of JSON reports is a free audit trail of
              what shipped with what findings, and several compliance frameworks ask for exactly
              that.
            </li>
          </ul>
          <p className="text-sm muted">
            The maintained reference version of this workflow, including an SBOM-diff variant that
            gates on newly added packages, lives in{" "}
            <Link href="/docs" className="underline">the ScanRook docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">How do I scan a Docker image in GitHub Actions?</h3>
              <p className="text-sm muted mt-1">
                Build the image, export it with{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker save</code>,
                install the scanner CLI, and scan the tar file. A final jq step reads the JSON
                report and fails the job past your severity threshold.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should scans run on PRs or on a schedule?</h3>
              <p className="text-sm muted mt-1">
                Both. PR scans catch what you are introducing; scheduled scans catch advisories
                published after merge. Images go stale without changing.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I fail the build on critical CVEs?</h3>
              <p className="text-sm muted mt-1">
                Read severity counts from the JSON report with jq and{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">exit 1</code>{" "}
                when they exceed the threshold. Make the workflow a required status check so the
                failure actually blocks merges.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Will scanning slow down CI?</h3>
              <p className="text-sm muted mt-1">
                A little &mdash; and caching the scanner&apos;s data directory plus a lighter scan
                mode on PRs keeps it to a small fraction of the image build time.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Gate your pipeline with ScanRook</h3>
          <p className="text-sm muted leading-relaxed">
            Drop the workflow above into your repository and every image you build is checked
            against OSV, NVD, and vendor advisory data before it ships &mdash; with JSON reports
            you can gate on, archive, and diff between builds.
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
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              How to Scan a Docker Image for Vulnerabilities
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-scanning-best-practices" className="underline">
              Container Scanning Best Practices
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
