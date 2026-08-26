import { itemArtworkPath } from "../utils/itemArtwork.js";

export default function ItemArtwork({ item, className = "", eager = false, decorative = true }) {
  const src = itemArtworkPath(item);
  if (!src) return null;
  const name = String(item?.name || "Item");
  return (
    <span className={`item-artwork ${className}`.trim()} aria-hidden={decorative ? "true" : undefined}>
      <img
        src={src}
        alt={decorative ? "" : `${name} artwork`}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </span>
  );
}
