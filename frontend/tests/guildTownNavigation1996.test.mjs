import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MAJOR_UPDATES } from "../src/player/whatsNewData.js";
import { resolveProfileDestination } from "../src/utils/profileNavigation.js";
const read = (file) => readFileSync(new URL(file, import.meta.url), "utf8");
const profile = read("../src/pages/PlayerProfile.jsx");
const town = read("../src/player/GuildTown.jsx");

test("one Guild Town top-level tab replaces three service tabs in both navs", () => {
  const nav = profile.split("const TABS = [")[1].split("];", 1)[0];
  assert.match(nav, /\["town", "Guild Town", "⌂"\]/);
  for (const old of ["shop", "blacksmith", "chocobo"]) assert.doesNotMatch(nav, new RegExp(`\\["${old}"`));
  assert.match(profile, /\["Guild Services", \["town", "retainer", "mercs"\]\]/);
  assert.match(profile, /town: lazy\(\(\) => import\("\.\.\/player\/GuildTown\.jsx"\)\)/);
  assert.match(profile, /activeTab === "town" \? "inventory"/);
  assert.match(profile, /<optgroup label=\{group\}/);
});

test("all three independent collapsible sections have accessible controls", () => {
  for (const service of ["shop", "blacksmith", "chocobo"]) assert.match(town, new RegExp(`id: "${service}"`));
  assert.match(town, /aria-expanded=\{isOpen\}/);
  assert.match(town, /aria-controls=\{`guild-town-content-\$\{service\.id\}`\}/);
  assert.match(town, /aria-labelledby=\{`guild-town-label-\$\{service\.id\}`\}/);
  assert.match(town, /onToggle\?\.\(service\.id\)/);
  assert.match(town, /hidden=\{!isOpen\}/);
  assert.match(town, /<MoogleEmporium data=\{data\}/);
  assert.match(town, /<Blacksmith data=\{data\}/);
  assert.match(town, /<ChocoboStable data=\{overview\}/);
  const css=read("../src/styles/portal.css");
  assert.match(css, /\.guild-town-service-body\[hidden\] \{ display: none !important; \}/);
  assert.match(css, /@media \(max-width: 650px\)/);
});

test("What's New release actions all land on real profile destinations", () => {
  const nav = profile.split("const TABS = [")[1].split("];", 1)[0];
  const valid = new Set([...nav.matchAll(/\["([a-z_]+)", "[^"]+", "/g)].map((match) => match[1]));
  assert.ok(valid.has("town") && valid.has("ascension") && valid.has("hunts"));
  for (const update of MAJOR_UPDATES) {
    if (!update.action) continue;
    const destination = resolveProfileDestination(update.action.tab, update.action.section);
    assert.ok(valid.has(destination.tab), `${update.version} ${update.name}: ${update.action.tab} -> ${destination.tab} missing`);
    if (destination.tab === "town") assert.ok(["shop", "blacksmith", "chocobo"].includes(destination.section));
  }
  const sovereign = MAJOR_UPDATES.find((item) => item.name === "Sovereign Encounters");
  assert.equal(sovereign.action.tab, "hunts", "Sovereign Encounters must open real Dungeon Board tab");
  const trials = MAJOR_UPDATES.find((item) => item.name === "Trials of Ascension");
  assert.equal(trials.action.tab, "ascension");
  assert.equal(MAJOR_UPDATES[0].action.tab, "town");
  assert.equal(MAJOR_UPDATES[0].action.section, "shop");
  const whatsNew = read("../src/player/WhatsNew.jsx");
  assert.match(whatsNew, /onNavigate\?\.\(latest\.action\.tab, latest\.action\.section, latest\.action\.view\)/);
});

test("older direct navigation links still resolve after service consolidation", () => {
  assert.deepEqual(resolveProfileDestination("adventure"), { tab: "hunts", section: null });
  assert.deepEqual(resolveProfileDestination("saucer"), { tab: "gold_saucer", section: null });
  assert.deepEqual(resolveProfileDestination("emporium"), { tab: "town", section: "shop" });
  assert.deepEqual(resolveProfileDestination("blacksmith"), { tab: "town", section: "blacksmith" });
  assert.deepEqual(resolveProfileDestination("chocobo"), { tab: "town", section: "chocobo" });
  assert.deepEqual(resolveProfileDestination("town", "blacksmith"), { tab: "town", section: "blacksmith" });
  assert.match(read("../public/guide-body.html"), /Guild Town → Chocobo Stable/);
  assert.match(read("../src/player/MoogleEmporium.jsx"), /focus\?\.view === "market"/);
});
