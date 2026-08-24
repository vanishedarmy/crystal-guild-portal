import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchStreamerDashboard } from "../api/streamer.js";
import SiteHeader from "../components/SiteHeader.jsx";
import { useLiveUpdates } from "../hooks/useLiveUpdates.js";
import { activitySourceLabel, humanizeLabel } from "../utils/displayLabels.js";
import { number, pct, timeAgo } from "../utils/formatters.js";
import { WEB_BUILD, WEB_RELEASE } from "../version.js";

// General-purpose commands that are useful while running a stream. These are
// intentionally separate from OWNER_COMMAND_GROUPS so destructive owner tools
// never visually blend into normal player-facing reference material.
const STREAM_COMMAND_GROUPS = [
  {
    title: "Battle Watch",
    commands: [
      { command: "!encounter", description: "Current battle status" },
      { command: "!battlelog", description: "Recent resolved round history" },
      { command: "!boss", description: "Current raid or boss state" },
      { command: "!raidstats", description: "Raid contribution board" },
    ],
  },
  {
    title: "Guild Lookup",
    commands: [
      { command: "!hunts", description: "Current Hunt Board" },
      { command: "!leaderboard level", description: "Top adventurers by level" },
      { command: "!records", description: "Personal career record" },
      { command: "!guild [topic]", aliases: "Aliases: !cghelp, !cgcommands, !rpghelp", description: "Player command list and help" },
    ],
  },
  {
    title: "Fellowship",
    commands: [
      { command: "!fellowship", description: "Shared Guild level, your Guild Rank, and current project" },
      { command: "!project", description: "Current Fellowship project and requirements" },
      { command: "!orders", description: "Current weekly Fellowship Orders" },
      { command: "!rank", description: "Your personal Guild Rank and Renown progress" },
    ],
  },
];

// Keep this list synchronized with the explicit owner-id gates in twitch_bot.py.
// The dashboard is read-only: these buttons copy text only and never execute a
// command from the hosted site.
const OWNER_COMMAND_GROUPS = [
  {
    title: "Diagnostics",
    description: "Check bot status, economy, and active battles.",
    commands: [
      { command: "!health", description: "Check bot, database, chat, combat, and timer status" },
      { command: "!economy [days]", description: "See gil earned, spent, and circulating" },
      { command: "!cgversion", description: "Show the currently running bot version" },
      { command: "!encounterdebug", description: "Detailed status for the current battle" },
      { command: "!directtest", description: "Test whether the bot can send a Twitch chat message" },
    ],
  },
  {
    title: "Fellowship Control",
    description: "Choose which unlocked community project the Guild is currently building.",
    commands: [
      { command: "!fellowshipproject <project>", description: "Set the active unlocked Fellowship project", risk: "caution" },
    ],
  },
  {
    title: "Player Recovery",
    description: "Global recovery tools for resetting the Guild between tests, events, or stream sessions.",
    commands: [
      { command: "!readyall", description: "Make every player READY and restore full HP plus applicable MP/AP", risk: "caution" },
      { command: "!resettimers", description: "Clear all player cooldowns, camp timers, and shop refresh timers", risk: "danger" },
      { command: "!clearadventures", description: "Emergency-clear all active field adventures, timed Hunts, and Solo Ventures without touching raids or player progression", risk: "danger" },
    ],
  },
  {
    title: "Encounter Recovery",
    description: "Use only if a field battle is stuck or failed to recover normally.",
    commands: [
      { command: "!resolveencounter", description: "Force the current field battle to resolve", risk: "caution" },
      { command: "!clearencounter", description: "Cancel and clear the current field battle", risk: "danger" },
    ],
  },
  {
    title: "Raid Control",
    description: "Start a raid manually or recover a stuck raid.",
    commands: [
      { command: "!spawnboss <boss name>", description: "Force-spawn the named raid boss", risk: "caution" },
      { command: "!resolveboss", description: "Force resolution of the active boss or raid", risk: "danger" },
    ],
  },
];

function clampPct(current, maximum) {
  return Math.max(0, Math.min(100, pct(current, maximum)));
}

