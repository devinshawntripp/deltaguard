import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-08";

const title = `Is the Postgres Docker Image Safe? What Our Scanner Found | ${APP_NAME}`;
const description =
  "We scanned postgres:17 with ScanRook: 2,983 findings (387 critical). What that means, which CVEs matter, and why the Alpine tag cuts findings by 86%.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "is postgres docker image safe",
    "postgres docker image vulnerabilities",
    "postgres docker cve",
    "postgres:17 vulnerabilities",
    "postgres alpine image security",
    "postgres container security",
    "postgres image scan",
    "safest postgres docker tag",
    "postgres docker security best practices",
    "postgres vulnerability scan",
  ],
  alternates: { canonical: "/blog/is-postgres-docker-image-safe" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/is-postgres-docker-image-safe",
    images: ["/blog/series-image-safety-2.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/series-image-safety-2.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Is the Postgres Docker Image Safe? What Our Scanner Found",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/is-postgres-docker-image-safe",
  image: "https://scanrook.io/blog/series-image-safety-2.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is the postgres Docker image safe to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Broadly yes, with the same caveat as most official Debian-based images: Postgres itself is actively maintained and patched quickly, but the base operating system underneath it carries the majority of the finding count. Switching to the Alpine tag, pinning versions, and rebuilding regularly addresses most of the practical risk.",
      },
    },
    {
      "@type": "Question",
      name: "Why does the postgres Docker image have so many vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The default postgres image is built on Debian, which bundles GnuPG and its dirmngr helper for verifying package signatures, along with a full userland. Those packages each carry their own advisory history, so a scanner reports findings against the whole operating system, not just the Postgres binaries.",
      },
    },
    {
      "@type": "Question",
      name: "Is postgres:alpine more secure than the default postgres image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It has a much smaller footprint. In our scans, postgres:17 produced 2,983 findings (387 critical) while postgres:17-alpine produced 410 findings (36 critical) — about 86% fewer. Alpine's musl libc and BusyBox userland simply contain less software than Debian's.",
      },
    },
    {
      "@type": "Question",
      name: "How do I scan the postgres Docker image for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Export the image with docker save, then run a scanner against the resulting tar archive. With ScanRook: install the CLI, run docker save postgres:17 -o postgres.tar, then scanrook scan postgres.tar to get a severity breakdown and per-package findings.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to fix every CVE reported in the postgres image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Many findings sit in build-time verification tooling — GnuPG and dirmngr — that never executes once the container is running Postgres. Triage by severity and reachability first, and consider a smaller base tag if you want those categories of findings gone rather than triaged.",
      },
    },
  ],
};

const SEVERITY_ROWS: { tag: string; total: number; buckets: { label: string; count: number }[] }[] = [
  {
    tag: "postgres:17",
    total: 2983,
    buckets: [
      { label: "Critical", count: 387 },
      { label: "High", count: 970 },
      { label: "Medium", count: 1344 },
      { label: "Low", count: 241 },
    ],
  },
  {
    tag: "postgres:17-alpine",
    total: 410,
    buckets: [
      { label: "Critical", count: 36 },
      { label: "High", count: 194 },
      { label: "Medium", count: 168 },
      { label: "Low", count: 9 },
    ],
  },
];

const SEVERITY_MAX = Math.max(
  ...SEVERITY_ROWS.flatMap((r) => r.buckets.map((b) => b.count)),
);

