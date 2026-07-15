import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-07";

const title = `Secret Scanning: A Practical Guide to Finding Leaked Keys | ${APP_NAME}`;
const description =
  "Secret scanning finds hardcoded credentials in code, git history, and images. Detection methods, the tool landscape, remediation, and where ScanRook fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "secret scanning",
    "secret scanning guide",
    "detect hardcoded secrets",
    "secrets in git history",
    "credential leak detection",
    "secret scanning tools",
    "push protection",
    "secret detection in ci",
    "rotate leaked secrets",
    "secrets in container images",
  ],
  alternates: { canonical: "/blog/secret-scanning-guide" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/secret-scanning-guide",
    images: ["/blog/secret-scanning-guide.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/secret-scanning-guide.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Secret Scanning: A Practical Guide to Finding Leaked Keys",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/secret-scanning-guide",
  image: "https://scanrook.io/blog/secret-scanning-guide.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is secret scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Secret scanning is the practice of automatically searching code, configuration, git history, container images, and logs for hardcoded credentials such as API keys, passwords, tokens, and private keys. Tools detect them with pattern rules, entropy analysis, or live verification, so leaked secrets can be found and rotated before an attacker uses them.",
      },
    },
    {
      "@type": "Question",
      name: "Why is deleting a leaked secret not enough?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Deleting a secret from the current file does not remove it from git history, container image layers, backups, or logs where it may also live, and it does nothing to the credential itself, which is still valid. The only reliable remediation is to rotate the secret at the provider so the exposed value stops working, then clean up the copies.",
      },
    },
    {
      "@type": "Question",
      name: "Where do secrets commonly leak?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The usual places are source files and .env files, configuration committed by accident, deep git history from a commit that was later reverted, container image layers where a key was copied in during the build, CI/CD logs that echo an environment variable, and notebooks or scripts shared outside version control.",
      },
    },
    {
      "@type": "Question",
      name: "What is push protection?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Push protection is a preventive control, offered by platforms such as GitHub, that scans a commit as it is being pushed and blocks the push if it contains a recognized secret. It shifts detection earlier than a post-commit scan, stopping many credentials from ever entering the remote repository in the first place.",
      },
    },
    {
      "@type": "Question",
      name: "Does a vulnerability scanner find secrets?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not primarily. Vulnerability scanners like ScanRook focus on known CVEs in the packages an artifact ships. Dedicated secret scanners are the right tool for credentials in code and history. The overlap is at the image layer, where scanning cryptographic material can surface private keys and certificates baked into a build.",
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
            Secret Scanning: A Practical Guide to Finding Leaked Keys
          </h1>
          <p className="text-sm muted">Published August 7, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            A leaked API key is one of the cleanest ways for an attacker to walk in the front door.
            <strong> Secret scanning</strong> is the practice of finding those credentials &mdash; in
            code, in git history, in container images, in logs &mdash; before someone else does. This
            guide covers what secret scanning is, how detection actually works, the tool landscape, a
            workflow you can adopt, and how to remediate a leak properly.
          </p>
        </header>

        <img
          src="/blog/secret-scanning-guide.jpg"
          alt="Secret scanning to find leaked credentials across code, history, and images"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What secret scanning is</h2>
          <p className="text-sm muted">
            Secret scanning is the automated search for hardcoded credentials in the places software
            lives: source files, configuration, git history, container images, and pipeline logs. The
            targets are the strings that grant access &mdash; cloud provider keys, database
            passwords, OAuth tokens, private keys, webhook signing secrets. The goal is simple: find
            an exposed credential and get it rotated before it is abused.
          </p>
          <p className="text-sm muted">
            It sits in the same family as other pre-production checks but answers a distinct question.
            A vulnerability scanner asks &ldquo;does anything I ship have a known flaw?&rdquo;; secret
            scanning asks &ldquo;did we accidentally publish a key?&rdquo; Both belong in a mature
            program, the same way the{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              container image security checklist
            </Link>{" "}
            and{" "}
            <Link href="/blog/software-supply-chain-security" className="underline">
              supply chain security
            </Link>{" "}
            each cover a slice of the same surface.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why a leaked secret is so dangerous</h2>
          <p className="text-sm muted">
            The damaging property of a secret is that it is <em>persistent and portable</em>. Commit a
            key once and it stays in git history forever, even after you delete the file in the next
            commit &mdash; the blob is still reachable in the repository&apos;s object store. Push
            that repository to a public host and the key is now indexed, cloned, and scraped by
            automated bots within minutes. The same key copied into a Docker image during a build
            persists in that layer regardless of whether a later layer removes the file.
          </p>
          <p className="text-sm muted">
            This is why &ldquo;we deleted it&rdquo; is never the fix. Deleting the visible copy leaves
            the credential valid and leaves copies in history, images, backups, and logs. The credential
            has to be rotated at the source, which we come back to below.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where secrets hide</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li><strong>Source and .env files</strong> &mdash; the obvious case, a key pasted in to &ldquo;just get it working.&rdquo;</li>
            <li><strong>Committed config</strong> &mdash; a settings file with a real value where a placeholder was intended.</li>
            <li><strong>Git history</strong> &mdash; a secret added, noticed, and reverted, but still present in an old commit.</li>
            <li><strong>Container image layers</strong> &mdash; a credential <code>COPY</code>ied in during a build and never truly removed.</li>
            <li><strong>CI/CD logs</strong> &mdash; a pipeline step that echoes an environment variable into readable output.</li>
            <li><strong>Notebooks and scripts</strong> &mdash; ad-hoc files shared over chat or attached to a ticket.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How detection works</h2>
          <p className="text-sm muted">
            Secret scanners lean on three techniques, usually in combination:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Pattern rules.</strong> Regular expressions describe the shape of a specific
              credential type &mdash; a provider prefix, a fixed length, a checksum. This is precise
              for well-structured keys and is how most tools cover the long tail of providers.
            </li>
            <li>
              <strong>Entropy analysis.</strong> Random-looking strings score high on Shannon entropy.
              Flagging high-entropy tokens catches keys that do not match any known pattern, at the
              cost of more noise.
            </li>
            <li>
              <strong>Verification.</strong> The scanner makes a read-only call to the issuing service
              to confirm the credential is live. This is the strongest signal because it separates a
              real active key from a realistic-looking fixture, but it requires network access.
            </li>
          </ul>
          <p className="text-sm muted">
            The trade between them is noise versus coverage versus reach. Pattern-only tools are fast
            and offline but flag test data; verification is quiet and confident but needs to reach the
            provider. Good programs accept that no single technique is complete and tune allowlists to
            keep the signal usable.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The tool landscape</h2>
          <p className="text-sm muted">
            The open-source ecosystem is healthy, and most teams standardize on one or two tools:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li><strong>TruffleHog</strong> &mdash; detector-driven with active credential verification, strong for confirming live secrets across code, history, and images.</li>
            <li><strong>Gitleaks</strong> &mdash; fast, offline, regex and entropy based, highly configurable through TOML; a common pre-commit and CI gate.</li>
            <li><strong>detect-secrets</strong> &mdash; a Yelp project built around a baseline file, designed to stop <em>new</em> secrets while accepting a documented backlog.</li>
            <li><strong>git-secrets</strong> &mdash; a lightweight AWS project focused on blocking commits that contain provider keys.</li>
            <li><strong>Platform scanning</strong> &mdash; GitHub and GitLab offer built-in secret scanning and push protection that catch many credentials at the source.</li>
          </ul>
          <p className="text-sm muted">
            Commercial services layer on managed detectors, dashboards, and automatic revocation
            integrations. The right choice is less about the tool and more about where you place it in
            the workflow.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A workflow you can adopt</h2>
          <p className="text-sm muted">
            Secret scanning is most effective in layers, each catching what the previous one missed:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li><strong>Pre-commit hook</strong> &mdash; scan staged changes so a developer is stopped before a secret is ever committed.</li>
            <li><strong>Push protection</strong> &mdash; a platform-level gate that blocks a push containing a recognized secret, backstopping the local hook.</li>
            <li><strong>CI on every pull request</strong> &mdash; a repository scan that fails the build, so nothing merges with a fresh leak.</li>
            <li><strong>Periodic full-history sweeps</strong> &mdash; a deeper, sometimes verified, scan of the whole history to find what predates your tooling.</li>
            <li><strong>Artifact scans</strong> &mdash; check built images for credentials and key material that entered outside the source tree.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Remediating a leak properly</h2>
          <p className="text-sm muted">
            When a scanner finds a real secret, the order of operations matters. First,{" "}
            <strong>rotate the credential</strong> at the provider so the exposed value stops working
            &mdash; this is the step that actually closes the risk. Only then clean up the copies:
            purge it from history if warranted, rebuild any image that baked it in, and scrub the logs
            that captured it. Finally, prevent the recurrence by moving the secret into a proper store
            &mdash; a managed secrets service or a vault &mdash; and injecting it at runtime rather
            than committing it. Treat rotation as non-negotiable and cleanup as follow-through.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook is a vulnerability scanner, and a dedicated secret scanner is the right tool for
            credentials in source and git history &mdash; we would rather say that plainly than
            overclaim. Where ScanRook contributes is at the artifact boundary. When it scans a
            container image or source tree, it inventories the cryptographic material present &mdash;
            the private keys and certificates baked into the build &mdash; as part of the work we
            describe in{" "}
            <Link href="/blog/what-is-a-cbom" className="underline">
              what is a CBOM
            </Link>
            . That catches key material that entered the image outside your source tree, which a
            repository-only secret scan never sees.
          </p>
          <p className="text-sm muted">
            The complete picture, then, is layered: dedicated secret scanning across code and history,
            push protection at the platform, and a vulnerability-plus-key-material scan of the image
            before it ships. If you want to see how much of a typical image lives below the source you
            wrote, our walkthrough of{" "}
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              how to scan a Docker image
            </Link>{" "}
            covers the mechanics.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is secret scanning?</h3>
              <p className="text-sm muted mt-1">
                Automatically searching code, config, git history, images, and logs for hardcoded
                credentials so they can be found and rotated before an attacker uses them.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why is deleting a secret not enough?</h3>
              <p className="text-sm muted mt-1">
                The credential is still valid and copies remain in history, images, backups, and logs.
                You must rotate it at the provider, then clean up the copies.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is push protection?</h3>
              <p className="text-sm muted mt-1">
                A preventive control that scans a commit as it is pushed and blocks the push if it
                contains a recognized secret, stopping many leaks before they reach the remote.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does a vulnerability scanner find secrets?</h3>
              <p className="text-sm muted mt-1">
                Not primarily. It focuses on known CVEs; the overlap is at the image layer, where
                scanning cryptographic material can surface embedded keys and certificates.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Close the gap at the image layer</h3>
          <p className="text-sm muted leading-relaxed">
            Pair dedicated secret scanning with ScanRook: scan the built image for known
            vulnerabilities and inventory the key material baked into its layers, so nothing embedded
            in the artifact slips past your repository checks.
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
