# Personal Finance App

This app helps users track their finances, set budgets, and achieve financial goals. The development is planned in three phases, starting with essential features and gradually adding more advanced insights.

---

## Phase 1: Core Features (MVP – Must-Have)

These are essential for users to start tracking their finances.

### 1. Income & Expense Tracking

- Add, edit, delete transactions
- Categorize transactions (Food, Rent, Entertainment, etc.)
- Mark transactions as recurring
- summery of transaction

### 2. Dashboard / Overview

- Total income vs expenses
- Monthly spending overview
- Quick insights (e.g., “You spent 30% more on food”)

### 3. Budgeting

- Set monthly budgets per category
- Alerts when nearing budget limits

**Suggestions:**

- Show visual indicators for remaining budget per category

---

## Phase 2: Savings & Goals

These features add meaningful value beyond simple tracking.

### 4. Savings Goals

- Create financial goals (e.g., vacation, emergency fund)
- Track progress toward goals
- Emergency fund tracker

**Suggestions:**

- Allow setting automatic contributions to savings goals
- Include a priority level for each goal (optional)

---

## Phase 3: Reports & Insights

Generate insights that help users plan better.

### 5. Financial Insights & Reports

- Monthly spending report
- Monthly budget vs actual
- Half-yearly and yearly summary
- Export data as PDF / CSV

**Suggestions:**

- Include category-based visual reports (pie chart per category, bar chart per month)
- Highlight top 3 spending categories for user awareness

---

---

# 📊 Personal Finance App - Database Schema

This document describes the core database tables for the Personal Finance App, including their columns, types, and relationships.

---

## 1. Users Table

Tracks app users.  
_(Basic structure assumed, details not included in this document)_

---

## 2. Transactions Table

Tracks income and expenses.

| Column Name        | Type             | Description                            |
| ------------------ | ---------------- | -------------------------------------- |
| id                 | UUID / int       | Primary key                            |
| user_id            | UUID / int       | Foreign key → Users                    |
| type               | enum             | 'income' or 'expense'                  |
| category           | enum / varchar   | Food, Rent, Entertainment, etc.        |
| amount             | decimal          | Transaction amount                     |
| date               | date / timestamp | Transaction date                       |
| description        | text             | Optional notes                         |
| recurring          | boolean          | True if recurring                      |
| recurring_interval | enum             | 'daily', 'weekly', 'monthly', 'yearly' |
| created_at         | timestamp        | Record creation                        |
| updated_at         | timestamp        | Record update                          |

### 📝 Enum Notes

- **type**
  - `income`
  - `expense`

- **category**
  - **Income categories**
    - `salary`
    - `freelance`
    - `business`
    - `investment`
    - `rental_income`
    - `gift`
    - `refund`
    - `other_income`
  - **Expense categories**
    - `food_groceries`
    - `food_dining`
    - `housing_rent`
    - `housing_mortgage`
    - `utilities`
    - `transportation`
    - `health_medical`
    - `education`
    - `entertainment`
    - `shopping`
    - `travel`
    - `personal_care`
    - `insurance`
    - `debt_repayment`
    - `savings_investments`
    - `charity_donation`
    - `other_expense`

- **recurring_interval**
  - `daily`
  - `weekly`
  - `monthly`
  - `yearly`

---

## 3. Budgets Table

Tracks monthly budgets per category.

| Column Name | Type           | Description                     |
| ----------- | -------------- | ------------------------------- |
| id          | UUID / int     | Primary key                     |
| user_id     | UUID / int     | Foreign key → Users             |
| category    | enum / varchar | Food, Rent, Entertainment, etc. |
| amount      | decimal        | Budgeted amount                 |
| month       | int            | 1-12                            |
| year        | int            | e.g., 2025                      |
| created_at  | timestamp      | Record creation                 |
| updated_at  | timestamp      | Record update                   |

---

## 4. Savings Goals Table

Tracks goals and progress.

| Column Name   | Type       | Description                               |
| ------------- | ---------- | ----------------------------------------- |
| id            | UUID / int | Primary key                               |
| user_id       | UUID / int | Foreign key → Users                       |
| name          | varchar    | Goal name (e.g., Vacation)                |
| target_amount | decimal    | Amount to save                            |
| saved_amount  | decimal    | Current saved amount                      |
| priority      | varchar    | Optional priority level {HIGH,MEDIUM,LOW} |
| due_date      | date       | Optional target date                      |
| created_at    | timestamp  | Record creation                           |
| updated_at    | timestamp  | Record update                             |

---

## 5. Reports Table (Optional)

Stores cached reports for faster PDF export or analytics.

| Column Name  | Type        | Description                        |
| ------------ | ----------- | ---------------------------------- |
| id           | UUID / int  | Primary key                        |
| user_id      | UUID / int  | Foreign key → Users                |
| report_type  | enum        | 'monthly', 'half_yearly', 'yearly' |
| period_start | date        | Start of report period             |
| period_end   | date        | End of report period               |
| data         | JSON / text | Precomputed report data            |
| created_at   | timestamp   | Record creation                    |

