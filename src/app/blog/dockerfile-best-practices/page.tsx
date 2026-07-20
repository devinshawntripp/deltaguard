import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-18";

const title = `Dockerfile Best Practices for Secure, Small Images | ${APP_NAME}`;
const description =
  "Dockerfile best practices that cut vulnerabilities and image size: multi-stage builds, pinned bases, non-root users, cache ordering, and secret-safe builds.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "dockerfile best practices",
    "secure dockerfile",
    "dockerfile multi-stage build",
    "dockerfile non-root user",
    "docker image size reduction",
    "dockerfile layer caching",
    "dockerignore",
    "docker build secrets",
    "pin base image digest",
    "dockerfile security",
  ],
  alternates: { canonical: "/blog/dockerfile-best-practices" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/dockerfile-best-practices",
    images: ["/blog/dockerfile-best-practices.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/dockerfile-best-practices.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Dockerfile Best Practices for Secure, Small Images",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/dockerfile-best-practices",
  image: "https://scanrook.io/blog/dockerfile-best-practices.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are the most important Dockerfile best practices?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use a multi-stage build so build tools never reach the final image, start from the smallest base that runs your app, pin the base image by digest, run as a non-root user, order instructions so that expensive layers cache well, keep a .dockerignore file, and never bake secrets into layers. Together these reduce both image size and the number of packages a scanner can find vulnerabilities in.",
      },
    },
    {
      "@type": "Question",
      name: "Does a smaller base image really mean fewer CVEs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Usually yes, because most findings in a typical image come from operating system packages you never call. Removing a compiler toolchain, package manager, or shell removes every advisory attached to it. It is not a guarantee, though: a small image running an outdated application dependency can still carry critical findings, so image size is a proxy for risk rather than a measure of it.",
      },
    },
    {
      "@type": "Question",
      name: "Should I pin base images by tag or by digest?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pin by digest for reproducibility, and re-pin deliberately. A tag such as node:22-slim is a moving pointer, so two builds a week apart can produce different images with no change to your Dockerfile. Pinning the digest makes builds reproducible, but it also freezes security fixes, so you need an automated process that bumps the digest regularly.",
      },
    },
    {
      "@type": "Question",
      name: "How do I pass a secret to a Docker build safely?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use BuildKit secret mounts rather than build arguments or COPY. A build argument is recorded in image metadata, and a file copied in one layer stays in that layer even if a later instruction deletes it. A secret mount makes the value available only during the RUN instruction that requests it and leaves nothing in the resulting layers.",
      },
    },
    {
      "@type": "Question",
      name: "Where does scanning fit into a Dockerfile workflow?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Scan the built image, not the Dockerfile. Linting the Dockerfile catches structural mistakes, but only a scan of the produced image tells you which package versions actually landed and which advisories apply to them. Running the scan in CI on every build gives you a measurable signal for whether a change to the base image or dependency set made things better or worse.",
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
            Dockerfile Best Practices for Secure, Small Images
          </h1>
          <p className="text-sm muted">Published November 18, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            Most of the Dockerfile best practices worth following exist for one of two reasons: they
            make builds faster, or they make the resulting image carry less. The security payoff comes
            almost entirely from the second category &mdash; a package that is not in your final image
            can never appear in a scan report. Here is the set we actually apply, with the reasoning
            behind each one.
          </p>
        </header>

        <img
          src="/blog/dockerfile-best-practices.jpg"
          alt="Container image layers built from a Dockerfile"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            1. Use multi-stage builds, always
          </h2>
          <p className="text-sm muted">
            This is the single highest-leverage change. Build tooling &mdash; compilers, headers,
            package managers, test dependencies &mdash; is enormous and full of CVEs, and none of it
            needs to ship. A multi-stage build compiles in one stage and copies only the artifact into
            a clean final stage.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`# syntax=docker/dockerfile:1

FROM golang:1.24-bookworm AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/app ./cmd/app

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/app /app
USER nonroot:nonroot
ENTRYPOINT ["/app"]`}
          </pre>
          <p className="text-sm muted">
            The final image here contains one binary and a CA bundle. There is no shell, no package
            manager, and no libc to attach an advisory to. We went deeper on this pattern in{" "}
            <Link href="/blog/multi-stage-docker-builds-security" className="underline">
              multi-stage Docker builds for security
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            2. Pick the smallest base that actually runs your app
          </h2>
          <p className="text-sm muted">
            Compiled languages can often reach a static distroless or scratch base. Interpreted
            languages cannot &mdash; Python and Node need a runtime and, frequently, native
            dependencies &mdash; but they can still drop from a full distribution image to a slim or
            Alpine variant. The trade-offs differ per ecosystem: Alpine uses musl, which changes native
            extension behaviour and breaks pre-built Python wheels, so the &ldquo;smallest&rdquo; base
            is not always the cheapest one to operate.
          </p>
          <p className="text-sm muted">
            Our comparison of{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs distroless
            </Link>{" "}
            covers where each one lands, and{" "}
            <Link href="/blog/migrating-to-distroless-images" className="underline">
              migrating to distroless images
            </Link>{" "}
            covers the practical debugging problem you inherit when you remove the shell.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            3. Pin base images by digest &mdash; then keep them moving
          </h2>
          <p className="text-sm muted">
            A tag is a mutable pointer. <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">python:3.13-slim</code>{" "}
            today and the same tag next month are different images, which means a build that passed CI
            can fail identically-configured a week later, and a scan result from Monday does not
            describe Friday&apos;s image. Pin the digest:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`FROM python:3.13-slim@sha256:<64-hex-digest>`}
          </pre>
          <p className="text-sm muted">
            The obvious objection is correct: pinning freezes security patches too. That is why pinning
            without automation is worse than not pinning. Pair it with a bot that opens a pull request
            when the upstream tag moves, as described in{" "}
            <Link href="/blog/automate-docker-base-image-updates" className="underline">
              automating base image updates
            </Link>
            . Pinned plus automated beats floating; pinned plus forgotten is the worst of the three.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            4. Order instructions so the cache works for you
          </h2>
          <p className="text-sm muted">
            Docker invalidates a layer and everything after it when its inputs change. So copy the
            files that change rarely &mdash; the dependency manifests &mdash; before the files that
            change constantly, your source code.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`# Bad: any source edit re-runs the full dependency install
COPY . .
RUN npm ci

# Good: dependency layer is reused until package-lock.json changes
COPY package.json package-lock.json ./
RUN npm ci
COPY . .`}
          </pre>
          <p className="text-sm muted">
            Combine related commands into a single{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">RUN</code>{" "}
            and clean up in the same instruction, because a file deleted in a later layer still occupies
            space and remains extractable from the earlier one:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`RUN apt-get update \\
 && apt-get install -y --no-install-recommends ca-certificates curl \\
 && rm -rf /var/lib/apt/lists/*`}
          </pre>
          <p className="text-sm muted">
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--no-install-recommends</code>{" "}
            is doing real work there. Recommended packages routinely pull in tens of megabytes of
            things you never call, each with its own advisory history.
          </p>
        </section>

        <img
          src="/blog/dockerfile-best-practices-2.jpg"
          alt="Multi-stage Docker build distilling a large build stage into a small final image"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">5. Run as a non-root user</h2>
          <p className="text-sm muted">
            Containers default to UID 0. That is not a container escape by itself, but it removes a
            layer of friction from every other bug &mdash; and it is one line to fix:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`RUN useradd --system --uid 10001 --no-create-home appuser
COPY --chown=appuser:appuser --from=build /out/app /app
USER 10001`}
          </pre>
          <p className="text-sm muted">
            Prefer a numeric UID in the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">USER</code>{" "}
            instruction: Kubernetes&apos; <code className="text-xs">runAsNonRoot</code> check can only
            verify a numeric value without resolving the image&apos;s passwd file. Make the filesystem
            read-only at runtime where you can, and mount a writable{" "}
            <code className="text-xs">emptyDir</code> for scratch space instead of loosening the image.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            6. Keep secrets out of layers entirely
          </h2>
          <p className="text-sm muted">
            Layers are immutable and independently extractable. A private key copied in step four and
            deleted in step five is still sitting in step four&apos;s layer, and{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">ARG</code>{" "}
            values are visible in image history. Use BuildKit secret mounts:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`# syntax=docker/dockerfile:1
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \\
    npm ci --omit=dev

# built with:
#   docker build --secret id=npmrc,src=$HOME/.npmrc .`}
          </pre>
          <p className="text-sm muted">
            The credential exists for the duration of that instruction and never becomes part of a
            layer. If you suspect something already leaked into history, a dedicated scanner is the way
            to check &mdash; see our{" "}
            <Link href="/blog/secret-scanning-guide" className="underline">
              secret scanning guide
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            7. Write a .dockerignore before you need one
          </h2>
          <p className="text-sm muted">
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">COPY . .</code>{" "}
            without a{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.dockerignore</code>{" "}
            is how <code className="text-xs">.git</code> directories, local{" "}
            <code className="text-xs">.env</code> files, and stale{" "}
            <code className="text-xs">node_modules</code> end up in production images. It also bloats
            the build context, which slows every build.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`.git
.env
.env.*
node_modules
target
dist
**/*.pem
**/*.key
Dockerfile
.dockerignore`}
          </pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What each practice actually buys</h2>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 260"
              role="img"
              aria-label="Illustrative matrix showing which Dockerfile practices reduce image size, reduce vulnerability findings, and speed up builds"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <text x={252} y={22} textAnchor="middle" fontSize="11" fontWeight="600" fill="currentColor" fillOpacity={0.8}>Smaller image</text>
              <text x={402} y={22} textAnchor="middle" fontSize="11" fontWeight="600" fill="currentColor" fillOpacity={0.8}>Fewer findings</text>
              <text x={552} y={22} textAnchor="middle" fontSize="11" fontWeight="600" fill="currentColor" fillOpacity={0.8}>Faster builds</text>
              {[
                { label: "Multi-stage build", cells: [2, 2, 1] },
                { label: "Minimal base image", cells: [2, 2, 0] },
                { label: "Digest pinning", cells: [0, 1, 0] },
                { label: "Cache-friendly order", cells: [0, 0, 2] },
                { label: "Non-root user", cells: [0, 1, 0] },
                { label: ".dockerignore", cells: [1, 1, 2] },
              ].map((row, i) => {
                const y = 44 + i * 34;
                return (
                  <g key={row.label}>
                    <text x={8} y={y + 18} fontSize="11.5" fill="currentColor" fillOpacity={0.85}>{row.label}</text>
                    {row.cells.map((v, j) => (
                      <rect
                        key={j}
                        x={192 + j * 150}
                        y={y + 4}
                        width={120}
                        height={20}
                        rx={4}
                        fill={v === 0 ? "currentColor" : "var(--dg-accent,#2563eb)"}
                        fillOpacity={v === 0 ? 0.06 : v === 1 ? 0.22 : 0.45}
                        stroke="currentColor"
                        strokeOpacity={0.2}
                      />
                    ))}
                  </g>
                );
              })}
              <text x={8} y={252} fontSize="10" fill="currentColor" fillOpacity={0.55}>
                Shading is qualitative (none / some / strong effect), not measured data.
              </text>
            </svg>
            <figcaption className="text-xs muted mt-2">
              Qualitative effect of each practice. Multi-stage builds and minimal bases are the two
              that move the vulnerability count meaningfully; the rest mostly buy speed and hygiene.
            </figcaption>
          </div>
        </section>

        <img
          src="/blog/dockerfile-best-practices-3.jpg"
          alt="Docker layer cache reuse across builds"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            A few smaller rules worth internalising
          </h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Prefer <code className="text-xs">COPY</code> over <code className="text-xs">ADD</code>.</strong>{" "}
              ADD silently fetches remote URLs and auto-extracts archives, which is more behaviour than
              you usually want from a copy.
            </li>
            <li>
              <strong>Use exec-form <code className="text-xs">CMD</code> and <code className="text-xs">ENTRYPOINT</code>.</strong>{" "}
              Shell form wraps your process in <code className="text-xs">/bin/sh -c</code>, so it never
              receives SIGTERM directly and shutdown handling breaks.
            </li>
            <li>
              <strong>Pin application dependencies too.</strong> A lockfile committed to the repo is
              what makes the image reproducible; the base image digest only pins half the problem.
            </li>
            <li>
              <strong>One concern per image.</strong> Sidecar processes bolted into a single image
              inflate the package surface and make findings harder to attribute.
            </li>
            <li>
              <strong>Lint, then scan.</strong> A Dockerfile linter catches structural mistakes; only a
              scan of the built image tells you which versions actually landed.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Every practice above is a hypothesis about risk. Scanning is how you check it. ScanRook
            reads the real package databases inside a built image &mdash; the dpkg, RPM, apk, npm, and
            pip metadata that is actually present &mdash; and matches every package against OSV, NVD,
            and Red Hat OVAL in parallel, with each finding carrying its source and a confidence tier.
          </p>
          <p className="text-sm muted">
            The useful workflow is comparative: scan the image before your Dockerfile change and after,
            and see what the change actually removed. That turns &ldquo;we moved to a slim base&rdquo;
            from a vibe into a number. You can run it locally against an image tarball or wire it into
            CI as described in{" "}
            <Link href="/blog/scan-docker-images-github-actions" className="underline">
              scanning Docker images in GitHub Actions
            </Link>
            , and{" "}
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              how to reduce CVEs in Docker images
            </Link>{" "}
            covers what to do with the findings that remain.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Which practice matters most?</h3>
              <p className="text-sm muted mt-1">
                Multi-stage builds. Keeping compilers and package managers out of the final image
                removes more potential findings than any other single change.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does a smaller base always mean fewer CVEs?</h3>
              <p className="text-sm muted mt-1">
                Usually, since most findings come from OS packages you never call. But a tiny image
                running an outdated application dependency can still be critical &mdash; size is a
                proxy, not a measurement.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Tag or digest?</h3>
              <p className="text-sm muted mt-1">
                Digest, paired with automation that re-pins regularly. Pinning without a refresh
                process quietly freezes you on an unpatched base.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I pass secrets at build time?</h3>
              <p className="text-sm muted mt-1">
                BuildKit secret mounts. Build arguments land in image metadata and copied files persist
                in their layer even after deletion.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Measure the change, do not assume it</h3>
          <p className="text-sm muted leading-relaxed">
            Scan your image before and after a Dockerfile change and compare the findings. Every result
            carries its advisory source and a confidence tier, so you can see exactly which packages a
            base image swap removed.
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
            <Link href="/blog/multi-stage-docker-builds-security" className="underline">
              Multi-Stage Docker Builds for Security
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/docker-image-hardening-checklist" className="underline">
              Docker Image Hardening Checklist
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
