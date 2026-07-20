import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-07";

const title = `AWS Inspector: How Amazon's Vulnerability Scanner Works | ${APP_NAME}`;
const description =
  "How AWS Inspector scans EC2, ECR images and Lambda for CVEs, how agentless and agent-based scanning differ, what it costs you in effort, and where it stops.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "aws inspector",
    "amazon inspector",
    "aws inspector2",
    "aws vulnerability scanning",
    "ecr enhanced scanning",
    "aws inspector ec2",
    "aws inspector lambda",
    "aws inspector pricing",
    "aws inspector vs trivy",
    "amazon inspector sbom",
  ],
  alternates: { canonical: "/blog/aws-inspector" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/aws-inspector",
    images: ["/blog/aws-inspector.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/aws-inspector.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "AWS Inspector: How Amazon's Vulnerability Scanner Works",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/aws-inspector",
  image: "https://scanrook.io/blog/aws-inspector.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is AWS Inspector?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Amazon Inspector is AWS's managed vulnerability management service. It continuously discovers workloads in your account and scans them for known software vulnerabilities and unintended network exposure. The current generation covers EC2 instances, container images in Amazon ECR, and AWS Lambda functions, and it delivers findings into AWS Security Hub and EventBridge.",
      },
    },
    {
      "@type": "Question",
      name: "Does AWS Inspector need an agent?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For EC2 it can work either way. Agent-based scanning uses the AWS Systems Manager Agent already present on most AWS-provided AMIs and produces the deepest package inventory. Agentless scanning takes an EBS snapshot of the volume and inventories it out of band, which covers instances where SSM is not configured. ECR and Lambda scanning never require an agent.",
      },
    },
    {
      "@type": "Question",
      name: "How is Amazon Inspector different from ECR basic scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ECR offers two scanning modes. Basic scanning is a lightweight, registry-native check of operating system packages. Enhanced scanning is Amazon Inspector: it adds programming-language package coverage, continuous rescanning as new advisories publish, and Inspector's risk scoring. Enhanced scanning is billed through Inspector; basic scanning is not.",
      },
    },
    {
      "@type": "Question",
      name: "Can Amazon Inspector generate an SBOM?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Inspector can export a software bill of materials for the resources it has inventoried to an S3 bucket, in CycloneDX or SPDX format, using the create-sbom-export API. The export reflects what Inspector observed during scanning, so its completeness depends on how thoroughly that resource was covered.",
      },
    },
    {
      "@type": "Question",
      name: "What are the limits of AWS Inspector?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It only sees AWS resources. Images sitting in Docker Hub, GitHub Container Registry, Harbor, or a build artifact that never reaches ECR are outside its scope, as are on-premises hosts and other clouds. It is also a runtime-and-registry control rather than a build-time gate, so it tells you about a vulnerable image after it exists rather than before it is published.",
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
            AWS Inspector: How Amazon&apos;s Vulnerability Scanner Works
          </h1>
          <p className="text-sm muted">Published September 7, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            AWS Inspector is the vulnerability scanner you already have if you run anything on AWS.
            It discovers workloads by itself, scans EC2 instances, ECR images and Lambda functions
            for known CVEs, and keeps re-checking them as new advisories publish. Here is how it
            actually works under the hood, what the agent-based and agentless modes really do, and
            the boundary where you still need something else.
          </p>
        </header>

        <img
          src="/blog/aws-inspector.jpg"
          alt="AWS Inspector continuously scanning EC2, ECR and Lambda workloads for vulnerabilities"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What AWS Inspector is</h2>
          <p className="text-sm muted">
            Amazon Inspector is AWS&apos;s managed vulnerability management service. The important
            word is <em>managed</em>: you do not deploy a scanner, maintain a vulnerability
            database, or schedule scan jobs. You enable it on an account, and it discovers eligible
            resources on its own and starts producing findings. The current generation is what the
            API calls <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">inspector2</code>,
            a full rewrite of the original Inspector Classic service, which AWS has since retired.
          </p>
          <p className="text-sm muted">
            The model is continuous rather than scheduled. Inspector builds an inventory of the
            software on each covered resource, then re-evaluates that inventory whenever new
            vulnerability data lands. A container image that was clean when you pushed it can raise
            a finding weeks later without anyone re-running anything. That is the single most
            valuable property of the service, and the reason it is worth enabling even if you also
            scan elsewhere in your pipeline.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Amazon Inspector scans</h2>
          <p className="text-sm muted">
            Coverage is organised by resource type, and each type is enabled independently. That
            matters for cost control and for setting expectations, because the depth of analysis is
            not the same across them.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 258"
              role="img"
              aria-label="Matrix showing AWS Inspector coverage across EC2, ECR container images, Lambda functions and Lambda code, against package CVE scanning, continuous rescanning, network reachability and code analysis"
              className="w-full"
              style={{ minWidth: 600 }}
            >
              {[
                { label: "Package CVEs", x: 250 },
                { label: "Continuous rescan", x: 370 },
                { label: "Network reach", x: 490 },
                { label: "Code analysis", x: 610 },
              ].map((c) => (
                <text
                  key={c.label}
                  x={c.x}
                  y={22}
                  textAnchor="middle"
                  fontSize="10"
                  fill="currentColor"
                  fillOpacity={0.65}
                >
                  {c.label}
                </text>
              ))}
              {[
                { label: "EC2 instances", y: 56, cells: [1, 1, 1, 0] },
                { label: "ECR images", y: 106, cells: [1, 1, 0, 0] },
                { label: "Lambda functions", y: 156, cells: [1, 1, 0, 0] },
                { label: "Lambda code", y: 206, cells: [0, 1, 0, 1] },
              ].map((r) => (
                <g key={r.label}>
                  <text x={10} y={r.y + 4} fontSize="12" fontWeight="600" fill="currentColor">
                    {r.label}
                  </text>
                  {r.cells.map((v, i) => (
                    <g key={i}>
                      <rect
                        x={250 + i * 120 - 46}
                        y={r.y - 18}
                        width={92}
                        height={36}
                        rx={7}
                        fill="currentColor"
                        fillOpacity={v ? 0.14 : 0.04}
                        stroke="currentColor"
                        strokeOpacity={v ? 0.5 : 0.2}
                      />
                      <text
                        x={250 + i * 120}
                        y={r.y + 5}
                        textAnchor="middle"
                        fontSize="13"
                        fill="currentColor"
                        fillOpacity={v ? 0.9 : 0.35}
                      >
                        {v ? "yes" : "no"}
                      </text>
                    </g>
                  ))}
                </g>
              ))}
            </svg>
            <figcaption className="text-xs muted mt-3">
              Amazon Inspector coverage by resource type. Each row is enabled separately, and
              enabling one does not imply the others.
            </figcaption>
          </div>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>EC2 instances.</strong> Operating-system package vulnerabilities, plus
              language package findings for supported ecosystems, plus <em>network reachability</em>{" "}
              findings that trace whether a listening port is actually reachable from the internet
              through your security groups, NACLs, route tables and load balancers.
            </li>
            <li>
              <strong>ECR container images.</strong> This is what the registry calls{" "}
              <em>enhanced scanning</em>. Images are scanned on push and then rescanned
              continuously for a configurable window.
            </li>
            <li>
              <strong>Lambda functions.</strong> The deployment package and its layers are
              inventoried and matched like any other artifact.
            </li>
            <li>
              <strong>Lambda code.</strong> A separate capability that analyses your own function
              source for insecure patterns rather than matching third-party packages against CVEs
              &mdash; closer in spirit to a SAST tool. We cover the distinction in{" "}
              <Link href="/blog/sast-vs-dast-explained" className="underline">
                SAST vs DAST
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            How AWS Inspector gets its package inventory
          </h2>
          <p className="text-sm muted">
            Everything downstream depends on one question: how does Inspector learn what is
            installed? For ECR and Lambda the answer is easy, because AWS already holds the
            artifact. It unpacks the image or deployment bundle server-side and reads the package
            databases directly. No agent, no configuration, nothing running in your account.
          </p>
          <p className="text-sm muted">
            EC2 is where it gets interesting, because there are two modes and they behave
            differently:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Agent-based.</strong> Inspector uses the AWS Systems Manager Agent, which is
              preinstalled on most AWS-provided AMIs, to collect the package inventory from inside
              the running instance. This is the deeper of the two: it sees the live installed state,
              including packages added after boot, and it supports the broadest set of finding
              types.
            </li>
            <li>
              <strong>Agentless.</strong> Where SSM is not available or not configured, Inspector
              can take an EBS snapshot of the instance volume and inventory it out of band. This
              gets you coverage on instances you cannot or will not instrument, at the cost of some
              finding types and a coarser refresh cadence.
            </li>
          </ul>
          <p className="text-sm muted">
            The practical failure mode with EC2 is neither of these working. Instances with a broken
            SSM registration, a missing instance profile, or no route to the SSM endpoints silently
            fall out of coverage, and Inspector will happily report zero findings for a host it
            never looked at. Check{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              aws inspector2 list-coverage
            </code>{" "}
            before you trust a clean dashboard.
          </p>
        </section>

        <img
          src="/blog/aws-inspector-2.jpg"
          alt="Layered view of AWS Inspector scanning EC2, container images and serverless functions"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Enabling it and reading findings</h2>
          <p className="text-sm muted">
            Enablement is per-account and per-resource-type. From the CLI, the whole thing is one
            call:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`# Turn on scanning for the resource types you want
aws inspector2 enable \\
  --resource-types EC2 ECR LAMBDA LAMBDA_CODE \\
  --account-ids 123456789012

# Confirm what is actually enabled
aws inspector2 batch-get-account-status --account-ids 123456789012

# See which resources are covered and which fell out
aws inspector2 list-coverage

# Pull only the critical findings
aws inspector2 list-findings \\
  --filter-criteria '{"severity":[{"comparison":"EQUALS","value":"CRITICAL"}]}'`}
          </pre>
          <p className="text-sm muted">
            In a multi-account organisation you do this once from a delegated administrator account
            rather than account by account. Findings land in Amazon Inspector&apos;s own console,
            and if you have it turned on, in AWS Security Hub. Every finding also emits an
            EventBridge event, which is the hook most teams use to push into Slack, a ticketing
            system, or their own datastore. That event-driven path is far more useful than
            polling the API on a schedule.
          </p>
          <p className="text-sm muted">
            Inspector attaches its own risk score to each finding rather than showing raw CVSS
            alone. The score adjusts the base CVSS severity with context Inspector can observe
            &mdash; notably whether the vulnerable code is actually reachable over the network and
            whether exploitation is known in the wild. It is the same instinct behind{" "}
            <Link href="/blog/epss-vulnerability-prioritization" className="underline">
              EPSS-based prioritisation
            </Link>
            : the CVSS base score alone is a poor queue.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">SBOM export and ECR settings</h2>
          <p className="text-sm muted">
            Two configuration details are worth knowing because they quietly change your results.
          </p>
          <p className="text-sm muted">
            First, ECR enhanced scanning has a <em>rescan duration</em>. You choose how long after
            an image is pushed Inspector keeps continuously re-evaluating it &mdash; commonly a
            fixed window like 30 or 180 days, or for the lifetime of the image. Set a short window
            and old-but-still-deployed images stop generating findings, which looks like
            improvement and is not. Check this before you celebrate a falling finding count.
          </p>
          <p className="text-sm muted">
            Second, Inspector can export a software bill of materials for the resources it has
            inventoried:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`aws inspector2 create-sbom-export \\
  --report-format CYCLONEDX_1_4 \\
  --s3-destination bucketName=my-sbom-bucket,keyPrefix=inspector/`}
          </pre>
          <p className="text-sm muted">
            SPDX is available as an alternative format. This is a genuinely useful feature for
            compliance evidence, but remember the export reflects what Inspector observed, not
            ground truth &mdash; an instance that dropped out of coverage contributes nothing. If
            SBOM format choice is new to you,{" "}
            <Link href="/blog/cyclonedx-vs-spdx" className="underline">
              CycloneDX vs SPDX
            </Link>{" "}
            covers the tradeoffs, and{" "}
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              our SBOM guide
            </Link>{" "}
            explains how the document is consumed downstream.
          </p>
        </section>

        <img
          src="/blog/aws-inspector-3.jpg"
          alt="AWS Inspector findings aggregating from multiple accounts into a central security hub"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where AWS Inspector stops</h2>
          <p className="text-sm muted">
            The honest limits are not bugs; they are the shape of the product.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>It only sees AWS.</strong> Images in Docker Hub, GHCR, Harbor, or a
              self-hosted registry are invisible to it, as are on-premises hosts and other clouds.
              If your ECR repository is a publishing target rather than your only registry, you have
              a coverage gap by construction. Our{" "}
              <Link href="/blog/harbor-registry" className="underline">
                Harbor registry guide
              </Link>{" "}
              covers the equivalent problem on self-hosted registries.
            </li>
            <li>
              <strong>It is not a build gate.</strong> Inspector finds a vulnerable image after it
              exists in ECR. Stopping the image from being published at all is a CI concern, which
              is why most teams run a scanner in the pipeline too &mdash; see{" "}
              <Link href="/blog/scan-docker-images-github-actions" className="underline">
                scanning images in GitHub Actions
              </Link>
              .
            </li>
            <li>
              <strong>Costs scale with resources, not with scans.</strong> Billing is per instance,
              per image and per function on a monthly basis, with volume tiers. Check the current
              AWS pricing page rather than any figure you read in a blog post, including this one.
              The relevant behavioural consequence is that enabling ECR scanning across a registry
              with thousands of stale tags is expensive for no security benefit; prune first.
            </li>
            <li>
              <strong>Source coverage is Amazon&apos;s.</strong> Like every scanner, its findings
              are only as good as the advisory data behind them, and different databases disagree
              more than people expect &mdash; see our{" "}
              <Link href="/blog/cve-database-comparison" className="underline">
                CVE database comparison
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            We would not tell an AWS shop to turn Inspector off. Continuous rescanning of what is
            actually deployed, in the place it is deployed, with network reachability context, is
            work you do not want to rebuild. Keep it as your runtime and registry safety net.
          </p>
          <p className="text-sm muted">
            ScanRook covers the two things Inspector structurally cannot. The first is everything
            outside AWS: an image tarball, a stripped binary, or a source archive, scanned from your
            laptop or any CI runner, before it is ever pushed anywhere. The second is source
            breadth &mdash; we match every discovered package against OSV, NVD and Red Hat OVAL in
            parallel and tag each finding with which source produced it and a confidence tier, so a
            disagreement between databases is visible rather than resolved silently. If Inspector
            and your pipeline scanner disagree on an image, that provenance is usually what explains
            it. For the ECR-specific path, our{" "}
            <Link href="/blog/ecr-image-scanning" className="underline">
              ECR image scanning guide
            </Link>{" "}
            goes deeper on basic vs enhanced scanning, and{" "}
            <Link href="/blog/container-image-scanning-guide" className="underline">
              the container image scanning guide
            </Link>{" "}
            is the broader background.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Does AWS Inspector need an agent?</h3>
              <p className="text-sm muted mt-1">
                For EC2, either the SSM Agent or agentless EBS snapshot scanning. ECR and Lambda
                need neither, because AWS already holds the artifact.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">
                What is the difference from ECR basic scanning?
              </h3>
              <p className="text-sm muted mt-1">
                Basic scanning is a lightweight registry-native OS package check. Enhanced scanning
                is Inspector: language packages, continuous rescanning, and risk scoring, billed
                through Inspector.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can it produce an SBOM?</h3>
              <p className="text-sm muted mt-1">
                Yes, via <code>create-sbom-export</code> to S3 in CycloneDX or SPDX. It reflects what
                Inspector inventoried, so gaps in coverage become gaps in the SBOM.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is it enough on its own?</h3>
              <p className="text-sm muted mt-1">
                Only if every artifact you care about lives in AWS and you are content to catch
                problems after publication. Most teams pair it with a build-time scanner.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan before it reaches ECR</h3>
          <p className="text-sm muted leading-relaxed">
            Run ScanRook against the image tarball in your build, then compare what Inspector
            reports after the push. Every finding carries its source and a confidence tier, so the
            differences are explainable rather than mysterious.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--dg-accent,#2563eb)] text-white px-4 py-2 text-sm font-medium"
            >
              Start scanning
            </Link>
            <Link href="/docs" className="btn-secondary">
              Read the docs
            </Link>
          </div>
        </section>

        <footer className="border-t border-black/10 dark:border-white/10 pt-4 text-xs muted grid gap-2">
          <p>
            <strong>Related reading:</strong>{" "}
            <Link href="/blog/ecr-image-scanning" className="underline">
              ECR Image Scanning
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-image-scanning-guide" className="underline">
              Container Image Scanning Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/epss-vulnerability-prioritization" className="underline">
              EPSS Vulnerability Prioritization
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
