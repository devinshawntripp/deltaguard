import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-03";

const title = `NVD API Key: How to Get One and Why Scanners Need It | ${APP_NAME}`;
const description =
  "How to request and use an NVD API key: the rate limits with and without one, how to send it, and why vulnerability scanners need it for enrichment.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "nvd api key",
    "nvd api key request",
    "nvd api rate limit",
    "national vulnerability database api",
    "nvd api 2.0",
    "how to get nvd api key",
    "nvd cve api",
    "nvd api key header",
    "vulnerability scanner nvd",
    "nvd rate limit 30 seconds",
  ],
  alternates: { canonical: "/blog/nvd-api-key-guide" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/nvd-api-key-guide",
    images: ["/blog/nvd-api-key-guide.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/nvd-api-key-guide.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "NVD API Key: How to Get One and Why Scanners Need It",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/nvd-api-key-guide",
  image: "https://scanrook.io/blog/nvd-api-key-guide.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is an NVD API key?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An NVD API key is a free credential issued by NIST that raises the rate limit for the National Vulnerability Database REST APIs. Without a key you are limited to 5 requests per rolling 30-second window; with a key that rises to 50 requests per 30-second window. The key is a UUID-format string you send in the apiKey request header.",
      },
    },
    {
      "@type": "Question",
      name: "How do I get an NVD API key?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Request one from the NVD developers page at nvd.nist.gov/developers/request-an-api-key. You provide an email address and organization name, agree to the terms, and NIST emails you a single-use activation link. Activating it reveals your key. The process is free and usually takes only a few minutes.",
      },
    },
    {
      "@type": "Question",
      name: "Why do vulnerability scanners need an NVD API key?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Scanners that query or synchronize NVD data make many requests, and the unauthenticated limit of 5 requests per 30 seconds is roughly one request every 6 seconds, which makes a full sync painfully slow. A key raises the ceiling tenfold, so syncing the CVE dataset or enriching findings with CVSS and CPE data completes in a fraction of the time.",
      },
    },
    {
      "@type": "Question",
      name: "How do I send the NVD API key in a request?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Send it as an HTTP request header named apiKey, not as a URL query parameter. For example, curl -H 'apiKey: YOUR-KEY' against the CVE API 2.0 endpoint. Keep the key secret by storing it in an environment variable or secret manager rather than committing it to source control.",
      },
    },
    {
      "@type": "Question",
      name: "Does an API key remove the NVD rate limit entirely?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. It raises the limit to 50 requests per rolling 30-second window but does not remove it. NIST still recommends adding a small delay between requests and using pagination and incremental date filters to avoid hitting the ceiling. Well-behaved clients sleep between pages rather than firing requests as fast as possible.",
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
          <div className="text-xs uppercase tracking-wide muted">Data sources</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            NVD API Key: How to Get One and Why Scanners Need It
          </h1>
          <p className="text-sm muted">Published August 3, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            If your vulnerability scanner talks to the National Vulnerability Database and feels slow,
            an NVD API key is almost certainly the fix. It is free, takes minutes to get, and raises
            your rate limit tenfold. This guide covers how to request one, how to use it correctly,
            and why scanners lean on NVD data in the first place.
          </p>
        </header>

        <img
          src="/blog/nvd-api-key-guide.jpg"
          alt="Requesting and using an NVD API key for vulnerability scanning"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What the NVD API is</h2>
          <p className="text-sm muted">
            The National Vulnerability Database, run by NIST, publishes machine-readable REST APIs so
            tools can pull CVE data programmatically instead of scraping the website. The one most
            scanners use is the <strong>CVE API 2.0</strong> at{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">services.nvd.nist.gov/rest/json/cves/2.0</code>,
            with companion APIs for CPE product data and CVE change history. Each CVE record carries
            the enrichment that makes it actionable: a CVSS severity vector, CWE weakness
            classifications, and CPE identifiers naming the affected products and version ranges. We
            cover how that data is structured in{" "}
            <Link href="/blog/understanding-nvd-and-cvss" className="underline">
              Understanding the NVD and CVSS
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The rate limits, with and without a key</h2>
          <p className="text-sm muted">
            The API is public, but throttled. The limits are the whole reason the key matters:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Access</th>
                  <th className="text-left py-2 pr-4 font-semibold">Rate limit</th>
                  <th className="text-left py-2 font-semibold">Effective pace</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">No API key</td>
                  <td className="py-2 pr-4 align-top">5 requests / 30 seconds</td>
                  <td className="py-2 align-top">~1 request every 6 seconds</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">With API key</td>
                  <td className="py-2 pr-4 align-top">50 requests / 30 seconds</td>
                  <td className="py-2 align-top">~1 request every 0.6 seconds</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            Both limits are enforced over a <em>rolling</em> 30-second window, and each page of
            results counts as one request. Without a key, roughly one request every six seconds turns
            a sync of tens of thousands of CVEs into hours. The key is a tenfold increase, which is why
            NIST strongly recommends every automated consumer use one.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How to request a key</h2>
          <p className="text-sm muted">
            The whole process is free and self-service:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              Go to the NVD developers page at{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">nvd.nist.gov/developers/request-an-api-key</code>.
            </li>
            <li>Enter an email address and your organization name, and accept the terms of use.</li>
            <li>NIST emails you a single-use activation link &mdash; open it to reveal your key.</li>
            <li>The key is a UUID-format string. Store it somewhere secret, not in a repo.</li>
          </ul>
          <p className="text-sm muted">
            Activation links expire, so if you wait too long you simply request another. One key per
            organization is the norm; you do not need a separate key per developer or per pipeline.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How to use it</h2>
          <p className="text-sm muted">
            The key goes in an HTTP header named{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">apiKey</code>{" "}
            &mdash; not a query parameter. A single-CVE lookup looks like this:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`export NVD_API_KEY="your-uuid-key-here"

# Look up a single CVE
curl -s -H "apiKey: $NVD_API_KEY" \\
  "https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=CVE-2021-44228" \\
  | jq '.vulnerabilities[0].cve.id'`}</pre>
          <p className="text-sm muted">
            For bulk work, use pagination and incremental date filters instead of pulling everything
            every time. The API returns up to 2000 results per page; you page with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">startIndex</code>{" "}
            and fetch only what changed with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">lastModStartDate</code>{" "}
            and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">lastModEndDate</code>:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Fetch only CVEs modified in a date window, first page of 2000
curl -s -H "apiKey: $NVD_API_KEY" \\
  "https://services.nvd.nist.gov/rest/json/cves/2.0?\\
lastModStartDate=2026-07-01T00:00:00.000&\\
lastModEndDate=2026-07-08T00:00:00.000&\\
resultsPerPage=2000&startIndex=0"

# Then increment startIndex by 2000 for the next page,
# sleeping ~1s between requests to stay under the limit`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Best practices</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Keep it secret.</strong> Store the key in an environment variable or a secret
              manager and pass it at runtime. It is tied to your organization and should not sit in
              version control.
            </li>
            <li>
              <strong>Still throttle yourself.</strong> A key raises the ceiling but does not remove
              it. Sleep briefly between requests; NIST recommends being conservative even with a key.
            </li>
            <li>
              <strong>Sync incrementally.</strong> Pull the full dataset once, then use the
              last-modified date filters to fetch only changes. This is faster and far kinder to the
              API than re-downloading everything.
            </li>
            <li>
              <strong>Handle 403 and 503 gracefully.</strong> If you exceed the limit or the service is
              busy, back off and retry rather than hammering. A rolling window means a short pause
              usually clears the throttle.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why scanners need NVD data at all</h2>
          <p className="text-sm muted">
            NVD is one of the foundational enrichment sources in vulnerability scanning. Its CPE data
            is what lets a scanner decide programmatically whether your package at your version is
            affected by a given CVE, and its CVSS scores feed every severity gate and dashboard
            downstream. A scanner that wants fresh NVD data either queries the API live during a scan
            or synchronizes the dataset into a local database it can match against quickly &mdash; and
            both approaches run straight into the rate limit without a key.
          </p>
          <p className="text-sm muted">
            NVD is not the only source, and it should not be the only one. Its 2024 enrichment slowdown
            &mdash; the subject of{" "}
            <Link href="/blog/nvd-backlog-explained" className="underline">
              the NVD backlog explained
            </Link>{" "}
            &mdash; showed why relying on a single database is fragile. The strongest scanners combine
            NVD with OSV, GHSA, and vendor advisory feeds, which is the whole point of our{" "}
            <Link href="/blog/cve-database-comparison" className="underline">
              CVE database comparison
            </Link>{" "}
            and the head-to-head in{" "}
            <Link href="/blog/osv-vs-nvd" className="underline">
              OSV vs NVD
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook uses NVD as one of several parallel sources, matching packages against OSV, NVD
            (via CPE matching), and Red Hat OVAL on every scan. Configuring an NVD API key raises the
            throughput of that NVD path and speeds the local vulnerability-database sync, so cold
            scans are no longer bottlenecked by the unauthenticated six-second pace. Because ScanRook
            never depends on NVD alone, a temporary NVD hiccup does not blind the scan &mdash; the
            other sources keep matching, and every finding is tagged with which source it came from.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is the NVD API key free?</h3>
              <p className="text-sm muted mt-1">
                Yes. NIST issues API keys at no cost through a short self-service request. There is no
                paid tier &mdash; the key exists to raise your rate limit, not to charge for access.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How long does approval take?</h3>
              <p className="text-sm muted mt-1">
                Usually minutes. You receive an activation email right after requesting, and clicking
                the link reveals the key immediately. If the link expires before you use it, just
                request another.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Do I put the key in the URL?</h3>
              <p className="text-sm muted mt-1">
                No. Send it in the apiKey request header. Putting credentials in a URL risks leaking
                them into logs and proxies, and the NVD API expects the header form.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can multiple tools share one key?</h3>
              <p className="text-sm muted mt-1">
                They can, but the rate limit is per key, so several busy clients sharing one key will
                collectively hit the 50-per-30-seconds ceiling. Stagger their schedules or coordinate
                a single sync that other tools read from.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan with more than one source of truth</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook matches every package against OSV, NVD, and Red Hat OVAL in parallel, so your
            findings never depend on a single database &mdash; and an NVD API key simply makes the NVD
            path faster. Every finding shows exactly which source it came from.
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
            <Link href="/blog/understanding-nvd-and-cvss" className="underline">
              Understanding the NVD and CVSS
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/nvd-backlog-explained" className="underline">
              The NVD Backlog, Explained
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/cve-database-comparison" className="underline">
              CVE Database Comparison
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
