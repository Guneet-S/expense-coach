# Expense Coach — Setup Guide

## 1. Firebase Setup

1. Go to https://console.firebase.google.com → create/select project
2. Enable **Firestore Database** (start in test mode for dev)
3. In Project Settings → Your Apps → Web → copy the config object
4. Paste into `src/firebase/config.js` replacing the placeholder values

## 2. Install & Run

```bash
cd C:/projects/expense-coach
npm install
npm start
```

App opens at http://localhost:3000

## 3. First Launch

On first load the app auto-seeds:
- 2 users: Guneet (cap ₹42,600) and Shared (cap ₹42,500)
- 12 budget categories (7 Fixed + 5 Variable) with default amounts

## 4. Usage

- **Log Expense** — fill the form at top. Description is auto-categorized (e.g. typing "veg" selects "Fruits and veg")
- **Coach's Reality Check** — shows Real Liquid Cash = what's actually spendable after reserving pending fixed bills
- **EMERGENCY banner** appears when Real Liquid Cash < 0

## 5. Reset Month

To start a new month, delete all documents in Firestore collections:
`users`, `categories`, `transactions` — the app re-seeds on next load.
