import { useEffect, useMemo, useRef, useState } from "react";
import { TROPHY_CATALOG, TROPHY_CATEGORIES } from "./trophyCatalog.js";

const CATEGORY_LABELS = Object.fromEntries(TROPHY_CATEGORIES.map((item) => [item.id, item.label]));

function formatDate(value) {
  if (!value) return "Earned previously";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Earned previously";
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(date);
}

function seenKey(player) {
  return `crystal-guild:trophy-seen:${player?.username || player?.display_name || "adventurer"}`;
}

function readSeen(player) {
  try {
    const raw = window.localStorage.getItem(seenKey(player));
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

export default function TrophyHall({ data = {} }) {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("hall");
  const [selected, setSelected] = useState(null);
  const [seen, setSeen] = useState(() => readSeen(data.player));
  const selectedTrigger = useRef(null);

  useEffect(() => setSeen(readSeen(data.player)), [data.player?.username, data.player?.display_name]);

  const unlockedById = useMemo(
    () => new Map((data.unlocked || []).map((item) => [String(item.id), item])),
    [data.unlocked],
  );
  const unlockedCount = TROPHY_CATALOG.filter((trophy) => unlockedById.has(trophy.id)).length;
  const percent = Math.round((unlockedCount / TROPHY_CATALOG.length) * 100);
  const complete = unlockedCount === TROPHY_CATALOG.length;

  const categoryCounts = useMemo(() => {
    const result = {};
    for (const item of TROPHY_CATEGORIES) {
      const rows = item.id === "all" ? TROPHY_CATALOG : TROPHY_CATALOG.filter((trophy) => trophy.category === item.id);
      result[item.id] = {
        total: rows.length,
        unlocked: rows.filter((trophy) => unlockedById.has(trophy.id)).length,
      };
    }
    return result;
  }, [unlockedById]);

  const visible = useMemo(() => {
    const rows = category === "all" ? [...TROPHY_CATALOG] : TROPHY_CATALOG.filter((trophy) => trophy.category === category);
    if (sort === "recent") {
      rows.sort((a, b) => {
        const aTime = Date.parse(unlockedById.get(a.id)?.unlocked_at || "") || 0;
        const bTime = Date.parse(unlockedById.get(b.id)?.unlocked_at || "") || 0;
        if (aTime !== bTime) return bTime - aTime;
        if (unlockedById.has(a.id) !== unlockedById.has(b.id)) return unlockedById.has(b.id) ? 1 : -1;
        return a.order - b.order;
      });
    }
    return rows;
  }, [category, sort, unlockedById]);

  function markSeen(id) {
    if (seen.has(id)) return;
    const next = new Set(seen);
    next.add(id);
    setSeen(next);
    try { window.localStorage.setItem(seenKey(data.player), JSON.stringify([...next])); } catch { /* presentation-only */ }
  }

  function openTrophy(trophy, trigger) {
    selectedTrigger.current = trigger;
    setSelected(trophy);
    if (unlockedById.has(trophy.id)) markSeen(trophy.id);
  }

  function closeTrophy() {
    setSelected(null);
    window.setTimeout(() => selectedTrigger.current?.focus?.(), 0);
  }

  useEffect(() => {
    if (!selected) return undefined;
    const onKeyDown = (event) => { if (event.key === "Escape") closeTrophy(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  const selectedState = selected ? unlockedById.get(selected.id) : null;
  const selectedUnlocked = Boolean(selectedState);
  const categoryProgress = categoryCounts[category] || categoryCounts.all;

  return (
    <div className="dashboard-grid trophy-hall-v2">
      <section className={`panel span-12 trophy-hall-hero ${complete ? "is-complete" : ""}`}>
        <img
          className="trophy-hall-hero-art"
          src={complete ? "/trophies/a1/hall-complete.webp" : "/trophies/a1/hall-header.webp"}
          alt="Ornate Crystal Guild Hall of Trophies"
        />
        <div className="trophy-hall-hero-copy">
          <p className="eyebrow">Crystal Guild</p>
          <h2>Hall of Trophies</h2>
          <p className="muted">Relics, honors, and memories earned throughout your adventures.</p>
          <div className="trophy-hall-progress-copy">
            <strong>{unlockedCount} / {TROPHY_CATALOG.length}</strong>
            <span>{complete ? "Hall Complete" : `${percent}% discovered`}</span>
          </div>
          <div className="trophy-hall-progress" role="progressbar" aria-label="Hall of Trophies completion" aria-valuemin="0" aria-valuemax={TROPHY_CATALOG.length} aria-valuenow={unlockedCount}>
            <span style={{ width: `${percent}%` }} />
          </div>
        </div>
      </section>

      <section className="panel span-12 trophy-hall-controls" aria-label="Trophy filters">
        <div className="trophy-category-tabs" role="tablist" aria-label="Trophy categories">
          {TROPHY_CATEGORIES.map((item) => {
            const counts = categoryCounts[item.id];
            return (
              <button
                type="button"
                role="tab"
                aria-selected={category === item.id}
                className={category === item.id ? "active" : ""}
                key={item.id}
                onClick={() => setCategory(item.id)}
              >
                <span>{item.label}</span><small>{counts.unlocked} / {counts.total}</small>
              </button>
            );
          })}
        </div>
        <label className="trophy-category-select">
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {TROPHY_CATEGORIES.map((item) => {
              const counts = categoryCounts[item.id];
              return <option key={item.id} value={item.id}>{item.label} — {counts.unlocked}/{counts.total}</option>;
            })}
          </select>
        </label>
        <label className="trophy-sort-control">
          <span>Sort</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="hall">Hall Order</option>
            <option value="recent">Recently Earned</option>
          </select>
        </label>
        <div className="trophy-category-progress">
          <strong>{CATEGORY_LABELS[category]}</strong>
          <span>{categoryProgress.unlocked} / {categoryProgress.total}{category !== "all" && categoryProgress.unlocked === categoryProgress.total ? " — Complete" : ""}</span>
        </div>
      </section>

      <section className="panel span-12 trophy-gallery-section">
        {unlockedCount === 0 && category === "all" ? (
          <div className="trophy-welcome">
            <strong>Your Hall awaits.</strong>
            <span>Great victories, discoveries, and Fellowship accomplishments will leave their mark here.</span>
          </div>
        ) : null}
        <div className="trophy-gallery-grid">
          {visible.map((trophy) => {
            const ownership = unlockedById.get(trophy.id);
            const unlocked = Boolean(ownership);
            const isNew = unlocked && !seen.has(trophy.id) && !ownership?.seen_at;
            const image = trophy.secret && !unlocked ? "/trophies/a1/secret.webp" : unlocked ? trophy.art : "/trophies/a1/locked.webp";
            return (
              <button
                type="button"
                className={`trophy-gallery-card ${unlocked ? "unlocked" : "locked"}`}
                key={trophy.id}
                onClick={(event) => openTrophy(trophy, event.currentTarget)}
                aria-label={`${unlocked ? "Unlocked" : trophy.secret ? "Undiscovered secret" : "Locked"} trophy: ${trophy.secret && !unlocked ? "Secret Trophy" : trophy.name}`}
              >
                <div className="trophy-card-art-wrap">
                  <img src={image} alt={unlocked ? `Trophy: ${trophy.name}` : trophy.secret ? "Undiscovered secret trophy" : `Locked trophy: ${trophy.name}`} />
                  {isNew ? <span className="trophy-new-badge">NEW</span> : null}
                </div>
                <div className="trophy-card-copy">
                  <span className="slot-label">{CATEGORY_LABELS[trophy.category]}</span>
                  <strong>{trophy.secret && !unlocked ? "???" : trophy.name}</strong>
                  <span>{unlocked ? trophy.description : trophy.secret ? "Its story has yet to be written." : trophy.requirement}</span>
                  <small>{unlocked ? formatDate(ownership.unlocked_at) : "Locked"}</small>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {selected ? (
        <div className="trophy-detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeTrophy(); }}>
          <section className="trophy-detail-panel" role="dialog" aria-modal="true" aria-labelledby="trophy-detail-title">
            <button type="button" className="trophy-detail-close" onClick={closeTrophy} aria-label="Close trophy details">×</button>
            <img
              className="trophy-detail-art"
              src={selected.secret && !selectedUnlocked ? "/trophies/a1/secret.webp" : selectedUnlocked ? selected.art : "/trophies/a1/locked.webp"}
              alt={selectedUnlocked ? `Trophy: ${selected.name}` : selected.secret ? "Undiscovered secret trophy" : `Locked trophy: ${selected.name}`}
            />
            <div className="trophy-detail-copy">
              <span className="slot-label">{CATEGORY_LABELS[selected.category]}</span>
              <h2 id="trophy-detail-title">{selected.secret && !selectedUnlocked ? "???" : selected.name}</h2>
              <p>{selectedUnlocked ? selected.description : selected.secret ? "Its story has yet to be written." : selected.description}</p>
              {!selected.secret || selectedUnlocked ? <div><strong>Requirement</strong><span>{selected.requirement}</span></div> : null}
              <div><strong>Status</strong><span>{selectedUnlocked ? `Unlocked ${formatDate(selectedState?.unlocked_at)}` : "Locked"}</span></div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