const SEVERITY_FILL: Record<string, string> = {
  Critical: "fill-[var(--dg-accent,#2563eb)]",
  High: "fill-current opacity-50",
  Medium: "fill-current opacity-30",
  Low: "fill-current opacity-20",
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
            Is the Postgres Docker Image Safe? What Our Scanner Found
          </h1>
          <p className="text-sm muted">Published July 8, 2026 &middot; 6 min read</p>
          <p className="text-sm muted">
            Postgres is one of the most-deployed database images on Docker Hub, so &ldquo;is the
            postgres Docker image safe&rdquo; is worth answering with data instead of assumptions.
            We scanned{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">postgres:17</code>{" "}
            and its Alpine variant with ScanRook and looked at what the findings actually mean.
          </p>
        </header>

        <img
          src="/blog/series-image-safety-2.jpg"
          alt="Is the postgres Docker image safe — container image safety series"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-2">
          <h2 className="text-sm font-semibold">The verdict</h2>
          <p className="text-sm muted leading-relaxed">
            Mostly yes, with caveats. The Postgres project ships timely fixes for the database
            engine itself, and CVEs in Postgres proper are relatively rare compared to the finding
            count you see on a full scan. The bulk of that count comes from the Debian base image
            underneath &mdash; GnuPG, dirmngr, and the rest of the userland required to verify and
            install packages during the build. The practical risks are running an oversized tag
            when a slimmer one would do, skipping rebuilds after base image patches ship, and
            giving the database container more privilege than it needs. All three are addressable
            without touching your schema.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What we found scanning postgres:17</h2>
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
                  <td className="py-2 pr-4 text-xs font-mono">postgres:17</td>
                  <td className="py-2 pr-4">2,983</td>
                  <td className="py-2 pr-4">387</td>
                  <td className="py-2 pr-4">970</td>
                  <td className="py-2 pr-4">1,344</td>
                  <td className="py-2">241</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-xs font-mono">postgres:17-alpine</td>
                  <td className="py-2 pr-4">410</td>
                  <td className="py-2 pr-4">36</td>
                  <td className="py-2 pr-4">194</td>
                  <td className="py-2 pr-4">168</td>
                  <td className="py-2">9</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ScanRook v1.14.2, warm-cache scan, 2026-07-04. Counts change as new advisories publish.
          </p>
          <figure className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 596 204"
              className="w-full"
              style={{ maxWidth: "640px" }}
              role="img"
              aria-label="Grouped bar chart of ScanRook severity counts. postgres:17: 2,983 findings total, 387 critical, 970 high, 1,344 medium, 241 low. postgres:17-alpine: 410 findings total, 36 critical, 194 high, 168 medium, 9 low."
            >
              <title>Grouped bar chart of ScanRook severity counts. postgres:17: 2,983 findings total, 387 critical, 970 high, 1,344 medium, 241 low. postgres:17-alpine: 410 findings total, 36 critical, 194 high, 168 medium, 9 low.</title>
              {SEVERITY_ROWS.map((row, i) => {
                const gy = 14 + i * 104;
                return (
                  <g key={row.tag}>
                    <text x="0" y={gy} className="fill-current text-[11px] font-semibold font-mono">
                      {row.tag}
                    </text>
                    <text x="0" y={gy + 14} className="fill-current text-[9px] opacity-60">
                      {row.total.toLocaleString("en-US")} findings total
                    </text>
                    {row.buckets.map((b, j) => {
                      const y = gy + 22 + j * 19;
                      const w = Math.max(2, Math.round((b.count / SEVERITY_MAX) * 380));
                      return (
                        <g key={b.label}>
                          <text x="0" y={y + 10} className="fill-current text-[10px] opacity-80">
                            {b.label}
                          </text>
                          <rect
                            x="100"
                            y={y}
                            width={w}
                            height="13"
                            rx="2"
                            className={SEVERITY_FILL[b.label]}
                          />
                          <text x={105 + w} y={y + 10} className="fill-current text-[9px] opacity-70">
                            {b.count.toLocaleString("en-US")}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
            <figcaption className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              The same scan data as a chart &mdash; ScanRook v1.14.2 warm-cache scan of postgres:17 and
              postgres:17-alpine, 2026-07-04. Bar length is proportional to the count in each severity bucket,
              on a scale shared by both tags; the figure beside each tag name is the total finding
              count that scan reported.
            </figcaption>
          </figure>
          <p className="text-sm muted">
            As with most Debian-based official images, the headline number is dominated by the
            base operating system rather than the application. postgres:17 ships GnuPG and its
            dirmngr helper for signature verification, plus a broad set of Debian utilities, and
            each contributes its own advisory history. The Alpine tag strips almost all of that
            away, which is why it carries roughly 86% fewer findings.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The CVEs worth knowing about</h2>
          <p className="text-sm muted">
            The top critical findings from our scan of postgres:17 cluster around three packages:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>dirmngr &mdash; CVE-2005-2023 and CVE-2006-6235.</strong> dirmngr is GnuPG&apos;s
              network-facing helper for fetching keys and checking certificate revocation. Both
              advisories date to the mid-2000s. dirmngr only runs when Postgres&apos;s package
              manager needs to verify a signature, which in a running database container is
              effectively never &mdash; it matters at build time, not at query time.
            </li>
            <li>
              <strong>gnupg &mdash; CVE-2005-2023 and CVE-2006-6235.</strong> Same advisories,
              flagged against the core GnuPG binary that dirmngr depends on. It ships in the image
              because Debian&apos;s package tooling uses it to verify APT repository signatures
              during builds and rebuilds.
            </li>
            <li>
              <strong>gnupg-l10n &mdash; CVE-2005-2023.</strong> The localization data package for
              GnuPG. It carries the same advisory as its parent binary but contains no executable
              code of its own &mdash; it is translation strings, not attack surface.
            </li>
          </ul>
          <p className="text-sm muted">
            None of these touch the Postgres server process itself. They are a byproduct of
            Debian&apos;s package-verification chain being present in the image. Our guide to{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs. advisory matching
            </Link>{" "}
            covers why scanners flag decades-old build tooling like this at all.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Which tag should you use?</h2>
          <p className="text-sm muted">
            For most deployments, <strong>postgres:17-alpine</strong> is the better default. Same
            upstream Postgres release, same initialization scripts and environment variables, but
            410 findings instead of 2,983 and 36 critical instead of 387 in our scan. The tradeoff
            is musl libc instead of glibc, which occasionally affects extensions compiled against
            glibc-specific behavior.
          </p>
          <p className="text-sm muted">
            Stay on the Debian-based tag if you depend on extensions distributed only as glibc
            binaries, or your organization standardizes on Debian for compliance tooling. Either
            way, pin an exact version rather than tracking a floating tag. For the broader tradeoffs
            between base image families, see{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Hardening checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Run the container as the built-in non-root <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">postgres</code> user rather than overriding it to root.</li>
            <li>
              Pin the image by digest (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">postgres@sha256:&hellip;</code>),
              not just by tag, so restores and redeploys are reproducible.
            </li>
            <li>Store credentials via <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">POSTGRES_PASSWORD_FILE</code> or a secrets manager instead of plain environment variables.</li>
            <li>Mount the data directory on a dedicated volume with restrictive host permissions.</li>
            <li>Restrict network exposure &mdash; bind to an internal network and avoid publishing 5432 publicly.</li>
            <li>Rebuild and redeploy on a schedule so base image patches actually reach your running containers.</li>
            <li>Scan every build in CI so a base image regression is caught before it ships.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scan it yourself</h2>
          <p className="text-sm muted">
            Counts drift as new advisories publish, so verify against the exact tag and digest you
            deploy:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`curl -fsSL https://scanrook.io/install.sh | sh
docker save postgres:17 -o postgres.tar
scanrook scan postgres.tar`}</pre>
          <p className="text-sm muted">
            The full CLI reference, including JSON output and severity gating for CI, is in{" "}
            <Link href="/docs" className="underline">the docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is the postgres Docker image safe to use?</h3>
              <p className="text-sm muted mt-1">
                Broadly yes. Postgres itself is patched quickly; most findings come from the
                Debian base packages underneath it. Use the Alpine tag, pin versions, and rebuild
                regularly to address the bulk of the practical risk.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why does the image have so many vulnerabilities?</h3>
              <p className="text-sm muted mt-1">
                The default tag ships GnuPG, dirmngr, and a full Debian userland for package
                verification. Scanners report the whole operating system layer, not just the
                Postgres binaries.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is postgres:alpine more secure?</h3>
              <p className="text-sm muted mt-1">
                It has a much smaller attack surface: 410 findings vs 2,983 in our scan, about 86%
                fewer, because musl libc and BusyBox replace the full Debian userland.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Do I need to fix every reported CVE?</h3>
              <p className="text-sm muted mt-1">
                No. Triage by severity and reachability &mdash; GnuPG and dirmngr never execute in a
                running Postgres container. A smaller base tag removes whole categories of findings
                at once.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan your postgres image with ScanRook</h3>
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
            <Link href="/blog/is-nginx-docker-image-safe" className="underline">
              Is the Nginx Docker Image Safe?
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
