import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const routePath = path.join(
  process.cwd(),
  "src/app/api/admin/content/route.ts",
);
const pagePath = path.join(
  process.cwd(),
  "src/app/(dashboard)/dashboard/settings/admin/page.tsx",
);
const prismaPath = path.join(
  process.cwd(),
  "src/lib/prisma.ts",
);

test("admin content route exposes GET/PUT with admin-override protections", () => {
  const src = fs.readFileSync(routePath, "utf8");

  assert.match(src, /export async function GET/);
  assert.match(src, /export async function PUT/);
  assert.match(src, /actor\.rolesMask !== ADMIN_OVERRIDE/);
  assert.match(src, /code:\s*"unauthorized"/);
  assert.match(src, /forbiddenByRole\(actor,\s*ADMIN_ONLY_ROLES,\s*"manage admin content"\)/);
});

test("admin content updates store previous versions for rollback safety", () => {
  const src = fs.readFileSync(routePath, "utf8");
  assert.match(src, /INSERT INTO admin_content_versions/);
  assert.match(src, /previous\.content_md !== contentMd/);
});

test("master admin page renders editable sales demo script and GTM cards", () => {
  const src = fs.readFileSync(pagePath, "utf8");

  assert.match(src, /Sales Demo Script/);
  assert.match(src, /Markdown Preview \(read-only\)/);
  assert.match(src, /\/api\/admin\/content\?key=/);
  assert.match(src, /\/api\/admin\/content/);
  assert.match(src, /100-account Target List Playbook/);
  assert.match(src, /Technical Posting Channels/);
  assert.match(src, /Naming Scorecard \+ SEO/);
  assert.match(src, /Rebrand Domain Shortlist/);
});

test("platform schema bootstraps admin content tables and versions index", () => {
  const src = fs.readFileSync(prismaPath, "utf8");

  assert.match(src, /CREATE TABLE IF NOT EXISTS admin_content/);
  assert.match(src, /CREATE TABLE IF NOT EXISTS admin_content_versions/);
  assert.match(src, /idx_admin_content_versions_key_created_at/);
  assert.match(src, /ensureAdminContentSeeds\(\)/);
});
