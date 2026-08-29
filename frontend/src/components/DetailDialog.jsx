import BossArtwork from "./BossArtwork.jsx";
import ItemArtwork from "./ItemArtwork.jsx";
import RelicArtwork from "./RelicArtwork.jsx";
import { humanizeLabel } from "../utils/displayLabels.js";
import { useEffect, useRef } from "react";
import { captureViewport, restoreViewport } from "../utils/viewportAnchor.js";
import {
  formatBonuses,
  formatEquipmentRequirements,
  formatItemAvailability,
  formatItemTraits,
  formatItemUse,
  formatMaterialPurpose,
  number,
} from "../utils/formatters.js";

function DetailBody({ detail }) {
  if (!detail) return null;
  const { type } = detail;
  if (type === "equipment" || type === "inventory") {
    const item = detail.item;
    const itemType = String(item.type || item.slot || "item").trim().toLowerCase();
    const inventoryGroup = String(detail.inventoryGroup || "").trim().toLowerCase();
    const hasBonuses = item.bonuses && Object.keys(item.bonuses).length > 0;
    const hasUse = Boolean(item.use?.effects?.length);
    const isConsumable = itemType === "consumable"
      || (type === "inventory" && inventoryGroup === "item" && !["weapon", "armor", "accessory", "material"].includes(itemType))
      || (hasUse && !["weapon", "armor", "accessory", "material"].includes(itemType));
    const description = String(item.description || "").trim() || (hasUse ? `${formatItemUse(item.use)}.` : "");
    const traits = formatItemTraits(item);
    const equipped = Boolean(item.id) && (type === "equipment" || Boolean(item.equipped));
    const quantity = Number(item.quantity || 0);
    const requirements = item.id && ["weapon", "armor", "accessory"].includes(itemType) ? formatEquipmentRequirements(item) : "";

    const Section = ({ label, children }) => (
      <section className="detail-section"><div className="data-label">{label}</div><p>{children}</p></section>
    );

    const commonTail = (
      <>
        {item.description ? <Section label="Description">{item.description}</Section> : null}
        {quantity > 0 ? <Section label="Quantity">{number(quantity)}</Section> : null}
        {item.upgrade_level ? <Section label="Forge Level">+{number(item.upgrade_level)}</Section> : null}
        {equipped ? <Section label="Status">Equipped</Section> : null}
      </>
    );

    let content;
    if (isConsumable) {
      content = (
        <>
          {hasUse ? <Section label="Item Effect">{formatItemUse(item.use)}</Section> : null}
          {description ? <Section label="Description">{description}</Section> : <Section label="Description">Consumable item details are unavailable right now.</Section>}
          {hasUse ? <Section label="Usage">{formatItemAvailability(item.use)}</Section> : null}
          {quantity > 0 ? <Section label="Quantity">{number(quantity)}</Section> : null}
        </>
      );
    } else if (itemType === "material") {
      content = (
        <>
          {hasUse ? <Section label="Item Effect">{formatItemUse(item.use)}</Section> : null}
          {item.description ? <Section label="Description">{item.description}</Section> : null}
          {hasUse ? <Section label="Usage">{formatItemAvailability(item.use)}</Section> : null}
          <Section label="Purpose">{formatMaterialPurpose(item)}</Section>
          {Number(item.price || 0) > 0 ? <Section label="Base Value">{number(item.price)} Gil</Section> : null}
          {quantity > 0 ? <Section label="Quantity">{number(quantity)}</Section> : null}
        </>
      );
    } else if (itemType === "accessory") {
      content = (
        <>
          {hasBonuses ? <Section label="Bonuses">{formatBonuses(item.bonuses)}</Section> : null}
          {traits ? <Section label="Special Effect">{traits}</Section> : null}
          {requirements ? <Section label="Equipment Requirements">{requirements}</Section> : null}
          {commonTail}
        </>
      );
    } else if (itemType === "weapon" || itemType === "armor") {
      content = (
        <>
          {hasBonuses ? <Section label="Stat Bonuses">{formatBonuses(item.bonuses)}</Section> : null}
          {traits ? <Section label="Special Traits">{traits}</Section> : null}
          {item.relic_stage ? <Section label="Relic Stage">Stage {number(item.relic_stage)}</Section> : null}
          {requirements ? <Section label="Equipment Requirements">{requirements}</Section> : null}
          {commonTail}
        </>
      );
    } else {
      content = (
        <>
          {hasUse ? <Section label="Item Effect">{formatItemUse(item.use)}</Section> : null}
          {hasBonuses ? <Section label="Stat Bonuses">{formatBonuses(item.bonuses)}</Section> : null}
          {traits ? <Section label="Special Traits">{traits}</Section> : null}
          {hasUse ? <Section label="Usage">{formatItemAvailability(item.use)}</Section> : null}
          {commonTail}
        </>
      );
    }

    return (
      <div className="detail-body item-detail-body">
        <p className="eyebrow">{humanizeLabel(isConsumable ? "consumable" : itemType)} · {humanizeLabel(item.rarity || "common")}</p>
        <ItemArtwork item={item} className="detail-item-artwork" eager decorative={false} />
        <h2>{item.name}</h2>
        {content}
      </div>
    );
  }
  if (type === "job") {
    const job = detail.job;
    const activeAbilities = Array.isArray(job.active_abilities) ? job.active_abilities : [];
    const passiveAbilities = Array.isArray(job.passive_abilities) ? job.passive_abilities : (job.abilities || []);
    const level = Number(job.level || 0);
    const ready = (ability) => Boolean(job.owned && level >= Number(ability.level || 0));
    return (
      <div className="detail-body job-detail-body">
        <p className="eyebrow">{humanizeLabel(job.tier)} {humanizeLabel(job.combat_type || "physical")} Job · {job.owned ? `JLv.${job.level}` : "Not learned"}</p>
        <h2>{job.name}</h2>
        <section className="detail-section">
          <div className="data-label">Combat Identity</div>
          <div className="job-detail-stat-grid">
            <div><span>Attack</span><strong>{job.attack_name || "Standard attack"}</strong></div>
            <div><span>Signature</span><strong>{job.signature || "—"}</strong></div>
            <div><span>Resource</span><strong>{String(job.resource_mode || "—").toUpperCase()}</strong></div>
            <div><span>Base Damage</span><strong>{job.damage_mod ? `×${job.damage_mod}` : "—"}</strong></div>
            <div><span>Signature Chance</span><strong>{job.signature_chance != null ? `${Math.round(Number(job.signature_chance) * 100)}%` : "—"}</strong></div>
            <div><span>Signature Power</span><strong>{job.signature_multiplier ? `×${job.signature_multiplier}` : "—"}</strong></div>
          </div>
        </section>
        {job.growth && Object.keys(job.growth).length ? (
          <section className="detail-section">
            <div className="data-label">Stat Growth</div>
            <div className="job-detail-growth-grid">{Object.entries(job.growth).map(([stat, value]) => <div key={stat}><span>{stat.toUpperCase()}</span><strong>{value}</strong></div>)}</div>
          </section>
        ) : null}
        <section className="detail-section">
          <div className="data-label">Battle Abilities</div>
          <p className="muted">Use <code>!ability &lt;name&gt; [target]</code> during Active Battles and Raids. Physical techniques generally spend AP; magical techniques generally spend MP.</p>
          <div className="job-detail-ability-list">
            {activeAbilities.length ? activeAbilities.map((ability) => (
              <div className={`job-detail-ability ${ready(ability) ? "ready" : "locked"}`} key={ability.id || ability.name}>
                <div className="job-detail-ability-head"><strong>JLv.{ability.level} · {ability.name}</strong><span>{ability.cost} {String(ability.resource || job.resource_mode || "mp").toUpperCase()} · {humanizeLabel(ability.target)}</span></div>
                {abilityTraitLabels(ability).length ? <div className="ability-trait-row">{abilityTraitLabels(ability).map((label) => <span className="small-badge ability-trait" key={label}>{label}</span>)}</div> : null}
                <p>{ability.description}</p>
                <span className={`small-badge ${ready(ability) ? "success" : "locked"}`}>{ready(ability) ? "Available" : `Unlocks at JLv.${ability.level}`}</span>
              </div>
            )) : <span className="muted">Battle ability reference unavailable.</span>}
          </div>
        </section>
        <section className="detail-section">
          <div className="data-label">Passive Job Milestones</div>
          <div className="job-detail-ability-list">
            {passiveAbilities.length ? passiveAbilities.map((ability) => (
              <div className={`job-detail-ability ${ready(ability) ? "ready" : "locked"}`} key={`${ability.level}-${ability.name}`}>
                <div className="job-detail-ability-head"><strong>JLv.{ability.level} · {ability.name}</strong><span>{ready(ability) ? "Learned" : "Locked"}</span></div>
                <p>{ability.description}</p>
              </div>
            )) : <span className="muted">No passive Job milestones listed.</span>}
          </div>
        </section>
        <section className="detail-section"><div className="data-label">JLv.50 Cross-Job Mastery</div><p><strong>{job.mastery?.name || "—"}</strong><br />{job.mastery?.description || ""}</p></section>
      </div>
    );
  }
  if (type === "relic") {
    const relic = detail.relic;
    return (
      <div className="detail-body">
        <p className="eyebrow">{relic.job} Relic</p>
        <h2>{relic.name}</h2>
        <RelicArtwork relic={relic} className="detail-relic-artwork" eager decorative={false} />
        <section className="detail-section"><div className="data-label">Progress</div><p>Stage {number(relic.stage)} of {number(relic.total_stages)}</p></section>
        <section className="detail-section"><div className="data-label">Relic Path</div><div className="data-list">
          {relic.stages.map((stage, index) => <div key={stage}>{index < relic.stage ? "✓" : "◇"} {stage}</div>)}
        </div></section>
      </div>
    );
  }
  if (type === "boss") {
    const boss = detail.boss;
    return (
      <div className="detail-body">
        <p className="eyebrow">{humanizeLabel(boss.tier)}</p>
        <h2>{boss.name}</h2>
        <BossArtwork boss={boss} className="detail-boss-artwork" eager />
        <section className="detail-section"><div className="data-label">Career Clears</div><p>{number(boss.clears)}</p></section>
        <section className="detail-section"><div className="data-label">Best Damage</div><p>{number(boss.best_damage)}</p></section>
        <section className="detail-section"><div className="data-label">Last Victory</div><p>{boss.last_cleared_at || "—"}</p></section>
      </div>
    );
  }
  return null;
}


