import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const authApi = fs.readFileSync(new URL("../src/api/auth.js", import.meta.url), "utf8");
const directory = fs.readFileSync(new URL("../src/pages/GuildDirectory.jsx", import.meta.url), "utf8");
const recruit = fs.readFileSync(new URL("../src/components/RecruitPanel.jsx", import.meta.url), "utf8");
const hosted = fs.readFileSync(new URL("../../crystal_guild/hosted_portal.py", import.meta.url), "utf8");
const authHook = fs.readFileSync(new URL("../src/hooks/usePortalAuth.js", import.meta.url), "utf8");

test("Portal exposes a strict first-time RECRUIT action", () => {
  assert.match(authApi, /submitPortalAction\("RECRUIT", \{\}/);
  assert.match(hosted, /"RECRUIT", "PING"/);
  assert.match(hosted, /action_type not in \{"RECRUIT", "STREAMER_COMMAND"\}/);
});

test("Guild directory offers website recruitment to Twitch users without a character", () => {
  assert.match(directory, /<RecruitPanel onRecruited=\{refresh\}/);
  assert.match(recruit, /Join the Crystal Guild/);
  assert.match(recruit, /Sign in to Recruit/);
  assert.match(recruit, /Recruit Adventurer/);
  assert.match(recruit, /announced in Twitch chat/);
});

test("Recruit UI waits for action completion and refreshes the player link", () => {
  assert.match(recruit, /waitForPortalAction/);
  assert.match(recruit, /new profile will appear shortly/);
  assert.match(recruit, /refreshAuth\(\)/);
});


test("Recruit fails closed whenever Crystal Guild is offline", () => {
  assert.match(recruit, /auth\.sync_connected === true/);
  assert.match(recruit, /auth\.can_recruit === true/);
  assert.match(recruit, /Guild Offline/);
  assert.match(recruit, /Recruitment will unlock automatically when the Guild reconnects/);
  assert.match(authHook, /actions_enabled: false/);
  assert.match(authHook, /can_recruit: false/);
  assert.match(authHook, /sync_connected: false/);
});
