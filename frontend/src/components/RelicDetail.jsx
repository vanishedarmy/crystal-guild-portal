import RelicArtwork from "./RelicArtwork.jsx";
import ProgressBar from "./ProgressBar.jsx";
import { humanizeLabel } from "../utils/displayLabels.js";
import { formatBonuses, formatItemTraits, number, pct } from "../utils/formatters.js";

function RequirementRows({ entries = [], completed = false, upcoming = false }) {
  if (!entries.length) return <p className="muted">No additional objective for this stage.</p>;
  return <ul className="relic-check-list">
    {entries.map((entry, index) => {
      const met = completed || entry.met;
      return <li className={met ? "met" : upcoming ? "upcoming" : "missing"} key={`${entry.type}-${index}`}>
        <span className="relic-check-icon" aria-hidden="true">{completed ? "✓" : entry.met ? "✓" : "◇"}</span>
        <span>{entry.label}</span>
        <strong>{number(entry.current)} / {number(entry.required)}</strong>
      </li>;
    })}
  </ul>;
}

function CostRows({ cost = {}, completed = false, upcoming = false }) {
  const gil = cost.gil || {};
  const seals = cost.hunt_seals || {};
  const rows = [
    { id: "gil", name: "Gil", ...gil },
    { id: "hunt_seals", name: "Hunt Seals", ...seals },
    ...(cost.materials || []).map((item) => ({ ...item, id: item.id || item.name })),
  ].filter((item) => Number(item.required) > 0);
  if (!rows.length) return <p className="muted">No currency or materials required.</p>;
  return <ul className="relic-check-list relic-cost-list">
    {rows.map((item) => (
      <li className={completed || item.met ? "met" : upcoming ? "upcoming" : "missing"} key={item.id}>
        <span className="relic-check-icon" aria-hidden="true">{completed ? "✓" : item.met ? "✓" : "◇"}</span>
        <span>{item.name}</span>
        <strong>{number(item.owned)} / {number(item.required)}</strong>
      </li>
    ))}
  </ul>;
}

function WeaponReward({ reward }) {
  if (!reward) return <p className="muted">Reward data not yet available. Refresh the profile after updating the Bot.</p>;
  const traits = formatItemTraits(reward);
  return <div className="relic-weapon-reward">
    <div className="relic-weapon-reward-title"><strong>{reward.name}</strong><span>Equip Lv. {number(reward.min_level)}</span></div>
    <p>{formatBonuses(reward.bonuses || {})}</p>
    {traits ? <p><span className="data-label">Weapon traits</span> {traits}</p> : null}
    {reward.description ? <p>{reward.description}</p> : null}
    {reward.allowed_jobs?.length ? <p className="muted">Usable by: {(reward.allowed_job_names || reward.allowed_jobs.map((id) => humanizeLabel(id))).join(", ")}</p> : null}
    {Number(reward.owned || 0) > 0 ? <span className="small-badge mastered">In inventory: {number(reward.owned)}</span> : null}
  </div>;
}

function StageDetail({ relic, step }) {
  const completed = step.state === "completed";
  const current = step.state === "current";
  const upcoming = !completed && !current;
  return <details className={`relic-stage-details relic-step-${step.state}`} defaultOpen={current || (relic.completed && step.number === relic.total_stages)}>
    <summary>
      <span className="relic-stage-number">{String(step.number).padStart(2, "0")}</span>
      <span className="relic-stage-heading"><strong>{step.name}</strong><small>{completed ? "Completed" : upcoming ? "Upcoming stage" : step.ready ? "Ready to awaken" : "Current objective"}</small></span>
      <span className="relic-stage-expander" aria-hidden="true">⌄</span>
    </summary>
    <div className="relic-stage-content">
      <RelicArtwork relic={relic} stage={step.number} className="relic-stage-artwork" />
      {step.preview_missing ? <p className="relic-stage-note">The full stage catalog requires the updated Bot and a fresh Relics snapshot. You can still see which stages are earned.</p> : null}
      {completed ? <p className="relic-stage-note">This stage has already been earned. The progress and inventory figures below are your current totals; previously spent materials do not need to be held again.</p> : null}
      {upcoming ? <p className="relic-stage-note">Future-stage preview. These are the published requirements; you must finish earlier stages before advancing this one.</p> : null}
      {!step.preview_missing ? <>
        <div className="data-label">Objectives</div>
        <RequirementRows entries={step.requirements} completed={completed} upcoming={upcoming} />
        <div className="data-label">Cost &amp; materials</div>
        <CostRows cost={step.cost} completed={completed} upcoming={upcoming} />
        <div className="data-label">Weapon earned at this stage</div>
        <WeaponReward reward={step.reward} />
      </> : null}
      {current && !step.preview_missing ? <p className={`relic-stage-verdict ${step.ready ? "ready" : "pending"}`}>{step.ready ? "All recorded objectives and costs met — ready for !awaken." : "Complete the unmet objectives and gather the missing resources to awaken this form."}</p> : null}
    </div>
  </details>;
}

