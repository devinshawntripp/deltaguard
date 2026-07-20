import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-05";

const title = `Dependency-Track: Continuous SBOM Analysis | ${APP_NAME}`;
const description =
  "How OWASP Dependency-Track works: SBOM ingestion, the analyzers behind its findings, policy and VEX support, CI upload patterns, and where it fits next to a scanner.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "dependency track",
    "owasp dependency-track",
    "dependency track sbom",
    "dependency track vs dependency check",
    "cyclonedx dependency track",
    "sbom management platform",
    "continuous component analysis",
    "dependency track api",
    "dependency track ci",
    "software composition analysis platform",
  ],
  alternates: { canonical: "/blog/dependency-track" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/dependency-track",
    images: ["/blog/dependency-track.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/dependency-track.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Dependency-Track: Continuous SBOM Analysis",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/dependency-track",
  image: "https://scanrook.io/blog/dependency-track.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Dependency-Track?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "OWASP Dependency-Track is an open-source component analysis platform. It ingests Software Bills of Materials, keeps an inventory of every component across your whole portfolio of projects, and continuously re-evaluates that inventory against vulnerability and policy data. It is a server you run, not a command-line scanner, and its unit of input is an SBOM rather than an image or a repository.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between Dependency-Track and Dependency-Check?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They are different tools despite the similar names. Dependency-Check is a scanner that inspects a project's dependencies during a build and produces a report for that build. Dependency-Track is a platform that stores SBOMs for many projects and re-analyses them continuously, so a component that becomes vulnerable next month surfaces without anyone rerunning a build.",
      },
    },
    {
      "@type": "Question",
      name: "Does Dependency-Track generate SBOMs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. It consumes them. You generate a CycloneDX SBOM with whatever tool suits your build, then upload it to Dependency-Track's API. That separation is deliberate: generation is language and ecosystem specific, while storage, analysis, and policy are not.",
      },
    },
    {
      "@type": "Question",
      name: "Which vulnerability sources does Dependency-Track use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It maintains an internal vulnerability database mirrored from public sources including the NVD, GitHub Security Advisories, OSV, and distribution data, and it can additionally query external analyzers such as Sonatype OSS Index. Which sources are enabled is configurable per deployment, and the set has expanded across releases, so check your version's configuration page.",
      },
    },
    {
      "@type": "Question",
      name: "How do you upload an SBOM to Dependency-Track from CI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Post the SBOM file to the /api/v1/bom endpoint with an X-Api-Key header, supplying a project name and version. With autoCreate enabled the project is created on first upload. The response returns a processing token you can poll to know when analysis has finished before querying findings.",
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
          <div className="text-xs uppercase tracking-wide muted">Integrations</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Dependency-Track: Continuous SBOM Analysis
          </h1>
          <p className="text-sm muted">Published October 5, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Most vulnerability tooling answers a question at build time and then goes quiet.
            Dependency Track inverts that: you give it a Software Bill of Materials once, and it
            keeps re-evaluating that inventory as new advisories publish. If your problem is not
            &ldquo;is this build clean&rdquo; but &ldquo;which of our two hundred services contains
            the library that broke this morning&rdquo;, this is the shape of tool you need.
          </p>
        </header>

        <img
          src="/blog/dependency-track.jpg"
          alt="Dependency-Track analysing a software dependency graph from an SBOM"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Dependency-Track is</h2>
          <p className="text-sm muted">
            OWASP Dependency-Track is an open-source component analysis platform. It is a server &mdash;
            an API service plus a web frontend, backed by a database &mdash; that maintains a
            portfolio of projects, each with an inventory of the components it contains. You upload
            SBOMs; it stores, analyses, and keeps watching them.
          </p>
          <p className="text-sm muted">
            Two clarifications up front, because both trip people up. First, it does{" "}
            <strong>not generate SBOMs</strong>. Generation is ecosystem-specific work handled by
            other tools; Dependency-Track deliberately starts one step later. Second, despite the
            name, it is <strong>not OWASP Dependency-Check</strong>. Dependency-Check is a build-time
            scanner producing a per-build report. Dependency-Track is a system of record that outlives
            any individual build &mdash; a distinction we also draw in{" "}
            <Link href="/blog/owasp-dependency-check-alternatives" className="underline">
              OWASP Dependency-Check alternatives
            </Link>
            .
          </p>
          <p className="text-sm muted">
            Its input format is CycloneDX, which is unsurprising given both projects live under
            OWASP. If your pipeline currently produces SPDX, the comparison in{" "}
            <Link href="/blog/cyclonedx-vs-spdx" className="underline">CycloneDX vs SPDX</Link>{" "}
            explains what differs between the two and why security tooling has largely converged on
            the former.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How the analysis loop works</h2>
          <p className="text-sm muted">
            The mechanism worth understanding is the loop, not the upload. An SBOM arrives once; the
            evaluation happens continuously.
          </p>
          <figure className="grid gap-2">
            <div className="overflow-x-auto surface-card p-4">
              <svg
                viewBox="0 0 700 250"
                role="img"
                aria-label="Dependency-Track flow: a build produces an SBOM which is uploaded once to a portfolio inventory, then continuously re-evaluated against mirrored vulnerability sources and policies to produce findings and notifications"
                className="w-full"
                style={{ minWidth: 560 }}
              >
                <defs>
                  <marker id="dt-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                  </marker>
                </defs>

                <rect x={8} y={30} width={124} height={50} rx={8} fill="transparent" stroke="currentColor" strokeOpacity={0.45} />
                <text x={70} y={52} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="currentColor">Build</text>
                <text x={70} y={69} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.6}>emits SBOM</text>

                <line x1={134} y1={55} x2={196} y2={55} stroke="currentColor" strokeWidth={2} markerEnd="url(#dt-arrow)" />
                <text x={165} y={47} textAnchor="middle" fontSize="9.5" fill="currentColor" fillOpacity={0.55}>once</text>

                <rect x={204} y={22} width={200} height={66} rx={9} fill="var(--dg-accent,#2563eb)" fillOpacity={0.12} stroke="currentColor" strokeOpacity={0.5} />
                <text x={304} y={48} textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">Portfolio inventory</text>
                <text x={304} y={67} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.6}>projects × components</text>

                <line x1={406} y1={55} x2={468} y2={55} stroke="currentColor" strokeWidth={2} markerEnd="url(#dt-arrow)" />
                <rect x={476} y={22} width={212} height={66} rx={9} fill="transparent" stroke="currentColor" strokeOpacity={0.45} />
                <text x={582} y={48} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="currentColor">Findings + policy violations</text>
                <text x={582} y={67} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.6}>notifications, metrics</text>

                <rect x={204} y={122} width={200} height={38} rx={7} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.3} />
                <text x={304} y={146} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.75}>mirrored advisory sources</text>
                <line x1={304} y1={122} x2={304} y2={94} stroke="currentColor" strokeWidth={2} markerEnd="url(#dt-arrow)" />

                <rect x={204} y={178} width={200} height={38} rx={7} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.3} />
                <text x={304} y={202} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.75}>policies: security, licence, ops</text>
                <line x1={304} y1={178} x2={304} y2={166} stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.4} />

                <path d="M582 90 L582 232 L304 232" fill="none" stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.45} strokeDasharray="4 3" />
                <path d="M304 232 L120 232 L120 82" fill="none" stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.45} strokeDasharray="4 3" markerEnd="url(#dt-arrow)" />
                <text x={430} y={245} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.55}>re-analysis on new advisory data — no rebuild required</text>
              </svg>
            </div>
            <figcaption className="text-xs muted">
              The SBOM is uploaded once. Everything downstream of the inventory re-runs as advisory
              data changes, which is what distinguishes a platform from a build-time scan.
            </figcaption>
          </figure>
          <p className="text-sm muted">
            Findings come from several analyzers working over the same inventory. An internal
            vulnerability database is mirrored from public sources &mdash; the NVD, GitHub Security
            Advisories, OSV and related feeds, with the exact set depending on your version and
            configuration &mdash; and matching happens locally against it. External analyzers such as
            Sonatype OSS Index can be enabled to query remote services for additional coverage.
            Matching keys on Package URL identifiers, which is why an SBOM with poor{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">purl</code>{" "}
            coverage produces disappointing results regardless of how good the platform is.
          </p>
        </section>

        <img
          src="/blog/dependency-track-2.jpg"
          alt="Continuous monitoring of software components for newly published vulnerabilities"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Uploading SBOMs from CI</h2>
          <p className="text-sm muted">
            The integration surface is a REST API with API-key authentication. The core call posts a
            BOM against a project name and version; with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">autoCreate</code>{" "}
            the project is created on first sight, so onboarding a new service is zero manual setup:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`# 1. generate a CycloneDX SBOM with whatever suits the ecosystem
#    (this step is not Dependency-Track's job)

# 2. upload it
TOKEN=$(curl -sS -X POST "https://dtrack.example.com/api/v1/bom" \\
  -H "X-Api-Key: $DT_API_KEY" \\
  -F "autoCreate=true" \\
  -F "projectName=payments-api" \\
  -F "projectVersion=1.9.0" \\
  -F "bom=@bom.json" | jq -r .token)

# 3. wait for processing to finish before asking for findings
until [ "$(curl -sS -H "X-Api-Key: $DT_API_KEY" \\
      "https://dtrack.example.com/api/v1/bom/token/$TOKEN" | jq -r .processing)" = "false" ]; do
  sleep 5
done`}
          </pre>
          <p className="text-sm muted">
            That polling step matters more than it looks. Ingestion is asynchronous, so a CI job that
            uploads and immediately queries findings will read a stale or empty result and cheerfully
            pass. Wait for the token to report that processing has completed, then fetch findings for
            the project and apply whatever gate you want:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`curl -sS -H "X-Api-Key: $DT_API_KEY" \\
  "https://dtrack.example.com/api/v1/finding/project/$PROJECT_UUID" \\
  | jq '[.[] | select(.vulnerability.severity == "CRITICAL")] | length'`}
          </pre>
          <p className="text-sm muted">
            There are also maintained CI integrations &mdash; a GitHub Action, a Jenkins plugin, and
            a community CLI &mdash; that wrap the same endpoints. Use them if they fit; the raw API
            is small enough that a shell script is a perfectly reasonable alternative and is easier to
            debug. For the generation half of the pipeline, see{" "}
            <Link href="/blog/sbom-generation-in-ci" className="underline">generating SBOMs in CI</Link>.
          </p>
          <p className="text-sm muted">
            An API key is scoped by team permissions. Give CI a key that can upload BOMs and read
            findings and nothing else &mdash; the permission model is fine-grained enough to make
            that easy, and a build token that can delete projects is an accident waiting to happen.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Policies, VEX, and keeping the noise down</h2>
          <p className="text-sm muted">
            Dependency-Track&apos;s policy engine covers three categories, and only one is about
            CVEs. <strong>Security</strong> policies act on severity or specific vulnerabilities.{" "}
            <strong>Licence</strong> policies flag components whose licence falls outside an approved
            group &mdash; genuinely useful, and the subject of our{" "}
            <Link href="/blog/open-source-license-compliance-guide" className="underline">
              open-source licence compliance guide
            </Link>
            . <strong>Operational</strong> policies act on properties such as component age, version,
            or coordinates, which catches the unmaintained-dependency problem that no CVE feed will
            ever report.
          </p>
          <p className="text-sm muted">
            Findings carry an audit trail. An analyst can mark a finding as not affected, false
            positive, or accepted risk with a justification, and that decision persists across
            re-analysis instead of reappearing every time the inventory is re-evaluated. The platform
            also supports{" "}
            <Link href="/blog/vex-explained" className="underline">VEX</Link> documents, so
            exploitability assertions produced elsewhere &mdash; by an upstream vendor, or by your own
            reachability analysis &mdash; can suppress findings that do not apply to how you actually
            use a component. In a large portfolio this is the difference between a usable tool and a
            dashboard nobody opens.
          </p>
          <p className="text-sm muted">
            Prioritisation support has grown too, including EPSS data alongside CVSS. As we argue in{" "}
            <Link href="/blog/epss-scores-explained" className="underline">EPSS scores explained</Link>,
            severity alone is a poor queue order; likelihood of exploitation is what separates the
            twelve findings that matter this week from the eight hundred that do not.
          </p>
        </section>

        <img
          src="/blog/dependency-track-3.jpg"
          alt="Portfolio-wide component inventory with vulnerable components highlighted"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What it is good at, and what it is not</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Strong</th>
                  <th className="text-left py-2 font-semibold">Weak</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Portfolio-wide search: which projects contain component X</td>
                  <td className="py-2 align-top">Nothing to analyse until something else produces an SBOM</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Continuous re-analysis without rebuilding anything</td>
                  <td className="py-2 align-top">Findings inherit the SBOM&apos;s blind spots exactly</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Durable audit decisions and VEX-driven suppression</td>
                  <td className="py-2 align-top">A server to run, upgrade, and back up &mdash; not a CLI</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">Licence and operational policy alongside security</td>
                  <td className="py-2 align-top">Matching quality depends heavily on purl completeness</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            That second row is the one to internalise. Dependency-Track can only see what the SBOM
            describes. If your generator missed the OS packages inside a container image, or recorded
            a component without a resolvable Package URL, no amount of platform quality recovers it.
            Garbage in, confidently rendered garbage out &mdash; which is why{" "}
            <Link href="/blog/how-to-read-sbom" className="underline">reading an SBOM critically</Link>{" "}
            is a skill worth having before you trust a portfolio dashboard built on top of one.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Running it: what to plan for</h2>
          <p className="text-sm muted">
            Dependency-Track is a server, and adopting it means owning one. The shape of that
            commitment is worth knowing before you start.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Components.</strong> An API server and a frontend, backed by a relational
              database. A bundled distribution exists that packages both together, which is the
              fastest way to evaluate; separate the pieces when you move to production so they can be
              scaled and upgraded independently.
            </li>
            <li>
              <strong>Memory, not CPU, is usually the constraint.</strong> Analysis works over the
              whole portfolio, so requirements grow with the number of projects and components rather
              than with upload frequency. Give the JVM real headroom and revisit it as the portfolio
              grows.
            </li>
            <li>
              <strong>The first mirror sync is slow.</strong> Populating the internal vulnerability
              database from upstream sources takes a while on a fresh install, and findings will look
              sparse until it completes. Do not judge coverage on day one.
            </li>
            <li>
              <strong>Configure an NVD API key.</strong> Unauthenticated NVD access is heavily rate
              limited, which makes mirroring painful. Our{" "}
              <Link href="/blog/nvd-api-key-guide" className="underline">NVD API key guide</Link>{" "}
              covers obtaining and using one.
            </li>
            <li>
              <strong>Model your project hierarchy deliberately.</strong> Project name and version
              are the identity used on upload, and getting that convention wrong early produces a
              portfolio full of near-duplicate projects that is tedious to unpick. Decide whether a
              version means a release, a branch, or an environment, and hold the line.
            </li>
            <li>
              <strong>Wire up notifications early.</strong> The platform can publish alerts to chat,
              email, or webhooks on new vulnerabilities and policy violations. Without them, the
              continuous re-analysis loop only helps people who remember to open the dashboard, which
              defeats most of the point.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            We sit upstream, and the two are complementary rather than competing. ScanRook opens the
            artifact itself &mdash; a container image tarball, a compiled binary, a source archive
            &mdash; and reads the real package databases inside it rather than inferring contents
            from a manifest. That produces the component inventory a platform like Dependency-Track
            needs, and it produces it for the layers a language-ecosystem SBOM generator typically
            misses, such as the distribution packages in the base image.
          </p>
          <p className="text-sm muted">
            ScanRook also matches every component against OSV, NVD, and Red Hat OVAL in parallel, with
            each finding carrying its originating source and a confidence tier, which is useful as a
            cross-check on any single-source platform verdict. A reasonable division of labour: scan
            the artifact to get an accurate inventory and an immediate build-time gate, then feed
            that inventory into Dependency-Track for portfolio-level tracking and the re-analysis
            loop. Our note on{" "}
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              how ScanRook uses SBOMs
            </Link>{" "}
            covers the formats we emit, and{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              what software composition analysis actually means
            </Link>{" "}
            sets out the wider category.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is Dependency-Track?</h3>
              <p className="text-sm muted mt-1">
                An OWASP component analysis platform that ingests SBOMs, keeps a portfolio-wide
                component inventory, and continuously re-evaluates it against advisory and policy
                data.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is it the same as Dependency-Check?</h3>
              <p className="text-sm muted mt-1">
                No. Dependency-Check scans a build and produces a report. Dependency-Track stores
                SBOMs for many projects and re-analyses them over time.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does it create SBOMs?</h3>
              <p className="text-sm muted mt-1">
                No &mdash; it consumes CycloneDX SBOMs produced by other tooling. Generation stays
                where the ecosystem knowledge lives.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why are my findings sparse?</h3>
              <p className="text-sm muted mt-1">
                Usually missing or malformed Package URLs in the uploaded SBOM. Matching keys on
                purls, so incomplete identifiers mean silent misses.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Better inventory in, better portfolio out</h3>
          <p className="text-sm muted leading-relaxed">
            A component analysis platform is only as good as the inventory it is fed. ScanRook reads
            the real package databases inside an image &mdash; including the OS layer most generators
            miss &mdash; and matches every component against OSV, NVD, and Red Hat OVAL.
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
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              What Is an SBOM?
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/cyclonedx-vs-spdx" className="underline">
              CycloneDX vs SPDX
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/vex-explained" className="underline">
              VEX Explained
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
