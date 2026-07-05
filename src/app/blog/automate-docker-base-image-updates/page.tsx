import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-31";

const title = `How to Automate Docker Base Image Updates | ${APP_NAME}`;
const description =
  "How to automate Docker base image updates with Renovate or Dependabot, scheduled CI rebuilds, digest pinning, and automatic scan verification.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "automate docker base image updates",
    "renovate docker base image",
    "dependabot dockerfile",
    "scheduled docker rebuild ci",
    "automatic base image updates",
    "docker digest pinning automation",
    "keep docker images patched",
    "docker base image bot",
    "automated dockerfile updates",
    "ci cron docker rebuild",
  ],
  alternates: { canonical: "/blog/automate-docker-base-image-updates" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/automate-docker-base-image-updates",
    images: ["/blog/automate-docker-base-image-updates.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/automate-docker-base-image-updates.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "How to Automate Docker Base Image Updates",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/automate-docker-base-image-updates",
  image: "https://scanrook.io/blog/automate-docker-base-image-updates.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I automate Docker base image updates?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use a bot like Renovate or Dependabot to open pull requests when a FROM tag has a newer digest available, and pair it with a scheduled CI job that rebuilds with --pull --no-cache and scans the result. Together they turn base image patching from a manual chore into a reviewable pull request.",
      },
    },
    {
      "@type": "Question",
      name: "Does Renovate update Docker base images by digest or by tag?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both, depending on configuration. Renovate can track a mutable tag and open a pull request whenever the digest behind it changes, or track a pinned digest and propose updating to the newest digest for that tag. Pinning by digest with Renovate-managed updates gives reproducible builds without losing patch visibility.",
      },
    },
    {
      "@type": "Question",
      name: "How often should a scheduled rebuild run?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Weekly is a reasonable default for most services, nightly for anything internet-facing. The right cadence balances how quickly you want to absorb upstream patches against how much CI capacity the rebuild-and-scan cycle consumes.",
      },
    },
    {
      "@type": "Question",
      name: "Should an automated base image update be auto-merged?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Only if the scan step in the same pipeline passes with no new critical or high findings and your test suite runs against the rebuilt image. Auto-merging a base image bump without a scan gate reintroduces the exact problem automation is meant to solve.",
      },
    },
    {
      "@type": "Question",
      name: "What is the risk of fully automating base image updates?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A base image update can carry a breaking change, such as a new OS release dropping a package your image relies on. Gating merges on your existing test suite and a scan pass catches most of these, but review the changelog for major version bumps rather than merging blind.",
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
            How to Automate Docker Base Image Updates
          </h1>
          <p className="text-sm muted">Published July 31, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Manually remembering to rebuild against a fresh base image is a patch cadence that fails
            the moment someone is on vacation. This guide covers how to automate Docker base image
            updates end to end: a bot that proposes the update, a scheduled rebuild, and a scan gate
            that decides whether it merges.
          </p>
        </header>

        <img
          src="/blog/automate-docker-base-image-updates.jpg"
          alt="Automating Docker base image updates"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why manual base image updates fail</h2>
          <p className="text-sm muted">
            A base image update is easy to defer indefinitely because nothing forces it &mdash; the
            build keeps succeeding against the stale cached layer, and the only signal that patches
            are available is a scan report someone has to remember to run. Automation replaces
            &ldquo;someone remembers&rdquo; with a process that runs whether or not anyone is
            watching.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 1: Track base image digests with Renovate</h2>
          <p className="text-sm muted">
            Renovate watches your Dockerfiles for <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">FROM</code>{" "}
            lines and opens a pull request when a newer digest is published under the tag you use:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:recommended"],
  "docker": {
    "enabled": true,
    "pinDigests": true
  },
  "packageRules": [
    {
      "matchDatasources": ["docker"],
      "schedule": ["before 6am on monday"]
    }
  ]
}`}</pre>
          <p className="text-sm muted">
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">pinDigests</code>{" "}
            makes Renovate rewrite your{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">FROM</code>{" "}
            line to an explicit digest and then open pull requests when that digest changes, giving
            you reproducible builds without losing update visibility.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 2: Or use Dependabot if you are already on GitHub</h2>
          <p className="text-sm muted">
            Dependabot supports Docker natively with less configuration if Renovate is not already in
            your stack:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 5`}</pre>
          <p className="text-sm muted">
            Dependabot scans every Dockerfile in the target directory and opens one pull request per
            base image with an available update, each independently reviewable.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 3: Gate the pull request on a rebuild and scan</h2>
          <p className="text-sm muted">
            A bot-opened pull request is only useful if CI proves the new base still builds cleanly
            and does not introduce new critical findings:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`name: base-image-update-check
on:
  pull_request:
    paths: ["Dockerfile"]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build --pull -t myapp:pr .
      - run: docker save myapp:pr -o myapp.tar
      - run: curl -fsSL https://scanrook.io/install.sh | sh
      - run: scanrook scan --file myapp.tar --format json --out report.json
      - run: |
          NEW_CRIT=$(jq '.summary.critical' report.json)
          if [ "$NEW_CRIT" -gt 0 ]; then
            echo "::error::$NEW_CRIT critical findings introduced by base image update"
            exit 1
          fi`}</pre>
          <p className="text-sm muted">
            Require this check to pass before merge in your branch protection rules, so a base image
            bump that regresses security cannot land silently.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 4: Add a scheduled rebuild independent of dependency bots</h2>
          <p className="text-sm muted">
            Renovate and Dependabot only propose an update when the digest actually changes upstream.
            A separate scheduled job that rebuilds against whatever is current catches OS security
            patches that land between bot checks:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`name: scheduled-rebuild
on:
  schedule:
    - cron: "0 3 * * *" # nightly
jobs:
  rebuild:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build --pull --no-cache -t myapp:nightly .
      - run: docker save myapp:nightly -o myapp.tar
      - run: curl -fsSL https://scanrook.io/install.sh | sh
      - run: scanrook scan --file myapp.tar --format json --out report.json
      - uses: actions/upload-artifact@v4
        with:
          name: nightly-scan-report
          path: report.json`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 5: Auto-merge only with a passing scan and test suite</h2>
          <p className="text-sm muted">
            Auto-merging removes the last manual step, but only do it when the merge is conditioned on
            both your test suite and the scan gate from Step 3:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# .github/workflows/automerge.yml
