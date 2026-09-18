import { useCallback, useEffect, useMemo, useState } from "react";
import {
  submitChocoboState,
  submitCompleteChocoboQuest,
  submitPurchaseChocoboWrit,
  submitRegisterChocobo,
  submitRenameChocobo,
  submitSetChocoboPortrait,
  waitForPortalAction,
} from "../api/auth.js";
import ProgressBar from "../components/ProgressBar.jsx";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { duration, number, pct } from "../utils/formatters.js";
import { toggleWithViewportAnchor } from "../utils/viewportAnchor.js";
import ContextHelp from "../components/ContextHelp.jsx";

function actionKey(kind, target = "chocobo") {
  const suffix = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}:${Math.random().toString(36).slice(2)}`;
  return `${kind}:${target}:${suffix}`;
}


const CHOCOBO_PORTRAITS = [
  ["classic_gold", "Classic Gold"],
  ["midnight_black", "Midnight"],
  ["celestial_white", "Celestial"],
  ["ember_red", "Ember"],
  ["verdant_green", "Verdant"],
  ["cobalt_blue", "Cobalt"],
  ["arcane_violet", "Arcane"],
  ["desert_gold", "Sandrunner"],
  ["frost_silver", "Frost"],
  ["rose_pink", "Rose"],
].map(([id, name]) => ({ id, name, src: `/retro-phase-iii/chocobo-portraits-v1/${id}.webp` }));

const CHOCOBO_PORTRAIT_MAP = new Map(CHOCOBO_PORTRAITS.map((portrait) => [portrait.id, portrait]));
const DEFAULT_CHOCOBO_PORTRAIT = CHOCOBO_PORTRAIT_MAP.get("classic_gold");

function portraitFor(id) {
  return CHOCOBO_PORTRAIT_MAP.get(String(id || "")) || DEFAULT_CHOCOBO_PORTRAIT;
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
  const [portraitChoice, setPortraitChoice] = useState("classic_gold");
  const [showPortraitPicker, setShowPortraitPicker] = useState(false);
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
    "SET_CHOCOBO_PORTRAIT",
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
        setPortraitChoice(portraitFor(next.companion?.portrait_id).id);
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
        setPortraitChoice(portraitFor(next.companion?.portrait_id).id);
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
            <div className="chocobo-portrait">
              <img loading="lazy" decoding="async" src={portraitFor(publicChocobo.portrait_id).src} alt={`${publicChocobo.name} Chocobo portrait`} />
            </div>
            <div>
              <span className="slot-label">Registered Companion</span>
              <h3>{publicChocobo.name}</h3>
              <p className="muted">Lv. {number(publicChocobo.level)} · {(publicChocobo.traits || []).map((trait) => trait.name).join(" · ") || "No trait listed"}{publicChocobo.specialization ? ` · ${publicChocobo.specialization.name} Tier ${number(publicChocobo.specialization.tier)}` : ""}</p>
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
          <p className="eyebrow">Chocobo Companions</p>
          <h2>Chocobo Stable</h2>
          <p className="muted">A registered Chocobo is required to launch Expeditions from the Adventure Board.</p>
        </div>
        <div className="chocobo-stable-status">
          <ContextHelp topic="chocobo" />
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
        <>
        <div className="chocobo-owned-layout">
          <div className="chocobo-companion-card featured">
            <div className="chocobo-portrait">
              <img loading="lazy" decoding="async" src={portraitFor(companion.portrait_id).src} alt={`${companion.name} Chocobo portrait`} />
            </div>
            <div className="chocobo-companion-copy">
              <span className="slot-label">Registered Companion</span>
              <h3>{companion.name}</h3>
              <div className="chocobo-level-line"><strong>Lv. {number(companion.level)}</strong><span>Bond XP {number(companion.total_xp)}</span></div>
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
        {companion.specialization ? (
          <section className="chocobo-specialization-panel" aria-label="Chocobo Expedition specialization">
            <div className="panel-title-row compact">
              <div><span className="slot-label">Expedition Specialty</span><h3>{companion.specialization.name} · Tier {number(companion.specialization.tier)}</h3><p className="muted">{companion.specialization.tier_name} · {companion.specialization.summary}</p></div>
              <span className={`small-badge ${companion.specialization.maxed ? "success" : ""}`}>{companion.specialization.maxed ? "MAX BOND TIER" : `NEXT · LV.${number(companion.specialization.next_tier_level)}`}</span>
            </div>
            <div className="chocobo-specialization-effects">{(companion.specialization.effects || []).map((effect) => <span key={effect}>{effect}</span>)}</div>
            <div className="chocobo-expedition-records">
              <div><span>Expeditions</span><strong>{number(companion.accomplishments?.completed || 0)}</strong></div>
              <div><span>Boss clears</span><strong>{number(companion.accomplishments?.boss_clears || 0)}</strong></div>
              <div><span>Rare finds</span><strong>{number(companion.accomplishments?.rare_events || 0)}</strong></div>
              <div><span>Rescues</span><strong>{number(companion.accomplishments?.rescues || 0)}</strong></div>
              <div><span>Legendary</span><strong>{number(companion.accomplishments?.legendary_contracts || 0)}</strong></div>
            </div>
          </section>
        ) : null}
        <section className={`chocobo-portrait-picker ${showPortraitPicker ? "expanded" : "collapsed"}`} aria-labelledby="chocobo-portrait-picker-title">
          <div className="chocobo-portrait-picker-heading">
            <div>
              <span className="slot-label">Companion Portrait</span>
              <h3 id="chocobo-portrait-picker-title">Choose {companion.name}'s portrait</h3>
              <p className="muted">Portraits are cosmetic only. Choose any style and apply it to your registered Chocobo.</p>
            </div>
            <div className="chocobo-portrait-heading-actions">
              <span className="small-badge">10 PORTRAITS</span>
              <button
                type="button"
                className="equipment-action-button secondary chocobo-portrait-toggle"
                aria-expanded={showPortraitPicker}
                aria-controls="chocobo-portrait-gallery"
                onClick={(event) => toggleWithViewportAnchor(event, setShowPortraitPicker)}
              >
                {showPortraitPicker ? "Hide Portrait Gallery" : "Show Portrait Gallery"}
              </button>
            </div>
          </div>
          <div className="chocobo-portrait-picker-summary">
            <div className="chocobo-portrait-picker-current">
              <span className="slot-label">Current Portrait</span>
              <strong>{portraitFor(companion.portrait_id).name}</strong>
            </div>
            <div className="chocobo-portrait-picker-current">
              <span className="slot-label">Selected</span>
              <strong>{portraitFor(portraitChoice).name}</strong>
            </div>
          </div>
          {showPortraitPicker ? (
            <>
              <div id="chocobo-portrait-gallery" className="chocobo-portrait-grid" role="group" aria-label="Chocobo portrait choices">
                {CHOCOBO_PORTRAITS.map((portrait) => {
                  const selected = portraitChoice === portrait.id;
                  const applied = companion.portrait_id === portrait.id;
                  return (
                    <button
                      key={portrait.id}
                      type="button"
                      className={`chocobo-portrait-option ${selected ? "selected" : ""} ${applied ? "applied" : ""}`}
                      aria-pressed={selected}
                      onClick={() => setPortraitChoice(portrait.id)}
                      disabled={Boolean(busy)}
                    >
                      <img loading="lazy" decoding="async" src={portrait.src} alt="" aria-hidden="true" />
                      <span>{portrait.name}</span>
                      {applied ? <small>Applied</small> : null}
                    </button>
                  );
                })}
              </div>
              <div className="chocobo-portrait-picker-actions">
                <span className="muted">Selected: <strong>{portraitFor(portraitChoice).name}</strong></span>
                <button
                  type="button"
                  className="equipment-action-button"
                  disabled={!actionsAvailable || Boolean(busy) || portraitChoice === companion.portrait_id}
                  onClick={() => runMutation(
                    "portrait",
                    () => submitSetChocoboPortrait(portraitChoice, csrfToken, actionKey("chocobo-portrait", portraitChoice)),
                    "Applying Chocobo portrait…",
                  )}
                >
                  {busy === "portrait" ? "Applying…" : portraitChoice === companion.portrait_id ? "Portrait Applied" : "Apply Portrait"}
                </button>
              </div>
            </>
          ) : null}
        </section>
        </>
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
              <span className="slot-label">Companion Registration</span><h3>Name your Chocobo</h3><p className="muted">Once the Writ is active, choose a name and the Stable will assign one persistent Expedition trait.</p>
              <label className="chocobo-name-field"><span>Chocobo name</span><input value={name} maxLength={20} onChange={(event) => setName(event.target.value)} placeholder="e.g. Biscuit" /></label>
              <button type="button" className="equipment-action-button" disabled={!actionsAvailable || Boolean(busy) || !writActive || name.trim().length < 2} onClick={() => runMutation("register", () => submitRegisterChocobo(name, csrfToken, actionKey("register-chocobo")), "Registering your Chocobo…")}>{busy === "register" ? "Registering…" : "Register Chocobo"}</button>
            </div>
          </article>
        </div>
      )}

      <section className="chocobo-expedition-preview" aria-label="Expedition readiness">
        <div className="panel-title-row">
          <div><span className="panel-kicker">Active</span><h3>Expeditions</h3></div>
          <span className="small-badge success">EXPEDITIONS OPEN</span>
        </div>
        <p className="muted">The Stable is your first step toward Expeditions. Once your Chocobo is registered and the Fellowship Expedition Board is complete, launch distant contracts from the Adventure Board.</p>
        <div className="chocobo-expedition-notes">
          <article className={companion?.registered ? "complete" : ""}><strong>{companion?.registered ? "✓" : "○"} Register a Chocobo</strong><span>Every adventurer needs a registered companion to launch.</span></article>
          <article className={expedition?.board_ready ? "complete" : ""}><strong>{expedition?.board_ready ? "✓" : "○"} Prepare the Guild Board</strong><span>The Fellowship Expedition Board is the shared Guild gate.</span></article>
          <article><strong>Bond Specialization</strong><span>Your persistent trait becomes a Guardian, Scout, Pathfinder, Forager, or Treasure Hunter specialty whose Expedition bonuses improve with Bond level.</span></article>
        </div>
      </section>

      <div className="chocobo-footer-actions">
        <span className="muted">Registered Chocobos gain Bond XP from Ventures, treasure, Hunts, and Expeditions. Alpha 5 turns each persistent trait into a scaling Expedition specialty and records your adventures together.</span>
      </div>
    </section>
  );
}
