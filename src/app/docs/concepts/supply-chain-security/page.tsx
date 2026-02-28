import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supply Chain Security",
  description:
    "How modern software supply chain attacks work, why SBOMs matter, and how ScanRook helps organizations maintain visibility across their dependency graph.",
};

type Attack = {
  name: string;
  year: string;
  cve?: string;
  description: string;
};

const attacks: Attack[] = [
  {
    name: "SolarWinds",
    year: "2020",
    description:
      "Attackers compromised the SolarWinds Orion build system and injected a backdoor into signed software updates. Over 18,000 organizations installed the trojanized update, including multiple US federal agencies.",
  },
  {
    name: "Log4Shell",
    year: "2021",
    cve: "CVE-2021-44228",
    description:
      "A critical remote code execution vulnerability in Apache Log4j, a ubiquitous Java logging library embedded in thousands of applications. The vulnerability allowed attackers to execute arbitrary code via crafted log messages, affecting virtually every Java-based system.",
  },
  {
    name: "XZ Utils",
    year: "2024",
    cve: "CVE-2024-3094",
    description:
      "A sophisticated multi-year social engineering campaign resulted in a backdoor being inserted into the XZ compression utility. The backdoor targeted the OpenSSH daemon on certain Linux distributions, enabling unauthorized remote access.",
  },
];

const ntiaElements = [
  "Supplier name",
  "Component name",
  "Version string",
  "Unique identifier (e.g. PURL, CPE)",
  "Dependency relationship",
  "Author of SBOM data",
  "Timestamp",
];

