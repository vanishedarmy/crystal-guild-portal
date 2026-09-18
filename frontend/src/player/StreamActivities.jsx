import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { submitAdventureState, waitForPortalAction } from "../api/auth.js";
import ContextHelp from "../components/ContextHelp.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { duration, number, pct } from "../utils/formatters.js";
import Raids from "./Raids.jsx";

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

function StreamVentureEncounter({ encounter, nowMs }) {
  if (!encounter || encounter.kind !== "venture") return null;
  const rallyRemaining = remainingUntil(encounter.rally_closes_at, nowMs);
  const roundRemaining = remainingUntil(encounter.next_round_at, nowMs);

  return (
    <div className="active-adventure-embedded active-adventure-panel venture" aria-live="polite">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Active Stream Venture</p>
          <h3>{encounter.monster?.name || "Stream Venture"}</h3>
          <p className="muted">Lv. {number(encounter.monster?.level)} · {encounter.region?.name || "Current Region"}</p>
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

      {encounter.state === "rally" ? (
        <div className="adventure-combat-note rally-venture-chat-note">
          <strong>Rally entry is in Twitch chat.</strong>
          <span>{encounter.you_joined ? "You are already in this rally. Watch chat for the battle start." : "Type !join in Twitch chat before the rally closes to take part."}</span>
        </div>
      ) : null}

      {encounter.state === "combat" ? (
        <div className="adventure-combat-note">
          <strong>Battle is underway in Twitch chat.</strong>
          <span>Choose !attack, !ability, !defend, or !use before the round timer closes; otherwise your hero uses the default action.</span>
        </div>
      ) : null}
    </div>
  );
}

