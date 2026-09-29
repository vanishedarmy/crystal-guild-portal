// Pure filters for the Resynthesis Workbench. The Bot remains authoritative
// about eligibility and exact recovery; this module never estimates either.
export const RESYNTHESIS_CATEGORIES = [
  { id: "all", label: "All Gear" },
  { id: "weapon", label: "Weapons" },
  { id: "armor", label: "Armor" },
];

export function filterResynthesisItems(items = [], {
  category = "all", search = "", availableOnly = false, sort = "level",
} = {}) {
  const needle = String(search || "").trim().toLocaleLowerCase();
  return items.filter((item) => {
    if (category !== "all" && String(item.type || "").toLowerCase() !== category) return false;
    if (availableOnly && !item.resynthesizable) return false;
    if (!needle) return true;
    return [item.name, item.type, ...(item.recovery || []).map((entry) => entry.name)]
      .some((part) => String(part || "").toLocaleLowerCase().includes(needle));
  }).sort((a, b) => {
    if (sort === "name") return String(a.name).localeCompare(String(b.name));
    if (sort === "high") return Number(b.min_level || 1) - Number(a.min_level || 1) || String(a.name).localeCompare(String(b.name));
    if (sort === "upgrade") return Number(b.upgrade_level || 0) - Number(a.upgrade_level || 0) || Number(a.min_level || 1) - Number(b.min_level || 1) || String(a.name).localeCompare(String(b.name));
    if (sort === "ready") return Number(Boolean(b.resynthesizable)) - Number(Boolean(a.resynthesizable)) || Number(a.min_level || 1) - Number(b.min_level || 1) || String(a.name).localeCompare(String(b.name));
    return Number(a.min_level || 1) - Number(b.min_level || 1) || String(a.name).localeCompare(String(b.name));
  });
}
