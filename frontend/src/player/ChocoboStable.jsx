import { refreshAfterPortalMutation } from "../utils/actionRefresh.js";
import LockIcon from "../components/LockIcon.jsx";
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
  const [showManagement, setShowManagement] = useState(false);
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
        refreshAfterPortalMutation(onRefresh);
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

  const registrationStep = !stable?.unlocked
    ? 1
    : !quest?.complete
      ? 2
      : Number(writ?.quantity || 0) <= 0
        ? 3
        : 4;
  const registrationSteps = [
    { id: 1, label: "Build Stable", complete: Boolean(stable?.unlocked) },
    { id: 2, label: "Personal Quest", complete: Boolean(quest?.complete) },
    { id: 3, label: "Registration Writ", complete: Number(writ?.quantity || 0) > 0 },
    { id: 4, label: "Register Chocobo", complete: Boolean(companion?.registered) },
  ];

  return (
    <section className="panel chocobo-stable-panel chocobo-stable-redesign">
      <div className="panel-title-row chocobo-title-row chocobo-stable-heading">
        <div className="chocobo-heading-copy">
          <p className="eyebrow">Chocobo Companions</p>
          <h2>Chocobo Stable</h2>
          <p className="muted">Raise your companion, manage Bond progress, and prepare for Expeditions.</p>
        </div>
        <div className="chocobo-stable-status">
          <ContextHelp topic="chocobo" />
          <span className={`small-badge ${stable?.unlocked ? "ready" : "locked"}`}>{stable?.unlocked ? "STABLE OPEN" : <LockIcon label="Chocobo Stable locked" />}</span>
          <span className="small-badge">{number(state?.gil ?? overview?.identity?.gil ?? 0)} Gil</span>
        </div>
      </div>

      {!actionsAvailable ? (
        <div className="chocobo-inline-status offline">
          <strong>Stable controls unavailable</strong>
          <span>Chocobo actions return when Crystal Guild reconnects.</span>
        </div>
      ) : message ? (
        <div className="chocobo-inline-status ready" aria-live="polite">
          <span>{message}</span>
        </div>
      ) : null}

      {!state ? (
        <div className="state-message">{actionsAvailable ? "Loading Chocobo Stable…" : "Crystal Guild must be online to manage your Chocobo."}</div>
      ) : companion?.registered ? (
        <>
          <section className="chocobo-companion-command" aria-label="Registered Chocobo overview">
            <div className="chocobo-companion-hero">
              <div className="chocobo-portrait chocobo-portrait-large">
                <img loading="lazy" decoding="async" src={portraitFor(companion.portrait_id).src} alt={`${companion.name} Chocobo portrait`} />
              </div>
              <div className="chocobo-companion-identity">
                <span className="slot-label">Registered Companion</span>
                <div className="chocobo-name-row">
                  <h3>{companion.name}</h3>
                  <span className="small-badge">LV. {number(companion.level)}</span>
                </div>
                <div className="chocobo-bond-summary">
                  <div className="vital-label"><span>Bond Progress</span><span>{Number(companion.xp_next || 0) > 0 ? `${number(companion.xp_current)} / ${number(companion.xp_next)}` : "MAX"}</span></div>
                  {Number(companion.xp_next || 0) > 0 ? <ProgressBar value={pct(companion.xp_current, companion.xp_next)} /> : <span className="small-badge success">MAX LEVEL</span>}
                  <small>{number(companion.total_xp)} total Bond XP</small>
                </div>
                {(companion.traits || []).length ? (
                  <div className="chocobo-trait-inline">
                    {(companion.traits || []).map((trait) => (
                      <span key={trait.id}><strong>{trait.name}</strong><small>{trait.description}</small></span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="chocobo-quick-stats" aria-label="Chocobo quick stats">
              <div><span>Specialty</span><strong>{companion.specialization?.name || "Unassigned"}</strong><small>{companion.specialization ? `Tier ${number(companion.specialization.tier)}` : "Raise Bond to develop"}</small></div>
              <div><span>Expeditions</span><strong>{number(companion.accomplishments?.completed || 0)}</strong><small>Completed together</small></div>
              <div><span>Rare Finds</span><strong>{number(companion.accomplishments?.rare_events || 0)}</strong><small>Special discoveries</small></div>
              <div><span>Boss Clears</span><strong>{number(companion.accomplishments?.boss_clears || 0)}</strong><small>Expedition bosses</small></div>
            </div>
          </section>

          <div className="chocobo-stable-dashboard">
            <section className={`chocobo-readiness-card ${expedition?.ready ? "ready" : ""}`} aria-label="Expedition readiness">
              <div className="chocobo-card-heading">
                <div><span className="slot-label">Expedition Readiness</span><h3>{(expedition?.ground_ready ?? expedition?.ready) ? "Ready to Venture" : "Preparation Needed"}</h3></div>
                <span className={`small-badge ${expedition?.ready ? "success" : ""}`}>{expedition?.ready ? "READY" : "PREPARING"}</span>
              </div>
              <p>{expedition?.message}</p>
              <div className="chocobo-readiness-list">
                <span className={expedition?.chocobo_ready ? "complete" : ""}>{expedition?.chocobo_ready ? "✓" : "○"}<span><strong>Registered Chocobo</strong><small>Your companion is ready to travel.</small></span></span>
                <span className={expedition?.board_ready ? "complete" : ""}>{expedition?.board_ready ? "✓" : "○"}<span><strong>Fellowship Expedition Board</strong><small>The shared Guild gate for distant contracts.</small></span></span>
              </div>
              <small className="chocobo-readiness-note">Launch Expeditions from the Adventure Board once both requirements are complete.</small>
            </section>

            {companion.specialization ? (
              <section className="chocobo-specialization-panel chocobo-specialization-rework" aria-label="Chocobo Expedition specialization">
                <div className="chocobo-card-heading">
                  <div><span className="slot-label">Bond Specialty</span><h3>{companion.specialization.name} · Tier {number(companion.specialization.tier)}</h3><p>{companion.specialization.tier_name} · {companion.specialization.summary}</p></div>
                  <span className={`small-badge ${companion.specialization.maxed ? "success" : ""}`}>{companion.specialization.maxed ? "MAX BOND TIER" : `NEXT · LV.${number(companion.specialization.next_tier_level)}`}</span>
                </div>
                <div className="chocobo-specialization-effects">{(companion.specialization.effects || []).map((effect) => <span key={effect}>{effect}</span>)}</div>
                <div className="chocobo-expedition-records chocobo-records-compact">
                  <div><span>Rescues</span><strong>{number(companion.accomplishments?.rescues || 0)}</strong></div>
                  <div><span>Legendary</span><strong>{number(companion.accomplishments?.legendary_contracts || 0)}</strong></div>
                  <div><span>Total Bond XP</span><strong>{number(companion.total_xp)}</strong></div>
                </div>
                <small className="chocobo-specialty-note">Alpha 5 turns each persistent trait into a scaling Expedition specialty and records your adventures together.</small>
              </section>
            ) : null}
          </div>

          <section className={`chocobo-management ${showManagement ? "expanded" : "collapsed"}`} aria-labelledby="chocobo-management-title">
            <div className="chocobo-management-heading">
              <div>
                <span className="slot-label">Stable Services</span>
                <h3 id="chocobo-management-title">Companion Management</h3>
                <p className="muted">Rename your Chocobo or change its cosmetic portrait when you need it.</p>
              </div>
              <button
                type="button"
                className="equipment-action-button secondary"
                aria-expanded={showManagement}
                aria-controls="chocobo-management-body"
                onClick={(event) => toggleWithViewportAnchor(event, setShowManagement)}
              >
                {showManagement ? "Hide Stable Services" : "Manage Companion"}
              </button>
            </div>
            {!showManagement ? (
              <div className="chocobo-management-summary">
                <span><small>Name</small><strong>{companion.name}</strong></span>
                <span><small>Portrait</small><strong>{portraitFor(companion.portrait_id).name}</strong></span>
              </div>
            ) : (
              <div id="chocobo-management-body" className="chocobo-management-body">
                <div className="chocobo-rename-service">
                  <div><span className="slot-label">Rename Service</span><strong>Change companion name</strong><small>Names can be 2–20 characters.</small></div>
                  <label className="chocobo-name-field"><span>New Chocobo name</span><input value={rename} maxLength={20} onChange={(event) => setRename(event.target.value)} placeholder={companion.name} /></label>
                  <button type="button" className="equipment-action-button secondary" disabled={!actionsAvailable || Boolean(busy) || rename.trim().length < 2} onClick={() => runMutation("rename", () => submitRenameChocobo(rename, csrfToken, actionKey("rename-chocobo")), "Renaming companion…")}>{busy === "rename" ? "Renaming…" : "Rename Chocobo"}</button>
                </div>

                <section className={`chocobo-portrait-picker ${showPortraitPicker ? "expanded" : "collapsed"}`} aria-labelledby="chocobo-portrait-picker-title">
                  <div className="chocobo-portrait-picker-heading">
                    <div>
                      <span className="slot-label">Companion Portrait</span>
                      <h3 id="chocobo-portrait-picker-title">Choose {companion.name}'s portrait</h3>
                      <p className="muted">Portraits are cosmetic only and do not change Chocobo stats.</p>
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
                    <div className="chocobo-portrait-picker-current"><span className="slot-label">Current Portrait</span><strong>{portraitFor(companion.portrait_id).name}</strong></div>
                    <div className="chocobo-portrait-picker-current"><span className="slot-label">Selected</span><strong>{portraitFor(portraitChoice).name}</strong></div>
                  </div>
                  {showPortraitPicker ? (
                    <>
                      <div id="chocobo-portrait-gallery" className="chocobo-portrait-grid" role="group" aria-label="Chocobo portrait choices">
                        {CHOCOBO_PORTRAITS.map((portrait) => {
                          const selected = portraitChoice === portrait.id;
                          const applied = companion.portrait_id === portrait.id;
                          return (
                            <button key={portrait.id} type="button" className={`chocobo-portrait-option ${selected ? "selected" : ""} ${applied ? "applied" : ""}`} aria-pressed={selected} onClick={() => setPortraitChoice(portrait.id)} disabled={Boolean(busy)}>
                              <img loading="lazy" decoding="async" src={portrait.src} alt="" aria-hidden="true" />
                              <span>{portrait.name}</span>
                              {applied ? <small>Applied</small> : null}
                            </button>
                          );
                        })}
                      </div>
                      <div className="chocobo-portrait-picker-actions">
                        <span className="muted">Selected: <strong>{portraitFor(portraitChoice).name}</strong></span>
                        <button type="button" className="equipment-action-button" disabled={!actionsAvailable || Boolean(busy) || portraitChoice === companion.portrait_id} onClick={() => runMutation("portrait", () => submitSetChocoboPortrait(portraitChoice, csrfToken, actionKey("chocobo-portrait", portraitChoice)), "Applying Chocobo portrait…")}>{busy === "portrait" ? "Applying…" : portraitChoice === companion.portrait_id ? "Portrait Applied" : "Apply Portrait"}</button>
                      </div>
                    </>
                  ) : null}
                </section>
              </div>
            )}
          </section>
        </>
      ) : (
        <section className="chocobo-registration-shell" aria-label="Chocobo registration progress">
          <div className="chocobo-registration-progress">
            {registrationSteps.map((step) => (
              <div key={step.id} className={`${step.complete ? "complete" : ""} ${registrationStep === step.id ? "current" : ""}`}>
                <span>{step.complete ? "✓" : step.id}</span>
                <small>{step.label}</small>
              </div>
            ))}
          </div>

          <div className="chocobo-registration-layout">
            <article className="chocobo-registration-focus">
              <span className="slot-label">Current Step · {registrationStep} of 4</span>
              {registrationStep === 1 ? (
                <div className="chocobo-registration-focus-copy">
                  <h3>Build the Chocobo Stable</h3>
                  <p>A Fellowship must construct the Stable before personal Chocobo registration can begin.</p>
                  <div className="chocobo-requirements">
                    <span>○ Fellowship LVL 2</span>
                    <span>○ 5,000 Gil project cost</span>
                    <span>○ 10 completed Ventures</span>
                  </div>
                  <strong className="chocobo-step-callout">Complete this shared project from the Fellowship page.</strong>
                </div>
              ) : registrationStep === 2 ? (
                <div className="chocobo-registration-focus-copy">
                  <h3>{quest?.name || "Personal Chocobo Quest"}</h3>
                  <p>{quest?.description}</p>
                  <div className="chocobo-requirements">{(quest?.requirements || []).map((req, index) => <span key={`${req.type}-${index}`} className={req.complete ? "complete" : ""}>{req.complete ? "✓" : "○"} {req.label}</span>)}</div>
                  <button type="button" className="equipment-action-button" disabled={!actionsAvailable || Boolean(busy) || quest?.complete || !quest?.ready} onClick={() => runMutation("quest", () => submitCompleteChocoboQuest(csrfToken, actionKey("chocobo-quest")), "Filing Chocobo quest paperwork…")}>{quest?.complete ? "Quest Complete" : busy === "quest" ? "Completing…" : "Complete Quest"}</button>
                </div>
              ) : registrationStep === 3 ? (
                <div className="chocobo-registration-focus-copy">
                  <h3>Chocobo Registration Writ</h3>
                  <p>Purchase the {number(writ?.cost_gil || 500)} Gil Writ. It takes exactly one hour to activate before registration.</p>
                  <div className="chocobo-registration-cost"><span>Writ Cost</span><strong>{number(writ?.cost_gil || 500)} Gil</strong></div>
                  <button type="button" className="equipment-action-button" disabled={!actionsAvailable || Boolean(busy) || writ?.quantity > 0 || !writ?.can_purchase} onClick={() => runMutation("writ", () => submitPurchaseChocoboWrit(csrfToken, actionKey("chocobo-writ")), "Issuing Chocobo Registration Writ…")}>{writ?.quantity > 0 ? "Writ Issued" : busy === "writ" ? "Purchasing…" : `Purchase Writ · ${number(writ?.cost_gil || 500)} Gil`}</button>
                </div>
              ) : (
                <div className="chocobo-registration-focus-copy">
                  <h3>{writActive ? "Name your Chocobo" : "Writ Validation"}</h3>
                  {writ?.quantity > 0 ? <div className="chocobo-writ-timer"><span>{writActive ? "WRIT ACTIVE" : "VALIDATING WRIT"}</span><strong>{writActive ? "Ready for registration" : duration(writRemaining)}</strong></div> : null}
                  <p>{writActive ? "Choose a name and the Stable will assign one persistent Expedition trait." : "Your Writ is being validated. Registration unlocks automatically when the timer reaches zero."}</p>
                  <label className="chocobo-name-field"><span>Chocobo name</span><input value={name} maxLength={20} onChange={(event) => setName(event.target.value)} placeholder="e.g. Biscuit" disabled={!writActive} /></label>
                  <button type="button" className="equipment-action-button" disabled={!actionsAvailable || Boolean(busy) || !writActive || name.trim().length < 2} onClick={() => runMutation("register", () => submitRegisterChocobo(name, csrfToken, actionKey("register-chocobo")), "Registering your Chocobo…")}>{busy === "register" ? "Registering…" : "Register Chocobo"}</button>
                </div>
              )}
            </article>

            <aside className="chocobo-registration-roadmap">
              <div><span className="slot-label">Registration Roadmap</span><h3>Journey to your Companion</h3></div>
              {registrationSteps.map((step) => (
                <div key={step.id} className={`chocobo-roadmap-step ${step.complete ? "complete" : ""} ${registrationStep === step.id ? "current" : ""}`}>
                  <span className="chocobo-roadmap-number">{step.complete ? "✓" : step.id}</span>
                  <span><strong>{step.label}</strong><small>{step.complete ? "Complete" : registrationStep === step.id ? "Current step" : <LockIcon label="Locked until prior steps are complete" />}</small></span>
                </div>
              ))}
              <p className="muted">Once registered, your Chocobo gains Bond XP from Ventures, treasure, Hunts, and Expeditions.</p>
            </aside>
          </div>
        </section>
      )}
    </section>
  );
}
