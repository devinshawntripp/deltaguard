import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-15";

const title = `Docker Multi-Stage Build Security: A Practical Guide | ${APP_NAME}`;
const description =
  "How multi-stage Docker builds improve security: split build and runtime stages, avoid leaking build secrets, and ship a minimal final image.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "docker multi stage build",
    "docker multi-stage build security",
    "docker multi-stage build example",
    "multi-stage dockerfile example",
    "docker build secrets",
    "reduce docker attack surface",
    "multi-stage build best practices",
    "docker copy from build stage",
    "secure dockerfile pattern",
    "shrink final docker image",
  ],
  alternates: { canonical: "/blog/multi-stage-docker-builds-security" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/multi-stage-docker-builds-security",
    images: ["/blog/multi-stage-docker-builds-security.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/multi-stage-docker-builds-security.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Docker Multi-Stage Build Security: A Practical Guide",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/multi-stage-docker-builds-security",
  image: "https://scanrook.io/blog/multi-stage-docker-builds-security.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do multi-stage Docker builds improve security?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Multi-stage builds let you compile or install dependencies in one image and copy only the finished artifact into a second, minimal image. Compilers, dev headers, build tools, and source code never reach the image you ship, which removes them as both an attack surface and a source of CVEs in a scan report.",
      },
    },
    {
      "@type": "Question",
      name: "How do I pass secrets into a multi-stage Docker build safely?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use BuildKit's --mount=type=secret flag, which mounts a secret file into a single RUN step without writing it into any image layer. Avoid ARG or ENV for secrets, since both are readable in the final image history even if a later stage does not copy them forward.",
      },
    },
    {
      "@type": "Question",
      name: "Does the build stage of a multi-stage Dockerfile end up in the final image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No, as long as the final stage does not use FROM on the build stage's own name and only copies specific files with COPY --from. Intermediate stages are discarded after the build; only the layers of the final named stage ship in the resulting image.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use multi-stage builds with interpreted languages like Node or Python?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The build stage runs the package manager and any compilation steps (native modules, TypeScript, wheel builds), and the runtime stage copies only the production dependency tree and application code, leaving compilers and dev-only packages behind.",
      },
    },
    {
      "@type": "Question",
      name: "How do I verify a multi-stage build actually removed the build tools?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Run a shell in the final image and check for the compiler or package manager, or scan the built image and compare the package list against the build stage. If gcc, npm's devDependencies, or apt caches show up in the final image scan, a COPY instruction is pulling more than intended.",
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
            Docker Multi-Stage Build Security: A Practical Guide
          </h1>
          <p className="text-sm muted">Published July 15, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            A Docker multi-stage build comes down to one security idea: nothing needed only to build
            the application should exist in the image you run in production. This guide covers the
            pattern end to end &mdash; splitting stages, handling secrets safely, and shipping a
            final image with the smallest possible footprint.
          </p>
        </header>

        <img
          src="/blog/multi-stage-docker-builds-security.jpg"
          alt="Multi-stage Docker build security"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why a single-stage build is a liability</h2>
          <p className="text-sm muted">
            A single-stage Dockerfile that installs a compiler, downloads source, builds, and then
            runs the result in the same image ships the compiler, the source, and every build-time
            dependency to production. None of that software executes at runtime, but all of it shows
            up in a vulnerability scan and all of it is available to an attacker who gets a shell.
          </p>
          <p className="text-sm muted">
            Multi-stage builds separate &ldquo;what it takes to build this&rdquo; from &ldquo;what it
            takes to run this,&rdquo; and only the second list ships.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 1: Split the Dockerfile into build and runtime stages</h2>
          <p className="text-sm muted">
            Name each stage with <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">AS</code>{" "}
            and pull artifacts forward explicitly with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">COPY --from</code>:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Stage 1: build — full toolchain, discarded after build
FROM golang:1.23 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/server ./cmd/server

# Stage 2: runtime — only the compiled binary
FROM gcr.io/distroless/static-debian12
COPY --from=build /out/server /server
USER nonroot:nonroot
ENTRYPOINT ["/server"]`}</pre>
          <p className="text-sm muted">
            The final image contains one binary and CA certificates. There is no Go toolchain, no
            source tree, and nothing an attacker could use to recompile or modify the running
            program from inside the container.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 2: Pass build secrets without leaking them into layers</h2>
          <p className="text-sm muted">
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">ARG</code>{" "}
            and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">ENV</code>{" "}
            values are visible in the image history even in stages that get discarded, which makes
            them unsafe for tokens or private registry credentials. Use BuildKit&apos;s secret mount
            instead, which never writes the value to a layer:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# syntax=docker/dockerfile:1
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN --mount=type=secret,id=npmrc,target=/app/.npmrc \\
    npm ci --omit=dev
COPY . .
RUN npm run build

# Build with the secret supplied out-of-band:
# docker build --secret id=npmrc,src=$HOME/.npmrc -t myapp .`}</pre>
          <p className="text-sm muted">
            The secret file exists only for the duration of that one <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">RUN</code>{" "}
            instruction and is never committed to a layer, so it cannot be extracted later with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker history</code>{" "}
            even from the discarded build stage.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 3: Ship the smallest viable final stage</h2>
          <p className="text-sm muted">
            Once the build stage produces an artifact, the final stage does not need a full
            distribution &mdash; it needs whatever the artifact requires to run and nothing more:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Static binary, no libc dependency: scratch is viable
