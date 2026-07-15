import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-18";

const title = `TruffleHog: Secret Scanning With Credential Verification | ${APP_NAME}`;
const description =
  "TruffleHog is an open-source secret scanner that verifies found credentials against live APIs. How it works, what it catches, and where ScanRook fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "trufflehog",
    "trufflehog secret scanning",
    "trufflehog github",
    "trufflehog docker",
    "secret scanner",
    "detect secrets in git",
    "credential verification",
    "trufflehog vs gitleaks",
    "scan repo for api keys",
    "leaked credentials scanner",
  ],
  alternates: { canonical: "/blog/trufflehog-secret-scanning" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/trufflehog-secret-scanning",
    images: ["/blog/trufflehog-secret-scanning.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/trufflehog-secret-scanning.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "TruffleHog: Secret Scanning With Credential Verification",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/trufflehog-secret-scanning",
  image: "https://scanrook.io/blog/trufflehog-secret-scanning.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is TruffleHog?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "TruffleHog is an open-source secret scanner maintained by Truffle Security. It searches source code, git history, container images, and cloud sources for credentials such as API keys and tokens. Its defining feature is active verification: it calls the provider's API to confirm whether a found credential is still live before reporting it.",
      },
    },
    {
      "@type": "Question",
      name: "How does TruffleHog verification work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For each candidate secret, TruffleHog runs a detector that knows how to test that credential type. It makes a lightweight, read-only API call to the issuing service and marks the finding verified if the credential authenticates. This separates confirmed-live secrets from unverified pattern matches, which sharply reduces the false positives that plague regex-only scanners.",
      },
    },
    {
      "@type": "Question",
      name: "What can TruffleHog scan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "TruffleHog scans local git repositories including full history, remote GitHub and GitLab organizations, filesystems, container images, S3 and GCS buckets, CI logs, and more through its source subcommands. Because it walks every commit, it can surface a secret that was committed once and later deleted from the working tree.",
      },
    },
    {
      "@type": "Question",
      name: "TruffleHog vs Gitleaks: what is the difference?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both are open-source Go tools that find secrets in code and git history. TruffleHog focuses on verification, actively testing credentials against provider APIs to confirm they are live. Gitleaks relies on regex rules and entropy without network calls, so it is faster and fully offline but produces more findings to triage. Many teams run both.",
      },
    },
    {
      "@type": "Question",
      name: "Does TruffleHog scan container images for secrets?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The docker source lets TruffleHog inspect image layers for credentials baked into the build. That is worth doing because secrets copied into an early layer persist in the image even if a later layer deletes the file. Scanning the final artifact catches keys that never appear in the current source tree.",
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
            TruffleHog: Secret Scanning With Credential Verification
          </h1>
          <p className="text-sm muted">Published July 14, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            <strong>TruffleHog</strong> is one of the most widely used open-source secret scanners,
            and its headline feature sets it apart from the pack: instead of only pattern-matching for
            things that look like credentials, it actively verifies them against the provider&apos;s
            API. Here is how TruffleHog works, what it can scan, its honest limits, and how it fits
            alongside scanning the artifact you actually ship.
          </p>
        </header>

        <img
          src="/blog/trufflehog-secret-scanning.jpg"
          alt="TruffleHog secret scanning with live credential verification"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What TruffleHog is</h2>
          <p className="text-sm muted">
            TruffleHog is an open-source command-line tool maintained by Truffle Security. The
            original project, written in Python around 2016, made its name by flagging
            high-entropy strings in git history. The current generation &mdash; a ground-up rewrite in
            Go &mdash; replaced the blunt entropy approach with hundreds of purpose-built
            <em> detectors</em>, each of which understands the exact shape of a specific credential
            type, from cloud provider keys to database URLs to third-party SaaS tokens.
          </p>
          <p className="text-sm muted">
            That detector model is what makes the tool precise. Rather than guessing that any random
            40-character string might be a secret, TruffleHog knows what an AWS access key, a GitHub
            token, or a Stripe key looks like, and it knows how to test each one. Leaked credentials
            are one of the most reliable ways attackers get an initial foothold, which is why secret
            scanning belongs in the same hardening conversation as the{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              container image security checklist
            </Link>{" "}
            and broader{" "}
            <Link href="/blog/software-supply-chain-security" className="underline">
              software supply chain security
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The differentiator: verification</h2>
          <p className="text-sm muted">
            Most secret scanners stop at detection: they find a string that matches a pattern and
            report it. TruffleHog goes one step further. For every candidate it finds, the matching
            detector makes a lightweight, read-only call to the issuing service and asks, in effect,
            &ldquo;is this credential still valid?&rdquo; If it authenticates, the finding is marked
            <strong> verified</strong>; if not, it is reported as <strong>unverified</strong>.
          </p>
          <p className="text-sm muted">
            This matters because the biggest cost of secret scanning is not detection &mdash; it is
            triage. A wall of maybe-secrets trains teams to ignore the tool. When TruffleHog tells you
            a credential is verified live, that is not a guess: someone can use it right now. Running
            with <code>--only-verified</code> collapses the noise down to findings that demand an
            immediate rotation, which is usually where you want to start.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What TruffleHog can scan</h2>
          <p className="text-sm muted">
            TruffleHog is organized around <em>sources</em> &mdash; each subcommand knows how to walk
            a different place secrets hide:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li><code>git</code> &mdash; a local repository, scanning every commit in history, not just the current tree.</li>
            <li><code>github</code> / <code>gitlab</code> &mdash; whole organizations or individual repos, including issues and CI where supported.</li>
            <li><code>filesystem</code> &mdash; a directory or set of files on disk.</li>
            <li><code>docker</code> &mdash; the layers of a container image.</li>
            <li><code>s3</code> / <code>gcs</code> &mdash; objects in cloud storage buckets.</li>
          </ul>
          <p className="text-sm muted">
            The git-history capability is the one people underestimate. A secret that was committed
            once, noticed, and deleted in the next commit is still sitting in the repository&apos;s
            object history forever &mdash; and still valid until it is rotated. TruffleHog walks that
            history, so it finds the ghost that a scan of the working tree alone would miss.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Running TruffleHog</h2>
          <p className="text-sm muted">
            Install the binary and point it at a source. Scanning the current repository&apos;s full
            history, showing only verified live credentials, looks like this:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# install (Linux/macOS)
curl -sSfL https://raw.githubusercontent.com/trufflesecurity/trufflehog/main/scripts/install.sh | sh -s -- -b /usr/local/bin

# scan this repo's full git history, verified findings only
trufflehog git file://. --only-verified`}</pre>
          <p className="text-sm muted">
            The same tool scans remote repositories, a filesystem path, or a built image with a
            different subcommand:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# a remote GitHub repository
trufflehog github --repo=https://github.com/example/app

# a directory on disk, JSON output for CI
trufflehog filesystem ./src --only-verified --json

# a container image
trufflehog docker --image=ghcr.io/example/app:latest`}</pre>
          <p className="text-sm muted">
            TruffleHog exits non-zero when it finds results, so a bare invocation already fails a CI
            job. It also ships as a GitHub Action and a pre-commit hook, so you can gate pull requests
            and catch secrets before they are ever committed &mdash; the same shift-left instinct
            behind pre-commit dependency checks.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What it catches &mdash; and what it misses</h2>
          <p className="text-sm muted">
            TruffleHog is excellent at what it targets: credentials, in code and history and images,
            with a confidence signal you can act on. Its verification model makes it unusually good at
            answering the question that actually matters, which is &ldquo;is this live?&rdquo; rather
            than &ldquo;does this look like a key?&rdquo;
          </p>
          <p className="text-sm muted">
            It is not a vulnerability scanner, though, and it is worth being clear about that scope. It
            does not tell you that the OpenSSL in your base image is out of date, that a Python package
            has a known CVE, or that a JAR is affected by{" "}
            <Link href="/blog/log4shell-cve-2021-44228" className="underline">
              Log4Shell
            </Link>
            . Secret scanning and dependency scanning answer different questions, and a complete
            program runs both. Verification also depends on network access to each provider, so an
            air-gapped run falls back to unverified detection &mdash; still useful, just noisier.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook is a vulnerability scanner, not a secret scanner &mdash; the two are
            complementary, and we would rather be honest about the boundary than blur it. TruffleHog
            is the right tool for auditing source and git history for live credentials. ScanRook comes
            at the shipped artifact from the vulnerability angle: it reads the OS and language packages
            actually present in a container image or source tree and cross-references them against OSV,
            NVD, and Red Hat OVAL.
          </p>
          <p className="text-sm muted">
            There is one place the two overlap in spirit. Secrets have a habit of getting baked into
            image layers, and ScanRook&apos;s work on cataloguing cryptographic material &mdash; the
            keys, certificates, and algorithms in an image, which we describe in{" "}
            <Link href="/blog/what-is-a-cbom" className="underline">
              what is a CBOM
            </Link>{" "}
            &mdash; surfaces private keys and certificates embedded in the build. That is not a
            replacement for TruffleHog&apos;s credential verification; it is a second net at the
            artifact layer. The practical setup is to run a dedicated secret scanner against your
            source and history, and scan the final image for both vulnerabilities and embedded key
            material before it ships.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is TruffleHog?</h3>
              <p className="text-sm muted mt-1">
                An open-source secret scanner from Truffle Security that finds credentials in code,
                git history, and images &mdash; and verifies them against provider APIs to confirm
                which are live.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How does verification work?</h3>
              <p className="text-sm muted mt-1">
                A per-credential detector makes a read-only API call to the issuing service and marks
                the finding verified if it authenticates, separating live secrets from pattern
                matches.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What can it scan?</h3>
              <p className="text-sm muted mt-1">
                Local git repos with full history, remote GitHub and GitLab, filesystems, container
                images, and S3 or GCS buckets, each through a dedicated source subcommand.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How is it different from Gitleaks?</h3>
              <p className="text-sm muted mt-1">
                TruffleHog verifies credentials against live APIs; Gitleaks uses offline regex and
                entropy. TruffleHog has less noise, Gitleaks is faster and needs no network. Many
                teams run both.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan the artifact, not just the source</h3>
          <p className="text-sm muted leading-relaxed">
            Pair a secret scanner with ScanRook: read the OS and language packages that actually ship
            in your image, cross-reference OSV, NVD, and Red Hat OVAL, and catch embedded key material
            before it reaches production.
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
