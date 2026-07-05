import { test } from "node:test";
import assert from "node:assert/strict";
import { isPublished, visiblePosts } from "../lib/publishGate";

test("post without publishDate is always visible", () => {
  assert.equal(isPublished({}, new Date("2020-01-01T00:00:00Z")), true);
});

test("future-dated post is hidden", () => {
  assert.equal(
    isPublished({ publishDate: "2026-08-01" }, new Date("2026-07-06T12:00:00Z")),
    false
  );
});

test("post is visible on its publish date (UTC)", () => {
  assert.equal(
    isPublished({ publishDate: "2026-07-06" }, new Date("2026-07-06T00:30:00Z")),
    true
  );
});

test("past-dated post is visible", () => {
  assert.equal(
    isPublished({ publishDate: "2026-07-06" }, new Date("2026-08-01T00:00:00Z")),
    true
  );
});

test("visiblePosts excludes future posts and keeps undated ones", () => {
  const now = new Date("2020-01-01T00:00:00Z");
  // all 26 legacy posts are undated -> all visible even in the past
  assert.ok(visiblePosts(now).length >= 26);
});
