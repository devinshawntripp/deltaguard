import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-03";

const title = `Sigma Rules: Detection as Code for Any SIEM | ${APP_NAME}`;
const description =
  "How Sigma rules work: the YAML structure, logsource and detection blocks, field modifiers, converting rules to SIEM queries with sigma-cli, and tuning for false positives.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "sigma rules",
    "sigma rule format",
    "sigma detection rules",
    "sigma vs yara",
    "sigma-cli",
    "pysigma",
    "sigmahq",
    "siem detection as code",
    "sigma logsource",
    "detection engineering",
  ],
  alternates: { canonical: "/blog/sigma-rules" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/sigma-rules",
    images: ["/blog/sigma-rules.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/sigma-rules.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Sigma Rules: Detection as Code for Any SIEM",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/sigma-rules",
  image: "https://scanrook.io/blog/sigma-rules.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are Sigma rules?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sigma rules are a vendor-neutral YAML format for describing detections over log data. A rule states which log source it applies to and which field values must be present, and a converter translates that abstract description into the query language of a specific SIEM. The goal is that a detection can be written once and shared across tools rather than rewritten per platform.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between Sigma and YARA rules?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They operate on different data. YARA matches byte patterns inside files and process memory, so it answers whether an artifact looks malicious. Sigma matches field values inside log events, so it answers whether recorded behaviour looks malicious. Many investigations use both: YARA on the artifact recovered from a host, Sigma on the telemetry describing what that host did.",
      },
    },
    {
      "@type": "Question",
      name: "How do you convert a Sigma rule to a SIEM query?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use sigma-cli, the command-line front end for the pySigma library. Install a backend plugin for your target platform, then run sigma convert with a target and usually a processing pipeline that maps Sigma's generic field names onto the field names your log shipper actually produces. The pipeline is what makes the output correct for your environment.",
      },
    },
    {
      "@type": "Question",
      name: "What is a Sigma processing pipeline?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A pipeline is a set of transformations applied to a rule during conversion. It renames fields, adds index or source conditions, and drops rules that cannot apply to the target. Sigma rules use generic field names, but real deployments have their own schemas, so the pipeline bridges the gap between the abstract rule and one particular logging setup.",
      },
    },
    {
      "@type": "Question",
      name: "Where do I get Sigma rules?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SigmaHQ maintains the main open rule repository, organised by log source and platform, with thousands of community-contributed detections covering Windows, Linux, cloud providers, network devices, and applications. Many vendors and CERTs also publish Sigma rules alongside threat reports, which is one reason the format spread so widely.",
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
            Sigma Rules: Detection as Code for Any SIEM
          </h1>
          <p className="text-sm muted">Published October 3, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Sigma rules solve a boring but expensive problem: every SIEM has its own query language,
            so a detection written for one platform is worthless on another. Sigma describes the
            detection abstractly in YAML and lets a converter emit the platform-specific query. Here
            is how the format is structured, how conversion actually works, and where it sits next to
            the other rule formats you are probably already running.
          </p>
        </header>

        <img
          src="/blog/sigma-rules.jpg"
          alt="Sigma rules detecting anomalous events in a stream of log data"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Sigma rules are</h2>
          <p className="text-sm muted">
            Sigma is an open, vendor-neutral signature format for log data. The often-quoted framing
            is that Sigma is to log files what{" "}
            <Link href="/blog/yara-rules" className="underline">YARA</Link> is to files and Snort was
            to network traffic &mdash; a shared way to write down a detection so it can be published,
            reviewed, and reused rather than trapped in one product&apos;s console.
          </p>
          <p className="text-sm muted">
            A rule never contains a query. It contains a <em>description</em> of a query: which log
            source it applies to, which fields must hold which values, and how those conditions
            combine. A converter then renders that into Splunk SPL, Elastic Query DSL or ES|QL,
            Microsoft Sentinel KQL, or whatever else your environment speaks. Write once, deploy
            across whatever you happen to run &mdash; and, just as importantly, migrate without
            rewriting your entire detection library.
          </p>
          <figure className="grid gap-2">
            <div className="overflow-x-auto surface-card p-4">
              <svg
                viewBox="0 0 700 230"
                role="img"
                aria-label="A single Sigma rule in YAML passes through a processing pipeline and backend converter, producing platform-specific queries for several different SIEM products"
                className="w-full"
                style={{ minWidth: 560 }}
              >
                <defs>
                  <marker id="sg-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                  </marker>
                </defs>

                <rect x={10} y={88} width={140} height={54} rx={8} fill="var(--dg-accent,#2563eb)" fillOpacity={0.12} stroke="currentColor" strokeOpacity={0.5} />
                <text x={80} y={111} textAnchor="middle" fontSize="13.5" fontWeight="600" fill="currentColor">Sigma rule</text>
                <text x={80} y={129} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>one YAML file</text>

                <line x1={152} y1={115} x2={212} y2={115} stroke="currentColor" strokeWidth={2} markerEnd="url(#sg-arrow)" />

                <rect x={220} y={80} width={150} height={70} rx={8} fill="currentColor" fillOpacity={0.06} stroke="currentColor" strokeOpacity={0.45} />
                <text x={295} y={105} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="currentColor">pipeline</text>
                <text x={295} y={122} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.6}>field mapping,</text>
                <text x={295} y={136} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.6}>index selection</text>

                {[
                  { y: 12, label: "SIEM query language A" },
                  { y: 62, label: "SIEM query language B" },
                  { y: 112, label: "SIEM query language C" },
                  { y: 162, label: "Log platform D" },
                ].map((t) => (
                  <g key={t.label}>
                    <line x1={372} y1={115} x2={468} y2={t.y + 21} stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.45} markerEnd="url(#sg-arrow)" />
                    <rect x={476} y={t.y} width={212} height={42} rx={7} fill="transparent" stroke="currentColor" strokeOpacity={0.4} />
                    <text x={582} y={t.y + 26} textAnchor="middle" fontSize="11.5" fill="currentColor" fillOpacity={0.85}>{t.label}</text>
                  </g>
                ))}

                <text x={10} y={175} fontSize="10" fill="currentColor" fillOpacity={0.55}>The rule stays</text>
                <text x={10} y={189} fontSize="10" fill="currentColor" fillOpacity={0.55}>portable; the</text>
                <text x={10} y={203} fontSize="10" fill="currentColor" fillOpacity={0.55}>pipeline is local.</text>
              </svg>
            </div>
            <figcaption className="text-xs muted">
              One Sigma rule fans out into many platform queries. The processing pipeline is the part
              specific to your environment.
            </figcaption>
          </figure>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The structure of a Sigma rule</h2>
          <p className="text-sm muted">
            A rule is a single YAML document with a small set of well-defined keys. The two that
            carry the logic are <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">logsource</code>{" "}
            and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">detection</code>.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`title: Container Runtime Spawning a Shell From a Web Process
