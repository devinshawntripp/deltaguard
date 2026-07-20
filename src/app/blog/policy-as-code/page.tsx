import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-09";

const title = `Policy as Code: How It Works and Where to Enforce It | ${APP_NAME}`;
const description =
  "Policy as code turns security rules into versioned, testable files. How OPA, Rego, Kyverno and Conftest work, where to enforce them, and how to avoid sprawl.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "policy as code",
    "policy as code tools",
    "open policy agent",
    "rego policy",
    "kyverno",
    "conftest",
    "admission control policy",
    "opa gatekeeper",
    "security policy automation",
    "compliance as code",
  ],
  alternates: { canonical: "/blog/policy-as-code" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/policy-as-code",
    images: ["/blog/policy-as-code.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/policy-as-code.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Policy as Code: How It Works and Where to Enforce It",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/policy-as-code",
  image: "https://scanrook.io/blog/policy-as-code.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is policy as code?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Policy as code is the practice of expressing rules that govern infrastructure and software delivery as machine-readable files kept in version control, rather than as prose in a wiki. Because the rules are code, they can be reviewed, tested, versioned, and evaluated automatically by a policy engine at build time, deploy time, or runtime.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between OPA and Kyverno?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Open Policy Agent is a general-purpose policy engine that evaluates any JSON or YAML input using the Rego language, so it works for Kubernetes, Terraform, CI configs, and application authorization alike. Kyverno is Kubernetes-specific and expresses policies as Kubernetes resources in YAML, which is easier to learn if your scope is only cluster admission but does not generalize outside it.",
      },
    },
    {
      "@type": "Question",
      name: "Where should policies be enforced?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In more than one place. Pre-commit and pull-request checks give the fastest feedback and let developers fix issues before merge. Admission control in the cluster is the enforcement point that cannot be bypassed by someone deploying manually. Runtime checks catch drift after deployment. The same rule can often be evaluated at all three stages.",
      },
    },
    {
      "@type": "Question",
      name: "Does policy as code replace vulnerability scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. A policy engine evaluates the facts it is given; it does not discover them. A scanner produces the facts about which packages and vulnerabilities exist in an artifact, and the policy decides what to do with them. They are complementary: the scanner answers what is true, the policy answers what is acceptable.",
      },
    },
    {
      "@type": "Question",
      name: "How do you test policy code?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Policy engines ship test frameworks. OPA has a built-in test runner that evaluates Rego test rules against fixture inputs, and Kyverno has a CLI test command that checks policies against sample resources. Treat these like any other unit tests: cover both the allow and deny cases, and run them in CI so a policy change cannot merge without passing.",
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
            Policy as Code: How It Works and Where to Enforce It
          </h1>
          <p className="text-sm muted">Published October 9, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Policy as code takes the rules that used to live in a security wiki &mdash; no containers
            run as root, no image without a signature, no critical CVE in production &mdash; and turns
            them into files that a machine evaluates on every change. The idea is simple. Getting the
            enforcement points, the failure modes, and the exception handling right is the part that
            takes thought.
          </p>
        </header>

        <img
          src="/blog/policy-as-code.jpg"
          alt="Policy as code: security rules expressed as versioned files evaluated by a policy engine"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What policy as code actually means</h2>
          <p className="text-sm muted">
            A policy is a rule about what is allowed. Traditionally those rules lived in documents and
            were enforced by humans in review: a checklist, a security sign-off, a Jira ticket that
            gates release. That works until change volume outruns review capacity, which in practice
            is quickly.
          </p>
          <p className="text-sm muted">
            Policy as code moves the rule into a file that a policy engine evaluates. The engine takes
            structured input &mdash; a Kubernetes manifest, a Terraform plan, a scan report, an image
            manifest &mdash; applies the rules, and returns a decision plus a reason. Because the rule
            is a file in Git, it gets the properties code gets: review, history, blame, tests, and
            gradual rollout.
          </p>
          <p className="text-sm muted">
            The important structural property is <em>separation of decision from enforcement</em>. The
            policy engine decides. Something else &mdash; a CI job, an admission webhook, a deployment
            controller &mdash; acts on the decision. That separation is what lets you evaluate the same
            rule at several points in the lifecycle without rewriting it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The tools people actually use</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Tool</th>
                  <th className="text-left py-2 pr-4 font-semibold">Language</th>
                  <th className="text-left py-2 pr-4 font-semibold">Scope</th>
                  <th className="text-left py-2 font-semibold">Typical use</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">
                    <strong>OPA</strong>
                  </td>
                  <td className="py-2 pr-4 align-top">Rego</td>
                  <td className="py-2 pr-4 align-top">Anything JSON/YAML</td>
                  <td className="py-2 align-top">
                    General policy engine; Gatekeeper for Kubernetes admission
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">
                    <strong>Kyverno</strong>
                  </td>
                  <td className="py-2 pr-4 align-top">YAML</td>
                  <td className="py-2 pr-4 align-top">Kubernetes</td>
                  <td className="py-2 align-top">
                    Admission validate/mutate/generate without learning a new language
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">
                    <strong>Conftest</strong>
                  </td>
                  <td className="py-2 pr-4 align-top">Rego</td>
                  <td className="py-2 pr-4 align-top">Config files</td>
                  <td className="py-2 align-top">
                    CI checks on Dockerfiles, manifests, Terraform, CI configs
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">
                    <strong>Checkov / KICS</strong>
                  </td>
                  <td className="py-2 pr-4 align-top">Python / JSON rules</td>
                  <td className="py-2 pr-4 align-top">IaC</td>
                  <td className="py-2 align-top">
                    Large prewritten rule libraries for Terraform, CloudFormation, K8s
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">
                    <strong>Kubernetes VAP</strong>
                  </td>
                  <td className="py-2 pr-4 align-top">CEL</td>
                  <td className="py-2 pr-4 align-top">Kubernetes</td>
                  <td className="py-2 align-top">
                    In-tree validating admission policy, no extra webhook to run
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            The two most consequential choices are OPA versus Kyverno for cluster admission, and
            whether to write your own rules or adopt a library. If your policy scope extends beyond
            Kubernetes &mdash; Terraform plans, CI pipeline configs, application authorization &mdash;
            OPA&apos;s generality pays for the cost of learning Rego. If you only care about admission,
            Kyverno&apos;s YAML policies are faster to get right and easier for the rest of the team to
            read. For infrastructure-as-code specifically, the prewritten rule sets in{" "}
            <Link href="/blog/checkov" className="underline">
              Checkov
            </Link>{" "}
            and{" "}
            <Link href="/blog/kics" className="underline">
              KICS
            </Link>{" "}
            get you further on day one than hand-written policy will.
          </p>
        </section>

        <img
          src="/blog/policy-as-code-2.jpg"
          alt="Policy as code enforcement gate blocking a non-compliant deployment"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Writing a policy, concretely</h2>
          <p className="text-sm muted">
            Here is the same rule &mdash; containers must not run as root &mdash; in two dialects. In
            Rego, evaluated by Conftest or Gatekeeper:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <pre className="text-xs leading-relaxed"><code>{`package main

deny contains msg if {
  input.kind == "Deployment"
  c := input.spec.template.spec.containers[_]
  not c.securityContext.runAsNonRoot
  msg := sprintf("container %q must set securityContext.runAsNonRoot", [c.name])
}`}</code></pre>
          </div>
          <p className="text-sm muted">And in Kyverno, as a Kubernetes resource:</p>
          <div className="overflow-x-auto surface-card p-4">
            <pre className="text-xs leading-relaxed"><code>{`apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-run-as-non-root
spec:
  validationFailureAction: Audit   # switch to Enforce after a soak period
  background: true
  rules:
    - name: check-run-as-non-root
      match:
        any:
          - resources:
              kinds: ["Pod"]
      validate:
        message: "Containers must set securityContext.runAsNonRoot: true"
        pattern:
          spec:
            containers:
              - securityContext:
                  runAsNonRoot: true`}</code></pre>
          </div>
          <p className="text-sm muted">
            Note <code className="text-xs">validationFailureAction: Audit</code>. Shipping a new policy
            straight to <code className="text-xs">Enforce</code> is how you take down a deployment
            pipeline at 2am. Run in audit mode first, look at what it would have blocked, fix the
            legitimate violations, and only then enforce. Every mature policy engine has this dry-run
            concept and it is the single most useful operational habit in the practice.
          </p>
          <p className="text-sm muted">
            Test your policies like code. OPA has a built-in test runner &mdash;{" "}
            <code className="text-xs">opa test policy/ -v</code> &mdash; and Kyverno has{" "}
            <code className="text-xs">kyverno test</code>. Cover both directions: a resource that
            should be denied, and one that should pass. A policy with only deny-case tests will happily
            deny everything.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where to enforce: the four gates</h2>
          <p className="text-sm muted">
            The same rule can be checked at several points, and each point trades feedback speed
            against bypass resistance:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 220"
              role="img"
              aria-label="Flow diagram showing four policy enforcement gates: pre-commit, pull request CI, admission control, and runtime, with feedback speed decreasing and bypass resistance increasing from left to right"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <defs>
                <marker id="pac-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              {[
                { x: 8, label: "Pre-commit", sub: "seconds" },
                { x: 178, label: "CI / PR", sub: "minutes" },
                { x: 348, label: "Admission", sub: "at deploy", hot: true },
                { x: 518, label: "Runtime", sub: "continuous" },
              ].map((b) => (
                <g key={b.label}>
                  <rect
                    x={b.x}
                    y={26}
                    width={140}
                    height={54}
                    rx={8}
                    fill={b.hot ? "var(--dg-accent,#2563eb)" : "transparent"}
                    fillOpacity={b.hot ? 0.12 : 1}
                    stroke="currentColor"
                    strokeOpacity={0.5}
                  />
                  <text
                    x={b.x + 70}
                    y={50}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="600"
                    fill="currentColor"
                  >
                    {b.label}
                  </text>
                  <text
                    x={b.x + 70}
                    y={68}
                    textAnchor="middle"
                    fontSize="10.5"
                    fill="currentColor"
                    fillOpacity={0.6}
                  >
                    {b.sub}
                  </text>
                </g>
              ))}
              {[150, 320, 490].map((x) => (
                <line
                  key={x}
                  x1={x}
                  y1={53}
                  x2={x + 26}
                  y2={53}
                  stroke="currentColor"
                  strokeWidth={2}
                  markerEnd="url(#pac-arrow)"
                />
              ))}
              <line
                x1={20}
                y1={120}
                x2={670}
                y2={120}
                stroke="currentColor"
                strokeOpacity={0.3}
                strokeWidth={1.5}
                strokeDasharray="5 4"
              />
              <text x={20} y={140} fontSize="11" fill="currentColor" fillOpacity={0.7}>
                fastest feedback, easiest to skip
              </text>
              <text
                x={670}
                y={140}
                textAnchor="end"
                fontSize="11"
                fill="currentColor"
                fillOpacity={0.7}
              >
                slowest feedback, hardest to bypass
              </text>
              <text x={20} y={176} fontSize="11.5" fill="currentColor" fillOpacity={0.8}>
                Same policy source in Git &rarr; evaluated at every gate &rarr; one place to change a
                rule
              </text>
              <rect
                x={12}
                y={158}
                width={660}
                height={28}
                rx={6}
                fill="currentColor"
                fillOpacity={0.05}
                stroke="currentColor"
                strokeOpacity={0.25}
              />
            </svg>
            <figcaption className="text-xs muted mt-2">
              Policy enforcement gates ordered by feedback speed. Earlier gates are advisory in
              practice because they can be skipped; admission control is the one that holds.
            </figcaption>
          </div>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Pre-commit.</strong> Instant feedback in the editor or a Git hook. Great for
              developer experience, trivially bypassed with <code className="text-xs">--no-verify</code>.
              Treat as a convenience, not a control.
            </li>
            <li>
              <strong>Pull request CI.</strong> The right place for most checks: visible in review,
              blocking on merge, and cheap. This is where{" "}
              <Link href="/blog/shift-left-security" className="underline">
                shift-left security
              </Link>{" "}
              actually lands.
            </li>
            <li>
              <strong>Admission control.</strong> The cluster refuses non-compliant resources
              regardless of how they got there. This is the control that survives a manual{" "}
              <code className="text-xs">kubectl apply</code>. See{" "}
              <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
                admission control image scanning
              </Link>
              .
            </li>
            <li>
              <strong>Runtime.</strong> Continuous evaluation of what is actually running, catching
              drift and things that were admitted before a policy existed.
            </li>
          </ul>
        </section>

        <img
          src="/blog/policy-as-code-3.jpg"
          alt="Policy engine evaluating rules and producing allow and deny decisions"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Rules are only half of it &mdash; data and decisions are the other half
          </h2>
          <p className="text-sm muted">
            A rule almost never operates on the resource alone. &ldquo;Only deploy images from an
            approved registry&rdquo; needs the list of approved registries. &ldquo;Block anything with
            an unfixed critical vulnerability&rdquo; needs a scan report. &ldquo;Require an owner
            annotation matching a real team&rdquo; needs the team directory. Policy engines handle this
            as a separate input, usually called the data document, and how you keep that data current
            determines whether the policy is trustworthy.
          </p>
          <p className="text-sm muted">
            Bundling the data with the policy in version control is the simplest option and the right
            starting point: the approved-registry list is a small JSON file next to the rules,
            reviewed the same way. Pulling data at evaluation time from an external service is more
            current but introduces a dependency in the request path &mdash; if the lookup fails, you
            have to decide whether the policy fails open or closed, and that decision should be
            explicit rather than emergent.
          </p>
          <p className="text-sm muted">
            The other half is decision logging. A gate that blocks a deployment without recording why
            generates support tickets, and one that allows a deployment without recording that it was
            evaluated generates nothing an auditor can use. Log every decision with the rule that
            fired, the input identifier, and the outcome. That log is also your best data source for
            deciding which rules to promote from audit to enforce &mdash; a rule that has produced no
            violations in six weeks of audit mode is safe to enforce, and one that fires on half of
            all deployments needs a conversation before it blocks anything.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The failure modes</h2>
          <p className="text-sm muted">
            Policy as code programs go wrong in fairly predictable ways, and most of them are
            organisational rather than technical.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Rule sprawl.</strong> Adopting a 400-rule library wholesale produces hundreds of
              findings nobody triages, and the whole gate gets ignored. Start with five rules that
              matter and expand.
            </li>
            <li>
              <strong>No exception path.</strong> If there is no sanctioned way to get an exception,
              people will find an unsanctioned one. Exceptions should be expressible in the policy
              itself, scoped to a namespace or workload, with an expiry date and an owner.
            </li>
            <li>
              <strong>Admission webhooks as a single point of failure.</strong> A failing webhook with{" "}
              <code className="text-xs">failurePolicy: Fail</code> blocks all matching writes to the
              cluster. Set resource limits, run multiple replicas, and scope the webhook narrowly so a
              policy outage is not a cluster outage.
            </li>
            <li>
              <strong>Policies that outrun the facts.</strong> A rule like &ldquo;no critical
              CVEs&rdquo; only works if something is producing reliable vulnerability data. If the
              scanner behind it has thin coverage, the policy passes on images it should have blocked.
            </li>
            <li>
              <strong>Untested policy.</strong> Rego is a real language with real bugs. A rule that
              silently never matches is worse than no rule, because it produces false confidence.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Policy and compliance are not the same thing
          </h2>
          <p className="text-sm muted">
            Policy as code is often sold as compliance automation, and it does help &mdash; a rule
            file is far better evidence than a screenshot. But a framework control like &ldquo;the
            organisation shall manage vulnerabilities in container images&rdquo; is not one rule; it is
            a process, of which an automated check is one artifact. Map policies to controls
            explicitly and keep the mapping in the repo alongside the rules, or you will end up with a
            pile of policies and no way to answer an auditor&apos;s question.
          </p>
          <p className="text-sm muted">
            The container-specific control sets are a good source of rules that are worth encoding:{" "}
            <Link href="/blog/nist-800-190" className="underline">
              NIST SP 800-190
            </Link>{" "}
            for the container lifecycle and{" "}
            <Link href="/blog/cis-benchmarks-explained" className="underline">
              CIS Benchmarks
            </Link>{" "}
            for concrete configuration settings. Both translate cleanly into machine-checkable
            assertions, which is exactly what you want for a first policy set.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            A policy engine is a decision function over facts it is handed. It does not know what
            packages are in your image or which of them have known vulnerabilities &mdash; something
            has to produce that input. That is the scanner&apos;s job, and the quality of the policy
            is bounded by the quality of the facts.
          </p>
          <p className="text-sm muted">
            ScanRook emits a structured JSON report you can feed directly to a policy engine. A
            typical CI gate looks like this:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <pre className="text-xs leading-relaxed"><code>{`curl -fsSL https://scanrook.io/install.sh | sh

docker save myapp:1.0 -o image.tar
scanrook scan image.tar --format json --out report.json

# evaluate your own rules against the scan result
conftest test report.json --policy policy/`}</code></pre>
          </div>
          <p className="text-sm muted">
            Because ScanRook reads the real package databases inside the image and matches against
            OSV, NVD, and Red Hat OVAL rather than a single aggregated database, each finding carries
            the source it came from and a confidence tier. That matters for policy authoring: you can
            write a rule that blocks on high-confidence critical findings while merely warning on
            lower-confidence matches, instead of treating every entry in the report identically. The{" "}
            <Link href="/docs" className="underline">
              docs
            </Link>{" "}
            cover the report shape and the exit codes for threshold-based failures.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is policy as code?</h3>
              <p className="text-sm muted mt-1">
                Expressing governance rules as versioned, testable files evaluated automatically by a
                policy engine, rather than as prose enforced by human review.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">OPA or Kyverno?</h3>
              <p className="text-sm muted mt-1">
                OPA if your policy scope goes beyond Kubernetes and you want one engine for
                everything. Kyverno if you only need cluster admission and want policies your whole
                team can read.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Where should policy be enforced?</h3>
              <p className="text-sm muted mt-1">
                In CI for feedback and at admission for enforcement. Pre-commit is a convenience;
                runtime checks catch drift. Use the same policy source for all of them.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does it replace scanning?</h3>
              <p className="text-sm muted mt-1">
                No. The scanner produces the facts, the policy decides what is acceptable. A policy
                built on incomplete scan data will pass images it should block.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Give your policies better facts</h3>
          <p className="text-sm muted leading-relaxed">
            A gate is only as good as the scan behind it. Run ScanRook against one of your images and
            look at the JSON your policy engine would actually be evaluating &mdash; every finding
            carries its source and confidence tier.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--dg-accent,#2563eb)] text-white px-4 py-2 text-sm font-medium"
            >
              Start scanning
            </Link>
            <Link href="/docs" className="btn-secondary">
              Read the docs
            </Link>
          </div>
        </section>

        <footer className="border-t border-black/10 dark:border-white/10 pt-4 text-xs muted grid gap-2">
          <p>
            <strong>Related reading:</strong>{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              Kubernetes Admission Control and Image Scanning
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/compliance-scanning-guide" className="underline">
              Compliance Scanning Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/shift-left-security" className="underline">
              Shift-Left Security
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
