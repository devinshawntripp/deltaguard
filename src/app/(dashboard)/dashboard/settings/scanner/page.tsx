"use client";

import { useEffect, useState } from "react";

type ScannerSettings = {
  mode_default: "light" | "deep";
  light_allow_heuristic_fallback: boolean;
  deep_require_installed_inventory: boolean;
  nvd_enrich_enabled: boolean;
  osv_enrich_enabled: boolean;
  redhat_enrich_enabled: boolean;
  skip_cache: boolean;
  nvd_concurrency: number;
  nvd_retry_max: number;
  nvd_timeout_secs: number;
  global_nvd_rate_per_minute: number;
};

const defaults: ScannerSettings = {
  mode_default: "light",
  light_allow_heuristic_fallback: true,
  deep_require_installed_inventory: true,
  nvd_enrich_enabled: true,
  osv_enrich_enabled: true,
  redhat_enrich_enabled: true,
  skip_cache: false,
  nvd_concurrency: 3,
  nvd_retry_max: 5,
  nvd_timeout_secs: 20,
  global_nvd_rate_per_minute: 40,
};

export default function ScannerSettingsPage() {
  const [settings, setSettings] = useState<ScannerSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings/scanner", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setSettings({ ...defaults, ...j }))
      .catch(() => setMsg("Failed to load scanner settings"))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/settings/scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setSettings({ ...defaults, ...json });
      setMsg("Saved scanner settings");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Scanner Policy</h1>
        <p className="text-sm opacity-70 mt-1">Organization defaults for light/deep scanning and enrichment behavior.</p>
      </div>

      {loading ? (
        <div className="opacity-70">Loading settings...</div>
      ) : (
        <div className="rounded-xl border border-black/10 dark:border-white/10 p-5 grid gap-5">
          <div className="grid gap-2">
            <div className="text-sm font-medium">Mode Preset</div>
            <div className="flex items-center gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  checked={settings.mode_default === "light"}
                  onChange={() => setSettings((s) => ({ ...s, mode_default: "light" }))}
                />
                Light (heuristic allowed)
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  checked={settings.mode_default === "deep"}
                  onChange={() => setSettings((s) => ({ ...s, mode_default: "deep" }))}
                />
                Deep (strict installed inventory)
              </label>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.light_allow_heuristic_fallback}
                onChange={(e) => setSettings((s) => ({ ...s, light_allow_heuristic_fallback: e.target.checked }))}
              />
              Light allows heuristic fallback
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.deep_require_installed_inventory}
                onChange={(e) => setSettings((s) => ({ ...s, deep_require_installed_inventory: e.target.checked }))}
              />
              Deep requires installed inventory
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.nvd_enrich_enabled}
                onChange={(e) => setSettings((s) => ({ ...s, nvd_enrich_enabled: e.target.checked }))}
              />
              NVD enrichment enabled
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.osv_enrich_enabled}
                onChange={(e) => setSettings((s) => ({ ...s, osv_enrich_enabled: e.target.checked }))}
              />
              OSV enrichment enabled
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.redhat_enrich_enabled}
                onChange={(e) => setSettings((s) => ({ ...s, redhat_enrich_enabled: e.target.checked }))}
              />
              Red Hat enrichment enabled
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.skip_cache}
                onChange={(e) => setSettings((s) => ({ ...s, skip_cache: e.target.checked }))}
              />
              Skip cache
            </label>
          </div>

          {settings.skip_cache && (
            <div className="rounded-md border border-amber-400 bg-amber-100 text-amber-900 px-3 py-2 text-sm">
              Warning: Skip cache dramatically increases scan runtime and external API pressure.
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm">
              <span>NVD concurrency</span>
              <input
                type="number"
                min={1}
                max={20}
                value={settings.nvd_concurrency}
                onChange={(e) => setSettings((s) => ({ ...s, nvd_concurrency: Number(e.target.value || 1) }))}
                className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span>NVD retry max</span>
              <input
                type="number"
                min={1}
                max={12}
                value={settings.nvd_retry_max}
                onChange={(e) => setSettings((s) => ({ ...s, nvd_retry_max: Number(e.target.value || 1) }))}
                className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span>NVD timeout seconds</span>
              <input
                type="number"
                min={5}
                max={120}
                value={settings.nvd_timeout_secs}
                onChange={(e) => setSettings((s) => ({ ...s, nvd_timeout_secs: Number(e.target.value || 5) }))}
                className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span>Global NVD rate per minute</span>
              <input
                type="number"
                min={1}
                max={240}
                value={settings.global_nvd_rate_per_minute}
                onChange={(e) => setSettings((s) => ({ ...s, global_nvd_rate_per_minute: Number(e.target.value || 1) }))}
                className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2"
              />
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-md bg-black text-white px-4 py-2 text-sm font-medium hover:bg-black/90 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save settings"}
            </button>
            {msg && <div className="text-sm opacity-80">{msg}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
