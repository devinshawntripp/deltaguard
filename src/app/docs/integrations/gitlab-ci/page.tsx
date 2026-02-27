import type { Metadata } from "next";
import CodeCopyBlock from "@/components/CodeCopyBlock";

export const metadata: Metadata = {
  title: "GitLab CI Integration",
  description:
    "Integrate ScanRook into your GitLab CI pipeline. Scan container images, produce vulnerability reports, and gate merge requests on severity thresholds.",
};

const gitlabCiYml = `stages:
  - build
  - scan

variables:
  SCANROOK_VERSION: "latest"

build-image:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker save $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA -o image.tar
  artifacts:
    paths:
      - image.tar
    expire_in: 1 hour

scanrook-scan:
  stage: scan
  image: ubuntu:24.04
  dependencies:
    - build-image
  before_script:
    - apt-get update && apt-get install -y curl jq
    - curl -fsSL https://scanrook.sh/install | bash
  script:
    - |
      scanrook scan \\
        --file ./image.tar \\
        --mode deep \\
        --format json \\
        --out report.json
    - |
      echo "=== Scan Summary ==="
      jq '.summary' report.json
    - |
      CRITICAL=$(jq '.summary.critical // 0' report.json)
      HIGH=$(jq '.summary.high // 0' report.json)
      echo "Critical: $CRITICAL, High: $HIGH"
      if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
        echo "ERROR: Found $CRITICAL critical and $HIGH high severity vulnerabilities"
        jq '.findings[] | select(.severity == "CRITICAL" or .severity == "HIGH") | {cve, package: .package.name, version: .package.version, severity, confidence}' report.json
        exit 1
      fi
  artifacts:
    paths:
      - report.json
    reports:
      dotenv: scanrook.env
    when: always
    expire_in: 30 days
  variables:
    NVD_API_KEY: $NVD_API_KEY`;

const mergeRequestOnly = `scanrook-scan:
  stage: scan
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
  # ... rest of job config`;

const cacheConfig = `scanrook-scan:
  cache:
    key: scanrook-cache
    paths:
      - .scanrook-cache/
  variables:
    SCANNER_CACHE: "$CI_PROJECT_DIR/.scanrook-cache"
  # ... rest of job config`;

export default function GitLabCiPage() {
  return (
    <article className="grid gap-6">
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">GitLab CI</h1>
        <p className="muted text-sm max-w-3xl">
          Integrate ScanRook into your GitLab CI/CD pipeline. Scan container images
          on every push, produce structured vulnerability reports, and gate merge
          requests on severity thresholds.
        </p>
      </section>

      {/* Full pipeline */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Complete pipeline"
          blurb="Copy this to .gitlab-ci.yml in the root of your repository."
        />
        <CodeCopyBlock label=".gitlab-ci.yml" code={gitlabCiYml} />
      </section>

      {/* Stage breakdown */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Stage breakdown"
          blurb="What each stage and job does."
        />
        <div className="grid gap-3 text-sm muted">
          <div className="grid gap-1">
            <h3 className="font-semibold" style={{ color: "var(--dg-text)" }}>build-image</h3>
            <p>
              Builds the Docker image and saves it as a tar file artifact. The{" "}
              <code>docker:dind</code> service provides Docker-in-Docker for the
              build. The tar is passed to the scan stage via GitLab artifacts.
            </p>
          </div>
          <div className="grid gap-1">
            <h3 className="font-semibold" style={{ color: "var(--dg-text)" }}>scanrook-scan</h3>
            <p>
              Installs ScanRook via the shell installer, scans the saved image tar,
              prints the summary, and exits with code 1 if critical or high
              vulnerabilities are found. The JSON report is saved as an artifact
              with a 30-day retention.
            </p>
          </div>
        </div>
      </section>

      {/* MR only */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Run only on merge requests"
          blurb="Limit scans to merge request pipelines to save CI minutes."
        />
        <CodeCopyBlock label="MR-only rule" code={mergeRequestOnly} />
      </section>

      {/* Cache config */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Caching between runs"
          blurb="Speed up scans by caching vulnerability API responses across pipeline runs."
        />
        <CodeCopyBlock label="Cache configuration" code={cacheConfig} />
        <p className="text-sm muted">
          Set <code>SCANNER_CACHE</code> to a path inside{" "}
          <code>$CI_PROJECT_DIR</code> so GitLab can cache it between runs. The{" "}
          <code>scanrook-cache</code> key ensures the cache is shared across all
          branches.
        </p>
      </section>

      {/* Tips */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader title="Tips" blurb="Best practices for GitLab CI integration." />
        <ul className="text-sm muted list-disc ml-5 grid gap-2">
          <li>
            Store <code>NVD_API_KEY</code> as a CI/CD variable (Settings &gt; CI/CD
            &gt; Variables). Mark it as masked and protected.
          </li>
          <li>
            Use <code>when: always</code> on the artifacts block so the report is
            saved even when the scan fails.
          </li>
          <li>
            For large images, increase the artifact expiration on the build stage
            or use GitLab's container registry to avoid re-building.
          </li>
          <li>
            Filter findings by confidence in the gate script to avoid failing on
            heuristic-only matches. Add{" "}
            <code>select(.confidence == &quot;ConfirmedInstalled&quot;)</code> to
            the <code>jq</code> filter.
          </li>
          <li>
            Consider running <code>scanrook db update</code> before the scan to
            pre-warm the cache, especially in cold environments without a persistent
            cache.
          </li>
        </ul>
      </section>
    </article>
  );
}

function SectionHeader({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="grid gap-1">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm muted">{blurb}</p>
    </div>
  );
}
