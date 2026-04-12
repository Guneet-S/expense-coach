import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  fetchUsers,
  fetchCategories,
  fetchTransactions,
  addTransaction,
  deleteTransaction,
  updateCategoryBudget,
  resetAll,
  addCategory,
  addUser,
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
    let settled = false;

    const timeoutId = setTimeout(() => {
      if (!settled) {
        settled = true;
        setError("Loading timed out — Firebase may be unreachable. Check your network.");
        setLoading(false);
      }
    }, 10000);

    async function init() {
      try {
        await reload();
      } catch (err) {
        if (!settled) setError(err.message);
      } finally {
        clearTimeout(timeoutId);
        if (!settled) {
          settled = true;
          setLoading(false);
        }
      }
    }

    init();
    return () => { clearTimeout(timeoutId); settled = true; };
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

  async function doResetAll() {
    await resetAll();
    await reload();
  }

  async function addNewCategory(data) {
    await addCategory(data);
    await reload();
  }

  async function addNewUser(data) {
    await addUser(data);
    await reload();
  }

  return (
    <AppContext.Provider value={{
      users, categories, transactions,
      loading, error,
      logExpense, removeTransaction, editCategoryBudget,
      doResetAll, addNewCategory, addNewUser,
      reload,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
