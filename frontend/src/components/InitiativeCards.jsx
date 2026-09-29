import ProgressBar from "./ProgressBar.jsx";
import { number, pct } from "../utils/formatters.js";

export function RewardSummary({ reward }) {
  if (!reward) return <span>No reward listed</span>;
  const contents = [];
  if (reward.gil) contents.push(`${number(reward.gil)} Gil`);
  if (reward.item_id && reward.quantity) contents.push(`${reward.quantity} × ${reward.item_id.replaceAll("_", " ")}`);
  if (reward.gear) contents.push("1 level-suitable piece of shop gear or 2 Mythril Ore");
  return <span>{contents.join(" · ") || "Guild payout"}</span>;
}

export function InitiativeCards({ objectives = [], communal = false }) {
  if (!objectives.length) return <p className="muted">Objective details will appear once the matching Guild update has synced.</p>;
  return (
    <div className="initiative-card-grid">
      {objectives.map((item) => (
        <article key={item.id} className={`initiative-card ${item.complete ? "initiative-complete" : ""}`}>
          <div className="initiative-card-top">
            <span className="panel-kicker">{item.category === "combat" ? "Combat" : item.category === "economy" ? "Workshop" : "Activities"}</span>
            <span className={`small-badge ${item.complete ? "complete" : ""}`}>{item.complete ? "Reward delivered" : "In progress"}</span>
          </div>
          <h3>{item.name}</h3>
          <p className="initiative-description">{item.description}</p>
          <div className="vital-label initiative-count" aria-label={`${number(item.progress)} of ${number(item.target)} completed`}>
            <span>Progress</span><strong>{number(item.progress)} / {number(item.target)}</strong>
          </div>
          <ProgressBar value={pct(item.progress, item.target)} />
          <div className="initiative-reward"><span>Completion reward</span><strong><RewardSummary reward={item.reward} /></strong></div>
          {communal && item.contributors?.length ? (
            <details className="initiative-contributors">
              <summary>Top contributors</summary>
              <ol>{item.contributors.map((person, index) => <li key={`${person.display_name}:${index}`}><span>{person.display_name}</span><strong>{number(person.amount)}</strong></li>)}</ol>
            </details>
          ) : null}
        </article>
      ))}
    </div>
  );
}
