import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-10-10";

const title = `CIS Controls v8 Explained: The 18 Critical Security Controls | ${APP_NAME}`;
const description =
  "The CIS Controls are 18 prioritized safeguards for cyber defense. What each control and Implementation Group covers, and where vulnerability scanning fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "cis controls",
    "cis critical security controls",
    "cis controls v8",
    "cis 18 controls",
    "cis controls implementation groups",
    "cis controls list",
    "cis controls vs nist",
    "center for internet security controls",
    "cis controls vulnerability management",
    "cis controls ig1",
  ],
  alternates: { canonical: "/blog/cis-controls" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/cis-controls",
    images: ["/blog/cis-controls.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/cis-controls.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "CIS Controls v8 Explained: The 18 Critical Security Controls",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/cis-controls",
  image: "https://scanrook.io/blog/cis-controls.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are the CIS Controls?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The CIS Controls are a prioritized set of 18 defensive actions, maintained by the Center for Internet Security, that protect organizations against the most common cyber attacks. Each control breaks down into concrete safeguards, and the set is community-developed from real-world attack and defense data rather than derived from a single regulation.",
      },
    },
    {
      "@type": "Question",
      name: "How many CIS Controls are there in version 8?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CIS Controls v8 has 18 controls and just over 150 safeguards. The count dropped from 20 in earlier versions because the update reorganized controls by activity rather than by who manages the device, merging several older controls in the process. Version 8.1, released in 2024, aligns the framework with NIST Cybersecurity Framework 2.0.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between CIS Controls and CIS Benchmarks?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The CIS Controls are a high-level, prioritized program of what to do across your whole security posture. CIS Benchmarks are detailed, product-specific configuration guides that tell you how to harden one thing, such as Ubuntu, Docker, or Kubernetes. The Controls set direction; the Benchmarks implement secure configuration on individual systems.",
      },
    },
    {
      "@type": "Question",
      name: "What are CIS Implementation Groups?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Implementation Groups (IG1, IG2, IG3) are tiers that tell you which safeguards to adopt first based on your resources and risk. IG1 is essential cyber hygiene, a foundational set of 56 safeguards every organization should meet. IG2 and IG3 add safeguards for organizations handling more sensitive data or facing more sophisticated threats.",
      },
    },
    {
      "@type": "Question",
      name: "Which CIS Control covers vulnerability scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Control 7, Continuous Vulnerability Management, is the primary one: it calls for automated scanning and a remediation process on a defined cadence. It works with Control 2 (inventory of software assets) and Control 16 (application software security), because you cannot scan or remediate components you have not inventoried first.",
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
          <div className="text-xs uppercase tracking-wide muted">Compliance</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            CIS Controls v8 Explained: The 18 Critical Security Controls
          </h1>
          <p className="text-sm muted">Published October 10, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            Most security frameworks tell you <em>what</em> good looks like. The CIS Controls tell
            you what to do first. They are a prioritized, community-maintained list of the defensive
            actions that stop the attacks organizations actually face &mdash; and unlike a
            regulation, they are practical enough to work through top to bottom. Here is what the 18
            controls are, how the Implementation Groups scope them to your organization, and where
            vulnerability scanning fits.
          </p>
        </header>

        <img
          src="/blog/cis-controls.jpg"
          alt="The 18 CIS Critical Security Controls"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What the CIS Controls are</h2>
          <p className="text-sm muted">
            The CIS Critical Security Controls are maintained by the{" "}
            <strong>Center for Internet Security</strong> (CIS), a nonprofit that develops
            security guidance through a community of practitioners. The Controls began life as the
            &ldquo;SANS Top 20&rdquo; and were later stewarded by CIS as the CIS Top 20; the current
            release, <strong>version 8</strong>, consolidates the list into <strong>18 controls</strong>{" "}
            and just over 150 individual safeguards. Version 8.1, published in 2024, is a
            maintenance update that adds a governance emphasis and maps the Controls onto the NIST
            Cybersecurity Framework 2.0.
          </p>
          <p className="text-sm muted">
            The defining feature is <em>prioritization</em>. The Controls are ordered and grouped so
            that a small team with a limited budget can start with the safeguards that block the
            most common attacks and add depth over time. That makes them a useful backbone even for
            organizations whose formal obligations come from another framework entirely &mdash; the
            Controls are frequently used as the practical implementation layer beneath compliance
            requirements. For the broader picture of scanning duties across frameworks, see our{" "}
            <Link href="/blog/compliance-scanning-guide" className="underline">
              vulnerability scanning for compliance guide
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The 18 controls</h2>
          <p className="text-sm muted">
            Version 8 organizes the controls by the activity they govern rather than by which team
            owns the device. The full list:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">#</th>
                  <th className="text-left py-2 pr-4 font-semibold">Control</th>
                  <th className="text-left py-2 font-semibold">What it covers</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5"><td className="py-2 pr-4 align-top">1</td><td className="py-2 pr-4 align-top">Inventory &amp; Control of Enterprise Assets</td><td className="py-2">Know every device that connects</td></tr>
                <tr className="border-b border-black/5 dark:border-white/5"><td className="py-2 pr-4 align-top">2</td><td className="py-2 pr-4 align-top">Inventory &amp; Control of Software Assets</td><td className="py-2">Know every application and library</td></tr>
                <tr className="border-b border-black/5 dark:border-white/5"><td className="py-2 pr-4 align-top">3</td><td className="py-2 pr-4 align-top">Data Protection</td><td className="py-2">Classify, handle, and retain data safely</td></tr>
                <tr className="border-b border-black/5 dark:border-white/5"><td className="py-2 pr-4 align-top">4</td><td className="py-2 pr-4 align-top">Secure Configuration of Assets &amp; Software</td><td className="py-2">Harden defaults on systems and apps</td></tr>
                <tr className="border-b border-black/5 dark:border-white/5"><td className="py-2 pr-4 align-top">5</td><td className="py-2 pr-4 align-top">Account Management</td><td className="py-2">Manage the lifecycle of accounts</td></tr>
                <tr className="border-b border-black/5 dark:border-white/5"><td className="py-2 pr-4 align-top">6</td><td className="py-2 pr-4 align-top">Access Control Management</td><td className="py-2">Grant least privilege, use MFA</td></tr>
                <tr className="border-b border-black/5 dark:border-white/5"><td className="py-2 pr-4 align-top">7</td><td className="py-2 pr-4 align-top">Continuous Vulnerability Management</td><td className="py-2">Scan, prioritize, and remediate flaws</td></tr>
                <tr className="border-b border-black/5 dark:border-white/5"><td className="py-2 pr-4 align-top">8</td><td className="py-2 pr-4 align-top">Audit Log Management</td><td className="py-2">Collect and review logs</td></tr>
                <tr className="border-b border-black/5 dark:border-white/5"><td className="py-2 pr-4 align-top">9</td><td className="py-2 pr-4 align-top">Email &amp; Web Browser Protections</td><td className="py-2">Reduce the most common entry points</td></tr>
                <tr className="border-b border-black/5 dark:border-white/5"><td className="py-2 pr-4 align-top">10</td><td className="py-2 pr-4 align-top">Malware Defenses</td><td className="py-2">Detect and block malicious code</td></tr>
                <tr className="border-b border-black/5 dark:border-white/5"><td className="py-2 pr-4 align-top">11</td><td className="py-2 pr-4 align-top">Data Recovery</td><td className="py-2">Back up and restore reliably</td></tr>
                <tr className="border-b border-black/5 dark:border-white/5"><td className="py-2 pr-4 align-top">12</td><td className="py-2 pr-4 align-top">Network Infrastructure Management</td><td className="py-2">Keep network gear current and secure</td></tr>
                <tr className="border-b border-black/5 dark:border-white/5"><td className="py-2 pr-4 align-top">13</td><td className="py-2 pr-4 align-top">Network Monitoring &amp; Defense</td><td className="py-2">Detect and respond to network threats</td></tr>
                <tr className="border-b border-black/5 dark:border-white/5"><td className="py-2 pr-4 align-top">14</td><td className="py-2 pr-4 align-top">Security Awareness &amp; Skills Training</td><td className="py-2">Train people to resist attacks</td></tr>
                <tr className="border-b border-black/5 dark:border-white/5"><td className="py-2 pr-4 align-top">15</td><td className="py-2 pr-4 align-top">Service Provider Management</td><td className="py-2">Manage third-party and vendor risk</td></tr>
                <tr className="border-b border-black/5 dark:border-white/5"><td className="py-2 pr-4 align-top">16</td><td className="py-2 pr-4 align-top">Application Software Security</td><td className="py-2">Secure the software you build and run</td></tr>
                <tr className="border-b border-black/5 dark:border-white/5"><td className="py-2 pr-4 align-top">17</td><td className="py-2 pr-4 align-top">Incident Response Management</td><td className="py-2">Prepare to detect and recover</td></tr>
                <tr><td className="py-2 pr-4 align-top">18</td><td className="py-2 pr-4 align-top">Penetration Testing</td><td className="py-2">Test defenses the way attackers would</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            Notice that inventory comes first. Controls 1 and 2 sit at the top because you cannot
            defend, patch, or monitor assets you do not know you have &mdash; a theme that repeats
            throughout the framework.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Implementation Groups: where to start</h2>
          <p className="text-sm muted">
            The safeguards inside each control are sorted into three <strong>Implementation Groups</strong>{" "}
            so you are not asked to do everything at once. IG1 is a foundational set that CIS calls
            &ldquo;essential cyber hygiene&rdquo; &mdash; the minimum every organization should meet.
            IG2 builds on IG1 for organizations managing more sensitive data across multiple
            departments, and IG3 adds the safeguards needed to defend against targeted, sophisticated
            attackers. The groups are cumulative: IG2 includes all of IG1, and IG3 includes all of
            IG2.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 440 150" role="img" aria-label="Cumulative CIS safeguards in scope by Implementation Group in CIS Controls v8" className="w-full max-w-lg mx-auto text-[color:var(--dg-accent,#2563eb)]">
              <text x="0" y="14" fontSize="11" className="fill-current" opacity="0.7">Safeguards in scope (cumulative) &mdash; CIS Controls v8</text>
              <text x="0" y="44" fontSize="12" className="fill-current" opacity="0.9">IG1</text>
              <rect x="42" y="32" width="110" height="18" rx="3" className="fill-current" opacity="0.35" />
              <text x="160" y="46" fontSize="11" className="fill-current" opacity="0.85">56</text>
              <text x="0" y="80" fontSize="12" className="fill-current" opacity="0.9">IG2</text>
              <rect x="42" y="68" width="255" height="18" rx="3" className="fill-current" opacity="0.6" />
              <text x="305" y="82" fontSize="11" className="fill-current" opacity="0.85">130</text>
              <text x="0" y="116" fontSize="12" className="fill-current" opacity="0.9">IG3</text>
              <rect x="42" y="104" width="300" height="18" rx="3" className="fill-current" opacity="0.85" />
              <text x="350" y="118" fontSize="11" className="fill-current" opacity="0.85">153</text>
            </svg>
          </div>
          <p className="text-sm muted">
            If you are just starting, target IG1 across all 18 controls before you go deep on any
            single one. Breadth of essential hygiene beats depth in one area, because attackers look
            for the missing basics, not the missing advanced control.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">CIS Controls vs Benchmarks vs NIST</h2>
          <p className="text-sm muted">
            These three names get used interchangeably and they should not be. The{" "}
            <strong>CIS Controls</strong> are the prioritized <em>program</em> &mdash; the what and
            the in-what-order. The <strong>CIS Benchmarks</strong> are the detailed, product-specific
            <em> how</em>: hundreds of pages of exact configuration settings for a given operating
            system, database, browser, or container platform. When Control 4 says &ldquo;securely
            configure your assets,&rdquo; the relevant CIS Benchmark is the checklist that tells you
            precisely which settings to change. We cover those hardening guides, and the tools that
            audit against them, in{" "}
            <Link href="/blog/cis-benchmarks-explained" className="underline">
              CIS Benchmarks explained
            </Link>
            .
          </p>
          <p className="text-sm muted">
            The <strong>NIST Cybersecurity Framework</strong> is a higher-level structure of
            functions (Govern, Identify, Protect, Detect, Respond, Recover). It is complementary, not
            competing: CIS publishes an official mapping so you can satisfy NIST CSF outcomes using
            CIS safeguards as the concrete steps. In practice, many teams use NIST CSF to talk to
            leadership and the CIS Controls to tell engineers what to build.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where vulnerability scanning fits</h2>
          <p className="text-sm muted">
            Three controls form the spine of a vulnerability program. <strong>Control 2</strong>{" "}
            (inventory of software assets) requires you to know every application and library you
            run. <strong>Control 7</strong> (continuous vulnerability management) requires automated,
            authenticated scanning on a defined cadence plus a documented remediation process.{" "}
            <strong>Control 16</strong> (application software security) extends that to the code and
            dependencies you build yourself. The connective tissue is that Control 7 is only as good
            as the Control 2 inventory it runs against &mdash; unlisted software does not get
            scanned.
          </p>
          <p className="text-sm muted">
            This is exactly where a software inventory and a scanner reinforce each other. An SBOM
            produced from your build feeds Control 2, and a scanner that reads that inventory and
            matches it against advisory data delivers on Control 7. For the operational side of
            closing findings once you have them, see our{" "}
            <Link href="/blog/vulnerability-management-guide" className="underline">
              vulnerability management lifecycle guide
            </Link>
            , and for cluster configuration checks against the CIS Benchmark specifically, see{" "}
            <Link href="/blog/kube-bench-cis-scanning" className="underline">
              kube-bench
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A practical starting checklist</h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>Build an asset and software inventory first &mdash; Controls 1 and 2 unblock everything else.</li>
            <li>Scope to IG1 safeguards across all 18 controls before deepening any single control.</li>
            <li>Stand up authenticated, automated scanning on a schedule, with a defined remediation SLA (Control 7).</li>
            <li>Turn on MFA and least-privilege access (Controls 5 and 6) &mdash; cheap safeguards that block common attacks.</li>
            <li>Use the matching CIS Benchmark to harden each platform you run (Control 4).</li>
            <li>Track your safeguard coverage over time so you can show measurable progress, and document how it maps to any regulatory obligations &mdash; consult counsel where a specific law is in scope.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How ScanRook supports the Controls</h2>
          <p className="text-sm muted">
            ScanRook maps most directly onto Controls 2, 7, and 16. It reads the actual installed
            packages inside container images, binaries, and source archives to produce a component
            inventory (Control 2), matches every component against OSV, NVD, and vendor advisory data
            for continuous vulnerability management (Control 7), and surfaces vulnerable dependencies
            in the software you build before it ships (Control 16). It does not replace the whole
            program &mdash; account management, logging, and training are outside a scanner&apos;s
            scope &mdash; but it turns the inventory-and-scan spine of the CIS Controls into something
            you can automate in CI. The multi-source data also feeds SBOM output, so your Control 2
            inventory and Control 7 findings come from the same scan.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Are the CIS Controls free to use?</h3>
              <p className="text-sm muted mt-1">
                Yes. The CIS Controls and their supporting materials are freely available from the
                Center for Internet Security. You can adopt them without a license; CIS also offers
                paid tooling and membership, but the framework itself carries no fee.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Do the CIS Controls satisfy compliance requirements?</h3>
              <p className="text-sm muted mt-1">
                They are not a law, but they map onto frameworks like NIST CSF, PCI DSS, and others,
                so implementing them helps meet many obligations. Whether that satisfies a specific
                requirement depends on the regulation &mdash; consult counsel for a formal answer.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How often are the CIS Controls updated?</h3>
              <p className="text-sm muted mt-1">
                Periodically, as attack and defense data changes. Version 8 landed in 2021 and
                version 8.1 in 2024, the latter aligning the set with NIST Cybersecurity Framework
                2.0 rather than reworking the 18 controls themselves.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Which Implementation Group should a small business target?</h3>
              <p className="text-sm muted mt-1">
                IG1, the essential cyber hygiene tier of 56 safeguards. It is designed for
                organizations with limited resources and provides the highest return per unit of
                effort. Move to IG2 as you take on more sensitive data or regulatory scope.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Deliver on Controls 2, 7, and 16 in one scan</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook inventories the components inside your container images and binaries and matches
            every one against OSV, NVD, and vendor advisories &mdash; the software inventory and
            continuous vulnerability management the CIS Controls ask for, automated in CI. Upload an
            artifact to see the findings and the SBOM together.
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
            <Link href="/blog/cis-benchmarks-explained" className="underline">
              CIS Benchmarks Explained
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/compliance-scanning-guide" className="underline">
              Scanning for Compliance
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/vulnerability-management-guide" className="underline">
              Vulnerability Management Guide
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
