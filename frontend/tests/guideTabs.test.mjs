import test from "node:test";
import assert from "node:assert/strict";
import { completionViewForHash } from "../src/guide/guideTabUtils.js";

test("completion guide hashes select the correct tab", () => {
  assert.equal(completionViewForHash("#achievements"), "achievements");
  assert.equal(completionViewForHash("#titles"), "titles");
  assert.equal(completionViewForHash("#TITLES"), "titles");
});

test("unrelated guide hashes do not change completion tabs", () => {
  assert.equal(completionViewForHash("#jobs"), null);
  assert.equal(completionViewForHash(""), null);
});
