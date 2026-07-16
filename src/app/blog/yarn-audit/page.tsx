import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-21";

const title = `yarn audit: Scanning Yarn Dependencies for Vulnerabilities | ${APP_NAME}`;
const description =
  "How yarn audit checks Yarn dependencies against the GitHub Advisory Database, how Yarn Classic and Berry differ, its limits, and where scanning fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "yarn audit",
    "yarn audit command",
    "yarn npm audit",
    "yarn audit fix",
    "yarn audit level",
    "yarn dependency vulnerabilities",
    "yarn classic vs berry audit",
    "yarn security scan",
    "yarn audit ci",
    "yarn lockfile vulnerabilities",
  ],
  alternates: { canonical: "/blog/yarn-audit" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/yarn-audit",
    images: ["/blog/yarn-audit.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/yarn-audit.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "yarn audit: Scanning Yarn Dependencies for Vulnerabilities",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/yarn-audit",
  image: "https://scanrook.io/blog/yarn-audit.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does yarn audit do?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "yarn audit reads your yarn.lock file, sends the resolved dependency tree to a registry audit endpoint, and reports any dependencies with known published vulnerabilities. The npm registry's audit endpoint is backed by the GitHub Advisory Database, so yarn audit effectively checks your installed JavaScript packages against curated GHSA advisories and returns each finding with a severity and advisory link.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between yarn audit and yarn npm audit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "yarn audit is the command in Yarn Classic (v1). In Yarn Berry (v2 and later) the command was renamed to yarn npm audit and gained flags like --all, --recursive, and --environment. Both do the same core job of checking your dependency tree against advisory data, but the Berry version offers finer control over which workspaces and dependency environments are included.",
      },
    },
    {
      "@type": "Question",
      name: "Does yarn audit have a fix command like npm audit fix?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yarn Classic has no yarn audit fix. You remediate by updating the affected package, adding a resolutions entry in package.json to force a patched transitive version, or upgrading the direct dependency that pulls it in. Yarn Berry users can combine yarn npm audit with yarn up and plugins, but there is still no single automatic fix command equivalent to npm audit fix.",
      },
    },
    {
      "@type": "Question",
      name: "How do I make yarn audit fail a CI build?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "yarn audit exits with a bitmask: 1 for info, 2 for low, 4 for moderate, 8 for high, and 16 for critical, summed across the severities found. Use the --level flag to restrict which severities are reported and counted, for example yarn audit --level high, then let the non-zero exit code fail the job. In Yarn Berry, yarn npm audit --severity high behaves similarly.",
      },
    },
    {
      "@type": "Question",
      name: "What does yarn audit miss?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "yarn audit only sees JavaScript packages in your lockfile with a matching published advisory. It does not scan operating-system packages in a container, native binaries, or bundled assets, and it cannot tell you whether a vulnerable function is actually reached. It also reports on dev dependencies that may never ship. Scanning the built artifact covers the layers a lockfile audit cannot see.",
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
          <div className="text-xs uppercase tracking-wide muted">Best practices</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            yarn audit: Scanning Yarn Dependencies for Vulnerabilities
          </h1>
          <p className="text-sm muted">Published December 21, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">yarn audit</code>{" "}
            is the built-in way to check a Yarn project&apos;s dependencies against known
            vulnerabilities. It is fast, free, and already installed &mdash; which makes it a
            sensible first line of defense and a poor last one. Here is exactly what it checks, how
            Classic and Berry differ, how to wire it into CI, and the gaps a lockfile audit leaves
            open.
          </p>
        </header>

        <img
          src="/blog/yarn-audit.jpg"
          alt="yarn audit scanning Yarn dependencies"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What yarn audit checks</h2>
          <p className="text-sm muted">
            When you run <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">yarn audit</code>,
            Yarn does not scan your source code or your <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">node_modules</code>{" "}
            directory directly. It reads the resolved dependency tree from your{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">yarn.lock</code>{" "}
            file, packages up the list of names and versions, and sends it to a registry audit
            endpoint. The default endpoint is the npm registry&apos;s, which is backed by the{" "}
            <Link href="/blog/github-security-advisories-explained" className="underline">
              GitHub Advisory Database
            </Link>
            . The endpoint returns any advisories that match, and Yarn prints them grouped by
            severity with the vulnerable version range and a link.
          </p>
          <p className="text-sm muted">
            This is classic{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              software composition analysis
            </Link>{" "}
            for the JavaScript ecosystem: match known components to known advisories. It is the same
            model as{" "}
            <Link href="/blog/npm-audit-explained" className="underline">
              npm audit
            </Link>
            , which is unsurprising since both query the same advisory data.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How the audit flows</h2>
          <p className="text-sm muted">
            The whole operation is a lockfile in, advisories out round trip. Nothing about your
            actual build or runtime is inspected &mdash; only the declared dependency graph.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 820 180"
              role="img"
              aria-label="yarn audit reads yarn.lock, queries the registry audit endpoint backed by the GitHub Advisory Database, and returns a severity-grouped report"
              className="w-full h-auto text-black dark:text-white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="820" height="180" rx="16" className="fill-black/[.02] dark:fill-white/[.02]" />

              <rect x="24" y="60" width="160" height="60" rx="10" className="fill-black/[.05] dark:fill-white/[.08] stroke-black/10 dark:stroke-white/10" strokeWidth="1" />
              <text x="104" y="86" textAnchor="middle" className="fill-current" fontSize="12" fontWeight="600">yarn.lock</text>
              <text x="104" y="104" textAnchor="middle" className="fill-current" fontSize="10" opacity="0.6">resolved tree</text>

              <line x1="184" y1="90" x2="252" y2="90" className="stroke-current" strokeWidth="1.5" opacity="0.4" markerEnd="url(#ya)" />

              <rect x="254" y="50" width="200" height="80" rx="10" className="fill-black/[.05] dark:fill-white/[.08] stroke-black/10 dark:stroke-white/10" strokeWidth="1" />
              <text x="354" y="80" textAnchor="middle" className="fill-current" fontSize="12" fontWeight="600">Registry audit endpoint</text>
              <text x="354" y="98" textAnchor="middle" className="fill-current" fontSize="10" opacity="0.6">GitHub Advisory Database</text>

              <line x1="454" y1="90" x2="522" y2="90" className="stroke-current" strokeWidth="1.5" opacity="0.4" markerEnd="url(#ya)" />

              <rect x="524" y="50" width="272" height="80" rx="10" className="fill-[var(--dg-accent,#2563eb)]" opacity="0.06" />
              <rect x="524" y="50" width="272" height="80" rx="10" className="stroke-[var(--dg-accent,#2563eb)]" strokeWidth="2" fill="none" />
              <text x="660" y="80" textAnchor="middle" className="fill-current" fontSize="12" fontWeight="600">Report</text>
              <text x="660" y="98" textAnchor="middle" className="fill-current" fontSize="10" opacity="0.6">advisories grouped by severity + exit code</text>

              <text x="410" y="32" textAnchor="middle" className="fill-current" fontSize="11" opacity="0.55">Only the declared dependency graph is inspected &mdash; not the build or runtime</text>

              <defs>
                <marker id="ya" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" className="fill-current" opacity="0.5" />
                </marker>
              </defs>
            </svg>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Running it: the flags that matter</h2>
          <p className="text-sm muted">
            In Yarn Classic (v1) the command and its most useful flags look like this:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Audit the whole dependency tree
yarn audit

# Only report high and critical advisories
yarn audit --level high

# Limit to production dependencies (skip devDependencies)
yarn audit --groups dependencies

# Machine-readable output for further processing
yarn audit --json

# A compact one-line-per-severity summary (Yarn 1.22+)
yarn audit --summary`}</pre>
          <p className="text-sm muted">
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--level</code>{" "}
            sets the minimum severity to report, <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--groups</code>{" "}
            controls which dependency groups are included, and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--json</code>{" "}
            emits newline-delimited JSON that you can pipe into your own tooling.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Yarn Classic vs Yarn Berry</h2>
          <p className="text-sm muted">
            If you are on a modern Yarn (v2, v3, or v4 &mdash; collectively &ldquo;Berry&rdquo;), the
            command changed. Plain <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">yarn audit</code>{" "}
            was moved under the npm namespace:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Yarn Berry (v2+): audit the current workspace
yarn npm audit

# Include transitive dependencies and every workspace
yarn npm audit --all --recursive

# Only production dependencies, only high+ severity
yarn npm audit --environment production --severity high

# JSON output
yarn npm audit --json`}</pre>
          <p className="text-sm muted">
            The core behavior is the same &mdash; resolved tree in, advisories out &mdash; but Berry
            adds <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--all</code>{" "}
            and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--recursive</code>{" "}
            for monorepo and transitive coverage, and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--environment</code>{" "}
            to separate production from development dependencies. If a build script or CI job calls
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">yarn audit</code> on Berry, it will fail &mdash; update it to the namespaced form.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Exit codes and failing the build</h2>
          <p className="text-sm muted">
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">yarn audit</code>{" "}
            communicates severity through its exit code as a bitmask &mdash; each severity that is
            found contributes a value, and the values are summed:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Severity</th>
                  <th className="text-left py-2 pr-4 font-semibold">Exit-code bit</th>
                  <th className="text-left py-2 font-semibold">Meaning</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4">Info</td>
                  <td className="py-2 pr-4 font-mono">1</td>
                  <td className="py-2">Informational advisory present</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4">Low</td>
                  <td className="py-2 pr-4 font-mono">2</td>
                  <td className="py-2">At least one low-severity advisory</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4">Moderate</td>
                  <td className="py-2 pr-4 font-mono">4</td>
                  <td className="py-2">At least one moderate advisory</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4">High</td>
                  <td className="py-2 pr-4 font-mono">8</td>
                  <td className="py-2">At least one high-severity advisory</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Critical</td>
                  <td className="py-2 pr-4 font-mono">16</td>
                  <td className="py-2">At least one critical advisory</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            An exit code of <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">24</code>,
            for example, means high (8) plus critical (16). The practical pattern in CI is to combine
            the bitmask with <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--level</code>{" "}
            so the job only fails on severities you care about:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Fail CI only on high or critical advisories (Yarn Classic)
yarn audit --level high

# Berry equivalent
yarn npm audit --severity high`}</pre>
          <p className="text-sm muted">
            Start with <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--level high</code>{" "}
            rather than failing on everything &mdash; a fresh audit on an established project often
            lists dozens of low and moderate advisories, and a wall of red on day one teaches the
            team to ignore the check.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What yarn audit misses</h2>
          <p className="text-sm muted">
            yarn audit is genuinely useful, and it is also narrow. Being honest about the edges keeps
            it from becoming a false sense of coverage:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>JavaScript only.</strong> It sees the packages in your lockfile. The OS
              packages in your container base image, native binaries, and non-JS assets are
              invisible to it &mdash; and those are where a lot of container CVEs actually live.
            </li>
            <li>
              <strong>No reachability.</strong> An advisory on a package you import but never call on
              a vulnerable path still counts. yarn audit reports presence, not exploitability, so
              some findings are noise you will triage away.
            </li>
            <li>
              <strong>Dev dependencies inflate the count.</strong> Build tools and test frameworks
              never ship to production but appear in the audit unless you scope with
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--groups</code>{" "}
              or <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--environment production</code>.
            </li>
            <li>
              <strong>Single advisory source.</strong> It queries one endpoint. A CVE that has an OSV
              or vendor record but no matching GHSA entry can slip past it.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            yarn audit belongs in your pull-request loop: it is fast, needs no extra tooling, and
            catches known-vulnerable JavaScript packages before they merge. ScanRook does not replace
            that &mdash; it covers the layers the lockfile audit cannot see. When you scan the built
            container, ScanRook reads the actual package databases inside the image, so it finds the
            OS packages, native libraries, and installed <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">node_modules</code>{" "}
            together, and matches them against OSV, NVD, and vendor advisory data rather than a single
            endpoint.
          </p>
          <p className="text-sm muted">
            The combination is the point: yarn audit gates the dependency change at the source, and a
            scan of the built artifact verifies what actually shipped &mdash; including the base image
            you did not choose line by line. For the fix side of that loop, see{" "}
            <Link href="/blog/fix-npm-vulnerabilities-in-docker" className="underline">
              how to fix npm vulnerabilities in Docker builds
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What does yarn audit do?</h3>
              <p className="text-sm muted mt-1">
                It reads your yarn.lock, sends the dependency tree to a registry audit endpoint
                backed by the GitHub Advisory Database, and reports packages with known
                vulnerabilities, grouped by severity.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">yarn audit vs yarn npm audit?</h3>
              <p className="text-sm muted mt-1">
                yarn audit is the Yarn Classic (v1) command. Yarn Berry (v2+) renamed it to yarn npm
                audit and added --all, --recursive, and --environment for finer control.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is there a yarn audit fix?</h3>
              <p className="text-sm muted mt-1">
                No. Remediate by upgrading the dependency or adding a resolutions entry in
                package.json to force a patched transitive version. There is no automatic fix
                command.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I fail CI on findings?</h3>
              <p className="text-sm muted mt-1">
                The exit code is a bitmask (info 1, low 2, moderate 4, high 8, critical 16). Use
                --level high (or --severity high in Berry) so the non-zero exit fails only on serious
                advisories.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan past the lockfile</h3>
          <p className="text-sm muted leading-relaxed">
            yarn audit checks your JavaScript packages. ScanRook scans the whole built image &mdash;
            OS packages, native libraries, and installed dependencies &mdash; against OSV, NVD, and
            vendor advisories, so the base image you inherited does not hide CVEs your lockfile audit
            never sees.
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
            <Link href="/blog/fix-npm-vulnerabilities-in-docker" className="underline">
              Fix npm Vulnerabilities in Docker
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
