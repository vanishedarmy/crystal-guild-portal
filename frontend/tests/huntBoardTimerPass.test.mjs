import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

test("Hunt Board guide documents autonomous timed Hunt behavior", () => {
  const body = read("public/guide-body.html");
  assert.match(body, /Hunts are personal timed assignments/i);
  assert.match(body, /No round commands are required/i);
  assert.match(body, /C 15m/);
  assert.match(body, /B 30m/);
  assert.match(body, /A 2h/);
  assert.match(body, /S 5h/);
  assert.doesNotMatch(body, /opens directly into Round 1/i);
});

test("Guide Hunt catalog uses the new rank timers", () => {
  const data = JSON.parse(read("public/guide-data.json"));
  const expected = { C: 900, B: 1800, A: 7200, S: 18000 };
  for (const hunt of data.hunts) assert.equal(hunt.cooldown_seconds, expected[hunt.rank], hunt.name);
  assert.match(read("src/guide/guideRuntime.js"), /Timer \${sec\(h\.cooldown_seconds\)}/);
});
