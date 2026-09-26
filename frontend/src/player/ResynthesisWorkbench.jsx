import { useEffect, useMemo, useRef, useState } from "react";
import ItemArtwork from "../components/ItemArtwork.jsx";
import { number } from "../utils/formatters.js";
import { RESYNTHESIS_CATEGORIES, filterResynthesisItems } from "../utils/resynthesisFilters.js";
import { readable } from "../utils/craftingFilters.js";
import "../styles/crafting-194.css";
import "../styles/resynthesis-1942.css";

function readFavorites(username) {
  try {
    const raw = window.localStorage.getItem(`crystal-resynthesis-favorites:${username || "local"}`);
    const ids = JSON.parse(raw || "[]");
    return Array.isArray(ids) ? ids.filter((id) => typeof id === "string").slice(0, 300) : [];
  } catch { return []; }
}

export default function ResynthesisWorkbench({
  items = [], count = 0, username, query = "", busyKey = "", actionsAvailable = false, onResynthesize,
}) {
  const [category, setCategory] = useState("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState("ready");
  const [selectedId, setSelectedId] = useState("");
  const [favorites, setFavorites] = useState(() => readFavorites(username));
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [comfortable, setComfortable] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [mobileDetail, setMobileDetail] = useState(false);
  const directoryRef = useRef(null);
  const detailRef = useRef(null);

  useEffect(() => { setFavorites(readFavorites(username)); }, [username]);
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  const eligibleCount = useMemo(() => items.filter((item) => item.resynthesizable).length, [items]);
  const filtered = useMemo(() => filterResynthesisItems(items, {
    category, availableOnly, search: query, sort,
  }).filter((item) => !favoritesOnly || favoriteSet.has(item.item_id)), [items, category, availableOnly, query, sort, favoritesOnly, favoriteSet]);
  const selected = filtered.find((item) => item.item_id === selectedId) || filtered[0] || null;
  const available = Math.max(0, Number(selected?.available_copies || 0));
  const busy = Boolean(busyKey);

  const select = (id) => {
    setSelectedId(id);
    setMobileDetail(true);
    window.requestAnimationFrame(() => detailRef.current?.focus());
  };
  const toggleFavorite = (id) => {
    const next = favoriteSet.has(id) ? favorites.filter((value) => value !== id) : [...favorites, id];
    setFavorites(next);
    try { window.localStorage.setItem(`crystal-resynthesis-favorites:${username || "local"}`, JSON.stringify(next)); }
    catch { /* Optional browser preference. */ }
  };

  return (
    <section id="blacksmith-active-panel" role="tabpanel" aria-labelledby="blacksmith-tab-resynthesis" tabIndex="0"
      className={`crafting-workbench resynthesis-workbench ${comfortable ? "comfortable" : "compact"} ${highContrast ? "high-contrast" : ""} ${mobileDetail ? "mobile-detail" : ""}`}>
      <header className="crafting-intro">
        <div><p className="eyebrow">Guild Workshop · Material Recovery</p><h3>Resynthesis Workbench</h3>
          <p>Select an unwanted weapon or piece of armor to inspect its guaranteed recovery before destroying one copy.</p></div>
        <div className="crafting-progress"><strong>{number(eligibleCount)}</strong><span>gear types available</span><small>{number(count)} items resynthesized</small></div>
      </header>

      <div className="crafting-category-grid resynthesis-category-grid" role="group" aria-label="Resynthesis gear categories">
        {RESYNTHESIS_CATEGORIES.map((entry) => {
          const inCategory = entry.id === "all" ? items : items.filter((item) => String(item.type).toLowerCase() === entry.id);
          return <button type="button" key={entry.id} className={category === entry.id ? "active" : ""} aria-pressed={category === entry.id}
            onClick={() => { setCategory(entry.id); setMobileDetail(false); }}>
            <strong>{entry.label}</strong><span>{number(inCategory.length)} gear types · {number(inCategory.filter((item) => item.resynthesizable).length)} available</span>
          </button>;
        })}
      </div>

      <div className="crafting-filterbar" aria-label="Filter resynthesis gear">
        <label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="level">Level: low to high</option><option value="high">Level: high to low</option>
          <option value="name">Name: A to Z</option><option value="upgrade">Highest forge level</option><option value="ready">Available first</option>
        </select></label>
        <label className="crafting-check"><input type="checkbox" checked={availableOnly} onChange={(event) => { setAvailableOnly(event.target.checked); setMobileDetail(false); }} /><span>Available to resynthesize</span></label>
        <label className="crafting-check"><input type="checkbox" checked={favoritesOnly} onChange={(event) => { setFavoritesOnly(event.target.checked); setMobileDetail(false); }} /><span>Favorites only</span></label>
        <div className="crafting-display-controls" role="group" aria-label="Visual accessibility options">
          <button type="button" aria-pressed={comfortable} onClick={() => setComfortable((value) => !value)}>{comfortable ? "Comfortable text" : "Compact text"}</button>
          <button type="button" aria-pressed={highContrast} onClick={() => setHighContrast((value) => !value)}>{highContrast ? "Standard contrast" : "High contrast"}</button>
        </div>
      </div>
      <div className="resynthesis-warning" role="note"><strong>Permanent destruction:</strong> Only weapons and armor are eligible; Relic and Artifact gear remains protected. Each action destroys one selected copy and requires confirmation.</div>

      <div className="crafting-layout resynthesis-layout">
        <section className="crafting-directory" ref={directoryRef} tabIndex="-1" aria-label="Resynthesis gear results">
          <div className="crafting-directory-heading"><h4>Equipment</h4><span aria-live="polite">{number(filtered.length)} found</span></div>
          {filtered.length ? <div className="crafting-list">
            {filtered.map((item) => (
              <div className={`crafting-list-row resynthesis-list-row ${selected?.item_id === item.item_id ? "selected" : ""}`} key={item.item_id}>
                <button type="button" className="crafting-pick resynthesis-pick" aria-pressed={selected?.item_id === item.item_id} onClick={() => select(item.item_id)}>
                  <ItemArtwork item={item} className="resynthesis-list-art" />
                  <span className="resynthesis-list-text"><strong className={`rarity-${item.rarity || "common"}`}>{item.name}{Number(item.upgrade_level || 0) ? ` +${number(item.upgrade_level)}` : ""}</strong>
                    <small>{readable(item.type)} · Lv. {number(item.min_level)} · Owned {number(item.owned)}{item.equipped ? " · Equipped" : ""}</small>
                    <span className={`crafting-status ${item.resynthesizable ? "ready" : "unavailable"}`}>{item.resynthesizable ? `Available · ${number(item.available_copies)}` : "Unavailable"}</span>
                  </span>
                </button>
                <button type="button" className="crafting-favorite" aria-pressed={favoriteSet.has(item.item_id)} onClick={() => toggleFavorite(item.item_id)}
                  aria-label={`${favoriteSet.has(item.item_id) ? "Remove" : "Add"} ${item.name} ${favoriteSet.has(item.item_id) ? "from" : "to"} favorites`}>{favoriteSet.has(item.item_id) ? "★" : "☆"}</button>
              </div>
            ))}
          </div> : <p className="crafting-empty" role="status">No equipment matches these filters. Try another category, search term, or turn off the availability filter.</p>}
        </section>

        <section className="crafting-detail resynthesis-detail" ref={detailRef} tabIndex="-1" aria-label="Selected gear recovery details">
          <button type="button" className="crafting-mobile-back" onClick={() => { setMobileDetail(false); window.requestAnimationFrame(() => directoryRef.current?.focus()); }}>← Back to equipment</button>
          {!selected ? <p className="crafting-empty" role="status">Select a weapon or armor piece to preview its recovery materials.</p> : <>
            <div className="crafting-selected-head">
              <ItemArtwork item={selected} className="crafting-selected-art" decorative={false} />
              <div><span className="slot-label">{readable(selected.type)} · Lv. {number(selected.min_level)}{selected.equipped ? " · Equipped" : ""}</span>
                <h4 className={`rarity-${selected.rarity || "common"}`}>{selected.name}{Number(selected.upgrade_level || 0) ? ` +${number(selected.upgrade_level)}` : ""}</h4>
                <p>Owned {number(selected.owned)} · Available {number(available)}{selected.upgrade_level ? ` · Forge +${number(selected.upgrade_level)}` : ""}</p></div>
              <span className={`crafting-status ${selected.resynthesizable ? "ready" : "unavailable"}`}>{selected.resynthesizable ? "Ready" : "Unavailable"}</span>
            </div>
            <div className="crafting-section-title"><h5>Guaranteed material recovery</h5><span>From one gear copy</span></div>
            <div className="crafting-ingredients resynthesis-materials">
              {(selected.recovery || []).map((material) => (
                <div className="crafting-ingredient enough" key={material.item_id}>
                  <ItemArtwork item={{ ...material, type: "material" }} className="blacksmith-material-artwork" />
                  <div><strong>{material.name}</strong><small>Returned to your inventory</small></div>
                  <strong className="crafting-ingredient-qty">× {number(material.quantity)}</strong>
                </div>
              ))}
            </div>
            {Number(selected.upgrade_level || 0) > 0 && Number(selected.owned || 0) > 1 ? <p className="crafting-safety-note">Forge-material recovery applies only when your final owned copy is broken down.</p> : null}
            {!selected.resynthesizable ? <div className="crafting-requirements" role="status"><strong>Currently unavailable</strong><p>{selected.reason || "No copies are currently eligible for resynthesis."}</p></div> : null}
            <div className="resynthesis-confirm-box">
              <strong>Destroy one copy of {selected.name}?</strong>
              <p>Resynthesis is permanent and cannot be undone. The Bot checks ownership, equipment protection and recovery again when you confirm.</p>
              <button type="button" className="equipment-action-button resynthesis-submit" disabled={!actionsAvailable || !selected.resynthesizable || available < 1 || busy}
                onClick={() => onResynthesize(selected)}>{busyKey === `resynthesis:${selected.item_id}` ? "Resynthesizing…" : selected.resynthesizable ? `Resynthesize ${selected.name}` : "Resynthesis unavailable"}</button>
            </div>
          </>}
        </section>
      </div>
    </section>
  );
}
