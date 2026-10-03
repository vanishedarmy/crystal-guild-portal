import { useEffect, useState } from "react";
import { initGuide } from "./guideRuntime.js";
import { WEB_ASSET_REVISION, WEB_RELEASE } from "../version.js";
import SiteHeader from "../components/SiteHeader.jsx";
import { useLiveUpdates } from "../hooks/useLiveUpdates.js";

export default function GuidePage() {
  const liveStatus = useLiveUpdates();
  const [guide, setGuide] = useState({ markup: "", data: null, error: "" });

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch(`/guide-body.html?v=${WEB_ASSET_REVISION}`, { signal: controller.signal, cache: "no-cache" }).then((response) => {
        if (!response.ok) throw new Error(`Guide markup failed: ${response.status}`);
        return response.text();
      }),
      fetch(`/guide-data.json?v=${WEB_ASSET_REVISION}`, { signal: controller.signal, cache: "no-cache" }).then((response) => {
        if (!response.ok) throw new Error(`Guide data failed: ${response.status}`);
        return response.json();
      }),
    ])
      .then(([markup, data]) => setGuide({ markup, data, error: "" }))
      .catch((error) => {
        if (error.name !== "AbortError") setGuide({ markup: "", data: null, error: error.message });
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!guide.markup || !guide.data) return undefined;
    document.title = "Crystal Guild — Player Guide";
    document.documentElement.style.colorScheme = "dark";
    const styleLinks = [
      `/guide.css?v=${WEB_ASSET_REVISION}`,
      `/guide-ux-1947.css?v=${WEB_ASSET_REVISION}`,
    ].map((href) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.crystalGuide = "true";
      document.head.appendChild(link);
      return link;
    });

    let frame = 0;
    let hashFrame = 0;
    const scrollToHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      if (hashFrame) cancelAnimationFrame(hashFrame);
      hashFrame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
    };
    frame = requestAnimationFrame(() => {
      initGuide(guide.data, WEB_RELEASE);
      scrollToHash();
    });
    window.addEventListener("hashchange", scrollToHash);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (hashFrame) cancelAnimationFrame(hashFrame);
      window.removeEventListener("hashchange", scrollToHash);
      styleLinks.forEach((link) => link.remove());
      document.body.classList.remove("nav-open", "info-open");
    };
  }, [guide.markup, guide.data]);

  if (guide.error) return <div className="state-message">Unable to open the Player Guide: {guide.error}</div>;
  if (!guide.markup) return <div className="state-message">Opening the Player Guide...</div>;
  return (
    <>
      <SiteHeader liveStatus={liveStatus} sectionTitle="Player Guide" brandHref="/guide" skipHref="#mainContent" skipLabel="Skip to guide content" />
      <div className="guide-react-host" dangerouslySetInnerHTML={{ __html: guide.markup }} />
    </>
  );
}
