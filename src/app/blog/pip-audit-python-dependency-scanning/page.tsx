import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-30";

const title = `pip-audit: Scanning Python Dependencies for Vulnerabilities | ${APP_NAME}`;
const description =
  "pip-audit scans your Python dependencies for known CVEs using PyPI and OSV advisory data. How the tool works, what it misses, and where ScanRook fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "pip audit",
    "pip-audit",
    "pip audit python",
    "python dependency scanning",
    "scan python dependencies for vulnerabilities",
    "audit requirements.txt",
    "python vulnerability scanner",
    "pip-audit vs safety",
    "pyup safety alternative",
    "python cve scanner",
  ],
  alternates: { canonical: "/blog/pip-audit-python-dependency-scanning" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/pip-audit-python-dependency-scanning",
    images: ["/blog/pip-audit-python-dependency-scanning.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/pip-audit-python-dependency-scanning.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "pip-audit: Scanning Python Dependencies for Vulnerabilities",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/pip-audit-python-dependency-scanning",
  image: "https://scanrook.io/blog/pip-audit-python-dependency-scanning.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is pip-audit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "pip-audit is an open-source command-line tool maintained by the Python Packaging Authority (PyPA) that scans Python packages for known vulnerabilities. It audits the packages installed in a virtual environment or listed in a requirements file, matches them against published advisories, and reports the affected versions and the versions that fix each issue.",
      },
    },
    {
      "@type": "Question",
      name: "What data does pip-audit use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "By default pip-audit queries the PyPI JSON API, which surfaces the Python Packaging Advisory Database (PYSEC) and GitHub Security Advisories. You can switch it to the OSV API with --vulnerability-service osv. Both are backed by the same open advisory ecosystem, so coverage of PyPI packages is broadly similar.",
      },
    },
    {
      "@type": "Question",
      name: "Does pip-audit scan the operating system?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. pip-audit only covers Python packages from PyPI. It does not look at OS packages such as OpenSSL, glibc, or curl, and it does not inspect other language ecosystems. To find vulnerabilities in the whole shipped artifact you need a scanner that also reads the OS package database.",
      },
    },
    {
      "@type": "Question",
      name: "Is pip-audit the same as Safety?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No, but they overlap. Both audit Python dependencies. pip-audit is a PyPA project that reads open advisory data and can also emit a CycloneDX SBOM. Safety is a separate tool with a commercial database tier. Either works in CI; pip-audit is a common choice because it is free and uses public advisory sources.",
      },
    },
    {
      "@type": "Question",
      name: "How is scanning a container image different from pip-audit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "pip-audit audits your declared or installed dependencies at build time. Scanning the built image inspects what actually shipped, including Python packages the base image installed, packages added through the OS package manager, and the OS libraries pip-audit never sees. The two answer related but different questions.",
      },
    },
  ],
};

