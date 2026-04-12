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

// ── Path helpers ───────────────────────────────────────────────────────────

function col(spaceId, name) {
  return collection(db, "spaces", spaceId, name);
}

function d(spaceId, name, id) {
  return doc(db, "spaces", spaceId, name, id);
}

// ── Reads ──────────────────────────────────────────────────────────────────

export async function fetchUsers(spaceId) {
  const snap = await getDocs(col(spaceId, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchCategories(spaceId) {
  const snap = await getDocs(col(spaceId, "categories"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchTransactions(spaceId) {
  const q = query(col(spaceId, "transactions"), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Write ──────────────────────────────────────────────────────────────────

export async function addTransaction(spaceId, { date, description, amount, categoryId, paidByUserId }) {
  const amt = Math.round(amount * 100) / 100;

  await addDoc(col(spaceId, "transactions"), {
    date,
    description,
    amount: amt,
    categoryId,
    paidByUserId,
    createdAt: serverTimestamp(),
  });

  await updateDoc(d(spaceId, "categories", categoryId), { totalSpent: increment(amt) });
  await updateDoc(d(spaceId, "users", paidByUserId), { totalSpent: increment(amt) });
}

export async function deleteTransaction(spaceId, { id, amount, categoryId, paidByUserId }) {
  const amt = Math.round(amount * 100) / 100;

  await deleteDoc(d(spaceId, "transactions", id));
  await updateDoc(d(spaceId, "categories", categoryId), { totalSpent: increment(-amt) });
  await updateDoc(d(spaceId, "users", paidByUserId), { totalSpent: increment(-amt) });
}

export async function updateCategoryBudget(spaceId, categoryId, newBudgetedAmount) {
  await updateDoc(d(spaceId, "categories", categoryId), { budgetedAmount: newBudgetedAmount });
}

export async function addCategory(spaceId, { name, type, budgetedAmount }) {
  const id = name.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now();
  await setDoc(d(spaceId, "categories", id), { name, type, budgetedAmount, totalSpent: 0 });
}

export async function addUser(spaceId, { name, hardCap }) {
  const id = name.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now();
  await setDoc(d(spaceId, "users", id), { name, hardCap, totalSpent: 0 });
}

// ── Reset (wipe space data only) ───────────────────────────────────────────

export async function resetAll(spaceId) {
  const [txSnap, usersSnap, catsSnap] = await Promise.all([
    getDocs(col(spaceId, "transactions")),
    getDocs(col(spaceId, "users")),
    getDocs(col(spaceId, "categories")),
  ]);
  const wipe = writeBatch(db);
  txSnap.docs.forEach((d) => wipe.delete(d.ref));
  usersSnap.docs.forEach((d) => wipe.delete(d.ref));
  catsSnap.docs.forEach((d) => wipe.delete(d.ref));
  await wipe.commit();
}

// ── One-time cleanup: remove stale root-level collections ─────────────────

export async function cleanupRootCollections() {
  const [usersSnap, catsSnap, txSnap] = await Promise.all([
    getDocs(collection(db, "users")),
    getDocs(collection(db, "categories")),
    getDocs(collection(db, "transactions")),
  ]);
  if (usersSnap.empty && catsSnap.empty && txSnap.empty) return; // already clean

  const batch = writeBatch(db);
  usersSnap.docs.forEach((d) => batch.delete(d.ref));
  catsSnap.docs.forEach((d) => batch.delete(d.ref));
  txSnap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}
