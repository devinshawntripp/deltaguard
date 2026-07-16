import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-22";

const title = `Indicators of Compromise (IOCs): Types, Examples, and Use | ${APP_NAME}`;
const description =
  "Indicators of compromise (IOCs) are forensic clues a system was breached. The main types, real examples, IOCs vs IOAs, and how they fit detection.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "indicators of compromise",
    "ioc security",
    "what is an ioc",
    "ioc examples",
    "ioc vs ioa",
    "indicators of attack",
    "pyramid of pain",
    "threat intelligence indicators",
    "ioc types",
    "compromise detection",
  ],
  alternates: { canonical: "/blog/indicators-of-compromise" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/indicators-of-compromise",
    images: ["/blog/indicators-of-compromise.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/indicators-of-compromise.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Indicators of Compromise (IOCs): Types, Examples, and Use",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/indicators-of-compromise",
  image: "https://scanrook.io/blog/indicators-of-compromise.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is an indicator of compromise (IOC)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An indicator of compromise is a piece of forensic evidence that suggests a system or network has been breached. Common IOCs include malware file hashes, malicious IP addresses and domains, suspicious registry keys, and unusual account behavior. Security teams collect IOCs from tools and threat-intelligence feeds and match them against their environment to detect intrusions.",
      },
    },
    {
      "@type": "Question",
      name: "What are the main types of IOCs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "IOCs are usually grouped as network-based (malicious IPs, domains, URLs, C2 traffic), host-based (file hashes, file paths, registry keys, mutexes, rogue processes), and behavioral (privilege escalation, impossible-travel logins, large data egress, log tampering). Email indicators such as phishing sender addresses and attachment hashes are a common fourth category.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between an IOC and an IOA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An indicator of compromise is evidence that an attack has already happened — an artifact left behind, such as a known-bad hash. An indicator of attack (IOA) focuses on behavior and intent as an attack unfolds, such as a process spawning a shell and reaching out to the internet. IOCs are reactive and artifact-based; IOAs are proactive and behavior-based, and the two are used together.",
      },
    },
    {
      "@type": "Question",
      name: "What is the Pyramid of Pain?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Pyramid of Pain, introduced by David Bianco, ranks IOC types by how much difficulty detecting them causes an attacker. Hash values sit at the bottom (trivial to change), followed by IP addresses, domain names, host and network artifacts, tools, and finally TTPs at the top — the hardest for an adversary to change. Detecting higher-pyramid indicators disrupts attackers far more than blocking a single hash.",
      },
    },
    {
      "@type": "Question",
      name: "How does vulnerability scanning relate to IOCs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "IOC detection is largely reactive — it tells you a breach has likely occurred. Vulnerability scanning is preventive: it finds the weaknesses attackers exploit to create those IOCs in the first place. Scanning a container image before deployment closes openings and can flag known-malicious files, reducing the number of intrusions your runtime IOC monitoring has to catch.",
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
          <div className="text-xs uppercase tracking-wide muted">Security Concepts</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Indicators of Compromise (IOCs): Types, Examples, and Use
          </h1>
          <p className="text-sm muted">Published September 22, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            An indicator of compromise is a clue that someone got in. Investigators have used the
            idea for decades: after an incident, you collect the artifacts an intruder left behind
            &mdash; a file hash, a callback domain, a strange registry key &mdash; and use them to
            find every other machine touched by the same attack. This is a plain-English guide to
            what IOCs are, the types you will encounter, how they differ from indicators of attack,
            and the honest limits of relying on them.
          </p>
        </header>

        <img
          src="/blog/indicators-of-compromise.jpg"
          alt="Indicators of compromise explained"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What an IOC is</h2>
          <p className="text-sm muted">
            An indicator of compromise (IOC) is a piece of forensic evidence, observed on a host or
            network, that indicates with reasonable confidence that a security breach has occurred.
            The keyword is <em>evidence</em>: an IOC is something you can observe and match &mdash; a
            value, a pattern, a behavior &mdash; not a vulnerability or a guess. A vulnerability is a
            weakness that <em>could</em> be exploited; an IOC is a sign that something <em>was</em>.
            The two are related but distinct, and it is worth keeping them separate. If you want the
            precise definition of the former, see{" "}
            <Link href="/blog/what-is-a-vulnerability" className="underline">
              what a vulnerability is
            </Link>
            .
          </p>
          <p className="text-sm muted">
            IOCs are the shared currency of threat intelligence. When a vendor publishes a report on
            a malware family, the useful, machine-actionable part is usually a list of IOCs:
            hashes of the samples, the domains and IP addresses they contact, the file paths they
            drop. Defenders ingest those lists into their tooling and check whether any of them show
            up in their own environment.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The main types of IOC</h2>
          <p className="text-sm muted">
            IOCs are commonly grouped by where you observe them:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Network indicators.</strong> Malicious IP addresses, domains, and URLs;
              command-and-control (C2) callbacks; beaconing at regular intervals; DNS requests to
              newly registered or algorithmically generated domains; traffic on unexpected ports or
              to unusual geographies.
            </li>
            <li>
              <strong>Host indicators.</strong> Cryptographic hashes (MD5, SHA-1, SHA-256) of known
              malware; suspicious file names and paths; Windows registry keys used for persistence;
              mutexes a malware family creates; unexpected running processes, services, scheduled
              tasks, or drivers.
            </li>
            <li>
              <strong>File indicators.</strong> A malware sample&apos;s hash is the simplest form,
              but content-based patterns &mdash; byte sequences, strings, or structural signatures
              expressed as YARA rules &mdash; catch variants a single hash misses.
            </li>
            <li>
              <strong>Behavioral and account indicators.</strong> Privilege escalation, logins at
              impossible times or from impossible locations (&ldquo;impossible travel&rdquo;), spikes
              in failed authentication, large or unusual outbound data transfers, and cleared or
              tampered logs.
            </li>
            <li>
              <strong>Email indicators.</strong> Phishing sender addresses, recurring subject lines,
              and the hashes of malicious attachments &mdash; often the first artifact in an
              intrusion chain.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">IOCs vs indicators of attack</h2>
          <p className="text-sm muted">
            An IOC is backward-looking. It describes an artifact from an attack that already
            happened: this hash is malware, this domain is a C2 server. An <strong>indicator of
            attack (IOA)</strong> is forward-looking &mdash; it describes behavior and intent as an
            attack unfolds, regardless of the specific tools used. &ldquo;A document opened a
            PowerShell process that downloaded and executed a payload&rdquo; is an IOA; it stays true
            even when the attacker swaps out the payload and its hash.
          </p>
          <p className="text-sm muted">
            The distinction matters because attackers change their atomic artifacts cheaply. Recompile
            the malware and every hash changes; rotate the infrastructure and every IP changes. IOAs,
            which key on behavior and technique, survive that churn. Mature detection programs use
            both: IOCs for fast, precise matching against known-bad, and IOAs (often expressed
            against the MITRE ATT&amp;CK catalog of techniques) for catching novel variants.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The Pyramid of Pain</h2>
          <p className="text-sm muted">
            David Bianco&apos;s Pyramid of Pain is the standard mental model for how much any given
            indicator is worth. It ranks indicator types by how much <em>pain</em> you cause an
            attacker when you can reliably detect them. At the bottom, hash values are trivial for an
            attacker to change; at the top, tactics, techniques, and procedures (TTPs) describe how
            an adversary operates and are genuinely hard to alter:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 640 250"
              role="img"
              aria-label="The Pyramid of Pain: from bottom to top, hash values, IP addresses, domain names, network and host artifacts, tools, and TTPs, with attacker pain increasing toward the top"
              className="w-full"
              style={{ minWidth: 520 }}
            >
              {[
                { label: "TTPs", note: "tough", w: 150 },
                { label: "Tools", note: "challenging", w: 220 },
                { label: "Network / Host Artifacts", note: "annoying", w: 300 },
                { label: "Domain Names", note: "simple", w: 380 },
                { label: "IP Addresses", note: "easy", w: 460 },
                { label: "Hash Values", note: "trivial", w: 540 },
              ].map((row, i) => {
                const y = 10 + i * 36;
                const x = 320 - row.w / 2;
                const hot = i === 0;
                return (
                  <g key={row.label}>
                    <rect
                      x={x}
                      y={y}
                      width={row.w}
                      height={30}
                      rx={4}
                      fill="var(--dg-accent,#2563eb)"
                      fillOpacity={0.05 + (5 - i) * 0.035}
                      stroke="currentColor"
                      strokeOpacity={hot ? 0.7 : 0.3}
                    />
                    <text x={320} y={y + 20} textAnchor="middle" fontSize="13" fontWeight={hot ? "700" : "600"} fill="currentColor">
                      {row.label}
                    </text>
                    <text x={x + row.w + 8} y={y + 20} fontSize="11" fill="currentColor" fillOpacity={0.6}>
                      {row.note}
                    </text>
                  </g>
                );
              })}
              <text x={12} y={30} fontSize="11" fill="currentColor" fillOpacity={0.6}>more pain</text>
              <text x={12} y={232} fontSize="11" fill="currentColor" fillOpacity={0.6}>less pain</text>
            </svg>
          </div>
          <p className="text-sm muted">
            The practical lesson is not that low-pyramid indicators are useless &mdash; blocking a
            known-bad hash is cheap and instant &mdash; but that a detection program built only on
            hashes and IPs is fragile. Investing in higher-pyramid detection (behaviors and TTPs)
            forces attackers to change how they operate, which is expensive for them.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How IOCs get shared and used</h2>
          <p className="text-sm muted">
            IOCs travel between organizations in standard formats so tools can consume them
            automatically. <strong>STIX</strong> (Structured Threat Information eXpression) and its
            transport, <strong>TAXII</strong>, are the common wire format; <strong>MISP</strong> is a
            widely used open-source platform for sharing indicators; and file-content indicators are
            frequently expressed as <strong>YARA</strong> rules, which we cover in{" "}
            <Link href="/blog/what-is-yara" className="underline">
              what YARA is and why security teams use it
            </Link>
            . Inside an environment, IOCs are matched by SIEMs, EDR agents, and intrusion-detection
            systems against logs and telemetry in real time.
          </p>
          <p className="text-sm muted">
            One durable caveat: IOCs decay. A C2 domain gets taken down, an attacker rotates
            infrastructure, a sample is recompiled &mdash; and the indicator that was high-value last
            week is dead weight today. Feeds need aging and confidence scoring, and matching on stale
            indicators produces false positives. This is also why runtime, behavior-based detection
            &mdash; tools like{" "}
            <Link href="/blog/falco-runtime-security-explained" className="underline">
              Falco
            </Link>{" "}
            watching syscalls &mdash; complements static IOC lists rather than being replaced by them.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where scanning fits: preventing the compromise</h2>
          <p className="text-sm muted">
            IOC detection is, by construction, reactive: an indicator of compromise means a
            compromise probably already happened. The cheapest incident is the one that never starts,
            and that is where vulnerability scanning lives &mdash; on the preventive side. Attackers
            need a way in, and unpatched CVEs in your images and dependencies are among the most
            common doors. A recently exploited vulnerability, like the ones tracked in the{" "}
            <Link href="/blog/cisa-kev-guide" className="underline">
              CISA KEV catalog
            </Link>
            , is exactly the kind of weakness that turns into an intrusion &mdash; and a set of IOCs
            &mdash; a few weeks later.
          </p>
          <p className="text-sm muted">
            ScanRook is not an EDR, a SIEM, or a threat-intelligence platform, and it does not pretend
            to be one; it does not hunt for IOCs on running hosts. What it does is scan the artifact
            before it ships: it finds the known-vulnerable packages an attacker would target, and its
            YARA-based deep scanning can flag known-malicious file patterns inside an image before it
            ever reaches production. Reducing the vulnerable surface shrinks the number of intrusions
            your runtime IOC monitoring has to catch in the first place. Prevention and detection are
            different jobs; a scanner in the build pipeline handles the former so your IOC tooling has
            less to do.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is an IOC?</h3>
              <p className="text-sm muted mt-1">
                Forensic evidence &mdash; a hash, a malicious domain, a suspicious registry key
                &mdash; that indicates a system has likely been breached and can be matched across an
                environment.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What are the main IOC types?</h3>
              <p className="text-sm muted mt-1">
                Network (IPs, domains, C2), host (hashes, registry keys, processes), file (hashes and
                YARA patterns), and behavioral or account anomalies such as impossible-travel logins.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">IOC vs IOA?</h3>
              <p className="text-sm muted mt-1">
                An IOC is a backward-looking artifact from an attack that happened; an IOA is
                forward-looking behavior and intent that stays true even when the attacker swaps
                tools.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why do IOCs go stale?</h3>
              <p className="text-sm muted mt-1">
                Attackers rotate infrastructure and recompile malware cheaply, so hashes and IPs
                change constantly. Feeds need aging and confidence scoring to stay useful.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Close the doors before they are used</h3>
          <p className="text-sm muted leading-relaxed">
            IOC monitoring catches intrusions after they start. ScanRook works the other end: it
            scans your images for the known-vulnerable packages attackers exploit, so there are fewer
            openings to begin with &mdash; every finding tagged by source and confidence.
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
            <Link href="/blog/what-is-a-vulnerability" className="underline">
              What Is a Vulnerability?
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-yara" className="underline">
              What Is YARA?
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/falco-runtime-security-explained" className="underline">
              Falco: Runtime Security Explained
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
