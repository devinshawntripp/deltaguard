import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-08-01";

const title = `Docker Security: A Practical Hardening Guide for 2026 | ${APP_NAME}`;
const description =
  "A practical Docker security guide: harden containers with non-root users, dropped capabilities, read-only filesystems, seccomp, and image scanning.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "docker security",
    "docker security best practices",
    "harden docker container",
    "docker container security",
    "run container as non-root",
    "drop linux capabilities docker",
    "docker read-only filesystem",
    "docker seccomp profile",
    "docker security hardening",
    "secure dockerfile",
  ],
  alternates: { canonical: "/blog/docker-security-guide" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/docker-security-guide",
    images: ["/blog/docker-security-guide.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/docker-security-guide.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Docker Security: A Practical Hardening Guide for 2026",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/docker-security-guide",
  image: "https://scanrook.io/blog/docker-security-guide.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the single most important Docker security setting?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Running the container process as a non-root user. By default a container's PID 1 runs as root, and because the container shares the host kernel, a process that breaks out of the container does so with whatever privileges it had inside it. Adding a USER directive to your Dockerfile so the app runs as an unprivileged user is the highest-leverage single change you can make.",
      },
    },
    {
      "@type": "Question",
      name: "Does running Docker as non-root make containers fully isolated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. A non-root container process is much safer, but the Docker daemon itself still runs as root unless you use rootless mode, and containers share the host kernel rather than being fully virtualized. Non-root users, dropped capabilities, read-only filesystems, seccomp, and rootless mode are layers; none of them alone is a security boundary as strong as a virtual machine.",
      },
    },
    {
      "@type": "Question",
      name: "Why should I never mount the Docker socket into a container?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Docker socket (/var/run/docker.sock) is the daemon's control API. Any container that can reach it can start new privileged containers, mount the host filesystem, and effectively become root on the host. Mounting the socket into a container to give it Docker access is one of the most common ways an isolated container turns into full host compromise.",
      },
    },
    {
      "@type": "Question",
      name: "What Linux capabilities should a container keep?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "As few as possible. Docker grants a default set of about 14 capabilities; most applications need none of them. The safe pattern is to drop all capabilities with --cap-drop ALL and add back only the specific ones the workload requires, such as NET_BIND_SERVICE if it must bind a port below 1024.",
      },
    },
    {
      "@type": "Question",
      name: "How does image scanning fit into Docker security?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Hardening the runtime configuration does nothing about vulnerable software already baked into the image. Scanning inventories the packages in each layer and matches them against vulnerability databases so you know which CVEs you are shipping. Runtime hardening and image scanning are complementary: one limits what a compromised container can do, the other reduces the chance of compromise in the first place.",
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
            Docker Security: A Practical Hardening Guide for 2026
          </h1>
          <p className="text-sm muted">Published August 1, 2026 &middot; 11 min read</p>
          <p className="text-sm muted">
            Docker security is not one setting &mdash; it is a stack of small, cheap defaults that
            each shrink what a compromised container can do. This guide walks through the changes
            that matter most, with runnable configuration for each, and shows where scanning the
            image itself fits alongside hardening how it runs.
          </p>
        </header>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Why containers need hardening at all</h2>
          <p className="text-sm muted">
            A container is not a virtual machine. It is a normal Linux process wrapped in
            namespaces (which give it its own view of the process table, network, and mounts) and
            cgroups (which cap its resources). Isolation is real but it is enforced by the{" "}
            <em>shared host kernel</em>, not by a hypervisor. That has two consequences. First, a
            kernel-level bug or a misconfiguration can let a process escape the container onto the
            host. Second &mdash; and this is the part teams underestimate &mdash; the Docker daemon
            runs as root, so a container that starts with root privileges and then breaks out
            arrives on the host as root.
          </p>
          <p className="text-sm muted">
            The goal of hardening is defense in depth: assume any single layer can fail and make
            sure the next one still limits the blast radius. None of the steps below is exotic, and
            most are one line. Together they turn &ldquo;a bug in my app is a bug on the host&rdquo;
            into &ldquo;a bug in my app is a bug in an unprivileged, capability-stripped,
            read-only sandbox.&rdquo;
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 1: Start from a minimal, patched base</h2>
          <p className="text-sm muted">
            Every package in your base image is attack surface and a potential CVE. A smaller base
            means fewer libraries to exploit and fewer advisories to triage. Prefer a slim or
            distroless base over a full distribution, and always pull fresh so you get the latest
            security updates rather than a cached, stale layer.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Pull the latest patched base rather than a cached layer
docker build --pull -t myapp:latest .

# In the Dockerfile, pin to a specific minimal tag
# (a digest pin is even stronger against tag mutation)
FROM debian:12-slim`}</pre>
          <p className="text-sm muted">
            Which base is &ldquo;minimal&rdquo; depends on your language and tolerance for
            debugging without a shell. We compare the common options in{" "}
            <Link href="/blog/alpine-vs-debian-vs-distroless" className="underline">
              Alpine vs Debian vs Distroless
            </Link>{" "}
            and the size-focused{" "}
            <Link href="/blog/minimal-docker-images-guide" className="underline">
              minimal Docker image guide
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 2: Run as a non-root user</h2>
          <p className="text-sm muted">
            This is the highest-leverage change in the whole guide. By default a container&apos;s
            main process runs as <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">root</code>.
            Create an unprivileged user in the image and switch to it with a{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">USER</code>{" "}
            directive so a break-out lands as nobody-in-particular rather than root.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`FROM debian:12-slim

# Create a dedicated, unprivileged user
RUN groupadd --system --gid 10001 app \\
 && useradd --system --uid 10001 --gid app app

WORKDIR /app
COPY --chown=app:app . .

# Everything from here runs as an unprivileged user
USER 10001

ENTRYPOINT ["/app/server"]`}</pre>
          <p className="text-sm muted">
            Use a numeric UID (here <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">10001</code>)
            so Kubernetes can enforce <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">runAsNonRoot</code>{" "}
            reliably &mdash; it can only verify a non-root user when the UID is numeric, not a name.
            If a process genuinely needs to bind a low port, do it with a capability (Step 3), not by
            staying root.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 3: Drop capabilities and block privilege escalation</h2>
          <p className="text-sm muted">
            Linux capabilities split root&apos;s powers into discrete units. Docker hands every
            container a default set of about 14 of them; most applications need zero. Drop them all
            and re-add only what the workload actually uses. Pair that with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">no-new-privileges</code>,
            which stops a process from gaining more privileges through setuid binaries.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`docker run \\
  --cap-drop ALL \\
  --cap-add NET_BIND_SERVICE \\
  --security-opt no-new-privileges \\
  myapp:latest`}</pre>
          <p className="text-sm muted">
            Docker also applies a default <strong>seccomp</strong> profile that blocks dozens of
            dangerous system calls (around 44) unless you opt out with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--security-opt seccomp=unconfined</code>.
            Do not disable it. And never run with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--privileged</code>{" "}
            unless you fully understand that it removes almost every isolation control at once.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 4: Make the filesystem read-only</h2>
          <p className="text-sm muted">
            Most application containers never need to write to their own image filesystem at
            runtime. Mounting it read-only stops an attacker from dropping a payload, tampering with
            binaries, or persisting between restarts. Give the process writable{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">tmpfs</code>{" "}
            mounts only where it genuinely needs scratch space.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`docker run \\
  --read-only \\
  --tmpfs /tmp:rw,noexec,nosuid,size=64m \\
  --cap-drop ALL \\
  --security-opt no-new-privileges \\
  myapp:latest`}</pre>
          <p className="text-sm muted">
            The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">noexec</code>{" "}
            flag on the tmpfs is worth adding: it prevents executing anything written to that scratch
            directory, closing a common post-exploitation step.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 5: Do not mount the socket or bake in secrets</h2>
          <p className="text-sm muted">
            Two mistakes account for a large share of real-world container compromises. The first is
            mounting <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/var/run/docker.sock</code>{" "}
            into a container &mdash; that hands the container control of the daemon, which is
            equivalent to root on the host. The second is baking credentials into image layers,
            where they persist in the image history even if a later layer deletes them.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Pass secrets at build time without persisting them in a layer
# (requires DOCKER_BUILDKIT=1)
RUN --mount=type=secret,id=npm_token \\
    NPM_TOKEN=$(cat /run/secrets/npm_token) npm ci

# At runtime, inject secrets as env vars or mounted files,
# never with COPY or ENV baked into the image
docker run --env-file ./secrets.env myapp:latest`}</pre>
          <p className="text-sm muted">
            Multi-stage builds keep build-time tooling and credentials out of the final image
            entirely &mdash; the pattern is covered in{" "}
            <Link href="/blog/multi-stage-docker-builds-security" className="underline">
              multi-stage Docker builds for security
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 6: Harden the daemon</h2>
          <p className="text-sm muted">
            Some controls live on the daemon rather than the container. User-namespace remapping maps
            container root to an unprivileged host UID, so even a process running as root inside the
            container is unprivileged on the host. Configure it in{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/etc/docker/daemon.json</code>:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`{
  "userns-remap": "default",
  "no-new-privileges": true,
  "live-restore": true,
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" }
}`}</pre>
          <p className="text-sm muted">
            For a stronger boundary, run the daemon itself unprivileged with rootless mode, so a
            daemon compromise is not automatically host root. It has real tradeoffs around
            networking and storage, which is why it deserves its own walkthrough. Also constrain
            resources per container (<code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--memory</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--pids-limit</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--cpus</code>) so one
            container cannot starve the host or fork-bomb it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Step 7: Scan the image</h2>
          <p className="text-sm muted">
            Every step so far limits what a compromised container can do. Scanning addresses the
            other half of the problem: the vulnerable software you are shipping before anyone touches
            the runtime. Export the image and scan it as part of the build.
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Install the scanner
curl -fsSL https://scanrook.io/install.sh | sh

