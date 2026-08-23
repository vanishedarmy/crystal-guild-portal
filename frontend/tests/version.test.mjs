import fs from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";
import { WEB_ASSET_REVISION, WEB_BUILD, WEB_PRODUCT, WEB_RELEASE, WEB_VERSION } from "../src/version.js";

test("Wayfarer public web identity is centralized and omits the Beta marker", () => {
  assert.equal(WEB_VERSION, "v1.1.15");
  assert.equal(WEB_BUILD, "Wayfarer");
  assert.equal(WEB_RELEASE, "v1.1.15 — Wayfarer");
  assert.equal(WEB_PRODUCT, "Crystal Guild Web v1.1.15 — Wayfarer");
  assert.equal(WEB_ASSET_REVISION, "1.1.15-wayfarer1h3");
  assert.doesNotMatch(WEB_RELEASE, /Beta/i);
});


test("Wayfarer production web build dependencies are pinned", () => {
  const packageJson = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(packageJson.dependencies.react, "19.2.8");
  assert.equal(packageJson.dependencies["react-dom"], "19.2.8");
  assert.equal(packageJson.dependencies["react-router-dom"], "7.18.2");
  assert.equal(packageJson.devDependencies["@vitejs/plugin-react"], "6.0.5");
  assert.equal(packageJson.devDependencies.vite, "8.2.0");
});
