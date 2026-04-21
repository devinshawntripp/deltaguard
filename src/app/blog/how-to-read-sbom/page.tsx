import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";

const title = `How to Read an SBOM: CycloneDX vs SPDX Explained with Real Examples | ${APP_NAME}`;
const description =
  "Learn how to read and interpret Software Bill of Materials in CycloneDX and SPDX formats with annotated real-world examples, comparison tables, and regulatory context.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "SBOM",
    "CycloneDX",
    "SPDX",
    "software bill of materials",
    "SBOM format",
    "EO 14028",
    "EU Cyber Resilience Act",
    "dependency inventory",
    "supply chain security",
    "ScanRook",
  ],
  alternates: {
    canonical: "/blog/how-to-read-sbom",
  },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/how-to-read-sbom",
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
    "How to Read an SBOM: CycloneDX vs SPDX Explained with Real Examples",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/how-to-read-sbom",
  datePublished: "2026-04-21",
  dateModified: "2026-04-21",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is an SBOM?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A Software Bill of Materials (SBOM) is a machine-readable inventory of all components, libraries, and dependencies in a software artifact. It lists package names, versions, suppliers, and relationships — similar to an ingredient list for software.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between CycloneDX and SPDX?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CycloneDX (maintained by OWASP) is security-focused with built-in vulnerability and license fields. SPDX (maintained by Linux Foundation, ISO 5962) is broader, covering licensing, provenance, and relationships. CycloneDX is JSON-first and simpler to parse; SPDX supports multiple serialization formats and is more expressive for complex supply chains.",
      },
    },
    {
      "@type": "Question",
      name: "Is an SBOM legally required?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For US federal government suppliers, yes — Executive Order 14028 (May 2021) requires SBOMs for software sold to federal agencies. The EU Cyber Resilience Act (effective 2027) will require SBOMs for all products with digital elements sold in the EU market.",
      },
    },
    {
      "@type": "Question",
      name: "How do I generate an SBOM?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tools like ScanRook, Syft, Trivy, and Microsoft SBOM Tool can generate SBOMs from container images, source code, and binaries. ScanRook generates a package inventory as part of every scan. Syft and Trivy can output in CycloneDX or SPDX format.",
      },
    },
    {
      "@type": "Question",
      name: "Which SBOM format should I use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For security use cases (vulnerability tracking, compliance scanning), CycloneDX is recommended due to its simpler structure and built-in VEX support. For legal/licensing use cases or when interoperating with supply chain tools, SPDX may be preferred due to its ISO standardization.",
      },
    },
    {
      "@type": "Question",
      name: "How often should I regenerate my SBOM?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Regenerate the SBOM every time you build a new version of your software. For container images, generate an SBOM with each image build in CI/CD. For deployed software, attach the SBOM to the release artifact so consumers always have the current inventory.",
      },
    },
    {
      "@type": "Question",
      name: "Can an SBOM tell me if my software is vulnerable?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An SBOM alone lists components but does not indicate vulnerability status. However, SBOM data can be cross-referenced against vulnerability databases (NVD, OSV) to identify which components have known CVEs. CycloneDX also supports embedding vulnerability data directly via VEX.",
      },
    },
    {
      "@type": "Question",
      name: "What is VEX and how does it relate to SBOM?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "VEX (Vulnerability Exploitability eXchange) is a companion document to an SBOM that states whether a known vulnerability actually affects the product. It allows software producers to mark CVEs as 'not affected', 'fixed', or 'under investigation' — reducing false positives for consumers who scan SBOMs against vulnerability databases.",
      },
    },
  ],
};

