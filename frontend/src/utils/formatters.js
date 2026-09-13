import { humanizeLabel } from "./displayLabels.js";

export function number(value) {
  return Number(value || 0).toLocaleString();
}

export function pct(current, max) {
  if (!max) return 0;
  return Math.max(0, Math.min(100, (Number(current) / Number(max)) * 100));
}

export function duration(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds || 0)));
  const weeks = Math.floor(total / 604800);
  let remainder = total % 604800;
  const days = Math.floor(remainder / 86400);
  remainder %= 86400;
  const hours = Math.floor(remainder / 3600);
  remainder %= 3600;
  const minutes = Math.floor(remainder / 60);
  const secs = remainder % 60;
  const units = [["w", weeks], ["d", days], ["h", hours], ["m", minutes], ["s", secs]];
  const first = units.findIndex(([, value]) => value > 0);
  return units.slice(first < 0 ? units.length - 1 : first).map(([suffix, value]) => `${value}${suffix}`).join(" ");
}

export function timeAgo(value) {
  if (!value) return "—";
  const source = String(value);
  const date = new Date(/[zZ]|[+-]\d\d:\d\d$/.test(source) ? source : `${source}Z`);
  if (Number.isNaN(date.getTime())) return source;
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function formatBonuses(bonuses = {}) {
  const labels = {
    attack: "ATK",
    magic_power: "M.PWR",
    str: "STR",
    vit: "VIT",
    mag: "MAG",
    spr: "SPR",
    dex: "DEX",
    lck: "LCK",
    hp: "HP",
  };
  const entries = Object.entries(bonuses);
  if (!entries.length) return "No stat bonuses";
  return entries.map(([key, value]) => `${labels[key] || humanizeLabel(key)} +${value}`).join(" · ");
}

function formatPercent(value) {
  const pctValue = Number(value) * 100;
  if (!Number.isFinite(pctValue)) return null;
  return `${Number(pctValue.toFixed(1))}%`;
}

function formatItemEffect(effect = {}) {
  const type = String(effect.type || "").toLowerCase();
  const amount = Number(effect.amount);
  const fraction = Number(effect.fraction);
  const resource = { heal_hp: "HP", restore_mp: "MP", restore_ap: "AP" }[type];
  if (resource) {
    if (Number.isFinite(amount) && amount > 0) return `Restores ${number(amount)} ${resource}`;
    if (Number.isFinite(fraction) && fraction > 0) return `Restores ${formatPercent(fraction)} max ${resource}`;
  }
  if (type === "revive") {
    if (Number.isFinite(fraction) && fraction > 0) return `Revives with ${formatPercent(fraction)} HP`;
    return "Revives a fallen hero";
  }
  if (type === "cleanse") {
    const statuses = Array.isArray(effect.statuses) ? effect.statuses.map((status) => humanizeLabel(status)).filter(Boolean) : [];
    return statuses.length ? `Removes ${statuses.join(" / ")}` : "Removes negative status effects";
  }
  if (type === "damage") {
    const element = effect.element ? `${humanizeLabel(effect.element)} ` : "";
    if (Number.isFinite(amount) && amount > 0) return `Deals ${number(amount)} ${element}damage`;
    return `Deals ${element}damage`.trim();
  }
  if (type === "status") {
    const status = humanizeLabel(effect.status, "Status effect");
    const turns = Number(effect.turns);
    return Number.isFinite(turns) && turns > 0 ? `Grants ${status} for ${number(turns)} ${turns === 1 ? "round" : "rounds"}` : `Grants ${status}`;
  }
  return humanizeLabel(effect.type, "Item effect");
}

export function formatItemUse(use = {}) {
  const effects = Array.isArray(use?.effects) ? use.effects : [];
  if (!effects.length) return "No usable effect";

  const fullResources = new Set();
  for (const effect of effects) {
    const type = String(effect?.type || "").toLowerCase();
    const fraction = Number(effect?.fraction);
    if (Number.isFinite(fraction) && fraction >= 1 && ["heal_hp", "restore_mp", "restore_ap"].includes(type)) {
      fullResources.add(type);
    }
  }

  const restoresAllStats = ["heal_hp", "restore_mp", "restore_ap"].every((type) => fullResources.has(type));
  if (!restoresAllStats) return effects.map((effect) => formatItemEffect(effect)).filter(Boolean).join(" · ");

  const remaining = effects
    .filter((effect) => !fullResources.has(String(effect?.type || "").toLowerCase()))
    .map((effect) => formatItemEffect(effect))
    .filter(Boolean);
  return ["Restores All Stats", ...remaining].join(" · ");
}

// Battle inventory ordering is purpose-first so emergency/recovery tools are
// presented before setup/support items and direct-damage consumables. The
// classifier intentionally understands both structured item effects (when
// available) and the compact combat payload used by Solo/Dungeon/Expedition
// views, which currently carries target + description rather than the full
// catalog use object.
export function battleItemPurpose(item = {}) {
  const effects = Array.isArray(item?.use?.effects)
    ? item.use.effects
    : Array.isArray(item?.effects)
      ? item.effects
      : [];
  const effectTypes = new Set(effects.map((effect) => String(effect?.type || "").toLowerCase()).filter(Boolean));
  const target = String(item?.target || item?.use?.target || "").toLowerCase();
  const id = String(item?.id || "").toLowerCase();
  const text = `${item?.name || ""} ${item?.description || ""} ${item?.reason || ""}`.toLowerCase();

  if (
    effectTypes.has("heal_hp")
    || effectTypes.has("restore_mp")
    || effectTypes.has("restore_ap")
    || effectTypes.has("revive")
    || /\b(restores?|restore|revives?|revive|heals?|heal|recovery|recover)\b/.test(text)
    || /(?:^|_)(potion|ether|elixir|megalixir|phoenix_down|stamina_draught|warriors_tonic|heros_brew)(?:$|_)/.test(id)
  ) return "restorative";

  if (
    effectTypes.has("cleanse")
    || /\b(removes?|remove|cleanses?|cleanse|cures?|cure)\b/.test(text)
    || /(?:^|_)(antidote|remedy|panacea|eye_drops|echo_herbs|chronos_tear|smelling_salts)(?:$|_)/.test(id)
  ) return "cure";

  if (
    effectTypes.has("damage")
    || target === "enemy"
    || /\b(deals?|damage|thrown? at|strikes? the enemy|enemy damage)\b/.test(text)
  ) return "damage";

  return "support";
}

const BATTLE_ITEM_PURPOSE_ORDER = Object.freeze({ restorative: 0, cure: 1, support: 2, damage: 3 });

export function compareBattleItems(a = {}, b = {}) {
  const aPurpose = battleItemPurpose(a);
  const bPurpose = battleItemPurpose(b);
  const purposeDelta = (BATTLE_ITEM_PURPOSE_ORDER[aPurpose] ?? 2) - (BATTLE_ITEM_PURPOSE_ORDER[bPurpose] ?? 2);
  if (purposeDelta) return purposeDelta;
  return String(a?.name || a?.id || "").localeCompare(String(b?.name || b?.id || ""), undefined, { sensitivity: "base" });
}

export function sortBattleItems(items = []) {
  return Array.isArray(items) ? [...items].sort(compareBattleItems) : [];
}

export function formatItemAvailability(use = {}) {
  if (!use || typeof use !== "object") return "—";
  const target = humanizeLabel(use.target, "Target");
  const timing = use.field ? "Field & Active Battle" : "Active Battle";
  return `${target} target · ${timing}`;
}


export function formatItemTraits(item = {}) {
  const traits = [];
  if (item.element) traits.push(`${humanizeLabel(item.element)}-aspected basic attacks`);

  const onHit = item.on_hit_status;
  if (onHit && typeof onHit === "object" && onHit.status) {
    const chance = formatPercent(onHit.chance);
    const turns = Number(onHit.turns);
    const duration = Number.isFinite(turns) && turns > 0 ? ` for ${number(turns)} ${turns === 1 ? "round" : "rounds"}` : "";
    traits.push(`${chance ? `${chance} chance to ` : ""}inflict ${humanizeLabel(onHit.status)}${duration}`);
  }

  const lifesteal = formatPercent(item.lifesteal);
  if (lifesteal) traits.push(`${lifesteal} lifesteal`);

  const immune = Array.isArray(item.status_immune) ? item.status_immune.map((status) => humanizeLabel(status)).filter(Boolean) : [];
  if (immune.length) traits.push(`Immune to ${immune.join(" / ")}`);

  if (item.status_resist && typeof item.status_resist === "object") {
    for (const [status, value] of Object.entries(item.status_resist)) {
      const resistance = formatPercent(value);
      if (resistance) traits.push(`${resistance} ${humanizeLabel(status)} resistance`);
    }
  }

  return traits.join(" · ");
}

export function formatBestUse(item = {}) {
  const jobs = Array.isArray(item.allowed_jobs) ? item.allowed_jobs.filter(Boolean) : [];
  if (!jobs.length) return "All Jobs";
  if (jobs.length === 1) return `Best: ${jobs[0]}`;
  return `Best: ${jobs[0]} · Also: ${jobs.slice(1).join(", ")}`;
}

export function formatEquipmentRequirements(item = {}) {
  const parts = [];
  const level = Number(item.min_level);
  if (Number.isFinite(level) && level > 0) parts.push(`Lv. ${number(level)}`);
  const jobs = Array.isArray(item.allowed_jobs) ? item.allowed_jobs.filter(Boolean) : [];
  parts.push(jobs.length ? jobs.join(" / ") : "All Jobs");
  return parts.join(" · ");
}

export function formatMaterialPurpose(item = {}) {
  if (item.use?.effects?.length) return "Usable combat material";
  if (item.relic_stage) return "Relic progression material";
  return "Progression / crafting / trade material";
}

export function formatMonsterSpecial(value) {
  if (!value) return "—";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    const parts = value.map((item) => formatMonsterSpecial(item)).filter((item) => item !== "—");
    return parts.length ? parts.join(" · ") : "—";
  }
  if (typeof value === "object") {
    const name = String(value.name || value.label || value.id || "Special");
    const details = [];
    const chance = Number(value.chance);
    const multiplier = Number(value.multiplier);
    if (Number.isFinite(chance) && chance > 0) details.push(`${Math.round(chance * 100)}% chance`);
    if (Number.isFinite(multiplier) && multiplier > 0) details.push(`×${Number(multiplier.toFixed(2))}`);
    return details.length ? `${name} · ${details.join(" · ")}` : name;
  }
  return String(value);
}
