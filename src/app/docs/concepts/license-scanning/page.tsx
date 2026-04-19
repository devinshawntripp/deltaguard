import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "License Scanning and Compliance | ScanRook Docs",
  description:
    "How ScanRook detects open source licenses across RPM, APK, dpkg, npm, pip, and Cargo ecosystems, classifies risk levels, and enforces license policies.",
  keywords: [
    "open source license scanning",
    "license compliance",
    "SPDX",
    "copyleft",
    "GPL compliance",
    "software composition analysis",
    "license risk",
    "SCA license detection",
  ],
  alternates: {
    canonical: "/docs/concepts/license-scanning",
  },
  openGraph: {
    title: "License Scanning and Compliance | ScanRook Docs",
    description:
      "How ScanRook detects open source licenses across RPM, APK, dpkg, npm, pip, and Cargo ecosystems, classifies risk levels, and enforces license policies.",
    type: "article",
    url: "/docs/concepts/license-scanning",
  },
  twitter: {
    card: "summary_large_image",
    title: "License Scanning and Compliance | ScanRook Docs",
    description:
      "How ScanRook detects open source licenses across RPM, APK, dpkg, npm, pip, and Cargo ecosystems, classifies risk levels, and enforces license policies.",
  },
};

export default function LicenseScanningPage() {
  return (
    <article className="grid gap-6">
      {/* Intro */}
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          License Scanning and Compliance
        </h1>
        <p className="muted text-sm max-w-3xl">
          Every open source component in your software carries a license that
          dictates how you can use, modify, and distribute it. Violating those
          terms exposes your organization to litigation, injunctions, and forced
          disclosure of proprietary source code. License scanning identifies
          every license in your dependency tree so you can enforce policy before
          a legal obligation becomes a legal liability.
        </p>
      </section>

      {/* What is License Scanning? */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="What Is License Scanning?"
          blurb="Understanding why automated license detection is a business requirement."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            License scanning is the automated process of identifying the
            software licenses attached to every component in a codebase,
            container image, or binary artifact. Unlike vulnerability scanning,
            which looks for known security flaws, license scanning answers a
            different question: <em>are you legally allowed to use this software
            the way you are using it?</em>
          </p>
          <p>
            The average enterprise application contains between 500 and 1,500
            open source dependencies. Each one carries a license. Some of those
            licenses are permissive and require nothing more than an attribution
            notice. Others are copyleft and require you to release your own
            source code under the same terms if you distribute the combined
            work. A single copyleft dependency buried in a transitive dependency
            chain can create a legal obligation that applies to your entire
            product.
          </p>
          <p>
            Manual license review does not scale. Developers add dependencies
            constantly, transitive dependencies pull in dozens of packages the
            developer never explicitly chose, and license terms change between
            versions. Elasticsearch famously{" "}
            <a
              href="https://www.elastic.co/blog/licensing-change"
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              switched from Apache-2.0 to SSPL
            </a>{" "}
            in 2021, meaning that organizations upgrading without checking the
            new license suddenly had a completely different set of obligations.
          </p>
          <p>
            License scanning matters in three concrete scenarios: M&A due
            diligence (acquirers will audit your open source usage), compliance
            with internal policies (most enterprises have approved license
            lists), and regulatory requirements (the EU Cyber Resilience Act
            and US Executive Order 14028 both mandate software supply chain
            transparency, which includes license data in SBOMs).
          </p>
        </div>
      </section>

      {/* How ScanRook Detects Licenses */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="How ScanRook Detects Licenses"
          blurb="Extraction from package metadata across every major ecosystem."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            ScanRook extracts license information from the authoritative
            metadata source for each package ecosystem. Rather than guessing
            licenses from file contents or relying on heuristic text matching,
            ScanRook reads the structured fields that package managers
            themselves use to record license data.
          </p>
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            RPM-based distributions (RHEL, CentOS, Fedora, Rocky, Alma)
          </h3>
          <p>
            ScanRook reads the RPM database at{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">
              /var/lib/rpm/Packages
            </code>{" "}
            and extracts the <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">License</code> header
            tag from each installed package. RPM packages use Fedora license
            identifiers (e.g., <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">GPLv2+</code>,{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">MIT</code>,{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">ASL 2.0</code>), which
            ScanRook normalizes to SPDX identifiers.
          </p>
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            APK-based distributions (Alpine Linux)
          </h3>
          <p>
            Alpine packages store metadata in{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">
              /lib/apk/db/installed
            </code>
            . ScanRook parses the <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">L:</code> field
            from each package entry, which contains the SPDX license expression
            directly. Alpine adopted SPDX identifiers early, making this the
            most straightforward ecosystem to parse.
          </p>
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            dpkg-based distributions (Debian, Ubuntu)
          </h3>
          <p>
            Debian packages store license information in{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">
              /usr/share/doc/&lt;package&gt;/copyright
            </code>{" "}
            files. ScanRook reads each copyright file and extracts the license
            identifier from the machine-readable{" "}
            <a
              href="https://www.debian.org/doc/packaging-manuals/copyright-format/1.0/"
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              DEP-5 format
            </a>
            . When a copyright file uses the older free-text format, ScanRook
            falls back to pattern matching against known license texts.
          </p>
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            npm (Node.js)
          </h3>
          <p>
            ScanRook reads the{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">license</code> field from
            each package&apos;s{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">package.json</code>. The npm
            registry requires packages to declare a license using an{" "}
            <a
              href="https://spdx.org/licenses/"
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              SPDX identifier
            </a>
            . Older packages may use the deprecated{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">licenses</code> array
            format, which ScanRook also handles.
          </p>
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            pip (Python)
          </h3>
          <p>
            Python packages installed via pip store metadata in{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">METADATA</code> files
            within{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">
              site-packages/&lt;package&gt;.dist-info/
            </code>
            . ScanRook reads the{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">License</code> header and
            the{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">Classifier</code> entries
            that begin with{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">
              License :: OSI Approved ::
            </code>
            . When both are present, the classifier takes precedence as it is
            more structured.
          </p>
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Cargo (Rust)
          </h3>
          <p>
            Rust crates declare their license in{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">Cargo.toml</code> using the{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">license</code> field, which
            accepts SPDX expressions (e.g.,{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">MIT OR Apache-2.0</code>).
            ScanRook parses compiled crate metadata and Cargo.lock to resolve
            the license for each dependency in the tree.
          </p>
        </div>
      </section>

      {/* License Risk Levels */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="License Risk Levels"
          blurb="How ScanRook classifies licenses by commercial risk."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            ScanRook assigns every detected license to one of five risk tiers.
            These tiers reflect the degree of obligation the license imposes on
            organizations distributing or deploying software that contains the
            licensed component.
          </p>

          <RiskTier
            level="Critical"
            color="text-red-600 dark:text-red-400"
            licenses="AGPL-3.0, SSPL-1.0"
            description="Network copyleft and source-available licenses that require disclosure of your entire application source code if you offer the software as a service or over a network. Most commercial organizations treat these as hard blockers. The AGPL-3.0 triggers source disclosure for any user who interacts with the software over a network, which includes virtually all SaaS applications. The SSPL goes further, requiring disclosure of your entire service stack including management, monitoring, and deployment tooling."
          />
          <RiskTier
            level="High"
            color="text-orange-600 dark:text-orange-400"
            licenses="GPL-2.0, GPL-3.0, BSL-1.1"
            description="Strong copyleft and source-available licenses that impose significant obligations. GPL-2.0 and GPL-3.0 require that any distributed derivative work be released under the same license, including your proprietary code if it is linked with the GPL component. BSL-1.1 (Business Source License) restricts production use until a specified change date, after which the code converts to an open source license. These licenses require legal review before adoption."
          />
          <RiskTier
            level="Medium"
            color="text-yellow-600 dark:text-yellow-400"
            licenses="LGPL-2.1, LGPL-3.0, MPL-2.0, EPL-2.0"
            description="Weak copyleft licenses that limit the copyleft obligation to the licensed component itself, not your entire application. The LGPL allows you to use the library without disclosing your own source code, provided you link dynamically and allow users to replace the LGPL library. MPL-2.0 applies copyleft at the file level -- you must share modifications to MPL-licensed files, but your own files remain under your chosen license. These are generally acceptable for commercial use with minor compliance effort."
          />
          <RiskTier
            level="Low"
            color="text-blue-600 dark:text-blue-400"
            licenses="Apache-2.0"
            description="Permissive with a patent grant. Apache-2.0 allows unrestricted commercial use, modification, and distribution. The main obligation is including the original license text and NOTICE file, plus providing attribution. The license includes an explicit patent grant from contributors, which provides additional legal protection. The patent retaliation clause terminates the patent grant if the licensee initiates patent litigation against the licensor."
          />
          <RiskTier
            level="None"
            color="text-green-600 dark:text-green-400"
            licenses="MIT, BSD-2-Clause, BSD-3-Clause, ISC, Unlicense, CC0-1.0"
            description="Maximally permissive licenses with minimal obligations. MIT and BSD require only that you include the original copyright notice and license text. ISC is functionally equivalent to MIT with simpler language. The Unlicense and CC0-1.0 are public domain dedications that waive all copyright, imposing no obligations at all. These licenses are safe for any commercial use."
          />
        </div>
      </section>

      {/* Copyleft vs Permissive */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Copyleft vs Permissive Licenses"
          blurb="The fundamental distinction that determines your compliance obligations."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            The single most important distinction in open source licensing is
            between <strong>permissive</strong> and <strong>copyleft</strong>{" "}
            licenses. Understanding this distinction is the foundation of any
            license compliance program.
          </p>
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Permissive licenses
          </h3>
          <p>
            Permissive licenses (MIT, BSD, Apache-2.0, ISC) grant broad
            freedoms with minimal conditions. You can use the code in
            proprietary software, modify it without sharing your changes, and
            distribute it commercially. The typical obligation is limited to
            preserving the original copyright notice and license text somewhere
            in your distribution -- usually in a NOTICES file or an
            &quot;About&quot; dialog. Approximately 70% of packages on npm and
            over 60% of packages on PyPI use permissive licenses.
          </p>
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Copyleft licenses
          </h3>
          <p>
            Copyleft licenses (GPL, LGPL, AGPL, MPL) require that derivative
            works be distributed under the same or a compatible license. The
            practical effect for commercial software is that if you include a
            GPL-licensed component and distribute the combined work, you must
            make your entire application&apos;s source code available under the
            GPL. This is sometimes called the &quot;viral&quot; effect of
            copyleft, though the{" "}
            <a
              href="https://www.fsf.org/"
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Free Software Foundation
            </a>{" "}
            considers this a feature, not a bug.
          </p>
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Why copyleft matters for proprietary software
          </h3>
          <p>
            If your business model depends on keeping your source code
            proprietary, copyleft licenses create a direct conflict. A single
            GPL dependency statically linked into your application can require
            you to release the source code for the entire application. This is
            not theoretical -- the{" "}
            <a
              href="https://gpl-violations.org/"
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              gpl-violations.org
            </a>{" "}
            project has documented hundreds of enforcement actions, and the
            Software Freedom Conservancy has pursued multiple high-profile cases
            against companies using Linux kernel code in proprietary products
            without complying with GPL-2.0 requirements.
          </p>
        </div>
      </section>

      {/* License Compatibility */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="License Compatibility"
          blurb="Which licenses can coexist in the same project."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            License compatibility determines whether code under two different
            licenses can be combined into a single work. Incompatible licenses
            create legal conflicts that cannot be resolved by technical means --
            if two dependencies in your project have incompatible licenses,
            you must remove one of them or find an alternative.
          </p>
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Common compatibility rules
          </h3>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>
              <strong>Permissive + Permissive</strong> -- Always compatible. MIT
              code and Apache-2.0 code can be combined freely.
            </li>
            <li>
              <strong>Permissive + Copyleft</strong> -- Generally compatible,
              but the combined work must be distributed under the copyleft
              license. MIT code can be included in a GPL project, but the
              result is GPL.
            </li>
            <li>
              <strong>GPL-2.0 + Apache-2.0</strong> -- The{" "}
              <a
                href="https://www.fsf.org/blogs/licensing/fsf-and-apache-foundation-resolve-license-compatibility"
                className="font-medium underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                FSF considers
              </a>{" "}
              Apache-2.0 incompatible with GPL-2.0 due to the patent
              retaliation clause, but compatible with GPL-3.0. This is one of
              the most common compatibility pitfalls.
            </li>
            <li>
              <strong>GPL-2.0 + GPL-3.0</strong> -- Incompatible unless the
              GPL-2.0 code uses the &quot;or later&quot; clause (GPL-2.0+).
              Code licensed as &quot;GPL-2.0-only&quot; cannot be combined with
              GPL-3.0 code.
            </li>
            <li>
              <strong>AGPL-3.0 + Proprietary</strong> -- Incompatible. You
              cannot combine AGPL code with proprietary code and distribute the
              result without releasing everything under AGPL-3.0.
            </li>
          </ul>
          <p>
            ScanRook detects these conflicts by analyzing the full license set
            across your dependency tree and flagging combinations that create
            compatibility issues. For a complete reference of license types and
            their terms, see the{" "}
            <Link
              href="/docs/concepts/license-types"
              className="font-medium underline underline-offset-2"
            >
              License Types guide
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Compliance Obligations */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Compliance Obligations by License Type"
          blurb="What you actually have to do for each license category."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            Understanding your obligations is the difference between being
            compliant and being exposed. Here is what each major license
            category requires when you distribute software containing the
            licensed component:
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            MIT / BSD / ISC -- Attribution
          </h3>
          <p>
            Include the original copyright notice and license text in your
            distribution. This typically means adding a NOTICES or
            THIRD-PARTY-LICENSES file to your release artifacts. No source code
            disclosure is required. No restrictions on commercial use.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Apache-2.0 -- Attribution + NOTICE + Patent Grant
          </h3>
          <p>
            Include the license text and any NOTICE file from the original
            project. If you modify Apache-2.0 files, you must state that you
            changed them. The patent grant gives you a license to any patents
            held by contributors that cover the contribution, but this grant
            terminates if you sue the licensor for patent infringement.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            LGPL -- Dynamic Linking + Replacement
          </h3>
          <p>
            You must allow users to replace the LGPL library with a modified
            version. In practice, this means dynamically linking against the
            LGPL component and distributing your application in a form that
            permits relinking. You must also provide the LGPL library&apos;s
            source code (or a written offer to provide it) if you distribute
            the library itself.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            MPL-2.0 -- File-Level Copyleft
          </h3>
          <p>
            If you modify files that are under MPL-2.0, you must make the
            modified source code of those specific files available under
            MPL-2.0. Your own new files can remain under any license. This
            makes MPL-2.0 one of the most commercially friendly copyleft
            licenses.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            GPL -- Full Source Disclosure
          </h3>
          <p>
            If you distribute a combined work that includes GPL-licensed code,
            you must make the complete corresponding source code of the entire
            combined work available under the GPL. This applies to statically
            linked components, and for GPL-3.0, also to &quot;Installation
            Information&quot; (signing keys, etc.) needed to install modified
            versions on consumer devices.
          </p>

          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            AGPL-3.0 -- Network Disclosure
          </h3>
          <p>
            All GPL obligations apply, plus: if users interact with the
            software over a network (including via a web browser or API), you
            must provide the complete source code to those users. This
            effectively requires SaaS providers to release their entire
            application source code if any AGPL component is included.
          </p>
        </div>
      </section>

      {/* Using License Policies */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Using License Policies in ScanRook"
          blurb="Enforce approved license lists and block risky licenses before deployment."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            ScanRook allows organizations to define license policies that
            automatically flag or block packages based on their license. This
            turns license compliance from a manual review process into an
            automated gate.
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>
              <strong>Blocklist mode</strong> -- Specify licenses that are
              never allowed (e.g., AGPL-3.0, SSPL-1.0, GPL-3.0). Any scan
              that detects a blocked license will be flagged as a policy
              violation. This is the most common approach for commercial
              software organizations.
            </li>
            <li>
              <strong>Allowlist mode</strong> -- Specify the only licenses
              that are permitted (e.g., MIT, BSD-2-Clause, Apache-2.0). Any
              license not on the list is flagged. This is stricter but
              provides the strongest guarantee of compliance.
            </li>
            <li>
              <strong>Risk threshold mode</strong> -- Flag any license at or
              above a specified risk level (e.g., flag all Medium and above).
              This uses ScanRook&apos;s built-in risk tiers to automatically
              catch licenses that need review.
            </li>
          </ul>
          <p>
            License policies can be configured per-organization in the{" "}
            <Link
              href="/dashboard"
              className="font-medium underline underline-offset-2"
            >
              ScanRook dashboard
            </Link>{" "}
            and enforced in CI/CD pipelines via the{" "}
            <Link
              href="/docs/integrations/github-actions"
              className="font-medium underline underline-offset-2"
            >
              GitHub Actions
            </Link>{" "}
            or{" "}
            <Link
              href="/docs/integrations/gitlab-ci"
              className="font-medium underline underline-offset-2"
            >
              GitLab CI
            </Link>{" "}
            integrations.
          </p>
        </div>
      </section>

      {/* Further reading */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Further reading"
          blurb="Related guides and documentation."
        />
        <ul className="list-disc pl-6 text-sm muted grid gap-1">
          <li>
            <Link
              href="/docs/concepts/license-types"
              className="font-medium underline underline-offset-2"
            >
              Open Source License Types
            </Link>{" "}
            -- A comprehensive reference for every major open source license.
          </li>
          <li>
            <Link
              href="/blog/open-source-license-compliance-guide"
              className="font-medium underline underline-offset-2"
            >
              The Complete Guide to Open Source License Compliance
            </Link>{" "}
            -- Building a compliance program from scratch.
          </li>
          <li>
            <Link
              href="/blog/what-we-learned-from-black-duck"
              className="font-medium underline underline-offset-2"
            >
              What We Learned from Black Duck
            </Link>{" "}
            -- How modern license scanning has evolved beyond proprietary
            fingerprint databases.
          </li>
          <li>
            <Link
              href="/docs/concepts/compliance"
              className="font-medium underline underline-offset-2"
            >
              Compliance & Regulatory Overview
            </Link>{" "}
            -- How ScanRook maps to regulatory frameworks.
          </li>
        </ul>
      </section>
    </article>
  );
}

function SectionHeader({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="grid gap-1">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm muted">{blurb}</p>
    </div>
  );
}

function RiskTier({
  level,
  color,
  licenses,
  description,
}: {
  level: string;
  color: string;
  licenses: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
      <div className="flex items-center gap-3">
        <span className={`text-sm font-bold ${color}`}>{level} Risk</span>
        <span className="text-xs muted">{licenses}</span>
      </div>
      <p className="text-sm muted">{description}</p>
    </div>
  );
}
