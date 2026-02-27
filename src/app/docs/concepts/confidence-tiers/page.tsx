import type { Metadata } from "next";
import CodeCopyBlock from "@/components/CodeCopyBlock";

export const metadata: Metadata = {
  title: "Confidence Tiers",
  description:
    "Understand ConfirmedInstalled vs HeuristicUnverified findings, evidence sources, and how confidence tiers reduce false positives in ScanRook reports.",
};

type EvidenceSource = {
  name: string;
  tier: "ConfirmedInstalled" | "HeuristicUnverified";
  description: string;
  example: string;
};

const evidenceSources: EvidenceSource[] = [
  {
    name: "InstalledDb",
    tier: "ConfirmedInstalled",
    description:
      "Package was found in a system package manager database (RPM db, APK installed, DPKG status). This is the strongest evidence: the package manager confirms the package is installed at that exact version.",
    example: "/var/lib/rpm/Packages, /lib/apk/db/installed, /var/lib/dpkg/status",
  },
  {
    name: "RepoMetadata",
    tier: "ConfirmedInstalled",
    description:
      "Package was found in a language ecosystem lockfile or manifest that confirms installed versions (package-lock.json, Gemfile.lock, go.sum, Cargo.lock).",
    example: "/app/node_modules/.package-lock.json, /app/Cargo.lock",
  },
  {
    name: "FilenameHeuristic",
    tier: "HeuristicUnverified",
    description:
      "Package name and version were inferred from a filename pattern (e.g. openssl-1.1.1k.tar.gz). The file exists but ScanRook cannot confirm the software is actually installed or linked.",
    example: "/usr/src/openssl-1.1.1k.tar.gz",
  },
  {
    name: "BinaryHeuristic",
    tier: "HeuristicUnverified",
    description:
      "Package name and version were extracted from binary metadata (ELF notes, Go build info, PE version resources, Rust panic strings). The binary exists but the version string may not exactly match a distribution package.",
    example: "ELF .note section, Go buildinfo embedded in binary",
  },
];

export default function ConfidenceTiersPage() {
  return (
    <article className="grid gap-6">
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Confidence Tiers</h1>
        <p className="muted text-sm max-w-3xl">
          Not all vulnerability findings are created equal. ScanRook assigns a
          confidence tier to every finding based on the strength of evidence that
          the vulnerable package is actually installed and active. This helps teams
          focus triage effort on findings that matter most.
        </p>
      </section>

      {/* The two tiers */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="The two tiers"
          blurb="Every finding is classified as one of two confidence levels."
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/[.06] p-4 grid gap-2">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2.2 6.3 4.8 8.9 9.8 3.9" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                ConfirmedInstalled
              </span>
            </div>
            <p className="text-sm muted">
              The package was verified as installed through a system package manager
              database or ecosystem lockfile. ScanRook has high confidence that the
              vulnerable version is present and active in the scanned artifact.
            </p>
            <p className="text-xs muted">
              <strong>Action:</strong> These findings should be triaged with priority.
              The vulnerable package is confirmed to be present.
            </p>
          </div>

          <div className="rounded-lg border border-amber-500/40 bg-amber-500/[.06] p-4 grid gap-2">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2.4 6h7.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
                HeuristicUnverified
              </span>
            </div>
            <p className="text-sm muted">
              The package name and version were inferred from filename patterns or
              binary metadata. ScanRook found indicators that the package may be
              present, but cannot confirm it is installed or linked.
            </p>
            <p className="text-xs muted">
              <strong>Action:</strong> Review these findings with additional context.
              They may represent source archives, build dependencies, or version
              strings that do not correspond to the installed runtime state.
            </p>
          </div>
        </div>
      </section>

      {/* Evidence sources */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Evidence sources"
          blurb="The evidence source determines which tier a finding receives."
        />
        <div className="grid gap-3">
          {evidenceSources.map((e) => (
            <div
              key={e.name}
              className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-2"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-xs font-semibold">{e.name}</code>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${
                    e.tier === "ConfirmedInstalled"
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {e.tier}
                </span>
              </div>
              <p className="text-sm muted">{e.description}</p>
              <p className="text-xs muted">
                <strong>Example paths:</strong> <code>{e.example}</code>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why this matters */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="Why this matters"
          blurb="Confidence tiers are the primary mechanism for false positive reduction."
        />
        <div className="text-sm muted grid gap-3">
          <p>
            Traditional vulnerability scanners report every version string they find,
            regardless of whether the software is actually installed. This leads to
            noisy reports where build-time dependencies, cached source archives, and
            version strings embedded in documentation appear as findings.
          </p>
          <p>
            ScanRook's installed-state-first approach solves this by prioritizing
            evidence from package manager databases and lockfiles. When ScanRook
            finds a package in the RPM database or in a package-lock.json, it knows
            that package is genuinely installed. When it only finds a version string
            in a filename, it flags it as heuristic so teams can decide whether to
            investigate.
          </p>
          <p>
            In practice, this means:
          </p>
          <ul className="list-disc ml-5 grid gap-1">
            <li>
              <strong>ConfirmedInstalled findings</strong> require attention -- the
              vulnerable package is verifiably present
            </li>
            <li>
              <strong>HeuristicUnverified findings</strong> may be noise -- they
              warrant a second look before creating remediation work
            </li>
            <li>
              CI/CD gates can be configured to fail only on ConfirmedInstalled
              critical/high findings, reducing alert fatigue
            </li>
          </ul>
        </div>
      </section>

      {/* JSON report example */}
      <section className="surface-card p-7 grid gap-4">
        <SectionHeader
          title="How it appears in JSON reports"
          blurb="Each finding includes a confidence field and an evidence array."
        />
        <CodeCopyBlock
          label="Finding with ConfirmedInstalled confidence"
          code={`{
  "cve": "CVE-2024-12345",
  "package": {
    "ecosystem": "npm",
    "name": "lodash",
    "version": "4.17.20"
  },
  "severity": "HIGH",
  "cvss": 7.5,
  "confidence": "ConfirmedInstalled",
  "evidence": [
    {
      "source": "InstalledDb",
      "path": "/app/node_modules/.package-lock.json"
    }
  ],
  "fixed_in": "4.17.21"
}`}
        />
        <CodeCopyBlock
          label="Finding with HeuristicUnverified confidence"
          code={`{
  "cve": "CVE-2023-67890",
  "package": {
    "ecosystem": "Generic",
    "name": "openssl",
    "version": "1.1.1k"
  },
  "severity": "MEDIUM",
  "cvss": 5.3,
  "confidence": "HeuristicUnverified",
  "evidence": [
    {
      "source": "FilenameHeuristic",
      "path": "/usr/src/openssl-1.1.1k.tar.gz"
    }
  ],
  "fixed_in": "1.1.1l"
}`}
        />
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
