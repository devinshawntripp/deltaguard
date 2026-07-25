import assert from "node:assert/strict";
import test from "node:test";
import { friendlyAuthFetchError } from "@/lib/authClientErrors";

// WebKit/Safari raises TypeError "Load failed" when a fetch() is reset/times
// out at the network layer (Chrome: "Failed to fetch"). The register page must
// turn that into a clear, retryable message — never surface the raw string.
test("Safari 'Load failed' network rejection becomes a friendly retryable message", () => {
  const msg = friendlyAuthFetchError(new TypeError("Load failed"));
  assert.doesNotMatch(msg, /^Load failed$/);
  assert.match(msg, /connection|network|try again/i);
});

test("Chrome 'Failed to fetch' is treated the same way", () => {
  const msg = friendlyAuthFetchError(new TypeError("Failed to fetch"));
  assert.match(msg, /connection|network|try again/i);
});

test("an aborted (timed-out) request explains the timeout and that the account may already exist", () => {
  const err = new DOMException("The operation was aborted.", "AbortError");
  const msg = friendlyAuthFetchError(err);
  assert.match(msg, /too long|timed out|timeout/i);
  assert.match(msg, /sign in|already/i);
});

test("a real application error message is passed through unchanged", () => {
  const msg = friendlyAuthFetchError(new Error("email already registered"));
  assert.equal(msg, "email already registered");
});
