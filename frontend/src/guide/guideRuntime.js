import { completionViewForHash } from "./guideTabUtils.js";
import {
  filterGuideAchievements,
  filterGuideTitles,
} from "./guideCompletionUtils.js";
import { humanizeLabel, metricLabel } from "../utils/displayLabels.js";

export function initGuide(GAME_DATA, releaseLabel = GAME_DATA?.meta?.version || "") {
  const D = GAME_DATA;

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byId=(arr,id)=>arr.find(x=>x.id===id);
const fallbackName=id=>humanizeLabel(id,'Unknown');
const itemName=id=>byId(D.items,id)?.name||fallbackName(id);
const monsterName=id=>byId(D.monsters,id)?.name||fallbackName(id);
const bossName=id=>byId(D.bosses,id)?.name||fallbackName(id);
const huntName=id=>byId(D.hunts,id)?.name||fallbackName(id);
const jobName=id=>byId(D.jobs,id)?.name||fallbackName(id);
const titleName=id=>byId(D.titles,id)?.name||fallbackName(id);
function fmtInt(n){return Number(n||0).toLocaleString()}
function pct(n){return `${Math.round(Number(n||0)*100)}%`}
function sec(n){n=Math.max(0,Math.floor(Number(n||0)));const u=[["w",Math.floor(n/604800)],["d",Math.floor((n%604800)/86400)],["h",Math.floor((n%86400)/3600)],["m",Math.floor((n%3600)/60)],["s",n%60]];const i=u.findIndex(([,v])=>v>0);return u.slice(i<0?u.length-1:i).map(([s,v])=>`${v}${s}`).join(" ")}
function reqText(r){
  const amount=fmtInt(r.amount??1);
  switch(r.type){
    case'character_level':return `Reach Character Lv.${amount}`;
    case'job_level':return r.job_id?`Reach ${jobName(r.job_id)} JLv.${amount}`:`Reach JLv.${amount} on any Job`;
    case'monster_kills':return `Defeat ${monsterName(r.monster_id)} ×${amount}`;
    case'monster_record_defeats':return `Defeat ${monsterName(r.monster_id)} ×${amount}`;
    case'hunt_clear':return `Clear ${huntName(r.hunt_id)}`;
    case'hunt_rank_clears':return `Clear ${amount} unique ${r.rank}-Rank Hunts`;
    case'hunt_rank_total':return `Complete ${amount} total ${r.rank}-Rank Hunts`;
    case'hunt_total':return `Complete ${amount} Hunts`;
    case'bestiary_unique':
    case'bestiary_count':return `Discover ${amount} unique Bestiary entries`;
    case'job_mastered':return `Master ${jobName(r.job_id)}`;
    case'mastery_count':return `Master ${amount} Jobs`;
    case'quest_complete':return `Complete ${byId(D.quests,r.quest_id)?.name||fallbackName(r.quest_id)}`;
    case'quest_count':return `Complete ${amount} Job unlock quests`;
    case'ventures':return `Complete ${amount} Ventures`;
    case'job_battles':return `${amount} battles on one Job`;
    case'boss_clear':return `Defeat ${bossName(r.boss_id)} ×${amount}`;
    case'boss_unique':return `Defeat ${amount} unique raid bosses`;
    case'gil':return `Hold ${amount} gil`;
    case'hunt_seals':return `Hold ${amount} Hunt Seals`;
    case'item_quantity':return `Own ${itemName(r.item_id)} ×${amount}`;
    case'item_upgrade':return `Forge ${itemName(r.item_id)} to +${amount}`;
    case'relic_complete':return `Complete ${byId(D.relics,r.relic_id)?.name||fallbackName(r.relic_id)}`;
    case'stat':return `${metricLabel(r.field)} ≥ ${amount}`;
    case'record_stat':return `${metricLabel(r.metric)} ≥ ${amount}`;
    default:return `${humanizeLabel(r.type)}${r.amount==null?'':` ≥ ${amount}`}`;
  }
}
function pctLabel(value){
  return `${Math.round(Number(value||0)*100)}%`;
}
function compactItemUse(it){
  const effects=it.use?.effects||[];
  const notes=[];
  for(const effect of effects){
    if(effect.type==='heal_hp')notes.push(effect.amount?`Restore ${fmtInt(effect.amount)} HP`:`Restore ${pctLabel(effect.fraction)} HP`);
    else if(effect.type==='restore_mp')notes.push(effect.amount?`Restore ${fmtInt(effect.amount)} MP`:`Restore ${pctLabel(effect.fraction)} MP`);
    else if(effect.type==='restore_ap')notes.push(effect.amount?`Restore ${fmtInt(effect.amount)} AP`:`Restore ${pctLabel(effect.fraction)} AP`);
    else if(effect.type==='revive')notes.push(`Revive with ${pctLabel(effect.fraction)} HP`);
    else if(effect.type==='cleanse')notes.push(effect.all_harmful?'Remove harmful statuses':`Remove ${(effect.statuses||[]).map(humanizeLabel).join('/')}`);
    else if(effect.type==='damage')notes.push(`${fmtInt(effect.amount)} ${effect.element?`${humanizeLabel(effect.element)} `:''}damage`);
    else if(effect.type==='status')notes.push(`${humanizeLabel(effect.status)} for ${effect.turns||1} turn${effect.turns===1?'':'s'}`);
  }
  return notes.join(' • ');
}
function briefDescription(text){
  const value=String(text||'').trim();
  if(!value)return'';
  const sentence=value.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim();
  return sentence||value;
}
function statNotes(it){
  let bits=[];
  const b=it.bonuses||{};
  const labels={
    attack:'ATK',str:'STR',vit:'VIT',mag:'MAG',
    magic_power:'Magic Power',spr:'SPR',dex:'DEX',
    lck:'LCK',hp:'HP'
  };
  Object.entries(labels).forEach(([key,label])=>{
    if(b[key])bits.push(`${label} +${b[key]}`);
  });
  if(it.relic_id){
    const text=it.relic_stage
      ?`Relic stage ${it.relic_stage}`
      :'Relic weapon';
    bits.push(text);
  }
  if(it.element)bits.push(`${humanizeLabel(it.element)} element`);
  if(it.on_hit_status){
    const chance=Math.round(Number(it.on_hit_status.chance||0)*100);
    bits.push(`${chance}% ${humanizeLabel(it.on_hit_status.status)} on hit`);
  }
  if(it.lifesteal)bits.push(`${pctLabel(it.lifesteal)} lifesteal`);
  if((it.status_immune||[]).length)bits.push(`Immune: ${it.status_immune.map(humanizeLabel).join(', ')}`);
  if(it.status_resist&&Object.keys(it.status_resist).length){
    const resist=Object.entries(it.status_resist).map(([status,value])=>`${humanizeLabel(status)} ${pctLabel(value)}`).join(', ');
    bits.push(`Resist: ${resist}`);
  }
  const useNote=compactItemUse(it);
  if(useNote)bits.push(useNote);
  else if(it.type==='material'){
    const note=briefDescription(it.description);
    if(note)bits.push(note);
  }
  return bits.join(' • ')||'—';
}
function costText(cost){if(!cost)return'—';let b=[];if(cost.gil)b.push(`${fmtInt(cost.gil)} gil`);if(cost.hunt_seals)b.push(`${fmtInt(cost.hunt_seals)} Seals`);for(const x of
  cost.items||[])b.push(`${itemName(x.item_id)} ×${x.quantity}`);return b.join(' • ')||'None'}

const versionSide=$('#versionSide');if(versionSide)versionSide.textContent=releaseLabel;
const versionTop=$('#versionTop');if(versionTop)versionTop.textContent=releaseLabel.split(/\s+—\s+/)[0];
$('#heroChips').innerHTML=[`${D.jobs.length} Jobs`,`${D.monsters.length} Monsters`,`${D.bosses.length} Raid Bosses`,`${D.regions.length} Regions`,`${D.hunts.length} Hunts`,`${D.relics.length} Relics`,
  `${D.items.length} Items`].map(x=>`<span class="chip">${x}</span>`).join('');

// Commands grouped by practical usage.
const COMMAND_GROUPS=[
  {id:'start',name:'Start Here & Character',description:'Create your hero, inspect your profile, claim routine rewards, and find help.',categories:['Getting Started','Character','Progress','Help']},
  {id:'adventure',name:'Adventure & Recovery',description:'Start Rally Ventures in Twitch chat, play interactive Solo Ventures on the website, travel, battle, and recover HP.',categories:['Adventure','Combat','Recovery',
    'World','Bestiary']},
  {id:'jobs',name:'Jobs & Progression',description:'Switch Jobs, inspect abilities, equip Masteries, and manage titles.',categories:['Jobs','Cosmetics']},
  {id:'gear',name:'Inventory & Economy',description:'Manage gear and inventory, buy or sell items, and check currencies.',categories:['Inventory','Economy']},
  {id:'hunts',name:'Hunts & Quests',description:'Take notorious marks and complete unlock quests.',categories:['Hunts','Quests']},
  {id:'craft',name:'Crafting & Relics',description:'Use the Blacksmith, forge upgrades, spend Hunt Seals, and awaken Relic weapons.',categories:['Crafting','Hunt Seals','Relics']},
  {id:'raids',name:'Raids & Bosses',description:'Browse bosses, join raids, queue round actions, use Limit Breaks and Summons, revive allies, and inspect contributions.',categories:['Raids']}
];
const ALL_COMMANDS=D.commands;
let activeCommandGroup='all';
function renderCommandGroupNav(){
  const counts=Object.fromEntries(COMMAND_GROUPS.map(g=>[g.id,ALL_COMMANDS.filter(c=>g.categories.includes(c.category)).length]));
  $('#commandGroupNav').innerHTML=`<button class="group-filter ${activeCommandGroup==='all'?'active':''}" data-command-group="all">All <span class="muted">${ALL_COMMANDS.length}</span></button>
    `+COMMAND_GROUPS.map(g=>`<button class="group-filter ${activeCommandGroup===g.id?'active':''}" data-command-group="${g.id}">${esc(g.name)} <span class="muted">${counts[g.id]}</span></button>
    `).join('');
}
function commandCard(x){let copyText=x.command.split(' ')[0];return `<div class="command searchable"><div><div class="command-meta"><span class="badge ${x.owner?'owner':'gold'}">${x.owner?'Owner only':esc(x.category)}</span>
  ${['!recruit','!hero','!next','!venture','!rest','!raid',
  '!records','!guild'].includes(copyText)
  ?'<span class="badge core">Common</span>':''}</div>
  <button class="command-copy-target" type="button" data-copy="${esc(copyText)}" aria-label="Copy ${esc(copyText)} to clipboard" title="Click to copy ${esc(copyText)}"><code>${esc(x.command)}</code></button><div class="desc">
  ${esc(x.description)}${x.aliases?`<br><span class="muted">Aliases: ${esc(x.aliases)}</span>`:''}</div></div></div>`}
function renderCommands(){
  const q=$('#commandSearch').value.trim().toLowerCase();
  const visibleGroups=COMMAND_GROUPS.filter(g=>activeCommandGroup==='all'||g.id===activeCommandGroup);
  let total=0;
  const html=visibleGroups.map(g=>{
    const rows=ALL_COMMANDS.filter(x=>g.categories.includes(x.category)&&(!q||JSON.stringify(x).toLowerCase().includes(q)));
    if(!rows.length)return''; total+=rows.length;
    return `<section class="command-group searchable" id="command-group-${g.id}"><div class="command-group-head"><div><h3>${esc(g.name)}</h3><p>${esc(g.description)}</p></div>
      <span class="group-count">${rows.length} command${rows.length===1?'':'s'}</span></div><div class="command-grid">${rows.map(commandCard).join('')}</div></section>`;
  }).join('');
  $('#commandGroups').innerHTML=html||'<div class="command-empty">No commands match that search in the selected usage group.</div>';
  renderCommandGroupNav();
}
$('#commandSearch').oninput=renderCommands;
$('#commandGroupNav').addEventListener('click',e=>{const b=e.target.closest('[data-command-group]');if(!b)return;activeCommandGroup=b.dataset.commandGroup;renderCommands();});
renderCommands();
function guideCommandText(code){
  return String(code?.textContent||'').replace(/\s+/g,' ').trim();
}
function decorateGuideCommandCode(root=document){
  const nodes=[];
  if(root?.nodeType===1&&root.matches?.('code'))nodes.push(root);
  root?.querySelectorAll?.('code').forEach(code=>nodes.push(code));
  nodes.forEach(code=>{
    if(code.closest('.command-copy-target')||code.classList.contains('guide-inline-command-copy'))return;
    const text=guideCommandText(code);
    if(!text.startsWith('!'))return;
    code.classList.add('guide-inline-command-copy');
    code.dataset.copy=text;
    code.setAttribute('role','button');
    code.setAttribute('tabindex','0');
    code.setAttribute('aria-label',`Copy ${text} to clipboard`);
    code.setAttribute('title',`Click to copy ${text}`);
  });
}
const guideCopyRoot=document.querySelector('.guide-react-host')||document;
decorateGuideCommandCode(guideCopyRoot);
if(typeof MutationObserver!=='undefined'&&guideCopyRoot?.nodeType===1){
  const guideCommandObserver=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{
    if(node?.nodeType===1)decorateGuideCommandCode(node);
  })));
  guideCommandObserver.observe(guideCopyRoot,{childList:true,subtree:true});
}
async function copyGuideCommand(target){
  let text=target?.dataset?.copy;if(!text)return;let copied=false;
  try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);copied=true}}catch(_err){}
  if(!copied){let area=document.createElement('textarea');area.value=text;area.setAttribute('readonly','');area.style.position='fixed';area.style.opacity='0';
    document.body.appendChild(area);area.select();try{copied=document.execCommand('copy')}catch(_err){}area.remove()}
  if(!copied)return;
  target.classList.add('is-copied');target.setAttribute('aria-label',`Copied ${text}`);
  clearTimeout(target._copyTimer);target._copyTimer=setTimeout(()=>{target.classList.remove('is-copied');target.setAttribute('aria-label',`Copy ${text} to clipboard`)},900);
}
function guideCopyTarget(node){
  return node?.closest?.('.command-copy-target')||node?.closest?.('code.guide-inline-command-copy')||null;
}
document.addEventListener('click',e=>{const target=guideCopyTarget(e.target);if(target)copyGuideCommand(target)});
document.addEventListener('keydown',e=>{
  const target=guideCopyTarget(e.target);
  if(!target||!target.classList.contains('guide-inline-command-copy')||(e.key!=='Enter'&&e.key!==' '))return;
  e.preventDefault();copyGuideCommand(target);
});

