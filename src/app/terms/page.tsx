import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/brand";
import PublicSiteShell from "@/components/PublicSiteShell";

export const metadata: Metadata = {
  title: `Terms of Service | ${APP_NAME}`,
  description:
    "ScanRook terms of service covering acceptable use, limitations of liability, and data handling for the CLI tool and cloud platform.",
  openGraph: {
    title: `Terms of Service | ${APP_NAME}`,
    description: "Terms of service for ScanRook CLI and cloud platform.",
  },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function TermsPage() {
  return (
    <PublicSiteShell>
      <main className="mx-auto max-w-4xl px-6 py-14 grid gap-8">
        {/* Header */}
        <section className="surface-card p-8 grid gap-4">
          <div className="inline-flex w-fit items-center rounded-full border border-black/10 dark:border-white/10 px-3 py-1 text-xs muted">
            Legal
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm muted">
            Effective date: January 1, 2025. Last updated: January 1, 2025.
          </p>
        </section>

        {/* Introduction */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            1. Introduction
          </h2>
          <p className="text-sm muted leading-relaxed">
            These Terms of Service (&quot;Terms&quot;) govern your use of the ScanRook
            vulnerability scanner CLI tool (&quot;CLI&quot;) and the ScanRook cloud
            platform available at scanrook.io (&quot;Platform&quot;), collectively
            referred to as the &quot;Service.&quot; By using the Service, you agree to
            be bound by these Terms. If you do not agree, do not use the Service.
          </p>
        </section>

        {/* Service description */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            2. Service description
          </h2>
          <p className="text-sm muted leading-relaxed">
            ScanRook is a vulnerability scanning platform that analyzes software
            artifacts (container images, binaries, ISO images, and SBOMs) for known
            vulnerabilities. The CLI operates locally on your machine. The Platform
            provides cloud-based scan management, artifact storage, team
            collaboration, and enriched vulnerability data.
          </p>
        </section>

        {/* Accounts */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            3. Accounts
          </h2>
          <p className="text-sm muted leading-relaxed">
            The CLI does not require an account. The Platform requires an account
            for access to cloud features. You are responsible for maintaining the
            security of your account credentials and API keys. You must notify us
            immediately if you become aware of any unauthorized use of your account.
          </p>
        </section>

        {/* Acceptable use */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            4. Acceptable use
          </h2>
          <p className="text-sm muted leading-relaxed">You agree not to:</p>
          <ul className="grid gap-1.5 text-sm muted leading-relaxed list-disc list-inside">
            <li>Use the Service to scan artifacts you do not have authorization to analyze.</li>
            <li>Attempt to reverse-engineer, decompile, or extract source code from the Service beyond what is permitted by applicable law.</li>
            <li>Abuse API rate limits or attempt to circumvent usage restrictions.</li>
            <li>Upload malicious content designed to exploit the Service infrastructure.</li>
            <li>Resell, sublicense, or redistribute the Service without written permission.</li>
            <li>Use the Service in any way that violates applicable laws or regulations.</li>
          </ul>
        </section>

        {/* Intellectual property */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            5. Intellectual property
          </h2>
          <p className="text-sm muted leading-relaxed">
            ScanRook and its components are proprietary software. You retain
            ownership of all artifacts you upload and scan results generated from
            your artifacts. We claim no ownership over your data. Vulnerability data
            sourced from third-party databases (OSV, NVD, Red Hat OVAL, CISA KEV,
            EPSS) is subject to the respective providers&apos; terms and licenses.
          </p>
        </section>

        {/* Data handling */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            6. Data handling
          </h2>
          <p className="text-sm muted leading-relaxed">
            When using the CLI locally, no data is transmitted to ScanRook servers
            unless you explicitly enable cloud enrichment. When using the Platform,
            uploaded artifacts are stored in encrypted object storage and processed
            by the scanning worker. Scan reports contain metadata only (package
            names, versions, CVE identifiers) and do not include artifact file
            content. See our{" "}
            <Link href="/privacy" className="font-semibold underline underline-offset-2">
              Privacy Policy
            </Link>{" "}
            for details.
          </p>
        </section>

        {/* Service availability */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            7. Service availability
          </h2>
          <p className="text-sm muted leading-relaxed">
            We strive to maintain high availability of the Platform but do not
            guarantee uninterrupted access. The Service may be temporarily
            unavailable for maintenance, updates, or circumstances beyond our
            control. The CLI operates independently and is not affected by Platform
            availability.
          </p>
        </section>

        {/* Limitation of liability */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            8. Limitation of liability
          </h2>
          <p className="text-sm muted leading-relaxed">
            The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties
            of any kind, express or implied. ScanRook does not guarantee that all
            vulnerabilities will be detected or that scan results are free from
            false positives or false negatives. Vulnerability data is sourced from
            third-party databases and may be incomplete or delayed.
          </p>
          <p className="text-sm muted leading-relaxed">
            To the maximum extent permitted by applicable law, ScanRook shall not
            be liable for any indirect, incidental, special, consequential, or
            punitive damages, including loss of profits, data, or business
            opportunity, arising from your use of the Service.
          </p>
        </section>

        {/* Indemnification */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            9. Indemnification
          </h2>
          <p className="text-sm muted leading-relaxed">
            You agree to indemnify and hold harmless ScanRook and its affiliates
            from any claims, damages, or expenses arising from your use of the
            Service or violation of these Terms.
          </p>
        </section>

        {/* Termination */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            10. Termination
          </h2>
          <p className="text-sm muted leading-relaxed">
            We may suspend or terminate your access to the Platform at any time for
            violation of these Terms or for any other reason with reasonable notice.
            You may terminate your account at any time by contacting support. Upon
            termination, your uploaded artifacts and scan data will be deleted in
            accordance with our data retention policy.
          </p>
        </section>

        {/* Changes */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            11. Changes to these terms
          </h2>
          <p className="text-sm muted leading-relaxed">
            We may update these Terms from time to time. Material changes will be
            communicated through the Platform or via email. Continued use of the
            Service after changes take effect constitutes acceptance of the updated
            Terms.
          </p>
        </section>

        {/* Governing law */}
        <section className="surface-card p-8 grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            12. Governing law
          </h2>
          <p className="text-sm muted leading-relaxed">
            These Terms are governed by and construed in accordance with the laws of
            the United States. Any disputes arising under these Terms shall be
            resolved in the courts of competent jurisdiction.
          </p>
        </section>

        {/* Contact */}
        <section className="surface-card p-8 grid gap-4 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Questions?
          </h2>
          <p className="text-sm muted">
            For questions about these terms, contact{" "}
            <a
              href="mailto:legal@scanrook.io"
              className="font-semibold underline underline-offset-2"
            >
              legal@scanrook.io
            </a>
            .
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-1">
            <Link href="/privacy" className="btn-secondary">
              Privacy policy
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
