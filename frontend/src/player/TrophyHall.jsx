import BossArtwork from "../components/BossArtwork.jsx";
import RelicArtwork from "../components/RelicArtwork.jsx";
import { humanizeLabel } from "../utils/displayLabels.js";
import ClickableCard from "../components/ClickableCard.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import StatCard from "../components/StatCard.jsx";
import { number, pct } from "../utils/formatters.js";

const GLYPHS = {
  boss: "♛",
  relic: "✧",
  achievement: "★",
  job: "✦",
  title: "◇",
  milestone: "◆",
};

function detailFor(trophy) {
  if (trophy.type === "boss" && trophy.boss) return { type: "boss", boss: trophy.boss };
  if (trophy.type === "relic" && trophy.relic) return { type: "relic", relic: trophy.relic };
  if (trophy.type === "job" && trophy.job) return { type: "job", job: trophy.job };
  return null;
}

function FeaturedTrophy({ trophy, onDetail }) {
  const content = (
    <>
      {trophy.type === "relic" && trophy.relic ? <RelicArtwork relic={trophy.relic} stage={3} className="featured-relic-artwork" /> : null}
      <div className="trophy-glyph" aria-hidden="true">{GLYPHS[trophy.type] || "◇"}</div>
      <div className="slot-label">{trophy.eyebrow}</div>
      <strong>{trophy.name}</strong>
      <span>{trophy.meta}</span>
    </>
  );
  const detail = detailFor(trophy);
  return detail ? (
    <ClickableCard className={`featured-trophy rank-${trophy.rank || "common"}`} detail={detail} onOpen={onDetail}>
      {content}
    </ClickableCard>
  ) : <article className={`featured-trophy rank-${trophy.rank || "common"}`}>{content}</article>;
}

function CollectionPanel({ badge, children, title }) {
  return (
    <section className="panel span-12 trophy-collection">
      <div className="panel-title-row"><h2>{title}</h2><span className="small-badge">{badge}</span></div>
      {children}
    </section>
  );
}

