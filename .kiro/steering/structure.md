# Project Structure

```
index.html          ← single HTML entry point
css/
  styles.css        ← all styles, mobile-first
js/
  app.js            ← entry point; wires DOM events to the pipeline
  state.js          ← in-memory state + pure mutation helpers (addTransaction, removeTransaction, computeBalance, computeCategoryTotals)
  validator.js      ← pure input validation (validateForm, isNonEmpty, isValidAmount)
  storage.js        ← localStorage adapter (loadTransactions, saveTransactions); key: "expense_transactions"
  renderer.js       ← all DOM writes and Chart.js management (renderBalance, renderTransactionList, renderChart, renderFormErrors, clearFormErrors, resetForm)
tests/              ← Vitest + fast-check test files (pure functions; renderer tests use jsdom)
.kiro/
  specs/            ← spec documents (requirements, design, tasks)
  steering/         ← AI steering rules
```

## Architecture Rules
- Unidirectional data flow: Event Handler → Validator → State → Storage → Renderer
- `renderer.js` is the only file that touches the DOM or Chart.js
- `storage.js` is the only file that touches `localStorage`
- All business logic (`state.js`, `validator.js`) must be pure functions with no side effects — this keeps them independently testable without a DOM
- A single Chart.js instance is created once and updated in-place via `chart.update()`

## Data
- `Transaction` shape: `{ id: string, name: string, amount: number, category: 'Food'|'Transport'|'Fun' }`
- `AppState` is simply `Transaction[]` held in memory
- `localStorage` key: `"expense_transactions"` — stores JSON-serialized `Transaction[]`
- `CategoryTotals` (`{ [category]: number }`) is always derived, never stored
