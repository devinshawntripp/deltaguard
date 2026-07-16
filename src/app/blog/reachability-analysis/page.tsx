import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-12-07";

const title = `Reachability Analysis: Cutting Vulnerability Noise | ${APP_NAME}`;
const description =
  "Reachability analysis tells you whether a vulnerable code path is actually callable, cutting false positives. How it works, its limits, and where ScanRook fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "reachability analysis",
    "vulnerability reachability analysis",
    "reachability analysis sca",
    "call graph reachability",
    "reachable vulnerabilities",
    "reachability vs exploitability",
    "static reachability analysis",
    "reduce false positives vulnerability scanning",
    "function level reachability",
    "sca reachability",
  ],
  alternates: { canonical: "/blog/reachability-analysis" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/reachability-analysis",
    images: ["/blog/reachability-analysis.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/reachability-analysis.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Reachability Analysis: Cutting Vulnerability Noise",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/reachability-analysis",
  image: "https://scanrook.io/blog/reachability-analysis.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is reachability analysis?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Reachability analysis determines whether the vulnerable code inside a dependency can actually be reached from your application. A package may carry a known CVE, but if the specific vulnerable function is never invoked by any path in your code, the practical risk is much lower. Reachability turns a raw list of vulnerable dependencies into a shorter list of vulnerabilities your application can actually trigger.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between static and runtime reachability?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Static reachability builds a call graph from source or bytecode and checks whether a path exists from your entry points to the vulnerable function, without running the code. Runtime reachability observes which functions actually load and execute while the application runs. Static analysis is broader and safer to run in CI; runtime analysis is more precise but only sees the paths your tests or traffic exercise.",
      },
    },
    {
      "@type": "Question",
      name: "Does reachability analysis eliminate false positives?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It reduces them but does not eliminate them. Reflection, dynamic dispatch, dependency injection, and configuration-driven calls can hide paths from a static call graph, so responsible tools err toward reporting a finding when they are unsure. Treat unreachable as a strong signal to deprioritize, not as proof a vulnerability is harmless.",
      },
    },
    {
      "@type": "Question",
      name: "How does reachability relate to VEX?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "VEX, the Vulnerability Exploitability eXchange, is a format for stating whether a product is affected by a given CVE. Reachability analysis is one way to justify a not-affected VEX statement: if the vulnerable code path is provably unreachable, you can record that as the reason a finding does not apply, giving downstream consumers a machine-readable explanation.",
      },
    },
    {
      "@type": "Question",
      name: "Which tools do reachability analysis?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "govulncheck performs symbol-level call-graph reachability for Go using the Go vulnerability database. Commercial SCA tools such as Snyk and Endor Labs offer reachability for several ecosystems, and Semgrep provides it for supported languages. Coverage depends heavily on the language and on whether advisory data pinpoints the vulnerable function, which most databases still do not.",
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
            Reachability Analysis: Cutting Vulnerability Noise
          </h1>
          <p className="text-sm muted">Published December 7, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            A scanner reports two hundred vulnerable dependencies. Most of them your application
            never actually calls into. Reachability analysis is the technique that separates the
            handful you can genuinely trigger from the long tail you merely happen to ship. Done
            well, it is one of the most effective ways to cut false positives. Done carelessly, it
            hides real risk. Here is how it works, where it breaks, and how it relates to the
            presence-level accuracy ScanRook already provides.
          </p>
        </header>

        <img
          src="/blog/reachability-analysis.jpg"
          alt="Reachability analysis narrowing a list of vulnerabilities to the ones that matter"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The problem it solves</h2>
          <p className="text-sm muted">
            A dependency having a CVE and your application being at risk from that CVE are not the
            same thing. A library might be vulnerable in a function you never import, behind a code
            path your build never compiles, or in an optional feature you do not enable. The raw
            output of a{" "}
            <Link href="/blog/what-is-software-composition-analysis" className="underline">
              software composition analysis
            </Link>{" "}
            scan treats all of these as findings, which is technically correct and operationally
            exhausting. Reachability analysis asks a sharper question: can any path in my code
            actually reach the vulnerable function? If the answer is no, the finding drops down the
            priority list.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">A funnel from &ldquo;matched&rdquo; to &ldquo;fix now&rdquo;</h2>
          <p className="text-sm muted">
            It helps to picture triage as a funnel. Each stage discards findings that are real but
            not actionable, and reachability is one of the stages that does the most work.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 640 250" width="100%" role="img" aria-label="A triage funnel narrowing from all advisory matches to the findings worth fixing now" className="min-w-[560px]">
              <g fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="12">
                {[
                  { y: 14, w: 560, label: "All advisory matches", sub: "every CVE mapped to a component" },
                  { y: 70, w: 430, label: "Component actually present", sub: "installed-state verification" },
                  { y: 126, w: 300, label: "Vulnerable code reachable", sub: "call-graph reachability" },
                  { y: 182, w: 180, label: "Fix now", sub: "reachable + severe + exploited" },
                ].map((r, i) => {
                  const x = (640 - r.w) / 2;
                  return (
                    <g key={r.label}>
                      <rect x={x} y={r.y} width={r.w} height={44} rx={6}
                        fill="var(--dg-accent,#2563eb)"
                        fillOpacity={0.06 + i * 0.06}
                        stroke="var(--dg-accent,#2563eb)" strokeOpacity="0.5" />
                      <text x={320} y={r.y + 20} textAnchor="middle" fontWeight="600" fill="currentColor">{r.label}</text>
                      <text x={320} y={r.y + 36} textAnchor="middle" fill="currentColor" fillOpacity="0.6" fontSize="10">{r.sub}</text>
                    </g>
                  );
                })}
                <text x={320} y={240} textAnchor="middle" fill="currentColor" fillOpacity="0.55" fontSize="11">
                  Presence and reachability each remove findings that are true but not worth acting on.
                </text>
              </g>
            </svg>
          </div>
          <p className="text-sm muted">
            The two middle stages are distinct and often confused. Presence asks whether the
            vulnerable component is really installed at all &mdash; the subject of{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              installed-state scanning versus advisory matching
            </Link>
            . Reachability goes one step further and asks whether, given that it is present, your
            code ever calls the vulnerable part of it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Static reachability: the call graph</h2>
          <p className="text-sm muted">
            The most common form is static call-graph analysis. The tool parses your code and its
            dependencies, builds a graph of which functions call which, and checks whether a path
            exists from your entry points to a function the advisory flags as vulnerable. No code
            runs, so it is safe to do in CI and it considers every path the compiler can see, not
            just the ones your tests happen to exercise.
          </p>
          <p className="text-sm muted">
            Go&apos;s official tool is the clearest example. As covered in{" "}
            <Link href="/blog/govulncheck-go-vulnerability-scanning" className="underline">
              govulncheck: Go vulnerability scanning that follows your code
            </Link>
            , it uses symbol-level information from the Go vulnerability database and reports a CVE
            only when your program actually reaches the affected symbol. That precision is possible
            because the Go advisory data records <em>which function</em> is vulnerable &mdash;
            information most vulnerability databases still do not carry, which is a large part of why
            reachability coverage varies so much between languages.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Runtime reachability: watching execution</h2>
          <p className="text-sm muted">
            The alternative is to observe reachability at runtime. Instrumentation watches which
            classes and functions actually load and execute while the application runs under tests
            or real traffic, and reports a dependency as reachable only if its vulnerable code was
            genuinely invoked. This is the reachability signal behind interactive testing
            approaches. It is more precise than a static graph &mdash; it sees exactly what ran
            &mdash; but its blind spot is the mirror image: it only knows about paths that were
            actually exercised, so a rarely hit code path can look unreachable simply because no
            request triggered it during observation.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where reachability breaks</h2>
          <p className="text-sm muted">
            Reachability is powerful but not infallible, and the honest failure mode is a false
            negative &mdash; calling something unreachable when it is not. Static call graphs
            struggle with dynamic language features: reflection, dynamic dispatch, dependency
            injection, deserialization, and configuration-driven calls can all create edges the
            analyzer cannot see. A well-built tool responds by being conservative, reporting a
            finding whenever it cannot prove the path is absent. That is the right default, and it is
            why <strong>unreachable should be read as &ldquo;strong reason to deprioritize,&rdquo;
            not as &ldquo;proven harmless.&rdquo;</strong> Reachability also depends on advisory data
            pinpointing the vulnerable symbol, which is the exception rather than the rule, and on
            having source or rich bytecode &mdash; stripped binaries and opaque OS packages offer
            little for a call graph to chew on.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Reachability, VEX, and prioritization</h2>
          <p className="text-sm muted">
            Reachability is most useful as one input among several. When it can prove a vulnerable
            path is absent, that conclusion fits neatly into a{" "}
            <Link href="/blog/vex-explained" className="underline">VEX</Link> statement &mdash; a
            machine-readable &ldquo;not affected, because the vulnerable code is unreachable&rdquo;
            that downstream consumers can trust instead of re-triaging the same CVE. And reachability
            pairs naturally with exploit-probability signals: a reachable vulnerability that also has
            a high{" "}
            <Link href="/blog/epss-vulnerability-prioritization" className="underline">EPSS score</Link>{" "}
            is exactly what belongs at the top of the queue. Our{" "}
            <Link href="/blog/how-to-triage-vulnerability-scan-results" className="underline">
              triage guide
            </Link>{" "}
            shows how to combine reachability, severity, EPSS, and exploited-in-the-wild status into
            a single ranking rather than leaning on any one of them alone.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook is precise about the first two stages of that funnel, and honest about the
            third. It performs installed-state verification &mdash; reading the actual package
            databases inside a container or artifact so a finding reflects software that is really
            present, not merely listed &mdash; and it enriches every match against OSV, NVD, and Red
            Hat OVAL with a source and confidence tier. That removes a large class of
            not-actually-there false positives before reachability even enters the picture. What
            ScanRook does not claim to do is function-level source reachability: building a call
            graph across your application code is a different technique, best served by
            language-native tools like govulncheck for the code you compile. The two layers stack.
            ScanRook tells you, accurately, what is inside the artifact; a reachability tool tells you
            which of those present flaws your code can actually reach. Use presence accuracy to trust
            the list, and reachability to shorten it.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is reachability analysis?</h3>
              <p className="text-sm muted mt-1">
                A technique that checks whether the vulnerable code in a dependency can actually be
                reached from your application, turning a raw list of vulnerable packages into the
                ones you can genuinely trigger.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Static vs runtime reachability?</h3>
              <p className="text-sm muted mt-1">
                Static builds a call graph without running the code and sees every compilable path;
                runtime observes what actually executes and is more precise but only sees exercised
                paths.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Does it remove all false positives?</h3>
              <p className="text-sm muted mt-1">
                No. Reflection and dynamic calls can hide paths, so tools stay conservative. Read
                unreachable as a strong reason to deprioritize, not proof of safety.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How does it relate to VEX?</h3>
              <p className="text-sm muted mt-1">
                A proven-unreachable path is a valid justification for a not-affected VEX statement,
                giving downstream consumers a machine-readable reason a CVE does not apply.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Trust the list before you shorten it</h3>
          <p className="text-sm muted leading-relaxed">
            Reachability only helps if the findings are real to begin with. ScanRook verifies which
            packages are actually installed in your artifact and enriches each against OSV, NVD, and
            OVAL &mdash; with a source and confidence tier on every finding &mdash; so triage starts
            from an accurate list.
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
            <Link href="/blog/govulncheck-go-vulnerability-scanning" className="underline">
              govulncheck
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/installed-state-vs-advisory-matching" className="underline">
              Installed-State vs Advisory Matching
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/vex-explained" className="underline">
              What Is VEX?
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
