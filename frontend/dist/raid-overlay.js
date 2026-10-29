const BOSS_ART_BY_NAME={
  "goblin king":"goblin_king","hornet empress":"hornet_empress","skeleton warlord":"skeleton_warlord","gigas chief":"gigas_chief","bomb king":"bomb_king",
  "ifrit":"ifrit","shiva":"shiva","ramuh":"ramuh","ultros":"ultros","garuda":"garuda_prime","garuda prime":"garuda_prime","titan":"titan","demon wall":"demon_wall",
  "leviathan":"leviathan","gilgamesh":"gilgamesh","cerberus":"cerberus","tonberry king":"tonberry_king","deathgaze":"deathgaze","atomos":"atomos","king behemoth":"king_behemoth","behemoth king":"king_behemoth",
  "bahamut":"bahamut","death machine prime":"death_machine_prime","ultima weapon":"ultima_weapon","rift dragon":"rift_dragon","warmech":"warmech","omega":"omega","shinryu":"shinryu","omega weapon":"omega_weapon",
  "emerald weapon":"emerald_weapon","ruby weapon":"ruby_weapon","ozma":"ozma","nemesis":"nemesis","kaiser dragon":"kaiser_dragon","long gui":"long_gui","proto-babil":"proto_babil","proto babil":"proto_babil",
  "penance":"penance","absolute virtue":"absolute_virtue","yiazmat":"yiazmat"
};
function bossArtPath(name){const key=String(name||'').trim().toLowerCase().replace(/[_-]+/g,' ').replace(/\s+/g,' ');const id=BOSS_ART_BY_NAME[key];return id?`/retro-phase-ii/boss-art-v1/${id}.webp`:''}
/* v1.9.4.4 Raid Command. Public broadcast data only: no player IDs or private action keys. */
const ICON_ROOT='/raid-icons/';
const ICONS=Object.freeze({
  attack:'01_attack_up',defend:'02_defense_up',regen:'30_regen',haste:'04_haste',
  protect:'02_defense_up',shell:'05_ward',barrier:'57_crystal_barrier',safeguard:'42_safeguard',
  attack_up:'01_attack_up',attack_down:'09_attack_down',defense_up:'02_defense_up',defense_down:'10_defense_down',
  magic_up:'64_magic_up',magic_down:'65_magic_down',accuracy_up:'07_accuracy_up',crit_up:'08_critical_up',
  speed_up:'04_haste',slow:'37_slow',stop:'38_stop',poison:'33_poison',burn:'12_burn',
  bleed:'34_bleed',shock:'14_shock',stun:'55_daze',daze:'55_daze',silence:'32_silence',
  confusion:'22_confusion',sleep:'21_sleep',doom:'28_enrage',curse:'35_curse',
  petrify:'36_petrify',bind:'20_bind',restrained:'20_bind',taunt:'56_aggro_target',
  vulnerable:'66_vulnerability',vulnerability:'66_vulnerability',reflect:'39_reflect',
  float:'40_float',freeze:'50_ice',ice:'50_ice',water:'49_water',wind:'58_wind',
  stack:'25_stack',spread:'26_spread',marked:'23_marked',gaze:'29_gaze',
  lifesteal:'68_life_drain',heal_reduced:'67_healing_reduced',holy:'44_holy',
  regen_up:'03_regen',revive:'61_revive',cleanse:'62_cleanse',dispel:'69_dispel',
  critical_up:'08_critical_up',limit:'43_power_slash',enrage:'28_enrage'
});
const MECHANIC_ICON=Object.freeze({
  standard:'70_raid_mechanic_warning',targeted:'45_focus_target',raidwide:'63_party_wide_attack',
  damage_check:'43_power_slash',break_check:'31_break',guard_check:'57_crystal_barrier',
  heart_check:'24_heartbreak',chain:'20_bind',shared_hit:'25_stack',knockback:'51_knockback_impact',
  restraint:'52_stonebind',wind_pressure:'58_wind',wind_mark:'23_marked',
  side_sweep:'63_party_wide_attack',undertow:'49_water',tower_check:'25_stack',
  final_damage_check:'43_power_slash',survival_check:'57_crystal_barrier',
  adds:'23_marked',cleave:'43_power_slash',stagger:'66_vulnerability',
  enrage:'28_enrage',gaze:'29_gaze'
});
const MECHANIC_KIND=Object.freeze({
  targeted:'SINGLE TARGET',raidwide:'PARTY-WIDE',damage_check:'DAMAGE CHECK',
  break_check:'BREAK CHECK',guard_check:'GUARD CHECK',heart_check:'HEART CHECK',
  chain:'CHAIN',shared_hit:'STACK',knockback:'KNOCKBACK',restraint:'RESTRAINED',
  wind_pressure:'WIND PRESSURE',wind_mark:'WIND MARK',side_sweep:'SIDE SWEEP',
  undertow:'UNDERTOW',tower_check:'TOWERS',final_damage_check:'FINAL CHECK',
  survival_check:'SURVIVAL',adds:'ADDS',cleave:'CLEAVE',stagger:'STAGGER'
});
const MECHANIC_HINT=Object.freeze({
  targeted:'A marked raider is targeted.',raidwide:'All joined raiders are targeted.',
  damage_check:'Deal enough damage before the check ends.',break_check:'Break the mechanic before it resolves.',
  guard_check:'Guard against the incoming attack.',heart_check:'Complete the mechanic before the countdown.',
  chain:'A marked target carries the chain.',shared_hit:'Stack on the marked raider.',
  knockback:'Brace for knockback.',restraint:'Rescue the restrained ally.',
  wind_pressure:'Brace for wind pressure.',wind_mark:'Watch the marked raider.',
  side_sweep:'Avoid the marked side.',undertow:'Defend against the pull.',
  tower_check:'Complete the required towers.',final_damage_check:'Finish the damage check.',
  survival_check:'Survive the incoming pressure.',adds:'Defeat active adds.',
  cleave:'Protect allies beside the target.',stagger:'Boss is vulnerable.'
});
const ACTION_ICONS=Object.freeze({attack:'01_attack_up',defend:'02_defense_up',ability:'06_magic_up',item:'03_regen',limit:'43_power_slash'});
const fmt=n=>Math.max(0,Number(n)||0).toLocaleString();
const clamp=(n,max=100)=>Math.max(0,Math.min(max,Number(n)||0));
const wrap=document.getElementById('wrap');
const $=id=>document.getElementById(id);
let lastState=null, page=0, eventSource=null, lastEventAt=0, refreshing=false, refreshQueued=false, lastSuccessfulAt=0;
function iconPath(name){return `${ICON_ROOT}${name}.png`}
function fitOverlay(){
  const scale=Math.max(.1,Math.min(innerWidth/1200,innerHeight/900));
  wrap.style.transform=`scale(${scale})`;
  wrap.style.left=`${Math.max(0,(innerWidth-1200*scale)/2)}px`;
  wrap.style.top=`${Math.max(0,(innerHeight-900*scale)/2)}px`;
}
addEventListener('resize',fitOverlay);fitOverlay();
function hide(){wrap.style.display='none'}
function safeStatus(s){return String(s||'ACTIVE').toUpperCase()}
function statusName(id){return String(id||'Status').replace(/[_-]+/g,' ').replace(/\b\w/g,letter=>letter.toUpperCase()).slice(0,42)}
function createStatusIcon(status){
  const id=String(status?.id||'').toLowerCase();const turns=clamp(status?.turns,99);
  const badge=document.createElement('span');badge.className='status-icon';
  badge.setAttribute('role','img');badge.setAttribute('aria-label',`${statusName(id)}${turns?`, ${turns} rounds`:''}`);
  badge.title=badge.getAttribute('aria-label');
  const img=document.createElement('img');img.src=iconPath(ICONS[id]||'23_marked');img.alt='';img.width=20;img.height=20;img.loading='eager';badge.append(img);
  if(turns){const number=document.createElement('i');number.textContent=String(turns);badge.append(number)}
  return badge;
}
function renderStatuses(root,rows){root.replaceChildren();
  const entries=Array.isArray(rows)?rows.slice(0,8):[];
  entries.forEach(status=>root.append(createStatusIcon(status)));
  root.hidden=!entries.length;
}
function renderLeaders(entries){
  const root=$('top');root.replaceChildren();
  const rows=Array.isArray(entries)?entries.slice(0,3):[];
  if(!rows.length){root.textContent='No contribution yet';return}
  rows.forEach((row,index)=>{
    const el=document.createElement('div');el.className='leader';
    const label=document.createElement('span');label.textContent=`#${index+1} ${String(row?.name||'Adventurer')}`;
    const score=document.createElement('strong');score.textContent=`${fmt(row?.score)} PTS`;
    el.append(label,score);root.append(el);
  });
}
function renderAdds(rows){
  const root=$('adds');root.replaceChildren();
  const entries=Array.isArray(rows)?rows.slice(0,3):[];
  if(!entries.length){const empty=document.createElement('span');empty.id='footer-note';empty.textContent='No adds active';root.append(empty);return}
  entries.forEach(row=>{
    const el=document.createElement('div');el.className='add-chip';
    const name=document.createElement('span');name.textContent=String(row?.name||'Add');
    const health=document.createElement('b');health.textContent=`${fmt(row?.hp)} / ${fmt(row?.max_hp)} HP`;
    el.append(name,health);root.append(el);
  });
  if(Array.isArray(rows)&&rows.length>entries.length){const rest=document.createElement('span');rest.textContent=`+${rows.length-entries.length}`;root.append(rest)}
}
function addMember(row,root){
  const item=document.createElement('div');item.className=`member ${String(row?.state||'').toLowerCase()}`;
  const role=document.createElement('span');role.className=`role-chip ${String(row?.role||'').toLowerCase()}`;role.textContent=String(row?.role||'DPS').slice(0,7);
  const details=document.createElement('div');details.className='member-details';
  const top=document.createElement('div');top.className='member-top';
  const name=document.createElement('span');name.className='member-name';name.textContent=String(row?.name||'Adventurer');name.title=name.textContent;
  const statuses=document.createElement('div');statuses.className='icon-strip';renderStatuses(statuses,row?.statuses);
  top.append(name,statuses);
  const job=document.createElement('span');job.className='job';job.textContent=String(row?.job||'Adventurer');
  details.append(top,job);
  const meters=document.createElement('div');meters.className='meters';
  const stats=[['HP',row?.hp,row?.max_hp]];
  if(row?.resource&&Number(row?.resource_max)>0)stats.push([String(row.resource),row.resource_value,row.resource_max]);
  for(const [kind,value,max] of stats){
    const meter=document.createElement('div');meter.className='meter-row';
    const title=document.createElement('span');title.textContent=kind;
    const track=document.createElement('div');track.className='meter-track';
    const pct=clamp((Number(value)||0)/Math.max(1,Number(max)||1)*100);
    const fill=document.createElement('div');fill.className=`meter-fill ${kind==='HP'?(pct<=30?'critical':pct<=60?'low':''):kind.toLowerCase()}`;fill.style.width=`${pct}%`;
    track.append(fill);
    const label=document.createElement('span');label.className='meter-value';label.textContent=`${fmt(value)}/${fmt(max)}`;
    meter.append(title,track,label);meters.append(meter);
  }
  item.append(role,details,meters);root.append(item);
}
function addAction(row,root){
  const state=String(row?.state||'WAITING').toUpperCase();
  const action=document.createElement('div');action.className=`action ${state.toLowerCase()}`;
  const actor=document.createElement('span');actor.className='actor';actor.textContent=String(row?.name||'Adventurer');actor.title=actor.textContent;
  const img=document.createElement('img');img.className='action-icon';img.width=31;img.height=31;
  const kind=String(row?.action_kind||'').toLowerCase();
  img.src=iconPath(ACTION_ICONS[kind]|| (state==='KO'?'24_heartbreak':state==='RESTRAINED'?'52_stonebind':'23_marked'));img.alt='';
  const main=document.createElement('div');main.className='action-main';
  const label=document.createElement('span');label.className='action-label';label.textContent=String(row?.action||({KO:'Unable to act',RESTRAINED:'Awaiting rescue',JOINED:'Rallying'}[state]||'Awaiting action'));
  const target=document.createElement('span');target.className='action-target';target.textContent=row?.target?`→ ${row.target}`:(state==='READY'?'Queued for next round':state==='WAITING'?'No action queued':state==='JOINED'?'Waiting for combat':'');
  main.append(label,target);
  const badge=document.createElement('span');badge.className=`action-state ${state.toLowerCase()}`;badge.textContent=state==='RESTRAINED'?'BOUND':state;
  action.append(actor,img,main,badge);root.append(action);
}
function renderParty(s){
  const roster=$('roster'),actions=$('action-list');roster.replaceChildren();actions.replaceChildren();
  if(!Array.isArray(s.members)){
    page=0;
    const message=Number(s.raiders)>0?'Joined member details require the updated Raid Bot.':'Waiting for raiders to join.';
    for(const root of [roster,actions]){const empty=document.createElement('div');empty.className='empty';empty.textContent=message;root.append(empty)}
    $('member-page').textContent=`${fmt(s.raiders)} joined`;$('action-page').textContent='No public action details';return;
  }
  const members=s.members;const pages=Math.max(1,Math.ceil(members.length/8));page=page%pages;
  const visible=members.slice(page*8,page*8+8);
  const totalJoined=Math.max(members.length,Number(s.raiders)||0);
  $('member-page').textContent=`${members.length?`${page*8+1}–${page*8+visible.length} / `:''}${members.length}${totalJoined>members.length?` shown · ${totalJoined}`:''} joined${pages>1?` · ${page+1}/${pages}`:''}`;
  $('action-page').textContent=`${fmt(s.ready_actions)} / ${fmt(s.actionable_raiders)} ready${pages>1?` · ${page+1}/${pages}`:''}`;
  if(!visible.length){for(const root of [roster,actions]){const empty=document.createElement('div');empty.className='empty';empty.textContent='Awaiting raid participants';root.append(empty)}return}
  visible.forEach(member=>{addMember(member,roster);addAction(member,actions)});
}
function mechanicText(m){
  if(!m||!m.name)return 'Awaiting next telegraph';
  return String(m.name).slice(0,120);
}
function mechanicHint(m){
  if(m?.warning)return String(m.warning).slice(0,160);
  if(m?.result)return `Last result: ${String(m.result).replace(/_/g,' ').slice(0,80)}`;
  return MECHANIC_HINT[String(m?.kind||'')]||'Watch for the boss’s next move.';
}
function renderMechanic(s){
  const isRally=safeStatus(s.status)==='RALLY';
  const selected=s.mechanic?.name?s.mechanic:(s.last_mechanic?.name?s.last_mechanic:null);
  const isLast=!s.mechanic?.name&&Boolean(s.last_mechanic?.name);
  const kind=isRally?'standard':String(selected?.kind||'standard');
  const telegraph=$('telegraph');telegraph.dataset.kind=kind;
  $('mechanic-icon').src=iconPath(MECHANIC_ICON[kind]||'70_raid_mechanic_warning');
  $('mechanic-type').textContent=isRally?'RALLY':isLast?'LAST RESOLVED':MECHANIC_KIND[kind]||'INCOMING';
  $('mechanic').textContent=isRally?'RAID RALLY OPEN':mechanicText(selected);
  $('mechanic-warning').textContent=isRally?'Join the raid before combat begins.':mechanicHint(selected);
  const target=selected?.target|| (kind==='raidwide'?'Entire party':'');
  $('target-row').hidden=isRally||!target;$('target').textContent=target?String(target).slice(0,110):'—';
  const progress=Number(selected?.progress)||0,required=Number(selected?.required)||0;
  $('progress-row').hidden=!(required>0);$('progress-track').hidden=!(required>0);
  $('mechanic-progress').textContent=`${fmt(progress)} / ${fmt(required)}`;
  $('progress-bar').style.width=`${required?clamp(progress/required*100):0}%`;
  renderStatuses($('boss-statuses'),s.boss_statuses);
}
function renderStatus(s){
  const raw=safeStatus(s.status);
  const state=raw==='COMBAT'?'ACTIVE':raw;
  wrap.dataset.state=state;
  wrap.classList.toggle('enraged',Boolean(s.enraged)&&state==='ACTIVE');
  $('state').textContent=s.enraged&&state==='ACTIVE'?'ENRAGED':state==='WIPE'?'RAID WIPE':state;
  $('boss').textContent=String(s.boss||'Raid encounter');
  $('encounter').textContent=String(s.encounter_name||s.encounter_type||'Raid');
  $('tier').textContent=String(s.tier||s.encounter_type||'Raid');
  $('phase').textContent=String(s.phase||'Battle');
  $('round').textContent=`ROUND ${fmt(s.round)}`;
  $('raiders').textContent=`${fmt(s.alive)} / ${fmt(s.raiders)} STANDING`;
  const art=bossArtPath(s.boss);
  $('boss-art').style.backgroundImage=art?`linear-gradient(0deg,#080d20a9,transparent 60%),url("${art}")`:'';
  $('boss-art').setAttribute('aria-label',`Boss illustration: ${String(s.boss||'Raid boss')}`);
  const hp=Number(s.hp)||0,maxHp=Math.max(1,Number(s.max_hp)||1),hpPct=clamp(hp/maxHp*100);
  $('hpbar').style.width=`${hpPct}%`;
  $('hp').textContent=`${fmt(hp)} / ${fmt(maxHp)} · ${Math.round(hpPct)}%`;
  wrap.classList.toggle('critical',state==='ACTIVE'&&hpPct>0&&hpPct<=25);
  const summon=clamp(s.summon_gauge);$('summonbar').style.width=`${summon}%`;$('summon').textContent=`${Math.round(summon)}%`;
  $('ready').textContent=`${fmt(s.ready_actions)} / ${fmt(s.actionable_raiders)}`;
  const enraged=Boolean(s.enraged),toEnrage=s.rounds_to_enrage;
  $('enrage-row').hidden=!enraged&&toEnrage==null;
  $('enrage').textContent=enraged?'ENRAGED':`${fmt(toEnrage)} ROUNDS`;
  renderMechanic(s);renderParty(s);renderAdds(s.adds);renderLeaders(s.top);
  updateCountdown();
}
function updateCountdown(){
  if(!lastState)return;
  const state=safeStatus(lastState.status);
  const at=state==='RALLY'?Number(lastState.rally_closes_at)||0:Number(lastState.next_round_at)||0;
  $('timer-label').textContent=state==='RALLY'?'JOIN CLOSES':state==='VICTORY'||state==='WIPE'?'RESULT':'NEXT ROUND';
  if(state==='VICTORY'||state==='WIPE'){$('countdown').textContent='FINISHED';return}
  if(!at){$('countdown').textContent='—';return}
  const seconds=Math.max(0,Math.ceil(at-Date.now()/1000));
  $('countdown').textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
  $('countdown').classList.toggle('urgent',seconds<=10);
}
function outcomeVisible(s){return ['VICTORY','WIPE'].includes(safeStatus(s.status))&&Date.now()/1000-Number(s.updated_at||0)<=22}
function render(s){
  if(!s||!s.available){hide();return}
  const synced=Number(s.synced_at)||0;
  if(synced&&Date.now()/1000-synced>120){hide();return}
  if(!s.active&&!outcomeVisible(s)){hide();return}
  lastState=s;wrap.style.display='grid';fitOverlay();renderStatus(s);
}
async function refresh(){
  if(refreshing){refreshQueued=true;return}
  refreshing=true;
  const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),8000);
  try{
    const response=await fetch('/api/overlay/state',{cache:'no-store',signal:abort.signal});
    if(!response.ok)throw Error(`HTTP ${response.status}`);
    const s=await response.json();lastSuccessfulAt=Date.now();render(s);
  }catch(e){
    // Brief network gaps should not make the stream overlay flicker off.
    if(!lastState||Date.now()-lastSuccessfulAt>120000)hide();
    else $('state').textContent='SYNC DELAY';
  }finally{clearTimeout(timeout);refreshing=false;if(refreshQueued){refreshQueued=false;queueRefresh()}}
}
let refreshTimer=0;
function queueRefresh(){if(refreshTimer)return;refreshTimer=setTimeout(()=>{refreshTimer=0;refresh()},120)}
function noteEvent(){lastEventAt=Date.now()}
function streamFresh(){return Boolean(eventSource&&eventSource.readyState===EventSource.OPEN&&lastEventAt&&Date.now()-lastEventAt<50000)}
function connectEvents(){
  if(!('EventSource' in window))return;
  eventSource=new EventSource('/api/events');
  eventSource.addEventListener('open',noteEvent);
  eventSource.addEventListener('ready',noteEvent);
  eventSource.addEventListener('heartbeat',noteEvent);
  eventSource.addEventListener('refresh',()=>{noteEvent();queueRefresh()});
  eventSource.onerror=()=>{};
}
function demoData(){
  const members=['Van','Mira','Rook','Sylvie','Aeris','Kain','Terra','Locke','Cecil','Freya'].map((name,i)=>({
    name,role:['Tank','Healer','DPS','Support'][i%4],job:['Paladin','White Mage','Dragoon','Bard'][i%4],
    hp:780-i*46,max_hp:950-i*30,resource:i%4===0?'AP':'MP',resource_value:48+i*3,resource_max:100,
    state:i===7?'KO':i===6?'WAITING':'READY',action:['Defend','Cure II','Jump','Battle Hymn'][i%4],
    action_kind:['defend','ability','ability','ability'][i%4],target:i%4===1?'Van':'Ifrit',
    statuses:i===0?[{id:'protect',turns:3},{id:'regen',turns:2}]:i===2?[{id:'burn',turns:2}]:[],
  }));
  return {available:true,active:true,status:'COMBAT',boss:'Ifrit',encounter_type:'Trial',encounter_name:'Inferno Crucible',tier:'Primal Boss',hp:72800,max_hp:100000,phase:'Flameborn',round:4,raiders:members.length,alive:9,
    ready_actions:7,actionable_raiders:9,summon_gauge:68,enraged:false,rounds_to_enrage:5,
    mechanic:{name:'Radiant Plume',kind:'raidwide',warning:'Party-wide fire strike · prepare defenses',target:'Entire party',rounds_remaining:1},
    boss_statuses:[{id:'vulnerable',turns:2}],next_round_at:Date.now()/1000+47,updated_at:Date.now()/1000,synced_at:Date.now()/1000,
    members,adds:[{name:'Infernal Nail',hp:5000,max_hp:12000}],top:[{name:'Van',score:9100},{name:'Mira',score:6800},{name:'Rook',score:5300}]};
}
if(new URLSearchParams(location.search).get('preview')==='1'){
  lastSuccessfulAt=Date.now();render(demoData());
}else{
  connectEvents();refresh();
  setInterval(()=>{if(document.visibilityState==='visible'&&!streamFresh())refresh()},60000);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&!streamFresh())queueRefresh()});
}
setInterval(()=>{
  if(lastState){updateCountdown();if(!lastState.active&&!outcomeVisible(lastState))hide()}
},1000);
setInterval(()=>{if(lastState&&Array.isArray(lastState.members)&&lastState.members.length>8){page=(page+1)%Math.ceil(lastState.members.length/8);renderParty(lastState)}},9000);
