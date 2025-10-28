Perfect — your revised plan is already very strong architecturally.
Below is the **final, error-free version** of the **Multi-Entity Transaction System** refactor plan with consistent naming, relationships, and minor logical fixes to ensure it’s production-ready and TypeORM-compatible.

---

# ✅ Final Refactor Plan — Multi-Entity Transaction System (Stable)

This finalized schema eliminates remaining inconsistencies (e.g., mixed `ENUM` vs lookup references) and introduces clearly defined **foreign keys**, **timestamps**, and **indexing strategy** for efficient querying and role-based access.

---

## I. Core Relationship Model

| Entity           | Relationships                                       |
| :--------------- | :-------------------------------------------------- |
| **Users**        | Many ↔ Many with **Accounts** (via `user_accounts`) |
| **Accounts**     | 1 ↔ Many with **Transactions**                      |
| **Accounts**     | Many ↔ Many with **Users**                          |
| **AccountTypes** | 1 ↔ Many with **Accounts**                          |
| **UserRoles**    | 1 ↔ Many with **UserAccounts**                      |

---

## II. Lookup Tables

### 1. `account_types` 🏷️

Used instead of ENUMs for extensibility.

| Column Name     | Type                      | Key/Index    | Description                                   |
| --------------- | ------------------------- | ------------ | --------------------------------------------- |
| **id**          | `SERIAL`                  | Primary Key  | Unique ID                                     |
| **name**        | `VARCHAR(100)`            | Unique Index | Human-readable name (e.g. “Personal Account”) |
| **slug**        | `VARCHAR(50)`             | Unique Index | Internal code (e.g. `personal`, `business`)   |
| **is_group**    | `BOOLEAN DEFAULT FALSE`   |              | Marks shared/group accounts                   |
| **is_goal**     | `BOOLEAN DEFAULT FALSE`   |              | Marks savings goal accounts                   |
| **description** | `TEXT`                    |              | Optional description                          |
| **is_active**   | `BOOLEAN DEFAULT TRUE`    |              | Whether available for selection               |
| **created_at**  | `TIMESTAMP DEFAULT NOW()` |              | Creation time                                 |
| **updated_at**  | `TIMESTAMP DEFAULT NOW()` |              | Last updated time                             |

---

### 2. `user_roles` 🔑

Centralized table for permission definitions.

| Column Name     | Type                      | Key/Index    | Description                                     |
| --------------- | ------------------------- | ------------ | ----------------------------------------------- |
| **id**          | `SERIAL`                  | Primary Key  | Role ID                                         |
| **name**        | `VARCHAR(50)`             | Unique Index | Role name: 'owner', 'admin', 'editor', 'viewer' |
| **permissions** | `JSONB`                   |              | JSON map for granular permissions               |
| **description** | `TEXT`                    |              | Optional notes                                  |
| **created_at**  | `TIMESTAMP DEFAULT NOW()` |              | Creation timestamp                              |
| **updated_at**  | `TIMESTAMP DEFAULT NOW()` |              | Update timestamp                                |

---

## III. Core Tables

### 1. `accounts` 🏦

| Column Name         | Type                         | Key/Index               | Description                   |
| ------------------- | ---------------------------- | ----------------------- | ----------------------------- |
| **id**              | `SERIAL`                     | Primary Key             | Unique Account ID             |
| **account_type_id** | `INT`                        | FK → `account_types.id` | Type of account               |
| **owner_user_id**   | `INT`                        | FK → `users.id`         | Primary admin or creator      |
| **name**            | `VARCHAR(100)`               |                         | Account name                  |
| **description**     | `TEXT`                       |                         | Optional description          |
| **balance**         | `DECIMAL(18,2) DEFAULT 0.00` |                         | Tracked balance               |
| **currency_code**   | `VARCHAR(3)`                 | Index                   | ISO 4217 currency (e.g. USD)  |
| **status**          | `VARCHAR(20)`                | Index                   | 'active', 'dormant', 'closed' |
| **created_at**      | `TIMESTAMP DEFAULT NOW()`    |                         | Created date                  |
| **updated_at**      | `TIMESTAMP DEFAULT NOW()`    |                         | Last updated date             |

---

### 2. `user_accounts` 🤝

Pivot table connecting users with accounts and roles.