// Jobs & Masteries — independent responsive detail cards
let activeJobView='jobs';
let lastInfoFocus=null;
const effectLabels={physical_mult:'Physical damage',magic_mult:'Magic damage',damage_mult:'All damage',defense_mult:'Damage reduction',hp_mult:'Maximum HP',crit_bonus:'Critical chance',
  signature_chance:'Signature chance',signature_mult:'Signature damage',double_strike_chance:'Double-strike chance',loot_bonus:'Loot chance',gil_bonus:'Gil earned',
  healing_mult:'Healing power',heal_bonus:'Healing power',support_mult:'Support power',dodge_bonus:'Evasion',evade_chance:'Evasion',speed_mult:'Speed',
  hunt_damage_mult:'Hunt damage',weakness_bonus:'Weakness damage',mag_mult:'MAG',crit_damage:'Critical damage'};
function effectText(k,v){let label=effectLabels[k]||humanizeLabel(k);let value=(typeof v==='number'&&Math.abs(v)<=2)?`${v>=0?'+':''}${Math.round(v*100)}%`:`${v}`;return `${label} ${value}`;}
function unlockText(j){let req=j.unlock_requirements||j.requirements||[];let quest=D.quests.find(q=>q.rewards?.job===j.id);if(j.tier==='starter'&&!req.length&&!quest)return'Starter Job';let
  bits=req.map(reqText);if(quest)bits.push(`Quest: ${quest.name}`);return bits.join(' • ')||'Advanced unlock';}
function jobOverview(j){return `<button type="button" class="card job-overview searchable" data-open-job="${esc(j.id)}" aria-label="Open ${esc(j.name)} Job details"><div class="statline">
  <span class="badge ${j.tier==='starter'?'core':'gold'}">${esc(humanizeLabel(j.tier))}</span><span class="badge">${esc(humanizeLabel(j.combat_type))}</span></div><h3>${esc(j.name)}</h3><p><b>${esc(j.signature)}</b>
  signature • ${esc(j.attack_name||'Standard attack')}</p><div class="growth-mini"><span>STR<b>${j.growth.str}</b></span><span>VIT<b>${j.growth.vit}</b></span><span>MAG<b>${j.growth.mag}</b></span>
  </div><div class="card-spacer"></div><div class="card-open-hint"><span>${esc(j.mastery?.name||'No Mastery')}</span><b>Open Job →</b></div></button>`;}
function masteryOverview(j){let m=j.mastery||{};return `<button type="button" class="card mastery-overview searchable" data-open-mastery="${esc(j.id)}
  " aria-label="Open ${esc(m.name||j.name+' Mastery')} details"><div class="statline"><span class="badge gold">JLv.50 Mastery</span><span class="badge">${esc(humanizeLabel(j.combat_type))}</span></div><h3>
  ${esc(m.name||'Unnamed Mastery')}</h3><p class="mastery-source">From ${esc(j.name)}</p><p>${esc(m.description||'No description available.')}</p><div class="card-spacer"></div>
  <div class="card-open-hint"><span>Cross-Job passive</span><b>Open Mastery →</b></div></button>`;}
function renderJobs(){let q=$('#jobSearch').value.toLowerCase(),t=$('#jobTier').value;let js=D.jobs.filter(j=>(!t||j.tier===t||(t==='advanced'&&j.tier==='elite'))&&JSON.stringify(j).toLowerCase().includes(q));
  $('#jobGrid').innerHTML=js.map(jobOverview).join('')||'<div class="command-empty">No Jobs match this filter.</div>';
  $('#masteryGrid').innerHTML=js.map(masteryOverview).join('')||'<div class="command-empty">No Masteries match this filter.</div>';}
function setJobView(view){activeJobView=view;let jobs=view==='jobs';$('#jobGrid').classList.toggle('hidden',!jobs);$('#masteryGrid').classList.toggle('hidden',jobs);
  $('#jobsTab').classList.toggle('active',jobs);$('#masteriesTab').classList.toggle('active',!jobs);$('#jobsTab').setAttribute('aria-selected',String(jobs));
  $('#masteriesTab').setAttribute('aria-selected',String(!jobs));$('#jobSearch').placeholder=jobs?'Filter Jobs':'Filter Masteries or source Jobs';}
$$('[data-job-view]').forEach(b=>b.addEventListener('click',()=>setJobView(b.dataset.jobView)));
$('#jobSearch').oninput=renderJobs;$('#jobTier').onchange=renderJobs;renderJobs();setJobView('jobs');

const infoOverlay=$('#infoOverlay'),infoPanel=$('#infoPanel'),infoTitle=$('#infoTitle'),infoKicker=$('#infoKicker'),infoBadges=$('#infoBadges'),infoBody=$('#infoBody');
function growthBlock(j){return `<div class="info-growth">${Object.entries(j.growth||{}).map(([k,v])=>`<div class="info-stat"><span>${esc(k.toUpperCase())}</span><b>${v}</b></div>`).join('')}</div>`;}
function effectChips(effects){let e=Object.entries(effects||{});return e.length?`<div class="effect-chips">${e.map(([k,v])=>`<span class="effect-chip">${esc(effectText(k,v))}</span>`).join('')}</div>
  `:'';}
