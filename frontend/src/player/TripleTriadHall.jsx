import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePortalAuth } from "../hooks/usePortalAuth.js";
import { submitTriadState, waitForPortalAction } from "../api/auth.js";
import TripleTriad from "./TripleTriad.jsx";

async function finish(response) {
  const action = response?.action;
  if (!action?.id) throw new Error("The Card Hall did not return an action ID.");
  if (["completed", "failed"].includes(action.status)) return action;
  return waitForPortalAction(action.id, { attempts: 32, delayMs: 600 });
}
export default function TripleTriadHall({ overview }) {
  const { auth } = usePortalAuth();
  const own = Boolean(auth.authenticated && auth.player?.username && auth.player.username.toLowerCase() === String(overview?.identity?.username || "").toLowerCase());
  const caps = useMemo(() => new Set(auth.action_capabilities || []), [auth.action_capabilities]);
  const available = own && auth.actions_enabled && ["TRIAD_STATE", "TRIAD_START", "TRIAD_PLAY", "TRIAD_SET_DECK"].every(a => caps.has(a));
  const [state, setState] = useState(null), [busy, setBusy] = useState(""), [message, setMessage] = useState("");
  const serial = useRef(0), pending = useRef(false);
  const actionKey = useCallback((kind) => `card-hall:${kind}:${globalThis.crypto.randomUUID()}`, []);
  const load = useCallback(async () => {
    if (!available || pending.current) return;
    pending.current = true;
    const current = ++serial.current;
    try {
      const done = await finish(await submitTriadState(auth.csrf_token || "", actionKey("state")));
      if (serial.current === current) {
        if (done?.result?.data?.triple_triad_state) setState(done.result.data.triple_triad_state);
        if (done?.status === "failed" || done?.result?.ok === false) setMessage(done.result?.message || "Could not load Triple Triad.");
      }
    } catch (error) { if (serial.current === current) setMessage(String(error?.message || error)); }
    finally { pending.current = false; }
  }, [available, auth.csrf_token, actionKey]);
  useEffect(() => { if (available) void load(); }, [available, load]);
  const mutate = async (key, submit, label) => {
    if (!available || pending.current) return;
    pending.current = true; setBusy(key); setMessage(label);
    try {
      const done = await finish(await submit());
      if (!done) throw new Error("The Card Hall action is still processing. Refresh the table before retrying.");
      setMessage(done.result?.message || label);
      if (done.result?.data?.triple_triad_state) setState(done.result.data.triple_triad_state);
    } catch (error) { setMessage(String(error?.message || error)); }
    finally { pending.current = false; setBusy(""); }
  };
  return <section className="card-hall-triad" aria-label="Triple Triad">
    {!own ? <p className="panel">Log in and open your own player profile to play Triple Triad.</p> : !available ? <p className="panel">Card Hall actions are unavailable. Update both the Bot and Web to enable standalone Triple Triad.</p> : <>
      {message && <div className="card-hall-triad-message" role="status">{message}</div>}
      {!state ? <div className="panel card-hall-triad-loading">Loading your Triple Triad collection… <button type="button" onClick={load}>Refresh</button></div>
        : <><div className="card-hall-triad-tools"><span>Play as often as you like. Matches cost no MGP, and never award MGP.</span><button type="button" disabled={Boolean(busy)} onClick={load}>Refresh table</button></div>
          <TripleTriad triad={state} busy={busy} mutate={mutate} actionsAvailable={available} csrfToken={auth.csrf_token || ""} actionKey={actionKey} standalone />
        </>}
    </>}
  </section>;
}
