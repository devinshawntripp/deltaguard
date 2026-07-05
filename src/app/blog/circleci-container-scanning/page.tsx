import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-02";

const title = `CircleCI Vulnerability Scanning for Docker Images | ${APP_NAME}`;
const description =
  "A complete CircleCI pipeline for scanning Docker images: build with setup_remote_docker, scan with ScanRook, store report artifacts, and fail on critical CVEs.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "circleci vulnerability scan",
    "circleci container scanning",
    "circleci docker image scan",
    "circleci security workflow",
    "circleci setup_remote_docker scan",
    "fail circleci build on cve",
    "circleci pipeline container security",
    "circleci ci cd vulnerability scanning",
    "circleci scanrook",
    "docker image scanning circleci config",
  ],
  alternates: { canonical: "/blog/circleci-container-scanning" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/circleci-container-scanning",
    images: ["/blog/circleci-container-scanning.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/circleci-container-scanning.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "CircleCI Vulnerability Scanning for Docker Images",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/circleci-container-scanning",
  image: "https://scanrook.io/blog/circleci-container-scanning.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I scan a Docker image in CircleCI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use the setup_remote_docker step to get a Docker daemon, build the image, export it with docker save, install the scanner CLI, and scan the tar file. A final run step reads the JSON report with jq and exits non-zero past your severity threshold, which fails the job.",
      },
    },
    {
      "@type": "Question",
      name: "What executor should I use for container scanning on CircleCI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The docker executor with the setup_remote_docker step is the standard choice: it gives the job a remote Docker Engine to build and save images without requiring a privileged machine executor. The machine executor is an alternative if you need direct access to the host's Docker daemon for other reasons.",
      },
    },
    {
      "@type": "Question",
      name: "How do I fail a CircleCI job on critical CVEs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Read severity counts from the JSON report with jq inside a run step and exit 1 when they exceed your threshold. A non-zero exit fails the step and the job; making the workflow a required check in your VCS branch protection is what actually blocks the merge.",
      },
    },
    {
      "@type": "Question",
      name: "How do I store an NVD API key securely in CircleCI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Add it as an environment variable on a CircleCI context or directly on the project, then reference it in the job's environment. Contexts let you share the same secret across multiple projects and restrict which pipelines can use it via security groups.",
      },
    },
    {
      "@type": "Question",
      name: "Can CircleCI cache the scanner's vulnerability data between builds?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, using the built-in save_cache and restore_cache steps keyed on a value that changes only when you want to bust the cache, such as a weekly timestamp or a fixed key. This avoids re-fetching advisory data on every run while still expiring periodically.",
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
            CircleCI Vulnerability Scanning for Docker Images
          </h1>
          <p className="text-sm muted">Published August 2, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            A CircleCI vulnerability scan job is a natural fit for teams already using{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">setup_remote_docker</code>{" "}
            to build images. This guide adds a complete scanning and gating job to a CircleCI
            config, explains every step, and covers the executor choices that trip people up.
          </p>
        </header>

        <img
          src="/blog/circleci-container-scanning.jpg"
          alt="Scanning Docker images in CircleCI"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why scan in the same job that builds the image</h2>
          <p className="text-sm muted">
            Scanning as part of the build job, rather than as a separate downstream pipeline, means
            the image never leaves the job&apos;s workspace unscanned. There is no window where a
            built-but-unscanned image could be pushed to a registry by a different job racing ahead
            of the scan. The tradeoff is job duration, which the caching and mode choices below keep
            reasonable.
          </p>
          <p className="text-sm muted">
            As with{" "}
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              our general image-scanning guide
            </Link>{" "}
            and{" "}
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              the GitHub Actions version of this workflow
            </Link>
            , the pattern is to export the built image with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker save</code>{" "}
            and scan the tar file directly, which works identically regardless of which CI system is
            running the job.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The complete config</h2>
          <p className="text-sm muted">
            Save this as <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.circleci/config.yml</code>.
            It uses the docker executor with a remote Docker Engine, builds and scans the image, and
            fails the job on critical or high findings:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`version: 2.1

jobs:
  scan:
    docker:
      - image: cimg/base:2026.06
    resource_class: medium
    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true

      - run:
          name: Build image
          command: |
            docker build -t myapp:ci .
            docker save myapp:ci -o myapp.tar

      - restore_cache:
          keys:
            - scanrook-cache-v1

      - run:
          name: Install ScanRook
          command: curl -fsSL https://scanrook.sh/install | sh

      - run:
          name: Scan image
          environment:
            NVD_API_KEY: $NVD_API_KEY
          command: |
            scanrook scan \\
              --file myapp.tar \\
              --mode deep \\
              --format json \\
              --out report.json

      - save_cache:
          key: scanrook-cache-v1
          paths:
            - ~/.scanrook/cache

      - store_artifacts:
          path: report.json

      - run:
          name: Fail on critical or high CVEs
          command: |
            CRITICAL=$(jq '.summary.critical // 0' report.json)
            HIGH=$(jq '.summary.high // 0' report.json)
            echo "Critical: $CRITICAL, High: $HIGH"
            if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
              jq '.findings[] | select(.severity == "CRITICAL" or .severity == "HIGH") | {cve, package: .package.name, version: .package.version, severity}' report.json
              echo "Failing job: critical or high severity vulnerabilities found"
              exit 1
            fi

workflows:
  build-and-scan:
    jobs:
      - scan:
          context:
            - scanrook-secrets`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What each step does</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>setup_remote_docker.</strong> This step provisions a remote Docker Engine the
              job can use without a privileged local daemon.{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker_layer_caching: true</code>{" "}
              speeds up repeated builds of the same Dockerfile by reusing unchanged layers between
              runs, at extra cost on CircleCI&apos;s paid plans.
            </li>
            <li>
              <strong>Build and save.</strong> Exporting with{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker save</code>{" "}
              scans exactly what this job built, independent of whether the image has been pushed
              to a registry yet.
            </li>
            <li>
              <strong>restore_cache / save_cache.</strong> CircleCI has no native equivalent to a
              persistent volume between jobs, so the scanner&apos;s cache directory is restored and
              saved explicitly under a fixed key. Bump the key (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">scanrook-cache-v2</code>)
              when you want a clean cache.
            </li>
            <li>
              <strong>context.</strong> The workflow references a{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">scanrook-secrets</code>{" "}
              context holding <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">NVD_API_KEY</code>{" "}
              as an environment variable, rather than a project-level variable, so the same secret
              can be shared across multiple repositories with centralized access control.
            </li>
            <li>
              <strong>store_artifacts.</strong> Publishes <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">report.json</code>{" "}
              to the job&apos;s Artifacts tab regardless of what the later gate step does, since it
              runs before the gate.
            </li>
            <li>
              <strong>Gate step.</strong> The final run step reads severity totals with jq and exits
              non-zero past the threshold, failing the job and, if configured as a required check,
              the pull request.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Failing on severity without burning out the team</h2>
          <p className="text-sm muted">
            The tuning advice here is the same regardless of CI system, because the failure mode is
            the same: a gate too strict gets a skip added to it, one too loose gets ignored.
          </p>
          <p className="text-sm muted">
            <strong>Start critical-only.</strong> Drop the <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">$HIGH</code>{" "}
            condition and let high-severity findings show up in the job output without failing it.
            Inherited base-image findings can be substantial &mdash; work through{" "}
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              how to reduce CVEs in Docker images
            </Link>{" "}
            before including highs in the gate.
          </p>
          <p className="text-sm muted">
            <strong>Require the check in your VCS, not just CircleCI.</strong> CircleCI reports job
            status back to GitHub or Bitbucket; the merge is only actually blocked if that status
            check is marked required in your repository&apos;s branch protection settings.
          </p>
          <p className="text-sm muted">
            <strong>Compare against the target branch.</strong> Store the report artifact from the
            last successful build of your default branch and diff pull request scans against it,
            failing only on newly introduced findings so a developer is never blocked by a CVE
            someone else&apos;s change introduced.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scanning a registry image without a build step</h2>
          <p className="text-sm muted">
            To evaluate a base image or check the currently deployed tag without building anything,
            pull and save it directly &mdash; still inside <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">setup_remote_docker</code>:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`  scan-deployed:
    docker:
      - image: cimg/base:2026.06
    steps:
      - setup_remote_docker
      - run:
          name: Pull and save deployed image
          command: |
            docker pull registry.example.com/myapp:prod
            docker save registry.example.com/myapp:prod -o deployed.tar
      - run:
          name: Scan
          command: |
            curl -fsSL https://scanrook.sh/install | sh
            scanrook scan --file deployed.tar --format json --out deployed.json
      - store_artifacts:
          path: deployed.json`}</pre>
          <p className="text-sm muted">
            Trigger this job on a scheduled pipeline (CircleCI&apos;s Project Settings &rarr;
            Triggers) rather than on every commit, and compare its output against the latest
            build-time scan to catch drift between what ships and what runs.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Operational notes</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              Use a context rather than a project environment variable for{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">NVD_API_KEY</code>{" "}
              if more than one repository needs it, and restrict the context to specific security
              groups.
            </li>
            <li>
              Pin <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">cimg/base</code>{" "}
              to a dated tag rather than <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">current</code>{" "}
              for reproducible builds.
            </li>
            <li>
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker_layer_caching</code>{" "}
              is a paid feature on some CircleCI plans; confirm it is enabled for your organization
              before relying on the speedup.
            </li>
            <li>
              For orgs building many images, define the scan job once in an orb or a reusable
              command and have each project&apos;s config reference it, instead of duplicating the
              steps above per repository.
            </li>
          </ul>
          <p className="text-sm muted">
            A maintained reference config, including an orb packaging of these steps, is documented
            in{" "}
            <Link href="/docs" className="underline">the ScanRook docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">How do I scan a Docker image in CircleCI?</h3>
              <p className="text-sm muted mt-1">
                Use <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">setup_remote_docker</code>,
                build and save the image, install the scanner CLI, and scan the tar. A jq step in a
                later run reads the report and fails the job past your threshold.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Which executor should I use?</h3>
              <p className="text-sm muted mt-1">
                The docker executor with{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">setup_remote_docker</code>{" "}
                covers nearly every case; the machine executor is only needed for direct host Docker
                access.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I fail the job on critical CVEs?</h3>
              <p className="text-sm muted mt-1">
                Read severity counts with jq and exit 1 past your threshold, then require the check
                in your VCS branch protection so it actually blocks merges.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I store the NVD API key securely?</h3>
              <p className="text-sm muted mt-1">
                As an environment variable on a CircleCI context, referenced by the workflow &mdash;
                never hardcoded in the config file.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Add ScanRook to your CircleCI pipeline</h3>
          <p className="text-sm muted leading-relaxed">
            Drop the job above into your config and every image you build is checked against OSV,
            NVD, and vendor advisory data before it ships &mdash; with JSON reports you can archive,
            gate on, and diff between builds.
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
