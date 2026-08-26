import { MAJOR_UPDATES } from "./whatsNewData.js";

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

export default function WhatsNew({ onNavigate }) {
  const [latest, ...previous] = MAJOR_UPDATES;
  if (!latest) return null;

  return (
    <section className="panel span-12 whats-new-panel" aria-labelledby="whats-new-title">
      <div className="whats-new-heading">
        <div>
          <p className="eyebrow">What's New</p>
          <h2 id="whats-new-title">{latest.title}</h2>
        </div>
        <span className="small-badge whats-new-version">{latest.version} · {latest.name}</span>
      </div>

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
          <summary>Previous major updates</summary>
          <div className="whats-new-history-list">
            {previous.map((update) => (
              <article key={`${update.version}-${update.name}`}>
                <strong>{update.version} · {update.name}</strong>
                <span>{update.title}</span>
              </article>
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}
