import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-22";

const title = `Is the Mongo Docker Image Safe? What Our Scanner Found | ${APP_NAME}`;
const description =
  "We scanned mongo:8 with ScanRook: 2,457 findings (196 critical), including the xz-utils backdoor CVE. What that means and how to harden a MongoDB container.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "is mongo docker image safe",
    "mongodb docker image vulnerabilities",
    "mongo docker cve",
    "mongo:8 vulnerabilities",
    "mongodb container security",
    "mongo image scan",
    "mongo docker security best practices",
    "mongo vulnerability scan",
    "xz utils cve mongo",
    "mongodb docker hardening",
  ],
  alternates: { canonical: "/blog/is-mongo-docker-image-safe" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/is-mongo-docker-image-safe",
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
  headline: "Is the Mongo Docker Image Safe? What Our Scanner Found",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/is-mongo-docker-image-safe",
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
      name: "Is the mongo Docker image safe to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Broadly yes, with attention to base image patch level. Our scan of mongo:8 found 2,457 findings, 196 critical, concentrated in the Debian base image rather than MongoDB's own code. One finding — CVE-2024-3094 in liblzma5 — refers to the 2024 xz-utils supply-chain backdoor, worth checking your specific build against directly.",
      },
    },
    {
      "@type": "Question",
      name: "Why does the mongo Docker image have so many vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "mongo:8 is built on Debian, which ships a broad set of system libraries and utilities alongside MongoDB itself. Each package carries its own advisory history, so the scan reports the whole operating system layer, not just the mongod binary.",
      },
    },
    {
      "@type": "Question",
      name: "What is the CVE-2024-3094 finding in the mongo image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CVE-2024-3094 is the xz-utils backdoor discovered in early 2024, where malicious code was inserted into liblzma upstream and distributed in some Linux packages. It was caught before reaching stable Debian releases broadly, but any image reporting the affected liblzma5 version should be checked against Debian's security tracker directly rather than assumed safe or compromised from the CVE ID alone.",
      },
    },
    {
      "@type": "Question",
      name: "Is there an Alpine-based mongo Docker image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No — MongoDB does not publish an official Alpine build, largely because its server binary depends on glibc-specific behavior that doesn't translate cleanly to musl libc. Reducing the mongo image's footprint means trimming the Debian base through multi-stage builds rather than switching to Alpine.",
      },
    },
    {
      "@type": "Question",
      name: "How do I scan the mongo Docker image for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Export the image with docker save, then scan the tar. With ScanRook: install the CLI, run docker save mongo:8 -o mongo.tar, then scanrook scan mongo.tar for a severity breakdown and per-package findings.",
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
            Is the Mongo Docker Image Safe? What Our Scanner Found
          </h1>
          <p className="text-sm muted">Published July 22, 2026 &middot; 6 min read</p>
          <p className="text-sm muted">
            MongoDB is a common choice for document-oriented workloads, so &ldquo;is the mongo
            Docker image safe&rdquo; is worth checking with real scan data rather than assumption.
            We scanned{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">mongo:8</code>{" "}
            with ScanRook and found one finding in particular worth a closer look.
          </p>
        </header>

        <img
          src="/blog/series-image-safety-4.jpg"
          alt="Is the mongo Docker image safe — container image safety series"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-2">
          <h2 className="text-sm font-semibold">The verdict</h2>
          <p className="text-sm muted leading-relaxed">
            Broadly yes. MongoDB Inc. maintains the server actively, and the majority of the 2,457
            findings in our scan come from the Debian base image rather than the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">mongod</code>{" "}
            binary itself. The one finding that deserves individual attention rather than routine
            triage is CVE-2024-3094 &mdash; the xz-utils supply-chain backdoor &mdash; flagged
            against liblzma5. It is very likely your specific build predates or postdates the
            affected version window, but it is exactly the kind of finding worth confirming
            directly rather than skimming past.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What we found scanning mongo:8</h2>
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
                  <td className="py-2 pr-4 text-xs font-mono">mongo:8</td>
                  <td className="py-2 pr-4">2,457</td>
                  <td className="py-2 pr-4">196</td>
                  <td className="py-2 pr-4">454</td>
                  <td className="py-2 pr-4">545</td>
                  <td className="py-2">78</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ScanRook v1.14.2, warm-cache scan, 2026-07-04. Counts change as new advisories publish.
          </p>
          <p className="text-sm muted">
            MongoDB doesn&apos;t publish an official Alpine build, so unlike several other images
            in this series, there is no lighter sibling tag to compare against. The count here
            reflects a full Debian base plus MongoDB&apos;s own dependencies.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The CVEs worth knowing about</h2>
          <p className="text-sm muted">
            The top critical findings in mongo:8 span several unrelated base image packages:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>liblzma5 &mdash; CVE-2024-3094.</strong> The xz-utils backdoor: malicious
              code inserted into the upstream xz/liblzma project in early 2024, discovered before
              it reached stable Debian releases broadly. Similar in severity and public attention
              to the <Link href="/blog/log4shell-cve-2021-44228" className="underline">Log4Shell</Link>{" "}
              disclosure, though the exploitation mechanism was entirely different &mdash; a
              build-time backdoor rather than a runtime deserialization flaw. Check the exact
              liblzma5 version against Debian&apos;s security tracker for your build.
            </li>
            <li>
              <strong>libnghttp2-14 &mdash; CVE-2015-8659.</strong> An HTTP/2 library
              vulnerability from 2015, relevant only if something in the image actually
              negotiates HTTP/2 connections.
            </li>
            <li>
              <strong>perl-base &mdash; CVE-2017-20230.</strong> Perl ships in the base image for
              use by various system scripts; MongoDB itself doesn&apos;t invoke it during normal
              operation.
            </li>
            <li>
              <strong>bsdutils &mdash; CVE-2015-5224.</strong> Core Debian utilities bundled for
              basic system operations, not part of the MongoDB server process.
            </li>
            <li>
              <strong>krb5-locales &mdash; CVE-2004-0772.</strong> Localization data for
              Kerberos, relevant only if you&apos;ve configured MongoDB with Kerberos
              authentication.
            </li>
          </ul>
          <p className="text-sm muted">
            Our guide to{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs. advisory matching
            </Link>{" "}
            covers how to tell which of these findings are actually reachable in your deployment.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Reducing the footprint without Alpine</h2>
          <p className="text-sm muted">
            Since MongoDB doesn&apos;t ship an Alpine tag, the path to a smaller finding count is
            architectural rather than a tag swap. A multi-stage build that installs only the
            mongod binary and its runtime dependencies into a minimal Debian-slim or distroless
            final stage removes build-time tooling without touching glibc compatibility. See{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>{" "}
            for how distroless images compare on compatibility when Alpine isn&apos;t an option.
          </p>
          <p className="text-sm muted">
            Whatever base you land on, verify the reduction with real scan data rather than
            assuming it worked &mdash; see{" "}
            <Link href="/blog/trivy-alternatives" className="underline">
              our notes on comparing scanner output
            </Link>{" "}
            across tools before and after a base image change.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Hardening checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Enable authentication and TLS &mdash; MongoDB does not require auth by default in all deployment modes.</li>
            <li>Bind to an internal network only; never publish port 27017 to the public internet.</li>
            <li>Run the container as a non-root user rather than the default root.</li>
            <li>
              Pin the image by digest (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">mongo@sha256:&hellip;</code>)
              so deploys are reproducible.
            </li>
            <li>Enable role-based access control and avoid the built-in admin account for application connections.</li>
            <li>Rebuild and redeploy on a schedule so base image patches actually reach you.</li>
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
docker save mongo:8 -o mongo.tar
scanrook scan mongo.tar`}</pre>
          <p className="text-sm muted">
            The full CLI reference, including JSON output and severity gating for CI, is in{" "}
            <Link href="/docs" className="underline">the docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is the mongo Docker image safe to use?</h3>
              <p className="text-sm muted mt-1">
                Broadly yes. Our scan found 2,457 findings (196 critical), mostly in the Debian base
                image. One finding, CVE-2024-3094, is worth confirming individually rather than
                routine triage.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is the CVE-2024-3094 finding?</h3>
              <p className="text-sm muted mt-1">
                The xz-utils supply-chain backdoor discovered in early 2024, flagged against
                liblzma5. Check the exact version against Debian&apos;s security tracker for your
                build.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is there an Alpine-based mongo image?</h3>
              <p className="text-sm muted mt-1">
                No. MongoDB doesn&apos;t publish one due to glibc dependencies. A smaller footprint
                requires multi-stage builds rather than switching base families.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why does mongo have so many vulnerabilities?</h3>
              <p className="text-sm muted mt-1">
                It ships on Debian with a broad set of system libraries; each carries its own
                advisory history, inflating the count beyond MongoDB&apos;s own code.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan your mongo image with ScanRook</h3>
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
