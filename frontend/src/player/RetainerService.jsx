import { useCallback, useEffect, useMemo, useState } from "react";
import {
  submitRetainerCollect,
  submitRetainerDispatch,
  submitRetainerState,
  waitForPortalAction,
} from "../api/auth.js";
import ProgressBar from "../components/ProgressBar.jsx";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { duration, number, pct } from "../utils/formatters.js";

const RETAINER_ART_ROOT = "/retainer/a2h1";

const RETAINER_ASSIGNMENT_ART = {
  field_gathering: `${RETAINER_ART_ROOT}/assignments/field-gathering.webp`,
  monster_salvage: `${RETAINER_ART_ROOT}/assignments/monster-salvage.webp`,
  mineral_survey: `${RETAINER_ART_ROOT}/assignments/mineral-survey.webp`,
  regional_procurement: `${RETAINER_ART_ROOT}/assignments/regional-procurement.webp`,
  specialist_acquisition: `${RETAINER_ART_ROOT}/assignments/specialist-acquisition.webp`,
};

const RETAINER_ASSIGNMENT_ICON = {
  field_gathering: `${RETAINER_ART_ROOT}/materials/herb.webp`,
  monster_salvage: `${RETAINER_ART_ROOT}/materials/mushroom.webp`,
  mineral_survey: `${RETAINER_ART_ROOT}/materials/blue-crystal.webp`,
  regional_procurement: `${RETAINER_ART_ROOT}/materials/shell.webp`,
  specialist_acquisition: `${RETAINER_ART_ROOT}/materials/purple-crystal.webp`,
};

function retainerPortrait(rank) {
  const value = Number(rank || 1);
  if (value >= 5) return `${RETAINER_ART_ROOT}/retainers/expert-moogle.webp`;
  if (value >= 3) return `${RETAINER_ART_ROOT}/retainers/pack-moogle.webp`;
  return `${RETAINER_ART_ROOT}/retainers/scout-moogle.webp`;
}

function retainerCrest(rank) {
  const value = Number(rank || 1);
  if (value >= 5) return `${RETAINER_ART_ROOT}/badges/rank-iii.webp`;
  if (value >= 3) return `${RETAINER_ART_ROOT}/badges/rank-ii.webp`;
  return `${RETAINER_ART_ROOT}/badges/rank-i.webp`;
}

