import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-28";

const title = `Is the Golang Docker Image Safe? What Our Scanner Found | ${APP_NAME}`;
const description =
  "We scanned golang:1.23 with ScanRook: 18,152 findings (568 critical). What that means, which CVEs matter, and why the Alpine tag cuts findings by 98%.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "is golang docker image safe",
    "golang docker image vulnerabilities",
    "golang:1.23 cve",
    "go docker security",
    "golang alpine image security",
    "golang container security",
    "golang image scan",
    "safest golang docker tag",
    "multi-stage go docker build security",
    "golang docker best practices",
  ],
  alternates: { canonical: "/blog/is-golang-docker-image-safe" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/is-golang-docker-image-safe",
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
  headline: "Is the Golang Docker Image Safe? What Our Scanner Found",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/is-golang-docker-image-safe",
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
      name: "Is the golang Docker image safe to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes for building, and it usually should not ship to production at all. The golang image is a build-time toolchain: compiler, standard library source, and build caches. Nearly every finding in our scan comes from its Debian base layer. The real safety question is whether your final runtime image still contains that toolchain, which it should not in a correct multi-stage build.",
      },
    },
    {
      "@type": "Question",
      name: "Why does the golang Docker image have so many vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "golang:1.23 is built on Debian and ships a full userland alongside the Go toolchain: GnuPG utilities, dirmngr, and other packages used to verify and fetch dependencies during builds. Each carries its own advisory history. Our scan found 18,152 findings, almost entirely attributable to that base layer rather than the Go toolchain itself.",
      },
    },
    {
      "@type": "Question",
      name: "Is golang:1.23-alpine more secure than the default Go image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It has a much smaller attack surface as a builder image: 379 findings (23 critical) versus 18,152 (568 critical) in our scan, roughly 98% fewer. But the bigger security win is not shipping the Go toolchain to production at all — compile a static binary and copy it into a minimal or distroless final image.",
      },
    },
    {
      "@type": "Question",
      name: "Should I ship the golang image to production?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Go compiles to a single static binary in most configurations, so production containers do not need a compiler, standard library source, or build tooling. Use a multi-stage Dockerfile: compile in a golang builder stage, then COPY only the binary into a scratch, distroless, or Alpine final stage.",
      },
    },
    {
      "@type": "Question",
      name: "How do I scan the golang Docker image for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Export the image with docker save, then run a scanner against it. With ScanRook: install the CLI, run docker save golang:1.23 -o golang.tar, then scanrook scan golang.tar. You get a severity breakdown and per-package findings — run it against both your builder and final images.",
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
            Is the Golang Docker Image Safe? What Our Scanner Found
          </h1>
          <p className="text-sm muted">Published July 28, 2026 &middot; 6 min read</p>
          <p className="text-sm muted">
            Go&apos;s official Docker image is one of the most-pulled build tools on Docker Hub, so
            &ldquo;is the golang Docker image safe&rdquo; matters even if it never reaches
            production. We scanned{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">golang:1.23</code>{" "}
            and its Alpine variant with ScanRook and looked at what the findings actually mean.
          </p>
        </header>

        <img
          src="/blog/series-image-safety-2.jpg"
          alt="Is the golang Docker image safe — container image safety series"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-2">
          <h2 className="text-sm font-semibold">The verdict</h2>
          <p className="text-sm muted leading-relaxed">
            Mostly yes, with an important caveat: the golang image is a build-time tool, not a
            runtime you should deploy. Its large finding count comes almost entirely from the
            Debian base operating system it ships on top of, not from the Go toolchain. The
            practical risk is not the builder image itself &mdash; it is accidentally shipping that
            builder (or its Debian base) to production instead of copying a compiled static binary
            into a minimal final image.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What we found scanning golang:1.23</h2>
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
                  <td className="py-2 pr-4 text-xs font-mono">golang:1.23</td>
                  <td className="py-2 pr-4">18,152</td>
                  <td className="py-2 pr-4">568</td>
                  <td className="py-2 pr-4">5,027</td>
                  <td className="py-2 pr-4">10,173</td>
                  <td className="py-2">538</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-xs font-mono">golang:1.23-alpine</td>
                  <td className="py-2 pr-4">379</td>
                  <td className="py-2 pr-4">23</td>
                  <td className="py-2 pr-4">176</td>
                  <td className="py-2 pr-4">150</td>
                  <td className="py-2">10</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ScanRook v1.14.2, warm-cache scan, 2026-07-04. Counts change as new advisories publish.
          </p>
          <p className="text-sm muted">
            18,152 findings is a striking number for a build tool, but almost none of it is the Go
            toolchain. The Debian-based image ships GnuPG utilities, dirmngr, and a broad set of
            userland packages to support fetching and verifying dependencies during builds. The
            Alpine variant carries roughly 98% fewer findings because that userland is far smaller.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The CVEs worth knowing about</h2>
          <p className="text-sm muted">
            A few of the top critical findings from our scan illustrate what the totals are made of:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>dirmngr &mdash; CVE-2005-2023 and CVE-2006-6235</strong>. Dirmngr is GnuPG&apos;s
              certificate and key-server helper, pulled in to support signature verification during
              module downloads. These are old advisories against key-server communication; they have
              no code path that executes while a compiled Go binary runs.
            </li>
            <li>
              <strong>gnupg &mdash; the same two CVEs</strong>, CVE-2005-2023 and CVE-2006-6235,
              flagged against the GnuPG package itself. Like dirmngr, it exists to support build-time
              module verification and is not invoked at runtime by a Go application.
            </li>
            <li>
              <strong>gnupg-l10n &mdash; CVE-2005-2023</strong>. A translation/locale package for
              GnuPG. It contains no executable logic of its own; it is flagged purely because it
              shares a package family with the vulnerable binary.
            </li>
          </ul>
          <p className="text-sm muted">
            The consistent theme is that the riskiest-looking IDs sit in build-time signature-
            verification tooling, not in anything a compiled Go program touches at runtime. Our guide
            to{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs. advisory matching
            </Link>{" "}
            covers why scanners flag packages like this even when they are dormant.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which tag should you use?</h2>
          <p className="text-sm muted">
            For the builder stage, <strong>golang:1.23-alpine</strong> cuts findings dramatically:
            379 versus 18,152, and 23 critical versus 568 in our scan. But the tag you pick for the
            builder stage matters less than what you ship afterward. Go produces a single static
            binary in the common case (
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CGO_ENABLED=0</code>
            ), so your final image does not need Go, a C toolchain, or even a package manager.
          </p>
          <p className="text-sm muted">
            A typical pattern: <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">FROM golang:1.23-alpine AS builder</code>{" "}
            to compile, then <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">FROM scratch</code>{" "}
            or a distroless base for the final stage, copying in only the binary and any required
            certificates. That eliminates the builder&apos;s findings from your shipped artifact
            entirely. See{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>{" "}
            for how the final-stage choice affects your scan results, and our{" "}
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              guide to reducing CVEs in Docker images
            </Link>{" "}
            for the full multi-stage pattern.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Hardening checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Build with a multi-stage Dockerfile; never ship the golang builder image to production.</li>
            <li>Set <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CGO_ENABLED=0</code> for fully static binaries that run on scratch or distroless images.</li>
            <li>Run <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">govulncheck</code> against your module graph in CI, separately from scanning the container image.</li>
            <li>Pin the builder image by digest so your build is reproducible across CI runs.</li>
            <li>Run the final container as a non-root numeric UID; scratch and distroless images have no users defined by default, so set one explicitly.</li>
            <li>Vendor or checksum-verify your <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">go.sum</code> in CI to catch dependency tampering early.</li>
            <li>Rebuild the builder stage on a schedule so base-image patches reach your CI pipeline.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scan it yourself</h2>
          <p className="text-sm muted">
            Scan both your builder image and your final runtime image &mdash; they will look very
            different:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`curl -fsSL https://scanrook.io/install.sh | sh
docker save golang:1.23 -o golang.tar
scanrook scan golang.tar`}</pre>
          <p className="text-sm muted">
            The full CLI reference, including JSON output and severity gating for CI, is in{" "}
            <Link href="/docs" className="underline">the docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is the golang Docker image safe to use?</h3>
              <p className="text-sm muted mt-1">
                Yes as a build tool. Its findings come from the Debian base layer, not the Go
                toolchain. The real question is whether your production image still contains it —
                it should not, in a correct multi-stage build.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why does the image have so many vulnerabilities?</h3>
              <p className="text-sm muted mt-1">
                golang:1.23 ships a full Debian userland alongside the toolchain, including GnuPG and
                dirmngr for build-time verification. Each of those packages carries its own advisory
                history.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is golang:1.23-alpine more secure?</h3>
              <p className="text-sm muted mt-1">
                As a builder image, yes: 379 findings vs 18,152 in our scan, about 98% fewer. The
                bigger win is not shipping any Go toolchain to your final image at all.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should I ship the golang image to production?</h3>
              <p className="text-sm muted mt-1">
                No. Compile a static binary and copy it into a scratch or distroless final stage — Go
                does not need a compiler or base OS at runtime in the common case.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan your Go builds with ScanRook</h3>
          <p className="text-sm muted leading-relaxed">
            Upload your image tar or scan from the CLI and ScanRook matches every installed package
            against OSV, NVD, and vendor advisory data &mdash; with severity, exploit-probability,
            and confidence tiers so you can separate real runtime risk from builder-stage noise.
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
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              Installed-State Scanning vs. Advisory Matching
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
