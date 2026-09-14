import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { CONTEXT_HELP } from "../src/utils/contextHelp.js";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("contextual help covers the complex Portal systems without becoming universal chrome", () => {
  const required = [
    "adventure_board", "camp_recovery", "solo_venture", "rally_venture", "travel_regions", "hunts",
    "dungeons", "expeditions", "raids", "jobs", "inventory", "emporium", "blacksmith", "chocobo",
    "retainer", "gold_saucer", "fellowship", "relics",
  ];
  for (const topic of required) assert.ok(CONTEXT_HELP[topic], `missing help topic ${topic}`);
  assert.ok(Object.keys(CONTEXT_HELP).length <= 24, "quick help should remain selective rather than appearing on every card");
});

test("every quick-help topic links to a real Player Guide anchor", () => {
  const guide = read("public/guide-body.html");
  for (const [topic, help] of Object.entries(CONTEXT_HELP)) {
    assert.ok(help.summary?.length > 20, `${topic} needs a useful summary`);
    assert.ok(help.bullets?.length >= 2, `${topic} needs actionable bullets`);
    assert.ok(guide.includes(`id=\"${help.guide}\"`), `${topic} points to missing guide anchor #${help.guide}`);
  }
});

test("quick-help button is accessible, dismissible, and rendered outside clipped panels", () => {
  const source = read("src/components/ContextHelp.jsx");
  assert.match(source, /aria-label=\{`Help: \$\{help\.title\}`\}/);
  assert.match(source, /aria-expanded=\{open\}/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /createPortal\(/);
  assert.match(source, /document\.body/);
  assert.match(source, /Open full Player Guide/);
});

test("Adventure Board help is placed on the major systems players need explained", () => {
  const source = read("src/player/Hunts.jsx");
  for (const topic of ["adventure_board", "camp_recovery", "solo_venture", "rally_venture", "travel_regions", "hunts"]) {
    assert.match(source, new RegExp(`ContextHelp topic=\\"${topic}\\"`));
  }
  assert.match(read("src/player/Dungeons.jsx"), /ContextHelp topic="dungeons"/);
  assert.match(read("src/player/Expeditions.jsx"), /ContextHelp topic="expeditions"/);
  assert.match(read("src/player/Raids.jsx"), /ContextHelp topic="raids"/);
});

test("major management and service pages expose one unobtrusive quick-help entry point", () => {
  const files = {
    "src/player/Jobs.jsx": "jobs",
    "src/player/Inventory.jsx": "inventory",
    "src/player/MoogleEmporium.jsx": "emporium",
    "src/player/Blacksmith.jsx": "blacksmith",
    "src/player/ChocoboStable.jsx": "chocobo",
    "src/player/RetainerService.jsx": "retainer",
    "src/player/GoldSaucer.jsx": "gold_saucer",
    "src/player/Fellowship.jsx": "fellowship",
    "src/player/Relics.jsx": "relics",
  };
  for (const [file, topic] of Object.entries(files)) {
    assert.match(read(file), new RegExp(`ContextHelp topic=\\"${topic}\\"`), `${file} missing ${topic} help`);
  }
});

test("help control stays visually small on desktop while retaining a touch-safe mobile target", () => {
  const css = read("src/styles/button-fit.css");
  assert.match(css, /\.context-help-button\s*\{[\s\S]*?width:\s*30px;[\s\S]*?height:\s*30px;/);
  assert.match(css, /@media \(max-width:\s*760px\)[\s\S]*?\.context-help-button\s*\{[\s\S]*?width:\s*40px;[\s\S]*?height:\s*40px;/);
  assert.match(css, /\.context-help-popover\s*\{[\s\S]*?position:\s*fixed;/);
  assert.match(css, /max-height:\s*min\(64vh,\s*460px\)/);
});
