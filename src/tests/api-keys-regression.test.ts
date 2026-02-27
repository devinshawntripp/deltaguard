import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const pagePath = path.join(
  process.cwd(),
  "src/app/(dashboard)/dashboard/settings/api-keys/page.tsx",
);
const listCreateRoutePath = path.join(
  process.cwd(),
  "src/app/api/org/api-keys/route.ts",
);
const revokeRoutePath = path.join(
  process.cwd(),
  "src/app/api/org/api-keys/[id]/route.ts",
);

test("api keys page still calls create and revoke endpoints", () => {
  const src = fs.readFileSync(pagePath, "utf8");

  assert.match(src, /fetch\("\/api\/org\/api-keys",\s*\{ cache: "no-store" \}\)/);
  assert.match(src, /fetch\("\/api\/org\/api-keys",\s*\{[\s\S]*method: "POST"/);
  assert.match(src, /fetch\(`\/api\/org\/api-keys\/\$\{id\}`,\s*\{ method: "DELETE" \}\)/);
});

test("org api-key routes still expose GET/POST and DELETE", () => {
  const listCreate = fs.readFileSync(listCreateRoutePath, "utf8");
  const revoke = fs.readFileSync(revokeRoutePath, "utf8");

  assert.match(listCreate, /export async function GET/);
  assert.match(listCreate, /export async function POST/);
  assert.match(listCreate, /createOrgApiKey/);
  assert.match(listCreate, /listOrgApiKeys/);

  assert.match(revoke, /export async function DELETE/);
  assert.match(revoke, /revokeOrgApiKey/);
});
