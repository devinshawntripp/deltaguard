import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-24";

const title = `Is the Httpd Docker Image Safe? What Our Scanner Found | ${APP_NAME}`;
const description =
  "We scanned httpd:2.4 with ScanRook: 2,574 findings (218 critical). What that means, which CVEs matter, and why the Alpine tag cuts findings by 80%.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "is httpd docker image safe",
    "apache httpd docker image vulnerabilities",
    "httpd docker cve",
    "httpd:2.4 vulnerabilities",
    "apache httpd alpine image security",
    "httpd container security",
    "httpd image scan",
    "safest httpd docker tag",
    "apache httpd docker security best practices",
    "httpd vulnerability scan",
  ],
  alternates: { canonical: "/blog/is-httpd-docker-image-safe" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/is-httpd-docker-image-safe",
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
  headline: "Is the Httpd Docker Image Safe? What Our Scanner Found",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/is-httpd-docker-image-safe",
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
      name: "Is the httpd Docker image safe to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Broadly yes. Apache HTTP Server has a long track record and receives fixes promptly. Most of the 2,574 findings in our scan of httpd:2.4 come from the Debian base image rather than the httpd binary itself; the Alpine tag cuts that count by about 80%.",
      },
    },
    {
      "@type": "Question",
      name: "Why does the httpd Docker image have so many vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "httpd:2.4 is built on Debian, which ships a full system library set alongside Apache HTTP Server. Every one of those libraries carries its own advisory history, so a scan reports the whole operating system layer, not just the web server.",
      },
    },
    {
      "@type": "Question",
      name: "Is httpd:alpine more secure than the default httpd image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In our scans, httpd:2.4 produced 2,574 findings (218 critical) while httpd:2.4-alpine produced 524 findings (64 critical) — about 80% fewer. musl libc and BusyBox replace Debian's larger userland, cutting the package count substantially.",
      },
    },
    {
      "@type": "Question",
      name: "What is the CVE-2022-24963 finding in the httpd image about?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CVE-2022-24963 is an integer overflow in Apache's own APR (Apache Portable Runtime) library, flagged against libapr1t64. Unlike most findings in this series, APR is a dependency Apache HTTP Server directly loads and uses, making this one worth checking against your specific httpd build's patch level rather than deprioritizing as base-image noise.",
      },
    },
    {
      "@type": "Question",
      name: "How do I scan the httpd Docker image for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Export the image with docker save, then scan the tar. With ScanRook: install the CLI, run docker save httpd:2.4 -o httpd.tar, then scanrook scan httpd.tar for a severity breakdown and per-package findings.",
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
            Is the Httpd Docker Image Safe? What Our Scanner Found
          </h1>
          <p className="text-sm muted">Published July 24, 2026 &middot; 6 min read</p>
          <p className="text-sm muted">
            The official httpd image is how most people run Apache HTTP Server in containers, so
            &ldquo;is the httpd Docker image safe&rdquo; is worth a real answer. We scanned{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">httpd:2.4</code>{" "}
            and its Alpine variant with ScanRook and looked at what the findings actually mean.
          </p>
        </header>

        <img
          src="/blog/series-image-safety-5.jpg"
          alt="Is the httpd Docker image safe — container image safety series"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-2">
          <h2 className="text-sm font-semibold">The verdict</h2>
          <p className="text-sm muted leading-relaxed">
            Mostly yes, with one finding worth individual attention. Apache HTTP Server is
            actively maintained and its own CVEs are patched quickly. Most of the 2,574 findings
            in our scan come from the Debian base underneath it, the same pattern as nginx earlier
            in this series. The exception is CVE-2022-24963, an integer overflow in Apache&apos;s
            own APR library &mdash; a dependency httpd actually loads, not dormant build tooling
            &mdash; which deserves a direct check against your build&apos;s patch level rather than
            routine triage.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What we found scanning httpd:2.4</h2>
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
                  <td className="py-2 pr-4 text-xs font-mono">httpd:2.4</td>
                  <td className="py-2 pr-4">2,574</td>
                  <td className="py-2 pr-4">218</td>
                  <td className="py-2 pr-4">517</td>
                  <td className="py-2 pr-4">543</td>
                  <td className="py-2">79</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-xs font-mono">httpd:2.4-alpine</td>
                  <td className="py-2 pr-4">524</td>
                  <td className="py-2 pr-4">64</td>
                  <td className="py-2 pr-4">234</td>
                  <td className="py-2 pr-4">201</td>
                  <td className="py-2">22</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ScanRook v1.14.2, warm-cache scan, 2026-07-04. Counts change as new advisories publish.
          </p>
          <p className="text-sm muted">
            About 80% of the findings disappear on the Alpine tag, consistent with the pattern
            across every Debian-vs-Alpine comparison in this series. The remaining findings on
            either tag are mostly base image packages, with one notable exception below.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The CVEs worth knowing about</h2>
          <p className="text-sm muted">
            The top critical findings in httpd:2.4 mix base-image noise with one that actually
            touches Apache directly:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>libapr1t64 &mdash; CVE-2022-24963.</strong> An integer overflow in Apache
              Portable Runtime, the library httpd itself links against for platform abstraction.
              Unlike most findings in this series, APR is not dormant build tooling &mdash; it is
              loaded and used by the running web server. Confirm your build&apos;s APR version
              against the fixed release before deprioritizing this one.
            </li>
            <li>
              <strong>liblzma5 &mdash; CVE-2024-3094.</strong> The 2024 xz-utils supply-chain
              backdoor. Check the exact liblzma5 version in your build against Debian&apos;s
              security tracker &mdash; the malicious code was caught before it reached stable
              releases broadly, but verify rather than assume.
            </li>
            <li>
              <strong>libnghttp2-14 &mdash; CVE-2015-8659.</strong> An HTTP/2 library issue from
              2015, relevant if your httpd configuration has HTTP/2 support enabled.
            </li>
            <li>
              <strong>perl-base &mdash; CVE-2017-20230.</strong> Perl ships in the base image for
              system scripts; Apache HTTP Server doesn&apos;t invoke it during normal request
              handling.
            </li>
            <li>
              <strong>bsdutils &mdash; CVE-2015-5224.</strong> Core Debian utilities present for
              basic system operations, not part of the httpd process.
            </li>
          </ul>
          <p className="text-sm muted">
            The APR finding is the one to actually triage first here; the rest follow the
            reachability pattern covered in{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs. advisory matching
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which tag should you use?</h2>
          <p className="text-sm muted">
            For most deployments, <strong>httpd:2.4-alpine</strong> is the better default: same
            Apache HTTP Server release, about 80% fewer findings in our scan. The tradeoff is
            musl libc instead of glibc, which occasionally affects third-party Apache modules
            compiled for glibc specifically.
          </p>
          <p className="text-sm muted">
            Stay on the Debian-based tag if you load modules only distributed as glibc binaries.
            Either way, verify the APR version directly rather than relying on the tag alone. For
            the broader tradeoffs between base image families, see{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>
            , and automate the comparison in CI with{" "}
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              our GitHub Actions scanning workflow
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Hardening checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Run as a non-root user; the image supports switching the worker processes off root via <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">User</code>/<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">Group</code> directives.</li>
            <li>
              Pin the image by digest (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">httpd@sha256:&hellip;</code>)
              so deploys are reproducible.
            </li>
            <li>Disable unused Apache modules to shrink both the attack surface and the finding count.</li>
            <li>Turn off <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">ServerTokens</code> and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">ServerSignature</code> so responses stop advertising your exact httpd and module versions.</li>
            <li>Mount the container filesystem read-only where your configuration allows it.</li>
            <li>Rebuild and redeploy on a schedule so base image and APR patches actually reach you.</li>
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
docker save httpd:2.4 -o httpd.tar
scanrook scan httpd.tar`}</pre>
          <p className="text-sm muted">
            The full CLI reference, including JSON output and severity gating for CI, is in{" "}
            <Link href="/docs" className="underline">the docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is the httpd Docker image safe to use?</h3>
              <p className="text-sm muted mt-1">
                Broadly yes. Apache HTTP Server is patched quickly; most findings come from the
                Debian base. One finding, CVE-2022-24963 in APR, is worth checking directly since
                it touches httpd&apos;s own dependency.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why does httpd have so many vulnerabilities?</h3>
              <p className="text-sm muted mt-1">
                The default tag ships a full Debian userland; every package in it carries its own
                advisory history, inflating the count well beyond Apache&apos;s own code.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is httpd:alpine more secure?</h3>
              <p className="text-sm muted mt-1">
                It has a much smaller attack surface: 524 findings vs 2,574 in our scan, about 80%
                fewer, because musl libc and BusyBox replace the full GNU userland.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is the CVE-2022-24963 finding about?</h3>
              <p className="text-sm muted mt-1">
                An integer overflow in Apache&apos;s own APR library, which httpd actually loads
                and uses &mdash; check your build&apos;s APR version against the fixed release.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan your httpd image with ScanRook</h3>
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
