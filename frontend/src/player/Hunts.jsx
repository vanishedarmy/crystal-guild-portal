import LockIcon from "../components/LockIcon.jsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  submitAdventureState,
  submitChallengeHunt,
  submitAcknowledgeAdventureResult,
  submitTravelRegion,
  submitSoloVenture,
  submitSoloExpeditionAction,
  submitSoloExpeditionContinue,
  submitSoloExpeditionReturn,
  submitSoloExpeditionRetreat,
  submitStartRest,
  submitCampMeal,
  submitCampPreparation,
  submitUseFieldItem,
  waitForPortalAction,
} from "../api/auth.js";
import ProgressBar from "../components/ProgressBar.jsx";
import LimitGauge from "../components/LimitGauge.jsx";
import JobPortrait from "../components/JobPortrait.jsx";
import MonsterPortrait from "../components/MonsterPortrait.jsx";
import StatCard from "../components/StatCard.jsx";
import Expeditions from "./Expeditions.jsx";
import Dungeons from "./Dungeons.jsx";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { battleAbilityPurpose, battleAbilitySummary, battleItemPurpose, duration, number, pct, sortBattleItems } from "../utils/formatters.js";
import { toggleWithViewportAnchor } from "../utils/viewportAnchor.js";
import CollapsePointer from "../components/CollapsePointer.jsx";
import ContextHelp from "../components/ContextHelp.jsx";
import MobileCombatDrawer from "../components/MobileCombatDrawer.jsx";
import MobileCombatHud from "../components/MobileCombatHud.jsx";

const volatileAdventureActionKeys = new Map();

function actionStorageKey(kind, target, username) {
  return `crystal-guild:adventure:${String(username || "").toLowerCase()}:${kind}:${target || "adventure"}`;
}

