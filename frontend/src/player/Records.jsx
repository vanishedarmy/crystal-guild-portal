import { useEffect, useMemo, useRef, useState } from "react";
import BossArtwork from "../components/BossArtwork.jsx";
import { DetailsPointer } from "../components/CollapsePointer.jsx";
import { humanizeLabel } from "../utils/displayLabels.js";
import ClickableCard from "../components/ClickableCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { number } from "../utils/formatters.js";
import {
  filterMomentEntries, formatPersonalBest, personalBestContext, personalBestEmptyMessage,
  personalRecordCategories, readableRecordDate, momentBadgeSrc, selectNewMomentNotices,
} from "../utils/recordsMoments.js";

function RecordPanel({ badge, children, className = "span-6", title, initiallyOpen = false }) {
  return (
    <details className={`panel record-section ${className}`} open={initiallyOpen ? true : undefined}>
      <summary className="panel-title-row record-section-summary">
        <h2>{title}</h2>
        <span className="record-section-tools">
          {badge ? <span className="small-badge">{badge}</span> : null}
          <DetailsPointer />
        </span>
      </summary>
      <div className="record-section-body">{children}</div>
    </details>
  );
}

function RivalryCard({ eyebrow, record, empty, value }) {
  return (
    <div className="record-feature-card">
      <div className="slot-label">{eyebrow}</div>
      <strong>{record?.name || empty}</strong>
      <span>{record ? value(record) : "The next chapter is still yours to write."}</span>
    </div>
  );
}

function PersonalBestCard({ record }) {
  const isRecorded = record.status === "recorded";
  const context = isRecorded ? personalBestContext(record) : "";
  const date = isRecorded ? readableRecordDate(record.occurred_at) : "";
  return (
    <article className={`personal-best-card ${isRecorded ? "is-recorded" : "is-unset"}`}>
      <span className="slot-label">{record.title}</span>
      <strong>{formatPersonalBest(record)}</strong>
      <span className="personal-best-description">
        {isRecorded ? (context || "A personal best worth remembering.") : personalBestEmptyMessage(record)}
      </span>
      {date ? <small>Set {date}</small> : null}
    </article>
  );
}

function PersonalBests({ data }) {
  const catalog = data?.personal_records;
  if (!catalog || !Array.isArray(catalog.records)) {
    return <section className="panel span-12 record-new-collection"><h2>Personal Records</h2><p className="muted">Your expanded ledger opens with the matching Guild update.</p></section>;
  }
  const records = catalog.records;
  const bestHit = records.find((row) => row.id === "highest_hit");
  const bestPurchase = records.find((row) => row.id === "biggest_purchase");
  const bestStreak = records.find((row) => row.id === "longest_cactpot_loss_streak");
  return (
    <section className="panel span-12 record-new-collection">
      <div className="panel-title-row">
        <div><p className="eyebrow">The Adventurer's Ledger</p><h2>Personal Records</h2></div>
        <span className="small-badge">{number(records.filter((record) => record.status === "recorded").length)} / {number(records.length)} recorded</span>
      </div>
      <p className="record-intro-copy">The great victories, the costly decisions and the tales you'll swear were intentional.</p>
      <div className="record-highlights" aria-label="Personal record highlights">
        <div><span>Hardest Hit</span><strong>{formatPersonalBest(bestHit)}</strong></div>
        <div><span>Biggest Shopping Spree</span><strong>{formatPersonalBest(bestPurchase)}</strong></div>
        <div><span>Cactpot Loss Streak</span><strong>{formatPersonalBest(bestStreak)}</strong></div>
      </div>
      <div className="record-category-list">
        {personalRecordCategories.map((category, i) => {
          const belonging = records.filter((record) => record.category === category.id);
          if (!belonging.length) return null;
          return (
            <details className="record-category" key={category.id} open={i === 0 ? true : undefined}>
              <summary className="record-category-summary">
                <span className="record-category-heading"><strong>{category.title}</strong><small>{category.description}</small></span>
                <span className="record-category-meta"><span className="small-badge">{belonging.filter((row) => row.status === "recorded").length} / {belonging.length}</span><DetailsPointer /></span>
              </summary>
              <div className="personal-best-grid">{belonging.map((record) => <PersonalBestCard key={record.id} record={record} />)}</div>
            </details>
          );
        })}
      </div>
      {catalog.scope_note ? <p className="muted record-history-note">Earlier adventures count wherever the Guild kept a reliable record. New details start with the first qualifying result after tracking began.</p> : null}
    </section>
  );
}

