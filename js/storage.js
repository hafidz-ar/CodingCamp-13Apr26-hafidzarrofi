/**
 * @fileoverview localStorage read/write adapter.
 * This is the only file that touches localStorage.
 */

/** @type {string} */
const STORAGE_KEY = 'expense_transactions';

/**
 * Reads and parses transactions from localStorage.
 * Returns an empty array on missing key or malformed JSON.
 * @returns {import('./state.js').Transaction[]}
 */
export function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Serializes txList to JSON and writes to localStorage.
 * Wraps setItem in try/catch; logs a console warning on quota errors.
 * @param {import('./state.js').Transaction[]} txList
 * @returns {void}
 */
export function saveTransactions(txList) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(txList));
  } catch (err) {
    console.warn('saveTransactions: failed to write to localStorage', err);
  }
}

/** @type {string} */
const CATEGORIES_KEY = 'expense_custom_categories';

/**
 * Reads and parses custom categories from localStorage.
 * Returns an empty array on missing key or malformed JSON.
 * @returns {string[]}
 */
export function loadCustomCategories() {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

/**
 * Serializes categories to JSON and writes to localStorage.
 * @param {string[]} categories
 * @returns {void}
 */
export function saveCustomCategories(categories) {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (err) {
    console.warn('saveCustomCategories: failed to write to localStorage', err);
  }
}

/** @type {string} */
const SPENDING_LIMIT_KEY = 'expense_spending_limit';

/**
 * Reads and parses the spending limit from localStorage.
 * Returns null when not set or on any error.
 * @returns {number | null}
 */
export function loadSpendingLimit() {
  try {
    const raw = localStorage.getItem(SPENDING_LIMIT_KEY);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Serializes limit to JSON and writes to localStorage.
 * @param {number} limit
 * @returns {void}
 */
export function saveSpendingLimit(limit) {
  try {
    localStorage.setItem(SPENDING_LIMIT_KEY, JSON.stringify(limit));
  } catch (err) {
    console.warn('saveSpendingLimit: failed to write to localStorage', err);
  }
}

/**
 * Removes the spending limit key from localStorage.
 * @returns {void}
 */
export function clearSpendingLimit() {
  localStorage.removeItem(SPENDING_LIMIT_KEY);
}

/** @type {string} */
const THEME_KEY = 'expense_theme';

/**
 * Reads the persisted theme preference from localStorage.
 * Returns null when not set or on any error.
 * @returns {'light' | 'dark' | null}
 */
export function loadTheme() {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw === 'light' || raw === 'dark') return raw;
    return null;
  } catch {
    return null;
  }
}

/**
 * Persists the theme preference to localStorage.
 * @param {'light' | 'dark'} theme
 * @returns {void}
 */
export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (err) {
    console.warn('saveTheme: failed to write to localStorage', err);
  }
}
