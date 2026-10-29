import { submitDungeonStart } from "../api/auth.js";
import { number } from "../utils/formatters.js";

export default function AscensionTrialBoard({ ascension, csrfToken, actionsAvailable, busy, runRequest, blockedByDungeon }) {
  return (
    <div className="ascension-board" aria-label="Job Ascension Trials">
      <div className="ascension-board-heading">
        <div>
          <span className="slot-label">JLv.60 · 75 · 90 · 99</span>
          <h3>Your Ascension Path</h3>
          <p className="muted">Four trials for your active Job. Clear each milestone to unlock the next. Job Mastery at level 50 and existing Limit Breaks are unchanged.</p>
        </div>
        <span className="small-badge">{number(ascension?.completed || 0)} / 4 cleared</span>
      </div>
      {blockedByDungeon ? <p className="adventure-disabled-reason" role="status">A Dungeon is in progress. Complete or leave that Dungeon before beginning an Ascension Trial.</p> : null}
      <div className="ascension-trial-grid">
        {(ascension?.trials || []).map((trial) => (
          <article key={trial.id} className={`ascension-trial-card ${trial.clears ? "cleared" : trial.unlocked ? "ready" : "locked"}`}>
            <div className="ascension-trial-meta"><span>JLv.{number(trial.level)} · {trial.stage}</span><strong>{trial.clears ? "CLEARED" : trial.unlocked ? "AVAILABLE" : "LOCKED"}</strong></div>
            <h4>{trial.name}</h4>
            <p>{trial.description}</p>
            <div className="ascension-trial-steps">{Object.entries(trial.required_actions || {}).map(([kind, count]) => <span key={kind}>{kind}: {number(count)}×</span>)}</div>
            {trial.reward?.title ? <small>Earn title: {trial.reward.title}</small> : null}
            {trial.missing?.length ? <small className="muted">{trial.missing.join(" · ")}</small> : null}
            <button className="equipment-action-button" type="button" disabled={!actionsAvailable || !trial.unlocked || blockedByDungeon || Boolean(busy)} onClick={() => runRequest(`ascension:start:${trial.id}`, "dungeon-start", trial.id, (idem) => submitDungeonStart(trial.id, csrfToken, idem), `${trial.name} begun.`)}>{busy === `ascension:start:${trial.id}` ? "Entering…" : trial.clears ? "Replay Trial" : "Begin Trial"}</button>
          </article>
        ))}
        {!ascension?.trials?.length ? <p className="muted">Trial information is loading. Refresh your Adventure State if it remains unavailable.</p> : null}
      </div>
    </div>
  );
}
