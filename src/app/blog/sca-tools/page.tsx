import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-29";

const title = `SCA Tools in 2026: A Practical Guide to Composition Analysis | ${APP_NAME}`;
const description =
  "SCA tools inventory open-source dependencies and match them to known CVEs and licenses. How they work, the main tools compared, and where ScanRook fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "sca tools",
    "software composition analysis tools",
    "best sca tools",
    "open source sca tools",
    "sca vs sast",
    "dependency scanning tools",
    "sca tools comparison",
    "software composition analysis",
    "open source vulnerability scanner",
    "sca tools 2026",
  ],
  alternates: { canonical: "/blog/sca-tools" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/sca-tools",
    images: ["/blog/sca-tools.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/sca-tools.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "SCA Tools in 2026: A Practical Guide to Composition Analysis",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/sca-tools",
  image: "https://scanrook.io/blog/sca-tools.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are SCA tools?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SCA (software composition analysis) tools inventory the open-source and third-party components in an application, then match each one against databases of known vulnerabilities and software licenses. They answer two questions: which dependencies am I actually shipping, and do any of them carry a known CVE or a license obligation I need to track.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between SCA and SAST?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SAST analyzes your own source code for insecure patterns like SQL injection or hardcoded secrets. SCA analyzes the third-party code you depend on, matching component versions against known-vulnerability and license databases. SAST finds bugs you wrote; SCA finds risk you inherited. Most mature programs run both because they cover different parts of the same application.",
      },
    },
    {
      "@type": "Question",
      name: "Are open-source SCA tools good enough?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For most teams, yes. Tools like OWASP Dependency-Check, OSV-Scanner, Trivy, Grype, and the native package auditors (npm audit, pip-audit) cover the common ecosystems well and cost nothing. Commercial tools add reachability analysis, curated advisory feeds, fix automation, and policy dashboards, which matter more at scale or under audit pressure.",
      },
    },
    {
      "@type": "Question",
      name: "Does an SCA tool scan container images?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Some do and some do not. Manifest-based SCA reads lockfiles in a source repository, so it sees application dependencies but not the operating-system packages baked into a base image. Container scanners read the packages actually installed in the image layers. To cover both the app and the OS, you either use a tool that does both or pair a source SCA tool with an image scanner.",
      },
    },
    {
      "@type": "Question",
      name: "How do SCA tools handle licenses?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Beyond vulnerabilities, most SCA tools detect the license of each dependency and flag ones that conflict with your policy, such as copyleft licenses in a proprietary product. License findings are legal, not technical, so the tool surfaces the obligation and your team, ideally with counsel, decides whether it is acceptable.",
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
            SCA Tools in 2026: A Practical Guide to Composition Analysis
          </h1>
          <p className="text-sm muted">Published November 29, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            Modern applications are mostly other people&apos;s code. The average project pulls in
            hundreds of transitive dependencies, and any one of them can carry a known
            vulnerability or a license you did not intend to ship. SCA tools exist to make that
            inherited risk visible. Here is what the category actually does, how the main tools
            differ, and where a container-focused scanner like ScanRook fits alongside them.
          </p>
        </header>

        <img
          src="/blog/sca-tools.jpg"
          alt="Software composition analysis tools compared"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What SCA tools actually do</h2>
          <p className="text-sm muted">
            Software composition analysis is the discipline of inventorying the third-party
            components in an application and checking them against known risks. A modern SCA tool
            runs through a fairly consistent pipeline: it discovers your declared dependencies,
            resolves the full transitive tree, matches each component and version against
            vulnerability and license databases, then scores and reports what it found. We cover
            the concept in depth in{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              What Is SCA? Software Composition Analysis Explained
            </Link>
            .
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 720 150" width="100%" role="img" aria-label="The SCA pipeline: discover, resolve, match, score, report" className="min-w-[640px]">
              <g fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="12">
                {[
                  { x: 8, label: "Discover", sub: "manifests + lockfiles" },
                  { x: 148, label: "Resolve", sub: "transitive tree" },
                  { x: 288, label: "Match", sub: "CVE + license DBs" },
                  { x: 428, label: "Score", sub: "severity + policy" },
                  { x: 568, label: "Report", sub: "gate / ticket" },
                ].map((s) => (
                  <g key={s.label}>
                    <rect x={s.x} y={44} width={128} height={56} rx={8}
                      fill="var(--dg-accent,#2563eb)" fillOpacity="0.08"
                      stroke="var(--dg-accent,#2563eb)" strokeOpacity="0.5" />
                    <text x={s.x + 64} y={70} textAnchor="middle" fontWeight="600" fill="currentColor">{s.label}</text>
                    <text x={s.x + 64} y={88} textAnchor="middle" fill="currentColor" fillOpacity="0.6" fontSize="10">{s.sub}</text>
                  </g>
                ))}
                {[136, 276, 416, 556].map((x) => (
                  <line key={x} x1={x} y1={72} x2={x + 12} y2={72}
                    stroke="currentColor" strokeOpacity="0.4" strokeWidth="2" markerEnd="url(#arr)" />
                ))}
                <defs>
                  <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" fillOpacity="0.4" />
                  </marker>
                </defs>
                <text x={360} y={128} textAnchor="middle" fill="currentColor" fillOpacity="0.55" fontSize="11">
                  The five stages every SCA tool moves through, from source manifest to CI gate.
                </text>
              </g>
            </svg>
          </div>
          <p className="text-sm muted">
            The value of the tool lives in how well it does each stage. Weak resolution misses
            transitive dependencies. Thin databases miss advisories. Poor scoring buries the two
            findings that matter under two hundred that do not. The differences between tools are
            mostly differences in these details.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The two families of SCA</h2>
          <p className="text-sm muted">
            It helps to split the category by where the tool looks. <strong>Manifest-based</strong>{" "}
            SCA reads declared dependencies from source files &mdash;{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">package-lock.json</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">requirements.txt</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">go.sum</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">pom.xml</code>. It is fast,
            runs in the repo, and tells developers about problems before anything is built. The
            catch is that it only sees what the manifest declares.
          </p>
          <p className="text-sm muted">
            <strong>Artifact-based</strong> SCA reads the components actually present in a built
            thing &mdash; a container image, a binary, a filesystem. It sees the operating-system
            packages a base image installs, vendored libraries a manifest never mentions, and
            binaries with no manifest at all. The tradeoff is that it runs later in the pipeline,
            after a build exists to scan. The two families overlap but do not replace each other,
            which is why teams that care about both the app and its runtime often run one of each.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The main SCA tools, honestly compared</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Tool</th>
                  <th className="text-left py-2 pr-4 font-semibold">Model</th>
                  <th className="text-left py-2 pr-4 font-semibold">Strengths</th>
                  <th className="text-left py-2 font-semibold">Best for</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Dependabot</strong></td>
                  <td className="py-2 pr-4 align-top">Free (GitHub)</td>
                  <td className="py-2 pr-4 align-top">Automated update PRs; zero setup on GitHub</td>
                  <td className="py-2 align-top">GitHub repos wanting fixes, not just alerts</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>OWASP Dependency-Check</strong></td>
                  <td className="py-2 pr-4 align-top">Open source</td>
                  <td className="py-2 pr-4 align-top">CPE-based matching; broad language support</td>
                  <td className="py-2 align-top">Free coverage across many ecosystems</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>OSV-Scanner</strong></td>
                  <td className="py-2 pr-4 align-top">Open source</td>
                  <td className="py-2 pr-4 align-top">Precise version-range matching from OSV</td>
                  <td className="py-2 align-top">Lockfile scanning with low false positives</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Trivy / Grype</strong></td>
                  <td className="py-2 pr-4 align-top">Open source</td>
                  <td className="py-2 pr-4 align-top">Fast; scan images and filesystems, not just manifests</td>
                  <td className="py-2 align-top">Container-first pipelines</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Snyk Open Source</strong></td>
                  <td className="py-2 pr-4 align-top">Commercial</td>
                  <td className="py-2 pr-4 align-top">Reachability, fix PRs, IDE and policy workflows</td>
                  <td className="py-2 align-top">Developer-security platforms at scale</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top"><strong>ScanRook</strong></td>
                  <td className="py-2 pr-4 align-top">Free tier + paid</td>
                  <td className="py-2 pr-4 align-top">Multi-source enrichment; installed-state verification of the built artifact</td>
                  <td className="py-2 align-top">Deep image and binary coverage under audit</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            Native package auditors deserve a mention too. <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">npm audit</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">pip-audit</code>, and{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">cargo audit</code> are SCA
            for a single ecosystem, already installed with your toolchain. They are the cheapest
            possible starting point &mdash; see{" "}
            <Link href="/blog/npm-audit-explained" className="underline">npm audit Explained</Link>{" "}
            for what that class of tool does and does not catch, and{" "}
            <Link href="/blog/owasp-dependency-check-alternatives" className="underline">
              OWASP Dependency-Check Alternatives
            </Link>{" "}
            for a fuller field guide.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">SCA is not SAST</h2>
          <p className="text-sm muted">
            The two get conflated, so it is worth being precise. SAST reads <em>your</em> source
            code for insecure patterns you wrote. SCA reads <em>other people&apos;s</em> code you
            depend on and matches versions against known-vulnerability and license databases. A
            SQL-injection bug in your controller is a SAST finding; a known CVE in a JSON parser
            you imported is an SCA finding. Neither tool sees the other&apos;s problem, which is why
            they coexist. Our{" "}
            <Link href="/blog/sast-vs-dast-explained" className="underline">SAST vs DAST</Link>{" "}
            piece maps the full application-security testing landscape and where SCA sits in it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The false-positive problem</h2>
          <p className="text-sm muted">
            The most common complaint about SCA is noise. A tool reports that a dependency is
            vulnerable, but the vulnerable function is never called from your code, so the finding
            is technically true and practically irrelevant. Two techniques fight this. The first is{" "}
            <strong>reachability analysis</strong>, which traces whether the vulnerable code path is
            actually invoked. The second is <strong>installed-state verification</strong>, which
            confirms the component is genuinely present rather than merely listed. Both narrow the
            report toward findings worth acting on; both are covered in{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              Installed-State Scanning vs. Advisory Matching
            </Link>
            . Whatever tool you pick, plan for a triage step &mdash; no scanner emits a queue that
            is 100% actionable.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Choosing a tool</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>On GitHub with no budget?</strong> Turn on Dependabot alerts and update PRs
              first. It is free, already integrated, and fixes as well as reports.
            </li>
            <li>
              <strong>Shipping containers?</strong> A manifest-only tool will miss every
              OS-package CVE in your base image. Add an artifact scanner that reads the image layers.
            </li>
            <li>
              <strong>Under audit or compliance pressure?</strong> Favor tools with multi-source
              advisory data and clear provenance for each finding, so &ldquo;the scanner did not
              know&rdquo; is not the answer to an auditor.
            </li>
            <li>
              <strong>Drowning in findings?</strong> Prioritize reachability, VEX support, and
              installed-state verification over raw finding counts. More findings is not better if
              they are not real.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook is artifact-based SCA. It scans the built thing &mdash; a container image, an
            ISO, or a binary &mdash; and reads the packages actually installed inside it rather than
            trusting a manifest. Every component is matched against OSV, NVD, and Red Hat OVAL in
            parallel, and each finding carries the source it came from and a confidence tier so you
            can filter to verified-installed matches. That makes it a strong complement to a
            source-level SCA tool: run manifest scanning in the repo for early developer feedback,
            and run ScanRook on the image you are about to ship to catch the OS-layer and vendored
            components a lockfile never sees. It does not replace SAST, and it is not a
            source-reachability engine &mdash; it is the audit-grade view of what your artifact
            really contains.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What are SCA tools?</h3>
              <p className="text-sm muted mt-1">
                Tools that inventory the open-source components in an application and match them
                against known-vulnerability and license databases &mdash; answering what you ship
                and whether any of it carries known risk.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">SCA vs SAST?</h3>
              <p className="text-sm muted mt-1">
                SAST finds bugs in code you wrote; SCA finds known risk in third-party code you
                imported. They cover different parts of the same application, so most programs run
                both.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Are open-source SCA tools enough?</h3>
              <p className="text-sm muted mt-1">
                For most teams, yes. Commercial tools add reachability, curated feeds, and fix
                automation that matter more at scale or under audit.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Do SCA tools scan container images?</h3>
              <p className="text-sm muted mt-1">
                Some do. Manifest-based tools miss OS packages in a base image; artifact scanners
                read the image layers. Cover both to see the whole picture.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">See what your artifact actually contains</h3>
          <p className="text-sm muted leading-relaxed">
            Manifest scanning tells you what you declared. ScanRook scans the built image and
            reads the packages really installed inside it, matched against OSV, NVD, and OVAL &mdash;
            with the source and confidence tier on every finding.
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
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              What Is SCA?
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/owasp-dependency-check-alternatives" className="underline">
              OWASP Dependency-Check Alternatives
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/npm-audit-explained" className="underline">
              npm audit Explained
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
