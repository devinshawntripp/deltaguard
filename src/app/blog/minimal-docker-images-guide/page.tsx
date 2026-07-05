import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-08";

const title = `The Minimal Docker Image Guide: Alpine, Distroless, Scratch | ${APP_NAME}`;
const description =
  "A practical guide to building minimal Docker images: choosing a base tier, static binaries into scratch, multi-stage cleanup, and size verification.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "minimal docker image guide",
    "build minimal docker image",
    "smallest docker image",
    "docker scratch image",
    "static binary docker image",
    "reduce docker image size",
    "minimal base image comparison",
    "docker image size optimization",
    "alpine vs scratch",
    "shrink docker image",
  ],
  alternates: { canonical: "/blog/minimal-docker-images-guide" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/minimal-docker-images-guide",
    images: ["/blog/minimal-docker-images-guide.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/minimal-docker-images-guide.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "The Minimal Docker Image Guide: Alpine, Distroless, Scratch",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/minimal-docker-images-guide",
  image: "https://scanrook.io/blog/minimal-docker-images-guide.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the smallest possible Docker image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FROM scratch produces the smallest possible image — it contains nothing at all except what you explicitly copy in. It only works for statically linked binaries with no runtime dependency on a C library, shell, or filesystem beyond what you add yourself, such as CA certificates.",
      },
    },
    {
      "@type": "Question",
      name: "Should I use Alpine, distroless, or scratch for a minimal image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use scratch for statically linked binaries with no other requirements, distroless when you need a language runtime (Node, Python, JVM) without a shell, and Alpine when you need a shell or package manager for debugging or startup scripts and can accept musl libc's compatibility tradeoffs.",
      },
    },
    {
      "@type": "Question",
      name: "How do I build a static binary for a scratch image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For Go, set CGO_ENABLED=0 so the binary does not dynamically link against glibc. For Rust, compile against the musl target instead of the default gnu target. Both produce a binary with no external library dependencies, which is what scratch requires since it provides no libraries of its own.",
      },
    },
    {
      "@type": "Question",
      name: "Does a smaller Docker image mean fewer vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Generally yes, since most scan findings come from installed OS packages rather than application code. A smaller image has fewer packages installed, which mechanically means fewer packages that can carry a CVE, though a scan is still the only way to confirm the finding count actually dropped.",
      },
    },
    {
      "@type": "Question",
      name: "How do I measure whether my Docker image is actually minimal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Compare compressed image size with docker images, and inspect layer contents with a tool like dive to see what each instruction added. A scan report listing installed packages is the most direct signal — an image with zero unnecessary packages installed is minimal regardless of its raw byte size.",
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
            The Minimal Docker Image Guide: Alpine, Distroless, Scratch
          </h1>
          <p className="text-sm muted">Published August 8, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            A minimal Docker image is not just a smaller download &mdash; it is fewer packages that
            can carry a CVE and less software available to an attacker after a compromise. This
            guide covers picking the right minimal tier for your language and verifying that the
            build actually stayed minimal.
          </p>
        </header>

        <img
          src="/blog/minimal-docker-images-guide.jpg"
          alt="Building minimal Docker images"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The three minimal tiers</h2>
          <p className="text-sm muted">
            Below the full distribution image sit three progressively smaller tiers: Alpine (a shell
            and package manager, musl libc), distroless (a language runtime, no shell or package
            manager), and scratch (nothing at all). Each removes more software, and each requires
            more care in exchange. Our{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless comparison
            </Link>{" "}
            covers the middle two tiers in depth; this guide adds scratch and focuses on the build
            steps to reach each one.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 1: Build a static binary for scratch (Go)</h2>
          <p className="text-sm muted">
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">FROM scratch</code>{" "}
            provides nothing &mdash; no libc, no CA certificates, no shell. It only works with a
            statically linked binary:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`FROM golang:1.23 AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /out/server ./cmd/server

FROM scratch
COPY --from=build /out/server /server
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
ENTRYPOINT ["/server"]`}</pre>
          <p className="text-sm muted">
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CGO_ENABLED=0</code>{" "}
            forces a static build with no glibc dependency, and{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">-ldflags=&quot;-s -w&quot;</code>{" "}
            strips debug symbols, shrinking the binary further. The CA certificate copy is required
            manually since scratch ships none &mdash; skip it and any outbound TLS connection will
            fail immediately.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 2: Build a static binary for scratch (Rust)</h2>
          <p className="text-sm muted">
            Rust needs the musl target instead of the default glibc target to produce a fully static
            binary:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`FROM rust:1.82 AS build
RUN rustup target add x86_64-unknown-linux-musl
WORKDIR /src
COPY . .
RUN cargo build --release --target x86_64-unknown-linux-musl

FROM scratch
COPY --from=build /src/target/x86_64-unknown-linux-musl/release/server /server
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
ENTRYPOINT ["/server"]`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 3: Use distroless when you need a runtime, not just a binary</h2>
          <p className="text-sm muted">
            Interpreted and JIT-compiled languages need their runtime present, which rules out
            scratch. Distroless gives you the runtime without a shell or package manager:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

FROM gcr.io/distroless/nodejs22-debian12
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/index.js ./index.js
CMD ["index.js"]`}</pre>
          <p className="text-sm muted">
            Our{" "}
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              CVE reduction guide
            </Link>{" "}
            covers this pattern for Node, Python, and Go in more detail.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 4: Use Alpine when you genuinely need a shell</h2>
          <p className="text-sm muted">
            If your entrypoint needs a wrapper script, or your team relies on{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker exec sh</code>{" "}
            for debugging, Alpine is the minimal tier that still allows it:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`FROM golang:1.23-alpine AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /out/server ./cmd/server

FROM alpine:3.20
RUN apk add --no-cache ca-certificates
COPY --from=build /out/server /server
COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 5: Clean up build artifacts and caches</h2>
          <p className="text-sm muted">
            Even in a slim or Alpine final stage, package manager caches and downloaded archives add
            unnecessary bulk if left behind:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Debian/Ubuntu
RUN apt-get update \\
    && apt-get install -y --no-install-recommends ca-certificates \\
    && apt-get clean \\
    && rm -rf /var/lib/apt/lists/*

# Alpine
RUN apk add --no-cache ca-certificates

# npm
RUN npm ci --omit=dev && npm cache clean --force`}</pre>
          <p className="text-sm muted">
            Combine install and cleanup into the same{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">RUN</code>{" "}
            instruction &mdash; splitting them across separate instructions leaves the cache present
            in an earlier layer even after a later layer deletes it, since Docker layers are
            additive.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Verifying the image is actually minimal</h2>
          <p className="text-sm muted">
            Size alone is a weak signal &mdash; confirm with layer inspection and a scan of installed
            packages:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`docker images myapp --format "{{.Tag}}\\t{{.Size}}"

# Inspect what each layer added
dive myapp:minimal

# Confirm the package count in a scan
docker save myapp:minimal -o myapp.tar
curl -fsSL https://scanrook.io/install.sh | sh
scanrook scan --file myapp.tar --format json --out report.json
jq '.summary, (.findings | length)' report.json`}</pre>
          <p className="text-sm muted">
            A genuinely minimal image should show a package count in the low single or double digits
            and a finding total near zero &mdash; if the scan still shows hundreds of findings despite
            a small reported size, an earlier build stage is likely leaking files forward via an
            overly broad <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">COPY</code>.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Image size and vulnerability count are correlated but not the same measurement. ScanRook
            reports the packages genuinely present in each layer, which is the only way to confirm a
            minimal build actually minimized attack surface rather than just compressing well. See our{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              container security checklist
            </Link>{" "}
            or the <Link href="/docs" className="underline">docs</Link> to automate the check.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is the smallest possible Docker image?</h3>
              <p className="text-sm muted mt-1">
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">FROM scratch</code>{" "}
                contains nothing at all &mdash; it only works for statically linked binaries.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should I use Alpine, distroless, or scratch?</h3>
              <p className="text-sm muted mt-1">
                Scratch for static binaries, distroless for a runtime without a shell, Alpine when you
                need a shell or package manager.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I build a static binary for scratch?</h3>
              <p className="text-sm muted mt-1">
                Set <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CGO_ENABLED=0</code>{" "}
                for Go, or target musl instead of gnu for Rust.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does a smaller image mean fewer vulnerabilities?</h3>
              <p className="text-sm muted mt-1">
                Generally yes, since most findings come from installed OS packages &mdash; but a scan
                is the only way to confirm it.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Confirm minimal means minimal</h3>
          <p className="text-sm muted leading-relaxed">
            Scan your image to see the actual package count and finding total, not just the
            compressed size on disk.
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