function MomentCard({ moment }) {
  // The server sends a sealed slot instead of the secret's true ID, rules,
  // title, tier or badge until THIS player owns it. No catalog on the client.
  const sealed = moment.secret && !moment.unlocked;
  const badgeSrc = momentBadgeSrc(moment);
  const awardedDate = moment.unlocked ? readableRecordDate(moment.unlocked_at) : "";
  return (
    <article className={`record-moment-card ${moment.unlocked ? "is-earned" : "is-locked"} ${sealed ? "is-secret" : ""}`}>
      <div className="record-moment-top">
        <span className={`record-moment-seal ${moment.unlocked ? "earned" : ""}`} aria-hidden="true">{badgeSrc ? <img src={badgeSrc} alt="" loading="lazy" /> : sealed ? "?" : "◇"}</span>
        <span className="record-moment-status">{moment.unlocked ? "Moment discovered" : sealed ? "Secret Moment" : "Waiting to happen"}</span>
        {moment.tier && !sealed ? <span className={`achievement-tier ${moment.tier}`}>{humanizeLabel(moment.tier)}</span> : null}
      </div>
      <h3>{moment.name}</h3>
      <p>{moment.description}</p>
      {sealed && moment.hint ? <p className="record-moment-hint">Guild rumor: {moment.hint}</p> : null}
      {moment.reward_title && !sealed ? <div className="record-moment-reward"><span>Title</span><strong>{moment.reward_title}</strong></div> : null}
      {moment.unlocked && moment.trophy_reward ? <div className="record-moment-trophy"><span>Hall of Trophies</span><strong>{moment.trophy_reward.name}</strong></div> : null}
      {moment.unlocked ? <small>{moment.historical ? "Recognized from your earlier adventures" : "Earned on your adventures"}{awardedDate ? ` · ${awardedDate}` : ""}</small> : null}
    </article>
  );
}

function MomentsCollection({ moments, player }) {
  const [status, setStatus] = useState("all");
  const [newDiscoveries, setNewDiscoveries] = useState([]);
  const lastNoticeSnapshot = useRef("");
  const [category, setCategory] = useState("All");
  const entries = Array.isArray(moments?.entries) ? moments.entries : [];
  const categories = useMemo(() => ["All", ...new Set(entries.map((item) => item.category).filter(Boolean))], [entries]);
  const shown = useMemo(() => filterMomentEntries(entries, status, category), [entries, status, category]);
  const unlocked = entries.filter((moment) => moment.unlocked).length;
  const playerKey = String(player?.username || player?.display_name || "").trim().toLowerCase();
  const earnedSignature = entries.filter((item) => item.unlocked).map((item) => `${item.id}:${item.unlocked_at || ""}`).join("|");
  useEffect(() => {
    if (!playerKey || !Array.isArray(moments?.entries)) return;
    const signature = `${playerKey}/${earnedSignature}`;
    if (lastNoticeSnapshot.current === signature) return;
    lastNoticeSnapshot.current = signature;
    const storageKey = `crystal-guild:moments:seen:${playerKey}`;
    let seen = [];
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
      if (Array.isArray(saved)) seen = saved.filter((id) => typeof id === "string");
    } catch { /* browser storage may be unavailable */ }
    const recent = selectNewMomentNotices(moments.entries, seen).slice(0, 3);
    setNewDiscoveries(recent);
    const known = new Set([...seen, ...moments.entries.filter((item) => item.unlocked).map((item) => item.id)]);
    try { window.localStorage.setItem(storageKey, JSON.stringify([...known])); } catch { /* notices are optional */ }
  }, [playerKey, earnedSignature, moments?.entries]);
  if (!moments || !Array.isArray(moments.entries)) {
    return <section className="panel span-12 record-new-collection"><h2>Moments</h2><p className="muted">Your Moment collection opens with the matching Guild update.</p></section>;
  }
  return (
    <section className="panel span-12 record-new-collection" id="moments-collection">
      <div className="panel-title-row">
        <div><p className="eyebrow">Worth telling the tavern about</p><h2>Moments</h2></div>
        <span className="small-badge">{number(unlocked)} / {number(moments.summary?.total ?? entries.length)} discovered</span>
      </div>
      <p className="record-intro-copy">Some stories take skill. Others take spectacularly poor judgment. Both deserve a place in the Guild's history.</p>
      {newDiscoveries.length ? (
        <div className="moment-discovery-notice" role="status" aria-live="polite" aria-label="New Moment discoveries">
          <div className="moment-discovery-heading"><strong>{newDiscoveries.length === 1 ? "A new Moment for your ledger!" : "New Moments for your ledger!"}</strong><button type="button" onClick={() => setNewDiscoveries([])} aria-label="Dismiss Moment discoveries">Dismiss</button></div>
          <div className="moment-discovery-list">{newDiscoveries.map((entry) => (
            <div className="moment-discovery-item" key={entry.id}>
              {momentBadgeSrc(entry) ? <img src={momentBadgeSrc(entry)} alt="" loading="lazy" /> : null}
              <div><strong>{entry.name}</strong><span>Title earned: {entry.reward_title}</span><small>{entry.trophy_reward ? "An extraordinary tale—and a new Hall of Trophies keepsake." : "The Guild will be talking about this one."}</small></div>
            </div>
          ))}</div>
        </div>
      ) : null}
      <div className="record-moment-filters" aria-label="Filter Moments">
        <div className="filter-row compact" role="group" aria-label="Moment discovery status">
          {[["all", "All"], ["earned", "Discovered"], ["undiscovered", "Undiscovered"]].map(([key, label]) => (
            <button type="button" key={key} aria-pressed={status === key} className={`filter-chip ${status === key ? "active" : ""}`} onClick={() => setStatus(key)}>{label}</button>
          ))}
        </div>
        <div className="filter-row compact" role="group" aria-label="Moment category">
          {categories.map((name) => <button type="button" key={name} aria-pressed={category === name} className={`filter-chip ${category === name ? "active" : ""}`} onClick={() => setCategory(name)}>{humanizeLabel(name)}</button>)}
        </div>
      </div>
      {shown.length ? <div className="record-moment-grid">{shown.map((moment) => <MomentCard moment={moment} key={moment.id} />)}</div> : <p className="muted record-no-moments">No Moments match these filters. The Guild assures you that this is temporary.</p>}
      <p className="muted record-history-note">Secret Moments keep their names and rewards sealed until you earn them. New discoveries are saved automatically; any eligible earlier purchases or Cactpot streaks are recognized from reliable history.</p>
    </section>
  );
}

