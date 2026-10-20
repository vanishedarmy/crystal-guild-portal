import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { WEB_ASSET_REVISION, WEB_BUILD, WEB_RELEASE, WEB_VERSION } from "../src/version.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read=(name)=>fs.readFileSync(path.join(ROOT,name),"utf8");

test("Batch 4 publishes the v1.8 Merc Service identity",()=>{
  assert.equal(WEB_VERSION,"v1.9.7");
  assert.equal(WEB_BUILD,"Queen's Blood");
  assert.equal(WEB_RELEASE,"v1.9.7 — Queen's Blood");
  assert.equal(WEB_ASSET_REVISION,"1.9.7-queens-blood");
  const data=JSON.parse(read("public/guide-data.json"));
  assert.equal(data.meta.version,"v1.9.6 — Triple Triad Expanded");
  assert.equal(data.meta.release,"1.9.6-triple-triad-expanded");
});

test("Player Guide documents Hunt Seals and all six Hero contracts",()=>{
  const guide=read("public/guide-body.html");
  assert.match(guide,/id="merc-service"/);
  assert.match(guide,/Merc Service uses the same Hunt Seals already earned from Hunts/);
  assert.match(guide,/Hunts already award <b>Hunt Seals<\/b>/);
  for (const hero of ["Aerith","Tifa","Zidane","Yuna","Balthier","Cloud"]) assert.match(guide,new RegExp(`>${hero}<`));
  assert.match(guide,/Lv\. 30 · 15 Hunt clears/);
  assert.match(guide,/12 Hunt Seals/);
});

test("Merc page has contextual help, on-page briefing, and mobile navigation",()=>{
  const page=read("src/player/MercService.jsx");
  const help=read("src/utils/contextHelp.js");
  const css=read("src/styles/portal.css");
  assert.match(page,/ContextHelp topic="merc_service"/);
  assert.match(page,/How Merc Contracts Work/);
  assert.match(page,/aria-label="Merc Service page sections"/);
  assert.match(help,/merc_service:\s*\{/);
  assert.match(help,/Hunt Seals are earned from Hunts/);
  assert.match(css,/\.merc-mobile-nav\{display:none\}/);
  assert.match(css,/@media\(max-width:700px\)[\s\S]*\.merc-mobile-nav\{display:grid/);
  assert.match(css,/\.merc-info-grid\{display:grid/);
});

test("Batch 4 guide and mobile foundations remain after the artwork pass",()=>{
  const page=read("src/player/MercService.jsx");
  assert.match(page,/ContextHelp topic="merc_service"/);
  assert.match(page,/aria-label="Merc Service page sections"/);
  assert.match(page,/How Merc Contracts Work/);
});
