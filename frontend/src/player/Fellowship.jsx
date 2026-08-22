import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProgressBar from "../components/ProgressBar.jsx";
import StatCard from "../components/StatCard.jsx";
import {
  submitFellowshipGil,
  submitFellowshipItem,
  submitFellowshipState,
  waitForPortalAction,
} from "../api/auth.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { number, pct } from "../utils/formatters.js";

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

function wholeNumber(value, maximum) {
  const parsed = Math.floor(Number(value));
  if (!Number.isFinite(parsed) || parsed < 1) return 0;
  return Math.min(parsed, Math.max(0, Number(maximum || 0)));
}

export default function Fellowship({ data, onRefresh }) {
  const { auth } = usePortalAuth();
  const [liveState, setLiveState] = useState(null);
  const [busyKey, setBusyKey] = useState("");
  const [message, setMessage] = useState("");
  const [gilAmount, setGilAmount] = useState("");
  const [itemAmounts, setItemAmounts] = useState({});
  const attemptedLoad = useRef(false);

  const snapshotFellowship = data?.fellowship || {};
  const isOwnProfile = Boolean(
    auth.authenticated
    && auth.player?.username
    && String(auth.player.username).toLowerCase() === String(data.player?.username || data.identity?.username || "").toLowerCase()
  );
  const capabilities = useMemo(
    () => new Set(Array.isArray(auth.action_capabilities) ? auth.action_capabilities : []),
    [auth.action_capabilities],
  );
  const contributionAvailable = Boolean(
    isOwnProfile
    && auth.actions_enabled
    && ["FELLOWSHIP_STATE", "CONTRIBUTE_GIL", "CONTRIBUTE_ITEM"].every((kind) => capabilities.has(kind))
  );
  const csrfToken = auth.csrf_token || "";

  const fellowship = liveState?.member || snapshotFellowship;
  const rank = fellowship.rank || { name: "Recruit", threshold: 0, maxed: false };
  const renown = Number(fellowship.renown || 0);
  const rankFloor = Number(rank.threshold || 0);
  const nextThreshold = Number(rank.next_threshold || rankFloor);
  const rankSpan = Math.max(0, nextThreshold - rankFloor);
  const rankProgress = rank.maxed ? 100 : pct(Math.max(0, renown - rankFloor), rankSpan);
  const remaining = rank.maxed ? 0 : Math.max(0, nextThreshold - renown);
  const project = liveState?.project || null;
  const requirements = Array.isArray(project?.requirements) ? project.requirements : [];

  const loadState = useCallback(async ({ quiet = false } = {}) => {
    if (!contributionAvailable || busyKey) return null;
    setBusyKey("state");
    if (!quiet) setMessage("Refreshing Fellowship project…");
    try {
      const response = await submitFellowshipState(
        csrfToken,
        actionKey("fellowship-state", data.player?.username || data.identity?.username || "self"),
      );
      const finished = await finishedAction(response);
      if (!finished) {
        setMessage("Fellowship project state is still updating. Try again in a moment.");
        return null;
      }
      if (finished.status !== "completed" || finished.result?.ok === false) {
        setMessage(finished.result?.message || "Fellowship project state could not be refreshed.");
        return null;
      }
      const next = finished.result?.data?.fellowship_state || null;
      if (next) setLiveState(next);
      if (!quiet) setMessage("Fellowship project refreshed.");
      return next;
    } catch (error) {
      setMessage(error.message);
      return null;
    } finally {
      setBusyKey("");
    }
  }, [contributionAvailable, busyKey, csrfToken, data.player?.username, data.identity?.username]);

  useEffect(() => {
    if (!contributionAvailable || liveState || attemptedLoad.current) return;
    attemptedLoad.current = true;
    loadState({ quiet: true }).then((next) => {
      if (next) setMessage("");
    });
  }, [contributionAvailable, liveState, loadState]);

  useEffect(() => {
    if (!contributionAvailable) attemptedLoad.current = false;
  }, [contributionAvailable]);

  const runMutation = async (key, submit, fallback) => {
    if (!contributionAvailable || busyKey) return;
    setBusyKey(key);
    setMessage("Delivering your contribution to the Fellowship…");
    try {
      const response = await submit();
      const finished = await finishedAction(response);
      if (!finished) {
        setMessage("This contribution is still processing. Please check the project again before retrying.");
        return;
      }
      setMessage(finished.result?.message || fallback);
      const next = finished.result?.data?.fellowship_state;
      if (next) setLiveState(next);
      if (finished.status === "completed" && finished.result?.ok !== false) {
        setGilAmount("");
        setItemAmounts({});
        onRefresh?.();
        window.setTimeout(() => onRefresh?.(), 3200);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusyKey("");
    }
  };

  const contributeGil = (req) => {
    const maximum = Math.min(Number(req.owned || 0), Number(req.remaining || 0), 1_000_000);
    const amount = wholeNumber(gilAmount, maximum);
    if (!amount) {
      setMessage("Enter a Gil amount you currently have and the project still needs.");
      return;
    }
    runMutation(
      "contribute:gil",
      () => submitFellowshipGil(amount, csrfToken, actionKey("fellowship-gil", amount)),
      `Contributed ${number(amount)} Gil.`,
    );
  };

  const contributeItem = (req) => {
    const maximum = Math.min(Number(req.owned || 0), Number(req.remaining || 0), 999);
    const amount = wholeNumber(itemAmounts[req.asset_id], maximum);
    if (!amount) {
      setMessage(`Enter a ${req.label} quantity you currently own and the project still needs.`);
      return;
    }
    runMutation(
      `contribute:item:${req.asset_id}`,
      () => submitFellowshipItem(req.asset_id, amount, csrfToken, actionKey("fellowship-item", `${req.asset_id}:${amount}`)),
      `Contributed ${req.label} x${number(amount)}.`,
    );
  };

  return (
    <div className="dashboard-grid fellowship-member-dashboard">
      <section className="panel fellowship-member-rank span-12">
        <div className="fellowship-member-rank-copy">
          <div>
            <div className="slot-label">Personal Fellowship Standing</div>
            <h2>{rank.name || "Recruit"}</h2>
            <div className="fellowship-member-badges">
              <span className="small-badge">{number(renown)} Renown</span>
              {fellowship.founding_member ? <span className="small-badge founding">Founding Member</span> : null}
            </div>
          </div>
          <div className="fellowship-member-rank-progress">
            <div className="vital-label">
              <span>{rank.maxed ? "Guild Rank" : `Next Rank · ${rank.next_name}`}</span>
              <span>{rank.maxed ? "Maximum Rank" : `${number(remaining)} Renown remaining`}</span>
            </div>
            <ProgressBar value={rankProgress} />
            <small>
              {rank.maxed
                ? "You have reached the current highest Guild Rank."
                : `${number(renown)} / ${number(nextThreshold)} personal Fellowship Renown`}
            </small>
          </div>
        </div>
      </section>

      {isOwnProfile ? (
        <section className="panel fellowship-contribution-panel span-12">
          <div className="panel-title-row">
            <div>
              <span className="panel-kicker">Fellowship Contributions</span>
              <h2>{project?.name || "Active Guild Project"}</h2>
            </div>
            <button
              type="button"
              className="equipment-action-button secondary"
              disabled={!contributionAvailable || Boolean(busyKey)}
              onClick={() => loadState()}
            >
              {busyKey === "state" ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          <div className={`equipment-action-status ${contributionAvailable ? "ready" : "offline"}`}>
            <strong>{contributionAvailable ? (liveState ? "Contribution controls ready" : "Loading Fellowship project…") : "Contribution controls unavailable"}</strong>
            <span>{contributionAvailable
              ? "Support the active Guild project with required Gil or materials. Gameplay requirements still advance through normal play."
              : "Your Fellowship record remains available to view. Contributions return when Crystal Guild reconnects."}</span>
            {message ? <small aria-live="polite">{message}</small> : null}
          </div>

          {liveState && !project ? (
            <div className="state-message compact-state">There is no active Fellowship project right now. Contributions will appear here after the streamer selects the next unlocked project.</div>
          ) : null}

          {project ? (
            <>
              {project.description ? <p className="fellowship-project-description">{project.description}</p> : null}
              <div className="fellowship-project-requirements">
                {requirements.map((req) => {
                  const maxContribution = Math.min(Number(req.owned || 0), Number(req.remaining || 0), req.kind === "gil" ? 1_000_000 : 999);
                  const busy = busyKey === `contribute:${req.kind === "gil" ? "gil" : `item:${req.asset_id}`}`;
                  return (
                    <article className={`fellowship-requirement-card ${req.complete ? "complete" : ""}`} key={req.key}>
                      <div className="fellowship-requirement-head">
                        <div>
                          <span className="slot-label">{req.contributable ? "Resource Requirement" : "Gameplay Requirement"}</span>
                          <h3>{req.label}</h3>
                        </div>
                        <span className={`small-badge ${req.complete ? "mastered" : ""}`}>{req.complete ? "Complete" : `${number(req.current)} / ${number(req.target)}`}</span>
                      </div>
                      <ProgressBar value={pct(req.current, req.target)} />
                      <div className="fellowship-requirement-meta">
                        <span>{req.complete ? "Requirement fulfilled" : `${number(req.remaining)} remaining`}</span>
                        {req.contributable ? <span>You have {number(req.owned)}</span> : <span>Advances automatically</span>}
                      </div>

                      {!req.complete && req.kind === "gil" ? (
                        <div className="fellowship-contribution-controls">
                          <label>
                            <span>Gil to contribute</span>
                            <input
                              type="number"
                              min="1"
                              max={Math.max(1, maxContribution)}
                              step="1"
                              inputMode="numeric"
                              value={gilAmount}
                              disabled={!contributionAvailable || Boolean(busyKey) || maxContribution < 1}
                              onChange={(event) => setGilAmount(event.target.value)}
                            />
                          </label>
                          <button type="button" className="equipment-action-button secondary compact" disabled={!contributionAvailable || Boolean(busyKey) || maxContribution < 1} onClick={() => setGilAmount(String(maxContribution))}>Max</button>
                          <button type="button" className="equipment-action-button" disabled={!contributionAvailable || Boolean(busyKey) || maxContribution < 1} onClick={() => contributeGil(req)}>
                            {busy ? "Contributing…" : "Contribute Gil"}
                          </button>
                        </div>
                      ) : null}

                      {!req.complete && req.kind === "item" ? (
                        <div className="fellowship-contribution-controls">
                          <label>
                            <span>{req.label} quantity</span>
                            <input
                              type="number"
                              min="1"
                              max={Math.max(1, maxContribution)}
                              step="1"
                              inputMode="numeric"
                              value={itemAmounts[req.asset_id] || ""}
                              disabled={!contributionAvailable || Boolean(busyKey) || maxContribution < 1}
                              onChange={(event) => setItemAmounts((current) => ({ ...current, [req.asset_id]: event.target.value }))}
                            />
                          </label>
                          <button type="button" className="equipment-action-button secondary compact" disabled={!contributionAvailable || Boolean(busyKey) || maxContribution < 1} onClick={() => setItemAmounts((current) => ({ ...current, [req.asset_id]: String(maxContribution) }))}>Max</button>
                          <button type="button" className="equipment-action-button" disabled={!contributionAvailable || Boolean(busyKey) || maxContribution < 1} onClick={() => contributeItem(req)}>
                            {busy ? "Contributing…" : "Contribute"}
                          </button>
                        </div>
                      ) : null}

                      {!req.complete && req.contributable && maxContribution < 1 ? (
                        <small className="fellowship-contribution-empty">You do not currently have this required resource available to contribute.</small>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      <section className="panel span-12">
        <div className="panel-title-row">
          <div>
            <span className="panel-kicker">Your Contributions</span>
            <h2>Fellowship Record</h2>
          </div>
          <span className="small-badge">Persistent Career Record</span>
        </div>
        <div className="stat-grid fellowship-member-stats">
          <StatCard current={fellowship.projects_contributed} label="Projects Supported" />
          <StatCard current={fellowship.gil_donated} label="Gil Donated" />
          <StatCard current={fellowship.materials_donated} label="Materials Donated" />
          <StatCard current={fellowship.orders_participated} label="Orders Participated" />
          <StatCard current={fellowship.deeds_assisted} label="Deeds Assisted" />
        </div>
      </section>

      <section className="panel fellowship-member-about span-12">
        <div>
          <div className="slot-label">How Guild Rank Works</div>
          <h2>Earn standing by helping the Fellowship</h2>
          <p>
            Personal Guild Rank rises automatically as you earn Fellowship Renown through normal play and community objectives.
            Your rank is yours; the Guild&apos;s shared progression remains the separate Fellowship LVL.
          </p>
        </div>
        <a className="fellowship-member-link" href="/fellowship">View the full Fellowship →</a>
      </section>
    </div>
  );
}
