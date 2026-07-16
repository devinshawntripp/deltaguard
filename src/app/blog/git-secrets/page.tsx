import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-30";

const title = `git-secrets: Block Secrets Before They Reach a Commit | ${APP_NAME}`;
const description =
  "git-secrets blocks credentials before they reach a git commit with regex hooks. How it works, its limits, and where scanning the built image fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "git secrets",
    "git-secrets",
    "git secrets aws",
    "prevent committing secrets",
    "git pre-commit secret scanning",
    "block credentials in git",
    "git secrets patterns",
    "git secrets scan history",
    "secret scanning tools",
    "aws credentials in git",
  ],
  alternates: { canonical: "/blog/git-secrets" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/git-secrets",
    images: ["/blog/git-secrets.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/git-secrets.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "git-secrets: Block Secrets Before They Reach a Commit",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/git-secrets",
  image: "https://scanrook.io/blog/git-secrets.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is git-secrets?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "git-secrets is an open-source tool from AWS Labs that installs git hooks to stop you from committing passwords, API keys, and other secrets. Before a commit is created, it scans the staged changes and commit message against a list of prohibited regular expressions and rejects the commit if any pattern matches.",
      },
    },
    {
      "@type": "Question",
      name: "How is git-secrets different from Gitleaks or TruffleHog?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "git-secrets is purely regex-based and focuses on preventing commits at the developer's machine through git hooks. Gitleaks adds Shannon-entropy detection and ships a large built-in ruleset, and TruffleHog verifies found credentials against live APIs to cut false positives. git-secrets is lighter and simpler, but it only catches secrets that match a pattern you have registered.",
      },
    },
    {
      "@type": "Question",
      name: "Does git-secrets scan git history?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Running 'git secrets --scan-history' walks every commit reachable in the repository and reports matches, which is useful when adopting the tool on an existing repo. The pre-commit hook only inspects new changes, so a history scan is how you find secrets that were committed before git-secrets was installed.",
      },
    },
    {
      "@type": "Question",
      name: "Are git-secrets hooks enforced for the whole team?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. git hooks live in each local clone and every developer must run 'git secrets --install' themselves, so the hook is a helpful guardrail rather than an enforced control. Teams that need enforcement run a secret scanner in CI or as a server-side check so a missing local hook cannot let a secret through.",
      },
    },
    {
      "@type": "Question",
      name: "If I use git-secrets, do I still need to scan container images?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. git-secrets guards what enters the repository; it does not look at the artifact you ship. Secrets can still land in an image through build arguments, copied config files, or base layers, and images also carry vulnerable OS and language packages that a commit-time hook never sees. Scanning the built image is a separate, complementary layer.",
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
            git-secrets: Block Secrets Before They Reach a Commit
          </h1>
          <p className="text-sm muted">Published October 30, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            The cheapest secret to remediate is the one that never gets committed. git-secrets is a
            small, focused tool for exactly that: it hooks into git and rejects a commit before a
            credential can enter your history. Here is how it works, where its regex-only approach
            falls short, and how it fits into a layered defense that also covers the artifact you
            ship.
          </p>
        </header>

        <img
          src="/blog/git-secrets.jpg"
          alt="git-secrets blocking a credential at commit time"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What git-secrets is</h2>
          <p className="text-sm muted">
            git-secrets is an open-source project from AWS Labs. It installs a set of git hooks that
            run automatically and scan your changes for text that looks like a secret &mdash; AWS
            access keys, private keys, passwords, or any pattern you define. If a prohibited pattern
            matches, the commit is aborted and the offending line is printed, so you fix the problem
            before it becomes part of the repository&apos;s permanent history. It is written in
            portable shell, has no runtime dependencies beyond git and a POSIX environment, and is
            deliberately narrow in scope.
          </p>
          <p className="text-sm muted">
            The value proposition is prevention. Once a secret is committed and pushed, rotating it
            is the only safe response &mdash; rewriting history does not help once someone has
            cloned or a CI runner has logged it. Catching the secret at commit time means you never
            have to rotate anything.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How the hook flow works</h2>
          <p className="text-sm muted">
            git-secrets wires itself into three hooks: <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">pre-commit</code>{" "}
            (scans staged changes), <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">commit-msg</code>{" "}
            (scans the message), and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">prepare-commit-msg</code>{" "}
            (catches merge commits). When you commit, the hook diffs what you are about to record,
            runs each prohibited pattern against it, and exits non-zero on a match &mdash; which git
            treats as a veto.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 680 120" role="img" aria-label="git-secrets commit hook flow: developer commits, hook fires, diff is scanned against patterns, commit is blocked or allowed" className="w-full max-w-2xl mx-auto">
              <g fontSize="11.5" textAnchor="middle">
                <rect x="10" y="35" width="140" height="50" rx="8" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.25" />
                <text x="80" y="58" fill="currentColor">git commit</text>
                <text x="80" y="73" fill="currentColor" opacity="0.7">staged changes</text>

                <rect x="180" y="35" width="140" height="50" rx="8" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.25" />
                <text x="250" y="58" fill="currentColor">pre-commit hook</text>
                <text x="250" y="73" fill="currentColor" opacity="0.7">fires locally</text>

                <rect x="350" y="35" width="140" height="50" rx="8" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.25" />
                <text x="420" y="55" fill="currentColor">scan diff vs</text>
                <text x="420" y="70" fill="currentColor">prohibited regex</text>

                <rect x="520" y="10" width="150" height="42" rx="8" fill="var(--dg-accent,#2563eb)" fillOpacity="0.10" stroke="var(--dg-accent,#2563eb)" strokeOpacity="0.55" />
                <text x="595" y="35" fill="currentColor">match &rarr; blocked</text>

                <rect x="520" y="68" width="150" height="42" rx="8" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.25" />
                <text x="595" y="93" fill="currentColor">clean &rarr; committed</text>

                <g stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" fill="none">
                  <line x1="150" y1="60" x2="176" y2="60" />
                  <line x1="320" y1="60" x2="346" y2="60" />
                  <line x1="490" y1="52" x2="516" y2="35" />
                  <line x1="490" y1="68" x2="516" y2="86" />
                </g>
                <g fill="currentColor" fillOpacity="0.4">
                  <polygon points="176,60 168,56 168,64" />
                  <polygon points="346,60 338,56 338,64" />
                  <polygon points="516,35 507,34 511,42" />
                  <polygon points="516,86 507,79 511,87" />
                </g>
              </g>
            </svg>
          </div>
          <p className="text-sm muted">
            Setting it up in a repository takes two commands. The install writes the hooks; the
            register step loads the bundled AWS patterns:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# install the hooks into the current repository
git secrets --install

# load the built-in AWS key patterns (access keys, secret keys, account IDs)
git secrets --register-aws

# from now on, a matching secret aborts the commit automatically`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Patterns: built-in and custom</h2>
          <p className="text-sm muted">
            The AWS patterns cover access key IDs, secret access keys, and account IDs &mdash; the
            credentials git-secrets was originally written to stop. Everything else you add yourself.
            You register prohibited patterns as regular expressions, and you can register
            &ldquo;allowed&rdquo; patterns to whitelist known-safe strings (example keys in docs,
            placeholder values) so they do not trip the hook.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# add a custom prohibited pattern (e.g. a private key header)
git secrets --add 'private_key'
git secrets --add '-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----'

# whitelist a known-safe example so it does not block commits
git secrets --add --allowed 'AKIAIOSFODNN7EXAMPLE'

# apply the same config to every new repo you clone
git secrets --register-aws --global
git config --global init.templateDir ~/.git-templates/git-secrets`}</pre>
          <p className="text-sm muted">
            Because matching is regex-only, the quality of your protection is the quality of your
            pattern list. That is git-secrets&apos; greatest strength (transparent, predictable,
            fast) and its central limitation (it cannot catch a secret it has never been told to
            look for).
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scanning existing history</h2>
          <p className="text-sm muted">
            The pre-commit hook only sees new work. When you adopt git-secrets on a repository that
            already has years of history, you need a one-time sweep of everything that came before:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# scan the working tree
git secrets --scan

# scan every commit reachable in the repository
git secrets --scan-history`}</pre>
          <p className="text-sm muted">
            If <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--scan-history</code>{" "}
            finds a real secret, treat it as leaked: rotate the credential first, then decide whether
            to scrub history. Deleting the line from the latest commit does nothing for the copy
            already sitting in an old object. Our{" "}
            <Link href="/blog/secret-scanning-guide" className="underline">
              secret scanning guide
            </Link>{" "}
            walks through the full detection-and-remediation loop.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What it catches, and what it misses</h2>
          <p className="text-sm muted">
            git-secrets is excellent at what it targets: high-signal, well-formed credentials that
            match a known shape, caught at the earliest possible moment. It is fast, has almost no
            configuration overhead, and its regex approach means zero surprises about why something
            did or did not match.
          </p>
          <p className="text-sm muted">
            The gaps follow directly from the design. It has no entropy detection, so a random
            32-character token that does not fit a registered pattern slips through &mdash; tools
            like{" "}
            <Link href="/blog/gitleaks-secret-scanning" className="underline">
              Gitleaks
            </Link>{" "}
            add Shannon-entropy heuristics for exactly this case. It does not verify whether a match
            is a live credential, so noisy patterns produce false positives that{" "}
            <Link href="/blog/trufflehog-secret-scanning" className="underline">
              TruffleHog
            </Link>{" "}
            addresses by testing found secrets against real APIs. And because hooks are local and
            opt-in, a teammate who never ran{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">git secrets --install</code>{" "}
            has no protection at all. None of this makes git-secrets a bad tool &mdash; it makes it
            one layer, not the whole defense.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where it fits in a layered defense</h2>
          <p className="text-sm muted">
            Think of secret defense as three checkpoints. git-secrets sits at the developer&apos;s
            keyboard, stopping the obvious leak before it happens. A CI-side secret scanner catches
            what the local hook missed &mdash; the developer who skipped the install, the pattern
            nobody registered &mdash; and enforces the check where it cannot be bypassed. And a scan
            of the built artifact catches secrets that never touched a source file at all: a key
            passed as a build argument, a config baked into a base layer, a token copied into the
            image at build time. Each layer covers a different failure mode of the one before it.
          </p>
          <p className="text-sm muted">
            The same logic applies to how you store secrets at runtime. Keeping credentials out of
            git is only half the job; the other half is delivering them to workloads safely, which
            we cover in{" "}
            <Link href="/blog/kubernetes-secrets-security" className="underline">
              Kubernetes secrets security
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook is not a replacement for git-secrets &mdash; it works on the other end of the
            pipeline. git-secrets guards what enters your repository; ScanRook scans the container
            image, binary, or source archive you actually ship. That artifact carries risk a
            commit-time hook never sees: known CVEs in the OS and language packages baked into every
            layer, and configuration that only exists in the built image. Running git-secrets on the
            way in and ScanRook on the way out means a leaked key is caught before it lands, and the
            vulnerable dependencies riding along in the final image are caught before they deploy.
            The two tools answer different questions about the same software, which is exactly why
            they belong together.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is git-secrets?</h3>
              <p className="text-sm muted mt-1">
                An AWS Labs tool that installs git hooks to reject commits containing text matching
                prohibited regex patterns &mdash; stopping credentials before they enter history.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How is it different from Gitleaks or TruffleHog?</h3>
              <p className="text-sm muted mt-1">
                git-secrets is regex-only and prevention-focused. Gitleaks adds entropy detection
                and a large ruleset; TruffleHog verifies secrets against live APIs to reduce false
                positives.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can it scan old commits?</h3>
              <p className="text-sm muted mt-1">
                Yes &mdash; <code className="text-xs">git secrets --scan-history</code> walks every
                reachable commit, which is how you check a repo that predates the tool.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is it enforced across the team?</h3>
              <p className="text-sm muted mt-1">
                No. Hooks are local and opt-in, so pair git-secrets with a CI-side scan to enforce
                the check where it cannot be skipped.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Guard the commit, then scan the artifact</h3>
          <p className="text-sm muted leading-relaxed">
            git-secrets keeps credentials out of your history. ScanRook scans the image you ship for
            the vulnerable packages and layers a commit hook never sees &mdash; every finding tagged
            with its source and a confidence tier so you can verify rather than trust.
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
            <Link href="/blog/secret-scanning-guide" className="underline">
              Secret Scanning: A Practical Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/gitleaks-secret-scanning" className="underline">
              Gitleaks
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/trufflehog-secret-scanning" className="underline">
              TruffleHog
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
