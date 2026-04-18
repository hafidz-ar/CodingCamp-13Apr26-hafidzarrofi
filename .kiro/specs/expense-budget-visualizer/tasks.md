# Implementation Plan: Expense & Budget Visualizer

## Overview

Implement a single-page expense tracker using plain HTML, CSS, and Vanilla JavaScript. The app is structured as logical JS modules (state, validator, storage, renderer) wired together in app.js, with Chart.js loaded via CDN. All state is persisted to localStorage on every mutation.

This plan covers the base app (Tasks 1–9) and five additional features: custom categories (Task 10), monthly summary view (Task 11), transaction sorting (Task 12), spending limit highlights (Task 13), and dark/light mode toggle (Task 14).

## Tasks

- [x] 1. Scaffold project files and define core data interfaces
  - Create `index.html` with semantic markup: balance display, input form, transaction list, chart canvas, and CDN script tag for Chart.js 4.x
  - Create `css/styles.css` with mobile-first responsive layout (320px → 1920px)
  - Create `js/state.js`, `js/validator.js`, `js/storage.js`, `js/renderer.js`, `js/app.js` as empty module stubs
  - Define the `Transaction` shape (`id`, `name`, `amount`, `category`) as a JSDoc typedef in `state.js`
  - _Requirements: 1.1, 7.1, 8.2, 10.1, 10.2_

- [x] 2. Implement state module pure functions
  - [x] 2.1 Implement `addTransaction(transactions, newTx)` → `Transaction[]`
    - Returns a new array with `newTx` appended; does not mutate the input array
    - _Requirements: 1.2, 2.1_

  - [ ]* 2.2 Write property test for `addTransaction` preserving existing transactions
    - **Property 7: addTransaction preserves existing transactions**
    - **Validates: Requirements 1.2, 2.1**

  - [x] 2.3 Implement `removeTransaction(transactions, id)` → `Transaction[]`
    - Returns a new array with the matching id filtered out; returns original list unchanged if id not found
    - _Requirements: 3.2, 3.3_

  - [ ]* 2.4 Write property test for `removeTransaction` removing exactly one transaction
    - **Property 3: Delete removes exactly one transaction**
    - **Validates: Requirements 3.2, 3.3**

  - [x] 2.5 Implement `computeBalance(transactions)` → `number`
    - Returns the arithmetic sum of all `amount` fields; returns `0` for an empty list
    - _Requirements: 4.1, 4.4_

  - [ ]* 2.6 Write property test for `computeBalance` equaling sum of amounts
    - **Property 2: Balance equals sum of amounts**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

  - [x] 2.7 Implement `computeCategoryTotals(transactions)` → `{ [category: string]: number }`
    - Returns an object mapping each category to the sum of its transaction amounts
    - _Requirements: 5.1_

  - [ ]* 2.8 Write property test for category totals partitioning the balance
    - **Property 4: Category totals partition the balance**
    - **Validates: Requirements 5.1, 5.2, 5.3**

- [x] 3. Implement validator module
  - [x] 3.1 Implement `isNonEmpty(value)` → `boolean` and `isValidAmount(value)` → `boolean`
    - `isNonEmpty`: returns `false` for blank or whitespace-only strings
    - `isValidAmount`: returns `false` for non-positive, non-finite, or non-numeric values
    - _Requirements: 1.4, 1.5_

  - [x] 3.2 Implement `validateForm(name, amount, category)` → `{ valid: boolean, errors: { name?, amount?, category? } }`
    - Returns `{ valid: false }` with per-field error messages when any field is invalid
    - Returns `{ valid: true, errors: {} }` when all fields pass
    - _Requirements: 1.4, 1.5_

  - [ ]* 3.3 Write property test for invalid inputs being rejected
    - **Property 5: Whitespace and empty inputs are rejected**
    - **Validates: Requirements 1.4, 1.5**

- [x] 4. Implement storage module
  - [x] 4.1 Implement `loadTransactions()` → `Transaction[]`
    - Reads `"expense_transactions"` from `localStorage`, parses JSON, returns `[]` on any error (missing key, malformed JSON)
    - _Requirements: 6.1, 6.3_

  - [x] 4.2 Implement `saveTransactions(txList)` → `void`
    - Serializes `txList` to JSON and writes to `localStorage` key `"expense_transactions"`; wraps `setItem` in try/catch and logs a console warning on quota errors
    - _Requirements: 6.2, 6.3_

  - [ ]* 4.3 Write property test for localStorage serialization round-trip
    - **Property 6: localStorage serialization round-trip**
    - **Validates: Requirements 6.1, 6.2**

  - [ ]* 4.4 Write property test for transaction addition round-trip (add → save → load)
    - **Property 1: Transaction addition round-trip**
    - **Validates: Requirements 1.2, 1.3, 6.1, 6.2**

