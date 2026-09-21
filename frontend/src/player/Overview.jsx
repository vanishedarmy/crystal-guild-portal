import DailyReward from "./DailyReward.jsx";
import { activitySourceLabel, humanizeLabel } from "../utils/displayLabels.js";
import ClickableCard from "../components/ClickableCard.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import StatCard from "../components/StatCard.jsx";
import WhatsNew from "./WhatsNew.jsx";
import { formatBestUse, formatBonuses, number, timeAgo } from "../utils/formatters.js";
import { DetailsPointer } from "../components/CollapsePointer.jsx";

function EquipmentCard({ item, onDetail }) {
  const upgrade = item.upgrade_level ? ` +${item.upgrade_level}` : "";
  return (
    <ClickableCard className="equipment-card" detail={{ type: "equipment", item }} onOpen={onDetail}>
      <div className="slot-label">{humanizeLabel(item.slot)} · Lv. {number(item.min_level || 1)}</div>
      <div className={`item-name rarity-${item.rarity}`}>{item.name}{upgrade}</div>
      <div className="item-meta">{formatBonuses(item.bonuses)}</div>
      {["weapon", "armor"].includes(String(item.slot || "").toLowerCase()) ? <small className="equipment-job-recommendation">{formatBestUse(item)}</small> : null}
    </ClickableCard>
  );
}

export default function Overview({ data, onDetail, onRefresh, onNavigate }) {
  const stats = data.stats;
  const counts = data.counts;
  const statKeys = ["str", "vit", "mag", "spr", "dex", "lck", "attack", "magic_power"];
  const statNames = {
    str: "STR", vit: "VIT", mag: "MAG", spr: "SPR", dex: "DEX", lck: "LCK", attack: "ATK", magic_power: "M.PWR",
  };
  return (
    <div className="dashboard-grid overview-dashboard">
      <DailyReward username={data.identity?.username} onRefresh={onRefresh} />
      <WhatsNew onNavigate={onNavigate} />
      <section className="panel span-7">
        <div className="panel-title-row"><h2>Battle Profile</h2><span className="small-badge">{data.region.name}</span></div>
        <div className="stat-grid">
          {statKeys.map((key) => <StatCard key={key} current={stats[key]} label={statNames[key]} />)}
        </div>
      </section>
      <section className="panel span-5">
        <div className="panel-title-row"><h2>Progress</h2><span className="small-badge">{data.identity.stance}</span></div>
        <div className="stat-grid">
          <StatCard current={counts.bestiary} max={counts.bestiary_total} label="Bestiary" />
          <StatCard current={counts.achievements} max={counts.achievements_total} label="Achievements" />
          <StatCard current={counts.mastered_jobs} max={counts.jobs_total} label="Jobs Mastered" />
          <StatCard current={counts.boss_clears} label="Boss Clears" />
        </div>
        {data.fellowship ? (
          <div className="fellowship-standing-inline">
            <span className="slot-label">Guild Rank</span>
            <strong>{data.fellowship.rank?.name || "Recruit"}</strong>
            <span className="muted"> · {number(data.fellowship.renown)} Fellowship Renown{data.fellowship.founding_member ? " · Founding Member" : ""}</span>
          </div>
        ) : null}
      </section>
      <section className="panel span-8">
        <div className="panel-title-row"><h2>Equipment</h2><span className="small-badge">Current Loadout</span></div>
        <div className="equipment-grid">
          {data.equipment.map((item) => <EquipmentCard key={item.slot} item={item} onDetail={onDetail} />)}
        </div>
      </section>
      <section className="panel span-4">
        <div className="panel-title-row"><h2>Masteries</h2><span className="small-badge">2 Slots</span></div>
        <div className="mastery-list">
          {data.mastery_slots.length ? data.mastery_slots.map((item) => (
            <article className="mastery-card" key={item.slot}>
              <span className="slot-label">Slot {number(item.slot)} · {item.job_name}</span>
              <strong>{item.name}</strong>
              <span className="muted">{item.description}</span>
            </article>
          )) : <div className="muted">No cross-Job Masteries equipped.</div>}
        </div>
      </section>
      <details className="panel span-12 overview-recent-activity" open>
        <summary className="panel-title-row overview-recent-activity-summary"><h2>Recent Activity</h2><span className="overview-activity-summary-meta"><span className="small-badge">{number(data.recent_activity.length)}</span><DetailsPointer /></span></summary>
        <div className="activity-list">
          {data.recent_activity.length ? data.recent_activity.map((item, index) => {
            const positive = item.amount >= 0;
            return (
              <div className="activity-row" key={`${item.created_at}-${item.asset}-${index}`}>
                <span className="activity-icon">{item.kind === "item" ? "◇" : "G"}</span>
                <span><strong>{item.kind === "item" ? item.asset : humanizeLabel(item.asset)}</strong><br /><span className="muted">{activitySourceLabel(item.source)} · {timeAgo(item.created_at)}</span></span>
                <span className={`activity-amount ${positive ? "positive" : "negative"}`}>{positive ? "+" : ""}{number(item.amount)}</span>
              </div>
            );
          }) : <div className="muted">No recent activity yet.</div>}
        </div>
      </details>
    </div>
  );
}
