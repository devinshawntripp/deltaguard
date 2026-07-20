import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-15";

const title = `Flux CD Security: Hardening Your GitOps Pipeline | ${APP_NAME}`;
const description =
  "Flux CD makes Git the control plane for your cluster. How to harden it: cosign source verification, tenant impersonation, SOPS secrets, and scanning in CI.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "flux cd",
    "flux cd security",
    "fluxcd gitops",
    "flux kustomization",
    "flux ocirepository cosign",
    "flux multi-tenancy",
    "gitops security",
    "flux sops decryption",
    "flux image automation",
    "kubernetes gitops",
  ],
  alternates: { canonical: "/blog/flux-cd-security" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/flux-cd-security",
    images: ["/blog/flux-cd-security.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/flux-cd-security.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Flux CD Security: Hardening Your GitOps Pipeline",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/flux-cd-security",
  image: "https://scanrook.io/blog/flux-cd-security.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Flux CD?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Flux CD is a CNCF-graduated GitOps toolkit for Kubernetes. A set of controllers running in the cluster continuously fetch declarative configuration from Git repositories, OCI artifacts, Helm repositories, or buckets, and reconcile the cluster to match. Instead of a pipeline pushing changes into the cluster, the cluster pulls its desired state.",
      },
    },
    {
      "@type": "Question",
      name: "How does GitOps change the security model?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It moves the trust boundary. In push-based CD, whoever holds cluster credentials can change the cluster. With Flux, whoever can merge to the reconciled branch can change the cluster, because the controllers apply whatever is there. Branch protection, signed commits, and required review become cluster security controls rather than code hygiene.",
      },
    },
    {
      "@type": "Question",
      name: "Can Flux verify signed sources?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. GitRepository resources support verification of signed Git commits and tags using PGP public keys supplied in a secret. OCIRepository resources support cosign and notation verification, including keyless verification matched against an OIDC issuer and subject identity, so the cluster refuses to reconcile an artifact that was not signed by the expected pipeline.",
      },
    },
    {
      "@type": "Question",
      name: "How do you handle secrets with Flux?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Never as plaintext manifests in the repository. Flux's kustomize-controller can decrypt SOPS-encrypted manifests in-cluster using a key held as a Kubernetes secret, so ciphertext is what lives in Git. The alternative is to keep secrets out of Git entirely and have an operator pull them from an external store at reconcile time.",
      },
    },
    {
      "@type": "Question",
      name: "Does Flux scan images for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Flux reconciles declared state; it does not inspect image contents. Vulnerability scanning belongs earlier, in the pipeline that builds and publishes the image, and optionally at admission control in the cluster as a backstop. Flux's image automation will happily deploy a newer tag that is more vulnerable than the one it replaced.",
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
            Flux CD Security: Hardening Your GitOps Pipeline
          </h1>
          <p className="text-sm muted">Published October 15, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            Flux CD turns a Git repository into the control plane for your cluster. That is a genuine
            security improvement in several respects &mdash; every change is reviewed, recorded, and
            revertible &mdash; but it also relocates the trust boundary somewhere most teams have not
            hardened. This is what the Flux CD threat model actually looks like and which controls are
            worth turning on.
          </p>
        </header>

        <img
          src="/blog/flux-cd-security.jpg"
          alt="Flux CD GitOps reconciliation loop between a Git repository and a Kubernetes cluster"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How Flux is put together</h2>
          <p className="text-sm muted">
            Flux is not one binary. It is a set of controllers, collectively the GitOps Toolkit, each
            with a narrow job and its own custom resources:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>source-controller</strong> fetches artifacts &mdash;{" "}
              <code className="text-xs">GitRepository</code>,{" "}
              <code className="text-xs">OCIRepository</code>,{" "}
              <code className="text-xs">HelmRepository</code>,{" "}
              <code className="text-xs">Bucket</code> &mdash; and makes them available internally.
            </li>
            <li>
              <strong>kustomize-controller</strong> takes a{" "}
              <code className="text-xs">Kustomization</code> pointing at a source and applies the
              rendered manifests to the cluster.
            </li>
            <li>
              <strong>helm-controller</strong> does the same for{" "}
              <code className="text-xs">HelmRelease</code> resources.
            </li>
            <li>
              <strong>image-reflector-controller</strong> and{" "}
              <strong>image-automation-controller</strong> watch registries and can write updated image
              tags back into Git.
            </li>
            <li>
              <strong>notification-controller</strong> handles inbound webhooks and outbound alerts.
            </li>
          </ul>
          <p className="text-sm muted">
            The security-relevant consequence of this design is that the controllers run{" "}
            <em>inside</em> the cluster and pull. There is no CI system holding a kubeconfig. That
            removes a large class of credential-leak risk &mdash; and replaces it with a different
            question: who can influence what the controllers pull?
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            The trust boundary moved to your repository
          </h2>
          <p className="text-sm muted">
            This is the single most important thing to internalise. With Flux reconciling{" "}
            <code className="text-xs">main</code>, anyone who can merge to{" "}
            <code className="text-xs">main</code> can change the cluster. Not &ldquo;can propose a
            change that a pipeline might apply&rdquo; &mdash; can change it, within the reconcile
            interval, automatically. A pull request that adds a privileged pod with a host mount is a
            cluster compromise the moment it merges.
          </p>
          <p className="text-sm muted">
            So repository controls become cluster controls, and they need to be treated with that
            seriousness:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Branch protection on the reconciled branch, with required review from a second person.</li>
            <li>
              Required status checks that actually block &mdash; policy evaluation and manifest linting
              on every pull request.
            </li>
            <li>
              Restricted write access, audited. Bot accounts that can push to the reconciled branch are
              cluster-admin-equivalent.
            </li>
            <li>Signed commits, and Flux configured to verify them.</li>
            <li>
              A separate repository (or at minimum a separate branch and reviewer set) for
              cluster-level infrastructure versus application manifests.
            </li>
          </ul>
          <p className="text-sm muted">
            Commit verification is the part people skip, and it is a two-line addition. Give Flux the
            PGP public keys you trust and it will refuse to reconcile unsigned or unknown-signer
            commits:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <pre className="text-xs leading-relaxed"><code>{`apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: apps
  namespace: flux-system
spec:
  interval: 1m
  url: https://github.com/example/apps
  ref:
    branch: main
  secretRef:
    name: git-credentials
  verify:
    mode: HEAD            # verify the signature on the commit being reconciled
    secretRef:
      name: trusted-pgp-keys`}</code></pre>
          </div>
        </section>

        <img
          src="/blog/flux-cd-security-2.jpg"
          alt="Flux CD drift detection reconciling cluster state back to the declared configuration"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Controller permissions and multi-tenancy
          </h2>
          <p className="text-sm muted">
            By default, the kustomize-controller and helm-controller are bound to a very broad cluster
            role &mdash; they have to be, since they apply arbitrary manifests. In a single-team
            cluster that is acceptable. In a shared cluster it means any tenant who can get a manifest
            into a reconciled path is effectively operating with the controller&apos;s permissions,
            not their own.
          </p>
          <p className="text-sm muted">
            Flux&apos;s answer is service account impersonation. Set{" "}
            <code className="text-xs">spec.serviceAccountName</code> on a{" "}
            <code className="text-xs">Kustomization</code> or{" "}
            <code className="text-xs">HelmRelease</code> and the controller applies those manifests as
            that service account, so tenant RBAC constrains what the reconciliation can do:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <pre className="text-xs leading-relaxed"><code>{`apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: team-a-apps
  namespace: team-a
spec:
  interval: 10m
  path: ./clusters/prod/team-a
  prune: true
  targetNamespace: team-a
  serviceAccountName: team-a-reconciler   # apply with the tenant's RBAC, not the controller's
  sourceRef:
    kind: GitRepository
    name: team-a-apps
    namespace: team-a
  decryption:
    provider: sops
    secretRef:
      name: sops-age`}</code></pre>
          </div>
          <p className="text-sm muted">Two controller flags make this enforceable rather than optional:</p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <code className="text-xs">--default-service-account</code> makes impersonation the
              default when a resource does not name one, so a tenant cannot get controller-level
              permissions by simply omitting the field.
            </li>
            <li>
              <code className="text-xs">--no-cross-namespace-refs=true</code> stops a{" "}
              <code className="text-xs">Kustomization</code> in one namespace from referencing a source
              or secret in another. Without it, tenant isolation is advisory.
            </li>
          </ul>
          <p className="text-sm muted">
            Combine that with a restrictive admission baseline so that even a permitted service account
            cannot create a privileged workload &mdash; the{" "}
            <Link href="/blog/pod-security-admission-guide" className="underline">
              Pod Security Admission
            </Link>{" "}
            settings and{" "}
            <Link href="/blog/security-context-kubernetes" className="underline">
              security contexts
            </Link>{" "}
            do the work that RBAC alone cannot.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Where the security controls sit in the loop
          </h2>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 240"
              role="img"
              aria-label="Flow diagram of the Flux CD GitOps loop showing security controls at each stage: build and scan, signed commit and branch protection, source verification with cosign, impersonated apply, and admission control"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <defs>
                <marker id="fx-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              {[
                { x: 8, label: "Build", sub: "scan + sign image" },
                { x: 148, label: "Git", sub: "protected branch" },
                { x: 288, label: "Source", sub: "verify signature", hot: true },
                { x: 428, label: "Apply", sub: "impersonated SA" },
                { x: 568, label: "Cluster", sub: "admission gate" },
              ].map((b) => (
                <g key={b.label}>
                  <rect
                    x={b.x}
                    y={24}
                    width={118}
                    height={54}
                    rx={8}
                    fill={b.hot ? "var(--dg-accent,#2563eb)" : "transparent"}
                    fillOpacity={b.hot ? 0.12 : 1}
                    stroke="currentColor"
                    strokeOpacity={0.5}
                  />
                  <text
                    x={b.x + 59}
                    y={48}
                    textAnchor="middle"
                    fontSize="13.5"
                    fontWeight="600"
                    fill="currentColor"
                  >
                    {b.label}
                  </text>
                  <text
                    x={b.x + 59}
                    y={66}
                    textAnchor="middle"
                    fontSize="10"
                    fill="currentColor"
                    fillOpacity={0.6}
                  >
                    {b.sub}
                  </text>
                </g>
              ))}
              {[126, 266, 406, 546].map((x) => (
                <line
                  key={x}
                  x1={x}
                  y1={51}
                  x2={x + 22}
                  y2={51}
                  stroke="currentColor"
                  strokeWidth={2}
                  markerEnd="url(#fx-arrow)"
                />
              ))}
              {/* reconcile loop back */}
              <path
                d="M627 82 L627 140 L67 140 L67 82"
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.45}
                strokeWidth={1.8}
                strokeDasharray="5 4"
                markerEnd="url(#fx-arrow)"
              />
              <text x={350} y={134} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.65}>
                continuous reconciliation &mdash; drift is reverted, not merely detected
              </text>
              <rect
                x={12}
                y={166}
                width={676}
                height={58}
                rx={7}
                fill="currentColor"
                fillOpacity={0.05}
                stroke="currentColor"
                strokeOpacity={0.25}
              />
              <text x={30} y={190} fontSize="11.5" fill="currentColor" fillOpacity={0.8}>
                Flux enforces what is declared. It does not evaluate whether what is declared is safe.
              </text>
              <text x={30} y={210} fontSize="11.5" fill="currentColor" fillOpacity={0.6}>
                That judgement has to come from scanning and policy, before and after the loop.
              </text>
            </svg>
            <figcaption className="text-xs muted mt-2">
              Security control points around the Flux reconciliation loop. Each stage is independent
              &mdash; signature verification does not help if the signed artifact was never scanned.
            </figcaption>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Verifying what you deploy, not just where it came from
          </h2>
          <p className="text-sm muted">
            If you distribute manifests as OCI artifacts rather than plain Git &mdash; increasingly the
            default for larger setups &mdash; Flux can verify them cryptographically before
            reconciling. Keyless cosign verification is the strongest form, because it binds the
            artifact to the identity of the workflow that produced it rather than to a key someone has
            to hold:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <pre className="text-xs leading-relaxed"><code>{`apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: OCIRepository
metadata:
  name: apps
  namespace: flux-system
spec:
  interval: 5m
  url: oci://ghcr.io/example/manifests
  ref:
    tag: v1.4.0
  verify:
    provider: cosign
    matchOIDCIdentity:
      - issuer: "^https://token.actions.githubusercontent.com$"
        subject: "^https://github.com/example/apps/.github/workflows/release.yaml@refs/heads/main$"`}</code></pre>
          </div>
          <p className="text-sm muted">
            With that in place, an attacker who compromises the registry cannot substitute an artifact,
            because they cannot produce a signature attributable to the release workflow. The mechanics
            of keyless signing are covered in{" "}
            <Link href="/blog/sigstore-cosign-container-signing" className="underline">
              Sigstore and cosign container signing
            </Link>
            .
          </p>
          <p className="text-sm muted">
            Two caveats. First, verification is about <em>provenance</em>, not <em>quality</em>: a
            correctly signed artifact can still deploy an image full of critical CVEs. Second, image
            automation raises the stakes. If{" "}
            <code className="text-xs">ImagePolicy</code> and{" "}
            <code className="text-xs">ImageUpdateAutomation</code> are configured to bump tags
            automatically, your registry becomes a deployment trigger &mdash; whatever gets pushed
            matching the policy goes to production without a human in the loop. Scope those policies
            tightly (semver ranges, not <code className="text-xs">latest</code>), restrict registry push
            access accordingly, and require signature verification on the images themselves. The
            general pattern is the same one discussed in{" "}
            <Link href="/blog/automate-docker-base-image-updates" className="underline">
              automating base image updates
            </Link>
            : automation is fine, unattended automation without verification is not.
          </p>
        </section>

        <img
          src="/blog/flux-cd-security-3.jpg"
          alt="Signed container image verification before Flux CD deploys it to a cluster"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Secrets in a GitOps repository</h2>
          <p className="text-sm muted">
            Everything Flux reconciles lives in a repository, which makes the secrets question
            immediate. Committing a plaintext <code className="text-xs">Secret</code> manifest is the
            wrong answer and stays wrong forever, because Git history does not forget.
          </p>
          <p className="text-sm muted">There are two workable patterns:</p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Encrypt in the repo.</strong> SOPS-encrypted manifests with an age or KMS key,
              decrypted in-cluster by the kustomize-controller via{" "}
              <code className="text-xs">spec.decryption</code>. Ciphertext in Git, key in the cluster.{" "}
              <Link href="/blog/sealed-secrets" className="underline">
                Sealed Secrets
              </Link>{" "}
              is a similar shape with different mechanics.
            </li>
            <li>
              <strong>Keep secrets out of Git entirely.</strong> Reference them and have an operator
              fetch the values from a managed store at reconcile time &mdash; the model behind{" "}
              <Link href="/blog/external-secrets-operator" className="underline">
                External Secrets Operator
              </Link>
              . Nothing sensitive touches the repository at all.
            </li>
          </ul>
          <p className="text-sm muted">
            Whichever you pick, run a secret scanner over the repository as a pull request check. The
            failure is not usually a deliberate committed <code className="text-xs">Secret</code>; it
            is a token pasted into a values file or a debug log. Our{" "}
            <Link href="/blog/kubernetes-secrets-security" className="underline">
              Kubernetes secrets security
            </Link>{" "}
            piece covers the cluster-side half of this, including why etcd encryption at rest matters
            once the secret has landed.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            A Flux hardening checklist
          </h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>Branch protection plus required review on every reconciled branch and path.</li>
            <li>
              Verify signed commits on <code className="text-xs">GitRepository</code>, or cosign
              signatures on <code className="text-xs">OCIRepository</code>.
            </li>
            <li>
              Run controllers with <code className="text-xs">--default-service-account</code> and{" "}
              <code className="text-xs">--no-cross-namespace-refs=true</code> in any shared cluster.
            </li>
            <li>
              Set <code className="text-xs">prune: true</code> so removing a manifest actually removes
              the resource; orphaned workloads are unmanaged workloads.
            </li>
            <li>
              Scope image automation to explicit semver ranges and never to a floating{" "}
              <code className="text-xs">latest</code> tag.
            </li>
            <li>Encrypt secrets with SOPS or keep them out of Git; scan the repo for leaked ones.</li>
            <li>
              Restrict who can reach the notification-controller&apos;s webhook receiver &mdash; it can
              trigger immediate reconciliation.
            </li>
            <li>
              Keep an admission-time backstop so a bad manifest that reaches the cluster is still
              refused &mdash; see{" "}
              <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
                admission control image scanning
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Flux does not look inside your images. It reconciles a declared tag or digest, and it will
            do so with complete indifference to whether that image ships an unpatched OpenSSL. That is
            the correct division of labour &mdash; a reconciliation engine should not be a scanner
            &mdash; but it means the vulnerability question has to be answered somewhere else in the
            chain.
          </p>
          <p className="text-sm muted">
            The natural place is the build pipeline, before the tag ever reaches the GitOps repository.
            Scan the image you just built, fail the job on the severities you care about, and only
            promote a digest that passed:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <pre className="text-xs leading-relaxed"><code>{`curl -fsSL https://scanrook.io/install.sh | sh

docker save ghcr.io/example/api:1.4.0 -o image.tar
scanrook scan image.tar --format json --out report.json

# gate promotion on the result, then update the manifest repo with the digest`}</code></pre>
          </div>
          <p className="text-sm muted">
            ScanRook reads the real package databases inside the image rather than inferring packages
            from filenames, and matches each one against OSV, NVD, and Red Hat OVAL in parallel, so
            distribution-backported fixes are evaluated correctly. Every finding carries its source and
            a confidence tier, which matters when the output is feeding an automated promotion gate
            rather than a human reviewer. Pair that with Flux&apos;s signature verification and you get
            both halves: provenance says the artifact came from your pipeline, the scan says what is
            inside it. The{" "}
            <Link href="/docs" className="underline">
              docs
            </Link>{" "}
            cover report formats and exit codes; the same pattern applies with{" "}
            <Link href="/blog/tekton" className="underline">
              Tekton
            </Link>{" "}
            or any other build system feeding a Flux repository.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is Flux CD?</h3>
              <p className="text-sm muted mt-1">
                A CNCF-graduated GitOps toolkit. In-cluster controllers pull declarative config from
                Git, OCI, Helm, or buckets and continuously reconcile the cluster to match it.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What changes about security?</h3>
              <p className="text-sm muted mt-1">
                Repository write access becomes cluster write access. Branch protection, review, and
                commit signing become cluster security controls.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can Flux verify signatures?</h3>
              <p className="text-sm muted mt-1">
                Yes &mdash; PGP verification of Git commits and tags, and cosign or notation
                verification of OCI artifacts, including keyless identity matching.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does Flux scan images?</h3>
              <p className="text-sm muted mt-1">
                No. Scan in the build pipeline before the tag reaches the manifest repo, and keep an
                admission-time check as a backstop.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan before the tag reaches Git</h3>
          <p className="text-sm muted leading-relaxed">
            Flux will deploy exactly what you declare. Make sure what you declare has been looked at
            &mdash; scan the image in CI and gate promotion on the result.
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
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              Kubernetes Admission Control and Image Scanning
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/sigstore-cosign-container-signing" className="underline">
              Sigstore and Cosign Container Signing
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/kubernetes-secrets-security" className="underline">
              Kubernetes Secrets Security
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
