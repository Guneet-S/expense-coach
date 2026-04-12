import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import InputForm from "./components/InputForm";
import PersonSplitTable from "./components/PersonSplitTable";
import CategoryBudgetOverview from "./components/CategoryBudgetOverview";
import TransactionLog from "./components/TransactionLog";
import CoachRealityCheck from "./components/CoachRealityCheck";

function Dashboard() {
  const { loading, error, reload, doResetMonth } = useApp();
  const [resetting, setResetting] = React.useState(false);

  async function handleReset() {
    if (!window.confirm("Reset month? This deletes ALL transactions and resets all totals to zero. Cannot be undone.")) return;
    setResetting(true);
    try {
      await doResetMonth();
    } finally {
      setResetting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading expense data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-600 font-semibold">Error: {error}</p>
        <button
          onClick={reload}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Monthly Expense Coach</h1>
          <p className="text-gray-500 mt-1">Strict budget tracking — no fluff, no excuses.</p>
        </div>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="shrink-0 bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-700 font-semibold text-sm px-4 py-2 rounded-lg transition"
        >
          {resetting ? "Resetting…" : "Reset Month"}
        </button>
      </header>

      {/* Section 5 — Coach reality check at the top for instant visibility */}
      <CoachRealityCheck />

      {/* Section 1 — Input */}
      <InputForm />

      {/* Section 2 — Person split */}
      <PersonSplitTable />

      {/* Section 3 — Category overview */}
      <CategoryBudgetOverview />

      {/* Section 4 — Transaction log */}
      <TransactionLog />
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
