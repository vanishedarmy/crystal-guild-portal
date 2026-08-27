import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import test from "node:test";

const ROOT = path.resolve(new URL("..", import.meta.url).pathname);
const PUBLIC = path.join(ROOT, "public");
const CSS = fs.readFileSync(path.join(ROOT, "src/styles/portal.css"), "utf8");
const scenes = {
  camp: "/retro-phase-iii/scene-backgrounds-v1/camp.png",
  blacksmith: "/retro-phase-iii/scene-backgrounds-v1/blacksmith.png",
  chocobo_stable: "/retro-phase-iii/scene-backgrounds-v1/chocobo_stable.png",
  emporium: "/retro-phase-iii/scene-backgrounds-v1/emporium.png",
};

test("RC scenic backgrounds exist and are routed by the Portal CSS", () => {
  for (const [name, url] of Object.entries(scenes)) {
    assert.match(CSS, new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${name} CSS route`);
    assert.ok(fs.existsSync(path.join(PUBLIC, url.slice(1))), `${name} asset exists`);
  }
  assert.match(CSS, /recovery-dashboard::before/);
  assert.match(CSS, /prefers-contrast:\s*more/);
  assert.match(CSS, /@media \(max-width:\s*720px\)/);
});
