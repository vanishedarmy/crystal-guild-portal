import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("Alpha 2 exposes targeted procurement and history", async () => {
  const source = await read("src/player/RetainerService.jsx");
  for (const token of ["Priority material", "General mixed haul", "focused_cost_gil", "can_dispatch_focused", "Recent Retainer Hauls", "state.history"]) assert.match(source, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
});

test("Alpha 2 sends optional priority through the Portal helper", async () => {
  const auth = await read("src/api/auth.js");
  assert.match(auth, /submitRetainerDispatch\(assignment, priority,/);
  assert.match(auth, /priority: String\(priority \|\| ""\)/);
});

test("Alpha 2 What's New reports schema 15 and protocol 31", async () => {
  const updates = await read("src/player/whatsNewData.js");
  assert.match(updates, /v1\.7\.0 Alpha 2/);
  assert.match(updates, /schema advances to 15/);
  assert.match(updates, /Portal Action protocol to 31/);
});
