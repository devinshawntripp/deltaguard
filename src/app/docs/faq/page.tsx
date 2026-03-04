import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about ScanRook — supported formats, offline mode, cluster mode, and more.",
};

export default function FaqPage() {
  return (
    <article className="grid gap-6">
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="muted text-sm max-w-3xl">
          Common questions about ScanRook&apos;s capabilities, deployment
          options, and how it compares to other scanners.
        </p>
      </section>

      <section className="surface-card p-7 grid gap-6">
        <FaqItem question="What file types does ScanRook support?">
          <p>
            ScanRook auto-detects file types via magic bytes and supports a wide
            range of formats:
          </p>
          <ul className="list-disc pl-5 grid gap-1 mt-2">
            <li>
              <strong>Container images</strong> -- Docker/OCI tars saved via{" "}
              <code className="bg-black/5 dark:bg-white/10 px-1 rounded">
                docker save
              </code>
            </li>
            <li>
              <strong>ISO images</strong> -- Linux installation media (RHEL,
              Rocky, Ubuntu, etc.)
            </li>
            <li>
              <strong>Source archives</strong> -- tar.gz, tar.bz2, tar.xz source
              tarballs
            </li>
            <li>
              <strong>Binaries</strong> -- ELF (Linux), PE (Windows), and
              Mach-O (macOS) executables
            </li>
            <li>
              <strong>Application archives</strong> -- ZIP, APK (Android), AAB,
              JAR, WAR, EAR, wheel, NuGet, IPA, DMG
            </li>
            <li>
              <strong>SBOMs</strong> -- CycloneDX, SPDX, and Syft JSON formats
              via the{" "}
              <code className="bg-black/5 dark:bg-white/10 px-1 rounded">
                sbom import
              </code>{" "}
              subcommand
            </li>
          </ul>
        </FaqItem>

        <FaqItem question="How is ScanRook different from Trivy and Grype?">
          <p>
            ScanRook takes a different approach to vulnerability scanning:
          </p>
          <ul className="list-disc pl-5 grid gap-1 mt-2">
            <li>
              <strong>Multi-source enrichment</strong> -- ScanRook queries OSV,
              NVD, Red Hat CSAF/OVAL, EPSS, and CISA KEV for every finding.
              Trivy and Grype rely on a single pre-compiled database.
            </li>
            <li>
              <strong>Installed-state verification</strong> -- ScanRook reads
              package databases (dpkg, RPM, APK) directly to confirm a package
              is actually installed, not just present as a file.
            </li>
            <li>
              <strong>Confidence tiers</strong> -- Every finding is tagged as
              either ConfirmedInstalled (from a package database) or
              HeuristicUnverified (from filename or binary analysis), so you can
              prioritize triage.
            </li>
            <li>
              <strong>No mandatory database download</strong> -- ScanRook works
              without a pre-compiled database by falling back to live API
              queries. The optional{" "}
              <code className="bg-black/5 dark:bg-white/10 px-1 rounded">
                scanrook db fetch
              </code>{" "}
              command downloads a database for faster offline scans.
            </li>
            <li>
              <strong>Unfixed CVE visibility</strong> -- On RHEL-based images,
              ScanRook surfaces CVEs marked &quot;Will not fix&quot;, &quot;Fix
              deferred&quot;, and &quot;Affected&quot; that other scanners miss
              entirely.
            </li>
          </ul>
          <p className="mt-2">
            See the{" "}
            <a
              href="/docs/benchmarks"
              className="underline"
              style={{ color: "var(--dg-accent-ink)" }}
            >
              Benchmarks
            </a>{" "}
            page for a detailed head-to-head comparison.
          </p>
        </FaqItem>

        <FaqItem question="Does ScanRook need internet access?">
          <p>
            No. ScanRook can run fully offline when you pre-download the
            vulnerability database:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto mt-2">
            <code>scanrook db fetch</code>
          </pre>
          <p className="mt-2">
            This downloads a pre-compiled SQLite database (~1.4GB compressed)
            containing 497K OSV advisories, 335K NVD CVEs, 318K EPSS scores,
            1.5K CISA KEV entries, and distro-specific feeds for Debian, Ubuntu,
            and Alpine. With this database, scans complete in seconds with zero
            network calls.
          </p>
          <p className="mt-2">
            Without the database, ScanRook falls back to live API queries
            against OSV, NVD, Red Hat, EPSS, and CISA KEV. Responses are cached
            locally under{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded">
              ~/.scanrook/cache/
            </code>{" "}
            so repeated scans are fast even without the database.
          </p>
        </FaqItem>

        <FaqItem question="What is cluster mode?">
          <p>
            Cluster mode is designed for multi-worker deployments where several
            ScanRook instances run in parallel (e.g., in Kubernetes). Enable it
            by setting:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto mt-2">
            <code>SCANROOK_CLUSTER_MODE=1</code>
          </pre>
          <p className="mt-2">In cluster mode, ScanRook:</p>
          <ul className="list-disc pl-5 grid gap-1 mt-1">
            <li>
              Skips the local file cache entirely and uses PostgreSQL as the
              shared enrichment cache across all workers.
            </li>
            <li>
              Writes structured RHEL CVE data back to PostgreSQL so other
              workers can reuse the results without re-fetching from the Red
              Hat API.
            </li>
            <li>
              Requires{" "}
              <code className="bg-black/5 dark:bg-white/10 px-1 rounded">
                SCANROOK_ENRICHMENT_DATABASE_URL
              </code>{" "}
              or{" "}
              <code className="bg-black/5 dark:bg-white/10 px-1 rounded">
                DATABASE_URL
              </code>{" "}
              to be set with a PostgreSQL connection string.
            </li>
          </ul>
          <p className="mt-2">
            This avoids redundant API calls and ensures all workers see the same
            enrichment data, reducing scan times in high-throughput environments.
          </p>
        </FaqItem>

        <FaqItem question="How often is the vulnerability database updated?">
          <p>
            The pre-compiled vulnerability database is rebuilt daily at 6 AM
            UTC. Each rebuild pulls fresh data from:
          </p>
          <ul className="list-disc pl-5 grid gap-1 mt-2">
            <li>
              <strong>OSV</strong> -- All supported ecosystems (npm, PyPI,
              Maven, Go, Cargo, RubyGems, and more)
            </li>
            <li>
              <strong>NVD</strong> -- Full CVE feed with CVSS scores and CPE
              matching data
            </li>
            <li>
              <strong>EPSS</strong> -- Daily exploit probability scores from
              FIRST.org
            </li>
            <li>
              <strong>CISA KEV</strong> -- Known Exploited Vulnerabilities
              catalog
            </li>
            <li>
              <strong>Debian Security Tracker</strong> -- Source package to CVE
              mapping
            </li>
            <li>
              <strong>Alpine SecDB</strong> -- Alpine Linux security database
            </li>
          </ul>
          <p className="mt-2">
            Run{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded">
              scanrook db fetch
            </code>{" "}
            to pull the latest version. The database is compressed with zstd and
            downloads are typically around 1.4GB. You can check the age of your
            current database with{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded">
              scanrook db check
            </code>
            .
          </p>
        </FaqItem>

        <FaqItem question="What package ecosystems are detected?">
          <p>
            ScanRook detects packages from 20+ ecosystems by reading package
            manager databases and lockfiles inside container images and
            archives:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {[
              "RPM (RHEL, Rocky, Alma, Fedora, SUSE)",
              "dpkg (Debian, Ubuntu)",
              "APK (Alpine, Wolfi, Chainguard)",
              "npm (Node.js)",
              "pip / PyPI (Python)",
              "Go modules",
              "Cargo (Rust)",
              "Maven / Gradle (Java)",
              "NuGet (.NET)",
              "RubyGems (Ruby)",
              "Composer (PHP)",
              "CocoaPods (iOS/macOS)",
              "Pub (Dart/Flutter)",
              "Hex (Elixir/Erlang)",
              "CPAN (Perl)",
            ].map((eco) => (
              <div
                key={eco}
                className="text-xs rounded-lg border border-black/10 dark:border-white/10 bg-black/[.02] dark:bg-white/[.02] px-3 py-1.5"
              >
                {eco}
              </div>
            ))}
          </div>
        </FaqItem>

        <FaqItem question="Can I use ScanRook in CI/CD pipelines?">
          <p>
            Yes. ScanRook has first-class support for GitHub Actions and GitLab
            CI. The CLI outputs structured JSON that integrates with SARIF
            uploaders, and the{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded">
              --progress
            </code>{" "}
            flag emits NDJSON progress events for real-time pipeline feedback.
            See the{" "}
            <a
              href="/docs/integrations/github-actions"
              className="underline"
              style={{ color: "var(--dg-accent-ink)" }}
            >
              GitHub Actions
            </a>{" "}
            and{" "}
            <a
              href="/docs/integrations/gitlab-ci"
              className="underline"
              style={{ color: "var(--dg-accent-ink)" }}
            >
              GitLab CI
            </a>{" "}
            integration guides.
          </p>
        </FaqItem>
      </section>
    </article>
  );
}

function FaqItem({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2 border-b border-black/5 dark:border-white/5 pb-6 last:border-0 last:pb-0">
      <h3 className="text-base font-semibold tracking-tight">{question}</h3>
      <div className="text-sm muted grid gap-1">{children}</div>
    </div>
  );
}
