export function completionViewForHash(hash) {
  const value = String(hash || "").toLowerCase();
  if (value === "#titles") return "titles";
  if (value === "#achievements") return "achievements";
  return null;
}
