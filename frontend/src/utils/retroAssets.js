const REGION_ART = {
  greenwind_plains: "/retro-phase2/region-greenwind.webp",
  whispering_caverns: "/retro-phase2/region-whispering.webp",
  sable_coast: "/retro-phase2/region-sable.webp",
  magitek_wastes: "/retro-phase2/region-magitek.webp",
  crystal_expanse: "/retro-phase2/region-crystal.webp",
  riftlands: "/retro-phase2/region-riftlands.webp",
  interdimensional_rift: "/retro-phase2/region-interdimensional.webp",
  omega_ruins: "/retro-phase2/region-omega.webp",
};

const JOB_SIGILS = {
  warrior: "⚔",
  monk: "✊",
  thief: "◆",
  blackmage: "✹",
  whitemage: "✚",
  redmage: "✦",
  paladin: "♜",
  darkknight: "♠",
  dragoon: "⚜",
  ninja: "✣",
  samurai: "刀",
  summoner: "◉",
  bluemage: "◇",
  timemage: "⌛",
  bard: "♫",
  machinist: "⚙",
  beastmaster: "♞",
  sage: "✧",
};

const JOB_NAME_IDS = Object.fromEntries([
  ["black mage", "blackmage"], ["white mage", "whitemage"], ["red mage", "redmage"],
  ["dark knight", "darkknight"], ["blue mage", "bluemage"], ["time mage", "timemage"],
  ...Object.keys(JOB_SIGILS).map((id) => [id, id]),
]);

const EQUIPMENT_ART = {
  weapon: "/retro-phase2/equipment-icon-1.webp",
  offhand: "/retro-phase2/equipment-icon-2.webp",
  shield: "/retro-phase2/equipment-icon-2.webp",
  armor: "/retro-phase2/equipment-icon-3.webp",
  accessory: "/retro-phase2/equipment-icon-4.webp",
  boots: "/retro-phase2/equipment-icon-5.webp",
};

function stableHash(value) {
  const text = String(value || "crystal-guild");
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function regionArt(regionId) {
  return REGION_ART[String(regionId || "").toLowerCase()] || "/retro-phase2/world-map.webp";
}

export function monsterToken(monster) {
  const key = String(typeof monster === "string" ? monster : monster?.id || monster?.name || "monster").toLowerCase();
  const families = [
    [1, /goblin|mandragora|flan|ochu|spriggan|cactuar|toad|plant|fung|slime/],
    [2, /wolf|behemoth|gigas|coeurl|basilisk|chimera|beast|lion|tiger|hound|antlion/],
    [3, /dragon|wyrm|wyvern|serpent|remora|sahagin|fish|leviathan|aquatic/],
    [4, /hornet|cockatrice|zu|gargoyle|bird|bat|imp|wing|harpy/],
    [5, /skeleton|ossuary|lich|ghost|undead|wraith|zombie|skull|tonberry|demon|mindflayer/],
    [6, /bomb|detonator|fire|flame|magma|malboro|blob/],
    [7, /golem|knight|guard|machina|magitek|omega|armor|construct|robot/],
  ];
  const matched = families.find(([, pattern]) => pattern.test(key));
  const index = matched?.[0] || ((stableHash(key) % 7) + 1);
  return `/retro-phase2/monster-token-${index}.webp`;
}

export function treasureArt(rarity) {
  const value = String(rarity || "common").toLowerCase();
  if (["legendary", "mythic", "relic"].includes(value)) return "/retro-phase2/chest-4.webp";
  if (["epic", "very rare"].includes(value)) return "/retro-phase2/chest-3.webp";
  if (["rare", "uncommon"].includes(value)) return "/retro-phase2/chest-2.webp";
  return "/retro-phase2/chest-1.webp";
}

export function jobIdFromName(job) {
  const raw = String(job?.id || job?.name || job || "").trim().toLowerCase();
  const compact = raw.replace(/[\s_-]+/g, "");
  return JOB_NAME_IDS[raw] || JOB_NAME_IDS[compact] || compact || "adventurer";
}

export function jobSigil(job) {
  return JOB_SIGILS[jobIdFromName(job)] || "✦";
}

export function jobTone(job) {
  const id = jobIdFromName(job);
  if (["whitemage", "paladin", "sage"].includes(id)) return "light";
  if (["blackmage", "darkknight", "ninja"].includes(id)) return "dark";
  if (["redmage", "samurai", "warrior"].includes(id)) return "warm";
  if (["bluemage", "timemage", "summoner"].includes(id)) return "arcane";
  if (["monk", "thief", "dragoon", "machinist", "beastmaster", "bard"].includes(id)) return "field";
  return "crystal";
}

export function equipmentArt(slot) {
  const id = String(slot || "").toLowerCase();
  if (id.includes("weapon")) return EQUIPMENT_ART.weapon;
  if (id.includes("off") || id.includes("shield")) return EQUIPMENT_ART.offhand;
  if (id.includes("armor") || id.includes("body") || id.includes("mail")) return EQUIPMENT_ART.armor;
  if (id.includes("boot") || id.includes("feet") || id.includes("greave")) return EQUIPMENT_ART.boots;
  return EQUIPMENT_ART.accessory;
}
