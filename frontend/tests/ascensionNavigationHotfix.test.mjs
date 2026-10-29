import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MAJOR_UPDATES } from "../src/player/whatsNewData.js";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

test("Ascension has its own top-level desktop and mobile profile section", () => {
 const profile = read("src/pages/PlayerProfile.jsx");
 assert.match(profile, /\["ascension", "Ascension Trials",/);
 assert.match(profile, /ascension: lazy\(\(\) => import\("\.\.\/player\/AscensionTrials\.jsx"\)\)/);
 assert.match(profile, /activeTab === "ascension" \? "hunts"/);
 const wrapper = read("src/player/AscensionTrials.jsx");
 assert.match(wrapper, /<Hunts \{\.\.\.props\} mode="ascension" \/>/);
 assert.match(profile, /<optgroup label=\{group\}/);
});

test("Dungeon Board never lists Job Trials; live combat appears only under its proper tab", () => {
 const dungeon = read("src/player/Dungeons.jsx");
 const adventure = read("src/player/Hunts.jsx");
 const trial = read("src/player/AscensionTrialBoard.jsx");
 assert.match(dungeon, /Boolean\(rawActive\.ascension_trial\) === isAscension/);
 assert.match(dungeon, /Boolean\(row\?\.summary\?\.ascension_trial\) === isAscension/);
 assert.match(dungeon, /isAscension \? <AscensionTrialBoard/);
 assert.match(dungeon, /isAscension \? "Trials of Ascension" : "Dungeon Board"/);
 assert.match(dungeon, /onNavigate\("ascension"\)/);
 assert.match(adventure, /mode="dungeons"/);
 assert.match(adventure, /mode="ascension"/);
 assert.match(trial, /blockedByDungeon/);
 assert.doesNotMatch(dungeon, /\(ascension\.trials \|\| \[\]\)\.map/);
});

test("Trial release link and Guide point to the standalone profile tab", () => {
 const trialUpdate=MAJOR_UPDATES.find(u=>u.version==="v1.9.95");
 assert.equal(trialUpdate.action.tab,"ascension");
 assert.match(JSON.stringify(trialUpdate),/dedicated Ascension Trials profile tab/);
 assert.match(read("public/guide-body.html"),/dedicated <b>Ascension Trials<\/b> profile tab/);
});
