import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { MAJOR_UPDATES } from "../src/player/whatsNewData.js";
import { WEB_VERSION, WEB_ASSET_REVISION } from "../src/version.js";
const read = (rel) => readFile(new URL(rel, import.meta.url), "utf8");
test("new Guild Board is independently loaded from the player route", async () => {
  const [page, board, api] = await Promise.all([read("../src/pages/PlayerProfile.jsx"), read("../src/player/GuildBoard.jsx"), read("../src/api/players.js")]);
  assert.match(page, /guild_board: lazy\(\(\) => import\("\.\.\/player\/GuildBoard\.jsx"\)\)/);
  assert.match(page, /\["guild_board", "Guild Board"/);
  assert.match(api, /`\/api\/player\/\$\{key\}\$\{suffix\}`/);
  assert.match(board, /board\.daily\?\.objectives/);
  assert.match(board, /board\.weekly\?\.objectives/);
  assert.match(board, /sync_pending/);
});
test("shared Fellowship Contracts use the same reward and progress card component", async () => {
  const [fellowship, cards] = await Promise.all([read("../src/pages/FellowshipPage.jsx"), read("../src/components/InitiativeCards.jsx")]);
  assert.match(fellowship, /data\.contracts\?\.objectives/);
  assert.match(fellowship, /<InitiativeCards communal/);
  assert.match(cards, /ProgressBar/);
  assert.match(cards, /Reward delivered/);
  assert.match(cards, /Top contributors/);
});
test("responsive layout and release metadata are consistent", async () => {
  const [css, main, guide] = await Promise.all([read("../src/styles/guild-initiatives.css"), read("../src/main.jsx"), read("../public/guide-data.json")]);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(main, /guild-initiatives\.css/);
  assert.equal(JSON.parse(guide).meta.release, "1.9.6-triple-triad-expanded");
  assert.equal(WEB_VERSION, "v1.9.7");
  assert.equal(MAJOR_UPDATES.find((update) => update.version === "v1.9.3")?.action.tab, "guild_board");
});
