import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  filterMomentEntries, formatPersonalBest, personalBestContext, personalBestEmptyMessage,
  personalRecordCategories, readableRecordDate,
} from "../src/utils/recordsMoments.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src");
const records = readFileSync(path.join(root, "player/Records.jsx"), "utf8");
const achievements = readFileSync(path.join(root, "player/Achievements.jsx"), "utf8");
const styles = readFileSync(path.join(root, "styles/portal.css"), "utf8");

const best = (value, unit = "damage") => ({ value, unit, status: "recorded" });

test("Step 4: all six server-backed categories use personal record IDs, not client-made totals", () => {
  assert.deepEqual(personalRecordCategories.map((row) => row.id),
    ["combat", "economy", "world_events", "ventures", "raids", "gold_saucer"]);
  assert.match(records, /catalog\.records/);
  assert.match(records, /record\.category === category\.id/);
  assert.match(records, /record\.status === "recorded"/);
});

test("Step 4: number formatting respects damage, HP, Gil, MGP, seconds and actual threat", () => {
  assert.equal(formatPersonalBest(best(8432)), "8,432 damage");
  assert.equal(formatPersonalBest(best(1, "hp")), "1 HP");
  assert.equal(formatPersonalBest(best(25000, "gil")), "25,000 Gil");
  assert.equal(formatPersonalBest(best(111, "mgp")), "111 MGP");
  assert.equal(formatPersonalBest(best(120, "seconds")), "2m 0s");
  assert.equal(formatPersonalBest(best("Extreme", "threat")), "Extreme");
  assert.equal(formatPersonalBest({ status: "awaiting_tracking", value: 0, unit: "hp" }), "—");
});

test("Step 4: unknown earlier battle history is never shown as an invented best", () => {
  assert.match(personalBestEmptyMessage({ status: "awaiting_tracking" }), /Older results didn't track/);
  assert.match(personalBestEmptyMessage({ status: "not_set" }), /Nothing in the ledger yet/);
});

test("Step 4: context labels never render raw snake_case gameplay IDs", () => {
  assert.equal(personalBestContext({ context: { game: "mini_cactpot" } }), "At Mini Cactpot");
  assert.equal(personalBestContext({ context: { source: "trading_post_buy" } }), "At the Trading Post");
  assert.equal(personalBestContext({ context: { monster: "abyss_behemoth" } }), "Against Abyss Behemoth");
  assert.equal(personalBestContext({ context: { events: ["hollow_warden", "rift_drake"] } }), "Hollow Warden · Rift Drake");
  assert.equal(personalBestContext({ context: { last_history_id: 55 } }), "");
});

test("Step 4: timestamps support SQLite UTC and Unix historical settlements", () => {
  assert.ok(readableRecordDate("2026-09-22 12:00:00"));
  assert.ok(readableRecordDate(1790107200));
  assert.equal(readableRecordDate("unparseable"), "");
  assert.equal(readableRecordDate(null), "");
});

test("Step 4: filter Moments using only spoiler-safe server fields", () => {
  const entries = [
    { id: "sealed_slot_01", category: "Mystery", unlocked: false },
    { id: "public_moment", category: "Combat", unlocked: false },
    { id: "owned_moment", category: "Combat", unlocked: true },
  ];
  assert.equal(filterMomentEntries(entries, "all", "All").length, 3);
  assert.deepEqual(filterMomentEntries(entries, "earned", "All").map((item) => item.id), ["owned_moment"]);
  assert.deepEqual(filterMomentEntries(entries, "undiscovered", "Mystery").map((item) => item.id), ["sealed_slot_01"]);
  assert.deepEqual(filterMomentEntries(undefined, "all", "All"), []);
});

test("Step 4: native disclosure UI reuses project finger pointers and accessible filters", () => {
  assert.match(records, /<details className="record-category"/);
  assert.match(records, /<details className=\{`panel record-section/);
  assert.match(records, /<DetailsPointer \/>/);
  assert.match(records, /aria-pressed=\{status === key\}/);
  assert.match(records, /role="group" aria-label="Moment category"/);
  assert.match(styles, /\.record-moment-grid/);
  assert.match(styles, /@media \(max-width: 560px\)/);
});

test("Step 4: secret titles cannot be reconstructed from a static client catalog", () => {
  assert.match(records, /moment\.secret && !moment\.unlocked/);
  assert.doesNotMatch(records, /moment_title_technically_alive|moment_badge_technically_alive|Too Stubborn to Die/);
  assert.doesNotMatch(records, /moments\.json|moment_titles\.json/);
  assert.match(achievements, /submitSetTitle/);
});

test("Step 4: old career, Trial, rivalries and boss cards remain in the expanded panel", () => {
  for (const name of ["Career Record", "Battle Record", "Trial Chronicle", "Rivalries & Identity", "Boss Victories"]) {
    assert.ok(records.includes(name), name);
  }
  assert.ok(records.indexOf("<PersonalBests data={data}") < records.indexOf("Career Record"));
});
