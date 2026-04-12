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
    <section className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-title mb-0">Transactions</h2>
        {transactions.length > 0 && (
          <span className="text-xs text-slate-400 font-medium">{transactions.length} entries</span>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75" />
            </svg>
          </div>
          <p className="text-sm text-slate-400 font-medium">No transactions yet</p>
          <p className="text-xs text-slate-300 mt-0.5">Log your first expense above</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wide pr-4">Date</th>
                <th className="text-left py-2 pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wide pr-4">Description</th>
                <th className="text-left py-2 pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wide pr-4">Category</th>
                <th className="text-left py-2 pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wide pr-4">Paid By</th>
                <th className="text-right py-2 pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wide pr-4">Amount</th>
                <th className="py-2 pb-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors duration-100 group">
                  <td className="py-3 pr-4 text-slate-400 whitespace-nowrap tabular-nums text-xs">{t.date}</td>
                  <td className="py-3 pr-4 text-slate-800 font-medium">{t.description}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-block bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-md">
                      {getCategoryName(t.categoryId)}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-500 text-sm">{getUserName(t.paidByUserId)}</td>
                  <td className="py-3 pr-4 text-right font-semibold text-slate-900 tabular-nums">{fmt(t.amount)}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDelete(t)}
                      disabled={deletingId === t.id}
                      aria-label={`Delete ${t.description}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-slate-300 hover:text-red-500 disabled:opacity-30 cursor-pointer"
                    >
                      {deletingId === t.id ? (
                        <span className="text-xs">…</span>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      )}
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
