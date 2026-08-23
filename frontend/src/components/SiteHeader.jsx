import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import LiveStatus from "./LiveStatus.jsx";
import { loginUrl } from "../api/auth.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { WEB_BUILD, WEB_VERSION } from "../version.js";

export default function SiteHeader({ liveStatus }) {
  const location = useLocation();
  const { auth, logout } = usePortalAuth();
  const [mobileHeaderHidden, setMobileHeaderHidden] = useState(false);
  const headerRef = useRef(null);
  const lastScrollY = useRef(0);
  const heroesActive = location.pathname === "/players" || location.pathname.startsWith("/player/");
  const fellowshipActive = location.pathname.startsWith("/fellowship");
  const guideActive = location.pathname.startsWith("/guide");

  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)");
    lastScrollY.current = Math.max(0, window.scrollY || 0);

    const updateForViewport = () => {
      if (!media.matches) setMobileHeaderHidden(false);
      lastScrollY.current = Math.max(0, window.scrollY || 0);
    };

    const onScroll = () => {
      const nextY = Math.max(0, window.scrollY || 0);
      const delta = nextY - lastScrollY.current;
      if (!media.matches || nextY <= 72) {
        setMobileHeaderHidden(false);
      } else if (delta > 8) {
        setMobileHeaderHidden(true);
      } else if (delta < 0) {
        setMobileHeaderHidden(false);
      }
      lastScrollY.current = nextY;
    };

    const onFocusIn = (event) => {
      if (headerRef.current?.contains(event.target)) setMobileHeaderHidden(false);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    if (typeof media.addEventListener === "function") media.addEventListener("change", updateForViewport);
    else if (typeof media.addListener === "function") media.addListener(updateForViewport);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("focusin", onFocusIn);
      if (typeof media.removeEventListener === "function") media.removeEventListener("change", updateForViewport);
      else if (typeof media.removeListener === "function") media.removeListener(updateForViewport);
    };
  }, []);
  return (
    <>
      <a className="skip-link portal-skip-link" href="#main-content">Skip to main content</a>
      <header ref={headerRef} className={`site-header ${mobileHeaderHidden ? "mobile-header-collapsed" : ""}`}>
      <a className="brand" href="/players" aria-label="Crystal Guild hero directory">
        <span className="brand-mark" aria-hidden="true">
          <img className="brand-mark-image" src="/crystal-guild-portal-roundel.png" alt="" width="256" height="256" decoding="async" />
        </span>
        <span>
          <small>Crystal Guild</small>
          <strong>Adventurer Portal</strong>
        </span>
      </a>
      <div className="site-header-actions">
        <nav className="site-nav" aria-label="Crystal Guild website">
          <a className={`site-nav-link ${heroesActive ? "active" : ""}`} href="/players" aria-current={heroesActive ? "page" : undefined}>
            Heroes
          </a>
          <a className={`site-nav-link ${fellowshipActive ? "active" : ""}`} href="/fellowship" aria-current={fellowshipActive ? "page" : undefined}>
            Fellowship
          </a>
          <a className={`site-nav-link ${guideActive ? "active" : ""}`} href="/guide" aria-current={guideActive ? "page" : undefined}>
            Player Guide
          </a>
        </nav>
        {auth.configured ? (
          auth.authenticated ? (
            <div className="portal-auth-control signed-in" title={auth.player ? `Linked to ${auth.player.display_name}` : "Twitch account signed in; no Crystal Guild adventurer is linked yet."}>
              <span className="portal-auth-name">{auth.twitch?.display_name || auth.twitch?.login || "Twitch"}</span>
              <button type="button" className="portal-auth-button subtle" onClick={() => logout().catch(() => {})}>Sign out</button>
            </div>
          ) : (
            <a className="portal-auth-button" href={loginUrl(`${location.pathname}${location.search}`)}>Sign in with Twitch</a>
          )
        ) : null}
        <div className="build-badge" title={`Crystal Guild Web ${WEB_VERSION} — ${WEB_BUILD}`}>
          <span>{WEB_VERSION}</span>
          <strong>{WEB_BUILD}</strong>
        </div>
        {liveStatus ? <LiveStatus status={liveStatus} /> : null}
      </div>
      </header>
    </>
  );
}
