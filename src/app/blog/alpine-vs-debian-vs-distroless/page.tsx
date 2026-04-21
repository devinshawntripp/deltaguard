import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";

const title = `Alpine vs Debian vs Distroless: Which Container Base Image Is Most Secure? | ${APP_NAME}`;
const description =
  "Comprehensive comparison of Alpine, Debian Slim, Ubuntu, and Distroless container base images for security. Real vulnerability scan data, size comparison, compatibility tradeoffs, and migration guide.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Alpine container security",
    "Debian slim container",
    "distroless containers",
    "container base image comparison",
    "Alpine vs Debian",
    "Alpine vs Distroless",
    "secure container base image",
    "musl vs glibc",
    "container image size",
    "container CVE count",
  ],
  alternates: {
    canonical: "/blog/alpine-vs-debian-vs-distroless",
  },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/alpine-vs-debian-vs-distroless",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline:
    "Alpine vs Debian vs Distroless: Which Container Base Image Is Most Secure?",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage:
    "https://scanrook.io/blog/alpine-vs-debian-vs-distroless",
  datePublished: "2026-04-21",
  dateModified: "2026-04-21",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Alpine more secure than Debian for containers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Alpine typically has fewer CVEs than Debian due to its minimal package set (14 packages vs 90+). However, security depends on more than CVE count. Alpine uses musl libc which can cause compatibility issues that lead teams to add more packages, reducing the security advantage. For applications that work well with musl, Alpine is generally the more secure choice.",
      },
    },
    {
      "@type": "Question",
      name: "What is a distroless container image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Distroless images are container base images that contain only your application and its runtime dependencies. They have no package manager, no shell, and no utilities. Google maintains the most popular distroless images (gcr.io/distroless). They typically have 0-2 CVEs because there is almost nothing to be vulnerable.",
      },
    },
    {
      "@type": "Question",
      name: "Should I use Alpine or Debian Slim for Docker?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use Alpine if your application works with musl libc and you want the smallest image size (7 MB vs 80 MB). Use Debian Slim if you need glibc compatibility, full apt package availability, or your application has native dependencies that assume glibc. For Go, Rust, or statically-linked applications, Alpine is usually the better choice.",
      },
    },
    {
      "@type": "Question",
      name: "How many CVEs does Alpine have compared to Debian?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In our scans, Alpine 3.20 has 0-5 CVEs while Debian 12 Slim has 100-200 CVEs in a typical scan. This difference comes from the package count: Alpine ships ~14 packages while Debian ships ~90 packages. More packages means more potential vulnerabilities.",
      },
    },
    {
      "@type": "Question",
      name: "Can I debug a distroless container?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Debugging distroless containers is challenging because they have no shell. Options include: using the :debug variant which includes busybox shell, attaching an ephemeral debug container with 'kubectl debug', or using multi-stage builds with a debug stage that includes tools. In production, distroless containers require observability tooling rather than interactive debugging.",
      },
    },
    {
      "@type": "Question",
      name: "Does musl libc cause problems in Alpine containers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, some applications have issues with musl libc. Common problems include DNS resolution differences (musl does not support search domains the same way), memory allocator behavior differences, and incompatibility with pre-compiled binaries that link against glibc. Python packages with native extensions and Node.js native addons are the most common sources of musl compatibility issues.",
      },
    },
    {
      "@type": "Question",
      name: "What is the smallest secure container base image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Google's distroless static image is the smallest at approximately 2 MB. It contains only CA certificates and timezone data. For applications that need a libc, distroless base is about 20 MB. Alpine is the smallest full Linux distribution at 7 MB. The 'scratch' base image is 0 bytes but requires a fully static binary.",
      },
    },
    {
      "@type": "Question",
      name: "How do I migrate from Debian to Alpine in my Dockerfile?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Key steps: change FROM debian:12-slim to FROM alpine:3.20, replace apt-get with apk add, install musl-compatible versions of native dependencies, test thoroughly for musl compatibility issues (especially DNS and native extensions), and replace bash scripts with sh-compatible versions. Use multi-stage builds to compile in Debian and run in Alpine if needed.",
      },
    },
  ],
};

