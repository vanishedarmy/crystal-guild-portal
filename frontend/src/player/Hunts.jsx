import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  submitAdventureState,
  submitChallengeHunt,
  submitTravelRegion,
  submitSoloVenture,
  submitSoloExpeditionAction,
  submitSoloExpeditionContinue,
  submitSoloExpeditionReturn,
  submitSoloExpeditionRetreat,
  submitStartRest,
  waitForPortalAction,
} from "../api/auth.js";
import ProgressBar from "../components/ProgressBar.jsx";
import StatCard from "../components/StatCard.jsx";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { duration, number, pct } from "../utils/formatters.js";

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
  const enemyLabel = `${enemy.name || "an enemy"}${enemy.level ? ` Lv.${number(enemy.level)}` : ""}`;
  if (summary.outcome === "victory") {
    return `Solo Venture: Victory over ${enemyLabel} — +${number(rewards.xp)} XP · +${number(rewards.jp)} JP · +${number(rewards.gil)} Gil.`;
  }
  return `Solo Venture: Defeated by ${enemyLabel}.`;
}

function SoloVentureResult({ summary, cooldownRemaining }) {
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
          <p className="muted">{summary.region_name}{!treasure && enemy.level ? ` · Enemy Lv.${number(enemy.level)}` : ""}</p>
        </div>
        <span className={`small-badge ${treasure || victory ? "success" : ""}`}>{resultLabel}</span>
      </div>

      {treasure ? (
        <div className="solo-result-highlight">
          <span>Chest reward</span>
          <strong>{item.name || loot[0] || "Treasure"}</strong>
          <small>{[item.category, item.level ? `Lv.${number(item.level)}` : "", item.rarity].filter(Boolean).join(" · ")}</small>
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
    </div>
  );
}

function HuntResult({ result }) {
  const summary = result?.summary || null;
  if (!summary) {
    return (
      <section className={`panel hunt-result-panel legacy ${result?.won ? "won" : "lost"}`} aria-live="polite">
        <div className="panel-title-row">
          <div><p className="eyebrow">Last Hunt Result</p><h2>{result?.hunt_name || result?.monster_name || "Hunt Result"}</h2></div>
          <span className={`small-badge ${result?.won ? "success" : ""}`}>{result?.won ? "Victory" : "Failed"}</span>
        </div>
        {(result?.messages || []).slice(0, 2).map((line, index) => <p className="hunt-result-legacy-line" key={`${index}:${line}`}>{line}</p>)}
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
      <div className="panel-title-row hunt-result-title-row">
        <div>
          <p className="eyebrow">Last Hunt Result · {summary.rank || "C"}-Rank</p>
          <h2 id="last-hunt-result-title">{summary.hunt_name || "Named Mark"}</h2>
          <p className="muted">{monster.name || "Unknown Mark"}{monster.level ? ` · Mark Lv.${number(monster.level)}` : ""} · {number(summary.rounds || 0)} round{Number(summary.rounds || 0) === 1 ? "" : "s"}</p>
        </div>
        <span className={`hunt-result-outcome ${victory ? "victory" : "defeat"}`}>{victory ? "Mark Slain" : "Hunt Failed"}</span>
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
            <div className="slot-label">{hunt.rank}-Rank · Lv.{number(hunt.min_level)}</div>
            <div className="job-name">{hunt.name}</div>
            <div className="card-meta">{hunt.monster}</div>
            <div className="card-actions"><span className="small-badge">{number(hunt.clears)} clears</span></div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function Hunts({ data, overview, onRefresh }) {
  const { auth } = usePortalAuth();
  const [state, setState] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const [rank, setRank] = useState("ALL");
  const [soloPicker, setSoloPicker] = useState("");
  const [clock, setClock] = useState(() => Date.now());
  const completionRefresh = useRef(0);
  const stateInflight = useRef(false);

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
  const requiredCapabilities = ["ADVENTURE_STATE", "TRAVEL_REGION", "SOLO_VENTURE", "SOLO_EXPEDITION_ACTION", "SOLO_EXPEDITION_CONTINUE", "SOLO_EXPEDITION_RETURN", "SOLO_EXPEDITION_RETREAT", "CHALLENGE_HUNT", "START_REST"];
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
        setState(next);
        setClock(Date.now());
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
    const timer = window.setInterval(retryBootstrap, 5000);
    return () => window.clearInterval(timer);
  }, [actionsAvailable, state, loadState]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const expeditionActive = Boolean(state?.solo_venture?.expedition);
    if (!actionsAvailable || (!state?.encounter && !state?.active_hunt && !expeditionActive)) return undefined;
    const refreshActive = () => {
      if (document.visibilityState === "visible") void loadState({ quiet: true });
    };
    const timer = window.setInterval(refreshActive, state?.active_hunt ? 10000 : expeditionActive ? 5000 : 4000);
    return () => window.clearInterval(timer);
  }, [actionsAvailable, state?.encounter?.id, state?.encounter?.state, state?.active_hunt?.id, state?.solo_venture?.expedition?.updated_at, loadState]);

  useEffect(() => {
    if (!actionsAvailable || !state) return undefined;
    const deadlines = [
      Number(state.venture?.available_at || 0),
      Number(state.solo_venture?.available_at || 0),
      ...((state.hunts || []).map((hunt) => Number(hunt.cooldown_available_at || 0))),
      Number(state.encounter?.rally_closes_at || 0),
      Number(state.active_hunt?.resolves_at || 0),
      Number(state.camp?.until || 0),
    ].filter((value) => value > Math.floor(Date.now() / 1000));
    if (!deadlines.length) return undefined;
    const nearest = Math.min(...deadlines);
    const waitMs = Math.max(250, nearest * 1000 - Date.now() + 250);
    const timer = window.setTimeout(() => void loadState({ quiet: true }), waitMs);
    return () => window.clearTimeout(timer);
  }, [actionsAvailable, state, loadState]);

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
        setState(next);
        setClock(Date.now());
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

  if (!isOwnProfile) return <HuntRecord data={data} />;

  const boardStateReady = Boolean(state);
  const ventureRemaining = remainingUntil(state?.venture?.available_at, clock);
  const soloRemaining = remainingUntil(state?.solo_venture?.available_at, clock);
  const soloReason = !boardStateReady
    ? "Checking Crystal Guild for your current Solo Venture…"
    : soloRemaining > 0
      ? `Solo Venture ready in ${duration(soloRemaining)}.`
      : String(state?.solo_venture?.reason || "");
  const encounter = state?.encounter || null;
  const activeHunt = state?.active_hunt || null;
  const activeHuntRemaining = remainingUntil(activeHunt?.resolves_at, clock);
  const rallyRemaining = remainingUntil(encounter?.rally_closes_at, clock);
  const roundRemaining = remainingUntil(encounter?.next_round_at, clock);
  const currentRegion = state?.current_region || { name: overview?.region?.name || "Unknown Region" };
  const regions = [...(state?.regions || [])].sort((a, b) => Number(a?.min_level || 1) - Number(b?.min_level || 1) || String(a?.name || "").localeCompare(String(b?.name || "")));
  const hunts = (state?.hunts || []).filter((hunt) => rank === "ALL" || hunt.rank === rank).sort(compareByLevel);
  const huntRanks = ["ALL", "C", "B", "A", "S", ...((state?.hunts || []).some((hunt) => hunt.rank === "S+") ? ["S+"] : [])];
  const expedition = state?.solo_venture?.expedition || null;
  const availableSoloAbilities = (expedition?.combat?.abilities || []).filter((ability) => ability.usable);
  const recentSoloResult = state?.recent_result?.kind === "solo_venture" ? state.recent_result.summary : null;
  const soloEncounterChance = Number(state?.solo_venture?.encounter_chance_percent ?? 80);
  const soloTreasureChance = Number(state?.solo_venture?.treasure_chance_percent ?? 20);


  const renderActiveEncounter = (embedded = false) => {
    if (!encounter) return null;
    const Tag = embedded ? "div" : "section";
    return (
      <Tag className={`${embedded ? "active-adventure-embedded " : "panel "}active-adventure-panel ${encounter.kind}`}>
        <div className="panel-title-row">
          <div>
            <p className="eyebrow">{encounter.kind === "hunt" ? `${encounter.hunt?.rank || ""}-Rank Active Hunt` : encounter.kind === "solo_venture" ? "Solo Venture Encounter" : "Active Rally Venture"}</p>
            <h2>{encounter.hunt?.name || encounter.monster?.name}</h2>
            <p className="muted">{encounter.monster?.name} · Lv.{number(encounter.monster?.level)} · {encounter.region?.name}</p>
          </div>
          <span className="small-badge">{encounter.state === "rally" ? `Rally ${duration(rallyRemaining)}` : `Round ${number(encounter.round || 1)}`}</span>
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
        {encounter.state === "rally" && encounter.kind === "venture" ? (
          <div className="adventure-combat-note rally-venture-chat-note">
            <strong>Rally entry is in Twitch chat.</strong>
            <span>{encounter.you_joined ? "You are already in this rally. Watch chat for the battle start." : "Type !join in Twitch chat before the rally closes to take part."}</span>
          </div>
        ) : null}
        {encounter.state === "combat" ? (
          <div className="adventure-combat-note">
            <strong>Battle is underway.</strong>
            <span>{encounter.kind === "solo_venture" ? "This Solo Venture began before the instant-resolution update and will finish automatically here." : encounter.kind === "venture" ? "Rally battles use Twitch chat for combat. Choose !attack, !ability, !defend, or !use before the round timer closes; otherwise your hero uses the default action." : "This Hunt began before the timed-Hunt hotfix and is finishing under the legacy battle state. New Hunts resolve automatically at their rank timer without chat combat."}</span>
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
            <p className="muted">Solo Venture, travel, recovery, and Hunts in one place. Rally Ventures stay in Twitch chat.</p>
          </div>
          <button type="button" className="equipment-action-button secondary" disabled={!actionsAvailable || Boolean(busy)} onClick={() => loadState()}>
            {busy === "state" ? "Refreshing…" : "Refresh Board"}
          </button>
        </div>
        <div className={`equipment-action-status compact-status ${actionsAvailable ? "ready" : "offline"}`} role="status">
          <strong>{actionsAvailable ? "Online" : "Offline"}</strong>
          <span>{actionsAvailable ? "Adventure actions are ready." : "Actions return when Crystal Guild reconnects."}</span>
          {message ? <small aria-live="polite">{message}</small> : null}
        </div>
      </section>

      <section className={`panel adventure-camp-panel ${state?.camp?.resting ? "camp-active" : ""}`}>
        <div className="panel-title-row">
          <div><p className="eyebrow">Camp & Recovery</p><h2>{state?.camp?.resting ? `Resting · ${duration(remainingUntil(state.camp.until, clock))}` : "Set Up Camp"}</h2></div>
          <span className={`small-badge ${state?.camp?.resting ? "success" : state?.camp?.can_start ? "ready" : ""}`}>{state?.camp?.resting ? "Resting" : state?.camp?.can_start ? "Ready" : "Unavailable"}</span>
        </div>
        <p className="muted">Camp restores HP and your current Job’s MP/AP after the normal rest timer. You cannot adventure while resting.</p>
        {state?.camp ? (
          <div className="adventure-camp-grid">
            <div><span>HP</span><strong>{number(state.camp.hp)} / {number(state.camp.max_hp)}</strong></div>
            {Number(state.camp.max_mp || 0) > 0 ? <div><span>MP</span><strong>{number(state.camp.mp)} / {number(state.camp.max_mp)}</strong></div> : null}
            {Number(state.camp.max_ap || 0) > 0 ? <div><span>AP</span><strong>{number(state.camp.ap)} / {number(state.camp.max_ap)}</strong></div> : null}
            <div><span>Rest timer</span><strong>{duration(state.camp.duration_seconds)}</strong></div>
          </div>
        ) : null}
        <div className="venture-action-row">
          <button type="button" className="equipment-action-button" disabled={!actionsAvailable || !boardStateReady || !state?.camp?.can_start || Boolean(busy)} onClick={() => runRequest("camp:start", "camp", "start", (idem) => submitStartRest(csrfToken, idem), "Camp started.")}>{busy === "camp:start" ? "Setting Camp…" : state?.camp?.resting ? "Camp in Progress" : "Set Up Camp"}</button>
          {state?.camp?.reason ? <span className="adventure-disabled-reason">{state.camp.reason}</span> : null}
        </div>
      </section>

      <section className={`panel venture-panel solo-venture-panel ${expedition ? "expedition-active" : ""}`}>
        <div className="panel-title-row">
          <div>
            <p className="eyebrow">Solo Venture · Portal Only</p>
            <h2>{expedition ? `Stage ${number(expedition.stage)} of ${number(expedition.max_stages)}` : !boardStateReady ? "Checking your venture…" : soloRemaining > 0 ? `Ready in ${duration(soloRemaining)}` : "Take the road alone"}</h2>
          </div>
          <span className={`small-badge ${expedition || (boardStateReady && state?.solo_venture?.ready && soloRemaining <= 0) ? "success" : ""}`}>
            {expedition ? (expedition.status === "combat" ? "In Battle" : "Stage Cleared") : !boardStateReady ? "Checking" : soloRemaining > 0 ? "Recovering" : state?.solo_venture?.ready ? "Ready" : "Unavailable"}
          </span>
        </div>

        {!expedition ? (
          <>
            <p className="muted">A private, player-paced Solo Venture of up to three stages. Each stage can reveal an Encounter or Treasure Chest; after a clear, return safely or press deeper for stronger rewards.</p>
            <div className="solo-venture-rules" aria-label="Solo Venture rules">
              <span><strong>{soloEncounterChance} / {soloTreasureChance}</strong>Encounter / Treasure</span>
              <span><strong>3 stages</strong>Maximum depth</span>
              <span><strong>+3</strong>Enemy level ceiling</span>
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
                  <div className="solo-combat-head"><div><span>Enemy</span><h3>{expedition.combat.enemy?.name} · Lv.{number(expedition.combat.enemy?.level)}</h3></div><span className="small-badge">Round {number(expedition.combat.round)}</span></div>
                  <div className="vital-label"><span>HP</span><span>{number(expedition.combat.enemy?.hp)} / {number(expedition.combat.enemy?.max_hp)}</span></div>
                  <ProgressBar value={pct(expedition.combat.enemy?.hp, expedition.combat.enemy?.max_hp)} className="hp" />
                  <div className="solo-enemy-intent"><span>Enemy intent</span><strong>{expedition.combat.enemy?.intent || "Preparing an action"}</strong></div>
                  {expedition.combat.enemy?.statuses && expedition.combat.enemy.statuses !== "—" ? <small>Status: {expedition.combat.enemy.statuses}</small> : null}
                </div>

                <div className="solo-combatant hero">
                  <div className="solo-combat-head"><div><span>Your Hero</span><h3>{expedition.combat.player?.name} · {expedition.combat.player?.job_name}</h3></div></div>
                  <div className="vital-label"><span>HP</span><span>{number(expedition.combat.player?.hp)} / {number(expedition.combat.player?.max_hp)}</span></div>
                  <ProgressBar value={pct(expedition.combat.player?.hp, expedition.combat.player?.max_hp)} className="hp" />
                  {Number(expedition.combat.player?.max_mp || 0) > 0 ? <><div className="vital-label"><span>MP</span><span>{number(expedition.combat.player?.mp)} / {number(expedition.combat.player?.max_mp)}</span></div><ProgressBar value={pct(expedition.combat.player?.mp, expedition.combat.player?.max_mp)} className="mp" /></> : null}
                  {Number(expedition.combat.player?.max_ap || 0) > 0 ? <><div className="vital-label"><span>AP</span><span>{number(expedition.combat.player?.ap)} / {number(expedition.combat.player?.max_ap)}</span></div><ProgressBar value={pct(expedition.combat.player?.ap, expedition.combat.player?.max_ap)} className="ap" /></> : null}
                  {expedition.combat.player?.statuses && expedition.combat.player.statuses !== "—" ? <small>Status: {expedition.combat.player.statuses}</small> : null}
                </div>

                {expedition.last_round?.events?.length ? (
                  <div className="solo-round-log" aria-live="polite">
                    <strong>Round {number(expedition.last_round.round)}</strong>
                    {expedition.last_round.events.map((line, index) => <span key={`${index}:${line}`}>{line}</span>)}
                  </div>
                ) : null}

                <div className="solo-command-bar" aria-label="Solo Venture battle actions">
                  <button type="button" className="equipment-action-button" disabled={Boolean(busy)} onClick={() => runRequest("solo:attack", "solo-action", "attack", (idem) => submitSoloExpeditionAction("attack", csrfToken, idem), "Round resolved.")}>{busy === "solo:attack" ? "Attacking…" : "Attack"}</button>
                  <button type="button" className={`equipment-action-button secondary ${soloPicker === "ability" ? "active" : ""}`} disabled={Boolean(busy)} aria-expanded={soloPicker === "ability"} onClick={() => setSoloPicker((value) => value === "ability" ? "" : "ability")}>Ability</button>
                  <button type="button" className={`equipment-action-button secondary ${soloPicker === "item" ? "active" : ""}`} disabled={Boolean(busy)} aria-expanded={soloPicker === "item"} onClick={() => setSoloPicker((value) => value === "item" ? "" : "item")}>Use Item</button>
                  <button type="button" className="equipment-action-button secondary" disabled={Boolean(busy)} onClick={() => runRequest("solo:defend", "solo-action", "defend", (idem) => submitSoloExpeditionAction("defend", csrfToken, idem), "Round resolved.")}>{busy === "solo:defend" ? "Defending…" : "Defend"}</button>
                </div>

                {soloPicker === "ability" ? (
                  <div className="solo-action-picker">
                    <div className="panel-title-row"><div><p className="eyebrow">Battle Abilities</p><h3>Choose an ability</h3></div><button type="button" className="equipment-action-button secondary" onClick={() => setSoloPicker("")}>Close</button></div>
                    <div className="solo-action-grid solo-ability-grid">
                      {availableSoloAbilities.length ? availableSoloAbilities.map((ability) => (
                        <button key={ability.id} type="button" className="solo-action-option solo-ability-option" disabled={Boolean(busy)} onClick={() => runRequest(`solo:ability:${ability.id}`, "solo-ability", ability.id, (idem) => submitSoloExpeditionAction(`ability:${ability.id}`, csrfToken, idem), `${ability.name} resolved.`)}>
                          <strong>{ability.name}</strong>
                          <span>{number(ability.cost)} {String(ability.resource || "MP").toUpperCase()}</span>
                        </button>
                      )) : <p className="muted">No abilities are currently available.</p>}
                    </div>
                  </div>
                ) : null}

                {soloPicker === "item" ? (
                  <div className="solo-action-picker">
                    <div className="panel-title-row"><div><p className="eyebrow">Battle Inventory</p><h3>Choose an item</h3></div><button type="button" className="equipment-action-button secondary" onClick={() => setSoloPicker("")}>Close</button></div>
                    <div className="solo-action-grid">
                      {(expedition.combat.items || []).length ? (expedition.combat.items || []).map((item) => (
                        <button key={item.id} type="button" className="solo-action-option" disabled={Boolean(busy) || !item.usable} title={item.reason || item.description} onClick={() => runRequest(`solo:item:${item.id}`, "solo-item", item.id, (idem) => submitSoloExpeditionAction(`item:${item.id}`, csrfToken, idem), `${item.name} used.`)}>
                          <span><strong>{item.name}</strong><small>Qty {number(item.quantity)} · {item.target}</small></span>
                          <span>{item.usable ? "Use" : item.reason}</span>
                          <small>{item.description}</small>
                        </button>
                      )) : <p className="muted">No usable battle items are in your inventory.</p>}
                    </div>
                  </div>
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
                  <small>{expedition.treasure ? [expedition.treasure.category, expedition.treasure.level ? `Lv.${number(expedition.treasure.level)}` : "", expedition.treasure.rarity].filter(Boolean).join(" · ") : expedition.last_stage?.rewards ? `+${number(expedition.last_stage.rewards.xp)} XP · +${number(expedition.last_stage.rewards.jp)} JP secured · ${number(expedition.last_stage.rewards.gil)} Gil in spoils` : "Choose whether to return or continue."}</small>
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

        {!expedition && recentSoloResult ? (
          <div className="solo-result-wrap" aria-live="polite">
            <SoloVentureResult summary={recentSoloResult} cooldownRemaining={soloRemaining} />
          </div>
        ) : null}
      </section>

      <section className="panel rally-venture-notice">
        <div className="panel-title-row">
          <div><p className="eyebrow">Rally Venture · Twitch Chat Only</p><h2>Higher risk. Better rewards.</h2></div>
          <span className="small-badge">Live Stream</span>
        </div>
        <p className="muted">Start with <code>!venture</code> and join an open rally with <code>!join</code>.</p>
        <div className="solo-venture-rules rally-venture-rules" aria-label="Rally Venture rules">
          <span><strong>70 / 30</strong>Encounter / Treasure</span>
          <span><strong>+10</strong>Enemy level cap</span>
          <span><strong>+5% / level</strong>XP / JP / Gil reward bonus</span>
          <span><strong>+50%</strong>Maximum reward bonus</span>
        </div>
        <div className="adventure-combat-note rally-venture-chat-note compact-adventure-note">
          <strong>{ventureRemaining > 0 ? `Ready in ${duration(ventureRemaining)}` : "Ready in Twitch chat"}</strong>
          <span>Live-stream activity</span>
        </div>
        {encounter?.kind === "venture" ? renderActiveEncounter(true) : null}
      </section>

      <section className="panel adventure-region-panel">
        <div className="panel-title-row">
          <div><p className="eyebrow">Travel</p><h2>Regions</h2></div>
          <span className="small-badge success">Current · {currentRegion.name}</span>
        </div>
        <div className="adventure-region-grid">
          {regions.map((region) => (
            <article className={`adventure-region-card ${region.current ? "current" : ""} ${!region.unlocked ? "locked" : ""}`} key={region.id}>
              <div className="adventure-region-art" aria-hidden="true">
                <img src={`/retro-phase-ii/regions-hd/${region.id}.webp`} alt="" loading="lazy" decoding="async" />
              </div>
              <div className="card-status-row adventure-region-head">
                <div className="slot-label">Lv.{number(region.min_level)}+</div>
                <span className={`small-badge ${region.current ? "success" : !region.unlocked ? "locked" : ""}`}>{region.current ? "Current" : region.unlocked ? "Unlocked" : "Locked"}</span>
              </div>
              <h3>{region.name}</h3>
              <p>{region.description}</p>
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
        </div>
      </section>

      {encounter && encounter.kind !== "venture" ? renderActiveEncounter(false) : null}

      {state?.recent_result?.kind === "hunt" ? <HuntResult result={state.recent_result} /> : null}
      {state?.recent_result && !["solo_venture", "hunt"].includes(state.recent_result.kind) ? (
        <section className={`panel adventure-result-panel compact-result ${state.recent_result.won ? "won" : "lost"}`} aria-live="polite">
          <div className="panel-title-row"><div><p className="eyebrow">Recent Adventure</p><h2>{state.recent_result.won ? "Complete" : "Ended"}</h2></div><span className={`small-badge ${state.recent_result.won ? "success" : ""}`}>{state.recent_result.won ? "Victory" : "Defeat"}</span></div>
          <strong>{state.recent_result.monster_name}</strong>
          {(state.recent_result.messages || []).slice(-2).map((line, index) => <p key={`${index}:${line}`}>{line}</p>)}
        </section>
      ) : null}

      {activeHunt ? (
        <section className="panel timed-hunt-panel" aria-live="polite">
          <div className="panel-title-row timed-hunt-title-row">
            <div>
              <p className="eyebrow">Hunt in Progress · {activeHunt.rank}-Rank</p>
              <h2>{activeHunt.name}</h2>
              <p className="muted">{activeHunt.monster?.name} · Mark Lv.{number(activeHunt.monster?.level)}</p>
            </div>
            <span className="small-badge success">Auto Hunt</span>
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
            <strong>No chat combat required.</strong>
            <span>Your hero handles the mark automatically, using learned abilities and Defend when useful and only a small number of survival consumables when the situation warrants it. The final result is announced when the timer expires.</span>
          </div>
        </section>
      ) : null}

      <section className="panel hunt-board-panel">
        <div className="panel-title-row hunt-board-title-row">
          <div><p className="eyebrow">Guild Hunt Board</p><h2>Named Marks</h2></div>
          <div className="hunt-seal-wallet"><strong>{number(state?.player?.hunt_seals ?? overview?.identity?.hunt_seals ?? 0)}</strong><span>Hunt Seals</span></div>
        </div>
        <div className="hunt-rank-filters" role="group" aria-label="Filter Hunts by rank">
          {huntRanks.map((value) => <button key={value} type="button" className={rank === value ? "active" : ""} aria-pressed={rank === value} onClick={() => setRank(value)}>{value === "ALL" ? "All Hunts" : `${value}-Rank Hunts`}</button>)}
        </div>
        <div className="hunt-board-grid">
          {hunts.map((hunt) => {
            const cooldown = remainingUntil(hunt.cooldown_available_at, clock);
            const available = Boolean(hunt.challengeable && cooldown <= 0);
            return (
              <article className={`adventure-hunt-card rank-${String(hunt.rank || "c").toLowerCase()} ${available ? "available" : ""}`} key={hunt.id}>
                <div className="adventure-hunt-head">
                  <div><span className="slot-label">{hunt.rank}-Rank · Mark Lv.{number(hunt.monster?.level || hunt.min_level)}</span><h3>{hunt.name}</h3><p>{hunt.monster?.name}</p></div>
                  <span className={`small-badge ${available ? "success" : ""}`}>{hunt.clears > 0 ? `${number(hunt.clears)} clears` : available ? "Available" : "Locked"}</span>
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
      </section>
    </section>
  );
}
