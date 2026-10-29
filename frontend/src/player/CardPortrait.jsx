import { useEffect, useRef, useState } from "react";

export function cardArtUrl(id, fullSize = false) {
  return /^QB0(?:0[1-9]|[1-3][0-9]|4[0-8])$/.test(id || "")
    ? `/card-hall/${fullSize ? "cards" : "thumbs"}/${id}.webp?v=1.9.7` : null;
}

export default function CardPortrait({ card, className = "", eager = false, fullSize = false }) {
  const [failed, setFailed] = useState(false);
  const src = cardArtUrl(card?.id, fullSize);
  useEffect(() => setFailed(false), [src]);
  return <span className={`qb-portrait ${className}`} aria-hidden="true">
    {src && !failed ? <img src={src} alt="" width="1024" height="1536" loading={eager ? "eager" : "lazy"} decoding="async" onError={() => setFailed(true)} />
      : <span className="qb-portrait-fallback">{card?.symbol || "✦"}</span>}
  </span>;
}

export function CardArtDialog({ card, close }) {
  const dialog = useRef(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="qb-art-dialog" aria-label={`${card.name} artwork`} onClose={close}
    onClick={e => { if (e.target === e.currentTarget) dialog.current.close(); }}>
    <div className="qb-art-dialog-heading"><strong>{card.name}</strong><button type="button" autoFocus onClick={() => dialog.current.close()}>Close</button></div>
    <CardPortrait card={card} eager fullSize /><p>{card.reference} · {card.id}</p>
  </dialog>;
}