id: 4b1e1c2a-6f2d-4d1a-9c2e-2f7c9a4b8d31
status: experimental
description: >
  Detects a shell being started as a child of a web server process inside a
  container, a common post-exploitation step after a webshell drop.
references:
  - https://attack.mitre.org/techniques/T1059/004/
author: security@example.com
date: 2026-09-18
tags:
  - attack.execution
  - attack.t1059.004
logsource:
  product: linux
  category: process_creation
detection:
  selection_parent:
    ParentImage|endswith:
      - '/nginx'
      - '/httpd'
      - '/php-fpm'
  selection_shell:
    Image|endswith:
      - '/sh'
      - '/bash'
      - '/dash'
  filter_healthcheck:
    CommandLine|contains: '/healthcheck.sh'
  condition: selection_parent and selection_shell and not filter_healthcheck
falsepositives:
  - Container health checks or entrypoint scripts that legitimately shell out
level: high`}
          </pre>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>logsource</strong> narrows what the rule applies to using{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">product</code>,{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">category</code>, and{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">service</code>. The
              pipeline uses this to decide which index or table the query should target.
            </li>
            <li>
              <strong>detection</strong> holds named search identifiers plus a{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">condition</code>{" "}
              combining them. Within one identifier, separate keys are ANDed and list values are
              ORed &mdash; a rule of thumb worth memorising, because it is the source of most
              misread rules.
            </li>
            <li>
              <strong>falsepositives</strong> and <strong>level</strong> are not decoration. They are
              what a reviewer reads first, and they drive alert routing downstream.
            </li>
            <li>
              <strong>tags</strong> conventionally reference{" "}
              <Link href="/blog/mitre-attack" className="underline">MITRE ATT&amp;CK</Link> techniques,
              which is how coverage gets measured across a rule library.
            </li>
          </ul>
        </section>

        <img
          src="/blog/sigma-rules-2.jpg"
          alt="A single detection rule translated into multiple SIEM query languages"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Field modifiers and condition logic</h2>
          <p className="text-sm muted">
            Modifiers are appended to field names with a pipe and change how the value is matched.
            They are the expressive core of the format:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Modifier</th>
                  <th className="text-left py-2 font-semibold">Meaning</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><code>contains</code></td>
                  <td className="py-2 align-top">Substring match anywhere in the value</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><code>startswith</code> / <code>endswith</code></td>
                  <td className="py-2 align-top">Anchored prefix or suffix &mdash; the safest way to match a binary path</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><code>re</code></td>
                  <td className="py-2 align-top">Regular expression; powerful, slower, and not portable across every backend</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><code>all</code></td>
                  <td className="py-2 align-top">Every listed value must match, converting the usual OR into an AND</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><code>base64offset|contains</code></td>
                  <td className="py-2 align-top">Matches a base64-encoded string at any of its three byte alignments</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top"><code>cidr</code></td>
                  <td className="py-2 align-top">Treats the value as a network range rather than a literal address</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">condition</code> field
            has its own small grammar: boolean operators, wildcards over identifier names, and
            quantifiers. <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">selection and not filter</code>{" "}
            is the workhorse; <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">1 of selection_*</code>{" "}
            and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">all of them</code>{" "}
            let you group many named blocks without writing out a long expression.
          </p>
          <p className="text-sm muted">
            Newer versions of the specification also define <em>correlation</em> rules, which express
            things a single-event rule cannot &mdash; event counts over a time window, distinct value
            counts, and temporal sequences of several base rules firing together. That closes a real
            gap: brute-force and beaconing patterns are defined by frequency, not by any one event.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Converting rules with sigma-cli</h2>
          <p className="text-sm muted">
            The reference toolchain is <strong>pySigma</strong> as a library and{" "}
            <strong>sigma-cli</strong> as the command line front end. Backends and pipelines ship as
            plugins, so the first step is usually installing the one for your platform:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`pip install sigma-cli

