import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-16";

const title = `Is the Alpine Docker Image Safe? What Our Scanner Found | ${APP_NAME}`;
const description =
  "We scanned alpine:3.20 with ScanRook: 301 findings (20 critical). What that means for the smallest common base image, which CVEs matter, and how to harden it.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "is alpine docker image safe",
    "alpine docker image vulnerabilities",
    "alpine docker cve",
    "alpine:3.20 vulnerabilities",
    "alpine linux container security",
    "alpine image scan",
    "alpine docker security best practices",
    "alpine vulnerability scan",
    "busybox cve alpine",
    "alpine base image security",
  ],
  alternates: { canonical: "/blog/is-alpine-docker-image-safe" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/is-alpine-docker-image-safe",
    images: ["/blog/series-image-safety-1.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/series-image-safety-1.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Is the Alpine Docker Image Safe? What Our Scanner Found",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/is-alpine-docker-image-safe",
  image: "https://scanrook.io/blog/series-image-safety-1.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is the alpine Docker image safe to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Alpine is the reference point the rest of this series compares against for a reason — our scan of alpine:3.20 found only 301 findings, 20 of them critical, almost entirely in BusyBox and OpenSSL rather than anything specific to the distribution's own tooling.",
      },
    },
    {
      "@type": "Question",
      name: "Why does alpine still have any vulnerabilities if it's so minimal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Alpine still ships a shell, coreutils replacements via BusyBox, and OpenSSL for cryptography — all of which are actively maintained software with their own advisory history. Minimal doesn't mean zero software; it means dramatically less than a full Debian or Ubuntu userland.",
      },
    },
    {
      "@type": "Question",
      name: "What are the main CVEs found in the alpine Docker image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In our scan of alpine:3.20, the top critical findings were in busybox-binsh (CVE-2021-42377, CVE-2022-48174, CVE-2016-2148) and libcrypto3, OpenSSL's cryptography library (CVE-2021-3711, CVE-2022-2274) — the same two packages that dominate findings across every Alpine-based image in this series.",
      },
    },
    {
      "@type": "Question",
      name: "How do I scan the alpine Docker image for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Export the image with docker save, then scan it. With ScanRook: install the CLI, run docker save alpine:3.20 -o alpine.tar, then scanrook scan alpine.tar for a severity breakdown and per-package findings.",
      },
    },
    {
      "@type": "Question",
      name: "Should I pin a specific alpine version instead of using latest?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The alpine:latest tag moves as new releases ship, which can silently change your build's package versions. Pin an explicit version like alpine:3.20, and better yet pin by digest, so what you tested is exactly what you deploy.",
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
            Is the Alpine Docker Image Safe? What Our Scanner Found
          </h1>
          <p className="text-sm muted">Published July 16, 2026 &middot; 5 min read</p>
          <p className="text-sm muted">
            Alpine shows up throughout this series as the low-finding alternative to heavier base
            images, which raises the obvious question: is the alpine Docker image itself safe? We
            scanned{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">alpine:3.20</code>{" "}
            directly with ScanRook to find out.
          </p>
        </header>

        <img
          src="/blog/series-image-safety-1.jpg"
          alt="Is the alpine Docker image safe — container image safety series"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-2">
          <h2 className="text-sm font-semibold">The verdict</h2>
          <p className="text-sm muted leading-relaxed">
            Yes, honestly and without much caveat. alpine:3.20 is about as clean as a general-purpose
            Linux base image gets: 301 findings total, 20 critical, all of it concentrated in
            BusyBox and OpenSSL rather than spread across hundreds of packages the way Debian- or
            Ubuntu-based images are. That doesn&apos;t mean zero risk &mdash; BusyBox and OpenSSL
            are real, exploitable software with real advisory histories &mdash; but it is close to
            the floor of what any actively maintained Linux distribution can offer.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What we found scanning alpine:3.20</h2>
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
                  <td className="py-2 pr-4 text-xs font-mono">alpine:3.20</td>
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
            There is no heavier &ldquo;default&rdquo; Alpine tag to compare against &mdash; Alpine
            is itself the minimal option every other image in this series is measured against. The
            301 findings here are close to what we consistently see across other Alpine-based
            images (redis:7-alpine, node:22-alpine, and others all land in a similar range), which
            tells you the number is mostly a property of the Alpine base itself, not the
            application layered on top of it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The CVEs worth knowing about</h2>
          <p className="text-sm muted">
            The findings concentrate in two packages that make up most of Alpine&apos;s minimal
            userland:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>busybox-binsh &mdash; CVE-2021-42377, CVE-2022-48174, CVE-2016-2148.</strong>{" "}
              BusyBox bundles the shell and coreutils Alpine uses instead of a GNU userland. These
              advisories affect applet argument parsing and shell handling; reachability depends on
              whether your image&apos;s entrypoint, healthcheck, or any exec&apos;d process
              actually invokes a shell.
            </li>
            <li>
              <strong>libcrypto3 &mdash; CVE-2021-3711, CVE-2022-2274.</strong> OpenSSL&apos;s
              cryptography library. Both are buffer-related issues in specific OpenSSL code paths;
              whether they&apos;re actionable depends on your installed OpenSSL version and whether
              your application actually exercises the affected functions.
            </li>
          </ul>
          <p className="text-sm muted">
            These two packages account for nearly all Alpine-based findings across this entire
            series, which is worth internalizing: when you see &ldquo;alpine cuts findings by 99%&rdquo;
            elsewhere, this is what the remaining 1% looks like. Our guide to{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs. advisory matching
            </Link>{" "}
            covers how scanners determine reachability for findings like these.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which tag should you use?</h2>
          <p className="text-sm muted">
            Since Alpine has no heavier sibling tag the way Debian-based images have an
            &ldquo;-alpine&rdquo; variant, the tag decision here is about versioning rather than
            base family. Use an explicit minor version like <strong>alpine:3.20</strong> rather
            than <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">alpine:latest</code>,
            which moves underneath you as new releases ship and can silently change installed
            package versions between builds.
          </p>
          <p className="text-sm muted">
            If you&apos;re choosing Alpine as a base for your own application image rather than
            using it standalone, see{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>{" "}
            for how it compares against glibc-based and distroless alternatives on compatibility
            and finding count.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Hardening checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Pin an explicit version tag (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">alpine:3.20</code>) rather than <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">latest</code>, and pin by digest for reproducible builds.</li>
            <li>Run <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">apk upgrade</code> during image builds to pick up patched BusyBox and OpenSSL packages before shipping.</li>
            <li>Avoid installing a shell at all in the final image if your application doesn&apos;t need one &mdash; distroless-style multi-stage builds can drop BusyBox entirely.</li>
            <li>Run the container as a non-root user via <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">adduser</code> in your Dockerfile.</li>
            <li>Verify your application actually needs shell access before shipping it &mdash; many services only need a static binary and a handful of certs.</li>
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
docker save alpine:3.20 -o alpine.tar
scanrook scan alpine.tar`}</pre>
          <p className="text-sm muted">
            The full CLI reference, including JSON output and severity gating for CI, is in{" "}
            <Link href="/docs" className="underline">the docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is the alpine Docker image safe to use?</h3>
              <p className="text-sm muted mt-1">
                Yes. Our scan found 301 findings (20 critical), almost entirely in BusyBox and
                OpenSSL &mdash; close to the floor for any actively maintained Linux base image.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why does alpine have any vulnerabilities at all?</h3>
              <p className="text-sm muted mt-1">
                Minimal doesn&apos;t mean empty &mdash; Alpine still ships BusyBox and OpenSSL, both
                actively maintained software with their own advisory histories.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What are the main CVEs in the alpine image?</h3>
              <p className="text-sm muted mt-1">
                busybox-binsh and libcrypto3 (OpenSSL) account for nearly all critical findings in
                our scan &mdash; the same two packages that dominate every Alpine-based image in
                this series.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should I pin a version instead of using latest?</h3>
              <p className="text-sm muted mt-1">
                Yes. Pin an explicit version like alpine:3.20, and ideally by digest, so builds stay
                reproducible as new releases ship.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan your alpine-based image with ScanRook</h3>
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
            <Link href="/blog/is-nginx-docker-image-safe" className="underline">
              Is the Nginx Docker Image Safe?
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              How to Reduce CVEs in Docker Images
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
