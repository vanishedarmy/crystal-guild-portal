import { useCallback, useEffect, useMemo, useState } from "react";
import { submitMercCancel, submitMercHire, submitMercRecruit, submitMercState, waitForPortalAction } from "../api/auth.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import ContextHelp from "../components/ContextHelp.jsx";
import { number } from "../utils/formatters.js";
import {
  MERC_ART_ROOT,
  mercContractForHero,
  mercContractForMission,
  mercContractsList,
  mercHeroAvailabilityReason,
  mercHeroCardArt,
  mercHeroStatusLabel,
  mercHeroUiState,
  mercRecruitmentStatusLabel,
  mercRegistryCardArt,
} from "./mercServiceState.js";

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
const VIEW_LABELS = { hire: "Hire Heroes", recruitment: "Recruitment", registry: "Merc Registry" };

export default function MercService({ data, overview, onRefresh }) {
  const { auth } = usePortalAuth();
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [selectedMission, setSelectedMission] = useState("hunt");
  const [view, setView] = useState("hire");
  const username = String(overview?.identity?.username || data?.identity?.username || "").toLowerCase();
  const isOwnProfile = Boolean(auth.authenticated && auth.player?.username && String(auth.player.username).toLowerCase() === username);
  const capabilities = useMemo(() => new Set(Array.isArray(auth.action_capabilities) ? auth.action_capabilities : []), [auth.action_capabilities]);
  const required = ["MERC_STATE", "MERC_RECRUIT", "MERC_HIRE", "MERC_CANCEL"];
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

  const recruit = async (hero) => {
    const recruitment = hero?.recruitment || {};
    if (!actionsAvailable || busy || !recruitment.required || recruitment.recruited || !recruitment.ready) return;
    setBusy(`recruit:${hero.id}`); setMessage(`Finalizing ${hero.name}'s recruitment…`);
    try {
      const response = await submitMercRecruit(hero.id, csrfToken, actionKey("merc-recruit", hero.id));
      const next = applyFinished(await finishedAction(response), "Merc recruitment updated.");
      if (next && onRefresh) onRefresh();
    } catch (error) { setMessage(String(error?.message || error)); }
    finally { setBusy(""); }
  };

  const browseMission = (mission) => {
    setSelectedMission(mission);
    setView("hire");
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

  if (!actionsAvailable) return <div className="profile-grid merc-service-grid"><section className="panel span-12"><p className="eyebrow">Crystal Guild Service</p><h2>Hero Merc Service</h2><p className="merc-lead">Sign in on your own adventurer profile while the Crystal Guild Bot is connected to recruit and hire Hero Mercs.</p></section></div>;
  if (!state) return <div className="state-message">Opening the Hero Merc Service…</div>;

  const heroes = Array.isArray(state.heroes) ? state.heroes : [];
  const hiredRoster = heroes.filter((hero) => !hero?.recruitment?.required || hero?.recruitment?.recruited);
  const expansionRoster = heroes.filter((hero) => hero?.recruitment?.required);
  const eliteRoster = heroes.filter((hero) => String(hero?.tier || "").toLowerCase() === "elite");
  const allSlotsOccupied = contracts.length >= 3;
  const registry = state.registry || { recruited: hiredRoster.length, total: heroes.length };

  return <div className="profile-grid merc-service-grid">
    <section className="panel span-12 merc-hero-panel">
      <div className="merc-hero-copy">
        <div className="panel-title-row merc-title-row"><div><p className="eyebrow">Crystal Guild · Hero Contracts</p><h2>{state.service || "Hero Merc Service"}</h2></div><ContextHelp topic="merc_service" /></div>
        <p className="merc-lead">Recruit new Heroes permanently, then hire up to three Heroes at once—one Hunt, one Venture, and one Raid contract. Elite Mercs demand premium contracts, but bring the strongest damage, recovery, and gathering support in the roster.</p>
      </div>
      <div className="merc-wallet"><span>Hunt Seals</span><strong>{number(state.hunt_seals)}</strong><small>{number(state.gil)} Gil · Lv. {number(state.player_level)} · {number(state.hunt_clears)} Hunt clears · {number(state.dungeon_clears)} Dungeon clears</small></div>
      {message ? <div className="state-message compact-state merc-message">{message}</div> : null}
      <figure className="merc-service-hero-art"><img src={`${MERC_ART_ROOT}/scenes/service-hall.webp`} alt="Cloud operating the Crystal Guild Hero Merc Service contract desk" fetchPriority="high" /><figcaption>Cloud manages recruitment plus three independent deployment slots: Hunt, Venture, and Raid.</figcaption></figure>
    </section>

    <nav className="merc-section-tabs span-12" aria-label="Merc Service sections">
      {Object.entries(VIEW_LABELS).map(([key, label]) => <button type="button" key={key} className={view === key ? "active" : ""} onClick={() => setView(key)}><span>{label}</span>{key === "recruitment" ? <small>{expansionRoster.filter((hero) => !hero?.recruitment?.recruited).length} locked</small> : key === "registry" ? <small>{number(registry.recruited)} / {number(registry.total)}</small> : <small>{3 - contracts.length} slots open</small>}</button>)}
    </nav>
    {view === "hire" ? <nav className="merc-mobile-nav span-12" aria-label="Merc Service page sections"><a href="#merc-current">Current</a><a href="#merc-roster">Roster</a><a href="#merc-info">How It Works</a></nav> : null}

    {view === "hire" ? <>
      <section className="panel span-12 merc-info-panel" id="merc-info">
        <div className="panel-title-row"><div><p className="eyebrow">Contract Briefing</p><h3>How Merc Contracts Work</h3></div><span className="small-badge">Hunt Seals</span></div>
        <div className="merc-info-layout">
          <figure className="merc-contract-art"><img src={`${MERC_ART_ROOT}/scenes/contract.webp`} alt="Crystal Guild Hero Merc contract parchment paid with Hunt Seals" loading="lazy" /></figure>
          <div className="merc-info-grid">
            <div><strong>1. Recruit</strong><span>Founding Heroes keep their original progression unlocks. Expansion Heroes must first be recruited through a character quest or one-time permanent Gil contract.</span></div>
            <div><strong>2. Pick a Job Type</strong><span>Choose Hunt, Venture, or Raid. A filled slot remains unavailable until that assignment begins or its reservation is cancelled.</span></div>
            <div><strong>3. Spend Hunt Seals</strong><span>Recruitment is permanent, but each deployment still uses Hunt Seals. Elite contracts cost substantially more and are intended for high-value assignments.</span></div>
            <div><strong>4. Up to Three Active</strong><span>You may keep one contract of each assignment type active at once. Deployed Heroes remain unavailable until their mission resolves.</span></div>
          </div>
          <figure className="merc-role-art"><img src={`${MERC_ART_ROOT}/scenes/roles.webp`} alt="Merc Service role emblems for Striker, Support, Scavenger, and Specialist" loading="lazy" /></figure>
        </div>
      </section>

      <section className="panel span-12 merc-current-panel" id="merc-current">
        <div className="panel-title-row"><div><p className="eyebrow">Current Contracts</p><h3>{contracts.length ? `${contracts.length} of 3 slots reserved` : "No Heroes hired"}</h3></div><span className={`small-badge ${allSlotsOccupied ? "active" : "ready"}`}>{allSlotsOccupied ? "FULL" : `${3 - contracts.length} OPEN`}</span></div>
        <div className="merc-contract-slots merc-deployment-board">
          {MISSION_ORDER.map((mission) => {
            const contract = mercContractForMission(contracts, mission);
            const contractHero = contract ? heroes.find((hero) => hero.id === contract.hero_id) : null;
            const image = contract && contractHero ? mercHeroCardArt(contractHero, contracts, mission) : `${MERC_ART_ROOT}/scenes/${mission}.webp`;
            const deployed = Boolean(contract?.deployed) || String(contract?.state || "").toLowerCase() === "deployed";
            return <article className={`merc-contract-slot ${contract ? "occupied" : "open"} ${deployed ? "deployed" : ""} ${selectedMission === mission ? "selected" : ""}`} key={mission}>
              <button type="button" className="merc-slot-visual" onClick={() => browseMission(mission)} aria-label={`View ${MISSION_LABELS[mission]} Merc roster`}>
                <img src={image} alt={contract ? `${contract.hero_name} ${deployed ? "deployed" : "contracted"} for ${MISSION_LABELS[mission]}` : `${MISSION_LABELS[mission]} contract slot open`} loading="lazy" />
                <span className={`merc-slot-state ${contract ? "occupied" : "open"} ${deployed ? "deployed" : ""}`}>{contract ? (deployed ? "DEPLOYED" : "ASSIGNED") : "OPEN"}</span>
              </button>
              <div className="merc-slot-copy"><span className="small-badge">{MISSION_LABELS[mission]}</span><strong>{contract ? contract.hero_name : "Open Slot"}</strong>{contract ? <><span>{contract.signature} · {contract.role}</span><small>{deployed ? `${MISSION_LABELS[mission]} in progress · Hero remains unavailable until resolution.` : `${number(contract.fee_seals)} Hunt Seals · reserved for your next ${MISSION_LABELS[mission]}.`}</small></> : <small>Hire one eligible Hero for your next {MISSION_LABELS[mission]}.</small>}</div>
              <div className="merc-slot-actions"><button type="button" className="equipment-action-button secondary" disabled={Boolean(busy)} onClick={() => browseMission(mission)}>{contract ? `View ${MISSION_LABELS[mission]} Roster` : `Choose ${MISSION_LABELS[mission]} Hero`}</button>{contract && !deployed ? <button type="button" className="equipment-action-button secondary danger" disabled={Boolean(busy)} onClick={() => cancel(mission)}>{busy === `cancel:${mission}` ? "Cancelling…" : "Cancel Contract"}</button> : null}</div>
            </article>;
          })}
        </div>
      </section>

      <section className="panel span-12 merc-action-panel" aria-labelledby="merc-action-title">
        <div className="panel-title-row"><div><p className="eyebrow">Mercs in Action</p><h3 id="merc-action-title">Three Slots. Three Assignment Types.</h3></div><span className="small-badge">Hunt · Venture · Raid</span></div>
        <div className="merc-action-grid"><figure><img src={`${MERC_ART_ROOT}/scenes/hunt.webp`} alt="Hero Mercs assisting the Crystal Guild on a Hunt" loading="lazy" /><figcaption><strong>Hunts</strong><span>Earn Hunt Seals and deploy the Hero reserved for your Hunt slot.</span></figcaption></figure><figure><img src={`${MERC_ART_ROOT}/scenes/venture.webp`} alt="Hero Mercs exploring crystalline ruins during a Venture" loading="lazy" /><figcaption><strong>Ventures</strong><span>Use the independent Venture slot for Solo or Rally Venture combat.</span></figcaption></figure><figure><img src={`${MERC_ART_ROOT}/scenes/raid.webp`} alt="Hero Mercs joining a Crystal Guild Raid battle" loading="lazy" /><figcaption><strong>Raids</strong><span>Keep a separate Hero ready for your next high-stakes Raid.</span></figcaption></figure></div>
      </section>

      <section className="panel span-12 merc-roster-panel" id="merc-roster">
        <div className="panel-title-row"><div><p className="eyebrow">Merc Roster</p><h3>Hire for {MISSION_LABELS[selectedMission]}</h3></div><span className="small-badge ready">{hiredRoster.length} Recruited</span></div>
        <div className="merc-job-picker" role="group" aria-label="Merc assignment type">{MISSION_ORDER.map((mission) => { const occupied = Boolean(mercContractForMission(contracts, mission)); return <button type="button" key={mission} className={selectedMission === mission ? "active" : ""} onClick={() => setSelectedMission(mission)}><span>{MISSION_LABELS[mission]}</span><small>{occupied ? "Reserved" : "Open"}</small></button>; })}</div>
        <div className="merc-roster-grid">
          {hiredRoster.map((hero) => {
            const affordable = Number(state.hunt_seals || 0) >= Number(hero.fee_seals || 0);
            const heroContract = mercContractForHero(contracts, hero.id);
            const uiState = mercHeroUiState(hero, contracts, selectedMission);
            const isDeployed = uiState === "deployed";
            const isContracted = uiState === "contracted" || isDeployed;
            const canHire = uiState === "available" && affordable && !busy;
            const statusLabel = mercHeroStatusLabel(hero, contracts, selectedMission);
            const statusClass = isContracted ? "active" : uiState === "available" ? "ready" : "locked";
            const availabilityReason = mercHeroAvailabilityReason(hero, contracts, selectedMission);
            const elite = String(hero?.tier || "").toLowerCase() === "elite";
            return <article className={`merc-card ${uiState === "available" ? "available" : "locked"} ${uiState} ${elite ? "elite" : ""}`} key={hero.id}>
              <div className="merc-card-art-frame"><img src={mercHeroCardArt(hero, contracts, selectedMission)} alt={`${hero.name} Merc contract card — ${uiState}`} loading="lazy" /></div>
              <div className="merc-card-meta"><span>{hero.origin}{elite ? " · Elite Contract" : ""}</span><span className={`small-badge ${statusClass}`}>{statusLabel}</span></div>
              <p className="merc-card-effect">{hero.effect_summary}</p>
              <div className={`merc-availability-line ${uiState}`}><strong>{isDeployed ? "Deployed" : isContracted ? "On Contract" : uiState === "available" ? "Available" : hero.available ? "Unavailable" : "Locked"}</strong><span>{availabilityReason}</span></div>
              {isContracted ? <div className="merc-contract-reason"><strong>{isDeployed ? "Assignment In Progress" : "Currently Hired"}</strong><span>{isDeployed ? `${MISSION_LABELS[heroContract?.mission_type] || heroContract?.mission_type || "Assignment"} is underway. This Hero and slot remain unavailable until it resolves.` : `Reserved for your next ${MISSION_LABELS[heroContract?.mission_type] || heroContract?.mission_type || "assignment"}. This Hero cannot take another job until that contract resolves.`}</span></div> : uiState === "available" ? <button type="button" className="equipment-action-button" disabled={!canHire} onClick={() => hire(hero)}>{busy === `hire:${hero.id}` ? "Hiring…" : affordable ? `Hire for ${MISSION_LABELS[selectedMission]} · ${number(hero.fee_seals)} Hunt Seals` : `Need ${number(hero.fee_seals)} Hunt Seals`}</button> : null}
            </article>;
          })}
        </div>
        <figure className="merc-future-art"><img src={`${MERC_ART_ROOT}/scenes/coming-soon.webp`} alt="Cloud beside silhouettes teasing future Hero Merc additions" loading="lazy" /><figcaption>More Hero contracts can join the roster in future Crystal Guild updates.</figcaption></figure>
      </section>
    </> : null}

    {view === "recruitment" ? <section className="panel span-12 merc-recruitment-panel" id="merc-recruitment">
      <div className="panel-title-row"><div><p className="eyebrow">Expansion Recruitment</p><h3>Earn Their Contract</h3></div><span className="small-badge">{eliteRoster.length} Elite Contracts</span></div>
      <p className="merc-lead">Expansion Heroes do not simply appear for hire. Complete their recruitment objectives or fund a one-time permanent contract. Elite Mercs sit at the top of the roster: their permanent contracts and Hunt Seal deployment fees are deliberately expensive, but their assists are substantially stronger.</p>
      <div className="merc-recruitment-grid">
        {expansionRoster.map((hero) => {
          const recruitment = hero.recruitment || {};
          const recruited = Boolean(recruitment.recruited);
          const ready = Boolean(recruitment.ready) && !recruited;
          const status = mercRecruitmentStatusLabel(hero);
          const buttonLabel = recruited ? "Recruited" : recruitment.kind === "contract" ? (recruitment.affordable ? `Sign Contract · ${number(recruitment.gil_cost)} Gil` : `Need ${number(recruitment.gil_cost)} Gil`) : ready ? `Complete ${recruitment.name}` : "Requirements Not Met";
          const elite = String(hero?.tier || "").toLowerCase() === "elite";
          return <article className={`merc-recruit-card ${recruited ? "recruited" : ready ? "ready" : "locked"} ${elite ? "elite" : ""}`} key={hero.id}>
            <div className="merc-card-art-frame"><img src={recruited ? mercRegistryCardArt(hero) : mercHeroCardArt(hero, contracts, selectedMission)} alt={`${hero.name} ${recruited ? "recruited" : "locked"} recruitment card`} loading="lazy" /></div>
            <div className="merc-card-meta"><span>{hero.origin}{elite ? " · Elite Contract" : ""}</span><span className={`small-badge ${recruited ? "ready" : ready ? "active" : "locked"}`}>{status}</span></div>
            <div className="merc-recruit-copy"><h4>{hero.name}</h4><strong>{recruitment.name}</strong><p>{recruitment.hint}</p></div>
            <div className="merc-objectives">{(recruitment.objectives || []).map((objective) => <div className={objective.met ? "met" : "missing"} key={objective.id}><span>{objective.label}</span><strong>{number(objective.current)} / {number(objective.required)}</strong></div>)}{Number(recruitment.gil_cost || 0) > 0 ? <div className={recruitment.affordable ? "met" : "missing"}><span>Permanent Contract</span><strong>{number(recruitment.gil_cost)} Gil</strong></div> : null}</div>
            <p className="merc-card-effect">{hero.effect_summary}</p>
            <button type="button" className="equipment-action-button" disabled={Boolean(busy) || recruited || !ready} onClick={() => recruit(hero)}>{busy === `recruit:${hero.id}` ? "Recruiting…" : buttonLabel}</button>
          </article>;
        })}
      </div>
    </section> : null}

    {view === "registry" ? <section className="panel span-12 merc-registry-panel" id="merc-registry">
      <div className="panel-title-row"><div><p className="eyebrow">Merc Registry</p><h3>{number(registry.recruited)} of {number(registry.total)} Heroes Recruited</h3></div><span className="small-badge ready">Permanent Roster</span></div>
      <div className="merc-registry-progress" aria-label={`${number(registry.recruited)} of ${number(registry.total)} Merc Heroes recruited`}><span style={{ width: `${Math.max(0, Math.min(100, Number(registry.total || 0) ? Number(registry.recruited || 0) / Number(registry.total) * 100 : 0))}%` }} /></div>
      <div className="merc-registry-grid">{heroes.map((hero) => { const recruitment = hero.recruitment || {}; const recruited = Boolean(recruitment.recruited); const elite = String(hero?.tier || "").toLowerCase() === "elite"; return <article className={`merc-registry-card ${recruited ? "recruited" : "locked"} ${elite ? "elite" : ""}`} key={hero.id}><div className="merc-card-art-frame"><img src={mercRegistryCardArt(hero)} alt={`${hero.name} Merc Registry card — ${recruited ? "recruited" : "not recruited"}`} loading="lazy" /></div><div className="merc-card-meta"><span>{hero.origin}{elite ? " · Elite Contract" : ""}</span><span className={`small-badge ${recruited ? "ready" : "locked"}`}>{recruited ? "RECRUITED" : "LOCKED"}</span></div><h4>{hero.name}</h4><p><strong>{hero.role}</strong> · {hero.specialty}</p><small>{recruited ? hero.effect_summary : recruitment.hint || hero.locked_reason}</small>{!recruited ? <button type="button" className="equipment-action-button secondary" onClick={() => setView("recruitment")}>View Recruitment</button> : null}</article>; })}</div>
    </section> : null}
  </div>;
}