export default function Page() {
  if (!isPublished({ publishDate: PUBLISH_DATE })) notFound();
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 grid gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article className="surface-card p-8 grid gap-6">
        <header className="grid gap-3">
          <div className="text-xs uppercase tracking-wide muted">Scanning concepts</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            pip-audit: Scanning Python Dependencies for Vulnerabilities
          </h1>
          <p className="text-sm muted">Published August 30, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            If your project ships Python, <strong>pip audit</strong> is one of the simplest ways to
            find known-vulnerable dependencies before they reach production. It is free, maintained
            by the Python Packaging Authority, and slots into CI in a single command. Here is how it
            works, what it can and cannot see, and how it fits alongside scanning the container image
            you actually deploy.
          </p>
        </header>

        <img
          src="/blog/pip-audit-python-dependency-scanning.jpg"
          alt="pip-audit scanning Python dependencies for known vulnerabilities"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What pip-audit is</h2>
          <p className="text-sm muted">
            pip-audit is an open-source command-line tool maintained by the{" "}
            <abbr title="Python Packaging Authority">PyPA</abbr>. It was originally built by Trail of
            Bits with support from Google and later adopted as an official packaging project. Its job
            is narrow and useful: take the set of Python packages present in an environment or listed
            in a requirements file, look each one up in a vulnerability database, and tell you which
            installed versions have known advisories and which version fixes them.
          </p>
          <p className="text-sm muted">
            Because it is a first-party PyPA tool, it understands Python packaging conventions
            correctly. It reads installed distributions through <code>importlib.metadata</code>, it
            can resolve a requirements file the same way pip does, and it can emit a CycloneDX SBOM of
            what it audited. That makes it a natural fit for the inner loop of Python development and
            for a dependency-audit step in CI.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How pip-audit finds vulnerabilities</h2>
          <p className="text-sm muted">
            Under the hood, pip-audit does two things: it works out the exact set of packages and
            versions to audit, then it queries a vulnerability service for each one. By default the
            service is the PyPI JSON API, which surfaces advisories from the Python Packaging Advisory
            Database (the PYSEC records) and GitHub Security Advisories (GHSA). You can point it at the{" "}
            <Link href="/blog/what-is-osv" className="underline">
              OSV API
            </Link>{" "}
            instead with <code>--vulnerability-service osv</code>; both draw on the same open advisory
            ecosystem, so the results are broadly comparable for PyPI packages.
          </p>
          <p className="text-sm muted">
            The matching is version-range based. Each advisory declares the affected version ranges
            and the first fixed version for a package, and pip-audit checks whether your resolved
            version falls inside a vulnerable range. It does not perform reachability analysis, so a
            finding means &ldquo;this package version has a known advisory,&rdquo; not &ldquo;your
            code calls the vulnerable function.&rdquo; That is the same trade-off almost every
            dependency auditor makes, and it is why triage still matters after the scan.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Running pip-audit</h2>
          <p className="text-sm muted">
            The zero-argument form audits the active virtual environment &mdash; whatever is actually
            installed:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`pip install pip-audit
pip-audit`}</pre>
          <p className="text-sm muted">
            To audit a requirements file instead, pass <code>-r</code>. pip-audit resolves the file
            the way pip would, including transitive dependencies, and audits the resolved set:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`pip-audit -r requirements.txt

# machine-readable output for CI
pip-audit -r requirements.txt --format json

# emit a CycloneDX SBOM of what was audited
pip-audit -r requirements.txt --format cyclonedx-json --output sbom.json`}</pre>
          <p className="text-sm muted">
            pip-audit exits non-zero when it finds anything, so a bare invocation already fails a CI
            job on any advisory. It can also attempt remediation: <code>--fix</code> upgrades
            vulnerable packages to the first fixed version it can resolve.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# preview and then apply fixes
