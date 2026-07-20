import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-29";

const title = `Kubescape: Kubernetes Security Posture Scanning | ${APP_NAME}`;
const description =
  "What Kubescape does, how its control frameworks and CVE scanning work, how to run it in CI and in-cluster, and where it overlaps with image scanners like ScanRook.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "kubescape",
    "kubescape scan",
    "kubernetes security posture",
    "kubescape nsa framework",
    "kubescape mitre",
    "kubernetes misconfiguration scanning",
    "kubescape operator",
    "kubescape vs kube-bench",
    "cncf kubescape",
    "kubernetes compliance scanning",
  ],
  alternates: { canonical: "/blog/kubescape" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/kubescape",
    images: ["/blog/kubescape.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/kubescape.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Kubescape: Kubernetes Security Posture Scanning Explained",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/kubescape",
  image: "https://scanrook.io/blog/kubescape.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Kubescape?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Kubescape is an open-source Kubernetes security platform, donated to the CNCF, that scans clusters and manifests against control frameworks such as the NSA/CISA Kubernetes hardening guidance, MITRE ATT&CK for Kubernetes, and CIS benchmarks. It also performs image vulnerability scanning and RBAC analysis, and can run either as a one-shot CLI or as an in-cluster operator.",
      },
    },
    {
      "@type": "Question",
      name: "How do I run a Kubescape scan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The simplest form is `kubescape scan` against the cluster your current kubeconfig context points at, which evaluates every workload against the default framework set and prints a scored summary. You can also scan static YAML with `kubescape scan path/to/manifests/`, target a specific framework with `--submit=false kubescape scan framework nsa`, and gate CI with `--fail-threshold`.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between Kubescape and kube-bench?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "kube-bench checks the cluster's own components against the CIS Kubernetes Benchmark: API server flags, kubelet configuration, etcd permissions. Kubescape has broader scope, covering workload manifests, RBAC, and image vulnerabilities across several frameworks, and can scan YAML before it is ever applied. Many teams run both because they answer different questions.",
      },
    },
    {
      "@type": "Question",
      name: "Does Kubescape replace an image vulnerability scanner?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Only partly. Kubescape includes image vulnerability scanning so it can report CVEs alongside posture findings, but its centre of gravity is configuration and posture. If your primary need is deep package-level CVE analysis of build artifacts, a dedicated artifact scanner will generally read installed state more thoroughly and consult more advisory sources.",
      },
    },
    {
      "@type": "Question",
      name: "Can Kubescape run continuously in a cluster?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Alongside the CLI, Kubescape ships an in-cluster operator installed via Helm that runs scheduled posture and vulnerability scans and exposes results as Kubernetes custom resources. That model suits ongoing drift detection, whereas the CLI suits pull-request gates and ad-hoc audits.",
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
            Kubescape: Kubernetes Security Posture Scanning Explained
          </h1>
          <p className="text-sm muted">Published October 29, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Kubescape is an open-source Kubernetes security platform that answers a question most
            image scanners cannot: not &ldquo;what CVEs are in this container?&rdquo; but &ldquo;is
            this cluster configured in a way that lets a compromised container matter?&rdquo; It
            evaluates manifests and live clusters against published hardening frameworks and returns
            a scored, prioritised list of what is wrong. Here is how it works, how to run it, and
            where it sits relative to the other tools in a Kubernetes security stack.
          </p>
        </header>

        <img
          src="/blog/kubescape.jpg"
          alt="Kubescape scanning a Kubernetes cluster for security posture and misconfiguration findings"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Kubescape does</h2>
          <p className="text-sm muted">
            Kubescape started at ARMO and was contributed to the CNCF, where it sits alongside the
            other Kubernetes-native security projects. Its core loop is straightforward: collect
            Kubernetes objects &mdash; from a live cluster via the API server, or from YAML files, or
            from a Helm chart rendering &mdash; then evaluate each object against a library of
            <em> controls</em>, and group those controls into <em>frameworks</em>.
          </p>
          <p className="text-sm muted">
            A control is a single, specific check with a rationale and a remediation: &ldquo;this
            container runs as root,&rdquo; &ldquo;this service account token is automounted and not
            used,&rdquo; &ldquo;this workload has no resource limits,&rdquo; &ldquo;this role grants
            wildcard verbs on secrets.&rdquo; A framework is a curated set of those controls that
            corresponds to a published standard. Kubescape ships with several, most notably the
            NSA/CISA Kubernetes Hardening Guidance, MITRE ATT&amp;CK mapped to Kubernetes techniques,
            and CIS benchmark coverage. Running against a framework tells you where you stand against
            an external reference rather than against one vendor&apos;s opinion, which matters a lot
            when the output has to survive an audit conversation.
          </p>
          <p className="text-sm muted">
            Beyond posture, Kubescape also does image vulnerability scanning and RBAC analysis, and
            supports scanning at several points in the lifecycle. That breadth is deliberate &mdash;
            the project positions itself as the single Kubernetes security tool rather than one
            component &mdash; and it is also the main thing to think carefully about when deciding
            what else you need.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where a Kubescape scan fits</h2>
          <p className="text-sm muted">
            Kubernetes security tooling breaks into layers, and confusion about which tool covers
            which layer is the most common reason teams end up with both redundancy and gaps:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 280"
              role="img"
              aria-label="Layer diagram of Kubernetes security tooling: cluster component configuration, workload posture, admission control, image contents, and runtime behaviour, with Kubescape spanning workload posture and image contents"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              {[
                { y: 12, label: "Cluster components", sub: "API server flags, kubelet, etcd", tool: "kube-bench" },
                { y: 66, label: "Workload posture", sub: "manifests, RBAC, service accounts", tool: "Kubescape", hot: true },
                { y: 120, label: "Admission control", sub: "policy enforced at apply time", tool: "Gatekeeper / Kyverno" },
                { y: 174, label: "Image contents", sub: "packages and their CVEs", tool: "artifact scanners", hot: true },
                { y: 228, label: "Runtime behaviour", sub: "syscalls, process activity", tool: "Falco / eBPF" },
              ].map((r) => (
                <g key={r.label}>
                  <rect
                    x={8}
                    y={r.y}
                    width={470}
                    height={44}
                    rx={7}
                    fill={r.hot ? "var(--dg-accent,#2563eb)" : "currentColor"}
                    fillOpacity={r.hot ? 0.12 : 0.04}
                    stroke="currentColor"
                    strokeOpacity={r.hot ? 0.55 : 0.28}
                  />
                  <text x={24} y={r.y + 20} fontSize="13" fontWeight="600" fill="currentColor">
                    {r.label}
                  </text>
                  <text x={24} y={r.y + 36} fontSize="10.5" fill="currentColor" fillOpacity={0.62}>
                    {r.sub}
                  </text>
                  <text x={496} y={r.y + 28} fontSize="11" fill="currentColor" fillOpacity={0.72}>
                    {r.tool}
                  </text>
                </g>
              ))}
            </svg>
            <figcaption className="text-xs muted mt-2">
              The layers of Kubernetes security tooling. Kubescape&apos;s strongest coverage is
              workload posture; it also reaches into image contents, which is where it overlaps with
              dedicated artifact scanners.
            </figcaption>
          </div>
          <p className="text-sm muted">
            If you have read our{" "}
            <Link href="/blog/kubernetes-vulnerability-scanning-guide" className="underline">
              Kubernetes vulnerability scanning guide
            </Link>
            , this is the same map. The practical takeaway is that no single tool covers all five
            rows well, and Kubescape is strongest in the second.
          </p>
        </section>

        <img
          src="/blog/kubescape-2.jpg"
          alt="Kubescape control framework evaluation across Kubernetes workload configuration layers"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Running Kubescape</h2>
          <p className="text-sm muted">
            The CLI is a single binary and the default scan needs no arguments beyond a working
            kubeconfig context:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`# Scan the cluster your current context points at
kubescape scan

# Scan static manifests before they are ever applied
kubescape scan path/to/manifests/

# Scan against a specific framework
kubescape scan framework nsa

# Machine-readable output for downstream processing
kubescape scan --format json --output kubescape-results.json`}
          </pre>
          <p className="text-sm muted">
            The default output is a control-by-control table with a compliance score and, critically,
            the list of resources that failed each control. That resource list is what makes the
            output actionable &mdash; a score on its own tells you nothing about what to change on
            Monday morning.
          </p>
          <p className="text-sm muted">
            For CI, the important flag is the failure threshold. Kubescape can exit non-zero when the
            compliance score falls below a value or when findings above a given severity are present,
            which is what lets you gate a pull request:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`# Fail the job if the compliance score drops below 80
kubescape scan path/to/manifests/ \\
  --format json \\
  --output results.json \\
  --fail-threshold 80`}
          </pre>
          <p className="text-sm muted">
            Two warnings from experience. First, run against static manifests in CI, not against a
            cluster &mdash; CI credentials with cluster read access are a liability, and manifest
            scanning gives faster, more deterministic feedback. Second, set the threshold at your
            current score and ratchet it upward, rather than picking an aspirational number that
            makes every build red on day one. A gate everyone learns to ignore is worse than no gate.
          </p>
          <p className="text-sm muted">
            For continuous coverage, the in-cluster operator installs via Helm and runs scheduled
            scans, storing results as custom resources you can query with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kubectl</code>{" "}
            or export to a dashboard. That is the right model for drift detection: manifests in Git
            drift from what is actually running more often than anyone expects.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Kubescape next to the adjacent tools
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Tool</th>
                  <th className="text-left py-2 pr-4 font-semibold">Answers</th>
                  <th className="text-left py-2 font-semibold">Best used for</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Kubescape</strong></td>
                  <td className="py-2 pr-4 align-top">Is this workload configured safely, per NSA/MITRE/CIS?</td>
                  <td className="py-2 align-top">Posture scoring, manifest gates, framework reporting</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>kube-bench</strong></td>
                  <td className="py-2 pr-4 align-top">Are the cluster components themselves CIS-compliant?</td>
                  <td className="py-2 align-top">Control-plane and node hardening audits</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Gatekeeper / Kyverno</strong></td>
                  <td className="py-2 pr-4 align-top">Should this object be allowed into the cluster at all?</td>
                  <td className="py-2 align-top">Enforcement, not reporting</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top"><strong>Artifact scanners</strong></td>
                  <td className="py-2 pr-4 align-top">Which vulnerable packages ship inside the image?</td>
                  <td className="py-2 align-top">Deep package-level CVE analysis of builds</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            The distinction between the second and third rows is worth internalising. Kubescape{" "}
            <em>reports</em>; an admission controller like{" "}
            <Link href="/blog/opa-gatekeeper" className="underline">
              OPA Gatekeeper
            </Link>{" "}
            <em>enforces</em>. Reporting tells you the truth about what exists. Enforcement stops the
            next bad object from being created. Teams that only report accumulate findings; teams
            that only enforce never learn what they already have. You want both, and typically in
            that order &mdash; scan to understand, then enforce to hold the line. The same argument
            appears in our piece on{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              admission control and image scanning
            </Link>
            .
          </p>
          <p className="text-sm muted">
            For the CIS side specifically, our{" "}
            <Link href="/blog/kube-bench-cis-scanning" className="underline">
              kube-bench guide
            </Link>{" "}
            covers what control-plane auditing looks like, and{" "}
            <Link href="/blog/pod-security-standards-guide" className="underline">
              Pod Security Standards
            </Link>{" "}
            covers the built-in enforcement that ships with Kubernetes itself and often removes the
            need for custom policy.
          </p>
        </section>

        <img
          src="/blog/kubescape-3.jpg"
          alt="Kubescape manifest scanning integrated as a CI pipeline gate before deployment"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Getting useful results out of Kubescape
          </h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Pick one framework and finish it.</strong> Scanning against everything at once
              produces a wall of findings with no obvious starting point. The NSA/CISA framework is a
              reasonable default because its controls map cleanly to concrete manifest changes.
            </li>
            <li>
              <strong>Fix by control, not by resource.</strong> A single control failing across forty
              workloads is usually one templating change, not forty tickets.
            </li>
            <li>
              <strong>Exclude what you have genuinely accepted.</strong> Kubescape supports exception
              configuration. An exception with a written reason is far better than a permanently
              ignored finding, and it survives staff turnover.
            </li>
            <li>
              <strong>Scan manifests in CI, cluster on a schedule.</strong> The two views disagree
              more often than they should, and the disagreement is itself a finding.
            </li>
            <li>
              <strong>Do not treat the score as the goal.</strong> Compliance scores are a
              communication device for people who do not read YAML. The failing control list is the
              actual work.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook and Kubescape are complements, not substitutes, and we would rather say that
            plainly than pretend otherwise. Kubescape answers configuration questions about a
            cluster. ScanRook answers content questions about an artifact: given this container image
            tarball, binary, or source archive, which packages are actually installed and which of
            them have known vulnerabilities.
          </p>
          <p className="text-sm muted">
            Kubescape does include image vulnerability scanning, and for many teams that is enough.
            Where a dedicated artifact scanner earns its place is depth. ScanRook reads the real
            package databases inside an image rather than inferring from file layout, and matches
            every package against OSV, NVD, and Red Hat OVAL in parallel, tagging each finding with
            its source and a confidence tier so you can tell a distribution-confirmed advisory from a
            version-range guess. In our{" "}
            <Link href="/blog/vulnerability-scanner-benchmark-2026" className="underline">
              2026 benchmark
            </Link>{" "}
            that multi-source approach surfaced substantially more real findings than single-database
            matching. If your posture tooling is Kubescape and your artifact tooling is whatever came
            bundled, the artifact side is usually where the coverage gap is.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is Kubescape?</h3>
              <p className="text-sm muted mt-1">
                A CNCF open-source Kubernetes security platform that scans clusters and manifests
                against control frameworks including NSA/CISA hardening guidance, MITRE ATT&amp;CK
                for Kubernetes, and CIS benchmarks.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I run a scan?</h3>
              <p className="text-sm muted mt-1">
                <code className="text-xs">kubescape scan</code> against your current kubeconfig
                context, or <code className="text-xs">kubescape scan path/to/manifests/</code> for
                static YAML. Add <code className="text-xs">--fail-threshold</code> to gate CI.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Kubescape or kube-bench?</h3>
              <p className="text-sm muted mt-1">
                Both. kube-bench audits the cluster components against CIS; Kubescape audits workload
                configuration, RBAC, and images across several frameworks. They cover different
                layers.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does it replace an image scanner?</h3>
              <p className="text-sm muted mt-1">
                Partly. It reports CVEs alongside posture findings, but a dedicated artifact scanner
                generally reads installed package state more thoroughly and consults more advisory
                sources.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Close the artifact-side gap</h3>
          <p className="text-sm muted leading-relaxed">
            Posture tooling tells you how a workload is configured. It does not tell you what shipped
            inside the image. Scan one of yours with ScanRook and compare &mdash; every finding
            carries its advisory source and a confidence tier.
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
            <Link href="/blog/kube-bench-cis-scanning" className="underline">
              kube-bench and CIS Scanning
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/trivy-operator-kubernetes" className="underline">
              Trivy Operator for Kubernetes
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
