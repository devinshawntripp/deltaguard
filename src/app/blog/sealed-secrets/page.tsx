import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-09";

const title = `Sealed Secrets in Kubernetes: Encrypt Secrets Safely for Git | ${APP_NAME}`;
const description =
  "Sealed Secrets encrypt Kubernetes Secrets for safe storage in Git. How the kubeseal controller works, its scopes, key rotation, and where scanning fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "sealed secrets",
    "kubernetes sealed secrets",
    "bitnami sealed secrets",
    "kubeseal",
    "encrypt kubernetes secrets",
    "sealed secrets controller",
    "gitops secrets",
    "sealed secret scopes",
    "sealed secrets key rotation",
    "kubernetes secrets in git",
  ],
  alternates: { canonical: "/blog/sealed-secrets" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/sealed-secrets",
    images: ["/blog/sealed-secrets.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/sealed-secrets.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Sealed Secrets in Kubernetes: Encrypt Secrets Safely for Git",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/sealed-secrets",
  image: "https://scanrook.io/blog/sealed-secrets.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are Sealed Secrets in Kubernetes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sealed Secrets is an open-source project from Bitnami that lets you encrypt a Kubernetes Secret into a SealedSecret custom resource. The encrypted SealedSecret is safe to store in a public or private Git repository. A controller running in the cluster holds the private key, decrypts the SealedSecret, and produces an ordinary Secret that pods can consume.",
      },
    },
    {
      "@type": "Question",
      name: "How is a Sealed Secret encrypted?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The kubeseal CLI performs hybrid encryption. It generates a random symmetric session key, encrypts the secret data with AES-256-GCM, and then wraps that session key with the controller's public certificate using RSA-OAEP. Only the controller's private key, which never leaves the cluster, can unwrap the session key and decrypt the payload.",
      },
    },
    {
      "@type": "Question",
      name: "What are the Sealed Secret scopes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "There are three scopes. Strict (the default) binds the encrypted value to a specific namespace and name, so renaming or moving it breaks decryption. Namespace-wide allows any name within one namespace. Cluster-wide allows any name in any namespace. Wider scopes are more convenient but reduce the guarantees, so strict is preferred unless you have a reason to loosen it.",
      },
    },
    {
      "@type": "Question",
      name: "Do Sealed Secrets encrypt secrets at rest inside the cluster?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Once the controller decrypts a SealedSecret it creates a normal Kubernetes Secret, which is only base64-encoded in etcd unless you separately enable encryption at rest. Sealed Secrets solves the problem of storing secrets safely in Git; it does not replace etcd encryption, RBAC, or an external secrets manager for runtime protection.",
      },
    },
    {
      "@type": "Question",
      name: "What happens if you lose the sealing key?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "If the controller's private key is lost and no backup exists, every SealedSecret becomes permanently undecryptable and must be re-created from the original plaintext. Because the controller rotates its sealing key periodically and keeps old keys for decryption, backing up those keys is essential for disaster recovery in a new cluster.",
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
            Sealed Secrets in Kubernetes: Encrypt Secrets Safely for Git
          </h1>
          <p className="text-sm muted">Published December 9, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            GitOps has a chicken-and-egg problem: you want your whole cluster state in Git, but a
            Kubernetes Secret is only base64-encoded, so committing one leaks the credential to
            anyone who can read the repo. Sealed Secrets is the most common answer. It lets you
            encrypt a Secret into a resource that is genuinely safe to commit, while the only key
            that can decrypt it stays inside the cluster.
          </p>
        </header>

        <img
          src="/blog/sealed-secrets.jpg"
          alt="Sealed Secrets workflow in Kubernetes"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The problem Sealed Secrets solves</h2>
          <p className="text-sm muted">
            A standard Kubernetes Secret stores its values base64-encoded, which is an encoding, not
            encryption &mdash; anyone with the manifest can decode it in one command. That is fine
            inside a locked-down cluster, but it makes Secrets impossible to store in version control
            the way GitOps workflows want. As we cover in{" "}
            <Link href="/blog/kubernetes-secrets-security" className="underline">
              Kubernetes secrets security
            </Link>
            , base64 is the number-one misconception teams have about Secret confidentiality.
          </p>
          <p className="text-sm muted">
            Sealed Secrets, created by Bitnami, closes that gap. You take a normal Secret, encrypt it
            with an asymmetric key whose private half lives only in the cluster, and get a{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">SealedSecret</code>{" "}
            custom resource. That SealedSecret is safe to commit to a public repository, because
            nothing outside the cluster can reverse it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How it works</h2>
          <p className="text-sm muted">
            The project has two pieces: a <strong>controller</strong> that runs in the cluster
            (typically in <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kube-system</code>)
            and the <strong>kubeseal</strong> CLI you run locally. On startup the controller
            generates an RSA key pair and publishes the public certificate. kubeseal fetches that
            certificate and uses it to encrypt your Secret; the private key never leaves the cluster.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 760 150" role="img" aria-label="Sealed Secrets workflow: manifest to kubeseal to Git to in-cluster Secret" className="w-full min-w-[640px]">
              <defs>
                <marker id="ss-arrow" markerWidth="9" markerHeight="9" refX="6" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 z" fill="currentColor" />
                </marker>
              </defs>
              <text x="380" y="24" fill="currentColor" fontSize="13" fontWeight="600" textAnchor="middle" opacity="0.85">
                The private key never leaves the cluster
              </text>
              <g fill="none" stroke="currentColor">
                <rect x="8" y="52" width="150" height="58" rx="8" opacity="0.35" />
                <rect x="205" y="52" width="150" height="58" rx="8" opacity="0.35" />
                <rect x="402" y="52" width="150" height="58" rx="8" opacity="0.35" />
                <rect x="599" y="52" width="153" height="58" rx="8" fill="var(--dg-accent,#2563eb)" fillOpacity="0.12" stroke="var(--dg-accent,#2563eb)" />
              </g>
              <g fill="currentColor" textAnchor="middle">
                <text x="83" y="80" fontSize="13">Secret manifest</text>
                <text x="83" y="98" fontSize="11" opacity="0.6">plaintext, local only</text>
                <text x="280" y="80" fontSize="13">kubeseal</text>
                <text x="280" y="98" fontSize="11" opacity="0.6">encrypt with cert</text>
                <text x="477" y="80" fontSize="13">SealedSecret</text>
                <text x="477" y="98" fontSize="11" opacity="0.6">commit to Git</text>
                <text x="675" y="80" fontSize="13" fontWeight="600">Secret in cluster</text>
                <text x="675" y="98" fontSize="11" opacity="0.75">controller decrypts</text>
              </g>
              <g stroke="currentColor" opacity="0.7">
                <line x1="160" y1="81" x2="203" y2="81" markerEnd="url(#ss-arrow)" />
                <line x1="357" y1="81" x2="400" y2="81" markerEnd="url(#ss-arrow)" />
                <line x1="554" y1="81" x2="597" y2="81" markerEnd="url(#ss-arrow)" />
              </g>
            </svg>
          </div>
          <p className="text-sm muted">
            The encryption is hybrid, the same pattern TLS uses. kubeseal generates a random
            symmetric key, encrypts your secret data with <strong>AES-256-GCM</strong>, and then
            wraps that symmetric key with the controller&apos;s public certificate using{" "}
            <strong>RSA-OAEP</strong>. When you apply the SealedSecret, the controller unwraps the
            symmetric key with its private key and emits a normal Secret that your pods mount as
            usual. If someone steals the SealedSecret from Git, they still need the in-cluster
            private key to read it &mdash; which they do not have.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scopes: strict, namespace-wide, cluster-wide</h2>
          <p className="text-sm muted">
            To stop someone from copying your SealedSecret into a namespace they control and having
            the controller decrypt it there, encryption is bound to context. There are three scopes:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Strict (default).</strong> The ciphertext is tied to a specific{" "}
              <em>namespace and name</em>. Rename the resource or move it to another namespace and
              decryption fails. This is the safest option and the one you should default to.
            </li>
            <li>
              <strong>Namespace-wide.</strong> The value is bound to a namespace but can carry any
              name, which is convenient when you rename resources often but weakens the guarantee.
            </li>
            <li>
              <strong>Cluster-wide.</strong> The value can be unsealed under any name in any
              namespace. Only use this when you genuinely need to move a secret around, because it
              removes the contextual binding entirely.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Key rotation and disaster recovery</h2>
          <p className="text-sm muted">
            The controller renews its sealing key on a schedule (30 days by default) and generates a
            fresh key pair, but it keeps the old private keys so previously sealed values still
            decrypt. New SealedSecrets are encrypted with the newest key. This means the sealing keys
            are the single most important thing to back up: if you lose the cluster and every private
            key with it, no existing SealedSecret can ever be decrypted again, and you must re-seal
            everything from the original plaintext.
          </p>
          <p className="text-sm muted">
            In practice, back up the sealing key Secret (labeled as a sealed-secrets key) to a secure
            location outside the cluster, and restore it first when you rebuild. Treat those backups
            as highly sensitive &mdash; a leaked sealing key defeats the whole scheme, which is
            exactly the kind of exposure a{" "}
            <Link href="/blog/secret-scanning-guide" className="underline">
              secret scanning
            </Link>{" "}
            process should be watching for.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Sealed Secrets does not do</h2>
          <p className="text-sm muted">
            Sealed Secrets is narrowly scoped, and its limits matter. Once unsealed, the result is an
            ordinary Kubernetes Secret &mdash; base64 in etcd unless you also enable{" "}
            <em>encryption at rest</em>, and visible to anyone with the right RBAC. It does not rotate
            application credentials, sync from an external vault, or protect a running secret from a
            compromised pod. If you need centralized rotation and dynamic secrets, an external
            manager (backed by something like the External Secrets Operator) is a better fit. Sealed
            Secrets answers exactly one question well: <em>how do I keep this Secret in Git without
            leaking it?</em>
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Quickstart</h2>
          <p className="text-sm muted">
            Install the controller, then seal a Secret without ever committing the plaintext:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# 1. Install the controller (Helm)
helm repo add sealed-secrets https://bitnami-labs.github.io/sealed-secrets
helm install sealed-secrets sealed-secrets/sealed-secrets -n kube-system

# 2. Build a Secret manifest locally -- do NOT apply it
kubectl create secret generic db-creds \\
  --from-literal=password='s3cr3t' \\
  --dry-run=client -o yaml > secret.yaml

# 3. Seal it into a SealedSecret that is safe to commit
kubeseal --format yaml < secret.yaml > sealed-secret.yaml

# 4. Commit sealed-secret.yaml, then apply it.
#    The controller decrypts it into a real Secret in-cluster.
kubectl apply -f sealed-secret.yaml
rm secret.yaml   # never keep the plaintext around`}</pre>
          <p className="text-sm muted">
            The file you commit,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">sealed-secret.yaml</code>,
            contains only ciphertext. The plaintext{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">secret.yaml</code>{" "}
            should be deleted immediately so it never reaches history &mdash; the same discipline a
            git secret scanner like{" "}
            <Link href="/blog/gitleaks-secret-scanning" className="underline">
              Gitleaks
            </Link>{" "}
            enforces.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook does not manage or deliver secrets &mdash; that is Sealed Secrets&apos; job, and
            the two operate at different layers. ScanRook scans the built artifact: the container
            images your pods actually run. That matters here for two reasons. First, credentials have
            a habit of getting baked directly into image layers &mdash; environment files, config,
            leftover{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.env</code>{" "}
            copies &mdash; and no amount of careful secret delivery helps if the secret is sitting in
            the image. Second, the packages inside those images carry their own CVEs regardless of how
            cleanly you inject secrets. Sealed Secrets keeps your credentials out of Git; ScanRook
            keeps vulnerabilities and stray secrets out of the image. They are complementary controls
            in the same{" "}
            <Link href="/blog/docker-security-guide" className="underline">
              container hardening
            </Link>{" "}
            story, not substitutes.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Are Sealed Secrets safe to commit to a public repo?</h3>
              <p className="text-sm muted mt-1">
                Yes. A SealedSecret contains only ciphertext that can be decrypted solely by the
                controller&apos;s in-cluster private key. Reversing it without that key would require
                breaking RSA and AES, so committing it to a public repository does not leak the value.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is the difference between Sealed Secrets and etcd encryption?</h3>
              <p className="text-sm muted mt-1">
                Sealed Secrets protect a secret in Git before it reaches the cluster. Encryption at
                rest protects the decrypted Secret once it lives in etcd. They cover different stages,
                and a hardened setup uses both.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can I decrypt a SealedSecret to check it?</h3>
              <p className="text-sm muted mt-1">
                Only with the controller&apos;s private key, and typically only for recovery. In
                normal operation you seal in one direction; if you need to see the value, read the
                resulting Secret in the cluster subject to RBAC.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does Sealed Secrets rotate my application passwords?</h3>
              <p className="text-sm muted mt-1">
                No. It only encrypts and decrypts the value you give it. Rotating the underlying
                credential is your responsibility, or that of an external secrets manager built for
                dynamic rotation.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Keep secrets out of your images, not just your repo</h3>
          <p className="text-sm muted leading-relaxed">
            Sealed Secrets keep credentials out of Git; ScanRook scans the container images you ship
            for baked-in secrets and known CVEs. Upload an image to see what your build actually
            contains &mdash; layer by layer.
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
            <Link href="/blog/gitleaks-secret-scanning" className="underline">
              Gitleaks Secret Scanning
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
