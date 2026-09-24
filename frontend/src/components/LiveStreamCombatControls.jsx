import { useEffect, useMemo, useState } from "react";
import ItemArtwork from "./ItemArtwork.jsx";
import ProgressBar from "./ProgressBar.jsx";
import MobileCombatDrawer from "./MobileCombatDrawer.jsx";
import MobileCombatHud from "./MobileCombatHud.jsx";
import { battleAbilityPurpose, battleAbilitySummary, battleItemPurpose, number, pct } from "../utils/formatters.js";

const ITEM_GROUPS = [
  { id: "healing", label: "Healing" },
  { id: "support", label: "Support" },
  { id: "damage", label: "Damage" },
];

function targetFor(option, selectedTarget) {
  return String(option?.target || "enemy").toLowerCase() === "ally" ? selectedTarget : "";
}

export default function LiveStreamCombatControls({ controls, enemy = null, busy = false, onAction }) {
  const targets = Array.isArray(controls?.targets) ? controls.targets : [];
  const abilities = Array.isArray(controls?.abilities) ? controls.abilities : [];
  const items = Array.isArray(controls?.items) ? controls.items : [];
  const actor = controls?.actor || {};
  const selfTarget = targets.find((row) => row.self)?.username || targets.find((row) => !row.ko)?.username || "";
  const [selectedTarget, setSelectedTarget] = useState(selfTarget);
  const [itemGroup, setItemGroup] = useState("healing");
  const [mobilePicker, setMobilePicker] = useState("");

  useEffect(() => {
    if (!selectedTarget || !targets.some((row) => row.username === selectedTarget)) setSelectedTarget(selfTarget);
  }, [selectedTarget, selfTarget, targets]);

  const abilityGroups = useMemo(() => ({
    offense: abilities.filter((row) => battleAbilityPurpose(row) === "offense"),
    restoration: abilities.filter((row) => battleAbilityPurpose(row) === "restoration"),
    support: abilities.filter((row) => battleAbilityPurpose(row) === "support"),
  }), [abilities]);
  const itemGroups = useMemo(() => Object.fromEntries(ITEM_GROUPS.map((group) => [group.id, items.filter((row) => row.category === group.id)])), [items]);
  useEffect(() => {
    if (!(itemGroups[itemGroup] || []).length) {
      const next = ITEM_GROUPS.find((group) => (itemGroups[group.id] || []).length)?.id;
      if (next) setItemGroup(next);
    }
  }, [itemGroup, itemGroups]);

  if (!controls) return null;
  const disabled = Boolean(busy) || !controls.can_act;
  const chosenTarget = targets.find((row) => row.username === selectedTarget);

  return (
    <div className="live-stream-command-panel" aria-label="Live Stream battle controls">
      <div className="live-stream-command-head">
        <div>
          <span className="slot-label">Battle Actions</span>
          <h4>{actor.display_name || "Your Hero"} · {actor.job_name || "Adventurer"}</h4>
        </div>
        <span className={`small-badge ${controls.queued_action && controls.queued_action !== "WAIT" ? "success" : ""}`}>
          {controls.queued_action && controls.queued_action !== "WAIT" ? `Chosen: ${controls.queued_action}` : `Round ${number(controls.round)}`}
        </span>
      </div>

      <div className="live-stream-vitals">
        <div><span>HP</span><strong>{number(actor.hp)} / {number(actor.max_hp)}</strong><ProgressBar value={pct(actor.hp, actor.max_hp)} className="hp" /></div>
        {Number(actor.max_mp || 0) > 0 ? <div><span>MP</span><strong>{number(actor.mp)} / {number(actor.max_mp)}</strong><ProgressBar value={pct(actor.mp, actor.max_mp)} className="mp" /></div> : null}
        {Number(actor.max_ap || 0) > 0 ? <div><span>AP</span><strong>{number(actor.ap)} / {number(actor.max_ap)}</strong><ProgressBar value={pct(actor.ap, actor.max_ap)} className="ap" /></div> : null}
      </div>

      {!controls.can_act && controls.reason ? <p className="live-stream-command-reason">{controls.reason}</p> : null}

      <MobileCombatHud
        enemy={enemy || controls?.enemy}
        player={actor}
        disabled={disabled}
        picker={mobilePicker}
        hasAbilities={abilities.length > 0}
        hasItems={items.length > 0}
        onDismissPicker={() => setMobilePicker("")}
                  onAttack={() => onAction?.("attack", "", "")}
        onToggleAbility={() => setMobilePicker(mobilePicker === "ability" ? "" : "ability")}
        onToggleItem={() => setMobilePicker(mobilePicker === "item" ? "" : "item")}
        onDefend={() => onAction?.("defend", "", "")}
      />

      <div className="live-stream-core-actions">
        <button type="button" className="equipment-action-button combat-tone-offense" disabled={disabled} onClick={() => onAction?.("attack", "", "")}>{busy === "attack" ? "Attack…" : "Attack"}</button>
        <button type="button" className="equipment-action-button secondary combat-tone-defense" disabled={disabled} onClick={() => onAction?.("defend", "", "")}>{busy === "defend" ? "Defend…" : "Defend"}</button>
      </div>

      {targets.length > 1 ? (
        <label className="live-stream-target-control desktop-combat-target">
          <span>Support target</span>
          <select value={selectedTarget} onChange={(event) => setSelectedTarget(event.target.value)}>
            {targets.map((target) => <option value={target.username} key={target.username}>{target.display_name}{target.self ? " (You)" : ""}{target.ko ? " · KO" : ` · ${number(target.hp)}/${number(target.max_hp)} HP`}</option>)}
          </select>
          {chosenTarget?.ko ? <small>KO target selected — revive effects can target this hero.</small> : null}
        </label>
      ) : null}

      {abilities.length ? (
        <MobileCombatDrawer open={mobilePicker === "ability"} kind="ability" onClose={() => setMobilePicker("")}><div className={`live-stream-action-block mobile-combat-drawer ${mobilePicker === "ability" ? "mobile-picker-open" : ""}`}>
          <div className="live-stream-action-heading"><strong>Abilities</strong><button type="button" className="equipment-action-button secondary mobile-combat-drawer-close" onClick={() => setMobilePicker("")}>Close</button></div>
          {targets.length > 1 ? (
            <label className="live-stream-target-control mobile-combat-target">
              <span>Support target</span>
              <select value={selectedTarget} onChange={(event) => setSelectedTarget(event.target.value)}>
                {targets.map((target) => <option value={target.username} key={`mobile-ability:${target.username}`}>{target.display_name}{target.self ? " (You)" : ""}{target.ko ? " · KO" : ` · ${number(target.hp)}/${number(target.max_hp)} HP`}</option>)}
              </select>
            </label>
          ) : null}
          {[
            ["offense", "Offense"], ["restoration", "Restoration"], ["support", "Support"],
          ].map(([group, label]) => abilityGroups[group].length ? (
            <section className={`live-stream-ability-group ${group}`} key={group}>
              <span className="slot-label">{label}</span>
              <div className="live-stream-option-grid">
                {abilityGroups[group].map((ability) => {
                  const target = targetFor(ability, selectedTarget);
                  const targetRow = targets.find((row) => row.username === target);
                  const targetInvalid = ability.target === "ally" && (!target || (ability.requires_ko && !targetRow?.ko));
                  return <button type="button" className={`live-stream-option combat-purpose-${group}`} key={ability.id} disabled={disabled || !ability.usable || targetInvalid} title={ability.reason || battleAbilitySummary(ability) || ability.description} onClick={() => onAction?.("ability", ability.id, target)}>
                    <strong>{ability.name}</strong><small>{number(ability.cost)} {String(ability.resource || "").toUpperCase()}</small><span>{targetInvalid && ability.requires_ko ? "Choose a KO'd ally." : ability.reason || battleAbilitySummary(ability) || "Ready"}</span>
                  </button>;
                })}
              </div>
            </section>
          ) : null)}
        </div></MobileCombatDrawer>
      ) : null}

      {items.length ? (
        <MobileCombatDrawer open={mobilePicker === "item"} kind="item" onClose={() => setMobilePicker("")}><div className={`live-stream-action-block live-stream-items mobile-combat-drawer ${mobilePicker === "item" ? "mobile-picker-open" : ""}`}>
          <div className="live-stream-action-heading"><strong>Items</strong><button type="button" className="equipment-action-button secondary mobile-combat-drawer-close" onClick={() => setMobilePicker("")}>Close</button></div>
          {targets.length > 1 ? (
            <label className="live-stream-target-control mobile-combat-target">
              <span>Item target</span>
              <select value={selectedTarget} onChange={(event) => setSelectedTarget(event.target.value)}>
                {targets.map((target) => <option value={target.username} key={`mobile-item:${target.username}`}>{target.display_name}{target.self ? " (You)" : ""}{target.ko ? " · KO" : ` · ${number(target.hp)}/${number(target.max_hp)} HP`}</option>)}
              </select>
            </label>
          ) : null}
          <div className="live-stream-item-tabs" aria-label="Live battle item categories">
            {ITEM_GROUPS.map((group) => <button type="button" key={group.id} className={`combat-purpose-${group.id} ${itemGroup === group.id ? "active" : ""}`} aria-pressed={itemGroup === group.id} disabled={!(itemGroups[group.id] || []).length} onClick={() => setItemGroup(group.id)}>{group.label}<span>{number((itemGroups[group.id] || []).length)}</span></button>)}
          </div>
          <div className="live-stream-option-grid live-stream-item-grid">
            {(itemGroups[itemGroup] || []).map((item) => {
              const target = targetFor(item, selectedTarget);
              const targetRow = targets.find((row) => row.username === target);
              const targetInvalid = item.target === "ally" && (!target || (item.requires_ko && !targetRow?.ko));
              return <button type="button" className={`live-stream-option live-stream-item-option combat-purpose-${battleItemPurpose(item)}`} key={item.id} disabled={disabled || !item.usable || targetInvalid} title={item.reason || item.description} onClick={() => onAction?.("item", item.id, target)}>
                <ItemArtwork item={item} className="live-stream-item-art" />
                <span className="live-stream-item-copy"><strong>{item.name}</strong><small>Qty {number(item.quantity)}</small><span>{targetInvalid && item.requires_ko ? "Choose a KO'd ally." : item.reason || item.description || "Ready"}</span></span>
              </button>;
            })}
          </div>
        </div></MobileCombatDrawer>
      ) : null}
    </div>
  );
}
