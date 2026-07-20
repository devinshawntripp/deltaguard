import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-20";

const title = `Kubernetes Security Best Practices: A Layered Guide | ${APP_NAME}`;
const description =
  "Kubernetes security best practices that matter in production: RBAC, Pod Security Admission, network policy, secrets, image provenance, and node hardening.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "kubernetes security best practices",
    "kubernetes hardening",
    "pod security admission",
    "kubernetes rbac best practices",
    "kubernetes network policy",
    "kubernetes secrets security",
    "kubernetes image scanning",
    "securitycontext kubernetes",
    "cis kubernetes benchmark",
    "kubernetes cluster security",
  ],
  alternates: { canonical: "/blog/kubernetes-security-best-practices" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/kubernetes-security-best-practices",
    images: ["/blog/kubernetes-security-best-practices.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/kubernetes-security-best-practices.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Kubernetes Security Best Practices: A Layered Guide",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/kubernetes-security-best-practices",
  image: "https://scanrook.io/blog/kubernetes-security-best-practices.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are the most important Kubernetes security best practices?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Scope RBAC tightly and audit it, enforce Pod Security Admission at the restricted level where possible, apply default-deny network policies per namespace, keep secrets out of manifests and encrypted at rest, scan and pin the images you deploy, and keep the node and control plane patched. These six controls cover the paths that real cluster compromises tend to use.",
      },
    },
    {
      "@type": "Question",
      name: "Is Pod Security Admission a replacement for PodSecurityPolicy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. PodSecurityPolicy was removed in Kubernetes 1.25 and Pod Security Admission is the built-in successor. It applies the Pod Security Standards, privileged, baseline, and restricted, at namespace granularity via labels, with enforce, audit, and warn modes so you can observe the impact before enforcing it.",
      },
    },
    {
      "@type": "Question",
      name: "Are Kubernetes Secrets encrypted?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not by default in a meaningful sense. Secret data is base64 encoded, not encrypted, and is stored in etcd. You need to enable encryption at rest with an EncryptionConfiguration, ideally backed by a KMS provider, and restrict which service accounts can read secrets through RBAC. Many teams additionally use an external secret store and sync into the cluster.",
      },
    },
    {
      "@type": "Question",
      name: "Should I scan images before or after deployment?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both, for different reasons. Scanning in CI catches problems before they reach a cluster and gives developers fast feedback. Scanning what is already running catches advisories published after deployment, which is the majority of the risk for a long-lived workload. An admission controller that rejects images failing policy is the enforcement point between the two.",
      },
    },
    {
      "@type": "Question",
      name: "How do I know if my cluster configuration is drifting?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Run a benchmark check on a schedule rather than once. The CIS Kubernetes Benchmark is the common reference, and kube-bench automates the checks against a running cluster. Combine it with periodic RBAC review, since permission creep is gradual and rarely shows up in any single change review.",
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
            Kubernetes Security Best Practices: A Layered Guide
          </h1>
          <p className="text-sm muted">Published November 20, 2026 &middot; 11 min read</p>
          <p className="text-sm muted">
            Kubernetes security best practices tend to be published as long undifferentiated lists,
            which is unhelpful when you have limited time and a running cluster. This guide organises
            them by layer &mdash; identity, workload, network, data, supply chain, and node &mdash; and
            says plainly which controls carry the most weight in each.
          </p>
        </header>

        <img
          src="/blog/kubernetes-security-best-practices.jpg"
          alt="Kubernetes cluster protected by layered security controls"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Think in layers, not in checklists</h2>
          <p className="text-sm muted">
            Most real cluster incidents follow a recognisable shape: an application vulnerability gives
            code execution in a pod, the pod has more privilege or reach than it needs, and a service
            account token or an overly permissive role turns a single container into cluster access.
            Each layer below breaks a link in that chain, which is why partial coverage is worth much
            less than it sounds &mdash; the attacker only needs the links you left intact.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Layer 1: identity and RBAC</h2>
          <p className="text-sm muted">
            RBAC is where the worst mistakes are cheapest to make. Binding{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">cluster-admin</code>{" "}
            to a service account &ldquo;temporarily&rdquo; is a two-line change that survives for years.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              Prefer namespaced <code className="text-xs">Role</code> and{" "}
              <code className="text-xs">RoleBinding</code> over their cluster-scoped equivalents. If a
              workload genuinely needs cluster scope, that should be a deliberate, reviewed decision.
            </li>
            <li>
              Avoid wildcards. A rule with{" "}
              <code className="text-xs">verbs: [&quot;*&quot;]</code> or{" "}
              <code className="text-xs">resources: [&quot;*&quot;]</code> is almost always broader than
              intended.
            </li>
            <li>
              Give every workload its own ServiceAccount. Sharing{" "}
              <code className="text-xs">default</code> means every permission granted to one pod is
              granted to all of them in that namespace.
            </li>
            <li>
              Turn off token mounting when it is not needed:{" "}
              <code className="text-xs">automountServiceAccountToken: false</code>. A pod with no API
              token is dramatically less useful to an attacker who lands inside it.
            </li>
            <li>
              Treat <code className="text-xs">escalate</code>, <code className="text-xs">bind</code>,
              and <code className="text-xs">impersonate</code> verbs, plus{" "}
              <code className="text-xs">pods/exec</code> and secret read access, as effectively
              administrative.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Layer 2: workload constraints and Pod Security Admission
          </h2>
          <p className="text-sm muted">
            PodSecurityPolicy was removed in Kubernetes 1.25. Its built-in replacement, Pod Security
            Admission, applies the three Pod Security Standards profiles at namespace granularity, and
            &mdash; crucially &mdash; supports warn and audit modes so you can measure the fallout
            before enforcing.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`apiVersion: v1
kind: Namespace
metadata:
  name: payments
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/enforce-version: latest
    pod-security.kubernetes.io/warn: restricted
    pod-security.kubernetes.io/audit: restricted`}
          </pre>
          <p className="text-sm muted">
            Start with <code className="text-xs">warn</code> and{" "}
            <code className="text-xs">audit</code> only, read the warnings for a release cycle, fix the
            manifests, then add <code className="text-xs">enforce</code>. The corresponding pod-level
            settings look like this:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 10001
    seccompProfile:
      type: RuntimeDefault
  containers:
    - name: app
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop: ["ALL"]`}
          </pre>
          <p className="text-sm muted">
            Those five fields block a large share of the container-escape techniques that get published.
            Our{" "}
            <Link href="/blog/pod-security-standards-guide" className="underline">
              Pod Security Standards guide
            </Link>{" "}
            and{" "}
            <Link href="/blog/security-context-kubernetes" className="underline">
              security context reference
            </Link>{" "}
            cover the individual settings in more depth.
          </p>
        </section>

        <img
          src="/blog/kubernetes-security-best-practices-2.jpg"
          alt="Admission control rejecting a non-compliant workload before it reaches the Kubernetes cluster"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Layer 3: network segmentation</h2>
          <p className="text-sm muted">
            A cluster with no network policy is a flat network: every pod can reach every other pod and
            most external endpoints. The baseline worth adopting is a per-namespace default deny, then
            explicit allows.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: payments
spec:
  podSelector: {}
  policyTypes: ["Ingress", "Egress"]`}
          </pre>
          <p className="text-sm muted">
            Remember to re-allow DNS immediately afterwards, or every workload in the namespace will
            fail in a way that looks like a cluster outage. If your CNI is Cilium, the same idea extends
            to DNS-name egress and HTTP-level rules &mdash; see{" "}
            <Link href="/blog/cilium-network-policy" className="underline">
              Cilium network policy
            </Link>
            . The vendor-neutral semantics are covered in{" "}
            <Link href="/blog/kubernetes-network-policies" className="underline">
              Kubernetes network policies
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Layer 4: secrets and data</h2>
          <p className="text-sm muted">
            The most common misconception in Kubernetes security is that Secrets are encrypted. They
            are base64-encoded objects in etcd. Without an{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">EncryptionConfiguration</code>{" "}
            &mdash; ideally KMS-backed &mdash; anyone with etcd access or an etcd backup has your
            credentials in cleartext.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>Enable encryption at rest, and confirm it applies to the <code className="text-xs">secrets</code> resource.</li>
            <li>Restrict <code className="text-xs">get</code> and <code className="text-xs">list</code> on secrets to the service accounts that genuinely need them.</li>
            <li>Prefer projected, short-lived tokens over long-lived static credentials wherever the platform supports it.</li>
            <li>Never commit secret manifests to Git in plaintext; use a sealed or external-secret mechanism.</li>
            <li>Remember that etcd backups inherit the same sensitivity as the cluster itself.</li>
          </ul>
          <p className="text-sm muted">
            Our{" "}
            <Link href="/blog/kubernetes-secrets-security" className="underline">
              Kubernetes secrets security
            </Link>{" "}
            article goes through the encryption configuration and the external-store patterns.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Layer 5: what you actually deploy
          </h2>
          <p className="text-sm muted">
            Every control above assumes the workload is trustworthy-ish. Supply chain controls decide
            whether that assumption holds. In rough order of value:
          </p>
          <ol className="text-sm muted list-decimal pl-5 grid gap-2">
            <li>
              <strong>Scan images in CI</strong> so problems surface before deployment, and{" "}
              <strong>rescan what is running</strong>, because most advisories affecting a long-lived
              workload are published after it shipped.
            </li>
            <li>
              <strong>Pin by digest, not tag.</strong> Mutable tags mean the thing you scanned and the
              thing that runs can differ.
            </li>
            <li>
              <strong>Restrict registries.</strong> An admission policy allowing only your own registry
              prevents a typo from pulling an unrelated public image.
            </li>
            <li>
              <strong>Gate at admission.</strong> An{" "}
              <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
                admission controller that checks scan results
              </Link>{" "}
              turns policy into enforcement rather than a report nobody reads.
            </li>
            <li>
              <strong>Verify signatures</strong> where you can, so &ldquo;this image came from our
              pipeline&rdquo; is a checkable claim.
            </li>
          </ol>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Layer 6: nodes and control plane</h2>
          <p className="text-sm muted">
            Node-level issues are less common but far worse when they happen &mdash; a kernel or
            container-runtime bug can undo every pod-level boundary above it. Keep node images and the
            container runtime patched, keep the kubelet&apos;s read-only and anonymous-auth surfaces
            closed, restrict who can reach the API server, and turn on audit logging so that a
            compromise is reconstructable afterwards. Running{" "}
            <Link href="/blog/kube-bench-cis-scanning" className="underline">
              kube-bench against the CIS Benchmark
            </Link>{" "}
            on a schedule is the cheapest way to catch configuration drift.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The layers, and what each one stops</h2>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 300"
              role="img"
              aria-label="Layer diagram of Kubernetes security controls from node and control plane at the base through supply chain, network, workload constraints, and identity at the top, each labelled with the attack step it interrupts"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              {[
                { label: "Identity / RBAC", stops: "Stops: token to cluster-admin" },
                { label: "Workload constraints", stops: "Stops: privilege escalation in pod" },
                { label: "Network policy", stops: "Stops: lateral movement" },
                { label: "Secrets handling", stops: "Stops: credential harvesting" },
                { label: "Supply chain / scanning", stops: "Stops: known-vulnerable code shipping" },
                { label: "Node & control plane", stops: "Stops: escape to host" },
              ].map((row, i) => {
                const y = 12 + i * 46;
                const inset = i * 14;
                return (
                  <g key={row.label}>
                    <rect
                      x={20 + inset}
                      y={y}
                      width={660 - inset * 2}
                      height={38}
                      rx={7}
                      fill="var(--dg-accent,#2563eb)"
                      fillOpacity={0.06 + i * 0.03}
                      stroke="currentColor"
                      strokeOpacity={0.35}
                    />
                    <text x={36 + inset} y={y + 24} fontSize="13" fontWeight="600" fill="currentColor">
                      {row.label}
                    </text>
                    <text x={664 - inset} y={y + 24} textAnchor="end" fontSize="10.5" fill="currentColor" fillOpacity={0.65}>
                      {row.stops}
                    </text>
                  </g>
                );
              })}
              <text x={20} y={294} fontSize="10" fill="currentColor" fillOpacity={0.55}>
                Structure, not measurement &mdash; layers are ordered by proximity to the workload, not by importance.
              </text>
            </svg>
            <figcaption className="text-xs muted mt-2">
              Each layer breaks a different step in the usual compromise chain. Skipping one does not
              weaken the stack proportionally &mdash; it removes a specific interrupt.
            </figcaption>
          </div>
        </section>

        <img
          src="/blog/kubernetes-security-best-practices-3.jpg"
          alt="Layered defence-in-depth rings around a Kubernetes workload"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">If you only do five things</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>Set <code className="text-xs">automountServiceAccountToken: false</code> as the default and opt in per workload.</li>
            <li>Label namespaces for Pod Security Admission, starting in warn mode.</li>
            <li>Add a default-deny NetworkPolicy per namespace, plus a DNS allow.</li>
            <li>Enable encryption at rest for secrets and audit who can read them.</li>
            <li>Scan images in CI and rescan what is deployed on a schedule.</li>
          </ul>
          <p className="text-sm muted">
            None of these require a new platform, and each one removes a step attackers rely on. The
            broader philosophy behind the ordering is the one in{" "}
            <Link href="/blog/defense-in-depth" className="underline">
              defence in depth
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook covers the supply-chain layer: knowing what is actually inside the images running
            in your cluster. It reads the real package databases inside a container image, binary, or
            source archive rather than inferring from filenames, and matches every package against OSV,
            NVD, and Red Hat OVAL in parallel. Each finding carries the source it came from and a
            confidence tier, which matters when you are deciding what to actually fix.
          </p>
          <p className="text-sm muted">
            It does not enforce RBAC, apply network policy, or harden your nodes &mdash; those are
            Kubernetes&apos; own controls and the tools above do them well. What it gives you is the
            input to the prioritisation question: given a fixed amount of patching effort, which
            workloads deserve it first. Our{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              Kubernetes vulnerability scanning guide
            </Link>{" "}
            covers how to wire that into a running cluster.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What replaced PodSecurityPolicy?</h3>
              <p className="text-sm muted mt-1">
                Pod Security Admission, built in since 1.25. It applies the Pod Security Standards per
                namespace via labels, with enforce, audit, and warn modes.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Are Kubernetes Secrets encrypted by default?</h3>
              <p className="text-sm muted mt-1">
                No. They are base64-encoded in etcd. You need an EncryptionConfiguration, preferably
                KMS-backed, plus RBAC restrictions on who can read them.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">CI scanning or runtime scanning?</h3>
              <p className="text-sm muted mt-1">
                Both. CI catches problems before deployment; rescanning what runs catches advisories
                published afterwards, which is most of them for a long-lived service.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I detect configuration drift?</h3>
              <p className="text-sm muted mt-1">
                Run CIS Benchmark checks on a schedule with kube-bench and review RBAC periodically.
                Permission creep rarely shows up in any single change review.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Start with what is already running</h3>
          <p className="text-sm muted leading-relaxed">
            Hardening is easier when you know which workloads carry the most exploitable surface. Scan
            the images behind your busiest namespaces and use the results to decide where the other
            layers matter most.
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
            <Link href="/blog/pod-security-standards-guide" className="underline">
              Pod Security Standards Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/kubernetes-secrets-security" className="underline">
              Kubernetes Secrets Security
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
