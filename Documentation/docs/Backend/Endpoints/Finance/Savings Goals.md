Here’s the structured API documentation for **Savings Goals**, following the same style as your Transactions, Dashboard, and Budgeting docs:

---

# Savings Goals API

**Base URL:** `/savings-goals`
All endpoints require **JWT authentication**.

---

## Endpoints

| Endpoint                 | Method | Description                                                            | Payload / Query DTO    |
| ------------------------ | ------ | ---------------------------------------------------------------------- | ---------------------- |
| `/savings-goals`         | GET    | List all savings goals                                                 | `FindSavingsGoalsDto`  |
| `/savings-goals/:id`     | GET    | Get details of a single savings goal                                   | -                      |
| `/savings-goals`         | POST   | Create a new savings goal                                              | `CreateSavingsGoalDto` |
| `/savings-goals/:id`     | PUT    | Update an existing savings goal (progress, target, priority, due date) | `UpdateSavingsGoalDto` |
| `/savings-goals/:id`     | DELETE | Delete a savings goal                                                  | -                      |
| `/savings-goals/:id/add` | PATCH  | Add amount to current savings and create a transaction                 | `AddToSavingsDto`      |

---

## DTOs

### CreateSavingsGoalDto

**Example JSON:**

```json
{
  "name": "Vacation Fund",
  "target_amount": 2000.0,
  "saved_amount": 500.0,
  "priority": "HIGH",
  "due_date": "2025-12-31"
}
```

| Field         | Type   | Required | Notes                             |
| ------------- | ------ | -------- | --------------------------------- |
| name          | string | ✅       | Name of the savings goal          |
| target_amount | number | ✅       | Target amount to save             |
| saved_amount  | number | ❌       | Current saved amount (default 0)  |
| priority      | enum   | ❌       | HIGH, MEDIUM, or LOW              |
| due_date      | string | ❌       | ISO date string for goal deadline |

---

### UpdateSavingsGoalDto

**Example JSON:**

```json
{
  "target_amount": 2500.0,
  "priority": "MEDIUM"
}
```

| Field         | Type   | Required | Notes                       |
| ------------- | ------ | -------- | --------------------------- |
| name          | string | ❌       | Update goal name            |
| target_amount | number | ❌       | Update target amount        |
| saved_amount  | number | ❌       | Update current saved amount |
| priority      | enum   | ❌       | Update priority             |
| due_date      | string | ❌       | Update goal deadline        |

---

### FindSavingsGoalsDto (Query)

**Example Query:**

```
GET /savings-goals?priority=HIGH&month=12&year=2025&page=1&limit=25
```

| Field    | Type   | Default | Optional | Notes                           |
| -------- | ------ | ------- | -------- | ------------------------------- |
| name     | string | -       | ✅       | Filter goals by name            |
| priority | enum   | -       | ✅       | Filter by HIGH, MEDIUM, or LOW  |
| month    | number | -       | ✅       | Filter by goal due month (1–12) |
| year     | number | -       | ✅       | Filter by goal due year         |
| page     | number | 1       | ✅       | Pagination page                 |
| limit    | number | 25      | ✅       | Items per page (max 100)        |

---

### AddToSavingsDto (PATCH `/savings-goals/:id/add`)

**Example JSON:**

```json
{
  "amount": 100.0
}
```

| Field  | Type   | Required | Notes                         |
| ------ | ------ | -------- | ----------------------------- |
| amount | number | ✅       | Amount to add to saved_amount |

---
