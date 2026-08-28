import { useMemo, useState } from "react";
import {
  submitExpeditionStart,
  submitExpeditionResolveStage,
  submitExpeditionAction,
  submitExpeditionContinue,
  submitExpeditionCamp,
  submitExpeditionReturn,
  submitExpeditionRetreat,
} from "../api/auth.js";
import ProgressBar from "../components/ProgressBar.jsx";
import JobPortrait from "../components/JobPortrait.jsx";
import MonsterPortrait from "../components/MonsterPortrait.jsx";
import { duration, number, pct } from "../utils/formatters.js";

const DEPTH_COPY = {
  scout: "3 stages · short survey",
  journey: "5 stages · balanced route",
  deep: "8 stages · high-risk journey",
};
const ROUTE_COPY = {
  safe: "Lower combat and hazard pressure.",
  unknown: "Balanced risk and reward.",
  deep: "More danger, stronger rewards.",
};

function remainingUntil(timestamp, nowMs) {
  return Math.max(0, Number(timestamp || 0) - Math.floor(Number(nowMs || Date.now()) / 1000));
}

function cacheItemCount(cache) {
  return (cache?.items || []).reduce((sum, row) => sum + Number(row?.quantity || 0), 0);
}

function ExpeditionCache({ cache }) {
  return (
    <div className="expedition-cache-grid" aria-label="Expedition Cache">
      <div><span>XP carried</span><strong>{number(cache?.xp || 0)}</strong></div>
      <div><span>JP carried</span><strong>{number(cache?.jp || 0)}</strong></div>
      <div><span>Gil carried</span><strong>{number(cache?.gil || 0)}</strong></div>
      <div><span>Items carried</span><strong>{number(cacheItemCount(cache))}</strong></div>
    </div>
  );
}

function ExpeditionResult({ result, onConfirm, confirming }) {
  const summary = result?.summary || {};
  const rewards = summary?.rewards || {};
  const lost = summary?.lost || {};
  const rescued = summary?.outcome === "defeat";
  return (
    <section className={`panel expedition-result-panel ${rescued ? "lost" : "won"}`} aria-live="polite">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Expedition Report · Saved</p>
          <h2>{summary?.title || "Expedition Returned"}</h2>
          <p className="muted">{summary?.region_name || "Unknown Region"} · {summary?.depth || "Expedition"} · {number(summary?.stages || 0)} stages</p>
        </div>
        <span className={`small-badge ${rescued ? "" : "success"}`}>{rescued ? "Rescued" : "Secured"}</span>
      </div>
      <div className="expedition-cache-grid">
        <div><span>XP banked</span><strong>+{number(rewards?.xp || 0)}</strong></div>
        <div><span>JP banked</span><strong>+{number(rewards?.jp || 0)}</strong></div>
        <div><span>Gil banked</span><strong>{number(rewards?.gil || 0)}</strong></div>
        <div><span>Loot</span><strong>{number((rewards?.loot || []).length)}</strong></div>
      </div>
      {(rewards?.loot || []).length ? <p className="expedition-loot-line"><strong>Secured:</strong> {rewards.loot.join(" · ")}</p> : null}
      {(lost?.xp || lost?.jp || lost?.gil || (lost?.items || []).length) ? (
        <p className="expedition-loot-line danger"><strong>Lost during rescue:</strong> {number(lost?.xp || 0)} XP · {number(lost?.jp || 0)} JP · {number(lost?.gil || 0)} Gil{(lost?.items || []).length ? ` · ${lost.items.join(" · ")}` : ""}</p>
      ) : null}
      <div className="adventure-result-confirmation">
        <div><strong>Saved until you confirm</strong><span>This Expedition report remains here across refreshes and Portal visits.</span></div>
        <button type="button" className="equipment-action-button secondary" disabled={Boolean(confirming)} onClick={() => onConfirm?.(result?.result_id)}>{confirming ? "Confirming…" : "Confirm Result"}</button>
      </div>
    </section>
  );
}

