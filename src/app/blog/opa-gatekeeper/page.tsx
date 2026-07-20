import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-31";

const title = `OPA Gatekeeper: Kubernetes Policy Enforcement | ${APP_NAME}`;
const description =
  "How OPA Gatekeeper enforces policy at the Kubernetes admission layer: ConstraintTemplates, Constraints, Rego, audit mode, and where image scanning fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "opa gatekeeper",
    "gatekeeper kubernetes",
    "open policy agent gatekeeper",
    "constrainttemplate",
    "rego policy kubernetes",
    "kubernetes admission controller",
    "gatekeeper vs kyverno",
    "gatekeeper audit mode",
    "kubernetes policy enforcement",
    "validating admission webhook",
  ],
  alternates: { canonical: "/blog/opa-gatekeeper" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/opa-gatekeeper",
    images: ["/blog/opa-gatekeeper.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/opa-gatekeeper.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "OPA Gatekeeper: Kubernetes Policy Enforcement Explained",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/opa-gatekeeper",
  image: "https://scanrook.io/blog/opa-gatekeeper.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is OPA Gatekeeper?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "OPA Gatekeeper is a Kubernetes-native policy controller built on Open Policy Agent. It registers as a validating admission webhook, so the API server consults it before persisting any object, and evaluates the object against policies you define in Rego. It also runs a background audit that re-evaluates objects already in the cluster against current policy.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between a ConstraintTemplate and a Constraint?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A ConstraintTemplate defines the policy logic in Rego plus a parameter schema, and creating one generates a new CRD. A Constraint is an instance of that CRD: it selects which resource kinds and namespaces the policy applies to, supplies the parameters, and sets the enforcement action. One template can back many constraints with different scopes and thresholds.",
      },
    },
    {
      "@type": "Question",
      name: "How do I test a Gatekeeper policy without breaking deployments?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Set enforcementAction to dryrun on the Constraint. Gatekeeper will record violations in the constraint's status and in audit results without rejecting any admission request. Run in dryrun until the violation list is empty or every remaining item is a documented exception, then switch to deny.",
      },
    },
    {
      "@type": "Question",
      name: "Gatekeeper or Kyverno?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both are CNCF projects that enforce policy at admission. Gatekeeper uses Rego, which is more expressive and has a steeper learning curve, and inherits the wider Open Policy Agent ecosystem. Kyverno uses YAML-based policy definitions that most Kubernetes users can read immediately. Choose Rego if you need complex logic or already run OPA elsewhere; choose Kyverno if approachability matters more.",
      },
    },
    {
      "@type": "Question",
      name: "Can Gatekeeper block images with vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not by itself. Gatekeeper evaluates the Kubernetes object, and a Pod spec contains an image reference, not a vulnerability report. The workable pattern is to scan images in CI, record the result somewhere Gatekeeper can trust — typically a signature, an attestation, or an allowed-digest list — and write the constraint against that trusted marker rather than trying to scan at admission time.",
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
            OPA Gatekeeper: Kubernetes Policy Enforcement Explained
          </h1>
          <p className="text-sm muted">Published October 31, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            OPA Gatekeeper is what you reach for when documentation and code review stop being enough
            &mdash; when you need the cluster itself to refuse workloads that violate your rules.
            It plugs into the Kubernetes admission path, evaluates every incoming object against
            policies written in Rego, and rejects the ones that fail. This is a practical walkthrough
            of its architecture, the ConstraintTemplate and Constraint model, and the rollout mistakes
            that make teams give up on it.
          </p>
        </header>

        <img
          src="/blog/opa-gatekeeper.jpg"
          alt="OPA Gatekeeper acting as a policy barrier in the Kubernetes admission path"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What OPA Gatekeeper is</h2>
          <p className="text-sm muted">
            Open Policy Agent is a general-purpose policy engine: you feed it structured input, it
            evaluates rules written in a declarative language called Rego, and it returns a decision.
            It is not Kubernetes-specific &mdash; people use OPA for API authorization, Terraform
            plan review, and CI gating. <strong>Gatekeeper</strong> is the project that makes OPA
            native to Kubernetes.
          </p>
          <p className="text-sm muted">
            It does that in two ways. First, it registers itself as a{" "}
            <em>validating admission webhook</em>, so the API server calls out to Gatekeeper before
            persisting any object matching the webhook&apos;s rules. If Gatekeeper returns a
            violation, the API server rejects the request and the user sees the policy message in
            their <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kubectl apply</code>{" "}
            output. Second, it exposes policy as Kubernetes custom resources, so policies are objects
            you manage with the same GitOps workflow as everything else &mdash; no separate config
            file format, no separate deployment mechanism.
          </p>
          <p className="text-sm muted">
            There is a third piece that people underuse: the <strong>audit controller</strong>. It
            periodically re-evaluates objects that already exist in the cluster against current
            policy and writes violations into each Constraint&apos;s status. That matters because
            admission control only sees new and updated objects. Without audit, a policy you add
            today tells you nothing about the two hundred workloads deployed last year.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            How a request flows through Gatekeeper
          </h2>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 260"
              role="img"
              aria-label="Flow diagram: kubectl apply reaches the API server, authentication and authorization run, mutating admission runs, then the Gatekeeper validating webhook evaluates Rego constraints and either allows the object into etcd or rejects it"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <defs>
                <marker id="gk-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              {[
                { x: 6, label: "kubectl apply", sub: "or controller" },
                { x: 168, label: "AuthN / AuthZ", sub: "RBAC" },
                { x: 330, label: "Mutating", sub: "defaults injected" },
                { x: 492, label: "Gatekeeper", sub: "validating webhook", hot: true },
              ].map((b) => (
                <g key={b.label}>
                  <rect
                    x={b.x}
                    y={16}
                    width={140}
                    height={52}
                    rx={8}
                    fill={b.hot ? "var(--dg-accent,#2563eb)" : "transparent"}
                    fillOpacity={b.hot ? 0.12 : 1}
                    stroke="currentColor"
                    strokeOpacity={0.5}
                  />
                  <text x={b.x + 70} y={39} textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">
                    {b.label}
                  </text>
                  <text x={b.x + 70} y={57} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.6}>
                    {b.sub}
                  </text>
                </g>
              ))}
              {[150, 312, 474].map((x) => (
                <line key={x} x1={x} y1={42} x2={x + 16} y2={42} stroke="currentColor" strokeWidth={2} markerEnd="url(#gk-arrow)" />
              ))}

              {/* two outcomes */}
              <line x1={540} y1={68} x2={470} y2={112} stroke="currentColor" strokeWidth={2} markerEnd="url(#gk-arrow)" />
              <line x1={584} y1={68} x2={620} y2={112} stroke="currentColor" strokeWidth={2} markerEnd="url(#gk-arrow)" />
              <rect x={370} y={116} width={130} height={40} rx={7} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.35} />
              <text x={435} y={141} textAnchor="middle" fontSize="12" fill="currentColor" fillOpacity={0.8}>
                Rejected
              </text>
              <rect x={562} y={116} width={130} height={40} rx={7} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.35} />
              <text x={627} y={141} textAnchor="middle" fontSize="12" fill="currentColor" fillOpacity={0.8}>
                Stored in etcd
              </text>

              {/* policy inputs */}
              <rect x={430} y={186} width={262} height={30} rx={6} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.3} />
              <text x={561} y={205} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.75}>
                ConstraintTemplates (Rego) + Constraints (scope)
              </text>
              <line x1={561} y1={186} x2={561} y2={72} stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.5} strokeDasharray="4 3" />

              {/* audit loop */}
              <rect x={20} y={186} width={360} height={30} rx={6} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.3} />
              <text x={200} y={205} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.75}>
                Audit controller re-checks objects already in the cluster
              </text>
              <text x={200} y={238} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.55}>
                admission covers new objects · audit covers existing ones
              </text>
            </svg>
            <figcaption className="text-xs muted mt-2">
              Gatekeeper sits at the validating admission stage, after authentication, authorization,
              and mutation. The audit controller closes the gap for objects that predate a policy.
            </figcaption>
          </div>
          <p className="text-sm muted">
            The ordering matters more than it looks. Because Gatekeeper runs <em>after</em> mutating
            admission, it sees the object as it will actually be stored &mdash; including defaults
            injected by other controllers and sidecars added by a service mesh. Writing policy
            against the pre-mutation object is a common source of confusing false results.
          </p>
        </section>

        <img
          src="/blog/opa-gatekeeper-2.jpg"
          alt="Rego constraint rule tree evaluating Kubernetes objects in OPA Gatekeeper"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            ConstraintTemplates and Constraints
          </h2>
          <p className="text-sm muted">
            Gatekeeper splits policy into two objects, and understanding the split is most of
            learning the tool. A <strong>ConstraintTemplate</strong> holds the reusable logic: the
            Rego that decides what counts as a violation, plus a schema for the parameters that logic
            accepts. Creating one causes Gatekeeper to generate a new CRD.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8srequiredlabels
