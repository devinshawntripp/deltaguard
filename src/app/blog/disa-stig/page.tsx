import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-13";

const title = `DISA STIG: What It Is and How to Actually Comply | ${APP_NAME}`;
const description =
  "A practical guide to the DISA STIG: how STIGs are structured, CAT I/II/III severities, CCI mapping to NIST 800-53, automating checks with SCAP, and the gaps.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "disa stig",
    "stig compliance",
    "what is a stig",
    "disa stig checklist",
    "stig viewer",
    "cat i cat ii cat iii stig",
    "stig vs cis benchmark",
    "scap stig scanning",
    "rhel stig",
    "stig ansible hardening",
  ],
  alternates: { canonical: "/blog/disa-stig" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/disa-stig",
    images: ["/blog/disa-stig.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/disa-stig.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "DISA STIG: What It Is and How to Actually Comply",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/disa-stig",
  image: "https://scanrook.io/blog/disa-stig.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a DISA STIG?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A Security Technical Implementation Guide is a configuration hardening standard published by the Defense Information Systems Agency. Each STIG covers one technology — an operating system, database, web server, network device or application — and lists the specific settings required for that product to be deployed on Department of Defense networks. STIGs are published publicly through the DoD Cyber Exchange.",
      },
    },
    {
      "@type": "Question",
      name: "What do CAT I, CAT II and CAT III mean?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They are STIG severity categories. CAT I findings can directly and immediately result in loss of confidentiality, availability or integrity and are the highest priority. CAT II findings may result in such a loss and are medium severity. CAT III findings degrade defensive measures without directly enabling compromise and are low severity. Most STIGs contain far more CAT II items than anything else.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between a STIG and an SRG?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A Security Requirements Guide states a requirement generically for a class of technology, such as all application servers. A STIG is the product-specific implementation of those requirements — the exact file, setting and value for a particular version of a particular product. If no STIG exists for your product, you are expected to apply the relevant SRG yourself.",
      },
    },
    {
      "@type": "Question",
      name: "How is a STIG different from a CIS Benchmark?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They cover much of the same hardening ground with different authority and process. CIS Benchmarks are voluntary consensus guidance from the Center for Internet Security, with Level 1 and Level 2 profiles. STIGs are mandatory for Department of Defense systems, carry CAT severities, and map every rule to a Control Correlation Identifier that links to NIST SP 800-53.",
      },
    },
    {
      "@type": "Question",
      name: "Does STIG compliance mean a system has no vulnerabilities?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. STIGs govern configuration, not patch state. A STIG rule may require that security patches be applied, but the STIG does not enumerate which CVEs affect your installed packages. A fully STIG-compliant host running an unpatched library is still exploitable, which is why configuration scanning and vulnerability scanning are separate, complementary activities.",
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
            DISA STIG: What It Is and How to Actually Comply
          </h1>
          <p className="text-sm muted">Published September 13, 2026 &middot; 10 min read</p>
          <p className="text-sm muted">
            If you are shipping software into a Department of Defense environment, sooner or later
            someone hands you a DISA STIG and asks for evidence. The documents are dense, the
            identifiers are opaque, and the tooling has its own vocabulary. This is the practical
            version: what a STIG is, how one is structured, how to evaluate a system against it
            automatically, and the one thing STIG compliance deliberately does not tell you.
          </p>
        </header>

        <img
          src="/blog/disa-stig.jpg"
          alt="DISA STIG hardening applied as a configuration baseline over server infrastructure"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What a DISA STIG is</h2>
          <p className="text-sm muted">
            A Security Technical Implementation Guide is a configuration hardening standard
            published by the Defense Information Systems Agency. Each STIG targets exactly one
            technology &mdash; Red Hat Enterprise Linux 9, Windows Server, Apache, PostgreSQL,
            Kubernetes, a specific network appliance &mdash; and specifies, setting by setting, how
            that product must be configured to be acceptable on a DoD network.
          </p>
          <p className="text-sm muted">
            Two properties make STIGs different from most security guidance. They are{" "}
            <strong>prescriptive</strong>: not &ldquo;use strong authentication&rdquo; but the exact
            file, directive and value. And within their scope they are{" "}
            <strong>mandatory</strong> rather than advisory, with deviations requiring documented
            risk acceptance rather than a shrug. They are also, usefully, published in the open at
            the DoD Cyber Exchange, so plenty of organisations with no DoD relationship at all use
            them simply because they are one of the most detailed hardening baselines available.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How a STIG is structured</h2>
          <p className="text-sm muted">
            The identifiers are the part that trips everyone up. There is a chain from generic
            policy down to a single line in a config file, and each link has its own ID scheme:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 268"
              role="img"
              aria-label="Hierarchy diagram showing how a Security Requirements Guide becomes a technology-specific STIG containing rules, each rule carrying a group ID, rule ID and STIG ID, mapped through Control Correlation Identifiers to NIST 800-53 controls, with CAT I, CAT II and CAT III severity categories"
              className="w-full"
              style={{ minWidth: 600 }}
            >
              <defs>
                <marker id="stig-arr" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              {[
                { y: 14, label: "SRG", sub: "generic requirement for a class of technology" },
                { y: 74, label: "STIG", sub: "product- and version-specific implementation" },
                { y: 134, label: "Rule", sub: "group ID · rule ID · STIG ID · check · fix" },
                { y: 194, label: "CCI → NIST SP 800-53", sub: "control traceability for the accreditation package" },
              ].map((n, i) => (
                <g key={n.label}>
                  <rect
                    x={8}
                    y={n.y}
                    width={430}
                    height={46}
                    rx={8}
                    fill="currentColor"
                    fillOpacity={0.05}
                    stroke="currentColor"
                    strokeOpacity={0.35}
                  />
                  <text x={24} y={n.y + 21} fontSize="13" fontWeight="600" fill="currentColor">
                    {n.label}
                  </text>
                  <text x={24} y={n.y + 37} fontSize="10.5" fill="currentColor" fillOpacity={0.6}>
                    {n.sub}
                  </text>
                  {i < 3 && (
                    <line
                      x1={223}
                      y1={n.y + 46}
                      x2={223}
                      y2={n.y + 72}
                      stroke="currentColor"
                      strokeWidth={2}
                      markerEnd="url(#stig-arr)"
                    />
                  )}
                </g>
              ))}
              <text x={478} y={30} fontSize="11" fill="currentColor" fillOpacity={0.6}>
                every rule carries one severity
              </text>
              {[
                { y: 48, label: "CAT I", sub: "direct loss", op: 0.6 },
                { y: 106, label: "CAT II", sub: "may cause loss", op: 0.38 },
                { y: 164, label: "CAT III", sub: "degrades defenses", op: 0.18 },
              ].map((c) => (
                <g key={c.label}>
                  <rect
                    x={478}
                    y={c.y}
                    width={210}
                    height={46}
                    rx={8}
                    fill="currentColor"
                    fillOpacity={c.op}
                    stroke="currentColor"
                    strokeOpacity={0.35}
                  />
                  <text x={494} y={c.y + 21} fontSize="13" fontWeight="600" fill="currentColor">
                    {c.label}
                  </text>
                  <text x={494} y={c.y + 37} fontSize="10.5" fill="currentColor" fillOpacity={0.7}>
                    {c.sub}
                  </text>
                </g>
              ))}
              <line x1={438} y1={157} x2={472} y2={157} stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.4} strokeDasharray="4 3" />
              <text x={478} y={236} fontSize="10.5" fill="currentColor" fillOpacity={0.55}>
                shading is illustrative, not a count
              </text>
            </svg>
            <figcaption className="text-xs muted mt-3">
              How a STIG requirement traces from generic policy to a specific setting and back up to
              a NIST 800-53 control.
            </figcaption>
          </div>
          <p className="text-sm muted">
            Each rule carries a <strong>group ID</strong> (the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">V-</code>{" "}
            identifier), a <strong>rule ID</strong> (the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">SV-</code>{" "}
            identifier, which changes when the rule is revised), and a human-friendly{" "}
            <strong>STIG ID</strong> like{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">RHEL-09-211010</code>.
            It also carries a <strong>check</strong> procedure (how an assessor verifies it) and a{" "}
            <strong>fix</strong> procedure (how to make it compliant). Finally, one or more{" "}
            <strong>CCIs</strong> &mdash; Control Correlation Identifiers &mdash; link the rule back
            to controls in{" "}
            <Link href="/blog/nist-800-53" className="underline">
              NIST SP 800-53
            </Link>
            . That last link is what makes a STIG report usable as accreditation evidence rather
            than just a tidy config audit.
          </p>
          <p className="text-sm muted">
            Assessment results use four statuses: <em>Open</em> (non-compliant),{" "}
            <em>Not a Finding</em>, <em>Not Applicable</em>, and <em>Not Reviewed</em>. Anything
            left Open is expected to end up in a Plan of Action and Milestones with an owner and a
            date, or be formally risk-accepted. &ldquo;We disabled that check&rdquo; is not a
            status.
          </p>
        </section>

        <img
          src="/blog/disa-stig-2.jpg"
          alt="STIG compliance matrix showing passing and failing configuration rules"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">STIG vs CIS Benchmark</h2>
          <p className="text-sm muted">
            These two overlap enough that teams often ask which one to follow. The honest answer is
            that the technical content rhymes and the governance differs.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold"></th>
                  <th className="text-left py-2 pr-4 font-semibold">DISA STIG</th>
                  <th className="text-left py-2 font-semibold">CIS Benchmark</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Publisher</strong></td>
                  <td className="py-2 pr-4 align-top">DISA, US Department of Defense</td>
                  <td className="py-2 align-top">Center for Internet Security</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Force</strong></td>
                  <td className="py-2 pr-4 align-top">Mandatory on DoD systems</td>
                  <td className="py-2 align-top">Voluntary consensus guidance</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Tiering</strong></td>
                  <td className="py-2 pr-4 align-top">CAT I / II / III severity</td>
                  <td className="py-2 align-top">Level 1 / Level 2 profiles</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top"><strong>Traceability</strong></td>
                  <td className="py-2 pr-4 align-top">CCI mapping to NIST 800-53</td>
                  <td className="py-2 align-top">Mappings to CIS Controls and other frameworks</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            If you have a DoD obligation, the STIG is not optional and the question is settled.
            Otherwise CIS is usually the friendlier starting point &mdash; see{" "}
            <Link href="/blog/cis-benchmarks-explained" className="underline">
              CIS Benchmarks explained
            </Link>
            . Many organisations harden to CIS and then close the delta to STIG only for the
            systems that need it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Automating STIG evaluation</h2>
          <p className="text-sm muted">
            Reading a STIG by hand and ticking boxes in STIG Viewer is a legitimate workflow and a
            miserable one at scale. Most STIGs are also published as SCAP benchmarks &mdash; XCCDF
            and OVAL content that a scanner can evaluate automatically. DISA ships the SCAP
            Compliance Checker for this; in the open-source world,{" "}
            <Link href="/blog/openscap" className="underline">
              OpenSCAP
            </Link>{" "}
            evaluates the same content, and the ComplianceAsCode project maintains STIG profiles
            for major Linux distributions.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`# see which profiles a datastream offers
oscap info /usr/share/xml/scap/ssg/content/ssg-rhel9-ds.xml

# evaluate the host against the STIG profile and produce a report
oscap xccdf eval \\
  --profile xccdf_org.ssgproject.content_profile_stig \\
  --results stig-results.xml \\
  --report stig-report.html \\
  /usr/share/xml/scap/ssg/content/ssg-rhel9-ds.xml

# generate remediation content instead of fixing in place
oscap xccdf generate fix \\
  --profile xccdf_org.ssgproject.content_profile_stig \\
  --fix-type ansible \\
  /usr/share/xml/scap/ssg/content/ssg-rhel9-ds.xml > stig-remediate.yml`}
          </pre>
          <p className="text-sm muted">
            The third command is the one worth building a workflow around. Generating Ansible
            remediation content rather than applying fixes directly means the hardening becomes
            reviewable code that runs at image build time, so your golden image starts compliant
            instead of being repaired after deployment. That is the same shift-left instinct we
            describe in the{" "}
            <Link href="/blog/compliance-scanning-guide" className="underline">
              compliance scanning guide
            </Link>
            .
          </p>
          <p className="text-sm muted">
            Two practical cautions. First, automated remediation on a running system breaks things;
            apply it to a build, test the result, and promote. Second, STIGs are revised on a
            regular release cadence, and a benchmark you pinned two years ago will quietly diverge
            from what an assessor checks against. Version the content alongside the image that was
            evaluated with it.
          </p>
        </section>

        <img
          src="/blog/disa-stig-3.jpg"
          alt="Layered hardening baseline protecting a system core in a STIG compliance program"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The gap STIGs leave open</h2>
          <p className="text-sm muted">
            A STIG governs <em>configuration</em>. It tells you that SSH must not permit root login,
            that auditing must record specific syscalls, that a file must have particular
            permissions. Nearly every OS STIG also contains a rule requiring that security patches
            be applied &mdash; but the STIG does not, and cannot, enumerate which CVEs affect the
            packages installed on your particular system. That is a different data problem with a
            different update cadence.
          </p>
          <p className="text-sm muted">
            The consequence is a system that passes every CAT I check while running a library with
            a critical known vulnerability. Both statements are true simultaneously, and only one
            of them is what an attacker cares about. Configuration hardening and vulnerability
            scanning are complementary controls, and an accreditation package that presents only
            the first is incomplete. For containers specifically,{" "}
            <Link href="/blog/nist-800-190" className="underline">
              NIST SP 800-190
            </Link>{" "}
            is the companion guidance worth reading next.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook is not a STIG tool and we would not pretend otherwise &mdash; use OpenSCAP or
            SCC for the benchmark itself. What we cover is the patch-state half of the same
            evidence package. Point ScanRook at the container image tarball, binary or source
            archive you are accrediting and it reads the real installed package databases inside
            the artifact, then matches every package against OSV, NVD and Red Hat OVAL in parallel.
          </p>
          <p className="text-sm muted">
            The Red Hat OVAL source matters more than usual in this context. DoD environments run
            heavily on RHEL, where upstream version numbers are misleading because security fixes
            are backported into the vendor&apos;s own package versions &mdash; the problem explained
            in{" "}
            <Link href="/blog/redhat-backporting-explained" className="underline">
              how Red Hat backports security patches
            </Link>
            . Matching against vendor OVAL rather than upstream version ranges is what keeps the
            &ldquo;patches applied&rdquo; rule honest instead of generating a wall of findings an
            assessor will not believe. Every ScanRook finding carries its source and a confidence
            tier, which is exactly the provenance an accreditation reviewer asks for.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Where do I download STIGs?</h3>
              <p className="text-sm muted mt-1">
                They are published publicly on the DoD Cyber Exchange, along with SCAP benchmark
                content and the STIG Viewer tool.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What if no STIG exists for my product?</h3>
              <p className="text-sm muted mt-1">
                You apply the relevant Security Requirements Guide and document how each generic
                requirement is met by your product&apos;s configuration.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can I automate all of it?</h3>
              <p className="text-sm muted mt-1">
                No. Many rules are procedural or require inspecting documentation, so a portion of
                every STIG is a manual review regardless of tooling.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does 100 percent STIG compliance mean secure?</h3>
              <p className="text-sm muted mt-1">
                It means correctly configured. Patch state, application vulnerabilities and supply
                chain risk are all outside the STIG&apos;s scope and need their own controls.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Cover the patch-state half</h3>
          <p className="text-sm muted leading-relaxed">
            Harden with SCAP, then scan the same artifact with ScanRook to show which packages
            actually carry known CVEs &mdash; matched against Red Hat OVAL as well as OSV and NVD,
            with the source of every finding attached.
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
            <Link href="/blog/cis-benchmarks-explained" className="underline">
              CIS Benchmarks Explained
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/openscap" className="underline">
              OpenSCAP
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/nist-800-53" className="underline">
              NIST 800-53
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
