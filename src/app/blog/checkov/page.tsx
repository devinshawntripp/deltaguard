import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-06";

const title = `Checkov Explained: Scanning Infrastructure as Code | ${APP_NAME}`;
const description =
  "Checkov is an open-source static analysis tool that scans infrastructure as code for misconfigurations. How it works, what it covers, and where ScanRook fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "checkov",
    "what is checkov",
    "checkov terraform",
    "infrastructure as code scanning",
    "iac security scanning",
    "checkov tutorial",
    "checkov policies",
    "terraform security scanner",
    "checkov ci cd",
    "static analysis infrastructure as code",
  ],
  alternates: { canonical: "/blog/checkov" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/checkov",
    images: ["/blog/checkov.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/checkov.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Checkov Explained: Scanning Infrastructure as Code",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/checkov",
  image: "https://scanrook.io/blog/checkov.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Checkov?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Checkov is an open-source static analysis tool for infrastructure as code, originally built by Bridgecrew and now maintained under Palo Alto Networks. It scans configuration files such as Terraform, CloudFormation, and Kubernetes manifests for security misconfigurations and compliance violations before they are deployed, using more than a thousand built-in policies plus custom rules.",
      },
    },
    {
      "@type": "Question",
      name: "What does Checkov scan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Checkov supports many infrastructure-as-code formats, including Terraform and Terraform plan output, CloudFormation, AWS SAM, Kubernetes manifests, Helm charts, Kustomize, ARM templates, Bicep, the Serverless framework, Dockerfiles, and more. It also has built-in secrets detection and can scan for vulnerable packages, though its core strength is finding configuration mistakes.",
      },
    },
    {
      "@type": "Question",
      name: "Is Checkov free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The Checkov command-line tool is free and open source under the Apache 2.0 license, and you can run it with no account. Palo Alto Networks also offers Prisma Cloud, a commercial platform that builds on Checkov with a hosted dashboard, policy management, and pull-request integration, but the core scanner stands on its own.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between Checkov and a container scanner?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Checkov analyzes infrastructure-as-code definitions for misconfigurations before deployment, such as a public storage bucket or a privileged container in a manifest. A container scanner like ScanRook inspects the built image for known CVEs in the OS and language packages inside it. One checks how you configured the infrastructure; the other checks what software vulnerabilities you shipped.",
      },
    },
    {
      "@type": "Question",
      name: "Where should Checkov run in a pipeline?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Checkov is designed to run early: as a pre-commit hook, in the pull-request pipeline, and again before an apply. Catching a misconfiguration in code review is far cheaper than remediating it in a running cloud account. Many teams gate merges on Checkov results and use its SARIF output to surface findings directly in the code review interface.",
      },
    },
  ],
};

