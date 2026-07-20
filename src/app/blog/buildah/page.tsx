import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-01";

const title = `Buildah: Rootless, Daemonless Container Builds | ${APP_NAME}`;
const description =
  "How Buildah builds OCI images without a daemon or root: the scriptable build model, rootless CI patterns, minimal images from scratch, and how to scan what you build.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "buildah",
    "buildah vs docker",
    "rootless container builds",
    "buildah bud",
    "daemonless image build",
    "buildah podman",
    "oci image build",
    "buildah tutorial",
    "buildah ci",
    "containerfile",
  ],
  alternates: { canonical: "/blog/buildah" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/buildah",
    images: ["/blog/buildah.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/buildah.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Buildah: Rootless, Daemonless Container Builds",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/buildah",
  image: "https://scanrook.io/blog/buildah.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Buildah?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Buildah is an open-source tool for building OCI-compliant container images without a long-running daemon. It can build from a Containerfile or Dockerfile exactly like docker build, and it can also build images step by step from shell commands, giving you scriptable control over each layer. It is maintained alongside Podman and Skopeo as part of the same container tooling family.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between Buildah and Podman?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Buildah builds images; Podman runs containers. Podman actually embeds Buildah for its build subcommand, so podman build and buildah build do essentially the same work. Buildah exposes lower-level primitives that Podman does not, such as mounting a working container's filesystem on the host and committing a container to an image at an arbitrary point.",
      },
    },
    {
      "@type": "Question",
      name: "Can Buildah build images without root?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Buildah supports rootless builds using user namespaces, so an unprivileged user can build images without a privileged daemon and without access to a container socket. This is the main reason teams adopt it for CI, where mounting the Docker socket into a build job effectively grants root on the host.",
      },
    },
    {
      "@type": "Question",
      name: "Does Buildah use a Dockerfile?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. buildah build (historically buildah bud, for build-using-dockerfile) accepts a standard Dockerfile or Containerfile and produces the same result you would expect from docker build. The two filenames are interchangeable; Containerfile is simply the vendor-neutral name and is picked up automatically.",
      },
    },
    {
      "@type": "Question",
      name: "How do you scan an image built with Buildah?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Push the built image to a local archive with buildah push, for example to an oci-archive or docker-archive destination, and scan the resulting tarball. This works without a registry and without a running container engine, which suits a rootless CI job where you want to scan before the image is pushed anywhere.",
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
            Buildah: Rootless, Daemonless Container Builds
          </h1>
          <p className="text-sm muted">Published October 1, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Buildah builds OCI container images without a daemon and without root. That sounds like a
            small operational detail until you look at what mounting a Docker socket into a CI job
            actually grants. Beyond the security story, Buildah offers a build model Dockerfiles
            cannot express &mdash; images assembled step by step from ordinary shell &mdash; which
            turns out to be the cleanest way to produce genuinely minimal images.
          </p>
        </header>

        <img
          src="/blog/buildah.jpg"
          alt="Buildah assembling an OCI container image from layers without a daemon"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Buildah is, and what it is not</h2>
          <p className="text-sm muted">
            Buildah is a tool for creating OCI-compliant container images. It sits in the same family
            as Podman (which runs containers) and Skopeo (which moves images between registries and
            archives), and the three are deliberately split along single-responsibility lines. Podman
            embeds Buildah for its own <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">build</code>{" "}
            subcommand, so if you have run <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">podman build</code>{" "}
            you have already run Buildah.
          </p>
          <p className="text-sm muted">
            Two properties define it. <strong>Daemonless</strong>: there is no background service
            holding state and no socket to talk to. A build is just a process that exits. And{" "}
            <strong>rootless</strong>: with user namespaces, an unprivileged user can build images
            without any privileged component in the loop. Compare that to the classic Docker
            arrangement, where the client talks to a root-owned daemon over a socket:
          </p>
          <figure className="grid gap-2">
            <div className="overflow-x-auto surface-card p-4">
              <svg
                viewBox="0 0 700 250"
                role="img"
                aria-label="Comparison of build architectures: a Docker client talking to a root-owned daemon over a socket, versus Buildah running as an unprivileged process in a user namespace with no daemon"
                className="w-full"
                style={{ minWidth: 560 }}
              >
                <defs>
                  <marker id="bh-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                  </marker>
                </defs>

                <text x={12} y={20} fontSize="11" fontWeight="600" fill="currentColor" fillOpacity={0.75}>
                  Daemon-based build
                </text>
                <rect x={12} y={30} width={120} height={44} rx={8} fill="transparent" stroke="currentColor" strokeOpacity={0.45} />
                <text x={72} y={57} textAnchor="middle" fontSize="12" fill="currentColor">CI job (user)</text>
                <line x1={134} y1={52} x2={196} y2={52} stroke="currentColor" strokeWidth={2} markerEnd="url(#bh-arrow)" />
                <text x={165} y={44} textAnchor="middle" fontSize="9.5" fill="currentColor" fillOpacity={0.6}>socket</text>
                <rect x={204} y={30} width={150} height={44} rx={8} fill="currentColor" fillOpacity={0.08} stroke="currentColor" strokeOpacity={0.45} />
                <text x={279} y={51} textAnchor="middle" fontSize="12" fill="currentColor">Daemon</text>
                <text x={279} y={66} textAnchor="middle" fontSize="9.5" fill="currentColor" fillOpacity={0.6}>runs as root</text>
                <line x1={356} y1={52} x2={418} y2={52} stroke="currentColor" strokeWidth={2} markerEnd="url(#bh-arrow)" />
                <rect x={426} y={30} width={130} height={44} rx={8} fill="transparent" stroke="currentColor" strokeOpacity={0.45} />
                <text x={491} y={57} textAnchor="middle" fontSize="12" fill="currentColor">Image</text>
                <text x={572} y={57} fontSize="10" fill="currentColor" fillOpacity={0.6}>trust boundary crossed</text>

                <line x1={12} y1={100} x2={688} y2={100} stroke="currentColor" strokeOpacity={0.15} />

                <text x={12} y={130} fontSize="11" fontWeight="600" fill="currentColor" fillOpacity={0.75}>
                  Buildah, rootless
                </text>
                <rect x={12} y={140} width={120} height={44} rx={8} fill="transparent" stroke="currentColor" strokeOpacity={0.45} />
                <text x={72} y={167} textAnchor="middle" fontSize="12" fill="currentColor">CI job (user)</text>
                <line x1={134} y1={162} x2={196} y2={162} stroke="currentColor" strokeWidth={2} markerEnd="url(#bh-arrow)" />
                <rect x={204} y={140} width={150} height={44} rx={8} fill="var(--dg-accent,#2563eb)" fillOpacity={0.12} stroke="currentColor" strokeOpacity={0.45} />
                <text x={279} y={161} textAnchor="middle" fontSize="12" fill="currentColor">buildah</text>
                <text x={279} y={176} textAnchor="middle" fontSize="9.5" fill="currentColor" fillOpacity={0.6}>user namespace</text>
                <line x1={356} y1={162} x2={418} y2={162} stroke="currentColor" strokeWidth={2} markerEnd="url(#bh-arrow)" />
                <rect x={426} y={140} width={130} height={44} rx={8} fill="transparent" stroke="currentColor" strokeOpacity={0.45} />
                <text x={491} y={167} textAnchor="middle" fontSize="12" fill="currentColor">Image</text>
                <text x={572} y={167} fontSize="10" fill="currentColor" fillOpacity={0.6}>no privileged hop</text>

                <text x={12} y={222} fontSize="10" fill="currentColor" fillOpacity={0.55}>
                  Same output. The difference is how much privilege the build path requires.
                </text>
              </svg>
            </div>
            <figcaption className="text-xs muted">
              Both paths produce an OCI image. The daemon-based path routes the build through a
              root-owned process; the rootless path does not.
            </figcaption>
          </figure>
          <p className="text-sm muted">
            The security argument is concrete rather than theoretical. Anyone who can reach a Docker
            socket can start a container that mounts the host filesystem, which is effectively root
            on that machine &mdash; the point we make at length in{" "}
            <Link href="/blog/docker-socket" className="underline">why the Docker socket is dangerous</Link>.
            In a shared CI runner, that is a real escalation path from &ldquo;can open a pull
            request&rdquo; to &ldquo;owns the build fleet&rdquo;. Removing the socket removes the
            path.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The familiar way: build from a Containerfile</h2>
          <p className="text-sm muted">
            You do not have to change how you write builds to adopt Buildah. It consumes a standard
            Dockerfile, and it also picks up the vendor-neutral{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">Containerfile</code>{" "}
            name automatically:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`# build from ./Containerfile (or ./Dockerfile) in the current directory
buildah build -t myapp:1.4.0 .

# multi-stage, targeting a specific stage, with a build argument
buildah build \\
  --target runtime \\
  --build-arg VERSION=1.4.0 \\
  -t myapp:1.4.0 .

# list what you produced
buildah images

# export to a tarball you can scan or ship without a registry
buildah push myapp:1.4.0 oci-archive:myapp-1.4.0.tar`}
          </pre>
          <p className="text-sm muted">
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">buildah bud</code> is the
            older name for the same command &mdash; <em>build using Dockerfile</em> &mdash; and still
            works; <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">buildah build</code>{" "}
            is the current spelling. Multi-stage builds behave exactly as you would expect, and the
            guidance in{" "}
            <Link href="/blog/multi-stage-docker-builds-security" className="underline">
              multi-stage Docker builds for security
            </Link>{" "}
            carries over unchanged.
          </p>
        </section>

        <img
          src="/blog/buildah-2.jpg"
          alt="Rootless container build isolated in a user namespace without privileged access"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The interesting way: build with shell</h2>
          <p className="text-sm muted">
            This is the capability that has no Docker equivalent. Buildah can create a{" "}
            <em>working container</em>, let you modify it with ordinary commands, and commit it to an
            image whenever you like. The build is a script, not a DSL, so it composes with everything
            else in your shell.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`#!/usr/bin/env bash
set -euo pipefail

# create a working container from a base image; the name comes back on stdout
ctr=$(buildah from registry.access.redhat.com/ubi9/ubi-minimal:latest)

# run commands inside it
buildah run "$ctr" -- microdnf install -y ca-certificates
buildah run "$ctr" -- microdnf clean all

# copy artifacts in from the host
buildah copy "$ctr" ./dist/server /usr/local/bin/server

# set image configuration without a Dockerfile instruction
buildah config \\
  --user 10001:10001 \\
  --port 8080 \\
  --env APP_ENV=production \\
  --label org.opencontainers.image.version=1.4.0 \\
  --entrypoint '["/usr/local/bin/server"]' \\
  "$ctr"

# freeze it into an image and clean up the working container
buildah commit --rm "$ctr" myapp:1.4.0`}
          </pre>
          <p className="text-sm muted">
            Now the genuinely useful trick: <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">buildah from scratch</code>{" "}
            plus <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">buildah mount</code>{" "}
            gives you the container&apos;s filesystem as a normal directory on the host, so you can
            populate it with host tooling &mdash; no package manager needs to exist inside the image
            at all.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`# rootless: mounting requires being inside the user namespace
buildah unshare bash -euo pipefail <<'SCRIPT'
ctr=$(buildah from scratch)
mnt=$(buildah mount "$ctr")

install -Dm0755 ./dist/server "$mnt/usr/local/bin/server"
install -Dm0644 /etc/ssl/certs/ca-bundle.crt "$mnt/etc/ssl/certs/ca-bundle.crt"

buildah umount "$ctr"
buildah config --user 10001:10001 --entrypoint '["/usr/local/bin/server"]' "$ctr"
buildah commit --rm "$ctr" myapp-minimal:1.4.0
SCRIPT`}
          </pre>
          <p className="text-sm muted">
            The result is an image containing a static binary and a CA bundle and nothing else &mdash;
            no shell, no package manager, no libc you did not put there. That is the same destination
            as the{" "}
            <Link href="/blog/migrating-to-distroless-images" className="underline">distroless approach</Link>,
            reached by a different route, and it has the same payoff: the packages that are not
            present cannot be vulnerable. Our{" "}
            <Link href="/blog/minimal-docker-images-guide" className="underline">minimal Docker images guide</Link>{" "}
            covers the tradeoffs, chiefly that debugging an image with no shell requires different
            habits.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Running Buildah in CI</h2>
          <p className="text-sm muted">
            The most common reason teams adopt Buildah is to stop mounting a container socket into
            build jobs. A rootless build inside a container needs a little setup &mdash; the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">chroot</code> isolation
            mode and the <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">vfs</code>{" "}
            storage driver avoid needing extra kernel privileges, at some cost in build speed:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`build-image:
  image: quay.io/buildah/stable:latest
  variables:
    STORAGE_DRIVER: vfs
    BUILDAH_ISOLATION: chroot
  script:
    - buildah build -t "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA" .
    - buildah push "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA" oci-archive:image.tar
    - scanrook scan image.tar --format json --out report.json
  artifacts:
    paths: [report.json]`}
          </pre>
          <p className="text-sm muted">
            Note the ordering: the image is exported to a local archive and scanned{" "}
            <em>before</em> it is pushed to a registry. Scanning a tarball needs no registry
            credentials, no daemon, and no network round trip, which is the pattern we recommend
            throughout{" "}
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              scanning Docker images for vulnerabilities
            </Link>
            . If a build fails its policy gate, nothing was ever published.
          </p>
          <p className="text-sm muted">
            One practical caveat: rootless builds need subordinate UID and GID ranges configured for
            the build user (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/etc/subuid</code>{" "}
            and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/etc/subgid</code>).
            Most published Buildah images handle this, but it is the first thing to check when a
            build fails with a confusing permissions error. The same mechanics underpin{" "}
            <Link href="/blog/docker-rootless-mode" className="underline">Docker rootless mode</Link>{" "}
            if you would rather stay on Docker.
          </p>
        </section>

        <img
          src="/blog/buildah-3.jpg"
          alt="Container image artifacts flowing from a build pipeline to a registry"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A short hardening checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Pin base images by digest.</strong>{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">buildah from image@sha256:...</code>{" "}
              makes the build reproducible and removes the tag-mutation surprise.
            </li>
            <li>
              <strong>Set a non-root user in image config.</strong> Buildah will not do it for you;{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">buildah config --user 10001:10001</code>{" "}
              is one line and removes a whole class of runtime findings.
            </li>
            <li>
              <strong>Clean package caches in the same step that creates them.</strong> Buildah
              commits layers the same way Docker does, so a cache deleted in a later step is still in
              the image.
            </li>
            <li>
              <strong>Add OCI annotation labels.</strong>{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">org.opencontainers.image.source</code>{" "}
              and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.revision</code> make
              provenance traceable later.
            </li>
            <li>
              <strong>Sign what you push.</strong> Buildah composes cleanly with{" "}
              <Link href="/blog/sigstore-cosign-container-signing" className="underline">Sigstore and Cosign</Link>{" "}
              once the image is in a registry.
            </li>
            <li>
              <strong>Scan the archive, not the registry copy.</strong> Faster, credential-free, and
              it happens before publication rather than after.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Buildah next to the other build tools</h2>
          <p className="text-sm muted">
            Buildah is not the only way to build images without a privileged daemon, and the honest
            comparison matters more than advocacy here.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Tool</th>
                  <th className="text-left py-2 pr-4 font-semibold">Model</th>
                  <th className="text-left py-2 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Buildah</strong></td>
                  <td className="py-2 pr-4 align-top">Daemonless CLI</td>
                  <td className="py-2 align-top">Containerfile builds plus scriptable step-by-step assembly; rootless</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>BuildKit</strong></td>
                  <td className="py-2 pr-4 align-top">Build backend</td>
                  <td className="py-2 align-top">Excellent caching and parallelism; rootless mode exists; Dockerfile-centric</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Kaniko</strong></td>
                  <td className="py-2 pr-4 align-top">In-cluster builder</td>
                  <td className="py-2 align-top">Runs as a Kubernetes pod without a daemon; designed for cluster CI</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top"><strong>Docker</strong></td>
                  <td className="py-2 pr-4 align-top">Client + daemon</td>
                  <td className="py-2 align-top">Ubiquitous and well understood; the socket is the security cost</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            If your builds are Dockerfile-shaped and cache performance is the dominant concern,
            BuildKit is hard to beat and its rootless mode addresses the same privilege problem. If
            builds run as Kubernetes jobs, Kaniko fits that shape natively. Buildah&apos;s
            differentiator is the scriptable path: the ability to mount a working container as a
            directory and populate it with host tooling is genuinely unique, and it is what makes
            from-scratch images practical without a builder stage full of copy gymnastics. Teams on
            Red Hat platforms also get it as the default, already installed and supported.
          </p>
          <p className="text-sm muted">
            A note on caching, since it is the most common complaint after migrating: Buildah&apos;s
            layer caching behaviour differs from BuildKit&apos;s, and it does not do the same
            aggressive parallel dependency resolution. For a build that leaned on BuildKit cache
            mounts, expect to re-tune. That is a real cost and worth measuring before a wholesale
            switch rather than after.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook scans image tarballs directly. That matters for a Buildah workflow, because the
            natural output of <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">buildah push … oci-archive:</code>{" "}
            is exactly a tarball, and it means the scan step needs no daemon, no socket, and no
            registry &mdash; which would rather defeat the purpose of a rootless build.
          </p>
          <p className="text-sm muted">
            Inside the archive we read the real package databases rather than guessing from
            filenames, and match every component against OSV, NVD, and Red Hat OVAL in parallel, with
            each finding carrying its source and a confidence tier. That last part is worth having
            when you build on UBI or other Red Hat bases, where backported fixes mean the upstream
            version number alone will mislead you &mdash; the problem we unpack in{" "}
            <Link href="/blog/redhat-backporting-explained" className="underline">
              how Red Hat backports security patches
            </Link>
            . The{" "}
            <Link href="/blog/docker-image-hardening-checklist" className="underline">
              image hardening checklist
            </Link>{" "}
            covers what to do with what you find.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is Buildah?</h3>
              <p className="text-sm muted mt-1">
                A daemonless tool for building OCI images, from a Containerfile or step by step from
                shell commands, maintained alongside Podman and Skopeo.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Buildah or Podman?</h3>
              <p className="text-sm muted mt-1">
                Both. Podman runs containers and embeds Buildah for builds; Buildah adds lower-level
                primitives such as mounting and committing a working container.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does it work with Dockerfiles?</h3>
              <p className="text-sm muted mt-1">
                Yes &mdash; <code>buildah build</code> consumes a standard Dockerfile or
                Containerfile, including multi-stage builds and build arguments.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I scan the result?</h3>
              <p className="text-sm muted mt-1">
                Push to an <code>oci-archive</code> or <code>docker-archive</code> tarball and scan
                that file, before the image reaches a registry.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan the tarball, before it ships</h3>
          <p className="text-sm muted leading-relaxed">
            Export your Buildah image to an archive and scan it with ScanRook in the same rootless
            job &mdash; no daemon, no socket, no registry credentials. Every finding shows the
            advisory source it came from.
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
            <Link href="/blog/docker-socket" className="underline">
              The Docker Socket Is a Root Shell
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/minimal-docker-images-guide" className="underline">
              Minimal Docker Images Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/multi-stage-docker-builds-security" className="underline">
              Multi-Stage Docker Builds for Security
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
