import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";
import SbomExplorer from "./SbomExplorer";

const title = `What Is an SBOM? The Complete Guide to Software Bill of Materials (2026) | ${APP_NAME}`;
const description =
  "Everything you need to know about SBOMs: CycloneDX vs SPDX formats, regulatory requirements (EO 14028, EU CRA), generation tools, and how vulnerability scanners use them. Interactive SBOM explorer included.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "SBOM",
    "software bill of materials",
    "CycloneDX",
    "SPDX",
    "sbom generator",
    "sbom requirements",
    "executive order 14028",
    "EU Cyber Resilience Act",
    "sbom format",
    "NTIA SBOM",
    "PURL",
    "VEX",
    "software supply chain",
    "ScanRook",
  ],
  alternates: {
    canonical: "/blog/what-is-sbom-and-how-scanrook-uses-it",
  },
  openGraph: {
    title: "What Is an SBOM? The Complete Guide to Software Bill of Materials (2026)",
    description,
    type: "article",
    url: "/blog/what-is-sbom-and-how-scanrook-uses-it",
  },
  twitter: {
    card: "summary_large_image",
    title: "What Is an SBOM? The Complete Guide to Software Bill of Materials (2026)",
    description,
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "What Is an SBOM? The Complete Guide to Software Bill of Materials (2026)",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/what-is-sbom-and-how-scanrook-uses-it",
  datePublished: "2026-02-27",
  dateModified: "2026-05-02",
};

