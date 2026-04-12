import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { autoCategorize } from "../utils/autoCategorize";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export default function InputForm() {
  const { categories, users, logExpense } = useApp();
  const [date, setDate] = useState(todayISO());
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paidByUserId, setPaidByUserId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (description) {
      const suggestion = autoCategorize(description);
      if (suggestion) setCategoryId(suggestion);
    }
  }, [description]);

  useEffect(() => {
    if (categories.length && !categoryId) setCategoryId(categories[0].id);
    if (users.length && !paidByUserId) setPaidByUserId(users[0].id);
  }, [categories, users, categoryId, paidByUserId]);

  async function handleSubmit(e) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setMsg({ type: "error", text: "Amount must be greater than 0." });
      return;
    }
    setSubmitting(true);
    setMsg(null);
    try {
      await logExpense({ date, description, amount: amt, categoryId, paidByUserId });
      setMsg({ type: "success", text: "Expense logged successfully." });
      setAmount("");
      setDescription("");
      setDate(todayISO());
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card p-6">
      <h2 className="section-title">Log Expense</h2>
      {(categories.length === 0 || users.length === 0) && (
        <div className="mb-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-700">
          {categories.length === 0 && users.length === 0
            ? "Add people and categories first before logging expenses."
            : categories.length === 0
            ? "Add at least one category before logging expenses."
            : "Add at least one person before logging expenses."}
        </div>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date */}
        <div>
          <label htmlFor="exp-date" className="field-label">Date</label>
          <input
            id="exp-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
            required
          />
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="exp-amount" className="field-label">Amount (₹)</label>
          <input
            id="exp-amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="input-field"
            required
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label htmlFor="exp-desc" className="field-label">Description</label>
          <input
            id="exp-desc"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. bought veg, atta 5kg"
            className="input-field"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="exp-category" className="field-label">Category</label>
          <select
            id="exp-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input-field cursor-pointer"
            required
          >
            <optgroup label="Fixed">
              {categories.filter((c) => c.type === "Fixed").map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </optgroup>
            <optgroup label="Variable">
              {categories.filter((c) => c.type === "Variable").map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Paid By */}
        <div>
          <label htmlFor="exp-paidby" className="field-label">Paid By</label>
          <select
            id="exp-paidby"
            value={paidByUserId}
            onChange={(e) => setPaidByUserId(e.target.value)}
            className="input-field cursor-pointer"
            required
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <div className="sm:col-span-2">
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Logging…" : "Log Expense"}
          </button>
        </div>

        {/* Feedback */}
        {msg && (
          <div
            role="status"
            className={`sm:col-span-2 flex items-center gap-2 text-sm font-medium rounded-lg px-4 py-3 ${
              msg.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {msg.type === "error" ? (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            )}
            {msg.text}
          </div>
        )}
      </form>
    </section>
  );
}
