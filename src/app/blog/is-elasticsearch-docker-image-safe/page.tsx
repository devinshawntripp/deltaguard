import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-11";

const title = `Is the Elasticsearch Docker Image Safe? What Our Scanner Found | ${APP_NAME}`;
const description =
  "We scanned elasticsearch:9.0.3 with ScanRook: 50 findings (4 critical) from a partial heuristic scan. What that means and which CVEs actually matter.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "is elasticsearch docker image safe",
    "elasticsearch docker image vulnerabilities",
    "elasticsearch:9.0.3 cve",
    "elasticsearch docker security",
    "elasticsearch container security",
    "elasticsearch image scan",
    "elasticsearch exposed port security",
    "elasticsearch docker best practices",
    "elasticsearch security features",
    "elasticsearch old cve false positive",
  ],
  alternates: { canonical: "/blog/is-elasticsearch-docker-image-safe" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/is-elasticsearch-docker-image-safe",
    images: ["/blog/series-image-safety-4.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/series-image-safety-4.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Is the Elasticsearch Docker Image Safe? What Our Scanner Found",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/is-elasticsearch-docker-image-safe",
  image: "https://scanrook.io/blog/series-image-safety-4.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is the Elasticsearch Docker image safe to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Broadly yes, and the low finding count in our scan reflects a genuinely maintained image, but our scan was also partial (heuristic-only, runtime inventory unavailable), so treat the count as a lower bound. Elasticsearch's security team ships built-in authentication and TLS by default in modern versions — the bigger practical risk is disabling those defaults, not the image's package findings.",
      },
    },
    {
      "@type": "Question",
      name: "Why do old CVEs from 2015-2020 show up against elasticsearch:9.0.3?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our scan of elasticsearch:9.0.3 surfaced several critical advisories dated 2015 to 2020 directly against the elasticsearch package. Because this was a partial, heuristic-only scan, these are very likely stale version-range matches rather than confirmed issues in a 2026-era release — all were fixed in Elasticsearch versions released long before 9.0.3 shipped.",
      },
    },
    {
      "@type": "Question",
      name: "Why was the elasticsearch scan partial?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Elasticsearch's runtime inventory was not fully visible to heuristic-only analysis in this scan, so the 50 findings we recorded understate what a full installed-state scan would show. Supplement with Elastic's own published security advisories for your exact version before drawing conclusions from this count alone.",
      },
    },
    {
      "@type": "Question",
      name: "Should Elasticsearch ever be exposed directly to the internet?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Elasticsearch should sit on an internal network behind your application layer, with its built-in security features (authentication, TLS, role-based access) enabled. Historically, publicly exposed, unauthenticated Elasticsearch clusters have been a common source of real-world data exposure incidents, independent of any specific CVE.",
      },
    },
    {
      "@type": "Question",
      name: "How do I scan the Elasticsearch Docker image for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Export the image with docker save, then run a scanner against it. With ScanRook: install the CLI, run docker save elasticsearch:9.0.3 -o es.tar, then scanrook scan es.tar. For a datastore like Elasticsearch, also cross-check Elastic's own security advisories directly given the limits of heuristic package scanning.",
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
            Is the Elasticsearch Docker Image Safe? What Our Scanner Found
          </h1>
          <p className="text-sm muted">Published August 11, 2026 &middot; 6 min read</p>
          <p className="text-sm muted">
            Elasticsearch clusters often hold an organization&apos;s most searchable data, so
            &ldquo;is the Elasticsearch Docker image safe&rdquo; deserves a careful answer. We
            scanned{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">elasticsearch:9.0.3</code>{" "}
            with ScanRook and looked closely at what a low finding count from a partial scan actually
            tells you.
          </p>
        </header>

        <img
          src="/blog/series-image-safety-4.jpg"
          alt="Is the Elasticsearch Docker image safe — container image safety series"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-2">
          <h2 className="text-sm font-semibold">The verdict</h2>
          <p className="text-sm muted leading-relaxed">
            Broadly yes. Elasticsearch ships built-in security &mdash; authentication, TLS, and
            role-based access control &mdash; enabled by default in modern versions, and the project
            has a dedicated security team with a public advisory process. Our scan found only 50
            findings, but it was a partial, heuristic-only scan, so treat that as a lower bound rather
            than a clean bill of health. The practical risk with Elasticsearch has historically been
            operational: disabling built-in auth or exposing a cluster directly to the internet, not
            the image&apos;s package contents.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What we found scanning elasticsearch:9.0.3</h2>
          <p className="text-sm muted">
            We exported the image with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker save</code>{" "}
            and scanned it with ScanRook, which matches every installed package against OSV, NVD,
            and vendor advisory data:
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
                  <td className="py-2 pr-4 text-xs font-mono">elasticsearch:9.0.3</td>
                  <td className="py-2 pr-4">50</td>
                  <td className="py-2 pr-4">4</td>
                  <td className="py-2 pr-4">17</td>
                  <td className="py-2 pr-4">28</td>
                  <td className="py-2">1</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ScanRook v1.14.2, warm-cache scan, 2026-07-04. This scan was partial: runtime inventory
            was unavailable, so heuristics-only analysis was used and counts understate reality.
            Counts also change as new advisories publish.
          </p>
          <p className="text-sm muted">
            A 50-finding total looks reassuring next to the language-runtime images in this series,
            and Elasticsearch genuinely is a well-maintained, actively patched product. But we want to
            be upfront that this specific scan could not fully enumerate the runtime package
            inventory, so we are supplementing the raw count with more context below rather than
            presenting it as a complete picture.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The CVEs worth knowing about</h2>
          <p className="text-sm muted">
            The critical findings in our scan were flagged directly against the elasticsearch package
            itself, all dated well before the 9.0.3 release:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>CVE-2015-1427</strong> &mdash; an advisory from Elasticsearch&apos;s Groovy
              scripting engine era, roughly a decade old. Fixed in Elasticsearch versions released
              long before 9.0.3.
            </li>
            <li>
              <strong>CVE-2017-12629</strong> &mdash; an advisory associated with older Elasticsearch
              versions&apos; search API behavior, also fixed years before the current release line.
            </li>
            <li>
              <strong>CVE-2015-5377</strong> &mdash; another mid-2010s advisory, superseded by
              multiple major version upgrades since.
            </li>
            <li>
              <strong>CVE-2020-15097</strong> &mdash; a more recent but still multi-year-old advisory,
              fixed in the corresponding release at the time.
            </li>
          </ul>
          <p className="text-sm muted">
            Given that our scan was heuristic and partial, these version-range matches against
            elasticsearch:9.0.3 read as stale advisory matches rather than live findings &mdash; each
            was fixed in a release long superseded by 9.0.3. This is exactly the scenario our guide to{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs. advisory matching
            </Link>{" "}
            warns about: version-range heuristics can flag advisories that do not actually apply to
            your installed build.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which tag should you use?</h2>
          <p className="text-sm muted">
            We do not have alternate-tag scan data for Elasticsearch to compare against, and the
            official image does not offer a dramatically different Alpine-style variant the way web
            servers and language runtimes do. The more consequential decision for Elasticsearch is
            version and configuration, not base-image flavor: stay on a currently supported major
            version, and consult Elastic&apos;s own published security advisories directly for the
            exact release you run, since they track application-level issues a container scan cannot
            see.
          </p>
          <p className="text-sm muted">
            For the general tradeoffs between base image families across the images in this series,
            see{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Hardening checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Never expose port 9200 (or the transport port 9300) directly to the public internet.</li>
            <li>Keep built-in security features enabled &mdash; authentication, TLS, and role-based access control ship by default in modern versions; do not disable them for convenience.</li>
            <li>Size the JVM heap correctly (typically half of available RAM, capped well under 32GB) to avoid out-of-memory failures under load.</li>
            <li>Run as the non-root elasticsearch user the official image already defines.</li>
            <li>Pin the image by digest so deploys are reproducible.</li>
            <li>Rebuild and redeploy on a schedule, and cross-check Elastic&apos;s security advisories directly given the limits of heuristic package scanning.</li>
            <li>Restrict dynamic scripting to only what your application actually requires.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scan it yourself</h2>
          <p className="text-sm muted">
            Counts drift as new advisories publish, so verify against the exact tag and digest you
            deploy, and supplement with a manual check against Elastic&apos;s published advisories:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`curl -fsSL https://scanrook.io/install.sh | sh
docker save elasticsearch:9.0.3 -o es.tar
scanrook scan es.tar`}</pre>
          <p className="text-sm muted">
            The full CLI reference, including JSON output and severity gating for CI, is in{" "}
            <Link href="/docs" className="underline">the docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is the Elasticsearch Docker image safe to use?</h3>
              <p className="text-sm muted mt-1">
                Broadly yes, with built-in security enabled by default in modern versions. Our scan
                was partial, so treat the 50-finding count as a lower bound, not a complete result.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why do old CVEs show up against 9.0.3?</h3>
              <p className="text-sm muted mt-1">
                They are likely stale version-range matches from a heuristic scan — all were fixed in
                Elasticsearch releases years before 9.0.3 shipped.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why was the scan partial?</h3>
              <p className="text-sm muted mt-1">
                Runtime inventory was not fully visible to heuristic-only analysis. Supplement with
                Elastic&apos;s own security advisories for your exact version.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should Elasticsearch be internet-facing?</h3>
              <p className="text-sm muted mt-1">
                No. Keep it on an internal network behind your application layer with built-in
                authentication and TLS enabled — publicly exposed clusters have historically been a
                common exposure source.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan your Elasticsearch image with ScanRook</h3>
          <p className="text-sm muted leading-relaxed">
            Upload your image tar or scan from the CLI and ScanRook matches every installed package
            against OSV, NVD, and vendor advisory data &mdash; with severity, exploit-probability,
            and confidence tiers, and clear reporting when a scan is partial rather than complete.
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
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              Installed-State Scanning vs. Advisory Matching
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/on-prem-vs-saas-scanning" className="underline">
              On-Prem vs SaaS Vulnerability Scanning
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              Container Image Security Checklist
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
