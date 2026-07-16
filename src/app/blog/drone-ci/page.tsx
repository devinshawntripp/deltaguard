import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-23";

const title = `Drone CI: Scan Docker Images in Your Pipeline | ${APP_NAME}`;
const description =
  "Scan Docker images in Drone CI: a complete container-native .drone.yml that builds the image, scans it with ScanRook, and fails the build on critical CVEs.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "drone ci",
    "drone ci docker scan",
    "drone ci vulnerability scanning",
    "drone ci pipeline",
    "drone.yml container scan",
    "scan docker image drone",
    "drone ci security",
    "container scanning ci cd",
    "drone dind pipeline",
    "fail build on cve drone",
  ],
  alternates: { canonical: "/blog/drone-ci" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/drone-ci",
    images: ["/blog/drone-ci.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/drone-ci.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Drone CI: Scan Docker Images in Your Pipeline",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/drone-ci",
  image: "https://scanrook.io/blog/drone-ci.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I scan a Docker image in Drone CI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Build the image in a step that talks to a Docker-in-Docker service, export it with docker save, then run a scanner in a second step against the tar file. With ScanRook that is: install the CLI, run scanrook scan with JSON output, and read the severity counts with jq to fail the pipeline when a threshold is exceeded.",
      },
    },
    {
      "@type": "Question",
      name: "What makes Drone CI different from other CI systems?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Drone is container-native: every pipeline step runs inside its own Docker container that you specify with an image field. There are no pre-installed toolchains on a shared runner, so each step declares exactly what it needs. That model makes it natural to run a scanner in a clean, reproducible container step.",
      },
    },
    {
      "@type": "Question",
      name: "How does Drone build Docker images inside a pipeline?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The common pattern is a Docker-in-Docker service. You declare a docker:dind service, point the build step at it with DOCKER_HOST, and run docker build normally. This avoids mounting the host Docker socket into the pipeline, which would grant the build root-equivalent control of the runner.",
      },
    },
    {
      "@type": "Question",
      name: "How do I fail a Drone pipeline when critical CVEs are found?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Have the scanner write a JSON report, read the severity counts with jq, and exit non-zero when they exceed your threshold. A non-zero exit from a step fails the step, which fails the pipeline and blocks the promotion or merge that depends on it.",
      },
    },
    {
      "@type": "Question",
      name: "Should the scan run on pull requests or only on main?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both. Pull-request runs catch vulnerabilities you are about to introduce; runs on main record what shipped. Because new advisories are published against unchanged images over time, a scheduled or cron-triggered run on main also catches CVEs that appear after the code was merged.",
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
            Drone CI: Scan Docker Images in Your Pipeline
          </h1>
          <p className="text-sm muted">Published November 23, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            Drone CI is container-native by design: every step runs in its own container, which
            makes it a natural home for a vulnerability scan. This guide builds a complete{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.drone.yml</code>{" "}
            that builds your image, scans it with ScanRook, and fails the pipeline on critical CVEs
            &mdash; with the Docker-in-Docker setup that keeps the build off the host socket.
          </p>
        </header>

        <img
          src="/blog/drone-ci.jpg"
          alt="Scanning Docker images in Drone CI"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why scan in Drone CI</h2>
          <p className="text-sm muted">
            The argument for scanning in CI is the same in every system: once the scan runs in the
            same pipeline that builds the image, every image is checked before it ships, the result
            is tied to the exact commit that produced it, and your severity policy becomes a failing
            check rather than a wiki page. Drone just makes it structurally clean, because a scan is
            simply another container step. If you have set this up in{" "}
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              GitHub Actions
            </Link>{" "}
            or{" "}
            <Link href="/blog/scan-docker-images-gitlab-ci" className="underline">
              GitLab CI
            </Link>, the shape will be familiar &mdash; only the pipeline syntax changes.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What makes Drone different</h2>
          <p className="text-sm muted">
            Drone is an open-source, container-native CI/CD engine now stewarded by Harness. A
            pipeline is a YAML document with a{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kind: pipeline</code>{" "}
            header and a list of steps, and the defining feature is that <em>every step names the
            container image it runs in</em>. There is no shared runner with a pre-baked toolchain;
            each step is a fresh container with exactly the tools you declare. Steps in a pipeline
            share a workspace volume, so a file one step writes &mdash; like the image tar &mdash; is
            visible to the next.
          </p>
          <p className="text-sm muted">
            That model is why building a Docker image inside Drone needs a little care: the step
            container is not the host, so it cannot see a host Docker daemon by default. The clean
            answer is a Docker-in-Docker <strong>service</strong> &mdash; a sidecar daemon the build
            step talks to over TCP &mdash; which avoids mounting the host&apos;s Docker socket into
            the pipeline.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The pipeline at a glance</h2>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 760 150" className="w-full h-auto" role="img" aria-label="Drone CI pipeline stages: clone, build and save, scan, gate, push">
              <g fill="currentColor">
                <rect x="8" y="48" width="120" height="54" rx="6" fillOpacity="0.14" />
                <rect x="168" y="48" width="120" height="54" rx="6" fillOpacity="0.14" />
                <rect x="328" y="48" width="120" height="54" rx="6" fill="var(--dg-accent,#2563eb)" fillOpacity="0.5" />
                <rect x="488" y="48" width="120" height="54" rx="6" fillOpacity="0.14" />
                <rect x="648" y="48" width="104" height="54" rx="6" fillOpacity="0.14" />
              </g>
              <g fill="currentColor" fontSize="13" fontWeight="600" textAnchor="middle">
                <text x="68" y="72">Clone</text>
                <text x="228" y="72">Build</text>
                <text x="388" y="72">Scan</text>
                <text x="548" y="72">Gate</text>
                <text x="700" y="72">Push</text>
              </g>
              <g fill="currentColor" fontSize="10.5" textAnchor="middle" fillOpacity="0.7">
                <text x="68" y="90">repo</text>
                <text x="228" y="90">docker save</text>
                <text x="388" y="90">scanrook</text>
                <text x="548" y="90">fail on crit</text>
                <text x="700" y="90">registry</text>
              </g>
              <g stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" fill="currentColor">
                <line x1="128" y1="75" x2="164" y2="75" /><path d="M168 75 l-8 -4 v8 z" fillOpacity="0.6" />
                <line x1="288" y1="75" x2="324" y2="75" /><path d="M328 75 l-8 -4 v8 z" fillOpacity="0.6" />
                <line x1="448" y1="75" x2="484" y2="75" /><path d="M488 75 l-8 -4 v8 z" fillOpacity="0.6" />
                <line x1="608" y1="75" x2="644" y2="75" /><path d="M648 75 l-8 -4 v8 z" fillOpacity="0.6" />
              </g>
              <text x="380" y="130" fontSize="11" textAnchor="middle" fill="currentColor" fillOpacity="0.6">The gate step exits non-zero on critical findings, blocking the push</text>
            </svg>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The complete .drone.yml</h2>
          <p className="text-sm muted">
            Save this as{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.drone.yml</code>{" "}
            at the root of your repository. It builds your image against a Docker-in-Docker service,
            exports it to a tar, scans it with ScanRook, and fails on critical findings:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`kind: pipeline
type: docker
name: build-and-scan

steps:
  - name: build-image
    image: docker:27-cli
    environment:
      DOCKER_HOST: tcp://docker:2375
    commands:
      - until docker info >/dev/null 2>&1; do sleep 1; done
      - docker build -t myapp:ci .
      - docker save myapp:ci -o myapp.tar

  - name: scan-image
    image: alpine:3.20
    commands:
      - apk add --no-cache curl bash jq
      - curl -fsSL https://scanrook.sh/install | bash
      - scanrook scan --file myapp.tar --mode deep --format json --out report.json
      - |
        CRITICAL=$(jq '.summary.critical // 0' report.json)
        HIGH=$(jq '.summary.high // 0' report.json)
        echo "Critical: $CRITICAL  High: $HIGH"
        if [ "$CRITICAL" -gt 0 ]; then
          echo "Blocking pipeline: $CRITICAL critical findings"
          jq '.findings[] | select(.severity == "CRITICAL") | {cve, package: .package.name, version: .package.version}' report.json
          exit 1
        fi

services:
  - name: docker
    image: docker:27-dind
    privileged: true
    environment:
      DOCKER_TLS_CERTDIR: ""

trigger:
  branch:
    - main
  event:
    - push
    - pull_request`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What each part does</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>The dind service.</strong> The{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker:27-dind</code>{" "}
              service runs a Docker daemon as a sidecar, reachable by its service name{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker</code>.
              Setting{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">DOCKER_TLS_CERTDIR: &quot;&quot;</code>{" "}
              disables TLS so the build step can reach it on plain TCP port 2375. It needs{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">privileged: true</code>{" "}
              to run a nested daemon.
            </li>
            <li>
              <strong>Build and save.</strong> The build step points{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">DOCKER_HOST</code>{" "}
              at the service, waits for the daemon to come up, builds the image, and exports it with{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker save</code>.
              The tar lands in the shared workspace. Tag it with{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">$DRONE_COMMIT_SHA</code>{" "}
              instead of a fixed tag if you want the artifact tied to the commit.
            </li>
            <li>
              <strong>Scan.</strong> A clean Alpine step installs the ScanRook CLI and scans the
              tar. <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--mode deep</code>{" "}
              is the thorough profile; switch pull requests to{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--mode light</code>{" "}
              for faster feedback and keep deep mode on main.
            </li>
            <li>
              <strong>Gate.</strong> The last commands read severity totals from the JSON report with
              jq and{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">exit 1</code>{" "}
              when criticals are present, which fails the pipeline. Printing the offending CVEs first
              means the log tells the developer exactly what to fix.
            </li>
            <li>
              <strong>Trigger.</strong> Running on both{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">push</code>{" "}
              and{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">pull_request</code>{" "}
              catches problems at the pull request and records the state of main after merge.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Failing the build on severity without alienating the team</h2>
          <p className="text-sm muted">
            The gate above blocks on any critical finding. That is the right place to start, but two
            adjustments keep it from becoming the check everyone learns to skip. First,{" "}
            <strong>start critical-only</strong> and let highs warn rather than block; a base image
            inherited from upstream can carry hundreds of findings you did not introduce, and gating
            on all of them on day one just teaches people to bypass the pipeline. Reduce that
            baseline first &mdash; our guide on{" "}
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              scanning and fixing image vulnerabilities
            </Link>{" "}
            covers how &mdash; then tighten.
          </p>
          <p className="text-sm muted">
            Second, <strong>gate on newly introduced findings</strong> once you have a baseline.
            Archive the report from the last main build, compare against it, and fail the pull
            request only for CVEs that main does not already carry. That keeps the failure actionable:
            the developer who sees the red build is the one who caused it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A note on runners and the Docker socket</h2>
          <p className="text-sm muted">
            You will see Drone examples that mount the host&apos;s{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/var/run/docker.sock</code>{" "}
            into the build step as a shortcut instead of running a dind service. It works, but it
            gives every build root-equivalent control of the runner host, because talking to the
            Docker socket is talking to a root daemon. The Docker-in-Docker service above keeps the
            build&apos;s daemon isolated in a sidecar, which is why it is the safer default even
            though it costs a few seconds of startup. For the scan itself the question does not arise:
            ScanRook reads a saved tar file and never needs a Docker daemon at all, so the scan step
            is an ordinary unprivileged container.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">How do I scan a Docker image in Drone CI?</h3>
              <p className="text-sm muted mt-1">
                Build against a dind service, export with{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker save</code>,
                then run the scanner in a second step against the tar and fail on severity with jq.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What makes Drone different?</h3>
              <p className="text-sm muted mt-1">
                Every step runs in its own container that you name with an{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">image</code>{" "}
                field, with steps sharing a workspace &mdash; so a scan is just another container step.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How does Drone build images in a pipeline?</h3>
              <p className="text-sm muted mt-1">
                With a Docker-in-Docker service the build step talks to over{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">DOCKER_HOST</code>,
                which avoids mounting the host socket into the pipeline.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I fail on critical CVEs?</h3>
              <p className="text-sm muted mt-1">
                Read severity counts from the JSON report with jq and{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">exit 1</code>{" "}
                past your threshold; a non-zero step fails the pipeline.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Gate your Drone pipeline with ScanRook</h3>
          <p className="text-sm muted leading-relaxed">
            Drop the scan step above into your{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.drone.yml</code>{" "}
            and every image you build is checked against OSV, NVD, and vendor advisory data before it
            ships &mdash; with JSON reports you can gate, archive, and diff between builds.
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
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              Scan Docker Images in GitHub Actions
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/scan-docker-images-gitlab-ci" className="underline">
              Scan Docker Images in GitLab CI
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/jenkins-container-scanning" className="underline">
              Jenkins Docker Image Scanning
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
