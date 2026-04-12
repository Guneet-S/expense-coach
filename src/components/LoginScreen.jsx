import React, { useState } from "react";
import { createSpace, joinSpace, saveSession } from "../firebase/spaces";

// ── Sub-views ──────────────────────────────────────────────────────────────

function SpaceCreated({ otp, onEnter }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(otp).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Space created!</h2>
      <p className="text-sm text-slate-500 mb-6">Share this invite code with your partner.</p>

      {/* OTP display */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl px-8 py-6 mb-4 inline-block w-full">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Invite Code</p>
        <p className="text-5xl font-bold tracking-[0.25em] text-slate-900 tabular-nums">{otp}</p>
      </div>

      <button
        onClick={handleCopy}
        className="w-full mb-3 flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 text-sm font-medium py-2.5 rounded-xl transition-colors duration-150 cursor-pointer"
      >
        {copied ? (
          <>
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
            </svg>
            Copy code
          </>
        )}
      </button>

      <button
        onClick={onEnter}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-3 rounded-xl transition-colors duration-150 cursor-pointer"
        style={{ minHeight: 44 }}
      >
        Open Expense Coach
      </button>
    </div>
  );
}

// ── Main LoginScreen ────────────────────────────────────────────────────────

export default function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  const [view, setView] = useState("home"); // home | creating | created | joining
  const [otp, setOtp] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const nameTrimmed = name.trim();
  const canProceed = nameTrimmed.length >= 2;

  // ── Create Space ─────────────────────────────────────────────────────────
  async function handleCreate() {
    if (!canProceed) return;
    setLoading(true);
    setError(null);
    try {
      const code = await createSpace(nameTrimmed);
      setOtp(code);
      saveSession(code, nameTrimmed);
      setView("created");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Join Space ───────────────────────────────────────────────────────────
  async function handleJoin(e) {
    e.preventDefault();
    if (!canProceed) return;
    setLoading(true);
    setError(null);
    try {
      const code = await joinSpace(joinCode, nameTrimmed);
      saveSession(code, nameTrimmed);
      onLogin({ spaceId: code, userName: nameTrimmed });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-8 py-10">

          {/* Logo + title */}
          {view !== "created" && (
            <div className="text-center mb-8">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Expense Coach</h1>
              <p className="text-sm text-slate-400 mt-1">
                {view === "home" && "Track expenses together."}
                {view === "joining" && "Enter your invite code."}
              </p>
            </div>
          )}

          {/* ── Created view ── */}
          {view === "created" && (
            <SpaceCreated otp={otp} onEnter={() => onLogin({ spaceId: otp, userName: nameTrimmed })} />
          )}

          {/* ── Home + Joining views ── */}
          {view !== "created" && (
            <>
              {/* Name field */}
              <div className="mb-4">
                <label htmlFor="login-name" className="field-label">Your name</label>
                <input
                  id="login-name"
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(null); }}
                  placeholder="e.g. Guneet"
                  className="input-field"
                  autoComplete="off"
                  disabled={loading}
                  style={{ minHeight: 44 }}
                />
              </div>

              {/* Joining: OTP input */}
              {view === "joining" && (
                <form onSubmit={handleJoin} className="mb-4">
                  <label htmlFor="join-code" className="field-label">Invite code</label>
                  <div className="flex gap-2">
                    <input
                      id="join-code"
                      type="text"
                      inputMode="numeric"
                      pattern="\d{3}"
                      maxLength={3}
                      value={joinCode}
                      onChange={(e) => { setJoinCode(e.target.value.replace(/\D/g, "")); setError(null); }}
                      placeholder="123"
                      className="input-field text-center text-xl font-bold tracking-widest"
                      disabled={loading}
                      autoFocus
                      style={{ minHeight: 44 }}
                    />
                    <button
                      type="submit"
                      disabled={loading || !canProceed || joinCode.length !== 3}
                      className="btn-primary shrink-0 px-5"
                      style={{ minHeight: 44 }}
                    >
                      {loading ? "…" : "Join"}
                    </button>
                  </div>
                </form>
              )}

              {/* Error */}
              {error && (
                <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Actions */}
              {view === "home" && (
                <div className="space-y-3">
                  <button
                    onClick={handleCreate}
                    disabled={loading || !canProceed}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-semibold text-sm py-3 rounded-xl transition-colors duration-150 cursor-pointer"
                    style={{ minHeight: 44 }}
                  >
                    {loading ? "Creating…" : "Create Space"}
                  </button>
                  <button
                    onClick={() => { setView("joining"); setError(null); }}
                    disabled={loading || !canProceed}
                    className="w-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-semibold text-sm py-3 rounded-xl transition-colors duration-150 cursor-pointer"
                    style={{ minHeight: 44 }}
                  >
                    Join Space
                  </button>
                </div>
              )}

              {view === "joining" && (
                <button
                  onClick={() => { setView("home"); setJoinCode(""); setError(null); }}
                  className="w-full text-sm text-slate-400 hover:text-slate-600 cursor-pointer transition-colors duration-150 py-2"
                >
                  Back
                </button>
              )}
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">Private. Stored in your Firebase project.</p>
      </div>
    </div>
  );
}
