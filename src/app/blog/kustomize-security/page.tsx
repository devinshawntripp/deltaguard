import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-23";

const title = `Kustomize Security: Overlays, Digests and Safe Manifests | ${APP_NAME}`;
const description =
  "Kustomize composes Kubernetes manifests without templates. How its base and overlay model works, the security defaults worth setting, and how to scan what it renders.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "kustomize",
    "kustomize security",
    "kustomize overlays",
    "kustomization.yaml",
    "kustomize image digest",
    "kubectl apply -k",
    "kustomize secretgenerator",
    "kubernetes manifest scanning",
    "kustomize remote base",
    "kustomize patches",
  ],
  alternates: { canonical: "/blog/kustomize-security" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/kustomize-security",
    images: ["/blog/kustomize-security.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/kustomize-security.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Kustomize Security: Overlays, Digests and Safe Manifests",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/kustomize-security",
  image: "https://scanrook.io/blog/kustomize-security.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Kustomize?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Kustomize is a template-free way to customize Kubernetes manifests. You keep plain YAML in a base directory and apply overlays that patch it per environment, driven by a kustomization.yaml file. It ships inside kubectl, so kubectl apply -k and kubectl kustomize work without installing anything extra.",
      },
    },
    {
      "@type": "Question",
      name: "How do you pin image digests with Kustomize?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The images transformer in kustomization.yaml accepts a digest field alongside newName. Setting digest instead of newTag makes the rendered manifest reference an immutable sha256 digest, so the exact image bytes you scanned are the ones that get deployed, even if the tag is later moved.",
      },
    },
    {
      "@type": "Question",
      name: "Is secretGenerator safe to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Only if the input is not committed. secretGenerator reads literals or files and emits a Kubernetes Secret, which means the plaintext value lives wherever the input lives — usually the git repository. For anything real, generate the Secret from an external source such as Sealed Secrets or the External Secrets Operator instead.",
      },
    },
    {
      "@type": "Question",
      name: "Are remote Kustomize bases risky?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They carry the same risk as any unpinned dependency. A resources entry pointing at a git URL without a ref resolves to whatever is on the default branch at build time, so upstream changes land in your cluster without review. Pin remote resources to an immutable commit SHA and review updates deliberately.",
      },
    },
    {
      "@type": "Question",
      name: "How do you scan Kustomize output?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Render first, then scan. Run kubectl kustomize on the overlay to produce the final YAML and pipe that into a manifest policy scanner. Scanning the base alone misses everything an overlay adds or removes, which is exactly where environment-specific mistakes live.",
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
            Kustomize Security: Overlays, Digests and Safe Manifests
          </h1>
          <p className="text-sm muted">Published September 23, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            Kustomize is the config tool most Kubernetes teams end up using without deciding to
            &mdash; it is built into kubectl, it needs no templating language, and it makes
            per-environment differences explicit instead of hiding them behind conditionals. That
            same structure makes it a useful place to enforce security defaults, and a surprisingly
            easy place to leak a secret. Here is the model, the settings worth getting right, and
            how to scan what Kustomize actually produces.
          </p>
        </header>

        <img
          src="/blog/kustomize-security.jpg"
          alt="Kustomize base and overlay manifests composing into one rendered configuration"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The base and overlay model</h2>
          <p className="text-sm muted">
            Kustomize takes plain Kubernetes YAML and transforms it. There is no templating language
            and no placeholder syntax: every file in a base directory is a valid manifest you could
            apply directly. A{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kustomization.yaml</code>{" "}
            lists the resources to include and the transformations to apply, and an overlay is
            simply another kustomization that references the base and layers patches on top.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`base/
  kustomization.yaml
  deployment.yaml
  service.yaml
overlays/
  staging/kustomization.yaml
  production/kustomization.yaml`}</pre>
          <p className="text-sm muted">
            Rendering is a single command, and it is worth building the habit of rendering before
            applying:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# render only — inspect what will actually be applied
kubectl kustomize overlays/production

# render and apply
kubectl apply -k overlays/production

# see what would change against the live cluster
kubectl diff -k overlays/production`}</pre>
          <p className="text-sm muted">
            The security-relevant property of this model is that <em>the base is where a default
            belongs</em>. If you patch a security context into each overlay, a new overlay someone
            adds next quarter will not have it. If the base carries it, every environment inherits
            it and an overlay has to explicitly remove it &mdash; which is visible in review.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Put security defaults in the base</h2>
          <p className="text-sm muted">
            A hardened base deployment costs nothing to write once and quietly fixes an entire class
            of findings across every environment:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# base/deployment.yaml (excerpt)
spec:
  template:
    spec:
      automountServiceAccountToken: false
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: api
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: ["ALL"]
          resources:
            limits:
              memory: 512Mi
            requests:
              cpu: 100m
              memory: 256Mi`}</pre>
          <p className="text-sm muted">
            If you would rather apply this across many workloads without editing each one, Kustomize
            patches accept a target selector, so one patch can cover every Deployment in the
            kustomization:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# base/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - deployment.yaml
  - service.yaml

