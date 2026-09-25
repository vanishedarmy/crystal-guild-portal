import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { itemArtworkPath } from "../src/utils/itemArtwork.js";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (rel) => readFileSync(resolve(root, rel), "utf8");

test("separate desktop and portrait camp assets are wired into both Camp and Recovery", () => {
  const css = read("src/styles/portal.css");
  const desktop = "/retro-phase-iii/scene-backgrounds-v4/camp-desktop-wide.webp";
  const recoveryDesktop = "/retro-phase-iii/scene-backgrounds-v4/camp-desktop.webp";
  const mobile = "/retro-phase-iii/scene-backgrounds-v4/camp-mobile.webp";
  assert.ok(existsSync(resolve(root, `public${desktop}`)));
  assert.ok(existsSync(resolve(root, `public${recoveryDesktop}`)));
  assert.ok(existsSync(resolve(root, `public${mobile}`)));
  assert.equal(css.split(`url('${desktop}')`).length - 1, 1);
  assert.equal(css.split(`url('${recoveryDesktop}')`).length - 1, 1);
  assert.match(css, /\.adventure-camp-panel::after\s*\{[\s\S]*height:\s*100%/);
  assert.equal(css.split(`url('${mobile}')`).length - 1, 2);
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*camp-mobile\.webp/);
  assert.match(css, /recovery-dashboard::before/);
});

test("Trail Rations art is discoverable in the shared item component", () => {
  assert.equal(itemArtworkPath({id:"trail_rations",type:"consumable"}), "/retro-phase-iii/item-icons-v1/trail_rations.webp");
  assert.ok(existsSync(resolve(root, "public/retro-phase-iii/item-icons-v1/trail_rations.webp")));
});

test("Moogle Emporium shows Trail Rations' Camp purpose on both buy and sell cards", () => {
  const shop=read("src/player/MoogleEmporium.jsx");
  assert.match(shop, /function shopItemPurpose\(item\)/);
  assert.match(shop, /Eat at Camp: \+10% damage/);
  assert.match(shop, /next Solo Venture if started within 45 minutes/);
  assert.equal(shop.match(/shopItemPurpose\(item\)/g)?.length, 5); // declaration + two branches each render/condition
});
