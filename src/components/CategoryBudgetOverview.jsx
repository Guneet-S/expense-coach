import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { categoryStatus, fmt } from "../utils/calculations";

const STATUS_STYLE = {
  Pending:   "text-gray-400",
  Active:    "text-green-600 font-semibold",
  Bleeding:  "text-orange-500 font-bold",
  OVERSPENT: "text-red-600 font-bold",
};

function CategoryRow({ category }) {
  const { editCategoryBudget } = useApp();
  const { remaining, status } = categoryStatus(category);
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
    <tr className="border-t border-gray-100">
      <td className="py-3 px-3 text-gray-800">{category.name}</td>
      <td className="py-3 px-3 text-gray-700">
        {editing ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="1"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-24 border border-blue-400 rounded px-2 py-1 text-sm focus:outline-none"
              autoFocus
            />
            <button onClick={handleSave} disabled={saving} className="text-blue-600 text-xs font-medium hover:underline disabled:opacity-40">
              {saving ? "…" : "Save"}
            </button>
            <button onClick={() => { setEditing(false); setDraft(String(category.budgetedAmount)); }} className="text-gray-400 text-xs hover:underline">
              Cancel
            </button>
          </div>
        ) : (
          <span
            className="cursor-pointer hover:text-blue-600 hover:underline"
            title="Click to edit budget"
            onClick={() => { setDraft(String(category.budgetedAmount)); setEditing(true); }}
          >
            {fmt(category.budgetedAmount)}
          </span>
        )}
      </td>
      <td className={`py-3 px-3 ${category.totalSpent > category.budgetedAmount ? "text-red-600" : "text-gray-700"}`}>
        {fmt(category.totalSpent)}
      </td>
      <td className={`py-3 px-3 ${remaining < 0 ? "text-red-600" : "text-gray-700"}`}>
        {fmt(remaining)}
      </td>
      <td className={`py-3 px-3 ${STATUS_STYLE[status] || ""}`}>
        {status}
      </td>
    </tr>
  );
}

function GroupTable({ title, categories }) {
  return (
    <div className="mb-6">
      <h3 className="text-md font-semibold text-gray-600 mb-2">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-left">
              <th className="py-2 px-3 rounded-l-lg">Category</th>
              <th className="py-2 px-3">Budget</th>
              <th className="py-2 px-3">Spent</th>
              <th className="py-2 px-3">Remaining</th>
              <th className="py-2 px-3 rounded-r-lg">Status</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => <CategoryRow key={c.id} category={c} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CategoryBudgetOverview() {
  const { categories } = useApp();
  const fixed    = categories.filter((c) => c.type === "Fixed");
  const variable = categories.filter((c) => c.type === "Variable");

  return (
    <section className="bg-white rounded-2xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Category Budget Overview</h2>
      <GroupTable title="Fixed Expenses" categories={fixed} />
      <GroupTable title="Variable Expenses" categories={variable} />
    </section>
  );
}
