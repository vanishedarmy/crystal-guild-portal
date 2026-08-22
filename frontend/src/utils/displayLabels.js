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

export function metricLabel(value) {
  return humanizeLabel(value, "Progress");
}

export function activitySourceLabel(value) {
  if (value === null || value === undefined || value === "") return "Guild Activity";
  const parts = String(value).split(":").filter(Boolean);
  if (parts.length <= 1) return humanizeLabel(value, "Guild Activity");
  return parts.map((part) => humanizeLabel(part)).join(" · ");
}
