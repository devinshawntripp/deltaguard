import { readFileSync } from "fs";
import { test } from "node:test";
import assert from "node:assert";

const progressGraphSrc = readFileSync(
  new URL("../components/ProgressGraph.tsx", import.meta.url),
  "utf-8"
);

const stageAccordionSrc = readFileSync(
  new URL("../components/StageAccordionSection.tsx", import.meta.url),
  "utf-8"
);

test("LOGV-01: ProgressGraph contains StageAccordionSection (accordion section component)", () => {
  // After Plan 02 rework, ProgressGraph must use StageAccordionSection for stage grouping.
  assert.ok(
    progressGraphSrc.includes("StageAccordionSection"),
    "ProgressGraph must import or use StageAccordionSection (accordion-based stage grouping not yet implemented)"
  );
});

test("LOGV-02: StageAccordionSection uses useVirtualizer (not MAX_EVENTS cap in ProgressGraph)", () => {
  // After Plan 02 rework, ProgressGraph must not contain MAX_EVENTS hard cap.
  // useVirtualizer is used in StageAccordionSection (the component that actually renders rows).
  assert.ok(
    !progressGraphSrc.includes("MAX_EVENTS"),
    "ProgressGraph must NOT contain MAX_EVENTS cap (replaced by virtualization)"
  );
  assert.ok(
    stageAccordionSrc.includes("useVirtualizer"),
    "StageAccordionSection must use useVirtualizer from @tanstack/react-virtual"
  );
});

test("LOGV-03: ProgressGraph contains runLengthEncode (RLE deduplication)", () => {
  // After Plan 02 rework, ProgressGraph must import runLengthEncode from StageAccordionSection
  // or define it directly, to collapse repeated identical log lines before rendering.
  assert.ok(
    progressGraphSrc.includes("runLengthEncode"),
    "ProgressGraph must contain or import runLengthEncode for RLE deduplication of repeated log events"
  );
});