export default function TrophyHall({ data, onDetail }) {
  const summary = data.summary || {};
  const featured = data.featured || [];
  const bosses = data.bosses || [];
  const relics = data.relics || [];
  const jobs = data.mastered_jobs || [];
  const achievements = data.achievements || [];
  const milestones = data.milestones || [];
  const title = data.equipped_title;

  return (
    <div className="dashboard-grid trophy-hall">
      <section className="panel span-12 trophy-banner">
        <div>
          <p className="eyebrow">Crystal Guild Hall of Renown</p>
          <h2>{data.player?.display_name || "Adventurer"}'s Trophy Hall</h2>
          <p className="muted">A living display of completed Relics, mastered Jobs, rare achievements, and victories worth bragging about.</p>
        </div>
        <div className="trophy-title-inscription">
          <span>Equipped Title</span>
          <strong>“{title?.name || data.player?.title || "Fresh Recruit"}”</strong>
          {title?.rarity ? <small>{humanizeLabel(title.rarity)} distinction</small> : null}
        </div>
      </section>

      <section className="panel span-12">
        <div className="panel-title-row"><h2>Hall Summary</h2><span className="small-badge">Lifetime</span></div>
        <div className="stat-grid trophy-summary-grid">
          <StatCard current={summary.boss_clears} label="Boss Clears" />
          <StatCard current={summary.superboss_clears} label="Superboss Clears" />
          <StatCard current={summary.relics_completed} label="Relics Complete" />
          <StatCard current={summary.jobs_mastered} label="Jobs Mastered" />
          <StatCard current={summary.rare_achievements} label="Rare Achievements" />
          <StatCard current={summary.achievement_points} label="Achievement Points" />
        </div>
      </section>

      <section className="panel span-12 featured-display">
        <div className="panel-title-row"><h2>Featured Trophies</h2><span className="small-badge">Curated Automatically</span></div>
        {featured.length ? (
          <div className="featured-trophy-grid">
            {featured.map((trophy, index) => <FeaturedTrophy key={`${trophy.type}-${trophy.name}-${index}`} trophy={trophy} onDetail={onDetail} />)}
          </div>
        ) : <div className="trophy-empty">The cases are polished and ready. Go make something regrettably heroic happen.</div>}
      </section>

      <CollectionPanel badge={`${bosses.length} defeated`} title="Boss & Superboss Victories">
        <div className="trophy-card-grid">
          {bosses.length ? bosses.map((boss) => (
            <ClickableCard className="trophy-record-card" detail={{ type: "boss", boss }} key={boss.id || boss.name} onOpen={onDetail}>
              <BossArtwork boss={boss} className="boss-card-artwork" />
              <div className="slot-label">{humanizeLabel(boss.tier || "boss")}</div>
              <strong>{boss.name}</strong>
              <span>{number(boss.clears)} clears · Best {number(boss.best_damage)} damage</span>
            </ClickableCard>
          )) : <div className="muted">No boss victories recorded yet.</div>}
        </div>
      </CollectionPanel>

      <CollectionPanel badge={`${relics.length} complete`} title="Completed Relic Weapons">
        <div className="trophy-card-grid">
          {relics.length ? relics.map((relic) => (
            <ClickableCard className="trophy-record-card trophy-relic-card" detail={{ type: "relic", relic }} key={relic.id || relic.name} onOpen={onDetail}>
              <RelicArtwork relic={relic} stage={3} className="trophy-relic-artwork" />
              <div className="slot-label">{relic.job} Relic</div>
              <strong>{relic.name}</strong>
              <span>Zenith Complete{relic.completed_at ? ` · ${relic.completed_at}` : ""}</span>
            </ClickableCard>
          )) : <div className="muted">No completed Relic weapons yet.</div>}
        </div>
      </CollectionPanel>

      <CollectionPanel badge={`${jobs.length} mastered`} title="Mastered Jobs">
        <div className="trophy-card-grid">
          {jobs.length ? jobs.map((job) => (
            <ClickableCard className="trophy-record-card" detail={{ type: "job", job }} key={job.id || job.name} onOpen={onDetail}>
              <div className="slot-label">{humanizeLabel(job.tier)} Job</div>
              <strong>{job.name}</strong>
              <span>{job.mastery?.name || "JLv. 50 Mastery"}</span>
            </ClickableCard>
          )) : <div className="muted">No Jobs mastered yet.</div>}
        </div>
      </CollectionPanel>

      <CollectionPanel badge={`${achievements.length} earned`} title="Rare Achievements">
        <div className="trophy-card-grid">
          {achievements.length ? achievements.map((achievement) => (
            <article className={`trophy-record-card achievement-trophy tier-${achievement.tier || "silver"}`} key={achievement.id || achievement.name}>
              <div className="slot-label">{humanizeLabel(achievement.tier)} · {humanizeLabel(achievement.category)}</div>
              <strong>{achievement.name}</strong>
              <span>{achievement.description}</span>
              <small>{number(achievement.points)} points{achievement.reward_title ? ` · Title: ${achievement.reward_title}` : ""}</small>
            </article>
          )) : <div className="muted">No silver-or-higher achievements unlocked yet.</div>}
        </div>
      </CollectionPanel>

      <CollectionPanel badge="Career marks" title="Major Milestones">
        <div className="milestone-grid">
          {milestones.map((milestone) => (
            <article className={`milestone-card ${milestone.completed ? "complete" : ""}`} key={milestone.id}>
              <div className="milestone-head">
                <span className="slot-label">{milestone.completed ? "Completed" : "In Progress"}</span>
                <strong>{milestone.name}</strong>
              </div>
              <p>{milestone.description}</p>
              <ProgressBar value={pct(milestone.current, milestone.target)} />
              <small>{number(Math.min(milestone.current, milestone.target))} / {number(milestone.target)}</small>
            </article>
          ))}
        </div>
      </CollectionPanel>
    </div>
  );
}
