import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-03";

const title = `Is the Memcached Docker Image Safe? What Our Scanner Found | ${APP_NAME}`;
const description =
  "We scanned memcached:1.6 with ScanRook: 1,627 findings (137 critical). What that means, which CVEs matter, and why the Alpine tag cuts findings by 81%.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "is memcached docker image safe",
    "memcached docker image vulnerabilities",
    "memcached:1.6 cve",
    "memcached docker security",
    "memcached alpine image security",
    "memcached container security",
    "memcached image scan",
    "safest memcached docker tag",
    "memcached exposed port security",
    "memcached docker best practices",
  ],
  alternates: { canonical: "/blog/is-memcached-docker-image-safe" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/is-memcached-docker-image-safe",
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
  headline: "Is the Memcached Docker Image Safe? What Our Scanner Found",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/is-memcached-docker-image-safe",
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
      name: "Is the Memcached Docker image safe to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Broadly yes. Memcached itself is a small, mature codebase with a slow, stable release cadence. Most findings in our scan of memcached:1.6 come from the Debian base operating system underneath it. The biggest practical risk with Memcached is operational — never exposing its UDP or TCP port to the public internet.",
      },
    },
    {
      "@type": "Question",
      name: "Why does the Memcached Docker image have so many vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "memcached:1.6 is built on Debian and ships a broader userland than the memcached daemon needs — compression and disk-utility libraries among them. Our scan found 1,627 findings, with most attributable to that base layer rather than the memcached binary itself.",
      },
    },
    {
      "@type": "Question",
      name: "Is memcached:1.6-alpine more secure than the default image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It has a smaller attack surface: our scan found 305 findings (23 critical) for memcached:1.6-alpine versus 1,627 (137 critical) for the default Debian-based tag, roughly 81% fewer, because Alpine ships less software beneath the memcached daemon.",
      },
    },
    {
      "@type": "Question",
      name: "Why should I never expose Memcached to the public internet?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Memcached has no authentication by default and its UDP protocol has historically been abused for large-scale reflection/amplification traffic when exposed publicly. This is an operational exposure risk independent of any CVE in the image — bind it to your internal network only.",
      },
    },
    {
      "@type": "Question",
      name: "How do I scan the Memcached Docker image for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Export the image with docker save, then run a scanner against it. With ScanRook: install the CLI, run docker save memcached:1.6 -o memcached.tar, then scanrook scan memcached.tar. You get a severity breakdown and per-package findings you can triage.",
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
            Is the Memcached Docker Image Safe? What Our Scanner Found
          </h1>
          <p className="text-sm muted">Published August 3, 2026 &middot; 6 min read</p>
          <p className="text-sm muted">
            Memcached is still a common caching layer in production stacks, so &ldquo;is the
            Memcached Docker image safe&rdquo; is worth answering with data. We scanned{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">memcached:1.6</code>{" "}
            and its Alpine variant with ScanRook and looked at what the findings actually mean.
          </p>
        </header>

        <img
          src="/blog/series-image-safety-5.jpg"
          alt="Is the Memcached Docker image safe — container image safety series"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-2">
          <h2 className="text-sm font-semibold">The verdict</h2>
          <p className="text-sm muted leading-relaxed">
            Mostly yes, with an important operational caveat. Memcached&apos;s own codebase is small,
            mature, and rarely produces new advisories. The finding count you see when scanning the
            image comes largely from the Debian base operating system underneath it. The real risk
            with Memcached is not code-level at all &mdash; it is exposing an unauthenticated cache
            server to an untrusted network. Fix the network exposure and the base image findings
            matter far less.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What we found scanning memcached:1.6</h2>
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
                  <td className="py-2 pr-4 text-xs font-mono">memcached:1.6</td>
                  <td className="py-2 pr-4">1,627</td>
                  <td className="py-2 pr-4">137</td>
                  <td className="py-2 pr-4">356</td>
                  <td className="py-2 pr-4">391</td>
                  <td className="py-2">46</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-xs font-mono">memcached:1.6-alpine</td>
                  <td className="py-2 pr-4">305</td>
                  <td className="py-2 pr-4">23</td>
                  <td className="py-2 pr-4">141</td>
                  <td className="py-2 pr-4">132</td>
                  <td className="py-2">8</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ScanRook v1.14.2, warm-cache scan, 2026-07-04. Counts change as new advisories publish.
          </p>
          <p className="text-sm muted">
            1,627 findings is a lot for such a small daemon, and almost none of it is memcached
            itself. The Debian base layer contributes compression libraries, disk utilities, and
            other packages memcached never touches. The Alpine tag carries roughly 81% fewer findings
            because that base layer is smaller.
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
              disclosed in March 2024. Verify the exact liblzma5 version in your image against the
              Debian security tracker rather than assuming this finding is currently exploitable.
            </li>
            <li>
              <strong>CVE-2017-20230 (perl-base)</strong> &mdash; Perl supports build and packaging
              scripts; the memcached daemon itself is a single compiled C binary that never invokes
              it.
            </li>
            <li>
              <strong>CVE-2015-5224 (bsdutils and libblkid1)</strong> &mdash; the same advisory
              flagged against two disk-utility packages unrelated to memcached&apos;s in-memory
              key-value store.
            </li>
            <li>
              <strong>CVE-2016-2090 (libbsd0)</strong> &mdash; a library providing BSD compatibility
              routines used by various Debian utilities, not by the memcached protocol implementation.
            </li>
          </ul>
          <p className="text-sm muted">
            The pattern is consistent with other minimal daemons on Debian bases: the finding count
            is dominated by base-layer utilities the application never calls. Our guide to{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs. advisory matching
            </Link>{" "}
            covers why scanners still report these dormant packages.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which tag should you use?</h2>
          <p className="text-sm muted">
            For most deployments, <strong>memcached:1.6-alpine</strong> is the better default: 305
            findings and 23 critical in our scan, versus 1,627 and 137 on the Debian-based tag. Same
            memcached daemon, smaller base layer.
          </p>
          <p className="text-sm muted">
            Stay on the Debian-based tag only if your infrastructure standardizes on Debian for
            compliance or debugging tooling reasons. Either way, the network exposure decision
            matters far more than the base image choice. See{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>{" "}
            for the wider comparison of base image families.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Hardening checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Never bind memcached&apos;s port (11211) to a public interface; restrict it to your internal network or a Unix socket.</li>
            <li>Enable SASL authentication if the cache is reachable from any network segment you do not fully control.</li>
            <li>Run the container as a non-root user and drop capabilities you do not need.</li>
            <li>Pin the image by digest so deploys are reproducible.</li>
            <li>Set an explicit memory limit (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">-m</code>) sized to your workload to avoid noisy-neighbor eviction.</li>
            <li>Disable the UDP listener if you only need TCP; UDP is the protocol most associated with reflection abuse when exposed.</li>
            <li>Rebuild and redeploy on a schedule to pick up base-image patches.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scan it yourself</h2>
          <p className="text-sm muted">
            Counts drift as new advisories publish, so verify against the exact tag and digest you
            deploy:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`curl -fsSL https://scanrook.io/install.sh | sh
docker save memcached:1.6 -o memcached.tar
scanrook scan memcached.tar`}</pre>
          <p className="text-sm muted">
            The full CLI reference, including JSON output and severity gating for CI, is in{" "}
            <Link href="/docs" className="underline">the docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is the Memcached Docker image safe to use?</h3>
              <p className="text-sm muted mt-1">
                Broadly yes. Memcached&apos;s codebase is small and stable; most findings come from
                the Debian base packages underneath it. Never expose the port publicly, and rebuild
                regularly.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why does the image have so many vulnerabilities?</h3>
              <p className="text-sm muted mt-1">
                memcached:1.6 ships a Debian userland broader than the daemon itself needs, and every
                package in it carries its own advisory history.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is memcached:1.6-alpine more secure?</h3>
              <p className="text-sm muted mt-1">
                It has a smaller attack surface: 305 findings vs 1,627 in our scan, about 81% fewer,
                because Alpine ships less software beneath the daemon.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why is public exposure the bigger risk?</h3>
              <p className="text-sm muted mt-1">
                Memcached has no authentication by default. An internet-exposed instance is a bigger
                practical risk than any base-image CVE — keep it on an internal network only.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan your Memcached image with ScanRook</h3>
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
            <Link href="/blog/on-prem-vs-saas-scanning" className="underline">
              On-Prem vs SaaS Vulnerability Scanning
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
