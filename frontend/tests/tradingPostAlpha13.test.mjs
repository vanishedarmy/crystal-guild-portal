import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { recentPricePosition, marketDate } from "../src/utils/tradingPostInsights.js";
const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("recent average needs at least three actual sales", () => {
  assert.equal(recentPricePosition(50,{sale_count:2,average_price:100}),null);
  assert.equal(recentPricePosition(50,{sale_count:3,average_price:0}),null);
  assert.equal(recentPricePosition(NaN,{sale_count:3,average_price:100}),null);
});
test("indicators compare asking prices to quantity-weighted completed-sale average", () => {
  assert.deepEqual(recentPricePosition(89,{sale_count:3,average_price:100}), {tone:"below",label:"11% below recent average"});
  assert.deepEqual(recentPricePosition(111,{sale_count:3,average_price:100}), {tone:"above",label:"11% above recent average"});
  assert.deepEqual(recentPricePosition(102,{sale_count:3,average_price:100}), {tone:"near",label:"Near recent average"});
  assert.match(marketDate(1750000000),/2025/);
});
test("market has four tabs, watched quantities, recent sales and explicit relisting", () => {
  const jsx=read("../src/player/MoogleEmporium.jsx");
  const css=read("../src/styles/trading-post-insights.css");
  const api=read("../src/api/auth.js");
  assert.match(jsx,/marketView === "watchlist"/);
  assert.match(jsx,/marketView === "history"/);
  assert.match(jsx,/market\.owned_quantities/);
  assert.match(jsx,/recentPricePosition\(listing\.unit_price/);
  assert.match(jsx,/submitTradingPostWatch/);
  assert.match(jsx,/submitTradingPostHistory/);
  assert.match(jsx,/quickRelist/);
  assert.match(jsx,/submitTradingPostList\(listing\.item\.id, listing\.quantity, listing\.unit_price/);
  assert.match(css,/@media \(max-width:720px\)/);
  assert.match(api,/TRADING_POST_WATCH/);
});
