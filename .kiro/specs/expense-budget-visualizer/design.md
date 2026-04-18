# Design Document

## Overview

The Expense & Budget Visualizer is a single-page web application (SPA) built with plain HTML, CSS, and Vanilla JavaScript. It requires no build tooling, no backend, and no framework — just a browser. All state is held in memory during a session and persisted to `localStorage` on every mutation.

The app renders four primary UI regions:
- **Balance Display** — running total at the top
- **Input Form** — add new transactions
- **Transaction List** — scrollable history with per-row delete
- **Pie Chart** — spending breakdown by category (powered by Chart.js 4.x via CDN)

Five additional features extend the base app:
- **Custom Categories** — users can define categories beyond Food, Transport, Fun
- **Monthly Summary View** — spending grouped and totalled by calendar month
- **Transaction Sorting** — sort the list by amount or category
- **Spending Limit Highlight** — visual warning when balance or a transaction exceeds a user-defined limit
- **Dark/Light Mode Toggle** — theme switching with OS-preference fallback and localStorage persistence

Key design goals:
- Zero dependencies beyond Chart.js (CDN)
- All business logic in pure, testable functions
- Strict separation between data layer, business logic, and DOM rendering
- Mobile-first responsive layout (320px → 1920px)

---

## Architecture

The app follows a unidirectional data flow pattern:

```
User Action
    │
    ▼
Event Handler (js/app.js)
    │
    ├─► Validator (js/validator.js)   ← pure functions
    │
    ├─► State Mutation (js/state.js)  ← pure functions
    │
    ├─► Storage (js/storage.js)       ← localStorage adapter
    │
    └─► Renderer (js/renderer.js)     ← DOM + Chart.js updates
```

All business logic lives in pure functions with no side effects. The renderer is the only layer that touches the DOM or Chart.js. The storage layer is the only layer that touches `localStorage`.

### File Structure

```
index.html
css/
  styles.css
js/
  app.js        ← entry point, event wiring
  state.js      ← in-memory state + pure mutation helpers
  validator.js  ← input validation pure functions
  storage.js    ← localStorage read/write adapter
  renderer.js   ← DOM rendering + Chart.js management
```

This satisfies Requirement 10.1 (one HTML, one CSS, one JS directory). The requirement says "one JavaScript file" — we interpret this as one JS directory; however, if strict single-file is required, all JS modules can be inlined into `index.html` as a single `<script>` block. The design keeps them logically separated for clarity; the implementation can consolidate if needed.

> **Design Decision**: Splitting JS into logical modules (even if ultimately inlined) makes the pure functions independently testable without a DOM, which is essential for property-based testing.

---

## Components and Interfaces

### State Module (`state.js`)

Holds the canonical in-memory transaction list and exposes pure functions.

```js
// Transaction shape
{
  id: string,        // crypto.randomUUID() or Date.now().toString()
  name: string,      // item name
  amount: number,    // positive float
  category: string   // 'Food' | 'Transport' | 'Fun' | <custom>
}

// Pure functions
addTransaction(transactions, newTx)              → Transaction[]
removeTransaction(transactions, id)              → Transaction[]
computeBalance(transactions)                     → number
computeCategoryTotals(transactions)              → { [category: string]: number }
computeMonthlySummary(transactions)              → MonthlySummary[]
sortTransactions(transactions, criterion, order) → Transaction[]
```

`MonthlySummary` shape:
```js
{
  month: string,                          // 'YYYY-MM'
  label: string,                          // e.g. 'January 2025'
  total: number,
  byCategory: { [category: string]: number }
}
```

`sortTransactions` supports `criterion` values `'amount'` and `'category'`, and `order` values `'asc'` and `'desc'`. Passing `criterion = 'default'` returns the original insertion order (most recently added first).

### Validator Module (`validator.js`)

Pure validation functions — no DOM access.

```js
validateForm(name, amount, category)       → { valid: boolean, errors: { name?, amount?, category? } }
validateCategoryName(name, existingList)   → { valid: boolean, error?: string }
isValidAmount(value)                       → boolean   // positive finite number
isNonEmpty(value)                          → boolean   // non-blank string
```

