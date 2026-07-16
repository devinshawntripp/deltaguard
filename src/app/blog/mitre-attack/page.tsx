import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-02";

const title = `MITRE ATT&CK Explained: The Adversary Tactics Framework | ${APP_NAME}`;
const description =
  "MITRE ATT&CK is a knowledge base of real-world adversary tactics and techniques. What the matrix contains, how teams use it, and how it maps to CVEs you scan.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "mitre att&ck",
    "what is mitre att&ck",
    "mitre attack framework",
    "att&ck matrix",
    "att&ck tactics and techniques",
    "mitre att&ck explained",
    "enterprise att&ck",
    "threat intelligence framework",
    "detection engineering",
    "att&ck techniques",
  ],
  alternates: { canonical: "/blog/mitre-attack" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/mitre-attack",
    images: ["/blog/mitre-attack.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/mitre-attack.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "MITRE ATT&CK Explained: The Adversary Tactics Framework",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/mitre-attack",
  image: "https://scanrook.io/blog/mitre-attack.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is MITRE ATT&CK?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "MITRE ATT&CK is a free, globally accessible knowledge base of adversary tactics and techniques based on real-world observations. It is maintained by the non-profit MITRE Corporation and organizes how attackers behave into a matrix: tactics describe the goal of an action and techniques describe the specific way an adversary achieves it. Security teams use it as a common language for threats.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between a tactic and a technique?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A tactic is the adversary's objective at a point in an attack, such as Initial Access or Persistence. A technique is a specific method used to achieve that objective, such as Exploit Public-Facing Application (T1190) for Initial Access. Techniques can have sub-techniques that describe finer variations, and procedures document how a specific group implemented a technique.",
      },
    },
    {
      "@type": "Question",
      name: "How many tactics are in the Enterprise ATT&CK matrix?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Enterprise matrix has fourteen tactics, running from Reconnaissance and Resource Development through Initial Access, Execution, Persistence, and on to Exfiltration and Impact. They represent the phases of an intrusion, but they are not a strict sequence: a real attack may skip tactics, revisit them, or use several at once.",
      },
    },
    {
      "@type": "Question",
      name: "How does ATT&CK relate to CVEs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Many techniques are carried out by exploiting known vulnerabilities. Technique T1190, Exploit Public-Facing Application, is the classic mapping for a CVE in an internet-facing service. Patching and scanning for known CVEs directly reduces an adversary's options under initial-access and privilege-escalation tactics, so vulnerability management is a concrete way to shrink your ATT&CK coverage gaps.",
      },
    },
    {
      "@type": "Question",
      name: "Is MITRE ATT&CK the same as the Cyber Kill Chain?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The Lockheed Martin Cyber Kill Chain is a linear seven-stage model of an intrusion. ATT&CK is a much larger, non-linear catalog of hundreds of techniques mapped to tactics, grounded in observed adversary behavior. The kill chain is a high-level narrative; ATT&CK is a detailed reference you can map detections and gaps against.",
      },
    },
  ],
};

