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

test("Jobs cards expose Guide-style combat abilities, passive milestones, and Mastery reference", () => {
  const source = read("src/player/Jobs.jsx");
  assert.match(source, /Battle Abilities/);
  assert.match(source, /!ability &lt;name&gt; \[target\]/);
  assert.match(source, /Passive Job Milestones/);
  assert.match(source, /JLv\.50 Cross-Job Mastery/);
  assert.match(source, /ability\.cost/);
  assert.match(source, /humanizeLabel\(ability\.target\)/);
  assert.match(source, /<JobAbilityReference job=\{job\} \/>/);
});

test("Job detail dialog carries the richer Player Guide information", () => {
  const detail = read("src/components/DetailDialog.jsx");
  assert.match(detail, /Combat Identity/);
  assert.match(detail, /Stat Growth/);
  assert.match(detail, /Battle Abilities/);
  assert.match(detail, /Passive Job Milestones/);
  assert.match(detail, /JLv\.50 Cross-Job Mastery/);
});

test("Jobs ability reference remains readable across desktop and narrow layouts", () => {
  const css = read("src/styles/portal.css");
  assert.match(css, /\.job-combat-identity\s*\{/);
  assert.match(css, /\.job-active-ability-list/);
  assert.match(css, /minmax\(min\(100%, 340px\), 1fr\)/);
  assert.match(css, /@media \(max-width: 560px\)[\s\S]*\.job-combat-identity/);
});
