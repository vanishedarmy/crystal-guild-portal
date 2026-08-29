import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

const load = (path, root = SRC) => readFile(new URL(path, root), "utf8");

test("Expeditions preserves the mobile and accessibility pass", async () => {
  const version = await load("version.js");
  const news = await load("player/whatsNewData.js");
  const guide = await load("guide-body.html", PUBLIC);
  assert.match(version, /WEB_BUILD = "Guild Expansion Alpha 4"/);
  assert.match(version, /1\.3\.0-guild-expansion-a4/);
  assert.match(news, /Keyboard-friendly tabs/);
  assert.doesNotMatch(guide, /Beta 3 Mobile &amp; Accessibility Pass/);
});

test("Portal tablists use roving keyboard focus with Arrow Home and End keys", async () => {
  const keyboard = await load("utils/tabKeyboard.js");
  const profile = await load("pages/PlayerProfile.jsx");
  const moogle = await load("player/MoogleEmporium.jsx");
  const blacksmith = await load("player/Blacksmith.jsx");
  assert.match(keyboard, /ArrowLeft/);
  assert.match(keyboard, /ArrowRight/);
  assert.match(keyboard, /ArrowUp/);
  assert.match(keyboard, /ArrowDown/);
  assert.match(keyboard, /Home/);
  assert.match(keyboard, /End/);
  assert.match(keyboard, /focus\(\{ preventScroll: true \}\)/);
  assert.match(profile, /data-tab-value=\{id\}/);
  assert.match(profile, /tabIndex=\{activeTab === id \? 0 : -1\}/);
  assert.match(moogle, /handleTabListKeyDown\(event, setMode\)/);
  assert.match(moogle, /handleTabListKeyDown\(event, setCategory\)/);
  assert.match(blacksmith, /handleTabListKeyDown\(event, setView\)/);
});

test("mobile Portal CSS enforces touch targets safe areas readable forms and narrow layouts", async () => {
  const css = await load("styles/portal.css");
  assert.match(css, /Expeditions Beta 3 — Mobile & Accessibility Polish/);
  assert.match(css, /--beta3-touch-target:\s*44px/);
  assert.match(css, /@media \(pointer: coarse\)/);
  assert.match(css, /touch-action:\s*manipulation/);
  assert.match(css, /env\(safe-area-inset-top\)/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /input,\s*\n\s*select,\s*\n\s*textarea\s*\{\s*\n\s*font-size:\s*16px/);
  assert.match(css, /@media \(max-width: 390px\)/);
  assert.match(css, /max-height:\s*calc\(88dvh/);
});

test("detail dialogs announce their content and Escape closes back to the opener", async () => {
  const dialog = await load("components/DetailDialog.jsx");
  const header = await load("components/SiteHeader.jsx");
  assert.match(dialog, /detailDialogLabel/);
  assert.match(dialog, /aria-label=\{detailDialogLabel\(detail\)\}/);
  assert.match(dialog, /onCancel=/);
  assert.match(dialog, /restoreAndClose\(\)/);
  assert.match(header, /mobileMenuToggleRef/);
  assert.match(header, /event\.key === "Escape" && mobileMenuOpen/);
  assert.match(header, /focus\?\.\(\{ preventScroll: true \}\)/);
});

test("Portal Guide and Streamer surfaces share contrast reduced-motion and touch support", async () => {
  const portal = await load("styles/portal.css");
  const guide = await load("guide.css", PUBLIC);
  const streamer = await load("styles/streamer.css");
  for (const css of [portal, guide, streamer]) {
    assert.match(css, /prefers-contrast:\s*more/);
    assert.match(css, /forced-colors:\s*active/);
    assert.match(css, /prefers-reduced-motion:\s*reduce/);
  }
  assert.match(guide, /--guide-beta3-touch:\s*44px/);
  assert.match(guide, /safe-area-inset-left/);
  assert.match(streamer, /touch-action:\s*manipulation/);
});