export default function HowToReadSBOMPage() {
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
          <div className="text-xs uppercase tracking-wide muted">
            Technical deep-dive
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            How to Read an SBOM: CycloneDX vs SPDX Explained with Real Examples
          </h1>
          <p className="text-sm muted">
            Published April 21, 2026
          </p>
        </header>

        {/* Introduction */}
        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            What Is an SBOM and Why You Need One
          </h2>
          <p className="text-sm muted">
            A Software Bill of Materials (SBOM) is a machine-readable inventory
            of every component inside a software artifact. Think of it as a
            nutrition label for software — it lists all ingredients (packages),
            their versions, where they came from (supplier), and how they
            relate to each other (dependency tree).
          </p>
          <p className="text-sm muted">
            SBOMs became a regulatory requirement in the United States with
            Executive Order 14028 (May 2021), which mandates that all software
            sold to the federal government must include an SBOM. The EU Cyber
            Resilience Act (CRA), taking effect in 2027, extends this
            requirement to all products with digital elements sold in the
            European market — affecting virtually every software vendor
            globally.
          </p>
          <p className="text-sm muted">
            Beyond compliance, SBOMs are operationally critical. When a new
            CVE like Log4Shell (CVE-2021-44228) is disclosed, organizations
            with SBOMs can immediately identify which products and deployments
            contain the affected component. Without SBOMs, this identification
            requires re-scanning every artifact — a process that can take days
            or weeks across large environments.
          </p>
          <p className="text-sm muted">
            Two formats dominate the SBOM landscape: CycloneDX (maintained by
            OWASP) and SPDX (maintained by the Linux Foundation). Both are
            machine-readable, widely supported, and suitable for compliance.
            This guide explains how to read both formats with annotated
            real-world examples.
          </p>
        </section>

        {/* CycloneDX */}
        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            CycloneDX Format: Annotated Example
          </h2>
          <p className="text-sm muted">
            CycloneDX is a JSON-first SBOM format designed for security use
            cases. It was created by OWASP specifically for vulnerability
            identification, license compliance, and component analysis. The
            format is simpler to parse than SPDX and includes native support
            for vulnerability data (VEX) within the same document.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
            <code>{`{
  "bomFormat": "CycloneDX",        // Format identifier
  "specVersion": "1.5",            // Schema version
  "version": 1,                    // BOM version (increment on updates)
  "metadata": {
    "timestamp": "2026-04-21T10:30:00Z",
    "tools": [{
      "vendor": "ScanRook",
      "name": "scanner",
      "version": "1.14.2"
    }],
    "component": {                 // The subject being described
      "type": "container",
      "name": "myapp",
      "version": "v2.1.0"
    }
  },
  "components": [                  // All discovered components
    {
      "type": "library",
      "name": "express",
      "version": "4.18.2",
      "purl": "pkg:npm/express@4.18.2",   // Package URL (universal ID)
      "licenses": [{ "license": { "id": "MIT" } }],
      "supplier": { "name": "TJ Holowaychuk" }
    },
    {
      "type": "library",
      "name": "lodash",
      "version": "4.17.21",
      "purl": "pkg:npm/lodash@4.17.21",
      "licenses": [{ "license": { "id": "MIT" } }]
    },
    {
      "type": "library",
      "name": "openssl",
      "version": "3.1.4-r2",
      "purl": "pkg:apk/alpine/openssl@3.1.4-r2",
      "licenses": [{ "license": { "id": "Apache-2.0" } }]
    }
  ],
  "dependencies": [                // Dependency relationships
    {
      "ref": "pkg:npm/express@4.18.2",
      "dependsOn": [
        "pkg:npm/body-parser@1.20.1",
        "pkg:npm/cookie@0.5.0"
      ]
    }
  ]
}`}</code>
          </pre>
          <p className="text-sm muted">
            Key fields to understand:
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li><strong>purl</strong> (Package URL) — The universal identifier for a component. Format: <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">pkg:ecosystem/name@version</code>. This is what vulnerability databases use for matching.</li>
            <li><strong>type</strong> — Component classification: library, framework, application, container, device, firmware, file, or operating-system.</li>
            <li><strong>licenses</strong> — SPDX license identifiers (MIT, Apache-2.0, GPL-3.0-only, etc.).</li>
            <li><strong>dependencies</strong> — The dependency graph showing which components depend on which others.</li>
            <li><strong>metadata.tools</strong> — Which tool generated the SBOM and at what version (provenance).</li>
          </ul>
        </section>

        {/* SPDX */}
        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            SPDX Format: Annotated Example
          </h2>
          <p className="text-sm muted">
            SPDX (Software Package Data Exchange) is an ISO standard (ISO/IEC
            5962:2021) maintained by the Linux Foundation. It predates CycloneDX
            and was originally designed for license compliance. SPDX is more
            expressive for complex supply chain relationships and supports
            multiple serialization formats (JSON, RDF, tag-value, YAML).
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
            <code>{`{
  "spdxVersion": "SPDX-2.3",
  "dataLicense": "CC0-1.0",          // License for the SBOM itself
  "SPDXID": "SPDXRef-DOCUMENT",
  "name": "myapp-v2.1.0",
  "documentNamespace": "https://scanrook.io/sbom/myapp-v2.1.0-abc123",
  "creationInfo": {
    "created": "2026-04-21T10:30:00Z",
    "creators": [
      "Tool: ScanRook-1.14.2",
      "Organization: Acme Corp"
    ]
  },
  "packages": [
    {
      "SPDXID": "SPDXRef-Package-express",
      "name": "express",
      "versionInfo": "4.18.2",
      "supplier": "Person: TJ Holowaychuk",
      "downloadLocation": "https://registry.npmjs.org/express/-/express-4.18.2.tgz",
      "filesAnalyzed": false,
      "licenseConcluded": "MIT",
      "licenseDeclared": "MIT",
      "copyrightText": "Copyright (c) 2009-2014 TJ Holowaychuk",
      "externalRefs": [{
        "referenceCategory": "PACKAGE-MANAGER",
        "referenceType": "purl",
        "referenceLocator": "pkg:npm/express@4.18.2"
      }]
    },
    {
      "SPDXID": "SPDXRef-Package-openssl",
      "name": "openssl",
      "versionInfo": "3.1.4-r2",
      "supplier": "Organization: Alpine Linux",
      "downloadLocation": "NOASSERTION",
      "filesAnalyzed": false,
      "licenseConcluded": "Apache-2.0",
      "licenseDeclared": "Apache-2.0",
      "copyrightText": "NOASSERTION",
      "externalRefs": [{
        "referenceCategory": "PACKAGE-MANAGER",
        "referenceType": "purl",
        "referenceLocator": "pkg:apk/alpine/openssl@3.1.4-r2"
      }]
    }
  ],
  "relationships": [
    {
      "spdxElementId": "SPDXRef-DOCUMENT",
      "relationshipType": "DESCRIBES",
      "relatedSpdxElement": "SPDXRef-Package-express"
    },
    {
      "spdxElementId": "SPDXRef-Package-express",
      "relationshipType": "DEPENDS_ON",
      "relatedSpdxElement": "SPDXRef-Package-body-parser"
    }
  ]
}`}</code>
          </pre>
          <p className="text-sm muted">
            Key differences from CycloneDX:
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li><strong>SPDXID</strong> — Internal reference identifier. Used in the relationships section to express how components connect.</li>
            <li><strong>licenseConcluded vs licenseDeclared</strong> — SPDX distinguishes between what the package declares its license to be and what analysis concluded it actually is (they can differ).</li>
            <li><strong>downloadLocation</strong> — Where the package can be obtained. Required field (use NOASSERTION if unknown).</li>
            <li><strong>relationships</strong> — More expressive than CycloneDX dependencies. Types include DEPENDS_ON, BUILD_TOOL_OF, CONTAINS, GENERATED_FROM, and more.</li>
            <li><strong>dataLicense</strong> — The license of the SBOM document itself (always CC0-1.0 for SPDX).</li>
          </ul>
        </section>

        {/* Comparison table */}
        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            CycloneDX vs SPDX: Side-by-Side Comparison
          </h2>
          <div className="overflow-x-auto -mx-8 px-8">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-3 font-medium">Feature</th>
                  <th className="text-left py-2 pr-3 font-medium">CycloneDX</th>
                  <th className="text-left py-2 font-medium">SPDX</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                <tr>
                  <td className="py-2 pr-3 font-medium">Maintained by</td>
                  <td className="py-2 pr-3">OWASP</td>
                  <td className="py-2">Linux Foundation</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium">ISO standard</td>
                  <td className="py-2 pr-3">No (ECMA pending)</td>
                  <td className="py-2">Yes (ISO 5962)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium">Primary focus</td>
                  <td className="py-2 pr-3">Security/vulnerability</td>
                  <td className="py-2">Licensing/provenance</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium">Serialization</td>
                  <td className="py-2 pr-3">JSON, XML</td>
                  <td className="py-2">JSON, RDF, tag-value, YAML</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium">VEX support</td>
                  <td className="py-2 pr-3">Native (inline)</td>
                  <td className="py-2">Separate document</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium">Complexity</td>
                  <td className="py-2 pr-3">Simpler, flatter</td>
                  <td className="py-2">More expressive, verbose</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium">Dependency graph</td>
                  <td className="py-2 pr-3">Basic (dependsOn)</td>
                  <td className="py-2">Rich (20+ relationship types)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium">Tool support</td>
                  <td className="py-2 pr-3">Syft, Trivy, ScanRook, Grype</td>
                  <td className="py-2">Syft, Trivy, MS SBOM Tool, FOSSology</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium">Package URL (purl)</td>
                  <td className="py-2 pr-3">First-class field</td>
                  <td className="py-2">External reference</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium">Best for</td>
                  <td className="py-2 pr-3">DevSecOps, vulnerability mgmt</td>
                  <td className="py-2">Legal compliance, supply chain</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* How to generate */}
        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            How to Generate an SBOM
          </h2>
          <p className="text-sm muted">
            Multiple tools can generate SBOMs from container images, source
            repositories, and binary artifacts. Here are the most common
            approaches:
          </p>

          <div className="grid gap-3">
            <div className="rounded-lg border border-black/10 dark:border-white/10 p-3 grid gap-2">
              <h3 className="text-sm font-semibold">ScanRook</h3>
              <p className="text-xs muted">
                Every ScanRook scan automatically generates a complete package
                inventory (equivalent to an SBOM). The scan report includes all
                packages, versions, ecosystems, and licenses — available via the
                dashboard or API.
              </p>
              <pre className="rounded bg-black/[.04] dark:bg-white/[.04] p-2 text-xs overflow-x-auto">
                <code>{`# Scan and get full package inventory
scanrook scan container ./my-image.tar --format json --out report.json

# The report.json contains packages[], files[], and findings[]
# Upload via dashboard for web-based exploration`}</code>
              </pre>
            </div>

            <div className="rounded-lg border border-black/10 dark:border-white/10 p-3 grid gap-2">
              <h3 className="text-sm font-semibold">Syft (Anchore)</h3>
              <p className="text-xs muted">
                Syft is a dedicated SBOM generation tool that outputs in both
                CycloneDX and SPDX formats. It reads container images, file
                systems, and archives.
              </p>
              <pre className="rounded bg-black/[.04] dark:bg-white/[.04] p-2 text-xs overflow-x-auto">
                <code>{`# CycloneDX output
syft my-image:latest -o cyclonedx-json > sbom-cdx.json

# SPDX output
syft my-image:latest -o spdx-json > sbom-spdx.json

# From a directory
syft dir:/path/to/project -o cyclonedx-json`}</code>
              </pre>
            </div>

            <div className="rounded-lg border border-black/10 dark:border-white/10 p-3 grid gap-2">
              <h3 className="text-sm font-semibold">Trivy (Aqua Security)</h3>
              <p className="text-xs muted">
                Trivy includes SBOM generation alongside its vulnerability
                scanning capabilities. It can output CycloneDX and SPDX.
              </p>
              <pre className="rounded bg-black/[.04] dark:bg-white/[.04] p-2 text-xs overflow-x-auto">
                <code>{`# CycloneDX SBOM
trivy image --format cyclonedx my-image:latest > sbom.json

# SPDX SBOM
trivy image --format spdx-json my-image:latest > sbom-spdx.json`}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Dependency tree */}
        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            How to Read the Dependency Tree
          </h2>
          <p className="text-sm muted">
            An SBOM&apos;s dependency tree reveals which components are direct
            dependencies versus transitive (indirect) dependencies. This
            distinction matters for remediation — you can directly update a
            direct dependency, but a transitive dependency requires updating
            the intermediate package that pulls it in.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
            <code>{`# Example dependency tree from CycloneDX:
#
# myapp (your application)
# ├── express@4.18.2 (direct dependency)
# │   ├── body-parser@1.20.1 (transitive)
# │   │   └── raw-body@2.5.1 (transitive, depth 2)
# │   ├── cookie@0.5.0 (transitive)
# │   └── qs@6.11.0 (transitive)
# ├── lodash@4.17.21 (direct dependency)
# └── pg@8.11.3 (direct dependency)
#     └── pg-protocol@1.6.0 (transitive)

# If a CVE affects raw-body@2.5.1:
# - You cannot update raw-body directly (it is transitive)
# - You need body-parser to release a version using a fixed raw-body
# - Or express to bump body-parser
# - Or you override/force the resolution in your lockfile`}</code>
          </pre>
          <p className="text-sm muted">
            In CycloneDX, dependencies are expressed in the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">dependencies</code>{" "}
            array where each entry lists what it depends on. In SPDX,
            relationships use{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">DEPENDS_ON</code>{" "}
            relationship types between SPDXIDs. Both produce the same logical
            tree but with different structural representations.
          </p>
          <p className="text-sm muted">
            Understanding the dependency depth is crucial for risk assessment.
            A vulnerable component deep in the tree (depth 3+) is often harder
            to fix but may also be harder to reach from an attacker&apos;s
            perspective — the vulnerable function may not be reachable through
            the actual call paths in your application.
          </p>
        </section>

        {/* SBOM Diff */}
        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            SBOM Diff: Tracking Changes Between Versions
          </h2>
          <p className="text-sm muted">
            Comparing SBOMs between versions reveals exactly what changed in
            your software supply chain. A diff shows added components, removed
            components, and version changes — making it immediately clear
            whether a release introduced new dependencies or updated existing
            ones.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
            <code>{`# Comparing SBOM v2.0 to v2.1:

ADDED:
  + pkg:npm/zod@3.22.4          (new validation library)
  + pkg:npm/@types/zod@3.22.4   (type definitions)

REMOVED:
  - pkg:npm/joi@17.9.2          (replaced by zod)
  - pkg:npm/@hapi/hoek@9.3.0    (joi dependency, no longer needed)

CHANGED:
  ~ pkg:npm/express@4.18.1 → 4.18.2    (patch update)
  ~ pkg:npm/lodash@4.17.20 → 4.17.21   (security fix)
  ~ pkg:apk/alpine/openssl@3.1.3 → 3.1.4-r2  (CVE fix)

SUMMARY: +2 added, -2 removed, 3 updated
NET CHANGE: 0 (same component count)`}</code>
          </pre>
          <p className="text-sm muted">
            SBOM diffs are particularly valuable in regulated environments
            where change control processes require documenting what changed
            between releases. They also help security teams assess whether an
            update introduced new risk (new dependencies from unknown
            suppliers) or reduced it (security patches applied).
          </p>
          <p className="text-sm muted">
            Tools like <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">cyclonedx-cli diff</code> and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">spdx-tools compare</code> can automate this comparison. ScanRook provides diff capability between scan reports in the dashboard — upload the same artifact at different versions and compare the package inventories.
          </p>
        </section>

        {/* Regulatory */}
        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Regulatory Requirements
          </h2>

          <div className="grid gap-4">
            <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
              <h3 className="text-sm font-semibold">US Executive Order 14028 (May 2021)</h3>
              <p className="text-sm muted">
                Requires all software sold to the US federal government to
                include an SBOM. NIST defined minimum elements: supplier name,
                component name, version, unique identifier, dependency
                relationships, author of the SBOM data, and timestamp. Both
                CycloneDX and SPDX satisfy these minimum elements.
              </p>
              <p className="text-sm muted">
                Applies to: any organization selling software or cloud services
                to US federal agencies. The requirement cascades — if your
                customer is a federal contractor, they may require SBOMs from
                their vendors (you) to meet their own compliance obligations.
              </p>
            </div>

            <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
              <h3 className="text-sm font-semibold">EU Cyber Resilience Act (CRA) — Effective 2027</h3>
              <p className="text-sm muted">
                Requires all products with digital elements sold in the EU
                market to include an SBOM. Unlike EO 14028 which applies only
                to government procurement, the CRA applies to the entire
                commercial market. Penalties for non-compliance include fines up
                to 15 million euros or 2.5% of global annual turnover.
              </p>
              <p className="text-sm muted">
                The CRA also mandates vulnerability handling processes:
                coordinated disclosure, security updates for the product
                lifetime, and notification of actively exploited vulnerabilities
                to ENISA within 24 hours. SBOMs are the foundation that makes
                automated vulnerability tracking possible. See our{" "}
                <Link href="/blog/compliance-scanning-guide" className="underline">
                  compliance scanning guide
                </Link>{" "}
                for framework-specific requirements.
              </p>
            </div>

            <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
              <h3 className="text-sm font-semibold">FDA Cybersecurity Requirements (Medical Devices)</h3>
              <p className="text-sm muted">
                The FDA requires SBOMs for all medical device submissions as of
                March 2023. Both commercial and open source components must be
                listed. The requirement applies to both premarket submissions
                (510(k), PMA) and postmarket monitoring processes.
              </p>
            </div>
          </div>
        </section>

        {/* Practical tips */}
        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Practical Tips for Working with SBOMs
          </h2>
          <ul className="list-disc pl-6 text-sm muted grid gap-2">
            <li>
              <strong>Store SBOMs alongside artifacts.</strong> Attach SBOMs to
              container images using OCI annotations or Cosign attestations.
              This ensures the SBOM always travels with the artifact it
              describes.
            </li>
            <li>
              <strong>Automate generation in CI/CD.</strong> Generate SBOMs as
              part of every build, not manually or on-demand. This ensures
              every deployed version has a current inventory.
            </li>
            <li>
              <strong>Validate SBOM completeness.</strong> An SBOM that only
              lists top-level dependencies misses the transitive tree where
              most vulnerabilities hide. Use tools that enumerate the full
              dependency graph.
            </li>
            <li>
              <strong>Use purl for cross-tool interoperability.</strong> Package
              URLs (purl) are the universal identifier that all tools
              understand. Ensure your SBOMs include purl references for every
              component to enable cross-referencing with vulnerability
              databases.
            </li>
            <li>
              <strong>Consider VEX for false positive reduction.</strong> If
              your SBOM lists a component with a known CVE but your product is
              not actually affected (the vulnerable function is not called),
              publish a VEX statement. This prevents downstream consumers from
              raising false alarms.
            </li>
            <li>
              <strong>Version your SBOMs.</strong> CycloneDX includes a{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">version</code>{" "}
              field; increment it when you update the SBOM for the same
              artifact (e.g., after adding VEX data or correcting a component
              entry).
            </li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Frequently Asked Questions
          </h2>

          <div className="grid gap-4">
            <div className="grid gap-1">
              <h3 className="text-sm font-medium">What is an SBOM?</h3>
              <p className="text-sm muted">
                A Software Bill of Materials is a machine-readable inventory of all components, libraries, and dependencies in a software artifact — like an ingredient list for software.
              </p>
            </div>
            <div className="grid gap-1">
              <h3 className="text-sm font-medium">What is the difference between CycloneDX and SPDX?</h3>
              <p className="text-sm muted">
                CycloneDX (OWASP) is security-focused with simpler structure and built-in VEX support. SPDX (Linux Foundation, ISO 5962) is broader, covering licensing and provenance with richer relationship types. Both satisfy regulatory SBOM requirements.
              </p>
            </div>
            <div className="grid gap-1">
              <h3 className="text-sm font-medium">Is an SBOM legally required?</h3>
              <p className="text-sm muted">
                For US federal government suppliers, yes (EO 14028). For all software in the EU market, yes starting 2027 (Cyber Resilience Act). For FDA-regulated medical devices, yes since March 2023.
              </p>
            </div>
            <div className="grid gap-1">
              <h3 className="text-sm font-medium">How do I generate an SBOM?</h3>
              <p className="text-sm muted">
                Tools like ScanRook, Syft, and Trivy generate SBOMs from container images and source code. ScanRook produces a package inventory with every scan. Syft and Trivy output in CycloneDX or SPDX format.
              </p>
            </div>
            <div className="grid gap-1">
              <h3 className="text-sm font-medium">Which SBOM format should I use?</h3>
              <p className="text-sm muted">
                For security/vulnerability use cases: CycloneDX. For legal/licensing compliance: SPDX. For maximum interoperability: generate both from the same source data using tools like Syft.
              </p>
            </div>
            <div className="grid gap-1">
              <h3 className="text-sm font-medium">How often should I regenerate my SBOM?</h3>
              <p className="text-sm muted">
                Every time you build a new version. Integrate SBOM generation into your CI/CD pipeline so every artifact has a current, accurate inventory.
              </p>
            </div>
            <div className="grid gap-1">
              <h3 className="text-sm font-medium">Can an SBOM tell me if my software is vulnerable?</h3>
              <p className="text-sm muted">
                An SBOM alone lists components but does not indicate vulnerability status. Cross-reference SBOM data against vulnerability databases (NVD, OSV) to identify affected components. CycloneDX supports embedding vulnerability status via VEX.
              </p>
            </div>
            <div className="grid gap-1">
              <h3 className="text-sm font-medium">What is VEX and how does it relate to SBOM?</h3>
              <p className="text-sm muted">
                VEX (Vulnerability Exploitability eXchange) is a companion document stating whether a known vulnerability actually affects your product. It lets producers mark CVEs as &quot;not affected&quot; or &quot;fixed&quot;, reducing false positives for SBOM consumers.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="grid gap-3 rounded-lg border border-black/10 dark:border-white/10 bg-black/[.02] dark:bg-white/[.02] p-6">
          <h2 className="text-lg font-semibold tracking-tight">
            Generate Your First SBOM
          </h2>
          <p className="text-sm muted">
            Upload a container image, source archive, or binary to ScanRook
            and get a complete package inventory with vulnerability and license
            data in seconds. No SBOM tool configuration required.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-md bg-black dark:bg-white text-white dark:text-black px-4 py-2 text-sm font-medium"
            >
              Start Scanning
            </Link>
            <Link
              href="/blog/what-is-sbom-and-how-scanrook-uses-it"
              className="inline-flex items-center rounded-md border border-black/20 dark:border-white/20 px-4 py-2 text-sm font-medium"
            >
              How ScanRook Uses SBOMs
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
