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
