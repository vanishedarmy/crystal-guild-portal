const STATUS = {
  connected: ["Live", "connected"],
  polling: ["Updating", "polling"],
  error: ["Reconnecting", "error"],
  offline: ["Offline", "offline"],
  connecting: ["Connecting", ""],
};

export default function LiveStatus({ status }) {
  const [text, mode] = STATUS[status] || STATUS.connecting;
  const mobileText = status === "connected" || status === "polling" ? "LIVE" : "OFFLINE";
  return (
    <div className={`live-status ${mode}`} aria-live="polite" title={mobileText === "LIVE" ? "Guild connection is live" : "Guild connection is offline"}>
      <span className="live-dot" />
      <span className="live-status-desktop-text">{text}</span>
      <span className="live-status-mobile-token">{mobileText}</span>
    </div>
  );
}
