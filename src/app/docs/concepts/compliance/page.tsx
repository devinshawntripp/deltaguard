import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Compliance & Regulatory Overview",
  description:
    "How vulnerability scanning with ScanRook maps to compliance requirements across NIST, FedRAMP, PCI-DSS, SOC 2, HIPAA, and CISA directives.",
};

export default function CompliancePage() {
  return (
    <article className="grid gap-6">
      {/* Intro */}
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Compliance</h1>
        <p className="muted text-sm max-w-3xl">
          Vulnerability management is not optional. Nearly every regulatory
          framework that governs software security requires organizations to
          identify, track, and remediate known vulnerabilities in their systems.
          Whether you are shipping software to the federal government, processing
          payment card data, or operating a SaaS platform, continuous
          vulnerability scanning is a baseline expectation — not a nice-to-have.
        </p>
      </section>

      {/* NIST SP 800-53 */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="NIST SP 800-53"
          blurb="Security and privacy controls for information systems and organizations."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            NIST SP 800-53 is the foundational control catalog used by federal
            agencies and many private-sector organizations. Three control
            families are directly relevant to vulnerability scanning:
          </p>
          <h3 className="text-sm font-semibold" style={{ color: "var(--dg-text)" }}>
            RA-5: Vulnerability Monitoring and Scanning
          </h3>
          <p>
            Requires organizations to scan for vulnerabilities in information
            systems and hosted applications at a defined frequency, analyze scan
            results, and remediate legitimate vulnerabilities within
            organization-defined response times. RA-5 also mandates sharing
            vulnerability information across the organization to enable
            situational awareness.
          </p>
          <h3 className="text-sm font-semibold" style={{ color: "var(--dg-text)" }}>
            SI-2: Flaw Remediation
          </h3>
          <p>
            Requires organizations to identify, report, and correct information
            system flaws. This includes installing security-relevant software
            updates within defined time periods and incorporating flaw
            remediation into the configuration management process. SI-2
            establishes that scanning alone is insufficient — organizations must
            also track remediation to closure.
          </p>
          <h3 className="text-sm font-semibold" style={{ color: "var(--dg-text)" }}>
            CM-8: System Component Inventory
          </h3>
          <p>
            Requires organizations to develop and maintain an inventory of
            system components that is accurate, current, and at a level of
            granularity sufficient for tracking and reporting. In the context of
            container scanning, this maps directly to maintaining a software
            bill of materials (SBOM) for deployed artifacts.
          </p>
        </div>
      </section>

      {/* NIST SP 800-171 */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="NIST SP 800-171"
          blurb="Protecting Controlled Unclassified Information (CUI) in nonfederal systems."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            NIST SP 800-171 defines the security requirements for protecting CUI
            when it resides on nonfederal systems. It is the basis for DFARS
            252.204-7012, making it mandatory for all Department of Defense (DoD)
            contractors and subcontractors. Two requirements address
            vulnerability management directly:
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>
              <strong>3.11.2</strong> — Scan for vulnerabilities in
              organizational systems and applications periodically and when new
              vulnerabilities affecting those systems and applications are
              identified and reported.
            </li>
            <li>
              <strong>3.11.3</strong> — Remediate vulnerabilities in accordance
              with risk assessments.
            </li>
          </ul>
          <p>
            For organizations pursuing CMMC (Cybersecurity Maturity Model
            Certification), these controls are assessed at Level 2 and above.
            Failure to demonstrate active vulnerability scanning and remediation
            will result in assessment findings.
          </p>
        </div>
      </section>

      {/* FedRAMP */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="FedRAMP"
          blurb="Federal Risk and Authorization Management Program for cloud service providers."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            FedRAMP requires cloud service providers (CSPs) selling to federal
            agencies to implement continuous monitoring, which includes monthly
            vulnerability scanning of all system components. Key requirements
            include:
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>
              Monthly operating system and application-level vulnerability scans
              with results reported to the authorizing agency.
            </li>
            <li>
              High-severity findings (CVSS 7.0+) must be remediated within 30
              days. Critical findings (CVSS 9.0+) require remediation within 15
              days in some agency-specific baselines.
            </li>
            <li>
              All findings not remediated within the defined window must be
              documented in a Plan of Action and Milestones (POA&amp;M) with
              target completion dates.
            </li>
            <li>
              Container images used in production must be scanned before
              deployment and rescanned on a recurring basis.
            </li>
          </ul>
          <p>
            FedRAMP continuous monitoring reports are reviewed by agency
            Authorizing Officials, making scan accuracy and completeness a
            direct factor in maintaining authorization.
          </p>
        </div>
      </section>

      {/* EO 14028 */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Executive Order 14028"
          blurb="Improving the nation&apos;s cybersecurity through software supply chain transparency."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            Executive Order 14028 (May 2021) established that software vendors
            selling to the federal government must provide a Software Bill of
            Materials (SBOM) for their products. The NTIA defined the minimum
            elements that an SBOM must include:
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>Supplier name for each component</li>
            <li>Component name and version string</li>
            <li>Unique identifiers (such as CPE or PURL)</li>
            <li>Dependency relationships between components</li>
            <li>Author of the SBOM data</li>
            <li>Timestamp indicating when the SBOM was generated</li>
          </ul>
          <p>
            The order also directs agencies to adopt a &quot;zero trust&quot;
            architecture and mandates that critical software vendors attest to
            secure development practices. SBOM generation is no longer a
            voluntary best practice — it is a contractual requirement for
            federal procurement.
          </p>
        </div>
      </section>

      {/* PCI-DSS 4.0 */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="PCI-DSS 4.0"
          blurb="Payment Card Industry Data Security Standard for organizations handling cardholder data."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            PCI-DSS 4.0 applies to any organization that stores, processes, or
            transmits credit card data. Two requirements are directly relevant
            to vulnerability scanning:
          </p>
          <h3 className="text-sm font-semibold" style={{ color: "var(--dg-text)" }}>
            Requirement 6: Develop and Maintain Secure Systems and Software
          </h3>
          <p>
            Requires organizations to establish a process for identifying and
            assigning risk rankings to newly discovered vulnerabilities, and to
            install applicable security patches within defined timeframes.
            Critical patches must be installed within one month of release.
            Custom application code must be reviewed for vulnerabilities before
            deployment.
          </p>
          <h3 className="text-sm font-semibold" style={{ color: "var(--dg-text)" }}>
            Requirement 11.3: Vulnerability Scanning
          </h3>
          <p>
            Mandates internal vulnerability scans at least quarterly and after
            any significant change. External scans must be performed by an
            Approved Scanning Vendor (ASV). Scans must achieve a
            &quot;passing&quot; result, meaning no vulnerabilities scored CVSS
            4.0 or higher remain unresolved. Rescans are required until a
            passing result is achieved.
          </p>
        </div>
      </section>

      {/* SOC 2 */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="SOC 2 Type II"
          blurb="Trust Services Criteria for service organizations handling customer data."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            SOC 2 Type II audits evaluate the operating effectiveness of
            controls over a period of time (typically 6-12 months). The Common
            Criteria control CC7.1 requires that the entity uses detection and
            monitoring procedures to identify changes to configurations that
            result in new vulnerabilities, and susceptibilities to newly
            discovered vulnerabilities.
          </p>
          <p>
            In practice, auditors expect to see:
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>
              Evidence of regular vulnerability scanning with timestamps and
              results
            </li>
            <li>
              A documented process for triaging and remediating findings
            </li>
            <li>
              Proof that critical and high vulnerabilities were addressed within
              the organization&apos;s stated SLA
            </li>
            <li>
              Exportable scan reports that can be provided to the audit firm
            </li>
          </ul>
          <p>
            For SaaS vendors, SOC 2 reports are frequently requested by
            enterprise customers during vendor security assessments. The ability
            to produce structured, machine-readable vulnerability scan evidence
            significantly reduces audit preparation time.
          </p>
        </div>
      </section>

      {/* HIPAA */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="HIPAA"
          blurb="Health Insurance Portability and Accountability Act security requirements."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            The HIPAA Security Rule requires covered entities and business
            associates to implement technical safeguards that protect electronic
            Protected Health Information (ePHI). While HIPAA does not prescribe
            specific scanning tools or frequencies, the Risk Analysis
            requirement (45 CFR 164.308(a)(1)) mandates that organizations:
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>
              Conduct an accurate and thorough assessment of potential risks and
              vulnerabilities to the confidentiality, integrity, and
              availability of ePHI
            </li>
            <li>
              Implement security measures sufficient to reduce risks and
              vulnerabilities to a reasonable and appropriate level
            </li>
            <li>
              Regularly review records of information system activity, including
              audit logs and access reports
            </li>
          </ul>
          <p>
            In enforcement actions, OCR has consistently cited the failure to
            conduct adequate risk analysis — which includes vulnerability
            identification — as a primary basis for penalties. Organizations
            handling PHI should treat vulnerability scanning as a core
            component of their risk analysis program.
          </p>
        </div>
      </section>

      {/* CISA BOD 22-01 */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="CISA BOD 22-01"
          blurb="Binding Operational Directive requiring remediation of Known Exploited Vulnerabilities."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            Binding Operational Directive 22-01 requires all federal civilian
            executive branch (FCEB) agencies to remediate vulnerabilities listed
            in CISA&apos;s Known Exploited Vulnerabilities (KEV) catalog within
            specified timeframes. The KEV catalog contains CVEs that CISA has
            confirmed are being actively exploited in the wild.
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>
              Agencies must remediate internet-facing KEV entries within 15
              calendar days of the vulnerability being added to the catalog
            </li>
            <li>
              All other KEV entries must be remediated within 25 calendar days
            </li>
            <li>
              Agencies must report remediation status to CISA on a recurring
              basis
            </li>
          </ul>
          <p>
            While BOD 22-01 is binding only for federal agencies, CISA strongly
            recommends that all organizations use the KEV catalog to prioritize
            remediation. Many private-sector security teams have adopted KEV
            as a prioritization signal alongside CVSS and EPSS scores.
          </p>
        </div>
      </section>

      {/* How ScanRook helps */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="How ScanRook helps"
          blurb="Mapping ScanRook capabilities to compliance requirements."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            ScanRook is designed to produce the artifacts and evidence that
            compliance frameworks require. The following table maps specific
            scanner features to the regulatory controls they support:
          </p>
          <div className="grid gap-3">
            <CapabilityRow
              capability="SBOM generation (CycloneDX, SPDX)"
              frameworks="EO 14028 SBOM mandate, CM-8 component inventory"
            />
            <CapabilityRow
              capability="CVE tracking with fix status and fixed-in versions"
              frameworks="RA-5 vulnerability scanning, SI-2 flaw remediation, PCI-DSS 11.3"
            />
            <CapabilityRow
              capability="EPSS probability scoring and prioritization"
              frameworks="Risk-based remediation for SOC 2, FedRAMP POA&M triage"
            />
            <CapabilityRow
              capability="CISA KEV catalog flagging"
              frameworks="BOD 22-01 KEV remediation timelines"
            />
            <CapabilityRow
              capability="Structured JSON report export"
              frameworks="SOC 2 audit evidence, FedRAMP monthly reporting, PCI-DSS scan documentation"
            />
            <CapabilityRow
              capability="Self-hosted deployment option"
              frameworks="Data sovereignty, HIPAA ePHI handling, air-gapped environments"
            />
          </div>
          <p>
            Compliance is not about checking boxes — it is about building a
            defensible, repeatable process for identifying and addressing risk.
            ScanRook provides the scanning engine and structured output that
            organizations need to demonstrate that process to auditors,
            assessors, and customers.
          </p>
        </div>
      </section>

      {/* Further reading */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Further reading"
          blurb="Related guides and documentation."
        />
        <ul className="list-disc pl-6 text-sm muted grid gap-1">
          <li>
            <Link
              href="/blog/compliance-scanning-guide"
              className="font-medium underline underline-offset-2"
            >
              Compliance Scanning Guide
            </Link>{" "}
            — A practical walkthrough for integrating ScanRook into your
            compliance program.
          </li>
          <li>
            <Link
              href="/docs/concepts/enrichment"
              className="font-medium underline underline-offset-2"
            >
              Enrichment
            </Link>{" "}
            — How ScanRook queries OSV, NVD, distro feeds, EPSS, and KEV to
            produce actionable findings.
          </li>
        </ul>
      </section>
    </article>
  );
}

function SectionHeader({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="grid gap-1">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm muted">{blurb}</p>
    </div>
  );
}

function CapabilityRow({
  capability,
  frameworks,
}: {
  capability: string;
  frameworks: string;
}) {
  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid sm:grid-cols-2 gap-2">
      <div>
        <div
          className="text-xs font-semibold mb-0.5"
          style={{ color: "var(--dg-text)" }}
        >
          Capability
        </div>
        <p className="text-sm muted">{capability}</p>
      </div>
      <div>
        <div
          className="text-xs font-semibold mb-0.5"
          style={{ color: "var(--dg-text)" }}
        >
          Frameworks
        </div>
        <p className="text-sm muted">{frameworks}</p>
      </div>
    </div>
  );
}
