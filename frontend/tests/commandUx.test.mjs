import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const PUBLIC = new URL("../public/", import.meta.url);
const SRC = new URL("../src/", import.meta.url);

test("guild remains the canonical help front door while preserving aliases", async () => {
  const data = JSON.parse(await readFile(new URL("guide-data.json", PUBLIC), "utf8"));
  const guild = data.commands.find((entry) => entry.command === "!guild [topic]");
  assert.ok(guild);
  assert.match(guild.aliases, /!cghelp/);
  assert.match(guild.aliases, /!cgcommands/);
  assert.doesNotMatch(guild.aliases, /!help(?:,|$)/);
  assert.doesNotMatch(guild.aliases, /!commands(?:,|$)/);
  assert.match(guild.aliases, /!rpghelp/);
  const markup = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  assert.doesNotMatch(markup, /development build|Beta/);
  assert.match(markup, /<code>!guild<\/code>/);
});

test("Streamer and guild directory keep guild help without development-build jargon", async () => {
  const dashboard = await readFile(new URL("pages/StreamerDashboard.jsx", SRC), "utf8");
  const directory = await readFile(new URL("pages/GuildDirectory.jsx", SRC), "utf8");
  assert.match(dashboard, /!guild \[topic\]/);
  assert.match(dashboard, /Aliases: !cghelp, !cgcommands, !rpghelp/);
  assert.doesNotMatch(dashboard, /Alias: !version/);
  assert.match(directory, /<strong>!guild<\/strong>/);
  assert.match(dashboard, /streamer-ops-strip/);
  assert.match(dashboard, /streamer-workspace/);
  assert.match(dashboard, /streamer-ledger-panel/);
});
