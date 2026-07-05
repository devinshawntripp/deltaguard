import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-01";

const title = `Is the RabbitMQ Docker Image Safe? What Our Scanner Found | ${APP_NAME}`;
const description =
  "We scanned rabbitmq:4 with ScanRook: 1,435 findings (118 critical). What that means, which CVEs matter, and why the Alpine tag cuts findings by 76%.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "is rabbitmq docker image safe",
    "rabbitmq docker image vulnerabilities",
    "rabbitmq:4 cve",
    "rabbitmq docker security",
    "rabbitmq alpine image security",
    "rabbitmq container security",
    "rabbitmq image scan",
    "safest rabbitmq docker tag",
    "rabbitmq management plugin security",
    "rabbitmq docker best practices",
  ],
  alternates: { canonical: "/blog/is-rabbitmq-docker-image-safe" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/is-rabbitmq-docker-image-safe",
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
  headline: "Is the RabbitMQ Docker Image Safe? What Our Scanner Found",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/is-rabbitmq-docker-image-safe",
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
      name: "Is the RabbitMQ Docker image safe to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Broadly yes. RabbitMQ itself is actively maintained by Broadcom/VMware and patched on a regular cadence. Most findings in our scan of rabbitmq:4 come from the Debian base operating system underneath it. The practical risks are exposing the management plugin publicly, leaving default credentials in place, and skipping rebuilds.",
      },
    },
    {
      "@type": "Question",
      name: "Why does the RabbitMQ Docker image have so many vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "rabbitmq:4 is built on Debian and ships a broader userland than the Erlang/RabbitMQ runtime needs on its own — compression libraries, disk utilities, and Perl tooling among them. Our scan found 1,435 findings, with most attributable to that base layer rather than RabbitMQ or Erlang.",
      },
    },
    {
      "@type": "Question",
      name: "Is rabbitmq:4-alpine more secure than the default image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It has a smaller attack surface: our scan found 339 findings (28 critical) for rabbitmq:4-alpine versus 1,435 (118 critical) for the default Debian-based tag, roughly 76% fewer, because Alpine ships less software beneath the Erlang runtime.",
      },
    },
    {
      "@type": "Question",
      name: "Should I expose the RabbitMQ management plugin publicly?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The management UI and API should sit behind your internal network or a VPN, never directly on the public internet. It is a common misconfiguration that turns a patched RabbitMQ instance into an exposed administrative surface, independent of any CVE in the image itself.",
      },
    },
    {
      "@type": "Question",
      name: "How do I scan the RabbitMQ Docker image for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Export the image with docker save, then run a scanner against it. With ScanRook: install the CLI, run docker save rabbitmq:4 -o rabbitmq.tar, then scanrook scan rabbitmq.tar. You get a severity breakdown and per-package findings you can triage.",
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
            Is the RabbitMQ Docker Image Safe? What Our Scanner Found
          </h1>
          <p className="text-sm muted">Published August 1, 2026 &middot; 6 min read</p>
          <p className="text-sm muted">
            RabbitMQ backs message queues for a huge share of production systems, so &ldquo;is the
            RabbitMQ Docker image safe&rdquo; is worth answering with data rather than assumptions.
            We scanned{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">rabbitmq:4</code>{" "}
            and its Alpine variant with ScanRook and looked at what the findings actually mean.
          </p>
        </header>

        <img
          src="/blog/series-image-safety-4.jpg"
          alt="Is the RabbitMQ Docker image safe — container image safety series"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-2">
          <h2 className="text-sm font-semibold">The verdict</h2>
          <p className="text-sm muted leading-relaxed">
            Mostly yes, with caveats. RabbitMQ and the Erlang runtime it depends on are actively
            maintained and patched on a predictable release schedule. The finding count you see when
            you scan the image comes largely from the Debian base operating system underneath it.
            The practical risks are operational, not code-level: exposing the management plugin to
            the public internet, leaving default credentials active, and not rebuilding to pick up
            base-image patches. All are fixable without touching your queues.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What we found scanning rabbitmq:4</h2>
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
                  <td className="py-2 pr-4 text-xs font-mono">rabbitmq:4</td>
                  <td className="py-2 pr-4">1,435</td>
                  <td className="py-2 pr-4">118</td>
                  <td className="py-2 pr-4">324</td>
                  <td className="py-2 pr-4">364</td>
                  <td className="py-2">46</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-xs font-mono">rabbitmq:4-alpine</td>
                  <td className="py-2 pr-4">339</td>
                  <td className="py-2 pr-4">28</td>
                  <td className="py-2 pr-4">154</td>
                  <td className="py-2 pr-4">146</td>
                  <td className="py-2">9</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ScanRook v1.14.2, warm-cache scan, 2026-07-04. Counts change as new advisories publish.
          </p>
          <p className="text-sm muted">
            1,435 findings is a moderate number compared to language-runtime images, and most of it
            still traces back to the Debian userland rather than RabbitMQ or Erlang/OTP. The Alpine
            tag carries roughly 76% fewer findings because that userland is smaller.
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
              disclosed in March 2024. Affected versions were narrow and pulled quickly; verify the
              exact liblzma5 version in your image against the Debian security tracker before
              treating this as live.
            </li>
            <li>
              <strong>CVE-2017-20230 (perl-base)</strong> &mdash; Perl is present to support build
              and packaging scripts, not invoked by the running RabbitMQ broker or Erlang VM at
              runtime.
            </li>
            <li>
              <strong>CVE-2015-5224 (bsdutils and libblkid1)</strong> &mdash; the same advisory
              flagged against two disk-utility packages. They handle block-device identification and
              are not part of RabbitMQ&apos;s message-handling path.
            </li>
            <li>
              <strong>CVE-2019-12900 (libbz2-1.0)</strong> &mdash; a compression-library
              denial-of-service issue. Reachability depends on whether anything in your deployment
              triggers bzip2 decompression through this library; RabbitMQ&apos;s own protocol does
              not use it.
            </li>
          </ul>
          <p className="text-sm muted">
            As with most Debian-based official images, the highest-severity IDs sit in base-layer
            utilities rather than the application you actually run. Our guide to{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs. advisory matching
            </Link>{" "}
            explains why scanners flag dormant packages like these at all.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which tag should you use?</h2>
          <p className="text-sm muted">
            For most deployments, <strong>rabbitmq:4-alpine</strong> is the better default: 339
            findings and 28 critical in our scan, versus 1,435 and 118 on the Debian-based tag. Same
            RabbitMQ and Erlang runtime, smaller base layer underneath it.
          </p>
          <p className="text-sm muted">
            Stay on the Debian-based tag if you need glibc-specific plugins or rely on Debian
            packaging conventions for your ops tooling. Either way, pin a specific version and
            rebuild on a schedule so patches actually reach your deployment. For the broader
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
            <li>Never expose the management UI or HTTP API (port 15672) directly to the public internet; keep it behind your internal network or a VPN.</li>
            <li>Disable or rotate the default <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">guest</code> account, which by default can only connect from localhost anyway &mdash; do not weaken that restriction.</li>
            <li>Enable TLS for both AMQP (5672/5671) and the management interface if it crosses any untrusted network segment.</li>
            <li>Run the container as the non-root <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">rabbitmq</code> user the official image already defines.</li>
            <li>Pin the image by digest so deploys are reproducible.</li>
            <li>Set resource limits on queues and connections to avoid a single misbehaving client exhausting the broker.</li>
            <li>Rebuild and redeploy on a schedule to pick up base-image and Erlang/OTP security patches.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scan it yourself</h2>
          <p className="text-sm muted">
            Counts drift as new advisories publish, so verify against the exact tag and digest you
            deploy:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`curl -fsSL https://scanrook.io/install.sh | sh
docker save rabbitmq:4 -o rabbitmq.tar
scanrook scan rabbitmq.tar`}</pre>
          <p className="text-sm muted">
            The full CLI reference, including JSON output and severity gating for CI, is in{" "}
            <Link href="/docs" className="underline">the docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is the RabbitMQ Docker image safe to use?</h3>
              <p className="text-sm muted mt-1">
                Broadly yes. RabbitMQ is actively maintained; most findings come from the Debian base
                packages underneath it. Keep the management plugin internal, rotate default
                credentials, and rebuild regularly.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why does the image have so many vulnerabilities?</h3>
              <p className="text-sm muted mt-1">
                rabbitmq:4 ships a Debian userland broader than RabbitMQ and Erlang strictly need, and
                every package in it carries its own advisory history.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is rabbitmq:4-alpine more secure?</h3>
              <p className="text-sm muted mt-1">
                It has a smaller attack surface: 339 findings vs 1,435 in our scan, about 76% fewer,
                because Alpine ships less software beneath the Erlang runtime.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should the management plugin be public?</h3>
              <p className="text-sm muted mt-1">
                No. Keep it behind your internal network or VPN. Exposing it publicly is an
                operational misconfiguration independent of any CVE in the image.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan your RabbitMQ image with ScanRook</h3>
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
            <Link href="/blog/cisa-kev-guide" className="underline">
              CISA KEV Guide
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
