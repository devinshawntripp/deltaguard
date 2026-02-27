import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "ScanRook documentation hub. Guides for installation, CLI usage, enrichment concepts, data sources, and CI/CD integration.",
};

type DocLink = {
  href: string;
  title: string;
  description: string;
};

const guides: DocLink[] = [
  {
    href: "/docs/quickstart",
    title: "Quickstart",
    description:
      "Install ScanRook, run your first scan, configure caching, and review example output.",
  },
  {
    href: "/docs/cli-reference",
    title: "CLI Reference",
    description:
      "Complete reference for all subcommands, flags, environment variables, and example invocations.",
  },
  {
    href: "/docs/concepts/enrichment",
    title: "Enrichment",
    description:
      "How ScanRook enriches package inventories with vulnerability data from OSV, NVD, Red Hat CSAF, and more.",
  },
  {
    href: "/docs/concepts/confidence-tiers",
    title: "Confidence Tiers",
    description:
      "Understand ConfirmedInstalled vs HeuristicUnverified findings and how evidence sources affect accuracy.",
  },
  {
    href: "/docs/data-sources",
    title: "Data Sources",
    description:
      "Full provider table showing integration maturity, ecosystem coverage, and current status for each source.",
  },
  {
    href: "/docs/integrations/github-actions",
    title: "GitHub Actions",
    description:
      "Scan artifacts in CI, upload reports, and gate deployments on critical CVEs.",
  },
  {
    href: "/docs/integrations/gitlab-ci",
    title: "GitLab CI",
    description:
      "Integrate ScanRook into your GitLab CI pipeline with a ready-to-use .gitlab-ci.yml template.",
  },
];

export default function DocsPage() {
  return (
    <article className="grid gap-6">
      {/* Hero */}
      <section className="surface-card p-7 grid gap-4">
        <div className="inline-flex items-center gap-3">
          <BrandLogo
            markClassName="h-10 w-10 rounded-lg"
            nameClassName="text-2xl font-semibold tracking-tight"
          />
          <span className="rounded-full border border-black/10 dark:border-white/10 px-3 py-1 text-xs muted">
            Documentation
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">ScanRook Docs</h1>
        <p className="muted max-w-4xl text-sm">
          Installed-state-first scanning with explicit workflow stages, structured
          logs, and cache controls. Browse the guides below to get started or dive
          into the full CLI reference.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/docs/quickstart" className="btn-primary">
            Get started
          </Link>
          <Link href="/docs/cli-reference" className="btn-secondary">
            CLI Reference
          </Link>
          <a href="https://scanrook.sh" className="btn-secondary">
            Install CLI
          </a>
        </div>
      </section>

      {/* Guide cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((g) => (
          <Link
            key={g.href}
            href={g.href}
            className="surface-card p-5 grid gap-2 hover:border-[var(--dg-accent)] transition group"
          >
            <h2 className="text-base font-semibold tracking-tight group-hover:text-[var(--dg-accent-ink)] transition">
              {g.title}
            </h2>
            <p className="text-sm muted">{g.description}</p>
            <span className="text-xs font-medium mt-1" style={{ color: "var(--dg-accent-ink)" }}>
              Read guide &rarr;
            </span>
          </Link>
        ))}
      </section>

      {/* Links */}
      <section className="surface-card p-7 grid gap-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Additional resources
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/settings/api-docs" className="btn-secondary">
            OpenAPI Docs
          </Link>
          <Link href="/dashboard/settings/api-keys" className="btn-secondary">
            Manage API Keys
          </Link>
          <Link href="/blog/what-is-sbom-and-how-scanrook-uses-it" className="btn-secondary">
            SBOM Primer
          </Link>
          <Link href="/roadmap" className="btn-secondary">
            Roadmap
          </Link>
        </div>
      </section>
    </article>
  );
}
