import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

async function text(rel) {
  return readFile(path.join(root, rel), "utf8");
}

test("Retro Phase II character portrait set is versioned and complete for the starter jobs", async () => {
  const files = [
    "black_mage.webp", "white_mage.webp", "red_mage.webp", "paladin.webp", "dark_knight.webp",
    "dragoon.webp", "monk.webp", "thief.webp", "ranger.webp", "summoner.webp",
  ];
  for (const file of files) {
    await access(path.join(root, "public/retro-phase-ii/job-portraits-v2", file));
  }
  const mapping = await text("src/utils/jobPortraits.js");
  assert.match(mapping, /rogue:\s*"\/retro-phase-ii\/job-portraits-v2\/thief\.webp"/);
  assert.match(mapping, /"dark knight":\s*"\/retro-phase-ii\/job-portraits-v2\/dark_knight\.webp"/);
});

test("character portraits never crop or distort artwork", async () => {
  const css = await text("src/styles/character-identity.css");
  assert.match(css, /aspect-ratio:\s*3\s*\/\s*4/);
  assert.match(css, /object-fit:\s*contain/);
  assert.doesNotMatch(css, /object-fit:\s*cover/);
  assert.match(css, /max-width:\s*360px/);
  assert.match(css, /grid-template-columns:\s*1fr/);
});

test("character identity pass is loaded last and integrated across roster profile Jobs and Solo Venture", async () => {
  const main = await text("src/main.jsx");
  const directory = await text("src/pages/GuildDirectory.jsx");
  const profile = await text("src/pages/PlayerProfile.jsx");
  const jobs = await text("src/player/Jobs.jsx");
  const hunts = await text("src/player/Hunts.jsx");

  assert.ok(main.indexOf("retro-phase-ii.css") < main.indexOf("character-identity.css"));
  assert.match(directory, /className="player-card-portrait"/);
  assert.match(profile, /className="profile-job-portrait"/);
  assert.match(jobs, /className="job-card-portrait"/);
  assert.match(hunts, /className="solo-hero-portrait"/);
});

test("unsupported Jobs retain a readable portrait fallback", async () => {
  const component = await text("src/components/JobPortrait.jsx");
  assert.match(component, /job-portrait-fallback/);
  assert.match(component, /portrait not yet illustrated/);
  assert.match(component, /loading=\{eager \? "eager" : "lazy"\}/);
});
