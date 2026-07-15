import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-11";

const title = `Pod Security Standards: A Practical Kubernetes Guide | ${APP_NAME}`;
const description =
  "A practical guide to Kubernetes Pod Security Standards: the Privileged, Baseline, and Restricted profiles, Pod Security Admission, and enforcement.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "pod security standards",
    "kubernetes pod security standards",
    "pod security admission",
    "restricted pod security",
    "baseline pod security",
    "pod security policy replacement",
    "kubernetes pod security",
    "psa namespace labels",
    "pod securitycontext",
    "kubernetes hardening",
  ],
  alternates: { canonical: "/blog/pod-security-standards-guide" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/pod-security-standards-guide",
    images: ["/blog/pod-security-standards-guide.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/pod-security-standards-guide.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Pod Security Standards: A Practical Kubernetes Guide",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/pod-security-standards-guide",
  image: "https://scanrook.io/blog/pod-security-standards-guide.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are the Pod Security Standards?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Pod Security Standards are three predefined security profiles maintained by the Kubernetes project: Privileged, Baseline, and Restricted. Privileged is unrestricted, Baseline blocks known privilege escalations while staying broadly compatible, and Restricted enforces current pod-hardening best practices such as running as non-root and dropping all capabilities. They define what a pod is allowed to request.",
      },
    },
    {
      "@type": "Question",
      name: "What replaced PodSecurityPolicy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pod Security Admission replaced PodSecurityPolicy. PSP was deprecated in Kubernetes 1.21 and removed in 1.25. Its successor, Pod Security Admission, is a built-in admission controller that enforces the three Pod Security Standards profiles at the namespace level using labels, and it became stable in Kubernetes 1.25.",
      },
    },
    {
      "@type": "Question",
      name: "How do I enforce a Pod Security Standard?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Label the namespace. Set pod-security.kubernetes.io/enforce to privileged, baseline, or restricted, and optionally set warn and audit labels to the same or a stricter level. Pods that violate the enforced level are rejected at admission, while warn surfaces a message to the user and audit records it in the audit log without blocking.",
      },
    },
    {
      "@type": "Question",
      name: "What does the Restricted profile require?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Restricted requires runAsNonRoot set to true, allowPrivilegeEscalation set to false, all Linux capabilities dropped (only NET_BIND_SERVICE may be added back), a seccompProfile of RuntimeDefault or Localhost, restricted volume types, and no host namespaces or privileged mode. It encodes the hardening that most production workloads should meet.",
      },
    },
    {
      "@type": "Question",
      name: "Do Pod Security Standards check the container image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Pod Security Standards govern how a pod is allowed to run, not what is inside its image. A Restricted-compliant pod can still run an image full of critical CVEs. Pod Security Admission and image scanning are complementary controls: one constrains runtime privileges, the other checks the software you are shipping.",
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
            Pod Security Standards: A Practical Kubernetes Guide
          </h1>
          <p className="text-sm muted">Published August 11, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            Pod Security Standards are Kubernetes&apos; built-in answer to a simple question: what is
            a pod allowed to ask for? They replaced the removed PodSecurityPolicy with three clear
            profiles and a namespace-label enforcement model that takes minutes to apply. This guide
            covers the profiles, how Pod Security Admission enforces them, a Restricted-compliant pod
            you can copy, and where the model stops.
          </p>
        </header>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The three profiles</h2>
          <p className="text-sm muted">
            The Pod Security Standards define three profiles, from most permissive to most locked
            down. Each is a fixed set of rules maintained by the Kubernetes project, so you are
            adopting a shared definition rather than inventing your own.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Profile</th>
                  <th className="text-left py-2 pr-4 font-semibold">Intent</th>
                  <th className="text-left py-2 font-semibold">Typical use</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Privileged</strong></td>
                  <td className="py-2 pr-4 align-top">Unrestricted; allows known privilege escalation</td>
                  <td className="py-2 align-top">Trusted infra / system components only</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Baseline</strong></td>
                  <td className="py-2 pr-4 align-top">Blocks known privilege escalations; broadly compatible</td>
                  <td className="py-2 align-top">A safe minimum for general workloads</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top"><strong>Restricted</strong></td>
                  <td className="py-2 pr-4 align-top">Current pod-hardening best practices</td>
                  <td className="py-2 align-top">Production application workloads</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            Baseline exists to catch the obviously dangerous &mdash; privileged containers, host
            namespaces, host-path mounts, extra capabilities &mdash; without breaking normal apps.
            Restricted goes further and encodes the hardening you actually want in production.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">From PodSecurityPolicy to Pod Security Admission</h2>
          <p className="text-sm muted">
            If you remember <strong>PodSecurityPolicy</strong> (PSP), the profiles above are its
            spiritual successor. PSP was powerful but notoriously hard to get right &mdash; ordering
            was confusing, it could mutate pods, and a misconfigured policy could block every
            workload in a cluster. It was deprecated in Kubernetes 1.21 and removed in 1.25. Its
            replacement, <strong>Pod Security Admission</strong> (PSA), is a built-in admission
            controller that became stable in 1.25 and is enabled by default. PSA deliberately trades
            PSP&apos;s flexibility for simplicity: it does not mutate pods, and it enforces one of the
            three standard profiles per namespace rather than arbitrary custom rules.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Enforcing with namespace labels</h2>
          <p className="text-sm muted">
            PSA is configured entirely through namespace labels. Each of three <em>modes</em> &mdash;{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">enforce</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">warn</code>, and{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">audit</code>{" "}
            &mdash; takes one of the three profile levels. <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">enforce</code>{" "}
            rejects violating pods at admission; <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">warn</code>{" "}
            returns a message to whoever applied the manifest; <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">audit</code>{" "}
            records a violation in the audit log without blocking.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`apiVersion: v1
kind: Namespace
metadata:
  name: app
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/enforce-version: v1.31
    pod-security.kubernetes.io/warn: restricted
    pod-security.kubernetes.io/audit: restricted`}</pre>
          <p className="text-sm muted">
            Or apply it to an existing namespace directly:{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kubectl label ns app pod-security.kubernetes.io/enforce=restricted</code>.
            The optional <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">-version</code>{" "}
            suffix pins the ruleset to a Kubernetes minor version so a cluster upgrade cannot
            silently tighten what your pods must satisfy.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A Restricted-compliant pod</h2>
          <p className="text-sm muted">
            Here is a pod that satisfies the Restricted profile. The key fields are{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">runAsNonRoot</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">allowPrivilegeEscalation: false</code>,
            dropping all capabilities, and a <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">RuntimeDefault</code>{" "}
            seccomp profile.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`apiVersion: v1
kind: Pod
metadata:
  name: hardened
  namespace: app
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 10001
    seccompProfile:
      type: RuntimeDefault
  containers:
    - name: app
      image: myapp:1.4.2
      securityContext:
        allowPrivilegeEscalation: false
        privileged: false
        readOnlyRootFilesystem: true   # not required by Restricted, but recommended
        capabilities:
          drop: ["ALL"]
          # add: ["NET_BIND_SERVICE"]   # only if you must bind a port < 1024`}</pre>
          <p className="text-sm muted">
            Use a numeric <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">runAsUser</code>{" "}
            so the kubelet can verify the container is non-root &mdash; it cannot resolve a username
            from the image at admission time. These runtime settings mirror the image-side hardening
            in our{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              container image security checklist
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Baseline vs Restricted: what actually differs</h2>
          <p className="text-sm muted">
            The jump most teams feel is Baseline to Restricted, so it is worth being precise about
            what each one checks. <strong>Baseline</strong> blocks the well-known foot-guns while
            staying compatible with most existing manifests: no privileged containers, no host
            namespaces (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">hostNetwork</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">hostPID</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">hostIPC</code>), no
            host-path volumes or host ports, no adding capabilities beyond a small default set, and no
            unsafe sysctls. Crucially, a plain pod with no security context at all usually passes
            Baseline &mdash; that is what makes it a safe floor.
          </p>
          <p className="text-sm muted">
            <strong>Restricted</strong> is where pods must opt in explicitly. On top of everything
            Baseline forbids, it <em>requires</em> you to set{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">runAsNonRoot: true</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">allowPrivilegeEscalation: false</code>, a
            seccomp profile of <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">RuntimeDefault</code> or{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">Localhost</code>, all capabilities
            dropped (only <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">NET_BIND_SERVICE</code> may be
            re-added), and restricted volume types. Because those fields are usually absent by
            default, an existing workload that sailed through Baseline will typically fail Restricted
            until you add the security context &mdash; which is exactly why you roll it out in stages
            rather than flipping the switch blind.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Rolling it out safely</h2>
          <p className="text-sm muted">
            Do not jump straight to <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">enforce: restricted</code>{" "}
            on a live namespace &mdash; you will reject deployments and generate a bad afternoon.
            Roll out in stages:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Observe first.</strong> Set <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">warn</code>{" "}
              and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">audit</code>{" "}
              to <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">restricted</code>{" "}
              while leaving enforce at baseline or unset. You get the full list of violations without
              breaking anything.
            </li>
            <li>
              <strong>Fix the workloads.</strong> Add the security context above to each Deployment
              until the warnings stop.
            </li>
            <li>
              <strong>Then enforce.</strong> Flip <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">enforce</code>{" "}
              to restricted once the namespace is clean, and pin the version so upgrades are
              predictable.
            </li>
            <li>
              <strong>Keep infra separate.</strong> System components that genuinely need privileges
              belong in their own namespaces labeled Privileged or Baseline &mdash; do not weaken a
              whole cluster to accommodate one agent.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where Pod Security Admission stops</h2>
          <p className="text-sm muted">
            PSA is deliberately simple, and that simplicity is also its ceiling. It works at
            namespace granularity, cannot mutate pods to fix them, and only understands the three
            built-in profiles &mdash; you cannot express &ldquo;Restricted, but also require images
            from our registry&rdquo; or &ldquo;allow this one extra capability for this one workload.&rdquo;
            When you need policy that specific, reach for a general policy engine like Kyverno or OPA
            Gatekeeper, which can validate, mutate, and generate resources against custom rules. That
            is also how teams gate on image provenance and scan status at admission &mdash; covered in{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              Kubernetes admission control for image scanning
            </Link>
            . PSA and a policy engine coexist happily: use PSA for the baseline everywhere, and a
            policy engine for the rules PSA cannot express.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Pod Security Standards constrain <em>how</em> a pod runs; they say nothing about{" "}
            <em>what</em> is inside its image. A perfectly Restricted-compliant pod &mdash; non-root,
            no privilege escalation, all capabilities dropped &mdash; can still be running an image
            with a critical OpenSSL or glibc CVE, and PSA will happily admit it. The two controls
            answer different questions and belong together: PSA limits the blast radius if a workload
            is compromised, and image scanning reduces the chance of a compromise by catching the
            vulnerable software before it ships. ScanRook covers the image side, unpacking each layer
            and matching every package against OSV, NVD, and vendor advisory data. Wire a scan into
            CI and enforce Restricted in the cluster, and you have both halves. The image gate is
            detailed in our{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              Kubernetes vulnerability scanning guide
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What are the Pod Security Standards?</h3>
              <p className="text-sm muted mt-1">
                Three Kubernetes-maintained profiles &mdash; Privileged, Baseline, and Restricted
                &mdash; that define what a pod is allowed to request, from unrestricted to fully
                hardened.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What replaced PodSecurityPolicy?</h3>
              <p className="text-sm muted mt-1">
                Pod Security Admission, a built-in controller stable since Kubernetes 1.25. PSP was
                deprecated in 1.21 and removed in 1.25.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I enforce a profile?</h3>
              <p className="text-sm muted mt-1">
                Label the namespace with pod-security.kubernetes.io/enforce set to baseline or
                restricted, optionally adding warn and audit at the same or a stricter level.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does it check the image?</h3>
              <p className="text-sm muted mt-1">
                No. PSS governs runtime privileges, not image contents. A Restricted pod can still run
                a vulnerable image, so pair it with scanning.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Restricted pods, scanned images</h3>
          <p className="text-sm muted leading-relaxed">
            Enforce Restricted to constrain the runtime, and scan images so a hardened pod is not
            running vulnerable software. ScanRook unpacks every layer and matches each package
            against multiple advisory sources, with the source shown per finding.
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
