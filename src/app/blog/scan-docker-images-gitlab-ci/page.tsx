import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-17";

const title = `How to Scan Docker Images in GitLab CI | ${APP_NAME}`;
const description =
  "A complete GitLab CI pipeline for scanning Docker images: build in Docker-in-Docker, scan with ScanRook, store reports, and fail merge requests on critical CVEs";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "gitlab ci container scanning",
    "scan docker images gitlab ci",
    "gitlab ci vulnerability scanning",
    "gitlab ci docker security",
    "gitlab pipeline container scan",
    "fail merge request on cve",
    "docker in docker security scan",
    "gitlab ci cd container security",
    "gitlab ci scanrook",
    "container scanning pipeline gitlab",
  ],
  alternates: { canonical: "/blog/scan-docker-images-gitlab-ci" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/scan-docker-images-gitlab-ci",
    images: ["/blog/scan-docker-images-gitlab-ci.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/scan-docker-images-gitlab-ci.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "How to Scan Docker Images in GitLab CI",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/scan-docker-images-gitlab-ci",
  image: "https://scanrook.io/blog/scan-docker-images-gitlab-ci.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I scan a Docker image in GitLab CI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Build the image using Docker-in-Docker, export it with docker save, install a scanner CLI in the job, and run it against the tar file. A follow-up job step reads the JSON report with jq and fails the pipeline if severity thresholds are exceeded. This all fits in a single .gitlab-ci.yml job.",
      },
    },
    {
      "@type": "Question",
      name: "Should scanning run on merge requests or only on the default branch?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both, with different rules. Merge request pipelines catch vulnerabilities before merge and can block the merge button through pipeline status. A scheduled pipeline on the default branch catches advisories published after the code was already merged, which a merge-request-only gate would never see.",
      },
    },
    {
      "@type": "Question",
      name: "How do I fail a GitLab pipeline when critical CVEs are found?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Have the scanner write a JSON report to the job's working directory, then read the severity counts with jq in the same or a later job and exit non-zero past your threshold. A non-zero exit fails the job, which fails the pipeline and blocks merge if the job is a required pipeline for the target branch.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need privileged mode for container scanning in GitLab CI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Only if you use the Docker-in-Docker (dind) service to build the image inside the job, which requires privileged: true on GitLab Runner. If you are scanning an image that already exists in a registry, you can skip dind entirely and just pull and save it, avoiding the privileged requirement.",
      },
    },
    {
      "@type": "Question",
      name: "Can I cache the vulnerability database between GitLab CI runs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. GitLab CI's native cache: key mechanism can persist a scanner's local cache directory between pipeline runs on the same runner, cutting warm-up time on repeated scans. Keying the cache to the branch keeps merge request pipelines and default-branch pipelines from evicting each other's cache.",
      },
    },
  ],
};

