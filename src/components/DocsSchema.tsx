"use client";

import { usePathname } from "next/navigation";

const docsPages: Record<string, { title: string; description: string }> = {
  "/docs": {
    title: "ScanRook Documentation",
    description: "Complete documentation for ScanRook vulnerability scanner covering CLI usage, dashboard, concepts, integrations, and self-hosted deployment.",
  },
  "/docs/quickstart": {
    title: "Quickstart",
    description: "Install ScanRook, run your first vulnerability scan, configure caching, and review example output.",
  },
  "/docs/cli-reference": {
    title: "CLI Reference",
    description: "Complete command reference for the ScanRook CLI including all subcommands, flags, and output formats.",
  },
  "/docs/dashboard": {
    title: "Dashboard",
    description: "Guide to the ScanRook web dashboard for managing scans, viewing results, and configuring team settings.",
  },
  "/docs/dashboard/jobs-and-progress": {
    title: "Jobs & Progress",
    description: "How scan jobs work in ScanRook: job lifecycle, real-time progress streaming, and status management.",
  },
  "/docs/dashboard/findings-and-reports": {
    title: "Findings & Reports",
    description: "Understanding ScanRook findings, severity levels, filtering, and report export formats.",
  },
  "/docs/concepts/cpe": {
    title: "CPE",
    description: "How ScanRook uses Common Platform Enumeration (CPE) for vulnerability matching and NVD correlation.",
  },
  "/docs/concepts/enrichment": {
    title: "Enrichment",
    description: "How ScanRook enriches vulnerability findings with data from OSV, NVD, EPSS, CISA KEV, and Red Hat OVAL.",
  },
  "/docs/concepts/caching": {
    title: "Caching",
    description: "ScanRook caching layers: file-based, PostgreSQL, and Redis caching for vulnerability data and API responses.",
  },
  "/docs/concepts/confidence-tiers": {
    title: "Confidence Tiers",
    description: "How ScanRook classifies findings as ConfirmedInstalled or HeuristicUnverified based on evidence source.",
  },
  "/docs/concepts/deep-scanning": {
    title: "Deep Scanning",
    description: "ScanRook deep scanning mode for thorough analysis of containers, binaries, and source artifacts.",
  },
  "/docs/concepts/compliance": {
    title: "Compliance",
    description: "Using ScanRook for compliance scanning including SOC 2, ISO 27001, and FedRAMP report generation.",
  },
  "/docs/concepts/supply-chain-security": {
    title: "Supply Chain Security",
    description: "How ScanRook supports software supply chain security with SBOM generation, dependency tracking, and provenance verification.",
  },
  "/docs/concepts/scan-status": {
    title: "Scan Status",
    description: "Understanding scan job states in ScanRook: queued, running, done, failed, and cancelled.",
  },
  "/docs/concepts/vulnerability-database": {
    title: "Vulnerability Database",
    description: "ScanRook vulnerability database architecture: free and pro tiers, data sources, and offline scanning support.",
  },
  "/docs/concepts/license-scanning": {
    title: "License Scanning",
    description: "How ScanRook detects and classifies open source licenses across package ecosystems.",
  },
  "/docs/concepts/license-types": {
    title: "License Types",
    description: "Reference guide to open source license types, risk tiers, and compliance obligations detected by ScanRook.",
  },
  "/docs/benchmarks": {
    title: "Benchmarks",
    description: "ScanRook benchmark methodology and results comparing scan speed and accuracy against Trivy and Grype.",
  },
  "/docs/self-hosted": {
    title: "Self-Hosted Deployment",
    description: "Deploy ScanRook on your own Kubernetes cluster with full control over data and infrastructure.",
  },
  "/docs/architecture": {
    title: "Architecture",
    description: "ScanRook system architecture: UI, dispatcher, scanner, and worker components with data flow diagrams.",
  },
  "/docs/data-sources": {
    title: "Data Sources",
    description: "Vulnerability data sources used by ScanRook: OSV, NVD, Red Hat OVAL, CISA KEV, and EPSS.",
  },
  "/docs/integrations/github-actions": {
    title: "GitHub Actions Integration",
    description: "Set up ScanRook in GitHub Actions CI/CD pipelines with PR comments and policy gates.",
  },
  "/docs/integrations/gitlab-ci": {
    title: "GitLab CI Integration",
    description: "Set up ScanRook in GitLab CI/CD pipelines for automated vulnerability scanning.",
  },
  "/docs/faq": {
    title: "FAQ",
    description: "Frequently asked questions about ScanRook vulnerability scanner.",
  },
  "/docs/changelog": {
    title: "Changelog",
    description: "ScanRook documentation changelog and version history.",
  },
};

export default function DocsSchema() {
  const pathname = usePathname();
  const page = docsPages[pathname];

  if (!page) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.title,
    description: page.description,
    url: `https://scanrook.io${pathname}`,
    author: { "@type": "Organization", name: "ScanRook", url: "https://scanrook.io" },
    publisher: { "@type": "Organization", name: "ScanRook", url: "https://scanrook.io" },
    mainEntityOfPage: `https://scanrook.io${pathname}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
