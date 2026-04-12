import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  initMonthIfNeeded,
  fetchUsers,
  fetchCategories,
  fetchTransactions,
  addTransaction,
  deleteTransaction,
  updateCategoryBudget,
  resetMonth,
} from "../firebase/firestore";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    try {
      const [u, c, t] = await Promise.all([
        fetchUsers(),
        fetchCategories(),
        fetchTransactions(),
      ]);
      setUsers(u);
      setCategories(c);
      setTransactions(t);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        await initMonthIfNeeded();
        await reload();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [reload]);

  async function logExpense(data) {
    await addTransaction(data);
    await reload();
  }

  async function removeTransaction(tx) {
    await deleteTransaction(tx);
    await reload();
  }

  async function editCategoryBudget(categoryId, newAmount) {
    await updateCategoryBudget(categoryId, newAmount);
    await reload();
  }

  async function doResetMonth() {
    await resetMonth();
    await reload();
  }

  return (
    <AppContext.Provider value={{ users, categories, transactions, loading, error, logExpense, removeTransaction, editCategoryBudget, doResetMonth, reload }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
