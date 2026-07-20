import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-02";

const title = `Dirty Pipe (CVE-2022-0847): The Linux Kernel Flaw | ${APP_NAME}`;
const description =
  "Dirty Pipe explained: how CVE-2022-0847 let any user overwrite read-only files, why it enabled container escape, which kernels are affected, and how to check yours.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "dirty pipe",
    "dirty pipe cve",
    "cve-2022-0847",
    "linux kernel vulnerability",
    "dirty pipe container escape",
    "dirty pipe vs dirty cow",
    "linux privilege escalation",
    "page cache splice vulnerability",
    "kernel 5.8 vulnerability",
    "dirty pipe patch",
  ],
  alternates: { canonical: "/blog/dirty-pipe" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/dirty-pipe",
    images: ["/blog/dirty-pipe.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/dirty-pipe.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Dirty Pipe (CVE-2022-0847): The Linux Kernel Flaw Explained",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/dirty-pipe",
  image: "https://scanrook.io/blog/dirty-pipe.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Dirty Pipe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dirty Pipe is CVE-2022-0847, a Linux kernel vulnerability disclosed in March 2022. A missing initialisation in the kernel's pipe buffer handling allowed an unprivileged local user to write arbitrary data into the page cache backing a file they could only read. The change was visible to other processes and could be written back to disk, producing local privilege escalation to root.",
      },
    },
    {
      "@type": "Question",
      name: "Which kernel versions are affected by Dirty Pipe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The flaw was introduced in Linux 5.8 and fixed in 5.16.11, 5.15.25, and 5.10.102. Distributions backported the fix into their own kernel packages, so the upstream version number alone does not tell you whether a given system is patched — you must check the distribution package version against the vendor advisory.",
      },
    },
    {
      "@type": "Question",
      name: "How is Dirty Pipe different from Dirty COW?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both let an unprivileged user modify files they should only be able to read. Dirty COW (CVE-2016-5195) exploited a race condition in copy-on-write handling and was fiddly to trigger reliably. Dirty Pipe exploited uninitialised pipe buffer flags, required no race, and was substantially simpler and more reliable to exploit, which is why it drew so much attention.",
      },
    },
    {
      "@type": "Question",
      name: "Could Dirty Pipe be used to escape a container?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, in specific circumstances. Containers share the host kernel, so a kernel-level write primitive is not contained by namespaces. Where a container had a read-only mapping of a host file — a shared read-only bind mount, or in some setups the underlying image layer files — the page cache modification could reach content outside the container. Patching the host kernel is the only real fix.",
      },
    },
    {
      "@type": "Question",
      name: "Can a container image scanner detect Dirty Pipe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not meaningfully. Dirty Pipe is a property of the running host kernel, not of anything packaged in an image. A container image may contain kernel headers or a kernel package that a scanner will flag, but that package is not what executes — the host's kernel is. Host kernel version auditing is a separate control from image scanning.",
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
            Dirty Pipe (CVE-2022-0847): The Linux Kernel Flaw Explained
          </h1>
          <p className="text-sm muted">Published November 2, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Dirty Pipe was the rare kernel vulnerability that was both severe and easy to explain: any
            local user could overwrite the contents of a file they only had permission to read. No
            race condition, no memory corruption, no exotic hardware. Just a struct field the kernel
            forgot to reset. Here is what actually went wrong, why it mattered so much for
            containers, and what to check on a system today.
          </p>
        </header>

        <img
          src="/blog/dirty-pipe.jpg"
          alt="Dirty Pipe Linux kernel vulnerability writing into the page cache of a read-only file"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Dirty Pipe is</h2>
          <p className="text-sm muted">
            Dirty Pipe is <strong>CVE-2022-0847</strong>, disclosed in March 2022 by Max Kellermann,
            who found it while debugging corrupted log files rather than while hunting for
            vulnerabilities &mdash; a detail worth remembering next time an odd bug report lands in
            your queue. The name is a deliberate echo of Dirty COW, and the effect is similar: an
            unprivileged local user could modify the contents of files they should only be able to
            read.
          </p>
          <p className="text-sm muted">
            The mechanism sits in the interaction between three kernel concepts. The{" "}
            <strong>page cache</strong> holds file contents in memory so repeated reads do not hit
            disk. <strong>Pipes</strong> are buffers between processes, internally represented as a
            ring of{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">pipe_buffer</code>{" "}
            structures, each with a set of flags. The{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">splice()</code>{" "}
            system call moves data between a file and a pipe without copying it through userspace
            &mdash; it makes the pipe buffer point directly at the existing page cache page.
          </p>
          <p className="text-sm muted">
            One of those flags is{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">PIPE_BUF_FLAG_CAN_MERGE</code>,
            which tells the kernel that a subsequent write may be appended into the existing page
            rather than allocating a new one. A refactor in Linux 5.8 left that flag uninitialised
            when new pipe buffers were allocated, so it could retain a stale value from previous use.
            The exploit therefore reduced to: prime the pipe so the merge flag is set, splice a
            read-only file into it, then write. The write landed in the page cache page belonging to
            that file. Other processes reading the file saw the modified content, and depending on
            the filesystem the change could be persisted to disk.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Why Dirty Pipe was so much worse than it sounds
          </h2>
          <p className="text-sm muted">
            &ldquo;Modify a read-only file&rdquo; sounds bounded until you list the read-only files
            that matter on a Linux system. <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">/etc/passwd</code>.{" "}
            A setuid binary. A shared library loaded by a privileged daemon. A cron script owned by
            root. Any one of those is a direct path from unprivileged local access to root, and
            public proof-of-concept code appeared within days.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 260"
              role="img"
              aria-label="Diagram of the Dirty Pipe mechanism: an unprivileged process primes a pipe buffer so the merge flag is set, splices a read-only file into the pipe, then writes, and the write lands in the shared page cache page seen by all readers"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <defs>
                <marker id="dp-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              {[
                { x: 6, label: "Prime pipe", sub: "merge flag left set" },
                { x: 180, label: "splice()", sub: "read-only file → pipe" },
                { x: 354, label: "write()", sub: "appended into page", hot: true },
                { x: 528, label: "Page cache", sub: "content now altered", hot: true },
              ].map((b) => (
                <g key={b.label}>
                  <rect
                    x={b.x}
                    y={18}
                    width={150}
                    height={54}
                    rx={8}
                    fill={b.hot ? "var(--dg-accent,#2563eb)" : "transparent"}
                    fillOpacity={b.hot ? 0.12 : 1}
                    stroke="currentColor"
                    strokeOpacity={0.5}
                  />
                  <text x={b.x + 75} y={41} textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">
                    {b.label}
                  </text>
                  <text x={b.x + 75} y={60} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.6}>
                    {b.sub}
                  </text>
                </g>
              ))}
              {[156, 330, 504].map((x) => (
                <line key={x} x1={x} y1={45} x2={x + 22} y2={45} stroke="currentColor" strokeWidth={2} markerEnd="url(#dp-arrow)" />
              ))}

              <rect x={20} y={112} width={660} height={44} rx={7} fill="currentColor" fillOpacity={0.04} stroke="currentColor" strokeOpacity={0.28} />
              <text x={36} y={132} fontSize="11.5" fontWeight="600" fill="currentColor" fillOpacity={0.85}>
                Every process reading that file now sees the attacker&apos;s bytes
              </text>
              <text x={36} y={148} fontSize="10.5" fill="currentColor" fillOpacity={0.62}>
                including root-owned daemons, setuid binaries, and shared libraries
              </text>
              <line x1={603} y1={112} x2={603} y2={76} stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.5} strokeDasharray="4 3" />

              <text x={36} y={186} fontSize="11.5" fontWeight="600" fill="currentColor" fillOpacity={0.85}>
                Constraints that limited it:
              </text>
              {[
                "file must be openable for reading",
                "cannot resize the file",
                "cannot write across a page boundary",
                "offset must not be page-aligned",
              ].map((t, i) => (
                <text key={t} x={48} y={206 + i * 15} fontSize="10.5" fill="currentColor" fillOpacity={0.6}>
                  · {t}
                </text>
              ))}
            </svg>
            <figcaption className="text-xs muted mt-2">
              The Dirty Pipe primitive and the constraints on it. The limitations narrowed what could
              be written but not who could write &mdash; any local user with read access qualified.
            </figcaption>
          </div>
          <p className="text-sm muted">
            The constraints in that lower panel are real and they did shape exploitation: you could
            not extend a file, and you could not start a write at a page-aligned offset. But
            overwriting a few bytes in the middle of a page is more than enough to flip a
            configuration value, corrupt a hash in a password file, or patch an instruction in a
            binary. Compared with Dirty COW, which needed a race won reliably, Dirty Pipe was
            deterministic. That reliability is what moved it quickly into real tooling and onto{" "}
            <Link href="/blog/cisa-kev-guide" className="underline">
              CISA&apos;s Known Exploited Vulnerabilities catalog
            </Link>
            .
          </p>
        </section>

        <img
          src="/blog/dirty-pipe-2.jpg"
          alt="Dirty Pipe bypassing read-only file permissions through the Linux page cache"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Dirty Pipe and container escape
          </h2>
          <p className="text-sm muted">
            This is where Dirty Pipe crosses into container security, and it is worth being precise
            because the topic attracts overstatement. Containers are not virtual machines. They share
            the host kernel; namespaces and cgroups restrict what a process can see and consume, but
            every syscall a container makes is serviced by the same kernel that serves the host. A
            vulnerability that gives you an arbitrary write into the kernel&apos;s page cache is not
            constrained by a namespace, because the page cache is not namespaced.
          </p>
          <p className="text-sm muted">
            Concretely: where a container had read access to a file whose page cache pages were
            shared with the host &mdash; a read-only bind mount, or in some configurations the
            underlying image layer files on the host filesystem &mdash; a process inside the
            container could modify content the host would subsequently read. Researchers demonstrated
            escapes along exactly these lines. A read-only mount, which teams reasonably treat as a
            safety measure, provided the read access the primitive required.
          </p>
          <p className="text-sm muted">
            The uncomfortable conclusion is that container isolation offered no mitigation here.
            Dropping capabilities did not help; the exploit needed none. Running as non-root did not
            help; any user could do it. A read-only root filesystem did not help; the point was
            writing to something read-only. The only fix was patching the host kernel. This is the
            same structural lesson as{" "}
            <Link href="/blog/leaky-vessels-cve-2024-21626" className="underline">
              Leaky Vessels
            </Link>
            , and it is why{" "}
            <Link href="/blog/container-runtime-security" className="underline">
              container runtime security
            </Link>{" "}
            has to include the kernel underneath, not just the image on top.
          </p>
          <p className="text-sm muted">
            One nuance worth stating: seccomp profiles that block{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">splice()</code>{" "}
            would have obstructed the standard exploit path. Most default profiles permit it, and
            hardening a syscall filter after the fact is not a substitute for a patched kernel &mdash;
            but it is a decent illustration of why syscall filtering earns its keep as a{" "}
            <Link href="/blog/defense-in-depth" className="underline">
              defence-in-depth
            </Link>{" "}
            layer.
          </p>
        </section>

        <img
          src="/blog/dirty-pipe-3.jpg"
          alt="Container escape path from a shared host kernel exploited by the Dirty Pipe vulnerability"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Checking whether you are affected</h2>
          <p className="text-sm muted">
            The vulnerable window is Linux 5.8 through the fixed releases: <strong>5.16.11</strong>,{" "}
            <strong>5.15.25</strong>, and <strong>5.10.102</strong>. That upstream range is the easy
            part. The hard part, and the part that trips people up every time, is that distributions
            backport fixes without changing the upstream version string in{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">uname -r</code>.
            A RHEL or Ubuntu kernel reporting 5.15.0 may be fully patched or entirely vulnerable
            depending on the package revision.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`# The upstream version — necessary but not sufficient
uname -r

# What actually matters: the distribution package revision
# Debian / Ubuntu
dpkg -l | grep linux-image

# RHEL / Fedora / Rocky
rpm -q kernel

# Then compare that revision against your vendor's advisory for CVE-2022-0847`}
          </pre>
          <p className="text-sm muted">
            This backporting gap is the single most common source of both false positives and false
            negatives in Linux vulnerability reporting, and it is not unique to kernels. We cover the
            mechanics in{" "}
            <Link href="/blog/redhat-backporting-explained" className="underline">
              how Red Hat backports security patches
            </Link>{" "}
            &mdash; the short version is that any tool comparing version numbers without consulting
            distribution advisory data will get RHEL-family systems wrong.
          </p>
          <p className="text-sm muted">
            If you manage Kubernetes nodes, the practical checklist is short. Audit the kernel version
            on every node, not just the ones you built recently. Include managed node pools, which
            update on their own cadence. Include the long-lived bastion and build hosts that never
            appear in a cluster inventory. And treat node kernel patching as a scheduled, verified
            activity rather than something that happens as a side effect of image refreshes.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            We will be direct: ScanRook does not detect Dirty Pipe on your hosts, and no container
            image scanner honestly can. Dirty Pipe is a property of the running host kernel. An image
            might contain kernel headers or a packaged kernel that a scanner will dutifully flag, but
            that package is not what executes &mdash; the host&apos;s kernel is. A finding like that
            is noise, and treating it as coverage is worse than having no coverage, because it feels
            like an answer. Host kernel auditing belongs to your node management and configuration
            assessment tooling.
          </p>
          <p className="text-sm muted">
            What ScanRook does is the artifact half of the problem, thoroughly. It scans container
            image tarballs, binaries, and source archives, reading the real package databases inside
            the artifact rather than inferring from filenames, and matching every package against
            OSV, NVD, and Red Hat OVAL in parallel. That multi-source approach is directly relevant to
            the backporting problem above: OVAL data is what lets a scanner say &ldquo;this RHEL
            package revision carries the fix&rdquo; instead of guessing from a version string. Every
            finding carries its source and a confidence tier, so you can see which conclusion rests
            on distribution data and which rests on a version range.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is Dirty Pipe?</h3>
              <p className="text-sm muted mt-1">
                CVE-2022-0847, a Linux kernel flaw where an uninitialised pipe buffer flag let an
                unprivileged user write into the page cache of a read-only file, producing local
                privilege escalation to root.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Which kernels are affected?</h3>
              <p className="text-sm muted mt-1">
                Linux 5.8 through 5.16.11, 5.15.25, and 5.10.102. Distribution backports mean{" "}
                <code className="text-xs">uname -r</code> is not conclusive &mdash; check the package
                revision against your vendor advisory.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How does it differ from Dirty COW?</h3>
              <p className="text-sm muted mt-1">
                Same class of outcome, different mechanism. Dirty COW needed a race condition; Dirty
                Pipe did not, making it far simpler and more reliable to exploit.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Did it enable container escape?</h3>
              <p className="text-sm muted mt-1">
                In configurations with shared read-only mappings, yes. Containers share the host
                kernel, and the page cache is not namespaced. Patching the host kernel was the only
                real fix.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Get the artifact half right</h3>
          <p className="text-sm muted leading-relaxed">
            Kernel patching is a host problem. Knowing which package versions ship inside your images
            &mdash; and whether a backported fix is present &mdash; is an artifact problem. Scan one
            with ScanRook and see the advisory source behind every finding.
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
              Leaky Vessels Container Escape
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-runtime-security" className="underline">
              Container Runtime Security
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/redhat-backporting-explained" className="underline">
              How Red Hat Backports Security Patches
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
