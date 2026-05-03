"use client";

import { useState } from "react";

/* ── sample SBOMs ── */
const SAMPLE_CYCLONEDX = JSON.stringify(
  {
    bomFormat: "CycloneDX",
    specVersion: "1.5",
    serialNumber: "urn:uuid:3e671687-395b-41f5-a30f-a58921a69b79",
    version: 1,
    metadata: {
      timestamp: "2026-01-15T10:30:00Z",
      component: {
        type: "application",
        name: "my-web-app",
        version: "2.4.1",
      },
    },
    components: [
      {
        type: "library",
        name: "lodash",
        version: "4.17.21",
        purl: "pkg:npm/lodash@4.17.21",
        licenses: [{ license: { id: "MIT" } }],
        hashes: [{ alg: "SHA-256", content: "a6e1bce0347e6c..." }],
      },
      {
        type: "library",
        name: "express",
        version: "4.18.2",
        purl: "pkg:npm/express@4.18.2",
        licenses: [{ license: { id: "MIT" } }],
      },
      {
        type: "library",
        name: "react",
        version: "18.2.0",
        purl: "pkg:npm/react@18.2.0",
        licenses: [{ license: { id: "MIT" } }],
      },
      {
        type: "library",
        name: "pg",
        version: "8.11.3",
        purl: "pkg:npm/pg@8.11.3",
        licenses: [{ license: { id: "MIT" } }],
      },
      {
        type: "library",
        name: "jsonwebtoken",
        version: "9.0.0",
        purl: "pkg:npm/jsonwebtoken@9.0.0",
        licenses: [{ license: { id: "MIT" } }],
      },
      {
        type: "library",
        name: "winston",
        version: "3.11.0",
        purl: "pkg:npm/winston@3.11.0",
        licenses: [{ license: { id: "MIT" } }],
      },
      {
        type: "library",
        name: "zod",
        version: "3.22.4",
        purl: "pkg:npm/zod@3.22.4",
        licenses: [{ license: { id: "MIT" } }],
      },
      {
        type: "library",
        name: "bcrypt",
        version: "5.1.1",
        purl: "pkg:npm/bcrypt@5.1.1",
        licenses: [{ license: { id: "MIT" } }],
      },
      {
        type: "library",
        name: "redis",
        version: "4.6.12",
        purl: "pkg:npm/redis@4.6.12",
        licenses: [{ license: { id: "MIT" } }],
      },
      {
        type: "library",
        name: "helmet",
        version: "7.1.0",
        purl: "pkg:npm/helmet@7.1.0",
        licenses: [{ license: { id: "MIT" } }],
      },
      {
        type: "library",
        name: "axios",
        version: "1.6.2",
        purl: "pkg:npm/axios@1.6.2",
        licenses: [{ license: { id: "MIT" } }],
      },
      {
        type: "library",
        name: "chalk",
        version: "5.3.0",
        purl: "pkg:npm/chalk@5.3.0",
        licenses: [{ license: { id: "MIT" } }],
      },
      {
        type: "framework",
        name: "next",
        version: "14.1.0",
        purl: "pkg:npm/next@14.1.0",
        licenses: [{ license: { id: "MIT" } }],
      },
      {
        type: "library",
        name: "openssl",
        version: "3.0.13",
        purl: "pkg:generic/openssl@3.0.13",
        licenses: [{ license: { id: "Apache-2.0" } }],
      },
      {
        type: "library",
        name: "libcurl",
        version: "8.4.0",
        purl: "pkg:generic/libcurl@8.4.0",
        licenses: [{ license: { name: "curl license" } }],
      },
    ],
  },
  null,
  2,
);

