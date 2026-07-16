import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-18";

const title = `EternalBlue (MS17-010): The Exploit Behind WannaCry | ${APP_NAME}`;
const description =
  "EternalBlue (MS17-010, CVE-2017-0144) is the SMBv1 exploit behind WannaCry. How it worked, affected Windows versions, impact, and how to remediate it.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "eternalblue",
    "ms17-010",
    "cve-2017-0144",
    "eternalblue exploit",
    "eternalblue wannacry",
    "smbv1 vulnerability",
    "eternalblue explained",
    "shadow brokers eternalblue",
    "eternalblue smb exploit",
    "how to patch eternalblue",
  ],
  alternates: { canonical: "/blog/eternalblue" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/eternalblue",
    images: ["/blog/eternalblue.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/eternalblue.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "EternalBlue (MS17-010): The Exploit Behind WannaCry",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/eternalblue",
  image: "https://scanrook.io/blog/eternalblue.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is EternalBlue?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "EternalBlue is an exploit for a remote code execution vulnerability in Microsoft's SMBv1 file-sharing protocol, addressed by security bulletin MS17-010 and tracked as CVE-2017-0144. Developed by the NSA and leaked by the Shadow Brokers in April 2017, it lets an unauthenticated attacker run kernel-level code on a vulnerable Windows machine over the network.",
      },
    },
    {
      "@type": "Question",
      name: "What CVE is EternalBlue?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "EternalBlue is most commonly identified as CVE-2017-0144. The underlying SMBv1 flaws were fixed together in Microsoft bulletin MS17-010, which covers a set of related identifiers from CVE-2017-0143 through CVE-2017-0148. CVE-2017-0144 carries a CVSS v3 base score of 8.1 (High).",
      },
    },
    {
      "@type": "Question",
      name: "What did EternalBlue enable?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It powered two of the most damaging cyber events in history. The WannaCry ransomware worm used EternalBlue in May 2017 to spread to hundreds of thousands of machines across roughly 150 countries, and the NotPetya destructive attack used it in June 2017, causing billions of dollars in damage to global companies.",
      },
    },
    {
      "@type": "Question",
      name: "How do you patch EternalBlue?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Apply Microsoft security update MS17-010, which Microsoft released in March 2017. As defense in depth, disable the legacy SMBv1 protocol entirely, block TCP port 445 at the network perimeter, and segment networks so SMB traffic cannot flow freely. Migrating off end-of-life Windows versions removes the risk for good.",
      },
    },
    {
      "@type": "Question",
      name: "Is EternalBlue still a threat today?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Years after the patch, unpatched and end-of-life Windows systems running SMBv1 are still found and exploited, and CVE-2017-0144 remains in the CISA Known Exploited Vulnerabilities catalog. EternalBlue is still bundled into malware and worming tools because so many exposed systems were never remediated.",
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
            EternalBlue (MS17-010): The Exploit Behind WannaCry
          </h1>
          <p className="text-sm muted">Published October 18, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            EternalBlue is the closest thing the security world has to a cautionary legend. A
            nation-state exploit for a flaw in Windows file sharing, stolen and leaked to the public,
            it went on to power WannaCry and NotPetya &mdash; two of the most destructive cyber events
            ever recorded &mdash; even though a patch had shipped weeks before. This is what the
            vulnerability was, how the exploit worked, the timeline that made it so damaging, and how
            you find and remediate it today.
          </p>
        </header>

        <img
          src="/blog/eternalblue.jpg"
          alt="EternalBlue SMBv1 exploit and the WannaCry outbreak"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What EternalBlue is</h2>
          <p className="text-sm muted">
            EternalBlue is an exploit that targets a remote code execution vulnerability in
            <strong> SMBv1</strong>, the first version of Microsoft&apos;s Server Message Block
            file-sharing protocol. Microsoft addressed it in bulletin{" "}
            <strong>MS17-010</strong>, and the flaw EternalBlue is best known for is{" "}
            <strong>CVE-2017-0144</strong>, one of a cluster of related SMBv1 issues (CVE-2017-0143
            through CVE-2017-0148) fixed in the same update. CVE-2017-0144 carries a CVSS v3 base score
            of <strong>8.1 (High)</strong>.
          </p>
          <p className="text-sm muted">
            What made it extraordinary was its origin. EternalBlue was developed by the U.S. National
            Security Agency as part of an offensive toolkit, then stolen and published by a group
            calling itself the <strong>Shadow Brokers</strong>. Overnight, a weapons-grade,
            wormable remote code execution exploit for a protocol running on millions of machines was
            in the hands of anyone who wanted it &mdash; and unlike a logic bug that needs a user to
            click something, this one needed nothing but a reachable SMB port.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The timeline that made it catastrophic</h2>
          <p className="text-sm muted">
            The remarkable thing about EternalBlue is that the patch came <em>first</em>. Microsoft
            shipped MS17-010 a full month before the exploit leaked, yet the worms that followed still
            found enormous numbers of unpatched machines.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 460 268" role="img" aria-label="Timeline of the EternalBlue patch, leak, and the WannaCry and NotPetya outbreaks in 2017" className="w-full max-w-md mx-auto text-[color:var(--dg-accent,#2563eb)]">
              <line x1="20" y1="30" x2="20" y2="248" stroke="currentColor" strokeWidth="2" opacity="0.3" />
              <circle cx="20" cy="38" r="9" className="fill-current" opacity="0.85" /><text x="16.5" y="42" fontSize="10" fill="#fff">1</text>
              <text x="40" y="36" fontSize="12" className="fill-current" opacity="0.95">Mar 14, 2017</text>
              <text x="40" y="51" fontSize="11" className="fill-current" opacity="0.65">Microsoft ships the MS17-010 patch</text>
              <circle cx="20" cy="108" r="9" className="fill-current" opacity="0.85" /><text x="16.5" y="112" fontSize="10" fill="#fff">2</text>
              <text x="40" y="106" fontSize="12" className="fill-current" opacity="0.95">Apr 14, 2017</text>
              <text x="40" y="121" fontSize="11" className="fill-current" opacity="0.65">Shadow Brokers leak EternalBlue</text>
              <circle cx="20" cy="178" r="9" className="fill-current" opacity="1" /><text x="16.5" y="182" fontSize="10" fill="#fff">3</text>
              <text x="40" y="176" fontSize="12" className="fill-current" opacity="0.95">May 12, 2017</text>
              <text x="40" y="191" fontSize="11" className="fill-current" opacity="0.65">WannaCry ransomware worm spreads worldwide</text>
              <circle cx="20" cy="248" r="9" className="fill-current" opacity="1" /><text x="16.5" y="252" fontSize="10" fill="#fff">4</text>
              <text x="40" y="246" fontSize="12" className="fill-current" opacity="0.95">Jun 27, 2017</text>
              <text x="40" y="261" fontSize="11" className="fill-current" opacity="0.65">NotPetya destructive attack hits global firms</text>
            </svg>
          </div>
          <p className="text-sm muted">
            The gap between the patch and the outbreaks is the whole lesson. Patch availability is not
            patch deployment, and a month was not enough time for the world&apos;s Windows estate to
            update &mdash; a pattern that repeats with every headline vulnerability since.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How the exploit worked</h2>
          <p className="text-sm muted">
            The vulnerability lived in the way the SMBv1 server (the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">srv.sys</code>{" "}
            kernel driver) handled specially crafted requests. When processing certain SMB messages,
            the server miscalculated the size of a buffer while converting between two representations
            of a File Extended Attributes list &mdash; a type-size mismatch that let an attacker send
            more data than the allocated buffer could hold. The result was a controlled overflow in
            the non-paged kernel pool, which a carefully built packet sequence turned into remote code
            execution running with kernel privileges.
          </p>
          <p className="text-sm muted">
            Because it executed in the kernel over the network with no authentication, EternalBlue was
            the ideal worm engine. Attackers paired it with a kernel backdoor implant called{" "}
            <strong>DoublePulsar</strong> to maintain access and load further payloads. The exploit
            reached the target over <strong>TCP port 445</strong>, the port SMB uses &mdash; which is
            exactly why blocking 445 at the perimeter is such an effective mitigation. Unlike a logic
            flaw such as{" "}
            <Link href="/blog/log4shell-cve-2021-44228" className="underline">
              Log4Shell
            </Link>
            , which needs an application to log attacker input, EternalBlue needed only network
            reachability to a listening service.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Affected systems</h2>
          <p className="text-sm muted">
            The flaw affected essentially every Windows version that still spoke SMBv1 at the time,
            client and server alike:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Category</th>
                  <th className="text-left py-2 font-semibold">Affected versions</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Client Windows</td>
                  <td className="py-2">Windows XP, Vista, 7, 8.1, and early Windows 10 builds</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Server Windows</td>
                  <td className="py-2">Windows Server 2003, 2008, 2008 R2, 2012, 2012 R2, and 2016</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">Common factor</td>
                  <td className="py-2">The legacy SMBv1 protocol enabled and reachable on TCP port 445</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            After WannaCry, Microsoft took the unusual step of issuing emergency patches for
            already end-of-life systems like Windows XP and Server 2003 &mdash; a measure of how
            severe and widespread the exposure was.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The impact: WannaCry and NotPetya</h2>
          <p className="text-sm muted">
            In May 2017, the <strong>WannaCry</strong> ransomware worm used EternalBlue to self-propagate
            across networks, encrypting machines and demanding Bitcoin. It reached hundreds of thousands
            of computers in roughly 150 countries within days, disrupting hospitals, telecoms, and
            manufacturers &mdash; the UK&apos;s National Health Service was among the hardest hit. Its
            spread was slowed when a researcher registered a domain that acted as an accidental kill
            switch built into the malware.
          </p>
          <p className="text-sm muted">
            Weeks later, <strong>NotPetya</strong> used EternalBlue (alongside the related EternalRomance
            exploit and credential theft) as part of a destructive attack disguised as ransomware. It
            caused an estimated billions of dollars in damage to multinational companies in shipping,
            pharmaceuticals, and logistics, and is widely regarded as one of the costliest cyberattacks
            in history. Both events ran on the same unpatched SMBv1 exposure.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How to remediate</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>Apply MS17-010.</strong> This is the actual fix. Every supported Windows version
              has an update; deploy it everywhere SMB is present.
            </li>
            <li>
              <strong>Disable SMBv1 entirely.</strong> The protocol is obsolete and should be turned
              off regardless of patch status. On modern Windows it can be removed as an optional
              feature.
            </li>
            <li>
              <strong>Block TCP port 445 at the perimeter.</strong> SMB should never be exposed to the
              internet. Filtering 445 (and 139) at the network edge stops external exploitation
              outright.
            </li>
            <li>
              <strong>Segment internal networks.</strong> WannaCry and NotPetya spread laterally
              because SMB flowed freely inside flat networks. Segmentation contains a worm even if one
              host falls.
            </li>
            <li>
              <strong>Retire end-of-life Windows.</strong> Machines that cannot receive current
              patches are permanent liabilities; migrating off them is the durable fix.
            </li>
          </ul>
          <p className="text-sm muted">
            EternalBlue&apos;s presence in the{" "}
            <Link href="/blog/cisa-kev-guide" className="underline">
              CISA Known Exploited Vulnerabilities catalog
            </Link>{" "}
            reflects that it is still actively used &mdash; the remediation above is not historical
            housekeeping, it is current advice. The broader discipline of getting patches deployed, not
            just available, is the subject of our{" "}
            <Link href="/blog/patch-management-guide" className="underline">
              patch management guide
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits &mdash; and where it does not</h2>
          <p className="text-sm muted">
            Honesty first: EternalBlue is a host-level network-service flaw, and remediating it is a
            job for OS patching, disabling SMBv1, and network controls. ScanRook is not a live network
            vulnerability scanner and does not probe running SMB services. What it does is adjacent and
            still valuable &mdash; it reads the software you build and ship and matches every installed
            component inside container images, binaries, and source archives against OSV, NVD, and
            vendor advisory data, so known-vulnerable software versions are caught before they deploy.
          </p>
          <p className="text-sm muted">
            The lesson EternalBlue teaches maps directly onto artifact scanning: the danger was not a
            mysterious zero-day but a <em>known</em> flaw with an available patch that never got
            applied. Continuous scanning of the artifacts you produce is how you avoid shipping the
            next known-and-fixable vulnerability into production. For the difference between a flaw and
            a fully weaponized threat like this one, see{" "}
            <Link href="/blog/what-is-a-cve" className="underline">
              what a CVE is
            </Link>
            , and for other historic exploited flaws, our deep dive on{" "}
            <Link href="/blog/shellshock-cve-2014-6271" className="underline">
              Shellshock
            </Link>{" "}
            covers a similar story.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Who created EternalBlue?</h3>
              <p className="text-sm muted mt-1">
                It was developed by the U.S. National Security Agency as an offensive cyber tool, then
                stolen and published by the Shadow Brokers group in April 2017, putting a
                nation-state exploit into public hands.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Was there a patch before WannaCry?</h3>
              <p className="text-sm muted mt-1">
                Yes. Microsoft released MS17-010 on March 14, 2017, nearly two months before WannaCry
                struck on May 12. The outbreak spread through machines that had not applied the
                available update.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What port does EternalBlue use?</h3>
              <p className="text-sm muted mt-1">
                TCP port 445, which SMB uses for direct hosting over TCP. Blocking 445 (and legacy port
                139) at the network perimeter is a highly effective mitigation against external
                exploitation.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is SMBv1 still needed for anything?</h3>
              <p className="text-sm muted mt-1">
                Almost never. SMBv1 is obsolete and disabled by default on modern Windows. Only some
                very old devices require it; the correct path is to replace those systems rather than
                keep the protocol alive.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Catch the known-and-fixable before it ships</h3>
          <p className="text-sm muted leading-relaxed">
            EternalBlue was a known flaw with an available patch. ScanRook reads the installed
            components in your container images, binaries, and source archives and matches them
            against OSV, NVD, and vendor advisories, so vulnerable software with a fix already
            published never makes it into your deployed artifact.
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
            <Link href="/blog/shellshock-cve-2014-6271" className="underline">
              Shellshock (CVE-2014-6271)
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/heartbleed-cve-2014-0160" className="underline">
              Heartbleed (CVE-2014-0160)
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
