import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-24";

const title = `Clair: How the Open-Source Container Scanner Works | ${APP_NAME}`;
const description =
  "Clair is the open-source engine that scans container images for CVEs and powers Quay. How its indexer and matcher work, its tradeoffs, and where ScanRook fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "clair",
    "clair scanner",
    "clair container scanning",
    "clair vulnerability scanner",
    "quay clair",
    "clair vs trivy",
    "clairctl",
    "clair v4",
    "open source container scanner",
    "clair architecture",
  ],
  alternates: { canonical: "/blog/clair" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/clair",
    images: ["/blog/clair.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/clair.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Clair: How the Open-Source Container Scanner Works",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/clair",
  image: "https://scanrook.io/blog/clair.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Clair?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Clair is an open-source project for static analysis of vulnerabilities in container images. It indexes the packages in each image layer and matches them against vulnerability data from Linux distribution security trackers. Originally created by CoreOS and now maintained by Red Hat, Clair is the scanning engine behind the Quay container registry.",
      },
    },
    {
      "@type": "Question",
      name: "How does Clair work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Clair v4 runs as a set of services. The Indexer decomposes an image into layers and records the installed packages as an index report stored in PostgreSQL. The Matcher compares that inventory against vulnerability data kept current by updaters, and returns a vulnerability report. A Notifier can alert you when new vulnerabilities affect an image you already indexed.",
      },
    },
    {
      "@type": "Question",
      name: "Is Clair a command-line tool like Trivy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not exactly. Clair is a server with an HTTP API, not a single self-contained binary. You submit images to a running Clair instance, typically with the clairctl client, and it stores results in PostgreSQL. That makes Clair well suited to registry-integrated, always-on scanning but heavier to run than a one-shot CLI like Trivy or Grype.",
      },
    },
    {
      "@type": "Question",
      name: "What vulnerability data does Clair use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Clair's updaters pull from Linux distribution security trackers including Alpine SecDB, Debian, Ubuntu, Red Hat (OVAL/VEX), SUSE, Oracle, Photon, and AWS, plus some language advisory data. Its historical strength is operating-system package coverage; language-ecosystem depth is more limited than some newer scanners.",
      },
    },
    {
      "@type": "Question",
      name: "How is ScanRook different from Clair?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Clair is a registry-oriented server focused on OS-package CVEs from distribution trackers. ScanRook is a scanner you run against an image tarball, binary, or source archive, and it matches every package against OSV, NVD, and Red Hat OVAL in parallel while reading the real package databases inside the image. The two solve overlapping problems with different deployment models and source coverage.",
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
          <div className="text-xs uppercase tracking-wide muted">Benchmarks</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Clair: How the Open-Source Container Scanner Works
          </h1>
          <p className="text-sm muted">Published September 24, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Clair is one of the oldest open-source container vulnerability scanners still in active
            use, and it works differently from the single-binary tools that came after it. Instead of
            a one-shot CLI, Clair is a service you run alongside a registry, indexing images once and
            re-checking them as new advisories land. Here is how it is built, what it is good at, and
            how it compares with the scanners you are probably choosing between today.
          </p>
        </header>

        <img
          src="/blog/clair.jpg"
          alt="How the Clair container scanner works"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Clair is</h2>
          <p className="text-sm muted">
            Clair is an open-source project for the static analysis of vulnerabilities in application
            containers. It was created by CoreOS, and after Red Hat acquired CoreOS it has been
            maintained by the team behind the Quay registry &mdash; Clair is the engine that powers
            Quay&apos;s security scanning. The current generation, Clair v4, is a ground-up rewrite
            with a clean HTTP API and a service-oriented design.
          </p>
          <p className="text-sm muted">
            The defining choice is that Clair is a <em>server</em>, not a binary you run and forget.
            It stores state in PostgreSQL, keeps vulnerability data continuously updated, and exposes
            an API that a registry or CI system calls. That makes it a strong fit for
            registry-integrated scanning at scale &mdash; index an image on push, get findings back,
            and receive a notification later if a newly published CVE affects an image you already
            scanned. It is a heavier commitment than a CLI, and that is the point: Clair is built to
            run as infrastructure.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How Clair analyzes an image</h2>
          <p className="text-sm muted">
            Clair v4 splits the work across a few cooperating services. Understanding the flow makes
            its strengths obvious:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 210"
              role="img"
              aria-label="Clair data flow: a container image is indexed into an index report, stored in PostgreSQL, matched against updater data to produce a vulnerability report, with a notifier emitting alerts"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <defs>
                <marker id="cl-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              {[
                { x: 8, label: "Image", sub: "layers" },
                { x: 176, label: "Indexer", sub: "package inventory" },
                { x: 366, label: "Matcher", sub: "packages × CVEs", hot: true },
                { x: 556, label: "Vuln report", sub: "findings" },
              ].map((b) => (
                <g key={b.label}>
                  <rect
                    x={b.x}
                    y={20}
                    width={136}
                    height={54}
                    rx={8}
                    fill={b.hot ? "var(--dg-accent,#2563eb)" : "transparent"}
                    fillOpacity={b.hot ? 0.12 : 1}
                    stroke="currentColor"
                    strokeOpacity={0.5}
                  />
                  <text x={b.x + 68} y={43} textAnchor="middle" fontSize="14" fontWeight="600" fill="currentColor">
                    {b.label}
                  </text>
                  <text x={b.x + 68} y={62} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>
                    {b.sub}
                  </text>
                </g>
              ))}
              {[146, 336, 526].map((x) => (
                <line key={x} x1={x} y1={47} x2={x + 26} y2={47} stroke="currentColor" strokeWidth={2} markerEnd="url(#cl-arrow)" />
              ))}
              {/* updaters feeding matcher from above */}
              <rect x={330} y={110} width={208} height={30} rx={6} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.3} />
              <text x={434} y={129} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.75}>
                Updaters: Alpine, Debian, Ubuntu, RHEL…
              </text>
              <line x1={434} y1={110} x2={434} y2={76} stroke="currentColor" strokeWidth={2} markerEnd="url(#cl-arrow)" />
              {/* postgres storage below */}
              <rect x={130} y={160} width={280} height={30} rx={6} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.3} />
              <text x={270} y={179} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.75}>
                PostgreSQL: index reports + vuln data
              </text>
              <line x1={244} y1={74} x2={244} y2={160} stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.5} strokeDasharray="4 3" />
            </svg>
          </div>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              The <strong>Indexer</strong> pulls an image, walks its layers, and records what is
              installed &mdash; the OS packages and their versions &mdash; as an <em>index report</em>
              persisted in PostgreSQL. Because indexing is layer-aware, shared base layers are
              analyzed once and reused across images.
            </li>
            <li>
              The <strong>Matcher</strong> takes that inventory and compares it against vulnerability
              data, returning a <em>vulnerability report</em>. It relies on <strong>updaters</strong>{" "}
              that continuously pull advisories from distribution security trackers.
            </li>
            <li>
              The <strong>Notifier</strong> watches for new vulnerabilities that affect
              already-indexed images and emits notifications, so an image that was clean at push time
              can still alert you when a relevant CVE is published later.
            </li>
          </ul>
          <p className="text-sm muted">
            You interact with all of this over the HTTP API, usually through the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">clairctl</code>{" "}
            client, which can submit an image and print a report. This layer-aware, index-once model
            is the same idea we discuss in{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs advisory matching
            </Link>{" "}
            &mdash; read what is actually installed rather than guess from filenames.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Running Clair in practice</h2>
          <p className="text-sm muted">
            Operationally, Clair is a service you stand up, not a binary you drop into a job. A
            production deployment runs the indexer, matcher, and notifier &mdash; often as separate
            processes for scale, or combined in a single &ldquo;combo&rdquo; mode for smaller setups
            &mdash; backed by a PostgreSQL database that holds both index reports and vulnerability
            data. The updaters run on a schedule to keep that data fresh, so the first startup does
            some work before the matcher is useful.
          </p>
          <p className="text-sm muted">
            For one-off or local use, <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">clairctl</code>{" "}
            can submit an image to a running Clair and print a report, and it can run in a single-node
            mode for quick checks. But the design center is always-on, registry-integrated scanning:
            if your mental model is &ldquo;run a command against a tarball and read the output,&rdquo;
            Clair will feel heavier than it needs to be, and a single-binary scanner is the more
            natural fit. Clair pays off when scanning is a standing service, not an errand.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Clair does well</h2>
          <p className="text-sm muted">
            Credit where it is due, because Clair earns it. It is mature and battle-tested: it scans
            for the Quay registry, which means it runs against enormous image volumes in production
            every day. Its API-first, service-oriented design integrates cleanly into a registry or
            platform &mdash; you are meant to build scanning <em>into</em> your infrastructure with
            it, not bolt a CLI onto a CI job. The layer-aware caching keeps re-scans cheap, and the
            notifier model means coverage does not go stale between manual scans. Its distribution
            data, especially Red Hat&apos;s, is authoritative for the operating systems it covers
            &mdash; the same backported-fix nuance we cover in{" "}
            <Link href="/blog/redhat-backporting-explained" className="underline">
              how Red Hat backports security patches
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Clair next to the alternatives</h2>
          <p className="text-sm muted">
            Where Clair differs from the tools most teams evaluate today is deployment model and
            source breadth:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Tool</th>
                  <th className="text-left py-2 pr-4 font-semibold">Model</th>
                  <th className="text-left py-2 pr-4 font-semibold">Strengths</th>
                  <th className="text-left py-2 font-semibold">Tradeoffs</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Clair</strong></td>
                  <td className="py-2 pr-4 align-top">Server + API</td>
                  <td className="py-2 pr-4 align-top">Registry-integrated, index-once, notifications; powers Quay</td>
                  <td className="py-2 align-top">Needs Postgres + services; OS-package centric</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Trivy / Grype</strong></td>
                  <td className="py-2 pr-4 align-top">Single binary</td>
                  <td className="py-2 pr-4 align-top">Fast, zero-setup CLI; broad one-tool coverage</td>
                  <td className="py-2 align-top">Single aggregated database each; shallower depth</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top"><strong>ScanRook</strong></td>
                  <td className="py-2 pr-4 align-top">CLI + platform</td>
                  <td className="py-2 pr-4 align-top">Multi-source enrichment (OSV, NVD, OVAL); installed-state reads; confidence tiers</td>
                  <td className="py-2 align-top">Slower in live-query mode; container/binary/source focus</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            The architectural point behind our own approach is coverage. In{" "}
            <Link href="/blog/vulnerability-scanner-benchmark-2026" className="underline">
              our 2026 benchmark
            </Link>{" "}
            (warm cache; ScanRook v1.14.2, Trivy 0.69.1, Grype 0.109.0), matching every package
            against several advisory sources in parallel surfaced far more real findings than
            single-database matching &mdash; 1,365 findings on ubuntu:24.04 versus 10 and 47 for the
            single-database tools. We did not run Clair in that benchmark, so we will not quote a
            number for it; the relevant point is structural rather than about any one tool. Clair,
            like Trivy and Grype, is built around a focused set of sources; the more advisory
            databases a scanner consults, the more of what is really present it tends to surface. Our{" "}
            <Link href="/blog/cve-database-comparison" className="underline">
              CVE database comparison
            </Link>{" "}
            shows how differently the major sources cover the same packages.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">When to reach for Clair</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>You run a registry and want scanning built in.</strong> Clair is designed for
              exactly this, and if you run Quay you already have it.
            </li>
            <li>
              <strong>You want index-once, notify-later coverage.</strong> The notifier model catches
              CVEs published after an image was scanned without re-submitting it.
            </li>
            <li>
              <strong>Your images are OS-package heavy.</strong> Clair&apos;s distribution-tracker
              coverage is its core strength.
            </li>
            <li>
              <strong>Prefer a CLI or need broader source coverage?</strong> A single-binary scanner
              is simpler to drop into CI, and a multi-source scanner gives you more finding depth.
              The best roundup of the field is our{" "}
              <Link href="/blog/best-container-vulnerability-scanners-2026" className="underline">
                best container vulnerability scanners of 2026
              </Link>
              , and the open-source landscape overlaps with our{" "}
              <Link href="/blog/anchore-alternatives" className="underline">
                Anchore alternatives
              </Link>{" "}
              comparison.
            </li>
          </ul>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is Clair?</h3>
              <p className="text-sm muted mt-1">
                An open-source engine for static vulnerability analysis of container images, created
                by CoreOS, maintained by Red Hat, and the scanner behind the Quay registry.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How does Clair work?</h3>
              <p className="text-sm muted mt-1">
                An Indexer records the packages in each layer, a Matcher compares them against
                updater-maintained advisory data, and a Notifier alerts on new CVEs affecting
                already-indexed images.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is Clair a CLI like Trivy?</h3>
              <p className="text-sm muted mt-1">
                No &mdash; Clair is a server with an HTTP API backed by PostgreSQL. You submit images
                to it, usually via clairctl. That suits registry-integrated scanning more than
                one-shot CLI runs.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How does ScanRook differ?</h3>
              <p className="text-sm muted mt-1">
                ScanRook scans an image tarball, binary, or source archive against OSV, NVD, and Red
                Hat OVAL in parallel, reading the real package databases &mdash; a different
                deployment model and broader source coverage.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Compare on your own images</h3>
          <p className="text-sm muted leading-relaxed">
            The fair way to evaluate any scanner is against your own images. Scan one with ScanRook
            next to whatever you run today &mdash; every finding carries its source and a confidence
            tier, so you can verify the difference rather than trust a benchmark.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--dg-accent,#2563eb)] text-white px-4 py-2 text-sm font-medium"
            >
              Start scanning
            </Link>
            <Link href="/compare/trivy" className="btn-secondary">ScanRook vs Trivy</Link>
          </div>
        </section>

        <footer className="border-t border-black/10 dark:border-white/10 pt-4 text-xs muted grid gap-2">
          <p>
            <strong>Related reading:</strong>{" "}
            <Link href="/blog/best-container-vulnerability-scanners-2026" className="underline">
              Best Container Vulnerability Scanners in 2026
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/vulnerability-scanner-benchmark-2026" className="underline">
              Vulnerability Scanner Benchmark 2026
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-image-scanning-guide" className="underline">
              Container Image Scanning Guide
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
