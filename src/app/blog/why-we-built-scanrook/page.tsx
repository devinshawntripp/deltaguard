import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Why We Built ScanRook | ${APP_NAME}`,
  description:
    "Why ScanRook uses a local-first scan engine and optional cloud enrichment for team workflows.",
};

export default function WhyWeBuiltScanRookPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 grid gap-6">
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