name: automerge-base-image-bumps
on:
  pull_request_target:
    types: [labeled]
jobs:
  automerge:
    if: contains(github.event.pull_request.labels.*.name, 'base-image-bump')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: gh pr merge --auto --squash "$PR_URL"
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          PR_URL: \${{ github.event.pull_request.html_url }}`}</pre>
          <p className="text-sm muted">
            This only fires once required status checks &mdash; including the scan gate &mdash; are
            green, so an automated merge still cannot bypass the verification from Step 3.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Verifying the automation is actually working</h2>
          <p className="text-sm muted">
            Check that pull requests are landing on schedule and that the scan gate is doing real
            work, not silently passing:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Confirm Renovate/Dependabot PRs are appearing weekly
gh pr list --label "base-image-bump" --state all --limit 10

# Confirm the scan gate has actually failed a build at least once in testing
# by intentionally reverting to an older, known-vulnerable base tag locally
docker build --pull -t myapp:regression-test .
docker save myapp:regression-test -o regression.tar
scanrook scan --file regression.tar --format json --out regression.json
jq '.summary.critical' regression.json`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Automation only closes the loop if the scan gate is trustworthy. ScanRook returns JSON
            severity totals purpose-built for a CI conditional, so the automerge workflow above has a
            real signal to check rather than a rubber stamp. Our{" "}
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              GitHub Actions scanning guide
            </Link>{" "}
            and the{" "}
            <Link href="/blog/trivy-alternatives" className="underline">
              scanner comparison
            </Link>{" "}
            cover the wider CI landscape; see the{" "}
            <Link href="/docs" className="underline">
              docs
            </Link>{" "}
            for setup.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">How do I automate Docker base image updates?</h3>
              <p className="text-sm muted mt-1">
                Use Renovate or Dependabot to open pull requests on digest changes, and gate merges on
                a rebuild-and-scan CI check.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does Renovate update by digest or by tag?</h3>
              <p className="text-sm muted mt-1">
                Both, depending on config &mdash; pinning by digest with Renovate-managed updates
                gives reproducible builds without losing visibility.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How often should a scheduled rebuild run?</h3>
              <p className="text-sm muted mt-1">
                Weekly for most services, nightly for internet-facing ones, balanced against CI
                capacity.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should automated updates auto-merge?</h3>
              <p className="text-sm muted mt-1">
                Only when gated on a passing scan and test suite &mdash; otherwise automation
                reintroduces the risk it was meant to remove.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Give your automation a real scan gate</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook returns severity totals in JSON, built for a CI conditional, so every automated
            base image bump has a real pass/fail check.
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
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              How to Reduce CVEs in Docker Images
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              How to Scan a Docker Image for Vulnerabilities
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
