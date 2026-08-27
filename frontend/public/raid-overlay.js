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
function bossArtPath(name){
  const key=String(name||'').trim().toLowerCase().replace(/[_-]+/g,' ').replace(/\s+/g,' ');
  const id=BOSS_ART_BY_NAME[key];
  return id?`/retro-phase-ii/boss-art-v1/${id}.webp`:'';
}
const wrap=document.getElementById('wrap');
const $=id=>document.getElementById(id);
function hide(){wrap.style.display='none'}
function safeStatus(value){return String(value||'ACTIVE').trim().toUpperCase()||'ACTIVE'}
function renderLeaders(entries){
  const root=$('top');
  root.replaceChildren();
  (Array.isArray(entries)?entries:[]).slice(0,3).forEach((entry,index)=>{
    const el=document.createElement('span');
    el.className='leader';
    const rank=document.createElement('b');
    rank.textContent=`#${index+1}`;
    const name=document.createElement('span');
    name.textContent=` ${entry?.name||'Adventurer'} `;
    const damage=document.createElement('strong');
    damage.textContent=(Number(entry?.damage)||0).toLocaleString();
    el.append(rank,name,damage);
    el.title=`#${index+1} ${entry?.name||'Adventurer'} — ${(Number(entry?.damage)||0).toLocaleString()} damage`;
    root.appendChild(el);
  });
}
async function refresh(){
  try{
    const r=await fetch('/api/overlay/state?ts='+Date.now(),{cache:'no-store'});
    if(!r.ok){hide();return}
    const s=await r.json();
    const synced=Number(s.synced_at||0);
    if(!s.available||(synced&&Date.now()/1000-synced>120)){hide();return}
    const state=safeStatus(s.status);
    if(!s.active&&!['VICTORY','WIPE'].includes(state)){hide();return}

    wrap.style.display='grid';
    wrap.dataset.state=state;
    wrap.classList.toggle('enraged',Boolean(s.enraged)&&state==='ACTIVE');

    $('boss').textContent=s.boss||'Crystal Guild';
    const art=bossArtPath(s.boss);
    if(art){
      wrap.style.setProperty('--boss-art',`url("${art}")`);
      wrap.classList.add('has-boss-art');
    }else{
      wrap.style.removeProperty('--boss-art');
      wrap.classList.remove('has-boss-art');
    }

    $('tier').textContent=s.tier?String(s.tier):'Raid';
    $('raiders').textContent=`Raiders ${Number(s.alive)||0}/${Number(s.raiders)||0}`;
    $('round').textContent=`Round ${Number(s.round)||0}`;
    $('phase').textContent=s.phase?String(s.phase):'Battle';

    const hp=Number(s.hp)||0;
    const maxHp=Math.max(1,Number(s.max_hp)||1);
    const pct=Math.max(0,Math.min(100,(hp/maxHp)*100));
    $('hpbar').style.width=pct+'%';
    $('hp').textContent=`${hp.toLocaleString()} / ${(Number(s.max_hp)||0).toLocaleString()}  ·  ${Math.round(pct)}%`;
    wrap.classList.toggle('critical',state==='ACTIVE'&&pct>0&&pct<=25);

    const summon=Math.max(0,Math.min(100,Number(s.summon_gauge)||0));
    $('summonbar').style.width=summon+'%';
    $('summon').textContent=Math.round(summon)+'%';

    const badge=$('status-badge');
    badge.textContent=s.enraged&&state==='ACTIVE'?'Enraged':state==='VICTORY'?'Victory':state==='WIPE'?'Raid Wipe':'Active';
    renderLeaders(s.top);
  }catch{hide()}
}
setInterval(refresh,700);
refresh();
