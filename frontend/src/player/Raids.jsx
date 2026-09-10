import { useEffect, useMemo, useState } from "react";
import { getJson } from "../api/client.js";
import ProgressBar from "../components/ProgressBar.jsx";
import CollapsePointer from "../components/CollapsePointer.jsx";
import { toggleWithViewportAnchor } from "../utils/viewportAnchor.js";
import { duration, number, pct } from "../utils/formatters.js";

const FEATURED_TRIALS = [
  { id: "ifrit", name: "Ifrit", encounter: "Inferno Crucible", level: 25, hp: 18000, art: "/retro-phase-ii/boss-art-v1/ifrit.webp", summary: <>Read Incinerate and Radiant Plume, then break <strong>Infernal Nails</strong> before <strong>Hellfire</strong>.</> },
  { id: "shiva", name: "Shiva", encounter: "Diamond Throne", level: 25, hp: 18000, art: "/retro-phase-ii/boss-art-v1/shiva.webp", summary: <>Shatter <strong>Icebound Mirrors</strong>, fill <strong>Diamond Aegis</strong>'s Break gauge, then punish Shiva during <strong>Stagger</strong>.</> },
  { id: "ramuh", name: "Ramuh", encounter: "Judgment Spire", level: 28, hp: 20000, art: "/retro-phase-ii/boss-art-v1/ramuh.webp", summary: <>Read <strong>Rolling Thunder</strong>, stack for <strong>Levinshare</strong>, then build <strong>Judgment Charge</strong> with coordinated Defends.</> },
  { id: "titan", name: "Titan", encounter: "Heart of the Crag", level: 32, hp: 26000, art: "/retro-phase-ii/boss-art-v1/titan.webp", summary: <>Brace for <strong>Landslide</strong>, rescue allies from <strong>Granite Gaol</strong>, then destroy the <strong>Heart of the Crag</strong> before Earthen Fury.</> },
  { id: "garuda_prime", name: "Garuda", spawnId: "garuda", encounter: "Eye of the Storm", level: 30, hp: 22000, art: "/retro-phase-ii/boss-art-v1/garuda_prime.webp", summary: <>Brace through <strong>Slipstream</strong>, contain <strong>Friction</strong>, then shatter <strong>Satin &amp; Razor Plumes</strong> before Aerial Blast.</> },
  { id: "leviathan", name: "Leviathan", encounter: "Tidebreak Expanse", level: 35, hp: 29000, art: "/retro-phase-ii/boss-art-v1/leviathan.webp", summary: <>Brace the marked side through <strong>Tidal Sweep</strong>, resist <strong>Undertow</strong>, then coordinate Defends through <strong>Maelstrom Surge</strong> to weaken Tidal Wave.</> },
  { id: "bahamut", name: "Bahamut", encounter: "The Final Coil", level: 65, hp: 95000, art: "/retro-phase-ii/boss-art-v1/bahamut.webp", capstone: true, summary: <>Survive <strong>Flare Breath</strong>, stack for <strong>Akh Morn</strong>, soak <strong>Megaflare Towers</strong>, then break the final <strong>Teraflare Charge</strong>.</> },
];

function mechanicCopy(mechanic) {
  if (!mechanic?.name) return "No special mechanic is currently telegraphed.";
  if (mechanic.kind === "targeted") return `${mechanic.name} targets ${mechanic.target || "one raider"}. Defend or prepare support.`;
  if (mechanic.kind === "cleave") return `${mechanic.name} marks ${mechanic.target || "one raider"}; a second raider may also be struck.`;
  if (mechanic.kind === "raidwide") return `${mechanic.name} is raidwide. Prepare mitigation and recovery.`;
  if (mechanic.kind === "adds") return `${mechanic.name}: destroy the active adds; boss-directed damage is intercepted while they remain.`;
  if (mechanic.kind === "stagger") return `${mechanic.name}: the boss is vulnerable and cannot answer the next round.`;
  if (mechanic.kind === "chain") return `${mechanic.name} starts on ${mechanic.target || "one raider"} and chains through the party.`;
  if (mechanic.kind === "shared_hit") return `${mechanic.name} targets ${mechanic.target || "one raider"}; Defending allies join the stack and split the pressure.`;
  if (mechanic.kind === "knockback") return `${mechanic.name} targets ${mechanic.target || "one raider"}; Defend to brace against knockdown.`;
  if (mechanic.kind === "restraint") return `${mechanic.name} traps ${mechanic.target || "one raider"}; boss-directed damage breaks the prison and frees them.`;
  if (mechanic.kind === "wind_pressure") return `${mechanic.name} targets ${mechanic.target || "one raider"}; Defend to brace against the focused gale.`;
  if (mechanic.kind === "wind_mark") return `${mechanic.name} marks ${mechanic.target || "one raider"}; Defend to contain the pressure before it splashes the raid.`;
  if (mechanic.kind === "side_sweep") return `${mechanic.name} marks ${mechanic.target || "one side of the raid"}; marked raiders Defend to brace the sweep.`;
  if (mechanic.kind === "undertow") return `${mechanic.name} pulls ${mechanic.target || "one raider"} under; Defend to protect HP and resources.`;
  if (mechanic.kind === "tower_check") return `${mechanic.name}: ${number(mechanic.progress || 0)} / ${number(mechanic.required || 0)} Defends required this round.`;
  if (mechanic.kind === "final_damage_check") return `${mechanic.name}: ${number(mechanic.progress || 0)} / ${number(mechanic.required || 0)} damage · ${number(mechanic.rounds_remaining || 0)} rounds remaining.`;
  if (mechanic.kind === "survival_check") return `${mechanic.name}: ${number(mechanic.progress || 0)} / ${number(mechanic.required || 0)} Defends · ${number(mechanic.rounds_remaining || 0)} round${Number(mechanic.rounds_remaining || 0) === 1 ? "" : "s"} remaining.`;
  if (["damage_check", "break_check", "guard_check", "heart_check"].includes(mechanic.kind)) return `${mechanic.name}: ${number(mechanic.progress || 0)} / ${number(mechanic.required || 0)} · ${number(mechanic.rounds_remaining || 0)} round${Number(mechanic.rounds_remaining || 0) === 1 ? "" : "s"} remaining.`;
  return mechanic.warning || mechanic.name;
}

function repeatMastery(record) {
  const clears = Number(record?.clears || 0);
  if (clears >= 10) return { label: "Mastered", next: null };
  if (clears >= 5) return { label: "Veteran", next: 10 };
  if (clears >= 3) return { label: "Seasoned", next: 5 };
  if (clears >= 1) return { label: "Proven", next: 3 };
  return { label: "Uncleared", next: 1 };
}

export default function Raids({ username = "" }) {
  const [state, setState] = useState(null);
  const [recordData, setRecordData] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [boardOpen, setBoardOpen] = useState(() => {
    try {
      const stored = window.localStorage?.getItem("crystal-guild:adventure:trial-raid-board");
      if (stored === "open") return true;
      if (stored === "closed") return false;
      return !window.matchMedia?.("(max-width: 760px)")?.matches;
    } catch { return true; }
  });
  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      try { const payload = await getJson(`/api/overlay/state`, { timeoutMs: 7000 }); if (!cancelled) setState(payload); }
      catch { if (!cancelled) setState((previous) => previous || { available: false, active: false, status: "IDLE" }); }
    };
    refresh(); const poll = window.setInterval(refresh, 60000); const clock = window.setInterval(() => setNow(Date.now()), 1000);
    window.addEventListener("crystal-guild-live-revision", refresh);
    window.addEventListener("focus", refresh);
    return () => { cancelled = true; window.clearInterval(poll); window.clearInterval(clock); window.removeEventListener("crystal-guild-live-revision", refresh); window.removeEventListener("focus", refresh); };
  }, []);
  useEffect(() => {
    if (!username) { setRecordData(null); return undefined; }
    let cancelled = false;
    const refreshRecords = async () => {
      try {
        const payload = await getJson(`/api/player/${encodeURIComponent(username)}/records`, { timeoutMs: 7000 });
        if (!cancelled) setRecordData(payload);
      } catch {
        if (!cancelled) setRecordData((previous) => previous || null);
      }
    };
    refreshRecords();
    const poll = window.setInterval(refreshRecords, 120000);
    window.addEventListener("crystal-guild-live-revision", refreshRecords);
    return () => { cancelled = true; window.clearInterval(poll); window.removeEventListener("crystal-guild-live-revision", refreshRecords); };
  }, [username]);
  const active = Boolean(state?.available && state?.active);
  const finalStatus = String(state?.status || "").toUpperCase();
  const recentResult = Boolean(state?.available && !active && state?.boss && ["VICTORY", "WIPE"].includes(finalStatus));
  const statusLabel = active ? String(state?.status || "ACTIVE") : recentResult ? finalStatus : "Standby";
  const nextRound = useMemo(() => Math.max(0, Number(state?.next_round_at || 0) - Math.floor(now / 1000)), [state?.next_round_at, now]);
  const leaders = Array.isArray(state?.top) ? state.top.slice(0, 5) : [];
  const adds = Array.isArray(state?.adds) ? state.adds.slice(0, 4) : [];
  const trialSummary = recordData?.trial_summary || null;
  const trialRecords = useMemo(() => new Map((Array.isArray(recordData?.trials) ? recordData.trials : []).map((row) => [row.id, row])), [recordData?.trials]);
  const toggleBoard = (event) => {
    const next = !boardOpen;
    toggleWithViewportAnchor(event.currentTarget, () => setBoardOpen(next));
    try { window.localStorage?.setItem("crystal-guild:adventure:trial-raid-board", next ? "open" : "closed"); } catch {}
  };

  return <section className={`panel raid-board-panel ${active ? "active" : "idle"} ${boardOpen ? "open" : "collapsed"}`} aria-labelledby="raid-board-title">
    <img loading="lazy" className={`panel-scenic-art raid-board-scenic-art ${boardOpen ? "open" : "collapsed"}`} src={boardOpen ? "/trails-raids/h4/trial-board-open.webp" : "/trails-raids/h4/trial-board-collapsed.webp"} alt="" aria-hidden="true" decoding="async" />
    <div className="panel-title-row raid-board-title-row"><div><p className="eyebrow">Trails &amp; Raids</p><h2 id="raid-board-title">Trial &amp; Raid Board</h2><p className="muted">Coordinate each round, review personal Trial progress, and keep the seven flagship encounters readable from pull to settlement.</p></div><div className="raid-board-title-actions"><span className={`small-badge ${active || finalStatus === "VICTORY" ? "success" : finalStatus === "WIPE" ? "danger" : ""}`}>{statusLabel}</span><button type="button" className="section-collapse-button raid-board-collapse-toggle" aria-expanded={boardOpen} aria-label={boardOpen ? "Collapse Trial & Raid Board" : "Expand Trial & Raid Board"} title={boardOpen ? "Collapse Trial & Raid Board" : "Expand Trial & Raid Board"} onClick={toggleBoard}><CollapsePointer open={boardOpen} /></button></div></div>
    {boardOpen ? (active ? <div className="raid-board-live" aria-live="polite">
      <div className="raid-board-boss-row"><div><span>{state?.encounter_type || state?.tier || "Raid"}</span><strong>{state?.boss || "Raid Boss"}</strong><small>{state?.encounter_name && state.encounter_name !== state.boss ? state.encounter_name : state?.phase || "Battle"}</small></div><div className="raid-board-round"><span>Round {number(state?.round || 0)}</span><strong>{nextRound > 0 ? duration(nextRound) : "Resolving"}</strong><small>{state?.phase || "Battle"}</small></div></div>
      <div className="raid-board-vitals"><div className="raid-board-vital-copy"><span>Boss HP</span><strong>{number(state?.hp || 0)} / {number(state?.max_hp || 0)}</strong></div><ProgressBar value={pct(state?.hp, state?.max_hp)} className="hp" /><div className="raid-board-vital-meta"><span>{number(state?.alive || 0)} / {number(state?.raiders || 0)} raiders standing</span><span>Actions {number(state?.ready_actions || 0)} / {number(state?.actionable_raiders || 0)} queued</span><span>Summon {number(state?.summon_gauge || 0)}%</span></div></div>
      <div className="raid-readiness-strip" aria-label="Raid round readiness"><div><span>Round Readiness</span><strong>{number(state?.ready_actions || 0)} / {number(state?.actionable_raiders || 0)} queued</strong><small>{Math.max(0, Number(state?.actionable_raiders || 0) - Number(state?.ready_actions || 0)) ? `${number(Math.max(0, Number(state?.actionable_raiders || 0) - Number(state?.ready_actions || 0)))} waiting` : "All actionable raiders ready"}</small></div><ProgressBar value={pct(state?.ready_actions, state?.actionable_raiders)} /></div>
      {adds.length ? <div className="raid-add-grid" aria-label="Active raid adds">{adds.map((add,index)=><div className="raid-add-card" key={`${add?.name || "add"}:${index}`}><div><strong>{add?.name || "Raid Add"}</strong><span>{number(add?.hp || 0)} / {number(add?.max_hp || 0)} HP</span></div><ProgressBar value={pct(add?.hp, add?.max_hp)} className="hp" /></div>)}</div> : null}
      <div className={`raid-mechanic-callout ${state?.mechanic?.kind || "none"}`}><span>{state?.mechanic?.kind === "break_check" ? "Break Gauge" : state?.mechanic?.kind === "guard_check" ? "Grounding Gauge" : state?.mechanic?.kind === "heart_check" ? "Heart Check" : state?.mechanic?.kind === "restraint" ? "Rescue" : state?.mechanic?.kind === "tower_check" ? "Tower Check" : state?.mechanic?.kind === "final_damage_check" ? "Final Damage Check" : state?.mechanic?.kind === "survival_check" ? "Stability Gauge" : state?.mechanic?.kind === "side_sweep" ? "Side Pressure" : state?.mechanic?.kind === "undertow" ? "Undertow" : "Current Telegraph"}</span><strong>{state?.mechanic?.name || "Standard boss pressure"}</strong><small>{mechanicCopy(state?.mechanic)}</small></div>
      <div className="raid-board-contributions"><div className="raid-board-section-head"><span>Contribution</span><small>Role shown · score still uses damage + weighted healing + mitigation</small></div>{leaders.length ? <div className="raid-contribution-grid">{leaders.map((entry,index)=><div className="raid-contribution-row" key={`${entry?.name || "raider"}:${index}`}><b>#{index+1}</b><strong>{entry?.name || "Adventurer"} <em>{entry?.role || "DPS"}</em></strong><span>{number(entry?.score || 0)} pts</span><small>{number(entry?.damage || 0)} dmg · {number(entry?.healing || 0)} heal · {number(entry?.mitigation || 0)} mit</small></div>)}</div> : <p className="muted raid-board-empty">Contribution standings appear once combat begins.</p>}</div>
    </div> : <div className="raid-board-idle-content">
      {recentResult ? <div className={`raid-last-result ${finalStatus === "VICTORY" ? "victory" : "wipe"}`} aria-label="Last Trial result">
        <div className="raid-last-result-head"><div><span className="slot-label">Last Trial Result</span><strong>{state?.boss || "Trial"}{state?.encounter_name && state.encounter_name !== state.boss ? ` — ${state.encounter_name}` : ""}</strong></div><span className={`small-badge ${finalStatus === "VICTORY" ? "success" : "danger"}`}>{finalStatus}</span></div>
        <div className="raid-last-result-meta"><span><b>R{number(state?.round || 0)}</b><small>Rounds</small></span><span><b>{number(state?.alive || 0)} / {number(state?.raiders || 0)}</b><small>Standing</small></span><span><b>{state?.last_mechanic?.name || "—"}</b><small>Last Mechanic</small></span></div>
        {leaders.length ? <div className="raid-last-result-leaders" aria-label="Last Trial contribution leaders">{leaders.slice(0,3).map((entry,index)=><span key={`${entry?.name || "raider"}:${index}`}><b>#{index+1} {entry?.name || "Adventurer"}</b><small>{number(entry?.score || 0)} pts · {entry?.role || "DPS"}</small><em>{number(entry?.damage || 0)} dmg · {number(entry?.healing || 0)} heal · {number(entry?.mitigation || 0)} mit</em></span>)}</div> : null}
      </div> : null}
      <div className="raid-trial-chronicle" aria-label="Trial Chronicle summary">
        <div><span className="slot-label">Trial Chronicle</span><strong>{trialSummary?.rank || "Unproven"}</strong><small>{number(trialSummary?.unique_clears || 0)} / {number(trialSummary?.total_trials || FEATURED_TRIALS.length)} unique clears</small></div>
        <div><span>Lifetime Clears</span><strong>{number(trialSummary?.total_clears || 0)}</strong><small>Existing Alpha clears preserved</small></div>
        <div><span>Tracked Wipes</span><strong>{number(trialSummary?.tracked_wipes || 0)}</strong><small>Tracked from Beta 1 onward</small></div>
        <div><span>Repeat Mastery</span><strong>{number(trialSummary?.mastered_trials || 0)} mastered</strong><small>10 clears masters a Trial</small></div>
      </div>
      <div className="raid-featured-trials">{FEATURED_TRIALS.map(trial=>{const record=trialRecords.get(trial.id);return <article className={`raid-featured-trial ${trial.capstone ? "capstone" : ""}`} key={trial.name}><div className="raid-featured-art" aria-hidden="true"><img src={trial.art} alt="" loading="lazy" decoding="async" /></div><div className="raid-featured-copy"><div className="raid-featured-meta"><span className="slot-label">Flagship Trial</span><span className="small-badge">Recommended Lv. {trial.level}</span></div><h3>{trial.name} — {trial.encounter}</h3><p className="raid-featured-summary">{trial.summary}</p><div className="raid-featured-stats"><span><b>{number(trial.hp)}</b><small>HP</small></span><span><b>90s</b><small>Rally</small></span><span><b>60s</b><small>Rounds</small></span></div><div className={`raid-trial-record ${Number(record?.clears || 0) > 0 ? "cleared" : "uncleared"}`}><div><span>Adventurer Record</span><strong>{Number(record?.clears || 0) > 0 ? `${number(record.clears)} clear${Number(record.clears) === 1 ? "" : "s"}` : "Uncleared"}</strong></div><small>{record?.fastest_clear_rounds ? `Fastest R${number(record.fastest_clear_rounds)} · ` : ""}{record?.best_score ? `Best ${number(record.best_score)} pts · ` : ""}{number(record?.wipes || 0)} tracked wipe{Number(record?.wipes || 0) === 1 ? "" : "s"}</small><div className="raid-repeat-mastery"><span>{repeatMastery(record).label}</span><small>{repeatMastery(record).next ? `${number(record?.clears || 0)} / ${repeatMastery(record).next} clears to next milestone` : "10+ clears · repeat mastery complete"}</small></div></div><div className="raid-featured-commands"><span><small>Streamer</small><code>!spawnboss {trial.spawnId || trial.name.toLowerCase()}</code></span><span><small>Raiders</small><code>!raid</code></span></div></div></article>})}</div>
    </div>) : null}
  </section>;
}
