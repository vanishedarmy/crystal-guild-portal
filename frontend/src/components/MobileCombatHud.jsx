import { number, pct } from "../utils/formatters.js";

function resourceFor(player = {}) {
  if (Number(player?.max_mp || 0) > 0) return { label: "MP", value: player?.mp, max: player?.max_mp };
  if (Number(player?.max_ap || 0) > 0) return { label: "AP", value: player?.ap, max: player?.max_ap };
  return null;
}

function MiniVital({ label, name, value, max, tone = "hp" }) {
  const percent = pct(value, max);
  return (
    <div className={`mobile-combat-hud-vital ${tone}`} title={name || label}>
      <div><span>{label}</span><strong>{number(value)} / {number(max)}</strong></div>
      <span className="mobile-combat-hud-meter" aria-hidden="true"><i style={{ width: `${Math.max(0, Math.min(100, Number(percent || 0)))}%` }} /></span>
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
}) {
  if (!enemy || !player) return null;
  const resource = resourceFor(player);
  return (
    <aside className="mobile-combat-hud" aria-label="Quick combat controls">
      <div className="mobile-combat-hud-vitals">
        <MiniVital label="Enemy" name={enemy?.name} value={enemy?.hp} max={enemy?.max_hp} tone="enemy" />
        <MiniVital label="You" name={player?.name} value={player?.hp} max={player?.max_hp} tone="player" />
        {resource ? (
          <div className={`mobile-combat-hud-resource ${resource.label.toLowerCase()}`}>
            <span>{resource.label}</span><strong>{number(resource.value)} / {number(resource.max)}</strong>
          </div>
        ) : null}
      </div>
      <div className="mobile-combat-hud-actions">
        <button type="button" className="equipment-action-button combat-tone-offense" disabled={disabled} onClick={onAttack}>Attack</button>
        <button type="button" className={`equipment-action-button secondary combat-tone-ability ${picker === "ability" ? "active" : ""}`} disabled={disabled || !hasAbilities} aria-expanded={picker === "ability"} onClick={onToggleAbility}>Ability</button>
        <button type="button" className={`equipment-action-button secondary combat-tone-item ${picker === "item" ? "active" : ""}`} disabled={disabled || !hasItems} aria-expanded={picker === "item"} onClick={onToggleItem}>Item</button>
        <button type="button" className="equipment-action-button secondary combat-tone-defense" disabled={disabled} onClick={onDefend}>Defend</button>
      </div>
    </aside>
  );
}
