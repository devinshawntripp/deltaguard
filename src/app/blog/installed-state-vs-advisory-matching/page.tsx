import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";

const title = `Installed-State Scanning vs. Advisory Matching: Reducing False Positives | ${APP_NAME}`;
const description =
  "Why reading actual package manager databases produces more accurate vulnerability findings than matching file paths against advisory lists, and how ScanRook implements confidence tiers.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "installed-state scanning",
    "advisory matching",
    "false positives",
    "confidence tiers",
    "vulnerability scanning",
    "package manager",
    "ScanRook",
  ],
  alternates: {
    canonical: "/blog/installed-state-vs-advisory-matching",
  },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/installed-state-vs-advisory-matching",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline:
    "Installed-State Scanning vs. Advisory Matching: Reducing False Positives",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage:
    "https://scanrook.io/blog/installed-state-vs-advisory-matching",
  datePublished: "2026-02-27",
  dateModified: "2026-02-27",
};

export default function InstalledStateVsAdvisoryPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 grid gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="surface-card p-8 grid gap-6">
        <header className="grid gap-3">
          <div className="text-xs uppercase tracking-wide muted">
            Scanning concepts
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Installed-State Scanning vs. Advisory Matching: Reducing False
            Positives
          </h1>
          <p className="text-sm muted">
            Not all vulnerability findings are equal. The method a scanner uses
            to determine what software is present in an artifact directly
            affects the accuracy of its results. This article explains the
            difference between installed-state scanning and advisory matching,
            and why it matters for security teams.
          </p>
        </header>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            The Problem: Too Many Findings, Not Enough Trust
          </h2>
          <p className="text-sm muted">
            A common complaint about vulnerability scanners is noise. A scan of
            a standard container image might produce hundreds of findings, many
            of which are irrelevant or inaccurate. When security teams cannot
            trust their scan results, they either spend excessive time on manual
            triage or start ignoring findings altogether. Both outcomes are
            harmful.
          </p>
          <p className="text-sm muted">
            The root cause of this noise is often how the scanner determines
            what software is actually present. There are two fundamentally
            different approaches: advisory matching based on file paths and
            heuristics, and installed-state scanning that reads the actual
            package manager databases.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Advisory Matching: The Heuristic Approach
          </h2>
          <p className="text-sm muted">
            Many scanners detect packages by scanning the filesystem for known
            file patterns. They look for lock files (package-lock.json,
            Gemfile.lock, go.sum), manifest files (pom.xml, requirements.txt),
            and file paths that suggest the presence of specific software.
            This approach is fast and works across many ecosystems, but it has
            significant limitations:
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>
              <strong>Intermediate layers</strong> -- In a multi-stage Docker
              build, a package might exist in an intermediate layer but not in
              the final image. File-based scanning of the full layer stack can
              detect packages that were removed before the final image was
              assembled.
            </li>
            <li>
              <strong>Build-time dependencies</strong> -- A requirements.txt
              file might list build-time dependencies that are not installed in
              the running container. Flagging these creates findings for
              software that is not actually present.
            </li>
            <li>
              <strong>Version ambiguity</strong> -- File path heuristics do not
              always correctly determine the installed version, especially when
              multiple versions coexist or when distribution patching changes
              the effective version.
            </li>
            <li>
              <strong>Name mismatches</strong> -- A file on disk might not
              correspond to the package the scanner thinks it does, especially
              for common library names that appear in multiple ecosystems.
            </li>
          </ul>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Installed-State Scanning: Reading the Source of Truth
          </h2>
          <p className="text-sm muted">
            The alternative is to read the actual package manager databases that
            exist inside the container. Every Linux distribution maintains a
            database of installed packages:
          </p>
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
            <ul className="list-disc pl-5 text-xs muted grid gap-1">
              <li><strong>RPM-based</strong> (RHEL, CentOS, Fedora, Rocky, Alma) -- <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1 py-0.5">/var/lib/rpm/Packages</code></li>
              <li><strong>APK-based</strong> (Alpine) -- <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1 py-0.5">/etc/apk/installed</code> or <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1 py-0.5">/lib/apk/db/installed</code></li>
              <li><strong>dpkg-based</strong> (Debian, Ubuntu) -- <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1 py-0.5">/var/lib/dpkg/status</code></li>
              <li><strong>pacman-based</strong> (Arch) -- <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1 py-0.5">/var/lib/pacman/local/</code></li>
            </ul>
          </div>
          <p className="text-sm muted">
            These databases are the authoritative record of what the package
            manager believes is installed. They include exact package names,
            versions, architectures, and dependency relationships. Reading them
            gives the scanner a ground-truth view of the software inventory.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Confidence Tiers: Classifying Finding Quality
          </h2>
          <p className="text-sm muted">
            ScanRook takes the installed-state approach further by classifying
            every finding into one of two confidence tiers:
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
              <h3 className="text-sm font-semibold">ConfirmedInstalled</h3>
              <p className="text-xs muted">
                The package was detected by reading an actual package manager
                database (RPM, APK, dpkg, etc.). The scanner has high
                confidence that this package is truly installed in the final
                artifact state.
              </p>
            </div>
            <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
              <h3 className="text-sm font-semibold">HeuristicUnverified</h3>
              <p className="text-xs muted">
                The package was detected via file path heuristics, manifest
                files, or other indirect methods. The finding may be valid but
                the scanner cannot confirm that the package is actually
                installed in the running state.
              </p>
            </div>
          </div>
          <p className="text-sm muted">
            This classification lets security teams make informed decisions.
            ConfirmedInstalled findings can be acted on with high confidence.
            HeuristicUnverified findings may warrant manual verification before
            remediation effort is invested.
          </p>
          <p className="text-sm muted">
            Learn more about confidence tiers in the{" "}
            <Link
              href="/docs/concepts/confidence-tiers"
              className="font-medium underline underline-offset-2"
            >
              confidence tiers documentation
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Why This Matters in Practice
          </h2>
          <p className="text-sm muted">
            Consider a multi-stage Docker build where the build stage installs
            development tools and compilers that are not copied to the
            production image. A scanner using file-path heuristics across all
            layers might flag vulnerabilities in those build tools, generating
            findings for software that does not exist in the deployed artifact.
          </p>
          <p className="text-sm muted">
            An installed-state scanner reads the package manager database in the
            final layer and finds only the packages that are actually present.
            The build-time tools are not in the database because they were
            never installed in the final image. The result is a cleaner, more
            accurate finding set that teams can trust and act on.
          </p>
        </section>

        <section className="grid gap-2">
          <h2 className="text-xl font-semibold tracking-tight">
            How ScanRook Implements This
          </h2>
          <p className="text-sm muted">
            ScanRook&apos;s container scanning pipeline works as follows:
          </p>
          <ol className="list-decimal pl-6 text-sm muted grid gap-1">
            <li>Extract all layers from the container tar, respecting layer ordering and whiteout files.</li>
            <li>Locate package manager databases in the extracted filesystem.</li>
            <li>Parse the databases to build the package inventory with exact names and versions.</li>
            <li>Enrich the inventory against OSV, NVD, EPSS, and CISA KEV.</li>
            <li>Classify each finding as ConfirmedInstalled or HeuristicUnverified based on the detection method.</li>
          </ol>
          <p className="text-sm muted">
            This pipeline supports RPM, APK, dpkg, npm, pip, Go modules, and
            several other ecosystems. For language-level packages where no
            system-level package manager database exists, ScanRook reads lock
            files and classifies those findings as HeuristicUnverified while
            still providing full enrichment.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Further Reading
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link className="btn-secondary" href="/docs/concepts/confidence-tiers">
              Confidence tiers
            </Link>
            <Link className="btn-secondary" href="/docs/concepts/enrichment">
              Enrichment docs
            </Link>
            <Link className="btn-secondary" href="/blog/container-scanning-best-practices">
              Container scanning
            </Link>
            <Link className="btn-secondary" href="/blog">
              Back to blog
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
