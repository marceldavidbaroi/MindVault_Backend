Here’s the **updated Transactions API documentation** including the new **bulk endpoint** and keeping the same style as before:

---

# Transactions

**Base URL:** `/transactions`
All endpoints require **JWT authentication**.

---

## Endpoints

| Endpoint                | Method | Description                          | Payload / Query DTO      |
| :---------------------- | :----- | :----------------------------------- | :----------------------- |
| `/transactions`         | POST   | Create a new transaction             | `CreateTransactionDto`   |
| `/transactions/bulk`    | POST   | Create multiple transactions at once | `BulkTransactionDto`     |
| `/transactions`         | GET    | List transactions with filters       | `FindTransactionsDto`    |
| `/transactions/:id`     | GET    | Get a single transaction by ID       | -                        |
| `/transactions/:id`     | PATCH  | Update an existing transaction       | `UpdateTransactionDto`   |
| `/transactions/:id`     | DELETE | Delete a transaction                 | -                        |
| `/transactions/summary` | GET    | Get summary of transactions          | `TransactionsSummaryDto` |

---

## DTOs

### CreateTransactionDto

**Example JSON:**

```json
{
  "type": "income",
  "category": "salary",
  "amount": 2500.5,
  "date": "2025-09-12T10:30:00Z",
  "description": "Monthly salary",
  "recurring": true,
  "recurring_interval": "monthly"
}
```

| Field              | Type                                       | Required | Notes                             |
| :----------------- | :----------------------------------------- | :------- | :-------------------------------- |
| type               | enum (`income` / `expense`)                | ✅       | Transaction type                  |
| category           | enum                                       | ✅       | IncomeCategory or ExpenseCategory |
| amount             | number                                     | ✅       | Transaction amount                |
| date               | ISO string                                 | ✅       | Transaction date                  |
| description        | string                                     | ❌       | Optional notes                    |
| recurring          | boolean                                    | ❌       | Defaults to `false`               |
| recurring_interval | enum (`daily`,`weekly`,`monthly`,`yearly`) | ❌       | Required if `recurring=true`      |

---

### BulkTransactionDto

**Example JSON:**

```json
{
  "date": "2025-09-12T10:30:00Z",
  "type": "expense",
  "transactions": [
    { "category": "food", "amount": 50.0 },
    { "category": "transport", "amount": 20.0 }
  ]
}
```

| Field        | Type                          | Required | Notes                           |
| ------------ | ----------------------------- | -------- | ------------------------------- |
| date         | ISO string                    | ✅       | Date for all transactions       |
| type         | enum (`income` / `expense`)   | ✅       | Transaction type for all items  |
| transactions | array of `TransactionItemDto` | ✅       | List of individual transactions |

**TransactionItemDto fields:**

| Field    | Type   | Required | Notes                   |
| -------- | ------ | -------- | ----------------------- |
| category | string | ✅       | Category name           |
| amount   | number | ✅       | Transaction amount (≥0) |

---

### FindTransactionsDto (Query)

**Example Query:**

```
GET /transactions?type=income&category=salary&startDate=2025-01-01&endDate=2025-12-31&page=1&limit=25
```

| Field     | Type       | Default | Optional | Notes                    |
| :-------- | :--------- | :------ | :------- | :----------------------- |
| type      | enum       | -       | ✅       | Filter by income/expense |
| category  | string     | -       | ✅       | Filter by category       |
| startDate | ISO string | -       | ✅       | Filter from date         |
| endDate   | ISO string | -       | ✅       | Filter to date           |
| page      | number     | 1       | ✅       | Pagination page          |
| limit     | number     | 25      | ✅       | Items per page (max 100) |

---

### UpdateTransactionDto

**Example JSON:**

```json
{
  "amount": 3000,
  "description": "Updated description"
}
```

| Field              | Type                                       | Required | Notes                        |
| :----------------- | :----------------------------------------- | :------- | :--------------------------- |
| amount             | number                                     | ❌       | Updated transaction amount   |
| description        | string                                     | ❌       | Updated description          |
| category           | enum                                       | ❌       | Updated category             |
| recurring          | boolean                                    | ❌       | Update recurring flag        |
| recurring_interval | enum (`daily`,`weekly`,`monthly`,`yearly`) | ❌       | Required if `recurring=true` |

---
