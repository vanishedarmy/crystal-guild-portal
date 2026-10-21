import LockIcon from "../components/LockIcon.jsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchFellowship } from "../api/fellowship.js";
import ProgressBar from "../components/ProgressBar.jsx";
import PageRefreshButton from "../components/PageRefreshButton.jsx";
import SiteHeader from "../components/SiteHeader.jsx";
import { useLiveUpdates } from "../hooks/useLiveUpdates.js";
import { number, pct, timeAgo } from "../utils/formatters.js";
import { DetailsPointer } from "../components/CollapsePointer.jsx";
import { InitiativeCards } from "../components/InitiativeCards.jsx";

function projectTypeLabel(project) {
  if (project?.project_type === "supply_drive") return "Supply Drive";
  if (project?.project_type === "guild_objective") return "Guild Objective";
  if (project?.project_type === "airship_construction") return "Airship Construction";
  if (project?.project_type === "airship_upgrade") return "Airship Upgrade";
  return project?.teaser ? "Guild Project" : "Construction";
}

function ProjectCard({ project }) {
  if (!project) {
    return (
      <section className="panel fellowship-project fellowship-empty-project">
        <div className="panel-title-row"><h2>Active Project</h2><span className="small-badge">Awaiting Selection</span></div>
        <p className="muted">The Fellowship is ready for its next construction project. The streamer chooses the next unlocked Guild project.</p>
      </section>
    );
  }
  return (
    <section className="panel fellowship-project">
      <div className="panel-title-row">
        <div><span className="panel-kicker">Active Project</span><h2>{project.name}</h2></div>
        <span className="small-badge">{projectTypeLabel(project)}{project.project_type === "construction" && !project.teaser ? ` · Lv. ${number(project.level || project.tier)}` : ""}</span>
      </div>
      <p className="muted fellowship-project-copy">{project.description}</p>
      <div className="fellowship-requirements">
        {(project.requirements || []).map((requirement) => (
          <div className="fellowship-requirement" key={requirement.key}>
            <div className="vital-label"><span>{requirement.label}</span><span>{number(requirement.current)} / {number(requirement.target)}</span></div>
            <ProgressBar value={pct(requirement.current, requirement.target)} />
          </div>
        ))}
      </div>
      <p className="fellowship-command-hint">
        {project.project_type === "guild_objective"
          ? "This Guild Objective advances automatically from normal play."
          : <>Donate requested resources with <strong>!contribute gil &lt;amount&gt;</strong> or <strong>!contribute &lt;amount&gt; &lt;item&gt;</strong>. Gameplay requirements advance automatically.</>}
      </p>
    </section>
  );
}


const FELLOWSHIP_DISCLOSURE_KEY = "crystal-guild:fellowship-disclosures:v1";

function initialDisclosureState() {
  const narrow = globalThis.matchMedia?.("(max-width: 760px)")?.matches ?? false;
  const state = {
    facilities: !narrow,
    services: false,
    airshipDetails: false,
    expeditions: false,
    availableWork: false,
    legacyGoals: false,
    deeds: false,
  };
  try {
    const stored = JSON.parse(globalThis.localStorage?.getItem(FELLOWSHIP_DISCLOSURE_KEY) || "{}");
    for (const key of Object.keys(state)) if (typeof stored?.[key] === "boolean") state[key] = stored[key];
  } catch {}
  return state;
}

function FacilityCard({ facility }) {
  const level = number(facility.level ?? facility.tier);
  const maxLevel = number(facility.max_level ?? facility.max_tier);
  return (
    <article className={`fellowship-facility ${facility.locked ? "locked" : ""}`}>
      <div className="fellowship-facility-heading">
        <div>
          <span className="panel-kicker">{facility.locked ? "Future Construction" : "Guild Facility"}</span>
          <h3>{facility.name}</h3>
        </div>
        <span className="small-badge">{facility.locked ? <LockIcon label={`Locked facility: ${facility.name}`} /> : `Lv. ${level} / ${maxLevel}`}</span>
      </div>
      <p>{facility.description}</p>
      <strong>{facility.current_benefit}</strong>
      {facility.next_benefit ? <small>{facility.locked ? facility.next_benefit : `Next: ${facility.next_benefit}`}</small> : <small>Facility construction complete.</small>}
    </article>
  );
}

