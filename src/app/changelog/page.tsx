import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";
import PublicSiteShell from "@/components/PublicSiteShell";

export const metadata: Metadata = {
  title: `Changelog | ${APP_NAME}`,
  description:
    "ScanRook release notes and changelog. See what's new in each version of the vulnerability scanner.",
  openGraph: {
    title: `Changelog | ${APP_NAME}`,
    description:
      "Release notes for ScanRook — container, binary, and source vulnerability scanning.",
  },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  highlights: string[];
  details?: string[];
}

const entries: ChangelogEntry[] = [
  {
    version: "1.4.0",
    date: "2026-02-20",
    title: "EPSS + CISA KEV enrichment, SBOM policy gates, license detection",
    highlights: [
      "Added EPSS (Exploit Prediction Scoring System) enrichment — each CVE now includes a 0\u20131 probability score indicating real-world exploit likelihood.",
      "Added CISA KEV (Known Exploited Vulnerabilities) tagging — findings confirmed exploited in the wild are flagged automatically.",
      "New SBOM policy gate system — define severity and license policies that fail CI builds when violated.",
      "License detection for packages across all supported ecosystems.",
    ],
    details: [
      "EPSS scores are fetched from FIRST.org and cached alongside CVE data.",
      "KEV catalog is synced daily and matched by CVE ID during enrichment.",
      "Policy gates support threshold-based rules (e.g., block on critical CVSS, block on GPL licenses).",
    ],
  },
  {
    version: "1.3.0",
    date: "2026-01-15",
    title: "Amazon Linux, Oracle Linux, Chainguard, and Wolfi support",
    highlights: [
      "Added Amazon Linux 2 and Amazon Linux 2023 RPM advisory detection via ALAS.",
      "Added Oracle Linux ELSA advisory support for RPM packages.",
      "Added Chainguard OS APK security data integration.",
      "Added Wolfi OS APK security data for distroless container scanning.",
      "Added AlmaLinux OSV advisory support for RPM packages.",
    ],
    details: [
      "Distro detection now identifies Amazon Linux, Oracle Linux, Chainguard, and Wolfi from os-release files.",
      "All new distro feeds follow the same caching pipeline as existing providers.",
    ],
  },
  {
    version: "1.2.0",
    date: "2025-12-10",
    title: "Benchmark framework and DB cache management CLI",
    highlights: [
      "New benchmark subcommand for measuring scan performance across artifact types.",
      "Added db subcommand with sources, check, and update commands for managing the local CVE cache.",
      "Benchmark comparison reports with artifact output for CI pipelines.",
      "Structured stage-level progress logging for all scan types.",
    ],
    details: [
      "Benchmarks output JSON reports and optional HTML comparison graphs.",
      "DB cache management lets users inspect, validate, and force-refresh cached advisory data.",
    ],
  },
  {
    version: "1.1.0",
    date: "2025-11-05",
    title: "Red Hat OVAL integration and Alpine secdb",
    highlights: [
      "Red Hat OVAL XML-based offline vulnerability checking via --oval-redhat flag.",
      "Alpine secdb integration — auto-activated when Alpine is detected in container images.",
      "Ubuntu CVE Tracker and Debian Security Tracker auto-detection.",
      "Improved container scan performance with accelerated layer extraction.",
      "Per-package findings preserved across all scan stages.",
    ],
    details: [
      "OVAL checking runs entirely offline using user-supplied XML definitions.",
      "Alpine secdb maps CVEs to APK package versions with fix status per release.",
    ],
  },
  {
    version: "1.0.0",
    date: "2025-09-01",
    title: "Initial release — container, binary, and source scanning",
    highlights: [
      "Auto-detect file type via magic bytes: container tar, source tar, ISO, or binary.",
      "Container scanning with support for RPM, APK, DPKG, npm, pip, Go, Cargo, Maven, NuGet, and RubyGems ecosystems.",
      "Binary analysis for ELF, PE, and Mach-O formats via goblin with linked library and Go build info extraction.",
      "OSV batch API enrichment as primary vulnerability source.",
      "NVD CPE-based enrichment with CVSS v3.1 scoring.",
      "Red Hat Security Data API integration for RPM fix status.",
      "SBOM import support for CycloneDX, SPDX, and Syft JSON formats.",
      "SBOM diff for change tracking between scans.",
      "Confidence tiers: ConfirmedInstalled vs HeuristicUnverified findings.",
      "JSON and text output formats with NDJSON progress streaming.",
      "File-based, PostgreSQL, and Redis caching layers.",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ChangelogPage() {
  const changelogSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "ScanRook Changelog",
    description: "Release notes and changelog for ScanRook vulnerability scanner.",
    url: "https://scanrook.io/changelog",
    numberOfItems: entries.length,
    itemListElement: entries.map((entry, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `v${entry.version} — ${entry.title}`,
      description: entry.highlights.join(" "),
    })),
  };

  return (
    <PublicSiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(changelogSchema) }}
      />
      <main className="mx-auto max-w-5xl px-6 py-14 grid gap-10">
        {/* Header */}
        <section className="surface-card p-8 grid gap-4">
          <div className="inline-flex w-fit items-center rounded-full border border-black/10 dark:border-white/10 px-3 py-1 text-xs muted">
            Changelog
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Release notes
          </h1>
          <p className="text-sm muted max-w-3xl">
            A chronological log of new features, improvements, and fixes in
            ScanRook. Subscribe to the{" "}
            <Link href="/blog" className="underline underline-offset-2">
              blog
            </Link>{" "}
            for deeper write-ups on major releases.
          </p>
        </section>

        {/* Entries */}
        <section className="grid gap-6">
          {entries.map((entry) => (
            <ReleaseCard key={entry.version} entry={entry} />
          ))}
        </section>

        {/* CTA */}
        <section className="surface-card p-8 grid gap-4 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Stay up to date
          </h2>
          <p className="text-sm muted">
            Follow the blog or install the latest CLI to get new features as
            they ship.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-1">
            <a href="https://scanrook.sh" className="btn-primary">
              Install CLI
            </a>
            <Link href="/blog" className="btn-secondary">
              Read the blog
            </Link>
          </div>
        </section>
      </main>
    </PublicSiteShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function ReleaseCard({ entry }: { entry: ChangelogEntry }) {
  return (
    <div className="surface-card p-6 grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-semibold">
          v{entry.version}
        </span>
        <span className="text-xs muted">{entry.date}</span>
      </div>
      <h3 className="text-lg font-semibold tracking-tight leading-snug">
        {entry.title}
      </h3>
      <ul className="grid gap-2">
        {entry.highlights.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm">
            <svg
              className="mt-1 flex-shrink-0 text-emerald-600 dark:text-emerald-400"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              aria-hidden="true"
            >
              <path
                d="M2.5 7.5 5.5 10.5 11.5 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {entry.details && entry.details.length > 0 && (
        <div className="border-t border-black/5 dark:border-white/5 pt-3 grid gap-1.5">
          {entry.details.map((detail) => (
            <p key={detail} className="text-xs muted leading-relaxed">
              {detail}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
