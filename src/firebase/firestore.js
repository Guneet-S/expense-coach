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

// ── Default seed data ──────────────────────────────────────────────────────

export const DEFAULT_USERS = [
  { id: "guneet", name: "Guneet", hardCap: 42600, totalSpent: 0 },
  { id: "shared", name: "Shared", hardCap: 42500, totalSpent: 0 },
];

export const DEFAULT_CATEGORIES = [
  // Fixed
  { id: "emi",          name: "EMI",              type: "Fixed",    budgetedAmount: 31000, totalSpent: 0 },
  { id: "maid",         name: "Maid",             type: "Fixed",    budgetedAmount: 8400,  totalSpent: 0 },
  { id: "electricity",  name: "Electricity Bill", type: "Fixed",    budgetedAmount: 5000,  totalSpent: 0 },
  { id: "internet",     name: "Internet",         type: "Fixed",    budgetedAmount: 2000,  totalSpent: 0 },
  { id: "phone",        name: "Phone Recharge",   type: "Fixed",    budgetedAmount: 2100,  totalSpent: 0 },
  { id: "cylinder",     name: "Cylinder",         type: "Fixed",    budgetedAmount: 1700,  totalSpent: 0 },
  { id: "carservice",   name: "Car Service",      type: "Fixed",    budgetedAmount: 700,   totalSpent: 0 },
  // Variable
  { id: "milk",         name: "Milk",             type: "Variable", budgetedAmount: 6000,  totalSpent: 0 },
  { id: "fruitsAndVeg", name: "Fruits and veg",   type: "Variable", budgetedAmount: 10000, totalSpent: 0 },
  { id: "rashan",       name: "Rashan",           type: "Variable", budgetedAmount: 8000,  totalSpent: 0 },
  { id: "diaper",       name: "Diaper",           type: "Variable", budgetedAmount: 3000,  totalSpent: 0 },
  { id: "misc",         name: "Misc",             type: "Variable", budgetedAmount: 6000,  totalSpent: 0 },
];

// ── Init ───────────────────────────────────────────────────────────────────

export async function initMonthIfNeeded() {
  const usersSnap = await getDocs(collection(db, "users"));
  if (!usersSnap.empty) return; // Already initialised

  for (const u of DEFAULT_USERS) {
    await setDoc(doc(db, "users", u.id), {
      name: u.name,
      hardCap: u.hardCap,
      totalSpent: u.totalSpent,
    });
  }

  for (const c of DEFAULT_CATEGORIES) {
    await setDoc(doc(db, "categories", c.id), {
      name: c.name,
      type: c.type,
      budgetedAmount: c.budgetedAmount,
      totalSpent: c.totalSpent,
    });
  }
}

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
  // Round to 2 decimal places to avoid float drift
  const amt = Math.round(amount * 100) / 100;

  await addDoc(collection(db, "transactions"), {
    date,
    description,
    amount: amt,
    categoryId,
    paidByUserId,
    createdAt: serverTimestamp(),
  });

  // Update category totalSpent
  await updateDoc(doc(db, "categories", categoryId), {
    totalSpent: increment(amt),
  });

  // Update user totalSpent
  await updateDoc(doc(db, "users", paidByUserId), {
    totalSpent: increment(amt),
  });
}

export async function deleteTransaction({ id, amount, categoryId, paidByUserId }) {
  const amt = Math.round(amount * 100) / 100;

  await deleteDoc(doc(db, "transactions", id));

  await updateDoc(doc(db, "categories", categoryId), {
    totalSpent: increment(-amt),
  });

  await updateDoc(doc(db, "users", paidByUserId), {
    totalSpent: increment(-amt),
  });
}

export async function updateCategoryBudget(categoryId, newBudgetedAmount) {
  await updateDoc(doc(db, "categories", categoryId), {
    budgetedAmount: newBudgetedAmount,
  });
}

export async function resetMonth() {
  // Delete all transactions
  const txSnap = await getDocs(collection(db, "transactions"));
  const batch1 = writeBatch(db);
  txSnap.docs.forEach((d) => batch1.delete(d.ref));
  await batch1.commit();

  // Reset all totalSpent counters
  const [usersSnap, catsSnap] = await Promise.all([
    getDocs(collection(db, "users")),
    getDocs(collection(db, "categories")),
  ]);
  const batch2 = writeBatch(db);
  usersSnap.docs.forEach((d) => batch2.update(d.ref, { totalSpent: 0 }));
  catsSnap.docs.forEach((d) => batch2.update(d.ref, { totalSpent: 0 }));
  await batch2.commit();
}
