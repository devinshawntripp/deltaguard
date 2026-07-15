import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-03";

const title = `Container Image Scanning: A Practical Guide for 2026 | ${APP_NAME}`;
const description =
  "What container image scanning is, how it works, what it catches and misses, where to run it in your pipeline, and how to choose a scanner that fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "container image scanning",
    "container scanning",
    "image vulnerability scanning",
    "scan container image for vulnerabilities",
    "docker image scanning",
    "container security scanning",
    "how container scanners work",
    "container image security",
    "cve scanning containers",
    "container scanning tools",
  ],
  alternates: { canonical: "/blog/container-image-scanning-guide" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/container-image-scanning-guide",
    images: ["/blog/container-image-scanning-guide.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/container-image-scanning-guide.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Container Image Scanning: A Practical Guide for 2026",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/container-image-scanning-guide",
  image: "https://scanrook.io/blog/container-image-scanning-guide.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is container image scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Container image scanning is the process of inspecting a built container image to inventory the operating-system packages and application dependencies it contains, then matching those components against vulnerability databases to report known CVEs. It analyzes the artifact you are about to ship, layer by layer, rather than the running container or the source repository.",
      },
    },
    {
      "@type": "Question",
      name: "What does image scanning catch that a source scan does not?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An image scan sees everything the build actually assembled: the base OS packages, transitively pulled system libraries, and language dependencies as installed, including versions a lockfile scan cannot predict. A source scan reads your declared dependencies; an image scan reads what shipped, which is often a larger and more accurate set.",
      },
    },
    {
      "@type": "Question",
      name: "Where should container image scanning run?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Run it in more than one place: locally for fast feedback, in CI on every build to gate merges, at the registry to catch images that drift as new advisories publish, and optionally at Kubernetes admission to block unscanned images from deploying. Each stage covers a different failure mode.",
      },
    },
    {
      "@type": "Question",
      name: "Does container scanning find misconfigurations and secrets?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Some tools bundle those checks, but vulnerability scanning and misconfiguration or secret scanning are distinct jobs. A CVE scanner tells you which known-vulnerable packages are present; it does not by itself judge Dockerfile hardening, exposed secrets, or runtime behavior. Treat them as complementary layers rather than one tool.",
      },
    },
    {
      "@type": "Question",
      name: "Why do two scanners report different numbers on the same image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Because they read different vulnerability sources and match differently. A scanner tied to one aggregated database will miss advisories another source carries, and file-path matching produces different results than reading the actual package-manager database. Comparing the diff, not just the totals, is the only way to know which findings are real.",
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
            Container Image Scanning: A Practical Guide for 2026
          </h1>
          <p className="text-sm muted">Published September 3, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            Container image scanning is the least glamorous and most reliable control in a container
            security program: point a tool at a built image, get back a list of known-vulnerable
            packages, fix the ones that matter. The idea is simple, but the details &mdash; what a
            scanner actually reads, what it misses, and where in the pipeline it belongs &mdash;
            decide whether the results are useful or just noise. Here is the working version.
          </p>
        </header>

        <img
          src="/blog/container-image-scanning-guide.jpg"
          alt="How container image scanning works"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What a scan actually inspects</h2>
          <p className="text-sm muted">
            A container image is not a black box; it is a stack of tarball layers plus a JSON
            manifest describing them. When you scan an image, the tool unpacks those layers and
            builds an inventory of what is installed. That inventory has two halves. The first is
            operating-system packages &mdash; the <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">dpkg</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">rpm</code>, or{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">apk</code> database
            that records every system library and binary the base image ships. The second is
            application dependencies: the npm, pip, Go, Cargo, Maven, and other language packages
            your build copied in.
          </p>
          <p className="text-sm muted">
            The scanner then matches each of those components &mdash; by name and exact version
            &mdash; against vulnerability data and reports the CVEs that apply. That is the whole
            mechanism. The quality differences between scanners come down to two questions: how
            accurately they read the inventory, and how completely they match it. We unpack the
            first question in{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs advisory matching
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Image scanning vs source scanning</h2>
          <p className="text-sm muted">
            A common question is whether scanning source code makes image scanning redundant. It
            does not, and the reason is worth internalizing. A source scan reads your{" "}
            <em>declared</em> dependencies &mdash; the lockfile, the manifest, the requirements
            file. An image scan reads what the build <em>actually produced</em>. Those two sets
            diverge constantly: a base image pulls in dozens of OS libraries you never declared, a
            multi-stage build may leave behind a compiler toolchain, and a transitive dependency can
            resolve to a different version at build time than the lockfile suggested.
          </p>
          <p className="text-sm muted">
            The image is the thing that runs in production, so the image is the thing an attacker
            actually reaches. Scanning it closes the gap between what you meant to ship and what you
            shipped. The two scans are complementary: source scanning gives developers fast feedback
            on their own dependencies, and image scanning verifies the assembled artifact.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What image scanning does not do</h2>
          <p className="text-sm muted">
            Being honest about the boundaries keeps expectations sane. Vulnerability scanning
            answers one question &mdash; &ldquo;which installed components have known CVEs?&rdquo;
            &mdash; and it answers it well. It does not, on its own, do these things:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Judge misconfiguration.</strong> Running as root, a world-writable filesystem,
              or an over-broad capability set are hardening issues, not CVEs. Some suites bundle a
              misconfiguration checker, but it is a separate analysis.
            </li>
            <li>
              <strong>Find secrets.</strong> An API key baked into a layer is a real risk a CVE
              scanner will not flag. Secret scanning is its own tool class.
            </li>
            <li>
              <strong>Detect zero-days or logic bugs.</strong> Scanning matches <em>known</em>
              advisories. A flaw with no published CVE is invisible to it by definition.
            </li>
            <li>
              <strong>Watch runtime behavior.</strong> Whether a vulnerable function is ever
              reached, or whether the container makes suspicious calls in production, is the job of
              runtime security, not a static image scan.
            </li>
          </ul>
          <p className="text-sm muted">
            None of this makes image scanning weak; it makes it one layer. The mistake is treating a
            clean scan as proof the image is secure. It proves the image has no <em>known</em>{" "}
            package vulnerabilities, which is necessary but not sufficient. Our{" "}
            <Link href="/blog/container-scanning-best-practices" className="underline">
              container scanning best practices
            </Link>{" "}
            guide covers how the layers fit together.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where to run it in the pipeline</h2>
          <p className="text-sm muted">
            A single scan at one point in time is a snapshot that goes stale the moment a new
            advisory publishes. Effective programs scan at several stages, each catching a different
            failure:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Local / pre-commit.</strong> Fast feedback while a developer still has context.
              Cheap to fix here, expensive later.
            </li>
            <li>
              <strong>CI, on every build.</strong> The enforcement point. Gate merges on new
              critical or high findings so regressions never reach main. See{" "}
              <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
                how to scan a Docker image
              </Link>{" "}
              for the mechanics.
            </li>
            <li>
              <strong>Registry / scheduled rescan.</strong> An image that passed last month may
              have three new criticals today because the advisories caught up, not because the image
              changed. Rescanning stored images on a cadence catches this drift.
            </li>
            <li>
              <strong>Admission control.</strong> A last gate that refuses to deploy an image that
              was never scanned or exceeds your policy &mdash; see{" "}
              <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
                Kubernetes admission control for image scanning
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Reading results without drowning</h2>
          <p className="text-sm muted">
            The first scan of a real image is often demoralizing: hundreds or thousands of findings.
            The number is not the problem; triage is. A few filters turn a wall of CVEs into a work
            queue. Separate <strong>base-image findings</strong> from{" "}
            <strong>application findings</strong> &mdash; the former you fix by choosing a smaller or
            fresher base, the latter by bumping a dependency. Choosing the base well matters more
            than any single patch, which is why we benchmarked{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>
            .
          </p>
          <p className="text-sm muted">
            Then prioritize by more than severity. A critical CVSS score on a package that is present
            but never invoked is less urgent than a high-severity bug that is actively exploited.
            Exploit-probability signals (EPSS) and the CISA Known Exploited Vulnerabilities catalog
            tell you what attackers are actually using, and a fix-available flag tells you what you
            can even act on. Findings with no fix available belong in a documented, tracked bucket
            rather than blocking a release.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Choosing a scanner</h2>
          <p className="text-sm muted">
            Most container scanners look similar in a demo and diverge sharply on real images. Two
            architectural choices drive the difference. The first is <strong>data sources</strong>:
            a scanner matched against a single aggregated database is fast but inherits that
            database&apos;s blind spots, while one that consults multiple sources (OSV, NVD, GHSA,
            and distribution security trackers like Red Hat OVAL) surfaces advisories the others
            miss. The second is <strong>matching method</strong>: reading the actual package-manager
            database produces fewer false positives than guessing from file paths. Our{" "}
            <Link href="/blog/best-container-vulnerability-scanners-2026" className="underline">
              2026 scanner roundup
            </Link>{" "}
            compares the field on exactly these axes.
          </p>
          <p className="text-sm muted">
            A practical evaluation takes twenty minutes: scan one of your own production images with
            two candidates and read the <em>diff</em>. For each finding one tool reports and the
            other misses, ask whether the package is really installed, whether a fix exists, and
            which source knew about it. A consistent pattern of missed vendor advisories is the
            architecture difference showing up on your own infrastructure.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook is a container, source, and binary scanner built around the two choices above.
            It reads the installed-state package databases inside an image &mdash; OS packages plus
            npm, pip, Go, Cargo, and Maven dependencies as actually shipped &mdash; and matches each
            component against OSV, NVD, and Red Hat OVAL in parallel, tagging every finding with its
            source and a confidence tier. It scans the built artifact, so it catches what the image
            contains rather than only what a lockfile declared.
          </p>
          <p className="text-sm muted">
            It is not a replacement for every tool in your pipeline: it focuses on known-CVE and
            license findings in artifacts, not Dockerfile misconfiguration, secret detection, or
            runtime monitoring. The honest positioning is that it complements those checks by going
            deep on the one question of &ldquo;what vulnerable components did we actually ship,&rdquo;
            and gives you the provenance to verify each answer rather than trust it. See{" "}
            <Link href="/pricing" className="underline">pricing</Link> for the free tier and{" "}
            <Link href="/compare/trivy" className="underline">ScanRook vs Trivy</Link> for a direct
            comparison.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scan an image yourself</h2>
          <p className="text-sm muted">
            The fastest way to understand what image scanning surfaces is to run one. Export any
            image to a tar and scan it:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Install the CLI
curl -fsSL https://scanrook.io/install.sh | sh

# Export an image and scan the artifact
docker save nginx:1.27 -o nginx.tar
scanrook scan --file nginx.tar --format json --out report.json

# Skim the severity summary
jq '.summary' report.json`}</pre>
          <p className="text-sm muted">
            The full options, output schema, and CI recipes are in the{" "}
            <Link href="/docs" className="underline">documentation</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is container image scanning?</h3>
              <p className="text-sm muted mt-1">
                Inspecting a built image to inventory its OS packages and application dependencies,
                then matching them against vulnerability databases to report known CVEs in the
                artifact you are about to ship.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does it replace source scanning?</h3>
              <p className="text-sm muted mt-1">
                No. Source scanning reads declared dependencies; image scanning reads what actually
                shipped, including base-OS libraries a lockfile never mentions. Use both.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Where should it run?</h3>
              <p className="text-sm muted mt-1">
                Locally, in CI on every build, on stored registry images on a schedule, and
                optionally at admission control &mdash; each stage catches a different gap.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why do scanners disagree on counts?</h3>
              <p className="text-sm muted mt-1">
                Different vulnerability sources and different matching methods. Compare the diff, not
                the totals, to see which findings are genuinely present.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan the artifact, not just the lockfile</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook reads the installed packages inside your image and matches them against OSV,
            NVD, and vendor advisory data in parallel, so findings reflect what you actually shipped
            &mdash; each one tagged with its source and a confidence tier.
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
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              How to Scan a Docker Image for Vulnerabilities
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-scanning-best-practices" className="underline">
              Container Scanning Best Practices
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/best-container-vulnerability-scanners-2026" className="underline">
              Best Container Vulnerability Scanners in 2026
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
