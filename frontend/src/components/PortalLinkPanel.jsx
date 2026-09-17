import { useMemo } from "react";
import { usePortalAuth } from "../hooks/usePortalAuth.js";

export default function PortalLinkPanel({ username }) {
  const { auth } = usePortalAuth();
  const isOwnProfile = useMemo(() => (
    Boolean(auth.authenticated && auth.player?.username)
    && String(auth.player.username).toLowerCase() === String(username || "").toLowerCase()
  ), [auth.authenticated, auth.player?.username, username]);

  if (!auth.configured || !auth.authenticated) return null;
  if (!auth.player) {
    return (
      <aside className="portal-link-panel warning" aria-label="Portal account link status">
        <div className="portal-link-copy">
          <div className="portal-link-heading">
            <strong>Crystal Guild Connection</strong>
            <span className="portal-link-badge">UNLINKED</span>
          </div>
        </div>
      </aside>
    );
  }
  if (!isOwnProfile) return null;

  return (
    <aside className={`portal-link-panel ${auth.actions_enabled ? "ready" : "offline"}`} aria-label="Crystal Guild connection status">
      <div className="portal-link-copy">
        <div className="portal-link-heading">
          <strong>Crystal Guild Connection</strong>
          <span className="portal-link-badge">{auth.actions_enabled ? "ONLINE" : "OFFLINE"}</span>
        </div>
      </div>
    </aside>
  );
}
