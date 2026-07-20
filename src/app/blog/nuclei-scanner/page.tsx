import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-04";

const title = `Nuclei Scanner: Template-Based Vulnerability Scanning | ${APP_NAME}`;
const description =
  "How the Nuclei scanner works: YAML templates, the community template library, running it safely, and where template-based scanning ends and artifact scanning begins.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "nuclei scanner",
    "nuclei vulnerability scanner",
    "projectdiscovery nuclei",
    "nuclei templates",
    "nuclei yaml template",
    "dast scanner",
    "nuclei vs nessus",
    "web vulnerability scanning",
    "nuclei ci",
    "template based scanning",
  ],
  alternates: { canonical: "/blog/nuclei-scanner" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/nuclei-scanner",
    images: ["/blog/nuclei-scanner.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/nuclei-scanner.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Nuclei Scanner: Template-Based Vulnerability Scanning Explained",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/nuclei-scanner",
  image: "https://scanrook.io/blog/nuclei-scanner.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the Nuclei scanner?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nuclei is an open-source vulnerability scanner from ProjectDiscovery that tests live targets using checks defined in YAML templates. Each template describes requests to send and matchers that decide whether the response indicates a vulnerability. Nuclei ships with a large community-maintained template library and is designed for fast, parallel scanning of many hosts.",
      },
    },
    {
      "@type": "Question",
      name: "How is Nuclei different from a container image scanner?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nuclei probes a running service over the network and infers vulnerabilities from how it responds — a dynamic, black-box approach. A container image scanner reads the package inventory inside a build artifact and matches it against advisory databases — a static, white-box approach. Nuclei can only test what is exposed and reachable; an image scanner sees everything installed, including code that never listens on a port.",
      },
    },
    {
      "@type": "Question",
      name: "Are Nuclei findings reliable?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nuclei findings are generally high-signal because a template typically confirms behaviour rather than inferring from a version banner. That is its main advantage over version-based network scanning. The tradeoff is coverage: a vulnerability with no template will not be found, and templates vary in quality, so reviewing the template behind a finding is worthwhile before acting on it.",
      },
    },
    {
      "@type": "Question",
      name: "Is it safe to run Nuclei against production?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "With care. Nuclei sends real requests to real services, so it can create load, trigger alerts, and in the case of some templates cause side effects. Run against staging first, control concurrency and rate limits, exclude intrusive template tags, and only ever scan systems you are authorised to test.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need Nuclei if I already scan container images?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They answer different questions and most mature programmes run both. Image scanning catches vulnerable packages before deployment, including ones never reachable from the network. Nuclei catches exposure that only exists at runtime: misconfiguration, exposed panels, leaked default credentials, and deployed services nobody remembered were running.",
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
          <div className="text-xs uppercase tracking-wide muted">Scanning concepts</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Nuclei Scanner: Template-Based Vulnerability Scanning Explained
          </h1>
          <p className="text-sm muted">Published November 4, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            The Nuclei scanner took a familiar idea &mdash; probe a service and see whether it looks
            vulnerable &mdash; and made the checks themselves the product. Every test is a short YAML
            file that anyone can read, write, and submit, and thousands of them are maintained in
            public. That design choice is why Nuclei spread so fast, and it also defines exactly what
            Nuclei can and cannot tell you. This is a practical look at how it works and where it
            sits alongside artifact scanning.
          </p>
        </header>

        <img
          src="/blog/nuclei-scanner.jpg"
          alt="Nuclei scanner dispatching YAML templates against network targets"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What the Nuclei scanner does</h2>
          <p className="text-sm muted">
            Nuclei is an open-source scanner from ProjectDiscovery, written in Go and distributed as
            a single binary. You point it at one target or a hundred thousand, and it sends requests
            defined by <em>templates</em>, evaluating each response against that template&apos;s
            matchers. If the matchers fire, you get a finding. If they do not, nothing is reported.
          </p>
          <p className="text-sm muted">
            The interesting part is that the templates, not the engine, hold the security knowledge.
            The engine handles protocol support (HTTP, DNS, TCP, SSL, and more), concurrency, rate
            limiting, and output formatting. Everything about <em>what</em> constitutes a
            vulnerability lives in YAML, which means a new check can be written and shared in
            minutes rather than requiring a release of the scanner. When a widely exploited CVE is
            disclosed, community templates typically appear within a day or two.
          </p>
          <p className="text-sm muted">
            A minimal template shows the whole model:
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`id: example-exposed-config

info:
  name: Exposed configuration file
  author: example
  severity: medium
  tags: exposure,config

http:
  - method: GET
    path:
      - "{{BaseURL}}/config.json"

    matchers-condition: and
    matchers:
      - type: status
        status:
          - 200
      - type: word
        part: body
        words:
          - "database_password"`}
          </pre>
          <p className="text-sm muted">
            That is the entire vocabulary: metadata, requests, and matchers combined with a
            condition. The readability is a genuine security property &mdash; when a scanner reports
            a finding you can open the exact check that produced it and decide for yourself whether
            it means what the severity field claims. Most commercial scanners cannot offer that.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Running Nuclei without causing an incident
          </h2>
          <p className="text-sm muted">
            Nuclei sends real traffic to real services. It is not a passive analysis tool, and every
            operational precaution follows from that.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`# Keep the template library current
nuclei -update-templates

# Scan a single target
nuclei -u https://staging.example.com

# Scan a list of targets, restricted to a severity band
nuclei -list targets.txt -severity critical,high

# Restrict by tag and control the request rate
nuclei -u https://staging.example.com \\
  -tags cve,exposure \\
  -rate-limit 50 \\
  -concurrency 10 \\
  -json-export results.json`}
          </pre>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Authorisation first, always.</strong> Scanning infrastructure you do not own or
              have written permission to test is not a grey area. Confirm scope before the first
              request.
            </li>
            <li>
              <strong>Staging before production.</strong> Templates vary, and some probe behaviour
              that has side effects. Learn what a template set does where it cannot hurt anyone.
            </li>
            <li>
              <strong>Constrain the template set.</strong> Running everything against everything is
              slow and noisy. Filter by tag and severity to match what you actually want to know.
            </li>
            <li>
              <strong>Set a rate limit.</strong> The default concurrency is tuned for throughput
              against many hosts, not for politeness toward one. A single small service can be
              overwhelmed easily.
            </li>
            <li>
              <strong>Warn the people watching.</strong> A Nuclei run against your own estate will
              light up your WAF and SIEM. Telling the on-call team first is basic courtesy and saves
              a wasted incident response.
            </li>
          </ul>
        </section>

        <img
          src="/blog/nuclei-scanner-2.jpg"
          alt="Nuclei YAML template library organised by severity and tag for targeted vulnerability scanning"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            What template-based scanning is good and bad at
          </h2>
          <p className="text-sm muted">
            Nuclei&apos;s great strength is confirmation. A well-written template does not read a
            version banner and infer a vulnerability &mdash; it elicits the vulnerable behaviour and
            matches on the response. That produces findings with a much better signal-to-noise ratio
            than version-based network scanning, and it means a finding usually comes with its own
            reproduction steps. For exposed admin panels, leftover default credentials, forgotten
            debug endpoints, and misconfigured storage, nothing else finds them as reliably, because
            those problems do not exist in any package manifest.
          </p>
          <p className="text-sm muted">
            The corresponding weakness is coverage, and it is structural rather than fixable. Nuclei
            finds what a template exists for and what is reachable over the network. A vulnerable
            library sitting in your image that is never invoked by an HTTP-facing code path will
            never produce a response for a matcher to match. Neither will a CVE nobody has written a
            template for. The template library is impressive but it is a subset of the advisory
            universe, not a mirror of it.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 250"
              role="img"
              aria-label="Comparison diagram: dynamic template-based scanning covers reachable network-exposed behaviour and misconfiguration, while static artifact scanning covers all installed packages including unreachable ones, with a small overlap"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              <rect x={16} y={20} width={320} height={160} rx={10} fill="currentColor" fillOpacity={0.05} stroke="currentColor" strokeOpacity={0.35} />
              <text x={176} y={46} textAnchor="middle" fontSize="13.5" fontWeight="600" fill="currentColor">
                Dynamic (Nuclei)
              </text>
              <text x={176} y={64} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>
                probes a running service
              </text>
              {[
                "exposed admin panels",
                "default credentials",
                "misconfigured endpoints",
                "confirmed exploitability",
                "shadow / forgotten hosts",
              ].map((t, i) => (
                <text key={t} x={40} y={92 + i * 17} fontSize="11" fill="currentColor" fillOpacity={0.72}>
                  · {t}
                </text>
              ))}

              <rect x={364} y={20} width={320} height={160} rx={10} fill="var(--dg-accent,#2563eb)" fillOpacity={0.12} stroke="currentColor" strokeOpacity={0.45} />
              <text x={524} y={46} textAnchor="middle" fontSize="13.5" fontWeight="600" fill="currentColor">
                Static (artifact scanning)
              </text>
              <text x={524} y={64} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity={0.6}>
                reads what is installed
              </text>
              {[
                "every installed package",
                "unreachable / dormant code",
                "OS and language ecosystems",
                "pre-deployment, in CI",
                "full advisory-database breadth",
              ].map((t, i) => (
                <text key={t} x={388} y={92 + i * 17} fontSize="11" fill="currentColor" fillOpacity={0.72}>
                  · {t}
                </text>
              ))}

              <rect x={250} y={198} width={200} height={34} rx={7} fill="currentColor" fillOpacity={0.06} stroke="currentColor" strokeOpacity={0.3} />
              <text x={350} y={220} textAnchor="middle" fontSize="11" fill="currentColor" fillOpacity={0.75}>
                overlap: exploitable known CVEs
              </text>
              <line x1={176} y1={182} x2={280} y2={198} stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.4} strokeDasharray="4 3" />
              <line x1={524} y1={182} x2={420} y2={198} stroke="currentColor" strokeWidth={1.5} strokeOpacity={0.4} strokeDasharray="4 3" />
            </svg>
            <figcaption className="text-xs muted mt-2">
              Illustrative coverage split between dynamic template-based scanning and static artifact
              scanning. The overlap is narrower than most teams assume, which is why the two are
              complements rather than alternatives.
            </figcaption>
          </div>
          <p className="text-sm muted">
            This is the same dynamic-versus-static distinction we work through in{" "}
            <Link href="/blog/sast-vs-dast-explained" className="underline">
              SAST vs DAST
            </Link>
            , applied to infrastructure rather than application code. Nuclei is firmly on the dynamic
            side, and dynamic scanning is at its most valuable when it is finding things your
            inventory did not know existed &mdash; which is also the argument for pairing it with{" "}
            <Link href="/blog/attack-surface-management" className="underline">
              attack surface management
            </Link>
            .
          </p>
        </section>

        <img
          src="/blog/nuclei-scanner-3.jpg"
          alt="Coverage split between runtime network scanning and static container artifact scanning"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Fitting Nuclei into a pipeline
          </h2>
          <p className="text-sm muted">
            Nuclei is usually a poor fit for a per-commit CI gate, because it needs something
            deployed and running to test, and because scan duration depends on network conditions
            rather than build inputs. The patterns that work better:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Post-deploy verification against an ephemeral environment.</strong> Deploy to a
              preview environment, run a tightly scoped template set, tear it down. Fast, isolated,
              and it tests the thing you are about to ship.
            </li>
            <li>
              <strong>Scheduled scans of external attack surface.</strong> The highest-value use.
              Point it at your public footprint on a schedule and alert on new findings. This is
              where forgotten staging hosts and abandoned subdomains surface.
            </li>
            <li>
              <strong>Targeted sweeps on disclosure.</strong> When a widely exploited CVE lands and a
              template appears, a single scoped run answers &ldquo;are we exposed to this
              specifically&rdquo; faster than any inventory query.
            </li>
            <li>
              <strong>Diff against a baseline.</strong> Store results and alert on new findings only.
              An unfiltered report re-delivered weekly gets ignored within a month.
            </li>
          </ul>
          <p className="text-sm muted">
            Whatever the trigger, treat the output as input to a triage process rather than as a task
            list &mdash; the reasoning in{" "}
            <Link href="/blog/how-to-triage-vulnerability-scan-results" className="underline">
              triaging vulnerability scan results
            </Link>{" "}
            applies to dynamic findings just as much as to package CVEs.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            ScanRook and Nuclei do not compete, and we would rather explain the boundary than blur
            it. Nuclei tells you what an attacker can reach and confirm from outside. ScanRook tells
            you what is inside the artifact before it is ever deployed: given this container image
            tarball, binary, or source archive, which packages are actually installed and which carry
            known vulnerabilities.
          </p>
          <p className="text-sm muted">
            The mechanics differ accordingly. ScanRook reads the real package databases inside an
            image rather than inferring from filenames, and matches every package against OSV, NVD,
            and Red Hat OVAL in parallel, tagging each finding with its source and a confidence tier.
            That gives breadth across everything installed, including code paths no HTTP request will
            ever touch &mdash; the exact region Nuclei structurally cannot see. Run in CI, it also
            catches problems before deployment rather than after, which is the cheaper end of the
            remediation curve.
          </p>
          <p className="text-sm muted">
            A sensible programme uses both: artifact scanning as the pre-deployment gate, and
            template-based scanning as the periodic reality check on what is actually exposed. If you
            only have budget for one, start with the artifact side &mdash; it is deterministic, it
            runs without touching production, and it prevents rather than detects.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is the Nuclei scanner?</h3>
              <p className="text-sm muted mt-1">
                An open-source, template-driven vulnerability scanner from ProjectDiscovery. Checks
                are YAML files describing requests and matchers, maintained largely by the community.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">How does it differ from image scanning?</h3>
              <p className="text-sm muted mt-1">
                Nuclei probes running services over the network. An image scanner reads the package
                inventory in a build artifact. Different inputs, different blind spots.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Are the findings trustworthy?</h3>
              <p className="text-sm muted mt-1">
                Generally yes, because templates confirm behaviour rather than reading banners. The
                limit is coverage &mdash; no template, no finding. Read the template behind anything
                you act on.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can I run it against production?</h3>
              <p className="text-sm muted mt-1">
                With authorisation, rate limits, a scoped template set, and prior testing in staging.
                It sends real traffic and will trigger your monitoring.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Cover what network scanning cannot see</h3>
          <p className="text-sm muted leading-relaxed">
            Template scanning finds what is reachable. Artifact scanning finds what is installed.
            Scan one of your images with ScanRook and see how much sits outside the reachable set
            &mdash; every finding carries its advisory source and a confidence tier.
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
            <Link href="/blog/sast-vs-dast-explained" className="underline">
              SAST vs DAST Explained
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/attack-surface-management" className="underline">
              Attack Surface Management
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/container-scanning-tools" className="underline">
              Container Scanning Tools
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
