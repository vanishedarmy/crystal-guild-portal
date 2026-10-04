import LockIcon from "../components/LockIcon.jsx";
import { useEffect, useMemo, useRef, useState } from "react";
import ItemArtwork from "../components/ItemArtwork.jsx";
import { number } from "../utils/formatters.js";
import { beginQuantityEdit, clampQuantity, finishQuantityEdit, quantityInputValue, updateQuantityInput } from "../utils/quantityInput.js";
import "../styles/crafting-194.css";

import { CRAFTING_CATEGORIES, filterCraftingRecipes, readable } from "../utils/craftingFilters.js";

function readFavorites(username) {
  try {
    const raw = window.localStorage.getItem(`crystal-crafting-favorites:${username || "local"}`);
    const list = JSON.parse(raw || "[]");
    return Array.isArray(list) ? list.filter((id) => typeof id === "string").slice(0, 300) : [];
  } catch { return []; }
}

export default function CraftingWorkbench({ recipes = [], categories = {}, username, query = "", quantities, setQuantities, busyKey, actionsAvailable, onCraft }) {
  const [category, setCategory] = useState("field");
  const [subcategory, setSubcategory] = useState("all");
  const [craftableOnly, setCraftableOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sort, setSort] = useState("level");
  const [selectedId, setSelectedId] = useState("");
  const [favorites, setFavorites] = useState(() => readFavorites(username));
  const [comfortable, setComfortable] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [mobileDetail, setMobileDetail] = useState(false);
  const detailRef = useRef(null);

  useEffect(() => { setFavorites(readFavorites(username)); }, [username]);
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  const subcategories = useMemo(() => [...new Set(recipes.filter((recipe) => category === "all" || recipe.category === category).map((recipe) => recipe.subcategory).filter(Boolean))].sort(), [category, recipes]);
  const filtered = useMemo(() => filterCraftingRecipes(recipes, { category, search: query, subcategory, craftableOnly, favoritesOnly, favorites, sort }), [recipes, category, query, subcategory, craftableOnly, favoritesOnly, favorites, sort]);
  const selected = filtered.find((recipe) => recipe.id === selectedId) || filtered[0] || null;
  const maximum = Math.max(0, Number(selected?.max_quantity || 0));
  const quantity = selected ? clampQuantity(quantities[selected.id] ?? 1, Math.max(1, maximum)) : 1;
  const readyCount = filtered.filter((recipe) => recipe.craftable).length;

  const toggleFavorite = (recipeId) => {
    const next = favoriteSet.has(recipeId) ? favorites.filter((id) => id !== recipeId) : [...favorites, recipeId];
    setFavorites(next);
    try { window.localStorage.setItem(`crystal-crafting-favorites:${username || "local"}`, JSON.stringify(next)); } catch { /* Optional local preference, never blocks crafting. */ }
  };

  const selectRecipe = (id) => {
    setSelectedId(id);
    setMobileDetail(true);
    window.requestAnimationFrame(() => detailRef.current?.focus({ preventScroll: false }));
  };

  return (
    <section id="blacksmith-active-panel" role="tabpanel" tabIndex="0" aria-labelledby="blacksmith-tab-recipes" className={`crafting-workbench ${comfortable ? "comfortable" : "compact"} ${highContrast ? "high-contrast" : ""} ${mobileDetail ? "mobile-detail" : ""}`}>
      <header className="crafting-intro">
        <div><p className="eyebrow">Crafting Reforged</p><h3>The Crafting Workbench</h3><p>Choose a recipe, inspect your ingredients, and craft what you need. Forge upgrades and resynthesis remain separate services.</p></div>
        <div className="crafting-progress"><strong>{number(recipes.length)}</strong><span>known recipes</span><small>{number(readyCount)} ready in this view</small></div>
      </header>
      <div className="crafting-category-grid" role="group" aria-label="Recipe categories">
        {CRAFTING_CATEGORIES.map((entry) => (
          <button type="button" key={entry.id} className={category === entry.id ? "active" : ""} aria-pressed={category === entry.id} onClick={() => { setCategory(entry.id); setSubcategory("all"); setMobileDetail(false); }}>
            <strong>{entry.label}</strong><span>{number(categories[entry.id]?.known ?? recipes.filter((recipe) => recipe.category === entry.id).length)} known · {number(categories[entry.id]?.craftable || 0)} ready</span>
          </button>
        ))}
      </div>
      <div className="crafting-filterbar" aria-label="Filter crafting recipes">
        <label>Type<select value={subcategory} onChange={(event) => { setSubcategory(event.target.value); setMobileDetail(false); }}><option value="all">All types</option>{subcategories.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label>Sort<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="level">Level: low to high</option><option value="high">Level: high to low</option><option value="name">Name: A to Z</option><option value="ready">Craftable first</option></select></label>
        <label className="crafting-check"><input type="checkbox" checked={craftableOnly} onChange={(event) => { setCraftableOnly(event.target.checked); setMobileDetail(false); }}/><span>Can craft now</span></label>
        <label className="crafting-check"><input type="checkbox" checked={favoritesOnly} onChange={(event) => { setFavoritesOnly(event.target.checked); setMobileDetail(false); }}/><span>Favorites only</span></label>
        <div className="crafting-display-controls" role="group" aria-label="Visual accessibility options">
          <button type="button" aria-pressed={comfortable} onClick={() => setComfortable((value) => !value)}>{comfortable ? "Comfortable text" : "Compact text"}</button>
          <button type="button" aria-pressed={highContrast} onClick={() => setHighContrast((value) => !value)}>{highContrast ? "Standard contrast" : "High contrast"}</button>
        </div>
      </div>
      <div className="crafting-layout">
        <section className="crafting-directory" tabIndex="-1" aria-label="Recipe results">
          <div className="crafting-directory-heading"><h4>Recipes</h4><span aria-live="polite">{number(filtered.length)} found</span></div>
          {filtered.length ? <div className="crafting-list">
            {filtered.map((recipe) => (
              <div className={`crafting-list-row ${selected?.id === recipe.id ? "selected" : ""}`} key={recipe.id}>
                <button className="crafting-pick" type="button" aria-pressed={selected?.id === recipe.id} onClick={() => selectRecipe(recipe.id)}>
                  <span><strong>{recipe.output?.name || recipe.name}</strong><small>{recipe.subcategory || readable(recipe.category)} · Lv. {number(recipe.min_level)}</small></span>
                  <span className={`crafting-status ${recipe.craftable ? "ready" : "unavailable"}`}>{recipe.craftable ? `Ready · ${number(recipe.max_quantity)}` : recipe.level_ready ? "Need materials" : <LockIcon label="Recipe locked: level requirement not met" />}</span>
                </button>
                <button className="crafting-favorite" type="button" aria-pressed={favoriteSet.has(recipe.id)} onClick={() => toggleFavorite(recipe.id)} aria-label={`${favoriteSet.has(recipe.id) ? "Remove" : "Add"} ${recipe.output?.name || recipe.name} ${favoriteSet.has(recipe.id) ? "from" : "to"} favorites`} title={favoriteSet.has(recipe.id) ? "Remove favorite" : "Add favorite"}>{favoriteSet.has(recipe.id) ? "★" : "☆"}</button>
              </div>
            ))}
          </div> : <p className="crafting-empty" role="status">No known recipes match these filters. Try another type, search term, or turn off “Can craft now.”</p>}
        </section>
        <section className="crafting-detail" id="crafting-detail" ref={detailRef} tabIndex="-1" aria-label="Selected recipe details">
          <button type="button" className="crafting-mobile-back" onClick={() => { setMobileDetail(false); window.requestAnimationFrame(() => document.querySelector(".crafting-directory")?.focus()); }}>← Back to recipes</button>
          {!selected ? <div className="crafting-empty" role="status">Select a recipe to inspect its materials and resulting item.</div> : <>
            <div className="crafting-selected-head">
              <ItemArtwork item={selected.output} className="crafting-selected-art" decorative={false} />
              <div><span className="slot-label">{selected.subcategory || readable(selected.category)} · Recipe Lv. {number(selected.min_level)}</span><h4 className={`rarity-${selected.output?.rarity || "common"}`}>{selected.output?.name || selected.name}</h4><p>Creates ×{number(selected.output?.quantity || 1)} · Owned {number(selected.output?.owned || 0)}</p></div>
              <span className={`crafting-status ${selected.craftable ? "ready" : "unavailable"}`}>{selected.craftable ? "Ready" : "Requirements missing"}</span>
            </div>
            {selected.output?.description ? <p className="crafting-item-description">{selected.output.description}</p> : null}
            {["weapon", "armor", "accessory"].includes(selected.output?.type) ? <div className="crafting-gear-preview"><h5>Equipment preview</h5><p>Equip Lv. {number(selected.output?.min_level || 1)}{selected.output?.gear_family ? ` · ${readable(selected.output.gear_family)}` : ""}</p>
              <div className="crafting-stat-grid">{Object.entries(selected.output?.bonuses || {}).map(([stat, value]) => <span key={stat}><strong>{readable(stat)}</strong><b>{Number(value) >= 0 ? "+" : ""}{number(value)}</b></span>)}</div>
              {(selected.output?.allowed_jobs || []).length ? <p><strong>Compatible Jobs:</strong> {selected.output.allowed_jobs.map(readable).join(", ")}</p> : null}
            </div> : null}
            <div className="crafting-section-title"><h5>Required ingredients</h5><span>For {quantity} craft{quantity === 1 ? "" : "s"}</span></div>
            <div className="crafting-ingredients">
              {(selected.materials || []).map((material) => {
                const need = Number(material.quantity || 0) * quantity;
                const available = Math.max(0, Number(material.owned || 0) - Number(material.reserved || 0));
                const enough = available >= need;
                return <div key={material.item_id} className={`crafting-ingredient ${enough ? "enough" : "missing"}`}>
                  <ItemArtwork item={material} className="blacksmith-material-artwork" />
                  <div><strong>{material.name}</strong><small>{enough ? "Ready" : material.reserved && Number(material.owned || 0) >= need ? "Equipped copy reserved" : `Need ${number(Math.max(0, need - available))} more`}</small>{(material.source_hints || []).length ? <details><summary>Where to find</summary><ul>{material.source_hints.map((hint) => <li key={hint}>{hint}</li>)}</ul></details> : null}</div>
                  <strong className="crafting-ingredient-qty">{number(available)} / {number(need)}</strong>
                </div>;
              })}
            </div>
            <div className="crafting-cost-summary"><strong>Total currency</strong><span>{number(Number(selected.gil_each || 0) * quantity)} Gil{Number(selected.seals_each || 0) ? ` · ${number(Number(selected.seals_each || 0) * quantity)} Seals` : ""}</span></div>
            {!selected.craftable ? <div className="crafting-requirements" role="status"><strong>Before you can craft:</strong><ul>{(selected.missing_requirements || []).length ? selected.missing_requirements.map((reason) => <li key={reason}>{reason}</li>) : <li>Check your current inventory and character status.</li>}</ul></div> : null}
            <div className="crafting-create-row">
              <label>Craft quantity<input type="number" inputMode="numeric" min="1" max={Math.max(1, maximum)} value={quantityInputValue(quantities, selected.id)} disabled={maximum < 1} onFocus={() => beginQuantityEdit(setQuantities, quantities, selected.id)} onChange={(event) => updateQuantityInput(setQuantities, selected.id, event.target.value, Math.max(1, maximum))} onBlur={(event) => finishQuantityEdit(setQuantities, selected.id, event.target.value, Math.max(1, maximum))} /></label>
              <div className="crafting-quantity-shortcuts" role="group" aria-label="Craft quantity shortcuts">{[1, 5, 10, maximum].filter((value, index, values) => value > 0 && value <= Math.max(1, maximum) && values.indexOf(value) === index).map((value) => <button type="button" key={value} onClick={() => setQuantities((current) => ({ ...current, [selected.id]: String(value) }))} aria-label={`Set quantity to ${value}`}>{value === maximum && value !== 1 ? `Max ${value}` : value}</button>)}</div>
              <button type="button" className="equipment-action-button crafting-submit" disabled={!actionsAvailable || !selected.craftable || maximum < 1 || Boolean(busyKey)} onClick={() => onCraft(selected)}>{busyKey === `craft:${selected.id}` ? "Crafting…" : `Craft ${selected.output?.name || "item"} × ${number(quantity * Number(selected.output?.quantity || 1))}`}</button>
            </div>
            <p className="crafting-safety-note">Materials and currency are checked again before every craft. Maximum 20 crafts per request.</p>
          </>}
        </section>
      </div>
    </section>
  );
}