export default function SupplyChainSecurityPage() {
  return (
    <article className="grid gap-6">
      {/* Opening */}
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Supply Chain Security
        </h1>
        <p className="muted text-sm max-w-3xl">
          Modern software relies on thousands of transitive dependencies pulled
          from public registries, upstream distributions, and third-party
          vendors. Each dependency is a link in the software supply chain, and
          any compromised link can introduce vulnerabilities, backdoors, or
          malicious code into the final product. Supply chain security is the
          discipline of ensuring visibility and trust across every one of those
          links.
        </p>
      </section>

      {/* What is supply chain security */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="What is software supply chain security"
          blurb="Ensuring every component in your software stack is trusted, uncompromised, and free of known vulnerabilities."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            Software supply chain security is the practice of verifying that
            every component in a software product -- from OS-level system
            packages to npm modules, Python libraries, and statically linked C
            dependencies -- comes from a trusted source and has not been
            tampered with. It extends traditional application security beyond
            your own code to encompass the entire graph of upstream
            dependencies.
          </p>
          <p>
            The challenge is scale. A typical container image contains hundreds
            of packages across multiple ecosystems. A single npm project can
            pull in over a thousand transitive dependencies. Without automated
            tooling, it is not feasible to manually audit every component for
            known vulnerabilities, license compliance, or signs of compromise.
          </p>
        </div>
      </section>

      {/* High-profile attacks */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Recent high-profile supply chain attacks"
          blurb="These incidents demonstrate why supply chain visibility is essential."
        />
        <div className="grid gap-4">
          {attacks.map((a) => (
            <div
              key={a.name}
              className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold">{a.name}</h3>
                <code className="text-xs rounded px-1.5 py-0.5 border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04]">
                  {a.year}
                </code>
                {a.cve && (
                  <code className="text-xs rounded px-1.5 py-0.5 border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04]">
                    {a.cve}
                  </code>
                )}
              </div>
              <p className="text-sm muted">{a.description}</p>
            </div>
          ))}
        </div>
        <p className="text-sm muted">
          These attacks share a common pattern: they target the weakest link in
          the supply chain rather than attacking the final product directly. The
          lesson is clear -- organizations need continuous, automated visibility
          into every component they ship.
        </p>
      </section>

      {/* SBOMs */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="SBOMs as a transparency tool"
          blurb="A Software Bill of Materials provides a machine-readable inventory of every component in a software product."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            A Software Bill of Materials (SBOM) is a structured, machine-readable
            document that lists every component, library, and dependency included
            in a piece of software. Think of it as a nutritional label for
            software: it tells you exactly what&apos;s inside.
          </p>
          <p>
            SBOMs enable automated vulnerability tracking by providing a
            definitive list of components that can be continuously matched
            against vulnerability databases. When a new CVE is published,
            organizations with SBOMs can immediately determine which of their
            products are affected, rather than scrambling to audit codebases
            manually.
          </p>
          <p>
            Common SBOM formats include CycloneDX (OWASP), SPDX (Linux
            Foundation), and Syft JSON (Anchore). Each format captures similar
            core data -- component names, versions, suppliers, and
            relationships -- but with different schemas and levels of detail.
          </p>
        </div>
      </section>

      {/* EO 14028 and NTIA */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="EO 14028 and NTIA minimum SBOM elements"
          blurb="Federal requirements that are shaping industry-wide SBOM adoption."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            Executive Order 14028, &quot;Improving the Nation&apos;s
            Cybersecurity,&quot; signed in May 2021, requires software vendors
            selling to the US federal government to provide SBOMs for their
            products. This mandate has accelerated SBOM adoption across the
            broader industry as organizations prepare for downstream compliance
            requirements.
          </p>
          <p>
            The National Telecommunications and Information Administration
            (NTIA) published minimum elements that every SBOM must include:
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            {ntiaElements.map((el) => (
              <li key={el}>{el}</li>
            ))}
          </ul>
          <p>
            These minimum elements establish a baseline for interoperability.
            Any SBOM that includes these fields can be consumed by automated
            tooling regardless of the specific format used.
          </p>
        </div>
      </section>

      {/* How ScanRook fits */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="How ScanRook fits"
          blurb="ScanRook provides SBOM ingestion, vulnerability enrichment, diffing, and policy enforcement."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            ScanRook integrates with the SBOM ecosystem at multiple points in
            the software development lifecycle:
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>
              <strong>Import CycloneDX, SPDX, and Syft JSON SBOMs</strong> --
              ScanRook parses all three major formats and normalizes components
              into a unified package inventory for scanning.
            </li>
            <li>
              <strong>Vulnerability enrichment</strong> -- Imported SBOM
              components are enriched with vulnerability data from OSV, NVD,
              EPSS scores, and CISA KEV status, producing actionable findings
              rather than a static inventory.
            </li>
            <li>
              <strong>SBOM diff between releases</strong> -- Compare two SBOMs
              to detect added, removed, or changed components between software
              releases, making it easy to spot unexpected dependency changes.
            </li>
            <li>
              <strong>Policy gates for SBOM changes</strong> -- Define policies
              that enforce rules on SBOM diffs, such as blocking new
              dependencies with critical vulnerabilities or flagging removed
              security-critical components.
            </li>
          </ul>
          <p>
            Together, these capabilities turn SBOMs from passive documents into
            active security controls that integrate into CI/CD pipelines and
            release processes.
          </p>
        </div>
      </section>

      {/* Artifact signing and provenance */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Artifact signing and provenance"
          blurb="Verifying that software artifacts are authentic and built from trusted sources."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            Beyond knowing what components are in your software, supply chain
            security also requires verifying that artifacts are authentic and
            have not been tampered with. The SLSA (Supply-chain Levels for
            Software Artifacts) framework defines a set of progressively
            stricter requirements for build integrity, from basic build scripting
            (SLSA Level 1) to fully hermetic, reproducible builds with signed
            provenance (SLSA Level 4).
          </p>
          <p>
            Tools like Sigstore and cosign enable keyless signing of container
            images and other artifacts using ephemeral certificates tied to OIDC
            identities. Build provenance attestations, often stored alongside
            container images in OCI registries, provide a verifiable record of
            where and how an artifact was built.
          </p>
          <p>
            ScanRook&apos;s roadmap includes support for verifying artifact
            signatures and SLSA provenance attestations as part of the scanning
            pipeline, enabling organizations to enforce both vulnerability-free
            and provenance-verified policies on their software supply chain.
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
              href="/blog/what-is-sbom-and-how-scanrook-uses-it"
              className="font-medium underline underline-offset-2"
            >
              What is an SBOM and how ScanRook uses it
            </Link>
          </li>
          <li>
            <Link
              href="/docs/concepts/enrichment"
              className="font-medium underline underline-offset-2"
            >
              Enrichment -- how ScanRook queries vulnerability databases
            </Link>
          </li>
          <li>
            <Link
              href="/blog/compliance-scanning-guide"
              className="font-medium underline underline-offset-2"
            >
              Compliance scanning guide
            </Link>
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
