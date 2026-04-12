import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import InputForm from "./components/InputForm";
import PersonSplitTable from "./components/PersonSplitTable";
import CategoryBudgetOverview from "./components/CategoryBudgetOverview";
import TransactionLog from "./components/TransactionLog";
import CoachRealityCheck from "./components/CoachRealityCheck";

function Dashboard() {
  const { loading, error, reload, doResetAll } = useApp();
  const [confirmReset, setConfirmReset] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);
  const [resetError, setResetError] = React.useState(null);

  async function handleConfirmReset() {
    setResetting(true);
    setResetError(null);
    setConfirmReset(false);
    try {
      await doResetAll();
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
          <button onClick={reload} className="btn-primary w-full">
            Retry
          </button>
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
              <p className="text-xs text-slate-400 mt-0.5">Monthly Budget Tracker</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {confirmReset ? (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <span className="text-xs font-semibold text-red-700 whitespace-nowrap">Wipe everything?</span>
                <button
                  onClick={handleConfirmReset}
                  disabled={resetting}
                  className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 px-3 py-1 rounded-lg cursor-pointer transition-colors duration-150"
                >
                  Yes, wipe it
                </button>
                <button
                  onClick={() => { setConfirmReset(false); setResetError(null); }}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 cursor-pointer transition-colors duration-150"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                disabled={resetting}
                className="btn-danger"
                aria-label="Reset all data"
              >
                {resetting ? "Resetting…" : "Reset"}
              </button>
            )}
            {resetError && (
              <p className="text-xs text-red-600 font-medium max-w-xs text-right">{resetError}</p>
            )}
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
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}
