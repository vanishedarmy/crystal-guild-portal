import { useState } from "react";
import CardPortrait, { CardArtDialog } from "./CardPortrait.jsx";

export function Collection({ snapshot, Pattern }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [artCard, setArtCard] = useState(null);
  const rows = snapshot.cards.filter(c => `${c.name} ${c.reference}`.toLowerCase().includes(query.toLowerCase()) &&
    (filter === "all" || filter === "owned" && c.owned || filter === "ready" && c.enabled || filter === "pending" && !c.enabled));
  return <section aria-label="Card collection">
    <div className="qb-library-toolbar"><label>Find a card<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Name or Final Fantasy reference" /></label><label>Show<select aria-label="Show cards" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All 48 cards</option><option value="owned">Owned cards</option><option value="ready">{snapshot.cards.filter(c => c.enabled).length} playable cards</option>{snapshot.cards.some(c => !c.enabled) && <option value="pending">Rules pending</option>}</select></label></div>
    <p className="qb-footnote">Owned {snapshot.profile.unlocked.length} / {snapshot.cards.filter(c => c.enabled).length} playable cards · The complete 48-card roster is playable. Every card unlocks through solo play. Mini-grid: yellow claims territory; green outlines mark enhancements; red outlines mark enfeeblement.</p>
    <div className="qb-library-grid">{rows.map(card => <article key={card.id} className="qb-library-card qb-collection-card">
      <button type="button" className="qb-art-button" aria-label={`View ${card.name} artwork`} onClick={() => setArtCard(card)}><CardPortrait card={card} /></button><div className="qb-library-copy">
      <div className="qb-library-head"><strong>{card.name}</strong><span aria-label={card.owned ? "Owned" : "Solo unlock"} title={card.owned ? "Owned" : "Solo unlock"}>{card.owned ? "✓" : "🔒"}</span></div>
      <small>{card.reference} · {card.group} · {card.id}</small>
      <div className="qb-library-values"><span>{typeof card.rank === "number" ? `Rank ${card.rank}` : "Replacement"} · Power {card.power} · Limit {card.copy_limit}</span><Pattern card={card} /></div>
      <p>{card.rules}</p><small>{card.enabled ? card.source === "Starter collection" ? card.source : `First victory: ${card.source}` : "Awaiting advanced-rule verification"}</small>
    </div></article>)}</div>
    {!rows.length && <p className="state-message">No cards match these filters.</p>}
    {artCard && <CardArtDialog card={artCard} close={() => setArtCard(null)} />}
  </section>;
}

