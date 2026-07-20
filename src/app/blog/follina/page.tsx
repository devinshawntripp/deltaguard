import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-24";

const title = `Follina (CVE-2022-30190): The MSDT Office Bug | ${APP_NAME}`;
const description =
  "Follina, CVE-2022-30190, turned a Word document into code execution with macros disabled. How the MSDT protocol handler was abused, and what it teaches.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "follina",
    "cve-2022-30190",
    "msdt vulnerability",
    "follina exploit",
    "ms-msdt protocol handler",
    "microsoft office rce",
    "follina mitigation",
    "word document zero day",
    "msdt remote code execution",
    "follina patch",
  ],
  alternates: { canonical: "/blog/follina" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/follina",
    images: ["/blog/follina.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/follina.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Follina (CVE-2022-30190): The MSDT Office Bug",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/follina",
  image: "https://scanrook.io/blog/follina.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Follina?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Follina is the nickname for CVE-2022-30190, a remote code execution vulnerability involving the Microsoft Support Diagnostic Tool. A crafted document could cause Office to fetch a remote HTML payload and invoke the ms-msdt protocol handler, which then executed attacker-supplied commands. It became widely known at the end of May 2022 and Microsoft shipped a fix in the June 2022 security updates.",
      },
    },
    {
      "@type": "Question",
      name: "Why did Follina work with macros disabled?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Because it never used macros. The document abused Office's remote template feature to retrieve an HTML file over HTTP, and that HTML invoked a registered URI protocol handler. Macro security settings, the Mark of the Web warning banner, and Protected View apply to macro execution and untrusted-file handling, not to a protocol handler being invoked by a legitimately loaded document component.",
      },
    },
    {
      "@type": "Question",
      name: "How was Follina mitigated before the patch?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Microsoft's published workaround was to unregister the ms-msdt URI protocol handler, after exporting the registry key so it could be restored. Organizations also deployed the Defender attack surface reduction rule that blocks Office applications from creating child processes, and added detection for Office spawning unusual children. The permanent fix is the June 2022 update.",
      },
    },
    {
      "@type": "Question",
      name: "What privileges did a Follina payload run with?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The privileges of the user who opened the document, which is the same starting point as most phishing-delivered code execution. That is often enough for credential theft and data access on its own, and attackers typically chain a local privilege escalation afterwards to reach administrator or SYSTEM.",
      },
    },
    {
      "@type": "Question",
      name: "Does Follina affect Linux servers or containers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Follina is a Windows and Microsoft Office issue and has no equivalent on Linux hosts or in Linux container images. It is still worth studying by teams who only run containers, because the underlying pattern, a documented feature reachable across a trust boundary, appears in server-side software too.",
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
            Follina (CVE-2022-30190): The MSDT Office Bug
          </h1>
          <p className="text-sm muted">Published November 24, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Follina is the name the security community gave CVE-2022-30190, a Microsoft Office code
            execution issue that arrived in the worst possible shape: it worked with macros disabled,
            it needed no exploit primitives, and the entire payload was legible in a text editor. It
            was patched in June 2022. It remains one of the clearest case studies in how a documented
            feature becomes a vulnerability.
          </p>
        </header>

        <img
          src="/blog/follina.jpg"
          alt="A document triggering a remote payload fetch and code execution chain"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The short version</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top font-semibold">Identifier</td>
                  <td className="py-2 align-top">CVE-2022-30190, nicknamed Follina</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top font-semibold">Component</td>
                  <td className="py-2 align-top">
                    Microsoft Support Diagnostic Tool (MSDT), reached via the{" "}
                    <code className="text-xs">ms-msdt</code> URI handler
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top font-semibold">Impact</td>
                  <td className="py-2 align-top">
                    Code execution as the user who opened the document
                  </td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top font-semibold">Went public</td>
                  <td className="py-2 align-top">Late May 2022</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top font-semibold">Patched</td>
                  <td className="py-2 align-top">June 2022 security updates</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top font-semibold">Notable because</td>
                  <td className="py-2 align-top">
                    Macros disabled did not help; exploited in the wild before the patch
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            The name comes from Kevin Beaumont, who noticed the sample referenced a number matching the
            dialling code of Follina, a town in northern Italy. It landed in CISA&apos;s{" "}
            <Link href="/blog/cisa-kev-guide" className="underline">
              Known Exploited Vulnerabilities catalog
            </Link>{" "}
            quickly, which is the signal that matters far more than a severity score.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">How the chain worked</h2>
          <p className="text-sm muted">
            Follina strung together three legitimate behaviours, none of which is a bug on its own.
          </p>
          <ol className="text-sm muted list-decimal pl-5 grid gap-2">
            <li>
              <strong>Remote templates.</strong> Office documents may reference an external template or
              related resource by URL. Opening the document causes Office to fetch it over HTTP. This
              is a real feature used by real organisations.
            </li>
            <li>
              <strong>The fetched HTML invokes a URI protocol handler.</strong> Windows registers
              handlers for schemes like <code className="text-xs">ms-msdt:</code>, so that clicking a
              link can launch the associated local application. The retrieved HTML simply navigated to
              such a URI.
            </li>
            <li>
              <strong>MSDT accepted a parameter that led to command execution.</strong> The diagnostic
              tool takes arguments describing what to troubleshoot; the crafted URI carried a payload
              that resulted in a PowerShell command being run.
            </li>
          </ol>
          <p className="text-sm muted">
            Each link is a documented capability. Composed, they form a path from &ldquo;user opened an
            attachment&rdquo; to &ldquo;attacker code ran,&rdquo; without a memory-corruption primitive
            anywhere. That is what made it so widely reproduced: there was nothing to reverse engineer.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Why &ldquo;we disabled macros&rdquo; did not help
          </h2>
          <p className="text-sm muted">
            A decade of security advice trained everyone to treat Office risk as a macro problem.
            Follina bypassed that entirely, because it never touched VBA. Macro settings govern macro
            execution. Protected View governs how files from untrusted locations are opened. Neither
            control has anything to say about a document component fetching a URL and that URL invoking
            a registered protocol handler.
          </p>
          <p className="text-sm muted">
            Reports at the time also noted that certain file formats could trigger the chain through the
            Explorer preview pane, meaning a user might not have to open the file in the way they
            expected. Whether a specific configuration was affected varied, but the possibility alone
            reframed the risk: the mental model of &ldquo;dangerous only if you click Enable
            Content&rdquo; was simply wrong.
          </p>
        </section>

        <img
          src="/blog/follina-2.jpg"
          alt="Remote fetch chain leading to a branching process tree"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The chain, and where to break it</h2>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 230"
              role="img"
              aria-label="Flow diagram of the Follina attack chain: opening a document triggers a remote template fetch, the retrieved HTML invokes the ms-msdt URI handler, the diagnostic tool executes a command, and code runs as the user, with mitigation points marked at the handler and child-process steps"
              className="w-full"
              style={{ minWidth: 580 }}
            >
              <defs>
                <marker id="fo-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                </marker>
              </defs>
              {[
                { x: 6, label: "Document", sub: "opened by user" },
                { x: 186, label: "Remote fetch", sub: "template over HTTP" },
                { x: 366, label: "URI handler", sub: "ms-msdt invoked", hot: true },
                { x: 546, label: "Execution", sub: "as current user" },
              ].map((b) => (
                <g key={b.label}>
                  <rect
                    x={b.x}
                    y={20}
                    width={148}
                    height={54}
                    rx={8}
                    fill={b.hot ? "var(--dg-accent,#2563eb)" : "transparent"}
                    fillOpacity={b.hot ? 0.14 : 1}
                    stroke="currentColor"
                    strokeOpacity={0.5}
                  />
                  <text x={b.x + 74} y={43} textAnchor="middle" fontSize="13.5" fontWeight="600" fill="currentColor">
                    {b.label}
                  </text>
                  <text x={b.x + 74} y={61} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.6}>
                    {b.sub}
                  </text>
                </g>
              ))}
              {[160, 340, 520].map((x) => (
                <line key={x} x1={x} y1={47} x2={x + 20} y2={47} stroke="currentColor" strokeWidth={2} markerEnd="url(#fo-arrow)" />
              ))}
              <line x1={440} y1={92} x2={440} y2={112} stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.5} strokeDasharray="4 3" />
              <rect x={330} y={112} width={220} height={32} rx={6} fill="currentColor" fillOpacity={0.06} stroke="currentColor" strokeOpacity={0.3} />
              <text x={440} y={132} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.75}>
                Workaround: unregister the handler
              </text>
              <line x1={620} y1={92} x2={620} y2={162} stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.5} strokeDasharray="4 3" />
              <rect x={430} y={162} width={260} height={32} rx={6} fill="currentColor" fillOpacity={0.06} stroke="currentColor" strokeOpacity={0.3} />
              <text x={560} y={182} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.75}>
                ASR: block Office child processes
              </text>
              <line x1={80} y1={92} x2={80} y2={162} stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.5} strokeDasharray="4 3" />
              <rect x={6} y={162} width={220} height={32} rx={6} fill="currentColor" fillOpacity={0.06} stroke="currentColor" strokeOpacity={0.3} />
              <text x={116} y={182} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.75}>
                Egress control on document fetch
              </text>
              <text x={6} y={218} fontSize="10" fill="currentColor" fillOpacity={0.55}>
                Structure of the chain, not measured data. The permanent fix is the June 2022 update.
              </text>
            </svg>
            <figcaption className="text-xs muted mt-2">
              Three independent mitigation points existed before a patch was available &mdash; a good
              illustration of why layered controls buy time.
            </figcaption>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The interim mitigations</h2>
          <p className="text-sm muted">
            Because there was a gap between public disclosure and the patch, workarounds mattered.
            Microsoft&apos;s published guidance was to unregister the protocol handler after exporting
            the key so it could be restored later:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`:: back the key up first, so it can be restored after patching
reg export HKEY_CLASSES_ROOT\\ms-msdt ms-msdt-backup.reg

:: then remove the handler registration
reg delete HKEY_CLASSES_ROOT\\ms-msdt /f

:: restore later with:
reg import ms-msdt-backup.reg`}
          </pre>
          <p className="text-sm muted">
            Two others were widely deployed alongside it. The Defender attack surface reduction rule
            that blocks Office applications from creating child processes broke the final step of the
            chain regardless of how the handler was reached. And detection engineering &mdash; alerting
            when an Office process spawns a scripting host &mdash; caught attempts that got through.
            None of these replace the update; they buy the window.
          </p>
        </section>

        <img
          src="/blog/follina-3.jpg"
          alt="A protocol handler registration path severed as a mitigation"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            What Follina teaches teams who do not run Windows
          </h2>
          <p className="text-sm muted">
            Follina has no Linux equivalent and does not appear in container images. It is still worth
            an hour of your attention, because the failure mode generalises cleanly:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Features become vulnerabilities when they cross a trust boundary.</strong> Nothing
              in the chain was a coding error. The bug was that a capability designed for a trusted
              local context was reachable from untrusted input &mdash; the same shape as{" "}
              <Link href="/blog/log4shell-cve-2021-44228" className="underline">
                Log4Shell
              </Link>
              , where a logging library&apos;s lookup feature was reachable from user-controlled strings.
            </li>
            <li>
              <strong>Your threat model is probably one generation out of date.</strong> &ldquo;Macros
              are the Office risk&rdquo; was true for a long time and then quietly stopped being the
              whole picture.
            </li>
            <li>
              <strong>Handlers, callbacks, and deserialization are the usual suspects.</strong> Anywhere
              input selects <em>which code runs</em> rather than merely <em>what data it processes</em>
              deserves scrutiny.
            </li>
            <li>
              <strong>Egress control is an underrated brake.</strong> A workstation or workload that
              cannot reach arbitrary hosts cannot fetch stage two &mdash; the same reasoning behind
              default-deny{" "}
              <Link href="/blog/kubernetes-network-policies" className="underline">
                network policies
              </Link>{" "}
              in a cluster.
            </li>
            <li>
              <strong>Time-to-patch is the metric that matters.</strong> A known vulnerability with a
              published fix and a working exploit is a race, and{" "}
              <Link href="/blog/epss-vulnerability-prioritization" className="underline">
                exploitation likelihood
              </Link>{" "}
              is a better prioritisation signal than severity alone.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Honestly: not on this one. ScanRook scans Linux container images, binaries, and source
            archives. It does not inspect Windows endpoints or Office installations, and it would not
            have told you anything useful about CVE-2022-30190 on a laptop. For that layer you want
            endpoint management and an EDR product, and we would rather say so than stretch.
          </p>
          <p className="text-sm muted">
            Where the parallel does hold is the inventory problem. Follina&apos;s response was fast for
            organisations that already knew which machines ran which Office build and slow for those
            that did not. The server-side version of that question &mdash; which of our images contain
            this package at this version &mdash; is precisely what ScanRook answers, by reading the real
            package databases inside an artifact and matching against OSV, NVD, and Red Hat OVAL in
            parallel, with each finding carrying its source and confidence tier. Our{" "}
            <Link href="/blog/vulnerability-management-guide" className="underline">
              vulnerability management guide
            </Link>{" "}
            covers building that muscle before the next unscheduled disclosure.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is Follina?</h3>
              <p className="text-sm muted mt-1">
                CVE-2022-30190, a code execution issue in which a crafted Office document fetched remote
                HTML that invoked the <code className="text-xs">ms-msdt</code> URI handler, leading to
                command execution. Fixed in the June 2022 updates.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Why did disabling macros not stop it?</h3>
              <p className="text-sm muted mt-1">
                It never used macros. Macro settings and Protected View do not govern a remote template
                fetch or a registered protocol handler being invoked.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">What privileges did the payload get?</h3>
              <p className="text-sm muted mt-1">
                Those of the user who opened the document &mdash; enough for credential theft and data
                access, and a normal starting point for a subsequent escalation.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is it still a risk?</h3>
              <p className="text-sm muted mt-1">
                Not on updated systems. It remains relevant on unpatched or unmanaged endpoints, and as
                a template attackers reuse against other protocol handlers.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Answer the inventory question first</h3>
          <p className="text-sm muted leading-relaxed">
            Follina rewarded the teams who already knew what they were running. For your images and
            build artifacts, ScanRook makes that a query rather than a project &mdash; every finding
            carries its advisory source and a confidence tier.
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
            <Link href="/blog/log4shell-cve-2021-44228" className="underline">
              Log4Shell (CVE-2021-44228)
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/cisa-kev-guide" className="underline">
              CISA KEV Guide
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
