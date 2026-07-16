import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-20";

const title = `Tekton Pipelines: Container Scanning in Cloud-Native CI/CD | ${APP_NAME}`;
const description =
  "Tekton is a Kubernetes-native CI/CD framework built from Tasks and Pipelines. How it works, how to add a container scanning Task, and where ScanRook fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "tekton",
    "tekton pipelines",
    "tekton ci/cd",
    "kubernetes native ci/cd",
    "tekton task",
    "tekton container scanning",
    "tekton vulnerability scanning",
    "tekton chains",
    "tekton triggers",
    "cloud native ci cd",
  ],
  alternates: { canonical: "/blog/tekton" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/tekton",
    images: ["/blog/tekton.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/tekton.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Tekton Pipelines: Container Scanning in Cloud-Native CI/CD",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/tekton",
  image: "https://scanrook.io/blog/tekton.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Tekton?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tekton is an open-source, Kubernetes-native framework for building CI/CD systems. It defines pipelines as Kubernetes custom resources — Tasks and Pipelines — where every step runs as a container in a Pod. Originally part of Knative, Tekton is now governed by the Continuous Delivery Foundation and is the engine behind products like Red Hat OpenShift Pipelines.",
      },
    },
    {
      "@type": "Question",
      name: "How is Tekton different from Jenkins or GitHub Actions?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tekton has no central controller or hosted runners. Every Task runs as a Pod on your Kubernetes cluster, and pipelines are declarative YAML resources you apply with kubectl. That makes Tekton portable across clusters and vendors, but it also means you operate the control plane yourself rather than consuming a managed service like GitHub Actions.",
      },
    },
    {
      "@type": "Question",
      name: "How do you add vulnerability scanning to a Tekton pipeline?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Add a Task that runs a scanner against the image your build produced, reading it from a shared Workspace, then place that Task after the build Task with runAfter. The scan Task exits non-zero when findings exceed your severity threshold, which fails the PipelineRun and stops the image from being pushed or deployed.",
      },
    },
    {
      "@type": "Question",
      name: "What is Tekton Chains?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tekton Chains is a component that observes completed TaskRuns and PipelineRuns and generates signed, in-toto provenance attestations describing how an artifact was built. It gives you supply-chain evidence aligned with SLSA. Chains records how an image was built; a scanner tells you what is inside it — the two are complementary.",
      },
    },
    {
      "@type": "Question",
      name: "Does ScanRook replace Tekton?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Tekton orchestrates your build and deployment steps; ScanRook is a scanner you invoke from one of those steps. ScanRook runs inside a Tekton Task, scans the image tarball your pipeline just built, and returns findings and an exit code the pipeline can gate on. Tekton owns the workflow; ScanRook owns the vulnerability analysis of the artifact.",
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
            Tekton Pipelines: Container Scanning in Cloud-Native CI/CD
          </h1>
          <p className="text-sm muted">Published September 20, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Tekton turns your Kubernetes cluster into a CI/CD engine: pipelines are just custom
            resources, and every step runs as a container. That model makes it a natural place to
            add vulnerability scanning &mdash; the same cluster that builds your image can scan it
            before it ships. Here is how Tekton is put together, and how to wire a scan into a
            pipeline so a critical CVE fails the build instead of reaching production.
          </p>
        </header>

        <img
          src="/blog/tekton.jpg"
          alt="Tekton pipelines and container scanning"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Tekton actually is</h2>
          <p className="text-sm muted">
            Tekton is an open-source framework for building CI/CD systems, and it is
            Kubernetes-native in the strict sense: it has no separate server, no bespoke agents, and
            no proprietary config language. Pipelines are defined as Kubernetes custom resources and
            applied with <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kubectl</code>,
            and every step of every job runs as a container in an ordinary Pod. It started life
            inside the Knative project and is now governed by the Continuous Delivery Foundation. If
            you have used Red Hat OpenShift Pipelines, you have used Tekton &mdash; that product is a
            packaged distribution of it.
          </p>
          <p className="text-sm muted">
            The appeal is portability. Because a pipeline is just YAML plus containers, the same
            definition runs on any conformant Kubernetes cluster, on-prem or in any cloud, with no
            vendor lock-in to a hosted runner. The tradeoff is that you run the control plane
            yourself: Tekton is a toolkit for building a CI/CD system, not a managed service like
            GitHub Actions or GitLab CI.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The building blocks</h2>
          <p className="text-sm muted">
            Tekton is worth learning as a small set of custom resources that compose:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Step</strong> &mdash; a single container that runs a command. Steps are the
              atoms of Tekton.
            </li>
            <li>
              <strong>Task</strong> &mdash; an ordered sequence of Steps that share a Pod. A Task is
              the reusable unit; &ldquo;clone a repo,&rdquo; &ldquo;build an image,&rdquo; and
              &ldquo;scan an image&rdquo; are each a Task.
            </li>
            <li>
              <strong>Pipeline</strong> &mdash; a set of Tasks with an execution order expressed
              through <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">runAfter</code>{" "}
              and data dependencies. Pipelines pass parameters and results between Tasks.
            </li>
            <li>
              <strong>TaskRun / PipelineRun</strong> &mdash; the execution records. Applying a
              PipelineRun is what actually starts a build; it references a Pipeline and binds
              parameters and Workspaces.
            </li>
            <li>
              <strong>Workspace</strong> &mdash; a shared volume that lets Tasks hand files to each
              other. The clone Task writes source into a Workspace; the build Task reads it; the
              scan Task reads the image the build produced.
            </li>
          </ul>
          <p className="text-sm muted">
            Around that core sit three components you will meet quickly. <strong>Tekton Triggers</strong>{" "}
            turns inbound events (a Git webhook, for example) into PipelineRuns via an EventListener.
            The <strong>Tekton Hub</strong> and Artifact Hub publish reusable community Tasks such as{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">git-clone</code>{" "}
            and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kaniko</code>.
            And <strong>Tekton Chains</strong> watches completed runs and emits signed provenance,
            which we will come back to.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A pipeline, drawn out</h2>
          <p className="text-sm muted">
            A typical build-and-ship pipeline is a chain of Tasks over one shared Workspace. The scan
            Task sits between build and push, so nothing reaches a registry until it has been checked:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 720 160"
              role="img"
              aria-label="Tekton pipeline: git-clone, then build, then scan, then push, all sharing one workspace; the scan task gates the push"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <defs>
                <marker id="tk-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              {[
                { x: 8, label: "git-clone", sub: "fetch source" },
                { x: 186, label: "build", sub: "kaniko → tar" },
                { x: 364, label: "scan", sub: "ScanRook", hot: true },
                { x: 542, label: "push", sub: "to registry" },
              ].map((b) => (
                <g key={b.label}>
                  <rect
                    x={b.x}
                    y={26}
                    width={150}
                    height={56}
                    rx={8}
                    fill={b.hot ? "var(--dg-accent,#2563eb)" : "transparent"}
                    fillOpacity={b.hot ? 0.12 : 1}
                    stroke="currentColor"
                    strokeOpacity={0.5}
                  />
                  <text x={b.x + 75} y={50} textAnchor="middle" fontSize="15" fontWeight="600" fill="currentColor">
                    {b.label}
                  </text>
                  <text x={b.x + 75} y={70} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.6}>
                    {b.sub}
                  </text>
                </g>
              ))}
              {[166, 344, 522].map((x) => (
                <line
                  key={x}
                  x1={x}
                  y1={54}
                  x2={x + 18}
                  y2={54}
                  stroke="currentColor"
                  strokeWidth={2}
                  markerEnd="url(#tk-arrow)"
                />
              ))}
              <rect x={8} y={104} width={684} height={30} rx={6} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.25} />
              <text x={350} y={123} textAnchor="middle" fontSize="12" fill="currentColor" fillOpacity={0.7}>
                shared Workspace (source in, image tarball out)
              </text>
            </svg>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why scan inside Tekton</h2>
          <p className="text-sm muted">
            Scanning in the pipeline is the shift-left move: you learn an image is vulnerable at the
            moment it is built, by the person who can fix it, instead of when it is already running
            in a cluster. Because Tekton runs on Kubernetes, the scan happens on the same
            infrastructure as the build, with no external service to authorize and no image to push
            somewhere just to have it analyzed. And because the pipeline can read the scanner&apos;s
            exit code, the check is enforceable &mdash; a failed scan stops the run rather than
            emitting a warning nobody reads. The same idea applies at deploy time with{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              Kubernetes admission control
            </Link>
            ; the pipeline gate and the admission gate reinforce each other.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A scanning Task</h2>
          <p className="text-sm muted">
            Here is a Task that scans an image tarball sitting in the Workspace and fails when
            critical findings are present. It installs the ScanRook CLI in a step and reads the
            summary with <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">jq</code>:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`apiVersion: tekton.dev/v1
kind: Task
metadata:
  name: scan-image
spec:
  params:
    - name: image-tar
      description: Image tarball to scan, relative to the workspace
      default: image.tar
    - name: fail-on-critical
      default: "true"
  workspaces:
    - name: source
  steps:
    - name: scan
      image: debian:12-slim
      workingDir: $(workspaces.source.path)
      script: |
        #!/usr/bin/env bash
        set -euo pipefail
        apt-get update
        apt-get install -y --no-install-recommends curl ca-certificates jq
        curl -fsSL https://scanrook.io/install.sh | sh
        scanrook scan --file "$(params.image-tar)" --format json --out report.json
        crit=$(jq '.summary.critical // 0' report.json)
        echo "Critical findings: $crit"
        if [ "$(params.fail-on-critical)" = "true" ] && [ "$crit" -gt 0 ]; then
          echo "Failing build: critical vulnerabilities present"
          exit 1
        fi`}</pre>
          <p className="text-sm muted">
            The important detail is the non-zero <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">exit 1</code>.
            When a Step exits non-zero the TaskRun fails, which fails the PipelineRun, which stops
            any downstream push Task from running. That is the whole enforcement mechanism &mdash; no
            plugin, no policy server, just an exit code. The report JSON stays in the Workspace so a
            later Task can archive it as a build artifact.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Wiring it into a Pipeline</h2>
          <p className="text-sm muted">
            The Pipeline orders the Tasks and shares one Workspace between them. Your build Task
            should write the image as a tarball into that Workspace &mdash; kaniko can do this with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--no-push --tar-path</code>,
            or a plain <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker save</code>{" "}
            step will do:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`apiVersion: tekton.dev/v1
kind: Pipeline
metadata:
  name: build-scan-push
spec:
  params:
    - name: repo-url
    - name: image
  workspaces:
    - name: shared
  tasks:
    - name: fetch
      taskRef:
        name: git-clone
      workspaces:
        - name: output
          workspace: shared
      params:
        - name: url
          value: $(params.repo-url)
    - name: build
      runAfter: [fetch]
      taskRef:
        name: kaniko            # writes image.tar into the workspace
      workspaces:
        - name: source
          workspace: shared
      params:
        - name: IMAGE
          value: $(params.image)
    - name: scan
      runAfter: [build]
      taskRef:
        name: scan-image
      workspaces:
        - name: source
          workspace: shared
    - name: push
      runAfter: [scan]          # only runs if scan passed
      taskRef:
        name: skopeo-push
      workspaces:
        - name: source
          workspace: shared
      params:
        - name: IMAGE
          value: $(params.image)`}</pre>
          <p className="text-sm muted">
            The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">runAfter: [scan]</code>{" "}
            on the push Task is the gate: Tekton will not schedule the push until the scan Task has
            completed successfully. If you would rather scan without blocking at first &mdash; a
            sensible way to introduce the check &mdash; set{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">fail-on-critical</code>{" "}
            to <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">false</code>,
            watch the reports for a week, then flip it on. The broader mechanics of gating a build on
            severity are covered in our{" "}
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              guide to scanning Docker images
            </Link>{" "}
            and the{" "}
            <Link href="/blog/container-image-scanning-guide" className="underline">
              container image scanning guide
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Tekton Chains and where ScanRook fits</h2>
          <p className="text-sm muted">
            It is worth being precise about what each tool owns. Tekton orchestrates the workflow.
            Tekton Chains, if you enable it, records <em>how</em> an artifact was built &mdash; it
            observes completed runs and produces signed in-toto provenance you can verify against the
            SLSA framework. A scanner answers a different question: <em>what is inside</em> the
            artifact, and is any of it known to be vulnerable. Provenance and vulnerability data are
            complementary halves of a supply-chain story; neither substitutes for the other.
          </p>
          <p className="text-sm muted">
            ScanRook is the second half. It runs as an ordinary Step in a Tekton Task, scans the
            image tarball your pipeline produced, and returns findings plus an exit code the pipeline
            gates on. Under the hood it matches the installed packages against OSV, NVD, and Red Hat
            OVAL in parallel and reads the actual package databases in the image, so the report
            reflects what is really installed rather than a filename guess &mdash; the reasoning
            behind that is in{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning vs advisory matching
            </Link>
            . ScanRook does not replace Tekton, and it does not need to: it slots into the pipeline
            you already run, scans the artifact you already build, and hands the decision back to
            Tekton to enforce.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is Tekton?</h3>
              <p className="text-sm muted mt-1">
                An open-source, Kubernetes-native CI/CD framework. Pipelines are custom resources and
                every step runs as a container in a Pod. It is governed by the Continuous Delivery
                Foundation.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How is it different from GitHub Actions?</h3>
              <p className="text-sm muted mt-1">
                Tekton has no hosted runners or central server &mdash; you run the control plane on
                your own cluster. That buys portability across clouds at the cost of operating it
                yourself.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I add scanning?</h3>
              <p className="text-sm muted mt-1">
                Add a Task that scans the built image from a shared Workspace, place it after the
                build with runAfter, and let a non-zero exit code fail the PipelineRun before the
                push.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is Tekton Chains?</h3>
              <p className="text-sm muted mt-1">
                A component that emits signed, SLSA-aligned provenance for completed runs. It records
                how an image was built; a scanner tells you what is inside it.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Put a real gate in your pipeline</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook runs as a single Step in a Tekton Task, scans the image your build produced, and
            returns an exit code your pipeline enforces &mdash; with every finding tagged by source
            and confidence so you can gate on what is real.
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
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              Scan Docker Images in GitHub Actions
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              Kubernetes Admission Control for Image Scanning
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-image-scanning-guide" className="underline">
              Container Image Scanning Guide
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
