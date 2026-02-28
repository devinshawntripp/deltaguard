import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";

const title = `Vulnerability Scanning for Compliance: What You Need to Know | ${APP_NAME}`;
const description =
  "A guide to vulnerability scanning requirements across major compliance frameworks including FedRAMP, PCI-DSS, HIPAA, and SOC 2, and how to build a scanning program that satisfies auditors.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "compliance scanning",
    "vulnerability scanning compliance",
    "FedRAMP scanning",
    "PCI-DSS vulnerability scanning",
    "HIPAA vulnerability scanning",
    "SOC 2 scanning",
    "CMMC scanning",
    "compliance automation",
    "ScanRook",
  ],
  alternates: {
    canonical: "/blog/compliance-scanning-guide",
  },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/compliance-scanning-guide",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline:
    "Vulnerability Scanning for Compliance: What You Need to Know",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage:
    "https://scanrook.io/blog/compliance-scanning-guide",
  datePublished: "2026-02-27",
  dateModified: "2026-02-27",
};

export default function ComplianceScanningGuidePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 grid gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="surface-card p-8 grid gap-6">
        <header className="grid gap-3">
          <div className="text-xs uppercase tracking-wide muted">
            Compliance
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Vulnerability Scanning for Compliance: What You Need to Know
          </h1>
          <p className="text-sm muted">
            Vulnerability scanning is no longer just a security best practice.
            For organizations operating under regulatory frameworks like
            FedRAMP, PCI-DSS, HIPAA, or CMMC, it is an explicit requirement
            with defined frequencies, evidence standards, and real penalties
            for non-compliance. This guide covers what each major framework
            demands and how to build a scanning program that satisfies
            auditors.
          </p>
        </header>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            The Cost of Non-Compliance
          </h2>
          <p className="text-sm muted">
            Failing to meet vulnerability scanning requirements carries
            consequences that go far beyond audit findings. Each framework
            has its own enforcement mechanisms, and the penalties are
            substantial.
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>
              <strong>FedRAMP</strong> -- Authorization revocation and loss
              of government contracts. Agencies can suspend or terminate an
              ATO if continuous monitoring requirements are not met, cutting
              off access to the entire federal market.
            </li>
            <li>
              <strong>PCI-DSS</strong> -- Fines ranging from $5,000 to
              $100,000 per month from card brands, and potential loss of the
              ability to process card payments entirely. Acquiring banks pass
              these fines through to merchants.
            </li>
            <li>
              <strong>HIPAA</strong> -- Civil penalties up to $2 million per
              violation category per year, with OCR enforcement actions that
              include mandatory corrective action plans and multi-year
              monitoring.
            </li>
            <li>
              <strong>DFARS/CMMC</strong> -- Loss of Department of Defense
              contracts and potential False Claims Act liability for
              misrepresenting compliance status. CMMC Level 2 and above
              require third-party assessment.
            </li>
            <li>
              <strong>SOC 2</strong> -- While not a regulatory mandate, a
              qualified or adverse SOC 2 report results in loss of customer
              trust and the inability to sell to enterprise customers who
              require it as a vendor prerequisite.
            </li>
          </ul>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Scanning Frequency Requirements
          </h2>
          <p className="text-sm muted">
            Each compliance framework specifies different scanning cadences.
            Understanding these requirements is critical for designing a
            program that stays ahead of audit cycles.
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>
              <strong>FedRAMP</strong> -- Monthly operating system and
              infrastructure vulnerability scans are required. Annual
              penetration testing must be performed by an independent
              assessor. High-severity findings must be remediated within 30
              days.
            </li>
            <li>
              <strong>PCI-DSS</strong> -- Quarterly scans by an Approved
              Scanning Vendor (ASV) are mandatory for external-facing
              systems. Internal scans are required quarterly and after any
              significant infrastructure change.
            </li>
            <li>
              <strong>HIPAA</strong> -- The Security Rule requires regular
              risk analysis but does not mandate a specific scanning
              frequency. In practice, OCR expects evidence of ongoing
              technical evaluation, and annual risk assessments are the
              accepted minimum.
            </li>
            <li>
              <strong>SOC 2</strong> -- Scanning frequency depends on the
              control design described in the SOC 2 Type II report. Controls
              may specify continuous, weekly, monthly, or quarterly scanning.
              The key is that actual practice matches the documented controls.
            </li>
            <li>
              <strong>CISA BOD 22-01</strong> -- The Binding Operational
              Directive requires federal agencies to remediate Known Exploited
              Vulnerabilities (KEV) within specific deadlines, typically 14
              days for internet-facing systems and 25 days for all others.
            </li>
          </ul>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Evidence Requirements: What Auditors Want to See
          </h2>
          <p className="text-sm muted">
            Running scans is only half the battle. Auditors need documented
            evidence that your scanning program is consistent, comprehensive,
            and tied to a remediation process.
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>
              <strong>Scan reports with timestamps</strong> -- Every scan
              must produce a dated report that shows what was scanned, when,
              and what was found. Reports must be retained for the duration
              required by the framework (typically 12 months for FedRAMP,
              12 months for PCI-DSS).
            </li>
            <li>
              <strong>Remediation timelines</strong> -- Auditors expect to
              see evidence that findings were triaged and remediated within
              the required SLAs. This means tracking the time from discovery
              to resolution for every finding.
            </li>
            <li>
              <strong>Plan of Action and Milestones (POA&amp;M)</strong> --
              For FedRAMP and DFARS, unresolved findings must be documented
              in a POA&amp;M with specific milestones and responsible parties.
            </li>
            <li>
              <strong>Risk acceptance documentation</strong> -- When a
              finding cannot be remediated immediately, auditors want to see
              a formal risk acceptance signed by an authorized individual,
              with compensating controls documented.
            </li>
          </ul>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Building a Compliant Scanning Program
          </h2>
          <p className="text-sm muted">
            A compliant scanning program is not just about tooling. It
            requires process, documentation, and integration with your
            development workflow.
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>
              <strong>Automate scans in CI/CD</strong> -- Integrate
              vulnerability scanning into your build pipeline so that every
              container image and artifact is scanned before deployment. This
              creates a natural audit trail tied to your release process.
            </li>
            <li>
              <strong>Maintain scan history</strong> -- Retain all scan
              reports with timestamps. Auditors will ask for historical data
              to verify that scanning was performed consistently, not just
              before the audit.
            </li>
            <li>
              <strong>Track remediation SLAs</strong> -- Define severity-based
              remediation timelines (e.g., critical within 15 days, high
              within 30 days) and track compliance against those SLAs.
            </li>
            <li>
              <strong>Use EPSS to prioritize</strong> -- The Exploit
              Prediction Scoring System provides probability scores for CVE
              exploitation. Using EPSS to prioritize remediation demonstrates
              a risk-based approach, which auditors increasingly expect to
              see. Learn more in our{" "}
              <Link
                href="/blog/epss-scores-explained"
                className="font-medium underline underline-offset-2"
              >
                EPSS guide
              </Link>
              .
            </li>
            <li>
              <strong>Document exceptions</strong> -- Every accepted risk,
              deferred remediation, or false positive suppression must be
              documented with a rationale and an approver. Undocumented
              exceptions are audit failures.
            </li>
          </ul>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            How {APP_NAME} Generates Compliance-Ready Output
          </h2>
          <p className="text-sm muted">
            {APP_NAME} is designed to produce scan output that meets the
            evidence requirements of major compliance frameworks without
            additional post-processing.
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>
              <strong>Timestamped JSON reports</strong> -- Every scan
              produces a structured JSON report with scan start time,
              completion time, scanner version, and target metadata. These
              reports serve as primary evidence artifacts for auditors.
            </li>
            <li>
              <strong>EPSS and KEV enrichment</strong> -- Findings are
              automatically enriched with EPSS probability scores and CISA
              KEV membership, providing the data needed to demonstrate
              risk-based prioritization. See our{" "}
              <Link
                href="/blog/cisa-kev-guide"
                className="font-medium underline underline-offset-2"
              >
                CISA KEV guide
              </Link>{" "}
              for details.
            </li>
            <li>
              <strong>SBOM generation</strong> -- {APP_NAME} can produce
              Software Bills of Materials in CycloneDX and SPDX formats,
              satisfying Executive Order 14028 requirements for software
              supply chain transparency.
            </li>
            <li>
              <strong>Structured output for GRC tools</strong> -- The JSON
              report format is designed to be easily parsed and imported into
              governance, risk, and compliance (GRC) platforms for
              centralized tracking and reporting.
            </li>
          </ul>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Enterprise Compliance Features
          </h2>
          <p className="text-sm muted">
            For organizations that need to operationalize compliance scanning
            at scale, the {APP_NAME} Enterprise tier includes additional
            capabilities designed for regulated environments: compliance
            reporting templates mapped to specific frameworks, scheduled
            scanning with configurable cadences, data retention policies that
            match your audit cycle requirements, and audit log export for
            integration with SIEM and GRC platforms.
          </p>
          <p className="text-sm muted">
            Visit the{" "}
            <Link
              href="/pricing"
              className="font-medium underline underline-offset-2"
            >
              pricing page
            </Link>{" "}
            to learn more about Enterprise tier features and how they map to
            your compliance requirements.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Further Reading
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link className="btn-secondary" href="/docs/concepts/compliance">
              Compliance docs
            </Link>
            <Link className="btn-secondary" href="/blog/cisa-kev-guide">
              CISA KEV guide
            </Link>
            <Link className="btn-secondary" href="/blog/epss-scores-explained">
              EPSS scores explained
            </Link>
            <Link className="btn-secondary" href="/blog">
              Back to blog
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
