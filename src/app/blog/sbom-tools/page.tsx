import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-21";

const title = `SBOM Tools: Generate, Validate, and Use Them | ${APP_NAME}`;
const description =
  "A practical map of the SBOM tools ecosystem: generators, validators, quality scorers, storage platforms, and the scanners that consume SBOMs for CVEs.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "sbom tools",
    "sbom generator",
    "syft sbom",
    "cyclonedx tools",
    "spdx tools",
    "sbom validation",
    "dependency track",
    "sbom quality score",
    "cdxgen",
    "sbom in ci",
  ],
  alternates: { canonical: "/blog/sbom-tools" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/sbom-tools",
    images: ["/blog/sbom-tools.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/sbom-tools.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "SBOM Tools: Generate, Validate, and Use Them",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/sbom-tools",
  image: "https://scanrook.io/blog/sbom-tools.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are SBOM tools?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SBOM tools are the software that produces, checks, stores, and consumes software bills of materials. The category splits into four jobs: generators that inventory an artifact or source tree, transformers and validators that convert or quality-check the document, storage and analysis platforms that keep SBOMs over time, and scanners that match an SBOM against vulnerability advisories.",
      },
    },
    {
      "@type": "Question",
      name: "Which SBOM generator should I use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For container images, Syft and Trivy both produce solid SPDX or CycloneDX output with a single command. For source trees with deep language-ecosystem detail, cdxgen or the native ecosystem plugins - the CycloneDX Maven plugin, npm sbom - usually produce richer dependency data because they read lockfiles and build metadata directly.",
      },
    },
    {
      "@type": "Question",
      name: "Should SBOMs be generated at build time or by scanning an image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Build time is better when you can do it. A build-time SBOM sees the lockfile, the resolved dependency graph, and which components were compiled in but left no filesystem trace. Scanning a finished image is more universal - it works on artifacts you did not build - but it can only report what it can still observe on disk.",
      },
    },
    {
      "@type": "Question",
      name: "How do I check whether an SBOM is any good?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Validate the document against its schema first, then score its content. Quality scorers check for the fields that make an SBOM usable in practice: component versions, package URLs or other identifiers, licences, supplier information, and dependency relationships. An SBOM that lists names without versions or PURLs is syntactically valid and practically useless.",
      },
    },
    {
      "@type": "Question",
      name: "Can a vulnerability scanner read an SBOM instead of the image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Grype, Trivy, and OSV-Scanner can all take an SBOM file as input and match its components against advisory data, which is much faster than re-analysing an image. The results are only as complete as the SBOM, so a thin SBOM produces a thin finding list regardless of how good the scanner is.",
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
          <div className="text-xs uppercase tracking-wide muted">Data sources</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            SBOM Tools: Generate, Validate, and Actually Use Them
          </h1>
          <p className="text-sm muted">Published October 21, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            The SBOM tools landscape looks crowded until you notice it is really four separate
            categories that people keep mixing up: things that <em>produce</em> a bill of materials,
            things that <em>convert or check</em> one, things that <em>store</em> them over time, and
            things that <em>consume</em> them to answer a question. Pick one from each column and you
            have a working pipeline. Here is the map.
          </p>
        </header>

        <img
          src="/blog/sbom-tools.jpg"
          alt="SBOM tools producing a component inventory of a software artifact"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The four jobs</h2>
          <p className="text-sm muted">
            Before comparing tools, be clear about which job you are hiring one for. Most frustration
            with SBOMs comes from expecting a generator to do a consumer&apos;s work, or from treating
            a document as an output instead of an input.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 210"
              role="img"
              aria-label="SBOM tool pipeline: generators produce a document, transformers and validators check it, storage platforms retain it over time, and consumers match it against advisories"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <defs>
                <marker
                  id="sb-arrow"
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
                { x: 6, label: "Generate", sub: "inventory the artifact" },
                { x: 178, label: "Validate", sub: "schema + quality" },
                { x: 350, label: "Store", sub: "versioned history" },
                { x: 522, label: "Consume", sub: "CVEs, licences, VEX", hot: true },
              ].map((b) => (
                <g key={b.label}>
                  <rect
                    x={b.x}
                    y={24}
                    width={158}
                    height={56}
                    rx={8}
                    fill={b.hot ? "var(--dg-accent,#2563eb)" : "transparent"}
                    fillOpacity={b.hot ? 0.12 : 1}
                    stroke="currentColor"
                    strokeOpacity={0.5}
                  />
                  <text
                    x={b.x + 79}
                    y={48}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="600"
                    fill="currentColor"
                  >
                    {b.label}
                  </text>
                  <text
                    x={b.x + 79}
                    y={67}
                    textAnchor="middle"
                    fontSize="10.5"
                    fill="currentColor"
                    fillOpacity={0.6}
                  >
                    {b.sub}
                  </text>
                </g>
              ))}
              {[164, 336, 508].map((x) => (
                <line
                  key={x}
                  x1={x}
                  y1={52}
                  x2={x + 14}
                  y2={52}
                  stroke="currentColor"
                  strokeWidth={2}
                  markerEnd="url(#sb-arrow)"
                />
              ))}
              {[
                { x: 6, w: 158, t: "Syft, Trivy, cdxgen, BuildKit" },
                { x: 178, w: 158, t: "schema validators, quality scorers" },
                { x: 350, w: 158, t: "Dependency-Track, registries" },
                { x: 522, w: 158, t: "Grype, Trivy, OSV-Scanner" },
              ].map((b) => (
                <g key={b.t}>
                  <line
                    x1={b.x + b.w / 2}
                    y1={82}
                    x2={b.x + b.w / 2}
                    y2={122}
                    stroke="currentColor"
                    strokeWidth={1.2}
                    strokeOpacity={0.4}
                    strokeDasharray="4 3"
                  />
                  <rect
                    x={b.x}
                    y={122}
                    width={b.w}
                    height={44}
                    rx={6}
                    fill="currentColor"
                    fillOpacity={0.05}
                    stroke="currentColor"
                    strokeOpacity={0.25}
                  />
                  <foreignObject x={b.x + 6} y={128} width={b.w - 12} height={36}>
                    <div
                      style={{
                        fontSize: "10px",
                        lineHeight: 1.3,
                        textAlign: "center",
                        opacity: 0.75,
                      }}
                    >
                      {b.t}
                    </div>
                  </foreignObject>
                </g>
              ))}
              <text
                x={350}
                y={192}
                textAnchor="middle"
                fontSize="10.5"
                fill="currentColor"
                fillOpacity={0.6}
              >
                An SBOM is an input to the next stage, not a deliverable in itself.
              </text>
            </svg>
            <figcaption className="text-xs muted mt-3">
              The four jobs in the SBOM tool chain. Tools named are representative examples, not an
              exhaustive list.
            </figcaption>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Generators</h2>
          <p className="text-sm muted">
            This is the crowded column. The important split is <strong>where the tool looks</strong>.
          </p>
          <p className="text-sm muted">
            <strong>Artifact scanners</strong> analyze a finished image, filesystem, or archive. Syft
            is the reference implementation here and emits both major formats; Trivy will produce an
            SBOM from the same analysis it uses for vulnerability scanning. They work on anything,
            including artifacts you did not build, which is exactly why you want them for third-party
            images.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`# Container image to SPDX
syft scan alpine:3.20 -o spdx-json=sbom.spdx.json

# Source directory to CycloneDX
syft scan dir:. -o cyclonedx-json=sbom.cdx.json

# Same idea via Trivy
trivy image --format cyclonedx --output sbom.cdx.json alpine:3.20`}
          </pre>
          <p className="text-sm muted">
            <strong>Build-time generators</strong> run inside the build and see far more. BuildKit can
            attach an SBOM attestation to the image it produces; ecosystem-native plugins read the
            resolved dependency graph directly from the build tool.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`# Attach SBOM + provenance attestations at build time
docker buildx build --sbom=true --provenance=mode=max -t myorg/app:1.0 --push .

# Ecosystem-native, from the real dependency resolution
mvn cyclonedx:makeAggregateBom
npm sbom --sbom-format cyclonedx > sbom.cdx.json

# Multi-language source analysis
cdxgen -o bom.json .`}
          </pre>
          <p className="text-sm muted">
            Prefer build-time output when you control the build. It knows about dev-only dependencies,
            the exact lockfile resolution, and components that were compiled in and left no separate
            file on disk &mdash; none of which a post-hoc scan of the finished image can reliably
            recover. We walk through wiring this up in{" "}
            <Link href="/blog/sbom-generation-in-ci" className="underline">
              SBOM generation in CI
            </Link>
            .
          </p>
        </section>

        <img
          src="/blog/sbom-tools-2.jpg"
          alt="Dependency graph produced by SBOM generation tools"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Transformers, validators, and quality scorers
          </h2>
          <p className="text-sm muted">
            The two dominant formats are SPDX and CycloneDX, and you will end up with both because
            different partners ask for different ones. Conversion tools exist for the common
            directions, but conversion is genuinely lossy: the formats model relationships, licence
            expressions, and external references differently, so a round trip does not return the
            document you started with. Generate natively in the format you need where you can, and
            convert only at the boundary. We compare the two data models in{" "}
            <Link href="/blog/cyclonedx-vs-spdx" className="underline">
              CycloneDX vs SPDX
            </Link>
            .
          </p>
          <p className="text-sm muted">
            Validation has two levels, and skipping the second is the most common mistake in the whole
            space. <strong>Schema validation</strong> tells you the JSON is well formed and matches the
            spec version it claims. <strong>Quality scoring</strong> tells you whether the content is
            worth anything: does every component have a version? A package URL or other machine-readable
            identifier? A licence? A supplier? Are dependency relationships recorded, or is it a flat
            list? An SBOM listing two hundred component names with no versions passes schema validation
            and is completely unusable for vulnerability matching. Open-source scorers exist for exactly
            this check, and running one in CI is a five-minute investment that saves an embarrassing
            conversation later.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Storage and analysis platforms</h2>
          <p className="text-sm muted">
            A single SBOM answers &ldquo;what is in this build?&rdquo; A store of SBOMs over time
            answers the question that actually matters: &ldquo;a new CVE just dropped &mdash; which of
            our services are affected, and which versions are still deployed?&rdquo; You cannot answer
            that by regenerating documents on demand, because you need history.
          </p>
          <p className="text-sm muted">
            OWASP Dependency-Track is the best-known open-source option: you upload SBOMs per project
            and version, and it continuously re-evaluates the stored inventories as advisory data
            changes, with policy rules and notifications on top. Container registries increasingly
            store SBOM attestations alongside images as OCI referrers, which keeps the document
            travelling with the artifact. Graph-oriented projects go further and link SBOMs to
            provenance and attestation data so you can query the supply chain as a graph rather than a
            pile of files.
          </p>
        </section>

        <img
          src="/blog/sbom-tools-3.jpg"
          alt="Converting between CycloneDX and SPDX software bill of materials formats"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Consumers</h2>
          <p className="text-sm muted">
            Finally, the tools that turn an inventory into a decision. Vulnerability scanners can take
            an SBOM as input rather than re-analysing the artifact, which is dramatically faster and
            works in places where the image is not available:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`grype sbom:./sbom.cdx.json
trivy sbom sbom.cdx.json
osv-scanner scan --sbom=sbom.spdx.json`}
          </pre>
          <p className="text-sm muted">
            The caveat is unavoidable: <strong>consumption is bounded by generation</strong>. If your
            generator missed a vendored library or recorded a component without a version, no scanner
            downstream will find a CVE in it. Garbage in, silence out &mdash; which is a much more
            dangerous failure mode than a false positive, because it looks like good news.
          </p>
          <p className="text-sm muted">
            The other major consumer category is VEX tooling, which lets you attach machine-readable
            statements about whether a given CVE actually affects your product. Pairing an SBOM with
            VEX is how large vendors keep customer-facing findings honest without hiding data;{" "}
            <Link href="/blog/vex-explained" className="underline">
              VEX explained
            </Link>{" "}
            covers the formats. Licence and policy tooling reads the same documents from a different
            angle.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Where SBOM pipelines usually go wrong
          </h2>
          <p className="text-sm muted">
            The failure modes are consistent enough to be worth listing, because none of them announce
            themselves. Each one produces a document that looks fine.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Scanning the wrong stage.</strong> An SBOM generated from the build context
              rather than the final image records dependencies that were never shipped, and misses
              anything the final stage installed. In a multi-stage build, generate against the stage
              you actually publish.
            </li>
            <li>
              <strong>Vendored and statically linked code.</strong> A Go binary with dependencies
              compiled in, a JAR with shaded classes, a copied-in C library with no package manager
              record &mdash; these leave no manifest entry for a generator to find. Build-time
              generation catches most of it; post-hoc scanning generally does not.
            </li>
            <li>
              <strong>Components without identifiers.</strong> A name and a version are not enough for
              reliable matching. Without a package URL or CPE, a consumer has to guess which upstream
              project &ldquo;utils 2.1&rdquo; refers to, and it will guess wrong.
            </li>
            <li>
              <strong>Generate-and-archive.</strong> An SBOM written to a CI artifact bucket that
              nobody queries is compliance theatre. The value is entirely in the consumption step.
            </li>
            <li>
              <strong>One tool, one truth.</strong> Two generators run on the same image routinely
              produce different component counts, because they detect different ecosystems and handle
              layer deletions differently. That disagreement is information, not an error to
              rationalise away.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A minimal working setup</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Generate at build time</strong>, natively in the format your consumers want, and
              attach it to the artifact as an attestation rather than leaving it in a CI artifact
              bucket.
            </li>
            <li>
              <strong>Score it in the same job.</strong> Fail the build if components are missing
              versions or identifiers. That single check prevents most downstream uselessness.
            </li>
            <li>
              <strong>Store every release SBOM</strong> somewhere queryable and keep the history. The
              value compounds only if you can look backwards.
            </li>
            <li>
              <strong>Re-evaluate continuously</strong> rather than only at build. Advisory data moves;
              your shipped artifact does not.
            </li>
            <li>
              <strong>Do not trust one source of truth.</strong> If a scan of the built image finds
              components your SBOM does not list, the SBOM is wrong &mdash; and that gap is worth
              investigating rather than reconciling away.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook sits on the consumer side of this chain, and deliberately does its own inventory
            rather than trusting one it was handed. When you scan a container tarball, source archive,
            or binary, it reads the real package databases inside the artifact &mdash; the dpkg and
            RPM databases, APK indexes, lockfiles, language manifests &mdash; and produces a component
            inventory it then matches against OSV, NVD, and Red Hat OVAL in parallel, with each finding
            tagged by source and confidence tier.
          </p>
          <p className="text-sm muted">
            That makes it a useful cross-check on your SBOM pipeline as well as a scanner. If ScanRook
            reports packages your generated SBOM does not contain, you have found a real gap in your
            generation step, which is exactly the kind of problem that stays invisible until an auditor
            or an incident surfaces it. More on our approach in{" "}
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              what an SBOM is and how we use it
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What counts as an SBOM tool?</h3>
              <p className="text-sm muted mt-1">
                Anything that generates, converts, validates, stores, or consumes a bill of materials.
                Four distinct jobs &mdash; most confusion comes from expecting one tool to cover all
                of them.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Build time or scan time?</h3>
              <p className="text-sm muted mt-1">
                Build time when you control the build &mdash; it sees the resolved dependency graph.
                Scan time for third-party artifacts you did not produce.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I know an SBOM is usable?</h3>
              <p className="text-sm muted mt-1">
                Schema validation is not enough. Score the content for versions, package URLs,
                licences, and dependency relationships. Missing versions make it useless for CVE
                matching.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can scanners read SBOMs directly?</h3>
              <p className="text-sm muted mt-1">
                Yes &mdash; Grype, Trivy, and OSV-Scanner all accept SBOM input. Results are bounded by
                the quality of the SBOM you feed them.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Check your SBOM against reality</h3>
          <p className="text-sm muted leading-relaxed">
            Scan the artifact your SBOM describes with ScanRook and compare the component lists. Any
            package we find that your SBOM does not list is a gap in your generation step worth
            fixing.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--dg-accent,#2563eb)] text-white px-4 py-2 text-sm font-medium"
            >
              Start scanning
            </Link>
            <Link href="/docs" className="btn-secondary">
              Read the docs
            </Link>
          </div>
        </section>

        <footer className="border-t border-black/10 dark:border-white/10 pt-4 text-xs muted grid gap-2">
          <p>
            <strong>Related reading:</strong>{" "}
            <Link href="/blog/how-to-read-sbom" className="underline">
              How to Read an SBOM
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/cyclonedx-vs-spdx" className="underline">
              CycloneDX vs SPDX
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/sbom-requirements-2026" className="underline">
              SBOM Requirements in 2026
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
