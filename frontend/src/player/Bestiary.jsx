import { useMemo, useState } from "react";
import { formatMonsterSpecial, number } from "../utils/formatters.js";
import { sortBestiaryByLevel } from "./bestiarySort.js";
import MonsterPortrait from "../components/MonsterPortrait.jsx";

const CATEGORY_LABELS = {
  regional: "Regional",
  hunt: "Hunt",
  expedition: "Expedition Boss",
  raid: "Raid",
  boss: "Boss Encounter",
  world_event: "World Event",
  seasonal: "Seasonal",
};

const SCOPE_LABELS = {
  base: "Core Bestiary",
  boss: "Raid & Boss Records",
  world_event: "World Events",
  seasonal: "Seasonal Records",
};

const STAGE_LABELS = {
  undiscovered: "Undiscovered",
  encountered: "Encountered",
  observed: "Observed",
  studied: "Studied",
  researched: "Researched",
  documented: "Documented",
  mastered: "Mastered",
  field_research: "Field Research",
  full_dossier: "Full Dossier",
  further_research: "Further Research",
  recorded: "Recorded",
};

function monsterName(monster) {
  return typeof monster?.name === "string" && monster.name.trim() && monster.name !== "???"
    ? monster.name.trim()
    : "Undiscovered";
}

function categoryLabel(value) {
  return CATEGORY_LABELS[value] || (value ? String(value).replaceAll("_", " ") : "Unknown");
}

function scopeLabel(value) {
  return SCOPE_LABELS[value] || (value ? String(value).replaceAll("_", " ") : "Unknown source");
}

