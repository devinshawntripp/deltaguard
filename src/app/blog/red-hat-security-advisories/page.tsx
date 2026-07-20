import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-24";

const title = `Red Hat Security Advisories: RHSA, OVAL and CSAF | ${APP_NAME}`;
const description =
  "How Red Hat security advisories work: RHSA errata, the four-level severity scale, per-CVE affected states, and the OVAL, CSAF and VEX data behind them.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "red hat security advisories",
    "rhsa",
    "red hat errata",
    "red hat oval",
    "red hat csaf",
    "red hat vex",
    "rhel vulnerability data",
    "red hat security data api",
    "rhsa severity ratings",
    "red hat cve page",
  ],
  alternates: { canonical: "/blog/red-hat-security-advisories" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/red-hat-security-advisories",
    images: ["/blog/red-hat-security-advisories.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/red-hat-security-advisories.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Red Hat Security Advisories: RHSA, OVAL and CSAF Explained",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/red-hat-security-advisories",
  image: "https://scanrook.io/blog/red-hat-security-advisories.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is an RHSA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An RHSA is a Red Hat Security Advisory: an erratum announcing that fixed packages are available for one or more CVEs on specific Red Hat products. It carries an identifier like RHSA-2024:1234, a Red Hat severity rating, the list of CVEs it addresses, and the exact package versions that contain the fix.",
      },
    },
    {
      "@type": "Question",
      name: "How does Red Hat's severity scale relate to CVSS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They are separate. Red Hat rates advisories on a four-level qualitative scale — Critical, Important, Moderate, Low — that reflects how the flaw behaves as shipped in Red Hat products. A CVSS base score describes the flaw generically. The two often agree, but Red Hat may rate a vulnerability lower when its configuration or build options reduce the practical impact.",
      },
    },
    {
      "@type": "Question",
      name: "Why do Red Hat package versions look unpatched?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Because Red Hat backports fixes rather than rebasing to new upstream releases. A package can carry an upstream version that looks vulnerable while containing the security fix, distinguished only by the Red Hat release suffix. Comparing the upstream version number against an advisory's fixed-in version produces false positives on RHEL-based images.",
      },
    },
    {
      "@type": "Question",
      name: "What machine-readable formats does Red Hat publish?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Red Hat publishes OVAL definitions for evaluating whether an installed package is affected, CSAF documents describing advisories in a standard structured format, and VEX files stating per-product exploitability for individual CVEs. A Security Data API also exposes advisory and CVE records as JSON.",
      },
    },
    {
      "@type": "Question",
      name: "What does 'Will not fix' mean on a Red Hat CVE page?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It means Red Hat has assessed the flaw as affecting that product but has decided not to ship a fix, usually because the impact is low or the product is late in its lifecycle. It is an explicit, published decision rather than an omission, and it is distinct from 'Not affected', 'Fix deferred', and 'Under investigation'.",
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
          <div className="text-xs uppercase tracking-wide muted">Data sources</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Red Hat Security Advisories: RHSA, OVAL and CSAF Explained
          </h1>
          <p className="text-sm muted">Published December 24, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            Red Hat security advisories are the authoritative statement of what is vulnerable on RHEL
            and its derivatives, and they are structured differently enough from NVD-style data that
            treating them as interchangeable is one of the more common causes of wrong scan results.
            This is a tour of what an RHSA contains, how Red Hat&apos;s severity and affected-state
            vocabulary works, and which machine-readable feed you should actually be consuming.
          </p>
        </header>

        <img
          src="/blog/red-hat-security-advisories.jpg"
          alt="Red Hat security advisory records streaming into a structured vulnerability archive"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What an RHSA is</h2>
          <p className="text-sm muted">
            Red Hat publishes <em>errata</em> &mdash; notices that updated packages are available. They
            come in three flavours: RHSA for security fixes, RHBA for bug fixes, and RHEA for
            enhancements. Only the first is a security advisory, and its identifier follows the shape{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              RHSA-2024:1234
            </code>{" "}
            &mdash; year, colon, sequence number.
          </p>
          <p className="text-sm muted">An RHSA record ties together four things:</p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>The CVEs it addresses.</strong> One advisory frequently fixes several CVEs at
              once, and one CVE is frequently fixed by several advisories &mdash; one per affected
              product and major version. The relationship is many-to-many, which is the first thing
              that surprises people coming from a one-CVE-one-record mental model.
            </li>
            <li>
              <strong>The products and versions affected.</strong> Advisories are scoped to specific
              Red Hat products and streams, not to &ldquo;Linux&rdquo; in general.
            </li>
            <li>
              <strong>The fixed package versions.</strong> Expressed as full RPM identity &mdash; name,
              epoch, version, release, architecture &mdash; which is what actually lets you decide
              whether an installed package is patched.
            </li>
            <li>
              <strong>A Red Hat severity rating</strong> for the advisory as a whole.
            </li>
          </ul>
          <p className="text-sm muted">
            Alongside errata, Red Hat maintains a page per CVE describing its own assessment of that
            flaw across its product line. That page is often more useful than the advisory, because it
            tells you about products where <em>no</em> fix was shipped and why.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Severity is not CVSS</h2>
          <p className="text-sm muted">
            Red Hat rates security issues on a four-level qualitative scale: <strong>Critical</strong>,{" "}
            <strong>Important</strong>, <strong>Moderate</strong>, <strong>Low</strong>. This is a
            separate judgement from the CVSS base score, which Red Hat also publishes.
          </p>
          <p className="text-sm muted">
            The distinction matters in practice. A CVSS base score describes a flaw in the abstract, as
            the upstream project ships it. Red Hat&apos;s rating describes the flaw <em>as built and
            configured in Red Hat products</em> &mdash; which compiler hardening was applied, whether
            the vulnerable feature is enabled by default, whether SELinux constrains the outcome.
            Roughly, Critical is reserved for flaws that can be exploited remotely by an unauthenticated
            attacker with little user interaction; Important covers flaws that compromise
            confidentiality, integrity, or availability of resources; Moderate and Low are increasingly
            constrained by mitigating circumstances.
          </p>
          <p className="text-sm muted">
            When a scanner reports a critical CVSS score and Red Hat rates the same CVE Moderate, both
            are correct and the Red Hat rating is the one relevant to your RHEL host. This is the same
            class of context that{" "}
            <Link href="/blog/understanding-nvd-and-cvss" className="underline">
              CVSS scoring
            </Link>{" "}
            deliberately leaves out.
          </p>
        </section>

        <img
          src="/blog/red-hat-security-advisories-2.jpg"
          alt="Backported security patches grafted into a held package version stream"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The affected-state vocabulary</h2>
          <p className="text-sm muted">
            Red Hat states, per product and per CVE, what it intends to do. That vocabulary is a real
            asset for triage, because it removes ambiguity that other data sources leave open:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">State</th>
                  <th className="text-left py-2 font-semibold">What it tells you</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Affected</strong></td>
                  <td className="py-2 align-top">
                    The product contains the flaw. A fix is planned or already shipped via an RHSA.
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Not affected</strong></td>
                  <td className="py-2 align-top">
                    The vulnerable code is absent, disabled, or never built in that product. A finding
                    against it is a false positive.
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Fix deferred</strong></td>
                  <td className="py-2 align-top">
                    Real, acknowledged, not yet scheduled. Treat as an open risk that needs your own
                    mitigation decision.
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Will not fix</strong></td>
                  <td className="py-2 align-top">
                    Acknowledged and deliberately not being fixed &mdash; usually low impact or a
                    product late in its lifecycle. No RHSA will arrive.
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top"><strong>Under investigation</strong></td>
                  <td className="py-2 align-top">
                    Assessment in progress. Absence of a fix here means &ldquo;not yet known&rdquo;,
                    not &ldquo;safe&rdquo;.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            &ldquo;Not affected&rdquo; is the most valuable of these, and it is essentially a{" "}
            <Link href="/blog/vex-explained" className="underline">
              VEX
            </Link>{" "}
            statement published by the vendor &mdash; which is exactly what Red Hat now emits in VEX
            format. A scanner that consumes it can suppress a finding on evidence rather than on a
            local guess.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The formats: OVAL, CSAF, VEX, and the API</h2>
          <p className="text-sm muted">
            Human-readable advisory pages are not what a scanner should consume. Red Hat publishes
            several structured feeds, and picking the right one determines how accurate your results
            are.
          </p>

          <figure className="grid gap-2">
            <div className="overflow-x-auto surface-card p-4">
              <svg
                viewBox="0 0 720 250"
                role="img"
                aria-label="Layered view of Red Hat vulnerability data: a CVE assessment produces per-product states, which produce RHSA errata and fixed RPM versions, published as OVAL, CSAF, VEX and a JSON API"
                className="w-full"
                style={{ minWidth: 600 }}
              >
                {[
                  { y: 12, label: "CVE assessment", sub: "Red Hat analyses the flaw in its products" },
                  { y: 74, label: "per-product state", sub: "affected / not affected / will not fix" },
                  { y: 136, label: "RHSA erratum", sub: "fixed package NEVRA per product stream", hot: true },
                ].map((r) => (
                  <g key={r.label}>
                    <rect
                      x={16}
                      y={r.y}
                      width={330}
                      height={48}
                      rx={8}
                      fill={r.hot ? "var(--dg-accent,#2563eb)" : "currentColor"}
                      fillOpacity={r.hot ? 0.13 : 0.06}
                      stroke="currentColor"
                      strokeOpacity={0.4}
                    />
                    <text x={34} y={r.y + 22} fontSize="13" fontWeight="600" fill="currentColor">
                      {r.label}
                    </text>
                    <text x={34} y={r.y + 39} fontSize="10.5" fill="currentColor" fillOpacity={0.62}>
                      {r.sub}
                    </text>
                  </g>
                ))}
                {[60, 122].map((y) => (
                  <line
                    key={y}
                    x1={181}
                    y1={y}
                    x2={181}
                    y2={y + 14}
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeOpacity={0.6}
                  />
                ))}

                <rect
                  x={392}
                  y={12}
                  width={312}
                  height={172}
                  rx={8}
                  fill="currentColor"
                  fillOpacity={0.04}
                  stroke="currentColor"
                  strokeOpacity={0.3}
                  strokeDasharray="4 3"
                />
                <text x={548} y={34} textAnchor="middle" fontSize="11.5" fill="currentColor" fillOpacity={0.75}>
                  published as
                </text>
                {[
                  { y: 48, name: "OVAL", use: "evaluate an installed RPM" },
                  { y: 82, name: "CSAF", use: "structured advisory documents" },
                  { y: 116, name: "VEX", use: "per-CVE exploitability status" },
                  { y: 150, name: "Security Data API", use: "JSON queries over both" },
                ].map((f) => (
                  <g key={f.name}>
                    <circle cx={412} cy={f.y + 10} r={4} fill="currentColor" fillOpacity={0.5} />
                    <text x={426} y={f.y + 8} fontSize="12" fontWeight="600" fill="currentColor">
                      {f.name}
                    </text>
                    <text x={426} y={f.y + 22} fontSize="10" fill="currentColor" fillOpacity={0.6}>
                      {f.use}
                    </text>
                  </g>
                ))}

                <text x={360} y={224} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.55}>
                  Version comparison alone cannot answer &ldquo;is this patched?&rdquo; on RHEL &mdash; the release suffix carries the fix.
                </text>
              </svg>
            </div>
            <figcaption className="text-xs muted">
              How Red Hat vulnerability data is layered, and the four ways it is published for machine
              consumption.
            </figcaption>
          </figure>

          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>OVAL.</strong> XML definitions, published per RHEL major version, that encode the
              actual test: given this installed package identity, is it affected by this advisory? This
              is the format built for evaluating a system rather than reading about a flaw, and it is
              what OS-aware scanners consume. It is also the data behind{" "}
              <Link href="/blog/openscap" className="underline">
                OpenSCAP
              </Link>{" "}
              compliance scanning.
            </li>
            <li>
              <strong>CSAF.</strong> The successor to CVRF, an OASIS standard for machine-readable
              advisory documents. Red Hat publishes advisories as CSAF, which makes them consumable by
              any tool that speaks the standard rather than a vendor-specific schema.
            </li>
            <li>
              <strong>VEX.</strong> A per-CVE statement of exploitability status across products. This
              is where &ldquo;not affected&rdquo; becomes something a tool can act on automatically.
            </li>
            <li>
              <strong>Security Data API.</strong> A JSON interface over CVE and advisory records, useful
              for ad-hoc queries and for enriching findings with Red Hat&apos;s own severity and state
              rather than a generic score.
            </li>
          </ul>
        </section>

        <img
          src="/blog/red-hat-security-advisories-3.jpg"
          alt="Structured machine-readable advisory data such as OVAL and CSAF documents"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why generic version matching fails on RHEL</h2>
          <p className="text-sm muted">
            This is the part that produces bad scan results, and it is worth being precise about.
            Within a supported RHEL stream, Red Hat does not rebase packages to new upstream releases.
            It <em>backports</em> the security fix into the version already shipped and increments the
            RPM release field. So a package can report an upstream version that a generic database
            considers vulnerable while actually containing the fix, distinguishable only by the release
            suffix.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg border border-black/10 dark:border-white/10 p-4 bg-black/[.03] dark:bg-white/[.03]">
{`# the upstream version stays put; the release field carries the fix
$ rpm -q --queryformat '%{NAME}-%{EPOCH}:%{VERSION}-%{RELEASE}.%{ARCH}\\n' openssl

# what an advisory actually tells you is a full NEVRA to compare against,
# not an upstream release number`}
          </pre>
          <p className="text-sm muted">
            A scanner that compares the upstream version against &ldquo;fixed in X.Y.Z&rdquo; from a
            generic database will flag patched RHEL packages as vulnerable, sometimes in large numbers.
            The correct evaluation compares the full RPM identity against Red Hat&apos;s own OVAL
            definition for that product stream. We go through the mechanics in detail in{" "}
            <Link href="/blog/redhat-backporting-explained" className="underline">
              how Red Hat backports security patches
            </Link>
            , and the general principle &mdash; read what is installed rather than infer it &mdash; in{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs advisory matching
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Using advisories day to day</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Prioritise on Red Hat severity for RHEL workloads,</strong> then reach for
              exploitability signals. A vendor rating that accounts for build configuration beats a
              generic base score for deciding what to patch this week.
            </li>
            <li>
              <strong>Read the CVE page, not just the erratum,</strong> when a finding looks wrong. The
              per-product state usually explains it in one line.
            </li>
            <li>
              <strong>Watch for &ldquo;will not fix&rdquo; on older streams.</strong> Waiting for an
              advisory that is never coming is a common way for a known issue to age quietly. That is a
              signal to upgrade the stream or apply your own mitigation.
            </li>
            <li>
              <strong>Do not assume RHEL advisories cover derivatives identically.</strong> Rebuilds and
              downstream distributions track Red Hat closely but not always on the same schedule, and
              their package release fields differ.
            </li>
            <li>
              <strong>Remember what advisories do not cover.</strong> RHSAs speak to Red Hat-packaged
              software. Language dependencies you installed into the image are outside their scope, and
              need OSV-style ecosystem data instead &mdash; see{" "}
              <Link href="/blog/osv-vs-nvd" className="underline">
                OSV vs NVD
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Red Hat OVAL is one of the three sources ScanRook queries directly, alongside OSV and NVD.
            For a RHEL, CentOS Stream, or UBI-based image, we evaluate the installed RPM identity against
            Red Hat&apos;s own definitions rather than comparing upstream version strings, which is what
            keeps backported packages from being reported as vulnerable.
          </p>
          <p className="text-sm muted">
            Because the three sources are queried in parallel rather than merged into one database
            beforehand, every finding keeps the provenance of where it came from. A finding sourced from
            Red Hat OVAL is telling you something different from one sourced from NVD, and the report
            says which. When those sources disagree &mdash; which they do more often than most people
            expect, as our{" "}
            <Link href="/blog/cve-database-comparison" className="underline">
              CVE database comparison
            </Link>{" "}
            shows &mdash; you can see the disagreement instead of inheriting whichever answer the tool
            picked.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is an RHSA?</h3>
              <p className="text-sm muted mt-1">
                A Red Hat Security Advisory &mdash; an erratum announcing fixed packages for one or more
                CVEs on specific products, with a severity rating and the exact fixed package versions.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is Red Hat severity the same as CVSS?</h3>
              <p className="text-sm muted mt-1">
                No. Red Hat&apos;s four-level scale reflects the flaw as built and configured in Red Hat
                products; CVSS describes it generically. They can legitimately disagree.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Which feed should a scanner consume?</h3>
              <p className="text-sm muted mt-1">
                OVAL for deciding whether an installed package is affected, CSAF and VEX for advisory
                content and per-product exploitability status.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why do RHEL packages look unpatched?</h3>
              <p className="text-sm muted mt-1">
                Backporting. The upstream version stays fixed while the RPM release field carries the
                security fix, so upstream version comparison produces false positives.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan a RHEL-based image against Red Hat&apos;s own data</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook evaluates RPM identity against Red Hat OVAL alongside OSV and NVD, and every finding
            records which source produced it &mdash; so backported packages are not reported as
            vulnerable and disagreements between sources are visible.
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
            <Link href="/blog/redhat-backporting-explained" className="underline">
              How Red Hat Backports Security Patches
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/cve-database-comparison" className="underline">
              CVE Database Comparison
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
