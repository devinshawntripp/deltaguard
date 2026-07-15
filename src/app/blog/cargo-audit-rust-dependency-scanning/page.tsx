import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-02";

const title = `cargo audit: Scanning Rust Dependencies With RustSec | ${APP_NAME}`;
const description =
  "cargo audit scans Rust dependencies for advisories from the RustSec database. How the tool works, what it covers, its limits, and where ScanRook fits in.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "cargo audit",
    "cargo-audit",
    "rust dependency scanning",
    "rustsec advisory database",
    "scan rust dependencies for vulnerabilities",
    "cargo audit tutorial",
    "rust vulnerability scanner",
    "cargo auditable",
    "audit cargo.lock",
    "rust crate vulnerabilities",
  ],
  alternates: { canonical: "/blog/cargo-audit-rust-dependency-scanning" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/cargo-audit-rust-dependency-scanning",
    images: ["/blog/cargo-audit-rust-dependency-scanning.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/cargo-audit-rust-dependency-scanning.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "cargo audit: Scanning Rust Dependencies With RustSec",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/cargo-audit-rust-dependency-scanning",
  image: "https://scanrook.io/blog/cargo-audit-rust-dependency-scanning.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is cargo audit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "cargo audit is a command-line tool maintained by the RustSec project that scans a Rust project's Cargo.lock for crates with known security advisories. It reads the full dependency tree, matches each crate and version against the RustSec Advisory Database, and reports vulnerabilities, patched versions, and how each affected crate is pulled in.",
      },
    },
    {
      "@type": "Question",
      name: "What is the RustSec Advisory Database?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "RustSec is a community-curated database of security advisories for crates published on crates.io. Each advisory has a RUSTSEC identifier, often with a CVE alias, and covers not just vulnerabilities but also unmaintained and unsound crates. RustSec advisories are also published in the OSV format and flow into OSV and the GitHub Advisory Database.",
      },
    },
    {
      "@type": "Question",
      name: "Can cargo audit scan a compiled Rust binary?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Only if the binary was built with cargo-auditable, which embeds the dependency list into the binary. cargo audit bin then reads that embedded data. A plain stripped release binary carries no crate version information, so dependency-level auditing of it is not possible without the lockfile or auditable metadata.",
      },
    },
    {
      "@type": "Question",
      name: "Does cargo audit cover the OS or other languages?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. cargo audit only covers Rust crates in the RustSec database. It does not look at OS packages such as OpenSSL or glibc, and it does not inspect other language ecosystems. Auditing a full container image needs a scanner that also reads the OS package database.",
      },
    },
    {
      "@type": "Question",
      name: "What are cargo audit warnings versus vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Beyond vulnerabilities, cargo audit reports warnings for crates that are unmaintained, yanked, or carry informational advisories. These are not exploitable flaws but signal supply-chain risk worth tracking. You can configure which warning classes fail a build so CI stays actionable.",
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
            cargo audit: Scanning Rust Dependencies With RustSec
          </h1>
          <p className="text-sm muted">Published September 2, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            <strong>cargo audit</strong> is the standard way to check a Rust project for
            known-vulnerable dependencies. It is maintained by the RustSec project, reads your
            <code> Cargo.lock</code>, and matches every crate against a curated advisory database in a
            single command. Here is how it works, what the RustSec database covers, where its limits
            are, and how it fits alongside scanning the image you ship.
          </p>
        </header>

        <img
          src="/blog/cargo-audit-rust-dependency-scanning.jpg"
          alt="cargo audit scanning a Rust Cargo.lock against the RustSec advisory database"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What cargo audit is</h2>
          <p className="text-sm muted">
            cargo audit is a command-line tool maintained by the RustSec project, part of the Rust
            Secure Code Working Group. It installs as a Cargo subcommand and does one job well: take
            the fully resolved dependency tree in your <code>Cargo.lock</code> &mdash; every direct
            and transitive crate, at its exact version &mdash; and check each one against the RustSec
            Advisory Database. For any match it reports the advisory, the patched versions, and a
            dependency path showing exactly how the affected crate ends up in your build.
          </p>
          <p className="text-sm muted">
            Because it reads the lockfile rather than your <code>Cargo.toml</code> ranges, it audits
            the versions you will actually build with, not the versions you might resolve to. That is
            the same installed-versus-declared distinction we dig into in{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs. advisory matching
            </Link>{" "}
            &mdash; auditing the resolved lockfile is more accurate than auditing a manifest of
            ranges.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The RustSec Advisory Database</h2>
          <p className="text-sm muted">
            cargo audit is only as good as its data, and its data is the RustSec Advisory Database
            &mdash; a community-curated, open repository of advisories for crates published on
            crates.io. Each advisory carries a <code>RUSTSEC-YYYY-NNNN</code> identifier, frequently
            with a CVE alias, and the database covers more than classic vulnerabilities: it also
            tracks crates that are unmaintained or unsound, which are supply-chain signals rather than
            exploitable bugs.
          </p>
          <p className="text-sm muted">
            Importantly, RustSec advisories are published in the{" "}
            <Link href="/blog/what-is-osv" className="underline">
              OSV format
            </Link>{" "}
            and flow into OSV and the GitHub Advisory Database. That means the same Rust advisory data
            reaches scanners that consume OSV, so the ecosystem shares a single source of truth even
            when the tooling differs.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Running cargo audit</h2>
          <p className="text-sm muted">
            Install it once, then run it from any project directory that has a <code>Cargo.lock</code>:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`cargo install cargo-audit
cargo audit`}</pre>
          <p className="text-sm muted">
            cargo audit exits non-zero when it finds a vulnerability, so a bare invocation already
            gates CI. For machine-readable output and finer control over which warning classes should
            fail the build:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# JSON for pipelines
cargo audit --json

# treat unmaintained-crate warnings as failures too
cargo audit --deny unmaintained`}</pre>
          <p className="text-sm muted">
            There is also experimental remediation. With the fix feature enabled, cargo audit can
            update <code>Cargo.lock</code> to patched versions where a compatible one exists:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`cargo audit fix --dry-run`}</pre>
          <p className="text-sm muted">
            As with any automatic dependency bump, run your tests afterward &mdash; a patched version
            can still change behavior.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The compiled-binary problem</h2>
          <p className="text-sm muted">
            cargo audit&apos;s reliance on <code>Cargo.lock</code> exposes a real gap for anyone
            shipping containers. A stripped Rust release binary &mdash; the thing that actually lands
            in your image &mdash; carries no crate-version information. There is no lockfile inside the
            container, so you cannot audit the binary the way you audit the source.
          </p>
          <p className="text-sm muted">
            The RustSec project&apos;s answer is <strong>cargo-auditable</strong>, which embeds a
            compact list of the exact dependencies into the compiled binary at build time.
            <code> cargo audit bin</code> can then read that embedded data straight from the artifact:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# build with dependency info embedded
cargo install cargo-auditable
cargo auditable build --release

# audit the shipped binary itself
cargo audit bin target/release/my-service`}</pre>
          <p className="text-sm muted">
            This is a genuinely good pattern, but it only works if you adopt it &mdash; and it does
            nothing for the OS layer of the image around your binary.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook scans the built artifact. In a source scan it reads your <code>Cargo.lock</code>{" "}
            to inventory Rust dependencies, and in a container scan it reads the OS package database
            (dpkg, rpm, or apk) alongside any embedded dependency metadata present in the image, then
            cross-references every component against OSV, NVD, and GHSA. Because RustSec advisories
            flow into OSV, the Rust findings line up with what cargo audit would report from the same
            data.
          </p>
          <p className="text-sm muted">
            We are candid about the boundary: a plain stripped Rust binary is a hard target for any
            scanner, ScanRook included &mdash; the crate versions simply are not in it. That is
            exactly why cargo-auditable exists, and why the strongest setup keeps the lockfile audit
            in your Rust CI. What ScanRook adds is everything else in the image: the base OS packages,
            the system libraries, and any other language ecosystems, in the artifact you actually
            deploy. Wiring a dependency audit into your commit flow, as in{" "}
            <Link href="/blog/pre-commit-vulnerability-scanning" className="underline">
              pre-commit vulnerability scanning
            </Link>
            , plus an image scan before release, covers both ends.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Using both</h2>
          <p className="text-sm muted">
            Keep cargo audit in your Rust CI, pinned to <code>Cargo.lock</code>: it is fast, it
            understands crates natively, it flags unmaintained dependencies, and it can attempt fixes.
            Then scan the finished image with ScanRook so the OS layer and anything outside the Rust
            toolchain gets checked too. cargo audit answers &ldquo;are my crates clean?&rdquo;
            ScanRook answers &ldquo;is the container I am about to deploy clean?&rdquo; The{" "}
            <Link href="/docs" className="underline">
              docs
            </Link>{" "}
            cover the CLI and CI recipes, and the{" "}
            <Link href="/pricing" className="underline">
              pricing page
            </Link>{" "}
            lists which enrichment sources each plan includes.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is cargo audit?</h3>
              <p className="text-sm muted mt-1">
                A RustSec-maintained tool that scans a project&apos;s <code>Cargo.lock</code> against
                the RustSec Advisory Database and reports vulnerable crates and their patched
                versions.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is the RustSec Advisory Database?</h3>
              <p className="text-sm muted mt-1">
                A community-curated database of advisories for crates.io packages, covering
                vulnerabilities plus unmaintained and unsound crates, also published in OSV format.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can it scan a compiled binary?</h3>
              <p className="text-sm muted mt-1">
                Only if built with cargo-auditable, which embeds the dependency list. A plain stripped
                binary carries no crate-version information to audit.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does it cover the OS or other languages?</h3>
              <p className="text-sm muted mt-1">
                No. cargo audit is Rust-only. OS packages and non-Rust components need a scanner that
                reads the OS package database.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Audit the crates and the image</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook reads your Rust dependencies and the OS packages that ship in the container, then
            cross-references OSV, NVD, and GHSA &mdash; the breadth that complements cargo audit&apos;s
            depth on your lockfile.
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
            <Link href="/blog/what-is-osv" className="underline">
              What Is the OSV API?
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              Installed-State Scanning vs. Advisory Matching
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/pre-commit-vulnerability-scanning" className="underline">
              Pre-Commit Vulnerability Scanning
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
