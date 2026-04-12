import React from "react";
import { useApp } from "../context/AppContext";
import { fmt } from "../utils/calculations";

export default function TransactionLog() {
  const { transactions, categories, users, removeTransaction } = useApp();
  const [deletingId, setDeletingId] = React.useState(null);

  function getCategoryName(id) {
    return categories.find((c) => c.id === id)?.name ?? id;
  }

  function getUserName(id) {
    return users.find((u) => u.id === id)?.name ?? id;
  }

  async function handleDelete(tx) {
    if (!window.confirm(`Delete "${tx.description}" (${fmt(tx.amount)})?`)) return;
    setDeletingId(tx.id);
    try {
      await removeTransaction(tx);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Transaction Log</h2>
      {transactions.length === 0 ? (
        <p className="text-gray-400 text-sm">No transactions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-left">
                <th className="py-2 px-3 rounded-l-lg">Date</th>
                <th className="py-2 px-3">Description</th>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3">Paid By</th>
                <th className="py-2 px-3 text-right">Amount</th>
                <th className="py-2 px-3 rounded-r-lg"></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-t border-gray-100">
                  <td className="py-3 px-3 text-gray-500 whitespace-nowrap">{t.date}</td>
                  <td className="py-3 px-3 text-gray-800">{t.description}</td>
                  <td className="py-3 px-3 text-gray-600">{getCategoryName(t.categoryId)}</td>
                  <td className="py-3 px-3 text-gray-600">{getUserName(t.paidByUserId)}</td>
                  <td className="py-3 px-3 text-right font-medium text-gray-800">{fmt(t.amount)}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleDelete(t)}
                      disabled={deletingId === t.id}
                      className="text-red-400 hover:text-red-600 disabled:opacity-40 text-xs font-medium"
                    >
                      {deletingId === t.id ? "…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
