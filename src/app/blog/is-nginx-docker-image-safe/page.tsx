import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-06";

const title = `Is the Nginx Docker Image Safe? What Our Scanner Found | ${APP_NAME}`;
const description =
  "We scanned nginx:1.27 with ScanRook: 2,952 findings (408 critical). What that means, which CVEs matter, and why the Alpine tag cuts findings by 79%.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "is nginx docker image safe",
    "nginx docker image vulnerabilities",
    "nginx docker cve",
    "nginx:1.27 vulnerabilities",
    "nginx alpine image security",
    "nginx container security",
    "nginx image scan",
    "safest nginx docker tag",
    "nginx docker security best practices",
    "nginx vulnerability scan",
  ],
  alternates: { canonical: "/blog/is-nginx-docker-image-safe" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/is-nginx-docker-image-safe",
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
  headline: "Is the Nginx Docker Image Safe? What Our Scanner Found",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/is-nginx-docker-image-safe",
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
      name: "Is the nginx Docker image safe to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Broadly yes, with caveats. Nginx itself is well-maintained and patched quickly. Most vulnerability findings in the nginx Docker image come from the Debian base operating system packages underneath it, not from nginx. Using the Alpine-based tag, rebuilding regularly, and running as non-root addresses the bulk of the practical risk.",
      },
    },
    {
      "@type": "Question",
      name: "Why does the nginx Docker image have so many vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The default nginx image is built on Debian, which ships a full userland: glibc, APT, GnuPG utilities, shells, and more. Every one of those packages carries its own advisory history, so scanners report findings against the whole operating system layer, not just the nginx binary. That is why our scan of nginx:1.27 found 2,952 findings while the smaller Alpine variant had 619.",
      },
    },
    {
      "@type": "Question",
      name: "Is nginx:alpine more secure than the default nginx image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It has a much smaller attack surface. In our scans, nginx:1.27 produced 2,952 findings (408 critical) while nginx:1.27-alpine produced 619 findings (84 critical) — roughly 79% fewer. Alpine uses musl libc and BusyBox instead of the full GNU userland, so there is simply less software present to carry vulnerabilities.",
      },
    },
    {
      "@type": "Question",
      name: "How do I scan the nginx Docker image for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Export the image to a tar archive with docker save, then run a scanner against it. With ScanRook: install the CLI, run docker save nginx:1.27 -o nginx.tar, then scanrook scan nginx.tar. You get a severity breakdown and per-package findings you can triage.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to fix every CVE reported in the nginx image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Many findings sit in packages that never execute at runtime — APT and GnuPG tooling, for example, only run during image builds. Triage by severity, exploitability, and whether the affected package is actually reachable in your running container. Switching to a smaller base tag eliminates whole categories of findings at once.",
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
            Is the Nginx Docker Image Safe? What Our Scanner Found
          </h1>
          <p className="text-sm muted">Published July 6, 2026 &middot; 6 min read</p>
          <p className="text-sm muted">
            Nginx is the most-pulled web server image on Docker Hub, which makes &ldquo;is the
            nginx Docker image safe&rdquo; a fair question before you ship it to production. We
            scanned <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">nginx:1.27</code>{" "}
            and its Alpine variant with ScanRook and looked at what the findings actually mean.
          </p>
        </header>

        <img
          src="/blog/series-image-safety-1.jpg"
          alt="Is the nginx Docker image safe — container image safety series"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-2">
          <h2 className="text-sm font-semibold">The verdict</h2>
          <p className="text-sm muted leading-relaxed">
            Mostly yes, with caveats. Nginx itself is actively maintained, security issues in the
            server are rare, and fixes land quickly. The large finding counts you see when you scan
            the image come overwhelmingly from the Debian base operating system underneath nginx
            &mdash; hundreds of packages, each with its own advisory history. The practical risks are
            using a bloated tag when a smaller one would do, running the container with more
            privilege than it needs, and never rebuilding to pick up base-image patches. All three
            are fixable in an afternoon.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What we found scanning nginx:1.27</h2>
          <p className="text-sm muted">
            We exported the image with <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker save</code>{" "}
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
                  <td className="py-2 pr-4 text-xs font-mono">nginx:1.27</td>
                  <td className="py-2 pr-4">2,952</td>
                  <td className="py-2 pr-4">408</td>
                  <td className="py-2 pr-4">928</td>
                  <td className="py-2 pr-4">1,361</td>
                  <td className="py-2">213</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-xs font-mono">nginx:1.27-alpine</td>
                  <td className="py-2 pr-4">619</td>
                  <td className="py-2 pr-4">84</td>
                  <td className="py-2 pr-4">263</td>
                  <td className="py-2 pr-4">242</td>
                  <td className="py-2">26</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ScanRook v1.14.2, warm-cache scan, 2026-07-04. Counts change as new advisories publish.
          </p>
          <p className="text-sm muted">
            The headline number looks alarming, but almost none of it is nginx. The Debian-based
            image ships a complete GNU userland &mdash; glibc, APT, GnuPG helpers, coreutils &mdash;
            and each package contributes findings. The Alpine tag, built on musl libc and BusyBox,
            carries roughly 79% fewer findings simply because it contains less software.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The CVEs worth knowing about</h2>
          <p className="text-sm muted">
            A few of the top critical findings from our scan illustrate what the totals are made of:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>CVE-2015-0235 (libc-bin)</strong> &mdash; the &ldquo;GHOST&rdquo; buffer
              overflow in glibc&apos;s <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">gethostbyname</code>{" "}
              functions, disclosed in 2015. glibc is loaded by nearly every process in the container,
              so it is reachable in principle &mdash; but whether a current Debian build is actually
              affected depends on vendor backport analysis. Check the Debian security tracker before
              treating a decade-old glibc finding as actionable.
            </li>
            <li>
              <strong>CVE-2005-2023 and CVE-2006-6235 (gpgv)</strong> &mdash; advisories from the
              2005&ndash;2006 era of GnuPG, flagged against the signature-verification helper that
              APT uses to validate repository metadata. In a running nginx container that never
              executes <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">apt-get</code>,
              this code path is effectively dormant; it matters during image builds, not at runtime.
            </li>
            <li>
              <strong>CVE-2009-1300 and CVE-2009-1358 (libapt-pkg6.0)</strong> &mdash; old advisories
              against APT&apos;s package-verification behavior. Same story: APT exists in the image
              so scanners report it, but nginx serving traffic never touches it. If you want these
              gone rather than triaged, a smaller base image removes APT entirely.
            </li>
          </ul>
          <p className="text-sm muted">
            The pattern is the common one for Debian-based official images: the riskiest-looking IDs
            live in build-time tooling and the base C library, not in the application you actually
            deployed. That does not make them ignorable &mdash; it makes them a triage exercise. Our
            guide to{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs. advisory matching
            </Link>{" "}
            covers why scanners disagree on exactly these packages.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which tag should you use?</h2>
          <p className="text-sm muted">
            For most deployments, <strong>nginx:1.27-alpine</strong> is the better default. Same
            upstream nginx, same configuration format, but 619 findings instead of 2,952 and 84
            critical instead of 408 in our scan. The tradeoffs are musl libc instead of glibc
            (relevant only if you compile custom modules against glibc) and BusyBox utilities
            instead of GNU ones for debugging inside the container.
          </p>
          <p className="text-sm muted">
            Stay on the Debian-based tag if you rely on dynamically loaded third-party modules built
            for glibc, or if your organization standardizes on Debian tooling for compliance
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
            <li>
              Use the unprivileged variant or run as a non-root user &mdash; the{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">nginxinc/nginx-unprivileged</code>{" "}
              image listens on 8080 and drops the root requirement.
            </li>
            <li>
              Pin the image by digest (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">nginx@sha256:&hellip;</code>),
              not just by tag, so deploys are reproducible.
            </li>
            <li>
              Drop Linux capabilities you do not need; nginx only requires{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">NET_BIND_SERVICE</code>{" "}
              when binding ports below 1024.
            </li>
            <li>Mount the container filesystem read-only and use a tmpfs for the cache and PID paths.</li>
            <li>
              Turn off <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">server_tokens</code>{" "}
              so error pages and headers stop advertising your exact nginx version.
            </li>
            <li>Rebuild and redeploy on a schedule &mdash; base image patches only reach you when you rebuild.</li>
            <li>Scan every build in CI so regressions are caught before they ship.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scan it yourself</h2>
          <p className="text-sm muted">
            Counts drift as new advisories publish, so verify against the exact tag and digest you
            deploy:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`curl -fsSL https://scanrook.io/install.sh | sh
docker save nginx:1.27 -o nginx.tar
scanrook scan nginx.tar`}</pre>
          <p className="text-sm muted">
            The full CLI reference, including JSON output and severity gating for CI, is in{" "}
            <Link href="/docs" className="underline">the docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is the nginx Docker image safe to use?</h3>
              <p className="text-sm muted mt-1">
                Broadly yes. Nginx itself is well-maintained and patched quickly; most findings come
                from the Debian base packages underneath it. Use the Alpine tag, run as non-root,
                and rebuild regularly to address the bulk of the practical risk.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why does the image have so many vulnerabilities?</h3>
              <p className="text-sm muted mt-1">
                The default tag ships a full Debian userland, and every package in it carries its
                own advisory history. Scanners report the whole operating system layer, not just the
                nginx binary.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is nginx:alpine more secure?</h3>
              <p className="text-sm muted mt-1">
                It has a much smaller attack surface: 619 findings vs 2,952 in our scan, about 79%
                fewer, because musl libc and BusyBox replace the full GNU toolchain.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Do I need to fix every reported CVE?</h3>
              <p className="text-sm muted mt-1">
                No. Triage by severity and reachability &mdash; build-time tooling like APT and gpgv
                never executes in a running nginx container. Switching to a smaller tag removes whole
                categories of findings at once.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan your nginx image with ScanRook</h3>
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
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              How to Scan a Docker Image for Vulnerabilities
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
