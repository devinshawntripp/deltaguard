import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-22";

const title = `How to Scan Docker Images on Registry Push | ${APP_NAME}`;
const description =
  "How to trigger a ScanRook scan automatically when an image is pushed to your registry, using registry webhooks or GitHub Actions registry_package events.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "scan docker images on registry push",
    "registry push vulnerability scan",
    "container registry webhook scan",
    "ghcr registry_package event scan",
    "harbor webhook vulnerability scan",
    "scan image after push",
    "registry triggered scanning",
    "docker registry security automation",
    "registry push scanrook",
    "automatic image scan on push",
  ],
  alternates: { canonical: "/blog/scan-images-on-registry-push" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/scan-images-on-registry-push",
    images: ["/blog/scan-images-on-registry-push.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/scan-images-on-registry-push.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "How to Scan Docker Images on Registry Push",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/scan-images-on-registry-push",
  image: "https://scanrook.io/blog/scan-images-on-registry-push.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Why scan an image when it is pushed to a registry instead of only in CI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Registry-push scanning catches images pushed by paths that never went through your CI pipeline, such as a manual docker push during an incident, a third-party build system, or a mirrored image from another registry. It is a backstop that guarantees every image landing in the registry gets scanned, regardless of how it got there.",
      },
    },
    {
      "@type": "Question",
      name: "Does GitHub Container Registry support a push-triggered webhook?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, through the registry_package GitHub Actions event, which fires with type published when a new package version is pushed to GHCR and type updated when an existing version changes. A workflow listening for this event can pull the exact image that was just pushed and scan it immediately.",
      },
    },
    {
      "@type": "Question",
      name: "What should happen if a push-triggered scan finds critical vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "At minimum, alert the team that owns the image immediately, since the image may already be pullable by other systems. Some registries support tagging the image as quarantined or removing a manifest via API; whichever response you choose, treat this as an incident response path, not just a failed CI job, because the image already exists in the registry.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use registry push scanning with Harbor or Amazon ECR instead of GHCR?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Harbor has native webhook notifications on push events that can call an HTTP endpoint you control. Amazon ECR emits push events to EventBridge, which can trigger a Lambda function or a Step Functions workflow. Both patterns end the same way: pull the pushed image, scan it, and act on the result.",
      },
    },
    {
      "@type": "Question",
      name: "Does registry push scanning replace CI scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No, they cover different gaps. CI scanning blocks a bad image from ever being pushed. Registry push scanning catches images that reached the registry without CI's involvement, and re-confirms images that CI already approved, in case advisories were published in the time between the CI scan and the push.",
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
          <div className="text-xs uppercase tracking-wide muted">Integrations</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            How to Scan Docker Images on Registry Push
          </h1>
          <p className="text-sm muted">Published August 22, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            Scanning on registry push closes the gap every CI-only gate leaves open: an image that
            reaches the registry without going through the pipeline you gated. This guide sets up a
            GitHub Actions workflow triggered directly by GHCR pushes, and covers the equivalent
            pattern for Harbor and Amazon ECR.
          </p>
        </header>

        <img
          src="/blog/scan-images-on-registry-push.jpg"
          alt="Scanning a container image triggered by a registry push event"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The gap CI-only scanning leaves open</h2>
          <p className="text-sm muted">
            A CI gate like the one in{" "}
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              our GitHub Actions scanning guide
            </Link>{" "}
            only runs for images that were built and pushed by that specific workflow. It does
            nothing for a manual <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker push</code>{" "}
            during an incident, an image promoted from a different CI system, or a mirror job that
            copies a public image into your private registry. Registry-push scanning fixes this by
            triggering directly off the registry&apos;s own push event, so the trigger is the
            registry itself rather than any particular pipeline.
          </p>
          <p className="text-sm muted">
            The scan step is identical to{" "}
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              scanning any other image
            </Link>{" "}
            &mdash; pull it, save it, scan the tar. What changes is the trigger.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The complete workflow for GHCR</h2>
          <p className="text-sm muted">
            GitHub Container Registry pushes fire a <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">registry_package</code>{" "}
            event that a workflow in the same repository can listen for directly &mdash; no
            separate webhook infrastructure required:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`name: Scan on GHCR push

on:
  registry_package:
    types: [published, updated]

jobs:
  scan-pushed-image:
    runs-on: ubuntu-latest
    if: github.event.registry_package.package_type == 'container'
    steps:
      - name: Install ScanRook
        run: curl -fsSL https://scanrook.sh/install | bash

      - name: Pull the exact pushed version
        run: |
          IMAGE="ghcr.io/\${{ github.repository }}@\${{ github.event.registry_package.package_version.version }}"
          echo "IMAGE=$IMAGE" >> "$GITHUB_ENV"
          docker pull "$IMAGE"
          docker save "$IMAGE" -o pushed.tar

      - name: Scan pushed image
        env:
          NVD_API_KEY: \${{ secrets.NVD_API_KEY }}
        run: |
          scanrook scan --file pushed.tar --mode deep --format json --out report.json

      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: registry-push-report
          path: report.json

      - name: Alert on critical findings
        run: |
          CRITICAL=$(jq '.summary.critical // 0' report.json)
          if [ "$CRITICAL" -gt 0 ]; then
            echo "::error::$IMAGE has $CRITICAL critical findings after push"
            jq '.findings[] | select(.severity == "CRITICAL") | {cve, package: .package.name, version: .package.version}' report.json
            curl -fsSL -X POST -H 'Content-type: application/json' \\
              --data "{\\"text\\":\\"Critical findings in $IMAGE after registry push (report attached to workflow run)\\"}" \\
              "\${{ secrets.SLACK_WEBHOOK_URL }}"
          fi`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What each part does</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>registry_package trigger.</strong> <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">published</code>{" "}
              fires for a brand-new package version; <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">updated</code>{" "}
              fires when an existing version is overwritten &mdash; both are pushes worth scanning,
              since a mutable tag can be pushed to more than once.
            </li>
            <li>
              <strong>package_type filter.</strong> The same event covers non-container packages
              (npm, RubyGems, and others) published to GitHub Packages; the{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">if</code>{" "}
              condition keeps this workflow scoped to container images only.
            </li>
            <li>
              <strong>Pull by digest-pinned version.</strong> Using{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">package_version.version</code>{" "}
              from the event payload pulls the exact version that triggered the event, rather than
              a mutable tag that could already have been overwritten by the time the workflow runs.
            </li>
            <li>
              <strong>Alert, not just gate.</strong> Unlike a pre-push CI gate, this scan runs after
              the image already exists in the registry &mdash; failing the workflow does not remove
              it. The Slack notification treats a critical finding as something to respond to
              immediately, not just a red X on a job that already ran.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Responding to a critical finding after the fact</h2>
          <p className="text-sm muted">
            A push-triggered scan finding a critical CVE is a different situation from a CI gate
            catching one: the image is already in the registry and may already be pullable by other
            systems. Treat the response as incident response, not a failed build:
          </p>
          <p className="text-sm muted">
            <strong>Notify immediately, with the specifics.</strong> The alert above includes the
            image reference in the message so whoever responds does not have to dig through a
            workflow log to know what to act on.
          </p>
          <p className="text-sm muted">
            <strong>Consider quarantining, not deleting.</strong> Most registries support tagging or
            labeling an image as unverified rather than deleting it outright, which preserves the
            artifact for investigation while signaling deployment tooling not to pull it. GHCR
            supports this through its package API; Harbor has a native quarantine feature tied to
            its own scanning integration.
          </p>
          <p className="text-sm muted">
            <strong>Check who already pulled it.</strong> Registry access logs (where available) can
            tell you whether the image was pulled into a running environment before the scan
            completed, which determines whether this is a registry cleanup or an active incident.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The same pattern on Harbor and Amazon ECR</h2>
          <p className="text-sm muted">
            The GHCR workflow above is one implementation of a general pattern: registry emits a
            push event, something pulls the exact pushed artifact, scans it, and acts on the result.
            Two other common registries support the same shape natively:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Harbor</strong> has built-in webhook notifications (Project &rarr;
              Configuration &rarr; Webhooks) that POST a JSON payload to an endpoint you control on
              push events. A small receiver service reads the repository and tag from the payload,
              pulls the image, and runs the same scan-and-alert steps.
            </li>
            <li>
              <strong>Amazon ECR</strong> emits push events to EventBridge automatically. An
              EventBridge rule matching <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">ECR Image Action</code>{" "}
              events can invoke a Lambda function (or start a Step Functions workflow for longer
              scans) that pulls the pushed image from ECR and scans it, publishing results to SNS or
              a report bucket.
            </li>
          </ul>
          <p className="text-sm muted">
            In both cases the scan step itself is unchanged from the GHCR example: pull the exact
            artifact identified in the event payload, save it, and run{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">scanrook scan</code>{" "}
            against the tar.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Operational notes</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              Registry-push scanning is a backstop for images that bypass CI, and a second check for
              images that did not &mdash; it deliberately overlaps with{" "}
              <Link href="/blog/scan-docker-images-github-actions" className="underline">
                CI-time scanning
              </Link>{" "}
              rather than replacing it, since advisories can publish between the two events.
            </li>
            <li>
              Rate-limit or debounce the workflow for registries with frequent automated pushes
              (nightly rebuilds, dependency bots) so the scan queue does not back up behind a burst
              of pushes.
            </li>
            <li>
              Keep the uploaded report artifacts even for passing scans; a full history of
              registry-push scan results is useful evidence for{" "}
              <Link href="/blog/compliance-scanning-guide" className="underline">
                compliance scanning requirements
              </Link>{" "}
              that ask for continuous monitoring, not just pre-deploy checks.
            </li>
          </ul>
          <p className="text-sm muted">
            A reference Harbor webhook receiver and an EventBridge/Lambda template are documented in{" "}
            <Link href="/docs" className="underline">the ScanRook docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Why scan on registry push instead of only in CI?</h3>
              <p className="text-sm muted mt-1">
                It catches images pushed outside your CI pipeline &mdash; manual pushes, third-party
                builds, or mirrored images &mdash; and re-checks images CI already approved.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does GHCR support a push webhook?</h3>
              <p className="text-sm muted mt-1">
                Yes, via the <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">registry_package</code>{" "}
                GitHub Actions event, with <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">published</code>{" "}
                and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">updated</code>{" "}
                types.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What if a push-triggered scan finds critical CVEs?</h3>
              <p className="text-sm muted mt-1">
                Alert immediately and treat it as incident response &mdash; the image already exists
                in the registry, so a failed job alone does not remove the risk.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does this work with Harbor or ECR?</h3>
              <p className="text-sm muted mt-1">
                Yes. Harbor has native push webhooks; ECR emits push events to EventBridge. Both can
                trigger the same pull-scan-alert sequence.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan every image that reaches your registry</h3>
          <p className="text-sm muted leading-relaxed">
            Wire the workflow above into your registry and every push &mdash; from CI or otherwise
            &mdash; gets checked against OSV, NVD, and vendor advisory data, with reports you can
            archive and alert on.
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
            <Link href="/blog/nvd-backlog-explained" className="underline">
              The NVD Backlog, Explained
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
