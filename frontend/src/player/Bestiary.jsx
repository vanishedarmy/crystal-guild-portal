import { useMemo, useState } from "react";
import { formatMonsterSpecial, number } from "../utils/formatters.js";
import { sortBestiaryByLevel } from "./bestiarySort.js";
import MonsterPortrait from "../components/MonsterPortrait.jsx";

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
      <div className="data-table-wrap bestiary-table-wrap">
        <table className="data-table bestiary-table">
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
                  <td data-label="Monster"><div className="bestiary-monster-cell"><MonsterPortrait monster={monster} name={monsterName(monster)} discovered={discovered} className="bestiary-monster-thumb" /><div className="bestiary-monster-copy"><strong>{discovered ? monsterName(monster) : "Undiscovered"}</strong>{discovered ? <small>Lv.{number(monster?.level)}</small> : <small>???</small>}</div></div></td>
                  <td data-label="Level">{discovered ? number(monster?.level) : "—"}</td>
                  <td data-label="Defeats">{number(monster?.defeats)}</td>
                  <td data-label="Weakness">{discovered ? String(monster?.weakness || "—") : "—"}</td>
                  <td data-label="Combat Style">{discovered ? String(monster?.combat_profile || "Balanced") : "—"}</td>
                  <td data-label="Active Skill">
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
