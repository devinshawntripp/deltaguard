import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/brand";
import PublicSiteShell from "@/components/PublicSiteShell";

export const metadata: Metadata = {
  title: `Roadmap | ${APP_NAME}`,
  description:
    "ScanRook product roadmap: shipped features, in-progress work, planned items, and deferred considerations with reasoning.",
  openGraph: {
    title: `Roadmap | ${APP_NAME}`,
    description:
      "See what we have shipped, what we are building, and what is planned for ScanRook.",
  },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

type ItemStatus = "shipped" | "in-progress" | "planned" | "deferred";

interface RoadmapItem {
  title: string;
  description: string;
  status: ItemStatus;
  reason?: string; // only for deferred items
}

const shipped: RoadmapItem[] = [
  {
    title: "OSV, NVD, Red Hat OVAL vulnerability enrichment",
    description:
      "Batch queries against the OSV API, NVD CPE matching, and Red Hat OVAL XML filtering. Three complementary data sources for broad CVE coverage.",
    status: "shipped",
  },
  {
    title: "EPSS exploit prediction scoring",
    description:
      "Every finding is annotated with its EPSS probability and percentile from the FIRST.org EPSS feed, enabling exploit-likelihood-based prioritization.",
    status: "shipped",
  },
  {
    title: "CISA KEV (Known Exploited Vulnerabilities) tagging",
    description:
      "Findings matching the CISA Known Exploited Vulnerabilities catalog are flagged automatically, surfacing actively exploited CVEs for immediate attention.",
    status: "shipped",
  },
  {
    title: "Container scanning",
    description:
      "Full extraction and inventory of container image tars with support for RPM, APK, dpkg, npm, pip, Go modules, and more. OCI manifest and layer ordering handled automatically.",
    status: "shipped",
  },
  {
    title: "Binary scanning (ELF, PE, Mach-O)",
    description:
      "Static analysis of compiled binaries via goblin with memory-mapped I/O. Extracts linked libraries, Go build info, and Rust panic strings for vulnerability correlation.",
    status: "shipped",
  },
  {
    title: "SBOM import (CycloneDX, SPDX, Syft JSON)",
    description:
      "Import existing SBOMs in CycloneDX, SPDX, and Syft JSON formats. Components are enriched through the full vulnerability pipeline automatically.",
    status: "shipped",
  },
  {
    title: "SBOM diff",
    description:
      "Compare two SBOM snapshots to identify added, removed, and changed components. Useful for tracking supply chain drift across releases.",
    status: "shipped",
  },
  {
    title: "Multi-distro support",
    description:
      "AlmaLinux, Rocky Linux, SUSE, Fedora, Amazon Linux, Oracle Linux, Chainguard, and Wolfi. Distro-specific advisory filtering reduces false positives.",
    status: "shipped",
  },
  {
    title: "Confidence tiers (installed-state-first scanning)",
    description:
      "Findings are classified as ConfirmedInstalled or HeuristicUnverified based on evidence source. Installed-state packages are prioritized over heuristic matches.",
    status: "shipped",
  },
  {
    title: "Docker registry scanning (OCI-compliant)",
    description:
      "Connect any OCI-compliant registry (Docker Hub, GHCR, ECR, GCR, self-hosted). Browse repositories and tags, scan images on demand, and manage registry credentials per organization with AES-256-GCM encryption.",
    status: "shipped",
  },
  {
    title: "Prometheus + Grafana monitoring dashboards",
    description:
      "Scanner and worker metrics exposed via Prometheus endpoints. Pre-built Grafana dashboards for scan throughput, queue depth, enrichment latency, and error rates.",
    status: "shipped",
  },
  {
    title: "Centralized logging (Loki)",
    description:
      "Logs from all services aggregated into Grafana Loki via Promtail with unified search, alerting, and correlation across the UI, Dispatcher, and Scanner.",
    status: "shipped",
  },
  {
    title: "Org and team RBAC",
    description:
      "Bitwise role-based access control with eight granular roles from Viewer to Org Owner. API key authentication with scoped permissions and per-org billing quota enforcement.",
    status: "shipped",
  },
  {
    title: "Real-time scan progress (SSE)",
    description:
      "Live scan progress streaming via PostgreSQL NOTIFY/LISTEN and Server-Sent Events. No polling \u2014 the browser receives stage updates, severity counts, and SBOM status in real time.",
    status: "shipped",
  },
  {
    title: "Multi-page documentation",
    description:
      "Structured documentation covering CLI quickstart, SBOM guide, CI/CD integration, architecture, data sources, benchmarks, FAQ, and self-hosted deployment.",
    status: "shipped",
  },
  {
    title: "Expanded benchmark matrix (v1.14.2)",
    description:
      "Benchmarks across 10 container images comparing ScanRook against Trivy and Grype. Published with warm-cache times, finding counts, and methodology transparency.",
    status: "shipped",
  },
];

const inProgress: RoadmapItem[] = [
  {
    title: "Tiered vulnerability database (Free vs Pro)",
    description:
      "Two pre-compiled vulnerability databases: a free tier with OSV + basic NVD (comparable to Trivy/Grype), and a paid tier adding EPSS, CISA KEV, Red Hat OVAL, confidence tiers, and distro tracker cross-references.",
    status: "in-progress",
  },
  {
    title: "Per-developer pricing with API key enforcement",
    description:
      "CLI authenticates via API key to determine plan tier. Free users get OSV-only enrichment. Paid plans unlock full multi-source enrichment, JSON output, and the premium vulnerability database.",
    status: "in-progress",
  },
  {
    title: "Stripe billing integration",
    description:
      "Complete payment processing for Developer, Team, and Enterprise tiers. Per-developer pricing with self-serve checkout, plan management, and usage-based quota enforcement.",
    status: "in-progress",
  },
  {
    title: "GitHub Action with PR comments and policy gates",
    description:
      "Official GitHub Action that runs ScanRook in CI/CD pipelines. Posts findings as PR review comments with severity badges, and can block merges based on configurable policy thresholds.",
    status: "in-progress",
  },
  {
    title: "License detection completion",
    description:
      "Extending license identification across all supported ecosystems. Currently partial coverage; full parity with package inventory detection is the target.",
    status: "in-progress",
  },
];

const planned: RoadmapItem[] = [
  {
    title: "Scheduled recurring scans",
    description:
      "Cron-based scan schedules for registry images. Automatically re-scan images on a configurable cadence and alert on newly disclosed vulnerabilities.",
    status: "planned",
  },
  {
    title: "Slack and webhook notifications",
    description:
      "Configurable notification channels that fire on scan completion, new critical findings, or policy violations. Supports Slack, Discord, PagerDuty, Microsoft Teams, and generic HTTP webhooks.",
    status: "planned",
  },
  {
    title: "Compliance report generation",
    description:
      "Export audit-ready PDF and CSV reports for SOC 2, ISO 27001, and FedRAMP evidence collection. Includes vulnerability inventory, remediation status, and scan coverage timeline.",
    status: "planned",
  },
  {
    title: "Vulnerability trend dashboard",
    description:
      "Historical charts showing vulnerability counts, severity distribution, mean-time-to-remediate, and coverage metrics across all scanned artifacts over time.",
    status: "planned",
  },
  {
    title: "License risk scoring",
    description:
      "Risk-aware license analysis beyond detection. Score packages by license compatibility, copyleft obligations, and commercial use restrictions. Flag GPL/AGPL in proprietary codebases.",
    status: "planned",
  },
  {
    title: "SBOM policy gates in web platform",
    description:
      "Configurable policy engine in the dashboard (the CLI already supports policy gates). Define org-wide rules for severity thresholds, license blocklists, and component age limits.",
    status: "planned",
  },
  {
    title: "Vulnerability remediation guidance",
    description:
      "Actionable fix recommendations per finding including the minimum patched version, upgrade commands, and links to vendor advisories.",
    status: "planned",
  },
  {
    title: "Scan comparison view",
    description:
      "Side-by-side diff of two scan results for the same image showing new, resolved, and unchanged findings across versions.",
    status: "planned",
  },
  {
    title: "SUSE Security OVAL integration",
    description:
      "Native integration with SUSE Security OVAL feeds for SLES and openSUSE. Distro-specific advisory filtering for SUSE-based container images.",
    status: "planned",
  },
  {
    title: "Oracle Linux Security OVAL integration",
    description:
      "Direct consumption of Oracle Linux OVAL data for accurate RPM advisory matching on Oracle Linux containers.",
    status: "planned",
  },
];

const deferred: RoadmapItem[] = [
  {
    title: "Reachability analysis",
    description:
      "Determine whether a vulnerable dependency is actually reachable in the application's call graph, reducing false positives from unused transitive dependencies.",
    status: "deferred",
    reason:
      "Requires language-specific static analysis (call graph resolution) per ecosystem. This is a multi-month research project. Snyk and Semgrep each have dedicated teams on this. We will evaluate integrating existing open-source call graph tools (e.g., Google's deps.dev) before building from scratch.",
  },
  {
    title: "Auto-fix pull requests",
    description:
      "Automatically generate PRs that bump vulnerable dependencies to the minimum patched version.",
    status: "deferred",
    reason:
      "Requires language-specific dependency resolution and lock file manipulation per ecosystem (npm, pip, Go, Maven, Cargo, etc.). Dependabot and Renovate already do this well. We will explore integration with these tools rather than building a competing implementation.",
  },
  {
    title: "IDE plugins (VS Code, IntelliJ)",
    description:
      "Real-time vulnerability scanning in the editor with inline severity annotations and quick-fix suggestions.",
    status: "deferred",
    reason:
      "Separate product surface with its own release cycle and maintenance burden. Prioritizing CI/CD integration first as it covers more workflows with less effort.",
  },
  {
    title: "Secrets detection",
    description:
      "Scan artifacts for hardcoded API keys, tokens, passwords, and other sensitive credentials.",
    status: "deferred",
    reason:
      "Separate scanning engine from vulnerability analysis. Tools like TruffleHog, Gitleaks, and Semgrep Secrets already handle this well. May integrate as an optional module in the future.",
  },
  {
    title: "GitLab native integration",
    description:
      "GitLab CI integration with merge request comments and security dashboard reporting.",
    status: "deferred",
    reason:
      "Prioritizing GitHub Action first due to larger market share. GitLab CI support planned after GitHub Action is stable.",
  },
  {
    title: "SBOM signature verification",
    description:
      "Cryptographic verification of SBOM provenance and integrity.",
    status: "deferred",
    reason:
      "No widely adopted standard exists yet. Watching the Sigstore/cosign ecosystem for maturity.",
  },
  {
    title: "Interactive terminal UI (TUI)",
    description:
      "A rich terminal interface for interactive scan monitoring and result browsing.",
    status: "deferred",
    reason:
      "Nice-to-have cosmetic improvement. Structured NDJSON progress format already integrates well with CI/CD pipelines.",
  },
  {
    title: "Multi-arch Docker builds (ARM64)",
    description:
      "Pre-built container images for ARM64 in addition to AMD64.",
    status: "deferred",
    reason:
      "Useful but not blocking core functionality. ARM64 builds planned for a future release.",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function RoadmapPage() {
  return (
    <PublicSiteShell>
      <main className="mx-auto max-w-5xl px-6 py-14 grid gap-10">
        {/* Header */}
        <section className="surface-card p-8 grid gap-4">
          <div className="inline-flex w-fit items-center rounded-full border border-black/10 dark:border-white/10 px-3 py-1 text-xs muted">
            Product Roadmap
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            ScanRook Roadmap
          </h1>
          <p className="text-sm muted max-w-3xl">
            A transparent view of what we have shipped, what we are actively
            building, what is planned next, and what we have intentionally
            deferred with reasoning. Updated as priorities change.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link href="/docs" className="btn-secondary">
              Docs
            </Link>
            <Link href="/blog" className="btn-secondary">
              Blog
            </Link>
            <a href="https://scanrook.sh" className="btn-secondary">
              Install CLI
            </a>
          </div>
        </section>

        {/* Status Legend */}
        <section className="surface-card p-6">
          <div className="text-xs uppercase tracking-wide muted mb-3">
            Status Legend
          </div>
          <div className="flex flex-wrap gap-3">
            <StatusBadge status="shipped" />
            <StatusBadge status="in-progress" />
            <StatusBadge status="planned" />
            <StatusBadge status="deferred" />
          </div>
        </section>

        {/* Shipped */}
        <RoadmapSection
          title="Shipped"
          blurb="Features that are live and available in the current release."
          items={shipped}
        />

        {/* In Progress */}
        <RoadmapSection
          title="In Progress"
          blurb="Actively being built. Expected in upcoming releases."
          items={inProgress}
        />

        {/* Planned */}
        <RoadmapSection
          title="Planned"
          blurb="Committed to the roadmap. Work has not started yet."
          items={planned}
        />

        {/* Deferred */}
        <RoadmapSection
          title="Considered / Deferred"
          blurb="Evaluated and intentionally deferred. Each item includes our reasoning."
          items={deferred}
        />
      </main>
    </PublicSiteShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function RoadmapSection({
  title,
  blurb,
  items,
}: {
  title: string;
  blurb: string;
  items: RoadmapItem[];
}) {
  return (
    <section className="grid gap-4">
      <div className="surface-card p-6 grid gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm muted">{blurb}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <RoadmapCard key={item.title} item={item} />
        ))}
      </div>
    </section>
  );
}

function RoadmapCard({ item }: { item: RoadmapItem }) {
  return (
    <div className="surface-card p-5 grid gap-3 content-start">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-snug">{item.title}</h3>
        <StatusBadge status={item.status} />
      </div>
      <p className="text-xs muted leading-relaxed">{item.description}</p>
      {item.reason && (
        <div className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.03] dark:bg-white/[.03] p-3">
          <div className="text-[10px] uppercase tracking-wide muted mb-1 font-semibold">
            Why deferred
          </div>
          <p className="text-xs muted leading-relaxed">{item.reason}</p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ItemStatus }) {
  const cfg =
    status === "shipped"
      ? {
          text: "Shipped",
          className:
            "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
          icon: <ShippedIcon />,
        }
      : status === "in-progress"
        ? {
            text: "In Progress",
            className:
              "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40",
            icon: <InProgressIcon />,
          }
        : status === "planned"
          ? {
              text: "Planned",
              className:
                "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/40",
              icon: <PlannedIcon />,
            }
          : {
              text: "Deferred",
              className:
                "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/40",
              icon: <DeferredIcon />,
            };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${cfg.className}`}
    >
      {cfg.icon}
      {cfg.text}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  SVG Icons                                                          */
/* ------------------------------------------------------------------ */

function ShippedIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path
        d="M2.2 6.3 4.8 8.9 9.8 3.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InProgressIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <circle
        cx="6"
        cy="6"
        r="3.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeDasharray="6 3"
      />
    </svg>
  );
}

function PlannedIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <circle
        cx="6"
        cy="6"
        r="3.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

function DeferredIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path
        d="M2.4 6h7.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
