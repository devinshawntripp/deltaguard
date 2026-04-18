export type LicenseRisk = "critical" | "high" | "medium" | "low" | "none" | "unknown";

export interface LicenseInfo {
  spdx_id: string;
  name: string;
  risk: LicenseRisk;
  copyleft: boolean;
  commercial_use: boolean;
  description: string;
}

const LICENSE_DB: Record<string, Omit<LicenseInfo, "spdx_id">> = {
  "AGPL-3.0-only": { name: "GNU AGPL v3", risk: "critical", copyleft: true, commercial_use: false, description: "Network copyleft — requires source disclosure for SaaS/network use" },
  "AGPL-3.0-or-later": { name: "GNU AGPL v3+", risk: "critical", copyleft: true, commercial_use: false, description: "Network copyleft — requires source disclosure for SaaS/network use" },
  "GPL-3.0-only": { name: "GNU GPL v3", risk: "high", copyleft: true, commercial_use: false, description: "Strong copyleft — derivative works must be GPL-licensed" },
  "GPL-3.0-or-later": { name: "GNU GPL v3+", risk: "high", copyleft: true, commercial_use: false, description: "Strong copyleft — derivative works must be GPL-licensed" },
  "GPL-2.0-only": { name: "GNU GPL v2", risk: "high", copyleft: true, commercial_use: false, description: "Strong copyleft — derivative works must be GPL-licensed" },
  "GPL-2.0-or-later": { name: "GNU GPL v2+", risk: "high", copyleft: true, commercial_use: false, description: "Strong copyleft — derivative works must be GPL-licensed" },
  "LGPL-3.0-only": { name: "GNU LGPL v3", risk: "medium", copyleft: true, commercial_use: true, description: "Weak copyleft — modifications to library must be shared, but linking is OK" },
  "LGPL-2.1-only": { name: "GNU LGPL v2.1", risk: "medium", copyleft: true, commercial_use: true, description: "Weak copyleft — modifications to library must be shared" },
  "MPL-2.0": { name: "Mozilla Public License 2.0", risk: "medium", copyleft: true, commercial_use: true, description: "File-level copyleft — modified files must be shared" },
  "EPL-2.0": { name: "Eclipse Public License 2.0", risk: "medium", copyleft: true, commercial_use: true, description: "Weak copyleft with patent grant" },
  "CDDL-1.0": { name: "Common Development and Distribution License", risk: "medium", copyleft: true, commercial_use: true, description: "File-level copyleft, GPL-incompatible" },
  "Apache-2.0": { name: "Apache License 2.0", risk: "low", copyleft: false, commercial_use: true, description: "Permissive with patent grant — attribution required" },
  "MIT": { name: "MIT License", risk: "none", copyleft: false, commercial_use: true, description: "Permissive — attribution only" },
  "BSD-2-Clause": { name: "BSD 2-Clause", risk: "none", copyleft: false, commercial_use: true, description: "Permissive — attribution only" },
  "BSD-3-Clause": { name: "BSD 3-Clause", risk: "none", copyleft: false, commercial_use: true, description: "Permissive — attribution, no endorsement" },
  "ISC": { name: "ISC License", risk: "none", copyleft: false, commercial_use: true, description: "Permissive — equivalent to MIT" },
  "Unlicense": { name: "The Unlicense", risk: "none", copyleft: false, commercial_use: true, description: "Public domain dedication" },
  "CC0-1.0": { name: "CC0 1.0", risk: "none", copyleft: false, commercial_use: true, description: "Public domain dedication" },
  "0BSD": { name: "Zero-Clause BSD", risk: "none", copyleft: false, commercial_use: true, description: "Public domain equivalent" },
  "SSPL-1.0": { name: "Server Side Public License", risk: "critical", copyleft: true, commercial_use: false, description: "Ultra-copyleft — all management layers must be open sourced (MongoDB)" },
  "BSL-1.1": { name: "Business Source License", risk: "high", copyleft: false, commercial_use: false, description: "Non-compete clause — cannot offer as competing service" },
  "Elastic-2.0": { name: "Elastic License 2.0", risk: "high", copyleft: false, commercial_use: false, description: "Non-compete — cannot provide as managed service" },
};

export function classifyLicense(spdxId: string): LicenseInfo {
  const normalized = spdxId.trim();
  const entry = LICENSE_DB[normalized];
  if (entry) return { spdx_id: normalized, ...entry };

  // Fuzzy matching for common variations
  const upper = normalized.toUpperCase();
  if (upper.includes("AGPL")) return { spdx_id: normalized, ...LICENSE_DB["AGPL-3.0-only"]!, name: normalized };
  if (upper.includes("LGPL")) return { spdx_id: normalized, ...LICENSE_DB["LGPL-3.0-only"]!, name: normalized };
  if (upper.includes("GPL")) return { spdx_id: normalized, ...LICENSE_DB["GPL-3.0-only"]!, name: normalized };
  if (upper.includes("MIT")) return { spdx_id: normalized, ...LICENSE_DB["MIT"]!, name: normalized };
  if (upper.includes("APACHE")) return { spdx_id: normalized, ...LICENSE_DB["Apache-2.0"]!, name: normalized };
  if (upper.includes("BSD")) return { spdx_id: normalized, ...LICENSE_DB["BSD-3-Clause"]!, name: normalized };
  if (upper.includes("MPL")) return { spdx_id: normalized, ...LICENSE_DB["MPL-2.0"]!, name: normalized };
  if (upper.includes("ISC")) return { spdx_id: normalized, ...LICENSE_DB["ISC"]!, name: normalized };

  return { spdx_id: normalized, name: normalized, risk: "unknown", copyleft: false, commercial_use: true, description: "License not recognized" };
}

export function scoreLicenseRisk(licenses: string[]): { score: number; risk: LicenseRisk; issues: LicenseInfo[] } {
  const classified = licenses.map(classifyLicense);
  const issues = classified.filter(l => l.risk === "critical" || l.risk === "high");
  const maxRisk = classified.reduce((max, l) => {
    const order: LicenseRisk[] = ["none", "unknown", "low", "medium", "high", "critical"];
    return order.indexOf(l.risk) > order.indexOf(max) ? l.risk : max;
  }, "none" as LicenseRisk);
  const score = classified.reduce((sum, l) => {
    const scores: Record<LicenseRisk, number> = { critical: 10, high: 7, medium: 4, low: 1, none: 0, unknown: 2 };
    return sum + scores[l.risk];
  }, 0);
  return { score, risk: maxRisk, issues };
}
