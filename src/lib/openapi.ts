import { APP_NAME } from "@/lib/brand";

export type OpenApiDocument = {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{ url: string; description: string }>;
  tags: Array<{ name: string; description: string }>;
  paths: Record<string, unknown>;
  components: {
    securitySchemes: Record<string, unknown>;
    schemas: Record<string, unknown>;
    responses: Record<string, unknown>;
  };
  security: Array<{ bearerAuth?: string[]; apiKeyAuth?: string[] }>;
};

export function buildOpenApiDocument(baseUrl: string): OpenApiDocument {
  const bearerOrHeader: OpenApiDocument["security"] = [{ bearerAuth: [] }, { apiKeyAuth: [] }];

  return {
    openapi: "3.1.0",
    info: {
      title: `${APP_NAME} API`,
      version: "1.0.0",
      description:
        "Organization-scoped scanning API. Authenticate with either `Authorization: Bearer <API_KEY>` or `x-api-key: <API_KEY>`.",
    },
    servers: [
      {
        url: baseUrl,
        description: `Current ${APP_NAME} deployment`,
      },
    ],
    tags: [
      { name: "jobs", description: "Scan job lifecycle and results" },
      { name: "uploads", description: "Direct upload presign helpers" },
      { name: "api-keys", description: "Organization API key management" },
      { name: "cli", description: "ScanRook CLI auth and cloud enrichment limits" },
    ],
    security: bearerOrHeader,
    paths: {
      "/api/jobs": {
        get: {
          tags: ["jobs"],
          summary: "List jobs",
          security: bearerOrHeader,
          responses: {
            "200": {
              description: "Jobs list",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Job" },
                  },
                },
              },
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "403": { $ref: "#/components/responses/ForbiddenRole" },
          },
        },
      },
      "/api/uploads/presign": {
        post: {
          tags: ["uploads"],
          summary: "Request presigned object upload URL",
          security: bearerOrHeader,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["filename", "contentType", "method"],
                  properties: {
                    filename: { type: "string", example: "centos-7.tar" },
                    contentType: { type: "string", example: "application/x-tar" },
                    method: { type: "string", enum: ["PUT"], example: "PUT" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Presigned upload payload",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PresignResponse" },
                },
              },
            },
            "400": { description: "Bad request" },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "403": { $ref: "#/components/responses/ForbiddenRole" },
          },
        },
      },
      "/api/scan/from-s3": {
        post: {
          tags: ["jobs"],
          summary: "Queue scan from uploaded object",
          security: bearerOrHeader,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["bucket", "key"],
                  properties: {
                    bucket: { type: "string", example: "scanrook" },
                    key: { type: "string", example: "uploads/centos-7.tar" },
                    mode: { type: "string", enum: ["light", "deep"], example: "deep" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Queued job payload",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/QueuedJobResponse" },
                },
              },
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "403": { $ref: "#/components/responses/ForbiddenRole" },
            "402": { description: "Quota exceeded" },
          },
        },
      },
      "/api/jobs/{id}/events/list": {
        get: {
          tags: ["jobs"],
          summary: "Fetch workflow event list",
          security: bearerOrHeader,
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
            {
              name: "page_size",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1, maximum: 5000, default: 500 },
            },
            {
              name: "cursor",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1 },
            },
            {
              name: "order",
              in: "query",
              required: false,
              schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
            },
          ],
          responses: {
            "200": {
              description: "Job events",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/EventsListResponse" },
                },
              },
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "403": { $ref: "#/components/responses/ForbiddenRole" },
            "404": { description: "Job not found" },
          },
        },
      },
      "/api/jobs/{id}/findings": {
        get: {
          tags: ["jobs"],
          summary: "Fetch paginated findings",
          security: bearerOrHeader,
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "page_size", in: "query", schema: { type: "integer", default: 50 } },
            { name: "severity", in: "query", schema: { type: "string" } },
            { name: "tier", in: "query", schema: { type: "string", enum: ["all", "confirmed", "heuristic"] } },
            { name: "fixed", in: "query", schema: { type: "boolean" } },
            { name: "search", in: "query", schema: { type: "string" } },
          ],
          responses: {
            "200": {
              description: "Findings payload",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/FindingsResponse" },
                },
              },
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "403": { $ref: "#/components/responses/ForbiddenRole" },
            "404": { description: "Job not found" },
          },
        },
      },
      "/api/jobs/{id}/files": {
        get: {
          tags: ["jobs"],
          summary: "Fetch paginated file tree entries",
          security: bearerOrHeader,
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "page_size", in: "query", schema: { type: "integer", default: 100 } },
            { name: "parent", in: "query", schema: { type: "string" } },
            { name: "search", in: "query", schema: { type: "string" } },
          ],
          responses: {
            "200": {
              description: "File tree payload",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/FilesResponse" },
                },
              },
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "403": { $ref: "#/components/responses/ForbiddenRole" },
            "404": { description: "Job not found" },
          },
        },
      },
      "/api/jobs/{id}/packages": {
        get: {
          tags: ["jobs"],
          summary: "Fetch paginated package inventory",
          security: bearerOrHeader,
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "page_size", in: "query", schema: { type: "integer", default: 100 } },
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "ecosystem", in: "query", schema: { type: "string" } },
            { name: "sort", in: "query", schema: { type: "string" } },
            { name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
          ],
          responses: {
            "200": {
              description: "Package inventory payload",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PackagesResponse" },
                },
              },
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "403": { $ref: "#/components/responses/ForbiddenRole" },
            "404": { description: "Job not found" },
          },
        },
      },
      "/api/jobs/{id}/cancel": {
        post: {
          tags: ["jobs"],
          summary: "Cancel a queued or running scan",
          security: bearerOrHeader,
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          ],
          responses: {
            "200": { description: "Job cancelled", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string" }, id: { type: "string" } } } } } },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "403": { $ref: "#/components/responses/ForbiddenRole" },
            "409": { description: "Job not in cancellable state" },
          },
        },
      },
      "/api/jobs/{id}/requeue": {
        post: {
          tags: ["jobs"],
          summary: "Re-queue a failed or cancelled scan",
          security: bearerOrHeader,
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          ],
          responses: {
            "200": { description: "Job re-queued", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string" }, id: { type: "string" } } } } } },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "403": { $ref: "#/components/responses/ForbiddenRole" },
            "409": { description: "Job not in requeueable state" },
          },
        },
      },
      "/api/org/api-keys": {
        get: {
          tags: ["api-keys"],
          summary: "List org API keys",
          security: bearerOrHeader,
          responses: {
            "200": {
              description: "API keys",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      items: {
                        type: "array",
                        items: { $ref: "#/components/schemas/ApiKeyListItem" },
                      },
                    },
                  },
                },
              },
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "403": { $ref: "#/components/responses/ForbiddenRole" },
          },
        },
        post: {
          tags: ["api-keys"],
          summary: "Create org API key",
          security: bearerOrHeader,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: { type: "string", example: "ci-scans" },
                    roles_mask: { type: "string", example: "8" },
                    expires_at: { type: "string", format: "date-time", nullable: true },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "New API key token (shown once)",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      prefix: { type: "string" },
                      token: { type: "string" },
                      warning: { type: "string" },
                    },
                  },
                },
              },
            },
            "400": { description: "Bad request" },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "403": { $ref: "#/components/responses/ForbiddenRole" },
          },
        },
      },
      "/api/org/api-keys/{id}": {
        delete: {
          tags: ["api-keys"],
          summary: "Revoke org API key",
          security: bearerOrHeader,
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: {
            "200": {
              description: "Revoke response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      ok: { type: "boolean" },
                    },
                  },
                },
              },
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "403": { $ref: "#/components/responses/ForbiddenRole" },
          },
        },
      },
      "/api/cli/limits": {
        get: {
          tags: ["cli"],
          summary: "Get current CLI cloud-enrichment limit status",
          security: bearerOrHeader,
          responses: {
            "200": {
              description: "CLI limit status",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CliLimitStatus" },
                },
              },
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/api/cli/enrich": {
        post: {
          tags: ["cli"],
          summary: "Consume one cloud-enrichment token for CLI scans",
          security: bearerOrHeader,
          responses: {
            "200": {
              description: "Cloud enrich allowed",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CliLimitStatus" },
                },
              },
            },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "429": { $ref: "#/components/responses/CliRateLimited" },
          },
        },
      },
      "/api/cli/auth/device/start": {
        post: {
          tags: ["cli"],
          summary: "Start CLI device login flow",
          security: [],
          responses: {
            "200": {
              description: "Device flow request created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CliDeviceStartResponse" },
                },
              },
            },
            "503": { description: "Device auth unavailable" },
          },
        },
      },
      "/api/cli/auth/device/complete": {
        post: {
          tags: ["cli"],
          summary: "Approve or poll CLI device login flow",
          description:
            "Anonymous call polls device status. Authenticated call with approve=true mints and binds an org API key for the device code.",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["device_code"],
                  properties: {
                    device_code: { type: "string" },
                    approve: { type: "boolean", default: false },
                    name: { type: "string", example: "scanrook-cli" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Approve/poll response",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CliDeviceCompleteResponse" },
                },
              },
            },
            "400": { description: "Bad request" },
            "401": { $ref: "#/components/responses/Unauthorized" },
            "403": { $ref: "#/components/responses/ForbiddenRole" },
            "404": { description: "Expired or unknown device code" },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "API Key",
          description: "Authorization: Bearer <API_KEY>",
        },
        apiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description: "x-api-key: <API_KEY>",
        },
      },
      schemas: {
        ErrorUnauthorized: {
          type: "object",
          properties: {
            error: { type: "string", example: "Unauthorized" },
          },
          required: ["error"],
        },
        ErrorForbiddenRole: {
          type: "object",
          properties: {
            error: { type: "string" },
            code: { type: "string", example: "forbidden_role" },
            roles: { type: "array", items: { type: "string" } },
            required_roles: { type: "array", items: { type: "string" } },
            roles_mask: { type: "string" },
            feature: { type: "string" },
          },
          required: ["error", "code"],
        },
        ErrorCliRateLimited: {
          type: "object",
          properties: {
            code: { type: "string", example: "cloud_enrich_rate_limited" },
            limit_type: { type: "string", example: "anonymous_daily" },
            remaining: { type: "integer", example: 0 },
            reset_at: { type: "string", format: "date-time" },
            upgrade_url: { type: "string" },
          },
          required: ["code", "limit_type", "remaining", "reset_at", "upgrade_url"],
        },
        Job: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            status: { type: "string", enum: ["queued", "running", "done", "failed", "cancelled", "deleting"] },
            object_key: { type: "string" },
            created_at: { type: "string", format: "date-time" },
            started_at: { type: "string", format: "date-time", nullable: true },
            finished_at: { type: "string", format: "date-time", nullable: true },
            progress_pct: { type: "integer" },
            progress_msg: { type: "string", nullable: true },
          },
          required: ["id", "status", "object_key", "created_at", "progress_pct"],
        },
        PresignResponse: {
          type: "object",
          properties: {
            url: { type: "string" },
            bucket: { type: "string" },
            object_key: { type: "string" },
            method: { type: "string" },
          },
        },
        QueuedJobResponse: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            jobId: { type: "string", format: "uuid" },
            key: { type: "string" },
            bucket: { type: "string" },
            queued: { type: "boolean" },
          },
        },
        JobEvent: {
          type: "object",
          properties: {
            id: { type: "integer" },
            ts: { type: "string", format: "date-time" },
            stage: { type: "string" },
            detail: { type: "string" },
            pct: { type: "integer", nullable: true },
          },
        },
        EventsListResponse: {
          type: "object",
          properties: {
            items: { type: "array", items: { $ref: "#/components/schemas/JobEvent" } },
            total: { type: "integer" },
            next_cursor: { type: "integer", nullable: true },
            has_more: { type: "boolean" },
            page_size: { type: "integer" },
            order: { type: "string", enum: ["asc", "desc"] },
          },
        },
        FindingsResponse: {
          type: "object",
          properties: {
            items: { type: "array", items: { type: "object" } },
            summary: { type: "object", additionalProperties: { type: "number" } },
            page: { type: "integer" },
            page_size: { type: "integer" },
            total: { type: "integer" },
            scan_status: { type: "string", nullable: true },
            inventory_status: { type: "string", nullable: true },
            inventory_reason: { type: "string", nullable: true },
          },
        },
        FilesResponse: {
          type: "object",
          properties: {
            entries: { type: "array", items: { type: "object" } },
            breadcrumbs: { type: "array", items: { type: "string" } },
            page: { type: "integer" },
            page_size: { type: "integer" },
            total: { type: "integer" },
            parent: { type: "string" },
            search: { type: "string" },
          },
        },
        PackagesResponse: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  ecosystem: { type: "string" },
                  version: { type: "string" },
                  source_kind: { type: "string" },
                  source_path: { type: "string", nullable: true },
                  confidence_tier: { type: "string" },
                  evidence_source: { type: "string" },
                },
                required: ["name", "ecosystem", "version", "source_kind", "confidence_tier", "evidence_source"],
              },
            },
            page: { type: "integer" },
            page_size: { type: "integer" },
            total: { type: "integer" },
            search: { type: "string" },
            ecosystem: { type: "string" },
            sort: { type: "string" },
            order: { type: "string", enum: ["asc", "desc"] },
          },
        },
        ApiKeyListItem: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            prefix: { type: "string" },
            roles_mask: { type: "string" },
            status: { type: "string" },
            created_at: { type: "string", format: "date-time" },
            last_used_at: { type: "string", format: "date-time", nullable: true },
            expires_at: { type: "string", format: "date-time", nullable: true },
          },
        },
        CliLimitStatus: {
          type: "object",
          properties: {
            allowed: { type: "boolean" },
            code: { type: "string", nullable: true },
            limit_type: { type: "string" },
            remaining: { type: "integer", nullable: true },
            reset_at: { type: "string", format: "date-time", nullable: true },
            limit: { type: "integer", nullable: true },
            upgrade_url: { type: "string" },
            actor_kind: { type: "string", enum: ["anonymous", "api_key", "user"] },
            org_id: { type: "string", format: "uuid" },
            plan_code: { type: "string", nullable: true },
          },
          required: ["allowed", "limit_type", "upgrade_url", "actor_kind", "org_id"],
        },
        CliDeviceStartResponse: {
          type: "object",
          properties: {
            device_code: { type: "string" },
            user_code: { type: "string" },
            verification_uri: { type: "string" },
            verification_uri_complete: { type: "string" },
            expires_in: { type: "integer" },
            interval: { type: "integer" },
            message: { type: "string" },
          },
          required: [
            "device_code",
            "user_code",
            "verification_uri",
            "verification_uri_complete",
            "expires_in",
            "interval",
          ],
        },
        CliDeviceCompleteResponse: {
          type: "object",
          properties: {
            ok: { type: "boolean", nullable: true },
            status: { type: "string", enum: ["pending", "authorized", "expired_or_invalid"] },
            api_key: { type: "string", nullable: true },
            org_id: { type: "string", format: "uuid", nullable: true },
            roles_mask: { type: "string", nullable: true },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorUnauthorized" },
            },
          },
        },
        ForbiddenRole: {
          description: "Forbidden due to role restrictions",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorForbiddenRole" },
            },
          },
        },
        CliRateLimited: {
          description: "Cloud enrichment limit exceeded",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorCliRateLimited" },
            },
          },
        },
      },
    },
  };
}
