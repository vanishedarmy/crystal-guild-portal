import { lazy, memo, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPlayer } from "../api/players.js";
import JobPortrait from "../components/JobPortrait.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import PortalLinkPanel from "../components/PortalLinkPanel.jsx";
import PageRefreshButton from "../components/PageRefreshButton.jsx";
import SectionErrorBoundary from "../components/SectionErrorBoundary.jsx";
import SiteHeader from "../components/SiteHeader.jsx";
import { useLiveUpdates } from "../hooks/useLiveUpdates.js";
import Overview from "../player/Overview.jsx";
import { number, pct } from "../utils/formatters.js";
import { campRemainingSeconds } from "../utils/campCountdown.js";
import { statusDeadlineMs, currentActivityLabel } from "../utils/activityStatus.js";
import { handleTabListKeyDown } from "../utils/tabKeyboard.js";

const DetailDialog = lazy(() => import("../components/DetailDialog.jsx"));

const MODULES = {
  overview: Overview,
  fellowship: lazy(() => import("../player/Fellowship.jsx")),
  guild_board: lazy(() => import("../player/GuildBoard.jsx")),
  chocobo: lazy(() => import("../player/ChocoboStable.jsx")),
  card_hall: lazy(() => import("../player/CardHall.jsx")),
  gold_saucer: lazy(() => import("../player/GoldSaucer.jsx")),
  retainer: lazy(() => import("../player/RetainerService.jsx")),
  mercs: lazy(() => import("../player/MercService.jsx")),
  jobs: lazy(() => import("../player/Jobs.jsx")),
  inventory: lazy(() => import("../player/Inventory.jsx")),
  shop: lazy(() => import("../player/MoogleEmporium.jsx")),
  blacksmith: lazy(() => import("../player/Blacksmith.jsx")),
  hunts: lazy(() => import("../player/Hunts.jsx")),
  ascension: lazy(() => import("../player/AscensionTrials.jsx")),
  stream: lazy(() => import("../player/StreamActivities.jsx")),
  bestiary: lazy(() => import("../player/Bestiary.jsx")),
  relics: lazy(() => import("../player/Relics.jsx")),
  achievements: lazy(() => import("../player/Achievements.jsx")),
  trophies: lazy(() => import("../player/TrophyHall.jsx")),
  seasonal: lazy(() => import("../player/SeasonalEvent.jsx")),
  records: lazy(() => import("../player/Records.jsx")),
};

const TABS = [
  ["overview", "Overview", "◇"],
  ["hunts", "Adventure Board", "⌖"],
  ["ascension", "Ascension Trials", "✧"],
  ["stream", "Stream Activities", "◉"],
  ["jobs", "Jobs", "✦"],
  ["inventory", "Equipment & Inventory", "◆"],
  ["shop", "Moogle Emporium", "¤"],
  ["blacksmith", "Blacksmith", "⚒"],
  ["chocobo", "Chocobo Stable", "♞"],
  ["retainer", "Retainer Service", "◇"],
  ["mercs", "Hero Merc Service", "⚔"],
  ["gold_saucer", "Gold Saucer", "✺"],
  ["card_hall", "Card Hall", "♜"],
  ["fellowship", "Fellowship", "✥"],
  ["guild_board", "Guild Board", "▤"],
  ["bestiary", "Bestiary", "◈"],
  ["relics", "Relics", "✧"],
  ["achievements", "Achievements & Titles", "★"],
  ["records", "Records", "▤"],
  ["trophies", "Hall of Trophies", "♛"],
  ["seasonal", "Seasonal Event", "☾"],
];

const TAB_TONES = {
  overview: "aqua",
  hunts: "gold",
  ascension: "violet",
  stream: "cyan",
  jobs: "violet",
  inventory: "emerald",
  shop: "rose",
  blacksmith: "ember",
  chocobo: "amber",
  retainer: "teal",
  mercs: "blue",
  gold_saucer: "gold",
  card_hall: "violet",
  fellowship: "green",
  guild_board: "gold",
  bestiary: "violet",
  relics: "azure",
  achievements: "magenta",
  records: "cyan",
  trophies: "violet",
  seasonal: "magenta",
};

const TAB_GROUPS = [
  ["Core", ["overview", "hunts", "ascension", "stream", "jobs", "inventory"]],
  ["Guild Services", ["shop", "blacksmith", "chocobo", "retainer", "mercs"]],
  ["Attractions", ["gold_saucer", "card_hall"]],
  ["Guild", ["fellowship", "guild_board"]],
  ["Progress & Legacy", ["bestiary", "relics", "achievements", "records", "trophies", "seasonal"]],
];

// Camp and active adventures use a live countdown. Memoizing the active module prevents
// that parent timer from rerendering hundreds of shop, market and inventory cards.
const StableProfileModule = memo(function StableProfileModule({ Module, data, overview, onDetail, onRefresh, onNavigate }) {
  return <Module data={data} overview={overview} onDetail={onDetail} onRefresh={onRefresh} onNavigate={onNavigate} />;
});

