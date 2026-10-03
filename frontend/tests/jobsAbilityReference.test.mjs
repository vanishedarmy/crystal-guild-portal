import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mergeJobsWithCatalog } from "../src/utils/itemCatalog.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const frontend = path.resolve(here, "..");
const read = (rel) => fs.readFileSync(path.join(frontend, rel), "utf8");

test("Jobs tab enriches Portal Jobs from the same Guide ability catalog", () => {
  const jobs = [{ id: "warrior", name: "Warrior", owned: true, level: 15, abilities: [{ level: 5, name: "Heavy Swing" }] }];
  const guide = {
    jobs: [{
      id: "warrior",
      name: "Warrior",
      attack_name: "Ruin Blade",
      resource_mode: "ap",
      combat_type: "physical",
      abilities: [
        { level: 5, name: "Heavy Swing", description: "Physical damage +5%." },
        { level: 10, name: "Iron Will", description: "Damage taken -6%." },
      ],
      mastery: { name: "Battle Hardened", description: "Damage taken -5% on any Job." },
    }],
    active_abilities: {
      warrior: [{ id: "power_break", level: 1, name: "Power Break", cost: 4, resource: "ap", target: "enemy", description: "Heavy physical strike." }],
    },
  };

  const [job] = mergeJobsWithCatalog(jobs, guide);
  assert.equal(job.attack_name, "Ruin Blade");
  assert.equal(job.active_abilities[0].name, "Power Break");
  assert.equal(job.passive_abilities.length, 2);
  assert.equal(job.abilities.length, 1, "live learned-ability state remains authoritative");
});

test("Jobs cards stay compact while exposing an explicit details pop-out", () => {
  const source = read("src/player/Jobs.jsx");
  assert.match(source, /View \${job\.name} Details/);
  assert.match(source, /public-job-actions/);
  assert.doesNotMatch(source, /JobAbilityReference/);
  assert.doesNotMatch(source, /Battle Abilities/);
  assert.doesNotMatch(source, /Passive Job Milestones/);
  assert.doesNotMatch(source, /JLv\. 50 Cross-Job Mastery/);
});

test("Job detail dialog carries the richer Player Guide information", () => {
  const detail = read("src/components/DetailDialog.jsx");
  assert.match(detail, /Combat Identity/);
  assert.match(detail, /Stat Growth/);
  assert.match(detail, /Battle Abilities/);
  assert.match(detail, /Passive Job Milestones/);
  assert.match(detail, /JLv\. 50 Cross-Job Mastery/);
});

test("Job ability reference remains readable inside the details pop-out", () => {
  const css = read("src/styles/portal.css");
  assert.match(css, /\.job-detail-stat-grid\s*\{/);
  assert.match(css, /\.job-detail-ability-list/);
  assert.match(css, /\.public-job-actions/);
  assert.doesNotMatch(css, /\.job-reference-block/);
  assert.doesNotMatch(css, /minmax\(min\(100%, 340px\), 1fr\)/);
  assert.match(css, /@media \(max-width: 560px\)[\s\S]*\.job-detail-stat-grid/);
});

test("Arsenal Job and Guide ability cards keep traits while Solo Venture uses the compact picker", () => {
  const detail = read("src/components/DetailDialog.jsx");
  const solo = read("src/player/Hunts.jsx");
  const guide = read("src/guide/guideRuntime.js");
  assert.match(detail, /abilityTraitLabels/);
  assert.match(detail, /ability-trait-row/);
  assert.doesNotMatch(solo, /ability\.traits/);
  assert.match(solo, /solo-ability-option/);
  assert.match(guide, /activeAbilityTraits/);
});
