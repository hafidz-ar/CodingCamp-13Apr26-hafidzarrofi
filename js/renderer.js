/**
 * @fileoverview DOM rendering and Chart.js management.
 * This is the only file that touches the DOM or Chart.js.
 */

/** @type {import('chart.js').Chart | null} */
let chartInstance = null;

/**
 * Updates the balance display element with the formatted total.
 * Applies balance--over-limit class when total exceeds spendingLimit.
 * @param {number} total
 * @param {number | null} [spendingLimit]
 * @returns {void}
 */
export function renderBalance(total, spendingLimit = null) {
  const el = document.getElementById('balance-display');
  if (!el) return;
  if (spendingLimit !== null && total > spendingLimit) {
    el.classList.add('balance--over-limit');
  } else {
    el.classList.remove('balance--over-limit');
  }
  el.textContent = '$' + total.toFixed(2);
}

/**
 * Clears and re-renders the transaction list.
 * Each row shows item name, category, amount, and a delete button with a data-id attribute.
 * Applies transaction-item--over-limit class to rows where tx.amount > spendingLimit.
 * @param {import('./state.js').Transaction[]} transactions
 * @param {number | null} [spendingLimit]
 * @returns {void}
 */
export function renderTransactionList(transactions, spendingLimit = null) {
  const list = document.getElementById('transaction-list');
  if (!list) return;

  list.innerHTML = '';

  if (transactions.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'transaction-empty';
    empty.textContent = 'No transactions yet.';
    list.appendChild(empty);
    return;
  }

  for (const tx of transactions) {
    const li = document.createElement('li');
    li.className = 'transaction-item';
    if (spendingLimit !== null && tx.amount > spendingLimit) {
      li.classList.add('transaction-item--over-limit');
    }

    const info = document.createElement('div');
    info.className = 'transaction-info';

    const name = document.createElement('span');
    name.className = 'transaction-name';
    name.textContent = tx.name;

    const meta = document.createElement('span');
    meta.className = 'transaction-meta';
    meta.textContent = tx.category;

    info.appendChild(name);
    info.appendChild(meta);

    const amount = document.createElement('span');
    amount.className = 'transaction-amount';
    amount.textContent = '$' + tx.amount.toFixed(2);

    const btn = document.createElement('button');
    btn.className = 'btn-delete';
    btn.setAttribute('data-id', tx.id);
    btn.setAttribute('aria-label', 'Delete ' + tx.name);
    btn.textContent = 'Delete';

    li.appendChild(info);
    li.appendChild(amount);
    li.appendChild(btn);
    list.appendChild(li);
  }
}

/**
 * Creates a Chart.js pie/doughnut instance on first call.
 * Updates chart.data and calls chart.update() on subsequent calls.
 * Shows a placeholder when categoryTotals is empty.
 * Guards against CDN failure by checking window.Chart.
 * @param {{ [category: string]: number }} categoryTotals
 * @returns {void}
 */
export function renderChart(categoryTotals) {
  const placeholder = document.getElementById('chart-placeholder');
  const canvas = document.getElementById('spending-chart');

  const isEmpty = Object.keys(categoryTotals).length === 0;

  if (placeholder) placeholder.style.display = isEmpty ? 'block' : 'none';
  if (canvas) canvas.style.display = isEmpty ? 'none' : 'block';

  if (isEmpty) {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  if (!window.Chart) {
    if (placeholder) {
      placeholder.textContent = 'Chart unavailable (Chart.js failed to load).';
      placeholder.style.display = 'block';
    }
    if (canvas) canvas.style.display = 'none';
    return;
  }

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);
  const colors = { Food: '#f97316', Transport: '#3b82f6', Fun: '#a855f7' };
  const backgroundColors = labels.map(l => colors[l] ?? '#6b7280');

  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.data.datasets[0].backgroundColor = backgroundColors;
    chartInstance.update();
  } else {
    chartInstance = new window.Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: backgroundColors, borderWidth: 2 }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: ctx => ' $' + ctx.parsed.toFixed(2),
            },
          },
        },
      },
    });
  }
}

/**
 * Injects inline error messages next to each invalid field.
 * Links error elements via aria-describedby for accessibility.
 * @param {{ name?: string, amount?: string, category?: string }} errors
 * @returns {void}
 */
export function renderFormErrors(errors) {
  const fields = ['name', 'amount', 'category'];
  for (const field of fields) {
    const span = document.getElementById('error-' + field);
    const input = document.getElementById('input-' + field);
    if (!span) continue;
    if (errors[field]) {
      span.textContent = errors[field];
      if (input) input.setAttribute('aria-invalid', 'true');
    } else {
      span.textContent = '';
      if (input) input.removeAttribute('aria-invalid');
    }
  }
}

/**
 * Clears all inline form error messages.
 * @returns {void}
 */
export function clearFormErrors() {
  renderFormErrors({});
}

/**
 * Resets all form fields to their default empty/placeholder state.
 * @returns {void}
 */
export function resetForm() {
  const form = document.getElementById('transaction-form');
  if (form) form.reset();
}

/**
 * Rebuilds the <select id="input-category"> options from the given list.
 * The first option is always the placeholder; categories are added in order.
 * @param {string[]} categories
 * @returns {void}
 */
export function renderCategoryOptions(categories) {
  const select = document.getElementById('input-category');
  if (!select) return;

  const currentValue = select.value;
  select.innerHTML = '<option value="">-- Select category --</option>';

  for (const cat of categories) {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  }

  // Restore selection if it still exists
  if (currentValue && categories.includes(currentValue)) {
    select.value = currentValue;
  }
}

/**
 * Sets data-theme="light" or data-theme="dark" on the <html> element.
 * @param {'light' | 'dark'} theme
 * @returns {void}
 */
export function renderTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Renders the monthly summary into <section id="monthly-summary">.
 * Shows one row per month with label, total, and per-category breakdown.
 * Shows a placeholder when summaries is empty.
 * @param {import('./state.js').MonthlySummary[]} summaries
 * @returns {void}
 */
export function renderMonthlySummary(summaries) {
  const section = document.getElementById('monthly-summary');
  if (!section) return;

  section.innerHTML = '';

  if (summaries.length === 0) {
    const p = document.createElement('p');
    p.className = 'monthly-summary-empty';
    p.textContent = 'No transactions yet.';
    section.appendChild(p);
    return;
  }

  for (const summary of summaries) {
    const row = document.createElement('div');
    row.className = 'monthly-summary-row';

    const header = document.createElement('div');
    header.className = 'monthly-summary-header';

    const label = document.createElement('span');
    label.className = 'monthly-summary-label';
    label.textContent = summary.label;

    const total = document.createElement('span');
    total.className = 'monthly-summary-total';
    total.textContent = '$' + summary.total.toFixed(2);

    header.appendChild(label);
    header.appendChild(total);
    row.appendChild(header);

    const breakdown = document.createElement('ul');
    breakdown.className = 'monthly-summary-breakdown';

    for (const [cat, amt] of Object.entries(summary.byCategory)) {
      const item = document.createElement('li');
      item.textContent = `${cat}: $${amt.toFixed(2)}`;
      breakdown.appendChild(item);
    }

    row.appendChild(breakdown);
    section.appendChild(row);
  }
}
