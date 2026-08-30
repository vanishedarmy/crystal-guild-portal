import { useMemo, useState } from "react";
import {
  submitDungeonStart,
  submitDungeonAction,
  submitDungeonContinue,
  submitDungeonChoice,
  submitDungeonRetreat,
} from "../api/auth.js";
import ProgressBar from "../components/ProgressBar.jsx";
import JobPortrait from "../components/JobPortrait.jsx";
import MonsterPortrait from "../components/MonsterPortrait.jsx";
import { number, pct } from "../utils/formatters.js";
import CollapsePointer from "../components/CollapsePointer.jsx";
import { toggleWithViewportAnchor } from "../utils/viewportAnchor.js";

function defaultOpen(active) {
  if (active) return true;
  try {
    const stored = window.localStorage?.getItem("crystal-guild:adventure:dungeon-board");
    if (stored === "open") return true;
    if (stored === "closed") return false;
    return !window.matchMedia?.("(max-width: 760px)")?.matches;
  } catch {
    return true;
  }
}

function cacheItemCount(cache) {
  return (cache?.items || []).reduce((sum, row) => sum + Number(row?.quantity || 0), 0);
}

function DungeonCache({ cache }) {
  return (
    <div className="expedition-cache-grid dungeon-cache-grid" aria-label="Dungeon Cache">
      <div><span>XP carried</span><strong>{number(cache?.xp || 0)}</strong></div>
      <div><span>JP carried</span><strong>{number(cache?.jp || 0)}</strong></div>
      <div><span>Gil carried</span><strong>{number(cache?.gil || 0)}</strong></div>
      <div><span>Items carried</span><strong>{number(cacheItemCount(cache))}</strong></div>
    </div>
  );
}

