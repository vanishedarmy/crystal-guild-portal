import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const frontend = path.resolve(here, "..");
const webRoot = path.resolve(frontend, "..");
const publicRoot = path.join(frontend, "public");

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

test("v1.3.1 ships no superseded PNG artwork", () => {
  const pngs = walk(publicRoot).filter((p) => p.toLowerCase().endsWith(".png"));
  assert.deepEqual(pngs, []);
  const webps = walk(publicRoot).filter((p) => p.toLowerCase().endsWith(".webp"));
  assert.ok(webps.length >= 572, `expected optimized WebP library, found ${webps.length}`);
});

test("active frontend/manifests do not route artwork to png", () => {
  const roots = [path.join(frontend, "src"), path.join(webRoot, "ARTWORK_ROUTING_AUDIT.json"), path.join(webRoot, "CHOCOBO_PORTRAIT_MANIFEST.json"), path.join(webRoot, "EXPEDITION_ARTWORK_MANIFEST.json"), path.join(webRoot, "GEAR_ARTWORK_MANIFEST.json"), path.join(webRoot, "ITEM_WEAPON_REFRESH_MANIFEST.json"), path.join(webRoot, "RELIC_ARTWORK_MANIFEST.json"), path.join(webRoot, "SCENE_BACKGROUND_MANIFEST.json")];
  for (const p of roots) {
    const files = fs.statSync(p).isDirectory() ? walk(p) : [p];
    for (const f of files) {
      if (!/\.(js|jsx|css|json)$/i.test(f)) continue;
      const text = fs.readFileSync(f, "utf8");
      assert.ok(!text.includes(".png"), `stale PNG route in ${path.relative(webRoot, f)}`);
    }
  }
});

test("current release identity is v1.3.1 everywhere relevant", () => {
  const version = fs.readFileSync(path.join(frontend, "src", "version.js"), "utf8");
  const py = fs.readFileSync(path.join(webRoot, "crystal_guild", "__init__.py"), "utf8");
  const overlay = fs.readFileSync(path.join(publicRoot, "raid-overlay.html"), "utf8");
  const index = fs.readFileSync(path.join(frontend, "index.html"), "utf8");
  assert.match(version, /1\.6\.0-gold-saucer-a1/);
  assert.match(py, /1\.6\.0-gold-saucer-a1/);
  assert.match(overlay, /1\.6\.0-gold-saucer-a1/);
  assert.ok(!overlay.includes("1.4.0-dungeons-delves-b2"));
  assert.match(index, /type="image\/webp" href="\/crystal-guild-portal-roundel\.webp"/);
});
