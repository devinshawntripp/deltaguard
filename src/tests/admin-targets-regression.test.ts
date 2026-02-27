import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const routePath = path.join(
  process.cwd(),
  "src/app/api/admin/targets/route.ts",
);
const pagePath = path.join(
  process.cwd(),
  "src/app/(dashboard)/dashboard/settings/admin/page.tsx",
);
const prismaPath = path.join(
  process.cwd(),
  "src/lib/prisma.ts",
);

test("admin targets route exposes GET/POST and admin override guard", () => {
  const src = fs.readFileSync(routePath, "utf8");
  assert.match(src, /export async function GET/);
  assert.match(src, /export async function POST/);
  assert.match(src, /actor\.rolesMask !== ADMIN_OVERRIDE/);
  assert.match(src, /manage target accounts/);
  assert.match(src, /format === "csv"/);
  assert.match(src, /template === "enrichment"/);
  assert.match(src, /rowsToEnrichmentTemplateCsv/);
  assert.match(src, /scanrook-target-accounts-enrichment-template\.csv/);
  assert.match(src, /text\/csv/);
});

test("admin page includes CSV import and export controls for targets", () => {
  const src = fs.readFileSync(pagePath, "utf8");
  assert.match(src, /Target Accounts \(CSV\)/);
  assert.match(src, /\/api\/admin\/targets\?format=csv/);
  assert.match(src, /\/api\/admin\/targets\?format=csv&template=enrichment/);
  assert.match(src, /Export Enrichment Template/);
  assert.match(src, /Import CSV/);
  assert.match(src, /accept=\"\.csv,text\/csv\"/);
});

test("schema includes admin target accounts table and seed hook", () => {
  const src = fs.readFileSync(prismaPath, "utf8");
  assert.match(src, /CREATE TABLE IF NOT EXISTS admin_target_accounts/);
  assert.match(src, /ensureStarterTargetAccounts\(\)/);
  assert.match(src, /idx_admin_target_accounts_fit_score/);
});
