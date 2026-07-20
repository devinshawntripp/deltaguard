import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-25";

const title = `Skopeo: Inspect, Copy and Mirror Container Images Safely | ${APP_NAME}`;
const description =
  "Skopeo works with container images and registries without a daemon or root. Inspecting manifests, copying between transports, mirroring air-gapped registries and scanning.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "skopeo",
    "skopeo copy",
    "skopeo inspect",
    "skopeo sync",
    "container image transports",
    "skopeo docker-archive",
    "mirror container registry",
    "air-gapped registry",
    "skopeo policy.json",
    "container image digest",
  ],
  alternates: { canonical: "/blog/skopeo" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/skopeo",
    images: ["/blog/skopeo.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/skopeo.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Skopeo: Inspect, Copy and Mirror Container Images Safely",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/skopeo",
  image: "https://scanrook.io/blog/skopeo.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Skopeo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Skopeo is a command-line tool for working with container images and registries. It inspects manifests, copies images between storage formats, mirrors repositories and deletes tags — all without a container daemon and without requiring root. It comes from the same containers project family as Podman and Buildah.",
      },
    },
    {
      "@type": "Question",
      name: "How do you inspect an image without pulling it?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Run skopeo inspect against a docker:// reference. Skopeo fetches only the manifest and config blob from the registry, so you get the digest, layer list, labels, architecture and creation date without downloading any layer data. Adding --raw returns the manifest exactly as the registry serves it, including multi-architecture index documents.",
      },
    },
    {
      "@type": "Question",
      name: "What are Skopeo transports?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A transport is the prefix that tells Skopeo where an image lives: docker:// for a registry, docker-archive: for a docker save style tarball, oci: and oci-archive: for OCI layouts, dir: for an unpacked directory, and containers-storage: for local Podman storage. Any transport can be a source or a destination for skopeo copy.",
      },
    },
    {
      "@type": "Question",
      name: "How do you mirror images to an air-gapped registry?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use skopeo sync twice. On the connected side, sync from the upstream registry into a directory on removable media. On the isolated side, sync from that directory into the internal registry. Because sync preserves digests, the images inside the enclave are byte-identical to the ones you reviewed outside it.",
      },
    },
    {
      "@type": "Question",
      name: "Can Skopeo scan for vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Skopeo moves and inspects images; it has no package inventory or advisory data. It pairs well with a scanner though: skopeo copy can turn any registry reference into a local tarball with one command, and that tarball is exactly what a scanner needs as input.",
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
            Skopeo: Inspect, Copy and Mirror Container Images Safely
          </h1>
          <p className="text-sm muted">Published September 25, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Skopeo is the tool you reach for when you need to do something with a container image
            but do not want a container runtime involved. It inspects a remote manifest without
            pulling layers, copies images between registries and file formats, mirrors whole
            repositories across an air gap, and does all of it as an unprivileged user with no
            daemon running. For CI and for security work, that combination is hard to beat.
          </p>
        </header>

        <img
          src="/blog/skopeo.jpg"
          alt="Skopeo copying layered container images between two registries"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Skopeo is, and why no daemon matters</h2>
          <p className="text-sm muted">
            Skopeo comes from the containers project family &mdash; the same ecosystem as Podman,
            Buildah and the shared{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">containers/image</code>{" "}
            library that all three use to talk to registries. It is a single static-ish binary with
            no background service. Nothing listens on a socket, nothing needs to run as root, and
            nothing has to be mounted into your build container.
          </p>
          <p className="text-sm muted">
            That matters more than it sounds. The usual way to move an image around in CI is to run
            a Docker daemon, which either means a privileged container or mounting the host&apos;s{" "}
            <Link href="/blog/docker-socket" className="underline">
              Docker socket
            </Link>{" "}
            into the job &mdash; a well-known way to hand a build script root on the node. Skopeo
            removes the reason to do that for a large class of tasks: pulling, pushing, retagging,
            copying and inspecting no longer need a runtime at all.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Inspecting an image without pulling it</h2>
          <p className="text-sm muted">
            The command most people learn first is{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">skopeo inspect</code>.
            It fetches the manifest and config blob only, so you can interrogate an image from a
            registry in a fraction of a second:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# high-level view: digest, layers, labels, created date
skopeo inspect docker://docker.io/library/nginx:1.27

# just the immutable digest for a tag
skopeo inspect --format '{{.Digest}}' docker://docker.io/library/alpine:3.20

# the raw manifest, including a multi-arch index if there is one
skopeo inspect --raw docker://docker.io/library/alpine:3.20 | jq .

# the image config (entrypoint, user, env, history)
skopeo inspect --config docker://docker.io/library/nginx:1.27 | jq '.config.User'

# every tag published in a repository
skopeo list-tags docker://docker.io/library/postgres`}</pre>
          <p className="text-sm muted">
            Two of these are genuinely useful security primitives. Resolving a tag to a digest lets
            you detect tag drift: capture the digest at build time, compare it before deploy, and
            you will notice when someone republishes a tag under you. And{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--config</code>{" "}
            answers &ldquo;does this image run as root?&rdquo; without downloading a gigabyte of
            layers &mdash; if{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">.config.User</code>{" "}
            is empty or{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">0</code>,
            it does.
          </p>
          <p className="text-sm muted">
            Note that on a multi-architecture repository,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">inspect</code>{" "}
            resolves to the image matching your current platform unless you say otherwise with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--override-arch</code>{" "}
            or{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--override-os</code>.
            If you are scanning an arm64 deployment from an amd64 runner, that distinction changes
            your results.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Transports, and why they are the whole idea</h2>
          <p className="text-sm muted">
            Skopeo&apos;s central abstraction is the <strong>transport</strong>: a prefix naming
            where an image lives. Copy takes any transport as source and any transport as
            destination, which turns a lot of separate tools into one command.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Transport</th>
                  <th className="text-left py-2 pr-4 font-semibold">Refers to</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/10 dark:border-white/10">
                  <td className="py-2 pr-4"><code>docker://</code></td>
                  <td className="py-2 pr-4">An image in a remote registry</td>
                </tr>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <td className="py-2 pr-4"><code>docker-archive:</code></td>
                  <td className="py-2 pr-4">A tarball in the format <code>docker save</code> produces</td>
                </tr>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <td className="py-2 pr-4"><code>oci:</code> / <code>oci-archive:</code></td>
                  <td className="py-2 pr-4">An OCI image layout, as a directory or a tar</td>
                </tr>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <td className="py-2 pr-4"><code>dir:</code></td>
                  <td className="py-2 pr-4">Manifest and blobs unpacked into a plain directory</td>
                </tr>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <td className="py-2 pr-4"><code>containers-storage:</code></td>
                  <td className="py-2 pr-4">Local Podman / CRI-O image storage</td>
                </tr>
              </tbody>
            </table>
          </div>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# registry to registry, no local storage involved
skopeo copy \\
  docker://docker.io/library/redis:7-alpine \\
  docker://registry.internal.example.com/mirror/redis:7-alpine

# registry to a local tarball (this is the one scanners want)
skopeo copy \\
  docker://docker.io/library/nginx:1.27 \\
  docker-archive:nginx-1.27.tar:nginx:1.27

# copy every architecture in a manifest list, not just yours
skopeo copy --all \\
  docker://docker.io/library/alpine:3.20 \\
  oci:alpine-3.20:3.20

# authenticate without touching a shared docker config
skopeo copy --authfile ./ci-auth.json src dest`}</pre>
        </section>

        <img
          src="/blog/skopeo-2.jpg"
          alt="Container image manifest opened to reveal its digest and layer chain"
          className="rounded-lg my-8 w-full"
        />

        <figure className="grid gap-2">
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 720 240"
              role="img"
              aria-label="Hub diagram: skopeo copy sits at the centre and moves images between registry, docker-archive tarball, OCI layout, plain directory and local container storage transports"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <defs>
                <marker id="sk-arrow" markerWidth="8" markerHeight="8" refX="5.5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              <rect x={286} y={92} width={148} height={56} rx={10} fill="var(--dg-accent,#2563eb)" fillOpacity={0.14} stroke="currentColor" strokeOpacity={0.55} />
              <text x={360} y={116} textAnchor="middle" fontSize="14" fontWeight="600" fill="currentColor">skopeo copy</text>
              <text x={360} y={134} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>digests preserved</text>
              {[
                { x: 10, y: 14, w: 200, label: "docker:// registry", ax: 214, ay: 34 },
                { x: 510, y: 14, w: 200, label: "docker:// mirror registry", ax: 506, ay: 34 },
                { x: 10, y: 186, w: 200, label: "docker-archive: tarball", ax: 214, ay: 206 },
                { x: 510, y: 186, w: 200, label: "oci: / oci-archive:", ax: 506, ay: 206 },
                { x: 260, y: 196, w: 200, label: "containers-storage:", ax: 360, ay: 190 },
              ].map((n) => (
                <g key={n.label}>
                  <rect x={n.x} y={n.y} width={n.w} height={38} rx={7} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.35} />
                  <text x={n.x + n.w / 2} y={n.y + 24} textAnchor="middle" fontSize="12" fill="currentColor" fillOpacity={0.85}>
                    {n.label}
                  </text>
                  <line
                    x1={n.ax}
                    y1={n.ay}
                    x2={n.ax > 400 ? 440 : n.ax < 260 ? 280 : 360}
                    y2={n.ay < 120 ? 96 : n.ay > 180 ? 150 : 120}
                    stroke="currentColor"
                    strokeOpacity={0.3}
                    strokeWidth={1.5}
                    markerEnd="url(#sk-arrow)"
                  />
                </g>
              ))}
            </svg>
          </div>
          <figcaption className="text-xs muted">
            Any transport can be the source or the destination. That single property is what makes
            Skopeo useful in so many places.
          </figcaption>
        </figure>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Mirroring and air-gapped environments</h2>
          <p className="text-sm muted">
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">skopeo sync</code>{" "}
            extends copy to whole repositories, which is how most air-gapped estates get their
            images. The two-hop pattern is straightforward:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# --- connected side ---
skopeo sync \\
  --src docker --dest dir \\
  docker.io/library/postgres \\
  /media/transfer/

# --- isolated side, after moving the media ---
skopeo sync \\
  --src dir --dest docker \\
  /media/transfer/postgres \\
  registry.enclave.local/mirror`}</pre>
          <p className="text-sm muted">
            Because the copy preserves digests end to end, the image inside the enclave is
            byte-identical to the one you reviewed outside it. That property is what makes it safe
            to do the scanning and approval on the connected side &mdash; the artifact does not
            change in transit, so the scan result still describes it. If your internal registry is{" "}
            <Link href="/blog/harbor-registry" className="underline">
              Harbor
            </Link>
            , this is also how you seed its proxy cache for images the cache cannot reach directly.
          </p>
          <p className="text-sm muted">
            One flag deserves a warning.{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--src-tls-verify=false</code>{" "}
            and{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--dest-tls-verify=false</code>{" "}
            exist for local development against a self-signed registry, and they end up pasted into
            production CI far more often than they should. Add the CA to the trust store instead;
            disabling verification on the hop that carries your images into the cluster defeats a
            meaningful part of the point.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Signature policy</h2>
          <p className="text-sm muted">
            Skopeo shares the containers-family policy file at{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/etc/containers/policy.json</code>,
            which declares what the tool is willing to accept. The default on most installations
            accepts anything; tightening it to reject by default and allow only specific registries
            is a cheap control:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`{
  "default": [ { "type": "reject" } ],
  "transports": {
    "docker": {
      "registry.internal.example.com": [ { "type": "insecureAcceptAnything" } ],
      "docker.io/library":             [ { "type": "insecureAcceptAnything" } ]
    },
    "docker-archive": {
      "": [ { "type": "insecureAcceptAnything" } ]
    }
  }
}`}</pre>
          <p className="text-sm muted">
            Skopeo can also verify signatures as part of a copy, and can sign on the way out. In
            practice most teams have standardised on Sigstore for this, and the mechanics of that
            are covered in our piece on{" "}
            <Link href="/blog/sigstore-cosign-container-signing" className="underline">
              container signing with Cosign
            </Link>
            . Either way the useful discipline is the same: decide explicitly which registries you
            trust, and write it down somewhere a machine reads.
          </p>
        </section>

        <img
          src="/blog/skopeo-3.jpg"
          alt="Mirroring container artifacts across an air gap between isolated network zones"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Skopeo and a scanner compose neatly, because Skopeo produces exactly the input a scanner
            wants. ScanRook scans container image tarballs, and{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">skopeo copy</code>{" "}
            turns any registry reference into one in a single unprivileged command &mdash; no daemon,
            no socket mount, no root:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# resolve the tag to an immutable digest first
DIGEST=$(skopeo inspect --format '{{.Digest}}' docker://registry.example.com/team/api:v2.4)

# pull that exact image down as a tarball
skopeo copy \\
  "docker://registry.example.com/team/api@$DIGEST" \\
  docker-archive:api.tar:api:v2.4

# scan the artifact you just pinned
curl -fsSL https://scanrook.io/install.sh | sh
scanrook scan --file api.tar --format json --out report.json`}</pre>
          <p className="text-sm muted">
            Scanning by digest rather than tag is the detail worth keeping. The report then describes
            a specific immutable artifact, which is what you want when the same result has to be
            defensible weeks later. ScanRook reads the real installed package databases inside that
            tarball and matches them against OSV, NVD and Red Hat OVAL, so the findings reflect what
            is actually installed rather than what a filename suggests.
          </p>
          <p className="text-sm muted">
            This pattern is also what makes air-gapped scanning practical: mirror once with Skopeo,
            scan on whichever side of the gap has your tooling, and rely on digest preservation to
            know the two are the same image. If you are weighing that architecture, our comparison of{" "}
            <Link href="/blog/on-prem-vs-saas-scanning" className="underline">
              on-prem versus SaaS scanning
            </Link>{" "}
            goes through the trade-offs, and the{" "}
            <Link href="/blog/container-image-scanning-guide" className="underline">
              container image scanning guide
            </Link>{" "}
            covers the pipeline end to end.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Does Skopeo need Docker installed?</h3>
              <p className="text-sm muted mt-1">
                No. It talks to registries directly over HTTP and reads and writes image formats
                itself. That is why it works in a minimal CI container without a privileged runtime.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can it copy multi-architecture images?</h3>
              <p className="text-sm muted mt-1">
                Yes, with{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--all</code>,
                which copies every image referenced by the manifest list instead of only the one
                matching the host platform.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How does it authenticate?</h3>
              <p className="text-sm muted mt-1">
                Through{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">skopeo login</code>{" "}
                or an explicit{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--authfile</code>.
                In CI, prefer a job-scoped auth file over a shared credential store on the runner.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does copying change the image?</h3>
              <p className="text-sm muted mt-1">
                Not by default &mdash; digests are preserved, so the copy is byte-identical. That
                only changes if you ask Skopeo to recompress or convert the manifest format.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Copy it, then scan it</h3>
          <p className="text-sm muted leading-relaxed">
            One{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">skopeo copy</code>{" "}
            gets you a tarball; ScanRook turns it into a report backed by OSV, NVD and Red Hat OVAL,
            with every finding tagged by source and confidence.
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
            <Link href="/blog/harbor-registry" className="underline">
              Harbor Registry
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/sigstore-cosign-container-signing" className="underline">
              Sigstore and Cosign Container Signing
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-image-scanning-guide" className="underline">
              Container Image Scanning Guide
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
