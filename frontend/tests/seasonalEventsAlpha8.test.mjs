import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here=path.dirname(fileURLToPath(import.meta.url)); const root=path.resolve(here,".."); const read=(r)=>fs.readFileSync(path.join(root,r),"utf8");
test("Alpha 8 exposes the reusable seasonal event surface and Halloween asset pack",()=>{
  const profile=read("src/pages/PlayerProfile.jsx"), page=read("src/player/SeasonalEvent.jsx"), auth=read("src/api/auth.js");
  assert.match(profile,/Seasonal Event/); assert.match(page,/Night of the Hollow Crystal/); assert.match(page,/Moonlit Emporium/); assert.match(page,/Event Objectives/); assert.match(auth,/SEASONAL_BUY/);
  for(const file of ["event-banner.webp","jack-o-bomb.webp","graveyard-coeurl.webp","lantern-tonberry.webp","wraith-ahriman.webp","hollow-warden.webp","trophy-warden-seal.webp"]) assert.ok(fs.existsSync(path.join(root,"public/seasonal/halloween-2026",file)),`missing ${file}`);
});
test("Alpha 8 seasonal UI has narrow-mobile containment",()=>{ const css=read("src/styles/portal.css"); assert.match(css,/seasonal-monster-grid/); assert.match(css,/@media\(max-width:560px\)/); });
