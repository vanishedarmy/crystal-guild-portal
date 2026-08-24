import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { submitClaimDaily, submitDailyState, waitForPortalAction } from "../api/auth.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { duration, number } from "../utils/formatters.js";

const volatileActionKeys = new Map();

function actionStorageKey(kind, username) {
  return `crystal-guild:daily:${String(username || "").toLowerCase()}:${kind}`;
}

function actionKey(kind, username) {
  const storageKey = actionStorageKey(kind, username);
  try {
    const existing = window.sessionStorage?.getItem(storageKey);
    if (existing) return existing;
  } catch {
    const existing = volatileActionKeys.get(storageKey);
    if (existing) return existing;
  }

  const suffix = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}:${Math.random().toString(36).slice(2)}`;
  const key = `${kind}:daily:${suffix}`;
  volatileActionKeys.set(storageKey, key);
  try {
    window.sessionStorage?.setItem(storageKey, key);
  } catch {
    // sessionStorage may be unavailable under strict browser privacy modes.
  }
  return key;
}

function clearActionKey(kind, username, key) {
  const storageKey = actionStorageKey(kind, username);
  if (volatileActionKeys.get(storageKey) === key) volatileActionKeys.delete(storageKey);
  try {
    if (window.sessionStorage?.getItem(storageKey) === key) window.sessionStorage.removeItem(storageKey);
  } catch {
    // Keep the in-memory fallback best-effort only.
  }
}

async function finishedAction(response) {
  const action = response?.action;
  if (!action?.id) throw new Error("Crystal Guild did not return a request ID.");
  if (action.status === "completed" || action.status === "failed") return action;
  return waitForPortalAction(action.id, { attempts: 28, delayMs: 650 });
}

export default function DailyReward({ username, onRefresh }) {
  const { auth } = usePortalAuth();
  const [daily, setDaily] = useState(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [clock, setClock] = useState(() => Date.now());
  const stateInflight = useRef(false);
  const claimInflight = useRef(false);
  const stateRetryTimer = useRef(0);

  const isOwnProfile = Boolean(
    auth.authenticated
    && auth.player?.username
    && String(auth.player.username).toLowerCase() === String(username || "").toLowerCase()
  );
  const capabilities = useMemo(
    () => new Set(Array.isArray(auth.action_capabilities) ? auth.action_capabilities : []),
    [auth.action_capabilities],
  );
  const actionsAvailable = Boolean(
    isOwnProfile
    && auth.actions_enabled
    && capabilities.has("DAILY_STATE")
    && capabilities.has("CLAIM_DAILY")
  );
  const csrfToken = auth.csrf_token || "";

  const loadDaily = useCallback(async ({ quiet = false } = {}) => {
    if (!actionsAvailable || busy || stateInflight.current) return null;
    if (!quiet) {
      setBusy("state");
      setMessage("Checking today's Guild provisions…");
    }
    stateInflight.current = true;
    const key = actionKey("daily-state", username);
    try {
      const response = await submitDailyState(csrfToken, key);
      const finished = await finishedAction(response);
      if (!finished) {
        setMessage("Crystal Guild is still processing this Daily request. This card will keep checking the same request instead of adding another one.");
        window.clearTimeout(stateRetryTimer.current);
        stateRetryTimer.current = window.setTimeout(() => {
          if (document.visibilityState === "visible") void loadDaily({ quiet: true });
        }, 1800);
        return null;
      }
      clearActionKey("daily-state", username, key);
      if (finished.status !== "completed" || finished.result?.ok === false) {
        setMessage(finished.result?.message || "Daily provisions could not be checked.");
        return null;
      }
      const next = finished.result?.data?.daily_state || null;
      if (next) {
        setDaily(next);
        setClock(Date.now());
      }
      if (!quiet) setMessage("Daily provisions checked.");
      return next;
    } catch (error) {
      const text = String(error?.message || error);
      setMessage(text.includes("Too many Portal actions")
        ? "Crystal Guild is catching up on your existing Portal requests. Wait a moment, then Refresh; this page will not add duplicate Daily requests."
        : text);
      return null;
    } finally {
      stateInflight.current = false;
      if (!quiet) setBusy("");
    }
  }, [actionsAvailable, busy, csrfToken, username]);

  useEffect(() => {
    if (!actionsAvailable || daily) return;
    void loadDaily({ quiet: true });
  }, [actionsAvailable, daily, loadDaily]);


  useEffect(() => () => window.clearTimeout(stateRetryTimer.current), []);

  useEffect(() => {
    const deadline = Number(daily?.available_at || 0) * 1000;
    if (!deadline || deadline <= Date.now()) return undefined;
    const tick = () => setClock(Date.now());
    const timer = window.setInterval(tick, 1000);
    const visible = () => {
      if (document.visibilityState === "visible") tick();
    };
    window.addEventListener("focus", tick);
    window.addEventListener("pageshow", tick);
    document.addEventListener("visibilitychange", visible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", tick);
      window.removeEventListener("pageshow", tick);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [daily?.available_at]);

  if (!isOwnProfile) return null;

  const deadline = Number(daily?.available_at || 0) * 1000;
  const remaining = deadline ? Math.max(0, Math.ceil((deadline - clock) / 1000)) : Number(daily?.remaining_seconds || 0);
  const available = Boolean(daily && (daily.available || remaining <= 0));

  const claim = async () => {
    if (!actionsAvailable || !available || busy || claimInflight.current) return;
    setBusy("claim");
    setMessage("Claiming today's provisions…");
    claimInflight.current = true;
    const key = actionKey("claim-daily", username);
    try {
      const response = await submitClaimDaily(csrfToken, key);
      const finished = await finishedAction(response);
      if (!finished) {
        setMessage("Your claim is still waiting for Crystal Guild. Trying again will resume this same claim rather than queueing another one.");
        return;
      }
      clearActionKey("claim-daily", username, key);
      setMessage(finished.result?.message || "Daily provisions claimed.");
      const next = finished.result?.data?.daily_state;
      if (next) {
        setDaily(next);
        setClock(Date.now());
      } else if (finished.status === "completed" && finished.result?.ok !== false) {
        setDaily(null);
      }
      if (finished.status === "completed" && finished.result?.ok !== false) {
        onRefresh?.();
        window.setTimeout(() => onRefresh?.(), 3200);
      }
    } catch (error) {
      const text = String(error?.message || error);
      setMessage(text.includes("Too many Portal actions")
        ? "Crystal Guild is catching up on your existing Portal requests. Wait a moment, then try the same claim again."
        : text);
    } finally {
      claimInflight.current = false;
      setBusy("");
    }
  };

  return (
    <section className="panel daily-reward-panel span-12">
      <div className="daily-reward-copy">
        <div>
          <p className="eyebrow">Daily Guild Provisions</p>
          <h2>{daily?.blocked_reason ? "Provisions wait at the Guild" : available ? "Today's reward is ready" : "Provisions already collected"}</h2>
          <p className="muted">
            {daily
              ? `Reward: ${number(daily.gil_min)}–${number(daily.gil_max)} Gil + ${daily.provision_summary || "a random level-appropriate provision bundle"}.`
              : "Claim the same randomized 24-hour Daily Guild Provisions available through !daily."}
          </p>
          {daily?.subscriber_tier > 0 ? (
            <p className="daily-subscriber-perk">
              <strong>{daily.subscriber_label}</strong> — +{number(daily.subscriber_gil_bonus_percent)}% Daily Gil and {number(daily.provision_rolls)} provision rolls.
            </p>
          ) : (
            daily ? <p className="daily-subscriber-perk muted">Twitch subscribers receive tier-based Daily Guild Provision bonuses.</p> : null
          )}
          {daily?.blocked_reason ? <div className="daily-reward-timer"><strong>{daily.blocked_reason}</strong></div> : daily && !available ? <div className="daily-reward-timer">Next claim in <strong>{duration(remaining)}</strong></div> : null}
          {message ? <small className="daily-reward-message" aria-live="polite">{message}</small> : null}
        </div>
        <div className="daily-reward-actions">
          <button
            type="button"
            className="equipment-action-button"
            disabled={!actionsAvailable || !available || Boolean(busy)}
            onClick={claim}
          >
            {busy === "claim" ? "Claiming…" : daily?.blocked_reason ? "Solo Venture in Progress" : available ? "Claim Daily Reward" : "Already Claimed"}
          </button>
          <button
            type="button"
            className="equipment-action-button secondary"
            disabled={!actionsAvailable || Boolean(busy)}
            onClick={() => loadDaily()}
          >
            {busy === "state" ? "Checking…" : "Refresh"}
          </button>
          {!actionsAvailable ? <span className="muted">Available when Crystal Guild is online.</span> : null}
        </div>
      </div>
    </section>
  );
}
