import { useEffect, useMemo, useState } from "react";
import { loginUrl, submitRecruit, waitForPortalAction } from "../api/auth.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";

function recruitKey() {
  if (globalThis.crypto?.randomUUID) return `recruit:${globalThis.crypto.randomUUID()}`;
  return `recruit:${Date.now()}:${Math.random().toString(36).slice(2)}`;
}

export default function RecruitPanel({ onRecruited }) {
  const { auth, refreshAuth } = usePortalAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const portalOnline = Boolean(auth.actions_enabled === true && auth.sync_connected === true);
  const canRecruit = useMemo(() => Boolean(
    auth.authenticated && !auth.player && portalOnline && auth.can_recruit === true
  ), [auth.authenticated, auth.player, auth.can_recruit, portalOnline]);

  useEffect(() => {
    if (auth.player && message) setMessage("");
  }, [auth.player, message]);

  if (!auth.configured || auth.player) return null;

  const recruit = async () => {
    if (!canRecruit || busy) return;
    setBusy(true);
    setMessage("Sending your Guild application…");
    try {
      const response = await submitRecruit(auth.csrf_token, recruitKey());
      const action = response.action;
      const finished = action?.status === "completed" || action?.status === "failed"
        ? action
        : await waitForPortalAction(action?.id, { attempts: 40, delayMs: 750 });
      if (!finished) {
        setMessage("Your application is still with the Guild clerk. It will finish when Crystal Guild responds.");
        return;
      }
      if (finished.status === "failed" || finished.result?.ok === false) {
        throw new Error(finished.result?.message || "Recruitment could not be completed.");
      }
      setMessage("Welcome to the Crystal Guild! Your new profile will appear shortly.");
      refreshAuth();
      onRecruited?.();
    } catch (error) {
      setMessage(error.message || "Recruitment could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="recruit-panel" aria-label="Join the Crystal Guild">
      <div>
        <p className="eyebrow">Start Here</p>
        <h2>Join the Crystal Guild</h2>
        <p>Recruit your persistent Lv. 1 Adventurer right here. You can still use <strong>!recruit</strong> in Twitch chat too.</p>
        {auth.authenticated ? (
          <small>Signed in as {auth.twitch?.display_name || auth.twitch?.login || "Twitch adventurer"}. Recruitment will also be announced in Twitch chat.</small>
        ) : (
          <small>Sign in with Twitch so Crystal Guild can create the Adventurer for the correct account.</small>
        )}
        {auth.authenticated && !portalOnline ? (
          <small className="recruit-offline-note" role="status">Crystal Guild is offline. Recruitment will unlock automatically when the Guild reconnects.</small>
        ) : null}
        {message ? <div className="recruit-message" aria-live="polite">{message}</div> : null}
      </div>
      {auth.authenticated ? (
        <button type="button" className="primary-link recruit-button" disabled={!canRecruit || busy} onClick={recruit}>
          {busy ? "Recruiting…" : portalOnline ? "Recruit Adventurer" : "Guild Offline"}
        </button>
      ) : (
        <a className="primary-link recruit-button" href={loginUrl("/players")}>Sign in to Recruit</a>
      )}
    </aside>
  );
}
