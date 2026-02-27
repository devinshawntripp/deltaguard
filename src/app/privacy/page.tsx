import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";
import PublicSiteShell from "@/components/PublicSiteShell";

export const metadata: Metadata = {
  title: `Privacy Policy | ${APP_NAME}`,
  description:
    "ScanRook privacy policy: what data we collect, how it is stored and protected, third-party services, and data retention.",
  openGraph: {
    title: `Privacy Policy | ${APP_NAME}`,
    description: "How ScanRook handles your data and protects your privacy.",
  },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PrivacyPage() {
  return (
    <PublicSiteShell>
      <main className="mx-auto max-w-4xl px-6 py-14 grid gap-8">
        {/* Header */}
        <section className="surface-card p-8 grid gap-4">
          <div className="inline-flex w-fit items-center rounded-full border border-black/10 dark:border-white/10 px-3 py-1 text-xs muted">
            Legal
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm muted">
            Effective date: January 1, 2025. Last updated: January 1, 2025.
          </p>
        </section>

        {/* Overview */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            1. Overview
          </h2>
          <p className="text-sm muted leading-relaxed">
            ScanRook is a vulnerability scanning platform consisting of a CLI tool
            and a cloud platform. This Privacy Policy explains what data we collect,
            how we use it, and how we protect it. We are committed to collecting
            only the data necessary to provide the Service and handling it
            responsibly.
          </p>
        </section>

        {/* Data collected - CLI */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            2. Data collected by the CLI
          </h2>
          <p className="text-sm muted leading-relaxed">
            When using the CLI in local mode (without cloud enrichment), ScanRook
            does not collect, transmit, or store any data on external servers. All
            scanning activity happens entirely on your local machine. The CLI does
            not include telemetry, analytics, or phone-home functionality.
          </p>
          <p className="text-sm muted leading-relaxed">
            When cloud enrichment is enabled, the CLI sends package names and
            versions to the ScanRook API for enhanced vulnerability lookup. No
            artifact file content, binary data, or source code is transmitted.
          </p>
        </section>

        {/* Data collected - Platform */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            3. Data collected by the platform
          </h2>
          <p className="text-sm muted leading-relaxed">
            When using the cloud platform at scanrook.io, we collect:
          </p>
          <ul className="grid gap-1.5 text-sm muted leading-relaxed list-disc list-inside">
            <li>
              <span className="font-semibold">Account information:</span> Email
              address, name, and authentication credentials (hashed passwords or
              OAuth tokens).
            </li>
            <li>
              <span className="font-semibold">Scan metadata:</span> Job
              identifiers, timestamps, scan status, artifact file names, file
              sizes, and scan configuration options.
            </li>
            <li>
              <span className="font-semibold">Scan results:</span> Package
              inventories (package names and versions), CVE identifiers, severity
              scores, and summary statistics.
            </li>
            <li>
              <span className="font-semibold">Uploaded artifacts:</span> When you
              upload files for scanning, the artifacts are temporarily stored in
              S3-compatible object storage for processing.
            </li>
            <li>
              <span className="font-semibold">Organization data:</span> Team
              names, membership, and API key metadata (keys are hashed at rest).
            </li>
          </ul>
          <p className="text-sm muted leading-relaxed">
            We do not collect or store the content of scanned artifacts beyond what
            is necessary for the scanning process. Scan reports contain only
            metadata (package names, versions, CVE IDs) and never include binary
            content or source code.
          </p>
        </section>

        {/* How data is stored */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            4. How data is stored and protected
          </h2>
          <ul className="grid gap-1.5 text-sm muted leading-relaxed list-disc list-inside">
            <li>All data in transit is encrypted using TLS.</li>
            <li>Uploaded artifacts are stored in S3-compatible object storage with server-side encryption.</li>
            <li>Database records are stored in PostgreSQL with encryption at rest via Kubernetes etcd encryption.</li>
            <li>Passwords are hashed using industry-standard algorithms and never stored in plaintext.</li>
            <li>API keys are hashed at rest and scoped to organizations.</li>
            <li>Access to infrastructure is restricted to authorized personnel and protected by SSH key authentication.</li>
          </ul>
        </section>

        {/* Third-party services */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            5. Third-party services
          </h2>
          <p className="text-sm muted leading-relaxed">
            ScanRook integrates with the following third-party services for
            vulnerability data enrichment:
          </p>
          <ul className="grid gap-1.5 text-sm muted leading-relaxed list-disc list-inside">
            <li>
              <span className="font-semibold">OSV (Google Open Source Vulnerabilities):</span>{" "}
              Package names and versions are sent to the OSV API for vulnerability lookup.
            </li>
            <li>
              <span className="font-semibold">NVD (NIST National Vulnerability Database):</span>{" "}
              CPE identifiers are queried against the NVD API.
            </li>
            <li>
              <span className="font-semibold">Red Hat OVAL:</span>{" "}
              Advisory data is fetched for Red Hat-based distributions.
            </li>
            <li>
              <span className="font-semibold">FIRST.org EPSS:</span>{" "}
              Exploit prediction scores are fetched for CVE identifiers.
            </li>
            <li>
              <span className="font-semibold">CISA KEV:</span>{" "}
              The Known Exploited Vulnerabilities catalog is checked for active exploitation status.
            </li>
          </ul>
          <p className="text-sm muted leading-relaxed">
            These services receive only package names, versions, and CVE
            identifiers. No artifact content, account information, or personal
            data is shared with these providers.
          </p>
        </section>

        {/* Data retention */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            6. Data retention
          </h2>
          <ul className="grid gap-1.5 text-sm muted leading-relaxed list-disc list-inside">
            <li>
              <span className="font-semibold">Uploaded artifacts:</span> Deleted
              from object storage after scan completion. Artifacts are retained
              for a maximum of 7 days to allow for reprocessing in case of
              failures.
            </li>
            <li>
              <span className="font-semibold">Scan reports:</span> Retained in
              object storage and the database for as long as your account is
              active. You can delete individual scan results at any time.
            </li>
            <li>
              <span className="font-semibold">Account data:</span> Retained for
              as long as your account is active. Upon account deletion, all
              associated data is removed within 30 days.
            </li>
            <li>
              <span className="font-semibold">Cached vulnerability data:</span>{" "}
              CVE data fetched from third-party sources is cached locally and in
              our database for performance. This data is publicly available
              information and is refreshed periodically.
            </li>
          </ul>
        </section>

        {/* Your rights */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            7. Your rights
          </h2>
          <p className="text-sm muted leading-relaxed">
            You have the right to:
          </p>
          <ul className="grid gap-1.5 text-sm muted leading-relaxed list-disc list-inside">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your account and associated data.</li>
            <li>Export your scan results and reports.</li>
            <li>Withdraw consent for cloud enrichment at any time by disabling the feature in the CLI.</li>
          </ul>
          <p className="text-sm muted leading-relaxed">
            To exercise any of these rights, contact{" "}
            <a
              href="mailto:privacy@scanrook.io"
              className="font-semibold underline underline-offset-2"
            >
              privacy@scanrook.io
            </a>
            .
          </p>
        </section>

        {/* Cookies */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            8. Cookies
          </h2>
          <p className="text-sm muted leading-relaxed">
            The Platform uses essential cookies for authentication session
            management only. We do not use tracking cookies, advertising cookies,
            or third-party analytics cookies. Theme preference is stored in
            localStorage and is not transmitted to our servers.
          </p>
        </section>

        {/* Changes */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            9. Changes to this policy
          </h2>
          <p className="text-sm muted leading-relaxed">
            We may update this Privacy Policy from time to time. Material changes
            will be communicated through the Platform or via email. The effective
            date at the top of this page indicates when the policy was last updated.
          </p>
        </section>

        {/* Contact */}
        <section className="surface-card p-8 grid gap-4 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Questions?
          </h2>
          <p className="text-sm muted">
            For privacy-related inquiries, contact{" "}
            <a
              href="mailto:privacy@scanrook.io"
              className="font-semibold underline underline-offset-2"
            >
              privacy@scanrook.io
            </a>
            .
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-1">
            <Link href="/terms" className="btn-secondary">
              Terms of service
            </Link>
            <Link href="/security" className="btn-secondary">
              Security
            </Link>
          </div>
        </section>
      </main>
    </PublicSiteShell>
  );
}