patches:
  - target:
      kind: Deployment
    patch: |-
      - op: replace
        path: /spec/template/spec/securityContext/runAsNonRoot
        value: true`}</pre>
          <p className="text-sm muted">
            These settings line up with what{" "}
            <Link href="/blog/pod-security-admission-guide" className="underline">
              Pod Security Admission
            </Link>{" "}
            enforces at the API server, so putting them in the base means your manifests pass
            admission rather than getting rejected at deploy time. The individual fields are covered
            in more depth in our{" "}
            <Link href="/blog/security-context-kubernetes" className="underline">
              Kubernetes security context guide
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Pin images by digest, not tag</h2>
          <p className="text-sm muted">
            The{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">images</code>{" "}
            transformer is the single most useful security feature Kustomize has, because it lets an
            overlay rewrite image references without touching the base &mdash; and it accepts a
            digest:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# overlays/production/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: prod
resources:
  - ../../base

images:
  - name: api                       # as written in the base manifest
    newName: registry.example.com/team/api
    digest: sha256:9f2c1e0d4b7a8c3f5e6d2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d`}</pre>
          <p className="text-sm muted">
            A tag is a mutable pointer. Deploying{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">api:v2.1</code>{" "}
            today and tomorrow can give you different bytes, which means the scan result you gated on
            no longer describes what is running. A digest is content-addressed and cannot drift. In
            a well-built pipeline the digest in the overlay is written by the same job that built and
            scanned the image, so the chain from scan to deploy is unbroken. That is the same
            principle behind{" "}
            <Link href="/blog/sigstore-cosign-container-signing" className="underline">
              signing images with Cosign
            </Link>{" "}
            &mdash; signatures are over digests, not tags.
          </p>
        </section>

        <img
          src="/blog/kustomize-security-2.jpg"
          alt="One Kustomize base branching into environment overlays for staging and production"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where Kustomize setups go wrong</h2>
          <p className="text-sm muted">
            <strong>secretGenerator with committed inputs.</strong> Kustomize will happily build a
            Secret from literals or a file:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`secretGenerator:
  - name: db-credentials
    literals:
      - password=hunter2        # now in git history, forever`}</pre>
          <p className="text-sm muted">
            The generated Secret is base64, which is encoding, not encryption. Anything you put in a
            literal or an env file lives in your repository history from the moment it is committed.
            The fix is to keep the ciphertext in git and let the cluster decrypt &mdash; either{" "}
            <Link href="/blog/sealed-secrets" className="underline">
              Sealed Secrets
            </Link>{" "}
            or the{" "}
            <Link href="/blog/external-secrets-operator" className="underline">
              External Secrets Operator
            </Link>{" "}
            depending on whether you want the value in git at all. If something already leaked,{" "}
            <Link href="/blog/gitleaks-secret-scanning" className="underline">
              secret scanning
            </Link>{" "}
            in CI is how you find the rest of them.
          </p>
          <p className="text-sm muted">
            <strong>Unpinned remote resources.</strong> Kustomize can pull a base straight from a
            git URL. Without a ref it resolves to the default branch at build time, which means an
            upstream commit reaches your cluster with no review:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`resources:
  # avoid — floating
  - github.com/example/platform//manifests/base

  # prefer — immutable commit SHA
  - github.com/example/platform//manifests/base?ref=6f3a91c2b7d84e05f1a92c3d4e5b6a7c8d9e0f12`}</pre>
          <p className="text-sm muted">
            This is a supply-chain dependency like any other, and it deserves the same treatment as
            a package lockfile: pinned, reviewed on update, and vendored if the upstream is not one
            you trust to stay stable.
          </p>
          <p className="text-sm muted">
            <strong>Loosened load restrictions and exec plugins.</strong> Kustomize normally refuses
            to read files outside the kustomization root. Passing{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--load-restrictor LoadRestrictionsNone</code>{" "}
            turns that off, which makes it possible for a kustomization to pull in files from
            anywhere on the build machine. Alpha exec plugins go further and run arbitrary binaries
            during a build. Both are occasionally necessary and both mean &ldquo;rendering a
            manifest&rdquo; is no longer a safe, side-effect-free operation. If your CI renders
            untrusted branches, keep the defaults.
          </p>
        </section>

        <figure className="grid gap-2">
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 720 220"
              role="img"
              aria-label="Flow diagram: a hardened base plus environment overlays render into final manifests, which pass through a policy scan gate before apply; image digests come from the scanned build"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <defs>
                <marker id="ks-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              <rect x={8} y={72} width={150} height={56} rx={8} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.4} />
              <text x={83} y={96} textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">base</text>
              <text x={83} y={114} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>hardened defaults</text>

              {[
                { y: 20, label: "staging overlay" },
                { y: 84, label: "production overlay" },
                { y: 148, label: "dev overlay" },
              ].map((o) => (
                <g key={o.label}>
                  <line x1={162} y1={100} x2={196} y2={o.y + 22} stroke="currentColor" strokeOpacity={0.35} strokeWidth={1.5} markerEnd="url(#ks-arrow)" />
                  <rect x={206} y={o.y} width={162} height={44} rx={7} fill="currentColor" fillOpacity={0.04} stroke="currentColor" strokeOpacity={0.3} />
                  <text x={287} y={o.y + 20} textAnchor="middle" fontSize="12" fill="currentColor" fillOpacity={0.85}>{o.label}</text>
                  <text x={287} y={o.y + 34} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.5}>patches + image digest</text>
                  <line x1={372} y1={o.y + 22} x2={406} y2={100} stroke="currentColor" strokeOpacity={0.35} strokeWidth={1.5} markerEnd="url(#ks-arrow)" />
                </g>
              ))}

              <rect x={416} y={72} width={140} height={56} rx={8} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.4} />
              <text x={486} y={96} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="currentColor">rendered YAML</text>
              <text x={486} y={114} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>kubectl kustomize</text>

              <line x1={560} y1={100} x2={584} y2={100} stroke="currentColor" strokeWidth={2} strokeOpacity={0.5} markerEnd="url(#ks-arrow)" />

              <rect x={594} y={72} width={118} height={56} rx={8} fill="var(--dg-accent,#2563eb)" fillOpacity={0.12} stroke="currentColor" strokeOpacity={0.5} />
              <text x={653} y={96} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="currentColor">policy gate</text>
              <text x={653} y={114} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>then apply</text>
            </svg>
          </div>
          <figcaption className="text-xs muted">
            Scan the rendered output, not the base &mdash; overlays are where environment-specific
            mistakes appear.
          </figcaption>
        </figure>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scanning what Kustomize renders</h2>
          <p className="text-sm muted">
            The most common mistake in manifest scanning is pointing the scanner at the base
            directory. The base is not what runs. An overlay can add a privileged sidecar, mount the
            Docker socket, widen a service account, or drop the security context you carefully set
            &mdash; and none of that appears until you render. Render first, scan the output:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`#!/usr/bin/env bash
set -euo pipefail

for overlay in overlays/*/; do
  env=$(basename "$overlay")
  echo "== rendering $env"
  kubectl kustomize "$overlay" > "rendered-$env.yaml"
done

# feed the rendered manifests to your policy scanner of choice
# (a non-zero exit here should fail the pipeline)`}</pre>
          <p className="text-sm muted">
            Manifest policy checking is a different job from vulnerability scanning &mdash; it is
            about configuration, not packages. Tools such as{" "}
            <Link href="/blog/checkov" className="underline">
              Checkov
            </Link>{" "}
            and{" "}
            <Link href="/blog/kics" className="underline">
              KICS
            </Link>{" "}
            take rendered Kubernetes YAML and flag privileged containers, missing resource limits,
            host namespace usage and similar. Run them on every overlay, in CI, on every pull
            request, and gate the merge rather than the deploy.
          </p>
        </section>

        <img
          src="/blog/kustomize-security-3.jpg"
          alt="Immutable image digest pinned into a Kubernetes deployment manifest"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook does not read your kustomizations &mdash; it scans the artifact that ends up
            referenced by them. The connection point is the digest. Your pipeline builds an image,
            ScanRook scans the tarball and reports findings from OSV, NVD and Red Hat OVAL, and if it
            passes the gate the pipeline writes that image&apos;s digest into the production
            overlay&apos;s{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">images</code>{" "}
            transformer. The manifest then points at exactly the bytes that were scanned, which is
            the part that usually breaks when teams deploy by tag.
          </p>
          <p className="text-sm muted">
            The two checks answer different questions and you want both: a config scanner tells you
            the Pod is running as root, ScanRook tells you the image it runs has an unpatched
            critical CVE. Neither finds the other&apos;s problems. If you are assembling that
            pipeline, our{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              Kubernetes vulnerability scanning guide
            </Link>{" "}
            covers how the pieces sequence.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Do I need to install Kustomize?</h3>
              <p className="text-sm muted mt-1">
                Not for the common path &mdash; it is embedded in kubectl. Installing the standalone
                binary gets you a newer version and features kubectl&apos;s bundled copy may lag
                behind on.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Kustomize or Helm?</h3>
              <p className="text-sm muted mt-1">
                Kustomize suits configuration you own and want to keep as readable YAML; Helm suits
                packaging software for others to install. Many teams use both, rendering a chart and
                then patching it.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can Kustomize enforce policy?</h3>
              <p className="text-sm muted mt-1">
                No. It composes manifests; it does not validate them. Enforcement comes from a policy
                scanner in CI and admission control in the cluster.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should overlays override the base security context?</h3>
              <p className="text-sm muted mt-1">
                Rarely, and when they do it should be visible in review. Keep hardened settings in
                the base so a new overlay inherits them by default rather than by remembering.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan the image your overlay points at</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook scans the built artifact and gives you a result you can pin a digest to &mdash;
            findings matched against OSV, NVD and Red Hat OVAL, tagged by source and confidence.
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
            <Link href="/blog/security-context-kubernetes" className="underline">
              Kubernetes Security Context
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/pod-security-admission-guide" className="underline">
              Pod Security Admission Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              Kubernetes Vulnerability Scanning Guide
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
