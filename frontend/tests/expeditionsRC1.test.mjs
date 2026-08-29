import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

test("v1.2 publishes the final Expeditions identity", async () => {
  const version = await readFile(new URL("version.js", SRC), "utf8");
  const news = await readFile(new URL("player/whatsNewData.js", SRC), "utf8");
  assert.match(version, /WEB_BUILD = "Guild Expansion"/);
  assert.match(version, /1\.3\.0-guild-expansion/);
  assert.match(news, /Expeditions has arrived/);
});

test("Expeditions guide contains only play and usage guidance", async () => {
  const body = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  const start = body.indexOf('id="expeditions"');
  const end = body.indexOf('id="combat"', start);
  const section = body.slice(start, end);
  for (const required of [
    "Choose a Region", "Choose a Route", "Expedition Cache", "Chocobo Rescue",
    "Region Mastery", "Legendary Contracts", "Regional Discovery",
    "Chocobo Specialization", "Completion stipend", "Quick flow",
  ]) assert.match(section, new RegExp(required));
  assert.doesNotMatch(section, /Beta [1-4]|Alpha [2-5]|schema|protocol|SQLite|replay receipt|authoritative|simulation|feature freeze|migration|backend|frontend/i);
});
