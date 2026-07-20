import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-10";

const title = `Bandit for Python: Practical SAST Without the Noise | ${APP_NAME}`;
const description =
  "Bandit is Python's AST-based security linter. Its test IDs, severity and confidence flags, pyproject config, CI wiring, and how to keep false positives in check.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "bandit python",
    "bandit security linter",
    "python sast",
    "bandit test ids",
    "bandit nosec",
    "python static analysis security",
    "bandit pyproject",
    "pycqa bandit",
    "bandit ci",
    "python code security scanning",
  ],
  alternates: { canonical: "/blog/bandit-python" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/bandit-python",
    images: ["/blog/bandit-python.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/bandit-python.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Bandit for Python: Practical SAST Without the Noise",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/bandit-python",
  image: "https://scanrook.io/blog/bandit-python.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Bandit in Python?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bandit is a static analysis tool that finds common security issues in Python code. It parses each file into an abstract syntax tree and runs a set of plugin tests against the AST nodes, reporting findings with a test ID, a severity and a confidence level. It began in the OpenStack Security Project and is now maintained under PyCQA.",
      },
    },
    {
      "@type": "Question",
      name: "How do I run Bandit on a project?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Install it with pip install bandit, then run bandit -r on your source directory. Adding -ll limits output to medium severity and above, and -f json produces machine-readable output for CI. Configuration can live in a bandit YAML file or, with the toml extra installed, in a [tool.bandit] section of pyproject.toml.",
      },
    },
    {
      "@type": "Question",
      name: "What do Bandit's test IDs mean?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Test IDs are grouped by hundreds. B1xx covers general issues such as assert and exec usage, B2xx framework misconfiguration, B3xx and B4xx blocklisted calls and imports, B5xx cryptography, B6xx injection including shell and SQL, and B7xx templating issues such as Jinja2 autoescape being disabled.",
      },
    },
    {
      "@type": "Question",
      name: "How do I suppress a Bandit false positive?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Append a nosec comment to the offending line, ideally naming the specific test so the suppression stays narrow. Project-wide exclusions belong in configuration via the skips list, and a baseline file can be used to freeze an existing backlog so only new findings fail the build.",
      },
    },
    {
      "@type": "Question",
      name: "Does Bandit find vulnerable dependencies?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Bandit only analyses the Python source you wrote. Known vulnerabilities in third-party packages are a different problem, handled by dependency scanners such as pip-audit, and vulnerabilities in the OS packages of the image you ship are a third layer handled by container scanners.",
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
            Bandit for Python: Practical SAST Without the Noise
          </h1>
          <p className="text-sm muted">Published November 10, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Bandit is the security linter most Python teams reach for first, and for good reason: it
            installs in seconds, runs fast enough to sit in a pre-commit hook, and catches a specific
            family of mistakes that code review reliably misses. It is also the tool most often turned
            off after a week because nobody tuned it. Here is how Bandit actually works, what its test
            IDs mean, and how to configure it so the findings stay worth reading.
          </p>
        </header>

        <img
          src="/blog/bandit-python.jpg"
          alt="Bandit Python security linter analysing an abstract syntax tree"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How Bandit works</h2>
          <p className="text-sm muted">
            Bandit does not execute your code and it does not do whole-program dataflow analysis. It
            parses each file into a Python abstract syntax tree and walks the nodes, handing them to a
            set of plugin tests that look for recognisable shapes: a call to{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              eval
            </code>
            , a subprocess invocation with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              shell=True
            </code>
            , a string that looks like a hardcoded password, an SQL query built by concatenation.
          </p>
          <p className="text-sm muted">
            That design explains both its strengths and its limits. It is fast, has no runtime
            dependencies on your application, and works on a single file just as happily as on a
            monorepo. It also cannot know whether the string being passed to a shell is attacker
            controlled, which is why every finding carries a <strong>confidence</strong> rating
            alongside its <strong>severity</strong>. Severity is how bad the issue would be;
            confidence is how sure Bandit is that it has recognised the pattern correctly. Filtering
            on both is the single most effective noise-reduction lever the tool has.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
            <code>{`pip install bandit

# recursive scan of a source tree
bandit -r ./src

# medium severity and above, medium confidence and above
bandit -r ./src -ll -ii

# machine-readable output for CI
bandit -r ./src -f json -o bandit-report.json`}</code>
          </pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Reading the test IDs</h2>
          <p className="text-sm muted">
            Every finding is stamped with an identifier like{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              B602
            </code>
            , and the leading digit tells you the family. Knowing the families lets you skim a report
            and immediately tell whether you are looking at a real class of bug or at an idiom your
            codebase uses deliberately.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Range</th>
                  <th className="text-left py-2 pr-4 font-semibold">Covers</th>
                  <th className="text-left py-2 font-semibold">Typical example</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">B1xx</td>
                  <td className="py-2 pr-4 align-top">General code issues</td>
                  <td className="py-2 align-top">
                    <code className="text-xs">assert</code> used for control flow; hardcoded temp paths
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">B2xx</td>
                  <td className="py-2 pr-4 align-top">Framework misconfiguration</td>
                  <td className="py-2 align-top">Flask running with debug enabled</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">B3xx / B4xx</td>
                  <td className="py-2 pr-4 align-top">Blocklisted calls and imports</td>
                  <td className="py-2 align-top">
                    <code className="text-xs">pickle</code>, <code className="text-xs">eval</code>,
                    insecure XML parsers
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">B5xx</td>
                  <td className="py-2 pr-4 align-top">Cryptography</td>
                  <td className="py-2 align-top">Weak hash choices, weak key sizes</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">B6xx</td>
                  <td className="py-2 pr-4 align-top">Injection</td>
                  <td className="py-2 align-top">
                    <code className="text-xs">shell=True</code>; SQL built by string concatenation
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">B7xx</td>
                  <td className="py-2 pr-4 align-top">Templating / XSS</td>
                  <td className="py-2 align-top">Jinja2 with autoescape disabled</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            In practice the B6xx family produces most of the findings that turn into real fixes, and
            B1xx produces most of the arguments. <code className="text-xs">assert</code> usage is
            flagged because assertions are stripped under{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              python -O
            </code>
            , which matters if you validate input with them and does not matter at all in a test
            suite. That is why nearly every project ends up excluding the test directory rather than
            arguing about it per-line.
          </p>
        </section>

        <img
          src="/blog/bandit-python-2.jpg"
          alt="Bandit flagging a small number of insecure code patterns across a large Python codebase"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Configuring it so it stays on</h2>
          <p className="text-sm muted">
            A default Bandit run on an established codebase produces a wall of findings, most of them
            low severity and low confidence. The tool survives that first encounter only if you narrow
            it deliberately. Configuration can live in a YAML file passed with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              -c
            </code>
            , or &mdash; with the <code className="text-xs">toml</code> extra installed &mdash; in
            your existing{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              pyproject.toml
            </code>
            , which keeps one fewer file in the repo root:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
            <code>{`# pyproject.toml   (pip install "bandit[toml]")
[tool.bandit]
exclude_dirs = ["tests", "build", ".venv"]
skips = ["B101"]        # assert_used - noisy in test-adjacent code

# run it against the config
# bandit -c pyproject.toml -r ./src`}</code>
          </pre>
          <p className="text-sm muted">
            For individual lines that are genuinely fine, a{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              nosec
            </code>{" "}
            comment suppresses the finding. Name the specific test rather than blanket-suppressing, so
            the line still gets checked for everything else:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
            <code>{`subprocess.run(shlex.split(cmd), check=True)  # nosec B603 - argv is built internally`}</code>
          </pre>
          <p className="text-sm muted">
            For an existing codebase with a real backlog, the baseline mechanism is better than mass
            suppression. Generate a JSON report once, commit it, and pass it with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              -b
            </code>{" "}
            &mdash; subsequent runs only report findings that are not already in the baseline. New code
            gets held to the standard immediately while the historical debt is paid down on its own
            schedule.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Running Bandit in CI</h2>
          <p className="text-sm muted">
            Bandit exits non-zero when it reports findings, which is all a pipeline gate needs. A
            reasonable GitHub Actions step looks like this:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
            <code>{`- name: Python security lint
  run: |
    pip install "bandit[toml]"
    bandit -c pyproject.toml -r ./src -ll -ii -f json -o bandit.json

- name: Upload report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: bandit-report
    path: bandit.json`}</code>
          </pre>
          <p className="text-sm muted">
            The <code className="text-xs">-ll -ii</code> pair is what keeps the gate credible: medium
            severity and medium confidence or above. Start there, and only tighten to{" "}
            <code className="text-xs">-l -i</code> once the team is genuinely reading the output. If
            you would rather report than block during a rollout period, add{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              --exit-zero
            </code>{" "}
            and revisit it later. This is the same graduated-enforcement pattern we describe in{" "}
            <Link href="/blog/shift-left-security" className="underline">
              shift-left security
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            What Bandit does not cover
          </h2>
          <p className="text-sm muted">
            Bandit analyses code you wrote. That is one layer of a Python service, and usually not the
            layer with the most CVEs in it. The dependencies you install and the base image you ship
            on are separate problems with separate tools:
          </p>
          <figure className="grid gap-2">
            <div className="overflow-x-auto surface-card p-4">
              <svg
                viewBox="0 0 620 250"
                role="img"
                aria-label="Three stacked coverage layers of a Python service: your source code covered by Bandit, third-party packages covered by dependency scanners, and the base image and OS packages covered by container scanning"
                className="w-full"
                style={{ minWidth: 520 }}
              >
                {[
                  { y: 20, label: "Your Python source", tool: "Bandit (AST patterns)", hot: true },
                  { y: 95, label: "Third-party packages", tool: "pip-audit / SCA (advisory matching)" },
                  { y: 170, label: "Base image + OS packages", tool: "Container scanning (installed state)" },
                ].map((l) => (
                  <g key={l.label}>
                    <rect
                      x={20}
                      y={l.y}
                      width={580}
                      height={58}
                      rx={8}
                      fill={l.hot ? "var(--dg-accent,#2563eb)" : "currentColor"}
                      fillOpacity={l.hot ? 0.13 : 0.045}
                      stroke="currentColor"
                      strokeOpacity={0.4}
                    />
                    <text x={40} y={44 + (l.y - 20)} fontSize="14" fontWeight="600" fill="currentColor">
                      {l.label}
                    </text>
                    <text
                      x={40}
                      y={64 + (l.y - 20)}
                      fontSize="11"
                      fill="currentColor"
                      fillOpacity={0.65}
                    >
                      {l.tool}
                    </text>
                  </g>
                ))}
                <line
                  x1={10}
                  y1={20}
                  x2={10}
                  y2={228}
                  stroke="currentColor"
                  strokeOpacity={0.3}
                  strokeWidth={2}
                />
              </svg>
            </div>
            <figcaption className="text-xs muted">
              Coverage layers for a Python service. Bandit owns the top band only; the two below it need
              advisory matching against package inventories. The bands are structural, not sized by
              finding volume.
            </figcaption>
          </figure>
          <p className="text-sm muted">
            For the middle band,{" "}
            <Link href="/blog/pip-audit-python-dependency-scanning" className="underline">
              pip-audit
            </Link>{" "}
            checks your installed distributions against advisory data. If you want deeper rule-based
            code analysis than Bandit&apos;s pattern tests offer &mdash; taint tracking, custom rules,
            multi-language coverage &mdash;{" "}
            <Link href="/blog/semgrep" className="underline">
              Semgrep
            </Link>{" "}
            is the usual next step, and the general distinction between these approaches is covered in{" "}
            <Link href="/blog/sast-vs-dast-explained" className="underline">
              SAST vs DAST
            </Link>
            .
          </p>
        </section>

        <img
          src="/blog/bandit-python-3.jpg"
          alt="Bandit running as a blocking security check inside a CI pipeline"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook does not compete with Bandit &mdash; it covers the bottom two bands of that
            diagram. When you scan a Python service, ScanRook reads the real package databases inside
            the artifact: the installed distributions from site-packages metadata as well as the OS
            packages of the base image, then matches everything against OSV, NVD and Red Hat OVAL in
            parallel. That catches the vulnerable{" "}
            <code className="text-xs">cryptography</code> wheel and the unpatched{" "}
            <code className="text-xs">openssl</code> in the base layer, neither of which Bandit is
            looking for.
          </p>
          <p className="text-sm muted">
            The honest framing is that these are complements with almost no overlap. Bandit tells you
            your own code called <code className="text-xs">eval</code> on a request parameter; a
            dependency and image scanner tells you the runtime underneath that code has a known
            remote-code-execution CVE. Both are ways to ship a compromised service, and each is
            invisible to the other tool. If you are curious how much of the second category a stock
            Python image carries, we scanned one in{" "}
            <Link href="/blog/is-python-docker-image-safe" className="underline">
              is the Python Docker image safe
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is Bandit?</h3>
              <p className="text-sm muted mt-1">
                An AST-based security linter for Python, maintained under PyCQA, that flags recognisable
                insecure code patterns with a test ID, severity and confidence.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I reduce false positives?</h3>
              <p className="text-sm muted mt-1">
                Filter on severity and confidence together, exclude test directories in config, use
                targeted nosec comments, and freeze historical findings with a baseline file.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does Bandit check dependencies?</h3>
              <p className="text-sm muted mt-1">
                No. It only analyses your own source. Use a dependency scanner for installed packages
                and a container scanner for the image you ship.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should it block the build?</h3>
              <p className="text-sm muted mt-1">
                Eventually, yes, at medium severity and confidence. Start in report-only mode with
                --exit-zero if you are introducing it to an established codebase.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Cover the other two layers</h3>
          <p className="text-sm muted leading-relaxed">
            Bandit has your source. Scan the built image with ScanRook to see what your dependencies
            and base layer bring along &mdash; every finding carries its advisory source and a
            confidence tier so you can check the reasoning.
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
            <Link href="/blog/pip-audit-python-dependency-scanning" className="underline">
              pip-audit for Python Dependencies
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/semgrep" className="underline">
              Semgrep
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/sast-vs-dast-explained" className="underline">
              SAST vs DAST Explained
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
