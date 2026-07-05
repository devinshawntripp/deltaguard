import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-26";

const title = `Is the PHP Docker Image Safe? What Our Scanner Found | ${APP_NAME}`;
const description =
  "We scanned php:8.4 with ScanRook: 19,125 findings (446 critical). What that means, which CVEs matter, and why the Alpine tag cuts findings by 97%.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "is php docker image safe",
    "php docker image vulnerabilities",
    "php:8.4 cve",
    "php docker security",
    "php alpine image security",
    "php container security",
    "php image scan",
    "safest php docker tag",
    "php-fpm alpine security",
    "php docker best practices",
  ],
  alternates: { canonical: "/blog/is-php-docker-image-safe" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/is-php-docker-image-safe",
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
  headline: "Is the PHP Docker Image Safe? What Our Scanner Found",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/is-php-docker-image-safe",
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
      name: "Is the PHP Docker image safe to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Mostly yes, with caveats. The PHP interpreter itself is patched on a regular release cycle. Almost all of the findings in the default php:8.4 image come from the Debian base operating system underneath it. Switching to the Alpine-based tag, running as non-root, and rebuilding regularly address most of the practical risk.",
      },
    },
    {
      "@type": "Question",
      name: "Why does the php Docker image have so many vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The default php:8.4 tag is built on Debian and ships a full userland alongside the interpreter: glibc, Perl, binutils, compression libraries, and more. Each of those packages carries its own advisory history. Our scan of php:8.4 found 19,125 findings, almost all attributable to that base layer rather than to PHP itself.",
      },
    },
    {
      "@type": "Question",
      name: "Is php:8.4-alpine more secure than the default PHP image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It has a dramatically smaller attack surface. Our scan found 19,125 findings (446 critical) for php:8.4 versus 506 findings (60 critical) for php:8.4-alpine, a roughly 97% reduction, because Alpine's musl libc and BusyBox userland replace the full Debian toolchain.",
      },
    },
    {
      "@type": "Question",
      name: "How do I scan the PHP Docker image for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Export the image to a tar archive with docker save, then run a scanner against it. With ScanRook: install the CLI, run docker save php:8.4 -o php.tar, then scanrook scan php.tar. You get a severity breakdown and per-package findings you can triage.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to fix every CVE reported in the PHP image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Many findings sit in packages that never execute inside a running PHP-FPM or CLI container, such as build tooling pulled in for compiling PECL extensions. Triage by severity and reachability first, then consider a smaller base tag to eliminate whole categories of findings at once.",
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
            Is the PHP Docker Image Safe? What Our Scanner Found
          </h1>
          <p className="text-sm muted">Published July 26, 2026 &middot; 6 min read</p>
          <p className="text-sm muted">
            PHP still powers a large share of the web, and &ldquo;is the PHP Docker image
            safe&rdquo; is a reasonable question before you build on it. We scanned{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">php:8.4</code>{" "}
            and its Alpine variant with ScanRook and looked at what the findings actually mean.
          </p>
        </header>

        <img
          src="/blog/series-image-safety-1.jpg"
          alt="Is the PHP Docker image safe — container image safety series"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-2">
          <h2 className="text-sm font-semibold">The verdict</h2>
          <p className="text-sm muted leading-relaxed">
            Mostly yes, with caveats. The PHP interpreter itself gets timely security releases, and
            the project has a clear, published support timeline. The very large finding count you
            see when you scan the default image comes overwhelmingly from the Debian base operating
            system underneath PHP, not from the interpreter. The practical risks are running an
            unnecessarily large base tag, leaving the container running as root, and skipping
            rebuilds after base-image patches ship. All three are straightforward to fix.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What we found scanning php:8.4</h2>
          <p className="text-sm muted">
            We exported the image with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker save</code>{" "}
            and scanned it with ScanRook, which matches every installed package against OSV, NVD,
            and vendor advisory data. Here is the severity breakdown for the default Debian-based
            tag and the Alpine variant:
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
                  <td className="py-2 pr-4 text-xs font-mono">php:8.4</td>
                  <td className="py-2 pr-4">19,125</td>
                  <td className="py-2 pr-4">446</td>
                  <td className="py-2 pr-4">4,960</td>
                  <td className="py-2 pr-4">9,669</td>
                  <td className="py-2">259</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-xs font-mono">php:8.4-alpine</td>
                  <td className="py-2 pr-4">506</td>
                  <td className="py-2 pr-4">60</td>
                  <td className="py-2 pr-4">218</td>
                  <td className="py-2 pr-4">204</td>
                  <td className="py-2">20</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ScanRook v1.14.2, warm-cache scan, 2026-07-04. Counts change as new advisories publish.
          </p>
          <p className="text-sm muted">
            19,125 findings looks alarming for a language runtime, but the vast majority sit in the
            Debian userland that ships alongside PHP &mdash; Perl, binutils, compression libraries,
            and other packages pulled in to support building PECL extensions. The Alpine tag carries
            roughly 97% fewer findings simply because that userland is far smaller.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The CVEs worth knowing about</h2>
          <p className="text-sm muted">
            A few of the top critical findings from our scan illustrate what the totals are made of:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>CVE-2024-3094 (liblzma5)</strong> &mdash; the xz-utils supply-chain backdoor
              disclosed in March 2024, where a malicious maintainer inserted obfuscated code into the
              liblzma build scripts. The vulnerable versions were narrow and quickly pulled from
              distributions; check the exact liblzma5 version against the Debian security tracker
              before treating this as live risk in your build.
            </li>
            <li>
              <strong>CVE-2015-8659 (libnghttp2-14)</strong> &mdash; a denial-of-service issue in an
              old version of the HTTP/2 library. It ships as a dependency of curl inside the image;
              whether it is reachable depends on whether your application makes outbound HTTP/2
              requests through PHP&apos;s curl extension.
            </li>
            <li>
              <strong>CVE-2017-20230 (libperl5.40 and perl-base)</strong> &mdash; the same advisory
              flagged twice, once against the Perl runtime library and once against the base Perl
              package. Perl is bundled to support build-time tooling; it is not invoked by PHP-FPM or
              the PHP CLI at runtime in a typical deployment.
            </li>
            <li>
              <strong>CVE-2015-8104 (linux-libc-dev)</strong> &mdash; a kernel-header package
              advisory. Kernel headers are used at compile time for native extensions and carry no
              runtime code path in the container itself.
            </li>
          </ul>
          <p className="text-sm muted">
            The pattern matches what we see across Debian-based official images: the riskiest-looking
            IDs live in the base operating system and build tooling, not in the PHP interpreter you
            actually run. Our guide to{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs. advisory matching
            </Link>{" "}
            covers why scanners disagree on exactly these packages.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which tag should you use?</h2>
          <p className="text-sm muted">
            For most deployments, <strong>php:8.4-alpine</strong> (or the matching{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">-fpm-alpine</code>{" "}
            variant) is the better default: 506 findings and 60 critical in our scan, versus 19,125
            and 446 on the Debian-based tag. The tradeoff is musl libc instead of glibc, which
            occasionally trips up PECL extensions that assume glibc-specific behavior, and BusyBox
            utilities instead of GNU ones for in-container debugging.
          </p>
          <p className="text-sm muted">
            Stay on the Debian-based tag if you depend on precompiled glibc extensions you cannot
            rebuild against musl, or if your organization standardizes on Debian for compliance
            tooling. In that case, pin a specific version tag and rebuild frequently. For the wider
            comparison of base image families, see{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Hardening checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Run PHP-FPM as a non-root user rather than the container default root user.</li>
            <li>
              Pin the image by digest (
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">php@sha256:&hellip;</code>
              ), not just by tag, so deploys are reproducible.
            </li>
            <li>
              Disable dangerous functions you do not need (
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">exec</code>,{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">shell_exec</code>,{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">passthru</code>) in{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">php.ini</code>.
            </li>
            <li>Turn off <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">display_errors</code> in production so stack traces are never leaked to clients.</li>
            <li>Run <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">composer audit</code> in CI to catch vulnerable third-party packages your application depends on.</li>
            <li>Multi-stage build: compile extensions in a builder stage, copy only the built artifacts into the final runtime image.</li>
            <li>Rebuild and redeploy on a schedule &mdash; base image patches only reach you when you rebuild.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scan it yourself</h2>
          <p className="text-sm muted">
            Counts drift as new advisories publish, so verify against the exact tag and digest you
            deploy:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`curl -fsSL https://scanrook.io/install.sh | sh
docker save php:8.4 -o php.tar
scanrook scan php.tar`}</pre>
          <p className="text-sm muted">
            The full CLI reference, including JSON output and severity gating for CI, is in{" "}
            <Link href="/docs" className="underline">the docs</Link>. If you also want to gate builds
            in GitHub Actions, see our{" "}
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              GitHub Actions scanning guide
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is the PHP Docker image safe to use?</h3>
              <p className="text-sm muted mt-1">
                Broadly yes. The interpreter is actively maintained; most findings come from the
                Debian base packages underneath it. Use the Alpine tag, run as non-root, and rebuild
                regularly to address the bulk of the practical risk.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why does the image have so many vulnerabilities?</h3>
              <p className="text-sm muted mt-1">
                The default tag ships a full Debian userland alongside PHP, and every package in it
                carries its own advisory history. Scanners report the whole operating system layer,
                not just the interpreter.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is php:8.4-alpine more secure?</h3>
              <p className="text-sm muted mt-1">
                It has a much smaller attack surface: 506 findings vs 19,125 in our scan, about 97%
                fewer, because musl libc and BusyBox replace the full Debian toolchain.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Do I need to fix every reported CVE?</h3>
              <p className="text-sm muted mt-1">
                No. Triage by severity and reachability &mdash; build-time tooling like Perl and
                kernel headers never execute in a running PHP-FPM container. Switching to a smaller
                tag removes whole categories of findings at once.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan your PHP image with ScanRook</h3>
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
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              How to Reduce CVEs in Docker Images
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              How to Scan Docker Images in GitHub Actions
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
