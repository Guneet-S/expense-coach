import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { personStatus, fmt } from "../utils/calculations";

const STATUS_CONFIG = {
  OK:         { cls: "bg-green-100 text-green-700",   label: "OK" },
  CRITICAL:   { cls: "bg-amber-100 text-amber-700",   label: "Critical" },
  "OVER CAP": { cls: "bg-red-100 text-red-700",       label: "Over Cap" },
};

function AddPersonForm() {
  const { addNewUser } = useApp();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [cap, setCap] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const amt = parseFloat(cap);
    if (!name.trim() || !amt || amt <= 0) {
      setErr("Name and a valid budget cap are required.");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      await addNewUser({ name: name.trim(), hardCap: amt });
      setName("");
      setCap("");
      setOpen(false);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-blue-800 hover:text-blue-950 cursor-pointer transition-colors duration-150"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Person
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">New Person</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label htmlFor="person-name" className="field-label">Name</label>
          <input
            id="person-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Guneet"
            className="input-field"
            required
          />
        </div>
        <div>
          <label htmlFor="person-cap" className="field-label">Monthly Cap (₹)</label>
          <input
            id="person-cap"
            type="number"
            min="1"
            step="1"
            value={cap}
            onChange={(e) => setCap(e.target.value)}
            placeholder="0"
            className="input-field"
            required
          />
        </div>
      </div>
      {err && <p className="text-xs text-red-600 font-medium mb-3">{err}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Adding…" : "Add"}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setErr(null); }}
          className="text-sm text-slate-500 hover:text-slate-700 cursor-pointer transition-colors duration-150 px-3"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function PersonSplitTable() {
  const { users } = useApp();

  return (
    <section className="card p-6">
      <h2 className="section-title">Person Split</h2>

      {users.length === 0 ? (
        <p className="text-sm text-slate-400 mb-2">No people yet. Add a person to start tracking.</p>
      ) : (
        <div className="space-y-4">
          {users.map((user) => {
            const { remaining, status } = personStatus(user);
            const cfg = STATUS_CONFIG[status] || { cls: "bg-slate-100 text-slate-600", label: status };
            const pct = user.hardCap > 0 ? Math.min((user.totalSpent / user.hardCap) * 100, 100) : 0;
            const isOver = user.totalSpent > user.hardCap;

            return (
              <div key={user.id} className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-slate-800">{user.name}</span>
                  <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${isOver ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-blue-950"}`}
                    style={{ width: `${pct}%` }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-slate-400 font-medium mb-0.5">Cap</p>
                    <p className="text-sm font-semibold text-slate-700 tabular-nums">{fmt(user.hardCap)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium mb-0.5">Spent</p>
                    <p className={`text-sm font-semibold tabular-nums ${isOver ? "text-red-600" : "text-slate-700"}`}>{fmt(user.totalSpent)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium mb-0.5">Left</p>
                    <p className={`text-sm font-semibold tabular-nums ${remaining < 0 ? "text-red-600" : "text-slate-700"}`}>{fmt(remaining)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddPersonForm />
    </section>
  );
}
