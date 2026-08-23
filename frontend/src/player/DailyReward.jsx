import { useCallback, useEffect, useMemo, useState } from "react";
import { submitClaimDaily, submitDailyState, waitForPortalAction } from "../api/auth.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { duration, number } from "../utils/formatters.js";

function actionKey(kind) {
  const suffix = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}:${Math.random().toString(36).slice(2)}`;
  return `${kind}:daily:${suffix}`;
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
    if (!actionsAvailable || busy) return null;
    if (!quiet) {
      setBusy("state");
      setMessage("Checking today's Guild provisions…");
    }
    try {
      const response = await submitDailyState(csrfToken, actionKey("daily-state"));
      const finished = await finishedAction(response);
      if (!finished) {
        setMessage("Daily provisions are still updating. Try again in a moment.");
        return null;
      }
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
      setMessage(error.message);
      return null;
    } finally {
      if (!quiet) setBusy("");
    }
  }, [actionsAvailable, busy, csrfToken]);

  useEffect(() => {
    if (!actionsAvailable || daily) return;
    void loadDaily({ quiet: true });
  }, [actionsAvailable, daily, loadDaily]);

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
    if (!actionsAvailable || !available || busy) return;
    setBusy("claim");
    setMessage("Claiming today's provisions…");
    try {
      const response = await submitClaimDaily(csrfToken, actionKey("claim-daily"));
      const finished = await finishedAction(response);
      if (!finished) {
        setMessage("Your claim is still being processed. Please wait a moment before trying again.");
        return;
      }
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
      setMessage(error.message);
    } finally {
      setBusy("");
    }
  };

  return (
    <section className="panel daily-reward-panel span-12">
      <div className="daily-reward-copy">
        <div>
          <p className="eyebrow">Daily Guild Provisions</p>
          <h2>{available ? "Today's reward is ready" : "Provisions already collected"}</h2>
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
          {daily && !available ? <div className="daily-reward-timer">Next claim in <strong>{duration(remaining)}</strong></div> : null}
          {message ? <small className="daily-reward-message" aria-live="polite">{message}</small> : null}
        </div>
        <div className="daily-reward-actions">
          <button
            type="button"
            className="equipment-action-button"
            disabled={!actionsAvailable || !available || Boolean(busy)}
            onClick={claim}
          >
            {busy === "claim" ? "Claiming…" : available ? "Claim Daily Reward" : "Already Claimed"}
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
