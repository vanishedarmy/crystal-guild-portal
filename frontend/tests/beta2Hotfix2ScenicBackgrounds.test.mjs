import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const portalCss = fs.readFileSync(new URL("../src/styles/portal.css", import.meta.url), "utf8");
const envCss = fs.readFileSync(new URL("../src/styles/environment-pass.css", import.meta.url), "utf8");
const guideCss = fs.readFileSync(new URL("../public/guide.css", import.meta.url), "utf8");
const manifest = JSON.parse(fs.readFileSync(new URL("../../SCENE_BACKGROUND_MANIFEST.json", import.meta.url), "utf8"));

const portraitNames = ["solo_venture.webp", "relic_arsenal.webp", "blacksmith.webp", "chocobo_stable.webp", "emporium.webp"];

test("long-form tab backgrounds use the portrait v3 asset set", () => {
  for (const name of portraitNames) {
    assert.match(portalCss, new RegExp(`/retro-phase-iii/scene-backgrounds-v3/${name.replace(".", "\\.")}`));
    const entry = manifest.scene_backgrounds.find((item) => item.file === name);
    assert.ok(entry, `${name} should be in the scene manifest`);
    assert.equal(entry.width, 941);
    assert.equal(entry.height, 1672);
    assert.equal(entry.format, "portrait");
  }
  assert.match(portalCss, /\.blacksmith-panel::after,[\s\S]*?height: 100%;[\s\S]*?background-size: cover;/);
  assert.match(portalCss, /\.solo-venture-panel::after,[\s\S]*?height: 100%;[\s\S]*?background-size: cover;/);
});

test("Guild Heroes and Player Guide do not paint a second hero airship", () => {
  const heroIntro = envCss.match(/\.hero-intro \{[\s\S]*?\n\}/)?.[0] || "";
  const guideHero = guideCss.match(/\.hero\{[\s\S]*?\n\}/)?.[0] || "";
  assert.doesNotMatch(heroIntro, /var\(--env-airship\)/);
  assert.doesNotMatch(guideHero, /var\(--env-airship\)/);
  assert.match(envCss, /body \{[\s\S]*?var\(--env-airship\)/);
  assert.match(guideCss, /body\{[\s\S]*?var\(--env-airship\)/);
});
