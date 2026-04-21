import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";

const title = `Container Image Security Checklist: 15 Steps for Production-Ready Images | ${APP_NAME}`;
const description =
  "A comprehensive 15-step security checklist for hardening container images before production deployment, covering base images, scanning, secrets, runtime security, and monitoring.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "container security checklist",
    "Docker security",
    "container hardening",
    "production containers",
    "image security",
    "container best practices",
    "Dockerfile security",
    "container scanning",
    "SBOM",
    "ScanRook",
  ],
  alternates: {
    canonical: "/blog/container-security-checklist",
  },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/container-security-checklist",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline:
    "Container Image Security Checklist: 15 Steps for Production-Ready Images",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage:
    "https://scanrook.io/blog/container-security-checklist",
  datePublished: "2026-04-21",
  dateModified: "2026-04-21",
};

export default function ContainerSecurityChecklistPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 grid gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="surface-card p-8 grid gap-6">
        <header className="grid gap-3">
          <div className="text-xs uppercase tracking-wide muted">
            Best practices
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Container Image Security Checklist: 15 Steps for Production-Ready
            Images
          </h1>
          <p className="text-sm muted">
            Published April 21, 2026
          </p>
        </header>

        {/* Introduction */}
        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Why Container Security Matters
          </h2>
          <p className="text-sm muted">
            Container images are the dominant deployment artifact in modern
            infrastructure. Every Kubernetes pod, ECS task, and Cloud Run
            service starts from an image. A single vulnerable or misconfigured
            image can compromise an entire cluster — and unlike VMs, containers
            often share kernel resources with other workloads on the same host.
          </p>
          <p className="text-sm muted">
            This checklist provides 15 actionable steps to secure container
            images before they reach production. Each item includes the what
            (what to do), the why (why it matters), and the how (example
            commands and configurations). Bookmark this page and use it as a
            gate before deploying any new image.
          </p>
        </section>

        {/* Checklist items */}
        <section className="grid gap-5">
          <h2 className="text-xl font-semibold tracking-tight">
            The Checklist
          </h2>

          {/* Item 1 */}
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 text-xs font-bold">1</span>
              <h3 className="text-sm font-semibold">Use Minimal Base Images</h3>
            </div>
            <p className="text-sm muted">
              Start from Alpine, distroless, or scratch images instead of
              full-featured distributions like Ubuntu or Debian. A minimal
              base image contains fewer packages, which means fewer potential
              vulnerabilities and a smaller attack surface.
            </p>
            <p className="text-sm muted">
              <strong>Why it matters:</strong> A standard Ubuntu 22.04 image
              contains 100+ packages. Alpine 3.19 contains approximately 15.
              Each additional package is a liability — it can contain
              vulnerabilities, increase image size, and provide tools an
              attacker could leverage post-exploitation.
            </p>
            <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
              <code>{`# Instead of:
FROM ubuntu:22.04

# Use:
FROM alpine:3.19
# Or for Go/Rust binaries:
FROM gcr.io/distroless/static-debian12`}</code>
            </pre>
          </div>

          {/* Item 2 */}
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 text-xs font-bold">2</span>
              <h3 className="text-sm font-semibold">Pin Image Versions</h3>
            </div>
            <p className="text-sm muted">
              Never use <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">:latest</code> tags in production Dockerfiles or Kubernetes manifests. Pin to a specific digest or version tag to ensure reproducible builds and prevent unexpected changes from upstream.
            </p>
            <p className="text-sm muted">
              <strong>Why it matters:</strong> The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">:latest</code> tag is mutable — it points to whatever the maintainer last pushed. A build that worked yesterday might pull a different image today, potentially introducing new vulnerabilities or breaking changes without any code change on your side.
            </p>
            <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
              <code>{`# Bad: mutable tag
FROM node:latest

# Better: version tag
FROM node:20.12-alpine

# Best: SHA256 digest
FROM node@sha256:a1b2c3d4e5f6...`}</code>
            </pre>
          </div>

          {/* Item 3 */}
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 text-xs font-bold">3</span>
              <h3 className="text-sm font-semibold">Scan for Vulnerabilities Before Deploy</h3>
            </div>
            <p className="text-sm muted">
              Integrate vulnerability scanning into your CI/CD pipeline. Every
              image should be scanned after build and before push to the
              registry. Block deployments that contain critical or high
              severity findings without an accepted risk exception.
            </p>
            <p className="text-sm muted">
              <strong>Why it matters:</strong> Vulnerabilities caught before
              deployment are orders of magnitude cheaper to fix than those
              discovered in production. A CI gate prevents known-vulnerable
              images from ever reaching running environments.
            </p>
            <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
              <code>{`# Scan with ScanRook before pushing
scanrook scan container ./my-app.tar --format json --out report.json

# In CI, fail the build on critical findings
scanrook scan container ./my-app.tar --fail-on critical`}</code>
            </pre>
            <p className="text-sm muted">
              <Link href="/dashboard" className="underline">ScanRook</Link> provides both CLI scanning for CI pipelines and a web dashboard for centralized visibility.
            </p>
          </div>

          {/* Item 4 */}
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 text-xs font-bold">4</span>
              <h3 className="text-sm font-semibold">Run as Non-Root User</h3>
            </div>
            <p className="text-sm muted">
              Always specify a non-root <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">USER</code> in your Dockerfile. Running as root inside a container gives an attacker immediate privilege escalation if they achieve code execution.
            </p>
            <p className="text-sm muted">
              <strong>Why it matters:</strong> Container escape vulnerabilities
              are significantly more dangerous when the container process runs
              as UID 0. A non-root user limits the blast radius of both
              application vulnerabilities and container runtime exploits.
            </p>
            <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
              <code>{`FROM node:20-alpine
WORKDIR /app
COPY --chown=node:node . .
USER node
CMD ["node", "server.js"]`}</code>
            </pre>
          </div>

          {/* Item 5 */}
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 text-xs font-bold">5</span>
              <h3 className="text-sm font-semibold">Use Read-Only Root Filesystem</h3>
            </div>
            <p className="text-sm muted">
              Configure containers to use a read-only root filesystem at
              runtime. This prevents attackers from writing malicious files,
              modifying binaries, or installing additional tools after
              gaining access.
            </p>
            <p className="text-sm muted">
              <strong>Why it matters:</strong> Many attack chains require
              writing files to disk — downloading additional payloads,
              creating reverse shells, or modifying configuration. A read-only
              filesystem blocks these post-exploitation techniques.
            </p>
            <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
              <code>{`# Kubernetes pod spec
securityContext:
  readOnlyRootFilesystem: true

# Docker run
docker run --read-only --tmpfs /tmp my-app:v1.0

# Use tmpfs mounts for directories that need writes (e.g., /tmp, /var/run)`}</code>
            </pre>
          </div>

          {/* Item 6 */}
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 text-xs font-bold">6</span>
              <h3 className="text-sm font-semibold">Set Resource Limits</h3>
            </div>
            <p className="text-sm muted">
              Always define CPU and memory limits for every container. Without
              limits, a single compromised or misbehaving container can
              consume all host resources, causing denial of service for other
              workloads.
            </p>
            <p className="text-sm muted">
              <strong>Why it matters:</strong> Resource exhaustion is a common
              attack vector. Cryptominers, fork bombs, and memory-hungry
              exploits can starve co-located containers. Limits ensure one
              container cannot monopolize host resources.
            </p>
            <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
              <code>{`# Kubernetes
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"

# Docker
docker run --memory=512m --cpus=0.5 my-app:v1.0`}</code>
            </pre>
          </div>

          {/* Item 7 */}
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 text-xs font-bold">7</span>
              <h3 className="text-sm font-semibold">Never Store Secrets in Images</h3>
            </div>
            <p className="text-sm muted">
              Never bake API keys, passwords, certificates, or tokens into
              container images. Image layers are persistent and pushable —
              anyone who pulls your image can extract every layer and find
              embedded secrets, even if you deleted the file in a later layer.
            </p>
            <p className="text-sm muted">
              <strong>Why it matters:</strong> Docker image layers are
              immutable. A secret added in layer 3 and removed in layer 4
              still exists in layer 3. Registry access, image sharing, and
              backup systems all expose these embedded credentials.
            </p>
            <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
              <code>{`# WRONG: Secret baked into image
COPY .env /app/.env

# RIGHT: Mount secrets at runtime
# Kubernetes: use Secrets mounted as volumes or env vars
# Docker: use --secret flag in BuildKit
docker build --secret id=db_password,src=./secret.txt .

# In Dockerfile (BuildKit):
RUN --mount=type=secret,id=db_password cat /run/secrets/db_password`}</code>
            </pre>
          </div>

          {/* Item 8 */}
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 text-xs font-bold">8</span>
              <h3 className="text-sm font-semibold">Use Multi-Stage Builds</h3>
            </div>
            <p className="text-sm muted">
              Separate build dependencies from runtime dependencies using
              multi-stage Docker builds. Compilers, build tools, development
              headers, and test frameworks should never appear in production
              images.
            </p>
            <p className="text-sm muted">
              <strong>Why it matters:</strong> Build tools expand the attack
              surface dramatically. A Go compiler or gcc in a production image
              gives attackers the ability to compile exploit code on the
              compromised host. Multi-stage builds ensure only the minimum
              runtime dependencies are present.
            </p>
            <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
              <code>{`# Build stage: all tools available
FROM rust:1.77 AS builder
WORKDIR /app
COPY . .
RUN cargo build --release

# Runtime stage: minimal image
FROM gcr.io/distroless/cc-debian12
COPY --from=builder /app/target/release/myapp /usr/local/bin/
CMD ["myapp"]`}</code>
            </pre>
          </div>

          {/* Item 9 */}
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 text-xs font-bold">9</span>
              <h3 className="text-sm font-semibold">Sign and Verify Images</h3>
            </div>
            <p className="text-sm muted">
              Use container image signing (Cosign, Notary, or Docker Content
              Trust) to cryptographically verify that images have not been
              tampered with between build and deployment. Configure your
              runtime to reject unsigned images.
            </p>
            <p className="text-sm muted">
              <strong>Why it matters:</strong> Without signatures, there is no
              guarantee that the image running in production is the same one
              that passed your CI/CD security checks. Supply chain attacks can
              replace images in registries or intercept pulls.
            </p>
            <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
              <code>{`# Sign with Cosign (keyless, using OIDC identity)
cosign sign --yes ghcr.io/myorg/myapp:v1.0

# Verify before deploy
cosign verify ghcr.io/myorg/myapp:v1.0 \\
  --certificate-identity=ci@myorg.com \\
  --certificate-oidc-issuer=https://token.actions.githubusercontent.com

# Kubernetes admission control (Kyverno policy)
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: verify-images
spec:
  rules:
  - match:
      resources:
        kinds: ["Pod"]
    verifyImages:
    - imageReferences: ["ghcr.io/myorg/*"]
      attestors:
      - entries:
        - keyless:
            subject: "ci@myorg.com"`}</code>
            </pre>
          </div>

          {/* Item 10 */}
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 text-xs font-bold">10</span>
              <h3 className="text-sm font-semibold">Enable SBOM Generation</h3>
            </div>
            <p className="text-sm muted">
              Generate a Software Bill of Materials (SBOM) for every image you
              build. An SBOM provides a complete inventory of all packages,
              libraries, and dependencies inside the image — essential for
              incident response when new CVEs are disclosed.
            </p>
            <p className="text-sm muted">
              <strong>Why it matters:</strong> When a critical CVE drops (like
              Log4Shell), you need to immediately answer: &quot;Which of our
              images contain this package?&quot; Without SBOMs, you must
              re-scan every image. With SBOMs, you can query your inventory
              in seconds. See our guide on{" "}
              <Link href="/blog/how-to-read-sbom" className="underline">
                how to read an SBOM
              </Link>.
            </p>
            <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
              <code>{`# Generate SBOM with ScanRook
scanrook scan container ./my-app.tar --format json --out report.json
# The report includes full package inventory (SBOM)

# Generate with Syft
syft my-app:v1.0 -o cyclonedx-json > sbom.json

# Attach SBOM to image (Cosign)
cosign attach sbom --sbom sbom.json ghcr.io/myorg/myapp:v1.0`}</code>
            </pre>
          </div>

          {/* Item 11 */}
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 text-xs font-bold">11</span>
              <h3 className="text-sm font-semibold">Scan for License Compliance</h3>
            </div>
            <p className="text-sm muted">
              Check that all packages in your images comply with your
              organization&apos;s license policy. Copyleft licenses (GPL, AGPL)
              in commercial products can create legal obligations. Scan for
              license issues alongside vulnerabilities.
            </p>
            <p className="text-sm muted">
              <strong>Why it matters:</strong> License violations can result in
              forced open-sourcing of proprietary code, financial penalties,
              or injunctions. Catching a problematic license dependency before
              shipping is far less costly than discovering it after a
              compliance audit. See our{" "}
              <Link href="/blog/open-source-license-compliance-guide" className="underline">
                license compliance guide
              </Link>.
            </p>
            <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
              <code>{`# ScanRook includes license detection in scan results
scanrook license ./my-app.tar --format json

# Review license findings in the ScanRook dashboard
# Filter by license family: GPL, AGPL, SSPL, etc.`}</code>
            </pre>
          </div>

          {/* Item 12 */}
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 text-xs font-bold">12</span>
              <h3 className="text-sm font-semibold">Use Network Policies</h3>
            </div>
            <p className="text-sm muted">
              Define Kubernetes NetworkPolicies (or equivalent) to restrict
              which containers can communicate with each other. By default,
              all pods in a Kubernetes cluster can talk to all other pods —
              this flat network is a lateral movement paradise for attackers.
            </p>
            <p className="text-sm muted">
              <strong>Why it matters:</strong> If an attacker compromises one
              container, network policies limit what they can reach. A web
              frontend should not be able to connect directly to a database.
              Network segmentation is defense in depth for container
              environments.
            </p>
            <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
              <code>{`apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-only-from-frontend
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - port: 8080`}</code>
            </pre>
          </div>

          {/* Item 13 */}
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 text-xs font-bold">13</span>
              <h3 className="text-sm font-semibold">Set Up Scheduled Re-Scans</h3>
            </div>
            <p className="text-sm muted">
              Images that were clean at build time can become vulnerable as new
              CVEs are disclosed. Schedule periodic re-scans of all images
              running in production to detect newly published vulnerabilities
              affecting existing deployments.
            </p>
            <p className="text-sm muted">
              <strong>Why it matters:</strong> The average time between a CVE
              being published and an exploit being available is shrinking. An
              image built and scanned a month ago might now contain a critical
              vulnerability that did not exist at build time. Continuous
              scanning closes this detection gap.
            </p>
            <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
              <code>{`# ScanRook registry integration: automatic scheduled scans
# Configure in Dashboard > Settings > Registries
# Supports: Docker Hub, GHCR, ECR, GCR, private registries

# Or schedule via cron:
0 6 * * * scanrook scan container registry.example.com/myapp:prod`}</code>
            </pre>
          </div>

          {/* Item 14 */}
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 text-xs font-bold">14</span>
              <h3 className="text-sm font-semibold">Monitor for New CVEs in Running Containers</h3>
            </div>
            <p className="text-sm muted">
              Beyond scheduled scans, set up alerting when new CVEs are
              published that affect packages already deployed in your
              environment. This proactive approach means you learn about new
              risks within hours, not days.
            </p>
            <p className="text-sm muted">
              <strong>Why it matters:</strong> Zero-day and critical CVE
              disclosures do not follow your release schedule. When a new
              critical vulnerability is published, you need to know immediately
              if your running containers are affected — without waiting for
              the next scheduled scan.
            </p>
            <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
              <code>{`# ScanRook continuous monitoring:
# 1. SBOMs from all scanned images are indexed
# 2. New CVE publications are matched against indexed packages
# 3. Alerts fire when a match is found

# Webhook notification configuration:
# Dashboard > Settings > Notifications > Add Webhook
# Supports: Slack, PagerDuty, email, custom webhooks`}</code>
            </pre>
          </div>

          {/* Item 15 */}
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 text-xs font-bold">15</span>
              <h3 className="text-sm font-semibold">Have an Incident Response Plan</h3>
            </div>
            <p className="text-sm muted">
              Document and rehearse your response process for when a critical
              vulnerability is discovered in a production image. Who gets
              notified? What is the rollback procedure? How quickly can you
              rebuild and redeploy?
            </p>
            <p className="text-sm muted">
              <strong>Why it matters:</strong> When Log4Shell dropped in
              December 2021, organizations with practiced incident response
              plans patched within hours. Those without plans took days or
              weeks. The difference is preparation, not capability.
            </p>
            <div className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs">
              <p className="font-medium mb-2">Incident response checklist:</p>
              <ol className="list-decimal pl-4 grid gap-1">
                <li>Identify affected images using SBOM inventory</li>
                <li>Assess exploitability (EPSS score, public exploit availability)</li>
                <li>Determine blast radius (which environments, how many instances)</li>
                <li>Apply mitigation (network policy, WAF rule, or rollback)</li>
                <li>Build patched image with updated dependency</li>
                <li>Scan patched image to confirm fix</li>
                <li>Deploy patched image through standard pipeline</li>
                <li>Verify fix in production and close incident</li>
              </ol>
            </div>
          </div>
        </section>

        {/* ScanRook Coverage */}
        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            What ScanRook Handles Automatically
          </h2>
          <p className="text-sm muted">
            <Link href="/" className="underline">ScanRook</Link> automates
            five of the fifteen checklist items out of the box:
          </p>
          <div className="overflow-x-auto -mx-8 px-8">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-3 font-medium">Item</th>
                  <th className="text-left py-2 pr-3 font-medium">Checklist Step</th>
                  <th className="text-left py-2 font-medium">How ScanRook Covers It</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                <tr>
                  <td className="py-2 pr-3">#3</td>
                  <td className="py-2 pr-3">Vulnerability scanning</td>
                  <td className="py-2">Multi-database scanning (NVD, OSV, OVAL) with CI/CD integration</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3">#10</td>
                  <td className="py-2 pr-3">SBOM generation</td>
                  <td className="py-2">Full package inventory generated with every scan</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3">#11</td>
                  <td className="py-2 pr-3">License compliance</td>
                  <td className="py-2">License detection and policy enforcement</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3">#13</td>
                  <td className="py-2 pr-3">Scheduled re-scans</td>
                  <td className="py-2">Registry integration with configurable scan schedules</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3">#14</td>
                  <td className="py-2 pr-3">New CVE monitoring</td>
                  <td className="py-2">Continuous matching of new CVEs against indexed SBOMs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Additional guidance */}
        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Beyond the Checklist: Defense in Depth
          </h2>
          <p className="text-sm muted">
            This checklist covers image-level security. A complete container
            security program also includes runtime security (syscall filtering
            with seccomp, AppArmor/SELinux profiles), host hardening (CIS
            benchmarks for the container runtime), supply chain security
            (SLSA provenance), and cluster-level controls (admission
            controllers, pod security standards).
          </p>
          <p className="text-sm muted">
            Each layer adds defense in depth. Image hardening prevents
            vulnerabilities from being deployed. Runtime security detects
            exploitation attempts. Network policies limit lateral movement.
            Monitoring and alerting ensure rapid response. No single control
            is sufficient — the combination creates a security posture where
            an attacker must bypass multiple independent barriers.
          </p>
          <p className="text-sm muted">
            For more on container scanning specifically, see our guide on{" "}
            <Link href="/blog/container-scanning-best-practices" className="underline">
              container scanning best practices
            </Link>{" "}
            and our{" "}
            <Link href="/blog/compliance-scanning-guide" className="underline">
              compliance scanning guide
            </Link>{" "}
            for framework-specific requirements.
          </p>
        </section>

        {/* Prioritization */}
        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Prioritizing the Checklist
          </h2>
          <p className="text-sm muted">
            If you cannot implement all 15 items immediately, prioritize in
            this order based on risk reduction per effort:
          </p>
          <ol className="list-decimal pl-6 text-sm muted grid gap-1">
            <li><strong>Non-root user (#4)</strong> — single Dockerfile line, massive risk reduction</li>
            <li><strong>Vulnerability scanning (#3)</strong> — immediate visibility into existing risk</li>
            <li><strong>No secrets in images (#7)</strong> — prevents credential exposure</li>
            <li><strong>Minimal base images (#1)</strong> — reduces attack surface at the foundation</li>
            <li><strong>Pin versions (#2)</strong> — ensures reproducibility and auditability</li>
            <li><strong>Multi-stage builds (#8)</strong> — removes build tools from production</li>
            <li><strong>Resource limits (#6)</strong> — prevents denial-of-service cascades</li>
            <li><strong>Read-only filesystem (#5)</strong> — blocks post-exploitation file writes</li>
          </ol>
          <p className="text-sm muted">
            The remaining items (signing, SBOM, licensing, network policies,
            scheduled scans, monitoring, incident response) build upon this
            foundation and should be implemented as your security program
            matures.
          </p>
        </section>

        {/* CTA */}
        <section className="grid gap-3 rounded-lg border border-black/10 dark:border-white/10 bg-black/[.02] dark:bg-white/[.02] p-6">
          <h2 className="text-lg font-semibold tracking-tight">
            Start Checking Off Your List
          </h2>
          <p className="text-sm muted">
            Upload a container image to ScanRook and immediately cover items
            3, 10, 11, 13, and 14 from this checklist. Get vulnerability
            findings, license data, and a complete SBOM in a single scan.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-md bg-black dark:bg-white text-white dark:text-black px-4 py-2 text-sm font-medium"
            >
              Upload an Image
            </Link>
            <Link
              href="/blog/cve-database-comparison"
              className="inline-flex items-center rounded-md border border-black/20 dark:border-white/20 px-4 py-2 text-sm font-medium"
            >
              Learn About Our Data Sources
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
