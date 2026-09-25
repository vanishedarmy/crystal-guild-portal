import { useMemo, useState } from "react";
import ClickableCard from "../components/ClickableCard.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import RelicArtwork from "../components/RelicArtwork.jsx";
import ContextHelp from "../components/ContextHelp.jsx";
import { formatBonuses, number, pct } from "../utils/formatters.js";
import { filterAndSortRelics, nextRelicObjective, relicStatus } from "./relicViewModel.js";

const FILTERS = [
  ["all", "All Relics"],
  ["ready", "Ready to awaken"],
  ["in_progress", "In progress"],
  ["not_started", "Not started"],
  ["complete", "Zenith complete"],
];

const STATUS_LABELS = {
  ready: "Ready to awaken",
  in_progress: "In progress",
  not_started: "Not started",
  complete: "Zenith complete",
};

export default function Relics({ data, onDetail }) {
  const relics = Array.isArray(data?.relics) ? data.relics : [];
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("job");
  const summary = data?.summary || {};
  const complete = summary.complete ?? relics.filter((relic) => relic.completed).length;
  const ready = summary.ready ?? relics.filter((relic) => relic.ready).length;
  const active = summary.in_progress ?? relics.filter((relic) => relicStatus(relic) === "in_progress").length;
  const earned = summary.earned_stages ?? relics.reduce((count, relic) => count + Number(relic.stage || 0), 0);
  const totalStages = summary.total_stages ?? relics.reduce((count, relic) => count + Number(relic.total_stages || 0), 0);

  const visible = useMemo(
    () => filterAndSortRelics(relics, { query, filter, sort }),
    [filter, query, relics, sort],
  );

  return (
    <section className="panel relic-arsenal-panel">
      <div className="panel-title-row">
        <div><p className="eyebrow">18-Job Collection · Three Stages Each</p><h2>Relic Arsenal</h2></div>
        <div className="context-help-actions"><ContextHelp topic="relics" /><span className="small-badge">{number(complete)} / {number(relics.length)} Zenith</span></div>
      </div>
      <p className="relic-introduction">Follow your weapon from Dormant through Awakening to Zenith. Select a Relic to see its full requirements, materials, Gil and Seal costs, and the stats of every weapon form.</p>
      <div className="relic-overview-stats" aria-label="Relic collection progress">
        <div><strong>{number(complete)}<span> / {number(relics.length)}</span></strong><small>Zenith completed</small></div>
        <div><strong>{number(ready)}</strong><small>Ready to awaken</small></div>
        <div><strong>{number(active)}</strong><small>Lines in progress</small></div>
        <div><strong>{number(earned)}<span> / {number(totalStages)}</span></strong><small>Stages earned</small></div>
      </div>
      <div className="relic-arsenal-progress"><ProgressBar value={pct(earned, totalStages)} /><span>{number(Math.round(pct(earned, totalStages)))}% of Arsenal stages complete</span></div>
      <div className="relic-arsenal-guide">
        <strong>How to forge a Relic</strong>
        <p>Raise the matching Job, complete each stage's combat or Hunt objectives, and collect the listed materials, Gil, and Hunt Seals. Once the current stage is ready, use <code>!awaken &lt;Relic name&gt;</code> in chat when you are not in a Solo Venture or Dungeon. Each stage grants a new weapon form; advancement never replaces your existing inventory automatically.</p>
      </div>
      <div className="relic-controls">
        <label>Search weapons or Jobs<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Relic name, Job or stage" /></label>
        <label>Show<select value={filter} onChange={(event) => setFilter(event.target.value)}>{FILTERS.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        <label>Sort<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="job">Job name</option><option value="ready">Ready first</option><option value="progress">Most progress</option></select></label>
      </div>
      <p className="relic-result-count" aria-live="polite">Showing {number(visible.length)} of {number(relics.length)} Relics</p>
      {visible.length ? <div className="relic-grid">
        {visible.map((relic) => {
          const status = relicStatus(relic);
          return (
            <ClickableCard className={`relic-card relic-card-enriched relic-status-${status}`} key={relic.id || relic.name} detail={{ type: "relic", relic }} onOpen={onDetail}>
              <RelicArtwork relic={relic} className="relic-card-artwork" />
              <div className="relic-card-heading"><span className="slot-label">{relic.job} Relic</span><span className={`relic-state-tag ${status}`}>{STATUS_LABELS[status]}</span></div>
              <div className="relic-name">{relic.name}</div>
              {relic.description ? <p className="relic-card-lore">{relic.description}</p> : null}
              <div className="card-meta">Stage {number(relic.stage)} / {number(relic.total_stages)}{relic.next_stage ? ` · Next: ${relic.next_stage}` : " · Zenith"}</div>
              <div className="relic-progress"><ProgressBar value={pct(relic.stage, relic.total_stages)} /></div>
              <p className="relic-card-objective">{nextRelicObjective(relic)}</p>
              {relic.final_reward ? <div className="relic-card-reward"><span>Zenith · Lv. {number(relic.final_reward.min_level)}</span><span>{formatBonuses(relic.final_reward.bonuses)}</span></div> : null}
              <span className="relic-card-detail-link">View all stages &amp; weapon stats →</span>
            </ClickableCard>
          );
        })}
      </div> : <div className="state-message relic-empty">No Relics match this search or filter. <button type="button" onClick={() => { setQuery(""); setFilter("all"); }}>Clear filters</button></div>}
      <p className="relic-snapshot-note">Progress and inventory figures reflect your latest profile snapshot. Refresh your profile after completing objectives or gathering materials.</p>
    </section>
  );
}
