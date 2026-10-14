# SpendWise – Interactive Expense Tracker

A responsive expense tracking web application built with HTML5, CSS3, and vanilla JavaScript.

## Features
- Add, edit, and delete expenses
- Categories and date selection
- Search by expense name or category
- Filter by category and date range
- Total expenses, transaction count, and average expense summaries
- Category-wise spending breakdown
- LocalStorage persistence (data stays in the same browser)
- Export filtered expenses as CSV
- Responsive desktop and mobile layout
- Input validation and delete confirmation

## Technologies
- HTML5
- CSS3
- JavaScript (DOM manipulation, events, arrays, objects)
- Browser LocalStorage
- Git and GitHub (for version control and hosting)

## Run locally
1. Download or clone this folder.
2. Open `index.html` in a browser, or use the VS Code **Live Server** extension.
3. Add a sample expense and refresh the page to test LocalStorage.

No backend or paid service is required.

## Suggested test cases
1. Add an expense with a positive amount.
2. Try submitting an empty name or zero amount; validation should stop it.
3. Edit an expense and verify the new value.
4. Delete an expense and confirm the prompt.
5. Search by name and filter by category.
6. Set a date range and verify the list changes.
7. Refresh the browser and confirm records remain.
8. Export CSV and open the downloaded file.

## Data note
Expenses are stored locally in this browser. Clearing browser site data can remove them. This is a frontend academic project, not a secure multi-user finance service.
