import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "ScanRook release history -- new features, bug fixes, and improvements across versions.",
};

const releases = [
  {
    version: "1.8.0",
    date: "2026-02-28",
    highlights: [
      "Binary renamed from `scanner` to `scanrook` (deprecated alias still works)",
      "Cluster mode (`SCANROOK_CLUSTER_MODE=1`) -- PostgreSQL shared enrichment cache across workers",
      "RHEL CVE write-back to PostgreSQL in cluster mode for cross-worker result sharing",
      "Kubernetes namespace renamed from `deltaguard` to `scanrook`",
      "Admin features for organization and team management in the dashboard",
      "Self-update command: `scanrook upgrade` downloads the latest release binary",
    ],
  },
  {
    version: "1.7.0",
    date: "2026-02-15",
    highlights: [
      "Pre-compiled vulnerability database via `scanrook db fetch` (~1.4GB compressed)",
      "Database contains 497K OSV advisories, 335K NVD CVEs, 318K EPSS scores, 1.5K CISA KEV entries",
      "Zstd compression for database downloads -- 3x smaller than gzip",
      "Debian Security Tracker and Alpine SecDB data included in the database",
      "Ubuntu USN (Ubuntu Security Notices) integration for precise Ubuntu CVE matching",
      "`scanrook db check` and `scanrook db clear` management commands",
      "Cold scans that previously took 20+ minutes now complete in seconds with the database",
    ],
  },
  {
    version: "1.6.4",
    date: "2026-02-10",
    highlights: [
      "Progress file OnceLock initialization ordering fix",
      "Cargo.lock updated for dependency consistency",
    ],
  },
  {
    version: "1.6.3",
    date: "2026-02-08",
    highlights: [
      "Eagerly create progress file and emit init event for Go worker compatibility",
      "Fixed edge case where progress file was not created before the first event",
    ],
  },
  {
    version: "1.6.2",
    date: "2026-02-27",
    highlights: [
      "EPSS enrichment: batch queries api.first.org with 24h caching",
      "CISA KEV enrichment: downloads full catalog, flags known exploited vulnerabilities",
      "New distro support: Amazon Linux, Oracle Linux, Chainguard, Wolfi",
      "License detection: 15 license patterns with SPDX header fallback",
      "SBOM policy gates: `sbom policy check --policy policy.yaml`",
      "EPSS cache key determinism fix -- sort CVE IDs before chunking (700ms to 1ms)",
      "Per-package CVE list loading parallelized with rayon (1256ms to 399ms)",
      "OVAL cache optimization (953ms to 74ms, 12.9x faster)",
      "Rocky Linux 9 warm scan: 15.2s to 1.8s (8.4x faster)",
    ],
  },
  {
    version: "1.6.1",
    date: "2026-02-25",
    highlights: [
      "Alpine OSV ecosystem fix: 'Alpine Linux' (invalid) changed to 'Alpine'",
      "Debian/Ubuntu: OSV queries now use source package names from dpkg status",
      "Ubuntu: separate 'Ubuntu' OSV ecosystem detected via /etc/os-release",
      "OSV batch query cache fix: `resolve_enrich_cache_dir()` returned None without SCANNER_CACHE",
      "Alpine SecDB and Debian tracker caching fix -- feeds were never cached",
      "New `PackageCoordinate.source_name` field for dpkg Source, APK origin, RPM SOURCERPM",
    ],
  },
  {
    version: "1.6.0",
    date: "2026-02-20",
    highlights: [
      "Triple-source RHEL scanning: OSV batch queries + RHEL OVAL + Red Hat Security Data API",
      "Unfixed CVE injection for RHEL-based images (Will not fix, Fix deferred, Affected)",
      "Strict RHEL-version-specific CPE filtering to prevent false positives from historical advisories",
      "Rocky Linux 9 findings: 18 to 481 (26x increase)",
      "RPM SQLite format fix: handle both magic-prefixed and raw formats (RPM 4.16+)",
      "Security hardening: Zip Slip protection, ISO symlink escape detection, cache dir permissions",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <article className="grid gap-6">
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Changelog</h1>
        <p className="muted text-sm max-w-3xl">
          Release history for ScanRook. Each version includes new features,
          performance improvements, and bug fixes.
        </p>
      </section>

      {releases.map((release) => (
        <section key={release.version} className="surface-card p-7 grid gap-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-xl font-semibold tracking-tight">
              v{release.version}
            </h2>
            <span className="text-xs muted font-mono">{release.date}</span>
          </div>
          <ul className="grid gap-2 text-sm muted">
            {release.highlights.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: "var(--dg-accent, #6366f1)" }}
                />
                <span>
                  <HighlightText text={item} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  );
}

function HighlightText({ text }: { text: string }) {
  // Render backtick-wrapped segments as <code> elements
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs font-mono"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