export default function Records({ data, onDetail }) {
  const career = data.career || {};
  const combat = data.combat || {};
  const economy = data.economy || {};
  const progression = data.progression || {};
  const rivalries = data.rivalries || {};
  const bosses = data.bosses || [];
  const trials = data.trials || [];
  const trialSummary = data.trial_summary || {};
  const careerEntries = [
    ["Adventures", career.ventures], ["Monsters Defeated", career.monsters_defeated],
    ["Hunt Clears", career.hunt_clears], ["Boss Clears", career.boss_clears],
    ["Times KO'd", career.deaths], ["Camp Rests", career.rests],
    ["Raid Revives", career.raid_revives], ["Summons Called", career.summons_called],
  ];
  const combatEntries = [
    ["Tracked Battles", combat.battles], ["Damage Dealt", combat.damage_dealt],
    ["Best Single Hit", combat.best_hit], ["Healing Done", combat.healing_done],
    ["Damage Taken", combat.damage_taken], ["Damage Mitigated", combat.damage_mitigated],
    ["Raid Damage", combat.raid_damage], ["Best Boss Damage", combat.best_boss_damage],
  ];
  const economyEntries = [
    ["Gil Earned", economy.gil_earned], ["Gil Spent", economy.gil_spent],
    ["Items Acquired", economy.items_acquired], ["Items Spent", economy.items_spent],
    ["Seals Earned", economy.hunt_seals_earned], ["Seals Spent", economy.hunt_seals_spent],
  ];
  return (
    <div className="dashboard-grid records-dashboard">
      <PersonalBests data={data} />
      <MomentsCollection moments={data.moments} player={data.player} />

      <RecordPanel badge="Lifetime" initiallyOpen title="Career Record">
        <div className="stat-grid record-stat-grid">{careerEntries.map(([label, value]) => <StatCard current={value} key={label} label={label} />)}</div>
      </RecordPanel>
      <RecordPanel badge="Combat" initiallyOpen title="Battle Record">
        <div className="stat-grid record-stat-grid">{combatEntries.map(([label, value]) => <StatCard current={value} key={label} label={label} />)}</div>
      </RecordPanel>
      <RecordPanel badge="Guild Economy" className="span-5" title="Economy">
        <div className="stat-grid record-stat-grid record-stat-grid-compact">{economyEntries.map(([label, value]) => <StatCard current={value} key={label} label={label} />)}</div>
      </RecordPanel>
      <RecordPanel badge="Completion" className="span-7" title="Progression">
        <div className="record-progress-grid">
          <StatCard current={progression.jobs_mastered} label="Jobs Mastered" />
          <StatCard current={progression.bestiary_discovered} label="Bestiary" max={progression.bestiary_total} />
          <StatCard current={progression.achievements_unlocked} label="Achievements" max={progression.achievements_total} />
          <StatCard current={career.relics_completed} label="Relics Completed" />
          <StatCard current={career.crafts} label="Crafts" />
          <StatCard current={career.forge_upgrades} label="Forge Upgrades" />
        </div>
      </RecordPanel>
      <RecordPanel badge={trialSummary.rank || "Unproven"} className="span-12" title="Trial Chronicle">
        <div className="record-progress-grid trial-record-summary-grid">
          <StatCard current={trialSummary.unique_clears || 0} label="Unique Trials" max={trialSummary.total_trials || trials.length || 7} />
          <StatCard current={trialSummary.total_clears || 0} label="Trial Clears" />
          <StatCard current={trialSummary.tracked_wipes || 0} label="Tracked Wipes" />
          <StatCard current={trialSummary.best_score || 0} label="Best Contribution" />
          <StatCard current={trialSummary.mastered_trials || 0} label="Mastered Trials" max={trialSummary.total_trials || trials.length || 7} />
        </div>
        <div className="trial-record-grid">
          {trials.map((trial) => (
            <div className={`trial-record-card ${Number(trial.clears || 0) > 0 ? "cleared" : "uncleared"}`} key={trial.id}>
              <div className="trial-record-card-head"><div><span className="slot-label">{trial.capstone ? "Capstone Trial" : "Flagship Trial"}</span><strong>{trial.name} — {trial.encounter_name}</strong></div><span className={`small-badge ${Number(trial.clears || 0) > 0 ? "success" : ""}`}>{Number(trial.clears || 0) > 0 ? `${number(trial.clears)} clear${Number(trial.clears) === 1 ? "" : "s"}` : "Uncleared"}</span></div>
              <div className="trial-record-card-stats"><span><b>{trial.fastest_clear_rounds ? `R${number(trial.fastest_clear_rounds)}` : "—"}</b><small>Fastest</small></span><span><b>{number(trial.best_score || 0)}</b><small>Best Score</small></span><span><b>{number(trial.best_damage || 0)}</b><small>Damage</small></span><span><b>{number(trial.best_healing || 0)}</b><small>Healing</small></span><span><b>{number(trial.best_mitigation || 0)}</b><small>Mitigation</small></span><span><b>{number(trial.wipes || 0)}</b><small>Tracked Wipes</small></span></div><div className="trial-repeat-mastery"><span>{trial.repeat_mastery || "Uncleared"}</span><small>{trial.next_clear_goal ? `${number(trial.clears || 0)} / ${number(trial.next_clear_goal)} clears to next repeat milestone` : "10+ clears · repeat mastery complete"}</small></div>
            </div>
          ))}
        </div>
        <p className="muted trial-record-note">Your earlier Trial wins are safe. Detailed round times, wipes, and contribution records start with Beta 1 because we didn’t track those details before then.</p>
      </RecordPanel>
      <RecordPanel badge="Personal History" className="span-12" title="Rivalries & Identity">
        <div className="record-feature-grid">
          <RivalryCard empty="No favorite Job yet" eyebrow="Most Used Job" record={rivalries.favorite_job} value={(row) => `${number(row.battles)} battles · ${number(row.victories)} victories`} />
          <RivalryCard empty="No monster defeated yet" eyebrow="Favorite Victim" record={rivalries.most_defeated} value={(row) => `${number(row.defeats)} defeats recorded`} />
          <RivalryCard empty="No Nemesis yet" eyebrow="Nemesis" record={rivalries.nemesis} value={(row) => `${number(row.knockouts)} KOs against you · ${number(row.victories)} victories`} />
        </div>
      </RecordPanel>
      <RecordPanel badge={`${bosses.length} recorded`} className="span-12" title="Boss Victories">
        <div className="boss-grid">
          {bosses.length ? bosses.map((boss) => (
            <ClickableCard className="boss-card" detail={{ type: "boss", boss }} key={boss.id || boss.name} onOpen={onDetail}>
              <BossArtwork boss={boss} className="boss-card-artwork" />
              <div className="slot-label">{humanizeLabel(boss.tier)}</div>
              <div className="boss-name">{boss.name}</div>
              <div className="card-meta">{number(boss.clears)} clears · Best {number(boss.best_damage)} damage</div>
            </ClickableCard>
          )) : <div className="muted">Your first boss victory will appear here.</div>}
        </div>
      </RecordPanel>
    </div>
  );
}
