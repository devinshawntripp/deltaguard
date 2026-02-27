import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const pagePath = path.join(
  process.cwd(),
  "src/app/(dashboard)/dashboard/settings/api-keys/page.tsx",
);

test("api keys page includes inline usage docs and copy controls", () => {
  const src = fs.readFileSync(pagePath, "utf8");

  assert.match(src, /How to use this API key/);
  assert.match(src, /\bCopy\b/);
  assert.match(src, /Authorization: Bearer/);
  assert.match(src, /x-api-key/);

  assert.match(src, /\/api\/jobs/);
  assert.match(src, /\/api\/uploads\/presign/);
  assert.match(src, /\/api\/scan\/from-s3/);
  assert.match(src, /\/api\/cli\/limits/);
  assert.match(src, /\/api\/cli\/enrich/);
  assert.match(src, /\/api\/cli\/auth\/device\/start/);
  assert.match(src, /\/api\/cli\/auth\/device\/complete/);
  assert.match(src, /events\/list\?limit=500/);
  assert.match(src, /findings\?page=1&page_size=50&tier=confirmed/);
  assert.match(src, /files\?page=1&page_size=100/);
  assert.match(src, /packages\?page=1&page_size=100/);
});
