import { monsterPortraitPath } from "../utils/monsterPortraits.js";

export default function MonsterPortrait({ monster, name, discovered = true, className = "", eager = false }) {
  const safeName = String(name || monster?.name || "Unknown Monster");
  // Darken the same portrait for undiscovered entries rather than showing a
  // generic question mark. Server-side research gating is a separate Step 3;
  // this visual treatment alone is not a security boundary.
  const src = !discovered && monster?.locked_art ? String(monster.locked_art) : monsterPortraitPath(monster);
  const classes = ["monster-portrait", className, src ? "has-art" : "fallback", discovered ? "" : "undiscovered"].filter(Boolean).join(" ");
  return (
    <figure className={classes}>
      {src ? (
        <img src={src} alt={discovered ? `${safeName} monster portrait` : "Undiscovered monster portrait"} loading={eager ? "eager" : "lazy"} decoding="async" />
      ) : (
        <div className="monster-portrait-fallback" role="img" aria-label={discovered ? `${safeName} monster portrait not yet illustrated` : "Undiscovered monster"}>
          <span aria-hidden="true">?</span>
          <small>{discovered ? safeName : "Undiscovered"}</small>
        </div>
      )}
    </figure>
  );
}