# Export the built image to a tar and scan it
docker save myapp:latest -o myapp.tar
scanrook scan myapp.tar --format json --out report.json`}</pre>
          <p className="text-sm muted">
            The full workflow &mdash; exporting an image, reading the results, and wiring it into CI
            &mdash; is in{" "}
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              how to scan a Docker image for vulnerabilities
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Verifying it worked</h2>
          <p className="text-sm muted">
            Do not assume the flags took effect &mdash; check them. A few quick inspections confirm
            the container is actually running the way you configured it:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# Confirm the process is not running as root
docker exec myapp id
# expect uid=10001 gid=10001, not uid=0

# Confirm the root filesystem is read-only
docker inspect --format '{{ .HostConfig.ReadonlyRootfs }}' myapp
# expect true

# Run the CIS-based audit tooling for a broad check
docker run --rm --net host --pid host --cap-add audit_control \\
  -v /var/lib:/var/lib:ro -v /var/run/docker.sock:/var/run/docker.sock:ro \\
  docker/docker-bench-security`}</pre>
          <p className="text-sm muted">
            Docker Bench for Security scores your host and containers against the CIS Docker
            Benchmark and is a good recurring check. For a broader, human-readable pass, work
            through our{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              container image security checklist
            </Link>{" "}
            and the code-first{" "}
            <Link href="/blog/docker-image-hardening-checklist" className="underline">
              Docker image hardening checklist
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The same controls in Compose and Kubernetes</h2>
          <p className="text-sm muted">
            Every <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">docker run</code>{" "}
            flag above has a declarative equivalent, so you are not stuck retyping them. In Docker
            Compose the same hardening lives in the service definition:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`services:
  app:
    image: myapp:latest
    user: "10001:10001"
    read_only: true
    cap_drop: ["ALL"]
    security_opt:
      - no-new-privileges:true
    tmpfs:
      - /tmp:rw,noexec,nosuid,size=64m
    pids_limit: 200
    mem_limit: 512m`}</pre>
          <p className="text-sm muted">
            In Kubernetes the equivalents move into a pod and container{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">securityContext</code>:{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">runAsNonRoot</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">allowPrivilegeEscalation: false</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">capabilities.drop: [&quot;ALL&quot;]</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">readOnlyRootFilesystem</code>, and a{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">RuntimeDefault</code> seccomp profile.
            Better still, Kubernetes can enforce those settings cluster-wide with the built-in Pod
            Security Standards, so a container that forgets to drop privileges is rejected at
            admission rather than trusted to configure itself. The lesson is the same everywhere:
            define the hardening once, declaratively, and let the platform enforce it instead of
            relying on every developer to remember the flags.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook covers the image side of Docker security. It unpacks each layer, reads the
            actual package-manager databases inside the image, and matches every component against
            OSV, NVD, and vendor advisory data in parallel, tagging each finding with its source and
            a confidence tier. That tells you which CVEs are really installed &mdash; the input to
            deciding whether a base image is safe to ship. It does not replace runtime hardening:
            a read-only, non-root, capability-stripped container running a vulnerable OpenSSL is
            still vulnerable. Use scanning to reduce what you ship and the hardening steps above to
            contain what slips through.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is the most important Docker security setting?</h3>
              <p className="text-sm muted mt-1">
                Running as a non-root user. A break-out from a root container lands on the host as
                root, so a numeric-UID <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">USER</code>{" "}
                directive is the single highest-leverage change.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is a container as isolated as a VM?</h3>
              <p className="text-sm muted mt-1">
                No. Containers share the host kernel, so isolation depends on namespaces, cgroups,
                capabilities, and seccomp rather than a hypervisor. Treat these as layers, not a
                single hard boundary.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why avoid mounting the Docker socket?</h3>
              <p className="text-sm muted mt-1">
                The socket is the daemon&apos;s control API. A container with access to it can launch
                privileged containers and mount the host filesystem &mdash; effectively host root.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does scanning replace hardening?</h3>
              <p className="text-sm muted mt-1">
                No &mdash; they are complementary. Scanning reduces the vulnerabilities you ship;
                hardening limits what a compromised container can do if one is exploited anyway.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Scan the image, then harden the runtime</h3>
          <p className="text-sm muted leading-relaxed">
            Hardening flags contain a compromise; scanning helps prevent one. Upload a container
            image to ScanRook to see every installed package matched against multiple advisory
            sources, with the source and confidence shown for each finding.
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
            <Link href="/blog/container-security-checklist" className="underline">
              Container Image Security Checklist
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/docker-image-hardening-checklist" className="underline">
              Docker Image Hardening Checklist
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
