import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-22";

const title = `Pod Security Admission: A Practical Kubernetes Guide | ${APP_NAME}`;
const description =
  "Pod Security Admission enforces the Pod Security Standards in Kubernetes with namespace labels. How to configure the enforce, audit, and warn modes safely.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "pod security admission",
    "pod security admission controller",
    "pod security standards",
    "kubernetes pod security",
    "psa kubernetes",
    "pod security admission labels",
    "restricted pod security standard",
    "podsecuritypolicy replacement",
    "kubernetes namespace security",
    "enforce audit warn kubernetes",
  ],
  alternates: { canonical: "/blog/pod-security-admission-guide" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/pod-security-admission-guide",
    images: ["/blog/pod-security-admission-guide.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/pod-security-admission-guide.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Pod Security Admission: A Practical Kubernetes Guide",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/pod-security-admission-guide",
  image: "https://scanrook.io/blog/pod-security-admission-guide.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Pod Security Admission?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pod Security Admission (PSA) is a built-in Kubernetes admission controller that enforces the Pod Security Standards at the namespace level. It became stable in Kubernetes v1.25 as the replacement for the removed PodSecurityPolicy. You apply it by adding labels to a namespace that select a standard (privileged, baseline, or restricted) and a mode (enforce, audit, or warn).",
      },
    },
    {
      "@type": "Question",
      name: "What are the three Pod Security Standards?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Privileged is unrestricted and places no limits on a Pod. Baseline blocks known privilege escalations such as host namespaces, privileged containers, and dangerous capabilities while staying easy to adopt. Restricted is the hardened profile: it requires running as non-root, dropping all capabilities except NET_BIND_SERVICE, disallowing privilege escalation, and setting a seccomp profile.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between the enforce, audit, and warn modes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Enforce rejects any Pod that violates the selected standard at admission time. Audit lets the Pod run but records a violation in the API server audit log. Warn lets the Pod run and returns a warning to the user who created it. You can set all three modes on one namespace at different levels, which is how you roll out a stricter standard without breaking existing workloads.",
      },
    },
    {
      "@type": "Question",
      name: "Does Pod Security Admission replace PodSecurityPolicy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. PodSecurityPolicy was deprecated in Kubernetes v1.21 and removed in v1.25, and Pod Security Admission is the built-in successor. PSA is simpler but less flexible: it only validates against three fixed standards and cannot mutate Pods. For fine-grained or custom policy you use an external admission controller such as Kyverno or OPA Gatekeeper alongside or instead of PSA.",
      },
    },
    {
      "@type": "Question",
      name: "Does Pod Security Admission scan images for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. PSA governs the runtime privileges a Pod requests, such as whether it runs as root or mounts host paths. It never looks inside the image, so it cannot tell you the container ships a vulnerable openssl or an outdated base layer. You still need an image or artifact scanner to catch known-vulnerable packages before deployment.",
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
            Pod Security Admission: A Practical Kubernetes Guide
          </h1>
          <p className="text-sm muted">Published August 22, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            When PodSecurityPolicy was removed in Kubernetes v1.25, many clusters lost their only
            guardrail against privileged Pods without a clear replacement. Pod Security Admission is
            the built-in answer, and it is refreshingly simple: a few namespace labels. This guide
            walks through configuring it safely &mdash; enforce, audit, and warn modes included.
          </p>
        </header>

        <img
          src="/blog/pod-security-admission-guide.jpg"
          alt="Pod Security Admission enforcing standards in a Kubernetes namespace"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The problem PSA solves</h2>
          <p className="text-sm muted">
            By default, Kubernetes will happily schedule a Pod that runs as root, mounts the host
            filesystem, or requests every Linux capability. Nothing stops it. PodSecurityPolicy used
            to be the mechanism that could, but it was hard to use correctly, was deprecated in
            v1.21, and was removed entirely in v1.25. Pod Security Admission (PSA) is the built-in
            replacement that went stable in v1.25.
          </p>
          <p className="text-sm muted">
            PSA enforces the <strong>Pod Security Standards</strong> &mdash; three predefined
            profiles maintained by the Kubernetes project. It runs as a built-in admission controller,
            so there is nothing to install: you turn it on per namespace with labels. That simplicity
            is both its strength and its limit, as we will see.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 1: Know the three standards</h2>
          <p className="text-sm muted">
            Every PSA decision selects one of three standards, from loosest to strictest:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Privileged</strong> &mdash; entirely unrestricted. Use it only for
              infrastructure workloads that legitimately need host access, like CNI plugins or node
              agents.
            </li>
            <li>
              <strong>Baseline</strong> &mdash; blocks the well-known privilege escalations: host
              namespaces (hostNetwork, hostPID, hostIPC), privileged containers, hostPath volumes,
              and adding capabilities beyond a small default set. It is designed to be adoptable by
              most existing applications without changes.
            </li>
            <li>
              <strong>Restricted</strong> &mdash; the hardened profile. It requires{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">runAsNonRoot</code>,
              disallows privilege escalation, drops all capabilities except{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">NET_BIND_SERVICE</code>,
              restricts volume types, and requires a seccomp profile of{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">RuntimeDefault</code>{" "}
              or <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">Localhost</code>.
            </li>
          </ul>
          <p className="text-sm muted">
            Restricted is the target for application namespaces. Baseline is a sensible interim step.
            Privileged should be a deliberate exception, granted namespace by namespace.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 2: Label a namespace</h2>
          <p className="text-sm muted">
            PSA is configured with labels of the form{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">pod-security.kubernetes.io/&lt;mode&gt;: &lt;level&gt;</code>.
            The three modes are independent, so a single namespace can warn and audit at{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">restricted</code>{" "}
            while only enforcing <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">baseline</code>:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`apiVersion: v1
kind: Namespace
metadata:
  name: payments
  labels:
    # Reject anything below baseline outright
    pod-security.kubernetes.io/enforce: baseline
    pod-security.kubernetes.io/enforce-version: v1.31
    # But surface everything that would fail the stricter profile
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/audit-version: v1.31
    pod-security.kubernetes.io/warn: restricted
    pod-security.kubernetes.io/warn-version: v1.31`}</pre>
          <p className="text-sm muted">
            Always pin the <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">-version</code>{" "}
            labels to a Kubernetes minor version. Without them the profile tracks the cluster&apos;s
            latest, so an upgrade can silently tighten enforcement and start rejecting Pods that used
            to be admitted.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 3: Make a Deployment restricted-compliant</h2>
          <p className="text-sm muted">
            A Pod passes the restricted standard by setting the right{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">securityContext</code>{" "}
            fields at both the Pod and container level. This Deployment is admitted under restricted:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 2
  selector:
    matchLabels: { app: web }
  template:
    metadata:
      labels: { app: web }
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: web
          image: registry.example.com/web@sha256:abc123
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: ["ALL"]
          ports:
            - containerPort: 8080`}</pre>
          <p className="text-sm muted">
            The four fields that matter most are{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">runAsNonRoot</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">allowPrivilegeEscalation: false</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">capabilities.drop: [ALL]</code>,
            and a <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">seccompProfile</code>.
            Notice the image is pinned by digest &mdash; a hardening habit worth keeping, and one we
            expand on in the{" "}
            <Link href="/blog/docker-image-hardening-checklist" className="underline">
              Docker image hardening checklist
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 4: Verify it worked</h2>
          <p className="text-sm muted">
            Prove the guardrail is live by trying to violate it. A privileged Pod applied to the
            enforced namespace should be rejected at admission:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# This should be rejected under an enforced baseline/restricted namespace
kubectl -n payments run rogue --image=busybox \\
  --overrides='{"spec":{"containers":[{"name":"rogue","image":"busybox","securityContext":{"privileged":true}}]}}' \\
  --command -- sleep 3600

# Expected: Error from server (Forbidden): pods "rogue" is forbidden:
# violates PodSecurity "baseline:v1.31": privileged (container "rogue"
# must not set securityContext.privileged=true)`}</pre>
          <p className="text-sm muted">
            You can also do a cluster-wide dry run before enforcing anything. Applying the label in{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">warn</code>{" "}
            mode first tells you exactly which existing workloads would break, without breaking them.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 5: Roll out without an outage</h2>
          <p className="text-sm muted">
            Flipping every namespace straight to <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">enforce: restricted</code>{" "}
            is the fastest way to break production. A safe sequence:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Start with <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">warn</code> and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">audit</code> at <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">restricted</code> everywhere. Collect the violations.</li>
            <li>Fix workloads, or grant Privileged only to the namespaces that truly need it.</li>
            <li>Set <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">enforce: baseline</code> once the obvious offenders are gone.</li>
            <li>Tighten to <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">enforce: restricted</code> namespace by namespace.</li>
          </ul>
          <p className="text-sm muted">
            You can also set a cluster-wide default so new namespaces are not left unprotected. That
            is done through an AdmissionConfiguration file passed to the API server, with per-namespace
            labels overriding the default where needed.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The limits of PSA</h2>
          <p className="text-sm muted">
            PSA is deliberately narrow. It is namespace-scoped, so the whole namespace shares one
            profile. It only validates against the three fixed standards &mdash; you cannot express
            &ldquo;allow this one capability but nothing else.&rdquo; And it never mutates a Pod: it
            will reject a non-compliant workload but will not add a missing securityContext for you.
          </p>
          <p className="text-sm muted">
            When you outgrow those limits, reach for a policy engine like Kyverno or OPA Gatekeeper,
            which can enforce custom rules, mutate resources to add safe defaults, and gate on things
            PSA never sees &mdash; including which images are even allowed to run. That last case
            overlaps with{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              admission control for image scanning
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            PSA controls what a Pod is <em>allowed to do</em> at runtime; it says nothing about what
            is <em>inside</em> the container. A workload can satisfy the restricted standard perfectly
            and still run an image shipping dozens of critical CVEs. Those are complementary controls,
            and you want both. ScanRook scans the artifact before it deploys &mdash; reading the real
            package databases in the image and matching every component against OSV, NVD, and Red Hat
            OVAL &mdash; so the images you admit under a hardened PSA policy are also free of
            known-vulnerable packages. Our{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              Kubernetes vulnerability scanning guide
            </Link>{" "}
            covers where that scan belongs in the pipeline.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Which Kubernetes version do I need for PSA?</h3>
              <p className="text-sm muted mt-1">
                Pod Security Admission is stable and enabled by default from Kubernetes v1.25 onward.
                On earlier versions it existed as a feature gate; PodSecurityPolicy was the mechanism
                before that and is fully removed as of v1.25.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can I exempt a namespace or user from PSA?</h3>
              <p className="text-sm muted mt-1">
                Yes. The AdmissionConfiguration for the controller supports exemptions by namespace,
                username, or runtime class. Use exemptions sparingly and document why each one exists,
                since they are silent holes in the policy.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Do I still need Kyverno or Gatekeeper?</h3>
              <p className="text-sm muted mt-1">
                Often, yes. PSA covers the Pod Security Standards well, but anything custom &mdash;
                required labels, allowed registries, image scanning gates, or mutation &mdash; needs a
                general-purpose policy engine. Many teams run PSA and Kyverno together.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Will enforcing restricted break my apps?</h3>
              <p className="text-sm muted mt-1">
                It can, if they run as root or escalate privileges. That is why you roll out with warn
                and audit first: they show you every workload that would fail before you enforce, so
                you fix them on your schedule rather than during an outage.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Lock down privileges, then scan what you admit</h3>
          <p className="text-sm muted leading-relaxed">
            Pod Security Admission decides what a Pod may do. ScanRook decides whether the image is
            safe to run in the first place &mdash; matching every package against OSV, NVD, and vendor
            advisory data, with each finding tagged by source and confidence.
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
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              Kubernetes Admission Control for Image Scanning
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              Container Image Security Checklist
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
