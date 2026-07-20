import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-17";

const title = `Docker Scout: How It Works and When to Use It | ${APP_NAME}`;
const description =
  "Docker Scout analyzes image SBOMs for CVEs, suggests base image upgrades, and enforces policy. How it works, the CLI commands, limits, and where it fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "docker scout",
    "docker scout cves",
    "docker scout vs trivy",
    "docker scout quickview",
    "docker scout policy",
    "docker image vulnerability scanning",
    "docker scout sbom",
    "docker scout github action",
    "container supply chain",
    "docker desktop security",
  ],
  alternates: { canonical: "/blog/docker-scout" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/docker-scout",
    images: ["/blog/docker-scout.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/docker-scout.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Docker Scout: How It Works and When to Use It",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/docker-scout",
  image: "https://scanrook.io/blog/docker-scout.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Docker Scout?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Docker Scout is Docker's software supply chain analysis product. It builds a software bill of materials for an image, matches the packages in that SBOM against vulnerability advisories, and layers on features like base image upgrade recommendations, image comparison, and policy evaluation. It ships as a docker CLI plugin and is integrated into Docker Desktop and Docker Hub.",
      },
    },
    {
      "@type": "Question",
      name: "Is Docker Scout free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Local CLI analysis of images is available without a paid plan, but the hosted features - continuous repository monitoring, policy evaluation across an organization, and registry integrations - are tied to Docker subscription tiers and a limited number of enrolled repositories on the free tier. Docker has changed these limits more than once, so check current pricing before you build a workflow around them.",
      },
    },
    {
      "@type": "Question",
      name: "How is Docker Scout different from Trivy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Trivy is a self-contained open-source binary that downloads a vulnerability database and does all matching locally. Docker Scout is a hosted service with a CLI front end: analysis relies on Docker's backend, and its differentiating features - base image recommendations, image comparison, and policy - depend on that service. Trivy is easier to run air-gapped; Scout is easier if you already live in Docker Hub and Docker Desktop.",
      },
    },
    {
      "@type": "Question",
      name: "Can Docker Scout fail a CI build?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The cves subcommand supports an exit-code flag that returns a non-zero status when findings match your severity filter, and the official GitHub Action exposes the same behaviour. The common pattern is to fail only on fixable critical and high findings so that unfixable noise does not block every merge.",
      },
    },
    {
      "@type": "Question",
      name: "Does Docker Scout generate an SBOM?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Docker Scout is SBOM-first: it indexes an image into a component inventory and can emit that inventory in SPDX or CycloneDX form. It can also read an SBOM attestation attached to an image at build time rather than re-indexing the image itself.",
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
          <div className="text-xs uppercase tracking-wide muted">Scanning concepts</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Docker Scout: How It Works and When to Use It
          </h1>
          <p className="text-sm muted">Published October 17, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Docker Scout is Docker&apos;s own answer to &ldquo;what is actually inside this image, and
            is any of it vulnerable?&rdquo; It is the scanner most developers meet first, because it
            is already sitting in Docker Desktop and behind the vulnerability tab on Docker Hub. This
            is a practical look at how it works, the commands worth knowing, what it does better than
            a plain CVE scanner, and where its boundaries are.
          </p>
        </header>

        <img
          src="/blog/docker-scout.jpg"
          alt="Docker Scout analyzing container image layers for vulnerabilities"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Docker Scout actually is</h2>
          <p className="text-sm muted">
            Docker Scout is a software supply chain analysis product, not just a CVE lookup tool. The
            distinction matters. A classic scanner answers one question: which installed packages
            match a published advisory. Scout starts from the same place but is built around a
            persistent <strong>image index</strong> &mdash; a software bill of materials for every
            image you enroll &mdash; and then hangs several products off that inventory: vulnerability
            matching, base image upgrade advice, image-to-image comparison, and policy evaluation.
          </p>
          <p className="text-sm muted">
            Practically, it comes in three shapes. There is a{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker scout</code>{" "}
            CLI plugin, bundled with recent Docker Desktop builds and installable standalone on Linux.
            There is a Docker Desktop UI panel showing findings for local images. And there is the
            hosted side &mdash; Docker Hub and Scout&apos;s web dashboard &mdash; which continuously
            re-evaluates enrolled repositories as new advisories land, so an image that was clean on
            push can light up a week later without anyone re-running anything.
          </p>
          <p className="text-sm muted">
            That hosted component is the key architectural fact about Docker Scout: analysis is not
            purely local. The CLI collects and uploads an image index, and the matching and enrichment
            happen on Docker&apos;s side. If you need fully air-gapped scanning, that is a real
            constraint &mdash; and it is the main reason teams in regulated environments end up
            looking at{" "}
            <Link href="/blog/trivy-alternatives" className="underline">
              other scanners
            </Link>{" "}
            regardless of how good Scout&apos;s UX is.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            How Docker Scout analyzes an image
          </h2>
          <p className="text-sm muted">
            The pipeline is SBOM-first. Scout decomposes an image into layers, records the packages
            each layer installs &mdash; OS packages from the distribution database plus language
            packages such as npm, pip, Go modules, Maven and Cargo artifacts &mdash; and stores that
            inventory. Vulnerability matching then runs against the inventory rather than against the
            image, which is what makes re-evaluation cheap: new advisory in, existing index re-matched,
            no re-pull required.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 240"
              role="img"
              aria-label="Docker Scout pipeline: image layers are indexed into an SBOM, matched against advisory data, then evaluated against policy to produce findings and recommendations"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <defs>
                <marker
                  id="ds-arrow"
                  markerWidth="9"
                  markerHeight="9"
                  refX="6"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              {[
                { x: 8, label: "Image", sub: "layers + config" },
                { x: 176, label: "Index", sub: "SBOM inventory" },
                { x: 366, label: "Match", sub: "advisory sources", hot: true },
                { x: 556, label: "Output", sub: "CVEs + advice" },
              ].map((b) => (
                <g key={b.label}>
                  <rect
                    x={b.x}
                    y={20}
                    width={136}
                    height={54}
                    rx={8}
                    fill={b.hot ? "var(--dg-accent,#2563eb)" : "transparent"}
                    fillOpacity={b.hot ? 0.12 : 1}
                    stroke="currentColor"
                    strokeOpacity={0.5}
                  />
                  <text
                    x={b.x + 68}
                    y={43}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="600"
                    fill="currentColor"
                  >
                    {b.label}
                  </text>
                  <text
                    x={b.x + 68}
                    y={62}
                    textAnchor="middle"
                    fontSize="10.5"
                    fill="currentColor"
                    fillOpacity={0.6}
                  >
                    {b.sub}
                  </text>
                </g>
              ))}
              {[146, 336, 526].map((x) => (
                <line
                  key={x}
                  x1={x}
                  y1={47}
                  x2={x + 26}
                  y2={47}
                  stroke="currentColor"
                  strokeWidth={2}
                  markerEnd="url(#ds-arrow)"
                />
              ))}
              <rect
                x={318}
                y={112}
                width={232}
                height={30}
                rx={6}
                fill="currentColor"
                fillOpacity={0.05}
                stroke="currentColor"
                strokeOpacity={0.3}
              />
              <text
                x={434}
                y={131}
                textAnchor="middle"
                fontSize="11"
                fill="currentColor"
                fillOpacity={0.75}
              >
                Advisory feeds: distro trackers, NVD, ecosystems
              </text>
              <line
                x1={434}
                y1={112}
                x2={434}
                y2={78}
                stroke="currentColor"
                strokeWidth={2}
                markerEnd="url(#ds-arrow)"
              />
              <rect
                x={470}
                y={170}
                width={222}
                height={30}
                rx={6}
                fill="currentColor"
                fillOpacity={0.05}
                stroke="currentColor"
                strokeOpacity={0.3}
              />
              <text
                x={581}
                y={189}
                textAnchor="middle"
                fontSize="11"
                fill="currentColor"
                fillOpacity={0.75}
              >
                Policy evaluation: pass / fail gates
              </text>
              <line
                x1={624}
                y1={76}
                x2={624}
                y2={170}
                stroke="currentColor"
                strokeWidth={1.5}
                strokeOpacity={0.5}
                strokeDasharray="4 3"
              />
              <rect
                x={130}
                y={170}
                width={250}
                height={30}
                rx={6}
                fill="currentColor"
                fillOpacity={0.05}
                stroke="currentColor"
                strokeOpacity={0.3}
              />
              <text
                x={255}
                y={189}
                textAnchor="middle"
                fontSize="11"
                fill="currentColor"
                fillOpacity={0.75}
              >
                Stored index: re-matched as advisories land
              </text>
              <line
                x1={244}
                y1={76}
                x2={244}
                y2={170}
                stroke="currentColor"
                strokeWidth={1.5}
                strokeOpacity={0.5}
                strokeDasharray="4 3"
              />
            </svg>
            <figcaption className="text-xs muted mt-3">
              Docker Scout&apos;s pipeline, simplified. The stored index is what makes continuous
              re-evaluation and policy gating possible without re-scanning the image each time.
            </figcaption>
          </div>
          <p className="text-sm muted">
            Scout also understands build-time <strong>attestations</strong>. If you build with
            BuildKit and attach an SBOM or provenance attestation to the image, Scout can consume that
            attestation instead of re-deriving the inventory. That is worth doing: an SBOM produced at
            build time knows things a post-hoc scan cannot, such as which dependencies came from a
            lockfile rather than a stripped vendored directory. We cover the general shape of this in{" "}
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              what an SBOM is and how we use it
            </Link>
            .
          </p>
        </section>

        <img
          src="/blog/docker-scout-2.jpg"
          alt="Docker Scout policy evaluation gating container images in a supply chain"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            The Docker Scout commands worth knowing
          </h2>
          <p className="text-sm muted">
            Most day-to-day use lives in four subcommands. Start with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">quickview</code>{" "}
            for a summary, then drill in.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`# One-screen summary: counts by severity, plus base image info
docker scout quickview node:22-alpine

# Full finding list
docker scout cves node:22-alpine

# Only what you can actually act on today
docker scout cves --only-severity critical,high --only-fixed node:22-alpine

# What changed between two tags or two builds
docker scout compare --to node:22-alpine node:22

# What Docker suggests you upgrade the base image to
docker scout recommendations node:22

# Emit the inventory as an SBOM
docker scout sbom --format spdx --output sbom.spdx.json node:22-alpine`}
          </pre>
          <p className="text-sm muted">
            Two of these have no real equivalent in a plain CVE scanner.{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">compare</code>{" "}
            diffs two images and tells you which findings a change introduced or removed &mdash;
            exactly the question a reviewer wants answered on a base image bump PR.{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">recommendations</code>{" "}
            proposes concrete alternative base tags, which is the single highest-leverage remediation
            for most images, as we argue in{" "}
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              how to reduce CVEs in Docker images
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Using Docker Scout in CI</h2>
          <p className="text-sm muted">
            Scout&apos;s CI story is a GitHub Action plus an exit code. The action wraps the same
            subcommands, so anything you can do locally you can do in a workflow. A reasonable gate
            fails only on fixable critical and high findings &mdash; blocking on unfixable CVEs
            teaches people to add exceptions rather than fix things.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`name: image-scan
on: [pull_request]

jobs:
  scout:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4

      - uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKERHUB_USERNAME }}
          password: \${{ secrets.DOCKERHUB_TOKEN }}

      - uses: docker/build-push-action@v6
        with:
          context: .
          load: true
          tags: myorg/myapp:\${{ github.sha }}
          # attach an SBOM attestation Scout can consume
          sbom: true
          provenance: mode=max

      - name: Analyze with Docker Scout
        uses: docker/scout-action@v1
        with:
          command: cves
          image: myorg/myapp:\${{ github.sha }}
          only-severity: critical,high
          only-fixed: true
          exit-code: true`}
          </pre>
          <p className="text-sm muted">
            The equivalent raw-CLI gate is{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              docker scout cves --exit-code --only-fixed --only-severity critical,high IMAGE
            </code>
            , which returns non-zero when anything matches. Scout can also emit SARIF, so findings can
            be uploaded to GitHub code scanning and shown inline on the PR. If you are wiring this up
            for the first time, the mechanics are the same ones in{" "}
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              scanning Docker images in GitHub Actions
            </Link>
            .
          </p>
        </section>

        <img
          src="/blog/docker-scout-3.jpg"
          alt="Docker Scout CVE gating inside a continuous integration pipeline"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Policies: the part people miss</h2>
          <p className="text-sm muted">
            The feature that distinguishes Docker Scout from a scanner is policy evaluation. Instead
            of a raw finding count, Scout evaluates an image against named criteria and reports
            pass/fail with a delta against the previous evaluation. The built-in set covers the
            checks most teams would otherwise write themselves: no fixable critical or high
            vulnerabilities, no outdated base images, supply chain attestations present, no
            unapproved licenses, no high-profile named CVEs, no AGPL-licensed components. Policies can
            be tuned per organization.
          </p>
          <p className="text-sm muted">
            This framing is genuinely useful. &ldquo;Your image has 214 CVEs&rdquo; is not actionable;
            &ldquo;this image regressed on the no-fixable-critical policy compared to the last
            release&rdquo; is. It is the same instinct behind{" "}
            <Link href="/blog/how-to-triage-vulnerability-scan-results" className="underline">
              triaging scan results
            </Link>{" "}
            by exploitability rather than by count. The catch is that policy evaluation is a hosted
            feature tied to enrolled repositories and Docker subscription tiers, so it is not
            something you can lift into an air-gapped pipeline.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Honest limits</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>It is a hosted service.</strong> The CLI is a client. Fully offline or
              air-gapped scanning is not the design center, and network egress to Docker is required
              for the interesting parts.
            </li>
            <li>
              <strong>Coverage is registry-shaped.</strong> Scout is excellent on images, and that is
              essentially all it does. It is not a filesystem, IaC, secret, or binary scanner, and it
              does not scan a source tree that has not been built into an image.
            </li>
            <li>
              <strong>Entitlements move.</strong> Free-tier repository limits and which features sit
              behind which Docker plan have changed more than once. Verify current terms before you
              make Scout the mandatory gate for every service you own.
            </li>
            <li>
              <strong>Single-source matching.</strong> Like most scanners, Scout resolves each package
              against one primary advisory view. Where sources disagree &mdash; and they disagree
              often, as we show in our{" "}
              <Link href="/blog/cve-database-comparison" className="underline">
                CVE database comparison
              </Link>{" "}
              &mdash; you see one opinion rather than the union.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            We are not going to pretend Docker Scout is a bad tool. If your images live in Docker Hub
            and your developers live in Docker Desktop, Scout is the lowest-friction way to get
            continuous image analysis, and its base image recommendations and compare view solve real
            problems that a raw CVE list does not.
          </p>
          <p className="text-sm muted">
            ScanRook is built for a different question: maximum finding depth on an artifact you can
            hand it, with no hosted dependency in the matching path. It reads the real package
            databases inside a container tarball, source archive, or binary, matches every package
            against OSV, NVD, and Red Hat OVAL in parallel, and labels every finding with its source
            and a confidence tier so you can see which ones are corroborated and which come from a
            single feed. That multi-source approach is why our{" "}
            <Link href="/blog/vulnerability-scanner-benchmark-2026" className="underline">
              2026 benchmark
            </Link>{" "}
            surfaces substantially more real findings than single-database matching. The two tools
            coexist comfortably: Scout as the always-on registry view, ScanRook when you want to know
            everything a given artifact contains.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is Docker Scout?</h3>
              <p className="text-sm muted mt-1">
                Docker&apos;s supply chain analysis product. It indexes an image into an SBOM, matches
                that inventory against advisories, and adds base image recommendations, image
                comparison, and policy evaluation on top.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is Docker Scout free?</h3>
              <p className="text-sm muted mt-1">
                Local CLI analysis is broadly available, but continuous monitoring, policy, and
                registry integrations depend on Docker plan tier and enrolled repository limits. Those
                terms have changed before &mdash; check current pricing.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Docker Scout or Trivy?</h3>
              <p className="text-sm muted mt-1">
                Trivy runs entirely locally from a downloaded database and covers more target types.
                Scout gives better base image guidance and policy framing if you are already inside
                the Docker ecosystem.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can it fail a build?</h3>
              <p className="text-sm muted mt-1">
                Yes &mdash; the cves subcommand and the official GitHub Action both support an exit
                code driven by severity and fixability filters.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">See what a second opinion finds</h3>
          <p className="text-sm muted leading-relaxed">
            Scan an image you already track in Docker Scout with ScanRook and diff the results. Every
            finding carries its source and a confidence tier, so the gap between the two is something
            you can inspect rather than take on faith.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--dg-accent,#2563eb)] text-white px-4 py-2 text-sm font-medium"
            >
              Start scanning
            </Link>
            <Link href="/compare/trivy" className="btn-secondary">
              ScanRook vs Trivy
            </Link>
          </div>
        </section>

        <footer className="border-t border-black/10 dark:border-white/10 pt-4 text-xs muted grid gap-2">
          <p>
            <strong>Related reading:</strong>{" "}
            <Link href="/blog/docker-vulnerability-scanner-guide" className="underline">
              Docker Vulnerability Scanner Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/best-container-vulnerability-scanners-2026" className="underline">
              Best Container Vulnerability Scanners in 2026
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
