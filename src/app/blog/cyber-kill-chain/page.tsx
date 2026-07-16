import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-12";

const title = `The Cyber Kill Chain Explained: 7 Stages of an Attack | ${APP_NAME}`;
const description =
  "The cyber kill chain maps an intrusion into 7 stages. What each stage means, how defenders break the chain, and where vulnerability scanning fits in.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "cyber kill chain",
    "cyber kill chain stages",
    "lockheed martin kill chain",
    "cyber kill chain explained",
    "kill chain model",
    "7 stages of cyber kill chain",
    "cyber kill chain vs mitre attack",
    "cyber attack lifecycle",
    "cyber kill chain example",
    "reconnaissance weaponization delivery",
  ],
  alternates: { canonical: "/blog/cyber-kill-chain" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/cyber-kill-chain",
    images: ["/blog/cyber-kill-chain.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/cyber-kill-chain.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "The Cyber Kill Chain Explained: 7 Stages of an Attack",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/cyber-kill-chain",
  image: "https://scanrook.io/blog/cyber-kill-chain.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the cyber kill chain?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The cyber kill chain is a model, published by Lockheed Martin in 2011, that breaks a targeted intrusion into seven sequential stages from reconnaissance through actions on objectives. Its central idea is that an attacker must complete every stage to succeed, so a defender who disrupts any single stage stops the whole attack.",
      },
    },
    {
      "@type": "Question",
      name: "What are the 7 stages of the cyber kill chain?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The seven stages are reconnaissance, weaponization, delivery, exploitation, installation, command and control, and actions on objectives. They describe the attacker moving from gathering information, to building and delivering a payload, to exploiting a weakness, gaining persistence, establishing remote control, and finally achieving their goal such as data theft.",
      },
    },
    {
      "@type": "Question",
      name: "How do defenders use the cyber kill chain?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Defenders map their controls to each stage and look for gaps. Because every stage is an opportunity to detect or disrupt the attack, the model helps teams layer defenses so that if one control fails, another catches the attacker at a later stage. It also structures incident analysis by pinning where an intrusion was caught.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between the cyber kill chain and MITRE ATT&CK?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The kill chain is a high-level, linear model of seven attack phases. MITRE ATT&CK is a detailed, non-linear knowledge base of specific adversary tactics and techniques observed in the real world. The kill chain is good for explaining the shape of an attack; ATT&CK is better for mapping concrete detections to specific techniques.",
      },
    },
    {
      "@type": "Question",
      name: "Where does vulnerability scanning fit in the kill chain?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Scanning targets the exploitation stage. Attackers weaponize known vulnerabilities and use them to gain a foothold, so finding and remediating those flaws in your software before deployment removes the weaknesses an exploit would rely on. It shrinks the exploitation opportunity rather than waiting to detect the attacker after delivery.",
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
            The Cyber Kill Chain Explained: 7 Stages of an Attack
          </h1>
          <p className="text-sm muted">Published October 12, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            The cyber kill chain is one of the most durable mental models in security: an attack is
            not a single event but a sequence of steps, and breaking any one of them defeats the
            whole thing. It has real limitations, and newer frameworks cover ground it misses, but as
            a way to reason about how intrusions unfold and where to place defenses, it still earns
            its keep. Here are the seven stages, how to use them defensively, and where vulnerability
            scanning fits.
          </p>
        </header>

        <img
          src="/blog/cyber-kill-chain.jpg"
          alt="The seven stages of the cyber kill chain"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where the model came from</h2>
          <p className="text-sm muted">
            The term borrows from a military concept &mdash; the sequence of steps required to engage
            a target. In 2011, researchers at <strong>Lockheed Martin</strong> adapted it to computer
            network defense, arguing that intrusions follow a predictable progression and that
            defenders gain leverage by disrupting the chain early. The insight was less about the
            specific stages and more about the framing: because the attacker must succeed at{" "}
            <em>every</em> stage while the defender only has to break <em>one</em>, defense is not as
            hopeless as it feels.
          </p>
          <p className="text-sm muted">
            That framing reshaped how teams think about detection. Instead of chasing a single
            perfect control, you place overlapping controls across the chain so an attacker who slips
            past one is caught by the next &mdash; the practical logic behind layered defense.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The seven stages</h2>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 460 272" role="img" aria-label="The seven sequential stages of the Lockheed Martin cyber kill chain" className="w-full max-w-md mx-auto text-[color:var(--dg-accent,#2563eb)]">
              <line x1="20" y1="24" x2="20" y2="252" stroke="currentColor" strokeWidth="2" opacity="0.3" />
              <circle cx="20" cy="30" r="9" className="fill-current" opacity="0.85" /><text x="16.5" y="34" fontSize="10" fill="#fff">1</text><text x="40" y="34" fontSize="13" className="fill-current" opacity="0.95">Reconnaissance</text>
              <circle cx="20" cy="66" r="9" className="fill-current" opacity="0.85" /><text x="16.5" y="70" fontSize="10" fill="#fff">2</text><text x="40" y="70" fontSize="13" className="fill-current" opacity="0.95">Weaponization</text>
              <circle cx="20" cy="102" r="9" className="fill-current" opacity="0.85" /><text x="16.5" y="106" fontSize="10" fill="#fff">3</text><text x="40" y="106" fontSize="13" className="fill-current" opacity="0.95">Delivery</text>
              <circle cx="20" cy="138" r="9" className="fill-current" opacity="1" /><text x="16.5" y="142" fontSize="10" fill="#fff">4</text><text x="40" y="142" fontSize="13" className="fill-current" opacity="0.95">Exploitation</text><text x="150" y="142" fontSize="10" className="fill-current" opacity="0.6">&larr; scanning acts here</text>
              <circle cx="20" cy="174" r="9" className="fill-current" opacity="0.85" /><text x="16.5" y="178" fontSize="10" fill="#fff">5</text><text x="40" y="178" fontSize="13" className="fill-current" opacity="0.95">Installation</text>
              <circle cx="20" cy="210" r="9" className="fill-current" opacity="0.85" /><text x="16.5" y="214" fontSize="10" fill="#fff">6</text><text x="40" y="214" fontSize="13" className="fill-current" opacity="0.95">Command and Control</text>
              <circle cx="20" cy="246" r="9" className="fill-current" opacity="0.85" /><text x="16.5" y="250" fontSize="10" fill="#fff">7</text><text x="40" y="250" fontSize="13" className="fill-current" opacity="0.95">Actions on Objectives</text>
            </svg>
          </div>
          <ol className="text-sm muted list-decimal pl-5 grid gap-2">
            <li><strong>Reconnaissance.</strong> The attacker researches the target &mdash; harvesting email addresses, mapping internet-facing services, fingerprinting software versions, and identifying likely weak points.</li>
            <li><strong>Weaponization.</strong> They build the payload, often coupling an exploit for a known vulnerability with a backdoor into a deliverable file such as a malicious document or a crafted request.</li>
            <li><strong>Delivery.</strong> The weapon is transmitted &mdash; a phishing email, a compromised website, a malicious dependency, or a direct exploit against an exposed service.</li>
            <li><strong>Exploitation.</strong> The payload triggers, exploiting a vulnerability or a user action to execute the attacker&apos;s code on the target.</li>
            <li><strong>Installation.</strong> The attacker installs malware or a foothold that survives reboots &mdash; a web shell, a service, a scheduled task &mdash; establishing persistence.</li>
            <li><strong>Command and Control (C2).</strong> The compromised host beacons out to attacker-controlled infrastructure, giving them an interactive channel to issue instructions.</li>
            <li><strong>Actions on Objectives.</strong> With hands on the keyboard, the attacker pursues the goal &mdash; exfiltrating data, encrypting for ransom, moving laterally, or destroying systems.</li>
          </ol>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Breaking the chain</h2>
          <p className="text-sm muted">
            The point of the model is defensive action at each stage. Reconnaissance can be blunted by
            reducing your exposed attack surface and monitoring for scanning. Delivery is countered by
            email filtering and web protections. Exploitation is countered by removing the
            vulnerabilities a payload would target. Installation and C2 are where endpoint detection
            and network monitoring earn their place, and actions on objectives is the last line &mdash;
            data-loss prevention, segmentation, and encryption limit the damage even if everything
            else failed.
          </p>
          <p className="text-sm muted">
            The earlier you break the chain, the cheaper the outcome. A blocked phishing email costs
            nothing; an attacker discovered at actions-on-objectives has already had free run of your
            environment. That economic gradient is why prevention at exploitation &mdash; closing the
            holes before anyone reaches them &mdash; is such a high-leverage investment, and it links
            directly to a mature{" "}
            <Link href="/blog/vulnerability-management-guide" className="underline">
              vulnerability management program
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Limitations and newer models</h2>
          <p className="text-sm muted">
            The kill chain is a product of its era, and it shows. It was designed around
            perimeter-breaching malware attacks, so it fits classic intrusions well but strains
            against threats that do not follow the linear path: insider abuse, stolen-credential
            logins that skip exploitation entirely, supply-chain compromises that arrive inside
            trusted software, and cloud attacks that target misconfiguration rather than a host. It
            also weights heavily toward the early stages and says little about the lateral movement
            that dominates modern intrusions.
          </p>
          <p className="text-sm muted">
            This is why many teams pair it with <strong>MITRE ATT&amp;CK</strong>, a detailed and
            non-linear catalog of the specific tactics and techniques adversaries actually use, and
            variants like the Unified Kill Chain that add more phases. The kill chain remains a good
            teaching and communication tool; ATT&amp;CK is the reference you map concrete detections
            against. They are complementary, not competitors.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where vulnerability scanning fits</h2>
          <p className="text-sm muted">
            Scanning is a prevention control aimed squarely at the <strong>weaponization</strong> and
            <strong> exploitation</strong> stages. Attackers weaponize <em>known</em> vulnerabilities
            far more often than novel ones &mdash; a patched flaw is cheaper to exploit than a
            zero-day &mdash; and the catalog of actively exploited flaws is public. That means the
            single most effective thing you can do to break the chain at exploitation is to not be
            running the software those exploits target. Prioritizing findings by real-world
            exploitation, using signals like the{" "}
            <Link href="/blog/cisa-kev-guide" className="underline">
              CISA Known Exploited Vulnerabilities catalog
            </Link>
            , points your remediation at the flaws attackers reach for first.
          </p>
          <p className="text-sm muted">
            The same logic applies upstream in the supply chain: a malicious or vulnerable dependency
            is a delivery-and-exploitation vector that arrives inside software you trust. Understanding
            what a vulnerability actually is &mdash; and how it differs from a threat &mdash; is worth
            grounding in our primer on{" "}
            <Link href="/blog/what-is-a-vulnerability" className="underline">
              what a vulnerability is
            </Link>
            , and the broader defensive picture is covered in{" "}
            <Link href="/blog/software-supply-chain-security" className="underline">
              software supply chain security
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How ScanRook helps break the chain early</h2>
          <p className="text-sm muted">
            ScanRook operates at the exploitation stage by removing the raw material an exploit needs.
            It reads the actual installed packages inside your container images, binaries, and source
            archives and matches every one against OSV, NVD, and vendor advisory data, so vulnerable
            components are found and fixed before the artifact ships &mdash; not after an attacker has
            weaponized them. It does not detect an intrusion in progress; that is the job of endpoint
            and network monitoring at the installation and C2 stages. What it does is make the
            exploitation stage harder to reach, which is the cheapest place on the chain to win.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Who created the cyber kill chain?</h3>
              <p className="text-sm muted mt-1">
                Lockheed Martin published it in 2011 as part of an intelligence-driven approach to
                computer network defense. It adapted the military kill-chain concept to describe the
                stages of a targeted digital intrusion.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is the cyber kill chain still relevant?</h3>
              <p className="text-sm muted mt-1">
                As a communication and layering tool, yes. As a complete model of modern attacks, it
                is dated &mdash; it struggles with credential abuse, insider threats, and cloud
                misconfiguration, which is why teams pair it with MITRE ATT&amp;CK.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What is the most important stage to stop an attack?</h3>
              <p className="text-sm muted mt-1">
                Earlier is cheaper. Stopping delivery or exploitation prevents the attacker from ever
                gaining a foothold, whereas catching them at actions on objectives means damage may
                already be done. Prevention beats detection where you can afford it.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How does the kill chain relate to defense in depth?</h3>
              <p className="text-sm muted mt-1">
                They reinforce each other. Defense in depth places independent controls in layers; the
                kill chain tells you which attack stage each layer should address, so your layers cover
                the whole progression rather than clustering at one point.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Break the chain at exploitation</h3>
          <p className="text-sm muted leading-relaxed">
            Attackers weaponize known vulnerabilities. ScanRook finds them first &mdash; matching
            every component in your images and binaries against OSV, NVD, and vendor advisories, and
            flagging the ones on the actively-exploited list &mdash; so the flaws an exploit needs are
            gone before the artifact ships.
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
            <Link href="/blog/cisa-kev-guide" className="underline">
              CISA KEV Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/software-supply-chain-security" className="underline">
              Software Supply Chain Security
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
