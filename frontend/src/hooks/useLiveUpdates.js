import { useEffect, useRef, useState } from "react";
import { getJson } from "../api/client.js";
import { reconnectDelay, streamIsFresh } from "../utils/livePolicy.js";

const HEALTH_POLL_MS = 20000;
const HEARTBEAT_STALE_MS = 35000;
const WATCHDOG_MS = 5000;
const REFRESH_DEBOUNCE_MS = 180;

export function useLiveUpdates(onRefresh) {
  const callbackRef = useRef(onRefresh);
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    callbackRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    let stopped = false;
    let source = null;
    let reconnectTimer = null;
    let refreshTimer = null;
    let healthTimer = null;
    let watchdogTimer = null;
    let attempts = 0;
    let lastEventAt = 0;
    let lastRevision = null;
    let portalSyncKnown = false;
    let portalSyncConnected = false;

    const queueRefresh = () => {
      if (refreshTimer || stopped) return;
      refreshTimer = setTimeout(() => {
        refreshTimer = null;
        callbackRef.current?.();
      }, REFRESH_DEBOUNCE_MS);
    };

    const noteRevision = (payload, force = false) => {
      const revision = Number(payload?.revision);
      if (!Number.isFinite(revision)) {
        if (force) queueRefresh();
        return;
      }
      const changed = lastRevision !== null && revision !== lastRevision;
      lastRevision = revision;
      if (changed || force) queueRefresh();
    };

    const notePortalSync = (payload) => {
      if (typeof payload?.sync_connected !== "boolean") return false;
      portalSyncKnown = true;
      portalSyncConnected = payload.sync_connected;
      setStatus(portalSyncConnected ? "connected" : "offline");
      return true;
    };

    const closeSource = () => {
      if (!source) return;
      source.close();
      source = null;
    };

    const scheduleReconnect = () => {
      if (stopped || reconnectTimer || !navigator.onLine) return;
      const delay = reconnectDelay(attempts);
      attempts += 1;
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connect();
      }, delay);
    };

    const parseEvent = (event) => {
      lastEventAt = Date.now();
      try {
        return JSON.parse(event.data || "{}");
      } catch {
        return {};
      }
    };

    const connect = () => {
      if (stopped || !navigator.onLine) return;
      closeSource();
      setStatus(attempts ? "error" : "connecting");
      const nextSource = new EventSource("/api/events");
      source = nextSource;

      nextSource.addEventListener("open", () => {
        if (stopped || source !== nextSource) return;
        attempts = 0;
        lastEventAt = Date.now();
        setStatus(portalSyncKnown ? (portalSyncConnected ? "connected" : "offline") : "connecting");
      });

      nextSource.addEventListener("ready", (event) => {
        if (stopped || source !== nextSource) return;
        // Initial page loads already fetch their data. Seed the revision without
        // forcing an immediate duplicate request; reconnects still refresh when
        // the server revision changed while the stream was away.
        const payload = parseEvent(event);
        noteRevision(payload);
        notePortalSync(payload);
      });

      nextSource.addEventListener("refresh", (event) => {
        if (stopped || source !== nextSource) return;
        const payload = parseEvent(event);
        noteRevision(payload);
        notePortalSync(payload);
      });

      nextSource.addEventListener("heartbeat", (event) => {
        if (stopped || source !== nextSource) return;
        const payload = parseEvent(event);
        noteRevision(payload);
        notePortalSync(payload);
      });

      nextSource.addEventListener("error", () => {
        if (stopped || source !== nextSource) return;
        closeSource();
        setStatus(navigator.onLine ? "error" : "offline");
        if (navigator.onLine) void pollHealth(true);
        scheduleReconnect();
      });
    };

    const pollHealth = async (force = false) => {
      if (stopped || !navigator.onLine) return;
      const streamFresh = streamIsFresh(
        source?.readyState, EventSource.OPEN, lastEventAt, Date.now(), HEARTBEAT_STALE_MS,
      );
      // SSE already carries revision + heartbeat data. Avoid an extra health
      // request on its fallback interval while that stream is healthy; polling is the fallback.
      if (!force && streamFresh) return;
      try {
        const health = await getJson("/api/health", { timeoutMs: 8000 });
        noteRevision(health);
        notePortalSync(health);
        if (!source || source.readyState === EventSource.CLOSED) {
          setStatus(health?.sync_connected === false ? "offline" : "polling");
          scheduleReconnect();
        }
      } catch {
        if (!stopped) setStatus(navigator.onLine ? "error" : "offline");
      }
    };

    const watchdog = () => {
      if (stopped || !source || source.readyState !== EventSource.OPEN) return;
      if (lastEventAt && Date.now() - lastEventAt <= HEARTBEAT_STALE_MS) return;
      closeSource();
      setStatus("error");
      scheduleReconnect();
    };

    const handleOnline = () => {
      if (stopped) return;
      attempts = 0;
      setStatus("connecting");
      void pollHealth(true);
      connect();
    };

    const handleOffline = () => {
      closeSource();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = null;
      setStatus("offline");
    };

    const handleVisibility = () => {
      if (document.visibilityState !== "visible" || stopped) return;
      const fresh = streamIsFresh(
        source?.readyState, EventSource.OPEN, lastEventAt, Date.now(), HEARTBEAT_STALE_MS,
      );
      if (fresh) {
        setStatus(portalSyncKnown ? (portalSyncConnected ? "connected" : "offline") : "connecting");
        return;
      }
      void pollHealth(true);
      if (!source || source.readyState !== EventSource.OPEN) connect();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisibility);
    healthTimer = setInterval(() => { void pollHealth(false); }, HEALTH_POLL_MS);
    watchdogTimer = setInterval(watchdog, WATCHDOG_MS);
    void pollHealth(true);
    connect();

    return () => {
      stopped = true;
      closeSource();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (refreshTimer) clearTimeout(refreshTimer);
      if (healthTimer) clearInterval(healthTimer);
      if (watchdogTimer) clearInterval(watchdogTimer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return status;
}
