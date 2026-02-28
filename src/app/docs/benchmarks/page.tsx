import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Benchmarks",
  description:
    "ScanRook benchmark results compared to Trivy and Grype across container images.",
};

const benchmarks = [
  { image: "ubuntu:22.04", size: "69 MB", sr: { time: "1.5s", findings: 29 }, trivy: { time: "0.2s", findings: 28 }, grype: { time: "1.0s", findings: 34 } },
  { image: "debian:12", size: "137 MB", sr: { time: "1.4s", findings: 18 }, trivy: { time: "0.2s", findings: 92 }, grype: { time: "1.2s", findings: 86 } },
  { image: "alpine:3.20", size: "8.7 MB", sr: { time: "3.3s", findings: 0 }, trivy: { time: "0.1s", findings: 0 }, grype: { time: "1.0s", findings: 4 } },
  { image: "rockylinux:9", size: "189 MB", sr: { time: "2.8s", findings: 243 }, trivy: { time: "0.2s", findings: 176 }, grype: { time: "1.8s", findings: 539 } },
  { image: "node:22-slim", size: "240 MB", sr: { time: "1.5s", findings: 18 }, trivy: { time: "0.2s", findings: 109 }, grype: { time: "3.7s", findings: 103 } },
];

const metrics = [
  { label: "Ecosystems Supported", value: "20+", detail: "npm, PyPI, Maven, Go, Cargo, NuGet, RubyGems, Pub, CocoaPods, Hex, and more" },
  { label: "Data Sources", value: "6", detail: "OSV, NVD, Red Hat CSAF, Ubuntu CVE Tracker, Debian Security Tracker, EPSS + CISA KEV" },
  { label: "Archive Formats", value: "15+", detail: "Container tar, ISO, ZIP, APK, AAB, JAR, WAR, EAR, wheel, NuGet, IPA, DMG, SBOM" },
  { label: "Enrichment per CVE", value: "5 signals", detail: "Severity, CVSS vector, EPSS probability, KEV status, fix availability" },
  { label: "Confidence Tiers", value: "2", detail: "ConfirmedInstalled (from package DB) vs HeuristicUnverified (from filename/binary)" },
  { label: "NVD Concurrency", value: "8 threads", detail: "Parallel NVD enrichment with API key (400ms throttle per thread)" },
];

