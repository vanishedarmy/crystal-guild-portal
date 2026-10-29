import { useState } from "react";

/** Limit Gauge for player-paced single-hero combat (Ventures, Expeditions, Dungeons). */
export default function LimitGauge({ limit, disabled = false, onUse }) {
  const [chosenTier, setChosenTier] = useState(0);
  const techniques = Array.isArray(limit?.techniques) ? limit.techniques : [];
  const chosen = techniques.find((row) => Number(row.level) === chosenTier) || techniques[techniques.length - 1];
  const gauge = Math.max(0, Math.min(100, Number(limit?.charge || 0)));
  return <section className={`combat-limit-panel ${limit?.ready ? "is-ready" : ""}`} aria-label="Limit Break charge">
    <div className="combat-limit-heading"><strong>LIMIT BREAK</strong><span aria-live="polite">{limit?.unlocked ? (limit.ready ? "READY — 100%" : `${gauge}% / 100%`) : "Unlocks at Job Lv. 50"}</span></div>
    <div className="combat-limit-track" role="progressbar" aria-label="Limit Break gauge" aria-valuemin={0} aria-valuemax={100} aria-valuenow={gauge}><div className="combat-limit-fill" style={{ width: `${gauge}%` }}/></div>
    {chosen ? <div className="combat-limit-actions">
      <label className="combat-limit-choice">Technique<select aria-label="Limit Break tier" value={chosen.level} onChange={(event) => setChosenTier(Number(event.target.value))}>{techniques.map((row)=><option key={row.level} value={row.level}>Lv.{row.level} — {row.name}</option>)}</select></label>
      <button type="button" className="combat-limit-activate" disabled={disabled || !limit.ready} onClick={() => onUse?.(chosen.level)}>{limit.ready ? `UNLEASH ${chosen.name}` : `Charging ${chosen.name}`}</button>
    </div> : <p className="combat-limit-hint">Your first Job Limit Break unlocks at level 50.</p>}
    {limit?.ready ? <p className="combat-limit-hint combat-limit-ready-hint">Full gauge! This move takes your battle action and costs no MP/AP.</p> : null}
  </section>;
}
