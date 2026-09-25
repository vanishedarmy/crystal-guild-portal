import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

test("Expeditions preserves the Beta 2 UX consolidation", async () => {
  const version = await readFile(new URL("version.js", SRC), "utf8");
  const news = await readFile(new URL("player/whatsNewData.js", SRC), "utf8");
  const guide = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  assert.match(version, /WEB_BUILD = "Elite Mercs"/);
  assert.match(version, /1\.8\.2-elite-mercs/);
  assert.match(news, /name: "Expeditions"/);
  assert.match(news, /Journeys stay saved/);
  assert.doesNotMatch(guide, /Beta 2 Portal Consolidation/);
});

test("detail cards preserve the underlying viewport and restore focus without scrolling", async () => {
  const card = await readFile(new URL("components/ClickableCard.jsx", SRC), "utf8");
  const dialog = await readFile(new URL("components/DetailDialog.jsx", SRC), "utf8");
  const anchor = await readFile(new URL("utils/viewportAnchor.js", SRC), "utf8");
  assert.match(card, /aria-haspopup="dialog"/);
  assert.match(card, /focus\?\.\(\{ preventScroll: true \}\)/);
  assert.match(dialog, /captureViewport\(active\)/);
  assert.match(dialog, /restoreViewport\(snapshot, \{ focus: true \}\)/);
  assert.match(anchor, /window\.scrollTo\(\{ top: snapshot\.y, left: snapshot\.x, behavior: "auto" \}\)/);
});

test("major expandable Portal sections use anchored toggles", async () => {
  const hunts = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  const expeditions = await readFile(new URL("player/Expeditions.jsx", SRC), "utf8");
  const news = await readFile(new URL("player/WhatsNew.jsx", SRC), "utf8");
  const chocobo = await readFile(new URL("player/ChocoboStable.jsx", SRC), "utf8");
  assert.match(hunts, /toggleWithViewportAnchor\(event, setRegionsOpen\)/);
  assert.match(hunts, /toggleWithViewportAnchor\(event, setHuntBoardOpen\)/);
  assert.match(expeditions, /toggleWithViewportAnchor\(event, setBoardOpen\)/);
  assert.match(expeditions, /toggleWithViewportAnchor\(event, setAtlasOpen\)/);
  assert.match(news, /toggleWithViewportAnchor\(event, setOpen\)/);
  assert.match(chocobo, /toggleWithViewportAnchor\(event, setShowPortraitPicker\)/);
});

test("Player Guide catalogs no longer scroll themselves to the top when opened or closed", async () => {
  const runtime = await readFile(new URL("guide/guideRuntime.js", SRC), "utf8");
  const catalogBlock = runtime.slice(runtime.indexOf("Bestiary and Items & Equipment catalog launch tiles"));
  assert.match(catalogBlock, /preserveCatalogViewport/);
  assert.match(catalogBlock, /window\.scrollTo\(\{ left, top, behavior: 'auto' \}\)/);
  assert.doesNotMatch(catalogBlock, /panel\.scrollIntoView/);
  assert.doesNotMatch(catalogBlock, /section\.scrollIntoView/);
});

test("Adventure Board presents current activity first and keeps secondary Atlas details collapsible", async () => {
  const hunts = await readFile(new URL("player/Hunts.jsx", SRC), "utf8");
  const expeditions = await readFile(new URL("player/Expeditions.jsx", SRC), "utf8");
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(hunts, /adventure-priority-strip/);
  assert.match(hunts, /Current activity first/);
  assert.match(css, /Action-first reading order/);
  assert.match(css, /\.adventure-board-stack > \.adventure-pending-result-stack[\s\S]*?order: 1/);
  assert.match(expeditions, /crystal-guild:adventure:expedition-atlas/);
  assert.match(expeditions, /aria-label=\{atlasOpen \? "Collapse Expedition Atlas" : "Expand Expedition Atlas"\}/);
});
