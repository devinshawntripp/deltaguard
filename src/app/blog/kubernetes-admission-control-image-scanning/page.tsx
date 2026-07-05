import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-16";

const title = `Kubernetes Admission Control for Image Scanning | ${APP_NAME}`;
const description =
  "How Kubernetes admission control blocks unscanned or vulnerable container images at deploy time, with a working Kyverno policy and where ScanRook fits the gate.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "kubernetes admission controller image scanning",
    "kubernetes admission control vulnerability scan",
    "kyverno image scanning policy",
    "block vulnerable images kubernetes",
    "validating admission webhook image scan",
    "kubernetes verifyimages kyverno",
    "kubernetes deploy time scanning",
    "kubernetes image policy scanrook",
    "admission controller container security",
    "kubernetes cluster image gate",
  ],
  alternates: { canonical: "/blog/kubernetes-admission-control-image-scanning" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/kubernetes-admission-control-image-scanning",
    images: ["/blog/kubernetes-admission-control-image-scanning.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/kubernetes-admission-control-image-scanning.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Kubernetes Admission Control for Image Scanning",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage:
    "https://scanrook.io/blog/kubernetes-admission-control-image-scanning",
  image: "https://scanrook.io/blog/kubernetes-admission-control-image-scanning.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is admission control for container images?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A validating admission webhook that Kubernetes calls before a Pod is persisted to etcd, which can inspect the Pod's image references and reject the request. For image scanning, this means blocking a Pod from ever being created if its image fails a vulnerability or attestation check, rather than only warning about it after the fact.",
      },
    },
    {
      "@type": "Question",
      name: "Why scan at admission time if CI already scanned the image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CI scanning only covers the pipeline that built or deployed an image. Admission control catches every path that can create a Pod, including kubectl run, a rollback to an old tag, or a different team's deployment that bypassed CI entirely. It is a backstop, not a replacement for CI scanning.",
      },
    },
    {
      "@type": "Question",
      name: "What is a Kyverno image attestation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A signed, structured statement about an image, published alongside it in the registry (commonly with cosign attest), that Kyverno's verifyImages rule can fetch, verify the signature on, and evaluate with conditions. A vulnerability-scan attestation lets a policy check the actual scan result, not just whether a scan ran.",
      },
    },
    {
      "@type": "Question",
      name: "Does admission control slow down Pod scheduling?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Verifying a signature and evaluating a condition against an already-published attestation is fast, typically well under a second, since no scan runs at admission time. The scan happens earlier in CI; the webhook only checks that a passing attestation exists for the exact image digest being admitted.",
      },
    },
    {
      "@type": "Question",
      name: "What happens if the admission webhook is unavailable?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on the failurePolicy setting. Fail closed (the default for security-critical policies) blocks all matching Pod creations until the webhook recovers, which is safer but can cause an outage if misconfigured. Fail open allows Pods through during an outage, prioritizing availability over the security gate.",
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
            Kubernetes Admission Control for Image Scanning
          </h1>
          <p className="text-sm muted">Published August 16, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            A Kubernetes admission controller is the last checkpoint before an image actually runs
            &mdash; the one CI cannot bypass and no one can skip with a quick{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kubectl run</code>.
            This guide builds a working Kyverno policy that blocks any Pod whose image lacks a
            passing, signed ScanRook scan attestation, and explains the tradeoffs of enforcing it.
          </p>
        </header>

        <img
          src="/blog/kubernetes-admission-control-image-scanning.jpg"
          alt="Kubernetes admission control blocking a vulnerable image"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why a CI gate alone is not enough</h2>
          <p className="text-sm muted">
            A CI gate like the one in{" "}
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              our GitHub Actions scanning guide
            </Link>{" "}
            only runs for Pods that came through that specific pipeline. It does nothing to stop a
            different team&apos;s deployment, a manual{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kubectl apply</code>,
            a rollback to a tag that predates the scanning policy, or a Helm chart that references a
            base image no one scanned. Admission control closes that gap by checking every Pod
            creation request against the cluster&apos;s API server, regardless of what produced it.
          </p>
          <p className="text-sm muted">
            The pattern below does not scan images inside the admission webhook itself &mdash; that
            would make Pod scheduling as slow as a full scan. Instead, CI produces a signed
            attestation of the scan result (following{" "}
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              the same scan step
            </Link>{" "}
            used elsewhere) and the admission webhook verifies that attestation exists, is signed by
            a trusted key, and reports zero critical findings.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step one: publish a signed scan attestation in CI</h2>
          <p className="text-sm muted">
            After scanning, attach the result to the image in the registry as a cosign attestation,
            signed with a key your cluster policy will trust:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`scanrook scan --file image.tar --format json --out report.json

# Build a minimal predicate from the scan summary
jq '{summary: .summary, scannedAt: now | todate}' report.json > predicate.json

cosign attest \\
  --predicate predicate.json \\
  --type https://scanrook.io/attestations/vuln-scan/v1 \\
  --key cosign.key \\
  myregistry.example.com/myapp@$(docker inspect --format='{{index .RepoDigests 0}}' myapp:ci | cut -d@ -f2)`}</pre>
          <p className="text-sm muted">
            The attestation is pushed alongside the image in the registry, keyed to the image&apos;s
            digest &mdash; not its tag &mdash; so it stays correct even if the tag is later
            overwritten or reused.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step two: the Kyverno ClusterPolicy</h2>
          <p className="text-sm muted">
            Apply this policy to the cluster. It verifies the attestation&apos;s signature and
            enforces that the attested critical-finding count is zero before allowing the Pod:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-scanrook-attestation
spec:
  validationFailureAction: Enforce
  webhookTimeoutSeconds: 30
  rules:
    - name: verify-scan-attestation
      match:
        any:
          - resources:
              kinds:
                - Pod
      verifyImages:
        - imageReferences:
            - "myregistry.example.com/*"
          attestors:
            - entries:
                - keys:
                    publicKeys: |-
                      -----BEGIN PUBLIC KEY-----
                      MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...
                      -----END PUBLIC KEY-----
          attestations:
            - type: https://scanrook.io/attestations/vuln-scan/v1
              conditions:
                - all:
                    - key: "{{ summary.critical }}"
                      operator: Equals
                      value: 0`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What each part does</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>validationFailureAction: Enforce.</strong> Blocks matching Pods outright. The
              alternative, <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">Audit</code>,
              logs a policy violation without blocking &mdash; the right starting point while you
              build confidence that the policy is not producing false rejections.
            </li>
            <li>
              <strong>imageReferences.</strong> Scopes the policy to images from your own registry,
              so third-party images (a public Helm chart&apos;s sidecar, for example) are not
              blocked for lacking an attestation they were never going to have.
            </li>
            <li>
              <strong>attestors.</strong> The public key here must match the private key used by{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">cosign attest</code>{" "}
              in CI. Kyverno rejects any attestation it cannot verify against a listed key, so an
              attacker cannot forge a passing result without that private key.
            </li>
            <li>
              <strong>attestations.type.</strong> Must match the{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--type</code>{" "}
              value used when the attestation was created. Kyverno fetches the attestation payload
              matching this type and makes its fields available to the condition below.
            </li>
            <li>
              <strong>conditions.</strong> <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">{"{{ summary.critical }}"}</code>{" "}
              reads directly from the predicate JSON built in CI. Because the check runs against the
              signed attestation content, not a live scan, a Pod is only admitted if the exact
              attested result says zero critical findings.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Rolling this out without an outage</h2>
          <p className="text-sm muted">
            Enforcing this policy cluster-wide on day one, before every image has an attestation,
            will block deployments that have nothing to do with security &mdash; just missing
            metadata. Roll out in stages:
          </p>
          <p className="text-sm muted">
            <strong>Start in Audit mode.</strong> Set <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">validationFailureAction: Audit</code>{" "}
            and review Kyverno&apos;s PolicyReport resources for a week to see which workloads would
            be blocked, before switching to <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">Enforce</code>.
          </p>
          <p className="text-sm muted">
            <strong>Scope by namespace first.</strong> Use a{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">match.any.resources.namespaces</code>{" "}
            selector to enforce in one low-risk namespace, confirm CI is reliably producing
            attestations for everything deployed there, then widen namespace by namespace.
          </p>
          <p className="text-sm muted">
            <strong>Decide on failurePolicy deliberately.</strong> A webhook configured to fail
            closed blocks all matching Pod creation if Kyverno itself is unreachable &mdash; correct
            for a security-critical gate, but make sure Kyverno&apos;s own availability is monitored
            at least as closely as the policy it enforces, or an unrelated Kyverno outage becomes a
            cluster-wide deployment outage.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where this fits with CI scanning</h2>
          <p className="text-sm muted">
            Admission control is a backstop, not a replacement for the scanning covered in our{" "}
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              GitHub Actions guide
            </Link>{" "}
            and{" "}
            <Link href="/blog/container-scanning-best-practices" className="underline">
              container scanning best practices
            </Link>
            . CI scanning gives developers fast feedback before merge, when a fix is cheapest.
            Admission control guarantees the policy holds even when something bypasses CI entirely
            &mdash; the two layers check different failure modes and both are worth running.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is admission control for images?</h3>
              <p className="text-sm muted mt-1">
                A validating webhook Kubernetes calls before creating a Pod, which can reject the
                request based on the Pod&apos;s image &mdash; blocking vulnerable or unattested
                images from ever running.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why not just rely on CI scanning?</h3>
              <p className="text-sm muted mt-1">
                CI only covers pipelines that actually run it. Admission control catches manual
                deploys, rollbacks, and anything else that bypasses CI.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does this scan images at admission time?</h3>
              <p className="text-sm muted mt-1">
                No. The scan happens in CI; admission control verifies a signed attestation of that
                result, which is fast because no scan runs during Pod scheduling.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What if the webhook goes down?</h3>
              <p className="text-sm muted mt-1">
                Depends on <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">failurePolicy</code>.
                Fail closed blocks matching Pods until it recovers; fail open lets them through
                during the outage.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Attach ScanRook attestations to your images</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook produces JSON reports you can attach as cosign attestations yourself, so the
            same scan step your CI already runs becomes the source of truth an admission policy can
            enforce.
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
            <Link href="/blog/container-security-checklist" className="underline">
              Container Image Security Checklist
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              Installed-State Scanning vs. Advisory Matching
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
