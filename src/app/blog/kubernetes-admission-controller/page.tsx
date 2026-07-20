import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-30";

const title = `Admission Controllers in Kubernetes: How the Gate Works | ${APP_NAME}`;
const description =
  "How an admission controller in Kubernetes intercepts API requests: the mutating and validating phases, webhooks, CEL policies, failure modes, and safe rollout.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "admission controller kubernetes",
    "kubernetes admission controller",
    "validating admission webhook",
    "mutating admission webhook",
    "validatingadmissionpolicy",
    "kubernetes admission control",
    "opa gatekeeper",
    "kyverno policy",
    "kubernetes api server request flow",
    "admission webhook failurepolicy",
  ],
  alternates: { canonical: "/blog/kubernetes-admission-controller" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/kubernetes-admission-controller",
    images: ["/blog/kubernetes-admission-controller.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/kubernetes-admission-controller.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Admission Controllers in Kubernetes: How the Gate Works",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/kubernetes-admission-controller",
  image: "https://scanrook.io/blog/kubernetes-admission-controller.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is an admission controller in Kubernetes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An admission controller is code that intercepts requests to the Kubernetes API server after authentication and authorization but before the object is persisted to etcd. It can reject a request or modify the object being submitted. Many admission controllers are compiled into the API server as plugins; others are external services called through admission webhooks.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between mutating and validating admission?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Mutating admission runs first and may change the object, for example by injecting a sidecar or defaulting a field. Object schema validation then runs. Validating admission runs last and may only accept or reject; it cannot modify. The ordering exists so that validators always see the final object, including every mutation that was applied.",
      },
    },
    {
      "@type": "Question",
      name: "What happens if my admission webhook is down?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on failurePolicy. With Fail, the API server rejects requests the webhook was supposed to review, which can block deployments cluster-wide. With Ignore, the request proceeds unreviewed, which means the policy silently stops being enforced. Fail is the safer security posture but requires the webhook to be highly available and scoped narrowly.",
      },
    },
    {
      "@type": "Question",
      name: "Do I still need a webhook now that ValidatingAdmissionPolicy exists?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Often not. ValidatingAdmissionPolicy evaluates CEL expressions inside the API server, so there is no external service, no TLS certificate rotation, and no network hop. It suits rules expressible purely in terms of the incoming object. You still need a webhook when a decision requires external data, such as querying a vulnerability scan result for an image.",
      },
    },
    {
      "@type": "Question",
      name: "Can an admission controller block vulnerable container images?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, and it is one of the most common uses. A validating webhook inspects the pod spec, looks up scan results or signature attestations for each image reference, and rejects the request when the image is unsigned or exceeds a severity threshold. Because the lookup needs external data, this case genuinely requires a webhook rather than an in-process CEL policy.",
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
          <div className="text-xs uppercase tracking-wide muted">Architecture</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Admission Controllers in Kubernetes: How the Gate Works
          </h1>
          <p className="text-sm muted">Published December 30, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            An admission controller in Kubernetes is the last thing standing between an API request
            and etcd. It runs after the requester has been authenticated and authorised, and it gets
            to say &ldquo;no&rdquo; &mdash; or quietly rewrite the object before it is stored. Almost
            every cluster policy worth having lives here: image provenance, resource limits, pod
            security, sidecar injection. Understanding the phases, and their failure modes, is the
            difference between a policy that holds and one that takes the cluster down.
          </p>
        </header>

        <img
          src="/blog/kubernetes-admission-controller.jpg"
          alt="Kubernetes admission controller gating incoming API requests to a cluster"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where admission sits in the request path</h2>
          <p className="text-sm muted">
            Every write to the Kubernetes API travels the same road. Authentication establishes who
            is asking. Authorization &mdash; usually RBAC &mdash; decides whether that identity may
            perform this verb on this resource. Only then does admission control run, and it answers
            a different question: not <em>who</em> is asking, but <em>what</em> they are asking for.
          </p>
          <p className="text-sm muted">
            RBAC can let a team create pods in their namespace. It cannot express &ldquo;pods may not
            run privileged,&rdquo; &ldquo;every image must come from our registry,&rdquo; or
            &ldquo;every workload must set memory limits.&rdquo; Those are properties of the object,
            and admission control is the only place in the API server where object content is a
            policy input.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 250"
              role="img"
              aria-label="Kubernetes API request flow: authentication, then authorization, then mutating admission, then object schema validation, then validating admission, then persistence to etcd, with webhooks and CEL policies attaching to the two admission phases"
              className="w-full"
              style={{ minWidth: 600 }}
            >
              <defs>
                <marker id="ac-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              {[
                { x: 6, label: "AuthN" },
                { x: 118, label: "AuthZ" },
                { x: 230, label: "Mutating", hot: true },
                { x: 342, label: "Schema" },
                { x: 454, label: "Validating", hot: true },
                { x: 578, label: "etcd" },
              ].map((b) => (
                <g key={b.label}>
                  <rect
                    x={b.x}
                    y={22}
                    width={b.label === "etcd" ? 100 : 92}
                    height={44}
                    rx={7}
                    fill={b.hot ? "var(--dg-accent,#2563eb)" : "currentColor"}
                    fillOpacity={b.hot ? 0.14 : 0.04}
                    stroke="currentColor"
                    strokeOpacity={0.5}
                  />
                  <text x={b.x + (b.label === "etcd" ? 50 : 46)} y={49} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="currentColor">
                    {b.label}
                  </text>
                </g>
              ))}
              {[98, 210, 322, 434, 546].map((x) => (
                <line key={x} x1={x} y1={44} x2={x + 20} y2={44} stroke="currentColor" strokeWidth={2} markerEnd="url(#ac-arrow)" />
              ))}
              <text x={6} y={14} fontSize="10.5" fill="currentColor" fillOpacity={0.55}>
                request in
              </text>
              <text x={578} y={14} fontSize="10.5" fill="currentColor" fillOpacity={0.55}>
                persisted
              </text>

              <rect x={196} y={110} width={160} height={34} rx={6} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.3} />
              <text x={276} y={131} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.75}>
                may rewrite the object
              </text>
              <line x1={276} y1={110} x2={276} y2={70} stroke="currentColor" strokeWidth={1.6} markerEnd="url(#ac-arrow)" />

              <rect x={420} y={110} width={160} height={34} rx={6} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.3} />
              <text x={500} y={131} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.75}>
                accept or reject only
              </text>
              <line x1={500} y1={110} x2={500} y2={70} stroke="currentColor" strokeWidth={1.6} markerEnd="url(#ac-arrow)" />

              <rect x={150} y={180} width={460} height={40} rx={7} fill="currentColor" fillOpacity={0.04} stroke="currentColor" strokeOpacity={0.35} strokeDasharray="4 3" />
              <text x={380} y={198} textAnchor="middle" fontSize="11.5" fontWeight="600" fill="currentColor" fillOpacity={0.85}>
                Built-in plugins &middot; CEL admission policies &middot; external webhooks
              </text>
              <text x={380} y={213} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.6}>
                all three attach to the two highlighted phases
              </text>
            </svg>
          </div>
          <figcaption className="text-xs muted">
            The API server request path. Mutating admission runs before schema validation; validating
            admission runs last, so every validator sees the final, fully-mutated object.
          </figcaption>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Three kinds of admission controller</h2>
          <p className="text-sm muted">
            &ldquo;Admission controller&rdquo; covers three quite different implementations, and
            conflating them is the source of most confusion:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Kind</th>
                  <th className="text-left py-2 pr-4 font-semibold">Runs where</th>
                  <th className="text-left py-2 font-semibold">Best for</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Built-in plugins</strong></td>
                  <td className="py-2 pr-4 align-top">Compiled into the API server, toggled with <code className="text-xs">--enable-admission-plugins</code></td>
                  <td className="py-2 align-top">Core behaviour: namespace lifecycle, resource quota, service account tokens, pod security</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>CEL admission policies</strong></td>
                  <td className="py-2 pr-4 align-top">In-process, declared as cluster resources</td>
                  <td className="py-2 align-top">Rules expressible from the object alone &mdash; no external data, no extra service</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top"><strong>Admission webhooks</strong></td>
                  <td className="py-2 pr-4 align-top">An HTTPS service you run, called per request</td>
                  <td className="py-2 align-top">Decisions needing outside knowledge: scan results, signatures, registry metadata</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            Built-in plugins are enabled at API server startup, which on a managed cluster means you
            get whatever the provider enabled. Pod Security Admission is the notable one to
            understand, since it replaced PodSecurityPolicy &mdash; we cover its levels and rollout
            in the{" "}
            <Link href="/blog/pod-security-admission-guide" className="underline">
              Pod Security Admission guide
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Mutating first, validating last</h2>
          <p className="text-sm muted">
            The ordering is a deliberate design choice. Mutating webhooks run first and may patch the
            incoming object &mdash; injecting a service mesh sidecar, adding a default security
            context, stamping labels. The object is then validated against its schema. Only after all
            of that do validating webhooks run, and they may not modify anything; they return allowed
            or not allowed with a message.
          </p>
          <p className="text-sm muted">
            Because a mutation can invalidate what an earlier mutation assumed, the API server may
            re-invoke mutating webhooks that opt in via{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">reinvocationPolicy: IfNeeded</code>.
            Write mutating logic to be idempotent &mdash; assume it will run more than once on the
            same object, and make the second run a no-op.
          </p>
          <p className="text-sm muted">
            Validating webhooks run in parallel, which is why they are cheap to add but expensive to
            get wrong: any one of them can veto the request, and all of them are in the latency path
            of every matching API call.
          </p>
        </section>

        <img
          src="/blog/kubernetes-admission-controller-2.jpg"
          alt="Kubernetes policy engine evaluating admission rules against an incoming object"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Configuring a webhook safely</h2>
          <p className="text-sm muted">
            A webhook registration is a small object with several fields that decide whether your
            cluster survives a bad afternoon:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.05] dark:bg-white/[.05] p-4">
{`apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingWebhookConfiguration
metadata:
  name: image-policy
webhooks:
  - name: images.example.com
    admissionReviewVersions: ["v1"]
    sideEffects: None
    failurePolicy: Fail          # Fail = closed, Ignore = open
    timeoutSeconds: 5            # keep well under the API server request budget
    rules:
      - apiGroups: [""]
        apiVersions: ["v1"]
        operations: ["CREATE"]
        resources: ["pods"]
        scope: Namespaced
    namespaceSelector:           # never match kube-system or your own namespace
      matchExpressions:
        - key: kubernetes.io/metadata.name
          operator: NotIn
          values: ["kube-system", "policy-system"]
    clientConfig:
      service:
        name: image-policy
        namespace: policy-system
        path: /validate
        port: 443
      caBundle: <base64 CA cert>`}
          </pre>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>failurePolicy</strong> is the big decision.{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">Fail</code>{" "}
              means an unreachable webhook blocks every matching request &mdash; correct for
              security, catastrophic if the webhook is broadly scoped and its own pods cannot
              schedule.{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">Ignore</code>{" "}
              fails open, meaning your policy silently stops applying and nothing alerts you.
            </li>
            <li>
              <strong>Exclude the control plane and your own namespace.</strong> A fail-closed webhook
              that matches the namespace hosting the webhook itself is a self-locking cluster: the
              pods cannot be recreated because the webhook they implement is down.
            </li>
            <li>
              <strong>Scope the rules narrowly.</strong> Match the specific resources and operations
              you care about. Matching everything puts your service in the latency path of the whole
              cluster, including controller reconcile loops.
            </li>
            <li>
              <strong>Keep timeouts short</strong> and run at least two replicas with a
              PodDisruptionBudget. The API server is waiting on you synchronously.
            </li>
            <li>
              <strong>Use matchConditions</strong> where available to filter with a CEL expression
              before the network call, so most requests never leave the API server.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">CEL policies: skip the webhook when you can</h2>
          <p className="text-sm muted">
            ValidatingAdmissionPolicy lets you express validation as CEL evaluated inside the API
            server &mdash; no service to run, no TLS certificate to rotate, no network hop, and no
            way for the policy to be &ldquo;down.&rdquo; It reached general availability in
            Kubernetes 1.30, and more recent releases have been extending the same model to mutation,
            so check what your cluster version supports before designing around it.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.05] dark:bg-white/[.05] p-4">
{`apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingAdmissionPolicy
metadata:
  name: require-memory-limits
spec:
  failurePolicy: Fail
  matchConstraints:
    resourceRules:
      - apiGroups: ["apps"]
        apiVersions: ["v1"]
        operations: ["CREATE", "UPDATE"]
        resources: ["deployments"]
  validations:
    - expression: >-
        object.spec.template.spec.containers.all(c,
          has(c.resources) && has(c.resources.limits) &&
          has(c.resources.limits.memory))
      message: "every container must set a memory limit"`}
          </pre>
          <p className="text-sm muted">
            A separate{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">ValidatingAdmissionPolicyBinding</code>{" "}
            attaches the policy to a set of namespaces and chooses the enforcement action, which lets
            you roll a rule out in a warn or audit mode first and promote it to deny once you know
            what it would have broken.
          </p>
          <p className="text-sm muted">
            The rule of thumb: if the decision can be made from the object in front of you, use a CEL
            policy. If it needs to consult something outside the cluster, you need a webhook. Policy
            engines such as OPA Gatekeeper and Kyverno sit on the webhook side and add a policy
            language, a template library, audit reporting, and dry-run tooling on top &mdash; worth
            it once you have more than a handful of rules to maintain.
          </p>
        </section>

        <img
          src="/blog/kubernetes-admission-controller-3.jpg"
          alt="Admission webhook request path with timeout and failure policy considerations"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Rolling out a policy without an outage</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li><strong>Start in audit or warn mode.</strong> Log what would have been denied for a full release cycle before you enforce.</li>
            <li><strong>Scope by namespace label first.</strong> Enforce on one team&apos;s namespaces, then widen.</li>
            <li><strong>Always exclude kube-system</strong> and the namespace running your policy service.</li>
            <li><strong>Return actionable messages.</strong> &ldquo;Denied by policy&rdquo; sends someone to Slack; naming the field and the fix does not.</li>
            <li><strong>Monitor webhook latency and error rate.</strong> A slow webhook degrades every matching API call in the cluster.</li>
            <li><strong>Rehearse the break-glass path.</strong> Know exactly which command removes the configuration when the webhook is wedged, and who is allowed to run it.</li>
          </ul>
          <p className="text-sm muted">
            Admission control is enforcement, not detection. It stops a bad object from being
            created; it does nothing about the workloads already running, or about a container that
            starts behaving badly after admission. Pair it with runtime controls &mdash;{" "}
            <Link href="/blog/container-runtime-security" className="underline">
              container runtime security
            </Link>{" "}
            and{" "}
            <Link href="/blog/kubernetes-network-policies" className="underline">
              network policies
            </Link>{" "}
            &mdash; rather than treating the gate as the whole defence.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            The most common security use of a validating webhook is refusing to admit images that
            fail policy: unsigned, from an unapproved registry, or carrying critical vulnerabilities.
            That decision genuinely needs external data, which is why it belongs in a webhook rather
            than a CEL expression &mdash; the API server has no idea what is inside{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">registry.example.com/api:sha256-…</code>.
          </p>
          <p className="text-sm muted">
            ScanRook produces the data that decision reads. Images are scanned before they reach a
            cluster, and each finding records the advisory source it came from &mdash; OSV, NVD, or
            Red Hat OVAL &mdash; along with a confidence tier. That matters at admission time, because
            a gate keyed on a raw critical count will block far more than a gate keyed on
            corroborated, fixable findings, and the second one is the policy teams actually keep
            enabled.
          </p>
          <p className="text-sm muted">
            We do not ship the webhook for you; plenty of good policy engines already do that job
            well. What we care about is that the verdict it enforces is accurate. If you are wiring
            this up, our walkthrough of{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              admission control with image scanning
            </Link>{" "}
            covers the integration shape, and the{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              Kubernetes vulnerability scanning guide
            </Link>{" "}
            covers what to scan and when.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is an admission controller in Kubernetes?</h3>
              <p className="text-sm muted mt-1">
                Code that intercepts API requests after authentication and authorization but before
                persistence, and can reject or modify the submitted object.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Mutating vs validating &mdash; what is the difference?</h3>
              <p className="text-sm muted mt-1">
                Mutating runs first and may change the object; validating runs last and may only
                accept or reject, so it always sees the final version.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What if the webhook is unavailable?</h3>
              <p className="text-sm muted mt-1">
                With{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">failurePolicy: Fail</code>{" "}
                matching requests are rejected. With{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">Ignore</code>{" "}
                they proceed unreviewed and the policy silently stops applying.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">When do I still need a webhook?</h3>
              <p className="text-sm muted mt-1">
                When the decision requires data the API server does not have &mdash; scan results,
                signature attestations, or registry metadata for an image reference.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Give your admission gate better data</h3>
          <p className="text-sm muted leading-relaxed">
            A block-on-critical policy is only as good as the scan behind it. ScanRook records the
            advisory source and confidence tier for every finding, so you can gate on corroborated,
            fixable results instead of a raw count.
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
              Admission Control with Image Scanning
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
