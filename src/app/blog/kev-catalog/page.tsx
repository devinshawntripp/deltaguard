import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-08";

const title = `KEV Catalog: How to Use CISA's Exploited CVE List | ${APP_NAME}`;
const description =
  "The KEV catalog lists CVEs with confirmed exploitation. Its JSON schema, the BOD 22-01 due dates, and how to wire it into scan triage without over-trusting it.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "kev catalog",
    "cisa kev catalog",
    "known exploited vulnerabilities catalog",
    "kev list",
    "bod 22-01",
    "kev json feed",
    "kev vs epss",
    "exploited cve list",
    "vulnerability prioritization",
    "kev due date",
  ],
  alternates: { canonical: "/blog/kev-catalog" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/kev-catalog",
    images: ["/blog/kev-catalog.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/kev-catalog.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "KEV Catalog: How to Use CISA's Exploited CVE List",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/kev-catalog",
  image: "https://scanrook.io/blog/kev-catalog.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the KEV catalog?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The KEV catalog is CISA's Known Exploited Vulnerabilities catalog: a curated list of CVEs for which CISA has reliable evidence of active exploitation in the wild. It was established by Binding Operational Directive 22-01 in November 2021 and is published as a free JSON and CSV feed that anyone can consume.",
      },
    },
    {
      "@type": "Question",
      name: "Who has to comply with the KEV catalog?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "BOD 22-01 is binding on US federal civilian executive branch agencies, which must remediate listed vulnerabilities by the due date attached to each entry. Everyone else uses it voluntarily. Many private organisations adopt the catalog as a prioritisation input or bake it into internal SLAs even though no directive requires them to.",
      },
    },
    {
      "@type": "Question",
      name: "What fields does each KEV entry have?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each entry carries a cveID, vendorProject, product, vulnerabilityName, dateAdded, a short description, a requiredAction, a dueDate, a knownRansomwareCampaignUse flag, notes with reference links, and associated CWE identifiers. The dateAdded and dueDate pair is what drives remediation timelines.",
      },
    },
    {
      "@type": "Question",
      name: "Is KEV better than CVSS for prioritisation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They answer different questions. CVSS estimates how bad exploitation would be; KEV states that exploitation has actually happened. KEV is a far stronger signal for urgency, but it is a small, deliberately conservative list, so a CVE not being on it is not evidence of safety. Most teams combine KEV, EPSS and severity.",
      },
    },
    {
      "@type": "Question",
      name: "How often is the KEV catalog updated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CISA adds entries as exploitation evidence is confirmed, which happens irregularly — sometimes several times a week, sometimes not for a stretch. Because additions are event-driven rather than scheduled, pulling the feed on a daily cadence is the usual approach rather than trying to predict release timing.",
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
          <div className="text-xs uppercase tracking-wide muted">Prioritization</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            KEV Catalog: How to Use CISA&apos;s Exploited CVE List
          </h1>
          <p className="text-sm muted">Published November 8, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            The KEV catalog is the shortest useful list in vulnerability management. Out of the
            hundreds of thousands of published CVEs, it contains only those CISA has confirmed are
            being exploited in the wild &mdash; a few thousand at most. That scarcity is what makes it
            valuable, and also what makes it easy to misuse. This is how the catalog is built, what is
            in each record, and how to wire it into triage without treating absence from the list as
            an all-clear.
          </p>
        </header>

        <img
          src="/blog/kev-catalog.jpg"
          alt="CISA KEV catalog as a small confirmed-exploited subset of the wider CVE universe"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What the KEV catalog is</h2>
          <p className="text-sm muted">
            KEV stands for Known Exploited Vulnerabilities. The catalog was established in November
            2021 by CISA&apos;s Binding Operational Directive 22-01, which required US federal
            civilian executive branch agencies to remediate listed vulnerabilities within set
            timeframes. Its inclusion criteria are deliberately strict: a CVE gets added when it has
            an assigned identifier, there is reliable evidence of active exploitation in the wild, and
            there is a clear remediation action &mdash; a patch, an update, or a defined mitigation.
          </p>
          <p className="text-sm muted">
            That third criterion catches people out. A CVE can be under heavy exploitation and still
            not appear in KEV if no fix exists yet, because the directive is about remediation rather
            than awareness. The catalog is a to-do list with a deadline attached, not a threat
            intelligence feed. Read it that way and its shape makes sense.
          </p>
          <p className="text-sm muted">
            The data is free, requires no key, and is published as JSON and CSV. The JSON feed is the
            one you want for automation:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
            <code>{`curl -sL https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json \\
  -o kev.json

# how many entries, and how many tied to ransomware campaigns
jq '.count' kev.json
jq '[.vulnerabilities[] | select(.knownRansomwareCampaignUse == "Known")] | length' kev.json

# just the CVE IDs, for intersecting with a scan report
jq -r '.vulnerabilities[].cveID' kev.json | sort > kev-ids.txt`}</code>
          </pre>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What is in a KEV record</h2>
          <p className="text-sm muted">
            Each entry is small and consistent, which is a large part of why the catalog is pleasant
            to automate against:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Field</th>
                  <th className="text-left py-2 font-semibold">What it gives you</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">
                    <code className="text-xs">cveID</code>
                  </td>
                  <td className="py-2 align-top">The join key against any scan report or SBOM</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">
                    <code className="text-xs">vendorProject</code> /{" "}
                    <code className="text-xs">product</code>
                  </td>
                  <td className="py-2 align-top">
                    Coarse product identification &mdash; useful for eyeballing, too coarse for
                    matching
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">
                    <code className="text-xs">dateAdded</code> /{" "}
                    <code className="text-xs">dueDate</code>
                  </td>
                  <td className="py-2 align-top">
                    The remediation clock; the gap between them is the window agencies get
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">
                    <code className="text-xs">requiredAction</code>
                  </td>
                  <td className="py-2 align-top">
                    The prescribed fix, occasionally &ldquo;discontinue use of the product&rdquo;
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">
                    <code className="text-xs">knownRansomwareCampaignUse</code>
                  </td>
                  <td className="py-2 align-top">
                    Known or Unknown &mdash; the single best escalation flag in the file
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">
                    <code className="text-xs">cwes</code> / <code className="text-xs">notes</code>
                  </td>
                  <td className="py-2 align-top">
                    Weakness classes and advisory links for the write-up
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            The <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              cwes
            </code>{" "}
            array is worth a second look if you are trying to spot patterns in what actually gets
            exploited rather than what merely gets reported &mdash; the distinction we cover in{" "}
            <Link href="/blog/cve-vs-cwe" className="underline">
              CVE vs CWE
            </Link>
            .
          </p>
        </section>

        <img
          src="/blog/kev-catalog-2.jpg"
          alt="Prioritization funnel narrowing scan findings using the KEV catalog and EPSS scores"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Using the KEV catalog in triage
          </h2>
          <p className="text-sm muted">
            The catalog earns its place as one axis of a triage decision, not the whole decision. A
            CVE on the list is being exploited somewhere; that says nothing about whether the affected
            component is reachable in your deployment. A CVE absent from the list may still be trivially
            exploitable &mdash; the list is conservative and lags real-world activity. Pairing KEV with
            an exploitation-probability signal such as{" "}
            <Link href="/blog/epss-scores-explained" className="underline">
              EPSS
            </Link>{" "}
            gives you a usable two-axis view:
          </p>
          <figure className="grid gap-2">
            <div className="overflow-x-auto surface-card p-4">
              <svg
                viewBox="0 0 560 330"
                role="img"
                aria-label="A two-by-two matrix with KEV listing on one axis and EPSS probability on the other, showing four triage responses"
                className="w-full"
                style={{ minWidth: 480 }}
              >
                {[
                  { x: 110, y: 40, w: 200, h: 120, label: "Patch now", sub: "Confirmed exploited", hot: 2 },
                  { x: 310, y: 40, w: 200, h: 120, label: "Patch now", sub: "Exploited + trending", hot: 3 },
                  { x: 110, y: 160, w: 200, h: 120, label: "Normal queue", sub: "Severity-ordered", hot: 0 },
                  { x: 310, y: 160, w: 200, h: 120, label: "Watch closely", sub: "Likely exploit soon", hot: 1 },
                ].map((c) => (
                  <g key={c.label + c.x}>
                    <rect
                      x={c.x}
                      y={c.y}
                      width={c.w}
                      height={c.h}
                      rx={8}
                      fill="var(--dg-accent,#2563eb)"
                      fillOpacity={0.04 + c.hot * 0.055}
                      stroke="currentColor"
                      strokeOpacity={0.35}
                    />
                    <text
                      x={c.x + c.w / 2}
                      y={c.y + c.h / 2 - 4}
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="600"
                      fill="currentColor"
                    >
                      {c.label}
                    </text>
                    <text
                      x={c.x + c.w / 2}
                      y={c.y + c.h / 2 + 16}
                      textAnchor="middle"
                      fontSize="10.5"
                      fill="currentColor"
                      fillOpacity={0.65}
                    >
                      {c.sub}
                    </text>
                  </g>
                ))}
                <text x={95} y={104} textAnchor="end" fontSize="11" fontWeight="600" fill="currentColor">
                  In KEV
                </text>
                <text x={95} y={224} textAnchor="end" fontSize="11" fontWeight="600" fill="currentColor">
                  Not in KEV
                </text>
                <text x={210} y={302} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.7}>
                  Lower EPSS
                </text>
                <text x={410} y={302} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.7}>
                  Higher EPSS
                </text>
                <line x1={110} y1={288} x2={510} y2={288} stroke="currentColor" strokeOpacity={0.25} />
              </svg>
            </div>
            <figcaption className="text-xs muted">
              KEV membership crossed with EPSS probability. The quadrant labels are the response, not a
              score &mdash; no numbers here are measured, and reachability in your own deployment still
              overrides all four boxes.
            </figcaption>
          </figure>
          <p className="text-sm muted">
            A practical policy that survives contact with a real backlog: anything in KEV with the
            ransomware flag set jumps the queue immediately. Anything else in KEV gets a fixed
            remediation window borrowed from the catalog&apos;s own due dates. Everything else is
            ordered by EPSS and severity, then filtered by whether the vulnerable code path is
            actually reachable &mdash; the approach described in{" "}
            <Link href="/blog/how-to-triage-vulnerability-scan-results" className="underline">
              how to triage vulnerability scan results
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            KEV and container images
          </h2>
          <p className="text-sm muted">
            Most KEV entries name network-facing appliances, operating systems, browsers and
            enterprise products &mdash; the things attackers reach directly from the internet. That
            skew leads people to assume the catalog is irrelevant to container work. It is not, but the
            hits look different: they arrive through the OS packages in your base layer and through
            widely deployed libraries and runtimes rather than through your application code.
          </p>
          <p className="text-sm muted">
            A practical consequence is that KEV hits in an image are usually base-image problems, and
            base-image problems have one fix: rebuild on a newer base. That makes the intersection
            worth running against every image on a schedule rather than only at build time, because an
            image whose contents have not changed can acquire a KEV hit the day CISA adds an entry for
            a package it already contained. The scanning cadence question is the same one behind{" "}
            <Link href="/blog/automate-docker-base-image-updates" className="underline">
              automating base image updates
            </Link>
            .
          </p>
          <p className="text-sm muted">
            The other consequence is that reachability still matters enormously. A KEV-listed CVE in a
            command-line utility that exists in your image but is never invoked is a very different
            situation from the same CVE in the TLS library your service terminates connections with.
            The catalog tells you the vulnerability is exploited somewhere in the world; it cannot tell
            you whether your particular deployment exposes the vulnerable path. That judgement is
            yours, and it is the difference between a prioritised backlog and a panic.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Failure modes worth avoiding
          </h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Treating absence as safety.</strong> The catalog is small by design. Most
              exploited vulnerabilities never make it onto it, either because evidence never reached
              CISA or because no clean remediation exists.
            </li>
            <li>
              <strong>Matching on product names.</strong> The{" "}
              <code className="text-xs">vendorProject</code> and <code className="text-xs">product</code>{" "}
              strings are human-readable, not canonical identifiers. Join on{" "}
              <code className="text-xs">cveID</code> against your scan output and nothing else.
            </li>
            <li>
              <strong>Ignoring the due-date gap.</strong> The window between{" "}
              <code className="text-xs">dateAdded</code> and <code className="text-xs">dueDate</code>{" "}
              is CISA&apos;s own urgency signal. Short windows mean CISA considers the risk acute.
            </li>
            <li>
              <strong>Pulling the feed at scan time.</strong> Cache it. A daily refresh is plenty, and
              it keeps your scans deterministic and offline-capable.
            </li>
            <li>
              <strong>Forgetting the fix may not be a patch.</strong> Some required actions amount to
              &ldquo;stop using this product,&rdquo; which is a procurement conversation, not a ticket.
            </li>
          </ul>
        </section>

        <img
          src="/blog/kev-catalog-3.jpg"
          alt="Remediation deadlines derived from KEV catalog due dates visualised as a ladder"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            A scanner&apos;s job is to tell you what CVEs are present; the KEV catalog tells you which
            of those the world is already exploiting. Those are complementary, and the join between
            them only works if the first half is accurate. ScanRook matches every package it finds
            against OSV, NVD and Red Hat OVAL in parallel and reports the source and confidence tier
            for each finding, so when you intersect a report with{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              kev-ids.txt
            </code>{" "}
            you are intersecting against installed state rather than against filename guesses.
          </p>
          <p className="text-sm muted">
            We do not think KEV membership should be the only lens on a report, which is why findings
            carry enough context &mdash; source, affected package, fixed-in version where known
            &mdash; to build your own policy on top. Whether you gate a build on KEV hits, on severity,
            or on a blended score is a decision about your risk tolerance, and the report should give
            you the raw material for any of them. If you want the federal-directive context in more
            depth, our{" "}
            <Link href="/blog/cisa-kev-guide" className="underline">
              CISA KEV guide
            </Link>{" "}
            covers BOD 22-01 and the compliance angle.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is the KEV catalog?</h3>
              <p className="text-sm muted mt-1">
                CISA&apos;s curated list of CVEs with reliable evidence of active exploitation and a
                clear remediation action, published as a free JSON and CSV feed.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Who must comply with it?</h3>
              <p className="text-sm muted mt-1">
                US federal civilian executive branch agencies, under BOD 22-01. Everyone else adopts
                it voluntarily as a prioritisation input.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does KEV replace CVSS?</h3>
              <p className="text-sm muted mt-1">
                No. CVSS estimates potential impact; KEV confirms real-world exploitation. Use both,
                plus EPSS, and filter by reachability.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How do I automate against it?</h3>
              <p className="text-sm muted mt-1">
                Cache the JSON feed daily, extract the cveID list, and intersect it with your scan
                report on CVE identifier alone.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Find the KEV entries hiding in your images</h3>
          <p className="text-sm muted leading-relaxed">
            Intersecting KEV with a scan only helps if the scan found the package in the first place.
            Scan an image with ScanRook and check the report against today&apos;s catalog &mdash; every
            finding carries its source, so you can verify each hit rather than take it on faith.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--dg-accent,#2563eb)] text-white px-4 py-2 text-sm font-medium"
            >
              Start scanning
            </Link>
            <Link href="/docs" className="btn-secondary">
              Read the docs
            </Link>
          </div>
        </section>

        <footer className="border-t border-black/10 dark:border-white/10 pt-4 text-xs muted grid gap-2">
          <p>
            <strong>Related reading:</strong>{" "}
            <Link href="/blog/cisa-kev-guide" className="underline">
              The CISA KEV Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/epss-vulnerability-prioritization" className="underline">
              EPSS Vulnerability Prioritization
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/how-to-triage-vulnerability-scan-results" className="underline">
              How to Triage Scan Results
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
