import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-29";

const title = `Amazon ECR Image Scanning: Basic vs Enhanced, Explained | ${APP_NAME}`;
const description =
  "Amazon ECR image scanning explained: basic Clair scans versus enhanced Amazon Inspector, how to enable each, read the findings, and where ScanRook fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "ecr image scanning",
    "amazon ecr image scanning",
    "ecr basic scanning",
    "ecr enhanced scanning",
    "ecr scan on push",
    "amazon inspector container scanning",
    "aws container vulnerability scanning",
    "ecr vulnerability scanning",
    "scan ecr image cli",
    "ecr clair scanning",
  ],
  alternates: { canonical: "/blog/ecr-image-scanning" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/ecr-image-scanning",
    images: ["/blog/ecr-image-scanning.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/ecr-image-scanning.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Amazon ECR Image Scanning: Basic vs Enhanced, Explained",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/ecr-image-scanning",
  image: "https://scanrook.io/blog/ecr-image-scanning.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the difference between basic and enhanced scanning in Amazon ECR?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Basic scanning uses the open-source Clair CVE database to check operating-system packages when an image is pushed or scanned manually, at no extra charge. Enhanced scanning is powered by Amazon Inspector: it covers both OS packages and programming-language dependencies, re-evaluates images continuously as new CVEs are published, and is billed through Inspector.",
      },
    },
    {
      "@type": "Question",
      name: "Does ECR basic scanning cover application dependencies?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Basic scanning only matches operating-system packages installed by the distribution's package manager, using the Clair database. Vulnerabilities in language dependencies such as npm, pip, or Maven artifacts bundled into your application layers are not detected by basic scanning. Enhanced scanning, or a separate scanner that reads language manifests, is needed for those.",
      },
    },
    {
      "@type": "Question",
      name: "Does enhanced ECR scanning cost extra?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Enhanced scanning is delivered by Amazon Inspector and is billed per image scanned and re-scanned under Inspector's pricing, separate from ECR storage and data-transfer charges. Basic scanning has no scanning-specific charge beyond the standard ECR costs. Continuous re-scanning multiplies the number of billable scans over an image's lifetime, so review the estimate before enabling it registry-wide.",
      },
    },
    {
      "@type": "Question",
      name: "How do I enable scan-on-push in Amazon ECR?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Set a registry scanning configuration with the AWS CLI: run aws ecr put-registry-scanning-configuration with --scan-type BASIC or ENHANCED and a rule whose scanFrequency is SCAN_ON_PUSH and whose repositoryFilters select the repositories. You can also set scanOnPush per repository with aws ecr put-image-scanning-configuration for basic scanning.",
      },
    },
    {
      "@type": "Question",
      name: "Can I scan a container image before it reaches ECR?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, and it is a good idea. Registry-side scanning only runs after an image is pushed. Scanning the built artifact in CI, before the push, catches a bad image before it is ever published. ScanRook scans an exported image tar in any pipeline, so the same artifact is checked before ECR ever stores it.",
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
            Amazon ECR Image Scanning: Basic vs Enhanced, Explained
          </h1>
          <p className="text-sm muted">Published December 29, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            Amazon ECR image scanning is built into the registry, which makes it easy to turn on and
            easy to misunderstand. There are two modes with very different coverage, cost, and
            timing. This guide explains what each one actually checks, how to enable them from the
            AWS CLI, how to read the results, and where a portable scanner fits alongside them.
          </p>
        </header>

        <img
          src="/blog/ecr-image-scanning.jpg"
          alt="Amazon ECR image scanning: basic versus enhanced"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Two modes, one registry setting</h2>
          <p className="text-sm muted">
            Amazon Elastic Container Registry offers two scanning modes, and a registry uses one at a
            time. <strong>Basic scanning</strong> matches your image&apos;s operating-system packages
            against the open-source Clair CVE database. It runs when you push an image (if
            scan-on-push is enabled) or when you trigger a scan manually, and it carries no
            scanning-specific charge. <strong>Enhanced scanning</strong> is powered by Amazon
            Inspector: it covers operating-system packages <em>and</em> programming-language
            dependencies, and it keeps re-evaluating images continuously as new CVEs are published,
            billed through Inspector.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Capability</th>
                  <th className="text-left py-2 pr-4 font-semibold">Basic</th>
                  <th className="text-left py-2 font-semibold">Enhanced</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Engine</td>
                  <td className="py-2 pr-4 align-top">Clair (open source)</td>
                  <td className="py-2 align-top">Amazon Inspector</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">OS packages</td>
                  <td className="py-2 pr-4 align-top">Yes</td>
                  <td className="py-2 align-top">Yes</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Language dependencies</td>
                  <td className="py-2 pr-4 align-top">No</td>
                  <td className="py-2 align-top">Yes</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Re-scan on new CVEs</td>
                  <td className="py-2 pr-4 align-top">Manual / on push</td>
                  <td className="py-2 align-top">Continuous</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">Cost</td>
                  <td className="py-2 pr-4 align-top">No scan charge</td>
                  <td className="py-2 align-top">Billed via Inspector</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            The practical takeaway: basic scanning is a free OS-package check, and enhanced scanning
            is a paid, deeper, always-on service. Neither replaces scanning the image earlier in your
            pipeline &mdash; more on that below. For the general mechanics of container scanning
            independent of AWS, see our{" "}
            <Link href="/blog/container-image-scanning-guide" className="underline">
              container image scanning guide
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">When each scan runs</h2>
          <p className="text-sm muted">
            Every ECR scan is triggered by the same registry: an image is pushed, a trigger fires,
            and findings land where you can query them. The difference between the modes is the
            engine and how often it re-runs.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 760 150" role="img" aria-label="ECR scan pipeline: build, push to ECR, scan trigger, findings" className="w-full h-auto" style={{ color: "var(--dg-accent,#2563eb)" }}>
              <g fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5">
                <rect x="10" y="45" width="150" height="60" rx="8" />
                <rect x="200" y="45" width="150" height="60" rx="8" />
                <rect x="390" y="45" width="160" height="60" rx="8" strokeOpacity="0.9" strokeWidth="2" />
                <rect x="590" y="45" width="160" height="60" rx="8" />
              </g>
              <g fill="currentColor" fillOpacity="0.9" textAnchor="middle" fontSize="14" fontWeight="600">
                <text x="85" y="80">docker build</text>
                <text x="275" y="80">push to ECR</text>
                <text x="470" y="72">scan trigger</text>
                <text x="670" y="72">findings</text>
              </g>
              <g fill="currentColor" fillOpacity="0.6" textAnchor="middle" fontSize="10.5">
                <text x="470" y="90">on-push &middot; continuous</text>
                <text x="670" y="90">ECR + Inspector</text>
              </g>
              <g stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" fill="currentColor" fillOpacity="0.45">
                <line x1="162" y1="75" x2="196" y2="75" />
                <polygon points="196,71 202,75 196,79" stroke="none" />
                <line x1="352" y1="75" x2="386" y2="75" />
                <polygon points="386,71 392,75 386,79" stroke="none" />
                <line x1="552" y1="75" x2="586" y2="75" />
                <polygon points="586,71 592,75 586,79" stroke="none" />
              </g>
            </svg>
          </div>
          <p className="text-sm muted">
            Basic scanning stops at the push (or a manual re-scan). Enhanced scanning keeps the
            highlighted trigger active, re-checking stored images against Inspector as advisories
            change &mdash; which is its main advantage over basic, and the source of its per-scan
            billing.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Enabling basic scanning</h2>
          <p className="text-sm muted">
            The simplest way to enable scan-on-push for basic scanning is per repository, so images
            are checked against Clair the moment they are pushed:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Turn on scan-on-push for a single repository
aws ecr put-image-scanning-configuration \\
  --repository-name my-app \\
  --image-scanning-configuration scanOnPush=true

# Or set it registry-wide for every repository at once
aws ecr put-registry-scanning-configuration \\
  --scan-type BASIC \\
  --rules '[
    {
      "scanFrequency": "SCAN_ON_PUSH",
      "repositoryFilters": [{ "filter": "*", "filterType": "WILDCARD" }]
    }
  ]'`}</pre>
          <p className="text-sm muted">
            To scan an image that is already in the registry without re-pushing it, trigger a manual
            scan:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`aws ecr start-image-scan \\
  --repository-name my-app \\
  --image-id imageTag=latest`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Enabling enhanced scanning</h2>
          <p className="text-sm muted">
            Enhanced scanning is a registry-level setting that activates Amazon Inspector for the
            repositories your rules match. Use <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CONTINUOUS_SCAN</code>{" "}
            to have Inspector keep monitoring stored images as new CVEs are published, or{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">SCAN_ON_PUSH</code>{" "}
            to only scan at push time:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`aws ecr put-registry-scanning-configuration \\
  --scan-type ENHANCED \\
  --rules '[
    {
      "scanFrequency": "CONTINUOUS_SCAN",
      "repositoryFilters": [{ "filter": "*", "filterType": "WILDCARD" }]
    }
  ]'`}</pre>
          <p className="text-sm muted">
            Because enhanced scanning is Inspector, it must be enabled for ECR in Amazon Inspector on
            the account (and, for continuous scanning, kept enabled). Narrow the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">repositoryFilters</code>{" "}
            from <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">*</code>{" "}
            to the repositories that actually need continuous coverage &mdash; every stored image
            that matches becomes a recurring, billable scan.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Reading the findings</h2>
          <p className="text-sm muted">
            Both modes write results back to ECR, so the same command returns a severity breakdown.
            Enhanced findings also appear in the Amazon Inspector console, where they can be routed
            to Security Hub and EventBridge:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Severity counts for a specific image
aws ecr describe-image-scan-findings \\
  --repository-name my-app \\
  --image-id imageTag=latest \\
  --query 'imageScanFindings.findingSeverityCounts'

# Full finding list (CVE id, package, severity)
aws ecr describe-image-scan-findings \\
  --repository-name my-app \\
  --image-id imageTag=latest \\
  --query 'imageScanFindings.findings[].{cve:name,severity:severity}'`}</pre>
          <p className="text-sm muted">
            To gate a deployment on results, wire this command into your pipeline and fail the job
            when the severity counts exceed your threshold &mdash; the same pattern we use in{" "}
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              the GitHub Actions workflow
            </Link>
            , adapted to whichever CI system pushes to your registry.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What ECR scanning does and does not cover</h2>
          <p className="text-sm muted">
            ECR scanning is convenient because it is part of the registry, but that placement defines
            its limits. It is worth being explicit about them so the scan does not create a false
            sense of completeness:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>It runs after the push.</strong> Registry scanning cannot stop a bad image from
              being published &mdash; by the time it reports, the image is already stored and may
              already be pulled. Catching problems earlier means scanning the artifact in CI.
            </li>
            <li>
              <strong>Basic scanning is OS-only and single-source.</strong> Clair matches
              distribution packages against one aggregated database. Language dependencies and the
              breadth of multiple advisory sources are outside its scope &mdash; see our{" "}
              <Link href="/blog/cve-database-comparison" className="underline">
                CVE database comparison
              </Link>{" "}
              for why source coverage matters.
            </li>
            <li>
              <strong>It only covers images in ECR.</strong> Images in other registries, in a local
              build cache, or on a developer laptop are invisible to it. A multi-cloud or hybrid
              estate needs a scanner that is not tied to one registry.
            </li>
            <li>
              <strong>Enhanced coverage is per-scan billing.</strong> Continuous scanning is genuinely
              useful, but every matched image is a recurring cost, which pushes teams to scope it
              tightly rather than everywhere.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook is not a replacement for ECR scanning &mdash; it sits at a different point in
            the lifecycle. ECR scans images <em>after</em> they are pushed; ScanRook scans the built
            artifact <em>before</em> it is, in whatever CI system produced it, so a failing image
            never reaches the registry in the first place. Because it scans an exported image tar,
            it works the same way whether the destination is ECR, another cloud&apos;s registry, or a
            self-hosted one.
          </p>
          <p className="text-sm muted">
            It also queries more than one source. Where basic scanning matches against Clair alone,
            ScanRook checks each installed package against OSV, NVD, and Red Hat OVAL in parallel and
            tags every finding with its source and a confidence tier, reading the actual
            package-manager state inside the image rather than inferring from tags &mdash; the
            approach we describe in{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state versus advisory matching
            </Link>
            . Run it before the push and let ECR enhanced scanning continue to watch stored images
            over time; the two cover different windows.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`curl -fsSL https://scanrook.sh/install | sh

ACCOUNT=123456789012
REGION=us-east-1
REGISTRY="$ACCOUNT.dkr.ecr.$REGION.amazonaws.com"

# Authenticate to ECR and pull the image you want to check
aws ecr get-login-password --region "$REGION" \\
  | docker login --username AWS --password-stdin "$REGISTRY"
docker pull "$REGISTRY/my-app:latest"

# Export the image and scan the artifact
docker save "$REGISTRY/my-app:latest" -o my-app.tar
scanrook scan --file my-app.tar --format json --out report.json`}</pre>
          <p className="text-sm muted">
            The same command drops into a CI job before the <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker push</code>,
            so the image is checked as an artifact and only published if it passes. Full options are
            in <Link href="/docs" className="underline">the ScanRook docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is the difference between basic and enhanced ECR scanning?</h3>
              <p className="text-sm muted mt-1">
                Basic scanning uses Clair to check OS packages at no scan charge; enhanced scanning
                uses Amazon Inspector to check OS <em>and</em> language dependencies continuously, and
                is billed per scan.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does basic scanning find application dependency CVEs?</h3>
              <p className="text-sm muted mt-1">
                No. Basic scanning matches operating-system packages only. Language dependencies
                bundled into your app layers need enhanced scanning or a scanner that reads language
                manifests.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is enhanced scanning free?</h3>
              <p className="text-sm muted mt-1">
                No. Enhanced scanning is Amazon Inspector and is billed per image scanned and
                re-scanned. Basic scanning has no scanning-specific charge beyond standard ECR costs.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can I scan an image before it reaches ECR?</h3>
              <p className="text-sm muted mt-1">
                Yes. Scan the exported image tar in CI before the push. ScanRook does this in any
                pipeline, so a failing image never gets published to the registry.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan the image before it hits your registry</h3>
          <p className="text-sm muted leading-relaxed">
            ECR watches images after they are pushed. ScanRook checks the artifact before that &mdash;
            against OSV, NVD, and vendor advisory data, with a source and confidence tier on every
            finding &mdash; in whatever pipeline builds it and whatever registry it ships to.
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
              Container Image Scanning Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              How to Scan a Docker Image for Vulnerabilities
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              How to Scan Docker Images in GitHub Actions
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
