import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-30";

const title = `Private Registry Security: Hardening Container Registries | ${APP_NAME}`;
const description =
  "How to secure a private container registry: authentication, tag immutability, signing, proxy caching, retention and scanning at push. Tool-agnostic guidance.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "private registry",
    "private container registry",
    "private docker registry",
    "container registry security",
    "registry authentication",
    "harbor private registry",
    "tag immutability",
    "registry image signing",
    "pull through cache",
    "registry vulnerability scanning",
  ],
  alternates: { canonical: "/blog/private-registry-security" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/private-registry-security",
    images: ["/blog/private-registry-security.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/private-registry-security.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Private Registry Security: Hardening Container Registries",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/private-registry-security",
  image: "https://scanrook.io/blog/private-registry-security.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Why run a private container registry?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A private registry gives you a single chokepoint you control between build and runtime. It lets you enforce scanning and signing before an image is pullable, removes a hard dependency on a public registry's availability and rate limits, keeps proprietary images off the public internet, and produces an audit trail of who pushed and pulled what.",
      },
    },
    {
      "@type": "Question",
      name: "Is a private registry more secure than Docker Hub?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not automatically. A badly configured private registry with a shared admin credential, mutable tags and no scanning is worse than a well-governed public repository. The advantage of a private registry is control - you can enforce policies a public registry will not enforce for you - but that advantage only exists if you actually configure them.",
      },
    },
    {
      "@type": "Question",
      name: "What is tag immutability and why does it matter?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tag immutability prevents an existing tag from being repointed at a different image. Without it, the digest behind a tag like v1.4.2 can silently change, so what you tested is not necessarily what you deployed, and rollbacks may not return to the image you expect. Most registries support immutability rules scoped by repository and tag pattern.",
      },
    },
    {
      "@type": "Question",
      name: "How should CI authenticate to a private registry?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Prefer short-lived, workload-scoped credentials over static passwords. In cloud registries that means an IAM role, managed identity or OIDC federation from your CI provider. In self-hosted registries it means a robot or service account scoped to one project with push rights only where needed. A long-lived admin credential in a CI variable is the credential most likely to leak.",
      },
    },
    {
      "@type": "Question",
      name: "Should scanning happen at push or in the build pipeline?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both, for different reasons. Scanning in the build gives fast feedback to the developer who caused the finding and can fail the build before an image exists. Scanning at the registry re-evaluates images as new advisories are published, catching CVEs disclosed after the image was built - which is most of them over an image's lifetime.",
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
            Private Registry Security: Hardening Container Registries
          </h1>
          <p className="text-sm muted">Published November 30, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            A private registry is the narrowest point in most container supply chains: everything you
            build passes through it, and everything you run comes out of it. That makes it the single
            best place to enforce policy &mdash; and a high-value target if it is soft. This is what to
            configure, roughly in order of how much risk each control removes, and it applies whether
            you run Harbor, ECR, ACR, Artifactory or plain distribution.
          </p>
        </header>

        <img
          src="/blog/private-registry-security.jpg"
          alt="Private container registry secured behind an access-controlled gateway"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The registry as a chokepoint</h2>
          <p className="text-sm muted">
            The reason to run a private registry is not secrecy. Most images are not commercially
            sensitive. The reason is <em>control at a single point</em>. Because every image must pass
            through it, the registry is where you can make guarantees that would otherwise have to be
            re-established in every pipeline and every cluster.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 240"
              role="img"
              aria-label="A private registry sits between build and runtime, with four gates: authenticated push, scan on push, signature attached, and verified admission on pull"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <defs>
                <marker id="reg-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>

              <rect x={8} y={40} width={120} height={56} rx={8} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.4} />
              <text x={68} y={65} textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">CI build</text>
              <text x={68} y={83} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>image produced</text>

              <rect x={265} y={26} width={170} height={84} rx={8} fill="var(--dg-accent,#2563eb)" fillOpacity={0.12} stroke="currentColor" strokeOpacity={0.5} />
              <text x={350} y={54} textAnchor="middle" fontSize="14" fontWeight="600" fill="currentColor">Private registry</text>
              <text x={350} y={73} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.65}>immutable tags</text>
              <text x={350} y={90} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.65}>retention + GC</text>

              <rect x={572} y={40} width={120} height={56} rx={8} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.4} />
              <text x={632} y={65} textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">Cluster</text>
              <text x={632} y={83} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>pull + admit</text>

              <line x1={132} y1={68} x2={261} y2={68} stroke="currentColor" strokeWidth={2} markerEnd="url(#reg-arrow)" />
              <line x1={439} y1={68} x2={568} y2={68} stroke="currentColor" strokeWidth={2} markerEnd="url(#reg-arrow)" />

              {[
                { x: 30, label: "1. Authenticated push", sub: "short-lived, scoped creds" },
                { x: 205, label: "2. Scan on push", sub: "block above threshold" },
                { x: 380, label: "3. Sign the digest", sub: "cosign / notation" },
                { x: 545, label: "4. Verify on pull", sub: "admission policy" },
              ].map((g) => (
                <g key={g.label}>
                  <rect x={g.x} y={150} width={140} height={48} rx={6} fill="currentColor" fillOpacity={0.04} stroke="currentColor" strokeOpacity={0.3} />
                  <text x={g.x + 70} y={170} textAnchor="middle" fontSize="11" fontWeight="600" fill="currentColor">{g.label}</text>
                  <text x={g.x + 70} y={187} textAnchor="middle" fontSize="9.5" fill="currentColor" fillOpacity={0.6}>{g.sub}</text>
                </g>
              ))}
              <line x1={100} y1={148} x2={130} y2={100} stroke="currentColor" strokeWidth={1.2} strokeOpacity={0.4} strokeDasharray="4 3" />
              <line x1={275} y1={148} x2={310} y2={112} stroke="currentColor" strokeWidth={1.2} strokeOpacity={0.4} strokeDasharray="4 3" />
              <line x1={450} y1={148} x2={400} y2={112} stroke="currentColor" strokeWidth={1.2} strokeOpacity={0.4} strokeDasharray="4 3" />
              <line x1={615} y1={148} x2={620} y2={100} stroke="currentColor" strokeWidth={1.2} strokeOpacity={0.4} strokeDasharray="4 3" />
            </svg>
            <figcaption className="text-xs muted mt-3">
              Four gates around a private registry. Each is independently useful; together they mean an
              image that reaches a node has been authenticated, assessed, signed and verified.
            </figcaption>
          </div>
          <p className="text-sm muted">
            The honest caveat: none of this is automatic. A private registry with a shared admin
            password, mutable tags and no scanning is a worse supply chain than a well-governed public
            repository. The registry gives you the <em>ability</em> to enforce; enforcement is still
            configuration you have to write.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Authentication: kill the static credential</h2>
          <p className="text-sm muted">
            Registry credentials leak the same way every other credential leaks &mdash; a CI variable
            copied into a script, a{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.dockerconfigjson</code>{" "}
            Secret readable by any pod in the namespace, a laptop with a stale{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">~/.docker/config.json</code>.
            The fix is to stop having a long-lived credential to leak.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Cloud registries:</strong> use the platform&apos;s workload identity. ECR pulls
              via an IAM role attached to the node or service account; ACR via a managed identity with
              the AcrPull role; Artifact Registry via a Google service account. No{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">imagePullSecrets</code>{" "}
              needed, no password to rotate.
            </li>
            <li>
              <strong>CI push:</strong> use OIDC federation from your CI provider to a role scoped to
              exactly the repositories that job is allowed to push. GitHub Actions, GitLab CI and most
              modern runners all support this. A static registry password in a CI secret should be a
              last resort.
            </li>
            <li>
              <strong>Self-hosted registries:</strong> use robot or service accounts scoped to one
              project, with an expiry, and separate read-only pull accounts from push accounts. Most
              workloads need pull only; almost nothing needs both.
            </li>
            <li>
              <strong>Never</strong> add a registry to{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">insecure-registries</code>.
              That disables TLS verification and turns every pull into an opportunity for someone on
              the path to substitute an image. If certificate management is the obstacle, fix
              certificate management.
            </li>
          </ul>
          <p className="text-sm muted">
            Also worth doing: put the registry behind a private endpoint or VPC endpoint if your
            platform offers one, so the data path never traverses the public internet even when
            authentication would have held.
          </p>
        </section>

        <img
          src="/blog/private-registry-security-2.jpg"
          alt="Signed container artifacts with cryptographic seals stored in a private registry"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Immutability and digests</h2>
          <p className="text-sm muted">
            A tag is a mutable pointer. Nothing in the registry protocol stops someone &mdash; or a
            misconfigured pipeline &mdash; from pushing a different image to{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">v1.4.2</code>{" "}
            tomorrow. When that happens, the image you tested is not the image you deployed, your
            rollback target has quietly moved, and your scan results describe something that no longer
            exists.
          </p>
          <p className="text-sm muted">Two controls, and you want both:</p>
          <pre className="text-xs rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4 overflow-x-auto"><code>{`# 1. Registry-side: enable tag immutability rules for release tags.
#    Most registries let you scope this by repository and tag pattern,
#    e.g. immutable for "v*" while leaving "dev-*" mutable.

# 2. Consumer-side: pin by digest in manifests, not by tag.
image: registry.internal/team/billing-api@sha256:9b2c...e41a

# Resolve the digest for a tag you trust:
crane digest registry.internal/team/billing-api:v1.4.2
# or
docker buildx imagetools inspect registry.internal/team/billing-api:v1.4.2`}</code></pre>
          <p className="text-sm muted">
            Digest pinning has a real cost &mdash; a bot has to open pull requests to move pins forward,
            or they rot. That is a solvable automation problem, and it is much smaller than the problem
            of not knowing what is running. Our post on{" "}
            <Link href="/blog/automate-docker-base-image-updates" className="underline">
              automating base image updates
            </Link>{" "}
            covers the mechanics.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Signing, and actually verifying</h2>
          <p className="text-sm muted">
            Signing an image proves it came from your pipeline rather than from someone who obtained a
            push credential. With Sigstore, this is a two-line addition to a build job:
          </p>
          <pre className="text-xs rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4 overflow-x-auto"><code>{`# sign the digest (keyless, using the CI job's OIDC identity)
cosign sign registry.internal/team/billing-api@sha256:9b2c...e41a

# verify, constrained to the identity that is allowed to sign
cosign verify \\
  --certificate-identity-regexp '^https://github.com/acme/billing-api/' \\
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \\
  registry.internal/team/billing-api@sha256:9b2c...e41a`}</code></pre>
          <p className="text-sm muted">
            The part teams skip is the second command. A signature nobody verifies is decoration. The
            verification belongs in cluster admission &mdash; a policy controller that rejects any pod
            whose image lacks a valid signature from an expected identity. Note the identity
            constraints in that verify call: <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">cosign verify</code>{" "}
            without them will happily accept a signature from <em>anyone</em>. See{" "}
            <Link href="/blog/sigstore-cosign-container-signing" className="underline">
              Sigstore and cosign
            </Link>{" "}
            for the full workflow and{" "}
            <Link href="/blog/software-provenance" className="underline">
              software provenance
            </Link>{" "}
            for what signatures do and do not tell you.
          </p>
        </section>

        <img
          src="/blog/private-registry-security-3.jpg"
          alt="Authenticated push and pull traffic passing through a container registry access checkpoint"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Proxy caching and the public-registry dependency</h2>
          <p className="text-sm muted">
            Even with a private registry, most builds still start with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">FROM node:22-alpine</code>{" "}
            and reach straight out to a public registry. That is a live external dependency on your
            build path: rate limits, outages and upstream tag changes all become your problem, and in a
            genuinely locked-down environment it is an egress hole.
          </p>
          <p className="text-sm muted">
            A pull-through cache fixes this. Harbor calls it a proxy cache project, ECR a pull-through
            cache rule, Artifactory a remote repository; the shape is the same. Base images are pulled
            once through your registry, cached, and served from there afterwards. Your builds reference
            an internal name, the external dependency disappears from the build path, and every
            upstream layer that enters your environment does so through a place you can scan and audit.
          </p>
          <p className="text-sm muted">
            Pair it with retention. Registries grow without bound by default, and untagged manifests
            from years-old builds are both a storage cost and a way for a long-deleted vulnerable image
            to remain pullable by digest. Set a retention policy &mdash; keep the last N tags per
            repository plus anything matching your release pattern &mdash; and run garbage collection
            on a schedule.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scanning: at build and at rest</h2>
          <p className="text-sm muted">
            These are two different controls that people treat as one:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Where</th>
                  <th className="text-left py-2 pr-4 font-semibold">Catches</th>
                  <th className="text-left py-2 font-semibold">Why you still need the other</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>In the build</strong></td>
                  <td className="py-2 pr-4 align-top">Known CVEs at build time; fastest feedback loop</td>
                  <td className="py-2 align-top">A clean build today says nothing about advisories published next month</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top"><strong>At the registry</strong></td>
                  <td className="py-2 pr-4 align-top">Newly disclosed CVEs in images already stored</td>
                  <td className="py-2 align-top">Findings arrive after the image exists, when fixing is more expensive</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            Most images accumulate the majority of their findings <em>after</em> they are built, simply
            because advisories keep publishing. Registry-side rescanning is what turns a scan from a
            point-in-time snapshot into ongoing coverage. Registries like Harbor go further and let you
            block pulls of images above a severity threshold, which is a genuinely strong control
            &mdash; and a genuinely disruptive one if you enable it without first knowing what your
            existing inventory looks like. Run it in report mode, fix the backlog, then enforce. Our{" "}
            <Link href="/blog/harbor-registry" className="underline">
              Harbor guide
            </Link>{" "}
            and{" "}
            <Link href="/blog/ecr-image-scanning" className="underline">
              ECR image scanning
            </Link>{" "}
            post cover the specifics for each.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A hardening checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>TLS everywhere; no <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">insecure-registries</code>, no exceptions.</li>
            <li>Short-lived, workload-scoped credentials; separate pull and push identities.</li>
            <li>No shared admin account for automation; admin access via named human identities only.</li>
            <li>Tag immutability on release tag patterns.</li>
            <li>Digest pinning in deployment manifests, kept current by automation.</li>
            <li>Sign on push and verify at admission, with identity constraints on the verify.</li>
            <li>Proxy cache for upstream base images; block direct public pulls from build agents.</li>
            <li>Retention policy plus scheduled garbage collection.</li>
            <li>Scan in the build and rescan at rest; alert on newly affected stored images.</li>
            <li>Ship registry audit logs somewhere you would actually notice an anomalous pull.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook is not a registry and does not replace one. It sits on the scanning gate. Point it
            at an image tarball, a binary or a source archive and it reads the actual package databases
            inside &mdash; RPM, APK, dpkg, npm, pip and others &mdash; then matches every package
            against OSV, NVD and Red Hat OVAL in parallel, tagging each finding with its source and a
            confidence tier.
          </p>
          <p className="text-sm muted">
            The practical fit is CI: build, export the image to a tar, scan, and only push if the result
            clears your threshold. Many teams keep their registry&apos;s built-in scanner running for
            the rescan-at-rest half and add ScanRook at the build gate, because the two consult
            different advisory sources and the overlap is smaller than most people assume &mdash; the
            differences are laid out in our{" "}
            <Link href="/blog/cve-database-comparison" className="underline">
              CVE database comparison
            </Link>
            . For where the gate belongs in a pipeline, see{" "}
            <Link href="/blog/container-scanning-best-practices" className="underline">
              container scanning best practices
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Why run a private registry?</h3>
              <p className="text-sm muted mt-1">
                To have one controlled chokepoint between build and runtime where scanning, signing,
                immutability and audit can be enforced &mdash; and to remove a hard dependency on a
                public registry.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is private automatically safer?</h3>
              <p className="text-sm muted mt-1">
                No. A private registry with a shared admin credential and mutable tags is worse than a
                well-governed public repository. The benefit is the ability to enforce policy, not
                privacy itself.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is tag immutability?</h3>
              <p className="text-sm muted mt-1">
                A rule preventing an existing tag from being repointed at a different digest, so what
                you tested stays what you deploy and rollbacks are deterministic.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Scan at push or in CI?</h3>
              <p className="text-sm muted mt-1">
                Both. CI scanning gives fast feedback and can block a push; registry rescanning catches
                CVEs disclosed after the image was built, which is most of them over its lifetime.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Put a real gate on your registry</h3>
          <p className="text-sm muted leading-relaxed">
            Scan an image you already push privately and compare against what your registry reports.
            Every ScanRook finding carries its advisory source and a confidence tier, so a push-blocking
            threshold is something you can defend in review.
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
            <Link href="/blog/harbor-registry" className="underline">
              Harbor Registry
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/sigstore-cosign-container-signing" className="underline">
              Sigstore &amp; Cosign Container Signing
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
