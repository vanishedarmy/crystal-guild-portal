import { relicArtworkPath } from "../utils/relicArtwork.js";

export default function RelicArtwork({ relic, stage = null, className = "", eager = false, decorative = true }) {
  const src = relicArtworkPath(relic, stage);
  if (!src) return null;
  const name = String(relic?.name || "Relic weapon");
  return (
    <span className={`relic-artwork ${className}`.trim()} aria-hidden={decorative ? "true" : undefined}>
      <img
        src={src}
        alt={decorative ? "" : `${name} artwork`}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </span>
  );
}
