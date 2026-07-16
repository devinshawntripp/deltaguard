import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-30";

const title = `Semgrep Explained: Fast Static Analysis for Finding Bugs | ${APP_NAME}`;
const description =
  "Semgrep is an open-source static analysis tool that finds bugs and vulnerabilities with code-pattern rules. How it works, its limits, and where ScanRook fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "semgrep",
    "what is semgrep",
    "semgrep static analysis",
    "semgrep sast",
    "semgrep rules",
    "semgrep tutorial",
    "static application security testing",
    "semgrep vs sca",
    "open source sast tool",
    "code pattern matching",
    "semgrep ci",
  ],
  alternates: { canonical: "/blog/semgrep" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/semgrep",
    images: ["/blog/semgrep.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/semgrep.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Semgrep Explained: Fast Static Analysis for Finding Bugs",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/semgrep",
  image: "https://scanrook.io/blog/semgrep.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Semgrep?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Semgrep is an open-source static analysis tool that scans source code for bugs, security issues, and anti-patterns. Its name is short for semantic grep: instead of plain text matching, it parses code into an abstract syntax tree so a single rule can match a pattern regardless of variable names, formatting, or spacing. Rules are written in YAML and it supports more than thirty languages.",
      },
    },
    {
      "@type": "Question",
      name: "Is Semgrep a SAST tool?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Semgrep is primarily a static application security testing (SAST) tool that analyzes code without running it. It also ships adjacent products for dependency scanning (Semgrep Supply Chain) and secret detection (Semgrep Secrets), but the core open-source engine is a code-pattern scanner that finds issues like injection sinks, missing validation, and dangerous API usage.",
      },
    },
    {
      "@type": "Question",
      name: "Is Semgrep free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Semgrep command-line engine and the community rule registry are free and open source under the LGPL 2.1 license. Semgrep, Inc. also sells a hosted AppSec platform that adds cross-file dataflow analysis, findings management, and team features. Many teams run the free CLI in CI and never touch the paid tier.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between Semgrep and a vulnerability scanner?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Semgrep analyzes your own source code for bug patterns you wrote. A vulnerability scanner like ScanRook inventories the components in a built artifact and matches them against databases of known CVEs. Semgrep asks whether your code is written safely; a CVE scanner asks whether the libraries and OS packages you shipped have publicly disclosed flaws. They cover different layers and work well together.",
      },
    },
    {
      "@type": "Question",
      name: "Does Semgrep produce false positives?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It can, like any static analysis tool. Broad rules that flag a risky function without confirming the data reaching it is attacker-controlled will over-report. Semgrep mitigates this with taint-mode rules that track data from source to sink, and with per-finding suppression comments. Tuning the ruleset to your codebase is the main way to keep the signal-to-noise ratio high.",
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
            Semgrep Explained: Fast Static Analysis for Finding Bugs
          </h1>
          <p className="text-sm muted">Published September 30, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            Semgrep is one of the most widely adopted open-source static analysis tools, and for
            good reason: it is fast, the rules are readable, and it runs anywhere from a laptop to a
            CI pipeline. This guide explains what Semgrep does, how its pattern engine works, what it
            catches and misses, and where a static code scanner ends and artifact scanning begins.
          </p>
        </header>

        <img
          src="/blog/semgrep.jpg"
          alt="Semgrep static analysis explained"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Semgrep is</h2>
          <p className="text-sm muted">
            Semgrep &mdash; short for &ldquo;semantic grep&rdquo; &mdash; is an open-source static
            analysis engine maintained by Semgrep, Inc. (formerly r2c). It reads source code without
            executing it and reports places that match a rule: a SQL query built by string
            concatenation, a disabled TLS check, a hardcoded credential pattern, an unsafe
            deserialization call. It supports more than thirty languages, including Python,
            JavaScript and TypeScript, Go, Java, Ruby, C#, and PHP.
          </p>
          <p className="text-sm muted">
            The reason it caught on is the rule format. A Semgrep rule is a small YAML file that
            looks almost like the code it is trying to find. Because Semgrep parses code into an
            abstract syntax tree rather than matching raw text, one rule matches the pattern no
            matter how the variables are named or how the whitespace is arranged. That makes rules
            approachable to write and hard to trick with cosmetic changes &mdash; a meaningful step
            up from grepping for a function name with a regular expression.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where it runs in the pipeline</h2>
          <p className="text-sm muted">
            Semgrep operates on source code, early in the software lifecycle, before anything is
            built or shipped. That is the opposite end of the pipeline from a vulnerability scanner,
            which examines the compiled binary or container image after the build. Seeing the two
            side by side makes the division of labor obvious:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 720 180"
              className="w-full"
              style={{ minWidth: 620 }}
              role="img"
              aria-label="Semgrep analyzes source code; ScanRook scans the built artifact"
            >
              <g fontSize="12" textAnchor="middle" fill="currentColor">
                {/* pipeline stage boxes */}
                <rect x="20" y="24" width="140" height="44" rx="8" fill="none" stroke="currentColor" strokeOpacity="0.35" />
                <text x="90" y="51">Source code</text>
                <rect x="200" y="24" width="140" height="44" rx="8" fill="none" stroke="currentColor" strokeOpacity="0.35" />
                <text x="270" y="51">Build</text>
                <rect x="380" y="24" width="140" height="44" rx="8" fill="none" stroke="currentColor" strokeOpacity="0.35" />
                <text x="450" y="51">Container image</text>
                <rect x="560" y="24" width="140" height="44" rx="8" fill="none" stroke="currentColor" strokeOpacity="0.35" />
                <text x="630" y="51">Runtime</text>
                {/* arrows */}
                <g stroke="currentColor" strokeOpacity="0.35">
                  <line x1="160" y1="46" x2="196" y2="46" />
                  <line x1="340" y1="46" x2="376" y2="46" />
                  <line x1="520" y1="46" x2="556" y2="46" />
                </g>
                {/* connectors down to tool bars */}
                <g stroke="var(--dg-accent,#2563eb)" strokeOpacity="0.6">
                  <line x1="90" y1="68" x2="90" y2="112" />
                  <line x1="450" y1="68" x2="450" y2="112" />
                </g>
                {/* tool bars */}
                <rect x="20" y="112" width="140" height="40" rx="8" fill="var(--dg-accent,#2563eb)" fillOpacity="0.12" stroke="var(--dg-accent,#2563eb)" strokeOpacity="0.55" />
                <text x="90" y="130" fontWeight="600">Semgrep</text>
                <text x="90" y="145" fontSize="10">SAST: code patterns</text>
                <rect x="380" y="112" width="140" height="40" rx="8" fill="var(--dg-accent,#2563eb)" fillOpacity="0.12" stroke="var(--dg-accent,#2563eb)" strokeOpacity="0.55" />
                <text x="450" y="130" fontWeight="600">ScanRook</text>
                <text x="450" y="145" fontSize="10">Known-CVE scan</text>
              </g>
            </svg>
          </div>
          <p className="text-sm muted">
            Semgrep tells you whether the code you wrote handles input safely. Artifact scanning
            tells you whether the dependencies and OS packages you shipped carry known,
            publicly-disclosed flaws. Both matter, and neither substitutes for the other &mdash; a
            distinction we draw out in{" "}
            <Link href="/blog/sast-vs-dast-explained" className="underline">
              SAST vs DAST
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How a rule works</h2>
          <p className="text-sm muted">
            The clearest way to understand Semgrep is to read a rule. This one flags a Python call
            that passes user input straight into an operating-system command &mdash; a classic
            command-injection sink:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`rules:
  - id: dangerous-os-system
    languages: [python]
    severity: ERROR
    message: >
      Passing a formatted string to os.system() can allow command
      injection. Use subprocess with an argument list instead.
    patterns:
      - pattern: os.system(...)
      - pattern-not: os.system("...")`}</pre>
          <p className="text-sm muted">
            The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">pattern</code>{" "}
            matches any call to <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">os.system</code>,
            and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">pattern-not</code> excludes
            the safe case of a constant string literal. The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">...</code>{" "}
            is Semgrep&apos;s ellipsis operator, meaning &ldquo;any arguments.&rdquo; You run it with a
            single command:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Scan a repo with a specific rule file
