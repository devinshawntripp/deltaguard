import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-13";

const title = `OWASP ASVS: A Practical Guide to the Verification Standard | ${APP_NAME}`;
const description =
  "OWASP ASVS turns application security from opinion into a checklist you can verify. What the levels mean, how it is organised, and how to adopt it in practice.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "owasp asvs",
    "application security verification standard",
    "asvs levels",
    "owasp asvs v5",
    "asvs vs owasp top 10",
    "asvs checklist",
    "application security requirements",
    "security verification standard",
    "owasp asvs level 2",
    "secure development standard",
  ],
  alternates: { canonical: "/blog/owasp-asvs" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/owasp-asvs",
    images: ["/blog/owasp-asvs.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/owasp-asvs.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "OWASP ASVS: A Practical Guide to the Verification Standard",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/owasp-asvs",
  image: "https://scanrook.io/blog/owasp-asvs.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is OWASP ASVS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The OWASP Application Security Verification Standard is an open list of application security requirements written so each one can be verified. It covers areas such as authentication, session management, access control, input handling, cryptography, logging, and configuration, and it is organised into levels so a team can pick a depth of assurance appropriate to the application.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between ASVS and the OWASP Top 10?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The OWASP Top 10 is an awareness document listing the most significant categories of web application risk. ASVS is a verification standard: a detailed set of testable requirements. The Top 10 tells you what tends to go wrong; ASVS tells you what specifically to check. They are complementary, and ASVS is the one you can build a test plan or contract around.",
      },
    },
    {
      "@type": "Question",
      name: "Which ASVS level should we target?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Level 1 is a baseline appropriate for low-assurance applications and is largely verifiable from the outside. Level 2 is the standard target for most applications that handle real user or business data and assumes access to source and design. Level 3 is for applications where a compromise would be severe, such as those handling health, financial, or safety-critical data. Most teams should aim at Level 2.",
      },
    },
    {
      "@type": "Question",
      name: "Does ASVS cover dependencies and supply chain?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. ASVS includes requirements around maintaining an inventory of third-party components, keeping them updated, and ensuring the build and deployment pipeline is not a source of untrusted code. These are the requirements that software composition analysis and container scanning tooling are used to satisfy.",
      },
    },
    {
      "@type": "Question",
      name: "Is ASVS a certification?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. There is no official ASVS certification body. It is a free, openly licensed standard that organisations use internally, in vendor security questionnaires, and as the scope definition for penetration tests. Some testing firms will report against ASVS levels, but any resulting claim is the firm's, not OWASP's.",
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
          <div className="text-xs uppercase tracking-wide muted">Compliance</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            OWASP ASVS: A Practical Guide to the Verification Standard
          </h1>
          <p className="text-sm muted">Published October 13, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            OWASP ASVS &mdash; the Application Security Verification Standard &mdash; is the closest
            thing the industry has to a shared definition of &ldquo;this application was built
            securely.&rdquo; Where the OWASP Top 10 raises awareness of risk categories, ASVS gives you
            a numbered list of requirements you can actually test against. Here is how it is
            structured, how to pick a level, and how to adopt it without producing a 300-item backlog
            nobody touches.
          </p>
        </header>

        <img
          src="/blog/owasp-asvs.jpg"
          alt="OWASP ASVS: tiered application security verification requirements"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What ASVS is for</h2>
          <p className="text-sm muted">
            Most application security conversations fail on a definitional problem: nobody agrees what
            &ldquo;secure enough&rdquo; means. A penetration test report describes what one tester
            happened to find in two weeks. A vendor questionnaire asks whether you &ldquo;follow
            industry best practices.&rdquo; Neither is a specification.
          </p>
          <p className="text-sm muted">
            ASVS is a specification. Each requirement is written so it can be verified: not
            &ldquo;handle sessions securely&rdquo; but a concrete, checkable statement about how
            session tokens are generated, transmitted, and invalidated. That phrasing is the whole
            point. It makes the standard usable as a test plan, as acceptance criteria in a contract,
            as the scope for a penetration test, and as a backlog of engineering work.
          </p>
          <p className="text-sm muted">
            It is published by OWASP under an open licence, developed in the open on GitHub, and free.
            Version 4.0.3 was the long-standing reference for years; version 5.0 arrived in 2025 with a
            substantial reorganisation of the chapter structure and a rewrite of many requirements.
            Both are still encountered in the wild, so when someone says &ldquo;ASVS L2&rdquo; it is
            worth asking which version they mean &mdash; the requirement numbering is not stable across
            major versions.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The three ASVS levels</h2>
          <p className="text-sm muted">
            ASVS defines three levels of verification depth. They are cumulative: Level 2 includes
            everything in Level 1, Level 3 includes everything in Level 2.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 230"
              role="img"
              aria-label="Diagram of the three OWASP ASVS levels as nested tiers, with Level 1 as the outermost baseline, Level 2 as the standard target, and Level 3 as the highest assurance tier"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              {[
                {
                  y: 14,
                  w: 664,
                  label: "Level 1 — Baseline",
                  sub: "Low assurance; mostly verifiable without source access",
                },
                {
                  y: 82,
                  w: 520,
                  label: "Level 2 — Standard",
                  sub: "Applications handling real user or business data · the usual target",
                  hot: true,
                },
                {
                  y: 150,
                  w: 376,
                  label: "Level 3 — High assurance",
                  sub: "Severe-consequence systems: health, finance, safety",
                },
              ].map((t) => (
                <g key={t.label}>
                  <rect
                    x={18}
                    y={t.y}
                    width={t.w}
                    height={56}
                    rx={8}
                    fill={t.hot ? "var(--dg-accent,#2563eb)" : "currentColor"}
                    fillOpacity={t.hot ? 0.13 : 0.05}
                    stroke="currentColor"
                    strokeOpacity={0.35}
                  />
                  <text x={36} y={t.y + 25} fontSize="13.5" fontWeight="600" fill="currentColor">
                    {t.label}
                  </text>
                  <text
                    x={36}
                    y={t.y + 43}
                    fontSize="11"
                    fill="currentColor"
                    fillOpacity={0.65}
                  >
                    {t.sub}
                  </text>
                </g>
              ))}
              <text
                x={682}
                y={46}
                textAnchor="end"
                fontSize="10.5"
                fill="currentColor"
                fillOpacity={0.5}
              >
                fewer requirements
              </text>
              <text
                x={682}
                y={182}
                textAnchor="end"
                fontSize="10.5"
                fill="currentColor"
                fillOpacity={0.5}
              >
                more requirements, deeper evidence
              </text>
            </svg>
            <figcaption className="text-xs muted mt-2">
              ASVS levels are cumulative tiers of verification depth, not separate standards. The
              widths here are illustrative of relative scope, not a count of requirements.
            </figcaption>
          </div>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Level 1</strong> is the floor. It is designed to be largely verifiable from
              outside the application, which makes it the level a black-box test can reasonably cover.
              Treat it as a minimum, not an achievement.
            </li>
            <li>
              <strong>Level 2</strong> is where most teams should aim. It assumes the verifier has
              access to source, design documentation, and the developers, and it covers the
              requirements that matter for any application holding real user data. If someone asks
              &ldquo;which level should we target?&rdquo; without further context, the answer is
              usually this one.
            </li>
            <li>
              <strong>Level 3</strong> is for applications where compromise causes severe harm. It adds
              requirements around defence in depth, detailed logging, and design-level review. It is
              expensive and appropriate for a minority of systems.
            </li>
          </ul>
        </section>

        <img
          src="/blog/owasp-asvs-2.jpg"
          alt="OWASP ASVS requirements organised into verifiable chapters and levels"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How the requirements are organised</h2>
          <p className="text-sm muted">
            ASVS groups requirements into chapters by subject area. In the long-lived 4.0.x structure
            those were, broadly:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Area</th>
                  <th className="text-left py-2 font-semibold">What it covers</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Architecture &amp; design</td>
                  <td className="py-2 align-top">
                    Threat modelling, documented trust boundaries, component inventory
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Authentication</td>
                  <td className="py-2 align-top">
                    Credential storage, recovery flows, multi-factor, rate limiting
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Session management</td>
                  <td className="py-2 align-top">
                    Token generation, cookie attributes, timeout and invalidation
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Access control</td>
                  <td className="py-2 align-top">
                    Server-side enforcement, least privilege, deny by default
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Validation &amp; encoding</td>
                  <td className="py-2 align-top">
                    Injection defences, output encoding, deserialization safety
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Cryptography</td>
                  <td className="py-2 align-top">
                    Algorithm selection, key management, random number generation
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Logging &amp; error handling</td>
                  <td className="py-2 align-top">
                    What to log, what never to log, safe failure modes
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Data protection &amp; communication</td>
                  <td className="py-2 align-top">
                    Transport security, caching, data minimisation
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Files, APIs, business logic</td>
                  <td className="py-2 align-top">
                    Upload handling, API-specific controls, workflow abuse resistance
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">Configuration &amp; dependencies</td>
                  <td className="py-2 align-top">
                    Hardened defaults, third-party component inventory and currency
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            Version 5.0 reorganised this structure, splitting several areas that had been folded
            together &mdash; token handling and delegated authorisation protocols in particular
            &mdash; into their own chapters, and reworking the wording of many requirements to be
            more precisely testable. Because requirement identifiers changed, do not map a 4.0.x
            requirement number to a 5.0 one by assumption. Pull the current release from the OWASP
            ASVS repository and use its numbering as authoritative.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">ASVS is not the OWASP Top 10</h2>
          <p className="text-sm muted">
            These get conflated constantly, and the distinction matters when you are deciding what to
            actually do. The Top 10 is an awareness ranking of risk categories &mdash; broken access
            control, cryptographic failures, injection, and so on. It is excellent for training and
            for explaining priorities to a non-specialist audience. It is not a specification: you
            cannot pass or fail the Top 10.
          </p>
          <p className="text-sm muted">
            ASVS is the specification. If the Top 10 says &ldquo;broken access control is the number
            one risk,&rdquo; ASVS is the set of two dozen specific, testable statements about how
            access control should behave. When a security team says &ldquo;we are Top 10
            compliant,&rdquo; the honest follow-up is &ldquo;against which requirements?&rdquo; &mdash;
            and the answer, if there is one, is essentially ASVS.
          </p>
          <p className="text-sm muted">
            The same distinction applies to how you test. Some ASVS requirements are provable by static
            analysis, some only by dynamic testing, and some only by reading the design. That mapping
            is worth doing explicitly &mdash; our comparison of{" "}
            <Link href="/blog/sast-vs-dast-explained" className="underline">
              SAST and DAST
            </Link>{" "}
            covers which classes of requirement each approach can genuinely cover.
          </p>
        </section>

        <img
          src="/blog/owasp-asvs-3.jpg"
          alt="Authentication and session management requirements verified against OWASP ASVS"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Adopting ASVS without drowning in it</h2>
          <p className="text-sm muted">
            The standard failure mode is importing every Level 2 requirement into a tracker on day one,
            producing hundreds of open tickets, and abandoning the effort within a quarter. A staged
            approach works better.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Pick one application and one level.</strong> Not the whole estate. A single
              service assessed properly is worth more than a spreadsheet covering twenty.
            </li>
            <li>
              <strong>Mark requirements not-applicable deliberately.</strong> If you have no file
              uploads, the file-handling chapter is N/A &mdash; record the reason. A well-justified N/A
              is a legitimate answer and shrinks the list considerably.
            </li>
            <li>
              <strong>Separate &ldquo;automatable&rdquo; from &ldquo;requires judgement.&rdquo;</strong>{" "}
              Dependency currency, TLS configuration, cookie attributes, and secret handling can be
              checked by tooling on every build. Access control correctness and business logic abuse
              cannot. Automate the first set, schedule human review for the second.
            </li>
            <li>
              <strong>Wire the automatable ones into CI.</strong> A requirement checked once a year in
              a spreadsheet regresses silently. A requirement checked on every pull request does not.
              This is the practical core of{" "}
              <Link href="/blog/shift-left-security" className="underline">
                shift-left security
              </Link>
              .
            </li>
            <li>
              <strong>Record evidence as you go.</strong> For each requirement: how it is verified, by
              what, and where the output lives. That artifact is what makes the next audit, customer
              questionnaire, or penetration test scoping conversation fast.
            </li>
          </ul>
          <p className="text-sm muted">
            ASVS also slots neatly into broader control frameworks. If you are already mapping to{" "}
            <Link href="/blog/nist-800-53" className="underline">
              NIST SP 800-53
            </Link>{" "}
            or working through the{" "}
            <Link href="/blog/cis-controls" className="underline">
              CIS Controls
            </Link>
            , ASVS is a good source of the concrete application-layer evidence those frameworks ask for
            but do not themselves specify in detail.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            The dependency and configuration requirements
          </h2>
          <p className="text-sm muted">
            The chapters that most often get skipped are the ones about third-party components and
            deployment configuration &mdash; and they are where the highest-frequency real-world
            incidents come from. ASVS asks, in substance, for three things here: that you know what
            components are in the application, that you keep them current, and that the build and
            deployment pipeline does not introduce untrusted code.
          </p>
          <p className="text-sm muted">
            The first two are exactly what software composition analysis is for. An inventory that is
            regenerated on every build and checked against advisory data satisfies the requirement in a
            way a quarterly manual review never will. Our overview of{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              software composition analysis
            </Link>{" "}
            covers the mechanics, and{" "}
            <Link href="/blog/sca-tools" className="underline">
              SCA tools
            </Link>{" "}
            surveys the options. The third is a supply chain question, covered in{" "}
            <Link href="/blog/software-supply-chain-security" className="underline">
              software supply chain security
            </Link>
            . Secrets handling shows up across several chapters and is best answered with automated
            scanning rather than review discipline &mdash; see the{" "}
            <Link href="/blog/secret-scanning-guide" className="underline">
              secret scanning guide
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook addresses a specific slice of ASVS, and we would rather be precise about which:
            the component-inventory and known-vulnerability requirements, plus the parts of the
            configuration chapter that concern what actually ends up in a deployed artifact. It does
            not verify your access control, your session handling, or your cryptography &mdash; those
            need code review and dynamic testing.
          </p>
          <p className="text-sm muted">
            What it does is produce the evidence for the inventory requirements automatically. It reads
            the real package databases inside a container image, binary, or source archive, and matches
            each package against OSV, NVD, and Red Hat OVAL in parallel, so a distribution&apos;s
            backported fix is evaluated correctly rather than flagged on an upstream version string.
            Every finding carries its source and a confidence tier, which is what makes a report usable
            as evidence rather than as a list of things to argue about.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <pre className="text-xs leading-relaxed"><code>{`curl -fsSL https://scanrook.io/install.sh | sh

docker save myapp:1.0 -o image.tar
scanrook scan image.tar --format json --out asvs-evidence.json`}</code></pre>
          </div>
          <p className="text-sm muted">
            Run it in CI, keep the reports, and the component chapters of ASVS stop being an annual
            exercise. The{" "}
            <Link href="/docs" className="underline">
              docs
            </Link>{" "}
            cover SBOM output and exit codes for threshold-based build failures, and our{" "}
            <Link href="/blog/compliance-scanning-guide" className="underline">
              compliance scanning guide
            </Link>{" "}
            walks through wiring evidence collection into a pipeline.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is OWASP ASVS?</h3>
              <p className="text-sm muted mt-1">
                An open standard of testable application security requirements, organised by subject
                area and by three cumulative levels of verification depth.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">ASVS or the OWASP Top 10?</h3>
              <p className="text-sm muted mt-1">
                Both. The Top 10 raises awareness of risk categories; ASVS is the specification you can
                test, contract, and build a backlog against.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Which level should we target?</h3>
              <p className="text-sm muted mt-1">
                Level 2 for most applications holding real data. Level 1 is a floor; Level 3 is for
                systems where compromise causes severe harm.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is there an ASVS certification?</h3>
              <p className="text-sm muted mt-1">
                No official one. Organisations use it internally and in vendor assessments; testing
                firms may report against levels, but that claim is theirs, not OWASP&apos;s.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Automate the component requirements</h3>
          <p className="text-sm muted leading-relaxed">
            The inventory and known-vulnerability chapters of ASVS are the ones tooling can genuinely
            close. Scan an artifact with ScanRook and see what evidence a single run produces.
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
            <Link href="/blog/compliance-scanning-guide" className="underline">
              Compliance Scanning Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              What Is Software Composition Analysis?
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
