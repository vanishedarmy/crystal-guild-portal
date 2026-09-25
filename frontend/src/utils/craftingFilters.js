// Shared Crafting Reforged filters. Pure functions to keep large recipe catalogs responsive.
export const CRAFTING_CATEGORIES = [
  { id: "field", label: "Field Items", short: "Field Items" },
  { id: "weapons", label: "Weapons", short: "Weapons" },
  { id: "armor", label: "Armor", short: "Armor" },
  { id: "accessories", label: "Accessories", short: "Accessories" },
];

function readable(value) {
  return String(value || "").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function filterCraftingRecipes(recipes, { category = "field", search = "", subcategory = "all", craftableOnly = false, favoritesOnly = false, favorites = [], sort = "level" } = {}) {
  const needle = search.trim().toLowerCase();
  const favoriteSet = new Set(favorites);
  const filtered = recipes.filter((recipe) => {
    if (category !== "all" && recipe.category !== category) return false;
    if (subcategory !== "all" && recipe.subcategory !== subcategory) return false;
    if (craftableOnly && !recipe.craftable) return false;
    if (favoritesOnly && !favoriteSet.has(recipe.id)) return false;
    if (!needle) return true;
    return [recipe.name, recipe.output?.name, recipe.subcategory, ...(recipe.output?.allowed_jobs || []), ...(recipe.materials || []).map((material) => material.name)]
      .some((part) => String(part || "").toLowerCase().includes(needle));
  });
  return filtered.sort((a, b) => {
    if (sort === "name") return String(a.name).localeCompare(String(b.name));
    if (sort === "ready") return Number(b.craftable) - Number(a.craftable) || Number(a.min_level) - Number(b.min_level) || String(a.name).localeCompare(String(b.name));
    if (sort === "high") return Number(b.min_level) - Number(a.min_level) || String(a.name).localeCompare(String(b.name));
    return Number(a.min_level) - Number(b.min_level) || String(a.name).localeCompare(String(b.name));
  });
}

