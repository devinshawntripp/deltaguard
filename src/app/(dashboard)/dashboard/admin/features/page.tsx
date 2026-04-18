import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Feature Comparison | ${APP_NAME}`,
  description:
    "Admin-only competitive feature matrix comparing ScanRook against Snyk, Trivy/Aqua, and Grype/Anchore.",
};

/* ------------------------------------------------------------------ */
/*  Types & Data                                                       */
/* ------------------------------------------------------------------ */

type FeatureStatus =
  | "shipped"
  | "shipped-unique"
  | "in-progress"
  | "planned"
  | "deferred"
  | "out-of-scope";

interface Feature {
  name: string;
  scanrook: string;
  snyk: string;
  trivy: string;
  grype: string;
  status: FeatureStatus;
  reason?: string;
}

const features: Feature[] = [
  { name: "CLI vulnerability scanner", scanrook: "yes", snyk: "yes", trivy: "yes", grype: "yes", status: "shipped" },
  { name: "Pre-compiled vuln database", scanrook: "Free + Paid", snyk: "Proprietary", trivy: "Free", grype: "Free", status: "shipped" },
  { name: "EPSS exploit probability", scanrook: "Paid", snyk: "Paid", trivy: "no", grype: "no", status: "shipped" },
  { name: "CISA KEV flagging", scanrook: "Paid", snyk: "no", trivy: "no", grype: "no", status: "shipped" },
  { name: "Confidence tiers", scanrook: "yes", snyk: "no", trivy: "no", grype: "no", status: "shipped-unique" },
  { name: "SBOM import/diff/export", scanrook: "yes", snyk: "Partial", trivy: "Partial", grype: "Via Syft", status: "shipped" },
  { name: "Per-developer pricing", scanrook: "yes", snyk: "yes", trivy: "N/A", grype: "N/A", status: "shipped" },
  { name: "GitHub Action + PR comments", scanrook: "yes", snyk: "yes", trivy: "yes", grype: "yes", status: "shipped" },
  { name: "Docker registry scanning", scanrook: "yes", snyk: "yes", trivy: "yes", grype: "yes", status: "shipped" },
  { name: "Scheduled recurring scans", scanrook: "yes", snyk: "yes", trivy: "Via Aqua", grype: "Via Anchore", status: "shipped" },
  { name: "Slack/webhook notifications", scanrook: "yes", snyk: "yes", trivy: "Via Aqua", grype: "Via Anchore", status: "shipped" },
  { name: "Compliance reports (SOC2/ISO)", scanrook: "yes", snyk: "Paid", trivy: "Via Aqua", grype: "Anchore", status: "shipped" },
  { name: "Vulnerability trend dashboard", scanrook: "yes", snyk: "yes", trivy: "Via Aqua", grype: "Via Anchore", status: "shipped" },
  { name: "License risk scoring", scanrook: "yes", snyk: "yes", trivy: "Partial", grype: "Black Duck", status: "shipped" },
  { name: "SBOM policy gates (web UI)", scanrook: "yes", snyk: "yes", trivy: "no", grype: "Anchore", status: "shipped" },
  { name: "K8s cluster scanning (CLI)", scanrook: "yes", snyk: "no", trivy: "yes", grype: "no", status: "shipped" },
  { name: "K8s operator + admission webhook", scanrook: "yes", snyk: "no", trivy: "Trivy Operator", grype: "no", status: "shipped" },
  { name: "Org/team RBAC", scanrook: "yes", snyk: "yes", trivy: "N/A", grype: "yes", status: "shipped" },
  { name: "Real-time scan progress (SSE)", scanrook: "yes", snyk: "no", trivy: "no", grype: "no", status: "shipped-unique" },
  { name: "Binary scanning (ELF/PE/Mach-O)", scanrook: "yes", snyk: "no", trivy: "no", grype: "no", status: "shipped-unique" },
  { name: "DMG/ISO/ZIP scanning", scanrook: "yes", snyk: "no", trivy: "no", grype: "no", status: "shipped-unique" },
  { name: "Auto-fix PRs", scanrook: "no", snyk: "yes", trivy: "no", grype: "no", status: "deferred", reason: "Dependabot and Renovate already handle this well. Will explore integration rather than reimplementation." },
  { name: "Reachability analysis", scanrook: "no", snyk: "yes", trivy: "no", grype: "no", status: "deferred", reason: "Requires language-specific call graph resolution per ecosystem. Multi-month research project. Evaluating deps.dev integration." },
  { name: "IDE plugins (VS Code)", scanrook: "no", snyk: "yes", trivy: "no", grype: "no", status: "deferred", reason: "Separate product surface with its own release cycle. Prioritizing CI/CD integration first." },
  { name: "Secrets detection", scanrook: "no", snyk: "yes", trivy: "yes", grype: "no", status: "deferred", reason: "Tools like TruffleHog and Gitleaks handle this well. May integrate as an optional module." },
  { name: "IaC scanning (Terraform)", scanrook: "no", snyk: "yes", trivy: "yes", grype: "no", status: "out-of-scope" },
  { name: "Source code SAST", scanrook: "no", snyk: "yes", trivy: "no", grype: "no", status: "out-of-scope" },
  { name: "Runtime protection (CWPP)", scanrook: "no", snyk: "no", trivy: "Aqua", grype: "no", status: "out-of-scope" },
];

/* ------------------------------------------------------------------ */
/*  Derived counts                                                     */
/* ------------------------------------------------------------------ */

const totalFeatures = features.length;
const shippedCount = features.filter((f) => f.status === "shipped" || f.status === "shipped-unique").length;
const inProgressCount = features.filter((f) => f.status === "in-progress").length;
const gapCount = features.filter((f) => f.status === "deferred" || f.status === "out-of-scope").length;
const uniqueFeatures = features.filter((f) => f.status === "shipped-unique");
const deferredFeatures = features.filter((f) => f.status === "deferred");
const outOfScopeFeatures = features.filter((f) => f.status === "out-of-scope");

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function FeaturesComparisonPage() {
  return (
    <div className="grid gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Competitive Feature Matrix
        </h1>
        <p className="text-sm opacity-70 mt-1">
          Admin-only comparison of ScanRook vs Snyk, Trivy/Aqua, and
          Grype/Anchore. Static reference data.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="Total Features" value={totalFeatures} />
        <SummaryCard label="Shipped" value={shippedCount} accent="emerald" />
        <SummaryCard label="In Progress" value={inProgressCount} accent="amber" />
        <SummaryCard
          label="Gaps (Deferred + OOS)"
          value={gapCount}
          accent="slate"
        />
      </div>

      {/* Main comparison table */}
      <div className="rounded-xl border border-black/10 dark:border-white/10 overflow-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-black/[.04] dark:bg-white/[.04] text-left">
            <tr>
              <th className="p-3 font-semibold">Feature</th>
              <th className="p-3 font-bold text-emerald-700 dark:text-emerald-300">
                ScanRook
              </th>
              <th className="p-3 font-semibold">Snyk</th>
              <th className="p-3 font-semibold">Trivy / Aqua</th>
              <th className="p-3 font-semibold">Grype / Anchore</th>
              <th className="p-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {features.map((f) => (
              <tr
                key={f.name}
                className="border-t border-black/5 dark:border-white/5 hover:bg-black/[.02] dark:hover:bg-white/[.02] transition-colors"
              >
                <td className="p-3 font-medium">{f.name}</td>
                <td className="p-3 font-semibold">
                  <CellValue value={f.scanrook} highlight />
                </td>
                <td className="p-3">
                  <CellValue value={f.snyk} />
                </td>
                <td className="p-3">
                  <CellValue value={f.trivy} />
                </td>
                <td className="p-3">
                  <CellValue value={f.grype} />
                </td>
                <td className="p-3">
                  <StatusBadge status={f.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Unique to ScanRook */}
      <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 grid gap-3">
        <h2 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
          Unique to ScanRook
        </h2>
        <p className="text-xs opacity-70">
          Features no competitor currently offers.
        </p>
        <ul className="grid gap-2">
          {uniqueFeatures.map((f) => (
            <li
              key={f.name}
              className="flex items-center gap-2 text-sm"
            >
              <CheckIcon className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-medium">{f.name}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Competitive gaps */}
      <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 grid gap-4">
        <h2 className="text-lg font-semibold text-amber-700 dark:text-amber-300">
          Competitive Gaps (Deferred)
        </h2>
        <p className="text-xs opacity-70">
          Features competitors have that we intentionally do not, with reasoning.
        </p>
        <div className="grid gap-3">
          {deferredFeatures.map((f) => (
            <div
              key={f.name}
              className="rounded-lg border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[.03] p-3 grid gap-1"
            >
              <div className="flex items-center gap-2">
                <DashIcon className="text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-sm font-medium">{f.name}</span>
              </div>
              {f.reason && (
                <p className="text-xs opacity-70 pl-5">{f.reason}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Out of scope */}
      <section className="rounded-xl border border-black/10 dark:border-white/10 bg-black/[.02] dark:bg-white/[.02] p-5 grid gap-3">
        <h2 className="text-lg font-semibold opacity-70">Out of Scope</h2>
        <p className="text-xs opacity-70">
          Capabilities we intentionally do not pursue. ScanRook focuses on
          vulnerability scanning and SBOM management, not SAST, IaC, or runtime
          protection.
        </p>
        <ul className="grid gap-2">
          {outOfScopeFeatures.map((f) => (
            <li
              key={f.name}
              className="flex items-center gap-2 text-sm opacity-60"
            >
              <DashIcon className="shrink-0" />
              <span>{f.name}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "emerald" | "amber" | "blue" | "slate";
}) {
  const colorClass =
    accent === "emerald"
      ? "text-emerald-700 dark:text-emerald-300"
      : accent === "amber"
        ? "text-amber-700 dark:text-amber-300"
        : accent === "blue"
          ? "text-blue-700 dark:text-blue-300"
          : accent === "slate"
            ? "text-slate-600 dark:text-slate-400"
            : "";

  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 p-3">
      <div className="text-xs opacity-70">{label}</div>
      <div className={`text-2xl font-semibold ${colorClass}`}>{value}</div>
    </div>
  );
}

function CellValue({
  value,
  highlight,
}: {
  value: string;
  highlight?: boolean;
}) {
  if (value === "yes") {
    return (
      <span
        className={
          highlight
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-emerald-600 dark:text-emerald-400"
        }
      >
        <CheckIcon />
      </span>
    );
  }
  if (value === "no") {
    return (
      <span className="text-red-400 dark:text-red-500">
        <CrossIcon />
      </span>
    );
  }
  // Partial / qualifier text
  return (
    <span
      className={`text-xs ${highlight ? "font-semibold text-emerald-700 dark:text-emerald-300" : "opacity-80"}`}
    >
      {value}
    </span>
  );
}

function StatusBadge({ status }: { status: FeatureStatus }) {
  const cfg: Record<
    FeatureStatus,
    { text: string; className: string }
  > = {
    shipped: {
      text: "Shipped",
      className:
        "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
    },
    "shipped-unique": {
      text: "Shipped \u2014 Unique",
      className:
        "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
    },
    "in-progress": {
      text: "In Progress",
      className:
        "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40",
    },
    planned: {
      text: "Planned",
      className:
        "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/40",
    },
    deferred: {
      text: "Deferred",
      className:
        "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/40",
    },
    "out-of-scope": {
      text: "Out of Scope",
      className:
        "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
    },
  };

  const c = cfg[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${c.className}`}
    >
      {c.text}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  SVG Icons (matching roadmap page style)                            */
/* ------------------------------------------------------------------ */

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden="true"
      className={`inline-block ${className || ""}`}
    >
      <path
        d="M2.5 7.3 5.5 10.3 11.5 4.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden="true"
      className={`inline-block ${className || ""}`}
    >
      <path
        d="M3.5 3.5 10.5 10.5M10.5 3.5 3.5 10.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DashIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden="true"
      className={`inline-block ${className || ""}`}
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
