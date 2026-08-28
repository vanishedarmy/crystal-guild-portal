import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const body = fs.readFileSync(path.join(root, "public/guide-body.html"), "utf8");

test("Player Guide documents passive Long Rest and stream-start refresh", () => {
  assert.match(body, /Long Rest &mdash; 8 Hours/);
  assert.match(body, /no intentional Twitch command or Portal gameplay action for <b>8 hours<\/b>/);
  assert.match(body, /Stream Start Refresh/);
  assert.match(body, /once for that stream session/);
});
