import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const prismaPath = path.join(process.cwd(), "src/lib/prisma.ts");

test("pg_cron retention job is registered with the correct job name", () => {
  const src = fs.readFileSync(prismaPath, "utf8");
  assert.match(
    src,
    /cron\.schedule\s*\(\s*['"`]scan-events-retention['"`]/,
    "prisma.ts must call cron.schedule('scan-events-retention', ...) to register the retention job"
  );
});

test("pg_cron retention job targets the scan_events table", () => {
  const src = fs.readFileSync(prismaPath, "utf8");
  assert.match(
    src,
    /DELETE FROM scan_events/,
    "retention SQL must delete from the scan_events table"
  );
});

test("pg_cron retention job enforces a 30-day interval", () => {
  const src = fs.readFileSync(prismaPath, "utf8");
  assert.match(
    src,
    /INTERVAL\s+['"`]30 days['"`]/,
    "retention SQL must use a 30-day interval to bound scan_events growth"
  );
});

test("pg_cron retention job filters only terminal job statuses", () => {
  const src = fs.readFileSync(prismaPath, "utf8");
  assert.match(
    src,
    /status\s+IN\s*\(\s*'done'\s*,\s*'failed'\s*\)/,
    "retention SQL must filter by terminal statuses ('done', 'failed') to avoid deleting events for in-progress jobs"
  );
});

test("pg_cron retention block is wrapped in try/catch so pg_cron unavailability does not throw", () => {
  const src = fs.readFileSync(prismaPath, "utf8");
  // The pg_cron block must be inside a try/catch that catches and warns (non-throwing).
  // Verify: try block contains the cron.schedule call AND a catch block follows that warns.
  assert.match(
    src,
    /try\s*\{[^}]*cron\.schedule/s,
    "cron.schedule call must be inside a try block for idempotent non-throwing behavior"
  );
  assert.match(
    src,
    /\} catch[^}]*pg_cron not available/s,
    "catch block must warn about pg_cron unavailability without rethrowing"
  );
});
