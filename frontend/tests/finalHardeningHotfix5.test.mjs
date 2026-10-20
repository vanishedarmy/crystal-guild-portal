import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

function sourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(target);
    return /\.(?:js|jsx)$/.test(entry.name) ? [target] : [];
  });
}

test("heavy optional profile modules are code-split", () => {
  const profile = read("src/pages/PlayerProfile.jsx");
  assert.doesNotMatch(profile, /import GoldSaucer from/);
  assert.doesNotMatch(profile, /import RetainerService from/);
  assert.doesNotMatch(profile, /import DetailDialog from/);
  assert.match(profile, /gold_saucer:\s*lazy\(\(\) => import\("\.\.\/player\/GoldSaucer\.jsx"\)\)/);
  assert.match(profile, /retainer:\s*lazy\(\(\) => import\("\.\.\/player\/RetainerService\.jsx"\)\)/);
  assert.match(profile, /const DetailDialog = lazy\(\(\) => import\("\.\.\/components\/DetailDialog\.jsx"\)\)/);
  assert.match(profile, /\{detail \? \([\s\S]*?<Suspense fallback=\{null\}>[\s\S]*?<DetailDialog/);
});

test("visible level labels keep a space after their abbreviation", () => {
  const files = sourceFiles(path.join(root, "src"));
  const bad = [];
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    if (/\b(?:JLv|Lv)\.(?=(?:\$\{|\{|\d))/.test(source)) bad.push(path.relative(root, file));
  }
  assert.deepEqual(bad, []);
});

test("quantity joins use readable multiplication spacing", () => {
  const crafting = read("src/player/CraftingWorkbench.jsx");
  assert.match(crafting, /Creates ×\{number\(selected\.output\?\.quantity \|\| 1\)}/);
  assert.match(crafting, /Craft \$\{selected\.output\?\.name \|\| "item"} × \$\{number\(quantity \* Number\(selected\.output\?\.quantity \|\| 1\)\)}/);

  const retainer = read("src/player/RetainerService.jsx");
  assert.doesNotMatch(retainer, /item\.name} x\$\{number\(item\.quantity\)}/);
  assert.match(retainer, /item\.name} × \$\{number\(item\.quantity\)}/);

  const guide = read("src/guide/guideRuntime.js");
  assert.match(guide, /Defeat \$\{monsterName\(r\.monster_id\)} × \$\{amount}/);
  assert.match(guide, /Own \$\{itemName\(r\.item_id\)} × \$\{amount}/);
  // Scalar multipliers remain compact mathematical notation (for example ×1.25).
  assert.match(guide, /Signature Power<\/span><b>×\$\{j\.signature_multiplier}/);
});

test("image-heavy feature views defer noncritical image decoding and loading", () => {
  for (const relative of [
    "src/player/GoldSaucer.jsx",
    "src/player/RetainerService.jsx",
    "src/player/ChocoboStable.jsx",
    "src/player/Dungeons.jsx",
  ]) {
    const source = read(relative);
    for (const match of source.matchAll(/<img\b[^>]*>/gs)) {
      assert.match(match[0], /loading=/, `${relative} image missing loading policy`);
      assert.match(match[0], /decoding="async"/, `${relative} image missing async decoding`);
    }
  }
});

test("final UI hardening keeps dynamic labels inside narrow cards", () => {
  const css = read("src/styles/portal.css");
  assert.match(css, /Final Hardening & Performance Hotfix 5/);
  assert.match(css, /\.small-badge,[\s\S]*?overflow-wrap:\s*anywhere/);
  assert.match(css, /\.content-grid > \*/);
  assert.match(css, /input,[\s\S]*?select,[\s\S]*?textarea[\s\S]*?max-width:\s*100%/);
});