function hpTone(player) {
  if (player.status === "ko" || player.hp_current <= 0) return "danger";
  const value = clampPct(player.hp_current, player.hp_max);
  if (value <= 30) return "danger";
  if (value <= 60) return "warning";
  return "good";
}

function HostedOverlayCard() {
  const [copied, setCopied] = useState(false);
  const overlayUrl = typeof window === "undefined" ? "/overlay" : `${window.location.origin}/overlay`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(overlayUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };
  return (
    <section className="streamer-overlay-card" id="overlay" aria-labelledby="overlay-title">
      <div>
        <span className="panel-kicker">OBS Browser Source</span>
        <h2 id="overlay-title">Hosted Raid Overlay</h2>
        <p>Use the hosted overlay URL in OBS. It follows the Render Bot automatically, so the local overlay server is no longer required.</p>
      </div>
      <div className="streamer-overlay-actions">
        <a className="ghost-button" href="/overlay" target="_blank" rel="noreferrer">Open overlay</a>
        <button className="ghost-button" type="button" onClick={copy}>{copied ? "Copied URL" : "Copy OBS URL"}</button>
      </div>
    </section>
  );
}

function SummaryCard({ label, value, detail, tone = "" }) {
  return (
    <article className={`streamer-summary-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </article>
  );
}

function LeaderCard({ label, leader, suffix = "" }) {
  return (
    <article className="streamer-leader-card">
      <span>{label}</span>
      {leader ? (
        <>
          <Link to={`/player/${encodeURIComponent(leader.username)}`}>{leader.display_name}</Link>
          <strong>{number(leader.value)}{suffix}</strong>
        </>
      ) : <em>No record yet</em>}
    </article>
  );
}

function CopyCommand({ item, copied, onCopy, owner = false }) {
  const risk = item.risk || "safe";
  return (
    <button
      className={`streamer-command ${owner ? "owner-command" : ""} risk-${risk}`}
      onClick={() => onCopy(item.command)}
      type="button"
    >
      <span className="streamer-command-main">
        <code>{item.command}</code>
        {owner ? <b className="streamer-owner-badge">Owner only</b> : null}
        {item.risk === "danger" ? <b className="streamer-risk-badge">Force action</b> : null}
      </span>
      <span className="streamer-command-copy">{copied === item.command ? "Copied" : "Copy"}</span>
      <span className="streamer-command-description">{item.description}</span>
      {item.aliases ? <small>{item.aliases}</small> : null}
    </button>
  );
}

function CommandGroups({ groups, owner = false }) {
  const [copied, setCopied] = useState("");
  const copy = async (command) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(command);
      window.setTimeout(() => setCopied(""), 1200);
    } catch {
      setCopied("");
    }
  };

  return (
    <div className={`streamer-command-groups ${owner ? "streamer-owner-command-groups" : ""}`}>
      {groups.map((group) => (
        <section className="streamer-command-group" key={group.title}>
          <header className="streamer-command-group-heading">
            <h3>{group.title}</h3>
            {group.description ? <p>{group.description}</p> : null}
          </header>
          <div className="streamer-command-list">
            {group.commands.map((item) => (
              <CopyCommand item={item} copied={copied} key={item.command} onCopy={copy} owner={owner} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function RosterHeader() {
  return (
    <div className="streamer-roster-header" aria-hidden="true">
      <span />
      <span>Adventurer</span>
      <span>Job / Region</span>
      <span>Health</span>
      <span>Bosses</span>
    </div>
  );
}

export default function StreamerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);
  const deferredSearch = useDeferredValue(search);

  const refresh = useCallback(() => setRefreshToken((value) => value + 1), []);
  const liveStatus = useLiveUpdates(refresh);

  useEffect(() => {
    document.body.classList.add("streamer-page");
    return () => document.body.classList.remove("streamer-page");
  }, []);

  useEffect(() => {
    document.title = `Crystal Guild Streamer Dashboard — ${WEB_BUILD}`;
    const controller = new AbortController();
    if (!dashboard) setLoading(true);
    fetchStreamerDashboard(controller.signal)
      .then((payload) => {
        setDashboard(payload);
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

  const players = dashboard?.players || [];
  const shownPlayers = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    return players.filter((player) => {
      if (statusFilter !== "all" && player.status !== statusFilter) return false;
      if (!term) return true;
      return [player.display_name, player.username, player.job_name, player.title, player.region]
        .some((value) => String(value || "").toLowerCase().includes(term));
    });
  }, [players, deferredSearch, statusFilter]);

  const summary = dashboard?.summary || { total: 0, ready: 0, resting: 0, ko: 0, average_level: 0 };
  const lastSync = dashboard?.last_sync
    ? timeAgo(new Date(Number(dashboard.last_sync) * 1000).toISOString())
    : "No update yet";

  return (
    <>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader liveStatus={liveStatus} sectionTitle="Streamer Dashboard" brandHref="/streamer" includeStreamer />
      <main id="main-content" className="streamer-shell" tabIndex="-1">
        <section className="streamer-hero">
          <div>
            <p className="eyebrow">Streamer Tools</p>
            <h1>Streamer Dashboard</h1>
            <p>Guild status, player health, recent activity, and useful commands at a glance.</p>
          </div>
          <div className="streamer-sync-card">
            <span>Dashboard Status</span>
            <strong>{dashboard?.degraded ? "STALE" : liveStatus === "connected" ? "LIVE" : humanizeLabel(liveStatus)}</strong>
            <small>{dashboard?.degraded ? "Showing saved data · " : ""}Last updated {lastSync}</small>
          </div>
        </section>

        <nav className="streamer-jumpbar" aria-label="Streamer dashboard sections">
          <a href="#roster">Roster</a>
          <a href="#commands">Stream Commands</a>
          <a href="#owner-commands">Owner Commands</a>
          <a href="#activity">Ledger</a>
          <a href="#overlay">OBS Overlay</a>
        </nav>

        <section className="streamer-summary-grid" aria-label="Guild summary">
          <SummaryCard label="Registered" value={number(summary.total)} detail="Guild heroes" />
          <SummaryCard label="Ready" value={number(summary.ready)} detail="Available" tone="good" />
          <SummaryCard label="Resting" value={number(summary.resting)} detail="At camp" tone="warning" />
          <SummaryCard label="KO" value={number(summary.ko)} detail="Needs recovery" tone={summary.ko ? "danger" : ""} />
          <SummaryCard label="Average Level" value={number(summary.average_level)} detail="Guild average" />
        </section>

        {loading && !dashboard ? <div className="state-message">Loading the Streamer Dashboard...</div> : null}
        {error ? <div className="state-message compact-state">{error}</div> : null}

        {dashboard ? (
          <div className="streamer-dashboard-frame">
            <section className="streamer-ops-strip" aria-label="Stationary streamer reference panel">
              <section className="streamer-panel streamer-leaders-panel" id="leaders">
                <div className="streamer-panel-heading">
                  <div><span>Guild Leaders</span><h2>At a Glance</h2></div>
                  <small>Current leaders</small>
                </div>
                <div className="streamer-leader-grid">
                  <LeaderCard label="Highest Level" leader={dashboard.leaders?.level} />
                  <LeaderCard label="Boss Clears" leader={dashboard.leaders?.boss_clears} />
                  <LeaderCard label="Jobs Mastered" leader={dashboard.leaders?.mastered_jobs} />
                  <LeaderCard label="Achievements" leader={dashboard.leaders?.achievements} />
                </div>
              </section>
            </section>

            <div className="streamer-workspace">
              <div className="streamer-layout">
                <section className="streamer-panel streamer-roster-panel" id="roster">
                  <div className="streamer-panel-heading">
                    <div><span>Roster Watch</span><h2>Adventurers</h2></div>
                    <div className="streamer-heading-tools">
                      <small>{number(shownPlayers.length)} of {number(players.length)} shown</small>
                      <button className="ghost-button" type="button" onClick={refresh}>Refresh</button>
                    </div>
                  </div>
                  <div className="streamer-toolbar">
                    <input
                      aria-label="Search streamer roster"
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search hero, Job, title, region..."
                      type="search"
                      value={search}
                    />
                    <select aria-label="Filter by status" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
                      <option value="all">All statuses</option>
                      <option value="ready">Ready</option>
                      <option value="resting">Resting</option>
                      <option value="ko">KO</option>
                    </select>
                  </div>
                  <RosterHeader />
                  <div className="streamer-roster" aria-live="polite">
                    {shownPlayers.map((player) => {
                      const hpPercent = Math.round(clampPct(player.hp_current, player.hp_max));
                      return (
                        <Link className="streamer-player-row" key={player.username} to={`/player/${encodeURIComponent(player.username)}`}>
                          <span className={`streamer-status-dot ${player.status}`} aria-label={player.status_label} />
                          <span className="streamer-player-identity">
                            <strong>{player.display_name}</strong>
                            <small>@{player.username} · {player.title}</small>
                          </span>
                          <span className="streamer-player-job">
                            <strong>{player.job_name}</strong>
                            <small>Lv.{number(player.level)} · JLv.{number(player.job_level)} · {player.region}</small>
                          </span>
                          <span className={`streamer-hp ${hpTone(player)}`}>
                            <span className="streamer-hp-line"><strong>{number(player.hp_current)} / {number(player.hp_max)}</strong><small>{hpPercent}%</small></span>
                            <span className="streamer-hp-track"><span style={{ width: `${hpPercent}%` }} /></span>
                          </span>
                          <span className="streamer-player-record">
                            <strong>{number(player.boss_clears)}</strong>
                            <small>Clears</small>
                          </span>
                        </Link>
                      );
                    })}
                    {!shownPlayers.length ? <div className="streamer-empty">No adventurers match the current filters.</div> : null}
                  </div>
                </section>

                <section className="streamer-panel streamer-command-panel" id="commands">
                  <div className="streamer-panel-heading">
                    <div><span>On-stream Reference</span><h2>Stream Commands</h2></div>
                    <small>Click any command to copy it.</small>
                  </div>
                  <CommandGroups groups={STREAM_COMMAND_GROUPS} />
                </section>

                <section className="streamer-panel streamer-owner-panel" id="owner-commands">
                  <div className="streamer-panel-heading streamer-owner-heading">
                    <div><span>Streamer Tools</span><h2>All Streamer-Only Commands</h2></div>
                    <small>13 streamer-only commands · click to copy</small>
                  </div>
                  <div className="streamer-owner-notice">
                    Only the configured streamer account can run these commands. Use recovery and force-action commands only when a battle is genuinely stuck.
                  </div>
                  <CommandGroups groups={OWNER_COMMAND_GROUPS} owner />
                </section>

                <section className="streamer-panel streamer-ledger-panel" id="activity">
                  <div className="streamer-panel-heading">
                    <div><span>Live Ledger</span><h2>Recent Activity</h2></div>
                    <small>Recent gil and item changes</small>
                  </div>
                  <div className="streamer-activity-list">
                    {(dashboard.activity || []).slice(0, 8).map((item, index) => (
                      <div className="streamer-activity" key={`${item.username}-${item.created_at}-${index}`}>
                        <span className="streamer-activity-glyph">{item.kind === "item" ? "◇" : "G"}</span>
                        <span>
                          <strong>{item.display_name}</strong>
                          <small>{item.kind === "item" ? item.asset : humanizeLabel(item.asset)} · {activitySourceLabel(item.source)} · {timeAgo(item.created_at)}</small>
                        </span>
                        <b className={item.amount >= 0 ? "good-text" : "danger-text"}>{item.amount >= 0 ? "+" : ""}{number(item.amount)}</b>
                      </div>
                    ))}
                    {!dashboard.activity?.length ? <div className="streamer-empty">No recent Guild activity.</div> : null}
                  </div>
                </section>
              </div>
            </div>
          </div>
        ) : null}

        <HostedOverlayCard />
      </main>
      <footer className="site-footer streamer-footer">
        <span>Crystal Guild Streamer Dashboard · {WEB_RELEASE}</span>
        <span><Link to="/privacy">Privacy Policy</Link> · Command buttons copy text only; run commands in Twitch chat</span>
      </footer>
    </>
  );
}
