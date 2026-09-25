import { bossArtworkPath } from "../utils/bossArtwork.js";

export default function BossArtwork({ boss, className = "", eager = false }) {
  const src = bossArtworkPath(boss);
  if (!src) return null;
  return (
    <img
      alt={`${boss?.name || "Raid boss"} artwork`}
      className={`boss-artwork ${className}`.trim()}
      decoding="async"
      loading={eager ? "eager" : "lazy"}
      src={src}
    />
  );
}