`validateCategoryName` rejects blank names and case-insensitive duplicates against `existingList`.

### Storage Module (`storage.js`)

Thin adapter over `localStorage`.

```js
STORAGE_KEY           = 'expense_transactions'
CATEGORIES_KEY        = 'expense_custom_categories'
SPENDING_LIMIT_KEY    = 'expense_spending_limit'
THEME_KEY             = 'expense_theme'

loadTransactions()                    → Transaction[]   // parse JSON, return [] on error
saveTransactions(txList)              → void            // JSON.stringify + setItem
loadCustomCategories()                → string[]        // return [] on error
saveCustomCategories(categories)      → void
loadSpendingLimit()                   → number | null   // return null if not set
saveSpendingLimit(limit)              → void
clearSpendingLimit()                  → void
loadTheme()                           → 'light' | 'dark' | null
saveTheme(theme)                      → void
```

### Renderer Module (`renderer.js`)

All DOM mutations and Chart.js interactions live here.

```js
renderTransactionList(transactions, spendingLimit)  → void   // highlights rows exceeding limit
renderBalance(total, spendingLimit)                 → void   // highlights balance when over limit
renderChart(categoryTotals)                         → void   // create or update Chart instance
renderFormErrors(errors)                            → void
clearFormErrors()                                   → void
resetForm()                                         → void
renderCategoryOptions(categories)                   → void   // rebuilds <select> options
renderMonthlySummary(summaries)                     → void   // renders Monthly_Summary_View
renderTheme(theme)                                  → void   // toggles data-theme attribute on <html>
```

### App Entry Point (`app.js`)

Wires events to the pipeline:

```js
// On DOMContentLoaded
state = loadTransactions()
customCategories = loadCustomCategories()
spendingLimit = loadSpendingLimit()
theme = loadTheme() ?? detectOsTheme()
renderTheme(theme)
renderCategoryOptions([...DEFAULT_CATEGORIES, ...customCategories])
renderAll(state, spendingLimit)

// On form submit
errors = validateForm(...)
if errors → renderFormErrors(errors); return
tx = buildTransaction(...)
state = addTransaction(state, tx)
saveTransactions(state)
renderAll(state, spendingLimit)
resetForm()

// On delete click
state = removeTransaction(state, id)
saveTransactions(state)
renderAll(state, spendingLimit)

// On add-category submit
result = validateCategoryName(name, customCategories)
if !result.valid → show error; return
customCategories = [...customCategories, name]
saveCustomCategories(customCategories)
renderCategoryOptions([...DEFAULT_CATEGORIES, ...customCategories])

// On sort change
sortCriterion = event.target.value   // 'default' | 'amount-asc' | 'amount-desc' | 'category-asc' | 'category-desc'
renderTransactionList(sortTransactions(state, ...), spendingLimit)

// On spending-limit change
spendingLimit = parseFloat(input.value) || null
if spendingLimit → saveSpendingLimit(spendingLimit)
else → clearSpendingLimit()
renderBalance(computeBalance(state), spendingLimit)
renderTransactionList(state, spendingLimit)

// On theme toggle
theme = theme === 'light' ? 'dark' : 'light'
saveTheme(theme)
renderTheme(theme)
```

### Chart.js Integration

