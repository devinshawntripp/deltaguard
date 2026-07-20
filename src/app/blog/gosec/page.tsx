import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-12";

const title = `gosec: Static Security Analysis for Go, Tuned Properly | ${APP_NAME}`;
const description =
  "gosec scans Go source for insecure patterns. Its rule IDs, severity and confidence filters, nosec suppressions, CI wiring, and how it differs from govulncheck.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "gosec",
    "gosec go",
    "go security scanner",
    "golang static analysis security",
    "gosec rules",
    "gosec nosec",
    "securego gosec",
    "gosec vs govulncheck",
    "go sast",
    "gosec ci",
  ],
  alternates: { canonical: "/blog/gosec" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/gosec",
    images: ["/blog/gosec.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/gosec.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "gosec: Static Security Analysis for Go, Tuned Properly",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/gosec",
  image: "https://scanrook.io/blog/gosec.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is gosec?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "gosec is a static analysis tool that inspects Go source code for security problems. It parses packages with the standard Go tooling, walks the abstract syntax tree with type information available, and applies a rule set covering things like hardcoded credentials, command and SQL injection, weak cryptography and unsafe file permissions.",
      },
    },
    {
      "@type": "Question",
      name: "How do I run gosec?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Install the binary with go install from the securego/gosec module, then run gosec ./... at the root of your module. Filtering with -severity and -confidence keeps the output manageable, and -fmt selects an output format such as JSON, SARIF or JUnit XML for CI consumption.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between gosec and govulncheck?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "gosec looks for insecure patterns in the code you wrote. govulncheck looks for known vulnerabilities in the code you imported, and narrows results to vulnerable functions your program can actually reach. They overlap almost nowhere, so most Go projects run both.",
      },
    },
    {
      "@type": "Question",
      name: "How do I suppress a gosec finding?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Add a nosec comment above or on the flagged line, naming the specific rule so the suppression stays narrow. Whole rules can be turned off across the project with the exclude flag or a config file, and suppression tracking can be enabled so ignored findings still appear in reports.",
      },
    },
    {
      "@type": "Question",
      name: "Is gosec included in golangci-lint?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, gosec is available as one of the linters golangci-lint can run, which is a convenient way to adopt it if you already run that aggregator. Running gosec directly gives you finer control over rule selection, confidence filtering and report formats.",
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
            gosec: Static Security Analysis for Go, Tuned Properly
          </h1>
          <p className="text-sm muted">Published November 12, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            gosec is the default answer when a Go team asks &ldquo;what should we run to catch
            insecure code before review does?&rdquo; It is a rule-based scanner over the Go AST, it
            takes about a minute to adopt, and its output ranges from genuinely alarming to entirely
            expected depending on how you configure it. This walks through the rule families, the
            filters that decide whether the tool is useful or ignored, and where gosec stops and other
            tooling has to take over.
          </p>
        </header>

        <img
          src="/blog/gosec.jpg"
          alt="gosec static analysis inspecting concurrent Go code paths"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What gosec actually does</h2>
          <p className="text-sm muted">
            gosec loads your packages using the standard Go tooling, so it sees the same view of your
            code the compiler does &mdash; syntax tree plus resolved type information. Each rule is a
            small visitor that watches for a shape it recognises: a call to{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              exec.Command
            </code>{" "}
            with a variable argument, a{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              tls.Config
            </code>{" "}
            with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              InsecureSkipVerify
            </code>{" "}
            set, an SQL string built with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              fmt.Sprintf
            </code>
            .
          </p>
          <p className="text-sm muted">
            Because type information is available, gosec is meaningfully more precise than a
            grep-based linter: it knows that the{" "}
            <code className="text-xs">rand.Intn</code> you called came from{" "}
            <code className="text-xs">math/rand</code> and not{" "}
            <code className="text-xs">crypto/rand</code>. What it does not do is full interprocedural
            taint analysis in the general case, which is why every finding carries a{" "}
            <strong>confidence</strong> value alongside <strong>severity</strong>. Severity is how bad
            the pattern would be if it were real; confidence is how sure gosec is that it read the
            situation correctly.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
            <code>{`go install github.com/securego/gosec/v2/cmd/gosec@latest

# scan every package in the module
gosec ./...

# medium severity and confidence or above, JSON output
gosec -severity medium -confidence medium -fmt json -out gosec.json ./...

# skip a rule everywhere, and skip vendored code
gosec -exclude=G104 -exclude-dir=vendor ./...`}</code>
          </pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The rule families</h2>
          <p className="text-sm muted">
            Rules are identified as{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              Gnnn
            </code>{" "}
            and grouped by hundreds. Learning the groups is worth the five minutes because it lets you
            triage a report by ID prefix rather than by reading every message.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Range</th>
                  <th className="text-left py-2 pr-4 font-semibold">Theme</th>
                  <th className="text-left py-2 font-semibold">Representative rules</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">G1xx</td>
                  <td className="py-2 pr-4 align-top">General / misc</td>
                  <td className="py-2 align-top">
                    Hardcoded credentials, binding to all interfaces, unhandled errors, missing HTTP
                    server timeouts, integer conversion overflow
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">G2xx</td>
                  <td className="py-2 pr-4 align-top">Injection</td>
                  <td className="py-2 align-top">
                    SQL built by format string or concatenation, unescaped data in HTML templates,
                    subprocess launched with a variable
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">G3xx</td>
                  <td className="py-2 pr-4 align-top">Filesystem</td>
                  <td className="py-2 align-top">
                    Overly permissive directory and file modes, predictable temp paths, tainted file
                    paths, archive extraction traversal
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">G4xx</td>
                  <td className="py-2 pr-4 align-top">Cryptography</td>
                  <td className="py-2 align-top">
                    Weak hash algorithms, TLS verification disabled, undersized RSA keys, use of
                    math/rand where crypto/rand is required
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">G5xx</td>
                  <td className="py-2 pr-4 align-top">Blocklisted imports</td>
                  <td className="py-2 align-top">
                    Importing deprecated or broken crypto packages such as MD5, SHA1, DES and RC4
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">G6xx</td>
                  <td className="py-2 pr-4 align-top">Memory safety</td>
                  <td className="py-2 align-top">
                    Implicit memory aliasing in loops, slice access that may go out of bounds
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            Two families cause almost all of the friction. The unhandled-error rule fires on every
            ignored return value, which in idiomatic Go includes plenty of intentional cases &mdash;
            most teams either exclude it or handle it through a dedicated errcheck pass. And the
            integer-conversion overflow rule added in a more recent release flags a very large number
            of ordinary conversions; it catches real bugs, but adopting it on a mature codebase is a
            project rather than a config change.
          </p>
        </section>

        <img
          src="/blog/gosec-2.jpg"
          alt="gosec rule set matching insecure patterns in Go source code"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Suppressions that age well</h2>
          <p className="text-sm muted">
            Some findings are correct and irrelevant. A CLI tool that shells out to a command built
            from its own flags is not vulnerable to command injection in any meaningful sense, but
            G204 will flag it forever. The right response is an annotated, rule-specific suppression:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
            <code>{`// #nosec G204 -- argv is assembled from validated flags, never from request data
cmd := exec.Command(scannerPath, args...)

// #nosec G304 -- path is confined to the scratch dir by filepath.Clean + prefix check
f, err := os.Open(reportPath)`}</code>
          </pre>
          <p className="text-sm muted">
            A bare <code className="text-xs">#nosec</code> with no rule ID disables every rule on that
            line, which quietly hides the next problem introduced there. Naming the rule and the
            reason turns the comment into documentation that a reviewer can disagree with. Enabling
            suppression tracking is also worth doing on larger codebases: it keeps ignored findings
            visible in the report instead of letting them vanish, so an audit can review the pile of
            justifications rather than trusting it.
          </p>
          <p className="text-sm muted">
            For rules you never want, a config file is cleaner than a growing string of flags.
            Whole-rule exclusion plus per-rule options live together, and the file goes into version
            control alongside the rest of your lint configuration.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Wiring it into CI</h2>
          <p className="text-sm muted">
            gosec exits non-zero when it reports findings, so the gate is straightforward. SARIF output
            is the format worth reaching for on GitHub, because findings then land in the code-scanning
            UI with file and line annotations instead of sitting in a log:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
            <code>{`- name: Go security scan
  run: |
    go install github.com/securego/gosec/v2/cmd/gosec@latest
    gosec -severity medium -confidence medium \\
          -exclude-dir=vendor \\
          -fmt sarif -out gosec.sarif -no-fail ./...

- name: Upload SARIF
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: gosec.sarif`}</code>
          </pre>
          <p className="text-sm muted">
            The <code className="text-xs">-no-fail</code> flag in that example lets the upload step
            run even when findings exist; drop it once you are ready for gosec to block merges. If you
            already run golangci-lint, enabling gosec there is a lower-friction starting point, though
            you give up some control over confidence filtering and report formats. The graduated
            rollout advice in{" "}
            <Link href="/blog/shift-left-security" className="underline">
              shift-left security
            </Link>{" "}
            applies directly: report first, baseline the backlog, then enforce.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            gosec, govulncheck, and image scanning
          </h2>
          <p className="text-sm muted">
            Go teams routinely confuse these three, and they answer completely different questions:
          </p>
          <figure className="grid gap-2">
            <div className="overflow-x-auto surface-card p-4">
              <svg
                viewBox="0 0 660 260"
                role="img"
                aria-label="Flow diagram showing Go source analysed by gosec for insecure patterns, module dependencies analysed by govulncheck for reachable known vulnerabilities, and the built container image analysed by a container scanner for OS and language package CVEs"
                className="w-full"
                style={{ minWidth: 560 }}
              >
                <defs>
                  <marker id="gs-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                  </marker>
                </defs>
                {[
                  { x: 14, label: "Go source", sub: "code you wrote" },
                  { x: 234, label: "Module graph", sub: "code you imported" },
                  { x: 454, label: "Container image", sub: "what you ship" },
                ].map((b) => (
                  <g key={b.label}>
                    <rect
                      x={b.x}
                      y={22}
                      width={192}
                      height={56}
                      rx={8}
                      fill="currentColor"
                      fillOpacity={0.05}
                      stroke="currentColor"
                      strokeOpacity={0.45}
                    />
                    <text x={b.x + 96} y={46} textAnchor="middle" fontSize="14" fontWeight="600" fill="currentColor">
                      {b.label}
                    </text>
                    <text x={b.x + 96} y={65} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>
                      {b.sub}
                    </text>
                  </g>
                ))}
                {[206, 426].map((x) => (
                  <line
                    key={x}
                    x1={x}
                    y1={50}
                    x2={x + 26}
                    y2={50}
                    stroke="currentColor"
                    strokeWidth={2}
                    markerEnd="url(#gs-arrow)"
                  />
                ))}
                {[
                  { x: 14, tool: "gosec", sub: "insecure patterns", hot: true },
                  { x: 234, tool: "govulncheck", sub: "reachable known CVEs" },
                  { x: 454, tool: "container scan", sub: "OS + lang packages" },
                ].map((b) => (
                  <g key={b.tool}>
                    <line
                      x1={b.x + 96}
                      y1={78}
                      x2={b.x + 96}
                      y2={126}
                      stroke="currentColor"
                      strokeWidth={2}
                      markerEnd="url(#gs-arrow)"
                    />
                    <rect
                      x={b.x}
                      y={130}
                      width={192}
                      height={56}
                      rx={8}
                      fill={b.hot ? "var(--dg-accent,#2563eb)" : "currentColor"}
                      fillOpacity={b.hot ? 0.13 : 0.045}
                      stroke="currentColor"
                      strokeOpacity={0.45}
                    />
                    <text x={b.x + 96} y={154} textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">
                      {b.tool}
                    </text>
                    <text x={b.x + 96} y={173} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>
                      {b.sub}
                    </text>
                  </g>
                ))}
                <rect
                  x={14}
                  y={208}
                  width={632}
                  height={32}
                  rx={6}
                  fill="currentColor"
                  fillOpacity={0.04}
                  stroke="currentColor"
                  strokeOpacity={0.25}
                />
                <text x={330} y={228} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.7}>
                  Three questions, three tools — no meaningful overlap between them
                </text>
              </svg>
            </div>
            <figcaption className="text-xs muted">
              Where each Go security tool applies. The diagram shows scope relationships, not relative
              finding volumes.
            </figcaption>
          </figure>
          <p className="text-sm muted">
            <Link href="/blog/govulncheck-go-vulnerability-scanning" className="underline">
              govulncheck
            </Link>{" "}
            is the one people most often assume gosec replaces. It does not: govulncheck matches your
            module graph against the Go vulnerability database and then uses call-graph analysis to
            report only the vulnerabilities your code can actually reach &mdash; the{" "}
            <Link href="/blog/reachability-analysis" className="underline">
              reachability
            </Link>{" "}
            idea applied well. gosec has nothing to say about your dependencies, and govulncheck has
            nothing to say about the <code className="text-xs">InsecureSkipVerify</code> you set last
            month.
          </p>
        </section>

        <img
          src="/blog/gosec-3.jpg"
          alt="Triaging gosec findings into false positives and real security issues"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook owns the third box in that diagram. Go binaries are unusually convenient to scan
            because the toolchain embeds module and version metadata directly in the compiled
            executable &mdash; ScanRook&apos;s binary analysis reads ELF, PE and Mach-O structures and
            recovers that dependency information from the artifact you are actually shipping, not from
            a lockfile that may have drifted. It then matches those packages, plus everything in the
            base image, against OSV, NVD and Red Hat OVAL in parallel.
          </p>
          <p className="text-sm muted">
            That matters most for the gap between build and deploy. gosec and govulncheck run against
            a checkout; a scanner running against the pushed image catches the case where the image
            was built from a stale commit, a base layer aged out, or a{" "}
            <code className="text-xs">CGO</code> dependency pulled in a system library nobody
            reviewed. Each finding carries its advisory source and a confidence tier, so a
            disagreement between tools is something you can investigate rather than arbitrate. Running
            all three costs a couple of minutes per pipeline and covers three genuinely distinct
            failure modes.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is gosec?</h3>
              <p className="text-sm muted mt-1">
                A rule-based static analyser for Go that inspects the typed AST for insecure patterns
                and reports each with a rule ID, severity and confidence.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">gosec or govulncheck?</h3>
              <p className="text-sm muted mt-1">
                Both. gosec covers insecure code you wrote; govulncheck covers reachable known
                vulnerabilities in code you imported.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I cut the noise?</h3>
              <p className="text-sm muted mt-1">
                Filter on severity and confidence together, exclude vendored code, and use
                rule-specific nosec comments with a written justification.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can I run it via golangci-lint?</h3>
              <p className="text-sm muted mt-1">
                Yes, gosec is available as a linter there. Running it directly gives finer control
                over rules, confidence filtering and output formats.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan the binary you actually ship</h3>
          <p className="text-sm muted leading-relaxed">
            gosec and govulncheck read your checkout. ScanRook reads the built artifact &mdash;
            recovering embedded Go module metadata and base-image packages, then matching them against
            several advisory sources with the origin attached to every finding.
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
            <Link href="/blog/govulncheck-go-vulnerability-scanning" className="underline">
              govulncheck for Go
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/sast-vs-dast-explained" className="underline">
              SAST vs DAST Explained
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/reachability-analysis" className="underline">
              Reachability Analysis
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
