import { useCallback, useEffect, useState } from "react";
import { fetchAuthStatus, logoutPortal, resetPortalApiCache } from "../api/auth.js";

const AUTH_EVENT = "crystal-guild-auth-changed";
const AUTH_POLL_MS = 120000;
const AUTH_FOCUS_STALE_MS = 15000;

const INITIAL_AUTH = {
  loading: true,
  configured: false,
  authenticated: false,
  actions_enabled: false,
};

let sharedAuth = INITIAL_AUTH;
let sharedError = "";
let sharedController = null;
let pollTimer = null;
let lastAuthRefreshAt = 0;
const subscribers = new Set();

function publish() {
  subscribers.forEach((listener) => listener(sharedAuth, sharedError));
}

function refreshSharedAuth(force = false) {
  const now = Date.now();
  if (!force && lastAuthRefreshAt && now - lastAuthRefreshAt < AUTH_FOCUS_STALE_MS) return sharedController;
  lastAuthRefreshAt = now;
  sharedController?.abort();
  const controller = new AbortController();
  sharedController = controller;
  fetchAuthStatus(controller.signal)
    .then((payload) => {
      if (controller.signal.aborted) return;
      sharedAuth = { ...payload, loading: false };
      sharedError = "";
      publish();
    })
    .catch((reason) => {
      if (reason.name === "AbortError" || controller.signal.aborted) return;
      // Fail closed when the hosted connection/status check itself fails.
      // Preserve identity/session context for the UI, but never leave Portal
      // actions (especially first-time recruitment) enabled from stale state.
      sharedAuth = {
        ...sharedAuth,
        loading: false,
        actions_enabled: false,
        can_recruit: false,
        sync_connected: false,
      };
      sharedError = reason.message;
      publish();
    });
  return controller;
}

function refreshWhenVisible() {
  if (document.visibilityState === "visible") refreshSharedAuth(false);
}

function refreshOnReturn() {
  refreshSharedAuth(false);
}

function startSharedRefresh() {
  if (pollTimer) return;
  refreshSharedAuth(true);
  pollTimer = window.setInterval(() => {
    if (document.visibilityState === "visible") refreshSharedAuth(false);
  }, AUTH_POLL_MS);
  window.addEventListener("focus", refreshOnReturn);
  window.addEventListener("pageshow", refreshOnReturn);
  document.addEventListener("visibilitychange", refreshWhenVisible);
}

function stopSharedRefresh() {
  if (subscribers.size || !pollTimer) return;
  window.clearInterval(pollTimer);
  pollTimer = null;
  sharedController?.abort();
  sharedController = null;
  window.removeEventListener("focus", refreshOnReturn);
  window.removeEventListener("pageshow", refreshOnReturn);
  document.removeEventListener("visibilitychange", refreshWhenVisible);
}

export function notifyAuthChanged() {
  resetPortalApiCache();
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function usePortalAuth() {
  const [state, setState] = useState(() => ({ auth: sharedAuth, error: sharedError }));

  useEffect(() => {
    const listener = (auth, error) => setState({ auth, error });
    const handleAuthEvent = () => refreshSharedAuth(true);
    subscribers.add(listener);
    listener(sharedAuth, sharedError);
    if (subscribers.size === 1) startSharedRefresh();
    window.addEventListener(AUTH_EVENT, handleAuthEvent);
    return () => {
      subscribers.delete(listener);
      window.removeEventListener(AUTH_EVENT, handleAuthEvent);
      stopSharedRefresh();
    };
  }, []);

  const logout = useCallback(async () => {
    if (!sharedAuth.authenticated) return;
    await logoutPortal(sharedAuth.csrf_token);
    sharedAuth = {
      loading: false,
      configured: sharedAuth.configured,
      authenticated: false,
      actions_enabled: false,
    };
    sharedError = "";
    publish();
    notifyAuthChanged();
  }, []);

  return {
    auth: state.auth,
    authError: state.error,
    refreshAuth: () => refreshSharedAuth(true),
    logout,
  };
}
