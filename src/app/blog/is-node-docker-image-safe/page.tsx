import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-12";

const title = `Is the Node Docker Image Safe? What Our Scanner Found | ${APP_NAME}`;
const description =
  "We scanned node:22 with ScanRook: 30,726 findings (1,794 critical). What that means, which CVEs matter, and why node:22-alpine cuts findings by 99%.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "is node docker image safe",
    "node docker image vulnerabilities",
    "node docker cve",
    "node:22 vulnerabilities",
    "node alpine image security",
    "nodejs container security",
    "node image scan",
    "safest node docker tag",
    "node docker security best practices",
    "node vulnerability scan",
  ],
  alternates: { canonical: "/blog/is-node-docker-image-safe" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/is-node-docker-image-safe",
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
  headline: "Is the Node Docker Image Safe? What Our Scanner Found",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/is-node-docker-image-safe",
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
      name: "Is the node Docker image safe to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends heavily on the tag. Our scan of node:22 found 30,726 findings, which sounds alarming but reflects the size of the Debian build toolchain bundled with it, not flaws in Node.js itself. node:22-alpine, built for the same Node.js release, came back with 306 findings — switching tags is the single biggest lever here.",
      },
    },
    {
      "@type": "Question",
      name: "Why does the node Docker image have so many vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The default node image bundles a full Debian build environment — compilers, GnuPG, dirmngr, the file utility, and more — so that native npm modules can compile at install time. Every one of those packages carries its own advisory history, which is why the finding count is so much larger than the Node.js runtime alone would suggest.",
      },
    },
    {
      "@type": "Question",
      name: "Is node:alpine more secure than the default node image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dramatically so in our scan: node:22 produced 30,726 findings (1,794 critical) while node:22-alpine produced 306 findings (23 critical) — about 99% fewer. The tradeoff is that native modules requiring glibc-specific build steps may need extra work to compile under musl libc.",
      },
    },
    {
      "@type": "Question",
      name: "How do I scan the node Docker image for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Export the image with docker save, then scan the resulting tar. With ScanRook: install the CLI, run docker save node:22 -o node.tar, then scanrook scan node.tar to get a severity breakdown and per-package findings you can triage.",
      },
    },
    {
      "@type": "Question",
      name: "Should I use a multi-stage build with the node image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Use the full node tag to install dependencies and build, then copy only the built application and production node_modules into a node:alpine or distroless runtime stage. This keeps the compiler toolchain out of what you actually ship.",
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
            Is the Node Docker Image Safe? What Our Scanner Found
          </h1>
          <p className="text-sm muted">Published July 12, 2026 &middot; 6 min read</p>
          <p className="text-sm muted">
            Node is one of the most common application base images in production, which makes
            &ldquo;is the node Docker image safe&rdquo; worth checking before you ship it. We
            scanned{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">node:22</code>{" "}
            and its Alpine variant with ScanRook and looked past the headline number to what it
            actually means.
          </p>
        </header>

        <img
          src="/blog/series-image-safety-4.jpg"
          alt="Is the node Docker image safe — container image safety series"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-2">
          <h2 className="text-sm font-semibold">The verdict</h2>
          <p className="text-sm muted leading-relaxed">
            Mostly yes, but the default tag is the wrong one for a production runtime. node:22
            bundles a full Debian build environment so that native npm modules can compile on
            install, and that toolchain is where the overwhelming majority of the 30,726 findings
            in our scan live &mdash; not in the Node.js runtime itself. The fix is architectural,
            not a patch: build with the full tag, then ship on node:22-alpine or a distroless
            runtime image that never had a compiler in it to begin with.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What we found scanning node:22</h2>
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
                  <td className="py-2 pr-4 text-xs font-mono">node:22</td>
                  <td className="py-2 pr-4">30,726</td>
                  <td className="py-2 pr-4">1,794</td>
                  <td className="py-2 pr-4">8,867</td>
                  <td className="py-2 pr-4">17,133</td>
                  <td className="py-2">1,058</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-xs font-mono">node:22-alpine</td>
                  <td className="py-2 pr-4">306</td>
                  <td className="py-2 pr-4">23</td>
                  <td className="py-2 pr-4">141</td>
                  <td className="py-2 pr-4">134</td>
                  <td className="py-2">8</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ScanRook v1.14.2, warm-cache scan, 2026-07-04. Counts change as new advisories publish.
          </p>
          <p className="text-sm muted">
            That is roughly a 99% reduction between tags for the same Node.js version. The gap is
            this large because node:22 ships a complete Debian build environment &mdash; GnuPG,
            dirmngr, the <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">file</code>{" "}
            utility, and compiler tooling &mdash; so node-gyp can build native addons at install
            time. node:22-alpine skips almost all of it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The CVEs worth knowing about</h2>
          <p className="text-sm muted">
            The top critical findings in node:22 sit in three build-tooling packages:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>dirmngr &mdash; CVE-2005-2023 and CVE-2006-6235.</strong> GnuPG&apos;s
              key-fetching helper, present so Debian&apos;s package manager can verify signatures.
              It has no role once your application is running &mdash; it only matters if something
              inside the container invokes <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">apt-get</code>.
            </li>
            <li>
              <strong>file &mdash; CVE-2004-1304.</strong> The Unix{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">file</code>{" "}
              command, used by build scripts to detect binary formats. A two-decade-old advisory
              against a utility your Node.js process almost certainly never invokes directly.
            </li>
            <li>
              <strong>gnupg &mdash; CVE-2005-2023 and CVE-2006-6235.</strong> The core GnuPG binary
              that dirmngr depends on, flagged for the same reason: it exists to support build-time
              package verification, not application logic.
            </li>
          </ul>
          <p className="text-sm muted">
            All three are classic build-toolchain findings. Our guide to{" "}
            <Link href="/blog/redhat-backporting-explained" className="underline">
              how vendors backport security patches
            </Link>{" "}
            explains why old CVE IDs like these can already be fixed in a current package even
            though the reported version number looks ancient.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which tag should you use?</h2>
          <p className="text-sm muted">
            Use <strong>node:22</strong> only as a build stage, and ship on{" "}
            <strong>node:22-alpine</strong> (or a distroless Node runtime) for production. A
            multi-stage Dockerfile installs dependencies and compiles native addons in the full
            image, then copies the built application and{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">node_modules</code>{" "}
            into the slim runtime stage. You get the compiler support you need at build time
            without shipping it.
          </p>
          <p className="text-sm muted">
            The exception is native addons that only build cleanly against glibc; in that case,
            stay on a Debian-based runtime tag and offset the risk with the hardening steps below.
            For the broader tradeoffs between base image families, see{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Hardening checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Use a multi-stage Dockerfile so the build toolchain never reaches your runtime image.</li>
            <li>Run <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">npm ci --omit=dev</code> in the final stage so dev dependencies aren&apos;t shipped either.</li>
            <li>Run the container as the built-in <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">node</code> non-root user.</li>
            <li>
              Pin the image by digest (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">node@sha256:&hellip;</code>)
              so builds are reproducible.
            </li>
            <li>Set <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">NODE_ENV=production</code> to disable dev-only behavior in frameworks that check it.</li>
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
docker save node:22 -o node.tar
scanrook scan node.tar`}</pre>
          <p className="text-sm muted">
            The full CLI reference, including JSON output and severity gating for CI, is in{" "}
            <Link href="/docs" className="underline">the docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is the node Docker image safe to use?</h3>
              <p className="text-sm muted mt-1">
                Mostly, but the default tag isn&apos;t meant for production. node:22 bundles a full
                Debian build toolchain; node:22-alpine cuts findings by about 99% for the same
                Node.js version.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why does node:22 have so many vulnerabilities?</h3>
              <p className="text-sm muted mt-1">
                It bundles compiler tooling and Debian package-verification utilities so native npm
                modules can build on install. Each package carries its own advisory history.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is node:alpine more secure?</h3>
              <p className="text-sm muted mt-1">
                Dramatically: 306 findings vs 30,726 in our scan, about 99% fewer, because it never
                shipped the build toolchain to begin with.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should I use a multi-stage build?</h3>
              <p className="text-sm muted mt-1">
                Yes. Build and compile native modules in node:22, then copy the application into a
                node:alpine or distroless runtime stage so the compiler never ships.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan your node image with ScanRook</h3>
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
            <Link href="/blog/container-security-checklist" className="underline">
              Container Image Security Checklist
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
