export const MERC_ART_ROOT = "/merc-service/a1";
export const MERC_EXPANSION_ART_ROOT = "/merc-service/a2";

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

export function mercMissionAvailability(hero, selectedMission = "") {
  const mission = String(selectedMission || "").toLowerCase();
  const record = hero?.mission_availability?.[mission];
  return record && typeof record === "object" ? record : null;
}

export function mercHeroUiState(hero, source, selectedMission = "") {
  const contracted = mercContractForHero(source, hero?.id);
  if (contracted) return contracted?.deployed || String(contracted?.state || "").toLowerCase() === "deployed" ? "deployed" : "contracted";
  if (hero?.recruitment?.required && !hero?.recruitment?.recruited) return "locked";
  if (!hero?.available) return "locked";
  const mission = String(selectedMission || "").toLowerCase();
  if (!mission) {
    const hireable = Array.isArray(hero?.hireable_mission_types) ? hero.hireable_mission_types : hero?.mission_types;
    return Array.isArray(hireable) && hireable.length ? "available" : "unavailable";
  }
  const backend = mercMissionAvailability(hero, mission);
  if (backend?.status) return String(backend.status).toLowerCase();
  if (mercContractForMission(source, mission)) return "unavailable";
  const missions = Array.isArray(hero?.mission_types) ? hero.mission_types.map((value) => String(value).toLowerCase()) : [];
  return missions.includes(mission) ? "available" : "unavailable";
}

export function mercHeroArtRoot(hero) {
  return String(hero?.art_set || "a1").toLowerCase() === "a2" ? MERC_EXPANSION_ART_ROOT : MERC_ART_ROOT;
}

export function mercHeroCardArt(hero, source, selectedMission = "") {
  const heroId = String(hero?.id || "").toLowerCase();
  if (!heroId) return "";
  const root = mercHeroArtRoot(hero);
  if (hero?.recruitment?.required && !hero?.recruitment?.recruited && root === MERC_EXPANSION_ART_ROOT) {
    return `${root}/cards/${heroId}-locked.webp`;
  }
  const uiState = mercHeroUiState(hero, source, selectedMission);
  const artState = uiState === "available" ? "available" : "unavailable";
  return `${root}/cards/${heroId}-${artState}.webp`;
}

export function mercRegistryCardArt(hero) {
  const heroId = String(hero?.id || "").toLowerCase();
  if (!heroId) return "";
  const root = mercHeroArtRoot(hero);
  if (hero?.recruitment?.required && !hero?.recruitment?.recruited && root === MERC_EXPANSION_ART_ROOT) {
    return `${root}/cards/${heroId}-locked.webp`;
  }
  return `${root}/cards/${heroId}-available.webp`;
}

export function mercHeroStatusLabel(hero, source, selectedMission = "") {
  const mission = String(selectedMission || "").toLowerCase();
  const uiState = mercHeroUiState(hero, source, mission);
  const contracted = mercContractForHero(source, hero?.id);
  if (uiState === "deployed") return contracted?.mission_type ? `${String(contracted.mission_type).toUpperCase()} DEPLOYED` : "DEPLOYED";
  if (uiState === "contracted") return contracted?.mission_type ? `ON ${String(contracted.mission_type).toUpperCase()}` : "CONTRACTED";
  if (uiState === "available") return "AVAILABLE";
  if (uiState === "locked") return hero?.recruitment?.required && !hero?.recruitment?.recruited ? "NOT RECRUITED" : "LOCKED";
  if (mercContractForMission(source, mission)) return `${mission.toUpperCase()} FULL`;
  const supported = Array.isArray(hero?.mission_types) ? hero.mission_types.map((value) => String(value).toLowerCase()) : [];
  if (mission && !supported.includes(mission)) return `NO ${mission.toUpperCase()}`;
  return "UNAVAILABLE";
}

export function mercHeroAvailabilityReason(hero, source, selectedMission = "") {
  const mission = String(selectedMission || "").toLowerCase();
  const contracted = mercContractForHero(source, hero?.id);
  if (contracted) {
    const label = String(contracted.mission_type || "assignment").replace(/^./, (c) => c.toUpperCase());
    return contracted?.deployed || String(contracted?.state || "").toLowerCase() === "deployed" ? `Deployed — ${label} in progress` : `On contract — ${label}`;
  }
  if (hero?.recruitment?.required && !hero?.recruitment?.recruited) {
    return hero?.recruitment?.hint || `Recruit through ${hero?.recruitment?.name || "the Merc Registry"}`;
  }
  const backend = mercMissionAvailability(hero, mission);
  if (backend?.reason) return String(backend.reason);
  if (!hero?.available) return hero?.locked_reason || `Requires Lv. ${Number(hero?.min_level || 1)} and ${Number(hero?.required_hunt_clears || 0)} Hunt clears`;
  const occupied = mercContractForMission(source, mission);
  if (occupied) return `${mission.replace(/^./, (c) => c.toUpperCase())} slot occupied by ${occupied.hero_name || "another Hero"}`;
  const supported = Array.isArray(hero?.mission_types) ? hero.mission_types.map((value) => String(value).toLowerCase()) : [];
  if (mission && !supported.includes(mission)) return `Does not accept ${mission.replace(/^./, (c) => c.toUpperCase())} contracts`;
  return mission ? `Available for ${mission.replace(/^./, (c) => c.toUpperCase())} · ${Number(hero?.fee_seals || 0)} Hunt Seals` : "Available";
}

export function mercRecruitmentStatusLabel(hero) {
  const recruitment = hero?.recruitment || {};
  if (!recruitment.required) return "FOUNDING ROSTER";
  if (recruitment.recruited) return "RECRUITED";
  if (recruitment.status === "payment_required") return "NEED GIL";
  if (recruitment.ready) return recruitment.kind === "contract" ? "CONTRACT READY" : "QUEST COMPLETE";
  return "LOCKED";
}
