export default function PageRefreshButton({ onRefresh, disabled = false }) {
  if (typeof onRefresh !== "function") return null;
  return (
    <div className="portal-page-refresh" aria-label="Page refresh controls">
      <button type="button" className="portal-page-refresh-button" onClick={onRefresh} disabled={disabled}>
        Refresh
      </button>
    </div>
  );
}
