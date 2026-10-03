import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import LiveStatus from "./LiveStatus.jsx";
import { loginUrl } from "../api/auth.js";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { WEB_BUILD, WEB_RELEASE, WEB_VERSION } from "../version.js";

export default function SiteHeader({
  liveStatus,
  sectionTitle = "Adventurer Portal",
  brandHref = "/players",
  includeStreamer = false,
  skipHref = "#main-content",
  skipLabel = "Skip to main content",
}) {
  const location = useLocation();
  const { auth, logout } = usePortalAuth();
  const [mobileHeaderHidden, setMobileHeaderHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const mobileMenuToggleRef = useRef(null);
  const lastScrollY = useRef(0);
  const heroesActive = location.pathname === "/players" || location.pathname.startsWith("/player/");
  const fellowshipActive = location.pathname.startsWith("/fellowship");
  const guideActive = location.pathname.startsWith("/guide");
  const streamerActive = location.pathname.startsWith("/streamer");

  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px), (max-width: 1180px) and (max-height: 620px) and (orientation: landscape) and (pointer: coarse)");
    lastScrollY.current = Math.max(0, window.scrollY || 0);

    const updateForViewport = () => {
      if (!media.matches) {
        setMobileHeaderHidden(false);
        setMobileMenuOpen(false);
      }
      lastScrollY.current = Math.max(0, window.scrollY || 0);
    };

    const onScroll = () => {
      const nextY = Math.max(0, window.scrollY || 0);
      const delta = nextY - lastScrollY.current;
      if (!media.matches || nextY <= 72 || mobileMenuOpen) {
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

    const onPointerDown = (event) => {
      if (mobileMenuOpen && headerRef.current && !headerRef.current.contains(event.target)) setMobileMenuOpen(false);
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
        mobileMenuToggleRef.current?.focus?.({ preventScroll: true });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    if (typeof media.addEventListener === "function") media.addEventListener("change", updateForViewport);
    else if (typeof media.addListener === "function") media.addListener(updateForViewport);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      if (typeof media.removeEventListener === "function") media.removeEventListener("change", updateForViewport);
      else if (typeof media.removeListener === "function") media.removeListener(updateForViewport);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const navLinks = [
    { href: "/players", label: "Heroes", active: heroesActive },
    { href: "/fellowship", label: "Fellowship", active: fellowshipActive },
    { href: "/guide", label: "Player Guide", active: guideActive },
  ];
  if (includeStreamer) navLinks.push({ href: "/streamer", label: "Streamer Dashboard", active: streamerActive });

  const authControl = auth.configured ? (
    auth.authenticated ? (
      <div className="portal-auth-control signed-in" title={auth.player ? `Linked to ${auth.player.display_name}` : "Twitch account signed in; no Crystal Guild adventurer is linked yet."}>
        <span className="portal-auth-name">{auth.twitch?.display_name || auth.twitch?.login || "Twitch"}</span>
        <button type="button" className="portal-auth-button subtle" onClick={() => logout().catch(() => {})}>Sign out</button>
      </div>
    ) : (
      <a className="portal-auth-button" href={loginUrl(`${location.pathname}${location.search}`)}>Sign in with Twitch</a>
    )
  ) : null;

  return (
    <>
      <a className="skip-link portal-skip-link" href={skipHref}>{skipLabel}</a>
      <header ref={headerRef} className={`site-header ${mobileHeaderHidden ? "mobile-header-collapsed" : ""} ${mobileMenuOpen ? "mobile-menu-open" : ""}`}>
        <a className="brand" href={brandHref} aria-label={`Crystal Guild ${sectionTitle}`}>
          <span className="brand-mark" aria-hidden="true">
            <img className="brand-mark-image" src="/crystal-guild-portal-roundel.webp" alt="" width="256" height="256" loading="eager" fetchPriority="high" decoding="async" />
          </span>
          <span className="brand-copy">
            <small>Crystal Guild</small>
            <strong>{sectionTitle}</strong>
          </span>
        </a>

        <div className="site-header-actions">
          <nav className="site-nav" aria-label="Crystal Guild website">
            {navLinks.map((link) => (
              <a key={link.href} className={`site-nav-link ${link.active ? "active" : ""}`} href={link.href} aria-current={link.active ? "page" : undefined}>
                {link.label}
              </a>
            ))}
          </nav>
          {authControl}
          <div className="build-badge" title={`Crystal Guild Web ${WEB_VERSION} — ${WEB_BUILD}`}>
            <span>{WEB_VERSION}</span>
            <strong>{WEB_BUILD}</strong>
          </div>
          {liveStatus ? <LiveStatus status={liveStatus} /> : null}
        </div>

        <div className="mobile-site-header-actions">
          {liveStatus ? <LiveStatus status={liveStatus} /> : null}
          <button
            type="button"
            ref={mobileMenuToggleRef}
            className="mobile-site-menu-toggle"
            aria-label={mobileMenuOpen ? "Close page menu" : "Open page menu"}
            aria-controls="mobile-site-menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => {
              setMobileHeaderHidden(false);
              setMobileMenuOpen((open) => !open);
            }}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>

        <div className={`mobile-site-menu ${mobileMenuOpen ? "open" : ""}`} id="mobile-site-menu" aria-hidden={!mobileMenuOpen}>
          <nav aria-label="Crystal Guild page selection">
            {navLinks.map((link) => (
              <a key={link.href} className={link.active ? "active" : ""} href={link.href} aria-current={link.active ? "page" : undefined}>
                <span>{link.label}</span>
                <span aria-hidden="true">›</span>
              </a>
            ))}
          </nav>
          <div className="mobile-site-menu-meta">
            <span className="mobile-site-build">{WEB_RELEASE}</span>
            {authControl}
          </div>
        </div>
      </header>
    </>
  );
}
