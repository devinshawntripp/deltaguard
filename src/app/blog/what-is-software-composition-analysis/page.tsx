import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-20";

const title = `What Is SCA? Software Composition Analysis Explained | ${APP_NAME}`;
const description =
  "What SCA (software composition analysis) is: how it inventories open-source components, matches them to known CVEs and licenses, and where it fits vs SAST.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "what is sca",
    "software composition analysis",
    "sca security",
    "sca scanning",
    "sca vs sast",
    "open source vulnerability scanning",
    "dependency scanning",
    "sca tools",
    "known vulnerability scanning",
    "sca and sbom",
  ],
  alternates: { canonical: "/blog/what-is-software-composition-analysis" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/what-is-software-composition-analysis",
    images: ["/blog/what-is-software-composition-analysis.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/what-is-software-composition-analysis.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "What Is SCA? Software Composition Analysis Explained",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/what-is-software-composition-analysis",
  image: "https://scanrook.io/blog/what-is-software-composition-analysis.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is software composition analysis (SCA)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Software composition analysis is the practice of identifying the open-source and third-party components in a codebase or built artifact and then flagging known vulnerabilities and license obligations in them. It answers two questions: what am I actually shipping, and which of those parts have published security or licensing problems?",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between SCA and SAST?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SAST analyzes the code your team wrote to find novel flaws. SCA inventories the third-party components you depend on and matches them against advisory databases to find known CVEs and license issues. Both are static analysis, but they look at different code: SAST at first-party, SCA at everything you pulled in.",
      },
    },
    {
      "@type": "Question",
      name: "How does SCA find vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SCA builds an inventory of components, usually from lockfiles, package manager databases, or binary analysis, then matches each component and version against vulnerability databases like NVD, OSV, and GHSA. A match means that component version has a published CVE. The quality of results depends on how accurately it identifies components and how many advisory sources it consults.",
      },
    },
    {
      "@type": "Question",
      name: "Does SCA only find known vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. SCA matches components against published advisories, so it finds known, catalogued vulnerabilities, not novel flaws. That is a strength for dependency risk, where most exposure comes from unpatched known CVEs, but it means SCA is not a substitute for the static analysis, fuzzing, and testing that discover new bugs in your own code.",
      },
    },
    {
      "@type": "Question",
      name: "Is SCA the same as SBOM generation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They are closely related. An SBOM is the inventory of components; SCA is the inventory plus the vulnerability and license analysis layered on top. Most SCA tools produce an SBOM as a byproduct, and an SBOM can be fed back into SCA to re-check for newly disclosed vulnerabilities without re-scanning.",
      },
    },
  ],
};

