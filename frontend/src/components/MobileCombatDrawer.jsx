import { cloneElement, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import useMobileCombatViewport from "./useMobileCombatViewport.js";

/** Preserve the full desktop action decks; portal only the selected phone picker. */
export default function MobileCombatDrawer({ open, kind, onClose, children }) {
  const mobile = useMobileCombatViewport();
  const drawer = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!mobile || !open) return undefined;
    const keydown = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeRef.current?.();
      document.querySelector(`[data-mobile-picker="${kind}"]`)?.focus({ preventScroll: true });
    };
    // The page stays scrollable outside the drawer, and Escape works even if
    // keyboard focus has moved inside an ability, item, or target selector.
    document.addEventListener("keydown", keydown);
    drawer.current?.focus({ preventScroll: true });
    return () => document.removeEventListener("keydown", keydown);
  }, [kind, mobile, open]);

  if (!mobile) return children;
  if (!open || typeof document === "undefined") return null;
  return createPortal(cloneElement(children, {
    ref: drawer,
    role: "dialog",
    "aria-label": kind === "ability" ? "Choose an ability" : "Choose an item",
    "aria-modal": "false",
    tabIndex: -1,
  }), document.body);
}