export default function RelicDetail({ relic = {} }) {
  const path = Array.isArray(relic.path) && relic.path.length
    ? relic.path
    : (relic.stages || []).map((name, index) => ({
      number: index + 1,
      name,
      state: index < Number(relic.stage || 0) ? "completed" : index === Number(relic.stage || 0) ? "current" : "upcoming",
      requirements: [],
      preview_missing: true,
    }));
  return <div className="detail-body relic-detail-body">
    <p className="eyebrow">{relic.job} · {relic.tier === "ultimate" ? "Ultimate Lv.90+" : "Classic"} · Three-stage Relic</p>
    <h2>{relic.name}</h2>
    {relic.description ? <p className="relic-lore"><span className="data-label">Armory note</span>{relic.description}</p> : null}
    <div className="relic-detail-hero">
      <RelicArtwork relic={relic} className="detail-relic-artwork" eager decorative={false} />
      <div className="relic-detail-hero-copy">
        <strong>{relic.completed ? (relic.tier === "ultimate" ? "Eternal mastered" : "Zenith mastered") : relic.ready ? "Ready to awaken" : relic.stage > 0 ? "Forging in progress" : "Awaiting the first stage"}</strong>
        <span>Stages earned: {number(relic.stage)} / {number(relic.total_stages)}</span>
        <ProgressBar value={pct(relic.stage, relic.total_stages)} />
        {relic.current_reward ? <span>Current unlocked form: {relic.current_reward}</span> : null}
        {relic.next_stage ? <span>Next objective: {relic.next_stage}</span> : null}
        {relic.completed_at ? <span>{relic.tier === "ultimate" ? "Eternal" : "Zenith"} earned: {relic.completed_at.replace("T", " ").replace("Z", " UTC")}</span> : null}
      </div>
    </div>
    {relic.final_reward ? <section className="relic-detail-final"><div className="data-label">{relic.completed ? (relic.tier === "ultimate" ? "Eternal weapon" : "Zenith weapon") : (relic.tier === "ultimate" ? "Eternal preview" : "Zenith preview")}</div><WeaponReward reward={relic.final_reward} /></section> : null}
    <section className="relic-detail-roadmap" aria-label="Weapon evolution path">
      <div className="data-label">Evolution path</div>
      <div className="relic-roadmap">{path.map((step) => <span className={`relic-roadmap-step ${step.state}`} key={step.number}>{step.number}. {step.name}</span>)}</div>
    </section>
    {path.some((step) => step.reward) ? <details className="relic-compare">
      <summary>Compare all three weapon forms</summary>
      <div className="relic-compare-scroll"><table>
        <thead><tr><th scope="col">Form</th><th scope="col">Equip level</th><th scope="col">Stat bonuses</th></tr></thead>
        <tbody>{path.filter((step) => step.reward).map((step) => <tr key={step.number}>
          <th scope="row">{step.reward.name}{step.state === "completed" ? <small>Earned</small> : step.state === "current" ? <small>Current stage</small> : null}</th>
          <td>{number(step.reward.min_level)}</td><td>{formatBonuses(step.reward.bonuses || {})}</td>
        </tr>)}</tbody>
      </table></div>
    </details> : null}
    <section className="relic-detail-steps">
      <div className="data-label">Stage requirements, costs &amp; rewards</div>
      {path.length ? path.map((step) => <StageDetail key={step.number} relic={relic} step={step} />) : <p className="muted">This Relic's stage details are not available in the current snapshot.</p>}
    </section>
    <section className="detail-section relic-detail-command"><div className="data-label">Chat commands</div><p>Use <code>!relic {relic.name}</code> to check your stage and <code>!awaken {relic.name}</code> when the current stage is ready. Finish or retreat from any active Solo Venture or Dungeon first. Relic weapons are protected from Trading Post sales.</p></section>
    <p className="relic-snapshot-note">Live progress reflects the latest synced snapshot; refresh your profile after acquiring materials or completing objectives.</p>
  </div>;
}
