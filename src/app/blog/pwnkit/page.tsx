import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-22";

const title = `PwnKit (CVE-2021-4034): The polkit Root Bug | ${APP_NAME}`;
const description =
  "PwnKit, CVE-2021-4034, is a local root escalation in polkit's pkexec that sat unnoticed for 12 years. How it works, who is affected, and how to check and fix it.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "pwnkit",
    "cve-2021-4034",
    "pkexec vulnerability",
    "polkit privilege escalation",
    "pwnkit exploit",
    "local privilege escalation linux",
    "pkexec suid",
    "polkit patch",
    "pwnkit mitigation",
    "linux root escalation",
  ],
  alternates: { canonical: "/blog/pwnkit" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/pwnkit",
    images: ["/blog/pwnkit.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/pwnkit.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "PwnKit (CVE-2021-4034): The polkit Root Bug",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/pwnkit",
  image: "https://scanrook.io/blog/pwnkit.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is PwnKit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PwnKit is the nickname for CVE-2021-4034, a local privilege escalation vulnerability in pkexec, a setuid-root helper shipped with polkit. Disclosed by Qualys in January 2022, it allows any unprivileged local user on an affected system to obtain full root privileges. The flawed code had been present since pkexec was introduced in 2009, making it roughly twelve years old at disclosure.",
      },
    },
    {
      "@type": "Question",
      name: "How does the PwnKit exploit work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "pkexec's argument handling did not account for being invoked with an empty argument vector. With an argument count of zero, a loop that should have processed arguments is skipped and subsequent code indexes past the end of the array, reading and writing into the adjacent environment block. That out-of-bounds write lets an attacker reintroduce an environment variable that pkexec normally strips, and by pointing a library-loading variable at an attacker-controlled path the process executes attacker code as root.",
      },
    },
    {
      "@type": "Question",
      name: "Which systems are affected by CVE-2021-4034?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Essentially any Linux distribution that ships polkit with the setuid pkexec binary and had not applied the January 2022 fix. That includes the mainstream Debian, Ubuntu, Red Hat, Fedora, SUSE, and Arch families among others. The vulnerability is local only, so it requires the attacker to already have some form of code execution on the machine, which in practice usually means chaining it after another bug.",
      },
    },
    {
      "@type": "Question",
      name: "How do I fix or mitigate PwnKit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Install the patched polkit package from your distribution, which is the correct fix. If patching has to wait, removing the setuid bit from pkexec with chmod 0755 on the binary prevents exploitation, at the cost of breaking any workflow that relies on pkexec to elevate privileges. Verify afterwards that the binary no longer shows the setuid permission bit.",
      },
    },
    {
      "@type": "Question",
      name: "Does PwnKit affect containers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Only indirectly. Most container images do not install polkit, and gaining root inside a container namespace is not the same as gaining root on the host. It still matters, though: root in the container defeats a non-root USER instruction and can be a step toward host access when combined with a privileged container, a mounted socket, or a runtime escape. The host itself, where polkit usually is installed, is the primary concern.",
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
            PwnKit (CVE-2021-4034): The polkit Root Bug
          </h1>
          <p className="text-sm muted">Published November 22, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            PwnKit is a local privilege escalation vulnerability in{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">pkexec</code>,
            the setuid-root helper that ships with polkit on nearly every Linux distribution. Any
            unprivileged local user could turn it into a root shell, reliably, with no memory-layout
            guesswork. It is worth revisiting not because it is unpatched &mdash; it has been fixed
            since January 2022 &mdash; but because of how ordinary the mistake was and how long it
            survived.
          </p>
        </header>

        <img
          src="/blog/pwnkit.jpg"
          alt="Privilege escalation from an unprivileged user to root through pkexec"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The short version</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top font-semibold">Identifier</td>
                  <td className="py-2 align-top">CVE-2021-4034, nicknamed PwnKit</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top font-semibold">Component</td>
                  <td className="py-2 align-top">pkexec, part of polkit (formerly PolicyKit)</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top font-semibold">Impact</td>
                  <td className="py-2 align-top">Local unprivileged user to full root</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top font-semibold">Disclosed</td>
                  <td className="py-2 align-top">January 2022, by Qualys</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top font-semibold">Introduced</td>
                  <td className="py-2 align-top">2009, when pkexec was first added</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top font-semibold">Severity</td>
                  <td className="py-2 align-top">
                    NVD rates it 7.8 High under CVSS v3.1 &mdash; local attack vector, low complexity,
                    high impact to confidentiality, integrity, and availability
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            The score understates how much operators cared about it. A 7.8 sits below a network-facing
            critical, but PwnKit was universally present, trivially exploitable, and worked out of the
            box &mdash; the exact profile that makes a CVSS number a poor proxy for urgency, as we
            discuss in{" "}
            <Link href="/blog/understanding-nvd-and-cvss" className="underline">
              understanding NVD and CVSS
            </Link>
            . It was subsequently added to CISA&apos;s{" "}
            <Link href="/blog/cisa-kev-guide" className="underline">
              Known Exploited Vulnerabilities catalog
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What pkexec is and why it is setuid</h2>
          <p className="text-sm muted">
            polkit is the framework desktop Linux uses to answer &ldquo;may this user do this
            privileged thing?&rdquo; &mdash; mounting a disk, restarting a service, installing an
            update. <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">pkexec</code>{" "}
            is its command-line front end, roughly polkit&apos;s answer to{" "}
            <code className="text-xs">sudo</code>. To do its job it is installed setuid root: the
            kernel runs it with root privileges regardless of who invoked it, and the program is
            responsible for dropping or withholding that privilege appropriately.
          </p>
          <p className="text-sm muted">
            That last sentence is the entire risk model of setuid binaries. The program starts trusted
            and must defend itself against a completely attacker-controlled environment &mdash;
            arguments, environment variables, file descriptors, working directory, resource limits. Any
            oversight is a privilege escalation, not a crash.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How PwnKit works</h2>
          <p className="text-sm muted">
            The bug is an assumption that almost every C programmer makes without noticing:{" "}
            <em>argc is at least 1</em>. It normally is, because the shell always passes the program
            name as the first element. But the underlying{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">execve</code>{" "}
            system call happily accepts an empty argument vector, and a caller who invokes pkexec that
            way gets an argument count of zero.
          </p>
          <p className="text-sm muted">The chain that follows is short:</p>
          <ol className="text-sm muted list-decimal pl-5 grid gap-2">
            <li>
              With <code className="text-xs">argc</code> at zero, the loop that walks the arguments
              never runs, so its index variable is left pointing at the first slot.
            </li>
            <li>
              Later code reads that slot anyway. Because the argument array is empty, the read lands
              past its end &mdash; in the memory immediately after it, which is the environment block.
            </li>
            <li>
              A subsequent write through the same out-of-bounds index puts an attacker-chosen value
              back into the environment &mdash; specifically, it reintroduces a variable that pkexec
              had already stripped as unsafe.
            </li>
            <li>
              Setting a variable that controls where the C library looks for loadable modules, and
              pointing it at a directory the attacker owns, makes the still-root process load and run
              attacker code.
            </li>
          </ol>
          <p className="text-sm muted">
            No heap grooming, no ASLR bypass, no race window. The exploit is deterministic, which is
            why working proof-of-concept code appeared within hours of disclosure and why the practical
            urgency far exceeded the numeric score.
          </p>
        </section>

        <img
          src="/blog/pwnkit-2.jpg"
          alt="Out-of-bounds write from an argument array into the adjacent environment block"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The exploitation chain</h2>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 210"
              role="img"
              aria-label="Flow diagram of the PwnKit exploitation chain: an empty argument vector leads to an out-of-bounds index, which reintroduces a stripped environment variable, which causes the setuid root process to load attacker-controlled code and yield a root shell"
              className="w-full"
              style={{ minWidth: 580 }}
            >
              <defs>
                <marker id="pk-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              {[
                { x: 6, y: 20, label: "argc = 0", sub: "execve with empty argv" },
                { x: 186, y: 20, label: "OOB index", sub: "reads past argv end" },
                { x: 366, y: 20, label: "Env rewrite", sub: "stripped var restored", hot: true },
                { x: 546, y: 20, label: "Root", sub: "attacker code as uid 0" },
              ].map((b) => (
                <g key={b.label}>
                  <rect
                    x={b.x}
                    y={b.y}
                    width={148}
                    height={54}
                    rx={8}
                    fill={b.hot ? "var(--dg-accent,#2563eb)" : "transparent"}
                    fillOpacity={b.hot ? 0.14 : 1}
                    stroke="currentColor"
                    strokeOpacity={0.5}
                  />
                  <text x={b.x + 74} y={b.y + 23} textAnchor="middle" fontSize="13.5" fontWeight="600" fill="currentColor">
                    {b.label}
                  </text>
                  <text x={b.x + 74} y={b.y + 41} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.6}>
                    {b.sub}
                  </text>
                </g>
              ))}
              {[160, 340, 520].map((x) => (
                <line key={x} x1={x} y1={47} x2={x + 20} y2={47} stroke="currentColor" strokeWidth={2} markerEnd="url(#pk-arrow)" />
              ))}
              <rect x={40} y={110} width={280} height={34} rx={6} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.3} />
              <text x={180} y={131} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.75}>
                Fix: patched polkit rejects argc = 0
              </text>
              <rect x={370} y={110} width={280} height={34} rx={6} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.3} />
              <text x={510} y={131} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.75}>
                Stopgap: remove the setuid bit
              </text>
              <text x={6} y={182} fontSize="10.5" fill="currentColor" fillOpacity={0.6}>
                Deterministic chain &mdash; no memory-layout guesswork, which is why exploits appeared within hours.
              </text>
            </svg>
            <figcaption className="text-xs muted mt-2">
              PwnKit&apos;s exploitation path, and the two points where it can be broken.
            </figcaption>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Checking whether you are exposed</h2>
          <p className="text-sm muted">
            First, is pkexec even present, and is it setuid? The permission string beginning with{" "}
            <code className="text-xs">-rws</code> is the tell:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`ls -l /usr/bin/pkexec
# -rwsr-xr-x 1 root root ... /usr/bin/pkexec   <- setuid present`}
          </pre>
          <p className="text-sm muted">Then check the installed polkit package version:</p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`# Debian / Ubuntu
dpkg -l | grep -Ei 'polkit|policykit'

# RHEL / Fedora / SUSE
rpm -q polkit`}
          </pre>
          <p className="text-sm muted">
            Comparing that version against &ldquo;fixed&rdquo; is where it gets subtle. Distributions
            backport security fixes into their own version strings rather than rebasing to a new
            upstream release, so a package that looks old by upstream numbering may well be patched.
            Check your distribution&apos;s security tracker for the exact fixed version rather than
            reasoning from the upstream number &mdash; the general problem is covered in{" "}
            <Link href="/blog/redhat-backporting-explained" className="underline">
              how Red Hat backports security patches
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Fixing it</h2>
          <p className="text-sm muted">
            The correct fix is your distribution&apos;s patched polkit package. Nothing clever is
            required:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`# Debian / Ubuntu
sudo apt-get update && sudo apt-get install --only-upgrade policykit-1

# RHEL / Fedora
sudo dnf update polkit`}
          </pre>
          <p className="text-sm muted">
            If a maintenance window is genuinely unavailable, the documented stopgap is to remove the
            setuid bit so the kernel stops granting pkexec root in the first place:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`sudo chmod 0755 /usr/bin/pkexec
ls -l /usr/bin/pkexec   # verify: -rwxr-xr-x, no 's'`}
          </pre>
          <p className="text-sm muted">
            This breaks anything that relies on pkexec to elevate privileges, which on a server is
            usually nothing and on a desktop is usually something. Treat it as a bridge to patching,
            not a resolution &mdash; and note that a package upgrade may restore the setuid bit, which
            is fine once the patched version is in place.
          </p>
        </section>

        <img
          src="/blog/pwnkit-3.jpg"
          alt="Patch rollout progressing across a fleet of Linux hosts"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            What PwnKit means for containers
          </h2>
          <p className="text-sm muted">
            Be honest about this one, because it is frequently overstated. Most container images do not
            install polkit at all, and a container that does gains you root <em>inside the
            container&apos;s user namespace</em> &mdash; not on the host. That is not a container
            escape.
          </p>
          <p className="text-sm muted">
            It still matters for two reasons. First, root in the container defeats the{" "}
            <code className="text-xs">USER</code> instruction you carefully added and re-enables
            everything that non-root was meant to prevent, which is the whole point of the workload
            constraints in{" "}
            <Link href="/blog/security-context-kubernetes" className="underline">
              a Kubernetes security context
            </Link>
            . Second, in-container root is a useful rung when combined with a privileged container, a
            mounted Docker socket, or a runtime bug like{" "}
            <Link href="/blog/leaky-vessels-cve-2024-21626" className="underline">
              Leaky Vessels
            </Link>
            . The bigger exposure is the host: your nodes and CI runners almost certainly do have
            polkit installed.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The lesson worth keeping</h2>
          <p className="text-sm muted">
            PwnKit was not exotic. It was a boundary condition nobody tested, in twelve-year-old code,
            in a program small enough to read in an afternoon. The same year produced{" "}
            <Link href="/blog/regresshion-cve-2024-6387" className="underline">
              a similarly old class of bug in OpenSSH
            </Link>
            , and the pattern before that was{" "}
            <Link href="/blog/shellshock-cve-2014-6271" className="underline">
              Shellshock
            </Link>
            . Age is not evidence of safety; it is evidence that nobody has looked recently.
          </p>
          <p className="text-sm muted">
            The operational takeaway is unglamorous: know what is installed on your hosts and images,
            and be able to answer &ldquo;which of our systems have this package at this version&rdquo;
            in minutes rather than days. Teams that could answer that in January 2022 patched PwnKit in
            an afternoon. Teams that could not spent a week building an inventory first.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook is an inventory-and-matching tool, which is exactly the capability the PwnKit
            scramble exposed. It reads the real package databases inside a container image, binary, or
            source archive &mdash; the dpkg, RPM, and apk metadata actually present rather than
            filenames it guesses from &mdash; and matches each package against OSV, NVD, and Red Hat
            OVAL in parallel. Every finding carries the source it came from and a confidence tier.
          </p>
          <p className="text-sm muted">
            For a case like CVE-2021-4034 the multi-source part is what matters: distribution trackers
            record the backported fixed version that NVD alone does not, so matching against several
            sources is the difference between a correct answer and a false positive on a patched
            system. What ScanRook does not do is scan running hosts &mdash; for node-level polkit you
            still want your configuration management or an agent. Our{" "}
            <Link href="/blog/patch-management-guide" className="underline">
              patch management guide
            </Link>{" "}
            covers how the two halves fit together.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is PwnKit?</h3>
              <p className="text-sm muted mt-1">
                CVE-2021-4034, a local root escalation in polkit&apos;s setuid pkexec helper, disclosed
                by Qualys in January 2022 after roughly twelve years in the codebase.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How does it work?</h3>
              <p className="text-sm muted mt-1">
                An empty argument vector leaves an index pointing past the end of the argument array;
                the resulting out-of-bounds write restores a stripped environment variable that makes
                the root process load attacker-controlled code.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is it remotely exploitable?</h3>
              <p className="text-sm muted mt-1">
                No. It requires local access, so it is a second-stage bug &mdash; typically chained
                after a remote foothold to convert limited access into root.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What if I cannot patch immediately?</h3>
              <p className="text-sm muted mt-1">
                Remove the setuid bit from pkexec. It blocks exploitation and breaks pkexec-based
                elevation, so treat it as a bridge until the patched polkit package lands.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Could you answer the inventory question today?</h3>
          <p className="text-sm muted leading-relaxed">
            The next PwnKit will be announced with no warning. Scan your images now so that &ldquo;which
            of these ship the affected package, at what version&rdquo; is a query rather than a project.
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
            <Link href="/blog/regresshion-cve-2024-6387" className="underline">
              regreSSHion (CVE-2024-6387)
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/leaky-vessels-cve-2024-21626" className="underline">
              Leaky Vessels (CVE-2024-21626)
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/cisa-kev-guide" className="underline">
              CISA KEV Guide
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