const rolloutChecklist: { phase: string; items: string[] }[] = [
  {
    phase: "Phase 1 — Observe (before the gate has teeth)",
    items: [
      "Add the scan job with allow_failure: true so a finding never blocks anyone on day one.",
      "Open a completed job and download report.json from the job page — if you cannot retrieve the artifact, the gate has no evidence trail.",
      "Record a baseline of what the scan reports for each image you build, so you can tell an inherited base-image finding from something your change introduced.",
      "Compare job duration on a cold cache versus a warm one, and decide whether the cache: block is pulling its weight on your runners.",
    ],
  },
  {
    phase: "Phase 2 — Prepare (decisions, not YAML)",
    items: [
      "Confirm your runners actually allow privileged mode; if they do not, switch to the registry-pull variant that skips the dind service entirely.",
      "Store NVD_API_KEY as a masked and protected CI/CD variable, and check that protected-branch pipelines can still read it.",
      "Agree the severity threshold with the team that will be blocked by it, in writing, before it is enforced.",
      "Define the exception path: who approves a temporary waiver, where it is recorded, and when it expires.",
      "Decide who watches scheduled-pipeline failures — a nightly job has no merge request author to notice it went red.",
    ],
  },
  {
    phase: "Phase 3 — Enforce",
    items: [
      "Remove allow_failure: true from the scan job.",
      "Turn on Settings → Merge requests → Merge checks → Pipelines must succeed, or a red job stays advisory.",
      "Set the report artifact expiry to match the scan history your audit or incident review actually needs.",
      "Verify the scheduled pipeline is enabled and pointed at the default branch, not just the merge request trigger.",
      "Run one deliberate failure — build an image you know is vulnerable — and confirm the merge button is genuinely blocked.",
    ],
  },
  {
    phase: "Phase 4 — Maintain",
    items: [
      "Re-baseline after every base image bump; a big swing in findings is expected there and should not be read as a regression.",
      "Review open waivers on a fixed cadence and close the ones whose fix has since shipped.",
      "Move the job into a shared include: project template once a second repository needs it, so the gate is defined in one place.",
      "Re-check the pinned docker and dind image tags periodically — a pin that never moves is its own stale-dependency problem.",
    ],
  },
];

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
            How to Scan Docker Images in GitLab CI
          </h1>
          <p className="text-sm muted">Published July 17, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            GitLab CI container scanning turns a written security policy into a pipeline stage that
            actually blocks bad merges. This guide builds a complete <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.gitlab-ci.yml</code>{" "}
            pipeline that builds your image with Docker-in-Docker, scans it, and fails the merge
            request when critical vulnerabilities show up &mdash; and explains every line of it.
          </p>
        </header>

        <img
          src="/blog/scan-docker-images-gitlab-ci.jpg"
          alt="Scanning Docker images in GitLab CI"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why scan in GitLab CI specifically</h2>
          <p className="text-sm muted">
            GitLab CI has two properties that make it a good place to enforce scanning: merge
            request pipelines run before code reaches the default branch, and pipeline status is a
            first-class signal that branch protection rules can require. Put a scan job in the same
            pipeline that builds the image, and every image that reaches your registry has been
            checked &mdash; not as a separate manual step someone can skip under deadline pressure,
            but as a pipeline stage that has to pass.
          </p>
          <p className="text-sm muted">
            The approach below scans the image as a build artifact: build it with Docker-in-Docker
            inside the job, export it with <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker save</code>,
            and scan the resulting tar file. That mirrors the pattern in{" "}
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              our general image-scanning guide
            </Link>{" "}
            and in{" "}
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              the GitHub Actions version of this workflow
            </Link>
            , adapted to GitLab&apos;s dind service and job model.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The complete pipeline</h2>
          <p className="text-sm muted">
            Save this as <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.gitlab-ci.yml</code>{" "}
            at the root of your repository. It builds the image using the Docker-in-Docker service,
            scans it with ScanRook, keeps the JSON report as a pipeline artifact, and fails the job
            on critical or high findings:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`stages:
  - build
  - scan

variables:
  DOCKER_TLS_CERTDIR: "/certs"
  IMAGE_TAR: "myapp.tar"

build_image:
  stage: build
  image: docker:27
  services:
    - docker:27-dind
  script:
    - docker build -t myapp:ci .
    - docker save myapp:ci -o "$IMAGE_TAR"
  artifacts:
    paths:
      - "$IMAGE_TAR"
    expire_in: 1 hour

scan_image:
  stage: scan
  image: alpine:3.20
  needs: ["build_image"]
  cache:
    key: "scanrook-cache-$CI_COMMIT_REF_SLUG"
    paths:
      - .scanrook-cache/
  before_script:
    - apk add --no-cache curl jq bash
    - curl -fsSL https://scanrook.sh/install | sh
  script:
    - scanrook scan --file "$IMAGE_TAR" --cache-dir "$CI_PROJECT_DIR/.scanrook-cache" --mode deep --format json --out report.json
    - |
      CRITICAL=$(jq '.summary.critical // 0' report.json)
      HIGH=$(jq '.summary.high // 0' report.json)
      echo "Critical: $CRITICAL, High: $HIGH"
      if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
        jq '.findings[] | select(.severity == "CRITICAL" or .severity == "HIGH") | {cve, package: .package.name, version: .package.version, severity}' report.json
        echo "Failing pipeline: critical or high severity vulnerabilities found"
        exit 1
      fi
  variables:
    NVD_API_KEY: $NVD_API_KEY
  artifacts:
    when: always
    paths:
      - report.json
    expire_in: 30 days
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH'
    - if: '$CI_PIPELINE_SOURCE == "schedule"'`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What each part does</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Two stages, one artifact.</strong> The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">build_image</code>{" "}
              job builds and saves the image, passing the tar to <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">scan_image</code>{" "}
              through job artifacts. Splitting the stages means a failed scan does not force a
              rebuild &mdash; you can re-run just the scan job if a transient network error hits
              an advisory source.
            </li>
            <li>
              <strong>Docker-in-Docker.</strong> The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker:27-dind</code>{" "}
              service gives the build job a Docker daemon to build against. This requires the
              GitLab Runner executor to allow privileged mode &mdash; confirm with your platform
              team if you are on shared runners, since some organizations disable it by default
              for security reasons.
            </li>
            <li>
              <strong>A lighter scan image.</strong> The scan job does not need Docker at all, only
              the exported tar, so it runs in a plain <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">alpine</code>{" "}
              image without privileged mode &mdash; smaller attack surface and faster job startup.
            </li>
            <li>
              <strong>GitLab-native caching.</strong> The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">cache:</code>{" "}
              block persists the scanner&apos;s data directory between runs on the same runner,
              keyed by branch so merge request and default-branch pipelines do not thrash each
              other&apos;s cache.
            </li>
            <li>
              <strong>Rules, not only branches.</strong> The job runs on merge request pipelines,
              pushes to the default branch, and scheduled pipelines &mdash; the three triggers that,
              together, catch both newly introduced CVEs and advisories published after merge.
            </li>
            <li>
              <strong>Always-on artifacts.</strong> <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">when: always</code>{" "}
              keeps <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">report.json</code>{" "}
              downloadable from the job page even when the gate step fails, which is exactly when
              you want to open it.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Failing merge requests on severity</h2>
          <p className="text-sm muted">
            A gate that fails every merge request on day one gets a bypass rule added within a
            week; a gate with no bite is theater. Three changes make this workable in practice:
          </p>
          <p className="text-sm muted">
            <strong>Start critical-only.</strong> Drop the <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">$HIGH</code>{" "}
            condition from the <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">if</code>{" "}
            check and let high-severity findings show up in the job log without blocking. Inherited
            base-image findings can number in the hundreds &mdash; see{" "}
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              how to reduce CVEs in Docker images
            </Link>{" "}
            for bringing that number down before tightening the gate to include highs.
          </p>
          <p className="text-sm muted">
            <strong>Make it a required pipeline.</strong> In GitLab, add the scan job to your
            branch&apos;s merge checks (Settings &rarr; Merge requests &rarr; Merge checks &rarr;
            Pipelines must succeed). Without that setting, a failing job is visible but does not
            block the merge button.
          </p>
          <p className="text-sm muted">
            <strong>Gate on new findings on merge requests, keep audit scope on schedule.</strong>{" "}
            Store the report artifact from the last default-branch pipeline and diff merge request
            scans against it, failing only on newly introduced CVEs. Run the full, ungated scan on
            the scheduled pipeline so nothing silently ages out of view.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Rollout checklist: from first scan to enforced gate</h2>
          <p className="text-sm muted">
            The pipeline above is the easy half. Turning it into a gate people trust is a sequence,
            not a switch &mdash; work through these in order and the enforcement day is uneventful:
          </p>
          <figure className="grid gap-3">
            <div className="grid gap-5 rounded-xl border border-black/10 dark:border-white/10 bg-black/[.02] dark:bg-white/[.02] p-5">
              {rolloutChecklist.map((group) => (
                <div key={group.phase} className="grid gap-2">
                  <h3 className="text-sm font-semibold">{group.phase}</h3>
                  <ul className="grid gap-2 list-none pl-0 m-0">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm muted">
                        <svg
                          viewBox="0 0 16 16"
                          width="14"
                          height="14"
                          aria-hidden="true"
                          className="mt-1 shrink-0"
                        >
                          <rect
                            x="1.5"
                            y="1.5"
                            width="13"
                            height="13"
                            rx="3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            opacity="0.45"
                          />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <figcaption className="text-xs muted">
              Phased rollout checklist for the GitLab CI scan job described above. Operational
              guidance, not scan data &mdash; no finding counts or timings are implied.
            </figcaption>
          </figure>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scanning an image that already exists in the registry</h2>
          <p className="text-sm muted">
            Not every scan needs a fresh build. To check a base image you are evaluating or the tag
            currently deployed to production, pull and save it without the dind service at all:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`scan_deployed_image:
  stage: scan
  image: docker:27
  script:
    - docker pull "$CI_REGISTRY_IMAGE:prod"
    - docker save "$CI_REGISTRY_IMAGE:prod" -o deployed.tar
    - curl -fsSL https://scanrook.sh/install | sh
    - scanrook scan --file deployed.tar --format json --out deployed.json
  artifacts:
    paths:
      - deployed.json
  rules:
    - if: '$CI_PIPELINE_SOURCE == "schedule"'`}</pre>
          <p className="text-sm muted">
            Running this alongside the build-time scan on the nightly schedule gives you two
            reports: what the next merge would ship versus what is actually running. A widening gap
            between them is a signal to redeploy even if nothing in the repository has changed.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Operational notes</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              Store <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">NVD_API_KEY</code>{" "}
              as a masked, protected CI/CD variable in project settings, never inline in the YAML.
            </li>
            <li>
              Pin the <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker:27</code>{" "}
              and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker:27-dind</code>{" "}
              image tags to a specific patch version for reproducible builds across runners.
            </li>
            <li>
              For a multi-project group building several images, define the scan job once in an
              included template (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">include: project</code>)
              so every repository inherits the same gate without copy-pasting YAML.
            </li>
            <li>
              Keep report artifacts from default-branch pipelines beyond the default expiry if your
              compliance program needs a scan history &mdash; GitLab&apos;s artifact retention can
              be extended per job.
            </li>
          </ul>
          <p className="text-sm muted">
            Full configuration reference, including a variant that diffs SBOMs between pipeline
            runs, is in{" "}
            <Link href="/docs" className="underline">the ScanRook docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">How do I scan a Docker image in GitLab CI?</h3>
              <p className="text-sm muted mt-1">
                Build with Docker-in-Docker, export with{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker save</code>,
                install the scanner CLI, and scan the tar. A jq step reads the report and fails the
                job past your severity threshold.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should scans run on merge requests or only on main?</h3>
              <p className="text-sm muted mt-1">
                Both. Merge request pipelines catch what you are introducing; a scheduled pipeline
                on the default branch catches advisories published after merge.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I fail the pipeline on critical CVEs?</h3>
              <p className="text-sm muted mt-1">
                Read severity counts from the JSON report with jq and exit non-zero past your
                threshold, then require the job to pass in your merge checks.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Do I need privileged mode for this?</h3>
              <p className="text-sm muted mt-1">
                Only for the build job using Docker-in-Docker. Scanning an image already in a
                registry needs no privileged access at all.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Gate your GitLab pipeline with ScanRook</h3>
          <p className="text-sm muted leading-relaxed">
            Drop the pipeline above into your project and every image you build is checked against
            OSV, NVD, and vendor advisory data before it merges &mdash; with JSON reports you can
            gate on, archive, and diff between pipeline runs.
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
            <Link href="/blog/container-security-checklist" className="underline">
              Container Image Security Checklist
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
