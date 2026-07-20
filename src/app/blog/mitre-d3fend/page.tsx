import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-06";

const title = `MITRE D3FEND: The Countermeasure Side of ATT&CK | ${APP_NAME}`;
const description =
  "MITRE D3FEND is a knowledge graph of defensive techniques that maps countermeasures to ATT&CK. How its tactics, digital artifacts and IDs actually work.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "mitre d3fend",
    "d3fend framework",
    "d3fend matrix",
    "d3fend vs attack",
    "defensive techniques",
    "countermeasure knowledge graph",
    "digital artifact ontology",
    "d3fend tactics",
    "application hardening",
    "platform hardening",
  ],
  alternates: { canonical: "/blog/mitre-d3fend" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/mitre-d3fend",
    images: ["/blog/mitre-d3fend.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/mitre-d3fend.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "MITRE D3FEND: The Countermeasure Side of ATT&CK",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/mitre-d3fend",
  image: "https://scanrook.io/blog/mitre-d3fend.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is MITRE D3FEND?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "MITRE D3FEND is a knowledge graph of cybersecurity countermeasures. Where ATT&CK catalogues what adversaries do, D3FEND catalogues what defenders can do about it, organising defensive techniques into a structured vocabulary with stable identifiers and explicit relationships to the digital artifacts those techniques operate on.",
      },
    },
    {
      "@type": "Question",
      name: "How is D3FEND different from ATT&CK?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ATT&CK describes offensive behaviour observed in the wild: tactics, techniques and procedures used by adversaries. D3FEND describes defensive technique classes and how they relate to each other. The two are linked indirectly through digital artifacts — the files, processes, network traffic and credentials that both an attack technique and a countermeasure touch.",
      },
    },
    {
      "@type": "Question",
      name: "What are the D3FEND tactics?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "D3FEND groups defensive techniques under a small set of tactics: Model, Harden, Detect, Isolate, Deceive and Evict, with Restore added in the 1.0 release. Each tactic contains base techniques, which in turn contain more specific techniques, forming a hierarchy rather than a flat list.",
      },
    },
    {
      "@type": "Question",
      name: "Is D3FEND a compliance framework?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. D3FEND is a vocabulary and an ontology, not a control catalogue you get audited against. It has no maturity levels, no scoring and no required controls. It is most useful for describing what your defences actually do in precise, shared terms, and for finding gaps by comparison rather than by checklist.",
      },
    },
    {
      "@type": "Question",
      name: "How does vulnerability scanning map to D3FEND?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Scanning sits mainly under the Model tactic — asset inventory and software dependency mapping — and feeds the Harden tactic, particularly platform hardening through software updates. A scanner that enumerates packages in an image is producing exactly the kind of dependency inventory D3FEND expects the Model tactic to supply.",
      },
    },
  ],
};