function actionKey(kind, target = "retainer") {
  const suffix = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}:${Math.random().toString(36).slice(2)}`;
  return `${kind}:${target}:${suffix}`;
}

async function finishedAction(response) {
  const action = response?.action;
  if (!action?.id) throw new Error("Crystal Guild did not return a Retainer request ID.");
  if (action.status === "completed" || action.status === "failed") return action;
  return waitForPortalAction(action.id, { attempts: 32, delayMs: 650 });
}

export default function RetainerService({ data, overview, onRefresh }) {
  const { auth } = usePortalAuth();
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [clock, setClock] = useState(() => Date.now());
  const [priorityByAssignment, setPriorityByAssignment] = useState({});

  const username = String(overview?.identity?.username || data?.identity?.username || "").toLowerCase();
  const isOwnProfile = Boolean(auth.authenticated && auth.player?.username && String(auth.player.username).toLowerCase() === username);
  const capabilities = useMemo(() => new Set(Array.isArray(auth.action_capabilities) ? auth.action_capabilities : []), [auth.action_capabilities]);
  const required = ["RETAINER_STATE", "RETAINER_DISPATCH", "RETAINER_COLLECT"];
  const actionsAvailable = Boolean(isOwnProfile && auth.actions_enabled && required.every((kind) => capabilities.has(kind)));
  const csrfToken = auth.csrf_token || "";

  const applyFinished = useCallback((finished, fallback) => {
    if (!finished) {
      setMessage("The Retainer request is still being processed. Refresh before trying again.");
      return null;
    }
    setMessage(finished.result?.message || fallback);
    const next = finished.result?.data?.retainer_state || null;
    if (next) {
      setState(next);
      setClock(Date.now());
    }
    return next;
  }, []);

  const loadState = useCallback(async ({ quiet = false } = {}) => {
    if (!actionsAvailable || busy) return null;
    if (!quiet) {
      setBusy("state");
      setMessage("Checking the Retainer desk…");
    }
    try {
      const response = await submitRetainerState(csrfToken, actionKey("retainer-state"));
      const finished = await finishedAction(response);
      return applyFinished(finished, "Retainer Service refreshed.");
    } catch (error) {
      setMessage(String(error?.message || error));
      return null;
    } finally {
      if (!quiet) setBusy("");
    }
  }, [actionsAvailable, busy, csrfToken, applyFinished]);

  useEffect(() => {
    if (!actionsAvailable || state) return;
    void loadState({ quiet: true });
  }, [actionsAvailable, state, loadState]);

  useEffect(() => {
    if (!state?.assignment || state.assignment.state !== "active") return undefined;
    const tick = () => setClock(Date.now());
    const timer = window.setInterval(tick, 1000);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", tick);
    };
  }, [state?.assignment?.assignment_id, state?.assignment?.state]);

  const runDispatch = async (assignment) => {
    const priority = String(priorityByAssignment[assignment?.id] || "");
    const canDispatch = priority ? assignment?.can_dispatch_focused : assignment?.can_dispatch;
    if (!actionsAvailable || busy || !canDispatch) return;
    setBusy(`dispatch:${assignment.id}`);
    setMessage(`Dispatching your Retainer on ${assignment.name}${priority ? " with a priority request" : ""}…`);
    try {
      const response = await submitRetainerDispatch(assignment.id, priority, csrfToken, actionKey("retainer-dispatch", assignment.id));
      const finished = await finishedAction(response);
      applyFinished(finished, "Retainer dispatched.");
      onRefresh?.();
    } catch (error) {
      setMessage(String(error?.message || error));
    } finally {
      setBusy("");
    }
  };

  const collect = async () => {
    if (!actionsAvailable || busy) return;
    setBusy("collect");
    setMessage("Checking the returned haul…");
    try {
      const response = await submitRetainerCollect(csrfToken, actionKey("retainer-collect"));
      const finished = await finishedAction(response);
      applyFinished(finished, "Retainer materials collected.");
      onRefresh?.();
    } catch (error) {
      setMessage(String(error?.message || error));
    } finally {
      setBusy("");
    }
  };

  if (!isOwnProfile) {
    return <section className="panel span-12"><div className="state-message">Retainer Service is available only from your own Adventurer Portal.</div></section>;
  }
  if (!actionsAvailable) {
    return <section className="panel span-12"><div className="state-message">Retainer Service is unavailable while the local Crystal Guild Bot is disconnected or running an older Portal protocol.</div></section>;
  }
  if (!state) {
    return <section className="panel span-12"><div className="state-message">{message || "Opening the Retainer Service…"}</div></section>;
  }

  const retainer = state.retainer || {};
  const assignment = state.assignment || null;
  const nowSeconds = Math.floor(clock / 1000);
  const remaining = assignment?.state === "active" ? Math.max(0, Number(assignment.ready_at || 0) - nowSeconds) : 0;
  const returned = Boolean(assignment && (assignment.state === "ready" || (assignment.state === "active" && remaining <= 0)));
  const rankProgress = Number(retainer.xp_to_next || 0) > 0 ? pct(retainer.xp_into_rank, retainer.xp_to_next) : 100;

  return (
    <div className="profile-grid retainer-service-grid">
      <section className="panel span-12 retainer-hero-panel">
        <div className="retainer-hero-copy">
          <div className="panel-title-row">
            <div>
              <p className="eyebrow">Moogle Retainer · Procurement Service</p>
              <h2>Retainer Service</h2>
            </div>
            <span className="small-badge">{number(state.gil)} Gil</span>
          </div>
          <p className="retainer-lead">Dispatch one personal Retainer on timed procurement work for crafting materials. Retainers do not store equipment and never replace your inventory.</p>
          {message ? <div className="state-message compact-state">{message}</div> : null}
        </div>
        <img loading="lazy" decoding="async" className="retainer-office-art" src={`${RETAINER_ART_ROOT}/retainer-office.webp`} alt="Pixel-art Retainer Office with Moogle guild banners" />
      </section>

      <section className="panel span-4 retainer-profile-panel">
        <div className="retainer-profile-art">
          <img loading="lazy" decoding="async" className="retainer-portrait-art" src={retainerPortrait(retainer.rank)} alt="Your Moogle Retainer" />
          <img loading="lazy" decoding="async" className="retainer-rank-crest" src={retainerCrest(retainer.rank)} alt="" aria-hidden="true" />
        </div>
        <p className="eyebrow">Your Retainer</p>
        <h3>{String(retainer.name || "Guild Retainer")}</h3>
        <div className="retainer-rank-line"><strong>Rank {number(retainer.rank)} · {String(retainer.rank_name || "Novice")}</strong><span>{number(retainer.xp)} EXP</span></div>
        <ProgressBar value={rankProgress} />
        <small>{retainer.max_rank ? "Maximum Retainer Rank reached." : `${number(retainer.xp_into_rank)} / ${number(retainer.xp_to_next)} EXP toward the next rank`}</small>
        <div className="retainer-stat-grid">
          <div><strong>{number(retainer.assignments_completed)}</strong><span>Assignments</span></div>
          <div><strong>{number(retainer.materials_found)}</strong><span>Materials</span></div>
          <div><strong>{number(retainer.bonus_finds)}</strong><span>Bonus Finds</span></div>
        </div>
      </section>

      <section className="panel span-8 retainer-current-panel">
        <div className="panel-title-row"><h3>Current Assignment</h3><span className={`small-badge ${returned ? "ready" : assignment?.state || "idle"}`}>{assignment ? (returned ? "RETURNED" : String(assignment.state || "active").toUpperCase()) : "IDLE"}</span></div>
        {!assignment || assignment.state === "collected" ? (
          <div className="retainer-idle-state"><img loading="lazy" decoding="async" className="retainer-status-art" src={`${RETAINER_ART_ROOT}/status/ready.webp`} alt="Moogle Retainer ready for work" /><strong>Your Retainer is ready for work.</strong><span>Choose one procurement assignment below. Only one assignment can be active at a time.</span></div>
        ) : assignment.state === "active" && !returned ? (
          <div className="retainer-away-state">
            <img loading="lazy" decoding="async" className="retainer-status-art" src={`${RETAINER_ART_ROOT}/status/in-progress.webp`} alt="Moogle Retainer away on assignment" />
            <div><strong>{assignment.name}</strong><span>{assignment.pool_label}</span>{assignment.priority ? <small>Priority: {assignment.priority.name}</small> : null}</div>
            <div className="retainer-timer"><span>Returns in</span><strong>{duration(remaining)}</strong></div>
            <small>The haul was committed when the Retainer departed and cannot be rerolled by refreshing or reconnecting.</small>
          </div>
        ) : (
          <div className="retainer-return-state">
            <img loading="lazy" decoding="async" className="retainer-status-art" src={`${RETAINER_ART_ROOT}/status/completed.webp`} alt="Moogle Retainer returned with a completed haul" />
            <div><strong>{assignment.name} complete</strong><span>Your Retainer is waiting at the desk with the secured material haul.</span></div>
            {Array.isArray(assignment.rewards) && assignment.rewards.length ? (
              <div className="retainer-haul-grid">
                {assignment.rewards.map((item) => <div key={item.item_id}><strong>{item.name}</strong><span>x{number(item.quantity)} · {String(item.rarity || "common")}</span></div>)}
              </div>
            ) : null}
            {assignment.bonus ? <div className="retainer-bonus-find">Bonus find: <strong>{assignment.bonus.name} × {number(assignment.bonus.quantity)}</strong></div> : null}
            <button type="button" className="equipment-action-button" disabled={Boolean(busy)} onClick={collect}>{busy === "collect" ? "Collecting…" : "Collect Materials"}</button>
          </div>
        )}
        {assignment?.state === "collected" && Array.isArray(assignment.rewards) && assignment.rewards.length ? (
          <div className="retainer-last-haul"><small>Last collected haul</small><span>{assignment.rewards.map((item) => `${item.name} × ${number(item.quantity)}`).join(" · ")}</span></div>
        ) : null}
      </section>

      <section className="panel span-12 retainer-assignments-panel">
        <div className="panel-title-row"><div><p className="eyebrow">Procurement Board</p><h3>Assignments</h3></div><button type="button" className="equipment-action-button secondary compact" disabled={Boolean(busy)} onClick={() => loadState()}>{busy === "state" ? "Refreshing…" : "Refresh"}</button></div>
        <div className="retainer-assignment-grid">
          {(Array.isArray(state.assignments) ? state.assignments : []).map((option) => {
            const dispatching = busy === `dispatch:${option.id}`;
            return (
              <article className={`retainer-assignment-card ${option.unlocked ? "" : "locked"}`} key={option.id}>
                <div className="retainer-assignment-art-wrap">
                  <img loading="lazy" decoding="async" className="retainer-assignment-art" src={RETAINER_ASSIGNMENT_ART[option.id]} alt="" aria-hidden="true" />
                  <img loading="lazy" decoding="async" className="retainer-assignment-icon" src={RETAINER_ASSIGNMENT_ICON[option.id]} alt="" aria-hidden="true" />
                </div>
                <div className="retainer-assignment-head"><strong>{option.name}</strong><span className={`small-badge ${option.unlocked ? "ready" : "locked"}`}>{option.unlocked ? `${number(priorityByAssignment[option.id] ? option.focused_cost_gil : option.cost_gil)} Gil` : `Rank ${number(option.rank_required)}`}</span></div>
                <p>{option.description}</p>
                <div className="retainer-assignment-meta"><span>{duration(option.duration_seconds)}</span><span>+{number(option.retainer_xp)} EXP</span></div>
                <small>{option.pool_label}</small>
                {option.unlocked ? <label className="retainer-priority-field"><span>Priority material</span><select value={priorityByAssignment[option.id] || ""} disabled={Boolean(busy)} onChange={(event) => setPriorityByAssignment((current) => ({ ...current, [option.id]: event.target.value }))}><option value="">General mixed haul</option>{(Array.isArray(option.priorities) ? option.priorities : []).map((item) => <option value={item.item_id} key={item.item_id}>{item.name} · {item.rarity}</option>)}</select><small>{priorityByAssignment[option.id] ? `Guaranteed one normal roll · ${number(option.focused_cost_gil)} Gil` : `Standard mixed haul · ${number(option.cost_gil)} Gil`}</small></label> : null}
                <button type="button" className="equipment-action-button" disabled={Boolean(busy) || !(priorityByAssignment[option.id] ? option.can_dispatch_focused : option.can_dispatch)} onClick={() => runDispatch(option)}>{dispatching ? "Dispatching…" : option.unlocked ? `Dispatch · ${number(priorityByAssignment[option.id] ? option.focused_cost_gil : option.cost_gil)} Gil` : `Requires Rank ${number(option.rank_required)}`}</button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel span-12 retainer-history-panel">
        <div className="panel-title-row"><div><p className="eyebrow">Procurement Record</p><h3>Recent Retainer Hauls</h3></div><span className="small-badge">Last 8</span></div>
        {Array.isArray(state.history) && state.history.length ? <div className="retainer-history-list">{state.history.map((entry) => <article key={entry.assignment_id}><div><strong>{entry.name}</strong><span>{entry.priority ? `Priority: ${entry.priority.name}` : "General haul"} · {number(entry.cost_gil)} Gil · +{number(entry.retainer_xp)} EXP</span></div><small>{(entry.rewards || []).map((item) => `${item.name} × ${number(item.quantity)}`).join(" · ")}{entry.bonus ? ` · Bonus: ${entry.bonus.name} × ${number(entry.bonus.quantity)}` : ""}</small></article>)}</div> : <div className="retainer-idle-state"><strong>No collected hauls yet.</strong><span>Your eight most recent Retainer collections will appear here.</span></div>}
      </section>
    </div>
  );
}