---

## Relationships

- **Users → Transactions** = 1:N
- **Users → Budgets** = 1:N
- **Users → Savings Goals** = 1:N
- **Savings Goals → Transactions** = 1:N
- **Users → Reports** = 1:N

---

# 🛠️ Personal Finance App - API Endpoints

This document lists all REST API endpoints for the Personal Finance App, organized by feature and phase.

---

## Phase 1: Core Features (MVP)

### 1️⃣ Income & Expense Tracking (Transactions)

**Base URL:** `/transactions`

All endpoints require **JWT authentication**.

| Endpoint                | Method | Request Body / Query                                                                                                                                                                                   |
| ----------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/transactions`         | POST   | `json {   "type": "income",   "category": "salary",   "amount": 2500.5,   "date": "2025-09-12T10:30:00Z",   "description": "Monthly salary",   "recurring": true,   "recurring_interval": "monthly" }` |
| `/transactions`         | GET    | Query Params: `type` (income/expense), `category`, `startDate` (ISO), `endDate` (ISO), `page` (number, default 1), `limit` (number, default 25)                                                        |
| `/transactions/:id`     | GET    | -                                                                                                                                                                                                      |
| `/transactions/:id`     | PATCH  | `json {   "amount": 3000,   "description": "Updated description" }`                                                                                                                                    |
| `/transactions/:id`     | DELETE | -                                                                                                                                                                                                      |
| `/transactions/summary` | GET    | Query Params: `startDate` (ISO), `endDate` (ISO)                                                                                                                                                       |

---

### DTOs Overview

### `CreateTransactionDto`

| Field              | Type                                       | Required | Notes                             |
| ------------------ | ------------------------------------------ | -------- | --------------------------------- |
| type               | enum (`income` / `expense`)                | ✅       | Transaction type                  |
| category           | enum                                       | ✅       | IncomeCategory or ExpenseCategory |
| amount             | number                                     | ✅       | Transaction amount                |
| date               | ISO string                                 | ✅       | Transaction date                  |
| description        | string                                     | ❌       | Optional notes                    |
| recurring          | boolean                                    | ❌       | Defaults to `false`               |
| recurring_interval | enum (`daily`,`weekly`,`monthly`,`yearly`) | ❌       | Required if `recurring=true`      |

### `FindTransactionsDto` (Query)

| Field     | Type       | Default | Optional | Notes                    |
| --------- | ---------- | ------- | -------- | ------------------------ |
| type      | enum       | -       | ✅       | Filter by income/expense |
| category  | string     | -       | ✅       | Filter by category       |
| startDate | ISO string | -       | ✅       | Filter from date         |
| endDate   | ISO string | -       | ✅       | Filter to date           |
| page      | number     | 1       | ✅       | Pagination page          |
| limit     | number     | 25      | ✅       | Items per page (max 100) |

---

### 2️⃣ Dashboard / Overview

**Base URL:** `/dashboard`

| Method | Endpoint                        | Description                                                                                    |
| ------ | ------------------------------- | ---------------------------------------------------------------------------------------------- |
| GET    | `/dashboard/overview`           | Returns summary: total income, total expenses, net savings, spending per category (for charts) |
|        |
| GET    | `/dashboard/monthly-comparison` | Compares current vs previous months                                                            |
| GET    | `/dashboard/alerts`             | Alerts for overspending or approaching budget limits                                           |

---

### 3️⃣ Budgeting

**Base URL:** `/budgets`

| Endpoint          | Method | Request Body / Query                                                                                                       |
| ----------------- | ------ | -------------------------------------------------------------------------------------------------------------------------- |
| `/budgets`        | POST   | `json {   "category": "Food",   "amount": 300.00,   "month": 9,   "year": 2025 }`                                          |
| `/budgets`        | GET    | Query Params: `category` (enum), `month` (1–12), `year` (number), `page` (number, default 1), `limit` (number, default 25) |
| `/budgets/:id`    | GET    | -                                                                                                                          |
| `/budgets/:id`    | PUT    | `json {   "category": "Entertainment",   "amount": 500.00,   "month": 10,   "year": 2025 }`                                |
| `/budgets/:id`    | DELETE | -                                                                                                                          |
| `/budgets/alerts` | GET    | Query Params: `threshold` (number, default 0.9 → 90%), `month` (1–12), `year` (number)                                     |

---

### DTOs Overview

### `CreateBudgetDto`

| Field    | Type                     | Required | Notes                              |
| -------- | ------------------------ | -------- | ---------------------------------- |
| category | enum (`ExpenseCategory`) | ✅       | Budget category (Food, Rent, etc.) |
| amount   | decimal (max 2 decimals) | ✅       | Budgeted amount                    |
| month    | number (1–12)            | ✅       | Budget month                       |
| year     | number (>=1900)          | ✅       | Budget year                        |

---

### `UpdateBudgetDto`

(Same fields as `CreateBudgetDto`, but all optional)

| Field    | Type                     | Required | Notes                     |
| -------- | ------------------------ | -------- | ------------------------- |
| category | enum (`ExpenseCategory`) | ❌       | Update category if needed |
| amount   | decimal                  | ❌       | Update amount             |
| month    | number (1–12)            | ❌       | Update month              |
| year     | number                   | ❌       | Update year               |

---

### `FindBudgetsDto` (Query)

| Field    | Type                     | Default | Optional | Notes                    |
| -------- | ------------------------ | ------- | -------- | ------------------------ |
| category | enum (`ExpenseCategory`) | -       | ✅       | Filter by category       |
| month    | number (1–12)            | -       | ✅       | Filter by month          |
| year     | number                   | -       | ✅       | Filter by year           |
| page     | number                   | 1       | ✅       | Pagination page          |
| limit    | number                   | 25      | ✅       | Items per page (max 100) |

---

### `BudgetAlertsDto` (Query)

| Field     | Type   | Default | Optional | Notes                                         |
| --------- | ------ | ------- | -------- | --------------------------------------------- |
| threshold | number | 0.9     | ✅       | Alert if spending ≥ threshold × budget amount |
| month     | number | -       | ✅       | Limit alerts to a specific month              |
| year      | number | -       | ✅       | Limit alerts to a specific year               |

---

## Phase 2: Savings & Goals

### 4️⃣ Savings Goals

# Savings Goals API

# Savings Goals API

**Base URL:** `/savings-goals`

| Method | Endpoint                 | Description                                                         | Example Payload                                                                                                                    |
| ------ | ------------------------ | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/savings-goals`         | List all savings goals                                              | -                                                                                                                                  |
| GET    | `/savings-goals/:id`     | Get details of a savings goal                                       | -                                                                                                                                  |
| POST   | `/savings-goals`         | Create a new savings goal                                           | `json { "name": "Vacation Fund", "target_amount": 2000.00, "saved_amount": 500.00, "priority": "HIGH", "due_date": "2025-12-31" }` |
| PUT    | `/savings-goals/:id`     | Update a savings goal (progress, target amount, priority, due date) | `json { "target_amount": 2500.00, "priority": "MEDIUM" }`                                                                          |
| DELETE | `/savings-goals/:id`     | Delete a savings goal                                               | -                                                                                                                                  |
| PATCH  | `/savings-goals/:id/add` | Add amount to current savings and create a transaction              | `json { "amount": 100.00 }`                                                                                                        |

