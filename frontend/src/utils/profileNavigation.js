// Route current and historical Portal destinations to real profile tabs.
// Legacy What's New announcements intentionally continue working after tabs move.
const TOWN_SECTION = Object.freeze({
  shop: "shop",
  emporium: "shop",
  blacksmith: "blacksmith",
  chocobo: "chocobo",
  stable: "chocobo",
  market: "shop",
});
const LEGACY_TABS = Object.freeze({ adventure: "hunts", saucer: "gold_saucer" });

export function resolveProfileDestination(target, section = null) {
  const original = String(target || "overview").trim().toLowerCase();
  const actual = LEGACY_TABS[original] || original;
  if (actual === "town" || Object.hasOwn(TOWN_SECTION, actual)) {
    const chosen = TOWN_SECTION[String(section || "").toLowerCase()] || TOWN_SECTION[actual] || "shop";
    return { tab: "town", section: chosen };
  }
  return { tab: actual, section: null };
}
