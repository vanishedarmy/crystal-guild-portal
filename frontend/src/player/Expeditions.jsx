import { useEffect, useMemo, useState } from "react";
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
import { toggleWithViewportAnchor } from "../utils/viewportAnchor.js";

const DEPTH_COPY = {
  scout: "3 stages · short survey",
  journey: "5 stages · balanced route",
  deep: "8 stages · high-risk journey",
};
const ROUTE_COPY = {
  safe: "Lower combat damage and softer hazards.",
  unknown: "Balanced risk and reward.",
  deep: "Harder combat and hazards for stronger rewards.",
};
const REGION_LANDMARK_COUNT = 4;
const STIPEND_SEALS = { scout: 2, journey: 4, deep: 7, boss: 10, legendary: 15 };
const ROUTE_RISK = { safe: "Low", unknown: "Balanced", deep: "High" };
const ROUTE_SIGNALS = {
  safe: ["Less combat", "Reduced combat damage", "Softer hazards"],
  unknown: ["Balanced encounters", "Balanced rewards", "Unpredictable events"],
  deep: ["More combat", "Harder enemy pressure", "Stronger hazards"],
};
const MASTERY_COPY = {
  emerald_wilds: "Discovery events +5% in Emerald Wilds",
  ashen_highlands: "Resource events +5% in Ashen Highlands",
  mistfen_marshes: "Hazard damage -5% in Mistfen Marshes",
  frostveil_reach: "Expedition Camp recovery +5% in Frostveil Reach",
  astral_scar: "Treasure events +5% in the Astral Scar",
};

function remainingUntil(timestamp, nowMs) {
  return Math.max(0, Number(timestamp || 0) - Math.floor(Number(nowMs || Date.now()) / 1000));
}

function defaultBoardOpen() {
  try {
    const stored = window.localStorage?.getItem("crystal-guild:adventure:expedition-board");
    if (stored === "open") return true;
    if (stored === "closed") return false;
    return !window.matchMedia?.("(max-width: 760px)")?.matches;
  } catch {
    return true;
  }
}

