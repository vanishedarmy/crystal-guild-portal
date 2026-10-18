import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import test from "node:test";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const PUBLIC = path.join(ROOT, "public");
const CSS = fs.readFileSync(path.join(ROOT, "src/styles/portal.css"), "utf8");
const scenes = {
  camp: "/retro-phase-iii/scene-backgrounds-v4/camp-desktop-wide.webp",
  blacksmith: "/retro-phase-iii/scene-backgrounds-v3/blacksmith.webp",
  chocobo_stable: "/retro-phase-iii/scene-backgrounds-v3/chocobo_stable.webp",
  emporium: "/retro-phase-iii/scene-backgrounds-v3/emporium.webp",
};

const components = {
  "adventure-camp-panel": "src/player/Hunts.jsx",
  "blacksmith-panel": "src/player/Blacksmith.jsx",
  "chocobo-stable-panel": "src/player/ChocoboStable.jsx",
  "moogle-panel": "src/player/MoogleEmporium.jsx",
  "recovery-dashboard": "src/player/Inventory.jsx",
};

test("current scenic backgrounds exist and are bound to live Portal components", () => {
  for (const [name, url] of Object.entries(scenes)) {
    assert.match(CSS, new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${name} CSS route`);
    assert.ok(fs.existsSync(path.join(PUBLIC, url.slice(1))), `${name} asset exists`);
  }
  for (const [className, rel] of Object.entries(components)) {
    const source = fs.readFileSync(path.join(ROOT, rel), "utf8");
    assert.match(source, new RegExp(className), `${className} is present on live component`);
  }
  assert.match(CSS, /\.adventure-camp-panel::after[\s\S]*scene-backgrounds-v4\/camp-desktop-wide\.webp/);
  assert.match(CSS, /\.blacksmith-panel::after[\s\S]*scene-backgrounds-v3\/blacksmith\.webp/);
  assert.match(CSS, /\.chocobo-stable-panel::after[\s\S]*scene-backgrounds-v3\/chocobo_stable\.webp/);
  assert.match(CSS, /\.moogle-panel::after[\s\S]*scene-backgrounds-v3\/emporium\.webp/);
  assert.match(CSS, /\.adventure-camp-panel::after[\s\S]*height:\s*100%/);
  assert.match(CSS, /\.blacksmith-panel::after,[\s\S]*height:\s*100%/);
  assert.match(CSS, /recovery-dashboard::before/);
  assert.match(CSS, /scene-backgrounds-v4\/camp-mobile\.webp/);
  assert.ok(fs.existsSync(path.join(PUBLIC, "retro-phase-iii/scene-backgrounds-v4/camp-mobile.webp")));
  assert.match(CSS, /prefers-contrast:\s*more/);
  assert.match(CSS, /@media \(max-width:\s*720px\)/);
  assert.ok(!fs.existsSync(path.join(PUBLIC, "retro-phase-iii/scene-backgrounds-v1")), "retired scene-backgrounds-v1 removed");
});
