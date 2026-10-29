import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("v1.9.4.7 Chocobo Stable centers the registered companion and removes duplicate readiness clutter", async () => {
  const source = await read("src/player/ChocoboStable.jsx");
  assert.match(source, /chocobo-stable-panel chocobo-stable-redesign/);
  assert.match(source, /chocobo-companion-command/);
  assert.match(source, /chocobo-quick-stats/);
  assert.match(source, /Expedition Readiness/);
  assert.match(source, /Bond Specialty/);
  assert.match(source, /Companion Management/);
  assert.doesNotMatch(source, /className="chocobo-expedition-preview"/);
  assert.doesNotMatch(source, />Stable connection ready</);
});

test("v1.9.4.7 Chocobo registration presents one current action with a four-step roadmap", async () => {
  const source = await read("src/player/ChocoboStable.jsx");
  assert.match(source, /const registrationStep =/);
  assert.match(source, /Current Step · \{registrationStep\} of 4/);
  assert.match(source, /Registration Roadmap/);
  assert.match(source, /Journey to your Companion/);
  for (const label of ["Build Stable", "Personal Quest", "Registration Writ", "Register Chocobo"]) {
    assert.match(source, new RegExp(label));
  }
});

test("v1.9.4.7 Chocobo Stable rework has desktop, tablet, and mobile hierarchy rules", async () => {
  const css = await read("src/styles/portal.css");
  assert.match(css, /v1\.9\.4\.7 — Chocobo Stable readability rework/);
  assert.match(css, /\.chocobo-companion-command\{[^}]*grid-template-columns:minmax\(0,1\.45fr\) minmax\(390px,\.95fr\)/);
  assert.match(css, /\.chocobo-stable-dashboard\{[^}]*grid-template-columns:minmax\(0,\.84fr\) minmax\(0,1\.16fr\)/);
  assert.match(css, /@media\(max-width:1040px\)/);
  assert.match(css, /@media\(max-width:760px\)/);
  assert.match(css, /@media\(max-width:520px\)/);
});
