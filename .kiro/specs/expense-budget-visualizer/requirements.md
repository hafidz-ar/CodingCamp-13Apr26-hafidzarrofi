# Requirements Document

## Introduction

A mobile-friendly, standalone web application that helps users track daily spending. The app displays a running total balance, a scrollable transaction history, and a pie chart visualizing spending by category. It is built as a single HTML page using HTML, CSS, and Vanilla JavaScript with no backend — all data is persisted in the browser's Local Storage.

This document covers the base application (Requirements 1–10) and five additional features: custom categories (11), monthly summary view (12), transaction sorting (13), spending limit highlights (14), and dark/light mode toggle (15).

## Glossary

- **App**: The Expense & Budget Visualizer single-page web application.
- **Transaction**: A single spending record consisting of an item name, a monetary amount, and a category.
- **Transaction_List**: The scrollable UI component that displays all recorded transactions.
- **Input_Form**: The UI form component used to create new transactions.
- **Balance_Display**: The UI component at the top of the page that shows the current total balance.
- **Chart**: The pie chart UI component that visualizes spending distribution by category.
- **Category**: A label assigned to a transaction. Default categories are Food, Transport, and Fun. Users may also define Custom_Categories.
- **Custom_Category**: A user-defined category name stored alongside the default categories.
- **Category_Manager**: The client-side logic responsible for managing the list of available categories (default + custom).
- **Monthly_Summary**: A derived view that groups and totals transactions by calendar month (YYYY-MM).
- **Monthly_Summary_View**: The UI component that displays the Monthly_Summary table or list.
- **Sort_Control**: The UI control that allows the user to select a sort criterion and order for the Transaction_List.
- **Spending_Limit**: A user-defined monetary threshold above which spending is considered over-budget.
- **Theme**: The visual color scheme of the App, either light or dark.
- **Theme_Toggle**: The UI control that switches the App between light and dark Theme.
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

---

### Requirement 11: Custom Categories

**User Story:** As a user, I want to add my own spending categories beyond the defaults, so that I can organize transactions in a way that fits my lifestyle.

#### Acceptance Criteria

1. THE Input_Form SHALL provide a text field that allows the user to enter a new Custom_Category name.
2. WHEN the user submits a non-empty Custom_Category name, THE Category_Manager SHALL add that name to the list of available categories and make it selectable in the Input_Form dropdown.
3. IF the user submits a Custom_Category name that is empty or composed entirely of whitespace, THEN THE Validator SHALL display an inline error message and prevent the category from being added.
4. IF the user submits a Custom_Category name that already exists (case-insensitive match), THEN THE Category_Manager SHALL display an inline error message and prevent a duplicate from being added.
5. WHEN a Custom_Category is added, THE App SHALL persist the updated category list to Local_Storage under a dedicated key so that custom categories survive page reloads.
6. WHEN the App loads, THE Category_Manager SHALL restore all previously persisted Custom_Categories and include them in the Input_Form dropdown alongside the default categories.
7. THE Input_Form dropdown SHALL always list the three default categories (Food, Transport, Fun) before any Custom_Categories.

---

### Requirement 12: Monthly Summary View

**User Story:** As a user, I want to see my spending summarized by month, so that I can understand my spending trends over time.

#### Acceptance Criteria

1. THE Monthly_Summary_View SHALL display one row per calendar month that contains at least one transaction, showing the month label (e.g. "January 2025"), the total amount spent that month, and a per-category breakdown for that month.
2. THE Monthly_Summary_View SHALL list months in descending chronological order (most recent month first).
3. WHEN a transaction is added or deleted, THE Monthly_Summary_View SHALL update automatically to reflect the change without requiring a page reload.
4. WHEN the App loads with no transactions, THE Monthly_Summary_View SHALL display a placeholder message indicating that no data is available.
5. THE App SHALL derive the Monthly_Summary from the in-memory transaction list and SHALL NOT store it separately in Local_Storage.

---

### Requirement 13: Sort Transactions

**User Story:** As a user, I want to sort my transaction list by amount or category, so that I can quickly find and review specific transactions.

#### Acceptance Criteria

1. THE Sort_Control SHALL provide options to sort the Transaction_List by amount (ascending and descending) and by category (A–Z and Z–A).
2. WHEN the user selects a sort option, THE Transaction_List SHALL re-render in the selected order without requiring a page reload.
3. THE Sort_Control SHALL include an option to restore the default insertion order (most recently added first).
4. WHEN a new transaction is added while a sort option is active, THE Transaction_List SHALL re-render in the currently selected sort order.
5. THE App SHALL derive the sorted list from the in-memory transaction list; the sort order SHALL NOT affect the order in which transactions are persisted to Local_Storage.

---

### Requirement 14: Spending Limit Highlight

**User Story:** As a user, I want to define a spending limit and see when I have exceeded it, so that I can stay within my budget.

#### Acceptance Criteria

1. THE App SHALL provide a numeric input field where the user can enter a Spending_Limit value.
2. WHEN the user sets a Spending_Limit, THE App SHALL persist the value to Local_Storage so that it survives page reloads.
3. WHEN the App loads, THE App SHALL restore the previously persisted Spending_Limit, if any.
4. WHILE a Spending_Limit is set and the total balance exceeds the Spending_Limit, THE Balance_Display SHALL apply a visual highlight (e.g. a distinct color or warning indicator) to indicate the over-budget state.
5. WHILE a Spending_Limit is set and an individual transaction's amount exceeds the Spending_Limit, THE Transaction_List SHALL apply a visual highlight to that transaction row to indicate it individually exceeds the limit.
6. WHEN the total balance returns to or below the Spending_Limit (e.g. after a transaction is deleted), THE Balance_Display SHALL remove the over-budget highlight.
7. IF the user clears the Spending_Limit field, THEN THE App SHALL remove all spending-limit highlights and delete the persisted Spending_Limit from Local_Storage.

---

### Requirement 15: Dark/Light Mode Toggle

**User Story:** As a user, I want to switch between dark and light mode, so that I can use the app comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE App SHALL provide a Theme_Toggle control that switches the App between a light Theme and a dark Theme.
2. WHEN the user activates the Theme_Toggle, THE App SHALL apply the selected Theme to all visible UI components without requiring a page reload.
3. WHEN the user activates the Theme_Toggle, THE App SHALL persist the selected Theme preference to Local_Storage so that it survives page reloads.
4. WHEN the App loads, THE App SHALL restore the previously persisted Theme preference, if any.
5. IF no Theme preference has been persisted, THEN THE App SHALL apply the Theme that matches the user's operating system preference (via the `prefers-color-scheme` media query).
6. THE dark Theme SHALL provide sufficient contrast between text and background colors to remain legible.
