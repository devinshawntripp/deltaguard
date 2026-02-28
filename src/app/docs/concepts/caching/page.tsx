import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Caching",
  description:
    "How ScanRook caches vulnerability API responses to speed up repeated scans without hitting rate limits.",
};

function SectionHeader({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="grid gap-1">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm muted">{blurb}</p>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-black/[.07] dark:bg-white/[.08] px-1.5 py-0.5 text-xs font-mono">
      {children}
    </code>
  );
}

type EnvRow = { name: string; default: string; description: string };
const envVars: EnvRow[] = [
  {
    name: "SCANNER_CACHE",
    default: "~/.scanrook/cache/",
    description: "Override the file cache directory.",
  },
  {
    name: "SCANNER_SKIP_CACHE",
    default: "0",
    description: "Set to 1 to bypass all file cache reads and writes. Forces fresh API calls on every scan.",
  },
  {
    name: "DATABASE_URL",
    default: "(unset)",
    description: "PostgreSQL connection string. Enables the database cache layer for OSV advisories and Red Hat CVE data.",
  },
  {
    name: "REDIS_URL",
    default: "(unset)",
    description: "Redis connection string (redis://host:port). Enables the in-memory cache layer for multi-worker deployments.",
  },
  {
    name: "SCANNER_REDHAT_TTL_DAYS",
    default: "30",
    description: "How many days to treat Red Hat CVE API responses as fresh before re-fetching.",
  },
  {
    name: "SCANNER_OSV_TTL_DAYS",
    default: "7",
    description: "How many days to treat OSV advisory responses as fresh.",
  },
  {
    name: "SCANNER_EPSS_TTL_DAYS",
    default: "1",
    description: "How many days to treat EPSS scores as fresh (re-fetched daily since scores change).",
  },
];

type CacheRow = { source: string; key: string; ttl: string; layer: string };
const cacheEntries: CacheRow[] = [
  {
    source: "OSV batch query",
    key: "sha256(ecosystems + package names)",
    ttl: "7 days",
    layer: "File + PG",
  },
  {
    source: "OSV advisory JSON",
    key: "sha256('osv_advisory' + advisory_id)",
    ttl: "7 days",
    layer: "File + PG",
  },
  {
    source: "NVD CVE JSON",
    key: "sha256('nvd_cve' + CVE-ID)",
    ttl: "30 days",
    layer: "File + PG",
  },
  {
    source: "Red Hat CVE JSON",
    key: "sha256('redhat_cve' + CVE-ID)",
    ttl: "dynamic (30 days default)",
    layer: "File + PG",
  },
  {
    source: "Red Hat per-package CVE list",
    key: "sha256('redhat_pkg_cves' + package_name)",
    ttl: "30 days",
    layer: "File only",
  },
  {
    source: "EPSS batch scores",
    key: "sha256('epss_v1' + sorted CVE IDs)",
    ttl: "1 day",
    layer: "File only",
  },
  {
    source: "CISA KEV catalog",
    key: "sha256('kev_catalog')",
    ttl: "1 day",
    layer: "File only",
  },
  {
    source: "OVAL XML auto-download",
    key: "sha256('oval_auto' + distro_key)",
    ttl: "7 days",
    layer: "File only",
  },
];

