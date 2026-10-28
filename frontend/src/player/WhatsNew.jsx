import { useEffect, useState } from "react";
import { MAJOR_UPDATES } from "./whatsNewData.js";
import { toggleWithViewportAnchor } from "../utils/viewportAnchor.js";
import CollapsePointer from "../components/CollapsePointer.jsx";
import { DetailsPointer } from "../components/CollapsePointer.jsx";

function UpdateHighlights({ highlights }) {
  return (
    <div className="whats-new-highlights" aria-label="What's new highlights">
      {highlights.map((item) => (
        <article className="whats-new-highlight" key={item.title}>
          <span className="whats-new-spark" aria-hidden="true">✦</span>
          <div>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

// Each new major release opens once on the Overview, even if an older release
// was dismissed. After that, preserve the player's open/closed choice.
const RELEASE_NEWS_KEY = `crystal-guild:overview:whats-new:${MAJOR_UPDATES[0]?.version || "unknown"}`;
function defaultOpen() {
  try {
    const stored = window.localStorage?.getItem(RELEASE_NEWS_KEY);
    if (stored === "open") return true;
    if (stored === "closed") return false;
    return true;
  } catch {
    return true;
  }
}

export default function WhatsNew({ onNavigate }) {
  const [latest, ...previous] = MAJOR_UPDATES;
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    try { window.localStorage?.setItem(RELEASE_NEWS_KEY, open ? "open" : "closed"); } catch {}
  }, [open]);

  if (!latest) return null;

  return (
    <section className={`panel span-12 whats-new-panel collapsible-board-section ${open ? "open" : "collapsed"}`} aria-labelledby="whats-new-title">
      <div className="whats-new-heading section-collapsible-title-row">
        <div>
          <p className="eyebrow">What's New</p>
          <h2 id="whats-new-title">{latest.title}</h2>
        </div>
        <div className="section-collapse-actions">
          <span className="small-badge whats-new-version">{latest.version} · {latest.name}</span>
          <button type="button" className="section-collapse-button" aria-expanded={open} aria-label={open ? "Collapse What’s New" : "Expand What’s New"} title={open ? "Collapse What’s New" : "Expand What’s New"} onClick={(event) => toggleWithViewportAnchor(event, setOpen)}><CollapsePointer open={open} /></button>
        </div>
      </div>

      {open ? (
        <>
          <div className="whats-new-layout">
            <div className="whats-new-copy">
              <p>{latest.summary}</p>
              {latest.action ? (
                <button
                  type="button"
                  className="equipment-action-button primary whats-new-action"
                  onClick={() => onNavigate?.(latest.action.tab)}
                >
                  {latest.action.label}
                </button>
              ) : null}
            </div>
            <UpdateHighlights highlights={latest.highlights} />
          </div>

          {previous.length ? (
            <details className="whats-new-history">
              <summary>Previous major updates<DetailsPointer /></summary>
              <div className="whats-new-history-list">
                {previous.map((update) => (
                  <details className="whats-new-archive-entry" key={`${update.version}-${update.name}`}>
                    <summary><strong>{update.version} · {update.name}</strong><span>{update.title}</span></summary>
                    <div className="whats-new-archive-body">
                      <p>{update.summary}</p>
                      <UpdateHighlights highlights={update.highlights || []} />
                      {update.action ? <button type="button" className="equipment-action-button secondary whats-new-action" onClick={() => onNavigate?.(update.action.tab)}>{update.action.label}</button> : null}
                    </div>
                  </details>
                ))}
              </div>
            </details>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
