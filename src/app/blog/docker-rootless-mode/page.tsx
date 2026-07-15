import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-02";

const title = `Docker Rootless Mode: How and Why to Run Without Root | ${APP_NAME}`;
const description =
  "Docker rootless mode runs the daemon as a non-root user so a container escape lands unprivileged. How it works, how to set it up, and its limits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "docker rootless",
    "docker rootless mode",
    "rootless docker setup",
    "run docker without root",
    "dockerd-rootless-setuptool",
    "docker user namespaces",
    "rootless container security",
    "docker rootless vs userns-remap",
    "rootless docker networking",
    "docker daemon non-root",
  ],
  alternates: { canonical: "/blog/docker-rootless-mode" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/docker-rootless-mode",
    images: ["/blog/docker-rootless-mode.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/docker-rootless-mode.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Docker Rootless Mode: How and Why to Run Without Root",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/docker-rootless-mode",
  image: "https://scanrook.io/blog/docker-rootless-mode.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Docker rootless mode?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Rootless mode runs the Docker daemon and containers as a non-root user, using Linux user namespaces so the user's own account maps to a range of subordinate UIDs. It was introduced experimentally in Docker Engine 19.03 and became a supported feature in 20.10. The point is that a container escape or a daemon compromise lands as an unprivileged user rather than as root on the host.",
      },
    },
    {
      "@type": "Question",
      name: "How is rootless mode different from user-namespace remapping?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "With userns-remap the Docker daemon still runs as root and only remaps the container's users to unprivileged host UIDs. Rootless mode goes further: the daemon process itself runs unprivileged, so even a bug in the daemon does not grant host root. Rootless is the stronger boundary but has more limitations around networking, storage, and resource limits.",
      },
    },
    {
      "@type": "Question",
      name: "Can rootless Docker bind to ports below 1024?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not by default, because binding privileged ports normally requires root. You can allow it by lowering the unprivileged port threshold with sysctl net.ipv4.ip_unprivileged_port_start=0, or by granting the CAP_NET_BIND_SERVICE capability to the rootlesskit binary. Many teams sidestep it entirely by publishing a high port and letting a reverse proxy or load balancer handle 80 and 443.",
      },
    },
    {
      "@type": "Question",
      name: "What are the main limitations of rootless Docker?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Networking is slower and more constrained because it runs through a userspace stack; enforcing CPU and memory limits requires cgroup v2 with systemd; the overlay2 storage driver needs a recent kernel or fuse-overlayfs; and features like host networking and some mounts behave differently. For most application workloads these are manageable, but they are real and worth testing before you commit.",
      },
    },
    {
      "@type": "Question",
      name: "Does rootless mode make image scanning unnecessary?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Rootless mode limits what a compromised container can do to the host, but it does nothing about vulnerable packages inside the image itself. A rootless container running an outdated OpenSSL is still exploitable in-process. Rootless mode and image scanning address different halves of the problem and are used together.",
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
            Docker Rootless Mode: How and Why to Run Without Root
          </h1>
          <p className="text-sm muted">Published August 2, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            Docker rootless mode runs the entire daemon as an ordinary, unprivileged user. It closes
            one of the oldest gaps in container security &mdash; the fact that the daemon runs as
            root &mdash; so a break-out or a daemon bug no longer means instant host root. Here is
            how it works, how to set it up, and the tradeoffs you need to know before switching.
          </p>
        </header>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The problem rootless mode solves</h2>
          <p className="text-sm muted">
            In a standard install the Docker daemon (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">dockerd</code>)
            runs as root. That is convenient &mdash; it can manage networks, mount filesystems, and
            create namespaces freely &mdash; but it means two dangerous things. Anyone who can talk
            to the Docker socket effectively has root on the host, and any container that escapes its
            namespace while running as root arrives on the host as root. You can mitigate the second
            with user-namespace remapping, but the daemon itself is still a root-owned process.
          </p>
          <p className="text-sm muted">
            Rootless mode removes that last root process. The daemon runs under your user account,
            and Linux <strong>user namespaces</strong> map your single real UID to a range of
            subordinate UIDs so containers can still have their own &ldquo;root&rdquo; and multiple
            users internally. To the host kernel, though, all of it is just your unprivileged
            account. Introduced experimentally in Docker 19.03 and supported since 20.10, it is now
            a mature option rather than an experiment.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Prerequisites</h2>
          <p className="text-sm muted">
            Rootless mode leans on a few kernel and userspace features. On a modern distribution most
            are already present, but check them before you start:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">newuidmap</code>{" "}
              and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">newgidmap</code>{" "}
              setuid helpers, shipped in the <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">uidmap</code> package.
            </li>
            <li>
              A range of subordinate UIDs and GIDs assigned to your user in{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/etc/subuid</code> and{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/etc/subgid</code> (at least 65,536 IDs).
            </li>
            <li>
              cgroup v2 with a systemd user session if you want to enforce CPU, memory, and PID
              limits per container.
            </li>
            <li>
              A kernel new enough (5.11+) for rootless overlay2, or the{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">fuse-overlayfs</code> package as a fallback.
            </li>
          </ul>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Debian/Ubuntu: install the helpers and confirm your subordinate ID range
sudo apt-get install -y uidmap
grep "^$(whoami):" /etc/subuid /etc/subgid
# e.g. yourname:100000:65536  -> 65536 subordinate IDs starting at 100000`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Installing the rootless daemon</h2>
          <p className="text-sm muted">
            If Docker is already installed system-wide, the packaged setup tool provisions a
            per-user daemon. Run it as your normal user &mdash; not with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">sudo</code>:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Provision the rootless daemon for the current user
dockerd-rootless-setuptool.sh install

# Point your client at the per-user socket
export DOCKER_HOST=unix:///run/user/$(id -u)/docker.sock

# Start it as a user service and keep it running after logout
systemctl --user enable --now docker
sudo loginctl enable-linger "$(whoami)"`}</pre>
          <p className="text-sm muted">
            On a machine with no Docker at all, the convenience installer does the same in one step:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`curl -fsSL https://get.docker.com/rootless | sh`}</pre>
          <p className="text-sm muted">
            The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">loginctl enable-linger</code>{" "}
            line matters: without it, your user services (and therefore the daemon) stop when you log
            out, which is rarely what you want on a server.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Verifying it is really rootless</h2>
          <p className="text-sm muted">
            Confirm the daemon and containers are running under your user, not root:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# The context and security options should report rootless
docker info --format '{{ .SecurityOptions }}'
# expect a line containing: name=rootless

# The daemon process should be owned by your user, not root
ps -o user= -C dockerd
# expect your username

# A container "root" maps to an unprivileged host UID
docker run --rm alpine id
# uid=0 inside, but on the host it is one of your subordinate UIDs`}</pre>
          <p className="text-sm muted">
            That last point is the whole idea: <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">uid=0</code>{" "}
            inside the container is a subordinate UID on the host, so &ldquo;root&rdquo; in the
            container owns nothing outside its namespace.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The tradeoffs, honestly</h2>
          <p className="text-sm muted">
            Rootless mode is a genuine security win, but it is not free. Know these before you migrate
            production workloads:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Networking.</strong> Container traffic runs through a userspace network stack
              (RootlessKit with slirp4netns or a built-in equivalent), which is slower than the
              kernel bridge and changes how source IPs appear. High-throughput or latency-sensitive
              services should benchmark it.
            </li>
            <li>
              <strong>Privileged ports.</strong> Binding ports below 1024 needs an extra step
              (below), because that is a privileged operation.
            </li>
            <li>
              <strong>Resource limits.</strong> <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--memory</code>,{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--cpus</code>, and{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--pids-limit</code>{" "}
              only take effect with cgroup v2 and a systemd user session.
            </li>
            <li>
              <strong>Storage.</strong> Rootless overlay2 needs a 5.11+ kernel; otherwise you fall
              back to fuse-overlayfs, which is slower.
            </li>
            <li>
              <strong>Not everything works.</strong> Host networking, some bind-mount patterns, and a
              handful of privileged workloads behave differently or not at all.
            </li>
          </ul>
          <p className="text-sm muted">
            To allow low ports, either lower the unprivileged threshold or grant the capability to
            the RootlessKit binary:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Option A: allow all users to bind low ports (host-wide sysctl)
echo 'net.ipv4.ip_unprivileged_port_start=0' | sudo tee /etc/sysctl.d/99-rootless.conf
sudo sysctl --system

# Option B: grant the bind capability to rootlesskit only, then restart
sudo setcap cap_net_bind_service=ep "$(which rootlesskit)"
systemctl --user restart docker`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Rootless Docker vs Podman</h2>
          <p className="text-sm muted">
            It is worth being honest that Docker is not the only way to get here. Podman was designed
            rootless and daemonless from the start &mdash; there is no long-running root process at
            all, and it is largely CLI-compatible with Docker. If you are building a host from
            scratch and rootless operation is a hard requirement, Podman reaches it with fewer moving
            parts. If you already run Docker and want the same security benefit without changing your
            tooling, rootless Docker is the incremental path. Both end up in the same place: no
            root-owned container daemon.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">When rootless is the wrong choice</h2>
          <p className="text-sm muted">
            Rootless mode is a security upgrade, but it is not universally the right call, and
            pretending otherwise leads to painful migrations. Skip it, or plan carefully, when any of
            these apply:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>You need host networking or raw performance.</strong> The userspace network
              stack adds overhead and changes source-IP behavior; a high-throughput edge proxy on
              bare metal should benchmark before committing.
            </li>
            <li>
              <strong>You depend on privileged device access.</strong> Some GPU, FUSE, or low-level
              device workflows expect capabilities that are awkward or unavailable rootless.
            </li>
            <li>
              <strong>You are already on Kubernetes.</strong> Managed clusters usually run containerd
              or CRI-O, not dockerd, so rootless Docker is mostly a concern for single hosts, CI
              runners, and developer laptops rather than the cluster itself.
            </li>
          </ul>
          <p className="text-sm muted">
            The sweet spot is exactly those single-host and CI cases: a build runner that executes
            untrusted pull-request code, or a developer machine, gains a real security boundary from
            rootless mode at almost no cost. A latency-critical production service on dedicated
            hardware is where you weigh the tradeoffs most carefully &mdash; and where user-namespace
            remapping can be a lighter-touch middle ground that still keeps container root off the
            host.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Rootless mode hardens <em>how</em> a container runs. It does nothing about <em>what</em>{" "}
            is inside the image. A rootless container is still running whatever packages you built
            into it, and if one of them carries a critical CVE, the flaw is exploitable in-process
            regardless of how unprivileged the daemon is. That is the gap scanning closes: ScanRook
            reads the package databases inside each image layer and matches every component against
            OSV, NVD, and vendor advisory data, so you know what you are shipping. Pair rootless mode
            with a scan in CI and you are covering both halves &mdash; the runtime boundary and the
            software inside it. The full CI workflow is in{" "}
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              how to scan a Docker image for vulnerabilities
            </Link>
            , and broader runtime guidance lives in our{" "}
            <Link href="/blog/container-scanning-best-practices" className="underline">
              container scanning best practices
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is Docker rootless mode?</h3>
              <p className="text-sm muted mt-1">
                Running the Docker daemon and containers as an unprivileged user via user
                namespaces, so a break-out or daemon bug lands as a normal user rather than host
                root. Supported since Docker 20.10.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Rootless mode vs userns-remap?</h3>
              <p className="text-sm muted mt-1">
                userns-remap keeps the daemon as root and only remaps container users; rootless runs
                the daemon itself unprivileged. Rootless is the stronger boundary with more
                tradeoffs.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can it bind ports under 1024?</h3>
              <p className="text-sm muted mt-1">
                Not by default. Lower <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">net.ipv4.ip_unprivileged_port_start</code>{" "}
                or grant CAP_NET_BIND_SERVICE to rootlesskit &mdash; or front it with a proxy on a
                high port.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does it replace image scanning?</h3>
              <p className="text-sm muted mt-1">
                No. Rootless mode limits blast radius on the host but does not remove vulnerable
                packages inside the image. Scan images as well.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Rootless runtime, scanned images</h3>
          <p className="text-sm muted leading-relaxed">
            Rootless mode contains the runtime; scanning cleans up what you ship. Upload an image to
            ScanRook to see every installed package matched against OSV, NVD, and vendor advisories,
            each finding tagged with its source and confidence.
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
            <Link href="/blog/docker-image-hardening-checklist" className="underline">
              Docker Image Hardening Checklist
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-scanning-best-practices" className="underline">
              Container Scanning Best Practices
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
