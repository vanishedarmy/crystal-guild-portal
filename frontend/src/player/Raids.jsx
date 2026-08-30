import { useEffect, useMemo, useState } from "react";
import { getJson } from "../api/client.js";
import ProgressBar from "../components/ProgressBar.jsx";
import { duration, number, pct } from "../utils/formatters.js";

const FEATURED_TRIAL = {
  name: "Ifrit",
  encounter: "Inferno Crucible",
  level: 25,
  hp: 18000,
};

function mechanicCopy(mechanic) {
  if (!mechanic?.name) return "No special mechanic is currently telegraphed.";
  if (mechanic.kind === "targeted") return `${mechanic.name} targets ${mechanic.target || "one raider"}. Defend or prepare support.`;
  if (mechanic.kind === "raidwide") return `${mechanic.name} is raidwide. Prepare mitigation and recovery.`;
  if (mechanic.kind === "damage_check") return `${mechanic.name}: ${number(mechanic.progress || 0)} / ${number(mechanic.required || 0)} damage · ${number(mechanic.rounds_remaining || 0)} round${Number(mechanic.rounds_remaining || 0) === 1 ? "" : "s"} remaining.`;
  return mechanic.warning || mechanic.name;
}

export default function Raids() {
  const [state, setState] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      try {
        const payload = await getJson(`/api/overlay/state?ts=${Date.now()}`, { timeoutMs: 7000 });
        if (!cancelled) setState(payload);
      } catch {
        if (!cancelled) setState((previous) => previous || { available: false, active: false, status: "IDLE" });
      }
    };
    refresh();
    const poll = window.setInterval(refresh, 2500);
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
      window.clearInterval(clock);
    };
  }, []);

  const active = Boolean(state?.available && state?.active);
  const nextRound = useMemo(() => Math.max(0, Number(state?.next_round_at || 0) - Math.floor(now / 1000)), [state?.next_round_at, now]);
  const leaders = Array.isArray(state?.top) ? state.top.slice(0, 5) : [];

  return (
    <section className={`panel raid-board-panel ${active ? "active" : "idle"}`} aria-labelledby="raid-board-title">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Trails &amp; Raids · Alpha 1</p>
          <h2 id="raid-board-title">Trial &amp; Raid Board</h2>
          <p className="muted">Raid combat remains Twitch-first. The Portal now mirrors live telegraphs, damage checks, phase state, and contribution standings.</p>
        </div>
        <span className={`small-badge ${active ? "success" : ""}`}>{active ? String(state?.status || "ACTIVE") : "Standby"}</span>
      </div>

      {active ? (
        <div className="raid-board-live" aria-live="polite">
          <div className="raid-board-boss-row">
            <div>
              <span>{state?.encounter_type || state?.tier || "Raid"}</span>
              <strong>{state?.boss || "Raid Boss"}</strong>
              <small>{state?.encounter_name && state.encounter_name !== state.boss ? state.encounter_name : state?.phase || "Battle"}</small>
            </div>
            <div className="raid-board-round">
              <span>Round {number(state?.round || 0)}</span>
              <strong>{nextRound > 0 ? duration(nextRound) : "Resolving"}</strong>
              <small>{state?.phase || "Battle"}</small>
            </div>
          </div>

          <div className="raid-board-vitals">
            <div className="raid-board-vital-copy"><span>Boss HP</span><strong>{number(state?.hp || 0)} / {number(state?.max_hp || 0)}</strong></div>
            <ProgressBar value={pct(state?.hp, state?.max_hp)} className="hp" />
            <div className="raid-board-vital-meta"><span>{number(state?.alive || 0)} / {number(state?.raiders || 0)} raiders standing</span><span>Summon {number(state?.summon_gauge || 0)}%</span></div>
          </div>

          <div className={`raid-mechanic-callout ${state?.mechanic?.kind || "none"}`}>
            <span>Current Telegraph</span>
            <strong>{state?.mechanic?.name || "Standard boss pressure"}</strong>
            <small>{mechanicCopy(state?.mechanic)}</small>
          </div>

          <div className="raid-board-contributions">
            <div className="raid-board-section-head"><span>Contribution</span><small>Damage + weighted healing + mitigation</small></div>
            {leaders.length ? (
              <div className="raid-contribution-grid">
                {leaders.map((entry, index) => (
                  <div className="raid-contribution-row" key={`${entry?.name || "raider"}:${index}`}>
                    <b>#{index + 1}</b><strong>{entry?.name || "Adventurer"}</strong><span>{number(entry?.score || 0)} pts</span>
                    <small>{number(entry?.damage || 0)} dmg · {number(entry?.healing || 0)} heal · {number(entry?.mitigation || 0)} mit</small>
                  </div>
                ))}
              </div>
            ) : <p className="muted raid-board-empty">Contribution standings appear once combat begins.</p>}
          </div>
        </div>
      ) : (
        <div className="raid-featured-trial">
          <div className="raid-featured-art" aria-hidden="true"><img src="/retro-phase-ii/boss-art-v1/ifrit.webp" alt="" loading="lazy" decoding="async" /></div>
          <div className="raid-featured-copy">
            <span className="slot-label">Alpha 1 Flagship Trial · Recommended Lv.{FEATURED_TRIAL.level}</span>
            <h3>{FEATURED_TRIAL.name} — {FEATURED_TRIAL.encounter}</h3>
            <p>Alternating targeted and raidwide telegraphs lead into <strong>Infernal Nails</strong>, a two-round damage check. Break the check to weaken <strong>Hellfire</strong>; miss it and the blast is empowered.</p>
            <div className="raid-featured-stats"><span><b>{number(FEATURED_TRIAL.hp)}</b> HP</span><span><b>90s</b> rally</span><span><b>60s</b> rounds</span></div>
            <p className="muted">Streamer: <code>!spawnboss ifrit</code> · Raiders: <code>!raid</code> · During combat: <code>!attack</code>, <code>!ability</code>, <code>!defend</code>, <code>!use</code>, <code>!limit</code>, <code>!summon</code>, <code>!raidstats</code>.</p>
          </div>
        </div>
      )}
    </section>
  );
}