const TACTICS = [
  { key: "Model", blurb: "Inventory and map what you have" },
  { key: "Harden", blurb: "Reduce exploitability before attack" },
  { key: "Detect", blurb: "Identify adversary activity" },
  { key: "Isolate", blurb: "Constrain blast radius" },
  { key: "Deceive", blurb: "Present misleading targets" },
  { key: "Evict", blurb: "Remove the adversary" },
  { key: "Restore", blurb: "Return systems to a known good state" },
];

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
            MITRE D3FEND: The Countermeasure Side of ATT&amp;CK
          </h1>
          <p className="text-sm muted">Published November 6, 2026 &middot; 8 min read</p>
          <p className="text-sm muted">
            MITRE D3FEND is a knowledge graph of defensive techniques &mdash; the countermeasure
            counterpart to the attacker behaviour catalogued in ATT&amp;CK. It is less famous than its
            offensive sibling and more often misunderstood, partly because people expect a control
            checklist and find an ontology instead. Here is what D3FEND actually models, how its
            pieces fit together, and where it earns its keep in a real security programme.
          </p>
        </header>

        <img
          src="/blog/mitre-d3fend.jpg"
          alt="MITRE D3FEND defensive countermeasure knowledge graph illustration"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What D3FEND is</h2>
          <p className="text-sm muted">
            D3FEND is a project developed by MITRE with funding from the NSA, first released publicly
            as a beta in 2021 and reaching a 1.0 release in 2024. Its stated goal is to give defenders
            a shared, precise vocabulary for countermeasures &mdash; the same thing ATT&amp;CK did for
            adversary behaviour. Before D3FEND, if two engineers said &ldquo;we do application
            allowlisting&rdquo; and &ldquo;we do execution control,&rdquo; there was no way to tell
            whether they meant the same thing. D3FEND gives each defensive technique a definition, a
            place in a hierarchy, and a stable identifier of the form{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              D3-XXX
            </code>
            .
          </p>
          <p className="text-sm muted">
            The word that matters most in the description is <em>graph</em>. D3FEND is not a list. It
            is published as a knowledge graph with an underlying ontology, queryable in the web
            interface and downloadable as OWL/RDF for teams who want to reason over it
            programmatically. Techniques have parents and children; techniques relate to digital
            artifacts; artifacts relate to each other. That structure is the whole point, and it is
            why treating D3FEND as a spreadsheet of controls throws away most of its value.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The D3FEND tactics</h2>
          <p className="text-sm muted">
            Defensive techniques are grouped under a small set of tactics that read roughly as a
            lifecycle, from knowing your environment through to recovering it:
          </p>
          <figure className="grid gap-2">
            <div className="overflow-x-auto surface-card p-4">
              <svg
                viewBox="0 0 720 250"
                role="img"
                aria-label="The D3FEND tactics arranged as a left-to-right progression: Model, Harden, Detect, Isolate, Deceive, Evict and Restore, each with a short description"
                className="w-full"
                style={{ minWidth: 620 }}
              >
                <defs>
                  <marker id="d3f-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
                  </marker>
                </defs>
                <line
                  x1={12}
                  y1={34}
                  x2={700}
                  y2={34}
                  stroke="currentColor"
                  strokeOpacity={0.25}
                  strokeWidth={2}
                  markerEnd="url(#d3f-arrow)"
                />
                {TACTICS.map((t, i) => {
                  const x = 12 + i * 100;
                  const pre = i < 2;
                  return (
                    <g key={t.key}>
                      <circle cx={x + 44} cy={34} r={5} fill="currentColor" fillOpacity={0.55} />
                      <rect
                        x={x}
                        y={58}
                        width={88}
                        height={140}
                        rx={8}
                        fill={pre ? "var(--dg-accent,#2563eb)" : "currentColor"}
                        fillOpacity={pre ? 0.12 : 0.04}
                        stroke="currentColor"
                        strokeOpacity={0.4}
                      />
                      <text
                        x={x + 44}
                        y={82}
                        textAnchor="middle"
                        fontSize="13"
                        fontWeight="600"
                        fill="currentColor"
                      >
                        {t.key}
                      </text>
                      {t.blurb.split(" ").reduce<string[]>((lines, w) => {
                        const last = lines[lines.length - 1];
                        if (last && (last + " " + w).length <= 13) lines[lines.length - 1] = last + " " + w;
                        else lines.push(w);
                        return lines;
                      }, []).map((line, li) => (
                        <text
                          key={line + li}
                          x={x + 44}
                          y={104 + li * 14}
                          textAnchor="middle"
                          fontSize="10"
                          fill="currentColor"
                          fillOpacity={0.65}
                        >
                          {line}
                        </text>
                      ))}
                    </g>
                  );
                })}
                <rect
                  x={12}
                  y={214}
                  width={188}
                  height={26}
                  rx={6}
                  fill="currentColor"
                  fillOpacity={0.06}
                  stroke="currentColor"
                  strokeOpacity={0.3}
                />
                <text x={106} y={231} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.75}>
                  Where scanning contributes
                </text>
              </svg>
            </div>
            <figcaption className="text-xs muted">
              The D3FEND tactics as a progression. Vulnerability scanning feeds the two left-hand
              tactics: it produces the inventory that Model depends on and drives the software-update
              work that sits under Harden. The ordering is illustrative &mdash; real defence runs the
              tactics concurrently, not in sequence.
            </figcaption>
          </figure>
          <p className="text-sm muted">
            Under each tactic sit <strong>base techniques</strong>, and under those, more specific
            techniques. Harden, for example, breaks into application hardening, credential hardening,
            message hardening and platform hardening. Application hardening covers things like stack
            frame canary validation, pointer authentication and dead code elimination &mdash;
            compiler- and binary-level defences. Platform hardening covers disk encryption, boot
            integrity, file permissions and software updates. That last one is where a vulnerability
            scanner lives.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Digital artifacts: the link to ATT&amp;CK
          </h2>
          <p className="text-sm muted">
            The clever part of D3FEND is that it does <em>not</em> claim &ldquo;countermeasure X stops
            attack technique Y.&rdquo; That claim is usually false in practice, because whether a
            control stops a technique depends on configuration, coverage and the specific procedure an
            adversary uses. Instead D3FEND connects the two sides through a <strong>digital artifact
            ontology</strong>: a model of the things that exist in a computing environment &mdash;
            files, processes, network traffic, credentials, executable binaries, user accounts, and so
            on.
          </p>
          <img
            src="/blog/mitre-d3fend-2.jpg"
            alt="Offensive ATT&CK techniques mapped to D3FEND defensive techniques through shared digital artifacts"
            className="rounded-lg my-8 w-full"
          />
          <p className="text-sm muted">
            An ATT&amp;CK technique <em>produces</em> or <em>touches</em> certain artifacts. A D3FEND
            technique <em>analyses</em>, <em>modifies</em> or <em>blocks</em> certain artifacts. Where
            the artifact sets overlap, there is a plausible defensive relationship worth investigating.
            That is a weaker claim than &ldquo;this control mitigates that technique,&rdquo; and it is
            weaker on purpose &mdash; it points you at candidate countermeasures without pretending to
            know your environment. If you have worked with{" "}
            <Link href="/blog/mitre-attack" className="underline">
              the ATT&amp;CK framework
            </Link>{" "}
            and been frustrated by mitigation entries that felt too generic to act on, this is D3FEND&apos;s
            answer to that problem.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            What D3FEND is good for &mdash; and what it is not
          </h2>
          <p className="text-sm muted">
            Used well, D3FEND does three things. First, it is a <strong>vocabulary</strong>: it lets
            architecture documents, tool evaluations and vendor claims be written in terms with
            agreed definitions. Second, it is a <strong>coverage map</strong>: laying your deployed
            controls over the tactic hierarchy makes lopsidedness obvious, and most organisations
            discover they are heavy on Detect and thin on Isolate and Restore. Third, it is a{" "}
            <strong>reasoning aid</strong>: because the graph is machine-readable, you can query it
            for defensive techniques that touch the same artifacts as an attack path you care about.
          </p>
          <p className="text-sm muted">
            What it is not is a compliance framework. There are no maturity levels, no scores, no
            &ldquo;required&rdquo; techniques and no audit mapping. If you need a control catalogue to
            be measured against, that is what{" "}
            <Link href="/blog/nist-800-53" className="underline">
              NIST SP 800-53
            </Link>{" "}
            and the{" "}
            <Link href="/blog/cis-controls" className="underline">
              CIS Controls
            </Link>{" "}
            are for; D3FEND complements them rather than replacing them. It is also incomplete by
            nature &mdash; a technique class missing from the graph is not a technique that does not
            exist, and the project has grown steadily since its beta.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Putting D3FEND to work without over-engineering it
          </h2>
          <p className="text-sm muted">
            The failure mode we see most often is teams trying to produce an exhaustive mapping of
            every control they own to every D3FEND technique, burning a quarter on it, and never
            looking at the spreadsheet again. A lighter approach works better:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Start from one attack path, not the whole matrix.</strong> Take a scenario you
              genuinely worry about, identify the artifacts it involves, and pull the D3FEND
              techniques that touch those artifacts. Compare that list against what you actually run.
            </li>
            <li>
              <strong>Count tactics, not techniques.</strong> A rough tally of which tactics your
              controls land in is more informative than a precise technique-level map, and takes an
              afternoon rather than a quarter.
            </li>
            <li>
              <strong>Use the identifiers in writing.</strong> Referencing a technique ID in a design
              doc costs nothing and removes an entire class of ambiguity from review conversations.
            </li>
            <li>
              <strong>Treat gaps as questions.</strong> A thin Deceive column is not automatically a
              problem &mdash; deception is a legitimate choice to skip. A thin Isolate column usually
              is a problem. This is the same judgement discussed in{" "}
              <Link href="/blog/defense-in-depth" className="underline">
                defence in depth
              </Link>
              .
            </li>
          </ul>
          <img
            src="/blog/mitre-d3fend-3.jpg"
            alt="Layered hardening controls mapped across D3FEND tactics in a defensive architecture"
            className="rounded-lg my-8 w-full"
          />
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Scanning is not glamorous D3FEND territory, but it is foundational to two tactics. Under
            <strong> Model</strong>, D3FEND expects you to know your asset inventory and your software
            dependencies &mdash; which is exactly what a scan of a container image, binary or source
            archive produces. ScanRook reads the real package databases inside an artifact rather than
            inferring from filenames, so the inventory it emits is the installed state, not a guess.
            That inventory doubles as an SBOM, which is the artifact most Model-tactic work ends up
            depending on.
          </p>
          <p className="text-sm muted">
            Under <strong>Harden</strong>, the software update technique is only as good as the signal
            telling you what needs updating. ScanRook matches every package it finds against OSV, NVD
            and Red Hat OVAL in parallel and attaches a source and confidence tier to each finding, so
            the hardening work is driven by evidence rather than by a single database&apos;s view.
            Its binary analysis path also reads ELF, PE and Mach-O metadata &mdash; the same territory
            D3FEND&apos;s application hardening techniques describe. None of that makes a scanner a
            defence-in-depth strategy on its own; it makes it the input that several D3FEND techniques
            quietly assume you already have.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is MITRE D3FEND?</h3>
              <p className="text-sm muted mt-1">
                A knowledge graph of cybersecurity countermeasures, developed by MITRE with NSA
                funding, giving defensive techniques stable identifiers, definitions and explicit
                relationships to the digital artifacts they operate on.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How does it relate to ATT&amp;CK?</h3>
              <p className="text-sm muted mt-1">
                ATT&amp;CK models adversary behaviour; D3FEND models defensive technique classes. They
                connect indirectly through shared digital artifacts rather than through direct
                &ldquo;this stops that&rdquo; claims.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Do I get audited against D3FEND?</h3>
              <p className="text-sm muted mt-1">
                No. It is a vocabulary and ontology, not a control catalogue with maturity levels.
                Pair it with 800-53 or the CIS Controls if you need something auditable.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Where does scanning fit?</h3>
              <p className="text-sm muted mt-1">
                Mostly under Model, as software dependency and asset inventory, feeding the software
                update technique under Harden.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Start with the inventory</h3>
          <p className="text-sm muted leading-relaxed">
            Every D3FEND tactic downstream of Model assumes you know what is installed. Scan an image
            with ScanRook and you get the installed-state package inventory plus findings enriched
            from several advisory sources, each carrying its origin so you can check the work.
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
            <Link href="/blog/mitre-attack" className="underline">
              The MITRE ATT&amp;CK Framework
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/cyber-kill-chain" className="underline">
              The Cyber Kill Chain
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/defense-in-depth" className="underline">
              Defense in Depth
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