# see what backends and pipelines are available and installed
sigma plugin list
sigma list targets
sigma list pipelines

# validate rules before converting them
sigma check rules/

# convert a directory of rules for one target, applying a pipeline
sigma convert \\
  --target <backend> \\
  --pipeline <pipeline-name> \\
  --format default \\
  rules/linux/process_creation/`}
          </pre>
          <p className="text-sm muted">
            The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">--pipeline</code> flag
            is where most of the real work lives, and where most first attempts go wrong. Sigma rules
            use generic field names such as{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">Image</code> and{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">CommandLine</code>. Your
            actual logs might call those{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">process.executable</code>{" "}
            and <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">process.command_line</code>,
            or something else entirely depending on your shipper. Without the right pipeline you get
            a syntactically valid query that silently matches nothing &mdash; the worst possible
            failure mode for a detection, because it looks like it is working.
          </p>
          <p className="text-sm muted">
            Some backends also emit a full ruleset object rather than a bare query, using an output
            format flag, which is how you get rules you can import directly rather than paste into a
            search bar. Check what your backend supports before hand-writing wrappers around the
            output.
          </p>
        </section>

        <img
          src="/blog/sigma-rules-3.jpg"
          alt="Security events correlating across log sources into a detection cluster"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Making Sigma rules survive contact with production</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Confirm the telemetry exists first.</strong> A process-creation rule is
              worthless if nothing on that host emits process-creation events. Coverage gaps in
              logging are far more common than gaps in rules.
            </li>
            <li>
              <strong>Filter with named blocks, not by weakening selections.</strong> Keep the
              malicious pattern intact and subtract known-good behaviour in a separate{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">filter_*</code>{" "}
              identifier. The rule then documents its own exceptions.
            </li>
            <li>
              <strong>Anchor path matches.</strong>{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">Image|endswith: &apos;/sh&apos;</code>{" "}
              is far safer than a bare <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">contains</code>,
              which will happily match unrelated paths.
            </li>
            <li>
              <strong>Version rules like code.</strong> They are code. Pull requests, review, and a
              backtest against historical data before merge; <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">sigma check</code>{" "}
              in CI catches structural mistakes for free.
            </li>
            <li>
              <strong>Treat imported rules as drafts.</strong> SigmaHQ is an excellent starting
              corpus, but rules were tuned elsewhere. Run new ones in a non-paging mode until you
              know their baseline rate in your environment &mdash; the same discipline that applies to{" "}
              <Link href="/blog/indicators-of-compromise" className="underline">
                third-party indicators of compromise
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Sigma next to the other rule formats</h2>
          <p className="text-sm muted">
            The formats people confuse with each other actually operate on entirely different data,
            and the clean way to hold them apart is by input:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Format</th>
                  <th className="text-left py-2 pr-4 font-semibold">Operates on</th>
                  <th className="text-left py-2 font-semibold">Answers</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Sigma</strong></td>
                  <td className="py-2 pr-4 align-top">Log events</td>
                  <td className="py-2 align-top">Did recorded behaviour look malicious?</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>YARA</strong></td>
                  <td className="py-2 pr-4 align-top">Files and memory</td>
                  <td className="py-2 align-top">Does this artifact match a known pattern?</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Falco rules</strong></td>
                  <td className="py-2 pr-4 align-top">Live syscalls</td>
                  <td className="py-2 align-top">Is a container doing something it should not, right now?</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top"><strong>Advisory matching</strong></td>
                  <td className="py-2 pr-4 align-top">Installed packages</td>
                  <td className="py-2 align-top">Is known-vulnerable software present?</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            In practice these stack. <Link href="/blog/falco-runtime-security-explained" className="underline">Falco</Link>{" "}
            watches syscalls at runtime and can feed its output into a log pipeline where Sigma rules
            then run;{" "}
            <Link href="/blog/wazuh" className="underline">Wazuh</Link> and similar platforms consume
            Sigma content directly. None of them tell you what is installed, which is the last row of
            that table and a different job entirely.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Sigma for containers and cloud logs</h2>
          <p className="text-sm muted">
            The format grew up around Windows event logs, and a lot of the public corpus still
            reflects that. But the log source taxonomy covers considerably more ground, and the parts
            relevant to container platforms are where most of the recent community work has gone.
          </p>
          <p className="text-sm muted">
            For Linux and containers, the useful categories are process creation, file events,
            network connections, and audit records &mdash; the same telemetry that runtime security
            agents produce. If you already ship syscall-derived events into a log platform, you have
            the inputs for a meaningful Sigma ruleset without adding anything new. Typical detections
            in this space are the ones you would expect: a package manager running inside a
            production container, a shell spawned from a service process, an outbound connection from
            a workload that should only ever accept traffic, a write to a path that ought to be
            read-only.
          </p>
          <p className="text-sm muted">
            Cloud control-plane logs are the other high-value source, and arguably the higher-value
            one. Categories exist for the major providers&apos; audit trails, covering identity
            changes, key material access, storage permission modifications, and logging being
            disabled &mdash; that last one being the classic early move in a cloud intrusion. These
            rules tend to age well because the API surfaces they describe change slowly, and they are
            portable in a way that host rules often are not.
          </p>
          <p className="text-sm muted">
            One structural caution. Kubernetes audit events and container runtime events are nested
            JSON, and the flattening your log shipper applies determines what field names a rule must
            reference. Two clusters shipping the same events through different collectors can require
            different pipelines for the identical rule. Write the pipeline once, keep it in version
            control next to the rules, and test conversion output against real recorded events rather
            than assuming the mapping is right.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            We are the bottom row. ScanRook does not write detections and does not consume your logs;
            it opens a container image tarball, binary, or source archive and tells you which
            known-vulnerable components are inside, matching every package against OSV, NVD, and Red
            Hat OVAL with the source and confidence of each finding attached.
          </p>
          <p className="text-sm muted">
            That is genuinely complementary to detection engineering rather than competitive with it.
            Sigma rules tell you when something is happening; a vulnerability scan tells you which
            doors were left open in the first place, and it does so before the image ships rather
            than after. Teams that do both well tend to feed one into the other &mdash; knowing that a
            given service runs a vulnerable library is exactly the context that turns an ambiguous
            alert into a prioritised one. Our{" "}
            <Link href="/blog/container-runtime-security" className="underline">
              container runtime security
            </Link>{" "}
            guide covers the detection side, and{" "}
            <Link href="/blog/how-to-triage-vulnerability-scan-results" className="underline">
              triaging scan results
            </Link>{" "}
            covers the other.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What are Sigma rules?</h3>
              <p className="text-sm muted mt-1">
                A vendor-neutral YAML format describing detections over log data, converted into
                platform-specific queries by a backend.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Sigma or YARA?</h3>
              <p className="text-sm muted mt-1">
                Different inputs. YARA matches bytes in files; Sigma matches fields in log events.
                Most investigations end up using both.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I convert a rule?</h3>
              <p className="text-sm muted mt-1">
                Install <code>sigma-cli</code> plus a backend plugin, then run{" "}
                <code>sigma convert</code> with a target and the pipeline that maps fields to your
                schema.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why does my converted rule match nothing?</h3>
              <p className="text-sm muted mt-1">
                Almost always a missing or wrong pipeline. Generic Sigma field names must be mapped
                onto the field names your log shipper actually emits.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Know what is in the image before you detect against it</h3>
          <p className="text-sm muted leading-relaxed">
            Detection tells you when something happens. ScanRook tells you what known-vulnerable
            components were shipped in the first place &mdash; every package matched against OSV,
            NVD, and Red Hat OVAL, with the source of each finding shown.
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
            <Link href="/blog/yara-rules" className="underline">
              YARA Rules: How to Write Ones That Work
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/mitre-attack" className="underline">
              MITRE ATT&amp;CK Explained
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/falco-runtime-security-explained" className="underline">
              Falco Runtime Security Explained
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
