## Final Scalable Finance Database Schema Update 🚀

## Relationships (Final)

- **Users → Transactions** = 1:N
- **Users → Budgets** = 1:N
- **Users → Savings Goals** = 1:N
- **Users → Reports** = 1:N
- **Users → Categories** = 1:N (NEW/Updated)
- **Savings Goals → Transactions** = 1:N
- **Users → DailySummary** = 1:N
- **Users → MonthlySummary** = 1:N
- **Users → CategoryMonthlySummary** = 1:N
- **Categories → Transactions** = 1:N (NEW)
- **Categories → Budgets** = 1:N (NEW)

---

## Core Tables (Updated)

### NEW Table: `Categories` 🏷️

Stores all system and user-defined categories.

| Column Name  | Type             | Key/Index    | Description                                              |
| :----------- | :--------------- | :----------- | :------------------------------------------------------- |
| id           | `INT`            | Primary Key  |
| **user_id**  | `INT` (Nullable) | Index        | Foreign Key → Users (NULL for system/default categories) |
| name         | `VARCHAR(50)`    | Unique Index | Canonical/machine-readable name (e.g., 'food_groceries') |
| display_name | `VARCHAR(50)`    |              | User-friendly name (can be renamed by user)              |
| type         | `ENUM`           |              | `'income'` or `'expense'`                                |
| created_at   | `TIMESTAMP`      |              |                                                          |

---

### Transactions Table (Modified)

**`category` column is replaced with a Foreign Key.**

| Column Name        | Type             | Description                                    |
| :----------------- | :--------------- | :--------------------------------------------- |
| id                 | `INT`            | Primary key                                    |
| **user_id**        | `INT`            | Foreign key → Users                            |
| type               | `ENUM`           | `'income'` or `'expense'`                      |
| **category_id**    | `INT`            | **Foreign key → Categories (NEW)**             |
| amount             | `DECIMAL(18, 2)` | Transaction amount                             |
| **date**           | `DATE`           | **Recommended format: YYYY-MM-DD**             |
| description        | `TEXT`           | Optional notes                                 |
| recurring          | `BOOLEAN`        | True if recurring                              |
| recurring_interval | `ENUM`           | `'daily'`, `'weekly'`, `'monthly'`, `'yearly'` |
| created_at         | `TIMESTAMP`      | Record creation                                |
| updated_at         | `TIMESTAMP`      | Record update                                  |

---

### Budgets Table (Modified)

**`category` column is replaced with a Foreign Key.**

| Column Name     | Type             | Description                        |
| :-------------- | :--------------- | :--------------------------------- |
| id              | `INT`            | Primary key                        |
| **user_id**     | `INT`            | Foreign key → Users                |
| **category_id** | `INT`            | **Foreign key → Categories (NEW)** |
| amount          | `DECIMAL(18, 2)` | Budgeted amount                    |
| month           | `INT`            | 1–12                               |
| year            | `INT`            | e.g., 2025                         |
| created_at      | `TIMESTAMP`      | Record creation                    |
| updated_at      | `TIMESTAMP`      | Record update                      |

---

### Savings Goals Table (No Change)

| Column Name   | Type             | Description                                        |
| :------------ | :--------------- | :------------------------------------------------- |
| id            | `INT`            | Primary key                                        |
| **user_id**   | `INT`            | Foreign key → Users                                |
| target_amount | `DECIMAL(18, 2)` | Amount to save                                     |
| saved_amount  | `DECIMAL(18, 2)` | Current saved amount (Maintained by summary logic) |
| due_date      | `DATE`           | Optional target date (YYYY-MM-DD)                  |
| created_at    | `TIMESTAMP`      | Record creation                                    |

---

### Reports Table (No Change)

| Column Name  | Type             | Description                              |
| :----------- | :--------------- | :--------------------------------------- |
| id           | `INT`            | Primary key                              |
| **user_id**  | `INT`            | Foreign key → Users                      |
| report_type  | `ENUM`           | `'monthly'`, `'half_yearly'`, `'yearly'` |
| period_start | `DATE`           | Start of report period (YYYY-MM-DD)      |
| data         | `JSON` or `TEXT` | Precomputed report data                  |

---

## Materialized View / Summary Tables (Updated Keys)

### 1. `daily_summary` 🗓️

| Column Name   | Type             | Key/Index           | Description                                   |
| :------------ | :--------------- | :------------------ | :-------------------------------------------- |
| id            | `INT`            | Primary Key         |
| **user_id**   | `INT`            | **Composite Index** | Foreign Key → Users                           |
| **date**      | `DATE`           | **Composite Index** | The specific date of the summary (YYYY-MM-DD) |
| total_income  | `DECIMAL(18, 2)` |                     | Sum of all income transactions on this date   |
| total_expense | `DECIMAL(18, 2)` |                     | Sum of all expense transactions on this date  |

---

### 2. `monthly_summary` 💰

| Column Name   | Type             | Key/Index           | Description                 |
| :------------ | :--------------- | :------------------ | :-------------------------- |
| id            | `INT`            | Primary Key         |
| **user_id**   | `INT`            | **Composite Index** | Foreign Key → Users         |
| **year**      | `INT`            | **Composite Index** | The year (e.g., 2025)       |
| **month**     | `INT`            | **Composite Index** | The month (1–12)            |
| total_income  | `DECIMAL(18, 2)` |                     | Total income for the month  |
| total_expense | `DECIMAL(18, 2)` |                     | Total expense for the month |

---

### 3. `category_monthly_summary` 🏷️ (Modified)

**`category` column is replaced with a Foreign Key.**

| Column Name     | Type             | Key/Index           | Description                               |
| :-------------- | :--------------- | :------------------ | :---------------------------------------- |
| id              | `INT`            | Primary Key         |
| **user_id**     | `INT`            | **Composite Index** | Foreign Key → Users                       |
| **year**        | `INT`            | **Composite Index** | Transaction Year                          |
| **month**       | `INT`            | **Composite Index** | Transaction Month (1-12)                  |
| **category_id** | `INT`            | **Composite Index** | **Foreign Key → Categories (NEW)**        |
| **type**        | `ENUM`           | **Composite Index** | `'income'` or `'expense'`                 |
| total_amount    | `DECIMAL(18, 2)` |                     | Total amount for this category/month/type |
