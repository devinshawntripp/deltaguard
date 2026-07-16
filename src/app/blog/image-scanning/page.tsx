import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-01";

const title = `Image Scanning: How Container Vulnerability Scanning Works | ${APP_NAME}`;
const description =
  "Image scanning finds known CVEs in a container's OS packages and dependencies. How it works, what it catches and misses, and where to run it.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "image scanning",
    "container image scanning",
    "docker image scanning",
    "image vulnerability scanning",
    "scan container image for vulnerabilities",
    "how image scanning works",
    "container security scanning",
    "cve scanning images",
    "registry image scanning",
    "image scan in ci",
  ],
  alternates: { canonical: "/blog/image-scanning" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/image-scanning",
    images: ["/blog/image-scanning.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/image-scanning.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Image Scanning: How Container Vulnerability Scanning Works",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/image-scanning",
  image: "https://scanrook.io/blog/image-scanning.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is image scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Image scanning is the process of inspecting a container image to find known vulnerabilities in the software it contains. A scanner reads the image layers, builds an inventory of the installed OS and language packages, and matches each component and version against vulnerability databases to report CVEs, their severity, and whether a fix is available.",
      },
    },
    {
      "@type": "Question",
      name: "What does image scanning catch and what does it miss?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It catches known, published vulnerabilities in packages the scanner can identify, and often secrets and license issues too. It does not catch unknown zero-days, logic flaws in your own code, or runtime misbehavior, and it cannot tell you on its own whether a vulnerable code path is actually reachable in your application.",
      },
    },
    {
      "@type": "Question",
      name: "Where should image scanning run in a pipeline?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The strongest programs scan in several places: on the developer's machine before pushing, in CI on every build, in the registry on a schedule to catch newly disclosed CVEs in already-built images, and at admission control to block vulnerable images from deploying. Each stage catches problems the others let through.",
      },
    },
    {
      "@type": "Question",
      name: "Why do two scanners report different numbers on the same image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Because they read different vulnerability databases and identify packages differently. A scanner that matches against one aggregated database will report fewer findings than one that queries several sources in parallel, and installed-state detection versus file-path matching changes both the coverage and the false-positive rate.",
      },
    },
    {
      "@type": "Question",
      name: "Is image scanning enough on its own?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No single scan is a complete program. Image scanning is the backbone, but it works best combined with commit-time secret scanning, dependency review in your codebase, and runtime monitoring. Image scanning tells you what known-vulnerable software you are shipping; the other layers cover what it cannot see.",
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
            Image Scanning: How Container Vulnerability Scanning Works
          </h1>
          <p className="text-sm muted">Published November 1, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Image scanning is the single most common security control in a container pipeline, and
            also one of the most misunderstood. It is not magic and it is not complete &mdash; it is
            a specific, well-defined process for finding <em>known</em> vulnerabilities in the
            software packed into an image. This guide explains how that process works, what it can
            and cannot see, and how to place it in your pipeline so it actually reduces risk.
          </p>
        </header>

        <img
          src="/blog/image-scanning.jpg"
          alt="Container image scanning pipeline"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What image scanning actually does</h2>
          <p className="text-sm muted">
            A container image is a stack of filesystem layers containing an operating system, its
            packages, and whatever application code and dependencies you added. Image scanning
            inspects that filesystem, works out exactly which software is inside, and checks each
            piece against public records of known vulnerabilities. The output is a list of findings:
            a CVE identifier, the affected package and version, a severity, and &mdash; when known
            &mdash; the version that fixes it.
          </p>
          <p className="text-sm muted">
            Crucially, scanning is about <em>known</em> vulnerabilities. It answers the question
            &ldquo;does this image contain software with publicly disclosed security flaws?&rdquo;
            It does not discover new flaws, and it does not test your running application. That
            scope is a strength: known-CVE risk is enormous, cheap to check, and entirely avoidable
            once you can see it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The four stages of a scan</h2>
          <p className="text-sm muted">
            Almost every image scanner follows the same pipeline, whatever the branding on top of
            it:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 680 120" role="img" aria-label="Four stages of image scanning: read image layers, build a package inventory, match against vulnerability databases, report findings" className="w-full max-w-2xl mx-auto">
              <g fontSize="11.5" textAnchor="middle">
                <rect x="10" y="35" width="140" height="50" rx="8" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.25" />
                <text x="80" y="57" fill="currentColor">1. read layers</text>
                <text x="80" y="72" fill="currentColor" opacity="0.7">unpack filesystem</text>

                <rect x="180" y="35" width="140" height="50" rx="8" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.25" />
                <text x="250" y="57" fill="currentColor">2. inventory</text>
                <text x="250" y="72" fill="currentColor" opacity="0.7">packages (SBOM)</text>

                <rect x="350" y="35" width="140" height="50" rx="8" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.25" />
                <text x="420" y="57" fill="currentColor">3. match</text>
                <text x="420" y="72" fill="currentColor" opacity="0.7">vs vuln databases</text>

                <rect x="520" y="35" width="150" height="50" rx="8" fill="var(--dg-accent,#2563eb)" fillOpacity="0.10" stroke="var(--dg-accent,#2563eb)" strokeOpacity="0.55" />
                <text x="595" y="57" fill="currentColor">4. report</text>
                <text x="595" y="72" fill="currentColor" opacity="0.7">CVEs + severity</text>

                <g stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" fill="none">
                  <line x1="150" y1="60" x2="176" y2="60" />
                  <line x1="320" y1="60" x2="346" y2="60" />
                  <line x1="490" y1="60" x2="516" y2="60" />
                </g>
                <g fill="currentColor" fillOpacity="0.4">
                  <polygon points="176,60 168,56 168,64" />
                  <polygon points="346,60 338,56 338,64" />
                  <polygon points="516,60 508,56 508,64" />
                </g>
              </g>
            </svg>
          </div>
          <p className="text-sm muted">
            <strong>Read the layers.</strong> The scanner unpacks the image and walks the merged
            filesystem. <strong>Build an inventory.</strong> It reads package-manager databases
            &mdash; <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/var/lib/dpkg/status</code>{" "}
            on Debian, the RPM database on Red Hat, <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/lib/apk/db/installed</code>{" "}
            on Alpine &mdash; plus language manifests and lockfiles for npm, pip, Go, and others,
            producing what is effectively a{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              software composition inventory
            </Link>
            . <strong>Match against databases.</strong> Each component and version is checked
            against vulnerability data. <strong>Report.</strong> Matches become findings with
            severity and fix information.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Installed-state vs advisory matching</h2>
          <p className="text-sm muted">
            Not all matching is equal. The naive approach compares file paths or names against
            advisory lists, which over-reports (a file that looks like a vulnerable library but is
            not really the affected build) and under-reports (a package the heuristic did not
            recognize). Reading the actual package-manager database instead &mdash; installed-state
            detection &mdash; tells you precisely which package, at which exact version, from which
            distribution is present. That precision is what separates a finding you can act on from
            noise, and we go deep on it in{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs advisory matching
            </Link>
            .
          </p>
          <p className="text-sm muted">
            The database side matters just as much. A scanner that reads only one aggregated feed is
            fast but inherits that feed&apos;s blind spots; one that queries several sources in
            parallel &mdash; OSV for open-source ecosystems, NVD for CPE-matched CVEs, distribution
            trackers like Red Hat OVAL for backported fixes &mdash; sees more of what is really
            there. This is the biggest reason two scanners disagree on the same image.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What image scanning does not catch</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Zero-days.</strong> A vulnerability with no published advisory is invisible to
              matching-based scanning until it is disclosed. Scanning protects you the moment a CVE
              lands, not before.
            </li>
            <li>
              <strong>Your own logic bugs.</strong> An SQL injection or broken auth check in your
              application is not a CVE in a dependency &mdash; that is the job of{" "}
              <Link href="/blog/sast-vs-dast-explained" className="underline">
                SAST and DAST
              </Link>
              , not image scanning.
            </li>
            <li>
              <strong>Reachability.</strong> A raw scan tells you a vulnerable package is present,
              not whether your code ever calls the vulnerable function. That context has to be added
              on top through triage or reachability analysis.
            </li>
            <li>
              <strong>Runtime behavior.</strong> A scan is a snapshot of the image at rest. What the
              container does once running &mdash; unexpected network calls, privilege escalation
              &mdash; is the domain of runtime security tools.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where to run it</h2>
          <p className="text-sm muted">
            Image scanning is most effective when it happens at multiple points, because each stage
            catches what the others miss:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Locally,</strong> before you push &mdash; the fastest feedback loop, catching
              obvious problems before they reach shared infrastructure.
            </li>
            <li>
              <strong>In CI, on every build</strong> &mdash; the enforced gate. Fail the build on
              new critical or high findings so regressions cannot merge. Our{" "}
              <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
                guide to scanning a Docker image
              </Link>{" "}
              covers this end to end.
            </li>
            <li>
              <strong>In the registry, on a schedule</strong> &mdash; because a CVE disclosed today
              affects images you built and passed last month. Re-scanning already-stored images is
              how you catch newly published vulnerabilities in software that has not changed.
            </li>
            <li>
              <strong>At admission control</strong> &mdash; a final gate that blocks images failing
              policy from ever running in the cluster.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scanning an image yourself</h2>
          <p className="text-sm muted">
            You do not need a platform to try it. Export any image to a tar file and scan it
            locally:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# install the scanner
curl -fsSL https://scanrook.io/install.sh | sh

# export the image you want to inspect
docker save myapp:latest -o myapp.tar

# scan it and write a JSON report
scanrook scan myapp.tar --format json --out report.json`}</pre>
          <p className="text-sm muted">
            Read the diff, not just the total. For each finding, ask whether the package is really
            installed, whether a fix exists, and which advisory source reported it &mdash; that is
            the difference between a number and an action. For a broader tooling landscape, see our{" "}
            <Link href="/blog/best-container-vulnerability-scanners-2026" className="underline">
              2026 scanner roundup
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook is an image scanner built around the two decisions that most affect a scan&apos;s
            quality. It reads installed-state package databases rather than guessing from file paths,
            and it matches every package against OSV, NVD, and Red Hat OVAL in parallel instead of a
            single aggregated feed. Each finding is tagged with the source that reported it and a
            confidence tier, so you can filter to verified-installed matches and see when sources
            disagree rather than inheriting one database&apos;s gaps. The same inventory drives an
            SBOM, so the scan doubles as an audit artifact.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is image scanning?</h3>
              <p className="text-sm muted mt-1">
                Inspecting a container image to find known vulnerabilities: read the layers,
                inventory the packages, match them against vulnerability databases, and report the
                CVEs found.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What does it miss?</h3>
              <p className="text-sm muted mt-1">
                Zero-days, logic bugs in your own code, reachability, and runtime behavior. Scanning
                finds published vulnerabilities in identifiable packages, not everything.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Where should it run?</h3>
              <p className="text-sm muted mt-1">
                Ideally in several places &mdash; locally, in CI on every build, in the registry on
                a schedule, and at admission control &mdash; because each stage catches different
                gaps.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why do scanners disagree?</h3>
              <p className="text-sm muted mt-1">
                Different vulnerability databases and different package-detection methods. More
                sources and installed-state detection generally mean more accurate coverage.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">See what your images are really shipping</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook reads installed-state package data and matches it against OSV, NVD, and Red Hat
            OVAL in parallel &mdash; every finding tagged with its source and a confidence tier, so
            you can verify rather than trust the total.
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
            <Link href="/blog/container-image-scanning-guide" className="underline">
              Container Image Scanning: A Practical Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              How to Scan a Docker Image
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/best-container-vulnerability-scanners-2026" className="underline">
              Best Container Scanners 2026
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
