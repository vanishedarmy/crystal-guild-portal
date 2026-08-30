import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");

test("Alpha 2 guide data promotes Shiva to Diamond Throne Trial", () => {
  const data = JSON.parse(read("public/guide-data.json"));
  const shiva = data.bosses.find((boss) => boss.id === "shiva");
  assert.equal(shiva.encounter_type, "Trial");
  assert.equal(shiva.encounter_name, "Diamond Throne");
  assert.equal(shiva.raid_script, "shiva_diamond_throne");
  assert.deepEqual(shiva.mechanics.map((m) => m.name), ["Frostbrand Cleave", "Icebound Mirrors", "Diamond Aegis", "Staggered", "Diamond Dust"]);
});

test("Alpha 2 Raid Board renders adds Break Stagger and role-aware contribution", () => {
  const raids = read("src/player/Raids.jsx");
  for (const term of ["Diamond Throne", "Icebound Mirrors", "break_check", "stagger", "raid-add-grid", "entry?.role"]) assert.match(raids, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(raids, /portal\/action|method:\s*["']POST/i);
});

test("Alpha 2 OBS overlay displays adds roles and new mechanic kinds", () => {
  const html = read("public/raid-overlay.html");
  const js = read("public/raid-overlay.js");
  assert.match(html, /id="adds"/);
  assert.match(html, /break_check/);
  assert.match(js, /renderAdds/);
  assert.match(js, /entry\?\.role/);
  assert.match(js, /break_check/);
  assert.match(js, /stagger/);
});

test("Alpha 3 What's New preserves the Alpha 2 Shiva Trial", () => {
  const news = read("src/player/whatsNewData.js");
  for (const term of ["v1.5.0 Alpha 3", "Shiva — Diamond Throne", "Earlier Trials remain intact"]) assert.match(news, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});