- [ ] 5. Checkpoint — Ensure all pure function tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement renderer module
  - [x] 6.1 Implement `renderBalance(total)` → `void`
    - Updates the balance display element with the formatted total
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 6.2 Implement `renderTransactionList(transactions)` → `void`
    - Clears and re-renders the transaction list; each row shows item name, amount, category, and a delete button with a `data-id` attribute
    - _Requirements: 2.1, 2.2, 3.1_

  - [ ]* 6.3 Write property test for transaction list rendering completeness
    - **Property 8: Transaction list rendering completeness**
    - **Validates: Requirements 2.1, 3.1**

  - [x] 6.4 Implement `renderChart(categoryTotals)` → `void`
    - Creates a Chart.js doughnut/pie instance on first call; updates `chart.data` and calls `chart.update()` on subsequent calls
    - Shows a placeholder message when `categoryTotals` is empty (no transactions)
    - Guards against CDN failure by checking `window.Chart` before instantiating
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 6.5 Implement `renderFormErrors(errors)` and `clearFormErrors()` → `void`
    - Injects inline error messages next to each invalid field; clears them on `clearFormErrors`
    - Links error elements via `aria-describedby` for accessibility
    - _Requirements: 1.4, 1.5_

  - [x] 6.6 Implement `resetForm()` → `void`
    - Resets all form fields to their default empty/placeholder state after a successful submission
    - _Requirements: 1.6_

- [x] 7. Wire everything together in app.js
  - [x] 7.1 Bootstrap on `DOMContentLoaded`: load transactions from storage, render balance, list, and chart
    - _Requirements: 2.3, 4.4, 5.4, 6.1_

  - [x] 7.2 Wire form submit handler: validate → build transaction with `crypto.randomUUID()` id → add to state → save → render all → reset form
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 4.2, 5.2_

  - [x] 7.3 Wire delete handler (event delegation on transaction list): remove from state → save → render all
    - _Requirements: 3.2, 3.3, 4.3, 5.3_

- [x] 8. Apply responsive CSS and accessibility attributes
  - Write mobile-first CSS in `css/styles.css`: fluid layout, readable typography, touch-friendly tap targets
  - Add `<label>` elements for all form inputs, `aria-label` on the chart canvas, and `aria-live` on the balance display
  - Verify no horizontal scrolling at 320px viewport width
  - _Requirements: 7.1, 7.2, 7.3, 8.1, 8.2_

- [ ] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## New Feature Tasks

- [x] 10. Custom Categories
  - [x] 10.1 Extend `storage.js` with `loadCustomCategories()` and `saveCustomCategories(categories)` using key `"expense_custom_categories"`
    - Return `[]` on missing key or malformed JSON
    - _Requirements: 11.5, 11.6_

  - [x] 10.2 Add `validateCategoryName(name, existingList)` to `validator.js`
    - Reject blank/whitespace names; reject case-insensitive duplicates against `existingList`
    - Return `{ valid: boolean, error?: string }`
    - _Requirements: 11.3, 11.4_

  - [ ]* 10.3 Write property test for `validateCategoryName` rejecting duplicates
    - **Property 11: validateCategoryName rejects duplicates**
    - **Validates: Requirements 11.3, 11.4**

  - [x] 10.4 Add `renderCategoryOptions(categories)` to `renderer.js`
    - Rebuilds the `<select id="input-category">` options; default categories always listed first
    - _Requirements: 11.1, 11.7_

  - [x] 10.5 Add an "Add Category" mini-form to `index.html` (text input + submit button) with an inline error span
    - _Requirements: 11.1, 11.2_

  - [x] 10.6 Wire the add-category form in `app.js`
    - On submit: validate → add to `customCategories` array → `saveCustomCategories` → `renderCategoryOptions`
    - On `DOMContentLoaded`: `loadCustomCategories` → `renderCategoryOptions([...DEFAULT_CATEGORIES, ...customCategories])`
    - _Requirements: 11.2, 11.5, 11.6_

- [x] 11. Monthly Summary View
  - [x] 11.1 Add `computeMonthlySummary(transactions)` to `state.js`
    - Groups transactions by `YYYY-MM` derived from transaction id timestamp; returns `MonthlySummary[]` sorted descending
    - _Requirements: 12.1, 12.2, 12.5_

  - [ ]* 11.2 Write property test for monthly summary totals equaling balance
    - **Property 9: Monthly summary totals equal balance**
    - **Validates: Requirements 12.1, 12.5**

  - [x] 11.3 Add `renderMonthlySummary(summaries)` to `renderer.js`
    - Renders a `<section>` with one row per month showing month label, total, and per-category breakdown
    - Shows placeholder when `summaries` is empty
    - _Requirements: 12.1, 12.2, 12.4_

  - [x] 11.4 Add a Monthly Summary section to `index.html`
    - _Requirements: 12.1_

  - [x] 11.5 Call `renderMonthlySummary(computeMonthlySummary(state))` inside `renderAll()` in `app.js`
    - _Requirements: 12.3_

