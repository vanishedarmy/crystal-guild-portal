const EQUIPMENT_TYPES = new Set(["weapon", "armor", "accessory"]);

export const TRADING_POST_TYPE_ORDER = new Map([
  ["weapon", 0],
  ["armor", 1],
  ["accessory", 2],
  ["consumable", 3],
  ["material", 4],
  ["item", 5],
]);

function itemFromEntry(entry) {
  return entry?.item || entry || {};
}

function itemLevel(item) {
  const value = Number(item?.min_level ?? item?.level ?? item?.shop_level);
  return Number.isFinite(value) ? value : Number.NEGATIVE_INFINITY;
}

function typeRank(entry) {
  const type = String(itemFromEntry(entry)?.type || "item").toLowerCase();
  return TRADING_POST_TYPE_ORDER.get(type) ?? 99;
}

export function compareTradingPostItems(left, right) {
  const leftItem = itemFromEntry(left);
  const rightItem = itemFromEntry(right);

  const typeDifference = typeRank(left) - typeRank(right);
  if (typeDifference) return typeDifference;

  const leftType = String(leftItem?.type || "item").toLowerCase();
  const rightType = String(rightItem?.type || "item").toLowerCase();
  const typeDifferenceFallback = leftType.localeCompare(rightType);
  if (typeDifferenceFallback) return typeDifferenceFallback;

  if (EQUIPMENT_TYPES.has(leftType)) {
    const levelDifference = itemLevel(rightItem) - itemLevel(leftItem);
    if (levelDifference) return levelDifference;
  }

  return String(leftItem?.name || "").localeCompare(String(rightItem?.name || ""));
}