function DungeonHistory({ history = [] }) {
  const rows = [...history].slice(-6).reverse();
  if (!rows.length) return null;
  return (
    <div className="expedition-journal dungeon-journal" aria-label="Dungeon progress">
      <div className="expedition-journal-title"><span className="slot-label">Delve Record</span><small>Latest chambers</small></div>
      <div className="expedition-journal-list">
        {rows.map((row, index) => (
          <div key={`${row?.room || 0}:${row?.type || "room"}:${index}`} className="expedition-journal-entry">
            <span>Room {number(row?.room || 0)}</span><strong>{row?.label || "Chamber cleared"}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function DungeonResult({ result, onConfirm, confirming }) {
  const summary = result?.summary || {};
  const rewards = summary?.rewards || {};
  const won = summary?.outcome === "complete";
  return (
    <section className={`panel expedition-result-panel dungeon-result-panel ${won ? "won" : "lost"}`} aria-live="polite">
      <div className="panel-title-row">
        <div><p className="eyebrow">Dungeon Report · Saved</p><h2>{summary?.title || "Dungeon Delve Ended"}</h2><p className="muted">{summary?.dungeon_name || "Dungeon"} · {number(summary?.rooms || 0)} / {number(summary?.room_count || 0)} rooms</p></div>
        <span className={`small-badge ${won ? "success" : ""}`}>{won ? "Cleared" : summary?.outcome === "retreat" ? "Retreated" : "Defeat"}</span>
      </div>
      <div className="expedition-cache-grid">
        <div><span>XP banked</span><strong>+{number(rewards?.xp || 0)}</strong></div>
        <div><span>JP banked</span><strong>+{number(rewards?.jp || 0)}</strong></div>
        <div><span>Gil banked</span><strong>{number(rewards?.gil || 0)}</strong></div>
        <div><span>Loot</span><strong>{number((rewards?.loot || []).length)}</strong></div>
      </div>
      {(rewards?.loot || []).length ? <p className="expedition-loot-line"><strong>Banked:</strong> {rewards.loot.join(" · ")}</p> : null}
      {summary?.first_clear ? <p className="dungeon-first-clear-line"><strong>First Clear Bonus:</strong> {(summary?.first_clear_bonus || []).join(" · ") || "Claimed"}</p> : null}
      {(summary?.discoveries || []).length ? <p className="expedition-loot-line"><strong>Discovered:</strong> {summary.discoveries.join(" · ")}</p> : null}
      <div className="adventure-result-confirmation">
        <div><strong>Saved until you confirm</strong><span>This Dungeon report remains on your Adventure Board across refreshes.</span></div>
        <button type="button" className="equipment-action-button secondary" disabled={Boolean(confirming)} onClick={() => onConfirm?.(result?.result_id)}>{confirming ? "Confirming…" : "Confirm Result"}</button>
      </div>
    </section>
  );
}

export default function Dungeons({
  data,
  csrfToken,
  actionsAvailable,
  busy,
  runRequest,
  pendingResults = [],
  onConfirmResult,
}) {
  const active = data?.active || null;
  const [open, setOpen] = useState(() => defaultOpen(active));
  const [picker, setPicker] = useState("");
  const dungeons = useMemo(() => [...(data?.dungeons || [])].sort((a, b) => Number(a?.min_level || 1) - Number(b?.min_level || 1) || String(a?.name || "").localeCompare(String(b?.name || ""))), [data?.dungeons]);
  const results = pendingResults.filter((row) => row?.kind === "dungeon");
  const combat = active?.combat || null;
  const abilities = (combat?.abilities || []).filter((ability) => ability.usable);
  const items = combat?.items || [];

  const toggleBoard = (event) => {
    const next = !open;
    toggleWithViewportAnchor(event.currentTarget, () => setOpen(next));
    try { window.localStorage?.setItem("crystal-guild:adventure:dungeon-board", next ? "open" : "closed"); } catch {}
  };

  return (
    <>
      {results.map((result) => <DungeonResult key={result.result_id} result={result} onConfirm={onConfirmResult} confirming={busy === `ack-result:${result.result_id}`} />)}
      <section className={`panel dungeon-board-panel ${active ? "dungeon-active" : ""}`}>
        <img className="dungeon-board-background-art" src="/retro-phase-iii/scene-backgrounds-v4/dungeon_board.webp" alt="" aria-hidden="true" draggable="false" />
        <div className="panel-title-row dungeon-board-title-row">
          <div>
            <p className="eyebrow">Dungeons & Delves · Beta 1</p>
            <h2>{active ? active.name : "Dungeon Board"}</h2>
            <p className="muted">Persistent room-by-room adventures. Your HP, MP, and AP carry between chambers.</p>
          </div>
          <button type="button" className="section-collapse-button dungeon-board-collapse-toggle" aria-label={open ? "Collapse Dungeon Board" : "Expand Dungeon Board"} title={open ? "Collapse Dungeon Board" : "Expand Dungeon Board"} aria-expanded={open} onClick={toggleBoard}><CollapsePointer open={open} /></button>
        </div>

        {open ? (
          active ? (
            <div className="dungeon-run-shell">
              {active.art ? <img className="dungeon-run-art" src={active.art} alt="" aria-hidden="true" draggable="false" /> : null}
              <div className="dungeon-room-content">
              <div className="dungeon-room-header">
                <div><span className="slot-label">Room {number(active.room_number)} of {number(active.room_count)} · {active.room?.type_label}</span><h3>{active.room?.name}</h3><p className="muted">{active.room?.description}</p></div>
                <span className={`small-badge ${active.status === "combat" ? "danger" : active.status === "decision" ? "warning" : "success"}`}>{active.status === "combat" ? "In Battle" : active.status === "decision" ? "Choose Route" : "Room Cleared"}</span>
              </div>
              <ProgressBar value={pct(active.room_number, active.room_count)} />
              <DungeonCache cache={active.cache} />
              {active.discoveries?.length ? <div className="dungeon-discovery-strip"><span>Discoveries this delve</span><strong>{active.discoveries.join(" · ")}</strong></div> : null}
              {active.modifiers?.length ? <div className="dungeon-modifier-strip"><span>Route effects ahead</span><strong>{active.modifiers.join(" · ")}</strong></div> : null}

              {active.status === "combat" && combat ? (
                <div className="solo-combat-panel dungeon-combat-panel">
                  <div className="solo-combatant enemy">
                    <div className="solo-enemy-layout">
                      <MonsterPortrait monsterName={combat.enemy?.name} className="solo-enemy-portrait" />
                      <div className="solo-enemy-copy">
                        <div className="solo-combat-head"><div><span>Dungeon Foe</span><h3>{combat.enemy?.name} · Lv.{number(combat.enemy?.level)}</h3></div><span className="small-badge">Round {number(combat.round)} / {number(combat.max_rounds || 12)}</span></div>
                        <div className="vital-label"><span>HP</span><span>{number(combat.enemy?.hp)} / {number(combat.enemy?.max_hp)}</span></div>
                        <ProgressBar value={pct(combat.enemy?.hp, combat.enemy?.max_hp)} className="hp" />
                        <div className="solo-enemy-intent"><span>Enemy intent</span><strong>{combat.enemy?.intent || "Preparing an action"}</strong></div>
                        {combat.enemy?.statuses && combat.enemy.statuses !== "—" ? <small>Status: {combat.enemy.statuses}</small> : null}
                        {combat.route_effects?.length ? <small className="dungeon-combat-route-effects">Route consequence: {combat.route_effects.join(" · ")}</small> : null}
                        {combat.opening_effects?.length ? <small className="dungeon-combat-opening-effects">Opening pressure: {combat.opening_effects.join(" · ")}</small> : null}
                        {combat.mechanics?.length ? <div className="dungeon-mechanic-list"><span>Encounter Rules</span>{combat.mechanics.map((rule) => <strong key={rule}>{rule}</strong>)}</div> : null}
                      </div>
                    </div>
                  </div>
                  <div className="solo-combatant hero character-solo-hero">
                    <div className="solo-hero-layout">
                      <JobPortrait jobName={combat.player?.job_name} className="solo-hero-portrait" />
                      <div className="solo-hero-copy">
                        <div className="solo-combat-head"><div><span>Your Hero</span><h3>{combat.player?.name} · {combat.player?.job_name}</h3></div></div>
                        <div className="vital-label"><span>HP</span><span>{number(combat.player?.hp)} / {number(combat.player?.max_hp)}</span></div><ProgressBar value={pct(combat.player?.hp, combat.player?.max_hp)} className="hp" />
                        {Number(combat.player?.max_mp || 0) > 0 ? <><div className="vital-label"><span>MP</span><span>{number(combat.player?.mp)} / {number(combat.player?.max_mp)}</span></div><ProgressBar value={pct(combat.player?.mp, combat.player?.max_mp)} className="mp" /></> : null}
                        {Number(combat.player?.max_ap || 0) > 0 ? <><div className="vital-label"><span>AP</span><span>{number(combat.player?.ap)} / {number(combat.player?.max_ap)}</span></div><ProgressBar value={pct(combat.player?.ap, combat.player?.max_ap)} className="ap" /></> : null}
                      </div>
                    </div>
                  </div>
                  {active.last_round?.events?.length ? <div className="solo-round-log" aria-live="polite"><strong>Round {number(active.last_round.round)}</strong>{active.last_round.events.map((line, index) => <span key={`${index}:${line}`}>{line}</span>)}</div> : null}
                  <div className="solo-command-bar" aria-label="Dungeon battle actions">
                    <button type="button" className="equipment-action-button" disabled={Boolean(busy)} onClick={() => runRequest("dungeon:attack", "dungeon-action", "attack", (idem) => submitDungeonAction(active.run_id, active.room?.id, active.revision, "attack", csrfToken, idem), "Dungeon round resolved.")}>{busy === "dungeon:attack" ? "Attacking…" : "Attack"}</button>
                    <button type="button" className={`equipment-action-button secondary ${picker === "ability" ? "active" : ""}`} disabled={Boolean(busy)} onClick={() => setPicker(picker === "ability" ? "" : "ability")}>Ability</button>
                    <button type="button" className={`equipment-action-button secondary ${picker === "item" ? "active" : ""}`} disabled={Boolean(busy)} onClick={() => setPicker(picker === "item" ? "" : "item")}>Use Item</button>
                    <button type="button" className="equipment-action-button secondary" disabled={Boolean(busy)} onClick={() => runRequest("dungeon:defend", "dungeon-action", "defend", (idem) => submitDungeonAction(active.run_id, active.room?.id, active.revision, "defend", csrfToken, idem), "Dungeon round resolved.")}>{busy === "dungeon:defend" ? "Defending…" : "Defend"}</button>
                  </div>
                  {picker === "ability" ? <div className="solo-action-picker"><div className="panel-title-row"><div><p className="eyebrow">Battle Abilities</p><h3>Choose an ability</h3></div><button type="button" className="equipment-action-button secondary" onClick={() => setPicker("")}>Close</button></div><div className="solo-action-grid solo-ability-grid">{abilities.length ? abilities.map((ability) => <button key={ability.id} type="button" className="solo-action-option solo-ability-option" disabled={Boolean(busy)} onClick={() => runRequest(`dungeon:ability:${ability.id}`, "dungeon-ability", ability.id, (idem) => submitDungeonAction(active.run_id, active.room?.id, active.revision, `ability:${ability.id}`, csrfToken, idem), `${ability.name} resolved.`)}><strong>{ability.name}</strong><span>{number(ability.cost)} {String(ability.resource || "MP").toUpperCase()}</span></button>) : <p className="muted">No abilities are currently available.</p>}</div></div> : null}
                  {picker === "item" ? <div className="solo-action-picker"><div className="panel-title-row"><div><p className="eyebrow">Battle Inventory</p><h3>Choose an item</h3></div><button type="button" className="equipment-action-button secondary" onClick={() => setPicker("")}>Close</button></div><div className="solo-action-grid">{items.length ? items.map((item) => <button key={item.id} type="button" className="solo-action-option" disabled={Boolean(busy) || !item.usable} title={item.reason || item.description} onClick={() => runRequest(`dungeon:item:${item.id}`, "dungeon-item", item.id, (idem) => submitDungeonAction(active.run_id, active.room?.id, active.revision, `item:${item.id}`, csrfToken, idem), `${item.name} used.`)}><span><strong>{item.name}</strong><small>Qty {number(item.quantity)} · {item.target}</small></span><span>{item.usable ? "Use" : item.reason}</span><small>{item.description}</small></button>) : <p className="muted">No usable battle items are in your inventory.</p>}</div></div> : null}
                </div>
              ) : null}

              {active.status === "decision" ? (
                <div className="dungeon-choice-panel dungeon-route-choice-panel">
                  <div className="adventure-combat-note"><strong>{active.event?.name || active.room?.name}</strong><span>{active.event?.description || "Choose how you want to cross this chamber."}</span></div>
                  <div className="dungeon-route-options">
                    {(active.choices || []).map((choice) => (
                      <button key={choice.id} type="button" className="dungeon-route-option" disabled={!actionsAvailable || Boolean(busy)} onClick={() => runRequest(`dungeon:choice:${choice.id}`, "dungeon-choice", choice.id, (idem) => submitDungeonChoice(active.run_id, active.room?.id, active.revision, choice.id, csrfToken, idem), `${choice.label} chosen.`)}>
                        <strong>{choice.label}</strong><span>{choice.description}</span>{choice.effects?.length ? <small>{choice.effects.join(" · ")}</small> : null}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {active.status === "choice" ? (
                <div className="dungeon-choice-panel">
                  <div className="adventure-combat-note"><strong>{active.event?.name || active.room?.name}</strong><span>{active.event?.description || "The chamber is secure. Decide whether to press deeper."}</span>{active.event?.effects?.length ? <small>{active.event.effects.join(" · ")}</small> : null}</div>
                  <div className="venture-action-row">
                    {active.can_continue ? <button type="button" className="equipment-action-button" disabled={!actionsAvailable || Boolean(busy)} onClick={() => runRequest("dungeon:continue", "dungeon-continue", active.run_id || "run", (idem) => submitDungeonContinue(active.run_id, active.room?.id, active.revision, csrfToken, idem), "Moving deeper into the Dungeon.")}>{busy === "dungeon:continue" ? "Advancing…" : "Continue Deeper"}</button> : null}
                  </div>
                </div>
              ) : null}

              <DungeonHistory history={active.history} />
              {active.can_retreat ? <div className="solo-retreat-row"><button type="button" className="equipment-action-button ghost danger" disabled={Boolean(busy)} onClick={() => { if (window.confirm("Retreat from this Dungeon? Only part of the carried cache will be banked.")) runRequest("dungeon:retreat", "dungeon-retreat", active.run_id || "run", (idem) => submitDungeonRetreat(active.run_id, active.room?.id, active.revision, csrfToken, idem), "Retreated from the Dungeon."); }}>{busy === "dungeon:retreat" ? "Retreating…" : "Retreat — Bank 50% of Cache"}</button></div> : null}
              </div>
            </div>
          ) : (
            <div className="dungeon-card-grid">
              {dungeons.map((dungeon) => (
                <article key={dungeon.id} className={`dungeon-card ${dungeon.unlocked ? "unlocked" : "locked"}`}>
                  {dungeon.art ? <img className="dungeon-card-art" src={dungeon.art} alt="" aria-hidden="true" draggable="false" /> : null}
                  <div className="dungeon-card-content">
                  <div className="panel-title-row"><div><p className="eyebrow">{number(dungeon.rooms)} Chambers · {dungeon.identity || `Lv.${number(dungeon.min_level)}+`}</p><h3>{dungeon.name}</h3><p className="muted">{dungeon.subtitle || "A persistent multi-room delve with combat, hazards, treasure, and a final boss."}</p></div><span className={`small-badge ${dungeon.unlocked ? "success" : ""}`}>{dungeon.unlocked ? "Available" : "Locked"}</span></div>
                  <div className="dungeon-card-stats"><span><strong>Entry Level</strong> Lv.{number(dungeon.min_level)}</span><span><strong>Recommended</strong> Lv.{number(dungeon.recommended_level || dungeon.min_level)}</span><span><strong>Route Choices</strong> {number(dungeon.choice_rooms || 0)}</span><span><strong>Events</strong> {number(dungeon.event_rooms || 0)}</span><span><strong>Clears</strong> {number(dungeon.record?.clears || dungeon.progress?.[0] || 0)}</span><span><strong>Best</strong> {number(dungeon.record?.best_rooms || dungeon.progress?.[1] || 0)} / {number(dungeon.rooms)}</span></div>
                  {dungeon.unlocked ? <div className={`dungeon-first-clear ${dungeon.first_clear_claimed ? "claimed" : "available"}`}><span>First Clear</span><strong>{dungeon.first_clear_claimed ? "Claimed" : (dungeon.first_clear_rewards || []).join(" · ") || "Bonus reward"}</strong></div> : null}
                  {dungeon.missing?.length ? <p className="adventure-disabled-reason">{dungeon.missing.join(" · ")}</p> : null}
                  <button type="button" className="equipment-action-button" disabled={!actionsAvailable || !dungeon.unlocked || Boolean(busy)} onClick={() => runRequest(`dungeon:start:${dungeon.id}`, "dungeon-start", dungeon.id, (idem) => submitDungeonStart(dungeon.id, csrfToken, idem), `${dungeon.name} begun.`)}>{busy === `dungeon:start:${dungeon.id}` ? "Entering…" : "Enter Dungeon"}</button>
                  </div>
                </article>
              ))}
              {!dungeons.length ? <p className="muted">No Dungeons are available yet.</p> : null}
            </div>
          )
        ) : null}
      </section>
    </>
  );
}
