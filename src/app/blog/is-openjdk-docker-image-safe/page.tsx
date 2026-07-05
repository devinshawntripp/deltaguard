import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-30";

const title = `Is the OpenJDK Docker Image Safe? What Our Scanner Found | ${APP_NAME}`;
const description =
  "We scanned eclipse-temurin:21 with ScanRook: 5,049 findings (297 critical). What the OpenJDK deprecation means, which CVEs matter, and how to cut findings 90%.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "is openjdk docker image safe",
    "openjdk docker image deprecated",
    "openjdk docker image vulnerabilities",
    "eclipse-temurin docker security",
    "java docker image cve",
    "openjdk alpine image security",
    "openjdk container security",
    "java docker image scan",
    "safest java docker tag",
    "eclipse temurin vs openjdk",
  ],
  alternates: { canonical: "/blog/is-openjdk-docker-image-safe" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/is-openjdk-docker-image-safe",
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
  headline: "Is the OpenJDK Docker Image Safe? What Our Scanner Found",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/is-openjdk-docker-image-safe",
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
      name: "Is the openjdk Docker image still safe to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The official openjdk image on Docker Hub is deprecated and no longer receives updates, which is a safety problem on its own regardless of scan results. The maintained successor is Eclipse Temurin, published by the Eclipse Adoptium project. If you are still pulling openjdk, migrate to eclipse-temurin before worrying about specific CVEs.",
      },
    },
    {
      "@type": "Question",
      name: "What replaced the openjdk Docker image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Eclipse Temurin, maintained by the Eclipse Adoptium working group (formerly AdoptOpenJDK), is the direct, actively maintained successor. It ships the same OpenJDK builds under a project that still publishes security updates and new base-image tags, which the original openjdk image no longer does.",
      },
    },
    {
      "@type": "Question",
      name: "How many vulnerabilities did ScanRook find in eclipse-temurin:21?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our scan of eclipse-temurin:21 found 5,049 findings, 297 of them critical, almost entirely from the Debian base layer it ships on top of the JDK. The eclipse-temurin:21-alpine variant found 496 findings with 44 critical, a roughly 90% reduction.",
      },
    },
    {
      "@type": "Question",
      name: "Is eclipse-temurin:21-alpine more secure than the default tag?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, substantially. Our scan found 496 findings (44 critical) for the Alpine variant versus 5,049 (297 critical) for the Debian-based tag, roughly 90% fewer, because Alpine's musl libc and BusyBox userland replace the full Debian toolchain underneath the JVM.",
      },
    },
    {
      "@type": "Question",
      name: "How do I scan a Java Docker image for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Export the image with docker save, then run a scanner against it. With ScanRook: install the CLI, run docker save eclipse-temurin:21 -o temurin.tar, then scanrook scan temurin.tar. Also scan your application layer separately, since dependency vulnerabilities like Log4Shell live in your JARs, not the base JDK image.",
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
            Is the OpenJDK Docker Image Safe? What Our Scanner Found
          </h1>
          <p className="text-sm muted">Published July 30, 2026 &middot; 7 min read</p>
          <p className="text-sm muted">
            &ldquo;Is the openjdk Docker image safe&rdquo; has an answer that starts before any CVE
            discussion: the official <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">openjdk</code>{" "}
            image on Docker Hub is deprecated. We scanned its maintained successor,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">eclipse-temurin:21</code>,
            with ScanRook and looked at what the findings actually mean.
          </p>
        </header>

        <img
          src="/blog/series-image-safety-3.jpg"
          alt="Is the OpenJDK Docker image safe — container image safety series"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-2">
          <h2 className="text-sm font-semibold">The verdict</h2>
          <p className="text-sm muted leading-relaxed">
            The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">openjdk</code>{" "}
            image itself: no, not for new projects &mdash; it is deprecated and no longer receives
            updates, which means it will only fall further behind on both JDK patches and base-image
            fixes. Its replacement, Eclipse Temurin, is actively maintained and, once you account for
            the same Debian-base-layer noise we see across other language runtimes, mostly yes with
            the usual caveats. Migrate off openjdk first; everything else in this article assumes
            you already have.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why we scanned eclipse-temurin instead of openjdk</h2>
          <p className="text-sm muted">
            Docker Hub&apos;s official <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">openjdk</code>{" "}
            image has been deprecated for some time and carries no active maintenance: no new JDK
            versions, no base-image security patches, nothing. Eclipse Temurin &mdash; built by the
            Eclipse Adoptium working group, the successor to AdoptOpenJDK &mdash; is the community&apos;s
            de facto replacement and the one we recommend and scanned here. If your Dockerfile still
            says <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">FROM openjdk:*</code>,
            switching the base image string is usually the entire migration.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What we found scanning eclipse-temurin:21</h2>
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
                  <td className="py-2 pr-4 text-xs font-mono">eclipse-temurin:21</td>
                  <td className="py-2 pr-4">5,049</td>
                  <td className="py-2 pr-4">297</td>
                  <td className="py-2 pr-4">1,397</td>
                  <td className="py-2 pr-4">1,602</td>
                  <td className="py-2">171</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-xs font-mono">eclipse-temurin:21-alpine</td>
                  <td className="py-2 pr-4">496</td>
                  <td className="py-2 pr-4">44</td>
                  <td className="py-2 pr-4">246</td>
                  <td className="py-2 pr-4">194</td>
                  <td className="py-2">9</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ScanRook v1.14.2, warm-cache scan, 2026-07-04. Counts change as new advisories publish.
          </p>
          <p className="text-sm muted">
            5,049 findings is meaningful for a JDK image, but the pattern is familiar: most of it is
            the Debian base operating system the JDK sits on top of, not the JVM or standard library.
            The Alpine variant carries roughly 90% fewer findings simply because it ships far less
            software beneath the JDK.
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
              disclosed in March 2024. The affected versions were narrow and fixed quickly; check the
              exact liblzma5 version in your image against the Debian security tracker rather than
              assuming this finding is live.
            </li>
            <li>
              <strong>CVE-2015-8659 (libnghttp2-14)</strong> &mdash; an old denial-of-service issue in
              the HTTP/2 library, present as a transitive dependency. Reachability depends on whether
              your JVM process or any bundled tooling makes HTTP/2 requests through that library.
            </li>
            <li>
              <strong>CVE-2017-20230 (perl-base)</strong> &mdash; Perl is bundled for build and
              packaging scripts, not invoked by a running JVM in a typical containerized deployment.
            </li>
            <li>
              <strong>CVE-2014-9939 and CVE-2018-12699 (binutils-x86-64-linux-gnu)</strong> &mdash;
              two advisories against the GNU binary utilities package, used for compiling and linking
              native code. It has no execution path in a container that only runs precompiled Java
              bytecode.
            </li>
          </ul>
          <p className="text-sm muted">
            None of these touch the JVM itself. The Java ecosystem&apos;s real high-severity incidents
            live at the application-dependency layer &mdash; our{" "}
            <Link href="/blog/log4shell-cve-2021-44228" className="underline">
              Log4Shell (CVE-2021-44228) deep dive
            </Link>{" "}
            covers the most consequential example, and it is a reminder to scan your JARs separately
            from the base image.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which tag should you use?</h2>
          <p className="text-sm muted">
            First: use <strong>eclipse-temurin</strong>, not <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">openjdk</code>.
            Within Temurin, <strong>eclipse-temurin:21-alpine</strong> is the better default where
            compatible &mdash; 496 findings and 44 critical in our scan, versus 5,049 and 297 on the
            Debian-based tag. Also consider a JRE-only tag if you do not need the full JDK
            (compiler, jshell, javadoc tooling) at runtime; a JRE drops packages a JDK carries purely
            for development use.
          </p>
          <p className="text-sm muted">
            Stay on the Debian-based tag if you rely on native libraries built against glibc that do
            not have musl-compatible builds, or you need compatibility with Debian-specific tooling
            in your deployment pipeline. See{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>{" "}
            for the broader tradeoffs between base image families.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Hardening checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Migrate off <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">openjdk</code> to <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">eclipse-temurin</code> if you have not already &mdash; the deprecated image gets no further patches at all.</li>
            <li>Use a JRE-only tag for runtime containers; keep the JDK only in your build stage.</li>
            <li>Build with <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">jlink</code> to produce a custom, minimal runtime image containing only the modules your application uses.</li>
            <li>Run the JVM as a non-root user &mdash; Temurin images typically ship one you can select explicitly.</li>
            <li>Pin the image by digest so deploys are reproducible across environments.</li>
            <li>Scan your application JARs and dependency tree separately from the base image; most real Java CVEs live there.</li>
            <li>Rebuild on a schedule so base-image and JDK security patches reach your deployments.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scan it yourself</h2>
          <p className="text-sm muted">
            Counts drift as new advisories publish, so verify against the exact tag and digest you
            deploy:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`curl -fsSL https://scanrook.io/install.sh | sh
docker save eclipse-temurin:21 -o temurin.tar
scanrook scan temurin.tar`}</pre>
          <p className="text-sm muted">
            The full CLI reference, including JSON output and severity gating for CI, is in{" "}
            <Link href="/docs" className="underline">the docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is the openjdk Docker image still safe to use?</h3>
              <p className="text-sm muted mt-1">
                It is deprecated and no longer updated, which is a risk on its own. Migrate to
                eclipse-temurin, the maintained successor, and treat the migration as a prerequisite
                to any CVE triage.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What replaced the openjdk image?</h3>
              <p className="text-sm muted mt-1">
                Eclipse Temurin, from the Eclipse Adoptium project, is the actively maintained
                successor and the image we recommend and scanned for this article.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is eclipse-temurin:21-alpine more secure?</h3>
              <p className="text-sm muted mt-1">
                Yes: 496 findings vs 5,049 in our scan, about 90% fewer, because Alpine&apos;s smaller
                userland replaces the full Debian toolchain beneath the JDK.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Do Java base-image CVEs matter as much as dependency CVEs?</h3>
              <p className="text-sm muted mt-1">
                Usually less. The base image&apos;s findings are mostly dormant Debian build tooling.
                Historically, the highest-impact Java vulnerabilities, like Log4Shell, come from
                application dependencies, so scan your JARs separately.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan your Java images with ScanRook</h3>
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
            <Link href="/blog/log4shell-cve-2021-44228" className="underline">
              Log4Shell (CVE-2021-44228) Explained
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              How to Reduce CVEs in Docker Images
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
