const MONSTER_PORTRAITS = {
  goblin: "/retro-phase-ii/monster-portraits-v1/goblin.webp",
  wolf: "/retro-phase-ii/monster-portraits-v1/wolf.webp",
  mandragora: "/retro-phase-ii/monster-portraits-v1/mandragora.webp",
  goblin_chieftain: "/retro-phase-ii/monster-portraits-v1/goblin_chieftain.webp",
  goblin_guard: "/retro-phase-ii/monster-portraits-v1/goblin_guard.webp",
  hornet: "/retro-phase-ii/monster-portraits-v1/hornet.webp",
  flan: "/retro-phase-ii/monster-portraits-v1/flan.webp",
  imp: "/retro-phase-ii/monster-portraits-v1/imp.webp",
  dire_wolf_alpha: "/retro-phase-ii/monster-portraits-v1/dire_wolf_alpha.webp",
  bomb: "/retro-phase-ii/monster-portraits-v1/bomb.webp",
};

export function normalizeMonsterId(monster) {
  const raw = typeof monster === "string" ? monster : monster?.id;
  return String(raw || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export function monsterPortraitPath(monster) {
  return MONSTER_PORTRAITS[normalizeMonsterId(monster)] || "";
}

export function hasMonsterPortrait(monster) {
  return Boolean(monsterPortraitPath(monster));
}

export function monsterPortraitEntries() {
  return Object.entries(MONSTER_PORTRAITS);
}