export default function CachingPage() {
  return (
    <article className="grid gap-6">
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Caching</h1>
        <p className="muted text-sm max-w-3xl">
          ScanRook makes live API calls to OSV, NVD, Red Hat, EPSS, and CISA to
          enrich findings with up-to-date vulnerability data. To avoid hitting rate
          limits and to make repeated scans of the same artifact fast, every API
          response is cached locally. This page explains how the three caching
          layers work and how to configure them.
        </p>
      </section>

      {/* Three layers */}
      <section className="surface-card p-7 grid gap-6">
        <SectionHeader
          title="Three-layer cache hierarchy"
          blurb="Responses are checked in order: in-memory → file → PostgreSQL → live API."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              tier: "1",
              name: "File cache",
              path: "~/.scanrook/cache/",
              color: "var(--dg-accent)",
              notes: [
                "Always active by default",
                "Keyed by SHA256 of request params",
                "Stored as raw JSON bytes per entry",
                "Disable with SCANNER_SKIP_CACHE=1",
              ],
            },
            {
              tier: "2",
              name: "PostgreSQL",
              path: "DATABASE_URL",
              color: "#6366f1",
              notes: [
                "Opt-in via DATABASE_URL env var",
                "Shared across multiple worker pods",
                "Stores OSV advisories and Red Hat CVE data",
                "Schema auto-initialized on first use",
              ],
            },
            {
              tier: "3",
              name: "Redis",
              path: "REDIS_URL",
              color: "#dc2626",
              notes: [
                "Opt-in via REDIS_URL env var",
                "Fastest layer for multi-worker setups",
                "Used for NVD CPE lookups and rate-limit coordination",
                "Not required for single-machine use",
              ],
            },
          ].map((layer) => (
            <div
              key={layer.tier}
              className="rounded-xl border border-black/10 dark:border-white/10 p-5 grid gap-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: layer.color }}
                >
                  {layer.tier}
                </span>
                <span className="font-semibold text-sm">{layer.name}</span>
              </div>
              <Code>{layer.path}</Code>
              <ul className="grid gap-1">
                {layer.notes.map((n) => (
                  <li key={n} className="text-xs muted flex gap-1.5">
                    <span className="mt-0.5 opacity-40">•</span>
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-sm muted grid gap-2 border-t border-black/10 dark:border-white/10 pt-4">
          <p>
            When a vulnerability lookup is needed, ScanRook checks each layer in
            order. A cache hit in any layer skips all subsequent layers including the
            live API call. Responses fetched from the API are written back to all
            configured layers so subsequent requests are served from cache.
          </p>
          <p>
            The file cache is always active. PostgreSQL and Redis layers are additive
            — configuring them speeds up multi-worker deployments where multiple
            scanner pods share the same artifact queue but don&rsquo;t share a local
            filesystem.
          </p>
        </div>
      </section>

      {/* Cache key format */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Cache key format"
          blurb="Every cache entry is keyed by SHA256 of its request parameters."
        />
        <p className="text-sm muted">
          Cache keys are computed by hashing a list of string parts together. For
          example, the Red Hat CVE API response for CVE-2024-1234 is stored under{" "}
          <Code>sha256("redhat_cve" + "CVE-2024-1234")</Code>. The file cache stores
          each entry as a single file named by the hex-encoded hash inside the cache
          directory. This makes cache lookups O(1) regardless of how many entries are
          stored.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-left muted border-b border-black/10 dark:border-white/10">
                <th className="pb-2 pr-4 font-medium">Source</th>
                <th className="pb-2 pr-4 font-medium">Key components</th>
                <th className="pb-2 pr-4 font-medium">TTL</th>
                <th className="pb-2 font-medium">Layers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {cacheEntries.map((row) => (
                <tr key={row.source}>
                  <td className="py-2.5 pr-4 font-medium">{row.source}</td>
                  <td className="py-2.5 pr-4 font-mono text-xs muted">{row.key}</td>
                  <td className="py-2.5 pr-4 muted">{row.ttl}</td>
                  <td className="py-2.5 muted">{row.layer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs muted">
          EPSS chunk keys include all sorted CVE IDs in the batch to ensure stable
          cache hits across repeated scans of the same artifact.
        </p>
      </section>

      {/* Dynamic TTL */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Dynamic TTL for Red Hat data"
          blurb="Recently-modified CVEs get shorter TTLs so fixes are surfaced quickly."
        />
        <p className="text-sm muted">
          Red Hat CVE entries include a <Code>lastModified</Code> timestamp. The
          scanner uses this to compute a shorter cache TTL for recently-changed
          advisories. If a CVE was modified in the last 7 days, it is re-fetched
          after 1 day regardless of the base TTL. CVEs that haven&rsquo;t changed in
          more than 90 days get a longer TTL of up to 90 days. This balances
          freshness with API load.
        </p>
        <div className="rounded-lg bg-black/[.04] dark:bg-white/[.04] border border-black/10 dark:border-white/10 p-4 text-xs font-mono muted grid gap-1">
          <div className="font-semibold text-xs mb-1" style={{ color: "var(--dg-text)" }}>TTL logic</div>
          <div>last_modified &lt; 7 days ago  → TTL = 1 day</div>
          <div>last_modified 7–30 days ago  → TTL = base_ttl (default 30d)</div>
          <div>last_modified &gt; 90 days ago  → TTL = 90 days</div>
        </div>
      </section>

      {/* db commands */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Managing the cache"
          blurb="Use the db subcommand to inspect and refresh cached vulnerability data."
        />
        <div className="grid gap-3">
          {[
            {
              cmd: "scanrook db sources",
              desc: "List all configured cache sources (file cache path, PostgreSQL URL if set, Redis URL if set).",
            },
            {
              cmd: "scanrook db check",
              desc: "Show the number of cached entries per source, disk usage, and oldest/newest entries.",
            },
            {
              cmd: "scanrook db update",
              desc: "Pre-warm the cache by downloading the latest KEV catalog, EPSS scores, and any pending OVAL files.",
            },
          ].map((row) => (
            <div
              key={row.cmd}
              className="grid gap-1 rounded-lg border border-black/10 dark:border-white/10 p-4"
            >
              <Code>{row.cmd}</Code>
              <p className="text-xs muted mt-1">{row.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs muted">
          To clear the entire file cache: <Code>rm -rf ~/.scanrook/cache/</Code>. The
          next scan will re-populate it from live APIs.
        </p>
      </section>

      {/* Environment variables */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Environment variables"
          blurb="All caching behaviour can be tuned without changing any config file."
        />
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-left muted border-b border-black/10 dark:border-white/10">
                <th className="pb-2 pr-4 font-medium">Variable</th>
                <th className="pb-2 pr-4 font-medium">Default</th>
                <th className="pb-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {envVars.map((row) => (
                <tr key={row.name}>
                  <td className="py-2.5 pr-4 font-mono font-medium">{row.name}</td>
                  <td className="py-2.5 pr-4 font-mono muted">{row.default}</td>
                  <td className="py-2.5 muted">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CI / pipeline guidance */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Cache in CI/CD pipelines"
          blurb="Mount the cache directory as a persistent volume or artifact to speed up pipeline scans."
        />
        <p className="text-sm muted">
          In GitHub Actions or GitLab CI, mount <Code>~/.scanrook/cache</Code> as a
          cache artifact between runs. On the first pipeline run all API calls are
          made live. Subsequent runs for the same set of packages hit the file cache
          and complete much faster — typically in under 3 seconds for a fully warm
          cache versus 30–60 seconds for a cold scan.
        </p>
        <div className="rounded-lg bg-black/[.04] dark:bg-white/[.04] border border-black/10 dark:border-white/10 p-4 text-xs font-mono muted">
          <div className="font-semibold text-xs mb-2" style={{ color: "var(--dg-text)" }}>GitHub Actions example</div>
          <div className="grid gap-0.5">
            <div>- uses: actions/cache@v4</div>
            <div>  with:</div>
            <div>    path: ~/.scanrook/cache</div>
            <div>    key: scanrook-cache-{"${{ hashFiles('**/package-lock.json') }}"}</div>
            <div>    restore-keys: scanrook-cache-</div>
          </div>
        </div>
        <p className="text-xs muted">
          When <Code>DATABASE_URL</Code> is set, the PostgreSQL cache is shared
          across all worker pods automatically — no volume mounting needed. This is
          the recommended approach for self-hosted DeltaGuard deployments where
          multiple worker replicas scan different jobs concurrently.
        </p>
      </section>
    </article>
  );
}
