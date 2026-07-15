import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-23";

const title = `Ubuntu vs Debian: Which Docker Base Image to Choose | ${APP_NAME}`;
const description =
  "Ubuntu vs Debian as a Docker base image: real security, size, and support tradeoffs, plus a clear recommendation for most container workloads.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "ubuntu vs debian",
    "ubuntu vs debian docker",
    "debian vs ubuntu base image",
    "ubuntu vs debian container",
    "docker base image comparison",
    "debian slim docker",
    "ubuntu docker image security",
    "which docker base image",
    "debian bookworm vs ubuntu noble",
    "smallest secure base image",
  ],
  alternates: { canonical: "/blog/ubuntu-vs-debian-docker-base-image" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/ubuntu-vs-debian-docker-base-image",
    images: ["/blog/ubuntu-vs-debian-docker-base-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/ubuntu-vs-debian-docker-base-image.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Ubuntu vs Debian: Which Docker Base Image to Choose",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/ubuntu-vs-debian-docker-base-image",
  image: "https://scanrook.io/blog/ubuntu-vs-debian-docker-base-image.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Debian or Ubuntu more secure as a Docker base image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Neither is inherently more secure; they share the same Debian package base, apt tooling, and the practice of backporting security fixes. The differences that matter are support windows and update cadence. Ubuntu LTS offers five years of Canonical security maintenance (extendable with Ubuntu Pro), while Debian stable is covered by the Debian Security Team and then Debian LTS. For most images the slim variant you pick and how often you rebuild matter more than the distro.",
      },
    },
    {
      "@type": "Question",
      name: "Is Ubuntu based on Debian?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Ubuntu is derived from Debian, importing packages from Debian's unstable and testing branches and adding Canonical's own packaging, newer kernels and userland, and a fixed six-month release cadence. Because they share dpkg and apt, moving a Dockerfile between debian:12-slim and ubuntu:24.04 is usually a matter of adjusting a few package names.",
      },
    },
    {
      "@type": "Question",
      name: "Should I use debian:12 or debian:12-slim?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use the slim variant for almost all container workloads. debian:12-slim drops documentation, locales, and other host-oriented files you do not need in a container, cutting size and attack surface while keeping full apt compatibility. Reach for the non-slim image only if you hit a missing file you cannot easily reinstall.",
      },
    },
    {
      "@type": "Question",
      name: "Does a lower package version mean Debian is unpatched?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not necessarily. Both Debian and Ubuntu backport security fixes into the stable package version rather than bumping to a new upstream release. A package that looks old by version string may already contain the fix for a given CVE. This is why accurate scanners read distribution security data rather than comparing version numbers alone.",
      },
    },
    {
      "@type": "Question",
      name: "Which is smaller, Ubuntu or Debian?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They are close. A minimal ubuntu:24.04 and debian:12-slim both land in the tens of megabytes unpacked, with debian-slim usually a touch smaller. The full debian:12 image is larger because it includes extra files. If image size is a primary concern, both are beaten by Alpine or distroless bases.",
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
          <div className="text-xs uppercase tracking-wide muted">Best practices</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Ubuntu vs Debian: Which Docker Base Image to Choose
          </h1>
          <p className="text-sm muted">Published July 23, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            Ubuntu vs Debian is one of the oldest debates in Linux, but for a Docker base image the
            practical differences are narrower than the forum threads suggest. They share a package
            base, tooling, and security model. This is what actually separates them for containers
            &mdash; support windows, size, and compatibility &mdash; and a clear recommendation for
            most workloads.
          </p>
        </header>

        <section className="mt-1 rounded-xl border border-black/10 dark:border-white/10 bg-black/[.03] dark:bg-white/[.03] p-5 grid gap-2">
          <h2 className="text-base font-semibold tracking-tight">The short answer</h2>
          <p className="text-sm muted">
            For most containers, <strong>debian:12-slim</strong> is the better default: it is small,
            stable, and conservatively maintained. Choose <strong>ubuntu:24.04</strong> when you
            need a specific Ubuntu package or PPA, newer userland than Debian stable ships, or the
            long Ubuntu Pro/ESM support window for compliance. Both are solid; the choice rarely
            comes down to security alone.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">They are closer than the debate suggests</h2>
          <p className="text-sm muted">
            Ubuntu is built <em>from</em> Debian. Canonical imports packages from Debian&apos;s
            unstable and testing branches, adds its own packaging and newer kernels and userland, and
            ships on a fixed six-month cadence with a Long Term Support (LTS) release every two years.
            Under the hood both use <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">dpkg</code>{" "}
            and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">apt</code>,
            both organize security fixes the same way, and both backport patches into stable package
            versions rather than chasing upstream releases. Porting a Dockerfile from one to the other
            is usually a matter of tweaking a couple of package names.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">At a glance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Dimension</th>
                  <th className="text-left py-2 pr-4 font-semibold">Debian (12 &ldquo;bookworm&rdquo;)</th>
                  <th className="text-left py-2 font-semibold">Ubuntu (24.04 &ldquo;noble&rdquo;)</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Steward</td>
                  <td className="py-2 pr-4 align-top">Debian Project (community)</td>
                  <td className="py-2 align-top">Canonical (commercial)</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Release cadence</td>
                  <td className="py-2 pr-4 align-top">~2 years, ships &ldquo;when ready&rdquo;</td>
                  <td className="py-2 align-top">Every 6 months; LTS every 2 years</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Security support</td>
                  <td className="py-2 pr-4 align-top">Debian Security Team, then Debian LTS (~5 yrs total)</td>
                  <td className="py-2 align-top">5 yrs (LTS), up to 10+ with Ubuntu Pro/ESM</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Package freshness</td>
                  <td className="py-2 pr-4 align-top">Conservative; frozen at release</td>
                  <td className="py-2 align-top">Generally newer userland</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">Approx. unpacked size</td>
                  <td className="py-2 pr-4 align-top">slim ~75 MB; full ~120 MB</td>
                  <td className="py-2 align-top">~78 MB</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            Sizes are approximate and shift with each rebuild and CPU architecture. The point is not
            the exact number but that a minimal Ubuntu and debian-slim are in the same ballpark.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Security: cadence, backporting, and support</h2>
          <p className="text-sm muted">
            The most important security fact about both distributions is that they <strong>backport
            </strong> fixes. When a CVE is fixed upstream, Debian and Ubuntu apply the patch to the
            version they already ship rather than upgrading to a whole new release. That keeps the
            stable ABI intact &mdash; and it means a package that looks outdated by version string
            may already be patched. Scanners that only compare version numbers misread this
            constantly; the same dynamic we describe for{" "}
            <Link href="/blog/redhat-backporting-explained" className="underline">
              Red Hat backporting
            </Link>{" "}
            applies to the Debian family.
          </p>
          <p className="text-sm muted">
            Where they diverge is time horizon. Ubuntu LTS gives you five years of Canonical security
            maintenance out of the box, extendable to a decade or more through Ubuntu Pro and Expanded
            Security Maintenance &mdash; useful if a compliance regime demands a long, contractual
            support window. Debian stable is maintained by the Debian Security Team until roughly a
            year after the next release, after which Debian LTS (community and vendor funded) extends
            coverage to about five years from the original release. Ubuntu ships newer userland more
            often, which cuts both ways: fewer end-of-life packages, but more change to absorb.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Size and attack surface</h2>
          <p className="text-sm muted">
            Fewer packages means fewer potential vulnerabilities, so size and attack surface move
            together. Both distributions offer trimmed images &mdash; always prefer{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">debian:12-slim</code>{" "}
            over the full <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">debian:12</code>,
            and use Ubuntu&apos;s minimal images. In practice a slim Debian and a minimal Ubuntu carry
            a similar footprint. Neither, however, is small compared with Alpine or a distroless base;
            if shrinking the number of shipped packages is your priority, look at those instead. We
            lay out the full spectrum in{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>{" "}
            and the practical size playbook in the{" "}
            <Link href="/blog/minimal-docker-images-guide" className="underline">
              minimal Docker image guide
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Compatibility and ecosystem</h2>
          <p className="text-sm muted">
            Both images use glibc and GNU coreutils, so they run essentially anything a full Linux
            userland expects &mdash; this is the compatibility advantage over musl-based Alpine.
            Ubuntu&apos;s edge is ecosystem reach: a great deal of third-party software ships{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.deb</code>{" "}
            packages, install docs, and PPAs targeting Ubuntu LTS first, and vendors frequently
            certify against it. Debian&apos;s edge is minimalism and predictability: no vendor
            telemetry decisions to reason about, a slower-moving base, and a slim image that is a
            touch leaner. For a self-contained Go, Rust, or Node service, either disappears into the
            background; for something that pulls in a large stack of system packages, check which
            distribution your dependencies target first.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which should you pick?</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Default to debian:12-slim</strong> for most services: small, stable,
              conservatively patched, and the leanest of the two full-userland options.
            </li>
            <li>
              <strong>Pick ubuntu:24.04</strong> when your dependencies, vendor docs, or PPAs target
              Ubuntu, when you want newer userland than Debian stable freezes at, or when you need the
              long Ubuntu Pro/ESM support window for compliance.
            </li>
            <li>
              <strong>Reach past both</strong> to Alpine or distroless when minimizing attack surface
              and image size outranks glibc compatibility and easy debugging.
            </li>
          </ul>
          <p className="text-sm muted">
            Whichever you choose, the bigger security lever is rebuild cadence. An image rebuilt
            weekly with <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--pull</code>{" "}
            picks up backported fixes automatically; one built once and forgotten accumulates known
            CVEs no matter which distro it started from. See{" "}
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              how to reduce CVEs in Docker images
            </Link>{" "}
            for the cadence playbook.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Migrating between them</h2>
          <p className="text-sm muted">
            Because both are apt/dpkg distributions, moving a Dockerfile from one to the other is
            usually low-drama &mdash; far easier than a jump to Alpine. The work is mostly swapping
            the base and reconciling a handful of package names:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# From this
FROM ubuntu:24.04
# To this
FROM debian:12-slim

# The apt workflow is identical; only some package names differ
RUN apt-get update \\
 && apt-get install -y --no-install-recommends ca-certificates curl \\
 && rm -rf /var/lib/apt/lists/*`}</pre>
          <p className="text-sm muted">
            A few things to check when you switch. Package names occasionally differ between the two
            repositories, so a build that assumed an Ubuntu-only package may need an adjustment. Any
            step that added a PPA will not work on Debian, which has no PPA mechanism. And confirm the
            default locale and any user your image relies on still exist. Rebuild with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--pull</code>,
            run your test suite, and scan the result before and after so you can see exactly how the
            vulnerability profile changed rather than guessing.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scan whichever you choose</h2>
          <p className="text-sm muted">
            Because both distributions backport, the only reliable way to compare their real
            vulnerability exposure is to scan the images with a tool that reads distribution security
            data rather than guessing from version strings. ScanRook does exactly that: it reads the
            dpkg database inside the image and matches packages against OSV, NVD, and vendor advisory
            data, so a backported fix is recognized as a fix instead of a false positive.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`curl -fsSL https://scanrook.io/install.sh | sh

# Scan both candidates and compare the reports
docker save debian:12-slim -o debian.tar && scanrook scan debian.tar --out debian.json
docker save ubuntu:24.04   -o ubuntu.tar && scanrook scan ubuntu.tar --out ubuntu.json`}</pre>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is Debian or Ubuntu more secure?</h3>
              <p className="text-sm muted mt-1">
                Neither inherently. They share a package base and both backport fixes; the real
                differences are support windows and how often you rebuild.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is Ubuntu based on Debian?</h3>
              <p className="text-sm muted mt-1">
                Yes &mdash; Ubuntu imports from Debian and adds Canonical packaging, newer userland,
                and a fixed release cadence. Both use dpkg and apt.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">debian:12 or debian:12-slim?</h3>
              <p className="text-sm muted mt-1">
                Use slim for almost everything &mdash; it drops files you do not need in a container,
                shrinking size and attack surface with no apt compatibility loss.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Which is smaller?</h3>
              <p className="text-sm muted mt-1">
                They are close; debian-slim is usually a touch smaller than minimal Ubuntu. Both are
                beaten handily by Alpine and distroless.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Compare base images on real scan data</h3>
          <p className="text-sm muted leading-relaxed">
            Do not pick a base image on reputation. Scan debian:12-slim and ubuntu:24.04 with
            ScanRook and compare the findings, with backported fixes correctly recognized and each
            result tagged with its advisory source.
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
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              How to Scan a Docker Image for Vulnerabilities
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
