# Implementation Plan: Expense & Budget Visualizer

## Overview

Implement a single-page expense tracker using plain HTML, CSS, and Vanilla JavaScript. The app is structured as logical JS modules (state, validator, storage, renderer) wired together in app.js, with Chart.js loaded via CDN. All state is persisted to localStorage on every mutation.

## Tasks

- [ ] 1. Scaffold project files and define core data interfaces
  - Create `index.html` with semantic markup: balance display, input form, transaction list, chart canvas, and CDN script tag for Chart.js 4.x
  - Create `css/styles.css` with mobile-first responsive layout (320px → 1920px)
  - Create `js/state.js`, `js/validator.js`, `js/storage.js`, `js/renderer.js`, `js/app.js` as empty module stubs
  - Define the `Transaction` shape (`id`, `name`, `amount`, `category`) as a JSDoc typedef in `state.js`
  - _Requirements: 1.1, 7.1, 8.2, 10.1, 10.2_

- [ ] 2. Implement state module pure functions
  - [ ] 2.1 Implement `addTransaction(transactions, newTx)` → `Transaction[]`
    - Returns a new array with `newTx` appended; does not mutate the input array
    - _Requirements: 1.2, 2.1_

  - [ ]* 2.2 Write property test for `addTransaction` preserving existing transactions
    - **Property 7: addTransaction preserves existing transactions**
    - **Validates: Requirements 1.2, 2.1**

  - [ ] 2.3 Implement `removeTransaction(transactions, id)` → `Transaction[]`
    - Returns a new array with the matching id filtered out; returns original list unchanged if id not found
    - _Requirements: 3.2, 3.3_

  - [ ]* 2.4 Write property test for `removeTransaction` removing exactly one transaction
    - **Property 3: Delete removes exactly one transaction**
    - **Validates: Requirements 3.2, 3.3**

  - [ ] 2.5 Implement `computeBalance(transactions)` → `number`
    - Returns the arithmetic sum of all `amount` fields; returns `0` for an empty list
    - _Requirements: 4.1, 4.4_

  - [ ]* 2.6 Write property test for `computeBalance` equaling sum of amounts
    - **Property 2: Balance equals sum of amounts**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

  - [ ] 2.7 Implement `computeCategoryTotals(transactions)` → `{ [category: string]: number }`
    - Returns an object mapping each category to the sum of its transaction amounts
    - _Requirements: 5.1_

  - [ ]* 2.8 Write property test for category totals partitioning the balance
    - **Property 4: Category totals partition the balance**
    - **Validates: Requirements 5.1, 5.2, 5.3**

- [ ] 3. Implement validator module
  - [ ] 3.1 Implement `isNonEmpty(value)` → `boolean` and `isValidAmount(value)` → `boolean`
    - `isNonEmpty`: returns `false` for blank or whitespace-only strings
    - `isValidAmount`: returns `false` for non-positive, non-finite, or non-numeric values
    - _Requirements: 1.4, 1.5_

  - [ ] 3.2 Implement `validateForm(name, amount, category)` → `{ valid: boolean, errors: { name?, amount?, category? } }`
    - Returns `{ valid: false }` with per-field error messages when any field is invalid
    - Returns `{ valid: true, errors: {} }` when all fields pass
    - _Requirements: 1.4, 1.5_

  - [ ]* 3.3 Write property test for invalid inputs being rejected
    - **Property 5: Whitespace and empty inputs are rejected**
    - **Validates: Requirements 1.4, 1.5**

- [ ] 4. Implement storage module
  - [ ] 4.1 Implement `loadTransactions()` → `Transaction[]`
    - Reads `"expense_transactions"` from `localStorage`, parses JSON, returns `[]` on any error (missing key, malformed JSON)
    - _Requirements: 6.1, 6.3_

  - [ ] 4.2 Implement `saveTransactions(txList)` → `void`
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

- [ ] 6. Implement renderer module
  - [ ] 6.1 Implement `renderBalance(total)` → `void`
    - Updates the balance display element with the formatted total
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 6.2 Implement `renderTransactionList(transactions)` → `void`
    - Clears and re-renders the transaction list; each row shows item name, amount, category, and a delete button with a `data-id` attribute
    - _Requirements: 2.1, 2.2, 3.1_

  - [ ]* 6.3 Write property test for transaction list rendering completeness
    - **Property 8: Transaction list rendering completeness**
    - **Validates: Requirements 2.1, 3.1**

  - [ ] 6.4 Implement `renderChart(categoryTotals)` → `void`
    - Creates a Chart.js doughnut/pie instance on first call; updates `chart.data` and calls `chart.update()` on subsequent calls
    - Shows a placeholder message when `categoryTotals` is empty (no transactions)
    - Guards against CDN failure by checking `window.Chart` before instantiating
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 6.5 Implement `renderFormErrors(errors)` and `clearFormErrors()` → `void`
    - Injects inline error messages next to each invalid field; clears them on `clearFormErrors`
    - Links error elements via `aria-describedby` for accessibility
    - _Requirements: 1.4, 1.5_

  - [ ] 6.6 Implement `resetForm()` → `void`
    - Resets all form fields to their default empty/placeholder state after a successful submission
    - _Requirements: 1.6_

- [ ] 7. Wire everything together in app.js
  - [ ] 7.1 Bootstrap on `DOMContentLoaded`: load transactions from storage, render balance, list, and chart
    - _Requirements: 2.3, 4.4, 5.4, 6.1_

  - [ ] 7.2 Wire form submit handler: validate → build transaction with `crypto.randomUUID()` id → add to state → save → render all → reset form
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 4.2, 5.2_

  - [ ] 7.3 Wire delete handler (event delegation on transaction list): remove from state → save → render all
    - _Requirements: 3.2, 3.3, 4.3, 5.3_

- [ ] 8. Apply responsive CSS and accessibility attributes
  - Write mobile-first CSS in `css/styles.css`: fluid layout, readable typography, touch-friendly tap targets
  - Add `<label>` elements for all form inputs, `aria-label` on the chart canvas, and `aria-live` on the balance display
  - Verify no horizontal scrolling at 320px viewport width
  - _Requirements: 7.1, 7.2, 7.3, 8.1, 8.2_

- [ ] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use [fast-check](https://fast-check.io/) with a minimum of 100 iterations each
- Unit tests can use Vitest or plain Node `assert` — no DOM required for pure function tests
- Property 8 (rendering completeness) requires a lightweight DOM environment (e.g., jsdom via Vitest)
- All JS modules can be inlined into a single `<script>` block in `index.html` if strict single-file is required (Requirement 10.1)
