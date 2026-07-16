import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-09";

const title = `Attack Surface Management: A Practical Primer for 2026 | ${APP_NAME}`;
const description =
  "Attack surface management is the continuous discovery, inventory, and monitoring of every asset an attacker can reach. What it covers and where scanning fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "attack surface management",
    "what is attack surface management",
    "external attack surface management",
    "easm",
    "cyber asset attack surface management",
    "caasm",
    "attack surface",
    "asm tools",
    "attack surface reduction",
    "attack surface monitoring",
    "digital attack surface",
  ],
  alternates: { canonical: "/blog/attack-surface-management" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/attack-surface-management",
    images: ["/blog/attack-surface-management.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/attack-surface-management.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Attack Surface Management: A Practical Primer for 2026",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/attack-surface-management",
  image: "https://scanrook.io/blog/attack-surface-management.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is attack surface management?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Attack surface management (ASM) is the continuous process of discovering, inventorying, classifying, prioritizing, and monitoring every asset that an attacker could reach or exploit. It treats the attack surface as something that changes daily rather than a fixed list, and its defining feature is discovery: finding the internet-facing systems, cloud resources, and software components you did not know you had.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between EASM and CAASM?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "External attack surface management (EASM) looks at your organization from the outside in, discovering internet-facing domains, IPs, certificates, and services the way an attacker would. Cyber asset attack surface management (CAASM) works from the inside out, aggregating asset data from tools you already run to build one authoritative inventory. Many programs use both because they answer different questions.",
      },
    },
    {
      "@type": "Question",
      name: "How is attack surface management different from vulnerability management?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Vulnerability management assumes you already know which assets exist and asks which of them are flawed. Attack surface management runs one step earlier: it finds the assets in the first place, including shadow IT and forgotten systems. The two are complementary. ASM defines the scope; vulnerability scanning and remediation act on what falls inside it.",
      },
    },
    {
      "@type": "Question",
      name: "What counts as part of the attack surface?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The digital attack surface includes domains, subdomains, IP ranges, cloud accounts, APIs, exposed ports and services, and the software running on them, including container images and their dependencies. Broader definitions also include the human attack surface targeted by phishing and the physical attack surface. Most ASM tooling focuses on the digital, internet-reachable portion.",
      },
    },
    {
      "@type": "Question",
      name: "Can attack surface management be automated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Discovery and monitoring can be largely automated: scanners enumerate internet-facing assets, aggregate cloud inventories, and flag new exposures as they appear. Classification and prioritization still benefit from human judgment because business context determines which exposures matter most. Automation keeps the inventory current; people decide what to fix first.",
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
            Attack Surface Management: A Practical Primer for 2026
          </h1>
          <p className="text-sm muted">Published November 9, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            Most breaches do not start with a clever exploit. They start with an asset nobody
            remembered: a forgotten staging server, an expired-but-still-resolving subdomain, a
            container image running a library three versions behind. Attack surface management is
            the discipline of finding those assets before an attacker does, and keeping the list
            current as your infrastructure changes underneath you.
          </p>
        </header>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What the attack surface actually is</h2>
          <p className="text-sm muted">
            Your attack surface is the sum of every point where someone could try to enter your
            systems or pull data out of them. That includes the obvious things &mdash; a public web
            application, an SSH port, an exposed API &mdash; and a long tail of less obvious ones:
            cloud storage buckets, CI/CD runners, third-party integrations, and the transitive
            dependencies buried inside the software you ship. The surface is not static. Every deploy,
            every new cloud resource, every acquired subsidiary, and every abandoned project changes
            its shape.
          </p>
          <p className="text-sm muted">
            Security teams usually break it into a few layers. The <strong>digital</strong> surface is
            everything reachable over a network: domains, IPs, services, and the applications and
            container images behind them. The <strong>human</strong> surface is the set of people who
            can be phished or socially engineered. The <strong>physical</strong> surface covers
            devices and facilities. Attack surface management tooling concentrates on the digital,
            internet-reachable portion because that is where automated discovery is both possible and
            most urgent.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What attack surface management does</h2>
          <p className="text-sm muted">
            ASM is best understood as a loop rather than a report. It runs continuously because the
            thing it describes never stops moving. The stages are consistent across vendors even when
            the names differ:
          </p>

          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 720 130" className="w-full" role="img" aria-label="The attack surface management lifecycle: discover, inventory, prioritize, remediate, and monitor, feeding back into discovery.">
              <g fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5">
                <rect x="6" y="34" width="120" height="46" rx="8" />
                <rect x="156" y="34" width="120" height="46" rx="8" />
                <rect x="306" y="34" width="120" height="46" rx="8" />
                <rect x="456" y="34" width="120" height="46" rx="8" />
                <rect x="606" y="34" width="108" height="46" rx="8" />
              </g>
              <g fill="currentColor" fontSize="13" fontWeight="600" textAnchor="middle">
                <text x="66" y="61">Discover</text>
                <text x="216" y="61">Inventory</text>
                <text x="366" y="61">Prioritize</text>
                <text x="516" y="61">Remediate</text>
                <text x="660" y="61">Monitor</text>
              </g>
              <g stroke="var(--dg-accent,#2563eb)" strokeWidth="2" fill="none">
                <line x1="126" y1="57" x2="150" y2="57" />
                <line x1="276" y1="57" x2="300" y2="57" />
                <line x1="426" y1="57" x2="450" y2="57" />
                <line x1="576" y1="57" x2="600" y2="57" />
              </g>
              <g fill="var(--dg-accent,#2563eb)">
                <polygon points="150,57 142,53 142,61" />
                <polygon points="300,57 292,53 292,61" />
                <polygon points="450,57 442,53 442,61" />
                <polygon points="600,57 592,53 592,61" />
              </g>
              <path d="M660 80 L660 104 L66 104 L66 82" fill="none" stroke="var(--dg-accent,#2563eb)" strokeWidth="2" strokeDasharray="4 4" />
              <polygon points="66,80 62,90 70,90" fill="var(--dg-accent,#2563eb)" />
              <text x="363" y="122" fill="currentColor" fillOpacity="0.7" fontSize="11" textAnchor="middle">continuous feedback &mdash; the surface keeps changing</text>
            </svg>
          </div>

          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Discover.</strong> Enumerate assets from the outside (domains, certificates,
              exposed services) and the inside (cloud inventories, CMDBs, agent data). The goal is to
              surface the unknowns, not re-confirm the knowns.
            </li>
            <li>
              <strong>Inventory.</strong> Deduplicate and attribute what you found. Which business
              unit owns this host? Is this subdomain still in use? An asset with no owner is a finding
              in itself.
            </li>
            <li>
              <strong>Prioritize.</strong> Rank exposures by exploitability and business impact, not
              raw count. An unauthenticated admin panel outranks a hundred low-severity findings on an
              internal box.
            </li>
            <li>
              <strong>Remediate.</strong> Decommission, patch, reconfigure, or firewall. Some of the
              highest-value fixes are simply turning things off.
            </li>
            <li>
              <strong>Monitor.</strong> Watch for new exposures continuously, because tomorrow&apos;s
              deploy adds surface the last scan never saw.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">EASM, CAASM, and where they diverge</h2>
          <p className="text-sm muted">
            Two acronyms dominate the ASM market, and they solve genuinely different problems.{" "}
            <strong>External attack surface management (EASM)</strong> looks at your organization the
            way an attacker does: it starts from a seed like your primary domain and expands outward,
            discovering subdomains, related IP ranges, TLS certificates, and exposed services with no
            prior knowledge of your internal inventory. Its strength is finding the assets you never
            documented &mdash; the shadow IT and the leftovers of a project that shipped two years ago.
          </p>
          <p className="text-sm muted">
            <strong>Cyber asset attack surface management (CAASM)</strong> works in the opposite
            direction. It integrates with the tools you already run &mdash; cloud providers, endpoint
            agents, identity systems, vulnerability scanners &mdash; and reconciles their data into one
            authoritative inventory. Its strength is answering coverage questions: which assets have no
            endpoint agent, which cloud instances were never scanned, where the gaps between tools
            live. Mature programs tend to run both, because EASM tells you what exists that you did not
            know about and CAASM tells you what you know about that is not being protected.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How ASM relates to vulnerability management</h2>
          <p className="text-sm muted">
            It is easy to conflate the two, but the sequence matters. Vulnerability management asks
            &ldquo;which of my known assets are flawed?&rdquo; Attack surface management asks
            &ldquo;which assets do I actually have?&rdquo; &mdash; and runs first. A scanner pointed at
            an inventory that is missing a third of your real footprint will produce a clean report and
            a false sense of safety. This is why we treat ASM as the scoping layer that feeds a{" "}
            <Link href="/blog/vulnerability-management-guide" className="underline">
              vulnerability management lifecycle
            </Link>
            , not a competitor to it.
          </p>
          <p className="text-sm muted">
            The software dimension of the attack surface is where the two disciplines meet most
            directly. A container image running in production is an asset, but so is every library
            inside it. If you do not know that a given service ships an outdated OpenSSL or a
            vulnerable logging library, that component is part of your attack surface whether you have
            catalogued it or not &mdash; a lesson the{" "}
            <Link href="/blog/software-supply-chain-security" className="underline">
              software supply chain
            </Link>{" "}
            keeps re-teaching. Reachability and exploit likelihood then decide urgency, which is where
            signals like{" "}
            <Link href="/blog/cisa-kev-guide" className="underline">
              the CISA KEV catalog
            </Link>{" "}
            earn their keep.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Reducing the surface, not just measuring it</h2>
          <p className="text-sm muted">
            Discovery is the headline feature, but the point of ASM is reduction. The most durable wins
            are structural rather than reactive:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Decommission ruthlessly.</strong> The safest asset is the one that no longer
              exists. Retire unused subdomains, stale cloud accounts, and demo environments that
              outlived their demo.
            </li>
            <li>
              <strong>Close what does not need to be open.</strong> Every internet-facing port is a
              choice. Put management interfaces behind a VPN or identity-aware proxy instead of exposing
              them directly.
            </li>
            <li>
              <strong>Shrink each asset.</strong> A minimal container image with fewer packages is a
              smaller target than a full OS image &mdash; the same argument for{" "}
              <Link href="/blog/container-image-scanning-guide" className="underline">
                scanning images
              </Link>{" "}
              and keeping their contents lean.
            </li>
            <li>
              <strong>Own everything.</strong> Assign an owner to every asset in the inventory.
              Unowned assets are the ones that go unpatched.
            </li>
            <li>
              <strong>Watch continuously.</strong> Point-in-time audits go stale within a sprint.
              New exposures should page someone, not wait for the next quarterly review.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook is not an attack surface management platform, and it would be dishonest to pitch
            it as one &mdash; it does not enumerate your domains or reconcile your cloud inventory. What
            it does is go deep on one important slice of the surface: the software you build and ship.
            When ASM identifies that a container image, binary, or source archive is part of your
            footprint, ScanRook unpacks that artifact and matches every package it finds against OSV,
            NVD, and vendor advisory data, so the component-level exposure inside each asset is visible
            rather than assumed.
          </p>
          <p className="text-sm muted">
            In practice that makes it a complement to whatever ASM tooling you run: the discovery layer
            tells you which artifacts exist, and ScanRook tells you what is vulnerable inside them, with
            each finding tagged by source and confidence tier so you can prioritize the exposures that
            are real and reachable rather than the ones that merely score high.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is attack surface management just external scanning?</h3>
              <p className="text-sm muted mt-1">
                No. External scanning (EASM) is one half; the other is reconciling internal asset data
                (CAASM) so you can see coverage gaps. Discovery from the outside and inventory from the
                inside answer different questions.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How often should the attack surface be assessed?</h3>
              <p className="text-sm muted mt-1">
                Continuously. Because infrastructure changes with every deploy, point-in-time audits go
                stale quickly. The goal is monitoring that flags new exposures as they appear rather than
                a scheduled snapshot.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does ASM replace penetration testing?</h3>
              <p className="text-sm muted mt-1">
                No. ASM maps and monitors what is exposed; penetration testing probes whether specific
                exposures are actually exploitable. They inform each other &mdash; ASM often defines the
                scope a pentest then validates.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Where does software scanning fit into ASM?</h3>
              <p className="text-sm muted mt-1">
                The software running on an asset is part of its attack surface. Once ASM identifies an
                artifact, scanning it for vulnerable components turns a known asset into a known,
                quantified exposure you can prioritize and fix.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">See what is inside your software attack surface</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook unpacks container images, binaries, and source archives and matches every package
            against OSV, NVD, and vendor advisory data &mdash; so the exposure hiding inside each asset
            becomes a finding you can rank and remediate, not an unknown.
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
            <Link href="/blog/vulnerability-management-guide" className="underline">
              Vulnerability Management: A Practical Lifecycle Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/software-supply-chain-security" className="underline">
              Software Supply Chain Security
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
