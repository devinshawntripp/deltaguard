import { readFileSync } from "fs";
import { test } from "node:test";
import assert from "node:assert";

test("SSE events route does not instantiate raw pg.Client", () => {
  const routeFile = readFileSync(
    new URL("../app/api/jobs/[id]/events/route.ts", import.meta.url),
    "utf-8"
  );
  assert.ok(
    !routeFile.includes("new pg.Client"),
    "SSE route should use jobEventsBus.subscribe() instead of raw pg.Client"
  );
});
