import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import InputForm from "./components/InputForm";
import PersonSplitTable from "./components/PersonSplitTable";
import CategoryBudgetOverview from "./components/CategoryBudgetOverview";
import TransactionLog from "./components/TransactionLog";
import CoachRealityCheck from "./components/CoachRealityCheck";
import LoginScreen from "./components/LoginScreen";
import { getSession, clearSession } from "./firebase/spaces";

// ── Reset Modal ────────────────────────────────────────────────────────────

function ResetModal({ onConfirm, onCancel, resetting, error }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-modal-title"
      >
        <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 id="reset-modal-title" className="text-base font-semibold text-slate-900 text-center mb-1">Reset everything?</h2>
        <p className="text-sm text-slate-500 text-center mb-6">
          This permanently wipes all transactions, categories, and users. There is no undo.
        </p>
        {error && (
          <p className="text-xs text-red-600 font-medium text-center mb-4">{error}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={resetting}
            className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm py-2.5 rounded-xl transition-colors duration-150 cursor-pointer"
            style={{ minHeight: 44 }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={resetting}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors duration-150 cursor-pointer"
            style={{ minHeight: 44 }}
          >
            {resetting ? "Wiping…" : "Yes, wipe it"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────

function Dashboard({ session, onLogout }) {
  const { loading, error, reload, doResetAll } = useApp();
  const [showResetModal, setShowResetModal] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);
  const [resetError, setResetError] = React.useState(null);

  async function handleConfirmReset() {
    setResetting(true);
    setResetError(null);
    try {
      await doResetAll();
      setShowResetModal(false);
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-950 border-t-transparent rounded-full animate-spin mx-auto mb-3" aria-label="Loading" />
          <p className="text-slate-400 text-sm font-medium">Loading expense data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-slate-800 font-semibold mb-1">Connection Error</p>
          <p className="text-slate-500 text-sm mb-5">{error}</p>
          <button onClick={reload} className="btn-primary w-full">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-950 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-900 leading-none">Expense Coach</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {session?.userName && (
                  <span>Hi, {session.userName} · Space <span className="font-mono">{session.spaceId}</span></span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sign out */}
            <button
              onClick={onLogout}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer transition-colors duration-150 px-2 py-1"
              title="Sign out"
            >
              Sign out
            </button>

            {/* Reset */}
            <button
              onClick={() => { setShowResetModal(true); setResetError(null); }}
              disabled={resetting}
              className="btn-danger"
              aria-label="Reset all data"
            >
              {resetting ? "Resetting…" : "Reset"}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <CoachRealityCheck />
        <InputForm />
        <PersonSplitTable />
        <CategoryBudgetOverview />
        <TransactionLog />
      </main>

      {/* Reset modal */}
      {showResetModal && (
        <ResetModal
          onConfirm={handleConfirmReset}
          onCancel={() => { setShowResetModal(false); setResetError(null); }}
          resetting={resetting}
          error={resetError}
        />
      )}
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────

export default function App() {
  const [session, setSession] = React.useState(() => getSession());

  function handleLogin(newSession) {
    setSession(newSession);
  }

  function handleLogout() {
    clearSession();
    setSession(null);
  }

  if (!session) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <AppProvider spaceId={session.spaceId}>
      <Dashboard session={session} onLogout={handleLogout} />
    </AppProvider>
  );
}
