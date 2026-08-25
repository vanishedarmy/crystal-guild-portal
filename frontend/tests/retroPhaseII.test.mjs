import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

const REGIONS = [
  "greenwind_plains", "whispering_caverns", "sable_coast", "magitek_wastes",
  "crystal_expanse", "riftlands", "interdimensional_rift", "omega_ruins",
];

test("Retro Phase II loads after the Phase 1 foundation", async () => {
  const main = await readFile(new URL("main.jsx", SRC), "utf8");
  assert.ok(main.indexOf('styles/retro.css') < main.indexOf('styles/retro-phase-ii.css'));
  const css = await readFile(new URL("styles/retro-phase-ii.css", SRC), "utf8");
  assert.match(css, /Retro Phase II/);
  assert.match(css, /adventure-region-art/);
  assert.match(css, /image-rendering: pixelated/);
});

test("all eight live regions have standalone production artwork", async () => {
  for (const id of REGIONS) {
    const url = new URL(`retro-phase-ii/regions/${id}.webp`, PUBLIC);
    await access(url);
    const data = await readFile(url);
    assert.ok(data.length > 2000, `${id} artwork is unexpectedly small`);
    assert.equal(data.subarray(0, 4).toString("ascii"), "RIFF", `${id} is not WebP`);
  }
});

test("Adventure Board and Guide use live region ids instead of concept-board slices", async () => {
  const hunts = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  const guide = await readFile(new URL("guide/guideRuntime.js", SRC), "utf8");
  assert.match(hunts, /retro-phase-ii\/regions\/\$\{region\.id\}\.webp/);
  assert.match(guide, /retro-phase-ii\/regions\/\$\{esc\(r\.id\)\}\.webp/);
  assert.doesNotMatch(hunts + guide, /Verdleaf|Stonewall Range|Sands of Kaldor|Celestial Isles/);
});

test("What's New includes the major release lineage and Retro Phase II", async () => {
  const data = await readFile(new URL("player/whatsNewData.js", SRC), "utf8");
  for (const name of ["Retro Phase II", "Arsenal II", "Arsenal", "Wayfarer", "Cloud Continuity", "Cloud Runtime", "Adventure Board", "Solo Venture", "Chocobo Companions", "Fellowship", "Ultima", "Ultima Web"]) {
    assert.match(data, new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