const SAMPLE_SPDX = JSON.stringify(
  {
    spdxVersion: "SPDX-2.3",
    dataLicense: "CC0-1.0",
    SPDXID: "SPDXRef-DOCUMENT",
    name: "my-python-api",
    documentNamespace: "https://spdx.org/spdxdocs/example-2026",
    creationInfo: {
      created: "2026-01-15T10:30:00Z",
      creators: ["Tool: syft-0.100.0"],
    },
    packages: [
      {
        SPDXID: "SPDXRef-Package-django",
        name: "Django",
        versionInfo: "4.2.11",
        downloadLocation: "https://pypi.org/project/Django/4.2.11/",
        licenseConcluded: "BSD-3-Clause",
        externalRefs: [
          {
            referenceCategory: "PACKAGE-MANAGER",
            referenceType: "purl",
            referenceLocator: "pkg:pypi/django@4.2.11",
          },
        ],
      },
      {
        SPDXID: "SPDXRef-Package-requests",
        name: "requests",
        versionInfo: "2.31.0",
        downloadLocation: "https://pypi.org/project/requests/2.31.0/",
        licenseConcluded: "Apache-2.0",
        externalRefs: [
          {
            referenceCategory: "PACKAGE-MANAGER",
            referenceType: "purl",
            referenceLocator: "pkg:pypi/requests@2.31.0",
          },
        ],
      },
      {
        SPDXID: "SPDXRef-Package-celery",
        name: "celery",
        versionInfo: "5.3.6",
        downloadLocation: "https://pypi.org/project/celery/5.3.6/",
        licenseConcluded: "BSD-3-Clause",
      },
      {
        SPDXID: "SPDXRef-Package-psycopg2",
        name: "psycopg2-binary",
        versionInfo: "2.9.9",
        downloadLocation: "https://pypi.org/project/psycopg2-binary/2.9.9/",
        licenseConcluded: "LGPL-3.0-only",
      },
      {
        SPDXID: "SPDXRef-Package-gunicorn",
        name: "gunicorn",
        versionInfo: "21.2.0",
        downloadLocation: "https://pypi.org/project/gunicorn/21.2.0/",
        licenseConcluded: "MIT",
      },
      {
        SPDXID: "SPDXRef-Package-pillow",
        name: "Pillow",
        versionInfo: "10.2.0",
        downloadLocation: "https://pypi.org/project/Pillow/10.2.0/",
        licenseConcluded: "MIT-CMU",
      },
      {
        SPDXID: "SPDXRef-Package-pyjwt",
        name: "PyJWT",
        versionInfo: "2.8.0",
        downloadLocation: "https://pypi.org/project/PyJWT/2.8.0/",
        licenseConcluded: "MIT",
      },
      {
        SPDXID: "SPDXRef-Package-boto3",
        name: "boto3",
        versionInfo: "1.34.25",
        downloadLocation: "https://pypi.org/project/boto3/1.34.25/",
        licenseConcluded: "Apache-2.0",
      },
    ],
  },
  null,
  2,
);

/* ── types ── */
interface ParsedComponent {
  name: string;
  version: string;
  license: string;
  type: string;
  purl: string;
}

interface Analysis {
  error?: string;
  format: string;
  specVersion: string;
  documentName: string;
  components: ParsedComponent[];
  licenses: Record<string, number>;
  types: Record<string, number>;
  total: number;
}

/* ── helpers ── */

function extractLicenseCdx(comp: Record<string, unknown>): string {
  const licenses = comp.licenses as
    | { license?: { id?: string; name?: string }; expression?: string }[]
    | undefined;
  if (!licenses?.length) return "Unknown";
  const first = licenses[0];
  if (first.expression) return first.expression;
  if (first.license?.id) return first.license.id;
  if (first.license?.name) return first.license.name;
  return "Unknown";
}

function extractLicenseSpdx(pkg: Record<string, unknown>): string {
  const concluded = pkg.licenseConcluded as string | undefined;
  if (concluded && concluded !== "NOASSERTION") return concluded;
  const declared = pkg.licenseDeclared as string | undefined;
  if (declared && declared !== "NOASSERTION") return declared;
  return "Unknown";
}

function extractPurl(comp: Record<string, unknown>, isCycloneDX: boolean): string {
  if (isCycloneDX) return (comp.purl as string) || "";
  const refs = comp.externalRefs as
    | { referenceType?: string; referenceLocator?: string }[]
    | undefined;
  if (!refs) return "";
  const purlRef = refs.find((r) => r.referenceType === "purl");
  return purlRef?.referenceLocator || "";
}

/* ── license color palette ── */
const LICENSE_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-pink-500",
];

function getLicenseColor(index: number): string {
  return LICENSE_COLORS[index % LICENSE_COLORS.length];
}

