import { useEffect, useState } from "react";
import ChocoboStable from "./ChocoboStable.jsx";
import Blacksmith from "./Blacksmith.jsx";
import MoogleEmporium from "./MoogleEmporium.jsx";

const SERVICES = [
  { id: "shop", name: "Moogle Emporium", glyph: "¤", description: "Shop regional stock, sell equipment and browse the Trading Post.", tag: "Shopping & Trading" },
  { id: "blacksmith", name: "Guild Blacksmith", glyph: "⚒", description: "Craft recipes, forge upgrades and resynthesize equipment.", tag: "Crafting & Forging" },
  { id: "chocobo", name: "Chocobo Stable", glyph: "♞", description: "Register, train and customize your Chocobo companion.", tag: "Companions" },
];

export default function GuildTown({ data, overview, onRefresh, expanded = {}, onToggle, focus }) {
  const [visited, setVisited] = useState(() => Object.fromEntries(SERVICES.map((service) => [service.id, Boolean(expanded[service.id])])));
  useEffect(() => {
    setVisited((previous) => {
      const next = { ...previous };
      for (const service of SERVICES) if (expanded[service.id]) next[service.id] = true;
      return next;
    });
  }, [expanded]);
  useEffect(() => {
    if (!focus?.key || !focus?.section) return;
    const frame = window.requestAnimationFrame?.(() => {
      document.getElementById(`guild-town-${focus.section}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => { if (frame !== undefined) window.cancelAnimationFrame?.(frame); };
  }, [focus?.key, focus?.section]);

  return (
    <div className="guild-town" aria-label="Guild Town services">
      <header className="panel guild-town-intro">
        <p className="eyebrow">Crystal Guild · Services</p>
        <h2>Guild Town</h2>
        <p>Everything you need between adventures, now in one place. Expand any service to use it; all three can stay open at once.</p>
        <div className="guild-town-quicklinks" aria-label="Jump to a town service">
          {SERVICES.map((service) => (
            <button key={service.id} type="button" className="equipment-action-button secondary" onClick={() => {
              if (!expanded[service.id]) onToggle?.(service.id);
              document.getElementById(`guild-town-${service.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}>{service.glyph} {service.name}</button>
          ))}
        </div>
      </header>
      {SERVICES.map((service) => {
        const isOpen = Boolean(expanded[service.id]);
        const isMounted = visited[service.id] || isOpen;
        return (
          <section className={`guild-town-service ${isOpen ? "is-open" : "is-closed"}`} id={`guild-town-${service.id}`} key={service.id} aria-labelledby={`guild-town-label-${service.id}`}>
            <h2 className="guild-town-service-heading">
              <button type="button" className="guild-town-toggle" aria-expanded={isOpen} aria-controls={`guild-town-content-${service.id}`} id={`guild-town-label-${service.id}`} onClick={() => onToggle?.(service.id)}>
                <span className="guild-town-symbol" aria-hidden="true">{service.glyph}</span>
                <span className="guild-town-title-group"><strong>{service.name}</strong><small>{service.description}</small></span>
                <span className="guild-town-service-tag">{service.tag}</span>
                <span className="guild-town-toggle-caption" aria-hidden="true">{isOpen ? "Collapse −" : "Expand +"}</span>
              </button>
            </h2>
            {isMounted ? (
              <div className="guild-town-service-body" id={`guild-town-content-${service.id}`} role="region" aria-labelledby={`guild-town-label-${service.id}`} hidden={!isOpen}>
                {service.id === "shop" ? <MoogleEmporium data={data} overview={overview} onRefresh={onRefresh} focus={focus?.section === "shop" ? focus : null} /> : null}
                {service.id === "blacksmith" ? <Blacksmith data={data} overview={overview} onRefresh={onRefresh} /> : null}
                {service.id === "chocobo" ? <ChocoboStable data={overview} overview={overview} onRefresh={onRefresh} /> : null}
              </div>
            ) : <div id={`guild-town-content-${service.id}`} hidden /> }
          </section>
        );
      })}
    </div>
  );
}
