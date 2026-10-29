// Market comparisons are informational only: no suggested prices or auto-pricing.
// At least three completed sales are needed before a directional label appears.
export function recentPricePosition(askingPrice, stats) {
  const count = Number(stats?.sale_count || 0);
  const average = Number(stats?.average_price || 0);
  const price = Number(askingPrice);
  if (count < 3 || !Number.isFinite(average) || average <= 0 || !Number.isFinite(price) || price <= 0) return null;
  const delta = (price - average) / average;
  const percent = Math.round(Math.abs(delta) * 100);
  if (delta < -0.1) return { tone: "below", label: `${percent}% below recent average` };
  if (delta > 0.1) return { tone: "above", label: `${percent}% above recent average` };
  return { tone: "near", label: "Near recent average" };
}

export function marketDate(epochSeconds) {
  const seconds = Number(epochSeconds);
  if (!Number.isFinite(seconds) || seconds <= 0) return "Unknown date";
  return new Date(seconds * 1000).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
