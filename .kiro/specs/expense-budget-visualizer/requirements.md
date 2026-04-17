# Requirements Document

## Introduction

A mobile-friendly, standalone web application that helps users track daily spending. The app displays a running total balance, a scrollable transaction history, and a pie chart visualizing spending by category. It is built as a single HTML page using HTML, CSS, and Vanilla JavaScript with no backend — all data is persisted in the browser's Local Storage.

## Glossary

- **App**: The Expense & Budget Visualizer single-page web application.
- **Transaction**: A single spending record consisting of an item name, a monetary amount, and a category.
- **Transaction_List**: The scrollable UI component that displays all recorded transactions.
- **Input_Form**: The UI form component used to create new transactions.
- **Balance_Display**: The UI component at the top of the page that shows the current total balance.
- **Chart**: The pie chart UI component that visualizes spending distribution by category.
- **Category**: A label assigned to a transaction. Default categories are Food, Transport, and Fun.
- **Local_Storage**: The browser's Web Storage API used to persist transaction data client-side.
- **Validator**: The client-side logic responsible for checking form input correctness before submission.

---

## Requirements

### Requirement 1: Add a Transaction

**User Story:** As a user, I want to fill in a form with an item name, amount, and category, so that I can record a new spending transaction.

#### Acceptance Criteria

1. THE Input_Form SHALL provide a text field for item name, a numeric field for amount, and a dropdown selector for category (Food, Transport, Fun).
2. WHEN the user submits the Input_Form with all fields filled and a valid positive amount, THE App SHALL add the transaction to the Transaction_List.
3. WHEN the user submits the Input_Form with all fields filled and a valid positive amount, THE App SHALL persist the new transaction to Local_Storage.
4. IF the user submits the Input_Form with one or more empty fields, THEN THE Validator SHALL display an inline error message identifying the missing field(s) and prevent the transaction from being added.
5. IF the user submits the Input_Form with an amount that is not a positive number, THEN THE Validator SHALL display an inline error message and prevent the transaction from being added.
6. WHEN a transaction is successfully added, THE Input_Form SHALL reset all fields to their default empty/placeholder state.

---

### Requirement 2: View Transaction List

**User Story:** As a user, I want to see a scrollable list of all my transactions, so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display each transaction's item name, amount, and category.
2. THE Transaction_List SHALL be scrollable when the number of transactions exceeds the visible area.
3. WHEN the App loads, THE Transaction_List SHALL render all transactions previously persisted in Local_Storage.

---

### Requirement 3: Delete a Transaction

**User Story:** As a user, I want to delete a transaction from the list, so that I can correct mistakes or remove unwanted entries.

#### Acceptance Criteria

1. THE Transaction_List SHALL display a delete control for each transaction.
2. WHEN the user activates the delete control for a transaction, THE App SHALL remove that transaction from the Transaction_List.
3. WHEN the user activates the delete control for a transaction, THE App SHALL remove that transaction from Local_Storage.

---

### Requirement 4: Display Total Balance

**User Story:** As a user, I want to see my total spending balance at the top of the page, so that I always know how much I have spent in total.

#### Acceptance Criteria

1. THE Balance_Display SHALL show the sum of all transaction amounts.
2. WHEN a transaction is added, THE Balance_Display SHALL update to reflect the new total without requiring a page reload.
3. WHEN a transaction is deleted, THE Balance_Display SHALL update to reflect the new total without requiring a page reload.
4. WHEN the App loads with no transactions, THE Balance_Display SHALL show a total of 0.

---

### Requirement 5: Visualize Spending by Category

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand where my money is going.

#### Acceptance Criteria

1. THE Chart SHALL display a pie chart showing the proportion of total spending for each category that has at least one transaction.
2. WHEN a transaction is added, THE Chart SHALL update automatically to reflect the new spending distribution.
3. WHEN a transaction is deleted, THE Chart SHALL update automatically to reflect the new spending distribution.
4. WHEN the App loads with no transactions, THE Chart SHALL display an empty or placeholder state.

---

### Requirement 6: Data Persistence

**User Story:** As a user, I want my transactions to be saved between sessions, so that I do not lose my data when I close or refresh the browser.

#### Acceptance Criteria

1. WHEN the App loads, THE App SHALL read all previously stored transactions from Local_Storage and restore the full application state (Transaction_List, Balance_Display, and Chart).
2. WHEN a transaction is added or deleted, THE App SHALL synchronously write the updated transaction list to Local_Storage.
3. THE App SHALL store all data client-side only, with no data transmitted to any external server.

---

### Requirement 7: Mobile-Friendly Layout

**User Story:** As a user, I want the app to work well on my phone, so that I can track spending on the go.

#### Acceptance Criteria

1. THE App SHALL use a responsive layout that adapts to screen widths from 320px to 1920px.
2. THE App SHALL be usable on modern mobile browsers (Chrome for Android, Safari for iOS) without horizontal scrolling.
3. THE Input_Form, Transaction_List, Balance_Display, and Chart SHALL remain legible and interactive at mobile viewport sizes.

---

### Requirement 8: Browser Compatibility

**User Story:** As a developer, I want the app to work across modern browsers, so that users are not restricted to a single browser.

#### Acceptance Criteria

1. THE App SHALL function correctly in the latest stable versions of Chrome, Firefox, Edge, and Safari.
2. THE App SHALL use only standard HTML5, CSS3, and ES6+ JavaScript features supported by the browsers listed in criterion 1.
3. THE App SHALL require no browser plugins, extensions, or build tools to run.

---

### Requirement 9: Performance

**User Story:** As a user, I want the app to load and respond quickly, so that using it feels smooth and effortless.

#### Acceptance Criteria

1. WHEN the App is opened in a browser, THE App SHALL render the initial UI within 2 seconds on a standard broadband connection.
2. WHEN the user adds or deletes a transaction, THE App SHALL update the Transaction_List, Balance_Display, and Chart within 100ms.

---

### Requirement 10: Code and File Structure

**User Story:** As a developer, I want the codebase to follow a clean file structure, so that the project is easy to maintain.

#### Acceptance Criteria

1. THE App SHALL consist of exactly one HTML file, one CSS file located in a `css/` directory, and one JavaScript file located in a `js/` directory.
2. THE App SHALL load the Chart.js library via a CDN script tag, with no local build tooling required.
