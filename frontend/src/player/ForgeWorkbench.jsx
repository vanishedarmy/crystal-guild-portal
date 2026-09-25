import { useEffect, useMemo, useRef, useState } from "react";
import ItemArtwork from "../components/ItemArtwork.jsx";
import DisplayPreferenceControls from "../components/DisplayPreferenceControls.jsx";
import useDisplayPreferences from "../hooks/useDisplayPreferences.js";
import { number } from "../utils/formatters.js";
import { readable } from "../utils/craftingFilters.js";
import { FORGE_CATEGORIES, filterForgeItems, forgeUnavailableReasons } from "../utils/forgeFilters.js";
import "../styles/crafting-194.css";
import "../styles/forge-1943.css";

function readFavorites(username) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(`crystal-forge-favorites:${username || "local"}`) || "[]");
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string").slice(0, 300) : [];
  } catch { return []; }
}

export default function ForgeWorkbench({
  items = [], username, query = "", busyKey = "", actionsAvailable = false,
  combatLocked = false, gil = 0, forgeMax = 0, onForge,
}) {
  const [category, setCategory] = useState("all");
  const [forgeableOnly, setForgeableOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sort, setSort] = useState("type");
  const [selectedId, setSelectedId] = useState("");
  const [favorites, setFavorites] = useState(() => readFavorites(username));
  const { comfortable, highContrast } = useDisplayPreferences();
  const [mobileDetail, setMobileDetail] = useState(false);
  const [expanded, setExpanded] = useState({ forged: true, unforged: true });
  const directoryRef = useRef(null);
  const detailRef = useRef(null);

  useEffect(() => { setFavorites(readFavorites(username)); }, [username]);
  const grouped = useMemo(() => filterForgeItems(items, {
    category, search: query, forgeableOnly, favoritesOnly, favorites, sort,
  }), [items, category, query, forgeableOnly, favoritesOnly, favorites, sort]);
  const selected = grouped.ordered.find((item) => item.item_id === selectedId) || grouped.ordered[0] || null;
  const reasons = forgeUnavailableReasons(selected, { combatLocked, gil });
  const readyCount = grouped.ordered.filter((item) => item.forgeable).length;
  const totalReady = items.filter((item) => item.forgeable).length;
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  const busy = Boolean(busyKey);

  const select = (id) => {
    setSelectedId(id);
    setMobileDetail(true);
    window.requestAnimationFrame(() => detailRef.current?.focus());
  };
  const toggleFavorite = (id) => {
    const next = favoriteSet.has(id) ? favorites.filter((value) => value !== id) : [...favorites, id];
    setFavorites(next);
    try { window.localStorage.setItem(`crystal-forge-favorites:${username || "local"}`, JSON.stringify(next)); }
    catch { /* Optional browser preference. */ }
  };
  const renderRow = (item) => (
    <div className={`crafting-list-row forge-list-row ${selected?.item_id === item.item_id ? "selected" : ""}`} key={item.item_id}>
      <button type="button" className="crafting-pick forge-pick" aria-pressed={selected?.item_id === item.item_id} onClick={() => select(item.item_id)}>
        <ItemArtwork item={item} className="forge-list-art" />
        <span className="forge-list-text">
          <strong className={`rarity-${item.rarity || "common"}`}>{item.name}{Number(item.current_upgrade || 0) ? ` +${number(item.current_upgrade)}` : ""}</strong>
          <small>{readable(item.type)} · Lv. {number(item.min_level)} · Owned {number(item.owned)}{item.equipped ? " · Equipped" : ""}</small>
          <span className={`crafting-status ${item.forgeable ? "ready" : "unavailable"}`}>
            {item.maxed ? "MAX" : item.forgeable ? `Ready for +${number(item.next_upgrade)}` : `Next +${number(item.next_upgrade)}`}
          </span>
        </span>
      </button>
      <button type="button" className="crafting-favorite" aria-pressed={favoriteSet.has(item.item_id)} onClick={() => toggleFavorite(item.item_id)}
        aria-label={`${favoriteSet.has(item.item_id) ? "Remove" : "Add"} ${item.name} ${favoriteSet.has(item.item_id) ? "from" : "to"} favorites`} title={favoriteSet.has(item.item_id) ? "Remove favorite" : "Add favorite"}>
        {favoriteSet.has(item.item_id) ? "★" : "☆"}
      </button>
    </div>
  );

  return (
    <section id="blacksmith-active-panel" role="tabpanel" aria-labelledby="blacksmith-tab-forge" tabIndex="0"
      className={`crafting-workbench forge-workbench ${comfortable ? "comfortable" : "compact"} ${highContrast ? "high-contrast" : ""} ${mobileDetail ? "mobile-detail" : ""}`}>
      <header className="crafting-intro">
        <div><p className="eyebrow">Guild Workshop · Equipment Upgrades</p><h3>Forge Workbench</h3>
          <p>Your currently equipped gear stays first. Choose an item to inspect its next upgrade, required materials and final Gil fee.</p></div>
        <div className="crafting-progress"><strong>{number(items.length)}</strong><span>owned gear types</span><small>{number(totalReady)} ready · Max forge +{number(forgeMax)}</small></div>
      </header>
      <div className="crafting-category-grid forge-category-grid" role="group" aria-label="Forge equipment categories">
        {FORGE_CATEGORIES.map((entry) => {
          const inCategory = entry.id === "all" ? items : items.filter((item) => String(item.type).toLowerCase() === entry.id);
          return <button type="button" key={entry.id} className={category === entry.id ? "active" : ""} aria-pressed={category === entry.id}
            onClick={() => { setCategory(entry.id); setMobileDetail(false); }}>
            <strong>{entry.label}</strong><span>{number(inCategory.length)} gear types · {number(inCategory.filter((item) => item.forgeable).length)} ready</span>
          </button>;
        })}
      </div>
      <div className="crafting-filterbar" aria-label="Filter forge equipment">
        <label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="type">Type, then level</option><option value="high">Level: high to low</option><option value="name">Name: A to Z</option>
          <option value="upgrade">Highest forge level</option><option value="ready">Ready first</option>
        </select></label>
        <label className="crafting-check"><input type="checkbox" checked={forgeableOnly} onChange={(event) => { setForgeableOnly(event.target.checked); setMobileDetail(false); }}/><span>Can forge now</span></label>
        <label className="crafting-check"><input type="checkbox" checked={favoritesOnly} onChange={(event) => { setFavoritesOnly(event.target.checked); setMobileDetail(false); }}/><span>Favorites only</span></label>
        <div className="crafting-display-controls"><DisplayPreferenceControls /></div>
      </div>
      <div className="crafting-layout forge-layout">
        <section className="crafting-directory" ref={directoryRef} tabIndex="-1" aria-label="Forge gear results">
          <div className="crafting-directory-heading"><h4>Equipment</h4><span aria-live="polite">{number(grouped.ordered.length)} found · {number(readyCount)} ready</span></div>
          {grouped.ordered.length ? <div className="crafting-list forge-list">
            {grouped.equipped.length ? <section className="forge-directory-section forge-equipped" aria-label="Currently Equipped">
              <h5>Currently Equipped <span>{number(grouped.equipped.length)}</span></h5>
              {grouped.equipped.map(renderRow)}
            </section> : null}
            {[{ id: "forged", title: "Forged Gear", items: grouped.forged }, { id: "unforged", title: "Unforged Gear", items: grouped.unforged }].map((group) => group.items.length ?
              <details className="forge-directory-section forge-directory-disclosure" key={group.id} open={expanded[group.id]} onToggle={(event) => {
                const open = event.currentTarget.open;
                setExpanded((previous) => previous[group.id] === open ? previous : { ...previous, [group.id]: open });
              }}>
                <summary>{group.title} <span>{number(group.items.length)}</span></summary>
                {group.items.map(renderRow)}
              </details> : null)}
          </div> : <p className="crafting-empty" role="status">No equipment matches these filters. Try another type, material name or turn off “Can forge now.”</p>}
        </section>
        <section className="crafting-detail forge-detail" ref={detailRef} tabIndex="-1" aria-label="Selected gear forge details">
          <button type="button" className="crafting-mobile-back" onClick={() => { setMobileDetail(false); window.requestAnimationFrame(() => directoryRef.current?.focus()); }}>← Back to equipment</button>
          {!selected ? <p className="crafting-empty" role="status">Select equipment to preview its next forge upgrade.</p> : <>
            <div className="crafting-selected-head">
              <ItemArtwork item={selected} className="crafting-selected-art" decorative={false} />
              <div><span className="slot-label">{readable(selected.type)} · Lv. {number(selected.min_level)}{selected.equipped ? " · Equipped" : ""}</span>
                <h4 className={`rarity-${selected.rarity || "common"}`}>{selected.name} +{number(selected.current_upgrade)}</h4>
                <p>Owned {number(selected.owned)}{selected.equipped ? " · Actively equipped" : ""}</p>
              </div>
              <span className={`crafting-status ${selected.forgeable ? "ready" : "unavailable"}`}>{selected.maxed ? "MAX" : selected.forgeable ? "Ready" : "Requirements missing"}</span>
            </div>
            {selected.description ? <p className="crafting-item-description">{selected.description}</p> : null}
            {selected.bonuses && typeof selected.bonuses === "object" && !Array.isArray(selected.bonuses) && Object.keys(selected.bonuses).length ? <div className="crafting-gear-preview"><h5>Equipment stats</h5>
              <div className="crafting-stat-grid">{Object.entries(selected.bonuses).map(([stat, value]) => <span key={stat}><strong>{readable(stat)}</strong><b>{Number(value) >= 0 ? "+" : ""}{number(value)}</b></span>)}</div>
              {Array.isArray(selected.allowed_jobs) && selected.allowed_jobs.length ? <p><strong>Compatible Jobs:</strong> {selected.allowed_jobs.map(readable).join(", ")}</p> : null}
            </div> : null}
            {selected.maxed ? <div className="forge-level-preview forge-maxed" role="status"><strong>Maximum forge level reached</strong><span>+{number(selected.next_bonus_percent)}% equipment stat bonus over base</span></div> : <>
              <div className="forge-level-preview" aria-label="Forge upgrade preview">
                <div><small>Current</small><strong>+{number(selected.current_upgrade)}</strong></div><span aria-hidden="true">→</span>
                <div><small>After forging</small><strong>+{number(selected.next_upgrade)}</strong></div>
                <p>After forging: <strong>+{number(selected.next_bonus_percent)}%</strong> equipment stat bonus over base.</p>
              </div>
              <div className="crafting-section-title"><h5>Required materials</h5><span>For one upgrade</span></div>
              <div className="crafting-ingredients forge-materials">
                {(selected.materials || []).map((material) => <div className={`crafting-ingredient ${material.enough ? "enough" : "missing"}`} key={material.item_id}>
                  <ItemArtwork item={{ ...material, type: "material" }} className="blacksmith-material-artwork" />
                  <div><strong>{material.name}</strong><small>{material.enough ? "Ready" : `Need ${number(Math.max(0, Number(material.quantity || 0) - Number(material.owned || 0)))} more`}</small></div>
                  <strong className="crafting-ingredient-qty">{number(material.owned)} / {number(material.quantity)}</strong>
                </div>)}
              </div>
              <div className="crafting-cost-summary forge-cost"><strong>Forge fee</strong><span>{number(selected.effective_gil)} Gil{Number(selected.discount_gil || 0) > 0 ? <small>Workshop saves {number(selected.discount_gil)} Gil</small> : null}</span></div>
              {!selected.forgeable ? <div className="crafting-requirements" role="status"><strong>Before you can forge:</strong><ul>{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div> : null}
              <button type="button" className="equipment-action-button forge-submit" disabled={!actionsAvailable || !selected.forgeable || busy} onClick={() => onForge(selected)}>
                {busyKey === `forge:${selected.item_id}` ? "Forging…" : `Forge ${selected.name} to +${number(selected.next_upgrade)}`}
              </button>
              <p className="crafting-safety-note">Gil and materials are checked again before upgrading. Only one forge action can run at a time.</p>
            </>}
          </>}
        </section>
      </div>
    </section>
  );
}
