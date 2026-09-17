import { useCallback, useEffect, useMemo, useState } from "react";
import { submitMercCancel, submitMercHire, submitMercState, waitForPortalAction } from "../api/auth.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import ContextHelp from "../components/ContextHelp.jsx";
import { number } from "../utils/formatters.js";
import { MERC_ART_ROOT, mercHeroCardArt, mercHeroStatusLabel, mercHeroUiState } from "./mercServiceState.js";

function actionKey(kind, target = "merc") {
  const suffix = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}:${Math.random().toString(36).slice(2)}`;
  return `${kind}:${target}:${suffix}`;
}

async function finishedAction(response) {
  const action = response?.action;
  if (!action?.id) throw new Error("Crystal Guild did not return a Merc request ID.");
  if (action.status === "completed" || action.status === "failed") return action;
  return waitForPortalAction(action.id, { attempts: 32, delayMs: 650 });
}

const MISSION_LABELS = { hunt: "Hunt", venture: "Venture", raid: "Raid" };

export default function MercService({ data, overview, onRefresh }) {
  const { auth } = usePortalAuth();
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [missionByHero, setMissionByHero] = useState({});
  const username = String(overview?.identity?.username || data?.identity?.username || "").toLowerCase();
  const isOwnProfile = Boolean(auth.authenticated && auth.player?.username && String(auth.player.username).toLowerCase() === username);
  const capabilities = useMemo(() => new Set(Array.isArray(auth.action_capabilities) ? auth.action_capabilities : []), [auth.action_capabilities]);
  const required = ["MERC_STATE", "MERC_HIRE", "MERC_CANCEL"];
  const actionsAvailable = Boolean(isOwnProfile && auth.actions_enabled && required.every((kind) => capabilities.has(kind)));
  const csrfToken = auth.csrf_token || "";

  const applyFinished = useCallback((finished, fallback) => {
    if (!finished) { setMessage("The Merc request is still processing. Refresh before trying again."); return null; }
    setMessage(finished.result?.message || fallback);
    const next = finished.result?.data?.merc_state || null;
    if (next) setState(next);
    return next;
  }, []);

  const loadState = useCallback(async ({ quiet = false } = {}) => {
    if (!actionsAvailable || busy) return null;
    if (!quiet) { setBusy("state"); setMessage("Checking the Merc desk…"); }
    try {
      const response = await submitMercState(csrfToken, actionKey("merc-state"));
      return applyFinished(await finishedAction(response), "Merc Service refreshed.");
    } catch (error) { setMessage(String(error?.message || error)); return null; }
    finally { if (!quiet) setBusy(""); }
  }, [actionsAvailable, busy, csrfToken, applyFinished]);

  useEffect(() => { if (actionsAvailable && !state) void loadState({ quiet: true }); }, [actionsAvailable, state, loadState]);

  const hire = async (hero) => {
    const missions = Array.isArray(hero?.mission_types) ? hero.mission_types : [];
    const mission = String(missionByHero[hero.id] || missions[0] || "");
    if (!actionsAvailable || busy || !hero?.available || !mission || state?.contract) return;
    setBusy(`hire:${hero.id}`); setMessage(`Preparing ${hero.name}'s ${MISSION_LABELS[mission] || mission} contract…`);
    try {
      const response = await submitMercHire(hero.id, mission, csrfToken, actionKey("merc-hire", hero.id));
      const next = applyFinished(await finishedAction(response), "Merc contract updated.");
      if (next && onRefresh) onRefresh();
    } catch (error) { setMessage(String(error?.message || error)); }
    finally { setBusy(""); }
  };

  const cancel = async () => {
    if (!actionsAvailable || busy || !state?.contract) return;
    setBusy("cancel"); setMessage("Cancelling Merc contract…");
    try {
      const response = await submitMercCancel(csrfToken, actionKey("merc-cancel"));
      const next = applyFinished(await finishedAction(response), "Merc contract cancelled.");
      if (next && onRefresh) onRefresh();
    } catch (error) { setMessage(String(error?.message || error)); }
    finally { setBusy(""); }
  };

  if (!actionsAvailable) return <div className="profile-grid merc-service-grid"><section className="panel span-12"><p className="eyebrow">Crystal Guild Service</p><h2>Hero Merc Service</h2><p className="merc-lead">Sign in on your own adventurer profile while the Crystal Guild Bot is connected to hire Hero Mercs.</p></section></div>;
  if (!state) return <div className="state-message">Opening the Hero Merc Service…</div>;
  const heroes = Array.isArray(state.heroes) ? state.heroes : [];
  const contract = state.contract || null;

  return <div className="profile-grid merc-service-grid">
    <section className="panel span-12 merc-hero-panel">
      <div className="merc-hero-copy">
        <div className="panel-title-row merc-title-row"><div><p className="eyebrow">Crystal Guild · Hero Contracts</p><h2>{state.service || "Hero Merc Service"}</h2></div><ContextHelp topic="merc_service" /></div>
        <p className="merc-lead">Hire one Hero with Hunt Seals for your next eligible Hunt, Venture, or Raid. The contract is consumed only when that matching assignment begins.</p>
      </div>
      <div className="merc-wallet"><span>Hunt Seals</span><strong>{number(state.hunt_seals)}</strong><small>Lv. {number(state.player_level)} · {number(state.hunt_clears)} Hunt clears</small></div>
      {message ? <div className="state-message compact-state merc-message">{message}</div> : null}
      <figure className="merc-service-hero-art"><img src={`${MERC_ART_ROOT}/scenes/service-hall.webp`} alt="Cloud operating the Crystal Guild Hero Merc Service contract desk" fetchPriority="high" /><figcaption>Cloud manages the contract desk while available Heroes take assignments across the Guild.</figcaption></figure>
    </section>

    <nav className="merc-mobile-nav" aria-label="Merc Service page sections"><a href="#merc-current">Current</a><a href="#merc-roster">Roster</a><a href="#merc-info">How It Works</a></nav>

    <section className="panel span-12 merc-info-panel" id="merc-info">
      <div className="panel-title-row"><div><p className="eyebrow">Contract Briefing</p><h3>How Merc Contracts Work</h3></div><span className="small-badge">Hunt Seals</span></div>
      <div className="merc-info-layout">
        <figure className="merc-contract-art"><img src={`${MERC_ART_ROOT}/scenes/contract.webp`} alt="Crystal Guild Hero Merc contract parchment paid with Hunt Seals" loading="lazy" /></figure>
        <div className="merc-info-grid">
          <div><strong>1. Earn Seals</strong><span>Complete Hunts to earn Hunt Seals. The same Hunt Seals can also be used at the Quartermaster and for other Guild costs.</span></div>
          <div><strong>2. Pick a Hero</strong><span>Hero access is based on your Character Level and lifetime Hunt clears. Each Hero supports only the mission types shown on their card.</span></div>
          <div><strong>3. Reserve a Mission</strong><span>Choose Hunt, Venture, or Raid when hiring. Only one Merc contract may be active, and it waits until that matching assignment actually begins.</span></div>
          <div><strong>4. Hero Intervenes</strong><span>The Hero uses their signature assist during the mission. Cancelling frees the contract slot, but spent Hunt Seals are not refunded.</span></div>
        </div>
        <figure className="merc-role-art"><img src={`${MERC_ART_ROOT}/scenes/roles.webp`} alt="Merc Service role emblems for Striker, Support, Scavenger, and Specialist" loading="lazy" /></figure>
      </div>
    </section>

    <section className="panel span-12 merc-current-panel" id="merc-current">
      <div className="panel-title-row"><div><p className="eyebrow">Current Contract</p><h3>{contract ? contract.hero_name : "No Hero hired"}</h3></div><span className={`small-badge ${contract ? "active" : "ready"}`}>{contract ? (MISSION_LABELS[contract.mission_type] || contract.mission_type) : "READY"}</span></div>
      {contract ? <div className="merc-current-contract"><div><strong>{contract.signature}</strong><span>{contract.role} · {number(contract.fee_seals)} Hunt Seals</span><small>Reserved for your next {MISSION_LABELS[contract.mission_type] || contract.mission_type}.</small></div><button type="button" className="equipment-action-button secondary" disabled={Boolean(busy)} onClick={cancel}>{busy === "cancel" ? "Cancelling…" : "Cancel Contract"}</button></div> : <p className="merc-empty">Choose an available Hero below. Hunt Seals are charged when the contract is accepted and are non-refundable if you cancel.</p>}
    </section>

    <section className="panel span-12 merc-action-panel" aria-labelledby="merc-action-title">
      <div className="panel-title-row"><div><p className="eyebrow">Mercs in Action</p><h3 id="merc-action-title">One Contract. One Assignment.</h3></div><span className="small-badge">Hunt · Venture · Raid</span></div>
      <div className="merc-action-grid">
        <figure><img src={`${MERC_ART_ROOT}/scenes/hunt.webp`} alt="Hero Mercs assisting the Crystal Guild on a Hunt" loading="lazy" /><figcaption><strong>Hunts</strong><span>Earn Hunt Seals and deploy a contracted Hero against marked targets.</span></figcaption></figure>
        <figure><img src={`${MERC_ART_ROOT}/scenes/venture.webp`} alt="Hero Mercs exploring crystalline ruins during a Venture" loading="lazy" /><figcaption><strong>Ventures</strong><span>Bring specialized support into Solo or Rally Venture combat.</span></figcaption></figure>
        <figure><img src={`${MERC_ART_ROOT}/scenes/raid.webp`} alt="Hero Mercs joining a Crystal Guild Raid battle" loading="lazy" /><figcaption><strong>Raids</strong><span>Call in a Hero's signature intervention during high-stakes encounters.</span></figcaption></figure>
      </div>
    </section>

    <section className="panel span-12 merc-roster-panel" id="merc-roster">
      <div className="panel-title-row"><div><p className="eyebrow">Merc Roster</p><h3>Hero Contracts</h3></div><button type="button" className="equipment-action-button secondary compact" disabled={Boolean(busy)} onClick={() => loadState()}>{busy === "state" ? "Refreshing…" : "Refresh"}</button></div>
      <div className="merc-roster-grid">
        {heroes.map((hero) => {
          const missions = Array.isArray(hero.mission_types) ? hero.mission_types : [];
          const selected = String(missionByHero[hero.id] || missions[0] || "");
          const affordable = Number(state.hunt_seals || 0) >= Number(hero.fee_seals || 0);
          const uiState = mercHeroUiState(hero, contract);
          const isContracted = uiState === "contracted";
          const canHire = uiState === "available" && affordable && !contract && !busy;
          const statusLabel = mercHeroStatusLabel(hero, contract);
          const statusClass = isContracted ? "active" : uiState === "available" ? "ready" : "locked";
          const artAltState = uiState === "available" ? "available" : isContracted ? "contracted" : "unavailable";
          return <article className={`merc-card ${uiState === "available" ? "available" : "locked"} ${uiState}`} key={hero.id}>
            <div className="merc-card-art-frame"><img src={mercHeroCardArt(hero, contract)} alt={`${hero.name} Merc contract card — ${artAltState}`} loading="lazy" /></div>
            <div className="merc-card-meta"><span>{hero.origin}</span><span className={`small-badge ${statusClass}`}>{statusLabel}</span></div>
            <p className="merc-card-effect">{hero.effect_summary}</p>
            {isContracted ? <div className="merc-contract-reason"><strong>Currently Hired</strong><span>Reserved for your next {MISSION_LABELS[contract?.mission_type] || contract?.mission_type || "assignment"}. Cancel the active contract to make this Hero available again.</span></div> : hero.available ? <><label className="merc-mission-field"><span>Contract for</span><select disabled={Boolean(busy) || Boolean(contract)} value={selected} onChange={(event) => setMissionByHero((current) => ({ ...current, [hero.id]: event.target.value }))}>{missions.map((mission) => <option value={mission} key={mission}>{MISSION_LABELS[mission] || mission}</option>)}</select></label><button type="button" className="equipment-action-button" disabled={!canHire} onClick={() => hire(hero)}>{busy === `hire:${hero.id}` ? "Hiring…" : contract ? "Contract Slot Occupied" : affordable ? `Hire · ${number(hero.fee_seals)} Hunt Seals` : `Need ${number(hero.fee_seals)} Hunt Seals`}</button></> : <div className="merc-lock-reason"><strong>Unavailable</strong><span>{hero.locked_reason || `Requires Lv. ${number(hero.min_level)} and ${number(hero.required_hunt_clears)} Hunt clears.`}</span></div>}
          </article>;
        })}
      </div>
      <figure className="merc-future-art"><img src={`${MERC_ART_ROOT}/scenes/coming-soon.webp`} alt="Cloud beside silhouettes teasing future Hero Merc additions" loading="lazy" /><figcaption>More Hero contracts can join the roster in future Crystal Guild updates.</figcaption></figure>
    </section>
  </div>;
}
