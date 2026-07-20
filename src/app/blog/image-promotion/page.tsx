import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-16";

const title = `Image Promotion: Moving Containers Between Environments | ${APP_NAME}`;
const description =
  "How image promotion works: build once, promote by digest through dev, staging and production registries, and enforce the right gate at every hop.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "image promotion",
    "container image promotion",
    "docker image promotion pipeline",
    "promote image between environments",
    "build once promote everywhere",
    "image digest pinning",
    "registry promotion workflow",
    "staging to production container",
    "immutable container tags",
    "container release process",
  ],
  alternates: { canonical: "/blog/image-promotion" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/image-promotion",
    images: ["/blog/image-promotion.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/image-promotion.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Image Promotion: Moving Containers Safely Between Environments",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/image-promotion",
  image: "https://scanrook.io/blog/image-promotion.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is image promotion?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Image promotion is the practice of building a container image exactly once and then moving that same artifact through your environments — development, staging, production — by copying or retagging it rather than rebuilding it. The image content, identified by its digest, never changes as it advances, so what you tested is provably what you ship.",
      },
    },
    {
      "@type": "Question",
      name: "Why not just rebuild the image for each environment?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Rebuilding produces a different artifact. Base image tags move, upstream package repositories change, and build caches vary, so a rebuild from the same commit can pull different dependency versions. Any scan result, test run, or signature attached to the earlier build no longer describes the thing you are deploying.",
      },
    },
    {
      "@type": "Question",
      name: "How do you promote an image without rebuilding it?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use a registry copy tool that moves manifests and layers directly, such as crane copy or skopeo copy. Both transfer the exact bytes between repositories and preserve the digest. If the source and target repositories live in the same registry, most layers are already present and the copy is close to instantaneous.",
      },
    },
    {
      "@type": "Question",
      name: "Should promotion gates re-scan the image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, because the image does not change but the vulnerability data does. An image that was clean when built can pick up several critical findings a week later purely because new advisories were published. Re-scanning at each promotion gate, and on a schedule for whatever is already in production, is how you catch that.",
      },
    },
    {
      "@type": "Question",
      name: "Should production deployments reference tags or digests?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Digests. A tag is a mutable pointer that anyone with push access can move, so a manifest that says image:1.4.2 does not guarantee which bytes a node will pull. Referencing image@sha256:... makes the deployment reproducible and makes the promotion record meaningful.",
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
            Image Promotion: Moving Containers Safely Between Environments
          </h1>
          <p className="text-sm muted">Published December 16, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Image promotion is the discipline of building a container image once and then advancing
            that exact artifact through your environments instead of rebuilding it at every stage.
            It sounds like a small process detail. In practice it is the difference between a
            release pipeline whose test results mean something and one where every environment
            quietly ships a slightly different thing.
          </p>
        </header>

        <img
          src="/blog/image-promotion.jpg"
          alt="Container image promotion through environment gates"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What image promotion actually means</h2>
          <p className="text-sm muted">
            A promotion pipeline has one build step. That build produces an image with a content
            digest &mdash; a SHA-256 hash of its manifest &mdash; and from that moment on, the digest
            is the identity of the release candidate. Everything downstream refers to it. When the
            candidate passes its dev gate, you copy it into the staging repository. When it passes
            staging, you copy it into production. The bytes never change; only the location and the
            tags attached to it do.
          </p>
          <p className="text-sm muted">
            The alternative, which is still extremely common, is to run a build per environment,
            usually from the same git commit with different build arguments. That feels equivalent
            and is not. Base image tags move underneath you, distribution package mirrors publish new
            versions daily, and language lockfiles are not always as locked as people assume. Two
            builds from the same commit a day apart routinely differ in dozens of installed package
            versions. Every test result, every scan report, and every signature from the earlier
            build then describes an artifact you are not deploying.
          </p>
          <p className="text-sm muted">
            Promotion also gives you something to point at during an incident. &ldquo;Which build is
            in production?&rdquo; has exactly one answer, and it is a digest you can pull and inspect
            anywhere.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The shape of a promotion pipeline</h2>
          <p className="text-sm muted">
            Most teams settle on a small number of repositories with different access rules, and
            promotion is a controlled copy between them. Each hop is guarded by a gate that has to
            pass before the copy is allowed.
          </p>

          <figure className="grid gap-2">
            <div className="overflow-x-auto surface-card p-4">
              <svg
                viewBox="0 0 720 240"
                role="img"
                aria-label="Image promotion flow: one build produces a digest that is copied from a candidate repository into staging and then production, with a gate before each copy"
                className="w-full"
                style={{ minWidth: 600 }}
              >
                <defs>
                  <marker
                    id="ip-arrow"
                    markerWidth="9"
                    markerHeight="9"
                    refX="6"
                    refY="3"
                    orient="auto"
                  >
                    <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                  </marker>
                </defs>

                <rect
                  x={8}
                  y={30}
                  width={132}
                  height={58}
                  rx={8}
                  fill="currentColor"
                  fillOpacity={0.06}
                  stroke="currentColor"
                  strokeOpacity={0.45}
                />
                <text x={74} y={54} textAnchor="middle" fontSize="13.5" fontWeight="600" fill="currentColor">
                  Build (once)
                </text>
                <text x={74} y={73} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>
                  produces a digest
                </text>

                {[
                  { x: 200, label: "candidate", sub: "dev repo" },
                  { x: 390, label: "staging", sub: "staging repo" },
                  { x: 580, label: "production", sub: "prod repo", hot: true },
                ].map((b) => (
                  <g key={b.label}>
                    <rect
                      x={b.x}
                      y={30}
                      width={132}
                      height={58}
                      rx={8}
                      fill={b.hot ? "var(--dg-accent,#2563eb)" : "transparent"}
                      fillOpacity={b.hot ? 0.12 : 1}
                      stroke="currentColor"
                      strokeOpacity={0.45}
                    />
                    <text x={b.x + 66} y={54} textAnchor="middle" fontSize="13.5" fontWeight="600" fill="currentColor">
                      {b.label}
                    </text>
                    <text x={b.x + 66} y={73} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>
                      {b.sub}
                    </text>
                  </g>
                ))}

                {[
                  { x: 148, gate: "unit + scan" },
                  { x: 338, gate: "integration + policy" },
                  { x: 528, gate: "sign + approve" },
                ].map((g) => (
                  <g key={g.x}>
                    <line
                      x1={g.x}
                      y1={59}
                      x2={g.x + 44}
                      y2={59}
                      stroke="currentColor"
                      strokeWidth={2}
                      markerEnd="url(#ip-arrow)"
                    />
                    <circle cx={g.x + 22} cy={107} r={5} fill="currentColor" fillOpacity={0.45} />
                    <line
                      x1={g.x + 22}
                      y1={102}
                      x2={g.x + 22}
                      y2={66}
                      stroke="currentColor"
                      strokeWidth={1.5}
                      strokeOpacity={0.5}
                      strokeDasharray="3 3"
                    />
                    <text
                      x={g.x + 22}
                      y={128}
                      textAnchor="middle"
                      fontSize="10.5"
                      fill="currentColor"
                      fillOpacity={0.75}
                    >
                      {g.gate}
                    </text>
                  </g>
                ))}

                <rect
                  x={8}
                  y={172}
                  width={704}
                  height={34}
                  rx={6}
                  fill="currentColor"
                  fillOpacity={0.05}
                  stroke="currentColor"
                  strokeOpacity={0.28}
                />
                <text x={360} y={193} textAnchor="middle" fontSize="11.5" fill="currentColor" fillOpacity={0.75}>
                  one immutable digest travels the whole way &mdash; only tags and location change
                </text>
                <text x={360} y={228} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.5}>
                  Illustrative structure; gate composition varies by team.
                </text>
              </svg>
            </div>
            <figcaption className="text-xs muted">
              A promotion pipeline: a single build, three repositories, and a gate in front of every
              copy. The artifact is identical at each stage.
            </figcaption>
          </figure>

          <p className="text-sm muted">
            The repositories matter as much as the gates. A production repository that only a
            promotion job can push to is a meaningful control &mdash; it means nothing reaches
            production without passing through the gate, regardless of who has credentials to the dev
            registry. If you run{" "}
            <Link href="/blog/harbor-registry" className="underline">
              Harbor
            </Link>{" "}
            or a cloud registry like{" "}
            <Link href="/blog/ecr-image-scanning" className="underline">
              ECR
            </Link>
            , this is straightforward project- or repository-level IAM.
          </p>
        </section>

        <img
          src="/blog/image-promotion-2.jpg"
          alt="Registry tiers used for container image promotion between environments"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Promoting an image without rebuilding it</h2>
          <p className="text-sm muted">
            The mechanical part is easy. Two well-established tools copy image manifests and layers
            between repositories without ever unpacking them, which means the digest is preserved:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg border border-black/10 dark:border-white/10 p-4 bg-black/[.03] dark:bg-white/[.03]">
{`# resolve the candidate to an immutable digest first
DIGEST=$(crane digest registry.example.com/candidate/api:build-4821)
echo "promoting registry.example.com/candidate/api@\${DIGEST}"

# copy the exact artifact into the staging repository
crane copy \\
  registry.example.com/candidate/api@\${DIGEST} \\
  registry.example.com/staging/api:2026.12.16

# the equivalent with skopeo
skopeo copy \\
  docker://registry.example.com/candidate/api@\${DIGEST} \\
  docker://registry.example.com/staging/api:2026.12.16`}
          </pre>
          <p className="text-sm muted">
            Both tools speak the registry API directly, so a copy inside one registry usually mounts
            existing layers rather than re-uploading them. Promotion is therefore fast even for large
            images, which removes the main practical excuse for rebuilding.
          </p>
          <p className="text-sm muted">
            If you would rather keep a single repository and use tags to express stage, you can
            simply add a tag to an existing digest instead of copying:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg border border-black/10 dark:border-white/10 p-4 bg-black/[.03] dark:bg-white/[.03]">
{`crane tag registry.example.com/api@\${DIGEST} prod

# or, without any local daemon
docker buildx imagetools create \\
  --tag registry.example.com/api:prod \\
  registry.example.com/api@\${DIGEST}`}
          </pre>
          <p className="text-sm muted">
            The single-repository approach is simpler but gives you weaker access separation, since
            anyone who can push to the repository can move the <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">prod</code>{" "}
            tag. Separate repositories with distinct push permissions are the stronger pattern when
            the environments have genuinely different risk profiles.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What to gate on at each hop</h2>
          <p className="text-sm muted">
            Gates should get stricter as the image moves right, and every gate should produce a
            durable record attached to the digest rather than to a branch or a build number.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Candidate &rarr; staging.</strong> Tests pass, an SBOM is generated and stored,
              and a vulnerability scan runs with a threshold your team can actually hold &mdash;
              usually &ldquo;no new criticals with a fix available.&rdquo; Scanning here is the cheap
              place to catch a bad base image bump.
            </li>
            <li>
              <strong>Staging &rarr; production.</strong> Integration and smoke tests against the real
              artifact, plus policy checks: does it run as non-root, is the base image on the approved
              list, is the SBOM complete? This is also where signing belongs, so the production
              artifact carries a verifiable attestation.
            </li>
            <li>
              <strong>Production admission.</strong> The cluster itself verifies the signature and
              refuses unsigned or unknown digests. Promotion is only a real control if something at
              the end enforces it &mdash; see{" "}
              <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
                admission control for image scanning
              </Link>{" "}
              for the enforcement side.
            </li>
          </ul>
          <p className="text-sm muted">
            Signing is what ties promotion to deployment. Signing the digest at the last gate with{" "}
            <Link href="/blog/sigstore-cosign-container-signing" className="underline">
              Cosign
            </Link>{" "}
            and verifying that signature at admission means an image that skipped the pipeline cannot
            run, even if someone pushes it straight into the production repository. Attaching build
            provenance in the same step, as described in the{" "}
            <Link href="/blog/slsa-framework-explained" className="underline">
              SLSA framework
            </Link>
            , makes the promotion record auditable rather than merely conventional.
          </p>
        </section>

        <img
          src="/blog/image-promotion-3.jpg"
          alt="Immutable image digest pinning during container promotion"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Deploy by digest, not by tag</h2>
          <p className="text-sm muted">
            All of this collapses if the deployment manifest references a mutable tag. A Kubernetes
            Deployment pinned to <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">api:prod</code>{" "}
            will happily pull whatever that tag points at when a pod reschedules, which may not be
            what was promoted. Pin the digest instead:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg border border-black/10 dark:border-white/10 p-4 bg-black/[.03] dark:bg-white/[.03]">
{`spec:
  containers:
    - name: api
      image: registry.example.com/prod/api@sha256:9f2c1a...  # not :prod
      imagePullPolicy: IfNotPresent`}
          </pre>
          <p className="text-sm muted">
            Keep a human-readable tag alongside the digest for convenience &mdash; people need to
            know that <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">9f2c1a</code>{" "}
            is release 2026.12.16 &mdash; but let the digest be the thing the cluster resolves. A
            promotion job that writes the digest into the manifest and opens a pull request gives you
            both traceability and a review step for free.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The image stops changing; the risk does not</h2>
          <p className="text-sm muted">
            The most misunderstood consequence of build-once promotion is that a clean scan has a
            shelf life. The artifact is frozen, but vulnerability data is not: advisories are
            published every day against packages that were already inside your image. An image that
            passed its gate on Monday can legitimately have new critical findings on Friday without a
            single byte changing.
          </p>
          <p className="text-sm muted">
            That means two things in practice. First, re-scan at each promotion gate rather than
            trusting the result carried over from the previous stage &mdash; the gap between build and
            production deploy is often long enough to matter. Second, scan what is already running on
            a schedule, and treat a newly critical production image as a rebuild trigger rather than
            a ticket to age. Our guide to{" "}
            <Link href="/blog/automate-docker-base-image-updates" className="underline">
              automating base image updates
            </Link>{" "}
            covers the rebuild half of that loop, and{" "}
            <Link href="/blog/container-scanning-best-practices" className="underline">
              container scanning best practices
            </Link>{" "}
            covers where scans belong in a pipeline generally.
          </p>
          <p className="text-sm muted">
            A promotion pipeline is also the natural place to use{" "}
            <Link href="/blog/vex-explained" className="underline">
              VEX
            </Link>{" "}
            statements. Because the digest is stable, an exploitability assessment you record once
            stays valid for the whole life of that artifact, instead of being re-litigated on every
            rebuild.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Common ways promotion goes wrong</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Mutable tags in the promotion record.</strong> If your audit log says
              &ldquo;promoted api:1.4.2&rdquo; and nothing else, you cannot prove later what shipped.
              Record the digest.
            </li>
            <li>
              <strong>Rebuilding &ldquo;just for prod.&rdquo;</strong> Usually introduced to inject
              production config at build time. Inject configuration at runtime instead and keep one
              artifact.
            </li>
            <li>
              <strong>Environment-specific base images.</strong> A hardened base for production and a
              convenient one for dev guarantees your tests exercise different libraries than
              production runs.
            </li>
            <li>
              <strong>Gates that never fail.</strong> A scan gate with a threshold nobody enforces is
              documentation, not a control. Pick a threshold you will hold and use a documented
              exception path for the rest.
            </li>
            <li>
              <strong>No expiry on candidates.</strong> Candidate repositories grow without limit.
              Set a retention policy that keeps promoted digests forever and expires unpromoted builds
              after a few weeks.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook is the scan step inside the gates, not the promotion machinery itself &mdash;
            your registry and CI system already handle the copying. What we try to do well is make the
            gate decision defensible. Every finding carries the source it came from (OSV, NVD, or Red
            Hat OVAL) and a confidence tier, which matters when a scan result is the thing blocking a
            release and someone needs to judge whether the block is real.
          </p>
          <p className="text-sm muted">
            The practical pattern is to scan the exported image tarball at each gate, keyed by digest,
            and compare against the previous stage&apos;s report so the gate can talk about{" "}
            <em>new</em> findings rather than the absolute count. Because promotion keeps the digest
            stable, re-scanning the same digest later is a clean before-and-after: any difference comes
            from newly published advisories, not from a different artifact. See{" "}
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              how to scan a Docker image
            </Link>{" "}
            for the mechanics, or the <Link href="/docs" className="underline">docs</Link> for CI usage.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is image promotion?</h3>
              <p className="text-sm muted mt-1">
                Building a container image once and advancing that exact artifact &mdash; identified by
                its digest &mdash; through dev, staging, and production by copying or retagging rather
                than rebuilding.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why is rebuilding per environment a problem?</h3>
              <p className="text-sm muted mt-1">
                A rebuild from the same commit can resolve different base layers and package versions,
                so earlier test results, scans, and signatures no longer describe what you deploy.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Which tools copy images without rebuilding?</h3>
              <p className="text-sm muted mt-1">
                <code className="text-xs">crane copy</code> and{" "}
                <code className="text-xs">skopeo copy</code> both move manifests and layers directly
                between repositories and preserve the digest.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Do I need to re-scan at every gate?</h3>
              <p className="text-sm muted mt-1">
                Yes. The image is frozen but advisory data is not, so the same digest can gain new
                critical findings between stages and after it reaches production.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Put a real gate in front of production</h3>
          <p className="text-sm muted leading-relaxed">
            Scan the digest you are about to promote and see what a multi-source scan surfaces that a
            single-database tool does not. Every finding is traceable to its advisory source, so the
            gate decision is one you can explain.
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
            <Link href="/blog/sigstore-cosign-container-signing" className="underline">
              Signing Containers with Cosign
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              Kubernetes Admission Control for Image Scanning
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
