import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-24";

const title = `SAST vs DAST: How Application Security Testing Differs | ${APP_NAME}`;
const description =
  "SAST vs DAST explained: how static and dynamic application security testing differ, what each catches and misses, and where SCA and IAST fit alongside them.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "sast vs dast",
    "sast vs dast explained",
    "static application security testing",
    "dynamic application security testing",
    "sast dast iast",
    "sast vs dast vs sca",
    "application security testing",
    "white box vs black box testing",
    "appsec testing types",
    "shift left security",
  ],
  alternates: { canonical: "/blog/sast-vs-dast-explained" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/sast-vs-dast-explained",
    images: ["/blog/sast-vs-dast-explained.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/sast-vs-dast-explained.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "SAST vs DAST: How Application Security Testing Differs",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/sast-vs-dast-explained",
  image: "https://scanrook.io/blog/sast-vs-dast-explained.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the difference between SAST and DAST?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SAST (static application security testing) analyzes source code, bytecode, or binaries without running the program, so it can find flaws early and point to exact lines. DAST (dynamic application security testing) tests a running application from the outside, sending requests and observing responses, so it finds issues that only appear at runtime. SAST is white-box; DAST is black-box.",
      },
    },
    {
      "@type": "Question",
      name: "Is SAST or DAST better?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Neither is better; they find different classes of problem. SAST catches insecure code patterns, hardcoded secrets, and injection sinks early in development but produces false positives and misses runtime and configuration issues. DAST catches exploitable runtime flaws, authentication problems, and server misconfiguration but runs late and cannot point to a line of code. Mature programs run both.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between SAST and SCA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SAST analyzes the code your team wrote to find novel flaws. SCA (software composition analysis) inventories the third-party and open-source components you depend on and flags known CVEs and license issues in them. Both are static, but SAST looks at first-party code and SCA looks at everything you pulled in from elsewhere.",
      },
    },
    {
      "@type": "Question",
      name: "What is IAST and how does it relate to SAST and DAST?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "IAST (interactive application security testing) instruments a running application from the inside, combining code-level visibility with runtime behavior. It sees the executing code path a DAST request triggers, which reduces false positives and pinpoints the vulnerable line. It needs the app running with an agent attached, so it typically runs in test or QA environments.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need SAST, DAST, and SCA all together?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For a serious application, yes, because they cover non-overlapping ground. SAST and SCA run early and cheaply in CI, DAST validates the deployed application, and SCA specifically covers the third-party components that make up most of a modern codebase. Skipping any one leaves a category of vulnerability unexamined.",
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
            SAST vs DAST: How Application Security Testing Differs
          </h1>
          <p className="text-sm muted">Published July 24, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            SAST and DAST are the two oldest pillars of application security testing, and teams
            often treat them as competing choices. They are not. They look at your software from
            opposite directions and catch different problems. Here is what each one actually does,
            where it fails, and how software composition analysis fills the gap neither covers.
          </p>
        </header>

        <img
          src="/blog/sast-vs-dast-explained.jpg"
          alt="SAST vs DAST application security testing compared"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What SAST does</h2>
          <p className="text-sm muted">
            <strong>Static application security testing</strong> analyzes your application without
            running it. It reads source code, and sometimes compiled bytecode or binaries, and looks
            for patterns that indicate a vulnerability: untrusted input flowing into a SQL query,
            a hardcoded secret, use of a broken cryptographic primitive, an unsafe deserialization
            call. Because it works from the inside with full visibility into the code, it is a{" "}
            <strong>white-box</strong> technique.
          </p>
          <p className="text-sm muted">
            SAST&apos;s biggest advantage is timing. It can run in a developer&apos;s editor, on
            every commit, and in CI before anything is deployed &mdash; the essence of
            &ldquo;shift left.&rdquo; When it flags an issue, it points at the exact file and line,
            which makes fixes cheap. Its weaknesses are the flip side of the same coin: it reasons
            about code that <em>might</em> execute, so it produces false positives, and it cannot
            see anything that only exists at runtime &mdash; a misconfigured server, a broken
            authentication flow, or a flaw that depends on how the app is actually deployed. It is
            also language-specific; a SAST engine has to understand each language it analyzes.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What DAST does</h2>
          <p className="text-sm muted">
            <strong>Dynamic application security testing</strong> takes the opposite approach: it
            tests a running application from the outside, with no knowledge of the source code. It
            sends crafted requests &mdash; malformed inputs, injection payloads, authentication
            probes &mdash; and watches how the application responds. Because it sees only the
            external behavior, like an attacker would, it is a <strong>black-box</strong> technique.
          </p>
          <p className="text-sm muted">
            DAST finds the things SAST cannot: vulnerabilities that are genuinely reachable and
            exploitable in the deployed application, server and platform misconfiguration, broken
            session handling, and issues that emerge from how components interact at runtime. A
            finding from DAST is, almost by definition, demonstrably exploitable, which cuts down on
            false positives. The tradeoffs are that it needs a running, deployed application, so it
            runs later in the lifecycle; it is language-agnostic but shallow on code coverage,
            reaching only the paths its requests happen to exercise; and when it finds something, it
            cannot tell you which line of code is at fault &mdash; only that a given endpoint
            misbehaves.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Head to head</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Dimension</th>
                  <th className="text-left py-2 pr-4 font-semibold">SAST</th>
                  <th className="text-left py-2 font-semibold">DAST</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Visibility</td>
                  <td className="py-2 pr-4 align-top">White-box (sees the code)</td>
                  <td className="py-2 align-top">Black-box (sees behavior)</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Needs the app running?</td>
                  <td className="py-2 pr-4 align-top">No</td>
                  <td className="py-2 align-top">Yes</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">When it runs</td>
                  <td className="py-2 pr-4 align-top">Commit / build, early</td>
                  <td className="py-2 align-top">Test / staging, later</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Points to a line of code?</td>
                  <td className="py-2 pr-4 align-top">Yes</td>
                  <td className="py-2 align-top">No</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Language dependence</td>
                  <td className="py-2 pr-4 align-top">Per-language engine</td>
                  <td className="py-2 align-top">Language-agnostic</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Typical false positives</td>
                  <td className="py-2 pr-4 align-top">Higher</td>
                  <td className="py-2 align-top">Lower</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">Blind to</td>
                  <td className="py-2 pr-4 align-top">Runtime / config / auth flaws</td>
                  <td className="py-2 align-top">Unreached code paths</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            Read the table as a division of labor, not a scoreboard. Every row where one tool is
            weak is a row where the other is strong, which is exactly why running both covers more
            ground than doubling down on either.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            The gap both leave: third-party code
          </h2>
          <p className="text-sm muted">
            Here is the blind spot that catches teams out. SAST analyzes the code your team wrote.
            DAST tests behavior your team exposed. But a modern application is mostly code your team
            did <em>not</em> write &mdash; open-source libraries and OS packages, often the large
            majority of what ships. A known-vulnerable version of a logging library will usually
            sail past SAST (it is not your code to analyze) and past DAST (the vulnerable path may
            never be exercised by its probes).
          </p>
          <p className="text-sm muted">
            That gap is what <strong>software composition analysis (SCA)</strong> exists to close.
            SCA inventories every third-party component in your codebase or built artifact and
            matches it against advisory databases to find known CVEs and license obligations. It is
            static, like SAST, but it points at your <em>dependencies</em> rather than your code.
            Log4Shell was the industry&apos;s expensive lesson in why this matters &mdash; a
            critical flaw in a ubiquitous dependency that no amount of first-party code testing would
            have surfaced. Our{" "}
            <Link href="/blog/log4shell-cve-2021-44228" className="underline">
              Log4Shell deep dive
            </Link>{" "}
            walks through how deeply that library hides inside other software.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where IAST and RASP fit</h2>
          <p className="text-sm muted">
            Two more acronyms round out the picture. <strong>IAST</strong> (interactive application
            security testing) instruments a running application from the inside with an agent,
            combining SAST&apos;s code-level visibility with DAST&apos;s runtime accuracy. When a
            request triggers a suspect code path, IAST sees the actual execution and can name the
            vulnerable line while confirming it is genuinely reachable &mdash; fewer false positives
            than SAST, more precision than DAST. It needs the app running with the agent attached,
            so it lives in test and QA.
          </p>
          <p className="text-sm muted">
            <strong>RASP</strong> (runtime application self-protection) is not testing at all; it is
            a defensive control that sits inside the running app in production and blocks
            exploitation attempts as they happen. It complements the testing tools rather than
            replacing them &mdash; it stops attacks against flaws you have not fixed yet, but it does
            not tell you where those flaws are.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits &mdash; honestly</h2>
          <p className="text-sm muted">
            ScanRook is not a SAST or a DAST tool, and it would be dishonest to imply otherwise. It
            is an <strong>SCA scanner</strong> focused on built artifacts &mdash; container images,
            binaries, ISOs, and source archives. It reads the{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              actual installed state
            </Link>{" "}
            of what you ship and matches every component against OSV, NVD, and vendor advisory data
            to find known vulnerabilities in your dependencies and OS packages. That is the
            third-party layer SAST and DAST both miss.
          </p>
          <p className="text-sm muted">
            The practical takeaway: SCA is a complement to application security testing, not a
            substitute. Run SAST for your own code, DAST for your deployed endpoints, and SCA for
            everything you inherited &mdash; and lean on{" "}
            <Link href="/blog/cve-database-comparison" className="underline">
              broad advisory coverage
            </Link>{" "}
            so the SCA layer does not miss what a single database would.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which should you run?</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Start with SAST and SCA in CI.</strong> They are cheap, fast, and run on every
              build with no deployed environment required. SCA in particular covers the largest
              share of real exposure for the least effort.
            </li>
            <li>
              <strong>Add DAST against staging.</strong> It validates that the deployed application
              &mdash; configuration, authentication, and all &mdash; resists the attacks SAST can
              only theorize about.
            </li>
            <li>
              <strong>Consider IAST if you have rich test coverage.</strong> It turns your existing
              functional tests into security tests with high precision, but only for paths your
              tests exercise.
            </li>
            <li>
              <strong>Do not treat any of them as complete.</strong> Container scanning best
              practices, covered in our{" "}
              <Link href="/blog/container-scanning-best-practices" className="underline">
                practices guide
              </Link>
              , sit alongside application testing rather than replacing it.
            </li>
          </ul>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is SAST white-box or black-box?</h3>
              <p className="text-sm muted mt-1">
                White-box. SAST has full access to the source or compiled code and reasons about it
                directly, without running the application.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can DAST replace SAST?</h3>
              <p className="text-sm muted mt-1">
                No. DAST only exercises the code paths its requests reach and cannot point to a line
                of code, so it misses issues SAST catches early. They are complementary.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is SCA a type of SAST?</h3>
              <p className="text-sm muted mt-1">
                They are both static, but distinct. SAST analyzes code your team wrote; SCA
                inventories third-party components and matches them to known CVEs and licenses.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Where does container scanning fit?</h3>
              <p className="text-sm muted mt-1">
                Container image scanning is a form of SCA applied to a built artifact &mdash; it
                finds known vulnerabilities in the OS packages and libraries baked into the image.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Cover the layer SAST and DAST miss</h3>
          <p className="text-sm muted leading-relaxed">
            Application security testing looks at your code; most of your risk is in the code you did
            not write. ScanRook scans your container images, binaries, and source archives for known
            vulnerabilities in third-party components, matched against OSV, NVD, and vendor advisory
            data with a confidence tier on every finding.
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
            <Link href="/blog/what-is-a-cve" className="underline">
              What Is a CVE?
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              Installed-State vs Advisory Matching
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-scanning-best-practices" className="underline">
              Container Scanning Best Practices
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
