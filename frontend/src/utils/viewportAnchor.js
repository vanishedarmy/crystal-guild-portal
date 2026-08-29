export function captureViewport(anchor = null) {
  if (typeof window === "undefined") return null;
  const target = anchor && typeof anchor.getBoundingClientRect === "function" ? anchor : null;
  const rect = target?.getBoundingClientRect?.();
  return {
    x: Number(window.scrollX || 0),
    y: Number(window.scrollY || 0),
    anchor: target,
    anchorTop: Number.isFinite(rect?.top) ? rect.top : null,
  };
}

export function restoreViewport(snapshot, { focus = false } = {}) {
  if (!snapshot || typeof window === "undefined") return;
  const restore = () => {
    const anchor = snapshot.anchor;
    if (anchor?.isConnected && Number.isFinite(snapshot.anchorTop)) {
      const nextTop = anchor.getBoundingClientRect().top;
      const delta = nextTop - snapshot.anchorTop;
      if (Math.abs(delta) > 0.5) {
        window.scrollBy({ top: delta, left: 0, behavior: "auto" });
      } else {
        window.scrollTo({ top: snapshot.y, left: snapshot.x, behavior: "auto" });
      }
      if (focus && typeof anchor.focus === "function") anchor.focus({ preventScroll: true });
      return;
    }
    window.scrollTo({ top: snapshot.y, left: snapshot.x, behavior: "auto" });
  };
  window.requestAnimationFrame(() => window.requestAnimationFrame(restore));
}

export function toggleWithViewportAnchor(event, setter) {
  const anchor = event?.currentTarget || null;
  const snapshot = captureViewport(anchor);
  setter((value) => !value);
  restoreViewport(snapshot);
}
