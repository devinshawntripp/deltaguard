import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-06";

const title = `GitHub Actions Security: Harden Your Workflows | ${APP_NAME}`;
const description =
  "A practical guide to GitHub Actions security: token permissions, pinning actions to SHAs, script injection, OIDC, self-hosted runners, and scanning build artifacts.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "github actions security",
    "github actions security best practices",
    "harden github actions",
    "github actions secrets",
    "pull_request_target",
    "pin github actions to sha",
    "github actions oidc",
    "self-hosted runner security",
    "github actions script injection",
    "ci cd supply chain security",
  ],
  alternates: { canonical: "/blog/github-actions-security" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/github-actions-security",
    images: ["/blog/github-actions-security.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/github-actions-security.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "GitHub Actions Security: How to Harden Your Workflows",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/github-actions-security",
  image: "https://scanrook.io/blog/github-actions-security.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Why should I pin GitHub Actions to a commit SHA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tags and branches in a third-party action repository are mutable. Whoever controls that repository can move v1 or main to point at different code at any time, and your workflow will run it on the next execution. Pinning to a full 40-character commit SHA means you run exactly the code you reviewed. Combine pinning with Dependabot so you still receive update pull requests.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between pull_request and pull_request_target?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The pull_request event runs the workflow definition from the base branch against untrusted fork code with no access to repository secrets and a read-only token. The pull_request_target event runs with the base repository's secrets and a writable token, which is why checking out and executing pull request code inside a pull_request_target workflow hands your secrets to anyone who can open a pull request.",
      },
    },
    {
      "@type": "Question",
      name: "How do I limit GITHUB_TOKEN permissions?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Set the default token permissions for the organization or repository to read-only in Settings, then declare a permissions block at the top of each workflow and grant only the scopes that job needs, such as contents: read plus packages: write. Job-level permissions blocks override workflow-level ones, so a single publish job can hold elevated scopes while the rest stay minimal.",
      },
    },
    {
      "@type": "Question",
      name: "Are secrets exposed to pull requests from forks?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not for the standard pull_request event. GitHub withholds repository secrets and issues a read-only token when a workflow is triggered by a fork pull request. Exposure happens when maintainers work around that with pull_request_target, workflow_run, or a self-hosted runner that has ambient cloud credentials available on the machine.",
      },
    },
    {
      "@type": "Question",
      name: "Should I scan container images inside GitHub Actions?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The workflow that builds an image is the cheapest place to learn it ships known-vulnerable packages, because nothing has been pushed to a registry or deployed yet. Save the image as a tarball, scan it in a job step, publish the report as an artifact, and fail the build on a severity threshold you have agreed to enforce.",
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
            GitHub Actions Security: How to Harden Your Workflows
          </h1>
          <p className="text-sm muted">Published December 6, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            GitHub Actions security is really a question about trust boundaries. A workflow is code
            with credentials, running on a machine you did not build, pulling in actions maintained
            by strangers, triggered by events that outsiders can fire. Most incidents come from a
            small set of recurring mistakes rather than exotic exploits &mdash; and each one has a
            concrete fix you can apply today.
          </p>
        </header>

        <img
          src="/blog/github-actions-security.jpg"
          alt="GitHub Actions security: hardening CI/CD workflow pipelines"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            The threat model in one picture
          </h2>
          <p className="text-sm muted">
            Before the checklist, it helps to see where the trust boundaries actually sit. Untrusted
            input enters from the left; credentials sit on the right; the job in the middle is the
            place where they meet.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 250"
              role="img"
              aria-label="Diagram of GitHub Actions trust boundaries: untrusted inputs such as fork pull requests, issue titles and third-party actions flow into a runner job, which holds the GITHUB_TOKEN, repository secrets and OIDC cloud access"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <defs>
                <marker id="gha-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              <text x={80} y={20} textAnchor="middle" fontSize="11" fontWeight="600" fill="currentColor" fillOpacity={0.7}>
                Untrusted
              </text>
              {[
                { y: 34, label: "Fork pull request" },
                { y: 78, label: "Issue / PR title" },
                { y: 122, label: "Third-party action" },
                { y: 166, label: "Cached artifact" },
              ].map((b) => (
                <g key={b.label}>
                  <rect x={8} y={b.y} width={158} height={32} rx={7} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.35} />
                  <text x={87} y={b.y + 21} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.8}>
                    {b.label}
                  </text>
                  <line x1={168} y1={b.y + 16} x2={244} y2={125} stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.45} markerEnd="url(#gha-arrow)" />
                </g>
              ))}
              <rect x={252} y={70} width={168} height={110} rx={10} fill="var(--dg-accent,#2563eb)" fillOpacity={0.12} stroke="currentColor" strokeOpacity={0.5} />
              <text x={336} y={112} textAnchor="middle" fontSize="14" fontWeight="600" fill="currentColor">
                Runner job
              </text>
              <text x={336} y={132} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.65}>
                shell + filesystem
              </text>
              <text x={336} y={150} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.65}>
                network egress
              </text>
              <text x={600} y={20} textAnchor="middle" fontSize="11" fontWeight="600" fill="currentColor" fillOpacity={0.7}>
                Reachable credentials
              </text>
              {[
                { y: 56, label: "GITHUB_TOKEN" },
                { y: 100, label: "Repository secrets" },
                { y: 144, label: "OIDC cloud role" },
                { y: 188, label: "Registry push rights" },
              ].map((b) => (
                <g key={b.label}>
                  <line x1={422} y1={125} x2={512} y2={b.y + 16} stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.45} markerEnd="url(#gha-arrow)" />
                  <rect x={520} y={b.y} width={166} height={32} rx={7} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.35} />
                  <text x={603} y={b.y + 21} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.8}>
                    {b.label}
                  </text>
                </g>
              ))}
              <line x1={218} y1={26} x2={218} y2={228} stroke="currentColor" strokeWidth={1} strokeOpacity={0.35} strokeDasharray="5 4" />
              <line x1={468} y1={26} x2={468} y2={228} stroke="currentColor" strokeWidth={1} strokeOpacity={0.35} strokeDasharray="5 4" />
              <text x={343} y={240} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.55}>
                every hardening control narrows one of these two dashed boundaries
              </text>
            </svg>
          </div>
          <figcaption className="text-xs muted">
            Trust boundaries in a GitHub Actions run. Attacks work by getting attacker-controlled
            content across the left boundary and credentials back out across the right one.
          </figcaption>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Start with token permissions
          </h2>
          <p className="text-sm muted">
            Every job gets a <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">GITHUB_TOKEN</code>{" "}
            automatically. Historically the default was permissive, and many organizations still
            carry that setting. Switch the organization default to read-only, then declare exactly
            what each workflow needs:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.05] dark:bg-white/[.05] p-4"><code>{`name: build
