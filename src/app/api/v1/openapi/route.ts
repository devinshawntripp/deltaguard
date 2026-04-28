export async function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "ScanRook API",
      version: "1.0.0",
      description:
        "Vulnerability scanning, license compliance, and security data API. Scan container images, check packages for CVEs, and monitor your software supply chain.",
      contact: {
        name: "ScanRook",
        url: "https://scanrook.io",
        email: "support@scanrook.io",
      },
    },
    servers: [{ url: "https://scanrook.io", description: "Production" }],
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "API key from /dashboard/settings/api-keys",
        },
      },
    },
    paths: {
      "/api/v1/scan": {
        post: {
          summary: "Scan a container image",
          description:
            "Start a vulnerability scan on a Docker/OCI image. Returns results inline (waits for completion) or immediately with a job ID.",
          operationId: "scanImage",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["image"],
                  properties: {
                    image: {
                      type: "string",
                      description: "Docker image reference",
                      example: "nginx:1.27",
                    },
                    mode: {
                      type: "string",
                      enum: ["light", "deep"],
                      default: "light",
                    },
                    wait: {
                      type: "boolean",
                      default: false,
                      description:
                        "If true, wait for scan completion and return results inline",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Scan results (when wait=true)" },
            "202": {
              description: "Scan queued (when wait=false), returns job_id",
            },
          },
        },
      },
      "/api/v1/check": {
        post: {
          summary: "Check a package for vulnerabilities",
          description:
            "Query the OSV database for known vulnerabilities affecting a specific package version. No authentication required.",
          operationId: "checkPackage",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["ecosystem", "name"],
                  properties: {
                    ecosystem: {
                      type: "string",
                      description: "Package ecosystem",
                      example: "npm",
                    },
                    name: {
                      type: "string",
                      description: "Package name",
                      example: "lodash",
                    },
                    version: {
                      type: "string",
                      description: "Package version (optional)",
                      example: "4.17.20",
                    },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Vulnerability results" } },
        },
      },
      "/api/v1/cve/{id}": {
        get: {
          summary: "Look up a CVE",
          description:
            "Get details about a specific CVE including severity, affected packages, and references.",
          operationId: "getCve",
          security: [],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "CVE-2024-0727",
            },
          ],
          responses: { "200": { description: "CVE details" } },
        },
      },
      "/api/v1/schedule": {
        post: {
          summary: "Create a scan schedule",
          description:
            "Schedule recurring vulnerability scans for a container image.",
          operationId: "createSchedule",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["image"],
                  properties: {
                    image: { type: "string", example: "nginx:1.27" },
                    cron: {
                      type: "string",
                      default: "0 0 * * *",
                      description: "Cron expression",
                    },
                    webhook_url: {
                      type: "string",
                      description:
                        "URL to POST results to when scan completes",
                    },
                  },
                },
              },
            },
          },
          responses: { "201": { description: "Schedule created" } },
        },
        get: {
          summary: "List scan schedules",
          description: "List all scan schedules for the authenticated organization.",
          operationId: "listSchedules",
          responses: { "200": { description: "List of schedules" } },
        },
      },
      "/api/feed/latest-cves": {
        get: {
          summary: "Latest enriched CVEs",
          description:
            "Public feed of recently discovered CVEs enriched with EPSS scores and CISA KEV status.",
          operationId: "latestCves",
          security: [],
          parameters: [
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 20 },
            },
            {
              name: "severity",
              in: "query",
              schema: {
                type: "string",
                enum: ["critical", "high", "medium", "low"],
              },
            },
          ],
          responses: { "200": { description: "List of CVEs" } },
        },
      },
      "/api/feed/epss-top": {
        get: {
          summary: "Top exploited CVEs by EPSS score",
          description:
            "Public feed of CVEs most likely to be exploited, ranked by EPSS probability.",
          operationId: "epssTop",
          security: [],
          parameters: [
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 20 },
            },
          ],
          responses: { "200": { description: "List of CVEs ranked by EPSS" } },
        },
      },
    },
  };

  return Response.json(spec, {
    headers: { "Cache-Control": "public, s-maxage=3600" },
  });
}
