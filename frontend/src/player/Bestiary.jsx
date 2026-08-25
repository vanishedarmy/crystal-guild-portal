import { useMemo, useState } from "react";
import { formatMonsterSpecial, number } from "../utils/formatters.js";
import { sortBestiaryByLevel } from "./bestiarySort.js";
import { monsterToken } from "../utils/retroAssets.js";

function monsterName(monster) {
  return typeof monster?.name === "string" && monster.name.trim()
    ? monster.name.trim()
    : "Unknown Monster";
}

export default function Bestiary({ data }) {
  const [search, setSearch] = useState("");
  const monsters = useMemo(() => sortBestiaryByLevel(data?.monsters), [data?.monsters]);
  const summary = data?.summary || {};
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return monsters;
    return monsters.filter((monster) => [
      monsterName(monster),
      monster?.weakness,
      monster?.combat_profile,
      monster?.active_skill,
    ].filter(Boolean).join(" ").toLowerCase().includes(term));
  }, [monsters, search]);

  return (
    <section className="panel">
      <div className="panel-title-row">
        <h2>Bestiary</h2>
        <span className="small-badge">
          {number(summary.discovered)} / {number(summary.total)} discovered
        </span>
      </div>
      <div className="bestiary-field-guide" aria-label="Bestiary field guide presentation">
        <div className="bestiary-field-art" aria-hidden="true"><img src="/retro-phase2/monster-feature.webp" alt="" loading="lazy" decoding="async" /></div>
        <div className="bestiary-field-copy">
          <p className="eyebrow">Retro Field Guide</p>
          <h3>Monster portraits join the record</h3>
          <p>Discovered entries now carry illustrated monster tokens for faster scanning while level, weakness, combat style, and active-skill information stay in the same compact record.</p>
        </div>
      </div>
      <div className="toolbar">
        <label className="search-box">
          <span>Search Bestiary</span>
          <input
            type="search"
            placeholder="Monster, weakness, combat style, or skill"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Monster</th>
              <th>Level</th>
              <th>Defeats</th>
              <th>Weakness</th>
              <th>Combat Style</th>
              <th>Active Skill</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((monster, index) => {
              const discovered = Boolean(monster?.discovered);
              return (
                <tr className={discovered ? "" : "locked"} key={`${monster?.id || monsterName(monster)}-${index}`}>
                  <td>
                    <span className="bestiary-monster-name">
                      {discovered ? <img className="retro-monster-token" src={monsterToken(monster)} alt="" loading="lazy" decoding="async" /> : <span className="retro-monster-token" aria-hidden="true" />}
                      <span>{discovered ? monsterName(monster) : "Undiscovered"}</span>
                    </span>
                  </td>
                  <td>{discovered ? number(monster?.level) : "—"}</td>
                  <td>{number(monster?.defeats)}</td>
                  <td>{discovered ? String(monster?.weakness || "—") : "—"}</td>
                  <td>{discovered ? String(monster?.combat_profile || "Balanced") : "—"}</td>
                  <td>
                    {discovered ? (
                      <span title={formatMonsterSpecial(monster?.special)}>
                        {String(monster?.active_skill || "Basic attacks")}
                      </span>
                    ) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