on: [push]

# workflow-level floor: nothing beyond reading the repo
permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

  publish:
    needs: test
    runs-on: ubuntu-latest
    # only this job gets more
    permissions:
      contents: read
      packages: write
      id-token: write
    steps:
      - uses: actions/checkout@v5`}</code></pre>
          <p className="text-sm muted">
            Job-level blocks override the workflow-level block, so the elevated scopes live in one
            place you can review. If a workflow never opens a pull request, it does not need{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">pull-requests: write</code>.
            If it never publishes, it does not need{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">packages: write</code>.
            This is the same least-privilege reasoning we apply to workloads in{" "}
            <Link href="/blog/security-context-kubernetes" className="underline">
              Kubernetes security contexts
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Pin third-party actions to a commit SHA
          </h2>
          <p className="text-sm muted">
            When you write{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">uses: some-org/some-action@v1</code>,
            you are trusting whoever controls that repository to never repoint the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">v1</code>{" "}
            tag &mdash; and to never lose their account. That assumption has failed in public. In
            March 2025 the widely used <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">tj-actions/changed-files</code>{" "}
            action was compromised (CVE-2025-30066): existing version tags were rewritten to point
            at a malicious commit that dumped runner memory into build logs, exposing secrets in
            thousands of repositories. Consumers who had pinned to a SHA were unaffected, because a
            SHA cannot be moved.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.05] dark:bg-white/[.05] p-4"><code>{`# mutable — the tag can be repointed at any time
- uses: some-org/some-action@v1