function activeAbilityTraits(a){let labels=[];if(a.element)labels.push(a.element);for(let e of (a.effects||[])){if(e.type==='status'&&e.status)labels.push(humanizeLabel(e.status));if(e.type==='heal')labels.push('Healing');if(e.type==='cleanse')labels.push('Cleanse');if(e.type==='drain')labels.push('HP Drain');if(e.type==='restore_mp')labels.push('MP Restore');if(e.type==='restore_ap')labels.push('AP Restore');if(e.type==='revive')labels.push('Revive');if(e.type==='damage'&&Number(e.pierce||0)>0)labels.push('Piercing');if(e.type==='damage'&&Number(e.crit_bonus||0)>0)labels.push('High Crit');}return [...new Set(labels)];}
function activeAbilityBlock(j){let list=D.active_abilities?.[j.id]||[];if(!list.length)return '<p class="muted">No Active Battle abilities are listed for this Job.</p>';return `<div class="info-ability-list">${list.map(a=>{let resource=String(a.resource||'mp').toUpperCase();let cost=Number(a.cost??a.mp??0);let traits=activeAbilityTraits(a);return `<div class="info-ability"><div class="levelpill">JLv.${a.level}</div><div><b>${esc(a.name)}</b> <span class="badge">${cost} ${esc(resource)}</span> <span class="badge">${esc(humanizeLabel(a.target))}</span>${traits.length?`<div class="effect-chips">${traits.map(x=>`<span class="effect-chip">${esc(x)}</span>`).join('')}</div>`:''}<p>${esc(a.description)}</p></div></div>`;}).join('')}</div>`;}
function openInfo(kind,id,trigger){lastInfoFocus=trigger||document.activeElement;let ok=false;if(kind==='job'||kind==='mastery'){let j=D.jobs.find(x=>x.id===id);if(j){
  kind==='job'?renderJobInfo(j):renderMasteryInfo(j);ok=true}}else if(kind==='relic'){let r=D.relics.find(x=>x.id===id);if(r){renderRelicInfo(r);ok=true}}else if(kind==='boss'){let
  b=D.bosses.find(x=>x.id===id);if(b){renderBossInfo(b);ok=true}}if(!ok)return;infoOverlay.classList.add('open');infoOverlay.setAttribute('aria-hidden','false');
  document.body.classList.add('info-open');requestAnimationFrame(()=>infoPanel.focus());}
function closeInfo(){if(!infoOverlay.classList.contains('open'))return;infoOverlay.classList.remove('open');infoOverlay.setAttribute('aria-hidden','true');document.body.classList.remove('info-open');
  lastInfoFocus?.focus?.();}
function renderJobInfo(j){let mastery=j.mastery||{};infoKicker.textContent='Job Profile';infoTitle.textContent=j.name;infoBadges.innerHTML=`<span class="badge ${j.tier==='starter'?'core':'gold'}">
  ${esc(humanizeLabel(j.tier))}</span><span class="badge">${esc(humanizeLabel(j.combat_type))}</span><span class="badge">JLv.1–50</span>`;infoBody.innerHTML=`<section class="info-section"><div class="info-section-title">
  Combat Identity</div><div class="info-hero-stat"><div class="info-stat"><span>Signature</span><b>${esc(j.signature)}</b></div><div class="info-stat"><span>Signature Chance</span><b>
  ${pct(j.signature_chance)}</b></div><div class="info-stat"><span>Signature Power</span><b>×${j.signature_multiplier}</b></div><div class="info-stat"><span>Base Damage</span><b>×${j.damage_mod}</b>
  </div></div><p class="muted" style="margin-top:10px"><b>Attack:</b> ${esc(j.attack_name||'Standard attack')} • <b>Critical bonus:</b> ${pct(j.crit_bonus||0)}</p></section>
  <section class="info-section"><div class="info-section-title">Unlock Requirement</div><div class="callout">${esc(unlockText(j))}</div></section><section class="info-section">
  <div class="info-section-title">Stat Growth</div>${growthBlock(j)}</section><section class="info-section"><div class="info-section-title">Battle Abilities</div><p class="muted">Use these with <code>!ability &lt;name&gt; [target]</code>. Magic techniques spend MP; physical techniques spend AP. Current MP/AP persist between encounters and recover through camp/items.</p>${activeAbilityBlock(j)}</section><section class="info-section"><div class="info-section-title">Passive Job Milestones</div><div class="info-ability-list">
  ${(j.abilities||[]).map(a=>`<div class="info-ability"><div class="levelpill">JLv.${a.level}</div><div><b>${esc(a.name)}</b><p>${esc(a.description)}</p>${effectChips(a.effects)}</div></div>
  `).join('')}</div></section><section class="info-section"><div class="info-section-title">JLv.50 Cross-Job Mastery</div><div class="info-mastery-feature"><span class="badge gold">MASTERED</span><h3>
  ${esc(mastery.name||'—')}</h3><p>${esc(mastery.description||'')}</p>${effectChips(mastery.effects)}<div class="info-actions">
  <button type="button" class="info-action" data-modal-mastery="${esc(j.id)}">Open Mastery Card</button></div></div></section>`;}
function renderMasteryInfo(j){let m=j.mastery||{};infoKicker.textContent='Cross-Job Mastery';infoTitle.textContent=m.name||`${j.name} Mastery`;infoBadges.innerHTML=`<span class="badge gold">
  JLv.50</span><span class="badge">Source: ${esc(j.name)}</span><span class="badge">2 equip slots</span>`;infoBody.innerHTML=`<section class="info-section"><div class="info-mastery-feature">
  <span class="badge gold">MASTERED PASSIVE</span><h3>${esc(m.name||'—')}</h3><p>${esc(m.description||'')}</p>${effectChips(m.effects)}</div></section><section class="info-section">
  <div class="info-section-title">How to Unlock</div><div class="callout"><b>Master ${esc(j.name)} to Job Level 50.</b><br>Once mastered, this passive can be equipped while playing another Job.</div>
  </section><section class="info-section"><div class="info-section-title">Equip the Mastery</div><p>Choose either of your two Mastery slots:</p><code class="info-command">!mastery ${esc(j.id)}
  1</code><code class="info-command">!mastery ${esc(j.id)} 2</code><div class="info-actions"><button type="button" class="info-action" data-modal-job="${esc(j.id)}">Open ${esc(j.name)}
  Job Card</button></div></section>`;}
document.addEventListener('click',e=>{let j=e.target.closest('[data-open-job]');if(j){openInfo('job',j.dataset.openJob,j);return}let m=e.target.closest('[data-open-mastery]');if(m){openInfo('mastery',
  m.dataset.openMastery,m);return}let r=e.target.closest('[data-open-relic]');if(r){openInfo('relic',r.dataset.openRelic,r);return}let b=e.target.closest('[data-open-boss]');if(b){openInfo('boss',
  b.dataset.openBoss,b);return}let mj=e.target.closest('[data-modal-job]');if(mj){let job=D.jobs.find(x=>x.id===mj.dataset.modalJob);if(job)renderJobInfo(job);infoPanel.scrollTop=0;return}let
  mm=e.target.closest('[data-modal-mastery]');if(mm){let job=D.jobs.find(x=>x.id===mm.dataset.modalMastery);if(job)renderMasteryInfo(job);infoPanel.scrollTop=0;return}
  if(e.target.closest('[data-info-close]')||e.target.closest('#infoClose'))closeInfo();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&infoOverlay.classList.contains('open')){e.stopPropagation();closeInfo();}});
if(window.matchMedia('(hover:hover) and (pointer:fine)').matches){infoPanel.addEventListener('pointermove',e=>{let r=infoPanel.getBoundingClientRect();infoPanel.style.setProperty('--panel-x',
  ((e.clientX-r.left)/r.width*100).toFixed(1)+'%');infoPanel.style.setProperty('--panel-y',((e.clientY-r.top)/r.height*100).toFixed(1)+'%');},{passive:true});}

// Regions and monster locations
const monsterRegions={};D.regions.forEach(r=>(r.encounters||[]).forEach(e=>(monsterRegions[e.monster_id]??=[]).push(r.name)));
$('#regionGrid').innerHTML=[...D.regions].sort((a,b)=>Number(a.min_level||0)-Number(b.min_level||0)||String(a.name||'').localeCompare(String(b.name||''))).map(r=>{let total=r.encounters.reduce((a,x)=>a+x.weight,0);let ents=[...r.encounters].sort((a,b)=>b.weight-a.weight).map(e=>`${monsterName(e.monster_id)}
  <span class="muted">(${Math.round(e.weight/total*100)}%)</span>`).join(' • ');return `<div class="card searchable"><div class="statline"><span class="badge gold">Min Lv.${r.min_level}</span>
  <span class="badge">${r.encounters.length} encounters</span></div><h3>${esc(r.name)}</h3><p>${esc(r.description)}</p><p>${ents}</p></div>`}).join('');
