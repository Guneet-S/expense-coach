import React from "react";
import { useApp } from "../context/AppContext";
import { computeMetrics, fmt } from "../utils/calculations";

function daysPassed() {
  return new Date().getDate();
}

function MetricCard({ label, value, negative, muted }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-lg font-semibold tabular-nums ${negative ? "text-red-600" : muted ? "text-slate-500" : "text-slate-900"}`}>
        {value}
      </p>
    </div>
  );
}

export default function CoachRealityCheck() {
  const { categories, transactions } = useApp();
  const metrics = computeMetrics(categories, transactions, daysPassed());
  const { realLiquidCash, variableBurnRate, totalBudget, totalSpent, totalRemaining, pendingFixed } = metrics;
  const isEmergency = realLiquidCash < 0;
  const spentPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  return (
    <section className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-title mb-0">Reality Check</h2>
        <span className="text-xs text-slate-400 font-medium">Day {daysPassed()} of month</span>
      </div>

      {/* Real Liquid Cash — hero number */}
      <div className={`rounded-xl px-6 py-5 mb-5 flex items-center justify-between ${isEmergency ? "bg-red-50 border border-red-200" : "bg-blue-950"}`}>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isEmergency ? "text-red-400" : "text-blue-300"}`}>
            Real Liquid Cash
          </p>
          <p className={`text-4xl font-bold tabular-nums leading-none ${isEmergency ? "text-red-600" : "text-white"}`}>
            {fmt(realLiquidCash)}
          </p>
          {isEmergency && (
            <p className="mt-2 text-xs font-bold text-red-700 uppercase tracking-wide">
              Fixed bills cannot be covered
            </p>
          )}
        </div>
        {!isEmergency && (
          <div className="text-right">
            <p className="text-xs text-blue-300 font-medium mb-1">Burn Rate</p>
            <p className="text-lg font-semibold text-white tabular-nums">{fmt(variableBurnRate)}<span className="text-blue-300 text-xs font-normal">/day</span></p>
          </div>
        )}
      </div>

      {/* Overall budget progress */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span className="font-medium">Budget Used</span>
          <span className="tabular-nums">{fmt(totalSpent)} / {fmt(totalBudget)}</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${spentPct > 90 ? "bg-red-500" : spentPct > 70 ? "bg-amber-500" : "bg-blue-950"}`}
            style={{ width: `${spentPct}%` }}
            role="progressbar"
            aria-valuenow={spentPct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Total Budget" value={fmt(totalBudget)} />
        <MetricCard label="Spent" value={fmt(totalSpent)} negative={totalSpent > totalBudget} />
        <MetricCard label="Remaining" value={fmt(totalRemaining)} negative={totalRemaining < 0} />
        <MetricCard label="Pending Fixed" value={fmt(pendingFixed)} muted />
      </div>

      {isEmergency && (
        <div className="mt-4 text-xs text-slate-500 flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>Variable burn rate: <strong className="text-slate-700">{fmt(variableBurnRate)}/day</strong> based on {daysPassed()} days elapsed.</span>
        </div>
      )}
    </section>
  );
}