| Column Name             | Type                      | Key/Index              | Description        |
| ----------------------- | ------------------------- | ---------------------- | ------------------ |
| **user_id**             | `INT`                     | PK, FK → `users.id`    | Linked user        |
| **account_id**          | `INT`                     | PK, FK → `accounts.id` | Linked account     |
| **role_id**             | `INT`                     | FK → `user_roles.id`   | Permission role    |
| **assigned_by_user_id** | `INT`                     | FK → `users.id`        | Who granted access |
| **is_active**           | `BOOLEAN DEFAULT TRUE`    |                        | Role status        |
| **created_at**          | `TIMESTAMP DEFAULT NOW()` |                        | When assigned      |
| **updated_at**          | `TIMESTAMP DEFAULT NOW()` |                        | When last updated  |

✅ **Composite PK:** (`user_id`, `account_id`)

---

### 3. `transactions` 💸

| Column Name            | Type                      | Key/Index               | Description                             |
| ---------------------- | ------------------------- | ----------------------- | --------------------------------------- |
| **id**                 | `SERIAL`                  | Primary Key             | Transaction ID                          |
| **account_id**         | `INT`                     | FK → `accounts.id`      | Which account this affects              |
| **creator_user_id**    | `INT`                     | FK → `users.id`         | Who created it                          |
| **category_id**        | `INT`                     | FK → `categories.id`    | Optional category                       |
| **type**               | `VARCHAR(10)`             | Index                   | 'income' / 'expense'                    |
| **amount**             | `DECIMAL(18,2)`           |                         | Transaction amount                      |
| **currency_code**      | `VARCHAR(3)`              | FK → `currencies.code`  | ISO 4217 currency (e.g., USD, EUR, BDT) |
| **transaction_date**   | `DATE`                    | Index                   | For time-based summaries                |
| **description**        | `TEXT`                    |                         | Optional notes                          |
| **status**             | `VARCHAR(20)`             |                         | 'pending', 'cleared', 'void'            |
| **external_ref_id**    | `VARCHAR(100)`            | Index (unique nullable) | Bank or processor reference             |
| **recurring**          | `BOOLEAN DEFAULT FALSE`   |                         | Marks recurring payments                |
| **recurring_interval** | `VARCHAR(20)`             |                         | 'daily', 'weekly', 'monthly', 'yearly'  |
| **created_at**         | `TIMESTAMP DEFAULT NOW()` |                         | Created date                            |
| **updated_at**         | `TIMESTAMP DEFAULT NOW()` |                         | Last updated date                       |

---

## IV. Summary Tables (Aggregation by Account)

| Table                      | Change                 | Description                            |
| :------------------------- | :--------------------- | :------------------------------------- |
| `daily_summary`            | `user_id → account_id` | Aggregates daily by account            |
| `monthly_summary`          | `user_id → account_id` | Aggregates monthly by account          |
| `category_monthly_summary` | `user_id → account_id` | Aggregates category totals per account |

---

## V. Entity Relationships Diagram (Simplified)

```
Users ──┬───────────────┐
        │               │
        ▼               ▼
  UserAccounts       Accounts ─────── Transactions
        │                 ▲
        ▼                 │
     UserRoles        AccountTypes
```

---

## ✅ Notes

- All tables use `created_at` and `updated_at` timestamps for auditability.
- `account_types` and `user_roles` act as **lookup/metadata tables**, preventing hard-coded enums.
- Aggregations (`daily_summary`, etc.) now pivot on `account_id`, enabling shared and multi-user accounts.
- Ideal for future features like **family budgets**, **business workspaces**, and **AI analytics per account**.

---

Would you like me to provide the **TypeORM entity definitions** for all five key tables
(`AccountType`, `UserRole`, `Account`, `UserAccount`, `Transaction`) next?
They’ll be ready to drop directly into your Nest app.

Certainly! Here is the table converted to **Markdown** format:

| Column         | Type        | Key/Index | Description                             |
| :------------- | :---------- | :-------- | :-------------------------------------- |
| **code**       | VARCHAR(3)  | PK        | ISO 4217 code, e.g. 'USD', 'EUR'        |
| **name**       | VARCHAR(50) |           | Full currency name, e.g. 'US Dollar'    |
| **symbol**     | VARCHAR(5)  |           | Currency symbol, e.g. '$'               |
| **decimal**    | INT         |           | Number of decimal places (e.g. 2)       |
| **is_active**  | BOOLEAN     |           | Enable/disable for selection in the app |
| **created_at** | TIMESTAMP   |           | Creation timestamp                      |
| **updated_at** | TIMESTAMP   |           | Last updated timestamp                  |

---

Would you like me to convert this table into a different format, like **HTML** or a **SQL `CREATE TABLE`** statement?
