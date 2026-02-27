import type { Metadata } from "next";
import CodeCopyBlock from "@/components/CodeCopyBlock";

export const metadata: Metadata = {
  title: "GitHub Actions Integration",
  description:
    "Integrate ScanRook into your GitHub Actions CI pipeline. Install the CLI, scan artifacts, upload reports, and gate deployments on critical CVEs.",
};

const fullWorkflow = `name: ScanRook Vulnerability Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  security-events: write

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install ScanRook
        run: curl -fsSL https://scanrook.sh/install | bash

      - name: Build container image
        run: |
          docker build -t myapp:ci .
          docker save myapp:ci -o myapp.tar

      - name: Pre-warm vulnerability cache
        run: scanrook db update --source all
        env:
          NVD_API_KEY: \${{ secrets.NVD_API_KEY }}

      - name: Scan container image
        run: |
          scanrook scan \\
            --file ./myapp.tar \\
            --mode deep \\
            --format json \\
            --out report.json
        env:
          NVD_API_KEY: \${{ secrets.NVD_API_KEY }}

      - name: Upload scan report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: scanrook-report
          path: report.json

      - name: Fail on critical or high CVEs
        run: |
          CRITICAL=\$(jq '.summary.critical // 0' report.json)
          HIGH=\$(jq '.summary.high // 0' report.json)
          echo "Critical: \$CRITICAL, High: \$HIGH"
          if [ "\$CRITICAL" -gt 0 ] || [ "\$HIGH" -gt 0 ]; then
            echo "::error::Found \$CRITICAL critical and \$HIGH high severity vulnerabilities"
            jq '.findings[] | select(.severity == "CRITICAL" or .severity == "HIGH") | {cve, package: .package.name, version: .package.version, severity, confidence}' report.json
            exit 1
          fi`;

const sbomWorkflow = `name: SBOM Diff Gate

on:
  pull_request:
    branches: [main]

jobs:
  sbom-diff:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install ScanRook
        run: curl -fsSL https://scanrook.sh/install | bash

      - name: Build and save image
        run: |
          docker build -t myapp:pr .
          docker save myapp:pr -o myapp.tar

      - name: Generate current SBOM
        run: |
          scanrook container --tar ./myapp.tar --sbom --format json --out current-report.json

      - name: Download baseline SBOM
        uses: actions/download-artifact@v4
        with:
          name: baseline-sbom
          path: .
        continue-on-error: true

      - name: Diff SBOMs
        if: hashFiles('baseline-sbom.json') != ''
        run: |
          scanrook sbom diff \\
            --baseline ./baseline-sbom.json \\
            --current ./current-report.json \\
            --json --out diff.json

      - name: Check policy
        if: hashFiles('diff.json') != ''
        run: |
          scanrook sbom policy \\
            --policy ./scanrook-policy.yaml \\
            --diff ./diff.json \\
            --report ./current-report.json`;

export default function GitHubActionsPage() {
  return (
    <article className="grid gap-6">
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">GitHub Actions</h1>
        <p className="muted text-sm max-w-3xl">
          Integrate ScanRook into your GitHub Actions CI pipeline to scan container
          images on every push or pull request. Gate deployments on critical CVEs
          and upload reports as build artifacts.
        </p>
      </section>

      {/* Full workflow */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Complete workflow"
          blurb="Copy this workflow to .github/workflows/scanrook.yml in your repository."
        />
        <CodeCopyBlock label=".github/workflows/scanrook.yml" code={fullWorkflow} />
      </section>

      {/* Step breakdown */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Step breakdown"
          blurb="What each step does and how to customize it."
        />
        <div className="grid gap-3 text-sm muted">
          <div className="grid gap-1">
            <h3 className="font-semibold" style={{ color: "var(--dg-text)" }}>Install ScanRook</h3>
            <p>
              The shell installer auto-detects the platform and downloads the latest
              release binary. The binary is placed in <code>/usr/local/bin</code> and
              is immediately available for subsequent steps.
            </p>
          </div>
          <div className="grid gap-1">
            <h3 className="font-semibold" style={{ color: "var(--dg-text)" }}>Build and save image</h3>
            <p>
              ScanRook scans saved Docker images (tar files), not running containers.
              Use <code>docker save</code> to export the image after building.
            </p>
          </div>
          <div className="grid gap-1">
            <h3 className="font-semibold" style={{ color: "var(--dg-text)" }}>Pre-warm cache</h3>
            <p>
              Optional but recommended. Pre-warming the vulnerability cache before
              scanning reduces API calls and speeds up the scan. Set{" "}
              <code>NVD_API_KEY</code> as a repository secret for higher NVD rate
              limits.
            </p>
          </div>
          <div className="grid gap-1">
            <h3 className="font-semibold" style={{ color: "var(--dg-text)" }}>Scan and report</h3>
            <p>
              The scan produces a JSON report. The workflow uploads it as a build
              artifact so it is available for download on every run.
            </p>
          </div>
          <div className="grid gap-1">
            <h3 className="font-semibold" style={{ color: "var(--dg-text)" }}>Fail on critical/high CVEs</h3>
            <p>
              The final step reads the summary from the JSON report and fails the
              workflow if any critical or high severity findings are present. Adjust
              the threshold by changing the <code>jq</code> filter.
            </p>
          </div>
        </div>
      </section>

      {/* SBOM diff workflow */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="SBOM diff gate"
          blurb="Optional: compare SBOMs across PRs and enforce a policy on package changes."
        />
        <CodeCopyBlock label="SBOM diff workflow" code={sbomWorkflow} />
        <p className="text-sm muted">
          This workflow compares the current SBOM against a baseline stored as a
          build artifact from the last main branch build. The{" "}
          <code>scanrook sbom policy</code> step exits with code 1 if the policy
          file is violated, failing the PR check.
        </p>
      </section>

      {/* Tips */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader title="Tips" blurb="Best practices for CI integration." />
        <ul className="text-sm muted list-disc ml-5 grid gap-2">
          <li>
            Store <code>NVD_API_KEY</code> as a repository or organization secret,
            not in the workflow file.
          </li>
          <li>
            Use <code>--mode deep</code> for the most thorough scan. Use{" "}
            <code>--mode light</code> for faster feedback on PRs.
          </li>
          <li>
            Cache the <code>~/.scanrook/cache/</code> directory between runs using{" "}
            <code>actions/cache</code> to speed up repeated scans.
          </li>
          <li>
            Filter findings by confidence tier in your gate step: only fail on{" "}
            <code>ConfirmedInstalled</code> findings to avoid blocking on
            heuristic-only matches.
          </li>
          <li>
            Use <code>if: always()</code> on the upload step so reports are saved
            even when the scan or gate step fails.
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
