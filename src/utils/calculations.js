/**
 * All monetary math in cents to avoid floating-point errors.
 * External interface uses decimal rupees; internally we convert to/from cents.
 */

function toCents(rupees) {
  return Math.round(rupees * 100);
}

function toRupees(cents) {
  return cents / 100;
}

/**
 * Compute summary metrics from live Firestore data.
 *
 * @param {Array} categories  — array of category docs
 * @param {Array} transactions — array of transaction docs
 * @param {number} daysPassed  — calendar days elapsed in the month (min 1)
 * @returns {object} derived metrics
 */
export function computeMetrics(categories, transactions, daysPassed) {
  const days = Math.max(daysPassed, 1);

  // Total budget
  const totalBudgetCents = categories.reduce(
    (sum, c) => sum + toCents(c.budgetedAmount),
    0
  );

  // Total spent (from transactions — single source of truth)
  const totalSpentCents = transactions.reduce(
    (sum, t) => sum + toCents(t.amount),
    0
  );

  const totalRemainingCents = totalBudgetCents - totalSpentCents;

  // Pending Fixed = sum of max(0, budgeted - spent) for Fixed categories
  const pendingFixedCents = categories
    .filter((c) => c.type === "Fixed")
    .reduce((sum, c) => {
      const remaining = toCents(c.budgetedAmount) - toCents(c.totalSpent);
      return sum + Math.max(0, remaining);
    }, 0);

  const realLiquidCashCents = totalRemainingCents - pendingFixedCents;

  // Variable burn rate = total variable spend / days passed
  const variableSpentCents = categories
    .filter((c) => c.type === "Variable")
    .reduce((sum, c) => sum + toCents(c.totalSpent), 0);

  const variableBurnRateCents = Math.round(variableSpentCents / days);

  return {
    totalBudget: toRupees(totalBudgetCents),
    totalSpent: toRupees(totalSpentCents),
    totalRemaining: toRupees(totalRemainingCents),
    pendingFixed: toRupees(pendingFixedCents),
    realLiquidCash: toRupees(realLiquidCashCents),
    variableBurnRate: toRupees(variableBurnRateCents),
  };
}

/**
 * Category-level remaining and status.
 */
export function categoryStatus(category) {
  const budgetCents = toCents(category.budgetedAmount);
  const spentCents = toCents(category.totalSpent);
  const remainingCents = budgetCents - spentCents;

  let status;
  if (remainingCents < 0) {
    status = "OVERSPENT";
  } else if (spentCents === 0) {
    status = "Pending";
  } else if (spentCents >= budgetCents * 0.8) {
    status = "Bleeding";
  } else {
    status = "Active";
  }

  return {
    remaining: toRupees(remainingCents),
    status,
  };
}

/**
 * Person-level status.
 */
export function personStatus(user) {
  const capCents = toCents(user.hardCap);
  const spentCents = toCents(user.totalSpent);
  const remainingCents = capCents - spentCents;
  const pctLeft = capCents > 0 ? remainingCents / capCents : 0;

  let status;
  if (remainingCents < 0) {
    status = "OVER CAP";
  } else if (pctLeft < 0.1) {
    status = "CRITICAL";
  } else {
    status = "OK";
  }

  return {
    remaining: toRupees(remainingCents),
    status,
  };
}

export function fmt(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
