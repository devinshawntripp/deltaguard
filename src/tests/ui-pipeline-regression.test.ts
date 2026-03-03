import { readFileSync } from "fs";
import { test } from "node:test";
import assert from "node:assert";

const progressGraphSrc = readFileSync(
  new URL("../components/ProgressGraph.tsx", import.meta.url),
  "utf-8"
);

test("UIBF-01: Pipeline grid uses overflow-x-auto (not overflow-hidden)", () => {
  // The pipeline container must use overflow-x-auto for horizontal scrolling
  assert.ok(
    progressGraphSrc.includes("overflow-x-auto"),
    "ProgressGraph must contain overflow-x-auto for pipeline horizontal scroll"
  );
});

test("UIBF-01: Pipeline grid has fade gradient overlays", () => {
  assert.ok(
    progressGraphSrc.includes("pointer-events-none") && progressGraphSrc.includes("linear-gradient"),
    "ProgressGraph must have pointer-events-none fade gradient overlays"
  );
});

test("UIBF-01: Pipeline grid columns have minimum width", () => {
  assert.ok(
    progressGraphSrc.includes("minmax(60px"),
    "Pipeline grid columns must use minmax(60px, ...) to prevent text collapse"
  );
});

test("UIBF-02: Badge container uses flex-wrap (not overflow-x-auto for badges)", () => {
  // The badge section should use flex-wrap, and the only overflow-x-auto should be on the pipeline
  assert.ok(
    progressGraphSrc.includes("flex-wrap"),
    "ProgressGraph must use flex-wrap for badge/tab container"
  );
});

test("UIBF-02: Badge container has collapse toggle", () => {
  assert.ok(
    progressGraphSrc.includes("more") && progressGraphSrc.includes("badgesExpanded"),
    "ProgressGraph must have a +N more / Show less collapse toggle for badges"
  );
});