export default function BenchmarksPage() {
  return (
    <article className="grid gap-6">
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Benchmarks</h1>
        <p className="muted text-sm max-w-3xl">
          Scan accuracy and speed compared to Trivy and Grype. ScanRook prioritizes
          precision over volume — fewer findings, higher signal.
        </p>
      </section>

      {/* Key Metrics */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Scanner Metrics"
          blurb="Key numbers for the current release."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-black/10 dark:border-white/10 bg-black/[.02] dark:bg-white/[.02] p-4 grid gap-1"
            >
              <div className="text-2xl font-bold tracking-tight">{m.value}</div>
              <div className="text-sm font-semibold">{m.label}</div>
              <div className="text-xs muted">{m.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Container Scan Comparison"
          blurb="ScanRook v1.5.0 vs Trivy 0.69.1 vs Grype 0.109.0 — warm cache, macOS."
        />
        <div className="overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 text-left">
                <th className="py-2 pr-3 font-semibold">Image</th>
                <th className="py-2 pr-3 font-semibold text-right">Size</th>
                <th className="py-2 pr-3 font-semibold text-right" colSpan={2}>
                  <span className="inline-flex items-center gap-1.5">
                    ScanRook
                  </span>
                </th>
                <th className="py-2 pr-3 font-semibold text-right" colSpan={2}>Trivy</th>
                <th className="py-2 font-semibold text-right" colSpan={2}>Grype</th>
              </tr>
              <tr className="border-b border-black/5 dark:border-white/5 text-xs muted">
                <th></th>
                <th></th>
                <th className="py-1 pr-3 text-right font-normal">Time</th>
                <th className="py-1 pr-3 text-right font-normal">Findings</th>
                <th className="py-1 pr-3 text-right font-normal">Time</th>
                <th className="py-1 pr-3 text-right font-normal">Findings</th>
                <th className="py-1 pr-3 text-right font-normal">Time</th>
                <th className="py-1 text-right font-normal">Findings</th>
              </tr>
            </thead>
            <tbody className="muted">
              {benchmarks.map((b) => (
                <tr
                  key={b.image}
                  className="border-b border-black/5 dark:border-white/5"
                >
                  <td className="py-2 pr-3 font-mono text-xs">{b.image}</td>
                  <td className="py-2 pr-3 text-right text-xs">{b.size}</td>
                  <td className="py-2 pr-3 text-right font-mono text-xs">{b.sr.time}</td>
                  <td className="py-2 pr-3 text-right font-semibold">{b.sr.findings}</td>
                  <td className="py-2 pr-3 text-right font-mono text-xs">{b.trivy.time}</td>
                  <td className="py-2 pr-3 text-right">{b.trivy.findings}</td>
                  <td className="py-2 pr-3 text-right font-mono text-xs">{b.grype.time}</td>
                  <td className="py-2 text-right">{b.grype.findings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs muted">
          All runs on macOS with warm caches. Images pulled via <code className="bg-black/5 dark:bg-white/10 px-1 rounded">docker save</code>.
          Finding counts reflect unique CVEs after deduplication.
        </p>
      </section>

      {/* Why Fewer Findings */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="ScanRook Findings vs Trivy and Grype"
          blurb="Precision plus deeper RHEL advisory coverage."
        />
        <div className="grid gap-3 text-sm muted">
          <p>
            ScanRook combines multiple advisory sources and verifies against the
            installed package database to produce high-confidence findings:
          </p>
          <ul className="grid gap-2 list-disc pl-5">
            <li>
              <strong>Installed-state verification</strong> — ScanRook reads package
              databases (dpkg, RPM, APK) directly instead of relying on file path
              heuristics. Only packages confirmed as installed are reported with
              ConfirmedInstalled confidence.
            </li>
            <li>
              <strong>RHEL OVAL + OSV dual-source for RPM images</strong> — For Rocky
              Linux, AlmaLinux, and other RHEL-compatible distros, ScanRook supplements
              its OSV advisory lookups with direct RHEL OVAL evaluation. This catches
              CVEs that are in the OVAL data but not yet reflected in ecosystem-specific
              OSV entries.
            </li>
            <li>
              <strong>Fixed advisory filtering</strong> — Vulnerabilities that have
              already been patched in the installed version are excluded. Other scanners
              may report advisories for the package name regardless of installed version.
            </li>
            <li>
              <strong>No unfixed noise</strong> — By default, ScanRook does not report
              vulnerabilities with no fix available unless they appear in CISA KEV
              (known exploited).
            </li>
          </ul>
          <p>
            For example, rockylinux:9 shows 243 ScanRook findings vs 176 Trivy / 539 Grype.
            ScanRook finds 41 more unique CVEs than Trivy by combining OSV advisory lookups
            with direct RHEL OVAL evaluation. Grype&apos;s 539 includes over 200 advisories
            with no fix available, which ScanRook suppresses since they carry no actionable
            remediation path.
          </p>
        </div>
      </section>

      {/* Enrichment Depth */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Enrichment Depth"
          blurb="What ScanRook adds that others don't."
        />
        <div className="overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10">
                <th className="text-left py-2 pr-4 font-semibold">Feature</th>
                <th className="py-2 pr-4 font-semibold text-center">ScanRook</th>
                <th className="py-2 pr-4 font-semibold text-center">Trivy</th>
                <th className="py-2 font-semibold text-center">Grype</th>
              </tr>
            </thead>
            <tbody className="muted">
              <FeatureRow feature="OSV advisory lookup" sr grype trivy />
              <FeatureRow feature="NVD CVSS enrichment" sr trivy grype />
              <FeatureRow feature="EPSS exploit probability" sr />
              <FeatureRow feature="CISA KEV flagging" sr />
              <FeatureRow feature="Confidence tiers" sr />
              <FeatureRow feature="Red Hat CSAF/OVAL" sr />
              <FeatureRow feature="Fixed-version tracking" sr trivy grype />
              <FeatureRow feature="Installed-state verification" sr />
              <FeatureRow feature="Application package detection" sr trivy grype />
              <FeatureRow feature="SBOM import (CycloneDX/SPDX)" sr trivy grype />
              <FeatureRow feature="ZIP archive scanning" sr />
              <FeatureRow feature="DMG disk image scanning" sr />
            </tbody>
          </table>
        </div>
      </section>

      {/* Methodology */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Methodology"
          blurb="How these benchmarks were produced."
        />
        <div className="grid gap-3 text-sm muted">
          <ul className="grid gap-1.5 list-disc pl-5">
            <li>All tools run on the same machine with warm caches (second run after initial cache population).</li>
            <li>Container images saved via <code className="bg-black/5 dark:bg-white/10 px-1 rounded">docker save</code> to local tar files.</li>
            <li>ScanRook uses <code className="bg-black/5 dark:bg-white/10 px-1 rounded">--mode deep</code> with NVD API key.</li>
            <li>Trivy uses <code className="bg-black/5 dark:bg-white/10 px-1 rounded">trivy image --input</code> with default settings.</li>
            <li>Grype uses <code className="bg-black/5 dark:bg-white/10 px-1 rounded">grype [file] -o json</code> with default settings.</li>
            <li>Finding counts are unique CVE IDs after deduplication.</li>
            <li>Raw benchmark data (JSON reports + CSV) is available in the scanner repository.</li>
          </ul>
          <p>
            To reproduce these benchmarks yourself:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
            <code>scanrook benchmark --file ./image.tar --profile warm</code>
          </pre>
        </div>
      </section>

      <section className="surface-card p-7 grid gap-4">
        <SectionHeader title="More Comparisons" blurb="Detailed head-to-head pages." />
        <div className="flex flex-wrap gap-3">
          <Link href="/compare/trivy" className="btn-secondary">ScanRook vs Trivy</Link>
          <Link href="/compare/grype" className="btn-secondary">ScanRook vs Grype</Link>
          <Link href="/compare/snyk" className="btn-secondary">ScanRook vs Snyk</Link>
          <Link href="/blog/scanrook-benchmark-results" className="btn-secondary">Full Benchmark Blog Post</Link>
        </div>
      </section>
    </article>
  );
}

function SectionHeader({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-xs muted mt-0.5">{blurb}</p>
    </div>
  );
}

function FeatureRow({
  feature,
  sr,
  trivy,
  grype,
}: {
  feature: string;
  sr?: boolean;
  trivy?: boolean;
  grype?: boolean;
}) {
  return (
    <tr className="border-b border-black/5 dark:border-white/5">
      <td className="py-1.5 pr-4 text-xs">{feature}</td>
      <td className="py-1.5 pr-4 text-center">{sr ? <Check /> : <Dash />}</td>
      <td className="py-1.5 pr-4 text-center">{trivy ? <Check /> : <Dash />}</td>
      <td className="py-1.5 text-center">{grype ? <Check /> : <Dash />}</td>
    </tr>
  );
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="inline text-green-500">
      <path d="M4 8.5l3 3 5-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Dash() {
  return <span className="text-xs muted">—</span>;
}