export default function StreamActivities({ data: overview }) {
  const { auth } = usePortalAuth();
  const [state, setState] = useState(null);
  const [message, setMessage] = useState("");
  const [clock, setClock] = useState(() => Date.now());
  const [serverOffsetMs, setServerOffsetMs] = useState(0);
  const stateInflight = useRef(false);

  const username = String(overview?.identity?.username || "").toLowerCase();
  const isOwnProfile = Boolean(
    auth.authenticated
    && auth.player?.username
    && String(auth.player.username).toLowerCase() === username
  );
  const capabilities = useMemo(
    () => new Set(Array.isArray(auth.action_capabilities) ? auth.action_capabilities : []),
    [auth.action_capabilities],
  );
  const stateAvailable = Boolean(isOwnProfile && auth.actions_enabled && capabilities.has("ADVENTURE_STATE"));
  const csrfToken = auth.csrf_token || "";

  const loadState = useCallback(async () => {
    if (!stateAvailable || stateInflight.current) return null;
    stateInflight.current = true;
    const idem = actionKey("adventure-state", "board", username);
    try {
      const response = await submitAdventureState(csrfToken, idem);
      const finished = await finishedAction(response);
      if (!finished) {
        setMessage("Crystal Guild is still synchronizing live Stream activity.");
        return null;
      }
      clearActionKey("adventure-state", "board", username, idem);
      if (finished.status !== "completed" || finished.result?.ok === false) {
        setMessage(finished.result?.message || "Stream activity could not be loaded.");
        return null;
      }
      const next = finished.result?.data?.adventure_state || null;
      if (next) {
        const receivedAt = Date.now();
        setState(next);
        setServerOffsetMs(Number(next.server_now || 0) > 0 ? Number(next.server_now) * 1000 - receivedAt : 0);
        setClock(receivedAt);
        setMessage("");
      }
      return next;
    } catch (error) {
      const text = String(error?.message || error);
      setMessage(text.includes("Too many") && text.includes("waiting for the Bot")
        ? "Crystal Guild is catching up on Portal requests. Stream activity will resume automatically."
        : text);
      return null;
    } finally {
      stateInflight.current = false;
    }
  }, [csrfToken, stateAvailable, username]);

  useEffect(() => {
    if (!stateAvailable) return undefined;
    void loadState();
    const refreshVisible = () => {
      if (document.visibilityState === "visible") void loadState();
    };
    const poll = window.setInterval(refreshVisible, state?.encounter?.kind === "venture" ? 30000 : 60000);
    window.addEventListener("crystal-guild-live-revision", refreshVisible);
    window.addEventListener("focus", refreshVisible);
    window.addEventListener("pageshow", refreshVisible);
    document.addEventListener("visibilitychange", refreshVisible);
    return () => {
      window.clearInterval(poll);
      window.removeEventListener("crystal-guild-live-revision", refreshVisible);
      window.removeEventListener("focus", refreshVisible);
      window.removeEventListener("pageshow", refreshVisible);
      document.removeEventListener("visibilitychange", refreshVisible);
    };
  }, [stateAvailable, state?.encounter?.kind, loadState]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const authoritativeClock = clock + serverOffsetMs;
  const ventureRemaining = remainingUntil(state?.venture?.available_at, authoritativeClock);
  const encounter = state?.encounter?.kind === "venture" ? state.encounter : null;
  const recentVenture = state?.recent_result?.kind === "venture" ? state.recent_result : null;
  const ventureStatus = encounter
    ? encounter.state === "rally" ? "Rally Open" : "In Battle"
    : ventureRemaining > 0 ? `Ready in ${duration(ventureRemaining)}` : stateAvailable ? "Ready in Twitch Chat" : "Twitch Chat";

  return (
    <section className="stream-activities-stack">
      <section className="panel stream-activities-hero">
        <div className="panel-title-row">
          <div>
            <p className="eyebrow">Stream Activities</p>
            <h2>Live Group Adventures</h2>
            <p className="muted">Stream-only activities are kept here so the Adventure Board can stay focused on Portal and off-stream adventures.</p>
          </div>
          <span className="small-badge">Twitch Live</span>
        </div>
        <div className="stream-activity-summary" aria-label="Stream activity summary">
          <div><span>Stream Venture</span><strong>{ventureStatus}</strong><small>Start with !venture · join with !join</small></div>
          <div><span>Raids &amp; Trials</span><strong>Live Board</strong><small>Join active encounters with !raid</small></div>
        </div>
        {!isOwnProfile ? <p className="stream-activity-note">Stream Venture status is private to the signed-in adventurer. Raid and Trial information remains viewable below.</p> : null}
        {isOwnProfile && !stateAvailable ? <p className="stream-activity-note">Live Stream status will appear when Crystal Guild reconnects.</p> : null}
        {message ? <p className="stream-activity-note" role="status">{message}</p> : null}
      </section>

      <section className="panel rally-venture-notice stream-venture-panel" data-active={encounter ? "true" : "false"}>
        <img className="rally-venture-background-art" src="/retro-phase-iii/scene-backgrounds-v4/rally_venture.webp" alt="" aria-hidden="true" loading="eager" decoding="async" />
        <div className="panel-title-row">
          <div><p className="eyebrow">Stream Venture · Twitch Chat Only</p><h2>Higher risk. Better rewards.</h2></div>
          <div className="context-help-actions"><ContextHelp topic="rally_venture" /><span className="small-badge">Live Stream</span></div>
        </div>
        <p className="muted">Use <code>!venture</code>; join an open rally with <code>!join</code>.</p>
        <div className="solo-venture-rules rally-venture-rules" aria-label="Stream Venture rules">
          <span><strong>100% Encounter / 0% Treasure Chest</strong>Battle-only Stream Venture</span>
          <span><strong>+10</strong>Enemy level cap</span>
          <span><strong>+5% / level</strong>XP / JP / Gil reward bonus</span>
          <span><strong>+50%</strong>Maximum reward bonus</span>
        </div>
        <div className="adventure-combat-note rally-venture-chat-note compact-adventure-note">
          <strong>{ventureStatus}</strong>
          <span>Live-stream activity</span>
        </div>
        {encounter ? <StreamVentureEncounter encounter={encounter} nowMs={authoritativeClock} /> : null}
        {recentVenture ? (
          <div className={`stream-venture-result ${recentVenture.won ? "won" : "lost"}`} aria-live="polite">
            <div><span>Recent Stream Venture</span><strong>{recentVenture.won ? "Victory" : "Ended"}</strong></div>
            <p>{recentVenture.monster_name || "Stream Venture"}</p>
            {(recentVenture.messages || []).slice(-2).map((line, index) => <small key={`${index}:${line}`}>{line}</small>)}
          </div>
        ) : null}
      </section>

      <Raids username={overview?.identity?.username || ""} />
    </section>
  );
}