export function DeckBuilder({ snapshot, send, disabled }) {
  const [slot, setSlot] = useState(0);
  const [drafts, setDrafts] = useState({});
  const [query, setQuery] = useState("");
  const [preset, setPreset] = useState(0);
  const profile = snapshot.profile;
  const saved = profile.decks[slot];
  const draft = drafts[slot] || saved;
  const cards = Object.fromEntries(snapshot.cards.map(c => [c.id, c]));
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const counts = Object.fromEntries([...new Set(draft.cards)].map(id => [id, draft.cards.filter(c => c === id).length]));
  const validation = draft.cards.length !== 15 ? `Choose exactly 15 cards (${draft.cards.length}/15).`
    : draft.cards.some(id => !cards[id]?.enabled || !cards[id]?.owned) ? "Unlock all cards in this deck before saving."
    : Object.entries(counts).some(([id, n]) => n > cards[id].copy_limit) ? "This deck exceeds a card’s copy limit."
    : !draft.name.trim() || draft.name.trim().length > 32 ? "Use a deck name of 1–32 characters." : "";
  const pool = snapshot.cards.filter(c => c.enabled && c.owned && `${c.name} ${c.reference}`.toLowerCase().includes(query.toLowerCase()));
  function update(change) { setDrafts(v => ({ ...v, [slot]: { ...draft, ...change } })); }
  function remove(id) { const next = [...draft.cards]; next.splice(next.indexOf(id), 1); update({ cards: next }); }
  async function save() {
    const result = await send({ kind: "save_deck", slot, name: draft.name, cards: draft.cards, profile_revision: profile.revision });
    if (result) setDrafts(v => { const next = { ...v }; delete next[slot]; return next; });
  }
  return <section aria-label="Deck builder">
    <p className="qb-footnote">Three saved slots. Foundation cards allow two copies; heroes, summons and villains allow one. Changes apply to your next match; the current match keeps its original deck.</p>
    <div className="qb-library-toolbar">
      <label>Deck slot<select aria-label="Deck slot" value={slot} onChange={e => setSlot(Number(e.target.value))}>{profile.decks.map((d, i) => <option key={i} value={i}>{i + 1}: {d.name}{profile.active_deck === i ? " · Active" : ""}{drafts[i] ? " · Draft" : ""}</option>)}</select></label>
      <label>Deck name<input aria-label="Deck name" maxLength={32} value={draft.name} onChange={e => update({ name: e.target.value })} /></label>
    </div>
    <div className="qb-deck-command"><strong>{draft.cards.length} / 15 cards{dirty ? " · Unsaved draft" : " · Saved"}</strong><button type="button" disabled={disabled || Boolean(validation) || !dirty} onClick={save}>Save deck</button><button type="button" disabled={disabled || profile.active_deck === slot} onClick={() => send({ kind: "activate_deck", slot, profile_revision: profile.revision })}>Use saved deck</button><button type="button" disabled={disabled || !dirty} onClick={() => setDrafts(v => { const next = { ...v }; delete next[slot]; return next; })}>Restore saved slot</button></div>
    {validation && <p className="qb-deck-warning" role="status">{validation}</p>}
    <p className="qb-footnote">Rank mix: {[1, 2, 3].map(rank => `${rank}: ${draft.cards.filter(id => cards[id]?.rank === rank).length}`).join(" · ")}. Replacement: {draft.cards.filter(id => cards[id]?.rank === "Replace").length}. Keep enough rank-1 cards to make a reliable opening.</p>
    <div className="qb-selected-deck">{Object.entries(counts).map(([id, count]) => <div key={id}><CardPortrait card={cards[id]} className="qb-deck-portrait" /><span className="qb-deck-copy">{cards[id].name} ×{count}{!cards[id].owned ? " · Unowned" : ""}</span><button type="button" disabled={disabled} aria-label={`Remove ${cards[id].name}`} onClick={() => remove(id)}>−</button></div>)}</div>
    <div className="qb-library-toolbar"><label>Deck preset<select aria-label="Deck preset" value={preset} onChange={e => setPreset(Number(e.target.value))}>{snapshot.presets.map((p, i) => <option key={p.name} value={i}>{p.name}</option>)}</select></label><button type="button" disabled={disabled} onClick={() => { const p = snapshot.presets[preset]; update({ name: p.name, cards: [...p.cards] }); }}>Load preset as draft</button></div>
    <label className="qb-card-search">Find an owned card<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Name or game" /></label>
    <div className="qb-deck-pool">{pool.map(card => <div key={card.id}><CardPortrait card={card} className="qb-deck-portrait" /><span className="qb-deck-copy"><strong>{card.name}</strong><small>{card.rank === "Replace" ? "Replacement" : `Rank ${card.rank}`} · Power {card.power} · {counts[card.id] || 0}/{card.copy_limit}</small></span><button type="button" disabled={disabled || draft.cards.length >= 15 || (counts[card.id] || 0) >= card.copy_limit} aria-label={`Add ${card.name}`} onClick={() => update({ cards: [...draft.cards, card.id] })}>+</button></div>)}</div>
  </section>;
}

export function SoloCircuit({ snapshot, send, disabled }) {
  const cards = Object.fromEntries(snapshot.cards.map(c => [c.id, c]));
  const active = snapshot.match && snapshot.match.phase !== "finished";
  const stats = snapshot.profile.stats;
  return <section aria-label="Solo circuit">
    <p>{snapshot.opponents.length} opponents, each with a distinct deck and guaranteed first-win cards. Defeat them in order; rematches are free.</p>
    <p className="qb-footnote">Circuit record: {stats.wins} wins · {stats.losses} losses · {stats.draws} draws. No currency wagers, live-stream requirements, or card loss.</p>
    {active && <p className="qb-deck-warning">Finish or resign your current match before challenging an opponent.</p>}
    <div className="qb-circuit-grid">{snapshot.opponents.map((o, i) => <article key={o.id} className="qb-library-card">
      <div className="qb-library-head"><strong>{i + 1}. {o.name}</strong><span aria-label={o.defeated ? "Defeated" : o.unlocked ? "Ready" : "Locked"} title={o.defeated ? "Defeated" : o.unlocked ? "Ready" : "Locked"}>{o.defeated ? "✓" : o.unlocked ? "Ready" : "🔒"}</span></div><p>{o.lesson}</p>
      <small>First-win cards: {o.rewards.map(id => cards[id].name).join(" · ")}</small>
      <button type="button" disabled={disabled || active || !o.unlocked} onClick={() => send({ kind: "start", mode: "circuit", opponent: o.id })}>{o.defeated ? `Rematch ${o.name}` : `Challenge ${o.name}`}</button>
    </article>)}</div>
    <details className="qb-history"><summary>Recent circuit results</summary>{snapshot.profile.history.length ? <ol>{[...snapshot.profile.history].reverse().map(h => <li key={h.match_id}>{h.opponent}: {h.outcome}{h.rewards.length ? ` · Unlocked ${h.rewards.map(id => cards[id].name).join(", ")}` : ""}</li>)}</ol> : <p>Your first circuit result will appear here.</p>}</details>
  </section>;
}
