import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-20";

const title = `Is the MySQL Docker Image Safe? What Our Scanner Found | ${APP_NAME}`;
const description =
  "We scanned mysql:9 with ScanRook: only 2 findings surfaced, but the scan was partial. Why that undercounts reality, the CVEs it found, and what to check next.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "is mysql docker image safe",
    "mysql docker image vulnerabilities",
    "mysql docker cve",
    "mysql:9 vulnerabilities",
    "mysql container security",
    "mysql image scan",
    "mysql docker security best practices",
    "mysql vulnerability scan",
    "mysql cpu security patches",
    "mysql docker hardening",
  ],
  alternates: { canonical: "/blog/is-mysql-docker-image-safe" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/is-mysql-docker-image-safe",
    images: ["/blog/series-image-safety-3.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/series-image-safety-3.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Is the MySQL Docker Image Safe? What Our Scanner Found",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/is-mysql-docker-image-safe",
  image: "https://scanrook.io/blog/series-image-safety-3.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is the mysql Docker image safe to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Likely, but our scan of mysql:9 can't tell you that on its own. It surfaced only 2 findings because the runtime package inventory wasn't fully readable and the scan fell back to heuristics — a low number here reflects scan coverage, not necessarily a clean image. Cross-check against Oracle's own advisories before concluding the image is low-risk.",
      },
    },
    {
      "@type": "Question",
      name: "Why did the mysql Docker image scan return so few findings?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The scan of mysql:9 was partial: runtime inventory was unavailable, so ScanRook fell back to heuristic matching instead of reading the package manager database directly. Heuristic scans typically undercount compared to full installed-state scans, which is why we're flagging this result rather than presenting it at face value.",
      },
    },
    {
      "@type": "Question",
      name: "What CVEs did the scan find in the mysql image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The scan surfaced CVE-2009-2942 (high severity) and CVE-2017-12419 (medium severity), both against the mysql package itself. Given the partial scan, these should be treated as a starting point, not a complete picture of the image's exposure.",
      },
    },
    {
      "@type": "Question",
      name: "How should I properly assess mysql Docker image security?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Run a scan with full runtime inventory access rather than a heuristic fallback, and separately check Oracle's quarterly Critical Patch Update release notes for the MySQL versions you run — CPUs cover server-level fixes that a package-based scan alone may not fully capture.",
      },
    },
    {
      "@type": "Question",
      name: "How do I scan the mysql Docker image for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Export the image with docker save, then scan the tar with a tool that can read the container's installed package database directly. With ScanRook: install the CLI, run docker save mysql:9 -o mysql.tar, then scanrook scan mysql.tar.",
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
          <div className="text-xs uppercase tracking-wide muted">Security Concepts</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Is the MySQL Docker Image Safe? What Our Scanner Found
          </h1>
          <p className="text-sm muted">Published July 20, 2026 &middot; 5 min read</p>
          <p className="text-sm muted">
            &ldquo;Is the mysql Docker image safe&rdquo; deserves an honest answer, and honesty here
            means admitting our own scan came back with a result we don&apos;t fully trust. We
            scanned{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">mysql:9</code>{" "}
            with ScanRook and want to walk through exactly why that matters.
          </p>
        </header>

        <img
          src="/blog/series-image-safety-3.jpg"
          alt="Is the mysql Docker image safe — container image safety series"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-2">
          <h2 className="text-sm font-semibold">The verdict</h2>
          <p className="text-sm muted leading-relaxed">
            We don&apos;t have a confident yes or no to give you from this scan alone, and we think
            saying so is more useful than presenting a reassuring number that might not be real.
            Our scan of mysql:9 returned just 2 findings, but the run was partial &mdash; the
            container&apos;s runtime package inventory wasn&apos;t fully readable, so ScanRook fell
            back to heuristic matching rather than reading the package manager database directly.
            A low count from a partial scan is not the same as a low-risk image. Treat this as a
            starting point and supplement it with Oracle&apos;s own advisory data before drawing
            conclusions.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What we found scanning mysql:9</h2>
          <p className="text-sm muted">
            We exported the image with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker save</code>{" "}
            and scanned it with ScanRook. Here is exactly what came back:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Tag</th>
                  <th className="text-left py-2 pr-4 font-semibold">Total</th>
                  <th className="text-left py-2 pr-4 font-semibold">Critical</th>
                  <th className="text-left py-2 pr-4 font-semibold">High</th>
                  <th className="text-left py-2 pr-4 font-semibold">Medium</th>
                  <th className="text-left py-2 font-semibold">Low</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr>
                  <td className="py-2 pr-4 text-xs font-mono">mysql:9</td>
                  <td className="py-2 pr-4">2</td>
                  <td className="py-2 pr-4">0</td>
                  <td className="py-2 pr-4">1</td>
                  <td className="py-2 pr-4">1</td>
                  <td className="py-2">0</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ScanRook v1.14.2, warm-cache scan, 2026-07-04 &mdash; runtime inventory unavailable for
            this image, heuristic matching only. Counts here should be treated as a floor, not a
            complete picture, and change as new advisories publish.
          </p>
          <p className="text-sm muted">
            We are calling this out explicitly rather than reporting &ldquo;2 findings&rdquo; as
            good news, because it isn&apos;t necessarily that. Heuristic matching (checking file
            paths and version strings against known-vulnerable patterns) reliably finds less than
            reading a package manager&apos;s installed-state database directly. If you run this
            scan yourself with full inventory access, expect the count to be higher.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The CVEs the scan did find</h2>
          <p className="text-sm muted">
            Both findings are against the mysql package itself, not the surrounding base image:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>CVE-2009-2942 (high).</strong> An older MySQL server advisory. Verify against
              your specific mysql:9 build and Oracle&apos;s current advisory status rather than
              assuming it&apos;s unpatched based on the CVE date alone.
            </li>
            <li>
              <strong>CVE-2017-12419 (medium).</strong> Another MySQL server-level advisory
              affecting a specific version range. As with the finding above, confirm current
              patch status directly rather than relying on this scan result in isolation.
            </li>
          </ul>
          <p className="text-sm muted">
            Because this scan couldn&apos;t read the full installed-package state, it likely missed
            findings elsewhere in the image. Oracle publishes a quarterly Critical Patch Update that
            addresses MySQL server vulnerabilities on its own release cadence, separate from
            container base image packaging &mdash; check the current CPU release notes for the
            MySQL version you actually run rather than relying solely on a single scan result. Our
            explainer on{" "}
            <Link href="/blog/epss-vulnerability-prioritization" className="underline">
              prioritizing vulnerabilities by exploit probability
            </Link>{" "}
            is a useful companion once you have a fuller finding list to triage.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Getting a complete picture</h2>
          <p className="text-sm muted">
            The practical fix for a partial scan result is straightforward: re-scan with a tool
            configured to read the container&apos;s package manager state directly rather than
            falling back to heuristics, and confirm the scanning environment has the access it
            needs to do that. If you maintain the mysql:9 image build yourself, verify the package
            manager database is present and intact in the exported layer.
          </p>
          <p className="text-sm muted">
            In parallel, treat vendor advisories as a second source of truth rather than a
            scanner substitute. For a database engine specifically, that means Oracle&apos;s MySQL
            security advisories, not just OSV or NVD package matches. The full CLI reference for
            configuring deeper scans, including JSON output and severity gating for CI, is in{" "}
            <Link href="/docs" className="underline">the docs</Link>.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Hardening checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Don&apos;t treat a low finding count from a partial scan as evidence of a clean image &mdash; re-scan with full inventory access.</li>
            <li>
              Check Oracle&apos;s quarterly Critical Patch Update notes for your specific MySQL
              version, and cross-reference against{" "}
              <Link href="/blog/cisa-kev-guide" className="underline">
                CISA&apos;s Known Exploited Vulnerabilities catalog
              </Link>{" "}
              so you prioritize what&apos;s actually being exploited even when scan coverage is
              incomplete.
            </li>
            <li>Store credentials via <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">MYSQL_PASSWORD_FILE</code> or a secrets manager instead of plain environment variables.</li>
            <li>Bind MySQL to an internal network only; never publish port 3306 to the public internet.</li>
            <li>
              Pin the image by digest (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">mysql@sha256:&hellip;</code>)
              so deploys are reproducible.
            </li>
            <li>Rebuild and redeploy on a schedule so base image and server patches actually reach you.</li>
            <li>Scan every build in CI, and alert if a scan falls back to partial/heuristic mode.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scan it yourself</h2>
          <p className="text-sm muted">
            Results drift as new advisories publish and scan coverage improves, so verify against
            the exact tag and digest you deploy:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`curl -fsSL https://scanrook.io/install.sh | sh
docker save mysql:9 -o mysql.tar
scanrook scan mysql.tar`}</pre>
          <p className="text-sm muted">
            If the CLI reports a partial or heuristic-only scan, treat the result the same way we
            treated ours here &mdash; as a floor, not a final answer.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is the mysql Docker image safe to use?</h3>
              <p className="text-sm muted mt-1">
                Likely, but our own scan can&apos;t confirm it — it returned just 2 findings from a
                partial, heuristic-only run. Cross-check with Oracle&apos;s advisories before
                concluding the image is low-risk.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why did the scan return so few findings?</h3>
              <p className="text-sm muted mt-1">
                Runtime inventory was unavailable, so the scan fell back to heuristic matching,
                which typically undercounts compared to reading the package database directly.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What CVEs did the scan find?</h3>
              <p className="text-sm muted mt-1">
                CVE-2009-2942 (high) and CVE-2017-12419 (medium), both against the mysql package
                itself — treat these as a starting point, not a complete list.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How should I properly assess this image?</h3>
              <p className="text-sm muted mt-1">
                Re-scan with full package-inventory access, and separately check Oracle&apos;s
                quarterly Critical Patch Update notes for the MySQL version you run.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan your mysql image with ScanRook</h3>
          <p className="text-sm muted leading-relaxed">
            Upload your image tar or scan from the CLI and ScanRook matches every installed package
            against OSV, NVD, and vendor advisory data &mdash; with severity, exploit-probability,
            and confidence tiers so you can separate real runtime risk from build-time noise.
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
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              How to Scan a Docker Image for Vulnerabilities
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              Container Image Security Checklist
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/trivy-alternatives" className="underline">
              Trivy Alternatives in 2026
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
