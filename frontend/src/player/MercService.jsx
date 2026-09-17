import { useCallback, useEffect, useMemo, useState } from "react";
import { submitMercCancel, submitMercHire, submitMercState, waitForPortalAction } from "../api/auth.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import ContextHelp from "../components/ContextHelp.jsx";
import { number } from "../utils/formatters.js";
import { MERC_ART_ROOT, mercContractForHero, mercContractForMission, mercContractsList, mercHeroAvailabilityReason, mercHeroCardArt, mercHeroStatusLabel, mercHeroUiState } from "./mercServiceState.js";

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
const MISSION_ORDER = ["hunt", "venture", "raid"];

export default function MercService({ data, overview, onRefresh }) {
  const { auth } = usePortalAuth();
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [selectedMission, setSelectedMission] = useState("hunt");
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

  const contracts = mercContractsList(state);
  const hire = async (hero) => {
    const mission = String(selectedMission || "");
    if (!actionsAvailable || busy || !hero?.available || !mission) return;
    if (mercHeroUiState(hero, contracts, mission) !== "available") return;
    setBusy(`hire:${hero.id}`); setMessage(`Preparing ${hero.name}'s ${MISSION_LABELS[mission] || mission} contract…`);
    try {
      const response = await submitMercHire(hero.id, mission, csrfToken, actionKey("merc-hire", `${hero.id}:${mission}`));
      const next = applyFinished(await finishedAction(response), "Merc contract updated.");
      if (next && onRefresh) onRefresh();
    } catch (error) { setMessage(String(error?.message || error)); }
    finally { setBusy(""); }
  };

  const browseMission = (mission) => {
    setSelectedMission(mission);
    globalThis.document?.getElementById?.("merc-roster")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  };

  const cancel = async (mission) => {
    if (!actionsAvailable || busy || !mercContractForMission(contracts, mission)) return;
    setBusy(`cancel:${mission}`); setMessage(`Cancelling ${MISSION_LABELS[mission] || mission} Merc contract…`);
    try {
      const response = await submitMercCancel(mission, csrfToken, actionKey("merc-cancel", mission));
      const next = applyFinished(await finishedAction(response), "Merc contract cancelled.");
      if (next && onRefresh) onRefresh();
    } catch (error) { setMessage(String(error?.message || error)); }
    finally { setBusy(""); }
  };

  if (!actionsAvailable) return <div className="profile-grid merc-service-grid"><section className="panel span-12"><p className="eyebrow">Crystal Guild Service</p><h2>Hero Merc Service</h2><p className="merc-lead">Sign in on your own adventurer profile while the Crystal Guild Bot is connected to hire Hero Mercs.</p></section></div>;
  if (!state) return <div className="state-message">Opening the Hero Merc Service…</div>;
  const heroes = Array.isArray(state.heroes) ? state.heroes : [];
  const allSlotsOccupied = contracts.length >= 3;

  return <div className="profile-grid merc-service-grid">
    <section className="panel span-12 merc-hero-panel">
      <div className="merc-hero-copy">
        <div className="panel-title-row merc-title-row"><div><p className="eyebrow">Crystal Guild · Hero Contracts</p><h2>{state.service || "Hero Merc Service"}</h2></div><ContextHelp topic="merc_service" /></div>
        <p className="merc-lead">Hire up to three Heroes at once—one Hunt contract, one Venture contract, and one Raid contract. Each slot is consumed only when its matching assignment begins.</p>
      </div>
      <div className="merc-wallet"><span>Hunt Seals</span><strong>{number(state.hunt_seals)}</strong><small>Lv. {number(state.player_level)} · {number(state.hunt_clears)} Hunt clears</small></div>
      {message ? <div className="state-message compact-state merc-message">{message}</div> : null}
      <figure className="merc-service-hero-art"><img src={`${MERC_ART_ROOT}/scenes/service-hall.webp`} alt="Cloud operating the Crystal Guild Hero Merc Service contract desk" fetchPriority="high" /><figcaption>Cloud manages three independent contract slots: Hunt, Venture, and Raid.</figcaption></figure>
    </section>

    <nav className="merc-mobile-nav" aria-label="Merc Service page sections"><a href="#merc-current">Current</a><a href="#merc-roster">Roster</a><a href="#merc-info">How It Works</a></nav>

    <section className="panel span-12 merc-info-panel" id="merc-info">
      <div className="panel-title-row"><div><p className="eyebrow">Contract Briefing</p><h3>How Merc Contracts Work</h3></div><span className="small-badge">Hunt Seals</span></div>
      <div className="merc-info-layout">
        <figure className="merc-contract-art"><img src={`${MERC_ART_ROOT}/scenes/contract.webp`} alt="Crystal Guild Hero Merc contract parchment paid with Hunt Seals" loading="lazy" /></figure>
        <div className="merc-info-grid">
          <div><strong>1. Earn Seals</strong><span>Complete Hunts to earn Hunt Seals. The same Hunt Seals can also be used at the Quartermaster and for other Guild costs.</span></div>
          <div><strong>2. Pick a Job Type</strong><span>Choose Hunt, Venture, or Raid. A filled slot remains unavailable until that assignment begins or its contract is cancelled.</span></div>
          <div><strong>3. Pick an Eligible Hero</strong><span>Only Heroes who support the selected job type and are not already contracted can be hired. Progression requirements still apply.</span></div>
          <div><strong>4. Up to Three Active</strong><span>You may keep one contract of each job type active at once. If all three slots are filled, every Hero displays unavailable until a slot opens.</span></div>
        </div>
        <figure className="merc-role-art"><img src={`${MERC_ART_ROOT}/scenes/roles.webp`} alt="Merc Service role emblems for Striker, Support, Scavenger, and Specialist" loading="lazy" /></figure>
      </div>
    </section>

    <section className="panel span-12 merc-current-panel" id="merc-current">
      <div className="panel-title-row"><div><p className="eyebrow">Current Contracts</p><h3>{contracts.length ? `${contracts.length} of 3 slots reserved` : "No Heroes hired"}</h3></div><span className={`small-badge ${allSlotsOccupied ? "active" : "ready"}`}>{allSlotsOccupied ? "FULL" : `${3 - contracts.length} OPEN`}</span></div>
      <div className="merc-contract-slots merc-deployment-board">
        {MISSION_ORDER.map((mission) => {
          const contract = mercContractForMission(contracts, mission);
          const image = contract ? `${MERC_ART_ROOT}/cards/${contract.hero_id}-unavailable.webp` : `${MERC_ART_ROOT}/scenes/${mission}.webp`;
          const deployed = Boolean(contract?.deployed) || String(contract?.state || "").toLowerCase() === "deployed";
          return <article className={`merc-contract-slot ${contract ? "occupied" : "open"} ${deployed ? "deployed" : ""} ${selectedMission === mission ? "selected" : ""}`} key={mission}>
            <button type="button" className="merc-slot-visual" onClick={() => browseMission(mission)} aria-label={`View ${MISSION_LABELS[mission]} Merc roster`}>
              <img src={image} alt={contract ? `${contract.hero_name} ${deployed ? "deployed" : "contracted"} for ${MISSION_LABELS[mission]}` : `${MISSION_LABELS[mission]} contract slot open`} loading="lazy" />
              <span className={`merc-slot-state ${contract ? "occupied" : "open"} ${deployed ? "deployed" : ""}`}>{contract ? (deployed ? "DEPLOYED" : "ASSIGNED") : "OPEN"}</span>
            </button>
            <div className="merc-slot-copy"><span className="small-badge">{MISSION_LABELS[mission]}</span><strong>{contract ? contract.hero_name : "Open Slot"}</strong>{contract ? <><span>{contract.signature} · {contract.role}</span><small>{deployed ? `${MISSION_LABELS[mission]} in progress · Hero remains unavailable until resolution.` : `${number(contract.fee_seals)} Hunt Seals · reserved for your next ${MISSION_LABELS[mission]}.`}</small></> : <small>Hire one eligible Hero for your next {MISSION_LABELS[mission]}.</small>}</div>
            <div className="merc-slot-actions">
              <button type="button" className="equipment-action-button secondary" disabled={Boolean(busy)} onClick={() => browseMission(mission)}>{contract ? `View ${MISSION_LABELS[mission]} Roster` : `Choose ${MISSION_LABELS[mission]} Hero`}</button>
              {contract && !deployed ? <button type="button" className="equipment-action-button secondary danger" disabled={Boolean(busy)} onClick={() => cancel(mission)}>{busy === `cancel:${mission}` ? "Cancelling…" : "Cancel Contract"}</button> : null}
            </div>
          </article>;
        })}
      </div>
    </section>

    <section className="panel span-12 merc-action-panel" aria-labelledby="merc-action-title">
      <div className="panel-title-row"><div><p className="eyebrow">Mercs in Action</p><h3 id="merc-action-title">Three Slots. Three Assignment Types.</h3></div><span className="small-badge">Hunt · Venture · Raid</span></div>
      <div className="merc-action-grid">
        <figure><img src={`${MERC_ART_ROOT}/scenes/hunt.webp`} alt="Hero Mercs assisting the Crystal Guild on a Hunt" loading="lazy" /><figcaption><strong>Hunts</strong><span>Earn Hunt Seals and deploy the Hero reserved for your Hunt slot.</span></figcaption></figure>
        <figure><img src={`${MERC_ART_ROOT}/scenes/venture.webp`} alt="Hero Mercs exploring crystalline ruins during a Venture" loading="lazy" /><figcaption><strong>Ventures</strong><span>Use the independent Venture slot for Solo or Rally Venture combat.</span></figcaption></figure>
        <figure><img src={`${MERC_ART_ROOT}/scenes/raid.webp`} alt="Hero Mercs joining a Crystal Guild Raid battle" loading="lazy" /><figcaption><strong>Raids</strong><span>Keep a separate Hero ready for your next high-stakes Raid.</span></figcaption></figure>
      </div>
    </section>

    <section className="panel span-12 merc-roster-panel" id="merc-roster">
      <div className="panel-title-row"><div><p className="eyebrow">Merc Roster</p><h3>Hire for {MISSION_LABELS[selectedMission]}</h3></div><button type="button" className="equipment-action-button secondary compact" disabled={Boolean(busy)} onClick={() => loadState()}>{busy === "state" ? "Refreshing…" : "Refresh"}</button></div>
      <div className="merc-job-picker" role="group" aria-label="Merc assignment type">
        {MISSION_ORDER.map((mission) => {
          const occupied = Boolean(mercContractForMission(contracts, mission));
          return <button type="button" key={mission} className={selectedMission === mission ? "active" : ""} onClick={() => setSelectedMission(mission)}><span>{MISSION_LABELS[mission]}</span><small>{occupied ? "Reserved" : "Open"}</small></button>;
        })}
      </div>
      <div className="merc-roster-grid">
        {heroes.map((hero) => {
          const affordable = Number(state.hunt_seals || 0) >= Number(hero.fee_seals || 0);
          const heroContract = mercContractForHero(contracts, hero.id);
          const uiState = mercHeroUiState(hero, contracts, selectedMission);
          const isDeployed = uiState === "deployed";
          const isContracted = uiState === "contracted" || isDeployed;
          const canHire = uiState === "available" && affordable && !busy;
          const statusLabel = mercHeroStatusLabel(hero, contracts, selectedMission);
          const statusClass = isContracted ? "active" : uiState === "available" ? "ready" : "locked";
          const artAltState = uiState === "available" ? "available" : isDeployed ? "deployed" : isContracted ? "contracted" : "unavailable";
          const availabilityReason = mercHeroAvailabilityReason(hero, contracts, selectedMission);
          return <article className={`merc-card ${uiState === "available" ? "available" : "locked"} ${uiState}`} key={hero.id}>
            <div className="merc-card-art-frame"><img src={mercHeroCardArt(hero, contracts, selectedMission)} alt={`${hero.name} Merc contract card — ${artAltState}`} loading="lazy" /></div>
            <div className="merc-card-meta"><span>{hero.origin}</span><span className={`small-badge ${statusClass}`}>{statusLabel}</span></div>
            <p className="merc-card-effect">{hero.effect_summary}</p>
            <div className={`merc-availability-line ${uiState}`}><strong>{isDeployed ? "Deployed" : isContracted ? "On Contract" : uiState === "available" ? "Available" : hero.available ? "Unavailable" : "Locked"}</strong><span>{availabilityReason}</span></div>
            {isContracted ? <div className="merc-contract-reason"><strong>{isDeployed ? "Assignment In Progress" : "Currently Hired"}</strong><span>{isDeployed ? `${MISSION_LABELS[heroContract?.mission_type] || heroContract?.mission_type || "Assignment"} is underway. This Hero and slot remain unavailable until it resolves.` : `Reserved for your next ${MISSION_LABELS[heroContract?.mission_type] || heroContract?.mission_type || "assignment"}. This Hero cannot take another job until that contract resolves.`}</span></div> : uiState === "available" ? <button type="button" className="equipment-action-button" disabled={!canHire} onClick={() => hire(hero)}>{busy === `hire:${hero.id}` ? "Hiring…" : affordable ? `Hire for ${MISSION_LABELS[selectedMission]} · ${number(hero.fee_seals)} Hunt Seals` : `Need ${number(hero.fee_seals)} Hunt Seals`}</button> : null}
          </article>;
        })}
      </div>
      <figure className="merc-future-art"><img src={`${MERC_ART_ROOT}/scenes/coming-soon.webp`} alt="Cloud beside silhouettes teasing future Hero Merc additions" loading="lazy" /><figcaption>More Hero contracts can join the roster in future Crystal Guild updates.</figcaption></figure>
    </section>
  </div>;
}
