import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-10";

const title = `ArgoCD Image Scanning: Gating a GitOps Pipeline | ${APP_NAME}`;
const description =
  "How to scan container images in ArgoCD-synced manifests before merge, using a GitOps CI gate and a PreSync hook so unscanned images never reach a cluster.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "argocd image scanning",
    "argocd gitops security",
    "argocd container vulnerability scan",
    "gitops image scanning",
    "argocd presync hook scan",
    "kubernetes gitops security scanning",
    "argocd pipeline security gate",
    "scan images before argocd sync",
    "argocd scanrook",
    "gitops vulnerability scanning",
  ],
  alternates: { canonical: "/blog/argocd-gitops-image-scanning" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/argocd-gitops-image-scanning",
    images: ["/blog/argocd-gitops-image-scanning.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/argocd-gitops-image-scanning.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "ArgoCD Image Scanning: Gating a GitOps Pipeline",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/argocd-gitops-image-scanning",
  image: "https://scanrook.io/blog/argocd-gitops-image-scanning.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Does ArgoCD scan container images for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No, ArgoCD only syncs manifests to a cluster; it has no built-in vulnerability scanning. Scanning has to happen either in the CI pipeline that merges changes into the GitOps repository, or via a PreSync hook that runs at sync time before ArgoCD applies the manifests.",
      },
    },
    {
      "@type": "Question",
      name: "Where should image scanning happen in a GitOps workflow?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ideally in two places. A CI gate on pull requests to the GitOps repository catches a newly introduced vulnerable tag before merge. A PreSync hook in the ArgoCD Application catches advisories published after the manifest was merged, since the image referenced in git can become vulnerable without the git content changing.",
      },
    },
    {
      "@type": "Question",
      name: "What is an ArgoCD PreSync hook?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A Kubernetes Job (or other resource) annotated with argocd.argoproj.io/hook: PreSync that ArgoCD runs before applying the rest of an Application's manifests. If the hook Job fails, ArgoCD does not proceed with the sync, which makes it a natural place to run a scan-and-gate step at deploy time.",
      },
    },
    {
      "@type": "Question",
      name: "How do I find which images are referenced in my GitOps manifests?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Render the manifests with kustomize build or helm template and extract image: fields with yq, or grep raw YAML if you are not using a templating tool. Rendering first is important for Helm and Kustomize repos, since the raw source files often reference an image tag through a values file rather than directly.",
      },
    },
    {
      "@type": "Question",
      name: "Does scanning slow down ArgoCD syncs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A PreSync scan adds the scan time to every sync, typically single-digit seconds per image with a warm cache. For frequent auto-sync Applications, restrict the PreSync hook to run only when the referenced image tag actually changes, rather than on every reconciliation loop.",
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
            ArgoCD Image Scanning: Gating a GitOps Pipeline
          </h1>
          <p className="text-sm muted">Published August 10, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            ArgoCD image scanning is not something ArgoCD does for you &mdash; it syncs whatever
            manifests are in git, vulnerable or not. This guide covers the two places that actually
            enforce it: a CI gate on the GitOps repository itself, and an ArgoCD PreSync hook that
            scans at deploy time, catching images that went stale after the manifest was merged.
          </p>
        </header>

        <img
          src="/blog/argocd-gitops-image-scanning.jpg"
          alt="Scanning container images in an ArgoCD GitOps pipeline"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why GitOps needs a scanning gate of its own</h2>
          <p className="text-sm muted">
            In a GitOps model, the git repository is the source of truth: change an{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">image:</code>{" "}
            tag in a Kustomize overlay or a Helm values file, merge it, and ArgoCD applies it to the
            cluster automatically. That automation is the whole point of GitOps, but it also means
            there is no human in the loop at deploy time to notice a vulnerable image &mdash; the
            only checkpoints are whatever runs against the git repository before merge, and whatever
            ArgoCD itself is configured to run before sync.
          </p>
          <p className="text-sm muted">
            This differs from{" "}
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              scanning in a build pipeline
            </Link>{" "}
            in one important way: the GitOps repository usually does not build the image, it only
            references a tag built elsewhere. The scan target is the referenced image, pulled from
            its registry, not something the current pipeline just built &mdash; the same core
            approach as{" "}
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              our general image-scanning guide
            </Link>
            , applied to whatever tag the manifest currently points at.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Layer one: a CI gate on the GitOps repository</h2>
          <p className="text-sm muted">
            Add a workflow to the GitOps repository itself that renders the manifests, extracts
            every referenced image, and scans each one before a pull request can merge:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`name: Scan images referenced in manifests

on:
  pull_request:
    paths:
      - "apps/**"
      - "overlays/**"

jobs:
  scan-referenced-images:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install kustomize, yq, ScanRook
        run: |
          curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
          sudo mv kustomize /usr/local/bin/
          sudo curl -fsSL -o /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64
          sudo chmod +x /usr/local/bin/yq
          curl -fsSL https://scanrook.sh/install | sh

      - name: Render manifests and collect image references
        run: |
          kustomize build overlays/production > rendered.yaml
          yq eval '.. | select(has("image")) | .image' rendered.yaml | sort -u > images.txt
          cat images.txt

      - name: Pull and scan every referenced image
        env:
          NVD_API_KEY: \${{ secrets.NVD_API_KEY }}
        run: |
          FAIL=0
          while read -r IMAGE; do
            echo "Scanning $IMAGE"
            docker pull "$IMAGE"
            docker save "$IMAGE" -o image.tar
            scanrook scan --file image.tar --format json --out "report-$(echo "$IMAGE" | tr '/:' '__').json"
            CRITICAL=$(jq '.summary.critical // 0' "report-$(echo "$IMAGE" | tr '/:' '__').json")
            if [ "$CRITICAL" -gt 0 ]; then
              echo "::error::$IMAGE has $CRITICAL critical findings"
              FAIL=1
            fi
          done < images.txt
          exit $FAIL

      - name: Upload reports
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: manifest-image-reports
          path: report-*.json`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What this workflow does</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Path filter.</strong> The workflow only runs when files under{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">apps/</code>{" "}
              or <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">overlays/</code>{" "}
              change, so unrelated documentation or CI-config pull requests do not pay the scan cost.
            </li>
            <li>
              <strong>Render before extracting.</strong>{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kustomize build</code>{" "}
              resolves image tags that come from a base, an overlay patch, or a Helm values merge
              into their final values &mdash; grepping the raw source files would miss any image set
              through a patch or a values override.
            </li>
            <li>
              <strong>One scan per unique image.</strong>{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">sort -u</code>{" "}
              deduplicates before the loop, since production manifests commonly reference the same
              image across several Deployments and Jobs.
            </li>
            <li>
              <strong>Pull, not build.</strong> The GitOps repository does not build images, so each
              referenced tag is pulled directly from its registry before being saved and scanned.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Layer two: an ArgoCD PreSync hook</h2>
          <p className="text-sm muted">
            The CI gate above only runs when the manifest changes. It cannot catch a CVE published
            the week after merge against an image tag that never changed in git &mdash; ArgoCD would
            still sync that unchanged manifest without re-checking it. A PreSync hook closes that
            gap by scanning at sync time, every time:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`apiVersion: batch/v1
kind: Job
metadata:
  name: scanrook-presync-gate
  annotations:
    argocd.argoproj.io/hook: PreSync
    argocd.argoproj.io/hook-delete-policy: HookSucceeded
spec:
  backoffLimit: 0
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: scanrook-gate
          image: alpine:3.20
          env:
            - name: NVD_API_KEY
              valueFrom:
                secretKeyRef:
                  name: scanrook-credentials
                  key: nvd-api-key
            - name: TARGET_IMAGE
              value: "myregistry.example.com/myapp:prod"
          command:
            - /bin/sh
            - -c
            - |
              apk add --no-cache curl bash jq
              curl -fsSL https://scanrook.sh/install | sh
              curl -fsSL https://github.com/google/go-containerregistry/releases/latest/download/go-containerregistry_Linux_x86_64.tar.gz \\
                | tar -xz -C /usr/local/bin crane
              crane pull "$TARGET_IMAGE" image.tar
              scanrook scan --file image.tar --format json --out /tmp/report.json
              CRITICAL=$(jq '.summary.critical // 0' /tmp/report.json)
              if [ "$CRITICAL" -gt 0 ]; then
                echo "Blocking sync: $CRITICAL critical findings in $TARGET_IMAGE"
                exit 1
              fi`}</pre>
          <p className="text-sm muted">
            This uses a plain <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">alpine</code>{" "}
            base rather than a Docker daemon, since hook Jobs run inside the cluster and typically
            cannot run privileged Docker-in-Docker. <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">crane</code>{" "}
            pulls the image straight from the registry over the registry HTTP API &mdash; no daemon
            required &mdash; and writes it out as a tar that ScanRook can scan directly.
          </p>
          <p className="text-sm muted">
            ArgoCD runs this Job before applying the rest of the Application&apos;s resources. If
            the Job exits non-zero, the sync is marked failed and nothing else in the Application is
            applied &mdash; the same protection the CI gate offers, but re-checked on every sync
            rather than only when the manifest changes.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Failing the sync on severity without breaking auto-sync</h2>
          <p className="text-sm muted">
            Applications configured with automated sync will retry a failed PreSync hook on ArgoCD&apos;s
            normal reconciliation interval, which can turn a single vulnerable image into a noisy,
            repeatedly failing Application. Three adjustments keep this manageable:
          </p>
          <p className="text-sm muted">
            <strong>Gate on critical only, at first.</strong> The same tuning applies here as in any
            CI gate &mdash; start narrow, then widen. See{" "}
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              how to reduce CVEs in Docker images
            </Link>{" "}
            for bringing the baseline down before including high-severity findings.
          </p>
          <p className="text-sm muted">
            <strong>Cache scan results per image digest.</strong> Have the hook check a small
            key-value store (or a ConfigMap keyed by digest) for a recent passing scan before
            re-running the full scan, so an Application that syncs every few minutes is not
            re-scanning an unchanged image on every reconciliation.
          </p>
          <p className="text-sm muted">
            <strong>Alert, don&apos;t just fail silently.</strong> A PreSync hook failure surfaces
            in the ArgoCD UI as a failed sync, but wire it to your existing alerting (Slack, an
            ArgoCD notification trigger) so a blocked deploy is noticed immediately rather than
            discovered during an on-call rotation days later.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Operational notes</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              Store <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">NVD_API_KEY</code>{" "}
              as a Kubernetes Secret referenced by the hook Job, and as a masked GitHub Actions
              secret for the CI gate &mdash; never both in the same place.
            </li>
            <li>
              If your cluster nodes cannot run privileged Docker builds, use a rootless puller like{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">crane</code>{" "}
              or <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">skopeo</code>{" "}
              instead of a Docker daemon inside the hook Job.
            </li>
            <li>
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">hook-delete-policy: HookSucceeded</code>{" "}
              keeps a failed hook Job around for debugging while cleaning up successful runs
              automatically.
            </li>
            <li>
              For multi-cluster ArgoCD setups (ApplicationSets), define the PreSync hook once in a
              shared base and let each generated Application inherit it, rather than duplicating the
              Job manifest per cluster overlay.
            </li>
          </ul>
          <p className="text-sm muted">
            Full configuration reference, including a Helm chart wrapper for the PreSync hook, is in{" "}
            <Link href="/docs" className="underline">the ScanRook docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Does ArgoCD scan images itself?</h3>
              <p className="text-sm muted mt-1">
                No. ArgoCD only syncs manifests. Scanning has to be added either as a CI gate on the
                GitOps repository or as a PreSync hook that runs at sync time.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is a PreSync hook?</h3>
              <p className="text-sm muted mt-1">
                A Job annotated with{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">argocd.argoproj.io/hook: PreSync</code>{" "}
                that ArgoCD runs before the rest of the Application; a non-zero exit blocks the sync.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I find images referenced in Kustomize/Helm manifests?</h3>
              <p className="text-sm muted mt-1">
                Render first with{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kustomize build</code>{" "}
                or <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">helm template</code>,
                then extract <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">image:</code>{" "}
                fields with yq &mdash; raw source files can hide the final tag behind a patch or a
                values override.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does this slow down syncs?</h3>
              <p className="text-sm muted mt-1">
                A PreSync scan adds seconds per sync with a warm cache. For frequent auto-sync
                Applications, cache results by image digest so unchanged images are not re-scanned
                on every reconciliation.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Gate your GitOps pipeline with ScanRook</h3>
          <p className="text-sm muted leading-relaxed">
            Add the CI workflow and PreSync hook above and every image your ArgoCD Applications sync
            is checked against OSV, NVD, and vendor advisory data &mdash; before merge and again at
            deploy time.
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
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              How to Scan a Docker Image for Vulnerabilities
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-scanning-best-practices" className="underline">
              Container Scanning Best Practices
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/on-prem-vs-saas-scanning" className="underline">
              On-Prem vs SaaS Vulnerability Scanning
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
