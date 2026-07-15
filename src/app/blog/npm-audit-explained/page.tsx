import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-26";

const title = `npm audit Explained: What It Catches and What It Misses | ${APP_NAME}`;
const description =
  "What npm audit checks, how it reads your lockfile against the GitHub Advisory Database, why it over- and under-reports, and where container scanning helps.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "npm audit",
    "npm audit explained",
    "npm audit fix",
    "npm audit false positives",
    "npm vulnerabilities",
    "node package vulnerabilities",
    "github advisory database",
    "npm audit vs snyk",
    "fix npm vulnerabilities",
    "npm security scanning",
  ],
  alternates: { canonical: "/blog/npm-audit-explained" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/npm-audit-explained",
    images: ["/blog/npm-audit-explained.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/npm-audit-explained.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "npm audit Explained: What It Catches and What It Misses",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/npm-audit-explained",
  image: "https://scanrook.io/blog/npm-audit-explained.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does npm audit actually do?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "npm audit sends a description of your resolved dependency tree, taken from package-lock.json, to the configured registry's audit endpoint. The public npm registry answers using data from the GitHub Advisory Database, returning known vulnerabilities for the exact versions you have installed. It then prints a report grouped by severity and suggests fixes.",
      },
    },
    {
      "@type": "Question",
      name: "Why does npm audit report so many vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "npm audit reports every advisory that matches a package in your tree, including deep transitive dependencies and dev-only build tooling that never ships to production. A single vulnerable build dependency can surface dozens of advisories. Running with --omit=dev and checking whether the code path is reachable usually shrinks the list dramatically.",
      },
    },
    {
      "@type": "Question",
      name: "Does npm audit fix break my build?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "npm audit fix only applies changes within your declared semver ranges, so it is usually safe. npm audit fix --force is different: it can install breaking major versions to reach a patched release, which can break your build. Always review the diff and re-run your tests after either command.",
      },
    },
    {
      "@type": "Question",
      name: "Does npm audit catch vulnerabilities in the final Docker image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. npm audit only reads your lockfile, so it sees the npm packages you declare, not the operating-system packages, system libraries, or bundled binaries that also ship in the image. It also cannot tell you what survived a production prune. Scanning the built artifact is what closes that gap.",
      },
    },
    {
      "@type": "Question",
      name: "Is npm audit enough on its own?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It is a good first line of defense for JavaScript dependencies, and it is free and built in. It is not a complete picture: it ignores OS packages, does not verify reachability, and trusts that the lockfile matches what actually shipped. Pair it with a scanner that reads the built image or source tree.",
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
            npm audit Explained: What It Catches and What It Misses
          </h1>
          <p className="text-sm muted">Published August 26, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">npm audit</code>{" "}
            is the vulnerability check almost every JavaScript developer has run, usually because it
            printed a wall of red text after an install. It is genuinely useful and genuinely
            misunderstood. Here is what it actually does, why its counts swing so wildly, and where
            it stops seeing.
          </p>
        </header>

        <img
          src="/blog/npm-audit-explained.jpg"
          alt="How npm audit reads a lockfile and matches advisories"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What npm audit actually does</h2>
          <p className="text-sm muted">
            When you run <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">npm audit</code>,
            npm builds a description of your fully resolved dependency tree from{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">package-lock.json</code>{" "}
            (or <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">npm-shrinkwrap.json</code>)
            and sends it to the configured registry&apos;s audit endpoint. Against the public npm
            registry, that endpoint answers using data sourced from the GitHub Advisory Database. The
            response is the set of advisories that apply to the exact package versions you have
            locked, and npm renders it as a report grouped into four severities: low, moderate, high,
            and critical.
          </p>
          <p className="text-sm muted">
            Two things are worth pinning down. First, it is a lockfile operation, not a code
            analysis &mdash; npm never inspects what your program does with a dependency, only which
            versions are present. Second, it is version-range matching against a curated advisory
            list. That makes it fast and reproducible, and it is the same fundamental approach we
            describe in{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs. advisory matching
            </Link>
            . The quality of the answer is entirely a function of the advisory data and how honestly
            it maps to your real risk.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Reading the report</h2>
          <p className="text-sm muted">
            A typical entry names the vulnerable package, the advisory severity, the affected version
            range, the patched version, and the dependency path that pulled it in. The summary line
            at the bottom &mdash; something like &ldquo;47 vulnerabilities (of which 12 high, 3
            critical)&rdquo; &mdash; is the number people react to, and it is also the number that
            causes the most confusion, because it counts advisories, not exploitable problems in
            your app.
          </p>
          <p className="text-sm muted">
            A few flags change what you see. <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--omit=dev</code>{" "}
            (formerly <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--production</code>)
            drops devDependencies, which is the single biggest lever on the count.{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--audit-level=high</code>{" "}
            sets the threshold at which the command exits non-zero, which matters in CI.{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--json</code>{" "}
            gives you machine-readable output for a dashboard or gate.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">npm audit fix, and its limits</h2>
          <p className="text-sm muted">
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">npm audit fix</code>{" "}
            tries to resolve findings automatically by upgrading to a patched release that still
            satisfies the semver ranges in your{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">package.json</code>.
            When a fix exists inside those ranges, this is close to free. When it does not, npm
            reports the finding as requiring manual review, and{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">npm audit fix --force</code>{" "}
            is offered as the escape hatch.
          </p>
          <p className="text-sm muted">
            Treat <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--force</code>{" "}
            with respect. It will install breaking major versions to reach a patched release, which
            can and does break builds &mdash; especially for transitive dependencies you never chose
            directly. The safe pattern is: run the plain fix, commit it, run{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--force</code>{" "}
            only for the findings that remain, review the lockfile diff, and re-run your test suite
            before you trust it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why it over-reports</h2>
          <p className="text-sm muted">
            The famous complaint &mdash; &ldquo;a fresh app has 80 vulnerabilities before I write a
            line of code&rdquo; &mdash; is real, and it is mostly an artifact of two things. Deep
            transitive dependencies mean one flawed low-level package can appear along many paths and
            inflate the count. And devDependencies &mdash; bundlers, test runners, linters &mdash;
            are audited by default even though they never reach production. A vulnerability in a
            build tool that only runs on a developer laptop is a very different risk from one in code
            that serves live traffic.
          </p>
          <p className="text-sm muted">
            npm audit also does not reason about <em>reachability</em>. If a vulnerable function in a
            dependency is never called on any path your app takes, the advisory still matches your
            installed version and still shows up. That is not a bug &mdash; version matching cannot
            know what you call &mdash; but it means the raw count overstates exploitable risk. The
            fix is process, not a flag: triage by whether the dependency is production, whether the
            affected code is reachable, and whether an exploit is known, the same triage we walk
            through for any scanner output.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why it under-reports</h2>
          <p className="text-sm muted">
            The over-reporting is loud, so people miss the quieter problem: npm audit only knows
            about the npm packages in your lockfile. Everything else that ends up in a running
            container is invisible to it. The Debian or Alpine base image under your Node app ships
            OpenSSL, glibc or musl, zlib, and dozens of other system packages &mdash; npm audit sees
            none of them. Native addons compiled at install time, binaries copied in during the
            build, and anything vendored outside the package manager are equally out of scope.
          </p>
          <p className="text-sm muted">
            There is also a subtler gap: the lockfile describes what npm <em>would</em> install, not
            necessarily what actually shipped. Multi-stage builds, production prunes, and manual
            copies can add or remove files between{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">npm ci</code>{" "}
            and the final image. Two projects with identical lockfiles can ship different bytes.
            Auditing the lockfile answers &ldquo;are my declared dependencies known-vulnerable&rdquo;
            &mdash; not &ldquo;is what I am about to deploy known-vulnerable.&rdquo;
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook does not replace <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">npm audit</code>;
            it covers the ground npm audit cannot. When you scan a container image or a source tree,
            ScanRook enumerates the npm packages that are actually present &mdash; reading the real{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">node_modules</code>{" "}
            and manifests on disk &mdash; alongside the OS packages, so you get the JavaScript
            dependencies and the system libraries in one report. Findings are cross-referenced across
            OSV, NVD, and GitHub Security Advisories (GHSA), so a package flagged by one source but
            not another still surfaces, with the source and a confidence tier attached. Our{" "}
            <Link href="/blog/cve-database-comparison" className="underline">
              CVE database comparison
            </Link>{" "}
            and{" "}
            <Link href="/blog/what-is-osv" className="underline">
              guide to the OSV API
            </Link>{" "}
            explain why more than one source matters.
          </p>
          <p className="text-sm muted">
            In practice the two are complementary: run <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">npm audit</code>{" "}
            early, on the lockfile, for fast developer feedback; scan the built artifact to verify
            what actually ships and to catch the base-image CVEs npm never looks at. If you want a
            worked example of tightening the npm side specifically, see{" "}
            <Link href="/blog/fix-npm-vulnerabilities-in-docker" className="underline">
              how to fix npm vulnerabilities in Docker builds
            </Link>
            . Commercial tools like Snyk sit in a similar space to the audit half of this; our{" "}
            <Link href="/compare/snyk" className="underline">ScanRook vs Snyk</Link> page covers that
            comparison honestly.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What does npm audit actually do?</h3>
              <p className="text-sm muted mt-1">
                It sends your resolved lockfile tree to the registry audit endpoint, which matches it
                against the GitHub Advisory Database and returns known vulnerabilities for your exact
                installed versions.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why does it report so many issues?</h3>
              <p className="text-sm muted mt-1">
                It counts every matching advisory, including deep transitive and dev-only build
                dependencies. Running <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--omit=dev</code> and
                triaging by reachability shrinks the list a lot.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is npm audit fix safe?</h3>
              <p className="text-sm muted mt-1">
                The plain command is usually safe because it stays in your semver ranges.{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--force</code> can
                install breaking majors, so review the diff and re-run tests.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does it see my Docker image?</h3>
              <p className="text-sm muted mt-1">
                No. It reads the lockfile only, so OS packages, system libraries, and bundled
                binaries are invisible. Scanning the built artifact covers that gap.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan what actually ships, not just the lockfile</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook reads the npm packages and the OS packages inside your built image, cross-checks
            them against OSV, NVD, and GHSA, and tags every finding with its source. It is the second
            half of the picture npm audit starts.
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
            <Link href="/blog/fix-npm-vulnerabilities-in-docker" className="underline">
              How to Fix npm Vulnerabilities in Docker Builds
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              Installed-State Scanning vs. Advisory Matching
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-osv" className="underline">
              What Is the OSV API?
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
