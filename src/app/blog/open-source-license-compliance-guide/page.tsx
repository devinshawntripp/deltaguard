import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";

const title = `The Complete Guide to Open Source License Compliance in 2026 | ${APP_NAME}`;
const description =
  "A comprehensive guide to open source license compliance covering legal risks, common mistakes, building a compliance program, tooling comparisons, and SBOM integration.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "open source license compliance",
    "GPL compliance guide",
    "software license management",
    "SBOM license",
    "open source legal risk",
    "license audit",
    "software composition analysis",
    "open source compliance program",
    "SPDX compliance",
  ],
  alternates: {
    canonical: "/blog/open-source-license-compliance-guide",
  },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/open-source-license-compliance-guide",
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
    "The Complete Guide to Open Source License Compliance in 2026",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage:
    "https://scanrook.io/blog/open-source-license-compliance-guide",
  datePublished: "2026-04-19",
  dateModified: "2026-04-19",
};

export default function LicenseComplianceGuidePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 grid gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="surface-card p-8 grid gap-6">
        <header className="grid gap-3">
          <div className="text-xs uppercase tracking-wide muted">
            License Compliance
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            The Complete Guide to Open Source License Compliance in 2026
          </h1>
          <p className="text-sm muted">
            Open source software powers virtually every modern application.
            The average commercial application contains over 500 open source
            components, each carrying its own license terms. Getting
            compliance wrong can mean forced source code disclosure, litigation,
            blocked acquisitions, or regulatory penalties. This guide covers
            everything you need to know to build and maintain a compliant open
            source program.
          </p>
          <time className="text-xs muted">April 19, 2026</time>
        </header>

        {/* Why License Compliance Matters */}
        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Why License Compliance Matters
          </h2>
          <p className="text-sm muted">
            License compliance is not a theoretical concern. Companies have
            been sued, acquisitions have been renegotiated, and products have
            been pulled from the market because of open source license
            violations. Here are the real risks:
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Litigation
          </h3>
          <p className="text-sm muted">
            In <em>Artifex Software v. Hancom</em> (2017), Artifex sued
            South Korean office suite maker Hancom for using Ghostscript under
            the AGPL without complying with the license terms. The court held
            that the GPL is an enforceable contract, and Hancom&apos;s failure
            to comply with the AGPL&apos;s source code disclosure requirements
            constituted both copyright infringement and breach of contract.
            Hancom settled for an undisclosed sum.
          </p>
          <p className="text-sm muted">
            The{" "}
            <a
              href="https://sfconservancy.org/"
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Software Freedom Conservancy
            </a>{" "}
            has pursued GPL enforcement against multiple consumer electronics
            manufacturers, including a multi-year campaign against VMware
            (resolved in 2019) and ongoing efforts to ensure TV and router
            manufacturers comply with the Linux kernel&apos;s GPL-2.0 license.
            In Germany, the{" "}
            <a
              href="https://gpl-violations.org/"
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              gpl-violations.org
            </a>{" "}
            project led by Harald Welte secured over 100 compliance commitments
            through legal action in German courts between 2004 and 2014.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            M&A due diligence
          </h3>
          <p className="text-sm muted">
            Open source compliance is a standard item in technology M&A due
            diligence. Acquirers hire specialized firms (historically Black
            Duck, now Synopsys SCA) to audit the target&apos;s codebase for
            license risks. Discovering undisclosed copyleft dependencies can
            reduce the acquisition price, delay closing, or kill the deal
            entirely. A 2023 Synopsys OSSRA report found that 84% of codebases
            audited during M&A contained components with license conflicts.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Regulatory requirements
          </h3>
          <p className="text-sm muted">
            Regulatory pressure on software supply chain transparency is
            accelerating. The EU{" "}
            <a
              href="https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act"
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cyber Resilience Act
            </a>{" "}
            (CRA), which enters enforcement in 2027, requires manufacturers
            of products with digital elements to provide an SBOM that includes
            license information for all third-party components. US Executive
            Order 14028 mandates SBOM delivery for software sold to federal
            agencies, and the NTIA minimum elements for SBOMs include component
            licensing data. The{" "}
            <a
              href="https://www.nist.gov/cyberframework"
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              NIST Cybersecurity Framework
            </a>{" "}
            2.0 explicitly references supply chain risk management, which
            encompasses license compliance.
          </p>
        </section>

        {/* The License Landscape */}
        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            The License Landscape in 2026
          </h2>
          <p className="text-sm muted">
            Understanding how licenses are distributed across ecosystems
            helps you anticipate where compliance risks are most likely to
            arise.
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>
              <strong>npm (JavaScript)</strong> -- MIT dominates at
              approximately 70% of packages. ISC and Apache-2.0 together
              account for another 15%. GPL usage is rare (&lt;2%), making
              the JavaScript ecosystem one of the safest for commercial use.
            </li>
            <li>
              <strong>PyPI (Python)</strong> -- MIT and Apache-2.0 are roughly
              equal, together covering about 60% of packages. GPL usage is
              higher than npm (approximately 8-10%), particularly in
              scientific computing and system administration tools.
            </li>
            <li>
              <strong>Maven Central (Java)</strong> -- Apache-2.0 is the most
              common license, reflecting the Apache Software Foundation&apos;s
              influence on the Java ecosystem. EPL-2.0 is notable due to the
              Eclipse Foundation. GPL-2.0 with Classpath Exception is used by
              core Java SE libraries (OpenJDK).
            </li>
            <li>
              <strong>crates.io (Rust)</strong> -- The Rust ecosystem strongly
              favors dual licensing under MIT OR Apache-2.0, following the
              Rust standard library&apos;s example. This gives users the
              choice of either license, providing both the simplicity of MIT
              and the patent protection of Apache-2.0.
            </li>
            <li>
              <strong>Linux distributions</strong> -- The kernel is GPL-2.0.
              Userspace utilities span the full spectrum: glibc is LGPL-2.1,
              busybox is GPL-2.0, systemd is LGPL-2.1, and coreutils is
              GPL-3.0. Container images based on Linux distributions inherit
              these licenses.
            </li>
          </ul>
          <p className="text-sm muted">
            For a detailed breakdown of every license type and its obligations,
            see our{" "}
            <Link
              href="/docs/concepts/license-types"
              className="font-medium underline underline-offset-2"
            >
              Open Source License Types reference
            </Link>
            .
          </p>
        </section>

        {/* Common Compliance Mistakes */}
        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Common Compliance Mistakes
          </h2>
          <p className="text-sm muted">
            These are the mistakes we see most frequently in the codebases
            that {APP_NAME} scans. Every one of them is avoidable with proper
            tooling and process.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Using AGPL or GPL in SaaS without source disclosure
          </h3>
          <p className="text-sm muted">
            The most common and most serious mistake. Many developers assume
            that the GPL&apos;s copyleft is only triggered by distributing
            binaries, making it irrelevant for SaaS. This is true for GPL-2.0
            and GPL-3.0 -- but AGPL-3.0 was specifically designed to close
            this loophole. Any user who interacts with an AGPL application over
            a network must be offered the source code. Organizations running
            SaaS that includes any AGPL dependency -- even a transitive one --
            must either disclose their entire application source code or remove
            the AGPL component.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Mixing incompatible licenses
          </h3>
          <p className="text-sm muted">
            Apache-2.0 and GPL-2.0 are incompatible. Code under both licenses
            cannot be combined in the same work. This is a frequent issue in
            Java projects that mix Apache Foundation libraries (Apache-2.0)
            with GNU tooling (GPL-2.0). The fix is usually to upgrade to a
            GPL-3.0 compatible alternative, since Apache-2.0 is compatible
            with GPL-3.0 but not GPL-2.0.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Ignoring transitive dependencies
          </h3>
          <p className="text-sm muted">
            Your project might only use MIT-licensed packages directly, but
            those packages have their own dependencies, which have their own
            dependencies. A single GPL-3.0 package three levels deep in your
            dependency tree creates the same obligation as if you had added it
            directly. Modern dependency trees routinely contain hundreds of
            transitive dependencies. Without automated scanning, it is
            impossible to track the licenses of all of them manually.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Assuming &quot;no license&quot; means &quot;public domain&quot;
          </h3>
          <p className="text-sm muted">
            When a package has no license declaration, the default under
            copyright law is that the author retains all rights. No license
            means you have <em>no permission</em> to use, modify, or
            distribute the code. This is legally riskier than any copyleft
            license. {APP_NAME} flags unlicensed packages as &quot;Unknown&quot;
            risk, which should be treated as a policy violation until the
            license is clarified.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Failing to provide attribution
          </h3>
          <p className="text-sm muted">
            Even the most permissive licenses (MIT, BSD, Apache-2.0) require
            attribution -- including the copyright notice and license text in
            your distribution. Many organizations ship software without a
            NOTICES or THIRD-PARTY-LICENSES file, technically violating every
            open source license they use. While enforcement against attribution
            violations is rare, it is trivially avoidable and becomes relevant
            in M&A audits.
          </p>
        </section>

        {/* How to Build a Compliance Program */}
        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            How to Build a Compliance Program
          </h2>
          <p className="text-sm muted">
            A functioning open source compliance program has five stages.
            Organizations at any maturity level can start with stage one and
            build incrementally.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Stage 1: Inventory
          </h3>
          <p className="text-sm muted">
            You cannot manage what you do not measure. The first step is to
            produce a complete inventory of every open source component in
            every product you ship. This means scanning every container image,
            binary, and source archive -- not just your direct dependencies
            in package.json, but the full transitive tree including OS-level
            packages in your base image. The output of this stage is an SBOM
            (Software Bill of Materials) for every artifact.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Stage 2: Classify
          </h3>
          <p className="text-sm muted">
            For each component in the inventory, identify the license and
            assign a risk level. ScanRook&apos;s{" "}
            <Link
              href="/docs/concepts/license-scanning"
              className="font-medium underline underline-offset-2"
            >
              license risk tiers
            </Link>{" "}
            (Critical, High, Medium, Low, None) provide a starting framework.
            Your legal team may adjust these based on your specific business
            model -- for example, a company that only runs software internally
            (never distributes it) faces lower risk from GPL than a company
            that ships on-premise products.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Stage 3: Review
          </h3>
          <p className="text-sm muted">
            Components at Medium risk and above should be reviewed by someone
            who understands the license terms -- typically your legal team or
            an open source program office (OSPO). The review should answer:
            is our use compatible with this license? If copyleft, does our
            distribution method trigger the copyleft obligation? Are there
            compatibility conflicts with other licenses in the same product?
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Stage 4: Approve or Replace
          </h3>
          <p className="text-sm muted">
            Based on the review, each component is either approved (with
            documented compliance steps) or flagged for replacement. For
            components that are approved with obligations -- such as LGPL
            libraries that require dynamic linking -- document the specific
            compliance steps the engineering team must follow. Maintain an
            approved license list that developers can reference before adding
            new dependencies.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Stage 5: Monitor
          </h3>
          <p className="text-sm muted">
            Compliance is not a one-time activity. Dependencies change,
            licenses change (as Elasticsearch demonstrated), and new
            dependencies are added constantly. Integrate license scanning into
            your CI/CD pipeline so that every build is checked against your
            approved license list. Set up scheduled scanning for deployed
            container images. Use{" "}
            <Link
              href="/docs/integrations/github-actions"
              className="font-medium underline underline-offset-2"
            >
              GitHub Actions
            </Link>{" "}
            or{" "}
            <Link
              href="/docs/integrations/gitlab-ci"
              className="font-medium underline underline-offset-2"
            >
              GitLab CI
            </Link>{" "}
            to fail builds that introduce blocked licenses.
          </p>
        </section>

        {/* Tools for License Compliance */}
        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Tools for License Compliance
          </h2>
          <p className="text-sm muted">
            The license scanning market includes tools at every price point
            and capability level. Here is an honest assessment of the major
            options:
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Synopsys Black Duck (formerly Black Duck Software)
          </h3>
          <p className="text-sm muted">
            The original and still the most comprehensive license scanning
            tool. Black Duck&apos;s KnowledgeBase is the largest proprietary
            database of open source code fingerprints, enabling snippet-level
            detection of copied code. Best suited for M&A due diligence and
            organizations with large, legacy codebases that may contain
            vendored or copy-pasted code. Pricing starts around $100,000/year
            for enterprise licenses. The main drawback is cost and complexity
            -- Black Duck requires significant infrastructure and professional
            services to deploy effectively.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            FOSSA
          </h3>
          <p className="text-sm muted">
            A modern SCA platform focused on license compliance and SBOM
            generation. FOSSA integrates well with CI/CD pipelines and provides
            a polished dashboard for policy management. Strong at dependency
            analysis for application-level package managers (npm, pip, Maven).
            Pricing is not publicly listed but typically starts around
            $20,000/year. Weaker at container-level scanning and does not match
            Black Duck&apos;s snippet detection capabilities.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            {APP_NAME}
          </h3>
          <p className="text-sm muted">
            Integrated vulnerability, license, and SBOM scanning in a single
            tool. Extracts license data from package manager databases (RPM,
            APK, dpkg, npm, pip, Cargo) and normalizes to SPDX identifiers.
            License risk classification, policy enforcement, and compatibility
            analysis are included at every tier. Self-hosted deployment is
            available for air-gapped environments. The free tier includes
            license detection; Pro and Enterprise tiers add policy gates and
            compliance reporting. See{" "}
            <Link
              href="/pricing"
              className="font-medium underline underline-offset-2"
            >
              pricing
            </Link>{" "}
            for details.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Trivy (Aqua Security)
          </h3>
          <p className="text-sm muted">
            Open source vulnerability scanner that includes basic license
            detection. Trivy reads license information from package metadata
            and can output SPDX and CycloneDX SBOMs with license data. Free
            and easy to integrate into CI/CD. However, Trivy&apos;s license
            detection is limited to what is in package metadata -- there is no
            snippet matching, no pattern matching against license text files,
            and no policy engine. Good for basic detection, insufficient for
            compliance programs that need risk classification and enforcement.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            ScanCode Toolkit (nexB)
          </h3>
          <p className="text-sm muted">
            Open source (Apache-2.0) license detection engine with over 1,800
            license patterns. ScanCode is the most accurate open source license
            text detector available, capable of identifying licenses from
            fragments, notices, and partial texts. It is a CLI-only tool with
            no dashboard, no policy engine, and no vulnerability scanning.
            Best suited as a component in a larger toolchain rather than a
            standalone compliance solution.
          </p>
        </section>

        {/* SBOM and License Compliance */}
        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            SBOM and License Compliance
          </h2>
          <p className="text-sm muted">
            SBOMs (Software Bills of Materials) are the foundation of license
            compliance at scale. An SBOM provides a machine-readable inventory
            of every component in a software artifact, including license data.
            Two standards dominate:
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>
              <strong>
                <a
                  href="https://spdx.dev/"
                  className="font-medium underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  SPDX
                </a>
              </strong>{" "}
              -- The ISO/IEC 5962:2021 standard maintained by the Linux
              Foundation. SPDX documents include a{" "}
              <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">
                licenseConcluded
              </code>{" "}
              and{" "}
              <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">
                licenseDeclared
              </code>{" "}
              field for each package, distinguishing between the license the
              scanner detected and the license the package author declared.
              SPDX also supports document-level license expressions for the
              entire distribution.
            </li>
            <li>
              <strong>
                <a
                  href="https://cyclonedx.org/"
                  className="font-medium underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CycloneDX
                </a>
              </strong>{" "}
              -- An OWASP standard originally designed for vulnerability
              tracking that has expanded to include license data. Each
              component in a CycloneDX SBOM can include a{" "}
              <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">
                licenses
              </code>{" "}
              array with SPDX identifiers, license names, or full license
              texts.
            </li>
          </ul>
          <p className="text-sm muted">
            Both formats are accepted for compliance with Executive Order 14028
            and the EU CRA. {APP_NAME} can generate SBOMs in both formats with
            license data included for every detected package. For more on
            SBOMs, see our{" "}
            <Link
              href="/blog/what-is-sbom-and-how-scanrook-uses-it"
              className="font-medium underline underline-offset-2"
            >
              SBOM guide
            </Link>
            .
          </p>
        </section>

        {/* Automating Compliance */}
        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Automating Compliance in CI/CD
          </h2>
          <p className="text-sm muted">
            Manual compliance review does not scale. The most effective
            compliance programs automate the majority of decisions and reserve
            human review for edge cases. Here is how to set up automated
            license compliance:
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Define your license policy
          </h3>
          <p className="text-sm muted">
            Work with your legal team to create three lists: (1) approved
            licenses that require no review (typically MIT, BSD, Apache-2.0,
            ISC), (2) licenses that require review before use (typically LGPL,
            MPL, EPL), and (3) blocked licenses that are never allowed
            (typically AGPL, GPL, SSPL for commercial SaaS). Encode these
            lists in your scanning tool&apos;s policy configuration.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Scan on every build
          </h3>
          <p className="text-sm muted">
            Add license scanning to your CI/CD pipeline so that every pull
            request is checked against your policy. {APP_NAME}&apos;s{" "}
            <Link
              href="/docs/integrations/github-actions"
              className="font-medium underline underline-offset-2"
            >
              GitHub Actions integration
            </Link>{" "}
            can fail a build when a blocked license is detected, with a clear
            error message identifying the package and its license. This
            prevents policy violations from reaching production.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Scan deployed images on a schedule
          </h3>
          <p className="text-sm muted">
            CI/CD scanning catches new violations at build time, but existing
            deployments may contain violations that were introduced before
            scanning was enabled. Schedule periodic scans of your deployed
            container images to catch pre-existing issues and detect license
            changes in upstream dependencies that may have been updated in
            place.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Generate attribution documents automatically
          </h3>
          <p className="text-sm muted">
            Use SBOM output to automatically generate a THIRD-PARTY-LICENSES
            or NOTICES file that lists every open source component, its
            license, and the copyright notice. This satisfies the attribution
            requirements of MIT, BSD, and Apache-2.0 licenses. Automating this
            ensures that your attribution file is always current and complete,
            eliminating a common audit finding.
          </p>
        </section>

        {/* Getting Started */}
        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Getting Started
          </h2>
          <p className="text-sm muted">
            If you have never done license compliance before, start small:
            scan your most important production artifact, review the license
            inventory, and identify any copyleft or unknown licenses. That
            single scan will tell you whether you have an urgent problem or a
            manageable backlog. From there, build your approved license list,
            integrate scanning into CI/CD, and progressively cover more
            artifacts.
          </p>
          <p className="text-sm muted">
            {APP_NAME} makes this easy. Upload any container image, source
            archive, or binary, and you will get a complete license inventory
            alongside vulnerability findings and SBOM data -- all from one
            scan, in one dashboard.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link className="btn-secondary" href="/dashboard">
              Start scanning
            </Link>
            <Link className="btn-secondary" href="/docs/concepts/license-scanning">
              License scanning docs
            </Link>
            <Link className="btn-secondary" href="/docs/concepts/license-types">
              License types reference
            </Link>
            <Link className="btn-secondary" href="/pricing">
              View pricing
            </Link>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Further Reading
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              className="btn-secondary"
              href="/blog/what-we-learned-from-black-duck"
            >
              What we learned from Black Duck
            </Link>
            <Link
              className="btn-secondary"
              href="/blog/what-is-sbom-and-how-scanrook-uses-it"
            >
              What is an SBOM?
            </Link>
            <Link
              className="btn-secondary"
              href="/blog/compliance-scanning-guide"
            >
              Compliance scanning guide
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
