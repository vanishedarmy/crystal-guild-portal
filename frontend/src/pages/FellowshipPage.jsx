import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchFellowship } from "../api/fellowship.js";
import ProgressBar from "../components/ProgressBar.jsx";
import SiteHeader from "../components/SiteHeader.jsx";
import { useLiveUpdates } from "../hooks/useLiveUpdates.js";
import { number, pct, timeAgo } from "../utils/formatters.js";

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
        <span className="small-badge">{project.teaser ? "Guild Project" : `Lv. ${number(project.level || project.tier)}`}</span>
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
      <p className="fellowship-command-hint">Donate with <strong>!contribute gil &lt;amount&gt;</strong> or <strong>!contribute &lt;amount&gt; &lt;item&gt;</strong>. Gameplay requirements advance automatically.</p>
    </section>
  );
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
        <span className="small-badge">{facility.locked ? "LOCKED" : `Lv. ${level} / ${maxLevel}`}</span>
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
        : "LOCKED";

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
                <p className="lede">One Guild, built by the entire community. Complete Guild projects, raise shared facilities, and work toward the future Airship Dock while every hero builds their own Guild standing.</p>
              </div>
              <aside className="fellowship-level-card" aria-label="Fellowship level">
                <span>Fellowship</span>
                <strong>{data.level_label}</strong>
                <div className="fellowship-level-progress"><ProgressBar value={levelProgress} /></div>
                <small>{data.level_progress?.maxed ? `${number(data.renown)} Renown · Current cap` : `${number(data.renown)} / ${number(data.level_progress?.next || 0)} Renown`}</small>
              </aside>
            </div>

            <div className="fellowship-summary-grid">
              <div className="fellowship-summary"><span>Members</span><strong>{number(data.member_count)}</strong><small>registered Fellowship heroes</small></div>
              <div className="fellowship-summary"><span>Guild Facilities</span><strong>{number(data.guild_board?.built_count)} / {number(data.guild_board?.facility_count || 5)}</strong><small>major facilities established</small></div>
              <div className="fellowship-summary"><span>Weekly Orders</span><strong>{number(data.orders?.completed)} / {number(data.orders?.total)}</strong><small>community objectives</small></div>
              <div className="fellowship-summary"><span>Contributed</span><strong>{number(data.totals?.gil_donated)}g</strong><small>{number(data.totals?.materials_donated)} materials</small></div>
            </div>

            <ProjectCard project={data.active_project} />

            <section className="panel fellowship-section fellowship-guild-board">
              <div className="panel-title-row">
                <div><span className="panel-kicker">Guild Hall Foundation</span><h2>Guild Facilities</h2></div>
                <span className="small-badge">Lv. 0–3</span>
              </div>
              <p className="muted fellowship-board-copy">Major facilities grow through shared construction projects. Gil and requested materials can be donated voluntarily; gameplay milestones advance automatically.</p>
              <div className="fellowship-facility-grid">
                {(data.facilities || []).map((facility) => <FacilityCard key={facility.id} facility={facility} />)}
              </div>
            </section>

            <details className="panel fellowship-details fellowship-expedition-board">
              <summary><span><strong>Expeditions — Guild Board</strong><small>Existing Guild-wide Expedition access</small></span><span className="small-badge">{expeditionStatus}</span></summary>
              <div className="fellowship-expedition-body">
              <p className="muted fellowship-expedition-copy">Distant contracts are now active. Complete the shared Guild Board, then each adventurer can launch Expeditions with a registered Chocobo from the Adventure Board.</p>
              <div className="fellowship-expedition-grid">
                <article>
                  <span>Guild Requirement</span>
                  <strong>Expedition Board</strong>
                  <small>{data.expedition_board_complete ? "Complete — the Guild Board is prepared." : expeditionProject ? `${number((expeditionProject.requirements || []).filter((requirement) => !requirement.complete).length)} Board goals remain.` : "Unlock at Guild Hall Tier 1 and Fellowship LVL 6."}</small>
                </article>
                <article>
                  <span>Adventurer Requirement</span>
                  <strong>Registered Chocobo</strong>
                  <small>Each adventurer will need their own registered Chocobo before embarking.</small>
                </article>
                <article>
                  <span>Launch Status</span>
                  <strong>Open</strong>
                  <small>Five regions and Scout, Journey, and Deep routes are available from the Adventure Board once unlocked.</small>
                </article>
              </div>
              <div className="fellowship-expedition-note"><strong>Guild Board Note:</strong> Complete the Expedition Board to open distant contracts Guild-wide. Individual adventurers still need their own registered Chocobo.</div>
              </div>
            </details>

            {(data.available_projects || []).length ? (
              <details className="panel fellowship-details fellowship-available-projects">
                <summary><span><strong>Available Projects</strong><small>Construction projects the Guild can begin next.</small></span><span>{number(data.available_projects.length)} Unlocked</span></summary>
                <div className="fellowship-project-options">
                  {data.available_projects.map((project) => (
                    <article key={project.id}>
                      <strong>{project.name}</strong>
                      <span>{project.description}</span>
                      <small>{project.teaser ? "Expedition launch project" : `Lv. ${number(project.level || project.tier)} · ${project.requirements?.length || 0} goals`}</small>
                    </article>
                  ))}
                </div>
              </details>
            ) : null}

            <section className="panel fellowship-section">
              <div className="panel-title-row"><div><span className="panel-kicker">This Week</span><h2>Fellowship Orders</h2></div><span className="small-badge">{number(data.orders?.completed)} / {number(data.orders?.total)} Complete</span></div>
              <div className="fellowship-order-grid">
                {(data.orders?.orders || []).map((order) => (
                  <article className={`fellowship-order ${order.complete ? "complete" : ""}`} key={order.id}>
                    <span>{order.complete ? "Complete" : "In Progress"}</span>
                    <h3>{order.name}</h3>
                    <p>{order.description}</p>
                    <div className="vital-label"><span>Progress</span><span>{number(order.progress)} / {number(order.target)}</span></div>
                    <ProgressBar value={pct(order.progress, order.target)} />
                  </article>
                ))}
              </div>
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
                  <summary>View the Guild Rank ladder</summary>
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

            <details className="panel fellowship-details fellowship-deeds">
              <summary><span><strong>Fellowship Deeds</strong><small>Permanent community milestones — expand to see the full ledger.</small></span><span>{number(data.deeds_complete)} / {number(data.deeds?.length)}</span></summary>
              <div className="fellowship-deed-grid">
                {(data.deeds || []).map((deed) => (
                  <article className={deed.complete ? "complete" : ""} key={deed.id}>
                    <strong>{deed.name}</strong><span>{deed.description}</span>
                    <small>{number(deed.progress)} / {number(deed.target)}{deed.complete ? " · Complete" : ""}</small>
                  </article>
                ))}
              </div>
            </details>
          </section>
        ) : null}
      </main>
      <footer className="site-footer"><span>Crystal Guild Fellowship</span><span><Link to="/players">Guild Heroes</Link> · <Link to="/guide">Player Guide</Link> · <Link to="/privacy">Privacy Policy</Link></span></footer>
    </>
  );
}
