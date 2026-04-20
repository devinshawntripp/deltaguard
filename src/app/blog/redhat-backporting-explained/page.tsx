import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";
import BackportChecker from "./BackportChecker";

const title = `How Red Hat Backports Security Patches: A Complete Guide to RHEL Vulnerability Management | ${APP_NAME}`;
const description =
  "Understand how Red Hat backports security fixes, why package versions don't tell the full story, and how OVAL/CSAF data enables accurate RHEL vulnerability scanning.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "RHEL backporting",
    "Red Hat security patches",
    "RHEL OVAL",
    "RHSA advisories",
    "RPM versioning",
    "backported CVE fixes",
    "RHEL vulnerability scanning",
    "red hat backporting",
    "RHEL CVE management",
    "NEVRA format",
    "Red Hat OVAL",
    "RHEL security",
  ],
  alternates: {
    canonical: "/blog/redhat-backporting-explained",
  },
  openGraph: {
    title:
      "How Red Hat Backports Security Patches: A Complete Guide to RHEL Vulnerability Management",
    description,
    type: "article",
    url: "/blog/redhat-backporting-explained",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "How Red Hat Backports Security Patches: A Complete Guide to RHEL Vulnerability Management",
    description,
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline:
    "How Red Hat Backports Security Patches: A Complete Guide to RHEL Vulnerability Management",
  description,
  author: { "@type": "Organization", name: "ScanRook" },
  publisher: { "@type": "Organization", name: "ScanRook" },
  mainEntityOfPage:
    "https://scanrook.io/blog/redhat-backporting-explained",
  datePublished: "2026-04-20",
  dateModified: "2026-04-20",
};

