import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const api = fs.readFileSync(new URL("../src/api/auth.js", import.meta.url), "utf8");
const fellowship = fs.readFileSync(new URL("../src/player/Fellowship.jsx", import.meta.url), "utf8");
const news = fs.readFileSync(new URL("../src/player/whatsNewData.js", import.meta.url), "utf8");
const version = fs.readFileSync(new URL("../src/version.js", import.meta.url), "utf8");

// The browser sends the project it actually rendered. A stale tab therefore
// fails closed if the Guild project changes before the action reaches the Bot.
test("Beta 3 binds Fellowship contributions to the rendered project", () => {
  assert.match(api, /submitFellowshipGil\(amount, projectId/);
  assert.match(api, /project_id: projectId/);
  assert.match(api, /submitFellowshipItem\(itemId, quantity, projectId/);
  assert.match(fellowship, /submitFellowshipGil\(amount, project\.id/);
  assert.match(fellowship, /submitFellowshipItem\(req\.asset_id, amount, project\.id/);
});

test("Beta 3 player-facing release copy explains reliability without backend jargon", () => {
  assert.match(version, /WEB_BUILD = "Guild Expansion Beta 3"/);
  assert.match(version, /1\.3\.0-guild-expansion-b3/);
  assert.match(news, /Contributions stay with the intended project/);
  assert.match(news, /Double submissions pay once/);
  assert.match(news, /Airship orders stay consistent/);
  assert.doesNotMatch(news.split('name: "Guild Expansion Beta 3"')[1].split('\n  },')[0], /SQLite|transaction|mutex|schema|protocol|replay receipt/i);
});
