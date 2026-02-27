import type { Metadata } from "next";
import CodeCopyBlock from "@/components/CodeCopyBlock";

export const metadata: Metadata = {
  title: "Quickstart",
  description:
    "Install ScanRook, run your first vulnerability scan, configure caching, and review example output.",
};

export default function QuickstartPage() {
  return (
    <article className="grid gap-6">
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Quickstart</h1>
        <p className="muted text-sm max-w-3xl">
          Get ScanRook installed and running in under two minutes. This guide
          covers the three installation methods, your first scan, cache setup, and
          how to read the output.
        </p>
      </section>

      {/* Install */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Installation"
          blurb="Choose the method that fits your environment."
        />

        <div className="grid gap-4">
          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">Shell installer (recommended)</h3>
            <p className="text-xs muted">
              Downloads the latest release binary for your platform and places it in
              your PATH.
            </p>
            <CodeCopyBlock
              label="Install via shell"
              code="curl -fsSL https://scanrook.sh/install | bash"
            />
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">Cargo</h3>
            <p className="text-xs muted">
              Build from source using Rust's package manager. Requires a working
              Rust toolchain (1.75+).
            </p>
            <CodeCopyBlock
              label="Install via Cargo"
              code="cargo install scanrook"
            />
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">Docker</h3>
            <p className="text-xs muted">
              Run ScanRook as a container without installing anything on the host.
            </p>
            <CodeCopyBlock
              label="Docker run"
              code={`docker run --rm -v "$(pwd)":/work ghcr.io/devinshawntripp/scanrook:latest \\
  scan --file /work/artifact.tar --format json --out /work/report.json`}
            />
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-semibold">GitHub Actions</h3>
            <p className="text-xs muted">
              Add ScanRook to your CI pipeline. See the full{" "}
              <a href="/docs/integrations/github-actions" className="underline" style={{ color: "var(--dg-accent-ink)" }}>
                GitHub Actions integration guide
              </a>{" "}
              for a complete workflow example.
            </p>
            <CodeCopyBlock
              label="GitHub Actions step"
              code={`- name: Install ScanRook
  run: curl -fsSL https://scanrook.sh/install | bash`}
            />
          </div>
        </div>
      </section>

      {/* First scan */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Your first scan"
          blurb="ScanRook auto-detects the file type: container tar, source archive, ISO, or binary."
        />

        <div className="grid gap-4">
          <CodeCopyBlock
            label="Scan a container image"
            code={`# Save a Docker image to a tar file
docker save myapp:latest -o myapp.tar

# Scan it
scanrook scan --file ./myapp.tar --format json --out report.json`}
          />
          <CodeCopyBlock
            label="Scan with deep mode (enables YARA rules)"
            code="scanrook scan --file ./myapp.tar --mode deep --format json --out report.json"
          />
          <CodeCopyBlock
            label="Scan a binary"
            code="scanrook bin --path ./myapp --format json --out report.json"
          />
          <CodeCopyBlock
            label="Import and scan an SBOM"
            code="scanrook sbom import --file ./sbom.cdx.json --format json --out sbom-report.json"
          />
        </div>
      </section>

      {/* Cache setup */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Cache setup"
          blurb="ScanRook caches vulnerability API responses locally to speed up repeated scans."
        />

        <div className="grid gap-3">
          <p className="text-sm muted">
            By default, responses are cached under <code>~/.scanrook/cache/</code>.
            You can override this with <code>SCANNER_CACHE</code> or{" "}
            <code>--cache-dir</code>. Set <code>SCANNER_SKIP_CACHE=1</code> to
            disable caching entirely.
          </p>

          <CodeCopyBlock
            label="Check cache status"
            code="scanrook db check"
          />
          <CodeCopyBlock
            label="Pre-warm cache for an artifact"
            code="scanrook db update --source all --file ./myapp.tar"
          />
          <CodeCopyBlock
            label="Clear the local cache"
            code="scanrook db clear"
          />
        </div>

        <div className="grid gap-2">
          <h3 className="text-sm font-semibold">Caching layers</h3>
          <p className="text-sm muted">ScanRook checks three caching layers in order:</p>
          <ol className="text-sm muted list-decimal ml-5 grid gap-1">
            <li>
              <strong>File cache</strong> (<code>~/.scanrook/cache/</code>) -- default, disable with{" "}
              <code>SCANNER_SKIP_CACHE=1</code>
            </li>
            <li>
              <strong>PostgreSQL</strong> -- persistent CVE data via{" "}
              <code>DATABASE_URL</code> env variable; schema auto-initialized
            </li>
            <li>
              <strong>Redis</strong> -- fast distributed cache for multi-worker
              deployments
            </li>
          </ol>
        </div>
      </section>

      {/* Example output */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Example output"
          blurb="ScanRook produces structured JSON reports with findings, evidence, and a summary."
        />

        <CodeCopyBlock
          label="Report structure (abbreviated)"
          code={`{
  "scanner": {
    "name": "scanrook",
    "version": "0.4.2"
  },
  "target": {
    "file": "./myapp.tar",
    "type": "container",
    "sha256": "a1b2c3..."
  },
  "findings": [
    {
      "cve": "CVE-2024-12345",
      "package": { "ecosystem": "npm", "name": "lodash", "version": "4.17.20" },
      "severity": "HIGH",
      "cvss": 7.5,
      "confidence": "ConfirmedInstalled",
      "evidence": [{ "source": "InstalledDb", "path": "/usr/lib/node_modules/..." }],
      "fixed_in": "4.17.21"
    }
  ],
  "summary": {
    "total_findings": 12,
    "critical": 1,
    "high": 3,
    "medium": 5,
    "low": 3,
    "packages_scanned": 142
  }
}`}
        />

        <p className="text-sm muted">
          See the{" "}
          <a href="/docs/concepts/confidence-tiers" className="underline" style={{ color: "var(--dg-accent-ink)" }}>
            Confidence Tiers
          </a>{" "}
          page to understand what <code>ConfirmedInstalled</code> vs{" "}
          <code>HeuristicUnverified</code> means for your triage workflow.
        </p>
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
