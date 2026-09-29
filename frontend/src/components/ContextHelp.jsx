import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CONTEXT_HELP } from "../utils/contextHelp.js";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function ContextHelp({ topic, className = "" }) {
  const help = CONTEXT_HELP[topic];
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({});
  const wrapperRef = useRef(null);
  const panelRef = useRef(null);
  const panelId = useId();

  const placePanel = useCallback(() => {
    if (!wrapperRef.current || typeof window === "undefined") return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const mobile = window.matchMedia?.("(max-width: 760px)")?.matches;
    if (mobile) {
      setPosition({ left: 14, right: 14, bottom: 14, top: "auto", width: "auto" });
      return;
    }
    const width = Math.min(380, Math.max(280, window.innerWidth - 24));
    const left = clamp(rect.right - width, 12, Math.max(12, window.innerWidth - width - 12));
    if (rect.top > window.innerHeight * 0.56) {
      setPosition({ left, width, bottom: Math.max(12, window.innerHeight - rect.top + 8), top: "auto" });
    } else {
      setPosition({ left, width, top: rect.bottom + 8, bottom: "auto" });
    }
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    placePanel();
    const onPointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target) && !panelRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", placePanel);
    window.addEventListener("scroll", placePanel, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", placePanel);
      window.removeEventListener("scroll", placePanel, true);
    };
  }, [open, placePanel]);

  if (!help) return null;

  const popover = open && typeof document !== "undefined" ? createPortal(
    <div className="context-help-popover" id={panelId} role="region" aria-label={`${help.title} quick help`} ref={panelRef} style={position}>
      <span className="context-help-kicker">Quick Help</span>
      <strong className="context-help-title">{help.title}</strong>
      <span className="context-help-summary">{help.summary}</span>
      <span className="context-help-list">
        {help.bullets.map((bullet) => <span key={bullet}>◆ {bullet}</span>)}
      </span>
      {help.tip ? <span className="context-help-tip"><b>Tip:</b> {help.tip}</span> : null}
      {help.guide ? <a className="context-help-guide" href={`/guide#${help.guide}`}>Open full Player Guide →</a> : null}
    </div>,
    document.body,
  ) : null;

  return (
    <span className={`context-help ${className}`.trim()} ref={wrapperRef}>
      <button
        type="button"
        className="context-help-button"
        aria-label={`Help: ${help.title}`}
        aria-expanded={open}
        aria-controls={panelId}
        title={`How ${help.title} works`}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
      >
        ?
      </button>
      {popover}
    </span>
  );
}
