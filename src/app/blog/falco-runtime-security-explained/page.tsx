import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-10";

const title = `Falco Explained: Runtime Security vs Image Scanning | ${APP_NAME}`;
const description =
  "Falco is CNCF runtime security: eBPF syscall threat detection at runtime. How it works, how it differs from image and SCA scanning, and when to use each.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "falco",
    "falco runtime security",
    "falco security",
    "cncf falco",
    "falco vs image scanning",
    "runtime security",
    "ebpf security monitoring",
    "falco rules",
    "container runtime security",
    "syscall threat detection",
  ],
  alternates: { canonical: "/blog/falco-runtime-security-explained" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/falco-runtime-security-explained",
    images: ["/blog/falco-runtime-security-explained.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/falco-runtime-security-explained.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Falco Explained: Runtime Security vs Image Scanning",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/falco-runtime-security-explained",
  image: "https://scanrook.io/blog/falco-runtime-security-explained.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Falco?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Falco is an open-source runtime security tool and a Cloud Native Computing Foundation (CNCF) project. It observes system calls on a host — typically through a modern eBPF probe — and evaluates that activity against a set of rules. When behavior matches a rule, such as a shell spawning inside a container or a sensitive file being read, Falco emits an alert in real time.",
      },
    },
    {
      "@type": "Question",
      name: "How is Falco different from a vulnerability scanner?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A vulnerability scanner analyzes an artifact before it runs and reports known-vulnerable packages and CVEs. Falco watches behavior while workloads run and reports suspicious activity. One is static and predictive; the other is dynamic and detective. They answer different questions — what could be exploited versus what is happening right now — and are used together, not as substitutes.",
      },
    },
    {
      "@type": "Question",
      name: "What can Falco detect?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Falco detects behavioral signals: an interactive shell opened in a container, writes below a binary directory, reads of sensitive files like /etc/shadow, unexpected outbound network connections, attempts to modify kernel modules, and use of privileged operations. With plugins it can also consume other event sources, such as Kubernetes audit logs, to alert on control-plane activity.",
      },
    },
    {
      "@type": "Question",
      name: "Does Falco use eBPF?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Falco's preferred instrumentation is a modern eBPF probe that runs safely in the Linux kernel to capture system-call events with low overhead. A legacy loadable kernel module is also available for environments where eBPF is not an option. Both feed the same event stream into Falco's rule engine.",
      },
    },
    {
      "@type": "Question",
      name: "Should I use Falco instead of image scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No — use both. Image and SCA scanning stops known-vulnerable artifacts from shipping, which is cheaper and earlier than catching an attack in production. Falco catches exploitation, misuse, and zero-day behavior that no static scan can predict. Removing either leaves a gap: scanning without runtime detection is blind to live attacks, and runtime detection without scanning ships avoidable CVEs.",
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
          <div className="text-xs uppercase tracking-wide muted">Scanning concepts</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Falco Explained: Runtime Security vs Image Scanning
          </h1>
          <p className="text-sm muted">Published July 8, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Falco is one of the best-known names in cloud-native security, and it is often mentioned
            in the same breath as scanners like Trivy or ScanRook &mdash; which causes real
            confusion, because it does something fundamentally different. Falco is a{" "}
            <strong>runtime</strong> security tool: it watches what your workloads actually do and
            raises alerts when behavior looks wrong. This guide explains how Falco works, and where
            it sits relative to image and dependency scanning &mdash; honestly, because the two are
            complements, not rivals.
          </p>
        </header>

        <img
          src="/blog/falco-runtime-security-explained.jpg"
          alt="Falco runtime security explained"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Falco is</h2>
          <p className="text-sm muted">
            Falco is an open-source runtime security engine and a graduated{" "}
            <strong>Cloud Native Computing Foundation (CNCF)</strong> project. It was originally
            created by Sysdig in 2016 and donated to the CNCF in 2018, and it has since become one of
            the foundation&apos;s established security projects. Its job is threat <em>detection</em>{" "}
            at runtime: rather than examining an artifact before it runs, Falco observes a live system
            and flags activity that matches its rules.
          </p>
          <p className="text-sm muted">
            The core data source is the Linux <strong>system call</strong> stream. Every meaningful
            thing a process does &mdash; opening a file, spawning a child, making a network connection
            &mdash; goes through a syscall, so watching syscalls gives Falco a high-fidelity view of
            behavior without instrumenting the applications themselves.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How Falco works</h2>
          <p className="text-sm muted">
            Falco has three moving parts: a way to collect events, a rule engine to evaluate them,
            and outputs to raise alerts.
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Collection.</strong> Falco captures syscall events through a modern{" "}
              <strong>eBPF probe</strong> that runs safely inside the kernel with low overhead. A
              legacy kernel module is available for environments where eBPF is not possible. A plugin
              framework lets Falco ingest other event sources too, such as Kubernetes audit logs or
              cloud provider audit trails.
            </li>
            <li>
              <strong>Rules.</strong> Events are matched against YAML rules built from conditions,
              reusable macros, and lists. Falco ships with a maintained default ruleset covering
              common attack behaviors, and teams add their own.
            </li>
            <li>
              <strong>Outputs.</strong> When a rule fires, Falco emits a structured alert to stdout,
              a file, syslog, or its gRPC API. The companion project Falcosidekick fans those alerts
              out to Slack, webhooks, SIEMs, and other destinations, and can drive automated
              responses.
            </li>
          </ul>
          <p className="text-sm muted">
            A rule is readable even if you have never written one. Here is a simplified version of a
            default Falco rule that alerts when an interactive shell is opened inside a container
            &mdash; a classic sign of a hands-on-keyboard intrusion:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`- rule: Terminal shell in container
  desc: A shell was spawned in a container with an attached terminal.
  condition: >
    spawned_process and container
    and shell_procs and proc.tty != 0
  output: >
    Shell spawned in container (user=%user.name container=%container.name
    shell=%proc.name parent=%proc.pname cmdline=%proc.cmdline)
  priority: NOTICE
  tags: [container, shell, mitre_execution]`}</pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Falco is good at catching</h2>
          <p className="text-sm muted">
            Because it reasons about behavior rather than known signatures, Falco is strong exactly
            where static analysis is blind &mdash; the moment a workload starts doing something it
            should not:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>An interactive shell opening inside a container that should only run one process</li>
            <li>Writes below a system binary directory, or changes to files under it</li>
            <li>Reads of sensitive files such as <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/etc/shadow</code></li>
            <li>Unexpected outbound network connections from a workload</li>
            <li>Attempts to load kernel modules or change kernel parameters</li>
            <li>A package manager running inside a production container</li>
          </ul>
          <p className="text-sm muted">
            Crucially, these signals fire regardless of <em>how</em> the attacker got in. A zero-day
            with no CVE yet, a leaked credential, an insider &mdash; if the result is a shell in a
            container or a read of a secret, Falco sees the behavior. That is the defining strength of
            runtime detection: it does not depend on knowing the vulnerability in advance.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Runtime security vs image and SCA scanning</h2>
          <p className="text-sm muted">
            Here is the honest comparison, because conflating these tools leads to bad coverage
            decisions. Image scanning and software composition analysis (SCA) &mdash; what ScanRook,
            Trivy, and Grype do &mdash; inspect the artifact <em>before</em> it runs and report known
            vulnerabilities in the packages inside it. Falco inspects <em>behavior while it runs</em>{" "}
            and reports suspicious activity. Different phase, different question:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Dimension</th>
                  <th className="text-left py-2 pr-4 font-semibold">Image / SCA scanning</th>
                  <th className="text-left py-2 font-semibold">Falco (runtime)</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">When it runs</td>
                  <td className="py-2 pr-4 align-top">Before deploy: CI, registry, admission</td>
                  <td className="py-2 align-top">During execution, in production</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">What it finds</td>
                  <td className="py-2 pr-4 align-top">Known CVEs in installed packages</td>
                  <td className="py-2 align-top">Anomalous or malicious behavior</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Zero-days</td>
                  <td className="py-2 pr-4 align-top">Only once an advisory exists</td>
                  <td className="py-2 align-top">Can catch the behavior even with no CVE</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Failure mode</td>
                  <td className="py-2 pr-4 align-top">Ships nothing exploited yet; blind to live attacks</td>
                  <td className="py-2 align-top">Reacts after the fact; needs tuning to cut noise</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">Best used to</td>
                  <td className="py-2 pr-4 align-top">Prevent vulnerable images from shipping</td>
                  <td className="py-2 align-top">Detect and respond to attacks in progress</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            Neither replaces the other. Scanning is prevention: it is far cheaper to keep a
            vulnerable image out of production than to detect its exploitation there, which is why
            scanning belongs early in the pipeline &mdash; see our{" "}
            <Link href="/blog/container-scanning-best-practices" className="underline">
              container scanning best practices
            </Link>
            . Runtime detection is the safety net for everything prevention cannot foresee: zero-days,
            misconfiguration abuse, stolen credentials. A mature program runs both.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits &mdash; and where it does not</h2>
          <p className="text-sm muted">
            To be clear about our own tool: ScanRook is a scanner, not a runtime agent. It analyzes
            the artifact &mdash; container images, binaries, and source archives &mdash;{" "}
            <em>before</em> runtime, reading the{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              actual installed packages
            </Link>{" "}
            and matching them against multiple advisory sources. It answers &ldquo;what known
            vulnerabilities are in this image, and are the affected packages really installed?&rdquo;
            It does not watch syscalls, and it will not tell you that a shell just opened in a running
            pod. That is Falco&apos;s job.
          </p>
          <p className="text-sm muted">
            The clean division of labor: use scanning at build time and admission to stop
            known-vulnerable images from ever reaching a cluster &mdash; the practices in our{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              container image security checklist
            </Link>{" "}
            and guidance on{" "}
            <Link href="/blog/how-to-scan-docker-image-for-vulnerabilities" className="underline">
              scanning Docker images
            </Link>{" "}
            &mdash; then run Falco in production to catch whatever slips through or is exploited via
            an unknown flaw. Fewer vulnerable images shipping means fewer runtime alerts to chase;
            runtime detection means the ones that do ship do not go unnoticed.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is Falco free?</h3>
              <p className="text-sm muted mt-1">
                Yes. Falco is open source under the Apache 2.0 license and maintained as a CNCF
                project. Commercial platforms build managed offerings on or around it, but the engine
                and its default rules are free to run yourself.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does Falco work outside Kubernetes?</h3>
              <p className="text-sm muted mt-1">
                Yes. Falco monitors any Linux host&apos;s system calls, so it works on plain servers
                and standalone container hosts as well as Kubernetes. Its plugin framework adds
                Kubernetes-specific and cloud audit sources on top.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Will Falco tell me about CVEs in my images?</h3>
              <p className="text-sm muted mt-1">
                No. Falco reasons about behavior, not package inventory. To know which known
                vulnerabilities live in an image you need an image or SCA scanner; Falco tells you
                when something suspicious happens at runtime.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can runtime detection replace scanning?</h3>
              <p className="text-sm muted mt-1">
                No, and the reverse is also true. Skipping scanning ships avoidable CVEs; skipping
                runtime detection leaves live attacks and zero-days unseen. The two cover different
                phases and belong together.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Cover the pre-runtime half with ScanRook</h3>
          <p className="text-sm muted leading-relaxed">
            Falco watches what runs; ScanRook checks what you are about to ship. It reads the real
            packages inside your container images and matches them against OSV, NVD, and vendor
            advisory data, so known-vulnerable images never reach the cluster in the first place.
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
            <Link href="/blog/container-scanning-best-practices" className="underline">
              Container Scanning Best Practices
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-security-checklist" className="underline">
              Container Image Security Checklist
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              Installed-State Scanning vs Advisory Matching
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
