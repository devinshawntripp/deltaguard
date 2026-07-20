import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-23";

const title = `Artifact Registry: Securing Your Build Outputs | ${APP_NAME}`;
const description =
  "What an artifact registry does, how Google Artifact Registry and its peers compare, and how to add scanning, signing, and cleanup policies that hold up.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "artifact registry",
    "google artifact registry",
    "container registry security",
    "artifact registry vulnerability scanning",
    "artifact repository",
    "gcloud artifacts",
    "registry cleanup policy",
    "immutable tags",
    "artifact registry vs container registry",
    "oci registry",
  ],
  alternates: { canonical: "/blog/artifact-registry" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/artifact-registry",
    images: ["/blog/artifact-registry.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/artifact-registry.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Artifact Registry: Securing Your Build Outputs",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/artifact-registry",
  image: "https://scanrook.io/blog/artifact-registry.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is an artifact registry?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An artifact registry is the storage and distribution system for the things your builds produce and consume - container images, language packages, OS packages, Helm charts, and generic binaries. It sits between CI and deployment, holds the immutable versions everything else references, and is the natural place to enforce access control, scanning, signing, and retention.",
      },
    },
    {
      "@type": "Question",
      name: "What is Google Artifact Registry?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Google Artifact Registry is Google Cloud's managed registry and the successor to the older Container Registry product. It handles container images alongside Maven, npm, Python, Go, Apt, and Yum packages, scopes repositories by region and format, uses standard IAM roles for access, and integrates with Google's Artifact Analysis for vulnerability scanning.",
      },
    },
    {
      "@type": "Question",
      name: "Does an artifact registry scan for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most managed registries offer built-in scanning as an optional feature - scan on push, plus continuous re-evaluation of already-stored images as new advisories publish. Coverage varies a lot by product, and registry-native scanning is usually a single-source view, so many teams run an independent scanner alongside it.",
      },
    },
    {
      "@type": "Question",
      name: "Should I use immutable tags?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes for anything you deploy. Immutable tags prevent a tag from being repointed at different content after the fact, which removes a whole class of confusion and a real attack path. Deploy by digest where you can - a digest is content-addressed and cannot be repointed at all.",
      },
    },
    {
      "@type": "Question",
      name: "How do I stop a registry growing forever?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use cleanup or retention policies, and write them conservatively. A typical pattern keeps the most recent N versions per package, keeps anything tagged as a release indefinitely, and deletes untagged manifests older than a short window. Always run a policy in dry-run mode first - a deletion rule that catches a production digest is not recoverable.",
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
            Artifact Registry: Securing What Your Builds Produce
          </h1>
          <p className="text-sm muted">Published October 23, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            An artifact registry is the least glamorous and most security-relevant component in a
            delivery pipeline. Everything you ship passes through it, everything you deploy is pulled
            from it, and it is the one place where a control applies to every artifact at once. This
            covers what the category does, how Google Artifact Registry and its peers differ, and the
            handful of settings that separate a registry from a liability.
          </p>
        </header>

        <img
          src="/blog/artifact-registry.jpg"
          alt="Artifact registry storing versioned container images and packages"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What an artifact registry does</h2>
          <p className="text-sm muted">
            A registry stores versioned, immutable build outputs and serves them over protocol-specific
            APIs. Container images use the OCI distribution API; Maven, npm, PyPI, Go modules, Apt, and
            Yum each have their own. A modern artifact registry speaks several of these at once, which
            is the main thing distinguishing it from a plain container registry.
          </p>
          <p className="text-sm muted">
            Three repository shapes show up across every product in the category, and knowing the
            vocabulary makes the docs much easier to read:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Standard (local) repositories</strong> hold artifacts you publish. This is where
              your own builds land.
            </li>
            <li>
              <strong>Remote (proxy) repositories</strong> cache an upstream such as Docker Hub, npm,
              or PyPI. They give you a stable pull path, protection against upstream outages and
              deletions, and a single choke point at which to scan third-party content before it
              reaches a build.
            </li>
            <li>
              <strong>Virtual repositories</strong> present several of the above behind one endpoint
              so consumers configure a single URL. Convenient, but be deliberate about resolution order
              &mdash; a virtual repo that prefers upstream over local is a{" "}
              <Link href="/blog/dependency-confusion" className="underline">
                dependency confusion
              </Link>{" "}
              vector.
            </li>
          </ul>
          <p className="text-sm muted">
            That third point is worth dwelling on. If an internal package name can also be resolved
            from a public index, and the virtual repository consults the public index first or falls
            back to it, an attacker can publish a higher version publicly and have your build pull it.
            Configure exclusion patterns so internal namespaces never resolve upstream.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Google Artifact Registry</h2>
          <p className="text-sm muted">
            Google Artifact Registry is the managed registry on Google Cloud and the replacement for
            the older Container Registry service. Repositories are created per region and per format,
            access is controlled through normal IAM roles, and image paths follow a predictable
            location-scoped hostname:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`# Create a Docker-format repository in a region
gcloud artifacts repositories create app-images \\
  --repository-format=docker \\
  --location=us-central1 \\
  --description="Application container images"

# Let the local docker client authenticate to that host
gcloud auth configure-docker us-central1-docker.pkg.dev

# Tag and push
docker tag myapp:1.0 \\
  us-central1-docker.pkg.dev/my-project/app-images/myapp:1.0
docker push us-central1-docker.pkg.dev/my-project/app-images/myapp:1.0

# Inspect what is stored, including scan results
gcloud artifacts docker images list \\
  us-central1-docker.pkg.dev/my-project/app-images

gcloud artifacts docker images describe \\
  us-central1-docker.pkg.dev/my-project/app-images/myapp:1.0 \\
  --show-package-vulnerability`}
          </pre>
          <p className="text-sm muted">
            The security-relevant pieces are the IAM roles, the vulnerability scanning integration, and
            cleanup policies. IAM roles split cleanly into reader, writer, repository admin, and admin
            &mdash; and the split matters, because the common failure is granting a CI service account
            broad admin on a project when it only needs writer on one repository. Scanning is provided
            by Google&apos;s Artifact Analysis, which can scan on push and continuously re-evaluate
            stored images as advisories publish, with results readable from the CLI as shown above.
          </p>
        </section>

        <img
          src="/blog/artifact-registry-2.jpg"
          alt="Artifact promotion between registry repositories after vulnerability scanning"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            How the major options actually differ
          </h2>
          <p className="text-sm muted">
            Feature lists converge; deployment model and format breadth do not. The honest summary:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Registry</th>
                  <th className="text-left py-2 pr-4 font-semibold">Model</th>
                  <th className="text-left py-2 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">
                    <strong>Google Artifact Registry</strong>
                  </td>
                  <td className="py-2 pr-4 align-top">Managed, GCP</td>
                  <td className="py-2 align-top">
                    Multi-format, regional repos, IAM-native, integrated scanning and Binary
                    Authorization
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">
                    <strong>Amazon ECR</strong>
                  </td>
                  <td className="py-2 pr-4 align-top">Managed, AWS</td>
                  <td className="py-2 align-top">
                    OCI-focused, basic and enhanced scan tiers, tight IAM and EKS integration
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">
                    <strong>Harbor</strong>
                  </td>
                  <td className="py-2 pr-4 align-top">Self-hosted, CNCF</td>
                  <td className="py-2 align-top">
                    Pluggable scanners, replication, projects and quotas, runs anywhere including
                    air-gapped
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">
                    <strong>Artifactory / Nexus</strong>
                  </td>
                  <td className="py-2 pr-4 align-top">Self-hosted or SaaS</td>
                  <td className="py-2 align-top">
                    Widest format coverage, mature virtual and remote repos, commercial scanning
                    add-ons
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            If your workloads are already on one cloud, the native registry is usually the right
            default: the IAM story is simpler and pulls stay on the internal network.{" "}
            <Link href="/blog/harbor-registry" className="underline">
              Harbor
            </Link>{" "}
            is the strongest self-hosted option when you need to run on-premises or across clouds, and{" "}
            <Link href="/blog/jfrog-xray" className="underline">
              Artifactory with Xray
            </Link>{" "}
            wins on format breadth if you are storing more than containers. We cover the AWS side in{" "}
            <Link href="/blog/ecr-image-scanning" className="underline">
              ECR image scanning
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            The controls that actually matter
          </h2>
          <p className="text-sm muted">
            Registry hardening is short. Most of the value comes from five things.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 200"
              role="img"
              aria-label="Registry control points: authentication and least-privilege on push, scanning and signing on ingest, promotion gates between repositories, immutability on release tags, and cleanup policies on retention"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <defs>
                <marker
                  id="ar-arrow"
                  markerWidth="9"
                  markerHeight="9"
                  refX="6"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              <line
                x1={20}
                y1={60}
                x2={676}
                y2={60}
                stroke="currentColor"
                strokeWidth={2}
                strokeOpacity={0.35}
                markerEnd="url(#ar-arrow)"
              />
              {[
                { x: 20, label: "CI push", ctrl: "least-privilege writer" },
                { x: 178, label: "Ingest", ctrl: "scan + sign" },
                { x: 336, label: "Promote", ctrl: "dev to prod gate" },
                { x: 494, label: "Release", ctrl: "immutable tags" },
                { x: 616, label: "Age out", ctrl: "cleanup policy" },
              ].map((s) => (
                <g key={s.label}>
                  <circle
                    cx={s.x + 30}
                    cy={60}
                    r={9}
                    fill="var(--dg-accent,#2563eb)"
                    fillOpacity={0.18}
                    stroke="currentColor"
                    strokeOpacity={0.6}
                  />
                  <text
                    x={s.x + 30}
                    y={40}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="currentColor"
                  >
                    {s.label}
                  </text>
                  <foreignObject x={s.x - 22} y={78} width={104} height={44}>
                    <div
                      style={{
                        fontSize: "10px",
                        lineHeight: 1.3,
                        textAlign: "center",
                        opacity: 0.72,
                      }}
                    >
                      {s.ctrl}
                    </div>
                  </foreignObject>
                </g>
              ))}
              <rect
                x={20}
                y={140}
                width={656}
                height={34}
                rx={6}
                fill="currentColor"
                fillOpacity={0.05}
                stroke="currentColor"
                strokeOpacity={0.25}
              />
              <text
                x={348}
                y={161}
                textAnchor="middle"
                fontSize="11"
                fill="currentColor"
                fillOpacity={0.75}
              >
                Continuous re-evaluation runs underneath all of it &mdash; stored artifacts do not
                change, advisories do.
              </text>
            </svg>
            <figcaption className="text-xs muted mt-3">
              Where registry controls attach along an artifact&apos;s life. The stages are sequential;
              re-evaluation is not.
            </figcaption>
          </div>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Least-privilege push credentials.</strong> A CI identity should be a writer on
              one repository, not an admin on the project. Prefer short-lived federated credentials
              over long-lived keys wherever the platform supports it.
            </li>
            <li>
              <strong>Immutable release tags, deploy by digest.</strong> A digest is content-addressed
              and cannot be repointed; a mutable tag can silently become different bytes.
            </li>
            <li>
              <strong>Scan on push and continuously.</strong> Push-time results go stale the moment a
              new advisory lands. Continuous re-evaluation of stored artifacts is the feature worth
              paying for.
            </li>
            <li>
              <strong>Sign and verify.</strong> Signing at build and verifying at admission closes the
              gap between &ldquo;this image is in our registry&rdquo; and &ldquo;we produced this
              image&rdquo;. See{" "}
              <Link href="/blog/sigstore-cosign-container-signing" className="underline">
                Sigstore and Cosign
              </Link>{" "}
              for the mechanics.
            </li>
            <li>
              <strong>Cleanup policies, dry-run first.</strong> Keep recent versions and tagged
              releases, delete untagged manifests after a short window &mdash; and always preview what
              a policy would remove before enabling it.
            </li>
          </ul>
        </section>

        <img
          src="/blog/artifact-registry-3.jpg"
          alt="Signing and verifying artifacts stored in a registry"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Proxying upstreams is a security control
          </h2>
          <p className="text-sm muted">
            Remote repositories usually get introduced for reliability reasons &mdash; a build that
            pulls straight from a public index breaks when that index is slow, rate-limits you, or
            when a maintainer yanks a version. Routing through a caching proxy fixes all of that. The
            security benefit is larger and less obvious.
          </p>
          <p className="text-sm muted">
            A proxy gives you one place where every third-party dependency entering your organisation
            can be observed and inspected. You get a durable copy of exactly what you consumed, which
            matters when you need to reconstruct what a build used six months ago and the upstream
            version is gone. You get a list of what your builds actually pull, which is usually longer
            and stranger than anyone expects. And you get a hook for scanning external content before
            it reaches a developer machine or a build agent &mdash; the point at which{" "}
            <Link href="/blog/typosquatting" className="underline">
              typosquatted packages
            </Link>{" "}
            are cheapest to catch.
          </p>
          <p className="text-sm muted">
            Two configuration details do most of the work. Pin internal namespaces so they never
            resolve upstream, closing the dependency confusion path. And keep cached copies rather
            than passing through transparently &mdash; a cache that re-fetches on every request gives
            you the availability problem back and none of the forensic value.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Promotion beats blocking every push
          </h2>
          <p className="text-sm muted">
            The pattern that survives contact with real teams is promotion, not a hard gate at push
            time. Every build pushes to a development repository regardless of findings &mdash;
            blocking there just means developers lose the ability to debug their own image. Promotion
            into the repository that production pulls from is where the policy lives: no unfixed
            critical or high vulnerabilities, a valid signature, an SBOM attestation present.
          </p>
          <p className="text-sm muted">
            Enforcement then happens twice, at promotion and again at deploy. Cluster-side admission
            control that verifies signature and provenance before a pod starts is the backstop for
            anything that slipped past the registry, which we cover in{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              admission control and image scanning
            </Link>
            . Two independent checks on different systems is meaningfully stronger than one very
            strict check in a single place.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Registry-native scanning is convenient and you should leave it on. It is also, in every
            product we have looked at, a single-source view: one advisory pipeline, one opinion per
            package, and results you cannot easily reproduce outside the vendor&apos;s console.
          </p>
          <p className="text-sm muted">
            ScanRook is the independent second read on the same artifacts. Export an image to a
            tarball in your promotion job and scan it: we read the real package databases inside the
            image and match every package against OSV, NVD, and Red Hat OVAL in parallel, labelling
            each finding with its source and a confidence tier. Because the analysis is local to the
            job, the same command produces the same result in a private or air-gapped environment,
            which is not true of most registry-native scanners. Run it as the promotion gate and keep
            the registry&apos;s continuous scanning as the always-on view.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is an artifact registry?</h3>
              <p className="text-sm muted mt-1">
                Storage and distribution for versioned build outputs &mdash; container images and
                language or OS packages &mdash; plus the access control, scanning, and retention that
                apply to them.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">
                How does Google Artifact Registry differ from Container Registry?
              </h3>
              <p className="text-sm muted mt-1">
                It is the successor product: multi-format rather than containers only, with regional
                repositories, standard IAM roles, and integrated vulnerability analysis.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should I block pushes on findings?</h3>
              <p className="text-sm muted mt-1">
                Usually not. Let development pushes through and gate promotion into the production
                repository instead, then verify again at admission time.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Are cleanup policies safe?</h3>
              <p className="text-sm muted mt-1">
                Only if you preview them. Keep tagged releases and recent versions, delete untagged
                manifests after a window, and always dry-run before enabling.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Add an independent check at promotion</h3>
          <p className="text-sm muted leading-relaxed">
            Export an image from your registry and scan it with ScanRook. Multi-source matching, every
            finding labelled with its origin and confidence tier, and identical results whether the job
            runs in the cloud or air-gapped.
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
            <Link href="/blog/harbor-registry" className="underline">
              Harbor Registry Security
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/ecr-image-scanning" className="underline">
              ECR Image Scanning
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/software-supply-chain-security" className="underline">
              Software Supply Chain Security
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