export default function PlayerProfile() {
  const { username: routeUsername } = useParams();
  const username = decodeURIComponent(routeUsername || "");
  const [overview, setOverview] = useState(null);
  const [moduleCache, setModuleCache] = useState({});
  const moduleVersions = useRef({});
  const [activeTab, setActiveTab] = useState("overview");
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [tabError, setTabError] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [updated, setUpdated] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  const [manualRefreshToken, setManualRefreshToken] = useState(0);
  const [campDeadline, setCampDeadline] = useState(0);
  const [clockNow, setClockNow] = useState(() => Date.now());

  const refresh = useCallback(() => setRefreshToken((value) => value + 1), []);
  const manualRefresh = useCallback(() => {
    setManualRefreshToken((value) => value + 1);
    setRefreshToken((value) => value + 1);
  }, []);
  const liveStatus = useLiveUpdates(refresh);

  useEffect(() => {
    setOverview(null);
    setModuleCache({});
    moduleVersions.current = {};
    setTabError(null);
    setActiveTab("overview");
  }, [username]);

  useEffect(() => {
    if (!username) return undefined;
    const controller = new AbortController();
    if (!overview) setOverviewLoading(true);
    fetchPlayer(username, "overview", controller.signal)
      .then((profile) => {
        setOverview(profile);
        setError("");
        document.title = `${profile.identity.display_name} — Crystal Guild`;
        setUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      })
      .catch((reason) => {
        if (reason.name !== "AbortError") setError(reason.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setOverviewLoading(false);
      });
    return () => controller.abort();
  }, [username, refreshToken]);

  useEffect(() => {
    if (!username || activeTab === "overview" || activeTab === "fellowship" || activeTab === "chocobo" || activeTab === "gold_saucer" || activeTab === "card_hall" || activeTab === "retainer" || activeTab === "mercs" || activeTab === "stream" || moduleVersions.current[activeTab] === refreshToken) return undefined;
    const controller = new AbortController();
    if (!moduleCache[activeTab]) setTabLoading(true);
    setTabError(null);
    const requestedModule = activeTab === "shop" || activeTab === "blacksmith" ? "inventory" : activeTab === "ascension" ? "hunts" : activeTab;
    fetchPlayer(username, requestedModule, controller.signal)
      .then((payload) => {
        moduleVersions.current[activeTab] = refreshToken;
        setModuleCache((current) => ({ ...current, [activeTab]: payload }));
        setTabError(null);
      })
      .catch((reason) => {
        if (reason.name !== "AbortError") setTabError({ tab: activeTab, message: reason.message });
      })
      .finally(() => {
        if (!controller.signal.aborted) setTabLoading(false);
      });
    return () => controller.abort();
  }, [username, activeTab, refreshToken]);

  useEffect(() => {
    const receivedAt = Date.now();
    const deadline = statusDeadlineMs(overview?.status, receivedAt);
    setCampDeadline(deadline);
    setClockNow(receivedAt);
    if (!deadline) return undefined;

    const syncClock = () => setClockNow(Date.now());
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") syncClock();
    };
    const timer = window.setInterval(() => {
      const now = Date.now();
      setClockNow(now);
      if (now >= deadline) window.clearInterval(timer);
    }, 1000);
    window.addEventListener("focus", syncClock);
    window.addEventListener("pageshow", syncClock);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", syncClock);
      window.removeEventListener("pageshow", syncClock);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [overview?.status?.state, overview?.status?.until, overview?.status?.remaining_seconds]);

  const moduleData = activeTab === "overview" || activeTab === "fellowship" || activeTab === "chocobo" || activeTab === "gold_saucer" || activeTab === "card_hall" || activeTab === "retainer" || activeTab === "mercs" || activeTab === "stream" ? overview : moduleCache[activeTab] || null;
  const ActiveModule = MODULES[activeTab];
  const campRemaining = campRemainingSeconds(campDeadline, clockNow);
  const displayedStatusState = overview?.status?.state === "resting" && campDeadline && campRemaining <= 0
    ? "ready_after_rest"
    : overview?.status?.state;
  const statusText = currentActivityLabel(overview?.status, campRemaining);

  return (
    <>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader liveStatus={liveStatus} />
      <main id="main-content" className="shell" tabIndex="-1">
        <section className="view">
          <div className="profile-topbar">
            <a className="back-link" href="/players">← Guild Heroes</a>
            <span className="last-update">{updated ? `Updated ${updated}` : "Live profile"}</span>
          </div>

          {error ? <div className="state-message compact-state">{error}</div> : null}
          {overview ? (
            <div className="profile-header">
              <JobPortrait jobName={overview.job.name} className="profile-job-portrait" eager label={`${overview.identity.display_name} — ${overview.job.name}`} />
              <div className="profile-identity">
                <p className="eyebrow">Crystal Guild Adventurer</p>
                <h1 className="display-name">{overview.identity.display_name}</h1>
                <div className="profile-handle">@{overview.identity.username}</div>
                <div className="profile-jobline">
                  <span>Lv. {number(overview.identity.level)} {overview.job.name}</span>
                  {overview.job.level ? <span>JLv. {number(overview.job.level)}</span> : null}
                  <span className={`status-badge ${displayedStatusState}`}>{statusText}</span>
                </div>
                <div className="profile-title">“{overview.identity.title}”</div>
              </div>
              <div className="profile-vitals">
                <div className="vital-row">
                  <div className="vital-label"><span>HP</span><span>{number(overview.hp.current)} / {number(overview.hp.max)}</span></div>
                  <ProgressBar value={pct(overview.hp.current, overview.hp.max)} className="hp" />
                </div>
                {Number(overview.resources?.mp?.max || 0) > 0 ? (
                  <div className="vital-row">
                    <div className="vital-label"><span>MP</span><span>{number(overview.resources.mp.current)} / {number(overview.resources.mp.max)}</span></div>
                    <ProgressBar value={pct(overview.resources.mp.current, overview.resources.mp.max)} className="mp" />
                  </div>
                ) : null}
                {Number(overview.resources?.ap?.max || 0) > 0 ? (
                  <div className="vital-row">
                    <div className="vital-label"><span>AP</span><span>{number(overview.resources.ap.current)} / {number(overview.resources.ap.max)}</span></div>
                    <ProgressBar value={pct(overview.resources.ap.current, overview.resources.ap.max)} className="ap" />
                  </div>
                ) : null}
                <div className="vital-row">
                  <div className="vital-label"><span>Character XP</span><span>{number(overview.identity.xp)} / {number(overview.identity.xp_next)}</span></div>
                  <ProgressBar value={pct(overview.identity.xp, overview.identity.xp_next)} />
                </div>
                {overview.job.level ? (
                  <div className="vital-row">
                    <div className="vital-label"><span>Job JP</span><span>{number(overview.job.jp)} / {number(overview.job.jp_next)}</span></div>
                    <ProgressBar value={pct(overview.job.jp, overview.job.jp_next)} />
                  </div>
                ) : null}
                <div className="currency-row">
                  <div className="currency-box"><strong>{number(overview.identity.gil)}</strong><span>Gil</span></div>
                  <div className="currency-box"><strong>{number(overview.identity.hunt_seals)}</strong><span>Hunt Seals</span></div>
                </div>
              </div>
            </div>
          ) : <div className="profile-header skeleton-panel" />}

          <PortalLinkPanel username={username} />

          <div className="profile-navigation">
            <label className="profile-tab-select">
              <span>Crystal Guild section</span>
              <select value={activeTab} onChange={(event) => setActiveTab(event.target.value)} aria-label="Choose adventurer profile section">
                {TAB_GROUPS.map(([group, ids]) => (
                  <optgroup label={group} key={group}>
                    {TABS.filter(([id]) => ids.includes(id)).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                  </optgroup>
                ))}
              </select>
            </label>
            <nav className="profile-tabs" aria-label="Adventurer profile sections" role="tablist" aria-orientation="horizontal" onKeyDown={(event) => handleTabListKeyDown(event, setActiveTab)}>
              {TABS.map(([id, label, glyph]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === id}
                  aria-controls="profile-active-panel"
                  id={`profile-tab-${id}`}
                  data-tab-value={id}
                  data-tab-tone={TAB_TONES[id]}
                  tabIndex={activeTab === id ? 0 : -1}
                  className={activeTab === id ? "active" : ""}
                  onClick={() => setActiveTab(id)}
                >
                  <span className="tab-glyph" aria-hidden="true">{glyph}</span><span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div id="profile-active-panel" className="profile-content" role="tabpanel" aria-labelledby={`profile-tab-${activeTab}`} tabIndex="0" aria-busy={overviewLoading || tabLoading}>
            <SectionErrorBoundary resetKey={`${username}:${activeTab}:${refreshToken}`}>
              <Suspense fallback={<div className="state-message">Opening {activeTab}...</div>}>
                {!moduleData || !ActiveModule
                  ? tabError?.tab === activeTab
                    ? <div className="state-message section-load-error" role="alert">
                        <span>Could not load this section: {tabError.message}</span>
                        <button type="button" className="equipment-action-button secondary" onClick={refresh}>Retry Section</button>
                      </div>
                    : <div className="state-message">Loading {activeTab}...</div>
                  : <StableProfileModule key={`${activeTab}:${manualRefreshToken}`} Module={ActiveModule} data={moduleData} overview={overview} onDetail={setDetail} onRefresh={refresh} onNavigate={setActiveTab} />}
              </Suspense>
              {moduleData && tabLoading ? <div className="background-refresh" role="status" aria-live="polite">Refreshing…</div> : null}
            </SectionErrorBoundary>
          </div>

          <PageRefreshButton onRefresh={manualRefresh} disabled={overviewLoading || tabLoading} />
        </section>
      </main>
      {detail ? (
        <Suspense fallback={null}>
          <DetailDialog detail={detail} onClose={() => setDetail(null)} />
        </Suspense>
      ) : null}
      <footer className="site-footer">
        <span>Crystal Guild</span>
        <span><a href="/fellowship">Fellowship</a> · <a href="/guide">Player Guide</a> · <a href="/privacy">Privacy Policy</a> · Profiles update automatically from Twitch chat</span>
      </footer>
    </>
  );
}
