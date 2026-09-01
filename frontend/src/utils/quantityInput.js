export function clampQuantity(value, maximum = 99) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 1;
  const max = Math.max(1, Number(maximum || 1));
  return Math.max(1, Math.min(max, parsed));
}

export function quantityInputValue(values, itemId) {
  return Object.prototype.hasOwnProperty.call(values, itemId) ? values[itemId] : "1";
}

export function beginQuantityEdit(setter, values, itemId) {
  const currentValue = Object.prototype.hasOwnProperty.call(values, itemId) ? values[itemId] : "1";
  if (String(currentValue || "1") === "1") {
    setter((current) => ({ ...current, [itemId]: "" }));
  }
}

export function updateQuantityInput(setter, itemId, rawValue, maximum = 99) {
  const raw = String(rawValue ?? "");
  if (raw === "") {
    setter((current) => ({ ...current, [itemId]: "" }));
    return;
  }
  const digits = raw.replace(/\D+/g, "");
  if (!digits) return;
  setter((current) => ({ ...current, [itemId]: String(clampQuantity(digits, maximum)) }));
}

export function finishQuantityEdit(setter, itemId, rawValue, maximum = 99) {
  setter((current) => ({ ...current, [itemId]: String(clampQuantity(rawValue, maximum)) }));
}
