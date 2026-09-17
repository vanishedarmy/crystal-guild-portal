import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const PUBLIC = new URL("../public/", import.meta.url);
const SRC = new URL("../src/", import.meta.url);

test("Player Guide has a dedicated Fellowship section and navigation entry", async () => {
  const body = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  assert.match(body, /href="#fellowship-guide"[\s\S]*?>\s*Fellowship\s*</);
  assert.match(body, /id="fellowship-guide"/);
  assert.match(body, /Fellowship — Guild Progression &amp; Commands/);
  assert.match(body, /shared Fellowship is labeled <b>LVL 1&ndash;10<\/b>/);
  assert.match(body, /personal <b>Guild Rank<\/b>/);
});

test("Fellowship Guide documents the complete player command set", async () => {
  const body = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  for (const command of [
    "!fellowship", "!guildinfo", "!rank", "!guildrank", "!project",
    "!contribute gil &lt;amount&gt;", "!contribute &lt;amount&gt; &lt;item&gt;",
    "!orders", "!deeds", "!facilities", "!contributions", "!guildrecord",
  ]) {
    assert.ok(body.includes(command), `missing ${command}`);
  }
});

test("Fellowship Guide includes facilities, Orders, Deeds, Founding Members, and Portal discovery", async () => {
  const body = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  assert.match(body, /Guild Hall, Workshop, Chocobo Stables, Guild Archive/);
  assert.match(body, /<b>Orders<\/b>/);
  assert.match(body, /<b>Deeds<\/b>/);
  assert.match(body, /Founding Members/);
  assert.match(body, /href="\/fellowship"/);
  assert.match(body, /dedicated <b>Fellowship<\/b> tab/);
});

test("Fellowship Guide stays player-only and cache-busts the corrected Guide", async () => {
  const body = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  const version = await readFile(new URL("version.js", SRC), "utf8");
  const runtime = await readFile(new URL("guide/guideRuntime.js", SRC), "utf8");
  assert.doesNotMatch(body, /!fellowshipproject|Streamer-only:/);
  assert.match(version, /1\.8\.0-merc-a1/);
  assert.match(runtime, /'fellowship-guide':'Begin'/);
});
