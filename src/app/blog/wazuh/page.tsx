import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-28";

const title = `Wazuh: Open-Source XDR and SIEM, Explained | ${APP_NAME}`;
const description =
  "Wazuh is a free, open-source XDR and SIEM platform built on agents. Its components, vulnerability detection, compliance mapping, and where ScanRook fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "wazuh",
    "wazuh siem",
    "wazuh xdr",
    "what is wazuh",
    "wazuh agent",
    "wazuh vulnerability detection",
    "wazuh file integrity monitoring",
    "wazuh vs ossec",
    "open source siem",
    "wazuh security monitoring",
  ],
  alternates: { canonical: "/blog/wazuh" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/wazuh",
    images: ["/blog/wazuh.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/wazuh.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Wazuh: Open-Source XDR and SIEM, Explained",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/wazuh",
  image: "https://scanrook.io/blog/wazuh.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Wazuh?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Wazuh is a free, open-source security platform that unifies XDR (extended detection and response) and SIEM (security information and event management) capabilities. It collects telemetry from agents installed on endpoints, analyzes it against decoders and rules on a central server, and stores and visualizes the results. Wazuh grew out of the OSSEC host-based intrusion detection project.",
      },
    },
    {
      "@type": "Question",
      name: "What are the main components of Wazuh?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Wazuh has four main parts: the Wazuh agent that runs on monitored endpoints (Linux, Windows, macOS, and containers), the Wazuh server that decodes and analyzes events against rules, the Wazuh indexer (an OpenSearch-based store for search and correlation), and the Wazuh dashboard for visualization and management. Network devices can be monitored agentlessly via syslog.",
      },
    },
    {
      "@type": "Question",
      name: "Does Wazuh do vulnerability scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, in a specific sense. The Wazuh agent inventories installed packages on each running host and the server correlates that inventory against CVE feeds it maintains from sources like Canonical, Debian, Red Hat, and the NVD. This detects known-vulnerable packages on live systems. It is runtime, agent-based detection rather than scanning an image artifact before deployment.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between Wazuh and OSSEC?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Wazuh began as a fork of OSSEC, the long-standing open-source host-based intrusion detection system. It extended OSSEC with a richer ruleset, a REST API, the OpenSearch-based indexer and dashboard, compliance mappings, vulnerability detection, and cloud and container monitoring. OSSEC remains a focused HIDS; Wazuh is a broader XDR and SIEM platform.",
      },
    },
    {
      "@type": "Question",
      name: "How does ScanRook complement Wazuh?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Wazuh watches running hosts at runtime; ScanRook scans the image artifact before it ships. Running ScanRook in CI catches vulnerable packages while they are still cheap to fix, and Wazuh then monitors what actually runs in production. They cover different points in the lifecycle — build-time artifact scanning versus runtime endpoint detection — and work well together.",
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
            Wazuh: Open-Source XDR and SIEM, Explained
          </h1>
          <p className="text-sm muted">Published September 28, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Wazuh is one of the most widely deployed open-source security platforms, and it covers a
            lot of ground: log analysis, intrusion detection, file integrity monitoring, vulnerability
            detection, and compliance reporting, all from agents on your endpoints. If you are trying
            to place it in your stack &mdash; and figure out where image scanning fits alongside it
            &mdash; this guide explains what Wazuh is, how it is built, and where its
            vulnerability detection stops and build-time scanning begins.
          </p>
        </header>

        <img
          src="/blog/wazuh.jpg"
          alt="Wazuh open-source XDR and SIEM explained"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Wazuh is</h2>
          <p className="text-sm muted">
            Wazuh is a free, open-source security platform that unifies <strong>XDR</strong>{" "}
            (extended detection and response) and <strong>SIEM</strong> (security information and
            event management) in one system. In plain terms: it collects security telemetry from
            across your fleet, analyzes it centrally against a large ruleset, and surfaces alerts,
            dashboards, and compliance reports. It is released under an open-source license and can be
            self-hosted at no license cost, which is a big part of why it is so widely adopted.
          </p>
          <p className="text-sm muted">
            Wazuh grew out of <strong>OSSEC</strong>, the veteran open-source host-based intrusion
            detection system, and you can still see those roots in its agent-first design. Over the
            years it added a modern REST API, an OpenSearch-based data store, a web dashboard,
            regulatory compliance mappings, vulnerability detection, and cloud and container
            monitoring &mdash; growing from a focused HIDS into a full detection platform.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How Wazuh is put together</h2>
          <p className="text-sm muted">
            Wazuh is agent-based: lightweight agents on your endpoints ship data to a central server,
            which analyzes it and hands results to an indexer and dashboard. The four components form
            a clean pipeline:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 720 170"
              role="img"
              aria-label="Wazuh architecture: agents on endpoints send events to the Wazuh server, which analyzes them and stores results in the Wazuh indexer, visualized in the Wazuh dashboard"
              className="w-full"
              style={{ minWidth: 580 }}
            >
              <defs>
                <marker id="wz-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              {[
                { x: 8, label: "Agents", sub: "Linux · Win · macOS" },
                { x: 190, label: "Server", sub: "decoders + rules", hot: true },
                { x: 372, label: "Indexer", sub: "OpenSearch store" },
                { x: 554, label: "Dashboard", sub: "alerts + reports" },
              ].map((b) => (
                <g key={b.label}>
                  <rect
                    x={b.x}
                    y={40}
                    width={150}
                    height={56}
                    rx={8}
                    fill={b.hot ? "var(--dg-accent,#2563eb)" : "transparent"}
                    fillOpacity={b.hot ? 0.12 : 1}
                    stroke="currentColor"
                    strokeOpacity={0.5}
                  />
                  <text x={b.x + 75} y={64} textAnchor="middle" fontSize="14" fontWeight="600" fill="currentColor">
                    {b.label}
                  </text>
                  <text x={b.x + 75} y={83} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>
                    {b.sub}
                  </text>
                </g>
              ))}
              {[158, 340, 522].map((x) => (
                <line key={x} x1={x} y1={68} x2={x + 26} y2={68} stroke="currentColor" strokeWidth={2} markerEnd="url(#wz-arrow)" />
              ))}
              <text x={83} y={122} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>endpoints</text>
              <text x={360} y={140} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>
                agentless devices report to the server via syslog
              </text>
            </svg>
          </div>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li><strong>Wazuh agent</strong> &mdash; runs on Linux, Windows, macOS, and containers, collecting logs, file changes, inventory, and configuration data.</li>
            <li><strong>Wazuh server</strong> &mdash; decodes and analyzes events against rules, correlates them, and triggers alerts and active responses.</li>
            <li><strong>Wazuh indexer</strong> &mdash; an OpenSearch-based store that makes months of security data searchable and correlatable.</li>
            <li><strong>Wazuh dashboard</strong> &mdash; the web interface for alerts, compliance reports, and fleet management.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Wazuh actually detects</h2>
          <p className="text-sm muted">
            The breadth is the point. A single Wazuh deployment typically covers:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li><strong>Log data analysis (SIEM).</strong> Collect and normalize logs from hosts, applications, and network devices, then alert on suspicious patterns.</li>
            <li><strong>File integrity monitoring (FIM).</strong> Watch critical files and directories for unexpected changes &mdash; a classic requirement in many compliance regimes.</li>
            <li><strong>Intrusion detection.</strong> From its OSSEC lineage: rootkit checks, anomaly detection, and rule-based host intrusion detection.</li>
            <li><strong>Vulnerability detection.</strong> Correlate each agent&apos;s package inventory against CVE feeds to flag known-vulnerable software on running hosts.</li>
            <li><strong>Security configuration assessment (SCA).</strong> Check systems against hardening policies, including CIS-Benchmark-style checks.</li>
            <li><strong>Threat response.</strong> Active response actions, MITRE ATT&amp;CK mapping, and integrations with threat intelligence and malware-detection tools such as VirusTotal and YARA.</li>
          </ul>
          <p className="text-sm muted">
            It also maps its rules to regulatory frameworks &mdash; PCI DSS, HIPAA, NIST 800-53, GDPR
            &mdash; so the same telemetry can back a compliance report. Its configuration assessment
            overlaps with the ground covered in{" "}
            <Link href="/blog/cis-benchmarks-explained" className="underline">
              CIS Benchmarks explained
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Wazuh&apos;s vulnerability detection, precisely</h2>
          <p className="text-sm muted">
            Because &ldquo;Wazuh does vulnerability scanning&rdquo; is easy to misread, it is worth
            being exact. The Wazuh agent builds a <em>software inventory</em> of the packages
            installed on the host it runs on. The server keeps a vulnerability database assembled from
            vendor and public feeds &mdash; Canonical for Ubuntu, Debian, Red Hat, the NVD, and others
            &mdash; and correlates the inventory against it, raising an alert when an installed package
            version is known to be affected by a CVE.
          </p>
          <p className="text-sm muted">
            That is genuinely useful, and it is <em>runtime</em> detection: it tells you what is
            vulnerable on machines that are already running. It is a different job from scanning an
            image artifact in your build pipeline, before anything is deployed. This is the same
            build-time versus runtime distinction we draw for{" "}
            <Link href="/blog/falco-runtime-security-explained" className="underline">
              Falco
            </Link>
            , and it is the key to understanding where a scanner belongs alongside Wazuh. If you are
            new to the category itself,{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              software composition analysis
            </Link>{" "}
            covers how component-to-CVE matching works.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Running Wazuh: what to expect</h2>
          <p className="text-sm muted">
            Wazuh can run single-node for a lab or small fleet, or as a distributed cluster for
            production. The indexer is the resource-hungry part &mdash; it is an OpenSearch store, so
            plan for memory and disk accordingly. Agents are lightweight and enroll against the
            server; you can push policies and manage them centrally from the dashboard. For cloud and
            containers, Wazuh ships integrations for AWS, GCP, and Azure, a Docker listener, and
            Kubernetes audit-log ingestion, so container <em>runtime</em> activity flows into the same
            pipeline as everything else.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits alongside Wazuh</h2>
          <p className="text-sm muted">
            These tools are complementary, not competitive, because they act at different points in
            the lifecycle. Wazuh is a runtime platform: agents on running hosts detect intrusions,
            watch files, and flag vulnerable packages on machines already in production. ScanRook is a
            build-time scanner: it analyzes the container image, binary, or source archive before it
            ever runs, so a vulnerable dependency is caught while it is still cheap to fix &mdash; in
            CI, by the engineer who introduced it. The practical pattern is to scan the artifact with
            ScanRook on every build, covered in the{" "}
            <Link href="/blog/container-image-scanning-guide" className="underline">
              container image scanning guide
            </Link>
            , and let Wazuh monitor what actually runs.
          </p>
          <p className="text-sm muted">
            ScanRook does not try to be a SIEM or an XDR, and it will not replace Wazuh&apos;s runtime
            visibility; it has no agents watching live hosts. What it adds is depth at the build stage:
            it matches every package against OSV, NVD, and Red Hat OVAL in parallel and reads the real
            package databases inside the image, so findings reflect what is actually installed. Catch
            more before deployment, and Wazuh has fewer surprises to catch after it. The two share DNA
            &mdash; both use YARA, both map to compliance frameworks &mdash; but they cover different
            halves of the same problem.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is Wazuh?</h3>
              <p className="text-sm muted mt-1">
                A free, open-source platform that unifies XDR and SIEM. It collects telemetry from
                agents, analyzes it centrally, and surfaces alerts, dashboards, and compliance
                reports. It evolved from OSSEC.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What are its components?</h3>
              <p className="text-sm muted mt-1">
                The agent (on endpoints), the server (decoders and rules), the indexer (OpenSearch
                store), and the dashboard (visualization). Network devices report agentlessly via
                syslog.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does Wazuh scan for vulnerabilities?</h3>
              <p className="text-sm muted mt-1">
                Yes, at runtime: it correlates each host&apos;s package inventory against CVE feeds to
                flag vulnerable software on live systems &mdash; distinct from scanning an image before
                deployment.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Wazuh vs OSSEC?</h3>
              <p className="text-sm muted mt-1">
                Wazuh forked OSSEC and extended it with a richer ruleset, REST API, indexer and
                dashboard, compliance mappings, and vulnerability and cloud monitoring.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Catch it before it runs</h3>
          <p className="text-sm muted leading-relaxed">
            Wazuh watches production; ScanRook scans the artifact before it gets there. Run ScanRook in
            CI to find vulnerable packages while they are still cheap to fix &mdash; every finding
            tagged by source and confidence, matched across OSV, NVD, and Red Hat OVAL.
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
              Falco: Runtime Security Explained
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-image-scanning-guide" className="underline">
              Container Image Scanning Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/cis-benchmarks-explained" className="underline">
              CIS Benchmarks Explained
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
