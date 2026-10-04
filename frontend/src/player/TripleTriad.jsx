import LockIcon from "../components/LockIcon.jsx";
import { useEffect, useState } from "react";
import { submitTriadSetDeck, submitTriadStart, submitTriadPlay } from "../api/auth.js";
import { DetailsPointer } from "../components/CollapsePointer.jsx";
import "../styles/triple-triad.css";

const TRIAD_ART_ROOT = "/gold-saucer/a5h5/triple-triad";
const BACK = `${TRIAD_ART_ROOT}/cards/card-back.webp`;
const tabs = ["Play", "Deck", "Collection", "Opponents", "Rules"];
const list = (value) => Array.isArray(value) ? value : [];
const records = (value) => list(value).filter((v) => v && typeof v === "object" && !Array.isArray(v));
const displayText = (value, fallback = "—") => ["string", "number"].includes(typeof value) ? String(value) : fallback;
const stars = (n) => "★".repeat(Math.max(1, Math.min(5, Number(n) || 1)));
const triadAccessibleLabel = (card) => `${displayText(card?.name, "Unknown Card")}, ${displayText(card?.rarity, "1")} stars. Top ${displayText(card?.top, "0")}, right ${displayText(card?.right, "0")}, bottom ${displayText(card?.bottom, "0")}, left ${displayText(card?.left, "0")}.`;

function ArtImage({ src, fallbackSrc = "", ...props }) {
  return (
    <img loading="lazy" decoding="async"
      {...props}
      src={src}
      onError={(event) => {
        const image = event.currentTarget;
        if (fallbackSrc && image.dataset.fallbackAttempted !== "1") {
          image.dataset.fallbackAttempted = "1";
          image.src = fallbackSrc;
          return;
        }
        image.hidden = true;
      }}
    />
  );
}

export function TriadCard({ card, owner = "player", selected = false, disabled = false, onClick, locked = false }) {
  const content = <span className="triad-card-art" aria-hidden="true"><ArtImage src={locked ? BACK : card.art || `/gold-saucer/rc2h1/triple-triad/cards/${card.id}.webp`} fallbackSrc={BACK} alt="" /></span>;
  const className = `triad-card full-face owner-${owner} ${selected ? "selected" : ""} ${locked ? "locked" : ""}`;
  return onClick ? <button type="button" className={className} onClick={onClick} disabled={disabled} aria-pressed={selected} aria-label={triadAccessibleLabel(card)}>{content}</button> : <div className={className} role="img" aria-label={locked ? `Unowned: ${triadAccessibleLabel(card)}` : triadAccessibleLabel(card)}>{content}</div>;
}

