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
];

const inProgress: RoadmapItem[] = [
  {
    title: "License detection completion",
    description:
      "Extending license identification across all supported ecosystems. Currently partial coverage; full parity with package inventory detection is the target.",
    status: "in-progress",
  },
  {
    title: "SBOM policy gates (CI/CD integration)",
    description:
      "Configurable policy rules that can fail a CI pipeline based on severity thresholds, license blocklists, or component age. Integrates with the SBOM diff workflow.",
    status: "in-progress",
  },
  {
    title: "Multi-page documentation",
    description:
      "Expanding the single-page docs into structured multi-page documentation covering CLI reference, API guides, deployment, and integration recipes.",
    status: "in-progress",
  },
  {
    title: "Expanded benchmark matrix",
    description:
      "Broader benchmark coverage across more container images, distro versions, and artifact types. Automated comparison reports against common scanning tools.",
    status: "in-progress",
  },
];

const planned: RoadmapItem[] = [
  {
    title: "SUSE Security OVAL integration",
    description:
      "Native integration with SUSE Security OVAL feeds for SLES and openSUSE. Will provide distro-specific advisory filtering for SUSE-based container images.",
    status: "planned",
  },
  {
    title: "Oracle Linux Security OVAL integration",
    description:
      "Direct consumption of Oracle Linux OVAL data for accurate RPM advisory matching on Oracle Linux containers.",
    status: "planned",
  },
  {
    title: "Prometheus + Grafana monitoring dashboards",
    description:
      "Expose scanner and worker metrics via Prometheus endpoints. Pre-built Grafana dashboards for scan throughput, queue depth, enrichment latency, and error rates.",
    status: "planned",
  },
  {
    title: "Centralized logging (Loki)",
    description:
      "Aggregate logs from all three services (UI, Worker, Scanner) into Grafana Loki for unified search, alerting, and correlation.",
    status: "planned",
  },
  {
    title: "HorizontalPodAutoscaler",
    description:
      "Kubernetes HPA for the Go worker deployment, scaling worker replicas based on scan queue depth and CPU utilization.",
    status: "planned",
  },
];

const deferred: RoadmapItem[] = [
  {
    title: "SBOM signature verification",
    description:
      "Cryptographic verification of SBOM provenance and integrity.",
    status: "deferred",
    reason:
      "No widely adopted standard exists yet. We are watching the Sigstore/cosign ecosystem and will add support when the ecosystem matures.",
  },
  {
    title: "Interactive terminal UI (TUI)",
    description:
      "A rich terminal interface for interactive scan monitoring and result browsing.",
    status: "deferred",
    reason:
      "Nice-to-have cosmetic improvement. Our structured NDJSON progress format already integrates well with CI/CD pipelines.",
  },
  {
    title: "Multi-arch Docker builds",
    description:
      "Pre-built container images for ARM64 in addition to AMD64.",
    status: "deferred",
    reason:
      "Useful but not blocking core functionality. ARM64 builds planned for a future release.",
  },
  {
    title: "HashiCorp Vault integration",
    description:
      "Secrets management via HashiCorp Vault for API keys and database credentials.",
    status: "deferred",
    reason:
      "Kubernetes Secrets with etcd encryption-at-rest is sufficient for our self-hosted deployment model. Vault adds significant operational complexity.",
  },
  {
    title: "Distributed tracing (Jaeger/OpenTelemetry)",
    description:
      "End-to-end request tracing across the UI, Worker, and Scanner services.",
    status: "deferred",
    reason:
      "Deferred until basic monitoring (Prometheus/Grafana) is solid. Distributed tracing helps debug request flows across microservices -- useful for our 3-service architecture but not critical until we have baseline metrics.",
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