function abilityTraitLabels(ability = {}) {
  const labels = [];
  if (ability.element) labels.push(String(ability.element));
  for (const effect of Array.isArray(ability.effects) ? ability.effects : []) {
    if (effect.type === "status" && effect.status) labels.push(humanizeLabel(effect.status));
    if (effect.type === "heal") labels.push("Healing");
    if (effect.type === "cleanse") labels.push("Cleanse");
    if (effect.type === "drain") labels.push("HP Drain");
    if (effect.type === "restore_mp") labels.push("MP Restore");
    if (effect.type === "restore_ap") labels.push("AP Restore");
    if (effect.type === "revive") labels.push("Revive");
    if (effect.type === "damage" && Number(effect.pierce || 0) > 0) labels.push("Piercing");
    if (effect.type === "damage" && Number(effect.crit_bonus || 0) > 0) labels.push("High Crit");
  }
  return [...new Set(labels)];
}


function detailDialogLabel(detail) {
  if (!detail) return "Crystal Guild details";
  if (detail.type === "job") return `${detail.job?.name || "Job"} details`;
  if (detail.type === "relic") return `${detail.relic?.name || "Relic"} details`;
  if (detail.type === "boss") return `${detail.boss?.name || "Boss"} details`;
  return `${detail.item?.name || "Item"} details`;
}

export default function DetailDialog({ detail, onClose }) {
  const ref = useRef(null);
  const viewportRef = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (detail && !dialog.open) {
      const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      viewportRef.current = captureViewport(active);
      dialog.showModal();
      restoreViewport(viewportRef.current);
    }
    if (!detail && dialog.open) dialog.close();
  }, [detail]);

  const restoreAndClose = () => {
    const snapshot = viewportRef.current;
    onClose?.();
    restoreViewport(snapshot, { focus: true });
  };

  const handleNativeClose = () => {
    const snapshot = viewportRef.current;
    if (detail) onClose?.();
    restoreViewport(snapshot, { focus: true });
  };

  return (
    <dialog
      ref={ref}
      className="detail-dialog"
      aria-label={detailDialogLabel(detail)}
      onCancel={(event) => { event.preventDefault(); restoreAndClose(); }}
      onClose={handleNativeClose}
      onClick={(event) => event.target === ref.current && restoreAndClose()}
    >
      <button className="dialog-close" type="button" aria-label="Close detail card" onClick={restoreAndClose}>×</button>
      <DetailBody detail={detail} />
    </dialog>
  );
}
