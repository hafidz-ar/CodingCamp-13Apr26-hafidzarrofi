/**
 * @fileoverview Entry point — wires DOM events to the data pipeline.
 * Unidirectional flow: Event → Validator → State → Storage → Renderer
 */

import { addTransaction, removeTransaction, computeBalance, computeCategoryTotals, computeMonthlySummary, sortTransactions } from './state.js';
import { validateForm, validateCategoryName } from './validator.js';
import { loadTransactions, saveTransactions, loadCustomCategories, saveCustomCategories, loadSpendingLimit, saveSpendingLimit, clearSpendingLimit, loadTheme, saveTheme } from './storage.js';
import { renderBalance, renderTransactionList, renderChart, renderFormErrors, clearFormErrors, resetForm, renderCategoryOptions, renderMonthlySummary, renderTheme } from './renderer.js';

/** @type {import('./state.js').Transaction[]} */
let state = [];

/** @type {string[]} */
let customCategories = [];

/** Current sort selection */
let currentSort = 'default';

/** @type {number | null} */
let spendingLimit = null;

/** @type {'light' | 'dark'} */
let currentTheme = 'light';

/** Default categories always listed first */
const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun'];

/**
 * Reads the OS color scheme preference.
 * @returns {'light' | 'dark'}
 */
function detectOsTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Updates the theme toggle button label and aria-label to reflect the current theme.
 * @param {'light' | 'dark'} theme
 * @returns {void}
 */
function updateThemeButton(theme) {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  if (theme === 'dark') {
    btn.textContent = '☀️ Light';
    btn.setAttribute('aria-label', 'Switch to light mode');
  } else {
    btn.textContent = '🌙 Dark';
    btn.setAttribute('aria-label', 'Switch to dark mode');
  }
}

/**
 * Renders all UI regions from the current state.
 * Applies the current sort before rendering the transaction list.
 * @returns {void}
 */
function renderAll() {
  const [criterion, order] = currentSort === 'default'
    ? ['default', 'asc']
    : currentSort.split('-');
  renderBalance(computeBalance(state), spendingLimit);
  renderTransactionList(sortTransactions(state, criterion, order), spendingLimit);
  renderChart(computeCategoryTotals(state));
  renderMonthlySummary(computeMonthlySummary(state));
}

/**
 * Handles form submission: validate → build tx → add → save → render → reset.
 * @param {SubmitEvent} event
 * @returns {void}
 */
function handleFormSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('input-name').value;
  const amount = document.getElementById('input-amount').value;
  const category = document.getElementById('input-category').value;

  const { valid, errors } = validateForm(name, amount, category);
  if (!valid) {
    renderFormErrors(errors);
    return;
  }

  clearFormErrors();

  const tx = {
    id: crypto.randomUUID(),
    name: name.trim(),
    amount: Number(amount),
    category,
    createdAt: new Date().toISOString(),
  };

  state = addTransaction(state, tx);
  saveTransactions(state);
  renderAll();
  resetForm();
}

/**
 * Handles delete clicks via event delegation on the transaction list.
 * @param {MouseEvent} event
 * @returns {void}
 */
function handleDeleteClick(event) {
  const id = event.target.dataset.id;
  if (!id) return;

  state = removeTransaction(state, id);
  saveTransactions(state);
  renderAll();
}

/**
 * Handles add-category form submission: validate → add → save → render options.
 * @param {SubmitEvent} event
 * @returns {void}
 */
function handleCategorySubmit(event) {
  event.preventDefault();

  const input = document.getElementById('input-category-name');
  const errorSpan = document.getElementById('error-category-name');
  const name = input ? input.value : '';

  const result = validateCategoryName(name, [...DEFAULT_CATEGORIES, ...customCategories]);
  if (!result.valid) {
    if (errorSpan) errorSpan.textContent = result.error;
    return;
  }

  if (errorSpan) errorSpan.textContent = '';
  customCategories = [...customCategories, name.trim()];
  saveCustomCategories(customCategories);
  renderCategoryOptions([...DEFAULT_CATEGORIES, ...customCategories]);
  if (input) input.value = '';
}

// Bootstrap on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  state = loadTransactions();
  customCategories = loadCustomCategories();
  spendingLimit = loadSpendingLimit();

  // Theme: restore persisted preference or fall back to OS preference
  currentTheme = loadTheme() ?? detectOsTheme();
  renderTheme(currentTheme);
  updateThemeButton(currentTheme);

  renderCategoryOptions([...DEFAULT_CATEGORIES, ...customCategories]);

  const limitInput = document.getElementById('spending-limit-input');
  if (limitInput && spendingLimit !== null) {
    limitInput.value = spendingLimit;
  }

  renderAll();

  document.getElementById('transaction-form').addEventListener('submit', handleFormSubmit);
  document.getElementById('transaction-list').addEventListener('click', handleDeleteClick);
  document.getElementById('category-form').addEventListener('submit', handleCategorySubmit);

  // Theme toggle
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      saveTheme(currentTheme);
      renderTheme(currentTheme);
      updateThemeButton(currentTheme);
    });
  }

  // Header panel toggles — only one panel open at a time
  const headerPanels = [
    { btn: document.getElementById('toggle-spending-limit'), panel: document.getElementById('spending-limit-panel') },
    { btn: document.getElementById('toggle-add-category'),   panel: document.getElementById('add-category-panel') },
  ];

  function closeAllPanels() {
    for (const { btn, panel } of headerPanels) {
      panel.hidden = true;
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  }

  for (const { btn, panel } of headerPanels) {
    if (!btn || !panel) continue;
    btn.addEventListener('click', () => {
      const willOpen = panel.hidden; // true = sedang tertutup, akan dibuka
      closeAllPanels();
      if (willOpen) {
        panel.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  document.getElementById('sort-control').addEventListener('change', (event) => {
    currentSort = event.target.value;
    const [criterion, order] = currentSort === 'default'
      ? ['default', 'asc']
      : currentSort.split('-');
    renderTransactionList(sortTransactions(state, criterion, order), spendingLimit);
  });

  if (limitInput) {
    limitInput.addEventListener('input', () => {
      const parsed = parseFloat(limitInput.value);
      if (!isNaN(parsed) && parsed > 0) {
        spendingLimit = parsed;
        saveSpendingLimit(spendingLimit);
      } else {
        spendingLimit = null;
        clearSpendingLimit();
      }
      const [criterion, order] = currentSort === 'default'
        ? ['default', 'asc']
        : currentSort.split('-');
      renderBalance(computeBalance(state), spendingLimit);
      renderTransactionList(sortTransactions(state, criterion, order), spendingLimit);
    });
  }

  const clearLimitBtn = document.getElementById('clear-spending-limit');
  if (clearLimitBtn) {
    clearLimitBtn.addEventListener('click', () => {
      if (limitInput) limitInput.value = '';
      clearSpendingLimit();
      spendingLimit = null;
      const [criterion, order] = currentSort === 'default'
        ? ['default', 'asc']
        : currentSort.split('-');
      renderBalance(computeBalance(state), spendingLimit);
      renderTransactionList(sortTransactions(state, criterion, order), spendingLimit);
    });
  }
});
