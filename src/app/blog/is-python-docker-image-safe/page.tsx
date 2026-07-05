import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-14";

const title = `Is the Python Docker Image Safe? What Our Scanner Found | ${APP_NAME}`;
const description =
  "We scanned python:3.12 with ScanRook: 31,590 findings (1,875 critical). What that means, which CVEs matter, and why the Alpine tag cuts findings by 99%.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "is python docker image safe",
    "python docker image vulnerabilities",
    "python docker cve",
    "python:3.12 vulnerabilities",
    "python alpine image security",
    "python container security",
    "python image scan",
    "safest python docker tag",
    "python docker security best practices",
    "python vulnerability scan",
  ],
  alternates: { canonical: "/blog/is-python-docker-image-safe" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/is-python-docker-image-safe",
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
  headline: "Is the Python Docker Image Safe? What Our Scanner Found",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/is-python-docker-image-safe",
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
      name: "Is the python Docker image safe to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on the tag. Our scan of python:3.12 found 31,590 findings, driven almost entirely by the Debian build toolchain bundled in for compiling C-extension packages, not by CPython itself. python:3.12-alpine, same Python version, came back with 404 findings — roughly 99% fewer.",
      },
    },
    {
      "@type": "Question",
      name: "Why does the python Docker image have so many vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The default python image ships a full Debian build environment — compilers, GnuPG, dirmngr, the file utility — so that pip can compile C extensions like numpy or cryptography from source if a prebuilt wheel isn't available. Every package in that toolchain carries its own advisory history.",
      },
    },
    {
      "@type": "Question",
      name: "Is python:alpine more secure than the default python image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In our scan, yes by a wide margin: python:3.12 produced 31,590 findings (1,875 critical) while python:3.12-alpine produced 404 findings (38 critical) — about 99% fewer. The tradeoff is that some packages with C extensions are slower to compile or unavailable as prebuilt wheels for musl libc.",
      },
    },
    {
      "@type": "Question",
      name: "How do I scan the python Docker image for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Export the image with docker save, then scan the tar. With ScanRook: install the CLI, run docker save python:3.12 -o python.tar, then scanrook scan python.tar for a severity breakdown and per-package findings.",
      },
    },
    {
      "@type": "Question",
      name: "Should I use python-slim instead of the full python image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "python-slim removes some but not all of the build toolchain and sits between the full image and Alpine in both size and finding count. It's a reasonable middle ground if Alpine's musl libc causes wheel-compatibility problems for your dependencies.",
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
            Is the Python Docker Image Safe? What Our Scanner Found
          </h1>
          <p className="text-sm muted">Published July 14, 2026 &middot; 6 min read</p>
          <p className="text-sm muted">
            Python is a default choice for data pipelines and backend services alike, so
            &ldquo;is the python Docker image safe&rdquo; matters before you build on it. We
            scanned{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">python:3.12</code>{" "}
            and its Alpine variant with ScanRook to see what a 31,590-finding scan result actually
            means in practice.
          </p>
        </header>

        <img
          src="/blog/series-image-safety-5.jpg"
          alt="Is the python Docker image safe — container image safety series"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-2">
          <h2 className="text-sm font-semibold">The verdict</h2>
          <p className="text-sm muted leading-relaxed">
            Mostly yes, but not on the default tag for production. python:3.12 ships a complete
            Debian build environment so pip can compile C extensions from source, and that
            toolchain accounts for nearly all of the 31,590 findings in our scan &mdash; not
            CPython itself. The fix mirrors what we recommend for other language runtimes in this
            series: build with the full tag if you need the compiler, then ship on
            python:3.12-alpine or a slim/distroless runtime that never carried the build tooling in
            the first place.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What we found scanning python:3.12</h2>
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
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 text-xs font-mono">python:3.12</td>
                  <td className="py-2 pr-4">31,590</td>
                  <td className="py-2 pr-4">1,875</td>
                  <td className="py-2 pr-4">9,213</td>
                  <td className="py-2 pr-4">17,514</td>
                  <td className="py-2">1,115</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-xs font-mono">python:3.12-alpine</td>
                  <td className="py-2 pr-4">404</td>
                  <td className="py-2 pr-4">38</td>
                  <td className="py-2 pr-4">179</td>
                  <td className="py-2 pr-4">174</td>
                  <td className="py-2">10</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ScanRook v1.14.2, warm-cache scan, 2026-07-04. Counts change as new advisories publish.
          </p>
          <p className="text-sm muted">
            That is about a 99% drop between tags for the same Python version, nearly identical to
            what we found scanning the Node.js image in this series. Both runtimes ship a full
            Debian build toolchain by default for the same reason: compiling native extensions on
            install.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The CVEs worth knowing about</h2>
          <p className="text-sm muted">
            The top critical findings in python:3.12 sit in build-tooling packages, not in CPython:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>dirmngr &mdash; CVE-2005-2023 and CVE-2006-6235.</strong> GnuPG&apos;s
              key-fetching helper, present for Debian&apos;s package-verification chain. It has no
              role in a running Python process.
            </li>
            <li>
              <strong>file &mdash; CVE-2004-1304.</strong> The Unix{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">file</code>{" "}
              command used to detect binary formats during builds. A two-decade-old advisory
              against a utility application code never invokes.
            </li>
            <li>
              <strong>gnupg &mdash; CVE-2005-2023 and CVE-2006-6235.</strong> The core GnuPG
              binary backing dirmngr, present for the same build-time verification purpose.
            </li>
          </ul>
          <p className="text-sm muted">
            This is the same pattern that shows up across every Debian-based language runtime
            image: build-toolchain findings that inflate the count without reflecting risk in the
            running application. Our guide to{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs. advisory matching
            </Link>{" "}
            explains why scanners still report them.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which tag should you use?</h2>
          <p className="text-sm muted">
            Use <strong>python:3.12</strong> only as a build stage if you need to compile C
            extensions, and ship on <strong>python:3.12-alpine</strong> for production. A
            multi-stage Dockerfile installs dependencies in the full image, then copies the
            installed site-packages into the slim runtime stage.
          </p>
          <p className="text-sm muted">
            If a dependency doesn&apos;t publish musl-compatible wheels and building from source
            under Alpine is impractical, python:3.12-slim is the middle ground &mdash; it trims
            most of the build toolchain while staying on glibc. Benchmark your dependency install
            under both before committing; see{" "}
            <Link href="/blog/trivy-alternatives" className="underline">
              our scanner comparison notes
            </Link>{" "}
            for how we approach that kind of tradeoff analysis.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Hardening checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Use a multi-stage Dockerfile so compilers never reach your runtime image.</li>
            <li>Install with <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">pip install --no-cache-dir</code> to avoid leaving wheel caches in image layers.</li>
            <li>Run the container as a dedicated non-root user rather than the default root.</li>
            <li>
              Pin the image by digest (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">python@sha256:&hellip;</code>)
              so builds are reproducible.
            </li>
            <li>Pin dependency versions in a lockfile (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">requirements.txt</code> with hashes, or Poetry/uv lockfiles).</li>
            <li>Rebuild and redeploy on a schedule so runtime image patches actually reach you.</li>
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
docker save python:3.12 -o python.tar
scanrook scan python.tar`}</pre>
          <p className="text-sm muted">
            The full CLI reference, including JSON output and severity gating for CI, is in{" "}
            <Link href="/docs" className="underline">the docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is the python Docker image safe to use?</h3>
              <p className="text-sm muted mt-1">
                Mostly, but not the default tag for production. python:3.12 bundles a Debian build
                toolchain; python:3.12-alpine cuts findings by about 99% for the same version.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why does python:3.12 have so many vulnerabilities?</h3>
              <p className="text-sm muted mt-1">
                It ships compiler tooling and package-verification utilities so pip can build C
                extensions from source. Each of those packages carries its own advisory history.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is python:alpine more secure?</h3>
              <p className="text-sm muted mt-1">
                Yes: 404 findings vs 31,590 in our scan, about 99% fewer, because Alpine never
                shipped the build toolchain to begin with.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should I use python-slim instead?</h3>
              <p className="text-sm muted mt-1">
                It&apos;s a middle ground if Alpine causes wheel-compatibility issues &mdash; fewer
                findings than the full image, but still on glibc for compatibility.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan your python image with ScanRook</h3>
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
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              How to Scan Docker Images in GitHub Actions
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
