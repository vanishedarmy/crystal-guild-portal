import useDisplayPreferences from "../hooks/useDisplayPreferences.js";
import { setDisplayPreference } from "../utils/displayPreferences.js";

/** Symbols are visual shortcuts only: both buttons retain full accessible names. */
export default function DisplayPreferenceControls({ className = "" }) {
  const { comfortable, highContrast } = useDisplayPreferences();
  return <div className={`cg-display-controls ${className}`.trim()} role="group" aria-label="Display accessibility options">
    <button type="button" className="cg-display-control" aria-pressed={comfortable}
      aria-label={`Comfortable text ${comfortable ? "on" : "off"}. ${comfortable ? "Use compact text" : "Use comfortable text"}`}
      title={comfortable ? "Comfortable text on · switch to compact" : "Compact text on · switch to comfortable"}
      onClick={() => setDisplayPreference("comfortable", !comfortable)}>
      <span className="cg-text-glyph" aria-hidden="true">A<span>+</span></span>
    </button>
    <button type="button" className="cg-display-control" aria-pressed={highContrast}
      aria-label={`High contrast ${highContrast ? "on" : "off"}. ${highContrast ? "Use standard contrast" : "Use high contrast"}`}
      title={highContrast ? "High contrast on · switch to standard" : "Standard contrast on · switch to high contrast"}
      onClick={() => setDisplayPreference("highContrast", !highContrast)}>
      <span className="cg-contrast-glyph" aria-hidden="true">◐</span>
    </button>
  </div>;
}