export default function Expeditions({
  data,
  csrfToken,
  actionsAvailable,
  busy,
  runRequest,
  authoritativeClock,
  pendingResults = [],
  onConfirmResult,
}) {
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDepth, setSelectedDepth] = useState("scout");
  const active = data?.active || null;
  const regions = useMemo(() => [...(data?.regions || [])].sort((a, b) => Number(a?.min_level || 1) - Number(b?.min_level || 1)), [data?.regions]);
  const depths = data?.depths || [];
  const routes = data?.routes || [];
  const pickedRegion = regions.find((region) => region.id === selectedRegion) || regions.find((region) => region.unlocked) || regions[0];
  const travelRemaining = remainingUntil(active?.travel_ready_at, authoritativeClock);
  const fieldResults = pendingResults.filter((result) => result?.kind === "expedition");

  const doRequest = (key, kind, target, submit, fallback) => runRequest?.(key, kind, target, submit, fallback);

  return (
    <>
      <section className={`panel expedition-board-panel ${active ? "active" : ""}`} data-region={active?.region?.id || ""}>
        <div className="panel-title-row">
          <div>
            <p className="eyebrow">v1.2 · Chocobo Expeditions</p>
            <h2>{active ? `${active.region?.name} · Stage ${number(active.stage)} / ${number(active.max_stages)}` : "Distant Expedition Board"}</h2>
            <p className="muted">Choose a region and route, then bring your Expedition Cache home safely.</p>
          </div>
          <span className={`small-badge ${data?.ready || active ? "success" : "locked"}`}>{active ? String(active.status || "active").toUpperCase() : data?.ready ? "READY" : "LOCKED"}</span>
        </div>

        {!active ? (
          <>
            <div className="expedition-readiness-grid">
              <article className={data?.board_ready ? "complete" : ""}><span>Guild Gate</span><strong>{data?.board_ready ? "✓ Expedition Board" : "○ Expedition Board"}</strong><small>Shared unlock</small></article>
              <article className={data?.chocobo_ready ? "complete" : ""}><span>Companion</span><strong>{data?.chocobo?.name || (data?.chocobo_ready ? "✓ Registered Chocobo" : "○ Registered Chocobo")}</strong><small>{(data?.traits_active || []).length ? `${data.traits_active.length} active trait${data.traits_active.length === 1 ? "" : "s"}` : "Required"}</small></article>
              <article><span>Cache</span><strong>Bank on return</strong><small>Safe return keeps all</small></article>
            </div>

            {!data?.ready ? <p className="adventure-disabled-reason expedition-gate-note">{data?.reason || "Complete the Expedition Board and register a Chocobo first."}</p> : null}

            <div className="expedition-region-grid">
              {regions.map((region) => {
                const selected = pickedRegion?.id === region.id;
                const progress = region?.progress || {};
                return (
                  <button type="button" key={region.id} data-region={region.id} className={`expedition-region-card ${selected ? "selected" : ""} ${!region.unlocked ? "locked" : ""}`} onClick={() => setSelectedRegion(region.id)} disabled={!region.unlocked}>
                    <div className="expedition-region-card-head"><span>Lv.{number(region.min_level)}{Number(region.recommended_max_level || 99) < 99 ? `–${number(region.recommended_max_level)}` : "+"}</span><b>{number(progress.progress || 0)}%</b></div>
                    <strong>{region.name}</strong>
                    <small>{region.identity} · {region.hazard}</small>
                    <span className={`small-badge ${region.unlocked ? "success" : "locked"}`}>{region.unlocked ? "Available" : region.reason}</span>
                  </button>
                );
              })}
            </div>

            {pickedRegion ? (
              <div className="expedition-launch-panel">
                <div>
                  <span className="slot-label">Selected Region</span>
                  <h3>{pickedRegion.name}</h3>
                  <p className="muted">Primary finds: {(pickedRegion.materials || []).map((item) => item.name).join(" · ") || "Regional materials"}</p>
                </div>
                <div className="expedition-depth-grid" role="group" aria-label="Expedition depth">
                  {depths.map((depth) => (
                    <button key={depth.id} type="button" className={`expedition-depth-option ${selectedDepth === depth.id ? "selected" : ""}`} onClick={() => setSelectedDepth(depth.id)}>
                      <strong>{depth.name}</strong><span>{DEPTH_COPY[depth.id] || `${number(depth.stages)} stages`}</span><small>Base travel {duration(depth.travel_seconds)} · ×{Number(depth.reward_mult || 1).toFixed(2)} rewards</small>
                    </button>
                  ))}
                </div>
                <button type="button" className="equipment-action-button expedition-launch-button" disabled={!actionsAvailable || !data?.ready || !pickedRegion?.unlocked || Boolean(busy)} onClick={() => doRequest("expedition:start", "expedition-start", `${pickedRegion.id}:${selectedDepth}`, (idem) => submitExpeditionStart(pickedRegion.id, selectedDepth, csrfToken, idem), "Expedition launched.")}>{busy === "expedition:start" ? "Preparing Chocobo…" : `Launch ${depths.find((row) => row.id === selectedDepth)?.name || "Expedition"}`}</button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="expedition-active-shell">
            <div className="expedition-active-meta">
              <div><span>Depth</span><strong>{active.depth?.name}</strong></div>
              <div><span>Current route</span><strong>{active.route?.name}</strong></div>
              <div><span>Regional survey</span><strong>{number(active.progress?.progress || 0)}%</strong></div>
              <div><span>Stage</span><strong>{number(active.stage)} / {number(active.base_stages)} objective{active.bonus_stage ? " · BONUS" : ""}</strong></div>
            </div>
            <ExpeditionCache cache={active.cache} />
            {(active.cache?.items || []).length ? <p className="expedition-loot-line"><strong>Cache:</strong> {active.cache.items.map((row) => `${row.name || row.id} x${number(row.quantity)}`).join(" · ")}</p> : null}

            {active.status === "travel" ? (
              <div className="expedition-travel-card">
                <span className="slot-label">Traveling · Stage {number(active.stage)}</span>
                <strong>{travelRemaining > 0 ? duration(travelRemaining) : "Stage ready"}</strong>
                <ProgressBar value={travelRemaining > 0 ? Math.max(2, 100 - (travelRemaining / Math.max(1, Number((depths.find((row) => row.id === active.depth?.id)?.travel_seconds) || travelRemaining))) * 100) : 100} />
                <p>Progress is saved if you leave the Portal.</p>
                <button type="button" className="equipment-action-button" disabled={!active.travel_ready || Boolean(busy)} onClick={() => doRequest("expedition:resolve", "expedition-resolve", String(active.stage), (idem) => submitExpeditionResolveStage(csrfToken, idem), "Expedition stage resolved.")}>{busy === "expedition:resolve" ? "Resolving…" : active.travel_ready ? "Resolve Stage" : `Ready in ${duration(travelRemaining)}`}</button>
              </div>
            ) : null}

            {active.status === "combat" && active.combat ? (
              <div className="expedition-combat-shell">
                <div className="expedition-combatants">
                  <article>
                    <MonsterPortrait monster={active.combat.enemy} name={active.combat.enemy?.name} className="solo-enemy-portrait" eager />
                    <div><span className="slot-label">Enemy · Round {number(active.combat.round)}</span><h3>{active.combat.enemy?.name} · Lv.{number(active.combat.enemy?.level)}</h3><div className="vital-label"><span>HP</span><span>{number(active.combat.enemy?.hp)} / {number(active.combat.enemy?.max_hp)}</span></div><ProgressBar value={pct(active.combat.enemy?.hp, active.combat.enemy?.max_hp)} className="hp" /><small>Intent: {active.combat.enemy?.intent}</small></div>
                  </article>
                  <article>
                    <JobPortrait jobName={active.combat.player?.job_name} className="solo-hero-portrait" />
                    <div><span className="slot-label">Your Hero</span><h3>{active.combat.player?.name} · {active.combat.player?.job_name}</h3><div className="vital-label"><span>HP</span><span>{number(active.combat.player?.hp)} / {number(active.combat.player?.max_hp)}</span></div><ProgressBar value={pct(active.combat.player?.hp, active.combat.player?.max_hp)} className="hp" />{Number(active.combat.player?.max_mp || 0) > 0 ? <><div className="vital-label"><span>MP</span><span>{number(active.combat.player?.mp)} / {number(active.combat.player?.max_mp)}</span></div><ProgressBar value={pct(active.combat.player?.mp, active.combat.player?.max_mp)} className="mp" /></> : null}{Number(active.combat.player?.max_ap || 0) > 0 ? <><div className="vital-label"><span>AP</span><span>{number(active.combat.player?.ap)} / {number(active.combat.player?.max_ap)}</span></div><ProgressBar value={pct(active.combat.player?.ap, active.combat.player?.max_ap)} className="ap" /></> : null}</div>
                  </article>
                </div>
                {active.last_round?.events?.length ? <div className="adventure-combat-note expedition-round-log"><strong>Round {number(active.last_round.round)}</strong>{active.last_round.events.slice(-4).map((line, index) => <span key={`${index}:${line}`}>{line}</span>)}</div> : null}
                <div className="expedition-action-grid">
                  <button type="button" className="equipment-action-button" disabled={Boolean(busy)} onClick={() => doRequest("expedition:attack", "expedition-action", `attack:${active.stage}:${active.combat.round}`, (idem) => submitExpeditionAction("attack", csrfToken, idem), "Attack resolved.")}>Attack</button>
                  <button type="button" className="equipment-action-button secondary" disabled={Boolean(busy)} onClick={() => doRequest("expedition:defend", "expedition-action", `defend:${active.stage}:${active.combat.round}`, (idem) => submitExpeditionAction("defend", csrfToken, idem), "Defend resolved.")}>Defend</button>
                </div>
                {(active.combat.abilities || []).length ? <div className="expedition-option-grid">{active.combat.abilities.map((ability) => <button type="button" key={ability.id} className="expedition-combat-option" disabled={Boolean(busy) || !ability.usable} title={ability.reason || ability.description} onClick={() => doRequest(`expedition:ability:${ability.id}`, "expedition-action", `ability:${ability.id}:${active.stage}:${active.combat.round}`, (idem) => submitExpeditionAction(`ability:${ability.id}`, csrfToken, idem), `${ability.name} resolved.`)}><strong>{ability.name}</strong><small>{ability.cost_label || ability.cost || "Ability"}</small><span>{ability.usable ? "Use" : ability.reason}</span></button>)}</div> : null}
                {(active.combat.items || []).length ? <div className="expedition-option-grid">{active.combat.items.map((item) => <button type="button" key={item.id} className="expedition-combat-option" disabled={Boolean(busy) || !item.usable} title={item.reason || item.description} onClick={() => doRequest(`expedition:item:${item.id}`, "expedition-action", `item:${item.id}:${active.stage}:${active.combat.round}`, (idem) => submitExpeditionAction(`item:${item.id}`, csrfToken, idem), `${item.name} used.`)}><strong>{item.name}</strong><small>Qty {number(item.quantity)}</small><span>{item.usable ? "Use" : item.reason}</span></button>)}</div> : null}
                <button type="button" className="equipment-action-button ghost danger" disabled={Boolean(busy)} onClick={() => { if (window.confirm("Retreat from this Expedition encounter? Your Chocobo will rescue you, but part of the Expedition Cache may be lost.")) doRequest("expedition:retreat", "expedition-retreat", String(active.stage), (idem) => submitExpeditionRetreat(csrfToken, idem), "Chocobo rescue complete."); }}>Retreat · Chocobo Rescue</button>
              </div>
            ) : null}

            {active.status === "choice" ? (
              <div className="expedition-choice-card">
                <div className="expedition-event-highlight">
                  <span>Stage {number(active.stage)} cleared</span>
                  <strong>{active.event?.label || "The road ahead is open."}</strong>
                  <small>{active.objective_complete ? "Objective complete — bank the cache or push deeper." : "Choose a route, camp, or return."}</small>
                </div>
                <div className="expedition-choice-actions">
                  <button type="button" className="equipment-action-button" disabled={Boolean(busy)} onClick={() => doRequest("expedition:return", "expedition-return", String(active.stage), (idem) => submitExpeditionReturn(csrfToken, idem), "Expedition Cache secured.")}>{active.objective_complete ? "Complete Expedition · Bank Cache" : "Return to Guild · Bank Cache"}</button>
                  {active.can_camp ? <button type="button" className="equipment-action-button secondary" disabled={Boolean(busy)} onClick={() => doRequest("expedition:camp", "expedition-camp", String(active.stage), (idem) => submitExpeditionCamp(csrfToken, idem), "Expedition Camp established.")}>Make Camp · Recover</button> : null}
                </div>
                {active.can_continue ? <div className="expedition-route-grid">{routes.map((route) => <button type="button" key={route.id} className={`expedition-route-option ${route.id}`} disabled={Boolean(busy)} onClick={() => doRequest(`expedition:continue:${route.id}`, "expedition-continue", `${active.stage}:${route.id}`, (idem) => submitExpeditionContinue(route.id, csrfToken, idem), `Taking the ${route.name}.`)}><strong>{route.name}</strong><span>{ROUTE_COPY[route.id]}</span><small>×{Number(route.reward_mult || 1).toFixed(2)} reward modifier</small></button>)}</div> : <p className="adventure-disabled-reason">Maximum Expedition depth reached. Return to the Guild to secure the cache.</p>}
              </div>
            ) : null}
          </div>
        )}
      </section>

      {fieldResults.length ? <div className="adventure-pending-result-stack" aria-label="Pending Expedition results">{fieldResults.map((result) => <ExpeditionResult key={`expedition-result:${result.result_id}`} result={result} onConfirm={onConfirmResult} confirming={busy === `ack-result:${result.result_id}`} />)}</div> : null}
    </>
  );
}