D.regions.forEach(r=>$('#monsterRegion').insertAdjacentHTML('beforeend',`<option>${esc(r.name)}</option>`));
function renderMonsters(){let q=$('#monsterSearch').value.toLowerCase(),r=$('#monsterRegion').value;let ms=D.monsters.filter(m=>(!r||(monsterRegions[m.id]||[]).includes(r))&&([m.name,m.weakness,
  m.special?.name,m.combat_profile,m.active_skill,...(monsterRegions[m.id]||[]),...(m.drops||[]).map(x=>itemName(x.item_id))].join(' ').toLowerCase().includes(q))).sort((a,b)=>Number(a.level||0)-Number(b.level||0)||String(a.name||'').localeCompare(String(b.name||'')));$('#monsterRows').innerHTML=ms.map(m=>`<tr class="searchable"><td>
  <span class="table-primary">${esc(m.name)}</span><span class="table-sub">${esc(m.combat_profile||'Balanced')} combat style</span></td><td><span class="table-pill gold">Lv.${m.level}</span></td><td>
  <span class="table-primary">${fmtInt(m.hp)}</span><span class="table-sub">base HP</span></td><td>${m.weakness?`<span class="table-pill crystal">${esc(m.weakness)}</span>
  `:'<span class="muted">—</span>'}</td><td><span class="table-primary">${esc(m.active_skill||'Basic attacks')}</span><span class="table-sub">${esc(m.combat_profile||'Balanced')}</span></td><td>
  <div class="table-stack">${(monsterRegions[m.id]||[]).map(x=>`<span class="table-pill">
  ${esc(x)}</span>`).join('')||'<span class="table-pill">Hunt / special</span>'}</div></td><td><div class="table-stack">${(m.drops||[]).map(d=>`<span class="table-pill">${esc(itemName(d.item_id))} <b>
  ${pct(d.chance)}</b></span>`).join('')||'<span class="muted">—</span>'}</div></td></tr>`).join('')}
$('#monsterSearch').oninput=renderMonsters;$('#monsterRegion').onchange=renderMonsters;renderMonsters();

// Hunts
let activeHunt='';$('#huntTabs').innerHTML=['All','C','B','A','S'].map((x,i)=>`<button class="tab ${i===0?'active':''}" data-rank="${x==='All'?'':x}">${x}</button>`).join('');
function renderHunts(){let hs=D.hunts.filter(h=>!activeHunt||h.rank===activeHunt).sort((a,b)=>Number(a.min_level||0)-Number(b.min_level||0)||String(a.name||'').localeCompare(String(b.name||'')));$('#huntGrid').innerHTML=hs.map(h=>`<div class="card searchable"><div class="statline"><span class="badge gold">
  ${h.rank}-Rank</span><span class="badge">Min Lv.${h.min_level}</span><span class="badge">CD ${sec(h.cooldown_seconds)}</span></div><h3>${esc(h.name)}</h3><p><b>Mark:</b>
  ${esc(monsterName(h.monster_id))}</p>${(h.requirements||[]).length?`<p><b>Requires:</b> ${(h.requirements||[]).map(reqText).map(esc).join(' • ')}</p>`:''}<p><b>Rewards:</b> ${fmtInt(h.rewards.xp)}
  XP • ${fmtInt(h.rewards.jp)} JP • ${fmtInt(h.rewards.gil)} gil • ${h.rewards.seals} Seals</p><p><b>First clear:</b> ${esc(itemName(h.first_clear_item))} • Title: <span class="gold">
  ${esc(titleName(h.first_clear_title))}</span></p></div>`).join('')}
$('#huntTabs').onclick=e=>{if(!e.target.matches('.tab'))return;$$('#huntTabs .tab').forEach(x=>x.classList.remove('active'));e.target.classList.add('active');activeHunt=e.target.dataset.rank;
  renderHunts()};renderHunts();

// Quests
$('#questGrid').innerHTML=D.quests.map(q=>`<div class="card searchable"><h3>${esc(q.name)}</h3><p>${esc(q.description)}</p><p><b>Requirements</b><br>
  ${q.requirements.map(reqText).map(esc).join('<br>')}</p><p><b>Rewards:</b>
  ${q.rewards.job?`Unlock ${esc(jobName(q.rewards.job))}`:''}${q.rewards.title?` • Title: ${esc(titleName(q.rewards.title))}
  `:''}${q.rewards.gil?` • ${fmtInt(q.rewards.gil)} gil`:''}</p></div>`).join('');

// Items
const types=[...new Set(D.items.map(x=>x.type).filter(Boolean))].sort();
const rarities=[...new Set(D.items.map(x=>x.rarity).filter(Boolean))];
const ITEM_FAMILY_LABELS={
  sword:'Sword',knuckles:'Knuckles',dagger:'Dagger',spear:'Polearm',
  katana:'Katana',instrument:'Instrument',firearm:'Firearm',axe:'Axe',
  rapier:'Rapier',wand:'Wand',staff:'Staff',heavy:'Heavy Armor',
  light:'Light Armor',robe:'Caster Robes',coat:'Field Coat',
  unrestricted:'Any Job'
};
types.forEach(x=>$('#itemType').insertAdjacentHTML('beforeend',`<option value="${esc(x)}">${esc(humanizeLabel(x))}</option>`));
rarities.forEach(x=>$('#itemRarity').insertAdjacentHTML('beforeend',`<option value="${esc(x)}">${esc(humanizeLabel(x))}</option>`));
[...D.jobs].sort((a,b)=>a.name.localeCompare(b.name)).forEach(job=>
  $('#itemJob').insertAdjacentHTML('beforeend',`<option value="${esc(job.id)}">${esc(job.name)}</option>`)
);

function itemLevelValue(i){
  const raw=i.level??i.min_level??i.shop_level;
  return raw==null?null:Number(raw);
}
function itemLevelBand(i){
  const lv=itemLevelValue(i);
  if(lv==null||Number.isNaN(lv))return'none';
  if(lv<=5)return'1-5';
  if(lv<=10)return'6-10';
  if(lv<=15)return'11-15';
  if(lv<=20)return'16-20';
  if(lv<=25)return'21-25';
  if(lv<=30)return'26-30';
  if(lv<=40)return'31-40';
  if(lv<=50)return'41-50';
  if(lv<=65)return'51-65';
  return'66+';
}
const ITEM_LEVEL_LABELS={
  '1-5':'Lv. 1–5','6-10':'Lv. 6–10','11-15':'Lv. 11–15',
  '16-20':'Lv. 16–20','21-25':'Lv. 21–25','26-30':'Lv. 26–30',
  '31-40':'Lv. 31–40','41-50':'Lv. 41–50','51-65':'Lv. 51–65',
  '66+':'Lv. 66+','none':'No level requirement'
};
function itemFamily(i){
  if(i.gear_family&&ITEM_FAMILY_LABELS[i.gear_family])return ITEM_FAMILY_LABELS[i.gear_family];
  if(i.type==='weapon')return i.relic_id?'Relic Weapon':'Weapon';
  if(i.type==='armor')return'Armor';
  if(i.type==='accessory')return'Accessory';
  return'General';
}
function itemJobs(i){
  const jobs=i.allowed_jobs||i.jobs||[];
  if(jobs.length)return jobs.map(jobName);
  if(['weapon','armor','accessory'].includes(i.type))return['Any Job'];
  return['All Classes'];
}
function itemRow(i){
  const lv=itemLevelValue(i);
  const lvText=lv!=null&&!Number.isNaN(lv)
    ?`<span class="table-pill gold">Lv.${lv}</span>`
    :'<span class="muted">—</span>';
  const price=i.price!=null
    ?`<span class="table-primary">${fmtInt(i.price)}</span>`
      +'<span class="table-sub">gil</span>'
    :'<span class="muted">—</span>';
  const jobs=itemJobs(i);
  return `<tr class="searchable">`
    +`<td data-label="Item"><span class="table-primary">${esc(i.name)}</span></td>`
    +`<td data-label="Type"><span class="table-pill">${esc(humanizeLabel(i.type))}</span></td>`
    +`<td data-label="Class / Jobs">`
    +`<span class="table-primary">${esc(itemFamily(i))}</span>`
    +`<span class="table-sub">${esc(jobs.join(' • '))}</span></td>`
    +`<td data-label="Rarity"><span class="table-pill rarity-${esc(i.rarity||'')}">${esc(humanizeLabel(i.rarity))}</span></td>`
    +`<td data-label="Lv">${lvText}</td>`
    +`<td data-label="Price">${price}</td>`
    +`<td data-label="Stats / Notes"><span class="table-note">${esc(statNotes(i))}</span></td>`
    +`</tr>`;
}
function itemSortKey(i){
  const lv=itemLevelValue(i);
  const typeOrder={weapon:0,armor:1,accessory:2,consumable:3,material:4};
  return[
    lv==null?9999:lv,
    typeOrder[i.type]??9,
    itemFamily(i).toLowerCase(),
    i.name.toLowerCase()
  ];
}
function compareItemKeys(a,b){
  const ak=itemSortKey(a),bk=itemSortKey(b);
  for(let n=0;n<ak.length;n++){
    if(ak[n]===bk[n])continue;
    if(typeof ak[n]==='number')return ak[n]-bk[n];
    return String(ak[n]).localeCompare(String(bk[n]));
  }
  return 0;
}
function renderItems(){
  try{
    const q=$('#itemSearch').value.trim().toLowerCase();
    const t=$('#itemType').value;
    const r=$('#itemRarity').value;
    const levelBand=$('#itemLevel').value;
    const job=$('#itemJob').value;
    const its=D.items.filter(i=>{
      const allowed=i.allowed_jobs||i.jobs||[];
      const jobMatch=!job||allowed.includes(job)||(i.type==='accessory'&&!allowed.length);
      return(!t||i.type===t)
        &&(!r||i.rarity===r)
        &&(!levelBand||itemLevelBand(i)===levelBand)
        &&jobMatch
        &&JSON.stringify(i).toLowerCase().includes(q);
    }).sort(compareItemKeys);

    if(!its.length){
      $('#itemRows').innerHTML=
        '<tr><td colspan="7"><span class="muted">'
        +'No items match the current filters.</span></td></tr>';
      return;
    }

    const counts={};
    its.forEach(i=>{const band=itemLevelBand(i);counts[band]=(counts[band]||0)+1;});
    let currentBand=null;
    let rows='';
    its.forEach(i=>{
      const band=itemLevelBand(i);
      if(band!==currentBand){
        currentBand=band;
        rows+=`<tr class="table-group-row"><td colspan="7">`
          +`<span class="table-group-title">${esc(ITEM_LEVEL_LABELS[band]||band)}</span>`
          +`<span class="table-group-count">${counts[band]} ${counts[band]===1?'entry':'entries'}</span>`
          +`</td></tr>`;
      }
      rows+=itemRow(i);
    });
    $('#itemRows').innerHTML=rows;
  }catch(err){
    console.error(
      'Crystal Guild item catalog render failed:',
      err
    );
  }
}
$('#itemSearch').oninput=renderItems;
$('#itemType').onchange=renderItems;
$('#itemLevel').onchange=renderItems;
$('#itemJob').onchange=renderItems;
$('#itemRarity').onchange=renderItems;
renderItems();

