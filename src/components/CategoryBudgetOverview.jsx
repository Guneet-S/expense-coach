import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { categoryStatus, fmt } from "../utils/calculations";

const STATUS_CONFIG = {
  Pending:   { cls: "bg-slate-100 text-slate-500",  barCls: "bg-slate-300" },
  Active:    { cls: "bg-green-100 text-green-700",  barCls: "bg-green-500" },
  Bleeding:  { cls: "bg-amber-100 text-amber-700",  barCls: "bg-amber-500" },
  OVERSPENT: { cls: "bg-red-100 text-red-700",      barCls: "bg-red-500" },
};

function CategoryRow({ category }) {
  const { editCategoryBudget } = useApp();
  const { remaining, status } = categoryStatus(category);
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Active;
  const pct = category.budgetedAmount > 0
    ? Math.min((category.totalSpent / category.budgetedAmount) * 100, 100)
    : 0;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(category.budgetedAmount));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const val = parseFloat(draft);
    if (!val || val <= 0) return;
    setSaving(true);
    try {
      await editCategoryBudget(category.id, val);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") { setEditing(false); setDraft(String(category.budgetedAmount)); }
  }

  return (
    <div className="py-3 border-b border-slate-50 last:border-0">
      {/* Row header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-800">{category.name}</span>
        <div className="flex items-center gap-2">
          <span className={`badge ${cfg.cls}`}>{status}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-300 ${cfg.barCls}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Numbers row */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="tabular-nums">
          <span className="text-slate-700 font-medium">{fmt(category.totalSpent)}</span>
          {" / "}
          {editing ? (
            <span className="inline-flex items-center gap-1">
              <input
                type="number"
                min="1"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-20 border border-blue-400 rounded-md px-1.5 py-0.5 text-xs focus:outline-none text-slate-800"
                autoFocus
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-blue-700 font-semibold hover:underline disabled:opacity-40 cursor-pointer"
              >
                {saving ? "…" : "Save"}
              </button>
              <button
                onClick={() => { setEditing(false); setDraft(String(category.budgetedAmount)); }}
                className="text-slate-400 hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              onClick={() => { setDraft(String(category.budgetedAmount)); setEditing(true); }}
              className="text-slate-500 hover:text-blue-700 hover:underline cursor-pointer transition-colors duration-150"
              title="Click to edit budget"
            >
              {fmt(category.budgetedAmount)}
            </button>
          )}
        </span>
        <span className={`tabular-nums font-medium ${remaining < 0 ? "text-red-600" : "text-slate-600"}`}>
          {remaining < 0 ? "−" : ""}{fmt(Math.abs(remaining))} {remaining < 0 ? "over" : "left"}
        </span>
      </div>
    </div>
  );
}

function GroupSection({ title, categories }) {
  return (
    <div className="mb-2">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 px-0">{title}</h3>
      {categories.map((c) => <CategoryRow key={c.id} category={c} />)}
    </div>
  );
}

function AddCategoryForm() {
  const { addNewCategory } = useApp();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("Variable");
  const [budget, setBudget] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const amt = parseFloat(budget);
    if (!name.trim() || !amt || amt <= 0) {
      setErr("Name and a valid budget are required.");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      await addNewCategory({ name: name.trim(), type, budgetedAmount: amt });
      setName("");
      setBudget("");
      setType("Variable");
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
        Add Category
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">New Category</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <div>
          <label htmlFor="cat-name" className="field-label">Name</label>
          <input
            id="cat-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Gym"
            className="input-field"
            required
          />
        </div>
        <div>
          <label htmlFor="cat-type" className="field-label">Type</label>
          <select
            id="cat-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="input-field cursor-pointer"
          >
            <option value="Variable">Variable</option>
            <option value="Fixed">Fixed</option>
          </select>
        </div>
        <div>
          <label htmlFor="cat-budget" className="field-label">Budget (₹)</label>
          <input
            id="cat-budget"
            type="number"
            min="1"
            step="1"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
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

export default function CategoryBudgetOverview() {
  const { categories } = useApp();
  const fixed    = categories.filter((c) => c.type === "Fixed");
  const variable = categories.filter((c) => c.type === "Variable");

  return (
    <section className="card p-6">
      <h2 className="section-title">Category Budgets</h2>
      <GroupSection title="Fixed" categories={fixed} />
      <div className="mt-4">
        <GroupSection title="Variable" categories={variable} />
      </div>
      <AddCategoryForm />
    </section>
  );
}
