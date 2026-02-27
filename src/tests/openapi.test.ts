import assert from "node:assert/strict";
import test from "node:test";
import { buildOpenApiDocument } from "../lib/openapi";

test("openapi includes required security schemes and paths", () => {
  const spec = buildOpenApiDocument("https://scanrook.io");

  assert.equal(spec.openapi, "3.1.0");
  assert.ok(spec.components?.securitySchemes);
  assert.ok("bearerAuth" in spec.components.securitySchemes);
  assert.ok("apiKeyAuth" in spec.components.securitySchemes);

  const requiredPaths = [
    "/api/jobs",
    "/api/uploads/presign",
    "/api/scan/from-s3",
    "/api/jobs/{id}/events/list",
    "/api/jobs/{id}/findings",
    "/api/jobs/{id}/files",
    "/api/jobs/{id}/packages",
    "/api/cli/limits",
    "/api/cli/enrich",
    "/api/cli/auth/device/start",
    "/api/cli/auth/device/complete",
  ];
  for (const p of requiredPaths) {
    assert.ok(p in spec.paths, `missing path ${p}`);
  }
});

test("openapi includes unauthorized/forbidden response schemas", () => {
  const spec = buildOpenApiDocument("https://scanrook.io");

  assert.ok(spec.components.responses.Unauthorized);
  assert.ok(spec.components.responses.ForbiddenRole);
  assert.ok(spec.components.responses.CliRateLimited);
  assert.ok(spec.components.schemas.ErrorUnauthorized);
  assert.ok(spec.components.schemas.ErrorForbiddenRole);
  assert.ok(spec.components.schemas.ErrorCliRateLimited);
});
