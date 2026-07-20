import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-09-11";

const title = `Nikto: What the Web Server Scanner Actually Checks | ${APP_NAME}`;
const description =
  "Nikto is a fast, loud web server scanner for known bad paths and misconfigurations. How it works, real commands, tuning, false positives, and its blind spots.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "nikto",
    "nikto scanner",
    "nikto web scanner",
    "nikto vulnerability scan",
    "nikto tutorial",
    "nikto tuning options",
    "nikto vs nmap",
    "web server scanner",
    "nikto false positives",
    "nikto docker",
  ],
  alternates: { canonical: "/blog/nikto-web-scanner" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/nikto-web-scanner",
    images: ["/blog/nikto-web-scanner.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/nikto-web-scanner.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Nikto: What the Web Server Scanner Actually Checks",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/nikto-web-scanner",
  image: "https://scanrook.io/blog/nikto-web-scanner.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Nikto?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nikto is an open-source web server scanner written in Perl and maintained at CIRT.net. It sends a large batch of requests against a web server to look for dangerous files and CGI scripts, outdated server software, and common misconfigurations, then reports what it found. It is a checklist-driven scanner rather than a fuzzer or an exploitation tool.",
      },
    },
    {
      "@type": "Question",
      name: "Is Nikto stealthy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No, and it does not try to be. Nikto sends thousands of requests, identifies itself in the User-Agent by default, and will fill a web server access log and trip almost any WAF or IDS. It includes LibWhisker evasion techniques, but the honest description is that Nikto is a loud audit tool for systems you own.",
      },
    },
    {
      "@type": "Question",
      name: "Does Nikto find false positives?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Frequently. Servers that return 200 for every path, custom error pages, aggressive WAFs and redirect-everything front ends all cause Nikto to report items that are not real. Its version-based findings are also inference from banners, which are commonly wrong on distributions that backport security patches. Every Nikto finding needs manual confirmation.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between Nikto and Nmap?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nmap discovers hosts, open ports and running services across a network. Nikto assumes you already know a web server is there and interrogates that one server's HTTP surface in depth. They are sequential rather than competing: Nmap tells you a web server exists on port 8443, then Nikto tells you what is exposed on it.",
      },
    },
    {
      "@type": "Question",
      name: "Can Nikto find vulnerable dependencies?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not reliably. Nikto infers software versions from HTTP response banners and known file fingerprints, which tells you almost nothing about the libraries compiled into or installed alongside the application. Finding vulnerable packages requires reading the installed state of the artifact itself, which is what a software composition analysis or container scanner does.",
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
            Nikto: What the Web Server Scanner Actually Checks
          </h1>
          <p className="text-sm muted">Published September 11, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            Nikto has been in every web assessment toolkit for two decades, and it is still one of
            the fastest ways to learn what a web server is accidentally exposing. It is also
            frequently misunderstood: it is not a vulnerability scanner in the modern sense, it is
            noisy by design, and a large fraction of its output needs human confirmation. Here is
            what Nikto really tests, how to drive it properly, and where its coverage ends.
          </p>
        </header>

        <img
          src="/blog/nikto-web-scanner.jpg"
          alt="Nikto probing a web server with thousands of HTTP requests during a scan"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Nikto is</h2>
          <p className="text-sm muted">
            Nikto is an open-source web server scanner written in Perl, created by Chris Sullo and
            maintained at CIRT.net. Its model is refreshingly simple: it holds a large database of
            things that are known to be interesting on a web server &mdash; dangerous CGI scripts,
            leftover admin consoles, backup files, default installations, version fingerprints
            &mdash; and it asks the server about all of them, one request at a time.
          </p>
          <p className="text-sm muted">
            That makes it a <em>checklist</em> scanner rather than an analysis engine. Nikto does
            not model your application, understand its session flow, or reason about business
            logic. It knows that{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              /phpmyadmin/
            </code>{" "}
            responding with a 200 is worth telling you about, and it will tell you very quickly.
            The strength of that design is speed and breadth of known-bad coverage; the weakness is
            that anything not already in the database is invisible to it.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What Nikto covers, and what it does not</h2>
          <p className="text-sm muted">
            The most common mistake is treating a clean Nikto report as a clean application. Nikto
            operates on one layer of a web stack, and the layers above and below it are somebody
            else&apos;s tool.
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg
              viewBox="0 0 700 250"
              role="img"
              aria-label="Layer diagram of a web stack showing which layers Nikto covers: network and ports not covered, TLS partially, web server configuration and version fully, known bad paths and CGI fully, application logic barely, and installed dependencies not at all"
              className="w-full"
              style={{ minWidth: 560 }}
            >
              {[
                { y: 12, label: "Installed dependencies in the artifact", cov: 0 },
                { y: 52, label: "Application logic, auth flows, state", cov: 1 },
                { y: 92, label: "Known bad paths, CGI, backup files", cov: 3 },
                { y: 132, label: "Web server config, headers, version banners", cov: 3 },
                { y: 172, label: "TLS configuration", cov: 2 },
                { y: 212, label: "Network, open ports, host discovery", cov: 0 },
              ].map((r) => (
                <g key={r.label}>
                  <rect
                    x={8}
                    y={r.y}
                    width={470}
                    height={32}
                    rx={7}
                    fill="currentColor"
                    fillOpacity={0.04}
                    stroke="currentColor"
                    strokeOpacity={0.25}
                  />
                  <text x={22} y={r.y + 21} fontSize="12" fill="currentColor" fillOpacity={0.85}>
                    {r.label}
                  </text>
                  {[0, 1, 2].map((i) => (
                    <rect
                      key={i}
                      x={500 + i * 30}
                      y={r.y + 6}
                      width={22}
                      height={20}
                      rx={4}
                      fill="currentColor"
                      fillOpacity={i < r.cov ? 0.55 : 0.08}
                      stroke="currentColor"
                      strokeOpacity={0.25}
                    />
                  ))}
                  <text x={600} y={r.y + 21} fontSize="11" fill="currentColor" fillOpacity={0.6}>
                    {r.cov === 3 ? "core" : r.cov === 2 ? "partial" : r.cov === 1 ? "shallow" : "none"}
                  </text>
                </g>
              ))}
            </svg>
            <figcaption className="text-xs muted mt-3">
              Illustrative coverage of a web stack by Nikto. Its core competence is two layers wide;
              the layers above and below need different tools entirely.
            </figcaption>
          </div>
          <p className="text-sm muted">
            Nikto groups its checks into tuning categories you can select individually &mdash;
            interesting files, misconfiguration and default files, information disclosure,
            injection, remote file retrieval, command execution, SQL injection, authentication
            bypass, software identification, administrative consoles and a few more. Selecting a
            subset is the single most useful thing you can do to make a Nikto run meaningful rather
            than exhausting.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Running Nikto</h2>
          <p className="text-sm muted">
            The baseline invocation is one flag. Everything past that is narrowing scope and
            controlling output.
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-black/[.06] dark:bg-white/[.06] p-4">
{`# simplest possible run
nikto -h https://staging.example.com

# non-standard port, no TLS
nikto -h 10.0.4.21 -p 8080

# only misconfiguration, information disclosure and admin consoles
nikto -h https://staging.example.com -Tuning 23e

# machine-readable output for a pipeline
nikto -h https://staging.example.com -Format json -o nikto-report.json

# authenticated scan behind basic auth, capped run time
nikto -h https://staging.example.com -id admin:secret -maxtime 10m

# no local install required
docker run --rm sullo/nikto -h https://staging.example.com`}
          </pre>
          <p className="text-sm muted">
            Two flags matter more than the rest.{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              -Tuning
            </code>{" "}
            restricts which categories run, turning a broad sweep into a targeted question.{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
              -maxtime
            </code>{" "}
            bounds the run, which you will want the first time you point Nikto at a slow or
            rate-limited host and it is still going an hour later. Output formats include JSON, XML,
            CSV, HTML and plain text, so wiring results into another system is straightforward.
          </p>
          <p className="text-sm muted">
            One rule that is not optional: only scan hosts you own or have written authorisation to
            test. Nikto&apos;s traffic is unambiguous in a log, and there is no plausible
            explanation for it against somebody else&apos;s server.
          </p>
        </section>

        <img
          src="/blog/nikto-web-scanner-2.jpg"
          alt="Nikto enumerating web server directories and known bad paths during a scan"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Reading the output honestly</h2>
          <p className="text-sm muted">
            Nikto reports observations, not confirmed vulnerabilities, and the distinction is the
            whole skill of using it. Three categories of noise account for most of the confusion:
          </p>
          <ul className="text-sm muted list-disc pl-5 grid gap-2">
            <li>
              <strong>Catch-all responses.</strong> A server or framework that returns 200 with a
              friendly page for every unknown path makes Nikto believe hundreds of files exist.
              Nikto tries to detect this, but SPA front ends and aggressive redirect rules still
              defeat it regularly. If a report is enormous, check the baseline behaviour of an
              obviously fake path before reading anything else.
            </li>
            <li>
              <strong>Version-banner findings.</strong> Nikto flags outdated software largely from
              the{" "}
              <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">
                Server:
              </code>{" "}
              header and similar fingerprints. On Debian, Ubuntu or RHEL that banner is routinely
              misleading, because distributions backport security fixes without changing the
              upstream version string &mdash; the problem we cover in{" "}
              <Link href="/blog/redhat-backporting-explained" className="underline">
                how Red Hat backports security patches
              </Link>
              . A &ldquo;vulnerable version&rdquo; line is a hypothesis, not a finding.
            </li>
            <li>
              <strong>Headers reported as issues.</strong> A missing security header is worth
              knowing and is not, by itself, a vulnerability. Treat these as hardening items and
              rank them accordingly rather than letting them dominate a report.
            </li>
          </ul>
          <p className="text-sm muted">
            The productive workflow is to scan, then triage every finding by hand into confirmed,
            hardening, and false positive. That is the same discipline as any other scan output
            &mdash; our guide to{" "}
            <Link href="/blog/how-to-triage-vulnerability-scan-results" className="underline">
              triaging vulnerability scan results
            </Link>{" "}
            applies directly.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Nikto next to the rest of the toolbox</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Tool class</th>
                  <th className="text-left py-2 pr-4 font-semibold">Question it answers</th>
                  <th className="text-left py-2 font-semibold">Needs</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Nmap</strong></td>
                  <td className="py-2 pr-4 align-top">What is listening, and where?</td>
                  <td className="py-2 align-top">Network access</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>Nikto</strong></td>
                  <td className="py-2 pr-4 align-top">What is this web server exposing that it should not?</td>
                  <td className="py-2 align-top">A running HTTP endpoint</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4 align-top"><strong>DAST proxies</strong></td>
                  <td className="py-2 pr-4 align-top">Can the app be made to misbehave through its own flows?</td>
                  <td className="py-2 align-top">A running app plus credentials</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top"><strong>SCA / image scanners</strong></td>
                  <td className="py-2 pr-4 align-top">Which packages inside the artifact have known CVEs?</td>
                  <td className="py-2 align-top">The artifact, no running server</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm muted">
            These are complements, not substitutes. Nikto sits squarely in the dynamic,
            black-box column, which is why{" "}
            <Link href="/blog/sast-vs-dast-explained" className="underline">
              SAST vs DAST
            </Link>{" "}
            is useful background, and why the last row &mdash; the one that needs no running server
            at all &mdash; is the layer Nikto structurally cannot reach.
          </p>
        </section>

        <img
          src="/blog/nikto-web-scanner-3.jpg"
          alt="Contrast between noisy Nikto scan traffic and targeted tuned scanning"
          className="rounded-lg my-8 w-full"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            Nikto answers a question about a deployed surface: what does this server hand out to an
            unauthenticated stranger? That is genuinely useful and we would keep it in an assessment
            playbook. But it infers everything from responses, and inference about software versions
            over HTTP is the weakest signal in security tooling.
          </p>
          <p className="text-sm muted">
            ScanRook answers the complementary question by reading the artifact directly. Point it
            at the container image tarball, binary or source archive that becomes that web server,
            and it enumerates the real installed package state &mdash; the actual RPM, apk, npm and
            pip databases inside the image &mdash; then matches every package against OSV, NVD and
            Red Hat OVAL in parallel, tagging each finding with its source and a confidence tier. No
            banner guessing, no reachable endpoint required, and it runs before the server is
            deployed rather than after. If you want the deployment-side view too, our{" "}
            <Link href="/blog/attack-surface-management" className="underline">
              attack surface management guide
            </Link>{" "}
            covers the discovery half, and the{" "}
            <Link href="/blog/container-image-scanning-guide" className="underline">
              container image scanning guide
            </Link>{" "}
            covers the artifact half.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">Is Nikto still maintained?</h3>
              <p className="text-sm muted mt-1">
                Yes. Nikto 2 is actively developed on GitHub, with the check database updated
                separately from the scanner itself.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can Nikto scan behind a login?</h3>
              <p className="text-sm muted mt-1">
                It supports basic authentication and can be pointed through a proxy with a session
                cookie, but it does not perform login flows. Complex authenticated testing belongs
                to a full DAST proxy.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Will Nikto break my server?</h3>
              <p className="text-sm muted mt-1">
                It can. Some checks in the denial-of-service tuning category are disruptive by
                nature, and the raw request volume is enough to stress a small host. Scan staging
                first, and bound the run.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Should Nikto run in CI?</h3>
              <p className="text-sm muted mt-1">
                Only against an ephemeral environment, tuned to a few categories, and treated as
                informational. Its false positive rate makes it a poor build gate.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Stop guessing versions from banners</h3>
          <p className="text-sm muted leading-relaxed">
            Scan the image behind the web server with ScanRook and read the real installed package
            state instead of inferring it from HTTP headers. Every finding carries its source and a
            confidence tier.
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
            <Link href="/blog/sast-vs-dast-explained" className="underline">
              SAST vs DAST Explained
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/attack-surface-management" className="underline">
              Attack Surface Management
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/how-to-triage-vulnerability-scan-results" className="underline">
              Triaging Vulnerability Scan Results
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
