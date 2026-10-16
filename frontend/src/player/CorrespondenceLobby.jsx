import { useEffect, useState } from "react";

export function DuelStatus({ match, snapshot }) {
  const [now, setNow] = useState(Date.now);
  const live = match.mode === "live";
  useEffect(() => {
    if (!live) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [live, match.id]);
  const serverNow = snapshot?.server_now && snapshot?.received_at
    ? snapshot.server_now * 1000 + Math.max(0, now - snapshot.received_at) : now;
  const seconds = Math.max(0, Math.ceil((match.deadline * 1000 - serverNow) / 1000));
  const active = ["mulligan", "play"].includes(match.phase);
  const label = match.phase === "mulligan" ? match.opening_confirmed ? "Opening saved · waiting for opponent" : "Confirm your opening hand"
    : match.phase === "play" ? match.your_turn ? "Your turn" : "Opponent’s turn" : match.phase === "expired" ? "Duel expired" : "Duel finished";
  return <div className={`qb-duel-status ${match.your_turn ? "your-turn" : ""}`}>
    <strong role="status">{label}</strong>
    {active && (live ? <span className={`qb-live-clock ${seconds <= 20 ? "urgent" : ""}`} role="timer" aria-live="off" aria-label="Time remaining">
      {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
    </span> : <span>Deadline: {new Date(match.deadline * 1000).toLocaleString()}</span>)}
    {live && active && <small>Server clock · closing this page does not pause the timer.</small>}
  </div>;
}

export default function CorrespondenceLobby({ snapshot, selected, choose, send, refresh, disabled }) {
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState("correspondence");
  const stats = snapshot?.stats_by_mode?.[mode];
  return <div className="qb-correspondence">
    <p>Invite another adventurer for a live game or a saved correspondence duel. All 48 cards can be earned through solo play.</p>
    <form className="qb-start-actions" onSubmit={e => { e.preventDefault(); send({ kind: "invite", username: username.trim().replace(/^@/, ""), mode }, null); }}>
      <label>Play style<select aria-label="Duel play style" value={mode} onChange={e => setMode(e.target.value)}>
        <option value="correspondence">Correspondence · 48 hours per turn</option><option value="live">Live · 90 seconds per turn</option>
      </select></label>
      <label>Adventurer username <input aria-label="Adventurer username" value={username} maxLength={26} onChange={e => setUsername(e.target.value)} placeholder="Twitch username" /></label>
      <button disabled={disabled || !username.trim()}>Invite to duel</button><button type="button" onClick={refresh}>Refresh duels</button>
    </form>
    <p className="qb-footnote">{mode === "live" ? "Live: invitations expire in 10 minutes. Both players confirm an opening hand within 3 minutes, then have 90 seconds per turn."
      : "Correspondence: invitations expire in 48 hours. Both players confirm an opening hand within 24 hours, then have 48 hours per turn."} Missed opening deadlines cancel the duel; missed turn deadlines count as a loss.</p>
    {stats && <p className="qb-footnote">Your {mode} record: {stats.wins} wins · {stats.losses} losses · {stats.draws} draws</p>}
    <p className="qb-footnote">Acceptance locks in both active saved decks. Up to three invitations and three active duels per player. Casual records only; no currency wagers or card loss.</p>
    <div className="qb-duel-list">{snapshot?.matches.map(item => <article key={item.id} className="qb-duel-row">
      <div><strong>{item.opponent} <small className="qb-mode-badge">{item.mode === "live" ? "Live · 90s" : "Correspondence · 48h"}</small></strong>
        <span>{item.phase === "play" ? item.match.your_turn ? "Your turn" : "Waiting for opponent" : item.phase === "mulligan" ? item.match.opening_confirmed ? "Waiting for opening hand" : "Confirm your opening hand" : item.phase}{item.reason ? ` · ${item.reason.replaceAll("_", " ")}` : ""}</span>
        {["pending", "mulligan", "play"].includes(item.phase) && <small>Deadline: {new Date(item.deadline * 1000).toLocaleString()}</small>}</div>
      <div className="qb-start-actions">{item.phase === "pending" ? item.incoming ? <><button disabled={disabled} onClick={() => send({ kind: "accept" }, item)}>Accept</button><button disabled={disabled} onClick={() => send({ kind: "decline" }, item)}>Decline</button></> : <button disabled={disabled} onClick={() => send({ kind: "cancel" }, item)}>Cancel invitation</button>
        : item.match && <button aria-pressed={selected === item.id} onClick={() => choose(item.id)}>Open duel</button>}</div>
    </article>)}</div>
    {snapshot && !snapshot.matches.length && <p>No duels yet. Invite another recruited adventurer to begin.</p>}
  </div>;
}