const faqItems = [
  {
    q: "Why does my RHEL server show an old version of OpenSSL?",
    a: "Red Hat backports security fixes into their stable package versions rather than upgrading to the latest upstream release. Your RHEL 9 server may show OpenSSL 3.0.7, but the release number (e.g., -27.el9) indicates which security patches have been applied. The version number stays the same to preserve API/ABI compatibility; the release number increments with each security update.",
  },
  {
    q: "Is my RHEL 9 system vulnerable if the version is older than upstream?",
    a: "Not necessarily. Red Hat backports security fixes from newer upstream versions into their stable branches. To determine if your system is patched, check the full NEVRA (Name-Epoch:Version-Release.Architecture) against Red Hat's OVAL data or security advisories, not just the version number. A package like openssl-3.0.7-27.el9 may have all the same CVE fixes as upstream OpenSSL 3.3.1.",
  },
  {
    q: "What is the difference between RHSA and CVE?",
    a: "A CVE (Common Vulnerabilities and Exposures) is a unique identifier for a specific vulnerability, such as CVE-2024-0727. An RHSA (Red Hat Security Advisory) is a notification from Red Hat that one or more CVEs have been fixed in updated packages. A single RHSA can fix multiple CVEs, and it includes the specific package versions that contain the fixes. RHSAs follow the format RHSA-YYYY:NNNN.",
  },
  {
    q: "How do I check if a CVE is patched on my RHEL system?",
    a: "Run 'rpm -q <package>' to get the installed NEVRA, then check Red Hat's CVE database at access.redhat.com/security/cve/CVE-YYYY-NNNN to see which package version includes the fix. Alternatively, run 'yum updateinfo list cves' to see all CVE fixes available for your system, or use a scanner like ScanRook that checks OVAL data automatically.",
  },
  {
    q: "What is OVAL and how does Red Hat use it?",
    a: "OVAL (Open Vulnerability and Assessment Language) is an XML-based standard for machine-readable vulnerability definitions. Red Hat publishes OVAL definitions for RHEL 7, 8, and 9 at access.redhat.com/security/data/oval/v2/. Each OVAL definition contains test criteria that specify the exact package version-release that fixes a vulnerability, allowing automated scanners to accurately determine patch status.",
  },
  {
    q: "Does Rocky Linux / AlmaLinux also backport?",
    a: "Yes. Rocky Linux and AlmaLinux are binary-compatible rebuilds of RHEL. They inherit Red Hat's backported patches because they rebuild from the same source RPMs (SRPMs). When Red Hat releases openssl-3.0.7-27.el9, Rocky and Alma release the same version with their own branding (e.g., openssl-3.0.7-27.el9_4). The same OVAL-based scanning approach works for these distributions.",
  },
  {
    q: "How long does Red Hat support each RHEL version?",
    a: "Red Hat provides a minimum of 10 years of support for each major RHEL version, divided into Full Support (5 years with new features, bug fixes, and security patches) and Maintenance Support (5 additional years with critical security fixes only). Extended Life Support (ELS) is available as a paid add-on for up to 4 additional years. RHEL 9, released in 2022, has full support through 2027 and maintenance through 2032.",
  },
  {
    q: "What does 'Will not fix' mean in Red Hat's CVE database?",
    a: "When Red Hat marks a CVE as 'Will not fix', it means they have assessed the vulnerability and determined that a fix is not warranted for that RHEL version. Reasons include: the affected code path is not reachable in Red Hat's build, the vulnerability requires an unlikely configuration, the severity is too low relative to the risk of regression from patching, or the affected component is not shipped in that RHEL version.",
  },
  {
    q: "How do vulnerability scanners handle Red Hat backporting?",
    a: "Scanners that only compare package version numbers against upstream advisories (version-only matching) produce massive false positives on RHEL because the version stays at 3.0.7 even after patches. Accurate scanners check the full NEVRA (including the release number) against Red Hat's OVAL data or security advisory feeds. ScanRook uses triple-source enrichment: OSV for ecosystem-level matches, Red Hat OVAL for release-specific patch status, and per-package API lookups for additional context.",
  },
  {
    q: "What is NEVRA versioning?",
    a: "NEVRA stands for Name-Epoch:Version-Release.Architecture, the standard format for identifying RPM packages. For example, in openssl-1:3.0.7-27.el9_4.x86_64, the Name is openssl, Epoch is 1, Version is 3.0.7, Release is 27.el9_4, and Architecture is x86_64. The Release field is what changes when Red Hat backports a security fix, while the Version stays the same.",
  },
  {
    q: "Can I opt out of backporting and use upstream versions?",
    a: "Technically yes, but Red Hat strongly discourages it. You can install upstream packages from source, use Software Collections (SCL), or use EPEL repositories. However, doing so means you lose Red Hat's security support guarantee, may break system dependencies, and will not receive automated security updates through yum/dnf. For most enterprises, the stability guarantee of backported patches outweighs the desire for newer versions.",
  },
  {
    q: "How does ScanRook handle Red Hat backporting differently?",
    a: "ScanRook uses triple-source RHEL enrichment. First, it queries OSV for ecosystem-level vulnerability data. Second, it downloads and parses Red Hat OVAL definitions to check the exact RPM release number against known-fixed versions. Third, it queries the Red Hat per-package security API for additional CVE context. This approach eliminates the false positives that version-only scanners produce while also catching vulnerabilities that OVAL alone might miss.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

const codeStyle =
  "text-xs rounded bg-black/[.06] dark:bg-white/[.06] px-1.5 py-0.5";

const preStyle =
  "rounded-xl bg-black/[.04] dark:bg-white/[.04] p-5 overflow-x-auto text-xs leading-relaxed font-mono border border-black/5 dark:border-white/5";

const thStyle =
  "px-3 py-2 text-left text-xs font-semibold border-b border-black/10 dark:border-white/10 bg-black/[.03] dark:bg-white/[.03]";

const tdStyle =
  "px-3 py-2 text-xs border-b border-black/5 dark:border-white/5";

export default function RedHatBackportingPage() {
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

      {/* ── Header ── */}
      <section className="surface-card p-7 grid gap-5">
        <header className="grid gap-3">
          <div className="flex items-center gap-3 text-xs muted">
            <span className="uppercase tracking-wide">Security Concepts</span>
            <span>|</span>
            <time dateTime="2026-04-20">Published Apr 20, 2026</time>
            <span>|</span>
            <span>20 min read</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            How Red Hat Backports Security Patches: A Complete Guide to RHEL
            Vulnerability Management
          </h1>
          <p className="text-sm muted leading-relaxed">
            Everything you need to know about how Red Hat Enterprise Linux
            handles security patches through backporting: why package versions
            don&apos;t tell the full story, how NEVRA versioning works, what
            OVAL and CSAF data look like, and why naive version-based scanners
            produce massive false positives on RHEL. Includes an interactive
            CVE lookup tool and real XML examples.
          </p>
        </header>
      </section>

      {/* ── 1. The Backporting Problem ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          The Backporting Problem
        </h2>
        <p className="text-sm muted leading-relaxed">
          If you have ever managed a RHEL server and run{" "}
          <code className={codeStyle}>rpm -q openssl</code>, you have
          probably seen something like this:
        </p>
        <pre className={preStyle}>
          <code>{`$ rpm -q openssl
openssl-3.0.7-27.el9_4.x86_64`}</code>
        </pre>
        <p className="text-sm muted leading-relaxed">
          Then you check the upstream OpenSSL project and see that the latest
          release is 3.3.1. Your immediate reaction: <em>my server is three
          minor versions behind, it must be full of unpatched
          vulnerabilities</em>. You run a vulnerability scanner. It reports 47
          CVEs. Your security team files urgent tickets. Your ops team scrambles
          to plan an emergency maintenance window.
        </p>
        <p className="text-sm muted leading-relaxed">
          And almost every one of those 47 CVEs is a <strong>false
          positive</strong>.
        </p>
        <p className="text-sm muted leading-relaxed">
          This is the single most common misunderstanding in RHEL vulnerability
          management. The version number{" "}
          <code className={codeStyle}>3.0.7</code> does <em>not</em> mean your
          system has the same code as upstream OpenSSL 3.0.7. Red Hat has taken
          the security fixes from OpenSSL 3.0.8, 3.0.9, 3.0.10, 3.0.11, 3.0.12,
          3.0.13, 3.0.14, 3.1.x, 3.2.x, and 3.3.x and <strong>backported</strong>{" "}
          them into their 3.0.7 branch. The result is a package that has the
          version number 3.0.7 but contains all the security patches from every
          later release.
        </p>
        <p className="text-sm muted leading-relaxed">
          The key insight is this: on RHEL, the <strong>version number</strong>{" "}
          tells you the API/ABI compatibility baseline. The{" "}
          <strong>release number</strong> (the part after the hyphen, like{" "}
          <code className={codeStyle}>27.el9_4</code>) tells you the actual
          patch level. A scanner that only looks at the version and ignores the
          release will get RHEL wrong every single time.
        </p>
        <p className="text-sm muted leading-relaxed">
          This is not a RHEL-specific quirk. Every enterprise Linux distribution
          that provides long-term support &mdash; SUSE, Ubuntu LTS, Debian
          Stable &mdash; does some form of backporting. But Red Hat&apos;s
          approach is the most aggressive and the most misunderstood, partly
          because RHEL&apos;s 10-year support lifecycle means packages can drift
          very far from upstream versions while remaining fully patched.
        </p>
      </section>

      {/* ── 2. What Is Backporting? ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          What Is Backporting?
        </h2>
        <p className="text-sm muted leading-relaxed">
          Backporting is the practice of taking a specific fix from a newer
          version of software and applying it to an older, stable version. The
          term comes from &quot;porting back&quot; &mdash; a change is written
          for version N+1 and then adapted to work on version N.
        </p>
        <p className="text-sm muted leading-relaxed">
          When the OpenSSL project fixes CVE-2024-0727 in version 3.0.14, they
          write a patch against their current 3.0.x development tree. Red Hat
          takes that patch &mdash; sometimes the exact commit, sometimes a
          modified version that accounts for their own changes &mdash; and
          applies it to their 3.0.7 branch. The resulting RPM bumps the release
          number from, say,{" "}
          <code className={codeStyle}>openssl-3.0.7-24.el9</code> to{" "}
          <code className={codeStyle}>openssl-3.0.7-27.el9</code>.
        </p>
        <p className="text-sm muted leading-relaxed">
          Red Hat does this because their customers &mdash; banks, hospitals,
          government agencies, defense contractors &mdash; cannot tolerate
          arbitrary major-version upgrades. An upgrade from OpenSSL 3.0.x to
          3.3.x could change API behavior, remove deprecated functions,
          introduce new cipher suite defaults, or alter TLS negotiation behavior.
          Any of these changes could break applications that have been validated
          and certified against the 3.0.x API.
        </p>
        <p className="text-sm muted leading-relaxed">
          The contract Red Hat makes with its customers is this: <em>we will
          keep your system&apos;s packages at the same major version for the
          entire support lifecycle (typically 10 years), and we will backport
          every security fix so you never have to choose between security and
          stability</em>. This is the core value proposition of RHEL.
        </p>
        <p className="text-sm muted leading-relaxed">
          The downside is that it makes version-based vulnerability assessment
          fundamentally broken. Every tool, process, or human that equates
          &quot;older version number = vulnerable&quot; will produce incorrect
          results on RHEL and its derivatives (Rocky Linux, AlmaLinux, Oracle
          Linux, CentOS Stream).
        </p>
      </section>

      {/* ── 3. Backporting Flow Diagram ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          How Backporting Works: The Flow
        </h2>
        <p className="text-sm muted leading-relaxed">
          The following diagram illustrates how a security fix flows from
          upstream to RHEL packages. Notice that the version number stays the
          same &mdash; only the release number changes.
        </p>
        <div className="overflow-x-auto">
          <svg
            viewBox="0 0 800 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full max-w-2xl mx-auto"
            role="img"
            aria-label="Backporting flow diagram showing how patches flow from upstream to RHEL packages"
          >
            {/* Background */}
            <rect width="800" height="400" rx="16" className="fill-black/[.02] dark:fill-white/[.02]" />

            {/* Title */}
            <text x="400" y="30" textAnchor="middle" className="fill-current" fontSize="13" fontWeight="600">Security Patch Backporting Flow</text>

            {/* Upstream section */}
            <text x="400" y="60" textAnchor="middle" className="fill-blue-500" fontSize="11" fontWeight="600">UPSTREAM</text>

            <rect x="80" y="70" width="280" height="36" rx="8" fill="#3b82f6" fillOpacity="0.12" stroke="#3b82f6" strokeWidth="1.5" />
            <text x="220" y="92" textAnchor="middle" fill="#3b82f6" fontSize="11" fontWeight="600">OpenSSL 3.3.1 (latest upstream)</text>

            <rect x="440" y="70" width="280" height="36" rx="8" fill="#3b82f6" fillOpacity="0.12" stroke="#3b82f6" strokeWidth="1.5" />
            <text x="580" y="88" textAnchor="middle" fill="#3b82f6" fontSize="10" fontWeight="500">CVE-2024-0727 fixed in 3.0.14</text>
            <text x="580" y="100" textAnchor="middle" fill="#3b82f6" fontSize="10" fontWeight="500">CVE-2024-2511 fixed in 3.0.14</text>

            {/* Arrow from upstream to Red Hat */}
            <line x1="400" y1="116" x2="400" y2="155" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
            <polygon points="395,152 400,162 405,152" fill="#94a3b8" />

            {/* Red Hat team box */}
            <rect x="250" y="165" width="300" height="50" rx="10" fill="#ef4444" fillOpacity="0.08" stroke="#ef4444" strokeWidth="1.5" />
            <text x="400" y="185" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="600">Red Hat Security Team</text>
            <text x="400" y="200" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="400" opacity="0.8">Extracts ONLY the security patch</text>

            {/* Arrow down to RHEL packages */}
            <line x1="300" y1="225" x2="200" y2="265" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
            <polygon points="195,260 200,272 205,262" fill="#94a3b8" />

            <line x1="500" y1="225" x2="600" y2="265" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
            <polygon points="595,260 600,272 605,262" fill="#94a3b8" />

            {/* RHEL 9 row */}
            <text x="200" y="285" textAnchor="middle" className="fill-current" fontSize="10" fontWeight="600">RHEL 9</text>

            <rect x="50" y="295" width="140" height="32" rx="6" fill="#ef4444" fillOpacity="0.1" stroke="#ef4444" strokeWidth="1" />
            <text x="120" y="315" textAnchor="middle" fill="#ef4444" fontSize="9.5" fontWeight="500">3.0.7-24.el9</text>

            {/* Arrow */}
            <line x1="200" y1="311" x2="250" y2="311" stroke="#94a3b8" strokeWidth="1.5" />
            <polygon points="247,307 257,311 247,315" fill="#94a3b8" />

            <rect x="260" y="295" width="140" height="32" rx="6" fill="#22c55e" fillOpacity="0.12" stroke="#22c55e" strokeWidth="1.5" />
            <text x="330" y="315" textAnchor="middle" fill="#22c55e" fontSize="9.5" fontWeight="600">3.0.7-27.el9</text>

            <text x="330" y="342" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="500">PATCHED</text>

            {/* RHEL 8 row */}
            <text x="600" y="285" textAnchor="middle" className="fill-current" fontSize="10" fontWeight="600">RHEL 8</text>

            <rect x="450" y="295" width="140" height="32" rx="6" fill="#ef4444" fillOpacity="0.1" stroke="#ef4444" strokeWidth="1" />
            <text x="520" y="315" textAnchor="middle" fill="#ef4444" fontSize="9.5" fontWeight="500">1.1.1k-9.el8</text>

            {/* Arrow */}
            <line x1="600" y1="311" x2="650" y2="311" stroke="#94a3b8" strokeWidth="1.5" />
            <polygon points="647,307 657,311 647,315" fill="#94a3b8" />

            <rect x="660" y="295" width="130" height="32" rx="6" fill="#22c55e" fillOpacity="0.12" stroke="#22c55e" strokeWidth="1.5" />
            <text x="725" y="315" textAnchor="middle" fill="#22c55e" fontSize="9.5" fontWeight="600">1.1.1k-12.el8</text>

            <text x="725" y="342" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="500">PATCHED</text>

            {/* Legend */}
            <rect x="220" y="365" width="12" height="12" rx="2" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="1" />
            <text x="238" y="375" className="fill-current" fontSize="9">Vulnerable</text>

            <rect x="320" y="365" width="12" height="12" rx="2" fill="#22c55e" fillOpacity="0.2" stroke="#22c55e" strokeWidth="1" />
            <text x="338" y="375" className="fill-current" fontSize="9">Patched</text>

            <rect x="410" y="365" width="12" height="12" rx="2" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="1" />
            <text x="428" y="375" className="fill-current" fontSize="9">Upstream</text>
          </svg>
        </div>
        <p className="text-sm muted leading-relaxed">
          The critical detail: the RHEL 9 package version stays at{" "}
          <code className={codeStyle}>3.0.7</code> even after patching, but
          the release number changes from{" "}
          <code className={codeStyle}>-24</code> to{" "}
          <code className={codeStyle}>-27</code>. Similarly, RHEL 8 maintains
          its own independent backport branch at{" "}
          <code className={codeStyle}>1.1.1k</code>. Each RHEL major version
          has its own package branch, and each branch receives its own
          backported patches.
        </p>
      </section>

      {/* ── 4. How Red Hat Versioning Works ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          How Red Hat Versioning Works: NEVRA Explained
        </h2>
        <p className="text-sm muted leading-relaxed">
          RPM packages use the <strong>NEVRA</strong> naming convention:
          Name-Epoch:Version-Release.Architecture. Understanding each component
          is essential for accurate vulnerability assessment on RHEL.
        </p>
        <p className="text-sm muted leading-relaxed">
          Let&apos;s break down a real package identifier:
        </p>
        <pre className={preStyle}>
          <code>{`openssl-1:3.0.7-27.el9_4.x86_64
   │     │  │     │         │
   │     │  │     │         └─ Architecture: x86_64 (CPU arch)
   │     │  │     │
   │     │  │     └─ Release: 27.el9_4
   │     │  │          │  │
   │     │  │          │  └─ .el9_4 = RHEL 9, minor release 4
   │     │  │          └─ 27 = 27th build (THIS changes with patches)
   │     │  │
   │     │  └─ Version: 3.0.7 (stays the same across backports!)
   │     │
   │     └─ Epoch: 1 (overrides version comparison order)
   │
   └─ Name: openssl`}</code>
        </pre>
        <p className="text-sm muted leading-relaxed">
          The <strong>Version</strong> field (3.0.7) corresponds to the
          upstream OpenSSL version that Red Hat originally based their package
          on. This number <em>never changes</em> during the lifecycle of a RHEL
          major version. It exists solely to identify the API/ABI compatibility
          baseline.
        </p>
        <p className="text-sm muted leading-relaxed">
          The <strong>Release</strong> field (27.el9_4) is what actually
          indicates the patch level. Each time Red Hat backports a security fix,
          rebuilds the package, or applies a bug fix, the release number
          increments. The suffix <code className={codeStyle}>.el9</code> means
          RHEL 9, <code className={codeStyle}>.el8</code> means RHEL 8, and
          the optional <code className={codeStyle}>_4</code> indicates the RHEL
          minor release (9.4 in this case).
        </p>
        <p className="text-sm muted leading-relaxed">
          The <strong>Epoch</strong> field is rarely used but overrides all
          other version comparison logic when present. It exists to handle
          cases where a package&apos;s version numbering scheme changed (for
          example, if upstream switched from date-based to semver versioning).
          When comparing two package versions, RPM checks Epoch first, then
          Version, then Release.
        </p>
        <p className="text-sm muted leading-relaxed">
          Here are real-world examples of how this plays out across different
          packages:
        </p>
        <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className={thStyle}>Package</th>
                <th className={thStyle}>RHEL</th>
                <th className={thStyle}>Upstream</th>
                <th className={thStyle}>RHEL Package</th>
                <th className={thStyle}>Key CVEs Fixed</th>
              </tr>
            </thead>
            <tbody className="muted">
              <tr>
                <td className={`${tdStyle} font-medium`}>openssl</td>
                <td className={tdStyle}>RHEL 9</td>
                <td className={tdStyle}>3.3.1</td>
                <td className={tdStyle}><code className={codeStyle}>3.0.7-27.el9</code></td>
                <td className={tdStyle}>CVE-2024-0727, CVE-2024-2511</td>
              </tr>
              <tr>
                <td className={`${tdStyle} font-medium`}>curl</td>
                <td className={tdStyle}>RHEL 9</td>
                <td className={tdStyle}>8.8.0</td>
                <td className={tdStyle}><code className={codeStyle}>7.76.1-29.el9</code></td>
                <td className={tdStyle}>CVE-2024-2398, CVE-2024-2004</td>
              </tr>
              <tr>
                <td className={`${tdStyle} font-medium`}>glibc</td>
                <td className={tdStyle}>RHEL 8</td>
                <td className={tdStyle}>2.39</td>
                <td className={tdStyle}><code className={codeStyle}>2.28-236.el8</code></td>
                <td className={tdStyle}>CVE-2024-2961</td>
              </tr>
              <tr>
                <td className={`${tdStyle} font-medium`}>openssh</td>
                <td className={tdStyle}>RHEL 9</td>
                <td className={tdStyle}>9.8p1</td>
                <td className={tdStyle}><code className={codeStyle}>8.7p1-38.el9</code></td>
                <td className={tdStyle}>CVE-2024-6387 (regreSSHion)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm muted leading-relaxed">
          Look at the <strong>openssh</strong> row: upstream is at 9.8p1, but
          RHEL 9 ships 8.7p1. That&apos;s a full major version behind. Yet
          CVE-2024-6387 &mdash; the regreSSHion vulnerability that made
          headlines worldwide &mdash; is fixed in RHEL&apos;s 8.7p1-38.el9
          package because Red Hat backported the patch. A version-only scanner
          would flag this as critically vulnerable. It is not.
        </p>
      </section>

      {/* ── 5. Red Hat's Security Data Sources ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          Red Hat&apos;s Security Data Sources
        </h2>
        <p className="text-sm muted leading-relaxed">
          Red Hat publishes security data through four primary channels. Each
          serves a different audience and use case, but they all describe the
          same underlying information: which packages fix which CVEs.
        </p>

        <h3 className="text-sm font-semibold mt-2">
          RHSA &mdash; Red Hat Security Advisories
        </h3>
        <p className="text-sm muted leading-relaxed">
          RHSAs are the primary mechanism for communicating security patches to
          customers. Each advisory follows the format{" "}
          <code className={codeStyle}>RHSA-YYYY:NNNN</code> (e.g.,{" "}
          <a
            href="https://access.redhat.com/errata/RHSA-2024:1879"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2"
          >
            RHSA-2024:1879
          </a>
          ) and includes the following information:
        </p>
        <ul className="list-disc pl-6 text-sm muted grid gap-1">
          <li>Severity rating (Critical, Important, Moderate, Low)</li>
          <li>List of CVEs addressed by the update</li>
          <li>Affected products and architectures</li>
          <li>Updated package names with exact NEVRA versions</li>
          <li>Description of the security issues and fixes</li>
        </ul>
        <p className="text-sm muted leading-relaxed">
          A single RHSA can fix multiple CVEs in one package update, or it can
          cover updates to multiple packages that address a common
          vulnerability. RHSAs are published at{" "}
          <a
            href="https://access.redhat.com/security/security-updates/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2"
          >
            access.redhat.com/security/security-updates
          </a>
          .
        </p>

        <h3 className="text-sm font-semibold mt-2">
          OVAL &mdash; Open Vulnerability and Assessment Language
        </h3>
        <p className="text-sm muted leading-relaxed">
          OVAL definitions are XML-based, machine-readable vulnerability
          descriptions that automated scanners use to determine whether a
          system is patched. Red Hat publishes OVAL data for RHEL 7, 8, and 9
          at{" "}
          <a
            href="https://access.redhat.com/security/data/oval/v2/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2"
          >
            access.redhat.com/security/data/oval/v2/
          </a>
          . Each OVAL definition contains test criteria that specify the exact
          package version-release required to resolve a vulnerability. This is
          what makes OVAL the gold standard for RHEL vulnerability scanning
          &mdash; it accounts for backporting by checking the release number,
          not just the version.
        </p>

        <h3 className="text-sm font-semibold mt-2">
          CSAF &mdash; Common Security Advisory Framework
        </h3>
        <p className="text-sm muted leading-relaxed">
          CSAF is the JSON-based successor to OVAL for newer advisories. Red
          Hat publishes CSAF data at{" "}
          <a
            href="https://access.redhat.com/security/data/csaf/v2/advisories/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2"
          >
            access.redhat.com/security/data/csaf/v2/advisories/
          </a>
          . CSAF advisories use a structured JSON format that is easier to
          parse than XML and includes product tree definitions, vulnerability
          status per-product, and remediation information. As the industry
          shifts toward CSAF (mandated by the EU Cyber Resilience Act for some
          vendors), expect this format to become increasingly important.
        </p>

        <h3 className="text-sm font-semibold mt-2">
          Red Hat CVE Database
        </h3>
        <p className="text-sm muted leading-relaxed">
          The per-CVE database at{" "}
          <a
            href="https://access.redhat.com/security/cve/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2"
          >
            access.redhat.com/security/cve/
          </a>{" "}
          provides Red Hat&apos;s assessment of every CVE, including their
          independent severity rating, affected products, and fix status. The
          fix status can be one of:
        </p>
        <ul className="list-disc pl-6 text-sm muted grid gap-1">
          <li><strong>Affected</strong> &mdash; the vulnerability impacts this RHEL version and a fix is planned</li>
          <li><strong>Fix deferred</strong> &mdash; a fix is planned but not yet scheduled for release</li>
          <li><strong>Will not fix</strong> &mdash; Red Hat has determined a fix is not warranted (see FAQ below)</li>
          <li><strong>Not affected</strong> &mdash; the vulnerable code is not present in Red Hat&apos;s build</li>
          <li><strong>Under investigation</strong> &mdash; Red Hat is still assessing impact</li>
        </ul>
        <p className="text-sm muted leading-relaxed">
          For any specific CVE, visit{" "}
          <code className={codeStyle}>
            access.redhat.com/security/cve/CVE-YYYY-NNNN
          </code>{" "}
          to see the full assessment. The API powering this data is also
          available programmatically, which is what the interactive tool below
          uses.
        </p>
      </section>

      {/* ── 6. Why Naive Scanners Get RHEL Wrong ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          Why Naive Scanners Get RHEL Wrong
        </h2>
        <p className="text-sm muted leading-relaxed">
          Most vulnerability scanners work by extracting a list of installed
          packages and their version numbers, then comparing those versions
          against a database of known-vulnerable versions. This approach works
          well for ecosystems where the version number directly corresponds to
          the upstream release (Alpine, Arch, Homebrew). It fails catastrophically
          on RHEL.
        </p>
        <p className="text-sm muted leading-relaxed">
          Here is what happens when a version-only scanner evaluates an RHEL 9
          system with <code className={codeStyle}>openssl-3.0.7-27.el9</code>:
        </p>
        <ol className="list-decimal pl-6 text-sm muted grid gap-2">
          <li>
            The scanner extracts the version: <strong>3.0.7</strong>.
          </li>
          <li>
            It queries the NVD for OpenSSL vulnerabilities and finds every CVE
            fixed in versions 3.0.8 through 3.3.1.
          </li>
          <li>
            It compares: 3.0.7 &lt; 3.0.8, 3.0.7 &lt; 3.0.9, etc. &mdash;
            every one matches.
          </li>
          <li>
            It reports dozens of CVEs as &quot;present&quot; on your system.
          </li>
          <li>
            Every single one is a <strong>false positive</strong> because Red
            Hat already backported those fixes.
          </li>
        </ol>
        <p className="text-sm muted leading-relaxed">
          The correct approach is to check the <em>full NEVRA</em> (including
          the release number) against Red Hat&apos;s OVAL data. OVAL
          definitions say things like: &quot;if{" "}
          <code className={codeStyle}>openssl</code> is earlier than{" "}
          <code className={codeStyle}>1:3.0.7-27.el9_4</code>, then
          CVE-2024-0727 is present.&quot; This test correctly accounts for
          backporting because it compares the full Epoch:Version-Release, not
          just the version.
        </p>
        <p className="text-sm muted leading-relaxed">
          In practice, the false positive differential is enormous. When
          scanning a Rocky Linux 9 container image,{" "}
          <Link
            href="/blog/scanrook-benchmark-results"
            className="font-medium underline underline-offset-2"
          >
            ScanRook&apos;s benchmarks
          </Link>{" "}
          show that different scanners produce wildly different finding counts
          depending on how they handle backported packages. Scanners that use
          OVAL data produce fewer, more accurate results. Scanners that rely
          on version-only matching flood your reports with false positives that
          waste engineering time and erode trust in the scanning process.
        </p>
        <p className="text-sm muted leading-relaxed">
          ScanRook handles RHEL scanning through triple-source enrichment: it
          queries{" "}
          <Link
            href="/blog/what-is-osv"
            className="font-medium underline underline-offset-2"
          >
            OSV
          </Link>{" "}
          for ecosystem-level data, downloads and parses Red Hat OVAL
          definitions for release-specific patch status, and queries the Red
          Hat per-package security API for additional context. This layered
          approach eliminates false positives from backporting while still
          catching vulnerabilities that any single source might miss.
        </p>
      </section>

      {/* ── 7. Interactive Tool: Backport Checker ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          Red Hat CVE Lookup Tool
        </h2>
        <p className="text-sm muted leading-relaxed">
          Enter an RPM package name to see CVEs that Red Hat has tracked for
          it, including severity ratings and advisory links. This tool queries
          Red Hat&apos;s public security data API to show you exactly which
          vulnerabilities have been addressed through backported patches.
        </p>
        <BackportChecker />
      </section>

      {/* ── 8. How OVAL Works ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          How OVAL Works &mdash; With Real XML Examples
        </h2>
        <p className="text-sm muted leading-relaxed">
          OVAL (Open Vulnerability and Assessment Language) is the
          machine-readable format that makes accurate RHEL scanning possible.
          It was originally developed by MITRE and is now maintained by the{" "}
          <a
            href="https://oval.cisecurity.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2"
          >
            Center for Internet Security (CIS)
          </a>
          . Red Hat publishes OVAL definitions as XML files that contain
          precise test criteria for every RHSA they release.
        </p>
        <p className="text-sm muted leading-relaxed">
          Here is a simplified but representative OVAL definition for a
          hypothetical OpenSSL security update:
        </p>
        <pre className={preStyle}>
          <code>{`<definition id="oval:com.redhat.rhsa:def:20241879"
            class="patch">
  <metadata>
    <title>RHSA-2024:1879 - Important: openssl security update</title>
    <affected family="unix">
      <platform>Red Hat Enterprise Linux 9</platform>
    </affected>
    <reference ref_id="RHSA-2024:1879" source="RHSA"
               ref_url="https://access.redhat.com/errata/RHSA-2024:1879"/>
    <reference ref_id="CVE-2024-0727" source="CVE"
               ref_url="https://access.redhat.com/security/cve/CVE-2024-0727"/>
    <reference ref_id="CVE-2024-2511" source="CVE"
               ref_url="https://access.redhat.com/security/cve/CVE-2024-2511"/>
    <description>
      OpenSSL is a toolkit implementing the SSL and TLS protocols.
      Security Fix(es):
      * openssl: denial of service via null dereference (CVE-2024-0727)
      * openssl: unbounded memory growth with session handling (CVE-2024-2511)
    </description>
  </metadata>

  <criteria operator="AND">
    <!-- Check: is this RHEL 9? -->
    <criterion test_ref="oval:com.redhat.rhsa:tst:20241879001"
               comment="Red Hat Enterprise Linux 9 is installed"/>

    <!-- Check: is openssl older than the fixed version? -->
    <criterion test_ref="oval:com.redhat.rhsa:tst:20241879002"
               comment="openssl is earlier than 1:3.0.7-27.el9_4"/>

    <!-- Check: is the package signed by Red Hat? -->
    <criterion test_ref="oval:com.redhat.rhsa:tst:20241879003"
               comment="openssl is signed with Red Hat redhatrelease2 key"/>
  </criteria>
</definition>`}</code>
        </pre>
        <p className="text-sm muted leading-relaxed">
          Let&apos;s break down what each element means and how a scanner uses
          it:
        </p>
        <ul className="list-disc pl-6 text-sm muted grid gap-2">
          <li>
            <strong>definition id</strong> &mdash; A unique identifier that
            maps to the RHSA number. The numeric suffix{" "}
            <code className={codeStyle}>20241879</code> corresponds to
            RHSA-2024:1879.
          </li>
          <li>
            <strong>class=&quot;patch&quot;</strong> &mdash; This definition
            describes a security patch. Other classes include
            &quot;vulnerability&quot; (describing the flaw itself) and
            &quot;inventory&quot; (describing system properties).
          </li>
          <li>
            <strong>affected platform</strong> &mdash; Which RHEL versions
            this definition applies to. Separate OVAL files exist for RHEL 7,
            8, and 9.
          </li>
          <li>
            <strong>reference elements</strong> &mdash; Cross-references to
            the RHSA advisory and the specific CVEs it addresses.
          </li>
          <li>
            <strong>criteria</strong> &mdash; The actual test logic. The{" "}
            <code className={codeStyle}>operator=&quot;AND&quot;</code> means
            ALL conditions must be true for the system to be considered
            vulnerable. The critical test is the version comparison:{" "}
            <code className={codeStyle}>
              openssl is earlier than 1:3.0.7-27.el9_4
            </code>
            .
          </li>
        </ul>
        <p className="text-sm muted leading-relaxed">
          When a scanner processes this definition, it performs an
          Epoch:Version-Release comparison using RPM&apos;s version comparison
          algorithm. If the installed{" "}
          <code className={codeStyle}>openssl</code> package has EVR{" "}
          <code className={codeStyle}>1:3.0.7-24.el9</code>, that is{" "}
          <em>earlier</em> than{" "}
          <code className={codeStyle}>1:3.0.7-27.el9_4</code>, so the
          system is vulnerable. If the installed EVR is{" "}
          <code className={codeStyle}>1:3.0.7-27.el9_4</code> or later,
          the criteria evaluates to false and the system is patched.
        </p>
        <p className="text-sm muted leading-relaxed">
          This is the correct way to assess RHEL security. The OVAL
          definition does not care that 3.0.7 is behind upstream &mdash; it
          only checks whether the release number is high enough to include the
          backported patch. This is why OVAL-based scanning produces
          dramatically fewer false positives than version-only scanning on
          RHEL.
        </p>
        <p className="text-sm muted leading-relaxed">
          Red Hat&apos;s OVAL data is available for free download. The files
          are organized per RHEL version:
        </p>
        <ul className="list-disc pl-6 text-sm muted grid gap-1">
          <li>
            <a
              href="https://access.redhat.com/security/data/oval/v2/RHEL9/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              RHEL 9 OVAL definitions
            </a>
          </li>
          <li>
            <a
              href="https://access.redhat.com/security/data/oval/v2/RHEL8/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              RHEL 8 OVAL definitions
            </a>
          </li>
          <li>
            <a
              href="https://access.redhat.com/security/data/oval/v2/RHEL7/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              RHEL 7 OVAL definitions
            </a>
          </li>
        </ul>
      </section>

      {/* ── 9. Red Hat vs Debian vs Alpine ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          Red Hat vs Debian vs Alpine: Different Approaches to Security
          Patching
        </h2>
        <p className="text-sm muted leading-relaxed">
          Red Hat is not the only distribution that backports, but their
          approach differs significantly from other major Linux distributions.
          Understanding these differences is important for teams that manage
          heterogeneous infrastructure.
        </p>
        <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className={thStyle}>Aspect</th>
                <th className={thStyle}>Red Hat / RHEL</th>
                <th className={thStyle}>Debian</th>
                <th className={thStyle}>Alpine</th>
              </tr>
            </thead>
            <tbody className="muted">
              <tr>
                <td className={`${tdStyle} font-medium`}>Approach</td>
                <td className={tdStyle}>Backport patches to frozen major version</td>
                <td className={tdStyle}>Backport for stable; upgrade for testing/unstable</td>
                <td className={tdStyle}>Track upstream closely; upgrade to latest</td>
              </tr>
              <tr>
                <td className={`${tdStyle} font-medium`}>Version policy</td>
                <td className={tdStyle}>Freeze major version, backport all security fixes</td>
                <td className={tdStyle}>Freeze for stable releases, full upgrades for testing</td>
                <td className={tdStyle}>Rolling releases with latest upstream versions</td>
              </tr>
              <tr>
                <td className={`${tdStyle} font-medium`}>Support window</td>
                <td className={tdStyle}>10+ years</td>
                <td className={tdStyle}>5 years (LTS)</td>
                <td className={tdStyle}>~2 years per branch</td>
              </tr>
              <tr>
                <td className={`${tdStyle} font-medium`}>Package versioning</td>
                <td className={tdStyle}><code className={codeStyle}>3.0.7-27.el9</code></td>
                <td className={tdStyle}><code className={codeStyle}>3.0.7-1~deb12u1</code></td>
                <td className={tdStyle}><code className={codeStyle}>3.0.7-r2</code></td>
              </tr>
              <tr>
                <td className={`${tdStyle} font-medium`}>Scanner challenge</td>
                <td className={tdStyle}>Must check release number against OVAL, not version</td>
                <td className={tdStyle}>Must check Debian revision against DSA/DLA data</td>
                <td className={tdStyle}>Simpler &mdash; versions closer to upstream</td>
              </tr>
              <tr>
                <td className={`${tdStyle} font-medium`}>Security data format</td>
                <td className={tdStyle}>OVAL XML + CSAF JSON + RHSA</td>
                <td className={tdStyle}>Debian Security Tracker + DSA/DLA</td>
                <td className={tdStyle}>Alpine SecDB (JSON)</td>
              </tr>
              <tr>
                <td className={`${tdStyle} font-medium`}>False positive risk</td>
                <td className={tdStyle}>Very high if scanner ignores release</td>
                <td className={tdStyle}>High if scanner ignores debian revision</td>
                <td className={tdStyle}>Low &mdash; versions track upstream</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm muted leading-relaxed">
          Debian uses a similar backporting strategy for its stable releases.
          A Debian Stable package might show{" "}
          <code className={codeStyle}>openssl 3.0.11-1~deb12u2</code> where
          the <code className={codeStyle}>u2</code> suffix indicates the
          second security update. Debian&apos;s approach is slightly less
          aggressive than Red Hat&apos;s &mdash; Debian may upgrade to a newer
          upstream point release (3.0.11 instead of staying at 3.0.7) if the
          security team determines it&apos;s safe to do so.
        </p>
        <p className="text-sm muted leading-relaxed">
          Alpine takes the opposite approach entirely. Alpine tracks upstream
          closely and typically ships the latest upstream version or one very
          close to it. This makes version-based scanning more accurate on
          Alpine but means that Alpine users experience more frequent package
          changes and potential API breakage. For container workloads where
          images are rebuilt frequently, this tradeoff is often acceptable.
        </p>
        <p className="text-sm muted leading-relaxed">
          For a deeper discussion of scanning approaches across different
          package ecosystems, see our article on{" "}
          <Link
            href="/blog/installed-state-vs-advisory-matching"
            className="font-medium underline underline-offset-2"
          >
            installed-state scanning vs. advisory matching
          </Link>
          .
        </p>
      </section>

      {/* ── 10. FAQ ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          Frequently Asked Questions
        </h2>
        <div className="grid gap-4">
          {faqItems.map((item, i) => (
            <details
              key={i}
              className="group rounded-xl border border-black/10 dark:border-white/10 overflow-hidden"
            >
              <summary className="cursor-pointer select-none p-4 text-sm font-medium flex items-center justify-between hover:bg-black/[.02] dark:hover:bg-white/[.02] transition-colors">
                {item.q}
                <svg
                  className="w-4 h-4 muted shrink-0 ml-3 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div className="px-4 pb-4 text-sm muted leading-relaxed">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── 11. Further Reading + CTA ── */}
      <section className="surface-card p-7 grid gap-5">
        <h2 className="text-xl font-semibold tracking-tight">
          Further Reading
        </h2>
        <ul className="list-disc pl-6 text-sm muted grid gap-1">
          <li>
            <a
              href="https://access.redhat.com/security/updates/backporting"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              Red Hat&apos;s official backporting policy
            </a>{" "}
            &mdash; Red Hat&apos;s own explanation of their backporting process
          </li>
          <li>
            <a
              href="https://access.redhat.com/security/data/oval/v2/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              Red Hat OVAL v2 data
            </a>{" "}
            &mdash; Machine-readable vulnerability definitions for RHEL 7, 8, 9
          </li>
          <li>
            <a
              href="https://access.redhat.com/security/data/csaf/v2/advisories/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              Red Hat CSAF advisories
            </a>{" "}
            &mdash; JSON-based security advisory feed
          </li>
          <li>
            <a
              href="https://access.redhat.com/security/cve/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              Red Hat CVE Database
            </a>{" "}
            &mdash; Per-CVE status for every RHEL product
          </li>
          <li>
            <a
              href="https://access.redhat.com/articles/11258"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              Red Hat Enterprise Linux Life Cycle
            </a>{" "}
            &mdash; Support timeline and phase definitions
          </li>
          <li>
            <a
              href="https://oval.cisecurity.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              OVAL project at CIS
            </a>{" "}
            &mdash; The OVAL standard specification
          </li>
        </ul>

        <h3 className="text-sm font-semibold mt-2">
          Related ScanRook articles
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link className="btn-secondary" href="/blog/what-is-osv">
            What is OSV?
          </Link>
          <Link className="btn-secondary" href="/blog/understanding-nvd-and-cvss">
            NVD and CVSS explained
          </Link>
          <Link className="btn-secondary" href="/blog/installed-state-vs-advisory-matching">
            Installed-state vs advisory matching
          </Link>
          <Link className="btn-secondary" href="/blog/scanrook-benchmark-results">
            Benchmark results
          </Link>
          <Link className="btn-secondary" href="/blog/container-scanning-best-practices">
            Container scanning guide
          </Link>
          <Link className="btn-secondary" href="/docs/data-sources">
            Data sources
          </Link>
          <Link className="btn-secondary" href="/blog">
            All articles
          </Link>
        </div>

        <div className="mt-4 rounded-xl bg-red-500/[.06] border border-red-500/20 p-5 grid gap-3">
          <h3 className="text-sm font-semibold">
            Scan your RHEL containers with ScanRook
          </h3>
          <p className="text-sm muted leading-relaxed">
            ScanRook uses Red Hat OVAL data, OSV, and per-package API lookups
            to accurately scan RHEL, Rocky Linux, and AlmaLinux containers
            without the false positives that plague version-only scanners.
            Upload a container image to see the difference.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Start scanning
            </Link>
            <Link href="/docs" className="btn-secondary">
              Read the docs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
