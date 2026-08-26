import { useCallback, useEffect, useMemo, useState } from "react";
import {
  submitChocoboState,
  submitCompleteChocoboQuest,
  submitPurchaseChocoboWrit,
  submitRegisterChocobo,
  submitRenameChocobo,
  waitForPortalAction,
} from "../api/auth.js";
import ProgressBar from "../components/ProgressBar.jsx";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { duration, number, pct } from "../utils/formatters.js";

function actionKey(kind, target = "chocobo") {
  const suffix = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}:${Math.random().toString(36).slice(2)}`;
  return `${kind}:${target}:${suffix}`;
}

async function finishedAction(response) {
  const action = response?.action;
  if (!action?.id) throw new Error("Crystal Guild did not return a request ID.");
  if (action.status === "completed" || action.status === "failed") return action;
  return waitForPortalAction(action.id, { attempts: 28, delayMs: 650 });
}

export default function ChocoboStable({ data, overview, onRefresh }) {
  const { auth } = usePortalAuth();
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [rename, setRename] = useState("");
  const [clock, setClock] = useState(() => Date.now());

  const username = String(overview?.identity?.username || data?.identity?.username || "").toLowerCase();
  const isOwnProfile = Boolean(
    auth.authenticated
    && auth.player?.username
    && String(auth.player.username).toLowerCase() === username
  );
  const capabilities = useMemo(
    () => new Set(Array.isArray(auth.action_capabilities) ? auth.action_capabilities : []),
    [auth.action_capabilities],
  );
  const requiredCapabilities = [
    "CHOCOBO_STATE",
    "COMPLETE_CHOCOBO_QUEST",
    "PURCHASE_CHOCOBO_WRIT",
    "REGISTER_CHOCOBO",
    "RENAME_CHOCOBO",
  ];
  const actionsAvailable = Boolean(
    isOwnProfile
    && auth.actions_enabled
    && requiredCapabilities.every((kind) => capabilities.has(kind))
  );
  const csrfToken = auth.csrf_token || "";

  const loadState = useCallback(async ({ quiet = false } = {}) => {
    if (!actionsAvailable || busy) return null;
    if (!quiet) {
      setBusy("state");
      setMessage("Checking the Chocobo Stable…");
    }
    try {
      const response = await submitChocoboState(csrfToken, actionKey("chocobo-state"));
      const finished = await finishedAction(response);
      if (!finished) {
        setMessage("The Stable is still updating. Try again in a moment.");
        return null;
      }
      if (finished.status !== "completed" || finished.result?.ok === false) {
        setMessage(finished.result?.message || "Chocobo Stable state could not be loaded.");
        return null;
      }
      const next = finished.result?.data?.chocobo_state || null;
      if (next) {
        setState(next);
        setClock(Date.now());
      }
      if (!quiet) setMessage("Chocobo Stable refreshed.");
      return next;
    } catch (error) {
      setMessage(error.message);
      return null;
    } finally {
      if (!quiet) setBusy("");
    }
  }, [actionsAvailable, busy, csrfToken]);

  useEffect(() => {
    if (!actionsAvailable || state) return;
    void loadState({ quiet: true });
  }, [actionsAvailable, state, loadState]);

  const writDeadline = Number(state?.writ?.ready_at || 0) * 1000;
  useEffect(() => {
    if (!writDeadline || writDeadline <= Date.now()) return undefined;
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
  }, [writDeadline]);

  const runMutation = async (key, submit, fallback) => {
    if (!actionsAvailable || busy) return;
    setBusy(key);
    setMessage(fallback);
    try {
      const response = await submit();
      const finished = await finishedAction(response);
      if (!finished) {
        setMessage("Your Stable request is still being processed. Please wait a moment before trying again.");
        return;
      }
      setMessage(finished.result?.message || fallback);
      const next = finished.result?.data?.chocobo_state;
      if (next) {
        setState(next);
        setClock(Date.now());
        if (next.companion?.registered) {
          setName("");
          setRename("");
        }
      } else if (finished.status === "completed" && finished.result?.ok !== false) {
        await loadState({ quiet: true });
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

  const publicChocobo = overview?.chocobo || data?.chocobo || null;
  if (!isOwnProfile) {
    return (
      <section className="panel chocobo-stable-panel">
        <div className="panel-title-row">
          <div><p className="eyebrow">Chocobo Companions</p><h2>Chocobo Stable</h2></div>
          <span className="small-badge">View only</span>
        </div>
        {publicChocobo ? (
          <div className="chocobo-companion-card">
            <div className="chocobo-portrait" aria-hidden="true">♞</div>
            <div>
              <span className="slot-label">Registered Companion</span>
              <h3>{publicChocobo.name}</h3>
              <p className="muted">Lv.{number(publicChocobo.level)} · {(publicChocobo.traits || []).map((trait) => trait.name).join(" · ") || "No trait listed"}</p>
              {Number(publicChocobo.xp_next || 0) > 0 ? <ProgressBar value={pct(publicChocobo.xp_current, publicChocobo.xp_next)} /> : null}
            </div>
          </div>
        ) : <div className="state-message compact-state">This adventurer has not registered a Chocobo yet.</div>}
      </section>
    );
  }

  const companion = state?.companion || null;
  const quest = state?.quest || null;
  const stable = state?.stable || null;
  const writ = state?.writ || null;
  const expedition = state?.expedition || null;
  const writRemaining = writDeadline ? Math.max(0, Math.ceil((writDeadline - clock) / 1000)) : Number(writ?.remaining_seconds || 0);
  const writActive = Boolean(writ?.quantity > 0 && (writ?.active || writRemaining <= 0));

  return (
    <section className="panel chocobo-stable-panel">
      <div className="panel-title-row chocobo-title-row">
        <div>
          <p className="eyebrow">v1.1.10 · Chocobo Companions</p>
          <h2>Chocobo Stable</h2>
          <p className="muted">Prepare a companion now; Expeditions will require a registered Chocobo.</p>
        </div>
        <div className="chocobo-stable-status">
          <span className={`small-badge ${stable?.unlocked ? "ready" : "locked"}`}>{stable?.unlocked ? "STABLE OPEN" : "STABLE LOCKED"}</span>
          <span className="small-badge">{number(state?.gil ?? overview?.identity?.gil ?? 0)} Gil</span>
        </div>
      </div>

      <div className={`equipment-action-status ${actionsAvailable ? "ready" : "offline"}`}>
        <strong>{actionsAvailable ? "Stable connection ready" : "Stable controls unavailable"}</strong>
        <span>{actionsAvailable ? "Quest, Writ timing, registration, and companion progress are checked by the live Guild." : "Chocobo actions return when Crystal Guild reconnects."}</span>
        {message ? <small aria-live="polite">{message}</small> : null}
      </div>

      {!state ? (
        <div className="state-message">{actionsAvailable ? "Loading Chocobo Stable…" : "Crystal Guild must be online to manage your Chocobo."}</div>
      ) : companion?.registered ? (
        <div className="chocobo-owned-layout">
          <div className="chocobo-companion-card featured">
            <div className="chocobo-portrait" aria-hidden="true">♞</div>
            <div className="chocobo-companion-copy">
              <span className="slot-label">Registered Companion</span>
              <h3>{companion.name}</h3>
              <div className="chocobo-level-line"><strong>Lv.{number(companion.level)}</strong><span>Bond XP {number(companion.total_xp)}</span></div>
              {Number(companion.xp_next || 0) > 0 ? (
                <div className="vital-row">
                  <div className="vital-label"><span>Next Level</span><span>{number(companion.xp_current)} / {number(companion.xp_next)}</span></div>
                  <ProgressBar value={pct(companion.xp_current, companion.xp_next)} />
                </div>
              ) : <span className="small-badge">MAX LEVEL</span>}
              <div className="chocobo-traits">
                {(companion.traits || []).map((trait) => (
                  <article key={trait.id} className="chocobo-trait-card">
                    <strong>{trait.name}</strong><span>{trait.description}</span>
                  </article>
                ))}
              </div>
            </div>
          </div>
          <div className="chocobo-side-card">
            <span className="slot-label">Expedition Preparation</span>
            <strong>{expedition?.ready ? "READY" : "PREPARING"}</strong>
            <p>{expedition?.message}</p>
            <div className="chocobo-checklist">
              <span className={expedition?.chocobo_ready ? "complete" : ""}>{expedition?.chocobo_ready ? "✓" : "○"} Registered Chocobo</span>
              <span className={expedition?.board_ready ? "complete" : ""}>{expedition?.board_ready ? "✓" : "○"} Fellowship Expedition Board</span>
            </div>
            <label className="chocobo-name-field"><span>Rename companion</span><input value={rename} maxLength={20} onChange={(event) => setRename(event.target.value)} placeholder={companion.name} /></label>
            <button type="button" className="equipment-action-button secondary" disabled={!actionsAvailable || Boolean(busy) || rename.trim().length < 2} onClick={() => runMutation("rename", () => submitRenameChocobo(rename, csrfToken, actionKey("rename-chocobo")), "Renaming companion…")}>{busy === "rename" ? "Renaming…" : "Rename Chocobo"}</button>
          </div>
        </div>
      ) : (
        <div className="chocobo-acquisition-grid">
          <article className={`chocobo-step-card ${stable?.unlocked ? "complete" : ""}`}>
            <span className="chocobo-step-number">1</span>
            <div><span className="slot-label">Fellowship Requirement</span><h3>Build the Chocobo Stable</h3><p className="muted">A shared Fellowship project. The Stable costs only 5,000 Gil plus 10 completed Ventures and requires Fellowship LVL 2.</p><strong>{stable?.unlocked ? "Stable constructed" : "Stable project still required"}</strong></div>
          </article>

          <article className={`chocobo-step-card ${quest?.complete ? "complete" : ""}`}>
            <span className="chocobo-step-number">2</span>
            <div className="chocobo-step-content">
              <span className="slot-label">Personal Quest</span><h3>{quest?.name}</h3><p className="muted">{quest?.description}</p>
              <div className="chocobo-requirements">
                {(quest?.requirements || []).map((req, index) => <span key={`${req.type}-${index}`} className={req.complete ? "complete" : ""}>{req.complete ? "✓" : "○"} {req.label}</span>)}
              </div>
              <button type="button" className="equipment-action-button" disabled={!actionsAvailable || Boolean(busy) || quest?.complete || !quest?.ready} onClick={() => runMutation("quest", () => submitCompleteChocoboQuest(csrfToken, actionKey("chocobo-quest")), "Filing Chocobo quest paperwork…")}>{quest?.complete ? "Quest Complete" : busy === "quest" ? "Completing…" : "Complete Quest"}</button>
            </div>
          </article>

          <article className={`chocobo-step-card ${writ?.quantity > 0 ? "complete" : ""}`}>
            <span className="chocobo-step-number">3</span>
            <div className="chocobo-step-content">
              <span className="slot-label">Registration Writ</span><h3>Chocobo Registration Writ</h3>
              <p className="muted">Issued for {number(writ?.cost_gil || 500)} Gil once both the Stable and personal quest are ready. The Writ takes exactly one hour to activate.</p>
              {writ?.quantity > 0 ? (
                <div className="chocobo-writ-timer"><span>{writActive ? "WRIT ACTIVE" : "VALIDATING WRIT"}</span><strong>{writActive ? "Ready for registration" : duration(writRemaining)}</strong></div>
              ) : null}
              <button type="button" className="equipment-action-button" disabled={!actionsAvailable || Boolean(busy) || writ?.quantity > 0 || !writ?.can_purchase} onClick={() => runMutation("writ", () => submitPurchaseChocoboWrit(csrfToken, actionKey("chocobo-writ")), "Issuing Chocobo Registration Writ…")}>{writ?.quantity > 0 ? "Writ Issued" : busy === "writ" ? "Purchasing…" : `Purchase Writ · ${number(writ?.cost_gil || 500)} Gil`}</button>
            </div>
          </article>

          <article className={`chocobo-step-card ${writActive ? "ready-step" : ""}`}>
            <span className="chocobo-step-number">4</span>
            <div className="chocobo-step-content">
              <span className="slot-label">Companion Registration</span><h3>Name your Chocobo</h3><p className="muted">Once the Writ is active, choose a name and the Stable will assign one starter trait. The trait is persistent and will matter when Expeditions arrive.</p>
              <label className="chocobo-name-field"><span>Chocobo name</span><input value={name} maxLength={20} onChange={(event) => setName(event.target.value)} placeholder="e.g. Biscuit" /></label>
              <button type="button" className="equipment-action-button" disabled={!actionsAvailable || Boolean(busy) || !writActive || name.trim().length < 2} onClick={() => runMutation("register", () => submitRegisterChocobo(name, csrfToken, actionKey("register-chocobo")), "Registering your Chocobo…")}>{busy === "register" ? "Registering…" : "Register Chocobo"}</button>
            </div>
          </article>
        </div>
      )}

      <section className="chocobo-expedition-preview" aria-label="Expeditions coming soon">
        <div className="panel-title-row">
          <div><span className="panel-kicker">Coming Soon · v1.2</span><h3>Expeditions</h3></div>
          <span className="small-badge">PREPARATION OPEN</span>
        </div>
        <p className="muted">The Stable is your first step toward Expeditions. There are no Expedition action buttons in v1.1.10; this board only tracks the requirements you can prepare today.</p>
        <div className="chocobo-expedition-notes">
          <article className={companion?.registered ? "complete" : ""}><strong>{companion?.registered ? "✓" : "○"} Register a Chocobo</strong><span>Every adventurer will need a registered companion.</span></article>
          <article className={expedition?.board_ready ? "complete" : ""}><strong>{expedition?.board_ready ? "✓" : "○"} Prepare the Guild Board</strong><span>The Fellowship Expedition Board is the shared Guild gate.</span></article>
          <article><strong>Bond &amp; Traits</strong><span>Keep building Bond and your persistent starter trait while the Expedition system is being prepared.</span></article>
        </div>
      </section>

      <div className="chocobo-footer-actions">
        <button type="button" className="equipment-action-button secondary" disabled={!actionsAvailable || Boolean(busy)} onClick={() => loadState()}>{busy === "state" ? "Refreshing…" : "Refresh Stable"}</button>
        <span className="muted">Registered Chocobos gain Bond XP from successful Ventures, Venture treasure, and Hunts. No combat bonuses are added in v1.1.10.</span>
      </div>
    </section>
  );
}