---

## DTOs Overview

### `CreateSavingsGoalDto`

| Field         | Type   | Required | Notes                             |
| ------------- | ------ | -------- | --------------------------------- |
| name          | string | ✅       | Name of the savings goal          |
| target_amount | number | ✅       | Target amount to save             |
| saved_amount  | number | ❌       | Current saved amount (default 0)  |
| priority      | enum   | ❌       | HIGH, MEDIUM, or LOW              |
| due_date      | string | ❌       | ISO date string for goal deadline |

---

### `UpdateSavingsGoalDto`

(Same fields as `CreateSavingsGoalDto`, all optional)

| Field         | Type   | Required | Notes                       |
| ------------- | ------ | -------- | --------------------------- |
| name          | string | ❌       | Update goal name            |
| target_amount | number | ❌       | Update target amount        |
| saved_amount  | number | ❌       | Update current saved amount |
| priority      | enum   | ❌       | Update priority             |
| due_date      | string | ❌       | Update goal deadline        |

---

### `FindSavingsGoalsDto` (Query Parameters)

| Field    | Type   | Default | Optional | Notes                           |
| -------- | ------ | ------- | -------- | ------------------------------- |
| name     | string | -       | ✅       | Filter goals by name            |
| priority | enum   | -       | ✅       | Filter by HIGH, MEDIUM, or LOW  |
| month    | number | -       | ✅       | Filter by goal due month (1–12) |
| year     | number | -       | ✅       | Filter by goal due year         |
| page     | number | 1       | ✅       | Pagination page                 |
| limit    | number | 25      | ✅       | Items per page (max 100)        |

---

### `AddToSavingsDto` (Request Body for `PATCH /:id/add`)

| Field  | Type   | Required | Notes                         |
| ------ | ------ | -------- | ----------------------------- |
| amount | number | ✅       | Amount to add to saved_amount |

---

## Phase 3: Reports & Insights

### 5️⃣ Financial Insights & Reports

**Base URL:** `/reports`

| Method | Endpoint                   | Description                                          |
| ------ | -------------------------- | ---------------------------------------------------- |
| GET    | `/reports`                 | List all reports for the user                        |
| GET    | `/reports/:id`             | Get a single report                                  |
| POST   | `/reports`                 | Generate a new report (monthly, half-yearly, yearly) |
| DELETE | `/reports/:id`             | Delete a cached report                               |
| GET    | `/reports/export/:id`      | Export report as PDF/CSV                             |
| GET    | `/reports/top-categories`  | Return top 3 spending categories for awareness       |
| GET    | `/reports/category-charts` | Return category-based charts data (pie, bar)         |
