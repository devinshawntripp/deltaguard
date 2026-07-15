import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-19";

const title = `Alpine vs Ubuntu: Choosing a Docker Base Image | ${APP_NAME}`;
const description =
  "Alpine vs Ubuntu for Docker base images: musl vs glibc, size and attack surface, compatibility tradeoffs, and how to choose the right one for you.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "alpine vs ubuntu",
    "alpine vs ubuntu docker",
    "alpine vs ubuntu base image",
    "musl vs glibc docker",
    "alpine docker image size",
    "alpine linux container security",
    "docker base image comparison",
    "alpine compatibility issues",
    "smallest docker base image",
    "alpine vs ubuntu python",
  ],
  alternates: { canonical: "/blog/alpine-vs-ubuntu-docker" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/alpine-vs-ubuntu-docker",
    images: ["/blog/alpine-vs-ubuntu-docker.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/alpine-vs-ubuntu-docker.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Alpine vs Ubuntu: Choosing a Docker Base Image",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/alpine-vs-ubuntu-docker",
  image: "https://scanrook.io/blog/alpine-vs-ubuntu-docker.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Alpine more secure than Ubuntu for Docker?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Alpine ships far fewer packages, so it presents a smaller attack surface and fewer CVEs to triage, and it enables hardening like position-independent executables and stack-smashing protection by default. Ubuntu uses glibc, which is more battle-tested and backed by a larger security team. Alpine's advantage is minimalism; Ubuntu's is maturity and compatibility. Neither is unconditionally safer.",
      },
    },
    {
      "@type": "Question",
      name: "Why is Alpine so much smaller than Ubuntu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Alpine uses musl libc and BusyBox, which pack a full set of core utilities into a tiny footprint, and it omits the documentation, locales, and extra libraries a full distribution ships. The base image is a few megabytes versus tens of megabytes for a minimal Ubuntu. That smaller footprint is the source of both its size advantage and most of its compatibility quirks.",
      },
    },
    {
      "@type": "Question",
      name: "What compatibility problems does Alpine have?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Alpine uses musl instead of glibc, and some software assumes glibc behavior. DNS resolution differs subtly, precompiled glibc binaries may not run, and Python packages built for the glibc manylinux standard need musllinux wheels or a source build, which can slow builds. Most mainstream software works, but glibc-specific dependencies are where teams hit friction.",
      },
    },
    {
      "@type": "Question",
      name: "Should I use Alpine for Python containers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Be cautious. Many Python packages ship prebuilt glibc wheels; on Alpine those may need musllinux wheels or compilation from source, which lengthens builds and can surface subtle runtime differences. For Python, a slim Debian or Ubuntu base is often the pragmatic choice, while Alpine shines for static Go or Rust binaries with few system dependencies.",
      },
    },
    {
      "@type": "Question",
      name: "Does a smaller Alpine image mean fewer vulnerabilities in a scan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Usually yes, because there are fewer packages to carry known CVEs, but small is not zero. A minimal image can still ship a vulnerable core library, and how many findings a scanner reports depends on how many advisory sources it consults. The reliable answer is to scan whichever base you choose rather than assume size equals safety.",
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
            Alpine vs Ubuntu: Choosing a Docker Base Image
          </h1>
          <p className="text-sm muted">Published August 19, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            Alpine vs Ubuntu comes down to one real decision: minimalism or compatibility. Alpine is
            a few megabytes and carries almost nothing; Ubuntu is a familiar full glibc userland that
            runs practically anything. This guide covers the tradeoffs that actually bite &mdash;
            musl vs glibc, size, build friction, and security &mdash; and when each is the right call.
          </p>
        </header>

        <section className="mt-1 rounded-xl border border-black/10 dark:border-white/10 bg-black/[.03] dark:bg-white/[.03] p-5 grid gap-2">
          <h2 className="text-base font-semibold tracking-tight">The short answer</h2>
          <p className="text-sm muted">
            Use <strong>Alpine</strong> for statically compiled or dependency-light services &mdash;
            Go and Rust binaries especially &mdash; where a tiny image and small attack surface win.
            Use <strong>Ubuntu</strong> (or debian-slim) when you need glibc compatibility, prebuilt
            binaries, or a smoother build for ecosystems like Python. The right choice depends far
            more on your dependencies than on any headline security claim.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The core difference: musl and BusyBox vs glibc and GNU</h2>
          <p className="text-sm muted">
            Alpine is built on <strong>musl libc</strong> and <strong>BusyBox</strong>. musl is a
            small, MIT-licensed C library, and BusyBox combines dozens of Unix utilities into a single
            compact binary. Ubuntu uses <strong>glibc</strong> and the full GNU coreutils &mdash; the
            same combination as Debian, Fedora, and most desktop and server Linux. Almost every
            practical difference between the two images flows from that one choice: musl is why Alpine
            is tiny, and it is also why a minority of glibc-assuming software misbehaves on it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">At a glance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Dimension</th>
                  <th className="text-left py-2 pr-4 font-semibold">Alpine (3.20)</th>
                  <th className="text-left py-2 font-semibold">Ubuntu (24.04)</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">C library</td>
                  <td className="py-2 pr-4 align-top">musl</td>
                  <td className="py-2 align-top">glibc</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Core utilities</td>
                  <td className="py-2 pr-4 align-top">BusyBox</td>
                  <td className="py-2 align-top">GNU coreutils</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Package manager</td>
                  <td className="py-2 pr-4 align-top">apk</td>
                  <td className="py-2 align-top">apt / dpkg</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Approx. base size</td>
                  <td className="py-2 pr-4 align-top">~8 MB unpacked</td>
                  <td className="py-2 align-top">~78 MB unpacked</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Compatibility</td>
                  <td className="py-2 pr-4 align-top">Great for static binaries; glibc gaps</td>
                  <td className="py-2 align-top">Runs essentially any Linux software</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">Attack surface</td>
                  <td className="py-2 pr-4 align-top">Very small (few packages)</td>
                  <td className="py-2 align-top">Larger (full userland)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            Sizes are approximate and vary by architecture and rebuild date; the order-of-magnitude
            gap is the durable fact.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Size and attack surface</h2>
          <p className="text-sm muted">
            Alpine&apos;s headline feature is its footprint &mdash; a base image of a few megabytes
            against tens of megabytes for a minimal Ubuntu. That is not just faster to pull; it is
            fewer packages, which means fewer libraries that can carry a CVE and fewer things to keep
            patched. Attack surface and image size move together, and this is Alpine&apos;s strongest
            argument. If you want to push minimalism even further &mdash; static binaries into
            scratch, or a distroless runtime &mdash; the tiers are laid out in{" "}
            <Link href="/blog/minimal-docker-images-guide" className="underline">
              the minimal Docker image guide
            </Link>{" "}
            and compared head to head in{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The compatibility catch</h2>
          <p className="text-sm muted">
            musl is not a drop-in replacement for glibc, and the gaps are where teams lose time:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Prebuilt glibc binaries.</strong> Closed-source or precompiled tools linked
              against glibc may simply not run on musl without a compatibility shim.
            </li>
            <li>
              <strong>Python wheels.</strong> The Python ecosystem&apos;s prebuilt wheels target the
              glibc <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">manylinux</code>{" "}
              standard. On Alpine you need <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">musllinux</code>{" "}
              wheels or a from-source compile, which lengthens builds and pulls in a toolchain.
            </li>
            <li>
              <strong>DNS and networking.</strong> musl&apos;s resolver behaves differently from
              glibc in edge cases around search domains and parallel lookups, which has surprised
              more than one team debugging intermittent resolution failures.
            </li>
            <li>
              <strong>Locales.</strong> Alpine ships minimal locale support, which can trip up
              software that assumes a full locale set.
            </li>
          </ul>
          <p className="text-sm muted">
            None of these is a dealbreaker for the majority of workloads, but each is a reason to test
            on Alpine before committing rather than discovering it in production.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Performance and security notes</h2>
          <p className="text-sm muted">
            On performance, musl&apos;s memory allocator has historically been slower than glibc&apos;s
            for some heavily multithreaded allocation-bound workloads &mdash; a documented pain point
            for certain Python and JVM-style services. For most applications the difference is
            invisible, but benchmark if allocation throughput is on your critical path.
          </p>
          <p className="text-sm muted">
            On security, the tradeoff is minimalism versus maturity. Alpine builds with
            position-independent executables and stack-smashing protection by default and ships so
            little that there is simply less to attack. glibc, by contrast, is one of the most
            scrutinized codebases in computing, with a large security team and long track record.
            Fewer packages usually means fewer findings in a scan &mdash; but &ldquo;fewer&rdquo; is
            not &ldquo;none,&rdquo; and a single vulnerable core library still matters.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which should you pick?</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Pick Alpine</strong> for static Go or Rust binaries, small utilities, and any
              service with few system dependencies, where the size and attack-surface win is real and
              the musl gaps never come up.
            </li>
            <li>
              <strong>Pick Ubuntu</strong> (or debian-slim) when you rely on prebuilt glibc binaries,
              a large stack of system packages, or ecosystems like Python where glibc wheels smooth
              the build.
            </li>
            <li>
              <strong>Consider distroless</strong> if you want a small, low-surface runtime without
              musl &mdash; a glibc base stripped down to just your app, covered in{" "}
              <Link href="/blog/migrating-to-distroless-images" className="underline">
                migrating to distroless images
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A realistic migration path</h2>
          <p className="text-sm muted">
            Moving an existing Ubuntu image to Alpine is more involved than a Debian/Ubuntu swap
            because the package manager and libc both change. The mechanical part is straightforward
            &mdash; <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">apt-get install</code>{" "}
            becomes <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">apk add</code>{" "}
            and some package names change (for example{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">build-essential</code>{" "}
            becomes <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">build-base</code>):
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# From this
FROM ubuntu:24.04
RUN apt-get update && apt-get install -y ca-certificates curl

# To this
FROM alpine:3.20
RUN apk add --no-cache ca-certificates curl`}</pre>
          <p className="text-sm muted">
            The part that actually costs time is the musl surface: confirm any prebuilt binaries run,
            switch Python dependencies to musllinux wheels or accept from-source builds, and test DNS
            resolution and locales under real traffic. If you hit a dependency that simply will not
            cooperate with musl, do not force it &mdash; a debian-slim or distroless base gives you
            most of the size win without the libc change, and is a perfectly respectable landing spot
            for a migration that ran into a glibc wall.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scan whichever you choose</h2>
          <p className="text-sm muted">
            Size is a proxy for attack surface, not a measurement of it. The only way to compare the
            real vulnerability exposure of an Alpine and an Ubuntu image is to scan both. ScanRook
            reads the package databases inside each image &mdash; apk on Alpine, dpkg on Ubuntu
            &mdash; and matches every component against OSV, NVD, and vendor advisory data, so you are
            comparing what is actually installed rather than a size estimate.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`curl -fsSL https://scanrook.io/install.sh | sh

docker save alpine:3.20  -o alpine.tar && scanrook scan alpine.tar --out alpine.json
docker save ubuntu:24.04 -o ubuntu.tar && scanrook scan ubuntu.tar --out ubuntu.json`}</pre>
          <p className="text-sm muted">
            For how to cut the findings the scan turns up &mdash; on either base &mdash; see{" "}
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              how to reduce CVEs in Docker images
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is Alpine more secure than Ubuntu?</h3>
              <p className="text-sm muted mt-1">
                Alpine has a smaller attack surface and hardened defaults; Ubuntu&apos;s glibc is more
                mature and heavily maintained. Minimalism versus maturity &mdash; neither wins
                unconditionally.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why is Alpine so small?</h3>
              <p className="text-sm muted mt-1">
                It uses musl and BusyBox and omits docs, locales, and extra libraries, so the base is
                a few megabytes versus tens for minimal Ubuntu.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should I use Alpine for Python?</h3>
              <p className="text-sm muted mt-1">
                Often no &mdash; glibc manylinux wheels need musllinux builds on Alpine, slowing
                builds. A slim Debian or Ubuntu base is usually the pragmatic Python choice.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does smaller mean fewer CVEs?</h3>
              <p className="text-sm muted mt-1">
                Usually, because there are fewer packages &mdash; but not zero. Scan the image rather
                than assume size equals safety.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Measure attack surface, do not guess it</h3>
          <p className="text-sm muted leading-relaxed">
            Scan your Alpine and Ubuntu candidates with ScanRook and compare real findings, each
            matched against multiple advisory sources and tagged with its source and confidence.
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
            <Link href="/blog/minimal-docker-images-guide" className="underline">
              The Minimal Docker Image Guide
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
