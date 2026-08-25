import { useCallback, useEffect, useMemo, useState } from "react";
import ProgressBar from "../components/ProgressBar.jsx";
import {
  submitCharacterState,
  submitChangeJob,
  submitClearMastery,
  submitSetMastery,
  submitSetStance,
  waitForPortalAction,
} from "../api/auth.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { humanizeLabel } from "../utils/displayLabels.js";
import { jobSigil, jobTone } from "../utils/retroAssets.js";
import { pct } from "../utils/formatters.js";
import { loadGuideData, mergeJobsWithCatalog } from "../utils/itemCatalog.js";

const STANCES = [
  { id: "balanced", name: "Balanced", description: "Neutral offense and defense. A dependable default for any Job." },
  { id: "aggressive", name: "Aggressive", description: "Pushes physical pressure higher while giving up some protection." },
  { id: "defensive", name: "Defensive", description: "Trades offensive pressure for better survivability." },
  { id: "magical", name: "Magical", description: "Favors magical damage and spell-focused Jobs." },
  { id: "cautious", name: "Cautious", description: "A safer posture with reduced offensive commitment." },
];

function actionKey(kind, target) {
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

function masterySlotMap(slots = []) {
  const result = { 1: "", 2: "" };
  for (const slot of slots) result[Number(slot.slot)] = slot.job_id || "";
  return result;
}

export default function Jobs({ data, overview, onDetail, onRefresh }) {
  const { auth } = usePortalAuth();
  const [view, setView] = useState("jobs");
  const [liveState, setLiveState] = useState(null);
  const [busyKey, setBusyKey] = useState("");
  const [message, setMessage] = useState("");
  const [masteryChoice, setMasteryChoice] = useState({ 1: "", 2: "" });
  const [guideData, setGuideData] = useState(null);

  const isOwnProfile = Boolean(
    auth.authenticated
    && auth.player?.username
    && String(auth.player.username).toLowerCase() === String(data.player?.username || "").toLowerCase()
  );
  const capabilities = useMemo(
    () => new Set(Array.isArray(auth.action_capabilities) ? auth.action_capabilities : []),
    [auth.action_capabilities],
  );
  const managementAvailable = Boolean(
    isOwnProfile
    && auth.actions_enabled
    && ["CHARACTER_STATE", "CHANGE_JOB", "SET_STANCE", "SET_MASTERY", "CLEAR_MASTERY"].every((kind) => capabilities.has(kind))
  );
  const csrfToken = auth.csrf_token || "";
  const controlsReady = Boolean(managementAvailable && liveState);

  const rawJobs = liveState?.jobs || data.jobs || [];
  const jobs = useMemo(() => mergeJobsWithCatalog(rawJobs, guideData), [rawJobs, guideData]);
  const owned = jobs.filter((job) => job.owned).length;
  const currentJob = jobs.find((job) => job.current) || null;
  const currentStance = liveState?.stance || overview?.identity?.stance || "balanced";
  const locks = liveState?.locks || {};
  const masteredJobs = jobs.filter((job) => job.mastered);
  const detailJob = (job) => {
    const snapshot = (data.jobs || []).find((entry) => entry.id === job.id) || {};
    return { ...snapshot, ...job, abilities: snapshot.abilities || job.abilities || [] };
  };

  useEffect(() => {
    let cancelled = false;
    loadGuideData().then((payload) => {
      if (!cancelled) setGuideData(payload);
    }).catch(() => {
      // The Jobs tab remains usable if the static reference catalog is temporarily unavailable.
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (liveState?.mastery_slots) setMasteryChoice(masterySlotMap(liveState.mastery_slots));
  }, [liveState?.mastery_slots]);

  const loadState = useCallback(async ({ quiet = false } = {}) => {
    if (!managementAvailable || busyKey) return null;
    if (!quiet) {
      setBusyKey("state");
      setMessage("Refreshing character options…");
    }
    try {
      const response = await submitCharacterState(csrfToken, actionKey("character-state", data.player?.username || "self"));
      const finished = await finishedAction(response);
      if (!finished) {
        if (!quiet) setMessage("Character options are still updating. Try again in a moment.");
        return null;
      }
      if (finished.status !== "completed" || finished.result?.ok === false) {
        setMessage(finished.result?.message || "Character options could not be refreshed.");
        return null;
      }
      const next = finished.result?.data || null;
      if (next?.jobs) setLiveState(next);
      if (!quiet) setMessage("Character options refreshed.");
      return next;
    } catch (error) {
      setMessage(error.message);
      return null;
    } finally {
      if (!quiet) setBusyKey("");
    }
  }, [managementAvailable, busyKey, csrfToken, data.player?.username]);

  useEffect(() => {
    if (!managementAvailable || liveState) return;
    let cancelled = false;
    const load = async () => {
      const next = await loadState({ quiet: true });
      if (cancelled || !next) return;
      setMessage("");
    };
    load();
    return () => { cancelled = true; };
  }, [managementAvailable, liveState, loadState]);

  const runMutation = async (key, submit, fallback) => {
    if (!managementAvailable || busyKey) return;
    setBusyKey(key);
    setMessage("Updating character…");
    try {
      const response = await submit();
      const finished = await finishedAction(response);
      if (!finished) {
        setMessage("This change is still processing. Please wait before trying it again.");
        return;
      }
      setMessage(finished.result?.message || fallback);
      const next = finished.result?.data?.character_state;
      if (next?.jobs) setLiveState(next);
      if (finished.status === "completed" && finished.result?.ok !== false) {
        onRefresh?.();
        window.setTimeout(() => onRefresh?.(), 3200);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusyKey("");
    }
  };

  const changeJob = (job) => runMutation(
    `job:${job.id}`,
    () => submitChangeJob(job.id, csrfToken, actionKey("job", job.id)),
    `Changed Job to ${job.name}.`,
  );

  const changeStance = (stance) => runMutation(
    `stance:${stance}`,
    () => submitSetStance(stance, csrfToken, actionKey("stance", stance)),
    `Stance changed to ${stance}.`,
  );

  const applyMastery = (slot) => {
    const jobId = masteryChoice[slot];
    if (!jobId) return;
    runMutation(
      `mastery:${slot}`,
      () => submitSetMastery(jobId, slot, csrfToken, actionKey("mastery", `${slot}:${jobId}`)),
      `Mastery Slot ${slot} updated.`,
    );
  };

  const clearMastery = (slot) => runMutation(
    `mastery-clear:${slot}`,
    () => submitClearMastery(slot, csrfToken, actionKey("mastery-clear", slot)),
    `Mastery Slot ${slot} cleared.`,
  );

  const renderPublicJobs = () => (
    <div className="job-grid">
      {jobs.map((job) => (
        <article className={`job-card public-job-card ${job.current ? "current" : ""}`} key={job.id || job.name}>
          <div className="card-status-row">
            <div className="slot-label">{humanizeLabel(job.tier)} Job</div>
            <div className="card-status-badges" aria-label="Job status">
              {job.current ? <span className="small-badge success">Current</span> : null}
              {job.mastered ? <span className="small-badge mastered">Mastered</span> : null}
            </div>
          </div>
          <div className="job-card-retro-title">
            <span className={`retro-job-portrait tone-${jobTone(job)}`} aria-hidden="true"><span className="retro-job-glyph">{jobSigil(job)}</span></span>
            <div className="job-name">{job.name}</div>
          </div>
          <div className="card-meta">{job.owned ? `JLv.${job.level}` : "Not learned"} · {job.signature}</div>
          {job.owned ? <div className="job-progress"><ProgressBar value={pct(job.jp, job.jp_next)} /></div> : null}
          <div className="management-job-actions public-job-actions">
            <button type="button" className="equipment-action-button secondary" onClick={() => onDetail?.({ type: "job", job: detailJob(job) })}>{`View ${job.name} Details`}</button>
          </div>
        </article>
      ))}
    </div>
  );

  return (
    <section className="panel character-management-panel">
      <div className="panel-title-row">
        <div><p className="eyebrow">Character setup</p><h2>Jobs & Battle Style</h2></div>
        <span className="small-badge">{owned} / {jobs.length} learned</span>
      </div>

      {isOwnProfile ? (
        <div className={`equipment-action-status ${managementAvailable ? "ready" : "offline"}`}>
          <strong>{!managementAvailable ? "Character controls unavailable" : (liveState ? "Character controls ready" : "Loading character controls…")}</strong>
          <span>{!managementAvailable
            ? "Your character setup is still available to view. Changes return when Crystal Guild reconnects."
            : (liveState ? "Switch Jobs, choose your stance, and manage cross-Job Masteries from one place." : "Checking your current Jobs, stance, and Masteries…")}</span>
          {message ? <small aria-live="polite">{message}</small> : null}
        </div>
      ) : null}

      {isOwnProfile ? (
        <div className="character-summary-strip">
          <div><span>Current Job</span><strong>{liveState?.current_job_name || currentJob?.name || overview?.job?.name || "Adventurer"}</strong></div>
          <div><span>Stance</span><strong>{humanizeLabel(currentStance)}</strong></div>
          <div><span>Masteries</span><strong>{(liveState?.mastery_slots || data.mastery_slots || []).filter((slot) => slot.job_id).length} / 2</strong></div>
          <button type="button" className="equipment-action-button secondary" disabled={!managementAvailable || Boolean(busyKey)} onClick={() => loadState()}>
            {busyKey === "state" ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      ) : null}

      {isOwnProfile ? (
        <nav className="character-management-tabs" aria-label="Character management sections">
          {[['jobs', 'Jobs'], ['stance', 'Stance'], ['masteries', 'Masteries']].map(([id, label]) => (
            <button key={id} type="button" className={view === id ? "active" : ""} aria-pressed={view === id} onClick={() => setView(id)}>{label}</button>
          ))}
        </nav>
      ) : null}

      {!isOwnProfile ? renderPublicJobs() : null}

      {isOwnProfile && view === "jobs" ? (
        <>
          <div className="character-help-line">Changing Jobs can temporarily deactivate incompatible gear until you switch back or equip gear suited to the new Job.</div>
          {locks.job_change && locks.job_change_reason ? <div className="character-lock-note">{locks.job_change_reason}</div> : null}
          <div className="job-grid management-job-grid">
            {jobs.map((job) => {
              const unlocked = liveState ? job.unlocked !== false : Boolean(job.owned || job.tier === "starter");
              const changing = busyKey === `job:${job.id}`;
              return (
                <article className={`job-card management-job-card ${job.current ? "current" : ""} ${!unlocked ? "locked" : ""}`} key={job.id || job.name}>
                  <div className="card-status-row management-job-head">
                    <div className="slot-label">{humanizeLabel(job.tier)} Job</div>
                    <div className="card-status-badges" aria-label="Job status">
                      {job.current ? <span className="small-badge success">Current</span> : null}
                      {!unlocked ? <span className="small-badge locked">Locked</span> : null}
                      {job.mastered ? <span className="small-badge mastered">Mastered</span> : null}
                    </div>
                  </div>
                  <div className="job-card-retro-title">
                    <span className={`retro-job-portrait tone-${jobTone(job)}`} aria-hidden="true"><span className="retro-job-glyph">{jobSigil(job)}</span></span>
                    <div className="job-name">{job.name}</div>
                  </div>
                  <div className="card-meta">{job.owned ? `JLv.${job.level} · ${job.signature}` : unlocked ? `Ready to learn · ${job.signature}` : `Signature: ${job.signature}`}</div>
                  {job.owned ? <div className="job-progress"><ProgressBar value={pct(job.jp, job.jp_next)} /></div> : null}
                  {!unlocked && Array.isArray(job.requirements) && job.requirements.length ? (
                    <details className="job-requirements">
                      <summary>How to unlock</summary>
                      <ul>{job.requirements.map((req, index) => <li className={req.met ? "met" : "missing"} key={`${job.id}-req-${index}`}>{req.met ? "✓" : "○"} {req.text}</li>)}</ul>
                    </details>
                  ) : null}
                  <div className="management-job-actions">
                    <button type="button" className="equipment-action-button secondary" onClick={() => onDetail?.({ type: "job", job: detailJob(job) })}>{`View ${job.name} Details`}</button>
                    <button
                      type="button"
                      className="equipment-action-button"
                      disabled={!controlsReady || Boolean(busyKey) || job.current || !unlocked || Boolean(locks.job_change)}
                      onClick={() => changeJob(job)}
                    >
                      {job.current ? "Current Job" : (changing ? "Changing…" : `Switch to ${job.name}`)}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      ) : null}

      {isOwnProfile && view === "stance" ? (
        <>
          {locks.stance_change ? <div className="character-lock-note">Finish the active encounter or raid before changing stance.</div> : null}
          <div className="stance-grid">
            {STANCES.map((stance) => {
              const active = stance.id === currentStance;
              return (
                <article className={`stance-card ${active ? "current" : ""}`} key={stance.id}>
                  <div className="slot-label">{active ? "Current stance" : "Battle stance"}</div>
                  <h3>{stance.name}</h3>
                  <p>{stance.description}</p>
                  <button
                    type="button"
                    className="equipment-action-button"
                    disabled={!controlsReady || Boolean(busyKey) || active || Boolean(locks.stance_change)}
                    onClick={() => changeStance(stance.id)}
                  >
                    {active ? "Selected" : (busyKey === `stance:${stance.id}` ? "Changing…" : `Select ${stance.name}`)}
                  </button>
                </article>
              );
            })}
          </div>
        </>
      ) : null}

      {isOwnProfile && view === "masteries" ? (
        <>
          <div className="character-help-line">Master a Job at JLv.50 to use its Mastery while playing another Job. You have two Mastery slots.</div>
          {locks.mastery_change ? <div className="character-lock-note">Finish the active encounter or raid before changing Masteries.</div> : null}
          {!masteredJobs.length ? <div className="state-message compact-state">No Jobs mastered yet. Reach JLv.50 on a Job to unlock its Mastery.</div> : null}
          <div className="mastery-management-grid">
            {[1, 2].map((slot) => {
              const selected = masteryChoice[slot] || "";
              const activeSlot = (liveState?.mastery_slots || data.mastery_slots || []).find((entry) => Number(entry.slot) === slot);
              return (
                <article className="mastery-management-card" key={slot}>
                  <div className="slot-label">Mastery Slot {slot}</div>
                  <h3>{activeSlot?.name || "Empty"}</h3>
                  <p>{activeSlot?.description || "Choose a Mastery from one of your mastered Jobs."}</p>
                  <label className="mastery-select-label">
                    <span>Mastery</span>
                    <select value={selected} disabled={!masteredJobs.length || Boolean(busyKey)} onChange={(event) => setMasteryChoice((current) => ({ ...current, [slot]: event.target.value }))}>
                      <option value="">Choose a mastered Job</option>
                      {masteredJobs.map((job) => <option value={job.id} key={`${slot}-${job.id}`}>{job.name} — {job.mastery?.name || "Mastery"}</option>)}
                    </select>
                  </label>
                  {selected ? (() => {
                    const source = masteredJobs.find((job) => job.id === selected);
                    return source ? <div className="mastery-choice-preview"><strong>{source.mastery?.name}</strong><span>{source.mastery?.description}</span></div> : null;
                  })() : null}
                  <div className="mastery-management-actions">
                    <button type="button" className="equipment-action-button" disabled={!controlsReady || !selected || Boolean(busyKey) || Boolean(locks.mastery_change)} onClick={() => applyMastery(slot)}>
                      {busyKey === `mastery:${slot}` ? "Applying…" : "Apply Mastery"}
                    </button>
                    <button type="button" className="equipment-action-button secondary" disabled={!controlsReady || !activeSlot?.job_id || Boolean(busyKey) || Boolean(locks.mastery_change)} onClick={() => clearMastery(slot)}>
                      {busyKey === `mastery-clear:${slot}` ? "Clearing…" : "Clear Mastery"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      ) : null}
    </section>
  );
}
