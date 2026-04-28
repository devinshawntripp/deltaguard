import type { Metadata } from "next";
import CodeCopyBlock from "@/components/CodeCopyBlock";

export const metadata: Metadata = {
  title: "API Reference - ScanRook",
  description:
    "ScanRook REST API documentation. Scan images, check packages, look up CVEs, and schedule recurring scans.",
};

function SectionHeader({
  title,
  blurb,
}: {
  title: string;
  blurb?: string;
}) {
  return (
    <div className="grid gap-1">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {blurb && <p className="text-xs muted max-w-2xl">{blurb}</p>}
    </div>
  );
}

function EndpointBlock({
  method,
  path,
  summary,
  auth,
  children,
}: {
  method: string;
  path: string;
  summary: string;
  auth: boolean;
  children?: React.ReactNode;
}) {
  const methodColor =
    method === "GET"
      ? "bg-green-500/20 text-green-400"
      : "bg-blue-500/20 text-blue-400";

  return (
    <div className="border border-white/10 rounded-lg p-5 grid gap-4">
      <div className="flex items-center gap-3">
        <span
          className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${methodColor}`}
        >
          {method}
        </span>
        <code className="text-sm font-mono">{path}</code>
        {!auth && (
          <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
            Public
          </span>
        )}
        {auth && (
          <span className="ml-auto text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
            Auth Required
          </span>
        )}
      </div>
      <p className="text-sm muted">{summary}</p>
      {children}
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <article className="grid gap-6">
      <section className="surface-card p-7 grid gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          API Reference
        </h1>
        <p className="muted text-sm max-w-3xl">
          The ScanRook API lets you scan container images, check packages for
          vulnerabilities, look up CVEs, and schedule recurring scans. Public
          endpoints require no authentication. Authenticated endpoints use an
          API key.
        </p>
        <p className="text-sm">
          <span className="font-medium">Base URL:</span>{" "}
          <code className="text-xs bg-white/5 px-2 py-0.5 rounded">
            https://scanrook.io
          </code>
        </p>
        <p className="text-sm">
          <span className="font-medium">OpenAPI spec:</span>{" "}
          <a
            href="/api/v1/openapi"
            className="text-brand-500 hover:underline text-xs font-mono"
          >
            /api/v1/openapi
          </a>
        </p>
      </section>

      {/* Authentication */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Authentication"
          blurb="Authenticated endpoints require a Bearer token. Generate an API key from your dashboard."
        />
        <div className="grid gap-3">
          <p className="text-sm">
            1. Go to{" "}
            <a
              href="/dashboard/settings/api-keys"
              className="text-brand-500 hover:underline"
            >
              Dashboard &rarr; Settings &rarr; API Keys
            </a>
          </p>
          <p className="text-sm">2. Create a new API key</p>
          <p className="text-sm">
            3. Include it in requests as a Bearer token:
          </p>
          <CodeCopyBlock
            label="Authorization header"
            code='Authorization: Bearer dgk_your_api_key_here'
          />
        </div>
      </section>

      {/* Scan */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader title="Scan Endpoints" />

        <EndpointBlock
          method="POST"
          path="/api/v1/scan"
          summary="Start a vulnerability scan on a Docker/OCI image. Set wait=true to block until results are ready, or receive a job ID immediately."
          auth={true}
        >
          <CodeCopyBlock
            label="Quick scan (async)"
            code={`curl -X POST https://scanrook.io/api/v1/scan \\
  -H "Authorization: Bearer dgk_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"image": "nginx:1.27"}'`}
          />
          <CodeCopyBlock
            label="Scan and wait for results"
            code={`curl -X POST https://scanrook.io/api/v1/scan \\
  -H "Authorization: Bearer dgk_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"image": "nginx:1.27", "wait": true, "mode": "deep"}'`}
          />
          <div className="text-xs muted grid gap-1">
            <p>
              <strong>Parameters:</strong>
            </p>
            <ul className="list-disc list-inside ml-2 grid gap-0.5">
              <li>
                <code>image</code> (required) — Docker image reference, e.g.{" "}
                <code>nginx:1.27</code>
              </li>
              <li>
                <code>mode</code> — <code>light</code> (default) or{" "}
                <code>deep</code>
              </li>
              <li>
                <code>wait</code> — <code>true</code> to block until scan
                completes (max 5 min)
              </li>
            </ul>
          </div>
        </EndpointBlock>
      </section>

      {/* Check */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader title="Package Check" />

        <EndpointBlock
          method="POST"
          path="/api/v1/check"
          summary="Check a specific package version for known vulnerabilities via OSV. No authentication required."
          auth={false}
        >
          <CodeCopyBlock
            label="Check a package"
            code={`curl -X POST https://scanrook.io/api/v1/check \\
  -H "Content-Type: application/json" \\
  -d '{"ecosystem": "npm", "name": "lodash", "version": "4.17.20"}'`}
          />
          <div className="text-xs muted grid gap-1">
            <p>
              <strong>Parameters:</strong>
            </p>
            <ul className="list-disc list-inside ml-2 grid gap-0.5">
              <li>
                <code>ecosystem</code> (required) — e.g. npm, PyPI, Go,
                crates.io, Maven, NuGet
              </li>
              <li>
                <code>name</code> (required) — package name
              </li>
              <li>
                <code>version</code> — specific version to check (optional)
              </li>
            </ul>
          </div>
        </EndpointBlock>
      </section>

      {/* CVE Lookup */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader title="CVE Lookup" />

        <EndpointBlock
          method="GET"
          path="/api/v1/cve/{id}"
          summary="Look up a specific CVE with severity, affected packages, and references. No authentication required."
          auth={false}
        >
          <CodeCopyBlock
            label="Look up a CVE"
            code="curl https://scanrook.io/api/v1/cve/CVE-2024-0727"
          />
        </EndpointBlock>
      </section>

      {/* Schedules */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader title="Scan Schedules" />

        <EndpointBlock
          method="POST"
          path="/api/v1/schedule"
          summary="Create a recurring scan schedule for a container image. Optionally receive results via webhook."
          auth={true}
        >
          <CodeCopyBlock
            label="Create a daily scan schedule"
            code={`curl -X POST https://scanrook.io/api/v1/schedule \\
  -H "Authorization: Bearer dgk_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"image": "nginx:1.27", "cron": "0 0 * * *", "webhook_url": "https://example.com/hook"}'`}
          />
        </EndpointBlock>

        <EndpointBlock
          method="GET"
          path="/api/v1/schedule"
          summary="List all scan schedules for your organization."
          auth={true}
        >
          <CodeCopyBlock
            label="List schedules"
            code={`curl https://scanrook.io/api/v1/schedule \\
  -H "Authorization: Bearer dgk_your_key"`}
          />
        </EndpointBlock>
      </section>

      {/* Feeds */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader
          title="Public Data Feeds"
          blurb="Public, cacheable feeds for vulnerability intelligence. No authentication required."
        />

        <EndpointBlock
          method="GET"
          path="/api/feed/latest-cves"
          summary="Recently discovered CVEs enriched with severity data."
          auth={false}
        >
          <CodeCopyBlock
            label="Get latest CVEs"
            code="curl https://scanrook.io/api/feed/latest-cves?limit=10"
          />
          <div className="text-xs muted">
            <strong>Query params:</strong> <code>limit</code> (max 100),{" "}
            <code>severity</code> (critical, high, medium, low)
          </div>
        </EndpointBlock>

        <EndpointBlock
          method="GET"
          path="/api/feed/epss-top"
          summary="CVEs ranked by EPSS exploitation probability."
          auth={false}
        >
          <CodeCopyBlock
            label="Get top EPSS scores"
            code="curl https://scanrook.io/api/feed/epss-top?limit=10"
          />
        </EndpointBlock>
      </section>

      {/* Rate Limits */}
      <section className="surface-card p-7 grid gap-5">
        <SectionHeader title="Rate Limits" />
        <div className="text-sm grid gap-2">
          <p>
            Public endpoints are cached and rate-limited to prevent abuse.
            Authenticated endpoints are subject to your plan&apos;s monthly scan
            quota.
          </p>
          <ul className="list-disc list-inside ml-2 text-xs muted grid gap-1">
            <li>
              <strong>Public endpoints:</strong> 60 requests/minute per IP
            </li>
            <li>
              <strong>Authenticated endpoints:</strong> subject to plan scan
              limits (Free: 25/month, Basic: 100/month, Pro: 500/month,
              Enterprise: unlimited)
            </li>
            <li>
              <strong>Wait mode scans:</strong> hold an HTTP connection for up
              to 5 minutes
            </li>
          </ul>
        </div>
      </section>
    </article>
  );
}
