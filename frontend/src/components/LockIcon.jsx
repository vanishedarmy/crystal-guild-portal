import "../styles/lock-icon.css";

/** Compact, accessible status marker in the Portal's pixel-art palette. */
export default function LockIcon({ label = "Locked", className = "" }) {
  return (
    <span className={`ui-lock-icon ${className}`.trim()} role="img" aria-label={label} title={label}>
      <svg viewBox="0 0 16 20" width="16" height="20" aria-hidden="true" focusable="false" shapeRendering="crispEdges">
        <path fill="currentColor" fillRule="evenodd" d="M5 1h6v2h2v5h1v11H2V8h1V3h2zm0 3v4h6V4z" />
        <path className="ui-lock-keyhole" d="M7 11h2v2H8v3H7z" />
        <path className="ui-lock-highlight" d="M3 9h10v1H3zM3 10h1v7H3z" />
      </svg>
    </span>
  );
}
