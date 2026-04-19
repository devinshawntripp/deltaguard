import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Open Source License Types: A Complete Guide | ScanRook",
  description:
    "A definitive reference to open source licenses: MIT, Apache, GPL, AGPL, LGPL, MPL, SSPL, BSL, and more. SPDX identifiers, compatibility, and obligations explained.",
  keywords: [
    "open source licenses explained",
    "MIT license",
    "GPL license",
    "Apache license",
    "SPDX license identifiers",
    "copyleft explained",
    "license compatibility",
    "AGPL license",
    "LGPL license",
    "open source license types",
  ],
  alternates: {
    canonical: "/docs/concepts/license-types",
  },
  openGraph: {
    title: "Open Source License Types: A Complete Guide | ScanRook",
    description:
      "A definitive reference to open source licenses: MIT, Apache, GPL, AGPL, LGPL, MPL, SSPL, BSL, and more. SPDX identifiers, compatibility, and obligations explained.",
    type: "article",
    url: "/docs/concepts/license-types",
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Source License Types: A Complete Guide | ScanRook",
    description:
      "A definitive reference to open source licenses: MIT, Apache, GPL, AGPL, LGPL, MPL, SSPL, BSL, and more.",
  },
};

export default function LicenseTypesPage() {
  return (
    <article className="grid gap-6">
      {/* Intro */}
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Open Source License Types: A Complete Guide
        </h1>
        <p className="muted text-sm max-w-3xl">
          There are hundreds of open source licenses, but a relatively small
          number account for the vast majority of packages in use. This
          reference covers every license you are likely to encounter, organized
          by the obligations they impose. Each entry includes the{" "}
          <a
            href="https://spdx.org/licenses/"
            className="font-medium underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            SPDX identifier
          </a>
          , a plain-language summary of what the license requires, and guidance
          on commercial use.
        </p>
      </section>

      {/* Permissive Licenses */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Permissive Licenses"
          blurb="Maximum freedom, minimal obligations. Safe for commercial use."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            Permissive licenses allow you to use, modify, and redistribute the
            software for any purpose -- including proprietary commercial use --
            with minimal conditions. The typical requirement is preserving the
            original copyright notice and license text. These licenses do not
            require you to share your source code or license your own work
            under the same terms.
          </p>

          <LicenseEntry
            spdx="MIT"
            name="MIT License"
            osiApproved
            description="The most popular open source license. Permits commercial use, modification, distribution, and private use. Requires only that the copyright notice and license text be included in all copies or substantial portions of the software. No warranty, no liability. The MIT license is used by React, jQuery, Rails, .NET, and tens of thousands of npm packages."
            obligations={[
              "Include copyright notice and license text in distributions",
            ]}
          />

          <LicenseEntry
            spdx="BSD-2-Clause"
            name='BSD 2-Clause "Simplified" License'
            osiApproved
            description='Also known as the "FreeBSD License." Functionally identical to MIT -- permits all use with attribution. The only difference from MIT is the wording. Used by FreeBSD, some parts of the Go standard library, and many academic projects.'
            obligations={[
              "Include copyright notice and license text in source and binary distributions",
            ]}
          />

          <LicenseEntry
            spdx="BSD-3-Clause"
            name='BSD 3-Clause "New" or "Revised" License'
            osiApproved
            description='Adds a "no endorsement" clause to BSD-2-Clause: you cannot use the name of the copyright holder or contributors to endorse or promote products derived from the software without written permission. Used by the original BSD operating system derivatives, Django, and many scientific computing libraries.'
            obligations={[
              "Include copyright notice and license text",
              "Do not use contributor names for endorsement without permission",
            ]}
          />

          <LicenseEntry
            spdx="ISC"
            name="ISC License"
            osiApproved
            description='A simplified version of MIT/BSD written by the Internet Systems Consortium. Functionally equivalent to MIT but with cleaner, more concise language. The ISC license removed the "sublicense" and "sell copies" clauses from MIT because they are considered redundant under copyright law. Used by the ISC BIND DNS server, OpenBSD, and many npm packages.'
            obligations={[
              "Include copyright notice and license text",
            ]}
          />

          <LicenseEntry
            spdx="Apache-2.0"
            name="Apache License 2.0"
            osiApproved
            description="A permissive license with an explicit patent grant. Contributors grant users a royalty-free patent license covering any patents that the contribution necessarily infringes. This provides stronger IP protection than MIT or BSD. However, the patent grant terminates if the user initiates patent litigation against the licensor. Used by Android, Kubernetes, TensorFlow, Apache HTTP Server, and the majority of the Java ecosystem."
            obligations={[
              "Include license text and NOTICE file",
              "State changes made to the original files",
              "Patent grant terminates upon patent litigation against contributors",
            ]}
          />

          <LicenseEntry
            spdx="Unlicense"
            name="The Unlicense"
            osiApproved
            description='A public domain dedication. The author waives all copyright and related rights, placing the work in the public domain worldwide. If public domain dedication is not legally effective in a jurisdiction, the Unlicense grants a permissive license as a fallback. The Unlicense is more aggressive than CC0 in its waiver of moral rights. Some legal scholars question whether a complete waiver of copyright is possible in civil law jurisdictions.'
            obligations={[
              "None -- no conditions of any kind",
            ]}
          />

          <LicenseEntry
            spdx="CC0-1.0"
            name="Creative Commons Zero v1.0 Universal"
            description="A public domain dedication created by Creative Commons. Waives all copyright and neighboring rights to the maximum extent permitted by law. Unlike the Unlicense, CC0 includes a comprehensive fallback license for jurisdictions where public domain dedication is not legally possible. CC0 is preferred for data, documentation, and configuration files rather than software, though it is used by some software projects."
            obligations={[
              "None -- no conditions of any kind",
            ]}
          />
        </div>
      </section>

      {/* Weak Copyleft */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Weak Copyleft Licenses"
          blurb="Copyleft limited to the licensed component, not your entire application."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            Weak copyleft licenses require that modifications to the licensed
            component itself be shared under the same license, but they do not
            extend the copyleft obligation to your own code that merely uses
            the component. The scope of the copyleft varies: LGPL applies at
            the library level, MPL applies at the file level, and EPL applies
            at the module level.
          </p>

          <LicenseEntry
            spdx="LGPL-2.1-only"
            name="GNU Lesser General Public License v2.1"
            osiApproved
            description="Designed specifically for software libraries. If you dynamically link against an LGPL library, your own application code does not need to be released under the LGPL. However, you must: (1) allow users to replace the LGPL library with a modified version, (2) provide the LGPL library's source code, and (3) not impose additional restrictions on the LGPL components. Static linking triggers the full LGPL copyleft requirements, requiring that the user be able to relink the application with a modified version of the library. Used by glibc, GTK 2.x, and many GNU libraries."
            obligations={[
              "Distribute LGPL library source code",
              "Allow library replacement (dynamic linking preferred)",
              "Include license text and copyright notices",
              "Modifications to LGPL files must be shared under LGPL",
            ]}
          />

          <LicenseEntry
            spdx="LGPL-3.0-only"
            name="GNU Lesser General Public License v3.0"
            osiApproved
            description="The LGPL-3.0 is structured as additional permissions on top of the GPL-3.0. It provides the same library-level copyleft as LGPL-2.1 but adds the GPL-3.0's anti-Tivoization provisions: if you distribute a device that contains LGPL-3.0 software, you must provide the installation information needed to install modified versions of the LGPL library on that device. Used by GCC runtime libraries and some GNOME components."
            obligations={[
              "All LGPL-2.1 obligations apply",
              "Provide installation information for consumer devices",
              "Cannot impose DRM that prevents library replacement",
            ]}
          />

          <LicenseEntry
            spdx="MPL-2.0"
            name="Mozilla Public License 2.0"
            osiApproved
            description='File-level copyleft. If you modify a file that is under MPL-2.0, you must make the modified source of that specific file available under MPL-2.0. Your own new files can be under any license, including proprietary. This makes MPL-2.0 one of the most commercially friendly copyleft licenses. MPL-2.0 also includes an explicit "Larger Work" provision that allows combining MPL code with proprietary code without the copyleft extending to the proprietary files. Additionally, MPL-2.0 has a built-in compatibility clause with GPL-2.0+, LGPL-2.1+, and AGPL-3.0. Used by Firefox, Terraform (pre-BSL switch), and LibreOffice.'
            obligations={[
              "Modified MPL files must remain under MPL-2.0",
              "Source code of modified MPL files must be made available",
              "Include license text",
              "Your own new files can be under any license",
            ]}
          />

          <LicenseEntry
            spdx="EPL-2.0"
            name="Eclipse Public License 2.0"
            osiApproved
            description="Module-level copyleft used primarily in the Eclipse/Java ecosystem. Modifications to EPL-covered code must be released under EPL-2.0, but your own modules that merely depend on EPL modules remain under your chosen license. EPL-2.0 includes a secondary license clause that allows the original author to designate GPL-2.0+ as an alternative license, enabling combination with GPL projects. Used by Eclipse IDE, Jakarta EE, and many Eclipse Foundation projects."
            obligations={[
              "Modifications to EPL code must be released under EPL-2.0",
              "Include license text",
              "Patent grant included (terminates on patent litigation)",
              "Your own separate modules can use any license",
            ]}
          />
        </div>
      </section>

      {/* Strong Copyleft */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Strong Copyleft Licenses"
          blurb="Derivative works must be released under the same license."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            Strong copyleft licenses require that the entire combined work --
            including your proprietary code -- be released under the same
            copyleft license if you distribute it. The definition of
            &quot;combined work&quot; and &quot;distribution&quot; varies
            between licenses, and these definitions are where most compliance
            complexity lies.
          </p>

          <LicenseEntry
            spdx="GPL-2.0-only"
            name="GNU General Public License v2.0"
            osiApproved
            description='The license that started the copyleft movement. GPL-2.0 requires that if you distribute a "work based on" GPL code, the entire work must be released under GPL-2.0. "Distribution" means providing copies to others -- using GPL software internally without distributing it does not trigger the copyleft obligation. The key question is what constitutes a "derivative work": static linking clearly creates one, dynamic linking is debated, and separate process communication (via pipes, sockets, or RPC) is generally considered not to create a derivative work. The Linux kernel is the most prominent GPL-2.0 project, and its "syscall exception" explicitly permits userspace programs to use kernel services without becoming derivative works.'
            obligations={[
              "Distribute complete source code of the combined work under GPL-2.0",
              "Include license text and copyright notices",
              "Provide source code (or written offer) to anyone who receives a binary",
              "Cannot impose additional restrictions beyond the GPL",
            ]}
          />

          <LicenseEntry
            spdx="GPL-3.0-only"
            name="GNU General Public License v3.0"
            osiApproved
            description='GPL-3.0 adds several provisions beyond GPL-2.0: (1) an explicit patent grant from contributors, (2) anti-Tivoization provisions requiring "Installation Information" for consumer devices, (3) compatibility with Apache-2.0 (resolving a longstanding incompatibility), and (4) stronger protections against DRM restrictions. The anti-Tivoization clause is the most controversial addition -- it requires that if you distribute GPL-3.0 software on a device, you must provide the keys and instructions needed to install modified versions. This is why the Linux kernel remains GPL-2.0 only: Linus Torvalds has publicly rejected GPL-3.0 because of this provision. Used by GCC, GIMP, Bash, and many GNU utilities.'
            obligations={[
              "All GPL-2.0 obligations apply",
              "Provide installation information for consumer devices",
              "Explicit patent grant (terminates on patent litigation)",
              "Cannot impose DRM that restricts users from running modified versions",
            ]}
          />
        </div>
      </section>

      {/* Network Copyleft */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Network Copyleft"
          blurb="SaaS and network use triggers source disclosure."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            The GPL&apos;s copyleft is triggered by &quot;distribution&quot; --
            providing copies of the software to others. Running GPL software on
            your own servers to provide a web service is not distribution, so
            SaaS companies can use GPL code without disclosing their source.
            Network copyleft licenses close this gap.
          </p>

          <LicenseEntry
            spdx="AGPL-3.0-only"
            name="GNU Affero General Public License v3.0"
            osiApproved
            description='The AGPL-3.0 is the GPL-3.0 with one additional clause (Section 13): if you run a modified version of the software on a server and users interact with it over a network, you must provide the source code to those users. "Interact remotely through a computer network" includes any interaction via HTTP, WebSocket, gRPC, or any other protocol. This means that SaaS providers using AGPL-3.0 components must release the source code of their entire application -- not just the AGPL component, but the complete combined work. Major companies including Google have banned AGPL internally. Used by MongoDB (before the SSPL switch), Grafana, and Nextcloud.'
            obligations={[
              "All GPL-3.0 obligations apply",
              "Network users must be offered source code access",
              "Source must be available via a prominently displayed download link",
              "Applies to the entire combined work, not just the AGPL component",
            ]}
          />
        </div>
      </section>

      {/* Source-Available */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Source-Available Licenses"
          blurb="Source code is visible but commercial use is restricted. Not OSI-approved."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            Source-available licenses make the source code publicly readable
            but impose restrictions that disqualify them from the{" "}
            <a
              href="https://opensource.org/osd"
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Source Definition
            </a>{" "}
            maintained by the{" "}
            <a
              href="https://opensource.org/"
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Source Initiative
            </a>
            . These licenses typically restrict competing commercial use while
            allowing most other uses. They are increasingly common among
            venture-backed companies that want community contributions without
            allowing cloud providers to resell hosted versions.
          </p>

          <LicenseEntry
            spdx="SSPL-1.0"
            name="Server Side Public License v1"
            description='Created by MongoDB in 2018 after Amazon launched DocumentDB as a managed MongoDB-compatible service. The SSPL is based on AGPL-3.0 but extends the network copyleft to cover the entire "service" -- if you offer the SSPL software as a service, you must release the source code of your entire service stack, including management software, backup systems, monitoring tools, and deployment automation. The OSI rejected the SSPL as not meeting the Open Source Definition because of this extreme breadth. MongoDB, Graylog, and some Elastic products use the SSPL.'
            obligations={[
              "All AGPL-3.0 obligations apply",
              "If offered as a service, must release source code of the entire service stack",
              "Service stack includes management, monitoring, deployment, and backup tooling",
              "Not OSI-approved -- not considered open source",
            ]}
          />

          <LicenseEntry
            spdx="BSL-1.1"
            name="Business Source License 1.1"
            description='A time-delayed open source license created by MariaDB. Software under BSL-1.1 is source-available with restrictions on production use for a specified period (the "change date"), after which it automatically converts to an open source license (the "change license," typically GPL-2.0 or Apache-2.0). The "Additional Use Grant" field specifies which production uses are allowed before the change date -- for example, HashiCorp allows non-competing use. BSL-1.1 is used by HashiCorp (Terraform, Vault, Consul), MariaDB MaxScale, Sentry, and CockroachDB.'
            obligations={[
              "Production use may be restricted until the change date",
              "Read the Additional Use Grant carefully for each project",
              "After the change date, the change license applies with its standard obligations",
              "Not OSI-approved during the restricted period",
            ]}
          />

          <LicenseEntry
            spdx="Elastic-2.0"
            name="Elastic License 2.0"
            description="Created by Elastic for Elasticsearch and Kibana after their SSPL adoption was met with community pushback. ELv2 is simpler than SSPL: you can use, copy, and modify the software for any purpose except (1) providing it as a managed service, and (2) circumventing license key functionality. There is no copyleft component -- you do not need to share your modifications. This makes it more commercially practical than SSPL for organizations that are not competing with Elastic's cloud offering."
            obligations={[
              "Cannot provide the software as a managed service to third parties",
              "Cannot circumvent license key or security functionality",
              "No source code disclosure requirement for modifications",
              "Not OSI-approved",
            ]}
          />
        </div>
      </section>

      {/* License Compatibility Matrix */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="License Compatibility Matrix"
          blurb="Which licenses can coexist in the same project."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            Two licenses are &quot;compatible&quot; if code under both licenses
            can be combined into a single work without violating either
            license&apos;s terms. Compatibility is not always symmetric -- MIT
            code can be included in a GPL project (the result is GPL), but GPL
            code cannot be included in an MIT project (because MIT does not
            satisfy GPL&apos;s copyleft requirement).
          </p>
          <p>
            The following table summarizes the most common compatibility
            relationships. A checkmark means code under the row license can be
            incorporated into a project under the column license.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left p-2 font-semibold" style={{ color: "var(--dg-text)" }}>Into &rarr;</th>
                  <th className="p-2 font-semibold" style={{ color: "var(--dg-text)" }}>MIT</th>
                  <th className="p-2 font-semibold" style={{ color: "var(--dg-text)" }}>Apache-2.0</th>
                  <th className="p-2 font-semibold" style={{ color: "var(--dg-text)" }}>LGPL-2.1</th>
                  <th className="p-2 font-semibold" style={{ color: "var(--dg-text)" }}>MPL-2.0</th>
                  <th className="p-2 font-semibold" style={{ color: "var(--dg-text)" }}>GPL-2.0</th>
                  <th className="p-2 font-semibold" style={{ color: "var(--dg-text)" }}>GPL-3.0</th>
                  <th className="p-2 font-semibold" style={{ color: "var(--dg-text)" }}>AGPL-3.0</th>
                </tr>
              </thead>
              <tbody>
                <CompatRow from="MIT" compat={[true, true, true, true, true, true, true]} />
                <CompatRow from="Apache-2.0" compat={[false, true, false, true, false, true, true]} />
                <CompatRow from="LGPL-2.1" compat={[false, false, true, false, true, true, true]} />
                <CompatRow from="MPL-2.0" compat={[false, false, false, true, true, true, true]} />
                <CompatRow from="GPL-2.0" compat={[false, false, false, false, true, false, false]} />
                <CompatRow from="GPL-3.0" compat={[false, false, false, false, false, true, true]} />
                <CompatRow from="AGPL-3.0" compat={[false, false, false, false, false, false, true]} />
              </tbody>
            </table>
          </div>

          <p className="text-xs muted">
            Notes: Apache-2.0 is{" "}
            <a
              href="https://www.apache.org/licenses/GPL-compatibility.html"
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              compatible with GPL-3.0
            </a>{" "}
            but not GPL-2.0 due to the patent retaliation clause. GPL-2.0 is
            only compatible with GPL-3.0 if the code uses the &quot;or
            later&quot; clause (GPL-2.0+). MPL-2.0 includes an explicit
            compatibility provision for GPL-2.0+, LGPL-2.1+, and AGPL-3.0.
            This table assumes the &quot;only&quot; version of each license
            (no &quot;or later&quot; clause).
          </p>
        </div>
      </section>

      {/* SPDX Identifiers */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="SPDX License Identifiers"
          blurb="The standard way to reference licenses in SBOMs, package metadata, and scanning tools."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            <a
              href="https://spdx.org/"
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              SPDX
            </a>{" "}
            (Software Package Data Exchange) is an{" "}
            <a
              href="https://www.iso.org/standard/81870.html"
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              ISO/IEC 5962:2021 standard
            </a>{" "}
            maintained by the Linux Foundation. SPDX license identifiers
            provide a standardized, unambiguous way to refer to licenses. Instead
            of writing &quot;the MIT license&quot; or &quot;MIT License
            (Expat)&quot; or &quot;MIT/X11&quot;, you write{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">MIT</code>.
          </p>
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Simple identifiers
          </h3>
          <p>
            A single SPDX identifier refers to exactly one license:{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">MIT</code>,{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">Apache-2.0</code>,{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">GPL-3.0-only</code>.
            The full list of recognized identifiers is maintained at{" "}
            <a
              href="https://spdx.org/licenses/"
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              spdx.org/licenses
            </a>
            .
          </p>
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            Compound expressions
          </h3>
          <p>
            SPDX expressions can combine licenses using operators:
          </p>
          <ul className="list-disc pl-6 text-sm muted grid gap-1">
            <li>
              <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">
                MIT OR Apache-2.0
              </code>{" "}
              -- Dual-licensed. The user can choose either license. This is
              common in the Rust ecosystem.
            </li>
            <li>
              <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">
                LGPL-2.1-only AND MIT
              </code>{" "}
              -- Both licenses apply simultaneously. The user must comply with
              the terms of both.
            </li>
            <li>
              <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">
                GPL-2.0-only WITH Classpath-exception-2.0
              </code>{" "}
              -- A license with an exception. The Classpath exception allows
              linking GPL code with non-GPL code without the copyleft
              extending to the non-GPL code. Used by OpenJDK.
            </li>
          </ul>
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--dg-text)" }}
          >
            The &quot;-only&quot; and &quot;-or-later&quot; suffixes
          </h3>
          <p>
            GPL family licenses use suffixes to indicate version scope:{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">GPL-2.0-only</code>{" "}
            means exactly version 2.0 of the GPL.{" "}
            <code className="bg-black/5 dark:bg-white/10 px-1 rounded text-xs">GPL-2.0-or-later</code>{" "}
            means version 2.0 or any subsequent version published by the FSF.
            The &quot;or later&quot; clause is significant for compatibility
            -- code under GPL-2.0-or-later can be combined with GPL-3.0 code,
            but code under GPL-2.0-only cannot.
          </p>
          <p>
            ScanRook normalizes all detected licenses to their SPDX
            identifiers, including converting ecosystem-specific names (like
            Fedora&apos;s &quot;ASL 2.0&quot; for Apache-2.0 or PyPI&apos;s
            &quot;License :: OSI Approved :: MIT License&quot;) to the
            canonical SPDX form. This normalization ensures consistent policy
            evaluation across all ecosystems. For more on how ScanRook
            detects and classifies licenses, see the{" "}
            <Link
              href="/docs/concepts/license-scanning"
              className="font-medium underline underline-offset-2"
            >
              License Scanning
            </Link>{" "}
            documentation.
          </p>
        </div>
      </section>

      {/* Further reading */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Further reading"
          blurb="Related guides and external resources."
        />
        <ul className="list-disc pl-6 text-sm muted grid gap-1">
          <li>
            <Link
              href="/docs/concepts/license-scanning"
              className="font-medium underline underline-offset-2"
            >
              License Scanning and Compliance
            </Link>{" "}
            -- How ScanRook detects licenses and enforces policies.
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
            <a
              href="https://opensource.org/licenses"
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              OSI Approved Licenses
            </a>{" "}
            -- The official list of licenses approved by the Open Source
            Initiative.
          </li>
          <li>
            <a
              href="https://www.gnu.org/licenses/license-list.html"
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              FSF License List
            </a>{" "}
            -- The Free Software Foundation&apos;s analysis of license
            compatibility with the GPL.
          </li>
          <li>
            <a
              href="https://choosealicense.com/"
              className="font-medium underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              choosealicense.com
            </a>{" "}
            -- GitHub&apos;s plain-language license comparison tool.
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

function LicenseEntry({
  spdx,
  name,
  osiApproved,
  description,
  obligations,
}: {
  spdx: string;
  name: string;
  osiApproved?: boolean;
  description: string;
  obligations: string[];
}) {
  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2">
      <div className="flex items-center gap-3 flex-wrap">
        <code
          className="bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded text-xs font-bold"
          style={{ color: "var(--dg-text)" }}
        >
          {spdx}
        </code>
        <span className="text-sm font-semibold" style={{ color: "var(--dg-text)" }}>
          {name}
        </span>
        {osiApproved && (
          <span className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 px-1.5 py-0.5 rounded font-medium">
            OSI Approved
          </span>
        )}
      </div>
      <p className="text-sm muted">{description}</p>
      <div>
        <div
          className="text-xs font-semibold mb-1"
          style={{ color: "var(--dg-text)" }}
        >
          Obligations
        </div>
        <ul className="list-disc pl-5 text-xs muted grid gap-0.5">
          {obligations.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CompatRow({ from, compat }: { from: string; compat: boolean[] }) {
  return (
    <tr className="border-b border-black/5 dark:border-white/5">
      <td className="p-2 font-semibold text-xs" style={{ color: "var(--dg-text)" }}>
        {from}
      </td>
      {compat.map((c, i) => (
        <td key={i} className="p-2 text-center">
          {c ? (
            <span className="text-green-600 dark:text-green-400 font-bold">Y</span>
          ) : (
            <span className="text-red-500 dark:text-red-400">N</span>
          )}
        </td>
      ))}
    </tr>
  );
}
