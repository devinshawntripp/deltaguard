import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-12";

const title = `Container Escape: How It Happens and How to Stop It | ${APP_NAME}`;
const description =
  "Container escape explained: the misconfigurations, runtime bugs and kernel flaws that break isolation, real CVEs that did it, and the layered defenses that hold.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "container escape",
    "container breakout",
    "docker container escape",
    "kubernetes container escape",
    "privileged container escape",
    "runc vulnerability",
    "container isolation",
    "cgroups release_agent escape",
    "container escape prevention",
    "container security boundary",
  ],
  alternates: { canonical: "/blog/container-escape" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/container-escape",
    images: ["/blog/container-escape.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/container-escape.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Container Escape: How It Happens and How to Stop It",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/container-escape",
  image: "https://scanrook.io/blog/container-escape.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a container escape?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A container escape is any technique that lets code running inside a container gain access to the host or to other containers on it. Containers are isolated by kernel features such as namespaces, cgroups, capabilities and seccomp rather than by a hypervisor, so a flaw or misconfiguration in those features breaks the boundary. The usual outcome is code execution on the host with root privileges.",
      },
    },
    {
      "@type": "Question",
      name: "Are containers a security boundary?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They are a boundary, but a weaker one than a virtual machine because every container on a host shares the same kernel. A kernel vulnerability reachable from inside a container is a potential escape for all of them. For workloads where a breakout would be catastrophic, such as running untrusted tenant code, a sandboxed runtime like gVisor or Kata Containers or a separate VM per tenant is the appropriate control.",
      },
    },
    {
      "@type": "Question",
      name: "Does running a privileged container mean escape is trivial?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Effectively yes. A privileged container has all capabilities, an unrestricted device list and no seccomp or LSM confinement, so root inside it can mount host filesystems, load kernel modules and write to host devices. It is best understood as a root shell on the host with extra steps, which is why privileged should be treated as an exception requiring explicit review rather than a convenience flag.",
      },
    },
    {
      "@type": "Question",
      name: "Why is mounting the Docker socket dangerous?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The container runtime socket is an unauthenticated API for creating containers on the host. Anything that can write to it can start a new privileged container mounting the host root filesystem, which is a complete escape in a single API call. Mounting the socket to give a container the ability to build or manage images grants it full control of the machine.",
      },
    },
    {
      "@type": "Question",
      name: "How do I prevent container escape?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Layer the controls: run as a non-root user with no added capabilities, apply the default seccomp profile and an AppArmor or SELinux policy, use a read-only root filesystem, never mount the runtime socket or host paths, keep the kernel and container runtime patched, enforce these settings at admission rather than by convention, and add runtime detection so an attempt is visible even if a control fails.",
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
          <div className="text-xs uppercase tracking-wide muted">Security Concepts</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Container Escape: How It Happens and How to Stop It
          </h1>
          <p className="text-sm muted">Published December 12, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            A container escape is the moment isolation stops holding &mdash; code that was supposed to
            be confined to one workload gets execution on the host, and from there on every other
            container that host runs. It is worth understanding precisely, because the fixes are
            unglamorous and highly effective: the overwhelming majority of real escapes are
            configuration choices, not exotic kernel exploits.
          </p>
        </header>

        <img
          src="/blog/container-escape.jpg"
          alt="Container escape: workload breaking out of its isolation boundary onto the host"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Why containers can be escaped at all
          </h2>
          <p className="text-sm muted">
            A container is not a machine. It is a normal Linux process that the kernel has been asked
            to lie to: namespaces give it a private view of PIDs, mounts, networking and users;
            cgroups cap its resources; capabilities, seccomp and an LSM such as AppArmor or SELinux
            restrict what syscalls it can make and what it can touch. All of that enforcement happens
            in one kernel, shared by every container on the box.
          </p>
          <p className="text-sm muted">
            So the boundary has three failure modes, and they are worth keeping separate in your head
            because each has a different owner. Either the confinement was never applied properly
            (configuration), or the software that applies it has a bug (runtime), or the kernel doing
            the enforcing has a bug (kernel). A hypervisor-based boundary has a much smaller shared
            surface, which is the honest argument for VM-level isolation when the workload is
            genuinely untrusted.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 260"
              role="img"
              aria-label="Diagram of three container escape routes from a container to the host kernel: misconfiguration, runtime vulnerability and kernel vulnerability, each blocked by a corresponding defensive control"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <defs>
                <marker id="ce-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              <rect x={250} y={10} width={200} height={40} rx={9} fill="currentColor" fillOpacity={0.06} stroke="currentColor" strokeOpacity={0.45} />
              <text x={350} y={35} textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">
                Container process
              </text>
              {[
                { x: 20, label: "Misconfiguration", detail: "privileged, socket mount, hostPath", block: "Admission policy" },
                { x: 250, label: "Runtime bug", detail: "runc / containerd flaw", block: "Patch runtime" },
                { x: 480, label: "Kernel bug", detail: "syscall or fs subsystem flaw", block: "Seccomp + patch" },
              ].map((c) => (
                <g key={c.label}>
                  <line x1={350} y1={50} x2={c.x + 100} y2={86} stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.45} markerEnd="url(#ce-arrow)" />
                  <rect x={c.x} y={92} width={200} height={46} rx={8} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.4} />
                  <text x={c.x + 100} y={112} textAnchor="middle" fontSize="12" fontWeight="600" fill="currentColor">
                    {c.label}
                  </text>
                  <text x={c.x + 100} y={128} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.65}>
                    {c.detail}
                  </text>
                  <rect x={c.x + 20} y={152} width={160} height={28} rx={6} fill="var(--dg-accent,#2563eb)" fillOpacity={0.14} stroke="currentColor" strokeOpacity={0.3} />
                  <text x={c.x + 100} y={171} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.8}>
                    {c.block}
                  </text>
                  <line x1={c.x + 100} y1={180} x2={c.x + 100} y2={210} stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.3} strokeDasharray="4 3" markerEnd="url(#ce-arrow)" />
                </g>
              ))}
              <rect x={20} y={214} width={660} height={34} rx={8} fill="currentColor" fillOpacity={0.08} stroke="currentColor" strokeOpacity={0.45} />
              <text x={350} y={236} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="currentColor">
                Shared host kernel &mdash; root here means every container on the node
              </text>
            </svg>
          </div>
          <figcaption className="text-xs muted">
            Three routes to the same destination. Each has a distinct control, which is why no single
            mitigation covers container escape on its own.
          </figcaption>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Route one: configuration you chose
          </h2>
          <p className="text-sm muted">
            This is where nearly every real-world container escape starts, because it needs no
            vulnerability at all &mdash; the isolation was simply turned off.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Privileged containers.</strong>{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--privileged</code>{" "}
              grants all capabilities, access to all host devices, and drops the default seccomp and
              LSM confinement. Root inside can mount the host disk directly. Treat it as equivalent to
              a host root shell.
            </li>
            <li>
              <strong>Mounted runtime socket.</strong> A container that can write to{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/var/run/docker.sock</code>{" "}
              can ask the daemon to start a new privileged container with the host root bind-mounted.
              That is a one-request escape &mdash; see{" "}
              <Link href="/blog/docker-socket" className="underline">
                why mounting the Docker socket is dangerous
              </Link>
              .
            </li>
            <li>
              <strong>Dangerous capabilities.</strong>{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CAP_SYS_ADMIN</code>{" "}
              enables mounting, which historically enabled the cgroups v1{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">release_agent</code>{" "}
              trick: mount a cgroup hierarchy, point the release agent at a script on a host-visible
              path, and the kernel executes it as root outside the container.{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CAP_SYS_PTRACE</code>{" "}
              with <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">hostPID</code>{" "}
              lets you attach to host processes. <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CAP_SYS_MODULE</code>{" "}
              lets you load a kernel module.
            </li>
            <li>
              <strong>Host mounts.</strong> A{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">hostPath</code>{" "}
              of <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/</code>,{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/etc</code>, or a
              kubelet directory is an escape by editing files. Writable{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/proc/sys/kernel/core_pattern</code>{" "}
              on an unmasked proc lets you register a host-side handler that runs on the next crash.
            </li>
            <li>
              <strong>Namespace sharing.</strong>{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">hostPID</code>,{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">hostIPC</code>{" "}
              and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">hostNetwork</code>{" "}
              each remove a wall. CVE-2020-15257 in containerd was exploitable precisely because a
              host-network container could reach the shim&apos;s abstract Unix socket.
            </li>
          </ul>
        </section>

        <img
          src="/blog/container-escape-2.jpg"
          alt="Namespace and capability boundaries that a container escape must cross"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Route two: bugs in the runtime
          </h2>
          <p className="text-sm muted">
            The runtime is the code that sets up isolation, so it necessarily straddles the boundary
            &mdash; and mistakes there are directly exploitable. Two well-documented examples:
          </p>
          <p className="text-sm muted">
            <strong>CVE-2019-5736</strong> allowed a malicious container to overwrite the host{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">runc</code>{" "}
            binary by abusing{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/proc/self/exe</code>.
            Once runc was replaced, the next container start executed attacker code as root on the
            host. The fix made runc clone itself into memory before handing control to container
            code.
          </p>
          <p className="text-sm muted">
            <strong>CVE-2024-21626</strong>, one of the &ldquo;Leaky Vessels&rdquo; findings, came
            from a file descriptor leaking into the container process. Setting{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">WORKDIR</code>{" "}
            to a path under{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/proc/self/fd/</code>{" "}
            gave the container a working directory located in the host filesystem &mdash; readable and
            writable from inside. What made it notable is that it could be triggered by a crafted
            image at <em>build</em> time, not just at runtime. We covered it in detail in{" "}
            <Link href="/blog/leaky-vessels-cve-2024-21626" className="underline">
              Leaky Vessels
            </Link>
            .
          </p>
          <p className="text-sm muted">
            The lesson from both is mundane: your container runtime is security-critical software
            that needs a patch SLA like any other. Track the installed version of{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">runc</code>,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">containerd</code>{" "}
            and the kubelet on every node.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Route three: bugs in the kernel
          </h2>
          <p className="text-sm muted">
            Because the kernel is shared, a local privilege escalation is usually also a container
            escape. CVE-2022-0847 (&ldquo;Dirty Pipe&rdquo;) let an unprivileged process overwrite
            data in read-only page cache pages, which in a container context meant overwriting
            binaries shared with the host image layer. CVE-2022-0185, a heap overflow in the
            filesystem context parameter parsing, was demonstrated as a full escape on systems where
            unprivileged user namespaces were available. CVE-2022-0492 turned an unchecked cgroups v1{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">release_agent</code>{" "}
            write into root on the host.
          </p>
          <p className="text-sm muted">
            You cannot configure your way out of a kernel flaw, but you can shrink the attack surface
            that reaches it. A seccomp profile removes hundreds of syscalls from the exploitable set.
            An LSM policy restricts what a compromised process can do with the access it gains. And
            node patch cadence &mdash; unfashionable but decisive &mdash; is what closes the window.
          </p>
        </section>

        <img
          src="/blog/container-escape-3.jpg"
          alt="Layered defenses that prevent container escape from reaching the host"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Defenses that actually hold
          </h2>
          <p className="text-sm muted">
            No single setting prevents container escape. The point of stacking them, in the spirit of{" "}
            <Link href="/blog/defense-in-depth" className="underline">
              defense in depth
            </Link>
            , is that an attacker needs all of them to fail. A workload configured like this is a
            genuinely hard target:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.05] dark:bg-white/[.05] p-4"><code>{`securityContext:
  runAsNonRoot: true
  runAsUser: 10001
  allowPrivilegeEscalation: false
  privileged: false
  readOnlyRootFilesystem: true
  capabilities:
    drop: ["ALL"]
  seccompProfile:
    type: RuntimeDefault
# and at pod level: no hostPID / hostIPC / hostNetwork, no hostPath volumes`}</code></pre>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Do not run as root.</strong> Most escape chains assume UID 0 inside the
              container. Rootless runtimes push this further &mdash; see{" "}
              <Link href="/blog/docker-rootless-mode" className="underline">
                Docker rootless mode
              </Link>
              .
            </li>
            <li>
              <strong>Drop all capabilities and add back only what you need.</strong> Nearly nothing
              needs <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">SYS_ADMIN</code>.
            </li>
            <li>
              <strong>Enforce, do not document.</strong> Apply the restricted{" "}
              <Link href="/blog/pod-security-standards-guide" className="underline">
                Pod Security Standards
              </Link>{" "}
              at the namespace level so a privileged pod is rejected rather than reviewed.
            </li>
            <li>
              <strong>Patch nodes and runtimes on a clock.</strong> Kernel and runtime CVEs are the
              routes configuration cannot close.
            </li>
            <li>
              <strong>Watch at runtime.</strong> Escape attempts have loud signatures &mdash;
              unexpected mounts, writes to{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/proc</code>,
              shells spawning in service containers. Tools like{" "}
              <Link href="/blog/falco-runtime-security-explained" className="underline">
                Falco
              </Link>{" "}
              exist for this, and{" "}
              <Link href="/blog/container-runtime-security" className="underline">
                container runtime security
              </Link>{" "}
              covers the wider picture.
            </li>
            <li>
              <strong>For untrusted code, change the boundary.</strong> gVisor or Kata Containers put
              a real barrier between the workload and the host kernel. If you run other people&apos;s
              code, this is the right answer rather than a stronger seccomp profile.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            What an escape looks like from the outside
          </h2>
          <p className="text-sm muted">
            Prevention gets most of the attention, but detection is what saves you when a control was
            missing or a patch was late. Escape attempts are noisy relative to normal container
            behaviour, because containers are boring: a service container usually executes one binary
            and a small set of children, opens a predictable set of paths, and talks to a handful of
            endpoints. Deviations from that are the signal.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>An interactive shell starting inside a container that has never run one.</li>
            <li>A <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">mount</code> syscall from a workload that does not mount anything.</li>
            <li>Reads or writes under <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/proc/self/exe</code>, <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/proc/self/fd</code>, or <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/proc/sys/kernel/core_pattern</code>.</li>
            <li>Attempts to open the container runtime socket, or enumeration of <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/var/run</code>.</li>
            <li>Access to the cloud instance metadata endpoint from a workload with no reason to need it.</li>
            <li>New listening sockets, or outbound connections to addresses outside the workload&apos;s normal set.</li>
            <li>A container process appearing with a UID or capability set that differs from its spec.</li>
          </ul>
          <p className="text-sm muted">
            These are exactly the events kernel-level tooling is built to surface, and they are cheap
            to alert on because the baseline is so narrow. The cost of runtime detection is almost
            entirely in tuning, not in the sensors.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Assume the container is not the last line
          </h2>
          <p className="text-sm muted">
            One habit worth adopting: when reasoning about a vulnerability in an application, do not
            let &ldquo;it is containerised&rdquo; end the conversation. It reduces blast radius, and
            that is worth a great deal, but it is a speed bump rather than a wall. The follow-up
            questions are what the container can reach if it is fully compromised &mdash; which
            secrets are mounted into it, what the service account can do against the API server, what
            the node&apos;s instance credentials allow, and which other workloads share the node.
          </p>
          <p className="text-sm muted">
            Answering those honestly usually produces cheaper wins than hardening the container
            further: removing a cluster-wide secrets read from a service account, or moving a
            high-risk workload onto its own node pool, often reduces the consequence of an escape more
            than any additional seccomp rule would reduce its likelihood.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook does not enforce isolation &mdash; that is the kernel&apos;s job and your
            admission policy&apos;s job. What it does is tell you which of the escape-relevant
            vulnerabilities are actually present in the things you run. Scanning an image tells you
            whether it ships a vulnerable library; scanning a node&apos;s runtime binaries and package
            inventory tells you whether the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">runc</code>{" "}
            and kernel packages in play are the fixed versions. ScanRook reads real package databases
            and matches against OSV, NVD, and Red Hat OVAL, which matters here specifically because
            distributions backport kernel and runtime fixes without bumping upstream version numbers
            &mdash; version-string matching alone gets those wrong. The <Link href="/docs" className="underline">docs</Link>{" "}
            cover scanning both images and binaries.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is a container escape?</h3>
              <p className="text-sm muted mt-1">
                Code inside a container obtaining access to the host or to sibling containers,
                typically as root, by defeating the namespace, capability or syscall confinement.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is a container a security boundary?</h3>
              <p className="text-sm muted mt-1">
                A real but shallower one than a VM, because the kernel is shared. For untrusted
                tenants use a sandboxed runtime or separate VMs.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is the single riskiest setting?</h3>
              <p className="text-sm muted mt-1">
                A tie between <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--privileged</code>{" "}
                and mounting the container runtime socket. Both are effectively host root.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Do escapes need a CVE?</h3>
              <p className="text-sm muted mt-1">
                Often not. Misconfiguration accounts for most real cases, which is why admission
                enforcement is the highest-leverage control.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Know what is inside the containers you run</h3>
          <p className="text-sm muted leading-relaxed">
            Escape-relevant flaws in runtimes and libraries are only actionable if you know they are
            there. Scan an image or a binary with ScanRook and get findings with a source and a
            confidence tier.
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
            <Link href="/blog/leaky-vessels-cve-2024-21626" className="underline">
              Leaky Vessels (CVE-2024-21626)
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-runtime-security" className="underline">
              Container Runtime Security
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/security-context-kubernetes" className="underline">
              Kubernetes Security Contexts
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
