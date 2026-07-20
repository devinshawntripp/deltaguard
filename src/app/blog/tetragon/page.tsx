import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-21";

const title = `Tetragon: eBPF Runtime Security and In-Kernel Enforcement | ${APP_NAME}`;
const description =
  "Tetragon uses eBPF to observe and enforce process, file and network activity in Kubernetes. How TracingPolicies work, how it differs from Falco, and its limits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "tetragon",
    "tetragon ebpf",
    "cilium tetragon",
    "tetragon tracingpolicy",
    "kubernetes runtime security",
    "ebpf security observability",
    "tetragon vs falco",
    "in-kernel enforcement",
    "container runtime detection",
    "tetra cli",
  ],
  alternates: { canonical: "/blog/tetragon" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/tetragon",
    images: ["/blog/tetragon.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/tetragon.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Tetragon: eBPF Runtime Security and In-Kernel Enforcement",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/tetragon",
  image: "https://scanrook.io/blog/tetragon.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Tetragon?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tetragon is an open-source, eBPF-based security observability and runtime enforcement tool from the Cilium project family, hosted by the CNCF. It runs as a DaemonSet on Kubernetes nodes, attaches eBPF programs to kernel hooks, and reports process execution, file access, network activity and privilege changes with Kubernetes identity attached to each event.",
      },
    },
    {
      "@type": "Question",
      name: "How is Tetragon different from Falco?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both observe kernel activity, but Tetragon can enforce synchronously inside the kernel. A TracingPolicy with a Sigkill action terminates the offending process at the hook site, before the syscall returns. Falco is primarily a detection engine that emits alerts for a separate response system to act on. Tetragon also filters in-kernel, which reduces the volume of events crossing into userspace.",
      },
    },
    {
      "@type": "Question",
      name: "What is a TracingPolicy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A TracingPolicy is the Kubernetes custom resource that tells Tetragon what to watch. It names kernel hooks — kprobes, tracepoints, LSM hooks or uprobes — describes the argument types at those hooks, and attaches selectors that filter on argument values, namespaces, capabilities or binaries, plus actions to take when a selector matches.",
      },
    },
    {
      "@type": "Question",
      name: "Does Tetragon replace vulnerability scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Tetragon observes behaviour at runtime; it has no knowledge of which packages are installed or which CVEs affect them. It can tell you a process in a pod opened a suspicious file, but not that the image ships an OpenSSL version with a known critical advisory. Those are separate questions answered by separate tools.",
      },
    },
    {
      "@type": "Question",
      name: "What kernel does Tetragon require?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tetragon needs a reasonably modern Linux kernel with eBPF support; the project documents a baseline around 4.19 with a strong recommendation for 5.x or newer, and BTF availability makes deployment considerably simpler. Some features, notably LSM-hook based policies, depend on kernel configuration options that not every distribution enables.",
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
            Tetragon: eBPF Runtime Security and In-Kernel Enforcement
          </h1>
          <p className="text-sm muted">Published September 21, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            Tetragon is an eBPF-based security observability and enforcement tool from the Cilium
            project family. It watches what processes in your cluster actually do &mdash; what they
            execute, which files they touch, where they connect &mdash; and, unusually, it can stop
            them from inside the kernel rather than raising an alert and hoping something reacts in
            time. Here is how it is put together, what a policy looks like, and what it does not
            cover.
          </p>
        </header>

        <img
          src="/blog/tetragon.jpg"
          alt="Tetragon eBPF hooks observing system call streams in the kernel"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Tetragon is</h2>
          <p className="text-sm muted">
            Tetragon is a CNCF-hosted open-source project, developed alongside Cilium, that uses
            eBPF to instrument the Linux kernel for security purposes. On Kubernetes it deploys as a
            DaemonSet: one agent per node, loading eBPF programs into kernel hook points and
            streaming structured events out to whatever consumes them. It does not require Cilium as
            the CNI &mdash; Tetragon runs standalone, and also runs outside Kubernetes on plain
            Linux hosts.
          </p>
          <p className="text-sm muted">
            Two design decisions define it. The first is that <strong>filtering happens in the
            kernel</strong>. Rather than lifting every syscall into userspace and deciding there,
            Tetragon compiles its selectors into the eBPF program, so an event that does not match
            never crosses the boundary. On a busy node that is the difference between a manageable
            stream and a firehose. The second is that <strong>policy can act, not just
            report</strong>: a matching selector can carry an action that terminates the process at
            the hook site.
          </p>
          <p className="text-sm muted">
            The third thing you notice in practice is process lineage. Tetragon tracks{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">execve</code>{" "}
            and maintains ancestry, so an event is not an orphaned &ldquo;bash ran&rdquo; line
            &mdash; it comes with the parent chain, the container and pod it belongs to, the
            namespace, and the workload labels. When you are reconstructing what happened, having
            the full chain from the container entrypoint down to the suspicious child is most of the
            investigation.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Getting events out of it</h2>
          <p className="text-sm muted">
            Installation is a Helm chart, and the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">tetra</code>{" "}
            CLI shipped inside the agent container is the fastest way to see whether it is working:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`helm repo add cilium https://helm.cilium.io
helm repo update

helm install tetragon cilium/tetragon \\
  --namespace kube-system \\
  --set tetragon.enableProcessCred=true \\
  --set tetragon.enableProcessNs=true

kubectl rollout status -n kube-system ds/tetragon

# live event stream, compact form
kubectl exec -n kube-system ds/tetragon -c tetragon -- \\
  tetra getevents -o compact`}</pre>
          <p className="text-sm muted">
            With the default policies loaded you immediately get process execution events for every
            container on the node. Run an{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">kubectl exec</code>{" "}
            into any pod and you will see the shell appear in the stream with its full ancestry. For
            anything beyond that, you write a policy. Events are also exposed over gRPC and can be
            written to a JSON log on the node for a log shipper to collect &mdash; that is the normal
            path into a SIEM.
          </p>
        </section>

        <figure className="grid gap-2">
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 720 230"
              role="img"
              aria-label="Layer diagram: workload processes issue syscalls, eBPF programs at kernel hooks apply in-kernel filters and actions, and only matching events are exported to the Tetragon agent and downstream consumers"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <defs>
                <marker id="tg-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              <rect x={8} y={6} width={704} height={48} rx={8} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.3} />
              <text x={360} y={28} textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">workload containers</text>
              <text x={360} y={45} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.6}>execve &middot; file access &middot; connect &middot; capability change</text>

              <line x1={360} y1={56} x2={360} y2={78} stroke="currentColor" strokeWidth={2} strokeOpacity={0.5} markerEnd="url(#tg-arrow)" />

              <rect x={8} y={84} width={704} height={62} rx={8} fill="var(--dg-accent,#2563eb)" fillOpacity={0.12} stroke="currentColor" strokeOpacity={0.5} />
              <text x={360} y={106} textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">kernel: eBPF programs at kprobes / tracepoints / LSM hooks</text>
              <text x={200} y={128} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.7}>selectors filter here</text>
              <text x={520} y={128} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.7}>actions fire here (Sigkill / Override)</text>

              <line x1={360} y1={148} x2={360} y2={170} stroke="currentColor" strokeWidth={2} strokeOpacity={0.5} markerEnd="url(#tg-arrow)" />
              <text x={378} y={165} fontSize="10.5" fill="currentColor" fillOpacity={0.55}>only matching events cross</text>

              <rect x={8} y={176} width={340} height={46} rx={8} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.3} />
              <text x={178} y={196} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="currentColor">Tetragon agent</text>
              <text x={178} y={212} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>adds pod / namespace / label identity</text>

              <line x1={352} y1={199} x2={368} y2={199} stroke="currentColor" strokeWidth={2} strokeOpacity={0.5} markerEnd="url(#tg-arrow)" />

              <rect x={376} y={176} width={336} height={46} rx={8} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.3} />
              <text x={544} y={196} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="currentColor">consumers</text>
              <text x={544} y={212} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>tetra CLI &middot; gRPC &middot; JSON export &middot; SIEM</text>
            </svg>
          </div>
          <figcaption className="text-xs muted">
            Tetragon&apos;s layering. The unusual part is that both filtering and enforcement happen
            in the kernel box, not after the event reaches userspace.
          </figcaption>
        </figure>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">TracingPolicy: how you tell it what to watch</h2>
          <p className="text-sm muted">
            A TracingPolicy is a custom resource with three parts: which kernel hook to attach to,
            how to interpret the arguments at that hook, and selectors that decide when you care. A
            common starting policy watches writes into sensitive configuration paths:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`apiVersion: cilium.io/v1alpha1
kind: TracingPolicy
metadata:
  name: watch-etc-writes
spec:
  kprobes:
    - call: "security_file_permission"
      syscall: false
      return: true
      args:
        - index: 0
          type: "file"
        - index: 1
          type: "int"          # access mask
      returnArg:
        index: 0
        type: "int"
      selectors:
        - matchArgs:
            - index: 0
              operator: "Prefix"
              values:
                - "/etc/shadow"
                - "/etc/ssh"
          matchActions:
            - action: Post`}</pre>
          <p className="text-sm muted">
            Swap{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">action: Post</code>{" "}
            for{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">action: Sigkill</code>{" "}
            and the same policy stops being an alert and becomes a control: the process is killed at
            the hook, synchronously, before the operation completes. There is also an{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">Override</code>{" "}
            action that returns a chosen error code to the caller instead of killing it, which is
            gentler and often more debuggable &mdash; the application sees a permission error rather
            than vanishing.
          </p>
          <p className="text-sm muted">
            Selectors can also match on namespaces, binaries, capabilities and process credentials,
            which is how you keep a policy scoped. Applying a Sigkill policy cluster-wide on your
            first attempt is a reliable way to take down a workload that legitimately reads a path
            you did not think about. The sane rollout is the same as any enforcement control: run it
            in Post mode, look at what it catches for a week, then narrow the selectors and switch
            the action.
          </p>
        </section>

        <img
          src="/blog/tetragon-2.jpg"
          alt="Process execution tree with one branch terminated by in-kernel enforcement"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Tetragon and Falco</h2>
          <p className="text-sm muted">
            The comparison people ask for most is against{" "}
            <Link href="/blog/falco-runtime-security-explained" className="underline">
              Falco
            </Link>
            , and the honest answer is that they overlap heavily but optimise for different things.
          </p>
          <p className="text-sm muted">
            Falco has a mature, human-readable rules language and a large body of community rules
            you can adopt on day one; its output model assumes a downstream responder. Tetragon
            expects you to write policies closer to the kernel &mdash; you are naming hook functions
            and argument indices, which is more precise and less approachable. In exchange you get
            in-kernel filtering, which keeps overhead down on high-throughput nodes, and synchronous
            enforcement, which closes the gap between detection and response entirely.
          </p>
          <p className="text-sm muted">
            That enforcement gap is the substantive difference. An alerting system tells you a
            reverse shell spawned; by the time a responder acts, the shell has had a few hundred
            milliseconds to work. Tetragon can prevent it from returning at all. Whether that is
            worth the operational risk of an in-kernel kill switch is a genuine judgement call, and
            plenty of teams reasonably run detection-only. Our{" "}
            <Link href="/blog/container-runtime-security" className="underline">
              container runtime security overview
            </Link>{" "}
            walks through where each approach fits.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Tetragon does not tell you</h2>
          <p className="text-sm muted">
            Tetragon has no model of software inventory. It does not know which packages are
            installed in a container, which versions they are, or which advisories affect them. It
            will faithfully report that a process opened a socket; it will not tell you that the
            process is a{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">libxml2</code>{" "}
            version with a published heap overflow. That is a different data source entirely.
          </p>
          <p className="text-sm muted">
            It is also blind to anything that never runs. A vulnerable package sitting unused in an
            image produces no syscalls, so runtime observation gives you nothing to act on &mdash;
            right up until the day a new code path reaches it. Conversely, runtime data is genuinely
            useful for the opposite direction: knowing which binaries actually execute is a strong
            input to{" "}
            <Link href="/blog/reachability-analysis" className="underline">
              reachability analysis
            </Link>{" "}
            when you are deciding which of a thousand findings deserve attention first.
          </p>
          <p className="text-sm muted">
            And there are practical limits. eBPF availability varies with kernel version and
            configuration; LSM-hook policies need{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">BPF LSM</code>{" "}
            enabled in the kernel build, which not every distribution ships. Managed Kubernetes
            offerings differ in what node kernels they give you. Check before you plan a rollout
            around a specific policy type.
          </p>
        </section>

        <img
          src="/blog/tetragon-3.jpg"
          alt="Kubernetes cluster with a kernel sensor layer feeding a central policy engine"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook answers the question Tetragon structurally cannot: what is inside the artifact
            before it runs. It scans a container image tarball, source archive or binary, reads the
            real installed package databases rather than guessing from filenames, and matches the
            results against OSV, NVD and Red Hat OVAL. That produces the inventory and the advisory
            mapping &mdash; the static half of the picture.
          </p>
          <p className="text-sm muted">
            The two fit together cleanly in a pipeline. Scanning in CI removes vulnerable software
            before it is deployed, which shrinks the set of things Tetragon would otherwise have to
            catch mid-exploit. Tetragon covers what scanning cannot: misuse of software that is
            perfectly patched, credentials being abused, and zero-days that no advisory database
            knows about yet. Neither is a substitute for the other, and a runtime tool that claims
            to make image scanning unnecessary is overstating its reach &mdash; as is a scanner that
            claims the reverse.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Does Tetragon require Cilium?</h3>
              <p className="text-sm muted mt-1">
                No. It comes from the same project family and integrates well with Cilium, but it
                runs standalone as a DaemonSet with any CNI, and outside Kubernetes on plain Linux.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can it actually block an attack?</h3>
              <p className="text-sm muted mt-1">
                Yes, within the scope of its hooks. A Sigkill or Override action fires in-kernel at
                the hook site, so the offending operation does not complete. Scope policies
                carefully before enabling that.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How heavy is it?</h3>
              <p className="text-sm muted mt-1">
                Overhead depends almost entirely on how broad your policies are. Because selectors
                filter in-kernel, a narrow policy costs far less than one that exports every process
                event on a busy node.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does it find CVEs?</h3>
              <p className="text-sm muted mt-1">
                No. It has no package inventory and no advisory data. Use an image scanner for that
                and treat the two outputs as separate workstreams.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Know what is in the image before it runs</h3>
          <p className="text-sm muted leading-relaxed">
            Runtime enforcement is stronger when there is less to exploit. ScanRook reads the real
            package state inside your artifacts and matches it against OSV, NVD and Red Hat OVAL,
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
