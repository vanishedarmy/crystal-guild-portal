import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const PUBLIC = new URL("../public/", import.meta.url);
const SRC = new URL("../src/", import.meta.url);

test("v1.2.0 Player Guide command catalog uses exclamation commands exclusively", async () => {
  const data = JSON.parse(await readFile(new URL("guide-data.json", PUBLIC), "utf8"));
  assert.equal(data.meta.version, "v1.5.0 — Trails & Raids Beta 2");
  assert.ok(data.commands.length > 30);
  assert.ok(data.commands.every((entry) => String(entry.command || "").startsWith("!")));
  assert.ok(data.commands.every((entry) => !String(entry.command || "").startsWith("&")));
});

test("copyable Guide commands and public command examples recognize exclamation as the Crystal Guild prefix", async () => {
  const runtime = await readFile(new URL("guide/guideRuntime.js", SRC), "utf8");
  const directory = await readFile(new URL("pages/GuildDirectory.jsx", SRC), "utf8");
  const streamer = await readFile(new URL("pages/StreamerDashboard.jsx", SRC), "utf8");
  assert.match(runtime, /text\.startsWith\('!'\)/);
  assert.doesNotMatch(runtime, /text\.startsWith\('&'\)/);
  assert.match(directory, /<strong>!guild<\/strong>/);
  assert.match(directory, /<strong>!next<\/strong>/);
  assert.match(streamer, /!readyall/);
  assert.match(streamer, /!resettimers/);
});

test("command-prefix handling does not corrupt JavaScript negation", async () => {
  const fellowship = await readFile(new URL("pages/FellowshipPage.jsx", SRC), "utf8");
  assert.match(fellowship, /if \(!project\)/);
  assert.doesNotMatch(fellowship, /if \(&project\)/);
});

test("frontend source has no abandoned ampersand-command rewrite artifacts", async () => {
  const { readdir } = await import("node:fs/promises");
  async function walk(url) {
    const entries = await readdir(url, { withFileTypes: true });
    const out = [];
    for (const entry of entries) {
      const child = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, url);
      if (entry.isDirectory()) out.push(...await walk(child));
      else if (/\.(?:js|jsx)$/.test(entry.name)) out.push(child);
    }
    return out;
  }
  for (const file of await walk(SRC)) {
    const source = await readFile(file, "utf8");
    assert.doesNotMatch(source, /\b(?:if|while)\s*\(\s*&[A-Za-z_$]/, file.pathname);
    assert.doesNotMatch(source, /\breturn\s+&[A-Za-z_$]/, file.pathname);
  }
});
