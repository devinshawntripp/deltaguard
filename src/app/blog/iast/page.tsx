import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-28";

const title = `IAST Explained: Interactive Application Security Testing | ${APP_NAME}`;
const description =
  "IAST (interactive application security testing) instruments a running app to find real vulnerabilities during testing. How it compares to SAST and DAST.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "iast",
    "what is iast",
    "interactive application security testing",
    "iast vs sast vs dast",
    "iast security testing",
    "runtime instrumentation security",
    "taint tracking",
    "application security testing",
    "iast tools",
    "gray box testing",
  ],
  alternates: { canonical: "/blog/iast" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/iast",
    images: ["/blog/iast.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/iast.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "IAST Explained: Interactive Application Security Testing",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/iast",
  image: "https://scanrook.io/blog/iast.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is IAST?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "IAST, or interactive application security testing, instruments a running application with an in-process agent that watches code execution and data flow while the app is exercised by tests or QA. When untrusted input reaches a dangerous operation without being sanitized, the agent reports the vulnerability with the exact line of code and the request that triggered it. It combines the code visibility of SAST with the runtime confirmation of DAST.",
      },
    },
    {
      "@type": "Question",
      name: "How is IAST different from SAST and DAST?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SAST analyzes source or bytecode statically without running the app, seeing all code paths but producing many false positives. DAST attacks the running app from the outside as a black box, with low false positives but no code visibility. IAST runs inside the app during testing, so it sees both the code and the live data flow, giving confirmed findings with precise code locations but only for the paths your tests exercise.",
      },
    },
    {
      "@type": "Question",
      name: "Does IAST have low false positives?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Generally yes. Because IAST observes an actual tainted input travelling through real code into a dangerous sink during execution, a finding usually reflects a genuinely reachable data flow rather than a theoretical one. That runtime confirmation is IAST's main advantage over static analysis, though coverage is limited to code paths your test suite actually drives.",
      },
    },
    {
      "@type": "Question",
      name: "What are the limitations of IAST?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "IAST only finds vulnerabilities in code paths that are exercised during testing, so its coverage is bounded by your test quality. It requires a language-specific agent, with the strongest support for Java, .NET, Node.js, and Python. It adds runtime overhead, and it focuses on flaws in your own code rather than cataloguing known CVEs in third-party dependencies, which is the job of software composition analysis.",
      },
    },
    {
      "@type": "Question",
      name: "Does IAST replace SCA or dependency scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. IAST finds first-party code flaws such as injection and path traversal by watching data flow at runtime. It does not inventory your open-source components or match them to known CVEs, which is what software composition analysis and container scanning do. A complete program uses IAST for custom code and SCA for the dependencies that make up most of a modern application.",
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
          <div className="text-xs uppercase tracking-wide muted">Security Concepts</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            IAST Explained: Interactive Application Security Testing
          </h1>
          <p className="text-sm muted">Published October 28, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            Static analysis sees your code but not how it runs. Dynamic analysis sees it run but not
            the code inside. IAST &mdash; interactive application security testing &mdash; sits in
            between: it puts an agent <em>inside</em> the running application and watches real data
            flow through real code. This guide explains what IAST is, how it works, how it compares
            to SAST and DAST, and the boundary where dependency and container scanning take over.
          </p>
        </header>

        <img
          src="/blog/iast.jpg"
          alt="Interactive application security testing instrumenting a running app"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What IAST is</h2>
          <p className="text-sm muted">
            IAST works through instrumentation. An agent &mdash; a JVM agent, a .NET profiler, a
            Node.js module &mdash; loads into the application process and hooks the runtime. As the
            app is exercised, whether by an automated test suite, a DAST scan, or a human clicking
            through QA, the agent observes what actually happens: which inputs arrive, how they move
            through the code, and where they end up. When untrusted data reaches a sensitive operation
            without proper sanitization, IAST flags it and hands you the exact line of code plus the
            request that triggered it.
          </p>
          <p className="text-sm muted">
            That vantage point &mdash; inside the app, at runtime &mdash; is why IAST is often called
            a &ldquo;gray-box&rdquo; technique. It is neither the pure outside view of a black-box
            scanner nor the code-only view of a static tool. It gets both at once.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How it works: taint tracking</h2>
          <p className="text-sm muted">
            The engine behind most IAST is <strong>taint tracking</strong>. Data that enters from an
            untrusted <em>source</em> &mdash; an HTTP parameter, a header, a form field &mdash; is
            marked as tainted. The agent follows that tainted data as it is copied, concatenated, and
            transformed through the application. If it reaches a dangerous <em>sink</em> &mdash; a SQL
            query, a shell command, a file path, an HTML response &mdash; still tainted and
            unsanitized, that is a confirmed vulnerability: SQL injection, command injection, path
            traversal, or cross-site scripting, respectively.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 720 150" width="100%" role="img" aria-label="IAST taint tracking: untrusted input from a source flows through instrumented code to a dangerous sink, where the agent flags it if unsanitized">
              <rect x="10" y="50" width="150" height="50" rx="8" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
              <text x="85" y="72" fontSize="12.5" fill="currentColor" textAnchor="middle" fontWeight="600">Source</text>
              <text x="85" y="89" fontSize="10.5" fill="currentColor" textAnchor="middle" fillOpacity="0.75">HTTP input (tainted)</text>

              <rect x="255" y="34" width="210" height="82" rx="8" fill="var(--dg-accent,#2563eb)" fillOpacity="0.1" stroke="var(--dg-accent,#2563eb)" strokeOpacity="0.55" strokeWidth="1.5" />
              <text x="360" y="60" fontSize="12.5" fill="currentColor" textAnchor="middle" fontWeight="600">Instrumented app</text>
              <text x="360" y="78" fontSize="10.5" fill="currentColor" textAnchor="middle" fillOpacity="0.8">agent follows tainted</text>
              <text x="360" y="93" fontSize="10.5" fill="currentColor" textAnchor="middle" fillOpacity="0.8">data through the code</text>

              <rect x="560" y="50" width="150" height="50" rx="8" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
              <text x="635" y="72" fontSize="12.5" fill="currentColor" textAnchor="middle" fontWeight="600">Sink</text>
              <text x="635" y="89" fontSize="10.5" fill="currentColor" textAnchor="middle" fillOpacity="0.75">SQL / exec / file</text>

              <line x1="160" y1="75" x2="255" y2="75" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.5" markerEnd="url(#ia)" />
              <line x1="465" y1="75" x2="560" y2="75" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.5" markerEnd="url(#ia)" />
              <text x="207" y="40" fontSize="10" fill="currentColor" textAnchor="middle" fillOpacity="0.7">tainted</text>
              <text x="512" y="40" fontSize="10" fill="var(--dg-accent,#2563eb)" textAnchor="middle" fontWeight="600">flagged if unsanitized</text>
              <defs>
                <marker id="ia" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" fillOpacity="0.6" />
                </marker>
              </defs>
            </svg>
          </div>
          <p className="text-xs muted">
            Because the agent sees a real tainted value reach a real sink, the finding reflects an
            actual reachable flow &mdash; not a guess. That is the root of IAST&apos;s low
            false-positive rate.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">IAST vs SAST vs DAST</h2>
          <p className="text-sm muted">
            The three approaches are complementary, and the fastest way to understand IAST is to see
            what it borrows from the other two. Our deeper piece on{" "}
            <Link href="/blog/sast-vs-dast-explained" className="underline">
              SAST vs DAST
            </Link>{" "}
            covers the first two in detail; here is the short version:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>SAST</strong> (static) reads source or bytecode without running it. It sees
              every code path but cannot tell which are truly reachable, so it tends to over-report.
            </li>
            <li>
              <strong>DAST</strong> (dynamic) attacks the running app from the outside as a black box.
              It confirms real exploitability but has no view of the code and limited coverage.
            </li>
            <li>
              <strong>IAST</strong> (interactive) runs inside the app during testing. It sees the code
              and the live data flow together, yielding confirmed findings with precise locations
              &mdash; but only for paths your tests exercise.
            </li>
          </ul>
          <p className="text-sm muted">
            IAST&apos;s close cousin is RASP (runtime application self-protection), which uses the
            same instrumentation to <em>block</em> attacks in production rather than surface findings
            during testing. IAST is a testing-time tool; RASP is a runtime defense.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Strengths and limitations</h2>
          <p className="text-sm muted">
            IAST&apos;s strengths are precision and developer experience: high-confidence findings,
            exact code locations, and results that surface inside your existing test pipeline without
            a separate scan stage. Its limitations are equally real and worth stating plainly.
            Coverage is bounded by your tests &mdash; IAST only sees vulnerabilities in code paths
            your suite actually drives, so a thin test suite yields a thin result. It needs a
            language-specific agent, with the most mature support for Java, .NET, Node.js, and Python,
            and thinner coverage elsewhere. The agent adds runtime overhead. And, most importantly for
            scoping, IAST focuses on flaws in <em>your own code</em>.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where IAST fits in the pipeline</h2>
          <p className="text-sm muted">
            IAST is a testing-phase tool, and it shines when you already have a functional test suite
            or a QA stage that exercises the application meaningfully. In CI, the common pattern is to
            deploy the app to a test environment with the agent attached, run the integration or
            end-to-end tests, and collect the findings the agent produced along the way. Because the
            results ride on tests you were going to run anyway, IAST adds little friction &mdash; there
            is no separate scan window to schedule, and findings arrive with the request and stack
            trace that produced them, which shortens the path from alert to fix.
          </p>
          <p className="text-sm muted">
            That dependency on test coverage cuts both ways. A team with rich automated tests gets
            broad, trustworthy IAST results almost for free; a team with sparse tests gets a
            correspondingly sparse view and may wrongly conclude the app is clean. This is the single
            most important thing to internalize about IAST: it reports on what you exercise, so
            improving IAST coverage often starts with improving test coverage.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where IAST stops and scanning begins</h2>
          <p className="text-sm muted">
            Modern applications are mostly not your code. The majority of a typical service is
            third-party open-source dependencies, and IAST is not designed to inventory them or match
            them against known CVEs. That job belongs to{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              software composition analysis
            </Link>{" "}
            and container scanning. IAST will catch a SQL injection you wrote; it will not tell you
            that a vulnerable version of a logging library is sitting in your dependency tree, or that
            the base image ships an outdated OpenSSL. Those are known-vulnerability problems, and they
            are exactly the kind of{" "}
            <Link href="/blog/what-is-a-vulnerability" className="underline">
              weakness
            </Link>{" "}
            a dependency and image scanner is built to find.
          </p>
          <p className="text-sm muted">
            This is where ScanRook fits. It is not an IAST tool &mdash; it does not instrument your
            running app or track taint. It scans the artifact: the container image, source tarball,
            or binary, matching every package against OSV, NVD, and Red Hat OVAL to produce ranked
            findings and a full SBOM. A well-rounded application security program runs IAST against
            first-party code behavior and a scanner like ScanRook against the dependencies and images
            that make up the rest of the stack, feeding both into a single{" "}
            <Link href="/blog/vulnerability-management-guide" className="underline">
              vulnerability management
            </Link>{" "}
            workflow. Neither replaces the other.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is IAST?</h3>
              <p className="text-sm muted mt-1">
                Interactive application security testing instruments a running app with an in-process
                agent that watches data flow during testing, reporting confirmed vulnerabilities with
                exact code locations.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How is IAST different from SAST and DAST?</h3>
              <p className="text-sm muted mt-1">
                SAST reads code statically; DAST attacks the running app from outside. IAST runs
                inside the app, so it sees both the code and the live data flow, with confirmed
                findings for the paths your tests exercise.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What are IAST's limitations?</h3>
              <p className="text-sm muted mt-1">
                Coverage is bounded by your tests, it needs a language-specific agent, it adds
                overhead, and it targets your own code rather than known CVEs in dependencies.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does IAST replace SCA or container scanning?</h3>
              <p className="text-sm muted mt-1">
                No. IAST finds first-party code flaws; SCA and container scanning inventory
                dependencies and match them to known CVEs. A complete program uses both.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Cover the dependencies IAST does not</h3>
          <p className="text-sm muted leading-relaxed">
            IAST watches your own code at runtime. ScanRook covers the other layer &mdash; the
            open-source packages and base images that make up most of your app &mdash; matching every
            component against OSV, NVD, and vendor advisory data, with a full SBOM.
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
              SAST vs DAST Explained
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              What Is Software Composition Analysis?
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-a-vulnerability" className="underline">
              What Is a Vulnerability?
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
