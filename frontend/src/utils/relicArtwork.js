import { itemArtworkPath } from "./itemArtwork.js";
const RELIC_ART_BASE = "/retro-phase-iii/relic-weapons-v2";

const RELIC_IDS = new Set([
  "gae_bolg",
  "excalibur",
  "apocalypse",
  "godhand",
  "masamune",
  "stardust_rod",
  "nirvana",
  "last_knife",
  "bravura",
  "murgleis",
  "yoshimitsu",
  "veil_of_wiyu",
  "almace",
  "chronos",
  "artemis_bow",
  "armageddon",
  "guttler",
  "astral_codex",
]);

const STAGE_SLUGS = { 1: "dormant", 2: "awakened", 3: "zenith" };

function slug(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function relicArtworkStage(relic = {}, stageOverride = null) {
  const raw = stageOverride ?? (relic.completed ? 3 : relic.stage);
  const value = Number(raw || 1);
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(3, Math.trunc(value)));
}

export function relicArtworkPath(relic = {}, stageOverride = null) {
  // Ultimate relics have their own illustrated Lv.90/95/99 forms.
  // The old UI deliberately reused classic Zenith art, which is no longer needed.
  if (relic.tier === "ultimate") {
    const relicId = slug(relic.id || relic.relic_id || "");
    const stage = relicArtworkStage(relic, stageOverride);
    const suffix = { 1: "awakened", 2: "transcendent", 3: "eternal" }[stage];
    const art = itemArtworkPath({ id: `${relicId}_${suffix}` });
    if (art) return art;
  }
  const id = slug(relic.artwork_relic_id || relic.id || relic.relic_id || relic.name);
  if (!RELIC_IDS.has(id)) return "";
  const stage = relicArtworkStage(relic, stageOverride);
  return `${RELIC_ART_BASE}/${id}_${STAGE_SLUGS[stage]}.webp`;
}

export { RELIC_ART_BASE, RELIC_IDS };