semgrep --config ./rules/ .

# Or pull a curated ruleset from the registry
semgrep --config "p/security-audit" .`}</pre>
          <p className="text-sm muted">
            For flows where the danger depends on <em>where the data came from</em>, Semgrep supports
            taint mode: you declare sources (say, an HTTP request parameter) and sinks (the
            command call), and a finding fires only when tainted data can reach the sink. That is
            what separates a smart rule from a naive string search, and it is the main lever for
            cutting false positives.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The rule registry and custom rules</h2>
          <p className="text-sm muted">
            Most teams start with the Semgrep Registry, a public library of thousands of community
            and vendor-maintained rules grouped into rulesets such as{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">p/owasp-top-ten</code>{" "}
            and language-specific security packs. You get useful coverage on day one without writing
            anything.
          </p>
          <p className="text-sm muted">
            The real payoff comes later, when you write rules that encode your own organization&apos;s
            standards: &ldquo;never call this deprecated internal crypto helper,&rdquo; &ldquo;every
            new API handler must go through the auth decorator,&rdquo; &ldquo;no raw database cursors
            outside the data layer.&rdquo; These are things no off-the-shelf scanner knows about, and
            expressing them as Semgrep rules turns tribal knowledge into an automated check that runs
            on every pull request. This is a practical form of{" "}
            <Link href="/blog/what-is-a-vulnerability" className="underline">
              catching weaknesses
            </Link>{" "}
            before they become findings.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Running it in CI</h2>
          <p className="text-sm muted">
            Semgrep is built to run on every change, and its speed is what makes that practical: a
            single binary with no build step and no need to compile the code it analyzes. In
            continuous integration you point it at the repository, choose a ruleset, and decide which
            severities should fail the pipeline. A common pattern is to scan only the files changed
            in a pull request for fast feedback, then run the full ruleset on the main branch on a
            schedule.
          </p>
          <p className="text-sm muted">
            The behavior that keeps developers on side is diff-aware scanning: reporting only
            findings introduced by the current change rather than flagging the entire backlog of
            pre-existing issues on day one. That distinction &mdash; gate on new problems, track old
            ones separately &mdash; is the difference between a check the team trusts and one they
            learn to click past. Pair it with per-finding suppression comments so that an accepted
            risk is documented in the code rather than argued about on every run.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Semgrep does not do</h2>
          <p className="text-sm muted">
            Being clear about the limits keeps expectations honest:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>It does not know your dependencies&apos; CVEs.</strong> The core SAST engine
              analyzes the code in your repository, not the known vulnerabilities in the third-party
              libraries you pull in. Semgrep&apos;s separate Supply Chain product covers that ground;
              the base scanner does not.
            </li>
            <li>
              <strong>It does not see the runtime.</strong> Static analysis reasons about code as
              written, so it cannot observe behavior that only appears when the application runs
              with real data &mdash; that is the domain of dynamic testing.
            </li>
            <li>
              <strong>Deep cross-file analysis is limited in the open-source engine.</strong>{" "}
              Whole-program dataflow that follows tainted values across many files and function
              boundaries is where the commercial Pro engine adds the most; the free engine is
              strongest within a file or function.
            </li>
            <li>
              <strong>It does not scan what you ship.</strong> Semgrep never looks at the built
              container image, the OS packages inside it, or the compiled binary. Nothing that gets
              added during the build is in scope.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook and Semgrep sit at opposite ends of the same pipeline, and that is exactly why
            they pair well. Semgrep hardens the code you write. ScanRook scans the artifact you
            build &mdash; it reads the actual package databases inside a container image or binary,
            inventories every OS and language dependency, and matches them against OSV, NVD, and Red
            Hat OVAL to surface known CVEs. A command-injection bug in your handler is a Semgrep
            finding; an outdated OpenSSL in your base image is a ScanRook finding. If you are mapping
            your toolchain,{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              software composition analysis
            </Link>{" "}
            and{" "}
            <Link href="/blog/container-image-scanning-guide" className="underline">
              container image scanning
            </Link>{" "}
            cover the layers Semgrep intentionally leaves alone. Run static analysis on the source,
            scan the built image, and gate CI on both.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is Semgrep?</h3>
              <p className="text-sm muted mt-1">
                An open-source static analysis tool that scans source code for bugs and security
                issues by matching code patterns against an abstract syntax tree, with rules written
                in YAML across more than thirty languages.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is Semgrep free?</h3>
              <p className="text-sm muted mt-1">
                The CLI engine and community rule registry are free and open source under LGPL 2.1.
                Semgrep, Inc. sells a hosted platform with deeper cross-file analysis and team
                features on top.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is Semgrep a replacement for a CVE scanner?</h3>
              <p className="text-sm muted mt-1">
                No. Semgrep checks your own code for unsafe patterns; a CVE scanner checks the
                components you ship for known disclosed flaws. They cover different layers and are
                best run together.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does Semgrep have false positives?</h3>
              <p className="text-sm muted mt-1">
                Like all static analysis it can, especially with broad rules. Taint-mode rules and
                per-finding suppressions, plus tuning the ruleset to your codebase, keep the noise
                down.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan the artifact Semgrep never sees</h3>
          <p className="text-sm muted leading-relaxed">
            Static analysis hardens your source. ScanRook scans the built image and binary for known
            CVEs across OSV, NVD, and vendor advisories &mdash; every finding tagged with its source
            and a confidence tier. Run both and cover the whole pipeline.
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
            <Link href="/blog/sast-vs-dast-explained" className="underline">
              SAST vs DAST
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              What Is SCA?
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/gitleaks-secret-scanning" className="underline">
              Gitleaks Secret Scanning
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
