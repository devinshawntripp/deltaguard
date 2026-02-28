"use client";

import { useEffect, useState } from "react";

type ScannerSettings = {
  mode_default: "light" | "deep";
  light_allow_heuristic_fallback: boolean;
  deep_require_installed_inventory: boolean;
  nvd_enrich_enabled: boolean;
  osv_enrich_enabled: boolean;
  redhat_enrich_enabled: boolean;
  epss_enrich_enabled: boolean;
  kev_enrich_enabled: boolean;
  debian_tracker_enabled: boolean;
  ubuntu_tracker_enabled: boolean;
  alpine_secdb_enabled: boolean;
  redhat_unfixed_enabled: boolean;
  skip_cache: boolean;
  nvd_api_key: string;
  nvd_concurrency: number;
  nvd_retry_max: number;
  nvd_timeout_secs: number;
  global_nvd_rate_per_minute: number;
  osv_batch_size: number;
  osv_timeout_secs: number;
  redhat_cve_concurrency: number;
};

const defaults: ScannerSettings = {
  mode_default: "light",
  light_allow_heuristic_fallback: true,
  deep_require_installed_inventory: true,
  nvd_enrich_enabled: true,
  osv_enrich_enabled: true,
  redhat_enrich_enabled: true,
  epss_enrich_enabled: true,
  kev_enrich_enabled: true,
  debian_tracker_enabled: true,
  ubuntu_tracker_enabled: true,
  alpine_secdb_enabled: true,
  redhat_unfixed_enabled: true,
  skip_cache: false,
  nvd_api_key: "",
  nvd_concurrency: 3,
  nvd_retry_max: 5,
  nvd_timeout_secs: 20,
  global_nvd_rate_per_minute: 40,
  osv_batch_size: 50,
  osv_timeout_secs: 60,
  redhat_cve_concurrency: 4,
};

