import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-14";

const title = `eBPF Security: Kernel-Level Visibility, Explained | ${APP_NAME}`;
const description =
  "How eBPF security tools see syscalls, files and network flows from the kernel, what the verifier does, where eBPF stops helping, and how it pairs with scanning.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "ebpf security",
    "ebpf runtime security",
    "ebpf monitoring",
    "ebpf verifier",
    "bpf lsm",
    "ebpf vs kernel module",
    "ebpf container security",
    "tetragon tracee falco",
    "ebpf network security",
    "kernel observability",
  ],
  alternates: { canonical: "/blog/ebpf-security" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/ebpf-security",
    images: ["/blog/ebpf-security.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/ebpf-security.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "eBPF Security: Kernel-Level Visibility, Explained",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/ebpf-security",
  image: "https://scanrook.io/blog/ebpf-security.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is eBPF?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "eBPF lets you load small sandboxed programs into the Linux kernel and attach them to events such as syscalls, function entry points, network packet paths and LSM hooks. Before a program is allowed to run, an in-kernel verifier proves it terminates and only touches memory it is permitted to touch. This gives tools kernel-level visibility without shipping a kernel module.",
      },
    },
    {
      "@type": "Question",
      name: "Why do security tools use eBPF instead of a kernel module?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A buggy kernel module panics the machine and has to be rebuilt for each kernel. An eBPF program is verified before loading, cannot loop indefinitely, and with CO-RE and BTF a single compiled object can run across many kernel versions. Tools also get consistent, low-overhead access to events that would otherwise require patching or intercepting syscalls from user space.",
      },
    },
    {
      "@type": "Question",
      name: "Can eBPF block an attack or only observe it?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both, depending on the attachment point. Programs attached to tracing hooks are observational. Programs attached to BPF LSM hooks can return a denial and block the operation, and network programs attached at XDP or traffic control can drop packets. Enforcement therefore depends on kernel support for BPF LSM being compiled in and enabled.",
      },
    },
    {
      "@type": "Question",
      name: "Is eBPF itself a security risk?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It is privileged functionality and it is attack surface. Loading programs requires CAP_BPF or CAP_SYS_ADMIN, unprivileged eBPF is disabled by default on modern distributions, and verifier bugs have been assigned CVEs and used for local privilege escalation. Attackers with sufficient privilege have also used eBPF for rootkit-style hiding, so monitoring who loads programs is worthwhile.",
      },
    },
    {
      "@type": "Question",
      name: "Does eBPF replace vulnerability scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. eBPF observes behaviour: what executed, what was opened, what connected where. It has no inventory of which packages and versions are installed or which advisories affect them. Scanning answers what is present and known-vulnerable; eBPF answers what is happening right now. They cover different halves of the same problem.",
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
          <div className="text-xs uppercase tracking-wide muted">Deep scanning</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            eBPF Security: Kernel-Level Visibility, Explained
          </h1>
          <p className="text-sm muted">Published December 14, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            eBPF security tooling has become the default way to watch what containers actually do,
            and for good reason: it sees every process execution, file open and network connection
            from inside the kernel, without a kernel module and without meaningful overhead. It is
            also frequently oversold. This is what eBPF genuinely gives you, what it structurally
            cannot, and how it fits next to the checks you already run.
          </p>
        </header>

        <img
          src="/blog/ebpf-security.jpg"
          alt="eBPF security: kernel-level telemetry probes feeding an analysis layer"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What eBPF actually is</h2>
          <p className="text-sm muted">
            eBPF is a mechanism for running small programs inside the Linux kernel, attached to
            events. You compile a program to eBPF bytecode, ask the kernel to load it, and the kernel
            runs it every time the event you attached to fires. The reason this is safe enough to be
            a default is the <strong>verifier</strong>: before any program is accepted, the kernel
            statically proves that it terminates, that every memory access is in bounds, and that it
            only calls helper functions permitted for its program type. A program that cannot be
            proven safe is rejected outright.
          </p>
          <p className="text-sm muted">
            Programs communicate with user space through <strong>maps</strong> &mdash; shared
            key-value structures and ring buffers &mdash; so a probe in the kernel can stream events
            to an agent that does the expensive analysis. And with CO-RE (Compile Once, Run
            Everywhere) plus BTF type information, one compiled object can run across many kernel
            versions instead of being rebuilt per kernel like a module.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 270"
              role="img"
              aria-label="Layer diagram of eBPF: a user-space agent loads a program which passes through the verifier into the kernel, where it attaches to syscall, LSM, file and network hooks and streams events back through maps and a ring buffer"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <defs>
                <marker id="eb-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              <rect x={10} y={10} width={680} height={60} rx={9} fill="currentColor" fillOpacity={0.04} stroke="currentColor" strokeOpacity={0.3} />
              <text x={26} y={30} fontSize="11" fontWeight="600" fill="currentColor" fillOpacity={0.7}>
                USER SPACE
              </text>
              <rect x={40} y={34} width={190} height={28} rx={6} fill="currentColor" fillOpacity={0.07} stroke="currentColor" strokeOpacity={0.35} />
              <text x={135} y={53} textAnchor="middle" fontSize="11.5" fill="currentColor" fillOpacity={0.85}>
                Agent loads program
              </text>
              <rect x={430} y={34} width={230} height={28} rx={6} fill="currentColor" fillOpacity={0.07} stroke="currentColor" strokeOpacity={0.35} />
              <text x={545} y={53} textAnchor="middle" fontSize="11.5" fill="currentColor" fillOpacity={0.85}>
                Agent consumes events, alerts
              </text>

              {/* verifier gate */}
              <rect x={70} y={92} width={130} height={30} rx={7} fill="var(--dg-accent,#2563eb)" fillOpacity={0.18} stroke="currentColor" strokeOpacity={0.45} />
              <text x={135} y={112} textAnchor="middle" fontSize="11.5" fontWeight="600" fill="currentColor">
                Verifier
              </text>
              <line x1={135} y1={62} x2={135} y2={88} stroke="currentColor" strokeWidth={1.6} strokeOpacity={0.5} markerEnd="url(#eb-arrow)" />
              <line x1={135} y1={122} x2={135} y2={150} stroke="currentColor" strokeWidth={1.6} strokeOpacity={0.5} markerEnd="url(#eb-arrow)" />

              {/* kernel band */}
              <rect x={10} y={152} width={680} height={104} rx={9} fill="currentColor" fillOpacity={0.06} stroke="currentColor" strokeOpacity={0.4} />
              <text x={26} y={172} fontSize="11" fontWeight="600" fill="currentColor" fillOpacity={0.7}>
                KERNEL
              </text>
              {[
                { x: 40, label: "kprobe /", sub: "tracepoint" },
                { x: 196, label: "BPF LSM", sub: "can deny" },
                { x: 352, label: "uprobe", sub: "userland fn" },
                { x: 508, label: "XDP / tc", sub: "packet path" },
              ].map((h) => (
                <g key={h.label}>
                  <rect x={h.x} y={182} width={148} height={44} rx={7} fill="currentColor" fillOpacity={0.06} stroke="currentColor" strokeOpacity={0.35} />
                  <text x={h.x + 74} y={202} textAnchor="middle" fontSize="11.5" fontWeight="600" fill="currentColor">
                    {h.label}
                  </text>
                  <text x={h.x + 74} y={217} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.65}>
                    {h.sub}
                  </text>
                  <line x1={h.x + 74} y1={182} x2={h.x + 74} y2={166} stroke="currentColor" strokeWidth={1.2} strokeOpacity={0.3} />
                </g>
              ))}
              <text x={350} y={246} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>
                events written to maps / ring buffer
              </text>
              <line x1={620} y1={196} x2={620} y2={68} stroke="currentColor" strokeWidth={1.6} strokeOpacity={0.5} strokeDasharray="5 4" markerEnd="url(#eb-arrow)" />
              <line x1={266} y1={266} x2={266} y2={266} stroke="currentColor" strokeOpacity={0} />
            </svg>
          </div>
          <figcaption className="text-xs muted">
            The eBPF path: an agent loads a program, the verifier decides whether it may run, and the
            program observes &mdash; or at LSM and network hooks, blocks &mdash; from inside the
            kernel.
          </figcaption>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Why eBPF security tooling won
          </h2>
          <p className="text-sm muted">
            Before eBPF, kernel-level security monitoring on Linux meant a kernel module, and kernel
            modules are a hard sell: a bug panics the host, distribution kernels need matching
            builds, and signing requirements complicate deployment. The alternatives &mdash; audit
            subsystem rules, LD_PRELOAD interception, polling{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/proc</code>{" "}
            &mdash; were either noisy, evadable, or both.
          </p>
          <p className="text-sm muted">
            eBPF changed the tradeoff. Falco, originally built on a kernel module, now ships a modern
            eBPF driver as the standard option; Cilium implements Kubernetes networking and network
            policy enforcement with eBPF at the packet path; Tetragon and Tracee use it for process
            and syscall-level detection and, in Tetragon&apos;s case, in-kernel enforcement. If you
            want a concrete grounding in what these tools detect, our write-up on{" "}
            <Link href="/blog/falco-runtime-security-explained" className="underline">
              Falco runtime security
            </Link>{" "}
            walks through the rule model.
          </p>
        </section>

        <img
          src="/blog/ebpf-security-2.jpg"
          alt="eBPF programs verified and loaded into the kernel to observe container behaviour"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            What it lets you see &mdash; and enforce
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Hook type</th>
                  <th className="text-left py-2 pr-4 font-semibold">Typical security use</th>
                  <th className="text-left py-2 font-semibold">Observe or block</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Tracepoints / kprobes</td>
                  <td className="py-2 pr-4 align-top">Process execution, file access, privilege changes</td>
                  <td className="py-2 align-top">Observe</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">BPF LSM hooks</td>
                  <td className="py-2 pr-4 align-top">Policy decisions on file, socket, capability operations</td>
                  <td className="py-2 align-top">Block</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">uprobes</td>
                  <td className="py-2 pr-4 align-top">Application-level events, TLS payload visibility</td>
                  <td className="py-2 align-top">Observe</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">XDP / tc</td>
                  <td className="py-2 pr-4 align-top">Network policy, DDoS filtering, flow telemetry</td>
                  <td className="py-2 align-top">Block</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            In container terms this translates into the detections that matter operationally: a shell
            spawning inside a service container that has never run one, a write to a path that should
            be read-only, an outbound connection from a workload that only ever talks to a database,
            a process attempting to mount a filesystem. Those are precisely the signatures a{" "}
            <Link href="/blog/container-escape" className="underline">
              container escape attempt
            </Link>{" "}
            produces, which is why runtime detection is the natural backstop when a preventive control
            fails. Network-layer enforcement complements the declarative controls in{" "}
            <Link href="/blog/kubernetes-network-policies" className="underline">
              Kubernetes network policies
            </Link>
            .
          </p>
        </section>

        <img
          src="/blog/ebpf-security-3.jpg"
          alt="Streaming runtime event telemetry from eBPF probes into a detection pipeline"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            The limits worth knowing before you buy in
          </h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Kernel requirements are real.</strong> CO-RE needs BTF information, BPF LSM
              needs to be compiled in and enabled at boot, and specific hooks land in specific kernel
              versions. Older or heavily customised kernels constrain what a tool can do, and the
              failure mode is usually silent degradation to fewer detections.
            </li>
            <li>
              <strong>Observation is not identification.</strong> An eBPF probe sees that a process
              executed a binary at a path. It does not know which package that binary belongs to,
              which version, or whether an advisory affects it. That mapping comes from inventory,
              not telemetry.
            </li>
            <li>
              <strong>Argument reading has races.</strong> Reading syscall arguments from user memory
              at hook time is subject to time-of-check to time-of-use concerns; mature tools handle
              this at specific hook points, but the concern is inherent rather than a bug.
            </li>
            <li>
              <strong>Volume becomes the cost.</strong> The kernel-side overhead is small; the
              downstream cost of storing and triaging millions of events per node is not. Tune rules
              early or the platform team quietly turns detections off.
            </li>
            <li>
              <strong>eBPF is privileged surface.</strong> Loading programs requires{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CAP_BPF</code>{" "}
              or <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CAP_SYS_ADMIN</code>;
              unprivileged eBPF is disabled by default on current distributions via{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kernel.unprivileged_bpf_disabled</code>.
              Verifier bugs have received CVEs and been used for local privilege escalation, and
              attackers with the capability have used eBPF for rootkit-style hiding. Keep the
              capability out of workloads, and treat program-load events as{" "}
              <Link href="/blog/indicators-of-compromise" className="underline">
                indicators worth alerting on
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Runtime telemetry and inventory answer different questions
          </h2>
          <p className="text-sm muted">
            The most useful way to place eBPF is by the question it answers. eBPF answers &ldquo;what
            is happening?&rdquo; &mdash; live, behavioural, unavoidably after the fact. Vulnerability
            scanning answers &ldquo;what is present?&rdquo; &mdash; a component inventory matched
            against advisories, available before anything is deployed. Host tools like{" "}
            <Link href="/blog/osquery" className="underline">
              osquery
            </Link>{" "}
            sit between the two, letting you query system state on demand.
          </p>
          <p className="text-sm muted">
            The pairing is genuinely useful rather than rhetorical. Scanning tells you a container
            image contains a vulnerable version of a library; runtime telemetry tells you whether the
            process that uses it is even running and what it talks to &mdash; the observational
            cousin of{" "}
            <Link href="/blog/reachability-analysis" className="underline">
              reachability analysis
            </Link>
            . Neither ordering works alone: you cannot triage a finding you never inventoried, and you
            cannot prevent an exploit you only observe.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            How to evaluate an eBPF security tool
          </h2>
          <p className="text-sm muted">
            Almost every runtime security product now says &ldquo;powered by eBPF&rdquo;, which tells
            you close to nothing &mdash; it describes the plumbing, not the product. The questions
            that actually separate them:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Which hooks does it attach to, and does it degrade quietly?</strong> Ask what
              happens on a kernel without BTF or without BPF LSM. A tool that silently drops to a
              reduced detection set is worse than one that refuses to start, because your coverage
              assumption is now wrong.
            </li>
            <li>
              <strong>Where does correlation happen?</strong> Raw syscall events are not detections.
              The value is in reconstructing process ancestry, mapping events back to a container,
              pod and image, and suppressing the known-good. That work happens in user space, and it
              is where products differ most.
            </li>
            <li>
              <strong>Can it enforce, and do you want it to?</strong> In-kernel blocking is powerful
              and also a way to take an outage. Many teams run detection-only for months before
              enabling enforcement on a narrow rule set, which is a reasonable path.
            </li>
            <li>
              <strong>What does it cost per node at your event volume?</strong> Measure with a
              realistic workload, not an idle node. Both CPU on the node and the downstream ingest
              bill matter.
            </li>
            <li>
              <strong>How are rules written and tested?</strong> If tuning requires a vendor ticket,
              tuning will not happen, and untuned detections get muted.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            A realistic deployment order
          </h2>
          <p className="text-sm muted">
            Teams that get value from eBPF security tooling tend to follow the same sequence. Start
            in observation mode on a non-critical node pool and let it run long enough to learn what
            normal looks like &mdash; a week is usually enough to expose the surprises, and there are
            always surprises. Then enable a small set of high-signal detections: shell execution in
            service containers, writes to sensitive paths, unexpected outbound destinations.
          </p>
          <p className="text-sm muted">
            Route those to somewhere a human actually looks, and tune until the false positive rate is
            low enough that an alert is believed. Only then consider enforcement, and only for rules
            that have been quiet in detection mode for a sustained period. Skipping straight to
            blocking is how a security tool becomes the cause of the incident review rather than the
            thing that shortened it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook is on the inventory side of that split, and deliberately so. It takes a container
            image tarball, source archive, or compiled binary, reads the real package databases and
            binary metadata inside it, and matches every component against OSV, NVD, and Red Hat OVAL
            in parallel &mdash; so a finding arrives with its advisory source and a confidence tier
            rather than an unattributed severity. Run it in the build to decide what ships; run an
            eBPF tool on the node to see what the shipped thing does. If you are assembling a runtime
            security stack, our overview of{" "}
            <Link href="/blog/container-runtime-security" className="underline">
              container runtime security
            </Link>{" "}
            covers how the pieces line up, and the <Link href="/docs" className="underline">docs</Link>{" "}
            describe the scan output format.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What does the eBPF verifier do?</h3>
              <p className="text-sm muted mt-1">
                It statically proves a program terminates and only accesses permitted memory and
                helpers before the kernel will load it. Unprovable programs are rejected.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can eBPF block, not just watch?</h3>
              <p className="text-sm muted mt-1">
                Yes, at BPF LSM hooks and at network hooks such as XDP and tc. Tracing hooks are
                observational only.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is eBPF itself risky?</h3>
              <p className="text-sm muted mt-1">
                It is privileged and has had verifier CVEs. Keep{" "}
                <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CAP_BPF</code>{" "}
                out of workloads and alert on unexpected program loads.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does it replace scanning?</h3>
              <p className="text-sm muted mt-1">
                No. It has no package inventory and no advisory data. It tells you what ran, not what
                is vulnerable.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Pair runtime visibility with real inventory</h3>
          <p className="text-sm muted leading-relaxed">
            eBPF shows you behaviour. ScanRook shows you what is actually inside the artifact behaving
            that way &mdash; every package matched against OSV, NVD, and Red Hat OVAL, with sources
            attached.
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
            <Link href="/blog/falco-runtime-security-explained" className="underline">
              Falco Runtime Security Explained
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-runtime-security" className="underline">
              Container Runtime Security
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/reachability-analysis" className="underline">
              Reachability Analysis
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
