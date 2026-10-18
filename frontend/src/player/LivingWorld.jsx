import { useState } from "react";

const MARKERS = {
  available: "/living-world/ui/atlas-markers/available.png",
  completed: "/living-world/ui/atlas-markers/completed.png",
  locked: "/living-world/ui/atlas-markers/locked.png",
  selected: "/living-world/ui/atlas-markers/selected.png",
  discovery: "/living-world/ui/atlas-markers/discovery.png",
};

function Progress({ value, total, label }) {
  const fraction = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className="lw-progress">
      <div className="lw-progress-label"><span>{label}</span><strong>{value} / {total}</strong></div>
      <div className="lw-progress-track" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={total}>
        <span style={{ width: `${fraction}%` }} />
      </div>
    </div>
  );
}

export default function LivingWorld({ data, onNavigate }) {
  const regions = Array.isArray(data?.regions) ? data.regions : [];
  const available = regions.filter((region) => region?.unlocked);
  const [selected, setSelected] = useState("verdant_wilds");
  const region = regions.find((entry) => entry.id === selected) || available[0] || regions[0];
  const ready = Boolean(data?.enabled && data?.playable && !data?.sync_pending);
  const discoveries = Array.isArray(region?.discoveries) ? region.discoveries : [];

  return (
    <div className="lw-world" aria-label="The Living World">
      <header className="lw-intro">
        <div><p className="lw-eyebrow">Crystal Guild · The Living World</p><h2>Atlas of the Eight Frontiers</h2>
          <p>Explore storied landscapes, uncover forgotten places, and preserve discoveries for your adventurer.</p>
        </div>
        <div className="lw-summary" aria-label="World progress"><strong>{Number(data?.summary?.discoveries || 0)}</strong><span>Places discovered</span></div>
      </header>
      {!ready ? <p className="lw-message" role="status">{data?.sync_pending ? "Waiting for the Bot's Living World snapshot to sync. Existing adventures are unaffected." : "The Living World opens when the LW-1 Bot and Portal updates are deployed together."}</p> : null}
      <section className="lw-layout">
        <nav className="lw-region-grid" aria-label="Atlas regions">
          {regions.map((entry) => {
            const active = entry.id === region?.id;
            const unlocked = ready && entry.unlocked;
            const tile = entry.thumbnail;
            return (
              <button className={`lw-region-tile ${active ? "lw-is-selected" : ""} ${unlocked ? "" : "lw-is-locked"}`} key={entry.id}
                type="button" onClick={() => setSelected(entry.id)} aria-pressed={active} aria-label={`${entry.name}, ${unlocked ? entry.status : "locked"}`}>
                {tile && unlocked ? <img className="lw-tile-art" src={tile} alt="" loading="lazy" /> : <span className="lw-tile-unknown" aria-hidden="true">{entry.order.toString().padStart(2, "0")}</span>}
                <span className="lw-tile-caption"><strong>{entry.name}</strong>
                  <img src={unlocked ? MARKERS[entry.status] || MARKERS.available : MARKERS.locked} width="24" height="24" alt="" />
                </span>
              </button>
            );
          })}
        </nav>
        <article className="lw-feature" aria-labelledby="lw-region-title">
          {ready && region?.banner ? <img className="lw-feature-image" src={region.banner} alt="Verdant woodland trail with moss-covered stone ruins" /> : <div className="lw-feature-image lw-image-locked" aria-hidden="true" />}
          <div className="lw-feature-body"><p className="lw-eyebrow">Region {region?.order ?? 1} / 8</p><h3 id="lw-region-title">{region?.name || "The Atlas"}</h3>
            <p>{ready && region?.unlocked ? "Beneath an ancient canopy, quiet paths lead toward forgotten shrines and bright streams." : "This frontier has not opened yet. Its unlock conditions will be announced in a future Living World batch."}</p>
            {ready && region?.unlocked ? <>
              <Progress value={region.discovery_count || 0} total={region.total_discoveries || 4} label="Verdant Wilds discoveries" />
              <p className="lw-guide">{data.how_to_explore}</p>
              <button className="lw-action" type="button" onClick={() => onNavigate("hunts")}>Open Adventure Board <span aria-hidden="true">→</span></button>
            </> : <p className="lw-locked-message">Future expansion · Not yet available</p>}
          </div>
        </article>
      </section>
      {ready && region?.unlocked ? <section className="lw-discovery-section" aria-label="Discovery journal">
        <div className="lw-section-heading"><div><p className="lw-eyebrow">Field notes</p><h3>Discoveries</h3></div><span>{discoveries.filter((entry) => entry.discovered).length} of {discoveries.length} found</span></div>
        <div className="lw-discovery-grid">{discoveries.map((entry, index) => <article key={entry.id} className={`lw-discovery ${entry.discovered ? "lw-found" : ""}`}>
          <img src={MARKERS.discovery} width="30" height="30" alt="" />
          <div className="lw-discovery-copy"><div className="lw-discovery-meta"><p className="lw-eyebrow">Field note {index + 1}</p>
            <span className="lw-discovery-status">{entry.discovered ? "Discovered" : "Unknown"}</span></div>
            <h4>{entry.name}</h4><p>{entry.description}</p></div>
        </article>)}</div>
      </section> : null}
      <p className="lw-footnote">Offline exploration is fully supported. Fellowship contributions and live-stream activities are not required to complete Verdant Wilds.</p>
    </div>
  );
}
