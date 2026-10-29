import { useEffect, useState } from "react";

const QUERY = "(max-width: 760px)";
const isMobile = () => typeof window !== "undefined" && (typeof window.matchMedia === "function" ? window.matchMedia(QUERY).matches : window.innerWidth <= 760);

// Keep the combat overlays in the normal desktop layout. A browser-only query
// avoids rendering a viewport overlay during server-side rendering.
export default function useMobileCombatViewport() {
  const [mobile, setMobile] = useState(isMobile);
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const query = typeof window.matchMedia === "function" ? window.matchMedia(QUERY) : null;
    const update = () => setMobile(isMobile());
    update();
    query?.addEventListener?.("change", update);
    window.addEventListener("resize", update);
    return () => { query?.removeEventListener?.("change", update); window.removeEventListener("resize", update); };
  }, []);
  return mobile;
}
