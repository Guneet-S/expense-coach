import React from "react";
import { useApp } from "../context/AppContext";
import { computeMetrics, fmt } from "../utils/calculations";

function daysPassed() {
  const now = new Date();
  return now.getDate(); // day of month = days elapsed
}

export default function CoachRealityCheck() {
  const { categories, transactions } = useApp();

  const metrics = computeMetrics(categories, transactions, daysPassed());
  const { realLiquidCash, variableBurnRate, totalBudget, totalSpent, totalRemaining, pendingFixed } = metrics;

  const isEmergency = realLiquidCash < 0;

  return (
    <section className="bg-white rounded-2xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Coach's Reality Check</h2>

      {/* Real Liquid Cash — prominent */}
      <div className={`rounded-xl p-5 mb-5 text-center ${isEmergency ? "bg-red-50 border-2 border-red-400" : "bg-green-50 border-2 border-green-300"}`}>
        <p className="text-sm text-gray-500 mb-1">Real Liquid Cash</p>
        <p className={`text-4xl font-extrabold ${isEmergency ? "text-red-600" : "text-green-700"}`}>
          {fmt(realLiquidCash)}
        </p>
        {isEmergency && (
          <p className="mt-3 text-red-700 font-bold text-sm uppercase tracking-wide">
            EMERGENCY: Fixed bills cannot be covered.
          </p>
        )}
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-5">
        <MetricCard label="Total Budget" value={fmt(totalBudget)} />
        <MetricCard label="Total Spent" value={fmt(totalSpent)} negative={totalSpent > totalBudget} />
        <MetricCard label="Total Remaining" value={fmt(totalRemaining)} negative={totalRemaining < 0} />
        <MetricCard label="Pending Fixed" value={fmt(pendingFixed)} />
      </div>

      {/* Burn rate */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
        <span className="font-semibold">Variable Burn Rate: </span>
        <span>{fmt(variableBurnRate)} / day</span>
        <span className="text-gray-400 ml-2">(based on {daysPassed()} days elapsed)</span>
      </div>
    </section>
  );
}

function MetricCard({ label, value, negative }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${negative ? "text-red-600" : "text-gray-800"}`}>{value}</p>
    </div>
  );
}