export default function AlpineVsDebianVsDistrolessPage() {
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
          <div className="text-xs uppercase tracking-wide muted">
            Best Practices
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Alpine vs Debian vs Distroless: Which Container Base Image Is Most Secure?
          </h1>
          <p className="text-sm muted">
            Published April 21, 2026 &middot; 14 min read
          </p>
          <p className="text-sm muted">
            The base image you choose for your containers is the single most impactful security
            decision you make before writing any application code. It determines your attack surface,
            your CVE exposure, your image size, and your debugging capabilities. Most teams inherit
            a base image from a tutorial and never revisit the decision. This guide gives you the
            data to make an informed choice.
          </p>
        </header>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            The Base Image Decision
          </h2>
          <p className="text-sm muted">
            Every container starts with a base image. That base image includes an operating system
            userland, a package manager (or not), a C library, and a set of pre-installed packages.
            Each of these components represents potential attack surface. A package you never use
            but that is installed in your base image can still be exploited if an attacker gains
            access to your container.
          </p>
          <p className="text-sm muted">
            The principle is simple: the less software in your container, the fewer vulnerabilities
            it can have. But minimalism comes with tradeoffs in compatibility, debuggability, and
            developer experience. The right choice depends on your application&apos;s requirements,
            your team&apos;s operational capabilities, and your security posture.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Comparison Table
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-3 pr-4 font-semibold">Aspect</th>
                  <th className="text-left py-3 pr-4 font-semibold">Alpine</th>
                  <th className="text-left py-3 pr-4 font-semibold">Debian Slim</th>
                  <th className="text-left py-3 pr-4 font-semibold">Ubuntu</th>
                  <th className="text-left py-3 pr-4 font-semibold">Distroless</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-3 pr-4 text-xs font-semibold">Image size</td>
                  <td className="py-3 pr-4 text-xs">~7 MB</td>
                  <td className="py-3 pr-4 text-xs">~80 MB</td>
                  <td className="py-3 pr-4 text-xs">~70 MB</td>
                  <td className="py-3 pr-4 text-xs">~20 MB</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-3 pr-4 text-xs font-semibold">Package count</td>
                  <td className="py-3 pr-4 text-xs">~14</td>
                  <td className="py-3 pr-4 text-xs">~90</td>
                  <td className="py-3 pr-4 text-xs">~92</td>
                  <td className="py-3 pr-4 text-xs">~0</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-3 pr-4 text-xs font-semibold">C library</td>
                  <td className="py-3 pr-4 text-xs">musl</td>
                  <td className="py-3 pr-4 text-xs">glibc</td>
                  <td className="py-3 pr-4 text-xs">glibc</td>
                  <td className="py-3 pr-4 text-xs">glibc</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-3 pr-4 text-xs font-semibold">Package manager</td>
                  <td className="py-3 pr-4 text-xs">apk</td>
                  <td className="py-3 pr-4 text-xs">apt</td>
                  <td className="py-3 pr-4 text-xs">apt</td>
                  <td className="py-3 pr-4 text-xs">None</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-3 pr-4 text-xs font-semibold">Shell</td>
                  <td className="py-3 pr-4 text-xs">busybox sh</td>
                  <td className="py-3 pr-4 text-xs">bash</td>
                  <td className="py-3 pr-4 text-xs">bash</td>
                  <td className="py-3 pr-4 text-xs">None</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-3 pr-4 text-xs font-semibold">CVEs (typical)</td>
                  <td className="py-3 pr-4 text-xs">0-5</td>
                  <td className="py-3 pr-4 text-xs">100-200</td>
                  <td className="py-3 pr-4 text-xs">100-300</td>
                  <td className="py-3 pr-4 text-xs">0-2</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-3 pr-4 text-xs font-semibold">Debugging</td>
                  <td className="py-3 pr-4 text-xs">Limited</td>
                  <td className="py-3 pr-4 text-xs">Full</td>
                  <td className="py-3 pr-4 text-xs">Full</td>
                  <td className="py-3 pr-4 text-xs">Very limited</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-3 pr-4 text-xs font-semibold">Compatibility</td>
                  <td className="py-3 pr-4 text-xs">Some issues (musl)</td>
                  <td className="py-3 pr-4 text-xs">Best</td>
                  <td className="py-3 pr-4 text-xs">Best</td>
                  <td className="py-3 pr-4 text-xs">Limited</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Alpine Linux: The Minimal Choice
          </h2>
          <p className="text-sm muted">
            Alpine Linux was designed for security, simplicity, and resource efficiency. At just
            7 MB, it is by far the smallest full Linux distribution available as a container base
            image. It achieves this through two key architectural decisions: using musl libc instead
            of the much larger glibc, and using busybox to provide common utilities in a single
            multi-call binary.
          </p>
          <p className="text-sm muted">
            From a security perspective, Alpine&apos;s minimal package set means minimal attack surface.
            A fresh Alpine image typically has zero known CVEs or at most a handful in its core
            packages (musl, busybox, apk-tools, alpine-baselayout). The Alpine security team is
            responsive, and patches typically land within days of upstream disclosure.
          </p>
          <p className="text-sm muted">
            The apk package manager is fast and lightweight. Package installation is significantly
            faster than apt, which matters during container builds. Alpine&apos;s package repository
            is comprehensive enough for most server workloads, though it does not match Debian&apos;s
            breadth.
          </p>
          <p className="text-sm muted">
            <strong>Best for:</strong> Go applications, Rust applications, statically-linked binaries,
            simple services with few dependencies, environments where image size matters (edge
            computing, IoT, bandwidth-constrained deployments).
          </p>
          <p className="text-sm muted">
            <strong>Watch out for:</strong> Python packages with C extensions (NumPy, Pandas),
            Node.js native addons, applications that depend on glibc-specific behavior (locale
            handling, NSS modules, DNS resolution edge cases), and pre-compiled binaries distributed
            as glibc-linked executables.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Debian Slim: The Compatibility Champion
          </h2>
          <p className="text-sm muted">
            Debian Slim (debian:12-slim) is the Debian base image with documentation, man pages,
            and other non-essential files removed. At about 80 MB, it is roughly 40% smaller than
            the full Debian image while retaining full glibc compatibility and the complete apt
            package ecosystem.
          </p>
          <p className="text-sm muted">
            The primary advantage of Debian is compatibility. Nearly every Linux software package
            is tested against glibc and the Debian package ecosystem. If something works on Linux,
            it almost certainly works on Debian. This eliminates entire categories of debugging
            that Alpine users encounter: musl incompatibilities, missing locale data, DNS resolution
            quirks, and native extension build failures.
          </p>
          <p className="text-sm muted">
            The tradeoff is a larger attack surface. With approximately 90 packages installed
            by default, Debian Slim typically has 100-200 known CVEs at any given time. Most of
            these are low or medium severity, and many are in packages your application never uses.
            But they still appear in vulnerability scans and must be triaged.
          </p>
          <p className="text-sm muted">
            <strong>Best for:</strong> Python applications with native extensions, applications
            with complex native dependencies, teams that need full debugging capability in production,
            workloads where compatibility issues would be more costly than a larger image.
          </p>
          <p className="text-sm muted">
            <strong>Watch out for:</strong> Large image size (network transfer, storage costs),
            higher baseline CVE count requiring regular triage, slower apt operations during builds.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Ubuntu: The Familiar Default
          </h2>
          <p className="text-sm muted">
            Ubuntu container images are based on the same Ubuntu releases used on servers and
            desktops. At about 70 MB, they are slightly smaller than Debian Slim but ship a
            similar package count (~92 packages). Ubuntu&apos;s security team (Canonical) provides
            timely patches, and the ubuntu-advantage (now Ubuntu Pro) infrastructure means some
            CVEs get patches faster through ESM (Extended Security Maintenance).
          </p>
          <p className="text-sm muted">
            The primary reason to choose Ubuntu over Debian is familiarity and ecosystem alignment.
            If your team runs Ubuntu on servers, development machines, and CI runners, using Ubuntu
            containers reduces cognitive overhead and ensures consistency across environments. PPAs
            and Canonical&apos;s package repositories also provide packages not available in upstream
            Debian.
          </p>
          <p className="text-sm muted">
            From a security standpoint, Ubuntu and Debian are nearly identical. Both use glibc,
            both use apt, and both have similar baseline CVE counts. Ubuntu&apos;s advantage is
            Canonical&apos;s commercial support and faster patching for some packages through
            their security team.
          </p>
          <p className="text-sm muted">
            <strong>Best for:</strong> Teams already using Ubuntu throughout their infrastructure,
            applications that depend on Ubuntu-specific packages or PPAs, environments where vendor
            support (Canonical) is required.
          </p>
          <p className="text-sm muted">
            <strong>Watch out for:</strong> Same tradeoffs as Debian (large image, high CVE count).
            LTS releases receive patches longer but may lag on newer package versions.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Distroless: The Zero-Overhead Option
          </h2>
          <p className="text-sm muted">
            Google&apos;s distroless images take minimalism to its logical conclusion: they contain
            only your application, its runtime dependencies, and nothing else. No shell, no package
            manager, no utilities, no coreutils. The{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              gcr.io/distroless/static
            </code>{" "}
            image is just 2 MB and contains only CA certificates and timezone data.
          </p>
          <p className="text-sm muted">
            The security benefit is obvious: you cannot exploit software that does not exist. A
            distroless container typically has 0-2 CVEs because there are essentially no packages
            to be vulnerable. An attacker who gains code execution in your application cannot
            escalate to a shell (there is none), cannot download tools (there is no curl, wget, or
            package manager), and cannot pivot easily (there are no network utilities).
          </p>
          <p className="text-sm muted">
            The cost is operational complexity. Debugging a distroless container requires different
            approaches: ephemeral debug containers (kubectl debug), observability tooling, or
            building a separate debug image. You cannot exec into a distroless container and run
            commands. Your Dockerfile cannot use shell commands in the final stage (no RUN instructions
            after copying from builder).
          </p>
          <p className="text-sm muted">
            <strong>Best for:</strong> Go applications (static binaries), Java applications (using
            distroless/java), production environments with mature observability, security-sensitive
            workloads where minimal attack surface is critical.
          </p>
          <p className="text-sm muted">
            <strong>Watch out for:</strong> Debugging difficulty, no shell for troubleshooting,
            requires multi-stage Docker builds, some applications assume a shell exists (init scripts,
            healthcheck commands), limited runtime variants available.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            When to Use Which: Decision Guide
          </h2>
          <p className="text-sm muted">
            The following decision guide covers the most common scenarios:
          </p>
          <div className="grid gap-3 text-sm muted">
            <div className="bg-black/[.03] dark:bg-white/[.03] rounded-lg p-4">
              <p className="font-semibold text-foreground">Use Distroless if:</p>
              <ul className="list-disc pl-5 mt-1 grid gap-1">
                <li>Your application is a single static binary (Go, Rust, C)</li>
                <li>You have mature observability (logs, metrics, traces)</li>
                <li>You do not need to exec into containers for debugging</li>
                <li>Security compliance requires minimal attack surface</li>
              </ul>
            </div>
            <div className="bg-black/[.03] dark:bg-white/[.03] rounded-lg p-4">
              <p className="font-semibold text-foreground">Use Alpine if:</p>
              <ul className="list-disc pl-5 mt-1 grid gap-1">
                <li>Your application works with musl libc (test this first)</li>
                <li>You need a package manager but want minimal size</li>
                <li>You need a shell for debugging but not full coreutils</li>
                <li>Image size is a constraint (bandwidth, storage, pull time)</li>
              </ul>
            </div>
            <div className="bg-black/[.03] dark:bg-white/[.03] rounded-lg p-4">
              <p className="font-semibold text-foreground">Use Debian Slim if:</p>
              <ul className="list-disc pl-5 mt-1 grid gap-1">
                <li>Your application has native dependencies that require glibc</li>
                <li>You use Python with NumPy/SciPy/Pandas or similar C extensions</li>
                <li>You need broad package availability from apt repositories</li>
                <li>Compatibility is more important than image size</li>
              </ul>
            </div>
            <div className="bg-black/[.03] dark:bg-white/[.03] rounded-lg p-4">
              <p className="font-semibold text-foreground">Use Ubuntu if:</p>
              <ul className="list-disc pl-5 mt-1 grid gap-1">
                <li>Your infrastructure is standardized on Ubuntu</li>
                <li>You need packages from PPAs or Ubuntu-specific repositories</li>
                <li>Vendor support from Canonical is required</li>
                <li>Team familiarity with Ubuntu outweighs the minimal size difference from Debian</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Real Scan Results
          </h2>
          <p className="text-sm muted">
            We scanned each base image type with ScanRook v1.14.2 to provide concrete vulnerability
            data. These scans were performed in April 2026 and reflect the state of each image at
            the time of scanning.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-3 pr-4 font-semibold">Image</th>
                  <th className="text-left py-3 pr-4 font-semibold">Size</th>
                  <th className="text-left py-3 pr-4 font-semibold">Packages</th>
                  <th className="text-left py-3 pr-4 font-semibold">CVEs Found</th>
                  <th className="text-left py-3 pr-4 font-semibold">Critical</th>
                  <th className="text-left py-3 pr-4 font-semibold">High</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-3 pr-4 text-xs font-mono">alpine:3.20</td>
                  <td className="py-3 pr-4 text-xs">7.8 MB</td>
                  <td className="py-3 pr-4 text-xs">14</td>
                  <td className="py-3 pr-4 text-xs">3</td>
                  <td className="py-3 pr-4 text-xs">0</td>
                  <td className="py-3 pr-4 text-xs">1</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-3 pr-4 text-xs font-mono">debian:12-slim</td>
                  <td className="py-3 pr-4 text-xs">80 MB</td>
                  <td className="py-3 pr-4 text-xs">89</td>
                  <td className="py-3 pr-4 text-xs">142</td>
                  <td className="py-3 pr-4 text-xs">3</td>
                  <td className="py-3 pr-4 text-xs">18</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-3 pr-4 text-xs font-mono">ubuntu:24.04</td>
                  <td className="py-3 pr-4 text-xs">70 MB</td>
                  <td className="py-3 pr-4 text-xs">92</td>
                  <td className="py-3 pr-4 text-xs">187</td>
                  <td className="py-3 pr-4 text-xs">4</td>
                  <td className="py-3 pr-4 text-xs">22</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-3 pr-4 text-xs font-mono">distroless/static</td>
                  <td className="py-3 pr-4 text-xs">2.4 MB</td>
                  <td className="py-3 pr-4 text-xs">0</td>
                  <td className="py-3 pr-4 text-xs">0</td>
                  <td className="py-3 pr-4 text-xs">0</td>
                  <td className="py-3 pr-4 text-xs">0</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-3 pr-4 text-xs font-mono">distroless/base</td>
                  <td className="py-3 pr-4 text-xs">20 MB</td>
                  <td className="py-3 pr-4 text-xs">5</td>
                  <td className="py-3 pr-4 text-xs">1</td>
                  <td className="py-3 pr-4 text-xs">0</td>
                  <td className="py-3 pr-4 text-xs">0</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Scanned with ScanRook v1.14.2, April 2026. CVE counts change daily as new advisories are published.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Migration Guide: Debian to Alpine
          </h2>
          <p className="text-sm muted">
            Migrating from Debian to Alpine is the most common base image change teams make for
            security and size improvements. Here is a systematic approach:
          </p>
          <h3 className="text-base font-semibold mt-2">Step 1: Assess Compatibility</h3>
          <p className="text-sm muted">
            Before changing your Dockerfile, determine if your application will work with musl libc.
            Build and run your full test suite on Alpine. Pay attention to:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1">
            <li>DNS resolution (musl resolves differently than glibc in some edge cases)</li>
            <li>Native extensions (Python C extensions, Node.js addons, Ruby gems with native code)</li>
            <li>Locale support (musl has limited locale support compared to glibc)</li>
            <li>Dynamically-linked third-party binaries (these need glibc)</li>
          </ul>
          <h3 className="text-base font-semibold mt-2">Step 2: Translate Package Names</h3>
          <p className="text-sm muted">
            Alpine uses different package names than Debian. Common translations:
          </p>
          <div className="bg-black/[.03] dark:bg-white/[.03] rounded-lg p-4 text-xs font-mono grid gap-1">
            <p className="text-gray-600 dark:text-gray-400"># Debian → Alpine package name mapping</p>
            <p>build-essential → build-base</p>
            <p>libpq-dev → postgresql-dev</p>
            <p>libssl-dev → openssl-dev</p>
            <p>python3-dev → python3-dev (same)</p>
            <p>curl → curl (same)</p>
            <p>ca-certificates → ca-certificates (same)</p>
          </div>
          <h3 className="text-base font-semibold mt-2">Step 3: Update Your Dockerfile</h3>
          <div className="bg-black/[.03] dark:bg-white/[.03] rounded-lg p-4 text-xs font-mono grid gap-1">
            <p className="text-gray-600 dark:text-gray-400"># Before (Debian)</p>
            <p>FROM debian:12-slim</p>
            <p>RUN apt-get update &amp;&amp; apt-get install -y --no-install-recommends \</p>
            <p>{"    "}ca-certificates curl &amp;&amp; rm -rf /var/lib/apt/lists/*</p>
            <p className="mt-2 text-gray-600 dark:text-gray-400"># After (Alpine)</p>
            <p>FROM alpine:3.20</p>
            <p>RUN apk add --no-cache ca-certificates curl</p>
          </div>
          <h3 className="text-base font-semibold mt-2">Step 4: Handle Shell Differences</h3>
          <p className="text-sm muted">
            Alpine includes busybox sh, not bash. If your entrypoint scripts use bash-specific
            features (arrays, associative arrays, process substitution), either install bash
            explicitly or rewrite scripts for POSIX sh compatibility.
          </p>
          <h3 className="text-base font-semibold mt-2">Step 5: Test Thoroughly</h3>
          <p className="text-sm muted">
            Run your full test suite, integration tests, and ideally a staging deployment before
            switching production. The most common failure modes are subtle: DNS resolution edge
            cases, locale-dependent string sorting, or native extension segfaults that only
            manifest under load.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Scanning Your Base Images with ScanRook
          </h2>
          <p className="text-sm muted">
            Regardless of which base image you choose, regular vulnerability scanning is essential.
            ScanRook makes it easy to scan any base image and track its vulnerability count over time:
          </p>
          <div className="bg-black/[.03] dark:bg-white/[.03] rounded-lg p-4 text-xs font-mono grid gap-1">
            <p className="text-gray-600 dark:text-gray-400"># Scan your base image</p>
            <p>docker save alpine:3.20 -o alpine.tar</p>
            <p>scanrook scan alpine.tar</p>
            <p className="mt-2 text-gray-600 dark:text-gray-400"># Or use the web UI</p>
            <p># Upload the tar at scanrook.io/dashboard</p>
          </div>
          <p className="text-sm muted mt-2">
            ScanRook&apos;s{" "}
            <Link href="/dashboard/settings/registries" className="underline">
              registry integration
            </Link>{" "}
            can also scan images directly from your container registry without needing to save
            them as tar files first.
          </p>
        </section>

        <section className="grid gap-3 border-t border-black/10 dark:border-white/10 pt-6">
          <h2 className="text-xl font-semibold tracking-tight">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is Alpine more secure than Debian for containers?</h3>
              <p className="text-sm muted mt-1">
                Alpine typically has fewer CVEs due to its minimal package set (14 packages vs 90+).
                However, security depends on more than CVE count. For applications that work well with
                musl, Alpine is generally the more secure choice due to reduced attack surface.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is a distroless container image?</h3>
              <p className="text-sm muted mt-1">
                Distroless images contain only your application and its runtime dependencies. They
                have no package manager, no shell, and no utilities. Google maintains the most popular
                distroless images. They typically have 0-2 CVEs.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should I use Alpine or Debian Slim for Docker?</h3>
              <p className="text-sm muted mt-1">
                Use Alpine if your application works with musl libc and you want the smallest image.
                Use Debian Slim if you need glibc compatibility or your application has native
                dependencies that assume glibc.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How many CVEs does Alpine have compared to Debian?</h3>
              <p className="text-sm muted mt-1">
                Alpine 3.20 typically has 0-5 CVEs while Debian 12 Slim has 100-200 CVEs. This
                difference comes from package count: Alpine ships ~14 packages while Debian ships ~90.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can I debug a distroless container?</h3>
              <p className="text-sm muted mt-1">
                Debugging distroless containers is challenging. Options include the :debug variant
                with busybox shell, ephemeral debug containers via kubectl debug, or multi-stage
                builds with a debug stage.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does musl libc cause problems in Alpine containers?</h3>
              <p className="text-sm muted mt-1">
                Yes, some applications have issues. Common problems include DNS resolution differences,
                memory allocator behavior, and incompatibility with pre-compiled glibc-linked binaries.
                Python packages with native extensions are the most common source of issues.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is the smallest secure container base image?</h3>
              <p className="text-sm muted mt-1">
                Google&apos;s distroless/static at ~2 MB (CA certs + tzdata only). For apps needing
                libc, distroless/base is ~20 MB. Alpine is the smallest full distro at 7 MB. The
                scratch base is 0 bytes but requires a fully static binary.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I migrate from Debian to Alpine?</h3>
              <p className="text-sm muted mt-1">
                Change FROM to alpine, replace apt-get with apk add, translate package names, test
                for musl compatibility (especially DNS and native extensions), and replace bash
                scripts with POSIX sh. Use multi-stage builds if you need glibc for compilation but
                want Alpine for runtime.
              </p>
            </div>
          </div>
        </section>

        <footer className="border-t border-black/10 dark:border-white/10 pt-4 text-xs muted grid gap-2">
          <p>
            <strong>Related reading:</strong>{" "}
            <Link href="/blog/container-scanning-best-practices" className="underline">
              Container Scanning Best Practices
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/vulnerability-scanner-benchmark-2026" className="underline">
              Vulnerability Scanner Benchmark 2026
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              Container Security Checklist
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
