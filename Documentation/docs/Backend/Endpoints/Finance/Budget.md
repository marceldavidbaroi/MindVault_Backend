Here’s the structured API documentation for **Budgeting**, following the same style as your Transactions and Dashboard docs:

---

# Budgeting

**Base URL:** `/budgets`
All endpoints require **JWT authentication**.

---

## Endpoints

| Endpoint          | Method | Description                                               | Payload / Query DTO |
| ----------------- | ------ | --------------------------------------------------------- | ------------------- |
| `/budgets`        | POST   | Create a new budget                                       | `CreateBudgetDto`   |
| `/budgets`        | GET    | List budgets with optional filters                        | `FindBudgetsDto`    |
| `/budgets/:id`    | GET    | Get a single budget by ID                                 | -                   |
| `/budgets/:id`    | PUT    | Update an existing budget                                 | `UpdateBudgetDto`   |
| `/budgets/:id`    | DELETE | Delete a budget                                           | -                   |
| `/budgets/alerts` | GET    | Get alerts for budgets where spending exceeds a threshold | `BudgetAlertsDto`   |

---

## DTOs

### CreateBudgetDto

**Example JSON:**

```json
{
  "category": "Food",
  "amount": 300.0,
  "month": 9,
  "year": 2025
}
```

| Field    | Type                     | Required | Notes                              |
| -------- | ------------------------ | -------- | ---------------------------------- |
| category | enum (`ExpenseCategory`) | ✅       | Budget category (Food, Rent, etc.) |
| amount   | decimal (max 2 decimals) | ✅       | Budgeted amount                    |
| month    | number (1–12)            | ✅       | Budget month                       |
| year     | number (>=1900)          | ✅       | Budget year                        |

---

### UpdateBudgetDto

**Example JSON:**

```json
{
  "category": "Entertainment",
  "amount": 500.0,
  "month": 10,
  "year": 2025
}
```

| Field    | Type                     | Required | Notes                     |
| -------- | ------------------------ | -------- | ------------------------- |
| category | enum (`ExpenseCategory`) | ❌       | Update category if needed |
| amount   | decimal                  | ❌       | Update amount             |
| month    | number (1–12)            | ❌       | Update month              |
| year     | number                   | ❌       | Update year               |

---

### FindBudgetsDto (Query)

**Example Query:**

```
GET /budgets?category=Food&month=9&year=2025&page=1&limit=25
```

| Field    | Type                     | Default | Optional | Notes                    |
| -------- | ------------------------ | ------- | -------- | ------------------------ |
| category | enum (`ExpenseCategory`) | -       | ✅       | Filter by category       |
| month    | number (1–12)            | -       | ✅       | Filter by month          |
| year     | number                   | -       | ✅       | Filter by year           |
| page     | number                   | 1       | ✅       | Pagination page          |
| limit    | number                   | 25      | ✅       | Items per page (max 100) |

---

### BudgetAlertsDto (Query)

**Example Query:**

```
GET /budgets/alerts?threshold=0.9&month=9&year=2025
```

| Field     | Type   | Default | Optional | Notes                                         |
| --------- | ------ | ------- | -------- | --------------------------------------------- |
| threshold | number | 0.9     | ✅       | Alert if spending ≥ threshold × budget amount |
| month     | number | -       | ✅       | Limit alerts to a specific month              |
| year      | number | -       | ✅       | Limit alerts to a specific year               |

---
