import { InitiativeCards } from "../components/InitiativeCards.jsx";

export default function GuildBoard({ data }) {
  const board = data?.board || {};
  if (data?.sync_pending || !board.daily?.objectives) {
    return <section className="panel span-12"><h2>Daily &amp; Weekly Guild Board</h2><p className="muted">The Guild Board will become available when the updated Bot and Web finish syncing.</p></section>;
  }
  return (
    <div className="dashboard-grid guild-initiatives-page">
      <section className="panel span-12">
        <div className="panel-title-row"><div><span className="panel-kicker">Optional activities</span><h2>Daily &amp; Weekly Guild Board</h2></div><span className="small-badge">Rewards issued automatically</span></div>
        <p className="muted">Your regular gameplay advances these objectives automatically. Daily and weekly rotations are independent; the same verified activity can count toward both and toward Fellowship Contracts.</p>
      </section>
      <section className="panel span-12">
        <div className="panel-title-row"><div><span className="panel-kicker">Resets at 00:00 UTC</span><h2>Daily Objectives</h2></div><span className="small-badge">{board.daily?.completed || 0} / {board.daily?.total || 3} · {board.daily?.period || "Today"}</span></div>
        <InitiativeCards objectives={board.daily?.objectives || []} />
      </section>
      <section className="panel span-12">
        <div className="panel-title-row"><div><span className="panel-kicker">Resets Monday 00:00 UTC</span><h2>Weekly Objectives</h2></div><span className="small-badge">{board.weekly?.completed || 0} / {board.weekly?.total || 3} · {board.weekly?.period || "This week"}</span></div>
        <InitiativeCards objectives={board.weekly?.objectives || []} />
      </section>
    </div>
  );
}
