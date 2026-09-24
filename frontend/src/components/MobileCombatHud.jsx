import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { number, pct } from "../utils/formatters.js";
import useMobileCombatViewport from "./useMobileCombatViewport.js";

let displayedHuds = 0;

function resourcesFor(player = {}) {
  // Some classes expose both bars; never silently hide AP behind MP.
  return [
    Number(player?.max_mp || 0) > 0 ? { label: "MP", value: player?.mp, max: player?.max_mp } : null,
    Number(player?.max_ap || 0) > 0 ? { label: "AP", value: player?.ap, max: player?.max_ap } : null,
  ].filter(Boolean);
}

function MiniVital({ label, name, value, max, tone = "hp" }) {
  const percent = pct(value, max);
  return (
    <div className={`mobile-combat-hud-vital ${tone}`} title={name || label}>
      <div><span>{label}</span><strong>{number(value)} / {number(max)}</strong></div>
      <span className="mobile-combat-hud-meter" aria-hidden="true"><i style={{ width: `${Math.max(0, Math.min(100, Number(percent || 0)))}%` }} /></span>
      {tone === "enemy" && name ? <small className="mobile-combat-hud-enemy-name">{name}</small> : null}
    </div>
  );
}

export default function MobileCombatHud({
  enemy,
  player,
  disabled = false,
  picker = "",
  hasAbilities = true,
  hasItems = true,
  onAttack,
  onToggleAbility,
  onToggleItem,
  onDefend,
  onDismissPicker,
}) {
  const mobile = useMobileCombatViewport();
  const hud = useRef(null);
  const active = Boolean(mobile && enemy && player);

  useLayoutEffect(() => {
    if (!active || typeof document === "undefined") return undefined;
    displayedHuds += 1;
    document.body.classList.add("mobile-combat-hud-present");
    const updateHeight = () => {
      const height = hud.current?.getBoundingClientRect().height || 0;
      if (height) document.documentElement.style.setProperty("--mobile-combat-hud-height", `${Math.ceil(height)}px`);
    };
    updateHeight();
    const observer = typeof ResizeObserver !== "undefined" && hud.current ? new ResizeObserver(updateHeight) : null;
    if (observer) observer.observe(hud.current);
    window.addEventListener("resize", updateHeight);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateHeight);
      displayedHuds = Math.max(0, displayedHuds - 1);
      if (!displayedHuds) {
        document.body.classList.remove("mobile-combat-hud-present");
        document.documentElement.style.removeProperty("--mobile-combat-hud-height");
      }
    };
  }, [active]);

  if (!active || typeof document === "undefined") return null;
  const resources = resourcesFor(player);
  return createPortal(
    <aside className="mobile-combat-hud" ref={hud} aria-label="Quick combat controls">
      <div className="mobile-combat-hud-vitals">
        <MiniVital label="You" name={player?.name} value={player?.hp} max={player?.max_hp} tone="player" />
        <MiniVital label="Enemy" name={enemy?.name} value={enemy?.hp} max={enemy?.max_hp} tone="enemy" />
        {resources.length ? <div className="mobile-combat-hud-resources">{resources.map((resource) => (
          <div className={`mobile-combat-hud-resource ${resource.label.toLowerCase()}`} key={resource.label}>
            <span>{resource.label}</span><strong>{number(resource.value)} / {number(resource.max)}</strong>
          </div>
        ))}</div> : null}
      </div>
      <div className="mobile-combat-hud-actions">
        <button type="button" className="equipment-action-button combat-tone-offense" disabled={disabled} onClick={() => { onDismissPicker?.(); onAttack?.(); }}>Attack</button>
        <button type="button" className={`equipment-action-button secondary combat-tone-ability ${picker === "ability" ? "active" : ""}`} data-mobile-picker="ability" disabled={disabled || !hasAbilities} aria-haspopup="dialog" aria-expanded={picker === "ability"} onClick={onToggleAbility}>Ability</button>
        <button type="button" className={`equipment-action-button secondary combat-tone-item ${picker === "item" ? "active" : ""}`} data-mobile-picker="item" disabled={disabled || !hasItems} aria-haspopup="dialog" aria-expanded={picker === "item"} onClick={onToggleItem}>Item</button>
        <button type="button" className="equipment-action-button secondary combat-tone-defense" disabled={disabled} onClick={() => { onDismissPicker?.(); onDefend?.(); }}>Defend</button>
      </div>
    </aside>, document.body,
  );
}