// Recipes
$('#recipeGrid').innerHTML=D.recipes.map(r=>`<div class="card searchable"><div class="statline"><span class="badge gold">Lv.${r.min_level}</span><span class="badge">
  ${r.known_by_default?'Guild Recipe':'Discoverable'}</span></div><h3>${esc(r.name)}</h3><p><b>Cost:</b> ${fmtInt(r.gil||0)} gil${r.hunt_seals?` • ${r.hunt_seals} Seals`:''}</p><p><b>Materials:</b>
  ${(r.materials||[]).map(x=>`${esc(itemName(x.item_id))} ×${x.quantity}`).join(' • ')||'None'}</p>
  <p><b>Creates:</b> ${esc(itemName(r.output.item_id))} ×${r.output.quantity}</p>${r.discovery?`<p><b>
  Discovery:</b> ${esc(JSON.stringify(r.discovery))}</p>`:''}</div>`).join('');

// Forge
let cumulative=0;$('#forgeRows').innerHTML=D.forge.map(f=>{cumulative=f.level*f.bonus_per_level;return `<tr><td><span class="table-primary">Forge +${f.level}</span><span class="table-sub">
  upgrade tier</span></td><td><span class="table-primary">${fmtInt(f.gil)}</span><span class="table-sub">gil</span></td><td><div class="table-stack">${f.materials.map(x=>`<span class="table-pill">
  ${esc(itemName(x.item_id))} ×${x.quantity}</span>`).join('')}</div></td><td><span class="table-pill green">+${Math.round(cumulative*100)}% total</span></td></tr>`}).join('');

// Seal shop
$('#sealRows').innerHTML=D.seal_shop.map(s=>`<tr><td><span class="table-primary">${esc(s.name)}</span><span class="table-sub">Quartermaster offer</span></td><td><span class="table-pill">
  ${esc(itemName(s.item_id))} ×${s.quantity}</span></td><td><span class="table-pill gold">${s.cost} Seals</span></td><td><span class="table-pill">Lv.${s.min_level}</span></td></tr>`).join('');

// Relics — independent responsive dossiers
const relicJobs=[...new Set(D.relics.map(r=>r.job_id))].sort((a,b)=>jobName(a).localeCompare(jobName(b)));
relicJobs.forEach(id=>$('#relicJob').insertAdjacentHTML('beforeend',`<option value="${esc(id)}">${esc(jobName(id))}</option>`));
function relicOverview(r){let final=r.stages[r.stages.length-1];return `<button type="button" class="card relic-overview searchable" data-open-relic="${esc(r.id)}" aria-label="Open ${esc(r.name)}
  Relic weapon details"><div class="statline"><span class="badge gold">${esc(jobName(r.job_id))}</span><span class="badge">3-stage Relic</span></div><h3>${esc(r.name)}</h3><p>${esc(r.description)}</p>
  <div class="relic-path"><span>Dormant</span><i>→</i><span>Awakened</span><i>→</i><span>Zenith</span></div><p><b>Final form:</b> <span class="gold">${esc(itemName(final.reward_item))}</span></p>
  <div class="card-spacer"></div><div class="card-open-hint"><span>${r.stages.length} progression stages</span><b>Open Relic →</b></div></button>`;}
function renderRelics(){let q=$('#relicSearch').value.toLowerCase(),j=$('#relicJob').value;let rs=D.relics.filter(r=>(!j||r.job_id===j)&&([r.name,r.description,jobName(r.job_id),
  ...(r.stages||[]).flatMap(st=>[st.name,itemName(st.reward_item),...(st.requirements||[]).map(reqText),costText(st.cost)])].join(' ').toLowerCase().includes(q)));
  $('#relicGrid').innerHTML=rs.map(relicOverview).join('')||'<div class="command-empty">No Relic weapons match this filter.</div>';}
function renderRelicInfo(r){let job=jobName(r.job_id),final=r.stages[r.stages.length-1];infoKicker.textContent='Relic Weapon';infoTitle.textContent=r.name;
  infoBadges.innerHTML=`<span class="badge gold">${esc(job)}</span><span class="badge">3 stages</span><span class="badge">Zenith: ${esc(itemName(final.reward_item))}</span>`;
  infoBody.innerHTML=`<section class="info-section"><div class="info-section-title">Relic Identity</div><p>${esc(r.description)}</p><div class="info-actions">
  <button type="button" class="info-action" data-modal-job="${esc(r.job_id)}">Open ${esc(job)} Job Card</button></div></section><section class="info-section"><div class="info-section-title">
  Awakening Path</div><div class="info-stage-list">${r.stages.map(st=>`<article class="info-stage"><div class="info-stage-head"><div><span class="info-kicker">Stage ${st.stage}</span><h3>
  ${esc(st.name)}</h3></div><span class="badge gold">${esc(itemName(st.reward_item))}</span></div><div class="info-stage-grid"><div class="info-stage-block"><b>Requirements</b><p>
  ${(st.requirements||[]).map(reqText).map(esc).join('<br>')||'None'}</p></div><div class="info-stage-block"><b>Cost</b><p>${esc(costText(st.cost))}</p></div></div><div class="info-reward"><span>
  Stage Reward</span><b>${esc(itemName(st.reward_item))}</b></div></article>`).join('')}</div></section><section class="info-section"><div class="info-section-title">Chat Commands</div>
  <div class="info-command-row"><code class="info-command">!relic ${esc(r.name)}</code><code class="info-command">!awaken ${esc(r.name)}</code></div></section>`;}
$('#relicSearch').oninput=renderRelics;$('#relicJob').onchange=renderRelics;renderRelics();

// Bosses — independent raid dossiers
const tiers=[...new Set(D.bosses.map(b=>b.tier))];tiers.forEach(x=>$('#bossTier').insertAdjacentHTML('beforeend',`<option>${esc(x)}</option>`));
function bossOverview(b){return `<button type="button" class="card boss-overview searchable" data-open-boss="${esc(b.id)}" aria-label="Open ${esc(b.name)} raid boss details"><div class="statline">
  <span class="badge ${/ultimate/i.test(b.tier)?'owner':'gold'}">${esc(humanizeLabel(b.tier))}</span><span class="badge">Lv.${b.recommended_level}</span></div><h3>${esc(b.name)}</h3><div class="boss-hp">
  ${fmtInt(b.hp)}<small>HP</small></div><p class="boss-signature"><b>${esc(b.signature)}</b> signature</p><p>${esc(b.description||'')}</p><div class="card-spacer"></div><div class="card-open-hint">
  <span>${b.phases.length} phases • Enrage R${b.enrage_round}</span><b>Open Boss →</b></div></button>`;}
function renderBosses(){let q=$('#bossSearch').value.toLowerCase(),t=$('#bossTier').value;let bs=D.bosses.filter(b=>(!t||b.tier===t)&&([b.name,b.tier,b.signature,b.description,
  ...(b.drops||[]).map(d=>itemName(d.item_id)),...(b.phases||[]).map(p=>p.name)].join(' ').toLowerCase().includes(q)));
  $('#bossGrid').innerHTML=bs.map(bossOverview).join('')||'<div class="command-empty">No raid bosses match this filter.</div>';}
function renderBossInfo(b){infoKicker.textContent='Raid Boss';infoTitle.textContent=b.name;infoBadges.innerHTML=`<span class="badge ${/ultimate/i.test(b.tier)?'owner':'gold'}">${esc(humanizeLabel(b.tier))}
  </span><span class="badge">Recommended Lv.${b.recommended_level}</span><span class="badge">${b.phases.length} phases</span>`;infoBody.innerHTML=`<section class="info-section">
  <div class="info-section-title">Threat Profile</div><p>${esc(b.description||'')}</p><div class="info-hero-stat"><div class="info-stat"><span>Boss HP</span><b>${fmtInt(b.hp)}</b></div>
  <div class="info-stat"><span>Signature</span><b>${esc(b.signature)}</b></div><div class="info-stat"><span>Attacks / Round</span><b>${b.attacks_per_round}</b></div><div class="info-stat"><span>
  Party Attack</span><b>Every ${b.aoe_every} rounds</b></div><div class="info-stat"><span>Enrage</span><b>Round ${b.enrage_round}</b></div><div class="info-stat"><span>Victory XP</span><b>${fmtInt(b.xp)}</b>
  </div><div class="info-stat"><span>Victory Gil</span><b>${fmtInt(b.gil)}</b></div></div></section><section class="info-section"><div class="info-section-title">Phase Timeline</div>
  <div class="info-phase-list">${(b.phases||[]).map(p=>`<div class="info-phase"><div class="phase-threshold">${Math.round(p.threshold*100)}% HP</div><div class="phase-name"><b>${esc(p.name)}</b><span>
  Phase activates at or below this threshold</span></div><div class="phase-mult">DMG ×${p.damage_mult}</div></div>`).join('')}</div></section><section class="info-section">
  <div class="info-section-title">Raid Loot</div><div class="info-loot-grid">${(b.drops||[]).map(d=>`<div class="info-loot"><b>${esc(itemName(d.item_id))}</b><span>${pct(d.chance)} drop chance</span>
  </div>`).join('')||'<div class="muted">No configured raid drops.</div>'}</div></section><section class="info-section"><div class="info-section-title">Chat Commands</div>
  <div class="info-command-row"><code class="info-command">!bossinfo ${esc(b.name)}</code><code class="info-command">!raid</code><code class="info-command">!raidstats</code></div></section>`;}