const faqItems = [
  {
    q: "What does SBOM stand for?",
    a: "SBOM stands for Software Bill of Materials. It is a formal, machine-readable inventory of all software components, libraries, and dependencies that make up a software product. The term draws from manufacturing, where a bill of materials (BOM) lists every part in a physical product.",
  },
  {
    q: "Is an SBOM required by law?",
    a: "In several jurisdictions, yes. US Executive Order 14028 (May 2021) requires SBOMs for all software sold to the federal government. The EU Cyber Resilience Act (CRA), which takes full effect in 2027, mandates SBOMs for all products with digital elements sold in the European Union. The FDA requires SBOMs for medical device premarket submissions. Many enterprise procurement processes now require SBOMs as a contractual condition even when not legally mandated.",
  },
  {
    q: "What is the difference between CycloneDX and SPDX?",
    a: "CycloneDX is maintained by OWASP and focuses on security use cases. It natively supports vulnerability data (VEX), dependency graphs, and composition analysis. SPDX is maintained by the Linux Foundation and is an ISO/IEC standard (ISO/IEC 5962:2021) originally designed for license compliance. SPDX has broader industry recognition for legal and compliance teams, while CycloneDX is more commonly used in DevSecOps pipelines. Both support JSON and XML formats, and both can represent the same core component data.",
  },
  {
    q: "How often should I generate an SBOM?",
    a: "Best practice is to generate an SBOM with every build. In CI/CD pipelines, this means creating a new SBOM for each release candidate, pull request merge, or container image build. At minimum, regenerate the SBOM whenever dependencies change (e.g., after running npm install, pip install, or go mod tidy). Stale SBOMs that do not reflect the actual deployed software are worse than no SBOM at all.",
  },
  {
    q: "Can I generate an SBOM from a container image?",
    a: "Yes. Tools like Syft, Trivy, and ScanRook can analyze a container image (or its exported tar archive) and produce an SBOM listing all installed packages, libraries, and binaries. Container images are one of the most common SBOM targets because they represent a complete, deployable unit of software.",
  },
  {
    q: "Does an SBOM include vulnerability data?",
    a: "A standard SBOM (CycloneDX or SPDX) contains only the inventory of components — names, versions, licenses, suppliers, and relationships. It does not contain vulnerability assessments. Vulnerability data is added by scanning tools that check each SBOM component against databases like OSV, NVD, and vendor advisories. CycloneDX supports an extension called VEX (Vulnerability Exploitability eXchange) that can embed vulnerability status alongside the component data.",
  },
  {
    q: "What is VEX and how does it relate to SBOMs?",
    a: "VEX (Vulnerability Exploitability eXchange) is a companion document or embedded section that communicates the status of vulnerabilities in the context of a specific product. While an SBOM says 'this product contains lodash 4.17.20', VEX adds context like 'the known command injection vulnerability in lodash 4.17.20 is not exploitable in this product because the affected function is never called.' CycloneDX natively supports VEX in its format. SPDX is adding VEX support in later versions. VEX helps reduce false positives in vulnerability reports by adding product-specific context.",
  },
  {
    q: "How do I share an SBOM with customers?",
    a: "The NTIA recommends several distribution methods: hosting SBOMs at a well-known URL (e.g., https://example.com/.well-known/sbom), embedding them in container image labels or OCI annotations, publishing them alongside release artifacts on GitHub or package registries, and providing them through a customer portal. The SBOM should be signed (e.g., with Sigstore cosign) to verify authenticity. Avoid sharing SBOMs only via email attachments, as this does not scale and makes updates difficult to track.",
  },
  {
    q: "What is PURL (Package URL)?",
    a: "PURL (Package URL) is a standardized format for identifying software packages across ecosystems. It follows the format 'pkg:type/namespace/name@version'. For example, 'pkg:npm/express@4.18.2' uniquely identifies Express.js version 4.18.2 from the npm registry, while 'pkg:pypi/django@4.2.11' identifies Django from PyPI. PURLs appear in both CycloneDX and SPDX SBOMs and are the primary key used by vulnerability databases to match packages to known CVEs.",
  },
  {
    q: "What tools can generate SBOMs?",
    a: "Several open-source and commercial tools generate SBOMs. Syft (by Anchore) is popular for container image analysis. Trivy (by Aqua Security) generates SBOMs as part of its multi-format scanning output. cdxgen supports source code analysis across many languages. Microsoft sbom-tool integrates with build systems. ScanRook generates enriched SBOMs that include vulnerability data from OSV, NVD, and Red Hat OVAL. Most modern CI/CD platforms (GitHub Actions, GitLab CI, Jenkins) have plugins or built-in steps for SBOM generation.",
  },
  {
    q: "How does ScanRook use SBOMs?",
    a: "ScanRook can both generate and consume SBOMs. When scanning a container image or source archive, ScanRook produces an SBOM as part of its report, listing every detected package with its version, ecosystem, and PURL. It then enriches each component by checking against OSV, NVD CVSS scores, EPSS exploit probability scores, the CISA Known Exploited Vulnerabilities catalog, and Red Hat OVAL data. ScanRook also supports SBOM diff — comparing two SBOMs to identify added, removed, and changed components between versions.",
  },
  {
    q: "Is SBOM generation free?",
    a: "Yes, SBOM generation is free with open-source tools like Syft, Trivy, cdxgen, and the Microsoft sbom-tool. The SBOM formats (CycloneDX, SPDX) are open standards with no licensing fees. The vulnerability databases used for enrichment (OSV, NVD) are also free to query. Commercial tools like Snyk, Black Duck, and ScanRook offer additional features (enterprise dashboards, policy enforcement, team management, and advanced enrichment) on paid plans, but the core SBOM generation capability is available at no cost.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

const codeStyle =
  "text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5";

const preStyle =
  "rounded-xl bg-black/[.04] dark:bg-white/[.04] p-5 overflow-x-auto text-xs leading-relaxed font-mono border border-black/5 dark:border-white/5";

const thStyle =
  "px-3 py-2 text-left text-xs font-semibold border-b border-black/10 dark:border-white/10 bg-black/[.03] dark:bg-white/[.03]";

const tdStyle =
  "px-3 py-2 text-xs border-b border-black/5 dark:border-white/5";

export default function WhatIsSbomPage() {
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

      {/* ── Header ── */}
      <section className="surface-card p-7 grid gap-5">
        <header className="grid gap-3">
          <div className="flex items-center gap-3 text-xs muted">
            <span className="uppercase tracking-wide">SBOM Guide</span>
            <span>|</span>
            <time dateTime="2026-02-27">Published Feb 27, 2026</time>
            <span>|</span>
            <time dateTime="2026-05-02">Updated May 2, 2026</time>
            <span>|</span>
            <span>18 min read</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            What Is an SBOM? The Complete Guide to Software Bill of Materials (2026)
          </h1>
          <p className="text-sm muted leading-relaxed">
            Everything you need to know about SBOMs (Software Bills of Materials): the CycloneDX and SPDX formats compared,
            regulatory requirements from US Executive Order 14028 to the EU Cyber Resilience Act, how to generate and
            consume SBOMs, and how vulnerability scanners use them to secure your software supply chain. Includes an
            interactive SBOM explorer you can use right now.
          </p>
        </header>
      </section>

      {/* ── 1. What Is an SBOM? ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          What Is an SBOM?
        </h2>
        <p className="text-sm muted leading-relaxed">
          An <strong>SBOM (Software Bill of Materials)</strong> is a machine-readable inventory of every software
          component in a product. It lists every library, framework, module, and operating system package that ships
          inside an application, container image, firmware, or device — along with version numbers, suppliers,
          licenses, and cryptographic hashes.
        </p>
        <p className="text-sm muted leading-relaxed">
          The easiest way to understand an SBOM is by analogy: it is a <strong>nutrition label for software</strong>.
          Just as food labels list every ingredient and its proportion, an SBOM lists every component and its version.
          When a new vulnerability is discovered in a library — say, a critical flaw in <code className={codeStyle}>log4j-core</code> —
          an SBOM lets you instantly answer the question: <em>&quot;Do we use this library, and if so, where?&quot;</em>
          Without an SBOM, that question can take hours or days of manual investigation across repositories, container
          registries, and deployment environments.
        </p>
        <p className="text-sm muted leading-relaxed">
          The term &quot;Software Bill of Materials&quot; was coined around 2018, borrowing from the manufacturing
          concept of a bill of materials (BOM) that lists every part in a physical product. The concept gained mainstream
          attention after the{" "}
          <a
            href="https://www.whitehouse.gov/briefing-room/presidential-actions/2021/05/12/executive-order-on-improving-the-nations-cybersecurity/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2"
          >
            US Executive Order 14028
          </a>{" "}
          in May 2021, which mandated SBOMs for all software sold to the federal government. Since then, SBOMs have
          moved from a niche practice to a fundamental requirement in enterprise software security.
        </p>

        <h3 className="text-sm font-semibold mt-2">What an SBOM contains</h3>
        <ul className="list-disc pl-6 text-sm muted grid gap-1.5">
          <li><strong>Component name</strong> — the package name as it appears in the package manager (e.g., <code className={codeStyle}>express</code>, <code className={codeStyle}>django</code>, <code className={codeStyle}>openssl</code>)</li>
          <li><strong>Version</strong> — the exact version string installed (e.g., <code className={codeStyle}>4.18.2</code>, <code className={codeStyle}>3.0.13-r0</code>)</li>
          <li><strong>Supplier / Author</strong> — who published this component</li>
          <li><strong>License</strong> — the open source license (MIT, Apache-2.0, GPL-3.0, etc.)</li>
          <li><strong>Dependency relationships</strong> — which components depend on which</li>
          <li><strong>Package URL (PURL)</strong> — a standardized identifier like <code className={codeStyle}>pkg:npm/express@4.18.2</code></li>
          <li><strong>Cryptographic hashes</strong> — SHA-256 or SHA-512 digests to verify integrity</li>
          <li><strong>Timestamp</strong> — when the SBOM was generated</li>
        </ul>

        <h3 className="text-sm font-semibold mt-2">What an SBOM does NOT contain</h3>
        <p className="text-sm muted leading-relaxed">
          An SBOM is an inventory, not a security assessment. It does not tell you whether any component has known
          vulnerabilities — that is what vulnerability scanners add. An SBOM says &quot;this application contains
          lodash 4.17.20.&quot; A scanner takes that SBOM and checks OSV, NVD, and vendor advisories to report
          &quot;lodash 4.17.20 is affected by CVE-2021-23337 (command injection, CVSS 7.2).&quot; The two work
          together: the SBOM provides the inventory, the scanner provides the risk assessment.
        </p>
      </section>

      {/* ── 2. Why SBOMs Matter in 2026 ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          Why SBOMs Matter in 2026
        </h2>

        <h3 className="text-sm font-semibold mt-2">Regulatory requirements are no longer optional</h3>
        <p className="text-sm muted leading-relaxed">
          Three major regulations now require or will soon require SBOMs. US Executive Order 14028 applies to all
          software sold to the federal government. The{" "}
          <a
            href="https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2"
          >
            EU Cyber Resilience Act (CRA)
          </a>{" "}
          mandates SBOMs for all products with digital elements sold in the European Union, with full enforcement
          beginning in 2027. The FDA requires SBOMs as part of premarket submissions for medical devices with
          software components. These are not guidelines — they are legal requirements with enforcement mechanisms.
        </p>

        <h3 className="text-sm font-semibold mt-2">Supply chain attacks demand visibility</h3>
        <p className="text-sm muted leading-relaxed">
          The software supply chain attacks of the last five years have made SBOMs essential. The SolarWinds attack
          (2020) compromised a build pipeline, injecting malicious code into a legitimate update that was distributed
          to 18,000 organizations. Log4Shell (CVE-2021-44228) exposed a critical vulnerability in a ubiquitous Java
          logging library — organizations spent weeks determining which of their systems were affected. The XZ Utils
          backdoor (CVE-2024-3094) showed how a compromised maintainer could inject a backdoor into a widely-used
          compression library. In each case, organizations with SBOMs could identify their exposure in minutes
          rather than days.
        </p>

        <h3 className="text-sm font-semibold mt-2">Incident response speed</h3>
        <p className="text-sm muted leading-relaxed">
          When a new CVE drops with a CVSS 9.8 score and active exploitation in the wild, the first question every
          security team asks is: &quot;Are we affected?&quot; Without an SBOM, answering this requires manually
          searching repositories, querying container registries, SSHing into servers, and asking development teams
          what they use. With an SBOM, it is a database query: <code className={codeStyle}>SELECT * FROM sbom_components WHERE name = &apos;vulnerable-lib&apos;</code>.
          The difference between &quot;we confirmed non-exposure in 3 minutes&quot; and &quot;we confirmed non-exposure
          in 3 days&quot; is the difference between business as usual and an all-hands incident response.
        </p>

        <h3 className="text-sm font-semibold mt-2">M&amp;A due diligence and customer requirements</h3>
        <p className="text-sm muted leading-relaxed">
          Acquirers now routinely request SBOMs as part of technical due diligence during mergers and acquisitions.
          An SBOM reveals the true composition of a software product: how many dependencies it carries, whether
          any have copyleft licenses that conflict with the acquirer&apos;s licensing model, and what the
          vulnerability surface looks like. Enterprise customers are increasingly requiring SBOMs from vendors as a
          procurement condition — if your competitor provides an SBOM and you do not, you lose the deal.
        </p>
      </section>

      {/* ── 3. SBOM Formats Compared ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          SBOM Formats Compared: CycloneDX vs SPDX vs Syft vs SWID
        </h2>
        <p className="text-sm muted leading-relaxed">
          Four SBOM formats are in active use. CycloneDX and SPDX dominate, with Syft JSON as a popular tool-specific
          format and SWID tags declining in relevance. Here is how they compare across the features that matter.
        </p>

        <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className={thStyle}>Feature</th>
                <th className={thStyle}>CycloneDX</th>
                <th className={thStyle}>SPDX</th>
                <th className={thStyle}>Syft JSON</th>
                <th className={thStyle}>SWID</th>
              </tr>
            </thead>
            <tbody className="muted">
              {[
                ["Maintained by", "OWASP", "Linux Foundation (ISO/IEC 5962:2021)", "Anchore", "ISO/IEC 19770-2"],
                ["Serialization", "JSON, XML, Protobuf", "JSON, RDF, Tag-Value, XLSX", "JSON", "XML"],
                ["Primary focus", "Security + composition analysis", "License compliance + legal", "Container image scanning", "Software asset identification"],
                ["Vulnerability support (VEX)", "Native (built-in)", "Via external VEX documents", "Via Grype integration", "No"],
                ["Dependency tree", "Yes (full graph)", "Yes (relationships)", "Flat list", "No"],
                ["License information", "Yes", "Primary focus (SPDX license list)", "Yes", "Limited"],
                ["PURL support", "Yes", "Yes (as external reference)", "Yes", "No"],
                ["Spec maturity", "v1.6 (2024)", "v2.3 (2022), v3.0 draft", "Tool-specific", "Declining adoption"],
                ["Best for", "DevSecOps / CI pipelines", "Legal compliance teams", "Quick container analysis", "Enterprise asset management"],
                ["Tooling ecosystem", "Large and growing", "Large (longest history)", "Anchore ecosystem", "Limited"],
              ].map(([feature, cdx, spdx, syft, swid]) => (
                <tr key={feature}>
                  <td className={`${tdStyle} font-medium`}>{feature}</td>
                  <td className={tdStyle}>{cdx}</td>
                  <td className={tdStyle}>{spdx}</td>
                  <td className={tdStyle}>{syft}</td>
                  <td className={tdStyle}>{swid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm muted leading-relaxed">
          For most security teams, <strong>CycloneDX</strong> is the recommended choice. It was purpose-built for
          security workflows, has native VEX support for communicating vulnerability status, and is the most widely
          supported format in DevSecOps tooling. <strong>SPDX</strong> is the better choice for legal and compliance
          teams because of its ISO standardization and deeper license compliance features. For a deeper look at
          license compliance, see our{" "}
          <Link
            href="/blog/open-source-license-compliance-guide"
            className="font-medium underline underline-offset-2"
          >
            open source license compliance guide
          </Link>.
        </p>

        <h3 className="text-sm font-semibold mt-2">CycloneDX JSON example (annotated)</h3>
        <pre className={preStyle}>
          <code>{`{
  // CycloneDX identifier — tools check this to detect format
  "bomFormat": "CycloneDX",
  "specVersion": "1.5",

  // Unique serial number for this specific SBOM instance
  "serialNumber": "urn:uuid:3e671687-395b-41f5-a30f-a58921a69b79",
  "version": 1,

  // Metadata about the software being described
  "metadata": {
    "timestamp": "2026-01-15T10:30:00Z",
    "component": {
      "type": "application",
      "name": "my-web-app",
      "version": "2.4.1"
    }
  },

  // The inventory — every component in the product
  "components": [
    {
      "type": "library",
      "name": "lodash",
      "version": "4.17.21",

      // PURL: universal package identifier
      "purl": "pkg:npm/lodash@4.17.21",

      // License declared by the package author
      "licenses": [{ "license": { "id": "MIT" } }],

      // Integrity verification
      "hashes": [
        { "alg": "SHA-256", "content": "abc123def456..." }
      ]
    },
    {
      "type": "library",
      "name": "express",
      "version": "4.18.2",
      "purl": "pkg:npm/express@4.18.2",
      "licenses": [{ "license": { "id": "MIT" } }]
    }
  ]
}`}</code>
        </pre>

        <h3 className="text-sm font-semibold mt-2">SPDX JSON example (annotated)</h3>
        <pre className={preStyle}>
          <code>{`{
  // SPDX version identifier — used by tools to detect format
  "spdxVersion": "SPDX-2.3",

  // SPDX data is licensed under CC0 (public domain)
  "dataLicense": "CC0-1.0",
  "SPDXID": "SPDXRef-DOCUMENT",
  "name": "my-python-api",
  "documentNamespace": "https://spdx.org/spdxdocs/example-2026",

  "creationInfo": {
    "created": "2026-01-15T10:30:00Z",
    "creators": ["Tool: syft-0.100.0", "Organization: Acme Corp"]
  },

  // Packages — SPDX's term for components
  "packages": [
    {
      "SPDXID": "SPDXRef-Package-django",
      "name": "Django",
      "versionInfo": "4.2.11",
      "downloadLocation": "https://pypi.org/project/Django/4.2.11/",

      // SPDX's primary focus: license compliance
      "licenseConcluded": "BSD-3-Clause",
      "licenseDeclared": "BSD-3-Clause",
      "copyrightText": "Copyright Django Software Foundation",

      // PURL as an external reference
      "externalRefs": [
        {
          "referenceCategory": "PACKAGE-MANAGER",
          "referenceType": "purl",
          "referenceLocator": "pkg:pypi/django@4.2.11"
        }
      ]
    }
  ],

  // Relationships between packages (dependency graph)
  "relationships": [
    {
      "spdxElementId": "SPDXRef-DOCUMENT",
      "relatedSpdxElement": "SPDXRef-Package-django",
      "relationshipType": "DESCRIBES"
    }
  ]
}`}</code>
        </pre>
      </section>

      {/* ── 4. How to Generate an SBOM ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          How to Generate an SBOM
        </h2>
        <p className="text-sm muted leading-relaxed">
          Several open-source tools can generate SBOMs from container images, source repositories, and build
          artifacts. Here are the most popular options with actual commands and expected output.
        </p>

        <h3 className="text-sm font-semibold mt-2">ScanRook</h3>
        <p className="text-sm muted leading-relaxed">
          ScanRook generates enriched SBOMs — the component inventory plus vulnerability data from OSV, NVD,
          and Red Hat OVAL, all in a single pass.
        </p>
        <pre className={preStyle}>
          <code>{`# Generate a CycloneDX SBOM from a container image
scanrook scan --file nginx-1.27.tar --format cyclonedx --out sbom.cdx.json

# Generate an SPDX SBOM
scanrook scan --file nginx-1.27.tar --format spdx --out sbom.spdx.json

# Import an existing SBOM and enrich with vulnerability data
scanrook sbom import --file ./sbom.cdx.json --format json --out enriched-report.json

# Compare two SBOMs to detect supply chain drift
scanrook sbom diff --baseline ./v2.3-sbom.json --current ./v2.4-sbom.json --json`}</code>
        </pre>

        <h3 className="text-sm font-semibold mt-2">Syft (Anchore)</h3>
        <p className="text-sm muted leading-relaxed">
          Syft is the most popular open-source SBOM generator for container images. It detects packages from
          package managers, language lock files, and binary metadata.
        </p>
        <pre className={preStyle}>
          <code>{`# CycloneDX output from a Docker image
syft nginx:1.27 -o cyclonedx-json > sbom.cdx.json

# SPDX output from a local directory
syft dir:./my-project -o spdx-json > sbom.spdx.json

# Syft's native JSON format (most detailed for Anchore ecosystem)
syft alpine:3.19 -o json > sbom.syft.json`}</code>
        </pre>

        <h3 className="text-sm font-semibold mt-2">Trivy (Aqua Security)</h3>
        <p className="text-sm muted leading-relaxed">
          Trivy can generate SBOMs as part of its multi-purpose scanning. It supports CycloneDX and SPDX
          output alongside its native vulnerability report format.
        </p>
        <pre className={preStyle}>
          <code>{`# CycloneDX SBOM from a container image
trivy image --format cyclonedx --output sbom.cdx.json nginx:1.27

# SPDX SBOM from a filesystem
trivy fs --format spdx-json --output sbom.spdx.json ./my-project

# Combined: generate SBOM and scan for vulns in one pass
trivy image --format cyclonedx --output sbom.json --scanners vuln nginx:1.27`}</code>
        </pre>

        <h3 className="text-sm font-semibold mt-2">cdxgen</h3>
        <p className="text-sm muted leading-relaxed">
          cdxgen is a source-code-focused SBOM generator that supports over 25 programming languages by analyzing
          lock files, manifests, and build configs.
        </p>
        <pre className={preStyle}>
          <code>{`# Generate CycloneDX from source code (auto-detects language)
cdxgen -o sbom.json

# Specify output type explicitly
cdxgen -o sbom.json --type node

# Recursive scan of a monorepo
cdxgen -o sbom.json -r --type python ./backend`}</code>
        </pre>

        <h3 className="text-sm font-semibold mt-2">Tool comparison at a glance</h3>
        <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className={thStyle}>Tool</th>
                <th className={thStyle}>Best for</th>
                <th className={thStyle}>Output formats</th>
                <th className={thStyle}>Vuln enrichment</th>
              </tr>
            </thead>
            <tbody className="muted">
              {[
                ["ScanRook", "Container + binary + source", "CycloneDX, SPDX, JSON", "Yes (OSV + NVD + OVAL + EPSS + KEV)"],
                ["Syft", "Container images", "CycloneDX, SPDX, Syft JSON", "No (use Grype separately)"],
                ["Trivy", "Multi-purpose scanning", "CycloneDX, SPDX, Trivy JSON", "Yes (built-in)"],
                ["cdxgen", "Source code analysis", "CycloneDX", "Limited"],
                ["Microsoft sbom-tool", "Build system integration", "SPDX", "No"],
              ].map(([tool, best, formats, vuln]) => (
                <tr key={tool}>
                  <td className={`${tdStyle} font-medium`}>{tool}</td>
                  <td className={tdStyle}>{best}</td>
                  <td className={tdStyle}>{formats}</td>
                  <td className={tdStyle}>{vuln}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 5. Interactive SBOM Explorer ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          Interactive SBOM Explorer
        </h2>
        <p className="text-sm muted leading-relaxed">
          Paste a CycloneDX or SPDX JSON document to analyze it instantly. The tool parses the SBOM in your browser
          (nothing is sent to any server), detects the format, and displays the component inventory, license
          distribution, and component types. Click &quot;Try CycloneDX sample&quot; or &quot;Try SPDX sample&quot;
          to see it in action.
        </p>
        <SbomExplorer />
        <p className="text-xs muted">
          All processing happens in your browser. No data is transmitted to ScanRook or any third party.
          For automated scanning and vulnerability enrichment, try{" "}
          <Link
            href="/dashboard"
            className="font-medium underline underline-offset-2"
          >
            uploading a file to ScanRook
          </Link>.
        </p>
      </section>

      {/* ── 6. SBOM Diff ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          SBOM Diff — Tracking Changes Between Versions
        </h2>
        <p className="text-sm muted leading-relaxed">
          An SBOM diff compares two SBOMs to reveal exactly what changed between software versions. This is one
          of the most operationally valuable uses of SBOMs because it catches supply chain drift — unexpected
          additions, removals, or version changes in your dependencies.
        </p>

        <h3 className="text-sm font-semibold mt-2">Why SBOM diffs matter</h3>
        <ul className="list-disc pl-6 text-sm muted grid gap-1.5">
          <li>A new dependency was added that introduces a copyleft license, violating your licensing policy</li>
          <li>A critical library was downgraded from a patched version to a vulnerable version</li>
          <li>An unknown package appeared that was not in any <code className={codeStyle}>package.json</code> or <code className={codeStyle}>requirements.txt</code> — possible supply chain injection</li>
          <li>A component changed suppliers — the same package name, but from a different publisher</li>
        </ul>

        <h3 className="text-sm font-semibold mt-2">Example: SBOM diff output</h3>
        <pre className={preStyle}>
          <code>{`$ scanrook sbom diff --baseline v2.3-sbom.json --current v2.4-sbom.json --json

{
  "baseline": "my-web-app v2.3.0 (127 components)",
  "current": "my-web-app v2.4.0 (131 components)",
  "summary": {
    "added": 6,
    "removed": 2,
    "changed": 3,
    "unchanged": 124
  },
  "added": [
    { "name": "sharp", "version": "0.33.2", "license": "Apache-2.0" },
    { "name": "ws", "version": "8.16.0", "license": "MIT" },
    { "name": "color", "version": "4.2.3", "license": "MIT" },
    ...
  ],
  "removed": [
    { "name": "jimp", "version": "0.22.12", "license": "MIT" },
    { "name": "pngjs", "version": "7.0.0", "license": "MIT" }
  ],
  "changed": [
    {
      "name": "express",
      "from": "4.18.2",
      "to": "4.19.2",
      "type": "patch"
    },
    {
      "name": "openssl",
      "from": "3.0.13",
      "to": "3.0.14",
      "type": "patch"
    },
    {
      "name": "lodash",
      "from": "4.17.21",
      "to": "4.17.21",
      "supplier_changed": true,
      "note": "Publisher changed from 'lodash' to 'lodash-es'"
    }
  ]
}`}</code>
        </pre>
        <p className="text-sm muted leading-relaxed">
          In a CI/CD pipeline, an SBOM diff can serve as a gate: if the diff reveals unexpected new dependencies
          or license changes, the pipeline fails and the team reviews the changes before deployment. ScanRook&apos;s
          dashboard displays diffs visually with +added / -removed / ~changed counts for each release, making it
          easy to track supply chain evolution over time.
        </p>
      </section>

      {/* ── 7. SBOM + Vulnerability Scanning ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          SBOM + Vulnerability Scanning: How They Work Together
        </h2>
        <p className="text-sm muted leading-relaxed">
          An SBOM by itself is an inventory — it tells you what is present but not whether any of it is vulnerable.
          Vulnerability scanners take the SBOM as input and check each component against one or more vulnerability
          databases. The scanner matches each component&apos;s PURL (Package URL) or name+version against known
          advisories and produces a report listing which components are affected and at what severity.
        </p>

        <h3 className="text-sm font-semibold mt-2">The enrichment pipeline</h3>
        <p className="text-sm muted leading-relaxed">
          ScanRook enriches SBOM components against five data sources for maximum coverage and accuracy:
        </p>
        <ul className="list-disc pl-6 text-sm muted grid gap-1.5">
          <li>
            <strong><Link href="/blog/what-is-osv" className="font-medium underline underline-offset-2">OSV</Link></strong> — ecosystem-native vulnerability matching with exact package name + version range. Covers 24+ ecosystems with minimal false positives.
          </li>
          <li>
            <strong><Link href="/blog/understanding-nvd-and-cvss" className="font-medium underline underline-offset-2">NVD CVSS</Link></strong> — official CVE severity scores. CVSS base scores from 0.0 to 10.0 provide standardized severity assessment.
          </li>
          <li>
            <strong><Link href="/blog/epss-scores-explained" className="font-medium underline underline-offset-2">EPSS</Link></strong> — Exploit Prediction Scoring System. Predicts the probability that a vulnerability will be exploited in the wild within the next 30 days. A CVE with CVSS 9.8 but EPSS 0.01% is far less urgent than one with CVSS 7.5 and EPSS 97%.
          </li>
          <li>
            <strong>CISA KEV</strong> — the Known Exploited Vulnerabilities catalog. If a CVE is on this list, it is actively being exploited and should be patched immediately.
          </li>
          <li>
            <strong><Link href="/blog/redhat-backporting-explained" className="font-medium underline underline-offset-2">Red Hat OVAL</Link></strong> — for RPM-based distributions (RHEL, Rocky, Alma), OVAL definitions check the full NEVRA (Name-Epoch:Version-Release.Architecture) to account for backported patches.
          </li>
        </ul>
        <p className="text-sm muted leading-relaxed">
          The result is that every component in the SBOM gets a comprehensive vulnerability assessment — not just
          &quot;this CVE exists&quot; but &quot;this CVE exists, has a CVSS of 9.1, EPSS predicts 34% exploit
          probability in 30 days, it is on the CISA KEV list, and the installed RPM version does not include
          Red Hat&apos;s backported fix.&quot;
        </p>
      </section>

      {/* ── 8. Regulatory Requirements Deep Dive ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          Regulatory Requirements: Who Requires SBOMs and What They Must Contain
        </h2>

        <h3 className="text-sm font-semibold mt-2">US Executive Order 14028 (May 2021)</h3>
        <p className="text-sm muted leading-relaxed">
          Executive Order 14028, &quot;Improving the Nation&apos;s Cybersecurity,&quot; directs federal agencies to
          require SBOMs from all software vendors. Section 4(e) specifically mandates that vendors provide an SBOM
          for each product. The order applies to all &quot;critical software&quot; used by the federal government,
          which includes operating systems, web browsers, cloud services, identity management tools, and security
          software. NIST was directed to publish guidelines for SBOM content, which became the NTIA Minimum Elements.
        </p>

        <h3 className="text-sm font-semibold mt-2">EU Cyber Resilience Act (CRA)</h3>
        <p className="text-sm muted leading-relaxed">
          The CRA applies to all products with digital elements placed on the EU market. Article 13 requires
          manufacturers to &quot;identify and document vulnerabilities and components contained in the product,
          including by drawing up a software bill of materials.&quot; The CRA takes full effect in 2027, with
          vulnerability reporting obligations starting 21 months after entry into force. Unlike EO 14028, which
          applies only to federal procurement, the CRA applies to all commercial software sold in the EU.
        </p>

        <h3 className="text-sm font-semibold mt-2">FDA Cybersecurity Guidance</h3>
        <p className="text-sm muted leading-relaxed">
          The FDA&apos;s &quot;Cybersecurity in Medical Devices&quot; guidance (effective October 2023) requires
          medical device manufacturers to include SBOMs in premarket submissions. The SBOM must list all software
          components including commercial, open source, and off-the-shelf software. The FDA specifically requires
          SBOMs for devices that contain software or connect to networks — which includes virtually all modern
          medical devices from insulin pumps to MRI machines.
        </p>

        <h3 className="text-sm font-semibold mt-2">NTIA Minimum Elements for an SBOM</h3>
        <p className="text-sm muted leading-relaxed">
          The National Telecommunications and Information Administration (NTIA) published the minimum data fields
          that every SBOM must contain, regardless of format:
        </p>
        <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className={thStyle}>Field</th>
                <th className={thStyle}>Description</th>
                <th className={thStyle}>Example</th>
              </tr>
            </thead>
            <tbody className="muted">
              {[
                ["Supplier Name", "Entity that creates, defines, and identifies components", "The OpenSSL Project"],
                ["Component Name", "Designation assigned to a unit of software", "openssl"],
                ["Version", "Identifier used by supplier to specify a change", "3.0.13"],
                ["Unique Identifier", "Other identifiers for disambiguation", "pkg:generic/openssl@3.0.13"],
                ["Dependency Relationship", "Characterizing the relationship between components", "express DEPENDS_ON lodash"],
                ["Author of SBOM Data", "Name of the entity that creates the SBOM", "ScanRook v1.14.2"],
                ["Timestamp", "Record of the date and time the SBOM was assembled", "2026-01-15T10:30:00Z"],
              ].map(([field, desc, example]) => (
                <tr key={field}>
                  <td className={`${tdStyle} font-medium`}>{field}</td>
                  <td className={tdStyle}>{desc}</td>
                  <td className={tdStyle}><code className={codeStyle}>{example}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-sm font-semibold mt-2">CISA SBOM Sharing Recommendations</h3>
        <p className="text-sm muted leading-relaxed">
          CISA recommends several practices for SBOM distribution: make SBOMs available at a well-known URL
          (<code className={codeStyle}>/.well-known/sbom</code>), sign them with a verifiable signature (Sigstore
          cosign), update them with every release, and provide machine-readable access (not just PDF downloads).
          CISA also recommends that organizations consuming SBOMs store them in a centralized repository and
          correlate them with their asset inventory.
        </p>
      </section>

      {/* ── 9. Architecture Diagram ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          The SBOM Lifecycle: From Source Code to Dashboard
        </h2>
        <p className="text-sm muted leading-relaxed">
          SBOMs fit into a larger workflow that connects build systems, vulnerability scanners, and security
          dashboards. Here is the full lifecycle:
        </p>
        <div className="overflow-x-auto">
          <svg
            viewBox="0 0 800 380"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full max-w-2xl mx-auto"
            role="img"
            aria-label="SBOM lifecycle architecture diagram showing flow from source code through build system, SBOM generation, vulnerability scanning, to dashboard"
          >
            {/* Background */}
            <rect width="800" height="380" rx="16" className="fill-black/[.02] dark:fill-white/[.02]" />

            {/* Row 1: Source → Build → SBOM */}
            <text x="400" y="28" textAnchor="middle" className="fill-current text-[11px] font-semibold" fontSize="11" fontWeight="600">SBOM Lifecycle</text>

            {/* Source Code */}
            <rect x="30" y="55" width="140" height="55" rx="10" className="fill-black/[.05] dark:fill-white/[.08] stroke-black/10 dark:stroke-white/10" strokeWidth="1" />
            <text x="100" y="78" textAnchor="middle" className="fill-current text-[11px] font-semibold" fontSize="11" fontWeight="600">Source Code</text>
            <text x="100" y="95" textAnchor="middle" className="fill-current" fontSize="9" opacity="0.5">package.json, go.mod</text>

            {/* Arrow */}
            <line x1="175" y1="82" x2="225" y2="82" className="stroke-current" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.4" />
            <polygon points="225,78 235,82 225,86" className="fill-current" opacity="0.4" />

            {/* Build System */}
            <rect x="240" y="55" width="140" height="55" rx="10" className="fill-black/[.05] dark:fill-white/[.08] stroke-black/10 dark:stroke-white/10" strokeWidth="1" />
            <text x="310" y="78" textAnchor="middle" className="fill-current text-[11px] font-semibold" fontSize="11" fontWeight="600">Build System</text>
            <text x="310" y="95" textAnchor="middle" className="fill-current" fontSize="9" opacity="0.5">CI/CD Pipeline</text>

            {/* Arrow */}
            <line x1="385" y1="82" x2="435" y2="82" className="stroke-current" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.4" />
            <polygon points="435,78 445,82 435,86" className="fill-current" opacity="0.4" />

            {/* SBOM Generator */}
            <rect x="450" y="55" width="160" height="55" rx="10" className="stroke-[var(--dg-accent,#2563eb)]" strokeWidth="2" fill="none" />
            <rect x="450" y="55" width="160" height="55" rx="10" className="fill-[var(--dg-accent,#2563eb)]" opacity="0.06" />
            <text x="530" y="78" textAnchor="middle" className="fill-current text-[11px] font-semibold" fontSize="11" fontWeight="600">SBOM Generator</text>
            <text x="530" y="95" textAnchor="middle" className="fill-current" fontSize="9" opacity="0.5">Syft, ScanRook, cdxgen</text>

            {/* Arrow */}
            <line x1="615" y1="82" x2="660" y2="82" className="stroke-current" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.4" />
            <polygon points="660,78 670,82 660,86" className="fill-current" opacity="0.4" />

            {/* SBOM Document */}
            <rect x="675" y="55" width="100" height="55" rx="10" className="fill-black/[.05] dark:fill-white/[.08] stroke-black/10 dark:stroke-white/10" strokeWidth="1" />
            <text x="725" y="75" textAnchor="middle" className="fill-current text-[11px] font-semibold" fontSize="11" fontWeight="600">SBOM</text>
            <text x="725" y="92" textAnchor="middle" className="fill-current" fontSize="9" opacity="0.5">CycloneDX / SPDX</text>

            {/* Down arrow from SBOM */}
            <line x1="725" y1="115" x2="725" y2="155" className="stroke-current" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.4" />
            <polygon points="721,155 725,165 729,155" className="fill-current" opacity="0.4" />

            {/* Row 2: Vulnerability Scanner */}
            <rect x="580" y="170" width="190" height="70" rx="12" className="stroke-[var(--dg-accent,#2563eb)]" strokeWidth="2" fill="none" />
            <rect x="580" y="170" width="190" height="70" rx="12" className="fill-[var(--dg-accent,#2563eb)]" opacity="0.06" />
            <text x="675" y="195" textAnchor="middle" className="fill-current text-[13px] font-semibold" fontSize="13" fontWeight="600">Vulnerability Scanner</text>
            <text x="675" y="212" textAnchor="middle" className="fill-current" fontSize="9" opacity="0.5">ScanRook / Trivy / Grype</text>
            <text x="675" y="228" textAnchor="middle" className="fill-current" fontSize="9" opacity="0.5">Checks OSV + NVD + OVAL</text>

            {/* Data sources feeding scanner */}
            {[
              ["OSV API", 50],
              ["NVD / CVSS", 92],
              ["EPSS", 134],
              ["CISA KEV", 176],
              ["Red Hat OVAL", 218],
            ].map(([label, y]) => (
              <g key={label as string}>
                <rect x="30" y={(y as number) + 55} width="120" height="24" rx="6" className="fill-black/[.05] dark:fill-white/[.08] stroke-black/10 dark:stroke-white/10" strokeWidth="1" />
                <text x="90" y={(y as number) + 71} textAnchor="middle" className="fill-current" fontSize="9">{label as string}</text>
              </g>
            ))}
            <text x="90" y="50" textAnchor="middle" className="fill-current text-[10px] font-semibold" fontSize="10" fontWeight="600" opacity="0.6">Vuln Data Sources</text>

            {/* Arrows from sources to scanner */}
            <line x1="155" y1="205" x2="575" y2="205" className="stroke-current" strokeWidth="1" strokeDasharray="3 2" opacity="0.25" />
            <polygon points="575,201 585,205 575,209" className="fill-current" opacity="0.3" />

            {/* Down arrow from scanner */}
            <line x1="675" y1="245" x2="675" y2="280" className="stroke-current" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.4" />
            <polygon points="671,280 675,290 679,280" className="fill-current" opacity="0.4" />

            {/* Row 3: Enriched Report */}
            <rect x="580" y="295" width="190" height="50" rx="10" className="fill-black/[.05] dark:fill-white/[.08] stroke-black/10 dark:stroke-white/10" strokeWidth="1" />
            <text x="675" y="318" textAnchor="middle" className="fill-current text-[11px] font-semibold" fontSize="11" fontWeight="600">Enriched Report</text>
            <text x="675" y="335" textAnchor="middle" className="fill-current" fontSize="9" opacity="0.5">CVEs + EPSS + KEV + Fixes</text>

            {/* Left arrow to dashboard/CI */}
            <line x1="575" y1="320" x2="420" y2="320" className="stroke-current" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.4" />
            <polygon points="420,316 410,320 420,324" className="fill-current" opacity="0.4" />

            {/* Output targets */}
            {[
              ["Dashboard", 295],
              ["CI/CD Gate", 335],
            ].map(([label, y]) => (
              <g key={label as string}>
                <rect x="240" y={(y as number) - 14} width="160" height="28" rx="8" className="fill-black/[.05] dark:fill-white/[.08] stroke-black/10 dark:stroke-white/10" strokeWidth="1" />
                <text x="320" y={(y as number) + 1} textAnchor="middle" className="fill-current" fontSize="10">{label as string}</text>
              </g>
            ))}
          </svg>
        </div>
        <p className="text-sm muted leading-relaxed">
          The SBOM is generated during the build phase and stored alongside the artifact. The vulnerability scanner
          reads the SBOM, checks each component against multiple data sources, and produces an enriched report
          that feeds into dashboards and CI/CD gates. This pipeline runs automatically on every build, ensuring
          that vulnerability data is always current.
        </p>
      </section>

      {/* ── 10. FAQ ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          Frequently Asked Questions about SBOMs
        </h2>
        <div className="grid gap-4">
          {faqItems.map((item, i) => (
            <details
              key={i}
              className="group rounded-xl border border-black/10 dark:border-white/10 overflow-hidden"
            >
              <summary className="cursor-pointer select-none p-4 text-sm font-medium flex items-center justify-between hover:bg-black/[.02] dark:hover:bg-white/[.02] transition-colors">
                {item.q}
                <svg
                  className="w-4 h-4 muted shrink-0 ml-3 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div className="px-4 pb-4 text-sm muted leading-relaxed">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── 11. Further Reading + CTA ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          Further Reading
        </h2>
        <ul className="list-disc pl-6 text-sm muted grid gap-1">
          <li>
            <a
              href="https://cyclonedx.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              cyclonedx.org
            </a>{" "}
            — Official CycloneDX specification and tools
          </li>
          <li>
            <a
              href="https://spdx.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              spdx.dev
            </a>{" "}
            — SPDX specification, license list, and tooling
          </li>
          <li>
            <a
              href="https://www.ntia.gov/page/software-bill-materials"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              NTIA SBOM Resources
            </a>{" "}
            — NTIA minimum elements and sharing guidelines
          </li>
          <li>
            <a
              href="https://www.cisa.gov/sbom"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              CISA SBOM Guidance
            </a>{" "}
            — Federal guidance on SBOM creation and consumption
          </li>
          <li>
            <a
              href="https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              EU Cyber Resilience Act
            </a>{" "}
            — Full text of the CRA regulation
          </li>
          <li>
            <a
              href="https://github.com/anchore/syft"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              github.com/anchore/syft
            </a>{" "}
            — Syft SBOM generation tool
          </li>
        </ul>

        <h3 className="text-sm font-semibold mt-2">Related ScanRook articles</h3>
        <div className="flex flex-wrap gap-3">
          <Link className="btn-secondary" href="/blog/what-is-osv">
            What is OSV?
          </Link>
          <Link className="btn-secondary" href="/blog/understanding-nvd-and-cvss">
            NVD and CVSS explained
          </Link>
          <Link className="btn-secondary" href="/blog/redhat-backporting-explained">
            Red Hat backporting
          </Link>
          <Link className="btn-secondary" href="/blog/epss-scores-explained">
            EPSS scores explained
          </Link>
          <Link className="btn-secondary" href="/blog/how-to-read-sbom">
            How to read an SBOM
          </Link>
          <Link className="btn-secondary" href="/blog/open-source-license-compliance-guide">
            License compliance
          </Link>
          <Link className="btn-secondary" href="/blog/container-scanning-best-practices">
            Container scanning guide
          </Link>
          <Link className="btn-secondary" href="/docs">
            ScanRook docs
          </Link>
          <Link className="btn-secondary" href="/blog">
            All articles
          </Link>
        </div>

        <div className="mt-4 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">
            Generate enriched SBOMs with ScanRook
          </h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook generates SBOMs and enriches every component with vulnerability data from OSV, NVD, EPSS,
            CISA KEV, and Red Hat OVAL — all in a single scan. Upload a container image, source archive, or
            binary to get a comprehensive security report in seconds.
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
        </div>
      </section>
    </main>
  );
}
