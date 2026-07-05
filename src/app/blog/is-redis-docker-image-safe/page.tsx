import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-10";

const title = `Is the Redis Docker Image Safe? What Our Scanner Found | ${APP_NAME}`;
const description =
  "We scanned redis:7-alpine with ScanRook: 299 findings (20 critical) versus 1,399 (114 critical) for the Debian-based redis:7 tag. Which tag actually wins.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "is redis docker image safe",
    "redis docker image vulnerabilities",
    "redis docker cve",
    "redis:7 vulnerabilities",
    "redis alpine image security",
    "redis container security",
    "redis image scan",
    "safest redis docker tag",
    "redis docker security best practices",
    "redis vulnerability scan",
  ],
  alternates: { canonical: "/blog/is-redis-docker-image-safe" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/is-redis-docker-image-safe",
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
  headline: "Is the Redis Docker Image Safe? What Our Scanner Found",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/is-redis-docker-image-safe",
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
      name: "Is the redis Docker image safe to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, particularly if you use the Alpine-based tag. Redis itself has a strong security track record, and our scan of redis:7-alpine found a modest 299 findings, 20 of them critical. The Debian-based redis:7 tag carries substantially more because it ships a larger base operating system.",
      },
    },
    {
      "@type": "Question",
      name: "Why does redis:7 have more vulnerabilities than redis:7-alpine?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "redis:7 is built on Debian, which includes a fuller userland of system packages, each with its own advisory history. redis:7-alpine is built on Alpine's musl libc and BusyBox base, which contains far less software. In our scans, that difference showed up as 1,399 findings for redis:7 versus 299 for redis:7-alpine.",
      },
    },
    {
      "@type": "Question",
      name: "What are the main CVEs found in the redis Docker image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In redis:7-alpine, the top critical findings were in busybox-binsh (CVE-2021-42377, CVE-2022-48174, CVE-2016-2148) and libcrypto3, the OpenSSL cryptography library (CVE-2021-3711, CVE-2022-2274). These sit in the base image rather than in Redis's own source code.",
      },
    },
    {
      "@type": "Question",
      name: "How do I scan the redis Docker image for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Export the image to a tar archive with docker save, then scan it. With ScanRook: install the CLI, run docker save redis:7-alpine -o redis.tar, then scanrook scan redis.tar for a severity breakdown and per-package findings.",
      },
    },
    {
      "@type": "Question",
      name: "Should I use redis:7 or redis:7-alpine in production?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "redis:7-alpine is the better default for most deployments: same Redis version, roughly 79% fewer findings in our scan. Use the Debian-based tag only if you need glibc compatibility for custom Redis modules or organizational tooling that assumes Debian.",
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
            Is the Redis Docker Image Safe? What Our Scanner Found
          </h1>
          <p className="text-sm muted">Published July 10, 2026 &middot; 6 min read</p>
          <p className="text-sm muted">
            Redis ships two very different default footprints depending on which tag you pull, so
            &ldquo;is the redis Docker image safe&rdquo; really depends on which one. We scanned{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">redis:7-alpine</code>{" "}
            and the Debian-based{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">redis:7</code>{" "}
            with ScanRook to see how much that choice actually matters.
          </p>
        </header>

        <img
          src="/blog/series-image-safety-3.jpg"
          alt="Is the redis Docker image safe — container image safety series"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-2">
          <h2 className="text-sm font-semibold">The verdict</h2>
          <p className="text-sm muted leading-relaxed">
            Yes, and the Alpine-based tag makes the case for itself in the numbers. Redis the
            database engine has a strong security track record and a small, well-audited codebase.
            What varies enormously is the base operating system it ships on top of: the Alpine tag
            we scanned came back with 299 findings, while the Debian-based tag carried 1,399. If
            you are running redis:7 today without a specific reason, switching to redis:7-alpine is
            one of the highest-leverage changes you can make to a Redis deployment&apos;s scan
            results.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What we found scanning redis:7-alpine</h2>
          <p className="text-sm muted">
            We exported both images with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker save</code>{" "}
            and scanned them with ScanRook, which matches every installed package against OSV,
            NVD, and vendor advisory data:
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
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 text-xs font-mono">redis:7-alpine</td>
                  <td className="py-2 pr-4">299</td>
                  <td className="py-2 pr-4">20</td>
                  <td className="py-2 pr-4">136</td>
                  <td className="py-2 pr-4">131</td>
                  <td className="py-2">8</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-xs font-mono">redis:7 (Debian)</td>
                  <td className="py-2 pr-4">1,399</td>
                  <td className="py-2 pr-4">114</td>
                  <td className="py-2 pr-4">307</td>
                  <td className="py-2 pr-4">345</td>
                  <td className="py-2">45</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ScanRook v1.14.2, warm-cache scan, 2026-07-04. Counts change as new advisories publish.
          </p>
          <p className="text-sm muted">
            Redis is unusual in this series in that its leanest tag is also its most common
            production choice. The Alpine build still isn&apos;t zero-risk &mdash; it inherits
            BusyBox and OpenSSL from its base &mdash; but at 299 findings it is close to the floor
            you can expect from any actively maintained Alpine image.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The CVEs worth knowing about</h2>
          <p className="text-sm muted">
            The top critical findings in redis:7-alpine come from two packages inherited from the
            Alpine base, not from Redis itself:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>busybox-binsh &mdash; CVE-2021-42377, CVE-2022-48174, CVE-2016-2148.</strong>{" "}
              BusyBox provides the minimal shell and coreutils Alpine uses in place of a full GNU
              userland. These advisories affect BusyBox applet parsing and shell handling; whether
              they are reachable depends on whether anything in your entrypoint or healthcheck
              actually invokes a shell inside the container.
            </li>
            <li>
              <strong>libcrypto3 &mdash; CVE-2021-3711, CVE-2022-2274.</strong> libcrypto3 is
              OpenSSL&apos;s cryptography library, used for TLS if you enable Redis&apos;s
              encrypted connections. Both CVEs are buffer-overflow issues in specific OpenSSL code
              paths; check whether your deployed OpenSSL build post-dates the fix before treating
              either as exploitable.
            </li>
          </ul>
          <p className="text-sm muted">
            Neither package is part of the Redis server binary. Our guide to{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs. advisory matching
            </Link>{" "}
            explains why scanners flag base-image packages like these even when the application
            never touches them directly.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which tag should you use?</h2>
          <p className="text-sm muted">
            Use <strong>redis:7-alpine</strong> unless you have a concrete reason not to. It is
            the same Redis release as the Debian-based tag, with roughly 79% fewer findings and
            about a fifth of the container size. For the wider tradeoffs between Alpine, Debian,
            and distroless base families, see{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>
            .
          </p>
          <p className="text-sm muted">
            Stick with redis:7 if you build custom Redis modules linked against glibc, or your
            infrastructure standardizes on Debian images for debugging and tooling parity across
            services. Automate the scan comparison in CI so the decision is data-driven rather than
            a one-time judgment call &mdash; see{" "}
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              how to scan Docker images in GitHub Actions
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Hardening checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Set a strong <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">requirepass</code> or use Redis ACLs &mdash; never expose Redis without authentication.</li>
            <li>Bind Redis to an internal network only; never publish port 6379 to the public internet.</li>
            <li>
              Pin the image by digest (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">redis@sha256:&hellip;</code>)
              so deploys are reproducible.
            </li>
            <li>Disable dangerous commands (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">FLUSHALL</code>, <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CONFIG</code>) in production via <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">rename-command</code> or ACLs.</li>
            <li>Enable TLS for Redis connections that cross a network boundary you don&apos;t fully trust.</li>
            <li>Rebuild and redeploy on a schedule so BusyBox and OpenSSL patches actually reach you.</li>
            <li>Scan every build in CI so a base image regression is caught before it ships.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scan it yourself</h2>
          <p className="text-sm muted">
            Counts drift as new advisories publish, so verify against the exact tag and digest you
            deploy:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`curl -fsSL https://scanrook.io/install.sh | sh
docker save redis:7-alpine -o redis.tar
scanrook scan redis.tar`}</pre>
          <p className="text-sm muted">
            The full CLI reference, including JSON output and severity gating for CI, is in{" "}
            <Link href="/docs" className="underline">the docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is the redis Docker image safe to use?</h3>
              <p className="text-sm muted mt-1">
                Yes, especially the Alpine tag. Our scan found 299 findings (20 critical) in
                redis:7-alpine versus 1,399 (114 critical) in the Debian-based redis:7.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why does redis:7 have more vulnerabilities?</h3>
              <p className="text-sm muted mt-1">
                It ships a fuller Debian userland with more packages, each carrying its own advisory
                history, while redis:7-alpine&apos;s musl libc and BusyBox base contains far less
                software.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What are the main CVEs in the redis image?</h3>
              <p className="text-sm muted mt-1">
                In redis:7-alpine, the top critical findings sit in busybox-binsh and libcrypto3
                (OpenSSL) &mdash; base image packages, not Redis&apos;s own source code.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should I use redis:7 or redis:7-alpine?</h3>
              <p className="text-sm muted mt-1">
                redis:7-alpine for most deployments &mdash; same Redis version, about 79% fewer
                findings. Use redis:7 only if you need glibc compatibility.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan your redis image with ScanRook</h3>
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
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              How to Reduce CVEs in Docker Images
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              Container Image Security Checklist
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/is-nginx-docker-image-safe" className="underline">
              Is the Nginx Docker Image Safe?
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