$('#bossSearch').oninput=renderBosses;$('#bossTier').onchange=renderBosses;renderBosses();

// Achievements / titles
function condText(c){
  if(!c)return'—';
  if(c.type==='stat')return `${metricLabel(c.field)} ≥ ${fmtInt(c.amount)}`;
  if(c.type==='record_stat')return `${metricLabel(c.metric)} ≥ ${fmtInt(c.amount)}`;
  if(c.type==='monster_record_defeats')return `KO'd by ${monsterName(c.monster_id)} ×${fmtInt(c.amount)}`;
  if(c.type==='boss_clear')return `Defeat ${bossName(c.boss_id)} ×${fmtInt(c.amount)}`;
  if(c.type==='boss_unique')return `Defeat ${fmtInt(c.amount)} unique raid bosses`;
  if(c.type==='hunt_rank_total')return `${c.rank}-Rank Hunt clears ×${fmtInt(c.amount)}`;
  if(c.type==='job_battles')return `${fmtInt(c.amount)} battles on one Job`;
  if(c.type==='bestiary_unique')return `Discover ${fmtInt(c.amount)} unique Bestiary entries`;
  if(c.type==='job_level')return c.job_id?reqText(c):`Reach JLv.${fmtInt(c.amount)} on any Job`;
  if(c.type==='monster_kills')return reqText(c);
  if(c.type==='hunt_total')return `Complete ${fmtInt(c.amount)} Hunts`;
  if(c.type==='hunt_rank_clears')return reqText(c);
  if(c.type==='mastery_count')return `Master ${fmtInt(c.amount)} Jobs`;
  if(c.type==='quest_count')return `Complete ${fmtInt(c.amount)} Job unlock quests`;
  if(c.type==='character_level')return `Reach Character Lv.${fmtInt(c.amount)}`;
  if(c.type==='gil')return `Hold ${fmtInt(c.amount)} gil`;
  return `${humanizeLabel(c.type)}${c.amount==null?'':` ≥ ${fmtInt(c.amount)}`}`;
}
const achievementHost=$('#achievementList');
const titleHost=$('#titleList');

function completionTable(host,config){
  const shell=host.closest('.completion-catalog-card');
  if(shell){
    shell.className='completion-table-host';
    const heading=shell.querySelector(':scope > h3');
    if(heading)heading.outerHTML=`<h2>${esc(config.title)}</h2>`;
    shell.querySelector(':scope > h2')?.insertAdjacentHTML(
      'afterend',`<p class="lead">${esc(config.lead)}</p>`);
  }
  const wrap=document.createElement('div');
  wrap.className='tablewrap completion-table-wrap';
  const table=document.createElement('table');
  table.className='datatable completion-table';
  const head=document.createElement('thead');
  head.innerHTML='<tr>'+config.columns.map(col=>`<th>${esc(col)}</th>`).join('')+'</tr>';
  const body=document.createElement('tbody');
  body.id=host.id;
  table.append(head,body);
  wrap.appendChild(table);
  host.replaceWith(wrap);
  return {wrap,body};
}

function optionMarkup(values,label){
  return [`<option value="">All ${esc(label)}</option>`]
    .concat(values.map(value=>`<option value="${esc(value)}">${esc(humanizeLabel(value))}</option>`))
    .join('');
}

function completionToolbar(host,config){
  const bar=document.createElement('div');
  bar.className='toolbar completion-table-toolbar';
  bar.innerHTML=`<input class="search" id="${config.prefix}Search" `
    +`placeholder="${esc(config.placeholder)}" autocomplete="off">`
    +config.selects.map(select=>`<select class="select" id="${config.prefix}${select.id}" `
      +`aria-label="${esc(select.label)}">${optionMarkup(select.values,select.allLabel||select.label)}`
      +`</select>`).join('')
    +`<div class="completion-result-count" id="${config.prefix}Count" aria-live="polite"></div>`;
  host.before(bar);
  return {
    search:bar.querySelector(`#${config.prefix}Search`),
    filters:Object.fromEntries(config.selects.map(select=>[
      select.key,bar.querySelector(`#${config.prefix}${select.id}`),
    ])),
    count:bar.querySelector(`#${config.prefix}Count`),
  };
}

function tierLabel(value){return humanizeLabel(value||'bronze');}

function achievementRow(a){
  const secret=!!a.secret;
  const tier=String(a.tier||'bronze').toLowerCase();
  const name=secret?'Secret Achievement':a.name;
  const desc=secret?'Hidden until unlocked in-game.':a.description;
  const condition=secret?'Requirement concealed':condText(a.condition);
  const reward=a.reward_title
    ?(secret?'???':titleName(a.reward_title))
    :'—';
  const category=secret?'Secret':(a.category||'General');
  return `<tr class="searchable tier-${esc(tier)}">`
    +`<td data-label="Achievement"><span class="table-primary">${esc(name)}</span>`
    +`<span class="table-sub">${esc(desc)}</span></td>`
    +`<td data-label="Category"><span class="table-pill">${esc(humanizeLabel(category))}</span></td>`
    +`<td data-label="Tier"><span class="table-pill tier-${esc(tier)}">`
    +`${esc(tierLabel(tier))}</span></td>`
    +`<td data-label="AP"><span class="table-pill gold">${fmtInt(a.points||0)} AP</span></td>`
    +`<td data-label="Requirement"><span class="table-note">${esc(condition)}</span></td>`
    +`<td data-label="Reward"><span class="table-primary gold">${esc(reward)}</span>`
    +`${a.reward_title?'<span class="table-sub">title reward</span>':''}</td></tr>`;
}

function titleRow(t){
  const rarity=String(t.rarity||'common').toLowerCase();
  const category=t.category||'General';
  const source=t.source||'Progression';
  return `<tr class="searchable rarity-${esc(rarity)}">`
    +`<td data-label="Title"><span class="table-primary">${esc(t.name)}</span></td>`
    +`<td data-label="Rarity"><span class="table-pill rarity-${esc(rarity)}">`
    +`${esc(tierLabel(rarity))}</span></td>`
    +`<td data-label="Category"><span class="table-pill">${esc(humanizeLabel(category))}</span></td>`
    +`<td data-label="Source"><span class="table-note">${esc(humanizeLabel(source))}</span></td>`
    +`<td data-label="Description"><span class="table-note">${esc(t.description)}</span></td></tr>`;
}

const achievementTable=completionTable(achievementHost,{
  title:'Achievements',
  lead:'Browse every visible milestone, its tier, Achievement Points, requirement and title reward.',
  columns:['Achievement','Category','Tier','AP','Requirement','Reward'],
});
const achievementList=achievementTable.body;
const titleTable=completionTable(titleHost,{
  title:'Titles',
  lead:'Browse titles by rarity, category and how they are unlocked.',
  columns:['Title','Rarity','Category','Source','Description'],
});
const titleList=titleTable.body;

const achievementCategories=[...new Set(D.achievements.map(a=>a.category||'General'))].sort();
const achievementTiers=['bronze','silver','gold','crystal'].filter(tier=>
  D.achievements.some(a=>String(a.tier||'bronze').toLowerCase()===tier));
const achievementControls=completionToolbar(achievementTable.wrap,{
  prefix:'achievementGuide',
  placeholder:'Search visible achievements',
  selects:[
    {id:'Category',key:'category',label:'Category',values:achievementCategories},
    {id:'Tier',key:'tier',label:'Tier',values:achievementTiers,allLabel:'Tiers'},
  ],
});

function renderGuideAchievements(){
  const shown=filterGuideAchievements(D.achievements,{
    query:achievementControls.search.value,
    category:achievementControls.filters.category.value,
    tier:achievementControls.filters.tier.value,
  });
  achievementList.innerHTML=shown.map(achievementRow).join('')
    ||'<tr><td colspan="6"><span class="table-note">No achievements match these filters.</span></td></tr>';
  achievementControls.count.textContent=`${shown.length} of ${D.achievements.length} milestones shown`;
  labelResponsiveTables();
}
achievementControls.search.addEventListener('input',renderGuideAchievements);
Object.values(achievementControls.filters).forEach(control=>
  control.addEventListener('change',renderGuideAchievements));
renderGuideAchievements();

const titleCategories=[...new Set(D.titles.map(t=>t.category||'General'))].sort();
const titleRarities=['common','uncommon','rare','epic','legendary'].filter(rarity=>
  D.titles.some(t=>String(t.rarity||'common').toLowerCase()===rarity));
const titleControls=completionToolbar(titleTable.wrap,{
  prefix:'titleGuide',
  placeholder:'Search titles or descriptions',
  selects:[
    {id:'Category',key:'category',label:'Category',values:titleCategories},
    {id:'Rarity',key:'rarity',label:'Rarity',values:titleRarities},
  ],
});

function renderGuideTitles(){
  const shown=filterGuideTitles(D.titles,{
    query:titleControls.search.value,
    category:titleControls.filters.category.value,
    rarity:titleControls.filters.rarity.value,
  });
  titleList.innerHTML=shown.map(titleRow).join('')
    ||'<tr><td colspan="5"><span class="table-note">No titles match these filters.</span></td></tr>';
  titleControls.count.textContent=`${shown.length} of ${D.titles.length} titles shown`;
  labelResponsiveTables();
}
titleControls.search.addEventListener('input',renderGuideTitles);
Object.values(titleControls.filters).forEach(control=>
  control.addEventListener('change',renderGuideTitles));
