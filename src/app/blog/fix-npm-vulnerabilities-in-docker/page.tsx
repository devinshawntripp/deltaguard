import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-04";

const title = `How to Fix npm Vulnerabilities in Docker with npm audit fix | ${APP_NAME}`;
const description =
  "How to fix npm vulnerabilities in Docker builds: audit and patch the lockfile, use npm ci, exclude devDependencies, and verify with a rescan.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "npm audit fix",
    "npm audit fix docker",
    "npm audit fix dockerfile",
    "npm audit fix force",
    "fix npm vulnerabilities docker",
    "npm audit docker build",
    "npm vulnerabilities in container",
    "npm ci docker security",
    "exclude devdependencies docker",
    "npm package vulnerability docker image",
  ],
  alternates: { canonical: "/blog/fix-npm-vulnerabilities-in-docker" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/fix-npm-vulnerabilities-in-docker",
    images: ["/blog/fix-npm-vulnerabilities-in-docker.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/fix-npm-vulnerabilities-in-docker.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "How to Fix npm Vulnerabilities in Docker with npm audit fix",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/fix-npm-vulnerabilities-in-docker",
  image: "https://scanrook.io/blog/fix-npm-vulnerabilities-in-docker.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I fix npm vulnerabilities in a Docker image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Run npm audit against your lockfile before the build to see what is fixable, apply npm audit fix for non-breaking upgrades, rebuild the image with npm ci so the container gets the updated lockfile exactly, and use a multi-stage build so devDependencies never reach the final image.",
      },
    },
    {
      "@type": "Question",
      name: "Should I run npm audit inside the Dockerfile or before the build?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Run it before the build, in CI, as a separate step. Running npm audit fix inside a RUN instruction can silently change your dependency tree on every build without a reviewable diff, since the lockfile update never leaves the container. Update the lockfile locally or in CI, commit it, then build.",
      },
    },
    {
      "@type": "Question",
      name: "Does npm ci fix vulnerabilities the same way npm install does?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No — npm ci installs exactly what package-lock.json specifies and will not resolve new versions on its own. It is not a fix mechanism; it is a reproducibility mechanism. You still need npm audit fix or a manual version bump to actually update the lockfile before npm ci installs the fixed versions.",
      },
    },
    {
      "@type": "Question",
      name: "Why do npm vulnerabilities remain after npm audit fix?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "npm audit fix only applies non-breaking, semver-compatible updates by default. Findings that require a major version bump need npm audit fix --force or a manual upgrade, both of which can introduce breaking API changes and should go through your normal test suite before merging.",
      },
    },
    {
      "@type": "Question",
      name: "Do devDependencies show up in a Docker image scan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Only if they are actually installed in the image you scan. A multi-stage build that runs npm ci --omit=dev in the final stage excludes devDependencies entirely, so build-only tooling like test frameworks and bundlers cannot appear as findings in the shipped image.",
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
            How to Fix npm Vulnerabilities in Docker with npm audit fix
          </h1>
          <p className="text-sm muted">Published August 4, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            A Node image scan usually splits findings into two buckets: OS packages from the base
            image, and npm packages from your dependency tree. This guide focuses on the second
            bucket &mdash; fixing npm vulnerabilities in Docker builds with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">npm audit fix</code>{" "}
            and a disciplined rebuild, without breaking reproducible installs or accidentally
            shipping devDependencies.
          </p>
        </header>

        <img
          src="/blog/fix-npm-vulnerabilities-in-docker.jpg"
          alt="Fixing npm vulnerabilities in Docker builds"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why npm findings need a different fix path than OS findings</h2>
          <p className="text-sm muted">
            OS package findings get fixed by rebuilding against a patched base image. npm findings
            live in your lockfile, which only your team controls &mdash; there is no upstream
            maintainer who will silently patch it for you. Fixing them means updating{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">package-lock.json</code>{" "}
            deliberately and rebuilding the image against the updated file.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 1: Audit the lockfile outside the container first</h2>
          <p className="text-sm muted">
            Run the audit locally or in CI against the lockfile directly, before touching the
            Dockerfile at all:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`npm audit --omit=dev

# JSON output for scripting or CI gating
npm audit --omit=dev --json > audit.json
jq '.metadata.vulnerabilities' audit.json`}</pre>
          <p className="text-sm muted">
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--omit=dev</code>{" "}
            matters here: findings in devDependencies like test runners and bundlers will not ship in
            a properly built image, so auditing production dependencies only keeps the report focused
            on what actually matters for the container.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 2: Apply non-breaking fixes with npm audit fix</h2>
          <p className="text-sm muted">
            Update the lockfile locally and commit the result &mdash; do not run this inside the
            Dockerfile, where the change would never leave the container:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`npm audit fix
git diff package-lock.json

# Run tests against the updated lockfile before committing
npm test

git add package-lock.json
git commit -m "chore: apply npm audit fixes"`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 3: Handle findings that need a major version bump</h2>
          <p className="text-sm muted">
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">npm audit fix</code>{" "}
            skips fixes that require a breaking semver change. Review those individually rather than
            forcing them blind:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# See what --force would change before running it
npm audit fix --dry-run --force

# Or bump one package deliberately and test
npm install <package>@latest
npm test`}</pre>
          <p className="text-sm muted">
            Treat <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--force</code>{" "}
            as a last resort applied to one package at a time with a full test run after, not a
            blanket command to run whenever the audit looks stubborn.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 4: Build with npm ci so the container matches the lockfile exactly</h2>
          <p className="text-sm muted">
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">npm install</code>{" "}
            can silently drift from the lockfile inside a build; <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">npm ci</code>{" "}
            installs exactly what is pinned and fails loudly if the lockfile is out of sync:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
CMD ["node", "server.js"]`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 5: Exclude devDependencies from the shipped image</h2>
          <p className="text-sm muted">
            Test frameworks, linters, and bundlers do not need to exist in the running container.
            Use a multi-stage build so the final image installs production dependencies only:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "dist/index.js"]`}</pre>
          <p className="text-sm muted">
            See our{" "}
            <Link href="/blog/how-to-reduce-cves-in-docker-images" className="underline">
              broader guide to reducing CVEs in Docker images
            </Link>{" "}
            for how this pattern combines with base image choice.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 6: Handle vulnerable transitive dependencies</h2>
          <p className="text-sm muted">
            Sometimes the vulnerable package is not one you installed directly but a dependency of a
            dependency that has not released a compatible update. Use{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">overrides</code>{" "}
            to force a specific version:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`{
  "name": "myapp",
  "overrides": {
    "vulnerable-transitive-package": "^2.1.4"
  }
}`}</pre>
          <p className="text-sm muted">
            Run <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">npm install</code>{" "}
            once to regenerate the lockfile with the override applied, then run your test suite &mdash;
            an override skips normal dependency resolution, so verify the forced version is actually
            compatible with the packages that depend on it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Verifying the fixes landed in the image</h2>
          <p className="text-sm muted">
            An updated lockfile does not guarantee the built image reflects it &mdash; confirm with a
            scan of the actual image, not just the audit output:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`docker build --no-cache -t myapp:patched .
