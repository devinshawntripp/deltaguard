import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-31";

const title = `GitLab Container Scanning: How It Works and Its Limits | ${APP_NAME}`;
const description =
  "How GitLab container scanning works: the Trivy analyzer, the Ultimate-tier dashboard, how to enable the template, its limits, and where ScanRook fits in.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "gitlab container scanning",
    "gitlab container scanning template",
    "gitlab container scanning trivy",
    "gitlab ci container scanning",
    "gitlab security dashboard",
    "gl-container-scanning-report",
    "cs_severity_threshold",
    "gitlab ultimate container scanning",
    "container scanning analyzer",
    "gitlab vulnerability report",
  ],
  alternates: { canonical: "/blog/gitlab-container-scanning" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/gitlab-container-scanning",
    images: ["/blog/gitlab-container-scanning.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/gitlab-container-scanning.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "GitLab Container Scanning: How It Works and Its Limits",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/gitlab-container-scanning",
  image: "https://scanrook.io/blog/gitlab-container-scanning.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What scanner does GitLab container scanning use under the hood?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GitLab's container scanning analyzer is built on Trivy, which became the default in GitLab 14.0, replacing the earlier Clair-based scanner. The analyzer runs Trivy against your image and translates its output into GitLab's own gl-container-scanning-report.json format so the results populate the security features in the GitLab UI.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need GitLab Ultimate for container scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The container scanning job runs and produces its JSON report across GitLab tiers, but the integrated experience — the Security Dashboard, the merge request security widget, and the Vulnerability Report where findings are triaged and dismissed — requires GitLab Ultimate. On lower tiers you get the report artifact but not the built-in triage and merge-blocking policy features.",
      },
    },
    {
      "@type": "Question",
      name: "How do I enable GitLab container scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Add include: template: Jobs/Container-Scanning.gitlab-ci.yml to your .gitlab-ci.yml and set CS_IMAGE to the image you want scanned. The template defines a container_scanning job that pulls the image, runs the analyzer, and uploads the report. The image usually needs to be built and pushed to a registry earlier in the pipeline so the job can pull it.",
      },
    },
    {
      "@type": "Question",
      name: "Does the container scanning job fail the pipeline when it finds vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "By default, no. The container_scanning job succeeds even when it finds critical vulnerabilities; it reports them rather than failing. To block a merge on findings you use GitLab's merge request approval (scan result) policies in Ultimate, or add a custom job that reads the report and exits non-zero past your threshold.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use a different analyzer than Trivy in GitLab container scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Trivy is the supported default analyzer. You can point CS_ANALYZER_IMAGE at a compatible analyzer image, but the simplest way to add a second engine is to run it as an additional CI job alongside the GitLab template. Running ScanRook in a separate job gives you multi-source enrichment while keeping GitLab's native report and dashboard.",
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
            GitLab Container Scanning: How It Works and Its Limits
          </h1>
          <p className="text-sm muted">Published December 31, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            GitLab container scanning is the built-in way to check your images for known
            vulnerabilities as part of a pipeline. It is a single template include, it feeds the
            GitLab security UI, and &mdash; because it wraps a well-known open-source scanner &mdash;
            it is worth understanding what it does and does not do before you rely on it as your only
            gate. Here is how the feature works and where its edges are.
          </p>
        </header>

        <img
          src="/blog/gitlab-container-scanning.jpg"
          alt="GitLab container scanning pipeline and report flow"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What GitLab container scanning is</h2>
          <p className="text-sm muted">
            Container scanning is one of GitLab&apos;s built-in security scanners. You enable it by
            including a CI/CD template; GitLab then adds a <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">container_scanning</code>{" "}
            job to your pipeline that pulls a built image, scans it for known CVEs in its
            operating-system and language packages, and writes the results to a report artifact named{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">gl-container-scanning-report.json</code>.
            GitLab reads that report to populate its security features: the merge request security
            widget, the Security Dashboard, and the Vulnerability Report.
          </p>
          <p className="text-sm muted">
            Under the hood, the analyzer is built on <strong>Trivy</strong>, which became the default
            in GitLab 14.0, replacing the older Clair-based scanner. So a GitLab container scan is,
            in effect, a Trivy scan whose output has been translated into GitLab&apos;s report schema.
            That is useful context: the finding depth you get is Trivy&apos;s finding depth, wrapped in
            GitLab&apos;s workflow. If you are weighing scanners generally, our{" "}
            <Link href="/blog/trivy-alternatives" className="underline">
              Trivy alternatives write-up
            </Link>{" "}
            covers where that engine is strong and where it is shallow.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The pipeline flow</h2>
          <p className="text-sm muted">
            The template does not build your image &mdash; it scans one that already exists. In a
            typical pipeline the image is built and pushed to the GitLab Container Registry first,
            then the container scanning job pulls it, runs the analyzer, and uploads the report that
            drives the UI:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 760 150" role="img" aria-label="GitLab container scanning flow: build and push, container_scanning job runs Trivy, report artifact, security UI" className="w-full h-auto" style={{ color: "var(--dg-accent,#2563eb)" }}>
              <g fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5">
                <rect x="10" y="45" width="160" height="60" rx="8" />
                <rect x="210" y="45" width="170" height="60" rx="8" strokeOpacity="0.9" strokeWidth="2" />
                <rect x="420" y="45" width="150" height="60" rx="8" />
                <rect x="610" y="45" width="140" height="60" rx="8" />
              </g>
              <g fill="currentColor" fillOpacity="0.9" textAnchor="middle" fontSize="14" fontWeight="600">
                <text x="90" y="72">build + push</text>
                <text x="295" y="72">container_scanning</text>
                <text x="495" y="72">report JSON</text>
                <text x="680" y="72">security UI</text>
              </g>
              <g fill="currentColor" fillOpacity="0.6" textAnchor="middle" fontSize="10.5">
                <text x="90" y="90">to registry</text>
                <text x="295" y="90">Trivy analyzer</text>
                <text x="495" y="90">gl-container-scanning</text>
                <text x="680" y="90">Ultimate views</text>
              </g>
              <g stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" fill="currentColor" fillOpacity="0.45">
                <line x1="172" y1="75" x2="206" y2="75" />
                <polygon points="206,71 212,75 206,79" stroke="none" />
                <line x1="382" y1="75" x2="416" y2="75" />
                <polygon points="416,71 422,75 416,79" stroke="none" />
                <line x1="572" y1="75" x2="606" y2="75" />
                <polygon points="606,71 612,75 606,79" stroke="none" />
              </g>
            </svg>
          </div>
          <p className="text-sm muted">
            The highlighted job is the scan itself. Everything to its right &mdash; the report and
            the dashboard views it feeds &mdash; is GitLab&apos;s workflow layer on top of the
            analyzer output.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Enabling it</h2>
          <p className="text-sm muted">
            The minimum configuration is a single include plus the image to scan. Add this to your{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.gitlab-ci.yml</code>:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`include:
  - template: Jobs/Container-Scanning.gitlab-ci.yml

container_scanning:
  variables:
    CS_IMAGE: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA`}</pre>
          <p className="text-sm muted">
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CS_IMAGE</code>{" "}
            tells the job which image to pull and scan. A few of the variables you are most likely to
            set:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CS_IMAGE</code>{" "}
              &mdash; the target image reference. Defaults to the built application image, but you
              usually pin it to a specific tag or digest.
            </li>
            <li>
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CS_SEVERITY_THRESHOLD</code>{" "}
              &mdash; the minimum severity to report (for example{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">HIGH</code>);
              lower-severity findings are dropped from the report.
            </li>
            <li>
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CS_REGISTRY_USER</code>{" "}
              /{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CS_REGISTRY_PASSWORD</code>{" "}
              &mdash; credentials for pulling from a private registry.
            </li>
            <li>
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CS_DOCKERFILE_PATH</code>{" "}
              &mdash; path to your Dockerfile, used to enrich findings with remediation hints.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The tier and blocking nuance</h2>
          <p className="text-sm muted">
            Two details trip people up. First, tiers: the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">container_scanning</code>{" "}
            job runs and produces its report on any GitLab tier, but the parts people picture when
            they say &ldquo;container scanning&rdquo; &mdash; the Security Dashboard, the merge request
            security widget, and the Vulnerability Report where findings are triaged and dismissed
            &mdash; are GitLab Ultimate features. On Free and Premium you get the JSON artifact, but
            not the built-in triage surface.
          </p>
          <p className="text-sm muted">
            Second, blocking: the container scanning job does <em>not</em> fail the pipeline when it
            finds vulnerabilities. It succeeds and reports them. To actually block a merge on
            findings, GitLab uses <strong>merge request approval policies</strong> (also called scan
            result policies), which are an Ultimate feature. That is a meaningful difference from a
            hand-rolled gate that reads the report and exits non-zero &mdash; the native flow
            separates &ldquo;scan&rdquo; from &ldquo;enforce,&rdquo; and enforcement lives behind the
            top tier. If you want a job that simply fails on critical findings on any tier, our{" "}
            <Link href="/blog/scan-docker-images-gitlab-ci" className="underline">
              guide to scanning Docker images in GitLab CI
            </Link>{" "}
            builds exactly that with a small <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">jq</code> step.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Strengths and limits, honestly</h2>
          <p className="text-sm muted">
            The native feature earns its place: zero-integration setup, findings that appear right in
            the merge request where reviewers already are, a triage workflow that records
            dismissals, and policy-based merge blocking for teams on Ultimate. If you are already a
            GitLab shop, turning it on is close to free effort.
          </p>
          <p className="text-sm muted">
            The limits follow from what it is. Coverage is Trivy&apos;s coverage &mdash; a single
            aggregated database matched locally, which is fast but shallower than querying multiple
            advisory sources. The most useful enforcement and triage features are gated to Ultimate.
            And it scans only what the pipeline points it at, in GitLab; images built elsewhere or
            stored in another registry are outside its view. None of that makes it a bad tool &mdash;
            it makes it a GitLab-shaped tool, best complemented rather than assumed complete.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            The cleanest way to add depth without giving up GitLab&apos;s native workflow is to run a
            second scan as an ordinary CI job alongside the template. ScanRook scans the same image
            as an exported tar and checks every installed package against OSV, NVD, and Red Hat OVAL
            in parallel, tagging each finding with its source and a confidence tier. You keep
            GitLab&apos;s report and dashboard for the native experience, and gain multi-source
            enrichment plus a job you can fail directly on any tier:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`scanrook_scan:
  stage: test
  image: docker:27
  services:
    - docker:27-dind
  script:
    - docker pull "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA"
    - docker save "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA" -o image.tar
    - curl -fsSL https://scanrook.sh/install | sh
    - scanrook scan --file image.tar --format json --out report.json
    - |
      CRITICAL=$(apk add --no-cache jq >/dev/null && jq '.summary.critical // 0' report.json)
      echo "Critical findings: $CRITICAL"
      [ "$CRITICAL" -gt 0 ] && exit 1 || true
  artifacts:
    when: always
    paths:
      - report.json`}</pre>
          <p className="text-sm muted">
            This runs next to <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">container_scanning</code>,
            not instead of it. GitLab keeps surfacing findings in the merge request; ScanRook adds a
            deeper, multi-source pass with a hard gate you control. The full pipeline, including
            severity diffing between runs, is in{" "}
            <Link href="/blog/scan-docker-images-gitlab-ci" className="underline">
              our GitLab CI scanning guide
            </Link>{" "}
            and the <Link href="/docs" className="underline">ScanRook docs</Link>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What scanner is behind GitLab container scanning?</h3>
              <p className="text-sm muted mt-1">
                Trivy. It became the default analyzer in GitLab 14.0, replacing Clair. A GitLab
                container scan is a Trivy scan whose output is translated into GitLab&apos;s report
                format.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Do I need Ultimate for it?</h3>
              <p className="text-sm muted mt-1">
                The job and report work on any tier, but the Security Dashboard, merge request
                widget, Vulnerability Report, and policy-based merge blocking are Ultimate features.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does the scan job fail on findings?</h3>
              <p className="text-sm muted mt-1">
                No. The job reports vulnerabilities without failing. Blocking a merge relies on
                Ultimate scan-result policies, or a custom job that reads the report and exits
                non-zero.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can I run a second scanner alongside it?</h3>
              <p className="text-sm muted mt-1">
                Yes. Add a separate CI job &mdash; ScanRook, for example &mdash; that scans the same
                image with multi-source enrichment while GitLab keeps its native report and
                dashboard.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Add depth to your GitLab pipeline</h3>
          <p className="text-sm muted leading-relaxed">
            Keep GitLab&apos;s native report and run ScanRook next to it &mdash; multi-source
            enrichment against OSV, NVD, and vendor advisories, a source and confidence tier on every
            finding, and a job you can fail directly on any tier.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--dg-accent,#2563eb)] text-white px-4 py-2 text-sm font-medium"
            >
              Start scanning
            </Link>
            <Link href="/compare/trivy" className="btn-secondary">ScanRook vs Trivy</Link>
          </div>
        </section>

        <footer className="border-t border-black/10 dark:border-white/10 pt-4 text-xs muted grid gap-2">
          <p>
            <strong>Related reading:</strong>{" "}
            <Link href="/blog/scan-docker-images-gitlab-ci" className="underline">
              How to Scan Docker Images in GitLab CI
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/trivy-alternatives" className="underline">
              Trivy Alternatives in 2026
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-scanning-best-practices" className="underline">
              Container Scanning Best Practices
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
