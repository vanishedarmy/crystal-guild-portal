import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (p) => readFileSync(resolve(root,p),"utf8");
const hunts = read("src/player/Hunts.jsx");
const campCss = read("src/styles/camp-improvements.css");
const portalCss = read("src/styles/portal.css");

test("Camp background fills panel in expanded and collapsed modes", () => {
  assert.match(portalCss, /\.adventure-camp-panel::after\s*\{\s*inset:\s*0;\s*height:\s*100%/);
  assert.ok(!portalCss.includes("height: clamp(320px, 48vw, 560px)"));
  assert.match(portalCss, /url\('\/retro-phase-iii\/scene-backgrounds-v4\/camp-desktop-wide\.webp'\)/);
  assert.match(portalCss, /@media \(max-width: 720px\)[\s\S]*\.adventure-camp-panel::after\s*\{\s*height:\s*100%/);
  assert.ok(existsSync(resolve(root,"public/retro-phase-iii/scene-backgrounds-v4/camp-desktop-wide.webp")));
});

test("Before you venture subsection is collapsed by default with user preference persistence", () => {
  assert.match(hunts, /camp-choices"\) === "open"/);
  assert.match(hunts, /setItem\("crystal-guild:adventure:camp-choices", choicesOpen/);
  assert.match(hunts, /aria-expanded=\{choicesOpen\}/);
  assert.match(hunts, /aria-controls="camp-pre-venture-options"/);
  assert.match(hunts, /toggleWithViewportAnchor\(event, setChoicesOpen\)/);
  assert.match(hunts, /<CollapsePointer open=\{choicesOpen\} \/>/);
  assert.match(hunts, /id="camp-pre-venture-options" className="camp-improvements-content" hidden=\{!choicesOpen\}/);
  assert.match(campCss, /\.camp-improvements-toggle:focus-visible/);
  assert.match(campCss, /rgba\(9,23,42,\.86\)/);
});

test("Resting controls remain outside the optional improvement subsection", () => {
  const section = hunts.slice(hunts.indexOf('className={`panel adventure-camp-panel'));
  assert.ok(section.indexOf('submitStartRest(csrfToken') < section.indexOf('<CampImprovements'));
  for (const needle of ['submitCampMeal','submitCampPreparation','submitUseFieldItem','Trail Rations']) assert.ok(hunts.includes(needle));
});
