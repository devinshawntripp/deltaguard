import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-18";

const title = `Is the Ubuntu Docker Image Safe? What Our Scanner Found | ${APP_NAME}`;
const description =
  "We scanned ubuntu:24.04 with ScanRook: 1,365 findings (130 critical). What that means, which CVEs matter, and why the GHOST glibc bug still shows up.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "is ubuntu docker image safe",
    "ubuntu docker image vulnerabilities",
    "ubuntu docker cve",
    "ubuntu:24.04 vulnerabilities",
    "ubuntu container security",
    "ubuntu image scan",
    "ubuntu docker security best practices",
    "ubuntu vulnerability scan",
    "ghost cve ubuntu glibc",
    "ubuntu minimal image security",
  ],
  alternates: { canonical: "/blog/is-ubuntu-docker-image-safe" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/is-ubuntu-docker-image-safe",
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
  headline: "Is the Ubuntu Docker Image Safe? What Our Scanner Found",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/is-ubuntu-docker-image-safe",
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
      name: "Is the ubuntu Docker image safe to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Broadly yes. Our scan of ubuntu:24.04 found 1,365 findings, 130 critical — meaningfully less than Debian-based application images in this series because Ubuntu's default image ships a leaner set of packages. Most of what remains sits in package-verification tooling like gpgv and APT, not in software you actually run.",
      },
    },
    {
      "@type": "Question",
      name: "Why does the ubuntu Docker image have any critical vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Even the minimal ubuntu:24.04 image includes GnuPG's gpgv, APT's libapt-pkg, and glibc's libc-bin so it can install and verify additional packages. Each carries advisory history going back years, which scanners report even though the code paths are dormant unless something in the container invokes package management.",
      },
    },
    {
      "@type": "Question",
      name: "What is the GHOST vulnerability found in ubuntu images?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CVE-2015-0235, nicknamed GHOST, is a 2015 buffer overflow in glibc's gethostbyname functions, flagged against the libc-bin package. glibc is loaded by nearly every process on the system, so it is reachable in principle, but whether a current Ubuntu build is actually affected depends on Canonical's backport status for that CVE.",
      },
    },
    {
      "@type": "Question",
      name: "How do I scan the ubuntu Docker image for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Export the image with docker save, then scan the tar. With ScanRook: install the CLI, run docker save ubuntu:24.04 -o ubuntu.tar, then scanrook scan ubuntu.tar for a severity breakdown and per-package findings.",
      },
    },
    {
      "@type": "Question",
      name: "Is there an Alpine-based version of the ubuntu image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No — Canonical does not publish an Alpine variant of Ubuntu. If you want a smaller finding count than Ubuntu offers, the alternative is switching base image families entirely, to Alpine or a distroless image, rather than a lighter Ubuntu tag.",
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
            Is the Ubuntu Docker Image Safe? What Our Scanner Found
          </h1>
          <p className="text-sm muted">Published July 18, 2026 &middot; 5 min read</p>
          <p className="text-sm muted">
            Ubuntu is a common choice when a project needs more compatibility than Alpine offers,
            so &ldquo;is the ubuntu Docker image safe&rdquo; is a fair question before you build on
            it. We scanned{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">ubuntu:24.04</code>{" "}
            with ScanRook to see what the findings actually are.
          </p>
        </header>

        <img
          src="/blog/series-image-safety-2.jpg"
          alt="Is the ubuntu Docker image safe — container image safety series"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-2">
          <h2 className="text-sm font-semibold">The verdict</h2>
          <p className="text-sm muted leading-relaxed">
            Broadly yes. ubuntu:24.04 lands well below the Debian-based application images earlier
            in this series &mdash; 1,365 findings and 130 critical, versus figures in the thousands
            for images like postgres or node. Canonical maintains the base image actively, and the
            findings that do show up cluster in package-verification tooling (gpgv, APT) and glibc
            rather than in anything an application running inside the container would touch
            directly. The main practical risks are running an outdated tag, skipping rebuilds, and
            over-provisioning the container with privileges it doesn&apos;t need.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What we found scanning ubuntu:24.04</h2>
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
                  <td className="py-2 pr-4 text-xs font-mono">ubuntu:24.04</td>
                  <td className="py-2 pr-4">1,365</td>
                  <td className="py-2 pr-4">130</td>
                  <td className="py-2 pr-4">426</td>
                  <td className="py-2 pr-4">652</td>
                  <td className="py-2">128</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ScanRook v1.14.2, warm-cache scan, 2026-07-04. Counts change as new advisories publish.
          </p>
          <p className="text-sm muted">
            Ubuntu&apos;s default image is noticeably leaner than Debian-based application images
            like postgres or node in this series, which ship extra build-time tooling on top of
            their own base layer. Ubuntu&apos;s count here is closer to what you get from a bare
            OS image with nothing else installed on top.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The CVEs worth knowing about</h2>
          <p className="text-sm muted">
            The top critical findings in ubuntu:24.04 cluster in package management and the C
            library:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>gpgv &mdash; CVE-2005-2023 and CVE-2006-6235.</strong> GnuPG&apos;s signature
              verification tool, used by APT to check repository metadata. These are 2005&ndash;2006
              era advisories; the code path only runs during package installs.
            </li>
            <li>
              <strong>libapt-pkg6.0t64 &mdash; CVE-2009-1300 and CVE-2009-1358.</strong> APT&apos;s
              core package-handling library, flagged for advisories from 2009. Same story: exists
              in the image for package management, dormant in a running application container.
            </li>
            <li>
              <strong>libc-bin &mdash; CVE-2015-0235 (&ldquo;GHOST&rdquo;).</strong> A buffer
              overflow in glibc&apos;s{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">gethostbyname</code>{" "}
              functions. glibc loads into nearly every process, so this one is reachable in
              principle &mdash; check Canonical&apos;s security tracker for the specific package
              version before treating a decade-old glibc finding as actionable today.
            </li>
          </ul>
          <p className="text-sm muted">
            The GHOST finding is a good illustration of why CVE age alone isn&apos;t a risk signal.
            Our guide to{" "}
            <Link href="/blog/redhat-backporting-explained" className="underline">
              how vendors backport security patches
            </Link>{" "}
            covers why a package can show a decade-old CVE ID while already carrying the fix.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which tag should you use?</h2>
          <p className="text-sm muted">
            Pin <strong>ubuntu:24.04</strong> explicitly rather than tracking{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">latest</code>,
            and rebuild on a schedule so Canonical&apos;s patches actually reach your deployed
            containers. Unlike most images in this series, there is no official Alpine-based
            Ubuntu tag to switch to for a smaller footprint &mdash; Canonical doesn&apos;t publish
            one.
          </p>
          <p className="text-sm muted">
            If you want a meaningfully smaller finding count than Ubuntu offers, the path is
            switching base image families entirely rather than switching Ubuntu tags. See{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>{" "}
            for how those alternatives compare on compatibility and finding count, and{" "}
            <Link href="/blog/trivy-alternatives" className="underline">
              our scanner comparison notes
            </Link>{" "}
            if you want to validate the difference yourself before migrating.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Hardening checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Pin an explicit release tag (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">ubuntu:24.04</code>) and by digest for reproducible builds.</li>
            <li>Run <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">apt-get upgrade</code> during image builds to pick up patched packages before shipping.</li>
            <li>Remove APT and package-management tooling from the final image if your build process doesn&apos;t need it at runtime.</li>
            <li>Run the container as a non-root user via <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">useradd</code> in your Dockerfile.</li>
            <li>Use a multi-stage build so build-time tooling never reaches the final runtime image.</li>
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
docker save ubuntu:24.04 -o ubuntu.tar
scanrook scan ubuntu.tar`}</pre>
          <p className="text-sm muted">
            The full CLI reference, including JSON output and severity gating for CI, is in{" "}
            <Link href="/docs" className="underline">the docs</Link>. Automating this in CI is
            covered in{" "}
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              how to scan Docker images in GitHub Actions
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is the ubuntu Docker image safe to use?</h3>
              <p className="text-sm muted mt-1">
                Broadly yes. Our scan found 1,365 findings (130 critical), mostly in package
                management tooling rather than software an application would actually touch.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why does ubuntu have any critical vulnerabilities?</h3>
              <p className="text-sm muted mt-1">
                Even the minimal image ships gpgv, APT, and glibc for package management, each
                carrying its own advisory history that scanners report regardless of reachability.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is the GHOST vulnerability?</h3>
              <p className="text-sm muted mt-1">
                CVE-2015-0235, a 2015 glibc buffer overflow flagged against libc-bin. glibc loads
                into nearly every process, so check your specific build&apos;s patch status before
                treating it as actionable.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is there an Alpine-based ubuntu image?</h3>
              <p className="text-sm muted mt-1">
                No. Canonical doesn&apos;t publish one — switching to a smaller footprint means
                switching base image families entirely, not switching Ubuntu tags.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan your ubuntu-based image with ScanRook</h3>
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
            <Link href="/blog/trivy-alternatives" className="underline">
              Trivy Alternatives in 2026
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
