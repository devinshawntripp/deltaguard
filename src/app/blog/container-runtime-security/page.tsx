import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-05";

const title = `Container Runtime Security: A Practical Guide | ${APP_NAME}`;
const description =
  "Container runtime security protects workloads while they run, after build-time scanning ends. The threats, the controls, the tools, and where ScanRook fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "container runtime security",
    "runtime security containers",
    "kubernetes runtime security",
    "container escape",
    "runtime threat detection",
    "falco runtime security",
    "seccomp apparmor containers",
    "container security best practices",
    "runtime vs build time security",
    "container hardening",
  ],
  alternates: { canonical: "/blog/container-runtime-security" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/container-runtime-security",
    images: ["/blog/container-runtime-security.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/container-runtime-security.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Container Runtime Security: A Practical Guide",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/container-runtime-security",
  image: "https://scanrook.io/blog/container-runtime-security.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is container runtime security?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Container runtime security is the set of controls that protect containers while they are running, as opposed to build-time scanning that inspects an image before deployment. It covers hardening the container so an attacker has less to work with, isolating it so an escape is contained, and detecting malicious behavior such as an unexpected process, a container escape attempt, or outbound connections to a command-and-control server.",
      },
    },
    {
      "@type": "Question",
      name: "How is runtime security different from image scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Image scanning finds known vulnerabilities in the packages inside an image before it runs. Runtime security watches what a running container actually does and responds to malicious behavior in real time. Scanning is preventive and happens early; runtime security is detective and happens continuously. They are complementary layers, not substitutes, and mature programs run both.",
      },
    },
    {
      "@type": "Question",
      name: "What is a container escape?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A container escape is when a process breaks out of its container and gains access to the host or other containers. It usually exploits a vulnerability in the container runtime or a misconfiguration such as a privileged container or a mounted Docker socket. Leaky Vessels (CVE-2024-21626) is a real example, a runc flaw that let a crafted image escape to the host filesystem.",
      },
    },
    {
      "@type": "Question",
      name: "What tools provide runtime threat detection?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Falco is the widely used open-source, CNCF option; it watches kernel syscalls, increasingly via eBPF, and alerts on suspicious behavior against a rule set. Tetragon and Tracee are other eBPF-based tools, and commercial platforms such as Sysdig Secure and Aqua add managed detection and response. They observe running behavior rather than scanning static images.",
      },
    },
    {
      "@type": "Question",
      name: "Does hardening a container remove the need to scan it?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Running as non-root with dropped capabilities and a read-only filesystem limits what an attacker can do after a compromise, but it does not remove the vulnerable package that let them in. Scanning the image reduces the number of exploitable flaws; hardening reduces the blast radius when one is exploited. You want both.",
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
            Container Runtime Security: A Practical Guide
          </h1>
          <p className="text-sm muted">Published December 5, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Scanning an image tells you what known flaws it ships with. It says nothing about what
            happens once the container is running &mdash; when a process spawns a shell it should
            never spawn, tries to break out to the host, or opens a connection to an address you have
            never seen. Container runtime security is the layer that watches for exactly that. Here
            is what it covers, the controls that make it work, and how it relates to the scanning you
            do before deploy.
          </p>
        </header>

        <img
          src="/blog/container-runtime-security.jpg"
          alt="Container runtime security controls across the deployment lifecycle"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Build-time versus runtime</h2>
          <p className="text-sm muted">
            Container security spans the whole lifecycle, and different controls act at different
            stages. It helps to see them laid out: scanning and hardening happen before a container
            runs, admission control decides whether it may run, and runtime security governs what it
            does once it is running.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 740 150" width="100%" role="img" aria-label="Security controls across the container lifecycle, with runtime security as the final stage" className="min-w-[660px]">
              <g fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="12">
                {[
                  { x: 6, label: "Build", sub: "scan image for CVEs", accent: false },
                  { x: 190, label: "Registry", sub: "scan + sign", accent: false },
                  { x: 374, label: "Admission", sub: "gate the deploy", accent: false },
                  { x: 558, label: "Runtime", sub: "detect + contain", accent: true },
                ].map((s) => (
                  <g key={s.label}>
                    <rect x={s.x} y={38} width={170} height={58} rx={8}
                      fill={s.accent ? "var(--dg-accent,#2563eb)" : "currentColor"}
                      fillOpacity={s.accent ? "0.14" : "0.05"}
                      stroke={s.accent ? "var(--dg-accent,#2563eb)" : "currentColor"}
                      strokeOpacity={s.accent ? "0.6" : "0.3"} />
                    <text x={s.x + 85} y={64} textAnchor="middle" fontWeight="600" fill="currentColor">{s.label}</text>
                    <text x={s.x + 85} y={82} textAnchor="middle" fill="currentColor" fillOpacity="0.6" fontSize="10">{s.sub}</text>
                  </g>
                ))}
                {[176, 360, 544].map((x) => (
                  <line key={x} x1={x} y1={67} x2={x + 12} y2={67}
                    stroke="currentColor" strokeOpacity="0.4" strokeWidth="2" markerEnd="url(#ca)" />
                ))}
                <defs>
                  <marker id="ca" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" fillOpacity="0.4" />
                  </marker>
                </defs>
                <text x={370} y={128} textAnchor="middle" fill="currentColor" fillOpacity="0.55" fontSize="11">
                  Preventive controls act early; runtime security is the continuous, detective layer.
                </text>
              </g>
            </svg>
          </div>
          <p className="text-sm muted">
            Preventive controls reduce how many exploitable flaws exist. Runtime controls assume one
            eventually will be exploited and limit and detect what happens next. Neither is optional
            in a serious program &mdash; a perfectly scanned image can still be attacked through a
            zero-day, and a heavily monitored runtime is still better off with fewer known holes.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The threats runtime security addresses</h2>
          <p className="text-sm muted">
            The headline threat is the <strong>container escape</strong> &mdash; a process breaking
            out to the host or to neighboring containers. These usually exploit a runtime
            vulnerability or a dangerous configuration. Leaky Vessels, covered in{" "}
            <Link href="/blog/leaky-vessels-cve-2024-21626" className="underline">
              our CVE-2024-21626 deep dive
            </Link>
            , is a concrete example: a runc flaw that let a crafted image reach the host filesystem.
            Beyond escapes, runtime security cares about <strong>privilege escalation</strong>,
            unexpected process execution (a web server suddenly running{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">bash</code> or a package
            manager), <strong>cryptomining</strong>, and <strong>data exfiltration</strong> over
            outbound connections. What ties these together is that none of them is visible to a
            static image scan &mdash; they are behaviors, not artifacts.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Hardening: shrink what an attacker can do</h2>
          <p className="text-sm muted">
            The cheapest runtime security is configuration you apply before anything runs. Each of
            these narrows the blast radius of a compromise:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Run as non-root.</strong> A process that is not UID 0 inside the container has
              far fewer escape paths. Pair it with{" "}
              <Link href="/blog/docker-rootless-mode" className="underline">rootless Docker</Link>{" "}
              or user namespaces so it is not root on the host either.
            </li>
            <li>
              <strong>Drop Linux capabilities.</strong> Start from none and add back only what the
              workload needs. Never run <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--privileged</code>
              in production.
            </li>
            <li>
              <strong>Read-only root filesystem.</strong> If the container cannot write to its own
              filesystem, an attacker cannot drop a payload into it. Mount specific writable volumes
              where genuinely needed.
            </li>
            <li>
              <strong>seccomp and LSMs.</strong> A seccomp profile restricts which syscalls the
              container may make, and AppArmor or SELinux add mandatory access controls on top.
            </li>
            <li>
              <strong>Network policy.</strong> Default-deny egress so a compromised container cannot
              phone home or move laterally without an explicit rule.
            </li>
          </ul>
          <p className="text-sm muted">
            In Kubernetes, most of this is expressible and enforceable through the{" "}
            <Link href="/blog/pod-security-standards-guide" className="underline">
              Pod Security Standards
            </Link>
            , and the broader host-and-daemon side is covered in our{" "}
            <Link href="/blog/docker-security-guide" className="underline">Docker security guide</Link>.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Isolation: contain the escape</h2>
          <p className="text-sm muted">
            Hardening assumes the container boundary holds. Isolation strengthens that boundary.
            Sandboxed runtimes such as gVisor intercept syscalls in a user-space kernel, and Kata
            Containers wrap each workload in a lightweight virtual machine, so a container escape
            lands in a sandbox rather than on the shared host kernel. The tradeoff is overhead and
            some compatibility friction, which is why these tend to be reserved for
            multi-tenant or high-risk workloads rather than applied everywhere.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Detection: see the attack in progress</h2>
          <p className="text-sm muted">
            Prevention will eventually miss something, so you also need to see malicious behavior as
            it happens. Runtime threat detection watches kernel activity &mdash; increasingly through
            eBPF &mdash; and alerts on behavior that violates a rule set. The widely used open-source,
            CNCF option is Falco, explained in{" "}
            <Link href="/blog/falco-runtime-security-explained" className="underline">
              Falco Explained: Runtime Security vs Image Scanning
            </Link>
            . Tetragon and Tracee are other eBPF-based tools, and commercial platforms such as Sysdig
            Secure and Aqua layer managed detection and response on top. The common thread is that
            they observe the running container, which is precisely the thing a static scan cannot do.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where scanning still matters</h2>
          <p className="text-sm muted">
            It is tempting to treat runtime detection as the tool that makes scanning unnecessary
            &mdash; if you can catch the attack live, why worry about the vulnerability? The answer
            is that every known CVE you ship is an invitation you did not have to send. Runtime
            detection is a smoke alarm; image scanning is not storing gasoline next to the stove.
            The fewer exploitable flaws in the running image, the fewer alarms the detection layer
            has to catch, and the less depends on catching every single one. Admission control ties
            the two together by refusing to run images that failed a scan &mdash; see{" "}
            <Link href="/blog/kubernetes-admission-control-image-scanning" className="underline">
              Kubernetes admission control for image scanning
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook is a build-time and pre-deploy scanner, not a runtime detection tool. It does
            not watch syscalls or catch a container escape in progress &mdash; that is Falco&apos;s
            job, and the honest framing is that they solve different halves of the problem. What
            ScanRook does is shrink the runtime attack surface before the container ever starts: it
            scans the image against OSV, NVD, and Red Hat OVAL, reads the packages actually installed
            inside it, and tags each finding with a source and confidence tier so you can fix the
            flaws worth fixing before they become a runtime incident. Scan deeply so there is less
            for the runtime layer to catch, harden so a compromise is contained, and detect so the
            attacks that slip through are seen. That combination &mdash; not any single tool &mdash;
            is container runtime security done properly. See{" "}
            <Link href="/blog/container-image-scanning-guide" className="underline">
              our container image scanning guide
            </Link>{" "}
            for where ScanRook sits in the pipeline.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is container runtime security?</h3>
              <p className="text-sm muted mt-1">
                The controls that protect a container while it runs &mdash; hardening, isolation, and
                real-time detection &mdash; as opposed to scanning the image before it deploys.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How is it different from image scanning?</h3>
              <p className="text-sm muted mt-1">
                Scanning finds known flaws in a static image before it runs; runtime security watches
                what a running container does and responds to malicious behavior. Complementary
                layers, not substitutes.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is a container escape?</h3>
              <p className="text-sm muted mt-1">
                A process breaking out of its container to the host or other containers, usually via
                a runtime vulnerability or misconfiguration &mdash; Leaky Vessels (CVE-2024-21626) is
                a real example.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Which tools detect runtime threats?</h3>
              <p className="text-sm muted mt-1">
                Falco is the common open-source, CNCF option; Tetragon and Tracee are other eBPF
                tools, and Sysdig and Aqua are commercial platforms.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Shrink the runtime attack surface first</h3>
          <p className="text-sm muted leading-relaxed">
            The fewer known CVEs in a running image, the less your runtime layer has to catch.
            ScanRook scans the image against OSV, NVD, and OVAL before it deploys, with a source and
            confidence tier on every finding, so you fix what matters ahead of time.
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
              Falco Explained
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/leaky-vessels-cve-2024-21626" className="underline">
              Leaky Vessels (CVE-2024-21626)
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/pod-security-standards-guide" className="underline">
              Pod Security Standards
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
