"use client";

import { useState } from "react";

const CPE_FIELDS = [
  { name: "Part", hint: "a = application, o = operating system, h = hardware" },
  { name: "Vendor", hint: "The organization or person that created the product" },
  { name: "Product", hint: "The product name" },
  { name: "Version", hint: "The version string (e.g. 3.0.7)" },
  { name: "Update", hint: "An update or patch level (e.g. sp1, * = any)" },
  { name: "Edition", hint: "Legacy edition field from CPE 2.2" },
  { name: "Language", hint: "The language of the product (e.g. en, * = any)" },
  { name: "SW Edition", hint: "Software edition or market-specific variant" },
  { name: "Target SW", hint: "Target software environment (e.g. linux, windows)" },
  { name: "Target HW", hint: "Target hardware architecture (e.g. x86, arm)" },
  { name: "Other", hint: "Additional vendor-defined attributes" },
];

function parseCpe(input: string): string[] | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith("cpe:2.3:")) return null;
  // CPE 2.3 format: cpe:2.3:<part>:<vendor>:<product>:<version>:<update>:<edition>:<language>:<sw_edition>:<target_sw>:<target_hw>:<other>
  // Split on ":" but be careful of escaped colons (\\:)
  const parts = trimmed.split(":");
  // Expected minimum length: cpe(0) 2.3(1) part(2) vendor(3) product(4) version(5) update(6) edition(7) language(8) sw_edition(9) target_sw(10) target_hw(11) other(12)
  if (parts.length < 13) return null;
  return parts.slice(2, 13); // 11 fields starting from index 2
}

function PartBadge({ value }: { value: string }) {
  const labels: Record<string, string> = {
    a: "application",
    o: "operating system",
    h: "hardware",
  };
  const label = labels[value];
  if (!label) return null;
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] px-2 py-0.5 text-[11px] font-mono ml-2">
      = {label}
    </span>
  );
}

export default function CpeParserWidget() {
  const [input, setInput] = useState(
    "cpe:2.3:a:openssl:openssl:3.0.7:*:*:*:*:*:*:*"
  );

  const fields = parseCpe(input);
  const isValid = fields !== null;

  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-black/[.02] dark:bg-white/[.02] p-5 grid gap-4">
      <div className="grid gap-1.5">
        <label
          htmlFor="cpe-input"
          className="text-sm font-semibold"
          style={{ color: "var(--dg-text)" }}
        >
          Paste a CPE 2.3 string
        </label>
        <textarea
          id="cpe-input"
          className="w-full font-mono text-xs rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--dg-accent,#6366f1)]"
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder="cpe:2.3:a:vendor:product:version:*:*:*:*:*:*:*"
        />
        {!isValid && input.trim().length > 0 && (
          <p className="text-xs text-red-500">
            Not a valid CPE 2.3 string. Must start with <code>cpe:2.3:</code> and
            contain all 13 fields.
          </p>
        )}
      </div>

      {isValid && (
        <dl className="grid gap-2">
          {CPE_FIELDS.map((field, i) => {
            const value = fields[i] ?? "*";
            const isEmpty = value === "*" || value === "-";
            return (
              <div
                key={field.name}
                className="grid grid-cols-[120px_minmax(0,1fr)] gap-2 items-baseline text-sm"
              >
                <dt className="font-semibold text-xs shrink-0" style={{ color: "var(--dg-text)" }}>
                  {field.name}
                  {i === 0 && <PartBadge value={value} />}
                </dt>
                <dd className="min-w-0">
                  <code
                    className={`text-xs rounded px-1.5 py-0.5 border ${
                      isEmpty
                        ? "border-black/5 dark:border-white/5 bg-black/[.02] dark:bg-white/[.02] muted"
                        : "border-[color-mix(in_srgb,var(--dg-accent)_40%,transparent)] bg-[var(--dg-accent-soft)] font-semibold"
                    }`}
                    style={!isEmpty ? { color: "var(--dg-accent-ink)" } : undefined}
                  >
                    {value}
                  </code>
                  <span className="text-[11px] muted ml-2">{field.hint}</span>
                </dd>
              </div>
            );
          })}
        </dl>
      )}

      {!input.trim() && (
        <p className="text-xs muted">Enter a CPE string above to see it parsed into its 11 component fields.</p>
      )}
    </div>
  );
}
