import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchPortalActions, submitPortalPing } from "../api/auth.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";

function actionKey() {
  if (globalThis.crypto?.randomUUID) return `ping:${globalThis.crypto.randomUUID()}`;
  return `ping:${Date.now()}:${Math.random().toString(36).slice(2)}`;
}

export default function PortalLinkPanel({ username }) {
  const { auth } = usePortalAuth();
  const [actions, setActions] = useState([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const actionRefreshInFlight = useRef(false);

  const isOwnProfile = useMemo(() => (
    Boolean(auth.authenticated && auth.player?.username)
    && String(auth.player.username).toLowerCase() === String(username || "").toLowerCase()
  ), [auth.authenticated, auth.player?.username, username]);

  const refreshActions = useCallback(async () => {
    if (!isOwnProfile || actionRefreshInFlight.current) return;
    actionRefreshInFlight.current = true;
    try {
      const payload = await fetchPortalActions();
      setActions(Array.isArray(payload.actions) ? payload.actions : []);
    } catch {
      // Passive action-history refresh failures should not interrupt the profile.
    } finally {
      actionRefreshInFlight.current = false;
    }
  }, [isOwnProfile]);

  useEffect(() => {
    if (!isOwnProfile) {
      setActions([]);
      return undefined;
    }
    void refreshActions();
    return undefined;
  }, [isOwnProfile, refreshActions]);

  const pingActions = useMemo(() => (
    actions.filter((action) => action.type === "PING")
  ), [actions]);

  const hasPending = useMemo(() => (
    pingActions.some((action) => action.status === "pending" || action.status === "processing")
  ), [pingActions]);

  useEffect(() => {
    if (!isOwnProfile || !hasPending) return undefined;
    const pollPending = () => {
      if (document.visibilityState === "visible") void refreshActions();
    };
    const timer = window.setInterval(pollPending, 1500);
    return () => window.clearInterval(timer);
  }, [isOwnProfile, hasPending, refreshActions]);

  useEffect(() => {
    if (!isOwnProfile) return undefined;
    const refreshVisible = () => {
      if (document.visibilityState === "visible") refreshActions();
    };
    window.addEventListener("focus", refreshActions);
    window.addEventListener("pageshow", refreshActions);
    document.addEventListener("visibilitychange", refreshVisible);
    return () => {
      window.removeEventListener("focus", refreshActions);
      window.removeEventListener("pageshow", refreshActions);
      document.removeEventListener("visibilitychange", refreshVisible);
    };
  }, [isOwnProfile, refreshActions]);

  if (!auth.configured || !auth.authenticated) return null;
  if (!auth.player) {
    return (
      <aside className="portal-link-panel warning" aria-label="Portal account link status">
        <div>
          <strong>Twitch account signed in</strong>
          <span>No Crystal Guild adventurer is linked to this Twitch account yet.</span>
        </div>
      </aside>
    );
  }
  if (!isOwnProfile) return null;

  const latest = pingActions[0] || null;
  const latestText = latest?.status === "completed" && latest?.result?.ok !== false
    ? "Connection refreshed."
    : latest?.result?.message
      || (latest?.status === "processing" ? "Refreshing connection…" : latest?.status === "pending" ? "Waiting for Crystal Guild…" : "");
  const latestFinished = latest?.status === "completed" || latest?.status === "failed";
  const displayedMessage = latestFinished && latestText ? latestText : (message || latestText);

  const testLink = async () => {
    if (!auth.actions_enabled || busy) return;
    setBusy(true);
    setMessage("Refreshing connection…");
    try {
      const response = await submitPortalPing(auth.csrf_token, actionKey());
      const action = response.action;
      setMessage(action?.status === "completed" ? "Connection refreshed." : "Waiting for Crystal Guild…");
      await refreshActions();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className={`portal-link-panel ${auth.actions_enabled ? "ready" : "offline"}`} aria-label="Crystal Guild connection status">
      <div className="portal-link-copy">
        <div className="portal-link-heading">
          <strong>Crystal Guild Connection</strong>
          <span className="portal-link-badge">{auth.actions_enabled ? "ONLINE" : "OFFLINE"}</span>
        </div>
        {displayedMessage ? <small aria-live="polite">{displayedMessage}</small> : null}
      </div>
      <button type="button" className="portal-link-test" disabled={!auth.actions_enabled || busy} onClick={testLink}>
        {busy ? "Refreshing…" : "Refresh connection"}
      </button>
    </aside>
  );
}
