import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-15";

const title = `Ripple20: 19 Vulnerabilities in the Treck TCP/IP Stack | ${APP_NAME}`;
const description =
  "Ripple20 is a set of 19 vulnerabilities in the Treck embedded TCP/IP stack that rippled through IoT supply chains. Critical CVEs, affected devices, and fixes.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "ripple20",
    "ripple20 vulnerabilities",
    "treck tcp/ip stack",
    "treck vulnerabilities",
    "cve-2020-11896",
    "iot supply chain vulnerability",
    "embedded tcp ip stack cve",
    "jsof ripple20",
    "ripple20 remediation",
    "ics medical device vulnerability",
  ],
  alternates: { canonical: "/blog/ripple20" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/ripple20",
    images: ["/blog/ripple20.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/ripple20.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Ripple20: 19 Vulnerabilities in the Treck TCP/IP Stack",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/ripple20",
  image: "https://scanrook.io/blog/ripple20.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Ripple20?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ripple20 is a set of 19 vulnerabilities disclosed in June 2020 by the research firm JSOF in the Treck TCP/IP stack, a lightweight networking library embedded in a huge range of IoT, industrial, and medical devices. The name refers to the ripple effect the flaws had through the technology supply chain in 2020, because the same code was reused across hundreds of products from many vendors.",
      },
    },
    {
      "@type": "Question",
      name: "What is the Treck TCP/IP stack?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Treck is a small, commercial TCP/IP networking stack designed for embedded and real-time devices. Because it is efficient and easy to license, it was integrated into chips, modules, and finished products over roughly two decades. A related codebase was also distributed in Asia under the KASAGO name, so the same vulnerable logic appeared under more than one brand.",
      },
    },
    {
      "@type": "Question",
      name: "Which Ripple20 vulnerabilities are the most serious?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Four of the 19 were rated critical. CVE-2020-11896 (IPv4/UDP) and CVE-2020-11897 (IPv6) reached CVSS 10.0 and allow remote code execution or memory corruption. CVE-2020-11901 is a remote code execution flaw in the DNS resolver that can be triggered by answering a single DNS request, which researchers considered especially dangerous. CVE-2020-11898 is a high-severity information-exposure flaw.",
      },
    },
    {
      "@type": "Question",
      name: "Why was Ripple20 so hard to fix?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Because most affected vendors did not know they used Treck. The stack was embedded deep in the supply chain, sometimes years earlier, sometimes modified or rebranded, so the vulnerable code was present in devices whose makers had no record of it. You cannot patch a component you do not know you shipped, which is why Ripple20 became the textbook case for maintaining a software bill of materials.",
      },
    },
    {
      "@type": "Question",
      name: "How do you remediate Ripple20?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Apply the fixed Treck stack version or, more practically, the firmware updates your device vendors release. Where patching is not possible, reduce exposure: segment operational-technology networks, minimize internet-facing embedded devices, use an internal DNS server, and block anomalous or fragmented IP traffic. CISA published advisories with detailed mitigation guidance.",
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
            Ripple20: 19 Vulnerabilities in the Treck TCP/IP Stack
          </h1>
          <p className="text-sm muted">Published December 15, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            In June 2020, researchers disclosed 19 vulnerabilities in a networking library most
            people had never heard of &mdash; and estimated it was running inside hundreds of millions
            of devices, from medical infusion pumps to industrial controllers to office printers.
            Ripple20 is less a single bug story than a supply-chain story: the same code, reused for
            twenty years, quietly rippled into products whose makers did not even know it was there.
          </p>
        </header>

        <img
          src="/blog/ripple20.jpg"
          alt="Ripple20 vulnerabilities in the Treck TCP/IP stack"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Ripple20 is</h2>
          <p className="text-sm muted">
            Ripple20 is the name the Israeli security firm JSOF gave to a cluster of 19 vulnerabilities
            it found in the <strong>Treck TCP/IP stack</strong> and disclosed on June 16, 2020. The
            CVEs run from CVE-2020-11896 through CVE-2020-11914. A TCP/IP stack is the low-level code
            that lets a device speak the internet protocols &mdash; IP, UDP, TCP, ICMP, DNS &mdash; and
            Treck is a small, efficient commercial implementation built for embedded and real-time
            systems. Flaws at that layer are dangerous because they sit below the application: a
            malformed packet can corrupt memory before anything you would normally think of as
            &ldquo;the software&rdquo; even runs.
          </p>
          <p className="text-sm muted">
            The name captures the mechanism. Treck was licensed and embedded across the technology
            supply chain over roughly two decades, so a single set of flaws <em>rippled</em> outward
            into an enormous, hard-to-count population of devices. To ground the terminology, our{" "}
            <Link href="/blog/what-is-a-cve" className="underline">
              guide to CVEs
            </Link>{" "}
            explains how these identifiers are assigned and tracked.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The supply-chain ripple</h2>
          <p className="text-sm muted">
            The reason Ripple20 was so hard to contain is best seen as a chain of reuse. The stack
            passed through many hands, gaining distance from its origin at each step:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 760 150" role="img" aria-label="Ripple20 supply chain: one stack reused across vendors, products, and deployed devices" className="w-full min-w-[640px]">
              <defs>
                <marker id="r20-arrow" markerWidth="9" markerHeight="9" refX="6" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 z" fill="currentColor" />
                </marker>
              </defs>
              <text x="380" y="24" fill="currentColor" fontSize="13" fontWeight="600" textAnchor="middle" opacity="0.85">
                One code base, amplified at every step
              </text>
              <g fill="none" stroke="currentColor">
                <rect x="8" y="54" width="150" height="58" rx="8" fill="var(--dg-accent,#2563eb)" fillOpacity="0.12" stroke="var(--dg-accent,#2563eb)" />
                <rect x="205" y="54" width="150" height="58" rx="8" opacity="0.4" />
                <rect x="402" y="54" width="150" height="58" rx="8" opacity="0.4" />
                <rect x="599" y="54" width="153" height="58" rx="8" opacity="0.4" />
              </g>
              <g fill="currentColor" textAnchor="middle">
                <text x="83" y="80" fontSize="13" fontWeight="600">Treck stack</text>
                <text x="83" y="98" fontSize="11" opacity="0.7">one code base</text>
                <text x="280" y="80" fontSize="13">Chip &amp; module</text>
                <text x="280" y="98" fontSize="11" opacity="0.7">vendors embed it</text>
                <text x="477" y="80" fontSize="13">Device makers</text>
                <text x="477" y="98" fontSize="11" opacity="0.7">ship products</text>
                <text x="675" y="80" fontSize="13">Deployed fleet</text>
                <text x="675" y="98" fontSize="11" opacity="0.7">millions of devices</text>
              </g>
              <g stroke="currentColor" opacity="0.7">
                <line x1="160" y1="83" x2="203" y2="83" markerEnd="url(#r20-arrow)" />
                <line x1="357" y1="83" x2="400" y2="83" markerEnd="url(#r20-arrow)" />
                <line x1="554" y1="83" x2="597" y2="83" markerEnd="url(#r20-arrow)" />
              </g>
            </svg>
          </div>
          <p className="text-sm muted">
            To make tracking even harder, a related version of the codebase was distributed in Asia
            under the <strong>KASAGO</strong> name, so the same vulnerable logic existed under a
            different brand. By the time Ripple20 was disclosed, most vendors several links down the
            chain had no idea Treck was inside their products. This is exactly the blind spot we
            describe in{" "}
            <Link href="/blog/software-supply-chain-security" className="underline">
              software supply chain security
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The critical vulnerabilities</h2>
          <p className="text-sm muted">
            Four of the 19 were rated critical. The two headline flaws reached the maximum CVSS score:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">CVE</th>
                  <th className="text-left py-2 pr-4 font-semibold">Issue</th>
                  <th className="text-left py-2 font-semibold">CVSS</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">CVE-2020-11896</td>
                  <td className="py-2 pr-4">Remote code execution via IPv4/UDP handling</td>
                  <td className="py-2">10.0</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">CVE-2020-11897</td>
                  <td className="py-2 pr-4">Out-of-bounds write via IPv6 handling</td>
                  <td className="py-2">10.0</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">CVE-2020-11901</td>
                  <td className="py-2 pr-4">RCE via the DNS resolver, triggerable by one DNS reply</td>
                  <td className="py-2">9.0</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">CVE-2020-11898</td>
                  <td className="py-2 pr-4">Information exposure via IPv4/ICMPv4 handling</td>
                  <td className="py-2">9.1</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            Scores shown are the reported base scores and can vary slightly between scoring sources.
            Researchers singled out <strong>CVE-2020-11901</strong> as the most concerning in practice:
            because it lives in the DNS resolver, an attacker could trigger it simply by getting a
            device to make a DNS query and then answering it &mdash; a path that can reach a device from
            outside its local network.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Who was affected</h2>
          <p className="text-sm muted">
            Because Treck sat so low in the stack and so deep in the supply chain, Ripple20 touched an
            unusually broad set of sectors: industrial control and automation, medical devices,
            enterprise networking and printing, power, transportation, and consumer IoT. Coordinated
            disclosure through CISA and CERT/CC named affected products from a long list of major
            vendors, and the true footprint was almost certainly larger than any published list, since
            many integrators could not confirm whether their firmware included the stack. This is the
            same problem &mdash; not knowing what is actually installed &mdash; that separates{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning from advisory guesswork
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Remediation and mitigation</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Update the stack or the firmware.</strong> Treck released fixed versions, and the
              practical fix for most operators is the device vendor&apos;s firmware update. Track which
              of your devices have an available patch and apply it &mdash; a discipline covered in our{" "}
              <Link href="/blog/patch-management-guide" className="underline">
                patch management guide
              </Link>
              .
            </li>
            <li>
              <strong>Minimize exposure.</strong> Keep embedded and operational-technology devices off
              the public internet, and segment OT networks away from IT so a compromised device cannot
              reach critical systems.
            </li>
            <li>
              <strong>Harden DNS and IP handling.</strong> Use an internal DNS server for caching and
              filtering, and where your network gear allows it, block anomalous IP traffic and
              normalize or deny IP fragmentation and IP-in-IP tunneling &mdash; the packet shapes several
              Ripple20 flaws rely on.
            </li>
            <li>
              <strong>Inventory first.</strong> You cannot mitigate what you have not located, so start
              by identifying which of your devices run a Treck-derived stack.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Ripple20 is the canonical argument for a software bill of materials, and that is where
            ScanRook is genuinely relevant &mdash; with an honest boundary. ScanRook scans the
            artifacts you build and ship, container images and binaries, inventories the components
            inside them, and matches those components against advisory data. When a Ripple20-style
            disclosure lands, an accurate{" "}
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              SBOM
            </Link>{" "}
            is the difference between answering &ldquo;do we ship this?&rdquo; in minutes versus weeks.
            The boundary worth stating plainly: detecting a proprietary embedded TCP/IP stack buried in
            closed third-party device firmware is genuinely hard, and no scanner should claim to find
            Treck in an arbitrary black-box device. For components you cannot see into, the durable
            answer is supplier inventories and vendor VEX statements. For the software <em>you</em>{" "}
            build, ScanRook keeps that inventory current so the next ripple does not catch you blind.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">How many CVEs are in Ripple20?</h3>
              <p className="text-sm muted mt-1">
                Nineteen, running from CVE-2020-11896 through CVE-2020-11914. Four were rated critical,
                including two at the maximum CVSS score of 10.0.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Who discovered Ripple20?</h3>
              <p className="text-sm muted mt-1">
                The Israeli cybersecurity research firm JSOF, which coordinated disclosure with Treck,
                CISA, and CERT/CC before going public on June 16, 2020.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is Ripple20 related to Amnesia:33 or other stack bugs?</h3>
              <p className="text-sm muted mt-1">
                It is part of a broader wave of research into embedded TCP/IP stacks that also produced
                Amnesia:33 and the NAME:WRECK DNS findings. They are separate flaws in different stacks,
                but they share the same supply-chain lesson.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does Ripple20 affect containers?</h3>
              <p className="text-sm muted mt-1">
                Not directly &mdash; it is a flaw in an embedded device networking stack, not a Linux
                userland package. Its relevance to container teams is the principle: keep an accurate
                inventory of every third-party component you ship so buried dependencies surface fast.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Do not get caught blind by a buried dependency</h3>
          <p className="text-sm muted leading-relaxed">
            The Ripple20 lesson is simple: you cannot patch what you did not know you shipped. ScanRook
            inventories every component in your images and binaries and produces an SBOM, so the next
            supply-chain disclosure is a five-minute lookup, not a scramble.
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
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              What Is an SBOM?
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
