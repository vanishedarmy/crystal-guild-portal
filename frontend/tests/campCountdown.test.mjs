import assert from "node:assert/strict";
import test from "node:test";
import { campDeadlineMs, campRemainingSeconds } from "../src/utils/campCountdown.js";

test("camp countdown prefers the absolute camp deadline", () => {
  assert.equal(campDeadlineMs({ state: "resting", until: 2_000, remaining_seconds: 999 }, 1_000_000), 2_000_000);
});

test("legacy snapshots derive a local deadline from remaining seconds", () => {
  assert.equal(campDeadlineMs({ state: "resting", remaining_seconds: 120 }, 1_000_000), 1_120_000);
});

test("camp countdown ticks from its deadline and clamps at zero", () => {
  assert.equal(campRemainingSeconds(1_120_000, 1_001_000), 119);
  assert.equal(campRemainingSeconds(1_120_000, 1_120_001), 0);
});

test("non-resting statuses do not create countdowns", () => {
  assert.equal(campDeadlineMs({ state: "ready", remaining_seconds: 120 }, 1_000_000), 0);
});
