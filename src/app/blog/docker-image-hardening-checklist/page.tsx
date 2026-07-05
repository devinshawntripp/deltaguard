import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-27";

const title = `Docker Image Hardening Checklist: 8 Steps With Code | ${APP_NAME}`;
const description =
  "An eight-step Docker image hardening checklist with runnable code for each step: non-root users, minimal base images, capability drops, and scanning.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "docker image hardening checklist",
    "harden docker image",
    "docker security checklist",
    "docker non-root user",
    "docker read-only filesystem",
    "docker drop capabilities",
    "docker image best practices",
    "secure dockerfile checklist",
    "docker hardening steps",
    "container image hardening",
  ],
  alternates: { canonical: "/blog/docker-image-hardening-checklist" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/docker-image-hardening-checklist",
    images: ["/blog/docker-image-hardening-checklist.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/docker-image-hardening-checklist.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Docker Image Hardening Checklist: 8 Steps With Code",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/docker-image-hardening-checklist",
  image: "https://scanrook.io/blog/docker-image-hardening-checklist.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the single most important step for hardening a Docker image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Running as a non-root user. It does not remove any vulnerabilities by itself, but it caps what an attacker can do if a vulnerability is exploited — no writing to system paths, no binding privileged ports, no easy path to escaping the container's default confinement.",
      },
    },
    {
      "@type": "Question",
      name: "Should every Docker container run with a read-only root filesystem?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Where the application allows it, yes. Set readOnlyRootFilesystem in Kubernetes or --read-only in plain Docker, and mount an explicit writable volume for the specific paths (logs, temp files) the process needs. This blocks an attacker from writing a persistent payload into the container's filesystem.",
      },
    },
    {
      "@type": "Question",
      name: "What Linux capabilities should a typical web application container drop?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Drop ALL capabilities by default and add back only what is strictly required, which for most stateless web services is none. Common capabilities like NET_RAW, SYS_ADMIN, and NET_ADMIN are almost never needed by application containers and are frequent targets in container-escape techniques.",
      },
    },
    {
      "@type": "Question",
      name: "How does a HEALTHCHECK instruction relate to image hardening?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It does not fix vulnerabilities, but it lets the orchestrator detect and restart a container compromised into an unresponsive or crash-looping state, limiting the window an attacker has inside a single container instance before it is replaced.",
      },
    },
    {
      "@type": "Question",
      name: "Is a hardening checklist a substitute for scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No — hardening reduces what an attacker can do after compromise, while scanning finds and helps you fix the vulnerabilities that make compromise possible in the first place. Both are necessary, and neither replaces the other in a production security posture.",
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
            Docker Image Hardening Checklist: 8 Steps With Code
          </h1>
          <p className="text-sm muted">Published July 27, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            A hardened Docker image is not one specific setting &mdash; it is a set of defaults that
            together limit what an attacker can do if something inside the container is ever
            compromised. This checklist covers eight concrete steps, each with the exact Dockerfile
            or manifest snippet to apply it.
          </p>
        </header>

        <img
          src="/blog/docker-image-hardening-checklist.jpg"
          alt="Docker image hardening checklist"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Hardening versus patching</h2>
          <p className="text-sm muted">
            Patching and scanning close known vulnerabilities; hardening assumes one will eventually
            slip through anyway and limits the blast radius when it does. Both matter, and neither
            substitutes for the other &mdash; the steps below are the hardening half of that pair.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 1: Run as a non-root user</h2>
          <p className="text-sm muted">
            The default root user inside a container can write to system paths, bind privileged
            ports, and generally has far more reach than any application process needs:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`FROM node:22-slim
RUN groupadd -r app && useradd -r -g app -u 10001 app
WORKDIR /app
COPY --chown=app:app . .
USER app
CMD ["node", "server.js"]`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 2: Use the smallest viable base image</h2>
          <p className="text-sm muted">
            Fewer installed packages means fewer things that can be exploited and fewer findings in a
            scan:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Instead of the full distribution
FROM python:3.13

# Prefer slim, or distroless where feasible
FROM python:3.13-slim
# or
FROM gcr.io/distroless/python3-debian12`}</pre>
          <p className="text-sm muted">
            See our{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless comparison
            </Link>{" "}
            for how to choose between the tiers.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 3: Enforce a read-only root filesystem</h2>
          <p className="text-sm muted">
            Blocking writes to the container filesystem stops an attacker from dropping a persistent
            payload, and forces you to be explicit about the paths that genuinely need to be
            writable:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Plain Docker
docker run --read-only --tmpfs /tmp -d myapp:hardened

# Kubernetes
securityContext:
  readOnlyRootFilesystem: true
volumes:
  - name: tmp
    emptyDir: {}
volumeMounts:
  - name: tmp
    mountPath: /tmp`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 4: Drop all Linux capabilities by default</h2>
          <p className="text-sm muted">
            Most application containers need none of the default capability set. Drop everything and
            add back only what is proven necessary:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Kubernetes
securityContext:
  capabilities:
    drop: ["ALL"]
  allowPrivilegeEscalation: false
  runAsNonRoot: true

# Plain Docker
docker run --cap-drop=ALL --security-opt=no-new-privileges -d myapp:hardened`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 5: Pin versions and exclude what you don&apos;t need</h2>
          <p className="text-sm muted">
            Unpinned base tags and default package-manager behavior both quietly widen the surface.
            Pin the base by digest, and disable recommended-package installs:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`FROM debian:12-slim@sha256:9b2e7a3c...
RUN apt-get update \\
    && apt-get install -y --no-install-recommends ca-certificates \\
    && apt-get clean \\
    && rm -rf /var/lib/apt/lists/*`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 6: Never bake secrets into layers</h2>
          <p className="text-sm muted">
            Secrets in <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">ENV</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">ARG</code>,
            or a copied <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.env</code>{" "}
            file remain readable in the image history forever, even if a later layer deletes the
            file. Use a BuildKit secret mount instead:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# syntax=docker/dockerfile:1
RUN --mount=type=secret,id=db_password \\
    DB_PASSWORD=$(cat /run/secrets/db_password) ./run-migrations.sh

# docker build --secret id=db_password,src=./db_password.txt -t myapp .`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 7: Add a HEALTHCHECK the orchestrator can act on</h2>
          <p className="text-sm muted">
            A health check does not close a vulnerability, but it bounds how long a compromised or
            crash-looping container stays in rotation before it is restarted:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD ["node", "healthcheck.js"]`}</pre>
          <p className="text-sm muted">
            Write the check as an exec-form command using your application&apos;s own runtime so it
            still works if you later migrate to a shell-less base image such as distroless.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 8: Gate every build on a vulnerability scan</h2>
          <p className="text-sm muted">
            Hardening settings do not catch known-vulnerable packages; a scan does. Fail the build
            when critical findings appear:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`curl -fsSL https://scanrook.io/install.sh | sh
docker save myapp:hardened -o myapp.tar
scanrook scan --file myapp.tar --format json --out report.json

CRIT=$(jq '.summary.critical' report.json)
if [ "$CRIT" -gt 0 ]; then
  echo "::error::$CRIT critical findings in hardened image"
  exit 1
fi`}</pre>
          <p className="text-sm muted">
            Our{" "}
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              scanning guide
            </Link>{" "}
            covers the full range of options for wiring this into CI.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Verifying the hardening took effect</h2>
          <p className="text-sm muted">
            Confirm each setting is actually active rather than assuming the Dockerfile change
            applied:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Confirm the container is not running as root
docker exec mycontainer id
# uid=10001(app) gid=10001(app)

# Confirm the filesystem is read-only
docker exec mycontainer sh -c "touch /test" 2>&1
# touch: /test: Read-only file system

# Confirm capabilities were dropped
docker inspect mycontainer --format '{{.HostConfig.CapDrop}}'`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Hardening settings and scan results answer different questions, and you need both to
            report a real security posture. ScanRook covers the vulnerability side &mdash; matching
            installed packages against OSV, NVD, and vendor advisories &mdash; so you can gate the
            build described in Step 8 with confidence. See the{" "}
            <Link href="/docs" className="underline">
              docs
            </Link>{" "}
            for CI integration.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is the single most important hardening step?</h3>
              <p className="text-sm muted mt-1">
                Running as a non-root user &mdash; it caps what an attacker can do after exploiting
                any other vulnerability in the container.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should every container run with a read-only filesystem?</h3>
              <p className="text-sm muted mt-1">
                Where the application allows it, yes &mdash; mount explicit writable volumes only for
                the paths that genuinely need them.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What capabilities should a web app container drop?</h3>
              <p className="text-sm muted mt-1">
                Drop ALL by default; most stateless web services need none of the default Linux
                capability set.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is this checklist a substitute for scanning?</h3>
              <p className="text-sm muted mt-1">
                No &mdash; hardening limits post-compromise damage, while scanning finds and helps fix
                the vulnerabilities that enable compromise in the first place.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Pair hardening with scanning in ScanRook</h3>
          <p className="text-sm muted leading-relaxed">
            Gate your hardened build on a real vulnerability scan and get severity totals you can
            report alongside your checklist.
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
            <Link href="/blog/container-security-checklist" className="underline">
              Container Image Security Checklist
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              How to Scan a Docker Image for Vulnerabilities
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
