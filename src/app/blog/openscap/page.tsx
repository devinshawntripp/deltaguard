import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { isPublished } from "@/lib/publishGate";

export const revalidate = 3600;
const PUBLISH_DATE = "2026-11-05";

const title = `OpenSCAP Explained: Compliance and OVAL Vulnerability Scans | ${APP_NAME}`;
const description =
  "OpenSCAP is the open-source SCAP scanner for Linux compliance and OVAL vulnerability checks. How it works, its scope, and where ScanRook fits.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "openscap",
    "oscap",
    "scap security guide",
    "openscap tutorial",
    "openscap compliance scan",
    "xccdf oval scap",
    "openscap stig scan",
    "linux compliance scanning",
    "oscap xccdf eval",
    "openscap vs vulnerability scanner",
  ],
  alternates: { canonical: "/blog/openscap" },
  openGraph: {
    title,
    description,
    type: "article",
    url: "/blog/openscap",
    images: ["/blog/openscap.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/blog/openscap.jpg"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "OpenSCAP Explained: Compliance and OVAL Vulnerability Scans",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage: "https://scanrook.io/blog/openscap",
  image: "https://scanrook.io/blog/openscap.jpg",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is OpenSCAP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "OpenSCAP is an open-source framework that implements SCAP, the NIST Security Content Automation Protocol. Its oscap command-line tool evaluates a Linux system against machine-readable security content to check configuration compliance against hardening profiles like STIG, CIS, and PCI-DSS, and to check for missing security patches using OVAL vulnerability definitions.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between XCCDF and OVAL?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "XCCDF is the checklist language that defines a benchmark and its profiles — the human-facing rules like 'ensure SSH root login is disabled'. OVAL is the low-level assessment language that expresses the actual machine test behind each rule. XCCDF says what to check and why; OVAL says exactly how to check it on the system.",
      },
    },
    {
      "@type": "Question",
      name: "Can OpenSCAP scan container images?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, to a degree. Tools like oscap-podman apply OVAL and XCCDF content to a container image's filesystem, so you can run compliance and patch checks against an image. Its coverage still depends on vendor-supplied SCAP content, which is strongest for Red Hat Enterprise Linux and other enterprise distributions.",
      },
    },
    {
      "@type": "Question",
      name: "Is OpenSCAP a vulnerability scanner?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Partly. Through OVAL vulnerability definitions it checks whether a system is missing vendor security patches, which is real vulnerability detection. But its primary strength is configuration compliance against hardening benchmarks, and its patch checks rely on the vendor OVAL feed for that distribution rather than multiple cross-ecosystem advisory sources.",
      },
    },
    {
      "@type": "Question",
      name: "How is OpenSCAP different from a container image scanner?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "OpenSCAP answers 'is this system hardened and patched to a benchmark?' using SCAP content, and it excels at STIG and CIS compliance on enterprise Linux. A container image scanner answers 'what known CVEs are in these packages?' by matching an inventory against several vulnerability databases. They overlap on OVAL patch checks but serve different primary goals.",
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
            OpenSCAP Explained: Compliance and OVAL Vulnerability Scans
          </h1>
          <p className="text-sm muted">Published November 5, 2026 &middot; 9 min read</p>
          <p className="text-sm muted">
            OpenSCAP is one of the oldest and most rigorous tools in Linux security, and it is often
            misfiled as &ldquo;a vulnerability scanner&rdquo; when it is really something broader and
            more standards-driven. It is the reference open-source implementation of a NIST protocol
            for automating security compliance. This guide explains what OpenSCAP is, how its SCAP
            content model works, what it is best at, and where a container image scanner covers a
            different need.
          </p>
        </header>

        <img
          src="/blog/openscap.jpg"
          alt="OpenSCAP evaluating a system against SCAP content"
          className="w-full rounded-xl border border-black/10 dark:border-white/10"
        />

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What OpenSCAP is</h2>
          <p className="text-sm muted">
            OpenSCAP is an open-source project, developed with heavy Red Hat involvement, that
            implements <strong>SCAP</strong> &mdash; the Security Content Automation Protocol, a
            suite of specifications standardized by NIST. Its core is the{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">oscap</code>{" "}
            command-line tool, which evaluates a system against machine-readable security content and
            produces auditable results. It is a NIST-certified SCAP scanner, which is precisely why
            it shows up in regulated environments: its output is recognized as a standards-conformant
            assessment, not a vendor&apos;s proprietary opinion.
          </p>
          <p className="text-sm muted">
            OpenSCAP does two related jobs. It checks <strong>configuration compliance</strong>
            &mdash; is this host hardened to a given benchmark? &mdash; and it checks{" "}
            <strong>vulnerability state</strong> &mdash; is this host missing security patches the
            vendor has shipped? Both run off the same content model.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">The SCAP content model</h2>
          <p className="text-sm muted">
            OpenSCAP itself is just an engine; the intelligence lives in the SCAP content it
            consumes. That content is built from a few standardized languages that fit together:
          </p>
          <div className="overflow-x-auto surface-card p-4">
            <svg viewBox="0 0 680 160" role="img" aria-label="OpenSCAP flow: SCAP content made of an XCCDF profile, OVAL checks, and CPE platform data feeds the oscap engine, which evaluates a host or image and produces pass or fail results, an HTML report, and remediation." className="w-full max-w-2xl mx-auto">
              <g fontSize="11" textAnchor="middle">
                <rect x="12" y="24" width="196" height="112" rx="8" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.25" />
                <text x="110" y="44" fill="currentColor" fontSize="11.5" fontWeight="600">SCAP content</text>
                <rect x="28" y="56" width="164" height="22" rx="5" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.2" />
                <text x="110" y="71" fill="currentColor">XCCDF profile (rules)</text>
                <rect x="28" y="84" width="164" height="22" rx="5" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.2" />
                <text x="110" y="99" fill="currentColor">OVAL checks (tests)</text>
                <rect x="28" y="112" width="164" height="16" rx="5" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.2" />
                <text x="110" y="124" fill="currentColor" fontSize="10">CPE platform data</text>

                <rect x="278" y="58" width="126" height="44" rx="8" fill="var(--dg-accent,#2563eb)" fillOpacity="0.10" stroke="var(--dg-accent,#2563eb)" strokeOpacity="0.55" />
                <text x="341" y="78" fill="currentColor" fontSize="11.5">oscap eval</text>
                <text x="341" y="93" fill="currentColor" opacity="0.7">host or image</text>

                <rect x="474" y="24" width="194" height="112" rx="8" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.25" />
                <text x="571" y="44" fill="currentColor" fontSize="11.5" fontWeight="600">Results</text>
                <text x="571" y="66" fill="currentColor">pass / fail per rule</text>
                <text x="571" y="86" fill="currentColor">HTML report</text>
                <text x="571" y="106" fill="currentColor">remediation script</text>

                <g stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" fill="none">
                  <line x1="208" y1="80" x2="274" y2="80" />
                  <line x1="404" y1="80" x2="470" y2="80" />
                </g>
                <g fill="currentColor" fillOpacity="0.4">
                  <polygon points="274,80 266,76 266,84" />
                  <polygon points="470,80 462,76 462,84" />
                </g>
              </g>
            </svg>
          </div>
          <ul className="text-sm muted list-disc pl-5 grid gap-1.5">
            <li>
              <strong>XCCDF</strong> (Extensible Configuration Checklist Description Format) is the
              benchmark language. It defines rules grouped into <em>profiles</em> &mdash; the
              DISA STIG profile, a CIS profile, a PCI-DSS profile &mdash; each a curated set of
              checks for a particular standard.
            </li>
            <li>
              <strong>OVAL</strong> (Open Vulnerability and Assessment Language) is the low-level
              test language. Every XCCDF rule points at an OVAL definition that says precisely how to
              test the system &mdash; check a file&apos;s permissions, a package version, a sysctl
              value.
            </li>
            <li>
              <strong>CPE</strong> identifies the platform so the right rules apply, and the whole
              bundle ships as a <strong>SCAP source data stream</strong> &mdash; a single file
              packaging the XCCDF, OVAL, and CPE content together.
            </li>
          </ul>
          <p className="text-sm muted">
            The content most people use comes from the{" "}
            <strong>SCAP Security Guide</strong> (the ComplianceAsCode project), which maintains
            hardening profiles for RHEL, Fedora, Ubuntu, and more. OVAL should look familiar if you
            have read about how{" "}
            <Link href="/blog/redhat-backporting-explained" className="underline">
              Red Hat backports security patches
            </Link>{" "}
            &mdash; the same OVAL feeds encode which errata fix which CVE.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Running a scan</h2>
          <p className="text-sm muted">
            A compliance scan evaluates a host against a profile and writes both machine-readable
            results and a human-readable report:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">{`# evaluate a host against a hardening profile from the SCAP Security Guide
oscap xccdf eval \\
  --profile xccdf_org.ssgproject.content_profile_cis \\
  --results scan-results.xml \\
  --report scan-report.html \\
  /usr/share/xml/scap/ssg/content/ssg-rhel9-ds.xml

# check for missing security patches using a vendor OVAL feed
oscap oval eval \\
  --results oval-results.xml \\
  --report oval-report.html \\
  rhel-9.oval.xml`}</pre>
          <p className="text-sm muted">
            The HTML report lists every rule as pass or fail with an explanation, and OpenSCAP can
            generate remediation content &mdash; bash, Ansible, or Puppet &mdash; to bring failing
            rules into compliance. Container images can be evaluated the same way through{" "}
            <code className="text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5">oscap-podman</code>,
            which applies the content against an image&apos;s filesystem.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">What OpenSCAP is best at &mdash; and its limits</h2>
          <p className="text-sm muted">
            OpenSCAP is the strongest open-source option for <strong>configuration compliance</strong>
            on enterprise Linux. If you need to prove a fleet of RHEL hosts meets a DISA STIG or a
            CIS Benchmark, produce standards-conformant evidence for an auditor, and generate
            remediation, it is purpose-built for that and hard to beat. Its OVAL-based patch checks
            are genuine vulnerability detection, tied directly to vendor errata. The{" "}
            <Link href="/blog/cis-benchmarks-explained" className="underline">
              CIS Benchmarks
            </Link>{" "}
            and <Link href="/blog/compliance-scanning-guide" className="underline">compliance scanning</Link>{" "}
            guides put that work in context.
          </p>
          <p className="text-sm muted">
            The limits are the flip side of that focus. OpenSCAP depends on the availability and
            quality of SCAP content for your platform, which is richest for Red Hat-family
            distributions and thinner elsewhere. Its vulnerability checks lean on the vendor OVAL
            feed for one distribution rather than reconciling several cross-ecosystem sources, and it
            says little about the language-level dependencies &mdash; npm, pip, Go modules &mdash;
            bundled into an application image. It is a compliance and hardening tool first, not a
            multi-source software-composition scanner.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Where ScanRook fits</h2>
          <p className="text-sm muted">
            OpenSCAP and ScanRook answer different questions about the same system, and they pair
            cleanly. OpenSCAP tells you whether a host or image is hardened and patched to a
            benchmark; ScanRook tells you what known CVEs live in the OS and language packages of the
            artifact you ship. ScanRook reads installed-state package data and matches it against
            OSV, NVD, and Red Hat OVAL in parallel &mdash; including the same vendor OVAL data
            OpenSCAP consumes, alongside broader open-source ecosystem coverage &mdash; and tags each
            finding with its source and a confidence tier. Use OpenSCAP for STIG and CIS compliance
            evidence; use ScanRook for deep, multi-source package CVE scanning of the build output.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-semibold">What is OpenSCAP?</h3>
              <p className="text-sm muted mt-1">
                The open-source implementation of NIST&apos;s SCAP protocol. Its oscap tool checks
                Linux configuration compliance and missing patches against standardized security
                content.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">XCCDF vs OVAL?</h3>
              <p className="text-sm muted mt-1">
                XCCDF defines the benchmark rules and profiles; OVAL defines the machine test behind
                each rule. XCCDF is what and why, OVAL is how.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Can it scan container images?</h3>
              <p className="text-sm muted mt-1">
                Yes &mdash; oscap-podman applies SCAP content to an image filesystem, though coverage
                depends on vendor content, strongest for enterprise Linux.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Is it a vulnerability scanner?</h3>
              <p className="text-sm muted mt-1">
                Partly. Its OVAL checks detect missing patches, but its primary strength is
                configuration compliance against hardening benchmarks.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 rounded-xl bg-[var(--dg-accent,#2563eb)]/[.06] border border-[var(--dg-accent,#2563eb)]/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">Compliance and CVE coverage, side by side</h3>
          <p className="text-sm muted leading-relaxed">
            Keep OpenSCAP for STIG and CIS compliance evidence, and add ScanRook for deep
            multi-source CVE scanning of your images &mdash; OSV, NVD, and Red Hat OVAL in parallel,
            every finding tagged with its source and confidence.
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
            <Link href="/blog/redhat-backporting-explained" className="underline">
              How Red Hat Backports Security Patches
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/cis-benchmarks-explained" className="underline">
              CIS Benchmarks Explained
            </Link>{" "}
            &middot;{" "}
            <Link href="/blog/compliance-scanning-guide" className="underline">
              Vulnerability Scanning for Compliance
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
