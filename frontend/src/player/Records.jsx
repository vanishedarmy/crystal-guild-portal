import { humanizeLabel } from "../utils/displayLabels.js";
import ClickableCard from "../components/ClickableCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { number } from "../utils/formatters.js";

function RecordPanel({ badge, children, className = "span-6", title }) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-title-row">
        <h2>{title}</h2>
        {badge ? <span className="small-badge">{badge}</span> : null}
      </div>
      {children}
    </section>
  );
}

function RivalryCard({ eyebrow, record, empty, value }) {
  return (
    <div className="record-feature-card">
      <div className="slot-label">{eyebrow}</div>
      <strong>{record?.name || empty}</strong>
      <span>{record ? value(record) : "No record established yet."}</span>
    </div>
  );
}

export default function Records({ data, onDetail }) {
  const career = data.career || {};
  const combat = data.combat || {};
  const economy = data.economy || {};
  const progression = data.progression || {};
  const rivalries = data.rivalries || {};
  const bosses = data.bosses || [];
  const careerEntries = [
    ["Adventures", career.ventures],
    ["Monsters Defeated", career.monsters_defeated],
    ["Hunt Clears", career.hunt_clears],
    ["Boss Clears", career.boss_clears],
    ["Times KO'd", career.deaths],
    ["Camp Rests", career.rests],
    ["Raid Revives", career.raid_revives],
    ["Summons Called", career.summons_called],
  ];
  const combatEntries = [
    ["Tracked Battles", combat.battles],
    ["Damage Dealt", combat.damage_dealt],
    ["Best Single Hit", combat.best_hit],
    ["Healing Done", combat.healing_done],
    ["Damage Taken", combat.damage_taken],
    ["Damage Mitigated", combat.damage_mitigated],
    ["Raid Damage", combat.raid_damage],
    ["Best Boss Damage", combat.best_boss_damage],
  ];
  const economyEntries = [
    ["Gil Earned", economy.gil_earned],
    ["Gil Spent", economy.gil_spent],
    ["Items Acquired", economy.items_acquired],
    ["Items Spent", economy.items_spent],
    ["Seals Earned", economy.hunt_seals_earned],
    ["Seals Spent", economy.hunt_seals_spent],
  ];
  return (
    <div className="dashboard-grid records-dashboard">
      <RecordPanel badge="Lifetime" className="span-6" title="Career Record">
        <div className="stat-grid record-stat-grid">
          {careerEntries.map(([label, value]) => <StatCard current={value} key={label} label={label} />)}
        </div>
      </RecordPanel>

      <RecordPanel badge="Combat" className="span-6" title="Battle Record">
        <div className="stat-grid record-stat-grid">
          {combatEntries.map(([label, value]) => <StatCard current={value} key={label} label={label} />)}
        </div>
      </RecordPanel>

      <RecordPanel badge="Guild Economy" className="span-5" title="Economy">
        <div className="stat-grid record-stat-grid record-stat-grid-compact">
          {economyEntries.map(([label, value]) => <StatCard current={value} key={label} label={label} />)}
        </div>
      </RecordPanel>

      <RecordPanel badge="Completion" className="span-7" title="Progression">
        <div className="record-progress-grid">
          <StatCard current={progression.jobs_mastered} label="Jobs Mastered" />
          <StatCard
            current={progression.bestiary_discovered}
            label="Bestiary"
            max={progression.bestiary_total}
          />
          <StatCard
            current={progression.achievements_unlocked}
            label="Achievements"
            max={progression.achievements_total}
          />
          <StatCard current={career.relics_completed} label="Relics Completed" />
          <StatCard current={career.crafts} label="Crafts" />
          <StatCard current={career.forge_upgrades} label="Forge Upgrades" />
        </div>
      </RecordPanel>

      <RecordPanel badge="Personal History" className="span-12" title="Rivalries & Identity">
        <div className="record-feature-grid">
          <RivalryCard
            empty="No favorite Job yet"
            eyebrow="Most Used Job"
            record={rivalries.favorite_job}
            value={(row) => `${number(row.battles)} battles · ${number(row.victories)} victories`}
          />
          <RivalryCard
            empty="No monster defeated yet"
            eyebrow="Favorite Victim"
            record={rivalries.most_defeated}
            value={(row) => `${number(row.defeats)} defeats recorded`}
          />
          <RivalryCard
            empty="No Nemesis yet"
            eyebrow="Nemesis"
            record={rivalries.nemesis}
            value={(row) => `${number(row.knockouts)} KOs against you · ${number(row.victories)} victories`}
          />
        </div>
      </RecordPanel>

      <RecordPanel badge={`${bosses.length} recorded`} className="span-12" title="Boss Victories">
        <div className="boss-grid">
          {bosses.length ? bosses.map((boss) => (
            <ClickableCard
              className="boss-card"
              detail={{ type: "boss", boss }}
              key={boss.id || boss.name}
              onOpen={onDetail}
            >
              <div className="slot-label">{humanizeLabel(boss.tier)}</div>
              <div className="boss-name">{boss.name}</div>
              <div className="card-meta">
                {number(boss.clears)} clears · Best {number(boss.best_damage)} damage
              </div>
            </ClickableCard>
          )) : <div className="muted">No boss clears recorded yet.</div>}
        </div>
      </RecordPanel>
    </div>
  );
}
