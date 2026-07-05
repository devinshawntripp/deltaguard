import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-09";

const title = `Is the WordPress Docker Image Safe? What Our Scanner Found | ${APP_NAME}`;
const description =
  "We scanned wordpress:6.8 with ScanRook: 23,132 findings (733 critical). What that means, which CVEs matter, and why the Alpine FPM tag cuts findings 96%.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "is wordpress docker image safe",
    "wordpress docker image vulnerabilities",
    "wordpress:6.8 cve",
    "wordpress docker security",
    "wordpress fpm alpine security",
    "wordpress container security",
    "wordpress image scan",
    "safest wordpress docker tag",
    "wordpress plugin security docker",
    "wordpress docker best practices",
  ],
  alternates: { canonical: "/blog/is-wordpress-docker-image-safe" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/is-wordpress-docker-image-safe",
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
  headline: "Is the WordPress Docker Image Safe? What Our Scanner Found",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/is-wordpress-docker-image-safe",
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
      name: "Is the WordPress Docker image safe to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Mostly yes, with real caveats specific to WordPress. WordPress core is patched quickly, and most of the 23,132 findings we scanned come from the bundled Apache/Debian/PHP base layer, not WordPress itself. The larger practical risk for WordPress specifically is the plugin and theme ecosystem, which sits outside any base-image scan entirely.",
      },
    },
    {
      "@type": "Question",
      name: "Why does the WordPress Docker image have so many vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The default wordpress:6.8 tag bundles Apache, PHP, and a full Debian userland alongside WordPress core. Our scan found 23,132 findings, the highest count in this series, almost entirely attributable to that combined base and language-runtime layer rather than WordPress's own codebase.",
      },
    },
    {
      "@type": "Question",
      name: "Is wordpress:6.8-fpm-alpine more secure than the default image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dramatically so: our scan found 914 findings (120 critical) for wordpress:6.8-fpm-alpine versus 23,132 (733 critical) for the default tag, roughly 96% fewer. The tradeoff is that the fpm-alpine variant does not bundle Apache, so you need your own web server (typically nginx) in front of it.",
      },
    },
    {
      "@type": "Question",
      name: "Do WordPress plugins affect the Docker image's vulnerability count?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No, not the base image scan — plugins and themes you install live in the WordPress content directory, not in the container's installed packages, so a container scanner does not see them. Plugin vulnerabilities are the single largest source of real-world WordPress compromises and need separate tracking through WordPress-specific vulnerability databases.",
      },
    },
    {
      "@type": "Question",
      name: "How do I scan the WordPress Docker image for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Export the image with docker save, then run a scanner against it. With ScanRook: install the CLI, run docker save wordpress:6.8 -o wordpress.tar, then scanrook scan wordpress.tar. This covers the base image and PHP runtime; track plugin CVEs separately through WordPress-specific advisory sources.",
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
            Is the WordPress Docker Image Safe? What Our Scanner Found
          </h1>
          <p className="text-sm muted">Published August 9, 2026 &middot; 7 min read</p>
          <p className="text-sm muted">
            WordPress powers a huge share of the web, which makes &ldquo;is the WordPress Docker
            image safe&rdquo; worth answering carefully rather than with a slogan. We scanned{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">wordpress:6.8</code>{" "}
            and its Alpine FPM variant with ScanRook and looked at what the findings actually mean.
          </p>
        </header>

        <img
          src="/blog/series-image-safety-3.jpg"
          alt="Is the WordPress Docker image safe — container image safety series"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-2">
          <h2 className="text-sm font-semibold">The verdict</h2>
          <p className="text-sm muted leading-relaxed">
            Mostly yes for the base image, with a real caveat that is specific to WordPress. Core
            WordPress is patched quickly and the bulk of the 23,132 findings in our scan of the
            default tag come from the bundled Apache, PHP, and Debian layers underneath it, not
            WordPress&apos;s own code. The larger practical risk for any real WordPress site is the
            plugin and theme ecosystem, which is invisible to a container scan entirely and is where
            most real-world WordPress compromises actually originate.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What we found scanning wordpress:6.8</h2>
          <p className="text-sm muted">
            We exported the image with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker save</code>{" "}
            and scanned it with ScanRook, which matches every installed package against OSV, NVD,
            and vendor advisory data. Here is the severity breakdown for the default Apache-based tag
            and the FPM Alpine variant:
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
                  <td className="py-2 pr-4 text-xs font-mono">wordpress:6.8</td>
                  <td className="py-2 pr-4">23,132</td>
                  <td className="py-2 pr-4">733</td>
                  <td className="py-2 pr-4">6,071</td>
                  <td className="py-2 pr-4">11,408</td>
                  <td className="py-2">368</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-xs font-mono">wordpress:6.8-fpm-alpine</td>
                  <td className="py-2 pr-4">914</td>
                  <td className="py-2 pr-4">120</td>
                  <td className="py-2 pr-4">415</td>
                  <td className="py-2 pr-4">348</td>
                  <td className="py-2">24</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ScanRook v1.14.2, warm-cache scan, 2026-07-04. Counts change as new advisories publish.
          </p>
          <p className="text-sm muted">
            23,132 findings is the highest total in our container image safety series so far, and
            almost none of it is WordPress core. The default tag bundles Apache and a full PHP
            runtime on Debian, stacking three layers of userland software on top of each other. The
            Alpine FPM variant carries roughly 96% fewer findings by dropping Apache entirely and
            shrinking the base layer.
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
              disclosed in March 2024. Check the exact liblzma5 version against the Debian security
              tracker before treating this as live in your build.
            </li>
            <li>
              <strong>CVE-2015-8659 (libnghttp2-14)</strong> &mdash; an old HTTP/2 library
              denial-of-service issue, present as a transitive dependency of the bundled Apache/PHP
              stack.
            </li>
            <li>
              <strong>CVE-2017-20230 (libperl5.40 and perl-base)</strong> &mdash; the same advisory
              against two Perl packages used for build and packaging scripts, not invoked by a running
              WordPress/Apache/PHP process.
            </li>
            <li>
              <strong>CVE-2015-8104 (linux-libc-dev)</strong> &mdash; a kernel-header package used at
              compile time for native PHP extensions, with no runtime code path in the container.
            </li>
          </ul>
          <p className="text-sm muted">
            None of these are WordPress-specific. The vulnerabilities that actually compromise
            WordPress sites at scale almost always come from outdated plugins and themes, which live
            in your content volume, not the base image &mdash; see our{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs. advisory matching
            </Link>{" "}
            guide for why container scanners cannot see that layer at all.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which tag should you use?</h2>
          <p className="text-sm muted">
            For most deployments, <strong>wordpress:6.8-fpm-alpine</strong> paired with your own
            nginx reverse proxy is the better default: 914 findings and 120 critical in our scan,
            versus 23,132 and 733 on the bundled Apache tag. The operational tradeoff is real: the
            fpm-alpine tag only runs PHP-FPM, so you are responsible for running and configuring the
            web server in front of it, typically nginx.
          </p>
          <p className="text-sm muted">
            Stay on the default Apache tag if you want a simpler single-container setup and are
            comfortable with the larger finding count and its mostly-base-layer origin. Either way,
            plugin management matters more than base-image choice for WordPress specifically. See{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>{" "}
            for the broader base-image tradeoffs.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Hardening checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Use wordpress:6.8-fpm-alpine behind your own nginx or reverse proxy rather than the bundled Apache tag.</li>
            <li>Set <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">DISALLOW_FILE_EDIT</code> and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">DISALLOW_FILE_MODS</code> in wp-config.php to prevent in-admin code changes.</li>
            <li>Keep every plugin and theme updated; this matters far more for WordPress than base-image CVEs do.</li>
            <li>Restrict access to wp-admin and wp-login.php by IP or through your reverse proxy&apos;s auth layer.</li>
            <li>Mount the container filesystem read-only except for the uploads and content directories WordPress actually needs to write to.</li>
            <li>Pin the image by digest so deploys are reproducible.</li>
            <li>Rebuild and redeploy on a schedule to pick up base-image and PHP patches.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scan it yourself</h2>
          <p className="text-sm muted">
            Counts drift as new advisories publish, so verify against the exact tag and digest you
            deploy:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`curl -fsSL https://scanrook.io/install.sh | sh
docker save wordpress:6.8 -o wordpress.tar
scanrook scan wordpress.tar`}</pre>
          <p className="text-sm muted">
            The full CLI reference, including JSON output and severity gating for CI, is in{" "}
            <Link href="/docs" className="underline">the docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is the WordPress Docker image safe to use?</h3>
              <p className="text-sm muted mt-1">
                Mostly yes for the base image; most findings come from the bundled Apache/PHP/Debian
                layers. The bigger real-world risk is outdated plugins and themes, which sit outside
                the container scan.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why does the image have so many vulnerabilities?</h3>
              <p className="text-sm muted mt-1">
                The default tag stacks Apache, PHP, and a full Debian userland, and every package in
                that stack carries its own advisory history.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is wordpress:6.8-fpm-alpine more secure?</h3>
              <p className="text-sm muted mt-1">
                Yes: 914 findings vs 23,132 in our scan, about 96% fewer, by dropping Apache and
                shrinking the base layer — but you need your own web server in front of it.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Do plugins affect the vulnerability count?</h3>
              <p className="text-sm muted mt-1">
                No, plugins live in your content volume and are invisible to a container scan. Track
                plugin CVEs separately — they are the leading cause of real WordPress compromises.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan your WordPress image with ScanRook</h3>
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
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              How to Reduce CVEs in Docker Images
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
