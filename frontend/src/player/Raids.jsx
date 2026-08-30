import { useEffect, useMemo, useState } from "react";
import { getJson } from "../api/client.js";
import ProgressBar from "../components/ProgressBar.jsx";
import CollapsePointer from "../components/CollapsePointer.jsx";
import { toggleWithViewportAnchor } from "../utils/viewportAnchor.js";
import { duration, number, pct } from "../utils/formatters.js";

const FEATURED_TRIALS = [
  { name: "Ifrit", encounter: "Inferno Crucible", level: 25, hp: 18000, art: "/retro-phase-ii/boss-art-v1/ifrit.webp", summary: <>Read Incinerate and Radiant Plume, then break <strong>Infernal Nails</strong> before <strong>Hellfire</strong>.</> },
  { name: "Shiva", encounter: "Diamond Throne", level: 25, hp: 18000, art: "/retro-phase-ii/boss-art-v1/shiva.webp", summary: <>Shatter <strong>Icebound Mirrors</strong>, fill <strong>Diamond Aegis</strong>'s Break gauge, then punish Shiva during <strong>Stagger</strong>.</> },
  { name: "Ramuh", encounter: "Judgment Spire", level: 28, hp: 20000, art: "/retro-phase-ii/boss-art-v1/ramuh.webp", summary: <>Read <strong>Rolling Thunder</strong>, stack for <strong>Levinshare</strong>, then build <strong>Judgment Charge</strong> with coordinated Defends.</> },
  { name: "Titan", encounter: "Heart of the Crag", level: 32, hp: 26000, art: "/retro-phase-ii/boss-art-v1/titan.webp", summary: <>Brace for <strong>Landslide</strong>, rescue allies from <strong>Granite Gaol</strong>, then destroy the <strong>Heart of the Crag</strong> before Earthen Fury.</> },
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
  if (["damage_check", "break_check", "guard_check", "heart_check"].includes(mechanic.kind)) return `${mechanic.name}: ${number(mechanic.progress || 0)} / ${number(mechanic.required || 0)} · ${number(mechanic.rounds_remaining || 0)} round${Number(mechanic.rounds_remaining || 0) === 1 ? "" : "s"} remaining.`;
  return mechanic.warning || mechanic.name;
}

export default function Raids() {
  const [state, setState] = useState(null);
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
      try { const payload = await getJson(`/api/overlay/state?ts=${Date.now()}`, { timeoutMs: 7000 }); if (!cancelled) setState(payload); }
      catch { if (!cancelled) setState((previous) => previous || { available: false, active: false, status: "IDLE" }); }
    };
    refresh(); const poll = window.setInterval(refresh, 2500); const clock = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { cancelled = true; window.clearInterval(poll); window.clearInterval(clock); };
  }, []);
  const active = Boolean(state?.available && state?.active);
  const nextRound = useMemo(() => Math.max(0, Number(state?.next_round_at || 0) - Math.floor(now / 1000)), [state?.next_round_at, now]);
  const leaders = Array.isArray(state?.top) ? state.top.slice(0, 5) : [];
  const adds = Array.isArray(state?.adds) ? state.adds.slice(0, 4) : [];
  const toggleBoard = (event) => {
    const next = !boardOpen;
    toggleWithViewportAnchor(event.currentTarget, () => setBoardOpen(next));
    try { window.localStorage?.setItem("crystal-guild:adventure:trial-raid-board", next ? "open" : "closed"); } catch {}
  };

  return <section className={`panel raid-board-panel ${active ? "active" : "idle"}`} aria-labelledby="raid-board-title">
    <div className="panel-title-row raid-board-title-row"><div><p className="eyebrow">Trails &amp; Raids · Alpha 4</p><h2 id="raid-board-title">Trial &amp; Raid Board</h2><p className="muted">Read telegraphs, coordinate stacks and Defends, rescue restrained allies, handle adds/Break checks, and compare role-aware contribution.</p></div><div className="raid-board-title-actions"><span className={`small-badge ${active ? "success" : ""}`}>{active ? String(state?.status || "ACTIVE") : "Standby"}</span><button type="button" className="section-collapse-button raid-board-collapse-toggle" aria-expanded={boardOpen} aria-label={boardOpen ? "Collapse Trial & Raid Board" : "Expand Trial & Raid Board"} title={boardOpen ? "Collapse Trial & Raid Board" : "Expand Trial & Raid Board"} onClick={toggleBoard}><CollapsePointer open={boardOpen} /></button></div></div>
    {boardOpen ? (active ? <div className="raid-board-live" aria-live="polite">
      <div className="raid-board-boss-row"><div><span>{state?.encounter_type || state?.tier || "Raid"}</span><strong>{state?.boss || "Raid Boss"}</strong><small>{state?.encounter_name && state.encounter_name !== state.boss ? state.encounter_name : state?.phase || "Battle"}</small></div><div className="raid-board-round"><span>Round {number(state?.round || 0)}</span><strong>{nextRound > 0 ? duration(nextRound) : "Resolving"}</strong><small>{state?.phase || "Battle"}</small></div></div>
      <div className="raid-board-vitals"><div className="raid-board-vital-copy"><span>Boss HP</span><strong>{number(state?.hp || 0)} / {number(state?.max_hp || 0)}</strong></div><ProgressBar value={pct(state?.hp, state?.max_hp)} className="hp" /><div className="raid-board-vital-meta"><span>{number(state?.alive || 0)} / {number(state?.raiders || 0)} raiders standing</span><span>Summon {number(state?.summon_gauge || 0)}%</span></div></div>
      {adds.length ? <div className="raid-add-grid" aria-label="Active raid adds">{adds.map((add,index)=><div className="raid-add-card" key={`${add?.name || "add"}:${index}`}><div><strong>{add?.name || "Raid Add"}</strong><span>{number(add?.hp || 0)} / {number(add?.max_hp || 0)} HP</span></div><ProgressBar value={pct(add?.hp, add?.max_hp)} className="hp" /></div>)}</div> : null}
      <div className={`raid-mechanic-callout ${state?.mechanic?.kind || "none"}`}><span>{state?.mechanic?.kind === "break_check" ? "Break Gauge" : state?.mechanic?.kind === "guard_check" ? "Grounding Gauge" : state?.mechanic?.kind === "heart_check" ? "Heart Check" : state?.mechanic?.kind === "restraint" ? "Rescue" : "Current Telegraph"}</span><strong>{state?.mechanic?.name || "Standard boss pressure"}</strong><small>{mechanicCopy(state?.mechanic)}</small></div>
      <div className="raid-board-contributions"><div className="raid-board-section-head"><span>Contribution</span><small>Role shown · score still uses damage + weighted healing + mitigation</small></div>{leaders.length ? <div className="raid-contribution-grid">{leaders.map((entry,index)=><div className="raid-contribution-row" key={`${entry?.name || "raider"}:${index}`}><b>#{index+1}</b><strong>{entry?.name || "Adventurer"} <em>{entry?.role || "DPS"}</em></strong><span>{number(entry?.score || 0)} pts</span><small>{number(entry?.damage || 0)} dmg · {number(entry?.healing || 0)} heal · {number(entry?.mitigation || 0)} mit</small></div>)}</div> : <p className="muted raid-board-empty">Contribution standings appear once combat begins.</p>}</div>
    </div> : <div className="raid-featured-trials">{FEATURED_TRIALS.map(trial=><div className="raid-featured-trial" key={trial.name}><div className="raid-featured-art" aria-hidden="true"><img src={trial.art} alt="" loading="lazy" decoding="async" /></div><div className="raid-featured-copy"><span className="slot-label">Flagship Trial · Recommended Lv.{trial.level}</span><h3>{trial.name} — {trial.encounter}</h3><p>{trial.summary}</p><div className="raid-featured-stats"><span><b>{number(trial.hp)}</b> HP</span><span><b>90s</b> rally</span><span><b>60s</b> rounds</span></div><p className="muted">Streamer: <code>!spawnboss {trial.name.toLowerCase()}</code> · Raiders: <code>!raid</code></p></div></div>)}</div>) : null}
  </section>;
}
