import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-22";

const title = `CI/CD Security Best Practices: Securing the Pipeline | ${APP_NAME}`;
const description =
  "CI/CD security best practices that hold up in production: short-lived identity, least-privilege jobs, pinned dependencies, isolated runners, and real gates.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "ci cd security best practices",
    "ci cd pipeline security",
    "secure ci cd pipeline",
    "github actions security",
    "build pipeline hardening",
    "oidc federation ci",
    "pipeline least privilege",
    "supply chain security ci",
    "ephemeral build runners",
    "ci cd security checklist",
  ],
  alternates: { canonical: "/blog/ci-cd-security-best-practices" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/ci-cd-security-best-practices",
    images: ["/blog/ci-cd-security-best-practices.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/ci-cd-security-best-practices.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "CI/CD Security Best Practices: Securing the Pipeline Itself",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/ci-cd-security-best-practices",
  image: "https://scanrook.io/blog/ci-cd-security-best-practices.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are the most important CI/CD security best practices?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Replace long-lived cloud keys with short-lived OIDC-federated identity, give every job the minimum permissions it needs, pin third-party actions and base images to immutable references, run untrusted code on isolated ephemeral runners, and put scanning and signing gates in front of any artifact that reaches production.",
      },
    },
    {
      "@type": "Question",
      name: "Why is the CI/CD pipeline itself a target?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Because it has production credentials, write access to your artifact registry, and the ability to push code that everyone downstream trusts. Compromising a build system is often more valuable to an attacker than compromising a single production host, since the output is distributed automatically.",
      },
    },
    {
      "@type": "Question",
      name: "Should CI pipelines store cloud credentials as secrets?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Prefer not to. Most major CI systems and cloud providers support OIDC workload identity federation, where the CI job exchanges a signed token for short-lived cloud credentials scoped to that repository and branch. That removes the standing secret entirely, which is strictly better than rotating one.",
      },
    },
    {
      "@type": "Question",
      name: "Should a vulnerability scan fail the build?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, but on a threshold you will actually hold. Failing on every finding trains people to bypass the gate. A workable starting point is failing on new critical or high findings that have a fix available, while recording everything else in the report for triage.",
      },
    },
    {
      "@type": "Question",
      name: "Why pin actions and base images by digest?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tags are mutable pointers. A third-party action referenced by tag, or a base image referenced by tag, can change content without your repository changing at all. Pinning to a commit SHA or an image digest means an upstream compromise cannot silently alter what your pipeline executes.",
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
            CI/CD Security Best Practices: Securing the Pipeline Itself
          </h1>
          <p className="text-sm muted">Published December 22, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            Most CI/CD security best practices you read are about what the pipeline checks &mdash;
            scan here, lint there. That is the easier half. The harder half is that the pipeline is
            itself a high-value target: it holds production credentials, it can push artifacts
            everyone downstream trusts, and it will run whatever code lands in a branch. This is a
            guide to both halves, with the pipeline-as-target part first, because it is the part more
            teams get wrong.
          </p>
        </header>

        <img
          src="/blog/ci-cd-security-best-practices.jpg"
          alt="Secured CI/CD pipeline stages protected by layered controls"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Two threat models, not one</h2>
          <p className="text-sm muted">
            It helps to separate the questions. <strong>Pipeline as producer</strong> asks whether the
            thing you build is safe: are the dependencies vulnerable, is the base image full of
            unpatched packages, did a secret get committed? <strong>Pipeline as target</strong> asks
            whether the build system itself can be turned against you: can someone make it run their
            code, read its secrets, or push an artifact that never passed a gate?
          </p>
          <p className="text-sm muted">
            The first set of controls is well covered by{" "}
            <Link href="/blog/shift-left-security" className="underline">
              shift-left scanning
            </Link>
            . The second is where the interesting failures happen, because the pipeline usually has
            more privilege than any single service it deploys, and its permissions accumulate quietly
            over years.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Stop storing long-lived credentials</h2>
          <p className="text-sm muted">
            The single highest-value change most teams can make is removing standing cloud keys from
            CI. A long-lived access key stored as a CI secret is readable by every job that can
            reference it, survives every developer who leaves, and is useful to an attacker
            indefinitely.
          </p>
          <p className="text-sm muted">
            OIDC workload identity federation replaces it. The CI system issues a short-lived signed
            token describing the repository, workflow, and ref; your cloud provider trusts that issuer
            and exchanges the token for temporary credentials scoped by a condition you write. There
            is no secret to leak and nothing to rotate:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg border border-black/10 dark:border-white/10 p-4 bg-black/[.03] dark:bg-white/[.03]">
{`# .github/workflows/release.yml
permissions:
  contents: read
  id-token: write        # required to mint the OIDC token
  packages: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4          # pin to a full commit SHA in production
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::111122223333:role/ci-release
          aws-region: us-east-1
          # no access key, no secret key — the OIDC token is exchanged for
          # short-lived credentials scoped by the role's trust policy`}
          </pre>
          <p className="text-sm muted">
            The critical part is on the cloud side: scope the trust policy to the exact repository{" "}
            <em>and</em> ref. A role that trusts any workflow in your organisation is barely better
            than a static key, because any repository can then assume it. Where a standing credential
            is genuinely unavoidable &mdash; some third-party APIs still only issue static keys &mdash;
            apply the{" "}
            <Link href="/blog/secret-rotation" className="underline">
              dual-credential rotation pattern
            </Link>{" "}
            and alert on credential age.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Least privilege, per job</h2>
          <p className="text-sm muted">
            CI permissions default to convenient rather than minimal. Most pipelines run every job
            with the same broad token, so a test job that only needs to read code can also write to
            the repository, publish packages, and comment on issues. Declare permissions explicitly at
            the workflow level, deny by default, and widen only in the jobs that need it.
          </p>
          <p className="text-sm muted">
            Apply the same thinking to secrets. A secret available to the whole workflow is available
            to every step, including third-party actions you did not write. Scope secrets to the
            single job that consumes them, and prefer environment-level protection rules so that
            production credentials are only reachable from a job that has passed an approval.
          </p>

          <figure className="grid gap-2">
            <div className="overflow-x-auto surface-card p-4">
              <svg
                viewBox="0 0 720 250"
                role="img"
                aria-label="Matrix of pipeline stages against the controls that apply to each: source, build, package, release"
                className="w-full"
                style={{ minWidth: 620 }}
              >
                {["source", "build", "package", "release"].map((stage, i) => (
                  <g key={stage}>
                    <rect
                      x={20 + i * 172}
                      y={16}
                      width={156}
                      height={34}
                      rx={7}
                      fill={i === 3 ? "var(--dg-accent,#2563eb)" : "currentColor"}
                      fillOpacity={i === 3 ? 0.14 : 0.06}
                      stroke="currentColor"
                      strokeOpacity={0.4}
                    />
                    <text
                      x={98 + i * 172}
                      y={38}
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="600"
                      fill="currentColor"
                    >
                      {stage}
                    </text>
                  </g>
                ))}

                {[
                  ["branch protection", "pinned deps", "SBOM emitted", "signed digest"],
                  ["secret scanning", "isolated runner", "vuln scan gate", "provenance"],
                  ["review required", "no forked secrets", "no mutable tags", "approval gate"],
                ].map((row, r) =>
                  row.map((cell, i) => (
                    <g key={`${r}-${i}`}>
                      <rect
                        x={20 + i * 172}
                        y={70 + r * 50}
                        width={156}
                        height={40}
                        rx={6}
                        fill="currentColor"
                        fillOpacity={0.03}
                        stroke="currentColor"
                        strokeOpacity={0.22}
                      />
                      <circle cx={38 + i * 172} cy={90 + r * 50} r={3.5} fill="currentColor" fillOpacity={0.5} />
                      <text x={50 + i * 172} y={94 + r * 50} fontSize="10.5" fill="currentColor" fillOpacity={0.8}>
                        {cell}
                      </text>
                    </g>
                  ))
                )}

                <text x={360} y={238} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.5}>
                  Illustrative control map &mdash; the exact set varies by platform and risk appetite.
                </text>
              </svg>
            </div>
            <figcaption className="text-xs muted">
              Controls mapped to pipeline stages. Each stage has a different failure mode, so a single
              blanket &ldquo;security step&rdquo; at the end covers very little of it.
            </figcaption>
          </figure>
        </section>

        <img
          src="/blog/ci-cd-security-best-practices-2.jpg"
          alt="Build provenance attestation chain produced by a secure CI CD pipeline"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Treat pipeline inputs as untrusted</h2>
          <p className="text-sm muted">
            Anything an outside contributor controls &mdash; a branch name, a pull request title, an
            issue comment, a commit message &mdash; is attacker-controlled input that your pipeline
            may interpolate into a shell command. Templating such a value directly into a{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">run:</code>{" "}
            block is a command injection with the runner&apos;s full privileges. Pass untrusted values
            through environment variables and quote them, rather than substituting them into the
            script body.
          </p>
          <p className="text-sm muted">
            The related trap is running privileged workflows against fork content. Trigger types that
            execute in the context of the base repository &mdash; and therefore have access to its
            secrets &mdash; while checking out a pull request&apos;s code are how forks end up with
            your credentials. Keep the workflows that touch secrets on triggers a fork cannot
            influence, and let fork validation run on a restricted workflow with no secrets at all.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Pin everything you execute</h2>
          <p className="text-sm muted">
            Your pipeline runs a lot of code you did not write: third-party actions, container images
            for job steps, install scripts curled from the internet. All of those are usually
            referenced by mutable tags, which means the content can change without your repository
            changing at all.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Actions and plugins by commit SHA</strong>, not by{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">@v4</code>
              . A tag can be repointed by whoever controls the upstream repository.
            </li>
            <li>
              <strong>Base and job images by digest.</strong> A digest-pinned image is the same bytes
              every run, which also makes your builds reproducible enough to compare.
            </li>
            <li>
              <strong>Lockfiles committed and honoured.</strong> Use the install command that respects
              the lockfile exactly rather than the one that resolves fresh versions.
            </li>
            <li>
              <strong>Internal package names reserved.</strong> Confusable and squatted package names
              remain an effective way into a build &mdash; see{" "}
              <Link href="/blog/dependency-confusion" className="underline">
                dependency confusion
              </Link>{" "}
              and{" "}
              <Link href="/blog/typosquatting" className="underline">
                typosquatting
              </Link>
              .
            </li>
          </ul>
          <p className="text-sm muted">
            Pinning creates an update burden, which is the honest trade. Pair it with an automated
            dependency updater so pins get refreshed deliberately, in a reviewed pull request, rather
            than silently at 3am.
          </p>
        </section>

        <img
          src="/blog/ci-cd-security-best-practices-3.jpg"
          alt="Isolated ephemeral build runners separated inside a CI CD infrastructure lattice"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Isolate and discard the runners</h2>
          <p className="text-sm muted">
            A build runner executes untrusted code by design. Treat it as disposable: one job, one
            fresh environment, destroyed afterwards. Persistent self-hosted runners accumulate state
            &mdash; caches, credentials in the shell history, leftover containers &mdash; and a job
            that compromises one gets everything the next job touches.
          </p>
          <p className="text-sm muted">
            If you self-host, three things matter more than the rest: never let public-fork jobs land
            on a self-hosted runner, do not give runners network access to internal systems they do
            not build for, and avoid mounting the Docker socket into build containers &mdash; that is
            effectively root on the host, as covered in our write-up on the{" "}
            <Link href="/blog/docker-socket" className="underline">
              Docker socket
            </Link>
            . Rootless or daemonless build tooling avoids the problem outright.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Gates that produce evidence</h2>
          <p className="text-sm muted">
            Now the producer half. A useful pipeline gate does two things: it blocks something
            specific, and it leaves behind a record attached to the artifact rather than to a build
            number.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Secret scanning on every commit.</strong> Detection before push is worth more
              than detection after; our{" "}
              <Link href="/blog/secret-scanning-guide" className="underline">
                secret scanning guide
              </Link>{" "}
              covers placement.
            </li>
            <li>
              <strong>Dependency and image scanning with a real threshold.</strong> Fail on new
              critical or high findings that have a fix; record the rest. A gate that fails on
              everything gets bypassed within a month.
            </li>
            <li>
              <strong>An SBOM per build, stored with the artifact.</strong> This is what makes the
              next zero-day answerable in minutes instead of days &mdash; see{" "}
              <Link href="/blog/sbom-generation-in-ci" className="underline">
                SBOM generation in CI
              </Link>
              .
            </li>
            <li>
              <strong>Signing and provenance at the release step.</strong> Sign the digest with{" "}
              <Link href="/blog/sigstore-cosign-container-signing" className="underline">
                Cosign
              </Link>{" "}
              and emit build provenance, then verify both at deploy time. The{" "}
              <Link href="/blog/slsa-framework-explained" className="underline">
                SLSA framework
              </Link>{" "}
              is the useful vocabulary for how strong those guarantees are.
            </li>
            <li>
              <strong>Build once, promote the artifact.</strong> Rebuilding per environment discards
              every guarantee the gates just produced &mdash; the reasoning is in{" "}
              <Link href="/blog/image-promotion" className="underline">
                image promotion
              </Link>
              .
            </li>
          </ul>
          <p className="text-sm muted">
            For the concrete scanning step, our walkthrough of{" "}
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              scanning Docker images in GitHub Actions
            </Link>{" "}
            has a complete workflow, including how to fail the build on severity without making the
            job noisy.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A short checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>No standing cloud credentials in CI; OIDC federation scoped to repository and ref.</li>
            <li>Explicit, minimal permissions per job; secrets scoped to the job that uses them.</li>
            <li>Untrusted input never interpolated into shell commands.</li>
            <li>Fork-triggered workflows have no access to secrets.</li>
            <li>Third-party actions pinned by SHA; images pinned by digest.</li>
            <li>Ephemeral runners; no Docker socket mounts; no internal network reach.</li>
            <li>Secret, dependency, and image scans with thresholds the team will hold.</li>
            <li>SBOM, signature, and provenance attached to the artifact digest.</li>
            <li>Production deploys reference digests and verify signatures at admission.</li>
            <li>Pipeline definitions reviewed like production code, because they are.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook is the scanning gate, and we try to make it a gate people do not route around.
            Two design choices matter here. Every finding carries the advisory source it came from
            &mdash; OSV, NVD, or Red Hat OVAL &mdash; plus a confidence tier, so when a build is
            blocked the engineer can see why and judge it rather than filing an exception on faith.
            And the scanner reads the real package databases inside an image rather than inferring
            from filenames, which keeps the false-positive rate low enough that a strict threshold
            stays tolerable.
          </p>
          <p className="text-sm muted">
            In practice: scan the artifact in CI, fail on new critical findings with a fix available,
            store the report alongside the digest, and re-scan on promotion and on a schedule
            afterwards. That last part matters because a passing scan expires &mdash; advisories land
            against packages that were already in your image. The{" "}
            <Link href="/docs" className="underline">
              docs
            </Link>{" "}
            cover CLI usage and exit codes for gating.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What matters most in CI/CD security?</h3>
              <p className="text-sm muted mt-1">
                Removing long-lived credentials, scoping job permissions, pinning what you execute,
                isolating runners, and gating artifacts with scans and signatures.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why is the pipeline itself a target?</h3>
              <p className="text-sm muted mt-1">
                It holds production credentials and can publish artifacts everyone downstream trusts,
                so compromising it is usually worth more than compromising one host.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should the scan fail the build?</h3>
              <p className="text-sm muted mt-1">
                Yes, on a threshold you will hold &mdash; typically new critical or high findings with
                an available fix. Failing on everything guarantees the gate gets bypassed.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is pinning by SHA worth the maintenance?</h3>
              <p className="text-sm muted mt-1">
                Yes, if paired with an automated updater. Pinning turns a silent upstream change into
                a reviewed pull request.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Add a gate your team will not route around</h3>
          <p className="text-sm muted leading-relaxed">
            Run ScanRook against the artifact your pipeline just built. Findings are traceable to the
            advisory that produced them, so a failed build is a conversation about a real CVE rather
            than about the scanner.
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
              Scanning Docker Images in GitHub Actions
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/software-supply-chain-security" className="underline">
              Software Supply Chain Security
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/slsa-framework-explained" className="underline">
              The SLSA Framework Explained
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
