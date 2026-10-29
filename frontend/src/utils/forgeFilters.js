// Pure directory filtering. The Bot's forge rules and costs remain authoritative.
export const FORGE_CATEGORIES = [
  { id: "all", label: "All Gear" },
  { id: "weapon", label: "Weapons" },
  { id: "armor", label: "Armor" },
  { id: "accessory", label: "Accessories" },
];

const TYPE_RANK = { weapon: 0, armor: 1, accessory: 2 };
const rank = (type) => TYPE_RANK[String(type || "").toLowerCase()] ?? 99;
const byName = (a, b) => String(a.name || "").localeCompare(String(b.name || ""));
const byLevel = (a, b) => Number(a.min_level || 1) - Number(b.min_level || 1) || byName(a, b);

export function filterForgeItems(items = [], {
  category = "all", search = "", forgeableOnly = false,
  favoritesOnly = false, favorites = [], sort = "type",
} = {}) {
  const needle = String(search || "").trim().toLocaleLowerCase();
  const favoritesSet = new Set(favorites);
  const values = items.filter((item) => {
    if (!item || !["weapon", "armor", "accessory"].includes(String(item.type).toLowerCase())) return false;
    if (category !== "all" && String(item.type).toLowerCase() !== category) return false;
    if (forgeableOnly && !item.forgeable) return false;
    if (favoritesOnly && !favoritesSet.has(item.item_id)) return false;
    return !needle || [item.name, item.type, ...(item.materials || []).map((material) => material.name)]
      .some((value) => String(value || "").toLocaleLowerCase().includes(needle));
  });
  const compare = (a, b) => {
    if (sort === "name") return byName(a, b);
    if (sort === "high") return Number(b.min_level || 1) - Number(a.min_level || 1) || byName(a, b);
    if (sort === "upgrade") return Number(b.current_upgrade || 0) - Number(a.current_upgrade || 0) || byLevel(a, b);
    if (sort === "ready") return Number(Boolean(b.forgeable)) - Number(Boolean(a.forgeable)) || rank(a.type) - rank(b.type) || byLevel(a, b);
    return rank(a.type) - rank(b.type) || byLevel(a, b);
  };
  // Equipped gear retains its *inventory order* regardless of the chosen sort.
  // It never moves below forged or unforged gear in the selected view.
  const equipped = values.filter((item) => item.equipped)
    .sort((a, b) => Number(a.inventory_order || 0) - Number(b.inventory_order || 0));
  const forged = values.filter((item) => !item.equipped && Number(item.current_upgrade || 0) > 0).sort(compare);
  const unforged = values.filter((item) => !item.equipped && Number(item.current_upgrade || 0) === 0).sort(compare);
  return { equipped, forged, unforged, ordered: [...equipped, ...forged, ...unforged] };
}

export function forgeUnavailableReasons(item, { combatLocked = false, gil = 0 } = {}) {
  if (!item) return ["Select a piece of equipment."];
  if (item.maxed) return ["Maximum forge level reached."];
  const reasons = [];
  if (combatLocked) reasons.push("Finish your active encounter or raid before forging.");
  if (Number(gil || 0) < Number(item.effective_gil || 0)) {
    reasons.push(`Need ${Math.max(0, Number(item.effective_gil || 0) - Number(gil || 0))} more Gil.`);
  }
  for (const material of item.materials || []) {
    const missing = Math.max(0, Number(material.quantity || 0) - Number(material.owned || 0));
    if (missing) reasons.push(`Need ${missing} more ${material.name || "material"}.`);
  }
  if (!reasons.length && !item.forgeable) reasons.push("Refresh the workshop to check your current forge eligibility.");
  return reasons;
}
