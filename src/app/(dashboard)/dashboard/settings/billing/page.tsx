"use client";

import { useEffect, useState } from "react";

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
  features?: {
    stripeEnabled: boolean;
  };
  error?: string;
};

export default function BillingPage() {
  const [data, setData] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

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

  async function openCheckout(planCode: "BASIC" | "PRO" | "ENTERPRISE") {
    if (data?.features?.stripeEnabled !== true) {
      setMsg("Feature coming soon");
      return;
    }
    setMsg(null);
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
    }
  }

  async function openPortal() {
    if (data?.features?.stripeEnabled !== true) {
      setMsg("Feature coming soon");
      return;
    }
    setMsg(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      if (json?.url) window.location.href = json.url;
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : String(e));
    }
  }

  const usage = data?.usage;
  const stripeEnabled = data?.features?.stripeEnabled === true;
  const comingSoonTooltip = "Feature coming soon";
  const overLimit = usage?.monthlyLimit != null && usage.used >= usage.monthlyLimit;

  return (
    <div className="grid gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing & Plan</h1>
        <p className="text-sm opacity-70 mt-1">Monthly scan quota enforcement and Stripe plan management.</p>
      </div>

      {loading ? (
        <div className="opacity-70">Loading billing...</div>
      ) : (
        <div className="rounded-xl border border-black/10 dark:border-white/10 p-5 grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="opacity-70">Plan</div>
              <div className="text-lg font-semibold">{usage?.planName || "Unknown"} ({usage?.planCode || "-"})</div>
            </div>
            <div>
              <div className="opacity-70">Usage this month</div>
              <div className="text-lg font-semibold">
                {usage ? `${usage.used}${usage.monthlyLimit == null ? "" : ` / ${usage.monthlyLimit}`}` : "-"}
              </div>
            </div>
          </div>

          {overLimit && (
            <div className="rounded-md border border-red-400 bg-red-100 text-red-900 px-3 py-2 text-sm">
              Monthly scan limit exceeded. Upgrade your plan to queue additional scans.
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => openCheckout("BASIC")}
              disabled={!stripeEnabled}
              title={!stripeEnabled ? comingSoonTooltip : undefined}
              className="rounded-md border border-black/20 dark:border-white/20 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Upgrade to Basic
            </button>
            <button
              onClick={() => openCheckout("PRO")}
              disabled={!stripeEnabled}
              title={!stripeEnabled ? comingSoonTooltip : undefined}
              className="rounded-md border border-black/20 dark:border-white/20 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Upgrade to Pro
            </button>
            <button
              onClick={() => openCheckout("ENTERPRISE")}
              disabled={!stripeEnabled}
              title={!stripeEnabled ? comingSoonTooltip : undefined}
              className="rounded-md border border-black/20 dark:border-white/20 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Contact Enterprise
            </button>
            <button
              onClick={openPortal}
              disabled={!stripeEnabled}
              title={!stripeEnabled ? comingSoonTooltip : undefined}
              className="rounded-md bg-black text-white px-3 py-2 text-sm font-medium hover:bg-black/90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Manage billing
            </button>
          </div>

          {msg && <div className="text-sm text-red-700 bg-red-100 rounded px-3 py-2">{msg}</div>}
        </div>
      )}
    </div>
  );
}
