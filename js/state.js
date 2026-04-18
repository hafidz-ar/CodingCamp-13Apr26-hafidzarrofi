/**
 * @fileoverview In-memory state and pure mutation helpers.
 * All functions are pure — no side effects, no DOM access.
 */

/**
 * @typedef {Object} Transaction
 * @property {string} id        - Unique identifier (crypto.randomUUID or Date.now string)
 * @property {string} name      - Non-empty item description
 * @property {number} amount    - Positive finite number (e.g. 12.50)
 * @property {'Food'|'Transport'|'Fun'} category - Spending category
 */

/**
 * Returns a new array with newTx appended; does not mutate the input array.
 * @param {Transaction[]} transactions
 * @param {Transaction} newTx
 * @returns {Transaction[]}
 */
export function addTransaction(transactions, newTx) {
  return [...transactions, newTx];
}

/**
 * Returns a new array with the matching id filtered out.
 * Returns the original list unchanged if id is not found.
 * @param {Transaction[]} transactions
 * @param {string} id
 * @returns {Transaction[]}
 */
export function removeTransaction(transactions, id) {
  return transactions.filter(tx => tx.id !== id);
}

/**
 * Returns the arithmetic sum of all amount fields.
 * Returns 0 for an empty list.
 * @param {Transaction[]} transactions
 * @returns {number}
 */
export function computeBalance(transactions) {
  return transactions.reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Returns an object mapping each category to the sum of its transaction amounts.
 * @param {Transaction[]} transactions
 * @returns {{ [category: string]: number }}
 */
export function computeCategoryTotals(transactions) {
  return transactions.reduce((totals, tx) => {
    totals[tx.category] = (totals[tx.category] ?? 0) + tx.amount;
    return totals;
  }, {});
}

/**
 * @typedef {Object} MonthlySummary
 * @property {string} month      - 'YYYY-MM'
 * @property {string} label      - e.g. 'January 2025'
 * @property {number} total      - sum of transaction amounts for that month
 * @property {{ [category: string]: number }} byCategory - per-category totals
 */

/**
 * Groups transactions by calendar month derived from `createdAt` (ISO 8601).
 * Falls back to the current date if `createdAt` is absent or invalid.
 * Returns MonthlySummary[] sorted descending (most recent month first).
 * @param {Transaction[]} transactions
 * @returns {MonthlySummary[]}
 */
export function computeMonthlySummary(transactions) {
  /** @type {{ [month: string]: MonthlySummary }} */
  const map = {};

  for (const tx of transactions) {
    let date;
    if (tx.createdAt) {
      date = new Date(tx.createdAt);
      if (isNaN(date.getTime())) date = new Date();
    } else {
      date = new Date();
    }

    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    if (!map[month]) {
      map[month] = { month, label, total: 0, byCategory: {} };
    }

    map[month].total += tx.amount;
    map[month].byCategory[tx.category] = (map[month].byCategory[tx.category] ?? 0) + tx.amount;
  }

  return Object.values(map).sort((a, b) => b.month.localeCompare(a.month));
}

/**
 * Returns a sorted copy of the transactions array. Never mutates the input.
 * @param {Transaction[]} transactions
 * @param {'default'|'amount'|'category'} criterion
 * @param {'asc'|'desc'} order
 * @returns {Transaction[]}
 */
export function sortTransactions(transactions, criterion, order) {
  const copy = [...transactions];

  if (criterion === 'default') {
    return copy.reverse();
  }

  copy.sort((a, b) => {
    let cmp;
    if (criterion === 'amount') {
      cmp = a.amount - b.amount;
    } else {
      // category — case-insensitive alphabetical
      cmp = a.category.toLowerCase().localeCompare(b.category.toLowerCase());
    }
    return order === 'desc' ? -cmp : cmp;
  });

  return copy;
}
