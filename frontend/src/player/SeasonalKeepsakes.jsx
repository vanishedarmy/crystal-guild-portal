export default function SeasonalKeepsakes({ keepsakes = [] }) {
  return <section className="panel span-12 seasonal-keepsakes" aria-label="Seasonal keepsakes">
    <div className="panel-heading"><div><p className="eyebrow">Permanent Collection</p><h3>Seasonal Keepsakes</h3></div></div>
    <p className="seasonal-section-copy">Your collected decorations stay here after the event ends. Cosmetic only; no stat bonus.</p>
    <div className="seasonal-keepsake-grid">
      {keepsakes.map((item) => <article className="seasonal-keepsake-card" key={item.id}>
        <img src={item.art} alt={item.name} loading="lazy" decoding="async" />
        <div><strong>{item.name}</strong><p>Collected · Halloween 2026</p>
          {item.id === "hollow_crystal_display" ? <p>Unlocks Keeper of the Hollow in the Trophy Hall’s Seasonal category.</p> : null}
        </div>
      </article>)}
    </div>
    {!keepsakes.length ? <p className="seasonal-empty-state">Collect a keepsake from the Moonlit Emporium to display it here.</p> : null}
  </section>;
}
