import {
  collection,
  doc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { db } from "./config";

// ── Reads ─────────────────────────────────────────────────────────────────

export async function fetchUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchCategories() {
  const snap = await getDocs(collection(db, "categories"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchTransactions() {
  const q = query(collection(db, "transactions"), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Write ─────────────────────────────────────────────────────────────────

export async function addTransaction({ date, description, amount, categoryId, paidByUserId }) {
  const amt = Math.round(amount * 100) / 100;

  await addDoc(collection(db, "transactions"), {
    date,
    description,
    amount: amt,
    categoryId,
    paidByUserId,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "categories", categoryId), { totalSpent: increment(amt) });
  await updateDoc(doc(db, "users", paidByUserId), { totalSpent: increment(amt) });
}

export async function deleteTransaction({ id, amount, categoryId, paidByUserId }) {
  const amt = Math.round(amount * 100) / 100;

  await deleteDoc(doc(db, "transactions", id));
  await updateDoc(doc(db, "categories", categoryId), { totalSpent: increment(-amt) });
  await updateDoc(doc(db, "users", paidByUserId), { totalSpent: increment(-amt) });
}

export async function updateCategoryBudget(categoryId, newBudgetedAmount) {
  await updateDoc(doc(db, "categories", categoryId), { budgetedAmount: newBudgetedAmount });
}

export async function addCategory({ name, type, budgetedAmount }) {
  const id = name.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now();
  await setDoc(doc(db, "categories", id), { name, type, budgetedAmount, totalSpent: 0 });
}

export async function addUser({ name, hardCap }) {
  const id = name.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now();
  await setDoc(doc(db, "users", id), { name, hardCap, totalSpent: 0 });
}

export async function resetAll() {
  // Wipe everything — no re-seed. Clean slate.
  const [txSnap, usersSnap, catsSnap] = await Promise.all([
    getDocs(collection(db, "transactions")),
    getDocs(collection(db, "users")),
    getDocs(collection(db, "categories")),
  ]);
  const wipe = writeBatch(db);
  txSnap.docs.forEach((d) => wipe.delete(d.ref));
  usersSnap.docs.forEach((d) => wipe.delete(d.ref));
  catsSnap.docs.forEach((d) => wipe.delete(d.ref));
  await wipe.commit();
}
