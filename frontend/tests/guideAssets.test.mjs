import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const PUBLIC = new URL("../public/", import.meta.url);

test("lazy guide data is valid and versioned for v1.2.0 Expeditions", async () => {
  const data = JSON.parse(await readFile(new URL("guide-data.json", PUBLIC), "utf8"));
  assert.equal(data.meta.version, "v1.7.0 — Moogle Emporium Annex Alpha 3");
  assert.equal(data.meta.encounter_rally, 60);
  assert.equal(data.meta.encounter_round, 30);
  assert.equal(data.meta.raid_rally, 90);
  assert.equal(data.meta.raid_round, 60);
  assert.equal(data.meta.release, "1.7.0-emporium-annex-a3h2");
  assert.ok(data.jobs.length > 0);
  assert.ok(data.achievements.length > 0);
  assert.equal(Object.keys(data.active_abilities).length, data.jobs.length);
  assert.ok(data.monsters.every((monster) => monster.combat_profile));
  assert.ok(data.monsters.every((monster) => monster.active_skill));
  for (const job of data.jobs) {
    assert.ok(data.active_abilities[job.id]?.length >= 3, `${job.id} missing active ability catalog`);
  }
  const commands = new Set(data.commands.map((entry) => entry.command));
  assert.ok(commands.has("!attack"));
  assert.ok(commands.has("!ability <name> [target]"));
  assert.ok(commands.has("!defend"));
  assert.ok(commands.has("!battlelog"));
});

test("lazy guide markup documents Active Battle and keeps the organized guide shell", async () => {
  const markup = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  const page = await readFile(new URL("../src/guide/GuidePage.jsx", import.meta.url), "utf8");
  assert.match(markup, /id="completion"/);
  assert.match(markup, /Trophy Hall/);
  assert.doesNotMatch(markup, /class="guide-site-header"/);
  assert.match(page, /<SiteHeader liveStatus=\{liveStatus\}/);
  assert.doesNotMatch(markup, /development build|production baseline/i);
  assert.doesNotMatch(markup, /v0\.9\.8 Beta/i);
  assert.match(markup, /id="guideNav"/);
  assert.match(markup, /!attack/);
  assert.match(markup, /!ability/);
  assert.match(markup, /!defend/);
  assert.match(markup, /!battlelog/);
  assert.match(markup, /Combat Style/i);
  assert.match(markup, /Battle Skill/i);
  assert.match(markup, /Poison/i);
  assert.match(markup, /Silence/i);
  assert.match(markup, /Blind/i);
  assert.match(markup, /never shorten the deadline/i);
  assert.match(markup, /70% ENCOUNTER/i);
  assert.match(markup, /30% TREASURE CHEST/i);
  assert.match(markup, /80% ENCOUNTER/i);
  assert.match(markup, /20% TREASURE/i);
  assert.match(markup, /three stages|3 stages/i);
  assert.match(markup, /Enemy Intent/i);
  assert.match(markup, /5 levels below through 2 levels above/i);
  assert.match(markup, /Hunts are personal timed assignments/i);
  assert.match(markup, /named C\/B\/A\/S marks/i);
  assert.match(markup, /no rally/i);
  assert.doesNotMatch(markup, /Achievements & Titles · React Edition/);
  assert.doesNotMatch(markup, /\/guide\/app\.js/);
});

test("GuidePage cache-busts lazy assets and uses the shared release label", async () => {
  const page = await readFile(new URL("../src/guide/GuidePage.jsx", import.meta.url), "utf8");
  const legacy = await readFile(new URL("../src/guide/guideRuntime.js", import.meta.url), "utf8");
  const version = await readFile(new URL("../src/version.js", import.meta.url), "utf8");
  assert.match(page, /WEB_ASSET_REVISION/);
  assert.match(page, /guide-data\.json\?v=/);
  assert.match(page, /cache: "no-cache"/);
  assert.match(page, /initGuide\(guide\.data, WEB_RELEASE\)/);
  assert.match(legacy, /releaseLabel/);
  assert.match(legacy, /activeAbilityBlock/);
  assert.match(version, /1\.7\.0/);
  assert.match(version, /Moogle Emporium Annex Alpha 3/);
});


test("Fellowship catalog close controls are CSP-safe and externally wired", async () => {
  const markup = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  const legacy = await readFile(new URL("../src/guide/guideRuntime.js", import.meta.url), "utf8");
  assert.doesNotMatch(markup, /onclick\s*=/i);
  assert.equal((markup.match(/data-catalog-close=/g) || []).length, 4);
  assert.match(legacy, /function setupCatalogCloseButtons\(\)/);
  assert.match(legacy, /button\.addEventListener\('click'/);
  assert.match(legacy, /details\.open=false/);
});
