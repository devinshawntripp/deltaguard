import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-01";

const title = `KICS Explained: Open-Source IaC Security Scanning | ${APP_NAME}`;
const description =
  "KICS is an open-source IaC scanner from Checkmarx that finds misconfigurations in Terraform, Kubernetes, and Dockerfiles, and where ScanRook fits alongside it.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "kics",
    "kics scanner",
    "kics iac scanning",
    "keeping infrastructure as code secure",
    "checkmarx kics",
    "iac security scanning",
    "terraform security scanning",
    "kics vs checkov",
    "infrastructure as code security",
    "iac misconfiguration scanner",
  ],
  alternates: { canonical: "/blog/kics" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/kics",
    images: ["/blog/kics.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/kics.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "KICS Explained: Open-Source IaC Security Scanning",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/kics",
  image: "https://scanrook.io/blog/kics.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is KICS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "KICS, short for Keeping Infrastructure as Code Secure, is an open-source static analysis tool maintained by Checkmarx. It scans infrastructure-as-code files such as Terraform, CloudFormation, Kubernetes manifests, Helm charts, Ansible, and Dockerfiles for security misconfigurations, compliance issues, and best-practice violations before the infrastructure is provisioned.",
      },
    },
    {
      "@type": "Question",
      name: "What file types can KICS scan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "KICS supports a broad set of IaC platforms including Terraform, AWS CloudFormation, Kubernetes manifests, Helm, Ansible, Docker and docker-compose, Azure Resource Manager and Bicep, Google Deployment Manager, Pulumi, Crossplane, and OpenAPI specifications. It parses each format and runs platform-specific queries against the parsed structure.",
      },
    },
    {
      "@type": "Question",
      name: "Is KICS free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. KICS is free and open source under the Apache 2.0 license. You can run it as a standalone binary, a Docker container, a GitHub Action, or a pre-commit hook at no cost. Checkmarx, which maintains it, also sells commercial application-security products, but KICS itself carries no license fee.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between KICS and a container image scanner?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "KICS analyzes configuration files. It reads your Dockerfile or Kubernetes manifest and flags insecure settings, such as a container that runs as root or a manifest that mounts the Docker socket. A container image scanner reads the packages installed inside a built image and reports known CVEs in them. One checks how you configured the deployment; the other checks what software you shipped.",
      },
    },
    {
      "@type": "Question",
      name: "How are KICS queries written?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "KICS queries are written in Rego, the policy language from Open Policy Agent. Each query encodes a single rule, such as detecting an S3 bucket with public read access, and runs against the parsed representation of the IaC file. Because the query set is open, teams can add custom queries for their own policies.",
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
            KICS Explained: Open-Source IaC Security Scanning
          </h1>
          <p className="text-sm muted">Published December 1, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            Most cloud breaches do not start with a clever exploit. They start with a misconfigured
            bucket, an over-permissive security group, or a container manifest that quietly runs as
            root. KICS &mdash; Keeping Infrastructure as Code Secure &mdash; is an open-source tool
            that catches those mistakes in your Terraform, Kubernetes, and Dockerfiles before they
            reach production. Here is how it works and where it stops.
          </p>
        </header>

        <img
          src="/blog/kics.jpg"
          alt="KICS scanning infrastructure as code for misconfigurations"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What KICS is</h2>
          <p className="text-sm muted">
            KICS is a static analysis engine for infrastructure-as-code, maintained by Checkmarx
            and released under the Apache 2.0 license. You point it at a directory of IaC files and
            it parses each one, runs a library of security queries against the parsed structure, and
            reports every rule that fails &mdash; ranked by severity. It is written in Go, ships as a
            single binary or a Docker image, and runs entirely locally with no account required.
          </p>
          <p className="text-sm muted">
            The queries are the interesting part. Each one is written in Rego, the policy language
            from Open Policy Agent, and encodes a single check: an S3 bucket with public read
            access, a security group open to <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">0.0.0.0/0</code>,
            a Kubernetes pod without resource limits, a Dockerfile that never drops to a non-root
            user. KICS ships thousands of these queries across its supported platforms, and because
            the query set is open, you can add your own to encode organization-specific policy.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What it scans</h2>
          <p className="text-sm muted">
            KICS covers a wide range of IaC formats. The commonly used ones include Terraform, AWS
            CloudFormation, Kubernetes manifests, Helm charts, Ansible playbooks, Docker and
            docker-compose files, Azure Resource Manager and Bicep, Google Deployment Manager,
            Pulumi, Crossplane, and OpenAPI specifications. For each format it understands the
            structure, not just the text, so a rule about an open port knows the difference between
            a Terraform security-group resource and a Kubernetes service.
          </p>
          <p className="text-sm muted">
            Findings are grouped by severity &mdash; HIGH, MEDIUM, LOW, and INFO &mdash; and KICS can
            emit results as JSON, SARIF, HTML, and other formats. SARIF output is what lets findings
            show up as annotations in GitHub code scanning or other SARIF-aware dashboards.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Running KICS</h2>
          <p className="text-sm muted">
            The fastest way to try it is the official Docker image. Point it at your IaC directory
            and an output directory for the report:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Scan the current directory with the official image
docker run -t -v "$PWD":/path checkmarx/kics:latest \\
  scan -p /path -o /path --report-formats json,sarif

# Or with the standalone binary, failing on HIGH findings
kics scan -p ./infra -o ./results \\
  --report-formats sarif \\
  --fail-on high`}</pre>
          <p className="text-sm muted">
            The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--fail-on</code> flag is
            what turns KICS into a CI gate: exit non-zero when a finding meets or exceeds a chosen
            severity, and the pipeline stops. This is the same pattern you use to gate on image CVEs,
            covered in{" "}
            <Link href="/blog/container-image-scanning-guide" className="underline">
              our container image scanning guide
            </Link>
            , applied to configuration instead of packages.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where KICS fits &mdash; and where it does not</h2>
          <p className="text-sm muted">
            The single most useful thing to understand about KICS is the layer it operates on. It
            reads <em>configuration</em>, not <em>contents</em>. It can tell you that your Dockerfile
            never switches away from root, but it cannot tell you that the base image you chose ships
            a vulnerable version of OpenSSL. Those are two different problems on two different layers
            of the same delivery.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 680 210" width="100%" role="img" aria-label="KICS scans the configuration layer; image scanners read the artifact layer" className="min-w-[600px]">
              <g fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="12">
                <rect x={20} y={20} width={640} height={70} rx={8}
                  fill="var(--dg-accent,#2563eb)" fillOpacity="0.08"
                  stroke="var(--dg-accent,#2563eb)" strokeOpacity="0.5" />
                <text x={40} y={44} fontWeight="600" fill="currentColor">Configuration layer &mdash; KICS</text>
                <text x={40} y={66} fill="currentColor" fillOpacity="0.65" fontSize="11">
                  Terraform &middot; Kubernetes YAML &middot; Dockerfile &middot; Helm &middot; Ansible
                </text>
                <text x={40} y={82} fill="currentColor" fillOpacity="0.5" fontSize="10">
                  Finds: root user, open ports, public buckets, missing limits
                </text>
                <line x1={340} y1={90} x2={340} y2={118} stroke="currentColor" strokeOpacity="0.4"
                  strokeWidth="2" markerEnd="url(#kd)" />
                <rect x={20} y={120} width={640} height={70} rx={8}
                  fill="currentColor" fillOpacity="0.05"
                  stroke="currentColor" strokeOpacity="0.3" />
                <text x={40} y={144} fontWeight="600" fill="currentColor">Artifact layer &mdash; image scanner (ScanRook)</text>
                <text x={40} y={166} fill="currentColor" fillOpacity="0.65" fontSize="11">
                  OS packages &middot; language dependencies &middot; vendored binaries
                </text>
                <text x={40} y={182} fill="currentColor" fillOpacity="0.5" fontSize="10">
                  Finds: known CVEs in the software actually installed in the image
                </text>
                <defs>
                  <marker id="kd" markerWidth="8" markerHeight="8" refX="4" refY="7" orient="auto">
                    <path d="M0,0 L8,0 L4,8 Z" fill="currentColor" fillOpacity="0.4" />
                  </marker>
                </defs>
              </g>
            </svg>
          </div>
          <p className="text-sm muted">
            KICS is closest in spirit to a SAST tool, but for infrastructure instead of application
            code &mdash; see{" "}
            <Link href="/blog/sast-vs-dast-explained" className="underline">SAST vs DAST</Link>{" "}
            for that family of static analysis. It complements, rather than competes with, a
            vulnerability scanner that reads the built image. You want both.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">KICS versus the alternatives</h2>
          <p className="text-sm muted">
            KICS is not the only IaC scanner. Checkov and Terrascan cover similar ground, and Trivy
            includes IaC misconfiguration scanning alongside its container work &mdash; our{" "}
            <Link href="/compare/trivy" className="underline">ScanRook vs Trivy</Link> page notes
            where that overlap sits. The practical differences between IaC scanners come down to
            query coverage per platform, custom-rule ergonomics, and how cleanly the tool slots into
            your CI. KICS stands out for its breadth of supported formats and its open, Rego-based
            query model, which makes writing custom policies approachable for teams that already know
            Open Policy Agent.
          </p>
          <p className="text-sm muted">
            For runtime hardening standards that these tools often encode, the{" "}
            <Link href="/blog/cis-benchmarks-explained" className="underline">CIS Benchmarks</Link>{" "}
            are the common reference, and{" "}
            <Link href="/blog/kube-bench-cis-scanning" className="underline">kube-bench</Link>{" "}
            checks a live cluster against them &mdash; a complementary check to the config-file scan
            KICS performs.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A layered approach</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Scan IaC with KICS</strong> in CI on every pull request, gating on HIGH
              findings, so misconfigurations never merge.
            </li>
            <li>
              <strong>Scan the built image</strong> for CVEs before you push it to a registry,
              catching vulnerable packages the config scan cannot see.
            </li>
            <li>
              <strong>Enforce at admission</strong> so only images that passed both checks reach the
              cluster &mdash; see{" "}
              <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
                Kubernetes admission control
              </Link>
              .
            </li>
            <li>
              <strong>Treat findings as policy, not noise.</strong> Triage, suppress false positives
              deliberately, and re-baseline when you first turn a scanner on.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook does not scan IaC, and it does not try to replace KICS. It sits on the artifact
            layer: after your Dockerfile passes KICS, ScanRook scans the image that Dockerfile
            builds, reading the OS and language packages actually installed inside it and matching
            them against OSV, NVD, and Red Hat OVAL. KICS answers &ldquo;did we configure this
            deployment safely?&rdquo; ScanRook answers &ldquo;is the software we shipped free of
            known CVEs?&rdquo; Run KICS for configuration and ScanRook for contents, and the two
            together cover both halves of a secure deployment.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is KICS?</h3>
              <p className="text-sm muted mt-1">
                An open-source static analysis tool from Checkmarx that scans IaC files &mdash;
                Terraform, Kubernetes, CloudFormation, Dockerfiles, and more &mdash; for security
                misconfigurations before provisioning.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is KICS free?</h3>
              <p className="text-sm muted mt-1">
                Yes, under the Apache 2.0 license. Run it as a binary, a Docker container, a GitHub
                Action, or a pre-commit hook at no cost.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What does KICS not catch?</h3>
              <p className="text-sm muted mt-1">
                Vulnerable packages inside a built image. KICS reads configuration; a container
                scanner reads the software installed in the image. You need both.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How are KICS rules written?</h3>
              <p className="text-sm muted mt-1">
                In Rego, the Open Policy Agent language. Each query is one rule, and the open query
                set lets teams add custom policies.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan the image, not just the config</h3>
          <p className="text-sm muted leading-relaxed">
            KICS keeps your Dockerfiles and manifests clean. ScanRook scans the image they build for
            known CVEs in the packages actually installed &mdash; matched against OSV, NVD, and OVAL,
            with a source and confidence tier on every finding.
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
            <Link href="/blog/cis-benchmarks-explained" className="underline">
              CIS Benchmarks Explained
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/sast-vs-dast-explained" className="underline">
              SAST vs DAST
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
