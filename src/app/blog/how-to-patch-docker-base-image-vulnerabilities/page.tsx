import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-11";

const title = `How to Patch Docker Base Image Vulnerabilities | ${APP_NAME}`;
const description =
  "A step-by-step guide to patching Docker base image vulnerabilities: retag, rebuild with --pull, apply OS patches, pin digests, and verify with a scan.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "patch docker base image vulnerabilities",
    "how to patch docker base image",
    "docker base image cve fix",
    "update docker base image security",
    "docker image security patching",
    "rebuild docker image with patches",
    "apt-get upgrade dockerfile",
    "apk upgrade dockerfile",
    "pin docker image digest",
    "docker base image patch cadence",
  ],
  alternates: { canonical: "/blog/how-to-patch-docker-base-image-vulnerabilities" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/how-to-patch-docker-base-image-vulnerabilities",
    images: ["/blog/how-to-patch-docker-base-image-vulnerabilities.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/how-to-patch-docker-base-image-vulnerabilities.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "How to Patch Docker Base Image Vulnerabilities",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/how-to-patch-docker-base-image-vulnerabilities",
  image: "https://scanrook.io/blog/how-to-patch-docker-base-image-vulnerabilities.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I patch vulnerabilities in a Docker base image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pull the latest tag of your base image, rebuild with --pull --no-cache so Docker fetches fresh layers instead of reusing cached ones, and run apt-get upgrade or apk upgrade during the build to pick up OS security patches published after the base was last built. Then rescan to confirm the findings dropped.",
      },
    },
    {
      "@type": "Question",
      name: "Does docker pull automatically get the patched version of a base image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Only if you pull the same mutable tag again, such as node:22 or python:3.13-slim. Maintainers push patched images under the same tag regularly, but your local Docker cache will keep serving the old layer until you explicitly pull. Build with the --pull flag to force a fresh check every time.",
      },
    },
    {
      "@type": "Question",
      name: "Why does my base image still show CVEs right after I rebuilt it?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The upstream maintainer may not have published a patched image yet, or the fix may not exist upstream at all. Some findings also come from packages layered on top of the base during your own RUN instructions, which the base image maintainer has no control over and which you need to patch yourself.",
      },
    },
    {
      "@type": "Question",
      name: "Should I pin my Docker base image to a digest or a tag?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pin to a digest for reproducible, auditable builds, then update the digest deliberately on a schedule. Pinning to a mutable tag like latest makes builds non-reproducible; pinning to a digest and never updating it means you stop receiving patches. The digest should be a moving target you update on purpose, not a one-time pin.",
      },
    },
    {
      "@type": "Question",
      name: "How often should I patch my Docker base images?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Weekly is a reasonable default for most services; nightly for anything internet-facing or handling sensitive data. Automating the rebuild-and-scan cycle in CI removes the dependency on someone remembering, which is where most patch cadences quietly fail.",
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
          <div className="text-xs uppercase tracking-wide muted">Best practices</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            How to Patch Docker Base Image Vulnerabilities
          </h1>
          <p className="text-sm muted">Published July 11, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            A scan report full of base-image CVEs is not a code problem &mdash; it is a build-process
            problem. This guide walks through patching Docker base image vulnerabilities in the
            right order: find what is actually vulnerable, pull the fix, apply OS-level updates, and
            lock in a cadence so the count does not creep back up.
          </p>
        </header>

        <img
          src="/blog/how-to-patch-docker-base-image-vulnerabilities.jpg"
          alt="Patching Docker base image vulnerabilities"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why base-image patches lag behind</h2>
          <p className="text-sm muted">
            A Docker image is not a live system &mdash; it is a frozen snapshot of packages at build
            time. Upstream maintainers publish patched base images continuously as advisories close,
            but your build only benefits from those patches the moment you rebuild. Between rebuilds,
            every fixed CVE upstream is still an open finding in your image.
          </p>
          <p className="text-sm muted">
            That gap compounds. A base image pulled once at project start and never refreshed can
            silently accumulate a year of unpatched advisories, even though the maintainer fixed
            every one of them upstream. The six steps below close that gap and keep it closed.
          </p>
          <figure className="surface-card p-4 my-2 overflow-x-auto">
            <p className="text-sm font-semibold mb-1">
              What patching can and cannot reach &mdash; ScanRook v1.14.2, 2026-07-04
            </p>
            <svg
              viewBox="0 0 700 168"
              className="w-full"
              style={{ maxWidth: "700px" }}
              role="img"
              aria-label="Horizontal bar chart of total ScanRook findings per image: alpine 3.20 has 301, nginx 1.27-alpine 619, ubuntu 24.04 1,365, nginx 1.27 2,952"
            >
              <title>Horizontal bar chart of total ScanRook findings per image: alpine 3.20 has 301, nginx 1.27-alpine 619, ubuntu 24.04 1,365, nginx 1.27 2,952</title>
              <g>
                <rect x="0" y="10" width="10" height="10" rx="2" className="fill-[var(--dg-accent,#2563eb)]" />
                <text x="14" y="19" className="fill-current text-[10px] opacity-80">
                  Critical
                </text>
                <rect x="77" y="10" width="10" height="10" rx="2" className="fill-current" opacity="0.55" />
                <text x="91" y="19" className="fill-current text-[10px] opacity-80">
                  High
                </text>
                <rect x="132" y="10" width="10" height="10" rx="2" className="fill-current" opacity="0.32" />
                <text x="146" y="19" className="fill-current text-[10px] opacity-80">
                  Medium
                </text>
                <rect x="198" y="10" width="10" height="10" rx="2" className="fill-current" opacity="0.18" />
                <text x="212" y="19" className="fill-current text-[10px] opacity-80">
                  Low
                </text>
                <rect x="247" y="10" width="10" height="10" rx="2" className="fill-current" opacity="0.08" />
                <text x="261" y="19" className="fill-current text-[10px] opacity-80">
                  No severity assigned
                </text>
              </g>
              <text x="0" y="56" className="fill-current text-[10px] font-mono opacity-80">
                alpine:3.20
              </text>
              <rect x="136" y="44" width="39" height="16" rx="2" className="fill-current" opacity="0.08" />
              <rect x="136" y="44" width="3" height="16" className="fill-[var(--dg-accent,#2563eb)]" />
              <rect x="139" y="44" width="18" height="16" className="fill-current" opacity="0.55" />
              <rect x="157" y="44" width="17" height="16" className="fill-current" opacity="0.32" />
              <rect x="174" y="44" width="1" height="16" className="fill-current" opacity="0.18" />
              <text x="524" y="56" className="fill-current text-[9px] opacity-70">
                301 total &middot; 20 critical
              </text>
              <text x="0" y="86" className="fill-current text-[10px] font-mono opacity-80">
                nginx:1.27-alpine
              </text>
              <rect x="136" y="74" width="80" height="16" rx="2" className="fill-current" opacity="0.08" />
              <rect x="136" y="74" width="11" height="16" className="fill-[var(--dg-accent,#2563eb)]" />
              <rect x="147" y="74" width="34" height="16" className="fill-current" opacity="0.55" />
              <rect x="181" y="74" width="31" height="16" className="fill-current" opacity="0.32" />
              <rect x="212" y="74" width="3" height="16" className="fill-current" opacity="0.18" />
              <text x="524" y="86" className="fill-current text-[9px] opacity-70">
                619 total &middot; 84 critical
              </text>
              <text x="0" y="116" className="fill-current text-[10px] font-mono opacity-80">
                ubuntu:24.04
              </text>
              <rect x="136" y="104" width="176" height="16" rx="2" className="fill-current" opacity="0.08" />
              <rect x="136" y="104" width="17" height="16" className="fill-[var(--dg-accent,#2563eb)]" />
              <rect x="153" y="104" width="55" height="16" className="fill-current" opacity="0.55" />
              <rect x="208" y="104" width="84" height="16" className="fill-current" opacity="0.32" />
              <rect x="292" y="104" width="16" height="16" className="fill-current" opacity="0.18" />
              <text x="524" y="116" className="fill-current text-[9px] opacity-70">
                1,365 total &middot; 130 critical
              </text>
              <text x="0" y="146" className="fill-current text-[10px] font-mono opacity-80">
                nginx:1.27
              </text>
              <rect x="136" y="134" width="380" height="16" rx="2" className="fill-current" opacity="0.08" />
              <rect x="136" y="134" width="53" height="16" className="fill-[var(--dg-accent,#2563eb)]" />
              <rect x="189" y="134" width="119" height="16" className="fill-current" opacity="0.55" />
              <rect x="308" y="134" width="175" height="16" className="fill-current" opacity="0.32" />
              <rect x="483" y="134" width="27" height="16" className="fill-current" opacity="0.18" />
              <text x="524" y="146" className="fill-current text-[9px] opacity-70">
                2,952 total &middot; 408 critical
              </text>
            </svg>
            <figcaption className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Rebuilding narrows the gap; the base you rebuild onto sets it. nginx:1.27 reports 2,952 total
              findings (408 critical) against 619 (84 critical) for nginx:1.27-alpine &mdash; the same server,
              a smaller base. ubuntu:24.04 reports 1,365 (130 critical) and alpine:3.20 reports 301 (20
              critical) with no application on top at all, which is the floor the steps below are patching
              toward. If a rebuilt image is still reporting thousands of findings, the remaining lever is the
              base image, not another patch pass. Bar length is linear in total findings, so the smallest bars
              are only a few pixels wide &mdash; exact totals are printed at right. The four rated buckets do
              not always add up to the total because some advisories carry no CVSS severity; that remainder is
              the unfilled part of each bar.
            </figcaption>
          </figure>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Step 1: Identify which base-image CVEs are actually present
          </h2>
          <p className="text-sm muted">
            Before patching anything, scan the current image and export the report. Patching blind
            wastes effort on packages that were never vulnerable in the first place.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`curl -fsSL https://scanrook.io/install.sh | sh

docker save myapp:current -o myapp-current.tar
scanrook scan --file myapp-current.tar --format json --out report.json

# List findings by severity and package
jq -r '.findings[] | "\\(.severity)\\t\\(.package.name)\\t\\(.cve)"' report.json | sort`}</pre>
          <p className="text-sm muted">
            Group the output by package. Findings clustered in a handful of OS packages
            (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">openssl</code>,
            {" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">libc</code>,
            {" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">zlib</code>)
            are almost always base-image findings, not application findings &mdash; that is your
            patch target for the rest of this guide.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Step 2: Rebuild against a fresh pull of the base tag
          </h2>
          <p className="text-sm muted">
            The single most common reason a base-image CVE stays open is that the image was never
            rebuilt against a current pull of the tag. Force Docker to check upstream instead of
            reusing the cached layer:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# --pull: re-check the registry for a newer image under the same tag
# --no-cache: rebuild every layer, so package installs re-run against the new base
docker build --pull --no-cache -t myapp:patched .`}</pre>
          <p className="text-sm muted">
            This alone resolves any CVE that the base-image maintainer has already fixed and
            published under the tag you use. It is free &mdash; no Dockerfile changes required &mdash;
            and it is the first thing to try.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Step 3: Apply OS security updates during the build
          </h2>
          <p className="text-sm muted">
            Even a freshly pulled base can lag a distribution&apos;s security feed by a few days.
            Running the package manager&apos;s upgrade command during the build closes that
            remaining gap:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Debian / Ubuntu bases
FROM debian:12-slim
RUN apt-get update \\
    && apt-get upgrade -y \\
    && apt-get clean \\
    && rm -rf /var/lib/apt/lists/*

# Alpine bases
FROM alpine:3.20
RUN apk upgrade --no-cache

# Red Hat / UBI bases
FROM registry.access.redhat.com/ubi9/ubi-minimal
RUN microdnf update -y && microdnf clean all`}</pre>
          <p className="text-sm muted">
            If your organization requires byte-reproducible builds, this step conflicts with that
            goal since <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">upgrade</code>{" "}
            pulls whatever is current at build time. In that case, skip this step and rely on Step 2
            plus a disciplined rebuild schedule (Step 6) as your patch mechanism instead.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Step 4: Patch packages that have no upstream base-image fix yet
          </h2>
          <p className="text-sm muted">
            Sometimes the CVE is fixed in a specific package version, but neither Step 2 nor Step 3
            picks it up yet &mdash; the distribution has not shipped the update to its repositories.
            In that case, pin the fixed version explicitly:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Debian/Ubuntu: install an explicit fixed version
RUN apt-get update \\
    && apt-get install -y --no-install-recommends openssl=3.0.15-1~deb12u1 \\
    && apt-get clean \\
    && rm -rf /var/lib/apt/lists/*

# Alpine: pin to a fixed package version from a specific repo
RUN apk add --no-cache "openssl>=3.3.2-r0"`}</pre>
          <p className="text-sm muted">
            This is a stopgap, not a long-term strategy &mdash; explicit version pins fall out of
            date and need periodic review. Track them in a comment with the CVE ID and revisit when
            the base image ships the fix natively, then remove the pin.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Step 5: Pin the base image by digest once it is patched
          </h2>
          <p className="text-sm muted">
            Once you have a build you trust, pin it by digest so the exact same patched layers ship
            to every environment until you deliberately update again:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Find the current digest for a tag
docker pull node:22-slim
docker inspect --format='{{index .RepoDigests 0}}' node:22-slim
# node@sha256:9b2e7a3c... (example)

# Pin the Dockerfile to that digest
FROM node@sha256:9b2e7a3c...`}</pre>
          <p className="text-sm muted">
            Digest pinning does not mean freezing forever &mdash; it means the update is now a
            visible, reviewable change in your Dockerfile (a one-line diff) rather than a silent
            change that happens the next time someone runs a build.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Step 6: Put the rebuild-and-patch cycle on a schedule
          </h2>
          <p className="text-sm muted">
            Manual patching works once. A schedule is what keeps the count down over time. A minimal
            CI job that rebuilds, scans, and fails on new criticals:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`name: base-image-patch-check
on:
  schedule:
    - cron: "0 6 * * 1" # every Monday
  workflow_dispatch: {}
jobs:
  rebuild-and-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build --pull --no-cache -t myapp:ci .
      - run: docker save myapp:ci -o myapp.tar
      - run: curl -fsSL https://scanrook.io/install.sh | sh
      - run: scanrook scan --file myapp.tar --format json --out report.json
      - run: |
          CRIT=$(jq '.summary.critical' report.json)
          if [ "$CRIT" -gt 0 ]; then
            echo "::error::$CRIT critical findings after patch rebuild"
            exit 1
          fi`}</pre>
          <p className="text-sm muted">
            Our{" "}
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              GitHub Actions scanning guide
            </Link>{" "}
            covers the full pipeline, including uploading the report as a build artifact and
            commenting results on pull requests.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Verifying the patch worked</h2>
          <p className="text-sm muted">
            Scan before and after every patch round and diff the severity totals with the same
            scanner version, so the comparison is apples to apples:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`docker save myapp:before -o before.tar
scanrook scan --file before.tar --format json --out before.json

docker save myapp:patched -o after.tar
scanrook scan --file after.tar --format json --out after.json

jq '.summary' before.json after.json`}</pre>
          <p className="text-sm muted">
            If a finding survives the full cycle, it likely has no fix published anywhere yet. At
            that point the question shifts from patching to triage: is the affected package actually
            reachable at runtime, and does switching to a{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              smaller base image
            </Link>{" "}
            remove the package entirely instead of waiting on a patch. Our broader guide to{" "}
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              reducing CVEs in Docker images
            </Link>{" "}
            covers that path in detail.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Patch cadence only works if you can measure it. ScanRook scans a saved image tar locally
            or in CI, matches installed packages against OSV, NVD, and vendor advisory data, and
            returns severity totals you can gate a build on directly &mdash; so the weekly rebuild
            job above is enforceable, not aspirational. See the{" "}
            <Link href="/docs" className="underline">
              docs
            </Link>{" "}
            for CI recipes across common pipelines.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">How do I patch vulnerabilities in a Docker base image?</h3>
              <p className="text-sm muted mt-1">
                Rebuild with <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--pull --no-cache</code>,
                run the package manager&apos;s upgrade command during the build, then rescan to
                confirm the findings dropped.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does docker pull get the patched image automatically?</h3>
              <p className="text-sm muted mt-1">
                Only if you pull the same tag again with <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--pull</code>.
                Your local cache otherwise keeps serving the old, unpatched layer.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should I pin my base image to a digest or a tag?</h3>
              <p className="text-sm muted mt-1">
                Pin to a digest for reproducible builds, then update the digest deliberately on a
                schedule &mdash; treat the update as a reviewable one-line diff.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How often should base images be patched?</h3>
              <p className="text-sm muted mt-1">
                Weekly at minimum, nightly for internet-facing services. Automate the cycle in CI so
                it does not depend on someone remembering.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Verify every patch round with ScanRook</h3>
          <p className="text-sm muted leading-relaxed">
            Scan before-and-after builds, diff severity totals, and gate CI on the result so your
            patch cadence is measurable instead of assumed.
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
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              How to Reduce CVEs in Docker Images
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              How to Scan a Docker Image for Vulnerabilities
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
