const LABEL_OVERRIDES = {
  bestiary_unique: "Bestiary Entries",
  bestiary_count: "Bestiary Entries",
  monsters_defeated: "Monsters Defeated",
  party_encounters: "Party Encounters",
  raid_revives: "Raid Revives",
  limit_breaks: "Limit Breaks",
  relics_completed: "Relics Completed",
  forge_upgrades: "Forge Upgrades",
  damage_dealt: "Damage Dealt",
  damage_taken: "Damage Taken",
  damage_mitigated: "Damage Mitigated",
  raid_damage: "Raid Damage",
  raid_wins: "Raid Wins",
  best_hit: "Best Single Hit",
  best_boss_damage: "Best Boss Damage",
  healing_done: "Healing Done",
  gil_earned: "Gil Earned",
  gil_spent: "Gil Spent",
  hunt_seals: "Hunt Seals",
  hunt_seals_earned: "Hunt Seals Earned",
  hunt_seals_spent: "Hunt Seals Spent",
  items_acquired: "Items Acquired",
  items_spent: "Items Spent",
  summons_called: "Summons Called",
  job_battles: "Job Battles",
  monster_record_defeats: "Monster Defeats",
  quest_complete: "Quest Completion",
  quest_count: "Quests Completed",
  mastery_count: "Jobs Mastered",
  character_level: "Character Level",
  job_level: "Job Level",
  hunt_total: "Hunt Clears",
  hunt_rank_total: "Rank Hunt Clears",
  hunt_rank_clears: "Unique Rank Hunts",
  boss_clear: "Boss Clears",
  boss_unique: "Unique Bosses",
  monster_kills: "Monster Defeats",
  record_stat: "Career Record",
  item_quantity: "Item Quantity",
  item_upgrade: "Forge Level",
  relic_complete: "Relic Completion",
};

const ACRONYMS = new Set(["ap", "atk", "dex", "hp", "jp", "lck", "mag", "mp", "spr", "str", "vit", "xp"]);

function titleWord(word) {
  const lower = word.toLowerCase();
  if (ACRONYMS.has(lower)) return lower.toUpperCase();
  if (lower === "gil") return "Gil";
  return lower ? lower[0].toUpperCase() + lower.slice(1) : "";
}

export function humanizeLabel(value, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  const raw = String(value).trim();
  if (!raw) return fallback;
  const override = LABEL_OVERRIDES[raw.toLowerCase()];
  if (override) return override;
  return raw
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map(titleWord)
    .join(" ");
}

// Display names belong at the presentation boundary. IDs such as sable_coast
// remain untouched in API requests, persistence, filters and reward receipts.
// Keep this map in sync with the canonical Bot location registries.
export const LOCATION_NAMES = Object.freeze({
  "greenwind_plains": "Greenwind Plains",
  "whispering_caverns": "Whispering Caverns",
  "sable_coast": "Sable Coast",
  "magitek_wastes": "Magitek Wastes",
  "crystal_expanse": "Crystal Expanse",
  "riftlands": "Riftlands",
  "interdimensional_rift": "Interdimensional Rift",
  "omega_ruins": "Omega Ruins",
  "eclipsed_singularity_citadel": "Eclipsed Singularity Citadel",
  "emerald_wilds": "Emerald Wilds",
  "ashen_highlands": "Ashen Highlands",
  "mistfen_marshes": "Mistfen Marshes",
  "frostveil_reach": "Frostveil Reach",
  "astral_scar": "The Astral Scar"
});

export function locationLabel(value, fallback = "Unknown location") {
  if (value === null || value === undefined || value === "") return fallback;
  const raw = typeof value === "object" ? value.name || value.id : value;
  if (raw === null || raw === undefined || !String(raw).trim()) return fallback;
  const name = String(raw).trim();
  return LOCATION_NAMES[name.toLowerCase()] || humanizeLabel(name, fallback);
}

export function locationList(values) {
  return Array.isArray(values) ? values.map((value) => locationLabel(value)).join(" · ") : "";
}

export function metricLabel(value) {
  return humanizeLabel(value, "Progress");
}

export function activitySourceLabel(value) {
  if (value === null || value === undefined || value === "") return "Guild Activity";
  const parts = String(value).split(":").filter(Boolean);
  if (parts.length <= 1) return humanizeLabel(value, "Guild Activity");
  return parts.map((part) => humanizeLabel(part)).join(" · ");
}
