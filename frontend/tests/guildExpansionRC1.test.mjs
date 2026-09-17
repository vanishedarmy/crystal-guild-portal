import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const version = fs.readFileSync(new URL("../src/version.js", import.meta.url), "utf8");
const news = fs.readFileSync(new URL("../src/player/whatsNewData.js", import.meta.url), "utf8");
const guide = fs.readFileSync(new URL("../public/guide-body.html", import.meta.url), "utf8");
const guideData = JSON.parse(fs.readFileSync(new URL("../public/guide-data.json", import.meta.url), "utf8"));
const manifest = JSON.parse(fs.readFileSync(new URL("../../SCENE_BACKGROUND_MANIFEST.json", import.meta.url), "utf8"));

function fellowshipSection(html) {
  const start = html.indexOf('id="fellowship-guide"');
  const end = html.indexOf('id="stats"', start);
  assert.ok(start >= 0, "Fellowship guide section missing");
  assert.ok(end > start, "Fellowship guide section boundary missing");
  return html.slice(start, end);
}

test("current Dungeons & Delves identity is consistent while Guild Expansion remains in history", () => {
  assert.match(version, /WEB_BUILD = "Merc Service"/);
  assert.match(version, /WEB_ASSET_REVISION = "1\.8\.0-merc-rc3"/);
  assert.equal(guideData.meta.version, "v1.8.0 RC3 — Merc Service");
  assert.equal(guideData.meta.release, "1.8.0-merc-rc3");
  assert.equal(manifest.release, "v1.5.1 — Relic Arsenal Complete");
  assert.equal(manifest.frontend_asset_revision, "1.5.1-relic-arsenal-complete");
});

test("Final What's New is player-facing and feature complete", () => {
  const current = news.split('name: "Guild Expansion"')[1].split('\n  },')[0];
  assert.match(current, /full shared Guild system/i);
  assert.match(current, /Crystal Guild Airship/);
  assert.match(current, /Build a lasting Legacy/);
  assert.doesNotMatch(current, /SQLite|transaction|mutex|schema|protocol|migration|replay receipt|write lock/i);
});

test("Final Fellowship Guide uses player language and current facility terminology", () => {
  const section = fellowshipSection(guide);
  assert.doesNotMatch(section, /SQLite|transaction|mutex|schema|protocol|migration|replay receipt|feature freeze/i);
  assert.match(guide, /Fellowship LVL 6 \+ Guild Hall Lv\. 1/);
  assert.doesNotMatch(guide, /Fellowship LVL 6 \+ Guild Hall Tier 1/);
});


test("public previous-update history excludes prerelease milestones", () => {
  assert.match(news, /name: "Dungeons & Delves"/);
  const previous = news.slice(news.indexOf('name: "Asset Optimization"'));
  assert.doesNotMatch(previous, /name: "[^"]*(?:Alpha|Beta|RC\d*)[^"]*"/i);
  assert.match(previous, /name: "Guild Expansion"/);
  assert.match(previous, /name: "Expeditions"/);
});
