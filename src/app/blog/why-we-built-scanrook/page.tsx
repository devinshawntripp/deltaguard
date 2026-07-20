import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Why We Built ScanRook | ${APP_NAME}`,
  description:
    "Why ScanRook uses a local-first scan engine and optional cloud enrichment for team workflows.",
};

export default function WhyWeBuiltScanRookPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "Why We Built ScanRook",
    description: "Why ScanRook uses a local-first scan engine and optional cloud enrichment for team workflows.",
    url: "https://scanrook.io/blog/why-we-built-scanrook",
    author: { "@type": "Organization", name: "ScanRook", url: "https://scanrook.io" },
    publisher: { "@type": "Organization", name: "ScanRook", url: "https://scanrook.io" },
    mainEntityOfPage: "https://scanrook.io/blog/why-we-built-scanrook",
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-14 grid gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <article className="surface-card p-8 grid gap-6">
        <header className="grid gap-3">
          <div className="text-xs uppercase tracking-wide muted">Launch post</div>
          <h1 className="text-3xl font-semibold tracking-tight">Why We Built ScanRook</h1>
          <p className="text-sm muted">
            Most scanners force a cloud-first workflow or overload teams with findings they cannot trust quickly.
            We built ScanRook to start local, stay fast, and add cloud enrichment only when you need it.
          </p>
        </header>

      <section className="grid gap-2">
        <h2 className="text-xl font-semibold tracking-tight">The Problem</h2>
        <ol className="list-decimal pl-6 text-sm muted grid gap-1">
          <li>Too many findings with unclear applicability.</li>
          <li>Slow, opaque scan workflows.</li>
          <li>Friction to adopt in developer pipelines.</li>
        </ol>
      </section>

      <section className="grid gap-2">
        <h2 className="text-xl font-semibold tracking-tight">Our Approach: Local-First + Cloud Enrichment</h2>
        <ul className="list-disc pl-6 text-sm muted grid gap-1">
          <li>Local scan engine runs without mandatory cloud auth.</li>
          <li>Cloud enrichment adds context, org workflows, and scaling controls.</li>
        </ul>
        <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
          <code>{`curl -fsSL https://scanrook.sh/install | bash