renderGuideTitles();

// Catalog close controls are wired externally so the production CSP can stay strict.
function setupCatalogCloseButtons(){
  $$('[data-catalog-close]').forEach(button=>{
    if(button.dataset.catalogCloseBound==='true')return;
    const details=button.closest('details.catalog-disclosure');
    if(!details)return;
    button.dataset.catalogCloseBound='true';
    button.addEventListener('click',event=>{
      event.preventDefault();
      event.stopPropagation();
      details.open=false;
      const summary=details.querySelector(':scope > summary');
      if(summary){
        try{summary.focus({preventScroll:true});}
        catch(_error){summary.focus();}
      }
    });
  });
}
setupCatalogCloseButtons();

// Achievements & Titles — native catalog bars with deep-link support.
function setupCompletionCatalogs(){
  const section=$('#completion');
  if(!section||section.dataset.completionCatalogs==='ready')return;
  const catalogs=[...section.querySelectorAll(':scope .completion-catalog')];
  if(!catalogs.length)return;
  section.dataset.completionCatalogs='ready';

  function catalogFor(view){
    return catalogs.find(details=>details.dataset.completionCatalog===view)||null;
  }
  function openView(view,updateHash=false){
    const target=catalogFor(view);
    if(!target)return;
    catalogs.forEach(details=>{details.open=details===target;});
    if(updateHash){
      const hash=view==='titles'?'#titles':'#achievements';
      history.replaceState(null,'',`${location.pathname}${location.search}${hash}`);
    }
  }

  catalogs.forEach(details=>{
    details.addEventListener('toggle',()=>{
      if(!details.open)return;
      const view=details.dataset.completionCatalog;
      catalogs.forEach(other=>{if(other!==details)other.open=false;});
      openView(view,true);
    });
  });
  window.addEventListener('hashchange',()=>{
    const view=completionViewForHash(location.hash);
    if(view)openView(view,false);
  });

  const initial=completionViewForHash(location.hash);
  if(initial)openView(initial,false);
}
setupCompletionCatalogs();

