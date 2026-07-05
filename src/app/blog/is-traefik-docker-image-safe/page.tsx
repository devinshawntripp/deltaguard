import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-07";

const title = `Is the Traefik Docker Image Safe? What Our Scanner Found | ${APP_NAME}`;
const description =
  "We scanned traefik:v3.3 with ScanRook: 299 findings (22 critical). What that means, which CVEs matter, and why almost all of them come from Alpine.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "is traefik docker image safe",
    "traefik docker image vulnerabilities",
    "traefik:v3.3 cve",
    "traefik docker security",
    "traefik container security",
    "traefik image scan",
    "traefik dashboard security",
    "traefik docker best practices",
    "traefik alpine base image",
    "traefik api insecure",
  ],
  alternates: { canonical: "/blog/is-traefik-docker-image-safe" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/is-traefik-docker-image-safe",
    images: ["/blog/series-image-safety-2.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/series-image-safety-2.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Is the Traefik Docker Image Safe? What Our Scanner Found",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/is-traefik-docker-image-safe",
  image: "https://scanrook.io/blog/series-image-safety-2.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is the Traefik Docker image safe to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Broadly yes. Traefik is actively maintained and already ships on a minimal Alpine base, which is why our scan found a relatively low 299 findings. The practical risks are configuration-level: leaving the API or dashboard exposed insecurely, rather than anything in the image itself.",
      },
    },
    {
      "@type": "Question",
      name: "Why does the Traefik image have any vulnerabilities at all if it's Alpine-based?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Alpine is small, not zero. Our separate scan of alpine:3.20 itself found 301 findings (20 critical) — almost identical to traefik:v3.3's 299 (22 critical) — which confirms nearly all of Traefik's findings come from its Alpine base layer, not the Traefik binary.",
      },
    },
    {
      "@type": "Question",
      name: "Is Traefik's insecure API mode a vulnerability?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It is a configuration risk, not a CVE. Setting api.insecure=true exposes the dashboard and API without authentication. It's intended for local debugging only — never enable it in a production deployment reachable from an untrusted network.",
      },
    },
    {
      "@type": "Question",
      name: "How many findings did ScanRook find in traefik:v3.3?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our scan found 299 total findings: 22 critical, 136 high, 133 medium, and 8 low, almost all attributable to the Alpine base layer rather than the Traefik binary itself, based on comparison with our separate alpine:3.20 baseline scan.",
      },
    },
    {
      "@type": "Question",
      name: "How do I scan the Traefik Docker image for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Export the image with docker save, then run a scanner against it. With ScanRook: install the CLI, run docker save traefik:v3.3 -o traefik.tar, then scanrook scan traefik.tar. You get a severity breakdown and per-package findings you can triage.",
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
            Is the Traefik Docker Image Safe? What Our Scanner Found
          </h1>
          <p className="text-sm muted">Published August 7, 2026 &middot; 6 min read</p>
          <p className="text-sm muted">
            Traefik sits at the edge of a lot of production traffic as a reverse proxy, so
            &ldquo;is the Traefik Docker image safe&rdquo; matters more than most. We scanned{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">traefik:v3.3</code>{" "}
            with ScanRook and compared it against a plain Alpine baseline to see what the findings
            actually mean.
          </p>
        </header>

        <img
          src="/blog/series-image-safety-2.jpg"
          alt="Is the Traefik Docker image safe — container image safety series"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-2">
          <h2 className="text-sm font-semibold">The verdict</h2>
          <p className="text-sm muted leading-relaxed">
            Yes. Traefik ships on an Alpine base already, which keeps its finding count low compared
            to Debian-based images we have scanned in this series, and the project itself is
            actively maintained with a fast release cadence. The practical risks with Traefik are
            almost entirely configuration choices &mdash; running the dashboard or API in insecure
            mode, or not restricting who can reach it &mdash; rather than anything baked into the
            image.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What we found scanning traefik:v3.3</h2>
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
                  <th className="text-left py-2 pr-4 font-semibold">Image</th>
                  <th className="text-left py-2 pr-4 font-semibold">Total</th>
                  <th className="text-left py-2 pr-4 font-semibold">Critical</th>
                  <th className="text-left py-2 pr-4 font-semibold">High</th>
                  <th className="text-left py-2 pr-4 font-semibold">Medium</th>
                  <th className="text-left py-2 font-semibold">Low</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 text-xs font-mono">traefik:v3.3</td>
                  <td className="py-2 pr-4">299</td>
                  <td className="py-2 pr-4">22</td>
                  <td className="py-2 pr-4">136</td>
                  <td className="py-2 pr-4">133</td>
                  <td className="py-2">8</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-xs font-mono">alpine:3.20 (baseline)</td>
                  <td className="py-2 pr-4">301</td>
                  <td className="py-2 pr-4">20</td>
                  <td className="py-2 pr-4">136</td>
                  <td className="py-2 pr-4">131</td>
                  <td className="py-2">10</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ScanRook v1.14.2, warm-cache scan, 2026-07-04. Counts change as new advisories publish.
          </p>
          <p className="text-sm muted">
            We ran a separate scan of plain alpine:3.20 as a baseline, and the numbers are nearly
            identical to Traefik&apos;s: 301 findings (20 critical) for bare Alpine versus 299 (22
            critical) for the full Traefik image. That is strong evidence that essentially all of
            Traefik&apos;s findings come from the Alpine base layer it runs on, not from the Traefik
            binary itself.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The CVEs worth knowing about</h2>
          <p className="text-sm muted">
            The top critical findings in our scan all trace back to Alpine base packages:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>busybox-binsh &mdash; CVE-2021-42377, CVE-2022-48174, CVE-2016-2148</strong>.
              Three historical advisories against BusyBox&apos;s ash shell, which Alpine uses as{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/bin/sh</code>.
              Reachability depends on whether anything in your deployment shells out inside the
              container; Traefik&apos;s own routing engine does not.
            </li>
            <li>
              <strong>libcrypto3 &mdash; CVE-2021-3711 and CVE-2022-2274</strong>. Two OpenSSL
              advisories against the crypto library Alpine ships. Because Traefik does use TLS
              extensively for routing HTTPS traffic, this pair is worth checking against your exact
              Alpine/OpenSSL version rather than dismissing as base-layer noise.
            </li>
          </ul>
          <p className="text-sm muted">
            The libcrypto3 findings are the one place in this list where reachability is plausible
            rather than purely theoretical, since Traefik terminates and originates TLS connections.
            Confirm the fixed-in version against your deployed tag. Our{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs. advisory matching
            </Link>{" "}
            guide covers how to make that determination systematically.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which tag should you use?</h2>
          <p className="text-sm muted">
            Traefik does not publish a separate Debian-based tag with meaningfully different findings
            in our data &mdash; the official image is Alpine-based already, which is a large part of
            why its count is low compared to the Debian-based images elsewhere in this series. There
            is no smaller official alternative to switch to; the base image choice has effectively
            already been made for you in a good direction.
          </p>
          <p className="text-sm muted">
            What you can control is your own container hardening around it. For the broader tradeoffs
            between base image families in general, see{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Hardening checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Never enable <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">api.insecure=true</code> outside local development; it exposes the dashboard and API without authentication.</li>
            <li>Put the dashboard behind Traefik&apos;s own basic-auth or forward-auth middleware if you expose it at all.</li>
            <li>Redirect all HTTP traffic to HTTPS and keep TLS certificates current, ideally via automated ACME.</li>
            <li>Pin the image by digest so deploys are reproducible.</li>
            <li>Run the container as a non-root user where your orchestrator allows it.</li>
            <li>Restrict the Docker or Kubernetes API access Traefik uses for service discovery to read-only where possible.</li>
            <li>Rebuild and redeploy on a schedule to pick up Alpine base-image patches, including OpenSSL updates.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scan it yourself</h2>
          <p className="text-sm muted">
            Counts drift as new advisories publish, so verify against the exact tag and digest you
            deploy:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`curl -fsSL https://scanrook.io/install.sh | sh
docker save traefik:v3.3 -o traefik.tar
scanrook scan traefik.tar`}</pre>
          <p className="text-sm muted">
            The full CLI reference, including JSON output and severity gating for CI, is in{" "}
            <Link href="/docs" className="underline">the docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is the Traefik Docker image safe to use?</h3>
              <p className="text-sm muted mt-1">
                Yes. It ships on Alpine already and is actively maintained. Most practical risk comes
                from configuration, like leaving the dashboard exposed, not the image itself.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why does it have any vulnerabilities if it's Alpine-based?</h3>
              <p className="text-sm muted mt-1">
                Alpine is small, not zero. Our baseline alpine:3.20 scan found 301 findings, almost
                identical to Traefik&apos;s 299, confirming the base layer accounts for nearly all of
                it.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is the insecure API mode a CVE?</h3>
              <p className="text-sm muted mt-1">
                No, it&apos;s a configuration flag intended for local debugging only. Never enable it
                on a production deployment reachable from an untrusted network.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How many findings did the scan find?</h3>
              <p className="text-sm muted mt-1">
                299 total: 22 critical, 136 high, 133 medium, 8 low — nearly all attributable to the
                Alpine base layer rather than Traefik itself.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan your Traefik image with ScanRook</h3>
          <p className="text-sm muted leading-relaxed">
            Upload your image tar or scan from the CLI and ScanRook matches every installed package
            against OSV, NVD, and vendor advisory data &mdash; with severity, exploit-probability,
            and confidence tiers so you can separate real runtime risk from base-layer noise.
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
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              Installed-State Scanning vs. Advisory Matching
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-scanning-best-practices" className="underline">
              Container Scanning Best Practices
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