function defaultAtlasOpen() {
  try {
    const stored = window.localStorage?.getItem("crystal-guild:adventure:expedition-atlas");
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

function ExpeditionJournal({ history = [] }) {
  const entries = [...history].slice(-6).reverse();
  if (!entries.length) return null;
  return (
    <div className="expedition-journal" aria-label="Expedition Journal">
      <div className="expedition-journal-title"><span className="slot-label">Expedition Journal</span><small>Latest route events</small></div>
      <div className="expedition-journal-list">
        {entries.map((entry, index) => (
          <div key={`${entry?.stage || 0}:${entry?.type || "event"}:${index}`} className={`expedition-journal-entry ${entry?.type === "rare" ? "rare" : ""}`}>
            <span>Stage {number(entry?.stage || 0)}</span>
            <strong>{entry?.type === "rare" ? "RARE · " : ""}{entry?.label || "Route event"}</strong>
          </div>
        ))}
      </div>
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
        <div><span>Guild stipend</span><strong>{Number(rewards?.seals || summary?.stipend_seals || 0) > 0 ? `+${number(rewards?.seals || summary?.stipend_seals)} Seals` : "—"}</strong></div>
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
  const [boardOpen, setBoardOpen] = useState(() => data?.active ? true : defaultBoardOpen());
  const [atlasOpen, setAtlasOpen] = useState(defaultAtlasOpen);
  const active = data?.active || null;
  const regions = useMemo(() => [...(data?.regions || [])].sort((a, b) => Number(a?.min_level || 1) - Number(b?.min_level || 1)), [data?.regions]);
  const depths = data?.depths || [];
  const routes = data?.routes || [];
  const pickedRegion = regions.find((region) => region.id === selectedRegion) || regions.find((region) => region.unlocked) || regions[0];
  const travelRemaining = remainingUntil(active?.travel_ready_at, authoritativeClock);
  const fieldResults = pendingResults.filter((result) => result?.kind === "expedition");

  useEffect(() => {
    try { window.localStorage?.setItem("crystal-guild:adventure:expedition-board", boardOpen ? "open" : "closed"); } catch {}
  }, [boardOpen]);
  useEffect(() => {
    try { window.localStorage?.setItem("crystal-guild:adventure:expedition-atlas", atlasOpen ? "open" : "closed"); } catch {}
  }, [atlasOpen]);

  const doRequest = (key, kind, target, submit, fallback) => runRequest?.(key, kind, target, submit, fallback);

  return (
    <>
      <section className={`panel expedition-board-panel collapsible-board-section ${boardOpen ? "open" : "collapsed"} ${active ? "active" : ""}`} data-region={active?.region?.id || ""}>
        <div className="panel-title-row section-collapsible-title-row">
          <div>
            <p className="eyebrow">v1.2 · Chocobo Expeditions</p>
            <h2>{active ? `${active.region?.name} · Stage ${number(active.stage)} / ${number(active.max_stages)}` : "Distant Expedition Board"}</h2>
            {boardOpen ? <p className="muted">Choose a region and route, then bring your Expedition Cache home safely.</p> : null}
          </div>
          <div className="section-collapse-actions">
            <span className={`small-badge ${data?.ready || active ? "success" : "locked"}`}>{active ? String(active.status || "active").toUpperCase() : data?.ready ? "READY" : "LOCKED"}</span>
            <button type="button" className="section-collapse-button" aria-expanded={boardOpen} onClick={(event) => toggleWithViewportAnchor(event, setBoardOpen)}>{boardOpen ? "Collapse" : "Expand"}</button>
          </div>
        </div>

        {boardOpen ? (!active ? (
          <>
            <div className="expedition-readiness-grid">
              <article className={data?.board_ready ? "complete" : ""}><span>Guild Gate</span><strong>{data?.board_ready ? "✓ Expedition Board" : "○ Expedition Board"}</strong><small>Shared unlock</small></article>
              <article className={data?.chocobo_ready ? "complete" : ""}><span>Companion</span><strong>{data?.chocobo?.name || (data?.chocobo_ready ? "✓ Registered Chocobo" : "○ Registered Chocobo")}</strong><small>{data?.chocobo?.specialization ? `${data.chocobo.specialization.name} · Bond Tier ${number(data.chocobo.specialization.tier)}` : (data?.traits_active || []).length ? `${data.traits_active.length} active trait${data.traits_active.length === 1 ? "" : "s"}` : "Required"}</small></article>
              <article><span>Cache</span><strong>Bank on return</strong><small>Safe return keeps all</small></article>
            </div>

            {!data?.ready ? <p className="adventure-disabled-reason expedition-gate-note">{data?.reason || "Complete the Expedition Board and register a Chocobo first."}</p> : null}

            {data?.chocobo?.specialization ? (
              <div className="expedition-specialization-card">
                <div><span className="slot-label">Chocobo Expedition Specialty</span><h3>{data.chocobo.specialization.name} · Tier {number(data.chocobo.specialization.tier)}</h3></div>
                <div className="expedition-specialization-effects">{(data.chocobo.specialization.effects || []).map((effect) => <span key={effect}>{effect}</span>)}</div>
              </div>
            ) : null}

            {data?.atlas ? (
              <div className={`expedition-atlas-panel ${data.atlas?.all_mastered ? "mastered" : ""}`}>
                <div className="panel-title-row compact expedition-atlas-heading">
                  <div>
                    <span className="slot-label">Expedition Atlas</span>
                    <h3>{data.atlas?.rank_name || "Guild Scout"} · {number(data.atlas?.overall_progress || 0)}%</h3>
                  </div>
                  <div className="section-collapse-actions">
                    <span className={`small-badge ${data.atlas?.all_mastered ? "success" : ""}`}>{number(data.atlas?.regions_mastered || 0)} / {number(data.atlas?.region_count || regions.length)} MASTERED</span>
                    <button type="button" className="section-collapse-button compact" aria-expanded={atlasOpen} onClick={(event) => toggleWithViewportAnchor(event, setAtlasOpen)}>{atlasOpen ? "Hide Atlas" : "Show Atlas"}</button>
                  </div>
                </div>
                <ProgressBar value={Number(data.atlas?.overall_progress || 0)} />
                {atlasOpen ? <>
                  <div className="expedition-atlas-stats">
                    <div><span>Overall survey</span><strong>{number(data.atlas?.overall_progress || 0)}%</strong></div>
                    <div><span>Regions mastered</span><strong>{number(data.atlas?.regions_mastered || 0)} / {number(data.atlas?.region_count || regions.length)}</strong></div>
                    <div><span>Landmarks charted</span><strong>{number(data.atlas?.landmarks_found || 0)} / {number(data.atlas?.landmark_count || 0)}</strong></div>
                    <div><span>Boss clears</span><strong>{number(data.atlas?.total_boss_clears || 0)}</strong></div>
                    <div><span>Legendary routes</span><strong>{number(data.atlas?.legendary_contracts_unlocked || 0)}</strong></div>
                  </div>
                  {data.atlas?.all_mastered ? <p className="expedition-atlas-note"><strong>Atlas complete.</strong> All five regions are Mastered and the Master Cartographer reward is available through the achievement system.</p> : data.atlas?.next_rank ? <p className="expedition-atlas-note"><strong>Next rank:</strong> {data.atlas.next_rank.name} at {number(data.atlas.next_rank.progress)}% overall exploration.</p> : null}
                </> : null}
              </div>
            ) : null}

            <div className="expedition-region-grid">
              {regions.map((region) => {
                const selected = pickedRegion?.id === region.id;
                const progress = region?.progress || {};
                return (
                  <button type="button" key={region.id} data-region={region.id} className={`expedition-region-card ${selected ? "selected" : ""} ${!region.unlocked ? "locked" : ""}`} onClick={() => setSelectedRegion(region.id)} disabled={!region.unlocked}>
                    <div className="expedition-region-card-head"><span>Lv.{number(region.min_level)}{Number(region.recommended_max_level || 99) < 99 ? `–${number(region.recommended_max_level)}` : "+"}</span><b>{number(progress.progress || 0)}%</b></div>
                    <strong>{region.name}</strong>
                    <small>{region.identity} · {region.hazard}</small>
                    <small>{number(progress.landmarks_found || 0)} / {number(REGION_LANDMARK_COUNT)} landmarks charted</small>
                    <span className={`small-badge ${region.unlocked ? "success" : "locked"}`}>{region.unlocked ? "Available" : region.reason}</span>
                  </button>
                );
              })}
            </div>

            {pickedRegion ? (
              <div className="expedition-launch-panel">
                <div className="expedition-region-progress-panel">
                  <div className="panel-title-row compact">
                    <div>
                      <span className="slot-label">Region Progress</span>
                      <h3>{pickedRegion.name} · {number(pickedRegion.progress?.progress || 0)}%</h3>
                    </div>
                    <span className={`small-badge ${pickedRegion.progress?.mastered ? "success" : pickedRegion.progress?.boss_unlocked ? "warning" : ""}`}>{pickedRegion.progress?.mastered ? "MASTERED" : pickedRegion.progress?.boss_unlocked ? "BOSS UNLOCKED" : "SURVEYING"}</span>
                  </div>
                  <ProgressBar value={Number(pickedRegion.progress?.progress || 0)} />
                  <div className="expedition-milestone-grid">
                    {(pickedRegion.progress?.milestones || []).map(([threshold, name]) => (
                      <div key={`${pickedRegion.id}:${threshold}`} className={Number(pickedRegion.progress?.progress || 0) >= Number(threshold || 0) ? "complete" : ""}>
                        <span>{number(threshold)}%</span>
                        <strong>{name}</strong>
                        <small>{Number(pickedRegion.progress?.progress || 0) >= Number(threshold || 0) ? "Complete" : "Locked"}</small>
                      </div>
                    ))}
                  </div>
                  {REGION_LANDMARK_COUNT > 0 ? (
                    <div className="expedition-landmarks-panel">
                      <div className="expedition-landmarks-heading"><span className="slot-label">Regional Landmarks</span><strong>{number(pickedRegion.progress?.landmarks_found || 0)} / {number(REGION_LANDMARK_COUNT)} charted</strong></div>
                      <div className="expedition-landmark-grid">
                        {(pickedRegion.progress?.landmarks || []).map((landmark) => (
                          <div key={`${pickedRegion.id}:${landmark.name}`} className="discovered">
                            <span>CHARTED · {number(landmark.unlock_progress)}%</span>
                            <strong>{landmark.name}</strong>
                            <small>Added permanently to your Expedition Atlas.</small>
                          </div>
                        ))}
                        {Number(pickedRegion.progress?.landmarks_found || 0) < REGION_LANDMARK_COUNT ? (
                          <div className="locked">
                            <span>{pickedRegion.progress?.next_landmark_progress != null ? `${number(pickedRegion.progress.next_landmark_progress)}%` : "UNCHARTED"}</span>
                            <strong>{number(REGION_LANDMARK_COUNT - Number(pickedRegion.progress?.landmarks_found || 0))} landmark{REGION_LANDMARK_COUNT - Number(pickedRegion.progress?.landmarks_found || 0) === 1 ? "" : "s"} remain</strong>
                            <small>Continue surveying {pickedRegion.name} to reveal the next location.</small>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                  {(pickedRegion.progress?.milestones || []).find(([threshold]) => Number(pickedRegion.progress?.progress || 0) < Number(threshold || 0)) ? <p className="muted expedition-next-objective"><strong>Next:</strong> {(pickedRegion.progress.milestones || []).find(([threshold]) => Number(pickedRegion.progress?.progress || 0) < Number(threshold || 0))?.[1]} at {number((pickedRegion.progress.milestones || []).find(([threshold]) => Number(pickedRegion.progress?.progress || 0) < Number(threshold || 0))?.[0])}%</p> : <p className="muted expedition-next-objective"><strong>Mastery bonus:</strong> {MASTERY_COPY[pickedRegion.id] || "Region mastered"}</p>}
                  <div className="expedition-boss-contract-row">
                    <div><span className="slot-label">Regional Boss</span><strong>{pickedRegion.boss_name || "Regional Boss"}</strong><small>{pickedRegion.progress?.boss_unlocked ? `${number(pickedRegion.progress?.boss_clears || 0)} clear${Number(pickedRegion.progress?.boss_clears || 0) === 1 ? "" : "s"} · +${STIPEND_SEALS.boss} Seals on completion` : `Unlocks at ${number(pickedRegion.progress?.boss_unlock_progress || 75)}%`}</small></div>
                    <div className="expedition-contract-actions">
                      <button type="button" className="equipment-action-button secondary" disabled={!actionsAvailable || !data?.ready || !pickedRegion?.unlocked || !pickedRegion.progress?.boss_unlocked || Boolean(busy)} onClick={() => doRequest("expedition:boss", "expedition-start", `${pickedRegion.id}:boss`, (idem) => submitExpeditionStart(pickedRegion.id, "boss", csrfToken, idem), "Regional Boss Expedition launched.")}>{busy === "expedition:boss" ? "Preparing Contract…" : pickedRegion.progress?.boss_unlocked ? `Challenge ${pickedRegion.boss_name}` : "Boss Locked"}</button>
                      {pickedRegion.progress?.mastered ? <button type="button" className="equipment-action-button legendary-contract-button" disabled={!actionsAvailable || !data?.ready || !pickedRegion?.unlocked || !pickedRegion.progress?.legendary_unlocked || Boolean(busy)} onClick={() => doRequest("expedition:legendary", "expedition-start", `${pickedRegion.id}:legendary`, (idem) => submitExpeditionStart(pickedRegion.id, "legendary", csrfToken, idem), "Legendary Regional Contract launched.")}>{busy === "expedition:legendary" ? "Preparing Legendary Route…" : pickedRegion.progress?.legendary_unlocked ? `Launch Legendary Contract · +${STIPEND_SEALS.legendary} Seals` : "Clear Boss to Unlock"}</button> : null}
                    </div>
                  </div>
                </div>
                <div>
                  <span className="slot-label">Standard Expedition</span>
                  <p className="muted">Primary finds: {(pickedRegion.materials || []).join(" · ") || "Regional materials"}</p>
                </div>
                <div className="expedition-depth-grid" role="group" aria-label="Expedition depth">
                  {depths.map((depth) => (
                    <button key={depth.id} type="button" className={`expedition-depth-option ${selectedDepth === depth.id ? "selected" : ""}`} onClick={() => setSelectedDepth(depth.id)}>
                      <strong>{depth.name}</strong><span>{DEPTH_COPY[depth.id] || `${number(depth.stages)} stages`}</span><small>Base travel {duration(depth.travel_seconds)} · ×{Number(depth.reward_mult || 1).toFixed(2)} rewards · +{number(STIPEND_SEALS[depth.id] || 0)} Seals</small>
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
              <div><span>{active.legendary_contract ? "Legendary Contract" : active.boss_contract ? "Contract" : "Depth"}</span><strong>{active.depth?.name}</strong></div>
              <div><span>Current route</span><strong>{active.route?.name}</strong></div>
              <div><span>Regional survey</span><strong>{number(active.progress?.progress || 0)}%</strong></div>
              <div><span>Stage</span><strong>{number(active.stage)} / {number(active.base_stages)}{active.legendary_contract ? " · LEGENDARY" : active.boss_contract ? " · BOSS CONTRACT" : active.bonus_stage ? " · BONUS" : ""}</strong></div>
              <div><span>Completion stipend</span><strong>+{number(active.legendary_contract ? STIPEND_SEALS.legendary : active.boss_contract ? STIPEND_SEALS.boss : STIPEND_SEALS[active.depth?.id] || 0)} Seals</strong></div>
            </div>
            <ExpeditionCache cache={active.cache} />
            {(active.cache?.items || []).length ? <p className="expedition-loot-line"><strong>Cache:</strong> {active.cache.items.map((row) => `${row.name || row.id} x${number(row.quantity)}`).join(" · ")}</p> : null}
            <ExpeditionJournal history={active.history || []} />

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
                    <div><span className="slot-label">{active.combat.boss ? "REGIONAL BOSS" : "Enemy"} · Round {number(active.combat.round)}</span><h3>{active.combat.enemy?.name} · Lv.{number(active.combat.enemy?.level)}</h3><div className="vital-label"><span>HP</span><span>{number(active.combat.enemy?.hp)} / {number(active.combat.enemy?.max_hp)}</span></div><ProgressBar value={pct(active.combat.enemy?.hp, active.combat.enemy?.max_hp)} className="hp" /><small>Intent: {active.combat.enemy?.intent}</small></div>
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
                {active.can_continue ? <div className="expedition-route-grid">{routes.map((route) => <button type="button" key={route.id} className={`expedition-route-option ${route.id}`} disabled={Boolean(busy)} onClick={() => doRequest(`expedition:continue:${route.id}`, "expedition-continue", `${active.stage}:${route.id}`, (idem) => submitExpeditionContinue(route.id, csrfToken, idem), `Taking the ${route.name}.`)}><div className="expedition-route-heading"><strong>{route.name}</strong><span className={`small-badge route-risk ${route.id}`}>{ROUTE_RISK[route.id] || "Balanced"} risk</span></div><span>{ROUTE_COPY[route.id]}</span><div className="expedition-route-signals">{(ROUTE_SIGNALS[route.id] || []).map((signal) => <small key={`${route.id}:${signal}`}>{signal}</small>)}</div><small>Rare event chance ~{number(Math.round(Number(route.rare_event_chance || 0) * 100))}% · ×{Number(route.reward_mult || 1).toFixed(2)} rewards</small></button>)}</div> : <p className="adventure-disabled-reason">Maximum Expedition depth reached. Return to the Guild to secure the cache.</p>}
              </div>
            ) : null}
          </div>
        )) : null}
      </section>

      {fieldResults.length ? <div className="adventure-pending-result-stack" aria-label="Pending Expedition results">{fieldResults.map((result) => <ExpeditionResult key={`expedition-result:${result.result_id}`} result={result} onConfirm={onConfirmResult} confirming={busy === `ack-result:${result.result_id}`} />)}</div> : null}
    </>
  );
}
