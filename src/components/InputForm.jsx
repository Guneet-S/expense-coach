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

  // Auto-categorize on description change
  useEffect(() => {
    if (description) {
      const suggestion = autoCategorize(description);
      if (suggestion) setCategoryId(suggestion);
    }
  }, [description]);

  // Set defaults once data loads
  useEffect(() => {
    if (categories.length && !categoryId) setCategoryId(categories[0].id);
    if (users.length && !paidByUserId) setPaidByUserId(users[0].id);
  }, [categories, users, categoryId, paidByUserId]);

  async function handleSubmit(e) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setMsg({ type: "error", text: "Amount must be > 0" });
      return;
    }
    setSubmitting(true);
    setMsg(null);
    try {
      await logExpense({ date, description, amount: amt, categoryId, paidByUserId });
      setMsg({ type: "success", text: "Expense logged!" });
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
    <section className="bg-white rounded-2xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Log Expense</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Amount (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. bought veg, atta 5kg"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
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

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Paid By</label>
          <select
            value={paidByUserId}
            onChange={(e) => setPaidByUserId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {submitting ? "Logging…" : "Log Expense"}
          </button>
        </div>

        {msg && (
          <div className={`sm:col-span-2 text-sm font-medium ${msg.type === "error" ? "text-red-600" : "text-green-600"}`}>
            {msg.text}
          </div>
        )}
      </form>
    </section>
  );
}