spec:
  crd:
    spec:
      names:
        kind: K8sRequiredLabels
      validation:
        openAPIV3Schema:
          type: object
          properties:
            labels:
              type: array
              items:
                type: string
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequiredlabels

        violation[{"msg": msg}] {
          required := input.parameters.labels[_]
          not input.review.object.metadata.labels[required]
          msg := sprintf("missing required label: %v", [required])
        }`}
          </pre>
          <p className="text-sm muted">
            A <strong>Constraint</strong> is an instance of that generated CRD. It says where the
            policy applies, what parameters to use, and how strictly to enforce:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequiredLabels
metadata:
  name: namespaces-must-have-owner
spec:
  enforcementAction: dryrun    # dryrun | warn | deny
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Namespace"]
    excludedNamespaces: ["kube-system", "gatekeeper-system"]
  parameters:
    labels: ["owner"]`}
          </pre>
          <p className="text-sm muted">
            The payoff of this split is reuse. One template, many constraints: require an{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">owner</code>{" "}
            label on namespaces in <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">deny</code>{" "}
            mode, and a <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">cost-centre</code>{" "}
            label on Deployments in <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">dryrun</code>,
            from the same Rego. You do not have to write Rego at all for common cases &mdash; the
            Gatekeeper community maintains a library of templates covering the usual controls
            (privileged containers, host namespaces, allowed repositories, required resource limits).
          </p>
          <p className="text-sm muted">
            Note the excluded namespaces. Excluding{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kube-system</code>{" "}
            and Gatekeeper&apos;s own namespace is not optional hygiene; a policy that blocks system
            components from being reconciled can render a cluster unrecoverable.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Rolling it out without an outage</h2>
          <p className="text-sm muted">
            Admission control is one of the few Kubernetes features that can take a cluster down on
            purpose. A deny-mode constraint with a bug will block deployments across every team at
            once, and a webhook that is unavailable can, depending on its failure policy, block
            everything. The rollout discipline is therefore worth following literally:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Start every constraint in <code className="text-xs">dryrun</code>.</strong>{" "}
              Violations land in the constraint status and audit results without rejecting anything.
              Read them, fix or document them, then promote.
            </li>
            <li>
              <strong>Use <code className="text-xs">warn</code> as the middle step.</strong> It
              surfaces the message to whoever runs <code className="text-xs">kubectl apply</code>{" "}
              while still allowing the object, which is the fastest way to teach a policy without
              blocking anyone.
            </li>
            <li>
              <strong>Scope narrowly at first.</strong> Match one namespace, prove the policy, then
              widen the match. A constraint with no namespace selector applies everywhere
              immediately.
            </li>
            <li>
              <strong>Think hard about failure policy.</strong>{" "}
              <code className="text-xs">failurePolicy: Fail</code> means an unavailable Gatekeeper
              blocks admissions &mdash; correct for a security control, dangerous if Gatekeeper is
              under-resourced or single-replica. Run multiple replicas with a pod disruption budget
              before you choose Fail.
            </li>
            <li>
              <strong>Write the violation message for the person who will see it.</strong> The
              developer who hits your policy at 4pm on a Friday should learn what to change from the
              message alone. &ldquo;violation&rdquo; is not a message.
            </li>
          </ul>
          <p className="text-sm muted">
            Before writing any custom policy, check whether{" "}
            <Link href="/blog/pod-security-admission-guide" className="underline">
              Pod Security Admission
            </Link>{" "}
            already covers what you need. It is built into Kubernetes, requires no webhook, and
            handles the large majority of container-hardening rules. Gatekeeper is for the policies
            PSA cannot express &mdash; registry allowlists, label and annotation conventions,
            cross-object invariants, and organisation-specific rules.
          </p>
        </section>

        <img
          src="/blog/opa-gatekeeper-3.jpg"
          alt="Gatekeeper dryrun audit mode reporting policy violations without blocking Kubernetes admission"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Gatekeeper and image security
          </h2>
          <p className="text-sm muted">
            A recurring ambition is &ldquo;use Gatekeeper to block images with critical CVEs.&rdquo;
            It does not work the way people expect, and it is worth being precise about why. What
            Gatekeeper sees at admission is a Kubernetes object. A Pod spec contains an image
            reference &mdash; a name and a tag or digest. It does not contain a vulnerability report,
            and Gatekeeper is not going to pull and analyse a multi-hundred-megabyte image inside an
            admission request that the API server expects to complete in seconds.
          </p>
          <p className="text-sm muted">
            The pattern that does work moves the expensive work earlier and leaves a trustworthy
            marker behind:
          </p>
          <ol className="text-sm muted list-decimal pl-5 grid gap-2">
            <li>
              <strong>Scan in CI.</strong> The build pipeline scans the artifact and applies your
              severity policy there, where a slow, thorough analysis is affordable.
            </li>
            <li>
              <strong>Record the verdict.</strong> Sign the image or attach an attestation &mdash;
              see{" "}
              <Link href="/blog/sigstore-cosign-container-signing" className="underline">
                Sigstore and Cosign
              </Link>{" "}
              &mdash; or push the passing digest to a controlled registry path.
            </li>
            <li>
              <strong>Enforce the marker at admission.</strong> A Gatekeeper constraint that requires
              images to come from an approved registry, or to be referenced by digest rather than a
              mutable tag, is a cheap check that Gatekeeper is genuinely good at.
            </li>
          </ol>
          <p className="text-sm muted">
            Requiring digests deserves its own mention. A tag is a mutable pointer; the image behind{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">app:v1.2.0</code>{" "}
            can change after you scanned it. A digest cannot. Any scan-then-enforce chain that
            references tags has a hole in the middle of it. We work through the full pattern in{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              admission control and image scanning
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook lives at step one of that chain. It scans container image tarballs, binaries,
            and source archives, reading the real package databases inside the artifact rather than
            inferring from file layout, and matching every package against OSV, NVD, and Red Hat OVAL
            in parallel. Each finding carries its advisory source and a confidence tier, which is
            what lets you set a defensible CI threshold instead of a threshold that fails on noise.
          </p>
          <p className="text-sm muted">
            We do not enforce at admission, and we do not think we should &mdash; Gatekeeper is
            already good at that and it runs where it needs to. The division of labour is clean: scan
            deeply in the pipeline where time is cheap, emit a signed verdict, and let Gatekeeper
            enforce the cheap invariant at the door. Our{" "}
            <Link href="/blog/sbom-generation-in-ci" className="underline">
              SBOM generation in CI
            </Link>{" "}
            guide covers producing the attestation half of that handoff.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is OPA Gatekeeper?</h3>
              <p className="text-sm muted mt-1">
                A Kubernetes policy controller built on Open Policy Agent. It registers as a
                validating admission webhook and evaluates incoming objects against Rego policies
                expressed as Kubernetes custom resources.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Template versus Constraint?</h3>
              <p className="text-sm muted mt-1">
                The ConstraintTemplate holds the Rego logic and parameter schema and generates a CRD.
                The Constraint instantiates it with a scope, parameters, and an enforcement action.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I roll out safely?</h3>
              <p className="text-sm muted mt-1">
                Start in <code className="text-xs">dryrun</code>, read the audit violations, promote
                to <code className="text-xs">warn</code>, then <code className="text-xs">deny</code>.
                Always exclude kube-system and the Gatekeeper namespace.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can it block vulnerable images?</h3>
              <p className="text-sm muted mt-1">
                Not directly. Scan in CI, record the verdict as a signature or approved digest, and
                write the Gatekeeper constraint against that marker.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Give your admission policy something to trust</h3>
          <p className="text-sm muted leading-relaxed">
            An allowed-registry constraint is only as good as what your pipeline puts in that
            registry. Scan an artifact with ScanRook &mdash; every finding carries its advisory
            source and a confidence tier, so your CI threshold means something.
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
              Admission Control and Image Scanning
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/pod-security-standards-guide" className="underline">
              Pod Security Standards
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