# immutable — you run exactly the tree you reviewed
- uses: some-org/some-action@e2c1f6b7a9d0c4531f8a2b6d9e0713c4a5f68b29 # v1.4.2`}</code></pre>
          <p className="text-sm muted">
            Keep the human-readable version in a trailing comment so the pin is reviewable, and let
            Dependabot open update pull requests against the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">github-actions</code>{" "}
            ecosystem so pinning does not mean freezing. We cover that workflow in{" "}
            <Link href="/blog/dependabot" className="underline">
              our guide to Dependabot
            </Link>
            . At the organization level, restrict which actions can run at all &mdash; GitHub&apos;s
            policy settings let you allow only actions created by GitHub, verified creators, or an
            explicit allowlist.
          </p>
        </section>

        <img
          src="/blog/github-actions-security-2.jpg"
          alt="Scoping GitHub Actions secrets and GITHUB_TOKEN permissions"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Never interpolate untrusted input into a shell
          </h2>
          <p className="text-sm muted">
            This is the most common GitHub Actions security bug we see in real repositories. GitHub
            expands{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">{"${{ ... }}"}</code>{" "}
            expressions <em>before</em> the shell runs, by pasting the value directly into the
            script. If the value is a pull request title, branch name, issue body, or commit
            message, an outsider chooses that text:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.05] dark:bg-white/[.05] p-4"><code>{`# vulnerable: the title is pasted into the script body
- run: echo "Building \${{ github.event.pull_request.title }}"

# safe: the value crosses into the shell as an environment variable
- env:
    PR_TITLE: \${{ github.event.pull_request.title }}
  run: echo "Building $PR_TITLE"`}</code></pre>
          <p className="text-sm muted">
            The environment-variable form works because the shell never parses the attacker&apos;s
            text as code. Treat every field under{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">github.event</code>{" "}
            as hostile, and quote the variable when you use it. The same reflex applies to inputs
            you pass into a composite action.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Understand pull_request_target before you use it
          </h2>
          <p className="text-sm muted">
            For a fork pull request, the ordinary{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">pull_request</code>{" "}
            trigger is deliberately safe: no repository secrets, read-only token. Maintainers who
            need secrets in PR builds often reach for{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">pull_request_target</code>,
            which runs the base branch&apos;s workflow definition <em>with</em> secrets and a
            writable token. That is fine on its own. It becomes a critical vulnerability &mdash; the
            pattern usually called a &ldquo;pwn request&rdquo; &mdash; the moment the workflow checks
            out the pull request head and executes anything from it:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.05] dark:bg-white/[.05] p-4"><code>{`# DANGEROUS: privileged context executing untrusted code
