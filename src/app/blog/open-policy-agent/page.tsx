import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-27";

const title = `Open Policy Agent: Policy as Code, Explained | ${APP_NAME}`;
const description =
  "How Open Policy Agent works: the Rego language, the decision model, Gatekeeper and Conftest, and how to gate container image scan results with policy as code.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "open policy agent",
    "opa",
    "rego",
    "opa gatekeeper",
    "policy as code",
    "conftest",
    "kubernetes admission policy",
    "opa kubernetes",
    "opa rego examples",
    "container policy enforcement",
  ],
  alternates: { canonical: "/blog/open-policy-agent" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/open-policy-agent",
    images: ["/blog/open-policy-agent.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/open-policy-agent.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Open Policy Agent: Policy as Code, Explained",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/open-policy-agent",
  image: "https://scanrook.io/blog/open-policy-agent.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Open Policy Agent?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Open Policy Agent (OPA) is a general-purpose policy engine and a graduated CNCF project. It decouples policy decisions from application code: your service sends OPA a JSON document describing a request, OPA evaluates policies written in the Rego language against it, and returns a JSON decision. OPA does not enforce anything itself; the calling system enforces the decision it receives.",
      },
    },
    {
      "@type": "Question",
      name: "What is Rego?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Rego is OPA's declarative policy language. It is inspired by Datalog and built for querying nested JSON and YAML. Instead of writing imperative checks, you declare rules that are true when their conditions hold. Rules that produce no result are simply undefined, which is why most policies are written as deny or violation sets that stay empty when everything is fine.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between OPA and OPA Gatekeeper?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "OPA is the generic policy engine. Gatekeeper is a Kubernetes-specific project that runs OPA as a validating and mutating admission webhook and exposes policies as Kubernetes custom resources: ConstraintTemplates define the Rego, and Constraints instantiate them with parameters and scope. Gatekeeper also audits existing cluster resources against the same policies, not just new admissions.",
      },
    },
    {
      "@type": "Question",
      name: "Can Open Policy Agent block container images with vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, but only if it can see the vulnerability data. OPA has no scanner built in. The usual pattern is to run a scanner in CI or at admission time, feed the resulting report to OPA as input or as external data, and write a Rego rule that denies when the report exceeds a severity or count threshold. OPA supplies the decision logic, the scanner supplies the facts.",
      },
    },
    {
      "@type": "Question",
      name: "Is Conftest part of Open Policy Agent?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Conftest is a separate CLI in the Open Policy Agent organization that applies Rego policies to structured configuration files such as YAML, JSON, HCL, Dockerfiles, and INI. It is designed for CI pipelines: you point it at a policy directory and a set of files, and it fails the build when any deny rule matches. It uses the same Rego you would write for OPA itself.",
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
            Open Policy Agent: Policy as Code, Explained
          </h1>
          <p className="text-sm muted">Published September 27, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Open Policy Agent is the piece of infrastructure most teams end up needing once they have
            more than a handful of rules about what is allowed to ship. It takes decisions that were
            scattered across admission webhooks, CI scripts, and tribal knowledge and turns them into
            versioned policy you can test. Here is how OPA actually works, what Rego is doing under
            the hood, and how it fits next to container scanning.
          </p>
        </header>

        <img
          src="/blog/open-policy-agent.jpg"
          alt="Open Policy Agent evaluating requests against policy as code"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Open Policy Agent is</h2>
          <p className="text-sm muted">
            Open Policy Agent is a general-purpose policy engine and a graduated CNCF project. Its
            single job is to answer questions. A service hands OPA a JSON document describing
            something it is about to do &mdash; admit this pod, allow this API call, merge this
            Terraform plan &mdash; and OPA evaluates the policies it has loaded and returns a JSON
            answer. That is the entire contract.
          </p>
          <p className="text-sm muted">
            The important consequence is that <strong>OPA never enforces anything</strong>. It has no
            hooks into Kubernetes, no network interception, no agent on the node. Enforcement always
            belongs to the caller: the API server rejects the pod, the CI job exits non-zero, the
            gateway returns a 403. OPA is the decision, the caller is the action. Once that clicks,
            the deployment patterns below stop looking like separate products and start looking like
            the same engine wired up in different places.
          </p>
          <p className="text-sm muted">
            OPA evaluates three things together: <em>input</em> (the document describing the request),{" "}
            <em>data</em> (any external context you have loaded &mdash; an allowlist of registries, a
            table of image digests, an exception list), and the policies themselves. Everything is
            JSON, and everything is queryable with the same language.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How an OPA decision is made</h2>
          <p className="text-sm muted">
            The evaluation model is small enough to draw. A request arrives, it becomes{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">input</code>,
            it is evaluated against the rules in a package, and a document comes back:
          </p>
          <figure className="grid gap-2">
            <div className="overflow-x-auto surface-card p-4">
              <svg
                viewBox="0 0 700 250"
                role="img"
                aria-label="Open Policy Agent decision flow: a request becomes input JSON, is combined with external data and Rego policy inside OPA, and produces a decision document that the calling service enforces"
                className="w-full"
                style={{ minWidth: 560 }}
              >
                <defs>
                  <marker id="opa-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                  </marker>
                </defs>

                <rect x={8} y={86} width={130} height={54} rx={8} fill="transparent" stroke="currentColor" strokeOpacity={0.5} />
                <text x={73} y={109} textAnchor="middle" fontSize="13.5" fontWeight="600" fill="currentColor">Caller</text>
                <text x={73} y={127} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>API server / CI job</text>

                <rect x={248} y={70} width={200} height={86} rx={10} fill="var(--dg-accent,#2563eb)" fillOpacity={0.12} stroke="currentColor" strokeOpacity={0.5} />
                <text x={348} y={100} textAnchor="middle" fontSize="14" fontWeight="600" fill="currentColor">OPA</text>
                <text x={348} y={119} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.7}>Rego evaluation</text>
                <text x={348} y={136} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.55}>input + data + policy</text>

                <rect x={558} y={86} width={134} height={54} rx={8} fill="transparent" stroke="currentColor" strokeOpacity={0.5} />
                <text x={625} y={109} textAnchor="middle" fontSize="13.5" fontWeight="600" fill="currentColor">Decision</text>
                <text x={625} y={127} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>allow / deny set</text>

                <line x1={140} y1={113} x2={240} y2={113} stroke="currentColor" strokeWidth={2} markerEnd="url(#opa-arrow)" />
                <text x={190} y={104} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.6}>input</text>
                <line x1={450} y1={113} x2={550} y2={113} stroke="currentColor" strokeWidth={2} markerEnd="url(#opa-arrow)" />

                <rect x={238} y={14} width={220} height={30} rx={6} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.3} />
                <text x={348} y={33} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.75}>Rego policy bundles</text>
                <line x1={348} y1={44} x2={348} y2={64} stroke="currentColor" strokeWidth={2} markerEnd="url(#opa-arrow)" />

                <rect x={238} y={186} width={220} height={30} rx={6} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.3} />
                <text x={348} y={205} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.75}>External data: scan reports, allowlists</text>
                <line x1={348} y1={186} x2={348} y2={162} stroke="currentColor" strokeWidth={2} markerEnd="url(#opa-arrow)" />

                <path d="M625 140 L625 224 L73 224 L73 146" fill="none" stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.45} strokeDasharray="4 3" markerEnd="url(#opa-arrow)" />
                <text x={349} y={238} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.55}>enforcement happens here, not in OPA</text>
              </svg>
            </div>
            <figcaption className="text-xs muted">
              OPA combines request input, external data, and policy bundles into a decision document.
              The calling system is always the thing that enforces it.
            </figcaption>
          </figure>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Rego in five minutes</h2>
          <p className="text-sm muted">
            Rego is declarative and query-shaped rather than imperative. You are not writing a
            function that walks a structure; you are declaring what must be true. A rule that finds
            nothing is <em>undefined</em> rather than false, which is why the dominant idiom is a set
            of violation messages that stays empty when the input is acceptable.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`package docker.images

import rego.v1

# Registries we are willing to run
allowed_registries := {"ghcr.io", "registry.internal.example.com"}

deny contains msg if {
    some container in input.spec.containers
    registry := split(container.image, "/")[0]
    not allowed_registries[registry]
    msg := sprintf("image %v is not from an approved registry", [container.image])
}

deny contains msg if {
    some container in input.spec.containers
    endswith(container.image, ":latest")
    msg := sprintf("image %v uses a mutable :latest tag", [container.image])
}`}
          </pre>
          <p className="text-sm muted">
            A few things to notice. <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">import rego.v1</code>{" "}
            opts into the modern syntax, where partial rules use{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">contains</code> and{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">if</code> explicitly &mdash;
            worth adopting now, because it is the direction the language has settled on. Every
            expression in a rule body is implicitly ANDed. Multiple rules with the same name are
            ORed. Iteration comes from{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">some</code> bindings rather
            than loops.
          </p>
          <p className="text-sm muted">You can evaluate that locally with nothing but the OPA binary:</p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`# one-shot evaluation against a JSON input document
opa eval -i pod.json -d policy/ --format pretty 'data.docker.images.deny'

# run the unit tests that live in *_test.rego next to the policy
opa test policy/ -v

# serve decisions over HTTP for a sidecar deployment
opa run --server --addr :8181 policy/`}
          </pre>
          <p className="text-sm muted">
            The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">opa test</code> part is
            the underrated half of policy as code. Rego has a first-class test runner, so a policy
            that blocks deployments can itself have a regression suite &mdash; which matters a lot
            the first time a policy accidentally denies every workload in a cluster.
          </p>
        </section>

        <img
          src="/blog/open-policy-agent-2.jpg"
          alt="Rego policy rules branching a request into allow and deny decisions"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where OPA gets deployed</h2>
          <p className="text-sm muted">
            The same engine shows up in four common shapes, and choosing between them is mostly a
            question of how fast the decision has to be and who owns the policy.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Pattern</th>
                  <th className="text-left py-2 pr-4 font-semibold">Where it runs</th>
                  <th className="text-left py-2 font-semibold">Best for</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Conftest</strong></td>
                  <td className="py-2 pr-4 align-top">CI job, one-shot CLI</td>
                  <td className="py-2 align-top">Linting YAML, Terraform plans, Dockerfiles before merge</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Gatekeeper</strong></td>
                  <td className="py-2 pr-4 align-top">Kubernetes admission webhook</td>
                  <td className="py-2 align-top">Cluster-wide guardrails plus audit of what is already running</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Sidecar / daemon</strong></td>
                  <td className="py-2 pr-4 align-top">Next to a service, HTTP API</td>
                  <td className="py-2 align-top">Application authorization with sub-millisecond decisions</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top"><strong>Embedded library</strong></td>
                  <td className="py-2 pr-4 align-top">Inside a Go binary</td>
                  <td className="py-2 align-top">Tools that want Rego without shipping a second process</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            Gatekeeper is the one most people meet first. It wraps OPA as a validating admission
            webhook and models policy as Kubernetes resources, so a policy is something you{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kubectl apply</code>. A{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">ConstraintTemplate</code>{" "}
            carries the Rego and defines a new CRD; a <em>Constraint</em> instantiates it with
            parameters and a scope:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8sallowedregistries
spec:
  crd:
    spec:
      names:
        kind: K8sAllowedRegistries
      validation:
        openAPIV3Schema:
          type: object
          properties:
            registries:
              type: array
              items:
                type: string
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8sallowedregistries

        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          not startswith_any(container.image, input.parameters.registries)
          msg := sprintf("image %v is not from an approved registry", [container.image])
        }

        startswith_any(image, prefixes) {
          startswith(image, prefixes[_])
        }
---
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sAllowedRegistries
metadata:
  name: only-internal-registries
spec:
  enforcementAction: dryrun
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
    excludedNamespaces: ["kube-system"]
  parameters:
    registries:
      - "ghcr.io/our-org/"
      - "registry.internal.example.com/"`}
          </pre>
          <p className="text-sm muted">
            Note <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">enforcementAction: dryrun</code>.
            Ship every new constraint that way first. Gatekeeper will record violations in the
            constraint&apos;s status without blocking anything, which tells you exactly how much of
            your existing fleet would have been rejected before you flip it to{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">deny</code>. The same
            staged-rollout advice applies to the admission-time scanning patterns we cover in{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              Kubernetes admission control and image scanning
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Using Open Policy Agent to gate scan results</h2>
          <p className="text-sm muted">
            This is where OPA intersects with vulnerability management, and it is worth being precise
            about the division of labour: <strong>OPA has no scanner</strong>. It cannot look inside a
            container image, read an RPM database, or resolve a CVE. What it can do is reason
            beautifully about a scan report once something else has produced one.
          </p>
          <p className="text-sm muted">
            The practical shape is a two-step CI job. Scan, emit JSON, then hand that JSON to OPA or
            Conftest as input and let a Rego rule decide whether the build survives:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`# 1. produce a machine-readable report
scanrook scan image.tar --format json --out report.json

# 2. let policy decide whether it ships
conftest test report.json --policy policy/ --namespace scan.gate`}
          </pre>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`package scan.gate

import rego.v1

# Exceptions live in data, not in the rule, so they can be reviewed separately
accepted := {"CVE-2024-0000"}

deny contains msg if {
    some f in input.findings
    f.severity == "CRITICAL"
    not accepted[f.id]
    msg := sprintf("%v (%v) in %v has no accepted exception", [f.id, f.severity, f.package])
}

deny contains msg if {
    count([f | some f in input.findings; f.severity == "HIGH"]) > 25
    msg := "more than 25 high-severity findings"
}`}
          </pre>
          <p className="text-sm muted">
            Two design points make this hold up over time. First, keep exceptions in{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">data</code> rather than
            hard-coded in rules, so accepting a CVE is a reviewable diff with an owner and,
            ideally, an expiry. Second, do not gate on raw counts alone &mdash; a threshold that
            fires on every rebuild teaches people to bypass it. Severity plus exploitability signals
            makes a far better gate, which is the argument we make in{" "}
            <Link href="/blog/epss-vulnerability-prioritization" className="underline">
              prioritising vulnerabilities with EPSS
            </Link>{" "}
            and in our guide to{" "}
            <Link href="/blog/how-to-triage-vulnerability-scan-results" className="underline">
              triaging scan results
            </Link>
            .
          </p>
        </section>

        <img
          src="/blog/open-policy-agent-3.jpg"
          alt="Admission control policy blocking non-compliant container images at a cluster boundary"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where OPA fits next to the alternatives</h2>
          <p className="text-sm muted">
            OPA is not the only way to enforce rules on Kubernetes objects, and it is not always the
            lightest. Kubernetes ships built-in{" "}
            <Link href="/blog/pod-security-admission-guide" className="underline">
              Pod Security Admission
            </Link>{" "}
            for the specific case of workload security profiles, and it needs no extra components at
            all &mdash; if your requirement is &ldquo;enforce the restricted profile&rdquo;, use that
            and stop. Kubernetes also has a native Validating Admission Policy mechanism based on
            CEL, which covers a good share of simple object-shape rules without running a webhook.
          </p>
          <p className="text-sm muted">
            OPA earns its keep when policy has to span more than one domain. The same engine and the
            same language can check a Terraform plan, a Kubernetes manifest, an SBOM, a scan report,
            and an application authorization request &mdash; with shared helper functions and one
            test suite. That breadth is also why the infrastructure-as-code scanners are adjacent
            rather than competing: tools like{" "}
            <Link href="/blog/checkov" className="underline">Checkov</Link>,{" "}
            <Link href="/blog/kics" className="underline">KICS</Link>, and{" "}
            <Link href="/blog/terrascan" className="underline">Terrascan</Link>{" "}
            ship curated rule libraries out of the box, while OPA gives you an empty, extremely
            capable engine. Many teams run both: the packaged scanners for the well-known checks,
            Rego for the rules that are specific to their organisation.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Operating OPA once it is real</h2>
          <p className="text-sm muted">
            The gap between a working policy and a working policy <em>system</em> is mostly
            distribution and observability, and OPA has answers for both that are worth adopting
            early rather than retrofitting.
          </p>
          <p className="text-sm muted">
            <strong>Bundles</strong> are how policy gets to the engine. Rather than baking Rego into a
            container image, you publish a compressed bundle of policies and data to an HTTP endpoint
            or object store, and each OPA instance polls it on an interval and hot-swaps the contents
            on change. That gives you a single artifact to sign, version, and roll back, and it means
            updating a rule fleet-wide does not require redeploying anything. Bundles can also carry
            the <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">data</code>{" "}
            documents your rules read, which is the clean way to distribute exception lists and
            allowlists that change more often than the logic around them.
          </p>
          <p className="text-sm muted">
            <strong>Decision logs</strong> are the other half. OPA can emit a structured record of
            every decision it makes &mdash; the input, the result, the policy path, the timing &mdash;
            to a remote service or to stdout for your log pipeline to collect. This is what makes a
            policy layer auditable rather than merely opinionated: when someone asks why a deployment
            was rejected three weeks ago, the answer is a query rather than a guess. It is also how
            you find rules that are quietly never firing, which in a mature ruleset is a surprisingly
            common failure.
          </p>
          <p className="text-sm muted">
            Two operational habits round it out. Keep policies in their own repository with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">opa test</code>{" "}
            running in CI on every change, so a policy that would deny the world fails review rather
            than production. And measure evaluation cost:{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">opa eval --profile</code>{" "}
            reports where time goes in a rule, which matters once OPA is in the request path of an
            admission webhook and every slow evaluation is latency on a deployment.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            We are the facts, not the policy. ScanRook scans a container image tarball, a compiled
            binary, or a source archive and produces a structured JSON report in which every finding
            carries its package, version, severity, originating advisory source, and a confidence
            tier. That report is exactly the kind of document Rego is good at querying &mdash; nested,
            predictable, and machine-first.
          </p>
          <p className="text-sm muted">
            If you already run OPA or Gatekeeper, the integration is the boring one: run a scan,
            write the JSON, evaluate it. We deliberately do not try to own the decision layer,
            because policy about what is acceptable to ship belongs with you, versioned in your own
            repository, with its own tests and reviewers. The{" "}
            <Link href="/docs" className="underline">documentation</Link> covers the report schema,
            and{" "}
            <Link href="/blog/shift-left-security" className="underline">shift-left security</Link>{" "}
            covers where in the pipeline these gates tend to pay off. If you want a broader view of
            enforcement points across a cluster, our{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              Kubernetes vulnerability scanning guide
            </Link>{" "}
            walks through the full set.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is Open Policy Agent?</h3>
              <p className="text-sm muted mt-1">
                A graduated CNCF policy engine that evaluates JSON input against Rego policies and
                returns a JSON decision. It decides; the calling system enforces.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is Rego?</h3>
              <p className="text-sm muted mt-1">
                OPA&apos;s declarative policy language, inspired by Datalog and designed for querying
                nested JSON. Rules that match nothing are undefined rather than false.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">OPA or Gatekeeper?</h3>
              <p className="text-sm muted mt-1">
                Gatekeeper is OPA packaged for Kubernetes admission, with policies as custom
                resources and an audit loop over existing objects. Same engine, Kubernetes-native
                ergonomics.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can OPA block vulnerable images?</h3>
              <p className="text-sm muted mt-1">
                Only with scan data supplied to it. Run a scanner, feed the report to OPA as input or
                external data, and write a deny rule against it.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Give your policies better facts</h3>
          <p className="text-sm muted leading-relaxed">
            A policy gate is only as good as the report behind it. Scan an image with ScanRook and
            feed the JSON straight into Rego &mdash; every finding carries its advisory source and a
            confidence tier, so your rules can distinguish a confirmed match from a probable one.
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
              Kubernetes Admission Control and Image Scanning
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/checkov" className="underline">
              Checkov: Infrastructure as Code Scanning
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/pod-security-admission-guide" className="underline">
              Pod Security Admission Guide
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