const SCA_INPUTS = ["Container image", "Binary / archive", "Lockfile / source tree"];
const SCA_SOURCES = ["NVD", "OSV", "GHSA", "Vendor"];
const SCA_OUTPUTS = ["CVE findings", "License issues", "SBOM export"];

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
            What Is SCA? Software Composition Analysis Explained
          </h1>
          <p className="text-sm muted">Published July 20, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Modern software is assembled more than it is written. The code your team authored is
            usually a thin layer on top of a mountain of open-source dependencies and operating-system
            packages. Software composition analysis &mdash; SCA &mdash; is how you find out what is in
            that mountain and which parts of it are known to be dangerous.
          </p>
        </header>

        <img
          src="/blog/what-is-software-composition-analysis.jpg"
          alt="What is software composition analysis, explained"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A working definition</h2>
          <p className="text-sm muted">
            <strong>Software composition analysis</strong> is the practice of identifying the
            third-party and open-source components in a codebase or built artifact, then flagging
            known vulnerabilities and license obligations in those components. It answers two
            deceptively hard questions: <em>what am I actually shipping</em>, and{" "}
            <em>which of those parts have published security or legal problems?</em>
          </p>
          <p className="text-sm muted">
            The emphasis is on <em>known</em> and <em>third-party</em>. SCA does not hunt for novel
            bugs in code you wrote; it matches the components you assembled against catalogues of
            already-disclosed issues. That focus is not a limitation so much as a specialization,
            because the third-party layer is where most real-world exposure actually lives.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why SCA exists</h2>
          <p className="text-sm muted">
            The reason SCA became a category is simple arithmetic: a typical application is
            overwhelmingly made of code nobody on the team wrote. Between direct dependencies, the
            transitive dependencies those pull in, and the OS packages in a base image, the
            first-party code you actually maintain is often a small fraction of what ships. Every one
            of those inherited pieces can carry a vulnerability, and you did not choose most of them
            consciously.
          </p>
          <p className="text-sm muted">
            Log4Shell made the abstract concrete. A critical flaw in a logging library that
            countless applications depended on &mdash; usually several layers deep, without anyone
            deciding to use it &mdash; turned into a global emergency precisely because so few teams
            could answer &ldquo;are we running it, and where?&rdquo; That question is the SCA
            question, and the broader{" "}
            <Link href="/blog/software-supply-chain-security" className="underline">
              supply-chain risk
            </Link>{" "}
            it exposed is why SCA moved from nice-to-have to baseline.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How SCA works, step by step</h2>
          <p className="text-sm muted">
            Under the hood, every SCA tool runs the same basic pipeline:
          </p>
          <ol className="text-sm muted list-decimal pl-5 grid gap-2">
            <li>
              <strong>Build a component inventory.</strong> The tool discovers what is present &mdash;
              by parsing manifests and lockfiles, reading package-manager databases, or analyzing
              binaries directly. Each component is identified by name, version, and ideally a precise
              coordinate like a package URL.
            </li>
            <li>
              <strong>Match against advisory databases.</strong> Each component and version is
              compared to vulnerability sources such as{" "}
              <Link href="/blog/understanding-nvd-and-cvss" className="underline">
                NVD
              </Link>
              ,{" "}
              <Link href="/blog/what-is-osv" className="underline">
                OSV
              </Link>
              , and GitHub Security Advisories. A match means that exact version has a published CVE.
            </li>
            <li>
              <strong>Check licenses.</strong> The same inventory is checked against license data to
              surface obligations and conflicts &mdash; copyleft terms, incompatible combinations,
              missing attributions.
            </li>
            <li>
              <strong>Report and prioritize.</strong> Findings are output as a list of CVEs and
              license issues, ideally ranked by severity and exploitability so you know what to fix
              first.
            </li>
          </ol>
          <p className="text-sm muted">
            The quality of the whole thing hinges on the first two steps: how accurately the tool
            identifies components, and how many advisory sources it consults. Miss a component and
            you miss every CVE in it; consult one database instead of several and you inherit that
            database&apos;s blind spots.
          </p>
          <figure className="surface-card p-4 overflow-x-auto">
            <svg
              viewBox="0 0 700 270"
              className="w-full"
              style={{ maxWidth: "700px" }}
              role="img"
              aria-label="The SCA pipeline: an artifact or source tree is turned into a component inventory, that single inventory is then matched against advisory databases such as NVD, OSV, GHSA and vendor feeds and separately checked against license data, and the results are reported as CVE findings, license issues and an SBOM export."
            >
              <title>
                The SCA pipeline: artifact to component inventory, then advisory matching and
                license checking off the same inventory, then reporting as CVE findings, license
                issues and an SBOM.
              </title>
              <text x="8" y="20" className="fill-current" fontSize="11" fontWeight="600">
                One inventory, two checks, three outputs
              </text>

              {/* Advisory and license data feeding the matching step */}
              <text
                x="486"
                y="42"
                textAnchor="middle"
                className="fill-current"
                fontSize="9"
                opacity="0.65"
              >
                Advisory + license data
              </text>
              {SCA_SOURCES.map((source, i) => (
                <g key={source}>
                  <rect
                    x={350 + i * 70}
                    y="48"
                    width="62"
                    height="22"
                    rx="6"
                    className="fill-black/[.04] dark:fill-white/[.06] stroke-black/10 dark:stroke-white/10"
                    strokeWidth="1"
                  />
                  <text
                    x={381 + i * 70}
                    y="63"
                    textAnchor="middle"
                    className="fill-current"
                    fontSize="9"
                  >
                    {source}
                  </text>
                </g>
              ))}
              <line
                x1="486"
                y1="72"
                x2="486"
                y2="86"
                className="stroke-current"
                strokeWidth="1.5"
                opacity="0.35"
              />
              <polygon points="481,86 491,86 486,94" className="fill-current" opacity="0.35" />

              {/* Inputs */}
              <rect
                x="8"
                y="94"
                width="132"
                height="110"
                rx="10"
                className="fill-black/[.02] dark:fill-white/[.03] stroke-black/10 dark:stroke-white/10"
                strokeWidth="1"
              />
              <text
                x="74"
                y="112"
                textAnchor="middle"
                className="fill-current"
                fontSize="10"
                fontWeight="600"
              >
                What you scan
              </text>
              {SCA_INPUTS.map((input, i) => (
                <g key={input}>
                  <rect
                    x="16"
                    y={120 + i * 28}
                    width="116"
                    height="22"
                    rx="6"
                    className="fill-black/[.05] dark:fill-white/[.08] stroke-black/10 dark:stroke-white/10"
                    strokeWidth="1"
                  />
                  <text
                    x="74"
                    y={135 + i * 28}
                    textAnchor="middle"
                    className="fill-current"
                    fontSize="8.5"
                  >
                    {input}
                  </text>
                </g>
              ))}
              <line
                x1="142"
                y1="155"
                x2="158"
                y2="155"
                className="stroke-current"
                strokeWidth="1.5"
                opacity="0.35"
              />
              <polygon points="158,150 167,155 158,160" className="fill-current" opacity="0.35" />

              {/* Step 1 - inventory */}
              <rect
                x="170"
                y="120"
                width="150"
                height="80"
                rx="10"
                className="fill-[var(--dg-accent,#2563eb)]/[.06] stroke-[var(--dg-accent,#2563eb)]"
                strokeWidth="1.5"
              />
              <text
                x="245"
                y="142"
                textAnchor="middle"
                className="fill-current"
                fontSize="10.5"
                fontWeight="600"
              >
                1. Build inventory
              </text>
              <text
                x="245"
                y="160"
                textAnchor="middle"
                className="fill-current"
                fontSize="8.5"
                opacity="0.7"
              >
                What is actually present:
              </text>
              <text
                x="245"
                y="173"
                textAnchor="middle"
                className="fill-current"
                fontSize="8.5"
                opacity="0.7"
              >
                name, version, and a
              </text>
              <text
                x="245"
                y="186"
                textAnchor="middle"
                className="fill-current"
                fontSize="8.5"
                opacity="0.7"
              >
                coordinate per component
              </text>

              {/* Split from the inventory into both checks */}
              <polyline
                points="320,160 334,160 334,132 346,132"
                className="stroke-current"
                strokeWidth="1.5"
                fill="none"
                opacity="0.35"
              />
              <polyline
                points="334,160 334,222 346,222"
                className="stroke-current"
                strokeWidth="1.5"
                fill="none"
                opacity="0.35"
              />
              <polygon points="346,127 355,132 346,137" className="fill-current" opacity="0.35" />
              <polygon points="346,217 355,222 346,227" className="fill-current" opacity="0.35" />

              {/* Step 2 - advisory match */}
              <rect
                x="357"
                y="94"
                width="165"
                height="76"
                rx="10"
                className="fill-black/[.04] dark:fill-white/[.06] stroke-black/10 dark:stroke-white/10"
                strokeWidth="1"
              />
              <text
                x="439"
                y="115"
                textAnchor="middle"
                className="fill-current"
                fontSize="10.5"
                fontWeight="600"
              >
                2. Match advisories
              </text>
              <text
                x="439"
                y="133"
                textAnchor="middle"
                className="fill-current"
                fontSize="8.5"
                opacity="0.7"
              >
                Every component version
              </text>
              <text
                x="439"
                y="146"
                textAnchor="middle"
                className="fill-current"
                fontSize="8.5"
                opacity="0.7"
              >
                against every source
              </text>
              <text
                x="439"
                y="159"
                textAnchor="middle"
                className="fill-current"
                fontSize="8.5"
                opacity="0.7"
              >
                you consult
              </text>

              {/* Step 3 - license check */}
              <rect
                x="357"
                y="190"
                width="165"
                height="64"
                rx="10"
                className="fill-black/[.04] dark:fill-white/[.06] stroke-black/10 dark:stroke-white/10"
                strokeWidth="1"
              />
              <text
                x="439"
                y="211"
                textAnchor="middle"
                className="fill-current"
                fontSize="10.5"
                fontWeight="600"
              >
                3. Check licenses
              </text>
              <text
                x="439"
                y="229"
                textAnchor="middle"
                className="fill-current"
                fontSize="8.5"
                opacity="0.7"
              >
                The same inventory against
              </text>
              <text
                x="439"
                y="242"
                textAnchor="middle"
                className="fill-current"
                fontSize="8.5"
                opacity="0.7"
              >
                obligations and conflicts
              </text>

              {/* Both checks converge on the report */}
              <polyline
                points="522,132 537,132 537,172 548,172"
                className="stroke-current"
                strokeWidth="1.5"
                fill="none"
                opacity="0.35"
              />
              <polyline
                points="522,222 537,222 537,172"
                className="stroke-current"
                strokeWidth="1.5"
                fill="none"
                opacity="0.35"
              />
              <polygon points="548,167 557,172 548,177" className="fill-current" opacity="0.35" />

              {/* Step 4 - report */}
              <rect
                x="559"
                y="110"
                width="133"
                height="124"
                rx="10"
                className="fill-black/[.02] dark:fill-white/[.03] stroke-black/10 dark:stroke-white/10"
                strokeWidth="1"
              />
              <text
                x="625"
                y="130"
                textAnchor="middle"
                className="fill-current"
                fontSize="10.5"
                fontWeight="600"
              >
                4. Report
              </text>
              {SCA_OUTPUTS.map((output, i) => (
                <g key={output}>
                  <rect
                    x="567"
                    y={140 + i * 28}
                    width="117"
                    height="22"
                    rx="6"
                    className="fill-black/[.05] dark:fill-white/[.08] stroke-black/10 dark:stroke-white/10"
                    strokeWidth="1"
                  />
                  <text
                    x="625"
                    y={155 + i * 28}
                    textAnchor="middle"
                    className="fill-current"
                    fontSize="8.5"
                  >
                    {output}
                  </text>
                </g>
              ))}
            </svg>
            <figcaption className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Structural diagram of the SCA pipeline described above. Note that steps 2 and 3 both
              read the <em>same</em> component inventory produced in step 1 &mdash; which is why a
              component missed during inventory is invisible to both the vulnerability matching and
              the license analysis, and why the SBOM and the findings always describe the same set
              of parts. No counts or timings are implied.
            </figcaption>
          </figure>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Two flavors: manifest vs installed-state
          </h2>
          <p className="text-sm muted">
            SCA tools split roughly into two camps by how they build the inventory. The distinction
            matters more than it sounds:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Manifest-based.</strong> The tool reads declared dependencies from lockfiles
              (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">package-lock.json</code>,{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">go.sum</code>,
              and so on). This is fast and precise for what is declared, but it trusts the manifest
              to reflect reality &mdash; and vendored, bundled, or hand-copied dependencies do not
              show up.
            </li>
            <li>
              <strong>Installed-state / binary.</strong> The tool reads what is actually present in
              the built artifact &mdash; the real package databases in a container image, the
              libraries linked into a binary, the JARs nested inside other JARs. It catches the
              dependencies a manifest never mentions, which is exactly where things like a shaded
              Log4j copy hide.
            </li>
          </ul>
          <p className="text-sm muted">
            The tradeoff is coverage versus convenience, and we make the case for reading real
            installed state in{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state vs advisory matching
            </Link>
            . For a shipped container, what is on disk is the truth; what a manifest claims is a
            best guess.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">SCA is not just about CVEs</h2>
          <p className="text-sm muted">
            License compliance is the quiet other half of SCA. The same component inventory that
            feeds vulnerability matching also feeds license analysis &mdash; and a copyleft
            obligation you missed or an incompatible license combination can be as expensive as a
            security bug, just on a different timeline. Teams that adopt SCA for security often find
            the license reporting becomes just as load-bearing; our{" "}
            <Link href="/blog/open-source-license-compliance-guide" className="underline">
              open-source license compliance guide
            </Link>{" "}
            covers that side in depth.
          </p>
          <p className="text-sm muted">
            The inventory itself is valuable as an artifact. Most SCA tools emit a{" "}
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              software bill of materials
            </Link>{" "}
            (SBOM) as a byproduct, and that SBOM can be re-checked against advisory data later
            &mdash; so when a new CVE lands tomorrow, you can answer &ldquo;are we affected?&rdquo;
            without re-scanning everything.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The limits worth knowing</h2>
          <p className="text-sm muted">
            SCA is powerful within its lane, and misunderstanding the lane leads to false confidence:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Known-only.</strong> SCA finds catalogued vulnerabilities. A zero-day in a
              dependency is invisible until it is disclosed &mdash; then SCA finds it immediately.
            </li>
            <li>
              <strong>Database-bound.</strong> Coverage is only as good as the advisory sources
              consulted. Different databases know about different CVEs, which is why{" "}
              <Link href="/blog/cve-database-comparison" className="underline">
                source coverage
              </Link>{" "}
              is the single biggest quality lever.
            </li>
            <li>
              <strong>Reachability blindness.</strong> A CVE in a dependency you never call is real
              but not exploitable. SCA flags the presence of the flaw, not whether your code path
              reaches it &mdash; which is what VEX data and reachability analysis try to resolve.
            </li>
            <li>
              <strong>Not a code scanner.</strong> SCA will not find a fresh injection bug in your
              own controllers. That is the job of static analysis and testing, and SCA complements
              rather than replaces them.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How ScanRook does SCA</h2>
          <p className="text-sm muted">
            ScanRook is an SCA scanner built around the installed-state approach, aimed at built
            artifacts: container images, binaries, ISO images, and source archives. It reads the
            real package databases and unpacks nested archives to build an inventory of what is
            genuinely present, then matches every component against OSV, NVD, and Red Hat OVAL in
            parallel. Because different databases surface different advisories, querying several at
            once is how it avoids the single-source blind spots that shrink a scan&apos;s finding
            count. Each finding carries the source it came from and a confidence tier, and the same
            inventory backs the SBOM output &mdash; so the composition analysis and the audit
            artifact stay in sync.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What does SCA stand for?</h3>
              <p className="text-sm muted mt-1">
                Software composition analysis &mdash; analyzing the composition of your software,
                meaning the third-party and open-source parts it is built from.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is container scanning a form of SCA?</h3>
              <p className="text-sm muted mt-1">
                Yes. Scanning a container image for known vulnerabilities in its OS packages and
                libraries is SCA applied to a built artifact rather than a source tree.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does SCA replace SAST or DAST?</h3>
              <p className="text-sm muted mt-1">
                No. SCA covers third-party components; SAST covers your own code and DAST covers
                runtime behavior. A complete program runs all three because they see different risk.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Do I need an SBOM to run SCA?</h3>
              <p className="text-sm muted mt-1">
                No &mdash; the tool builds its own inventory. But SCA usually produces an SBOM as
                output, which you can store and re-check against new advisories over time.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Run SCA on what you actually ship</h3>
          <p className="text-sm muted leading-relaxed">
            The components in a shipped container rarely match the manifest that built it. ScanRook
            reads the real installed state of your images, binaries, and archives and matches every
            component against OSV, NVD, and vendor advisory data &mdash; known CVEs and licenses,
            with a confidence tier on each finding and an SBOM out the other side.
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
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              Installed-State vs Advisory Matching
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/cve-database-comparison" className="underline">
              CVE Database Comparison
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
