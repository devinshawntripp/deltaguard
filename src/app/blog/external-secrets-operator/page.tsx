import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-26";

const title = `External Secrets Operator: Kubernetes Secrets, Synced | ${APP_NAME}`;
const description =
  "External Secrets Operator syncs secrets from AWS, Vault, and other managers into Kubernetes so credentials stay out of Git and your image manifests.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "external secrets operator",
    "external secrets operator kubernetes",
    "eso kubernetes",
    "SecretStore",
    "ExternalSecret",
    "kubernetes secrets management",
    "hashicorp vault kubernetes",
    "aws secrets manager kubernetes",
    "external secrets vs sealed secrets",
    "sync secrets kubernetes",
  ],
  alternates: { canonical: "/blog/external-secrets-operator" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/external-secrets-operator",
    images: ["/blog/external-secrets-operator.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/external-secrets-operator.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "External Secrets Operator: Kubernetes Secrets, Synced",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/external-secrets-operator",
  image: "https://scanrook.io/blog/external-secrets-operator.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is External Secrets Operator?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "External Secrets Operator (ESO) is an open-source Kubernetes operator that reads secrets from external secret managers such as AWS Secrets Manager, GCP Secret Manager, Azure Key Vault, and HashiCorp Vault, and syncs them into native Kubernetes Secret objects. It is a CNCF project. The external manager stays the source of truth while workloads consume ordinary Kubernetes Secrets.",
      },
    },
    {
      "@type": "Question",
      name: "How does External Secrets Operator work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You define a SecretStore describing how to connect to a provider, then an ExternalSecret listing which keys to fetch and how to template them into a target Secret. The operator authenticates to the provider, retrieves the values on a refresh interval, and creates or updates a standard Kubernetes Secret. Your pods mount that Secret as usual, unaware it was synced.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between a SecretStore and an ExternalSecret?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A SecretStore defines the connection to an external provider: which backend, which endpoint, and how to authenticate. An ExternalSecret defines what to fetch and where to put it: which keys from the store map into which fields of a target Kubernetes Secret, and how often to refresh. One SecretStore is typically referenced by many ExternalSecrets.",
      },
    },
    {
      "@type": "Question",
      name: "Is External Secrets Operator more secure than Kubernetes Secrets?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It improves the overall posture by keeping real secrets out of Git and centralizing them in a purpose-built manager with rotation and audit logging. But the Secret it creates inside the cluster is still a normal Kubernetes Secret, only base64-encoded, so you must still enable encryption at rest and enforce RBAC. ESO reduces secret sprawl; it does not remove the need to secure the cluster.",
      },
    },
    {
      "@type": "Question",
      name: "External Secrets Operator vs Sealed Secrets: which should I use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sealed Secrets encrypts a secret so the ciphertext can live safely in Git and is decrypted in-cluster. External Secrets Operator keeps the secret in an external manager and syncs it in, so nothing sensitive is committed at all. Choose Sealed Secrets for a lightweight, GitOps-native approach with no external dependency; choose ESO when you already run a secret manager and want rotation and central control.",
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
            External Secrets Operator: Kubernetes Secrets, Synced
          </h1>
          <p className="text-sm muted">Published October 26, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Committing a database password into a Git repository is one of the most common ways
            secrets leak. The External Secrets Operator (ESO) solves that by keeping the real secret
            in a dedicated manager &mdash; AWS Secrets Manager, Vault, Azure Key Vault &mdash; and
            syncing it into Kubernetes on demand, so nothing sensitive ever lands in your manifests
            or your image. This guide explains how ESO works, its core resources, and where it fits
            in a secure delivery pipeline.
          </p>
        </header>

        <img
          src="/blog/external-secrets-operator.jpg"
          alt="External Secrets Operator syncing secrets into Kubernetes"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The problem: secrets in the wrong places</h2>
          <p className="text-sm muted">
            Native Kubernetes Secrets are only base64-encoded, not encrypted, unless you explicitly
            turn on encryption at rest. That surprises people, and it means a Secret manifest
            checked into Git is effectively plaintext to anyone who can read the repo. Teams that
            adopt GitOps feel this acutely: they want everything declarative and in version control,
            but they cannot put credentials there safely. The usual bad workarounds &mdash; a private
            repo, a manual <code>kubectl create secret</code>, a value baked into a container image
            &mdash; all trade one risk for another. We covered the fundamentals in{" "}
            <Link href="/blog/kubernetes-secrets-security" className="underline">
              Kubernetes secrets security
            </Link>
            ; ESO is the operator that resolves the GitOps tension directly.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What ESO does</h2>
          <p className="text-sm muted">
            External Secrets Operator is a Kubernetes operator &mdash; a controller plus a set of
            custom resources &mdash; that treats an external secret manager as the source of truth
            and keeps a native Kubernetes Secret in sync with it. It is an open-source CNCF project
            with broad provider support: AWS Secrets Manager and Parameter Store, GCP Secret Manager,
            Azure Key Vault, HashiCorp Vault, and many more. You describe what you want declaratively;
            the operator does the fetching, templating, and refreshing.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The core resources</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>SecretStore</strong> &mdash; a namespaced resource describing how to reach one
              provider: the backend type, endpoint, and authentication. A{" "}
              <strong>ClusterSecretStore</strong> is the cluster-scoped version shared across
              namespaces.
            </li>
            <li>
              <strong>ExternalSecret</strong> &mdash; declares which keys to pull from a referenced
              store, how to template them into a target Kubernetes Secret, and a{" "}
              <code>refreshInterval</code> controlling how often to re-sync.
            </li>
            <li>
              <strong>ClusterExternalSecret</strong> &mdash; projects one ExternalSecret definition
              into many namespaces at once, useful for shared credentials.
            </li>
            <li>
              <strong>PushSecret</strong> &mdash; the reverse direction: take a Kubernetes Secret and
              write it out to a provider, for cases where the cluster is the origin.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A minimal example</h2>
          <p className="text-sm muted">
            A SecretStore points at the provider; an ExternalSecret maps a key from it into a normal
            Secret named <code>db-credentials</code>:
          </p>
          <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10 p-4 text-xs">
            <pre className="whitespace-pre"><code>{`apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secrets
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: eso-sa       # workload identity, no static keys
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets
    kind: SecretStore
  target:
    name: db-credentials       # the Kubernetes Secret ESO creates
  data:
    - secretKey: password
      remoteRef:
        key: prod/db
        property: password`}</code></pre>
          </div>
          <p className="text-sm muted">
            Your Deployment references <code>db-credentials</code> like any other Secret. It has no
            idea the value came from AWS.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The sync flow</h2>
          <p className="text-sm muted">
            The moving parts are easier to see as a picture. The provider holds the real secret; the
            operator authenticates, fetches on a schedule, and writes a Kubernetes Secret; the pod
            consumes it.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 720 130" width="100%" role="img" aria-label="External Secrets Operator flow: external provider to the operator, which writes a Kubernetes Secret consumed by a pod">
              {[
                { x: 10, w: 150, t: "Secret manager", s: "Vault / AWS / Azure", accent: false },
                { x: 195, w: 150, t: "ESO controller", s: "auth + refresh", accent: true },
                { x: 380, w: 150, t: "Kubernetes Secret", s: "synced, base64", accent: false },
                { x: 565, w: 145, t: "Pod", s: "env / volume", accent: false },
              ].map((b) => (
                <g key={b.x}>
                  <rect x={b.x} y="34" width={b.w} height="58" rx="8"
                    fill={b.accent ? "var(--dg-accent,#2563eb)" : "none"}
                    fillOpacity={b.accent ? 0.12 : 1}
                    stroke={b.accent ? "var(--dg-accent,#2563eb)" : "currentColor"}
                    strokeOpacity={b.accent ? 0.55 : 0.35} strokeWidth="1.5" />
                  <text x={b.x + b.w / 2} y="60" fontSize="12.5" fill="currentColor" textAnchor="middle" fontWeight="600">{b.t}</text>
                  <text x={b.x + b.w / 2} y="78" fontSize="10.5" fill="currentColor" textAnchor="middle" fillOpacity="0.75">{b.s}</text>
                </g>
              ))}
              {[160, 345, 530].map((x) => (
                <line key={x} x1={x} y1="63" x2={x + 35} y2="63" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" markerEnd="url(#es)" />
              ))}
              <defs>
                <marker id="es" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" fillOpacity="0.6" />
                </marker>
              </defs>
            </svg>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">ESO vs Sealed Secrets</h2>
          <p className="text-sm muted">
            The other popular answer to &ldquo;how do I keep secrets out of Git?&rdquo; is Bitnami
            Sealed Secrets, and the two take opposite approaches. Sealed Secrets encrypts a value into
            a <code>SealedSecret</code> resource that is safe to commit, and an in-cluster controller
            decrypts it. The ciphertext lives in Git. External Secrets Operator commits nothing
            sensitive at all &mdash; the secret stays in an external manager and is pulled in at
            runtime. Sealed Secrets is lightweight and self-contained with no external dependency;
            ESO gives you central rotation, audit logging, and a single source of truth across many
            clusters, at the cost of running a secret manager. Neither is universally better.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Security caveats worth internalizing</h2>
          <p className="text-sm muted">
            ESO improves your posture but does not make secrets magically safe. The Secret it writes
            is a normal Kubernetes Secret, so encryption at rest and tight RBAC still matter &mdash;
            anyone who can read Secrets in that namespace can read the synced value. Authenticate the
            operator to the provider with workload identity (IRSA, GKE Workload Identity, Azure
            Workload Identity) rather than long-lived static keys, so there is no root credential to
            leak. Scope SecretStores and ExternalSecrets carefully; a permissive ClusterSecretStore
            can become a wide blast radius. And remember that a leaked credential is still a leaked
            credential no matter how it arrived, which is why{" "}
            <Link href="/blog/secret-scanning-guide" className="underline">
              secret scanning
            </Link>{" "}
            stays part of the picture even with ESO in place.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Rotation, refresh, and getting started</h2>
          <p className="text-sm muted">
            One of ESO&apos;s quieter benefits is rotation. Because the external manager is the source
            of truth, rotating a credential there means the operator picks up the new value on the
            next refresh and updates the Kubernetes Secret automatically &mdash; no manual re-apply,
            no stale copy drifting out of sync. The trade-off to understand is timing: the{" "}
            <code>refreshInterval</code> sets how quickly a change propagates, and a workload already
            holding the old value in memory may need a restart to pick it up unless you run a reloader
            that watches for Secret changes.
          </p>
          <p className="text-sm muted">
            Getting started is deliberately boring, which is the point. You install the operator,
            typically via its Helm chart, grant it access to your provider through workload identity,
            create a SecretStore, and then declare ExternalSecrets per application. From there it is
            ordinary Kubernetes: the synced Secret appears, your Deployment consumes it, and the
            sensitive value never shows up in a manifest, a pull request, or an image layer.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ESO handles one layer of the problem: keeping credentials out of your source and your
            manifests. It does nothing about the other risk that ships with every deployment &mdash;
            the vulnerable OS and language packages baked into your container image. A perfectly
            managed secret cannot help an image running an outdated OpenSSL or a known-exploited
            library. ScanRook covers that layer: point it at the image, source, or binary and it
            matches every component against OSV, NVD, and Red Hat OVAL, producing ranked findings and
            a full SBOM before the artifact reaches your cluster. Pair ESO for secrets with ScanRook
            for artifact vulnerabilities, and hardened runtime practices from our{" "}
            <Link href="/blog/docker-security-guide" className="underline">
              Docker security guide
            </Link>
            , and both classes of risk are covered instead of just one.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is External Secrets Operator?</h3>
              <p className="text-sm muted mt-1">
                A CNCF Kubernetes operator that syncs secrets from external managers like AWS Secrets
                Manager, Vault, and Azure Key Vault into native Kubernetes Secret objects.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is the difference between a SecretStore and an ExternalSecret?</h3>
              <p className="text-sm muted mt-1">
                A SecretStore defines how to connect and authenticate to a provider; an ExternalSecret
                defines which keys to fetch and how to template them into a target Kubernetes Secret.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is ESO more secure than plain Kubernetes Secrets?</h3>
              <p className="text-sm muted mt-1">
                It keeps real secrets out of Git and centralizes rotation and audit, but the synced
                Secret is still base64-encoded, so encryption at rest and RBAC remain necessary.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">ESO or Sealed Secrets?</h3>
              <p className="text-sm muted mt-1">
                Sealed Secrets stores encrypted values in Git; ESO keeps them external and syncs them
                in. Pick Sealed Secrets for a self-contained GitOps flow, ESO when you run a secret
                manager.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Secrets are one layer; vulnerable packages are another</h3>
          <p className="text-sm muted leading-relaxed">
            ESO keeps credentials out of your images and Git. ScanRook scans the image itself for
            vulnerable OS and language packages against OSV, NVD, and vendor advisory data &mdash; so
            the artifact you deploy is clean on both fronts.
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
            <Link href="/blog/kubernetes-secrets-security" className="underline">
              Kubernetes Secrets Security
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/secret-scanning-guide" className="underline">
              Secret Scanning Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/docker-security-guide" className="underline">
              Docker Security Guide
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
