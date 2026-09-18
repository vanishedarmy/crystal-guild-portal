import { useEffect, useMemo, useState } from "react";
import ItemArtwork from "./ItemArtwork.jsx";
import ProgressBar from "./ProgressBar.jsx";
import { number, pct } from "../utils/formatters.js";

const ITEM_GROUPS = [
  { id: "healing", label: "Healing" },
  { id: "support", label: "Support" },
  { id: "damage", label: "Damage" },
];

function abilityGroup(ability) {
  const target = String(ability?.target || "enemy").toLowerCase();
  if (target === "enemy") return "offense";
  if (target === "ally" || ability?.requires_ko) return "restoration";
  return "support";
}

function targetFor(option, selectedTarget) {
  return String(option?.target || "enemy").toLowerCase() === "ally" ? selectedTarget : "";
}

export default function LiveStreamCombatControls({ controls, busy = false, onAction }) {
  const targets = Array.isArray(controls?.targets) ? controls.targets : [];
  const abilities = Array.isArray(controls?.abilities) ? controls.abilities : [];
  const items = Array.isArray(controls?.items) ? controls.items : [];
  const actor = controls?.actor || {};
  const selfTarget = targets.find((row) => row.self)?.username || targets.find((row) => !row.ko)?.username || "";
  const [selectedTarget, setSelectedTarget] = useState(selfTarget);
  const [itemGroup, setItemGroup] = useState("healing");

  useEffect(() => {
    if (!selectedTarget || !targets.some((row) => row.username === selectedTarget)) setSelectedTarget(selfTarget);
  }, [selectedTarget, selfTarget, targets]);

  const abilityGroups = useMemo(() => ({
    offense: abilities.filter((row) => abilityGroup(row) === "offense"),
    restoration: abilities.filter((row) => abilityGroup(row) === "restoration"),
    support: abilities.filter((row) => abilityGroup(row) === "support"),
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
          <span className="slot-label">Portal Battle Controls</span>
          <h4>{actor.display_name || "Your Hero"} · {actor.job_name || "Adventurer"}</h4>
        </div>
        <span className={`small-badge ${controls.queued_action && controls.queued_action !== "WAIT" ? "success" : ""}`}>
          {controls.queued_action && controls.queued_action !== "WAIT" ? `Queued: ${controls.queued_action}` : `Round ${number(controls.round)}`}
        </span>
      </div>

      <div className="live-stream-vitals">
        <div><span>HP</span><strong>{number(actor.hp)} / {number(actor.max_hp)}</strong><ProgressBar value={pct(actor.hp, actor.max_hp)} className="hp" /></div>
        {Number(actor.max_mp || 0) > 0 ? <div><span>MP</span><strong>{number(actor.mp)} / {number(actor.max_mp)}</strong><ProgressBar value={pct(actor.mp, actor.max_mp)} className="mp" /></div> : null}
        {Number(actor.max_ap || 0) > 0 ? <div><span>AP</span><strong>{number(actor.ap)} / {number(actor.max_ap)}</strong><ProgressBar value={pct(actor.ap, actor.max_ap)} className="ap" /></div> : null}
      </div>

      {!controls.can_act && controls.reason ? <p className="live-stream-command-reason">{controls.reason}</p> : null}

      <div className="live-stream-core-actions">
        <button type="button" className="equipment-action-button" disabled={disabled} onClick={() => onAction?.("attack", "", "")}>{busy === "attack" ? "Queuing…" : "Attack"}</button>
        <button type="button" className="equipment-action-button secondary" disabled={disabled} onClick={() => onAction?.("defend", "", "")}>{busy === "defend" ? "Queuing…" : "Defend"}</button>
      </div>

      {targets.length > 1 ? (
        <label className="live-stream-target-control">
          <span>Support target</span>
          <select value={selectedTarget} onChange={(event) => setSelectedTarget(event.target.value)}>
            {targets.map((target) => <option value={target.username} key={target.username}>{target.display_name}{target.self ? " (You)" : ""}{target.ko ? " · KO" : ` · ${number(target.hp)}/${number(target.max_hp)} HP`}</option>)}
          </select>
          {chosenTarget?.ko ? <small>KO target selected — revive effects can target this hero.</small> : null}
        </label>
      ) : null}

      {abilities.length ? (
        <div className="live-stream-action-block">
          <div className="live-stream-action-heading"><strong>Abilities</strong><small>Selecting an action replaces your previous queued action for this round.</small></div>
          {[
            ["offense", "Offense"], ["restoration", "Restoration"], ["support", "Support"],
          ].map(([group, label]) => abilityGroups[group].length ? (
            <section className="live-stream-ability-group" key={group}>
              <span className="slot-label">{label}</span>
              <div className="live-stream-option-grid">
                {abilityGroups[group].map((ability) => {
                  const target = targetFor(ability, selectedTarget);
                  const targetRow = targets.find((row) => row.username === target);
                  const targetInvalid = ability.target === "ally" && (!target || (ability.requires_ko && !targetRow?.ko));
                  return <button type="button" className="live-stream-option" key={ability.id} disabled={disabled || !ability.usable || targetInvalid} title={ability.reason || ability.description} onClick={() => onAction?.("ability", ability.id, target)}>
                    <strong>{ability.name}</strong><small>{number(ability.cost)} {String(ability.resource || "").toUpperCase()} · {ability.target}</small><span>{targetInvalid && ability.requires_ko ? "Choose a KO'd ally." : ability.reason || ability.description || "Queue ability"}</span>
                  </button>;
                })}
              </div>
            </section>
          ) : null)}
        </div>
      ) : null}

      {items.length ? (
        <div className="live-stream-action-block live-stream-items">
          <div className="live-stream-action-heading"><strong>Consumables</strong><small>Owned battle items only.</small></div>
          <div className="live-stream-item-tabs" aria-label="Live battle item categories">
            {ITEM_GROUPS.map((group) => <button type="button" key={group.id} className={itemGroup === group.id ? "active" : ""} aria-pressed={itemGroup === group.id} disabled={!(itemGroups[group.id] || []).length} onClick={() => setItemGroup(group.id)}>{group.label}<span>{number((itemGroups[group.id] || []).length)}</span></button>)}
          </div>
          <div className="live-stream-option-grid live-stream-item-grid">
            {(itemGroups[itemGroup] || []).map((item) => {
              const target = targetFor(item, selectedTarget);
              const targetRow = targets.find((row) => row.username === target);
              const targetInvalid = item.target === "ally" && (!target || (item.requires_ko && !targetRow?.ko));
              return <button type="button" className="live-stream-option live-stream-item-option" key={item.id} disabled={disabled || !item.usable || targetInvalid} title={item.reason || item.description} onClick={() => onAction?.("item", item.id, target)}>
                <ItemArtwork item={item} className="live-stream-item-art" />
                <span className="live-stream-item-copy"><strong>{item.name}</strong><small>Owned {number(item.quantity)}</small><span>{targetInvalid && item.requires_ko ? "Choose a KO'd ally." : item.reason || item.description || "Use item"}</span></span>
              </button>;
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
