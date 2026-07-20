import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-26";

const title = `Bundler Audit: Scanning Ruby Gemfile.lock for CVEs | ${APP_NAME}`;
const description =
  "How bundler audit checks a Ruby Gemfile.lock against the ruby-advisory-db, what it catches, what it misses, and how to wire it into CI without noisy builds.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "bundler audit",
    "bundler-audit",
    "bundle audit",
    "ruby dependency scanning",
    "gemfile.lock vulnerabilities",
    "ruby-advisory-db",
    "ruby gem cve scanning",
    "rubysec",
    "ruby security scanning ci",
    "bundler audit ignore",
  ],
  alternates: { canonical: "/blog/bundler-audit" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/bundler-audit",
    images: ["/blog/bundler-audit.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/bundler-audit.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Bundler Audit: Scanning Ruby Gemfile.lock for CVEs",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/bundler-audit",
  image: "https://scanrook.io/blog/bundler-audit.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is bundler audit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "bundler-audit is an open-source Ruby gem maintained by the RubySec project. It reads your Gemfile.lock, compares every resolved gem version against the ruby-advisory-db advisory database, and reports gems with known vulnerabilities. It also flags insecure gem sources such as plain HTTP or git remotes. It runs entirely offline once the advisory database is on disk.",
      },
    },
    {
      "@type": "Question",
      name: "How do I run bundler audit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Install it with gem install bundler-audit or add it to your Gemfile development group, then run bundle-audit check --update from the directory containing your Gemfile.lock. The --update flag refreshes the local copy of ruby-advisory-db before checking. The command exits non-zero when it finds an advisory, which is what makes it usable as a CI gate.",
      },
    },
    {
      "@type": "Question",
      name: "How do I ignore a bundler audit advisory?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pass advisory identifiers to the --ignore flag, or commit a .bundler-audit.yml file at the project root with an ignore list of CVE or GHSA identifiers. Ignoring should always be paired with a note explaining why, because an ignore entry with no rationale becomes permanent and invisible. Review the ignore list on a schedule.",
      },
    },
    {
      "@type": "Question",
      name: "Does bundler audit find vulnerabilities in native extensions?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. bundler-audit only matches gem names and versions from Gemfile.lock against Ruby advisories. It does not look at the C libraries that native extensions link against, the operating system packages in your container image, or any binary vendored inside a gem. Those need a scanner that reads the artifact rather than the manifest.",
      },
    },
    {
      "@type": "Question",
      name: "Is bundler audit still maintained?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. bundler-audit and the ruby-advisory-db data it consumes are both maintained under the RubySec organization, and advisories are contributed by the Ruby community. Bundler itself has also moved toward shipping audit functionality directly, so check whether your Bundler version already exposes a bundle audit subcommand before installing the standalone gem.",
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
            Bundler Audit: Scanning Ruby Gemfile.lock for CVEs
          </h1>
          <p className="text-sm muted">Published December 26, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            A bundler audit run is the cheapest security check a Ruby project can have: it reads the
            lockfile you already commit, matches every resolved gem against a community-maintained
            advisory database, and exits non-zero if anything is affected. It is fast, offline, and
            has essentially no false-positive tuning to do. It is also narrower than most teams
            assume &mdash; here is exactly what it covers, what it does not, and how to run it so it
            stays useful instead of becoming another ignored CI warning.
          </p>
        </header>

        <img
          src="/blog/bundler-audit.jpg"
          alt="Bundler audit scanning a Ruby Gemfile.lock for known gem vulnerabilities"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What bundler-audit actually does</h2>
          <p className="text-sm muted">
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">bundler-audit</code>{" "}
            is a gem maintained by the RubySec project. Its job is deliberately small. It parses
            your{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">Gemfile.lock</code>,
            reads the exact resolved version of every gem in the dependency graph, and checks each
            one against{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">ruby-advisory-db</code>{" "}
            &mdash; a git repository of YAML advisory files, one per known Ruby vulnerability,
            recording the affected gem, the vulnerable version ranges, the patched versions, and the
            CVE or GHSA identifier.
          </p>
          <p className="text-sm muted">
            Because the lockfile pins exact versions, the match is unambiguous. There is no
            resolution guessing, no range arithmetic against a wildcard constraint, and no network
            call at check time once the advisory database has been cloned locally. That is why a
            typical run finishes in well under a second even on a large Rails application.
          </p>
          <p className="text-sm muted">
            It also does one thing beyond CVE matching: it flags insecure gem sources. A{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">source</code>{" "}
            or git remote served over plain HTTP or the unauthenticated git protocol is reported as
            an insecure source, because anyone on the path can substitute the gem you are installing.
            That check has caught more real supply-chain risk in old projects than most people
            expect.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Installing and running it</h2>
          <p className="text-sm muted">
            The standalone gem installs globally or as a development dependency. Recent Bundler
            releases have been folding audit functionality in directly, so check{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">bundle help</code>{" "}
            for an{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">audit</code>{" "}
            subcommand before adding another dependency. Either way the mental model is identical.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.05] dark:bg-white/[.05] p-4">
{`# install the standalone gem
gem install bundler-audit

# refresh the advisory database, then check the lockfile
bundle-audit check --update

# check only, using whatever advisory data is already on disk
bundle-audit check

# update the advisory database on its own (useful for cache warming)
bundle-audit update`}
          </pre>
          <p className="text-sm muted">
            Output lists each affected gem with its version, the advisory identifier, criticality,
            a short title, the solution (&ldquo;upgrade to &gt;= x.y.z&rdquo;), and a URL. When
            nothing matches you get{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">No vulnerabilities found</code>{" "}
            and an exit code of zero. When something matches, the exit code is non-zero &mdash; the
            entire CI story rests on that.
          </p>
          <p className="text-sm muted">
            Adding it to the Gemfile keeps the version consistent across the team:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.05] dark:bg-white/[.05] p-4">
{`group :development, :test do
  gem "bundler-audit", require: false
end`}
          </pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How the match works</h2>
          <p className="text-sm muted">
            The pipeline is short enough to hold in your head, which is a large part of why the tool
            is trusted:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 230"
              role="img"
              aria-label="bundler audit flow: Gemfile.lock is parsed into pinned gem versions, matched against the ruby-advisory-db YAML advisories, producing findings and an exit code, with insecure sources checked in parallel"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <defs>
                <marker id="ba-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              {[
                { x: 8, label: "Gemfile.lock", sub: "pinned versions" },
                { x: 176, label: "Parser", sub: "gem + version pairs" },
                { x: 366, label: "Matcher", sub: "version in range?", hot: true },
                { x: 556, label: "Exit code", sub: "0 or non-zero" },
              ].map((b) => (
                <g key={b.label}>
                  <rect
                    x={b.x}
                    y={20}
                    width={136}
                    height={54}
                    rx={8}
                    fill={b.hot ? "var(--dg-accent,#2563eb)" : "transparent"}
                    fillOpacity={b.hot ? 0.12 : 1}
                    stroke="currentColor"
                    strokeOpacity={0.5}
                  />
                  <text x={b.x + 68} y={43} textAnchor="middle" fontSize="13.5" fontWeight="600" fill="currentColor">
                    {b.label}
                  </text>
                  <text x={b.x + 68} y={62} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>
                    {b.sub}
                  </text>
                </g>
              ))}
              {[146, 336, 526].map((x) => (
                <line key={x} x1={x} y1={47} x2={x + 26} y2={47} stroke="currentColor" strokeWidth={2} markerEnd="url(#ba-arrow)" />
              ))}
              <rect x={330} y={112} width={208} height={30} rx={6} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.3} />
              <text x={434} y={131} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.75}>
                ruby-advisory-db (YAML, git)
              </text>
              <line x1={434} y1={112} x2={434} y2={76} stroke="currentColor" strokeWidth={2} markerEnd="url(#ba-arrow)" />
              <rect x={90} y={170} width={240} height={30} rx={6} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.3} />
              <text x={210} y={189} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.75}>
                Insecure source check (http://, git://)
              </text>
              <line x1={210} y1={74} x2={210} y2={170} stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.5} strokeDasharray="4 3" />
            </svg>
          </div>
          <figcaption className="text-xs muted">
            The bundler audit pipeline: manifest parsing on one side, advisory data on the other, and
            a version-range comparison in the middle. Everything the tool knows comes from those two
            inputs.
          </figcaption>
        </section>

        <img
          src="/blog/bundler-audit-2.jpg"
          alt="Ruby gem dependency tree with vulnerable gem versions highlighted among safe ones"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Wiring bundler audit into CI</h2>
          <p className="text-sm muted">
            The pattern that works is: refresh the advisory data, check, fail the job. Do not wrap it
            in a conditional that swallows the exit code &mdash; a check that cannot fail is
            documentation, not a gate.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.05] dark:bg-white/[.05] p-4">
{`# .github/workflows/audit.yml
name: dependency-audit
on:
  pull_request:
  schedule:
    - cron: "0 6 * * 1"   # weekly, so new advisories surface without a code change

jobs:
  bundler-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: "3.3"
          bundler-cache: true
      - name: Audit Gemfile.lock
        run: bundle exec bundle-audit check --update`}
          </pre>
          <p className="text-sm muted">
            The scheduled run matters more than the pull-request run. A lockfile that was clean on
            Monday can be vulnerable on Friday without a single line of code changing, because the
            advisory was published in between. Any dependency scanner that only runs on commit will
            miss that window entirely.
          </p>
          <p className="text-sm muted">
            For a Rake-driven pipeline, the gem ships a Rake task you can require in your{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">Rakefile</code>{" "}
            and chain into the default task, so{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">rake</code>{" "}
            runs the audit alongside the test suite.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Managing exceptions honestly</h2>
          <p className="text-sm muted">
            Sooner or later an advisory fires that you genuinely cannot act on this week &mdash; the
            fix is in a major version, the gem is unmaintained, or the vulnerable code path is not
            reachable from your application. bundler-audit supports both an inline flag and a config
            file:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.05] dark:bg-white/[.05] p-4">
{`# one-off
bundle-audit check --ignore CVE-2025-00000 GHSA-xxxx-xxxx-xxxx

# committed policy: .bundler-audit.yml
---
ignore:
  - CVE-2025-00000   # rack: parser path not reachable, tracked in SEC-142, revisit 2027-02
  - GHSA-xxxx-xxxx-xxxx`}
          </pre>
          <p className="text-sm muted">
            Two rules make this survivable. First, every ignore entry gets a comment with a reason
            and a review date &mdash; an undocumented suppression is indistinguishable from
            negligence six months later. Second, review the whole file on a cadence; entries
            accumulate and nobody deletes them. The same discipline applies to any scanner
            suppression, which we cover in more depth in{" "}
            <Link href="/blog/how-to-triage-vulnerability-scan-results" className="underline">
              how to triage vulnerability scan results
            </Link>
            .
          </p>
          <p className="text-sm muted">
            If your justification is &ldquo;that function is never called,&rdquo; be aware that
            bundler-audit has no idea whether it is called &mdash; it matches versions, not call
            graphs. Deciding reachability is a separate discipline; see{" "}
            <Link href="/blog/reachability-analysis" className="underline">
              reachability analysis
            </Link>{" "}
            for what that actually requires.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where bundler audit stops</h2>
          <p className="text-sm muted">
            The limits are structural rather than bugs, and they are the reason bundler audit is a
            floor rather than a ceiling:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Ruby gems only.</strong> The OS packages in your image, the JavaScript in your
              asset pipeline, and the system OpenSSL your app links against are all invisible to it.
            </li>
            <li>
              <strong>Native extensions are not inspected.</strong> A gem that vendors and compiles a
              C library is audited as a gem name and version, not as the library inside it. If that
              bundled library has a CVE, nothing in the Ruby advisory chain will tell you.
            </li>
            <li>
              <strong>Manifest, not artifact.</strong> It reads what the lockfile claims is
              installed. If your deployment installs gems differently, patches them in place, or
              ships a container built from a stale layer, the lockfile and reality can diverge. This
              is the distinction we unpack in{" "}
              <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
                installed-state scanning vs advisory matching
              </Link>
              .
            </li>
            <li>
              <strong>One advisory source.</strong> Coverage is exactly as good as ruby-advisory-db,
              which is community-curated and good, but not identical to what GitHub Security
              Advisories, OSV, or NVD hold for the same gems. Different databases genuinely disagree
              &mdash; see our{" "}
              <Link href="/blog/cve-database-comparison" className="underline">
                CVE database comparison
              </Link>
              .
            </li>
            <li>
              <strong>No severity scoring you can prioritise on.</strong> Advisories carry a
              criticality hint, not a consistent CVSS vector or exploit-likelihood signal, so
              ranking work across dozens of findings needs data from elsewhere.
            </li>
          </ul>
          <p className="text-sm muted">
            None of this is a criticism. Every ecosystem-native auditor makes the same trade &mdash;{" "}
            <Link href="/blog/npm-audit-explained" className="underline">
              npm audit
            </Link>
            ,{" "}
            <Link href="/blog/pip-audit-python-dependency-scanning" className="underline">
              pip-audit
            </Link>
            , and{" "}
            <Link href="/blog/cargo-audit-rust-dependency-scanning" className="underline">
              cargo-audit
            </Link>{" "}
            all read a lockfile and consult one curated database. Fast, precise, narrow.
          </p>
        </section>

        <img
          src="/blog/bundler-audit-3.jpg"
          alt="CI pipeline gate blocking a build when a Ruby dependency audit finds a vulnerability"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Keep running bundler audit. It is the right tool at the right layer: it runs in
            milliseconds, needs no infrastructure, and gives a Ruby developer an answer in the
            vocabulary they already use. Nothing we build replaces that.
          </p>
          <p className="text-sm muted">
            What it cannot answer is what is actually in the thing you ship. When a Rails application
            becomes a container image, the attack surface is the gems <em>plus</em> the base image
            packages, the system libraries the native extensions bind to, and anything the build
            copied in. ScanRook scans the artifact &mdash; an image tarball, a binary, or a source
            archive &mdash; reads the real package databases inside it, and matches every package
            against OSV, NVD, and Red Hat OVAL rather than a single curated feed. Each finding
            carries the source it came from and a confidence tier, so you can see whether a hit is
            corroborated or comes from one database only.
          </p>
          <p className="text-sm muted">
            The sensible split: bundler audit gates the pull request on Ruby dependencies, and an
            artifact scan gates the image before it reaches a registry. If you want to see the
            difference concretely, scan an image built from your own Gemfile.lock and compare the
            finding count against what the lockfile audit reported. The gap is the part bundler audit
            was never designed to see. Our{" "}
            <Link href="/blog/container-image-scanning-guide" className="underline">
              container image scanning guide
            </Link>{" "}
            walks through that second layer end to end.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is bundler audit?</h3>
              <p className="text-sm muted mt-1">
                A RubySec-maintained gem that checks the pinned versions in your Gemfile.lock against
                the ruby-advisory-db database and reports gems with known vulnerabilities, plus
                insecure gem sources.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I run it?</h3>
              <p className="text-sm muted mt-1">
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">bundle-audit check --update</code>{" "}
                from the project root. It refreshes the advisory database first, then exits non-zero
                if any advisory applies.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I suppress a finding?</h3>
              <p className="text-sm muted mt-1">
                Use{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--ignore</code>{" "}
                with advisory IDs, or commit a{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.bundler-audit.yml</code>{" "}
                with an ignore list. Always record a reason and a review date next to each entry.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does it cover native extensions?</h3>
              <p className="text-sm muted mt-1">
                No. It matches gem names and versions only. C libraries compiled or vendored inside a
                gem, and everything in the surrounding OS image, need an artifact-level scan.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">See what the lockfile audit misses</h3>
          <p className="text-sm muted leading-relaxed">
            Scan the container image you build from that same Gemfile.lock and compare. Every
            ScanRook finding names its advisory source and confidence tier, so you can verify the
            difference instead of taking our word for it.
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
            <Link href="/blog/npm-audit-explained" className="underline">
              npm audit Explained
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              What Is Software Composition Analysis?
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/sbom-generation-in-ci" className="underline">
              SBOM Generation in CI
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