export default function FellowshipPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  const refresh = useCallback(() => setRefreshToken((value) => value + 1), []);
  const liveStatus = useLiveUpdates(refresh);
  const [disclosures, setDisclosures] = useState(initialDisclosureState);
  const setDisclosure = useCallback((key, open) => {
    setDisclosures((current) => {
      if (current[key] === open) return current;
      const next = { ...current, [key]: open };
      try { globalThis.localStorage?.setItem(FELLOWSHIP_DISCLOSURE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    document.title = "Fellowship — Crystal Guild";
    const controller = new AbortController();
    fetchFellowship(controller.signal)
      .then((payload) => {
        setData(payload?.available === false ? null : payload);
        setError("");
      })
      .catch((reason) => {
        if (reason.name !== "AbortError") setError(reason.message);
      });
    return () => controller.abort();
  }, [refreshToken]);

  const levelProgress = useMemo(() => {
    if (!data?.level_progress) return 0;
    const progress = data.level_progress;
    if (progress.maxed) return 100;
    return pct(Number(progress.current) - Number(progress.start), Number(progress.next) - Number(progress.start));
  }, [data]);

  const expeditionProject = data?.active_project?.id === "expedition_board"
    ? data.active_project
    : (data?.available_projects || []).find((project) => project.id === "expedition_board") || null;
  const expeditionStatus = data?.expedition_board_complete
    ? "BOARD READY"
    : data?.active_project?.id === "expedition_board"
      ? "UNDER CONSTRUCTION"
      : expeditionProject
        ? "PROJECT AVAILABLE"
        : <LockIcon label="Guild Expedition Board locked" />;

  return (
    <>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <SiteHeader liveStatus={liveStatus} />
      <main id="main-content" className="shell fellowship-shell" tabIndex="-1">
        {error ? <div className="state-message compact-state">{error}</div> : null}
        {!data && !error ? <div className="state-message" role="status" aria-live="polite">Fellowship data is updating.</div> : null}
        {data ? (
          <section className="view fellowship-view">
            <div className="fellowship-hero">
              <div>
                <p className="eyebrow">Crystal Guild Fellowship</p>
                <h1>The Fellowship</h1>
                <p className="lede">One Guild, built by the entire community. Raise shared facilities, complete Guild projects, and send the Fellowship Airship on missions powered by normal play.</p>
              </div>
              <aside className="fellowship-level-card" aria-label="Fellowship level">
                <span>Fellowship</span>
                <strong>{data.level_label}</strong>
                <div className="fellowship-level-progress"><ProgressBar value={levelProgress} /></div>
                <small>{data.level_progress?.maxed ? `${number(data.renown)} Renown · Current cap` : `${number(data.renown)} / ${number(data.level_progress?.next || 0)} Renown`}</small>
              </aside>
            </div>

            <div className="fellowship-summary-grid fellowship-priority-grid" aria-label="Current Guild priorities">
              <div className={`fellowship-summary ${data.active_project ? "active" : "idle"}`}><span>Current Project</span><strong>{data.active_project?.name || "Awaiting Selection"}</strong><small>{data.active_project ? `${number((data.active_project.requirements || []).filter((item) => !item.complete).length)} goals remaining` : "The streamer can choose the next unlocked project"}</small></div>
              <div className={`fellowship-summary ${data.airship?.active_mission ? "active" : ""}`}><span>Guild Airship</span><strong>{data.airship?.built ? (data.airship?.active_mission ? data.airship.active_mission.name : "Ready") : "Building"}</strong><small>{data.airship?.active_mission ? "Legacy mission returning" : data.airship?.built ? "Personal sky expeditions unlocked" : `Dock Lv. ${number(data.airship?.dock_level)} / 3`}</small></div>
              <div className="fellowship-summary"><span>Weekly Orders</span><strong>{number(data.orders?.completed)} / {number(data.orders?.total)} Complete</strong><small>{(data.orders?.orders || []).find((order) => !order.complete)?.name || "Weekly set cleared"}</small></div>
              <div className="fellowship-summary"><span>Guild Legacy</span><strong>{data.legacy?.stage_name || "Founding Hall"}</strong><small>{number(data.legacy?.completed)} / {number(data.legacy?.total)} accomplishments</small></div>
            </div>

            <section className="panel fellowship-section guild-contracts" aria-labelledby="guild-contracts-title">
              <div className="panel-title-row"><div><span className="panel-kicker">Weekly community objectives</span><h2 id="guild-contracts-title">Fellowship Contracts</h2></div><span className="small-badge">{number(data.contracts?.completed || 0)} / {number(data.contracts?.total || 3)} · {data.contracts?.period || "This week"}</span></div>
              <p className="muted guild-contracts-description">Three optional contracts rotate each Monday at 00:00 UTC. Qualifying actions from every member count. When a contract is completed, its reward is automatically granted to all current Fellowship members.</p>
              <InitiativeCards communal objectives={data.contracts?.objectives || []} />
            </section>

            <ProjectCard project={data.active_project} />

            <details className="panel fellowship-section fellowship-guild-board fellowship-dashboard-disclosure" open={disclosures.facilities} onToggle={(event) => setDisclosure("facilities", event.currentTarget.open)}>
              <summary><span><span className="panel-kicker">Guild Hall Foundation</span><strong>Guild Facilities</strong><small>Construction progress and current facility benefits</small></span><span className="small-badge">{number(data.guild_board?.built_count)} / {number(data.guild_board?.facility_count || 7)} Built</span><DetailsPointer /></summary>
              <div className="fellowship-disclosure-body">
                <p className="muted fellowship-board-copy">Guild facilities grow through shared construction projects. Gil and requested materials can be donated voluntarily; gameplay milestones advance automatically.</p>
                <div className="fellowship-facility-grid">
                  {(data.facilities || []).map((facility) => <FacilityCard key={facility.id} facility={facility} />)}
                </div>
              </div>
            </details>

            <details className="panel fellowship-section fellowship-services fellowship-dashboard-disclosure" open={disclosures.services} onToggle={(event) => setDisclosure("services", event.currentTarget.open)}>
              <summary><span><span className="panel-kicker">Guild Services &amp; Workshop</span><strong>Facility Services</strong><small>Workshop, Emporium, Trading Post, Stable, and Archive benefits</small></span><span className="small-badge">Guild Services</span><DetailsPointer /></summary>
              <div className="fellowship-disclosure-body">
                <p className="muted">Facility levels provide practical Guild services without replacing normal character progression.</p>
                <div className="fellowship-service-grid">
                  <article><span>Workshop</span><strong>{number(data.services?.workshop?.forge_discount * 100)}% lower forge fees</strong><small>{number(data.services?.workshop?.level) >= 2 ? "Material refining available from the signed-in Fellowship tab." : "Material refining unlocks at Workshop Lv. 2."}</small></article>
                  <article><span>Moogle Emporium Annex</span><strong>{number(Number(data.services?.emporium_annex?.purchase_discount || 0) * 100)}% purchase discount</strong><small>Construction grants 10% off every regional counter. Your world-map location determines stock.</small></article>
                  <article><span>Moogle Trading Post</span><strong>Player market open</strong><small>{number(Number(data.services?.trading_post?.listing_fee_rate ?? 0.02) * 100)}% listing fee · {number(Number(data.services?.trading_post?.sale_tax_rate ?? 0.05) * 100)}% sale tax · {number(data.services?.trading_post?.active_limit || 6)} active listings. Construction improves fees and capacity.</small></article>
                  <article><span>Chocobo Stables</span><strong>+{number(data.services?.chocobo_stable?.xp_bonus * 100)}% Bond XP</strong><small>Applies automatically whenever your registered Chocobo earns XP.</small></article>
                  <article><span>Guild Archive</span><strong>+{Number((data.services?.archive?.rare_event_bonus || 0) * 100).toFixed(1)}% rare events</strong><small>Archive research modestly improves rare Expedition event chances.</small></article>
                </div>
              </div>
            </details>

            <section className="panel fellowship-section fellowship-airship" aria-labelledby="guild-airship-title">
              <div className="panel-title-row">
                <div><span className="panel-kicker">Guild Airship</span><h2 id="guild-airship-title">{data.airship?.built ? "Crystal Guild Airship" : "Airship Construction"}</h2></div>
                <span className="small-badge">{data.airship?.built ? "EXPEDITIONS UNLOCKED" : `Dock Lv. ${number(data.airship?.dock_level)} / 3`}</span>
              </div>
              {!data.airship?.built ? (
                <div className="fellowship-airship-empty">
                  <div>
                    <strong>Build the Guild&apos;s shared Airship</strong>
                    <p>Complete <b>Airship Dock Lv. 1</b>, then finish the <b>Crystal Guild Airship</b> Fellowship project. Once constructed, eligible adventurers can begin independent Airship Expeditions to three remote regions beyond Chocobo routes.</p>
                  </div>
                  <span className="small-badge">Remote expeditions unlock after construction</span>
                </div>
              ) : (
                <>
                  {data.airship?.active_mission ? (
                    <article className={`fellowship-airship-active ${data.airship.active_mission.ready ? "ready" : ""}`}>
                      <div>
                        <span className="panel-kicker">Legacy Mission (completing automatically)</span>
                        <h3>{data.airship.active_mission.name}</h3>
                        <p>{data.airship.active_mission.description}</p>
                      </div>
                      <div className="fellowship-airship-mission-status">
                        <strong>{data.airship.active_mission.ready ? "Mission goal secured" : `${number(data.airship.active_mission.progress)} / ${number(data.airship.active_mission.target)} progress`}</strong>
                        <ProgressBar value={pct(data.airship.active_mission.progress, data.airship.active_mission.target)} />
                        <small>Returns in {data.airship.active_mission.duration_label} · {number(data.airship.active_mission.participant_count)} contributors</small>
                      </div>
                    </article>
                  ) : (
                    <div className="fellowship-airship-ready"><strong>Airship Expeditions available to Guild members.</strong><span>Launch your personal remote Expedition from the Adventure Board or use <code>!airshipregions</code> in Twitch chat. No shared deployment queue.</span></div>
                  )}

                  <details className="fellowship-details fellowship-airship-details" open={disclosures.airshipDetails} onToggle={(event) => setDisclosure("airshipDetails", event.currentTarget.open)}>
                    <summary><span><strong>Remote Regions &amp; Airship Upgrades</strong><small>Explore skybound destinations and view Guild-wide upgrades</small></span><span>3 Regions</span><DetailsPointer /></summary>
                    <div className="fellowship-airship-detail-body">
                  <div className="fellowship-airship-grid">
                    {[
                      {id:"shattered_sky_isles",name:"The Shattered Sky Isles",level:25,core:0,detail:"Floating islands and sky ruins"},
                      {id:"aetherstorm_expanse",name:"The Aetherstorm Expanse",level:35,core:1,detail:"Aetherstorms and dangerous crystals"},
                      {id:"forgotten_dominion",name:"The Forgotten Dominion",level:45,core:2,detail:"Ancient empire beyond the clouds"},
                    ].map((region) => {
                      const core = Number((data.airship?.upgrades || []).find((u) => u.id === "crystal_core")?.tier || 0);
                      return <article className={`fellowship-airship-mission ${core >= region.core ? "" : "locked"}`} key={region.id}>
                        <span className="panel-kicker">Core Tier {region.core} · Lv. {region.level}+</span>
                        <h3>{region.name}</h3><p>{region.detail}</p>
                        <small>{core >= region.core ? "Airship route unlocked — personal level requirement applies" : `Upgrade Crystal Core to Tier ${region.core}`}</small>
                      </article>;
                    })}
                  </div>

                  <div className="fellowship-airship-upgrades">
                    <div className="panel-title-row compact"><h3>Airship Upgrades</h3><span className="small-badge">Dock-gated · Tier 0–3</span></div>
                    <div className="fellowship-airship-upgrade-grid">
                      {(data.airship?.upgrades || []).map((upgrade) => (
                        <article key={upgrade.id}><span>{upgrade.name}</span><strong>Tier {number(upgrade.tier)} / {number(upgrade.max_tier)}</strong><small>{upgrade.description}</small></article>
                      ))}
                    </div>
                  </div>

                  {(data.airship?.history || []).length ? (
                    <div className="fellowship-airship-history">
                      <strong>Historic Airship Missions (pre-v1.9.8)</strong>
                      <div>
                        {data.airship.history.map((mission) => (
                          <p key={mission.run_id}><strong>{mission.name}</strong> · {mission.outcome === "success" ? "Success" : "Failed"} · {number(mission.progress)}/{number(mission.target)} · {number(mission.participant_count)} contributors · {timeAgo(new Date(Number(mission.ended_at) * 1000).toISOString())}</p>
                        ))}
                      </div>
                    </div>
                  ) : null}
                    </div>
                  </details>
                </>
              )}
            </section>

            <details className="panel fellowship-details fellowship-expedition-board" open={disclosures.expeditions} onToggle={(event) => setDisclosure("expeditions", event.currentTarget.open)}>
              <summary><span><strong>Expeditions — Guild Board</strong><small>Existing Guild-wide Expedition access</small></span><span className="small-badge">{expeditionStatus}</span><DetailsPointer /></summary>
              <div className="fellowship-expedition-body">
              <p className="muted fellowship-expedition-copy">Complete the shared Guild Board to unlock Expeditions. Ground routes require a personal Chocobo; remote sky routes require a constructed Guild Airship.</p>
              <div className="fellowship-expedition-grid">
                <article>
                  <span>Guild Requirement</span>
                  <strong>Expedition Board</strong>
                  <small>{data.expedition_board_complete ? "Complete — the Guild Board is prepared." : expeditionProject ? `${number((expeditionProject.requirements || []).filter((requirement) => !requirement.complete).length)} Board goals remain.` : "Unlock at Guild Hall Tier 1 and Fellowship LVL 6."}</small>
                </article>
                <article>
                  <span>Adventurer Requirement</span>
                  <strong>Registered Chocobo</strong>
                  <small>A registered Chocobo is required for ground routes; Airship routes instead require the Guild Airship.</small>
                </article>
                <article>
                  <span>Launch Status</span>
                  <strong>Open</strong>
                  <small>Five Chocobo regions and three Airship regions offer individual Expedition routes as they unlock.</small>
                </article>
              </div>
              <div className="fellowship-expedition-note"><strong>Guild Board Note:</strong> Complete the Expedition Board to open Expedition routes Guild-wide. Chocobo registration is required only for ground routes; Airship construction unlocks remote routes.</div>
              </div>
            </details>

            {(data.available_projects || []).length ? (
              <details className="panel fellowship-details fellowship-available-projects" open={disclosures.availableWork} onToggle={(event) => setDisclosure("availableWork", event.currentTarget.open)}>
                <summary><span><strong>Available Guild Work</strong><small>Construction, Supply Drives, and gameplay Objectives the Guild can begin next.</small></span><span>{number(data.available_projects.length)} Unlocked</span><DetailsPointer /></summary>
                <div className="fellowship-project-options">
                  {data.available_projects.map((project) => (
                    <article key={project.id} data-project-type={project.project_type || "construction"}>
                      <span className="panel-kicker">{projectTypeLabel(project)}</span>
                      <strong>{project.name}</strong>
                      <span>{project.description}</span>
                      <small>
                        {project.teaser
                          ? "Expedition launch project"
                          : project.project_type === "construction"
                            ? `Lv. ${number(project.level || project.tier)} · ${project.requirements?.length || 0} goals`
                            : `${project.requirements?.length || 0} goal${project.requirements?.length === 1 ? "" : "s"} · +${number(project.reward_renown || 0)} Guild Renown`}
                      </small>
                    </article>
                  ))}
                </div>
              </details>
            ) : null}

            <section className="panel fellowship-section fellowship-orders">
              <div className="panel-title-row"><div><span className="panel-kicker">This Week</span><h2>Fellowship Orders</h2></div><span className="small-badge">{number(data.orders?.completed)} / {number(data.orders?.total)} Complete</span></div>
              <div className="fellowship-order-reward-note">
                <strong>Help the Guild, get paid too.</strong> Completed Orders pay their listed contributor reward. Clearing all three adds <b>{number(data.orders?.weekly_bonus?.personal_gil)}g +{number(data.orders?.weekly_bonus?.personal_renown)} personal Renown</b> to everyone who helped that week, plus +{number(data.orders?.weekly_bonus?.guild_renown)} shared Guild Renown.
              </div>
              <div className="fellowship-order-grid">
                {(data.orders?.orders || []).map((order) => (
                  <article className={`fellowship-order ${order.complete ? "complete" : ""}`} key={order.id}>
                    <span>{order.complete ? "Complete" : "In Progress"}</span>
                    <h3>{order.name}</h3>
                    <p>{order.description}</p>
                    <small className="fellowship-order-reward">Guild: +{number(order.renown)} Renown · Contributors: {number(order.personal_gil)}g +{number(order.personal_renown)} personal Renown</small>
                    <div className="vital-label"><span>Progress</span><span>{number(order.progress)} / {number(order.target)}</span></div>
                    <ProgressBar value={pct(order.progress, order.target)} />
                  </article>
                ))}
              </div>
            </section>

            <section className={`panel fellowship-section fellowship-legacy legacy-stage-${number(data.legacy?.stage || 1)}`} aria-labelledby="guild-legacy-title">
              <div className="panel-title-row">
                <div><span className="panel-kicker">Guild Legacy</span><h2 id="guild-legacy-title">{data.legacy?.stage_name || "Founding Hall"}</h2></div>
                <span className="small-badge">{number(data.legacy?.completed)} / {number(data.legacy?.total)} Accomplishments</span>
              </div>
              <p className="muted">Permanent Guild accomplishments turn the Hall and Archive into a record of what the community has achieved. Legacy rewards are recognition, trophies, and modest shared Renown—not combat power.</p>
              <div className="fellowship-legacy-shelf" aria-label="Unlocked Guild Legacy trophies">
                {(data.legacy?.decorations || []).length ? (data.legacy.decorations || []).map((trophy) => <span key={trophy}>◆ {trophy}</span>) : <span className="muted">The first Guild trophy is still waiting to be earned.</span>}
              </div>
              <details className="fellowship-details fellowship-legacy-goals" open={disclosures.legacyGoals} onToggle={(event) => setDisclosure("legacyGoals", event.currentTarget.open)}>
                <summary><span><strong>Legacy Goals</strong><small>Permanent accomplishments and trophy progress</small></span><span>{number(data.legacy?.completed)} / {number(data.legacy?.total)}</span><DetailsPointer /></summary>
                <div className="fellowship-legacy-grid">
                  {(data.legacy?.accomplishments || []).map((item) => (
                    <article className={item.complete ? "complete" : ""} key={item.id}>
                      <div><span>{item.complete ? "Trophy Earned" : "Legacy Goal"}</span><strong>{item.name}</strong></div>
                      <p>{item.description}</p>
                      <small>{item.trophy} · +{number(item.renown)} Guild Renown</small>
                      <div className="vital-label"><span>Progress</span><span>{number(item.progress)} / {number(item.target)}</span></div>
                      <ProgressBar value={pct(item.progress, item.target)} />
                    </article>
                  ))}
                </div>
              </details>
            </section>

            <div className="fellowship-split">
              <section className="panel fellowship-section">
                <div className="panel-title-row"><h2>Guild Standing</h2><span className="small-badge">Personal Ranks</span></div>
                <div className="fellowship-leader-list">
                  {(data.leaders || []).slice(0, 8).map((member, index) => (
                    <Link to={`/player/${encodeURIComponent(member.username)}`} className="fellowship-leader" key={member.username}>
                      <b>{index + 1}</b>
                      <span><strong>{member.display_name}</strong><small>{member.rank}{member.founding_member ? " · Founding Member" : ""}</small></span>
                      <em>{number(member.renown)}</em>
                    </Link>
                  ))}
                </div>
                <details className="fellowship-details">
                  <summary>View the Guild Rank ladder<DetailsPointer /></summary>
                  <div className="fellowship-rank-ladder">
                    {(data.rank_ladder || []).map((rank, index) => (
                      <div key={rank.name}><span>{index + 1}</span><strong>{rank.name}</strong><em>{number(rank.renown)} Renown</em></div>
                    ))}
                  </div>
                </details>
              </section>

              <section className="panel fellowship-section">
                <div className="panel-title-row"><h2>Recent Fellowship Activity</h2></div>
                <div className="fellowship-activity-list">
                  {(data.recent_activity || []).slice(0, 8).map((item, index) => (
                    <div className="fellowship-activity" key={`${item.created_at}-${index}`}>
                      <span className="activity-icon">✦</span>
                      <span><strong>{item.label}</strong><small>{timeAgo(item.created_at)}</small></span>
                    </div>
                  ))}
                  {!data.recent_activity?.length ? <div className="muted">The Fellowship ledger is still waiting for its first entry.</div> : null}
                </div>
              </section>
            </div>

            <details className="panel fellowship-details fellowship-deeds" open={disclosures.deeds} onToggle={(event) => setDisclosure("deeds", event.currentTarget.open)}>
              <summary><span><strong>Fellowship Deeds</strong><small>Permanent community milestones — expand to see the full ledger.</small></span><span>{number(data.deeds_complete)} / {number(data.deeds?.length)}</span><DetailsPointer /></summary>
              <div className="fellowship-deed-grid">
                {(data.deeds || []).map((deed) => (
                  <article className={deed.complete ? "complete" : ""} key={deed.id}>
                    <strong>{deed.name}</strong><span>{deed.description}</span>
                    <small>{number(deed.progress)} / {number(deed.target)}{deed.complete ? " · Complete" : ""}</small>
                  </article>
                ))}
              </div>
            </details>
            <PageRefreshButton onRefresh={refresh} />
          </section>
        ) : null}
      </main>
      <footer className="site-footer"><span>Crystal Guild Fellowship</span><span><Link to="/players">Guild Heroes</Link> · <Link to="/guide">Player Guide</Link> · <Link to="/privacy">Privacy Policy</Link></span></footer>
    </>
  );
}
