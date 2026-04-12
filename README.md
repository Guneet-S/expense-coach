# Expense Coach

A strict monthly household expense tracker built with React + Firebase Firestore.

## Live App

**Open on your phone:** https://guneet-s.github.io/expense-coach/

## Features

- **Log expenses** with auto-categorization (type "veg", "atta", "milk" — it picks the category)
- **Coach's Reality Check** — shows Real Liquid Cash = what's actually spendable after reserving unpaid fixed bills
- **EMERGENCY banner** when Real Liquid Cash goes negative
- **Category Budget Overview** — click any budget amount to edit it inline
- **Person-wise split** — tracks Guneet and Shared spending against hard caps
- **Transaction log** with delete (auto-reverses totals)
- **Reset Month** button — clears all transactions and resets counters in one click
- Variable burn rate tracker (₹/day)

## Stack

- React 18
- Firebase Firestore (real-time persistence)
- Tailwind CSS

## Setup

### 1. Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) → create/select project
2. Enable **Firestore Database** (test mode for dev)
3. In Project Settings → Your Apps → Web → copy the config
4. Paste into `src/firebase/config.js`

### 2. Install & Run

```bash
npm install
npm start
```

App runs at `http://localhost:3000`

### 3. First Launch

Auto-seeds on first load:
- 2 users: **Guneet** (cap ₹42,600) and **Shared** (cap ₹42,500)
- 12 budget categories — 7 Fixed + 5 Variable

### 4. Reset Month

Click **Reset Month** in the top-right header. Deletes all transactions and resets all totals to zero.
