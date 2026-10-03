import DailyReward from "./DailyReward.jsx";
import { activitySourceLabel, humanizeLabel } from "../utils/displayLabels.js";
import ClickableCard from "../components/ClickableCard.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import WhatsNew from "./WhatsNew.jsx";
import { formatBestUse, formatBonuses, number, timeAgo } from "../utils/formatters.js";
import { DetailsPointer } from "../components/CollapsePointer.jsx";

const CORE_STATS = [
  ["str", "STR"],
  ["vit", "VIT"],
  ["mag", "MAG"],
  ["spr", "SPR"],
  ["dex", "DEX"],
  ["lck", "LCK"],
];

function percent(current, max) {
  const total = Number(max || 0);
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, (Number(current || 0) / total) * 100));
}

function EquipmentCard({ item, onDetail }) {
  const upgrade = item.upgrade_level ? ` +${item.upgrade_level}` : "";
  return (
    <ClickableCard className="equipment-card overview-equipment-card" detail={{ type: "equipment", item }} onOpen={onDetail}>
      <div className="overview-equipment-heading">
        <span className="slot-label">{humanizeLabel(item.slot)}</span>
        <span className="overview-equipment-level">Lv. {number(item.min_level || 1)}</span>
      </div>
      <div className={`item-name rarity-${item.rarity}`}>{item.name}{upgrade}</div>
      <div className="item-meta">{formatBonuses(item.bonuses)}</div>
      {["weapon", "armor"].includes(String(item.slot || "").toLowerCase()) ? <small className="equipment-job-recommendation">{formatBestUse(item)}</small> : null}
    </ClickableCard>
  );
}

function ProgressSummary({ label, current, max, tone = "" }) {
  const hasMaximum = Number(max || 0) > 0;
  return (
    <div className="overview-progress-item">
      <div className="overview-progress-heading">
        <span>{label}</span>
        <strong>{number(current || 0)}{hasMaximum ? ` / ${number(max)}` : ""}</strong>
      </div>
      {hasMaximum ? <ProgressBar value={percent(current, max)} className={tone} /> : <div className="overview-progress-rule" aria-hidden="true" />}
    </div>
  );
}

function MasterySummary({ masterySlots = [] }) {
  const active = masterySlots.filter((item) => item?.name);
  return (
    <div className="overview-mastery-summary">
      <div className="overview-subsection-heading">
        <span>Active Masteries</span>
        <strong>{number(active.length)} / 2</strong>
      </div>
      <div className="overview-mastery-compact-list">
        {active.length ? active.map((item) => (
          <div className="overview-mastery-compact" key={item.slot}>
            <span className="slot-label">Slot {number(item.slot)} · {item.job_name}</span>
            <strong>{item.name}</strong>
            <small>{item.description}</small>
          </div>
        )) : <div className="overview-empty-state">No cross-Job Masteries equipped.</div>}
      </div>
    </div>
  );
}

