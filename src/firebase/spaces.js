import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

export const SESSION_KEY = "ec_session"; // { spaceId, userName }

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(spaceId, userName) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ spaceId, userName }));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// Generate a unique 3-digit OTP that doesn't clash with existing spaces
async function generateOTP() {
  for (let i = 0; i < 20; i++) {
    const otp = Math.floor(100 + Math.random() * 900).toString();
    const snap = await getDoc(doc(db, "spaces", otp));
    if (!snap.exists()) return otp;
  }
  throw new Error("Could not generate a unique code. Try again.");
}

export async function createSpace(ownerName) {
  const otp = await generateOTP();
  await setDoc(doc(db, "spaces", otp), {
    otp,
    ownerName,
    members: [ownerName],
    createdAt: serverTimestamp(),
  });
  return otp;
}

export async function joinSpace(otp, userName) {
  const trimmed = otp.trim();
  if (!/^\d{3}$/.test(trimmed)) {
    throw new Error("Enter a valid 3-digit invite code.");
  }
  const spaceRef = doc(db, "spaces", trimmed);
  const snap = await getDoc(spaceRef);
  if (!snap.exists()) {
    throw new Error("Invalid code — no space found. Ask your partner for the right code.");
  }
  await updateDoc(spaceRef, { members: arrayUnion(userName) });
  return trimmed;
}
