import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-25";

const title = `Jenkins Security Scan for Docker Images: Full Pipeline | ${APP_NAME}`;
const description =
  "A complete Jenkins pipeline for scanning Docker images: build, save, scan with ScanRook, archive the report, and fail the build on critical or high CVEs.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "jenkins security scan",
    "jenkins security scanning",
    "jenkins pipeline security scan",
    "jenkins container scanning",
    "jenkins docker image scan",
    "jenkins vulnerability scanning",
    "jenkinsfile docker security",
    "fail jenkins build on cve",
    "jenkins ci cd security",
    "jenkins declarative pipeline docker",
  ],
  alternates: { canonical: "/blog/jenkins-container-scanning" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/jenkins-container-scanning",
    images: ["/blog/jenkins-container-scanning.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/jenkins-container-scanning.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Jenkins Security Scan for Docker Images: Full Pipeline",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/jenkins-container-scanning",
  image: "https://scanrook.io/blog/jenkins-container-scanning.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I scan a Docker image in a Jenkins pipeline?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Add a stage that builds the image, exports it with docker save, installs the scanner CLI, and runs it against the tar file. A following stage reads the JSON report with jq and calls error() to fail the build when severity thresholds are exceeded. This fits cleanly into a declarative Jenkinsfile.",
      },
    },
    {
      "@type": "Question",
      name: "Should the scan run on every branch or only on pull request builds?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both, on different schedules. Multibranch pipeline builds on pull requests catch newly introduced vulnerabilities before merge. A separate Jenkins pipeline job on a cron trigger against the main branch catches advisories published after code was already merged, which pull request builds alone would miss.",
      },
    },
    {
      "@type": "Question",
      name: "How do I fail a Jenkins build on critical CVEs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Read severity counts from the JSON report with jq inside a scripted step, then call the Jenkins error() step to fail the stage when the count exceeds your threshold. Marking the stage as a required check in your branch protection or Jenkins job configuration is what actually blocks the merge.",
      },
    },
    {
      "@type": "Question",
      name: "How do I store the NVD API key securely in Jenkins?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use Jenkins Credentials Binding: store the key as a Secret text credential in Jenkins, then reference it in the pipeline with the credentials() helper inside an environment block. This keeps the key out of the Jenkinsfile and out of build logs, unlike an inline environment variable.",
      },
    },
    {
      "@type": "Question",
      name: "Can Jenkins agents cache the scanner's vulnerability data between builds?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, if the agent has persistent workspace or a shared volume. Point the scanner's cache directory at a path outside the ephemeral build workspace, such as a directory on the agent that survives between jobs, so repeated scans skip re-fetching advisory data they already hold.",
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
            Jenkins Security Scan for Docker Images: Full Pipeline
          </h1>
          <p className="text-sm muted">Published July 25, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            A Jenkins security scan stage for your Docker images is straightforward to add and easy
            to get wrong in the details &mdash; credentials handling, agent choice, and what actually
            fails the build. This guide builds a complete declarative Jenkinsfile that builds, scans,
            archives the report, and gates on severity, and explains each stage.
          </p>
        </header>

        <img
          src="/blog/jenkins-container-scanning.jpg"
          alt="Scanning Docker images in a Jenkins pipeline"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why run a Jenkins security scan in the pipeline</h2>
          <p className="text-sm muted">
            Jenkins is often the system of record for what actually got built and deployed, which
            makes it a natural place to attach a security gate: the scan result lives next to the
            build number and the commit that produced it, and a failed stage is a signal every
            downstream job (deploy, promote, release) can check before proceeding.
          </p>
          <p className="text-sm muted">
            The pipeline below follows the same build-artifact pattern used in{" "}
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              our general image-scanning guide
            </Link>{" "}
            and in{" "}
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              the GitHub Actions version of this workflow
            </Link>
            : build the image, export it to a tar with <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker save</code>,
            and scan the artifact you actually produced rather than a registry copy.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The complete Jenkinsfile</h2>
          <p className="text-sm muted">
            Save this as <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">Jenkinsfile</code>{" "}
            at the root of your repository. It requires an agent with Docker available and assumes
            an <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">NVD_API_KEY</code>{" "}
            Secret text credential has been configured in Jenkins:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`pipeline {
  agent { label 'docker' }

  environment {
    NVD_API_KEY = credentials('nvd-api-key')
    IMAGE_TAR   = 'myapp.tar'
  }

  stages {
    stage('Build image') {
      steps {
        sh 'docker build -t myapp:ci .'
        sh "docker save myapp:ci -o \${IMAGE_TAR}"
      }
    }

    stage('Install ScanRook') {
      steps {
        sh 'curl -fsSL https://scanrook.sh/install | sh'
      }
    }

    stage('Scan image') {
      steps {
        sh """
          scanrook scan \\
            --file \${IMAGE_TAR} \\
            --mode deep \\
            --format json \\
            --out report.json
        """
      }
    }

    stage('Archive report') {
      steps {
        archiveArtifacts artifacts: 'report.json', fingerprint: true
      }
    }

    stage('Fail on critical or high CVEs') {
      steps {
        script {
          def critical = sh(script: "jq '.summary.critical // 0' report.json", returnStdout: true).trim()
          def high = sh(script: "jq '.summary.high // 0' report.json", returnStdout: true).trim()
          echo "Critical: \${critical}, High: \${high}"
          if (critical.toInteger() > 0 || high.toInteger() > 0) {
            sh "jq '.findings[] | select(.severity == \\"CRITICAL\\" or .severity == \\"HIGH\\") | {cve, package: .package.name, version: .package.version, severity}' report.json"
            error("Failing build: \${critical} critical and \${high} high severity vulnerabilities found")
          }
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'report.json', allowEmptyArchive: true
    }
  }
}`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What each stage does</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>agent {"{"} label &apos;docker&apos; {"}"}.</strong> The pipeline needs an
              agent with the Docker daemon and CLI available, since ScanRook scans a saved tar file
              rather than a running container. Label your Docker-capable agents accordingly in
              Jenkins node configuration.
            </li>
            <li>
              <strong>Credentials binding.</strong>{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">credentials(&apos;nvd-api-key&apos;)</code>{" "}
              pulls the key from the Jenkins credential store into the{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">NVD_API_KEY</code>{" "}
              environment variable at runtime. Jenkins automatically masks the value in console
              output, which a plain environment variable in the Jenkinsfile would not do.
            </li>
            <li>
              <strong>Build and save.</strong> Exporting the freshly built image with{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker save</code>{" "}
              guarantees the scan covers exactly what this build produced, not a tag that may have
              been overwritten by a concurrent build on a shared agent.
            </li>
            <li>
              <strong>Scripted gate.</strong> The final stage uses a{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">script {"{"}...{"}"}</code>{" "}
              block because declarative syntax alone cannot easily branch on a shell command&apos;s
              output. <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">error()</code>{" "}
              fails the stage (and the build) with a readable message in the Jenkins UI.
            </li>
            <li>
              <strong>Double archive.</strong> The explicit{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">Archive report</code>{" "}
              stage runs before the gate so the report is attached even on success, and the{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">post {"{"} always {"{"} ... {"}"} {"}"}</code>{" "}
              block guarantees it is also archived when the gate stage fails and aborts the run.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Failing the build on severity &mdash; and keeping it useful</h2>
          <p className="text-sm muted">
            The same tuning that applies to any CI gate applies here. Start with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">critical.toInteger() &gt; 0</code>{" "}
            alone and let high-severity findings appear in the console log without failing the
            build; a base image can carry a large inherited backlog that has nothing to do with the
            current change &mdash; see{" "}
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              how to reduce CVEs in Docker images
            </Link>{" "}
            before tightening the gate to include highs.
          </p>
          <p className="text-sm muted">
            For multibranch pipeline jobs, mark this Jenkinsfile stage as a required check in your
            source control platform&apos;s branch protection settings (GitHub, GitLab, or
            Bitbucket) &mdash; Jenkins reporting a failed build is only enforced if the platform is
            configured to block merges on it.
          </p>
          <p className="text-sm muted">
            To gate on newly introduced findings rather than the full inherited set, archive the
            report from the last successful build on the target branch and diff against it in the
            scripted stage, failing only when the pull request build introduces CVEs the target
            branch does not already have.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scanning images you did not build in this job</h2>
          <p className="text-sm muted">
            The same stages extend to images that already exist &mdash; a vendor base image, or the
            tag currently running in production. Pull and save it instead of building:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`stage('Scan deployed image') {
  steps {
    sh 'docker pull registry.example.com/myapp:prod'
    sh 'docker save registry.example.com/myapp:prod -o deployed.tar'
    sh 'scanrook scan --file deployed.tar --format json --out deployed.json'
    archiveArtifacts artifacts: 'deployed.json'
  }
}`}</pre>
          <p className="text-sm muted">
            Add this as a stage in a separate, cron-triggered Jenkins pipeline job rather than the
            per-commit build job. Comparing its report against the latest per-commit build tells you
            whether what is running in production has drifted from what the repository would ship
            today.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Operational notes</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              Always reference credentials through Jenkins Credentials Binding; never paste an API
              key directly into a Jenkinsfile, even one stored in a private repository.
            </li>
            <li>
              For agents provisioned per build (Kubernetes or ephemeral cloud agents), there is no
              persistent cache directory by default &mdash; mount a shared volume or accept the
              warm-up cost on every run.
            </li>
            <li>
              For organizations building many images, move the scan stages into a Shared Library so
              every Jenkinsfile calls one maintained pipeline function instead of duplicating the
              scripted gate logic.
            </li>
            <li>
              Retain archived <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">report.json</code>{" "}
              artifacts according to your Jenkins job&apos;s discard-old-builds policy; several
              compliance frameworks expect a retrievable scan history tied to build numbers.
            </li>
          </ul>
          <p className="text-sm muted">
            A maintained reference pipeline, including a Shared Library variant, is documented in{" "}
            <Link href="/docs" className="underline">the ScanRook docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">How do I scan a Docker image in Jenkins?</h3>
              <p className="text-sm muted mt-1">
                Build the image, export it with{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker save</code>,
                install the scanner CLI, and scan the tar. A scripted stage reads the JSON report
                and calls <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">error()</code>{" "}
                past your severity threshold.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should scans run on every branch?</h3>
              <p className="text-sm muted mt-1">
                Pull request builds catch what you are introducing; a separate cron-triggered job on
                the main branch catches advisories published after merge.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I store the NVD API key securely?</h3>
              <p className="text-sm muted mt-1">
                As a Secret text credential in Jenkins, referenced with{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">credentials()</code>{" "}
                in the environment block &mdash; never inline in the Jenkinsfile.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can builds cache the vulnerability database?</h3>
              <p className="text-sm muted mt-1">
                Yes, if the agent has a persistent path outside the ephemeral workspace. Ephemeral
                per-build agents will re-warm the cache on every run.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Add ScanRook to your Jenkins pipeline</h3>
          <p className="text-sm muted leading-relaxed">
            Drop the Jenkinsfile above into your repository and every image your pipeline builds is
            checked against OSV, NVD, and vendor advisory data before it ships &mdash; with JSON
            reports you can archive, gate on, and diff between builds.
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
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              How to Scan a Docker Image for Vulnerabilities
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-scanning-best-practices" className="underline">
              Container Scanning Best Practices
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
