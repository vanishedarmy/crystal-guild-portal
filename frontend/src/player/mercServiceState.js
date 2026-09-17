export const MERC_ART_ROOT = "/merc-service/a1";

export function mercContractsList(source) {
  if (Array.isArray(source)) return source.filter(Boolean);
  if (Array.isArray(source?.contracts)) return source.contracts.filter(Boolean);
  if (source?.contract) return [source.contract];
  if (source?.hero_id && source?.mission_type) return [source];
  return [];
}

export function mercContractForMission(source, missionType) {
  const mission = String(missionType || "").toLowerCase();
  return mercContractsList(source).find((contract) => String(contract?.mission_type || "").toLowerCase() === mission) || null;
}

export function mercContractForHero(source, heroId) {
  const id = String(heroId || "").toLowerCase();
  return mercContractsList(source).find((contract) => String(contract?.hero_id || "").toLowerCase() === id) || null;
}

export function mercHeroUiState(hero, source, selectedMission = "") {
  const contracted = mercContractForHero(source, hero?.id);
  if (contracted) return "contracted";
  if (!hero?.available) return "locked";
  const mission = String(selectedMission || "").toLowerCase();
  if (!mission) {
    const hireable = Array.isArray(hero?.hireable_mission_types) ? hero.hireable_mission_types : hero?.mission_types;
    return Array.isArray(hireable) && hireable.length ? "available" : "unavailable";
  }
  if (mercContractForMission(source, mission)) return "unavailable";
  const missions = Array.isArray(hero?.mission_types) ? hero.mission_types.map((value) => String(value).toLowerCase()) : [];
  return missions.includes(mission) ? "available" : "unavailable";
}

export function mercHeroCardArt(hero, source, selectedMission = "") {
  const heroId = String(hero?.id || "").toLowerCase();
  if (!heroId) return "";
  const uiState = mercHeroUiState(hero, source, selectedMission);
  const artState = uiState === "available" ? "available" : "unavailable";
  return `${MERC_ART_ROOT}/cards/${heroId}-${artState}.webp`;
}

export function mercHeroStatusLabel(hero, source, selectedMission = "") {
  const uiState = mercHeroUiState(hero, source, selectedMission);
  if (uiState === "contracted") return "CONTRACTED";
  if (uiState === "available") return "AVAILABLE";
  if (uiState === "locked") return "LOCKED";
  return "UNAVAILABLE";
}
