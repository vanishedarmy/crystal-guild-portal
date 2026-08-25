import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

test("privacy policy is routed and linked from the public portal", async () => {
  const app = await readFile(new URL("App.jsx", SRC), "utf8");
  const directory = await readFile(new URL("pages/GuildDirectory.jsx", SRC), "utf8");
  const profile = await readFile(new URL("pages/PlayerProfile.jsx", SRC), "utf8");
  const streamer = await readFile(new URL("pages/StreamerDashboard.jsx", SRC), "utf8");
  const guide = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  assert.match(app, /path="\/privacy"/);
  assert.match(directory, /Privacy Policy/);
  assert.match(profile, /Privacy Policy/);
  assert.match(streamer, /Privacy Policy/);
  assert.match(guide, /Privacy Policy/);
});

test("privacy policy includes contact, rights, storage, and truthful tracking language", async () => {
  const policy = await readFile(new URL("pages/PrivacyPolicy.jsx", SRC), "utf8");
  assert.match(policy, /August 25, 2026/);
  assert.match(policy, /vanishedarmy@gmail\.com/);
  assert.match(policy, /the method below/i);
  assert.doesNotMatch(policy, /<span>Phone<\/span>/i);
  assert.doesNotMatch(policy, /href="tel:/i);
  assert.match(policy, /does not sell personal information/i);
  assert.match(policy, /United States/);
  assert.match(policy, /session storage/i);
  assert.match(policy, /Sign in with Twitch/);
  assert.match(policy, /access tokens are used only during sign-in and are not stored/i);
  assert.match(policy, /strictly necessary first-party cookies/i);
  assert.match(policy, /Pixelify Sans display typeface from Google Fonts/i);
  assert.doesNotMatch(policy, /Advertising and targeting cookies: Used to deliver advertisements/i);
});
