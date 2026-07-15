import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-22";

const title = `Gitleaks: Fast Secret Scanning for Git Repos and CI | ${APP_NAME}`;
const description =
  "Gitleaks is a fast, open-source secret scanner for git repos and CI. How its regex and entropy detection works, its tradeoffs, and where ScanRook fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "gitleaks",
    "gitleaks secret scanning",
    "gitleaks config",
    "gitleaks pre-commit",
    "gitleaks github action",
    "detect secrets in git history",
    "gitleaks vs trufflehog",
    "regex secret scanner",
    "scan git repo for secrets",
    "gitleaks toml rules",
  ],
  alternates: { canonical: "/blog/gitleaks-secret-scanning" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/gitleaks-secret-scanning",
    images: ["/blog/gitleaks-secret-scanning.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/gitleaks-secret-scanning.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Gitleaks: Fast Secret Scanning for Git Repos and CI",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/gitleaks-secret-scanning",
  image: "https://scanrook.io/blog/gitleaks-secret-scanning.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Gitleaks?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Gitleaks is an open-source, MIT-licensed secret scanner written in Go. It detects hardcoded credentials such as API keys, tokens, and private keys in git repositories, directories, and standard input, using regular-expression rules and Shannon entropy checks. It is popular as a pre-commit hook and a CI gate because it is fast and runs entirely offline.",
      },
    },
    {
      "@type": "Question",
      name: "How does Gitleaks detect secrets?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Gitleaks matches content against a set of regex rules defined in TOML, and it can flag high-entropy strings that look random enough to be keys. It ships with a default ruleset covering many common providers, and you can add custom rules or tighten existing ones in a .gitleaks.toml file. Unlike verification-based scanners it makes no network calls.",
      },
    },
    {
      "@type": "Question",
      name: "How do I reduce Gitleaks false positives?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Because Gitleaks matches patterns rather than verifying live credentials, some findings will be test fixtures or example values. You suppress them with allowlists in the config, a .gitleaksignore file that pins specific finding fingerprints, or a baseline file that ignores everything already known so only new leaks fail the build.",
      },
    },
    {
      "@type": "Question",
      name: "Gitleaks vs TruffleHog: which should I use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Gitleaks is regex and entropy based, offline, fast, and highly configurable through TOML, which makes it a natural pre-commit and CI gate. TruffleHog adds active verification, calling provider APIs to confirm a credential is live, which cuts triage noise. They are complementary and many teams run Gitleaks locally and TruffleHog for deeper verified sweeps.",
      },
    },
    {
      "@type": "Question",
      name: "Does Gitleaks scan git history?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. By default the detect command walks the commit log, so it finds secrets that were committed and later removed from the working tree but still live in history. You can also scan a directory without git metadata, or pipe content through standard input, when history is not what you need.",
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
          <div className="text-xs uppercase tracking-wide muted">Scanning concepts</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Gitleaks: Fast Secret Scanning for Git Repos and CI
          </h1>
          <p className="text-sm muted">Published July 22, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            <strong>Gitleaks</strong> is one of the most popular open-source tools for keeping secrets
            out of your git history. It is small, fast, fully offline, and configurable enough to fit
            almost any repository. Here is how Gitleaks detects credentials, how to run it as a
            pre-commit hook and in CI, its honest tradeoffs against verification-based scanners, and
            where it sits alongside scanning the image you deploy.
          </p>
        </header>

        <img
          src="/blog/gitleaks-secret-scanning.jpg"
          alt="Gitleaks fast offline secret scanning for git repositories and CI"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Gitleaks is</h2>
          <p className="text-sm muted">
            Gitleaks is an open-source secret scanner written in Go and released under the MIT
            license. Its job is narrow and useful: find hardcoded credentials &mdash; API keys,
            tokens, private keys, connection strings &mdash; in git repositories, directories, and
            piped input, and fail loudly when it does. It has become a default choice for the
            pre-commit and CI stage of a pipeline precisely because it does one thing quickly and
            without external dependencies.
          </p>
          <p className="text-sm muted">
            Leaked secrets remain one of the most dependable ways into a system, which is why keeping
            them out of version control belongs next to the rest of your hardening work &mdash; the
            same discipline as the{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              container image security checklist
            </Link>{" "}
            and the wider practice of{" "}
            <Link href="/blog/software-supply-chain-security" className="underline">
              software supply chain security
            </Link>
            . A credential that never reaches the repository is one you never have to rotate under
            pressure.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How Gitleaks detects secrets</h2>
          <p className="text-sm muted">
            Gitleaks works on two signals. The primary one is a set of <strong>regular-expression
            rules</strong>, each describing the shape of a particular credential type, defined in
            TOML. It ships with a large default ruleset that covers common providers, and you extend
            or constrain it in a <code>.gitleaks.toml</code> file. The secondary signal is
            <strong> entropy</strong>: rules can require that a match also be random-looking enough,
            measured by Shannon entropy, to weed out low-value matches.
          </p>
          <p className="text-sm muted">
            The important architectural fact is that Gitleaks makes <em>no network calls</em>. It
            never contacts a provider to check whether a key is live &mdash; it decides purely from
            the text in front of it. That is the source of both its strengths (speed, offline
            operation, no data leaving your environment) and its main cost (it cannot tell a real,
            active key from a realistic-looking test fixture). Understanding that trade is the key to
            using it well.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Running Gitleaks</h2>
          <p className="text-sm muted">
            Install the binary and scan the current repository. By default the detect command walks
            git history, so it finds secrets that were committed once and later deleted:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# install (macOS)
brew install gitleaks

# scan this repo's full git history, write a JSON report
gitleaks detect --source . --report-format json --report-path gitleaks-report.json`}</pre>
          <p className="text-sm muted">
            To scan a plain directory that is not a git repository &mdash; a build context, an
            extracted archive &mdash; disable git mode. To catch secrets before they are ever
            committed, scan only the staged changes as a pre-commit step:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# scan a directory without git metadata
gitleaks detect --source ./build --no-git

# scan only staged changes (use in a pre-commit hook)
gitleaks protect --staged --redact

# newer releases expose these as dedicated subcommands
gitleaks git .
gitleaks dir ./build`}</pre>
          <p className="text-sm muted">
            Gitleaks exits non-zero when it finds a leak, so it fails a CI job with no extra wiring.
            The <code>--redact</code> flag keeps the secret value out of logs, which matters when your
            CI output is itself readable by a broad audience. There is also an official GitHub Action
            for scanning on pull requests.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Taming false positives</h2>
          <p className="text-sm muted">
            Because Gitleaks matches patterns rather than verifying credentials, a fresh run on a
            mature repository usually surfaces some noise: example keys in documentation, fixtures in
            tests, or a rule that is simply too broad. The tool gives you three levers to handle this
            without ignoring the scanner entirely.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Allowlists</strong> in <code>.gitleaks.toml</code> exclude paths, specific
              regexes, or known-safe values from matching in the first place.
            </li>
            <li>
              A <strong><code>.gitleaksignore</code></strong> file pins the fingerprint of individual
              findings you have reviewed and accepted, so they stay silent while everything else is
              still checked.
            </li>
            <li>
              A <strong>baseline</strong> file records the current findings once, after which only
              genuinely new leaks fail the build &mdash; a pragmatic way to adopt Gitleaks on a large
              existing repo without a big-bang cleanup.
            </li>
          </ul>
          <p className="text-sm muted">
            The discipline that keeps this honest is treating an allowlist entry as a decision, not a
            reflex: a value is safe to ignore because you confirmed it is a placeholder, not because
            the finding was inconvenient.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Gitleaks vs verification-based scanners</h2>
          <p className="text-sm muted">
            The obvious comparison is with TruffleHog, which centers on active verification &mdash;
            calling the provider&apos;s API to confirm a credential is live. That extra step cuts
            triage noise sharply, at the cost of network access and a bit of speed. Gitleaks stays in
            the other corner: no network, maximum speed, total configurability, and more findings to
            sift through. Neither approach is strictly better. A common pattern is to run Gitleaks as
            the fast local and pre-commit gate and reserve a verification sweep for deeper periodic
            scans.
          </p>
          <p className="text-sm muted">
            Whichever you choose, remember what secret scanning does <em>not</em> do: it will not tell
            you that a dependency has a known CVE or that your base image ships an outdated OpenSSL.
            That is a different question, answered by a vulnerability scanner, and a complete program
            runs both kinds of tool.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook is a vulnerability scanner rather than a secret scanner, and we would rather draw
            the line clearly than pretend to replace Gitleaks. Gitleaks is the right tool for keeping
            credentials out of your source and git history. ScanRook works on the artifact you ship:
            it reads the OS and language packages actually present in a container image or source tree
            and cross-references them against OSV, NVD, and Red Hat OVAL to find known
            vulnerabilities.
          </p>
          <p className="text-sm muted">
            The two meet at the image boundary. Secrets frequently get baked into a layer during a
            build, and ScanRook&apos;s work on inventorying cryptographic material &mdash; the keys
            and certificates in an image, which we cover in{" "}
            <Link href="/blog/what-is-a-cbom" className="underline">
              what is a CBOM
            </Link>{" "}
            &mdash; can surface private keys and certs embedded in the final artifact. That is a
            backstop at the shipped-image layer, not a substitute for scanning source with Gitleaks.
            The strongest setup runs a dedicated secret scanner across your repository and history,
            then scans the built image for both vulnerabilities and embedded key material with
            ScanRook before it goes out. If you are wiring scanning into a pipeline, the{" "}
            <Link href="/docs" className="underline">
              docs
            </Link>{" "}
            cover the CLI and CI recipes.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is Gitleaks?</h3>
              <p className="text-sm muted mt-1">
                An open-source, MIT-licensed Go tool that finds hardcoded credentials in git repos,
                directories, and standard input using regex rules and entropy, entirely offline.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How does it detect secrets?</h3>
              <p className="text-sm muted mt-1">
                Regex rules defined in TOML, optionally paired with a Shannon-entropy threshold. It
                ships a default ruleset and lets you add custom rules in <code>.gitleaks.toml</code>.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I cut false positives?</h3>
              <p className="text-sm muted mt-1">
                Use config allowlists, a <code>.gitleaksignore</code> file that pins reviewed finding
                fingerprints, or a baseline so only new leaks fail the build.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Gitleaks or TruffleHog?</h3>
              <p className="text-sm muted mt-1">
                Gitleaks is fast, offline, and configurable; TruffleHog verifies credentials against
                live APIs to reduce noise. They are complementary and often used together.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Cover the image, not just the repo</h3>
          <p className="text-sm muted leading-relaxed">
            Keep Gitleaks on your source and history, then scan the built image with ScanRook: OS and
            language packages cross-referenced against OSV, NVD, and Red Hat OVAL, plus embedded key
            material, before it reaches production.
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
            <Link href="/blog/software-supply-chain-security" className="underline">
              Software Supply Chain Security
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-a-cbom" className="underline">
              What Is a CBOM?
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
