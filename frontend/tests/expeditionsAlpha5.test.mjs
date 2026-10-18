import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../", import.meta.url);

test("Expeditions Alpha 5 exposes Chocobo specialties, accomplishments, and completion stipends", async () => {
  const expedition = await readFile(new URL("src/player/Expeditions.jsx", ROOT), "utf8");
  const stable = await readFile(new URL("src/player/ChocoboStable.jsx", ROOT), "utf8");
  const guide = await readFile(new URL("public/guide-body.html", ROOT), "utf8");
  const news = await readFile(new URL("src/player/whatsNewData.js", ROOT), "utf8");
  assert.match(expedition, /Chocobo Expedition Specialty/);
  assert.match(expedition, /STIPEND_SEALS/);
  assert.match(expedition, /Guild stipend/);
  assert.match(stable, /Bond Specialty/);
  assert.match(stable, /chocobo-specialization-panel/);
  assert.match(stable, /chocobo-expedition-records/);
  assert.match(stable, /Legendary/);
  assert.match(guide, /Chocobo Specialization &amp; Guild Stipends/);
  assert.match(guide, /Scout <b>2 Seals<\/b>/);
  assert.match(news, /name: "Expeditions"/);
  assert.match(news, /Your Chocobo matters/);
});
