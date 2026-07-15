import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-21";

const title = `Syft SBOM Generation in CI: A GitHub Actions Guide | ${APP_NAME}`;
const description =
  "How to generate an SBOM in CI: a working GitHub Actions workflow, format choice, enrichment, and gating builds on unexpected dependency changes.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "syft sbom",
    "syft sbom generation",
    "anchore syft",
    "generate sbom in ci",
    "sbom github actions",
    "sbom ci pipeline",
    "automate sbom generation",
    "cyclonedx github actions",
    "sbom pipeline example",
    "sbom diff ci gate",
  ],
  alternates: { canonical: "/blog/sbom-generation-in-ci" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/sbom-generation-in-ci",
    images: ["/blog/sbom-generation-in-ci.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/sbom-generation-in-ci.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Syft SBOM Generation in CI: A GitHub Actions Guide",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/sbom-generation-in-ci",
  image: "https://scanrook.io/blog/sbom-generation-in-ci.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Why generate an SBOM in CI instead of manually?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A manually generated SBOM reflects a single point in time and drifts out of date the moment dependencies change. Generating it in CI ties the SBOM to the exact artifact being built, so it always matches what actually shipped, with no separate process to remember to run.",
      },
    },
    {
      "@type": "Question",
      name: "What format should a CI-generated SBOM use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CycloneDX is the more common default in CI pipelines because of its native VEX support and wide tool integration, but SPDX is equally valid if your downstream consumers expect it. Many teams generate both from the same scan since the marginal cost is small.",
      },
    },
    {
      "@type": "Question",
      name: "Should the pipeline fail the build based on the SBOM?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A common pattern is an SBOM diff gate: comparing the new SBOM against the previous release and failing the build if it introduces an unexpected new dependency or a license change, rather than failing on the SBOM's mere existence. Vulnerability severity gates are typically a separate step layered on top.",
      },
    },
    {
      "@type": "Question",
      name: "Where should generated SBOMs be stored?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Alongside the build artifact — as a release asset, a container image annotation, or in a dedicated artifact store — so it can be retrieved later without regenerating it. CISA recommends signing SBOMs and making them available at a well-known, machine-readable location.",
      },
    },
    {
      "@type": "Question",
      name: "Does generating an SBOM in CI slow down the pipeline significantly?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Generation itself typically adds seconds to a build, since it is reading already-resolved package manifests or an already-built image layer. It is a small, predictable addition compared to the build and test steps that usually dominate CI pipeline time.",
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
          <div className="text-xs uppercase tracking-wide muted">Compliance</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Syft SBOM Generation in CI: A GitHub Actions Guide
          </h1>
          <p className="text-sm muted">Published August 21, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            An SBOM that is not generated in CI is an SBOM that goes stale the day someone runs{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">npm install</code>{" "}
            without regenerating it. Syft SBOM generation &mdash; running Anchore&apos;s Syft (or
            ScanRook) as a build step &mdash; produces a fresh bill of materials with every build.
            Here is a working pipeline, plus how to gate on what changed.
          </p>
        </header>

        <img
          src="/blog/sbom-generation-in-ci.jpg"
          alt="Generating an SBOM in a CI pipeline"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why CI is the right place to generate an SBOM</h2>
          <p className="text-sm muted">
            An SBOM is only useful if it accurately reflects what was actually built and deployed.
            Generating it as a manual, occasional task guarantees drift &mdash; someone bumps a
            dependency, forgets to regenerate, and the SBOM on file no longer matches the running
            artifact. Tying generation to the build step itself removes that failure mode entirely:
            the SBOM is produced from the exact same source tree or image that becomes the release
            artifact, every time, with no separate step to remember.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Syft: the common SBOM generator</h2>
          <p className="text-sm muted">
            The de facto standard tool for producing an SBOM in a pipeline is{" "}
            <strong>Syft</strong>, Anchore&apos;s open-source generator. Syft catalogs the packages
            in a container image or a filesystem and writes them out in CycloneDX, SPDX, or its own{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">syft-json</code>{" "}
            format. A minimal Syft SBOM run is a single command:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# SBOM from a container image, CycloneDX JSON
syft myapp:latest -o cyclonedx-json=sbom.cdx.json

# SBOM from the current source tree, SPDX JSON
syft dir:. -o spdx-json=sbom.spdx.json`}</pre>
          <p className="text-sm muted">
            Syft pairs naturally with Anchore&apos;s Grype scanner, which consumes a Syft SBOM to
            match vulnerabilities. ScanRook takes the same idea one step further: it emits CycloneDX
            or SPDX SBOMs and enriches every component with OSV, NVD, and Red Hat OVAL data in the
            same pass, so you get the inventory and the risk assessment from one call rather than
            chaining a generator and a separate scanner. Either tool drops into the workflow below.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A working GitHub Actions workflow</h2>
          <p className="text-sm muted">
            This workflow builds a container image, generates an SBOM from it with ScanRook, and
            uploads both the image and the SBOM as build artifacts:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`name: build-and-sbom

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build container image
        run: docker build -t myapp:\${{ github.sha }} .

      - name: Save image as tar
        run: docker save myapp:\${{ github.sha }} -o myapp.tar

      - name: Install ScanRook
        run: curl -fsSL https://scanrook.io/install.sh | sh

      - name: Generate SBOM
        run: |
          scanrook container --tar myapp.tar --sbom --format json --out sbom-report.json

      - name: Restore previous release SBOM baseline
        uses: actions/cache/restore@v4
        with:
          path: baseline-sbom.json
          key: sbom-baseline-\${{ github.event.repository.default_branch }}

      - name: Diff against previous release SBOM
        if: hashFiles('baseline-sbom.json') != ''
        run: |
          scanrook sbom diff --baseline ./baseline-sbom.json --current ./sbom-report.json --json > sbom-diff.json
        continue-on-error: true

      - name: Update SBOM baseline for next run
        if: github.ref == 'refs/heads/main'
        run: cp sbom-report.json baseline-sbom.json

      - name: Save SBOM baseline
        if: github.ref == 'refs/heads/main'
        uses: actions/cache/save@v4
        with:
          path: baseline-sbom.json
          key: sbom-baseline-\${{ github.event.repository.default_branch }}

      - name: Upload SBOM artifact
        uses: actions/upload-artifact@v4
        with:
          name: sbom-\${{ github.sha }}
          path: |
            sbom-report.json
            sbom-diff.json`}</pre>
          <p className="text-sm muted">
            The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">scanrook sbom diff</code>{" "}
            step is optional but valuable: it compares the new SBOM against a baseline &mdash;
            typically the last released version, restored here via{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">actions/cache</code>{" "}
            so the step has something to diff against on the very first run &mdash; and reports
            added, removed, and changed components. The{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">hashFiles(&apos;baseline-sbom.json&apos;) != &apos;&apos;</code>{" "}
            condition skips the diff entirely until a baseline exists. Our{" "}
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              full GitHub Actions scanning guide
            </Link>{" "}
            covers adding vulnerability severity gates to the same pipeline.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Monorepos and multi-artifact builds</h2>
          <p className="text-sm muted">
            A single pipeline that builds several services from one repository needs an SBOM per
            deployable artifact, not one SBOM for the whole repository. A monorepo commonly ships
            multiple container images with different dependency sets, and a single combined SBOM
            would misrepresent which components actually ship in which image &mdash; a vulnerability
            in a package used only by one service would appear to affect all of them.
          </p>
          <p className="text-sm muted">
            The practical pattern is to run the SBOM generation step once per built image, matrixed
            across services in the same workflow, and name each output artifact after its image
            (e.g. <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">sbom-api.cdx.json</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">sbom-worker.cdx.json</code>)
            so downstream consumers can tell which SBOM describes which deployed component.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Gating the build on SBOM diffs, not just vulnerabilities</h2>
          <p className="text-sm muted">
            Most CI vulnerability gates fail a build on severity &mdash; block on any new critical
            CVE, for example. An SBOM diff gate is a different, complementary check: it fails (or
            flags for review) when the dependency graph itself changes unexpectedly, independent of
            whether anything in it is currently known to be vulnerable. This catches things a
            severity gate misses entirely &mdash; an unfamiliar package appearing that was not in
            any lock file, a dependency&apos;s publisher changing, or a license shift introduced by
            a transitive dependency bump.
          </p>
          <p className="text-sm muted">
            A practical middle ground is to fail hard on vulnerability severity and only warn (post
            a PR comment, do not block merge) on SBOM diffs, since dependency changes are often
            expected and reviewing every one as a hard gate creates noise the team will eventually
            ignore.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Generating SBOMs for non-container builds</h2>
          <p className="text-sm muted">
            The same CI pattern applies to artifacts that are not container images &mdash; a Python
            wheel, a Go binary, an npm package. The generation step reads the source tree or the
            resolved dependency manifest instead of an image tar, but the placement in the pipeline
            is identical: run it as part of the build job, right after dependencies resolve, so the
            SBOM reflects the exact dependency graph that was actually locked in for that build
            rather than whatever the manifest allowed in a range.
          </p>
          <p className="text-sm muted">
            This matters because a manifest like <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">package.json</code>{" "}
            often specifies a version range, not an exact version. Generating the SBOM from the
            resolved lock file, after install, is what captures which specific version actually got
            pulled into that build &mdash; the detail that determines whether a given CVE applies.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Storing and sharing the generated SBOM</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              Upload it as a CI artifact attached to the specific build, as in the workflow above,
              so it is retrievable by commit SHA.
            </li>
            <li>
              Attach it to the release &mdash; as a GitHub release asset or an OCI image annotation
              &mdash; so consumers of the artifact can find the SBOM without a separate lookup.
            </li>
            <li>
              Sign it if your threat model requires provenance guarantees; unsigned SBOMs can be
              swapped without detection.
            </li>
            <li>
              Keep the previous release&apos;s SBOM available as the baseline for the next
              build&apos;s diff step.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How ScanRook fits this workflow</h2>
          <p className="text-sm muted">
            ScanRook generates CycloneDX or SPDX SBOMs directly from a container image, binary, or
            source archive in a single CLI call, and enriches every component with vulnerability
            data from OSV, NVD, and Red Hat OVAL in the same pass &mdash; so the CI step above
            produces both the inventory and the risk assessment together, not as two separate tools
            to wire up. Our{" "}
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              complete SBOM guide
            </Link>{" "}
            covers the SBOM diff feature and enrichment pipeline in more depth, and our{" "}
            <Link href="/blog/container-scanning-best-practices" className="underline">
              container scanning best practices
            </Link>{" "}
            guide covers CI integration patterns more broadly.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Why generate an SBOM in CI instead of manually?</h3>
              <p className="text-sm muted mt-1">
                A manually generated SBOM drifts out of date as soon as dependencies change. CI
                generation ties the SBOM to the exact artifact being built every time.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What format should a CI-generated SBOM use?</h3>
              <p className="text-sm muted mt-1">
                CycloneDX is the more common default given native VEX support, though SPDX works
                equally well; many teams generate both from the same scan.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should the build fail based on the SBOM?</h3>
              <p className="text-sm muted mt-1">
                A common pattern is an SBOM diff gate that flags unexpected new dependencies or
                license changes, layered alongside a separate vulnerability severity gate.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Where should the SBOM be stored?</h3>
              <p className="text-sm muted mt-1">
                Alongside the build artifact &mdash; as a release asset or image annotation &mdash;
                so it is retrievable without regeneration, and signed if provenance matters.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Add SBOM generation to your pipeline today</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook generates enriched CycloneDX or SPDX SBOMs and diffs them against a baseline in
            one CLI call, ready to drop into any CI system.
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
              How to Scan Docker Images in GitHub Actions
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              What Is an SBOM?
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-scanning-best-practices" className="underline">
              Container Scanning Best Practices
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
