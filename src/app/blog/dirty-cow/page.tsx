import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-11";

const title = `Dirty COW (CVE-2016-5195): The Kernel Race Explained | ${APP_NAME}`;
const description =
  "Dirty COW was a nine-year-old Linux kernel race condition that gave any local user root. How the copy-on-write bug worked and why containers did not stop it.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "dirty cow",
    "dirty cow vulnerability",
    "CVE-2016-5195",
    "dirty cow exploit",
    "linux kernel privilege escalation",
    "copy on write race condition",
    "huge dirty cow",
    "dirty pipe",
    "container escape kernel",
    "linux local privilege escalation",
  ],
  alternates: { canonical: "/blog/dirty-cow" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/dirty-cow",
    images: ["/blog/dirty-cow.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/dirty-cow.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Dirty COW (CVE-2016-5195): The Kernel Race Explained",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/dirty-cow",
  image: "https://scanrook.io/blog/dirty-cow.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Dirty COW?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dirty COW, tracked as CVE-2016-5195, is a race condition in the way the Linux kernel handled copy-on-write breakage of private read-only memory mappings. By racing a write to a private mapping against the kernel discarding the copied page, an unprivileged local user could write to memory backed by a file they only had read access to, including setuid root binaries. It was disclosed in October 2016.",
      },
    },
    {
      "@type": "Question",
      name: "Why is it called Dirty COW?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "COW stands for copy-on-write, the kernel mechanism that gives a process its own private copy of a shared page the first time it writes to it. The bug caused the kernel to mark a page dirty and write it back through the private mapping to the underlying file rather than to the private copy, hence a dirty copy-on-write.",
      },
    },
    {
      "@type": "Question",
      name: "Did Dirty COW allow container escape?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In some configurations, yes. Containers share the host kernel, so a kernel memory bug is not confined by namespaces or cgroups. Where a host file was mapped read-only into a container, the flaw could be used to write to that file on the host, which is a full escape. Namespaces isolate resources; they do not isolate kernel bugs.",
      },
    },
    {
      "@type": "Question",
      name: "How was Dirty COW fixed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The upstream fix changed how the kernel tracks the copy-on-write state so the race could not cause a write to reach the underlying file. It landed in mainline in October 2016 and was backported by every major distribution within days. Because the bug lived in the kernel, the only real remediation is a patched kernel and a reboot.",
      },
    },
    {
      "@type": "Question",
      name: "Is Dirty COW still a risk?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "On any maintained system, no. The fix has been in every supported kernel for years. It still matters on long-lived unpatched appliances, embedded devices, and old Android builds that never received an update, and it remains a case study in why shared-kernel isolation has limits.",
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
          <div className="text-xs uppercase tracking-wide muted">CVE Deep Dive</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Dirty COW (CVE-2016-5195): The Kernel Race Explained
          </h1>
          <p className="text-sm muted">Published October 11, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            Dirty COW was a race condition in the Linux kernel&apos;s copy-on-write handling that let
            any local user write to files they could only read &mdash; including root-owned binaries.
            It had been in the kernel for roughly nine years before anyone noticed, the exploit fit in
            a page of C, and it worked essentially everywhere Linux ran. Ten years on it is still the
            cleanest illustration of why a shared kernel is a shared risk.
          </p>
        </header>

        <img
          src="/blog/dirty-cow.jpg"
          alt="Dirty COW CVE-2016-5195: a race condition in Linux kernel copy-on-write memory handling"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What copy-on-write is supposed to do</h2>
          <p className="text-sm muted">
            When a process maps a file privately &mdash; with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              mmap(..., MAP_PRIVATE, ...)
            </code>{" "}
            &mdash; the kernel does not immediately copy anything. It points the process at the same
            physical pages the page cache already holds, marked read-only. That is cheap: a dozen
            processes mapping the same shared library all reference one copy in memory.
          </p>
          <p className="text-sm muted">
            The copy only happens when the process tries to write. The write faults, the kernel
            notices the mapping is private, allocates a fresh page, copies the contents into it, and
            re-points the process&apos;s page table entry at the private copy. The process writes to
            its own copy; the original file and every other process are untouched. This is
            copy-on-write, and it is one of the most-exercised code paths in the kernel.
          </p>
          <p className="text-sm muted">
            The security property that everything depends on is simple: a private mapping of a file
            you can only read must never produce a write to that file. Dirty COW broke exactly that
            property.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The race</h2>
          <p className="text-sm muted">
            The bug lived in the window between the fault handler deciding to break copy-on-write and
            the write actually landing. An attacker ran two threads:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              One thread repeatedly wrote to the private mapping through a path that bypasses the
              normal user-space page permissions &mdash; most exploits used{" "}
              <code className="text-xs">/proc/self/mem</code>, some used{" "}
              <code className="text-xs">ptrace</code>.
            </li>
            <li>
              The other thread repeatedly called{" "}
              <code className="text-xs">madvise(addr, len, MADV_DONTNEED)</code>, telling the kernel to
              discard the private copy it had just created.
            </li>
          </ul>
          <p className="text-sm muted">
            Hit the timing right and the kernel would perform the write after the private copy had
            been thrown away, so the write landed on the page-cache page backing the original file
            &mdash; and the kernel marked that page dirty, meaning it would be written back to disk. A
            read-only file had just been modified by a user with no write permission on it.
          </p>
          <p className="text-sm muted">
            The consequences follow immediately. Overwrite a setuid root binary with a payload; write
            an entry into <code className="text-xs">/etc/passwd</code>; patch a shared library that
            root will load. The published proof of concept did the{" "}
            <code className="text-xs">/etc/passwd</code> version and was a few dozen lines. Nothing
            about the exploit was fragile: races that can be retried indefinitely at no cost are races
            you win.
          </p>
        </section>

        <img
          src="/blog/dirty-cow-2.jpg"
          alt="Dirty COW privilege escalation: an unprivileged process gaining root through a kernel memory flaw"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A nine-year timeline</h2>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 190"
              role="img"
              aria-label="Timeline of Dirty COW: introduced in the Linux kernel around 2007, disclosed and patched in October 2016, Huge Dirty COW variant in 2017, and the related Dirty Pipe flaw in 2022"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <line
                x1={30}
                y1={78}
                x2={670}
                y2={78}
                stroke="currentColor"
                strokeOpacity={0.4}
                strokeWidth={2}
              />
              {[
                { x: 60, year: "2007", label: "Bug introduced", sub: "unnoticed in COW path" },
                { x: 300, year: "Oct 2016", label: "Disclosed + patched", sub: "CVE-2016-5195", hot: true },
                { x: 470, year: "2017", label: "Huge Dirty COW", sub: "CVE-2017-1000405" },
                { x: 630, year: "2022", label: "Dirty Pipe", sub: "same class, new bug" },
              ].map((p) => (
                <g key={p.year}>
                  <circle
                    cx={p.x}
                    cy={78}
                    r={p.hot ? 8 : 6}
                    fill={p.hot ? "var(--dg-accent,#2563eb)" : "currentColor"}
                    fillOpacity={p.hot ? 0.9 : 0.55}
                  />
                  <text
                    x={p.x}
                    y={46}
                    textAnchor="middle"
                    fontSize="12.5"
                    fontWeight="600"
                    fill="currentColor"
                  >
                    {p.year}
                  </text>
                  <text
                    x={p.x}
                    y={104}
                    textAnchor="middle"
                    fontSize="11.5"
                    fill="currentColor"
                    fillOpacity={0.85}
                  >
                    {p.label}
                  </text>
                  <text
                    x={p.x}
                    y={120}
                    textAnchor="middle"
                    fontSize="10"
                    fill="currentColor"
                    fillOpacity={0.55}
                  >
                    {p.sub}
                  </text>
                </g>
              ))}
              <rect
                x={60}
                y={148}
                width={240}
                height={24}
                rx={5}
                fill="currentColor"
                fillOpacity={0.07}
                stroke="currentColor"
                strokeOpacity={0.25}
              />
              <text x={180} y={165} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.75}>
                ~9 years of exposure before disclosure
              </text>
            </svg>
            <figcaption className="text-xs muted mt-2">
              Dirty COW&apos;s lifecycle. The gap between introduction and discovery is the part worth
              sitting with: the code was in every Linux system on earth and read by thousands of
              people.
            </figcaption>
          </div>
          <p className="text-sm muted">
            Phil Oester found it in 2016 by capturing an exploit in use against a live server &mdash;
            it was already being exploited in the wild before it was reported. Disclosure and the
            upstream fix came within days of each other in October 2016, and distributions shipped
            backported kernels almost immediately. A variant affecting transparent huge pages, dubbed
            Huge Dirty COW and tracked as CVE-2017-1000405, surfaced the following year when the
            original fix turned out not to cover that path.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Why containers did not save anyone
          </h2>
          <p className="text-sm muted">
            This is the part with lasting relevance. A container is a process with namespaces, cgroups,
            capability restrictions, and usually a seccomp profile. All of those are enforced{" "}
            <em>by the kernel</em>. When the flaw is in the kernel&apos;s own memory management, the
            thing enforcing the boundary is the thing that is broken.
          </p>
          <p className="text-sm muted">
            Concretely, where a host file was bind-mounted read-only into a container &mdash; a very
            common pattern for configuration and for host binaries &mdash; Dirty COW could be used to
            write to that file on the host. Read-only meant read-only at the mount layer; the bug
            operated below it. Rootless containers helped only insofar as the target file was not
            writable by the resulting uid, and seccomp helped only where it happened to block{" "}
            <code className="text-xs">madvise</code>, which most default profiles did not.
          </p>
          <p className="text-sm muted">
            The general lesson carries forward to every kernel CVE since: container isolation is a
            meaningful reduction in attack surface, not a security boundary equivalent to a virtual
            machine. If your threat model requires that a compromised workload cannot reach the host,
            the answer is a hypervisor boundary or a sandboxed runtime, not a tighter seccomp profile.
            We go through the practical version of this in{" "}
            <Link href="/blog/container-runtime-security" className="underline">
              container runtime security
            </Link>
            .
          </p>
        </section>

        <img
          src="/blog/dirty-cow-3.jpg"
          alt="Kernel patch timeline for the Dirty COW vulnerability across Linux distributions"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Remediation, then and now
          </h2>
          <p className="text-sm muted">
            There was never a real workaround. Some sites deployed a SystemTap script to block the
            specific <code className="text-xs">madvise</code> pattern as a stopgap, but the actual fix
            was and is a patched kernel plus a reboot. That is worth stating plainly because it is
            different from how most container CVEs are handled: you cannot rebuild your way out of a
            kernel bug. Your image can be pristine and your host still vulnerable.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <pre className="text-xs leading-relaxed"><code>{`# what kernel is this host actually running?
uname -r

# on Debian/Ubuntu: is the running kernel the newest installed one?
dpkg -l 'linux-image-*' | grep '^ii'

# on RHEL-family: check for a pending kernel update
rpm -q kernel
dnf check-update kernel

# does the running kernel differ from what is installed on disk?
needs-restarting -r   # RHEL family`}</code></pre>
          </div>
          <p className="text-sm muted">
            The failure mode that still bites people is the reboot gap: the patched kernel package is
            installed, the vulnerability scanner reports the host as fixed because the package version
            is current, and the machine is still running the old kernel from three months ago. Track
            the running kernel, not just the installed package. On Red Hat systems there is an extra
            wrinkle &mdash; fixes are backported into the distribution&apos;s kernel version rather
            than rebased, so a version-string comparison against upstream is misleading. That
            mechanism is covered in{" "}
            <Link href="/blog/redhat-backporting-explained" className="underline">
              how Red Hat backports security patches
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Dirty COW should still change</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Patch the host kernel on a schedule, and reboot.</strong> Node images that live
              for a year are the modern equivalent of an unpatched 2016 server. Rolling node
              replacement is easier than kernel live patching for most teams.
            </li>
            <li>
              <strong>Assume namespace escape is possible.</strong> Design so that a compromised
              container reaching the host is a bad day rather than a catastrophe: separate node pools
              for untrusted workloads, no cluster-admin credentials on nodes running them.
            </li>
            <li>
              <strong>Minimise what a container can do if it does get root.</strong> Drop capabilities,
              run non-root, use a restrictive seccomp profile. None of this stops a kernel bug, but it
              raises the cost of every step after the initial foothold &mdash; the settings covered in{" "}
              <Link href="/blog/security-context-kubernetes" className="underline">
                Kubernetes security contexts
              </Link>
              .
            </li>
            <li>
              <strong>Do not bind-mount host paths you would mind being written to.</strong>{" "}
              &ldquo;Read-only&rdquo; is an assertion made by a layer that a kernel bug operates below.
            </li>
            <li>
              <strong>Know where your exploited-in-the-wild list comes from.</strong> Dirty COW was
              exploited before it was reported. The{" "}
              <Link href="/blog/cisa-kev-guide" className="underline">
                CISA KEV catalog
              </Link>{" "}
              exists to make that category visible and is a better prioritisation signal than severity
              alone.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            An image scanner cannot tell you whether your host kernel is vulnerable to Dirty COW
            &mdash; the kernel is not in the image. We would rather say that plainly than imply
            otherwise. What a scanner does do is give you an accurate inventory of everything that{" "}
            <em>is</em> in the artifact, so that when the next widely-exploited flaw lands in a library
            you ship, you can answer &ldquo;where do we have it?&rdquo; in minutes rather than days.
          </p>
          <p className="text-sm muted">
            ScanRook reads the real package databases inside a container image, binary, or source
            archive and matches every package against OSV, NVD, and Red Hat OVAL in parallel, so
            backported distribution fixes are evaluated correctly instead of being judged on an
            upstream version string. Scanning a saved image takes one command:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <pre className="text-xs leading-relaxed"><code>{`curl -fsSL https://scanrook.io/install.sh | sh

docker save myapp:1.0 -o image.tar
scanrook scan image.tar --format json --out report.json`}</code></pre>
          </div>
          <p className="text-sm muted">
            Pair that with host-level patching and node rotation. The scanner covers what you build;
            kernel hygiene covers what you build it on. Neither substitutes for the other &mdash; a
            point{" "}
            <Link href="/blog/patch-management-guide" className="underline">
              our patch management guide
            </Link>{" "}
            works through in more detail.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is Dirty COW?</h3>
              <p className="text-sm muted mt-1">
                CVE-2016-5195, a race condition in Linux kernel copy-on-write handling that let a local
                user write to read-only file mappings and escalate to root.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How did the exploit work?</h3>
              <p className="text-sm muted mt-1">
                Two threads raced: one wrote through{" "}
                <code className="text-xs">/proc/self/mem</code>, the other called{" "}
                <code className="text-xs">madvise(MADV_DONTNEED)</code> to discard the private copy, so
                the write reached the underlying file.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Could it escape a container?</h3>
              <p className="text-sm muted mt-1">
                In configurations with host files mapped read-only into the container, yes. Namespaces
                are enforced by the kernel, so a kernel memory bug is not contained by them.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is it still a risk?</h3>
              <p className="text-sm muted mt-1">
                Not on maintained systems. It persists on unpatched appliances, embedded devices, and
                abandoned Android builds, and as a design lesson about shared-kernel isolation.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Know what you actually ship</h3>
          <p className="text-sm muted leading-relaxed">
            You cannot patch a kernel from an image, but you can know exactly what is inside every
            artifact you build. Scan one with ScanRook &mdash; every finding carries its source and a
            confidence tier.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--dg-accent,#2563eb)] text-white px-4 py-2 text-sm font-medium"
            >
              Start scanning
            </Link>
            <Link href="/blog/what-is-a-cve" className="btn-secondary">
              What is a CVE?
            </Link>
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
            <Link href="/blog/shellshock-cve-2014-6271" className="underline">
              Shellshock (CVE-2014-6271)
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
