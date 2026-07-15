import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-09";

const title = `Trivy Operator: Continuous Scanning Inside Kubernetes | ${APP_NAME}`;
const description =
  "The Trivy Operator continuously scans Kubernetes workloads and writes vulnerability, config, and secret reports as CRDs. How to install and use it.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "trivy operator",
    "trivy operator kubernetes",
    "trivy operator install",
    "trivy operator helm",
    "vulnerabilityreport crd",
    "aqua trivy operator",
    "kubernetes continuous scanning",
    "trivy operator vs starboard",
    "trivy operator prometheus",
    "in-cluster vulnerability scanning",
  ],
  alternates: { canonical: "/blog/trivy-operator-kubernetes" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/trivy-operator-kubernetes",
    images: ["/blog/trivy-operator-kubernetes.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/trivy-operator-kubernetes.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Trivy Operator: Continuous Scanning Inside Kubernetes",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/trivy-operator-kubernetes",
  image: "https://scanrook.io/blog/trivy-operator-kubernetes.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the Trivy Operator?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Trivy Operator is a Kubernetes operator from Aqua Security that continuously scans the workloads running in a cluster. It watches resources like Deployments and DaemonSets, runs Trivy scans automatically, and stores the results as custom resources such as VulnerabilityReport and ConfigAuditReport. It is the successor to the earlier Starboard project.",
      },
    },
    {
      "@type": "Question",
      name: "How do I install the Trivy Operator?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The recommended path is Helm. Add the Aqua Security Helm repository, then install the trivy-operator chart into a dedicated namespace. It can also be installed from static manifests. Once running, the operator reconciles existing workloads and begins producing reports without any further action.",
      },
    },
    {
      "@type": "Question",
      name: "What reports does the Trivy Operator produce?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The operator generates several custom resources: VulnerabilityReport for image CVEs, ExposedSecretReport for secrets baked into images, ConfigAuditReport for workload misconfigurations, RbacAssessmentReport and InfraAssessmentReport for cluster posture, SbomReport for software bills of materials, and ClusterComplianceReport for frameworks like the CIS Kubernetes Benchmark and NSA hardening guidance.",
      },
    },
    {
      "@type": "Question",
      name: "Does the Trivy Operator find more vulnerabilities than the Trivy CLI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The operator runs the same Trivy scanning engine, so its finding depth matches the Trivy CLI for a given image. Its value is continuous, automated, in-cluster coverage and Kubernetes-native reporting, not deeper detection. If you need broader multi-source coverage, that is a scanner-engine question, not an operator question.",
      },
    },
    {
      "@type": "Question",
      name: "Does the Trivy Operator block vulnerable images from deploying?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not by itself. The operator observes and reports on workloads that are already scheduled; it does not act as an admission gate. To prevent a vulnerable image from being admitted, you pair scanning with an admission controller such as Kyverno or a CI gate that scans before the image reaches the cluster.",
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
            Trivy Operator: Continuous Scanning Inside Kubernetes
          </h1>
          <p className="text-sm muted">Published August 9, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Scanning an image once in CI tells you it was clean the day you built it. The Trivy
            Operator answers a different question: what is running in my cluster <em>right now</em>,
            and has a new advisory made any of it vulnerable since? This is how the operator works,
            how to install it, and where its coverage begins and ends.
          </p>
        </header>

        <img
          src="/blog/trivy-operator-kubernetes.jpg"
          alt="Trivy Operator generating vulnerability reports inside a Kubernetes cluster"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What the Trivy Operator does</h2>
          <p className="text-sm muted">
            The Trivy Operator is an open-source Kubernetes operator from Aqua Security, and the
            successor to the Starboard project. It follows the standard operator pattern: it watches
            cluster resources, and when it sees a workload it has not scanned &mdash; or one whose
            image has changed &mdash; it schedules a scan job, runs Trivy, and writes the result back
            into the cluster as a custom resource.
          </p>
          <p className="text-sm muted">
            The key idea is that security findings become first-class Kubernetes objects. Instead of a
            report sitting in a CI artifact somewhere, a{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">VulnerabilityReport</code>{" "}
            lives next to the Deployment it describes, queryable with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kubectl</code>{" "}
            and consumable by anything that speaks to the Kubernetes API. Because the operator
            re-reconciles, findings update as the Trivy database learns about new CVEs, even for images
            that have not been rebuilt.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Installing it with Helm</h2>
          <p className="text-sm muted">
            The supported install path is the official Helm chart. This drops the operator into its
            own namespace and starts it reconciling immediately:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`helm repo add aqua https://aquasecurity.github.io/helm-charts/
helm repo update

helm install trivy-operator aqua/trivy-operator \\
  --namespace trivy-system \\
  --create-namespace \\
  --set="trivy.ignoreUnfixed=true" \\
  --set="operator.scannerReportTTL=24h"`}</pre>
          <p className="text-sm muted">
            Two settings worth knowing from the start:{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">trivy.ignoreUnfixed=true</code>{" "}
            hides CVEs with no available fix so reports stay actionable, and{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">operator.scannerReportTTL</code>{" "}
            controls how long reports live before the operator refreshes them. In large clusters you
            also point the operator at a shared Trivy server so every scan job does not re-download
            the vulnerability database.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Reading the reports</h2>
          <p className="text-sm muted">
            Once the operator has reconciled, the reports are ordinary Kubernetes objects. List the
            vulnerability reports across all namespaces and drill into one:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Every image scanned, with a severity breakdown per report
kubectl get vulnerabilityreports -A \\
  -o custom-columns=NS:.metadata.namespace,\\
NAME:.metadata.name,\\
CRIT:.report.summary.criticalCount,\\
HIGH:.report.summary.highCount

# Full detail for a single report
kubectl get vulnerabilityreport -n default \\
  replicaset-web-6d4cbf-web -o json | jq '.report.summary'`}</pre>
          <p className="text-sm muted">
            The other report types work the same way. A quick tour:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Custom resource</th>
                  <th className="text-left py-2 font-semibold">What it reports</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top font-mono text-xs">VulnerabilityReport</td>
                  <td className="py-2 align-top">CVEs in the image packages, by severity</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top font-mono text-xs">ExposedSecretReport</td>
                  <td className="py-2 align-top">Secrets and keys baked into image layers</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top font-mono text-xs">ConfigAuditReport</td>
                  <td className="py-2 align-top">Workload misconfigurations (runs as root, no limits)</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top font-mono text-xs">RbacAssessmentReport</td>
                  <td className="py-2 align-top">Over-permissive roles and bindings</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top font-mono text-xs">SbomReport</td>
                  <td className="py-2 align-top">A software bill of materials per image</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top font-mono text-xs">ClusterComplianceReport</td>
                  <td className="py-2 align-top">CIS Kubernetes Benchmark, NSA, and PSS mappings</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Wiring it into Prometheus and Grafana</h2>
          <p className="text-sm muted">
            The operator exposes the report data as Prometheus metrics, which is what makes it useful
            beyond ad-hoc <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kubectl</code>{" "}
            checks. With metrics enabled you can alert when a namespace crosses a critical-count
            threshold or graph vulnerability trends over time:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Enable the ServiceMonitor for a Prometheus Operator stack
helm upgrade trivy-operator aqua/trivy-operator \\
  --namespace trivy-system \\
  --set="serviceMonitor.enabled=true"

# Example PromQL: total critical CVEs across the cluster
sum(trivy_image_vulnerabilities{severity="Critical"})`}</pre>
          <p className="text-sm muted">
            From there a Grafana dashboard or an Alertmanager rule turns the reports into something a
            team actually watches, rather than data that only surfaces during an incident review.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What it is good at, and what it is not</h2>
          <p className="text-sm muted">
            The Trivy Operator is a strong fit for one job: continuous, automated, Kubernetes-native
            visibility into what is already running. It requires almost no glue code, reports refresh
            as advisories publish, and everything is queryable through the API you already use. If you
            run Kubernetes and want a standing inventory of workload risk, it earns its place.
          </p>
          <p className="text-sm muted">
            Two honest caveats. First, it observes rather than enforces &mdash; it will happily report
            that a running Pod is riddled with critical CVEs, but it does not stop that Pod from being
            scheduled. Blocking is an admission-control problem, covered in{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              Kubernetes admission control for image scanning
            </Link>
            . Second, it runs the Trivy engine, so it inherits Trivy&apos;s finding depth. In{" "}
            <Link href="/blog/vulnerability-scanner-benchmark-2026" className="underline">
              our 2026 benchmark
            </Link>{" "}
            Trivy reported 10 findings on ubuntu:24.04 where multi-source scanning found 1,365. The
            operator does not change that number &mdash; it is the same scanner, run more often.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            The two tools sit at different points in the lifecycle. The Trivy Operator watches what is
            already deployed; ScanRook scans the artifact before it deploys, in CI or on registry
            push, and does so with multi-source enrichment &mdash; matching every package against
            OSV, NVD, and Red Hat OVAL and reading the real installed-package state inside the image.
            A common pattern is to scan deeply pre-deploy with ScanRook so a vulnerable image never
            ships, and keep the Trivy Operator running in-cluster for continuous drift detection on
            what is already there. If you are weighing scanners head to head, our{" "}
            <Link href="/blog/trivy-alternatives" className="underline">
              Trivy alternatives
            </Link>{" "}
            piece and the{" "}
            <Link href="/compare/trivy" className="underline">
              ScanRook vs Trivy
            </Link>{" "}
            page lay out the tradeoffs.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is the Trivy Operator the same as Starboard?</h3>
              <p className="text-sm muted mt-1">
                It is the successor. Starboard was Aqua&apos;s earlier project for storing security
                findings as Kubernetes resources; the Trivy Operator replaced it with a cleaner
                operator design and is where active development happens.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How much load does it add to a cluster?</h3>
              <p className="text-sm muted mt-1">
                Each scan is a short-lived Job, so load is bursty rather than constant. In large
                clusters you tune concurrency, set a report TTL, and use a shared Trivy server so scan
                jobs reuse one vulnerability database instead of each downloading their own.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can it scan private registry images?</h3>
              <p className="text-sm muted mt-1">
                Yes. The operator reads the imagePullSecrets attached to the workloads it scans, so
                images from private registries are handled with the same credentials the cluster
                already uses to pull them.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does it generate SBOMs?</h3>
              <p className="text-sm muted mt-1">
                Yes. With SBOM generation enabled, the operator produces an SbomReport per image
                alongside the vulnerability data, which you can export in CycloneDX format for audit
                or compliance workflows.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Catch it before it deploys, watch it after</h3>
          <p className="text-sm muted leading-relaxed">
            Continuous in-cluster reporting is half the picture. ScanRook scans the artifact before it
            reaches the cluster with multi-source enrichment, so a vulnerable image never ships &mdash;
            every finding tagged by source and confidence tier.
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
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              Kubernetes Vulnerability Scanning Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/trivy-alternatives" className="underline">
              Trivy Alternatives in 2026
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              Kubernetes Admission Control for Image Scanning
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
