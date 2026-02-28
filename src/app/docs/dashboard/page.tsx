import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of the ScanRook web dashboard — uploading, scanning, and reviewing results.",
};

export default function DashboardDocsPage() {
  return (
    <article className="grid gap-6">
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="muted text-sm max-w-3xl">
          The ScanRook dashboard is the web interface for the ScanRook platform.
          Upload artifacts, start scans, track real-time progress, and review findings
          — all from your browser.
        </p>
      </section>

      <section className="surface-card p-7 grid gap-5">
        <SectionHeader title="Uploading Files" blurb="Get artifacts into the scanner." />
        <div className="grid gap-3 text-sm muted">
          <p>
            Drag and drop a file onto the upload card on the dashboard, or click to select a file.
            Supported formats include container tars, ISO images, SBOMs, ZIP archives (APK, AAB, JAR,
            WAR, wheel, NuGet), DMG disk images, and standalone binaries.
          </p>
          <p>
            Files are uploaded directly to S3 via a presigned URL — they never pass through the
            application server. This allows uploads of any size over any connection speed with a
            one-hour timeout for large files.
          </p>
        </div>
      </section>

      <section className="surface-card p-7 grid gap-5">
        <SectionHeader title="Starting a Scan" blurb="Choose your scan mode." />
        <div className="grid gap-3 text-sm muted">
          <p>
            Select <strong>Light</strong> or <strong>Deep</strong> scan mode before uploading.
            Light mode runs the core vulnerability enrichment pipeline (OSV + NVD + EPSS + KEV).
            Deep mode adds YARA rule matching when rules are configured.
          </p>
          <p>
            After upload completes, a scan job is automatically created and queued. The worker
            picks it up within seconds.
          </p>
        </div>
      </section>

      <section className="surface-card p-7 grid gap-5">
        <SectionHeader title="Navigating Results" blurb="Where to find what." />
        <ul className="grid gap-2 text-sm muted list-disc pl-5">
          <li>
            <strong>Jobs table</strong> — The main dashboard page shows all scan jobs with status,
            progress bar, and expandable workflow timeline.
          </li>
          <li>
            <strong>Findings page</strong> — Click "Findings" on any completed job to see the
            filterable findings table with severity, CVSS, EPSS, and KEV data.
          </li>
          <li>
            <strong>Files page</strong> — Click "Files" to browse the file tree of the scanned artifact.
          </li>
          <li>
            <strong>Report JSON</strong> — Download the full structured report for programmatic analysis.
          </li>
        </ul>
      </section>

      <section className="surface-card p-7 grid gap-4">
        <SectionHeader title="Learn More" blurb="Dive deeper into specific topics." />
        <div className="flex flex-wrap gap-3">
          <Link href="/docs/dashboard/jobs-and-progress" className="btn-secondary">Jobs & Progress</Link>
          <Link href="/docs/dashboard/findings-and-reports" className="btn-secondary">Findings & Reports</Link>
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