Chart.js 4.x is loaded via CDN:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.5.0/chart.umd.min.js"></script>
```

A single `Chart` instance is created on first render and updated via `chart.data.datasets[0].data = ...` + `chart.update()` on subsequent renders. When there are no transactions, the canvas shows a placeholder message rendered via the Chart.js `plugins.emptyDoughnut` pattern or a simple overlay `<p>` element.

---

## Data Models

### Transaction

```ts
interface Transaction {
  id: string;        // unique identifier
  name: string;      // non-empty item description
  amount: number;    // positive finite number (e.g. 12.50)
  category: string;  // 'Food' | 'Transport' | 'Fun' | <custom>
}
```

### AppState (in-memory)

```ts
type AppState = Transaction[];
```

### LocalStorage Schema

Key: `"expense_transactions"` — JSON-serialized `Transaction[]`

```json
[
  { "id": "1720000000000", "name": "Coffee", "amount": 3.50, "category": "Food" },
  { "id": "1720000001000", "name": "Bus fare", "amount": 2.00, "category": "Transport" }
]
```

Key: `"expense_custom_categories"` — JSON-serialized `string[]`

```json
["Groceries", "Healthcare"]
```

Key: `"expense_spending_limit"` — JSON-serialized `number` (absent when no limit is set)

```json
200
```

Key: `"expense_theme"` — `"light"` or `"dark"` (absent when no preference has been saved)

```json
"dark"
```

### Category Totals (derived)

```ts
interface CategoryTotals {
  [category: string]: number;  // sum of amounts per category
}
```

Always derived from `AppState` — never stored independently.

### Monthly Summary (derived)

```ts
interface MonthlySummary {
  month: string;                          // 'YYYY-MM'
  label: string;                          // e.g. 'January 2025'
  total: number;
  byCategory: { [category: string]: number };
}
```

Always derived from `AppState` — never stored independently. Months are sorted descending (most recent first).

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Transaction addition round-trip

*For any* valid transaction added to the app state and then saved to localStorage, loading from localStorage should return a list that contains a transaction with the same name, amount, and category.

**Validates: Requirements 1.2, 1.3, 6.1, 6.2**

---

### Property 2: Balance equals sum of amounts

*For any* list of transactions, `computeBalance` should return a value equal to the arithmetic sum of all transaction amounts.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

---

### Property 3: Delete removes exactly one transaction

*For any* non-empty transaction list and any transaction id present in that list, calling `removeTransaction` should return a list that is exactly one element shorter and does not contain the removed id.

**Validates: Requirements 3.2, 3.3**

---

### Property 4: Category totals partition the balance

*For any* list of transactions, the sum of all values in `computeCategoryTotals` should equal `computeBalance` for the same list.

**Validates: Requirements 5.1, 5.2, 5.3**

---

### Property 5: Whitespace and empty inputs are rejected

*For any* form submission where the name field is blank or composed entirely of whitespace, or the amount is not a positive finite number, `validateForm` should return `{ valid: false }` and the transaction list should remain unchanged.

**Validates: Requirements 1.4, 1.5**

---

### Property 6: localStorage serialization round-trip

*For any* list of transactions, serializing with `saveTransactions` and then deserializing with `loadTransactions` should produce a list that is deeply equal to the original.

**Validates: Requirements 6.1, 6.2**

---

### Property 7: addTransaction preserves existing transactions

*For any* existing transaction list and any new valid transaction, `addTransaction` should return a list where all original transactions are still present (by id) in addition to the new one.

**Validates: Requirements 1.2, 2.1**

---

### Property 8: Transaction list rendering completeness

*For any* non-empty list of transactions, the rendered transaction list should contain — for each transaction — its item name, amount, category, and a delete control.

**Validates: Requirements 2.1, 3.1**

---

### Property 9: Monthly summary totals equal balance

*For any* list of transactions, the sum of all `MonthlySummary.total` values returned by `computeMonthlySummary` should equal `computeBalance` for the same list.

**Validates: Requirements 12.1, 12.5**

---

### Property 10: sortTransactions preserves all transactions

*For any* list of transactions and any valid sort criterion and order, `sortTransactions` should return a list that contains exactly the same transaction ids as the input list (no additions, no removals, no duplicates).

**Validates: Requirements 13.1, 13.5**

---

### Property 11: validateCategoryName rejects duplicates

*For any* non-empty list of existing category names and any new name that matches an existing name (case-insensitive), `validateCategoryName` should return `{ valid: false }`.

**Validates: Requirements 11.3, 11.4**

---

### Property 12: Spending limit highlight consistency

*For any* list of transactions and any positive spending limit, every transaction row whose amount exceeds the limit should be marked as over-budget, and the balance display should be marked as over-budget if and only if `computeBalance` exceeds the limit.

**Validates: Requirements 14.4, 14.5, 14.6**

---

## Error Handling

| Scenario | Handling |
|---|---|
| Empty name field | Validator returns `errors.name`; inline error shown; form not submitted |
| Non-positive or non-numeric amount | Validator returns `errors.amount`; inline error shown; form not submitted |
| No category selected | Validator returns `errors.category`; inline error shown; form not submitted |
| Blank custom category name | `validateCategoryName` returns error; inline error shown; category not added |
| Duplicate custom category name | `validateCategoryName` returns error (case-insensitive); inline error shown; category not added |
| `localStorage` parse error on load | `loadTransactions` / `loadCustomCategories` catch JSON parse exception, return `[]`; app starts fresh |
| `localStorage` quota exceeded on save | All `save*` functions wrap `setItem` in try/catch; log warning to console; in-memory state remains valid |
| Chart.js not loaded (CDN failure) | `renderChart` checks for `window.Chart` before instantiating; shows static text fallback if unavailable |
| Delete on non-existent id | `removeTransaction` returns the original list unchanged (no-op) |
| Invalid spending limit input | Treated as "no limit" — highlights cleared, persisted value removed |
| No persisted theme preference | `prefers-color-scheme` media query used as fallback |

---

## Testing Strategy

### Unit Tests (example-based)

Target the pure functions in `validator.js`, `state.js`, and `storage.js` using a lightweight test runner (e.g., [Vitest](https://vitest.dev/) or plain Node `assert`).

Focus areas:
- Specific valid/invalid form inputs
- Edge cases: amount = 0, amount = negative, amount = NaN, name = "   "
- `loadTransactions` with malformed JSON in localStorage
- `computeBalance` with an empty list (should return 0)
- `renderChart` with no transactions (placeholder state)

### Property-Based Tests

Use [fast-check](https://fast-check.io/) (JavaScript PBT library) to verify the correctness properties above. Each property test runs a minimum of **100 iterations**.

Tag format for each test: `Feature: expense-budget-visualizer, Property {N}: {property_text}`

| Property | Test Strategy |
|---|---|
| P1: Transaction addition round-trip | Generate random `{name, amount, category}` tuples; add → save → load; assert presence |
| P2: Balance equals sum | Generate arbitrary `Transaction[]`; compare `computeBalance` to `arr.reduce((s,t) => s+t.amount, 0)` |
| P3: Delete removes exactly one | Generate non-empty `Transaction[]`; pick random id; assert length and absence |
| P4: Category totals partition balance | Generate arbitrary `Transaction[]`; assert `sum(Object.values(totals)) === computeBalance(list)` |
| P5: Invalid inputs rejected | Generate blank/whitespace names and non-positive amounts; assert `valid === false` |
| P6: localStorage round-trip | Generate arbitrary `Transaction[]`; save → load; assert deep equality |
| P7: addTransaction preserves existing | Generate list + new tx; assert all original ids still present |
| P8: Transaction list rendering completeness | Generate random `Transaction[]`; render list; assert each row contains name, amount, category, and delete control |
| P9: Monthly summary totals equal balance | Generate arbitrary `Transaction[]`; assert `sum(summaries.map(s => s.total)) === computeBalance(list)` |
| P10: sortTransactions preserves all transactions | Generate `Transaction[]` + random criterion/order; assert sorted ids match original ids (same set) |
| P11: validateCategoryName rejects duplicates | Generate non-empty category list + duplicate name (case-insensitive variants); assert `valid === false` |
| P12: Spending limit highlight consistency | Generate `Transaction[]` + positive limit; assert highlight flags match `amount > limit` and `balance > limit` |

### Integration / Smoke Tests

- Load `index.html` in a headless browser (e.g., Playwright); verify Chart.js renders without errors
- Verify `localStorage` key is written after form submission
- Verify the app loads correctly with pre-seeded `localStorage` data

### Accessibility

- All form inputs have associated `<label>` elements
- Error messages are linked via `aria-describedby`
- Chart canvas has a descriptive `aria-label`
- Color contrast meets WCAG AA guidelines (manual review required)