const frameworks = ["Terraform", "CloudFormation", "Kubernetes", "Dockerfile", "Serverless"];

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
          <div className="text-xs uppercase tracking-wide muted">Scanning concepts</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Checkov Explained: Scanning Infrastructure as Code
          </h1>
          <p className="text-sm muted">Published October 6, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            Checkov is one of the most popular open-source tools for catching cloud misconfigurations
            before they ship. It reads your Terraform, Kubernetes, and CloudFormation files and flags
            the risky settings while they are still just text in a pull request. This guide explains
            what Checkov does, how its policy engine works, what it covers, and where infrastructure
            scanning ends and artifact scanning begins.
          </p>
        </header>

        <img
          src="/blog/checkov.jpg"
          alt="Checkov infrastructure as code scanning explained"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Checkov is</h2>
          <p className="text-sm muted">
            Checkov is an open-source static analysis tool for infrastructure as code (IaC). It was
            created by Bridgecrew, which Palo Alto Networks acquired, and it remains free and open
            source under the Apache 2.0 license. Written in Python, it reads configuration files and
            checks them against a large library of policies &mdash; more than a thousand built in
            &mdash; that encode cloud security best practices and common compliance requirements.
          </p>
          <p className="text-sm muted">
            The idea behind IaC scanning is that most cloud breaches trace back not to exotic
            exploits but to mundane misconfiguration: a storage bucket left public, a database
            without encryption at rest, a security group open to the whole internet, a container
            manifest that runs as root. When your infrastructure is defined in code, those mistakes
            are visible as text before anything is provisioned &mdash; and a tool like Checkov can
            catch them in code review instead of in a post-incident report.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where it runs and what it checks</h2>
          <p className="text-sm muted">
            Checkov takes a set of IaC files, evaluates every resource against its applicable
            policies, and returns a pass or fail per check. In CI it becomes a gate: a failing check
            can block a merge before the misconfiguration ever reaches a cloud account.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 720 210"
              className="w-full"
              style={{ minWidth: 620 }}
              role="img"
              aria-label="Checkov evaluates infrastructure-as-code files against policies and gates the pipeline"
            >
              <g fontSize="11" fill="currentColor">
                {frameworks.map((f, i) => {
                  const y = 16 + i * 36;
                  return (
                    <g key={f}>
                      <rect x="12" y={y} width="150" height="26" rx="6" fill="var(--dg-accent,#2563eb)" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.28" />
                      <text x="24" y={y + 17}>{f}</text>
                      <line x1="162" y1={y + 13} x2="248" y2="104" stroke="currentColor" strokeOpacity="0.28" />
                    </g>
                  );
                })}
                {/* Checkov engine box */}
                <rect x="250" y="70" width="150" height="68" rx="10" fill="var(--dg-accent,#2563eb)" fillOpacity="0.14" stroke="var(--dg-accent,#2563eb)" strokeOpacity="0.6" />
                <text x="325" y="99" textAnchor="middle" fontWeight="600" fontSize="13">Checkov</text>
                <text x="325" y="116" textAnchor="middle" fontSize="10">1,000+ policies</text>
                {/* split to results */}
                <line x1="400" y1="104" x2="470" y2="88" stroke="currentColor" strokeOpacity="0.35" />
                <line x1="400" y1="104" x2="470" y2="132" stroke="currentColor" strokeOpacity="0.35" />
                {/* result boxes */}
                <rect x="470" y="74" width="234" height="28" rx="6" fill="none" stroke="currentColor" strokeOpacity="0.35" />
                <text x="484" y="92">Pass &rarr; provision / merge</text>
                <rect x="470" y="118" width="234" height="28" rx="6" fill="var(--dg-accent,#2563eb)" fillOpacity="0.10" stroke="var(--dg-accent,#2563eb)" strokeOpacity="0.5" />
                <text x="484" y="136">Fail &rarr; block the change</text>
                <text x="12" y="204" fontSize="10" fillOpacity="0.8">Runs as a pre-commit hook, in CI, and before apply &mdash; static, before anything deploys.</text>
              </g>
            </svg>
          </div>
          <p className="text-sm muted">
            The policies map to recognized baselines. Many correspond directly to{" "}
            <Link href="/blog/cis-benchmarks-explained" className="underline">
              CIS Benchmark
            </Link>{" "}
            recommendations, so a Checkov run doubles as a lightweight compliance check against those
            hardening guides.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A quick run</h2>
          <p className="text-sm muted">
            Checkov installs as a Python package and runs against a directory with no configuration
            required to get started:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Install
pip install checkov

# Scan a directory of Terraform (or K8s, CloudFormation, etc.)
checkov --directory .

