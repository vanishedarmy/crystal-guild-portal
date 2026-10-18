import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const src=readFileSync(path.join(root,'src/player/LivingWorld.jsx'),'utf8');
const profile=readFileSync(path.join(root,'src/pages/PlayerProfile.jsx'),'utf8');
const css=readFileSync(path.join(root,'src/styles/living-world-lw1.css'),'utf8');
test('Living World is a navigable lazy-loaded profile module with its own Atlas group',()=>{
 assert.match(profile,/living_world: lazy\(\(\) => import\("\.\.\/player\/LivingWorld\.jsx"\)\)/);
 assert.match(profile,/\["living_world", "Living World"/);
 assert.match(profile,/\["Exploration", \["living_world"\]\]/);
});
test('the first region shows real discovery progression; future regions stay locked',()=>{
 assert.match(src,/regions\.filter\(\(region\) => region\?\.unlocked\)/);
 assert.match(src,/region\.discovery_count/);
 assert.match(src,/Future expansion/);
 assert.match(src,/onNavigate\("hunts"\)/);
 assert.match(src,/data\?\.sync_pending/);
});
test('art assets are present in both public and static dist paths',()=>{
 for (const filename of ['regions/verdant_wilds/banner.webp','regions/verdant_wilds/thumbnail.webp','ui/atlas-markers/discovery.png','ui/atlas-markers/locked.png']) {
  assert.ok(existsSync(path.join(root,'public/living-world',filename)),filename+' in public');
  assert.ok(existsSync(path.join(root,'dist/living-world',filename)),filename+' in dist');
 }
});
test('mobile layout, focus state and icon-only accessibility are represented',()=>{
 assert.match(css,/@media\(max-width:510px\)/);
 assert.match(css,/:focus-visible/);
 assert.match(src,/aria-label=/);
 assert.match(src,/role="progressbar"/);
});

test('Living World CSS stays scoped and retains the existing portal cascade',()=>{
 const main=readFileSync(path.join(root,'src/main.jsx'),'utf8');
 assert.match(main,/import "\.\/styles\/living-world-lw1\.css";/);
 assert.ok(main.indexOf('import "./styles/living-world-lw1.css";') < main.indexOf('import "./styles/portal-ux-1947.css";'));
 assert.ok(main.indexOf('import "./styles/portal-ux-1947.css";') < main.indexOf('import "./styles/compact-ui.css";'));
 assert.match(css,/\.lw-discovery-meta\{/);
 assert.match(src,/className="lw-discovery-meta"/);
 assert.match(css,/@media\(max-width:510px\)[^{]*\{[\s\S]*?\.lw-discovery-grid\{grid-template-columns:minmax\(0,1fr\)\}/);
 assert.doesNotMatch(css,/position:absolute;top:4px;right:5px/);
});
