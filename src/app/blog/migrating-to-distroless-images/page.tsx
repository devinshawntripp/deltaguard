import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-07-19";

const title = `Migrating to Distroless Images: A Step-by-Step Guide | ${APP_NAME}`;
const description =
  "How to migrate Docker images to distroless: assess your base, adapt the build per language, handle debugging without a shell, and verify with a scan.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "distroless",
    "distroless images",
    "distroless docker image",
    "migrate to distroless",
    "distroless migration guide",
    "gcr.io distroless",
    "distroless debugging",
    "distroless nodejs",
    "distroless python",
    "distroless vs alpine",
  ],
  alternates: { canonical: "/blog/migrating-to-distroless-images" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/migrating-to-distroless-images",
    images: ["/blog/migrating-to-distroless-images.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/migrating-to-distroless-images.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Migrating to Distroless Images: A Step-by-Step Guide",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/migrating-to-distroless-images",
  image: "https://scanrook.io/blog/migrating-to-distroless-images.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a distroless Docker image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A distroless image contains only an application and its runtime dependencies — no shell, no package manager, no coreutils. Google maintains a common set at gcr.io/distroless for Java, Node, Python, and static/glibc-based binaries, each stripped down to what the language runtime actually needs to execute.",
      },
    },
    {
      "@type": "Question",
      name: "How do I debug a distroless container without a shell?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use an ephemeral debug container attached to the running pod or container, such as docker debug or kubectl debug --target, which injects a shell and common tools into a sidecar sharing the target's namespaces without modifying the distroless image itself.",
      },
    },
    {
      "@type": "Question",
      name: "Can I run a HEALTHCHECK or shell script in a distroless image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not directly, since HEALTHCHECK and shell-form CMD both require a shell. Use the language runtime itself to perform the check (an HTTP client written in your app's own language) and expose it via an exec-form command, or move the health check to an external orchestrator like Kubernetes probes instead.",
      },
    },
    {
      "@type": "Question",
      name: "Does distroless work for interpreted languages like Python?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Google publishes a python3-debian12 distroless image containing the Python interpreter and standard library without a shell or package manager. Native extensions still need to be compiled in a build stage first, since distroless has no compiler to build them at runtime.",
      },
    },
    {
      "@type": "Question",
      name: "Is distroless always more secure than Alpine?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It generally has a smaller package count and no shell for an attacker to abuse after gaining code execution, but Alpine remains a reasonable choice when your team needs in-container debugging or scripts that require a shell. The right choice depends on your operational tooling as much as the scan numbers.",
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
            Migrating to Distroless Images: A Step-by-Step Guide
          </h1>
          <p className="text-sm muted">Published July 19, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            Migrating to distroless images removes the shell, package manager, and most of the
            operating system that a scan report blames for the bulk of your findings. This guide
            walks through the migration per language, what breaks along the way, and how to debug a
            container that no longer has a shell to exec into.
          </p>
        </header>

        <img
          src="/blog/migrating-to-distroless-images.jpg"
          alt="Migrating to distroless Docker images"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What you give up, and what you gain</h2>
          <p className="text-sm muted">
            Distroless images strip out everything that is not the language runtime and your
            application: no shell, no package manager, no coreutils, often no root user by default.
            That is precisely what makes them attractive for a scan report &mdash; there is very
            little installed software left to carry a CVE &mdash; and precisely what makes the
            migration require some care, since tooling that assumed a shell was always available
            stops working.
          </p>
          <p className="text-sm muted">
            Compare this to the{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine and Debian tiers
            </Link>
            : Alpine still has a shell and a package manager, just a smaller one. Distroless has
            neither. Treat the migration below as a checklist, not a single flag flip.
          </p>
          <figure className="surface-card p-4 my-2 overflow-x-auto">
            <p className="text-sm font-semibold mb-1">
              What the toolchain costs you &mdash; ScanRook v1.14.2, 2026-07-04
            </p>
            <svg
              viewBox="0 0 700 228"
              className="w-full"
              style={{ maxWidth: "700px" }}
              role="img"
              aria-label="Horizontal bar chart of total ScanRook findings per image: busybox 1.37 has 2, alpine 3.20 301, node 22-alpine 306, golang 1.23-alpine 379, golang 1.23 18,152, node 22 30,726"
            >
              <title>Horizontal bar chart of total ScanRook findings per image: busybox 1.37 has 2, alpine 3.20 301, node 22-alpine 306, golang 1.23-alpine 379, golang 1.23 18,152, node 22 30,726</title>
              <g>
                <rect x="0" y="10" width="10" height="10" rx="2" className="fill-[var(--dg-accent,#2563eb)]" />
                <text x="14" y="19" className="fill-current text-[10px] opacity-80">
                  Critical
                </text>
                <rect x="77" y="10" width="10" height="10" rx="2" className="fill-current" opacity="0.55" />
                <text x="91" y="19" className="fill-current text-[10px] opacity-80">
                  High
                </text>
                <rect x="132" y="10" width="10" height="10" rx="2" className="fill-current" opacity="0.32" />
                <text x="146" y="19" className="fill-current text-[10px] opacity-80">
                  Medium
                </text>
                <rect x="198" y="10" width="10" height="10" rx="2" className="fill-current" opacity="0.18" />
                <text x="212" y="19" className="fill-current text-[10px] opacity-80">
                  Low
                </text>
                <rect x="247" y="10" width="10" height="10" rx="2" className="fill-current" opacity="0.08" />
                <text x="261" y="19" className="fill-current text-[10px] opacity-80">
                  No severity assigned
                </text>
              </g>
              <text x="0" y="56" className="fill-current text-[10px] font-mono opacity-80">
                busybox:1.37
              </text>
              <rect x="136" y="44" width="2" height="16" rx="2" className="fill-current" opacity="0.08" />
              <rect x="136" y="44" width="1" height="16" className="fill-current" opacity="0.32" />
              <rect x="137" y="44" width="1" height="16" className="fill-current" opacity="0.18" />
              <text x="524" y="56" className="fill-current text-[9px] opacity-70">
                2 total &middot; 0 critical
              </text>
              <text x="0" y="86" className="fill-current text-[10px] font-mono opacity-80">
                alpine:3.20
              </text>
              <rect x="136" y="74" width="4" height="16" rx="2" className="fill-current" opacity="0.08" />
              <rect x="136" y="74" width="1" height="16" className="fill-[var(--dg-accent,#2563eb)]" />
              <rect x="137" y="74" width="2" height="16" className="fill-current" opacity="0.55" />
              <rect x="139" y="74" width="1" height="16" className="fill-current" opacity="0.32" />
              <text x="524" y="86" className="fill-current text-[9px] opacity-70">
                301 total &middot; 20 critical
              </text>
              <text x="0" y="116" className="fill-current text-[10px] font-mono opacity-80">
                node:22-alpine
              </text>
              <rect x="136" y="104" width="4" height="16" rx="2" className="fill-current" opacity="0.08" />
              <rect x="136" y="104" width="1" height="16" className="fill-[var(--dg-accent,#2563eb)]" />
              <rect x="137" y="104" width="2" height="16" className="fill-current" opacity="0.55" />
              <rect x="139" y="104" width="1" height="16" className="fill-current" opacity="0.32" />
              <text x="524" y="116" className="fill-current text-[9px] opacity-70">
                306 total &middot; 23 critical
              </text>
              <text x="0" y="146" className="fill-current text-[10px] font-mono opacity-80">
                golang:1.23-alpine
              </text>
              <rect x="136" y="134" width="5" height="16" rx="2" className="fill-current" opacity="0.08" />
              <rect x="136" y="134" width="1" height="16" className="fill-[var(--dg-accent,#2563eb)]" />
              <rect x="137" y="134" width="2" height="16" className="fill-current" opacity="0.55" />
              <rect x="139" y="134" width="2" height="16" className="fill-current" opacity="0.32" />
              <text x="524" y="146" className="fill-current text-[9px] opacity-70">
                379 total &middot; 23 critical
              </text>
              <text x="0" y="176" className="fill-current text-[10px] font-mono opacity-80">
                golang:1.23
              </text>
              <rect x="136" y="164" width="224" height="16" rx="2" className="fill-current" opacity="0.08" />
              <rect x="136" y="164" width="7" height="16" className="fill-[var(--dg-accent,#2563eb)]" />
              <rect x="143" y="164" width="62" height="16" className="fill-current" opacity="0.55" />
              <rect x="205" y="164" width="126" height="16" className="fill-current" opacity="0.32" />
              <rect x="331" y="164" width="7" height="16" className="fill-current" opacity="0.18" />
              <text x="524" y="176" className="fill-current text-[9px] opacity-70">
                18,152 total &middot; 568 critical
              </text>
              <text x="0" y="206" className="fill-current text-[10px] font-mono opacity-80">
                node:22
              </text>
              <rect x="136" y="194" width="380" height="16" rx="2" className="fill-current" opacity="0.08" />
              <rect x="136" y="194" width="22" height="16" className="fill-[var(--dg-accent,#2563eb)]" />
              <rect x="158" y="194" width="110" height="16" className="fill-current" opacity="0.55" />
              <rect x="268" y="194" width="212" height="16" className="fill-current" opacity="0.32" />
              <rect x="480" y="194" width="13" height="16" className="fill-current" opacity="0.18" />
              <text x="524" y="206" className="fill-current text-[9px] opacity-70">
                30,726 total &middot; 1,794 critical
              </text>
            </svg>
            <figcaption className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              The gap that motivates distroless: node:22 reports 30,726 total findings (1,794 critical) while
              node:22-alpine reports 306 (23 critical); golang:1.23 reports 18,152 (568 critical) against 379
              (23 critical) for golang:1.23-alpine. busybox:1.37 &mdash; not a distroless image, but the
              closest thing in this data set to a near-empty runtime &mdash; reports 2. Almost all of that
              surface is OS userland and build tooling that the runtime never executes, which is exactly what
              a distroless final stage drops. Note the floor: alpine:3.20 by itself still reports 301, so
              going minimal shrinks the surface by orders of magnitude without ever reaching zero. Bar length
              is linear in total findings, so the smallest bars are only a few pixels wide &mdash; exact
              totals are printed at right. The four rated buckets do not always add up to the total because
              some advisories carry no CVSS severity; that remainder is the unfilled part of each bar. The
              busybox:1.37 scan was partial &mdash; its runtime package inventory was unavailable, so matching
              fell back to heuristics. busybox genuinely is minimal, but treat 2 as a floor rather than a
              verified complete count.
            </figcaption>
          </figure>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 1: Audit what your current image actually uses a shell for</h2>
          <p className="text-sm muted">
            Before switching, find every place your Dockerfile or runtime relies on a shell:{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CMD</code>{" "}
            in shell form, <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">HEALTHCHECK</code>,
            entrypoint wrapper scripts, and any{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker exec sh</code>{" "}
            debugging habits your team relies on:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Shell-form CMD — will break under distroless, no /bin/sh
CMD npm start

# Exec-form CMD — works fine under distroless
CMD ["node", "dist/index.js"]

# grep the Dockerfile for shell dependencies
grep -nE "HEALTHCHECK|CMD [a-z]|ENTRYPOINT [a-z]" Dockerfile`}</pre>
          <p className="text-sm muted">
            Anything using shell-form instructions needs to move to exec-form JSON array syntax
            before the migration, regardless of which final base you land on.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 2: Migrate a compiled Go or Rust service</h2>
          <p className="text-sm muted">
            Static binaries are the easiest migration &mdash; they have no runtime dependency on libc
            at all, so the static distroless base is sufficient:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`FROM golang:1.23 AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/server ./cmd/server

FROM gcr.io/distroless/static-debian12
COPY --from=build /out/server /server
USER nonroot:nonroot
ENTRYPOINT ["/server"]`}</pre>
          <p className="text-sm muted">
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CGO_ENABLED=0</code>{" "}
            is the important flag &mdash; without it, Go links against glibc dynamically and the
            static base will fail at container start with a missing-interpreter error. Rust follows
            the same pattern by compiling against the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">musl</code>{" "}
            target.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 3: Migrate a Node.js service</h2>
          <p className="text-sm muted">
            Node needs its runtime, so use the language-specific distroless variant rather than the
            static base, and make sure every <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CMD</code>{" "}
            is exec-form:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

FROM gcr.io/distroless/nodejs22-debian12
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
CMD ["dist/index.js"]`}</pre>
          <p className="text-sm muted">
            Note the distroless Node images set the entrypoint to the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">node</code>{" "}
            binary already, so <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CMD</code>{" "}
            only needs the script path, not the full <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">node dist/index.js</code>{" "}
            invocation.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 4: Migrate a Python service</h2>
          <p className="text-sm muted">
            Python native extensions still need a compiler, so build wheels first and install them
            in the distroless stage where there is no pip available at runtime to do it later:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`FROM python:3.11-slim AS build
WORKDIR /app
COPY requirements.txt .
RUN pip install --target=/deps -r requirements.txt

FROM gcr.io/distroless/python3-debian12
WORKDIR /app
COPY --from=build /deps /usr/lib/python3.11/site-packages
COPY . .
CMD ["app.py"]`}</pre>
          <p className="text-sm muted">
            Verify the target site-packages path matches the Python version baked into the distroless
            image tag exactly &mdash; a mismatch here is the most common distroless-Python migration
            failure.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 5: Replace HEALTHCHECK and debug workflows</h2>
          <p className="text-sm muted">
            Shell-based health checks and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker exec sh</code>{" "}
            debugging both assume a shell that no longer exists. Move health checks to your
            orchestrator, and use an ephemeral debug container for troubleshooting:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Kubernetes: probe the app's own HTTP endpoint, no shell required
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080

# Attach a debug shell without modifying the distroless image
kubectl debug -it mypod --image=busybox:1.36 --target=app`}</pre>
          <p className="text-sm muted">
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kubectl debug</code>{" "}
            attaches a temporary container sharing the target&apos;s process namespace, which gives
            you a shell to inspect the running process without ever putting one in the shipped image.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Verifying the migration</h2>
          <p className="text-sm muted">
            Confirm the container actually starts and serves traffic, then confirm the scan reflects
            the smaller package set:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`docker run -d -p 8080:8080 --name migration-check myapp:distroless
curl -f http://localhost:8080/healthz

docker save myapp:before -o before.tar
docker save myapp:distroless -o after.tar
scanrook scan --file before.tar --format json --out before.json
scanrook scan --file after.tar --format json --out after.json
jq '.summary' before.json after.json`}</pre>
          <p className="text-sm muted">
            Expect the finding count to drop sharply since the shell, coreutils, and package manager
            &mdash; and their entire advisory histories &mdash; are simply absent from the image.
            Whatever remains should be scoped to your language runtime and application dependencies.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            A distroless migration is easy to verify with a scan, harder to verify by eye. ScanRook
            reads the packages genuinely present in each image layer, so you can confirm the shell
            and package manager are truly gone rather than just assuming the base image tag implies
            it. Pair this migration with our{" "}
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              CVE reduction guide
            </Link>{" "}
            or check the <Link href="/docs" className="underline">docs</Link> for scan automation.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is a distroless Docker image?</h3>
              <p className="text-sm muted mt-1">
                An image with only the language runtime and app dependencies &mdash; no shell, no
                package manager, no coreutils.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I debug a distroless container without a shell?</h3>
              <p className="text-sm muted mt-1">
                Attach an ephemeral debug container with <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kubectl debug</code>{" "}
                or <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker debug</code>,
                which shares the target&apos;s namespaces.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can I run HEALTHCHECK in a distroless image?</h3>
              <p className="text-sm muted mt-1">
                Not directly &mdash; move health checks to your orchestrator&apos;s probes or an
                exec-form command written in your app&apos;s own runtime.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does distroless work for Python and interpreted languages?</h3>
              <p className="text-sm muted mt-1">
                Yes, via language-specific images like python3-debian12, though native extensions
                still need compiling in a build stage first.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Confirm the migration with ScanRook</h3>
          <p className="text-sm muted leading-relaxed">
            Scan your image before and after the distroless migration and see exactly which packages
            &mdash; and findings &mdash; disappeared.
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
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              How to Reduce CVEs in Docker Images
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
