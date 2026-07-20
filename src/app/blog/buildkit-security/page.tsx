import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-07";

const title = `BuildKit Security: Hardening Your Docker Builds | ${APP_NAME}`;
const description =
  "BuildKit changed how Docker images are built. How its secret mounts, cache, provenance attestations and rootless mode work, and how to build images safely.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "buildkit",
    "buildkit security",
    "docker buildkit",
    "buildkit secrets",
    "docker build secret mount",
    "buildx",
    "buildkit provenance",
    "rootless buildkit",
    "docker build cache poisoning",
    "secure docker builds",
  ],
  alternates: { canonical: "/blog/buildkit-security" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/buildkit-security",
    images: ["/blog/buildkit-security.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/buildkit-security.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "BuildKit Security: Hardening Your Docker Builds",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/buildkit-security",
  image: "https://scanrook.io/blog/buildkit-security.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is BuildKit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "BuildKit is the build engine behind modern Docker builds. Instead of executing a Dockerfile top to bottom as a linear sequence, it compiles the Dockerfile into a directed acyclic graph of build steps, executes independent branches in parallel, and caches results per step. It is the default builder in current Docker releases and is exposed through the docker buildx command.",
      },
    },
    {
      "@type": "Question",
      name: "How do I pass secrets to a Docker build without leaking them?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use BuildKit secret mounts. Add a syntax directive to the Dockerfile, then use RUN --mount=type=secret,id=mytoken and pass --secret id=mytoken,src=./token on the command line. The secret is mounted into the build step's filesystem for the duration of that step only and is never written into an image layer, unlike build arguments or COPY.",
      },
    },
    {
      "@type": "Question",
      name: "Are Docker build arguments secure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Build arguments are recorded in image metadata and are visible to anyone who can inspect the image history. They are appropriate for non-sensitive configuration such as a version number or base image tag, but never for tokens, passwords, or private keys. Use secret mounts for anything sensitive.",
      },
    },
    {
      "@type": "Question",
      name: "What is BuildKit provenance?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "BuildKit can emit SLSA provenance attestations describing how an image was built: the build definition, the source materials, and the builder identity. The attestation is attached to the image in the registry alongside the manifest, so a consumer can verify the image came from the expected pipeline rather than trusting the tag alone.",
      },
    },
    {
      "@type": "Question",
      name: "Does BuildKit need root?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not necessarily. BuildKit supports a rootless mode that runs the daemon as an unprivileged user using user namespaces, which removes the need to mount a privileged Docker socket into CI. It is the recommended way to build images inside Kubernetes or a shared CI runner, though a few build features that require full privileges are unavailable.",
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
            BuildKit Security: Hardening Your Docker Builds
          </h1>
          <p className="text-sm muted">Published October 7, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            BuildKit is the engine behind every modern <code className="text-xs">docker build</code>,
            and it quietly changed the security properties of the build step. It introduced a real
            answer to build-time secrets, a shared cache that is worth protecting, and provenance
            attestations that let a consumer verify where an image came from. Here is what those
            features actually do and how to configure them.
          </p>
        </header>

        <img
          src="/blog/buildkit-security.jpg"
          alt="BuildKit security: how the BuildKit build engine assembles container image layers"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What BuildKit changed</h2>
          <p className="text-sm muted">
            The original Docker builder executed a Dockerfile as a straight line: each instruction
            produced a layer, each layer depended on the one before it. BuildKit compiles the
            Dockerfile into a directed acyclic graph instead. Steps that do not depend on each other
            run in parallel, unused stages of a multi-stage build are never executed at all, and the
            cache is keyed per step rather than per prefix of the file.
          </p>
          <p className="text-sm muted">
            That redesign is mostly about speed, but it carries security consequences worth
            understanding. Because BuildKit knows the dependency graph, it can mount things into a
            single step without committing them to a layer &mdash; which is what makes real secret
            handling possible. Because it caches aggressively and can share that cache across
            machines, the cache becomes a trust boundary. And because it controls the whole build, it
            can describe the build honestly in an attestation.
          </p>
          <p className="text-sm muted">
            You reach BuildKit through <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker buildx</code>,
            which manages builder instances. It is worth creating a dedicated builder rather than
            relying on the default one, because that is where you configure the driver, the cache
            backend, and network access.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <pre className="text-xs leading-relaxed"><code>{`# create a dedicated builder and make it active
docker buildx create --name hardened --driver docker-container --use
docker buildx inspect --bootstrap

# build for a single platform and load into the local daemon
docker buildx build --load -t myapp:dev .`}</code></pre>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Build secrets: stop baking credentials into layers
          </h2>
          <p className="text-sm muted">
            The single most common build-time security mistake is putting a credential into an image
            layer. It happens in three ways, and all three are still easy to write by accident:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Build arguments.</strong>{" "}
              <code className="text-xs">ARG NPM_TOKEN</code> plus{" "}
              <code className="text-xs">--build-arg</code> looks private, but the value is recorded in
              image metadata and readable with <code className="text-xs">docker history</code>.
            </li>
            <li>
              <strong>COPY then delete.</strong> Copying a key file in and{" "}
              <code className="text-xs">rm</code>-ing it in a later instruction does nothing &mdash;
              the file is permanently present in the earlier layer.
            </li>
            <li>
              <strong>Environment variables.</strong>{" "}
              <code className="text-xs">ENV</code> values persist into the final image config and into
              every container started from it.
            </li>
          </ul>
          <p className="text-sm muted">
            BuildKit&apos;s secret mount solves this properly. The secret is exposed as a file inside
            a single <code className="text-xs">RUN</code> step, on a tmpfs mount that exists only for
            the duration of that step, and it never becomes part of any layer.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <pre className="text-xs leading-relaxed"><code>{`# syntax=docker/dockerfile:1
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./

# the token exists at /run/secrets/npm_token only while this RUN executes
RUN --mount=type=secret,id=npm_token \\
    NPM_TOKEN="$(cat /run/secrets/npm_token)" \\
    npm ci --omit=dev

FROM node:22-slim
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
USER node
CMD ["node", "server.js"]`}</code></pre>
          </div>
          <div className="overflow-x-auto surface-card p-4">
            <pre className="text-xs leading-relaxed"><code>{`# pass the secret from a file
docker buildx build --secret id=npm_token,src=./npm_token.txt -t myapp:1.0 .

# or straight from an environment variable
docker buildx build --secret id=npm_token,env=NPM_TOKEN -t myapp:1.0 .`}</code></pre>
          </div>
          <p className="text-sm muted">
            The <code className="text-xs">syntax</code> directive on the first line matters: it tells
            BuildKit to fetch a Dockerfile frontend that understands the{" "}
            <code className="text-xs">--mount</code> flags. Without it the build fails on older
            frontend versions. There is also an SSH mount,{" "}
            <code className="text-xs">--mount=type=ssh</code>, for cloning private Git repositories
            using an agent socket rather than copying a deploy key into the build context.
          </p>
          <p className="text-sm muted">
            Even with secret mounts, verify the result. Credentials leak through logs, through
            generated lockfiles, and through package manager config files written during the build.
            A secret scanner run against the built image is the check that actually catches these
            &mdash; see our{" "}
            <Link href="/blog/secret-scanning-guide" className="underline">
              secret scanning guide
            </Link>{" "}
            for how that fits into a pipeline.
          </p>
        </section>

        <img
          src="/blog/buildkit-security-2.jpg"
          alt="BuildKit secret mounts and build cache handling during a Docker image build"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The cache is a trust boundary</h2>
          <p className="text-sm muted">
            BuildKit can export and import its cache to a registry, which is what makes CI builds
            fast when every job starts on a fresh runner. It is also the part of the setup most teams
            never threaten-model. A remote cache is, functionally, a set of pre-built layers that your
            builder will substitute for real execution when the cache key matches. Anyone who can
            write to that cache location can influence the contents of your images without touching
            your source repository.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <pre className="text-xs leading-relaxed"><code>{`docker buildx build \\
  --cache-from type=registry,ref=registry.example.com/myapp:buildcache \\
  --cache-to   type=registry,ref=registry.example.com/myapp:buildcache,mode=max \\
  -t registry.example.com/myapp:1.0 --push .`}</code></pre>
          </div>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              Keep the cache repository under the same access control as the image repository. Write
              access to the cache should be at least as restricted as push access to the image.
            </li>
            <li>
              Do not share a cache between trusted and untrusted builds. Pull-request builds from
              forks should never be able to write to the cache used by main-branch builds.
            </li>
            <li>
              Use <code className="text-xs">mode=max</code> deliberately &mdash; it caches intermediate
              stages too, which is faster but stores more of the build&apos;s intermediate state.
            </li>
            <li>
              Rebuild without cache on a schedule. A cache that keeps hitting means your base layers
              are never picking up new distribution security updates, which is the same staleness
              problem covered in{" "}
              <Link href="/blog/automate-docker-base-image-updates" className="underline">
                automating base image updates
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            BuildKit security controls at a glance
          </h2>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 250"
              role="img"
              aria-label="Layer diagram of BuildKit security controls: build inputs, execution isolation, output attestations, and post-build verification"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              {[
                { y: 12, label: "Inputs", items: "secret mounts · SSH mounts · pinned base digests" },
                { y: 70, label: "Execution", items: "rootless mode · no privileged socket · network scoping" },
                { y: 128, label: "Outputs", items: "SBOM attestation · SLSA provenance · signed manifest" },
                { y: 186, label: "Verification", items: "image scan · secret scan · policy gate", hot: true },
              ].map((row) => (
                <g key={row.label}>
                  <rect
                    x={8}
                    y={row.y}
                    width={684}
                    height={48}
                    rx={8}
                    fill={row.hot ? "var(--dg-accent,#2563eb)" : "currentColor"}
                    fillOpacity={row.hot ? 0.12 : 0.05}
                    stroke="currentColor"
                    strokeOpacity={0.35}
                  />
                  <text x={26} y={34 + row.y - 12} fontSize="14" fontWeight="600" fill="currentColor">
                    {row.label}
                  </text>
                  <text
                    x={190}
                    y={34 + row.y - 12}
                    fontSize="11.5"
                    fill="currentColor"
                    fillOpacity={0.7}
                  >
                    {row.items}
                  </text>
                </g>
              ))}
              {[60, 118, 176].map((y) => (
                <line
                  key={y}
                  x1={350}
                  y1={y}
                  x2={350}
                  y2={y + 10}
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeOpacity={0.5}
                />
              ))}
            </svg>
            <figcaption className="text-xs muted mt-2">
              The four places BuildKit security is decided. Controls at each layer are independent
              &mdash; secret mounts do not help if the builder runs privileged, and provenance does
              not help if nothing verifies it.
            </figcaption>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Rootless builds and the privileged-socket problem
          </h2>
          <p className="text-sm muted">
            The classic way to build images in CI is to mount{" "}
            <code className="text-xs">/var/run/docker.sock</code> into the job container. That is
            effectively handing the job root on the host: anyone who can run a build can start a
            privileged container with the host filesystem mounted. We wrote about that specific
            failure mode in{" "}
            <Link href="/blog/docker-socket" className="underline">
              the Docker socket
            </Link>
            , and it is one of the more common self-inflicted escalation paths in a cluster.
          </p>
          <p className="text-sm muted">
            BuildKit supports running its daemon rootless, using user namespaces so the build runs as
            an unprivileged user on the host. In Kubernetes you deploy{" "}
            <code className="text-xs">buildkitd</code> as a pod and point{" "}
            <code className="text-xs">buildx</code> at it with the{" "}
            <code className="text-xs">kubernetes</code> driver; on a VM runner you can run the
            rootless daemon directly. A handful of build features that need real privileges are
            unavailable, but most application builds do not use them.
          </p>
          <p className="text-sm muted">
            Also scope network access. A build step that can reach the whole internet can pull an
            arbitrary payload; a build step with no network at all cannot. BuildKit supports{" "}
            <code className="text-xs">RUN --network=none</code> for steps that only compile local
            code, which is a cheap way to make the dependency-fetch step the single audited point of
            external access. That narrows the window for the class of attack described in{" "}
            <Link href="/blog/dependency-confusion" className="underline">
              dependency confusion
            </Link>
            .
          </p>
        </section>

        <img
          src="/blog/buildkit-security-3.jpg"
          alt="SLSA provenance attestation produced by a BuildKit container image build"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Provenance and SBOM attestations
          </h2>
          <p className="text-sm muted">
            BuildKit can attach attestations to the image it pushes. Two matter: an SBOM describing
            the packages it found in the result, and a SLSA provenance statement describing how the
            build ran &mdash; the build definition, the resolved source materials, and the builder
            identity. Both are stored in the registry alongside the manifest rather than inside the
            image, so they travel with the image without changing its digest.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <pre className="text-xs leading-relaxed"><code>{`docker buildx build \\
  --sbom=true \\
  --provenance=mode=max \\
  -t registry.example.com/myapp:1.0 --push .

# inspect what was attached
docker buildx imagetools inspect registry.example.com/myapp:1.0 --format '{{ json .Provenance }}'`}</code></pre>
          </div>
          <p className="text-sm muted">
            Attestations are only useful if something checks them. On their own they are metadata; the
            value comes from a policy that refuses to deploy an image whose provenance does not name
            your builder, or whose SBOM has not been scanned. That verification step is the subject of{" "}
            <Link href="/blog/slsa-framework-explained" className="underline">
              the SLSA framework
            </Link>{" "}
            and, on the enforcement side,{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              admission control image scanning
            </Link>
            .
          </p>
          <p className="text-sm muted">
            One caveat on the generated SBOM: it reflects what the SBOM generator embedded in your
            builder detected, and detection quality varies by ecosystem. Treat it as a strong starting
            inventory rather than a guarantee of completeness, and cross-check it against a scan of
            the finished image. Our notes on{" "}
            <Link href="/blog/how-to-read-sbom" className="underline">
              reading an SBOM
            </Link>{" "}
            cover what these documents do and do not tell you.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A practical hardening checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              Add <code className="text-xs">{`# syntax=docker/dockerfile:1`}</code> to every Dockerfile
              so the mount flags are available.
            </li>
            <li>
              Replace every credential-carrying <code className="text-xs">ARG</code> and{" "}
              <code className="text-xs">COPY</code> with a secret or SSH mount.
            </li>
            <li>
              Pin base images by digest, not tag, so a rebuild is reproducible and a registry-side tag
              move cannot silently change your base.
            </li>
            <li>
              Run the builder rootless; do not mount the Docker socket into CI jobs.
            </li>
            <li>
              Restrict write access to the remote build cache to the same principals that can push
              images, and never share it with fork builds.
            </li>
            <li>
              Emit SBOM and provenance attestations, and enforce them at deploy time rather than just
              generating them.
            </li>
            <li>
              Use multi-stage builds so build tooling never reaches the runtime image &mdash; the
              pattern in{" "}
              <Link href="/blog/multi-stage-docker-builds-security" className="underline">
                multi-stage Docker builds
              </Link>
              .
            </li>
            <li>Scan the finished image, and fail the build on the severities you care about.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            BuildKit gets you a clean, well-described build. It does not tell you whether the result
            contains vulnerable packages &mdash; a build can be perfectly reproducible, attested, and
            rootless, and still ship a base image with an unpatched OpenSSL. That is the gap a scanner
            fills, at the end of the build rather than during it.
          </p>
          <p className="text-sm muted">
            ScanRook scans the image tarball your build produces. Export it with{" "}
            <code className="text-xs">--output type=docker,dest=image.tar</code> (or{" "}
            <code className="text-xs">docker save</code>) and scan that file directly, no registry
            round trip required:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <pre className="text-xs leading-relaxed"><code>{`curl -fsSL https://scanrook.io/install.sh | sh

docker buildx build --output type=docker,dest=image.tar -t myapp:1.0 .
scanrook scan image.tar --format json --out report.json`}</code></pre>
          </div>
          <p className="text-sm muted">
            It reads the real package databases inside the image rather than inferring from filenames,
            and matches each package against OSV, NVD, and Red Hat OVAL, so every finding carries the
            source it came from. That pairs naturally with the attestation story: provenance tells you
            where the image came from, the scan tells you what is in it. The{" "}
            <Link href="/docs" className="underline">
              docs
            </Link>{" "}
            cover exit codes for failing a build on severity thresholds.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is BuildKit?</h3>
              <p className="text-sm muted mt-1">
                The build engine behind modern Docker builds. It compiles a Dockerfile into a
                dependency graph, runs independent steps in parallel, and caches per step. You use it
                through <code className="text-xs">docker buildx</code>.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Are build arguments secure?</h3>
              <p className="text-sm muted mt-1">
                No. Build arg values are stored in image metadata and readable from image history. Use
                them for versions and tags, never for tokens or keys.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do secret mounts work?</h3>
              <p className="text-sm muted mt-1">
                <code className="text-xs">RUN --mount=type=secret,id=x</code> exposes the secret as a
                file under <code className="text-xs">/run/secrets/</code> for the duration of that
                step only. Nothing is written into a layer.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does BuildKit need root?</h3>
              <p className="text-sm muted mt-1">
                No. Rootless mode runs the daemon under user namespaces as an unprivileged user, which
                removes the need to mount a privileged Docker socket into CI jobs.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan what your build produced</h3>
          <p className="text-sm muted leading-relaxed">
            A hardened build still ships whatever the base image brought with it. Export the tarball
            from your BuildKit build and scan it &mdash; every finding carries its source and a
            confidence tier, so you can see what is actually there.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--dg-accent,#2563eb)] text-white px-4 py-2 text-sm font-medium"
            >
              Start scanning
            </Link>
            <Link href="/docs" className="btn-secondary">
              Read the docs
            </Link>
          </div>
        </section>

        <footer className="border-t border-black/10 dark:border-white/10 pt-4 text-xs muted grid gap-2">
          <p>
            <strong>Related reading:</strong>{" "}
            <Link href="/blog/multi-stage-docker-builds-security" className="underline">
              Multi-Stage Docker Builds and Security
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/docker-image-hardening-checklist" className="underline">
              Docker Image Hardening Checklist
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/software-supply-chain-security" className="underline">
              Software Supply Chain Security
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