# Emit SARIF for code-review annotations, and only fail on hard errors
checkov -d . --output sarif --soft-fail-on LOW`}</pre>
          <p className="text-sm muted">
            Each finding names the resource, the check ID (for example{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CKV_AWS_18</code>{" "}
            for S3 access logging), and a short guideline. Because Checkov builds a graph of your
            resources, it can also evaluate relationships between them &mdash; not just a single
            block in isolation &mdash; which catches issues like a bucket policy that undoes a
            bucket&apos;s own access setting.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Custom policies</h2>
          <p className="text-sm muted">
            The built-in library is a strong start, but the real leverage is encoding your own
            organization&apos;s rules. Checkov lets you write custom policies in YAML for simple
            attribute checks or in Python for anything more involved: &ldquo;every S3 bucket must
            have this tag,&rdquo; &ldquo;no security group may allow 0.0.0.0/0 on port 22,&rdquo;
            &ldquo;all RDS instances must be multi-AZ in production.&rdquo; Turning a written standard
            into an automated check that runs on every pull request is what moves security left
            without adding a manual review step. That same idea &mdash; codifying rules and checking
            them without running the system &mdash; is the essence of static analysis, which we
            contrast with dynamic testing in{" "}
            <Link href="/blog/sast-vs-dast-explained" className="underline">
              SAST vs DAST
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Checkov does not do</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>It does not scan running infrastructure.</strong> Checkov reads the declared
              configuration, not the live cloud account. If someone changes a setting by hand after
              deployment, that drift is invisible to a static IaC scan.
            </li>
            <li>
              <strong>It does not find CVEs in your images.</strong> A Kubernetes manifest can pass
              every Checkov policy while pointing at a container image full of vulnerable packages.
              Checkov checks the configuration, not the software inside the artifact.
            </li>
            <li>
              <strong>It reflects your code, not reality.</strong> If parts of your infrastructure
              are managed outside IaC, Checkov never sees them, so coverage is only as complete as
              your codified infrastructure.
            </li>
            <li>
              <strong>Policies need tuning.</strong> Out of the box, some checks will not match your
              risk model. Expect to suppress or adjust a subset so the gate stays meaningful rather
              than noisy.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How it compares to other IaC scanners</h2>
          <p className="text-sm muted">
            Checkov is not the only static IaC scanner, and it is worth knowing where it sits.
            Terrascan and KICS occupy the same niche &mdash; policy-driven checks over Terraform,
            Kubernetes, and related formats &mdash; each with its own rule language and coverage
            quirks. Trivy also includes misconfiguration scanning alongside its vulnerability and
            secrets checks, which appeals to teams that want one binary for several jobs. Cloud
            platforms fold similar analysis into their own products, as Palo Alto Networks does with
            Prisma Cloud on top of Checkov.
          </p>
          <p className="text-sm muted">
            Checkov&apos;s pull is its breadth of built-in policies, its graph-based evaluation that
            reasons about relationships between resources, and the ease of writing custom checks in
            plain Python or YAML. The honest tradeoff is the same one every static IaC scanner makes:
            more policies mean more findings to triage, so budget time to tune the ruleset to your
            environment. As with any scanner, a wall of unfiltered findings trains people to ignore
            the tool &mdash; the goal is a small, trusted set of checks that fail the build for real
            reasons.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Checkov and ScanRook secure two different layers of the same deployment, and running both
            closes a gap neither can cover alone. Checkov verifies that your Kubernetes manifest sets
            a non-root user, drops capabilities, and mounts a read-only filesystem &mdash; the
            configuration. ScanRook then scans the image that manifest references, inventorying every
            OS and language package and matching them against OSV, NVD, and Red Hat OVAL to surface
            known CVEs &mdash; the contents. A perfectly configured pod running a base image with a
            critical OpenSSL flaw is still exposed, and only artifact scanning catches that. If you
            are hardening Kubernetes,{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              cluster vulnerability scanning
            </Link>{" "}
            and{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              admission control
            </Link>{" "}
            pair naturally with IaC policy checks. Use Checkov to get the configuration right, and{" "}
            <Link href="/blog/container-image-scanning-guide" className="underline">
              image scanning
            </Link>{" "}
            to get the contents right.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is Checkov?</h3>
              <p className="text-sm muted mt-1">
                An open-source static analysis tool for infrastructure as code that scans Terraform,
                CloudFormation, Kubernetes, and more for misconfigurations against 1,000+ built-in
                policies before deployment.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is Checkov free?</h3>
              <p className="text-sm muted mt-1">
                Yes, the CLI is free and open source under Apache 2.0. Palo Alto Networks offers the
                commercial Prisma Cloud platform on top of it, but the scanner runs standalone with
                no account.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What does Checkov scan?</h3>
              <p className="text-sm muted mt-1">
                Terraform, CloudFormation, Kubernetes manifests, Helm, Kustomize, ARM, Bicep, the
                Serverless framework, Dockerfiles, and more &mdash; plus built-in secrets detection.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does it replace a container scanner?</h3>
              <p className="text-sm muted mt-1">
                No. Checkov checks configuration; a container scanner like ScanRook checks the image
                for known CVEs. They cover different layers and are best run together.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan the image your manifests point at</h3>
          <p className="text-sm muted leading-relaxed">
            IaC scanning gets your configuration right. ScanRook checks what is actually inside the
            image &mdash; every OS and language package matched against OSV, NVD, and vendor
            advisories, with a source and confidence tier on each finding.
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
            <Link href="/blog/cis-benchmarks-explained" className="underline">
              CIS Benchmarks Explained
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              Kubernetes Vulnerability Scanning
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/docker-security-guide" className="underline">
              Docker Security Guide
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
