import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-30";

const title = `Kubernetes Secrets Security: A Practical Guide | ${APP_NAME}`;
const description =
  "A practical guide to Kubernetes secrets security: why base64 is not encryption, encryption at rest, RBAC, external secret stores, and safe mounting.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "kubernetes secrets",
    "kubernetes secrets security",
    "kubernetes secrets encryption",
    "kubernetes encryption at rest",
    "kubernetes secrets rbac",
    "kubernetes secrets base64",
    "external secrets operator",
    "sealed secrets kubernetes",
    "kubernetes secret best practices",
    "etcd secret encryption",
  ],
  alternates: { canonical: "/blog/kubernetes-secrets-security" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/kubernetes-secrets-security",
    images: ["/blog/kubernetes-secrets-security.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/kubernetes-secrets-security.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Kubernetes Secrets Security: A Practical Guide",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/kubernetes-secrets-security",
  image: "https://scanrook.io/blog/kubernetes-secrets-security.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Are Kubernetes Secrets encrypted by default?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. By default a Kubernetes Secret only base64-encodes its data, which is encoding, not encryption. The value is stored in etcd and anyone who can read etcd or has RBAC access to the Secret can recover the plaintext with a single base64 decode. Encryption at rest has to be explicitly enabled on the API server with an EncryptionConfiguration.",
      },
    },
    {
      "@type": "Question",
      name: "How do I encrypt Kubernetes Secrets at rest?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Configure the API server with an EncryptionConfiguration that lists secrets under an encryption provider such as aescbc or, preferably, a KMS v2 provider backed by an external key manager. Point the API server at it with --encryption-provider-config, then re-encrypt existing Secrets by replacing them. KMS v2, which went GA in Kubernetes 1.29, is the recommended production option because the data-encryption keys are managed outside the cluster.",
      },
    },
    {
      "@type": "Question",
      name: "Should Kubernetes Secrets be environment variables or mounted files?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Prefer mounted files. Secrets exposed as environment variables can leak into child process environments, crash dumps, and application logs, and they are harder to rotate without restarting the pod. A Secret mounted as a volume is backed by in-memory tmpfs, can be set read-only with a restrictive file mode, and updates propagate to the file without an env change.",
      },
    },
    {
      "@type": "Question",
      name: "How do I keep Secrets out of Git in a GitOps workflow?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Never commit plaintext Secret manifests. Use a tool that stores only encrypted material in Git: Sealed Secrets encrypts values so only the in-cluster controller can decrypt them, SOPS encrypts fields with a KMS or age key, and the External Secrets Operator syncs values from an external store like Vault or a cloud secret manager at runtime so the real secret never touches the repository.",
      },
    },
    {
      "@type": "Question",
      name: "Can a scanner find secrets baked into container images?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, and it is a common failure mode independent of Kubernetes Secret hygiene. Credentials copied into an image layer persist there even if a later layer deletes them, and no amount of etcd encryption helps once the key is in the image. Scanning images for embedded keys before they ship is a complementary control to managing Secrets correctly at runtime.",
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
            Kubernetes Secrets Security: A Practical Guide
          </h1>
          <p className="text-sm muted">Published July 30, 2026 &middot; 11 min read</p>
          <p className="text-sm muted">
            The most dangerous myth about Kubernetes secrets is that storing a value in a{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">Secret</code>{" "}
            object makes it secret. By default it does not &mdash; it only base64-encodes it. This
            guide walks through what a Secret actually protects, and the concrete steps that turn it
            into something worth the name: encryption at rest, tight RBAC, safe mounting, and keeping
            secrets out of Git and out of your images.
          </p>
        </header>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Base64 is not encryption</h2>
          <p className="text-sm muted">
            A Kubernetes Secret stores its data base64-encoded and, by default, writes it to etcd in
            that form. Base64 is a reversible encoding, not a cipher. Anyone with read access to the
            Secret &mdash; or to an etcd backup &mdash; recovers the plaintext instantly:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# This is all it takes to read an "encrypted" Secret
kubectl get secret app-db -o jsonpath='{.data.password}' | base64 -d`}</pre>
          <p className="text-sm muted">
            So the real question is not &ldquo;is it a Secret?&rdquo; but &ldquo;who can read it, and
            is it encrypted where it rests?&rdquo; The rest of this guide answers both.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 1: Turn on encryption at rest</h2>
          <p className="text-sm muted">
            Encryption at rest ensures that a stolen etcd snapshot does not hand over every credential
            in the cluster. Create an <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">EncryptionConfiguration</code>{" "}
            and point the API server at it with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--encryption-provider-config</code>:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
  - resources:
      - secrets
    providers:
      # First provider is used to encrypt new writes
      - aescbc:
          keys:
            - name: key1
              secret: <base64-encoded 32-byte key>
      # identity must remain so existing plaintext stays readable
      - identity: {}`}</pre>
          <p className="text-sm muted">
            After enabling it, re-encrypt everything already stored:{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kubectl get secrets -A -o json | kubectl replace -f -</code>.
            For production, prefer a <strong>KMS v2</strong> provider (GA in Kubernetes 1.29) backed
            by an external key manager such as AWS KMS, Google Cloud KMS, or Vault &mdash; that way
            the encryption keys live outside the cluster instead of in a file on the API server disk.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 2: Lock down RBAC</h2>
          <p className="text-sm muted">
            Encryption at rest does nothing against someone who can simply ask the API for the Secret.
            The complementary control is least-privilege RBAC: grant{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">get</code>{" "}
            on named Secrets only to the identities that need them, and avoid handing out cluster-wide{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">list</code> or{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">watch</code> on Secrets.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: app
  name: read-app-db-secret
rules:
  - apiGroups: [""]
    resources: ["secrets"]
    resourceNames: ["app-db"]   # scoped to one Secret
    verbs: ["get"]`}</pre>
          <p className="text-sm muted">
            One caveat worth knowing: <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">resourceNames</code>{" "}
            restricts <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">get</code> but cannot restrict{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">list</code>, so a role
            with list access can read every Secret in the namespace. Grant list sparingly.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 3: Mount secrets, do not inject them as env vars</h2>
          <p className="text-sm muted">
            Environment variables feel convenient, but they leak. Child processes inherit the whole
            environment, crash handlers dump it, and application logs routinely print it. A Secret
            mounted as a volume is backed by in-memory <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">tmpfs</code>,
            can be made read-only with a restrictive file mode, and can update in place without a
            container restart.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  automountServiceAccountToken: false
  containers:
    - name: app
      image: myapp:1.4.2
      volumeMounts:
        - name: db-secret
          mountPath: /etc/secrets
          readOnly: true
  volumes:
    - name: db-secret
      secret:
        secretName: app-db
        defaultMode: 0400   # owner read-only`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 4: Disable unused service account tokens</h2>
          <p className="text-sm muted">
            Every pod historically got a mounted service account token whether it needed to talk to
            the API or not &mdash; a free credential for an attacker who lands in the container. Since
            Kubernetes 1.24 those tokens are short-lived and audience-bound rather than long-lived
            Secrets, which is a big improvement, but the best token is the one that is not mounted at
            all. Set <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">automountServiceAccountToken: false</code>{" "}
            on the pod or service account (as in the manifest above) unless the workload genuinely
            calls the Kubernetes API.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 5: Keep secrets out of Git</h2>
          <p className="text-sm muted">
            GitOps is a huge win for auditability right up until someone commits a plaintext Secret
            manifest into a repository that a hundred people can clone. Three established patterns keep
            the real value out of Git:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Sealed Secrets.</strong> A controller in the cluster holds a private key; you
              commit an encrypted <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">SealedSecret</code>{" "}
              that only it can decrypt into a real Secret.
            </li>
            <li>
              <strong>SOPS.</strong> Encrypts individual fields with a KMS or age key, so the manifest
              in Git shows structure but not values.
            </li>
            <li>
              <strong>External Secrets Operator.</strong> Stores nothing sensitive in Git at all; it
              syncs values at runtime from Vault or a cloud secret manager into Kubernetes Secrets.
            </li>
          </ul>
          <p className="text-sm muted">
            Managing secrets this way is part of a healthy supply chain overall &mdash; see our{" "}
            <Link href="/blog/software-supply-chain-security" className="underline">
              software supply chain security primer
            </Link>{" "}
            for how it fits with signing and provenance.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 6: Rotate and audit</h2>
          <p className="text-sm muted">
            Treat every secret as something that will eventually leak and plan for rotation: prefer
            short-lived, dynamically issued credentials (a strength of Vault and cloud secret
            managers) over static long-lived ones, and make rotation a routine operation rather than
            an incident response. Turn on API server audit logging for Secret access so you can answer
            &ldquo;who read this credential, and when?&rdquo; &mdash; and alert on unexpected{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">list</code>{" "}
            operations across namespaces, which are a classic reconnaissance step after a compromise.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Common mistakes to avoid</h2>
          <p className="text-sm muted">
            Most Secret incidents are not exotic &mdash; they are the same handful of mistakes
            repeated. Watch for these:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Treating base64 as protection.</strong> It is encoding. Anyone with read access
              decodes it in one command.
            </li>
            <li>
              <strong>Putting secrets in ConfigMaps.</strong> ConfigMaps are never encrypted at rest,
              get no special access treatment, and show up in plain text in{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kubectl describe</code>.
              Credentials belong in Secrets, not ConfigMaps.
            </li>
            <li>
              <strong>Granting broad list/watch on Secrets.</strong> A single over-scoped role
              undoes careful per-Secret <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">get</code> restrictions.
            </li>
            <li>
              <strong>Committing plaintext manifests to Git.</strong> Once pushed, treat the secret as
              compromised and rotate it &mdash; deleting the commit does not scrub every clone and
              mirror.
            </li>
            <li>
              <strong>Never rotating.</strong> A static credential that has existed for two years has
              almost certainly been copied into a laptop, a CI log, or a screenshot somewhere.
            </li>
          </ul>
          <p className="text-sm muted">
            None of these require sophistication to fix; they require making the safe path the default
            one, which is exactly what the steps above set up.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Everything above secures secrets at runtime. There is an earlier failure mode that no
            amount of etcd encryption or RBAC touches: a credential baked into the container image
            itself. Keys copied into an image layer persist in the layer history even if a later step
            deletes them, and they ship to every registry and node that pulls the image. ScanRook is
            an image scanner, not a Kubernetes secret manager &mdash; but because it unpacks and
            inspects every layer, it can surface embedded keys and vulnerable packages before an image
            reaches your cluster. That is the honest boundary: manage Secrets with the Kubernetes
            controls in this guide, and scan images so a hard-coded credential never becomes a
            runtime problem in the first place. The image side of that gate is covered in{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              our Kubernetes vulnerability scanning guide
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Are Kubernetes Secrets encrypted by default?</h3>
              <p className="text-sm muted mt-1">
                No &mdash; they are base64-encoded and stored in etcd. Encryption at rest must be
                explicitly enabled with an EncryptionConfiguration on the API server.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Env var or mounted file?</h3>
              <p className="text-sm muted mt-1">
                Mounted file. Env vars leak into child processes, crash dumps, and logs; a volume is
                tmpfs-backed, can be read-only, and rotates without a restart.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I keep Secrets out of Git?</h3>
              <p className="text-sm muted mt-1">
                Use Sealed Secrets, SOPS, or the External Secrets Operator so only encrypted material
                or nothing sensitive lives in the repository.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What about secrets baked into images?</h3>
              <p className="text-sm muted mt-1">
                They persist in layer history and etcd encryption cannot help. Scan images for
                embedded keys before they ship as a complementary control.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Catch secrets before they reach the cluster</h3>
          <p className="text-sm muted leading-relaxed">
            Manage Secrets with the controls above, and scan the images you deploy so a hard-coded
            key or vulnerable package never makes it past the gate. ScanRook unpacks every layer and
            reports what is really inside.
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
            <Link href="/blog/container-security-checklist" className="underline">
              Container Image Security Checklist
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              Kubernetes Admission Control for Image Scanning
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              Kubernetes Vulnerability Scanning
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
