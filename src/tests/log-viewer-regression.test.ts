import { readFileSync } from "fs";
import { test } from "node:test";
import assert from "node:assert";

const progressGraphSrc = readFileSync(
  new URL("../components/ProgressGraph.tsx", import.meta.url),
  "utf-8"
);

test("LOGV-01: ProgressGraph contains StageAccordionSection (accordion section component)", () => {
  // After Plan 02 rework, ProgressGraph must use StageAccordionSection for stage grouping.
  // This test will FAIL until Plan 02 is complete — RED state is expected.
  assert.ok(
    progressGraphSrc.includes("StageAccordionSection"),
    "ProgressGraph must import or use StageAccordionSection (accordion-based stage grouping not yet implemented)"
  );
});

test("LOGV-02: ProgressGraph uses useVirtualizer (not MAX_EVENTS cap)", () => {
  // After Plan 02 rework, ProgressGraph must virtualize rows with useVirtualizer from @tanstack/react-virtual
  // and the MAX_EVENTS hard cap must be removed.
  // This test will FAIL until Plan 02 is complete — RED state is expected.
  assert.ok(
    !progressGraphSrc.includes("MAX_EVENTS"),
    "ProgressGraph must NOT contain MAX_EVENTS cap (replaced by virtualization)"
  );
  assert.ok(
    progressGraphSrc.includes("useVirtualizer"),
    "ProgressGraph must use useVirtualizer from @tanstack/react-virtual"
  );
});

test("LOGV-03: ProgressGraph contains runLengthEncode (RLE deduplication)", () => {
  // After Plan 02 rework, ProgressGraph must use RLE (run-length encoding) to collapse
  // repeated identical log lines before rendering.
  // This test will FAIL until Plan 02 is complete — RED state is expected.
  assert.ok(
    progressGraphSrc.includes("runLengthEncode"),
    "ProgressGraph must contain or import runLengthEncode for RLE deduplication of repeated log events"
  );
});