const tacticsLeft = [
  "Reconnaissance",
  "Resource Development",
  "Initial Access",
  "Execution",
  "Persistence",
  "Privilege Escalation",
  "Defense Evasion",
];
const tacticsRight = [
  "Credential Access",
  "Discovery",
  "Lateral Movement",
  "Collection",
  "Command and Control",
  "Exfiltration",
  "Impact",
];

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
            MITRE ATT&amp;CK Explained: The Adversary Tactics Framework
          </h1>
          <p className="text-sm muted">Published October 2, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            MITRE ATT&amp;CK is the closest thing the security industry has to a shared vocabulary for
            how attackers behave. If you have seen a report tag an intrusion with codes like T1190 or
            T1059, that is ATT&amp;CK. This guide explains what the framework is, how the matrix is
            structured, how teams put it to work, and how ordinary vulnerability scanning ties
            directly into it.
          </p>
        </header>

        <img
          src="/blog/mitre-attack.jpg"
          alt="The MITRE ATT&CK adversary tactics framework explained"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What ATT&amp;CK is</h2>
          <p className="text-sm muted">
            ATT&amp;CK stands for Adversarial Tactics, Techniques, and Common Knowledge. It is a
            free, openly published knowledge base curated by MITRE, a US non-profit that runs
            federally funded research centers. First released publicly in 2015, it catalogs how real
            adversaries have been observed to operate &mdash; not theoretical attacks, but behavior
            documented from actual incidents and threat intelligence.
          </p>
          <p className="text-sm muted">
            The value is that it gives everyone the same words. When a threat report, a detection
            rule, and a red-team exercise all reference the same technique ID, a defender can line
            them up without translating between vendors&apos; private terminology. ATT&amp;CK is
            published as several matrices: Enterprise (Windows, macOS, Linux, cloud, containers, and
            networks), Mobile, and ICS for industrial control systems.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Tactics, techniques, and procedures</h2>
          <p className="text-sm muted">
            The framework is built on three nested levels, often abbreviated TTPs:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Tactics</strong> are the &ldquo;why&rdquo; &mdash; the adversary&apos;s goal at
              a moment in the attack, such as Persistence or Exfiltration. They form the columns of
              the matrix.
            </li>
            <li>
              <strong>Techniques</strong> are the &ldquo;how&rdquo; &mdash; a specific way to achieve
              a tactic, each with an ID like T1059 (Command and Scripting Interpreter). Many
              techniques break down further into sub-techniques, such as T1059.001 for PowerShell.
            </li>
            <li>
              <strong>Procedures</strong> are the concrete implementations &mdash; exactly how a
              named threat group or piece of malware carried out a technique in the wild.
            </li>
          </ul>
          <p className="text-sm muted">
            Around this core, ATT&amp;CK also documents Groups (tracked threat actors), Software
            (malware and tools), Mitigations, and the data sources you would need to detect each
            technique.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The fourteen Enterprise tactics</h2>
          <p className="text-sm muted">
            The Enterprise matrix organizes techniques under fourteen tactics. They roughly track the
            progression of an intrusion, but they are deliberately not a strict sequence &mdash; a
            real campaign may skip stages, loop back, or pursue several at once:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 720 268"
              className="w-full"
              style={{ minWidth: 560 }}
              role="img"
              aria-label="The fourteen Enterprise ATT&CK tactics in order"
            >
              <g fontSize="12" fill="currentColor">
                {tacticsLeft.map((t, i) => {
                  const y = 16 + i * 34;
                  return (
                    <g key={`l-${i}`}>
                      <rect x="16" y={y} width="316" height="26" rx="6" fill="var(--dg-accent,#2563eb)" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.25" />
                      <circle cx="34" cy={y + 13} r="10" fill="var(--dg-accent,#2563eb)" fillOpacity="0.18" stroke="var(--dg-accent,#2563eb)" strokeOpacity="0.5" />
                      <text x="34" y={y + 17} textAnchor="middle" fontSize="11" fontWeight="600">{i + 1}</text>
                      <text x="52" y={y + 17}>{t}</text>
                    </g>
                  );
                })}
                {tacticsRight.map((t, i) => {
                  const y = 16 + i * 34;
                  return (
                    <g key={`r-${i}`}>
                      <rect x="388" y={y} width="316" height="26" rx="6" fill="var(--dg-accent,#2563eb)" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.25" />
                      <circle cx="406" cy={y + 13} r="10" fill="var(--dg-accent,#2563eb)" fillOpacity="0.18" stroke="var(--dg-accent,#2563eb)" strokeOpacity="0.5" />
                      <text x="406" y={y + 17} textAnchor="middle" fontSize="11" fontWeight="600">{i + 8}</text>
                      <text x="424" y={y + 17}>{t}</text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
          <p className="text-sm muted">
            Read it as a spectrum of adversary goals, from getting in on the left to acting on
            objectives on the right. Each tactic holds anywhere from a handful to dozens of
            techniques underneath it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How teams actually use it</h2>
          <p className="text-sm muted">
            ATT&amp;CK earns its keep in a few recurring workflows:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Detection coverage mapping.</strong> Teams chart which techniques their
              logging and alerting can catch, exposing blind spots where an adversary could operate
              unseen. The ATT&amp;CK Navigator is a free tool built for exactly this heatmap.
            </li>
            <li>
              <strong>Threat intelligence.</strong> Reports describe adversaries in ATT&amp;CK terms,
              so you can compare groups, prioritize the techniques most relevant to your industry,
              and turn a narrative report into concrete detection work.
            </li>
            <li>
              <strong>Red and purple teaming.</strong> Offensive teams emulate a specific group&apos;s
              techniques, and defenders verify whether each one is detected &mdash; a structured way
              to test controls rather than guessing.
            </li>
            <li>
              <strong>Gap analysis and reporting.</strong> Because the matrix is a fixed reference,
              it makes progress legible to leadership: &ldquo;last quarter we covered these
              techniques, this quarter we added those.&rdquo;
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">ATT&amp;CK for containers and cloud</h2>
          <p className="text-sm muted">
            The Enterprise matrix is not limited to Windows endpoints. It explicitly covers cloud
            platforms and includes a Containers technology area with techniques aimed at Docker and
            Kubernetes environments &mdash; deploying a malicious container, abusing an exposed
            container API, escaping to the host, or using a compromised image as a foothold. This
            matters because container attacks often begin with exactly the kind of weakness a scanner
            surfaces: a vulnerable package in a base image, an exposed daemon socket, or an
            over-privileged workload.
          </p>
          <p className="text-sm muted">
            Mapping your container defenses to these techniques turns a vague sense of &ldquo;we
            should secure our images&rdquo; into a checklist. Image scanning addresses the initial
            foothold; admission control and runtime policy address execution and privilege
            escalation inside the cluster. The framework gives you a way to see which of those cells
            you actually cover and which are still open &mdash; and to justify the work in terms a
            security review understands.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where vulnerability scanning fits</h2>
          <p className="text-sm muted">
            ATT&amp;CK can feel abstract until you connect it to daily security hygiene. The link is
            direct. One of the most common initial-access techniques is T1190, Exploit
            Public-Facing Application &mdash; an attacker exploiting a known flaw in an
            internet-facing service. That flaw is almost always a{" "}
            <Link href="/blog/what-is-a-cve" className="underline">
              CVE
            </Link>
            . Every known vulnerability you find and patch removes a concrete option an adversary had
            under that tactic.
          </p>
          <p className="text-sm muted">
            The same holds for privilege escalation and lateral movement, where unpatched local
            vulnerabilities are frequently the enabler. This is why exploitation-aware
            prioritization matters:{" "}
            <Link href="/blog/cisa-kev-guide" className="underline">
              the CISA KEV catalog
            </Link>{" "}
            and{" "}
            <Link href="/blog/epss-scores-explained" className="underline">
              EPSS scores
            </Link>{" "}
            tell you which of your findings map to techniques adversaries are actually using right
            now. Vulnerability scanning is not a substitute for detection engineering, but it is one
            of the cheapest ways to shrink the left-hand side of the matrix &mdash; the tactics that
            let an attacker get in at all.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How ScanRook connects</h2>
          <p className="text-sm muted">
            ScanRook does not claim to be an ATT&amp;CK detection platform &mdash; that would be
            overreach. What it does is address the raw material behind many initial-access and
            escalation techniques: known CVEs in the software you ship. By inventorying every OS and
            language package in a container image or binary and matching them against OSV, NVD, and
            vendor advisory data, ScanRook shows you which exploitable flaws are present before an
            adversary finds them. Feed that into your ATT&amp;CK-aligned program and the CVEs stop
            being a flat list &mdash; they become the specific techniques you have just closed off. A
            layered view of that defense is worth building, as we cover in{" "}
            <Link href="/blog/software-supply-chain-security" className="underline">
              software supply chain security
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is MITRE ATT&amp;CK?</h3>
              <p className="text-sm muted mt-1">
                A free, MITRE-maintained knowledge base of real-world adversary tactics and
                techniques, organized as a matrix that gives security teams a shared language for
                describing attacker behavior.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Tactic vs technique?</h3>
              <p className="text-sm muted mt-1">
                A tactic is the adversary&apos;s goal, like Initial Access; a technique is a specific
                method to reach it, like Exploit Public-Facing Application (T1190), sometimes with
                finer sub-techniques.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How many Enterprise tactics are there?</h3>
              <p className="text-sm muted mt-1">
                Fourteen, from Reconnaissance and Resource Development through to Exfiltration and
                Impact. They map the phases of an intrusion but are not a strict linear sequence.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How does it relate to CVEs?</h3>
              <p className="text-sm muted mt-1">
                Many techniques are executed by exploiting known CVEs. Patching and scanning for them
                directly removes options under initial-access and escalation tactics.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Close off the techniques that start with a CVE</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook finds the known vulnerabilities behind initial-access and escalation techniques,
            matching every package against OSV, NVD, and vendor advisories with a confidence tier on
            each finding &mdash; so you patch what an adversary would actually reach for.
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
            <Link href="/blog/what-is-a-cve" className="underline">
              What Is a CVE?
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/cisa-kev-guide" className="underline">
              CISA KEV Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/epss-scores-explained" className="underline">
              EPSS Scores Explained
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
