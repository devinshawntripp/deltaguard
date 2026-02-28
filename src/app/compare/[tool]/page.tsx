import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";
import PublicSiteShell from "@/components/PublicSiteShell";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

type Support = "yes" | "no" | "partial" | "limited" | "paid" | "community";

interface FeatureRow {
  feature: string;
  scanrook: string;
  competitor: string;
  scanrookSupport: Support;
  competitorSupport: Support;
}

interface Differentiator {
  title: string;
  description: string;
}

interface BenchmarkRow {
  image: string;
  size: string;
  scanrookTime: string;
  scanrookFindings: number;
  competitorTime: string;
  competitorFindings: number;
}

interface ToolData {
  slug: string;
  name: string;
  fullName: string;
  description: string;
  metaDescription: string;
  features: FeatureRow[];
  benchmarks: BenchmarkRow[];
  differentiators: Differentiator[];
  competitorStrengths: string[];
  summary: string;
}

const tools: Record<string, ToolData> = {
  trivy: {
    slug: "trivy",
    name: "Trivy",
    fullName: "Aqua Trivy",
    description:
      "Trivy is a widely-used open-source vulnerability scanner by Aqua Security that covers containers, filesystems, git repositories, and Kubernetes clusters.",
    metaDescription:
      "Compare ScanRook vs Trivy: feature comparison covering data sources, scan targets, confidence model, SBOM support, and scanning approach.",
    features: [
      {
        feature: "Vulnerability data sources",
        scanrook: "OSV, NVD, Red Hat OVAL, EPSS, CISA KEV",
        competitor: "NVD, GitHub Advisory, Red Hat, Ubuntu, Debian, Alpine, etc.",
        scanrookSupport: "yes",
        competitorSupport: "yes",
      },
      {
        feature: "Container image scanning",
        scanrook: "Tar-based extraction with layer ordering",
        competitor: "Image refs, tar files, OCI registries",
        scanrookSupport: "yes",
        competitorSupport: "yes",
      },
      {
        feature: "Binary scanning (ELF/PE/Mach-O)",
        scanrook: "Full support via goblin with linked library extraction",
        competitor: "Limited binary analysis",
        scanrookSupport: "yes",
        competitorSupport: "limited",
      },
      {
        feature: "ISO image scanning",
        scanrook: "Native ISO extraction and package detection",
        competitor: "Not supported",
        scanrookSupport: "yes",
        competitorSupport: "no",
      },
      {
        feature: "SBOM import (CycloneDX, SPDX, Syft)",
        scanrook: "CycloneDX, SPDX, Syft JSON with enrichment",
        competitor: "CycloneDX, SPDX generation and scanning",
        scanrookSupport: "yes",
        competitorSupport: "yes",
      },
      {
        feature: "SBOM diff",
        scanrook: "Component-level diff between SBOM snapshots",
        competitor: "Not built-in",
        scanrookSupport: "yes",
        competitorSupport: "no",
      },
      {
        feature: "Confidence tiers",
        scanrook: "ConfirmedInstalled vs HeuristicUnverified",
        competitor: "No confidence classification",
        scanrookSupport: "yes",
        competitorSupport: "no",
      },
      {
        feature: "Installed-state-first scanning",
        scanrook: "Reads actual package manager databases (RPM, APK, dpkg)",
        competitor: "Uses package manager databases but no confidence tiering",
        scanrookSupport: "yes",
        competitorSupport: "partial",
      },
      {
        feature: "Kubernetes scanning",
        scanrook: "Not supported (focused on artifact scanning)",
        competitor: "Cluster scanning, RBAC analysis, secret detection",
        scanrookSupport: "no",
        competitorSupport: "yes",
      },
      {
        feature: "IaC misconfiguration",
        scanrook: "Not supported",
        competitor: "Terraform, CloudFormation, Kubernetes manifests",
        scanrookSupport: "no",
        competitorSupport: "yes",
      },
      {
        feature: "Self-hosted deployment",
        scanrook: "CLI runs locally, Platform self-hostable (Enterprise)",
        competitor: "Fully open-source, self-hosted by default",
        scanrookSupport: "yes",
        competitorSupport: "yes",
      },
      {
        feature: "EPSS exploit prediction",
        scanrook: "Built-in for all findings",
        competitor: "Not included by default",
        scanrookSupport: "yes",
        competitorSupport: "no",
      },
      {
        feature: "CISA KEV tagging",
        scanrook: "Automatic tagging of actively exploited CVEs",
        competitor: "Not included by default",
        scanrookSupport: "yes",
        competitorSupport: "no",
      },
    ],
    benchmarks: [
      { image: "ubuntu:22.04", size: "69 MB", scanrookTime: "1.5s", scanrookFindings: 29, competitorTime: "0.1s", competitorFindings: 28 },
      { image: "debian:12", size: "137 MB", scanrookTime: "1.3s", scanrookFindings: 18, competitorTime: "0.2s", competitorFindings: 92 },
      { image: "alpine:3.20", size: "8.7 MB", scanrookTime: "3.3s", scanrookFindings: 0, competitorTime: "0.1s", competitorFindings: 0 },
      { image: "rockylinux:9", size: "189 MB", scanrookTime: "1.5s", scanrookFindings: 0, competitorTime: "0.2s", competitorFindings: 176 },
      { image: "node:22-slim", size: "240 MB", scanrookTime: "1.4s", scanrookFindings: 18, competitorTime: "0.2s", competitorFindings: 109 },
    ],
    differentiators: [
      {
        title: "Installed-state-first scanning with confidence tiers",
        description:
          "ScanRook reads the actual package manager databases inside containers and classifies findings as ConfirmedInstalled or HeuristicUnverified. This reduces noise from packages that appear in layers but are not actually installed in the final image state.",
      },
      {
        title: "EPSS and CISA KEV enrichment by default",
        description:
          "Every ScanRook finding includes EPSS exploit probability scores and CISA Known Exploited Vulnerabilities status. This helps teams prioritize based on real-world exploit likelihood rather than CVSS alone.",
      },
      {
        title: "SBOM diff for supply chain monitoring",
        description:
          "ScanRook includes built-in SBOM diff capabilities for tracking component changes between releases. This is useful for detecting supply chain drift without external tooling.",
      },
    ],
    competitorStrengths: [
      "Broader scan scope including Kubernetes clusters, IaC, and secret detection.",
      "Larger community and ecosystem with extensive plugin support.",
      "Built-in SBOM generation (ScanRook focuses on import and enrichment).",
      "Mature CI/CD integrations with most major platforms.",
    ],
    summary:
      "Trivy is an excellent general-purpose scanner with broad coverage. ScanRook focuses on artifact-level scanning with deeper confidence classification and exploit prediction enrichment. Choose Trivy if you need Kubernetes cluster scanning and IaC analysis. Choose ScanRook if you want installed-state-first findings with confidence tiers and built-in EPSS/KEV prioritization.",
  },

  grype: {
    slug: "grype",
    name: "Grype",
    fullName: "Anchore Grype",
    description:
      "Grype is an open-source vulnerability scanner by Anchore that focuses on container images and filesystems, designed to work alongside Syft for SBOM generation.",
    metaDescription:
      "Compare ScanRook vs Grype: feature comparison covering data sources, scan targets, confidence model, SBOM support, and scanning approach.",
    features: [
      {
        feature: "Vulnerability data sources",
        scanrook: "OSV, NVD, Red Hat OVAL, EPSS, CISA KEV",
        competitor: "NVD, GitHub Advisory, Alpine, Amazon, Debian, Oracle, Red Hat, SUSE, Ubuntu, Wolfi",
        scanrookSupport: "yes",
        competitorSupport: "yes",
      },
      {
        feature: "Container image scanning",
        scanrook: "Tar-based extraction with layer ordering",
        competitor: "Image refs, tar files, OCI registries (via Syft)",
        scanrookSupport: "yes",
        competitorSupport: "yes",
      },
      {
        feature: "Binary scanning (ELF/PE/Mach-O)",
        scanrook: "Full support via goblin with linked library extraction",
        competitor: "Go binary detection, limited general binary analysis",
        scanrookSupport: "yes",
        competitorSupport: "limited",
      },
      {
        feature: "ISO image scanning",
        scanrook: "Native ISO extraction and package detection",
        competitor: "Not supported",
        scanrookSupport: "yes",
        competitorSupport: "no",
      },
      {
        feature: "SBOM import",
        scanrook: "CycloneDX, SPDX, Syft JSON with enrichment",
        competitor: "Syft JSON, CycloneDX, SPDX (designed for Syft output)",
        scanrookSupport: "yes",
        competitorSupport: "yes",
      },
      {
        feature: "SBOM diff",
        scanrook: "Component-level diff between SBOM snapshots",
        competitor: "Not built-in (separate tooling required)",
        scanrookSupport: "yes",
        competitorSupport: "no",
      },
      {
        feature: "Confidence tiers",
        scanrook: "ConfirmedInstalled vs HeuristicUnverified",
        competitor: "No confidence classification",
        scanrookSupport: "yes",
        competitorSupport: "no",
      },
      {
        feature: "Installed-state-first scanning",
        scanrook: "Reads actual package manager databases (RPM, APK, dpkg)",
        competitor: "Uses Syft for package detection (file-based catalogers)",
        scanrookSupport: "yes",
        competitorSupport: "partial",
      },
      {
        feature: "SBOM generation",
        scanrook: "Via integrated Syft (optional)",
        competitor: "Via Syft (separate tool, tightly integrated)",
        scanrookSupport: "partial",
        competitorSupport: "yes",
      },
      {
        feature: "Self-hosted deployment",
        scanrook: "CLI runs locally, Platform self-hostable (Enterprise)",
        competitor: "Fully open-source, self-hosted by default",
        scanrookSupport: "yes",
        competitorSupport: "yes",
      },
      {
        feature: "EPSS exploit prediction",
        scanrook: "Built-in for all findings",
        competitor: "Not included",
        scanrookSupport: "yes",
        competitorSupport: "no",
      },
      {
        feature: "CISA KEV tagging",
        scanrook: "Automatic tagging of actively exploited CVEs",
        competitor: "Not included",
        scanrookSupport: "yes",
        competitorSupport: "no",
      },
      {
        feature: "Cloud platform (dashboard, teams)",
        scanrook: "Web dashboard with SSE progress, org management",
        competitor: "CLI only (Anchore Enterprise for UI)",
        scanrookSupport: "yes",
        competitorSupport: "paid",
      },
    ],
    benchmarks: [
      { image: "ubuntu:22.04", size: "69 MB", scanrookTime: "1.5s", scanrookFindings: 29, competitorTime: "1.0s", competitorFindings: 34 },
      { image: "debian:12", size: "137 MB", scanrookTime: "1.3s", scanrookFindings: 18, competitorTime: "1.2s", competitorFindings: 86 },
      { image: "alpine:3.20", size: "8.7 MB", scanrookTime: "3.3s", scanrookFindings: 0, competitorTime: "1.2s", competitorFindings: 4 },
      { image: "rockylinux:9", size: "189 MB", scanrookTime: "1.5s", scanrookFindings: 0, competitorTime: "1.8s", competitorFindings: 539 },
      { image: "node:22-slim", size: "240 MB", scanrookTime: "1.4s", scanrookFindings: 18, competitorTime: "3.7s", competitorFindings: 103 },
    ],
    differentiators: [
      {
        title: "Confidence tiers reduce false positive noise",
        description:
          "ScanRook classifies every finding as ConfirmedInstalled or HeuristicUnverified based on how the package was detected. Packages read directly from RPM, APK, or dpkg databases get higher confidence than those detected via file path heuristics.",
      },
      {
        title: "Integrated exploit prioritization",
        description:
          "ScanRook enriches every finding with EPSS probability scores and CISA KEV status by default. This gives security teams an actionable prioritization signal beyond CVSS severity alone.",
      },
      {
        title: "All-in-one platform with web dashboard",
        description:
          "ScanRook includes a web platform for scan management, real-time progress tracking, and team collaboration. Grype is CLI-only (Anchore Enterprise provides a UI but is a separate commercial product).",
      },
    ],
    competitorStrengths: [
      "Tight integration with Syft for comprehensive SBOM generation.",
      "Well-established vulnerability database with broad distro-specific advisory coverage.",
      "Lightweight and fast with a focused scope.",
      "Fully open-source with no paid tier required for core functionality.",
    ],
    summary:
      "Grype is a focused, fast vulnerability scanner that pairs well with Syft. ScanRook provides confidence-tiered findings, built-in exploit prioritization, and an optional web platform. Choose Grype if you want a lightweight CLI that integrates tightly with Syft. Choose ScanRook if you need confidence classification, EPSS/KEV enrichment, and a web dashboard for team workflows.",
  },

  snyk: {
    slug: "snyk",
    name: "Snyk",
    fullName: "Snyk Container & Open Source",
    description:
      "Snyk is a commercial developer security platform that provides vulnerability scanning for open-source dependencies, containers, IaC, and custom code.",
    metaDescription:
      "Compare ScanRook vs Snyk: feature comparison covering data sources, scan targets, confidence model, SBOM support, pricing, and deployment options.",
    features: [
      {
        feature: "Vulnerability data sources",
        scanrook: "OSV, NVD, Red Hat OVAL, EPSS, CISA KEV",
        competitor: "Snyk Vulnerability Database (proprietary), NVD, distro advisories",
        scanrookSupport: "yes",
        competitorSupport: "yes",
      },
      {
        feature: "Container image scanning",
        scanrook: "Tar-based extraction with layer ordering",
        competitor: "Registry-based, Docker, Kubernetes",
        scanrookSupport: "yes",
        competitorSupport: "yes",
      },
      {
        feature: "Binary scanning (ELF/PE/Mach-O)",
        scanrook: "Full support via goblin with linked library extraction",
        competitor: "Limited to dependency detection in compiled artifacts",
        scanrookSupport: "yes",
        competitorSupport: "limited",
      },
      {
        feature: "ISO image scanning",
        scanrook: "Native ISO extraction and package detection",
        competitor: "Not supported",
        scanrookSupport: "yes",
        competitorSupport: "no",
      },
      {
        feature: "SBOM support",
        scanrook: "Import CycloneDX, SPDX, Syft JSON; diff between snapshots",
        competitor: "SBOM export (CycloneDX, SPDX); limited import",
        scanrookSupport: "yes",
        competitorSupport: "partial",
      },
      {
        feature: "SBOM diff",
        scanrook: "Component-level diff between SBOM snapshots",
        competitor: "Not built-in",
        scanrookSupport: "yes",
        competitorSupport: "no",
      },
      {
        feature: "Confidence tiers",
        scanrook: "ConfirmedInstalled vs HeuristicUnverified",
        competitor: "No confidence classification",
        scanrookSupport: "yes",
        competitorSupport: "no",
      },
      {
        feature: "Source code analysis (SAST)",
        scanrook: "Not supported (artifact scanning only)",
        competitor: "Snyk Code for SAST",
        scanrookSupport: "no",
        competitorSupport: "yes",
      },
      {
        feature: "IaC misconfiguration",
        scanrook: "Not supported",
        competitor: "Terraform, CloudFormation, Kubernetes, ARM templates",
        scanrookSupport: "no",
        competitorSupport: "yes",
      },
      {
        feature: "Fix recommendations",
        scanrook: "CVE details and references provided",
        competitor: "Automated fix PRs, upgrade paths, patch recommendations",
        scanrookSupport: "partial",
        competitorSupport: "yes",
      },
      {
        feature: "Self-hosted deployment",
        scanrook: "CLI local, Platform self-hostable (Enterprise)",
        competitor: "Snyk Broker for hybrid; primarily SaaS",
        scanrookSupport: "yes",
        competitorSupport: "partial",
      },
      {
        feature: "Pricing model",
        scanrook: "Free CLI, $29/mo Pro, custom Enterprise",
        competitor: "Free tier (limited tests), Team/Enterprise pricing",
        scanrookSupport: "yes",
        competitorSupport: "paid",
      },
      {
        feature: "EPSS exploit prediction",
        scanrook: "Built-in for all findings",
        competitor: "Available in some views",
        scanrookSupport: "yes",
        competitorSupport: "partial",
      },
      {
        feature: "CISA KEV tagging",
        scanrook: "Automatic tagging of actively exploited CVEs",
        competitor: "Available in priority scoring",
        scanrookSupport: "yes",
        competitorSupport: "partial",
      },
      {
        feature: "Offline / air-gapped operation",
        scanrook: "CLI works offline with cached vulnerability data",
        competitor: "Requires internet connectivity",
        scanrookSupport: "yes",
        competitorSupport: "no",
      },
    ],
    benchmarks: [],
    differentiators: [
      {
        title: "Free, unlimited local scanning with no account",
        description:
          "ScanRook's CLI is fully functional without any account, login, or usage limits. Snyk's free tier has monthly test limits and requires account creation. ScanRook's core scanning capability is never gated behind a paywall.",
      },
      {
        title: "Installed-state-first with confidence tiers",
        description:
          "ScanRook reads actual package manager databases and classifies findings by confidence level. This approach reduces noise from packages that exist in intermediate layers but are not present in the final running state of a container.",
      },
      {
        title: "Self-hosted with no vendor lock-in",
        description:
          "ScanRook's Enterprise tier is fully self-hostable on Kubernetes. All vulnerability data comes from open, publicly accessible databases (OSV, NVD, OVAL). There is no proprietary vulnerability database that creates vendor dependency.",
      },
      {
        title: "Offline and air-gapped operation",
        description:
          "ScanRook's CLI can operate fully offline using cached vulnerability data, making it suitable for air-gapped environments. Snyk requires internet connectivity for all scans.",
      },
    ],
    competitorStrengths: [
      "Broader security coverage including SAST (Snyk Code), IaC, and license compliance.",
      "Automated fix recommendations with upgrade paths and pull request generation.",
      "Proprietary vulnerability database with faster CVE coverage for some ecosystems.",
      "Extensive IDE integrations and developer-focused workflow.",
      "Mature enterprise features including SSO, audit logs, and compliance reporting.",
    ],
    summary:
      "Snyk is a comprehensive developer security platform with broad coverage. ScanRook is a focused artifact scanner with confidence-tiered findings and transparent data sources. Choose Snyk if you need SAST, automated fix PRs, and a full developer security platform. Choose ScanRook if you want free unlimited scanning, confidence tiers, open data sources, and self-hosted deployment without vendor lock-in.",
  },
};