export default function TripleTriad({ triad, busy, mutate, actionsAvailable, csrfToken, actionKey, mgp }) {
  const [tab, setTab] = useState("Play");
  const [expanded, setExpanded] = useState(Boolean(triad.active));
  const [draft, setDraft] = useState(null);
  const [selected, setSelected] = useState("");
  const [opponentId, setOpponentId] = useState("saucer_attendant");
  const [query, setQuery] = useState("");
  const [rarity, setRarity] = useState("all");
  const [ownership, setOwnership] = useState("all");
  const collection = records(triad.collection).sort((a, b) => Number(a.rarity) - Number(b.rarity) || displayText(a.name).localeCompare(displayText(b.name)));
  const opponents = records(triad.opponents);
  const circuits = records(triad.circuits);
  const deck = draft ?? list(triad.deck);
  const active = Boolean(triad.active);
  const match = triad.match;
  const hand = records(match?.player_hand);
  const npcHand = records(match?.npc_hand);
  const opponent = opponents.find((o) => o.id === opponentId) || opponents[0];
  const matchOpponent = opponents.find((o) => o.id === match?.opponent_id);
  const dirty = JSON.stringify(deck) !== JSON.stringify(list(triad.deck));
  const blocked = !actionsAvailable || Boolean(busy);
  const visible = collection.filter((c) => (!query || displayText(c.name).toLowerCase().includes(query.toLowerCase())) && (rarity === "all" || c.rarity === Number(rarity)) && (ownership === "all" || (ownership === "owned" ? c.owned : !c.owned)));
  useEffect(() => {
    if (selected && !hand.some((c) => c.id === selected)) setSelected("");
  }, [match, selected]);
  useEffect(() => {
    if (active) { setTab("Play"); setExpanded(true); }
  }, [match?.id, active]);
  useEffect(() => {
    if (draft && JSON.stringify(draft) === JSON.stringify(list(triad.deck))) setDraft(null);
  }, [triad.deck, draft]);
  const chooseOpponent = (o) => { setOpponentId(o.id); setTab("Play"); };
  const start = () => mutate("triad-start", () => submitTriadStart(opponent?.id, csrfToken, actionKey("triad-start", opponent?.id)), `Challenging ${opponent?.name}…`);
  const toggleCard = (id) => setDraft((current) => {
    const ids = current ?? list(triad.deck);
    return ids.includes(id) ? ids.filter((v) => v !== id) : ids.length < 5 ? [...ids, id] : ids;
  });
  const filteredCards = (editing = false) => <div className="tt-collection-grid">{visible.filter((c) => !editing || c.owned).map((c) => <article className={`tt-folio ${c.owned ? "" : "unowned"}`} key={c.id}>
    <TriadCard card={c} locked={!c.owned} selected={editing && deck.includes(c.id)} disabled={blocked || active || (!deck.includes(c.id) && deck.length >= 5)} onClick={editing ? () => toggleCard(c.id) : undefined} />
    <div className="tt-card-info"><strong>{displayText(c.name)}</strong><span className={`tt-rarity rarity-${c.rarity}`}>{stars(c.rarity)} <small>{c.owned ? `Owned ×${c.quantity || 1}` : "Unowned"}</small></span><small>↑ {c.top} · → {c.right} · ↓ {c.bottom} · ← {c.left}</small>{!editing && <small>{c.starter ? "Starter collection" : records(c.sources).map((source) => source.name).join(" / ") || "Opponent reward"}</small>}</div>
  </article>)}</div>;
  const filters = <div className="tt-filters"><label>Find a card<input type="search" placeholder="Card name…" value={query} onChange={(e) => setQuery(e.target.value)} /></label><label>Rarity<select value={rarity} onChange={(e) => setRarity(e.target.value)}><option value="all">All rarities</option>{[1,2,3,4,5].map((r) => <option key={r} value={r}>{stars(r)}</option>)}</select></label>{tab === "Collection" && <label>Show<select value={ownership} onChange={(e) => setOwnership(e.target.value)}><option value="all">All cards</option><option value="owned">Owned</option><option value="missing">Missing</option></select></label>}</div>;
  return <details className="panel saucer-triad-panel saucer-section-disclosure tt-rework" open={expanded} onToggle={(event) => setExpanded(event.currentTarget.open)}>
    <summary className="saucer-section-summary"><div><p className="eyebrow">The Card Hall</p><h3>Triple Triad</h3></div><span className="small-badge">{triad.owned_count || 0} / {triad.total_cards || 45} cards</span><DetailsPointer className="saucer-details-pointer" /></summary>
    <div className="saucer-section-body triad-section-body">
      <div className="tt-welcome"><div><span className="eyebrow">Build your hand. Find your edge.</span><p>Five cards, nine spaces, and a growing collection.</p></div><span className="small-badge">{triad.matches_remaining ?? 5} / {triad.daily_matches || 5} entries left</span></div>
      <nav className="tt-tabs" aria-label="Triple Triad sections">{tabs.map((t) => <button type="button" key={t} className={t === tab ? "selected" : ""} aria-pressed={t === tab} onClick={() => { setTab(t); setQuery(""); setRarity("all"); setOwnership("all"); }}>{t}{t === "Deck" && dirty ? " *" : ""}</button>)}</nav>
      {tab === "Play" && <div className="tt-page">
        {active ? <>
          <div className="tt-match-score" aria-live="polite"><span><small>You</small><strong>{match.player_score}</strong></span><div><strong>vs {matchOpponent?.name || "Opponent"}</strong><small>{selected ? `Place ${hand.find((c) => c.id === selected)?.name}` : "Select a card, then an empty space"}</small></div><span><small>Opponent</small><strong>{match.npc_score}</strong></span></div>
          <div className="tt-table"><div className="triad-board" aria-label="Triple Triad board">{list(match.board).map((cell, index) => cell ? <div className={`triad-board-cell occupied owner-${cell.owner}`} key={index}><TriadCard card={cell.card} owner={cell.owner} /><span className="tt-owner-tag">{cell.owner === "player" ? "YOU" : "NPC"}</span></div> : <button type="button" key={index} className={`triad-board-cell empty ${selected ? "playable" : ""}`} disabled={blocked || !selected} aria-label={`Play ${hand.find((c) => c.id === selected)?.name || "selected card"} in row ${Math.floor(index/3)+1}, column ${index%3+1}`} onClick={() => mutate(`triad-play-${index}`, () => submitTriadPlay(selected, index, csrfToken, actionKey("triad-play", `${match.id}-${selected}-${index}`)), "Playing card…")}>{selected ? "+" : "·"}</button>)}</div>
            <div className="tt-hands"><div><h4>Your hand</h4><div className="tt-hand-grid">{hand.map((c) => <TriadCard key={c.id} card={c} selected={selected === c.id} disabled={blocked} onClick={() => setSelected(c.id)} />)}</div></div><div><h4>Opponent’s hand <small>Open rule</small></h4><div className="tt-hand-grid tt-npc-hand">{npcHand.map((c) => <TriadCard key={c.id} card={c} owner="npc" />)}</div></div></div>
          </div>
        </> : <>
          {match?.state === "resolved" && <div className={`tt-result result-${match.result}`} role="status"><strong>{String(match.result).toUpperCase()} · {match.player_score}–{match.npc_score}</strong><span>vs {matchOpponent?.name}</span>{match.rewards?.payout != null && <span>+{match.rewards.payout} MGP{match.rewards.circuit_bonus ? ` · Circuit bonus +${match.rewards.circuit_bonus} MGP` : ""}</span>}{match.rewards?.card_reward_name && <span>Card won: {match.rewards.card_reward_name}</span>}</div>}
          <div className="tt-play-setup"><div><h4>Choose your table</h4><label className="tt-select-label">Opponent<select value={opponent?.id || ""} disabled={blocked} onChange={(e) => setOpponentId(e.target.value)}>{opponents.map((o) => <option key={o.id} value={o.id} disabled={!o.unlocked} aria-label={`${o.circuit_name || o.difficulty} · ${o.name}${o.unlocked ? "" : " (locked)"}`}>{o.circuit_name || o.difficulty} · {o.name}{o.unlocked ? "" : " 🔒"}</option>)}</select></label><p>{displayText(opponent?.description, "Triple Triad challenger.")}</p><div className="tt-payouts"><span>Win <strong>{opponent?.win_payout} MGP</strong></span><span>Draw <strong>{opponent?.draw_payout} MGP</strong></span><span>Loss <strong>{opponent?.loss_payout || 0} MGP</strong></span></div><p className="muted">Entry: {opponent?.cost} MGP · {opponent?.difficulty} · Deck power {opponent?.deck_power}</p><button type="button" className="equipment-action-button" disabled={blocked || !opponent?.can_start || dirty || deck.length !== 5} onClick={start}>{busy === "triad-start" ? "Dealing…" : !triad.matches_remaining ? "Daily entries used" : dirty ? "Save your deck first" : mgp < (opponent?.cost || 0) ? "Not enough MGP" : !opponent?.unlocked ? <LockIcon label="Table locked. Win against both opponents in the previous circuit." /> : `Start match · ${opponent?.cost} MGP`}</button>{dirty && <button type="button" className="tt-text-button" onClick={() => setTab("Deck")}>Review deck changes</button>}</div>
            <div><div className="tt-section-head"><h4>Your saved deck</h4><button type="button" className="tt-text-button" onClick={() => setTab("Deck")}>Edit deck</button></div><div className="tt-preview-deck">{records(triad.deck_cards).map((c) => <TriadCard card={c} key={c.id} />)}</div><p className="muted">Deck power {triad.deck_power} · Higher side captures lower side. Equal sides stay put.</p><h4>Cards to collect here</h4><div className="tt-reward-chips">{records(opponent?.reward_cards).map((c) => <span key={c.id} className={collection.find((v) => v.id === c.id)?.owned ? "owned" : ""}>{c.name} {collection.find((v) => v.id === c.id)?.owned ? "✓" : ""}</span>)}</div><p className="muted">Win drop: {Math.round((opponent?.drop_chance || 0)*100)}% · Draw drop: {Math.round((opponent?.draw_drop_chance || 0)*100)}%. After three wins without a card, the next win guarantees one. Missing cards come first.</p></div>
          </div>
        </>}
      </div>}
      {tab === "Deck" && <div className="tt-page"><div className="tt-section-head"><div><h4>Your five-card deck</h4><p className="muted">Remove a selected card to make room. Protect weak sides against the board edges.</p></div><span className="small-badge">{deck.length} / 5</span></div><div className="tt-deck-toolbar"><button type="button" className="equipment-action-button" disabled={blocked || active || deck.length !== 5 || !dirty} onClick={() => mutate("triad-save-deck", () => submitTriadSetDeck(deck, csrfToken, actionKey("triad-set-deck")), "Saving deck…")}>{busy === "triad-save-deck" ? "Saving…" : dirty ? "Save deck" : "Deck saved"}</button><button type="button" className="tt-text-button" disabled={active || blocked} onClick={() => setDraft([...list(triad.deck)])}>Reset changes</button></div>{active && <p className="muted">Finish your current match to edit your deck.</p>}{filters}{filteredCards(true)}</div>}
      {tab === "Collection" && <div className="tt-page"><div className="tt-section-head"><h4>Your collection</h4><span>{triad.owned_count} / {triad.total_cards} discovered</span></div><p className="muted">{triad.starter_count || 10} starter cards are yours to keep. Win or draw against the listed opponents to collect more.</p>{filters}{filteredCards()}{visible.length === 0 && <p>No cards match these filters.</p>}</div>}
      {tab === "Opponents" && <div className="tt-page"><p className="muted">Win against both opponents to clear a circuit, claim its bonus, and open the next. Crystal tables are optional endgame challenges.</p>{circuits.map((circuit) => <section className="tt-circuit" key={circuit.id}><div className="tt-section-head"><h4>{circuit.name} Circuit <small>{circuit.difficulty}</small></h4><span className="small-badge">{circuit.bonus_paid ? "Bonus claimed" : circuit.unlocked ? `${circuit.defeated} / ${circuit.total} defeated` : <LockIcon label={`${circuit.name} Circuit locked. Clear the previous circuit.`} />} · {circuit.bonus} MGP</span></div><div className="tt-opponents">{opponents.filter((o) => o.circuit === circuit.id).map((o) => <article className={`tt-opponent ${o.unlocked ? "" : "locked"}`} key={o.id}><div className="tt-section-head"><h4>{o.name}</h4><span>{o.wins ? "Defeated ✓" : o.difficulty}</span></div><p>{displayText(o.description, "Triple Triad challenger.")}</p><small>Deck power {o.deck_power} · Entry {o.cost} MGP</small><div className="tt-opponent-deck">{records(o.deck_cards).map((card) => <TriadCard card={card} key={card.id} />)}</div><small>Collect: {records(o.reward_cards).map((r) => r.name).join(", ")}</small><button type="button" className="equipment-action-button secondary" disabled={active || blocked || !o.unlocked} onClick={() => chooseOpponent(o)}>{o.unlocked ? "Choose this table" : <LockIcon label={`Locked table: ${o.name}. Win against both opponents in the previous circuit.`} />}</button></article>)}</div></section>)}</div>}
      {tab === "Rules" && <div className="tt-page tt-rules"><h4>Open · Basic capture</h4><ol><li>Save five different owned cards. Both hands are visible.</li><li>Select a card, then an empty board space. Your opponent responds.</li><li>Each side compares with the facing side of an adjacent enemy card. The higher number captures it. Equal numbers do nothing.</li><li>Captures happen only when a card is placed. There are no chain captures, Same, Plus, or elemental rules.</li><li>After nine spaces fill, count owned board cards and cards still in hand. The total is ten: 6–4 wins, 5–5 draws.</li></ol><h4>Collect without losing cards</h4><p>Wins pay full MGP and can award a card. Draws return the entry cost and have a smaller card chance. Losses pay participation MGP. Entry costs are deducted when you start. Your cards are never taken away.</p><p>Missing reward cards are prioritized. After three wins at the same table without a card, your next win guarantees a drop. Extra copies are recorded; a deck still uses five different cards.</p><h4>Daily entries and circuits</h4><p>{triad.daily_matches || 5} matches per UTC day, resetting at 00:00 UTC. Refreshing preserves your match. Win once against each opponent in a circuit to unlock the next and earn a one-time MGP bonus.</p><h4>A useful opening</h4><p>Put a card’s weak sides against a corner. Keep its strongest sides facing empty spaces. Check the opponent’s visible hand before choosing your next placement.</p></div>}
    </div>
  </details>;
}
