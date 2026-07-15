import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-07";

const title = `How to Reduce Docker CVEs: 6 Steps That Work | ${APP_NAME}`;
const description =
  "Six concrete steps to reduce CVEs in Docker images: smaller base images, multi-stage builds, package updates, rebuild cadence, and scan verification.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "docker cve",
    "docker cves",
    "reduce docker cves",
    "docker image cve",
    "how to reduce cves in docker images",
    "fix docker image vulnerabilities",
    "docker base image cves",
    "docker image hardening",
    "reduce container vulnerabilities",
    "docker security best practices",
  ],
  alternates: { canonical: "/blog/how-to-reduce-cves-in-docker-images" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/how-to-reduce-cves-in-docker-images",
    images: ["/blog/how-to-reduce-cves-in-docker-images.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/how-to-reduce-cves-in-docker-images.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "How to Reduce Docker CVEs: 6 Steps That Work",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/how-to-reduce-cves-in-docker-images",
  image: "https://scanrook.io/blog/how-to-reduce-cves-in-docker-images.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the fastest way to reduce CVEs in a Docker image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Switch to a smaller base image. Most findings in a typical image come from operating system packages you never use, so moving from a full Debian base to an Alpine, slim, or distroless variant removes hundreds of findings in one change. In our scans, moving nginx from the Debian tag to the Alpine tag cut findings by roughly 79%.",
      },
    },
    {
      "@type": "Question",
      name: "Does rebuilding a Docker image reduce vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Base images are patched continuously, but your image only picks up those patches when you rebuild with a fresh pull of the base. An image built six months ago contains six months of unpatched advisories. Rebuilding weekly with --pull is one of the highest-value, lowest-effort CVE reductions available.",
      },
    },
    {
      "@type": "Question",
      name: "Should I run apt-get upgrade in my Dockerfile?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For security patches, yes. Running apt-get update && apt-get upgrade -y during the build pulls in fixes published after the base image was last built. The old advice against it dates from an era of concern about image determinism; if you need reproducibility, pin the base image by digest and rebuild deliberately.",
      },
    },
    {
      "@type": "Question",
      name: "Why does my image still have CVEs after updating everything?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Some findings have no released fix yet, and some live in packages the distribution will not patch on older releases. These are triage candidates rather than fix candidates: verify whether the affected package is reachable in your container, and consider a base image that does not include the package at all.",
      },
    },
    {
      "@type": "Question",
      name: "How do I verify that my CVE count actually went down?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Scan the image before and after the change with the same scanner and compare severity totals. Export each build with docker save and scan the tar, keeping the JSON reports so you can diff finding counts by severity and by package across builds.",
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
            How to Reduce Docker CVEs: 6 Steps That Work
          </h1>
          <p className="text-sm muted">Published July 7, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            You scanned your image, the report says 900 findings, and your security team wants the
            number down. This guide walks through the six changes that actually reduce Docker CVEs,
            in the order of effort-to-impact, with runnable examples for each.
          </p>
        </header>

        <img
          src="/blog/how-to-reduce-cves-in-docker-images.jpg"
          alt="Reducing CVEs in Docker images"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where Docker CVEs actually come from</h2>
          <p className="text-sm muted">
            Before changing anything, understand the shape of the problem. In a typical application
            image, the overwhelming majority of findings are not in your code or even your
            dependencies &mdash; they are in the operating system packages of the base image. Every
            package in the base carries its own advisory history: the C library, package managers,
            shells, TLS libraries, compression tools.
          </p>
          <p className="text-sm muted">
            The numbers make the point. When we scanned{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">nginx:1.27</code>{" "}
            (Debian-based) it produced 2,952 findings; the same nginx on the Alpine base produced
            619 (ScanRook v1.14.2, warm-cache scan, 2026-07-04). Same web server, 79% fewer
            findings, purely because the base contains less software. That asymmetry drives the
            order of the steps below: shrink the operating system first, then patch what remains,
            then keep it patched.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 1: Move to a smaller base image</h2>
          <p className="text-sm muted">
            The single highest-impact change. Every package you remove from the image is a package
            that can never appear in a scan report again. For most runtimes there are three tiers:
            the full distribution image, a slim/Alpine variant, and distroless.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Before: full Debian base, complete GNU userland
FROM node:22

# Better: Debian slim — drops docs, most tooling
FROM node:22-slim

# Better still: Alpine — musl libc + BusyBox userland
FROM node:22-alpine

# Smallest: distroless — no shell, no package manager
FROM gcr.io/distroless/nodejs22-debian12`}</pre>
          <p className="text-sm muted">
            Each tier trades convenience for surface: Alpine swaps glibc for musl (a compatibility
            concern for native modules), and distroless removes the shell entirely (a debugging
            concern). Our{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless comparison
            </Link>{" "}
            covers the tradeoffs in depth. If you can only make one change from this article, make
            this one.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 2: Rebuild with a fresh base &mdash; regularly</h2>
          <p className="text-sm muted">
            Base images are rebuilt upstream as patches land, but your image is frozen at the moment
            you built it. An image built six months ago is carrying six months of advisories that
            are already fixed upstream. Two flags matter:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# --pull: re-fetch the base image even if cached locally
# --no-cache: rebuild every layer so package installs re-run
docker build --pull --no-cache -t myapp:$(date +%Y%m%d) .`}</pre>
          <p className="text-sm muted">
            Put this on a schedule &mdash; weekly is a reasonable default, nightly for
            internet-facing services. A scheduled CI job that rebuilds, scans, and redeploys is the
            difference between a CVE count that decays continuously and one that only improves when
            someone remembers.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 3: Apply OS security updates in the build</h2>
          <p className="text-sm muted">
            Even a freshly pulled base can lag the distribution&apos;s security feed by days. Applying
            updates during the build closes that gap:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Debian/Ubuntu bases
RUN apt-get update \\
    && apt-get upgrade -y \\
    && apt-get clean \\
    && rm -rf /var/lib/apt/lists/*

# Alpine bases
RUN apk upgrade --no-cache`}</pre>
          <p className="text-sm muted">
            The cleanup lines matter twice over: they shrink the image, and removing the APT list
            cache means stale metadata cannot linger in a layer. If your organization requires
            byte-reproducible builds, pin the base by digest and treat the deliberate rebuild in
            Step 2 as the update mechanism instead.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 4: Use multi-stage builds to drop the toolchain</h2>
          <p className="text-sm muted">
            Compilers, dev headers, git, curl, and build tools are prime CVE carriers, and none of
            them belong in the final image. Multi-stage builds let you compile in a fat image and
            ship from a thin one:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Stage 1: build with the full toolchain
FROM golang:1.23 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/server ./cmd/server

# Stage 2: ship only the artifact
FROM gcr.io/distroless/static-debian12
COPY --from=build /out/server /server
USER nonroot:nonroot
ENTRYPOINT ["/server"]`}</pre>
          <p className="text-sm muted">
            The final image here contains one binary and CA certificates &mdash; no compiler, no
            package manager, no shell. The same pattern works for Node (build stage runs{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">npm ci</code>{" "}
            and bundling, runtime stage copies <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">dist/</code>{" "}
            and production node_modules) and for Python with wheels built in the first stage.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 5: Stop installing what you do not need</h2>
          <p className="text-sm muted">
            Debian&apos;s package manager installs &ldquo;recommended&rdquo; packages by default,
            which quietly pulls in software you never asked for &mdash; each with its own advisory
            history. Disable that, and audit what you install explicitly:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`RUN apt-get update \\
    && apt-get install -y --no-install-recommends \\
        ca-certificates \\
        libpq5 \\
    && apt-get clean \\
    && rm -rf /var/lib/apt/lists/*`}</pre>
          <p className="text-sm muted">
            Common stowaways worth removing: curl and wget (use build-stage downloads instead),
            openssh clients, perl and python pulled in as dependencies of tooling, and debug
            utilities added &ldquo;temporarily&rdquo; during an incident. If a package does not
            execute in production, it is pure scan-report liability.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 6: Update your application dependencies</h2>
          <p className="text-sm muted">
            After the OS layer is under control, what remains is your dependency tree &mdash;
            npm, pip, Go modules, Maven. These findings are usually the most actionable, because
            fixes are published as ordinary version bumps:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Node: report, then apply non-breaking fixes
npm audit
npm audit fix

# Python: upgrade pinned requirements deliberately
pip list --outdated
pip install -U <package>==<fixed-version>

# Go: patch-level module updates
go get -u=patch ./... && go mod tidy`}</pre>
          <p className="text-sm muted">
            Update lockfiles in the same commit as the rebuild so the scan result maps cleanly to a
            single change. Automated dependency-update tooling (Renovate, Dependabot) turns this
            step into review work instead of research work.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Verifying it worked</h2>
          <p className="text-sm muted">
            Measure, do not assume. Scan the image before your changes, apply the steps, and scan
            again with the same scanner version:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`curl -fsSL https://scanrook.io/install.sh | sh

docker save myapp:before -o before.tar
scanrook scan --file before.tar --format json --out before.json

docker save myapp:after -o after.tar
scanrook scan --file after.tar --format json --out after.json

# Compare severity totals
jq '.summary' before.json after.json`}</pre>
          <p className="text-sm muted">
            Expect the distribution of what remains to shift, too: after Steps 1&ndash;5 the
            leftover findings should be concentrated in your application dependencies (fixable via
            Step 6) and a small tail of no-fix-available OS advisories, which are triage candidates
            rather than fix candidates. If a finding survives every step, verify whether the package
            is even reachable at runtime &mdash; our piece on{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning
            </Link>{" "}
            explains how scanners decide what is really present.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Reducing CVEs is a loop, not a project: rebuild, scan, compare, fix, repeat. ScanRook is
            built for that loop &mdash; scan a saved image tar locally or in CI, get JSON with
            severity totals you can gate builds on, and use confidence tiers to separate findings in
            packages that are verifiably installed from heuristic matches. Start with the{" "}
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              scanning guide
            </Link>{" "}
            or the <Link href="/docs" className="underline">docs</Link> for CI recipes.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is the fastest way to reduce CVEs in a Docker image?</h3>
              <p className="text-sm muted mt-1">
                Switch to a smaller base image. It removes hundreds of findings in one change
                because most findings live in OS packages you never use.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does rebuilding an image reduce vulnerabilities?</h3>
              <p className="text-sm muted mt-1">
                Yes &mdash; your image only picks up base patches when you rebuild with{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--pull</code>.
                Schedule it weekly at minimum.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should I run apt-get upgrade in my Dockerfile?</h3>
              <p className="text-sm muted mt-1">
                For security patches, yes. If you need reproducible builds, pin the base by digest
                and rely on scheduled rebuilds instead.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why do CVEs remain after updating everything?</h3>
              <p className="text-sm muted mt-1">
                Some advisories have no released fix, and some packages will not be patched on older
                distribution releases. Triage those by reachability, or move to a base that does not
                ship the package.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Measure the reduction with ScanRook</h3>
          <p className="text-sm muted leading-relaxed">
            Scan before-and-after builds, diff severity totals, and gate CI on the result. ScanRook
            matches every installed package against OSV, NVD, and vendor advisory data so the number
            you report to your security team is one you can defend.
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
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              Container Image Security Checklist
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
