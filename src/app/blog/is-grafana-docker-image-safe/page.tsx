import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-13";

const title = `Is the Grafana Docker Image Safe? What Our Scanner Found | ${APP_NAME}`;
const description =
  "We scanned grafana/grafana:12.0.2 with ScanRook: 492 findings (54 critical). What that means, which CVEs matter, and why Alpine drives most of them.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "is grafana docker image safe",
    "grafana docker image vulnerabilities",
    "grafana:12.0.2 cve",
    "grafana docker security",
    "grafana container security",
    "grafana image scan",
    "grafana default credentials security",
    "grafana docker best practices",
    "grafana alpine base image",
    "grafana anonymous access security",
  ],
  alternates: { canonical: "/blog/is-grafana-docker-image-safe" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/is-grafana-docker-image-safe",
    images: ["/blog/series-image-safety-5.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/series-image-safety-5.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Is the Grafana Docker Image Safe? What Our Scanner Found",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/is-grafana-docker-image-safe",
  image: "https://scanrook.io/blog/series-image-safety-5.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is the Grafana Docker image safe to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Broadly yes. Grafana ships on an Alpine base already, which keeps its finding count moderate compared to Debian-based images in this series, and the project is actively maintained. The practical risks are configuration-level: default admin credentials, anonymous access left enabled, or unrestricted plugin installation.",
      },
    },
    {
      "@type": "Question",
      name: "How many vulnerabilities did ScanRook find in grafana/grafana:12.0.2?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our scan found 492 total findings: 54 critical, 207 high, 207 medium, and 20 low. A separate baseline scan of alpine:3.20 found 301 findings (20 critical), meaning Grafana's own dependencies account for roughly 191 additional findings and 34 additional critical findings beyond its Alpine base layer.",
      },
    },
    {
      "@type": "Question",
      name: "Should I change the default Grafana admin password?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, immediately. Grafana ships with a default admin/admin login intended to be changed on first use. Leaving it in place on any network-reachable instance is a far larger practical risk than any base-image CVE, and it is entirely within your control at deployment time.",
      },
    },
    {
      "@type": "Question",
      name: "Is Grafana's finding count higher than other Alpine-based images?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Somewhat. Grafana's 492 findings sit above our alpine:3.20 baseline of 301, unlike Traefik, which came in almost identical to bare Alpine at 299. Grafana bundles its own Go backend and frontend build tooling, which introduces some additional findings beyond the base layer alone.",
      },
    },
    {
      "@type": "Question",
      name: "How do I scan the Grafana Docker image for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Export the image with docker save, then run a scanner against it. With ScanRook: install the CLI, run docker save grafana/grafana:12.0.2 -o grafana.tar, then scanrook scan grafana.tar. You get a severity breakdown and per-package findings you can triage.",
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
            Is the Grafana Docker Image Safe? What Our Scanner Found
          </h1>
          <p className="text-sm muted">Published August 13, 2026 &middot; 6 min read</p>
          <p className="text-sm muted">
            Grafana dashboards often sit in front of an organization&apos;s monitoring and metrics
            data, so &ldquo;is the Grafana Docker image safe&rdquo; is a fair question before you
            deploy it. We scanned{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">grafana/grafana:12.0.2</code>{" "}
            with ScanRook and compared it against a plain Alpine baseline to see what the findings
            actually mean.
          </p>
        </header>

        <img
          src="/blog/series-image-safety-5.jpg"
          alt="Is the Grafana Docker image safe — container image safety series"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-2">
          <h2 className="text-sm font-semibold">The verdict</h2>
          <p className="text-sm muted leading-relaxed">
            Broadly yes. Grafana ships on an Alpine base, which keeps its total finding count moderate
            next to the Debian-based images we have scanned elsewhere in this series, and the project
            is actively maintained with a public security process. The practical risks with Grafana
            are almost entirely configuration decisions &mdash; the default admin login, anonymous
            access, and unrestricted plugin installation &mdash; rather than anything specific to the
            image itself.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What we found scanning grafana/grafana:12.0.2</h2>
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
                  <td className="py-2 pr-4 text-xs font-mono">grafana/grafana:12.0.2</td>
                  <td className="py-2 pr-4">492</td>
                  <td className="py-2 pr-4">54</td>
                  <td className="py-2 pr-4">207</td>
                  <td className="py-2 pr-4">207</td>
                  <td className="py-2">20</td>
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
            We ran a separate scan of plain alpine:3.20 as a baseline: 301 findings versus
            Grafana&apos;s 492. Unlike Traefik, which landed almost exactly on the Alpine baseline,
            Grafana sits meaningfully above it &mdash; roughly 191 findings and 34 critical findings
            beyond the base layer, attributable to Grafana&apos;s own bundled dependencies rather than
            Alpine alone.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The CVEs worth knowing about</h2>
          <p className="text-sm muted">
            The top critical findings in our scan trace back to Alpine base packages:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>busybox-binsh &mdash; CVE-2021-42377, CVE-2022-48174, CVE-2016-2148</strong>.
              Historical advisories against BusyBox&apos;s ash shell, which Alpine uses as{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/bin/sh</code>.
              Reachability depends on whether anything shells out inside the container; Grafana&apos;s
              own Go backend does not need to.
            </li>
            <li>
              <strong>libcrypto3 &mdash; CVE-2021-3711 and CVE-2022-2274</strong>. OpenSSL advisories
              against the crypto library Alpine ships. Grafana does use TLS for its own HTTPS listener
              and for outbound data-source connections, so this pair is worth checking against your
              deployed Alpine/OpenSSL version rather than dismissing outright.
            </li>
          </ul>
          <p className="text-sm muted">
            As with Traefik, the libcrypto3 findings are the most plausible to matter in practice,
            given Grafana&apos;s TLS usage. Our{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs. advisory matching
            </Link>{" "}
            guide covers how to confirm whether a specific finding applies to your deployed version.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which tag should you use?</h2>
          <p className="text-sm muted">
            Grafana does not publish a separate Debian-based tag with meaningfully different findings
            in our data &mdash; the official image ships on Alpine already. The finding gap above the
            Alpine baseline comes from Grafana&apos;s own bundled Go backend and frontend build
            output, which is not something a different base tag would change; it is inherent to
            running Grafana itself.
          </p>
          <p className="text-sm muted">
            Focus your effort on configuration hardening and keeping the version current rather than
            hunting for an alternate tag. For the general tradeoffs between base image families, see{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Hardening checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Change the default admin/admin login immediately on first deployment.</li>
            <li>Disable anonymous access and self-service sign-up unless your use case explicitly requires them.</li>
            <li>Restrict plugin installation to trusted, signed sources only.</li>
            <li>Put Grafana behind SSO or your organization&apos;s identity provider rather than relying on local accounts alone.</li>
            <li>Run the container as the non-root user (UID 472) the official image already defines.</li>
            <li>Pin the image by digest so deploys are reproducible.</li>
            <li>Rebuild and redeploy on a schedule to pick up Alpine base-image and OpenSSL patches.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scan it yourself</h2>
          <p className="text-sm muted">
            Counts drift as new advisories publish, so verify against the exact tag and digest you
            deploy:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`curl -fsSL https://scanrook.io/install.sh | sh
docker save grafana/grafana:12.0.2 -o grafana.tar
scanrook scan grafana.tar`}</pre>
          <p className="text-sm muted">
            The full CLI reference, including JSON output and severity gating for CI, is in{" "}
            <Link href="/docs" className="underline">the docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is the Grafana Docker image safe to use?</h3>
              <p className="text-sm muted mt-1">
                Broadly yes. It ships on Alpine and is actively maintained. Most practical risk comes
                from configuration — default credentials, anonymous access — not the image itself.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How many findings did the scan find?</h3>
              <p className="text-sm muted mt-1">
                492 total: 54 critical, 207 high, 207 medium, 20 low. Our alpine:3.20 baseline found
                301, so roughly 191 findings come from Grafana&apos;s own dependencies.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should I change the default admin password?</h3>
              <p className="text-sm muted mt-1">
                Yes, immediately. The default admin/admin login is meant to be changed on first use
                and is a bigger practical risk than any base-image CVE.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why is Grafana's count higher than Traefik's?</h3>
              <p className="text-sm muted mt-1">
                Both are Alpine-based, but Grafana bundles its own Go backend and frontend build
                output, which introduces findings beyond the Alpine base layer alone.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan your Grafana image with ScanRook</h3>
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
            <Link href="/blog/container-security-checklist" className="underline">
              Container Image Security Checklist
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