const validSlugs = Object.keys(tools);

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

const baseUrl = (
  process.env.NEXT_PUBLIC_APP_URL || "https://scanrook.io"
).replace(/\/+$/, "");

interface PageProps {
  params: Promise<{ tool: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tool: slug } = await params;
  const data = tools[slug];
  if (!data) return {};

  const title = `ScanRook vs ${data.name} | ${APP_NAME}`;
  const description = data.metaDescription;
  const canonical = `${baseUrl}/compare/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
    },
  };
}

export function generateStaticParams() {
  return validSlugs.map((tool) => ({ tool }));
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function ComparePage({ params }: PageProps) {
  const { tool: slug } = await params;
  const data = tools[slug];
  if (!data) notFound();

  const canonical = `${baseUrl}/compare/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `ScanRook vs ${data.name}: Vulnerability Scanner Comparison`,
    description: data.metaDescription,
    url: canonical,
    publisher: {
      "@type": "Organization",
      name: "ScanRook",
      url: baseUrl,
    },
    about: {
      "@type": "SoftwareApplication",
      name: "ScanRook",
      applicationCategory: "SecurityApplication",
      operatingSystem: "Linux, macOS, Windows",
    },
  };

  return (
    <PublicSiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="mx-auto max-w-5xl px-6 py-14 grid gap-8">
        {/* Header */}
        <section className="surface-card p-8 grid gap-4">
          <div className="inline-flex w-fit items-center rounded-full border border-black/10 dark:border-white/10 px-3 py-1 text-xs muted">
            Comparison
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            ScanRook vs {data.name}
          </h1>
          <p className="text-sm muted max-w-3xl">{data.description}</p>
          <p className="text-sm muted max-w-3xl">
            This comparison is intended to be fair and factual. Both tools serve
            different use cases and have genuine strengths.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <a href="https://scanrook.sh" className="btn-primary">
              Install ScanRook
            </a>
            <Link href="/docs" className="btn-secondary">
              Docs
            </Link>
            <Link href="/pricing" className="btn-secondary">
              Pricing
            </Link>
          </div>
        </section>

        {/* Feature comparison table */}
        <section className="surface-card p-6 grid gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Feature comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-3 pr-4 font-semibold">Feature</th>
                  <th className="text-left py-3 pr-4 font-semibold">ScanRook</th>
                  <th className="text-left py-3 pr-4 font-semibold">{data.name}</th>
                </tr>
              </thead>
              <tbody className="muted">
                {data.features.map((row) => (
                  <tr
                    key={row.feature}
                    className="border-b border-black/5 dark:border-white/5"
                  >
                    <td className="py-3 pr-4 font-medium text-[color:var(--dg-text)]">
                      {row.feature}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-start gap-2">
                        <SupportIndicator support={row.scanrookSupport} />
                        <span className="text-xs leading-relaxed">{row.scanrook}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-start gap-2">
                        <SupportIndicator support={row.competitorSupport} />
                        <span className="text-xs leading-relaxed">{row.competitor}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Benchmark results */}
        {data.benchmarks.length > 0 && (
          <section className="surface-card p-6 grid gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">
              Benchmark results
            </h2>
            <p className="text-xs muted">
              Warm-cache runs on macOS (darwin/amd64). ScanRook 1.5.0, {data.name}{" "}
              {slug === "trivy" ? "0.69.1" : "0.109.0"}. ScanRook includes EPSS
              and CISA KEV enrichment. Findings count reflects each tool&apos;s
              default detection approach.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/10">
                    <th className="text-left py-3 pr-4 font-semibold">Image</th>
                    <th className="text-left py-3 pr-4 font-semibold">Size</th>
                    <th className="text-right py-3 pr-4 font-semibold">
                      ScanRook
                    </th>
                    <th className="text-right py-3 pr-4 font-semibold">
                      {data.name}
                    </th>
                  </tr>
                </thead>
                <tbody className="muted">
                  {data.benchmarks.map((row) => (
                    <tr
                      key={row.image}
                      className="border-b border-black/5 dark:border-white/5"
                    >
                      <td className="py-3 pr-4 font-mono text-xs font-medium text-[color:var(--dg-text)]">
                        {row.image}
                      </td>
                      <td className="py-3 pr-4 text-xs">{row.size}</td>
                      <td className="py-3 pr-4 text-right text-xs">
                        {row.scanrookTime} / {row.scanrookFindings} findings
                      </td>
                      <td className="py-3 pr-4 text-right text-xs">
                        {row.competitorTime} / {row.competitorFindings} findings
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
              <h3 className="text-sm font-semibold">
                Why ScanRook reports fewer findings
              </h3>
              <p className="text-xs muted">
                ScanRook uses an installed-state-first approach, reading actual
                package manager databases (dpkg, RPM, APK) and only reporting
                vulnerabilities for confirmed installed packages. Other scanners
                report all advisories matching file paths or heuristics,
                including unfixed advisories and build-time dependencies.
                ScanRook&apos;s findings include EPSS scores and CISA KEV status
                for prioritization.
              </p>
            </div>
          </section>
        )}

        {/* Key differentiators */}
        <section className="grid gap-4">
          <div className="surface-card p-6 grid gap-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Where ScanRook stands out
            </h2>
            <p className="text-sm muted">
              Key areas where ScanRook takes a different approach.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.differentiators.map((d) => (
              <div key={d.title} className="surface-card p-5 grid gap-2 content-start">
                <h3 className="text-sm font-semibold leading-snug">{d.title}</h3>
                <p className="text-xs muted leading-relaxed">{d.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Competitor strengths */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            Where {data.name} excels
          </h2>
          <p className="text-sm muted">
            Areas where {data.name} has strengths that ScanRook does not currently
            match.
          </p>
          <ul className="grid gap-2">
            {data.competitorStrengths.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm muted">
                <svg
                  className="mt-0.5 flex-shrink-0"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  aria-hidden="true"
                >
                  <circle
                    cx="7"
                    cy="7"
                    r="2.5"
                    fill="currentColor"
                    opacity="0.4"
                  />
                </svg>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Summary */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">Summary</h2>
          <p className="text-sm muted leading-relaxed">{data.summary}</p>
        </section>

        {/* Other comparisons + CTA */}
        <section className="surface-card p-8 grid gap-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Other comparisons
          </h2>
          <div className="flex flex-wrap gap-3">
            {validSlugs
              .filter((s) => s !== slug)
              .map((s) => (
                <Link
                  key={s}
                  href={`/compare/${s}`}
                  className="btn-secondary"
                >
                  ScanRook vs {tools[s].name}
                </Link>
              ))}
          </div>
        </section>

        <section className="surface-card p-8 grid gap-4 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Try ScanRook
          </h2>
          <p className="text-sm muted">
            Install the CLI in under 30 seconds. No account required.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-1">
            <a href="https://scanrook.sh" className="btn-primary">
              Install CLI
            </a>
            <Link href="/pricing" className="btn-secondary">
              View pricing
            </Link>
          </div>
        </section>
      </main>
    </PublicSiteShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function SupportIndicator({ support }: { support: Support }) {
  if (support === "yes") {
    return (
      <svg
        className="mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        aria-hidden="true"
      >
        <path
          d="M2.5 7.5 5.5 10.5 11.5 4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (support === "no") {
    return (
      <svg
        className="mt-0.5 flex-shrink-0 text-red-500 dark:text-red-400"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        aria-hidden="true"
      >
        <path
          d="M3.5 3.5l7 7M10.5 3.5l-7 7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  // partial, limited, paid, community
  return (
    <svg
      className="mt-0.5 flex-shrink-0 text-amber-500 dark:text-amber-400"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden="true"
    >
      <path
        d="M3 7h8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
