import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-05";

const title = `Is the BusyBox Docker Image Safe? What Our Scanner Found | ${APP_NAME}`;
const description =
  "We scanned busybox:1.37 with ScanRook: 2 findings from a partial heuristic scan. What that means, which CVEs matter, and why busybox stays minimal.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "is busybox docker image safe",
    "busybox docker image vulnerabilities",
    "busybox:1.37 cve",
    "busybox docker security",
    "busybox container security",
    "busybox image scan",
    "minimal docker base image security",
    "busybox vs alpine security",
    "busybox docker best practices",
    "busybox image scan false negatives",
  ],
  alternates: { canonical: "/blog/is-busybox-docker-image-safe" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/is-busybox-docker-image-safe",
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
  headline: "Is the BusyBox Docker Image Safe? What Our Scanner Found",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/is-busybox-docker-image-safe",
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
      name: "Is the BusyBox Docker image safe to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, it is one of the safest base images available by design. BusyBox is a single static multi-call binary implementing dozens of Unix utilities, with almost no attack surface beyond that binary. Our scan of busybox:1.37 found only 2 findings, and the image contains essentially nothing else for a scanner or attacker to find.",
      },
    },
    {
      "@type": "Question",
      name: "Why did ScanRook only find 2 findings in busybox:1.37?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Partly because busybox is genuinely minimal — a single statically linked binary with no package manager, shell utilities bundled separately, or extra userland. But our scan was also partial: BusyBox's runtime inventory was not fully visible to heuristic-only analysis, so treat the count as a lower bound, not a complete result.",
      },
    },
    {
      "@type": "Question",
      name: "Does a low finding count mean busybox has no CVE history?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. BusyBox has had real CVEs over the years, including issues in its shell (ash) and various applets. Our scan found two recent advisories directly against the busybox package itself, and the busybox-binsh shell component has appeared in other minimal-image scans in our data with additional historical CVEs. Check the exact version you ship.",
      },
    },
    {
      "@type": "Question",
      name: "Is BusyBox more secure than Alpine as a base image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "BusyBox has an even smaller surface than Alpine, which itself already uses BusyBox for many of its shell utilities. Alpine adds a package manager (apk) and musl libc on top; BusyBox alone has neither. If your application is a single static binary with no need for a shell or package manager, BusyBox (or scratch) is the more minimal choice.",
      },
    },
    {
      "@type": "Question",
      name: "How do I scan the BusyBox Docker image for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Export the image with docker save, then run a scanner against it. With ScanRook: install the CLI, run docker save busybox:1.37 -o busybox.tar, then scanrook scan busybox.tar. For minimal images like this, also check public advisory trackers directly, since runtime-inventory scanning has less to work with.",
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
            Is the BusyBox Docker Image Safe? What Our Scanner Found
          </h1>
          <p className="text-sm muted">Published August 5, 2026 &middot; 6 min read</p>
          <p className="text-sm muted">
            BusyBox is about as small as a useful Linux base image gets, which makes &ldquo;is the
            BusyBox Docker image safe&rdquo; a slightly different question than for larger images. We
            scanned{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">busybox:1.37</code>{" "}
            with ScanRook and looked at what a near-empty finding count actually means.
          </p>
        </header>

        <img
          src="/blog/series-image-safety-1.jpg"
          alt="Is the BusyBox Docker image safe — container image safety series"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-2">
          <h2 className="text-sm font-semibold">The verdict</h2>
          <p className="text-sm muted leading-relaxed">
            Yes, with an honesty caveat about how we got there. BusyBox is a single static multi-call
            binary providing dozens of Unix utilities, with none of the package managers, interpreters,
            or userland sprawl that generate large finding counts in other base images. Our scan
            found only 2 findings against busybox:1.37 &mdash; but it was a partial, heuristic-only
            scan, because BusyBox&apos;s minimal design gives runtime-inventory tooling very little to
            enumerate. Treat the low count as consistent with BusyBox being genuinely minimal, not as
            proof there is nothing to find.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What we found scanning busybox:1.37</h2>
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
                  <td className="py-2 pr-4 text-xs font-mono">busybox:1.37</td>
                  <td className="py-2 pr-4">2</td>
                  <td className="py-2 pr-4">0</td>
                  <td className="py-2 pr-4">0</td>
                  <td className="py-2 pr-4">1</td>
                  <td className="py-2">1</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ScanRook v1.14.2, warm-cache scan, 2026-07-04. This scan was partial: BusyBox&apos;s
            runtime inventory was not fully visible to heuristic-only analysis, so counts understate
            reality. Counts also change as new advisories publish.
          </p>
          <p className="text-sm muted">
            We want to be direct about the limitation here rather than present a clean &ldquo;2
            findings&rdquo; number as the whole story. BusyBox&apos;s single-binary design means there
            is no package database for a scanner to enumerate the way it can with a Debian or Alpine
            userland, so a heuristic scan sees very little. That is exactly why the image is small and
            low-risk in the first place &mdash; but it also means you should supplement with public
            advisory data rather than treat this table as exhaustive.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The CVEs worth knowing about</h2>
          <p className="text-sm muted">
            Our scan surfaced two recent advisories directly against the busybox package itself:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>CVE-2025-60876 (busybox, medium)</strong> &mdash; a recent advisory against the
              busybox package. Check the fixed-in version against the exact BusyBox release you ship,
              since applet behavior varies by build configuration.
            </li>
            <li>
              <strong>CVE-2025-46394 (busybox, low)</strong> &mdash; a lower-severity advisory against
              the same package. As with the one above, verify against your specific tag and any
              custom applet selection.
            </li>
          </ul>
          <p className="text-sm muted">
            For broader context, other minimal images in our scan data ship a{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">busybox-binsh</code>{" "}
            shell package with a longer advisory history &mdash; CVE-2021-42377, CVE-2022-48174, and
            CVE-2016-2148 all appear against it in our Alpine-based scans. Those are historical issues
            in BusyBox&apos;s ash shell rather than the standalone busybox:1.37 image, but they are a
            useful reminder that &ldquo;minimal&rdquo; does not mean &ldquo;zero history.&rdquo; Given
            the partial-scan caveat above, cross-check the official BusyBox advisory list for the
            exact version you deploy.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which tag should you use?</h2>
          <p className="text-sm muted">
            BusyBox does not publish an Alpine-style alternate tag with a meaningfully different
            finding profile in our data &mdash; it is already about as small as a useful base image
            gets. The more relevant decision is BusyBox versus Alpine versus{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">scratch</code>{" "}
            for your specific use case: Alpine adds musl libc and an{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">apk</code>{" "}
            package manager on top of many of the same BusyBox utilities, which is useful if you need
            to install anything at runtime. BusyBox alone is the better fit if your container just
            needs a shell and coreutils-equivalent tools alongside a static binary, with nothing
            installable.
          </p>
          <p className="text-sm muted">
            If you need zero shell and zero utilities at all &mdash; just your compiled binary &mdash;
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5"> scratch</code>{" "}
            or a distroless base goes even further. See{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>{" "}
            for the full comparison.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Hardening checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Pin the image by digest, not just by tag, so builds are reproducible.</li>
            <li>Add a <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">USER</code> instruction in your derived image; the base busybox image runs as root by default.</li>
            <li>Do not layer a package manager on top just to add a few tools &mdash; that reintroduces the surface BusyBox avoids.</li>
            <li>Cross-check public advisory trackers (NVD, OSV) directly for your exact BusyBox version, since heuristic scans have limited visibility here.</li>
            <li>Rebuild periodically even though updates are infrequent &mdash; new advisories do land against BusyBox from time to time.</li>
            <li>If you only need a handful of applets, consider a custom static build with just those compiled in, shrinking the surface further.</li>
            <li>Verify image provenance (signed digests) if BusyBox is a base for anything in a supply-chain-sensitive pipeline.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scan it yourself</h2>
          <p className="text-sm muted">
            Counts drift as new advisories publish, so verify against the exact tag and digest you
            deploy, and supplement with a manual check of public advisory data given the limits of
            heuristic scanning on minimal images:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`curl -fsSL https://scanrook.io/install.sh | sh
docker save busybox:1.37 -o busybox.tar
scanrook scan busybox.tar`}</pre>
          <p className="text-sm muted">
            The full CLI reference, including JSON output and severity gating for CI, is in{" "}
            <Link href="/docs" className="underline">the docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is the BusyBox Docker image safe to use?</h3>
              <p className="text-sm muted mt-1">
                Yes, by design it has minimal attack surface. Our scan found only 2 findings, though
                the scan was partial given BusyBox&apos;s minimal package footprint — supplement with
                public advisory data for your exact version.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why did the scan only find 2 findings?</h3>
              <p className="text-sm muted mt-1">
                BusyBox is a single static binary with no package database for heuristic scanning to
                enumerate fully. The low count reflects both genuine minimalism and reduced scan
                visibility.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does a low count mean no CVE history?</h3>
              <p className="text-sm muted mt-1">
                No. BusyBox has had real CVEs, including in its ash shell. Our scan found two recent
                advisories directly against the package — check the exact version you ship against
                public trackers.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is BusyBox safer than Alpine?</h3>
              <p className="text-sm muted mt-1">
                It has an even smaller surface since it skips musl libc packaging and the apk package
                manager Alpine adds. Choose BusyBox if you need a shell and utilities but nothing
                installable at runtime.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan your minimal base images with ScanRook</h3>
          <p className="text-sm muted leading-relaxed">
            Upload your image tar or scan from the CLI and ScanRook matches every installed package
            against OSV, NVD, and vendor advisory data &mdash; with severity, exploit-probability,
            and confidence tiers so you know exactly what a scan did and did not see.
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
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              Installed-State Scanning vs. Advisory Matching
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
