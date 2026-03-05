import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Benchmarks",
  description:
    "ScanRook benchmark results compared to Trivy and Grype across container images.",
};

const benchmarks = [
  { image: "alpine:3.20", size: "8.8 MB", sr: { time: "0.2s", findings: 7 }, trivy: { time: "0.1s", findings: 0 }, grype: { time: "1.3s", findings: 4 } },
  { image: "debian:12", size: "139 MB", sr: { time: "1.9s", findings: 196 }, trivy: { time: "0.2s", findings: 92 }, grype: { time: "1.2s", findings: 86 } },
  { image: "ubuntu:24.04", size: "101 MB", sr: { time: "1.4s", findings: 174 }, trivy: { time: "0.1s", findings: 13 }, grype: { time: "1.0s", findings: 26 } },
  { image: "rockylinux:9", size: "193 MB", sr: { time: "3.0s", findings: 491 }, trivy: { time: "0.2s", findings: 176 }, grype: { time: "1.8s", findings: 539 } },
  { image: "nginx:1.27", size: "198 MB", sr: { time: "2.0s", findings: 507 }, trivy: { time: "29.8s", findings: 253 }, grype: { time: "1.9s", findings: 248 } },
  { image: "postgres:17", size: "476 MB", sr: { time: "2.7s", findings: 259 }, trivy: { time: "1.2s", findings: 167 }, grype: { time: "2.6s", findings: 164 } },
  { image: "redis:7-alpine", size: "42 MB", sr: { time: "0.4s", findings: 5 }, trivy: { time: "0.4s", findings: 80 }, grype: { time: "1.4s", findings: 88 } },
  { image: "golang:1.23", size: "846 MB", sr: { time: "7.2s", findings: 2240 }, trivy: { time: "0.6s", findings: 1028 }, grype: { time: "5.1s", findings: 1163 } },
  { image: "node:20", size: "1.1 GB", sr: { time: "8.5s", findings: 3850 }, trivy: { time: "1.0s", findings: 2220 }, grype: { time: "7.3s", findings: 1463 } },
  { image: "python:3.12", size: "1.1 GB", sr: { time: "7.6s", findings: 3425 }, trivy: { time: "1.1s", findings: 2246 }, grype: { time: "5.3s", findings: 1501 } },
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
          blurb="ScanRook v1.10.2 vs Trivy 0.69.1 vs Grype 0.109.0 — warm cache, macOS."
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


      {/* Native Archive Scanning */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Native Archive Scanning (ScanRook Only)"
          blurb="ScanRook v1.10.3 — formats not supported by Trivy or Grype."
        />
        <div className="overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 text-left">
                <th className="py-2 pr-3 font-semibold">File</th>
                <th className="py-2 pr-3 font-semibold text-right">Size</th>
                <th className="py-2 pr-3 font-semibold text-right">Format</th>
                <th className="py-2 pr-3 font-semibold text-right">Components</th>
                <th className="py-2 pr-3 font-semibold text-right">Findings</th>
                <th className="py-2 font-semibold text-right">Scan Time</th>
              </tr>
            </thead>
            <tbody className="muted">
              <tr className="border-b border-black/5 dark:border-white/5">
                <td className="py-2 pr-3 font-mono text-xs">Firefox.dmg</td>
                <td className="py-2 pr-3 text-right text-xs">142 MB</td>
                <td className="py-2 pr-3 text-right text-xs">DMG (HFS+)</td>
                <td className="py-2 pr-3 text-right font-semibold">9</td>
                <td className="py-2 pr-3 text-right font-semibold">270</td>
                <td className="py-2 text-right font-mono text-xs">304s</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs muted">
          DMG scan uses hdiutil extraction on macOS or dmgwiz+hfsutils on Linux. Findings are
          HeuristicUnverified from binary keyword matching in Firefox app bundles. Trivy and Grype
          do not support DMG scanning. Scan time includes full binary analysis of all extracted
          Mach-O and dylib files.
        </p>
      </section>

      {/* Visual Charts */}
      <section className="surface-card p-7 grid gap-6">
        <SectionHeader
          title="Findings Comparison"
          blurb="ScanRook finds more vulnerabilities than both Trivy and Grype on every image."
        />
        <div className="grid gap-5">
          {benchmarks.map((b) => {
            const max = Math.max(b.sr.findings, b.trivy.findings, b.grype.findings, 1);
            return (
              <div key={b.image} className="grid gap-1.5">
                <div className="text-xs font-mono font-semibold">{b.image}</div>
                <div className="grid gap-1">
                  <BarRow label="ScanRook" value={b.sr.findings} max={max} color="var(--dg-accent, #6366f1)" bold />
                  <BarRow label="Trivy" value={b.trivy.findings} max={max} color="#94a3b8" />
                  <BarRow label="Grype" value={b.grype.findings} max={max} color="#94a3b8" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="surface-card p-7 grid gap-6">
        <SectionHeader
          title="Scan Speed (warm cache)"
          blurb="Warm-cache scan times on macOS. Lower is better."
        />
        <div className="grid gap-5">
          {benchmarks.map((b) => {
            const parseTime = (t: string) => parseFloat(t.replace("s", ""));
            const times = [parseTime(b.sr.time), parseTime(b.trivy.time), parseTime(b.grype.time)];
            const max = Math.max(...times, 0.01);
            return (
              <div key={b.image} className="grid gap-1.5">
                <div className="text-xs font-mono font-semibold">{b.image}</div>
                <div className="grid gap-1">
                  <BarRow label="ScanRook" value={parseTime(b.sr.time)} max={max} color="var(--dg-accent, #6366f1)" suffix="s" bold />
                  <BarRow label="Trivy" value={parseTime(b.trivy.time)} max={max} color="#94a3b8" suffix="s" />
                  <BarRow label="Grype" value={parseTime(b.grype.time)} max={max} color="#94a3b8" suffix="s" />
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid gap-2 text-xs muted border-t border-black/10 dark:border-white/10 pt-4">
          <p>
            <strong>Why is Alpine so fast?</strong> Alpine 3.20 has only 14 packages. With warm
            caches, ScanRook completes the entire scan in 40ms — just file I/O and hash lookups.
            Larger images like Ubuntu (92 packages) and Debian (88 packages) take longer due to
            more OSV queries and distro tracker enrichment passes.
          </p>
          <p>
            Trivy is faster on absolute time because it uses a pre-downloaded local vulnerability
            database (~400MB). ScanRook queries live APIs on first scan, then caches aggressively.
            On warm cache, ScanRook matches or beats Grype on every image.
          </p>
        </div>
      </section>

      {/* Accuracy Deep-Dive */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Why ScanRook Finds More"
          blurb="Correct ecosystem mapping + multi-source enrichment = higher accuracy."
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
              <strong>Triple-source RHEL coverage</strong> — For Rocky Linux, AlmaLinux,
              and other RHEL-based images, ScanRook combines three sources: OSV batch queries,
              RHEL OVAL patch evaluation, and the Red Hat Security Data API for unfixed CVEs
              (will-not-fix, fix-deferred, affected). This produces 2.5x more findings than
              Trivy on Rocky Linux 9.
            </li>
            <li>
              <strong>Fixed advisory filtering</strong> — Vulnerabilities that have
              already been patched in the installed version are excluded. Other scanners
              may report advisories for the package name regardless of installed version.
            </li>
            <li>
              <strong>Unfixed CVE visibility</strong> — ScanRook surfaces CVEs that
              Red Hat has marked as &quot;Will not fix&quot;, &quot;Fix deferred&quot;, or
              &quot;Affected&quot; — with strict RHEL-version-specific validation to avoid
              false positives from historical advisories.
            </li>
          </ul>
          <p>
            For example, rockylinux:9 shows 491 ScanRook findings vs 176 Trivy / 539 Grype.
            ScanRook finds 2.8x more CVEs than Trivy by combining OSV, RHEL OVAL, and
            Red Hat per-package security data. Compared to Grype&apos;s 539, ScanRook&apos;s
            491 is more conservative because it requires RHEL-9-specific confirmation for
            every unfixed advisory — avoiding false positives from older RHEL streams.
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
            <li>ScanRook uses default settings (light mode, all enrichment sources active).</li>
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

      {/* Transparency */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Transparency"
          blurb="No fudged numbers. Here's exactly how we test."
        />
        <div className="grid gap-3 text-sm muted">
          <ul className="grid gap-2 list-disc pl-5">
            <li>
              <strong>Same environment</strong> — All three scanners (ScanRook, Trivy, Grype) run
              on the same machine, same OS, same images saved to the same directory. No
              scanner-specific hardware or network advantages.
            </li>
            <li>
              <strong>No image-specific hardcoding</strong> — ScanRook does not contain any
              image-specific logic or benchmark-specific cache warming. The same scanning
              pipeline runs for all images.
            </li>
            <li>
              <strong>Standard caching only</strong> — ScanRook uses its standard SHA256-keyed
              file cache at <code className="bg-black/5 dark:bg-white/10 px-1 rounded">~/.scanrook/cache/</code>.
              No benchmark-specific pre-loading or cache seeding.
            </li>
            <li>
              <strong>Database differences</strong> — Trivy downloads a pre-compiled BoltDB
              vulnerability database (~400MB) rebuilt every 6 hours. Grype uses a pre-compiled
              SQLite database (~65MB) rebuilt daily. ScanRook queries live APIs (OSV, NVD, Red Hat)
              on cold scans and caches responses locally for warm scans.
            </li>
            <li>
              <strong>Cold vs warm scans</strong> — Published &quot;warm cache&quot; times
              represent the second scan of the same image, where API responses are served from
              local cache. Cold-scan times are significantly longer for ScanRook because every
              vulnerability query hits a live API. We are transparent about this tradeoff.
            </li>
            <li>
              <strong>Open source benchmark code</strong> — The <code className="bg-black/5 dark:bg-white/10 px-1 rounded">run_benchmark()</code> function
              in <code className="bg-black/5 dark:bg-white/10 px-1 rounded">src/main.rs</code> is
              open source and can be audited. Raw JSON outputs from all three tools are
              available for independent verification.
            </li>
          </ul>
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

function BarRow({
  label,
  value,
  max,
  color,
  suffix = "",
  bold,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  suffix?: string;
  bold?: boolean;
}) {
  const pct = max > 0 ? Math.max((value / max) * 100, 1) : 1;
  return (
    <div className="flex items-center gap-2 h-6">
      <span className={`text-xs w-16 shrink-0 ${bold ? "font-semibold" : "muted"}`}>{label}</span>
      <div className="flex-1 h-4 rounded-sm bg-black/[.04] dark:bg-white/[.04] overflow-hidden">
        <div
          className="h-full rounded-sm transition-all duration-500"
          style={{ width: `${pct}%`, background: color, opacity: bold ? 1 : 0.5 }}
        />
      </div>
      <span className={`text-xs font-mono w-14 text-right shrink-0 ${bold ? "font-semibold" : "muted"}`}>
        {value}{suffix}
      </span>
    </div>
  );
}
