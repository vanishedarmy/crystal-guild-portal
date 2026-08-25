const MONSTER_PORTRAITS = {
  goblin: "/retro-phase-ii/monster-portraits-v2/goblin.webp",
  wolf: "/retro-phase-ii/monster-portraits-v2/wolf.webp",
  mandragora: "/retro-phase-ii/monster-portraits-v2/mandragora.webp",
  goblin_chieftain: "/retro-phase-ii/monster-portraits-v2/goblin_chieftain.webp",
  goblin_guard: "/retro-phase-ii/monster-portraits-v2/goblin_guard.webp",
  hornet: "/retro-phase-ii/monster-portraits-v2/hornet.webp",
  flan: "/retro-phase-ii/monster-portraits-v2/flan.webp",
  imp: "/retro-phase-ii/monster-portraits-v2/imp.webp",
  dire_wolf_alpha: "/retro-phase-ii/monster-portraits-v2/dire_wolf_alpha.webp",
  bomb: "/retro-phase-ii/monster-portraits-v2/bomb.webp",
  cockatrice: "/retro-phase-ii/monster-portraits-v2/cockatrice.webp",
  bat: "/retro-phase-ii/monster-portraits-v2/bat.webp",
  queen_hornet: "/retro-phase-ii/monster-portraits-v2/queen_hornet.webp",
  ochu: "/retro-phase-ii/monster-portraits-v2/ochu.webp",
  skeleton: "/retro-phase-ii/monster-portraits-v2/skeleton.webp",
  cactuar: "/retro-phase-ii/monster-portraits-v2/cactuar.webp",
  ossuary_knight: "/retro-phase-ii/monster-portraits-v2/ossuary_knight.webp",
  spriggan: "/retro-phase-ii/monster-portraits-v2/spriggan.webp",
  basilisk: "/retro-phase-ii/monster-portraits-v2/basilisk.webp",
  crimson_detonator: "/retro-phase-ii/monster-portraits-v2/crimson_detonator.webp",
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
