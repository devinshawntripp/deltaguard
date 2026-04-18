"use client";

import React, { useState } from "react";

const REPORT_TYPES = [
  { value: "soc2", label: "SOC 2", description: "Executive summary, vulnerability inventory, scan coverage, and remediation tracking." },
  { value: "iso27001", label: "ISO 27001", description: "Asset inventory, risk assessment, and control effectiveness metrics." },
  { value: "fedramp", label: "FedRAMP", description: "POA&M format with NIST severity categorization and remediation deadlines." },
  { value: "inventory", label: "Inventory", description: "Complete package/component inventory with version tracking." },
] as const;

const DATE_PRESETS = [
  { value: "30", label: "Last 30 days" },
  { value: "60", label: "Last 60 days" },
  { value: "90", label: "Last 90 days" },
  { value: "custom", label: "Custom range" },
] as const;

const FORMATS = [
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
] as const;

export default function ComplianceReportsPage() {
  const [reportType, setReportType] = useState<string>("soc2");
  const [datePreset, setDatePreset] = useState<string>("90");
  const [format, setFormat] = useState<string>("csv");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      let dateRange: { from: string; to: string } | undefined;
      if (datePreset === "custom") {
        if (!customFrom || !customTo) {
          setError("Please select both start and end dates.");
          setGenerating(false);
          return;
        }
        dateRange = {
          from: new Date(customFrom).toISOString(),
          to: new Date(customTo + "T23:59:59").toISOString(),
        };
      } else {
        const days = parseInt(datePreset, 10);
        dateRange = {
          from: new Date(Date.now() - days * 86_400_000).toISOString(),
          to: new Date().toISOString(),
        };
      }

      const res = await fetch("/api/reports/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: reportType, format, date_range: dateRange }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }

      // Download the file
      const disposition = res.headers.get("Content-Disposition") || "";
      const filenameMatch = disposition.match(/filename="?(.+?)"?$/);
      const filename = filenameMatch?.[1] || `scanrook-${reportType}-report.${format}`;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  }

  const selectedType = REPORT_TYPES.find(t => t.value === reportType);

  return (
    <div className="grid gap-8 max-w-3xl">
      <div className="grid gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Compliance Reports</h1>
        <p className="muted text-sm">
          Generate audit-ready reports for SOC 2, ISO 27001, FedRAMP, or a full component inventory.
        </p>
      </div>

      {/* Report Type Selector */}
      <section className="card p-6 grid gap-4">
        <h2 className="text-lg font-medium">Report Type</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {REPORT_TYPES.map(rt => (
            <button
              key={rt.value}
              type="button"
              onClick={() => setReportType(rt.value)}
              className={`text-left p-4 rounded-lg border transition-colors ${
                reportType === rt.value
                  ? "border-[var(--dg-accent)] bg-[var(--dg-accent-soft)]"
                  : "border-[var(--dg-border)] hover:border-[var(--dg-accent)]"
              }`}
            >
              <div className="font-medium text-sm">{rt.label}</div>
              <div className="muted text-xs mt-1">{rt.description}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Date Range */}
      <section className="card p-6 grid gap-4">
        <h2 className="text-lg font-medium">Date Range</h2>
        <div className="flex flex-wrap gap-2">
          {DATE_PRESETS.map(dp => (
            <button
              key={dp.value}
              type="button"
              onClick={() => setDatePreset(dp.value)}
              className={`btn-secondary text-sm ${
                datePreset === dp.value ? "!border-[var(--dg-accent)] !bg-[var(--dg-accent-soft)]" : ""
              }`}
            >
              {dp.label}
            </button>
          ))}
        </div>
        {datePreset === "custom" && (
          <div className="flex gap-4 items-center">
            <label className="grid gap-1 text-sm">
              <span className="muted">From</span>
              <input
                type="date"
                value={customFrom}
                onChange={e => setCustomFrom(e.target.value)}
                className="input text-sm"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="muted">To</span>
              <input
                type="date"
                value={customTo}
                onChange={e => setCustomTo(e.target.value)}
                className="input text-sm"
              />
            </label>
          </div>
        )}
      </section>

      {/* Format Selector */}
      <section className="card p-6 grid gap-4">
        <h2 className="text-lg font-medium">Export Format</h2>
        <div className="flex gap-2">
          {FORMATS.map(f => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFormat(f.value)}
              className={`btn-secondary text-sm ${
                format === f.value ? "!border-[var(--dg-accent)] !bg-[var(--dg-accent-soft)]" : ""
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="muted text-xs">
          CSV is recommended for auditors. JSON provides structured data with full report sections.
        </p>
      </section>

      {/* Generate */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="btn-primary"
        >
          {generating ? "Generating..." : `Generate ${selectedType?.label} Report`}
        </button>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}