pip-audit -r requirements.txt --fix --dry-run
pip-audit -r requirements.txt --fix`}</pre>
          <p className="text-sm muted">
            Treat <code>--fix</code> as a starting point, not a rubber stamp: bumping a pinned
            dependency can change behavior, so run your tests afterward.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What pip-audit sees &mdash; and what it misses</h2>
          <p className="text-sm muted">
            pip-audit is precise about the thing it audits, which is exactly why it is worth being
            clear about that scope. It covers Python packages from PyPI and nothing else. It has no
            view of OS packages &mdash; the OpenSSL, glibc, zlib, and curl that live in your base
            image &mdash; and no view of other language ecosystems that might share the container.
            If a critical CVE lands in the system OpenSSL, pip-audit will not mention it.
          </p>
          <p className="text-sm muted">
            The subtler gap is <em>what</em> it audits. When you run pip-audit against
            <code> requirements.txt</code>, it audits the dependencies you declared and can resolve.
            The image you actually ship can differ: the base image may pre-install Python packages
            through the OS package manager (an <code>apt install python3-requests</code> lands a
            distro-packaged copy pip-audit never inspected), a build step may install extras, or an
            unpinned range may resolve to a different version at build time than it did on your
            laptop. This is the same declared-versus-installed distinction we cover in{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs. advisory matching
            </Link>{" "}
            &mdash; auditing the manifest and auditing the artifact are related, but not the same
            question.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook comes at the problem from the other end. Instead of auditing a manifest, it
            scans the built artifact &mdash; a container image tarball or a source tree &mdash; and
            enumerates what is genuinely present. For Python that means reading the
            <code> .dist-info</code> and <code>.egg-info</code> metadata of every installed
            distribution in the image, so it sees the packages that actually shipped regardless of
            which requirements file (if any) produced them. At the same time it reads the OS package
            database (dpkg, rpm, or apk) and other language manifests, then cross-references every
            component against OSV, NVD, and GHSA, with Red Hat OVAL for RHEL-family images.
          </p>
          <p className="text-sm muted">
            The practical payoff is coverage of the layers pip-audit cannot reach: the system
            libraries, the distro-packaged Python modules, and any dependency that slipped into the
            image without going through your pinned requirements. If you want to see how much of a
            typical Python image lives outside your <code>requirements.txt</code>, our teardown of the{" "}
            <Link href="/blog/is-python-docker-image-safe" className="underline">
              official Python Docker image
            </Link>{" "}
            walks through the real numbers.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Using pip-audit and ScanRook together</h2>
          <p className="text-sm muted">
            These tools are complementary, and the strongest setup runs both. Keep pip-audit in the
            inner loop and in CI, pinned to your requirements: it is fast, it can auto-fix, and it
            gives Python developers a signal in the language and tooling they already use. Then scan
            the final image with ScanRook before it ships, so the OS layer and anything that entered
            the image outside your manifest gets checked too. pip-audit answers &ldquo;are my declared
            Python dependencies clean?&rdquo; ScanRook answers &ldquo;is the thing I am about to
            deploy clean?&rdquo; You want yes to both.
          </p>
          <p className="text-sm muted">
            A simple division of labor: fail the build early on pip-audit for a tight,
            developer-facing loop, and gate the release on a full image scan for defense in depth. If
            you are wiring this into a pipeline, the ScanRook{" "}
            <Link href="/docs" className="underline">
              docs
            </Link>{" "}
            cover the CLI and CI recipes, and the{" "}
            <Link href="/pricing" className="underline">
              pricing page
            </Link>{" "}
            lays out which plan tiers include the enrichment sources.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is pip-audit?</h3>
              <p className="text-sm muted mt-1">
                A PyPA command-line tool that scans the Python packages in an environment or
                requirements file against known advisories and reports affected and fixed versions.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What data does pip-audit use?</h3>
              <p className="text-sm muted mt-1">
                By default the PyPI JSON API, which surfaces PYSEC and GHSA advisories. It can also
                query OSV with <code>--vulnerability-service osv</code>.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does pip-audit scan the operating system?</h3>
              <p className="text-sm muted mt-1">
                No. It only covers Python packages from PyPI, not OS libraries like OpenSSL or glibc
                and not other language ecosystems.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is pip-audit the same as Safety?</h3>
              <p className="text-sm muted mt-1">
                They overlap but differ. pip-audit is a free PyPA tool using open advisory data;
                Safety is a separate tool with a commercial database tier.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan the image, not just the manifest</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook reads the Python packages and OS libraries that actually ship in your image and
            cross-references OSV, NVD, and GHSA &mdash; so nothing slips through just because it was
            not in your <code>requirements.txt</code>.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--dg-accent,#2563eb)] text-white px-4 py-2 text-sm font-medium"
            >
              Start scanning
            </Link>
            <Link href="/docs" className="btn-secondary">Read the docs</Link>
          </div>
        </section>

        <footer className="border-t border-black/10 dark:border-white/10 pt-4 text-xs muted grid gap-2">
          <p>
            <strong>Related reading:</strong>{" "}
            <Link href="/blog/is-python-docker-image-safe" className="underline">
              Is the Python Docker Image Safe?
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              Installed-State Scanning vs. Advisory Matching
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-osv" className="underline">
              What Is the OSV API?
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