export default function ScannerSettingsPage() {
  const [settings, setSettings] = useState<ScannerSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [apiKeyDisplay, setApiKeyDisplay] = useState("");

  useEffect(() => {
    fetch("/api/settings/scanner", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        const merged = { ...defaults, ...j };
        setSettings(merged);
        setApiKeyDisplay(merged.nvd_api_key ? "********" : "");
      })
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
      setApiKeyDisplay(json.nvd_api_key ? "********" : "");
      setMsg("Saved scanner settings");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2";

  return (
    <div className="grid gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Scanner Policy</h1>
        <p className="text-sm opacity-70 mt-1">Organization defaults for scanning, enrichment, and tuning.</p>
      </div>

      {loading ? (
        <div className="opacity-70">Loading settings...</div>
      ) : (
        <div className="grid gap-5">
          {/* Scan Mode */}
          <Section title="Scan Mode">
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
          </Section>

          {/* Enrichment Sources */}
          <Section title="Enrichment Sources">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <Toggle
                label="OSV advisory lookup"
                checked={settings.osv_enrich_enabled}
                onChange={(v) => setSettings((s) => ({ ...s, osv_enrich_enabled: v }))}
              />
              <Toggle
                label="NVD CVSS enrichment"
                checked={settings.nvd_enrich_enabled}
                onChange={(v) => setSettings((s) => ({ ...s, nvd_enrich_enabled: v }))}
              />
              <Toggle
                label="Red Hat OVAL evaluation"
                checked={settings.redhat_enrich_enabled}
                onChange={(v) => setSettings((s) => ({ ...s, redhat_enrich_enabled: v }))}
              />
              <Toggle
                label="EPSS exploit probability"
                checked={settings.epss_enrich_enabled}
                onChange={(v) => setSettings((s) => ({ ...s, epss_enrich_enabled: v }))}
              />
              <Toggle
                label="CISA KEV flagging"
                checked={settings.kev_enrich_enabled}
                onChange={(v) => setSettings((s) => ({ ...s, kev_enrich_enabled: v }))}
              />
              <Toggle
                label="Debian Security Tracker"
                checked={settings.debian_tracker_enabled}
                onChange={(v) => setSettings((s) => ({ ...s, debian_tracker_enabled: v }))}
              />
              <Toggle
                label="Ubuntu CVE Tracker"
                checked={settings.ubuntu_tracker_enabled}
                onChange={(v) => setSettings((s) => ({ ...s, ubuntu_tracker_enabled: v }))}
              />
              <Toggle
                label="Alpine SecDB"
                checked={settings.alpine_secdb_enabled}
                onChange={(v) => setSettings((s) => ({ ...s, alpine_secdb_enabled: v }))}
              />
              <Toggle
                label="Show unfixed CVEs (Red Hat will-not-fix / fix-deferred)"
                checked={settings.redhat_unfixed_enabled}
                onChange={(v) => setSettings((s) => ({ ...s, redhat_unfixed_enabled: v }))}
              />
              <Toggle
                label="Skip cache"
                checked={settings.skip_cache}
                onChange={(v) => setSettings((s) => ({ ...s, skip_cache: v }))}
              />
            </div>
            {settings.skip_cache && (
              <div className="rounded-md border border-amber-400 bg-amber-100 text-amber-900 px-3 py-2 text-sm mt-2">
                Warning: Skip cache dramatically increases scan runtime and external API pressure.
              </div>
            )}
          </Section>

          {/* API Keys */}
          <Section title="API Keys">
            <label className="grid gap-1 text-sm max-w-md">
              <span>NVD API Key</span>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Enter NVD API key"
                  value={apiKeyDisplay}
                  onChange={(e) => {
                    setApiKeyDisplay(e.target.value);
                    setSettings((s) => ({ ...s, nvd_api_key: e.target.value }));
                  }}
                  className={`${inputCls} flex-1`}
                />
                {settings.nvd_api_key && (
                  <button
                    type="button"
                    onClick={() => {
                      setSettings((s) => ({ ...s, nvd_api_key: "" }));
                      setApiKeyDisplay("");
                    }}
                    className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    Clear
                  </button>
                )}
              </div>
              <span className="text-xs opacity-60">
                Get a free key at nist.gov/developers. Increases NVD rate limits from 5/30s to 50/30s.
              </span>
            </label>
          </Section>

          {/* NVD Tuning */}
          <Section title="NVD Tuning">
            <div className="grid sm:grid-cols-2 gap-3">
              <NumericInput
                label="NVD concurrency"
                min={1} max={20}
                value={settings.nvd_concurrency}
                onChange={(v) => setSettings((s) => ({ ...s, nvd_concurrency: v }))}
              />
              <NumericInput
                label="NVD retry max"
                min={1} max={12}
                value={settings.nvd_retry_max}
                onChange={(v) => setSettings((s) => ({ ...s, nvd_retry_max: v }))}
              />
              <NumericInput
                label="NVD timeout seconds"
                min={5} max={120}
                value={settings.nvd_timeout_secs}
                onChange={(v) => setSettings((s) => ({ ...s, nvd_timeout_secs: v }))}
              />
              <NumericInput
                label="Global NVD rate per minute"
                min={1} max={240}
                value={settings.global_nvd_rate_per_minute}
                onChange={(v) => setSettings((s) => ({ ...s, global_nvd_rate_per_minute: v }))}
              />
            </div>
          </Section>

          {/* Advanced (collapsible) */}
          <div className="rounded-xl border border-black/10 dark:border-white/10">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <div>
                <div className="text-sm font-medium">Advanced</div>
                <div className="text-xs opacity-60">OSV tuning, Red Hat concurrency, scan behavior</div>
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`}
              >
                <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {showAdvanced && (
              <div className="px-5 pb-5 grid gap-4 border-t border-black/10 dark:border-white/10 pt-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <NumericInput
                    label="OSV batch size"
                    min={10} max={200}
                    value={settings.osv_batch_size}
                    onChange={(v) => setSettings((s) => ({ ...s, osv_batch_size: v }))}
                  />
                  <NumericInput
                    label="OSV timeout seconds"
                    min={10} max={120}
                    value={settings.osv_timeout_secs}
                    onChange={(v) => setSettings((s) => ({ ...s, osv_timeout_secs: v }))}
                  />
                  <NumericInput
                    label="Red Hat CVE concurrency"
                    min={1} max={8}
                    value={settings.redhat_cve_concurrency}
                    onChange={(v) => setSettings((s) => ({ ...s, redhat_cve_concurrency: v }))}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <Toggle
                    label="Light allows heuristic fallback"
                    checked={settings.light_allow_heuristic_fallback}
                    onChange={(v) => setSettings((s) => ({ ...s, light_allow_heuristic_fallback: v }))}
                  />
                  <Toggle
                    label="Deep requires installed inventory"
                    checked={settings.deep_require_installed_inventory}
                    onChange={(v) => setSettings((s) => ({ ...s, deep_require_installed_inventory: v }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Save */}
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 p-5 grid gap-3">
      <div className="text-sm font-medium">{title}</div>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function NumericInput({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value || min))}
        className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2"
      />
    </label>
  );
}
