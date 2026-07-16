import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-17";

const title = `DORA Compliance: The EU Digital Operational Resilience Act | ${APP_NAME}`;
const description =
  "DORA is the EU Digital Operational Resilience Act for financial firms. Who it applies to, its five pillars, key dates, and where vulnerability scanning fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "dora compliance",
    "digital operational resilience act",
    "what is dora",
    "dora regulation",
    "dora eu",
    "dora five pillars",
    "ict third party risk",
    "dora financial sector",
    "dora requirements",
    "eu 2022/2554",
  ],
  alternates: { canonical: "/blog/dora-compliance" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/dora-compliance",
    images: ["/blog/dora-compliance.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/dora-compliance.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "DORA Compliance: The EU Digital Operational Resilience Act",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/dora-compliance",
  image: "https://scanrook.io/blog/dora-compliance.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is DORA compliance?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DORA is the EU Digital Operational Resilience Act, Regulation (EU) 2022/2554. It sets uniform requirements for the security and operational resilience of the information and communication technology systems used by financial entities in the EU. DORA compliance means meeting its rules on ICT risk management, incident reporting, resilience testing, third-party risk, and information sharing.",
      },
    },
    {
      "@type": "Question",
      name: "When did DORA take effect?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DORA was adopted on 14 December 2022, entered into force on 16 January 2023, and has applied since 17 January 2025. The two-year gap gave in-scope entities and their regulators time to prepare and for the European Supervisory Authorities to publish the technical standards that fill in the detail.",
      },
    },
    {
      "@type": "Question",
      name: "Who has to comply with DORA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DORA applies to a broad range of EU financial entities — banks, insurers, investment firms, payment and e-money institutions, crypto-asset service providers, and more — as well as the critical ICT third-party providers that serve them, which fall under a dedicated EU oversight framework. Whether a specific organization is in scope is a legal question; consult counsel.",
      },
    },
    {
      "@type": "Question",
      name: "What are the five pillars of DORA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DORA is organized around five areas: ICT risk management, ICT-related incident reporting, digital operational resilience testing, management of ICT third-party risk, and information and intelligence sharing. Together they require financial entities to identify, protect against, detect, respond to, and recover from ICT disruptions.",
      },
    },
    {
      "@type": "Question",
      name: "Does vulnerability scanning satisfy DORA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No single tool satisfies DORA — it is an operational resilience regulation, not a checklist a scanner can tick. Vulnerability scanning supports specific parts of it, chiefly identifying and managing ICT vulnerabilities under the risk-management pillar and evidencing resilience testing. It is one technical control among many. Consult your compliance team on how it maps to your obligations.",
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
            DORA Compliance: The EU Digital Operational Resilience Act
          </h1>
          <p className="text-sm muted">Published November 17, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            DORA &mdash; the EU Digital Operational Resilience Act &mdash; is the regulation that made
            operational resilience a legal obligation for the European financial sector rather than a
            best practice. If you build or run software for a bank, insurer, or fintech operating in the
            EU, it now shapes how you manage ICT risk. This is a practical primer on what DORA covers,
            who it applies to, and where technical controls like vulnerability scanning fit &mdash; not
            legal advice.
          </p>
        </header>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">First, which DORA?</h2>
          <p className="text-sm muted">
            One quick disambiguation, because the acronym collides. In DevOps circles, &ldquo;DORA&rdquo;
            usually means the DORA metrics &mdash; deployment frequency, lead time, change failure rate,
            and time to restore &mdash; from the DevOps Research and Assessment team. That is a
            different thing entirely. This article is about the <strong>Digital Operational Resilience
            Act</strong>, an EU regulation for the financial sector. When someone says &ldquo;DORA
            compliance,&rdquo; they almost always mean this one.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What DORA is</h2>
          <p className="text-sm muted">
            DORA is <strong>Regulation (EU) 2022/2554</strong>, adopted on 14 December 2022. Its goal is
            to make sure financial entities can withstand, respond to, and recover from ICT-related
            disruptions and threats &mdash; from a ransomware outage to the failure of a critical cloud
            provider. Before DORA, ICT risk rules for finance were spread unevenly across member states
            and sub-sectors; DORA replaces that patchwork with a single, directly-applicable rulebook
            across the EU.
          </p>
          <p className="text-sm muted">
            Two dates matter. DORA entered into force on <strong>16 January 2023</strong> and has
            applied since <strong>17 January 2025</strong>. That two-year runway let the European
            Supervisory Authorities (the EBA, EIOPA, and ESMA) draft the regulatory and implementing
            technical standards &mdash; the RTS and ITS &mdash; that turn DORA&apos;s high-level
            articles into concrete requirements. Much of the operational detail lives in those
            standards, which continue to evolve, so treat any specific obligation as something to verify
            against the current text with your compliance team.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Who it applies to</h2>
          <p className="text-sm muted">
            DORA&apos;s scope is deliberately wide. It covers a long list of EU financial entities
            &mdash; credit institutions (banks), insurers and reinsurers, investment firms, payment and
            electronic-money institutions, crypto-asset service providers, trading venues, and many more
            &mdash; regardless of size, with some proportionality for smaller entities. Crucially, it
            also reaches <strong>ICT third-party service providers</strong>: the cloud platforms,
            software vendors, and managed-service firms those financial entities depend on. Providers
            designated as <em>critical</em> fall under a dedicated EU oversight framework led by the
            supervisory authorities.
          </p>
          <p className="text-sm muted">
            That third-party reach is why DORA matters even to companies that are not themselves
            regulated financial firms: if you supply software or services into the financial sector, your
            customers&apos; DORA obligations flow to you through contracts and risk assessments. Whether
            your specific organization is in scope, and as what, is a legal determination &mdash;{" "}
            <strong>consult counsel</strong> rather than inferring it from a blog post.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The five pillars</h2>
          <p className="text-sm muted">
            DORA is usually described as five pillars. They map cleanly onto the identify-protect-detect-
            respond-recover shape of any resilience program:
          </p>

          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 720 176" className="w-full" role="img" aria-label="DORA rests on five pillars: ICT risk management, incident reporting, resilience testing, third-party risk, and information sharing.">
              <rect x="20" y="14" width="680" height="28" rx="6" fill="var(--dg-accent,#2563eb)" fillOpacity="0.12" stroke="var(--dg-accent,#2563eb)" strokeOpacity="0.5" strokeWidth="1.5" />
              <text x="360" y="33" fill="currentColor" fontSize="13" fontWeight="700" textAnchor="middle">DORA &mdash; Regulation (EU) 2022/2554</text>
              <g fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5">
                <rect x="26" y="52" width="118" height="72" rx="6" />
                <rect x="160" y="52" width="118" height="72" rx="6" />
                <rect x="294" y="52" width="118" height="72" rx="6" />
                <rect x="428" y="52" width="118" height="72" rx="6" />
                <rect x="562" y="52" width="118" height="72" rx="6" />
              </g>
              <g fill="currentColor" fontSize="12" fontWeight="600" textAnchor="middle">
                <text x="85" y="84">ICT risk</text>
                <text x="85" y="100">management</text>
                <text x="219" y="84">Incident</text>
                <text x="219" y="100">reporting</text>
                <text x="353" y="84">Resilience</text>
                <text x="353" y="100">testing</text>
                <text x="487" y="84">Third-party</text>
                <text x="487" y="100">risk</text>
                <text x="621" y="84">Information</text>
                <text x="621" y="100">sharing</text>
              </g>
              <rect x="20" y="132" width="680" height="26" rx="6" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
              <text x="360" y="150" fill="currentColor" fillOpacity="0.85" fontSize="12" textAnchor="middle">Digital operational resilience for the EU financial sector</text>
            </svg>
          </div>

          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>ICT risk management.</strong> A governed framework to identify, protect against,
              detect, respond to, and recover from ICT risks &mdash; including identifying and managing
              vulnerabilities in the systems the entity relies on.
            </li>
            <li>
              <strong>ICT-related incident reporting.</strong> Classify incidents by severity and report
              major ones to regulators within defined timelines, using harmonized templates.
            </li>
            <li>
              <strong>Digital operational resilience testing.</strong> Regular testing of ICT systems,
              scaling up to threat-led penetration testing (TLPT) for significant entities.
            </li>
            <li>
              <strong>ICT third-party risk management.</strong> Assess, contract with, and monitor ICT
              providers, maintain a register of arrangements, and manage concentration risk.
            </li>
            <li>
              <strong>Information and intelligence sharing.</strong> Voluntary arrangements to exchange
              cyber threat information among financial entities.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where vulnerability management fits</h2>
          <p className="text-sm muted">
            DORA never mentions any specific scanning tool, and it should not be read as a checklist that
            a scanner can satisfy. But two pillars lean directly on the kind of work a vulnerability
            program already does. The <strong>ICT risk management</strong> pillar expects entities to
            identify and manage vulnerabilities in their systems on an ongoing basis &mdash; which is
            precisely what continuous scanning, prioritization, and remediation deliver. The{" "}
            <strong>resilience testing</strong> pillar expects regular, evidenced testing, and
            vulnerability assessments are a recognized part of that testing spectrum.
          </p>
          <p className="text-sm muted">
            The <strong>third-party risk</strong> pillar adds a supply-chain angle: entities must
            understand the risk in the ICT services and software they consume. Knowing what components
            are inside a vendor&apos;s container image, and whether they carry known CVEs, is one input
            into that assessment. None of this makes scanning &ldquo;DORA compliance&rdquo; on its own
            &mdash; it is one technical control that produces evidence for a couple of pillars, sitting
            inside a much larger governance, testing, and reporting program.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A practical checklist</h2>
          <p className="text-sm muted">
            This is an engineering-level checklist for the technical controls that support DORA, not a
            substitute for a compliance program:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              Maintain a current inventory of ICT assets and the software components inside them &mdash;
              you cannot manage risk in systems you have not catalogued.
            </li>
            <li>
              Scan container images, binaries, and dependencies continuously so newly disclosed
              vulnerabilities in components you already run surface quickly, feeding a{" "}
              <Link href="/blog/vulnerability-management-guide" className="underline">
                vulnerability management lifecycle
              </Link>{" "}
              with defined remediation SLAs.
            </li>
            <li>
              Keep an SBOM for the software you ship and consume, so third-party risk assessments have
              real data &mdash; see{" "}
              <Link href="/blog/sbom-requirements-2026" className="underline">
                SBOM requirements in 2026
              </Link>
              .
            </li>
            <li>
              Retain scan reports and remediation records as evidence for the resilience-testing and
              risk-management pillars.
            </li>
            <li>
              Feed vendor and dependency findings into your ICT third-party risk register.
            </li>
            <li>
              Have your compliance and legal teams map these controls to the current RTS/ITS text
              &mdash; the detail moves, and interpretation is their job, not a tool&apos;s.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook does not make you DORA-compliant &mdash; no scanner can, and any vendor claiming
            otherwise is overselling. What it does is produce trustworthy evidence for the narrow,
            technical slices of DORA that involve software vulnerabilities. It unpacks container images,
            binaries, and source archives, matches every component against OSV, NVD, and Red Hat OVAL in
            parallel, and tags each finding with its source and a confidence tier. The same scan produces
            SBOM output, so the component inventory that supports third-party risk assessment and the
            vulnerability findings that support risk management come from one artifact.
          </p>
          <p className="text-sm muted">
            For the broader EU regulatory picture around software &mdash; which overlaps DORA for
            financial-sector products &mdash; our write-up of the{" "}
            <Link href="/blog/eu-cyber-resilience-act-containers" className="underline">
              EU Cyber Resilience Act
            </Link>{" "}
            and our general{" "}
            <Link href="/blog/compliance-scanning-guide" className="underline">
              compliance scanning guide
            </Link>{" "}
            cover how scanning evidence supports multiple frameworks at once. As always with regulatory
            questions, confirm scope and obligations with counsel.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is DORA a regulation or a directive?</h3>
              <p className="text-sm muted mt-1">
                DORA is a regulation (EU 2022/2554), so it applies directly across member states without
                needing national transposition. An accompanying directive (EU 2022/2556) amends related
                financial-sector laws to align them with it.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does DORA apply to non-EU companies?</h3>
              <p className="text-sm muted mt-1">
                It can reach non-EU firms that provide ICT services to EU financial entities, through the
                third-party risk and oversight provisions. Whether and how it applies to a given company
                is a legal question &mdash; consult counsel.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is threat-led penetration testing under DORA?</h3>
              <p className="text-sm muted mt-1">
                TLPT is advanced, intelligence-driven testing that significant entities must perform
                periodically, modeled on the EU&apos;s TIBER-EU framework. It sits at the demanding end of
                the resilience-testing pillar.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How does DORA relate to the NIS2 Directive?</h3>
              <p className="text-sm muted mt-1">
                DORA is <em>lex specialis</em> for the financial sector: where both could apply, DORA&apos;s
                specific ICT rules generally take precedence for financial entities. They share goals but
                target different scopes.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Produce the vulnerability evidence DORA-aligned programs need</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook scans container images, binaries, and source archives against OSV, NVD, and Red Hat
            OVAL, and emits SBOMs from the same run &mdash; giving your ICT risk-management and
            third-party assessments accurate, source-tagged data. It supports compliance work; it does
            not replace counsel.
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
            <Link href="/blog/eu-cyber-resilience-act-containers" className="underline">
              The EU Cyber Resilience Act and Containers
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/compliance-scanning-guide" className="underline">
              Vulnerability Scanning for Compliance
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/vulnerability-management-guide" className="underline">
              Vulnerability Management Lifecycle
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
