import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-27";

const title = `Docker Socket Security: Why Mounting It Is Dangerous | ${APP_NAME}`;
const description =
  "Mounting the Docker socket into a container grants root-equivalent control of the host. Why /var/run/docker.sock is dangerous and how to avoid exposing it.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "docker socket",
    "docker socket security",
    "var run docker sock",
    "docker socket mount risk",
    "docker socket container escape",
    "docker socket proxy",
    "docker group root",
    "dind vs docker socket",
    "expose docker daemon tcp",
    "docker socket permissions",
  ],
  alternates: { canonical: "/blog/docker-socket" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/docker-socket",
    images: ["/blog/docker-socket.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/docker-socket.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Docker Socket Security: Why Mounting It Is Dangerous",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/docker-socket",
  image: "https://scanrook.io/blog/docker-socket.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the Docker socket?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Docker socket, at /var/run/docker.sock, is the Unix socket where the Docker daemon listens for Engine API requests. The docker CLI talks to it to build images, run containers, and manage everything else. On a standard rootful install the daemon runs as root, so the socket is effectively a control channel to a root-privileged service.",
      },
    },
    {
      "@type": "Question",
      name: "Why is mounting the Docker socket into a container dangerous?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Because access to the socket is access to a root daemon. A container that can reach the socket can ask the daemon to start a new privileged container that bind-mounts the host filesystem, then read or write anything on the host as root. The container boundary provides no protection once the socket is inside it, so a single compromised container becomes a full host compromise.",
      },
    },
    {
      "@type": "Question",
      name: "Does mounting the Docker socket read-only make it safe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. A read-only mount only affects the socket file's inode; it does not restrict which Engine API calls you can send over it. The socket is a bidirectional request-response channel, so a read-only mount still lets a client issue container-create and other state-changing commands. It provides a false sense of safety.",
      },
    },
    {
      "@type": "Question",
      name: "Is being in the docker group the same as root?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Effectively yes. Docker's own documentation warns that the docker group grants privileges equivalent to root, because any member can talk to the socket and launch a privileged container that controls the host. Adding a user to the docker group should be treated as granting them root on that machine.",
      },
    },
    {
      "@type": "Question",
      name: "How do I let a tool manage containers without exposing the socket?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Options include a Docker-in-Docker sidecar so the tool talks to an isolated daemon, a socket proxy that allows only the specific read-only API endpoints the tool needs, and rootless Docker so the daemon runs unprivileged. For scanning specifically, prefer tools that read a saved image tar and need no daemon access at all.",
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
            Docker Socket Security: Why Mounting It Is Dangerous
          </h1>
          <p className="text-sm muted">Published November 27, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            Mounting the Docker socket into a container is one of the most common shortcuts in
            container tooling and one of the most dangerous. Handing a container{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/var/run/docker.sock</code>{" "}
            gives it root-equivalent control of the host it runs on. This guide explains why the
            Docker socket is so powerful, where teams expose it without realizing, and the safer
            patterns that get the same job done.
          </p>
        </header>

        <img
          src="/blog/docker-socket.jpg"
          alt="Docker socket security and the container escape it enables"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What the Docker socket is</h2>
          <p className="text-sm muted">
            When you run{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker build</code>{" "}
            or{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker run</code>,
            the CLI is not doing the work &mdash; it is sending a request to the Docker daemon,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">dockerd</code>,
            over a Unix domain socket at{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/var/run/docker.sock</code>.
            That socket is the Docker Engine API endpoint. Anything the CLI can do &mdash; create
            containers, mount volumes, run privileged, read logs &mdash; is just an HTTP-style call
            over that socket.
          </p>
          <p className="text-sm muted">
            On a default install the daemon runs as <strong>root</strong>. The socket has no
            authentication of its own beyond filesystem permissions: it is owned by root and the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker</code>{" "}
            group. So the socket is not &ldquo;a Docker thing&rdquo; &mdash; it is an unauthenticated
            control channel to a root process. Whoever can write to it can tell root what to do.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why socket access equals host root</h2>
          <p className="text-sm muted">
            The container boundary does not help you here, because the whole point of the socket is
            to command the daemon that sits <em>outside</em> the container. A process that can reach
            the socket can ask the daemon to launch a brand-new container &mdash; privileged, with
            the host&apos;s root filesystem bind-mounted in &mdash; and then do whatever it likes to
            the host through that new container. The escape is a single command:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Inside a container that has the socket mounted, this
# starts a NEW container mounting the host's root at /host
# and drops into a root shell with full access to the host:
docker run --rm -it --privileged -v /:/host alpine \\
  chroot /host sh

# From there the "container" is the host: read /etc/shadow,
# write authorized_keys, install a backdoor, anything.`}</pre>
          <p className="text-sm muted">
            That is not an exotic exploit &mdash; it is the documented behavior of the API working as
            designed. This is different from a kernel-level container escape like{" "}
            <Link href="/blog/leaky-vessels-cve-2024-21626" className="underline">
              Leaky Vessels
            </Link>, which requires a vulnerability. The socket needs no vulnerability at all; it is
            an intended door, left standing open.
          </p>

          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 760 170" className="w-full h-auto" role="img" aria-label="Escalation path: a compromised container with the Docker socket mounted reaches the root daemon and then the host">
              <g fill="currentColor">
                <rect x="8" y="46" width="156" height="64" rx="6" fillOpacity="0.14" />
                <rect x="212" y="46" width="156" height="64" rx="6" fillOpacity="0.2" />
                <rect x="416" y="46" width="156" height="64" rx="6" fillOpacity="0.28" />
                <rect x="620" y="46" width="132" height="64" rx="6" fill="var(--dg-accent,#2563eb)" fillOpacity="0.55" />
              </g>
              <g textAnchor="middle" fill="currentColor">
                <text x="86" y="74" fontSize="13" fontWeight="600">Container</text>
                <text x="86" y="92" fontSize="10.5" fillOpacity="0.7">socket mounted</text>
                <text x="290" y="74" fontSize="13" fontWeight="600">docker.sock</text>
                <text x="290" y="92" fontSize="10.5" fillOpacity="0.7">/var/run/...</text>
                <text x="494" y="74" fontSize="13" fontWeight="600">dockerd</text>
                <text x="494" y="92" fontSize="10.5" fillOpacity="0.7">runs as root</text>
                <text x="686" y="74" fontSize="13" fontWeight="600">Host root</text>
                <text x="686" y="92" fontSize="10.5" fillOpacity="0.8">full control</text>
              </g>
              <g stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" fill="currentColor">
                <line x1="164" y1="78" x2="208" y2="78" /><path d="M212 78 l-8 -4 v8 z" fillOpacity="0.6" />
                <line x1="368" y1="78" x2="412" y2="78" /><path d="M416 78 l-8 -4 v8 z" fillOpacity="0.6" />
                <line x1="572" y1="78" x2="616" y2="78" /><path d="M620 78 l-8 -4 v8 z" fillOpacity="0.6" />
              </g>
              <text x="380" y="146" fontSize="11" textAnchor="middle" fill="currentColor" fillOpacity="0.6">Whoever can reach the socket can launch a privileged container and own the host</text>
            </svg>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where the socket gets exposed</h2>
          <p className="text-sm muted">
            Almost nobody sets out to hand a container root on the host; they mount the socket to get
            a job done and inherit the risk. The usual culprits:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>CI runners that build images.</strong> A pipeline step needs to run{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker build</code>,
              so the socket gets bind-mounted into the runner. Now any pull request that runs
              arbitrary build steps has root on the runner.
            </li>
            <li>
              <strong>Management and automation tools.</strong> Dashboards, reverse proxies that
              watch container events, and auto-updaters are frequently deployed with the socket
              mounted so they can see or control other containers.
            </li>
            <li>
              <strong>The docker group.</strong> Adding a user to the{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker</code>{" "}
              group so they can run Docker without{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">sudo</code>{" "}
              grants root-equivalent access &mdash; Docker&apos;s own docs say so explicitly.
            </li>
            <li>
              <strong>The daemon over TCP.</strong> Binding dockerd to{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">tcp://0.0.0.0:2375</code>{" "}
              with no TLS &mdash; still seen in tutorials &mdash; is worse than the socket: it is
              unauthenticated remote root, reachable by anyone who can route to the port.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How to avoid exposing it</h2>
          <p className="text-sm muted">
            The goal is to give tools the specific capability they need without handing over the
            whole daemon. In rough order of preference:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Do not mount it at all.</strong> Ask what the tool actually needs. Many that
              conventionally take the socket do not truly require full daemon control.
            </li>
            <li>
              <strong>Use Docker-in-Docker for builds.</strong> A dind sidecar gives a CI step its
              own isolated daemon over TCP, so a compromised build controls a throwaway daemon, not
              the host&apos;s.
            </li>
            <li>
              <strong>Put a socket proxy in front.</strong> A proxy such as the widely used
              docker-socket-proxy exposes only the specific, often read-only, API endpoints a tool
              needs &mdash; letting a reverse proxy watch container events without being able to
              create privileged containers.
            </li>
            <li>
              <strong>Run rootless Docker.</strong> With{" "}
              <Link href="/blog/docker-rootless-mode" className="underline">
                rootless mode
              </Link>{" "}
              the daemon runs as an unprivileged user, so socket access maps to that user rather than
              host root &mdash; a smaller blast radius if something does reach it.
            </li>
            <li>
              <strong>On Kubernetes, do not mount the node socket into pods.</strong> Modern clusters
              use containerd or CRI-O, not the Docker socket, and workloads should never mount a node
              runtime socket. Enforce it with{" "}
              <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
                admission control
              </Link>{" "}
              and Pod Security Standards.
            </li>
            <li>
              <strong>If you must expose the daemon remotely, require TLS.</strong> Use mutual TLS on
              port 2376 or tunnel over SSH &mdash; never plain TCP on 2375.
            </li>
          </ul>
          <p className="text-sm muted">
            And to be blunt about a myth: mounting the socket with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">:ro</code>{" "}
            does <em>not</em> make it safe. Read-only affects the socket file&apos;s inode, not which
            API calls you can send down the channel &mdash; a &ldquo;read-only&rdquo; socket will
            still happily create a privileged container. It is a false sense of safety, not a
            control. These practices sit alongside the rest of a{" "}
            <Link href="/blog/docker-security-guide" className="underline">
              Docker hardening baseline
            </Link>.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Scanning without the socket</h2>
          <p className="text-sm muted">
            Vulnerability scanning is a place teams often reach for the socket unnecessarily &mdash;
            wiring a scanner to the daemon so it can pull and inspect images. It does not need to.
            ScanRook reads a saved image archive and needs no Docker daemon access at all: export the
            image to a tar with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker save</code>{" "}
            and scan the file.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# No socket mount, no privileged container -- just a file
docker save myapp:ci -o myapp.tar
scanrook scan --file myapp.tar --mode deep --format json --out report.json`}</pre>
          <p className="text-sm muted">
            In CI, the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker save</code>{" "}
            can run in the build step that already has a daemon (ideally a dind sidecar), and the scan
            runs in a plain unprivileged container against the resulting tar. The scanner never
            touches the socket, so it adds no new attack surface. That is the principle throughout the{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              container security checklist
            </Link>: grant the minimum, and prefer tools that ask for less.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is the Docker socket?</h3>
              <p className="text-sm muted mt-1">
                The Unix socket at{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/var/run/docker.sock</code>{" "}
                where the Docker daemon listens for Engine API calls. On a default install that daemon
                runs as root.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why is mounting it dangerous?</h3>
              <p className="text-sm muted mt-1">
                Socket access is root-daemon access. A container with the socket can launch a
                privileged container that mounts the host filesystem, turning one compromised
                container into a full host compromise.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does read-only make it safe?</h3>
              <p className="text-sm muted mt-1">
                No. A read-only mount affects the socket file&apos;s inode, not which API calls you
                can send &mdash; a client can still create privileged containers. It is false comfort.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do tools manage containers safely?</h3>
              <p className="text-sm muted mt-1">
                Docker-in-Docker sidecars, a socket proxy that allows only the needed endpoints, and
                rootless Docker. For scanning, prefer tools that read a saved tar and need no daemon.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan images without touching the socket</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook reads a saved image tar and needs no Docker daemon access &mdash; so you can scan
            every image in CI without mounting the socket or running a privileged container. Multi-source
            findings, no new attack surface.
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
            <Link href="/blog/docker-security-guide" className="underline">
              Docker Security Hardening Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/docker-rootless-mode" className="underline">
              Docker Rootless Mode
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/leaky-vessels-cve-2024-21626" className="underline">
              Leaky Vessels (CVE-2024-21626)
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