function actionKey(kind, target = "adventure", username = "") {
  const storageKey = actionStorageKey(kind, target, username);
  try {
    const existing = window.sessionStorage?.getItem(storageKey);
    if (existing) return existing;
  } catch {
    const existing = volatileAdventureActionKeys.get(storageKey);
    if (existing) return existing;
  }
  const suffix = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}:${Math.random().toString(36).slice(2)}`;
  const key = `${kind}:${target}:${suffix}`;
  volatileAdventureActionKeys.set(storageKey, key);
  try {
    window.sessionStorage?.setItem(storageKey, key);
  } catch {
    // Browser privacy settings may disable sessionStorage; memory fallback remains.
  }
  return key;
}

function clearActionKey(kind, target = "adventure", username = "", key = "") {
  const storageKey = actionStorageKey(kind, target, username);
  if (!key || volatileAdventureActionKeys.get(storageKey) === key) volatileAdventureActionKeys.delete(storageKey);
  try {
    const existing = window.sessionStorage?.getItem(storageKey);
    if (!key || existing === key) window.sessionStorage?.removeItem(storageKey);
  } catch {
    // Best-effort cleanup only.
  }
}

async function finishedAction(response) {
  const action = response?.action;
  if (!action?.id) throw new Error("Crystal Guild did not return a request ID.");
  if (action.status === "completed" || action.status === "failed") return action;
  return waitForPortalAction(action.id, { attempts: 30, delayMs: 650 });
}

function remainingUntil(timestamp, nowMs) {
  const seconds = Number(timestamp || 0) - Math.floor(nowMs / 1000);
  return Math.max(0, seconds);
}

function levelValue(entry) {
  const value = Number(entry?.monster?.level ?? entry?.min_level ?? 1);
  return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

function compareByLevel(left, right) {
  return levelValue(left) - levelValue(right) || String(left?.name || "").localeCompare(String(right?.name || ""));
}

function defaultSectionOpen(storageKey) {
  try {
    const stored = window.localStorage?.getItem(storageKey);
    if (stored === "open") return true;
    if (stored === "closed") return false;
    return !window.matchMedia?.("(max-width: 760px)")?.matches;
  } catch {
    return true;
  }
}

function soloVentureSummary(summary) {
  if (!summary) return "";
  if (summary.type === "expedition") {
    const rewards = summary.rewards || {};
    if (summary.outcome === "defeat") return `Solo Venture: Defeated after Stage ${number(summary.stages || 1)} — ${number(rewards.gil || 0)} Gil recovered.`;
    if (summary.outcome === "retreat") return `Solo Venture: Retreated during Stage ${number(summary.stages || 1)}.`;
    return `Solo Venture: ${number(summary.stages || 1)} stage${Number(summary.stages || 1) === 1 ? "" : "s"} complete — +${number(rewards.xp)} XP · +${number(rewards.jp)} JP · +${number(rewards.gil)} Gil.`;
  }
  const treasure = summary.type === "treasure";
  const rewards = summary.rewards || {};
  const enemy = summary.enemy || {};
  const item = summary.item || {};
  const loot = Array.isArray(rewards.loot) ? rewards.loot.filter(Boolean) : [];
  if (treasure) {
    return `Solo Venture: Found ${item.name || loot[0] || "treasure"}.`;
  }
  const enemyLabel = `${enemy.name || "an enemy"}${enemy.level ? ` Lv. ${number(enemy.level)}` : ""}`;
  if (summary.outcome === "victory") {
    return `Solo Venture: Victory over ${enemyLabel} — +${number(rewards.xp)} XP · +${number(rewards.jp)} JP · +${number(rewards.gil)} Gil.`;
  }
  return `Solo Venture: Defeated by ${enemyLabel}.`;
}

// Camp remains one lightweight panel; no new durability economy or duplicate combat logic.
function CampImprovements({ camp, clock, csrfToken, ready, busy, runRequest }) {
  const [choicesOpen, setChoicesOpen] = useState(() => {
    try { return window.localStorage?.getItem("crystal-guild:adventure:camp-choices") === "open"; }
    catch { return false; }
  });
  useEffect(() => {
    try { window.localStorage?.setItem("crystal-guild:adventure:camp-choices", choicesOpen ? "open" : "closed"); }
    catch { /* Private browsing can disable localStorage. */ }
  }, [choicesOpen]);
  const plan = camp?.preparation;
  if (!plan) return null; // Older Bot revisions still show the original Camp controls.
  const canPrepare = Boolean(ready && plan.can_prepare && !busy);
  const mealRemaining = remainingUntil(plan.meal_until, clock);
  const hpMissing = Number(camp.hp ?? 0) < Number(camp.max_hp ?? 0);
  const mpMissing = Number(camp.max_mp ?? 0) > 0 && Number(camp.mp ?? 0) < Number(camp.max_mp ?? 0);
  const apMissing = Number(camp.max_ap ?? 0) > 0 && Number(camp.ap ?? 0) < Number(camp.max_ap ?? 0);
  const needsRecovery = hpMissing || mpMissing || apMissing;
  const mealAction = () => runRequest("camp:meal", "camp-meal", "trail-rations", (idem) => submitCampMeal(csrfToken, idem), "Meal prepared.");
  const setPlan = (id) => runRequest(`camp:prep:${id}`, "camp-preparation", id, (idem) => submitCampPreparation(id, csrfToken, idem), "Preparation selected.");
  const useItem = (id) => runRequest(`camp:item:${id}`, "camp-recovery", id, (idem) => submitUseFieldItem(id, csrfToken, idem), `${id === "tent" ? "Tent" : "Potion"} used.`);
  const selectedPreparation = {
    scout: "Scout the Route", sharpen: "Check Your Gear", supplies: "Pack Supplies",
  }[plan.preparation] || "";
  return (
    <div className={`camp-improvements ${choicesOpen ? "is-expanded" : "is-collapsed"}`} aria-label="Camp meal recovery and Venture preparation">
      <button type="button" className="camp-improvements-toggle" aria-expanded={choicesOpen}
        aria-controls="camp-pre-venture-options"
        onClick={(event) => toggleWithViewportAnchor(event, setChoicesOpen)}>
        <span className="camp-improvements-toggle-title"><strong>Before you venture</strong><small>Meals · Recovery · Preparation</small></span>
        <span className="camp-improvements-toggle-status">
          {mealRemaining > 0 ? <span className="small-badge success">Meal ready · {duration(mealRemaining)}</span> : null}
          {selectedPreparation ? <span className="small-badge">{selectedPreparation} selected</span> : null}
        </span>
        <CollapsePointer open={choicesOpen} />
      </button>
      <div id="camp-pre-venture-options" className="camp-improvements-content" hidden={!choicesOpen}>
      <div className="camp-choice-grid">
        <div className="camp-choice-card">
          <div className="camp-choice-head"><strong>Eat a Meal</strong><span className="small-badge">45 minutes to depart</span></div>
          <p>Trail Rations grant <strong>+10% damage</strong> for one complete Solo Venture if you depart before the timer ends.</p>
          <p className="muted">{mealRemaining > 0 ? `Meal ready · ${duration(mealRemaining)} to depart` : `Trail Rations in your bag: ${number(plan.rations_owned)}`}</p>
          <button className="equipment-action-button" type="button"
            disabled={!canPrepare || mealRemaining > 0 || !plan.rations_owned}
            onClick={mealAction}>{busy === "camp:meal" ? "Preparing…" : mealRemaining > 0 ? "Meal Ready" : "Eat Trail Rations"}</button>
          {!plan.rations_owned && mealRemaining <= 0 ? <small className="muted">Craft two at the Forge with 1 Fish Scale, 1 Potion and 20 Gil, or buy them from the shop.</small> : null}
        </div>
        <div className="camp-choice-card">
          <div className="camp-choice-head"><strong>Recover & Maintain</strong><span className="small-badge">Existing items</span></div>
          <p>Camp still restores full HP and resources on its timer. Need to leave sooner? Use what you already carry.</p>
          <div className="camp-compact-actions">
            <button className="equipment-action-button secondary" type="button" disabled={!canPrepare || !needsRecovery || !plan.tent_owned}
              onClick={() => useItem("tent")}>{busy === "camp:item:tent" ? "Using…" : `Use Tent (${number(plan.tent_owned)})`}</button>
            <button className="equipment-action-button secondary" type="button" disabled={!canPrepare || !hpMissing || Number(camp.hp || 0) <= 0 || !plan.potion_owned}
              onClick={() => useItem("potion")}>{busy === "camp:item:potion" ? "Using…" : `Use Potion (${number(plan.potion_owned)})`}</button>
          </div>
          <small className="muted">Gear checks do not consume equipment or introduce durability.</small>
        </div>
        <div className="camp-choice-card">
          <div className="camp-choice-head"><strong>Pick One Preparation</strong><span className="small-badge">Next Solo Venture</span></div>
          <p>Choose one free plan. Change your mind before departing; it is used when you begin your next Solo Venture.</p>
          <div className="camp-preparation-options" role="group" aria-label="Choose one Solo Venture preparation">
            {[{ id: "scout", label: "Scout the Route", description: "+10% secured XP and JP from the next Solo Venture." },
              { id: "sharpen", label: "Check Your Gear", description: "+8% damage throughout your next Solo Venture." },
              { id: "supplies", label: "Pack Supplies", description: "Restore 10% HP and Job resources after each Solo Venture combat victory." }].map((choice) => <button key={choice.id} type="button"
              className={`camp-preparation-option ${plan.preparation === choice.id ? "selected" : ""}`}
              aria-pressed={plan.preparation === choice.id} disabled={!canPrepare || plan.preparation === choice.id}
              onClick={() => setPlan(choice.id)}>
                <strong>{choice.label}</strong><span>{choice.description}</span>
                {plan.preparation === choice.id ? <em>Selected</em> : null}
              </button>)}
          </div>
          {plan.reason ? <small className="adventure-disabled-reason">{plan.reason}</small> : null}
        </div>
      </div>
      </div>
    </div>
  );
}

function ResultConfirmation({ resultId, onConfirm, confirming, label = "Confirm Result" }) {
  if (!resultId || typeof onConfirm !== "function") return null;
  return (
    <div className="adventure-result-confirmation">
      <div>
        <strong>Saved until you confirm</strong>
        <span>This result will remain on your Adventure Board even if you leave the Portal.</span>
      </div>
      <button
        type="button"
        className="equipment-action-button secondary"
        disabled={Boolean(confirming)}
        onClick={() => onConfirm(resultId)}
      >
        {confirming ? "Confirming…" : label}
      </button>
    </div>
  );
}

function SoloVentureResult({ summary, cooldownRemaining, resultId, onConfirm, confirming }) {
  if (!summary) return null;
  if (summary.type === "expedition") {
    const rewards = summary.rewards || {};
    const success = !["defeat", "retreat"].includes(summary.outcome);
    return (
      <div className={`solo-result-panel solo-result-inline ${success ? "won" : "lost"}`}>
        <div className="panel-title-row">
          <div><p className="eyebrow">Last Solo Venture</p><h3>{summary.title || (success ? "Expedition Complete" : "Expedition Ended")}</h3><p className="muted">{summary.region_name} · {number(summary.stages || 1)} stage{Number(summary.stages || 1) === 1 ? "" : "s"}</p></div>
          <span className={`small-badge ${success ? "success" : ""}`}>{summary.outcome === "defeat" ? "Defeat" : summary.outcome === "retreat" ? "Retreated" : "Returned"}</span>
        </div>
        <div className="solo-result-grid">
          <div><span>Secured Progress</span><strong>+{number(rewards.xp)} XP · +{number(rewards.jp)} JP</strong></div>
          <div><span>Banked Gil</span><strong>{number(rewards.gil)} Gil</strong></div>
          <div><span>Fellowship</span><strong>+{number(rewards.fellowship_renown)} Renown</strong></div>
          <div><span>Condition</span><strong>HP {number(summary.player?.hp)} / {number(summary.player?.max_hp)}</strong></div>
        </div>
        {Array.isArray(rewards.loot) && rewards.loot.length ? <p className="solo-result-loot"><strong>Banked spoils:</strong> {rewards.loot.join(" · ")}</p> : null}
        {summary.lost_spoils?.gil || summary.lost_spoils?.items?.length ? <p className="solo-result-loot"><strong>Lost on the road:</strong> {number(summary.lost_spoils?.gil || 0)} Gil{summary.lost_spoils?.items?.length ? ` · ${summary.lost_spoils.items.join(" · ")}` : ""}</p> : null}
        <div className="adventure-combat-note"><strong>{cooldownRemaining > 0 ? `Next Solo Venture in ${duration(cooldownRemaining)}` : "Solo Venture ready again"}</strong><span>{soloVentureSummary(summary)}</span></div>
        <ResultConfirmation resultId={resultId} onConfirm={onConfirm} confirming={confirming} />
      </div>
    );
  }
  const treasure = summary.type === "treasure";
  const victory = summary.outcome === "victory";
  const rewards = summary.rewards || {};
  const player = summary.player || {};
  const combat = summary.combat || {};
  const enemy = summary.enemy || {};
  const item = summary.item || {};
  const loot = Array.isArray(rewards.loot) ? rewards.loot.filter(Boolean) : [];
  const resultClass = treasure || victory ? "won" : "lost";
  const resultLabel = treasure ? "Treasure" : victory ? "Victory" : "Defeat";

  return (
    <div className={`solo-result-panel solo-result-inline ${resultClass}`}>
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Last Solo Venture</p>
          <h3>{treasure ? "Treasure found" : `${resultLabel} · ${enemy.name || "Encounter"}`}</h3>
          <p className="muted">{summary.region_name}{!treasure && enemy.level ? ` · Enemy Lv. ${number(enemy.level)}` : ""}</p>
        </div>
        <span className={`small-badge ${treasure || victory ? "success" : ""}`}>{resultLabel}</span>
      </div>

      {treasure ? (
        <div className="solo-result-highlight">
          <span>Chest reward</span>
          <strong>{item.name || loot[0] || "Treasure"}</strong>
          <small>{[item.category, item.level ? `Lv. ${number(item.level)}` : "", item.rarity].filter(Boolean).join(" · ")}</small>
        </div>
      ) : (
        <div className="solo-result-grid">
          <div><span>Battle</span><strong>{victory ? `Won in ${number(summary.rounds)} round${Number(summary.rounds) === 1 ? "" : "s"}` : `Ended after ${number(summary.rounds)} rounds`}</strong></div>
          <div><span>Rewards</span><strong>{victory ? `+${number(rewards.xp)} XP · +${number(rewards.jp)} JP · +${number(rewards.gil)} Gil` : "No battle rewards"}</strong></div>
          <div><span>Fellowship</span><strong>+{number(rewards.fellowship_renown)} Renown</strong></div>
          <div><span>Condition</span><strong>HP {number(player.hp)} / {number(player.max_hp)}</strong></div>
        </div>
      )}

      {!treasure ? (
        <>
          {Number(player.max_hp || 0) > 0 ? <ProgressBar value={pct(player.hp, player.max_hp)} className="hp" /> : null}
          <div className="solo-result-combat-line">
            <span>Damage dealt <strong>{number(combat.damage_dealt)}</strong></span>
            <span>Damage taken <strong>{number(combat.damage_taken)}</strong></span>
            <span>Best hit <strong>{number(combat.best_hit)}</strong></span>
          </div>
        </>
      ) : (
        <div className="solo-result-grid treasure-summary-grid">
          <div><span>Fellowship</span><strong>+{number(rewards.fellowship_renown)} Renown</strong></div>
          <div><span>Condition</span><strong>HP {number(player.hp)} / {number(player.max_hp)}</strong></div>
        </div>
      )}

      {loot.length > 0 && !treasure ? <p className="solo-result-loot"><strong>Loot:</strong> {loot.join(" · ")}</p> : null}
      {Array.isArray(rewards.levelups) && rewards.levelups.length ? <p className="solo-result-loot"><strong>Level up:</strong> {rewards.levelups.join(" · ")}</p> : null}
      {Array.isArray(rewards.achievements) && rewards.achievements.length ? <p className="solo-result-loot"><strong>Achievement:</strong> {rewards.achievements.join(" · ")}</p> : null}
      {Array.isArray(summary.notes) && summary.notes.length ? <p className="solo-result-loot"><strong>Companion:</strong> {summary.notes.join(" · ")}</p> : null}
      <div className="adventure-combat-note">
        <strong>{cooldownRemaining > 0 ? `Next Solo Venture in ${duration(cooldownRemaining)}` : "Solo Venture ready again"}</strong>
        <span>{soloVentureSummary(summary)}</span>
      </div>
      <ResultConfirmation resultId={resultId} onConfirm={onConfirm} confirming={confirming} />
    </div>
  );
}

function HuntResult({ result, onConfirm, confirming }) {
  const summary = result?.summary || null;
  if (!summary) {
    return (
      <section className={`panel hunt-result-panel legacy ${result?.won ? "won" : "lost"}`} aria-live="polite">
        <img loading="lazy" className="panel-scenic-art hunt-result-scenic-art" src="/trails-raids/h4/hunt-active.webp" alt="" aria-hidden="true" decoding="async" />
        <div className="panel-title-row">
          <div><p className="eyebrow">Last Hunt Result</p><h2>{result?.hunt_name || result?.monster_name || "Hunt Result"}</h2></div>
          <span className={`small-badge ${result?.won ? "success" : ""}`}>{result?.won ? "Victory" : "Failed"}</span>
        </div>
        {(result?.messages || []).slice(0, 2).map((line, index) => <p className="hunt-result-legacy-line" key={`${index}:${line}`}>{line}</p>)}
        <ResultConfirmation resultId={result?.result_id} onConfirm={onConfirm} confirming={confirming} />
      </section>
    );
  }

  const victory = summary.outcome === "victory";
  const rewards = summary.rewards || {};
  const monster = summary.monster || {};
  const player = summary.player || {};
  const combat = summary.combat || {};
  const autoPlan = summary.auto_plan || null;
  const loot = Array.isArray(rewards.loot) ? rewards.loot.filter(Boolean) : [];
  const firstRewards = Array.isArray(rewards.first_rewards) ? rewards.first_rewards.filter(Boolean) : [];
  const levelups = Array.isArray(rewards.levelups) ? rewards.levelups.filter(Boolean) : [];
  const achievements = Array.isArray(rewards.achievements) ? rewards.achievements.filter(Boolean) : [];

  return (
    <section className={`panel hunt-result-panel ${victory ? "won" : "lost"}`} aria-live="polite" aria-labelledby="last-hunt-result-title">
      <img loading="lazy" className="panel-scenic-art hunt-result-scenic-art" src="/trails-raids/h4/hunt-active.webp" alt="" aria-hidden="true" decoding="async" />
      <div className="hunt-result-identity">
        <MonsterPortrait monster={monster} name={monster.name} className="hunt-result-portrait" />
        <div className="panel-title-row hunt-result-title-row">
        <div>
          <p className="eyebrow">Last Hunt Result · {summary.rank || "C"}-Rank</p>
          <h2 id="last-hunt-result-title">{summary.hunt_name || "Named Mark"}</h2>
          <p className="muted">{monster.name || "Unknown Mark"}{monster.level ? ` · Mark Lv. ${number(monster.level)}` : ""} · {number(summary.rounds || 0)} round{Number(summary.rounds || 0) === 1 ? "" : "s"}</p>
        </div>
        <span className={`hunt-result-outcome ${victory ? "victory" : "defeat"}`}>{victory ? "Mark Slain" : "Hunt Failed"}</span>
      </div>
      </div>

      {victory ? (
        <div className="hunt-result-reward-grid" aria-label="Hunt rewards">
          <div><span>XP</span><strong>+{number(rewards.xp)}</strong></div>
          <div><span>JP</span><strong>+{number(rewards.jp)}</strong></div>
          <div><span>Gil</span><strong>+{number(rewards.gil)}</strong></div>
          <div><span>Hunt Seals</span><strong>+{number(rewards.seals)}</strong></div>
        </div>
      ) : (
        <div className="hunt-result-survival">
          <div><span>Mark remaining HP</span><strong>{number(monster.hp_remaining)} / {number(monster.max_hp)}</strong></div>
          {Number(monster.max_hp || 0) > 0 ? <ProgressBar value={pct(monster.hp_remaining, monster.max_hp)} className="hp" /> : null}
          {summary.reason ? <p>{summary.reason}</p> : null}
        </div>
      )}

      <div className="hunt-result-combat-grid">
        <div><span>Your condition</span><strong>HP {number(player.hp)} / {number(player.max_hp)}</strong></div>
        <div><span>Damage dealt</span><strong>{number(combat.damage_dealt)}</strong></div>
        <div><span>Damage taken</span><strong>{number(combat.damage_taken)}</strong></div>
        <div><span>Best hit</span><strong>{number(combat.best_hit)}</strong></div>
      </div>

      {victory && (loot.length || firstRewards.length || levelups.length || achievements.length) ? (
        <div className="hunt-result-details">
          {loot.length ? <p><strong>Loot</strong><span>{loot.join(" · ")}</span></p> : null}
          {firstRewards.length ? <p className="first-clear"><strong>First clear</strong><span>{firstRewards.join(" · ")}</span></p> : null}
          {levelups.length ? <p><strong>Level up</strong><span>{levelups.join(" · ")}</span></p> : null}
          {achievements.length ? <p><strong>Achievement</strong><span>{achievements.join(" · ")}</span></p> : null}
        </div>
      ) : null}

      {autoPlan ? (
        <div className="hunt-result-auto-plan">
          <strong>Auto plan</strong>
          <span>{number(autoPlan.abilities)} abilities · {number(autoPlan.items)} items · {number(autoPlan.defends)} defends</span>
        </div>
      ) : null}
      <ResultConfirmation resultId={result?.result_id} onConfirm={onConfirm} confirming={confirming} />
    </section>
  );
}

function HuntRecord({ data }) {
  return (
    <section className="panel">
      <div className="panel-title-row"><h2>Hunt Record</h2><span className="small-badge">View only</span></div>
      <div className="stat-grid">
        {Object.entries(data?.summary || {}).map(([rank, value]) => (
          <StatCard key={rank} current={value.cleared} max={value.total} label={`${rank}-Rank`} />
        ))}
      </div>
      <div className="content-grid adventure-record-grid">
        {[...(data?.hunts || [])].sort(compareByLevel).map((hunt) => (
          <article className="hunt-card" key={hunt.id || hunt.name}>
            <div className="slot-label">{hunt.rank}-Rank · Lv. {number(hunt.min_level)}</div>
            <div className="job-name">{hunt.name}</div>
            <div className="card-meta">{hunt.monster}</div>
            <div className="card-actions"><span className="small-badge">{number(hunt.clears)} clears</span></div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function Hunts({ data, overview, onRefresh, onNavigate, mode = "adventure" }) {
  const { auth } = usePortalAuth();
  const [state, setState] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const [rank, setRank] = useState("ALL");
  const [soloPicker, setSoloPicker] = useState("");
  const [clock, setClock] = useState(() => Date.now());
  const [serverOffsetMs, setServerOffsetMs] = useState(0);
  const [regionsOpen, setRegionsOpen] = useState(() => defaultSectionOpen("crystal-guild:adventure:travel-regions"));
  const [huntBoardOpen, setHuntBoardOpen] = useState(() => defaultSectionOpen("crystal-guild:adventure:hunt-board"));
  const completionRefresh = useRef(0);
  const stateInflight = useRef(false);

  useEffect(() => {
    try { window.localStorage?.setItem("crystal-guild:adventure:travel-regions", regionsOpen ? "open" : "closed"); } catch {}
  }, [regionsOpen]);
  useEffect(() => {
    try { window.localStorage?.setItem("crystal-guild:adventure:hunt-board", huntBoardOpen ? "open" : "closed"); } catch {}
  }, [huntBoardOpen]);

  const username = String(overview?.identity?.username || data?.player?.username || "").toLowerCase();
  const isOwnProfile = Boolean(
    auth.authenticated
    && auth.player?.username
    && String(auth.player.username).toLowerCase() === username
  );
  const capabilities = useMemo(
    () => new Set(Array.isArray(auth.action_capabilities) ? auth.action_capabilities : []),
    [auth.action_capabilities],
  );
  const requiredCapabilities = ["ADVENTURE_STATE", "TRAVEL_REGION", "SOLO_VENTURE", "SOLO_EXPEDITION_ACTION", "SOLO_EXPEDITION_CONTINUE", "SOLO_EXPEDITION_RETURN", "SOLO_EXPEDITION_RETREAT", "CHALLENGE_HUNT", "ACK_ADVENTURE_RESULT", "START_REST", "EXPEDITION_START", "EXPEDITION_RESOLVE_STAGE", "EXPEDITION_ACTION", "EXPEDITION_CONTINUE", "EXPEDITION_CAMP", "EXPEDITION_RETURN", "EXPEDITION_RETREAT"];
  const actionsAvailable = Boolean(
    isOwnProfile
    && auth.actions_enabled
    && requiredCapabilities.every((kind) => capabilities.has(kind))
  );
  const csrfToken = auth.csrf_token || "";

  const loadState = useCallback(async ({ quiet = false } = {}) => {
    if (!actionsAvailable || (busy && !quiet) || stateInflight.current) return null;
    if (!quiet) {
      setBusy("state");
      setMessage("Checking the Adventure Board…");
    }
    stateInflight.current = true;
    const idem = actionKey("adventure-state", "board", username);
    try {
      const response = await submitAdventureState(csrfToken, idem);
      const finished = await finishedAction(response);
      if (!finished) {
        if (!quiet) setMessage("The Adventure Board request is still being processed. Refreshing or retrying will resume the same request instead of adding another one.");
        return null;
      }
      clearActionKey("adventure-state", "board", username, idem);
      if (finished.status !== "completed" || finished.result?.ok === false) {
        if (!quiet) setMessage(finished.result?.message || "Adventure state could not be loaded.");
        return null;
      }
      const next = finished.result?.data?.adventure_state || null;
      if (next) {
        const receivedAt = Date.now();
        setState(next);
        setServerOffsetMs(Number(next.server_now || 0) > 0 ? Number(next.server_now) * 1000 - receivedAt : 0);
        setClock(receivedAt);
      }
      if (!quiet) setMessage("Adventure Board refreshed.");
      return next;
    } catch (error) {
      const text = String(error?.message || error);
      if (!quiet) setMessage(text.includes("Too many") && text.includes("waiting for the Bot")
        ? "Crystal Guild is catching up on existing Portal requests. This board will resume the same refresh instead of adding another one."
        : text);
      return null;
    } finally {
      stateInflight.current = false;
      if (!quiet) setBusy("");
    }
  }, [actionsAvailable, busy, csrfToken, username]);

  useEffect(() => {
    if (!actionsAvailable || state) return;
    void loadState({ quiet: true });
  }, [actionsAvailable, state, loadState]);

  useEffect(() => {
    if (!actionsAvailable || state) return undefined;
    const retryBootstrap = () => {
      if (document.visibilityState === "visible") void loadState({ quiet: true });
    };
    const timer = window.setInterval(retryBootstrap, 30000);
    return () => window.clearInterval(timer);
  }, [actionsAvailable, state, loadState]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const expeditionActive = Boolean(state?.solo_venture?.expedition);
    const fieldExpeditionActive = Boolean(state?.expeditions?.active);
    const dungeonActive = Boolean(state?.dungeons?.active);
    if (!actionsAvailable || (!state?.encounter && !state?.active_hunt && !expeditionActive && !fieldExpeditionActive && !dungeonActive)) return undefined;
    const refreshActive = () => {
      if (document.visibilityState === "visible") void loadState({ quiet: true });
    };
    const timer = window.setInterval(refreshActive, state?.active_hunt ? 60000 : fieldExpeditionActive ? 30000 : expeditionActive ? 30000 : dungeonActive ? 30000 : 30000);
    window.addEventListener("crystal-guild-live-revision", refreshActive);
    window.addEventListener("focus", refreshActive);
    window.addEventListener("pageshow", refreshActive);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("crystal-guild-live-revision", refreshActive);
      window.removeEventListener("focus", refreshActive);
      window.removeEventListener("pageshow", refreshActive);
    };
  }, [actionsAvailable, state?.encounter?.id, state?.encounter?.state, state?.active_hunt?.id, state?.solo_venture?.expedition?.updated_at, state?.expeditions?.active?.travel_ready_at, state?.expeditions?.active?.status, state?.dungeons?.active?.run_id, state?.dungeons?.active?.room_number, state?.dungeons?.active?.status, loadState]);

  useEffect(() => {
    if (!actionsAvailable || !state) return undefined;
    const deadlines = [
      Number(state.venture?.available_at || 0),
      Number(state.solo_venture?.available_at || 0),
      ...((state.hunts || []).map((hunt) => Number(hunt.cooldown_available_at || 0))),
      Number(state.encounter?.rally_closes_at || 0),
      Number(state.encounter?.next_round_at || 0),
      Number(state.active_hunt?.resolves_at || 0),
      Number(state.camp?.until || 0),
      Number(state.expeditions?.active?.travel_ready_at || 0),
    ];
    const authoritativeNow = Date.now() + serverOffsetMs;
    const futureDeadlines = deadlines.filter((value) => value > Math.floor(authoritativeNow / 1000));
    if (!futureDeadlines.length) return undefined;
    const nearest = Math.min(...futureDeadlines);
    const waitMs = Math.max(250, nearest * 1000 - authoritativeNow + 250);
    const timer = window.setTimeout(() => void loadState({ quiet: true }), waitMs);
    return () => window.clearTimeout(timer);
  }, [actionsAvailable, state, serverOffsetMs, loadState]);

  useEffect(() => {
    if (!actionsAvailable) return undefined;
    const refreshVisible = () => {
      if (document.visibilityState === "visible") void loadState({ quiet: true });
    };
    window.addEventListener("focus", refreshVisible);
    window.addEventListener("pageshow", refreshVisible);
    document.addEventListener("visibilitychange", refreshVisible);
    return () => {
      window.removeEventListener("focus", refreshVisible);
      window.removeEventListener("pageshow", refreshVisible);
      document.removeEventListener("visibilitychange", refreshVisible);
    };
  }, [actionsAvailable, loadState]);

  const runRequest = async (key, idemKind, idemTarget, submit, fallback) => {
    if (!actionsAvailable || busy) return;
    setBusy(key);
    setMessage("Crystal Guild is handling that request…");
    const idem = actionKey(idemKind, idemTarget, username);
    try {
      const response = await submit(idem);
      const finished = await finishedAction(response);
      if (!finished) {
        setMessage("That request is still being processed. Retry or refresh safely resumes the same request; it will not queue the action twice.");
        return;
      }
      clearActionKey(idemKind, idemTarget, username, idem);
      const soloResult = finished.result?.data?.solo_result;
      setMessage(soloResult ? soloVentureSummary(soloResult) : (finished.result?.message || fallback));
      const next = finished.result?.data?.adventure_state;
      if (next) {
        const receivedAt = Date.now();
        setState(next);
        setServerOffsetMs(Number(next.server_now || 0) > 0 ? Number(next.server_now) * 1000 - receivedAt : 0);
        setClock(receivedAt);
      } else if (finished.status === "completed" && finished.result?.ok !== false) {
        await loadState({ quiet: true });
      }
      if (finished.status === "completed" && finished.result?.ok !== false) {
        setSoloPicker("");
        onRefresh?.();
        window.clearTimeout(completionRefresh.current);
        completionRefresh.current = window.setTimeout(() => onRefresh?.(), 3200);
      }
    } catch (error) {
      const text = String(error?.message || error);
      setMessage(text.includes("Too many") && text.includes("waiting for the Bot")
        ? "Crystal Guild is catching up on existing Portal requests. Retry this same action in a moment; it will not be duplicated."
        : text);
    } finally {
      setBusy("");
    }
  };

  const confirmAdventureResult = (resultId) => runRequest(
    `ack-result:${resultId}`,
    "ack-result",
    String(resultId),
    (idem) => submitAcknowledgeAdventureResult(resultId, csrfToken, idem),
    "Adventure result confirmed.",
  );

  if (!isOwnProfile) return mode === "ascension"
    ? <section className="panel ascension-standalone-panel"><p className="eyebrow">Job Mastery</p><h2>Trials of Ascension</h2><p className="muted">Sign in and open your own adventurer profile to view and begin your Job trials.</p></section>
    : <HuntRecord data={data} />;

  const boardStateReady = Boolean(state);
  const authoritativeClock = clock + serverOffsetMs;
  const soloRemaining = remainingUntil(state?.solo_venture?.available_at, authoritativeClock);
  const soloReason = !boardStateReady
    ? "Checking Crystal Guild for your current Solo Venture…"
    : soloRemaining > 0
      ? `Solo Venture ready in ${duration(soloRemaining)}.`
      : String(state?.solo_venture?.reason || "");
  const encounter = state?.encounter || null;
  const activeHunt = state?.active_hunt || null;
  const activeHuntRemaining = remainingUntil(activeHunt?.resolves_at, authoritativeClock);
  const roundRemaining = remainingUntil(encounter?.next_round_at, authoritativeClock);
  const currentRegion = state?.current_region || { name: overview?.region?.name || "Unknown Region" };
  const regions = [...(state?.regions || [])].sort((a, b) => Number(a?.min_level || 1) - Number(b?.min_level || 1) || String(a?.name || "").localeCompare(String(b?.name || "")));
  const hunts = (state?.hunts || []).filter((hunt) => rank === "ALL" || hunt.rank === rank).sort(compareByLevel);
  const huntRanks = ["ALL", "C", "B", "A", "S", ...(["S+", "SS"].filter((value) => (state?.hunts || []).some((hunt) => hunt.rank === value)))];
  const expedition = state?.solo_venture?.expedition || null;
  const availableSoloAbilities = (expedition?.combat?.abilities || []).filter((ability) => ability.usable);
  const pendingResults = Array.isArray(state?.pending_results) ? state.pending_results : [];
  const pendingSoloResults = pendingResults.filter((result) => result?.kind === "solo_venture");
  const pendingHuntResults = pendingResults.filter((result) => result?.kind === "hunt");
  const pendingExpeditionResults = pendingResults.filter((result) => result?.kind === "expedition");
  const pendingDungeonResults = pendingResults.filter((result) => result?.kind === "dungeon");
  const soloEncounterChance = Number(state?.solo_venture?.encounter_chance_percent ?? 80);
  const soloTreasureChance = Number(state?.solo_venture?.treasure_chance_percent ?? 20);
  const fieldExpedition = state?.expeditions?.active || null;
  const dungeonRun = state?.dungeons?.active || null;
  const readyDungeonCount = (state?.dungeons?.dungeons || []).filter((entry) => entry?.unlocked).length;
  const readyHuntCount = (state?.hunts || []).filter((hunt) => Boolean(hunt.challengeable) && remainingUntil(hunt.cooldown_available_at, authoritativeClock) <= 0).length;
  const activeAdventureLabel = dungeonRun
    ? `${dungeonRun.ascension_trial ? "Ascension Trial" : "Dungeon"} · ${dungeonRun.name || "In progress"}`
    : fieldExpedition
      ? `Expedition · ${fieldExpedition.region?.name || "In progress"}`
      : expedition
      ? `Solo Venture · Stage ${number(expedition.stage)}`
      : activeHunt
        ? `Hunt · ${activeHunt.name}`
        : encounter && encounter.kind !== "venture"
          ? `Adventure · ${encounter.monster?.name || "In progress"}`
          : state?.camp?.resting
            ? "Camp · Resting"
            : "No active adventure";
  const soloBoardLabel = expedition ? `Stage ${number(expedition.stage)}` : soloRemaining > 0 ? duration(soloRemaining) : state?.solo_venture?.ready ? "Ready" : "Unavailable";
  const expeditionBoardLabel = fieldExpedition ? `Stage ${number(fieldExpedition.stage)}` : state?.expeditions?.ready ? "Ready" : <LockIcon label="Expedition Board locked" />;
  const dungeonBoardLabel = dungeonRun ? `Room ${number(dungeonRun.room_number)} / ${number(dungeonRun.room_count)}` : readyDungeonCount ? `${number(readyDungeonCount)} ready` : <LockIcon label="Dungeon Board locked" />;
  const huntBoardLabel = activeHunt ? `Returns in ${duration(activeHuntRemaining)}` : readyHuntCount ? `${number(readyHuntCount)} ready` : "No marks ready";


  if (mode === "ascension") return (
    <section className="adventure-board-stack ascension-profile-section" aria-label="Ascension Trials section">
      {!state ? <div className="equipment-action-status compact-status offline" role="status">Checking your Ascension Trials…</div> : null}
      {message ? <p className="adventure-action-message" role="status">{message}</p> : null}
      <Dungeons
        mode="ascension"
        data={state?.dungeons}
        csrfToken={csrfToken}
        actionsAvailable={actionsAvailable}
        busy={busy}
        runRequest={runRequest}
        pendingResults={pendingDungeonResults}
        onConfirmResult={confirmAdventureResult}
        onNavigate={onNavigate}
      />
    </section>
  );

  const renderActiveEncounter = (embedded = false) => {
    if (!encounter) return null;
    const Tag = embedded ? "div" : "section";
    return (
      <Tag className={`${embedded ? "active-adventure-embedded " : "panel "}active-adventure-panel ${encounter.kind}`}>
        <div className="panel-title-row">
          <div>
            <p className="eyebrow">{encounter.kind === "hunt" ? `${encounter.hunt?.rank || ""}-Rank Active Hunt` : "Solo Venture Encounter"}</p>
            <h2>{encounter.hunt?.name || encounter.monster?.name}</h2>
            <p className="muted">{encounter.monster?.name} · Lv. {number(encounter.monster?.level)} · {encounter.region?.name}</p>
          </div>
          <span className="small-badge">Round {number(encounter.round || 1)}</span>
        </div>
        {encounter.state === "combat" && Number(encounter.enemy_max_hp || 0) > 0 ? (
          <div className="adventure-enemy-vitals">
            <div><span>Enemy HP</span><strong>{number(encounter.enemy_hp)} / {number(encounter.enemy_max_hp)}</strong></div>
            <ProgressBar value={pct(encounter.enemy_hp, encounter.enemy_max_hp)} className="hp" />
            <small>{roundRemaining > 0 ? `Next round in ${duration(roundRemaining)}` : "Round resolving…"}</small>
          </div>
        ) : null}
        <div className="adventure-party-grid">
          {(encounter.party || []).map((member) => (
            <div className="adventure-party-member" key={`${member.username}:${member.display_name}`}>
              <strong>{member.display_name}</strong><span>{member.job_name}</span>
              {encounter.state === "combat" && Number(member.max_hp || 0) > 0 ? <small>HP {number(member.hp)} / {number(member.max_hp)}</small> : null}
            </div>
          ))}
        </div>
        {encounter.state === "combat" ? (
          <div className="adventure-combat-note">
            <strong>Battle is underway.</strong>
            <span>{encounter.kind === "solo_venture" ? "This Solo Venture began before the instant-resolution update and will finish automatically here." : "This Hunt began before the timed-Hunt hotfix and is finishing under the legacy battle state. New Hunts resolve automatically at their rank timer without chat combat."}</span>
          </div>
        ) : null}
      </Tag>
    );
  };

  return (
    <section className="adventure-board-stack">
      <section className="panel adventure-hero-panel">
        <div className="panel-title-row adventure-title-row">
          <div>
            <p className="eyebrow">Adventure Board</p>
            <h2>Choose Your Next Adventure</h2>
            <p className="muted">Current activity first. Then choose a personal adventure, contract, travel, or recovery.</p>
          </div>
          <div className="context-help-actions">
            <ContextHelp topic="adventure_board" />
          </div>
        </div>
        <div className={`equipment-action-status compact-status ${actionsAvailable ? "ready" : "offline"}`} role="status">
          <strong>{actionsAvailable ? "Online" : "Offline"}</strong>
          <span>{actionsAvailable ? `Adventure actions ready.${pendingResults.length ? ` ${pendingResults.length} saved result${pendingResults.length === 1 ? "" : "s"} awaiting confirmation.` : ""}` : "Actions return when Crystal Guild reconnects."}</span>
          {message ? <small aria-live="polite">{message}</small> : null}
        </div>
        <div className="adventure-priority-strip" aria-label="Adventure Board status summary">
          <div className={`adventure-priority-item ${activeAdventureLabel === "No active adventure" ? "idle" : "active"}`}><span>Current</span><strong>{activeAdventureLabel}</strong><small>{pendingResults.length ? `${number(pendingResults.length)} saved result${pendingResults.length === 1 ? "" : "s"}` : "Board clear"}</small></div>
          <div className="adventure-priority-item"><span>Solo Venture</span><strong>{soloBoardLabel}</strong><small>Portal only</small></div>
          <div className="adventure-priority-item"><span>Dungeon</span><strong>{dungeonRun?.ascension_trial ? "Separate section" : dungeonBoardLabel}</strong><small>Persistent delve</small></div>
          <div className="adventure-priority-item"><span>Ascension Trials</span><strong>{number(state?.dungeons?.ascension?.completed || 0)} / 4</strong><small>Open dedicated Job Trials tab</small></div>
          <div className="adventure-priority-item"><span>Expedition</span><strong>{expeditionBoardLabel}</strong><small>{state?.expeditions?.chocobo?.specialization?.name || "Chocobo route"}</small></div>
          <div className="adventure-priority-item"><span>Hunts</span><strong>{huntBoardLabel}</strong><small>{number(state?.player?.hunt_seals ?? overview?.identity?.hunt_seals ?? 0)} Seals</small></div>
        </div>
      </section>

      <section className={`panel adventure-camp-panel ${state?.camp?.resting ? "camp-active" : ""}`}>
        <div className="panel-title-row">
          <div><p className="eyebrow">Camp & Recovery</p><h2>{state?.camp?.resting ? `Resting · ${duration(remainingUntil(state.camp.until, authoritativeClock))}` : "Set Up Camp"}</h2></div>
          <div className="context-help-actions"><ContextHelp topic="camp_recovery" /><span className={`small-badge ${state?.camp?.resting ? "success" : state?.camp?.can_start ? "ready" : ""}`}>{state?.camp?.resting ? "Resting" : state?.camp?.can_start ? "Ready" : "Unavailable"}</span></div>
        </div>
        <p className="muted">Full recovery for HP and current Job resources. Base time: 15m LIVE · 1h OFFLINE before Fellowship bonuses.</p>
        {state?.camp ? (
          <div className="adventure-camp-grid">
            <div><span>HP</span><strong>{number(state.camp.hp)} / {number(state.camp.max_hp)}</strong></div>
            {Number(state.camp.max_mp || 0) > 0 ? <div><span>MP</span><strong>{number(state.camp.mp)} / {number(state.camp.max_mp)}</strong></div> : null}
            {Number(state.camp.max_ap || 0) > 0 ? <div><span>AP</span><strong>{number(state.camp.ap)} / {number(state.camp.max_ap)}</strong></div> : null}
            <div><span>{state.camp.stream_live ? "LIVE Camp" : "OFFLINE Camp"}</span><strong>{duration(state.camp.duration_seconds)}</strong></div>
          </div>
        ) : null}
        <div className="venture-action-row">
          <button type="button" className="equipment-action-button" disabled={!actionsAvailable || !boardStateReady || !state?.camp?.can_start || Boolean(busy)} onClick={() => runRequest("camp:start", "camp", "start", (idem) => submitStartRest(csrfToken, idem), "Camp started.")}>{busy === "camp:start" ? "Setting Camp…" : state?.camp?.resting ? "Camp in Progress" : "Set Up Camp"}</button>
          {state?.camp?.reason ? <span className="adventure-disabled-reason">{state.camp.reason}</span> : null}
        </div>
        <CampImprovements
          camp={state?.camp}
          clock={authoritativeClock}
          csrfToken={csrfToken}
          ready={actionsAvailable && boardStateReady}
          busy={busy}
          runRequest={runRequest}
        />
      </section>

      <Dungeons
        mode="dungeons"
        data={state?.dungeons}
        csrfToken={csrfToken}
        actionsAvailable={actionsAvailable}
        busy={busy}
        runRequest={runRequest}
        pendingResults={pendingDungeonResults}
        onConfirmResult={confirmAdventureResult}
        onNavigate={onNavigate}
      />

      <Expeditions
        data={state?.expeditions}
        csrfToken={csrfToken}
        actionsAvailable={actionsAvailable}
        busy={busy}
        runRequest={runRequest}
        authoritativeClock={authoritativeClock}
        pendingResults={pendingExpeditionResults}
        onConfirmResult={confirmAdventureResult}
      />

      <section className={`panel venture-panel solo-venture-panel ${expedition ? "expedition-active" : ""}`}>
        <div className="panel-title-row">
          <div>
            <p className="eyebrow">Solo Venture · Portal Only</p>
            <h2>{expedition ? `Stage ${number(expedition.stage)} of ${number(expedition.max_stages)}` : !boardStateReady ? "Checking your venture…" : soloRemaining > 0 ? `Ready in ${duration(soloRemaining)}` : "Take the road alone"}</h2>
          </div>
          <div className="context-help-actions"><ContextHelp topic="solo_venture" /><span className={`small-badge ${expedition || (boardStateReady && state?.solo_venture?.ready && soloRemaining <= 0) ? "success" : ""}`}>
            {expedition ? (expedition.status === "combat" ? "In Battle" : "Stage Cleared") : !boardStateReady ? "Checking" : soloRemaining > 0 ? "Recovering" : state?.solo_venture?.ready ? "Ready" : "Unavailable"}
          </span></div>
        </div>

        {!expedition ? (
          <>
            <p className="muted">Up to three private stages. Return safely after a clear or press deeper for stronger rewards.</p>
            <div className="solo-venture-rules" aria-label="Solo Venture rules">
              <span><strong>{soloEncounterChance} / {soloTreasureChance}</strong>Encounter / Treasure</span>
              <span><strong>3 stages</strong>Maximum depth</span>
              <span><strong>+{Number(state?.solo_venture?.max_enemy_levels_above_player ?? 5)}</strong>Enemy level ceiling</span>
              <span><strong>7m</strong>Separate cooldown</span>
            </div>
            <div className="venture-action-row">
              <button
                type="button"
                className="equipment-action-button"
                disabled={!actionsAvailable || !boardStateReady || !state?.solo_venture?.ready || soloRemaining > 0 || Boolean(busy)}
                onClick={() => runRequest("solo-venture", "solo-venture", "start", (idem) => submitSoloVenture(csrfToken, idem), "Solo Venture started.")}
              >
                {busy === "solo-venture" ? "Setting Out…" : "Begin Solo Venture"}
              </button>
              {soloReason ? <span className="adventure-disabled-reason">{soloReason}</span> : null}
            </div>
          </>
        ) : (
          <div className="solo-expedition-shell">
            <div className="solo-expedition-ledger">
              <div><span>Secured</span><strong>{number(expedition.secured?.xp || 0)} XP · {number(expedition.secured?.jp || 0)} JP</strong></div>
              <div><span>Venture Spoils</span><strong>{number(expedition.spoils?.gil || 0)} Gil · {number((expedition.spoils?.items || []).reduce((sum, row) => sum + Number(row.quantity || 1), 0))} items</strong></div>
              <div><span>Current Depth Bonus</span><strong>+{number(expedition.stage_bonus_percent || 0)}%</strong></div>
            </div>

            {expedition.status === "combat" && expedition.combat ? (
              <div className="solo-combat-board">
                <div className="solo-combatant enemy">
                  <div className="solo-enemy-layout">
                    <MonsterPortrait monster={expedition.combat.enemy} name={expedition.combat.enemy?.name} className="solo-enemy-portrait" eager />
                    <div className="solo-enemy-copy">
                      <div className="solo-combat-head"><div><span>Enemy</span><h3>{expedition.combat.enemy?.name} · Lv. {number(expedition.combat.enemy?.level)}</h3></div><span className="small-badge">Round {number(expedition.combat.round)}</span></div>
                      <div className="vital-label"><span>HP</span><span>{number(expedition.combat.enemy?.hp)} / {number(expedition.combat.enemy?.max_hp)}</span></div>
                      <ProgressBar value={pct(expedition.combat.enemy?.hp, expedition.combat.enemy?.max_hp)} className="hp" />
                      <div className="solo-enemy-intent"><span>Enemy intent</span><strong>{expedition.combat.enemy?.intent || "Preparing"}</strong></div>
                      {expedition.combat.enemy?.statuses && expedition.combat.enemy.statuses !== "—" ? <small>Status: {expedition.combat.enemy.statuses}</small> : null}
                    </div>
                  </div>
                </div>

                <div className="solo-combatant hero character-solo-hero">
                  <div className="solo-hero-layout">
                    <JobPortrait jobName={expedition.combat.player?.job_name} className="solo-hero-portrait" />
                    <div className="solo-hero-copy">
                      <div className="solo-combat-head"><div><span>Your Hero</span><h3>{expedition.combat.player?.name} · {expedition.combat.player?.job_name}</h3></div></div>
                      <div className="vital-label"><span>HP</span><span>{number(expedition.combat.player?.hp)} / {number(expedition.combat.player?.max_hp)}</span></div>
                      <ProgressBar value={pct(expedition.combat.player?.hp, expedition.combat.player?.max_hp)} className="hp" />
                      {Number(expedition.combat.player?.max_mp || 0) > 0 ? <><div className="vital-label"><span>MP</span><span>{number(expedition.combat.player?.mp)} / {number(expedition.combat.player?.max_mp)}</span></div><ProgressBar value={pct(expedition.combat.player?.mp, expedition.combat.player?.max_mp)} className="mp" /></> : null}
                      {Number(expedition.combat.player?.max_ap || 0) > 0 ? <><div className="vital-label"><span>AP</span><span>{number(expedition.combat.player?.ap)} / {number(expedition.combat.player?.max_ap)}</span></div><ProgressBar value={pct(expedition.combat.player?.ap, expedition.combat.player?.max_ap)} className="ap" /></> : null}
                      {expedition.combat.player?.statuses && expedition.combat.player.statuses !== "—" ? <small>Status: {expedition.combat.player.statuses}</small> : null}
                    </div>
                  </div>
                </div>

                {expedition.last_round?.events?.length ? (
                  <div className="solo-round-log" aria-live="polite">
                    <strong>Round {number(expedition.last_round.round)}</strong>
                    {expedition.last_round.events.map((line, index) => <span key={`${index}:${line}`}>{line}</span>)}
                  </div>
                ) : null}

                <LimitGauge limit={expedition.combat.limit} disabled={Boolean(busy)} onUse={(level) => runRequest(`solo:limit:${level}`, "solo-limit", String(level), (idem) => submitSoloExpeditionAction(`limit:${level}`, csrfToken, idem), "Limit Break complete.")} />
                <MobileCombatHud
                  enemy={expedition.combat.enemy}
                  player={expedition.combat.player}
                  disabled={Boolean(busy)}
                  picker={soloPicker}
                  hasAbilities={availableSoloAbilities.length > 0}
                  hasItems={(expedition.combat.items || []).length > 0}
                  onDismissPicker={() => setSoloPicker("")}
                  onAttack={() => runRequest("solo:attack", "solo-action", "attack", (idem) => submitSoloExpeditionAction("attack", csrfToken, idem), "Attack complete.")}
                  onToggleAbility={() => setSoloPicker(soloPicker === "ability" ? "" : "ability")}
                  onToggleItem={() => setSoloPicker(soloPicker === "item" ? "" : "item")}
                  onDefend={() => runRequest("solo:defend", "solo-action", "defend", (idem) => submitSoloExpeditionAction("defend", csrfToken, idem), "Defend complete.")}
                />

                <div className="solo-command-bar" aria-label="Solo Venture battle actions">
                  <button type="button" className="equipment-action-button combat-tone-offense" disabled={Boolean(busy)} onClick={() => runRequest("solo:attack", "solo-action", "attack", (idem) => submitSoloExpeditionAction("attack", csrfToken, idem), "Attack complete.")}>{busy === "solo:attack" ? "Attacking…" : "Attack"}</button>
                  <button type="button" className={`equipment-action-button secondary combat-tone-ability ${soloPicker === "ability" ? "active" : ""}`} disabled={Boolean(busy)} aria-expanded={soloPicker === "ability"} onClick={(event) => {
                    const next = soloPicker === "ability" ? "" : "ability";
                    const anchor = event.currentTarget;
                    const y = window.scrollY;
                    setSoloPicker(next);
                    window.requestAnimationFrame(() => window.requestAnimationFrame(() => { anchor?.focus?.({ preventScroll: true }); window.scrollTo({ top: y, left: window.scrollX, behavior: "auto" }); }));
                  }}>Ability</button>
                  <button type="button" className={`equipment-action-button secondary combat-tone-item ${soloPicker === "item" ? "active" : ""}`} disabled={Boolean(busy)} aria-expanded={soloPicker === "item"} onClick={(event) => {
                    const next = soloPicker === "item" ? "" : "item";
                    const anchor = event.currentTarget;
                    const y = window.scrollY;
                    setSoloPicker(next);
                    window.requestAnimationFrame(() => window.requestAnimationFrame(() => { anchor?.focus?.({ preventScroll: true }); window.scrollTo({ top: y, left: window.scrollX, behavior: "auto" }); }));
                  }}>Use Item</button>
                  <button type="button" className="equipment-action-button secondary combat-tone-defense" disabled={Boolean(busy)} onClick={() => runRequest("solo:defend", "solo-action", "defend", (idem) => submitSoloExpeditionAction("defend", csrfToken, idem), "Defend complete.")}>{busy === "solo:defend" ? "Defending…" : "Defend"}</button>
                </div>

                {soloPicker === "ability" ? (
                  <MobileCombatDrawer open={soloPicker === "ability"} kind="ability" onClose={() => setSoloPicker("")}><div className="solo-action-picker mobile-combat-drawer">
                    <div className="panel-title-row compact-combat-picker"><h3>Abilities</h3><button type="button" className="equipment-action-button secondary" onClick={() => setSoloPicker("")}>Close</button></div>
                    <div className="solo-action-grid solo-ability-grid">
                      {availableSoloAbilities.length ? availableSoloAbilities.map((ability) => (
                        <button key={ability.id} type="button" className={`solo-action-option solo-ability-option combat-purpose-${battleAbilityPurpose(ability)}`} disabled={Boolean(busy)} title={battleAbilitySummary(ability) || ability.description || ability.name} onClick={() => runRequest(`solo:ability:${ability.id}`, "solo-ability", ability.id, (idem) => submitSoloExpeditionAction(`ability:${ability.id}`, csrfToken, idem), `${ability.name} complete.`)}>
                          <strong>{ability.name}</strong>
                          <span>{number(ability.cost)} {String(ability.resource || "MP").toUpperCase()}</span>
                          {battleAbilitySummary(ability) ? <small>{battleAbilitySummary(ability)}</small> : null}
                        </button>
                      )) : <p className="muted">No abilities available.</p>}
                    </div>
                  </div></MobileCombatDrawer>
                ) : null}

                {soloPicker === "item" ? (
                  <MobileCombatDrawer open={soloPicker === "item"} kind="item" onClose={() => setSoloPicker("")}><div className="solo-action-picker mobile-combat-drawer">
                    <div className="panel-title-row compact-combat-picker"><h3>Items</h3><button type="button" className="equipment-action-button secondary" onClick={() => setSoloPicker("")}>Close</button></div>
                    <div className="solo-action-grid">
                      {(expedition.combat.items || []).length ? sortBattleItems(expedition.combat.items || []).map((item) => (
                        <button key={item.id} type="button" className={`solo-action-option combat-purpose-${battleItemPurpose(item)}`} disabled={Boolean(busy) || !item.usable} title={item.reason || item.description} onClick={() => runRequest(`solo:item:${item.id}`, "solo-item", item.id, (idem) => submitSoloExpeditionAction(`item:${item.id}`, csrfToken, idem), `${item.name} used.`)}>
                          <span><strong>{item.name}</strong><small>Qty {number(item.quantity)}</small></span>
                          <small>{item.usable ? item.description : item.reason}</small>
                        </button>
                      )) : <p className="muted">No battle items available.</p>}
                    </div>
                  </div></MobileCombatDrawer>
                ) : null}

                <div className="solo-retreat-row">
                  <button type="button" className="equipment-action-button ghost danger" disabled={Boolean(busy)} onClick={() => { if (window.confirm("Retreat from this Solo Venture? Secured progression is kept, but unbanked Venture Spoils will be lost.")) runRequest("solo:retreat", "solo-retreat", "run", (idem) => submitSoloExpeditionRetreat(csrfToken, idem), "Retreated from Solo Venture."); }}>{busy === "solo:retreat" ? "Retreating…" : "Retreat — Abandon Venture Spoils"}</button>
                </div>
              </div>
            ) : null}

            {expedition.status === "choice" ? (
              <div className="solo-stage-cleared">
                <div className="solo-result-highlight">
                  <span>Stage {number(expedition.stage)} cleared</span>
                  <strong>{expedition.treasure?.name || expedition.last_stage?.monster?.name || "The road is clear"}</strong>
                  <small>{expedition.treasure ? [expedition.treasure.category, expedition.treasure.level ? `Lv. ${number(expedition.treasure.level)}` : "", expedition.treasure.rarity].filter(Boolean).join(" · ") : expedition.last_stage?.rewards ? `+${number(expedition.last_stage.rewards.xp)} XP · +${number(expedition.last_stage.rewards.jp)} JP secured · ${number(expedition.last_stage.rewards.gil)} Gil in spoils` : "Choose whether to return or continue."}</small>
                </div>
                <div className="solo-choice-actions">
                  <button type="button" className="equipment-action-button" disabled={Boolean(busy)} onClick={() => runRequest("solo:return", "solo-return", "run", (idem) => submitSoloExpeditionReturn(csrfToken, idem), "Returned to the Guild.")}>{busy === "solo:return" ? "Returning…" : "Return to Guild — Bank Spoils"}</button>
                  {expedition.can_press_on ? <button type="button" className="equipment-action-button secondary" disabled={Boolean(busy)} onClick={() => runRequest("solo:continue", "solo-continue", "run", (idem) => submitSoloExpeditionContinue(csrfToken, idem), "Pressed deeper into the Solo Venture.")}>{busy === "solo:continue" ? "Pressing On…" : `Press On — Stage ${number(expedition.stage + 1)}`}</button> : null}
                </div>
                {expedition.can_press_on ? <p className="adventure-disabled-reason">Going deeper raises the stage reward modifier, but your current HP/MP/AP and consumed items carry forward.</p> : null}
              </div>
            ) : null}
          </div>
        )}

        {!expedition && pendingSoloResults.length ? (
          <div className="solo-result-wrap adventure-pending-result-stack" aria-live="polite">
            {pendingSoloResults.map((result) => (
              <SoloVentureResult
                key={`solo-result:${result.result_id}`}
                summary={result.summary}
                cooldownRemaining={soloRemaining}
                resultId={result.result_id}
                onConfirm={confirmAdventureResult}
                confirming={busy === `ack-result:${result.result_id}`}
              />
            ))}
          </div>
        ) : null}
      </section>

      <section className={`panel adventure-region-panel collapsible-board-section ${regionsOpen ? "open" : "collapsed"}`}>
        <div className="panel-title-row section-collapsible-title-row">
          <div><p className="eyebrow">World Map</p><h2>Travel Regions</h2></div>
          <div className="section-collapse-actions">
            <ContextHelp topic="travel_regions" />
            <span className="small-badge success">Current · {currentRegion.name}</span>
            <button type="button" className="section-collapse-button" aria-expanded={regionsOpen} aria-label={regionsOpen ? "Collapse Travel Regions" : "Expand Travel Regions"} title={regionsOpen ? "Collapse Travel Regions" : "Expand Travel Regions"} onClick={(event) => toggleWithViewportAnchor(event, setRegionsOpen)}><CollapsePointer open={regionsOpen} /></button>
          </div>
        </div>
        {regionsOpen ? <div className="adventure-region-grid">
          {regions.map((region) => (
            <article className={`adventure-region-card ${region.current ? "current" : ""} ${!region.unlocked ? "locked" : ""}`} key={region.id}>
              <div className="adventure-region-art" aria-hidden="true">
                <img src={`/retro-phase-ii/regions-hd/${region.id}.webp`} alt="" loading="lazy" decoding="async" />
              </div>
              <div className="card-status-row adventure-region-head">
                <div className="slot-label">Lv. {number(region.min_level)}+</div>
                <span className={`small-badge ${region.current ? "success" : !region.unlocked ? "locked" : ""}`}>{region.current ? "Current" : region.unlocked ? "Unlocked" : <LockIcon label={`Locked region: ${region.name}`} />}</span>
              </div>
              <h3>{region.name}</h3>
              <p className="adventure-region-summary">{region.description}</p>
              {!region.current ? (
                <div className="adventure-card-footer">
                  <button
                    type="button"
                    className="equipment-action-button secondary"
                    disabled={!actionsAvailable || !region.can_travel || Boolean(busy)}
                    title={region.reason || "Travel to this region"}
                    onClick={() => runRequest(`travel:${region.id}`, "travel", region.id, (idem) => submitTravelRegion(region.id, csrfToken, idem), "Travel complete.")}
                  >
                    {busy === `travel:${region.id}` ? "Traveling…" : `Travel to ${region.name}`}
                  </button>
                </div>
              ) : null}
              {region.reason && !region.current ? <small className="adventure-disabled-reason">{region.reason}</small> : null}
            </article>
          ))}
        </div> : null}
      </section>

      {encounter && encounter.kind !== "venture" ? renderActiveEncounter(false) : null}

      {pendingHuntResults.length ? (
        <div className="adventure-pending-result-stack" aria-label="Pending Hunt results">
          {pendingHuntResults.map((result) => (
            <HuntResult
              key={`hunt-result:${result.result_id}`}
              result={result}
              onConfirm={confirmAdventureResult}
              confirming={busy === `ack-result:${result.result_id}`}
            />
          ))}
        </div>
      ) : null}
      {state?.recent_result && !["solo_venture", "hunt", "expedition", "venture"].includes(state.recent_result.kind) ? (
        <section className={`panel adventure-result-panel compact-result ${state.recent_result.won ? "won" : "lost"}`} aria-live="polite">
          <div className="panel-title-row"><div><p className="eyebrow">Recent Adventure</p><h2>{state.recent_result.won ? "Complete" : "Ended"}</h2></div><span className={`small-badge ${state.recent_result.won ? "success" : ""}`}>{state.recent_result.won ? "Victory" : "Defeat"}</span></div>
          <strong>{state.recent_result.monster_name}</strong>
          {(state.recent_result.messages || []).slice(-2).map((line, index) => <p key={`${index}:${line}`}>{line}</p>)}
        </section>
      ) : null}

      {activeHunt ? (
        <section className="panel timed-hunt-panel" aria-live="polite">
          <img loading="lazy" className="panel-scenic-art timed-hunt-scenic-art" src="/trails-raids/h4/hunt-active.webp" alt="" aria-hidden="true" decoding="async" />
          <div className="timed-hunt-identity">
            <MonsterPortrait monster={activeHunt.monster} name={activeHunt.monster?.name} className="timed-hunt-portrait" />
            <div className="panel-title-row timed-hunt-title-row">
            <div>
              <p className="eyebrow elite-rank-label">{["S+", "SS"].includes(activeHunt.rank) ? <img src={`/elite-hunts-197/ui/${activeHunt.rank === "SS" ? "rank_ss" : "rank_s_plus"}.webp`} alt="" aria-hidden="true" /> : null}Hunt in Progress · {activeHunt.rank}-Rank</p>
              <h2>{activeHunt.name}</h2>
              <p className="muted">{activeHunt.monster?.name} · Mark Lv. {number(activeHunt.monster?.level)}</p>
            </div>
            <span className="small-badge success">Auto Hunt</span>
          </div>
          </div>
          <div className="timed-hunt-countdown">
            <div>
              <span>Expected return</span>
              <strong>{activeHuntRemaining > 0 ? duration(activeHuntRemaining) : "Resolving…"}</strong>
            </div>
            <div>
              <span>Assignment length</span>
              <strong>{duration(activeHunt.duration_seconds)}</strong>
            </div>
          </div>
          <ProgressBar value={Number(activeHunt.progress_percent || 0)} />
          <div className="adventure-combat-note timed-hunt-note">
            <strong>Automatic Hunt.</strong>
            <span>Resolves when the assignment timer ends.</span>
          </div>
        </section>
      ) : null}

      <section className={`panel hunt-board-panel collapsible-board-section ${huntBoardOpen ? "open" : "collapsed"}`}>
        <div className="panel-title-row hunt-board-title-row section-collapsible-title-row">
          <div><p className="eyebrow">Guild Hunt Board</p><h2>Named Marks</h2></div>
          <div className="section-collapse-actions">
            <ContextHelp topic="hunts" />
            <div className="hunt-seal-wallet"><strong>{number(state?.player?.hunt_seals ?? overview?.identity?.hunt_seals ?? 0)}</strong><span>Hunt Seals</span></div>
            <button type="button" className="section-collapse-button" aria-expanded={huntBoardOpen} aria-label={huntBoardOpen ? "Collapse Hunt Board" : "Expand Hunt Board"} title={huntBoardOpen ? "Collapse Hunt Board" : "Expand Hunt Board"} onClick={(event) => toggleWithViewportAnchor(event, setHuntBoardOpen)}><CollapsePointer open={huntBoardOpen} /></button>
          </div>
        </div>
        {huntBoardOpen ? <>
        <div className="hunt-rank-filters" role="group" aria-label="Filter Hunts by rank">
          {huntRanks.map((value) => <button key={value} type="button" className={rank === value ? "active" : ""} aria-pressed={rank === value} onClick={() => setRank(value)}>{value === "ALL" ? "All Hunts" : `${value}-Rank Hunts`}</button>)}
        </div>
        <div className="hunt-board-grid">
          {hunts.map((hunt) => {
            const cooldown = remainingUntil(hunt.cooldown_available_at, authoritativeClock);
            const available = Boolean(hunt.challengeable && cooldown <= 0);
            return (
              <article className={`adventure-hunt-card rank-${String(hunt.rank || "c").toLowerCase()} ${available ? "available" : ""}`} key={hunt.id}>
                <div className="hunt-card-identity">
                  <MonsterPortrait monster={hunt.monster} name={hunt.monster?.name} className="hunt-card-portrait" />
                  <div className="adventure-hunt-head">
                    <div><span className="slot-label elite-rank-label">{["S+", "SS"].includes(hunt.rank) ? <img src={`/elite-hunts-197/ui/${hunt.rank === "SS" ? "rank_ss" : "rank_s_plus"}.webp`} alt="" aria-hidden="true" /> : null}{hunt.rank}-Rank · Mark Lv. {number(hunt.monster?.level || hunt.min_level)}</span><h3>{hunt.name}</h3><p>{hunt.monster?.name}</p></div>
                    <span className={`small-badge ${available ? "success" : ""}`}>{hunt.clears > 0 ? `${number(hunt.clears)} clears` : available ? "Available" : <LockIcon label={`Locked hunt: ${hunt.name}`} />}</span>
                  </div>
                </div>
                <div className="hunt-reward-grid">
                  <span><strong>{number(hunt.rewards?.xp)}</strong> XP</span>
                  <span><strong>{number(hunt.rewards?.jp)}</strong> JP</span>
                  <span><strong>{number(hunt.rewards?.gil)}</strong> Gil</span>
                  <span><strong>{number(hunt.rewards?.seals)}</strong> Seals</span>
                </div>
                <div className="hunt-traits">
                  {hunt.monster?.weakness ? <span>Weak: <strong>{String(hunt.monster.weakness)}</strong></span> : null}
                  {hunt.monster?.resistance ? <span>Resists: <strong>{String(hunt.monster.resistance)}</strong></span> : null}
                  <span>Duration: <strong>{duration(hunt.duration_seconds)}</strong></span>
                  {hunt.first_clear_rewards?.length ? <span>First clear: <strong>{hunt.first_clear_rewards.join(" · ")}</strong></span> : null}
                </div>
                <div className="adventure-card-footer">
                  <span className="adventure-disabled-reason">{cooldown > 0 ? `Available in ${duration(cooldown)}` : hunt.reason}</span>
                  <button
                    type="button"
                    className="equipment-action-button"
                    disabled={!actionsAvailable || !available || Boolean(busy)}
                    onClick={() => runRequest(`hunt:${hunt.id}`, "hunt", hunt.id, (idem) => submitChallengeHunt(hunt.id, csrfToken, idem), "Hunt accepted.")}
                  >
                    {busy === `hunt:${hunt.id}` ? "Dispatching…" : `Dispatch ${hunt.rank}-Rank Hunt`}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        </> : null}
      </section>
    </section>
  );
}