- [x] 12. Sort Transactions
  - [x] 12.1 Add `sortTransactions(transactions, criterion, order)` to `state.js`
    - Supports `criterion`: `'default'` | `'amount'` | `'category'`; `order`: `'asc'` | `'desc'`
    - `'default'` returns a copy in reverse-insertion order (most recently added first)
    - Does not mutate the input array
    - _Requirements: 13.1, 13.3, 13.5_

  - [ ]* 12.2 Write property test for `sortTransactions` preserving all transactions
    - **Property 10: sortTransactions preserves all transactions**
    - **Validates: Requirements 13.1, 13.5**

  - [x] 12.3 Add a Sort_Control `<select>` to `index.html` above the transaction list
    - Options: Default, Amount ↑, Amount ↓, Category A–Z, Category Z–A
    - _Requirements: 13.1, 13.3_

  - [x] 12.4 Wire the sort control in `app.js`
    - On change: read criterion/order → `renderTransactionList(sortTransactions(state, ...), spendingLimit)`
    - After add/delete: re-apply current sort before rendering
    - _Requirements: 13.2, 13.4_

- [x] 13. Spending Limit Highlight
  - [x] 13.1 Extend `storage.js` with `loadSpendingLimit()`, `saveSpendingLimit(limit)`, and `clearSpendingLimit()`
    - Key: `"expense_spending_limit"`; return `null` when not set
    - _Requirements: 14.2, 14.3_

  - [x] 13.2 Update `renderBalance(total, spendingLimit)` in `renderer.js`
    - Apply CSS class `balance--over-limit` when `spendingLimit !== null && total > spendingLimit`; remove it otherwise
    - _Requirements: 14.4, 14.6_

  - [x] 13.3 Update `renderTransactionList(transactions, spendingLimit)` in `renderer.js`
    - Apply CSS class `transaction-item--over-limit` to each row where `tx.amount > spendingLimit`
    - _Requirements: 14.5_

  - [ ]* 13.4 Write property test for spending limit highlight consistency
    - **Property 12: Spending limit highlight consistency**
    - **Validates: Requirements 14.4, 14.5, 14.6**

  - [x] 13.5 Add a spending limit input field to `index.html`
    - Numeric input with label "Spending Limit ($)" and a clear button
    - _Requirements: 14.1_

  - [x] 13.6 Wire the spending limit input in `app.js`
    - On change: parse value → `saveSpendingLimit` or `clearSpendingLimit` → re-render balance and list
    - On `DOMContentLoaded`: `loadSpendingLimit` → populate input → pass to `renderAll`
    - _Requirements: 14.2, 14.3, 14.7_

  - [x] 13.7 Add CSS rules for `.balance--over-limit` and `.transaction-item--over-limit` in `styles.css`
    - Use a distinct color (e.g. red/amber) that works in both light and dark themes
    - _Requirements: 14.4, 14.5_

- [x] 14. Dark/Light Mode Toggle
  - [x] 14.1 Extend `storage.js` with `loadTheme()` and `saveTheme(theme)`
    - Key: `"expense_theme"`; return `null` when not set
    - _Requirements: 15.3, 15.4_

  - [x] 14.2 Add `renderTheme(theme)` to `renderer.js`
    - Sets `data-theme="light"` or `data-theme="dark"` on `<html>`
    - _Requirements: 15.2_

  - [x] 14.3 Add dark-theme CSS variables to `styles.css` using `[data-theme="dark"]` selector
    - Override background, text, border, and accent colors; ensure sufficient contrast
    - _Requirements: 15.2, 15.6_

  - [x] 14.4 Add a Theme_Toggle button to `index.html` in the `<header>`
    - Label indicates current mode (e.g. "🌙 Dark" / "☀️ Light"); `aria-label` updated on toggle
    - _Requirements: 15.1_

  - [x] 14.5 Wire the theme toggle in `app.js`
    - On click: flip theme → `saveTheme` → `renderTheme` → update button label
    - On `DOMContentLoaded`: `loadTheme() ?? detectOsTheme()` → `renderTheme` → set button label
    - `detectOsTheme()` reads `window.matchMedia('(prefers-color-scheme: dark)').matches`
    - _Requirements: 15.3, 15.4, 15.5_

- [ ] 15. Final checkpoint — Ensure all tests pass (new features)
  - Run `npx vitest run` and confirm all existing and new tests pass; ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use [fast-check](https://fast-check.io/) with a minimum of 100 iterations each
- Unit tests can use Vitest or plain Node `assert` — no DOM required for pure function tests
- Property 8 (rendering completeness) and Property 12 (spending limit highlight) require a lightweight DOM environment (e.g., jsdom via Vitest)
- All JS modules can be inlined into a single `<script>` block in `index.html` if strict single-file is required (Requirement 10.1)
- The `Transaction.id` is used to derive the transaction's month for the monthly summary; `crypto.randomUUID()` does not encode a timestamp, so `id` should be supplemented with a `createdAt` timestamp field (ISO 8601 string) when implementing Task 11.1, or the monthly summary can use `Date.now()` at insertion time stored as part of the transaction