export default function Overview({ data, onDetail, onRefresh, onNavigate }) {
  const stats = data.stats || {};
  const counts = data.counts || {};
  const equipment = Array.isArray(data.equipment) ? data.equipment : [];
  const masterySlots = Array.isArray(data.mastery_slots) ? data.mastery_slots : [];
  const activity = Array.isArray(data.recent_activity) ? data.recent_activity : [];
  const fellowship = data.fellowship || null;

  return (
    <div className="dashboard-grid overview-dashboard overview-redesign">
      <DailyReward username={data.identity?.username} onRefresh={onRefresh} />
      <WhatsNew onNavigate={onNavigate} />

      <section className="panel span-12 overview-summary-panel">
        <div className="panel-title-row overview-summary-title-row">
          <div>
            <p className="eyebrow">Adventurer Summary</p>
            <h2>Character Overview</h2>
          </div>
          <span className="small-badge overview-location-badge">{data.region?.name || "Unknown Region"} · {data.identity?.stance || "Balanced"}</span>
        </div>

        <div className="overview-summary-layout">
          <article className="overview-summary-block overview-battle-block">
            <div className="overview-summary-block-heading">
              <div>
                <span className="overview-block-kicker">Battle Profile</span>
                <h3>Combat Stats</h3>
              </div>
              <span className="overview-block-note">Current totals</span>
            </div>

            <div className="overview-power-pair">
              <div className="overview-power-stat physical">
                <span>ATK</span>
                <strong>{number(stats.attack || 0)}</strong>
                <small>Physical Power</small>
              </div>
              <div className="overview-power-stat magic">
                <span>M.PWR</span>
                <strong>{number(stats.magic_power || 0)}</strong>
                <small>Magic Power</small>
              </div>
            </div>

            <div className="overview-core-stat-grid" aria-label="Core battle statistics">
              {CORE_STATS.map(([key, label]) => (
                <div className="overview-core-stat" key={key}>
                  <span>{label}</span>
                  <strong>{number(stats[key] || 0)}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="overview-summary-block overview-progress-block">
            <div className="overview-summary-block-heading">
              <div>
                <span className="overview-block-kicker">Journey</span>
                <h3>Progress</h3>
              </div>
              <button type="button" className="overview-text-action" onClick={() => onNavigate?.("achievements")}>Achievements →</button>
            </div>
            <div className="overview-progress-list">
              <ProgressSummary label="Bestiary" current={counts.bestiary} max={counts.bestiary_total} tone="bestiary" />
              <ProgressSummary label="Achievements" current={counts.achievements} max={counts.achievements_total} tone="achievements" />
              <ProgressSummary label="Jobs Mastered" current={counts.mastered_jobs} max={counts.jobs_total} tone="jobs" />
              <ProgressSummary label="Boss Clears" current={counts.boss_clears} />
            </div>
          </article>

          <article className="overview-summary-block overview-guild-block">
            <div className="overview-summary-block-heading">
              <div>
                <span className="overview-block-kicker">Guild Setup</span>
                <h3>Standing & Masteries</h3>
              </div>
              <button type="button" className="overview-text-action" onClick={() => onNavigate?.("jobs")}>Jobs →</button>
            </div>

            {fellowship ? (
              <div className="overview-guild-standing">
                <span className="slot-label">Fellowship Rank</span>
                <strong>{fellowship.rank?.name || "Recruit"}</strong>
                <span>{number(fellowship.renown)} Renown{fellowship.founding_member ? " · Founding Member" : ""}</span>
              </div>
            ) : (
              <div className="overview-guild-standing empty">
                <span className="slot-label">Fellowship</span>
                <strong>No Fellowship</strong>
                <span>Join a Fellowship to build communal Renown.</span>
              </div>
            )}

            <MasterySummary masterySlots={masterySlots} />
          </article>
        </div>
      </section>

      <section className="panel span-12 overview-loadout-panel">
        <div className="panel-title-row overview-loadout-title-row">
          <div>
            <p className="eyebrow">Equipped Gear</p>
            <h2>Current Loadout</h2>
          </div>
          <div className="overview-title-actions">
            <span className="small-badge">{number(equipment.length)} equipped</span>
            <button type="button" className="equipment-action-button secondary overview-manage-button" onClick={() => onNavigate?.("inventory")}>Manage Equipment</button>
          </div>
        </div>
        {equipment.length ? (
          <div className="equipment-grid overview-equipment-grid">
            {equipment.map((item) => <EquipmentCard key={item.slot} item={item} onDetail={onDetail} />)}
          </div>
        ) : <div className="overview-empty-state">No equipment is currently equipped.</div>}
      </section>

      <details className="panel span-12 overview-recent-activity">
        <summary className="panel-title-row overview-recent-activity-summary">
          <div>
            <p className="eyebrow">Ledger</p>
            <h2>Recent Activity</h2>
          </div>
          <span className="overview-activity-summary-meta"><span className="small-badge">{number(activity.length)}</span><DetailsPointer /></span>
        </summary>
        <div className="activity-list overview-activity-list">
          {activity.length ? activity.map((item, index) => {
            const positive = item.amount >= 0;
            return (
              <div className="activity-row" key={`${item.created_at}-${item.asset}-${index}`}>
                <span className="activity-icon">{item.kind === "item" ? "◇" : "G"}</span>
                <span><strong>{item.kind === "item" ? (item.asset_name || humanizeLabel(item.asset)) : humanizeLabel(item.asset)}</strong><br /><span className="muted">{activitySourceLabel(item.source)} · {timeAgo(item.created_at)}</span></span>
                <span className={`activity-amount ${positive ? "positive" : "negative"}`}>{positive ? "+" : ""}{number(item.amount)}</span>
              </div>
            );
          }) : <div className="overview-empty-state">No recent activity yet.</div>}
        </div>
      </details>
    </div>
  );
}