on: pull_request_target
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
        with:
          ref: \${{ github.event.pull_request.head.sha }}   # attacker's tree
      - run: npm ci && npm run build                         # attacker's scripts`}</code></pre>
          <p className="text-sm muted">
            A fork can add a malicious{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">postinstall</code>{" "}
            hook and exfiltrate everything the job can reach. If you must build fork code with
            credentials, split it: one unprivileged job builds and uploads an artifact, and a
            separate approved job consumes it &mdash; or gate the privileged path behind a GitHub
            Environment with required reviewers. And remember that a{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">workflow_run</code>{" "}
            workflow that downloads an artifact from an untrusted run inherits the same problem: the
            artifact is untrusted input.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Replace long-lived cloud keys with OIDC
          </h2>
          <p className="text-sm muted">
            Static cloud access keys stored as repository secrets are the highest-value target in
            any CI system: they do not expire, they work from anywhere, and they leak in logs. GitHub
            can instead mint a short-lived OIDC token that your cloud provider exchanges for
            temporary credentials scoped to a role you control:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.05] dark:bg-white/[.05] p-4"><code>{`permissions:
  id-token: write
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@<pinned-sha>
    with:
      role-to-assume: arn:aws:iam::111122223333:role/gha-deploy
      aws-region: us-east-1`}</code></pre>
          <p className="text-sm muted">
            The important part is on the cloud side: write the trust policy so the subject condition
            matches a specific repository <em>and</em> ref or environment, not a wildcard. A trust
            policy that accepts any repo in your org is barely better than a shared key. Nothing is
            stored in GitHub, so there is nothing to steal from a compromised workflow beyond the few
            minutes the token is valid.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Self-hosted runners</h2>
          <p className="text-sm muted">
            GitHub-hosted runners are destroyed after each job. Self-hosted runners are not, which
            changes the calculus completely. A job can drop a file, poison a toolchain cache, or read
            what the previous job left behind, and anything the machine can reach on your network is
            reachable from CI. Practical rules: never attach a self-hosted runner to a public
            repository, run runners as ephemeral one-job instances where possible, keep them in a
            segmented network with tight egress, avoid ambient credentials on the host such as an
            instance profile that jobs can silently assume, and scope runner groups so only intended
            repositories can target them.
          </p>
        </section>

        <img
          src="/blog/github-actions-security-3.jpg"
          alt="Signing and verifying build artifacts produced by GitHub Actions workflows"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            What comes out of the workflow matters too
          </h2>
          <p className="text-sm muted">
            Hardening the pipeline protects the build. It says nothing about whether the artifact the
            build produced is safe to deploy. A perfectly locked-down workflow will happily publish
            an image whose base layer carries a critical OpenSSL flaw. The two concerns are
            complementary, and both belong in the same workflow file.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Scan the image before it is pushed.</strong> Build, save to a tarball, scan the
              tarball, and only push if the run passes your policy.
            </li>
            <li>
              <strong>Generate an SBOM and keep it.</strong> Attaching an inventory to each release
              is what lets you answer &ldquo;are we affected?&rdquo; in minutes rather than days
              &mdash; see{" "}
              <Link href="/blog/sbom-generation-in-ci" className="underline">
                SBOM generation in CI
              </Link>
              .
            </li>
            <li>
              <strong>Sign and attest.</strong> Provenance and signatures let downstream consumers
              verify the artifact came from your workflow, the subject of{" "}
              <Link href="/blog/software-supply-chain-security" className="underline">
                software supply chain security
              </Link>
              .
            </li>
            <li>
              <strong>Scan for secrets on every push.</strong> Credentials committed to the
              repository defeat every control above;{" "}
              <Link href="/blog/secret-scanning-guide" className="underline">
                our secret scanning guide
              </Link>{" "}
              covers the tooling.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A hardening checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Default <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">GITHUB_TOKEN</code> permissions set to read-only org-wide.</li>
            <li>Every workflow declares an explicit <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">permissions:</code> block.</li>
            <li>All third-party actions pinned to full commit SHAs, with Dependabot enabled.</li>
            <li>Allowed-actions policy configured at the organization level.</li>
            <li>No <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">{"${{ }}"}</code> interpolation of event data into <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">run:</code> blocks.</li>
            <li>No <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">pull_request_target</code> workflow that checks out and executes PR code.</li>
            <li>Cloud access via OIDC with a narrowly scoped trust policy, not static keys.</li>
            <li>Self-hosted runners ephemeral, network-segmented, never on public repos.</li>
            <li>Deployment jobs behind Environments with required reviewers.</li>
            <li>Artifact scanning and SBOM generation wired into the build job.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook does not harden your workflow file &mdash; that is on you, and the checklist
            above is the whole job. What ScanRook does is answer the other half of the question: is
            the thing this workflow just built safe to ship? It runs as a single binary in a job
            step, takes a container image tarball, source archive, or compiled binary, reads the real
            package databases inside it, and matches every package against OSV, NVD, and Red Hat OVAL
            so you get findings with a source and a confidence tier rather than a raw count. A
            complete working workflow is in{" "}
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              how to scan Docker images in GitHub Actions
            </Link>
            , and the CLI reference lives in the <Link href="/docs" className="underline">docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Why pin actions to a SHA?</h3>
              <p className="text-sm muted mt-1">
                Tags are mutable. A compromised or malicious maintainer can repoint{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">v1</code>{" "}
                at new code that runs in your next build. A commit SHA cannot be moved.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is pull_request_target always unsafe?</h3>
              <p className="text-sm muted mt-1">
                No. It is unsafe when combined with checking out and executing the pull request head.
                Used for labelling or commenting without running fork code, it is fine.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Do fork pull requests see my secrets?</h3>
              <p className="text-sm muted mt-1">
                Not under the standard <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">pull_request</code>{" "}
                trigger &mdash; secrets are withheld and the token is read-only. Exposure comes from
                workarounds.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Where should image scanning run?</h3>
              <p className="text-sm muted mt-1">
                In the build job, before the push. Failing there costs a rerun; catching the same CVE
                after deployment costs an incident.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan what your workflow builds</h3>
          <p className="text-sm muted leading-relaxed">
            Add one step to the job that builds your image and get a full findings report before
            anything reaches a registry. Every finding carries its advisory source and a confidence
            tier, so a failing build is something you can explain.
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
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              How to Scan Docker Images in GitHub Actions
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/github-advanced-security" className="underline">
              GitHub Advanced Security
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/software-supply-chain-security" className="underline">
              Software Supply Chain Security
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
