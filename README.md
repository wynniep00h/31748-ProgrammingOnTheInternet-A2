1. Project Title: Spend.bub

2. Project Summary:
A common and leading challenge often found in today's growing economy is managing personal finances as people often lose track of where they spend their money. This is a real concern as we overlook the rapid accumulation of everyday spending across different categories. Which is why this single-page web application: Spend.Bub solves this by providing a clean yet cute, fast interface to log, organise, and review users' spending in real time. Users can add expenses with its title, category (e.g. shopping, food & dining, transport etc) and an optional description. They can edit or delete any entry, filter the logbook by category and date range, and switch to an analytics view to see their spending visualisation by category and monthly expenditure trends. 

3. Technical stack:
![Technical stack](image.png)

4. Feature List:
- Single-page application: can dynamically switch between Logbook and Analytics view without any page reloads
- add expense with its own section of title, category, amount, date, and description
- Edit any existing expense via pre-filled modal form
- Delete expense with confirmation dialog to prevent errors
- logbook expense filter by category and date range 
- Clear filters button that appears only when filters are active
- Summary expenses statistic cards
- Custom category icons 
- responsive layout: adapts to mobile and tablet sizes
- accessibility: contrast styling with abtract text colour and background, alt text for readablity

5. Folder Structure
expense-tracker
├─ client
│  ├─ eslint.config.js
│  ├─ image.png
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ favicon.svg
│  │  └─ icons.svg
│  ├─ src
│  │  ├─ api.js
│  │  ├─ App.jsx
│  │  ├─ assets
│  │  │  └─ icons
│  │  │     ├─ education.png
│  │  │     ├─ entertainment.png
│  │  │     ├─ food.png
│  │  │     ├─ gifts.png
│  │  │     ├─ health.png
│  │  │     ├─ housing.png
│  │  │     ├─ other.png
│  │  │     ├─ publictransport.png
│  │  │     ├─ shopping.png
│  │  │     └─ utilities.png
│  │  ├─ components
│  │  │  ├─ AdminPanel.jsx
│  │  │  ├─ Analytics.jsx
│  │  │  ├─ CategoryBadge.jsx
│  │  │  ├─ ConfirmDialog.jsx
│  │  │  ├─ ExpenseForm.jsx
│  │  │  ├─ Logbook.jsx
│  │  │  ├─ Login.jsx
│  │  │  └─ Register.jsx
│  │  ├─ constants.js
│  │  ├─ index.css
│  │  └─ main.jsx
│  └─ vite.config.js
├─ package-lock.json
├─ package.json
├─ README.md
└─ server
   ├─ index.js
   ├─ middleware
   │  └─ auth.js
   ├─ models
   │  ├─ Activity.js
   │  ├─ Expense.js
   │  └─ User.js
   ├─ package-lock.json
   ├─ package.json
   └─ routes
      ├─ admin.js
      ├─ auth.js
      └─ expenses.js




