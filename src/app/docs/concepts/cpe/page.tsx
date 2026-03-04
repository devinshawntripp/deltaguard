import type { Metadata } from "next";
import CpeParserWidget from "./CpeParserWidget";

export const metadata: Metadata = {
  title: "CPE - Common Platform Enumeration",
  description:
    "Learn what CPE is, how it maps to CVEs, and how ScanRook uses CPE strings to identify vulnerable packages across OSV and NVD.",
};

export default function CpePage() {
  return (
    <article className="grid gap-6">
      {/* Hero */}
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          CPE: Common Platform Enumeration
        </h1>
        <p className="muted text-sm max-w-3xl">
          CPE is a standardized naming scheme for software products, operating
          systems, and hardware. It gives every piece of software a unique,
          machine-readable identifier — so vulnerability databases can say
          exactly which products are affected by a CVE.
        </p>
      </section>

      {/* What is CPE */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="What is CPE?"
          blurb="A universal naming standard for IT products."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            When a vulnerability researcher publishes a CVE, they need to specify
            which software versions are affected. Without a standard format, every
            database would describe &quot;OpenSSL 3.0.7&quot; differently —
            some as <code>openssl/3.0.7</code>, others as
            {" "}<code>OpenSSL:3.0.7</code>, others as plain text.
          </p>
          <p>
            CPE solves this by giving every product a structured identifier. The
            National Vulnerability Database (NVD) and Open Source Vulnerabilities
            (OSV) both use CPE as a common language for linking software versions
            to CVEs. When ScanRook finds a package in a scanned artifact, it
            constructs the package&apos;s CPE string and uses it to search for
            matching advisories.
          </p>
          <p>
            NIST maintains the{" "}
            <strong>CPE Dictionary</strong> — an authoritative list of CPE names
            for known products. If a product is in the dictionary, its CPE is
            standardized and any NVD advisory that references it will use the
            same identifier.
          </p>
        </div>
      </section>

      {/* CPE 2.3 Format */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="CPE 2.3 Format"
          blurb="A colon-delimited string with 13 fields that uniquely identifies a product."
        />
        <div className="text-sm muted grid gap-4">
          <p>
            CPE 2.3 (the current version) uses a structured URI format with 13
            colon-separated fields. The format always begins with{" "}
            <code className="text-xs rounded px-1 py-0.5 border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04]">
              cpe:2.3:
            </code>{" "}
            followed by 11 attribute fields.
          </p>

          {/* Visual breakdown */}
          <div className="overflow-x-auto">
            <div className="inline-grid gap-0 text-xs font-mono min-w-max rounded-lg border border-black/10 dark:border-white/10 overflow-hidden">
              <div className="grid grid-cols-[repeat(13,auto)] divide-x divide-black/10 dark:divide-white/10">
                {[
                  { val: "cpe", cls: "muted" },
                  { val: "2.3", cls: "muted" },
                  { val: "a", label: "part", accent: true },
                  { val: "openssl", label: "vendor", accent: true },
                  { val: "openssl", label: "product", accent: true },
                  { val: "3.0.7", label: "version", accent: true },
                  { val: "*", label: "update", cls: "muted" },
                  { val: "*", label: "edition", cls: "muted" },
                  { val: "*", label: "language", cls: "muted" },
                  { val: "*", label: "sw edition", cls: "muted" },
                  { val: "*", label: "target sw", cls: "muted" },
                  { val: "*", label: "target hw", cls: "muted" },
                  { val: "*", label: "other", cls: "muted" },
                ].map((cell, i) => (
                  <div
                    key={i}
                    className={`px-2.5 py-2 text-center border-b border-black/10 dark:border-white/10 ${
                      cell.accent
                        ? "bg-[var(--dg-accent-soft)]"
                        : "bg-black/[.02] dark:bg-white/[.02]"
                    }`}
                    style={cell.accent ? { color: "var(--dg-accent-ink)" } : undefined}
                  >
                    {cell.val}
                  </div>
                ))}
                {[
                  { val: "prefix", cls: "muted" },
                  { val: "ver", cls: "muted" },
                  { val: "part", accent: true },
                  { val: "vendor", accent: true },
                  { val: "product", accent: true },
                  { val: "version", accent: true },
                  { val: "update", cls: "muted" },
                  { val: "edition", cls: "muted" },
                  { val: "language", cls: "muted" },
                  { val: "sw edition", cls: "muted" },
                  { val: "target sw", cls: "muted" },
                  { val: "target hw", cls: "muted" },
                  { val: "other", cls: "muted" },
                ].map((cell, i) => (
                  <div
                    key={i}
                    className={`px-2.5 py-1.5 text-center text-[10px] uppercase tracking-wide ${
                      cell.accent ? "" : "muted"
                    }`}
                    style={cell.accent ? { color: "var(--dg-accent-ink)" } : undefined}
                  >
                    {cell.val}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <p className="font-semibold text-xs" style={{ color: "var(--dg-text)" }}>Field meanings:</p>
            <ul className="grid gap-1.5 list-disc pl-5 text-xs">
              <li>
                <strong>Part</strong> — What type of thing is this?{" "}
                <code>a</code> = application, <code>o</code> = operating system,{" "}
                <code>h</code> = hardware.
              </li>
              <li>
                <strong>Vendor</strong> — The organization or person that created
                the product (e.g. <code>openssl</code>, <code>microsoft</code>,{" "}
                <code>apache</code>).
              </li>
              <li>
                <strong>Product</strong> — The product name (e.g.{" "}
                <code>openssl</code>, <code>windows_10</code>,{" "}
                <code>httpd</code>).
              </li>
              <li>
                <strong>Version</strong> — The specific version string (e.g.{" "}
                <code>3.0.7</code>, <code>22h2</code>).
              </li>
              <li>
                <strong>*</strong> (wildcard) — Matches any value. Most fields
                other than part/vendor/product/version are set to{" "}
                <code>*</code> for general-purpose matching.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CPE to CVE */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="CPE-to-CVE Lookup"
          blurb="How CPE strings connect software packages to vulnerability advisories."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            When a vulnerability researcher publishes a CVE, the NVD record
            includes a list of{" "}
            <strong>affected CPE configurations</strong> — the specific product
            versions known to be vulnerable. For example, CVE-2022-0778 (OpenSSL
            infinite loop) lists:
          </p>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
            <code>{`cpe:2.3:a:openssl:openssl:*:*:*:*:*:*:*:* (versions < 1.0.2zd)
cpe:2.3:a:openssl:openssl:*:*:*:*:*:*:*:* (versions >= 3.0.0, < 3.0.2)`}</code>
          </pre>
          <p>
            To check if a package is vulnerable, a scanner:
          </p>
          <ol className="list-decimal pl-5 grid gap-1.5 text-xs">
            <li>
              Extracts the package name and version from the artifact (e.g.{" "}
              <code>openssl 3.0.7</code>).
            </li>
            <li>
              Constructs the CPE string:{" "}
              <code>cpe:2.3:a:openssl:openssl:3.0.7:*:*:*:*:*:*:*</code>.
            </li>
            <li>
              Queries NVD&apos;s CPE match API:{" "}
              &quot;Which CVEs affect this CPE?&quot;
            </li>
            <li>
              NVD returns matching CVEs with their severity, CVSS scores, and fix
              versions.
            </li>
          </ol>
          <p>
            OSV works similarly but uses ecosystem-specific package names (e.g.{" "}
            <code>PyPI/requests</code>, <code>npm/lodash</code>) rather than CPE
            strings for most ecosystems, then cross-references NVD CPE data for
            enrichment.
          </p>
        </div>
      </section>

      {/* Interactive Parser */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Interactive CPE Parser"
          blurb="Paste any CPE 2.3 string to see it broken into its 11 component fields."
        />
        <p className="text-xs muted">
          Try editing the string below. Change <code>openssl</code> to any vendor
          you know, or change the version number. A <code>*</code> means
          &quot;any value&quot; — most fields are wildcarded in practice.
        </p>
        <CpeParserWidget />
      </section>

      {/* How ScanRook Does It */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="How ScanRook Does It"
          blurb="From package inventory to CPE match to CVE finding."
        />
        <div className="text-sm muted grid gap-4">
          <p>
            When ScanRook scans a container image or binary, it goes through
            these steps to turn detected packages into CVE findings:
          </p>

          <div className="grid gap-3">
            {[
              {
                step: "1",
                title: "Extract package inventory",
                detail:
                  "ScanRook reads the container's package manager databases (RPM db, APK installed, DPKG status) and lockfiles (package-lock.json, Cargo.lock, go.sum) to build a list of installed packages with their exact versions.",
              },
              {
                step: "2",
                title: "OSV batch query",
                detail:
                  "All packages are sent to the OSV API in a single batch request. OSV returns matching advisories using ecosystem-native identifiers (e.g. npm/lodash, PyPI/requests, RPM/openssl). This is the fastest and broadest enrichment pass.",
              },
              {
                step: "3",
                title: "NVD CPE matching",
                detail:
                  "For packages not fully covered by OSV, or to add CVSS scores, ScanRook constructs CPE strings and queries the NVD CPE match API. NVD returns CVEs with CVSS v3.1 vectors, CWE classifications, and affected version ranges.",
              },
              {
                step: "4",
                title: "Distro and Red Hat enrichment",
                detail:
                  "For RHEL-based images, ScanRook adds a third enrichment pass using Red Hat CSAF and OVAL data to surface CVEs marked 'Will not fix', 'Fix deferred', or 'Affected' — including ones NVD and OSV may not cover.",
              },
              {
                step: "5",
                title: "Deduplicate and merge",
                detail:
                  "Results from all sources are merged by CVE ID and package. Duplicate findings are collapsed into a single entry that combines all evidence, takes the highest CVSS score, and flags EPSS probability and KEV status.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex gap-4 rounded-lg border border-black/10 dark:border-white/10 p-4"
              >
                <div
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border"
                  style={{
                    borderColor: "color-mix(in srgb, var(--dg-accent) 40%, transparent)",
                    background: "var(--dg-accent-soft)",
                    color: "var(--dg-accent-ink)",
                  }}
                >
                  {item.step}
                </div>
                <div className="grid gap-1">
                  <div className="text-sm font-semibold" style={{ color: "var(--dg-text)" }}>
                    {item.title}
                  </div>
                  <p className="text-xs muted">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <p>
            The CPE match step (step 3) is what bridges the gap between an
            installed package and the NVD&apos;s vulnerability index. Without
            accurate CPE construction, entire product families of CVEs would be
            missed. ScanRook&apos;s CPE construction logic normalizes vendor and
            product names against the NVD CPE dictionary to maximize match
            accuracy.
          </p>
        </div>
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
