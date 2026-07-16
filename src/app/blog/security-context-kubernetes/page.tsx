import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-17";

const title = `Security Context in Kubernetes: Harden Pods and Containers | ${APP_NAME}`;
const description =
  "A Kubernetes securityContext hardens pods and containers: runAsNonRoot, dropped capabilities, no privilege escalation, read-only root FS, and how to enforce it.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "security context kubernetes",
    "kubernetes securitycontext",
    "pod security context",
    "container security context",
    "runasnonroot",
    "allowprivilegeescalation",
    "readonlyrootfilesystem",
    "drop capabilities kubernetes",
    "kubernetes pod hardening",
    "seccomp runtimedefault",
  ],
  alternates: { canonical: "/blog/security-context-kubernetes" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/security-context-kubernetes",
    images: ["/blog/security-context-kubernetes.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/security-context-kubernetes.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Security Context in Kubernetes: Harden Pods and Containers",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/security-context-kubernetes",
  image: "https://scanrook.io/blog/security-context-kubernetes.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a securityContext in Kubernetes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A securityContext is a field on a Kubernetes Pod or container that defines privilege and access-control settings for the process it runs. It controls things like which user ID the container runs as, whether it can escalate privileges, which Linux capabilities it holds, and whether its root filesystem is read-only. It is the primary way you harden a workload at runtime.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between pod-level and container-level securityContext?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The pod-level securityContext sets defaults that apply to every container in the pod and controls pod-wide settings like fsGroup and sysctls. The container-level securityContext applies to a single container and controls container-only settings like privileged, allowPrivilegeEscalation, readOnlyRootFilesystem, and capabilities. Where both set the same field, the container-level value wins.",
      },
    },
    {
      "@type": "Question",
      name: "What does runAsNonRoot do?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Setting runAsNonRoot to true tells the kubelet to refuse to start the container if it would run as UID 0. It is a guardrail: rather than trusting that the image drops root, Kubernetes verifies it at admission time. Pair it with an explicit runAsUser so the container has a defined non-root identity even if the image does not specify one.",
      },
    },
    {
      "@type": "Question",
      name: "How do I enforce securityContext settings across a cluster?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use Pod Security Admission with the built-in Pod Security Standards, or a policy engine like Kyverno or OPA Gatekeeper. The Restricted Pod Security Standard effectively requires a hardened securityContext: non-root, no privilege escalation, all capabilities dropped, and a seccomp profile. Admission control rejects any workload that does not comply.",
      },
    },
    {
      "@type": "Question",
      name: "Does readOnlyRootFilesystem break my application?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It can, if the application writes to its own filesystem. The fix is not to disable it but to mount writable emptyDir volumes at the specific paths that need to be written, such as a temp directory or a cache. This keeps the rest of the filesystem immutable while allowing the few writes the app legitimately needs.",
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
            Security Context in Kubernetes: Harden Pods and Containers
          </h1>
          <p className="text-sm muted">Published December 17, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            By default, a Kubernetes container can run as root, hold a broad set of Linux
            capabilities, and write anywhere in its filesystem &mdash; more privilege than almost any
            workload actually needs. The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">securityContext</code>{" "}
            field is how you take that privilege away. This guide walks through what a security context
            is, the pod-versus-container distinction, the settings that matter most, and a hardened,
            copy-pasteable example.
          </p>
        </header>

        <img
          src="/blog/security-context-kubernetes.jpg"
          alt="Kubernetes securityContext for pods and containers"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What a security context is</h2>
          <p className="text-sm muted">
            A <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">securityContext</code>{" "}
            is a block of privilege and access-control settings you attach to a Pod or an individual
            container. It maps onto low-level Linux security primitives &mdash; user and group IDs,
            capabilities, seccomp profiles, SELinux labels &mdash; and lets you express least privilege
            declaratively in the manifest instead of relying on the image to do the right thing.
            Because containers share the host kernel, the difference between a locked-down and a
            wide-open security context is often the difference between a contained bug and a host
            compromise.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Pod level vs container level</h2>
          <p className="text-sm muted">
            There are two places a security context can live, and knowing which fields belong where
            saves a lot of confusion. The <strong>pod-level</strong> context
            (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">spec.securityContext</code>)
            sets defaults for every container and owns pod-wide settings. The{" "}
            <strong>container-level</strong> context
            (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">spec.containers[].securityContext</code>)
            applies to one container and owns the most important hardening switches. When both set the
            same field, the container value wins.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 720 288" role="img" aria-label="Kubernetes securityContext fields split by pod-level, shared, and container-level scope" className="w-full min-w-[560px]">
              <text x="360" y="22" fill="currentColor" fontSize="13" fontWeight="600" textAnchor="middle" opacity="0.85">
                Where each securityContext field lives
              </text>
              <g fill="none" stroke="currentColor">
                <rect x="18" y="40" width="212" height="230" rx="8" opacity="0.4" />
                <rect x="254" y="40" width="212" height="230" rx="8" opacity="0.4" />
                <rect x="490" y="40" width="212" height="230" rx="8" fill="var(--dg-accent,#2563eb)" fillOpacity="0.12" stroke="var(--dg-accent,#2563eb)" />
              </g>
              <g fill="currentColor">
                <text x="124" y="64" fontSize="13" fontWeight="600" textAnchor="middle">Pod-level only</text>
                <text x="360" y="64" fontSize="13" fontWeight="600" textAnchor="middle">Both (container wins)</text>
                <text x="596" y="64" fontSize="13" fontWeight="600" textAnchor="middle">Container-level only</text>
              </g>
              <g fill="currentColor" fontSize="12" opacity="0.8">
                <text x="34" y="96">fsGroup</text>
                <text x="34" y="122">supplementalGroups</text>
                <text x="34" y="148">sysctls</text>

                <text x="270" y="96">runAsNonRoot</text>
                <text x="270" y="122">runAsUser</text>
                <text x="270" y="148">runAsGroup</text>
                <text x="270" y="174">seccompProfile</text>
                <text x="270" y="200">seLinuxOptions</text>

                <text x="506" y="96">privileged</text>
                <text x="506" y="122">allowPrivilegeEscalation</text>
                <text x="506" y="148">readOnlyRootFilesystem</text>
                <text x="506" y="174">capabilities</text>
                <text x="506" y="200">procMount</text>
              </g>
              <text x="360" y="258" fill="currentColor" fontSize="11" opacity="0.6" textAnchor="middle">
                The container-level context holds the switches that most reduce blast radius
              </text>
            </svg>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The settings that matter most</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>runAsNonRoot: true</strong> &mdash; the kubelet refuses to start the container if
              it would run as UID 0. Combine with an explicit{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">runAsUser</code>{" "}
              so the identity is defined even when the image is silent. Running non-root is the single
              highest-leverage setting, and it echoes the goal of{" "}
              <Link href="/blog/docker-rootless-mode" className="underline">
                rootless containers
              </Link>{" "}
              at the orchestrator layer.
            </li>
            <li>
              <strong>allowPrivilegeEscalation: false</strong> &mdash; blocks a process from gaining
              more privileges than its parent, which neutralizes setuid-based escalation inside the
              container.
            </li>
            <li>
              <strong>privileged: false</strong> &mdash; a privileged container gets nearly all host
              capabilities and effectively defeats isolation. This should almost never be true.
            </li>
            <li>
              <strong>readOnlyRootFilesystem: true</strong> &mdash; makes the container filesystem
              immutable, so an attacker cannot drop a binary or modify code at runtime. Mount small
              writable volumes only where the app genuinely needs them.
            </li>
            <li>
              <strong>capabilities: drop [&quot;ALL&quot;]</strong> &mdash; start from zero Linux
              capabilities and add back only what is required (for example{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">NET_BIND_SERVICE</code>{" "}
              to bind a low port). Most workloads need none.
            </li>
            <li>
              <strong>seccompProfile: RuntimeDefault</strong> &mdash; applies the container
              runtime&apos;s default seccomp filter, which blocks dangerous syscalls the workload has no
              reason to make.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A hardened example</h2>
          <p className="text-sm muted">
            Here is a Deployment that applies the settings above. Pod-level context sets the identity
            and seccomp defaults; container-level context locks down privileges and the filesystem:
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
      securityContext:            # pod-level defaults
        runAsNonRoot: true
        runAsUser: 10001
        runAsGroup: 10001
        fsGroup: 10001
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: web
          image: registry.example.com/web@sha256:<digest>
          securityContext:        # container-level hardening
            allowPrivilegeEscalation: false
            privileged: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: ["ALL"]
              add: ["NET_BIND_SERVICE"]
          ports:
            - containerPort: 8080
          volumeMounts:
            - name: tmp
              mountPath: /tmp   # writable path for a read-only rootfs
      volumes:
        - name: tmp
          emptyDir: {}`}</pre>
          <p className="text-sm muted">
            The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">emptyDir</code>{" "}
            mounted at <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/tmp</code>{" "}
            is the practical answer to a read-only root filesystem: keep everything immutable except the
            handful of paths the app must write to.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Enforcing it across the cluster</h2>
          <p className="text-sm muted">
            Setting a good security context on one Deployment does not help the next team that forgets.
            To make hardening the default, enforce it at admission. The built-in{" "}
            <Link href="/blog/pod-security-standards-guide" className="underline">
              Pod Security Standards
            </Link>{" "}
            define a <strong>Restricted</strong> profile that essentially mandates the settings above,
            and{" "}
            <Link href="/blog/pod-security-admission-guide" className="underline">
              Pod Security Admission
            </Link>{" "}
            enforces it with a single namespace label. For custom rules &mdash; requiring a specific
            non-root UID range, say &mdash; a policy engine like Kyverno or OPA Gatekeeper can reject or
            mutate non-compliant workloads. Enforcement turns the security context from a per-manifest
            good intention into a cluster-wide guarantee.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Verifying it worked</h2>
          <p className="text-sm muted">
            Do not assume the settings took effect &mdash; check the running pod:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Confirm the container is not running as root
kubectl exec deploy/web -- id
# -> uid=10001 gid=10001 ...  (not uid=0)

# Confirm the root filesystem is read-only (this should fail)
kubectl exec deploy/web -- touch /root/test
# -> touch: /root/test: Read-only file system

# Inspect the applied securityContext
kubectl get pod -l app=web \\
  -o jsonpath='{.items[0].spec.containers[0].securityContext}'`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            A security context and a vulnerability scanner sit at different layers of{" "}
            defense-in-depth, and both matter. The security context is <em>runtime</em> hardening: it
            shrinks what a compromised container can do. ScanRook works <em>before</em> runtime &mdash;
            it scans the image you are about to ship for known CVEs and embedded secrets, so you fix
            problems at build time rather than containing them in production. The two reinforce each
            other in a concrete way: dropping root and capabilities is far easier on a small, clean,
            minimal image, and ScanRook helps you keep images that lean. To be clear about the boundary,
            ScanRook does not set or audit your securityContext fields &mdash; that is the job of Pod
            Security Admission and policy engines &mdash; and it pairs naturally with{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              cluster-side scanning
            </Link>
            . Harden the runtime <em>and</em> ship a clean image; neither substitutes for the other, as
            our{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              container security checklist
            </Link>{" "}
            lays out.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Does the container securityContext override the pod one?</h3>
              <p className="text-sm muted mt-1">
                For fields both support, yes &mdash; the container-level value takes precedence. Fields
                that exist only at the pod level, like fsGroup and sysctls, are not overridable per
                container.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is the difference between securityContext and Pod Security Standards?</h3>
              <p className="text-sm muted mt-1">
                The securityContext is the field you set on a workload. Pod Security Standards are
                predefined policy levels, enforced by Pod Security Admission, that check whether a
                workload&apos;s securityContext meets a bar like Restricted.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should I set runAsUser or rely on the image USER?</h3>
              <p className="text-sm muted mt-1">
                Setting an explicit runAsUser plus runAsNonRoot is safest, because it does not depend on
                the image doing the right thing and it fails closed if a future image change reintroduces
                root.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is privileged ever acceptable?</h3>
              <p className="text-sm muted mt-1">
                Rarely, and only for specific infrastructure workloads like certain CNI or storage
                agents. For application workloads, privileged should be false, and admission policy
                should block it.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Ship a clean image, then harden the runtime</h3>
          <p className="text-sm muted leading-relaxed">
            A locked-down securityContext is easiest on a small, non-root, CVE-free image. ScanRook
            scans your images for known vulnerabilities and baked-in secrets before they reach the
            cluster &mdash; the build-time half of defense in depth.
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
              Pod Security Standards
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/pod-security-admission-guide" className="underline">
              Pod Security Admission
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              Container Image Security Checklist
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
