import { useCallback, useDeferredValue, useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchStreamerDashboard } from "../api/streamer.js";
import {
  loginUrl,
  submitStreamerCommand,
  waitForPortalAction,
} from "../api/auth.js";
import SiteHeader from "../components/SiteHeader.jsx";
import { useLiveUpdates } from "../hooks/useLiveUpdates.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { activitySourceLabel, humanizeLabel } from "../utils/displayLabels.js";
import { number, pct, timeAgo } from "../utils/formatters.js";
import { loadGuideData } from "../utils/itemCatalog.js";
import { WEB_BUILD, WEB_RELEASE } from "../version.js";
import { DetailsPointer } from "../components/CollapsePointer.jsx";

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
      { command: "!airship", description: "Guild Airship status and current mission" },
      { command: "!orders", description: "Current weekly Fellowship Orders" },
      { command: "!rank", description: "Your personal Guild Rank and Renown progress" },
    ],
  },
];

// Every Portal control maps to one explicit Bot-side owner operation. The Web
// never accepts arbitrary chat text, and the Bot re-checks the configured owner identity
// before executing anything in this list.
const OWNER_COMMAND_GROUPS = [
  {
    title: "Diagnostics",
    description: "Inspect runtime state without changing player progression.",
    commands: [
      { id: "health", command: "!health", label: "Health Check", description: "Check Bot, database, Portal action, stream, and combat state" },
      { id: "economy", command: "!economy [days]", label: "Economy Report", description: "See gil earned, spent, and circulating", argument: { type: "number", placeholder: "7", defaultValue: "7", min: 1, max: 90, label: "Days" } },
      { id: "cgversion", command: "!cgversion", label: "Version Status", description: "Show the currently running Bot and Portal Action versions" },
      { id: "encounterdebug", command: "!encounterdebug", label: "Encounter Debug", description: "Inspect the current field encounter" },
      { id: "directtest", command: "!directtest", label: "Direct Chat Test", description: "Send a direct Twitch test message only if the stream is LIVE" },
    ],
  },
  {
    title: "Fellowship Control",
    description: "Choose which unlocked community project the Guild is currently building.",
    commands: [
      { id: "fellowshipproject", command: "!fellowshipproject <project>", label: "Set Fellowship Project", description: "Set the active unlocked Fellowship project", risk: "caution", argument: { type: "text", placeholder: "Project name", label: "Project" } },
      { id: "airshipmission", command: "!airshipmission <mission>", label: "Launch Airship Mission", description: "Dispatch the completed Guild Airship on an unlocked mission", risk: "caution", argument: { type: "text", placeholder: "Mission name", label: "Airship mission" } },
    ],
  },
  {
    title: "Player Inventory",
    description: "Add or remove an exact item stack from any registered adventurer. Inventory edits are written to the normal Guild ledger.",
    commands: [
      { id: "additem", command: "!additem <player> | <item> | [qty]", label: "Add Item", description: "Grant an item to a selected player without changing quest, Relic, or achievement progression", risk: "caution", argument: { type: "inventory", label: "Inventory adjustment" } },
      { id: "removeitem", command: "!removeitem <player> | <item> | [qty]", label: "Remove Item", description: "Remove an owned item stack. Removing the last equipped copy automatically unequips it", risk: "danger", argument: { type: "inventory", label: "Inventory adjustment" } },
    ],
  },
  {
    title: "Gold Saucer Control",
    description: "Testing and event controls for the Alpha 1 Saucer economy. These never spend or convert player Gil.",
    commands: [
      { id: "saucergrant", command: "!saucergrant <player> | <amount>", label: "Grant Saucer Points", description: "Grant 1–100,000 Saucer Points to an exact player for testing or events", risk: "caution", argument: { type: "text", placeholder: "player | amount", label: "Player | amount" } },
      { id: "saucerreset", command: "!saucerreset <player>", label: "Reset Saucer Timers", description: "Clear the player's active Mini Cactpot / Monster Toss state and Saucer cooldowns while preserving balance and records", risk: "danger", argument: { type: "text", placeholder: "player", label: "Player" } },
    ],
  },
  {
    title: "Player Recovery",
    description: "Global recovery tools for testing, events, and stream-session resets.",
    commands: [
      { id: "readyall", command: "!readyall", label: "Ready All", description: "Make every player READY and restore full HP plus applicable MP/AP", risk: "caution" },
      { id: "resettimers", command: "!resettimers", label: "Reset Timers", description: "Clear gameplay cooldowns, camp timers, and shop refresh timers", risk: "danger" },
      { id: "clearadventures", command: "!clearadventures", label: "Clear Adventures", description: "Emergency-clear field encounters, timed Hunts, Solo Ventures, Expeditions, and Dungeons", risk: "danger" },
    ],
  },
  {
    title: "Encounter Recovery",
    description: "Use when a field battle is genuinely stuck or failed to recover normally.",
    commands: [
      { id: "resolveencounter", command: "!resolveencounter", label: "Resolve Encounter", description: "Force the current field battle to resolve", risk: "caution" },
      { id: "clearencounter", command: "!clearencounter", label: "Clear Encounter", description: "Cancel and clear the current field battle", risk: "danger" },
    ],
  },
  {
    title: "Raid Control",
    description: "Open a raid manually or recover a stuck raid.",
    commands: [
      { id: "spawnboss", command: "!spawnboss <boss name>", label: "Spawn Boss", description: "Force-spawn the named raid boss", risk: "caution", argument: { type: "text", placeholder: "Boss name", label: "Boss" } },
      { id: "resolveboss", command: "!resolveboss", label: "Resolve Boss", description: "Force resolution of the active boss or raid", risk: "danger" },
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

function CopyCommand({ item, copied, onCopy }) {
  return (
    <button className="streamer-command risk-safe" onClick={() => onCopy(item.command)} type="button">
      <span className="streamer-command-main"><code>{item.command}</code></span>
      <span className="streamer-command-copy">{copied === item.command ? "Copied" : "Copy"}</span>
      <span className="streamer-command-description">{item.description}</span>
      {item.aliases ? <small>{item.aliases}</small> : null}
    </button>
  );
}

function CommandGroups({ groups }) {
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
    <div className="streamer-command-groups">
      {groups.map((group) => (
        <details className="streamer-command-group streamer-reference-group" key={group.title}>
          <summary className="streamer-command-group-heading">
            <span><strong>{group.title}</strong><small>{group.commands.length} commands</small></span><DetailsPointer />
          </summary>
          <div className="streamer-command-list">
            {group.commands.map((item) => <CopyCommand item={item} copied={copied} key={item.command} onCopy={copy} />)}
          </div>
        </details>
      ))}
    </div>
  );
}

function actionKey(command) {
  const entropy = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `streamer-${command}-${entropy}`;
}

function StreamerControlPanel({ auth, refreshAuth, onDashboardRefresh, players = [] }) {
  const initialInputs = useMemo(() => {
    const values = {};
    OWNER_COMMAND_GROUPS.forEach((group) => group.commands.forEach((item) => {
      if (!item.argument) return;
      values[item.id] = item.argument.type === "inventory"
        ? { player: "", item: "", quantity: "1" }
        : item.argument.defaultValue || "";
    }));
    return values;
  }, []);
  const [inputs, setInputs] = useState(initialInputs);
  const [running, setRunning] = useState("");
  const [confirming, setConfirming] = useState("");
  const [result, setResult] = useState(null);
  const [catalogItems, setCatalogItems] = useState([]);

  useEffect(() => {
    let active = true;
    loadGuideData()
      .then((guide) => {
        if (!active) return;
        const items = Array.isArray(guide?.items) ? [...guide.items] : [];
        items.sort((a, b) => String(a?.name || a?.id || "").localeCompare(String(b?.name || b?.id || "")));
        setCatalogItems(items);
      })
      .catch(() => { if (active) setCatalogItems([]); });
    return () => { active = false; };
  }, []);

  const execute = async (item) => {
    if (running) return;
    if (item.risk === "danger" && confirming !== item.id) {
      setConfirming(item.id);
      setResult({ tone: "warning", message: `Confirm ${item.label} by pressing the button again.` });
      window.setTimeout(() => setConfirming((value) => value === item.id ? "" : value), 5000);
      return;
    }
    setConfirming("");
    setRunning(item.id);
    setResult({ tone: "working", message: `${item.label} queued…` });
    try {
      let argument = item.argument ? inputs[item.id] : "";
      if (item.argument?.type === "inventory") {
        const value = inputs[item.id] || {};
        argument = `${String(value.player || "").trim()}|${String(value.item || "").trim()}|${String(value.quantity || "1").trim()}`;
      }
      const queued = await submitStreamerCommand(item.id, argument, auth.csrf_token, actionKey(item.id));
      const actionId = queued?.action?.id;
      if (!actionId) throw new Error("Streamer Control did not return an action ID.");
      const finished = await waitForPortalAction(actionId, { attempts: 32, delayMs: 650 });
      if (!finished) {
        setResult({ tone: "warning", message: `${item.label} is still processing. Check again shortly.` });
      } else {
        const actionResult = finished.result || {};
        setResult({
          tone: actionResult.ok ? "good" : "danger",
          message: actionResult.message || (actionResult.ok ? `${item.label} completed.` : `${item.label} failed.`),
        });
      }
      refreshAuth?.();
      onDashboardRefresh?.();
    } catch (error) {
      setResult({ tone: "danger", message: error?.message || `${item.label} failed.` });
    } finally {
      setRunning("");
    }
  };

  const accessState = auth.loading
    ? "checking"
    : !auth.authenticated
      ? "signed-out"
      : !auth.streamer_authorized
        ? "unauthorized"
        : auth.actions_enabled
          ? "ready"
          : "offline";

  return (
    <section className="streamer-panel streamer-control-panel" id="controls">
      <div className="streamer-panel-heading streamer-owner-heading">
        <div><span>Authenticated Backend</span><h2>Streamer Control Center</h2></div>
        <small>15 verified owner actions</small>
      </div>

      {accessState !== "ready" ? (
        <div className={`streamer-control-access ${accessState}`}>
          <div>
            <strong>{accessState === "checking" ? "Checking streamer access…" : accessState === "signed-out" ? "Streamer controls are locked" : accessState === "unauthorized" ? "Read-only dashboard" : "Bot connection required"}</strong>
            <p>
              {accessState === "checking" ? "Verifying your Twitch session and Bot manifest." :
                accessState === "signed-out" ? "Sign in with Twitch to verify the configured broadcaster account. The public dashboard remains visible without signing in." :
                  accessState === "unauthorized" ? "This Twitch account can view the dashboard, but it is not the broadcaster account configured on the Bot." :
                    "Your broadcaster identity is verified, but Portal actions stay disabled until the Bot heartbeat reconnects."}
            </p>
          </div>
          {accessState === "signed-out" ? <a className="primary-button" href={loginUrl("/streamer")}>Sign in with Twitch</a> : null}
        </div>
      ) : (
        <>
          <div className="streamer-control-access ready">
            <div><strong>Streamer authority verified</strong><p>Buttons below run the same allow-listed backend operations as their owner-only chat commands. Arbitrary chat commands cannot be relayed from the Web.</p></div>
            <span className="streamer-control-ready">READY</span>
          </div>
          {result ? <div className={`streamer-control-result ${result.tone}`} aria-live="polite">{result.message}</div> : null}
          <div className="streamer-control-groups">
            {OWNER_COMMAND_GROUPS.map((group, index) => (
              <details className="streamer-control-group" key={group.title} defaultOpen={index === 0}>
                <summary>
                  <span><strong>{group.title}</strong><small>{group.description}</small></span>
                  <b>{group.commands.length}</b><DetailsPointer />
                </summary>
                <div className="streamer-control-grid">
                  {group.commands.map((item) => {
                    const needsArgument = Boolean(item.argument);
                    const argumentValue = inputs[item.id] || "";
                    const inventoryValue = item.argument?.type === "inventory" ? (argumentValue || {}) : null;
                    const inventoryQuantity = inventoryValue ? Number(inventoryValue.quantity || 0) : 0;
                    const missingArgument = item.argument?.type === "inventory"
                      ? !String(inventoryValue?.player || "").trim()
                        || !String(inventoryValue?.item || "").trim()
                        || !Number.isInteger(inventoryQuantity)
                        || inventoryQuantity < 1
                        || inventoryQuantity > 999
                      : needsArgument && item.argument.type !== "number" && !String(argumentValue).trim();
                    const isRunning = running === item.id;
                    const confirmingThis = confirming === item.id;
                    return (
                      <article className={`streamer-control-card risk-${item.risk || "safe"}`} key={item.id}>
                        <div className="streamer-control-card-copy">
                          <code>{item.command}</code>
                          {item.risk === "danger" ? <span>Force action</span> : item.risk === "caution" ? <span>Caution</span> : null}
                        </div>
                        <strong>{item.label}</strong>
                        <p>{item.description}</p>
                        {item.argument?.type === "inventory" ? (
                          <div className="streamer-inventory-admin-fields">
                            <label>
                              <span>Adventurer</span>
                              <select
                                value={inventoryValue?.player || ""}
                                onChange={(event) => setInputs((current) => ({
                                  ...current,
                                  [item.id]: { ...(current[item.id] || {}), player: event.target.value },
                                }))}
                              >
                                <option value="">Choose player…</option>
                                {players.map((player) => (
                                  <option key={`${item.id}-${player.username}`} value={player.username}>
                                    {player.display_name} (@{player.username})
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label>
                              <span>Item</span>
                              <input
                                list={`streamer-item-catalog-${item.id}`}
                                value={inventoryValue?.item || ""}
                                placeholder="Item name or ID"
                                onChange={(event) => setInputs((current) => ({
                                  ...current,
                                  [item.id]: { ...(current[item.id] || {}), item: event.target.value },
                                }))}
                              />
                              <datalist id={`streamer-item-catalog-${item.id}`}>
                                {catalogItems.map((catalogItem) => (
                                  <option key={`${item.id}-${catalogItem.id}`} value={catalogItem.id}>
                                    {catalogItem.name} · {catalogItem.type}
                                  </option>
                                ))}
                              </datalist>
                            </label>
                            <label>
                              <span>Quantity</span>
                              <input
                                type="number"
                                min="1"
                                max="999"
                                value={inventoryValue?.quantity || "1"}
                                onChange={(event) => setInputs((current) => ({
                                  ...current,
                                  [item.id]: { ...(current[item.id] || {}), quantity: event.target.value },
                                }))}
                              />
                            </label>
                          </div>
                        ) : needsArgument ? (
                          <label>
                            <span>{item.argument.label}</span>
                            <input
                              type={item.argument.type}
                              value={argumentValue}
                              placeholder={item.argument.placeholder}
                              min={item.argument.min}
                              max={item.argument.max}
                              onChange={(event) => setInputs((current) => ({ ...current, [item.id]: event.target.value }))}
                            />
                          </label>
                        ) : null}
                        <button
                          className={item.risk === "danger" ? "danger-button" : "ghost-button"}
                          type="button"
                          disabled={Boolean(running) || missingArgument}
                          onClick={() => execute(item)}
                        >
                          {isRunning ? "Running…" : confirmingThis ? `Confirm ${item.label}` : item.label}
                        </button>
                      </article>
                    );
                  })}
                </div>
              </details>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function RosterHeader() {
  return (
    <div className="streamer-roster-header" aria-hidden="true">
      <span /><span>Adventurer</span><span>Job / Region</span><span>Health</span><span>Bosses</span>
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
  const { auth, refreshAuth } = usePortalAuth();

  const refresh = useCallback(() => setRefreshToken((value) => value + 1), []);
  const liveStatus = useLiveUpdates(refresh);

  useEffect(() => {
    document.title = `Crystal Guild Streamer Dashboard — ${WEB_BUILD}`;
    const controller = new AbortController();
    if (!dashboard) setLoading(true);
    fetchStreamerDashboard(controller.signal)
      .then((payload) => { setDashboard(payload); setError(""); })
      .catch((reason) => { if (reason.name !== "AbortError") setError(reason.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
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
  const lastSync = dashboard?.last_sync ? timeAgo(new Date(Number(dashboard.last_sync) * 1000).toISOString()) : "No update yet";

  return (
    <>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader liveStatus={liveStatus} sectionTitle="Streamer Dashboard" brandHref="/streamer" includeStreamer />
      <main id="main-content" className="streamer-shell" tabIndex="-1">
        <section className="streamer-hero">
          <div><p className="eyebrow">Streamer Tools</p><h1>Streamer Dashboard</h1><p>Guild pulse, player health, authenticated backend controls, and broadcast references without a locked viewport.</p></div>
          <div className="streamer-sync-card"><span>Dashboard Status</span><strong>{dashboard?.degraded ? "STALE" : liveStatus === "connected" ? "LIVE" : humanizeLabel(liveStatus)}</strong><small>{dashboard?.degraded ? "Showing saved data · " : ""}Last updated {lastSync}</small></div>
        </section>

        <nav className="streamer-jumpbar" aria-label="Streamer dashboard sections">
          <a href="#controls">Controls</a><a href="#roster">Roster</a><a href="#pulse">Guild Pulse</a><a href="#commands">Chat Reference</a><a href="#overlay">OBS Overlay</a>
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
          <div className="streamer-flow-layout">
            <StreamerControlPanel auth={auth} refreshAuth={refreshAuth} onDashboardRefresh={refresh} players={players} />

            <section className="streamer-panel streamer-roster-panel" id="roster">
              <div className="streamer-panel-heading">
                <div><span>Roster Watch</span><h2>Adventurers</h2></div>
                <div className="streamer-heading-tools"><small>{number(shownPlayers.length)} of {number(players.length)} shown</small><button className="ghost-button" type="button" onClick={refresh}>Refresh</button></div>
              </div>
              <div className="streamer-toolbar">
                <input aria-label="Search streamer roster" onChange={(event) => setSearch(event.target.value)} placeholder="Search hero, Job, title, region..." type="search" value={search} />
                <select aria-label="Filter by status" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option value="all">All statuses</option><option value="ready">Ready</option><option value="resting">Resting</option><option value="ko">KO</option></select>
              </div>
              <RosterHeader />
              <div className="streamer-roster" aria-live="polite">
                {shownPlayers.map((player) => {
                  const hpPercent = Math.round(clampPct(player.hp_current, player.hp_max));
                  return (
                    <Link className="streamer-player-row" key={player.username} to={`/player/${encodeURIComponent(player.username)}`}>
                      <span className={`streamer-status-dot ${player.status}`} aria-label={player.status_label} />
                      <span className="streamer-player-identity"><strong>{player.display_name}</strong><small>@{player.username} · {player.title}</small></span>
                      <span className="streamer-player-job"><strong>{player.job_name}</strong><small>Lv.{number(player.level)} · JLv.{number(player.job_level)} · {player.region}</small></span>
                      <span className={`streamer-hp ${hpTone(player)}`}><span className="streamer-hp-line"><strong>{number(player.hp_current)} / {number(player.hp_max)}</strong><small>{hpPercent}%</small></span><span className="streamer-hp-track"><span style={{ width: `${hpPercent}%` }} /></span></span>
                      <span className="streamer-player-record"><strong>{number(player.boss_clears)}</strong><small>Clears</small></span>
                    </Link>
                  );
                })}
                {!shownPlayers.length ? <div className="streamer-empty">No adventurers match the current filters.</div> : null}
              </div>
            </section>

            <section className="streamer-pulse-grid" id="pulse" aria-label="Guild pulse">
              <section className="streamer-panel streamer-leaders-panel" id="leaders">
                <div className="streamer-panel-heading"><div><span>Guild Leaders</span><h2>At a Glance</h2></div><small>Current leaders</small></div>
                <div className="streamer-leader-grid"><LeaderCard label="Highest Level" leader={dashboard.leaders?.level} /><LeaderCard label="Boss Clears" leader={dashboard.leaders?.boss_clears} /><LeaderCard label="Jobs Mastered" leader={dashboard.leaders?.mastered_jobs} /><LeaderCard label="Achievements" leader={dashboard.leaders?.achievements} /></div>
              </section>

              <section className="streamer-panel streamer-ledger-panel" id="activity">
                <div className="streamer-panel-heading"><div><span>Live Ledger</span><h2>Recent Activity</h2></div><small>Recent gil and item changes</small></div>
                <div className="streamer-activity-list">
                  {(dashboard.activity || []).slice(0, 8).map((item, index) => (
                    <div className="streamer-activity" key={`${item.username}-${item.created_at}-${index}`}><span className="streamer-activity-glyph">{item.kind === "item" ? "◇" : "G"}</span><span><strong>{item.display_name}</strong><small>{item.kind === "item" ? item.asset : humanizeLabel(item.asset)} · {activitySourceLabel(item.source)} · {timeAgo(item.created_at)}</small></span><b className={item.amount >= 0 ? "good-text" : "danger-text"}>{item.amount >= 0 ? "+" : ""}{number(item.amount)}</b></div>
                  ))}
                  {!dashboard.activity?.length ? <div className="streamer-empty">No recent Guild activity.</div> : null}
                </div>
              </section>
            </section>

            <section className="streamer-panel streamer-command-panel" id="commands">
              <div className="streamer-panel-heading"><div><span>On-stream Reference</span><h2>Chat Command Reference</h2></div><small>Collapsed by default · click a group to browse</small></div>
              <CommandGroups groups={STREAM_COMMAND_GROUPS} />
            </section>
          </div>
        ) : null}

        <HostedOverlayCard />
      </main>
      <footer className="site-footer streamer-footer"><span>Crystal Guild Streamer Dashboard · {WEB_RELEASE}</span><span><Link to="/privacy">Privacy Policy</Link> · Streamer Controls execute verified backend actions; Chat Reference only copies commands</span></footer>
    </>
  );
}