scanrook scan --file ./image.tar --mode deep --format json --out report.json`}</code>
        </pre>
        <p className="text-sm muted">
          The split matters more than either half. Everything needed to produce
          a report lives on your machine; the cloud side is something you opt
          into when a team needs shared workflows.
        </p>
        <figure className="overflow-x-auto">
          <svg
            viewBox="0 0 800 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            role="img"
            aria-label="Diagram of the local-first boundary. On your machine, with no account required: install the CLI, scan a file or image tar, installed-state-first detection, confidence tiering of findings, and a report written to disk. Optionally, after signing in or adding an API key: cloud enrichment context, organization and team workflows, queue-to-completion visibility, and API and org controls. The local half runs on its own if you never cross the boundary."
          >
            <title>
              Local-first boundary: what runs on your machine versus what the
              optional cloud side adds.
            </title>

            <rect
              width="800"
              height="300"
              rx="16"
              className="fill-black/[.02] dark:fill-white/[.02]"
            />

            {/* Local panel */}
            <rect
              x="24"
              y="52"
              width="330"
              height="216"
              rx="12"
              className="fill-[var(--dg-accent,#2563eb)]/[.06] stroke-[var(--dg-accent,#2563eb)]"
              strokeWidth="2"
            />
            <text
              x="189"
              y="36"
              textAnchor="middle"
              className="fill-current"
              fontSize="12"
              fontWeight="600"
            >
              On your machine
            </text>
            <text
              x="189"
              y="76"
              textAnchor="middle"
              className="fill-current"
              fontSize="10"
              opacity="0.6"
            >
              no mandatory cloud auth
            </text>
            {[
              "Install the CLI",
              "Scan a file or image tar",
              "Installed-state-first detection",
              "Confidence tiering: confirmed vs heuristic",
              "Report written to disk (JSON or text)",
            ].map((label, i) => (
              <g key={label}>
                <rect
                  x="44"
                  y={94 + i * 33}
                  width="290"
                  height="26"
                  rx="6"
                  className="fill-black/[.05] dark:fill-white/[.08] stroke-black/10 dark:stroke-white/10"
                  strokeWidth="1"
                />
                <text
                  x="189"
                  y={111 + i * 33}
                  textAnchor="middle"
                  className="fill-current"
                  fontSize="10"
                >
                  {label}
                </text>
              </g>
            ))}

            {/* Opt-in boundary */}
            <line
              x1="400"
              y1="44"
              x2="400"
              y2="276"
              className="stroke-current"
              strokeWidth="1.5"
              strokeDasharray="5 5"
              opacity="0.35"
            />
            <line
              x1="358"
              y1="160"
              x2="432"
              y2="160"
              className="stroke-current"
              strokeWidth="1.5"
              opacity="0.5"
            />
            <polygon
              points="432,155 442,160 432,165"
              className="fill-current"
              opacity="0.5"
            />
            <text
              x="400"
              y="146"
              textAnchor="middle"
              className="fill-current"
              fontSize="10"
              fontWeight="500"
            >
              opt in
            </text>
            <text
              x="400"
              y="182"
              textAnchor="middle"
              className="fill-current"
              fontSize="9"
              opacity="0.55"
            >
              sign in or add an API key
            </text>

            {/* Cloud panel */}
            <rect
              x="446"
              y="52"
              width="330"
              height="216"
              rx="12"
              className="fill-black/[.03] dark:fill-white/[.05] stroke-black/15 dark:stroke-white/15"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <text
              x="611"
              y="36"
              textAnchor="middle"
              className="fill-current"
              fontSize="12"
              fontWeight="600"
            >
              Cloud enrichment (optional)
            </text>
            <text
              x="611"
              y="76"
              textAnchor="middle"
              className="fill-current"
              fontSize="10"
              opacity="0.6"
            >
              added when a team needs it
            </text>
            {[
              "Enrichment context on findings",
              "Org and team workflows",
              "Queue-to-completion visibility",
              "API and org controls",
              "Scaling controls",
            ].map((label, i) => (
              <g key={label}>
                <rect
                  x="466"
                  y={94 + i * 33}
                  width="290"
                  height="26"
                  rx="6"
                  className="fill-black/[.05] dark:fill-white/[.08] stroke-black/10 dark:stroke-white/10"
                  strokeWidth="1"
                />
                <text
                  x="611"
                  y={111 + i * 33}
                  textAnchor="middle"
                  className="fill-current"
                  fontSize="10"
                >
                  {label}
                </text>
              </g>
            ))}
          </svg>
          <figcaption className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Where the local-first boundary sits. Every capability shown is one
            described in this post &mdash; the diagram shows which side of the
            line each one lives on, not how long anything takes or how much it
            finds.
          </figcaption>
        </figure>
      </section>

      <section className="grid gap-2">
        <h2 className="text-xl font-semibold tracking-tight">What Makes ScanRook Different</h2>
        <ol className="list-decimal pl-6 text-sm muted grid gap-1">
          <li>Installed-state-first model.</li>
          <li>Confidence tiering for findings (confirmed vs heuristic).</li>
          <li>Workflow visibility from queue to completion.</li>
          <li>API and org controls for managed team operations.</li>
        </ol>
      </section>

      <section className="grid gap-2">
        <h2 className="text-xl font-semibold tracking-tight">What's Next</h2>
        <ul className="list-disc pl-6 text-sm muted grid gap-1">
          <li>Reproducible benchmark reports vs common tools.</li>
          <li>CI integrations (GitHub Actions first).</li>
          <li>Expanded distribution (Homebrew, crates.io, Docker).</li>
        </ul>
      </section>

        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Try It</h2>
          <pre className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.04] dark:bg-white/[.04] p-3 text-xs overflow-x-auto">
            <code>{`curl -fsSL https://scanrook.sh/install | bash`}</code>
          </pre>
          <div className="flex flex-wrap gap-3">
            <a className="btn-primary" href="https://scanrook.sh">Install CLI</a>
            <a className="btn-secondary" href="https://scanrook.io/signin">Sign in to platform</a>
            <Link className="btn-secondary" href="/blog">Back to blog</Link>
          </div>
        </section>
      </article>
    </main>
  );
}
