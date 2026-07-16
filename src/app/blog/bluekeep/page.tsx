import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-13";

const title = `BlueKeep (CVE-2019-0708): The Wormable RDP Vulnerability | ${APP_NAME}`;
const description =
  "BlueKeep (CVE-2019-0708) is a wormable, pre-auth RCE in Windows RDP rated CVSS 9.8. Affected versions, how the flaw works, remediation, and NLA mitigation.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "bluekeep",
    "cve-2019-0708",
    "bluekeep vulnerability",
    "rdp vulnerability",
    "wormable rdp exploit",
    "windows remote desktop rce",
    "bluekeep patch",
    "network level authentication rdp",
    "ms_t120 channel",
    "bluekeep remediation",
  ],
  alternates: { canonical: "/blog/bluekeep" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/bluekeep",
    images: ["/blog/bluekeep.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/bluekeep.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "BlueKeep (CVE-2019-0708): The Wormable RDP Vulnerability",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/bluekeep",
  image: "https://scanrook.io/blog/bluekeep.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is BlueKeep (CVE-2019-0708)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "BlueKeep is a critical remote code execution vulnerability in Microsoft's Remote Desktop Services, disclosed and patched on May 14, 2019 and rated CVSS 9.8. It is pre-authentication and wormable, meaning an attacker can run code on an exposed system without any credentials or user interaction, and a successful exploit could spread from machine to machine automatically.",
      },
    },
    {
      "@type": "Question",
      name: "Which Windows versions are affected by BlueKeep?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "BlueKeep affects Windows 7, Windows Server 2008, Windows Server 2008 R2, and the out-of-support Windows XP and Windows Server 2003. Microsoft took the unusual step of releasing patches for XP and Server 2003 despite their end of life. Windows 8, 8.1, and Windows 10 are not affected by CVE-2019-0708.",
      },
    },
    {
      "@type": "Question",
      name: "How does the BlueKeep exploit work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The flaw is a use-after-free in the RDP kernel driver tied to the internal MS_T120 virtual channel, which is bound to channel 31 by default. A client can bind MS_T120 to a different channel, and when the channel is torn down the driver frees memory that is later reused, leading to memory corruption and code execution. Because RDP processes this channel setup before authentication, no credentials are needed.",
      },
    },
    {
      "@type": "Question",
      name: "How do you protect against BlueKeep?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Apply Microsoft's May 2019 patch, which is the real fix. If you cannot patch immediately, enabling Network Level Authentication forces authentication before an RDP session is established, which blocks the pre-auth exploitation path. Also disable Remote Desktop where it is not needed, block TCP port 3389 at the perimeter, and place RDP behind a VPN or gateway.",
      },
    },
    {
      "@type": "Question",
      name: "Was BlueKeep ever exploited in the wild?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. A public Metasploit exploit module was released in September 2019, and in November 2019 a mass campaign used BlueKeep to install cryptocurrency miners. That campaign was noisy and crashed many unpatched machines rather than spreading as a stealthy worm, but it confirmed the vulnerability was practically exploitable. BlueKeep remains in the CISA Known Exploited Vulnerabilities catalog.",
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
            BlueKeep (CVE-2019-0708): The Wormable RDP Vulnerability
          </h1>
          <p className="text-sm muted">Published December 13, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            In May 2019, Microsoft patched a Remote Desktop flaw so dangerous that it shipped fixes
            for Windows XP &mdash; five years after that operating system reached end of life.
            BlueKeep (CVE-2019-0708) was pre-authentication, wormable, and rated CVSS 9.8. It never
            became the second WannaCry that many feared, but the reasons it did not are as
            instructive as the bug itself. Here is how it works and how to stay safe from it.
          </p>
        </header>

        <img
          src="/blog/bluekeep.jpg"
          alt="BlueKeep CVE-2019-0708 remote desktop vulnerability"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What BlueKeep is, and why it scared everyone</h2>
          <p className="text-sm muted">
            BlueKeep is a remote code execution vulnerability in Microsoft&apos;s Remote Desktop
            Services (RDP), the protocol millions of Windows machines expose on TCP port 3389. Three
            properties made it a worst case. It is <strong>pre-authentication</strong>: an attacker
            needs no username or password. It requires <strong>no user interaction</strong>: nobody
            has to click anything. And it is <strong>wormable</strong>: a successful exploit could, in
            principle, propagate from one infected machine to the next without human help.
          </p>
          <p className="text-sm muted">
            Those are the same properties that made EternalBlue and the WannaCry outbreak so
            destructive in 2017, and the parallel was on everyone&apos;s mind. Microsoft, the NSA, and
            CISA all issued unusually direct advisories urging immediate patching. The CVSS 3.0 base
            score was <strong>9.8</strong> &mdash; network vector, low complexity, no privileges, no
            user interaction, with high impact to confidentiality, integrity, and availability. To
            understand what that score encodes, see{" "}
            <Link href="/blog/what-is-a-cve" className="underline">
              what a CVE is
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Timeline</h2>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 760 170" role="img" aria-label="BlueKeep disclosure timeline from May 2019 patch to November 2019 exploitation" className="w-full min-w-[640px]">
              <text x="380" y="22" fill="currentColor" fontSize="13" fontWeight="600" textAnchor="middle" opacity="0.85">
                From patch to in-the-wild exploitation
              </text>
              <line x1="70" y1="92" x2="700" y2="92" stroke="currentColor" opacity="0.35" />
              <g fill="currentColor" textAnchor="middle">
                <circle cx="100" cy="92" r="6" fill="var(--dg-accent,#2563eb)" />
                <text x="100" y="62" fontSize="12" fontWeight="600">May 14, 2019</text>
                <text x="100" y="120" fontSize="11" opacity="0.7">Microsoft patch</text>
                <text x="100" y="136" fontSize="11" opacity="0.7">CVSS 9.8</text>

                <circle cx="300" cy="92" r="6" fill="currentColor" />
                <text x="300" y="62" fontSize="12" fontWeight="600">May 30, 2019</text>
                <text x="300" y="120" fontSize="11" opacity="0.7">NSA and vendor</text>
                <text x="300" y="136" fontSize="11" opacity="0.7">urge patching</text>

                <circle cx="500" cy="92" r="6" fill="currentColor" />
                <text x="500" y="62" fontSize="12" fontWeight="600">Sep 6, 2019</text>
                <text x="500" y="120" fontSize="11" opacity="0.7">public Metasploit</text>
                <text x="500" y="136" fontSize="11" opacity="0.7">exploit module</text>

                <circle cx="680" cy="92" r="6" fill="currentColor" />
                <text x="680" y="62" fontSize="12" fontWeight="600">Nov 2019</text>
                <text x="680" y="120" fontSize="11" opacity="0.7">cryptomining</text>
                <text x="680" y="136" fontSize="11" opacity="0.7">campaign</text>
              </g>
            </svg>
          </div>
          <p className="text-sm muted">
            The gap between the May patch and the September public exploit gave defenders a rare head
            start. When mass exploitation finally arrived in November 2019, it delivered
            cryptocurrency miners and, tellingly, crashed many unpatched machines into a blue screen
            rather than quietly worming through them &mdash; a clumsy campaign compared to the doomsday
            worm that had been predicted.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How the exploit works</h2>
          <p className="text-sm muted">
            RDP multiplexes its session over named <em>virtual channels</em>. One of them,{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">MS_T120</code>,
            is an internal channel that Microsoft&apos;s own code sets up and binds to channel 31
            (0x1F) by default. The RDP driver assumes nothing else touches it.
          </p>
          <p className="text-sm muted">
            The bug is that a remote client can request MS_T120 be bound to a <em>different</em>{" "}
            channel number. When the connection is later torn down, the driver frees the channel&apos;s
            memory through one reference while another reference still points at it &mdash; a classic{" "}
            <strong>use-after-free</strong>. An attacker who controls what gets allocated into that
            freed memory can steer the corruption into arbitrary code execution in kernel context. The
            critical detail is <em>when</em> this happens: the vulnerable channel setup runs during the
            early connection phase, <strong>before authentication</strong>, which is why no credentials
            are required.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Affected versions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Windows version</th>
                  <th className="text-left py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Windows 7 / Server 2008 R2</td>
                  <td className="py-2">Vulnerable &mdash; patch in May 2019 update</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Windows Server 2008</td>
                  <td className="py-2">Vulnerable &mdash; patch in May 2019 update</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Windows XP / Server 2003</td>
                  <td className="py-2">Vulnerable &mdash; out-of-band patch despite end of life</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">Windows 8 / 8.1 / 10</td>
                  <td className="py-2">Not affected by CVE-2019-0708</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            That Microsoft shipped fixes for XP and Server 2003 &mdash; operating systems it had
            already stopped supporting &mdash; tells you how seriously it took the wormable potential.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Remediation and mitigation</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Patch (the real fix).</strong> Apply the May 2019 security update for the
              affected OS. This closes the use-after-free outright and is not optional. Prioritizing
              actively exploited flaws like this one is the whole point of the{" "}
              <Link href="/blog/cisa-kev-guide" className="underline">
                CISA KEV catalog
              </Link>
              .
            </li>
            <li>
              <strong>Enable Network Level Authentication (NLA).</strong> With NLA, the client must
              authenticate <em>before</em> a full RDP session is set up, which blocks the pre-auth path
              BlueKeep relies on. It is a strong mitigation but not a substitute for patching, since a
              valid credential still reaches the vulnerable code.
            </li>
            <li>
              <strong>Disable RDP where it is not needed,</strong> and block TCP port 3389 at the
              firewall. RDP exposed directly to the internet is the exposure that made BlueKeep a
              mass-scanning target in the first place.
            </li>
            <li>
              <strong>Put RDP behind a VPN or gateway</strong> so it is never directly reachable from
              untrusted networks.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The DejaBlue follow-ups</h2>
          <p className="text-sm muted">
            BlueKeep was not the end of the RDP story. In August 2019, Microsoft patched a cluster of
            related Remote Desktop RCE flaws &mdash; CVE-2019-1181, CVE-2019-1182, CVE-2019-1222, and
            CVE-2019-1226, collectively nicknamed <strong>DejaBlue</strong>. Unlike BlueKeep, several of
            these affected modern systems including Windows 10. The lesson mirrors other messy patch
            chains, like the string of follow-ups after{" "}
            <Link href="/blog/log4shell-cve-2021-44228" className="underline">
              Log4Shell
            </Link>
            : the first fix for a widely used component is rarely the last, and keeping a steady{" "}
            <Link href="/blog/patch-management-guide" className="underline">
              patch cadence
            </Link>{" "}
            matters more than any single emergency response.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Let us be precise about scope, because it matters. BlueKeep is a Windows host and network
            exposure &mdash; the fix is patching and NLA, and ScanRook is not a network RDP scanner
            that probes live hosts on port 3389. What ScanRook does is scan the artifacts you build and
            ship &mdash; container images, binaries, and archives &mdash; matching their components
            against known-vulnerability data. The durable lesson BlueKeep teaches is the one ScanRook
            supports directly: you can only fix what you know you have. Keeping an accurate inventory of
            the software in your artifacts, and re-scanning as new advisories publish, is how a newly
            disclosed CVE in a component you already ship surfaces in minutes instead of after an
            incident. For a host-service flaw like this, that inventory complements &mdash; it does not
            replace &mdash; disciplined OS patching.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Why is BlueKeep called wormable?</h3>
              <p className="text-sm muted mt-1">
                Because it needs no authentication and no user interaction, a successful exploit can be
                automated to attack the next reachable machine on its own, letting an infection spread
                without human help &mdash; the defining trait of a network worm.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does Network Level Authentication fully fix BlueKeep?</h3>
              <p className="text-sm muted mt-1">
                No. NLA blocks the pre-authentication exploitation path, which is a strong mitigation,
                but an attacker with valid credentials can still reach the vulnerable code. Patching is
                the only complete fix.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is Windows 10 affected by BlueKeep?</h3>
              <p className="text-sm muted mt-1">
                Not by CVE-2019-0708. BlueKeep affects Windows 7, Server 2008/2008 R2, and the
                out-of-support XP and Server 2003. Some later DejaBlue RDP flaws did affect Windows 10,
                which is a separate set of CVEs.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is BlueKeep still a risk today?</h3>
              <p className="text-sm muted mt-1">
                Only on unpatched legacy systems, but those still exist in the field. It remains in the
                CISA Known Exploited Vulnerabilities catalog, so any exposed, unpatched host is a real
                target.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Know what is inside every artifact you ship</h3>
          <p className="text-sm muted leading-relaxed">
            You can only patch what you can find. ScanRook inventories the components in your container
            images and binaries and matches them against multiple advisory sources, so a newly
            disclosed CVE in something you already ship surfaces fast.
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
            <Link href="/blog/regresshion-cve-2024-6387" className="underline">
              regreSSHion (CVE-2024-6387)
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
