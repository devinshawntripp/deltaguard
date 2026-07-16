import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-22";

const title = `osquery Explained: Query Your OS Like a Database | ${APP_NAME}`;
const description =
  "osquery exposes your operating system as a SQL database you can query for processes, packages, and network state across a fleet of hosts. How it works.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "osquery",
    "what is osquery",
    "osquery tutorial",
    "osquery sql",
    "osquery fleet",
    "osqueryd",
    "endpoint visibility",
    "osquery vulnerability management",
    "host inventory",
    "osquery vs falco",
  ],
  alternates: { canonical: "/blog/osquery" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/osquery",
    images: ["/blog/osquery.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/osquery.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "osquery Explained: Query Your OS Like a Database",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/osquery",
  image: "https://scanrook.io/blog/osquery.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is osquery?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "osquery is an open-source tool that exposes an operating system as a relational database you query with SQL. Concepts like running processes, listening ports, installed packages, users, and loaded kernel modules appear as virtual tables. It was created at Facebook in 2014, later moved to the Linux Foundation, and runs on Linux, macOS, Windows, and FreeBSD.",
      },
    },
    {
      "@type": "Question",
      name: "What can you do with osquery?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can inventory hardware and software, hunt for threats, respond to incidents, and check compliance. Because everything is a SQL table, you can ask questions like which hosts run a given process, what is listening on a port, or which machines have a specific package installed. Scheduled queries turn those questions into continuous monitoring across a fleet.",
      },
    },
    {
      "@type": "Question",
      name: "Is osquery a vulnerability scanner?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not on its own. osquery can inventory installed packages through tables like deb_packages and rpm_packages, but it does not match those packages against a CVE database or tell you which are vulnerable. To turn that inventory into vulnerability findings you feed it into a tool or fleet manager that performs the CVE matching.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between osqueryi and osqueryd?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "osqueryi is the interactive shell: you open a prompt and run ad hoc SQL against the live system, which is ideal for exploration and incident response. osqueryd is the daemon that runs scheduled queries in the background, logs results, and reports only what changed between runs, which is how osquery is used for continuous fleet monitoring.",
      },
    },
    {
      "@type": "Question",
      name: "Is osquery free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. osquery is free and open source under a permissive license and is governed by the Linux Foundation. Many organizations pair it with an open-source or commercial fleet manager, such as Fleet, to distribute queries and collect logs at scale, but the osquery agent itself carries no license cost.",
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
            osquery Explained: Query Your OS Like a Database
          </h1>
          <p className="text-sm muted">Published October 22, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            osquery takes a strange but powerful idea and makes it practical: what if you could ask
            your operating system questions in SQL? Instead of scripting <code>ps</code>,{" "}
            <code>netstat</code>, and <code>dpkg</code> across a fleet, you write a query. This guide
            explains what osquery is, how the daemon and shell differ, what it is genuinely good at,
            and where it stops &mdash; including why it is not, by itself, a vulnerability scanner.
          </p>
        </header>

        <img
          src="/blog/osquery.jpg"
          alt="osquery exposing the operating system as SQL tables"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The core idea: the OS as tables</h2>
          <p className="text-sm muted">
            osquery represents operating-system state as a set of virtual SQLite tables. Running
            processes become the <code>processes</code> table. Open sockets become{" "}
            <code>listening_ports</code> and <code>process_open_sockets</code>. Installed software
            shows up in <code>deb_packages</code>, <code>rpm_packages</code>,{" "}
            <code>python_packages</code>, <code>npm_packages</code>, and more. There are well over
            two hundred tables covering users, cron jobs, kernel modules, browser extensions,
            certificates, file hashes, and startup items. You query them with ordinary SQL,
            including joins:
          </p>
          <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10 p-4 text-xs">
            <pre className="whitespace-pre"><code>{`-- Which processes are listening on a network port, and on what?
SELECT p.name, p.pid, l.port, l.protocol
FROM processes p
JOIN listening_ports l ON p.pid = l.pid
ORDER BY l.port;

-- Every Debian package with its version
SELECT name, version FROM deb_packages ORDER BY name;`}</code></pre>
          </div>
          <p className="text-sm muted">
            Because the interface is SQL, the same query works whether you run it once on a laptop or
            schedule it across ten thousand servers. That uniformity is the whole appeal.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">osqueryi vs osqueryd</h2>
          <p className="text-sm muted">
            osquery ships as two binaries. <code>osqueryi</code> is an interactive shell &mdash; a
            REPL where you type SQL and get results immediately. It is what you reach for during an
            investigation or when learning the schema. <code>osqueryd</code> is the daemon. You give
            it a schedule of queries, and it runs them at intervals, writes results to a log, and can
            emit <em>differential</em> logs that report only what changed since the last run &mdash;
            a new process, a newly opened port, a removed user. That differential model is what makes
            osquery viable for continuous monitoring instead of drowning you in full snapshots.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Running it across a fleet</h2>
          <p className="text-sm muted">
            One host is useful; a fleet is where osquery earns its keep. A fleet manager distributes
            query packs to every agent over a TLS API and collects the resulting logs centrally,
            usually forwarding them into a SIEM or data lake. The open-source Fleet project is the
            common choice, and several commercial platforms build on osquery as well. The picture
            below shows the shape of a deployment.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 720 200" width="100%" role="img" aria-label="osquery fleet architecture: osqueryd agents on hosts receive scheduled query packs over TLS and send differential logs to a fleet manager and SIEM">
              <text x="10" y="20" fontSize="12" fill="currentColor" fillOpacity="0.7" fontWeight="600">Hosts running osqueryd</text>
              {[40, 90, 140].map((y, i) => (
                <g key={y}>
                  <rect x="14" y={y - 14} width="150" height="26" rx="6" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
                  <text x="24" y={y + 3} fontSize="11" fill="currentColor">agent {i + 1}</text>
                  <line x1="164" y1={y - 1} x2="300" y2="100" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
                </g>
              ))}
              <rect x="300" y="72" width="150" height="56" rx="8" fill="var(--dg-accent,#2563eb)" fillOpacity="0.12" stroke="var(--dg-accent,#2563eb)" strokeOpacity="0.55" />
              <text x="375" y="96" fontSize="12" fill="currentColor" textAnchor="middle" fontWeight="600">Fleet manager</text>
              <text x="375" y="114" fontSize="10" fill="currentColor" textAnchor="middle" fillOpacity="0.75">TLS: packs down, logs up</text>
              <line x1="450" y1="100" x2="560" y2="100" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" markerEnd="url(#oq)" />
              <rect x="560" y="72" width="150" height="56" rx="8" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
              <text x="635" y="104" fontSize="12" fill="currentColor" textAnchor="middle" fontWeight="600">SIEM / data lake</text>
              <defs>
                <marker id="oq" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" fillOpacity="0.6" />
                </marker>
              </defs>
            </svg>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Query packs and scheduling</h2>
          <p className="text-sm muted">
            You rarely hand-write every query. osquery groups related queries into <em>packs</em>
            &mdash; JSON bundles you attach in the daemon configuration, each query given an interval
            in seconds. The project and community ship packs for incident response, hardware
            monitoring, compliance, and vulnerability-management use cases, and you can write your
            own. A pack entry pairs a SQL statement with how often it runs and, optionally, which
            platforms it applies to, so a fleet can carry one coherent policy that still adapts per
            host.
          </p>
          <p className="text-sm muted">
            Scheduling is where the differential model earns its keep. If a query for listening ports
            runs every five minutes, you do not want the full result set every time &mdash; you want
            to know when a <em>new</em> port appears. osquery&apos;s choice between snapshot and
            differential logging lets you pick, and differential logs are what make continuous
            monitoring affordable instead of a firehose. Beyond scheduled polling, osquery also has an
            eventing framework with evented tables, backed by the operating system audit subsystem,
            for capturing things like process executions as they happen rather than only at the next
            scheduled run.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What osquery is good at</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Inventory</strong> &mdash; a live, queryable catalog of hardware, software,
              users, and configuration across every host.
            </li>
            <li>
              <strong>Incident response</strong> &mdash; when something is wrong, you can sweep the
              fleet for a suspicious binary, a rogue listening port, or a persistence mechanism in
              seconds.
            </li>
            <li>
              <strong>Threat hunting</strong> &mdash; scheduled queries surface anomalies like new
              cron entries, unexpected kernel modules, or changed startup items.
            </li>
            <li>
              <strong>Compliance evidence</strong> &mdash; disk encryption status, screen-lock
              settings, and installed-agent checks become auditable queries.
            </li>
          </ul>
          <p className="text-sm muted">
            Its strength is reading actual system state rather than guessing. That philosophy is the
            same one behind{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning versus advisory matching
            </Link>{" "}
            &mdash; you get more reliable answers when you read what is really on the machine.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where osquery stops</h2>
          <p className="text-sm muted">
            osquery is a telemetry and query engine, not a security product by itself. It tells you{" "}
            <em>what is there</em>; it does not judge whether what is there is dangerous. Its package
            tables list every installed library and version, but osquery has no CVE feed and will not
            tell you that <code>openssl 3.0.11</code> is affected by a given advisory. Turning
            inventory into vulnerability findings requires a separate matching step against a
            vulnerability database.
          </p>
          <p className="text-sm muted">
            It is also mostly snapshot-oriented. osquery has an eventing framework and evented tables
            (backed by audit subsystems), but for deep, continuous syscall-level threat detection
            many teams pair it with a purpose-built runtime tool like{" "}
            <Link href="/blog/falco-runtime-security-explained" className="underline">
              Falco
            </Link>
            . osquery answers scheduled questions; Falco streams runtime events. They solve different
            halves of endpoint visibility.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">osquery and ScanRook</h2>
          <p className="text-sm muted">
            The two are complementary, and it is worth being precise about the boundary. osquery
            gives you fleet-wide, runtime visibility into hosts that already exist &mdash; which
            machines are running what, right now. ScanRook works on artifacts: point it at a
            container image, a source tarball, or a binary and it matches every package against OSV,
            NVD, and Red Hat OVAL to produce ranked CVE findings and a full SBOM, before the artifact
            ever reaches a host.
          </p>
          <p className="text-sm muted">
            A natural workflow uses both. ScanRook gates images in the build pipeline and during{" "}
            <Link href="/blog/container-image-scanning-guide" className="underline">
              container image scanning
            </Link>
            , so vulnerable artifacts are caught before deployment. osquery then watches the running
            fleet, and its package inventory can even feed a{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              software composition analysis
            </Link>{" "}
            step to reconcile what is actually installed against what you shipped. osquery answers
            &ldquo;what is installed?&rdquo;; ScanRook answers &ldquo;is it vulnerable, and how
            urgently?&rdquo;
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is osquery?</h3>
              <p className="text-sm muted mt-1">
                An open-source tool that exposes operating-system state as SQL tables. Created at
                Facebook in 2014 and now a Linux Foundation project, it runs on Linux, macOS,
                Windows, and FreeBSD.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is osquery a vulnerability scanner?</h3>
              <p className="text-sm muted mt-1">
                No. It can inventory installed packages but does not match them to CVEs on its own.
                You pair its inventory with a vulnerability database or scanner to get findings.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is the difference between osqueryi and osqueryd?</h3>
              <p className="text-sm muted mt-1">
                osqueryi is an interactive SQL shell for ad hoc questions; osqueryd is the daemon
                that runs scheduled queries and reports changes for continuous monitoring.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is osquery free?</h3>
              <p className="text-sm muted mt-1">
                Yes, it is free and open source under the Linux Foundation. A fleet manager such as
                Fleet is often added to distribute queries and collect logs at scale.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">From inventory to vulnerability findings</h3>
          <p className="text-sm muted leading-relaxed">
            osquery tells you what is installed. ScanRook tells you whether it is vulnerable &mdash;
            scanning container images, source, and binaries against OSV, NVD, and vendor advisory
            data, with severity, exploit signals, and a full SBOM for every artifact.
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
              Falco: Runtime Security vs Image Scanning
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              Installed-State Scanning vs. Advisory Matching
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-image-scanning-guide" className="underline">
              Container Image Scanning
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
