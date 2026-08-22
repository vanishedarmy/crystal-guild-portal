import { humanizeLabel } from "../utils/displayLabels.js";
import { useMemo, useState } from "react";
import ProgressBar from "../components/ProgressBar.jsx";
import {
  achievementCategories,
  filterAchievements,
  filterTitles,
  progressText,
} from "../utils/achievementUtils.js";

const TITLE_RARITIES = ["All", "Legendary", "Epic", "Rare", "Uncommon", "Common"];

function AchievementCard({ achievement }) {
  const tier = achievement.tier || "bronze";
  return (
    <article className={`achievement-card tier-${tier} ${achievement.unlocked ? "unlocked" : "locked"}`}>
      <div className="achievement-card-head">
        <span className={`achievement-tier ${tier}`}>{humanizeLabel(tier)}</span>
        <span className="achievement-points">+{achievement.points} AP</span>
      </div>
      <div className="slot-label">{achievement.unlocked ? "Unlocked" : humanizeLabel(achievement.category)}</div>
      <div className="job-name">{achievement.name}</div>
      <div className="card-meta">{achievement.description}</div>
      <div className="achievement-progress">
        <div className="achievement-progress-label">
          <span>{achievement.progress?.hidden ? "Secret" : achievement.unlocked ? "Complete" : "Progress"}</span>
          <strong>{achievement.progress?.hidden ? "???" : progressText(achievement.progress)}</strong>
        </div>
        {achievement.progress?.hidden ? null : <ProgressBar value={achievement.progress?.percent || 0} />}
      </div>
      {achievement.reward_title ? (
        <div className="card-actions">
          <span className={`title-reward rarity-${achievement.reward_title_meta?.rarity || "common"}`}>
            Title · {achievement.reward_title}
          </span>
        </div>
      ) : null}
    </article>
  );
}

function TitleCard({ title }) {
  return (
    <article className={`title-card rarity-${title.rarity || "common"} ${title.unlocked ? "unlocked" : "locked"}`}>
      <div className="title-card-head">
        <span className="slot-label">{humanizeLabel(title.source)}</span>
        <span className={`title-rarity rarity-${title.rarity || "common"}`}>{humanizeLabel(title.rarity)}</span>
      </div>
      <div className="job-name">{title.name}</div>
      <div className="card-meta">{title.description}</div>
      <div className="title-card-foot">
        <span>{humanizeLabel(title.category)}</span>
        {title.equipped ? <strong>Equipped</strong> : title.unlocked ? <strong>Unlocked</strong> : <span>Locked</span>}
      </div>
    </article>
  );
}

export default function Achievements({ data }) {
  const [category, setCategory] = useState("All");
  const [state, setState] = useState("all");
  const [view, setView] = useState("achievements");
  const [titleState, setTitleState] = useState("unlocked");
  const [rarity, setRarity] = useState("All");
  const categories = useMemo(() => achievementCategories(data.achievements), [data.achievements]);
  const shown = useMemo(
    () => filterAchievements(data.achievements, category, state),
    [data.achievements, category, state],
  );
  const shownTitles = useMemo(
    () => filterTitles(data.titles || [], titleState, rarity),
    [data.titles, titleState, rarity],
  );

  return (
    <section className="achievement-hall">
      <div className="achievement-summary-grid">
        <div className="achievement-summary-card primary">
          <span>Achievement Points</span>
          <strong>{Number(data.summary.points || 0).toLocaleString()}</strong>
          <small>of {Number(data.summary.points_total || 0).toLocaleString()} AP</small>
        </div>
        <div className="achievement-summary-card">
          <span>Achievements</span>
          <strong>{data.summary.unlocked} / {data.summary.total}</strong>
          <small>career milestones</small>
        </div>
        <div className="achievement-summary-card">
          <span>Titles</span>
          <strong>{data.summary.titles_unlocked || 0} / {data.summary.titles_total || 0}</strong>
          <small>equipped: {data.summary.equipped_title || data.player?.title || "—"}</small>
        </div>
      </div>

      <div className="achievement-view-tabs">
        <button className={view === "achievements" ? "active" : ""} onClick={() => setView("achievements")} type="button">
          Achievements
        </button>
        <button className={view === "titles" ? "active" : ""} onClick={() => setView("titles")} type="button">
          Title Collection
        </button>
      </div>

      {view === "achievements" ? (
        <section className="panel">
          <div className="panel-title-row">
            <div>
              <p className="eyebrow">Milestones</p>
              <h2>Achievements</h2>
            </div>
            <span className="small-badge">{shown.length} shown</span>
          </div>
          <div className="filter-row">
            {categories.map((item) => (
              <button key={item} type="button" className={`filter-chip ${category === item ? "active" : ""}`} onClick={() => setCategory(item)}>
                {humanizeLabel(item)}
              </button>
            ))}
          </div>
          <div className="filter-row compact">
            {["all", "unlocked", "locked"].map((item) => (
              <button key={item} type="button" className={`filter-chip ${state === item ? "active" : ""}`} onClick={() => setState(item)}>
                {humanizeLabel(item)}
              </button>
            ))}
          </div>
          <div className="achievement-grid">
            {shown.map((achievement) => <AchievementCard achievement={achievement} key={achievement.id} />)}
          </div>
        </section>
      ) : (
        <section className="panel">
          <div className="panel-title-row">
            <div>
              <p className="eyebrow">Cosmetic Honors</p>
              <h2>Title Collection</h2>
            </div>
            <span className="small-badge">{shownTitles.length} shown</span>
          </div>
          <div className="filter-row">
            {["unlocked", "locked", "all"].map((item) => (
              <button key={item} type="button" className={`filter-chip ${titleState === item ? "active" : ""}`} onClick={() => setTitleState(item)}>
                {humanizeLabel(item)}
              </button>
            ))}
          </div>
          <div className="filter-row compact">
            {TITLE_RARITIES.map((item) => (
              <button key={item} type="button" className={`filter-chip ${rarity === item ? "active" : ""}`} onClick={() => setRarity(item)}>
                {humanizeLabel(item)}
              </button>
            ))}
          </div>
          <div className="title-grid">
            {shownTitles.map((title) => <TitleCard title={title} key={title.id} />)}
          </div>
          <p className="portal-command-note">Equip an unlocked title in Twitch chat with <code>!title &lt;name&gt;</code>.</p>
        </section>
      )}
    </section>
  );
}
