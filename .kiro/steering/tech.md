# Tech Stack

## Core
- **HTML5** — single `index.html` entry point
- **CSS3** — mobile-first responsive styles in `css/styles.css`
- **Vanilla JavaScript (ES6+)** — no frameworks, no bundler

## Dependencies
- **Chart.js 4.x** — loaded via CDN only, no local install
  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.5.0/chart.umd.min.js"></script>
  ```

## Testing
- **Vitest** — unit and property-based test runner
- **fast-check** — property-based testing library (min 100 iterations per property)
- **jsdom** — lightweight DOM environment for renderer tests

## Common Commands
```bash
# Run all tests (single pass, no watch)
npx vitest run

# Run a specific test file
npx vitest run tests/state.test.js
```

## Constraints
- No build step — the app must run by opening `index.html` directly in a browser
- No npm dependencies at runtime — Chart.js comes from CDN only
- No transpilation — use only ES6+ features natively supported by modern browsers
