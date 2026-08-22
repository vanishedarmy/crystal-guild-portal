let catalogPromise = null;

function hasEffects(use) {
  return Boolean(use && Array.isArray(use.effects) && use.effects.length);
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function mergeInventoryWithCatalog(payload, guideData) {
  if (!payload || !Array.isArray(payload.items)) return payload;
  const catalogItems = Array.isArray(guideData?.items) ? guideData.items : [];
  if (!catalogItems.length) return payload;

  const byId = new Map(catalogItems.filter((item) => item?.id).map((item) => [String(item.id), item]));
  const byName = new Map(catalogItems.filter((item) => item?.name).map((item) => [String(item.name).toLowerCase(), item]));

  return {
    ...payload,
    items: payload.items.map((item) => {
      const catalogItem = byId.get(String(item?.id || "")) || byName.get(String(item?.name || "").toLowerCase());
      if (!catalogItem) return item;

      return {
        ...catalogItem,
        ...item,
        type: hasText(item?.type) ? item.type : catalogItem.type,
        rarity: hasText(item?.rarity) ? item.rarity : catalogItem.rarity,
        description: hasText(item?.description) ? item.description : (catalogItem.description || ""),
        use: hasEffects(item?.use) ? item.use : (catalogItem.use || item?.use || null),
        bonuses: item?.bonuses && Object.keys(item.bonuses).length ? item.bonuses : (catalogItem.bonuses || item?.bonuses || {}),
        min_level: item?.min_level ?? catalogItem.min_level,
        allowed_jobs: Array.isArray(item?.allowed_jobs) && item.allowed_jobs.length ? item.allowed_jobs : (catalogItem.allowed_jobs || []),
        element: item?.element ?? catalogItem.element,
        on_hit_status: item?.on_hit_status ?? catalogItem.on_hit_status,
        lifesteal: item?.lifesteal ?? catalogItem.lifesteal,
        status_immune: Array.isArray(item?.status_immune) && item.status_immune.length ? item.status_immune : (catalogItem.status_immune || []),
        status_resist: item?.status_resist && Object.keys(item.status_resist).length ? item.status_resist : (catalogItem.status_resist || {}),
      };
    }),
  };
}

async function loadGuideData() {
  if (!catalogPromise) {
    catalogPromise = fetch("/guide-data.json?v=1.1.14-continuity1", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`Item catalog request failed: ${response.status}`);
        return response.json();
      })
      .catch((error) => {
        catalogPromise = null;
        throw error;
      });
  }
  return catalogPromise;
}

export async function enrichInventoryWithCatalog(payload) {
  try {
    const guideData = await loadGuideData();
    return mergeInventoryWithCatalog(payload, guideData);
  } catch {
    // Player inventory is still useful if the static catalog cannot be loaded.
    return payload;
  }
}
