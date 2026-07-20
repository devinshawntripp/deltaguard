import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-15";

const title = `Brakeman: Static Security Analysis for Rails Apps | ${APP_NAME}`;
const description =
  "How Brakeman statically analyses a Rails codebase for SQL injection, XSS and mass assignment, its confidence levels, CI setup, and what it deliberately misses.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "brakeman",
    "brakeman rails",
    "brakeman scanner",
    "rails security scanner",
    "brakeman sast",
    "brakeman ci",
    "brakeman ignore file",
    "brakeman confidence levels",
    "ruby static analysis security",
    "brakeman vs bundler audit",
  ],
  alternates: { canonical: "/blog/brakeman-rails-security" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/brakeman-rails-security",
    images: ["/blog/brakeman-rails-security.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/brakeman-rails-security.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Brakeman: Static Security Analysis for Rails Apps",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/brakeman-rails-security",
  image: "https://scanrook.io/blog/brakeman-rails-security.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Brakeman?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Brakeman is an open-source static analysis security scanner built specifically for Ruby on Rails applications. It parses the application source into an abstract syntax tree, applies knowledge of Rails conventions, and reports likely security flaws such as SQL injection, cross-site scripting and mass assignment. It never runs the application or sends a request to it.",
      },
    },
    {
      "@type": "Question",
      name: "Does Brakeman need to run the Rails app?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Brakeman works purely from source. It does not boot the application, connect to a database, or require a running server, which makes it fast enough to run on every pull request and usable on a codebase you cannot start locally. That is also why it reasons about what code could do rather than what it did.",
      },
    },
    {
      "@type": "Question",
      name: "What do Brakeman confidence levels mean?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Brakeman labels each warning High, Medium or Weak confidence, reflecting how certain it is that user-controlled input actually reaches a dangerous call. High-confidence warnings usually indicate a real problem. Weak warnings often depend on context Brakeman cannot see. Teams normally gate builds on high confidence and review the rest.",
      },
    },
    {
      "@type": "Question",
      name: "Does Brakeman check gem dependencies for CVEs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not as its main purpose. Brakeman analyses your own application code and can flag a small number of known issues in specific Rails versions, but auditing the gems in your lockfile against published advisories is a separate job handled by dependency-scanning tools. Running only Brakeman leaves your third-party code unchecked.",
      },
    },
    {
      "@type": "Question",
      name: "How do you handle Brakeman false positives?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Brakeman has an interactive ignore workflow that writes a configuration file recording each accepted warning along with a note. Because entries are keyed by a fingerprint of the warning, a genuinely new occurrence still surfaces. This is far safer than lowering the confidence threshold, which hides whole classes of finding at once.",
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
            Brakeman: Static Security Analysis for Rails Apps
          </h1>
          <p className="text-sm muted">Published September 15, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Brakeman is the closest thing the Rails world has to a default security scanner. It
            reads your application source, understands Rails conventions well enough to know that{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              params
            </code>{" "}
            is attacker-controlled, and tells you where that data ends up somewhere dangerous. It is
            fast, it needs no running app, and it is narrower than most teams assume. Here is how it
            works and where its scope ends.
          </p>
        </header>

        <img
          src="/blog/brakeman-rails-security.jpg"
          alt="Brakeman performing static security analysis over Ruby on Rails source code"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Brakeman is</h2>
          <p className="text-sm muted">
            Brakeman is an open-source static application security testing tool written for Ruby on
            Rails. Unlike a generic linter, it is framework-aware: it knows the difference between a
            controller, a model and a view, it reads your routes, and it understands which Rails
            methods are dangerous when handed untrusted input. That specificity is what makes it
            more useful on a Rails codebase than a general-purpose pattern matcher.
          </p>
          <p className="text-sm muted">
            It also never executes anything. No server boots, no database connects, no HTTP request
            is sent. Brakeman parses the source into an abstract syntax tree and reasons over it,
            which means it runs in seconds to a couple of minutes on most applications and works
            fine on a codebase you cannot start locally. The Rails ecosystem has adopted it as
            close to standard equipment &mdash; recent Rails versions generate new applications with
            Brakeman already in the Gemfile and wired into the default CI workflow.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How Brakeman analyses a Rails app</h2>
          <p className="text-sm muted">
            The core idea is taint tracking. Brakeman identifies <em>sources</em> of untrusted data
            &mdash; request parameters, cookies, headers, in some cases model attributes &mdash;
            follows how those values move through assignments and method calls, and reports when
            one reaches a <em>sink</em>: a call where untrusted data causes a security problem.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 240"
              role="img"
              aria-label="Taint flow diagram showing untrusted request parameters flowing through application code into dangerous sinks such as SQL string interpolation, unescaped view output and system command execution"
              className="w-full"
              style={{ minWidth: 600 }}
            >
              <defs>
                <marker id="bm-arr" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              {["Source", "Propagation", "Sink", "Reported as"].map((h, i) => (
                <text
                  key={h}
                  x={[70, 250, 430, 618][i]}
                  y={20}
                  textAnchor="middle"
                  fontSize="10.5"
                  fill="currentColor"
                  fillOpacity={0.6}
                >
                  {h}
                </text>
              ))}
              {[
                { y: 44, src: "params[:id]", mid: "string interpolation", sink: "where(...)", out: "SQL Injection" },
                { y: 106, src: "params[:name]", mid: "passed to view", sink: "raw / html_safe", out: "Cross-Site Scripting" },
                { y: 168, src: "params[:file]", mid: "built into a string", sink: "system / backticks", out: "Command Injection" },
              ].map((r) => (
                <g key={r.out}>
                  {[
                    { x: 8, w: 124, label: r.src, strong: true },
                    { x: 176, w: 148, label: r.mid, strong: false },
                    { x: 366, w: 128, label: r.sink, strong: true },
                  ].map((b) => (
                    <g key={b.label}>
                      <rect
                        x={b.x}
                        y={r.y}
                        width={b.w}
                        height={38}
                        rx={7}
                        fill="currentColor"
                        fillOpacity={b.strong ? 0.12 : 0.04}
                        stroke="currentColor"
                        strokeOpacity={b.strong ? 0.45 : 0.22}
                      />
                      <text
                        x={b.x + b.w / 2}
                        y={r.y + 24}
                        textAnchor="middle"
                        fontSize="11"
                        fill="currentColor"
                        fillOpacity={0.88}
                      >
                        {b.label}
                      </text>
                    </g>
                  ))}
                  {[136, 328].map((x) => (
                    <line
                      key={x}
                      x1={x}
                      y1={r.y + 19}
                      x2={x + 32}
                      y2={r.y + 19}
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeOpacity={0.55}
                      markerEnd="url(#bm-arr)"
                    />
                  ))}
                  <line x1={498} y1={r.y + 19} x2={526} y2={r.y + 19} stroke="currentColor" strokeWidth={1.8} strokeOpacity={0.55} markerEnd="url(#bm-arr)" />
                  <text x={534} y={r.y + 24} fontSize="11.5" fontWeight="600" fill="currentColor" fillOpacity={0.9}>
                    {r.out}
                  </text>
                </g>
              ))}
              <text x={8} y={228} fontSize="10.5" fill="currentColor" fillOpacity={0.55}>
                Each warning is labelled High, Medium or Weak confidence depending on how completely Brakeman can trace the path.
              </text>
            </svg>
            <figcaption className="text-xs muted mt-3">
              Brakeman&apos;s taint model: untrusted sources traced through the application into
              dangerous sinks. Examples are illustrative.
            </figcaption>
          </div>
          <p className="text-sm muted">
            Because the analysis is static, Brakeman is reasoning about what the code{" "}
            <em>could</em> do rather than what it did. That is a genuine strength &mdash; it finds
            paths no test suite happened to exercise &mdash; and the direct cause of its false
            positives, since it cannot see a validation that happens in a helper it could not
            resolve. This is the classic tradeoff explored in{" "}
            <Link href="/blog/sast-vs-dast-explained" className="underline">
              SAST vs DAST
            </Link>
            .
          </p>
        </section>

        <img
          src="/blog/brakeman-rails-security-2.jpg"
          alt="Abstract syntax tree analysis of a Ruby on Rails codebase by Brakeman"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Brakeman checks for</h2>
          <p className="text-sm muted">
            Brakeman ships dozens of individual checks. The ones that matter most in practice fall
            into a few groups:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Injection.</strong> SQL injection through string-built queries, command
              injection through <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">system</code>{" "}
              and backticks, and code execution through{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">eval</code>,{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">send</code>{" "}
              and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">constantize</code>{" "}
              on user input.
            </li>
            <li>
              <strong>Cross-site scripting.</strong> Output that bypasses Rails&apos; automatic
              escaping, typically through{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">raw</code>,{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">html_safe</code>{" "}
              or unescaped attributes.
            </li>
            <li>
              <strong>Mass assignment.</strong> Attributes assignable from parameters without strong
              parameter filtering.
            </li>
            <li>
              <strong>Unsafe redirects and file access.</strong> Open redirects built from
              parameters, and file reads or renders whose path is user-controlled.
            </li>
            <li>
              <strong>Configuration.</strong> Missing CSRF protection, weak session settings,
              insecure defaults, and dangerous deserialisation.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Running Brakeman</h2>
          <p className="text-sm muted">
            Installation is a gem, and the default invocation takes no arguments beyond being in the
            application root.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`gem install brakeman

# scan the current Rails application
brakeman

# machine-readable output for a pipeline
brakeman -f json -o brakeman.json

# only high-confidence warnings
brakeman -w3

# run a subset of checks by name
brakeman -t CheckSQL,CheckCrossSiteScripting

# show only warnings that are new since a previous run
brakeman --compare brakeman-baseline.json -o brakeman-new.json

# interactively triage and write the ignore configuration
brakeman -I`}
          </pre>
          <p className="text-sm muted">
            Two of these deserve emphasis.{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              --compare
            </code>{" "}
            diffs against a stored baseline report and emits only what is new, which is how you
            introduce Brakeman to a large legacy codebase without asking anyone to fix four hundred
            historical warnings before the next deploy. And{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">-I</code>{" "}
            walks each warning interactively and records your decisions in an ignore configuration
            file, keyed by a fingerprint of the warning so that a new occurrence of the same pattern
            elsewhere still reports.
          </p>
          <p className="text-sm muted">
            Resist the temptation to fix a noisy report by raising the confidence threshold
            permanently. Ignoring specific reviewed warnings leaves an audit trail; raising the
            threshold silently discards whole categories.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Brakeman in CI</h2>
          <p className="text-sm muted">
            Brakeman is cheap enough to run on every pull request. The key flag is the one that
            turns warnings into a non-zero exit status, since by default a scan that finds problems
            still exits successfully.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`name: security
on: [push, pull_request]

jobs:
  brakeman:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with:
          bundler-cache: true

      - name: Brakeman
        run: |
          bundle exec brakeman \\
            --no-pager \\
            --exit-on-warn \\
            --format json \\
            --output brakeman.json

      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: brakeman-report
          path: brakeman.json`}
          </pre>
          <p className="text-sm muted">
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              --no-pager
            </code>{" "}
            keeps output sane in a non-interactive runner, and{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              if: always()
            </code>{" "}
            ensures you keep the report on a failing build, which is when you most want it. Pair
            this with a confidence threshold your team can actually sustain &mdash; a gate everyone
            routes around is worse than no gate.
          </p>
        </section>

        <img
          src="/blog/brakeman-rails-security-3.jpg"
          alt="Taint flow of untrusted input traced from source to dangerous sink in application code"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Brakeman does not cover</h2>
          <p className="text-sm muted">
            Brakeman is deliberately narrow, and knowing the edges is what stops it from becoming a
            false sense of coverage.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Your dependencies.</strong> This is the big one. Brakeman analyses code you
              wrote. The gems in your lockfile, and the C libraries those gems link against, are a
              separate problem handled by dependency and container scanning &mdash; see{" "}
              <Link href="/blog/what-is-software-composition-analysis" className="underline">
                software composition analysis
              </Link>
              . In most Rails applications the majority of shipped code is not yours.
            </li>
            <li>
              <strong>Non-Rails Ruby.</strong> Brakeman&apos;s value comes from Rails conventions.
              On a Sinatra service or a plain Ruby library it has far less to work with; a
              general-purpose rule engine like{" "}
              <Link href="/blog/semgrep" className="underline">
                Semgrep
              </Link>{" "}
              is the better fit there.
            </li>
            <li>
              <strong>Runtime and deployment.</strong> Environment variables, container
              configuration, exposed ports and the base image are all outside its view.
            </li>
            <li>
              <strong>Logic flaws.</strong> Authorisation gaps, insecure direct object references
              and broken business rules are not taint problems, and no static taint analyser will
              find them for you.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Brakeman and ScanRook look at opposite halves of the same deployment. Brakeman reads the
            code you wrote and finds injection paths in it. ScanRook reads the artifact you ship
            &mdash; the container image tarball, binary or source archive &mdash; enumerates the
            packages actually installed inside it, including the gems, the system libraries they
            bind to and everything the base image contributed, and matches all of it against OSV,
            NVD and Red Hat OVAL in parallel.
          </p>
          <p className="text-sm muted">
            That distinction matters for Rails specifically, because a Rails image is mostly not
            Rails: it is a Linux base, a Ruby runtime, native extensions, and a long dependency
            tree. Brakeman will not tell you the OpenSSL build in your image has a known CVE, and
            ScanRook will not tell you that a controller interpolates{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              params[:id]
            </code>{" "}
            into a query. Run both. If you are wiring up the artifact side, the{" "}
            <Link href="/blog/container-image-scanning-guide" className="underline">
              container image scanning guide
            </Link>{" "}
            and{" "}
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              scanning images in GitHub Actions
            </Link>{" "}
            slot straight into the same workflow above.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">How long does a Brakeman scan take?</h3>
              <p className="text-sm muted mt-1">
                Seconds on a small application, a couple of minutes on a large one. It is fast
                enough to run on every pull request without anyone noticing.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why does Brakeman flag code I know is safe?</h3>
              <p className="text-sm muted mt-1">
                Static analysis cannot always see the sanitisation, especially through helpers or
                metaprogramming. Review it, then record it in the ignore configuration with a note.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should Brakeman fail the build?</h3>
              <p className="text-sm muted mt-1">
                Yes, but scope the gate &mdash; high-confidence warnings, or only warnings new since
                a baseline. A gate that fires constantly gets disabled.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is Brakeman enough on its own?</h3>
              <p className="text-sm muted mt-1">
                No. It covers your first-party Rails code. Dependencies, base image and runtime
                configuration all need separate scanning.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan the other half of your Rails image</h3>
          <p className="text-sm muted leading-relaxed">
            Brakeman covers the code you wrote. Run ScanRook on the image you ship to see every gem,
            native extension and base-image package matched against OSV, NVD and Red Hat OVAL, each
            finding tagged with its source and confidence.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--dg-accent,#2563eb)] text-white px-4 py-2 text-sm font-medium"
            >
              Start scanning
            </Link>
            <Link href="/docs" className="btn-secondary">
              Read the docs
            </Link>
          </div>
        </section>

        <footer className="border-t border-black/10 dark:border-white/10 pt-4 text-xs muted grid gap-2">
          <p>
            <strong>Related reading:</strong>{" "}
            <Link href="/blog/sast-vs-dast-explained" className="underline">
              SAST vs DAST Explained
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/semgrep" className="underline">
              Semgrep
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              What Is Software Composition Analysis
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