FROM scratch
COPY --from=build /out/server /server
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
ENTRYPOINT ["/server"]

# Dynamically linked binary or needs glibc: distroless
FROM gcr.io/distroless/base-debian12
COPY --from=build /out/server /server
ENTRYPOINT ["/server"]

# Needs a shell for a health-check script or entrypoint wrapper: Alpine
FROM alpine:3.20
RUN apk add --no-cache ca-certificates
COPY --from=build /out/server /server
ENTRYPOINT ["/server"]`}</pre>
          <p className="text-sm muted">
            Our{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless comparison
            </Link>{" "}
            covers the debugging and compatibility tradeoffs between these three options in more
            depth.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 4: Copy narrowly and run as a non-root user</h2>
          <p className="text-sm muted">
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">COPY --from=build /out .</code>{" "}
            pulls whatever is in that directory, including files you did not intend to ship. Copy
            individual paths, and set an explicit non-root user in the final stage:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`FROM gcr.io/distroless/static-debian12
COPY --from=build --chown=nonroot:nonroot /out/server /server
COPY --from=build --chown=nonroot:nonroot /app/config.yaml /config.yaml
USER nonroot:nonroot
ENTRYPOINT ["/server"]`}</pre>
          <p className="text-sm muted">
            Distroless images ship a{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">nonroot</code>{" "}
            user out of the box; for Alpine or Debian-based final stages, create one explicitly with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">RUN adduser -D -u 10001 app</code>{" "}
            and switch to it before <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">ENTRYPOINT</code>.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 5: Apply the same pattern to Node and Python</h2>
          <p className="text-sm muted">
            The pattern is language-agnostic. For Node, the build stage installs full dependencies
            and bundles; the runtime stage installs only production dependencies:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "dist/index.js"]`}</pre>
          <p className="text-sm muted">
            For Python, build wheels in the first stage and install only the wheels in the second, so
            compilers used for native extensions never reach the runtime image:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`FROM python:3.13-slim AS build
WORKDIR /app
COPY requirements.txt .
RUN pip wheel --wheel-dir /wheels -r requirements.txt

FROM python:3.13-slim AS runtime
WORKDIR /app
COPY --from=build /wheels /wheels
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels
COPY . .
USER nobody
CMD ["python", "app.py"]`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Verifying stage separation actually worked</h2>
          <p className="text-sm muted">
            Confirm the build tools did not leak into the final image, then confirm the scan result
            reflects the smaller surface:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Confirm no shell/compiler exists in a distroless or scratch final stage
docker run --rm myapp:final sh -c "echo should not run"

# Compare scan results between a single-stage and multi-stage build
docker save myapp:single-stage -o single.tar
docker save myapp:multi-stage -o multi.tar
scanrook scan --file single.tar --format json --out single.json
scanrook scan --file multi.tar --format json --out multi.json
jq '.summary' single.json multi.json`}</pre>
          <p className="text-sm muted">
            Expect the multi-stage build to drop findings tied to compilers, build-only libraries,
            and dev dependency trees entirely &mdash; those packages are simply absent from the
            image, not just unused. Our piece on{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning
            </Link>{" "}
            explains why scanning what is actually present, rather than what a manifest claims, is
            what makes this comparison meaningful.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Multi-stage builds reduce the theoretical attack surface; scanning confirms the reduction
            actually happened. ScanRook reads the packages genuinely installed in the final image
            layers, so a scan of a well-built multi-stage image and a badly-built one will show the
            difference in the numbers, not just in the Dockerfile. See our{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              container security checklist
            </Link>{" "}
            or the <Link href="/docs" className="underline">docs</Link> to wire scanning into your
            build pipeline.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">How do multi-stage builds improve security?</h3>
              <p className="text-sm muted mt-1">
                They keep compilers, build tools, and source code out of the shipped image, removing
                them as both an attack surface and a source of scan findings.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I pass secrets into a multi-stage build safely?</h3>
              <p className="text-sm muted mt-1">
                Use BuildKit&apos;s <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--mount=type=secret</code>,
                not ARG or ENV, which persist in image history.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does the build stage end up in the final image?</h3>
              <p className="text-sm muted mt-1">
                No, as long as you copy specific files with{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">COPY --from</code>{" "}
                rather than building on top of the build stage itself.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does this work for Node and Python, not just compiled languages?</h3>
              <p className="text-sm muted mt-1">
                Yes &mdash; build wheels or bundles in the first stage, install only production
                dependencies in the runtime stage.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Confirm the reduction with ScanRook</h3>
          <p className="text-sm muted leading-relaxed">
            Scan your single-stage and multi-stage builds side by side and see exactly which
            packages the split removed.
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
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              How to Reduce CVEs in Docker Images
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              Container Image Security Checklist
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
