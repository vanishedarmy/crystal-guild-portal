export default function CollapsePointer({ open = false, className = "" }) {
  const src = open ? "/ui/collapse-pointer-down.webp" : "/ui/collapse-pointer-right.webp";
  return <img className={`collapse-pointer-icon ${className}`.trim()} src={src} alt="" aria-hidden="true" draggable="false" />;
}

export function DetailsPointer({ className = "" }) {
  return (
    <span className={`details-collapse-pointer ${className}`.trim()} aria-hidden="true">
      <img className="details-collapse-pointer-closed" src="/ui/collapse-pointer-right.webp" alt="" draggable="false" />
      <img className="details-collapse-pointer-open" src="/ui/collapse-pointer-down.webp" alt="" draggable="false" />
    </span>
  );
}
