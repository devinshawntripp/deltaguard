import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jobs & Progress",
  description: "How scan jobs work, progress streaming, stage prefixes, and stale job handling.",
};

export default function JobsAndProgressPage() {
  return (
    <article className="grid gap-6">
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Jobs & Progress</h1>
        <p className="muted text-sm max-w-3xl">
          Understand the scan job lifecycle, real-time progress streaming, and how to
          interpret workflow stages.
        </p>
      </section>

      <section className="surface-card p-7 grid gap-5">
        <SectionHeader title="Job Lifecycle" blurb="How a scan moves from upload to results." />
        <div className="grid gap-3 text-sm muted">
          <p>Every scan job follows a state machine:</p>
          <div className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.02] dark:bg-white/[.02] p-4 font-mono text-xs">
            queued → running → done | failed
          </div>
          <ul className="grid gap-1.5 list-disc pl-5">
            <li><strong>queued</strong> — Job created after file upload. Waiting for a worker to pick it up.</li>
            <li><strong>running</strong> — Worker is actively scanning. Progress events stream in real time.</li>
            <li><strong>done</strong> — Scan completed. Full report available for download.</li>
            <li><strong>failed</strong> — An error occurred. Check the last progress event for details.</li>
          </ul>
        </div>
      </section>

      <section className="surface-card p-7 grid gap-5">
        <SectionHeader title="Progress Streaming" blurb="Real-time visibility into scan stages." />
        <div className="grid gap-3 text-sm muted">
          <p>
            The scanner writes NDJSON progress events to a file. The Go worker tails this file and
            inserts rows into the <code className="text-xs bg-black/5 dark:bg-white/10 px-1 rounded">scan_events</code> table.
            PostgreSQL NOTIFY triggers server-sent events (SSE) that push updates to your browser.
          </p>
          <div className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.02] dark:bg-white/[.02] p-4 font-mono text-xs">
            Scanner NDJSON → Worker tails → scan_events → pg_notify → SSE → Browser
          </div>
        </div>
      </section>

      <section className="surface-card p-7 grid gap-5">
        <SectionHeader title="Progress Stages" blurb="What each stage prefix means." />
        <div className="overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10">
                <th className="text-left py-2 pr-4 font-semibold">Stage Prefix</th>
                <th className="text-left py-2 font-semibold">Meaning</th>
              </tr>
            </thead>
            <tbody className="muted">
              <StageRow prefix="scan.start" meaning="Scan initialization" />
              <StageRow prefix="container.extract / container.layers" meaning="Extracting container layers" />
              <StageRow prefix="container.packages" meaning="Detecting OS packages (dpkg, apk, rpm)" />
              <StageRow prefix="container.packages.app" meaning="Detecting application packages (npm, pip, gem, etc.)" />
              <StageRow prefix="archive.extract" meaning="Extracting ZIP archive (APK, JAR, wheel, etc.)" />
              <StageRow prefix="archive.type" meaning="Classified archive type" />
              <StageRow prefix="iso.detect / iso.repodata" meaning="ISO image analysis" />
              <StageRow prefix="osv.* / container.osv.* / archive.osv.*" meaning="OSV vulnerability query" />
              <StageRow prefix="nvd.* / container.enrich.nvd / archive.enrich.nvd" meaning="NVD enrichment" />
              <StageRow prefix="redhat.*" meaning="Red Hat CSAF enrichment" />
              <StageRow prefix="binary.*" meaning="Binary analysis (ELF/PE/Mach-O)" />
              <StageRow prefix="dmg.extract" meaning="DMG disk image extraction" />
              <StageRow prefix="scan.done / scan.summary" meaning="Scan completed" />
              <StageRow prefix="*.err / *.error" meaning="Error in that stage" />
              <StageRow prefix="*.timing" meaning="Duration of that stage (ms)" />
            </tbody>
          </table>
        </div>
      </section>

      <section className="surface-card p-7 grid gap-5">
        <SectionHeader title="Stale Job Detection" blurb="What happens when a scan gets stuck." />
        <div className="grid gap-3 text-sm muted">
          <p>
            Workers send periodic heartbeats while processing a job. If no heartbeat arrives
            within <strong>30 minutes</strong>, the job is automatically marked as failed with
            a "stale job timeout" message.
          </p>
          <p>
            To retry a failed scan, upload the file again. The original job and its events are
            preserved for debugging.
          </p>
        </div>
      </section>
    </article>
  );
}

function SectionHeader({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-xs muted mt-0.5">{blurb}</p>
    </div>
  );
}

function StageRow({ prefix, meaning }: { prefix: string; meaning: string }) {
  return (
    <tr className="border-b border-black/5 dark:border-white/5">
      <td className="py-1.5 pr-4 font-mono text-xs">{prefix}</td>
      <td className="py-1.5">{meaning}</td>
    </tr>
  );
}