function stageLabel(value, completed, external) {
  if (completed) return external ? "Record Complete" : "Mastered";
  const raw = String(value || "undiscovered");
  return STAGE_LABELS[raw] || raw.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function countValue(monster) {
  return Number(monster?.progress_count ?? monster?.defeats ?? 0);
}

function unitLabel(monster, amount = countValue(monster)) {
  const raw = String(monster?.progress_unit || "defeat").trim().toLowerCase();
  const plural = amount === 1 ? raw : `${raw}${raw.endsWith("s") ? "" : "s"}`;
  return plural;
}

function progressPercent(monster) {
  const threshold = Number(monster?.research?.mastery_threshold || 0);
  const count = countValue(monster);
  if (!threshold) return monster?.research?.mastered ? 100 : 0;
  return Math.max(0, Math.min(100, Math.round((count / threshold) * 100)));
}

function dropText(drop) {
  const chance = Math.max(0, Number(drop?.chance || 0));
  const min = Math.max(1, Number(drop?.min || 1));
  const max = Math.max(min, Number(drop?.max || min));
  const quantity = min === max ? `×${number(min)}` : `×${number(min)}–${number(max)}`;
  return `${drop?.name || drop?.item_id || "Unknown item"} ${quantity} · ${Math.round(chance * 100)}%`;
}

function ResearchSummary({ summary }) {
  const items = [
    ["Discovered", `${number(summary.discovered)} / ${number(summary.total)}`],
    ["Mastered / Recorded", `${number(summary.completed ?? summary.mastered)} / ${number(summary.total)}`],
    ["Research Points", number(summary.research_points)],
    ["Mastery Seals", number(summary.mastery_seals)],
    ["Core Defeats", number(summary.defeats)],
  ];
  return (
    <div className="bestiary-summary-grid" aria-label="Bestiary research summary">
      {items.map(([label, value]) => (
        <div className="bestiary-summary-card" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function ResearchTrack({ monster }) {
  const research = monster?.research || {};
  const external = Boolean(monster?.mastery_reward?.external);
  const threshold = Number(research.mastery_threshold || 0);
  const count = countValue(monster);
  const next = research.next_milestone;
  return (
    <div className="bestiary-research-track">
      <div className="bestiary-progress-copy">
        <strong>{stageLabel(research.stage, research.mastered, external)}</strong>
        <span>
          {research.mastered
            ? `${number(count)} ${unitLabel(monster, count)} · ${external ? "record complete" : "mastery complete"}`
            : next
              ? `${number(count)} ${unitLabel(monster, count)} · ${number(next.remaining)} to next discovery`
              : `${number(count)} ${unitLabel(monster, count)}`}
        </span>
      </div>
      <div className="bestiary-progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax={threshold || 1} aria-valuenow={Math.min(count, threshold || count)}>
        <span style={{ width: `${progressPercent(monster)}%` }} />
      </div>
      {threshold > 0 ? <small>{external ? "Record" : "Mastery"}: {number(count)} / {number(threshold)}</small> : null}
    </div>
  );
}

function Dossier({ monster }) {
  const discovered = Boolean(monster?.discovered);
  const completed = Boolean(monster?.research?.mastered);
  const external = Boolean(monster?.mastery_reward?.external);
  if (!discovered) {
    return (
      <div className="bestiary-dossier bestiary-dossier-locked">
        <p>{monster?.scope === "world_event" ? "Win this World Event to add its record to the Guild archive." : monster?.scope === "seasonal" ? "Defeat this seasonal creature to preserve its edition-scoped record." : monster?.scope === "boss" ? "Clear this encounter to add its record to the Guild archive." : "Defeat this monster once to begin its Guild research record."}</p>
      </div>
    );
  }

  return (
    <div className="bestiary-dossier">
      <div className="bestiary-dossier-grid">
        <div>
          <span className="bestiary-dossier-label">Classification</span>
          <strong>{monster?.family || categoryLabel(monster?.category)}</strong>
          <small>{categoryLabel(monster?.category)} · {scopeLabel(monster?.scope)}</small>
        </div>
        <div>
          <span className="bestiary-dossier-label">Habitat / Encounter</span>
          <strong>{monster?.habitats?.length ? monster.habitats.join(" · ") : "Not specified"}</strong>
        </div>
        <div>
          <span className="bestiary-dossier-label">Weakness</span>
          <strong>{monster?.weakness || (external ? "Not listed for this encounter" : "Research incomplete")}</strong>
        </div>
        <div>
          <span className="bestiary-dossier-label">Combat Profile / Active Skill / Signature</span>
          <strong>{monster?.combat_profile || (external ? "Encounter record" : "Research incomplete")}</strong>
          {monster?.active_skill ? <small title={formatMonsterSpecial(monster?.special)}>{monster.active_skill}</small> : null}
        </div>
      </div>

      <div className="bestiary-dossier-section">
        <span className="bestiary-dossier-label">Known Drops</span>
        {monster?.drops?.length ? (
          <ul className="bestiary-drop-list">
            {monster.drops.map((drop, index) => <li key={`${drop.item_id || drop.name}-${index}`}>{dropText(drop)}</li>)}
          </ul>
        ) : <p className="muted">{external ? "No drop catalogue is published for this record." : "Further research required."}</p>}
      </div>

      <div className="bestiary-dossier-section">
        <span className="bestiary-dossier-label">Guild Field Notes</span>
        <p>{monster?.lore || "Further research is required before the Guild can publish this entry."}</p>
      </div>

      {completed ? (
        <div className={`bestiary-mastery-reward${external ? " external-record" : ""}`}>
          <span aria-hidden="true">{external ? "✓" : "◆"}</span>
          <div>
            <strong>{external ? (monster?.mastery_reward?.label || "Record Complete") : "Mastery Complete"}</strong>
            <small>
              {external
                ? `${monster?.mastery_reward?.source || "Existing encounter progression"} remains the source of truth; no duplicate Bestiary reward is granted.`
                : `Mastery Seal earned · +${number(monster?.mastery_reward?.research_points || 1)} Research Point`}
            </small>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MonsterCard({ monster, expanded, onToggle }) {
  const discovered = Boolean(monster?.discovered);
  const completed = Boolean(monster?.research?.mastered);
  const external = Boolean(monster?.mastery_reward?.external);
  return (
    <article className={`bestiary-card${discovered ? " discovered" : " locked"}${completed ? " mastered" : ""}${external ? " external-record" : ""}`}>
      <button className="bestiary-card-main" type="button" onClick={onToggle} aria-expanded={expanded}>
        <MonsterPortrait
          monster={monster}
          name={monsterName(monster)}
          discovered={discovered && monster?.portrait_unlocked !== false}
          className="bestiary-card-portrait"
        />
        <div className="bestiary-card-copy">
          <div className="bestiary-card-heading">
            <div>
              <strong>{monsterName(monster)}</strong>
              <small>{discovered && monster?.level ? `Lv. ${number(monster.level)}` : discovered ? scopeLabel(monster?.scope) : "Identity unknown"}</small>
            </div>
            {completed ? <span className={`bestiary-seal${external ? " external" : ""}`} title={external ? "Encounter record complete" : "Mastery Seal earned"}>{external ? "✓" : "◆"}</span> : null}
          </div>
          <div className="bestiary-card-tags">
            <span>{scopeLabel(monster?.scope)}</span>
            {monster?.category ? <span>{categoryLabel(monster.category)}</span> : <span>Undiscovered</span>}
            {monster?.family ? <span>{monster.family}</span> : null}
          </div>
          <ResearchTrack monster={monster} />
        </div>
        <span className="bestiary-expand-marker" aria-hidden="true">{expanded ? "−" : "+"}</span>
      </button>
      {expanded ? <Dossier monster={monster} /> : null}
    </article>
  );
}

export default function Bestiary({ data }) {
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState("all");
  const [category, setCategory] = useState("all");
  const [family, setFamily] = useState("all");
  const [status, setStatus] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const monsters = useMemo(() => sortBestiaryByLevel(data?.monsters), [data?.monsters]);
  const summary = data?.summary || {};

  const scopes = useMemo(() => [...new Set(monsters.map((monster) => monster?.scope).filter(Boolean))], [monsters]);
  const categories = useMemo(() => [...new Set(monsters.map((monster) => monster?.category).filter(Boolean))].sort(), [monsters]);
  const families = useMemo(() => [...new Set(monsters.map((monster) => monster?.family).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [monsters]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return monsters.filter((monster) => {
      const discovered = Boolean(monster?.discovered);
      const completed = Boolean(monster?.research?.mastered);
      if (scope !== "all" && monster?.scope !== scope) return false;
      if (category !== "all" && monster?.category !== category) return false;
      if (family !== "all" && monster?.family !== family) return false;
      if (status === "locked" && discovered) return false;
      if (status === "discovered" && (!discovered || completed)) return false;
      if (status === "mastered" && (!completed || monster?.mastery_reward?.external)) return false;
      if (status === "recorded" && (!completed || !monster?.mastery_reward?.external)) return false;
      if (!term) return true;
      return [
        monsterName(monster),
        scopeLabel(monster?.scope),
        categoryLabel(monster?.category),
        monster?.family,
        ...(monster?.habitats || []),
        monster?.weakness,
        monster?.combat_profile,
        monster?.active_skill,
        monster?.lore,
      ].filter(Boolean).join(" ").toLowerCase().includes(term);
    });
  }, [monsters, search, scope, category, family, status]);

  const clearFilters = () => {
    setSearch("");
    setScope("all");
    setCategory("all");
    setFamily("all");
    setStatus("all");
  };

  return (
    <section className="panel bestiary-research-panel">
      <div className="panel-title-row bestiary-title-row">
        <div>
          <h2>Bestiary</h2>
          <p className="bestiary-intro">Encounter, study, document, and preserve every creature record gathered by the Crystal Guild.</p>
        </div>
        <span className="small-badge">{number(summary.discovered)} / {number(summary.total)} discovered</span>
      </div>

      <ResearchSummary summary={summary} />

      <div className="bestiary-filter-panel">
        <label className="search-box bestiary-search-box">
          <span>Search Bestiary</span>
          <input
            type="search"
            placeholder="Monster, family, encounter, weakness, or lore"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label>
          <span>Source</span>
          <select value={scope} onChange={(event) => setScope(event.target.value)}>
            <option value="all">All records</option>
            {scopes.map((value) => <option value={value} key={value}>{scopeLabel(value)}</option>)}
          </select>
        </label>
        <label>
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">All categories</option>
            {categories.map((value) => <option value={value} key={value}>{categoryLabel(value)}</option>)}
          </select>
        </label>
        <label>
          <span>Family</span>
          <select value={family} onChange={(event) => setFamily(event.target.value)}>
            <option value="all">All families</option>
            {families.map((value) => <option value={value} key={value}>{value}</option>)}
          </select>
        </label>
        <label>
          <span>Research Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All entries</option>
            <option value="locked">Undiscovered</option>
            <option value="discovered">In research</option>
            <option value="mastered">Mastered core entries</option>
            <option value="recorded">Completed special records</option>
          </select>
        </label>
        <button type="button" className="secondary-button bestiary-clear-filters" onClick={clearFilters}>Clear</button>
      </div>

      <div className="bestiary-results-row">
        <span>{number(filtered.length)} entries shown</span>
        {summary?.most_defeated?.discovered ? <span>Most encountered core monster: <strong>{monsterName(summary.most_defeated)}</strong> ({number(summary.most_defeated.defeats)})</span> : null}
      </div>

      {filtered.length ? (
        <div className="bestiary-card-grid">
          {filtered.map((monster, index) => {
            const key = monster?.id || `${monsterName(monster)}-${index}`;
            return (
              <MonsterCard
                monster={monster}
                key={key}
                expanded={expandedId === key}
                onToggle={() => setExpandedId((current) => current === key ? null : key)}
              />
            );
          })}
        </div>
      ) : (
        <div className="empty-state bestiary-empty-state">
          <strong>No Bestiary entries match these filters.</strong>
          <button type="button" className="secondary-button" onClick={clearFilters}>Reset filters</button>
        </div>
      )}
    </section>
  );
}
