import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-05";

const title = `kube-bench: Scanning Kubernetes Against the CIS Benchmark | ${APP_NAME}`;
const description =
  "kube-bench checks whether your Kubernetes cluster is configured to the CIS Benchmark. How it works, how to run it, what it catches, and what it does not.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "kube-bench",
    "kube-bench cis",
    "kube-bench kubernetes",
    "cis kubernetes benchmark",
    "kubernetes cis scanning",
    "kube-bench install",
    "kube-bench job",
    "kube-bench vs trivy",
    "kubernetes hardening",
    "cis benchmark kubernetes",
  ],
  alternates: { canonical: "/blog/kube-bench-cis-scanning" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/kube-bench-cis-scanning",
    images: ["/blog/kube-bench-cis-scanning.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/kube-bench-cis-scanning.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "kube-bench: Scanning Kubernetes Against the CIS Benchmark",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/kube-bench-cis-scanning",
  image: "https://scanrook.io/blog/kube-bench-cis-scanning.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is kube-bench?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "kube-bench is an open-source tool from Aqua Security that checks whether a Kubernetes deployment is configured according to the CIS Kubernetes Benchmark. It inspects control plane and node configuration files, process arguments, and file permissions, then reports each check as PASS, FAIL, WARN, or INFO with remediation guidance. It is written in Go and driven by version-specific YAML configuration.",
      },
    },
    {
      "@type": "Question",
      name: "Does kube-bench scan container images for CVEs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. kube-bench is a configuration checker, not a vulnerability scanner. It evaluates how the cluster and its nodes are set up against CIS hardening recommendations. It does not open image layers or match installed packages against advisory databases, so it will not tell you that an image ships a vulnerable openssl or log4j. You need a separate image or artifact scanner for that.",
      },
    },
    {
      "@type": "Question",
      name: "How do I run kube-bench on my cluster?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The simplest path is to run it as a Kubernetes Job that mounts the node's host paths, then read the logs. You can also run it as a container with docker run using the host PID namespace, or install the binary directly on a node. kube-bench auto-detects the Kubernetes version and selects the matching CIS benchmark, or you can pin one with the --benchmark flag.",
      },
    },
    {
      "@type": "Question",
      name: "What does a FAIL versus a WARN mean in kube-bench?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A FAIL is an automated check that returned a non-compliant result, such as a file permission that is too broad. A WARN is a check kube-bench cannot fully automate and asks you to verify manually, often because the correct value depends on your environment. INFO items are advisory. Treat FAIL as actionable now and WARN as a review item rather than ignoring it.",
      },
    },
    {
      "@type": "Question",
      name: "Is kube-bench related to Docker Bench for Security?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They are siblings. Docker Bench for Security checks a Docker host against the CIS Docker Benchmark, while kube-bench checks a Kubernetes cluster against the CIS Kubernetes Benchmark. Both are Aqua Security projects that automate a set of CIS configuration recommendations, and both report configuration posture rather than software vulnerabilities.",
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
          <div className="text-xs uppercase tracking-wide muted">Scanning concepts</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            kube-bench: Scanning Kubernetes Against the CIS Benchmark
          </h1>
          <p className="text-sm muted">Published August 5, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            kube-bench is the tool most teams reach for when an auditor asks &ldquo;is this cluster
            hardened to the CIS Benchmark?&rdquo; It is free, open source, and answers a very
            specific question &mdash; but it is easy to mistake it for something it is not. Here is
            what kube-bench actually checks, how to run it, and where it stops.
          </p>
        </header>

        <img
          src="/blog/kube-bench-cis-scanning.jpg"
          alt="kube-bench scanning a Kubernetes cluster against the CIS Benchmark"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What kube-bench is</h2>
          <p className="text-sm muted">
            kube-bench is an open-source project maintained by Aqua Security. It automates the checks
            described in the <strong>CIS Kubernetes Benchmark</strong> &mdash; a consensus set of
            security configuration recommendations published by the Center for Internet Security. In
            plain terms, kube-bench looks at how your cluster is configured and tells you which of
            the CIS recommendations it currently meets.
          </p>
          <p className="text-sm muted">
            It is a Go binary driven by version-specific YAML configuration files. Each file maps a
            release of the CIS Kubernetes Benchmark to concrete tests: read this config file, check
            that flag on this process, verify these file permissions. Because the benchmark differs
            between managed platforms and self-managed clusters, kube-bench ships configs for many
            targets &mdash; generic Kubernetes, plus EKS, GKE, AKS, RKE, and others.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What the CIS Kubernetes Benchmark covers</h2>
          <p className="text-sm muted">
            The benchmark is organized into sections, and kube-bench mirrors them. At a high level
            it evaluates:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Control plane components</strong> &mdash; the flags and file permissions of the
              API server, controller manager, and scheduler, such as whether anonymous auth is
              disabled and whether audit logging is enabled.
            </li>
            <li>
              <strong>etcd</strong> &mdash; whether the datastore is configured with client and peer
              TLS and restricted access.
            </li>
            <li>
              <strong>Control plane configuration</strong> &mdash; authentication, authorization
              modes (RBAC), and logging settings.
            </li>
            <li>
              <strong>Worker nodes</strong> &mdash; kubelet configuration and file permissions, which
              are frequently where real-world clusters drift from the recommendation.
            </li>
            <li>
              <strong>Policies</strong> &mdash; RBAC hygiene, network policy usage, and Pod Security
              Standards adoption. Many of these are WARN-level because they cannot be fully judged
              from configuration alone.
            </li>
          </ul>
          <p className="text-sm muted">
            Notably, this is all about <em>how the cluster is set up</em>. None of it examines the
            software running inside your Pods. For that side of the picture, see our{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              Kubernetes vulnerability scanning guide
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How kube-bench works under the hood</h2>
          <p className="text-sm muted">
            kube-bench needs to see the node the way a local process would. That is why it runs with
            elevated host access: it reads the actual manifests in{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/etc/kubernetes</code>,
            inspects running process arguments through the host PID namespace, and checks file
            ownership and permissions directly on disk. It does not query the Kubernetes API to guess
            at configuration; it examines the machine.
          </p>
          <p className="text-sm muted">
            Each test in the config declares how to gather the evidence (a file to read, a process to
            match) and what a compliant result looks like. kube-bench runs the test, compares the
            result, and emits a verdict plus the remediation text straight from the benchmark. Because
            the logic lives in YAML, you can audit exactly what a check does &mdash; and, when a
            control genuinely does not apply to your environment, skip or override it deliberately.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Running kube-bench as a Job</h2>
          <p className="text-sm muted">
            The most common way to run kube-bench in a real cluster is as a one-shot Job that mounts
            the host paths it needs. Aqua publishes a ready-made manifest:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Run the benchmark as a Job, then read the results from its logs
kubectl apply -f https://raw.githubusercontent.com/aquasecurity/kube-bench/main/job.yaml

# Wait for it to finish, then read the report
kubectl wait --for=condition=complete job/kube-bench --timeout=120s
kubectl logs job/kube-bench`}</pre>
          <p className="text-sm muted">
            On managed platforms you point kube-bench at the right benchmark. For example, on EKS you
            run the node checks with the EKS config, because the control plane is managed by AWS and
            you cannot inspect it:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Pin a benchmark and target only the components you control
kube-bench run --targets node,policies --benchmark eks-1.5.0

# Or let kube-bench auto-detect the Kubernetes version
kube-bench run --targets master,etcd,controlplane,node,policies`}</pre>
          <p className="text-sm muted">
            For a quick check from a workstation with kubectl access, you can also run it as a
            container against the host:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`docker run --rm --pid=host \\
  -v /etc:/etc:ro \\
  -v /var:/var:ro \\
  -t aquasec/kube-bench:latest --benchmark cis-1.9`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Reading the output</h2>
          <p className="text-sm muted">
            kube-bench prints one line per check with a status and the CIS control number, then a
            summary. The four statuses matter:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li><strong>PASS</strong> &mdash; the automated check met the recommendation.</li>
            <li><strong>FAIL</strong> &mdash; the automated check did not meet it. This is your primary work queue.</li>
            <li>
              <strong>WARN</strong> &mdash; kube-bench could not fully automate the check and is asking
              you to verify manually. Do not treat WARN as &ldquo;pass&rdquo;; treat it as
              &ldquo;review.&rdquo;
            </li>
            <li><strong>INFO</strong> &mdash; advisory context with no compliance verdict.</li>
          </ul>
          <p className="text-sm muted">
            For pipelines, emit machine-readable output and gate on it. kube-bench supports JSON and a
            configurable exit code so a failing control can fail a job:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# JSON output, and exit non-zero if any check FAILs
kube-bench run --json --exit-code 1 > kube-bench.json

# Summarize failing checks with jq
jq '[.Controls[].tests[].results[] | select(.status=="FAIL") | .test_number] | length' kube-bench.json`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What kube-bench does not do</h2>
          <p className="text-sm muted">
            This is the part worth being explicit about, because it is where teams build a false sense
            of security. kube-bench answers exactly one question: is the cluster configuration aligned
            with the CIS Kubernetes Benchmark? It says nothing about the vulnerabilities inside the
            images you deploy. A cluster can score a clean kube-bench report while every Pod runs an
            image full of critical CVEs, and kube-bench will never notice &mdash; that is not its job.
          </p>
          <p className="text-sm muted">
            It also does not enforce anything. kube-bench is a point-in-time audit; it reports, it does
            not block. To keep non-compliant or unscanned workloads out of the cluster you need an
            admission layer, which we cover in{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              Kubernetes admission control for image scanning
            </Link>
            . And to keep node and workload configuration hardened beyond the CIS checklist, pair it
            with a broader{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              container security checklist
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            kube-bench and ScanRook answer different halves of &ldquo;is this cluster secure.&rdquo;
            kube-bench audits configuration; ScanRook scans the artifacts you deploy into that
            configuration. Before an image ever reaches the cluster, ScanRook reads the actual
            package databases inside it and matches every component against OSV, NVD, and Red Hat OVAL
            in parallel, tagging each finding with a source and confidence tier. Run kube-bench to
            prove the cluster is set up correctly, and run an artifact scan to prove the software you
            are running into it is not shipping known-vulnerable packages. Neither replaces the other.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is kube-bench free?</h3>
              <p className="text-sm muted mt-1">
                Yes. kube-bench is open source under the Apache-2.0 license and maintained by Aqua
                Security. There is no paid tier to run the benchmark checks.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does kube-bench work on EKS, GKE, and AKS?</h3>
              <p className="text-sm muted mt-1">
                Yes, with the caveat that managed control planes are not accessible to you. On managed
                platforms you run the node and policy targets with the platform-specific benchmark
                (for example eks-1.5.0) and skip the control plane checks the provider owns.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How often should I run kube-bench?</h3>
              <p className="text-sm muted mt-1">
                Treat it as continuous rather than one-off. Configuration drifts as nodes are patched
                and manifests change, so scheduling kube-bench as a recurring Job or a CI step on
                cluster changes catches regressions before an audit does.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can kube-bench fix the failures it finds?</h3>
              <p className="text-sm muted mt-1">
                No. It reports failures and prints the remediation text from the benchmark, but you
                apply the changes yourself &mdash; usually by editing kubelet flags, control plane
                manifests, or file permissions and re-running the scan to confirm.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Harden the config, then scan what you deploy</h3>
          <p className="text-sm muted leading-relaxed">
            kube-bench proves your cluster is configured to the CIS Benchmark. ScanRook proves the
            images you run into it are not shipping known-vulnerable packages &mdash; matched against
            OSV, NVD, and vendor advisory data, with every finding tagged by source and confidence.
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
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              Kubernetes Admission Control for Image Scanning
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
