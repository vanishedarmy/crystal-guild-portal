import { monsterPortraitPath } from "../utils/monsterPortraits.js";

export default function MonsterPortrait({ monster, name, discovered = true, className = "", eager = false }) {
  const safeName = String(name || monster?.name || "Unknown Monster");
  const src = discovered ? monsterPortraitPath(monster) : "";
  const classes = ["monster-portrait", className, src ? "has-art" : "fallback", discovered ? "" : "undiscovered"].filter(Boolean).join(" ");
  return (
    <figure className={classes}>
      {src ? (
        <img src={src} alt={`${safeName} monster portrait`} loading={eager ? "eager" : "lazy"} decoding="async" />
      ) : (
        <div className="monster-portrait-fallback" role="img" aria-label={discovered ? `${safeName} monster portrait not yet illustrated` : "Undiscovered monster"}>
          <span aria-hidden="true">?</span>
          <small>{discovered ? safeName : "Undiscovered"}</small>
        </div>
      )}
    </figure>
  );
}
