const MONSTER_PORTRAITS = {
  goblin: "/retro-phase-ii/monster-portraits-v3/goblin.webp",
  wolf: "/retro-phase-ii/monster-portraits-v3/wolf.webp",
  mandragora: "/retro-phase-ii/monster-portraits-v3/mandragora.webp",
  goblin_chieftain: "/retro-phase-ii/monster-portraits-v3/goblin_chieftain.webp",
  goblin_guard: "/retro-phase-ii/monster-portraits-v3/goblin_guard.webp",
  hornet: "/retro-phase-ii/monster-portraits-v3/hornet.webp",
  flan: "/retro-phase-ii/monster-portraits-v3/flan.webp",
  imp: "/retro-phase-ii/monster-portraits-v3/imp.webp",
  dire_wolf_alpha: "/retro-phase-ii/monster-portraits-v3/dire_wolf_alpha.webp",
  bomb: "/retro-phase-ii/monster-portraits-v3/bomb.webp",
  cockatrice: "/retro-phase-ii/monster-portraits-v3/cockatrice.webp",
  bat: "/retro-phase-ii/monster-portraits-v3/bat.webp",
  queen_hornet: "/retro-phase-ii/monster-portraits-v3/queen_hornet.webp",
  ochu: "/retro-phase-ii/monster-portraits-v3/ochu.webp",
  skeleton: "/retro-phase-ii/monster-portraits-v3/skeleton.webp",
  cactuar: "/retro-phase-ii/monster-portraits-v3/cactuar.webp",
  ossuary_knight: "/retro-phase-ii/monster-portraits-v3/ossuary_knight.webp",
  spriggan: "/retro-phase-ii/monster-portraits-v3/spriggan.webp",
  basilisk: "/retro-phase-ii/monster-portraits-v3/basilisk.webp",
  crimson_detonator: "/retro-phase-ii/monster-portraits-v3/crimson_detonator.webp",
  gigas: "/retro-phase-ii/monster-portraits-v3/gigas.webp",
  lamia: "/retro-phase-ii/monster-portraits-v3/lamia.webp",
  mimic: "/retro-phase-ii/monster-portraits-v3/mimic.webp",
  gargoyle: "/retro-phase-ii/monster-portraits-v3/gargoyle.webp",
  sahagin: "/retro-phase-ii/monster-portraits-v3/sahagin.webp",
  sahagin_prince: "/retro-phase-ii/monster-portraits-v3/sahagin_prince.webp",
  tonberry: "/retro-phase-ii/monster-portraits-v3/tonberry.webp",
  killer_fish: "/retro-phase-ii/monster-portraits-v3/killer_fish.webp",
  cactuar_jack: "/retro-phase-ii/monster-portraits-v3/cactuar_jack.webp",
  gigantoad: "/retro-phase-ii/monster-portraits-v3/gigantoad.webp",
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
