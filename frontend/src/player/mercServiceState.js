export const MERC_ART_ROOT = "/merc-service/a1";

export function mercHeroUiState(hero, contract) {
  const heroId = String(hero?.id || "").toLowerCase();
  const contractHeroId = String(contract?.hero_id || "").toLowerCase();
  if (heroId && contractHeroId && heroId === contractHeroId) return "contracted";
  return hero?.available ? "available" : "locked";
}

export function mercHeroCardArt(hero, contract) {
  const heroId = String(hero?.id || "").toLowerCase();
  if (!heroId) return "";
  const uiState = mercHeroUiState(hero, contract);
  const artState = uiState === "available" ? "available" : "unavailable";
  return `${MERC_ART_ROOT}/cards/${heroId}-${artState}.webp`;
}

export function mercHeroStatusLabel(hero, contract) {
  const uiState = mercHeroUiState(hero, contract);
  if (uiState === "contracted") return "CONTRACTED";
  if (uiState === "available") return "AVAILABLE";
  return "LOCKED";
}
