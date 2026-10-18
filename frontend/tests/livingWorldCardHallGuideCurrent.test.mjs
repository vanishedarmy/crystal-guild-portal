import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const guide=fs.readFileSync(path.join(root,'public/guide-body.html'),'utf8');
const whats=fs.readFileSync(path.join(root,'src/player/whatsNewData.js'),'utf8');
const triad=fs.readFileSync(path.join(root,'src/player/TripleTriadHall.jsx'),'utf8');
test('current Guide and release announcement send Triple Triad to Card Hall, not MGP',()=>{
 assert.match(guide,/<section class="section searchable" id="card-hall">/);
 assert.match(guide,/<a href="#card-hall">/);
 assert.match(guide,/Matches are free and unlimited/);
 assert.doesNotMatch(guide,/You can play up to <b>five matches per UTC day<\/b>/);
 const current=whats.split('version: "v1.9.6"')[1].split('version: "v1.9.4"')[0];
 assert.match(current,/action: \{ tab: "card_hall"/);
 assert.doesNotMatch(current,/earn a one-time MGP bonus|Wins reward MGP|tab: "gold_saucer"/);
 assert.match(triad,/Matches cost no MGP, and never award MGP/);
});
