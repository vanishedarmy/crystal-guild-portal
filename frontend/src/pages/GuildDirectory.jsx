import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPlayers } from "../api/players.js";
import SiteHeader from "../components/SiteHeader.jsx";
import RecruitPanel from "../components/RecruitPanel.jsx";
import JobPortrait from "../components/JobPortrait.jsx";
import PageRefreshButton from "../components/PageRefreshButton.jsx";
import { useLiveUpdates } from "../hooks/useLiveUpdates.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { number } from "../utils/formatters.js";
import { sortGuildDirectory } from "../utils/playerDirectorySort.js";

export default function GuildDirectory() {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);
  const { auth } = usePortalAuth();

  const refresh = useCallback(() => setRefreshToken((value) => value + 1), []);
  const liveStatus = useLiveUpdates(refresh);

  useEffect(() => {
    document.title = "Crystal Guild Adventurer Portal";
    const controller = new AbortController();
    if (!players.length) setLoading(true);
    fetchPlayers("", controller.signal)
      .then((payload) => {
        setPlayers(payload.players || []);
        setError("");
      })
      .catch((reason) => {
        if (reason.name !== "AbortError") setError(reason.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [refreshToken]);

  const shownPlayers = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    const filtered = term ? players.filter((player) => (
      player.username.toLowerCase().includes(term)
      || player.display_name.toLowerCase().includes(term)
      || player.job_name.toLowerCase().includes(term)
      || player.title.toLowerCase().includes(term)
    )) : players;
    return sortGuildDirectory(filtered, auth.authenticated ? auth.player?.username : "");
  }, [players, deferredSearch, auth.authenticated, auth.player?.username]);

  const rosterSummary = useMemo(() => players.reduce((summary, player) => {
    const state = String(player.status || "ready");
    summary.total += 1;
    if (state === "resting") summary.resting += 1;
    else if (state === "ko") summary.ko += 1;
    else summary.ready += 1;
    return summary;
  }, { total: 0, ready: 0, resting: 0, ko: 0 }), [players]);

  return (
    <>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader liveStatus={liveStatus} />
      <main id="main-content" className="shell" tabIndex="-1">
        <section className="view">
          <div className="hero-intro">
            <div>
              <p className="eyebrow">Crystal Guild</p>
              <h1>Guild Heroes</h1>
              <p className="lede">
                Browse every adventurer who has answered the Guild&apos;s call. Profiles update automatically as heroes
                level, change Jobs, equip gear, collect loot, complete Hunts, awaken Relics, and earn achievements.
              </p>
              <div className="hero-actions">
                <a className="primary-link" href="/guide">Read the Player Guide</a>
                <span>New to Crystal Guild? Use <strong>!guild</strong> in chat to see the command list, or <strong>!next</strong> to see what your hero should do next.</span>
              </div>
            </div>
            <aside className="registry-summary" aria-label="Guild roster summary">
              <div className="registry-stat registry-total" aria-label={`${shownPlayers.length} heroes shown`}>
                <span>Guild Heroes</span>
                <strong>{number(shownPlayers.length)}</strong>
                <small>{search ? `of ${number(players.length)} heroes` : "registered heroes"}</small>
              </div>
              <div className="registry-state-grid">
                <div className="registry-state ready"><strong>{number(rosterSummary.ready)}</strong><span>Ready</span></div>
                <div className="registry-state resting"><strong>{number(rosterSummary.resting)}</strong><span>Resting</span></div>
                <div className="registry-state ko"><strong>{number(rosterSummary.ko)}</strong><span>KO</span></div>
              </div>
            </aside>
          </div>

          <RecruitPanel onRecruited={refresh} />

          <div className="directory-toolbar">
            <label className="search-field">
              <span>Search heroes</span>
              <input
                type="search"
                placeholder="Name, Job, or title..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>

          {loading && !players.length ? <div className="state-message">Loading heroes...</div> : null}
          {error ? <div className="state-message compact-state">{error}</div> : null}
          {!loading && !error && !shownPlayers.length ? (
            <div className="state-message">
              {search ? "No heroes match that search." : "No heroes have joined the Guild yet."}
            </div>
          ) : null}
          <div className="player-grid" aria-live="polite">
            {shownPlayers.map((player) => (
              <Link className="player-card character-player-card" to={`/player/${encodeURIComponent(player.username)}`} key={player.username}>
                <div className="player-card-layout">
                  <JobPortrait jobName={player.job_name} className="player-card-portrait" />
                  <div className="player-card-copy">
                    <div className="player-card-topline">
                      <div className="card-level">Level {number(player.level)}</div>
                      <span className={`status-badge ${player.status}`}>{player.status_label}</span>
                    </div>
                    <h2 title={player.display_name}>{player.display_name}</h2>
                    <div className="handle">@{player.username}</div>
                    <div className="card-job">{player.job_name}</div>
                    <div className="card-title">{player.title}</div>
                  </div>
                </div>
                <div className="card-footer">
                  <span>View Profile</span>
                  <span aria-hidden="true">→</span>
                </div>
              </Link>
            ))}
          </div>

          <PageRefreshButton onRefresh={refresh} disabled={loading} />
        </section>
      </main>
      <footer className="site-footer">
        <span>Crystal Guild</span>
        <span><Link to="/fellowship">Fellowship</Link> · <Link to="/guide">Player Guide</Link> · <Link to="/privacy">Privacy Policy</Link> · Profiles update automatically from Twitch chat</span>
      </footer>
    </>
  );
}
