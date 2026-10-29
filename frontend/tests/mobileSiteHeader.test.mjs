import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const SRC = new URL("../src/", import.meta.url);
const PUBLIC = new URL("../public/", import.meta.url);

test("shared mobile header is roundel plus live state plus hamburger page selection", async () => {
  const header = await readFile(new URL("components/SiteHeader.jsx", SRC), "utf8");
  const css = await readFile(new URL("styles/portal.css", SRC), "utf8");
  assert.match(header, /mobile-site-header-actions/);
  assert.match(header, /<LiveStatus status=\{liveStatus\}/);
  assert.match(header, /mobile-site-menu-toggle/);
  assert.match(header, /aria-label=\{mobileMenuOpen \? "Close page menu" : "Open page menu"\}/);
  assert.match(header, /Crystal Guild page selection/);
  assert.match(css, /Phone layout is intentionally reduced to: roundel, connection state, page menu/);
  assert.match(css, /\.site-header \.brand-copy,[\s\S]*?\.site-header > \.site-header-actions \{ display: none !important; \}/);
});

test("Guide Streamer and Privacy use the same SiteHeader component on mobile", async () => {
  const guidePage = await readFile(new URL("guide/GuidePage.jsx", SRC), "utf8");
  const streamer = await readFile(new URL("pages/StreamerDashboard.jsx", SRC), "utf8");
  const privacy = await readFile(new URL("pages/PrivacyPolicy.jsx", SRC), "utf8");
  const guideMarkup = await readFile(new URL("guide-body.html", PUBLIC), "utf8");
  assert.match(guidePage, /<SiteHeader liveStatus=\{liveStatus\}/);
  assert.match(streamer, /<SiteHeader liveStatus=\{liveStatus\}/);
  assert.match(privacy, /<SiteHeader liveStatus=\{liveStatus\}/);
  assert.doesNotMatch(streamer, /<header className="streamer-header">/);
  assert.doesNotMatch(guideMarkup, /guide-site-header/);
});
