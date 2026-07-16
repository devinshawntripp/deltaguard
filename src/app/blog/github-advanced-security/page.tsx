import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-03";

const title = `GitHub Advanced Security: What It Covers and What It Misses | ${APP_NAME}`;
const description =
  "GitHub Advanced Security bundles CodeQL, secret scanning, and Dependabot. What it covers, how it is priced, and where container CVE scanning fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "github advanced security",
    "ghas",
    "github code scanning",
    "codeql",
    "github secret scanning",
    "github secret protection",
    "github code security",
    "dependabot alerts",
    "github advanced security pricing",
    "ghas vs container scanning",
  ],
  alternates: { canonical: "/blog/github-advanced-security" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/github-advanced-security",
    images: ["/blog/github-advanced-security.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/github-advanced-security.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "GitHub Advanced Security: What It Covers and What It Misses",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/github-advanced-security",
  image: "https://scanrook.io/blog/github-advanced-security.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is GitHub Advanced Security?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GitHub Advanced Security (GHAS) is a set of security features built into GitHub: code scanning powered by CodeQL, secret scanning with push protection, and dependency review backed by Dependabot, surfaced through a security overview dashboard. It analyzes your source code, commit contents, and dependency manifests directly inside the repository.",
      },
    },
    {
      "@type": "Question",
      name: "How much does GitHub Advanced Security cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The features are free on public repositories. For private repositories GitHub relaunched them in 2025 as two separately licensed products, GitHub Secret Protection and GitHub Code Security, each billed per active committer per month. Dependabot alerts and the dependency graph remain free for all repositories, public and private.",
      },
    },
    {
      "@type": "Question",
      name: "Does GitHub Advanced Security scan container images?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not for operating-system-level CVEs. GHAS analyzes source code, secrets, and declared dependency manifests inside the repository. It does not read the OS packages baked into a built container image, so vulnerable system libraries in your base image fall outside its scope and need a dedicated image scanner.",
      },
    },
    {
      "@type": "Question",
      name: "Is CodeQL the same as dependency scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. CodeQL is static application security testing (SAST) that analyzes your own source code for vulnerable patterns like injection or unsafe deserialization. Dependency scanning, handled by Dependabot, matches your declared third-party packages against known advisories. They cover different risks and both are part of GHAS.",
      },
    },
    {
      "@type": "Question",
      name: "Do I still need a container scanner if I use GitHub Advanced Security?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, if you ship containers. GHAS secures the code and dependencies in your repository, but the artifact you deploy also contains an OS and system packages pulled from a base image. Those layers carry their own CVEs that GHAS does not inspect, so an image scanner covers a gap GHAS leaves open.",
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
          <div className="text-xs uppercase tracking-wide muted">Benchmarks</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            GitHub Advanced Security: What It Covers and What It Misses
          </h1>
          <p className="text-sm muted">Published November 3, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            GitHub Advanced Security is the most convenient security tooling most teams will ever
            adopt &mdash; it is already where your code lives, and turning it on takes a setting, not
            a migration. It is genuinely strong at what it does. It is also scoped to the repository,
            which leaves a specific gap for anyone shipping containers. Here is an honest map of what
            GHAS covers, what it costs, and where a container scanner picks up.
          </p>
        </header>

        <img
          src="/blog/github-advanced-security.jpg"
          alt="GitHub Advanced Security coverage across the software lifecycle"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What GHAS includes</h2>
          <p className="text-sm muted">
            GitHub Advanced Security bundles three capabilities, all surfaced inside the GitHub UI
            and pull-request experience:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Code scanning with CodeQL.</strong> A static application security testing
              (SAST) engine that treats your code as a queryable database and finds vulnerable
              patterns &mdash; injection, path traversal, unsafe deserialization &mdash; across many
              languages. It also ingests third-party SARIF results, so other analyzers can report
              through the same interface.
            </li>
            <li>
              <strong>Secret scanning with push protection.</strong> Detects committed credentials
              against a large catalog of provider patterns, and can block a push that contains a
              recognized secret before it ever reaches the remote.
            </li>
            <li>
              <strong>Dependency review and Dependabot.</strong> Builds a dependency graph from your
              manifests, raises Dependabot alerts for vulnerable dependencies, and can open update
              pull requests automatically.
            </li>
          </ul>
          <p className="text-sm muted">
            The common thread is that every one of these operates on the contents of the repository:
            source files, commit diffs, and declared dependency manifests.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where GHAS sits in the lifecycle</h2>
          <p className="text-sm muted">
            The clearest way to understand GHAS is to place it on the path from code to production.
            It owns the left side &mdash; the code and the dependencies you declare &mdash; and stops
            at the repository boundary. The built container image, with the operating system and
            system packages it inherits from a base image, is on the other side of that line.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 680 170" role="img" aria-label="Software lifecycle coverage. GitHub Advanced Security covers code, dependencies, and secrets in the repository. A container image scanner covers the built image. Runtime is covered by neither." className="w-full max-w-2xl mx-auto">
              <g fontSize="11" textAnchor="middle">
                <rect x="20" y="62" width="126" height="44" rx="7" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.22" />
                <text x="83" y="88" fill="currentColor">Code</text>
                <rect x="150" y="62" width="126" height="44" rx="7" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.22" />
                <text x="213" y="88" fill="currentColor">Dependencies</text>
                <rect x="280" y="62" width="126" height="44" rx="7" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.22" />
                <text x="343" y="88" fill="currentColor">Secrets</text>
                <rect x="410" y="62" width="126" height="44" rx="7" fill="var(--dg-accent,#2563eb)" fillOpacity="0.11" stroke="var(--dg-accent,#2563eb)" strokeOpacity="0.55" />
                <text x="473" y="83" fill="currentColor">Container</text>
                <text x="473" y="97" fill="currentColor">image</text>
                <rect x="540" y="62" width="120" height="44" rx="7" fill="currentColor" fillOpacity="0.02" stroke="currentColor" strokeOpacity="0.15" />
                <text x="600" y="88" fill="currentColor" opacity="0.7">Runtime</text>

                <g stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" fill="none">
                  <path d="M24 50 V42 H402 V50" />
                </g>
                <text x="213" y="32" fill="currentColor" fontSize="11.5">GitHub Advanced Security</text>

                <g stroke="var(--dg-accent,#2563eb)" strokeOpacity="0.7" strokeWidth="1.5" fill="none">
                  <path d="M414 118 V126 H532 V118" />
                </g>
                <text x="473" y="146" fill="currentColor" fontSize="11.5">Image scanner (ScanRook)</text>
              </g>
            </svg>
          </div>
          <p className="text-sm muted">
            Neither GHAS code scanning nor an image scanner is a runtime tool &mdash; that column
            belongs to runtime monitoring, a separate layer again. The point is not that one tool is
            better; it is that they occupy different columns.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How it is priced</h2>
          <p className="text-sm muted">
            On public repositories, code scanning, secret scanning, and Dependabot alerts are free.
            For private repositories, GitHub relaunched the paid features in 2025 as two products you
            can buy separately &mdash; <strong>GitHub Secret Protection</strong> and{" "}
            <strong>GitHub Code Security</strong> &mdash; each billed per active committer per month,
            rather than the single bundled Advanced Security add-on that previously required GitHub
            Enterprise. Dependabot alerts and the dependency graph stayed free for all repositories.
            The practical effect is that smaller teams can now license secret scanning or code
            scanning on its own instead of buying the whole bundle. Pricing and packaging change, so
            confirm current terms with GitHub for your plan.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">GHAS and a container scanner side by side</h2>
          <p className="text-sm muted">
            These tools are complements, not competitors, and the table makes the boundary explicit:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Dimension</th>
                  <th className="text-left py-2 pr-4 font-semibold">GitHub Advanced Security</th>
                  <th className="text-left py-2 font-semibold">Container image scanner</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Analyzes</strong></td>
                  <td className="py-2 pr-4 align-top">Source code, commits, dependency manifests</td>
                  <td className="py-2 align-top">Built image: OS + language packages in every layer</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Finds</strong></td>
                  <td className="py-2 pr-4 align-top">Code vulns (SAST), leaked secrets, vulnerable declared deps</td>
                  <td className="py-2 align-top">Known CVEs in installed OS and app packages</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Runs</strong></td>
                  <td className="py-2 pr-4 align-top">Inside GitHub, on push and pull request</td>
                  <td className="py-2 align-top">Anywhere: local, CI, registry, admission control</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Base image CVEs</strong></td>
                  <td className="py-2 pr-4 align-top">Not covered</td>
                  <td className="py-2 align-top">Core purpose</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top"><strong>Your code logic</strong></td>
                  <td className="py-2 pr-4 align-top">Core purpose (CodeQL)</td>
                  <td className="py-2 align-top">Not covered</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            GHAS is the right and often best answer for code-level risk: CodeQL is a serious SAST
            engine, push protection stops secrets at the source, and Dependabot keeps declared
            dependencies current &mdash; all with zero infrastructure because it lives where your
            code already is. For those jobs, reach for GHAS. The gap it does not fill is the OS layer
            of the artifact you ship.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The container gap, concretely</h2>
          <p className="text-sm muted">
            Suppose your repository is clean: CodeQL finds nothing, no secrets, every declared
            dependency current. You build the image on a{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">debian:bookworm</code>{" "}
            base and deploy. That base contributes hundreds of system packages &mdash; glibc,
            OpenSSL, zlib, coreutils &mdash; none of which appear in your{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">package.json</code>{" "}
            or <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">go.mod</code>,
            and each carries its own advisory history. Dependabot never sees them because they are
            not declared dependencies; CodeQL never sees them because they are not your code. Only a
            scan of the built image reads those installed packages and matches them against CVE data.
            That is the same class of finding our{" "}
            <Link href="/blog/best-container-vulnerability-scanners-2026" className="underline">
              container scanner roundup
            </Link>{" "}
            and{" "}
            <Link href="/blog/vulnerability-scanner-benchmark-2026" className="underline">
              2026 benchmark
            </Link>{" "}
            measure across real base images.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook does not overlap with GHAS; it completes the picture. Keep CodeQL, secret
            scanning, and Dependabot doing what they do well on the repository side, and add ScanRook
            on the build output. It scans the container image, binary, or source archive for known
            CVEs in the OS and language packages GHAS never inspects, matching each against OSV, NVD,
            and Red Hat OVAL in parallel and tagging findings with their source and a confidence
            tier. GHAS secures the code you write; ScanRook secures the software you ship. For deeper
            background on how GitHub&apos;s own advisory data flows into scanners, see{" "}
            <Link href="/blog/github-security-advisories-explained" className="underline">
              GHSA explained
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is GitHub Advanced Security?</h3>
              <p className="text-sm muted mt-1">
                GitHub&apos;s built-in security suite: CodeQL code scanning, secret scanning with
                push protection, and Dependabot dependency review, all inside the repository.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How much does it cost?</h3>
              <p className="text-sm muted mt-1">
                Free on public repos. For private repos it is sold as Secret Protection and Code
                Security, billed per active committer; Dependabot alerts stay free.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does it scan container images?</h3>
              <p className="text-sm muted mt-1">
                Not for OS-level CVEs. It analyzes code, secrets, and declared dependencies, not the
                system packages inside a built image.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Do I still need a container scanner?</h3>
              <p className="text-sm muted mt-1">
                If you ship containers, yes. GHAS covers the repository; an image scanner covers the
                base-image and package CVEs it does not inspect.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Cover the layer GHAS cannot see</h3>
          <p className="text-sm muted leading-relaxed">
            Keep GitHub Advanced Security on your code and dependencies, and add ScanRook on the
            built image &mdash; multi-source CVE scanning of the OS and packages GHAS never inspects,
            with every finding tagged by source and confidence.
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
            <Link href="/blog/github-security-advisories-explained" className="underline">
              GHSA Explained
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/sast-vs-dast-explained" className="underline">
              SAST vs DAST
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              What Is SCA?
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
