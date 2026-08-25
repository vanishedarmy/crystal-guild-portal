const BOSS_ART_BY_NAME={
  "goblin king": "goblin_king",
  "hornet empress": "hornet_empress",
  "skeleton warlord": "skeleton_warlord",
  "gigas chief": "gigas_chief",
  "bomb king": "bomb_king",
  "ifrit": "ifrit",
  "shiva": "shiva",
  "ramuh": "ramuh",
  "ultros": "ultros",
  "garuda": "garuda_prime",
  "garuda prime": "garuda_prime",
  "titan": "titan",
  "demon wall": "demon_wall",
  "leviathan": "leviathan",
  "gilgamesh": "gilgamesh",
  "cerberus": "cerberus",
  "tonberry king": "tonberry_king",
  "deathgaze": "deathgaze",
  "atomos": "atomos",
  "king behemoth": "king_behemoth",
  "behemoth king": "king_behemoth",
  "bahamut": "bahamut",
  "death machine prime": "death_machine_prime",
  "ultima weapon": "ultima_weapon",
  "rift dragon": "rift_dragon",
  "warmech": "warmech",
  "omega": "omega",
  "shinryu": "shinryu",
  "omega weapon": "omega_weapon",
  "emerald weapon": "emerald_weapon",
  "ruby weapon": "ruby_weapon",
  "ozma": "ozma",
  "nemesis": "nemesis",
  "kaiser dragon": "kaiser_dragon",
  "long gui": "long_gui",
  "proto-babil": "proto_babil",
  "proto babil": "proto_babil",
  "penance": "penance",
  "absolute virtue": "absolute_virtue",
  "yiazmat": "yiazmat"
};
function bossArtPath(name){const key=String(name||'').trim().toLowerCase().replace(/[_-]+/g,' ').replace(/\s+/g,' ');const id=BOSS_ART_BY_NAME[key];return id?`/retro-phase-ii/boss-art-v1/${id}.webp`:''}
const wrap=document.getElementById('wrap');
function hide(){wrap.style.display='none'}
async function refresh(){
  try{
    const r=await fetch('/api/overlay/state?ts='+Date.now(),{cache:'no-store'});
    if(!r.ok){hide();return}
    const s=await r.json();
    const synced=Number(s.synced_at||0);
    if(!s.available||(synced&&Date.now()/1000-synced>120)){hide();return}
    if(!s.active&&!['VICTORY','WIPE'].includes(String(s.status||'').toUpperCase())){hide();return}
    wrap.style.display='block';
    document.getElementById('boss').textContent=s.boss||'Crystal Guild';
    const art=bossArtPath(s.boss);
    if(art){wrap.style.setProperty('--boss-art',`url("${art}")`);wrap.classList.add('has-boss-art')}else{wrap.style.removeProperty('--boss-art');wrap.classList.remove('has-boss-art')}
    document.getElementById('meta').textContent=[s.tier||'',`Raiders ${s.alive??0}/${s.raiders??0}`].filter(Boolean).join(' • ');
    const pct=Math.max(0,Math.min(100,((Number(s.hp)||0)/Math.max(1,Number(s.max_hp)||1))*100));
    document.getElementById('hpbar').style.width=pct+'%';
    document.getElementById('hp').textContent=(Number(s.hp)||0).toLocaleString()+' / '+(Number(s.max_hp)||0).toLocaleString()+' HP';
    document.getElementById('phase').textContent='R'+(Number(s.round)||0)+' • '+(s.phase||'Battle');
    const status=document.getElementById('status');
    status.textContent=(s.enraged?'ENRAGED • ':'')+'SUMMON '+(Number(s.summon_gauge)||0)+'%';
    status.className=s.enraged?'enraged':'';
    document.getElementById('top').textContent=(Array.isArray(s.top)?s.top:[]).map((x,i)=>'#'+(i+1)+' '+(x.name||'Adventurer')+' '+(Number(x.damage)||0).toLocaleString()+' dmg').join('   •   ');
  }catch{hide()}
}
setInterval(refresh,700);refresh();