/* ── component ── */
export default function SbomExplorer() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Analysis | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "components" | "licenses">("overview");
  const [search, setSearch] = useState("");

  function analyze(text: string) {
    const src = text || input;
    if (!src.trim()) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const json: any = JSON.parse(src);

      const isCycloneDX = json.bomFormat === "CycloneDX";
      const isSPDX = !!json.spdxVersion;

      if (!isCycloneDX && !isSPDX) {
        setResult({ error: "Unrecognized SBOM format. Paste a valid CycloneDX or SPDX JSON document.", format: "", specVersion: "", documentName: "", components: [], licenses: {}, types: {}, total: 0 });
        return;
      }

      const rawComponents = isCycloneDX ? json.components || [] : json.packages || [];

      const components: ParsedComponent[] = rawComponents
        .filter((c: Record<string, unknown>) => {
          if (isSPDX && (c.SPDXID as string)?.includes("DOCUMENT")) return false;
          return true;
        })
        .map((c: Record<string, unknown>) => ({
          name: (c.name as string) || "unknown",
          version: (isCycloneDX ? c.version : c.versionInfo) as string || "unknown",
          license: isCycloneDX ? extractLicenseCdx(c) : extractLicenseSpdx(c),
          type: (c.type as string) || "library",
          purl: extractPurl(c, isCycloneDX),
        }));

      const licenses: Record<string, number> = {};
      const types: Record<string, number> = {};
      for (const c of components) {
        licenses[c.license] = (licenses[c.license] || 0) + 1;
        types[c.type] = (types[c.type] || 0) + 1;
      }

      const format = isCycloneDX
        ? `CycloneDX ${json.specVersion || ""}`
        : `SPDX ${json.spdxVersion || ""}`;

      const docName = isCycloneDX
        ? json.metadata?.component?.name || "Unknown"
        : json.name || "Unknown";

      setResult({
        format: format.trim(),
        specVersion: isCycloneDX ? json.specVersion || "" : json.spdxVersion || "",
        documentName: docName,
        components,
        licenses,
        types,
        total: components.length,
      });
      setActiveTab("overview");
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : "Failed to parse JSON", format: "", specVersion: "", documentName: "", components: [], licenses: {}, types: {}, total: 0 });
    }
  }

  function loadSample(type: "cyclonedx" | "spdx") {
    const sample = type === "cyclonedx" ? SAMPLE_CYCLONEDX : SAMPLE_SPDX;
    setInput(sample);
    analyze(sample);
  }

  const filteredComponents = result?.components?.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.license.toLowerCase().includes(search.toLowerCase()) ||
      c.purl.toLowerCase().includes(search.toLowerCase()),
  );

  const sortedLicenses = result?.licenses
    ? Object.entries(result.licenses).sort((a, b) => b[1] - a[1])
    : [];

  const totalForBar = result?.total || 1;

  return (
    <div className="grid gap-4">
      {/* Input area */}
      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <label htmlFor="sbom-input" className="text-sm font-medium">
            Paste your SBOM JSON
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => loadSample("cyclonedx")}
              className="rounded-md border border-black/15 dark:border-white/15 px-3 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Try CycloneDX sample
            </button>
            <button
              onClick={() => loadSample("spdx")}
              className="rounded-md border border-black/15 dark:border-white/15 px-3 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Try SPDX sample
            </button>
          </div>
        </div>
        <textarea
          id="sbom-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={'{\n  "bomFormat": "CycloneDX",\n  "specVersion": "1.5",\n  "components": [...]\n}'}
          rows={8}
          className="rounded-lg border border-black/15 dark:border-white/15 bg-transparent px-4 py-3 text-xs font-mono resize-y"
          aria-label="SBOM JSON input"
        />
        <button
          onClick={() => analyze(input)}
          disabled={!input.trim()}
          className="rounded-lg bg-[var(--dg-accent,#2563eb)] text-white px-4 py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity w-fit"
        >
          Analyze SBOM
        </button>
      </div>

      {/* Error */}
      {result?.error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-400">
          <strong>Parse error:</strong> {result.error}
        </div>
      )}

      {/* Results */}
      {result && !result.error && result.total > 0 && (
        <div className="grid gap-4">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["Format", result.format],
              ["Document", result.documentName],
              ["Components", String(result.total)],
              ["Licenses", String(Object.keys(result.licenses).length)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-black/10 dark:border-white/10 p-3 grid gap-1"
              >
                <span className="text-[10px] uppercase tracking-wide muted">{label}</span>
                <span className="text-sm font-semibold truncate">{value}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-lg border border-black/10 dark:border-white/10 p-1 w-fit">
            {(["overview", "components", "licenses"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-[var(--dg-accent,#2563eb)] text-white"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid gap-4">
              {/* License distribution bar */}
              <div className="grid gap-2">
                <span className="text-xs font-semibold">License Distribution</span>
                <div className="flex h-6 rounded-md overflow-hidden border border-black/10 dark:border-white/10">
                  {sortedLicenses.map(([lic, count], i) => (
                    <div
                      key={lic}
                      className={`${getLicenseColor(i)} transition-all relative group`}
                      style={{ width: `${(count / totalForBar) * 100}%`, minWidth: count > 0 ? "2px" : "0" }}
                      title={`${lic}: ${count} component${count > 1 ? "s" : ""}`}
                    >
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black/90 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap z-10">
                        {lic}: {count}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {sortedLicenses.map(([lic, count], i) => (
                    <div key={lic} className="flex items-center gap-1.5 text-[11px] muted">
                      <span className={`w-2.5 h-2.5 rounded-sm ${getLicenseColor(i)}`} />
                      {lic} ({count})
                    </div>
                  ))}
                </div>
              </div>

              {/* Component types */}
              {result.types && Object.keys(result.types).length > 1 && (
                <div className="grid gap-2">
                  <span className="text-xs font-semibold">Component Types</span>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(result.types)
                      .sort((a, b) => b[1] - a[1])
                      .map(([type, count]) => (
                        <span
                          key={type}
                          className="rounded-md border border-black/10 dark:border-white/10 px-2.5 py-1 text-xs"
                        >
                          {type}: <strong>{count}</strong>
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Top components preview */}
              <div className="grid gap-2">
                <span className="text-xs font-semibold">
                  Components ({result.total})
                </span>
                <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold border-b border-black/10 dark:border-white/10 bg-black/[.03] dark:bg-white/[.03]">Name</th>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold border-b border-black/10 dark:border-white/10 bg-black/[.03] dark:bg-white/[.03]">Version</th>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold border-b border-black/10 dark:border-white/10 bg-black/[.03] dark:bg-white/[.03]">License</th>
                      </tr>
                    </thead>
                    <tbody className="muted">
                      {result.components.slice(0, 8).map((c, i) => (
                        <tr key={i}>
                          <td className="px-3 py-1.5 text-xs font-medium border-b border-black/5 dark:border-white/5">{c.name}</td>
                          <td className="px-3 py-1.5 text-xs border-b border-black/5 dark:border-white/5 font-mono">{c.version}</td>
                          <td className="px-3 py-1.5 text-xs border-b border-black/5 dark:border-white/5">{c.license}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {result.total > 8 && (
                  <button
                    onClick={() => setActiveTab("components")}
                    className="text-xs text-[var(--dg-accent,#2563eb)] font-medium hover:underline w-fit"
                  >
                    View all {result.total} components
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Components Tab */}
          {activeTab === "components" && (
            <div className="grid gap-3">
              <input
                placeholder="Filter by name, license, or PURL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 text-xs"
              />
              <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10 max-h-96 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold border-b border-black/10 dark:border-white/10 bg-black/[.03] dark:bg-white/[.03]">Name</th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold border-b border-black/10 dark:border-white/10 bg-black/[.03] dark:bg-white/[.03]">Version</th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold border-b border-black/10 dark:border-white/10 bg-black/[.03] dark:bg-white/[.03]">License</th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold border-b border-black/10 dark:border-white/10 bg-black/[.03] dark:bg-white/[.03]">Type</th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold border-b border-black/10 dark:border-white/10 bg-black/[.03] dark:bg-white/[.03]">PURL</th>
                    </tr>
                  </thead>
                  <tbody className="muted">
                    {filteredComponents?.map((c, i) => (
                      <tr key={i} className="hover:bg-black/[.02] dark:hover:bg-white/[.02]">
                        <td className="px-3 py-1.5 text-xs font-medium border-b border-black/5 dark:border-white/5">{c.name}</td>
                        <td className="px-3 py-1.5 text-xs border-b border-black/5 dark:border-white/5 font-mono">{c.version}</td>
                        <td className="px-3 py-1.5 text-xs border-b border-black/5 dark:border-white/5">{c.license}</td>
                        <td className="px-3 py-1.5 text-xs border-b border-black/5 dark:border-white/5">{c.type}</td>
                        <td className="px-3 py-1.5 text-[10px] border-b border-black/5 dark:border-white/5 font-mono max-w-48 truncate">{c.purl || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <span className="text-[11px] muted">
                Showing {filteredComponents?.length || 0} of {result.total} components
              </span>
            </div>
          )}

          {/* Licenses Tab */}
          {activeTab === "licenses" && (
            <div className="grid gap-3">
              <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold border-b border-black/10 dark:border-white/10 bg-black/[.03] dark:bg-white/[.03]">License</th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold border-b border-black/10 dark:border-white/10 bg-black/[.03] dark:bg-white/[.03]">Components</th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold border-b border-black/10 dark:border-white/10 bg-black/[.03] dark:bg-white/[.03]">Percentage</th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold border-b border-black/10 dark:border-white/10 bg-black/[.03] dark:bg-white/[.03] w-48">Distribution</th>
                    </tr>
                  </thead>
                  <tbody className="muted">
                    {sortedLicenses.map(([lic, count], i) => (
                      <tr key={lic}>
                        <td className="px-3 py-2 text-xs font-medium border-b border-black/5 dark:border-white/5">
                          <span className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-sm shrink-0 ${getLicenseColor(i)}`} />
                            {lic}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs border-b border-black/5 dark:border-white/5">{count}</td>
                        <td className="px-3 py-2 text-xs border-b border-black/5 dark:border-white/5">
                          {((count / totalForBar) * 100).toFixed(1)}%
                        </td>
                        <td className="px-3 py-2 border-b border-black/5 dark:border-white/5">
                          <div className="h-3 rounded-sm overflow-hidden bg-black/5 dark:bg-white/5">
                            <div
                              className={`h-full ${getLicenseColor(i)} rounded-sm transition-all`}
                              style={{ width: `${(count / totalForBar) * 100}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
