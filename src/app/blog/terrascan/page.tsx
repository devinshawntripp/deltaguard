import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-27";

const title = `Terrascan: Scanning Infrastructure as Code for Misconfigs | ${APP_NAME}`;
const description =
  "Terrascan is an open-source scanner for Infrastructure as Code misconfigurations. How it works with OPA policies, what it covers, and where it fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "terrascan",
    "terrascan iac scanning",
    "terrascan terraform",
    "infrastructure as code scanner",
    "iac misconfiguration scanning",
    "terrascan vs checkov",
    "terrascan opa policies",
    "terraform security scan",
    "terrascan kubernetes",
    "iac security",
  ],
  alternates: { canonical: "/blog/terrascan" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/terrascan",
    images: ["/blog/terrascan.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/terrascan.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Terrascan: Scanning Infrastructure as Code for Misconfigs",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/terrascan",
  image: "https://scanrook.io/blog/terrascan.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Terrascan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Terrascan is an open-source static analyzer for Infrastructure as Code, originally built by Accurics and now maintained under Tenable. It scans Terraform, Kubernetes manifests, Helm charts, Dockerfiles, CloudFormation, and ARM templates for security misconfigurations and compliance violations before they are deployed, using policies written in the Open Policy Agent Rego language.",
      },
    },
    {
      "@type": "Question",
      name: "How does Terrascan work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Terrascan parses your IaC files into a normalized internal representation, then evaluates a library of OPA Rego policies against that model. Each policy checks for a specific misconfiguration, such as a storage bucket that is publicly readable or a security group open to the internet. Violations are reported with a severity, the offending resource, and the file and line, and Terrascan returns a non-zero exit code so a CI job can fail on them.",
      },
    },
    {
      "@type": "Question",
      name: "What does Terrascan cover that a vulnerability scanner does not?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Terrascan finds misconfigurations in your infrastructure definitions: over-permissive IAM, unencrypted storage, exposed ports, missing logging. A vulnerability scanner finds known CVEs in the software components inside a built artifact. These are different failure classes at different pipeline stages, so the two tools complement rather than replace each other. You want both a clean configuration and a clean set of dependencies.",
      },
    },
    {
      "@type": "Question",
      name: "How do you run Terrascan in CI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Run terrascan scan with the IaC type and a directory, for example terrascan scan -i terraform -d . or scoped to a cloud with -t aws. Choose an output format such as JSON or SARIF with -o, and let the non-zero exit code on violations fail the build. Terrascan can also run as a pre-commit hook, a server exposing an API, or a Kubernetes validating admission webhook that rejects non-compliant resources at deploy time.",
      },
    },
    {
      "@type": "Question",
      name: "Terrascan vs Checkov: which should I use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both are open-source IaC scanners covering similar ground. Terrascan uses OPA Rego policies and offers a built-in Kubernetes admission webhook; Checkov ships a very large built-in policy set and broad framework support and tends to see more frequent updates. KICS and Trivy's config scanning are other options. Evaluate current maintenance activity and policy coverage for your stack, and pick the one your team will actually keep running.",
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
            Terrascan: Scanning Infrastructure as Code for Misconfigs
          </h1>
          <p className="text-sm muted">Published December 27, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            Most cloud breaches do not start with a clever exploit &mdash; they start with a storage
            bucket left public or a security group open to the internet. Terrascan is an open-source
            scanner built to catch exactly those mistakes in your Infrastructure as Code, before the
            misconfiguration ever reaches a cloud account. Here is how it works, what it covers, how
            to run it, and how it fits alongside vulnerability scanning.
          </p>
        </header>

        <img
          src="/blog/terrascan.jpg"
          alt="Terrascan scanning Infrastructure as Code"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Terrascan is</h2>
          <p className="text-sm muted">
            Terrascan is a static code analyzer for Infrastructure as Code (IaC). It was originally
            built by Accurics and moved under Tenable&apos;s stewardship after the 2021 acquisition;
            it remains open source under the Apache 2.0 license. Its job is narrow and useful: read
            the files that define your infrastructure and flag the ones that describe an insecure or
            non-compliant setup &mdash; a database with public access, an unencrypted volume, an IAM
            policy granting far more than it should.
          </p>
          <p className="text-sm muted">
            Crucially, this happens at <em>definition</em> time, not runtime. Terrascan reads the
            declarative source &mdash; the Terraform, the Kubernetes YAML &mdash; so a bad
            configuration is caught in a pull request rather than discovered in production. It
            supports a broad set of formats: Terraform HCL and plan JSON, Kubernetes manifests, Helm
            charts, Kustomize, Dockerfiles, AWS CloudFormation, and Azure Resource Manager templates.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How it works: OPA policies over normalized IaC</h2>
          <p className="text-sm muted">
            Terrascan&apos;s engine is built on Open Policy Agent (OPA). When you run a scan, it
            parses your IaC into a normalized internal representation of resources and their
            attributes, then evaluates a library of policies &mdash; several hundred out of the box
            &mdash; written in OPA&apos;s Rego language against that model. Each policy is a single
            rule: <em>is this S3 bucket public</em>, <em>does this security group allow
            0.0.0.0/0 on port 22</em>, <em>is logging disabled on this resource</em>. When a rule
            matches, Terrascan records a violation with a severity, the resource, and the file and
            line.
          </p>
          <p className="text-sm muted">
            Because the policies are Rego, you can write your own to encode organization-specific
            rules, and the built-in set carries metadata mapping violations to compliance families
            like the CIS Benchmarks, NIST, PCI-DSS, and SOC 2. If you already run{" "}
            <Link href="/blog/kube-bench-cis-scanning" className="underline">
              kube-bench
            </Link>{" "}
            against live clusters, Terrascan is the shift-left equivalent for the manifests before
            they are applied.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where it fits in the pipeline</h2>
          <p className="text-sm muted">
            Terrascan and a vulnerability scanner sit at different points in the delivery pipeline and
            catch different failures. IaC scanning gates the <em>configuration</em>; image scanning
            gates the <em>contents</em>. Neither substitutes for the other.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 820 200"
              role="img"
              aria-label="Pipeline showing Terrascan scanning IaC for misconfigurations before build, and ScanRook scanning the built image for CVEs before deploy"
              className="w-full h-auto text-black dark:text-white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="820" height="200" rx="16" className="fill-black/[.02] dark:fill-white/[.02]" />

              <rect x="24" y="80" width="130" height="52" rx="10" className="fill-black/[.05] dark:fill-white/[.08] stroke-black/10 dark:stroke-white/10" strokeWidth="1" />
              <text x="89" y="104" textAnchor="middle" className="fill-current" fontSize="12" fontWeight="600">Write IaC</text>
              <text x="89" y="120" textAnchor="middle" className="fill-current" fontSize="10" opacity="0.6">Terraform, K8s</text>

              <line x1="154" y1="106" x2="206" y2="106" className="stroke-current" strokeWidth="1.5" opacity="0.4" markerEnd="url(#ts)" />

              <rect x="208" y="72" width="150" height="68" rx="10" className="fill-[var(--dg-accent,#2563eb)]" opacity="0.06" />
              <rect x="208" y="72" width="150" height="68" rx="10" className="stroke-[var(--dg-accent,#2563eb)]" strokeWidth="2" fill="none" />
              <text x="283" y="98" textAnchor="middle" className="fill-current" fontSize="12" fontWeight="600">Terrascan</text>
              <text x="283" y="115" textAnchor="middle" className="fill-current" fontSize="10" opacity="0.6">misconfig gate</text>
              <text x="283" y="129" textAnchor="middle" className="fill-current" fontSize="10" opacity="0.6">(configuration)</text>

              <line x1="358" y1="106" x2="410" y2="106" className="stroke-current" strokeWidth="1.5" opacity="0.4" markerEnd="url(#ts)" />

              <rect x="412" y="80" width="120" height="52" rx="10" className="fill-black/[.05] dark:fill-white/[.08] stroke-black/10 dark:stroke-white/10" strokeWidth="1" />
              <text x="472" y="104" textAnchor="middle" className="fill-current" fontSize="12" fontWeight="600">Build image</text>
              <text x="472" y="120" textAnchor="middle" className="fill-current" fontSize="10" opacity="0.6">artifact</text>

              <line x1="532" y1="106" x2="584" y2="106" className="stroke-current" strokeWidth="1.5" opacity="0.4" markerEnd="url(#ts)" />

              <rect x="586" y="72" width="150" height="68" rx="10" className="fill-[var(--dg-accent,#2563eb)]" opacity="0.06" />
              <rect x="586" y="72" width="150" height="68" rx="10" className="stroke-[var(--dg-accent,#2563eb)]" strokeWidth="2" fill="none" />
              <text x="661" y="98" textAnchor="middle" className="fill-current" fontSize="12" fontWeight="600">ScanRook</text>
              <text x="661" y="115" textAnchor="middle" className="fill-current" fontSize="10" opacity="0.6">CVE gate</text>
              <text x="661" y="129" textAnchor="middle" className="fill-current" fontSize="10" opacity="0.6">(contents)</text>

              <line x1="736" y1="106" x2="784" y2="106" className="stroke-current" strokeWidth="1.5" opacity="0.4" markerEnd="url(#ts)" />
              <text x="792" y="110" textAnchor="end" className="fill-current" fontSize="10" opacity="0.6">deploy</text>

              <text x="410" y="176" textAnchor="middle" className="fill-current" fontSize="11" opacity="0.55">Two gates, two failure classes: bad config vs vulnerable components</text>

              <defs>
                <marker id="ts" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" className="fill-current" opacity="0.5" />
                </marker>
              </defs>
            </svg>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Running Terrascan</h2>
          <p className="text-sm muted">
            The CLI is straightforward. Point it at an IaC type and a directory:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Download the latest policies (first run)
terrascan init

# Scan Terraform in the current directory
terrascan scan -i terraform -d .

# Scan and scope to AWS resource policies
terrascan scan -i terraform -t aws -d ./infra

# Scan Kubernetes manifests, emit SARIF for code scanning
terrascan scan -i k8s -d ./manifests -o sarif > terrascan.sarif`}</pre>
          <p className="text-sm muted">
            The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">-i</code>{" "}
            flag sets the IaC type, <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">-t</code>{" "}
            targets a provider&apos;s policy set, and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">-o</code>{" "}
            selects an output format (human-readable, JSON, YAML, SARIF, JUnit XML). When violations
            are found, Terrascan exits non-zero, which is what lets a CI job fail the pull request.
            A typical result entry names the rule, the severity, and the exact resource and line, so
            the fix is unambiguous.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Beyond the CLI: hooks, server, and admission control</h2>
          <p className="text-sm muted">
            Terrascan runs in more than one shape, which is part of its appeal:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Pre-commit hook.</strong> Catch misconfigurations on the developer&apos;s
              machine before the code is even pushed.
            </li>
            <li>
              <strong>CI step.</strong> The most common placement &mdash; a scan on every pull request
              that touches IaC, failing on new violations.
            </li>
            <li>
              <strong>Server mode.</strong> Run <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">terrascan server</code>{" "}
              to expose an API that other systems can call to evaluate IaC on demand.
            </li>
            <li>
              <strong>Kubernetes admission webhook.</strong> Wire the server up as a validating
              admission controller so the cluster itself rejects non-compliant resources at apply
              time &mdash; a last line of defense if a misconfiguration slips past CI. This pairs
              naturally with the ideas in our{" "}
              <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
                Kubernetes vulnerability scanning guide
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Honest limits and alternatives</h2>
          <p className="text-sm muted">
            Terrascan does one job well, and it is worth being clear about its edges. It finds
            <em>configuration</em> problems; it knows nothing about vulnerable software versions
            inside a container or a package with a published CVE. Static IaC analysis also can only
            reason about what the code declares &mdash; values injected at apply time, or drift after
            deployment, are outside its view. And like any policy-based tool, it produces false
            positives you will need to tune with skips and custom policies.
          </p>
          <p className="text-sm muted">
            It is also not the only option in this space. Checkov, KICS, and Trivy&apos;s
            configuration scanning cover overlapping ground with different policy sets and update
            cadences. Before standardizing, check current maintenance activity and how well each
            tool&apos;s policies cover your particular stack &mdash; the best IaC scanner is the one
            your team keeps green. For grounding on the compliance families these policies map to, see{" "}
            <Link href="/blog/cis-benchmarks-explained" className="underline">
              CIS Benchmarks explained
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits alongside it</h2>
          <p className="text-sm muted">
            Terrascan and ScanRook are complementary, and we are careful not to blur the line.
            Terrascan checks that your infrastructure is <em>defined</em> securely &mdash; encryption
            on, ports closed, least privilege. ScanRook checks that the software you are shipping is
            <em>free of known vulnerabilities</em> &mdash; it reads the actual package databases
            inside a built container and matches installed components against OSV, NVD, and vendor
            advisory data. A perfectly configured deployment of an image full of critical CVEs is
            still a problem, and a pristine image deployed with a wide-open security group is still a
            problem. You need both gates.
          </p>
          <p className="text-sm muted">
            The clean division of labor: run Terrascan on your Terraform and manifests to keep the
            configuration compliant, and run ScanRook on the built image to keep the contents clean.
            The result is coverage of both the &ldquo;how it is deployed&rdquo; and &ldquo;what is
            inside&rdquo; halves of{" "}
            <Link href="/blog/container-image-scanning-guide" className="underline">
              container security
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is Terrascan?</h3>
              <p className="text-sm muted mt-1">
                An open-source static analyzer for Infrastructure as Code (under Tenable) that scans
                Terraform, Kubernetes, Helm, Dockerfiles, and cloud templates for misconfigurations
                using OPA Rego policies.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How does it work?</h3>
              <p className="text-sm muted mt-1">
                It parses IaC into a normalized model and evaluates hundreds of Rego policies against
                it, reporting violations with severity, resource, and line, and exits non-zero when it
                finds them.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does it find CVEs?</h3>
              <p className="text-sm muted mt-1">
                No. Terrascan finds configuration problems, not vulnerable software versions. Pair it
                with an image vulnerability scanner to cover both failure classes.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Terrascan or Checkov?</h3>
              <p className="text-sm muted mt-1">
                Both are capable open-source IaC scanners. Terrascan uses OPA and ships an admission
                webhook; Checkov has a very large built-in policy set. Compare maintenance and policy
                coverage for your stack.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan the config and the contents</h3>
          <p className="text-sm muted leading-relaxed">
            Terrascan keeps your Infrastructure as Code compliant. ScanRook keeps the image you deploy
            free of known CVEs &mdash; matching installed packages against OSV, NVD, and vendor
            advisories. Run both gates and cover the whole picture.
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
            <Link href="/blog/kube-bench-cis-scanning" className="underline">
              kube-bench: CIS Scanning for Kubernetes
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              Kubernetes Vulnerability Scanning Guide
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
