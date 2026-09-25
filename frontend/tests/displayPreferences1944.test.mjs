import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// The preference store is deliberately pure JS: tests need neither React nor a browser.
const handlers = new Map();
const storage = new Map([["crystal-guild-display:v1", JSON.stringify({ comfortable: false, highContrast: true })]]);
globalThis.window = {
  localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  },
  addEventListener: (type, fn) => handlers.set(type, fn),
  removeEventListener: (type, fn) => { if (handlers.get(type) === fn) handlers.delete(type); },
};
const store = await import("../src/utils/displayPreferences.js");
const { DISPLAY_PREFERENCES_KEY, ACCESSIBLE_PROFILE_TABS, getDisplayPreferences, subscribeDisplayPreferences, setDisplayPreference } = store;

const src = (file) => readFile(new URL(file, import.meta.url), "utf8");

test("saved display options survive initialization and are shared", () => {
  assert.deepEqual(getDisplayPreferences(), { comfortable: false, highContrast: true });
  const seen = [];
  const off = subscribeDisplayPreferences(() => seen.push(getDisplayPreferences()));
  assert.equal(typeof handlers.get("storage"), "function");
  setDisplayPreference("comfortable", true);
  assert.deepEqual(getDisplayPreferences(), { comfortable: true, highContrast: true });
  assert.equal(JSON.parse(storage.get(DISPLAY_PREFERENCES_KEY)).comfortable, true);
  assert.equal(seen.length, 1);
  setDisplayPreference("comfortable", true);
  setDisplayPreference("nonexistent", false);
  assert.equal(seen.length, 1, "no redundant notifications for unchanged settings");
  setDisplayPreference("highContrast", false);
  assert.deepEqual(getDisplayPreferences(), { comfortable: true, highContrast: false });
  assert.equal(seen.length, 2);
  off();
  assert.equal(handlers.has("storage"), false, "clean up cross-tab listener");
});

test("changes from another browser tab are picked up", () => {
  let notified = 0;
  const off = subscribeDisplayPreferences(() => notified++);
  storage.set(DISPLAY_PREFERENCES_KEY, JSON.stringify({ comfortable: false, highContrast: true }));
  handlers.get("storage")({ key: DISPLAY_PREFERENCES_KEY });
  assert.equal(notified, 1);
  assert.deepEqual(getDisplayPreferences(), { comfortable: false, highContrast: true });
  off();
});

test("privacy-restricted localStorage cannot break preference changes", () => {
  const original = window.localStorage;
  window.localStorage = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
  assert.doesNotThrow(() => setDisplayPreference("highContrast", false));
  assert.equal(getDisplayPreferences().highContrast, false);
  window.localStorage = original;
});

test("symbols have full accessible names and all three workbenches share preferences", async () => {
  const buttons = await src("../src/components/DisplayPreferenceControls.jsx");
  assert.match(buttons, /aria-pressed=\{comfortable\}/);
  assert.match(buttons, /aria-pressed=\{highContrast\}/);
  assert.match(buttons, /aria-label=\{`Comfortable text/);
  assert.match(buttons, /aria-label=\{`High contrast/);
  assert.match(buttons, /aria-hidden="true">A/);
  assert.match(buttons, /aria-hidden="true">◐/);
  for (const name of ["CraftingWorkbench", "ForgeWorkbench", "ResynthesisWorkbench"]) {
    const source = await src(`../src/player/${name}.jsx`);
    assert.match(source, /useDisplayPreferences\(\)/, name);
    assert.match(source, /<DisplayPreferenceControls\s*\/>/, name);
    assert.doesNotMatch(source, /setComfortable\(/, name);
    assert.doesNotMatch(source, /setHighContrast\(/, name);
  }
  const css = await src("../src/styles/display-preferences.css");
  assert.match(css, /width: 44px/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
});

test("only appropriate sections gain the shared accessibility toolbar", async () => {
  assert.equal(ACCESSIBLE_PROFILE_TABS.has("inventory"), true);
  assert.equal(ACCESSIBLE_PROFILE_TABS.has("shop"), true);
  assert.equal(ACCESSIBLE_PROFILE_TABS.has("blacksmith"), true);
  assert.equal(ACCESSIBLE_PROFILE_TABS.has("bestiary"), true);
  assert.equal(ACCESSIBLE_PROFILE_TABS.has("gold_saucer"), false);
  assert.equal(ACCESSIBLE_PROFILE_TABS.has("stream"), false);
  const profile = await src("../src/pages/PlayerProfile.jsx");
  assert.match(profile, /ACCESSIBLE_PROFILE_TABS\.has\(activeTab\)/);
  assert.match(profile, /activeTab !== "blacksmith"/);
  for (const file of ["../src/pages/FellowshipPage.jsx", "../src/pages/GuildDirectory.jsx", "../src/guide/GuidePage.jsx"]) {
    const source = await src(file);
    assert.match(source, /<DisplayPreferenceControls\s*\/>/, file);
    assert.match(source, /cg-standalone-readable/, file);
  }
});
