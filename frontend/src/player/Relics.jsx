import ClickableCard from "../components/ClickableCard.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import RelicArtwork from "../components/RelicArtwork.jsx";
import { number, pct } from "../utils/formatters.js";

export default function Relics({ data, onDetail }) {
  return (
    <section className="panel">
      <div className="panel-title-row"><h2>Relic Arsenal</h2><span className="small-badge">{data.relics.filter((relic) => relic.completed).length} completed</span></div>
      <div className="relic-grid">
        {data.relics.map((relic) => (
          <ClickableCard className="relic-card" key={relic.id || relic.name} detail={{ type: "relic", relic }} onOpen={onDetail}>
            <RelicArtwork relic={relic} className="relic-card-artwork" />
            <div className="slot-label">{relic.job} Relic</div>
            <div className="relic-name">{relic.name}</div>
            <div className="card-meta">Stage {number(relic.stage)} / {number(relic.total_stages)}{relic.current_reward ? ` · ${relic.current_reward}` : ""}</div>
            <div className="relic-progress"><ProgressBar value={pct(relic.stage, relic.total_stages)} /></div>
            <div className="card-actions">{relic.completed ? <span className="small-badge mastered">Zenith Complete</span> : null}</div>
          </ClickableCard>
        ))}
      </div>
    </section>
  );
}