docker save myapp:patched -o myapp.tar

curl -fsSL https://scanrook.io/install.sh | sh
scanrook scan --file myapp.tar --format json --out report.json
jq -r '.findings[] | select(.package.ecosystem=="npm") | "\\(.severity)\\t\\(.package.name)\\t\\(.package.version)"' report.json`}</pre>
          <p className="text-sm muted">
            If a finding still appears after these steps, confirm it is not coming from
            devDependencies leaking into the image via a missed{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">COPY node_modules</code>{" "}
            in an earlier build stage &mdash; that is the most common reason a fixed lockfile does not
            translate into a clean scan.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook reads the packages genuinely installed in the built image &mdash; not just what
            the manifest declares &mdash; so it catches cases where devDependencies or stale
            node_modules slipped past a lockfile fix. Combine it with{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning
            </Link>{" "}
            and see the <Link href="/docs" className="underline">docs</Link> for CI setup.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">How do I fix npm vulnerabilities in a Docker image?</h3>
              <p className="text-sm muted mt-1">
                Run <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">npm audit fix</code>{" "}
                against the lockfile, rebuild with{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">npm ci</code>,
                and exclude devDependencies from the final image.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should npm audit run inside the Dockerfile?</h3>
              <p className="text-sm muted mt-1">
                No &mdash; run it in CI against the lockfile and commit the fix, so the update is a
                reviewable diff instead of a silent in-container change.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does npm ci fix vulnerabilities?</h3>
              <p className="text-sm muted mt-1">
                No, it installs exactly what the lockfile specifies. You still need{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">npm audit fix</code>{" "}
                or a manual bump to update the lockfile first.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Do devDependencies show up in an image scan?</h3>
              <p className="text-sm muted mt-1">
                Only if they are actually installed in the scanned image &mdash; a multi-stage build
                with <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--omit=dev</code>{" "}
                excludes them entirely.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Confirm your npm fixes with ScanRook</h3>
          <p className="text-sm muted leading-relaxed">
            Scan the built image, not just the lockfile, to catch devDependencies or stale
            node_modules that a manifest-only check would miss.
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
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              Installed-State Scanning vs Advisory Matching
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
