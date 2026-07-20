import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-08";

const title = `Continuous Compliance: From Audit Season to Always-On | ${APP_NAME}`;
const description =
  "What continuous compliance actually means, how to turn controls into automated checks, collect evidence from your pipeline, and catch drift before an auditor does.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "continuous compliance",
    "continuous compliance monitoring",
    "compliance as code",
    "continuous control monitoring",
    "automated evidence collection",
    "soc 2 automation",
    "fedramp conmon",
    "policy as code",
    "compliance drift",
    "audit automation",
  ],
  alternates: { canonical: "/blog/continuous-compliance" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/continuous-compliance",
    images: ["/blog/continuous-compliance.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/continuous-compliance.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Continuous Compliance: From Audit Season to Always-On",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/continuous-compliance",
  image: "https://scanrook.io/blog/continuous-compliance.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is continuous compliance?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Continuous compliance is the practice of verifying security and regulatory controls on an ongoing automated schedule rather than during a periodic audit window. Controls are expressed as machine-checkable rules, the checks run against live systems and pipelines, and the results are stored as timestamped evidence. The goal is that the compliance state you report is the compliance state you actually have.",
      },
    },
    {
      "@type": "Question",
      name: "How is continuous compliance different from a point-in-time audit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A point-in-time audit samples your environment on a specific date and infers that the rest of the period looked similar. Continuous compliance evaluates the same controls on every deploy or on a fixed cadence, so a configuration that drifts out of policy on day forty is detected on day forty rather than at the next audit. The audit then becomes a review of collected evidence instead of a fresh investigation.",
      },
    },
    {
      "@type": "Question",
      name: "Which controls can actually be automated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Technical controls automate well: encryption settings, access configuration, logging, patch and vulnerability status, image provenance, network policy, and host benchmark conformance. Administrative controls such as background checks, security awareness training, vendor reviews, and incident post-mortems still require human evidence, though the reminders and record-keeping can be automated.",
      },
    },
    {
      "@type": "Question",
      name: "What is compliance drift?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Compliance drift is the gap that opens between a control's documented state and the running system over time. A bucket is made public for a migration and never reverted, a base image stops being rebuilt, a break-glass role is granted and not revoked. Drift is the main reason environments pass an audit and fail a real incident, and detecting it quickly is the core value of continuous monitoring.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need a commercial compliance platform?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not to start. A meaningful continuous compliance program can be built from tools most teams already run: benchmark scanners for hosts and clusters, policy-as-code checks for infrastructure definitions, vulnerability scanning in CI, and a durable store for the resulting reports. Commercial platforms mainly add framework mappings, evidence workflow, and auditor-facing reporting on top of the same signals.",
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
            Continuous Compliance: From Audit Season to Always-On
          </h1>
          <p className="text-sm muted">Published December 8, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Continuous compliance is the idea that your controls should be verified on a schedule
            your systems set, not one your auditor sets. Instead of assembling screenshots in the
            weeks before a review, every control that can be expressed as a check runs automatically,
            and the results accumulate as evidence. The payoff is not less work at audit time &mdash;
            though that happens. It is that you find out about a broken control in hours rather than
            months.
          </p>
        </header>

        <img
          src="/blog/continuous-compliance.jpg"
          alt="Continuous compliance: automated control checks running against live systems"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            The problem with point-in-time assurance
          </h2>
          <p className="text-sm muted">
            Traditional assurance samples. An auditor picks a date, asks for evidence, and forms a
            judgement about a twelve-month period from a handful of artifacts. Everyone involved
            knows the limitation, which is why frameworks increasingly ask for evidence of ongoing
            operation rather than a single snapshot. Between samples, real environments move: images
            are rebuilt, roles are granted, a network policy is loosened to unblock a launch.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 230"
              role="img"
              aria-label="Illustrative comparison of point-in-time auditing versus continuous compliance. Under periodic auditing, a control's conformance drifts unnoticed between two widely spaced audit points. Under continuous compliance, frequent checks detect the same drift almost immediately."
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <line x1={60} y1={98} x2={676} y2={98} stroke="currentColor" strokeOpacity={0.25} />
              <line x1={60} y1={198} x2={676} y2={198} stroke="currentColor" strokeOpacity={0.25} />
              <text x={60} y={22} fontSize="12" fontWeight="600" fill="currentColor">
                Periodic audit
              </text>
              <text x={60} y={38} fontSize="10" fill="currentColor" fillOpacity={0.6}>
                drift persists until the next sample
              </text>
              <text x={60} y={128} fontSize="12" fontWeight="600" fill="currentColor">
                Continuous compliance
              </text>
              <text x={60} y={144} fontSize="10" fill="currentColor" fillOpacity={0.6}>
                every check is an evidence point
              </text>
              {/* periodic: two check marks */}
              {[92, 640].map((x) => (
                <g key={`p${x}`}>
                  <circle cx={x} cy={98} r={6} fill="currentColor" fillOpacity={0.75} />
                  <line x1={x} y1={70} x2={x} y2={92} stroke="currentColor" strokeOpacity={0.4} />
                </g>
              ))}
              {/* drift band on periodic line */}
              <rect x={250} y={90} width={330} height={16} rx={4} fill="currentColor" fillOpacity={0.16} />
              <text x={415} y={84} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.7}>
                undetected non-conformance
              </text>
              {/* continuous: many checks */}
              {Array.from({ length: 22 }, (_, i) => 78 + i * 28).map((x) => (
                <circle key={`c${x}`} cx={x} cy={198} r={3.5} fill="currentColor" fillOpacity={x >= 250 && x <= 292 ? 0.9 : 0.45} />
              ))}
              <rect x={250} y={190} width={42} height={16} rx={4} fill="var(--dg-accent,#2563eb)" fillOpacity={0.3} />
              <text x={300} y={184} fontSize="10" fill="currentColor" fillOpacity={0.7}>
                detected on the next run
              </text>
              <text x={368} y={224} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.5}>
                illustrative &mdash; spacing shows cadence, not measured data
              </text>
            </svg>
          </div>
          <figcaption className="text-xs muted">
            The structural difference is detection latency. Both approaches would eventually catch
            the same broken control; only one catches it while it is cheap to fix.
          </figcaption>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Turning controls into checks
          </h2>
          <p className="text-sm muted">
            Every continuous compliance program starts the same way: take the control language from
            your framework and decide, control by control, what machine-readable signal would
            demonstrate it. Most control catalogues &mdash; SOC 2 criteria, ISO 27001 Annex A, the{" "}
            <Link href="/blog/nist-800-53" className="underline">
              NIST SP 800-53
            </Link>{" "}
            families, PCI DSS requirements &mdash; are written in prose that maps onto a handful of
            recurring technical questions.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Control theme</th>
                  <th className="text-left py-2 pr-4 font-semibold">Automated signal</th>
                  <th className="text-left py-2 font-semibold">Typical cadence</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Flaw remediation</td>
                  <td className="py-2 pr-4 align-top">Vulnerability scan of images, hosts and dependencies</td>
                  <td className="py-2 align-top">Every build + nightly</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Secure configuration</td>
                  <td className="py-2 pr-4 align-top">Benchmark scan of hosts and clusters</td>
                  <td className="py-2 align-top">Daily</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Change management</td>
                  <td className="py-2 pr-4 align-top">Branch protection, review records, deploy provenance</td>
                  <td className="py-2 align-top">Per change</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Least privilege</td>
                  <td className="py-2 pr-4 align-top">IAM and RBAC diff against declared baseline</td>
                  <td className="py-2 align-top">Daily</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top">Component inventory</td>
                  <td className="py-2 pr-4 align-top">SBOM generated and stored per release</td>
                  <td className="py-2 align-top">Per release</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">Security training</td>
                  <td className="py-2 pr-4 align-top">Not automatable &mdash; human evidence</td>
                  <td className="py-2 align-top">Annual</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            Be honest about that last row. Roughly speaking, technical controls automate and
            administrative ones do not. A program that claims full automation is usually either
            narrowing its scope quietly or generating evidence nobody reads. Automate what genuinely
            can be, and keep a clear, short list of what still needs a person.
          </p>
        </section>

        <img
          src="/blog/continuous-compliance-2.jpg"
          alt="Automated evidence collection for continuous compliance programs"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Evidence is the hard part, not scanning
          </h2>
          <p className="text-sm muted">
            Teams usually already run the checks. What they lack is durable, attributable evidence
            that the check ran, when, against what, and what it said. An evidence record that
            survives an auditor&apos;s questions needs four things: a stable identifier for the
            control, the exact target evaluated, a timestamp, and the raw result kept immutably.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.05] dark:bg-white/[.05] p-4"><code>{`{
  "control_id": "SI-2",
  "framework": "NIST SP 800-53 Rev 5",
  "target": "registry.example.com/api@sha256:1f3c...9ab2",
  "check": "container-vulnerability-scan",
  "collected_at": "2026-12-08T04:12:07Z",
  "result": "fail",
  "detail": { "critical": 2, "high": 11, "report": "s3://evidence/2026/12/08/api-scan.json" },
  "collector": "ci-pipeline/build#4821"
}`}</code></pre>
          <p className="text-sm muted">
            Write those records into append-only storage with retention that matches your audit
            period, and keep the full report alongside the summary &mdash; auditors ask follow-up
            questions, and &ldquo;we only kept the pass/fail&rdquo; is an uncomfortable answer. If
            you want a machine-readable format that assessors already understand, look at OSCAL, the
            NIST-maintained schema for expressing catalogs, profiles, and assessment results.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Building the pipeline</h2>
          <p className="text-sm muted">
            A workable architecture has four stages, and each can be introduced independently:
          </p>
          <ol className="text-sm muted list-decimal pl-5 grid gap-2">
            <li>
              <strong>Define.</strong> Keep the control-to-check mapping in version control next to
              the code. When someone asks why a check exists, the answer is a file, not a memory.
            </li>
            <li>
              <strong>Collect.</strong> Run checks where the signal lives &mdash; in the build for
              artifact controls, on a schedule for infrastructure controls. Benchmark tooling like{" "}
              <Link href="/blog/openscap" className="underline">
                OpenSCAP
              </Link>{" "}
              covers hosts;{" "}
              <Link href="/blog/kube-bench-cis-scanning" className="underline">
                kube-bench
              </Link>{" "}
              covers clusters against the{" "}
              <Link href="/blog/cis-benchmarks-explained" className="underline">
                CIS Benchmarks
              </Link>
              ; policy-as-code engines evaluate infrastructure definitions before they apply.
            </li>
            <li>
              <strong>Store.</strong> Normalise results into evidence records. Do not let the
              evidence live only inside a CI system with a 90-day log retention.
            </li>
            <li>
              <strong>Act.</strong> Route failures like defects &mdash; an owner, a due date, a
              ticket. Evidence that a control failed and nothing happened is worse than no evidence.
            </li>
          </ol>
          <p className="text-sm muted">
            One caution on gating: enforce blocking checks only where a failure genuinely should stop
            a deploy. Blocking on every control at once produces exceptions, exceptions become
            permanent, and permanent exceptions are just non-compliance with extra paperwork. Start
            with alerting, tighten to blocking once the signal is clean.
          </p>
        </section>

        <img
          src="/blog/continuous-compliance-3.jpg"
          alt="Detecting compliance drift between a declared baseline and running systems"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Drift is the metric that matters
          </h2>
          <p className="text-sm muted">
            The single most useful number a continuous compliance program produces is not a
            percentage of controls passing. It is time-to-detect: how long a control stayed broken
            before anyone knew. Track it, along with time-to-remediate and the count of standing
            exceptions, and you have a picture of whether the program is working. Percentage-passing
            alone rewards narrowing scope.
          </p>
          <p className="text-sm muted">
            Drift is also why vulnerability status deserves continuous treatment specifically. An
            image that was clean at build time does not stay clean; advisories publish against
            packages that were already inside it. Re-scanning stored artifacts on a schedule &mdash;
            not just at build &mdash; is what turns &ldquo;we scanned it&rdquo; into an ongoing
            control. Our{" "}
            <Link href="/blog/compliance-scanning-guide" className="underline">
              compliance scanning guide
            </Link>{" "}
            goes deeper on how those scans line up with framework requirements, and{" "}
            <Link href="/blog/sbom-requirements-2026" className="underline">
              SBOM requirements
            </Link>{" "}
            covers the inventory obligations that increasingly sit alongside them.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            One check, many frameworks
          </h2>
          <p className="text-sm muted">
            Most organisations end up in more than one framework at once &mdash; SOC 2 because
            customers ask, ISO 27001 because a region asks, a NIST profile because a government
            customer asks, PCI DSS because payments are involved. Handled naively that means four
            evidence-gathering exercises a year for substantially the same set of technical
            realities.
          </p>
          <p className="text-sm muted">
            The trick is to invert the relationship. Do not build a check per framework requirement;
            build a check per technical fact, and map that one check to every requirement it
            satisfies. A single &ldquo;all production images scanned within the last 24 hours with no
            unremediated criticals&rdquo; check speaks to flaw-remediation language in several
            catalogues simultaneously. Keep the mapping as data next to the check:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.05] dark:bg-white/[.05] p-4"><code>{`checks:
  - id: image-vuln-scan-current
    description: All production images scanned in the last 24h, no open criticals
    collector: pipeline/scanrook
    satisfies:
      - framework: NIST SP 800-53 Rev 5
        controls: [RA-5, SI-2]
      - framework: SOC 2
        criteria: [CC7.1]
      - framework: PCI DSS v4.0
        requirements: ["6.3.3", "11.3.1"]`}</code></pre>
          <p className="text-sm muted">
            Now adding a framework is a mapping exercise rather than an engineering project, and when
            a check changes you can see immediately which obligations are affected. It also makes gap
            analysis honest: any requirement with no check mapped to it is either genuinely manual or
            genuinely uncovered, and you want to know which.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Where these programs go wrong
          </h2>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Evidence nobody could reconstruct.</strong> A dashboard that shows current
              state but retains no history cannot demonstrate that a control operated throughout the
              period &mdash; which is exactly what an assessor is asking. Store results, not just
              status.
            </li>
            <li>
              <strong>Checks that measure the wrong thing.</strong> &ldquo;Scanner ran&rdquo; is
              easier to automate than &ldquo;scanner ran against every production artifact&rdquo;. The
              first passes forever after someone deletes a target from the inventory.
            </li>
            <li>
              <strong>Exception debt.</strong> Every accepted risk needs an owner and an expiry. A
              register of permanent exceptions is the compliance equivalent of a suppressed test
              suite.
            </li>
            <li>
              <strong>No inventory to check against.</strong> Continuous compliance presumes you know
              what you run. If the asset and artifact inventory is stale, every downstream check
              inherits the gap silently.
            </li>
            <li>
              <strong>Alert fatigue by design.</strong> Turning on every rule in a benchmark on day
              one produces thousands of findings and zero remediation. Baseline first, agree what
              &ldquo;pass&rdquo; means, then enforce.
            </li>
          </ul>
          <p className="text-sm muted">
            None of these are tooling problems, which is why buying a platform does not resolve them.
            They are the same operational disciplines that make any monitoring useful: own the signal,
            keep the history, and act on failures.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook covers one slice of a continuous compliance program: the artifact and
            vulnerability evidence. It scans container image tarballs, source archives, and compiled
            binaries, reads the real package databases inside them, and matches every component
            against OSV, NVD, and Red Hat OVAL &mdash; producing a structured JSON report you can
            file directly as evidence for flaw-remediation and inventory controls. Findings carry
            their advisory source and a confidence tier, which matters when an assessor asks why a
            particular CVE was or was not treated as applicable. It is not a GRC platform and does
            not pretend to be one; it produces the signal, and your evidence store keeps it. See the{" "}
            <Link href="/docs" className="underline">docs</Link> for the report schema.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is continuous compliance?</h3>
              <p className="text-sm muted mt-1">
                Verifying controls on an automated, ongoing schedule and retaining the results as
                evidence, rather than assembling proof during a periodic audit window.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does it replace an audit?</h3>
              <p className="text-sm muted mt-1">
                No. It changes what the audit examines &mdash; a stream of collected evidence instead
                of a fresh hunt for artifacts. The assessment still happens.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Which controls cannot be automated?</h3>
              <p className="text-sm muted mt-1">
                Administrative ones: training completion, vendor due diligence, background checks,
                post-incident reviews. Automate the reminders and records, not the judgement.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Where do we start?</h3>
              <p className="text-sm muted mt-1">
                Pick the three controls you most dread evidencing, wire an automated check and a
                durable evidence record for each, and expand from there.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Make vulnerability evidence automatic</h3>
          <p className="text-sm muted leading-relaxed">
            Scan an artifact and keep the full JSON report as a timestamped evidence record for your
            flaw-remediation control &mdash; sourced, tiered, and re-runnable on a schedule.
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
              Compliance Scanning Guide
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/nist-800-53" className="underline">
              NIST SP 800-53
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/cis-benchmarks-explained" className="underline">
              CIS Benchmarks Explained
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
