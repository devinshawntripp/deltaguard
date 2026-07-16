import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-26";

const title = `NIST 800-53: A Practical Guide to Security Controls | ${APP_NAME}`;
const description =
  "NIST SP 800-53 is the control catalog behind FISMA and FedRAMP. Its control families, the RMF, the controls scanning maps to, and where ScanRook fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "nist 800-53",
    "nist sp 800-53",
    "nist 800-53 controls",
    "nist 800-53 rev 5",
    "nist 800-53 control families",
    "fisma compliance",
    "risk management framework",
    "ra-5 vulnerability scanning",
    "nist security controls",
    "fedramp controls",
  ],
  alternates: { canonical: "/blog/nist-800-53" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/nist-800-53",
    images: ["/blog/nist-800-53.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/nist-800-53.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "NIST 800-53: A Practical Guide to Security Controls",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/nist-800-53",
  image: "https://scanrook.io/blog/nist-800-53.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is NIST 800-53?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NIST Special Publication 800-53 is a catalog of security and privacy controls for information systems, published by the US National Institute of Standards and Technology. The current version is Revision 5, released in September 2020. It is mandatory for US federal information systems under FISMA and underpins programs such as FedRAMP, and it is widely adopted voluntarily by private organizations.",
      },
    },
    {
      "@type": "Question",
      name: "How many control families are in NIST 800-53?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Revision 5 organizes controls into 20 families, each with a two-letter identifier — for example AC (Access Control), AU (Audit and Accountability), CM (Configuration Management), IA (Identification and Authentication), RA (Risk Assessment), SC (System and Communications Protection), and SI (System and Information Integrity). Rev 5 added the SR (Supply Chain Risk Management) and PT (PII Processing and Transparency) families.",
      },
    },
    {
      "@type": "Question",
      name: "Which 800-53 controls require vulnerability scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "RA-5 (Vulnerability Monitoring and Scanning) is the most direct: it requires scanning systems and applications for vulnerabilities on a defined frequency. It works alongside SI-2 (Flaw Remediation), CM-8 (System Component Inventory), SA-11 (Developer Testing), and the SR supply-chain family. Together these controls expect you to know your components, scan them, and remediate findings on a schedule.",
      },
    },
    {
      "@type": "Question",
      name: "What is the Risk Management Framework (RMF)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The RMF, defined in NIST SP 800-37, is the seven-step process for applying 800-53 controls: Prepare, Categorize, Select, Implement, Assess, Authorize, and Monitor. Control baselines from SP 800-53B are selected based on the system's impact level, then implemented, assessed, and continuously monitored — where ongoing vulnerability scanning lives.",
      },
    },
    {
      "@type": "Question",
      name: "Does a scanner make me NIST 800-53 compliant?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No single tool makes you compliant. 800-53 spans people, process, and technology across 20 control families, most of which a scanner does not touch. A vulnerability scanner supplies technical evidence for specific controls like RA-5, SI-2, and CM-8, but authorization decisions rest with your assessor and authorizing official. Consult your assessor or counsel on what satisfies each control.",
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
            NIST 800-53: A Practical Guide to Security Controls
          </h1>
          <p className="text-sm muted">Published September 26, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            NIST 800-53 is the control catalog most US government security programs are built on, and
            it has quietly become a common reference far beyond government. It is long &mdash;
            hundreds of controls across twenty families &mdash; but the structure is learnable, and a
            handful of controls map directly to the vulnerability scanning most engineering teams
            already do. This guide explains what 800-53 is, how it is organized, and which controls
            your scanning program helps satisfy. It is not legal advice; where a requirement applies
            to your system, consult your assessor or counsel.
          </p>
        </header>

        <img
          src="/blog/nist-800-53.jpg"
          alt="NIST 800-53 security controls explained"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What NIST 800-53 is</h2>
          <p className="text-sm muted">
            NIST Special Publication 800-53 is a catalog of security and privacy controls for
            information systems, published by the National Institute of Standards and Technology. The
            current edition is <strong>Revision 5</strong>, released in September 2020. It is not a
            checklist you pass or fail; it is a library of controls you select from, tailor, and
            implement based on how sensitive the system is.
          </p>
          <p className="text-sm muted">
            It carries legal weight in the US federal government. Under the Federal Information
            Security Modernization Act (FISMA), federal agencies must secure their systems using
            800-53 controls, with the required baseline set by FIPS 200 and the impact
            categorization from FIPS 199. The same catalog underpins <strong>FedRAMP</strong>, the
            authorization program for cloud services sold to the government. Plenty of private
            organizations adopt 800-53 voluntarily, too, because it is comprehensive, free, and
            cross-mapped to other frameworks.
          </p>
          <p className="text-sm muted">
            Revision 5 made some notable changes: it rewrote controls to be outcome-based (removing
            the old &ldquo;the information system&rdquo; phrasing so controls apply to any system,
            organization, or process), fully integrated privacy controls, and added two families
            &mdash; Supply Chain Risk Management and PII Processing and Transparency.
          </p>
          <p className="text-sm muted">
            One point that trips people up: 800-53 is a <em>catalog</em>, and a catalog is not a
            standard you certify against directly. You do not get a &ldquo;NIST 800-53 certificate.&rdquo;
            Instead, a program selects a baseline appropriate to the system, implements the chosen
            controls, and has them assessed &mdash; usually as part of an authorization under FISMA,
            FedRAMP, or an internal risk framework. That is why two organizations can both &ldquo;use
            800-53&rdquo; and have very different control sets: the catalog is shared, but the
            tailoring is theirs.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The 20 control families</h2>
          <p className="text-sm muted">
            Every control belongs to one of twenty families, identified by a two-letter code. You do
            not need to memorize them, but recognizing the codes makes any 800-53 conversation
            legible:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Code</th>
                  <th className="text-left py-2 pr-4 font-semibold">Family</th>
                  <th className="text-left py-2 font-semibold">Code</th>
                  <th className="text-left py-2 font-semibold">Family</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4">AC</td><td className="py-2 pr-4">Access Control</td>
                  <td className="py-2">PE</td><td className="py-2">Physical &amp; Environmental</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4">AT</td><td className="py-2 pr-4">Awareness &amp; Training</td>
                  <td className="py-2">PL</td><td className="py-2">Planning</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4">AU</td><td className="py-2 pr-4">Audit &amp; Accountability</td>
                  <td className="py-2">PM</td><td className="py-2">Program Management</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4">CA</td><td className="py-2 pr-4">Assessment &amp; Authorization</td>
                  <td className="py-2">PS</td><td className="py-2">Personnel Security</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4">CM</td><td className="py-2 pr-4">Configuration Management</td>
                  <td className="py-2">PT</td><td className="py-2">PII Processing &amp; Transparency</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4">CP</td><td className="py-2 pr-4">Contingency Planning</td>
                  <td className="py-2">RA</td><td className="py-2">Risk Assessment</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4">IA</td><td className="py-2 pr-4">Identification &amp; Authentication</td>
                  <td className="py-2">SA</td><td className="py-2">System &amp; Services Acquisition</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4">IR</td><td className="py-2 pr-4">Incident Response</td>
                  <td className="py-2">SC</td><td className="py-2">System &amp; Communications Protection</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4">MA</td><td className="py-2 pr-4">Maintenance</td>
                  <td className="py-2">SI</td><td className="py-2">System &amp; Information Integrity</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">MP</td><td className="py-2 pr-4">Media Protection</td>
                  <td className="py-2">SR</td><td className="py-2">Supply Chain Risk Management</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            Controls are chosen from baselines &mdash; Low, Moderate, and High, published separately
            in SP 800-53B &mdash; matched to the system&apos;s impact level, then tailored with
            overlays. The assessment procedures for verifying a control lives in SP 800-53A.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The Risk Management Framework</h2>
          <p className="text-sm muted">
            800-53 is applied through the Risk Management Framework (RMF), a seven-step process from
            NIST SP 800-37. Scanning is not a one-off in this model; it is part of the last two
            steps, where systems are assessed and then continuously monitored:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 760 130"
              role="img"
              aria-label="The seven RMF steps in order: Prepare, Categorize, Select, Implement, Assess, Authorize, Monitor, with Assess and Monitor highlighted as where continuous vulnerability scanning lives"
              className="w-full"
              style={{ minWidth: 620 }}
            >
              <defs>
                <marker id="rmf-arrow" markerWidth="8" markerHeight="8" refX="5.5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              {["Prepare", "Categorize", "Select", "Implement", "Assess", "Authorize", "Monitor"].map((step, i) => {
                const x = 8 + i * 106;
                const hot = step === "Assess" || step === "Monitor";
                return (
                  <g key={step}>
                    <rect
                      x={x}
                      y={40}
                      width={92}
                      height={44}
                      rx={8}
                      fill={hot ? "var(--dg-accent,#2563eb)" : "transparent"}
                      fillOpacity={hot ? 0.14 : 1}
                      stroke="currentColor"
                      strokeOpacity={hot ? 0.7 : 0.4}
                    />
                    <text x={x + 46} y={60} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.55}>
                      {i + 1}
                    </text>
                    <text x={x + 46} y={75} textAnchor="middle" fontSize="12" fontWeight={hot ? "700" : "600"} fill="currentColor">
                      {step}
                    </text>
                    {i < 6 && (
                      <line x1={x + 92} y1={62} x2={x + 104} y2={62} stroke="currentColor" strokeWidth={2} markerEnd="url(#rmf-arrow)" />
                    )}
                  </g>
                );
              })}
              <text x={380} y={22} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.6}>
                Risk Management Framework (NIST SP 800-37)
              </text>
              <text x={540} y={108} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.65}>
                continuous scanning lives here
              </text>
            </svg>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The controls scanning maps to</h2>
          <p className="text-sm muted">
            A vulnerability scanning program provides direct, technical evidence for several controls.
            These are the ones worth knowing by name:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>RA-5, Vulnerability Monitoring and Scanning.</strong> The most direct mapping.
              RA-5 requires scanning for vulnerabilities in the system and hosted applications on a
              defined frequency and when new vulnerabilities are identified, and analyzing the
              results. This is the control your scanner most obviously supports.
            </li>
            <li>
              <strong>SI-2, Flaw Remediation.</strong> Identify, report, and correct flaws, and
              install security-relevant updates within an organization-defined timeframe. Scan
              output feeds the remediation tracking this control expects.
            </li>
            <li>
              <strong>CM-8, System Component Inventory.</strong> Maintain an accurate inventory of
              system components. An SBOM produced during scanning is a natural artifact here.
            </li>
            <li>
              <strong>SA-11, Developer Testing and Evaluation.</strong> Requires vulnerability and
              static analysis during development &mdash; scanning in CI directly supports it.
            </li>
            <li>
              <strong>SR family, Supply Chain Risk Management.</strong> New in Rev 5. Knowing what
              open-source components you ship, and their known vulnerabilities, is foundational to
              controls like SR-3 and SR-11.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Building a program that holds up</h2>
          <p className="text-sm muted">
            Mapping a tool to a control is the easy part; producing evidence an assessor accepts is
            the work. A scanning program that satisfies RA-5 and its neighbors usually shares a few
            traits:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>A defined scan frequency, documented and actually met &mdash; the broader mechanics are in our <Link href="/blog/compliance-scanning-guide" className="underline">compliance scanning guide</Link>.</li>
            <li>Remediation SLAs by severity, tracked to closure, tied to the <Link href="/blog/vulnerability-management-guide" className="underline">vulnerability management lifecycle</Link>.</li>
            <li>A component inventory (SBOM) kept current, satisfying CM-8 and the SR family &mdash; see <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">how ScanRook uses SBOMs</Link>.</li>
            <li>Configuration hardening evidence for the CM family &mdash; CIS Benchmarks are the usual reference, covered in <Link href="/blog/cis-benchmarks-explained" className="underline">CIS Benchmarks explained</Link>.</li>
            <li>Documented data sources, so a missing NVD score does not silently drop a finding &mdash; the risk we describe in the <Link href="/blog/nvd-backlog-explained" className="underline">NVD backlog</Link> piece.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits &mdash; and where it does not</h2>
          <p className="text-sm muted">
            A scanner is a control <em>input</em>, not a compliance verdict. ScanRook produces the
            technical evidence several 800-53 controls call for: it scans container images, binaries,
            and source archives for known vulnerabilities (RA-5), tags each finding with a source and
            confidence tier to support remediation triage (SI-2), and generates an SBOM component
            inventory (CM-8 and the SR family). Because it matches against OSV, NVD, and Red Hat OVAL
            in parallel, the evidence does not hinge on any single database&apos;s coverage.
          </p>
          <p className="text-sm muted">
            What it does not do is make you &ldquo;800-53 compliant.&rdquo; The catalog spans access
            control, personnel security, contingency planning, physical protection, and much more that
            no scanner touches. Authorization rests with your assessor and authorizing official under
            the RMF, and whether any artifact satisfies a given control is their determination.
            Treat ScanRook as one well-documented piece of evidence in a much larger package, and
            consult your assessor or counsel on the rest.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is NIST 800-53?</h3>
              <p className="text-sm muted mt-1">
                A NIST catalog of security and privacy controls for information systems, currently at
                Revision 5. It is mandatory for US federal systems under FISMA and underpins FedRAMP.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How many control families are there?</h3>
              <p className="text-sm muted mt-1">
                Twenty in Rev 5, each with a two-letter code such as AC, AU, CM, RA, SC, and SI. Rev 5
                added the SR (supply chain) and PT (privacy) families.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Which controls require scanning?</h3>
              <p className="text-sm muted mt-1">
                RA-5 most directly, alongside SI-2 (flaw remediation), CM-8 (component inventory),
                SA-11 (developer testing), and the SR supply-chain family.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does a scanner make me compliant?</h3>
              <p className="text-sm muted mt-1">
                No. It supplies evidence for specific controls; the rest of the catalog spans people
                and process, and authorization is your assessor&apos;s call. Consult counsel.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Produce the evidence RA-5 asks for</h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook scans images, binaries, and source for known CVEs and generates an SBOM
            component inventory &mdash; the technical evidence controls like RA-5, SI-2, and CM-8 call
            for, with every finding tagged by source and confidence.
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
            <Link href="/blog/compliance-scanning-guide" className="underline">
              Vulnerability Scanning for Compliance
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/vulnerability-management-guide" className="underline">
              Vulnerability Management Lifecycle
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="underline">
              What Is an SBOM?
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
