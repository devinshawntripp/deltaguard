"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type ContributorActivity = {
  user_id: string;
  email: string;
  name: string | null;
  scan_count: number;
  last_scan_at: string;
  source: string;
};

type BillingStatus = {
  usage?: {
    planCode: string;
    planName: string;
    monthlyLimit: number | null;
    used: number;
    remaining: number | null;
  };
  billing?: {
    status: string | null;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    current_period_start: string | null;
    current_period_end: string | null;
  } | null;
  activeContributors?: number;
  contributors?: ContributorActivity[];
  planSeats?: number;
  features?: {
    stripeEnabled: boolean;
  };
  error?: string;
};

const PLAN_ORDER = ["FREE", "BASIC", "PRO", "ENTERPRISE"] as const;

const PLAN_DISPLAY: Record<
  string,
  { label: string; price: string; badge: string; features: string[] }
> = {
  FREE: {
    label: "Free",
    price: "$0",
    badge: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
    features: [
      "OSV enrichment",
      "Text output",
      "CLI only",
      "25 scans / month",
    ],
  },
  BASIC: {
    label: "Developer",
    price: "$15/dev/mo",
    badge:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    features: [
      "OSV + NVD, EPSS, KEV enrichment",
      "JSON + NDJSON output",
      "Free vulndb access",
      "SBOM workflows",
      "100 scans / month",
    ],
  },
  PRO: {
    label: "Team",
    price: "$40/dev/mo",
    badge:
      "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
    features: [
      "Everything in Developer, plus:",
      "OVAL + distro tracker enrichment",
      "Full vulndb access",
      "Web dashboard",
      "CI/CD gate integrations",
      "500 scans / month",
    ],
  },
  ENTERPRISE: {
    label: "Enterprise",
    price: "Custom",
    badge:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    features: [
      "Everything in Team, plus:",
      "SSO / SAML",
      "Self-hosted deployment",
      "Compliance reports",
      "Unlimited scans",
      "Dedicated support",
    ],
  },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  if (diffMs < 0) return "just now";
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

function sourceLabel(source: string): string {
  if (source === "ui+api") return "UI + API";
  if (source === "api") return "API";
  return "UI";
}

function nextTier(current: string): string | null {
  const idx = PLAN_ORDER.indexOf(current as (typeof PLAN_ORDER)[number]);
  if (idx < 0 || idx >= PLAN_ORDER.length - 1) return null;
  return PLAN_ORDER[idx + 1];
}

function tierLabel(code: string): string {
  if (code === "BASIC") return "DEVELOPER";
  if (code === "PRO") return "TEAM";
  return code;
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "canceled";
    text: string;
  } | null>(null);

  // Check URL params for success/canceled
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setBanner({
        type: "success",
        text: "Subscription activated! Your plan will update shortly.",
      });
    } else if (searchParams.get("canceled") === "true") {
      setBanner({
        type: "canceled",
        text: "Checkout was canceled. No changes were made.",
      });
    }
  }, [searchParams]);

  // Auto-dismiss banner after 8 seconds
  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 8000);
    return () => clearTimeout(t);
  }, [banner]);

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/billing/status", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setData(json);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpgrade(planCode: string) {
    setMsg(null);
    setActionLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_code: planCode }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      if (json?.url) window.location.href = json.url;
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleManage() {
    setMsg(null);
    setActionLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      if (json?.url) window.location.href = json.url;
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setActionLoading(false);
    }
  }

  const usage = data?.usage;
  const billing = data?.billing;
  const stripeEnabled = data?.features?.stripeEnabled === true;
  const currentPlan = usage?.planCode || "FREE";
  const planInfo = PLAN_DISPLAY[currentPlan] || PLAN_DISPLAY.FREE;
  const upgradeTo = nextTier(currentPlan);
  const overLimit =
    usage?.monthlyLimit != null && usage.used >= usage.monthlyLimit;
  const hasStripeCustomer = Boolean(billing?.stripe_customer_id);
  const usagePercent =
    usage?.monthlyLimit != null && usage.monthlyLimit > 0
      ? Math.min(100, Math.round((usage.used / usage.monthlyLimit) * 100))
      : null;

  return (
    <div className="grid gap-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Billing & Plan
        </h1>
        <p className="text-sm opacity-70 mt-1">
          Manage your subscription, view usage, and upgrade your plan.
        </p>
      </div>

      {/* Success / Canceled Banner */}
      {banner && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm flex items-center justify-between ${
            banner.type === "success"
              ? "border-emerald-400 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700"
              : "border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700"
          }`}
        >
          <span>{banner.text}</span>
          <button
            onClick={() => setBanner(null)}
            className="ml-4 opacity-60 hover:opacity-100 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="opacity-70">Loading billing...</div>
      ) : (
        <>
          {/* Current Plan Card */}
          <div className="rounded-xl border border-black/10 dark:border-white/10 p-6 grid gap-5">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="grid gap-1">
                <div className="text-xs uppercase tracking-wider opacity-60">
                  Current Plan
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">{planInfo.label}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${planInfo.badge}`}
                  >
                    {currentPlan === "FREE"
                      ? "Free"
                      : tierLabel(currentPlan)}
                  </span>
                </div>
                <div className="text-sm opacity-70">{planInfo.price}</div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                {upgradeTo && stripeEnabled && (
                  <button
                    onClick={() => handleUpgrade(tierLabel(upgradeTo))}
                    disabled={actionLoading}
                    className="rounded-lg bg-[var(--dg-accent,#2563eb)] text-white px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                  >
                    {actionLoading
                      ? "Redirecting..."
                      : `Upgrade to ${PLAN_DISPLAY[upgradeTo]?.label || upgradeTo}`}
                  </button>
                )}
                {upgradeTo && !stripeEnabled && (
                  <span className="rounded-lg border border-black/15 dark:border-white/15 px-4 py-2 text-sm opacity-50 cursor-not-allowed">
                    Upgrade (Stripe not configured)
                  </span>
                )}
                {hasStripeCustomer && stripeEnabled && (
                  <button
                    onClick={handleManage}
                    disabled={actionLoading}
                    className="rounded-lg border border-black/20 dark:border-white/20 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    Manage Subscription
                  </button>
                )}
              </div>
            </div>

            {/* Features list */}
            <div>
              <div className="text-xs uppercase tracking-wider opacity-60 mb-2">
                Included Features
              </div>
              <ul className="grid sm:grid-cols-2 gap-1.5 text-sm">
                {planInfo.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5 shrink-0">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3.5 8.5 6.5 11.5 12.5 5" />
                      </svg>
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Over limit warning */}
            {overLimit && (
              <div className="rounded-md border border-red-400 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 px-4 py-3 text-sm">
                Monthly scan limit exceeded. Upgrade your plan to queue
                additional scans.
              </div>
            )}
          </div>

          {/* Usage Card */}
          <div className="rounded-xl border border-black/10 dark:border-white/10 p-6 grid gap-4">
            <div className="text-xs uppercase tracking-wider opacity-60">
              Usage This Month
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <div className="text-3xl font-bold tabular-nums">
                  {usage?.used ?? 0}
                </div>
                <div className="text-sm opacity-70">Scans used</div>
              </div>
              <div>
                <div className="text-3xl font-bold tabular-nums">
                  {usage?.monthlyLimit == null
                    ? "Unlimited"
                    : usage.monthlyLimit}
                </div>
                <div className="text-sm opacity-70">Monthly limit</div>
              </div>
              <div>
                <div className="text-3xl font-bold tabular-nums">
                  {usage?.remaining == null ? "--" : usage.remaining}
                </div>
                <div className="text-sm opacity-70">Remaining</div>
              </div>
            </div>

            {/* Progress bar */}
            {usagePercent !== null && (
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="opacity-70">
                    {usagePercent}% of monthly quota
                  </span>
                  <span className="opacity-70">
                    {usage?.used} / {usage?.monthlyLimit}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      usagePercent >= 90
                        ? "bg-red-500"
                        : usagePercent >= 70
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Billing period */}
            {billing?.current_period_start && billing?.current_period_end && (
              <div className="text-xs opacity-60">
                Billing period:{" "}
                {new Date(billing.current_period_start).toLocaleDateString()}{" "}
                &ndash;{" "}
                {new Date(billing.current_period_end).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Active Contributors Card */}
          <div className="rounded-xl border border-black/10 dark:border-white/10 p-6 grid gap-4">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider opacity-60">
                Active Contributors (last 90 days)
              </div>
              <div className="text-sm opacity-70">
                {data?.activeContributors ?? 0} active contributor{(data?.activeContributors ?? 0) !== 1 ? "s" : ""}{" "}
                | {data?.planSeats ?? 1} seat{(data?.planSeats ?? 1) !== 1 ? "s" : ""} included
              </div>
            </div>

            <p className="text-xs opacity-50">
              You pay for seats, but we show active contributors so you know who is actually using the tool.
              A contributor is anyone who triggered at least one scan in the last 90 days.
            </p>

            {data?.contributors && data.contributors.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/10 dark:border-white/10 text-left">
                      <th className="pb-2 font-medium opacity-70">Email</th>
                      <th className="pb-2 font-medium opacity-70 text-right">Scans</th>
                      <th className="pb-2 font-medium opacity-70 text-right">Last Active</th>
                      <th className="pb-2 font-medium opacity-70 text-right">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.contributors.map((c) => (
                      <tr
                        key={c.user_id}
                        className="border-b border-black/5 dark:border-white/5 last:border-0"
                      >
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">{c.email}</span>
                            {c.name && (
                              <span className="text-xs opacity-50">({c.name})</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 text-right tabular-nums">{c.scan_count}</td>
                        <td className="py-2 text-right opacity-70">{timeAgo(c.last_scan_at)}</td>
                        <td className="py-2 text-right">
                          <span className="inline-flex items-center rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 text-xs">
                            {sourceLabel(c.source)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm opacity-50 py-2">
                No active contributors in the last 90 days.
              </div>
            )}

            {/* Seat usage summary */}
            {data?.planSeats != null && (
              <div className={`rounded-md px-4 py-3 text-sm ${
                (data?.activeContributors ?? 0) > (data.planSeats ?? 1)
                  ? "border border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300"
                  : "border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] opacity-80"
              }`}>
                {(data?.activeContributors ?? 0) > (data.planSeats ?? 1)
                  ? `You have ${data.activeContributors} active contributors but only ${data.planSeats} seat${data.planSeats === 1 ? "" : "s"} on your plan. Consider upgrading to avoid hitting the seat limit when adding new members.`
                  : `You're using ${data?.activeContributors ?? 0} of ${data.planSeats} seat${data.planSeats === 1 ? "" : "s"} (${data?.activeContributors ?? 0} active contributor${(data?.activeContributors ?? 0) !== 1 ? "s" : ""} in the last 90 days).`
                }
              </div>
            )}
          </div>

          {/* Plan Comparison */}
          <div className="rounded-xl border border-black/10 dark:border-white/10 p-6 grid gap-4">
            <div className="text-xs uppercase tracking-wider opacity-60">
              Compare Plans
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLAN_ORDER.map((tier) => {
                const info = PLAN_DISPLAY[tier];
                const isCurrent = tier === currentPlan;
                const tierIdx = PLAN_ORDER.indexOf(tier);
                const currentIdx = PLAN_ORDER.indexOf(
                  currentPlan as (typeof PLAN_ORDER)[number]
                );
                const isUpgrade = tierIdx > currentIdx;
                return (
                  <div
                    key={tier}
                    className={`rounded-lg border p-4 grid gap-3 content-start ${
                      isCurrent
                        ? "border-[var(--dg-accent,#2563eb)] ring-1 ring-[var(--dg-accent,#2563eb)]"
                        : "border-black/10 dark:border-white/10"
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{info.label}</div>
                      <div className="text-sm opacity-70">{info.price}</div>
                    </div>
                    <ul className="text-xs grid gap-1">
                      {info.features.map((f) => (
                        <li key={f} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 mt-0.5 shrink-0">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 16 16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3.5 8.5 6.5 11.5 12.5 5" />
                            </svg>
                          </span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    {isCurrent ? (
                      <span className="text-xs font-medium text-center opacity-60">
                        Current plan
                      </span>
                    ) : isUpgrade && stripeEnabled && tier !== "ENTERPRISE" ? (
                      <button
                        onClick={() => handleUpgrade(tierLabel(tier))}
                        disabled={actionLoading}
                        className="rounded-md bg-[var(--dg-accent,#2563eb)] text-white px-3 py-1.5 text-xs font-medium hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                      >
                        Upgrade
                      </button>
                    ) : isUpgrade && tier === "ENTERPRISE" ? (
                      <a
                        href="mailto:sales@scanrook.io"
                        className="rounded-md border border-black/20 dark:border-white/20 px-3 py-1.5 text-xs font-medium text-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        Contact Sales
                      </a>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error message */}
          {msg && (
            <div className="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg px-4 py-3">
              {msg}
            </div>
          )}
        </>
      )}
    </div>
  );
}
