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

test("Final player-facing release copy keeps the hardening summary without backend jargon", () => {
  assert.match(version, /WEB_BUILD = "Gold Saucer"/);
  assert.match(version, /1\.6\.0-gold-saucer-a5h4/);
  assert.match(news, /Guild Expansion has arrived/);
  assert.match(news, /Shared progress stays reliable/);
    assert.doesNotMatch(news.split('name: "Guild Expansion"')[1].split('\n  },')[0], /SQLite|transaction|mutex|schema|protocol|replay receipt/i);
});