// Responsive navigation.
const navOpen=$('#navOpen'),navClose=$('#navClose'),navBackdrop=$('#navBackdrop');
function setGuideNav(open){document.body.classList.toggle('nav-open',open);navOpen?.setAttribute('aria-expanded',String(open));}
navOpen?.addEventListener('click',()=>setGuideNav(true));navClose?.addEventListener('click',()=>setGuideNav(false));navBackdrop?.addEventListener('click',()=>setGuideNav(false));
$$('#guideNav a').forEach(a=>a.addEventListener('click',()=>{if(window.innerWidth<=1024)setGuideNav(false)}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')setGuideNav(false)});
window.addEventListener('resize',()=>{if(window.innerWidth>1024)setGuideNav(false)});

// Turn dense desktop tables into labeled cards on narrow screens.
function labelResponsiveTables(){
  $$('.datatable').forEach(table=>{const labels=[...table.querySelectorAll('th')].map(th=>th.textContent.trim());
    [...table.querySelectorAll('tbody tr')].forEach(row=>[...row.querySelectorAll('td')].forEach((td,i)=>td.dataset.label=labels[i]||''));});
}
const tableObserver=new MutationObserver(labelResponsiveTables);$$('.datatable tbody').forEach(t=>tableObserver.observe(t,{childList:true,subtree:true}));labelResponsiveTables();

// Global search: navigates/filter-highlights broad sections without destroying local table filters.
$('#globalSearch').addEventListener('input',e=>{let q=e.target.value.trim().toLowerCase();let sections=$$('.section.searchable');if(!q){sections.forEach(s=>s.classList.remove('hidden'));
  $('#searchCount').textContent='';return}let n=0;sections.forEach(s=>{let hit=s.textContent.toLowerCase().includes(q);s.classList.toggle('hidden',!hit);if(hit)n++});
  $('#searchCount').textContent=`${n} section${n===1?'':'s'} match`;});


if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
  document.addEventListener('pointermove', function (event) {
    const card = event.target.closest('.card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--card-x', ((event.clientX-r.left)/r.width*100).toFixed(1)+'%');
    card.style.setProperty('--card-y', ((event.clientY-r.top)/r.height*100).toFixed(1)+'%');
  }, {passive:true});
}

// Context-aware collapsible data catalogs.
(function () {
  const tableCatalogs = [
    {
      id: 'bestiary',
      title: 'All Bestiary Entries',
      icon: '✦',
      conditional: true,
      controls: ['#monsterSearch', '#monsterRegion'],
    },
    {
      id: 'items',
      title: 'All Items & Equipment',
      icon: '◆',
      conditional: true,
      controls: ['#itemSearch', '#itemType', '#itemLevel', '#itemJob', '#itemRarity'],
    },
    {
      id: 'forge',
      title: 'Forge Upgrade Table',
      icon: '⚒',
    },
    {
      id: 'quartermaster',
      title: 'Quartermaster Stock',
      icon: '◇',
    }
  ];

  function rowCount(section) {
    const body = section.querySelector('.datatable tbody');
    if (!body) return 0;
    return [...body.rows].filter(row => !row.classList.contains('table-empty')).length;
  }

  function stateKey(id) {
    return `cg-guide-table-${id}`;
  }

  function savedState(id) {
    try {
      return sessionStorage.getItem(stateKey(id));
    } catch (_) {
      return null;
    }
  }

  function saveState(id, open) {
    try {
      sessionStorage.setItem(stateKey(id), open ? 'open' : 'closed');
    } catch (_) {
      // Storage is optional; native details still works without it.
    }
  }

  function hasActiveFilters(config, section) {
    if (!config.conditional) return false;
    return (config.controls || []).some(selector => {
      const control = section.querySelector(selector);
      return control && String(control.value || '').trim() !== '';
    });
  }

  function updateMeta(details, section) {
    const current = rowCount(section);
    const total = Number(details.dataset.totalRows) || current;
    const meta = details.querySelector('.data-collapse-meta');
    if (!meta) return;
    if (total && current !== total) {
      meta.textContent = `${current.toLocaleString()} / ${total.toLocaleString()} visible`;
      return;
    }
    meta.textContent = `${current.toLocaleString()} ${current === 1 ? 'entry' : 'entries'}`;
  }

  function syncConditional(details, section, config) {
    if (!config.conditional) return;
    const filtered = hasActiveFilters(config, section);
    details.classList.toggle('filters-active', filtered);
    if (filtered) {
      details.open = true;
      return;
    }
    details.open = details.dataset.manualOpen === 'true';
  }

  function enhance(config) {
    const section = document.getElementById(config.id);
    if (!section || section.querySelector(':scope > .data-collapse')) return;
    const tableWrap = section.querySelector(':scope > .tablewrap');
    if (!tableWrap) return;
    const toolbar = section.querySelector(':scope > .toolbar');
    const details = document.createElement('details');
    details.className = 'data-collapse';
    if (config.conditional) details.classList.add('conditional-collapse');
    details.dataset.catalog = config.id;
    details.dataset.totalRows = String(rowCount(section));
    details.dataset.manualOpen = 'false';
    details.open = config.conditional ? false : savedState(config.id) === 'open';
    const summary = document.createElement('summary');
    summary.innerHTML = [
      `<span class="data-collapse-icon" aria-hidden="true">${config.icon}</span>`,
      '<span class="data-collapse-copy">',
      `<span class="data-collapse-title">${config.title}</span>`,
      '<span class="data-collapse-meta">Loading entries…</span>',
      '</span>',
      '<span class="data-collapse-chevron" aria-hidden="true">⌄</span>'
    ].join('');
    const body = document.createElement('div');
    body.className = 'data-collapse-body';
    details.append(summary, body);

    if (config.conditional) {
      section.insertBefore(details, tableWrap);
      body.appendChild(tableWrap);
    } else {
      section.insertBefore(details, toolbar || tableWrap);
      if (toolbar) body.appendChild(toolbar);
      body.appendChild(tableWrap);
    }

    details.addEventListener('toggle', () => {
      if (hasActiveFilters(config, section)) return;
      if (config.conditional) {
        details.dataset.manualOpen = details.open ? 'true' : 'false';
        return;
      }
      saveState(config.id, details.open);
    });

    const tbody = tableWrap.querySelector('tbody');
    if (tbody) {
      const observer = new MutationObserver(() => {
        updateMeta(details, section);
        syncConditional(details, section, config);
      });
      observer.observe(tbody, { childList: true, subtree: true });
    }

    if (config.conditional) {
      for (const selector of config.controls || []) {
        const control = section.querySelector(selector);
        if (!control) continue;
        const eventName = control.tagName === 'SELECT' ? 'change' : 'input';
        control.addEventListener(eventName, () => {
          requestAnimationFrame(() => {
            updateMeta(details, section);
            syncConditional(details, section, config);
          });
        });
      }
    }

    updateMeta(details, section);
    syncConditional(details, section, config);
  }

  function openHashCatalog() {
    if (!location.hash) return;
    const section = document.querySelector(location.hash);
    const details = section?.querySelector(':scope > .data-collapse');
    if (!details || details.classList.contains('conditional-collapse')) return;
    details.open = true;
  }

  function init() {
    tableCatalogs.forEach(enhance);
    openHashCatalog();
    window.addEventListener('hashchange', openHashCatalog);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}());


// Guide-wide collapsible section index.
// Each major Player Guide area becomes one table-like disclosure row while
// preserving the existing section content and local controls when expanded.
function setupGuideSectionAccordions(){
  const content=$('.content');
  if(!content||content.dataset.sectionAccordions==='ready')return;
  const sections=[...content.querySelectorAll(':scope > .section.searchable')];
  if(!sections.length)return;
  content.dataset.sectionAccordions='ready';
  content.classList.add('guide-accordion-content');

  const sectionGroups={
    quickstart:'Begin',commands:'Begin',progression:'Begin','fellowship-guide':'Begin',stats:'Begin',combat:'Begin',party:'Begin',recovery:'Begin',
    jobs:'Build Your Hero',regions:'Build Your Hero',bestiary:'Build Your Hero',hunts:'Build Your Hero',quests:'Build Your Hero',
    items:'Gear & Endgame',crafting:'Gear & Endgame',forge:'Gear & Endgame',quartermaster:'Gear & Endgame',relics:'Gear & Endgame',raids:'Gear & Endgame',bosses:'Gear & Endgame',
    completion:'Completion',faq:'Completion'
  };
  const stateKey=id=>`cg-guide-section-${id}`;
  let searchActive=false;

  function storedState(id){
    try{return sessionStorage.getItem(stateKey(id));}
    catch(_error){return null;}
  }
  function saveState(id,open){
    try{sessionStorage.setItem(stateKey(id),open?'open':'closed');}
    catch(_error){/* Native details remains usable without session storage. */}
  }
  function sectionTitle(section){
    return section.querySelector(':scope > h2')?.textContent.trim()
      ||section.querySelector(':scope > .catalog-disclosure > summary .catalog-launch-title')?.textContent.trim()
      ||section.id;
  }
  function sectionLead(section){
    return section.querySelector(':scope > .lead')?.textContent.trim()
      ||section.querySelector(':scope > .catalog-disclosure > .catalog-panel > .lead')?.textContent.trim()
      ||'';
  }
  function catalogMeta(section){
    return section.querySelector(':scope > .catalog-disclosure > summary .catalog-launch-meta')?.textContent.trim()||'';
  }
  function summaryMarkup(section,index){
    const id=section.id;
    const title=sectionTitle(section);
    const lead=sectionLead(section);
    const group=sectionGroups[id]||'Player Guide';
    const meta=catalogMeta(section);
    return [
      `<span class="guide-section-index" aria-hidden="true">${String(index+1).padStart(2,'0')}</span>`,
      '<span class="guide-section-copy">',
      `<span class="guide-section-kicker">${esc(group)}</span>`,
      `<h2>${esc(title)}</h2>`,
      '</span>',
      '<span class="guide-section-state">',
      meta?`<span class="guide-section-meta">${esc(meta)}</span>`:'',
      '<span class="guide-section-chevron" aria-hidden="true">⌄</span>',
      '</span>',
      lead?`<span class="guide-section-lead-full">${esc(lead)}</span>`:''
    ].join('');
  }
  // Guide summaries are generated dynamically, so protect their descriptive copy
  // at runtime as well as in CSS. This deliberately defeats stale/general rules
  // that try to turn the description back into a one-line ellipsis.
  function forceSummaryWrapping(summary){
    if(!summary)return;
    summary.style.setProperty('height','auto','important');
    summary.style.setProperty('max-height','none','important');
    summary.style.setProperty('overflow','visible','important');
    const copy=summary.querySelector('.guide-section-copy');
    if(copy){
      copy.style.setProperty('min-width','0','important');
      copy.style.setProperty('max-width','none','important');
      copy.style.setProperty('height','auto','important');
      copy.style.setProperty('max-height','none','important');
      copy.style.setProperty('overflow','visible','important');
      copy.style.setProperty('white-space','normal','important');
    }
    const lead=summary.querySelector('.guide-section-lead-full');
    if(lead){
      for(const [property,value] of [
        ['display','block'],['min-width','0'],['width','auto'],['max-width','none'],
        ['height','auto'],['max-height','none'],['overflow','visible'],
        ['white-space','normal'],['text-overflow','clip'],['overflow-wrap','break-word'],
        ['word-break','normal'],['-webkit-line-clamp','unset'],['line-clamp','unset'],
        ['-webkit-box-orient','initial']
      ]) lead.style.setProperty(property,value,'important');
    }
  }
  function updateDisclosureState(details){
    forceSummaryWrapping(details.querySelector(':scope > summary'));
  }

  const disclosures=[];
  sections.forEach((section,index)=>{
    const id=section.id;
    let details;
    let summary;
    const existingCatalog=section.querySelector(':scope > details.catalog-disclosure');

    if(existingCatalog){
      details=existingCatalog;
      details.classList.add('guide-section-accordion','guide-section-catalog');
      summary=details.querySelector(':scope > summary');
      summary.className='guide-section-summary';
      summary.innerHTML=summaryMarkup(section,index);
      forceSummaryWrapping(summary);
    }else{
      details=document.createElement('details');
      details.className='guide-section-accordion';
      summary=document.createElement('summary');
      summary.className='guide-section-summary';
      summary.innerHTML=summaryMarkup(section,index);
      forceSummaryWrapping(summary);
      const body=document.createElement('div');
      body.className='guide-section-body';
      const heading=section.querySelector(':scope > h2');
      const lead=section.querySelector(':scope > .lead');
      if(heading)heading.remove();
      if(lead)lead.remove();
      while(section.firstChild)body.appendChild(section.firstChild);
      details.append(summary,body);
      section.appendChild(details);
    }

    details.dataset.guideSection=id;
    const saved=storedState(id);
    details.open=saved?saved==='open':false;
    updateDisclosureState(details);
    details.addEventListener('toggle',()=>{
      updateDisclosureState(details);
      if(!searchActive)saveState(id,details.open);
      updateToolbar();
    });
    disclosures.push(details);
  });

  const toolbar=document.createElement('div');
  toolbar.className='guide-section-toolbar';
  toolbar.setAttribute('aria-label','Player Guide section controls');
  toolbar.innerHTML=[
    '<div class="guide-section-toolbar-copy">',
    '<span class="guide-section-toolbar-kicker">Guide Index</span>',
    '<strong>Browse by section</strong>',
    `<span id="guideSectionCount">${disclosures.length} sections</span>`,
    '</div>',
    '<div class="guide-section-toolbar-actions">',
    '<button class="guide-section-control" type="button" data-guide-sections="expand">Expand All</button>',
    '<button class="guide-section-control" type="button" data-guide-sections="collapse">Collapse All</button>',
    '</div>'
  ].join('');
  content.before(toolbar);

  function updateToolbar(){
    const count=toolbar.querySelector('#guideSectionCount');
    if(!count)return;
    const visible=disclosures.filter(details=>!details.closest('.section')?.classList.contains('hidden'));
    const open=visible.filter(details=>details.open).length;
    count.textContent=`${open} of ${visible.length} visible sections expanded`;
  }
  function setAll(open){
    disclosures.forEach(details=>{
      if(details.closest('.section')?.classList.contains('hidden'))return;
      details.open=open;
      if(!searchActive)saveState(details.dataset.guideSection,open);
      updateDisclosureState(details);
    });
    updateToolbar();
  }
  toolbar.addEventListener('click',event=>{
    const button=event.target.closest('[data-guide-sections]');
    if(!button)return;
    setAll(button.dataset.guideSections==='expand');
  });

  function disclosureForHash(){
    const raw=decodeURIComponent(location.hash.replace(/^#/,''));
    if(!raw)return null;
    const target=document.getElementById(raw);
    const section=target?.classList.contains('section')?target:target?.closest('.section');
    return section?.querySelector(':scope > .guide-section-accordion')||null;
  }
  function openHashSection(){
    const details=disclosureForHash();
    if(!details)return;
    details.open=true;
    updateDisclosureState(details);
    if(!searchActive)saveState(details.dataset.guideSection,true);
    updateToolbar();
  }
  openHashSection();
  window.addEventListener('hashchange',()=>requestAnimationFrame(openHashSection));
  $$('#guideNav a[href^="#"]').forEach(link=>link.addEventListener('click',()=>{
    const id=decodeURIComponent(link.hash.replace(/^#/,''));
    const section=document.getElementById(id)?.closest('.section')||document.getElementById(id);
    const details=section?.querySelector(':scope > .guide-section-accordion');
    if(details){details.open=true;updateDisclosureState(details);saveState(details.dataset.guideSection,true);}
  }));

  const globalSearch=$('#globalSearch');
  if(globalSearch){
    globalSearch.addEventListener('input',()=>{
      const query=globalSearch.value.trim();
      if(query&&!searchActive){
        searchActive=true;
        disclosures.forEach(details=>details.dataset.preSearchOpen=details.open?'true':'false');
      }
      if(query){
        disclosures.forEach(details=>{
          const section=details.closest('.section');
          if(section&&!section.classList.contains('hidden'))details.open=true;
          updateDisclosureState(details);
        });
      }else if(searchActive){
        searchActive=false;
        disclosures.forEach(details=>{
          details.open=details.dataset.preSearchOpen==='true';
          delete details.dataset.preSearchOpen;
          updateDisclosureState(details);
        });
      }
      requestAnimationFrame(updateToolbar);
    });
  }
  updateToolbar();
}
setupGuideSectionAccordions();

// Bestiary and Items & Equipment catalog launch tiles.
(function () {
  const catalogIds = ['bestiary', 'items'];

  function setupCatalog(id) {
    const section = document.getElementById(id);
    if (!section) return;
    const launch = section.querySelector('[data-catalog-open]');
    const panel = section.querySelector('.catalog-panel');
    const close = section.querySelector('[data-catalog-close]');
    if (!launch || !panel || !close) return;

    function openCatalog() {
      panel.hidden = false;
      section.classList.add('catalog-open');
      launch.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(() => {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    function closeCatalog() {
      panel.hidden = true;
      section.classList.remove('catalog-open');
      launch.setAttribute('aria-expanded', 'false');
      launch.focus({ preventScroll: true });
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    launch.addEventListener('click', openCatalog);
    close.addEventListener('click', closeCatalog);
  }

  catalogIds.forEach(setupCatalog);
})();

}
