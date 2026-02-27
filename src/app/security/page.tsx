import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";
import PublicSiteShell from "@/components/PublicSiteShell";

export const metadata: Metadata = {
  title: `Security | ${APP_NAME}`,
  description:
    "ScanRook security practices, vulnerability disclosure process, and contact information.",
  openGraph: {
    title: `Security | ${APP_NAME}`,
    description:
      "How ScanRook handles security: responsible disclosure, data handling, and read-only scanning.",
  },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SecurityPage() {
  return (
    <PublicSiteShell>
      <main className="mx-auto max-w-4xl px-6 py-14 grid gap-8">
        {/* Header */}
        <section className="surface-card p-8 grid gap-4">
          <div className="inline-flex w-fit items-center rounded-full border border-black/10 dark:border-white/10 px-3 py-1 text-xs muted">
            Security
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Security at ScanRook
          </h1>
          <p className="text-sm muted max-w-3xl">
            ScanRook is a vulnerability scanner built by security practitioners. We
            take the security of our own platform seriously and maintain transparent
            practices for handling vulnerabilities, data, and disclosures.
          </p>
        </section>

        {/* Read-only scanning */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            Read-only scanning
          </h2>
          <p className="text-sm muted leading-relaxed">
            ScanRook scans are strictly read-only. The scanner extracts package
            metadata and file information from artifacts but never modifies,
            patches, or writes to the scanned files. Container images, binaries,
            ISOs, and SBOMs are analyzed in a temporary directory and cleaned up
            after the scan completes. No artifact content is persisted beyond the
            scan session unless you explicitly upload it to the cloud platform.
          </p>
        </section>

        {/* Data handling */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            Data handling
          </h2>
          <p className="text-sm muted leading-relaxed">
            When using the CLI locally, all data stays on your machine. No
            telemetry, scan results, or artifact content is transmitted unless
            you explicitly use the cloud enrichment feature. When using the cloud
            platform, uploaded artifacts are stored in S3-compatible object
            storage with server-side encryption. Scan reports contain only
            metadata (package names, versions, CVE identifiers) and never
            include the actual file content of your artifacts.
          </p>
        </section>

        {/* Infrastructure */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            Infrastructure security
          </h2>
          <ul className="grid gap-2 text-sm muted leading-relaxed">
            <li>All network traffic is encrypted with TLS.</li>
            <li>Authentication uses JWT tokens with short expiration windows.</li>
            <li>API keys are hashed at rest and scoped to organizations.</li>
            <li>Database credentials are managed through Kubernetes Secrets with etcd encryption-at-rest.</li>
            <li>Worker nodes run in isolated namespaces with resource limits.</li>
            <li>Uploaded artifacts are automatically purged after the configured retention period.</li>
          </ul>
        </section>

        {/* Vulnerability disclosure */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            Vulnerability disclosure
          </h2>
          <p className="text-sm muted leading-relaxed">
            We follow a responsible disclosure process. If you discover a security
            vulnerability in ScanRook, we ask that you report it privately so we
            can address it before public disclosure.
          </p>
          <div className="rounded-lg border border-black/10 dark:border-white/10 bg-black/[.03] dark:bg-white/[.03] p-4 grid gap-3">
            <h3 className="text-sm font-semibold">How to report</h3>
            <ol className="grid gap-2 text-xs muted leading-relaxed list-decimal list-inside">
              <li>
                Email{" "}
                <a
                  href="mailto:security@scanrook.io"
                  className="font-semibold underline underline-offset-2"
                >
                  security@scanrook.io
                </a>{" "}
                with a description of the vulnerability, steps to reproduce, and
                any relevant proof-of-concept material.
              </li>
              <li>
                We will acknowledge receipt within 48 hours and provide an
                estimated timeline for a fix.
              </li>
              <li>
                We will work with you to understand and resolve the issue before
                any public disclosure.
              </li>
              <li>
                Once the fix is released, we will credit you in the release notes
                (unless you prefer to remain anonymous).
              </li>
            </ol>
          </div>
          <p className="text-xs muted">
            Please do not open public GitHub issues for security vulnerabilities.
            Use the email address above for all security-related reports.
          </p>
        </section>

        {/* Supported versions */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            Supported versions
          </h2>
          <p className="text-sm muted leading-relaxed">
            Security patches are applied to the latest release of each component.
            We do not backport fixes to older versions. We recommend always
            running the latest version of the CLI, worker, and UI.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 pr-4 font-semibold">Component</th>
                  <th className="text-left py-2 pr-4 font-semibold">Supported</th>
                </tr>
              </thead>
              <tbody className="muted">
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4">Scanner CLI (latest release)</td>
                  <td className="py-2 pr-4">Yes</td>
                </tr>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-4">Web platform (scanrook.io)</td>
                  <td className="py-2 pr-4">Yes (always current)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Older CLI releases</td>
                  <td className="py-2 pr-4">No</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Contact */}
        <section className="surface-card p-8 grid gap-4 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Questions?
          </h2>
          <p className="text-sm muted">
            For security-related inquiries, contact{" "}
            <a
              href="mailto:security@scanrook.io"
              className="font-semibold underline underline-offset-2"
            >
              security@scanrook.io
            </a>
            .
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-1">
            <Link href="/docs" className="btn-secondary">
              Docs
            </Link>
            <Link href="/privacy" className="btn-secondary">
              Privacy policy
            </Link>
            <Link href="/terms" className="btn-secondary">
              Terms of service
            </Link>
          </div>
        </section>
      </main>
    </PublicSiteShell>
  );
}
